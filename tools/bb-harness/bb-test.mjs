import puppeteer from "/private/tmp/claude-501/-Users-shaunwork/adb771d5-ae2a-4865-ae50-fabe7b926e2e/scratchpad/vdeps/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js";
const AFTER = process.argv[2] !== "legacy";   // the suite asserts current behavior (earned-claimable default)
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

// -- add 4 more: crosses $39 — with no tier chosen, EARNED = CLAIMABLE: claims open right here --
await page.evaluate(() => { const cards = [...document.querySelectorAll(".bb-bb-card")]; for (let i = 1; i < 5; i++) cards[i].click(); });
await new Promise(r => setTimeout(r, 450));
if (AFTER){
  const t1 = await page.evaluate(() => ({
    sub: document.querySelector("[data-bb-sticky-sub]").textContent,
    cta: document.querySelector("[data-bb-sticky-cta]").textContent.trim(),
    toast: (() => { const el = document.querySelector(".bb-bb-toast"); return el && el.classList.contains("is-on") ? el.textContent : ""; })(),
    meter: document.querySelector("[data-bb-spend-txt]").textContent,
  }));
  ok("claims open at the earned tier", /Claim 2 FREE/i.test(t1.cta), t1.cta);
  ok("unlock toast at the earned tier", /2 FREE/.test(t1.toast), t1.toast.slice(0, 60));
  ok("bar sub yields to the CTA while claimable", t1.sub === "", "sub: '" + t1.sub + "'");
  ok("meter says pick, in the same voice", /2 FREE wraps to pick/i.test(t1.meter), t1.meter.slice(0, 60));
}

// -- minis grey out while the 2 free picks are claimable --
if (AFTER){
  await page.evaluate(() => document.querySelector('.bb-bb-bottlebar .bb-bb-bottle__opt[data-bottle="Mini"]').click());
  await new Promise(r => setTimeout(r, 500));
  const g = await page.evaluate(() => ({
    cards: document.querySelectorAll(".bb-bb-card--mini").length,
    greyed: document.querySelectorAll(".bb-bb-card--mini.is-freeout").length,
    banner: document.querySelector("[data-bb-resultcount]").textContent,
  }));
  ok("mini cards greyed during claim phase", g.cards > 0 && g.greyed === g.cards, g.greyed + "/" + g.cards);
  ok("banner explains minis are not free picks", /single wraps/.test(g.banner) && /free pick/i.test(g.banner), g.banner.slice(0, 70));
  await page.evaluate(() => { const t = document.querySelector(".bb-bb-toast"); if (t) t.classList.remove("is-on"); });
  await page.evaluate(() => document.querySelectorAll(".bb-bb-card--mini")[0].click());
  await new Promise(r => setTimeout(r, 400));
  const g2 = await page.evaluate(() => ({
    freeTiles: document.querySelectorAll(".bb-bb-tray .bb-tl--free").length,
    toast: (() => { const el = document.querySelector(".bb-bb-toast"); return el && el.classList.contains("is-on") ? el.textContent : ""; })(),
  }));
  ok("greyed mini tap adds nothing and explains why", g2.freeTiles === 0 && /single wraps/.test(g2.toast), g2.toast.slice(0, 70));
  await page.screenshot({ path: SHOT("3b-minis-greyed") });
  await page.evaluate(() => document.querySelector('.bb-bb-bottlebar .bb-bb-bottle__opt[data-bottle="Prosecco"]').click());
  await new Promise(r => setTimeout(r, 500));
}

// -- claim the 2, then build on: 5 more paid to $79.50, then claim the 3 more --
await page.evaluate(() => { const cards = [...document.querySelectorAll(".bb-bb-card")]; cards[5].click(); cards[6].click(); });
await new Promise(r => setTimeout(r, 450));
const c2 = await page.evaluate(() => ({
  free: document.querySelectorAll(".bb-bb-tray .bb-tl--free").length,
  cta: document.querySelector("[data-bb-sticky-cta]").textContent.trim(),
  sub: document.querySelector("[data-bb-sticky-sub]").textContent,
  count: document.querySelector("[data-bb-sticky-count]").textContent,
}));
ok("two taps claim the 2 free (spend unchanged)", c2.free === 2 && c2.count.includes("39.75"), c2.count + " · " + c2.free + " free");
ok("CTA flips to add-to-cart with 2 FREE", /add to cart/i.test(c2.cta) && /2 FREE/.test(c2.cta), c2.cta);
ok("bar invites the next rung incrementally", /\+3 more FREE/.test(c2.sub), c2.sub);
await page.evaluate(() => { const cards = [...document.querySelectorAll(".bb-bb-card")]; for (let i = 7; i < 12; i++) cards[i].click(); });
await new Promise(r => setTimeout(r, 500));
const tier = await page.evaluate(() => ({
  count: document.querySelector("[data-bb-sticky-count]").textContent,
  cta: document.querySelector("[data-bb-sticky-cta]").textContent.trim(),
}));
ok("tier 2 reached at $79.50 (claims held while building)", tier.count.includes("79.50"), tier.count);
ok("CTA offers the 3 newly earned claims", /Claim 3 FREE/i.test(tier.cta), tier.cta);
await page.screenshot({ path: SHOT("3-tier-reached") });
await page.evaluate(() => { const cards = [...document.querySelectorAll(".bb-bb-card")]; for (let i = 12; i < 15; i++) cards[i].click(); });
await new Promise(r => setTimeout(r, 500));
const free5 = await page.evaluate(() => ({
  free: document.querySelectorAll(".bb-bb-tray .bb-tl--free").length,
  cta: document.querySelector("[data-bb-sticky-cta]").textContent.trim(),
}));
ok("all 5 free claimed across both rungs", free5.free === 5, free5.free + " free tiles");
ok("CTA ready to add", /add to cart/i.test(free5.cta) && /5 FREE/.test(free5.cta), free5.cta);

