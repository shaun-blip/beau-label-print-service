// Local check: builds a few designs the way the storefront would, sends them to the running service, and saves the PDFs.
// Run the service first (npm start), then: BASE=http://localhost:3000 ADMIN_KEY=... npm test
import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const BASE = process.env.BASE || "http://localhost:3000";
const KEY = process.env.ADMIN_KEY || "";
const OUT = path.resolve("test/out"); fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files"] });
const page = await browser.newPage();
await page.goto(pathToFileURL(path.resolve("public/designer.html")).href, { waitUntil: "load" });

const LOGO = "data:image/svg+xml;base64," + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect width="200" height="100" fill="#1B2440"/><circle cx="100" cy="50" r="30" fill="#F3CFDA"/></svg>').toString("base64");
const cases = {
  "1-ready-single-champagne-x3": () => { state.size = "champagne"; state.qty = 3; state.group = "birthdays"; state.sub = 0; state.want = "ready"; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.rnote = "For Linda"; return exportDesign(); },
  "2-ready-mix-prosecco-x2": () => { state.size = "prosecco"; state.qty = 2; state.rnote = ""; state.group = "holidays"; state.sub = 0; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.rmode = "mixed"; buildQty(); buildReady(); render(); return exportDesign(); },
  "3-names-mini-23": () => { state.size = "mini"; state.qty = 1; state.rmode = "one"; state.group = "weddings"; state.sub = 0; state.want = "custom"; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.mode = "names"; state.names = Array.from({ length: 23 }, (_, i) => "Guest " + (i + 1)).join("\n"); buildModes(); render(); return exportDesign(); },
  "4-picture-design": () => { state.size = "champagne"; state.qty = 1; state.mode = "same"; state.want = "ready"; state.group = "holidays"; state.sub = 0; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.tpl = "heirloom"; state.tplPicked = true; render(); return exportDesign(); },
  "5-derby-themed-bold-caps": () => { state.group = "gatherings"; state.sub = GROUPS.find(g => g.id === "gatherings").subs.findIndex(s => s[0] === "Derby party"); state.tplPicked = false; applyOccasion(); state.font = "boldcaps"; Object.assign(F, fontNow().f); state.pal = PALETTES.findIndex(p => p.name === "Navy & Gold"); state.palEdited = true; render(); return exportDesign(); },
  "6-logo": (logo) => { state.group = "business"; state.sub = 1; state.want = "custom"; state.tplPicked = false; state.font = "classic"; Object.assign(F, fontNow().f); applyOccasion(); state.logo = { url: logo, data: logo, name: "logo.svg", w: 200, h: 100, vector: true, small: false }; state.rights = true; state.tpl = "logo1"; state.tplPicked = true; render(); return exportDesign(); },
  "8-thanksgiving-cornucopia": () => { state.logo = null; state.size = "champagne"; state.qty = 1; state.mode = "same"; state.group = "holidays"; state.sub = GROUPS.find(g => g.id === "holidays").subs.findIndex(s => s[0] === "Thanksgiving"); state.want = "custom"; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.tpl = "tg-cornucopia"; state.tplPicked = true; render(); return exportDesign(); },
  "9-thanksgiving-lettering-mini": () => { state.size = "mini"; setSize(sizeNow()); state.tpl = "tg-brush"; render(); return exportDesign(); },
  "10-birthday-gold-glitter": () => { state.size = "champagne"; state.qty = 1; state.mode = "same"; state.group = "birthdays"; state.sub = 0; state.want = "custom"; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.tpl = "bd-gold"; state.tplPicked = true; render(); return exportDesign(); },
  "11-birthday-bunting-prosecco": () => { state.size = "prosecco"; setSize(sizeNow()); state.tpl = "bd-bunting"; render(); return exportDesign(); },
  "12-wedding-table-script-mix": () => { state.size = "champagne"; state.qty = 1; state.group = "weddings"; state.sub = GROUPS.find(g => g.id === "weddings").subs.findIndex(s => s[0] === "Table bottles"); state.want = "custom"; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.tpl = "wd-tablescript"; state.tplPicked = true; state.mode = "mix"; state.mixAll = false; syncMix(); state.mix.forEach((w, i) => { w.main = "No. " + (i + 1); }); render(); return exportDesign(); },
  "13-wedding-number-and-frame": () => { state.mode = "same"; state.words.main = "No. 12"; state.tpl = "wd-number"; state.size = "prosecco"; setSize(sizeNow()); render(); return exportDesign(); },
  "14-hanukkah-golden-menorah": () => { state.mode = "same"; state.size = "champagne"; state.qty = 1; state.group = "holidays"; state.sub = GROUPS.find(g => g.id === "holidays").subs.findIndex(s => s[0] === "Hanukkah"); state.want = "custom"; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.tpl = "hk-goldmenorah"; state.tplPicked = true; render(); return exportDesign(); },
  "15-hanukkah-sketches-mini": () => { state.size = "mini"; setSize(sizeNow()); state.tpl = "hk-srow"; render(); return exportDesign(); },
  "16-july4-star-wreath": () => { state.mode = "same"; state.size = "prosecco"; state.qty = 1; state.group = "holidays"; state.sub = GROUPS.find(g => g.id === "holidays").subs.findIndex(s => s[0] === "Fourth of July"); state.want = "custom"; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.tpl = "j4-starwreath"; state.tplPicked = true; render(); return exportDesign(); },
  "17-july4-liberty": () => { state.size = "champagne"; setSize(sizeNow()); state.tpl = "j4-liberty"; render(); return exportDesign(); },
  "18-grad-scroll": () => { state.mode = "same"; state.size = "champagne"; state.qty = 1; state.group = "milestones"; state.sub = 0; state.want = "custom"; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.tpl = "gr-scroll"; state.tplPicked = true; render(); return exportDesign(); },
  "19-grad-congrats-mini": () => { state.size = "mini"; setSize(sizeNow()); state.tpl = "gr-congrats"; render(); return exportDesign(); },
  "20-valentine-scallop": () => { state.mode = "same"; state.size = "prosecco"; state.qty = 1; state.group = "holidays"; state.sub = GROUPS.find(g => g.id === "holidays").subs.findIndex(s => s[0] === "Valentine's Day"); state.want = "custom"; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.tpl = "vd-scallop"; state.tplPicked = true; render(); return exportDesign(); },
  "21-valentine-retro": () => { state.size = "champagne"; setSize(sizeNow()); state.tpl = "vd-retro"; render(); return exportDesign(); },
  "22-stpat-pot": () => { state.mode = "same"; state.size = "champagne"; state.qty = 1; state.group = "holidays"; state.sub = GROUPS.find(g => g.id === "holidays").subs.findIndex(s => s[0] === "St. Patrick's Day"); state.want = "custom"; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.tpl = "sp-pot"; state.tplPicked = true; render(); return exportDesign(); },
  "23-stpat-brush-mini": () => { state.size = "mini"; setSize(sizeNow()); state.tpl = "sp-brush"; render(); return exportDesign(); },
  "24-baby-bow-frame": () => { state.mode = "same"; state.size = "prosecco"; state.qty = 1; state.group = "baby"; state.sub = 0; state.want = "custom"; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.tpl = "bb-frame-pink"; state.tplPicked = true; render(); return exportDesign(); },
  "25-baby-stork": () => { state.size = "champagne"; setSize(sizeNow()); state.tpl = "bb-stork-green"; render(); return exportDesign(); },
  "26-names-stacked": () => { state.logo = null; state.mode = "same"; state.size = "prosecco"; state.qty = 1; state.group = "weddings"; state.sub = 0; state.want = "custom"; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.tpl = "nm-stack"; state.tplPicked = true; state.words.main = "Alexandria and Christopher"; render(); return exportDesign(); },
  "27-single-3-champagne": () => { state.logo = null; state.mode = "same"; state.size = "champagne"; state.qty = 1; state.single = 3; state.group = "birthdays"; state.sub = 0; state.want = "custom"; state.tplPicked = false; setSize(sizeNow()); applyOccasion(); state.tpl = "bd-bunting"; state.tplPicked = true; render(); return exportDesign(); },
  "28-single-2-champagne-names": () => { state.single = 2; state.group = "weddings"; state.sub = 0; state.tplPicked = false; applyOccasion(); state.tpl = "nm-stack"; state.tplPicked = true; state.words.main = "Ava + Lucas"; render(); const d = exportDesign(); state.single = 0; return d; },
  "30-single-mini-3": () => { state.single = 3; state.size = "mini"; setSize(sizeNow()); state.mode = "same"; state.tpl = "nm-caps"; render(); const d = exportDesign(); state.single = 0; return d; },
  "31-single-prosecco-1": () => { state.single = 1; state.size = "prosecco"; setSize(sizeNow()); state.tpl = "wd-wreath"; render(); const d = exportDesign(); state.single = 0; state.size = "champagne"; setSize(sizeNow()); return d; },
  "7-blocked-brand": () => { state.logo = null; state.group = "thanks"; state.sub = 0; state.want = "custom"; state.tplPicked = false; applyOccasion(); state.words.main = "Veuve Clicquot Night"; render(); return exportDesign(); }
};
let failed = 0; const ids = {};
for (const [name, fn] of Object.entries(cases)) {
  if (process.env.ONLY && !name.includes(process.env.ONLY)) continue;
  const design = await page.evaluate(`(${fn.toString()})(${JSON.stringify(LOGO)})`);
  const save = await fetch(BASE + "/designs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(design) });
  const body = await save.json();
  if (name.startsWith("7")) { const ok = save.status === 422; if (!ok) failed++; console.log(ok ? "ok  " : "FAIL", name, "→", save.status, body.error); continue; }
  if (!save.ok) { failed++; console.log("FAIL", name, save.status, body); continue; }
  ids[name] = body.id;
  const pdf = await fetch(`${BASE}/designs/${body.id}.pdf?key=${KEY}`);
  const buf = Buffer.from(await pdf.arrayBuffer());
  fs.writeFileSync(path.join(OUT, name + ".pdf"), buf);
  console.log(pdf.ok ? "ok  " : "FAIL", name, "→ pages", pdf.headers.get("x-pages"), "copies", pdf.headers.get("x-copies"), Math.round(buf.length / 1024) + " KB", "|", body.summary.Label || body.summary.Labels || "", "|", body.summary.Quantity);
  if (!pdf.ok) failed++;
}
// the paid-order notice must be refused without a valid signature
const fake = JSON.stringify({ id: 1, line_items: [] });
const bad = await fetch(BASE + "/webhooks/orders-paid", { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Hmac-Sha256": "nope" }, body: fake });
const good = await fetch(BASE + "/webhooks/orders-paid", { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Hmac-Sha256": crypto.createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET || "").update(fake).digest("base64") }, body: fake });
console.log(bad.status === 401 ? "ok  " : "FAIL", "unsigned order notice refused →", bad.status);
console.log(good.status === 200 ? "ok  " : "FAIL", "signed order notice accepted →", good.status);
if (bad.status !== 401 || good.status !== 200) failed++;
// single labels from two orders are batched onto one shared sheet
if (ids["27-single-3-champagne"] && ids["28-single-2-champagne-names"]) {
  const sign = b => crypto.createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET || "").update(b).digest("base64");
  const stamp = Date.now();
  for (const [n, id, qty] of [[1001, ids["27-single-3-champagne"], 1], [1002, ids["28-single-2-champagne-names"], 2]]) {
    const o = JSON.stringify({ id: stamp + n, name: "#" + n, line_items: [{ id: stamp + n + 5000, quantity: qty, title: "Custom Label", properties: [{ name: "_design_id", value: id }] }] });
    await fetch(BASE + "/webhooks/orders-paid", { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Hmac-Sha256": sign(o) }, body: o });
  }
  let list = ""; for (let i = 0; i < 40 && !(list.includes("#1001") && list.includes("#1002")); i++) { await new Promise(r => setTimeout(r, 1500)); list = await (await fetch(`${BASE}/batch?key=${KEY}`)).text(); }
  const link = (list.match(/href="(\/batch\/champagne\.pdf[^"]+)"/) || [])[1], done = (list.match(/action="(\/batch\/champagne\/done[^"]+)"/) || [])[1];
  const pdf = link ? await fetch(BASE + link.replace(/&amp;/g, "&")) : null;
  const okPdf = pdf && pdf.ok && pdf.headers.get("x-labels") === "7" && ["1", "7"].includes(pdf.headers.get("x-sheets"));   // 1 shared sheet, or 7 single pieces
  if (pdf && pdf.ok) fs.writeFileSync(path.join(OUT, "29-singles-batch.pdf"), Buffer.from(await pdf.arrayBuffer()));
  console.log(okPdf ? "ok  " : "FAIL", "singles batch → labels", pdf && pdf.headers.get("x-labels"), "sheets", pdf && pdf.headers.get("x-sheets"));
  const cleared = done ? await (await fetch(BASE + done, { method: "POST" })).text() : "";
  const after = await fetch(`${BASE}/batch/champagne.pdf?key=${KEY}`);
  const okClear = /2 order lines cleared/.test(cleared) && after.status === 404;
  console.log(okClear ? "ok  " : "FAIL", "batch cleared after printing →", after.status);
  if (!okPdf || !okClear) failed++;
}
await browser.close();
console.log(failed ? failed + " check(s) failed" : "all checks passed");
process.exit(failed ? 1 : 0);
