"""build.py — template.html + data.json -> index.html (the data is inlined so the page needs no fetch)."""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(here, "template.html"), encoding="utf-8").read()
d = json.load(open(os.path.join(here, "data.json"), encoding="utf-8"))
assert t.count("__DATA__") == 1
open(os.path.join(here, "index.html"), "w", encoding="utf-8").write(t.replace("__DATA__", json.dumps(d, ensure_ascii=False)))
print("index.html written")
