# BeauBottles Custom Label Designer: Shopify build brief

This brief is for the Claude session in VS Code that is connected to the BeauBottles Shopify store. It describes a working prototype (`index.html`, attached) and what has to be built to make it a live product.

Read `index.html` before starting. It is one self-contained file: markup, styles and script together, about 2.3 MB (most of that is embedded fonts and three picture designs).

## 0. Update: the print service is already written

A working outside program now exists in the `label-print-service` folder (see its README). It covers 3.4, 3.5 and 3.6 below: saving designs, the `orders/paid` webhook, PDF making and attaching the PDF to the Shopify order. It is meant to run on Render.

- The designer now has three hand-off functions: `exportDesign()` (everything needed to redraw the order, plus `problem` and `summary`), `applyDesign(d)` (restores it) and `printPages()` (one standalone SVG per distinct sheet).
- PDF making is tested locally. **`src/shopify.js` has never run against a real store** and Render deployment is untested: check both first.
- `label-print-service/public/designer.html` must be replaced with the current designer file whenever the designer changes.
- What is left for the theme side: 3.1, 3.2, 3.3, 3.7, 3.8.

Later changes to keep in mind (13 Nov 2026):

- **Label and sheet sizes are final.** They come from the OnlineLabels templates: OL550 (champagne, 4.25 x 2.75 in, 8 per sheet), OL474 (prosecco, 2.83 x 3.09 in, 9), OL6167 (mini, 1.9375 x 2.0938 in, 16), all on letter sheets. Where this brief mentions 11 x 17 sheets or 4 x 3 / 3 x 3 / 2 x 1.75 labels, that is out of date.
- **Shopify sign-in.** New Shopify apps are made in the Dev Dashboard and use a Client ID and Client secret (client credentials grant, 24-hour tokens). `src/shopify.js` handles this through `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET`; a pre-2026 permanent token still works through `SHOPIFY_ADMIN_TOKEN`.
- **Two copies of the artwork.** The designer file carries about 3 MB of embedded artwork (holiday clipart, bottle photos, tartan, frames). On the storefront these should become separate, compressed image files. The print service must keep the full-size copies in its own `public/designer.html`, or watercolor art will print soft.
- **About 290 designs now**, including picture designs, fixed-lettering designs and photo designs. The designer marks what each design cannot change (`tint.lock`, missing `zones.main`); keep that behavior.
- **Name or note** has its own step ("Make it yours") with an on-screen-only prompt on the preview. The prompt never reaches `exportDesign()` or the print sheets.
- **Hand-off functions** in the designer: `exportDesign()`, `applyDesign(d)`, `printPages()`. The storefront only needs `exportDesign()`.

## 1. What the prototype does

A customer designs a sheet of bottle labels in 8 steps:

1. Bottle size: champagne 4 x 3 in, prosecco 3 x 3 in, mini 2 x 1.75 in
2. Number of sheets (8, 9 and 16 labels per sheet)
3. Occasion (78 occasions in 10 groups)
4. Design (217 designs: 183 occasion designs built from an icon library, 12 classics, Christmas designs, 3 picture designs, logo and photo designs)
5. Wording: ready-made sayings (about 750, plus generated birthday-age sayings) or the customer's own words
6. Colors (26 palettes, own color, light or dark)
7. Lettering (20 styles)
8. Matching wrap upsell

Then the customer checks every label, ticks an approval box and orders. The prototype ends by drawing the print sheets and an order ticket on the page. Nothing is sent anywhere yet.

## 2. Where things are in the code

| Thing | Name in `index.html` |
|---|---|
| All customer choices | `state` object |
| Label sizes and sheet layouts | `SIZES` |
| Occasions and starter wording | `GROUPS` |
| Ready-made sayings | `READY`, `CHEEKY`, `ageItems(n)`, `SUB_READY` (occasion to saying list) |
| Designs | `TEMPLATES`, `THEMES`, `LAYOUTS`, `IC` (icons) |
| Palettes | `PALETTES`, `resolvePalette`, `customPalette` |
| Lettering | `FONT_STYLES` |
| One label as SVG | `labelMarkup(template, colors, words)` then `fit(svg)` |
| The list of labels on the order | `labels()` |
| Order checks (blank labels, blocked words, permissions) | `screen()` |
| Print sheets and ticket | `makeSheets()`, `printFile()` |
| Wrap upsell | `buildWraps()`, `COLL`, `COLL_SUB`, `COLL_GROUP` |

`labelMarkup` plus `fit` is the single source of truth for what prints. The server must render labels with the same code, not a re-implementation.

## 3. Target architecture

### 3.1 Product
- One product, "Custom Label Sheet", with three variants: Champagne, Prosecco, Mini.
- Quantity on the cart line is the number of sheets.
- Prices per sheet: TO BE CONFIRMED by Shaun.

### 3.2 Theme
- Add the designer as a section (or app block) on a dedicated product template for this product.
- Keep the designer's own layout; restyle only where the theme's header, footer and fonts take over. The prototype's header and footer are stand-ins and should be removed.
- Replace the prototype's "Place sample order" button with Add to cart.
- Check how the live theme adds to cart (form post or background request) and hook into that, so the cart drawer or cart page updates the way it does for other products.

### 3.3 What goes on the cart line
Use line item properties. Two kinds:

Visible to customer and staff:
- Occasion, Design, Lettering, Colors
- Wording summary (single saying, or "Mix: 2 x ..., 1 x ...", or "18 different labels")
- Added name line, if any

