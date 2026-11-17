/* ---------- Christmas and New Year designs built from the BeauBottles clipart library ---------- */
// Each picture is one small image, placed by code, so the same artwork re-flows for every label shape.
const XM = {"bwreath":[681,650],"bbow":[300,102],"bswag":[560,244],"born1":[143,170],"born2":[151,185],"born3":[139,150],"born4":[139,170],"born5":[131,185],"born6":[137,165],"born7":[102,180],"bstar1":[29,170],"bstar2":[26,210],"bstar3":[22,95],"bbranch":[420,150],"wc_house":[334,280],"wc_mitt1":[151,230],"wc_mitt2":[156,230],"wc_cup":[215,220],"wc_gift":[210,215],"wc_bell":[157,225],"wc_cookie":[159,190],"wc_orn1":[154,185],"wc_orn2":[153,185],"wc_orn3":[146,190],"wc_orn4":[161,190],"wc_cone":[134,185],"wc_cane":[214,230],"wc_snow1":[103,110],"wc_snow2":[95,95],"mcscript":[900,252],"garland":[1150,563],"cwreath":[626,640],"hwreath":[624,640],"mcrope":[1000,501],"tree":[529,680],"nutcracker":[404,760],"ny1":[163,305],"ny2":[119,240],"ny3":[269,444],"ny4":[158,221],"ny5":[239,176],"ny6":[97,246],"ny7":[105,156],"ny8":[308,200],"ny9":[167,288],"nybunting":[520,201],"ck1":[129,280],"ck2":[155,265],"ck3":[167,244],"ck4":[96,264],"ck5":[130,297],"ck6":[158,263],"ck7":[158,266],"ck8":[173,245],"ck9":[150,279],"ck10":[122,212],"ckbottle":[104,336],"poin1":[270,260],"poin2":[237,260],"berry1":[163,200],"berry2":[187,250],"pine1":[198,300],"pine2":[98,200],"pine3":[93,200],"pine4":[113,190],"leaf1":[131,280],"lights":[1050,456],"nb_nut":[207,620],"nb_king":[259,620],"nb_mouse":[504,520],"nb_dancer":[350,560],"nb_fairy":[364,560],"nb_tree":[215,320],"nb_orn1":[135,190],"nb_orn2":[114,240],"nb_bell":[100,170],"nb_candy":[230,127],"nb_bow":[136,150],"nb_house":[85,190],"nb_cane1":[111,160],"nb_cane2":[123,170],"nb_mint1":[64,64],"nb_mint2":[64,64],"nb_star1":[78,80],"nb_star2":[87,90],"nb_sprig1":[142,150],"nb_sprig2":[170,110],"nb_sprig3":[86,170],"gb1":[181,294],"gb2":[139,240],"gb3":[231,253],"gb4":[180,236],"gb5":[138,241],"gbstar":[148,146],"gbflake":[57,64],"sp1":[148,211],"sp2":[119,310],"sp3":[138,403],"sp4":[140,252],"sp5":[150,254],"frame1":[595,860],"frame2":[613,860],"frame3":[585,860],"frame4":[603,860],"frame5":[627,860],"frame6":[590,860],"ny_party":[410,520],"ny_cheers":[425,520],"ny_sparkle":[487,520],"ny_countdown":[355,520],"ny_vibes":[280,520],"psanta":[462,560],"ptile":[440,440],"bucket":[536,640],"tartan":[400,340],"ribbon":[1280,853]};
const xm = (id, cx, cy, h, rot = 0, flip = false) => { const [w0, h0] = XM[id], k = h / h0;
  return `<use href="#xm-${id}" transform="translate(${n1(cx)} ${n1(cy)}) rotate(${rot}) scale(${(flip ? -k : k).toFixed(4)} ${k.toFixed(4)}) translate(${-w0 / 2} ${-h0 / 2})"/>`; };
const xmW = (id, h) => h * XM[id][0] / XM[id][1];
// A row of pictures standing on one line. k = label units per image pixel, so they keep their true relative sizes.
function xmRow(ids, x0, x1, base, k){
  const ws = ids.map(id => XM[id][0] * k), gap = (x1 - x0 - ws.reduce((a, b) => a + b, 0)) / ids.length; let x = x0 + gap / 2, s = "";
  ids.forEach((id, i) => { const h = XM[id][1] * k; s += xm(id, x + ws[i] / 2, base - h / 2, h); x += ws[i] + gap; });
  return s;
}
const lightPal = c => c.dark ? resolvePalette(state.pal < 0 ? customPalette(state.custom) : PALETTES[state.pal], false) : c;
const fixedPal = (bg, ink, dark) => Object.assign(c => ({...c, bg, ink, t:ink, t2:ink, dark:!!dark}), {lock:"colors"});   // lock tells the color step what to fade
const softPal = (bg, min = 7) => Object.assign(c => { const l = lightPal(c), b = bg || l.bg, ink = ensure(l.ink, b, min); return {...l, bg:b, ink, t:ensure(l.a, b, 3.2), t2:ink, dark:false}; }, {lock:"tone"});
// The words sit in a box: x = center, y0..y1 = top and bottom, w = widest line.
const xmZones = (box, f = "script") => { const y = k => () => { const q = box(); return q.y0 + k * (q.y1 - q.y0); }, w = k => () => box().w * k, x = () => box().x;
  return {top:{y:y(.12), w:w(.9), x, font:F.sans, size:11, ls:.28, upper:true}, main:{y:y(.42), w:w(1), x, ...mainFont(f), fill:"t"},
    detail:{y:y(.68), w:w(.9), x, font:f === "script" ? F.serif : F.script, size:f === "script" ? 15 : 21, weight:500}, msg:{y:y(.88), w:w(.86), x, font:F.serif, size:13, italic:true}}; };
