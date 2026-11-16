# Label designer: start here

This folder is the BeauBottles label designer split into small files so an AI coding session can work on it.
It behaves exactly like the original one-file prototype.

## Rules for the coding session

1. **Never open anything in `assets/` or `fonts/`.** They are 132 image files and 4 font files. Refer to them by name only.
2. **Never open or paste the one-file `index.html` or `designer.html` from the print service.** Each is over 5 MB and will overflow the prompt.
3. Read files only as you need them. Do not read every script file up front.
4. Keep the drawing code unchanged, so printed sheets match what customers see.

## What is where

| File | What it holds | Size |
| --- | --- | --- |
| `designer.html` | Page markup, and one `<image>` line per piece of artwork | 56 KB |
| `designer.css` | All styles | 17 KB |
| `designer-fonts.css` | The four embedded lettering fonts | under 1 KB |
| `js/01-setup-and-wording.js` | Label sizes, lettering styles, occasions, ready-made sayings, store collections | 50 KB |
| `js/02-drawing.js` | Drawing helpers, the bottle and wrap preview, colors and palettes, painted florals | 42 KB |
| `js/03-designs-classic.js` | The classic design library (TEMPLATES) | 30 KB |
| `js/04-designs-occasion.js` | Occasion icons (IC), layouts (LAYOUTS) and the occasion designs (THEMES) | 65 KB |
| `js/05-designs-holiday-photo.js` | Clipart holiday designs, Pink Santa, tartan, ribbon frame, Black Bow Bubbly, photo designs | 28 KB |
| `js/06-app.js` | App state, building the controls, render() | 35 KB |
| `js/07-print-and-events.js` | exportDesign / applyDesign / printPages, print sheets, event handlers, start-up | 22 KB |
| `SHOPIFY_HANDOFF.md` | The build brief: what to build in the theme and how it talks to the print service | 12 KB |
| `tools/build-single-file.py` | Rebuilds the one-file designer the print service needs | 2 KB |

The seven script files are plain scripts loaded in order, sharing one global scope. Keep that order.

`designer.html` has one very long line (the site logo, about 30 KB). Skip it.

## For the Shopify build, read in this order

1. This file
2. `SHOPIFY_HANDOFF.md` (start with section 0)
3. `js/07-print-and-events.js`, the part headed "hand-off to the store" (`exportDesign`, `applyDesign`, `printPages`)
4. `js/06-app.js` only where you need to change a control or the order step
5. `designer.html` for the markup you are moving into the theme

Most of the build never needs files 01 to 05.

## Keeping the print service in step

The print service draws PDFs with its own one-file copy of the designer. After any change here, run:

```
python3 tools/build-single-file.py ../label-print-service/public/designer.html
```

then commit and push the print service, so prints match the storefront.
