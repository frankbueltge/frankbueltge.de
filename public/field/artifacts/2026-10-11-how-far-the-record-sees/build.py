"""Writes data.js for index.html from data/passages.tsv and data/results.json."""
import json, re
rows = []
for line in open("data/passages.tsv").read().splitlines()[1:]:
    des, date, r, v, h, b = line.split("\t")
    y = int(date[:4]); m = re.match(r"^(\d{4}) [A-Z]", des)
    later = (2 if not m else (1 if int(m.group(1)) > y else 0))  # 0 seen by then, 1 computed later, 2 numbered/unknown
    rows.append([round(float(b), 3), float(h), y, later, des, date[:10]])
R = json.load(open("data/results.json"))
open("data.js", "w").write("window.PASSAGES=" + json.dumps(rows, separators=(",", ":")) + ";\nwindow.RESULTS=" + json.dumps(R, separators=(",", ":")) + ";\n")
print(len(rows), "rows")