const XMAS = ["Christmas", "Holiday client gift"];
const wreathBox = () => { const d = Math.min(W, H) * .95; return {x:W / 2, y0:H / 2 - d * .2, y1:H / 2 + d * .2, w:d * .56}; };
function scallop(c){
  const m = 15 * S, r = 8.5 * S, nx = Math.round((W - 2 * m) / (2 * r)), ny = Math.round((H - 2 * m) / (2 * r)), dx = (W - 2 * m) / nx, dy = (H - 2 * m) / ny;
  let s = `<rect x="${n1(m)}" y="${n1(m)}" width="${n1(W - 2 * m)}" height="${n1(H - 2 * m)}" fill="${c.a}"/>`;
  for (let i = 0; i < nx; i++) s += `<circle cx="${n1(m + (i + .5) * dx)}" cy="${n1(m)}" r="${n1(dx / 2)}" fill="${c.a}"/><circle cx="${n1(m + (i + .5) * dx)}" cy="${n1(H - m)}" r="${n1(dx / 2)}" fill="${c.a}"/>`;
  for (let j = 0; j < ny; j++) s += `<circle cx="${n1(m)}" cy="${n1(m + (j + .5) * dy)}" r="${n1(dy / 2)}" fill="${c.a}"/><circle cx="${n1(W - m)}" cy="${n1(m + (j + .5) * dy)}" r="${n1(dy / 2)}" fill="${c.a}"/>`;
  const i1 = m + 9 * S, i2 = i1 + 5 * S;
  return s + `<rect x="${n1(i1)}" y="${n1(i1)}" width="${n1(W - 2 * i1)}" height="${n1(H - 2 * i1)}" rx="${n1(5 * S)}" fill="${c.bg}"/>`
    + `<rect x="${n1(i2)}" y="${n1(i2)}" width="${n1(W - 2 * i2)}" height="${n1(H - 2 * i2)}" rx="${n1(3 * S)}" fill="none" stroke="${c.b}" stroke-width="${n1(1.4 * S)}"/>`;
}
const XM_DESIGNS = [
  {id:"xm-bluewreath", name:"Blue Willow Wreath", subs:XMAS.concat("Hanukkah"), picture:true, tint:softPal("#ffffff"),
   art:() => { const d = Math.min(W, H) * .95, hang = (id, x, len, h) => xm(id, x, len / 2, len) ;
     let s = xm("bwreath", W / 2, H / 2 + 4 * S, d);
     if (wide()){ const o = 56 * S, line = (x, l) => `<line x1="${n1(x)}" y1="0" x2="${n1(x)}" y2="${n1(l)}" stroke="#3f5fa6" stroke-width="${n1(1.1 * S)}"/>`;
       [[.055, 108, "born1"], [.155, 30, "born5"], [.845, 26, "born2"], [.945, 96, "born7"]].forEach(([fx, l, id]) => { s += line(fx * W, l * S) + xm(id, fx * W, l * S + o / 2 - 2 * S, o); });
       s += xm("bstar1", .105 * W, 28 * S, 56 * S) + xm("bstar1", .895 * W, 24 * S, 48 * S); }
     return s; },
   zones:xmZones(wreathBox)},
  {id:"xm-blueorn", name:"Blue Ornaments", subs:XMAS.concat("Hanukkah"), picture:true, tint:softPal("#ffffff"),
   art:() => { const o = (wide() ? 58 : 70) * S, line = (x, l) => `<line x1="${n1(x)}" y1="0" x2="${n1(x)}" y2="${n1(l)}" stroke="#3f5fa6" stroke-width="${n1(1.1 * S)}"/>`;
     const set = wide() ? [[.08, 44, "born1"], [.22, 70, "born2"], [.36, 34, "born3"], [.5, 62, "born5"], [.64, 30, "born6"], [.78, 72, "born4"], [.92, 46, "born7"]]
       : [[.13, 56, "born1"], [.32, 104, "born2"], [.5, 50, "born5"], [.68, 112, "born4"], [.87, 62, "born7"]];
     let s = ""; set.forEach(([fx, l, id]) => { s += line(fx * W, l * S) + xm(id, fx * W, l * S + o / 2 - 2 * S, o); });
     set.slice(0, -1).forEach(([fx], i) => { const x = (fx + set[i + 1][0]) / 2 * W, id = i % 2 ? "bstar3" : "bstar1", h = (i % 2 ? 30 : 52) * S; s += xm(id, x, h / 2, h); });
     return s; },
   zones:xmZones(() => wide() ? {x:W / 2, y0:.58 * H, y1:.95 * H, w:.8 * W} : {x:W / 2, y0:.58 * H, y1:.94 * H, w:.84 * W})},
  {id:"xm-poinsettia", name:"Poinsettia", subs:XMAS, picture:true, tint:softPal(null),
   art:() => { const k = S * (wide() ? 1.08 : 1.12), cl = (ox, oy, f) => { const X = dx => f ? W - ox - dx * k : ox + dx * k, Y = dy => f ? H - oy - dy * k : oy + dy * k, R = a => f ? a + 180 : a;
       return xm("pine1", X(64), Y(30), 116 * k, R(-62)) + xm("pine2", X(26), Y(74), 86 * k, R(-150)) + xm("leaf1", X(96), Y(22), 84 * k, R(70)) + xm("berry1", X(22), Y(100), 60 * k, R(160))
         + xm("berry2", X(112), Y(34), 62 * k, R(60)) + xm("poin1", X(44), Y(42), 92 * k, R(0)); };
     return cl(0, 0, false) + cl(0, 0, true); },
   zones:xmZones(() => wide() ? {x:W / 2, y0:.26 * H, y1:.76 * H, w:.52 * W} : {x:W / 2, y0:.33 * H, y1:.7 * H, w:.6 * W})},
  {id:"xm-pine", name:"Pine Garland", subs:XMAS, picture:true, tint:softPal(null),
   art:() => { const w = wide() ? W * 1.04 : W * 1.5, h = w * XM.garland[1] / XM.garland[0];
     return xm("garland", W / 2, h * .34, h) + (wide() ? "" : xm("garland", W / 2, H - h * .2, h, 180)); },
   zones:xmZones(() => wide() ? {x:W / 2, y0:.5 * H, y1:.94 * H, w:.8 * W} : {x:W / 2, y0:.4 * H, y1:.76 * H, w:.82 * W})},
  {id:"xm-bowtree", name:"Pink Bow Tree", subs:XMAS, picture:true, tint:softPal("#fffaf6"),
   art:() => wide() ? xm("tree", .25 * W, .5 * H, .95 * H) : xm("tree", .5 * W, .3 * H, .58 * H),
   zones:xmZones(() => wide() ? {x:.71 * W, y0:.22 * H, y1:.8 * H, w:.5 * W} : {x:W / 2, y0:.62 * H, y1:.96 * H, w:.84 * W})},
  {id:"xm-nutcracker", name:"Nutcracker", subs:XMAS, picture:true, tint:softPal("#fbf8ed"),
   art:() => { const h = (wide() ? .94 : .88) * H; return xm("nutcracker", (wide() ? 8 : -12) * S + xmW("nutcracker", h) / 2, .5 * H, h); },
   zones:xmZones(() => { const fw = (wide() ? 8 : -22) * S + xmW("nutcracker", (wide() ? .94 : .88) * H); return {x:(fw + W - 6 * S) / 2, y0:.2 * H, y1:.8 * H, w:W - fw - (wide() ? 24 : 14) * S}; })},
  {id:"xm-cocktails", name:"Christmas Cocktails", subs:XMAS.concat("New Year's"), picture:true, tint:fixedPal("#f7ebe1", "#b02e23"),
   art:() => xmRow(wide() ? ["ck1", "ck2", "ck3", "ckbottle", "ck4", "ck6", "ck8", "ck10"] : ["ck2", "ck3", "ckbottle", "ck6", "ck8"], 8 * S, W - 8 * S, H - 9 * S, (wide() ? .40 : .34) * H / 280),
   zones:xmZones(() => wide() ? {x:W / 2, y0:.07 * H, y1:.5 * H, w:.8 * W} : {x:W / 2, y0:.08 * H, y1:.56 * H, w:.84 * W})},
  {id:"xm-spritz", name:"Holiday Spritz", subs:XMAS.concat("New Year's"), picture:true, tint:fixedPal("#004935", "#ffffff", true),
   art:() => xmRow(wide() ? ["sp1", "sp2", "sp3", "sp4", "sp5"] : ["sp2", "sp3", "sp5"], (wide() ? 30 : 16) * S, W - (wide() ? 30 : 16) * S, H - 10 * S, (wide() ? .5 : .44) * H / 403),
   zones:xmZones(() => wide() ? {x:W / 2, y0:.06 * H, y1:.42 * H, w:.8 * W} : {x:W / 2, y0:.07 * H, y1:.46 * H, w:.84 * W})},
  {id:"xm-gingerbread", name:"Gingerbread Lane", subs:XMAS, picture:true, tint:fixedPal("#f7d0d4", "#7a3518"),
   art:() => { const fl = (fx, fy, h) => xm("gbflake", fx * W, fy * H, h * S);
     return xmRow(wide() ? ["gb2", "gb1", "gb4", "gb3", "gb5", "gbstar"] : ["gb1", "gb4", "gb3"], 10 * S, W - 10 * S, H - 9 * S, (wide() ? .38 : .32) * H / 294)
       + fl(.06, .1, 15) + fl(.94, .12, 17) + fl(.16, .34, 11) + fl(.86, .38, 12) + fl(.5, .06, 10) + fl(.3, .08, 8) + fl(.72, .07, 9); },
   zones:xmZones(() => wide() ? {x:W / 2, y0:.1 * H, y1:.54 * H, w:.72 * W} : {x:W / 2, y0:.12 * H, y1:.6 * H, w:.8 * W})},
  {id:"xm-candywreath", name:"Candy Cane Wreath", subs:XMAS, picture:true, tint:fixedPal("#172230", "#ffffff", true),
   art:() => xm("cwreath", W / 2, H / 2, Math.min(W, H) * .93), zones:xmZones(() => { const q = wreathBox(); return {...q, w:q.w * .92}; })},
  {id:"xm-hollywreath", name:"Holly Wreath", subs:XMAS, picture:true, tint:softPal(null),
   art:() => xm("hwreath", W / 2, H / 2, Math.min(W, H) * .95), zones:xmZones(wreathBox)},
  {id:"xm-scallop", name:"Scalloped Frame", subs:XMAS.concat("New Year's"), art:scallop,
   zones:xmZones(() => ({x:W / 2, y0:.26 * H, y1:.76 * H, w:W - 96 * S}))},
  {id:"xm-midnight", name:"Midnight Party", subs:["New Year's"], picture:true, tint:softPal("#ffffff"),
   art:() => { const bw = (wide() ? .34 : .62) * W, bh = bw * XM.nybunting[1] / XM.nybunting[0];
     return (wide() ? xm("nybunting", .2 * W, bh / 2 - 2 * S, bh) + xm("nybunting", .8 * W, bh / 2 - 2 * S, bh, 0, true) : xm("nybunting", W / 2, bh / 2 - 2 * S, bh))
       + xmRow(wide() ? ["ny2", "ny5", "ny1", "ny3", "ny4", "ny7", "ny8"] : ["ny2", "ny1", "ny3", "ny4"], 8 * S, W - 8 * S, H - 8 * S, (wide() ? .37 : .31) * H / 305); },
   zones:xmZones(() => wide() ? {x:W / 2, y0:.1 * H, y1:.56 * H, w:.6 * W} : {x:W / 2, y0:.24 * H, y1:.64 * H, w:.84 * W}, "display")}
];

