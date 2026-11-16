/* ---------- Wedding, engagement and bridal designs built from the BeauBottles clipart library ---------- */
Object.assign(XM, {"wd_n1":[258,168],"wd_n2":[293,167],"wd_n3":[311,169],"wd_n4":[296,168],"wd_n5":[287,169],"wd_n6":[258,163],"wd_n7":[335,162],"wd_n8":[313,164],"wd_n9":[272,159],"wd_n10":[241,160],"wd_n11":[352,165],"wd_n12":[374,164],"wd_n13":[397,163],"wd_n14":[408,163],"wd_n15":[352,164],"wd_n16":[371,157],"wd_n17":[431,151],"wd_n18":[390,158],"wd_n19":[383,152],"wd_n20":[363,151],"wd_n21":[501,152],"wd_n22":[433,124],"wd_n23":[452,127],"wd_n24":[442,129],"wd_n25":[435,128],"wd_n26":[413,123],"wd_n27":[506,131],"wd_n28":[493,137],"wd_n29":[462,133],"wd_n30":[294,140],"wd_tableno":[433,175],"wd_headtable":[516,173],"wd_twigtop":[1100,128],"wd_twigbot":[1100,124],"wd_circle":[800,733],"wd_roses":[700,290],"wd_d_bottle":[150,307],"wd_d_glasses":[300,256],"wd_d_heartcake":[270,295],"wd_d_coupe":[170,249],"wd_d_bouquet":[190,367],"wd_d_bow":[200,126],"wd_d_bands":[190,164],"wd_d_cake":[300,443],"wd_d_candles":[190,471],"wd_d_hearts":[190,140],"wd_d_tower":[360,499],"wd_d_shoe":[250,206],"wd_d_bucket":[190,347],"wd_cake1":[520,784],"wd_cake2":[520,946],"wd_cake3":[520,710],"wd_savedate1":[560,1015],"wd_weddingday1":[560,486],"wd_weddingday2":[560,580],"wd_happywedding":[560,633],"wd_mrmrs":[560,738],"wd_savedate2":[560,923],"wd_justmarried":[560,483],"wd_celebratelove":[560,554],"wd_lovestory":[560,531],"wd_loveday":[560,526],"wd_rings":[1100,293],"wd_anniv":[1000,401],"wd_saidyes":[900,656],"wd_engaged":[860,614],"wd_happywed":[760,681],"wd_ring":[520,687],"wd_wreath":[1000,962],"wd_g1":[96,345],"wd_g7":[200,340],"wd_g3":[175,376],"wd_g5":[173,405],"wd_g2":[212,333],"wd_g9":[199,361],"wd_g6":[200,368],"wd_g4":[206,347],"wd_g0":[253,330],"wd_g8":[206,332]});
const WD_ALL = ["Wedding favors", "Engagement", "Bridal shower", "Bachelorette", "Bridesmaid proposal", "Groomsman proposal", "Rehearsal dinner", "Table bottles", "Wedding thank-you", "Anniversary", "Vow renewal"];
const WD_DAY = ["Wedding favors", "Rehearsal dinner", "Wedding thank-you"], WD_ENG = ["Engagement"], WD_BRIDAL = ["Bridal shower", "Bachelorette", "Bridesmaid proposal"];
// Line art is stored white-on-clear and printed in a palette color, like the hand lettering.
const wdInk = (inner, col) => { const m = "xk" + (xmN++); return `<mask id="${m}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${inner}</mask><rect width="${W}" height="${H}" fill="${col}" mask="url(#${m})"/>`; };
const wdNoMain = z => { const {main, ...rest} = z; return rest; };
// The number a label is about: the first number typed in its lines, or the birthday age.
function wdNumber(words){
  for (const k of ["main", "top", "detail"]){ const m = String((words && words[k]) || "").match(/\d{1,3}/); if (m) return +m[0]; }
  return state.group === "birthdays" && state.age ? +state.age : 1;
}
const WD_G = {"cap": 328.5, "dy": {"1": -0.5, "7": -2.9, "3": -0.5, "5": -29.3, "2": 0.0, "9": 1.0, "6": -34.2, "4": -15.6, "0": 1.0, "8": 0.0}};   // watercolor numerals: cap height and each digit's drop from the cap line, in image pixels
function wdDigits(n, cx, top, cap){
  const k = cap / WD_G.cap, ds = String(n).split(""), gap = 14 * k, ws = ds.map(d => XM["wd_g" + d][0] * k), total = ws.reduce((a, b) => a + b, 0) + gap * (ds.length - 1); let x = cx - total / 2, s = "";
  ds.forEach((d, i) => { const h = XM["wd_g" + d][1] * k; s += xm("wd_g" + d, x + ws[i] / 2, top + WD_G.dy[d] * k + h / 2, h); x += ws[i] + gap; });
  return s;
}
const wdDigitsW = (n, cap) => { const k = cap / WD_G.cap, ds = String(n).split(""); return ds.reduce((a, d) => a + XM["wd_g" + d][0] * k, 0) + 14 * k * (ds.length - 1); };
// One line drawing beside the words (wide labels) or under them (square labels).
const wdFig = (id, name, fid, hw, subs) => ({...xmFigure(id, name, fid, hw, null), subs, picture:false, tint:null,
  art:c => { if (wide()){ const h = hw * H; return frame(9, c.a, 1) + wdInk(xm(fid, 16 * S + xmW(fid, h) / 2, H / 2, h), c.ink); } const h = Math.min(.5 * H, .8 * W * XM[fid][1] / XM[fid][0]); return frame(9, c.a, 1) + wdInk(xm(fid, W / 2, H - 12 * S - h / 2, h), c.ink); }});
