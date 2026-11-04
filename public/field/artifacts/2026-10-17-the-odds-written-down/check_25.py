"""Study 25 checks. A second code path over the stored files, the lag rule against the version index, the
nesting of lags, and a planted event. Exits non-zero on any failure; counts what it ran."""
import json, sys, collections, copy
ran, failed = [], []
def check(name, cond):
    ran.append(name); print(("PASS " if cond else "FAIL ") + name)
    if not cond: failed.append(name)

R = [json.loads(l) for l in open("data/lagged_25.jsonl")]
O = {(o["id"], o["issued"]): o for o in map(json.loads, open("data/outcomes_25.jsonl"))}
IDX = {v["id"]: v for v in map(json.loads, open("data/versions_25.jsonl"))}
res = json.load(open("data/results_25.json"))
H = 3600000

# 1. lag rule: each row is the earliest indexed version at or after first + t
check("every row is the earliest version at or after its lag",
      all(r["issued"] == min(t for t in IDX[r["id"]]["versions"] if t >= r["first_issued"] + r["lag_rule_h"] * H) for r in R))
check("lag 0 is study 21's first forecast for all 255",
      sum(1 for r in R if r["lag_rule_h"] == 0) == 255 and all(r["issued"] == r["first_issued"] for r in R if r["lag_rule_h"] == 0))
# 2. nesting: issue time never decreases with lag inside a sequence
seq = collections.defaultdict(dict)
for r in R: seq[r["id"]][r["lag_rule_h"]] = r["issued"]
check("issue time is non-decreasing in lag", all(all(a <= b for a, b in zip([d[k] for k in sorted(d)], [d[k] for k in sorted(d)][1:])) for d in seq.values()))

# 3. second code path: per row, the largest in-window magnitude decides every bin at once
def score(rows, outs):
    o = collections.Counter(); e = collections.Counter()
    for r in rows:
        k = (r["id"], r["issued"])
        if k not in outs: continue
        w = next(w for w in r["windows"] if w["label"] == "1 Week")
        floor = r["Mcat"] if r["Mcat"] is not None else 3.0
        mags = [round(x[2], 2) for x in outs[k]["events"] if x[2] is not None and w["t0"] <= x[1] < w["t1"] and x[4] <= r["rkm"]]
        top = max(mags) if mags else -9
        for b in w["bins"]:
            if b["M"] >= floor - 1e-9:
                e[r["lag_rule_h"]] += b["p"]; o[r["lag_rule_h"]] += int(top >= b["M"] - 1e-9)
    return o, e
o, e = score(R, O)
check("second path reproduces observed and stated at all nine lags",
      all(o[s["lag_rule_h"]] == s["observed"] and abs(e[s["lag_rule_h"]] - s["stated"]) < 0.01 for s in res["primary"]))

# 4. planted event: an M9 inside one lag-48 week adds exactly one hit per bin of that row
r = next(r for r in R if r["lag_rule_h"] == 48 and (r["id"], r["issued"]) in O)
w = next(w for w in r["windows"] if w["label"] == "1 Week")
O2 = copy.deepcopy(O); O2[(r["id"], r["issued"])]["events"].append(["planted", w["t0"] + 1, 9.0, "mw", 0.0])
floor = r["Mcat"] if r["Mcat"] is not None else 3.0
nb = sum(1 for b in w["bins"] if b["M"] >= floor - 1e-9)
# the same version can serve several lags (nesting), so every lag sharing it must move, and no other
share = [x for x in R if (x["id"], x["issued"]) == (r["id"], r["issued"])]
already = score(share, O)[0]
o2, _ = score(R, O2)
check("a planted M9 adds exactly the missing hits at every lag sharing that version, and nowhere else",
      all(o2[l] - o[l] == ((nb - already[l]) if any(x["lag_rule_h"] == l for x in share) else 0) for l in o))
# 5. a planted event outside the circle is ignored
O3 = copy.deepcopy(O); O3[(r["id"], r["issued"])]["events"].append(["far", w["t0"] + 1, 9.0, "mw", r["rkm"] + 1])
check("a planted M9 outside the circle changes nothing", score(R, O3)[0] == o)
# 6. the pre-registered reproduction
c = res["checks"]
check("lag 0 agrees with study 21 cell for cell", c["lag0_vs_study21_cells"]["disagree"] == 0 and c["lag0_vs_study21_cells"]["observed_new_same_cells"] == 49)
check("lag 24 agrees with study 23 cell for cell", c["lag24_vs_study23_cells"]["disagree"] == 0 and c["lag24_vs_study23_cells"]["observed_new_same_cells"] == 26)
# 7. verdict words follow the intervals
check("verdicts follow the intervals", all(s["verdict"] == ("too high" if s["ci"][1] < 1 else "too low" if s["ci"][0] > 1 else "cannot be told from right") for s in res["primary"]))
# 8. the suite proves it ran what it counts
check("this suite ran nine checks before this one", len(ran) == 9)
print(f"{len(ran) - len(failed)} of {len(ran)} passed"); sys.exit(1 if failed else 0)
