// Turns a saved design into a PDF by running the real designer page in a headless browser.
// The page's own code draws every label, so the PDF matches what the customer approved.
import puppeteer from "puppeteer-core";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fontCss } from "./fonts.js";

const FONTS = fontCss();
if (FONTS.missing.length) console.warn("Fonts not bundled, will fall back:", FONTS.missing.join(", "));

const DESIGNER = pathToFileURL(path.resolve("public/designer.html")).href;
const CHROME = process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium";
let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      executablePath: CHROME,
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none", "--allow-file-access-from-files"]
    }).then(b => { b.on("disconnected", () => { browserPromise = null; }); return b; })   // if Chrome ever exits, start a new one next time
      .catch(err => { browserPromise = null; throw err; });
  }
  return browserPromise;
}

// Opens the designer with web requests to Google Fonts switched off and the bundled fonts switched in.
async function openDesigner(page) {
  await page.setRequestInterception(true);
  page.on("request", r => /fonts\.(googleapis|gstatic)\.com/.test(r.url()) ? r.abort() : r.continue());
  await page.goto(DESIGNER, { waitUntil: "load", timeout: 45000 });
  await page.addStyleTag({ content: FONTS.css });
}

// One render at a time. A small Render instance does not have the memory for several browsers pages at once.
let queue = Promise.resolve();
export function renderDesign(design, opts = {}) {
  const job = queue.then(() => renderNow(design, false, opts));
  queue = job.catch(() => {});
  return job;
}
// Several orders' single labels on shared sheets, with a pick list as the last page. items: [{design, tag}], one bottle size.
export function renderGang(items) {
  const job = queue.then(() => renderNow(items, true, {}));
  queue = job.catch(() => {});
  return job;
}
// The pick list: which positions on which sheet belong to which order. Positions count left to right, top to bottom.
function pickList(out) {
  const W = out.widthIn * 100, H = out.heightIn * 100, runs = [];
  for (const s of out.slots) { const r = runs[runs.length - 1]; if (r && r.tag === s.tag && r.page === s.page) r.to = s.pos; else runs.push({ page: s.page, from: s.pos, to: s.pos, tag: s.tag }); }
  const esc = t => String(t).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const rows = runs.map((r, i) => `<text x="60" y="${150 + i * 26}" font-size="16">Sheet ${r.page} · ${r.from === r.to ? "position " + r.from : "positions " + r.from + " to " + r.to} · ${esc(r.tag)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${out.widthIn}in" height="${out.heightIn}in" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif" fill="#111"><rect width="${W}" height="${H}" fill="#fff"/>`
    + `<text x="60" y="80" font-size="26" font-weight="bold">Single labels: pick list</text><text x="60" y="108" font-size="13">Print this page on plain paper. Positions count left to right, top to bottom (${out.cols} across).</text>${rows}</svg>`;
}

// ---------- a designer page kept open between design checks ----------
// Opening designer.html costs several seconds (3 MB page + fonts), and checkDesign runs while the
// customer waits on "Add to cart". So one page is opened once, kept, and reused: applyDesign()
// overwrites the whole state and rebuilds every panel, so designs cannot bleed into each other.
// The page is recycled every CHECK_RECYCLE checks to keep lazily-activated artwork from piling up.
const CHECK_RECYCLE = 50;
let warmPagePromise = null, warmUses = 0;
function designerPage() {
  if (!warmPagePromise) {                       // the promise is stored at once, so overlapping callers
    warmPagePromise = (async () => {            // (Render health checks every few seconds) share ONE open
      const browser = await getBrowser();
      const page = await browser.newPage();
      try {
        await openDesigner(page);
        await page.evaluate(async () => {
          await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 12000))]);
        });
      } catch (err) { await page.close().catch(() => {}); throw err; }
      warmUses = 0;
      return page;
    })().catch(err => { warmPagePromise = null; throw err; });
  }
  return warmPagePromise;
}
function dropWarmPage() {
  const p = warmPagePromise; warmPagePromise = null; warmUses = 0;
  if (p) p.then(pg => pg.close()).catch(() => {});
}
// Called from /health: opens the browser and the designer page ahead of the first customer,
// and Render's own health checks then keep them warm. Failures stay out of the health answer
// and are not retried for a minute, so a broken Chromium cannot be relaunched every few seconds.
let lastWarmFail = 0;
export function warmUp() {
  if (Date.now() - lastWarmFail < 60000) return;
  designerPage().catch(err => { lastWarmFail = Date.now(); console.warn("warm-up failed:", err.message); });
}

