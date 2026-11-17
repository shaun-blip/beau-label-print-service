# The designer's state machines

Everything the designer shows is derived from one plain object: `state` (top of `js/06-app.js`).
There is no framework. The rules below are the whole contract.

## The one rule for changing anything

**Event handlers mutate `state` and call `changed()`. Nothing else.**

`changed()` → `render()` → `syncDerived()`, which re-runs any panel builder whose declared state
changed since the last render. The registry is `UI_DEPS` in `js/06-app.js`, right above `render()`:
each line is `[builder, () => the state it draws]`. **If you make a builder show a new piece of
state, add that state to its line.** That is the entire dependency bookkeeping. (This generalizes
the `wrapKey` memo that already drove `buildWraps`; wraps still use their own memo inside
`render()` because loading them is async in the Shopify theme.)

`resetDerived()` empties the memo; `applyDesign()` (restoring a saved design) uses it to force a
full rebuild. One-time builders that draw no state (`buildFields`, `buildHow`) run once at startup.

## The machines

1. **Wording path** — `want` ("ready"/"custom", the customer's wish) × `hasReady` (does this
   occasion have sayings?) → `path`. Resolved only in `applyOccasion()` (07). Drives
   `sec-ready`/`sec-words`.
2. **Custom-words mode** — `mode`: `same` | `mix` | `names`. `mix` carries `mixAll` ×
   `scopePicked` (the "should sheets match?" question, `needScope()`); `names` carries
   `names`/`nameField` and disables that field (`syncFields`).
3. **Ready sayings** — `rocc` (occasion; `"milestone"` is parameterized by `age`), `rmode`
   `one`|`mixed`, `ritem` (one) vs `rcounts` (mixed; cached per `rocc|size|qty|age`), `rnote`.
   The age field shows when `rocc === "milestone"` **or** the design has `number:true`.
4. **Uploads gate** — logo/photo: absent → uploaded (rights unchecked) → rights ticked.
   Uploading auto-switches to a logo/photo design; `screen()` blocks printing until rights are
   ticked. Templates re-rank when presence changes.
5. **Template fit** — `tpl` must stay in `TEMPLATES.filter(available)`. `buildTemplates()` and
   `applyOccasion()` reassign it when the occasion/size/uploads make it unavailable.
   (`buildTemplates` is the one builder that may write state — that is why the registry runs it
   before `buildReady`, which reads `tpl`.)
6. **Approval & output** — `#approve` (checkbox, DOM-held) × `screen()` (the blocking problem
   text) × `#output`. Any `changed()` unchecks approval and hides output: what prints is always
   what was last seen. The ghost "Your name here" shows only while unapproved.
7. **Label size** — `size` → `setSize()` sets the globals `W`, `H`, `S`, `SMALL`. Everything that
   draws reads these, so `buildSizes` is first in the registry. A size change also empties wraps
   (they are size-specific).
8. **Wraps** — `wraps[]` (each `auto`-matched or hand-counted), rebuilt by the `wrapKey` memo in
   `render()`. Kit draws samples; the theme loads real products (`loadWraps`, async, cached per
   collection+size). Bundle tiers derive from the wrap total.
9. **Selection cursor** — `sel` indexes whichever list `labels()` currently yields; it is clamped
   at every use, never trusted.
10. **"Customer touched this" latches** — `edited`, `palEdited`, `tplPicked`, `scopePicked`,
    `nameSkip`: once set, occasion changes stop auto-following words/palette/design.
11. **View** — `view`: `label` | `bottle` | `wrap` (+ `lastWrap`).

## The pipeline (the machine outside the browser)

```
designer-kit/js/*.js  ──build-single-file.py──►  label-print-service/public/designer.html  ──git──►  Render
        │
        └─ hand-port ──►  beau-theme-duplicate/assets/*.js  ──shopify theme push──►  theme #167723139301
```

The kit is the source of truth. The theme's `06-app.js`/`07-print-and-events.js` differ **only** in
the wraps subsystem (real Shopify products vs. samples) and the mini-label `SMALL` guards — keep it
that way: port shared-core changes verbatim, never overwrite those files wholesale, and after a port
`diff` kit vs. theme should show only those two areas.

## Checking your work

`designer-kit/tools/` tests (puppeteer-core + system Chrome against `designer-kit/designer.html`;
point the import at any puppeteer-core install and run with `node`):
- **interact.mjs** — drives the real UI step by step and checks the invariants of machines 1-7
  after every step (chips pressed match state, panels shown match the rules, `alert` equals
  `screen()`, fields disabled match zones).
- **smoke.mjs** — renders all 414 templates, fails on errors or empty labels.

Run both after any change to state handling. A new machine or a new panel should gain an invariant.
