"""Prospect: how often is the ComCat depth a round decree? Usage: prospect.py RAWDIR OUT.json"""
import csv, sys, json, glob, collections
raw, out = sys.argv[1], sys.argv[2]
rows = []
for f in sorted(glob.glob(raw + "/*.csv")):
    rows += list(csv.DictReader(open(f)))
def fl(x):
    try: return float(x)
    except: return None
n = len(rows); dep = [fl(r["depth"]) for r in rows]
res = {"n": n, "no_depth": sum(d is None for d in dep)}
c = collections.Counter(d for d in dep if d is not None)
res["top_depths"] = [[k, v] for k, v in c.most_common(12)]
# neighbouring bins: 9.9..10.1 by 0.1
res["bins_around_10"] = {str(round(9.5 + i * .1, 1)): c.get(round(9.5 + i * .1, 1), 0) for i in range(11)}
# magnitude bands
bands = [(4, 4.5), (4.5, 5), (5, 5.5), (5.5, 6), (6, 7), (7, 10)]
mb = {}
for lo, hi in bands:
    sel = [(r, fl(r["depth"])) for r in rows if lo <= float(r["mag"]) < hi]
    t = len(sel)
    mb[f"{lo}-{hi}"] = {"n": t, "d10": sum(d == 10 for _, d in sel), "d35": sum(d == 35 for _, d in sel), "d33": sum(d == 33 for _, d in sel),
                        "d0": sum(d == 0 for _, d in sel),
                        "noerr": sum(1 for r, _ in sel if not r["depthError"])}
res["by_mag"] = mb
nets = collections.defaultdict(lambda: collections.Counter())
for r, d in zip(rows, dep):
    nets[r["net"]]["n"] += 1
    for v in (10, 33, 35, 5, 0):
        if d == v: nets[r["net"]][f"d{v}"] += 1
    if not r["depthError"]: nets[r["net"]]["noerr"] += 1
res["by_net"] = {k: dict(v) for k, v in sorted(nets.items(), key=lambda kv: -kv[1]["n"])[:15]}
# depthError for d==10 vs else
def st(sel):
    e = sorted(fl(r["depthError"]) for r, d in sel if fl(r["depthError"]) is not None)
    return {"n": len(sel), "with_err": len(e), "median_err": e[len(e)//2] if e else None}
res["err_d10"] = st([(r, d) for r, d in zip(rows, dep) if d == 10])
res["err_other"] = st([(r, d) for r, d in zip(rows, dep) if d != 10])
res["mag_types"] = dict(collections.Counter(r["magType"] for r in rows).most_common(8))
json.dump(res, open(out, "w"), indent=1)
print(json.dumps(res, indent=1))
