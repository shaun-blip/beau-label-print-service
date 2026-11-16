/* ---------- template library ----------
   Zone y and w are fractions of the label height and width (or a function for special shapes).
   Font sizes are for the 4 x 3 label and scale with S. */
// Finished artwork supplied as a picture. It is drawn once in the page's hidden <defs> and reused, with the words set in its open panel.
const picture = id => `<use href="#${id}${LITE ? "-s" : ""}" transform="scale(${+(W / 400).toFixed(4)} ${+(H / 300).toFixed(4)})"/>`;
// A strand of party lights: swags of wire with a bulb hung at even steps. Colors come from the palette.
function bulb(x, y, k, rot, col, cap){
  return at(x, y, k, rot) + `<rect x="-3.2" y="-1" width="6.4" height="6.5" rx="1.2" fill="${cap}"/><path d="M-4.4 5 C-7.4 12 -4.2 20.5 0 22.5 C4.2 20.5 7.4 12 4.4 5Z" fill="${col}"/>`
    + `<path d="M-2 8.5 C-3.2 12 -2.4 15 -1.2 16.8" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity=".6"/></g>`;
}
function lightStrand(y0, sag, swags, cols, wire, shift){
  let s = "", n = shift;
  for (let i = 0; i < swags; i++){
    const x1 = -4 + i * (W + 8) / swags, x2 = -4 + (i + 1) * (W + 8) / swags, cx = (x1 + x2) / 2, cy = y0 + 2 * sag;
    s += `<path d="M${n1(x1)} ${n1(y0)} Q${n1(cx)} ${n1(cy)} ${n1(x2)} ${n1(y0)}" fill="none" stroke="${wire}" stroke-width="${n1(1.5 * S)}" stroke-linecap="round"/>`;
    [.14, .38, .62, .86].forEach(t => {
      const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2, y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y0;
      const slope = Math.atan2(2 * (1 - 2 * t) * (cy - y0), x2 - x1) * 180 / Math.PI;
      s += bulb(x, y, 1.4 * S, slope * .7 + (n % 2 ? 9 : -9), cols[n % cols.length], wire); n++;
    });
  }
  return s;
}
// A wavy strand that curls into a loop-the-loop at each place listed in loops (0 to 1 along the label). dir 1 curls down, -1 curls up.
function curlStrand(y0, amp, waves, phase, loops, r, dir, cols, wire, shift, half = .04){
  const N = 900, pts = [];
  for (let i = 0; i <= N; i++){
    const t = i / N; let x = -10 * S + t * (W + 20 * S), y = (typeof y0 === "function" ? y0(t) : y0) + amp * Math.sin(2 * Math.PI * waves * t + phase);
    loops.forEach(t0 => { if (t > t0 - half && t < t0 + half){ const a = 2 * Math.PI * (t - (t0 - half)) / (2 * half); x -= r * Math.sin(a); y += dir * r * (1 - Math.cos(a)); } });
    pts.push([x, y]);
  }
  let s = `<path d="M${pts.map(q => n1(q[0]) + " " + n1(q[1])).join(" L")}" fill="none" stroke="${wire}" stroke-width="${n1(1.5 * S)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let run = 14 * S, n = shift; const gap = 31 * S;
  for (let i = 1; i < N; i++){
    run += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (run < gap) continue;
    run = 0;
    const ang = Math.atan2(pts[i + 1][1] - pts[i - 1][1], pts[i + 1][0] - pts[i - 1][0]) * 180 / Math.PI;
    s += bulb(pts[i][0], pts[i][1], 1.25 * S, (dir < 0 ? 180 : 0) + ang + (n % 2 ? 14 : -14), cols[n % cols.length], wire); n++;
  }
  return s;
}
const strandX = () => (W / H > 1.3 ? .40 : W / H > 1.1 ? .37 : .35) * W;   // open area beside the Party Lights strand
const strandW = () => (W / H > 1.3 ? .62 : W / H > 1.1 ? .56 : .52) * W;
const garW = () => (W / H > 1.3 ? .58 : W / H > 1.1 ? .52 : .46) * W;   // open panel width on each label shape
const TEMPLATES = [
  {id:"lights", name:"String Lights", subs:["Christmas","Hanukkah","New Year's","Holiday client gift"],
   art:c => { const cols = [c.a, c.b, c.c, mix(c.a, c.b, .5), mix(c.b, c.c, .5)], wire = mix(c.ink, c.bg, .25), n = wide() ? 3 : 2;
     return lightStrand(8 * S, 19 * S, n, cols, wire, 0) + lightStrand(H - 45 * S, 7 * S, n, cols, wire, 2); },
   zones:{
     top:{y:.365, w:.66, font:F.sans, size:11, ls:.28, upper:true},
     main:{y:.55, w:.82, font:F.display, size:42, ls:.04, upper:true},
     detail:{y:.675, w:.70, font:F.script, size:25, fill:"t"},
     msg:{y:.765, w:.66, font:F.serif, size:13, italic:true}}},

  {id:"drape", name:"Loop Lights", subs:["Christmas","Hanukkah","New Year's","Holiday client gift"],
   art:c => { const cols = [c.a, c.b, c.c, mix(c.a, c.b, .5), mix(c.b, c.c, .5)], wire = mix(c.ink, c.bg, .25);
     return curlStrand(.105 * H, 3 * S, 1.5, .4, wide() ? [.2, .5, .8] : [.27, .73], .082 * H, 1, cols, wire, 0, .028); },
   zones:{
     top:{y:.50, w:.66, font:F.sans, size:11, ls:.28, upper:true},
     main:{y:.67, w:.80, font:F.script, size:44},
     detail:{y:.795, w:.66, font:F.serif, size:15, weight:500},
     msg:{y:.89, w:.66, font:F.serif, size:13, italic:true}}},

  {id:"strand", name:"Party Lights", subs:["Christmas","Hanukkah","New Year's","Holiday client gift"], fillBg:true,
   // the chosen color fills the whole label; the words turn white or dark to stay readable on it
   tint:c => { const bg = c.dark ? mix(c.a, "#000000", .5) : c.a, light = ratio("#ffffff", bg) < 3.2, ink = light ? [0, .3, .5, .7, .85, 1].map(k => mix(c.dark ? c.bg : c.ink, "#000000", k)).find(x => ratio(x, bg) >= 5) || "#000000" : "#ffffff";
     return {...c, bg, ink, t:ink, t2:ink, dark:!light}; },
   art:() => artUse("art-strand"),
   zones:{
     top:{y:.17, w:() => strandW() * .9, x:strandX, font:F.sans, size:11, ls:.28, upper:true},
     main:{y:.335, w:strandW, x:strandX, font:F.display, size:38, ls:.04, upper:true},
     detail:{y:.455, w:() => strandW() * .9, x:strandX, font:F.script, size:24},
     msg:{y:.54, w:() => strandW() * .8, x:strandX, font:F.serif, size:13, italic:true}}},

  {id:"garland", name:"Winter Garland", picture:true, subs:["Christmas","Holiday client gift"],
   tint:c => ({...c, bg:"#ffffff", ink:ensure(c.dark ? "#5e1a26" : c.ink, "#ffffff", 7), dark:false}),
   art:() => artUse("art-garland"),
   zones:{
     top:{y:.345, w:garW, font:F.sans, size:10.5, ls:.26, upper:true},
     main:{y:.515, w:garW, font:F.script, size:38},
     detail:{y:.63, w:garW, font:F.serif, size:14.5, weight:500},
     msg:{y:.715, w:garW, font:F.serif, size:12.5, italic:true}}},

  {id:"heirloom", name:"Heirloom Tree", subs:["Christmas","Holiday client gift"], sizes:["champagne"], fixedArt:"art-tree", picture:true,
   tint:c => ({...c, bg:"#fbf2e5", ink:ensure(c.dark ? "#5e1a26" : c.ink, "#fbf2e5", 7), dark:false}),
   art:() => picture("art-tree"),
   zones:{
     top:{y:.30, w:.34, x:() => W * .76, font:F.sans, size:10, ls:.24, upper:true},
     main:{y:.49, w:.35, x:() => W * .76, font:F.script, size:34},
     detail:{y:.63, w:.34, x:() => W * .76, font:F.serif, size:14, weight:500},
     msg:{y:.74, w:.34, x:() => W * .76, font:F.serif, size:12.5, italic:true}}},

  {id:"garden", name:"Garden Sprig",
   art:c => frame(12, c.a, 1)
     + sprig(26*S, 28*S, 8, 118, c.a) + sprig(26*S, 28*S, 82, 84, c.a)
     + sprig(W - 26*S, H - 28*S, 188, 118, c.a) + sprig(W - 26*S, H - 28*S, 262, 84, c.a)
     + flower(30*S, 32*S, 13*S, c.b, c.bg) + flower(56*S, 22*S, 7*S, c.b, c.bg) + flower(22*S, 58*S, 7*S, c.b, c.bg)
     + flower(W - 30*S, H - 32*S, 13*S, c.b, c.bg) + flower(W - 56*S, H - 22*S, 7*S, c.b, c.bg) + flower(W - 22*S, H - 58*S, 7*S, c.b, c.bg),
   zones:{
     top:{y:.31, w:.58, font:F.sans, size:12, ls:.28, upper:true},
     main:{y:.55, w:.70, font:F.script, size:46},
     detail:{y:.70, w:.62, font:F.serif, size:17, weight:500},
     msg:{y:.82, w:.56, font:F.serif, size:14, italic:true}}},

  {id:"monogram", name:"Wreath Monogram",
   art:(c, w) => frame(12, c.a, 1) + wreath(W / 2, .23 * H, 34 * S, c.a, null, 7 * S)
     + (state.logo
        ? `<circle cx="${W / 2}" cy="${n1(.23 * H)}" r="${n1(25 * S)}" fill="#ffffff"/><image href="${state.logo.url}" x="${n1(W / 2 - 17 * S)}" y="${n1(.23 * H - 17 * S)}" width="${n1(34 * S)}" height="${n1(34 * S)}" preserveAspectRatio="xMidYMid meet"/>`
        : `<text x="${W / 2}" y="${n1(.23 * H + 7 * S)}" text-anchor="middle" font-family="${F.serif}" font-size="${n1(24 * S)}" font-weight="500" fill="${c.ink}" data-fit="${n1(42 * S)}" data-size="${n1(24 * S)}">${esc(initials(w.main))}</text>`),
   zones:{
     top:{y:.475, w:.62, font:F.sans, size:11, ls:.28, upper:true},
     main:{y:.655, w:.74, font:F.script, size:38},
     detail:{y:.775, w:.64, font:F.serif, size:15, weight:500},
     msg:{y:.875, w:.64, font:F.serif, size:13, italic:true}}},

  {id:"classic", name:"Classic Border", flow:false,
   art:c => frame(11, c.ink, 2.5) + frame(18, c.a, 1)
     + [[30*S, 30*S],[W - 30*S, 30*S],[30*S, H - 30*S],[W - 30*S, H - 30*S]].map(p => diamond(p[0], p[1], 7*S, c.a)).join("")
     + ornament(.19 * H, c.a) + ornament(.635 * H, c.a),
   zones:{
     top:{y:.34, w:.70, font:F.serif, size:13, ls:.3, upper:true, weight:500},
     main:{y:.535, w:.76, font:F.display, size:30, ls:.08, upper:true},
     detail:{y:.755, w:.70, font:F.sans, size:11, ls:.26, upper:true},
     msg:{y:.865, w:.70, font:F.serif, size:15, italic:true}}},

  {id:"deco", name:"Deco Arch",
   art:c => {
     const m = 18 * S, g = 7 * S, ry = .36 * H, rx = (W - 2 * m) / 2, cy = .31 * H;
     let s = `<path d="M${n1(m)} ${n1(H - m)} V${n1(m + ry)} A${n1(rx)} ${n1(ry)} 0 0 1 ${n1(W - m)} ${n1(m + ry)} V${n1(H - m)} Z" fill="none" stroke="${c.a}" stroke-width="${n1(2 * S)}"/>`
           + `<path d="M${n1(m + g)} ${n1(H - m - g)} V${n1(m + ry)} A${n1(rx - g)} ${n1(ry - g)} 0 0 1 ${n1(W - m - g)} ${n1(m + ry)} V${n1(H - m - g)} Z" fill="none" stroke="${c.a}" stroke-width="${n1(S)}"/>`;
     for (let k = -4; k <= 4; k++){
       const a = k * 18 * Math.PI / 180;
       s += `<line x1="${n1(W / 2 + 10 * S * Math.sin(a))}" y1="${n1(cy - 10 * S * Math.cos(a))}" x2="${n1(W / 2 + 34 * S * Math.sin(a))}" y2="${n1(cy - 34 * S * Math.cos(a))}" stroke="${c.a}" stroke-width="${n1(1.3 * S)}" stroke-linecap="round"/>`;
     }
     return s + `<path d="M${n1(W / 2 - 10 * S)} ${n1(cy)} A${n1(10 * S)} ${n1(10 * S)} 0 0 1 ${n1(W / 2 + 10 * S)} ${n1(cy)}" fill="none" stroke="${c.a}" stroke-width="${n1(1.3 * S)}"/>`
       + `<line x1="${n1(W / 2 - 62 * S)}" y1="${n1(cy + 5 * S)}" x2="${n1(W / 2 + 62 * S)}" y2="${n1(cy + 5 * S)}" stroke="${c.a}" stroke-width="${n1(1.3 * S)}" stroke-linecap="round"/>`;
   },
   zones:{
     top:{y:.455, w:.56, font:F.sans, size:10, ls:.36, upper:true},
     main:{y:.625, w:.68, font:F.display, size:30, ls:.05, upper:true},
     detail:{y:.745, w:.62, font:F.serif, size:16, italic:true},
     msg:{y:.85, w:.60, font:F.sans, size:9, ls:.26, upper:true}}},

  {id:"bubbly", name:"Bubbly", not:["remembrance"],
   art:c => scatter(23, Math.round(W * H / 520), [.13, .87, .21, .87], (x, y, k, i) => {
       const rad = n1((2.5 + k * 9) * S);
       return i % 4 === 0 ? `<circle cx="${x}" cy="${y}" r="${rad}" fill="${c.a}" opacity=".28"/>`
                          : `<circle cx="${x}" cy="${y}" r="${rad}" fill="none" stroke="${c.a}" stroke-width="${n1(1.2 * S)}"/>`;
     }) + sparkle(.2 * W, .12 * H, 10 * S, c.a) + sparkle(.8 * W, .1 * H, 8 * S, c.a) + sparkle(.77 * W, .93 * H, 9 * S, c.a) + sparkle(.2 * W, .93 * H, 7 * S, c.a),
   zones:{
     top:{y:.35, w:.60, font:F.sans, size:12, ls:.3, upper:true},
     main:{y:.575, w:.66, font:F.script, size:46},
     detail:{y:.715, w:.60, font:F.serif, size:17, weight:500},
     msg:{y:.825, w:.60, font:F.serif, size:14, italic:true}}},

  {id:"confetti", name:"Confetti", not:["remembrance","weddings"],
   art:c => scatter(11, Math.round(W * H / 420), [.13, .87, .21, .88], (x, y, k, i) => {
       const col = [c.a, c.b, c.c][i % 3];
       return k < .5 ? `<circle cx="${x}" cy="${y}" r="${n1((1.8 + k * 5) * S)}" fill="${col}"/>`
                     : `<rect x="${x}" y="${y}" width="${n1(10 * S)}" height="${n1(3.6 * S)}" rx="1" fill="${col}" transform="rotate(${Math.round(k * 360)} ${x} ${y})"/>`;
     }),
   zones:{
     top:{y:.355, w:.60, font:F.sans, size:13, ls:.3, upper:true, weight:500, fill:"t"},
     main:{y:.565, w:.66, font:F.display, size:36, weight:700},
     detail:{y:.685, w:.60, font:F.sans, size:13},
     msg:{y:.835, w:.62, font:F.script, size:24, fill:"t"}}},

  {id:"balloons", name:"Balloons", groups:["birthdays","baby","milestones","gatherings","business"],
   art:c => {
     const gx = W / 2, gy = 120 * S, b = (dx, y, r, col) => balloon(gx + dx * S, y * S, r * S, col, gx, gy, c.ink);
     return frame(12, c.a, 1) + b(-38, 60, 16, c.c) + b(38, 60, 16, c.b) + b(-17, 43, 17, c.a) + b(19, 44, 17, c.c) + b(0, 67, 17, c.b)
       + sparkle(gx - 92 * S, 42 * S, 7 * S, c.b) + sparkle(gx + 92 * S, 38 * S, 7 * S, c.a) + sparkle(gx - 120 * S, 84 * S, 5 * S, c.a) + sparkle(gx + 122 * S, 86 * S, 5 * S, c.c);
   },
   zones:{
     top:{y:.535, w:.62, font:F.sans, size:11, ls:.3, upper:true, weight:500, fill:"t"},
     main:{y:.70, w:.72, font:F.display, size:34, weight:700},
     detail:{y:.795, w:.62, font:F.sans, size:12},
     msg:{y:.905, w:.64, font:F.script, size:20, fill:"t"}}},

  {id:"evergreen", name:"Evergreen", subs:["Christmas","Holiday client gift"],
   art:c => frame(12, c.a, 1)
     + sprig(W / 2 + 4 * S, .125 * H, 3, 118, c.a, c.b) + sprig(W / 2 - 4 * S, .125 * H, 177, 118, c.a, c.b)
     + sprig(W / 2 + 4 * S, .885 * H, -3, 118, c.a, c.b) + sprig(W / 2 - 4 * S, .885 * H, 183, 118, c.a, c.b)
     + `<circle cx="${W / 2}" cy="${n1(.125 * H)}" r="${n1(5 * S)}" fill="${c.b}"/><circle cx="${W / 2}" cy="${n1(.885 * H)}" r="${n1(5 * S)}" fill="${c.b}"/>`,
   zones:{
     top:{y:.305, w:.66, font:F.sans, size:12, ls:.3, upper:true, fill:"t"},
     main:{y:.545, w:.76, font:F.script, size:46},
     detail:{y:.68, w:.70, font:F.serif, size:14, ls:.2, upper:true, weight:500},
     msg:{y:.79, w:.68, font:F.serif, size:15, italic:true, fill:"t"}}},

  {id:"snow", name:"Snowfall", subs:["Christmas","Hanukkah","New Year's","Holiday client gift"],
   art:c => scatter(5, Math.round(W * H / 800), [.14, .86, .21, .87], (x, y, k, i) =>
       i % 3 === 0 ? `<circle cx="${x}" cy="${y}" r="${n1((1.2 + k * 1.8) * S)}" fill="${c.a}"/>` : flake(x, y, n1((5 + k * 10) * S), c.a)),
   zones:{
     top:{y:.35, w:.60, font:F.sans, size:12, ls:.3, upper:true, fill:"t"},
     main:{y:.575, w:.66, font:F.script, size:46},
     detail:{y:.705, w:.60, font:F.serif, size:14, ls:.2, upper:true, weight:500},
     msg:{y:.82, w:.60, font:F.serif, size:15, italic:true}}},

  {id:"holly", name:"Wreath",
   art:c => wreath(W / 2, H / 2, hollyR(), c.a, c.b, 11 * S)
     + (W > H * 1.2 ? sparkle(30*S, 30*S, 8*S, c.b) + sparkle(W - 30*S, 30*S, 8*S, c.b) + sparkle(30*S, H - 30*S, 8*S, c.b) + sparkle(W - 30*S, H - 30*S, 8*S, c.b) : ""),
   zones:{
     top:{y:() => H / 2 - .36 * hollyR(), w:() => 1.12 * hollyR(), font:F.sans, size:10, ls:.28, upper:true},
     main:{y:() => H / 2 + .08 * hollyR(), w:() => 1.46 * hollyR(), font:F.script, size:40},
     detail:{y:() => H / 2 + .34 * hollyR(), w:() => 1.28 * hollyR(), font:F.serif, size:13, ls:.16, upper:true, weight:500},
     msg:{y:() => H / 2 + .58 * hollyR(), w:() => 1.02 * hollyR(), font:F.serif, size:12, italic:true}}},

  {id:"stripe", name:"Cabana Stripe", not:["remembrance"],
   art:c => {
     let s = "";
     for (let x = 0; x < W; x += 40 * S) s += `<rect x="${n1(x)}" y="0" width="${n1(20 * S)}" height="${H}" fill="${mix(c.a, c.bg, .4)}"/>`;
     return s + `<rect x="${n1(34*S)}" y="${n1(26*S)}" width="${n1(W - 68*S)}" height="${n1(H - 52*S)}" fill="${c.bg}" stroke="${c.ink}" stroke-width="${n1(1.5*S)}"/>`
       + `<rect x="${n1(39*S)}" y="${n1(31*S)}" width="${n1(W - 78*S)}" height="${n1(H - 62*S)}" fill="none" stroke="${c.ink}" stroke-width="${n1(.6*S)}"/>`
       + ornament(.2 * H, c.ink);
   },
   zones:{
     top:{y:.335, w:.60, font:F.sans, size:11, ls:.3, upper:true, weight:500},
     main:{y:.545, w:.66, font:F.serif, size:38, weight:600},
     detail:{y:.67, w:.62, font:F.sans, size:11, ls:.16, upper:true},
     msg:{y:.815, w:.62, font:F.script, size:22}}},

  {id:"home", name:"New Home", subs:["New home","Closing gift","Neighbor"],
   art:c => {
     const gy = .42 * H, hs = .6 * S, cx = W / 2;
     return frame(12, c.a, 1)
       + sprig(cx + 62 * hs, gy, -62, 58, c.a, c.b, hs) + sprig(cx - 62 * hs, gy, 242, 58, c.a, c.b, hs)
       + sprig(cx + 86 * hs, gy, -40, 40, c.a, null, hs) + sprig(cx - 86 * hs, gy, 220, 40, c.a, null, hs)
       + `<g transform="translate(${cx} ${n1(gy)}) scale(${+hs.toFixed(3)})" fill="${c.bg}" stroke="${c.ink}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">`
       + `<path d="M32 -92 V-114 H46 V-80"/><path d="M-50 -70 V0 H50 V-70"/><path d="M-66 -60 L0 -118 L66 -60" fill="none"/>`
       + `<rect x="-11" y="-40" width="22" height="40"/><rect x="-39" y="-50" width="18" height="18"/><rect x="21" y="-50" width="18" height="18"/>`
       + `<circle cx="6" cy="-19" r="1.4" fill="${c.ink}"/><line x1="-108" y1="0" x2="108" y2="0"/></g>`;
   },
   zones:{
     top:{y:.535, w:.66, font:F.sans, size:11, ls:.28, upper:true},
     main:{y:.705, w:.74, font:F.script, size:40},
     detail:{y:.805, w:.70, font:F.serif, size:15, weight:500},
     msg:{y:.895, w:.68, font:F.serif, size:13, italic:true}}},
  {id:"hearts", name:"Hearts", groups:["weddings","baby","thanks"], subs:["Valentine's Day","Galentine's","Mother's Day"],
   art:c => scatter(31, Math.round(W * H / 620), [.13, .87, .21, .87], (x, y, k, i) =>
       heart(x, y, (4 + k * 8) * S, [c.a, c.b, c.a][i % 3], Math.round(k * 60 - 30), i % 4 === 0)),
   zones:{
     top:{y:.35, w:.60, font:F.sans, size:12, ls:.3, upper:true, fill:"t"},
     main:{y:.575, w:.66, font:F.script, size:46},
     detail:{y:.715, w:.60, font:F.serif, size:17, weight:500},
     msg:{y:.825, w:.60, font:F.serif, size:14, italic:true}}},

  {id:"stars", name:"Stars", groups:["birthdays","milestones","business","baby"], subs:["Fourth of July","New Year's","Hanukkah"],
   art:c => scatter(47, Math.round(W * H / 640), [.13, .87, .21, .87], (x, y, k, i) =>
       i % 3 === 2 ? sparkle(x, y, (4 + k * 6) * S, c.b) : star5(x, y, (4 + k * 7) * S, [c.a, c.c][i % 2], Math.round(k * 72))),
   zones:{
     top:{y:.355, w:.60, font:F.sans, size:13, ls:.3, upper:true, weight:500, fill:"t"},
     main:{y:.565, w:.66, font:F.display, size:34, weight:700},
     detail:{y:.685, w:.60, font:F.sans, size:13},
     msg:{y:.83, w:.62, font:F.serif, size:15, italic:true, fill:"t"}}},
  {id:"logo1", name:"Logo Classic", logo:true,
   art:c => frame(12, c.a, 1) + logoMark(.18 * W, .09 * H, .64 * W, .44 * H, c),
   zones:{
     top:{y:.62, w:.70, font:F.sans, size:10, ls:.28, upper:true, fill:"t"},
     main:{y:.745, w:.76, font:F.serif, size:26, weight:600},
     detail:{y:.835, w:.70, font:F.sans, size:10, ls:.16, upper:true},
     msg:{y:.915, w:.70, font:F.serif, size:12, italic:true}}},

  {id:"logo2", name:"Logo Banner", logo:true,
   art:c => `<rect x="0" y="0" width="${W}" height="${n1(.56 * H)}" fill="#ffffff"/>` + logoMark(.15 * W, .06 * H, .70 * W, .44 * H, c)
     + `<rect x="0" y="${n1(.56 * H)}" width="${W}" height="${n1(.44 * H)}" fill="${c.ink}"/><rect x="0" y="${n1(.56 * H)}" width="${W}" height="${n1(3 * S)}" fill="${c.a}"/>`,
   zones:{
     top:{y:.675, w:.76, font:F.sans, size:10, ls:.28, upper:true, fill:"bg"},
     main:{y:.795, w:.80, font:F.serif, size:26, weight:600, fill:"bg"},
     detail:{y:.875, w:.76, font:F.sans, size:10, ls:.16, upper:true, fill:"bg"},
     msg:{y:.945, w:.76, font:F.serif, size:11, italic:true, fill:"bg"}}},

  {id:"logo3", name:"Logo Side", logo:true,
   art:c => wide()
     ? logoMark(.06 * W, .14 * H, .36 * W, .72 * H, c) + `<line x1="${n1(.47 * W)}" y1="${n1(.2 * H)}" x2="${n1(.47 * W)}" y2="${n1(.8 * H)}" stroke="${c.a}" stroke-width="${n1(1.2 * S)}"/>`
     : logoMark(.18 * W, .08 * H, .64 * W, .44 * H, c) + `<line x1="${n1(.3 * W)}" y1="${n1(.57 * H)}" x2="${n1(.7 * W)}" y2="${n1(.57 * H)}" stroke="${c.a}" stroke-width="${n1(1.2 * S)}"/>`,
   zones:{
     top:{x:() => wide() ? .735 * W : W / 2, y:() => (wide() ? .34 : .66) * H, w:() => (wide() ? .44 : .7) * W, font:F.sans, size:10, ls:.26, upper:true, fill:"t"},
     main:{x:() => wide() ? .735 * W : W / 2, y:() => (wide() ? .50 : .775) * H, w:() => (wide() ? .46 : .76) * W, font:F.serif, size:25, weight:600},
     detail:{x:() => wide() ? .735 * W : W / 2, y:() => (wide() ? .62 : .86) * H, w:() => (wide() ? .44 : .7) * W, font:F.sans, size:10, ls:.14, upper:true},
     msg:{x:() => wide() ? .735 * W : W / 2, y:() => (wide() ? .75 : .935) * H, w:() => (wide() ? .44 : .7) * W, font:F.serif, size:12, italic:true}}},
  {id:"fframe", name:"Floral Frame",
   art:c => soft(cluster(.2 * W, .2 * H, 1.15 * S, 0, c) + cluster(.83 * W, .62 * H, 1.1 * S, 125, c) + cluster(.15 * W, .74 * H, .95 * S, -75, c)
       + cluster(.79 * W, .13 * H, .72 * S, 55, c) + cluster(.5 * W, .92 * H, .7 * S, 185, c) + wspray(.36 * W, .1 * H, 70 * S, -8, G1) + wspray(.62 * W, .92 * H, 60 * S, 6, G2))
     + `<rect x="${n1(.21 * W)}" y="${n1(.17 * H)}" width="${n1(.58 * W)}" height="${n1(.66 * H)}" fill="${panelFill(c)}"/>`,
   zones:{
     top:{y:.33, w:.48, font:F.sans, size:11, ls:.24, upper:true},
     main:{y:.56, w:.50, font:F.script, size:44},
     detail:{y:.69, w:.48, font:F.sans, size:12, ls:.14, upper:true},
     msg:{y:.775, w:.48, font:F.sans, size:9, ls:.14, upper:true}}},

  {id:"fhex", name:"Floral Hexagon",
   art:c => soft(cluster(.17 * W, .25 * H, 1.1 * S, 10, c) + cluster(.86 * W, .3 * H, .85 * S, 80, c) + cluster(.14 * W, .76 * H, 1 * S, -60, c)
       + cluster(.85 * W, .76 * H, 1.1 * S, 150, c) + cluster(.52 * W, .06 * H, .7 * S, 30, c) + cluster(.48 * W, .95 * H, .7 * S, 200, c))
     + `<polygon points="${[[.13,.5],[.3,.13],[.7,.13],[.87,.5],[.7,.87],[.3,.87]].map(q => n1(q[0] * W) + "," + n1(q[1] * H)).join(" ")}" fill="${panelFill(c)}"/>`,
   zones:{
     top:{y:.31, w:.38, font:F.serif, size:17, ls:.2, upper:true, weight:500},
     main:{y:.535, w:.58, font:F.script, size:44},
     detail:{y:.68, w:.50, font:F.sans, size:11, ls:.16, upper:true},
     msg:{y:.775, w:.40, font:F.sans, size:9, ls:.16, upper:true}}},

  {id:"fcanopy", name:"Floral Canopy",
   art:c => soft(wspray(.12 * W, .2 * H, 62 * S, 80, G1) + wspray(.36 * W, .22 * H, 54 * S, 95, G2) + wspray(.62 * W, .2 * H, 60 * S, 84, G1) + wspray(.88 * W, .2 * H, 56 * S, 98, G2)
       + cluster(.07 * W, .1 * H, 1.05 * S, 25, c) + cluster(.29 * W, .13 * H, .9 * S, 200, c) + cluster(.5 * W, .09 * H, 1.15 * S, -20, c)
       + cluster(.72 * W, .14 * H, .9 * S, 140, c) + cluster(.94 * W, .1 * H, 1.05 * S, 70, c)),
   zones:{
     top:{y:.52, w:.6, font:F.sans, size:10, ls:.26, upper:true},
     main:{y:.72, w:.7, font:F.script, size:46},
     detail:{y:.84, w:.66, font:F.serif, size:13, ls:.12, upper:true, weight:500},
     msg:{y:.925, w:.66, font:F.serif, size:12, italic:true}}},

  {id:"glitter", name:"Glitter Frame", not:["remembrance"],
   art:c => {
     const cols = [c.a, mix(c.a, "#ffffff", .4), mix(c.a, "#000000", .22), mix(c.a, "#ffffff", .65)];
     const px = .16 * W, py = .17 * H, pw = .68 * W, ph = .66 * H, r = rng(77), reach = Math.min(W, H) * .24;
     let s = "";
     for (let i = 0, n = LITE ? 1100 : 3600; i < n; i++){
       const x = r() * W, y = r() * H, k = r(), k2 = r();
       const d = Math.hypot(Math.max(px - x, 0, x - px - pw), Math.max(py - y, 0, y - py - ph));
       if (!d || k2 > Math.max(.2, 1.15 - d / reach)) continue;
       const z = n1((3 + k * 3.5) * S);
       s += `<rect x="${n1(x)}" y="${n1(y)}" width="${z}" height="${z}" fill="${cols[i % 4]}" transform="rotate(${Math.round(k * 90)} ${n1(x)} ${n1(y)})"/>`;
     }
     return s + `<rect x="${n1(px)}" y="${n1(py)}" width="${n1(pw)}" height="${n1(ph)}" fill="${panelFill(c)}"/>`;
   },
   zones:{
     top:{y:.33, w:.56, font:F.serif, size:17, ls:.14, upper:true, weight:500},
     main:{y:.55, w:.58, font:F.script, size:44},
     detail:{y:.685, w:.56, font:F.sans, size:11, ls:.14, upper:true},
     msg:{y:.775, w:.56, font:F.sans, size:9, ls:.14, upper:true}}},

  {id:"keepsake", name:"Keepsake", uses:["top"],
   // A bold solid color taken from the palette. Yellow-orange accents stay on the light background.
   tint:c => {
     let bg = c.bg;
     if (!c.dark){ const [h, sat] = hueSat(c.a); bg = h > 20 && h < 64 && sat > .3 ? c.bg : mix(c.a, "#ffffff", .22); }
     const ink = [c.ink, "#1c1c1c", "#ffffff"].sort((p, q) => ratio(q, bg) - ratio(p, bg))[0];
     return {...c, bg, ink, t:ink, t2:ink};
   },
   art:(c, w) => {
     const id = `arc${W}x${H}`, top = (w.top || "").trim().toUpperCase();
     return frame(9, c.ink, 2) + frame(13.5, c.ink, .7)
       + `<path id="${id}" d="M${n1(.2 * W)} ${n1(.3 * H)} Q${W / 2} ${n1(.1 * H)} ${n1(.8 * W)} ${n1(.3 * H)}" fill="none"/>`
       + (top ? `<text font-family="${F.sans}" font-size="${n1(sm(11 * S))}" fill="${c.ink}" style="letter-spacing:.3em" data-fit="${n1(.56 * W)}" data-size="${n1(sm(11 * S))}"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${esc(top)}</textPath></text>` : "")
       + occasionIcon(W / 2, .37 * H, 1.05 * S, c.ink);
   },
   zones:{
     main:{y:.6, w:.74, font:F.display, size:30},
     detail:{y:.7, w:.7, font:F.sans, size:10, ls:.2, upper:true},
     msg:{y:.81, w:.7, font:F.display, size:13, ls:.1, upper:true, weight:700}}},

  {id:"hdoodle", name:"Holiday Sketch", subs:["Christmas","Holiday client gift"],
   art:c => {
     const g = c.a, b = c.b, k = S, band = (y, col, off) => `<line x1="0" y1="${n1(y)}" x2="${W}" y2="${n1(y)}" stroke="${col}" stroke-width="${n1(9 * S)}" stroke-dasharray="${n1(3 * S)} ${n1(9 * S)}" stroke-dashoffset="${n1(off * S)}"/>`;
     return band(4.5 * S, b, 0) + band(4.5 * S, g, 6) + band(H - 4.5 * S, b, 0) + band(H - 4.5 * S, g, 6) + frame(15, b, .8)
       + dBow(W / 2, .17 * H, .95 * k, b) + dHolly(W / 2 - 34 * S, .16 * H, .62 * k, -18, g, b) + dHolly(W / 2 + 34 * S, .16 * H, .62 * k, 18, g, b)
       + dGlass(.12 * W, .34 * H, 1.05 * k, b, b) + dOrn(.88 * W, .34 * H, 1 * k, b, g) + dTree(.115 * W, .7 * H, .95 * k, g, b) + dCane(.87 * W, .64 * H, 1.1 * k, b, c.bg)
       + dHolly(.26 * W, .885 * H, .6 * k, 8, g, b) + dGift(.86 * W, .87 * H, 1 * k, b, g, c.bg) + dHolly(.62 * W, .9 * H, .5 * k, -10, g, b)
       + sparkle(.24 * W, .2 * H, 5 * S, b) + sparkle(.76 * W, .18 * H, 5 * S, b) + sparkle(.2 * W, .52 * H, 4 * S, g) + sparkle(.8 * W, .5 * H, 4 * S, g) + sparkle(.44 * W, .9 * H, 4 * S, b)
       + [[.3,.12],[.7,.12],[.07,.5],[.93,.47],[.36,.92],[.73,.9]].map(q => `<circle cx="${n1(q[0] * W)}" cy="${n1(q[1] * H)}" r="${n1(2.2 * S)}" fill="${b}"/>`).join("");
   },
   zones:{
     top:{y:.36, w:.5, font:F.sans, size:10, ls:.28, upper:true},
     main:{y:.575, w:.56, font:F.script, size:46, fill:"t2"},
     detail:{y:.705, w:.54, font:F.serif, size:15, ls:.12, upper:true, weight:600},
     msg:{y:.8, w:.5, font:F.serif, size:11, ls:.12, upper:true}}},

  {id:"xtree", name:"Christmas Tree", subs:["Christmas","Holiday client gift"],
   art:c => {
     const k = .68 * H / 190, a = c.a, gold = c.c;
     let s = at(.2 * W, .86 * H, k) + `<rect x="-6" y="-10" width="12" height="12" fill="${mix(a, "#3a2414", .6)}"/>`;
     [[-186,-128,26],[-150,-88,38],[-112,-48,50],[-74,-8,62]].forEach((q, i) => { s += `<polygon points="0,${q[0]} ${-q[2]},${q[1]} ${q[2]},${q[1]}" fill="${mix(a, "#ffffff", .22 - i * .07 > 0 ? .22 - i * .07 : 0)}"/>`; });
     s += `<path d="M-17 -136 Q0 -126 19 -139 M-27 -98 Q0 -84 30 -101 M-37 -58 Q0 -42 41 -62 M-47 -20 Q0 -4 52 -24" fill="none" stroke="${gold}" stroke-width="2.2" stroke-linecap="round"/>`;
     [[-8,-150],[10,-118],[-18,-108],[22,-78],[-6,-72],[-30,-66],[34,-40],[4,-36],[-24,-30],[-44,-22]].forEach((q, i) => { s += `<circle cx="${q[0]}" cy="${q[1]}" r="4.2" fill="${i % 2 ? gold : c.b}"/>`; });
     s += star5(0, -192, 11, gold, 0)
       + `<rect x="-62" y="-22" width="28" height="24" fill="${c.b}"/><path d="M-48 -22 V2 M-62 -11 H-34" stroke="${gold}" stroke-width="3"/>`
       + `<rect x="-30" y="-15" width="20" height="17" fill="${mix(c.b, "#ffffff", .7)}"/><path d="M-20 -15 V2" stroke="${c.b}" stroke-width="2.6"/>`
       + `<rect x="22" y="-27" width="32" height="29" fill="${mix(a, "#ffffff", .55)}"/><path d="M38 -27 V2 M22 -13 H54" stroke="${c.b}" stroke-width="3"/>`;
     return s + `</g>`;
   },
   zones:{
     top:{x:() => .69 * W, y:.27, w:.5, font:F.sans, size:10, ls:.26, upper:true},
     main:{x:() => .69 * W, y:.5, w:.52, font:F.script, size:42, fill:"t2"},
     detail:{x:() => .69 * W, y:.66, w:.5, font:F.serif, size:13, ls:.1, upper:true, weight:600},
     msg:{x:() => .69 * W, y:.78, w:.5, font:F.serif, size:12, italic:true}}},

  {id:"pdoodle", name:"Party Sketch", groups:["birthdays","gatherings"], subs:["Bachelorette","Galentine's","You did it","Bridal shower"],
   art:c => {
     const p = c.a, ink = c.ink, lt = mix(c.a, c.bg, .62), y0 = .9 * H, k = S, i10 = n1(10 * S), i17 = n1(17 * S);
     return `<rect x="${i10}" y="${i10}" width="${n1(W - 20 * S)}" height="${n1(H - 20 * S)}" rx="${n1(16 * S)}" fill="none" stroke="${p}" stroke-width="${n1(2 * S)}"/>`
       + `<rect x="${i17}" y="${i17}" width="${n1(W - 34 * S)}" height="${n1(H - 34 * S)}" rx="${n1(11 * S)}" fill="none" stroke="${p}" stroke-width="${n1(2.6 * S)}" stroke-linecap="round" stroke-dasharray="0 ${n1(8 * S)}"/>`
       + `<rect x="${n1(W / 2 - 11 * S)}" y="${n1(4 * S)}" width="${n1(22 * S)}" height="${n1(18 * S)}" fill="${c.bg}"/><rect x="${n1(W / 2 - 11 * S)}" y="${n1(H - 22 * S)}" width="${n1(22 * S)}" height="${n1(18 * S)}" fill="${c.bg}"/>`
       + dHeart(W / 2, 13 * S, .7 * k, p, false) + dHeart(W / 2, H - 14 * S, .7 * k, p, false)
       + dDisco(.875 * W, .28 * H, 22 * S, ink, lt, 10 * S)
       + star5(n1(.1 * W), n1(.2 * H), 9 * S, c.b, 10) + star5(n1(.19 * W), n1(.36 * H), 6 * S, lt, -12) + star5(n1(.9 * W), n1(.62 * H), 7 * S, c.b, 8)
       + sparkle(.26 * W, .16 * H, 6 * S, p) + sparkle(.72 * W, .15 * H, 5 * S, p) + sparkle(.1 * W, .56 * H, 5 * S, p) + sparkle(.8 * W, .52 * H, 4 * S, p) + sparkle(.93 * W, .78 * H, 5 * S, p)
       + dFlute(.17 * W, y0 - 13 * S, 1 * k, ink, p) + dCupcake(.32 * W, y0 - 7 * S, 1 * k, ink, lt, c.b) + dCake(.5 * W, y0 - 9 * S, .95 * k, ink, lt, c.b)
       + dBalloons(.68 * W, y0 - 24 * S, .95 * k, ink, lt, mix(c.b, c.bg, .4)) + dGift(.83 * W, y0 - 9 * S, .95 * k, ink, p, lt);
   },
   zones:{
     top:{y:.275, w:.5, font:F.sans, size:11, ls:.26, upper:true, weight:600, fill:"t"},
     main:{y:.47, w:.6, font:F.sans, size:32, ls:.05, upper:true, weight:600, fill:"t"},
     detail:{y:.6, w:.52, font:F.script, size:23, fill:"t"},
     msg:{y:.685, w:.5, font:F.sans, size:9, ls:.22, upper:true}}},
  {id:"photo1", name:"Photo Snapshot", photo:true,
   art:c => photoMark(.07 * W, .07 * H, .86 * W, .6 * H),
   zones:{
     main:{y:.835, w:.8, font:F.script, size:40},
     detail:{y:.94, w:.8, font:F.sans, size:11, ls:.3, upper:true}}},

  {id:"photo2", name:"Photo Banner", photo:true,
   art:c => photoMark(0, 0, W, .66 * H) + `<rect x="0" y="${n1(.66 * H)}" width="${W}" height="${n1(.34 * H)}" fill="${c.ink}"/><rect x="0" y="${n1(.66 * H)}" width="${W}" height="${n1(3 * S)}" fill="${c.a}"/>`,
   zones:{
     main:{y:.82, w:.84, font:F.script, size:36, fill:"bg"},
     detail:{y:.925, w:.8, font:F.sans, size:10, ls:.3, upper:true, fill:"bg"}}}
];
// New styles lead the lineup; the rest keep their order.
["keepsake","glitter","fcanopy","fhex","fframe"].forEach(id => { const i = TEMPLATES.findIndex(t => t.id === id); TEMPLATES.unshift(TEMPLATES.splice(i, 1)[0]); });
