// Prices shown in the designer. The real prices are the Shopify variants; keep these in step with them.
// single[i] is the price of i+1 single labels.
const PRICES = {sheet:29, single:[10, 16, 21, 25]};
const SHEET_PRICE = PRICES.sheet;
const state = {
  age:50, rcounts:{}, mixAll:false, scopePicked:false, qty:1, single:0, want:"ready", hasReady:true, occKey:"", rall:false,
  view:"label", wraps:[], lastWrap:"stripe",
  font:"classic", logo:null, rights:false, photo:null, prights:false, photoPos:"YMid", photoX:50, photoY:50,
  path:"ready", rocc:"birthday", ritem:0, rmode:"one", rnote:"",
  size:"champagne", group:"weddings", sub:0, tpl:"garden",
  pal:0, custom:"#c47f8a", dark:false, palEdited:false,
  words:subWords(GROUPS[0].subs[0]), edited:false,
  mode:"same", mix:[], names:"Emma\nMia\nLinda\nKate\nSofia\nGrace\nHannah", nameField:"main", sel:0
};
const $ = id => document.getElementById(id);
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
const tplById = id => TEMPLATES.find(t => t.id === id);
const sizeNow = () => SIZES.find(z => z.id === state.size);
const groupNow = () => GROUPS.find(g => g.id === state.group);
// Milestone birthday sayings are written for whatever age the customer gives.
const AGE_TAG = {21:"Finally legal", 25:"A quarter century", 30:"Flirty and thriving", 35:"Still got it", 40:"Vintage and fabulous", 45:"Halfway to ninety", 50:"Aged to perfection",
  55:"Speed limit reached", 60:"Better with every year", 65:"Officially a classic", 70:"A true classic", 75:"Three quarters of a century", 80:"Eighty looks good on you", 90:"Ninety years well lived", 100:"A century of stories"};
