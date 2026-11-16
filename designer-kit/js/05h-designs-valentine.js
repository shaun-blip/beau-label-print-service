/* ---------- Valentine's designs built from the BeauBottles clipart library ---------- */
Object.assign(XM, {"vd_script":[900,579],"vd_heartbox":[620,574],"vd_scallop":[700,807],"vd_retro":[860,748]});
const VD = ["Valentine's Day", "Galentine's"], VD_MORE = VD.concat("Anniversary", "Just because");
const VD_PICTURES = [
  {...xmFigure("vd-heartbox", "Heart Box", "vd_heartbox", .84, "#fffafa"), subs:VD_MORE},
  {...xmFrame("vd-scallop", "Pink Scallop Plaque", "vd_scallop", .2, .17, panelPal("#ffb3d6"), VD_MORE)}
];
const VD_LETTERING = [
  bdTitle("vd-retro", "Retro Valentine", "vd_retro", VD, .46, .84, fixedPal("#e0989e", "#ffffff", true)),
  bdTitle("vd-script", "Valentine Script", "vd_script", VD, .6, .92, fixedPal("#ffffff", "#3c3c3c"))
];
TEMPLATES.unshift(...VD_PICTURES);
TEMPLATES.splice(TEMPLATES.reduce((a, t, i) => t.themed ? i : a, -1) + 1, 0, ...VD_LETTERING);
