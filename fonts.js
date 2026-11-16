// The lettering fonts, bundled with the service so PDFs never depend on reaching Google Fonts at print time.
// Each font comes from its @fontsource package. Four more (Thesignature, Brittany Signature, Always Classy, Loverine)
// are already embedded inside designer.html.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const FAMILIES = {
  "Caveat": "caveat", "Cinzel": "cinzel", "Cormorant Garamond": "cormorant-garamond", "Fredoka": "fredoka", "Great Vibes": "great-vibes",
  "Jost": "jost", "Lora": "lora", "Montserrat": "montserrat", "Nunito": "nunito", "Pacifico": "pacifico", "Pinyon Script": "pinyon-script",
  "Playfair Display": "playfair-display", "Sacramento": "sacramento", "Ms Madi": "ms-madi", "Whisper": "whisper",
  "Roboto Slab": "roboto-slab", "Courier Prime": "courier-prime"
};
export function fontCss() {
  let css = "", missing = [];
  for (const [family, pkg] of Object.entries(FAMILIES)) {
    const dir = path.resolve("node_modules/@fontsource", pkg, "files");
    let files = [];
    try { files = fs.readdirSync(dir).filter(f => new RegExp(`^${pkg}-latin-\\d+-(normal|italic)\\.woff2$`).test(f)); } catch {}
    if (!files.length) { missing.push(family); continue; }
    for (const f of files) {
      const [, weight, style] = f.match(/latin-(\d+)-(normal|italic)\.woff2$/);
      css += `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};font-display:block;src:url('${pathToFileURL(path.join(dir, f)).href}') format('woff2');}\n`;
    }
  }
  return { css, missing };
}