/* second batch: fixed lettering, the Nutcracker set, watercolor pieces, colored lights and the frame set */
let xmN = 0;
// Lettering artwork is stored as a white stencil, so it prints in whatever ink color the label uses.
const xmInk = (id, cx, cy, h, col) => { const m = "xk" + (xmN++);
  return `<mask id="${m}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${xm(id, cx, cy, h)}</mask><rect width="${W}" height="${H}" fill="${col}" mask="url(#${m})"/>`; };
// Designs whose headline is artwork only take the smaller lines.
const xmSub = box => { const z = xmZones(box), y = k => () => { const q = box(); return q.y0 + k * (q.y1 - q.y0); };
  // The design's artwork is the headline, so a ready-made saying's main line has no zone (it drops out); its eyebrow (top),
  // tagline (msg) and the name/note (detail) print around the artwork. flow re-stacks them to fit the space below the art.
  return {top:{...z.top, y:y(.05)}, msg:{...z.msg, y:y(.46)}, detail:{...z.detail, y:y(.86), font:F.serif, size:12, weight:500}}; };
const NYE = ["New Year's"];
// With no smaller lines typed, the lettering sits in the middle of the label on its own.
const xmHasSub = w => !!w && !!((w.top || "").trim() || (w.detail || "").trim() || (!SMALL && (w.msg || "").trim()));
const xmLetter = (id, name, lid) => ({id, name, subs:NYE,
  art:(c, words) => { const [w0, h0] = XM[lid], a = w0 / h0, alone = !xmHasSub(words), h = alone ? Math.min(.8 * H, .8 * W / a) : wide() ? Math.min(.84 * H, .46 * W / a) : Math.min(.56 * H, .86 * W / a);
    return frame(9, c.a, 1) + (alone ? xmInk(lid, W / 2, H / 2, h, c.ink) : wide() ? xmInk(lid, .27 * W, .5 * H, h, c.ink) : xmInk(lid, W / 2, .35 * H, h, c.ink)); },
  zones:xmSub(() => wide() ? {x:.72 * W, y0:.3 * H, y1:.72 * H, w:.42 * W} : {x:W / 2, y0:.68 * H, y1:.92 * H, w:.8 * W})});
