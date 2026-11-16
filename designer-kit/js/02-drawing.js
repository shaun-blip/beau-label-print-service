/* ---------- drawing helpers (all vector; sizes follow S) ---------- */
const n1 = v => +v.toFixed(1);
function rng(seed){ return () => (seed = seed * 16807 % 2147483647) / 2147483647; }
function sprig(x, y, ang, len, leaf, berry, k = S){
  let s = `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${ang}) scale(${+k.toFixed(3)})"><line x1="0" y1="0" x2="${len}" y2="0" stroke="${leaf}" stroke-width="1.2" stroke-linecap="round"/>`;
  const n = Math.floor(len / 16);
  for (let i = 1; i <= n; i++){
    const px = n1(i * len / (n + 1)), r = n1(9.5 - 4 * i / n), ry = n1(r * .38);
    s += `<ellipse cx="${n1(px + r)}" cy="0" rx="${r}" ry="${ry}" fill="${leaf}" transform="rotate(-38 ${px} 0)"/>`;
    s += `<ellipse cx="${n1(px + r)}" cy="0" rx="${r}" ry="${ry}" fill="${leaf}" transform="rotate(38 ${px} 0)"/>`;
    if (berry && i % 2 === 0) s += `<circle cx="${n1(px - 3)}" cy="${i % 4 === 0 ? -8 : 8}" r="2.6" fill="${berry}"/>`;
  }
  return s + `<ellipse cx="${len + 5}" cy="0" rx="6" ry="2.4" fill="${leaf}"/></g>`;
}
function flower(x, y, r, col, mid, n = 5){
  x = n1(x); y = n1(y); let s = "";
  for (let i = 0; i < n; i++) s += `<ellipse cx="${x}" cy="${n1(y - r * .58)}" rx="${n1(r * .36)}" ry="${n1(r * .58)}" fill="${col}" transform="rotate(${i * 360 / n} ${x} ${y})"/>`;
  return s + `<circle cx="${x}" cy="${y}" r="${n1(r * .24)}" fill="${mid}"/>`;
}
function wreath(cx, cy, R, leaf, berry, L){
  cx = n1(cx); cy = n1(cy); R = n1(R); L = n1(L);
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${leaf}" stroke-width="${n1(1.2 * S)}"/>`;
  const n = Math.max(14, Math.round(R / L * 4.6));
  for (let i = 0; i < n; i++){
    s += `<g transform="rotate(${n1(i * 360 / n)} ${cx} ${cy}) translate(${n1(cx + R)} ${cy})">`
      + `<ellipse cx="0" cy="${-L}" rx="${n1(L * .36)}" ry="${L}" fill="${leaf}" transform="rotate(${i % 2 ? 32 : -32})"/>`
      + (berry && i % 3 === 0 ? `<circle cx="${n1((i % 2 ? -.5 : .5) * L)}" cy="${n1(L * .15)}" r="${n1(L * .23)}" fill="${berry}"/>` : "") + `</g>`;
  }
  return s;
}
function diamond(x, y, s, col){ return `<rect x="${n1(x - s / 2)}" y="${n1(y - s / 2)}" width="${n1(s)}" height="${n1(s)}" fill="${col}" transform="rotate(45 ${n1(x)} ${n1(y)})"/>`; }
function ornament(y, col){
  return `<g transform="translate(${W / 2} ${n1(y)}) scale(${+S.toFixed(3)})"><line x1="-72" y1="0" x2="-28" y2="0" stroke="${col}" stroke-width="1"/><line x1="28" y1="0" x2="72" y2="0" stroke="${col}" stroke-width="1"/>`
    + diamond(0, 0, 10, col) + diamond(-17, 0, 5, col) + diamond(17, 0, 5, col) + `</g>`;
}
function sparkle(x, y, r, col){
  x = n1(x); y = n1(y); r = n1(r);
  return `<path d="M${x} ${n1(y - r)} Q${x} ${y} ${n1(x + r)} ${y} Q${x} ${y} ${x} ${n1(y + r)} Q${x} ${y} ${n1(x - r)} ${y} Q${x} ${y} ${x} ${n1(y - r)}Z" fill="${col}"/>`;
}
function flake(x, y, r, col){
  let s = `<g transform="translate(${x} ${y})" stroke="${col}" stroke-width="${n1(Math.max(.7, r / 9))}" stroke-linecap="round" stroke-linejoin="round" fill="none">`;
  for (let k = 0; k < 6; k++) s += `<g transform="rotate(${k * 60})"><line x1="0" y1="0" x2="0" y2="${-r}"/><path d="M${n1(-r * .28)} ${n1(-r * .84)} L0 ${n1(-r * .58)} L${n1(r * .28)} ${n1(-r * .84)}"/></g>`;
  return s + `</g>`;
}
function balloon(x, y, r, col, gx, gy, line){
  x = n1(x); y = n1(y); r = n1(r);
  const ry = n1(r * 1.22), hx = n1(x - r * .35), hy = n1(y - ry * .4), k = r / 17;
  return `<path d="M${x} ${n1(y + ry + 3 * k)} Q${n1((x + gx) / 2 + (x < gx ? -6 : 6) * k)} ${n1((y + ry + gy) / 2)} ${n1(gx)} ${n1(gy)}" fill="none" stroke="${line}" stroke-width="${n1(.8 * k)}" opacity=".55"/>`
    + `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${ry}" fill="${col}"/>`
    + `<path d="M${n1(x - 2.4 * k)} ${n1(y + ry + 3 * k)} L${x} ${n1(y + ry - 1)} L${n1(x + 2.4 * k)} ${n1(y + ry + 3 * k)}Z" fill="${col}"/>`
    + `<ellipse cx="${hx}" cy="${hy}" rx="${n1(r * .15)}" ry="${n1(r * .3)}" fill="#ffffff" opacity=".4" transform="rotate(-25 ${hx} ${hy})"/>`;
}
function frame(inset, col, sw = 1){
  const i = n1(inset * S);
  return `<rect x="${i}" y="${i}" width="${n1(W - 2 * i)}" height="${n1(H - 2 * i)}" fill="none" stroke="${col}" stroke-width="${n1(sw * S)}"/>`;
}
function scatter(seed, count, box, draw){
  const r = rng(seed); let s = "";
  for (let i = 0; i < count; i++){
    const x = n1(8 * S + r() * (W - 16 * S)), y = n1(8 * S + r() * (H - 16 * S)), k = r();
    if (x > box[0] * W && x < box[1] * W && y > box[2] * H && y < box[3] * H) continue;
    s += draw(x, y, k, i);
  }
  return s;
}
function initials(main){
  const clean = (main || "").trim();
  if (!clean) return "";
  const first = w => (w.replace(/^the\s+/i, "").match(/[A-Za-zÀ-ÿ]/) || [""])[0].toUpperCase();
  const parts = clean.split(/\s*(?:&|\+|\band\b)\s*/i).filter(Boolean);
  return parts.length >= 2 ? first(parts[0]) + " & " + first(parts[1]) : first(clean);
}
// The customer's logo, or a marked placeholder until one is uploaded. It always sits on a white plate so any logo stays visible.
function logoMark(x, y, w, h, c){
  const pad = 7 * S;
  let s = `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${n1(6 * S)}" fill="#ffffff"/>`;
  if (state.logo) return s + `<image href="${state.logo.url}" x="${n1(x + pad)}" y="${n1(y + pad)}" width="${n1(w - 2 * pad)}" height="${n1(h - 2 * pad)}" preserveAspectRatio="xMidYMid meet"/>`;
  return s + `<rect x="${n1(x + pad)}" y="${n1(y + pad)}" width="${n1(w - 2 * pad)}" height="${n1(h - 2 * pad)}" rx="${n1(4 * S)}" fill="none" stroke="#9fb2c4" stroke-width="${n1(1.2 * S)}" stroke-dasharray="${n1(5 * S)} ${n1(4 * S)}"/>`
    + `<text x="${n1(x + w / 2)}" y="${n1(y + h / 2 + 4 * S)}" text-anchor="middle" font-family="${F.sans}" font-size="${n1(11 * S)}" fill="#5a6a7b" style="letter-spacing:.2em">YOUR LOGO</text>`;
}
// The customer's photo, cropped to fill its frame, or a marked placeholder until one is uploaded.
function photoMark(x, y, w, h){
  const box = `x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}"`;
  if (state.photo) return `<rect ${box} fill="#e6ecf1"/><image href="${state.photo.url}" ${box} preserveAspectRatio="xMid${state.photoPos} slice"/>`;
  const cx = x + w / 2, cy = y + h / 2, k = Math.min(w, h) / 120;
  return `<rect ${box} fill="#e6ecf1"/>` + at(cx, cy - 8 * k, k) + `<circle cx="22" cy="-22" r="8" fill="#c3ced8"/><path d="M-46 22 L-16 -14 L4 8 L16 -4 L46 22Z" fill="#c3ced8"/></g>`
    + `<text x="${n1(cx)}" y="${n1(cy + 34 * k)}" text-anchor="middle" font-family="${F.sans}" font-size="${n1(11 * S)}" fill="#5a6a7b" style="letter-spacing:.2em">YOUR PHOTO</text>`;
}
/* ---------- the label on a bottle, with or without a wrap ---------- */
const BOTTLE = "M182 24 H218 V140 C218 190 292 200 292 262 V492 Q292 512 272 512 H128 Q108 512 108 492 V262 C108 200 182 190 182 140 Z";
function wrapPattern(kind, col, id){
  const body = kind === "stripe" ? `<rect width="24" height="24" fill="#ffffff"/><rect width="12" height="24" fill="${mix(col, "#ffffff", .5)}"/>`
    : kind === "gingham" ? `<rect width="24" height="24" fill="#ffffff"/><rect width="24" height="12" fill="${col}" opacity=".32"/><rect width="12" height="24" fill="${col}" opacity=".32"/>`
    : `<rect width="24" height="24" fill="${mix(col, "#ffffff", .82)}"/><circle cx="12" cy="12" r="4.5" fill="${col}"/>`;
  return `<pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse">${body}</pattern>`;
}
// Real bottle photos. Sizes are in photo pixels: label = the bottle's own label, body = the glass edges at that height, path = the outline.
const BOT = {"champagne":{"w":380,"h":1400,"label":[14,1017,367,1327],"body":[0,380],"path":"M176 0 L120 10 L115 20 L113 30 L111 40 L111 50 L110 60 L110 70 L110 80 L111 90 L110 100 L110 110 L110 120 L108 130 L107 140 L107 150 L108 160 L115 170 L120 180 L120 190 L120 200 L120 210 L120 220 L119 230 L119 240 L119 250 L119 260 L119 270 L118 280 L118 290 L118 300 L117 310 L115 320 L115 330 L114 340 L112 350 L111 360 L110 370 L108 380 L107 390 L105 400 L103 410 L101 420 L99 430 L98 440 L96 450 L95 460 L92 470 L90 480 L88 490 L86 500 L84 510 L82 520 L78 530 L76 540 L72 550 L69 560 L66 570 L63 580 L61 590 L58 600 L55 610 L52 620 L49 630 L47 640 L43 650 L40 660 L37 670 L34 680 L31 690 L29 700 L26 710 L23 720 L20 730 L17 740 L14 750 L13 760 L10 770 L9 780 L8 790 L6 800 L5 810 L4 820 L3 830 L3 840 L2 850 L1 860 L1 870 L1 880 L1 890 L1 900 L1 910 L1 920 L1 930 L1 940 L1 950 L1 960 L1 970 L1 980 L1 990 L1 1000 L1 1010 L1 1020 L1 1030 L1 1040 L1 1050 L1 1060 L0 1070 L0 1080 L0 1090 L0 1100 L0 1110 L0 1120 L0 1130 L0 1140 L0 1150 L0 1160 L0 1170 L0 1180 L0 1190 L0 1200 L0 1210 L0 1220 L0 1230 L0 1240 L0 1250 L0 1260 L0 1270 L0 1280 L0 1290 L0 1300 L0 1310 L0 1320 L0 1330 L0 1340 L1 1350 L4 1360 L9 1370 L18 1380 L44 1390 L175 1399 L229 1399 L339 1390 L360 1380 L370 1370 L375 1360 L378 1350 L379 1340 L380 1330 L380 1320 L380 1310 L380 1300 L380 1290 L380 1280 L380 1270 L380 1260 L380 1250 L380 1240 L380 1230 L380 1220 L380 1210 L380 1200 L380 1190 L380 1180 L380 1170 L380 1160 L380 1150 L380 1140 L379 1130 L379 1120 L379 1110 L379 1100 L379 1090 L379 1080 L379 1070 L379 1060 L379 1050 L378 1040 L378 1030 L378 1020 L378 1010 L378 1000 L378 990 L378 980 L379 970 L379 960 L379 950 L379 940 L379 930 L379 920 L379 910 L379 900 L379 890 L378 880 L378 870 L377 860 L377 850 L376 840 L375 830 L374 820 L372 810 L371 800 L370 790 L369 780 L367 770 L365 760 L363 750 L361 740 L357 730 L354 720 L353 710 L350 700 L347 690 L344 680 L341 670 L338 660 L335 650 L332 640 L328 630 L325 620 L322 610 L320 600 L317 590 L314 580 L311 570 L307 560 L304 550 L301 540 L298 530 L295 520 L293 510 L290 500 L287 490 L286 480 L283 470 L281 460 L278 450 L277 440 L274 430 L272 420 L269 410 L267 400 L265 390 L263 380 L262 370 L261 360 L259 350 L258 340 L256 330 L255 320 L254 310 L252 300 L252 290 L252 280 L251 270 L251 260 L250 250 L249 240 L248 230 L248 220 L248 210 L248 200 L248 190 L248 180 L252 170 L260 160 L261 150 L261 140 L261 130 L260 120 L259 110 L258 100 L258 90 L256 80 L255 70 L254 60 L252 50 L252 40 L249 30 L245 20 L241 10 L183 0Z"},"prosecco":{"w":392,"h":1397,"label":[53,967,349,1270],"body":[10,384],"path":"M171 0 L138 10 L128 20 L122 30 L119 40 L120 50 L121 60 L122 70 L122 80 L121 90 L119 100 L120 110 L120 120 L118 130 L115 140 L115 150 L118 160 L122 170 L128 180 L132 190 L132 200 L133 210 L133 220 L133 230 L134 240 L134 250 L134 260 L134 270 L134 280 L133 290 L133 300 L133 310 L133 320 L133 330 L133 340 L133 350 L133 360 L132 370 L132 380 L131 390 L130 400 L128 410 L127 420 L124 430 L123 440 L121 450 L119 460 L117 470 L114 480 L113 490 L109 500 L106 510 L102 520 L99 530 L95 540 L92 550 L88 560 L84 570 L80 580 L76 590 L72 600 L68 610 L64 620 L60 630 L57 640 L53 650 L49 660 L45 670 L41 680 L37 690 L33 700 L30 710 L27 720 L24 730 L20 740 L19 750 L16 760 L14 770 L12 780 L9 790 L8 800 L7 810 L5 820 L4 830 L3 840 L2 850 L2 860 L1 870 L1 880 L1 890 L1 900 L0 910 L0 920 L1 930 L1 940 L1 950 L2 960 L2 970 L2 980 L4 990 L4 1000 L4 1010 L5 1020 L5 1030 L5 1040 L7 1050 L7 1060 L7 1070 L8 1080 L8 1090 L9 1100 L9 1110 L10 1120 L11 1130 L11 1140 L12 1150 L13 1160 L13 1170 L14 1180 L15 1190 L15 1200 L16 1210 L16 1220 L18 1230 L19 1240 L19 1250 L20 1260 L20 1270 L22 1280 L23 1290 L24 1300 L23 1310 L16 1320 L11 1330 L9 1340 L10 1350 L13 1360 L21 1370 L33 1380 L64 1390 L158 1396 L229 1396 L325 1390 L363 1380 L374 1370 L382 1360 L386 1350 L388 1340 L385 1330 L379 1320 L373 1310 L373 1300 L374 1290 L376 1280 L376 1270 L377 1260 L377 1250 L377 1240 L378 1230 L378 1220 L378 1210 L379 1200 L380 1190 L381 1180 L381 1170 L381 1160 L383 1150 L383 1140 L383 1130 L384 1120 L384 1110 L385 1100 L385 1090 L385 1080 L386 1070 L387 1060 L387 1050 L388 1040 L388 1030 L388 1020 L388 1010 L390 1000 L390 990 L390 980 L391 970 L391 960 L391 950 L392 940 L392 930 L392 920 L392 910 L391 900 L391 890 L391 880 L391 870 L390 860 L390 850 L388 840 L388 830 L386 820 L385 810 L383 800 L381 790 L378 780 L377 770 L374 760 L372 750 L369 740 L366 730 L363 720 L360 710 L357 700 L353 690 L350 680 L346 670 L342 660 L338 650 L334 640 L329 630 L327 620 L322 610 L318 600 L314 590 L309 580 L305 570 L301 560 L297 550 L293 540 L290 530 L286 520 L283 510 L279 500 L277 490 L275 480 L272 470 L270 460 L268 450 L265 440 L264 430 L261 420 L260 410 L258 400 L257 390 L255 380 L255 370 L257 360 L256 350 L256 340 L255 330 L255 320 L255 310 L255 300 L255 290 L254 280 L254 270 L254 260 L254 250 L254 240 L254 230 L254 220 L254 210 L255 200 L255 190 L258 180 L265 170 L265 160 L265 150 L264 140 L262 130 L260 120 L259 110 L260 100 L257 90 L255 80 L259 70 L261 60 L261 50 L260 40 L257 30 L251 20 L243 10 L212 0Z"},"mini":{"w":417,"h":1398,"label":[54,997,366,1297],"body":[13,405],"path":"M184 0 L140 10 L122 20 L115 30 L109 40 L104 50 L101 60 L100 70 L99 80 L100 90 L100 100 L100 110 L99 120 L100 130 L98 140 L98 150 L98 160 L99 170 L99 180 L99 190 L99 200 L99 210 L100 220 L100 230 L104 240 L107 250 L110 260 L112 270 L115 280 L116 290 L117 300 L119 310 L120 320 L121 330 L122 340 L122 350 L122 360 L122 370 L122 380 L122 390 L122 400 L121 410 L121 420 L120 430 L120 440 L120 450 L119 460 L119 470 L118 480 L122 490 L121 500 L119 510 L118 520 L117 530 L115 540 L114 550 L112 560 L111 570 L108 580 L107 590 L104 600 L101 610 L98 620 L95 630 L93 640 L90 650 L87 660 L83 670 L81 680 L77 690 L73 700 L69 710 L65 720 L61 730 L58 740 L52 750 L48 760 L45 770 L40 780 L35 790 L31 800 L27 810 L23 820 L18 830 L14 840 L12 850 L9 860 L6 870 L5 880 L3 890 L1 900 L0 910 L0 920 L0 930 L0 940 L0 950 L0 960 L1 970 L1 980 L2 990 L3 1000 L3 1010 L4 1020 L4 1030 L5 1040 L5 1050 L6 1060 L6 1070 L7 1080 L9 1090 L9 1100 L10 1110 L10 1120 L10 1130 L12 1140 L13 1150 L13 1160 L14 1170 L14 1180 L14 1190 L16 1200 L16 1210 L17 1220 L18 1230 L18 1240 L19 1250 L20 1260 L20 1270 L21 1280 L22 1290 L23 1300 L23 1310 L24 1320 L24 1330 L24 1340 L24 1350 L23 1360 L21 1370 L27 1380 L39 1390 L130 1397 L313 1397 L381 1390 L392 1380 L396 1370 L398 1360 L395 1350 L393 1340 L393 1330 L393 1320 L394 1310 L395 1300 L395 1290 L396 1280 L398 1270 L398 1260 L399 1250 L399 1240 L399 1230 L400 1220 L402 1210 L402 1200 L403 1190 L403 1180 L403 1170 L404 1160 L405 1150 L405 1140 L406 1130 L407 1120 L407 1110 L408 1100 L409 1090 L409 1080 L410 1070 L411 1060 L411 1050 L412 1040 L413 1030 L413 1020 L414 1010 L414 1000 L414 990 L416 980 L416 970 L416 960 L416 950 L417 940 L416 930 L416 920 L416 910 L414 900 L413 890 L411 880 L409 870 L407 860 L404 850 L402 840 L398 830 L393 820 L389 810 L385 800 L381 790 L377 780 L372 770 L368 760 L363 750 L358 740 L354 730 L350 720 L347 710 L343 700 L339 690 L335 680 L332 670 L329 660 L326 650 L322 640 L320 630 L317 620 L315 610 L312 600 L309 590 L307 580 L305 570 L303 560 L301 550 L299 540 L298 530 L296 520 L295 510 L294 500 L293 490 L297 480 L297 470 L295 460 L295 450 L295 440 L294 430 L294 420 L294 410 L293 400 L292 390 L292 380 L294 370 L295 360 L296 350 L298 340 L298 330 L299 320 L299 310 L302 300 L303 290 L305 280 L307 270 L308 260 L309 250 L310 240 L311 230 L311 220 L311 210 L312 200 L312 190 L313 180 L315 170 L315 160 L316 150 L316 140 L318 130 L320 120 L320 110 L320 100 L318 90 L318 80 L317 70 L315 60 L311 50 L305 40 L298 30 L287 20 L269 10 L229 0Z"}};
// The label is bent round the glass in thin upright strips, so it narrows toward the edges the way a real one does.
Object.assign(BOT, {"champagnew":{"w":471,"h":1749,"label":[20,1252,450,1650],"body":[0,467],"path":"M178 0 L159 10 L152 20 L148 30 L144 40 L144 50 L142 60 L142 70 L142 80 L143 90 L144 100 L142 110 L138 120 L136 130 L136 140 L133 150 L129 160 L125 170 L121 180 L122 190 L128 200 L129 210 L135 220 L141 230 L145 240 L149 250 L150 260 L150 270 L149 280 L149 290 L149 300 L150 310 L150 320 L150 330 L150 340 L149 350 L149 360 L146 370 L146 380 L144 390 L144 400 L144 410 L143 420 L142 430 L141 440 L138 450 L137 460 L136 470 L135 480 L134 490 L131 500 L130 510 L127 520 L121 530 L121 540 L121 550 L119 560 L117 570 L116 580 L113 590 L109 600 L109 610 L108 620 L107 630 L107 640 L109 650 L106 660 L104 670 L93 680 L92 690 L85 700 L83 710 L80 720 L77 730 L75 740 L73 750 L68 760 L65 770 L63 780 L58 790 L55 800 L52 810 L49 820 L46 830 L45 840 L47 850 L47 860 L39 870 L37 880 L35 890 L34 900 L32 910 L29 920 L27 930 L27 940 L23 950 L15 960 L15 970 L15 980 L15 990 L10 1000 L8 1010 L6 1020 L5 1030 L5 1040 L5 1050 L5 1060 L5 1070 L2 1080 L2 1090 L2 1100 L1 1110 L0 1120 L1 1130 L1 1140 L1 1150 L2 1160 L12 1170 L7 1180 L5 1190 L5 1200 L6 1210 L6 1220 L7 1230 L7 1240 L7 1250 L12 1260 L19 1270 L15 1280 L7 1290 L6 1300 L3 1310 L2 1320 L2 1330 L3 1340 L3 1350 L4 1360 L5 1370 L5 1380 L4 1390 L4 1400 L2 1410 L1 1420 L1 1430 L1 1440 L1 1450 L0 1460 L0 1470 L6 1480 L6 1490 L6 1500 L5 1510 L8 1520 L9 1530 L8 1540 L8 1550 L8 1560 L18 1570 L19 1580 L14 1590 L7 1600 L6 1610 L2 1620 L2 1630 L4 1640 L5 1650 L7 1660 L7 1670 L11 1680 L25 1690 L35 1700 L40 1710 L46 1720 L63 1730 L99 1740 L132 1748 L344 1748 L376 1740 L413 1730 L433 1720 L444 1710 L452 1700 L460 1690 L463 1680 L465 1670 L469 1660 L470 1650 L471 1640 L470 1630 L470 1620 L471 1610 L471 1600 L468 1590 L468 1580 L467 1570 L467 1560 L468 1550 L469 1540 L469 1530 L469 1520 L469 1510 L469 1500 L469 1490 L469 1480 L468 1470 L467 1460 L467 1450 L468 1440 L468 1430 L468 1420 L467 1410 L467 1400 L467 1390 L467 1380 L467 1370 L467 1360 L467 1350 L467 1340 L467 1330 L467 1320 L466 1310 L466 1300 L466 1290 L466 1280 L466 1270 L466 1260 L466 1250 L466 1240 L467 1230 L467 1220 L467 1210 L468 1200 L468 1190 L467 1180 L467 1170 L466 1160 L466 1150 L467 1140 L467 1130 L467 1120 L467 1110 L467 1100 L467 1090 L466 1080 L467 1070 L467 1060 L465 1050 L464 1040 L463 1030 L462 1020 L461 1010 L460 1000 L458 990 L456 980 L455 970 L453 960 L451 950 L449 940 L447 930 L445 920 L443 910 L440 900 L438 890 L435 880 L432 870 L429 860 L426 850 L423 840 L420 830 L417 820 L414 810 L410 800 L408 790 L404 780 L402 770 L399 760 L395 750 L392 740 L390 730 L386 720 L383 710 L381 700 L378 690 L375 680 L372 670 L369 660 L366 650 L363 640 L361 630 L358 620 L357 610 L354 600 L353 590 L352 580 L349 570 L346 560 L345 550 L343 540 L339 530 L335 520 L333 510 L332 500 L331 490 L329 480 L326 470 L325 460 L324 450 L324 440 L322 430 L321 420 L320 410 L319 400 L318 390 L317 380 L317 370 L316 360 L315 350 L315 340 L314 330 L314 320 L314 310 L314 300 L314 290 L313 280 L313 270 L313 260 L313 250 L313 240 L318 230 L323 220 L324 210 L324 200 L324 190 L324 180 L324 170 L320 160 L317 150 L314 140 L314 130 L313 120 L312 110 L313 100 L315 90 L317 80 L319 70 L319 60 L319 50 L316 40 L314 30 L310 20 L305 10 L286 0Z","wrapped":1},"proseccow":{"w":484,"h":1724,"label":[56,1206,412,1584],"body":[15,469],"path":"M193 0 L174 10 L166 20 L160 30 L159 40 L158 50 L156 60 L156 70 L155 80 L153 90 L153 100 L152 110 L152 120 L151 130 L150 140 L149 150 L149 160 L150 170 L149 180 L147 190 L146 200 L146 210 L147 220 L154 230 L160 240 L163 250 L164 260 L164 270 L165 280 L165 290 L167 300 L167 310 L167 320 L167 330 L167 340 L166 350 L166 360 L167 370 L166 380 L166 390 L166 400 L166 410 L164 420 L164 430 L164 440 L164 450 L164 460 L164 470 L164 480 L162 490 L162 500 L159 510 L159 520 L157 530 L156 540 L153 550 L150 560 L148 570 L145 580 L142 590 L140 600 L137 610 L134 620 L130 630 L126 640 L123 650 L119 660 L115 670 L111 680 L107 690 L104 700 L99 710 L95 720 L91 730 L87 740 L83 750 L79 760 L75 770 L71 780 L67 790 L63 800 L59 810 L55 820 L52 830 L48 840 L44 850 L41 860 L38 870 L34 880 L32 890 L29 900 L26 910 L24 920 L22 930 L19 940 L17 950 L15 960 L13 970 L11 980 L10 990 L9 1000 L7 1010 L6 1020 L5 1030 L3 1040 L3 1050 L2 1060 L2 1070 L2 1080 L0 1090 L0 1100 L0 1110 L1 1120 L0 1130 L0 1140 L0 1150 L1 1160 L2 1170 L2 1180 L2 1190 L3 1200 L4 1210 L4 1220 L5 1230 L6 1240 L6 1250 L7 1260 L7 1270 L8 1280 L9 1290 L9 1300 L10 1310 L10 1320 L11 1330 L12 1340 L12 1350 L13 1360 L14 1370 L14 1380 L15 1390 L15 1400 L16 1410 L17 1420 L17 1430 L17 1440 L18 1450 L18 1460 L19 1470 L20 1480 L21 1490 L21 1500 L21 1510 L22 1520 L23 1530 L24 1540 L25 1550 L25 1560 L25 1570 L25 1580 L21 1590 L15 1600 L12 1610 L10 1620 L10 1630 L10 1640 L12 1650 L16 1660 L22 1670 L29 1680 L41 1690 L59 1700 L87 1710 L127 1720 L133 1723 L357 1723 L363 1720 L402 1710 L426 1700 L443 1690 L455 1680 L461 1670 L467 1660 L471 1650 L472 1640 L472 1630 L472 1620 L470 1610 L466 1600 L461 1590 L458 1580 L457 1570 L459 1560 L459 1550 L460 1540 L460 1530 L461 1520 L462 1510 L462 1500 L462 1490 L464 1480 L464 1470 L464 1460 L465 1450 L466 1440 L466 1430 L467 1420 L468 1410 L468 1400 L469 1390 L470 1380 L471 1370 L471 1360 L472 1350 L472 1340 L473 1330 L473 1320 L474 1310 L475 1300 L476 1290 L476 1280 L477 1270 L478 1260 L478 1250 L479 1240 L479 1230 L480 1220 L481 1210 L481 1200 L482 1190 L482 1180 L483 1170 L483 1160 L483 1150 L484 1140 L484 1130 L484 1120 L484 1110 L484 1100 L483 1090 L483 1080 L483 1070 L482 1060 L481 1050 L480 1040 L479 1030 L478 1020 L477 1010 L476 1000 L475 990 L473 980 L471 970 L469 960 L467 950 L465 940 L463 930 L460 920 L458 910 L455 900 L453 890 L450 880 L447 870 L444 860 L440 850 L436 840 L433 830 L430 820 L426 810 L422 800 L417 790 L414 780 L410 770 L406 760 L402 750 L398 740 L394 730 L390 720 L386 710 L383 700 L379 690 L375 680 L371 670 L367 660 L363 650 L360 640 L357 630 L354 620 L351 610 L348 600 L345 590 L343 580 L341 570 L338 560 L336 550 L335 540 L332 530 L331 520 L329 510 L328 500 L328 490 L327 480 L326 470 L326 460 L325 450 L325 440 L325 430 L323 420 L323 410 L323 400 L323 390 L324 380 L325 370 L325 360 L325 350 L324 340 L323 330 L325 320 L325 310 L325 300 L325 290 L326 280 L326 270 L328 260 L329 250 L332 240 L338 230 L344 220 L345 210 L345 200 L344 190 L342 180 L342 170 L342 160 L342 150 L341 140 L341 130 L340 120 L340 110 L341 100 L341 90 L336 80 L334 70 L333 60 L331 50 L330 40 L328 30 L323 20 L315 10 L294 0Z","wrapped":1},"miniw":{"w":331,"h":1107,"label":[46,790,287,1037],"body":[9,320],"path":"M119 0 L100 10 L92 20 L88 30 L85 40 L83 50 L83 60 L84 70 L84 80 L83 90 L81 100 L81 110 L81 120 L81 130 L81 140 L81 150 L81 160 L81 170 L81 180 L82 190 L85 200 L88 210 L91 220 L93 230 L95 240 L95 250 L96 260 L97 270 L97 280 L97 290 L98 300 L98 310 L98 320 L98 330 L97 340 L97 350 L99 360 L98 370 L98 380 L97 390 L95 400 L93 410 L92 420 L90 430 L87 440 L85 450 L83 460 L81 470 L78 480 L75 490 L72 500 L69 510 L66 520 L63 530 L58 540 L55 550 L51 560 L46 570 L42 580 L38 590 L33 600 L29 610 L24 620 L20 630 L16 640 L12 650 L9 660 L7 670 L5 680 L3 690 L2 700 L0 710 L0 720 L0 730 L0 740 L0 750 L0 760 L0 770 L0 780 L1 790 L2 800 L2 810 L3 820 L3 830 L3 840 L5 850 L6 860 L6 870 L7 880 L7 890 L9 900 L9 910 L9 920 L10 930 L10 940 L11 950 L12 960 L12 970 L13 980 L14 990 L14 1000 L16 1010 L17 1020 L17 1030 L16 1040 L16 1050 L16 1060 L18 1070 L23 1080 L36 1090 L60 1100 L76 1106 L258 1106 L272 1100 L295 1090 L307 1080 L313 1070 L314 1060 L314 1050 L314 1040 L314 1030 L314 1020 L315 1010 L315 1000 L315 990 L316 980 L317 970 L317 960 L318 950 L319 940 L320 930 L320 920 L321 910 L321 900 L323 890 L323 880 L324 870 L324 860 L325 850 L326 840 L326 830 L327 820 L328 810 L328 800 L328 790 L329 780 L330 770 L330 760 L331 750 L331 740 L331 730 L331 720 L330 710 L330 700 L328 690 L327 680 L324 670 L322 660 L319 650 L316 640 L312 630 L308 620 L303 610 L298 600 L294 590 L289 580 L285 570 L281 560 L277 550 L273 540 L269 530 L266 520 L262 510 L260 500 L257 490 L255 480 L252 470 L250 460 L248 450 L246 440 L244 430 L244 420 L246 410 L245 400 L239 390 L238 380 L237 370 L236 360 L236 350 L236 340 L236 330 L236 320 L237 310 L238 300 L239 290 L239 280 L239 270 L241 260 L241 250 L241 240 L242 230 L244 220 L247 210 L252 200 L255 190 L255 180 L256 170 L256 160 L256 150 L256 140 L256 130 L256 120 L255 110 L255 100 L254 90 L253 80 L252 70 L252 60 L252 50 L251 40 L249 30 L245 20 L236 10 L216 0Z","wrapped":1}});   // the same bottles photographed in a wrap
let wrapShot = null;   // the store wrap now shown in the preview: {size, title}. Set by showWrap().
function photoScene(inner, lw, lh, wrap, col, uid, key, tall){
  if (wrap === "shot"){ if (wrapShot && wrapShot.size === key && BOT.shot){ key = "shot"; wrap = null; } else wrap = "stripe"; }
  if (wrap && BOT[key + "w"]){ key += "w"; wrap = null; }   // a real photo of a wrapped bottle beats a drawn pattern
  const b = BOT[key], H0 = tall || 496, k = H0 / b.h, ox = 200 - b.w * k / 2, oy = 514 - H0;
  const [x0, y0, x1, y1] = b.label, r = (b.body[1] - b.body[0]) / 2, cx = (b.body[0] + b.body[1]) / 2, cy = (y0 + y1) / 2, asp = lw / lh;
  const needW = Math.max(x1 - cx, cx - x0) * 2 + 6;
  let Lh = y1 - y0 + 12, a = Math.min(1.3, Lh * asp / (2 * r));
  if (2 * r * Math.sin(a) < needW){ a = Math.asin(Math.min(.965, needW / (2 * r))); Lh = 2 * r * a / asp; }
  const half = r * Math.sin(a), top = cy - Lh / 2, N = 22, px = u => cx + r * Math.sin((u - .5) * 2 * a);
  const use = `<use href="#bot-${key}"/>`, g = "bg" + uid;
  let s = `<defs><linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="${b.body[0]}" y1="0" x2="${b.body[1]}" y2="0">${b.wrapped ? `<stop offset="0" stop-color="#1b2440" stop-opacity=".26"/><stop offset=".14" stop-color="#1b2440" stop-opacity=".07"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".86" stop-color="#1b2440" stop-opacity=".07"/><stop offset="1" stop-color="#1b2440" stop-opacity=".26"/>` : `<stop offset="0" stop-color="#000" stop-opacity=".42"/><stop offset=".16" stop-color="#000" stop-opacity=".12"/><stop offset=".36" stop-color="#fff" stop-opacity=".1"/><stop offset=".52" stop-color="#fff" stop-opacity="0"/><stop offset=".82" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".4"/>`}</linearGradient>`
    + `<clipPath id="bp${uid}"><path d="${b.path}"/></clipPath>`;
  const wx = n1(cx - half - 16), wy = n1(top - 16), ww = n1(2 * half + 32), wh = n1(Lh + 32);
  if (wrap) s += wrapPattern(wrap, col, "wp" + uid).replace("<pattern ", '<pattern patternTransform="scale(2.2)" ') + `<clipPath id="bw${uid}"><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="16"/></clipPath>`;
  s += `</defs><ellipse cx="200" cy="514" rx="${n1(b.w * k * .56)}" ry="7" fill="#1B2440" opacity=".1"/><g transform="translate(${n1(ox)} ${n1(oy)}) scale(${k.toFixed(4)})">` + use;
  if (wrap) s += `<g clip-path="url(#bp${uid})"><rect x="0" y="${Math.round(b.h * .1)}" width="${b.w}" height="${b.h}" fill="url(#wp${uid})"/><rect x="0" y="${Math.round(b.h * .1)}" width="${b.w}" height="${b.h}" fill="url(#${g})" opacity=".8"/></g><g clip-path="url(#bw${uid})">${use}</g>`;
  if (inner){
    s += `<svg width="1" height="1" viewBox="0 0 ${lw} ${lh}" opacity="0"><g id="lab${uid}">${inner}</g></svg>`;
    for (let i = 0; i < N; i++){
      const u0 = i / N, u1 = (i + 1) / N, xa = px(u0), xb = px(u1) + (i < N - 1 ? 3 / k : 0);   // overlap hides the joins
      s += `<svg x="${xa.toFixed(2)}" y="${n1(top)}" width="${(xb - xa).toFixed(2)}" height="${n1(Lh)}" viewBox="${(u0 * lw).toFixed(3)} 0 ${((u1 - u0) * lw * (xb - xa) / (px(u1) - xa)).toFixed(3)} ${lh}" preserveAspectRatio="none"><use href="#lab${uid}" opacity=".999"/></svg>`;   // drawn as one layer, so the strip's soft edge cannot let a lower color show as a line
    }
    s += `<rect x="${n1(cx - half)}" y="${n1(top)}" width="${n1(2 * half)}" height="${n1(Lh)}" fill="url(#${g})"/>`;
  }
  if (wrap) s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="16" fill="none" stroke="#ffffff" stroke-opacity=".6" stroke-width="3"/>`;
  return s + `</g>`;
}
// inner: label artwork drawn in a lw x lh box. wrap: null, or a pattern kind. key: which bottle photo to use (none = the drawn bottle).
function sceneMarkup(inner, lw, lh, wrap, col, uid, key, tall){
  if (key && BOT[key]) return photoScene(inner, lw, lh, wrap, col, uid, key, tall);
  const Lw = 168, Lh = n1(Lw * lh / lw), x = 200 - Lw / 2, y = n1(372 - Lh / 2), glass = "#24402f";
  let s = `<defs><clipPath id="bc${uid}"><path d="${BOTTLE}"/></clipPath>${wrap ? wrapPattern(wrap, col, "wp" + uid) : ""}</defs>`
    + `<ellipse cx="200" cy="514" rx="108" ry="8" fill="#1B2440" opacity=".1"/><path d="${BOTTLE}" fill="${glass}"/><path d="M182 24 H218 V120 H182Z" fill="#c9b27a"/>`;
  if (wrap) s += `<g clip-path="url(#bc${uid})"><rect x="100" y="66" width="200" height="460" fill="url(#wp${uid})"/></g>`
    + `<rect x="${x - 7}" y="${n1(y - 7)}" width="${Lw + 14}" height="${n1(Lh + 14)}" rx="7" fill="${glass}"/>`;
  s += `<svg x="${x}" y="${y}" width="${Lw}" height="${Lh}" viewBox="0 0 ${lw} ${lh}">${inner}</svg><path d="${BOTTLE}" fill="url(#cyl)"/>`;
  if (wrap) s += `<rect x="${x - 7}" y="${n1(y - 7)}" width="${Lw + 14}" height="${n1(Lh + 14)}" rx="7" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.5"/>`;
  return s;
}
const wide = () => W / H >= 1.2;
const hollyR = () => Math.min(W, H) / 2 - 22 * S;

