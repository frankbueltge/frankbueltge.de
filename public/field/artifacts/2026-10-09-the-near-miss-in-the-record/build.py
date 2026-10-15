"""Embed data/results.json and data/cells.json into template.html -> index.html."""
import json, os
H = os.path.dirname(os.path.abspath(__file__))
j = lambda n: json.dumps(json.load(open(os.path.join(H, "data", n))), ensure_ascii=False).replace("</", "<\\/")
t = open(os.path.join(H, "template.html")).read()
open(os.path.join(H, "index.html"), "w").write(t.replace("/*DATA*/null", j("results.json")).replace("/*CELLS*/null", j("cells.json")))
