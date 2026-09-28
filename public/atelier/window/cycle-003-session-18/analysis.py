"""Does the slope's climb keep hours? — session 18, the clock inside the record.

Input: clock.json (derive.py). Output: results.json.

Rydelek & Sacks (Nature 337:251-253, 1989; abstract read, full text refused): small events go
unlogged when their signal nears the noise, and cultural noise is higher by day, so an incomplete
band logs more events at night; a catalogue showing no significant day-night modulation is
taken as complete, and one that is complete yet bends at small M is at odds with self-similarity.
Their test statistic is Schuster's (1897): phases theta_i = 2 pi * hour/24, R = |sum exp(i theta)|,
p = exp(-R^2 / N) for independent events.

Fixed in PREDICTIONS.md before any time was read: day = local solar 10:00-16:00, night =
22:00-04:00; the per-year maximum-curvature floor and offsets +0.0 ... +0.8 of session 17; the
Aki-Utsu estimator with bin correction 0.005, pooled 1974-2025.

Added tonight, after the predictions and before the results were read:
  * a year-block bootstrap (2000 draws, seed 18) for the day/night ratio and each slope, because
    aftershocks cluster and the Poisson/Schuster formulas assume independent events;
  * the day/night ratio in absolute magnitude bands 0.0-3.0 (0.2 wide), for the figure;
  * the night-only share of the climb: 1 - climb(night) / climb(all).
Exploratory, not predicted: weekday vs weekend at the same floors.

EXPLORATORY, ADDED AFTER THE RESULTS WERE READ (the daytime EXCESS above the floor was not
foreseen by any prediction): the depth of each event was added to clock.json, and the day/night
ratio is split by calendar (Mon-Fri / Sat-Sun, solar) and by depth (< 3 km / >= 3 km) in four
absolute bands; the climb is refitted on four subsets that each remove one suspected population;
the day/night ratio is recomputed on the quietest clock (weekend,
depth >= 3 km: no workweek, no shallow events) with a year-block interval; and the Studio's count
is recomputed with the night-only slope at its own floor (+0.2).
"""
import cmath, json, math, random
from pathlib import Path

HERE = Path(__file__).parent
LOG10E = math.log10(math.e)
EV = json.loads((HERE / "clock.json").read_text())["events"]
YEARS = sorted({e[0] for e in EV})
OFFSETS = list(range(9))


