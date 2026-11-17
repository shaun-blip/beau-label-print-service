#!/usr/bin/env python3
"""Builds a local, offline test harness for the Build-a-Bundle section.
Real markup: the captured production page (fixtures/page.html).
Real logic: the inline script extracted fresh from the theme's liquid file, so edits flow.
Synthetic catalog: deterministic products priced like production ($7.95 singles, mini 6-packs)."""
import json, re, struct, zlib, pathlib, sys

HERE = pathlib.Path(__file__).parent
LIQUID = pathlib.Path("/Users/shaunwork/Downloads/beau-theme-duplicate/sections/bb-bundle-builder.liquid")

# ---------- tiny solid-color PNGs for product images ----------
def png(rgb):
    def chunk(t, d):
        c = t + d
        return struct.pack(">I", len(d)) + c + struct.pack(">I", zlib.crc32(c))
    ihdr = struct.pack(">IIBBBBB", 8, 8, 8, 2, 0, 0, 0)
    row = b"\x00" + bytes(rgb) * 8
    idat = zlib.compress(row * 8)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")

(HERE / "img").mkdir(exist_ok=True)
COLORS = [(214,160,170),(170,190,214),(190,214,170),(214,200,150),(180,160,200),(150,190,190)]
for i, c in enumerate(COLORS):
    (HERE / "img" / f"w{i}.png").write_bytes(png(c))

# ---------- synthetic catalog ----------
TAGSETS = [
    ["motif-floral","occasion-wedding","style-grandmillennial"],
    ["occasion-birthday","motif-balloons"],
    ["occasion-christmas","motif-ornaments"],
    ["occasion-gameday","for-football"],
    ["motif-bows","style-coastal"],
    ["for-golf","for-menswear-dad"],
    ["occasion-valentines","motif-hearts"],
    ["motif-gingham","style-grandmillennial"],
]
def product(handle, title, price, tags, vid, ptype="Bottle Wrap", img_i=0):
    return {"id": vid*10, "handle": handle, "title": title, "product_type": ptype,
            "tags": tags, "variants": [{"id": vid, "price": f"{price/100:.2f}", "available": True}],
            "images": [{"src": f"img/w{img_i}.png"}]}

# distinct two-word names per design: the builder's smart-fill caps 2 per title "family"
# (title minus colorways), so same-family names would starve it — real catalogs are diverse
NAMES = ("Alder Bay Birch Cove Cedar Dune Elm Fern Grove Hazel Iris Juniper Kelp Larch Maple "
         "Nook Oak Pine Quill Reed Sage Thorn Umber Vale Willow Yarrow Aster Bloom Clover Daisy "
         "Ember Flora Gale Heath Ivy Jade Knoll Lark Moss Nova").split()
pros, champ = [], []
pairs = []
for i in range(40):
    tags = list(TAGSETS[i % len(TAGSETS)])
    if i < 8: tags.append("best seller")
    h = f"pros-wrap-{i:02d}"
    pros.append(product(h, f"{NAMES[i]} Trellis Prosecco Bottle Wrap", 795, tags, 1000+i, img_i=i % 6))
    if i < 8:  # first 8 have champagne siblings
        ch = f"champ-wrap-{i:02d}"
        champ.append(product(ch, f"{NAMES[i]} Trellis Champagne Bottle Wrap", 795, tags, 2000+i, img_i=i % 6))
        pairs.append([h, ch])
for i in range(8, 12):  # champagne-only designs
    champ.append(product(f"champ-only-{i:02d}", f"Champagne Solo {i:02d} Bottle Wrap", 795,
                         list(TAGSETS[i % len(TAGSETS)]), 2100+i, img_i=i % 6))
wine = [product(f"daou-wine-{i}", f"Wine Design {i} Bottle Wrap", 795,
                list(TAGSETS[i % len(TAGSETS)]), 3000+i, img_i=i % 6) for i in range(6)]
minis = [product(f"mini-set-{i}", f"Mini Prosecco Collection Six-Pack {i} (6-Pack)", 2895,
                 list(TAGSETS[i % len(TAGSETS)]), 4000+i, img_i=i % 6) for i in range(5)]

fx = HERE / "fixtures"
(fx / "la-marca-wraps.json").write_text(json.dumps({"products": pros}))
(fx / "champagne-collection.json").write_text(json.dumps({"products": champ}))
(fx / "wine-collection.json").write_text(json.dumps({"products": wine}))
(fx / "mini-la-marca.json").write_text(json.dumps({"products": minis}))
(fx / "pairs.json").write_text(json.dumps(pairs))

# ---------- extract production section markup ----------
page = (fx / "page.html").read_text(errors="ignore")
start = page.index('<section class="bb-bb')
end = page.index("</section>", start) + len("</section>")
section = page[start:end]