// One tall figure beside the words (wide labels) or under them (square labels).
const xmFigure = (id, name, fid, hw, bg) => ({id, name, subs:XMAS, picture:true, tint:softPal(bg),
  art:() => { if (wide()){ const h = hw * H; return xm(fid, 12 * S + xmW(fid, h) / 2, H / 2, h); } const h = Math.min(.54 * H, .8 * W * XM[fid][1] / XM[fid][0]); return xm(fid, W / 2, H - 8 * S - h / 2, h); },
  zones:xmZones(() => { if (wide()){ const fw = 12 * S + xmW(fid, hw * H); return {x:(fw + W - 8 * S) / 2, y0:.2 * H, y1:.8 * H, w:W - fw - 26 * S}; } return {x:W / 2, y0:.07 * H, y1:.4 * H, w:.84 * W}; })});
const xmHang = (set, line) => { const o = (wide() ? 58 : 70) * S; let s = "";
  set.forEach(([fx, l, id]) => { s += `<line x1="${n1(fx * W)}" y1="0" x2="${n1(fx * W)}" y2="${n1(l * S)}" stroke="${line}" stroke-width="${n1(1.1 * S)}"/>` + xm(id, fx * W, l * S + o / 2 - 2 * S, o); });
  return s; };
// A frame picture stretched to the label; frames are drawn upright, so wide labels turn them on their side.
const xmFrame = (id, name, fid, ix, iy, pal, subs) => ({id, name, subs:subs || XMAS, picture:true, tint:pal,
  art:() => { const [w0, h0] = XM[fid], m = 5 * S;
    return wide() ? `<use href="#xm-${fid}" transform="translate(${n1(W / 2)} ${n1(H / 2)}) rotate(90) scale(${((H - 2 * m) / w0).toFixed(4)} ${((W - 2 * m) / h0).toFixed(4)}) translate(${-w0 / 2} ${-h0 / 2})"/>`
      : `<use href="#xm-${fid}" transform="translate(${n1(m)} ${n1(m)}) scale(${((W - 2 * m) / w0).toFixed(4)} ${((H - 2 * m) / h0).toFixed(4)})"/>`; },
  zones:xmZones(() => { const fx = wide() ? iy : ix, fy = wide() ? ix : iy; return {x:W / 2, y0:fy * H + 12 * S, y1:H - fy * H - 12 * S, w:W * (1 - 2 * fx) - 18 * S}; })});
