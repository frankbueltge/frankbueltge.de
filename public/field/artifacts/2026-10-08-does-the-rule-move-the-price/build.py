"""Embed data/results.json into template.html -> index.html."""
import json, os
H = os.path.dirname(os.path.abspath(__file__))
r = json.load(open(os.path.join(H, "data", "results.json")))
t = open(os.path.join(H, "template.html")).read()
open(os.path.join(H, "index.html"), "w").write(t.replace("/*DATA*/null", json.dumps(r, ensure_ascii=False).replace("</", "<\\/")))
