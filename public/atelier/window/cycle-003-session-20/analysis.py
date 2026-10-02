"""The weekend's own hearing — session 20.  Input: ../cycle-003-session-19/wall.json (committed).
Output: results.json.  Fixed beforehand in PREDICTIONS.md (pushed alone)."""
import json, math, random
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
S19 = HERE.parent / "cycle-003-session-19"
ALL = json.loads((S19 / "wall.json").read_text())["events"]
EQ = [e for e in ALL if e[2] == "earthquake" and e[1] is not None]
YEARS = sorted({e[0] for e in EQ})
NIGHT = (22, 23, 0, 1, 2, 3)
W = [10, 11, 12, 13, 14, 15]
SPLIT = 150


def maxc(ms):
    bins = Counter(m // 10 for m in ms)
    top = max(bins.values())
    return 10 * min(k for k, v in bins.items() if v == top)


MC = {y: maxc([e[1] for e in EQ if e[0] == y]) for y in YEARS}
assert MC == {int(k): v for k, v in json.loads((S19 / "results.json").read_text())["floors"].items()}


def hist(evs):
    h = [0] * 24
    for e in evs:
        h[e[3] // 60] += 1
    return h


def side(eq, name):
    a = [e for e in eq if e[1] >= MC[e[0]] and (e[1] < SPLIT if name == "below" else e[1] >= SPLIT)]
    return hist([e for e in a if e[4] < 5]), hist([e for e in a if e[4] >= 5])


def surplus(eq):
    """per side: weekday-night surplus (session 19) and weekend-hearing surplus, per hour."""
    out = {}
    for name in ("below", "above"):
        wd, we = side(eq, name)
        bwd = sum(wd[h] for h in NIGHT) / 6
        bwe = sum(we[h] for h in NIGHT) / 6
        night = [wd[h] - bwd for h in range(24)]
        wk = [wd[h] - bwd * we[h] / bwe if bwe else float("nan") for h in range(24)]
        out[name] = {"night": night, "weekend": wk, "wd": wd, "we": we, "bwd": bwd, "bwe": bwe}
    return out


def stats(eq):
    s = surplus(eq)
    r = {}
    outside = [h for h in range(6, 20) if h not in W]
    for name in ("below", "above"):
        for base in ("night", "weekend"):
            r[f"{name}_{base}_W"] = sum(s[name][base][h] for h in W)
            r[f"{name}_{base}_h11_12"] = sum(s[name][base][h] for h in (11, 12))
            r[f"{name}_{base}_out"] = sum(s[name][base][h] for h in outside)
    for base in ("night", "weekend"):
        r[f"net_{base}_W"] = r[f"below_{base}_W"] + r[f"above_{base}_W"]
    # EXPLORATORY (added after the verdicts were read): the two baselines against each other
    r["diff_above_W"] = r["above_weekend_W"] - r["above_night_W"]
    r["diff_below_W"] = r["below_weekend_W"] - r["below_night_W"]
    r["above_weekend_share_11_12"] = r["above_weekend_h11_12"] / r["above_weekend_W"]
    # weekend day hearing, per side: weekend day (hours 6-19) over weekend night, per hour
    for name in ("below", "above"):
        we, bwe = s[name]["we"], s[name]["bwe"]
        r[f"{name}_we_day_ratio"] = sum(we[h] for h in range(6, 20)) / 14 / bwe
        r[f"{name}_we_W_ratio"] = sum(we[h] for h in W) / 6 / bwe
    return r, s


main, S = stats(EQ)
BYY = {y: [e for e in EQ if e[0] == y] for y in YEARS}
rng = random.Random(20)
boot = {k: [] for k in main}
for _ in range(1000):
    ys = [rng.choice(YEARS) for _ in YEARS]
    r, _ = stats([e for y in ys for e in BYY[y]])
    for k, v in r.items():
        if v == v:
            boot[k].append(v)


def ci(xs):
    xs = sorted(xs)
    return [xs[int(0.025 * len(xs))], xs[int(0.975 * len(xs)) - 1]]


cis = {k: ci(v) for k, v in boot.items()}
verdict = {
    "1_above_larger": main["above_weekend_W"] > 195,
    "2_below_smaller": abs(main["below_weekend_W"]) < 134 and main["below_weekend_W"] < 0,
    "3_net_more": main["net_weekend_W"] > 61,
    "4_concentration": main["above_weekend_share_11_12"] > 0.5,
    "5_outside_quiet": cis["above_weekend_out"][0] <= 0 <= cis["above_weekend_out"][1],
}
# sanity: the night-baseline numbers must equal session 19's
r19 = json.loads((S19 / "results.json").read_text())
assert round(main["above_night_W"]) == round(r19["explore2"]["dec"]["W_all_above"])
assert round(main["below_night_W"]) == round(r19["explore2"]["dec"]["W_all_below"])
out = {"W": W, "split": SPLIT / 100, "main": main, "ci95": cis, "verdict": verdict,
       "hours": {n: {"wd": S[n]["wd"], "we": S[n]["we"], "night": S[n]["night"], "weekend": S[n]["weekend"],
                     "bwd": S[n]["bwd"], "bwe": S[n]["bwe"]} for n in S}}
(HERE / "results.json").write_text(json.dumps(out, indent=1) + "\n")
print(json.dumps(verdict))
for k in sorted(main):
    print(f"{k:28s} {main[k]:9.2f}  {cis[k][0]:9.2f} {cis[k][1]:9.2f}")