const panelPal = (panel, min = 7) => Object.assign(c => { const l = lightPal(c), ink = ensure(l.ink, panel, min); return {...l, bg:"#ffffff", ink, t:ink, t2:ink, dark:false}; }, {lock:"tone"});
XM_DESIGNS.push(
  {id:"xm-mcscript", name:"Merry Christmas Script", subs:XMAS,
   art:(c, words) => { const a = XM.mcscript[0] / XM.mcscript[1], w = (wide() ? .8 : .9) * W; return frame(9, c.a, 1) + xmInk("mcscript", W / 2, xmHasSub(words) ? (wide() ? .4 : .36) * H : H / 2, w / a, c.ink); },
   zones:xmSub(() => wide() ? {x:W / 2, y0:.68 * H, y1:.92 * H, w:.7 * W} : {x:W / 2, y0:.6 * H, y1:.9 * H, w:.8 * W})},
  {id:"xm-mcrope", name:"Candy Cane Christmas", subs:XMAS, picture:true, tint:fixedPal("#fdeae6", "#a8261c"),
   art:(c, words) => { const a = XM.mcrope[0] / XM.mcrope[1], sub = xmHasSub(words), w = (wide() ? (sub ? .64 : .78) : .92) * W; return xm("mcrope", W / 2, sub ? (wide() ? .4 : .36) * H : H / 2, w / a); },
   zones:xmSub(() => wide() ? {x:W / 2, y0:.74 * H, y1:.94 * H, w:.7 * W} : {x:W / 2, y0:.66 * H, y1:.92 * H, w:.8 * W})},
  xmLetter("xm-ny-party", "Party Like It's Midnight", "ny_party"), xmLetter("xm-ny-cheers", "Cheers to the New Year", "ny_cheers"), xmLetter("xm-ny-sparkle", "Sparkle Into the New Year", "ny_sparkle"),
  xmLetter("xm-ny-countdown", "Countdown to Magic", "ny_countdown"), xmLetter("xm-ny-vibes", "New Year, New Vibes", "ny_vibes"),
  {id:"xm-lights", name:"Merry Lights", subs:XMAS.concat("New Year's", "Hanukkah"), picture:true, tint:softPal(null),
   art:() => { const w = (wide() ? 1.0 : 1.3) * W, h = w * XM.lights[1] / XM.lights[0]; return xm("lights", W / 2, h * .42, h) + (wide() ? "" : xm("lights", W / 2, H - h * .34, h, 180)); },
   zones:xmZones(() => wide() ? {x:W / 2, y0:.52 * H, y1:.94 * H, w:.8 * W} : {x:W / 2, y0:.4 * H, y1:.72 * H, w:.82 * W})},
  {id:"xm-ballet", name:"Nutcracker Ballet", subs:XMAS, picture:true, tint:softPal("#fffaf3"),
   art:() => { const st = (fx, fy, h, id = "nb_star1") => xm(id, fx * W, fy * H, h * S);
     return wide() ? xm("nb_king", .135 * W, .5 * H, .93 * H) + xm("nb_dancer", .85 * W, .52 * H, .84 * H) + st(.3, .13, 17) + st(.64, .88, 15, "nb_star2") + st(.56, .1, 10, "nb_mint1") + st(.33, .88, 10, "nb_mint2")
       : xm("nb_king", .2 * W, .7 * H, .56 * H) + xm("nb_dancer", .72 * W, .72 * H, .5 * H) + st(.1, .1, 15) + st(.9, .12, 13, "nb_star2") + st(.47, .52, 10, "nb_mint1"); },
   zones:xmZones(() => wide() ? {x:.48 * W, y0:.22 * H, y1:.78 * H, w:.4 * W} : {x:W / 2, y0:.08 * H, y1:.4 * H, w:.76 * W})},
  xmFigure("xm-toysoldier", "Toy Soldier", "nb_nut", .92, "#fffaf3"), xmFigure("xm-fairy", "Sugar Plum Fairy", "nb_fairy", .92, "#fffaf3"), xmFigure("xm-mouseking", "Mouse King", "nb_mouse", .74, "#fffaf3"),
  {id:"xm-sugarplum", name:"Sugar Plum", subs:XMAS, picture:true, tint:softPal("#fffaf3"),
   art:() => { const ids = ["nb_orn1", "nb_sprig1", "nb_mint1", "nb_bell", "nb_star2", "nb_cane1", "nb_bow", "nb_sprig3", "nb_mint2", "nb_house", "nb_star1", "nb_candy", "nb_orn2", "nb_cane2"], m = 27 * S, sp = 52 * S,
       nx = Math.max(3, Math.round((W - 2 * m) / sp)), ny = Math.max(2, Math.round((H - 2 * m) / sp)), r = rng(31), pts = [];
     for (let i = 0; i <= nx; i++){ pts.push([m + i * (W - 2 * m) / nx, m]); pts.push([m + i * (W - 2 * m) / nx, H - m]); }
     for (let j = 1; j < ny; j++){ pts.push([m, m + j * (H - 2 * m) / ny]); pts.push([W - m, m + j * (H - 2 * m) / ny]); }
     return pts.map((q, i) => { const id = ids[(i * 5 + (i >> 1)) % ids.length], small = /mint|star/.test(id), box = (small ? 22 : 42) * S, [w0, h0] = XM[id], h = box * Math.min(1, h0 / w0); return xm(id, q[0], q[1], h, r() * 24 - 12); }).join(""); },
   zones:xmZones(() => ({x:W / 2, y0:.32 * H, y1:.7 * H, w:W - 130 * S}))},
  {id:"xm-cozy", name:"Cozy Christmas", subs:XMAS, picture:true, tint:softPal(null),
   art:() => xmRow(wide() ? ["wc_mitt1", "wc_cup", "wc_house", "wc_gift", "wc_bell", "wc_mitt2"] : ["wc_cup", "wc_house", "wc_gift"], 10 * S, W - 10 * S, H - 9 * S, (wide() ? .34 : .27) * H / 240)
     + xm("wc_snow1", .07 * W, .14 * H, 26 * S) + xm("wc_snow2", .93 * W, .16 * H, 22 * S),
   zones:xmZones(() => wide() ? {x:W / 2, y0:.08 * H, y1:.52 * H, w:.72 * W} : {x:W / 2, y0:.1 * H, y1:.58 * H, w:.78 * W})},
  {id:"xm-redorn", name:"Red & Green Ornaments", subs:XMAS, picture:true, tint:softPal(null),
   art:() => xmHang(wide() ? [[.08, 44, "wc_orn1"], [.22, 72, "wc_orn3"], [.36, 34, "wc_cone"], [.5, 64, "wc_orn2"], [.64, 30, "wc_orn4"], [.78, 74, "wc_orn1"], [.92, 46, "wc_orn3"]]
     : [[.13, 56, "wc_orn1"], [.32, 104, "wc_orn3"], [.5, 50, "wc_orn2"], [.68, 112, "wc_orn4"], [.87, 62, "wc_cone"]], "#a8875a"),
   zones:xmZones(() => wide() ? {x:W / 2, y0:.58 * H, y1:.95 * H, w:.8 * W} : {x:W / 2, y0:.58 * H, y1:.94 * H, w:.84 * W})},
  xmFrame("xm-frame-rope", "Candy Rope Frame", "frame1", .13, .1, panelPal("#efeeed")),
  xmFrame("xm-frame-pink", "Pink Scallop Frame", "frame2", .2, .14, panelPal("#efeeed"), XMAS.concat("Valentine's Day", "Galentine's")),
  xmFrame("xm-frame-red", "Red Velvet Frame", "frame3", .14, .1, fixedPal("#ffffff", "#ffffff", true)),
  xmFrame("xm-frame-hearts", "Sweetheart Frame", "frame4", .2, .15, fixedPal("#ffffff", "#ffffff", true), XMAS.concat("Valentine's Day", "Galentine's")),
  xmFrame("xm-frame-wave", "Green Wave Frame", "frame5", .17, .13, panelPal("#efeeed")),
  xmFrame("xm-frame-loop", "Loop Frame", "frame6", .14, .1, panelPal("#efeeed"))
);

