# Build-a-Bundle: the state machines

Documents `sections/bb-bundle-builder.liquid` in the Beau Bottles theme (one ~1,100-line script;
no kit twin — the theme file is the only source). Everything derives from module-level vars; one
`render()` redraws the tray, meters, buttons and bar on every change, and `renderGrid()` redraws
the catalog. There is no registry here (unlike the label designer): render() is already the single
sink, so keep it that way — **any new derived UI gets painted inside render(), never in a handler.**

## The machines

1. **Bundle slots** — `paid[]` + `free[]`; a slot is absent → `_busy` (resolving
   `/products/{h}.json`) → resolved. `render()` trims `free` when spend drops below a tier.
   Cart-critical ids/prices resolve live, never from localStorage.
2. **Spend ladder** — derived, never stored: `spendAll()` = paid + minis + eligible loose cart
   lines → `freeCount()` via fixed $39/$79/$119 thresholds (`T1..T3`) that MUST match the deployed
   Free Wraps checkout function. `paidTarget` (5/10/15) is a *goal*, not a quota. Latches:
   `wasUnlocked` (confetti once, at the chosen goal only — "no mid-build interception", Shaun
   2026-09), `prevFreeN` (bar pulse/toast at each new unlock, passive).
3. **Entry modes** — normal | `claimMode` (`?claim=1`, cart already earned free wraps) | seeded
   (`?seed=`, staged `bbStage`) | preset (`?preset=`) | cart-resume (`_bb` lines in cart).
   `cartResume()` resolves the precedence; `stageSeeding` guards the site-wide stage sync;
   `urlSized`/`userSized` decide who owns `paidTarget`.
4. **Bottle** — `currentBottle` Prosecco | Champagne | Mini | Wine. `flipAll()` switches eligible
   slots via the `PCSWAP` pairs map (from the `bb-pc-pairs` snippet); per-slot `flipSlot()`.
5. **Discovery** — `query`/`qtokens` × `activeTags` × `activeCurated` pill × bottle → `view()`
   (ranked, capped 40 except "All wraps"). Two search inputs (top + mobile sheet) sync through
   `applyQuery()`.
6. **Mobile surfaces** — tray bottom-sheet (`is-tray-open`, body scroll-locked while open),
   discovery sheet, zoom/360 (`zoomSpin` with token invalidation), sticky bar
   (no CTA → "Claim N FREE →" → "Add to cart"), toast + progress strip (see below).
7. **Checkout** — idle → guard ("N free left") → `guardPassed` → `adding` → success (adds new
   `_bb` lines FIRST, then zeroes the old bundle's lines; clears everything) | error. On phones
   success closes the tray and opens the theme cart drawer (`openCartDrawer()`), falling back to
   a toast.
8. **Cart sync** — `readCartView()` from `/cart.js`; piggybacks every `/cart/(add|change|update)`
   fetch on the page, plus `pageshow`/`visibilitychange`. Only `product_type === "Bottle Wrap"`,
   non-tester, ≥$4/unit lines count.
9. **Minis** — `minisQty` per handle; affinity-ranked against the bundle's tag profile;
   `minisSig` memo avoids grid rebuilds that would dump the scroll position.
10. **Persistence** — localStorage: `bbBundle` (resume), `bbStage`/`bbStageSize` (site-wide
    bridge), `bbFaves` (favorites, cross-tab).

## The mobile feedback layer (added 2026-11)

The tray is collapsed on phones, so everything that rendered inside it was invisible: `flash()`
messages, the spend meter, the add-to-cart confirmation. The layer (all created by the script,
styles in the section):

- **`toast(m)`** — `flash()` mirrors to a toast above the sticky bar when the tray is closed.
- **`.bb-bb-barprog`** — 3px progress strip on the bar: spend ÷ next tier.
- **Bar sub-copy** — "$X to N FREE" pre-tier, "n / N free picked", "N FREE included ✓".
- **Unlock pulse + toast** whenever `freeCount()` rises (desktop keeps its goal-only confetti).
- **Layout fit** — the 4-pill bottle row measured 453px and forced phones to lay out ~470px wide
  (everything ~17% small). Compact pills + row scroll cap it; the page now fits exactly.

**Earned = claimable (Nov 2026, Shaun's call).** By default no tier is chosen (`goalChosen()` =
`userSized||urlSized` false), and `claimableLeft()` opens free picks at EACH earned tier — the
bar/CTA/meter/grid all agree. An explicitly chosen tier (tile, `?size=`, PDP picker) restores
goal-gating as a deliberate aspiration. The checkout guard's "Add my free wraps" is claim-only
(`fillSmart(true)`) — it adds exactly the promised wraps, never a paid top-up. All claim gates go
through `claimableLeft()`; never compare `free.length` to `freeCount()` directly in new code.

**Claim phase (Nov 2026).** The sticky bar shows ONE message at a time, always with the GOAL
tier's numbers (it used to count to the next tier — "2 FREE" while the tray said 5): pre-goal
"$X to N FREE", post-goal the CTA alone carries claim/add state, and the unlock toast fires only
when the chosen goal is reached. While free picks are unclaimed (`claiming()`), mini sets grey
out in the grid with a banner — the label designer's unavailable-option pattern — because the
checkout function zeroes only single wraps ($4–8 band, any bottle incl. wine). If free picks
ever extend to minis by value, both `claiming()` here AND
`~/beau-bottles-functions/extensions/bb-free-wraps/shared/ladder.js` (freeCandidates band +
pickFreeUnits count-validation → pick-cost validation) must change together, then the function
redeployed — never ship one side alone.

**Redesign skin (Nov 2026).** The final `<style>` block is the site-standard override layer
(Playfair Display + Jost, navy `#1B2440` on cream `#FFFDF8`, hairline `#E6E1D6`, square corners,
pastel accents; per the BeauBottles homepage-redesign canvas). It restyles only — the palette and
fonts flow through the CSS vars on `.bb-bb` (`--ink/--muted/--line/--baseFont/--titleFont`…), so a
future reskin is again one block. Keep new CSS inside it; never reintroduce per-element colors.

Dead code, kept deliberately (documented > deleted): `nudge()`, `tickPrice()`, `moreBtn`
(always hidden), the `SETS`/`applySet` machinery (gift-set rail removed 2026-09, `?preset=`
still degrades gracefully).

## Checking your work — the harness

`tools/bb-harness/` runs the **real production markup and the live script** offline:
`build_harness.py` extracts the section from a captured page + the script from the theme liquid,
swaps in synthetic fixtures (40 prosecco / 12 champagne / 6 wine singles at $7.95, mini 6-packs
at $28.95, deterministic), and stubs `/collections`, `/products`, `/cart*` endpoints.

```
cd tools/bb-harness
python3 build_harness.py            # re-extract after editing the liquid
python3 -m http.server 8123 &
node bb-test.mjs                    # baseline behavior
node bb-test.mjs after              # + feedback-layer assertions
node probe-fit.mjs                  # no horizontal overflow at 390px; desktop untouched
```

20 mobile checks + fit + desktop sanity. Run all three after any change to the section.
The point of the harness: this section talks to live Shopify endpoints, so it was never testable
before — treat a red harness as a blocked ship.
