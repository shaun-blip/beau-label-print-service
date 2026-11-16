# Connecting the "Add a matching wrap" step to real products

In the kit this step shows three stand-in wraps (`WRAPS` in `js/01-setup-and-wording.js`, drawn by `buildWraps()` in `js/06-app.js`). This brief replaces them with real products.

## What the store already has (checked 16 Nov 2026 on the public storefront)

- Every wrap is a product of type "Bottle Wrap" with a single variant ("Default Title").
- Bottle size is on every product as a tag: `fits-champagne-750`, `fits-prosecco-750`, `fits-mini-187`.
- Other useful tags: `occasion-*`, `color-*`, `style-*`, `motif-*`.
- The designer already maps each occasion to a collection handle (`COLL`, `COLL_SUB`, `COLL_GROUP`), with the size collections as the fallback.

## Decided by Shaun, 16 Nov 2026

- **Order:** best sellers from each collection.
- **Bundles:** the note stays (restored later on 16 Nov, see CHANGES-2026-11-16b.md). It names the tiers and says free wraps are chosen in the cart. The page does not add free wraps itself.
- **Minis:** sold as separate products in 3-packs and 6-packs. On the storefront the title ends "(Set of 3)" at $14.48 or "(6-Pack)" at $28.95. Champagne and prosecco wraps are single wraps at $7.95.

## Build

1. **Load products.** When the occasion or bottle size changes, fetch the matched collection (`collNow()` gives it) in best-selling order. `/collections/{handle}/products.json` returns the collection's own sort order and ignores `sort_by`, so either render a small Liquid section with `sort_by=best-selling` through the Section Rendering API and read products from it, or set each collection's default sort to Best selling in the admin and use `products.json?limit=250`. Cache per handle.
2. **Filter.** Keep products whose tags include the size tag for the chosen bottle (champagne → `fits-champagne-750`, prosecco → `fits-prosecco-750`, mini → `fits-mini-187`) and whose variant is `available`. If fewer than three remain, top up from the size collection.
3. **Pack size.** Read it from the product title: "(6-Pack)", "(Set of 6)" or "Six-Pack" → 6, "(Set of 3)" or "3-Pack" → 3, otherwise 1. Both "(6-Pack)" and "(Set of 6)" are in use on the store. Store it on the wrap entry as `pack`. Replace the kit's `wrapUnit()` (which assumes every mini wrap is a six-pack) with the chosen product's own `pack`, and replace `wrapEach()` with the product's own price.
4. **Cards.** Show every product that passes the filter, best sellers first, in the one swipe row (see CHANGES-2026-11-16b.md). No "show more" button and no cap. Replace the stand-in name, price and drawing with the product title, the variant price and the first product image. For minis show the pack size on the card ("3-pack" / "6-pack"). Keep the plus/minus stepper and "Match my labels": the matched quantity is `ceil(labels / pack)` for that product, and the summary line should say how many bottles that covers.
5. **State.** `state.wraps` entries become `{id: variantId, handle, title, price, pack, n, auto}`. `exportDesign()` already carries `wraps`; the print service ignores them.
6. **Cart.** Add the wrap lines in the same `/cart/add.js` call as the label sheet: `{id: variantId, quantity}` for each chosen wrap.
7. **Show the chosen wrap in the preview.** When the customer adds a wrap, or taps a wrap card, call `showWrap({image: product.images[0].src + "&width=900", title: product.title})`. The big preview switches to "In a wrap" and shows that wrap with their label in the window. It resolves to `false` when the photo can't be used (first photo not on white); the sample wrap stays, so no extra handling is needed. When the last wrap is removed, call `showWrap(null)`. The image must come from `cdn.shopify.com` (it allows the cross-origin read the function needs); do not proxy or rehost it.
8. **Changing bottle.** The designer now empties `state.wraps` and shows a note when the bottle size changes. Keep that: wraps are size-specific. Reload the wrap cards for the new size.
9. **After add to cart.** One trip through the designer is one label design: one cart line for the sheet, plus lines for its wraps. Customers can make several different labels in one visit. After a successful add, show a short confirmation with two buttons, "Design another label" and "Go to cart". "Design another label" keeps the page as it is but empties `state.wraps` and unticks the approval box, so the next add doesn't repeat the wraps. Each add creates its own `_design_id`.