/* Pink Santa set: made from the Watercolor Pink Santa wrap artwork, to pair with that wrap */
const PS_PINK = "#fcedf2", PS_INK = "#8a3f5f";
const psBox = () => wide() ? {x:.68 * W, y0:.24 * H, y1:.78 * H, w:.46 * W} : {x:W / 2, y0:.62 * H, y1:.94 * H, w:.8 * W};
const psSanta = () => wide() ? xm("psanta", .24 * W, .5 * H, .8 * H) : xm("psanta", .5 * W, .32 * H, .5 * H);
XM_DESIGNS.unshift(
  {id:"xm-pinksanta", name:"Pink Santa", subs:XMAS, picture:true, tint:fixedPal(PS_PINK, PS_INK),
   art:() => { const m = 8 * S; return `<rect x="${n1(m)}" y="${n1(m)}" width="${n1(W - 2 * m)}" height="${n1(H - 2 * m)}" rx="${n1(7 * S)}" fill="none" stroke="#ffffff" stroke-width="${n1(2 * S)}"/>` + psSanta(); },
   zones:xmZones(psBox)},
  {id:"xm-pinksanta-scallop", name:"Pink Santa Scallop", subs:XMAS, picture:true, tint:fixedPal("#ffffff", PS_INK),
   art:() => scallop({a:"#f6c9d8", b:"#f1b3c8", bg:"#ffffff"}) + (wide() ? xm("psanta", .25 * W, .5 * H, .7 * H) : xm("psanta", .5 * W, .33 * H, .44 * H)),
   zones:xmZones(() => wide() ? {x:.67 * W, y0:.26 * H, y1:.76 * H, w:.42 * W} : {x:W / 2, y0:.62 * H, y1:.9 * H, w:.68 * W})},
  {id:"xm-pinksanta-pattern", name:"Pink Santa Pattern", subs:XMAS, picture:true, tint:fixedPal(PS_PINK, PS_INK),
   art:() => { const id = "xp" + (xmN++), t = (wide() ? .6 : .5) * H, px = (wide() ? .17 : .12) * W, py = (wide() ? .2 : .24) * H;
     return `<pattern id="${id}" width="${n1(t)}" height="${n1(t)}" patternUnits="userSpaceOnUse" patternTransform="translate(${n1(W / 2 - t / 2)} ${n1(H / 2 - t / 2)})"><use href="#xm-ptile" transform="scale(${(t / 440).toFixed(4)})"/></pattern>`
       + `<rect width="${W}" height="${H}" fill="url(#${id})"/><rect x="${n1(px)}" y="${n1(py)}" width="${n1(W - 2 * px)}" height="${n1(H - 2 * py)}" rx="${n1(8 * S)}" fill="#ffffff"/>`
       + `<rect x="${n1(px + 4 * S)}" y="${n1(py + 4 * S)}" width="${n1(W - 2 * px - 8 * S)}" height="${n1(H - 2 * py - 8 * S)}" rx="${n1(5 * S)}" fill="none" stroke="#f1b3c8" stroke-width="${n1(1.2 * S)}"/>`; },
   zones:xmZones(() => { const px = (wide() ? .17 : .12) * W, py = (wide() ? .2 : .24) * H; return {x:W / 2, y0:py + 14 * S, y1:H - py - 14 * S, w:W - 2 * px - 30 * S}; })}
);