def maxc(ms):
    bins = {}
    for m in ms:
        bins[m // 10] = bins.get(m // 10, 0) + 1
    top = max(bins.values())
    return 10 * min(k for k, v in bins.items() if v == top)


MC = {y: maxc([e[1] for e in EV if e[0] == y]) for y in YEARS}


def is_day(mn):
    return 600 <= mn < 960


def is_night(mn):
    return mn >= 1320 or mn < 240


def b_au(xs):
    """xs: list of (magnitude, floor) in hundredths."""
    s = sum(m / 100 - (f / 100 - 0.005) for m, f in xs)
    return LOG10E / (s / len(xs))


def above(evs, k):
    return [e for e in evs if e[1] >= MC[e[0]] + 10 * k]


def mf(evs, k):
    return [(e[1], MC[e[0]] + 10 * k) for e in evs]


def schuster(evs):
    z = sum(cmath.exp(2j * math.pi * e[3] / 1440) for e in evs)
    n = len(evs)
    return abs(z) ** 2 / n, math.exp(-abs(z) ** 2 / n), (math.degrees(cmath.phase(z)) % 360) / 15


def cell(evs):
    rows = []
    for k in OFFSETS:
        a = above(evs, k)
        d = [e for e in a if is_day(e[3])]
        n = [e for e in a if is_night(e[3])]
        rows.append({"offset": k / 10, "n": len(a), "day": len(d), "night": len(n),
                     "ratio": len(d) / len(n), "b_all": b_au(mf(a, k)), "b_day": b_au(mf(d, k)),
                     "b_night": b_au(mf(n, k))})
    return rows


BYY = {y: [e for e in EV if e[0] == y] for y in YEARS}
main = cell(EV)
for r, k in zip(main, OFFSETS):
    a = above(EV, k)
    r["schuster_R2N"], r["schuster_p"], r["peak_hour"] = schuster(a)
    wkd = sum(1 for e in a if e[4] < 5) / 5
    wke = sum(1 for e in a if e[4] >= 5) / 2
    r["weekday_per_day"], r["weekend_per_day"] = wkd, wke
climb = {s: main[-1]["b_" + s] - main[0]["b_" + s] for s in ("all", "day", "night")}

# year-block bootstrap
rng = random.Random(18)
boot = {"ratio": [[] for _ in OFFSETS], "climb_all": [], "climb_day": [], "climb_night": []}
for _ in range(2000):
    ys = [rng.choice(YEARS) for _ in YEARS]
    evs = [e for y in ys for e in BYY[y]]
    c = cell(evs)
    for i, r in enumerate(c):
        boot["ratio"][i].append(r["ratio"])
    for s in ("all", "day", "night"):
        boot["climb_" + s].append(c[-1]["b_" + s] - c[0]["b_" + s])


def ci(xs):
    xs = sorted(xs)
    return [xs[int(0.025 * len(xs))], xs[int(0.975 * len(xs)) - 1]]


for i, r in enumerate(main):
    r["ratio_ci95"] = ci(boot["ratio"][i])
climb_ci = {s: ci(boot["climb_" + s]) for s in ("all", "day", "night")}

# absolute magnitude bands
bands = []
for lo in range(0, 300, 20):
    evs = [e for e in EV if lo <= e[1] < lo + 20]
    d = sum(1 for e in evs if is_day(e[3]))
    n = sum(1 for e in evs if is_night(e[3]))
    bands.append({"lo": lo / 100, "hi": (lo + 20) / 100, "n": len(evs), "day": d, "night": n,
                  "ratio": d / n if n else None, "schuster_p": schuster(evs)[1] if evs else None})

# hour-of-day histograms: floor band (offset +0.0 to +0.2) and well above (>= +0.4)
def hist(evs):
    h = [0] * 24
    for e in evs:
        h[e[3] // 60] += 1
    return h


low = [e for e in EV if MC[e[0]] <= e[1] < MC[e[0]] + 20]
high = above(EV, 4)
# ---- exploratory (see docstring) ----
DEPTH3 = 30


def climb_of(evs):
    b0 = b_au(mf(above(evs, 0), 0))
    b8 = b_au(mf(above(evs, 8), 8))
    return b8 - b0


SUBSETS = {
    "all": lambda e: True,
    "night only": lambda e: is_night(e[3]),
    "without weekday daytime": lambda e: not (e[4] < 5 and is_day(e[3])),
    "depth >= 3 km": lambda e: e[5] >= DEPTH3,
    "night and depth >= 3 km": lambda e: is_night(e[3]) and e[5] >= DEPTH3,
    "weekend and depth >= 3 km": lambda e: e[4] >= 5 and e[5] >= DEPTH3,
}
subsets = {}
rng2 = random.Random(1818)
draws = [[rng2.choice(YEARS) for _ in YEARS] for _ in range(1000)]
for name, f in SUBSETS.items():
    sel = [e for e in EV if f(e)]
    bs = [climb_of([e for y in ys for e in BYY[y] if f(e)]) for ys in draws]
    subsets[name] = {"n_at_0": len(above(sel, 0)), "b_0": b_au(mf(above(sel, 0), 0)),
                     "b_8": b_au(mf(above(sel, 8), 8)), "climb": climb_of(sel), "climb_ci95": ci(bs)}

split = []
for lo, hi in [(0, 120), (120, 160), (160, 260), (260, 1000)]:
    b = [e for e in EV if lo <= e[1] < hi]
    row = {"band": [lo / 100, hi / 100]}
    for name, f in [("all", lambda e: True), ("weekday", lambda e: e[4] < 5),
                    ("weekend", lambda e: e[4] >= 5), ("depth < 3 km", lambda e: e[5] < DEPTH3),
                    ("depth >= 3 km", lambda e: e[5] >= DEPTH3)]:
        x = [e for e in b if f(e)]
        d = sum(1 for e in x if is_day(e[3]))
        n = sum(1 for e in x if is_night(e[3]))
        row[name] = {"n": len(x), "day": d, "night": n, "ratio": d / n}
    split.append(row)


# the quietest clock: weekend, depth >= 3 km — day/night at each offset, year-block CI
QUIET = lambda e: e[4] >= 5 and e[5] >= DEPTH3
quiet = []
for k in OFFSETS:
    def rq(evs):
        x = [e for e in above(evs, k) if QUIET(e)]
        return (sum(1 for e in x if is_day(e[3])), sum(1 for e in x if is_night(e[3])))
    d, n = rq(EV)
    bs = []
    for ys in draws:
        dd, nn = rq([e for y in ys for e in BYY[y]])
        bs.append(dd / nn)
    quiet.append({"offset": k / 10, "day": d, "night": n, "ratio": d / n, "ratio_ci95": ci(bs)})


def studio_count(b, k):
    tot = 0
    for y in YEARS:
        mc = MC[y] + 10 * k
        n_mc = sum(1 for e in BYY[y] if e[1] >= mc)
        n_1 = sum(1 for e in BYY[y] if e[1] >= 100)
        tot += max(0, n_mc * 10 ** (b * (mc / 100 - 1.0)) - n_1)
    return round(tot)


counts = {"all b at +0.2": studio_count(main[2]["b_all"], 2),
          "night b at +0.2": studio_count(main[2]["b_night"], 2),
          "day b at +0.2": studio_count(main[2]["b_day"], 2)}

res = {"floors": MC, "main": main, "climb": climb, "climb_ci95": climb_ci,
       "night_share_of_climb_removed": 1 - climb["night"] / climb["all"],
       "bands": bands, "hist_floor_band": hist(low), "hist_above_04": hist(high),
       "predictions": {
           "1_ratio_at_0_le_095": main[0]["ratio"] <= 0.95,
           "2_night_climb_gt_005": climb["night"] > 0.05,
           "3_ratio_at_04_in_090_110": 0.90 <= main[4]["ratio"] <= 1.10},
       "events": len(EV),
       "exploratory": {"subsets": subsets, "quiet_clock": quiet, "split": split, "studio_count": counts}}
(HERE / "results.json").write_text(json.dumps(res, indent=1) + "\n")
for r in main:
    print({k: (round(v, 4) if isinstance(v, float) else v) for k, v in r.items()})
print("climb", climb, climb_ci)
print("night removes", res["night_share_of_climb_removed"])
for b in bands:
    print(b)
print(res["predictions"])
print(json.dumps(res["exploratory"], indent=1))
print(res["hist_floor_band"]); print(res["hist_above_04"])
