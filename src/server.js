import express from "express";
import crypto from "node:crypto";
import { saveDesign, loadDesign, markDone, isDone, saveTodo, clearTodo, listTodos, debugState, queueSingle, listSingles, clearSingles, listDone, clearDone } from "./store.js";
import { renderDesign, renderGang, checkDesign, warmUp } from "./render.js";
import { shopifyReady, uploadPdf, attachToOrder, flagOrder, appInfo, fetchOrder } from "./shopify.js";

const app = express();
const PORT = process.env.PORT || 3000;

// The last few hundred console lines, readable remotely (admin /log): Render's log screen is not
// always at hand, and every mystery so far has come down to one console line nobody could see.
const LOG = [];
for (const level of ["log", "warn", "error"]) {
  const orig = console[level].bind(console);
  console[level] = (...a) => {
    try {
      LOG.push(new Date().toISOString() + " " + level + " " + a.map(x => typeof x === "string" ? x : (x && x.stack) || JSON.stringify(x)).join(" "));
      if (LOG.length > 300) LOG.splice(0, LOG.length - 300);
    } catch {}
    orig(...a);
  };
}
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
  withOrderLock(order.id, () => handlePaidOrder(order))
    .then(() => clearTodo(order.id))                             // kept on failure: the sweep below retries it
    .catch(err => console.error("order " + order?.id + " failed", err));
});

// Finish any order a crash, restart, or failed line left behind. Sweeps shortly after boot and
// then every ten minutes, so a render that failed under load (#70046's protocol timeout) is
// tried again without waiting for a redeploy. A job that has already failed twice is not tried
// a third time — it is flagged on the order and cleared, so one impossible render can never
// hold the service in a crash loop.
let sweeping = false;
async function sweepTodos() {
  if (sweeping) return;
  sweeping = true;
  try {
    const todos = await listTodos();
    if (!todos.length) return;
    console.log(`resuming ${todos.length} interrupted order notice(s)`);
    for (const t of todos) {
      const order = t.order || t, tries = t.tries || 0;          // t.order since the tries counter; bare order before it
      if (tries >= 2) {
        console.error(`order ${order.name || order.id}: gave up after ${tries} interrupted attempts`);
        await flagOrder(order.admin_graphql_api_id, "The print file could not be made here (the attempt failed twice — render it with the admin link, or check /log).", order.note || "").catch(() => {});
        await clearTodo(order.id); continue;
      }
      await saveTodo(order.id, { tries: tries + 1, order }).catch(() => {});   // counted BEFORE the attempt, so a crash still counts
      try { await withOrderLock(order.id, () => handlePaidOrder(order)); await clearTodo(order.id); console.log(`order ${order.name || order.id}: resumed and finished`); }
      catch (err) { console.error(`order ${order.name || order.id}: resume failed`, err); }
    }
  } finally { sweeping = false; }
}
setTimeout(sweepTodos, 15000);
setInterval(sweepTodos, 600000);

// One order at a time, per order: the creation and payment notices for the same order land
// within a second of each other, and running them side by side split an order's lines between
// two attach passes that then overwrote each other's links (#70023). The second delivery now
// waits its turn, finds every line already marked done, and attaches nothing.
const orderChains = new Map();   // order id -> tail of that order's work
function withOrderLock(id, fn) {
  const job = (orderChains.get(id) || Promise.resolve()).then(fn, fn);
  let tail;
  tail = job.catch(() => {}).then(() => { if (orderChains.get(id) === tail) orderChains.delete(id); });
  orderChains.set(id, tail);
  return job;
}

