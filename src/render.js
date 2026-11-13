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
export function renderDesign(design) {
  const job = queue.then(() => renderNow(design));
  queue = job.catch(() => {});
  return job;
}

async function renderNow(design) {
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
    const out = await page.evaluate(d => { applyDesign(d); return printPages(); }, design);
    if (!out.pages.length) throw new Error("The design produced no print pages.");

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
    await page.evaluate(async () => { await document.fonts.ready; });

    const pdf = await page.pdf({
      width: out.widthIn + "in", height: out.heightIn + "in",
      printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    return { pdf: Buffer.from(pdf), pages: out.pages.length, copies: out.copies, labelsPerSheet: out.labelsPerSheet,
             widthIn: out.widthIn, heightIn: out.heightIn, problem: out.problem };
  } finally {
    await page.close().catch(() => {});
  }
}

// Used when a design is saved: runs the designer's own checks on the server, so the browser's check is never trusted alone.
export async function checkDesign(design) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await openDesigner(page);
    return await page.evaluate(d => { applyDesign(d); const e = exportDesign(); return { problem: e.problem, summary: e.summary }; }, design);
  } finally {
    await page.close().catch(() => {});
  }
}
