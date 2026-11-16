/* ---------- a real wrap in the preview ----------
   showWrap({image, title}) puts a store wrap photo in the "In a wrap" preview with the customer's label on it.
   showWrap(null) goes back to the sample wrap. It resolves to true when the photo was used.
   It relies on the store's main product photo being shot the same way for every wrap: one bottle, upright, centred, on white.
   The label then sits in the same place as on our own sample photo of that bottle size. A photo that isn't like that is refused and the sample stays. */
let wrapShotCall = 0;
async function showWrap(w){
  const call = ++wrapShotCall, size = state.size, g = BOT[size + "w"];
  const off = () => { wrapShot = null; if (state.lastWrap === "shot") state.lastWrap = "stripe"; buildViews(); render(); return false; };
  if (!w || !w.image || !g) return off();
  try {
    const im = new Image(); im.crossOrigin = "anonymous"; im.src = w.image; await im.decode();
    if (call !== wrapShotCall) return false;
    const k = Math.min(1, 900 / Math.max(im.naturalWidth, im.naturalHeight)), cw = Math.round(im.naturalWidth * k), ch = Math.round(im.naturalHeight * k);
    const c = document.createElement("canvas"); c.width = cw; c.height = ch;
    const x = c.getContext("2d", {willReadFrequently:true}); x.drawImage(im, 0, 0, cw, ch);
    const img = x.getImageData(0, 0, cw, ch), d = img.data, white = p => d[p * 4] > 232 && d[p * 4 + 1] > 232 && d[p * 4 + 2] > 232;
    if (![0, cw - 1, (ch - 1) * cw, ch * cw - 1].every(white)) return off();   // not shot on white
    // clear the white around the bottle, working in from the edges so white inside the wrap stays
    const seen = new Uint8Array(cw * ch), q = [], push = p => { if (!seen[p] && white(p)){ seen[p] = 1; q.push(p); } };
    for (let i = 0; i < cw; i++){ push(i); push((ch - 1) * cw + i); }
    for (let j = 0; j < ch; j++){ push(j * cw); push(j * cw + cw - 1); }
    while (q.length){ const p = q.pop(), px = p % cw; d[p * 4 + 3] = 0; if (px) push(p - 1); if (px < cw - 1) push(p + 1); if (p >= cw) push(p - cw); if (p < cw * (ch - 1)) push(p + cw); }
    // find the bottle: its sides and its top. The height comes from the known shape, so a shadow under the bottle doesn't matter.
    const col = new Uint32Array(cw), row = new Uint32Array(ch);
    for (let p = 0; p < cw * ch; p++) if (!seen[p]){ col[p % cw]++; row[(p / cw) | 0]++; }
    let l = 0, r = cw - 1, t = 0;
    while (l < cw && col[l] < ch * .04) l++;
    while (r > l && col[r] < ch * .04) r--;
    while (t < ch && row[t] < 3) t++;
    const bw = r - l + 1, bh = Math.min(ch - t, Math.round(bw * g.h / g.w));
    if (bw < cw * .1 || bw > cw * .6 || bh < bw * 2) return off();
    { let b = ch - 1; while (b > t && row[b] < bw * .3) b--;            // where the bottle really ends
      if (Math.abs(t + bh - b) > ch * .04) return off(); }               // not the bottle shape we know for this size, so the label would sit in the wrong place
    x.putImageData(img, 0, 0);
    const o = document.createElement("canvas"); o.width = bw; o.height = bh; o.getContext("2d").drawImage(c, l, t, bw, bh, 0, 0, bw, bh);
    let el = document.getElementById("bot-shot");
    if (!el){ el = document.createElementNS("http://www.w3.org/2000/svg", "image"); el.id = "bot-shot"; el.setAttribute("preserveAspectRatio", "none"); document.getElementById("bot-" + size + "w").parentNode.appendChild(el); }
    el.setAttribute("width", g.w); el.setAttribute("height", g.h); el.setAttribute("href", o.toDataURL("image/webp", .9));
    BOT.shot = {...g};
    wrapShot = {size, title:w.title || "Your wrap"}; state.lastWrap = "shot"; state.view = "wrap";
    buildViews(); render(); return true;
  } catch (e){ return off(); }
}
/* ---------- hand-off to the store: save a design, restore it, and lay out its print pages ----------
   exportDesign() is what the storefront sends when the customer adds to cart.
   applyDesign() and printPages() are what the print service runs after the order is paid. */
