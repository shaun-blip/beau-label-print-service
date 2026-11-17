import puppeteer from "/private/tmp/claude-501/-Users-shaunwork/adb771d5-ae2a-4865-ae50-fabe7b926e2e/scratchpad/vdeps/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js";
import { pathToFileURL } from "node:url";
const DESIGNER = pathToFileURL("/Users/shaunwork/Downloads/designer-kit/designer.html").href;
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--no-sandbox","--allow-file-access-from-files"] });
const page = await browser.newPage();
const errs=[]; page.on("pageerror",e=>errs.push(String(e)));
await page.goto(DESIGNER,{waitUntil:"load"}); await new Promise(r=>setTimeout(r,800));
const res = await page.evaluate(() => {
  const words={top:"Sip, sip", main:"Cheers to You", detail:"The Smiths", msg:"You earned it"};
  const all = (typeof TEMPLATES!=="undefined"?TEMPLATES:[]).map(t=>t.id);
  let fail=[], subFixed=0, subZero=0;
  for(const id of all){
    try{
      const t=tplById(id), c=colors();
      const svg=labelMarkup(t,c,words);
      const n=(svg.match(/<text/g)||[]).length;
      if(n===0) fail.push(id+":NOLINES");
      // xmSub designs now must include a main zone
      if(t.zones && t.zones.main===undefined && (id.startsWith("xm-ny")||id.startsWith("bd-w")||id.startsWith("tg-")||id==="hk-title")) subZero++;
    }catch(e){ fail.push(id+":ERR "+e.message); }
  }
  // count how many templates have a main zone that uses our subdesign shape (sanity)
  return {total:all.length, fail, subZero};
});
console.log("templates:", res.total);
console.log("render failures:", res.fail.length, res.fail.slice(0,20));
console.log("suspect title designs missing main:", res.subZero);
console.log("PAGE ERRORS:", errs.length, errs.slice(0,3));
await browser.close();
