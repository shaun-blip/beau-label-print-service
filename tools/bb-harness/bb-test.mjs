import puppeteer from "/private/tmp/claude-501/-Users-shaunwork/adb771d5-ae2a-4865-ae50-fabe7b926e2e/scratchpad/vdeps/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js";
const AFTER = process.argv[2] === "after";   // after-mode asserts the new UX layer
const SHOT = (n) => `${AFTER ? "after" : "before"}-${n}.png`;
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const errs = []; page.on("pageerror", e => errs.push(String(e)));
await page.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch (e) {} });
await page.goto("http://localhost:8123/harness.html", { waitUntil: "load" });
await page.waitForFunction(() => document.querySelectorAll(".bb-bb-card").length > 5, { timeout: 8000 });
const R = []; const ok = (name, cond, note) => R.push([cond ? " ok " : "FAIL", name, note || ""]);

// -- initial state --
const init = await page.evaluate(() => ({
  cards: document.querySelectorAll(".bb-bb-card").length,
  barVisible: getComputedStyle(document.querySelector(".bb-bb-stickybar")).display !== "none",
  trayOff: /matrix/.test(getComputedStyle(document.querySelector(".bb-bb-tray")).transform) || getComputedStyle(document.querySelector(".bb-bb-tray")).transform !== "none",
  count: document.querySelector("[data-bb-sticky-count]").textContent,
}));
ok("grid renders cards", init.cards >= 10, init.cards + " cards");
ok("sticky bar visible on mobile", init.barVisible);
ok("tray starts collapsed", init.trayOff);
await page.screenshot({ path: SHOT("1-initial"), fullPage: false });

// -- add one wrap --
await page.evaluate(() => document.querySelectorAll(".bb-bb-card")[0].click());
await new Promise(r => setTimeout(r, 450));
const one = await page.evaluate(() => ({
  count: document.querySelector("[data-bb-sticky-count]").textContent,
  sub: document.querySelector("[data-bb-sticky-sub]").textContent,
  added: document.querySelectorAll(".bb-bb-card.is-added").length,
}));
ok("bar shows spend after 1 add", one.count.includes("7.95"), one.count + " | sub: " + one.sub);
ok("card marked added", one.added === 1);
if (AFTER){
  const prog = await page.evaluate(() => { const p = document.querySelector(".bb-bb-barprog i"); return p ? p.style.width : "MISSING"; });
  ok("bar progress strip exists and moved", prog !== "MISSING" && parseFloat(prog) > 5, prog);
  ok("bar sub shows distance to FREE", /to.*FREE/i.test(one.sub), one.sub);
}
await page.screenshot({ path: SHOT("2-one-added") });

// -- flash with tray closed: visible? --
await page.evaluate(() => { flashProbe(); function flashProbe(){ const s = document.querySelectorAll(".bb-bb-card").length; } });
const toastBefore = await page.evaluate(() => {
  // trigger a real flash by calling the same code path a claim/resume message uses
  const note = document.querySelector("[data-bb-note]");
  return { noteInTray: !!note.closest(".bb-bb-tray"), trayOpen: document.querySelector(".bb-bb").classList.contains("is-tray-open") };
});
ok("flash() target sits inside the (closed) tray", toastBefore.noteInTray && !toastBefore.trayOpen, "messages invisible on mobile pre-fix");

// -- add up to the $79 tier (10 total) --
await page.evaluate(() => { const cards = [...document.querySelectorAll(".bb-bb-card")]; for (let i = 1; i < 10; i++) cards[i].click(); });
await new Promise(r => setTimeout(r, 600));
const tier = await page.evaluate(() => ({
  count: document.querySelector("[data-bb-sticky-count]").textContent,
  sub: document.querySelector("[data-bb-sticky-sub]").textContent,
  cta: (document.querySelector("[data-bb-sticky-cta]") || {}).textContent,
  ctaHidden: document.querySelector("[data-bb-sticky-cta]").hidden,
}));
ok("tier reached at $79.50", tier.count.includes("79.50"), tier.count);
ok("CTA offers the free claims", !tier.ctaHidden && /claim/i.test(tier.cta || ""), (tier.cta || "").trim());
if (AFTER){
  const t = await page.evaluate(() => { const el = document.querySelector(".bb-bb-toast"); return el && !el.hidden ? el.textContent : ""; });
  ok("unlock toast fired at tier cross", /free/i.test(t), t.slice(0, 60));
}
await page.screenshot({ path: SHOT("3-tier-reached") });

