# Session 1 tests (predictions in SELECTION.md). Usage: python3 -I session1.py <scratch dir with ps.csv> > session1.json
import csv, sys, json, math, re, itertools, collections
rows = list(csv.DictReader(open(sys.argv[1] + "/ps.csv", newline="")))
def ref(r):
    m = re.search(r"refstr=(\S+)", r["pl_refname"]); return m.group(1) if m else r["pl_refname"]
Q = {"period": ("pl_orbper", "pl_orbpererr1", "pl_orbpererr2"),
     "radius": ("pl_radj", "pl_radjerr1", "pl_radjerr2"),
     "mass": ("pl_bmassj", "pl_bmassjerr1", "pl_bmassjerr2")}
def f(x):
    try: return float(x)
    except: return None
out = {"rows": len(rows), "planets": len({r["pl_name"] for r in rows})}
for q, (v, e1, e2) in Q.items():
    per = collections.defaultdict(dict)   # planet -> ref -> (value, sigma)
    for r in rows:
        a, u, l = f(r[v]), f(r[e1]), f(r[e2])
        if a is None or u is None or l is None: continue
        s = (abs(u) + abs(l)) / 2
        if s <= 0: continue
        per[r["pl_name"]].setdefault(ref(r), (a, s, r["default_flag"] == "1"))
    multi = {p: d for p, d in per.items() if len(d) >= 2}
    zs, ident = [], 0
    for p, d in multi.items():
        for (a, sa, _), (b, sb, _) in itertools.combinations(d.values(), 2):
            if a == b: ident += 1
            zs.append(abs(a - b) / math.hypot(sa, sb))
    n = len(zs)
    def share(t, zz=zs): return sum(z > t for z in zz) / len(zz) if zz else None
    nz = [z for z in zs if z > 0]
    res = {"planets_with_values": len(per), "planets_ge2_refs": len(multi), "pairs": n, "identical_pairs": ident,
           "share_z_gt_1": share(1), "share_z_gt_3": share(3), "share_z_gt_10": share(10),
           "pairs_nonidentical": len(nz), "share_z_gt_3_nonidentical": share(3, nz)}
    # prediction 3: planets with >=3 refs; value with smallest sigma vs the others
    p3 = [d for d in per.values() if len(d) >= 3]
    pick_out = pick_tot = rand_out = rand_tot = 0
    for d in p3:
        items = list(d.values())
        best = min(range(len(items)), key=lambda i: items[i][1])
        def frac(i):
            a, sa, _ = items[i]; o = [j for j in range(len(items)) if j != i]
            return sum(abs(items[j][0] - a) / math.hypot(sa, items[j][1]) > 1 for j in o), len(o)
        k, m = frac(best); pick_out += k; pick_tot += m
        for i in range(len(items)):
            k, m = frac(i); rand_out += k; rand_tot += m
    res["p3_planets_ge3_refs"] = len(p3)
    res["p3_share_outside_for_most_precise"] = pick_out / pick_tot if pick_tot else None
    res["p3_share_outside_for_any_reference"] = rand_out / rand_tot if rand_tot else None
    out[q] = res
print(json.dumps(out, indent=1))