# swap the pairs JSON for the synthetic one
section = re.sub(r'(<script type="application/json" data-bb-pairs>).*?(</script>)',
                 lambda m: m.group(1) + json.dumps(pairs) + m.group(2), section, flags=re.S)

# the component's main styles live AFTER </section> in the file: collect every bb-bb style
# block on the page that the section itself doesn't already contain
all_styles = re.findall(r"<style>(.*?)</style>", page, flags=re.S)
in_section = set(re.sub(r"\s+", "", s) for s in re.findall(r"<style>(.*?)</style>", section, flags=re.S))
page_css = "\n".join(s for s in all_styles
                      if "bb-bb" in s and re.sub(r"\s+", "", s) not in in_section)

# ---------- extract the live script from the (possibly edited) liquid ----------
liq = LIQUID.read_text()
m2 = re.search(r"<script>\s*(\(function\(\)\{\s*var root=document\.querySelector\('\.bb-bb'\);.*?)</script>", liq, flags=re.S)
if not m2: sys.exit("FATAL: builder script not found in liquid")
(HERE / "bb-script.js").write_text(m2.group(1))

# also carry over any NEW <style> blocks in the liquid that the captured page lacks
liq_styles = re.findall(r"<style>(.*?)</style>", liq, flags=re.S)
page_style_sig = set(re.sub(r"\s+", "", s) for s in re.findall(r"<style>(.*?)</style>", section + page, flags=re.S))
extra_css = "\n".join(s for s in liq_styles if re.sub(r"\s+", "", s) not in page_style_sig and "bb-bb" in s)

stub = """
<script>
// offline fetch stub: serves the synthetic catalog; mutable cart for add/change/update
window.__cart = {items: []};
(function(){
  var fixtures = {"la-marca-wraps":"fixtures/la-marca-wraps.json","champagne-collection":"fixtures/champagne-collection.json",
                  "wine-collection":"fixtures/wine-collection.json","mini-la-marca":"fixtures/mini-la-marca.json"};
  var products = null;
  function allProducts(){
    if (products) return Promise.resolve(products);
    return Promise.all(Object.values(fixtures).map(function(u){return fetch0(u).then(function(r){return r.json();});}))
      .then(function(js){products = [].concat.apply([], js.map(function(j){return j.products;})); return products;});
  }
  var fetch0 = window.fetch.bind(window);
  window.fetch = function(url, opts){
    var u = String((url && url.url) || url || "");
    var m = u.match(/\\/collections\\/([a-z0-9-]+)\\/products\\.json/);
    if (m) return fetch0(fixtures[m[1]] || "fixtures/empty.json").then(function(r){
      return u.indexOf("page=1") > -1 || u.indexOf("page=") < 0 ? r : new Response('{"products":[]}');});
    m = u.match(/\\/products\\/([a-z0-9-]+)\\.json/);
    if (m) return allProducts().then(function(ps){
      var p = ps.filter(function(x){return x.handle === m[1];})[0];
      return new Response(p ? JSON.stringify({product: p}) : "{}", {status: p ? 200 : 404});});
    if (/\\/cart\\.js/.test(u)) return Promise.resolve(new Response(JSON.stringify(window.__cart)));
    if (/\\/cart\\/add\\.js/.test(u)){
      var body = JSON.parse(opts.body);
      var items = body.items.map(function(it, i){return {key: "k" + Date.now() + "_" + i, id: it.id,
        quantity: it.quantity, properties: it.properties || {}, product_type: "Bottle Wrap", handle: "x",
        final_line_price: 0, line_price: 0, image: "", product_title: "x"};});
      window.__cart.items = window.__cart.items.concat(items);
      window.__added = (window.__added || []).concat(body.items);
      return Promise.resolve(new Response(JSON.stringify({items: items})));
    }
    if (/\\/cart\\/(change|update)\\.js/.test(u)) return Promise.resolve(new Response(JSON.stringify(window.__cart)));
    return fetch0(url, opts);
  };
})();
</script>
"""

FONTS = "<link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500;600&display=swap'>"
html = ("<!doctype html><html><head><meta charset='utf-8'>" + FONTS +
        "<meta name='viewport' content='width=device-width, initial-scale=1'>"
        "<title>BB harness</title><style>" + page_css + "</style></head><body style='margin:0'>"
        + stub + section
        + ("<style>" + extra_css + "</style>" if extra_css else "")
        + "<script src='bb-script.js'></script></body></html>")
(HERE / "harness.html").write_text(html)
(fx / "empty.json").write_text('{"products":[]}')
print("harness built:", len(section), "bytes of section,", len(m2.group(1)), "bytes of script, extra_css:", len(extra_css))
