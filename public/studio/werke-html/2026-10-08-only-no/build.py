"""Injects data.json (series thinned to at most 160 points per market) into template.html -> index.html."""
import json
d = json.load(open("data.json"))
for m in d["markets"]:
    s = m["series"]
    if len(s) > 160:
        step = len(s) / 159
        keep = {round(i * step) for i in range(159)} | {len(s) - 1, max(range(len(s)), key=lambda i: s[i][1])}
        m["series"] = [s[i] for i in sorted(keep)]  # the peak is always kept
open("index.html", "w").write(open("template.html").read().replace("/*DATA*/null", json.dumps(d, separators=(",", ":"))))
print("index.html", len(open("index.html").read()))
