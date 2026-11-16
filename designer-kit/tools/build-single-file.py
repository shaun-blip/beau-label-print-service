#!/usr/bin/env python3
"""Rebuilds the one-file designer the print service needs (label-print-service/public/designer.html).

Run from the designer-kit folder after any change to the designer:
    python3 tools/build-single-file.py ../label-print-service/public/designer.html
It folds the CSS, the seven script files, the fonts and all artwork back into a single HTML file.
"""
import base64, mimetypes, re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / "designer-single.html"
html = (root / "designer.html").read_text()
MIME = {".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2"}
def data_uri(rel):
    p = root / rel
    return "data:" + MIME[p.suffix] + ";base64," + base64.b64encode(p.read_bytes()).decode()
def inline_paths(text):
    return re.sub(r'(?:assets|fonts)/[\w.-]+\.(?:webp|jpg|png|woff2)', lambda m: data_uri(m.group(0)), text)
html = html.replace('<link rel="stylesheet" href="designer-fonts.css">', '<style id="uploaded-fonts">' + (root / "designer-fonts.css").read_text() + '</style>')
html = html.replace('<link rel="stylesheet" href="designer.css">', '<style>' + (root / "designer.css").read_text() + '</style>')
scripts = re.findall(r'<script src="(js/[\w.-]+)"></script>', html)
joined = "\n".join((root / s).read_text() for s in scripts)
first = True
for s in scripts:
    tag = f'<script src="{s}"></script>'
    html = html.replace(tag, "<script>" + joined + "</script>" if first else "", 1); first = False
html = inline_paths(html)
out.write_text(html)
print(f"wrote {out} ({len(html) // 1024} KB, {len(scripts)} script files, artwork and fonts inlined)")
