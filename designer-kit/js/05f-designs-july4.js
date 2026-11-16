/* ---------- Fourth of July and Americana designs built from the BeauBottles clipart library ---------- */
Object.assign(XM, {"j4_flag":[460,772],"j4_liberty":[380,877],"j4_hat":[420,495],"j4_rocket1":[300,296],"j4_rocket2":[260,403],"j4_donut1":[220,221],"j4_donut2":[230,139],"j4_heart":[300,296],"j4_glasses1":[300,110],"j4_glasses2":[290,129],"j4_star1":[170,177],"j4_star2":[150,161],"j4_balloon1":[240,528],"j4_balloons2":[420,605],"j4_fw1":[300,286],"j4_fw2":[300,351],"j4_fw3":[300,280],"j4_4july":[700,703],"j4_bunting":[700,703],"j4_happy4th":[760,761],"j4_starwreath":[760,761],"j4_burst":[900,903],"j4_script":[900,700]});
const J4 = ["Fourth of July"];
const j4Fig = (id, name, fid, hw) => ({...xmFigure(id, name, fid, hw, "#ffffff"), subs:J4});
const j4Ring = (id, name, fid, hole) => ({id, name, subs:J4, picture:true, tint:softPal("#ffffff"),
  art:() => xm(fid, W / 2, H / 2, Math.min(W, H) * .97),
  zones:xmZones(() => { const d = Math.min(W, H) * .97; return {x:W / 2, y0:H / 2 - d * hole * .4, y1:H / 2 + d * hole * .4, w:d * hole}; })});
const J4_PICTURES = [
  j4Ring("j4-starwreath", "Star Wreath", "j4_starwreath", .42),
  j4Ring("j4-bunting", "Bunting Circle", "j4_bunting", .56),
  j4Fig("j4-flag", "Old Glory", "j4_flag", .9),
  {id:"j4-fireworks", name:"Fireworks", subs:J4, picture:true, tint:softPal("#ffffff"),
   art:() => { const h = (wide() ? .44 : .3) * H; return wide() ? xm("j4_fw1", .1 * W, .27 * H, h) + xm("j4_fw3", .9 * W, .28 * H, h * 1.02) + xm("j4_fw2", .08 * W, .8 * H, h * .66, 20) + xm("j4_fw1", .92 * W, .8 * H, h * .62, -20, true)
     : xm("j4_fw1", .2 * W, .16 * H, h) + xm("j4_fw2", .52 * W, .13 * H, h * .92) + xm("j4_fw3", .82 * W, .17 * H, h); },
   zones:xmZones(() => wide() ? {x:W / 2, y0:.2 * H, y1:.8 * H, w:.44 * W} : {x:W / 2, y0:.4 * H, y1:.92 * H, w:.84 * W})},
  j4Fig("j4-liberty", "Lady Liberty", "j4_liberty", .94),
  j4Fig("j4-unclesam", "Uncle Sam Hat", "j4_hat", .7),
  {id:"j4-balloons", name:"Flag Balloons", subs:J4, picture:true, tint:softPal("#ffffff"),
   art:() => { if (wide()){ const h = .9 * H; return xm("j4_balloon1", 10 * S + xmW("j4_balloon1", h * .8) / 2, .55 * H, h * .8) + xm("j4_balloons2", 10 * S + xmW("j4_balloon1", h * .8) * .7 + xmW("j4_balloons2", h) / 2, .5 * H, h); }
     const h = .52 * H; return xm("j4_balloon1", .2 * W, H - 6 * S - h * .42, h * .8) + xm("j4_balloons2", .6 * W, H - 6 * S - h / 2, h); },
   zones:xmZones(() => { if (wide()){ const h = .9 * H, fw = 10 * S + xmW("j4_balloon1", h * .8) * .7 + xmW("j4_balloons2", h); return {x:(fw + W - 8 * S) / 2, y0:.2 * H, y1:.8 * H, w:W - fw - 24 * S}; } return {x:W / 2, y0:.07 * H, y1:.44 * H, w:.84 * W}; })},
  {id:"j4-rockets", name:"Rockets", subs:J4, picture:true, tint:softPal("#ffffff"),
   art:() => { const h = (wide() ? .7 : .4) * H; return wide() ? xm("j4_rocket2", .16 * W, .52 * H, h) + xm("j4_rocket2", .84 * W, .52 * H, h, 0, true) + xm("j4_star1", .3 * W, .14 * H, .14 * H, 12) + xm("j4_star2", .7 * W, .14 * H, .14 * H, -12)
     : xm("j4_rocket2", .16 * W, H - 6 * S - h / 2, h) + xm("j4_rocket2", .84 * W, H - 6 * S - h / 2, h, 0, true) + xm("j4_star1", .4 * W, H - 12 * S - .06 * H, .12 * H, 12) + xm("j4_star2", .6 * W, H - 12 * S - .06 * H, .12 * H, -12); },
   zones:xmZones(() => wide() ? {x:W / 2, y0:.24 * H, y1:.84 * H, w:.4 * W} : {x:W / 2, y0:.07 * H, y1:.54 * H, w:.84 * W})},
  {id:"j4-party", name:"Americana Party", subs:J4, picture:true, tint:softPal("#ffffff"),
   art:() => xmRow(wide() ? ["j4_rocket1", "j4_donut1", "j4_heart", "j4_hat", "j4_glasses1", "j4_donut2", "j4_star2"] : ["j4_donut1", "j4_heart", "j4_hat", "j4_star2"], 8 * S, W - 8 * S, H - 8 * S, (wide() ? .36 : .3) * H / 495),
   zones:xmZones(() => wide() ? {x:W / 2, y0:.06 * H, y1:.54 * H, w:.8 * W} : {x:W / 2, y0:.08 * H, y1:.66 * H, w:.84 * W})}
];
const j4White = fixedPal("#ffffff", "#1f3f9a");
const J4_LETTERING = [
  bdTitle("j4-burst", "Happy 4th Burst", "j4_burst", J4, .5, .86, j4White), bdTitle("j4-script", "Fourth of July Script", "j4_script", J4, .56, .88, j4White),
  bdTitle("j4-happy4th", "Happy 4th Star Wreath", "j4_happy4th", J4, .5, .86, j4White), bdTitle("j4-4july", "4th of July Bunting", "j4_4july", J4, .5, .86, j4White)
];
TEMPLATES.unshift(...J4_PICTURES);
TEMPLATES.splice(TEMPLATES.reduce((a, t, i) => t.themed ? i : a, -1) + 1, 0, ...J4_LETTERING);