Hidden (prefix with underscore):
- `_design_id`: ID of the saved design (see 3.4)
- `_proof_url`: link to a proof image, if one is generated at add-to-cart

Do not put the full design in properties. A mixed order can hold dozens of labels and will exceed sensible limits.

### 3.4 Saving the design
At Add to cart, save the design server-side and get back an ID:
- The design is the relevant part of `state`: size, qty, group, sub, tpl, pal or custom color, dark, font, path, rocc, ritem, rmode, rcounts, age, rnote, words, mode, mix, mixAll, names, nameField.
- Uploaded logo or photo: upload the file, store its URL in the design. The prototype holds these as in-browser blob URLs (`state.logo`, `state.photo`), which do not survive the page.
- Store designs somewhere durable: the app's own database, or Shopify metaobjects.

### 3.5 After payment
- Subscribe to the paid-order event.
- For each custom label line: load the design by `_design_id`, render every sheet, produce a print-ready PDF.
- Attach the PDF link to the order (order metafield and a staff-visible note) and deliver it wherever the team wants it. WHERE TO DELIVER: TO BE CONFIRMED (order page, email, shared folder).
- Make this idempotent: the event can arrive more than once.

### 3.6 Making the PDF
- Render with a headless browser running the same `labelMarkup` and `fit` code, then print to PDF at the exact sheet size. This keeps fonts and fitting identical to what the customer approved.
- Fonts must be embedded. The prototype's print file only names its fonts.
- Sheet layouts in `SIZES` are PLACEHOLDERS (11 x 17 for champagne and prosecco, letter landscape for mini). Shaun will supply the real label templates. Replace `sw`, `sh`, `cols`, `rows`, `left`, `top`, `gx`, `gy`, `rx` with the real numbers. Units are hundredths of an inch.
- Produce a plain-paper alignment test sheet for each size before going live.

### 3.7 Wrap upsell
- Replace the three stand-in wraps with real products from the matched collection, in best-selling order, filtered to the chosen bottle size.
- Collection matching is in `COLL`, `COLL_SUB`, `COLL_GROUP`. Occasions without a collection fall back to the size collection (Champagne Wraps, Prosecco Wraps, Mini Wraps).
- "Add N" adds one wrap per label. Minis are sold in six-packs, so the count is packs.
- Use real product photos in the wrap cards and, if practical, in the "In a wrap" preview.

### 3.8 Bundle tiers
The wrap step shows a note with the tiers ($39 for 2 free wraps, $79 for 5, $119 for 10) and says free wraps are chosen in the cart. The cart handles the free wraps; do not add bundle logic to this page.

## 4. Things the prototype fakes that must become real

1. Ordering: no cart, no payment. Build per section 3.
2. Wraps: stand-in pictures and names.
3. Bottle photos: drawn bottles. Shaun will supply photos (plain and wrapped, all three sizes).
4. Sheet layouts: placeholders, see 3.6.
5. Word screening: `BLOCK_BRANDS` and `BLOCK_WORDS` are short starter lists. Expand them, and re-run the screen on the server; never trust the browser's check.
6. Uploads: validate type and size on the server. The prototype does not handle HEIC photos.
7. Prices: none shown for labels.

## 5. Must fix before launch

- **Font licences.** Three embedded fonts are personal-use files: Brittany Signature, Always Classy, Loverine. Buy commercial licences or remove those three styles from `FONT_STYLES`. "Thesignature" is free for commercial use.
- **Customer artwork.** The logo and photo paths ask the customer to confirm permission. Keep that tick box and store the confirmation with the order.
- **Picture designs.** "Heirloom Tree", "Winter Garland" and "Party Lights" use artwork Shaun generated. Heirloom Tree is champagne-only.
- **Page weight.** Move the embedded fonts and picture designs out of the page into theme assets so the page loads faster.

## 6. Decisions still open (ask Shaun)

1. Price per sheet for each size.
2. Where print files should be delivered.
3. Real label templates for the three sheets (product numbers or measurements).
4. Printer type, inkjet or laser, which affects the glossy stock choice.
5. How the bundle tiers are implemented today.
6. Whether customers get an emailed proof.

## 7. Acceptance checks

Run these on the live theme before launch. The prototype passes all of them.

- Every occasion shows sayings and at least two designs of its own, and starts on one of its own designs.
- Every saying fits every design offered for its occasion, at all three sizes, with and without an added name.
- All 20 lettering styles change the main line on every design.
- Text is readable on all 26 palettes, light and dark, and on extreme custom colors.
- Mixed sheet: order is blocked until the count matches the sheet total.
- "Every sheet different": N sheets gives N times per-sheet editable labels.
- Name list: one label per name; blocked when empty or over the limit.
- Brand names and blocked words stop the order, including in the added name line.
- Logo and photo designs require the permission tick.
- Wrap count follows the number of labels; minis count in six-packs.
- Phone: no sideways scrolling at 320 px; the preview stays hidden until a design is chosen; the text cursor shows when typing.
- The PDF the team prints matches the approved proof exactly, and lines up with the label stock.

## 8. Suggested order of work

1. Create the product and variants. Put the designer on its product page, unchanged, and confirm it runs inside the theme.
2. Wire Add to cart with visible properties only. Place a test order.
3. Add design saving and uploads.
4. Add the paid-order handler and PDF generation. Test-print on plain paper.
5. Swap in real wraps, bottle photos and sheet templates.
6. Bundle exclusion, word-screen expansion, font licences, page weight.
7. Run section 7 on a phone and a desktop, then launch.