const ordinal = n => n + (n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th","st","nd","rd","th","th","th","th","th","th"][n % 10]);
function ageItems(n){
  const items = [["Cheers to", String(n), AGE_TAG[n] || "Better with every year"], ["Happy", ordinal(n) + " Birthday", ""], ["", n + " & Fabulous", ""],
    ["Look who's", String(n), "Happy birthday"], ["", "Hello, " + n, "Happy birthday"], ["Officially", String(n), "Happy birthday"],
    [n + " years", "In the Making", "Happy birthday"], ["", "Aged to Perfection", n + " years"], ["", n + " Never Looked So Good", ""],
    ["It took " + n + " years", "To Look This Good", ""], ["Vintage", "Edition", n + " years in the making"], ["Older than", "This Bottle", "Happy " + ordinal(n)]];
  items.splice(2, 0, ["", n + " Is the New " + (n - 10), ""], ["Mentally", "Still 21", "Happy " + ordinal(n)], ["Don't do the math", "Just Pour", "Happy " + ordinal(n)], [n + " &", "Fizzy", ""], ["Chapter " + n, "Now With Bubbles", ""], ["Level " + n, "Unlocked", "Bubbly included"]);
  if (n === 30) items.splice(2, 0, ["", "Dirty Thirty", "Clean glass"], ["Thirty", "Flirty & Fizzy", ""]);
  if (n === 40) items.splice(2, 0, ["Forty", "& Fizzy", ""], ["Lordy lordy", "Look Who's Forty", ""]);
  if (n === 50) items.splice(2, 0, ["Fifty", "& Nifty", ""], ["Half a century", "Fully Fabulous", ""]);
  if (n === 60) items.splice(2, 0, ["Sixty", "& Sassy", ""]);
  if (n === 21) items.splice(1, 0, ["", "Finally Legal", "Cheers to 21"], ["First", "Legal Sip", "Happy 21st"]);
  if (n >= 50) items.push(["Over the hill", "Under the Influence", "Happy " + ordinal(n)]);
  return items;
}
const readyNow = () => { const r = READY.find(x => x.id === state.rocc); return r.id === "milestone" ? {...r, items:ageItems(state.age)} : r; };
const readyWords = it => ({top:it[0], main:it[1], detail:state.rnote, msg:it[2], ready:true});
const namesMode = () => state.path === "custom" && state.mode === "names";
const sheetHolds = () => { const z = sizeNow(); return z.cols * z.rows; };
// Single labels: state.single is how many (0 = full sheets). Everything that counts labels then works from that number.
const perSheet = () => state.single || sheetHolds();
const num = (v, base) => typeof v === "function" ? v() : v * base;
const colors = () => resolvePalette(state.pal < 0 ? customPalette(state.custom) : PALETTES[state.pal], state.dark);

function nameList(){
  const max = FIELDS.find(f => f.id === state.nameField).max;
  return state.names.split("\n").map(n => n.trim().slice(0, max)).filter(Boolean).slice(0, MAX_NAMES);
}
// How many of each saying go on a ready-made mixed sheet. Starts as an even spread that fills the sheet.
const spanReady = () => state.path === "ready" && state.rmode === "mixed";
const readyTarget = () => perSheet() * state.qty;
function readyCounts(){
  const key = state.rocc + "|" + state.size + "|" + state.qty + (state.single ? "|s" + state.single : "") + (state.rocc === "milestone" ? "|" + state.age : ""), n = readyNow().items.length, per = readyTarget();
  if (!state.rcounts[key]){ const base = Math.floor(per / n), extra = per - base * n; state.rcounts[key] = Array.from({length:n}, (_, i) => base + (i < extra ? 1 : 0)); }
  return state.rcounts[key];
}
const readyTotal = () => readyCounts().reduce((a, b) => a + b, 0);
const everySheet = () => state.path === "custom" && state.mode === "mix" && state.mixAll;
// More than one sheet of written labels: the customer has to say whether the sheets match before ordering.
const needScope = () => state.path === "custom" && state.mode === "mix" && state.qty > 1 && !state.scopePicked;
function syncMix(){
  const n = perSheet() * (state.mixAll ? state.qty : 1);
  const f = (SUB_START[state.occKey] || {}).number;   // numbered occasion (table bottles): every new label arrives pre-numbered
  while (state.mix.length < n){ const w = {...state.words}; if (f) w[f] = "No. " + (state.mix.length + 1); state.mix.push(w); }
  state.mix.length = n;
}
// Every label on the order, as a list of word sets.
function labels(){
  if (state.path === "ready"){
    const items = readyNow().items;
    if (state.rmode === "mixed"){
      const out = [], left = [...readyCounts()];   // dealt round-robin so each sheet gets a variety
      while (left.some(k => k > 0)) left.forEach((k, i) => { if (k > 0){ out.push(readyWords(items[i])); left[i]--; } });
      if (out.length) return out;
    }
    return [readyWords(items[Math.min(state.ritem, items.length - 1)])];
  }
  if (state.mode === "mix"){ syncMix(); return state.mix; }
  if (state.mode === "names") return nameList().map(n => ({...state.words, [state.nameField]:n}));
  return [state.words];
}
function current(){
  const list = labels();
  if (!list.length) return {...state.words, [state.nameField]:""};
  state.sel = Math.min(state.sel, list.length - 1);
  return list[state.sel];
}

// A design or size without room for a line folds that line into a neighbor, so a saying keeps its words.
// On the three-line mini label, a saying that already fills all three lines gives its last line to an added name.
function foldWords(t, words){
  const has = id => t.zones[id] && !(SMALL && id === "msg"), w = {...words}, tx = k => (w[k] || "").trim();
  let dropped = false;
  if (w.ready && !has("top") && tx("top")){ w.main = (tx("top") + " " + tx("main")).trim(); w.top = ""; }
  if (!has("msg") && tx("msg")){
    if (!tx("detail")) w.detail = tx("msg");
    else if (w.ready){
      if (has("top") && !tx("top")){ w.top = tx("detail"); w.detail = tx("msg"); }
      else if ((tx("msg") + tx("detail")).length <= 24) w.detail = tx("msg") + " · " + tx("detail");
      else dropped = true;
    }
    w.msg = "";
  }
  return {w, dropped};
}
function labelMarkup(t, c, words){
  if (t.tint) c = t.tint(c);
  let s = `<rect width="${W}" height="${H}" fill="${c.bg}"/>` + t.art(c, words);
  words = foldWords(t, words).w;
  // Collect the lines that will print, then stack them with even spacing and center the stack in the design's text area.
  const fs = fontNow(), lines = [];
  FIELDS.forEach(f => {
    const z = t.zones[f.id];
    let v = (words[f.id] || "").trim();
    if (!z || !v || (SMALL && f.id === "msg")) return;
    const role = Object.keys(BASE_F).find(k => BASE_F[k] === z.font) || "sans", hd = fs.head, isMain = f.id === "main";
    const o = isMain
      ? {fam:hd.font, script:!!hd.script, upper:hd.script ? false : (hd.upper != null ? hd.upper : !!z.upper), ls:hd.script ? 0 : (hd.ls != null ? hd.ls : z.ls), weight:hd.weight || (hd.script ? 400 : z.weight || 400), italic:!hd.script && !!hd.italic}
      : {fam:fs.f[role], script:role === "script" && !fs.plain, upper:!!z.upper, ls:z.ls, weight:z.weight || 400, italic:!!z.italic || (role === "script" && !!fs.italic)};
    if (o.upper) v = v.toUpperCase();
    const k = isMain
      ? (role === "script" ? (hd.script ? fs.scale : .74 * (hd.scale || 1)) : (hd.script ? 1.28 * fs.scale : (fs.dscale || 1) * (hd.scale || 1)))
      : (role === "script" ? fs.scale : role === "display" ? (fs.dscale || 1) : 1);
    const raw = z.size * S * k;
    lines.push({z, v, role, ...o, size:n1(z.size < 20 ? sm(raw * 1.2) : raw), y:num(z.y, H)});
  });
  if (t.flow !== false && lines.length){
    lines.sort((a, b) => a.y - b.y);   // stack top-to-bottom by zone position, so a design can place the note below the saying
    const zs = FIELDS.filter(f => t.zones[f.id] && !(SMALL && f.id === "msg")).map(f => t.zones[f.id]).sort((a, b) => num(a.y, H) - num(b.y, H));
    const top = num(zs[0].y, H) - .7 * zs[0].size * S, bot = num(zs[zs.length - 1].y, H) + .2 * zs[zs.length - 1].size * S;
    const asc = l => (l.script ? .84 : .72) * l.size, desc = l => l.upper ? .04 * l.size : (l.script ? .3 : .22) * l.size;
    const stack = () => { const ys = [0];
      for (let i = 1; i < lines.length; i++) ys[i] = ys[i - 1] + desc(lines[i - 1]) + .45 * Math.min(lines[i - 1].size, lines[i].size) + 3 * S + asc(lines[i]);
      return ys; };
    const height = ys => ys[ys.length - 1] + desc(lines[lines.length - 1]) + asc(lines[0]);
    // grow the words to use the room the design has, up to 30% (long lines still shrink to fit their width)
    const k = Math.max(1, Math.min(1.3, (bot - top) / height(stack())));
    lines.forEach(l => l.size = n1(l.size * k));
    const ys = stack(), off = (top + bot) / 2 - (ys[ys.length - 1] + desc(lines[lines.length - 1]) - asc(lines[0])) / 2;
    lines.forEach((l, i) => l.y = ys[i] + off);
  }
  lines.forEach(l => {
    const z = l.z, style = l.ls ? ` style="letter-spacing:${l.ls}em"` : "";
    s += `<text x="${n1(z.x ? z.x() : W / 2)}" y="${n1(l.y)}" text-anchor="middle" font-family="${l.fam}" font-size="${l.size}"`
       + ` font-weight="${l.weight}"${l.italic ? ' font-style="italic"' : ""} fill="${c[z.fill || "ink"]}"`
       + ` data-fit="${n1(num(z.w, W))}" data-size="${l.size}"${style}>${esc(l.v)}</text>`;
  });
  return s;
}
function fit(svg){
  svg.querySelectorAll("text[data-fit]").forEach(el => {
    const max = +el.dataset.fit, base = +el.dataset.size;
    el.setAttribute("font-size", base);
    const len = el.getComputedTextLength();
    if (len > max) el.setAttribute("font-size", Math.max(base * .24, base * max / len).toFixed(2));
  });
}
function screen(){
  const list = labels();
  if (tplById(state.tpl).logo && !state.logo) return "This design needs a logo. Upload one, or pick another design.";
  if (tplById(state.tpl).photo && !state.photo) return "This design needs a photo. Upload one, or pick another design.";
  if (photoUsed() && !state.prights) return "Tick the box under your photo to confirm you can print it.";
  if (logoUsed() && !state.rights) return "Tick the box under your logo to confirm you can print it.";
  if (spanReady() && readyTotal() !== readyTarget()){
    const d = readyTarget() - readyTotal(), what = state.single ? "You chose" : state.qty > 1 ? `Your ${state.qty} sheets hold` : "Your sheet holds";
    return d > 0 ? `${what} ${readyTarget()} labels. Add ${d} more under Choose your wording.` : `${what} ${readyTarget()} labels. Take ${-d} off under Choose your wording.`;
  }
  if (namesMode() && !list.length) return "Add at least one name to your list.";
  if (state.single && namesMode() && list.length !== state.single) return `Your list has ${list.length} ${list.length === 1 ? "name" : "names"} and you chose ${state.single} ${state.single === 1 ? "label" : "labels"}. Change the number under How many, or choose a full sheet.`;
  if (needScope()) return `You're ordering ${state.qty} sheets. Under Choose your wording, choose whether every sheet is the same or different.`;
  const text = list.map(w => FIELDS.map(f => w[f.id] || "").join(" ")).join(" ").toLowerCase();
  const whole = b => new RegExp("(^|[^a-zà-ÿ])" + b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-zà-ÿ]|$)").test(text);   // whole words only, so names like Annike still print
  const brand = BLOCK_BRANDS.find(whole);
  if (brand) return `We can't print brand names or logos. Please remove "${brand}".`;
  if (BLOCK_WORDS.some(b => new RegExp("(^|[^a-zà-ÿ])" + b).test(text))) return "Please remove the offensive wording so we can print this.";
  if (list.some(w => !FIELDS.some(f => (w[f.id] || "").trim()))) return "Every label needs at least one line of text.";
  return "";
}
const fontNow = () => FONT_STYLES.find(x => x.id === state.font);
const photoUsed = () => !!state.photo && !!tplById(state.tpl).photo;
const logoUsed = () => !!state.logo && (tplById(state.tpl).logo || state.tpl === "monogram");
function available(t){
  if (t.sizes && !t.sizes.includes(state.size)) return false;
  if (t.logo) return !!state.logo;
  if (t.photo) return !!state.photo && (!t.subs || t.subs.includes(groupNow().subs[state.sub][0]));   // a photo design can be kept to the occasions it suits
  const sub = groupNow().subs[state.sub][0];
  if (t.subs && t.subs.includes(sub)) return true;
  if (t.groups) return t.groups.includes(state.group);
  if (t.subs) return false;
  return !(t.not && t.not.includes(state.group));
}

