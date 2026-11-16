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
  "7-blocked-brand": () => { state.logo = null; state.group = "thanks"; state.sub = 0; state.want = "custom"; state.tplPicked = false; applyOccasion(); state.words.main = "Veuve Clicquot Night"; render(); return exportDesign(); }
};
let failed = 0;
for (const [name, fn] of Object.entries(cases)) {
  const design = await page.evaluate(`(${fn.toString()})(${JSON.stringify(LOGO)})`);
  const save = await fetch(BASE + "/designs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(design) });
  const body = await save.json();
  if (name.startsWith("7")) { const ok = save.status === 422; if (!ok) failed++; console.log(ok ? "ok  " : "FAIL", name, "→", save.status, body.error); continue; }
  if (!save.ok) { failed++; console.log("FAIL", name, save.status, body); continue; }
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
await browser.close();
console.log(failed ? failed + " check(s) failed" : "all checks passed");
process.exit(failed ? 1 : 0);