const inFlight = new Set();   // lines being worked on right now, so twin deliveries never double-print
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
  const files = [], failed = [];
  for (const { li, designId } of lines) {
    const key = `${order.id}_${li.id}`;
    if (await isDone(key)) continue;                             // Shopify can send the same notice more than once
    if (inFlight.has(key)) continue;                             // …or twice at once (creation + payment land together)
    inFlight.add(key);
    try {
      const design = await loadDesign(designId);
      if (!design) throw new Error(`Design ${designId} was not found.`);
      if (!design.single) design.qty = li.quantity || design.qty;   // the cart quantity is the number of sheets; single labels carry their own count
      const out = await renderDesign(design, { tag: design.single ? `Order ${order.name || order.id}` : "" });
      if (out.problem) throw new Error(out.problem);
      // Single labels also join the batch queue, so they can be printed with other orders' singles on
      // shared sheets. Queued as soon as the render is good (not after the upload): an upload hiccup
      // then flags the order but never keeps the label out of the day's print run; the queue and
      // markDone both dedupe by line key, so a retried upload cannot queue it twice.
      if (design.single) await queueSingle({ key, designId, size: design.size, count: design.single, times: li.quantity || 1, order: String(order.name || order.id) });
      const name = `labels-${String(order.name || order.id).replace(/[^a-zA-Z0-9]/g, "")}-${li.id}.pdf`;
      const url = await uploadPdf(name, out.pdf);
      files.push({ title: li.variant_title || li.title, url, pages: out.pages, copies: out.copies, lineItemId: li.id, designId });
      await markDone(key, designId);
    } catch (err) {
      console.error("line " + li.id + " failed", err);
      failed.push(li.title);
      await flagOrder(orderGid, `${li.title}: ${err.message}`, order.note || "").catch(() => {});
    } finally { inFlight.delete(key); }
  }
  if (files.length) { await attachToOrder(orderGid, files, order.note || ""); console.log(`order ${order.name || order.id}: ${files.length} PDF(s) attached`); }
  // A failed line keeps the saved notice alive, so the ten-minute sweep tries the order again.
  // Finished lines are marked done, so only the failed ones are redone.
  if (failed.length) throw new Error(`${failed.length} label line(s) not finished: ${failed.join("; ")}`);
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
app.get("/whoami", admin, safe(async (req, res) => res.json(await appInfo())));   // which app + which scopes the live token has
app.get("/redo/:orderId", admin, safe(async (req, res) => {      // forget an order's done-marks so its next notice reprocesses
  // ?lines=a,b clears only those line items — so sheets can be re-rendered without touching a
  // singles line, whose re-run would put an already-printed label back on the batch queue.
  const { promises: fs } = await import("node:fs");
  const path = (await import("node:path")).default;
  const DIR = process.env.DATA_DIR || path.resolve("data");
  const only = String(req.query.lines || "").split(",").filter(Boolean);
  const prefix = "done_" + req.params.orderId.replace(/[^0-9]/g, "") + "_";
  let n = 0;
  for (const f of await fs.readdir(DIR)) {
    if (!f.startsWith(prefix)) continue;
    if (only.length && !only.includes(f.slice(prefix.length).replace(/\.json$/, ""))) continue;
    await fs.unlink(path.join(DIR, f)); n++;
  }
  res.json({ cleared: n });
}));
// Re-renders an order's FULL-SHEET lines with the current renderer and swaps the PDFs attached
// to the Shopify order (attachToOrder replaces by line and scrubs the old note links). Singles
// lines are left alone: they print live from /batch (always current) and re-running one would
// put an already-printed label back on the batch queue. /rebake/70232 → that order, fresh.
app.get("/rebake/:name", admin, safe(async (req, res) => {
  const order = await fetchOrder(req.params.name);
  if (!order) return res.status(404).json({ error: "No order " + req.params.name + " found." });
  const lines = order.line_items.map(li => ({ li, designId: (li.properties || []).find(p => p.name === DESIGN_PROP)?.value })).filter(x => x.designId);
  const redone = [];
  for (const { li, designId } of lines) {
    const d = await loadDesign(designId);
    if (!d || d.single) continue;
    await clearDone(`${order.id}_${li.id}`);
    redone.push(li.title);
  }
  if (!redone.length) return res.json({ order: order.name, rebaked: [], note: "No full-sheet label lines to re-render (singles always print fresh from /batch)." });
  await withOrderLock(order.id, () => handlePaidOrder(order));
  res.json({ order: order.name, rebaked: redone, note: "Fresh PDFs are attached to the order; the old links were replaced." });
}));
app.get("/log", admin, (req, res) => res.type("text/plain").send(LOG.join("\n") || "(empty since boot)"));
app.get("/designs/:id.json", admin, safe(async (req, res) => {   // rescue hatch: pull a design to render elsewhere
  const design = await loadDesign(req.params.id);
  if (!design) return res.sendStatus(404);
  res.json(design);
}));
// ?dx=&dy= (millimeters, −10..10): nudges the whole print on the page, to calibrate out the
// printer's mechanical feed offset on label stock. Positive dx moves right, positive dy down.
const nudge = q => ({ dx: Math.max(-10, Math.min(10, parseFloat(q.dx) || 0)), dy: Math.max(-10, Math.min(10, parseFloat(q.dy) || 0)) });
app.get("/designs/:id.pdf", admin, safe(async (req, res) => {
  const design = await loadDesign(req.params.id);
  if (!design) return res.sendStatus(404);
  if (req.query.qty) design.qty = Math.max(1, Math.min(10, +req.query.qty || 1));
  const out = await renderDesign(design, nudge(req.query));
  res.set({ "Content-Type": "application/pdf", "X-Pages": out.pages, "X-Copies": out.copies }).send(out.pdf);
}));
app.post("/render", admin, express.json({ limit: "25mb" }), safe(async (req, res) => {
  const out = await renderDesign(req.body, nudge(req.query));
  res.set({ "Content-Type": "application/pdf", "X-Pages": out.pages, "X-Copies": out.copies }).send(out.pdf);
}));

