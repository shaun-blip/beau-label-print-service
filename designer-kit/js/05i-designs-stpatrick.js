/* ---------- St. Patrick's Day designs built from the BeauBottles clipart library ---------- */
Object.assign(XM, {"sp_flag":[260,258],"sp_mug":[300,360],"sp_clover4":[220,296],"sp_shamrock":[360,492],"sp_shamrock2":[340,306],"sp_lights":[360,229],"sp_bunting":[520,296],"sp_hat":[360,311],"sp_horseshoe":[280,296],"sp_c1":[760,246],"sp_c2":[620,359],"sp_c3":[480,546],"sp_c4":[520,271],"sp_belucky":[420,334],"sp_lucky":[460,422],"sp_pot":[760,387],"sp_brush":[700,742]});
const SP = ["St. Patrick's Day"], spFig = (id, name, fid, hw) => ({...xmFigure(id, name, fid, hw, "#ffffff"), subs:SP}), spFix = fixedPal("#ffffff", "#0c6b2c");
const SP_PICTURES = [
  spFig("sp-pot", "Pot of Gold", "sp_pot", .58),
  spFig("sp-shamrock", "Watercolor Shamrock", "sp_shamrock", .9),
  {id:"sp-lucky", name:"Lucky Charms", subs:SP, picture:true, tint:softPal("#ffffff"),
   art:() => xmRow(wide() ? ["sp_hat", "sp_shamrock2", "sp_mug", "sp_horseshoe", "sp_flag"] : ["sp_hat", "sp_shamrock2", "sp_horseshoe"], 8 * S, W - 8 * S, H - 8 * S, (wide() ? .34 : .26) * H / 325),
   zones:xmZones(() => wide() ? {x:W / 2, y0:.06 * H, y1:.52 * H, w:.8 * W} : {x:W / 2, y0:.08 * H, y1:.64 * H, w:.84 * W})},
  spFig("sp-hat", "Leprechaun Hat", "sp_hat", .56),
  {id:"sp-bunting", name:"Irish Bunting", subs:SP, picture:true, tint:softPal("#ffffff"),
   art:() => { const a = XM.sp_bunting[1] / XM.sp_bunting[0], w = (wide() ? .46 : .78) * W, h = w * a, s = (wide() ? .3 : .2) * H;
     return xm("sp_bunting", W / 2, h / 2 + 2 * S, h) + (wide() ? xm("sp_shamrock2", .1 * W, .7 * H, s, -14) + xm("sp_clover4", .9 * W, .7 * H, s, 10) : xm("sp_shamrock2", .16 * W, H - 6 * S - s / 2, s, -14) + xm("sp_clover4", .84 * W, H - 6 * S - s / 2, s, 10)); },
   zones:xmZones(() => { const a = XM.sp_bunting[1] / XM.sp_bunting[0]; return wide() ? {x:W / 2, y0:.46 * W * a * .8, y1:.95 * H, w:.6 * W} : {x:W / 2, y0:.78 * W * a * .9, y1:.8 * H, w:.84 * W}; })}
];
const SP_LETTERING = [
  bdTitle("sp-brush", "Saint Patrick's Brush", "sp_brush", SP, .34, .58, null, true),
  bdTitle("sp-c1", "St. Patrick's Script", "sp_c1", SP, .8, .94, spFix), bdTitle("sp-c2", "St. Patrick's Flourish", "sp_c2", SP, .56, .9, spFix),
  bdTitle("sp-c3", "St. Patrick's Stacked", "sp_c3", SP, .36, .64, spFix), bdTitle("sp-c4", "Shamrock Script", "sp_c4", SP, .5, .84, spFix),
  bdTitle("sp-belucky", "Be Lucky", "sp_belucky", SP, .44, .76, spFix), bdTitle("sp-luckyword", "Lucky", "sp_lucky", SP, .44, .76, spFix)
];
TEMPLATES.unshift(...SP_PICTURES);
TEMPLATES.splice(TEMPLATES.reduce((a, t, i) => t.themed ? i : a, -1) + 1, 0, ...SP_LETTERING);
