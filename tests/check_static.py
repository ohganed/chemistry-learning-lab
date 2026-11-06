#!/usr/bin/env python3
"""Static integrity checks for Chemistry Structure Lab (no third-party packages)."""
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
errors = []
class Scanner(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.scripts = []
        self.inscript = False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("a", "link", "script") and (tag != "link" or a.get("rel") in ("manifest", "stylesheet", "icon")):
            url = a.get("href") or a.get("src")
            if url: self.links.append(url)
        if tag == "script" and not a.get("src"):
            self.inscript = True
            self.scripts.append("")
    def handle_endtag(self, tag):
        if tag == "script":
            self.inscript = False
    def handle_data(self, value):
        if self.inscript:
            self.scripts[-1] += value

for path in HTML_FILES:
    p = Scanner()
    try:
        p.feed(path.read_text(encoding="utf-8"))
    except Exception as e:
        errors.append(f"{path.name}: invalid HTML parsing: {e}")
        continue
    for url in p.links:
        u = urlsplit(url)
        if u.scheme or u.netloc or not u.path or u.path.startswith("/") or u.path.startswith("#"):
            continue
        relative = unquote(u.path).split("?")[0]
        if not (path.parent / relative).exists():
            errors.append(f"{path.name}: broken relative reference: {url}")
    for i, js in enumerate(p.scripts, 1):
        check = subprocess.run(["node", "--check", "--input-type=commonjs"],
                               input=js, text=True, capture_output=True)
        if check.returncode:
            errors.append(f"{path.name} inline script {i}: {check.stderr.strip()[:450]}")
for js in sorted(ROOT.glob("*.js")):
    check = subprocess.run(["node", "--check", str(js)], text=True, capture_output=True)
    if check.returncode:
        errors.append(f"{js.name}: {check.stderr.strip()[:450]}")

atlas = ROOT / "concept-atlas.html"
if atlas.exists():
    src = atlas.read_text(encoding="utf-8")
    for required in ("chemistry-atlas-discoveries-v1", "learner-hypothesis", "schemaVersion", "prerequisite", "reinterpret"):
        if required not in src:
            errors.append(f"concept-atlas.html: missing {required}")
if errors:
    print("\n".join("FAIL " + e for e in errors))
    sys.exit(1)
print(f"PASS: {len(HTML_FILES)} HTML pages, inline scripts, JavaScript, local file links and concept atlas invariants")
