import express from "express";
import crypto from "node:crypto";
import { saveDesign, loadDesign, markDone, isDone } from "./store.js";
import { renderDesign, checkDesign } from "./render.js";
import { shopifyReady, uploadPdf, attachToOrder, flagOrder } from "./shopify.js";

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);   // e.g. https://www.beaubottles.com
const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || "";
const ADMIN_KEY = process.env.ADMIN_KEY || "";                // protects the test links below
const DESIGN_PROP = process.env.DESIGN_PROPERTY || "_design_id";

app.get("/health", (req, res) => res.json({ ok: true, shopify: shopifyReady() }));

// ---------- 1. the storefront saves a design when the customer adds to cart ----------
function cors(req, res, next) {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin))) {
    res.set({ "Access-Control-Allow-Origin": origin, "Vary": "Origin", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" });
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
}
app.options("/designs", cors);
app.post("/designs", cors, express.json({ limit: "25mb" }), async (req, res) => {
  try {
    const design = req.body;
    if (!design || design.v !== 1 || !design.size || !design.tpl) return res.status(400).json({ error: "That does not look like a label design." });
    const check = await checkDesign(design);                     // the designer's own checks, run on our side
    if (check.problem) return res.status(422).json({ error: check.problem });
    const id = await saveDesign(design);
    res.json({ id, summary: check.summary });
  } catch (err) {
    console.error("save design failed", err);
    res.status(500).json({ error: "We could not save your design. Please try again." });
  }
});

// ---------- 2. Shopify tells us an order was paid ----------
app.post("/webhooks/orders-paid", express.raw({ type: "*/*", limit: "5mb" }), async (req, res) => {
  const sent = req.get("X-Shopify-Hmac-Sha256") || "";
  const ours = crypto.createHmac("sha256", WEBHOOK_SECRET).update(req.body).digest("base64");
  const ok = WEBHOOK_SECRET && sent.length === ours.length && crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(ours));
  if (!ok) { console.warn("order notice refused: the signature did not match SHOPIFY_WEBHOOK_SECRET"); return res.sendStatus(401); }
  res.sendStatus(200);                                           // answer Shopify quickly, then do the work
  let order;
  try { order = JSON.parse(req.body.toString("utf8")); } catch { return; }
  handlePaidOrder(order).catch(err => console.error("order " + order?.id + " failed", err));
});

async function handlePaidOrder(order) {
  const lines = (order.line_items || []).map(li => ({ li, designId: (li.properties || []).find(p => p.name === DESIGN_PROP)?.value })).filter(x => x.designId);
  console.log(`order notice accepted: ${order.name || order.id || "(test)"}, ${lines.length} label line(s)`);
  if (!lines.length) return;
  const orderGid = order.admin_graphql_api_id;
  const files = [];
  for (const { li, designId } of lines) {
    const key = `${order.id}_${li.id}`;
    if (await isDone(key)) continue;                             // Shopify can send the same notice more than once
    try {
      const design = await loadDesign(designId);
      if (!design) throw new Error(`Design ${designId} was not found.`);
      design.qty = li.quantity || design.qty;                    // the cart quantity is the number of sheets
      const out = await renderDesign(design);
      if (out.problem) throw new Error(out.problem);
      const name = `labels-${String(order.name || order.id).replace(/[^a-zA-Z0-9]/g, "")}-${li.id}.pdf`;
      const url = await uploadPdf(name, out.pdf);
      files.push({ title: li.variant_title || li.title, url, pages: out.pages, copies: out.copies, lineItemId: li.id, designId });
      await markDone(key, designId);
    } catch (err) {
      console.error("line " + li.id + " failed", err);
      await flagOrder(orderGid, `${li.title}: ${err.message}`, order.note || "").catch(() => {});
    }
  }
  if (files.length) { await attachToOrder(orderGid, files, order.note || ""); console.log(`order ${order.name || order.id}: ${files.length} PDF(s) attached`); }
}

// ---------- 3. test links (need ADMIN_KEY) ----------
const admin = (req, res, next) => (ADMIN_KEY && req.query.key === ADMIN_KEY) ? next() : res.sendStatus(404);
app.get("/designs/:id.pdf", admin, async (req, res) => {
  const design = await loadDesign(req.params.id);
  if (!design) return res.sendStatus(404);
  if (req.query.qty) design.qty = Math.max(1, Math.min(10, +req.query.qty || 1));
  const out = await renderDesign(design);
  res.set({ "Content-Type": "application/pdf", "X-Pages": out.pages, "X-Copies": out.copies }).send(out.pdf);
});
app.post("/render", admin, express.json({ limit: "25mb" }), async (req, res) => {
  const out = await renderDesign(req.body);
  res.set({ "Content-Type": "application/pdf", "X-Pages": out.pages, "X-Copies": out.copies }).send(out.pdf);
});

app.listen(PORT, () => console.log(`label print service listening on ${PORT}`));
