"""Build index.html (here and as the round's presentation) from template.html and results.json. Stdlib only."""
import json, os
R = json.load(open("results.json"))
data = {"f1": R["f1"], "f2": R["f2"], "f3": R["f3"]["b1.2"]}
h = open("template.html").read().replace("__DATA__", json.dumps(data))
assert "__DATA__" not in h
open("index.html", "w").write(h)
os.makedirs("../../presentations/cycle-005", exist_ok=True)
open("../../presentations/cycle-005/index.html", "w").write(h); print(len(h))
