#!/usr/bin/env python3
"""Rebuilds the designer page the print service needs (label-print-service/public/designer.html).

Run from the designer-kit folder after any change to the designer:
    python3 tools/build-single-file.py ../label-print-service/public/designer.html

CSS, the script files and the fonts are folded into the page. The artwork is NOT inlined:
every referenced assets/ image is copied to an art/ folder next to the page, and each
<image href="assets/x.webp"> becomes <image data-href="art/x.webp">, activated just-in-time
by the same lazy loader the storefront theme uses. The page stays small however many designs
exist; an order's render only ever loads the few images its design draws. The print service
sets the hrefs itself and waits for the images to decode before printing (src/render.js).
"""
import base64, re, shutil, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / "designer-single.html"
html = (root / "designer.html").read_text()
MIME = {".woff2": "font/woff2"}
def data_uri(rel):
    p = root / rel
    return "data:" + MIME[p.suffix] + ";base64," + base64.b64encode(p.read_bytes()).decode()

# fonts stay inline (small, and the print must never depend on the network)
html = html.replace('<link rel="stylesheet" href="designer-fonts.css">', '<style id="uploaded-fonts">' + (root / "designer-fonts.css").read_text() + '</style>')
html = html.replace('<link rel="stylesheet" href="designer.css">', '<style>' + (root / "designer.css").read_text() + '</style>')
html = re.sub(r'fonts/[\w.-]+\.woff2', lambda m: data_uri(m.group(0)), html)

scripts = re.findall(r'<script src="(js/[\w.-]+)"></script>', html)
joined = "\n".join((root / s).read_text() for s in scripts)
first = True
for s in scripts:
    tag = f'<script src="{s}"></script>'
    html = html.replace(tag, "<script>" + joined + "</script>" if first else "", 1); first = False

# artwork: copy out, reference lazily
art_dir = out.parent / "art"
art_dir.mkdir(parents=True, exist_ok=True)
copied = set()
def split_out(m):
    rel = m.group(1)
    name = pathlib.Path(rel).name
    if name not in copied:
        shutil.copyfile(root / rel, art_dir / name)
        copied.add(name)
    return f'data-href="art/{name}"'
html, n_refs = re.subn(r'href="(assets/[\w.-]+\.(?:webp|jpg|png))"', split_out, html)

# the same just-in-time activation the storefront theme uses: when rendered content references
# an #art-/#xm-/#bot- image, that def's href is set from data-href, so only used artwork loads.
ACTIVATE = """
<script>
(function(){
  function activate(){
    var box = ["stage","templates","sheets","output","how1","how2","how3"].map(function(id){var e=document.getElementById(id);return e?e.innerHTML:"";}).join("");
    var ids = box.match(/#(?:art|xm|bot)-[\\w-]+/g); if(!ids) return;
    var seen={};
    for(var i=0;i<ids.length;i++){ var id=ids[i].slice(1); if(seen[id])continue; seen[id]=1;
      var el=document.getElementById(id);
      if(el && el.dataset && el.dataset.href && !el.getAttribute("href")) el.setAttribute("href", el.dataset.href);
    }
  }
  activate();
  var t=null;
  function schedule(){ if(t)return; t=setTimeout(function(){t=null;activate();},16); }
  var obs=new MutationObserver(schedule);
  ["stage","templates","output"].forEach(function(id){var e=document.getElementById(id); if(e) obs.observe(e,{childList:true,subtree:true,attributes:true});});
})();
</script>
"""
html = html.replace("</body>", ACTIVATE + "</body>")
out.write_text(html)
stale = [p.name for p in art_dir.iterdir() if p.name not in copied]
for name in stale: (art_dir / name).unlink()
print(f"wrote {out} ({len(html) // 1024} KB, {len(scripts)} script files, fonts inlined) + art/ ({len(copied)} files, {n_refs} refs made lazy{', ' + str(len(stale)) + ' stale removed' if stale else ''})")