// -- claim the 5 free --
await page.evaluate(() => { const cards = [...document.querySelectorAll(".bb-bb-card")]; for (let i = 10; i < 15; i++) cards[i].click(); });
await new Promise(r => setTimeout(r, 600));
const free5 = await page.evaluate(() => ({
  sub: document.querySelector("[data-bb-sticky-sub]").textContent,
  cta: document.querySelector("[data-bb-sticky-cta]").textContent,
  freeN: window.free ? -1 : document.querySelectorAll(".bb-tl--free").length,
}));
ok("5 free picked", /5\s*\/\s*5|5 FREE/i.test(free5.sub + free5.cta), free5.sub + " | " + free5.cta.trim());
ok("CTA ready to add", /add to cart/i.test(free5.cta), free5.cta.trim());

// -- open tray sheet, screenshot, close --
await page.evaluate(() => document.querySelector("[data-tray-toggle]").click());
await new Promise(r => setTimeout(r, 500));
const trayOpen = await page.evaluate(() => ({
  open: document.querySelector(".bb-bb").classList.contains("is-tray-open"),
  bodyLocked: document.body.style.overflow === "hidden",
  tiles: document.querySelectorAll(".bb-bb-tray .bb-tl").length,
}));
ok("tray sheet opens", trayOpen.open, trayOpen.tiles + " tiles");
if (AFTER) ok("body scroll locked while tray open", trayOpen.bodyLocked);
await page.screenshot({ path: SHOT("4-tray-open") });
await page.keyboard.press("Escape");
await new Promise(r => setTimeout(r, 400));
const esc = await page.evaluate(() => ({ open: document.querySelector(".bb-bb").classList.contains("is-tray-open"), bodyLocked: document.body.style.overflow === "hidden" }));
ok("Escape closes tray", !esc.open);
if (AFTER) ok("body scroll restored", !esc.bodyLocked);

// -- checkout from the bar --
await page.evaluate(() => document.querySelector("[data-bb-sticky-cta]").click());
await new Promise(r => setTimeout(r, 900));
const done = await page.evaluate(() => ({
  added: (window.__added || []).length,
  count: document.querySelector("[data-bb-sticky-count]").textContent,
  toast: (() => { const el = document.querySelector(".bb-bb-toast"); return el && !el.hidden ? el.textContent : ""; })(),
  addedNoteVisible: (() => { const el = document.querySelector("[data-bb-added]"); if (!el || el.hidden) return false; const r = el.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight && r.width > 0; })(),
}));
ok("checkout posted 15 lines (10 paid + 5 free)", done.added === 15, done.added + " lines");
ok("bundle reset after add", done.count.includes("0.00"), done.count);
if (AFTER) ok("mobile sees a confirmation (toast)", /added|cart/i.test(done.toast), done.toast.slice(0, 60));
else ok("PAIN: no visible confirmation on mobile", !done.addedNoteVisible, "added-note hidden in closed tray");
await page.screenshot({ path: SHOT("5-after-checkout") });

let fails = 0;
for (const [st, name, note] of R){ if (st === "FAIL") fails++; console.log(st + "| " + name + (note ? "  —  " + note : "")); }
console.log("\nPAGE ERRORS:", errs.length ? errs.slice(0, 3) : "none");
console.log(fails === 0 && errs.length === 0 ? "ALL PASS" : "FAILURES: " + fails);
await browser.close();
process.exit(fails || errs.length ? 1 : 0);