const wdStrip = () => { const w = W - 16 * S, k = w / 1100, x = 8 * S; return {w, k, x, top:9 * S, th:XM.wd_twigtop[1] * k, bh:XM.wd_twigbot[1] * k, ty:9 * S + 52.2 * k, by:H - 9 * S - XM.wd_twigbot[1] * k + 68.9 * k, lx:x + 37.2 * k, rx:x + 1060.6 * k}; };
const WD_PICTURES = [
  {id:"wd-wreath", name:"Greenery Wreath", subs:WD_ALL, picture:true, tint:softPal("#ffffff"),
   art:() => xm("wd_wreath", W / 2, H / 2, Math.min(W, H) * .97),
   zones:xmZones(() => { const d = Math.min(W, H) * .97; return {x:W / 2, y0:H / 2 - d * .21, y1:H / 2 + d * .21, w:d * .54}; })},
  {...xmFigure("wd-ring", "Watercolor Ring", "wd_ring", .86, "#fffdfa"), subs:WD_ENG.concat(WD_BRIDAL)},
  {id:"wd-frame", name:"Botanical Frame", subs:WD_ALL,
   art:c => { const q = wdStrip(), line = x => `<line x1="${n1(x)}" y1="${n1(q.ty)}" x2="${n1(x)}" y2="${n1(q.by)}" stroke="#fff" stroke-width="${n1(2.6 * q.k)}"/>`;
     return wdInk(xm("wd_twigtop", W / 2, q.top + q.th / 2, q.th) + xm("wd_twigbot", W / 2, H - 9 * S - q.bh / 2, q.bh) + line(q.lx) + line(q.rx), c.ink); },
   zones:xmZones(() => { const q = wdStrip(); return {x:W / 2, y0:q.top + q.th + 2 * S, y1:H - 9 * S - q.bh - 2 * S, w:(q.rx - q.lx) - 30 * S}; })},
  {id:"wd-circle", name:"Botanical Circle", subs:WD_ALL,
   art:c => { const h = Math.min(H, W * XM.wd_circle[1] / XM.wd_circle[0]) * .94; return wdInk(xm("wd_circle", W / 2 + .03 * h, H / 2, h), c.ink); },
   zones:xmZones(() => { const h = Math.min(H, W * XM.wd_circle[1] / XM.wd_circle[0]) * .94; return {x:W / 2 - .03 * h, y0:H / 2 - h * .24, y1:H / 2 + h * .22, w:h * .6}; })},
  {id:"wd-bands", name:"Wedding Bands", subs:WD_ALL,
   art:c => { const a = XM.wd_rings[1] / XM.wd_rings[0], w = wide() ? .82 * W : 1.02 * W, h = w * a; return frame(9, c.a, 1) + wdInk(xm("wd_rings", W / 2, H - 14 * S - h / 2, h), c.ink); },
   zones:xmZones(() => { const a = XM.wd_rings[1] / XM.wd_rings[0], h = (wide() ? .82 : 1.02) * W * a; return {x:W / 2, y0:.09 * H, y1:H - 16 * S - h, w:.8 * W}; })},
  {id:"wd-roses", name:"Rose Sketch", subs:WD_ALL,
   art:c => { const a = XM.wd_roses[1] / XM.wd_roses[0], w = wide() ? .56 * W : .86 * W, h = w * a; return frame(9, c.a, 1) + wdInk(xm("wd_roses", W / 2, H - 14 * S - h / 2, h), c.ink); },
   zones:xmZones(() => { const a = XM.wd_roses[1] / XM.wd_roses[0], h = (wide() ? .56 : .86) * W * a; return {x:W / 2, y0:.09 * H, y1:H - 16 * S - h, w:.8 * W}; })},
  wdFig("wd-cake1", "Tiered Cake", "wd_cake1", .8, WD_ALL), wdFig("wd-cake2", "Floral Cake", "wd_cake2", .82, WD_ALL), wdFig("wd-cake3", "Rose Cake", "wd_cake3", .76, WD_ALL),
  wdFig("wd-tower", "Champagne Tower", "wd_d_tower", .8, WD_ALL),
  {id:"wd-doodles", name:"Wedding Doodles", subs:WD_ALL,
   art:c => { const ids = wide() ? ["wd_d_glasses", "wd_d_cake", "wd_d_bands", "wd_d_tower", "wd_d_bouquet", "wd_d_bottle", "wd_d_heartcake"] : ["wd_d_glasses", "wd_d_cake", "wd_d_bands", "wd_d_bouquet"];
     return wdInk(xmRow(ids, 8 * S, W - 8 * S, H - 9 * S, (wide() ? .4 : .34) * H / 499), c.ink); },
   zones:xmZones(() => wide() ? {x:W / 2, y0:.06 * H, y1:.52 * H, w:.8 * W} : {x:W / 2, y0:.08 * H, y1:.64 * H, w:.84 * W})},
  {id:"wd-number", name:"Watercolor Number", subs:["Anniversary", "Table bottles"].concat(BDAY), picture:true, tint:softPal("#fffdfa"), uses:["main"],
   art:(c, words) => { const n = wdNumber(words); if (wide()){ const cap = Math.min(.6 * H, .4 * W * .6 * H / wdDigitsW(n, .6 * H)); return wdDigits(n, .25 * W, H / 2 - cap / 2, cap); }
     const cap = Math.min(.36 * H, .8 * W * .36 * H / wdDigitsW(n, .36 * H)); return wdDigits(n, W / 2, .09 * H, cap); },
   zones:wdNoMain(xmZones(() => wide() ? {x:.72 * W, y0:.2 * H, y1:.8 * H, w:.46 * W} : {x:W / 2, y0:.52 * H, y1:.95 * H, w:.84 * W}))},
  {id:"wd-tablescript", name:"Script Table Number", subs:["Table bottles"], uses:["main"],
   art:(c, words) => { const n = wdNumber(words), head = /head/i.test((words && words.main) || ""), id1 = head ? "wd_headtable" : "wd_tableno", id2 = !head && n >= 1 && n <= 30 ? "wd_n" + n : null, k = (wide() ? .3 : .3) * H / 175, sub = xmHasSub(words);
     const h1 = XM[id1][1] * k, h2 = id2 ? XM[id2][1] * k : 0, fit = Math.min(1, .84 * W / Math.max(XM[id1][0] * k, id2 ? XM[id2][0] * k : 0)), y = (sub ? .4 : .5) * H - (h1 + h2 * .92) * fit / 2;
     return frame(9, c.a, 1) + wdInk(xm(id1, W / 2, y + h1 * fit / 2, h1 * fit) + (id2 ? xm(id2, W / 2, y + h1 * fit * .92 + h2 * fit / 2, h2 * fit) : ""), c.ink); },
   zones:xmSub(() => wide() ? {x:W / 2, y0:.74 * H, y1:.94 * H, w:.7 * W} : {x:W / 2, y0:.7 * H, y1:.93 * H, w:.8 * W})}
];
const WD_LETTERING = [
  bdTitle("wd-saidyes", "She Said Yes", "wd_saidyes", WD_ENG, .5, .86, fixedPal("#ffffff", "#111111")),
  bdTitle("wd-engaged", "Just Engaged", "wd_engaged", WD_ENG, .48, .84, fixedPal("#cfeaf3", "#33414f")),
  bdTitle("wd-savedate1", "Save the Date", "wd_savedate1", WD_ENG, .3, .46, null, true), bdTitle("wd-savedate2", "Save the Date Script", "wd_savedate2", WD_ENG, .3, .46, null, true),
  bdTitle("wd-weddingday1", "Wedding Day", "wd_weddingday1", WD_DAY, .44, .78, null, true), bdTitle("wd-weddingday2", "Wedding Day Toast", "wd_weddingday2", WD_DAY, .42, .74, null, true),
  bdTitle("wd-happywedding", "Happy Wedding Rings", "wd_happywedding", WD_DAY, .4, .7, null, true), bdTitle("wd-happywed", "Happy Wedding Script", "wd_happywed", WD_DAY, .4, .72, null, true),
  bdTitle("wd-mrmrs", "Mr & Mrs", "wd_mrmrs", WD_DAY.concat("Vow renewal"), .36, .6, null, true), bdTitle("wd-justmarried", "Just Married", "wd_justmarried", WD_DAY.concat("Vow renewal"), .44, .78, null, true),
  bdTitle("wd-celebratelove", "Celebrate Love", "wd_celebratelove", WD_DAY.concat("Engagement", "Anniversary", "Vow renewal"), .44, .78, null, true),
  bdTitle("wd-lovestory", "Love Story", "wd_lovestory", WD_DAY.concat("Engagement", "Anniversary", "Vow renewal"), .44, .78, null, true),
  bdTitle("wd-loveday", "Happy Love Day", "wd_loveday", ["Anniversary", "Valentine's Day", "Galentine's"], .44, .78, null, true),
  bdTitle("wd-anniv", "Happy Anniversary", "wd_anniv", ["Anniversary"], .78, .94, null, true)
];
const WD_NUMBERS = WD_PICTURES.splice(-2);   // the two number designs also serve birthdays, where they should not lead the list
TEMPLATES.unshift(...WD_PICTURES);
TEMPLATES.splice(TEMPLATES.reduce((a, t, i) => t.themed ? i : a, -1) + 1, 0, ...WD_NUMBERS, ...WD_LETTERING);
