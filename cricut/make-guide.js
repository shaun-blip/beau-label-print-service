// Rebuilds BeauBottles-cut-guide.pdf from the cut SVGs: one letter page per bottle size,
// black cut lines as they will cut, red dashes where the sheet is trimmed into quarters.
// Run from the repo root:  PUPPETEER_EXECUTABLE_PATH="<chrome>" node cricut/make-guide.js
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const PAGES = [
  { file: "champagne", title: "Champagne: 4 labels a sheet. Print at 100%, no scaling.",
    label: "2.75 x 4.25 in", group: "7.0 x 9.75 in", sit: "0.75 in from the left, 0.625 in from the top" },
  { file: "prosecco", title: "Prosecco: 4 labels a sheet. Print at 100%, no scaling.",
    label: "2.83 x 3.09 in", group: "7.08 x 8.59 in", sit: "0.71 in from the left, 1.205 in from the top" },
  { file: "mini", title: "Mini: 8 labels a sheet. Print at 100%, no scaling.",
    label: "1.9375 x 2.0938 in", group: "6.188 x 9.938 in", sit: "1.156 in from the left, 0.531 in from the top" },
];
const NOTE = "All corners are square. Each file holds two groups: the label cuts (pass 1, kiss cut) and trim-quarters (pass 2, cut through — it is the full 8.5 x 11 cross, so place it flush with the mat's top-left corner, same corner as the sheet). Run both passes without taking the sheet off the mat: labels first, then the trim.";

const pages = PAGES.map((p, i) => {
  const svg = fs.readFileSync(`cricut/BeauBottles-cut-${p.file}.svg`, "utf8");
  const cuts = svg.match(/(<g id="labels-[^"]+">.*?<\/g>)/)[1];   // the label group only; the guide draws the trim cross itself, in red
  return `<div class="pg">
    <svg viewBox="0 0 612 792" width="8.5in" height="11in">
      <line x1="306" y1="0" x2="306" y2="792" stroke="#e03131" stroke-width="0.75" stroke-dasharray="7 5"/>
      <line x1="0" y1="396" x2="612" y2="396" stroke="#e03131" stroke-width="0.75" stroke-dasharray="7 5"/>
      ${cuts}
    </svg>
    <div class="txt">
      <h1>${p.title}</h1>
      <p>Black = label kiss-cut lines (label ${p.label}). Red dashes = the trim-quarters group, second pass, cut through (four 4.25 x 5.5 in pieces).</p>
      <p>In Design Space the cut group should measure ${p.group} and sit ${p.sit} of the sheet.</p>
      ${i === 0 ? `<p class="note">${NOTE}</p>` : ""}
    </div>
  </div>`;
}).join("");

const html = `<!doctype html><meta charset="utf-8"><style>
  @page{size:8.5in 11in;margin:0} html,body{margin:0;padding:0}
  .pg{position:relative;width:8.5in;height:11in;page-break-after:always;overflow:hidden}
  .pg:last-child{page-break-after:auto}
  .pg svg{position:absolute;left:0;top:0}
  .txt{position:absolute;left:0.25in;top:0.12in;right:0.25in;font-family:Helvetica,Arial,sans-serif;color:#111}
  h1{font-size:15px;margin:0 0 2px} p{font-size:10.5px;margin:0 0 1px} .note{color:#444}
</style>${pages}`;

const browser = await puppeteer.launch({ executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
const pdf = await page.pdf({ width: "8.5in", height: "11in", printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
fs.writeFileSync("cricut/BeauBottles-cut-guide.pdf", pdf);
await browser.close();
console.log(`cricut/BeauBottles-cut-guide.pdf: ${pdf.length} bytes, ${PAGES.length} pages`);
