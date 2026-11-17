import express from "express";
import crypto from "node:crypto";
import { saveDesign, loadDesign, markDone, isDone, saveTodo, clearTodo, listTodos, debugState } from "./store.js";
import { renderDesign, checkDesign, warmUp } from "./render.js";
import { shopifyReady, uploadPdf, attachToOrder, flagOrder } from "./shopify.js";

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);   // e.g. https://www.beaubottles.com
const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || "";
const ADMIN_KEY = process.env.ADMIN_KEY || "";                // protects the test links below
const DESIGN_PROP = process.env.DESIGN_PROPERTY || "_design_id";

app.get("/health", (req, res) => { warmUp(); res.json({ ok: true, shopify: shopifyReady() }); });

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
  let order;
  try { order = JSON.parse(req.body.toString("utf8")); } catch { return res.sendStatus(200); }   // not an order: nothing to do
  // Shopify never retries once we answer 200, so the notice is saved to disk FIRST. If the
  // instance dies mid-render, the next boot finds the saved notice and finishes the job.
  try { await saveTodo(order.id, { tries: 0, order }); } catch (err) { console.error("could not save order notice", err); }
  res.sendStatus(200);                                           // answer Shopify quickly, then do the work
  handlePaidOrder(order)
    .then(() => clearTodo(order.id))                             // kept on failure: the next boot retries it
    .catch(err => console.error("order " + order?.id + " failed", err));
});

// Finish any order a crash or restart interrupted. Runs once, shortly after boot. A job that has
// already killed the instance twice is not tried a third time — it is flagged on the order and
// cleared, so one impossible render can never hold the service in a crash loop.
setTimeout(async () => {
  const todos = await listTodos();
  if (!todos.length) return;
  console.log(`resuming ${todos.length} interrupted order notice(s)`);
  for (const t of todos) {
    const order = t.order || t, tries = t.tries || 0;            // t.order since the tries counter; bare order before it
    if (tries >= 2) {
      console.error(`order ${order.name || order.id}: gave up after ${tries} interrupted attempts`);
      await flagOrder(order.admin_graphql_api_id, "The print file could not be made here (the attempt was interrupted twice — likely out of memory; render it with the admin link or on a larger instance).", order.note || "").catch(() => {});
      await clearTodo(order.id); continue;
    }
    await saveTodo(order.id, { tries: tries + 1, order }).catch(() => {});   // counted BEFORE the attempt, so a crash still counts
    try { await handlePaidOrder(order); await clearTodo(order.id); console.log(`order ${order.name || order.id}: resumed and finished`); }
    catch (err) { console.error(`order ${order.name || order.id}: resume failed`, err); }
  }
}, 15000);

async function handlePaidOrder(order) {
  // The same endpoint now takes orders/create AND orders/paid: a $0 order (100% discount) has no
  // payment transaction, so orders/paid never fires for it — but it is born paid, so the creation
  // notice carries financial_status "paid". An order not yet paid at creation is skipped here and
  // handled when its orders/paid notice arrives; lines are deduped, so hearing twice is harmless.
  if (order.financial_status && order.financial_status !== "paid") {
    console.log(`order notice for ${order.name || order.id}: financial_status "${order.financial_status}" — waiting for payment`);
    return;
  }
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
// Express 4 does not catch an async route's rejection — it becomes an unhandled rejection and
// kills the process (Render then serves a bare 502 and the real error is never seen). Every
// async route goes through this wrapper, so a failure answers 500 with its message instead.
const safe = fn => (req, res) => fn(req, res).catch(err => {
  console.error(req.method + " " + req.path + " failed", err);
  if (!res.headersSent) res.status(500).json({ error: String(err && err.message || err) });
});
app.get("/state", admin, safe(async (req, res) => res.json(await debugState())));   // which notices arrived, which lines finished
app.get("/designs/:id.json", admin, safe(async (req, res) => {   // rescue hatch: pull a design to render elsewhere
  const design = await loadDesign(req.params.id);
  if (!design) return res.sendStatus(404);
  res.json(design);
}));
app.get("/designs/:id.pdf", admin, safe(async (req, res) => {
  const design = await loadDesign(req.params.id);
  if (!design) return res.sendStatus(404);
  if (req.query.qty) design.qty = Math.max(1, Math.min(10, +req.query.qty || 1));
  const out = await renderDesign(design);
  res.set({ "Content-Type": "application/pdf", "X-Pages": out.pages, "X-Copies": out.copies }).send(out.pdf);
}));
app.post("/render", admin, express.json({ limit: "25mb" }), safe(async (req, res) => {
  const out = await renderDesign(req.body);
  res.set({ "Content-Type": "application/pdf", "X-Pages": out.pages, "X-Copies": out.copies }).send(out.pdf);
}));

// Last-resort guards: log instead of dying, so one bad request can never take the service down.
process.on("unhandledRejection", err => console.error("unhandled rejection", err));
process.on("uncaughtException", err => console.error("uncaught exception", err));

app.listen(PORT, () => console.log(`label print service listening on ${PORT}`));
