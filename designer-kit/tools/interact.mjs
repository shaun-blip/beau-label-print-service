import puppeteer from "/private/tmp/claude-501/-Users-shaunwork/adb771d5-ae2a-4865-ae50-fabe7b926e2e/scratchpad/vdeps/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js";
import { pathToFileURL } from "node:url";
const DESIGNER = pathToFileURL("/Users/shaunwork/Downloads/designer-kit/designer.html").href;
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--no-sandbox","--allow-file-access-from-files"] });
const page = await browser.newPage();
const errs=[]; page.on("pageerror",e=>errs.push(String(e)));
await page.goto(DESIGNER,{waitUntil:"load"}); await new Promise(r=>setTimeout(r,900));

await page.evaluate(() => {
  window.INVARIANTS = function(){
    const v=[], t=tplById(state.tpl), q=(id)=>document.getElementById(id);
    const chipOn=(id)=>{const b=q(id).querySelector('[aria-pressed="true"]'); return b&&(b.dataset.id??b.dataset.i);};
    if (q("agewrap").hidden !== !(state.rocc==="milestone" || !!t.number)) v.push("agewrap visibility wrong");
    if (q("sec-ready").hidden !== (state.path!=="ready")) v.push("sec-ready wrong");
    if (q("sec-words").hidden !== (state.path==="ready")) v.push("sec-words wrong");
    if (chipOn("sizes")!==state.size) v.push("sizes chip wrong: "+chipOn("sizes"));
    if (chipOn("groups")!==state.group) v.push("groups chip wrong");
    if (String(chipOn("subs"))!==String(state.sub)) v.push("subs chip wrong");
    if (state.path==="custom" && chipOn("modes")!==state.mode) v.push("modes chip wrong");
    if (state.path==="ready" && chipOn("rmodes")!==(state.rmode==="mixed"?"mixed":"one")) v.push("rmodes chip wrong");
    const tb=q("templates").querySelector('.tpl[aria-pressed="true"]');
    if (!tb || tb.dataset.id!==state.tpl) v.push("template tile wrong");
    if (!available(t)) v.push("state.tpl not available!");
    if (q("namebox").hidden !== (state.mode!=="names")) v.push("namebox wrong");
    if (q("mixbox").hidden !== (state.mode!=="mix")) v.push("mixbox wrong");
    if (q("saylock").hidden !== !!t.zones.main) v.push("saylock wrong");
    if (state.pal>=0){ const sw=q("swatches").querySelector('[aria-pressed="true"]'); if(!sw||+sw.dataset.i!==state.pal) v.push("swatch wrong"); }
    const fb=q("fonts").querySelector('[aria-pressed="true"]'); if(!fb||fb.dataset.id!==state.font) v.push("font wrong");
    if ((q("alert").textContent||"") !== screen()) v.push("alert≠screen()");
    const vw=q("views").querySelector('[aria-pressed="true"]'); if(!vw||vw.dataset.id!==state.view) v.push("views wrong");
    FIELDS.forEach(f=>{ const el=q("f-"+f.id), fromList=namesMode()&&f.id===state.nameField,
      unused=(SMALL&&f.id==="msg")||(!t.zones[f.id]&&!(t.uses||[]).includes(f.id));
      if (el.disabled!==(fromList||unused)) v.push("field "+f.id+" disabled wrong"); });
    if (state.rocc==="milestone" && !q("rgrid").textContent.includes(String(state.age))) v.push("milestone sayings missing age");
    return v;
  };
  window.STEP = (name, fn) => { fn(); return {name, bad: window.INVARIANTS()}; };
});

const click = (sel) => page.evaluate(s => { const el=document.querySelector(s); if(!el) return "NO EL "+s; el.click(); }, sel);
const results = [];
async function step(name, fn){ const r = await fn(); await new Promise(r=>setTimeout(r,120)); const bad = await page.evaluate(()=>window.INVARIANTS()); results.push([name, bad, r||""]); }

