/* ---------- Baby shower, new baby and gender reveal designs built from the BeauBottles clipart library ---------- */
Object.assign(XM, {"bb_stork_pink":[420,576],"bb_stork_green":[420,565],"bb_stork_blue":[420,557],"bb_horse_pink":[520,462],"bb_horse_blue":[520,462],"bb_onesie_pink":[400,440],"bb_onesie_blue":[400,441],"bb_bottles":[520,521],"bb_pacifiers":[520,522],"bb_frame_blue":[640,766],"bb_frame_pink":[640,767],"bb_line_blue":[640,308],"bb_line_pink":[640,324],"bb_block_boy":[560,439],"bb_block_girl":[560,379],"bb_script_boy":[560,525],"bb_script_girl":[560,522],"bb_heorshe":[520,680],"bb_whatwill":[480,518],"bb_teampink":[520,369],"bb_teamblue":[520,366]});
const BB = ["Baby shower", "New baby", "Pregnancy announcement"], BB_ALL = BB.concat("Gender reveal"), BB_REVEAL = ["Gender reveal"];
const bbFig = (id, name, fid, hw, subs) => ({...xmFigure(id, name, fid, hw, "#ffffff"), subs});
const bbRing = (id, name, fid) => ({id, name, subs:BB_ALL, picture:true, tint:softPal("#ffffff"),
  art:() => { const h = Math.min(H * .98, W * .98 * XM[fid][1] / XM[fid][0]); return xm(fid, W / 2, H / 2, h); },
  zones:xmZones(() => { const h = Math.min(H * .98, W * .98 * XM[fid][1] / XM[fid][0]), d = h * .8; return {x:W / 2, y0:H / 2 + h * .08 - d * .3, y1:H / 2 + h * .08 + d * .3, w:d * .66}; })});
const bbLine = (id, name, fid, subs) => ({id, name, subs, picture:true, tint:softPal("#ffffff"),
  art:() => { const a = XM[fid][1] / XM[fid][0], w = (wide() ? .5 : .96) * W, h = w * a; return xm(fid, W / 2, h / 2 + 3 * S, h); },
  zones:xmZones(() => { const a = XM[fid][1] / XM[fid][0], h = (wide() ? .5 : .96) * W * a; return {x:W / 2, y0:h * (wide() ? 1 : .9), y1:.96 * H, w:(wide() ? .7 : .84) * W}; })});
const BB_PICTURES = [
  bbFig("bb-stork-green", "Stork Delivery", "bb_stork_green", .9, BB_ALL), bbFig("bb-stork-pink", "Stork Delivery Pink", "bb_stork_pink", .9, BB.concat(BB_REVEAL)), bbFig("bb-stork-blue", "Stork Delivery Blue", "bb_stork_blue", .9, BB.concat(BB_REVEAL)),
  bbRing("bb-frame-pink", "Pink Bow Frame", "bb_frame_pink"), bbRing("bb-frame-blue", "Blue Bow Frame", "bb_frame_blue"),
  bbFig("bb-horse-pink", "Rocking Horse Pink", "bb_horse_pink", .8, BB_ALL), bbFig("bb-horse-blue", "Rocking Horse Blue", "bb_horse_blue", .8, BB_ALL),
  bbLine("bb-line-pink", "Baby Clothesline Pink", "bb_line_pink", BB.concat(BB_REVEAL)), bbLine("bb-line-blue", "Baby Clothesline Blue", "bb_line_blue", BB.concat(BB_REVEAL)),
  bbFig("bb-onesie-pink", "Onesie Pink", "bb_onesie_pink", .82, BB.concat(BB_REVEAL)), bbFig("bb-onesie-blue", "Onesie Blue", "bb_onesie_blue", .82, BB.concat(BB_REVEAL)),
  bbFig("bb-bottles", "Baby Bottles", "bb_bottles", .86, BB.concat(BB_REVEAL)), bbFig("bb-pacifiers", "Pacifiers", "bb_pacifiers", .8, BB.concat(BB_REVEAL))
];
const bbWhite = fixedPal("#ffffff", "#5b5048"), BB_ITS = ["New baby", "Gender reveal", "Baby shower"];
const BB_LETTERING = [
  bdTitle("bb-block-girl", "It's a Girl", "bb_block_girl", BB_ITS, .46, .8, fixedPal("#ffffff", "#2a2326")), bdTitle("bb-block-boy", "It's a Boy", "bb_block_boy", BB_ITS, .46, .8, fixedPal("#ffffff", "#2a2326")),
  bdTitle("bb-script-girl", "It's a Girl Script", "bb_script_girl", BB_ITS, .4, .72, null, true), bdTitle("bb-script-boy", "It's a Boy Script", "bb_script_boy", BB_ITS, .4, .72, null, true),
  bdTitle("bb-heorshe", "He or She?", "bb_heorshe", BB_REVEAL, .34, .56, bbWhite), bdTitle("bb-whatwill", "What Will It Be?", "bb_whatwill", BB_REVEAL, .38, .62, bbWhite),
  bdTitle("bb-teampink", "Team Pink", "bb_teampink", BB_REVEAL, .5, .86, bbWhite), bdTitle("bb-teamblue", "Team Blue", "bb_teamblue", BB_REVEAL, .5, .86, bbWhite)
];
TEMPLATES.unshift(...BB_PICTURES);
TEMPLATES.splice(TEMPLATES.reduce((a, t, i) => t.themed ? i : a, -1) + 1, 0, ...BB_LETTERING);
