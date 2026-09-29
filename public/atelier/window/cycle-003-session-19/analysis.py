"""Does the daytime excess keep the blasts' hours? — session 19, the clock on the wall.

Input: wall.json (derive.py). Output: results.json.

Everything under PREDICTED is fixed in PREDICTIONS.md (committed and pushed before any labelled
event was fetched). Floors: session 17's per-year maximum-curvature floor on the earthquakes
with a magnitude (recomputed here from the same list, and required to equal session 18's).
Estimator: Aki-Utsu, bin correction 0.005, pooled 1974-2025.

Added after the predictions and before the results were read: a year-block bootstrap (2000
draws, seed 19) for every predicted quantity, because aftershocks cluster.
EXPLORATORY sections are marked where they begin.
"""
import json, math, random
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
ALL = json.loads((HERE / "wall.json").read_text())["events"]
EQ = [e for e in ALL if e[2] == "earthquake" and e[1] is not None]
LAB = [e for e in ALL if e[2] != "earthquake"]
YEARS = sorted({e[0] for e in EQ})
LOG10E = math.log10(math.e)
NIGHT = (22, 23, 0, 1, 2, 3)
DAYH = range(6, 20)
SHALLOW = 30  # depth x 10 km: 3 km


def maxc(ms):
    bins = Counter(m // 10 for m in ms)
    top = max(bins.values())
    return 10 * min(k for k, v in bins.items() if v == top)


MC = {y: maxc([e[1] for e in EQ if e[0] == y]) for y in YEARS}


def wkday(e):
    return e[4] < 5


def hour(e):
    return e[3] // 60


def above(evs, k=0):
    return [e for e in evs if e[1] >= MC[e[0]] + 10 * k]


def hist(evs):
    h = [0] * 24
    for e in evs:
        h[hour(e)] += 1
    return h


def b_au(evs, k):
    s = sum(e[1] / 100 - ((MC[e[0]] + 10 * k) / 100 - 0.005) for e in evs)
    return LOG10E / (s / len(evs))


def climb(evs):
    return b_au(above(evs, 8), 8) - b_au(above(evs, 0), 0)


# ---- the blast window, from the labelled record alone ----
lab_wd = hist([e for e in LAB if wkday(e)])
order = sorted(range(24), key=lambda h: (-lab_wd[h], h))
W, acc = [], 0
for h in order:
    W.append(h)
    acc += lab_wd[h]
    if acc >= 0.8 * sum(lab_wd):
        break
W = sorted(W)


def predicted(eq):
    a = above(eq)
    wd = [e for e in a if wkday(e)]
    we = [e for e in a if not wkday(e)]
    hwd, hwe = hist(wd), hist(we)
    base_wd = sum(hwd[h] for h in NIGHT) / 6
    base_we = sum(hwe[h] for h in NIGHT) / 6
    exc = {h: hwd[h] - base_wd for h in range(24)}
    e_day = sum(exc[h] for h in DAYH)
    e_w = sum(exc[h] for h in W)
    # depth: excess inside W split by depth, each against its own night baseline
    sh = [e for e in wd if e[5] < SHALLOW]
    hs = hist(sh)
    e_w_sh = sum(hs[h] for h in W) - len(W) * sum(hs[h] for h in NIGHT) / 6
    no_w = [e for e in eq if not (wkday(e) and hour(e) in W)]
    return {"r11": hwd[11] / base_wd, "base_wd": base_wd, "e_day": e_day, "e_w": e_w,
            "share_w": e_w / e_day if e_day > 0 else None,
            "r_we_w": (sum(hwe[h] for h in W) / len(W)) / base_we, "base_we": base_we,
            "e_w_shallow": e_w_sh, "share_shallow": e_w_sh / e_w if e_w > 0 else None,
            "climb": climb(eq), "climb_no_w": climb(no_w), "d_climb": climb(no_w) - climb(eq),
            "hist_wd": hwd, "hist_we": hwe, "n_removed": len(eq) - len(no_w)}


main = predicted(EQ)
BYY = {y: [e for e in EQ if e[0] == y] for y in YEARS}
rng = random.Random(19)
keys = ("r11", "e_w", "share_w", "r_we_w", "share_shallow", "d_climb", "climb", "climb_no_w")
boot = {k: [] for k in keys}
for _ in range(2000):
    ys = [rng.choice(YEARS) for _ in YEARS]
    p = predicted([e for y in ys for e in BYY[y]])
    for k in keys:
        if p[k] is not None:
            boot[k].append(p[k])


def ci(xs):
    xs = sorted(xs)
    return [xs[int(0.025 * len(xs))], xs[int(0.975 * len(xs)) - 1]]


cis = {k: ci(v) for k, v in boot.items()}
verdict = {
    "1_shape": main["r11"] > 1.3,
    "2_place": main["e_day"] > 0 and main["share_w"] >= 0.5,
    "3_control": 0.85 <= main["r_we_w"] <= 1.15,
    "4_depth": main["share_shallow"] is not None and main["share_shallow"] > 0.5,
    "5_slope": abs(main["d_climb"]) < 0.03,
}

# ---- EXPLORATORY (after the results were read) ----
# the labelled record itself: its magnitudes against the earthquake floors, its depths, its years
lab_m = [e for e in LAB if e[1] is not None]
lab_above = [e for e in lab_m if e[0] in MC and e[1] >= MC[e[0]]]
lab_types = Counter(e[2] for e in LAB)
lab_years = Counter(e[0] for e in LAB)
eq_years_w = Counter(e[0] for e in above(EQ) if wkday(e) and hour(e) in W)
# per-hour excess by 5-year era, weekday, above floor: when did the suspects live?
eras = []
for lo in range(1974, 2026, 5):
    hi = min(lo + 4, 2025)
    a = [e for e in above(EQ) if lo <= e[0] <= hi and wkday(e)]
    h = hist(a)
    base = sum(h[x] for x in NIGHT) / 6
    labs = sum(1 for e in LAB if lo <= e[0] <= hi)
    eras.append({"from": lo, "to": hi, "n_wd_above": len(a), "night_base": base,
                 "excess_w": sum(h[x] for x in W) - len(W) * base, "labelled": labs})
# magnitude profile of the excess inside W vs the labelled blasts (0.2 bands, absolute)
bands = []
for lo in range(0, 360, 20):
    a = [e for e in above(EQ) if wkday(e) and lo <= e[1] < lo + 20]
    h = hist(a)
    base = sum(h[x] for x in NIGHT) / 6
    bands.append({"lo": lo / 100, "excess_w": sum(h[x] for x in W) - len(W) * base,
                  "labelled_wd_w": sum(1 for e in lab_m if wkday(e) and hour(e) in W
                                       and lo <= e[1] < lo + 20)})
# the climb with only the shallow weekday W events removed, and with W removed on all days
no_w_sh = [e for e in EQ if not (wkday(e) and hour(e) in W and e[5] < SHALLOW)]
no_w_all = [e for e in EQ if hour(e) not in W]
# the floors themselves: do they move if W is removed?
MC_now = dict(MC)
mc_no_w = {y: maxc([e[1] for e in EQ if e[0] == y and not (wkday(e) and hour(e) in W)])
           for y in YEARS}
floors_moved = sum(1 for y in YEARS if mc_no_w[y] != MC_now[y])
explore = {
    "labelled_types": dict(lab_types), "labelled_n": len(LAB), "labelled_with_mag": len(lab_m),
    "labelled_above_eq_floor": len(lab_above),
    "labelled_mag_median": sorted(e[1] for e in lab_m)[len(lab_m) // 2] / 100,
    "labelled_shallow_share": sum(1 for e in LAB if e[5] < SHALLOW) / len(LAB),
    "labelled_weekday_share": sum(1 for e in LAB if wkday(e)) / len(LAB),
    "labelled_hist_wd": lab_wd, "labelled_hist_we": hist([e for e in LAB if not wkday(e)]),
    "labelled_first_year": min(lab_years), "labelled_by_year": dict(sorted(lab_years.items())),
    "eras": eras, "bands": bands,
    "climb_no_w_shallow": climb(no_w_sh), "climb_no_w_alldays": climb(no_w_all),
    "floors_moved_if_w_removed": floors_moved,
}

# ---- EXPLORATORY 2 (added after the first results were read) ----
# At the floor the weekday W net is small because two things of opposite sign meet in it: the
# day's deafness below about M 1.5 and a surplus above it. Split at M 1.5 (chosen after seeing the
# band table above, so exploratory), each side against its own weekday night baseline, with a
# year-block interval; the same for the two peak hours 11-12 alone and for shallow / deep.
SPLIT = 150


def split(eq, hours, pick=lambda e: True):
    a = [e for e in above(eq) if wkday(e) and pick(e)]
    out = {}
    for name, cond in (("below", lambda e: e[1] < SPLIT), ("above", lambda e: e[1] >= SPLIT)):
        h = hist([e for e in a if cond(e)])
        base = sum(h[x] for x in NIGHT) / 6
        out[name] = sum(h[x] for x in hours) - len(hours) * base
    return out


def split_all(eq):
    r = {}
    for tag, hrs in (("W", W), ("h11_12", [11, 12])):
        for dtag, pick in (("all", lambda e: True), ("shallow", lambda e: e[5] < SHALLOW),
                           ("deep", lambda e: e[5] >= SHALLOW)):
            s = split(eq, hrs, pick)
            r[f"{tag}_{dtag}_below"], r[f"{tag}_{dtag}_above"] = s["below"], s["above"]
    return r


dec = split_all(EQ)
rng2 = random.Random(1919)
dboot = {k: [] for k in dec}
for _ in range(1000):
    ys = [rng2.choice(YEARS) for _ in YEARS]
    d = split_all([e for y in ys for e in BYY[y]])
    for k in dec:
        dboot[k].append(d[k])
dec_ci = {k: ci(v) for k, v in dboot.items()}
# weekend, same split: the control for the surplus
we_a = [e for e in above(EQ) if not wkday(e)]
we_split = {}
for name, cond in (("below", lambda e: e[1] < SPLIT), ("above", lambda e: e[1] >= SPLIT)):
    h = hist([e for e in we_a if cond(e)])
    we_split[name] = sum(h[x] for x in W) - len(W) * sum(h[x] for x in NIGHT) / 6
# placebo: the climb change from removing each contiguous six-hour weekday block
placebo = []
for s0 in range(24):
    blk = [(s0 + i) % 24 for i in range(6)]
    rest = [e for e in EQ if not (wkday(e) and hour(e) in blk)]
    placebo.append({"start": s0, "d_climb": climb(rest) - main["climb"]})
wd_a = [e for e in above(EQ) if wkday(e)]
hours_split = {"below": hist([e for e in wd_a if e[1] < SPLIT]),
               "above": hist([e for e in wd_a if e[1] >= SPLIT])}
explore2 = {"split_at": SPLIT / 100, "hours_split": hours_split, "dec": dec, "dec_ci95": dec_ci, "weekend_W": we_split,
            "placebo": placebo,
            "placebo_rank_of_W": sorted(p["d_climb"] for p in placebo).index(
                next(p["d_climb"] for p in placebo if p["start"] == W[0])) + 1}
out = {"W": W, "W_share_of_labelled_weekday": sum(lab_wd[h] for h in W) / sum(lab_wd),
       "n_all": len(ALL), "n_eq": len(EQ), "n_labelled": len(LAB), "floors": MC,
       "main": main, "ci95": cis, "verdict": verdict, "explore": explore,
       "explore2": explore2}
(HERE / "results.json").write_text(json.dumps(out, indent=1) + "\n")
print(json.dumps({k: out[k] for k in ("W", "W_share_of_labelled_weekday", "verdict")}))
print(json.dumps({k: v for k, v in main.items() if not k.startswith("hist")}, indent=0))
print(json.dumps(cis))
