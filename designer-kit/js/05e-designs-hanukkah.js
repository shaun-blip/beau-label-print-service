/* ---------- Hanukkah designs built from the BeauBottles clipart library ---------- */
Object.assign(XM, {"hk_w_donut":[330,248],"hk_w_dreidel":[330,400],"hk_w_candle":[150,485],"hk_w_coin1":[220,141],"hk_w_coin2":[200,184],"hk_w_cup":[210,402],"hk_w_menorah":[620,666],"hk_w_star":[300,334],"hk_s_menorah":[560,646],"hk_s_star":[260,272],"hk_s_donut":[280,197],"hk_s_donuts":[380,232],"hk_s_coin":[200,201],"hk_s_candle":[190,338],"hk_s_gift":[330,318],"hk_s_dreidel":[230,456],"hk_s_dreidel2":[360,264],"hk_brush":[760,181],"hk_k_star":[240,275],"hk_k_book":[280,298],"hk_k_cup":[220,321],"hk_k_bunting":[330,349],"hk_k_title":[760,506],"hk_k_dreidels":[330,322],"hk_title":[900,290],"hk_bluemenorah":[420,405],"hk_garden_l":[420,966],"hk_garden_r":[420,999],"hk_goldmenorah":[520,668],"hk_dove":[520,502],"hk_dreidelbow":[460,822]});
const HK = ["Hanukkah"];
const hkFig = (id, name, fid, hw, pal) => ({...xmFigure(id, name, fid, hw, null), subs:HK, tint:pal});
const HK_PICTURES = [
  hkFig("hk-wmenorah", "Watercolor Menorah", "hk_w_menorah", .84, softPal("#ffffff")),
  {id:"hk-wrow", name:"Hanukkah Watercolors", subs:HK, picture:true, tint:softPal("#ffffff"),
   art:() => xmRow(wide() ? ["hk_w_dreidel", "hk_w_donut", "hk_w_star", "hk_w_cup", "hk_w_candle", "hk_w_coin2"] : ["hk_w_dreidel", "hk_w_star", "hk_w_donut"], 8 * S, W - 8 * S, H - 8 * S, (wide() ? .42 : .3) * H / 485),
   zones:xmZones(() => wide() ? {x:W / 2, y0:.06 * H, y1:.5 * H, w:.8 * W} : {x:W / 2, y0:.08 * H, y1:.62 * H, w:.84 * W})},
  hkFig("hk-goldmenorah", "Golden Menorah", "hk_goldmenorah", .88, fixedPal("#345cea", "#ffffff", true)),
  hkFig("hk-bluemenorah", "Blue Menorah", "hk_bluemenorah", .82, softPal("#ffffff")),
  hkFig("hk-dove", "Peace Dove", "hk_dove", .6, fixedPal("#9f9aff", "#1c2470")),
  hkFig("hk-dreidel", "Dreidel & Bow", "hk_dreidelbow", .9, fixedPal("#f6dce0", "#2a4fd0")),
  {...wdFig("hk-smenorah", "Menorah Sketch", "hk_s_menorah", .84, HK)},
  {id:"hk-srow", name:"Hanukkah Sketches", subs:HK,
   art:c => wdInk(xmRow(wide() ? ["hk_s_dreidel", "hk_s_star", "hk_s_donuts", "hk_s_coin", "hk_s_gift", "hk_s_candle"] : ["hk_s_dreidel", "hk_s_star", "hk_s_donut", "hk_s_candle"], 8 * S, W - 8 * S, H - 9 * S, (wide() ? .4 : .3) * H / 456), c.ink),
   zones:xmZones(() => wide() ? {x:W / 2, y0:.06 * H, y1:.52 * H, w:.8 * W} : {x:W / 2, y0:.08 * H, y1:.62 * H, w:.84 * W})},
  {id:"hk-stickers", name:"Hanukkah Stickers", subs:HK, picture:true, tint:fixedPal("#abc4e0", "#1f3f8f"),
   art:() => xmRow(wide() ? ["hk_k_star", "hk_k_dreidels", "hk_k_book", "hk_k_cup"] : ["hk_k_star", "hk_k_dreidels", "hk_k_cup"], 8 * S, W - 8 * S, H - 9 * S, (wide() ? .38 : .27) * H / 321),
   zones:xmZones(() => wide() ? {x:W / 2, y0:.06 * H, y1:.52 * H, w:.8 * W} : {x:W / 2, y0:.08 * H, y1:.64 * H, w:.84 * W})}
];
const hkTitle = bdTitle("hk-title", "Happy Hanukkah Script", "hk_title", HK, .62, .8, fixedPal("#ffffff", "#3d5fc4"));
const HK_LETTERING = [
  {...hkTitle, art:(c, words) => { const hl = Math.max(H, .34 * W * XM.hk_garden_l[1] / XM.hk_garden_l[0]), hr = Math.max(H, .34 * W * XM.hk_garden_r[1] / XM.hk_garden_r[0]);   // the pale garden from the card, down both sides
     return xm("hk_garden_l", xmW("hk_garden_l", hl) / 2, H / 2, hl) + xm("hk_garden_r", W - xmW("hk_garden_r", hr) / 2, H / 2, hr) + hkTitle.art(c, words); }},
  bdTitle("hk-brush", "Hanukkah Brush", "hk_brush", HK, .78, .84, null, true),
  bdTitle("hk-ktitle", "Happy Hannukah Sticker", "hk_k_title", HK, .5, .86, fixedPal("#abc4e0", "#1f3f8f"))
];
TEMPLATES.unshift(...HK_PICTURES);
TEMPLATES.splice(TEMPLATES.reduce((a, t, i) => t.themed ? i : a, -1) + 1, 0, ...HK_LETTERING);
