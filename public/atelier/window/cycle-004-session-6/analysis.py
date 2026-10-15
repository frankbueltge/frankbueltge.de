"""Session 6: ceiling of any function of a field set, in sample and with the record held out. Stdlib only.
Inputs: studio-sample22.json (the Studio's 22 photographed records and reading), studio-records.json +
studio-classes.json (the 39 birds of session 5). Output: results.json."""
import json, collections, random
S = json.load(open("studio-sample22.json"))["rows"]
cd = collections.Counter((r["date"][:10], r["state"]) for r in S)
cs = collections.Counter(r["state"] for r in S)
# --- the 22 photographs: the seven declared fields (adapted as the Field adapted them) and five widening fields
DECL = {
 "shares date+state": lambda r: int(cd[(r["date"][:10], r["state"])] > 1),
 "has media": lambda r: 1,
 "has remarks": lambda r: int(r["has_remarks"]),
 "publisher empty": lambda r: 0,
 "locality empty": lambda r: int(r["locality"] is None),
 "year>=2018": lambda r: int(r["year"] >= 2018),
 "shares state, any date": lambda r: int(cs[r["state"]] > 1),
}
WIDE = {
 "state": lambda r: r["state"],
 "licence": lambda r: r["licence"],
 "month": lambda r: r["date"][5:7],
 "hour": lambda r: r["date"][11:13],
 "creator": lambda r: r["creator_no"],
}
y22 = [int(r["reading"] == "remains") for r in S]   # 1 = the bone
def cells(rows, fs, y):
    c = collections.defaultdict(list)
    for r, t in zip(rows, y): c[tuple(f(r) for f in fs)].append(t)
    return c
def ceiling(rows, fs, y):
    """best any-function score in sample: each profile cell answers with its majority (ties -> 0)"""
    c = cells(rows, fs, y)
    return sum(max(v.count(0), v.count(1)) if v.count(1) != v.count(0) else v.count(0) for v in c.values()), len(c)
def loo(rows, fs, y, grp=None):
    """each record judged by the cell built from all the others (or, with grp, from all records outside its group):
    returns (correct, undecided, per-record verdicts)"""
    ok = und = 0; verd = []
    for i in range(len(rows)):
        keep = [j for j in range(len(rows)) if j != i and (grp is None or grp[j] != grp[i])]
        c = cells([rows[j] for j in keep], fs, [y[j] for j in keep])
        v = c.get(tuple(f(rows[i]) for f in fs))
        if not v: und += 1; verd.append("empty"); p = 0     # empty cell -> default to the majority answer
        else:
            p = int(v.count(1) > v.count(0)); verd.append("remains" if p else "living")
        ok += int(p == y[i])
    return ok, und, verd
declf = list(DECL.values())
res = {"n22": len(S), "bones": sum(y22), "majority22": len(S) - sum(y22)}
cl, ncell = ceiling(S, declf, y22)
res["P1_declared_ceiling"] = {"correct": cl, "profiles": ncell, "bone_profile_shared_with": len([1 for r in S if tuple(f(r) for f in declf) == tuple(f(S[y22.index(1)]) for f in declf)]) - 1}
steps = []
fs = list(declf)
names = list(WIDE)
for k in range(len(names) + 1):
    fs_k = declf + [WIDE[n] for n in names[:k]]
    c_in, ncell = ceiling(S, fs_k, y22)
    ok, und, verd = loo(S, fs_k, y22)
    iso = sum(1 for v in cells(S, fs_k, y22).values() if len(v) == 1)
    steps.append({"added": names[:k], "profiles": ncell, "in_sample": c_in, "records_alone_in_their_cell": iso,
                  "loo_correct": ok, "loo_empty_cells": und, "loo_bone_verdict": verd[y22.index(1)]})
res["P2_widening"] = steps
# --- the 39 birds: seven declared fields, any function, in sample and held out, against label shuffles
R = json.load(open("studio-records.json"))["records"]; C = {int(k): v for k, v in json.load(open("studio-classes.json")).items()}
cd9 = collections.Counter((r["date"], r["lat"], r["lon"]) for r in R); cp9 = collections.Counter((r["lat"], r["lon"]) for r in R)
F9 = [lambda r: int(cd9[(r["date"], r["lat"], r["lon"])] > 1), lambda r: int(bool(r["media"])), lambda r: int(bool(r["has_remarks"])),
      lambda r: int(r["publisher"] is None), lambda r: int(r["locality"] is None), lambda r: int(r["year"] >= 2018),
      lambda r: int(cp9[(r["lat"], r["lon"])] > 1)]
y9 = [int(C[r["key"]] in "DE") for r in R]
cin, n9 = ceiling(R, F9, y9); lok, lund, _ = loo(R, F9, y9)
random.seed(20261006); sh = []
for _ in range(2000):
    z = y9[:]; random.shuffle(z); sh.append(loo(R, F9, z)[0])
sh.sort(); p95 = sh[int(0.95 * len(sh)) - 1]
res["P3_birds"] = {"n": 39, "majority": 39 - sum(y9), "profiles": n9, "in_sample_ceiling": cin, "loo_correct": lok, "loo_empty_cells": lund,
                   "loo_shuffled_p95": p95, "loo_shuffled_median": sh[1000], "loo_shuffled_runs_at_or_above_real": sum(1 for s in sh if s >= lok)}
# --- addendum P4/P5: hold out the judged record's whole place, or whole species; null permutes label tuples between groups of equal size
def shuffle_groups(grp, y, rng):
    members = collections.defaultdict(list)
    for i, g in enumerate(grp): members[g].append(i)
    bysize = collections.defaultdict(list)
    for g, m in members.items(): bysize[len(m)].append(g)
    z = y[:]
    for size, gs in bysize.items():
        tuples = [tuple(y[i] for i in members[g]) for g in gs]; rng.shuffle(tuples)
        for g, t in zip(gs, tuples):
            for i, v in zip(members[g], t): z[i] = v
    return z
rng = random.Random(20261006)
res["P4P5_birds_grouped"] = {}
for name, grp in (("place", [(r["lat"], r["lon"]) for r in R]), ("species", [r["species"] for r in R])):
    ok, und, _ = loo(R, F9, y9, grp)
    sh = sorted(loo(R, F9, shuffle_groups(grp, y9, rng), grp)[0] for _ in range(2000))
    res["P4P5_birds_grouped"][name] = {"groups": len(set(grp)), "loo_correct": ok, "loo_empty_cells": und, "shuffled_p95": sh[1899], "shuffled_median": sh[1000],
        "shuffled_runs_at_or_above_real": sum(1 for v in sh if v >= ok)}
json.dump(res, open("results.json", "w"), indent=1)
print(json.dumps(res, indent=1))
