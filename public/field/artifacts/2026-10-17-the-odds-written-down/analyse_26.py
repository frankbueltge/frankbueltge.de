"""Study 26. Rules of PREREGISTRATION-5.md (pushed 3f3ef77), computed on study 25's files only (no fetch).
(A) The Atelier's case: split the sighted range into an odds hand (free where the event is invariant) and an
outcome hand (free where it changes), and split the changing sequences by floor and week.
(B) The Studio's check: rescore every lag without events a forecaster could already see.
Writes data/results_26.json."""
import json, random, collections

LAGS = [0, 6, 12, 24, 48, 96, 168, 336, 720]
R25 = json.load(open("data/results_25.json")); X25 = json.load(open("data/explore_25.json"))
rows = [l.rstrip("\n").split("\t") for l in open("data/lagged_cells_25.tsv")]
cells = [dict(zip(rows[0], x)) for x in rows[1:]]
g = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0.0]))
bins = collections.defaultdict(dict)                     # (id, lag) -> {M: hit}
for c in cells:
    i, l = c["id"], int(c["lag"])
    g[i][l][0] += int(c["hit"]); g[i][l][1] += float(c["p"]); bins[(i, l)][float(c["M"])] = int(c["hit"])
ids = sorted(i for i in g if all(l in g[i] for l in LAGS))
assert len(ids) == R25["common_sequences"] == 232

# ---- checks: the Atelier's event counts and study 25's sighted bounds
ev = {i: [g[i][l][0] > 0 for l in LAGS] for i in ids}
V = [i for i in ids if len(set(ev[i])) > 1]; I = [i for i in ids if i not in set(V)]
count = {"changes": len(V), "none": sum(not any(ev[i]) for i in I), "all_nine": sum(all(ev[i]) for i in I)}
assert count == {"changes": 50, "none": 181, "all_nine": 1}, count

def extreme(sign, free, base):
    """Exact max (sign 1) or min (sign -1) of O/E when sequences in `free` pick any lag, others sit at `base`."""
    fixed = [g[i][base] for i in ids if i not in free]
    fo, fe = sum(x[0] for x in fixed), sum(x[1] for x in fixed)
    lam = 1.0
    for _ in range(200):
        pick = {i: max(LAGS, key=lambda l: sign * (g[i][l][0] - lam * g[i][l][1])) for i in free}
        o = fo + sum(g[i][pick[i]][0] for i in free); e = fe + sum(g[i][pick[i]][1] for i in free)
        if abs(o / e - lam) < 1e-12: break
        lam = o / e
    return {"observed": o, "stated": round(e, 2), "ratio": round(o / e, 3)}

full = {"harshest": extreme(-1, set(ids), 0), "kindest": extreme(1, set(ids), 0)}
assert full["harshest"]["ratio"] == X25["harshest_sighted"]["ratio"] and full["kindest"]["ratio"] == X25["kindest_sighted"]["ratio"]

hands = []
for L in LAGS:
    o, e = sum(g[i][L][0] for i in ids), sum(g[i][L][1] for i in ids)
    B = {"harshest": extreme(-1, set(I), L), "kindest": extreme(1, set(I), L)}
    C = {"harshest": extreme(-1, set(V), L), "kindest": extreme(1, set(V), L)}
    hands.append({"base_lag_h": L, "clock": round(o / e, 3), "odds_hand": B, "outcome_hand": C,
                  "odds_span_x": round(B["kindest"]["ratio"] / B["harshest"]["ratio"], 2) if B["harshest"]["ratio"] else None,
                  "outcome_span_x": round(C["kindest"]["ratio"] / C["harshest"]["ratio"], 2) if C["harshest"]["ratio"] else None})

# ---- the floor split of V
split = []
for i in V:
    floors = [min(bins[(i, l)]) for l in LAGS]; F = max(floors)
    at = [bins[(i, l)].get(F) for l in LAGS]
    kind = "missing bin" if None in at else "only the floor" if len(set(at)) == 1 else "the week"
    split.append({"id": i, "floors": floors, "F": F, "event_at_F": at, "event_own_floor": [int(x) for x in ev[i]], "changes_with": kind})
split_count = dict(collections.Counter(s["changes_with"] for s in split))