/* ---------- build controls ---------- */
const chip = (id, text, on, extra = "") => `<button class="chip" data-id="${id}" aria-pressed="${on}"${extra}>${text}</button>`;
function buildSizes(){
  const sz = sizeNow();
  setSize(sz);
  $("sizes").innerHTML = SIZES.map(z => chip(z.id, `${z.name} · ${z.label}`, z.id === state.size)).join("");
  $("sizenote").innerHTML = `<strong>Will it fit my bottle?</strong> ${sz.fit}`
    + `<details><summary>See the ${sz.bottles.length} tested bottles</summary><ul>${sz.bottles.map(b => `<li>${esc(b)}</li>`).join("")}</ul></details>`
    + (sz.note ? `<div class="fitnote">${sz.note}</div>` : "");
  $("preview").setAttribute("viewBox", `0 0 ${W} ${H}`);
}
function buildPath(){
  const ready = state.path === "ready";
  $("paths").innerHTML = chip("ready", "Ready-made sayings", ready) + chip("custom", "Write your own", !ready);
  $("paths").hidden = !state.hasReady;
  $("pathhint").textContent = !state.hasReady ? "This occasion doesn't have ready-made sayings yet, so type your own. We've started you off with an example."
    : ready ? `${readyNow().items.length} sayings for this occasion. Tap one to put it on your design.` : "Type your own names, dates and message. We've started you off with an example.";
  $("backtosay").hidden = ready || !state.hasReady;
  if (!ready && state.hasReady) $("backtosay").innerHTML = `<strong>Writing your own words.</strong> This occasion also has ${readyNow().items.length} ready-made sayings. <button type="button" class="linkbtn" id="showsay">Show the sayings</button>`;
  $("sec-ready").hidden = !ready;
  $("sec-words").hidden = ready;
}
function buildReady(){
  const r = readyNow();
  state.ritem = Math.min(state.ritem, r.items.length - 1);
  $("rocc").innerHTML = READY.map(x => chip(x.id, x.name, x.id === state.rocc)).join("");
  const mixed = state.rmode === "mixed", per = readyTarget(), counts = readyCounts(), total = readyTotal();
  const words = it => (it[0] ? `<span class="k">${esc(it[0])}</span>` : "") + `<span class="m">${esc(it[1])}</span>` + (it[2] ? `<span class="b">${esc(it[2])}</span>` : "");
  const short = false;   // every saying shows; nothing is tucked behind a button
  $("rmore").hidden = !short;
  $("rmore").textContent = `Show all ${r.items.length} sayings`;
  $("rgrid").innerHTML = (short ? r.items.slice(0, 8) : r.items).map((it, i) => mixed
    ? `<div class="say" data-on="${counts[i] > 0}">${words(it)}<div class="stepper" role="group" aria-label="How many of ${esc(it[1])}">`
      + `<button class="cnt" data-i="${i}" data-d="-1" aria-label="One fewer"${counts[i] ? "" : " disabled"}>−</button><span>${counts[i]}</span>`
      + `<button class="cnt" data-i="${i}" data-d="1" aria-label="One more"${total >= per ? " disabled" : ""}>+</button></div></div>`
    : `<button class="say" data-i="${i}" aria-pressed="${i === state.ritem}">${words(it)}</button>`).join("");
  $("agewrap").hidden = state.rocc !== "milestone" && !(tplById(state.tpl) || {}).number;   // number designs (Watercolor Number) can set their number here too
  $("rmodes").innerHTML = chip("one", "One saying on every label", !mixed) + chip("mixed", "Mix several sayings", mixed);
  $("rmodehint").hidden = !mixed;
  $("rmodehint").innerHTML = total === per ? `<strong>${total} of ${per} labels chosen${state.qty > 1 ? ` across ${state.qty} sheets` : ""}.</strong> ${state.qty > 1 ? "Your sheets are" : "Your sheet is"} full. Use the plus and minus buttons to change the mix.`
    : total < per ? `<strong>${total} of ${per} labels chosen.</strong> Add ${per - total} more to fill ${state.qty > 1 ? "your sheets" : "the sheet"}.`
    : `<strong>${total} of ${per} labels chosen.</strong> Take ${total - per} off to fit the sheet.`;
}
// Point the shared occasion state at the ready-made occasion so designs and colors follow it.
function buildViews(){
  $("views").innerHTML = chip("label", "Label", state.view === "label") + chip("bottle", "On a bottle", state.view === "bottle") + chip("wrap", "In a wrap", state.view === "wrap");
}
// The wrap row: arrows show only when there is more to see in that direction.
function syncWrapNav(){
  const g = $("wrapcards"), over = g.scrollWidth > g.clientWidth + 4;
  $("wrapprev").hidden = !over || g.scrollLeft < 4;
  $("wrapnext").hidden = !over || g.scrollLeft + g.clientWidth > g.scrollWidth - 4;
  $("wrapswipe").hidden = !over;
  $("wrapswipe").textContent = `Swipe or use the arrows to see all ${g.children.length} wraps.`;
}
function buildWraps(){
  const sz = sizeNow(), col = collNow(), unit = wrapUnit(), match = wrapMatch(), what = unit > 1 ? "pack" : "wrap";
  ["wrapgone", "sizegone"].forEach(id => { $(id).hidden = !state.wrapsGone; $(id).textContent = state.wrapsGone || ""; });
  $("wrapmatch").innerHTML = (col.matched
      ? `<strong>Made for ${esc(col.occasion)}.</strong> These are the best sellers from our ${esc(col.name)} collection.`
      : `<strong>Our ${esc(col.name)}.</strong> We don't have a collection just for ${esc(col.occasion)}, so these are the best sellers for this bottle.`)
    + ` <a href="${col.url}" target="_blank" rel="noopener">See the whole collection</a>`;
  const keepScroll = $("wrapcards").scrollLeft;   // adding a wrap redraws the row; stay on the card they tapped
  $("wrapcards").innerHTML = WRAPS.map((w, i) => {
    const sel = state.wraps.find(x => x.id === w.id), n = sel ? wrapQty(sel) : 0;
    return `<div class="wrapcard" data-on="${!!sel}"><svg viewBox="80 10 240 516" aria-hidden="true"></svg><div class="k">${sz.wrapKind}</div><div class="nm">${esc(wrapName(i))}</div><div>${sz.wrapPrice}</div>`
      + (sel ? `<div class="stepper" role="group" aria-label="How many"><button class="wq" data-id="${w.id}" data-d="-1" aria-label="One fewer">−</button><span>${n}</span><button class="wq" data-id="${w.id}" data-d="1" aria-label="One more">+</button></div>`
               + (sel.auto ? `<span class="hint">Matched to your labels</span>` : `<button type="button" class="linkbtn wm" data-id="${w.id}">Match my labels</button>`)
             : `<button class="chip add" data-id="${w.id}">${state.wraps.length ? "Add" : "Add " + match}</button>`) + `</div>`;
  }).join("");
  $("wrapcards").scrollLeft = keepScroll; syncWrapNav();
  const total = state.wraps.reduce((a, w) => a + wrapQty(w), 0), cost = total * wrapEach();
  const TIERS = [[39, 2], [79, 5], [119, 10]], got = TIERS.filter(t => cost >= t[0]).pop(), next = TIERS.find(t => cost < t[0]);
  $("bundlenote").innerHTML = (!total ? "Spend $39 on wraps for 2 free wraps, $79 for 5, or $119 for 10. You choose your free wraps in the cart."
      : (got ? `<strong>You've unlocked ${got[1]} free wraps.</strong> You'll choose them in the cart. ` : "") + (next ? `Add $${(next[0] - cost).toFixed(2)} more in wraps to get ${next[1]} free.` : "That's our top tier."))
    + " Label sheets don't count toward a bundle.";
  $("wrapsum").hidden = !total;
  $("wrapsum").innerHTML = `<strong>${total} ${what}${total === 1 ? "" : "s"} · $${cost.toFixed(2)}.</strong> `
    + (state.wraps.some(w => w.auto) ? `We matched your ${labelCount()} labels${unit > 1 ? `, ${unit} wraps to a pack` : ""}, so every bottle gets a wrap${state.wraps.length > 1 ? ", split across your designs" : ""}. Use minus if you need fewer.` : "Use plus and minus to change how many.");
}// The three small pictures in "how it works". Drawn once, with a sample label.
function buildHow(){
  const own = `<rect width="100" height="75" fill="#f4efe2"/><rect x="18" y="16" width="64" height="5" fill="#b9b3a3"/><rect x="28" y="30" width="44" height="14" fill="#8f8a7c"/><rect x="24" y="54" width="52" height="4" fill="#b9b3a3"/>`;
  const mine = `<rect width="100" height="75" fill="#ffffff"/><rect x="5" y="5" width="90" height="65" fill="none" stroke="#e58aa5" stroke-width="1.6"/>` + dHeart(50, 26, .8, "#e58aa5", true) + `<rect x="26" y="42" width="48" height="6" fill="#1B2440"/><rect x="34" y="54" width="32" height="3.5" fill="#1B2440" opacity=".55"/>`;
  $("how1").innerHTML = sceneMarkup(null, 100, 75, null, "#e58aa5", "h1", "champagne");
  $("how2").innerHTML = sceneMarkup(mine, 100, 75, null, "#e58aa5", "h2", "champagne");
  $("how3").innerHTML = sceneMarkup(mine, 100, 75, "gingham", "#e58aa5", "h3", "champagne");
}
function buildFonts(){
  const opt = x => { const h = x.head, size = Math.round(h.script ? 26 * x.scale : 21 * (h.scale || 1));
    return `<button class="fontopt" data-id="${x.id}" aria-pressed="${x.id === state.font}"><span class="big" style="font-family:${h.font};font-size:${size}px;font-weight:${h.weight || 400};${h.italic ? "font-style:italic;" : ""}${h.ls ? `letter-spacing:${h.ls}em;` : ""}">${h.upper ? "CHEERS" : "Cheers"}</span><span class="small">${x.name}</span></button>`; };
  $("fonts").innerHTML = `<div class="psep">Script</div>` + FONT_STYLES.filter(x => x.head.script).map(opt).join("") + `<div class="psep">Not script</div>` + FONT_STYLES.filter(x => !x.head.script).map(opt).join("");
}
function buildPhoto(){
  const ph = state.photo;
  $("photolabel").textContent = ph ? "Change photo" : "Upload a photo";
  $("photothumb").hidden = $("photoremove").hidden = $("prightswrap").hidden = $("photopos").hidden = !ph;
  if (ph) $("photothumb").src = ph.url;
  $("prights").checked = state.prights;
  $("photopos").innerHTML = chip("YMin", "Show the top", state.photoX === 50 && state.photoY === 0) + chip("YMid", "Show the middle", state.photoX === 50 && state.photoY === 50) + chip("YMax", "Show the bottom", state.photoX === 50 && state.photoY === 100)
    + `<span class="hint">… or drag the photo on the label to place it exactly.</span>`;
  const warn = ph && ph.small ? `This photo is only ${ph.w} × ${ph.h} pixels and may print soft. Use the original from your phone or camera if you can.` : "";
  $("photowarn").textContent = warn; $("photowarn").hidden = !warn;
}
/* A 12 MB JPEG can hold 200+ megapixels (a panorama, a scan). The byte check alone lets that
   through, and every later step then pays for it: the preview, each design tile, the customer's
   whole browser, and the print service's small instance. So any upload past the pixel cap is
   shrunk ONCE, here, and everything downstream only ever sees the shrunk copy. The caps leave
   ~600 dpi on the largest label, well past print quality. Decode happens in createImageBitmap
   (off the main thread); a browser without it keeps the old path. */