const DESIGN_KEYS = ["size","qty","group","sub","tpl","pal","custom","dark","font","path","want","rocc","ritem","rmode","rcounts","age","rnote","words","mode","mix","mixAll","names","nameField","photoPos","wraps"];
function exportDesign(){
  const d = {v:1};
  DESIGN_KEYS.forEach(k => d[k] = JSON.parse(JSON.stringify(state[k])));
  const pic = p => p ? {data:p.data, name:p.name, w:p.w, h:p.h, vector:!!p.vector, small:!!p.small} : null;
  d.logo = pic(state.logo); d.photo = pic(state.photo);
  d.problem = screen() || "";
  makeSheets();
  const dt = [...document.querySelectorAll("#ticket dt")], dd = [...document.querySelectorAll("#ticket dd")];
  d.summary = Object.fromEntries(dt.map((x, i) => [x.textContent, dd[i].textContent]).filter(x => !["Order", "Proof"].includes(x[0])));
  $("output").hidden = true;
  return d;
}
function applyDesign(d){
  DESIGN_KEYS.forEach(k => { if (k in d) state[k] = JSON.parse(JSON.stringify(d[k])); });
  state.logo = d.logo ? {...d.logo, url:d.logo.data} : null; state.rights = !!d.logo;
  state.photo = d.photo ? {...d.photo, url:d.photo.data} : null; state.prights = !!d.photo;
  setSize(sizeNow()); Object.assign(F, fontNow().f);
  state.occKey = groupNow().subs[state.sub][0]; state.hasReady = !!SUB_READY[state.occKey];
  state.tplPicked = true; state.palEdited = true; state.edited = true; state.scopePicked = true; state.sel = 0;
  buildSizes(); buildQty(); buildPath(); buildReady(); buildOccasions(); buildTemplates(); buildSwatches(); buildFonts(); buildModes(); buildLogo(); buildPhoto(); buildWraps();
  $("rnote").value = state.rnote; $("age").value = state.age;
  $("stage").classList.remove("idle"); render();
}
// One standalone SVG per distinct sheet, with cut guides removed. copies is how many times to print the set.
function printPages(){
  makeSheets();
  const sz = sizeNow(), sheets = [...$("sheets").querySelectorAll("svg.sheet")], per = perSheet(), list = labels();
  const repeats = namesMode() || list.length > per ? 1 : state.qty;
  const pages = sheets.map(p => {
    const clone = p.cloneNode(true);
    clone.querySelectorAll(".guide").forEach(g => g.remove());
    let body = clone.innerHTML;
    const arts = [...new Set(body.match(/#(?:art|xm)-[\w-]+/g) || [])].map(x => x.slice(1));
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${sz.sw / 100}in" height="${sz.sh / 100}in" viewBox="0 0 ${sz.sw} ${sz.sh}"><defs>${WC_DEFS}${arts.map(id => $(id) ? $(id).outerHTML : "").join("")}</defs>${body}</svg>`;
  });
  $("output").hidden = true;
  return {widthIn:sz.sw / 100, heightIn:sz.sh / 100, copies:repeats, labelsPerSheet:per, pages, problem:screen() || ""};
}
const GHOST = "Your name here";
function markGhost(svg){
  svg.querySelectorAll("text").forEach(el => {
    if (!el.textContent.toLowerCase().includes(GHOST.toLowerCase())) return;
    if (el.closest('g[id^="lab"]')){ el.setAttribute("opacity", ".5"); return; }   // on a bottle the label is drawn in strips, where the dashed frame can't be measured: fade the words only
    const b = el.getBBox(), pad = b.height * .35, r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", b.x - pad * 1.6); r.setAttribute("y", b.y - pad * .5); r.setAttribute("width", b.width + pad * 3.2); r.setAttribute("height", b.height + pad);
    r.setAttribute("rx", pad * .6); r.setAttribute("fill", "none"); r.setAttribute("stroke", el.getAttribute("fill")); r.setAttribute("stroke-width", Math.max(.6, b.height * .05));
    r.setAttribute("stroke-dasharray", `${(b.height * .28).toFixed(1)} ${(b.height * .22).toFixed(1)}`); r.setAttribute("opacity", ".55");
    el.setAttribute("opacity", ".5"); el.parentNode.insertBefore(r, el);
  });
}
function changed(){
  $("approve").checked = false;
  $("output").hidden = true;
  render();
}

/* ---------- print sheets ---------- */
function makeSheets(){
  const t = tplById(state.tpl), c = colors(), sz = sizeNow(), per = perSheet(), list = labels();
  const pages = [];
  if (namesMode() || list.length > per) for (let i = 0; i < list.length; i += per) pages.push(list.slice(i, i + per));
  else pages.push(list.length > 1 ? list : Array(per).fill(list[0]));
  // Sheet units are 100 per inch. Margins and gaps come from the label stock for each size.
  $("output").hidden = false;   // must be visible before the labels are drawn, or long lines cannot be measured and shrunk to fit
  $("sheets").innerHTML = pages.map((p, n) => `<svg class="sheet" viewBox="0 0 ${sizeNow().sw} ${sizeNow().sh}" role="img" aria-label="Print sheet ${n + 1} of ${pages.length}"></svg>`).join("");
  $("sheets").querySelectorAll("svg.sheet").forEach((svg, n) => {
    let s = `<rect width="${sizeNow().sw}" height="${sizeNow().sh}" fill="#ffffff"/>`;
    const cell = i => [sz.left + (i % sz.cols) * (W + sz.gx), sz.top + Math.floor(i / sz.cols) * (H + sz.gy)];
    const bg = (t.tint ? t.tint(c) : c).bg;
    pages[n].forEach((w, i) => { if (w){ const [x, y] = cell(i); s += `<rect x="${x - BLEED}" y="${y - BLEED}" width="${W + 2 * BLEED}" height="${H + 2 * BLEED}" fill="${bg}"/>`; } });   // bleed first, so no label's bleed covers a neighbor
    for (let r = 0; r < sz.rows; r++) for (let col = 0; col < sz.cols; col++){
      const w = pages[n][r * sz.cols + col], x = sz.left + col * (W + sz.gx), y = sz.top + r * (H + sz.gy);
      if (w) s += `<svg x="${x}" y="${y}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${labelMarkup(t, c, w)}</svg>`;
      s += `<rect class="guide" x="${x}" y="${y}" width="${W}" height="${H}" rx="${sz.rx}"/>`;
    }
    svg.innerHTML = s;
    fit(svg);
  });
  const sheets = namesMode() || list.length > per ? pages.length : state.qty;
  const ready = state.path === "ready", custom = !ready;
  const sub = groupNow().subs[state.sub][0];
  const rows = [
    ["Order", "Sample order"],
    ["Bottle", sz.name],
    ["Occasion", sub],
    ["Design", t.name + " · " + (state.pal < 0 ? "Custom color " + state.custom : PALETTES[state.pal].name) + (state.dark ? " · dark" : "")]
  ];
  if (ready){
    const items = readyNow().items;
    rows.push(["Label", state.rmode === "mixed" ? "Ready-made mix · " + readyCounts().map((k, i) => k ? `${k} × ${items[i][1]}` : "").filter(Boolean).join(", ") : "Ready-made · " + items[state.ritem][1]]);
    if (state.rnote.trim()) rows.push(["Added line", state.rnote.trim()]);
  }
  if (custom && state.mode === "same") FIELDS.filter(f => (state.words[f.id] || "").trim()).forEach(f => rows.push([f.label, state.words[f.id].trim()]));
  if (custom && state.mode === "mix") rows.push(["Labels", state.mixAll ? `${list.length} different labels across ${pages.length} ${pages.length === 1 ? "sheet" : "sheets"}` : `${per} different labels on each sheet`]);
  if (namesMode()) rows.push(["Labels", `${list.length} names, one per label`], ["Names", list.map(w => w[state.nameField]).join(", ")]);
  rows.push(["Lettering", fontNow().name]);
  { const cost = state.wraps.reduce((a, w) => a + wrapQty(w), 0) * wrapEach(), got = [[39, 2], [79, 5], [119, 10]].filter(t => cost >= t[0]).pop();
    if (state.wraps.length) rows.push(["Bundle", got ? `${got[1]} free wraps earned on $${cost.toFixed(2)} of wraps (labels not counted)` : `No tier yet · $${cost.toFixed(2)} of wraps (labels not counted)`]); }
  rows.push(["Wraps added", state.wraps.length ? state.wraps.map(w => `${wrapQty(w)} × ${wrapName(WRAPS.findIndex(x => x.id === w.id))}`).join(", ") + ` · from ${collNow().name}` : "None"]);
  if (photoUsed()) rows.push(["Photo", `${state.photo.name} · ${state.photo.w} × ${state.photo.h} px · customer confirmed permission`]);
  if (logoUsed()) rows.push(["Logo", `${state.logo.name} · ` + (state.logo.vector ? "vector file" : `${state.logo.w} × ${state.logo.h} px`) + " · customer confirmed permission"]);
  rows.push(
    ["Label stock", sz.stock + " · " + sz.label],
    ["Quantity", sheets + (sheets === 1 ? " sheet" : " sheets") + " · " + (namesMode() ? list.length : sheets * per) + " labels"],
    ["Proof", "Approved by customer " + new Date().toLocaleString([], {dateStyle:"medium", timeStyle:"short"})]);
  $("ticket").innerHTML = rows.map(r => `<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join("");
  $("output").hidden = false;
  $("fallback").hidden = true;
  $("output").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start"});
}
function printFile(){
  const pages = [...$("sheets").querySelectorAll("svg.sheet")];
  let body = "";
  pages.forEach((p, i) => {
    const clone = p.cloneNode(true);
    clone.querySelectorAll(".guide").forEach(g => g.remove());
    clone.querySelectorAll("[data-fit]").forEach(el => { el.removeAttribute("data-fit"); el.removeAttribute("data-size"); });
    body += `<g transform="translate(0 ${i * sizeNow().sh})">${clone.innerHTML}</g>`;
  });
  if (state.logo) body = body.split(state.logo.url).join(state.logo.data);
  if (state.photo) body = body.split(state.photo.url).join(state.photo.data);
  { const arts = [...new Set(body.match(/#(?:art|xm)-[\w-]+/g) || [])].map(x => x.slice(1));   // carry any picture artwork into the print file
    body = `<defs>${WC_DEFS}${arts.map(id => $(id) ? $(id).outerHTML : "").join("")}</defs>` + body; }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sizeNow().sw / 100}in" height="${pages.length * sizeNow().sh / 100}in" viewBox="0 0 ${sizeNow().sw} ${pages.length * sizeNow().sh}">${body}</svg>`;
}

/* ---------- events ---------- */
const pick = (id, sel, fn) => $(id).addEventListener("click", e => { const b = e.target.closest(sel); if (b) fn(b); });
const SUB_READY = {"Wedding favors":"wedding","Engagement":"engaged","Bridal shower":"shower","Bachelorette":"bach","Bridesmaid proposal":"party",
  "Groomsman proposal":"groomsmen","Rehearsal dinner":"wedding","Wedding thank-you":"thanks","Anniversary":"anniversary","Vow renewal":"anniversary",
  "Birthday":"birthday","21st":"milestone","30th":"milestone","40th":"milestone","50th":"milestone","60th":"milestone","70th":"milestone","80th":"milestone","90th":"milestone","100th":"milestone","Any age":"milestone",
  "Baby shower":"baby","Pregnancy announcement":"baby","Gender reveal":"baby","New baby":"baby","Baptism":"baby","Adoption":"baby",
  "Christmas":"christmas","Hanukkah":"hanukkah","New Year's":"newyear","Valentine's Day":"valentine","Galentine's":"valentine:5","Easter":"easter",
  "Mother's Day":"moms","Father's Day":"dads","Thanksgiving":"thanksgiving","Friendsgiving":"thanksgiving:4",
  "Graduation":"grad","New job":"congrats","Promotion":"congrats","Retirement":"retire","New home":"home","Fresh start":"congrats","You did it":"congrats",
  "Thank you":"thanks","Hostess":"hostess","Teacher":"teacher","Coach":"coach","Neighbor":"because","Just because":"because","Get well":"getwell","Thinking of you":"because:2",
  "Closing gift":"home","Client thank-you":"client","Employee appreciation":"team","Work anniversary":"team:2","Holiday client gift":"christmas","Dinner party":"hostess",
  "Fourth of July":"july4","Halloween":"halloween","Diwali":"diwali","Lunar New Year":"lunar","St. Patrick's Day":"stpat","Cinco de Mayo":"cinco","Grand opening":"opening","Event favor":"event",
  "Girls' trip":"trip","Reunion":"reunion","Book club":"bookclub","Tailgate":"tailgate","Derby party":"derby","Mardi Gras":"mardigras","Celebration of life":"memorial","Memorial":"memorial",
  "Table bottles":"table","Your occasion":"because","Godparent proposal":"godparent"};
function applyOccasion(){
  const g = groupNow(), s = g.subs[state.sub];
  const m = SUB_READY[s[0]];
  state.hasReady = !!m;
  if (m && state.occKey !== s[0]){ const [id, i] = m.split(":"); state.rocc = id; state.ritem = +i || 0; state.rall = false;
    if (id === "milestone"){ const n = parseInt(s[0], 10); if (n) state.age = n; $("age").value = state.age; } }
  state.occKey = s[0];
  state.path = m && state.want === "ready" ? "ready" : "custom";
  buildPath(); buildReady();
  if (!state.edited){ state.words = subWords(s); state.mix = []; }
  if (!state.palEdited){ const i = PALETTES.findIndex(p => p.name === (s[5] || g.pal)); if (i >= 0){ state.pal = i; state.dark = false; } }
  // a new occasion starts on a design made for it, unless the customer has already chosen a design that still applies
  { const list = TEMPLATES.filter(available), made = list.find(t => (t.themed || (t.subs && !t.groups)) && !t.logo && !t.photo);
    if (!state.tplPicked || !list.some(t => t.id === state.tpl)){ state.tpl = (made || list[0]).id; state.tplPicked = false; } }
  buildOccasions(); buildTemplates(); buildSwatches(); changed();
}
pick("sizes", ".chip", b => {
  if (b.dataset.id !== state.size && state.wraps.length){   // wraps are made for one bottle size, so they can't follow a change of bottle
    const n = state.wraps.reduce((a, w) => a + wrapQty(w), 0), unit = wrapUnit(), from = sizeNow().name.toLowerCase(), to = SIZES.find(z => z.id === b.dataset.id).name.toLowerCase();
    state.wrapsGone = `We took out the ${n} ${from} ${unit > 1 ? "wrap pack" : "wrap"}${n === 1 ? "" : "s"} you picked, because ${from} wraps don't fit ${to} bottles. Pick ${to} wraps under Add a matching wrap.`;
    state.wraps = [];
  }
  if (b.dataset.id !== state.size){ wrapShot = null; wrapShotCall++; if (state.lastWrap === "shot") state.lastWrap = "stripe"; }
  state.size = b.dataset.id; state.sel = 0; buildSizes(); buildReady(); buildTemplates(); buildModes(); buildWraps(); changed();
});
pick("paths", ".chip", b => { state.want = b.dataset.id; state.sel = 0; applyOccasion(); });
$("age").addEventListener("input", e => {
  const n = parseInt(e.target.value, 10), ok = n >= 21 && n <= 110;
  $("agehint").textContent = !e.target.value || ok ? "Type any age from 21 up and the sayings below change to match." : n < 21 ? "Our labels go on champagne and prosecco, so ages start at 21." : "Please enter an age up to 110.";
  if (!ok) return;
  state.age = n; state.sel = 0; buildReady(); changed();
});
$("rmore").addEventListener("click", () => { state.rall = true; buildReady(); render(); });
$("rgrid").addEventListener("click", e => {
  const c = e.target.closest(".cnt");
  if (c){
    const counts = readyCounts(), i = +c.dataset.i, d = +c.dataset.d;
    if (d > 0 && readyTotal() >= readyTarget()) return;
    counts[i] = Math.max(0, counts[i] + d);
    state.sel = 0; buildReady(); changed(); return;
  }
  const b = e.target.closest("button.say");
  if (b){ state.ritem = +b.dataset.i; state.sel = 0; changed(); }
});
pick("rmodes", ".chip", b => { state.rmode = b.dataset.id; state.sel = 0; buildQty(); buildReady(); changed(); });
document.addEventListener("click", e => { if (e.target.id === "showsay"){ state.want = "ready"; state.sel = 0; applyOccasion(); $("hr").scrollIntoView({block:"start"}); } });
document.addEventListener("click", e => { if (e.target.id === "qtydiff"){ state.mixAll = true; state.scopePicked = true; state.qty = Math.min(state.qty, 5); state.sel = 0; syncMix(); buildModes(); changed(); } });
pick("mixscope", ".chip", b => { state.mixAll = b.dataset.id === "all"; state.scopePicked = true; state.sel = 0; syncMix(); buildModes(); changed(); });
$("rnote").addEventListener("input", e => { state.rnote = e.target.value; changed(); });
pick("groups", ".chip", b => { state.group = b.dataset.id; state.sub = 0; state.want = "ready"; applyOccasion(); });
pick("subs", ".chip", b => { state.sub = +b.dataset.id; state.want = "ready"; applyOccasion(); });
pick("templates", ".tpl", b => { state.tpl = b.dataset.id; state.tplPicked = true; changed(); });
pick("swatches", ".sw", b => { state.pal = +b.dataset.i; state.palEdited = true; buildSwatches(); changed(); });
pick("tones", ".chip", b => { state.dark = b.dataset.id === "dark"; state.palEdited = true; buildSwatches(); changed(); });
$("custom").addEventListener("input", e => { state.custom = e.target.value; state.pal = -1; state.palEdited = true; buildSwatches(); changed(); });
pick("modes", ".chip", b => { state.mode = b.dataset.id; state.sel = 0; if (state.mode === "mix") syncMix(); buildModes(); changed(); });
pick("proof", ".pl", b => { state.sel = +b.dataset.i; render(); });
pick("labstrip", "button", b => { state.sel = +b.dataset.i; render(); });
function stepLabel(d){
  const n = labels().length;
  if (d > 0 && state.sel === n - 1){ document.querySelector(".order").scrollIntoView({behavior:"smooth", block:"start"}); return; }
  state.sel = Math.max(0, Math.min(n - 1, state.sel + d)); render();
  const first = document.querySelector("#fields input, #fields textarea");
  if (first){ first.focus({preventScroll:true}); try { first.setSelectionRange(first.value.length, first.value.length); } catch (e) {} }
  $("fields").scrollIntoView({behavior:"smooth", block:"center"});
}
$("labprev").addEventListener("click", () => stepLabel(-1));
$("labnext").addEventListener("click", () => stepLabel(1));
$("names").addEventListener("input", e => { state.names = e.target.value; changed(); });
$("namefield").addEventListener("change", e => { state.nameField = e.target.value; changed(); });
$("copyall").addEventListener("click", () => { syncMix(); const src = {...state.mix[state.sel]}; state.mix = state.mix.map(() => ({...src})); changed(); });
$("logofile").addEventListener("change", e => { if (e.target.files[0]) setLogo(e.target.files[0]); e.target.value = ""; });
$("logoremove").addEventListener("click", () => { if (state.logo) URL.revokeObjectURL(state.logo.url); state.logo = null; state.rights = false; buildLogo(); buildTemplates(); changed(); });
pick("views", ".chip", b => { state.view = b.dataset.id; buildViews(); render(); });
function wrapsChanged(){ $("output").hidden = true; buildViews(); buildWraps(); render(); }
$("wrapcards").addEventListener("scroll", syncWrapNav, {passive:true});
addEventListener("resize", syncWrapNav);
$("wrapprev").addEventListener("click", () => $("wrapcards").scrollBy({left:-$("wrapcards").clientWidth * .9, behavior:"smooth"}));
$("wrapnext").addEventListener("click", () => $("wrapcards").scrollBy({left:$("wrapcards").clientWidth * .9, behavior:"smooth"}));
pick("wrapcards", ".add", b => { state.wrapsGone = ""; state.wraps.push({id:b.dataset.id, auto:true, n:0}); state.lastWrap = b.dataset.id; state.view = "wrap"; wrapsChanged(); });
pick("wrapcards", ".wq", b => {
  const w = state.wraps.find(x => x.id === b.dataset.id), n = wrapQty(w) + +b.dataset.d;
  if (n <= 0) state.wraps = state.wraps.filter(x => x !== w); else { w.auto = false; w.n = Math.min(n, 150); }
  wrapsChanged();
});
pick("wrapcards", ".wm", b => { state.wraps.find(x => x.id === b.dataset.id).auto = true; wrapsChanged(); });
pick("fonts", ".fontopt", b => {
  state.font = b.dataset.id;
  Object.assign(F, fontNow().f);   // artwork that sets its own type follows the style too
  buildFonts(); changed();
  // Lettering files arrive a moment after they are first used, so fit the words again once they have.
  if (document.fonts && document.fonts.ready) setTimeout(() => document.fonts.ready.then(render), 60);
});
$("photofile").addEventListener("change", e => { if (e.target.files[0]) setPhoto(e.target.files[0]); e.target.value = ""; });
$("photoremove").addEventListener("click", () => { if (state.photo) URL.revokeObjectURL(state.photo.url); state.photo = null; state.prights = false; buildPhoto(); buildTemplates(); changed(); });
$("prights").addEventListener("change", e => { state.prights = e.target.checked; changed(); });
pick("photopos", ".chip", b => { state.photoPos = b.dataset.id; buildPhoto(); changed(); });
$("rights").addEventListener("change", e => { state.rights = e.target.checked; changed(); });
$("approve").addEventListener("change", () => render());   // ticking the box drops the "Your name here" prompt, so what they approve is what prints
$("nameadd").addEventListener("click", () => { $("sec-name").scrollIntoView({behavior:"smooth", block:"center"}); setTimeout(() => $("rnote").focus({preventScroll:true}), 350); });
$("nameskip").addEventListener("click", () => { state.nameSkip = true; render(); });
$("make").addEventListener("click", makeSheets);
$("qty").addEventListener("input", e => { state.qty = +e.target.value; });
$("qty").addEventListener("change", e => {
  state.qty = +e.target.value;
  if (spanReady()){ state.sel = 0; buildReady(); changed(); }
  else if (!everySheet()){ buildModes(); render(); if (!$("output").hidden) makeSheets(); }
  else if (everySheet()){ state.sel = Math.min(state.sel, perSheet() * state.qty - 1); syncMix(); buildModes(); changed(); }
  else if (!$("output").hidden) makeSheets();
});
$("copy").addEventListener("click", async () => {
  const file = printFile();
  try {
    await navigator.clipboard.writeText(file);
    $("copied").textContent = "Print file copied. Paste it into a text file saved as .svg to open it.";
  } catch (err) {
    $("fallback").value = file; $("fallback").hidden = false; $("fallback").select();
    $("copied").textContent = "Copying was blocked here. Select the code below and copy it.";
  }
});

buildQty();
const start = () => { if ($("stage").classList.contains("idle")){ $("stage").classList.remove("idle"); render(); } };
// Phone only: the slim preview opens and closes without moving the step the customer is on.
function setPeek(open){
  const stage = $("stage"); if (stage.classList.contains("open") === open) return;
  const ref = document.elementFromPoint(innerWidth / 2, innerHeight * .7), before = ref ? ref.getBoundingClientRect().top : null;
  stage.classList.toggle("open", open); $("peek").setAttribute("aria-expanded", open);
  if (ref && before !== null){ const d = ref.getBoundingClientRect().top - before; if (Math.abs(d) > 1) scrollBy(0, d); }
}
$("frame").addEventListener("click", () => { if (matchMedia("(max-width:879px)").matches) setPeek(!$("stage").classList.contains("open")); });
$("peekclose").addEventListener("click", () => setPeek(false));
const isText = el => el && (el.matches("input[type=text], textarea"));
// Shrinking the pinned preview moves the page under the finger. On phones that can leave the text cursor drawn in the old spot,
// so the change waits until the keyboard has opened, the page is scrolled back by the same amount, and the cursor is placed again.
function setTyping(on, el){
  const stage = $("stage"); if (stage.classList.contains("typing") === on) return;
  const anchor = el || document.activeElement, before = anchor && anchor !== document.body ? anchor.getBoundingClientRect().top : null;
  stage.classList.toggle("typing", on);
  if (before != null){ const moved = anchor.getBoundingClientRect().top - before; if (Math.abs(moved) > 1) window.scrollBy(0, moved); }   // keep the box where the finger is
  if (on && el && document.activeElement === el && el.setSelectionRange){ try { el.setSelectionRange(el.selectionStart, el.selectionEnd); } catch (e) {} }
}
document.querySelector(".steps").addEventListener("focusin", e => { if (isText(e.target)) setTimeout(() => { if (document.activeElement === e.target) setTyping(true, e.target); }, 350); });
document.querySelector(".steps").addEventListener("focusout", () => setTimeout(() => { if (!isText(document.activeElement)) setTyping(false); }, 150));
// The preview stays out of the way on phones until the design step (or any step after it) is touched.
// The preview appears at the first touch of any step from "Pick a design" onward, including steps added later.
{ const steps = [...document.querySelectorAll(".steps > section")], from = steps.indexOf($("h2").closest("section"));
  steps.slice(from).forEach(sec => ["click", "input", "change"].forEach(ev => sec.addEventListener(ev, start))); }
buildSizes(); buildPath(); buildFields(); buildModes(); buildFonts(); buildLogo(); buildPhoto(); buildViews(); buildWraps(); buildHow(); state.group = "birthdays"; state.sub = 0; applyOccasion();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
