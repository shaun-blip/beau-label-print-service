/* ---------- Thanksgiving designs built from the BeauBottles clipart library ---------- */
Object.assign(XM, {"tg_hat":[620,521],"tg_feather1":[170,784],"tg_feather2":[150,737],"tg_feather3":[190,623],"tg_leaf1":[330,174],"tg_leaf2":[250,491],"tg_leaf3":[240,307],"tg_leaf4":[330,159],"tg_berry1":[190,395],"tg_berry2":[90,333],"tg_berry3":[150,383],"tg_pump1":[620,525],"tg_pump2":[460,440],"tg_pump3":[450,356],"tg_pump4":[300,279],"tg_pump5":[440,342],"tg_tendril1":[560,323],"tg_tendril2":[240,446],"tg_vine1":[480,421],"tg_vine2":[320,376],"tg_cornucopia":[680,663],"tg_tom":[560,586],"tg_white":[430,583],"tg_hen":[440,379],"tg_leaftop":[1100,366],"tg_leafbot":[1100,367],"tg_leafring":[1000,972],"tg_brush":[900,422],"tg_calli":[1000,321],"tg_fallyall":[820,789],"tg_givethanks":[1000,476],"tg_sticker":[1000,715]});
const TG = ["Thanksgiving", "Friendsgiving"];
// Lettering that is a picture: centered on its own, or above the smaller lines once the customer types them.
const tgTitle = (id, name, lid, fw, fs, pal, ink) => ({id, name, subs:TG, ...(pal ? {picture:true, tint:pal} : {}),
  art:(c, words) => { const a = XM[lid][0] / XM[lid][1], sub = xmHasSub(words), w = Math.min((wide() ? fw : fs) * W, (sub ? (wide() ? .56 : .5) : .86) * H * a), y = sub ? (wide() ? .37 : .33) * H : H / 2;
    return (ink ? frame(9, c.a, 1) + xmInk(lid, W / 2, y, w / a, c.ink) : xm(lid, W / 2, y, w / a)); },
  zones:xmSub(() => wide() ? {x:W / 2, y0:.7 * H, y1:.93 * H, w:.7 * W} : {x:W / 2, y0:.64 * H, y1:.92 * H, w:.8 * W})});
const tgRing = () => { const w = (wide() ? 1.02 : 1.2) * W, h = w * XM.tg_leafring[1] / XM.tg_leafring[0];   // the leaf ring, and the card that sits in its middle
  return {w, h, cx:W / 2 - .293 * w, cy:H / 2 - .3 * h, cw:.586 * w, ch:Math.min(.6 * h, H - 14 * S)}; };
