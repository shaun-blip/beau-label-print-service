/* ---------- Graduation designs built from the BeauBottles clipart library ---------- */
Object.assign(XM, {"gr_capdiploma":[420,295],"gr_bow":[260,236],"gr_disco":[260,364],"gr_cake":[280,368],"gr_toast":[260,345],"gr_scroll":[520,732],"gr_cap1":[300,153],"gr_cap2":[300,220],"gr_cap3":[320,244],"gr_cap4":[340,317],"gr_capfloral":[380,310],"gr_diploma":[360,131],"gr_t_gradparty1":[560,253],"gr_t_gradparty2":[560,482],"gr_t_gradparty3":[640,281],"gr_t_gradparty4":[460,302],"gr_congrats1":[560,400],"gr_congrats2":[560,223],"gr_congrats3":[560,301],"gr_cheers1":[560,373],"gr_cheers2":[560,295],"gr_cheers3":[560,361],"gr_congrats":[800,539],"gr_rainbow":[900,334]});
const GR = ["Graduation"], grPal = softPal("#fffdf8"), grFix = fixedPal("#fffdf8", "#1c1c1c");
const grFig = (id, name, fid, hw) => ({...xmFigure(id, name, fid, hw, "#fffdf8"), subs:GR});
const GR_PICTURES = [
  grFig("gr-capdiploma", "Cap & Diploma", "gr_capdiploma", .62),
  {...xmFrame("gr-scroll", "Diploma Scroll", "gr_scroll", .15, .17, grPal, GR)},
  {id:"gr-caps", name:"Caps Off", subs:GR, picture:true, tint:grPal,
   art:() => xmRow(wide() ? ["gr_cap1", "gr_cap4", "gr_capfloral", "gr_cap3", "gr_cap2"] : ["gr_cap1", "gr_capfloral", "gr_cap2"], 8 * S, W - 8 * S, H - 10 * S, (wide() ? .34 : .3) * H / 317),
   zones:xmZones(() => wide() ? {x:W / 2, y0:.07 * H, y1:.56 * H, w:.8 * W} : {x:W / 2, y0:.1 * H, y1:.7 * H, w:.84 * W})},
  grFig("gr-capfloral", "Floral Cap", "gr_capfloral", .6),
  {id:"gr-party", name:"Grad Party", subs:GR, picture:true, tint:grPal,
   art:() => xmRow(wide() ? ["gr_toast", "gr_cake", "gr_cap4", "gr_disco", "gr_bow"] : ["gr_toast", "gr_cake", "gr_disco"], 8 * S, W - 8 * S, H - 9 * S, (wide() ? .44 : .32) * H / 368),
   zones:xmZones(() => wide() ? {x:W / 2, y0:.06 * H, y1:.5 * H, w:.8 * W} : {x:W / 2, y0:.08 * H, y1:.62 * H, w:.84 * W})},
  grFig("gr-toast", "Graduation Toast", "gr_toast", .82),
  grFig("gr-cake", "Graduation Cake", "gr_cake", .82),
  grFig("gr-disco", "Disco Ball", "gr_disco", .86)
];
const GR_LETTERING = [
  bdTitle("gr-congrats", "Congrats Cap", "gr_congrats", GR, .5, .88, grFix),
  bdTitle("gr-gradparty2", "Grad Party Burst", "gr_t_gradparty2", GR, .44, .8, grFix), bdTitle("gr-gradparty1", "Graduation Party", "gr_t_gradparty1", GR, .56, .9, grFix),
  bdTitle("gr-gradparty3", "Grad Party Script", "gr_t_gradparty3", GR, .6, .92, grFix), bdTitle("gr-gradparty4", "Grad Party Serif", "gr_t_gradparty4", GR, .5, .8, grFix),
  bdTitle("gr-rainbow", "Rainbow Congrats", "gr_rainbow", CONGRATS, .74, .94, fixedPal("#ffffff", "#333a55")),
  bdTitle("gr-congrats1", "Congrats Fireworks", "gr_congrats1", CONGRATS, .5, .84, grFix), bdTitle("gr-congrats2", "Congrats Sparks", "gr_congrats2", CONGRATS, .62, .92, grFix), bdTitle("gr-congrats3", "Congrats Stars", "gr_congrats3", CONGRATS, .56, .9, grFix),
  bdTitle("gr-cheers1", "Cheers Stars", "gr_cheers1", CONGRATS.concat(BDAY, "Anniversary", "New Year's"), .52, .86, grFix), bdTitle("gr-cheers2", "Cheers Sparks", "gr_cheers2", CONGRATS.concat(BDAY, "Anniversary", "New Year's"), .56, .9, grFix),
  bdTitle("gr-cheers3", "Cheers Flourish", "gr_cheers3", CONGRATS.concat(BDAY, "Anniversary", "New Year's"), .52, .86, grFix)
];
TEMPLATES.unshift(...GR_PICTURES);
TEMPLATES.splice(TEMPLATES.reduce((a, t, i) => t.themed ? i : a, -1) + 1, 0, ...GR_LETTERING);