const PHOTO_CAP = 3000, LOGO_CAP = 2000;
function shrinkUpload(file, cap, mime, q){
  return new Promise(resolve => {
    if (!window.createImageBitmap) return resolve(null);
    createImageBitmap(file).then(bmp => {
      const m = Math.max(bmp.width, bmp.height);
      if (m <= cap){ bmp.close && bmp.close(); return resolve(null); }         // small enough: keep the original
      const w = Math.round(bmp.width * cap / m), h = Math.round(bmp.height * cap / m);
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      c.getContext("2d").drawImage(bmp, 0, 0, w, h);
      bmp.close && bmp.close();
      const data = c.toDataURL(mime, q);
      c.toBlob(b => resolve(b ? {blob:b, data, w, h} : null), mime, q);
    }).catch(() => resolve(null));                                             // unreadable here: the old path shows its own message
  });
}
function setPhoto(file){
  const fail = msg => { $("photowarn").textContent = msg; $("photowarn").hidden = false; };
  $("photowarn").hidden = true;
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return fail("That file type won't work. Please upload a JPG or PNG photo.");
  if (file.size > 12 * 1024 * 1024) return fail("That photo is over 12 MB. Please upload a smaller copy.");
  shrinkUpload(file, PHOTO_CAP, "image/jpeg", .92).then(sm => {
    if (sm){
      if (state.photo) URL.revokeObjectURL(state.photo.url);
      state.photo = {url:URL.createObjectURL(sm.blob), data:sm.data, name:file.name, w:sm.w, h:sm.h, small:false};
      state.prights = false; state.photoPos = "YMid"; state.photoX = 50; state.photoY = 50;
      if (!tplById(state.tpl).photo) state.tpl = "photo1";
      changed(); return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        if (state.photo) URL.revokeObjectURL(state.photo.url);
        state.photo = {url, data:reader.result, name:file.name, w:img.naturalWidth, h:img.naturalHeight, small:Math.max(img.naturalWidth, img.naturalHeight) < 1000};
        state.prights = false; state.photoPos = "YMid"; state.photoX = 50; state.photoY = 50;
        if (!tplById(state.tpl).photo) state.tpl = "photo1";
        changed();
      };
      img.onerror = () => fail("We couldn't read that photo. Please try another file.");
      img.src = url;
    };
    reader.readAsDataURL(file);
  });
}
function buildLogo(){
  const l = state.logo;
  $("logolabel").textContent = l ? "Change logo" : "Upload a logo";
  $("logothumb").hidden = $("logoremove").hidden = $("rightswrap").hidden = !l;
  if (l) $("logothumb").src = l.url;
  $("rights").checked = state.rights;
  $("logohint").textContent = l ? `${l.name} · logo designs are now first in the list below. It also sits inside the Wreath Monogram.`
                                : "Upload a logo (PNG, JPG or SVG up to 5 MB) or a photo (JPG or PNG up to 12 MB) and designs made for it appear first in the list below.";
  const warn = l && l.small ? `This logo is only ${l.w} × ${l.h} pixels and may print blurry. Upload a larger file if you have one.` : "";
  $("logowarn").textContent = warn; $("logowarn").hidden = !warn;
}
function setLogo(file){
  $("logowarn").hidden = true;
  if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(file.type)){ $("logowarn").textContent = "That file type won't work. Please upload a PNG, JPG or SVG."; $("logowarn").hidden = false; return; }
  if (file.size > 5 * 1024 * 1024){ $("logowarn").textContent = "That file is over 5 MB. Please upload a smaller one."; $("logowarn").hidden = false; return; }
  const vector = file.type === "image/svg+xml";
  (vector ? Promise.resolve(null) : shrinkUpload(file, LOGO_CAP, "image/png")).then(sm => {   // PNG keeps a logo's transparency
    if (sm){
      if (state.logo) URL.revokeObjectURL(state.logo.url);
      state.logo = {url:URL.createObjectURL(sm.blob), data:sm.data, name:file.name, w:sm.w, h:sm.h, vector:false, small:false};
      state.rights = false;
      if (!tplById(state.tpl).logo && state.tpl !== "monogram") state.tpl = "logo1";
      changed(); return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        if (state.logo) URL.revokeObjectURL(state.logo.url);
        state.logo = {url, data:reader.result, name:file.name, w:img.naturalWidth, h:img.naturalHeight, vector,
                      small:!vector && Math.max(img.naturalWidth, img.naturalHeight) < 600};
        state.rights = false;
        if (!tplById(state.tpl).logo && state.tpl !== "monogram") state.tpl = "logo1";
        changed();
      };
      img.onerror = () => { $("logowarn").textContent = "We couldn't read that image. Please try another file."; $("logowarn").hidden = false; };
      img.src = url;
    };
    reader.readAsDataURL(file);
  });
}
function buildOccasions(){
  $("groups").innerHTML = GROUPS.map(g => chip(g.id, g.name, g.id === state.group)).join("");
  const g = groupNow();
  $("subs").innerHTML = g.subs.map((s, i) => chip(i, s[0], i === state.sub)).join("");
  $("subs").hidden = g.subs.length < 2;
}
function buildTemplates(){
  let list = TEMPLATES.filter(available);
  if (state.logo) list = list.filter(t => t.logo).concat(list.filter(t => !t.logo));   // logo designs first once there is a logo
  if (state.photo) list = list.filter(t => t.photo).concat(list.filter(t => !t.photo)); // and photo designs once there is a photo
  if (!list.some(t => t.id === state.tpl)) state.tpl = list[0].id;
  const tile = t => `<button class="tpl" data-id="${t.id}" aria-pressed="${t.id === state.tpl}"><svg viewBox="0 0 ${W} ${H}" aria-hidden="true"></svg><span>${t.name}</span></button>`;
  const made = list.filter(t => t.themed || t.logo || t.photo || (t.subs && !t.groups)), any = list.filter(t => !made.includes(t)), occ = groupNow().subs[state.sub][0];
  // one continuous grid: a heading row between the two groups left empty spaces after the last design of each group
  const star = `<i class="star" aria-hidden="true">★</i>`;
  $("templates").innerHTML = made.map(t => tile(t).replace("<svg", star + "<svg").replace("<span>", `<span><b class="vh">Made for ${esc(occ === "Your occasion" ? "you" : occ)}: </b>`)).join("") + any.map(tile).join("");
  $("templates").dataset.made = made.length; $("templates").dataset.occ = occ === "Your occasion" ? "you" : occ;
}
function buildSwatches(){
  $("swatches").innerHTML = PALETTES.map((p, i) =>
    `<button class="sw" data-i="${i}" aria-pressed="${i === state.pal}" aria-label="${p.name}" title="${p.name}" style="background:linear-gradient(135deg, ${p.bg} 50%, ${p.a} 50%)"></button>`).join("");
  $("tones").innerHTML = chip("light", "Light background", !state.dark) + chip("dark", "Dark background", state.dark);
  $("custom").value = state.custom;
  $("customwrap").setAttribute("data-on", state.pal < 0);
  $("palname").textContent = (state.pal < 0 ? "Your color" : PALETTES[state.pal].name) + (state.dark ? " · dark" : "");
}
function buildModes(){
  const per = perSheet();
  $("modes").innerHTML = chip("same", "Same on every label", state.mode === "same")
    + chip("mix", "Different on each label", state.mode === "mix")
    + chip("names", "One name per label", state.mode === "names");
  $("namebox").hidden = state.mode !== "names";
  $("mixbox").hidden = state.mode !== "mix";
  $("namefield").innerHTML = FIELDS.map(f => `<option value="${f.id}"${f.id === state.nameField ? " selected" : ""}>${f.label}</option>`).join("");
  if ($("names").value !== state.names) $("names").value = state.names;
  { const q = state.qty, open = needScope();
    $("scopeask").hidden = q < 2; $("scopeask").classList.toggle("need", open);
    $("scopeq").innerHTML = `You're ordering ${q} sheets. Should they match?` + (open ? ` <span class="ask-tag">Choose one</span>` : "");
    $("mixscope").innerHTML = chip("repeat", `Every sheet the same<small>Write ${per} labels. We print that sheet ${q} times.</small>`, !open && !state.mixAll)
      + chip("all", `Every sheet different<small>Write all ${q * per} labels, ${per} to a sheet.</small>`, !open && state.mixAll);
    $("mixhint").textContent = state.single ? (state.single > 1 ? `You have ${state.single} labels to write. Type a label's words below, then tap Next label.` : "Type your label's words below.") : q < 2
      ? `One sheet holds ${per} labels. Type a label's words below, then tap Next label. Want more than ${per} different labels? Add sheets in step 2.`
      : state.mixAll ? `${q} sheets of ${per} gives you ${q * per} labels to write. Type a label's words below, then tap Next label.`
      : open ? "Type a label's words below, then tap Next label."
      : `Type a label's words below, then tap Next label. ${q === 2 ? "Both" : "All " + q} sheets print the same ${per} labels.`; }
  $("howmany").innerHTML = chip("sheet", `Full sheets<small>${sheetHolds()} labels a sheet · $${PRICES.sheet}</small>`, !state.single) + chip("single", `Just a few labels<small>1 to ${PRICES.single.length} labels · from $${PRICES.single[0]}</small>`, !!state.single);
  $("singlewrap").hidden = !state.single;
  $("singleqty").innerHTML = PRICES.single.map((p, i) => `<option value="${i + 1}"${i + 1 === state.single ? " selected" : ""}>${i + 1} ${i ? "labels" : "label"} · $${p}</option>`).join("");
  buildQty();
}
function buildQty(){
  const max = everySheet() || spanReady() ? 5 : 10;
  state.qty = Math.min(state.qty, max);
  $("qty").innerHTML = Array.from({length:max}, (_, i) => `<option value="${i + 1}"${i + 1 === state.qty ? " selected" : ""}>${i + 1}</option>`).join("");
}
function buildFields(){
  $("fields").innerHTML = FIELDS.map(f =>
    `<label class="f" for="f-${f.id}"><span class="frow"><span>${f.label}</span><span class="count" id="c-${f.id}"></span></span>`
    + `<input type="text" id="f-${f.id}" maxlength="${f.max}" autocomplete="off"></label>`).join("");
  FIELDS.forEach(f => {
    $("f-" + f.id).addEventListener("input", e => {
      if (state.mode === "mix"){ syncMix(); state.mix[state.sel][f.id] = e.target.value; }
      else state.words[f.id] = e.target.value;
      state.edited = true; changed();
    });
  });
}
function syncFields(){
  const src = state.mode === "mix" ? current() : state.words;
  FIELDS.forEach(f => {
    const el = $("f-" + f.id), fromList = namesMode() && f.id === state.nameField;
    const tp = tplById(state.tpl), unused = (SMALL && f.id === "msg") || (!tp.zones[f.id] && !(tp.uses || []).includes(f.id));
    const v = fromList || unused ? "" : (src[f.id] || "");
    if (el.value !== v) el.value = v;
    el.disabled = fromList || unused;
    el.placeholder = fromList ? "Filled in from your name list" : unused ? (SMALL && f.id === "msg" ? "Not shown on mini labels" : "Not shown on this design") : "";
    el.closest(".f").classList.toggle("locked", unused);
    $("c-" + f.id).textContent = fromList || unused ? "" : el.value.length + "/" + f.max;
  });
}

