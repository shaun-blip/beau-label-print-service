// Reproduce the 998MB prosecco batch locally: render the real queued designs as a gang
// and report the PDF size, then each design solo for comparison.
import { renderGang, renderDesign } from "../src/render.js";
import fs from "node:fs";

const dir = "/private/tmp/claude-501/-Users-shaunwork/adb771d5-ae2a-4865-ae50-fabe7b926e2e/scratchpad";
const load = id => JSON.parse(fs.readFileSync(`${dir}/designs-${id}.json`, "utf8"));

const q = [
  { id: "d_e_KDwnpm6DLZ", order: "#70042", times: 1 },
  { id: "d_-StNr-OfRDug", order: "#70044", times: 1 },
  { id: "d_Z28Vlk8SkYBd", order: "#70046", times: 1 },   // single:4 -> 4 pieces
  { id: "d_1iZok_6Zs52W", order: "#70095", times: 1 },
];
const items = q.map(e => ({ design: load(e.id), tag: `Order ${e.order}` }));

for (const e of q) {
  const out = await renderDesign(load(e.id));
  console.log(`solo ${e.id} (${load(e.id).tpl}): ${(out.pdf.length / 1e6).toFixed(1)} MB, ${out.pages} page(s)`);
}
const out = await renderGang(items);
fs.writeFileSync(`${dir}/gang-prosecco-local.pdf`, out.pdf);
console.log(`GANG: ${(out.pdf.length / 1e6).toFixed(1)} MB, ${out.sheets} pages -> ${dir}/gang-prosecco-local.pdf`);
process.exit(0);