/* Tartan: the BeauBottles red tartan photograph, tiled as a border around a ruled white panel. Colors are fixed to suit the plaid. */
const TARTAN_FOR = XMAS.concat("New Year's", "Thanksgiving", "Friendsgiving");
const TARTAN_RED = "#c4161c", TARTAN_NAVY = "#1d3557";
function tartan(){
  const id = "tn" + (xmN++), [w0, h0] = XM.tartan, T = 118 * S, k = T / w0;
  return `<pattern id="${id}" width="${n1(T)}" height="${n1(h0 * k)}" patternUnits="userSpaceOnUse" patternTransform="translate(${n1(W / 2 - T * .32)} ${n1(H / 2 - h0 * k * .3)})"><use href="#xm-tartan" transform="scale(${k.toFixed(4)})"/></pattern>`
    + `<rect width="${W}" height="${H}" fill="url(#${id})"/>`;
}
const tartanM = () => (wide() ? 27 : 30) * S;
const tartanPanel = c => { const m = tartanM(), r = m + 4.5 * S;
  return `<rect x="${n1(m)}" y="${n1(m)}" width="${n1(W - 2 * m)}" height="${n1(H - 2 * m)}" fill="#ffffff"/><rect x="${n1(r)}" y="${n1(r)}" width="${n1(W - 2 * r)}" height="${n1(H - 2 * r)}" fill="none" stroke="${TARTAN_NAVY}" stroke-width="${n1(1.5 * S)}"/>`; };
XM_DESIGNS.push(
  {id:"xm-tartan", name:"Tartan Frame", subs:TARTAN_FOR, picture:true, tint:fixedPal(TARTAN_RED, TARTAN_NAVY), art:c => tartan() + tartanPanel(c),
   zones:xmZones(() => { const m = tartanM() + 12 * S; return {x:W / 2, y0:m + 8 * S, y1:H - m - 8 * S, w:W - 2 * m - 16 * S}; }, "display")},
  {id:"xm-tartan-photo", name:"Tartan Photo", subs:TARTAN_FOR, photo:true, picture:true, tint:Object.assign(c => ({...c, bg:TARTAN_RED, ink:TARTAN_NAVY, t:TARTAN_NAVY, t2:TARTAN_NAVY, dark:false, onPhoto:"#ffffff"}), {lock:"colors"}),
   art:c => { const m = tartanM(), q = m + 8.5 * S, g = "tg" + (xmN++), ph = H - 2 * q;
     return tartan() + tartanPanel(c) + photoMark(q, q, W - 2 * q, ph)
       + `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></linearGradient>`
       + `<rect x="${n1(q)}" y="${n1(q + ph * .42)}" width="${n1(W - 2 * q)}" height="${n1(ph * .58)}" fill="url(#${g})"/>`; },
   zones:(() => { const z = xmZones(() => { const q = tartanM() + 8.5 * S, ph = H - 2 * q; return {x:W / 2, y0:q + ph * (wide() ? .5 : .58), y1:q + ph * .95, w:W - 2 * q - 22 * S}; }, "display"); Object.values(z).forEach(v => v.fill = "onPhoto"); return z; })()}
);

