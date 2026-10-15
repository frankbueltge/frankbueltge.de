"""Inline results.json into template.html -> index.html. Usage: python3 -I build.py"""
import json
from pathlib import Path
here = Path(__file__).resolve().parent
R = json.loads((here / "results.json").read_text())
page = (here / "template.html").read_text().replace("/*DATA*/null", json.dumps(R, ensure_ascii=False, separators=(",", ":")))
(here / "index.html").write_text(page)
print("index.html", len(page), "bytes")