// SINGLES_OUTPUT=pieces (default): single labels print one quarter-sheet piece (4.25 x 5.5 in) per page.
// SINGLES_OUTPUT=sheet: single labels print onto full label sheets, as before.
const SINGLES = process.env.SINGLES_OUTPUT === "sheet" ? "sheet" : "pieces";
async function renderNow(design, gang = false, opts = {}) {
  dropWarmPage();                      // a PDF render (photos especially) needs the whole small instance; the next health check re-warms
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await openDesigner(page);
    // Wait for every font the page declares. If web fonts cannot be reached, the page falls back to system fonts.
    await page.evaluate(async () => {
      await Promise.race([
        (async () => { await document.fonts.ready; await Promise.all([...document.fonts].map(f => f.load().catch(() => null))); })(),
        new Promise(r => setTimeout(r, 12000))
      ]);
    });
    const out = await page.evaluate((d, g, singles, tag) => { if (g) return gangPages(d, singles); applyDesign(d); return printPages({ singles, tag }); }, design, gang, SINGLES, opts.tag || "");
    if (!out.pages.length) throw new Error("The design produced no print pages.");
    const sheets = out.pages.length;
    if (gang && !out.pieces) out.pages.push(pickList(out));   // pieces carry their order number on the backing, so they need no pick list

    // Lay the sheets out one per PDF page, at the exact sheet size, with no browser margins.
    await page.evaluate(o => {
      document.head.querySelectorAll("style").forEach(s => { if (s.id !== "uploaded-fonts" && !/@font-face/.test(s.textContent)) s.remove(); });
      const css = document.createElement("style");
      css.textContent = `@page{size:${o.widthIn}in ${o.heightIn}in;margin:0}html,body{margin:0;padding:0;background:#fff}
        .pg{width:${o.widthIn}in;height:${o.heightIn}in;page-break-after:always;break-after:page;overflow:hidden}
        .pg:last-child{page-break-after:auto;break-after:auto}.pg svg{width:100%;height:100%;display:block}`;
      document.head.appendChild(css);
      const defs = document.querySelector("body > svg");            // shared artwork and filters stay available
      document.body.innerHTML = (defs ? defs.outerHTML : "") + o.pages.map(p => `<div class="pg">${p}</div>`).join("");
    }, out);
    // Artwork ships as separate lazy files (data-href): set every href this print references and
    // wait for the images to decode, or the PDF would print empty boxes where the art belongs.
    await page.evaluate(async () => {
      await Promise.all([...document.querySelectorAll("image")].map(el => {
        if (el.dataset && el.dataset.href && !el.getAttribute("href")) el.setAttribute("href", el.dataset.href);
        const href = el.getAttribute("href");
        if (!href || href.startsWith("data:")) return null;
        const i = new Image(); i.src = href;
        return i.decode().catch(() => null);
      }));
    });
    await page.evaluate(async () => { await document.fonts.ready; });

    const pdf = await page.pdf({
      width: out.widthIn + "in", height: out.heightIn + "in",
      printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    return { pdf: Buffer.from(pdf), sheets, pieces: !!out.pieces, slots: out.slots || null, pages: out.pages.length, copies: out.copies, labelsPerSheet: out.labelsPerSheet,
             widthIn: out.widthIn, heightIn: out.heightIn, problem: out.problem };
  } finally {
    await page.close().catch(() => {});
  }
}

// Used when a design is saved: runs the designer's own checks on the server, so the browser's check is never trusted alone.
// Checks share the warm page, so they run one at a time; a dead page is dropped and tried once more fresh.
let checkQueue = Promise.resolve();
export function checkDesign(design) {
  const job = checkQueue.then(() => checkNow(design));
  checkQueue = job.catch(() => {});
  return job;
}
async function checkNow(design, retried = false) {
  try {
    const page = await designerPage();
    const out = await page.evaluate(d => { applyDesign(d); const e = exportDesign(); return { problem: e.problem, summary: e.summary }; }, design);
    if (++warmUses >= CHECK_RECYCLE) dropWarmPage();
    return out;
  } catch (err) {
    dropWarmPage();
    if (retried) throw err;
    return checkNow(design, true);
  }
}
