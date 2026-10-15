# Calibration curve for the figure: share of cross-reference pairs beyond k stated sigmas, per quantity, against the Gaussian
# expectation 2*(1-Phi(k)) = erfc(k/sqrt 2). Same pair definition as session1.py. Usage: python3 -I session1c.py <dir> > calibration.json
import csv, sys, json, math, re, itertools, collections
rows = list(csv.DictReader(open(sys.argv[1] + "/ps.csv", newline="")))
def ref(r):
    m = re.search(r"refstr=(\S+)", r["pl_refname"]); return m.group(1) if m else r["pl_refname"]
Q = {"period": ("pl_orbper", "pl_orbpererr1", "pl_orbpererr2"), "radius": ("pl_radj", "pl_radjerr1", "pl_radjerr2"),
     "mass": ("pl_bmassj", "pl_bmassjerr1", "pl_bmassjerr2")}
K = [0.5, 1, 2, 3, 5, 10, 30, 100]
def f(x):
    try: return float(x)
    except: return None
out = {"k": K, "gauss": [math.erfc(k / math.sqrt(2)) for k in K]}
for q, (v, e1, e2) in Q.items():
    per = collections.defaultdict(dict)
    for r in rows:
        a, u, l = f(r[v]), f(r[e1]), f(r[e2])
        if None in (a, u, l): continue
        s = (abs(u) + abs(l)) / 2
        if s > 0: per[r["pl_name"]].setdefault(ref(r), (a, s))
    zs = [(abs(a - b) / math.hypot(sa, sb), a == b) for d in per.values() if len(d) >= 2
          for (a, sa), (b, sb) in itertools.combinations(d.values(), 2)]
    allz = [z for z, _ in zs]; nz = [z for z, same in zs if not same]
    out[q] = {"pairs": len(zs), "identical_share": sum(s for _, s in zs) / len(zs),
              "all": [sum(z > k for z in allz) / len(allz) for k in K],
              "non_identical": [sum(z > k for z in nz) / len(nz) for k in K]}
print(json.dumps(out, indent=1))
