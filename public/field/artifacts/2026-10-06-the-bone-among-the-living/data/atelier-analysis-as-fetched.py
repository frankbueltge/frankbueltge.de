"""Score the rule family fixed in PREDICTIONS.md against the Studio's classes. Stdlib only."""
import json, itertools, random, collections
R = json.load(open("studio-records.json"))["records"]
C = {int(k): v for k, v in json.load(open("studio-classes.json")).items()}
assert len(R) == 39 and all(r["key"] in C for r in R)
cd = collections.Counter((r["date"], r["lat"], r["lon"]) for r in R)
cp = collections.Counter((r["lat"], r["lon"]) for r in R)
F = {
 "f1 shares_date_place": lambda r: cd[(r["date"], r["lat"], r["lon"])] > 1,
 "f2 has_media": lambda r: bool(r["media"]),
 "f3 has_remarks": lambda r: bool(r["has_remarks"]),
 "f4 publisher_null": lambda r: r["publisher"] is None,
 "f5 locality_null": lambda r: r["locality"] is None,
 "f6 year>=2018": lambda r: r["year"] >= 2018,
 "f8 shares_place_any_date": lambda r: cp[(r["lat"], r["lon"])] > 1,
}
names = list(F)
X = [[int(F[n](r)) for n in names] for r in R]
cls = [C[r["key"]] for r in R]
def rules():
    for i, n in enumerate(names):
        yield (n,), (lambda x, i=i: x[i])
    for (i, a), (j, b) in itertools.combinations(enumerate(names), 2):
        yield (a, "AND", b), (lambda x, i=i, j=j: x[i] & x[j])
        yield (a, "OR", b), (lambda x, i=i, j=j: x[i] | x[j])
RULES = list(rules())
def best(y):
    """best accuracy over rules and both polarities; y = 1 for 'living or unexamined'"""
    top = (-1, None)
    for name, f in RULES:
        p = [f(x) for x in X]
        s = sum(a == b for a, b in zip(p, y))
        for pol, sc in (("as", s), ("inverted", len(y) - s)):
            if sc > top[0]: top = (sc, (name, pol))
    return top
y = [int(c in "DE") for c in cls]
maj = len(y) - sum(y)
b = best(y)
random.seed(20261005)
sh = []
for _ in range(2000):
    z = y[:]; random.shuffle(z); sh.append(best(z)[0])
sh.sort(); p95 = sh[int(0.95 * len(sh)) - 1]
# P1
g_idx = [i for i, c in enumerate(cls) if c == "G"]
f1 = [x[0] for x in X]
p1_in = sum(f1[i] for i in g_idx); p1_out = sum(f1) - p1_in
# P4: rules passing any A record vs D
A = [i for i, c in enumerate(cls) if c == "A"]; Dd = [i for i, c in enumerate(cls) if c == "D"]
sep = []
for name, f in RULES:
    p = [f(x) for x in X]
    a = [p[i] for i in A]; d = [p[i] for i in Dd]
    if (all(a) and not any(d)) or (all(d) and not any(a)) : sep.append(name)
# per-class table of features
tab = {c: {n: sum(X[i][k] for i in range(39) if cls[i] == c) for k, n in enumerate(names)} for c in "ABCDEFGH"}
size = collections.Counter(cls)
# which rules reach the best score (ties)
ties = []
for name, f in RULES:
    p = [f(x) for x in X]; s = sum(a == b_ for a, b_ in zip(p, y))
    if s == b[0] or len(y) - s == b[0]: ties.append(["/".join(name), "as" if s == b[0] else "inverted"])
res = {"n": 39, "target_positive_DE": sum(y), "majority_correct": maj, "majority_acc": round(maj / 39, 4),
 "rules_searched": len(RULES) * 2, "best_correct": b[0], "best_acc": round(b[0] / 39, 4), "best_rule": [list(b[1][0]), b[1][1]],
 "n_tied_rules": len(ties), "tied_rules": ties[:12],
 "shuffled_best_p95": p95, "shuffled_best_median": sh[len(sh) // 2], "shuffled_best_max": sh[-1],
 "shuffled_runs_at_or_above_real": sum(1 for s in sh if s >= b[0]),
 "P1": {"G_size": len(g_idx), "G_flagged": p1_in, "flagged_outside_G": p1_out},
 "P4_rules_separating_A_from_D": [" ".join(s) for s in sep], "A_size": len(A), "D_size": len(Dd),
 "feature_by_class": tab, "class_sizes": dict(size)}
json.dump(res, open("results.json", "w"), indent=1)
print(json.dumps(res, indent=1))
