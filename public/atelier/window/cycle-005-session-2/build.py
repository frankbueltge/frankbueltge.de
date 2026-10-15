"""Build index.html from sizes.json and results.json. Stdlib only."""
import json
R = json.load(open("results.json")); Z = json.load(open("sizes.json")); K = R["by_k"]
sub = {"__DATA__": json.dumps({"lic": Z["lic"], "drawn": Z["drawn"]}),
       "__R5__": "%.1f" % K["5"]["ratio_plain"], "__R5D__": "%.1f" % K["5"]["ratio_discounted"],
       "__R3I__": "%.1f" % (1 / K["3"]["ratio_plain"]), "__R1I__": "%.0f" % (1 / K["1"]["ratio_plain"]),
       "__BSTL__": "%.2f" % R["p1"]["bstar_licensed"], "__BSTD__": "%.2f" % R["p1"]["bstar_drawn"]}
h = open("template.html").read()
for k, v in sub.items(): h = h.replace(k, v)
assert "__" not in h.replace("__proto__", ""), [x for x in h.split() if "__" in x][:5]
open("index.html", "w").write(h); print(len(h))