// A reprint needs a LIVE render link (the PDFs attached to Shopify orders are files baked at
// order time — a nudge or any later fix never reaches them). This page lists the finished
// order lines with their wording, so staff can find an order and print it fresh, nudged.
app.get("/reprint", admin, safe(async (req, res) => {
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const key = encodeURIComponent(req.query.key), off = nudge(req.query);
  const qty = req.query.qty ? Math.max(1, Math.min(10, +req.query.qty || 1)) : 0;
  const rows = [];
  for (const e of await listDone(25)) {
    const d = await loadDesign(e.designId); if (!d) continue;
    const s = d.summary || {};
    const what = [s.Design, s.Label || s.Labels, s["Added line"] || s.Names].filter(Boolean).join(" · ");
    const extra = (off.dx || off.dy ? `&dx=${off.dx}&dy=${off.dy}` : "") + (qty && !d.single ? `&qty=${qty}` : "");
    rows.push(`<section><strong>${esc(what || e.designId)}</strong><br><small>${esc(s.Bottle || "")}${d.single ? " · single labels" : " · full sheets"} · finished ${esc((e.at || "").slice(0, 10))}</small><br>
      <a class="b" target="_blank" rel="noopener" href="/designs/${esc(e.designId)}.pdf?key=${key}${extra}">Print PDF${off.dx || off.dy ? ` (nudged ${off.dx}/${off.dy} mm)` : ""}</a></section>`);
  }
  res.send(page(`<h1>Reprint an order</h1><p>Newest first, last 25 finished lines. Set a nudge and every link below carries it: positive moves the print right/down, in millimeters.</p>
    <form method="get"><input type="hidden" name="key" value="${esc(req.query.key)}">
      dx <input name="dx" type="number" step="0.5" min="-10" max="10" value="${off.dx}" style="width:5em"> mm &nbsp;
      dy <input name="dy" type="number" step="0.5" min="-10" max="10" value="${off.dy}" style="width:5em"> mm &nbsp;
      sheets <input name="qty" type="number" min="1" max="10" value="${qty || ""}" style="width:4em"> &nbsp;<button>Apply</button></form>${rows.join("")}`));
}));

