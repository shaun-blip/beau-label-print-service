/* ---------- Birthday and celebration designs built from the BeauBottles clipart library ---------- */
Object.assign(XM, {"bd_l1":[720,556],"bd_l2":[720,526],"bd_l3":[720,350],"bd_l4":[720,495],"bd_l5":[720,354],"bd_l6":[720,521],"bd_b1":[600,566],"bd_b2":[600,470],"bd_b3":[600,563],"bd_b4":[600,864],"bd_b5":[600,611],"bd_b6":[600,472],"bd_b7":[600,466],"bd_b8":[600,557],"bd_b9":[600,716],"bd_b10":[600,709],"bd_w1":[760,485],"bd_w2":[760,380],"bd_w3":[760,442],"bd_w4":[760,486],"bd_w5":[760,565],"bd_w6":[760,554],"bd_w7":[760,451],"bd_w8":[760,495],"bd_w9":[760,381],"bd_makewish":[760,574],"bd_candles":[760,783],"bd_balloon":[860,679],"bd_cupcake":[520,807],"bd_wish":[760,724],"bd_bunting":[1100,538],"bd_pinkhb":[900,222],"bd_goldhb":[900,246]});
const BDAY = ["Birthday", "21st", "30th", "40th", "50th", "60th", "70th", "80th", "90th", "100th", "Any age"];
const CONGRATS = ["Graduation", "New job", "Promotion", "Retirement", "New home", "You did it", "Engagement"];
const bdTitle = (id, name, lid, subs, fw, fs, pal, ink) => ({...tgTitle(id, name, lid, fw, fs, pal, ink), subs});
const bdInk = {k:fixedPal("#fffdf8", "#1a1a1a"), n:fixedPal("#fffdf8", "#20264a"), g:fixedPal("#fffdf8", "#0f3d3b")};
// Pictures with the customer's own words as the headline. These lead the birthday list.
const BD_PICTURES = [
  {id:"bd-bunting", name:"Confetti Bunting", subs:BDAY, picture:true, tint:softPal("#fffdf8"),
   art:() => { const a = XM.bd_bunting[1] / XM.bd_bunting[0], w = wide() ? Math.min(.98 * W, .52 * H / a) : 1.04 * W, h = w * a; return xm("bd_bunting", W / 2, h / 2 + (wide() ? 0 : 2 * S), h); },
   zones:xmZones(() => { const a = XM.bd_bunting[1] / XM.bd_bunting[0]; return wide() ? {x:W / 2, y0:.54 * H, y1:.97 * H, w:.8 * W} : {x:W / 2, y0:1.04 * W * a * .86, y1:.95 * H, w:.84 * W}; })},
  {...xmFigure("bd-candles", "Birthday Candles", "bd_candles", .88, "#fffdf8"), subs:BDAY},
  {...xmFigure("bd-cupcake", "Cupcake", "bd_cupcake", .9, "#fffdf8"), subs:BDAY}
];
// Designs whose headline is the artwork.
const BD_LETTERING = [
  bdTitle("bd-gold", "Gold Glitter Birthday", "bd_goldhb", BDAY, .88, .96, fixedPal("#1b2440", "#ffffff", true)),
  bdTitle("bd-pink", "Pink Shimmer Birthday", "bd_pinkhb", BDAY, .88, .96, fixedPal("#3d2352", "#ffffff", true)),
  bdTitle("bd-l1", "Birthday Hearts", "bd_l1", BDAY, .5, .8, bdInk.k), bdTitle("bd-l2", "Birthday To You", "bd_l2", BDAY, .5, .8, bdInk.k),
  bdTitle("bd-l3", "Gold Caps Birthday", "bd_l3", BDAY, .62, .9, bdInk.k), bdTitle("bd-l4", "Arched Birthday", "bd_l4", BDAY, .5, .82, bdInk.k),
  bdTitle("bd-l5", "Block Birthday", "bd_l5", BDAY, .62, .9, bdInk.k), bdTitle("bd-l6", "Gold Party Hat", "bd_l6", BDAY, .5, .82, bdInk.k),
  bdTitle("bd-b1", "Gift Badge", "bd_b1", BDAY, .46, .76, bdInk.n), bdTitle("bd-b2", "Gift & Dots", "bd_b2", BDAY, .5, .8, bdInk.n),
  bdTitle("bd-b3", "Cake B-Day", "bd_b3", BDAY, .46, .76, bdInk.n), bdTitle("bd-b4", "Balloons To You", "bd_b4", BDAY, .4, .6, bdInk.n),
  bdTitle("bd-b5", "Candle Row", "bd_b5", BDAY, .44, .72, bdInk.n), bdTitle("bd-b6", "Dear Friend", "bd_b6", BDAY, .5, .8, bdInk.n),
  bdTitle("bd-b7", "Gift Ribbon", "bd_b7", BDAY, .5, .82, bdInk.n), bdTitle("bd-b8", "Party Flags", "bd_b8", BDAY, .46, .76, bdInk.n),
  bdTitle("bd-b9", "Layer Cake", "bd_b9", BDAY, .42, .66, bdInk.n), bdTitle("bd-b10", "Be Happy", "bd_b10", BDAY, .42, .66, bdInk.n),
  bdTitle("bd-balloon", "Birthday Balloon", "bd_balloon", BDAY, .52, .9, fixedPal("#fff8fa", "#20264a")),
  bdTitle("bd-makewish", "Make a Wish Ribbon", "bd_makewish", BDAY, .46, .76, fixedPal("#fffafb", "#20264a")),
  bdTitle("bd-wish", "Make a Wish Script", "bd_wish", BDAY, .44, .74, null, true),
  bdTitle("bd-w1", "Yay!", "bd_w1", BDAY.concat(CONGRATS), .52, .86, bdInk.g), bdTitle("bd-w2", "Woo Hoo", "bd_w2", BDAY.concat(CONGRATS), .6, .9, bdInk.g),
  bdTitle("bd-w5", "Cheers!", "bd_w5", BDAY.concat(CONGRATS, "Anniversary", "Work anniversary", "Girls' trip"), .5, .84, bdInk.g),
  bdTitle("bd-w8", "Hooray!", "bd_w8", BDAY.concat(CONGRATS), .52, .86, bdInk.g),
  bdTitle("bd-w9", "Enjoy!", "bd_w9", BDAY.concat("Hostess", "Just because", "Neighbor", "Dinner party", "Thank you"), .6, .9, bdInk.g),
  bdTitle("bd-w3", "Congrats! Stars", "bd_w3", CONGRATS, .56, .88, bdInk.g), bdTitle("bd-w4", "Congrats! Bold", "bd_w4", CONGRATS, .54, .88, bdInk.g),
  bdTitle("bd-w6", "Congratulations Burst", "bd_w6", CONGRATS, .5, .86, bdInk.g), bdTitle("bd-w7", "Congratulations Rays", "bd_w7", CONGRATS, .56, .9, bdInk.g)
];
TEMPLATES.unshift(...BD_PICTURES);
TEMPLATES.splice(TEMPLATES.reduce((a, t, i) => t.themed ? i : a, -1) + 1, 0, ...BD_LETTERING);   // after the occasion designs that take ready-made sayings
