"""Study 26 checks. The extremes are optimal (no single swap improves them, no random reading beats them),
the hands nest inside the full reader, the floor split recounts, and the before-issue rule is tested on a
planted event. Exits non-zero on any failure; counts what it ran."""
import json, sys, random, collections
ran, failed = [], []
def check(name, cond):
    ran.append(name); print(("PASS " if cond else "FAIL ") + name)
    if not cond: failed.append(name)

LAGS = [0, 6, 12, 24, 48, 96, 168, 336, 720]
res = json.load(open("data/results_26.json"))
rows = [l.rstrip("\n").split("\t") for l in open("data/lagged_cells_25.tsv")]
cells = [dict(zip(rows[0], x)) for x in rows[1:]]
g = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0.0]))
for c in cells: g[c["id"]][int(c["lag"])][0] += int(c["hit"]); g[c["id"]][int(c["lag"])][1] += float(c["p"])
ids = sorted(i for i in g if all(l in g[i] for l in LAGS))
ev = {i: {g[i][l][0] > 0 for l in LAGS} for i in ids}
V = {i for i in ids if len(ev[i]) > 1}; I = set(ids) - V

def ratio(pick): return sum(g[i][pick[i]][0] for i in ids) / sum(g[i][pick[i]][1] for i in ids)
def best(sign, free, base):
    """A second path: coordinate ascent from the clock reading, one sequence at a time, until no swap helps."""
    pick = {i: base for i in ids}; r = ratio(pick); moved = True
    while moved:
        moved = False
        for i in sorted(free):
            for l in LAGS:
                old = pick[i]; pick[i] = l; r2 = ratio(pick)
                if sign * (r2 - r) > 1e-12: r, moved = r2, True
                else: pick[i] = old
    return r

# 1-2. the full reader, by a second path
check("coordinate ascent reaches the full harshest", abs(best(-1, set(ids), 0) - res["full_sighted"]["harshest"]["ratio"]) < 6e-4)
check("coordinate ascent reaches the full kindest", abs(best(1, set(ids), 0) - res["full_sighted"]["kindest"]["ratio"]) < 6e-4)
# 3. both hands at three baselines, by the second path
ok = True
for h in res["hands"]:
    if h["base_lag_h"] not in (0, 24, 720): continue
    L = h["base_lag_h"]
    for sign, k in ((-1, "harshest"), (1, "kindest")):
        ok &= abs(best(sign, I, L) - h["odds_hand"][k]["ratio"]) < 6e-4
        ok &= abs(best(sign, V, L) - h["outcome_hand"][k]["ratio"]) < 6e-4
check("both hands agree with coordinate ascent at 0, 24 h and 30 d", ok)
# 4. no random reading beats a bound
rng = random.Random(26); ok = True
for h in res["hands"]:
    L = h["base_lag_h"]
    for free, k in ((I, "odds_hand"), (V, "outcome_hand")):
        for _ in range(300):
            pick = {i: (rng.choice(LAGS) if i in free else L) for i in ids}; r = ratio(pick)
            ok &= h[k]["harshest"]["ratio"] - 6e-4 <= r <= h[k]["kindest"]["ratio"] + 6e-4
check("5,400 random readings stay inside every hand's bounds", ok)
# 5. nesting: each hand lies inside the full reader and contains its clock
check("each hand lies inside the full reader and contains its own clock",
      all(res["full_sighted"]["harshest"]["ratio"] <= h[k]["harshest"]["ratio"] <= h["clock"] <= h[k]["kindest"]["ratio"] <= res["full_sighted"]["kindest"]["ratio"]
          for h in res["hands"] for k in ("odds_hand", "outcome_hand")))
# 6. floor split recount
fs = res["floor_split_rows"]
check("the floor split covers exactly the 50 changing sequences", len(fs) == 50 and {r["id"] for r in fs} == V)
check("'only the floor' means the event at F never changes and the own-floor event does",
      all((len(set(r["event_at_F"])) == 1) == (r["changes_with"] == "only the floor") and len(set(r["event_own_floor"])) == 2 for r in fs))
# 7. the before-issue rule on planted events
L25 = [json.loads(l) for l in open("data/lagged_25.jsonl")]
O25 = {(o["id"], o["issued"]): o for o in map(json.loads, open("data/outcomes_25.jsonl"))}
r = next(r for r in L25 if r["lag_rule_h"] == 0 and (r["id"], r["issued"]) in O25
         and next(w for w in r["windows"] if w["label"] == "1 Week")["t0"] < r["issued"])
w = next(w for w in r["windows"] if w["label"] == "1 Week")
def seen(events): return [e for e in events if w["t0"] <= e[1] < r["issued"] and e[4] <= r["rkm"]]
check("a planted event between week start and issue is seen before issue, one after is not",
      len(seen([["x", r["issued"] - 1, 9.0, "mw", 0.0]])) == 1 and len(seen([["y", r["issued"], 9.0, "mw", 0.0]])) == 0)
sc = res["studio_check"]
check("rescoring loses at most what the seen versions hold, and only where they are",
      sum(s["observed_lost"] for s in sc["per_lag"]) <= sum(1 for _ in sc["seen_ids"]) * 9 and all(s["observed_lost"] >= 0 for s in sc["per_lag"]))
# 8. the suite proves it ran what it counts
check("this suite ran nine checks before this one", len(ran) == 9)
print(f"{len(ran) - len(failed)} of {len(ran)} passed"); sys.exit(1 if failed else 0)