// ---------- 4. single labels, printed together (needs ADMIN_KEY) ----------
// Open /batch?key=... once or twice a day: it lists the single labels waiting for each bottle size,
// gives one PDF per size with a pick list, and a button to clear them once printed.
const SIZE_NAMES = { champagne: "Champagne", prosecco: "Prosecco", mini: "Mini" };
const page = body => `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Single labels to print</title>
<style>body{font:16px/1.5 system-ui,sans-serif;max-width:640px;margin:32px auto;padding:0 16px;color:#1b2440}h1{font-size:22px}section{border:1px solid #ddd;padding:16px;margin:16px 0}a.b,button{display:inline-block;font:inherit;padding:10px 16px;border:1px solid #1b2440;background:#1b2440;color:#fff;text-decoration:none;cursor:pointer;margin:6px 8px 0 0}button{background:#fff;color:#1b2440}small{color:#555}</style>${body}`;
// Customer-photo labels print brighter (the printer darkens photos on this stock), and that
// brightness boost washes out ordinary artwork — so photo designs always get their own PDF.
// A design counts as photo when a photo was uploaded AND the template actually prints it
// (every photo template id contains "photo": photo1..4, xm-tartan-photo, xm-ribbon-photo).
// A misfiled sheet is visible at the printer: photo items say "PHOTO" on the backing.
const isPhotoDesign = d => !!(d && d.photo && /photo/.test(String(d.tpl)));
app.get("/batch", admin, safe(async (req, res) => {
  const key = encodeURIComponent(req.query.key), all = await listSingles(), parts = [];
  for (const size of Object.keys(SIZE_NAMES)) {
    const q = all.filter(e => e.size === size);
    if (!q.length) { parts.push(`<section><strong>${SIZE_NAMES[size]}</strong><br><small>Nothing waiting.</small></section>`); continue; }
    const upto = q.reduce((a, e) => e.at > a ? e.at : a, ""), items = await batchItems(size, upto);
    const n = g => items.filter(i => i.photo === g).reduce((a, i) => a + i.count, 0), nPhoto = n(true), nPlain = n(false);
    const href = group => `/batch/${size}.pdf?key=${key}&upto=${encodeURIComponent(upto)}&group=${group}`;
    const links = (nPlain && nPhoto)
      ? `<a class="b" target="_blank" rel="noopener" href="${href("plain")}">Standard PDF (${nPlain})</a>
         <a class="b" target="_blank" rel="noopener" href="${href("photo")}">Photo PDF (${nPhoto}) — brightness boost</a>`
      : `<a class="b" target="_blank" rel="noopener" href="${href(nPhoto ? "photo" : "plain")}">Open the PDF${nPhoto ? " — photos, print with brightness boost" : ""}</a>`;
    parts.push(`<section><strong>${SIZE_NAMES[size]}</strong>: ${nPlain + nPhoto} label${nPlain + nPhoto === 1 ? "" : "s"} from ${q.length} order line${q.length === 1 ? "" : "s"}<br><small>${q.map(e => e.order).join(", ")}</small><br>
      ${links}
      <form method="post" action="/batch/${size}/done?key=${key}&upto=${encodeURIComponent(upto)}" style="display:inline"><button>Printed${nPlain && nPhoto ? " both" : ""}: clear these</button></form></section>`);
  }
  res.send(page(`<h1>Single labels to print</h1><p>Each PDF holds the waiting labels for that bottle size. Labels with customer photos come as their own PDF — print those with the brightness boost, and the standard PDF with normal settings. Every page is a plain US Letter sheet of four quarter-sheet pieces, each with its order number printed on the backing — print at 100%, then the Cricut file cuts the labels and quarters the sheet.</p>${parts.join("")}`));
}));
async function batchItems(size, upto) {
  const q = (await listSingles(size)).filter(e => !upto || e.at <= upto), items = [];
  for (const e of q) {
    const design = await loadDesign(e.designId); if (!design) continue;
    const photo = isPhotoDesign(design);
    for (let i = 0; i < e.times; i++) items.push({ design, photo, count: e.count, tag: `Order ${e.order} · ${e.count} label${e.count === 1 ? "" : "s"}${e.times > 1 ? ` (set ${i + 1} of ${e.times})` : ""}${photo ? " · PHOTO" : ""}` });
  }
  return items;
}
// The last batch PDF per size is kept in memory: opening the same link twice (or reloading the
// tab) streams the finished file at once instead of rendering the whole gang again.
const gangCache = new Map();
app.get("/batch/:size.pdf", admin, safe(async (req, res) => {
  const group = req.query.group === "photo" ? "photo" : req.query.group === "plain" ? "plain" : "";
  let items = await batchItems(req.params.size, req.query.upto);
  if (group) items = items.filter(i => i.photo === (group === "photo"));
  if (!items.length) return res.status(404).send(`No ${group === "photo" ? "photo " : group === "plain" ? "standard " : ""}labels waiting for that size.`);
  const off = nudge(req.query);
  const key = `${req.query.upto || ""}|${items.length}|${off.dx},${off.dy}`, slot = `${req.params.size}|${group}`;
  let hit = gangCache.get(slot);
  if (!hit || hit.key !== key) {
    const out = await renderGang(items, off);
    hit = { key, pdf: out.pdf, sheets: out.sheets, labels: out.slots.length };
    gangCache.set(slot, hit);
  }
  res.set({ "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="single-labels-${req.params.size}${group ? "-" + group : ""}.pdf"`,
            "X-Sheets": hit.sheets, "X-Labels": hit.labels }).send(hit.pdf);
}));
app.post("/batch/:size/done", admin, safe(async (req, res) => {
  for (const k of [...gangCache.keys()]) if (k.startsWith(req.params.size + "|") || k === req.params.size) gangCache.delete(k);   // those labels are printed; free the memory
  const n = await clearSingles(req.params.size, req.query.upto || new Date().toISOString());
  res.send(page(`<h1>Cleared</h1><p>${n} order line${n === 1 ? "" : "s"} cleared for ${SIZE_NAMES[req.params.size] || req.params.size}.</p><a class="b" href="/batch?key=${encodeURIComponent(req.query.key)}">Back</a>`));
}));

// Last-resort guards: log instead of dying, so one bad request can never take the service down.
process.on("unhandledRejection", err => console.error("unhandled rejection", err));
process.on("uncaughtException", err => console.error("uncaught exception", err));

app.listen(PORT, () => console.log(`label print service listening on ${PORT}`));
