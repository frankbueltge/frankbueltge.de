# Unregistered second pass (deviation, journal item 3): P3 as registered counts pairs through sqrt(s_a^2+s_b^2), so pairs that
# contain the most precise value have a smaller denominator by construction. This pass uses only the OTHER values' scale:
# d_i = |x_i - median(others)| / median(sigma of others), for planets with >=3 referenced values. Compare the most precise
# reference with every reference. Usage: python3 -I session1b.py <scratch dir> > session1b.json
import csv, sys, json, re, statistics as S, collections
rows = list(csv.DictReader(open(sys.argv[1] + "/ps.csv", newline="")))
def ref(r):
    m = re.search(r"refstr=(\S+)", r["pl_refname"]); return m.group(1) if m else r["pl_refname"]
Q = {"period": ("pl_orbper", "pl_orbpererr1", "pl_orbpererr2"), "radius": ("pl_radj", "pl_radjerr1", "pl_radjerr2"),
     "mass": ("pl_bmassj", "pl_bmassjerr1", "pl_bmassjerr2")}
def f(x):
    try: return float(x)
    except: return None
out = {}
for q, (v, e1, e2) in Q.items():
    per = collections.defaultdict(dict)
    for r in rows:
        a, u, l = f(r[v]), f(r[e1]), f(r[e2])
        if None in (a, u, l): continue
        s = (abs(u) + abs(l)) / 2
        if s > 0: per[r["pl_name"]].setdefault(ref(r), (a, s))
    P, A = [], []
    for d in per.values():
        it = list(d.values())
        if len(it) < 3: continue
        def dd(i):
            o = [it[j] for j in range(len(it)) if j != i]
            return abs(it[i][0] - S.median(x for x, _ in o)) / S.median(s for _, s in o)
        best = min(range(len(it)), key=lambda i: it[i][1])
        P.append(dd(best)); A += [dd(i) for i in range(len(it))]
    sh = lambda L, t: sum(x > t for x in L) / len(L)
    out[q] = {"planets": len(P), "median_d_most_precise": S.median(P), "median_d_any": S.median(A),
              "share_d_gt_1_most_precise": sh(P, 1), "share_d_gt_1_any": sh(A, 1),
              "share_d_gt_3_most_precise": sh(P, 3), "share_d_gt_3_any": sh(A, 3)}
print(json.dumps(out, indent=1))
