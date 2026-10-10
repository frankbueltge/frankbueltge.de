"""Injects data.json into template.html -> index.html. Run after build_data.py: python3 build.py"""
import json
d = json.load(open("data.json"))
open("index.html", "w").write(open("template.html").read().replace("/*DATA*/null", json.dumps(d, separators=(",", ":"), ensure_ascii=False)))
print("index.html", len(open("index.html").read()))
