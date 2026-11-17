import puppeteer from "/private/tmp/claude-501/-Users-shaunwork/adb771d5-ae2a-4865-ae50-fabe7b926e2e/scratchpad/vdeps/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js";
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--no-sandbox"] });

// phone: no horizontal overflow any more
const m = await browser.newPage();
await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await m.goto("http://localhost:8123/harness.html", { waitUntil: "load" });
await m.waitForFunction(() => document.querySelectorAll(".bb-bb-card").length > 5);
const fit = await m.evaluate(() => ({
  layoutW: document.documentElement.clientWidth, scrollW: document.scrollingElement.scrollWidth,
  optsW: Math.round(document.querySelector(".bb-bb-bottlebar .bb-bb-bottle__opts").getBoundingClientRect().width),
  rowScrollable: (() => { const o = document.querySelector(".bb-bb-bottlebar .bb-bb-bottle__opts"); return o.scrollWidth > o.clientWidth; })(),
  barW: Math.round(document.querySelector(".bb-bb-stickybar").getBoundingClientRect().width),
}));
console.log("MOBILE FIT:", JSON.stringify(fit));
console.log(fit.scrollW <= fit.layoutW + 1 ? " ok | page fits the phone (no horizontal overflow)" : "FAIL| page still overflows: " + fit.scrollW);
await m.screenshot({ path: "after-0-fit.png" });

// desktop: feedback layer absent, tray is the sticky aside, everything else untouched
const d = await browser.newPage();
await d.setViewport({ width: 1280, height: 900 });
await d.goto("http://localhost:8123/harness.html", { waitUntil: "load" });
await d.waitForFunction(() => document.querySelectorAll(".bb-bb-card").length > 5);
await d.evaluate(() => { [...document.querySelectorAll(".bb-bb-card")].slice(0, 3).forEach(c => c.click()); });
await new Promise(r => setTimeout(r, 500));
const dk = await d.evaluate(() => ({
  barHidden: getComputedStyle(document.querySelector(".bb-bb-stickybar")).display === "none",
  toastHidden: (() => { const t = document.querySelector(".bb-bb-toast"); return !t || getComputedStyle(t).display === "none"; })(),
  progHidden: (() => { const p = document.querySelector(".bb-bb-barprog"); return !p || getComputedStyle(p).display === "none"; })(),
  traySticky: getComputedStyle(document.querySelector(".bb-bb-tray")).position === "sticky",
  tiles: document.querySelectorAll(".bb-bb-tray .bb-tl").length,
  spendMeter: !document.querySelector("[data-bb-spend]").hidden,
  bodyScroll: document.body.style.overflow === "",
}));
// the tray tiles' × must remove the wrap (regression: the handler bound to a dead class)
await d.evaluate(() => document.querySelector('.bb-bb-tray .bb-tl__x[data-x-arr]').click());
await new Promise(r => setTimeout(r, 300));
const afterX = await d.evaluate(() => document.querySelectorAll(".bb-bb-tray .bb-tl").length);
console.log(afterX === 2 ? " ok | tile × removes the wrap (3 → 2)" : "FAIL| tile × did not remove: " + afterX + " tiles");
dk.xWorks = afterX === 2;
console.log("DESKTOP:", JSON.stringify(dk));
const okd = dk.barHidden && dk.toastHidden && dk.progHidden && dk.traySticky && dk.tiles === 3 && dk.spendMeter && dk.bodyScroll && dk.xWorks;
console.log(okd ? " ok | desktop untouched (bar/toast/progress hidden, tray sticky, meter live)" : "FAIL| desktop regression");
await d.screenshot({ path: "after-desktop.png" });
await browser.close();
process.exit(fit.scrollW <= fit.layoutW + 1 && okd ? 0 : 1);