/* ---------- derived panels ----------
   The same idea as the wrapKey memo in render(), applied to every panel: each builder lists the state it
   draws, and render() re-runs it only when that state has changed. An event handler just mutates state and
   calls changed() — it never has to know which panels its change touches. If a builder starts drawing a
   new piece of state, add that state to its line here; that is the whole contract. */
let uiKeys = {};
const resetDerived = () => { uiKeys = {}; };   // applyDesign restores many fields at once: rebuild everything
const UI_DEPS = [   // in dependency order: sizes sets W/H, templates may reassign state.tpl, ready reads it
  [() => buildSizes(),     () => state.size],
  [() => buildOccasions(), () => [state.group, state.sub].join("|")],
  [() => buildTemplates(), () => [state.group, state.sub, state.size, !!state.logo, !!state.photo].join("|")],
  [() => buildPath(),      () => [state.path, state.hasReady, state.rocc, state.age].join("|")],
  [() => buildReady(),     () => [state.rocc, state.rmode, state.age, state.size, state.qty, state.single, readyTotal(), !!(tplById(state.tpl) || {}).number].join("|")],
  [() => buildSwatches(),  () => [state.pal, state.custom, state.dark].join("|")],
  [() => buildFonts(),     () => state.font],
  [() => buildModes(),     () => [state.mode, state.qty, state.single, state.size, state.mixAll, state.scopePicked, state.nameField, state.path, state.rmode].join("|")],
  [() => buildLogo(),      () => [state.logo && state.logo.url, state.rights].join("|")],
  [() => buildPhoto(),     () => [state.photo && state.photo.url, state.prights, state.photoPos, state.photoX, state.photoY].join("|")],
  [() => buildViews(),     () => state.view],
];
function syncDerived(){
  UI_DEPS.forEach(([build, deps], i) => { const k = String(deps()); if (uiKeys[i] !== k){ uiKeys[i] = k; build(); } });
}

