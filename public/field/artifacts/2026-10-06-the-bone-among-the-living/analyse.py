"""Atelier's rule family (same structure) applied to the Studio's 22 read records; Wilson intervals for the bone share.
Stdlib only. Run: python3 -I analyse.py"""
import json, itertools, collections, math, os
H = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(H + "/data/studio-reading.json"))
S = {str(r["key"]): r for r in json.load(open(H + "/data/studio-sample.json"))["rows"]}
keys = sorted(R); rows = [S[k] for k in keys]; y = [int(R[k]["reading"] == "alive") for k in keys]
cds = collections.Counter((r["date"][:10], r["country"], r["state"]) for r in rows)
F = {  # same seven names as the Atelier's family; f1, f4 replaced, f2 constant: declared in PREREGISTRATION.md
 "f1 shares_date_state(proxy)": lambda r: cds[(r["date"][:10], r["country"], r["state"])] > 1,
 "f2 has_media(constant)": lambda r: True,
 "f3 has_remarks": lambda r: bool(r["remarks"]),
 "f4 publisher_null(unavailable=0)": lambda r: False,
 "f5 locality_null": lambda r: r["locality"] is None,
 "f6 year>=2018": lambda r: r["year"] >= 2018,
 "f8 shares_state_any_date": lambda r: sum(1 for q in rows if q["state"] == r["state"] and q["country"] == r["country"]) > 1,
}
names = list(F); X = [[int(F[n](r)) for n in names] for r in rows]
def rules():
    for i, n in enumerate(names): yield (n,), (lambda x, i=i: x[i])
    for (i, a), (j, b) in itertools.combinations(enumerate(names), 2):
        yield (a, "AND", b), (lambda x, i=i, j=j: x[i] & x[j])
        yield (a, "OR", b), (lambda x, i=i, j=j: x[i] | x[j])
RULES = list(rules()); n = len(y); maj = max(sum(y), n - sum(y))
best = (-1, None); over = []
for name, f in RULES:
    p = [f(x) for x in X]; s = sum(a == b for a, b in zip(p, y))
    for pol, sc in (("as", s), ("inverted", n - s)):
        if sc > best[0]: best = (sc, [list(name), pol])
        if sc > maj: over.append([list(name), pol, sc])
bi = y.index(0); prof = X[bi]
same = [keys[i] for i, x in enumerate(X) if x == prof]
tort = [i for i, r in enumerate(rows) if r["species"] == "Chelonoidis niger"]
tb = sum(1 - y[i] for i in tort)
def wilson(k, m, z=1.959964):
    p = k / m; d = 1 + z * z / m; c = p + z * z / (2 * m); w = z * math.sqrt(p * (1 - p) / m + z * z / (4 * m * m))
    return (c - w) / d, (c + w) / d
lo, hi = wilson(tb, len(tort)); lo22, hi22 = wilson(sum(1 - v for v in y), n)
res = {"n": n, "alive": sum(y), "remains": n - sum(y), "majority_correct": maj, "rules_searched": len(RULES) * 2,
 "best_correct": best[0], "best_rule": best[1], "rules_above_majority": over,
 "bone_key": keys[bi], "bone_profile": dict(zip(names, prof)), "records_sharing_bone_profile": len(same),
 "living_sharing_bone_profile": len(same) - 1, "tortoise_n": len(tort), "tortoise_remains": tb,
 "tortoise_wilson95": [round(lo, 4), round(hi, 4)], "all22_wilson95": [round(lo22, 4), round(hi22, 4)],
 "tortoise_media_records": 1520,
 "scaled_estimate_records": {"point": round(1520 * tb / len(tort)), "low": round(1520 * lo), "high": round(1520 * hi),
   "note": "estimate: sample non-random (page draws of licensed photographs), interval is binomial only"}}
json.dump(res, open(H + "/data/results.json", "w"), indent=1); print(json.dumps(res, indent=1))
