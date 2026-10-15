"""Cells + headline numbers. Usage: study.py RAWDIR  -> cells.json, headline.json"""
import csv, sys, glob, json, collections
rows = []
for f in sorted(glob.glob(sys.argv[1] + "/*.csv")): rows += list(csv.DictReader(open(f)))
cells = collections.defaultdict(lambda: [0, 0, 0, 0])  # n, d10, d35, other-round(5,0 etc)
H = collections.Counter(); yr = collections.defaultdict(lambda: [0, 0, 0])
errs = {"d10": [], "d35": [], "solved": []}
for r in rows:
    d = float(r["depth"]); la = float(r["latitude"]); lo = float(r["longitude"])
    k = (int((la + 90) // 1), int((lo + 180) // 1))  # 1-degree cell
    c = cells[k]; c[0] += 1
    cls = "d10" if d == 10 else "d35" if d == 35 else "solved"
    if cls == "d10": c[1] += 1
    if cls == "d35": c[2] += 1
    H["n"] += 1; H[cls] += 1
    y = r["time"][:4]; yr[y][0] += 1; yr[y][1] += cls == "d10"; yr[y][2] += cls == "d35"
    if r["depthError"]: errs[cls].append(float(r["depthError"]))
def med(x): x = sorted(x); return x[len(x) // 2]
def share(a, lo, hi): return sum(lo <= v <= hi for v in a) / len(a)
out = dict(H)
out["median_depthError"] = {k: med(v) for k, v in errs.items()}
out["share_err_1.6_to_2.0"] = {k: round(share(v, 1.6, 2.0), 4) for k, v in errs.items()}
out["share_err_below_3"] = {k: round(share(v, 0, 3), 4) for k, v in errs.items()}
out["by_year"] = {y: {"n": v[0], "d10": v[1], "d35": v[2]} for y, v in sorted(yr.items())}
out["cells_with_events"] = len(cells)
out["cells_all_decreed"] = sum(1 for c in cells.values() if c[1] + c[2] == c[0])
out["cells_ge20_all_decreed"] = sum(1 for c in cells.values() if c[0] >= 20 and c[1] + c[2] == c[0])
out["cells_ge20_none_decreed"] = sum(1 for c in cells.values() if c[0] >= 20 and c[1] + c[2] == 0)
out["cells_ge20"] = sum(1 for c in cells.values() if c[0] >= 20)
json.dump(out, open("headline.json", "w"), indent=1)
json.dump([[k[0], k[1]] + v[:3] for k, v in sorted(cells.items())], open("cells.json", "w"), separators=(",", ":"))
print(json.dumps(out, indent=1))