/* ---------- render ---------- */
let proofTimer = 0;
function render(){
  syncDerived();
  { const key = [state.group, state.sub, state.size, labelCount(), state.wraps.map(w => w.id + wrapQty(w)).join()].join("|");
    if (key !== state.wrapKey){ state.wrapKey = key; buildWraps(); } }
  const t = tplById(state.tpl), c = colors(), cur = current(), list = labels(), per = perSheet(), sz = sizeNow();
  LITE = true;
  document.querySelectorAll("#templates .tpl").forEach(b => {
    const svg = b.querySelector("svg");
    svg.innerHTML = labelMarkup(tplById(b.dataset.id), c, cur);
    fit(svg);
    b.setAttribute("aria-pressed", b.dataset.id === state.tpl);
  });
  LITE = false;
  const flat = state.view === "label";
  $("preview").toggleAttribute("hidden", !flat); $("scene").toggleAttribute("hidden", flat); $("scenenote").hidden = flat;
  $("frame").classList.toggle("tall", !flat);
  // Until a name or note is typed (or declined), the on-screen preview shows where it would go. It never prints.
  const wantsName = state.path === "ready" && !!t.zones.detail && !state.rnote.trim() && !state.nameSkip;
  const ghost = wantsName && !$("approve").checked, pvWords = ghost ? {...cur, detail:GHOST} : cur;
  $("sec-name").hidden = !(state.path === "ready" && t.zones.detail);
  $("peekname").textContent = t.name;
  $("namenudge").hidden = !wantsName;
  $("preview").innerHTML = labelMarkup(t, c, pvWords);
  $("preview").style.touchAction = t.photo && state.photo ? "none" : "";   // a finger on the photo drags the crop, not the page
  if (flat){ fit($("preview")); if (ghost) markGhost($("preview")); }
  else {
    $("scene").innerHTML = sceneMarkup(labelMarkup(t, c, pvWords), W, H, state.view === "wrap" ? state.lastWrap : null, c.a, "m", state.size, 560);
    fit($("scene")); if (ghost) markGhost($("scene"));
    $("scenenote").textContent = state.view === "wrap" ? (state.lastWrap === "shot" && wrapShot && wrapShot.size === state.size ? wrapShot.title + ". Your label shows through the clear window." : "Example wrap. Your label shows through the clear window.") : "Your label goes right over the bottle's own label.";
  }
  LITE = true;
  document.querySelectorAll("#wrapcards .wrapcard").forEach((card, i) => {
    const svg = card.querySelector("svg");
    svg.innerHTML = sceneMarkup(labelMarkup(t, c, cur), W, H, WRAPS[i].id, c.a, "w" + i, state.size);
    fit(svg);
  });
  LITE = false;
  syncFields();

  const multi = state.path === "ready" ? state.rmode === "mixed" : state.mode !== "same";
  document.querySelectorAll("#rgrid button.say").forEach((b, i) => b.setAttribute("aria-pressed", i === state.ritem));
  const shown = document.querySelectorAll("#templates .tpl").length;
  { const g = $("templates"), n = +g.dataset.made;
    $("tplcount").innerHTML = `<strong>${shown} designs.</strong> ` + (n ? `The first ${n}, marked <span class="starkey" aria-hidden="true">★</span>, are made for ${esc(g.dataset.occ)}. The rest suit any occasion. ` : "") + "Tap one to choose it. You'll set the words and colors next."; }
  $("rnotecount").textContent = state.rnote.length + "/34";
  $("which").hidden = !multi || !list.length;
  if (multi && list.length) $("which").textContent = `Label ${state.sel + 1} of ${list.length}` + (namesMode() ? ` · ${list[state.sel][state.nameField]}` : "") + (list.length > per ? ` · Sheet ${Math.floor(state.sel / per) + 1}` : "");
  $("proofwrap").hidden = !multi || !list.length;
  clearTimeout(proofTimer);
  if (multi) proofTimer = setTimeout(buildProof, 200);

  const pages = Math.max(1, Math.ceil(list.length / per));
  $("sizeline").textContent = namesMode()
    ? `${sz.label} · ${list.length} ${list.length === 1 ? "name" : "names"} on ${pages} ${pages === 1 ? "sheet" : "sheets"} of ${per}`
    : `Actual size ${sz.label} · ${per} labels per sheet`;
  $("namecount").textContent = namesMode()
    ? `${list.length} of up to ${MAX_NAMES} names` + (list.length % per ? ` · ${per - list.length % per} labels left blank on the last sheet` : "") : "";
  { const mixing = state.path === "custom" && state.mode === "mix", n = list.length;
    $("labnav").hidden = !mixing;
    if (mixing){
      $("labstrip").innerHTML = list.map((w, i) => (n > per && i % per === 0 ? `<span class="ls">Sheet ${i / per + 1}</span>` : "")
        + `<button type="button" data-i="${i}" aria-pressed="${i === state.sel}" aria-label="Label ${i + 1}">${i + 1}</button>`).join("");
      $("labwhich").textContent = `Label ${state.sel + 1} of ${n}` + (n > per ? ` · Sheet ${Math.floor(state.sel / per) + 1}` : "");
      $("labprev").disabled = state.sel === 0;
      $("labnext").textContent = state.sel === n - 1 ? "All done" : "Next label";
    }
  }
  $("qtywrap").hidden = namesMode() || !!state.single;
  buildQty();
  { const q = state.qty, tot = q * per, sh = q === 1 ? "1 sheet" : q + " sheets", note = $("qtynote");
    note.hidden = false;
    { // fade what this design cannot change, and say why
      const lk = t.tint && t.tint.lock, off = (id, on) => { const el = $(id); el.classList.toggle("locked", !!on); el.toggleAttribute("inert", !!on); };
      off("swatches", lk === "colors"); off("customwrap", lk === "colors"); off("tones", !!lk);
      $("pallock").hidden = !lk;
      $("pallocktext").textContent = lk === "colors" ? "This design keeps its own colors so it always matches the artwork. Your words and lettering can still change."
        : "This design's artwork needs a light background, so the dark option is off. Your color choice still changes the words.";
      const fixedHead = !t.zones.main && !t.names;   // designs that draw the names themselves still take any wording
      off("rgrid", false); $("saylock").hidden = !fixedHead; $("fieldlock").hidden = !fixedHead;   // sayings stay selectable on art-headline designs; the saying's main line just has no zone and drops out
    }
    $("palhint").hidden = !(t.fillBg || t.picture) || !!(t.tint && t.tint.lock);
    $("palhint").textContent = t.picture ? "This design's artwork keeps its own colors. Your color choice changes the words." : 'On this design your color fills the whole background. Tap "Use your own color" to pick any shade.';
    $("rnotehint").hidden = !(state.path === "ready" && foldWords(t, cur).dropped);
    $("pernote").innerHTML = `Each sheet has <strong>${per} ${sizeNow().name.toLowerCase()} labels</strong> (${sizeNow().label}) · <strong>$${SHEET_PRICE.toFixed(2)}</strong> per sheet. <span class="savenote">Order 2+ sheets and 10% comes off automatically.</span>`;
    { const shn = namesMode() ? Math.max(1, Math.ceil(list.length / per)) : q;
      const base = shn * SHEET_PRICE;
      const price = shn >= 2 ? `<s>$${base.toFixed(2)}</s> $${(base * 0.9).toFixed(2)} <em>(10% off 2+ sheets)</em>` : `$${base.toFixed(2)}`;
      $("ordersum").innerHTML = namesMode() ? `<strong>${shn} ${shn > 1 ? "sheets" : "sheet"} · ${list.length} labels · ${price}</strong>` : `<strong>${sh} · ${tot} labels · ${price}</strong>`; }
    if (namesMode()){ const pg = Math.max(1, Math.ceil(list.length / per)), rem = list.length % per, blanks = rem ? per - rem : 0;
      note.innerHTML = `<strong>${pg} ${pg > 1 ? "sheets" : "sheet"} · ${list.length} labels.</strong> Your list of names sets this: one label for each name.`
        + (blanks ? `<span class="sheetwarn">Sheets are sold whole, so your last sheet has <strong>${blanks} blank ${blanks === 1 ? "label" : "labels"}</strong> you'd still pay for. <button type="button" class="linkbtn" id="fillnames">Add ${blanks} more ${blanks === 1 ? "name" : "names"}</button> or <button type="button" class="linkbtn" id="fillrepeat">fill the sheet by repeating your names</button>.</span>` : ""); }
    else
    note.innerHTML = `<strong>${sh} · ${tot} labels.</strong> ` + (
      spanReady() ? (q > 1 ? "Your mix is spread across all of them. Change how many of each under Choose your wording." : "Add a sheet to choose more sayings.")
      : everySheet() ? "Every label is its own. You'll write each one under Choose your wording."
      : multi ? (q > 1 ? (needScope() ? "Under Choose your wording, tell us whether every sheet is the same or different." : `Each sheet is a copy of the first. <button type="button" class="linkbtn" id="qtydiff">Make every sheet different</button>`) : "Add a sheet for a copy of this one, or to write more labels.")
      : `All ${tot} labels will match. Want each label different? Choose that under Choose your wording.`);
    if (state.single){ const n = state.single, price = PRICES.single[n - 1], top = n === PRICES.single.length;
      note.innerHTML = `<strong>${n} ${n === 1 ? "label" : "labels"} · $${price}.</strong> ` + (top ? `A full sheet of ${sheetHolds()} is only $${PRICES.sheet - price} more. <button type="button" class="linkbtn" id="tosheet">Get the full sheet</button>`
        : n === 1 ? `Need ${PRICES.single.length + 1} or more? A full sheet of ${sheetHolds()} is $${PRICES.sheet}.` : multi ? "Each one can be different. Write them under Choose your wording." : "They'll all match. Want each one different? Choose that under Choose your wording.");
      $("ordersum").innerHTML = `<strong>${n} ${n === 1 ? "label" : "labels"} · $${price}</strong>`;
      $("pernote").innerHTML = `Single ${sizeNow().name.toLowerCase()} labels (${sizeNow().label}), printed to order.`; }
  }
  $("approvetext").textContent = multi ? "I checked every label. Print them exactly as shown." : "I checked the spelling and layout. Print it exactly as shown.";

  const problem = screen();
  $("alert").hidden = !problem;
  $("alert").textContent = problem;
  $("approve").disabled = !!problem;
  if (problem) $("approve").checked = false;
  $("make").disabled = !$("approve").checked;
}
function buildProof(){
  const t = tplById(state.tpl), c = colors(), list = labels();
  const per = perSheet(), split = list.length > per;
  $("proof").innerHTML = list.map((w, i) => (split && i % per === 0 ? `<div class="psep">Sheet ${i / per + 1}</div>` : "")
    + `<button class="pl" data-i="${i}" aria-pressed="${i === state.sel}" aria-label="Label ${i + 1}"><svg viewBox="0 0 ${W} ${H}" aria-hidden="true"></svg></button>`).join("");
  LITE = true;
  $("proof").querySelectorAll("svg").forEach((svg, i) => { svg.innerHTML = labelMarkup(t, c, list[i]); fit(svg); });
  LITE = false;
}