await step("initial load", async()=>{});
await step("group: birthdays", async()=> click('#groups .chip[data-id="birthdays"]'));
await step("sub: 50th (milestone)", async()=> page.evaluate(()=>{ const b=[...document.querySelectorAll("#subs .chip")].find(x=>x.textContent==="50th"); if(!b) return "no 50th"; b.click(); }));
await step("agewrap visible + age 50", async()=> page.evaluate(()=>{ if(document.getElementById("agewrap").hidden) return "AGEWRAP HIDDEN"; if(state.age!==50) return "age="+state.age; }));
await step("type age 65", async()=> page.evaluate(()=>{ const a=document.getElementById("age"); a.value="65"; a.dispatchEvent(new Event("input",{bubbles:true})); }));
await step("pick Watercolor Number", async()=> page.evaluate(()=>{ const b=document.querySelector('#templates .tpl[data-id="wd-number"]'); if(!b) return "wd-number tile absent"; b.click(); }));
await step("number: agewrap + 65 drawn", async()=> page.evaluate(()=>{ if(document.getElementById("agewrap").hidden) return "AGEWRAP HIDDEN on number design"; const p=document.getElementById("preview").innerHTML; if(!(p.includes("wd_g6")&&p.includes("wd_g5"))) return "digits 6,5 not drawn"; }));
await step("pick non-number design", async()=> page.evaluate(()=>{ const b=[...document.querySelectorAll("#templates .tpl")].find(x=>x.dataset.id!=="wd-number"); b.click(); }));
await step("sub: Birthday (non-milestone)", async()=> page.evaluate(()=>{ const b=[...document.querySelectorAll("#subs .chip")].find(x=>x.textContent==="Birthday"); if(!b) return "no Birthday sub"; b.click(); }));
await step("agewrap now hidden", async()=> page.evaluate(()=>{ const t=tplById(state.tpl); if(!t.number && !document.getElementById("agewrap").hidden) return "AGEWRAP STUCK OPEN"; }));
await step("pick a saying", async()=> page.evaluate(()=>{ const b=document.querySelectorAll("#rgrid button.say")[2]; if(!b) return "no sayings"; b.click(); }));
await step("rmode: mixed", async()=> click('#rmodes .chip[data-id="mixed"]'));
await step("stepper minus", async()=> page.evaluate(()=>{ const m=document.querySelector('#rgrid .cnt[data-d="-1"]:not([disabled])'); if(!m) return "no stepper"; const before=readyTotal(); m.click(); if(readyTotal()!==before-1) return "count did not drop"; }));
await step("path: write your own", async()=> click('#paths .chip[data-id="custom"]'));
await step("mode: names", async()=> click('#modes .chip[data-id="names"]'));
await step("mode: mix + qty 3", async()=> page.evaluate(()=>{ document.querySelector('#modes .chip[data-id="mix"]').click(); const q=document.getElementById("qty"); q.value="3"; q.dispatchEvent(new Event("change",{bubbles:true})); }));
await step("scope: every sheet same", async()=> page.evaluate(()=>{ const b=document.querySelector('#mixscope .chip[data-id="repeat"]'); if(!b) return "no scope chip"; b.click(); if(needScope()) return "needScope still true"; }));
await step("type words in main", async()=> page.evaluate(()=>{ const f=document.getElementById("f-main"); f.value="Hello Test"; f.dispatchEvent(new Event("input",{bubbles:true})); if(!document.getElementById("preview").innerHTML.includes("Hello Test")) return "typed word not in preview"; }));
await step("size: prosecco", async()=> page.evaluate(()=>{ document.querySelector('#sizes .chip[data-id="prosecco"]').click(); if(W!==283) return "setSize not applied, W="+W; }));
await step("font: switch", async()=> page.evaluate(()=>{ const b=[...document.querySelectorAll("#fonts .fontopt")].find(x=>x.dataset.id!==state.font); b.click(); }));
await step("palette: swatch 3", async()=> click('#swatches .sw[data-i="3"]'));
await step("view: bottle", async()=> click('#views .chip[data-id="bottle"]'));
await step("back: ready path + milestone again", async()=> page.evaluate(()=>{ document.querySelector('#groups .chip[data-id="birthdays"]').click(); const b=[...document.querySelectorAll("#subs .chip")].find(x=>x.textContent==="30th"); b.click(); if(state.age!==30) return "age didn't follow 30th"; if(document.getElementById("agewrap").hidden) return "agewrap hidden on 30th"; }));

let fails=0;
for (const [name,bad,note] of results){ const ok=!bad.length&&!note; if(!ok) fails++; console.log((ok?"  ok ":"FAIL")+" | "+name+(bad.length?" | "+bad.join("; "):"")+(note?" | "+note:"")); }
console.log("\nPAGE ERRORS:", errs.length?errs.slice(0,4):"none");
console.log(fails===0&&errs.length===0 ? "ALL STEPS PASS" : "FAILURES: "+fails);
await browser.close();
