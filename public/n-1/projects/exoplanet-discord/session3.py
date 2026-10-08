# Session 3 tests (predictions in SESSION3.md). Usage: python3 -I session3.py <scratch dir with ps3.csv> > session3.json
import csv, sys, json, math, re, itertools, collections
rows = list(csv.DictReader(open(sys.argv[1] + "/ps3.csv", newline="")))
def ref(r):
    m = re.search(r"refstr=(\S+)", r["pl_refname"]); return m.group(1) if m else r["pl_refname"]
def f(x):
    try: return float(x)
    except: return None
method = {r["pl_name"]: r["discoverymethod"] for r in rows}
per = collections.defaultdict(dict)
for r in rows:
    a, u, l = f(r["pl_orbper"]), f(r["pl_orbpererr1"]), f(r["pl_orbpererr2"])
    if None in (a, u, l): continue
    s = (abs(u) + abs(l)) / 2
    if s > 0: per[r["pl_name"]].setdefault(ref(r), (a, s, r["pl_pubdate"]))
P = []  # planet, z, sig_later, sig_earlier, year_later, gap, npapers
for p, d in per.items():
    for (a, sa, da), (b, sb, db) in itertools.combinations(d.values(), 2):
        if a == b or not (da and db) or da == db: continue
        z = abs(a - b) / math.hypot(sa, sb)
        (ls, es, ld, ed) = (sa, sb, da, db) if da > db else (sb, sa, db, da)
        P.append((p, z, ls, es, int(ld[:4]), int(ld[:4]) - int(ed[:4]), len(d)))
def share(g): return {"pairs": len(g), "tail_share": (sum(x[1] > 3 for x in g) / len(g)) if g else None}
bands = {"<=2014": lambda y: y <= 2014, "2015-2019": lambda y: 2015 <= y <= 2019, "2020+": lambda y: y >= 2020}
def byband(g): return {k: share([x for x in g if fn(x[4])]) for k, fn in bands.items()}
out = {"ordered_pairs": len(P), "all": byband(P)}
out["p1_transit_only"] = byband([x for x in P if method[x[0]] == "Transit"])
out["p1_by_method"] = {m: byband([x for x in P if method[x[0]] == m]) for m in ("Transit", "Radial Velocity", "Microlensing", "Imaging")}
out["p2_gap"] = {"gap<=1": share([x for x in P if x[5] <= 1]), "gap2-4": share([x for x in P if 2 <= x[5] <= 4]), "gap>=5": share([x for x in P if x[5] >= 5])}
out["p2_gap_within_2020+"] = {"gap<=1": share([x for x in P if x[5] <= 1 and x[4] >= 2020]), "gap>=5": share([x for x in P if x[5] >= 5 and x[4] >= 2020])}
out["p3_planets_le10_papers"] = byband([x for x in P if x[6] <= 10])
out["p3_planets_gt10_papers"] = byband([x for x in P if x[6] > 10])
r3 = [x for x in P if x[2] < x[3] / 3]; mid = [x for x in P if x[3] / 3 <= x[2] <= x[3] * 3]
out["p4"] = {"later_sigma_lt_third": share(r3), "similar": share(mid), "later_sigma_gt_3x": share([x for x in P if x[2] > x[3] * 3])}
print(json.dumps(out, indent=1))