function heart(x, y, r, col, rot, outline){
  return `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${+(r / 10).toFixed(3)})" d="M0 -3.5 C-1 -10 -11 -10.5 -11 -4 C-11 1.5 -3.5 4.5 0 9 C3.5 4.5 11 1.5 11 -4 C11 -10.5 1 -10 0 -3.5Z" `
    + (outline ? `fill="none" stroke="${col}" stroke-width="1.6"/>` : `fill="${col}"/>`);
}
function star5(x, y, r, col, rot){
  let p = "";
  for (let i = 0; i < 10; i++){
    const rad = i % 2 ? r * .42 : r, a = (rot + i * 36 - 90) * Math.PI / 180;
    p += n1(x + rad * Math.cos(a)) + "," + n1(y + rad * Math.sin(a)) + " ";
  }
  return `<polygon points="${p.trim()}" fill="${col}"/>`;
}
/* ---------- color ---------- */
const hex2 = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
const toHex = a => "#" + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (h1, h2, t) => { const a = hex2(h1), b = hex2(h2); return toHex(a.map((v, i) => v + (b[i] - v) * t)); };
const lum = h => { const [r, g, b] = hex2(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
// Nudge a color away from its background until it is readable enough.
function ensure(col, bg, min){
  const target = lum(bg) > .4 ? "#000000" : "#ffffff"; let c = col;
  for (let i = 0; i < 24 && ratio(c, bg) < min; i++) c = mix(c, target, .12);
  return c;
}
const PALETTES = [
  ["Sage","#fbfaf5","#34453a","#7d9a7e","#d8a7a0","#c9b37a"],
  ["Blush","#fdf7f5","#5a3a40","#c98f93","#9fb49a","#e2c08d"],
  ["Dusty Blue","#f7fafc","#2c4057","#8fb0cf","#d9b566","#c7a9b5"],
  ["Beau Blue","#ffffff","#27496b","#9fc4e3","#C5DDF0","#e6b8a2"],
  ["Navy & Gold","#ffffff","#1f2f4a","#b8975a","#1f2f4a","#d9c59a"],
  ["Black & White","#ffffff","#1c1c1c","#1c1c1c","#8a8a8a","#c9c9c9"],
  ["Champagne","#fbf6ec","#5b4a2e","#c2a162","#e3cfa4","#8c7a55"],
  ["Burgundy","#fdf6f4","#5e1a26","#8f2d3b","#c9a36a","#d9a5a9"],
  ["Emerald","#f7faf6","#0f3d33","#1f7a5c","#d9b566","#8fc1a9"],
  ["Terracotta","#fdf6f0","#5a3324","#c8694a","#e0b08a","#8a9a6e"],
  ["Lavender","#faf8fd","#40365c","#9d8ac7","#d8b4c8","#b7c9a8"],
  ["Peach","#fff8f3","#5c3a2e","#f0a482","#f6cf9e","#b9cfa9"],
  ["Rose","#fdf5f3","#5a2f3a","#c47f8a","#dfb39a","#a8848c"],
  ["Coral","#fffaf8","#6e2f2a","#ee7b6b","#f6c9bf","#5bb3a8"],
  ["Mint","#f7fcfa","#2f5a4c","#7cc7ab","#cfe8dc","#f2b9a0"],
  ["Sunshine","#fffdf2","#4a3d16","#e9b82f","#f6dd8a","#ef8d5c"],
  ["Party Brights","#ffffff","#2b2f4a","#e4577a","#f2b53a","#58b6c9"],
  ["Pastel Party","#fffdfb","#4a4458","#c98bb8","#f4c9a8","#a9d3c8"],
  ["Baby Blue","#f6fbff","#2f4a66","#8ec3ea","#c9e3f6","#f2c9a8"],
  ["Baby Pink","#fff7fa","#6a3b4c","#f0a3bd","#f9d3df","#b9d7c4"],
  ["Christmas","#fbf8f1","#1f4a3a","#3f7a5f","#c8473d","#c9a24d"],
  ["Winter Frost","#f2f7fb","#23466b","#8fb4d4","#c5d9ea","#b9a7cf"],
  ["Hanukkah","#f8fbff","#1d3f7a","#3f73c4","#b9c3cf","#9cc0ee"],
  ["Red, White & Blue","#ffffff","#1f2f5a","#c8343f","#2f5aa8","#9fb5d9"],
  ["Halloween","#fff8ef","#2a1f2d","#e67e22","#6b3fa0","#2a1f2d"],
  ["Autumn","#fdf7ee","#4a2f1a","#c7742e","#8a9a4e","#a8432f"]
].map(p => ({name:p[0], bg:p[1], ink:p[2], a:p[3], b:p[4], c:p[5]}));
function customPalette(col){
  const bg = mix(col, "#ffffff", .94);
  return {name:"Your color", bg, ink:ensure(mix(col, "#000000", .62), bg, 8), a:col, b:mix(col, "#ffffff", .5), c:mix(col, "#000000", .25)};
}
function resolvePalette(p, dark){
  let c = {...p};
  if (dark){
    const bg = lum(p.ink) > .1 ? mix(p.ink, "#000000", .3) : p.ink;
    c = {name:p.name, bg, ink:mix(p.bg, "#ffffff", .3), a:ensure(p.a, bg, 2.4), b:ensure(p.b, bg, 2), c:ensure(p.c, bg, 2)};
  }
  c.dark = !!dark;
  c.t = ensure(c.a, c.bg, dark ? 3.6 : 3.2);   // accent that is safe to use for text
  c.t2 = ensure(c.b, c.bg, dark ? 3.6 : 3.2);  // second accent, also safe for text
  return c;
}

/* ---------- painted florals, glitter and doodles ---------- */
let LITE = false;   // small thumbnails skip the soft-edge filter so the page stays quick
const WC_DEFS = '<filter id="wc" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="0.5"/></filter>';
const soft = inner => LITE ? `<g>${inner}</g>` : `<g filter="url(#wc)">${inner}</g>`;
const panelFill = c => c.dark ? mix(c.bg, "#000000", .25) : "#ffffff";
function hueSat(h){
  const [r, g, b] = hex2(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return [0, 0];
  const l = (mx + mn) / 2, sat = d / (1 - Math.abs(2 * l - 1));
  const hue = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [hue * 60, sat];
}
function wrose(x, y, r, col, rot = 0){
  const dk = mix(col, "#5a2a20", .28), lt = mix(col, "#ffffff", .5);
  let s = `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${rot}) scale(${+(r / 20).toFixed(3)})"><circle r="20" fill="${lt}" opacity=".85"/>`;
  for (let i = 0; i < 5; i++) s += `<ellipse cx="9" cy="0" rx="12" ry="10" fill="${col}" opacity=".5" transform="rotate(${i * 72})"/>`;
  for (let i = 0; i < 4; i++) s += `<ellipse cx="5" cy="0" rx="8" ry="6.5" fill="${col}" opacity=".5" transform="rotate(${i * 90 + 30})"/>`;
  return s + `<circle r="6" fill="${dk}" opacity=".45"/>`
    + `<path d="M-11 2 A11 11 0 0 1 9 -7" fill="none" stroke="${dk}" stroke-width="1.3" opacity=".45" stroke-linecap="round"/>`
    + `<path d="M-6 5 A8 8 0 0 0 8 3" fill="none" stroke="${dk}" stroke-width="1.2" opacity=".45" stroke-linecap="round"/>`
    + `<path d="M-3 -1 A3.5 3.5 0 1 1 2 3" fill="none" stroke="${dk}" stroke-width="1.1" opacity=".55" stroke-linecap="round"/></g>`;
}
function wleaf(x, y, len, ang, col){
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${ang}) scale(${+(len / 30).toFixed(3)})"><path d="M0 0 Q14 -11 30 0 Q14 11 0 0Z" fill="${col}" opacity=".8"/><path d="M2 0 L27 0" stroke="${mix(col, "#1f3320", .4)}" stroke-width=".7" opacity=".5"/></g>`;
}
function wspray(x, y, len, ang, col){
  let s = `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${ang}) scale(${+(len / 60).toFixed(3)})"><path d="M0 0 Q30 -6 60 0" fill="none" stroke="${mix(col, "#1f3320", .3)}" stroke-width="1" opacity=".7"/>`;
  [[12,-2,-40],[14,-1,35],[28,-4,-40],[30,-3,38],[44,-3,-38],[46,-2,36],[58,0,0]].forEach(q => s += `<path transform="translate(${q[0]} ${q[1]}) rotate(${q[2]})" d="M0 0 Q7 -5 15 0 Q7 5 0 0Z" fill="${col}" opacity=".78"/>`);
  return s + `</g>`;
}
const G1 = "#86a077", G2 = "#5d7d5a";
function cluster(x, y, k, rot, c){
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${rot}) scale(${+k.toFixed(3)})">`
    + wleaf(-8,-6,34,200,G2) + wleaf(6,-10,30,-60,G1) + wleaf(10,8,34,25,G2) + wleaf(-10,10,28,140,G1) + wspray(14,-2,56,-25,G1) + wspray(-12,4,50,160,G2)
    + wrose(0,0,22,c.a,20) + wrose(24,14,13,c.b,-30) + wrose(-20,-16,10,mix(c.a, "#ffffff", .3),60)
    + `<circle cx="30" cy="-12" r="3" fill="${c.b}" opacity=".8"/><circle cx="36" cy="-6" r="2.4" fill="${c.b}" opacity=".7"/></g>`;
}
const ln = (col, sw = 1.4) => `fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
const at = (x, y, k, rot = 0) => `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${rot}) scale(${+k.toFixed(3)})">`;
function dHolly(x, y, k, rot, g, b){
  return at(x, y, k, rot) + `<path d="M0 0 Q4 -9 10 -6 Q12 -12 20 -9 Q20 -3 26 -2 Q20 2 21 8 Q13 6 10 11 Q6 5 0 0Z" ${ln(g)}/><path d="M0 0 Q-4 -9 -10 -6 Q-12 -12 -20 -9 Q-20 -3 -26 -2 Q-20 2 -21 8 Q-13 6 -10 11 Q-6 5 0 0Z" ${ln(g)}/>`
    + `<circle cx="-3" cy="3" r="2.6" fill="${b}"/><circle cx="3" cy="3" r="2.6" fill="${b}"/><circle cx="0" cy="-2" r="2.6" fill="${b}"/></g>`;
}
function dOrn(x, y, k, a, b){
  return at(x, y, k) + `<line x1="0" y1="-40" x2="0" y2="-14" ${ln(a, 1)}/><rect x="-3" y="-14" width="6" height="4" ${ln(a)}/><circle r="11" ${ln(a)}/><path d="M-10 -4 Q0 2 10 -4" ${ln(b)}/><path d="M-10 4 Q0 10 10 4" ${ln(b)}/></g>`;
}
function dTree(x, y, k, g, b){
  return at(x, y, k) + `<path d="M0 -40 L-10 -24 H-5 L-16 -8 H-9 L-22 10 H22 L9 -8 H16 L5 -24 H10 Z" ${ln(g)}/><rect x="-3" y="10" width="6" height="7" ${ln(g)}/>`
    + star5(0, -44, 5, b, 0) + `<circle cx="-6" cy="-12" r="1.8" fill="${b}"/><circle cx="5" cy="-2" r="1.8" fill="${b}"/><circle cx="-10" cy="4" r="1.8" fill="${b}"/><circle cx="11" cy="6" r="1.8" fill="${b}"/><circle cx="2" cy="-22" r="1.8" fill="${b}"/></g>`;
}
function dGlass(x, y, k, col, wine){
  return at(x, y, k) + `<path d="M-8.6 -16 Q-8 -6 0 -4 Q8 -6 8.6 -16Z" fill="${wine}" opacity=".4"/><path d="M-8 -26 Q-11 -6 0 -4 Q11 -6 8 -26 Z" ${ln(col)}/><path d="M0 -4 V12 M-7 12 H7" ${ln(col)}/></g>`;
}
function dFlute(x, y, k, col, wine){
  return at(x, y, k) + `<path d="M-5.2 -26 L-4 -8 Q0 -4 4 -8 L5.2 -26Z" fill="${wine}" opacity=".45"/><path d="M-6 -36 L-4 -8 Q0 -4 4 -8 L6 -36Z" ${ln(col)}/><path d="M0 -5 V12 M-6 12 H6" ${ln(col)}/>`
    + `<circle cx="-1.5" cy="-16" r=".9" fill="${col}"/><circle cx="1.5" cy="-22" r=".9" fill="${col}"/><circle cx="0" cy="-11" r=".9" fill="${col}"/></g>`;
}
function dGift(x, y, k, a, b, fill){
  return at(x, y, k) + `<rect x="-11" y="-10" width="22" height="18" fill="${fill}" stroke="${a}" stroke-width="1.4" stroke-linejoin="round"/><rect x="-13" y="-15" width="26" height="5" fill="${fill}" stroke="${a}" stroke-width="1.4" stroke-linejoin="round"/>`
    + `<path d="M0 -15 V8" ${ln(b)}/><path d="M0 -15 Q-9 -26 -11 -17 Q-8 -13 0 -15 Q9 -26 11 -17 Q8 -13 0 -15" ${ln(b)}/></g>`;
}
function dBow(x, y, k, col){
  return at(x, y, k) + `<path d="M0 0 Q-16 -14 -19 0 Q-16 11 0 0 Q16 -14 19 0 Q16 11 0 0" ${ln(col)}/><path d="M0 0 Q-7 10 -15 17 M0 0 Q7 10 15 17" ${ln(col)}/><circle r="2.4" fill="${col}"/></g>`;
}
function dCane(x, y, k, col, bg){
  const d = "M0 16 V-8 Q0 -17 7 -17 Q13 -17 13 -9";
  return at(x, y, k) + `<path d="${d}" fill="none" stroke="${col}" stroke-width="4.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${bg}" stroke-width="2.6" stroke-dasharray="3 4.5"/></g>`;
}
function dDisco(x, y, r, col, fill, topY){
  x = n1(x); y = n1(y); r = n1(r);
  let s = `<line x1="${x}" y1="${n1(topY)}" x2="${x}" y2="${n1(y - r)}" ${ln(col, 1)}/><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${col}" stroke-width="1.3"/>`;
  [.35, .75].forEach(q => { s += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${n1(r * q)}" ${ln(col, .8)}/><ellipse cx="${x}" cy="${y}" rx="${n1(r * q)}" ry="${r}" ${ln(col, .8)}/>`; });
  return s + `<line x1="${n1(x - r)}" y1="${y}" x2="${n1(x + r)}" y2="${y}" ${ln(col, .8)}/><line x1="${x}" y1="${n1(y - r)}" x2="${x}" y2="${n1(y + r)}" ${ln(col, .8)}/>`;
}
function dCake(x, y, k, col, fill, flame){
  return at(x, y, k) + `<rect x="-20" y="-16" width="40" height="16" rx="2" fill="${fill}" stroke="${col}" stroke-width="1.3"/><rect x="-14" y="-30" width="28" height="14" rx="2" fill="${fill}" stroke="${col}" stroke-width="1.3"/>`
    + `<path d="M-14 -24 q3.5 4 7 0 q3.5 4 7 0 q3.5 4 7 0 q3.5 4 7 0" ${ln(col, 1)}/><path d="M-20 -9 q5 4 10 0 q5 4 10 0 q5 4 10 0 q5 4 10 0" ${ln(col, 1)}/>`
    + `<path d="M0 -30 V-39" ${ln(col)}/><path d="M0 -46 Q-3 -42 0 -40 Q3 -42 0 -46Z" fill="${flame}"/><path d="M-26 0 H26 M0 0 V8 M-9 8 H9" ${ln(col)}/></g>`;
}
function dCupcake(x, y, k, col, fill, flame){
  return at(x, y, k) + `<path d="M-9 -8 L-6 6 H6 L9 -8Z" fill="#ffffff" stroke="${col}" stroke-width="1.2" stroke-linejoin="round"/><path d="M-4 -8 L-3 6 M0 -8 V6 M4 -8 L3 6" ${ln(col, .8)}/>`
    + `<path d="M-11 -8 Q-12 -15 -5 -15 Q-4 -21 0 -21 Q4 -21 5 -15 Q12 -15 11 -8Z" fill="${fill}" stroke="${col}" stroke-width="1.2" stroke-linejoin="round"/><path d="M0 -21 V-27" ${ln(col)}/><path d="M0 -33 Q-2.4 -30 0 -28 Q2.4 -30 0 -33Z" fill="${flame}"/></g>`;
}
function dBalloons(x, y, k, col, f1, f2){
  return at(x, y, k) + `<path d="M-9 -8 Q-12 8 -6 22 M9 -8 Q12 8 6 22 M0 -14 Q-2 6 0 24" ${ln(col, .9)}/>`
    + `<ellipse cx="-10" cy="-20" rx="9" ry="11" fill="${f1}" stroke="${col}" stroke-width="1.2"/><ellipse cx="10" cy="-20" rx="9" ry="11" fill="${f2}" stroke="${col}" stroke-width="1.2"/><ellipse cx="0" cy="-27" rx="9" ry="11" fill="${f1}" stroke="${col}" stroke-width="1.2"/></g>`;
}
function dHeart(x, y, k, col, filled){
  return at(x, y, k) + `<path d="M0 -3.5 C-1 -10 -11 -10.5 -11 -4 C-11 1.5 -3.5 4.5 0 9 C3.5 4.5 11 1.5 11 -4 C11 -10.5 1 -10 0 -3.5Z" ${filled ? `fill="${col}"` : ln(col)}/></g>`;
}
// Small line icon for the Keepsake design, chosen from the occasion.
function occasionIcon(x, y, k, col){
  const sub = groupNow().subs[state.sub][0], g = state.group;
  const kind = sub === "Graduation" ? "cap" : sub === "New home" || sub === "Closing gift" ? "home" : sub === "Anniversary" ? "heart"
    : g === "weddings" ? "ring" : g === "birthdays" ? "cake" : g === "baby" || g === "thanks" || g === "remembrance" ? "heart"
    : g === "gatherings" ? "glasses" : "star";
  const o = at(x, y, k);
  if (kind === "ring") return o + `<circle cy="5" r="8" ${ln(col)}/><path d="M-5 -6 L-3 -10 H3 L5 -6 L0 -2Z" ${ln(col)}/><path d="M-10 -9 L-12 -11 M10 -9 L12 -11 M0 -13 V-15" ${ln(col, 1)}/></g>`;
  if (kind === "cap") return o + `<path d="M-15 -4 L0 -11 L15 -4 L0 3Z" ${ln(col)}/><path d="M-8 0 V7 Q0 12 8 7 V0" ${ln(col)}/><path d="M15 -4 V6" ${ln(col)}/><circle cx="15" cy="8" r="1.6" fill="${col}"/></g>`;
  if (kind === "home") return o + `<path d="M-13 0 L0 -12 L13 0" ${ln(col)}/><path d="M-9 -3 V11 H9 V-3" ${ln(col)}/><rect x="-2.5" y="3" width="5" height="8" ${ln(col)}/></g>`;
  if (kind === "cake") return o + `<rect x="-11" y="0" width="22" height="10" rx="1.5" ${ln(col)}/><rect x="-7" y="-8" width="14" height="8" rx="1.5" ${ln(col)}/><path d="M0 -8 V-13" ${ln(col)}/><circle cy="-15" r="1.5" fill="${col}"/></g>`;
  if (kind === "glasses") return o + `<g transform="rotate(-14 -6 0)"><path d="M-10 -12 L-9 -1 Q-6 2 -3 -1 L-2 -12Z M-6 1 V10 M-10 10 H-2" ${ln(col)}/></g><g transform="rotate(14 6 0)"><path d="M2 -12 L3 -1 Q6 2 9 -1 L10 -12Z M6 1 V10 M2 10 H10" ${ln(col)}/></g><path d="M0 -17 V-14 M-4 -16 L-3 -13.5 M4 -16 L3 -13.5" ${ln(col, 1)}/></g>`;
  if (kind === "heart") return o + `<g transform="scale(1.15)"><path d="M0 -3.5 C-1 -10 -11 -10.5 -11 -4 C-11 1.5 -3.5 4.5 0 9 C3.5 4.5 11 1.5 11 -4 C11 -10.5 1 -10 0 -3.5Z" ${ln(col)}/></g></g>`;
  return o + `<polygon points="0,-12 3.2,-4 11.4,-3.7 5,1.5 7,9.7 0,5 -7,9.7 -5,1.5 -11.4,-3.7 -3.2,-4" ${ln(col)}/></g>`;
}