// -- minis usable again once the free picks are claimed --
if (AFTER){
  await page.evaluate(() => document.querySelector('.bb-bb-bottlebar .bb-bb-bottle__opt[data-bottle="Mini"]').click());
  await new Promise(r => setTimeout(r, 500));
  const g3 = await page.evaluate(() => ({ greyed: document.querySelectorAll(".bb-bb-card--mini.is-freeout").length, cards: document.querySelectorAll(".bb-bb-card--mini").length }));
  ok("minis re-enabled after free picks claimed", g3.cards > 0 && g3.greyed === 0, g3.greyed + "/" + g3.cards + " greyed");
  await page.evaluate(() => document.querySelector('.bb-bb-bottlebar .bb-bb-bottle__opt[data-bottle="Prosecco"]').click());
  await new Promise(r => setTimeout(r, 500));
}

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

// -- the checkout guard adds EXACTLY the promised free wraps (claim-only, no paid top-up) --
if (AFTER){
  await page.evaluate(() => { const cards = [...document.querySelectorAll(".bb-bb-card")]; for (let i = 20; i < 25; i++) cards[i].click(); });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => { const cards = [...document.querySelectorAll(".bb-bb-card")]; /* leave the 2 earned unclaimed */ });
  await page.evaluate(() => document.querySelector("[data-bb-add]").click());
  await new Promise(r => setTimeout(r, 300));
  const gshown = await page.evaluate(() => !document.querySelector("[data-bb-guard]").hidden);
  ok("guard fires with 2 unclaimed", gshown);
  await page.evaluate(() => { const b = document.querySelector('[data-bb-guard] [data-g="add"]'); if (b) b.click(); });
  await new Promise(r => setTimeout(r, 500));
  const g3 = await page.evaluate(() => ({
    spend: document.querySelector("[data-bb-sticky-count]").textContent,
    paid: document.querySelectorAll(".bb-bb-tray .bb-tl:not(.bb-tl--free)").length,
    free: document.querySelectorAll(".bb-bb-tray .bb-tl--free").length,
  }));
  ok("guard adds the 2 free, nothing else", g3.paid === 5 && g3.free === 2 && g3.spend.includes("39.75"), JSON.stringify(g3));
}

// -- an EXPLICITLY chosen tier keeps goal-pacing: no new claims until that goal --
if (AFTER){
  await page.evaluate(() => { document.querySelector(".bb-bb-goal > summary").click(); });
  await new Promise(r => setTimeout(r, 200));
  await page.evaluate(() => { document.querySelector('.bb-bb-size[data-size="10"]').click(); });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => { [...document.querySelectorAll(".bb-bb-card")].filter(c => !c.classList.contains("is-added"))[0].click(); });
  await new Promise(r => setTimeout(r, 400));
  const ch = await page.evaluate(() => ({
    count: document.querySelector("[data-bb-sticky-count]").textContent,
    cta: document.querySelector("[data-bb-sticky-cta]").textContent.trim(),
    sub: document.querySelector("[data-bb-sticky-sub]").textContent,
  }));
  ok("chosen Tier 2 gates claims until $79", /add to cart/i.test(ch.cta) && !/claim/i.test(ch.cta), ch.count + " · " + ch.cta);
  ok("chosen-goal bar counts to the goal's total", /5 FREE/.test(ch.sub), ch.sub);
}

let fails = 0;
for (const [st, name, note] of R){ if (st === "FAIL") fails++; console.log(st + "| " + name + (note ? "  —  " + note : "")); }
console.log("\nPAGE ERRORS:", errs.length ? errs.slice(0, 3) : "none");
console.log(fails === 0 && errs.length === 0 ? "ALL PASS" : "FAILURES: " + fails);
await browser.close();
process.exit(fails || errs.length ? 1 : 0);
