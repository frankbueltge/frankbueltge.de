"""Study 16 checks, stdlib only, independent of analyse.py's pandas path.
Usage: python3 -I check.py   (reads data/where.tsv and data/results.json)"""
import csv, json, math, pathlib, random
HERE = pathlib.Path(__file__).resolve().parent
rows = list(csv.DictReader(open(HERE / "data/where.tsv"), delimiter="\t"))
R = json.loads((HERE / "data/results.json").read_text())
DECLARED = 11
ran = []
def check(name, ok):
    ran.append(name); print(("PASS " if ok else "FAIL ") + name); assert ok, name

check("43,819 warnings, ids unique", len(rows) == 43819 == len({r["warning"] for r in rows}))
never = sum(1 for r in rows if int(r["V"]) == 0)
check("30,495 never met under V, as study 14", never == 30495)
check("13,324 met under V, as the Studio asserts", len(rows) - never == 13324)
check("people total equals the Studio's 2,009,866,030", sum(int(r["people"]) for r in rows) == 2009866030)
check("people beneath never-met equals the Studio's 1,284,258,344",
      sum(int(r["people"]) for r in rows if int(r["V"]) == 0) == 1284258344)
check("every area positive", all(float(r["area_km2"]) > 0 for r in rows))
# quintiles recomputed: sort by log density, ties by file order (pandas rank 'first' does the same)
ld = [math.log10(int(r["people"]) + 1) - math.log10(float(r["area_km2"])) for r in rows]
order = sorted(range(len(rows)), key=lambda i: (ld[i], i))
n = len(rows); qs = [0] * n
for rank, i in enumerate(order):
    qs[i] = 1 + min(4, rank * 5 // n)
share = {}
for q in range(1, 6):
    idx = [i for i in range(n) if qs[i] == q]
    share[q] = round(100 * sum(int(rows[i]["V"]) > 0 for i in idx) / len(idx), 2)
check("quintile V shares match analyse.py", all(abs(share[d["q"]] - d["V"][0]) < 0.02 for d in R["quintiles"]))
check("quintile sizes sum to n", sum(d["n"] for d in R["quintiles"]) == n)
# area by a second method: sinusoidal equal-area projection, on 500 random polygons from study 13
import gzip
src = HERE.parent / "2026-10-14-the-tornadoes-that-came/data/warnings.tsv.gz"
first = {}
for i, r in enumerate(csv.DictReader(gzip.open(src, "rt"), delimiter="\t")):
    w = f"{r['wfo']}.{r['vtec_year']}.{r['etn']}"; k = (r["poly_beg"], r["issued"], i)
    if w not in first or k < first[w][0]: first[w] = (k, r["rings"].split("|")[0])
def area2(ring):  # sinusoidal projection (equal-area), per vertex
    R0 = 6371.0088; k = math.pi / 180
    pts = [tuple(map(float, p.split())) for p in ring.split(";")]
    xy = [(lon * k * R0 * math.cos(lat * k), lat * k * R0) for lon, lat in pts]
    return abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(xy, xy[1:] + xy[:1]))) / 2
random.seed(16)
sample = random.sample(rows, 500)
rel = [abs(area2(first[r["warning"]][1]) / float(r["area_km2"]) - 1) for r in sample]
check("two area methods agree within 2 % on 500 polygons", max(rel) < 0.02)
p = R["predictions"]
check("P2 verdict consistent with its interval", (p["P2"]["verdict"] == "held") == (p["P2"]["or"][1] > 1))
check("refutation not fired iff upper bound >= 1", p["refutation_fired"] == (p["P2"]["or"][2] < 1))
print(f"{len(ran)} of {DECLARED} declared checks ran")
assert len(ran) == DECLARED, (len(ran), DECLARED)