const TG_DESIGNS = [
  {id:"tg-pumpkins", name:"Pumpkin Patch", subs:TG, picture:true, tint:softPal("#fffaf2"),
   art:() => { const ids = wide() ? ["tg_pump3", "tg_pump1", "tg_pump5", "tg_pump2"] : ["tg_pump3", "tg_pump1", "tg_pump4"], k = (wide() ? .37 : .3) * H / 525, v = (wide() ? .3 : .24) * H;
     return xm("tg_vine1", 4 * S + xmW("tg_vine1", v) / 2, 6 * S + v / 2, v, -8) + xm("tg_vine2", W - 4 * S - xmW("tg_vine2", v * .9) / 2, 6 * S + v * .45, v * .9, 8, true)
       + xmRow(ids, 6 * S, W - 6 * S, H - 7 * S, k); },
   zones:xmZones(() => wide() ? {x:W / 2, y0:.07 * H, y1:.55 * H, w:.54 * W} : {x:W / 2, y0:.2 * H, y1:.66 * H, w:.8 * W})},
  {id:"tg-tom", name:"Tom Turkey", subs:TG, picture:true, tint:softPal("#fffaf2"),
   art:() => { if (wide()){ const h = .84 * H; return xm("tg_tom", 10 * S + xmW("tg_tom", h) / 2, H / 2, h); } const h = .5 * H; return xm("tg_tom", W / 2, H - 7 * S - h / 2, h); },
   zones:xmZones(() => { if (wide()){ const fw = 10 * S + xmW("tg_tom", .84 * H); return {x:(fw + W - 8 * S) / 2, y0:.2 * H, y1:.8 * H, w:W - fw - 24 * S}; } return {x:W / 2, y0:.07 * H, y1:.42 * H, w:.84 * W}; })},
  {id:"tg-turkeys", name:"Turkey Trio", subs:TG, picture:true, tint:softPal("#fffaf2"),
   art:() => xmRow(["tg_tom", "tg_white", "tg_hen"], (wide() ? 26 : 4) * S, W - (wide() ? 26 : 4) * S, H - 7 * S, (wide() ? .5 : .32) * H / 586),
   zones:xmZones(() => wide() ? {x:W / 2, y0:.06 * H, y1:.44 * H, w:.8 * W} : {x:W / 2, y0:.08 * H, y1:.58 * H, w:.84 * W})},
  {id:"tg-cornucopia", name:"Cornucopia", subs:TG, picture:true, tint:softPal("#fffaf2"),
   art:() => { const h = (wide() ? .66 : .4) * H, cw = xmW("tg_cornucopia", h), b = H - 6 * S, x0 = 4 * S + cw, p = (wide() ? .27 : .17) * H, q = k => p * k;
     return xm("tg_leaf2", x0 - cw * .2, b - q(1.25), q(1.3), 28) + xm("tg_leaf3", x0 + q(.35), b - q(1.05), q(1.05), -30) + xm("tg_cornucopia", 4 * S + cw / 2, b - h / 2, h, 0, true)
       + xm("tg_pump2", x0 - cw * .12, b - q(.5), q(1)) + xm("tg_pump3", x0 + q(.72), b - q(.36), q(.72)) + xm("tg_pump4", x0 + q(1.5), b - q(.3), q(.6))
       + xm("tg_leaf4", x0 + q(2.25), b - q(.22), q(.42), -8) + xm("tg_berry1", x0 + q(1.12), b - q(.62), q(.8), 40); },
   zones:xmZones(() => wide() ? {x:.69 * W, y0:.08 * H, y1:.6 * H, w:.54 * W} : {x:W / 2, y0:.07 * H, y1:.5 * H, w:.84 * W})},
  {id:"tg-leafframe", name:"Autumn Leaf Frame", subs:TG, picture:true, tint:softPal("#ffffff"),
   art:c => { const r = tgRing(), x = W / 2 - r.cw / 2, y = H / 2 - r.ch / 2, m = 7 * S, m2 = 10 * S;
     return xm("tg_leafring", W / 2, H / 2, r.h) + `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(r.cw)}" height="${n1(r.ch)}" fill="#ffffff"/>`
       + `<rect x="${n1(x + m)}" y="${n1(y + m)}" width="${n1(r.cw - 2 * m)}" height="${n1(r.ch - 2 * m)}" fill="none" stroke="${c.a}" stroke-width="${n1(1.3 * S)}"/>`
       + `<rect x="${n1(x + m2)}" y="${n1(y + m2)}" width="${n1(r.cw - 2 * m2)}" height="${n1(r.ch - 2 * m2)}" fill="none" stroke="${c.a}" stroke-width="${n1(.6 * S)}"/>`; },
   zones:xmZones(() => { const r = tgRing(); return {x:W / 2, y0:H / 2 - r.ch / 2 + 20 * S, y1:H / 2 + r.ch / 2 - 20 * S, w:r.cw - 40 * S}; })},
  {id:"tg-leafband", name:"Autumn Leaf Band", subs:TG, picture:true, tint:softPal("#ffffff"),
   art:c => { const a = XM.tg_leaftop[1] / XM.tg_leaftop[0], rule = (x1, y1, x2, y2) => `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" stroke="${c.a}" stroke-width="${n1(1.1 * S)}"/>`;
     if (wide()){ const len = 1.08 * H, t = len * a, e = t - 3 * S; return xm("tg_leaftop", t / 2 - 3 * S, H / 2, t, -90) + xm("tg_leafbot", W - t / 2 + 3 * S, H / 2, t, -90) + rule(e + 5 * S, 12 * S, e + 5 * S, H - 12 * S) + rule(W - e - 5 * S, 12 * S, W - e - 5 * S, H - 12 * S); }
     const w = 1.1 * W, h = w * a, e = h - 4 * S; return xm("tg_leaftop", W / 2, h / 2 - 4 * S, h) + xm("tg_leafbot", W / 2, H - h / 2 + 4 * S, h) + rule(12 * S, e + 5 * S, W - 12 * S, e + 5 * S) + rule(12 * S, H - e - 5 * S, W - 12 * S, H - e - 5 * S); },
   zones:xmZones(() => { const a = XM.tg_leaftop[1] / XM.tg_leaftop[0]; if (wide()){ const t = 1.08 * H * a; return {x:W / 2, y0:.16 * H, y1:.84 * H, w:W - 2 * t - 30 * S}; } const h = 1.1 * W * a; return {x:W / 2, y0:h + 8 * S, y1:H - h - 8 * S, w:.84 * W}; })},
  {id:"tg-feathers", name:"Feathers", subs:TG, picture:true, tint:softPal("#fffaf2"),
   art:() => { if (wide()){ const h = .86 * H; return xm("tg_feather1", .075 * W, .5 * H, h, -10) + xm("tg_feather2", .155 * W, .5 * H, h * .96, 2) + xm("tg_feather3", .245 * W, .52 * H, h * .84, 14); }
     const h = .46 * H, y = H - 6 * S - h / 2; return xm("tg_feather1", .33 * W, y, h, -16) + xm("tg_feather2", .5 * W, y - 2 * S, h, 0) + xm("tg_feather3", .68 * W, y + 2 * S, h * .86, 16); },
   zones:xmZones(() => wide() ? {x:.66 * W, y0:.2 * H, y1:.8 * H, w:.56 * W} : {x:W / 2, y0:.07 * H, y1:.46 * H, w:.84 * W})},
  {id:"tg-pilgrim", name:"Pilgrim Hat", subs:TG, picture:true, tint:softPal("#fffaf2"),
   art:() => { const h = (wide() ? .52 : .3) * H, cx = wide() ? 8 * S + xmW("tg_hat", h) * .56 : W / 2, cy = wide() ? .52 * H : H - 8 * S - h * .56;
     return xm("tg_leaf1", cx - h * .42, cy + h * .42, h * .34, 150) + xm("tg_leaf2", cx + h * .5, cy - h * .28, h * .62, 38) + xm("tg_leaf3", cx - h * .5, cy - h * .3, h * .5, -36) + xm("tg_leaf4", cx + h * .5, cy + h * .44, h * .3, 12)
       + xm("tg_hat", cx, cy, h); },
   zones:xmZones(() => { if (wide()){ const fw = 8 * S + xmW("tg_hat", .52 * H) * 1.12; return {x:(fw + W - 8 * S) / 2, y0:.2 * H, y1:.8 * H, w:W - fw - 22 * S}; } return {x:W / 2, y0:.07 * H, y1:.52 * H, w:.84 * W}; })},
  tgTitle("tg-brush", "Thanksgiving Brush Script", "tg_brush", .7, .92, null, true),
  tgTitle("tg-calli", "Thanksgiving Calligraphy", "tg_calli", .86, .96, null, true),
  tgTitle("tg-sticker", "Thanksgiving Day", "tg_sticker", .66, .94, fixedPal("#efdcbb", "#6b3a16")),
  tgTitle("tg-givethanks", "Give Thanks", "tg_givethanks", .74, .94, fixedPal("#fdf6ee", "#5b2a1a")),
  tgTitle("tg-fallyall", "Happy Fall Y'all", "tg_fallyall", .5, .8, fixedPal("#fffdf7", "#7a4a1e"))
];
TEMPLATES.unshift(...TG_DESIGNS);
