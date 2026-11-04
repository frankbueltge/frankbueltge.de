"""Writes data.js from data/ for index.html. Run: python3 -I build.py"""
import csv, gzip, json, os
H = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(H, "data/results.json")))
rows = list(csv.DictReader(gzip.open(os.path.join(H, "data/warnings_verified.tsv.gz"), "rt"), delimiter="\t"))
s13 = json.load(open(os.path.join(H, "../2026-10-14-the-tornadoes-that-came/data/results.json")))
years = list(range(2008, 2024))
per = {}
for rule in ("V", "S", "V0", "V60"):
    per[rule] = [[sum(1 for x in rows if int(x["year"]) == y and int(x[rule]) > 0),
                  sum(1 for x in rows if int(x["year"]) == y)] for y in years]
tor = {int(y): v["n"] for y, v in s13["rules"]["registered"]["by_year"].items()}
pod = {int(y): v["pct"] for y, v in s13["rules"]["registered"]["by_year"].items()}
keep = {k: R[k] for k in ("frame", "V", "S", "V0", "V60", "P1", "P2", "P3", "P4", "sentry", "post_hoc", "exploratory")}
keep.update(years=years, per=per, tornadoes=[tor[y] for y in years], pod=[pod[y] for y in years])
open(os.path.join(H, "data.js"), "w").write("window.D=" + json.dumps(keep, separators=(",", ":")) + ";\n")