/* Ribbon & Greenery: a watercolor ribbon frame with a window, for words or a photo. The artwork is landscape, so it is offered on the Champagne label only. */
const RIB = {x0:282 / 1536, x1:1243 / 1536, y0:250 / 1024, y1:768 / 1024}, RIB_INK = "#a8324f";
const ribbonArt = () => `<use href="#xm-ribbon" transform="scale(${(W / XM.ribbon[0]).toFixed(4)} ${(H / XM.ribbon[1]).toFixed(4)})"/>`;
XM_DESIGNS.push(
  {id:"xm-ribbon", name:"Ribbon & Greenery", subs:XMAS, sizes:["champagne"], picture:true, tint:fixedPal("#ffffff", RIB_INK), art:ribbonArt,
   zones:xmZones(() => ({x:W / 2, y0:(RIB.y0 + .07) * H, y1:(RIB.y1 - .07) * H, w:(RIB.x1 - RIB.x0) * W - 34 * S}))},
  {id:"xm-ribbon-photo", name:"Ribbon & Greenery Photo", subs:XMAS, sizes:["champagne"], photo:true, picture:true, tint:fixedPal("#ffffff", RIB_INK),
   art:() => ribbonArt() + photoMark(RIB.x0 * W, RIB.y0 * H, (RIB.x1 - RIB.x0) * W, (RIB.y1 - RIB.y0) * H),
   zones:{main:{y:.842, w:.43, font:F.script, size:27}, detail:{y:.915, w:.42, font:F.serif, size:9.5, ls:.3, upper:true, weight:500}}}
);
TEMPLATES.unshift(...XM_DESIGNS);
/* Black Bow Bubbly: champagne on ice with a black bow, for celebrations well beyond the holidays. Sits at the end of each occasion's own designs. */
const BUBBLY_FOR = ["Engagement", "Wedding favors", "Bridal shower", "Rehearsal dinner", "Wedding thank-you", "Anniversary", "Vow renewal", "New Year's",
  "Birthday", "21st", "30th", "40th", "50th", "60th", "70th", "80th", "90th", "100th", "Any age", "Graduation", "New job", "Promotion", "Retirement", "New home", "You did it",
  "Hostess", "Dinner party", "Closing gift", "Client thank-you", "Work anniversary", "Grand opening", "Event favor"];
TEMPLATES.splice(XM_DESIGNS.length + THEMED.length, 0,
  {id:"xm-bubbly", name:"Black Bow Bubbly", subs:BUBBLY_FOR, picture:true, tint:softPal("#fcf3e8"),
   art:() => wide() ? xm("bucket", .225 * W, .5 * H, .86 * H) : xm("bucket", .5 * W, .32 * H, .56 * H),
   zones:xmZones(() => wide() ? {x:.735 * W, y0:.24 * H, y1:.78 * H, w:.44 * W} : {x:W / 2, y0:.66 * H, y1:.95 * H, w:.84 * W}, "display")});


/* Two more photo designs for any occasion: words over a full photo, and a photo inside a double rule */
TEMPLATES.push(
  {id:"photo3", name:"Photo Script", photo:true, flow:false, picture:true, tint:Object.assign(c => ({...c, onPhoto:"#ffffff"}), {lock:"colors"}),
   art:() => { const m = 7 * S; return photoMark(0, 0, W, H) + `<rect width="${W}" height="${H}" fill="#2a2420" opacity=".3"/>`
     + `<rect x="${n1(m)}" y="${n1(m)}" width="${n1(W - 2 * m)}" height="${n1(H - 2 * m)}" fill="none" stroke="#ffffff" stroke-width="${n1(1.4 * S)}"/>`; },
   zones:(() => { const col = () => wide() ? .76 * W : W / 2, z = {
       main:{y:() => (wide() ? .7 : .64) * H, x:() => wide() ? .3 * W : W / 2, w:() => (wide() ? .46 : .8) * W, font:F.script, size:46},
       top:{y:() => (wide() ? .56 : .46) * H, x:col, w:() => (wide() ? .4 : .76) * W, font:F.serif, size:10.5, ls:.32, upper:true, weight:500},
       detail:{y:() => (wide() ? .66 : .78) * H, x:col, w:() => (wide() ? .4 : .76) * W, font:F.serif, size:10.5, ls:.32, upper:true, weight:500},
       msg:{y:() => (wide() ? .76 : .87) * H, x:col, w:() => (wide() ? .4 : .76) * W, font:F.serif, size:10.5, ls:.32, upper:true, weight:500}};
     Object.values(z).forEach(v => v.fill = "onPhoto"); return z; })()},
  {id:"photo4", name:"Photo Double Rule", photo:true, flow:false,
   art:c => { const a = 6 * S, b = 10.5 * S; return `<rect x="${n1(a)}" y="${n1(a)}" width="${n1(W - 2 * a)}" height="${n1(H - 2 * a)}" fill="none" stroke="${c.ink}" stroke-width="${n1(2.2 * S)}"/>`
     + `<rect x="${n1(b)}" y="${n1(b)}" width="${n1(W - 2 * b)}" height="${n1(H - 2 * b)}" fill="none" stroke="${c.ink}" stroke-width="${n1(1 * S)}"/>` + photoMark(.13 * W, .215 * H, .74 * W, .47 * H); },
   zones:{top:{y:.15, w:.74, font:F.serif, size:13, ls:.34, upper:true, weight:600}, main:{y:.82, w:.76, font:F.serif, size:26, ls:.12, upper:true, weight:600},
     detail:{y:.915, w:.76, font:F.serif, size:11, ls:.3, upper:true, weight:500}}}
);