# ---- (B) the Studio's check: events before the version was issued
L25 = [json.loads(l) for l in open("data/lagged_25.jsonl")]   # a list: one version can serve several lags
O25 = {(o["id"], o["issued"]): o for o in map(json.loads, open("data/outcomes_25.jsonl"))}
mcat = lambda r: r["Mcat"] if r["Mcat"] is not None else 3.0
rescored, seen_versions, begun_before = [], set(), set()
for r in L25:
    o = O25.get((r["id"], r["issued"]))
    if o is None: continue
    w = [w for w in r["windows"] if w["label"] == "1 Week"][0]
    if w["t0"] < r["issued"]: begun_before.add((r["id"], r["issued"]))
    inw = [e for e in o["events"] if w["t0"] <= e[1] < w["t1"] and e[4] <= r["rkm"] and e[2] is not None]
    after = [e for e in inw if e[1] >= r["issued"]]
    for b in w["bins"]:
        if b["M"] < mcat(r) - 1e-9: continue
        n_all = sum(1 for e in inw if round(e[2], 2) >= b["M"] - 1e-9)
        n_aft = sum(1 for e in after if round(e[2], 2) >= b["M"] - 1e-9)
        if n_all > n_aft: seen_versions.add((r["id"], r["issued"]))
        rescored.append({"lag": r["lag_rule_h"], "id": r["id"], "p": b["p"], "hit": int(n_all > 0), "hit_after": int(n_aft > 0)})
# the rescoring must reproduce study 25 with the old hit definition before it means anything
by = collections.defaultdict(lambda: collections.defaultdict(list))
for c in rescored: by[c["lag"]][c["id"]].append(c)
q = lambda v, a: v[int(a * (len(v) - 1))]
def summ(lag, key):
    gg = by[lag]; idl = sorted(gg); rng = random.Random(210)
    oe = lambda s: (sum(c[key] for i in s for c in gg[i]), sum(c["p"] for i in s for c in gg[i]))
    o, e = oe(idl); bs = []
    for _ in range(2000):
        so, se = oe([rng.choice(idl) for _ in idl])
        if se > 0: bs.append(so / se)
    bs.sort(); lo, hi = q(bs, .025), q(bs, .975)
    return {"observed": o, "stated": round(e, 2), "O_over_E": round(o / e, 3), "ci": [round(lo, 3), round(hi, 3)],
            "verdict": "too high" if hi < 1 else "too low" if lo > 1 else "cannot be told from right"}
studio = []
for k, L in enumerate(LAGS):
    old, new = summ(L, "hit"), summ(L, "hit_after"); p = R25["primary"][k]
    assert (old["observed"], old["stated"], old["ci"], old["verdict"]) == (p["observed"], p["stated"], p["ci"], p["verdict"]), L
    studio.append({"lag_rule_h": L, "study25": old, "without_seen_before_issue": new,
                   "observed_lost": old["observed"] - new["observed"], "verdict_changed": old["verdict"] != new["verdict"]})

res = {"common_sequences": len(ids), "event_counts": count, "full_sighted": full, "hands": hands,
       "floor_split": split_count, "floor_split_rows": split,
       "studio_check": {"versions_scored": len(O25), "weeks_begun_before_issue": len(begun_before),
                        "versions_with_an_event_seen_before_issue": len(seen_versions),
                        "seen_ids": sorted("%s@%d" % k for k in seen_versions), "per_lag": studio}}
res["predictions_held"] = {
    "P1": all(h["outcome_hand"]["harshest"]["ratio"] < h["odds_hand"]["harshest"]["ratio"] for h in hands),
    "P2": all(h["outcome_hand"]["kindest"]["ratio"] > h["odds_hand"]["kindest"]["ratio"] for h in hands),
    "P3": all(h["odds_hand"]["kindest"]["ratio"] >= 2 * h["odds_hand"]["harshest"]["ratio"] for h in hands),
    "P4": split_count.get("only the floor", 0) >= 5,
    "P5": not any(s["verdict_changed"] for s in studio) and all(s["observed_lost"] <= 2 for s in studio),
}
json.dump(res, open("data/results_26.json", "w"), indent=1, allow_nan=False)
print(json.dumps({k: v for k, v in res.items() if k not in ("floor_split_rows",)}, indent=1)[:9000])
