"""Second route for every number on the page. Session 18.

analysis.py walks event lists. This script first collapses clock.json into one table of counts
and magnitude sums keyed by (year, magnitude, hour class, weekday class, depth class), then
answers every question from that table alone: ratios from count sums, slopes from summed
magnitudes. The yearly floor is found by a sort instead of a dictionary scan. Then it checks
results.json against those answers and the page against results.json, whole phrases only.
Exit status is the number of failures.
"""
import json, math, re, sys
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).parent
EV = json.loads((HERE / "clock.json").read_text())["events"]
R = json.loads((HERE / "results.json").read_text())
PAGE = (HERE / "index.html").read_text()
fails = []
n_checks = 0


def ok(cond, what):
    global n_checks
    n_checks += 1
    if not cond:
        fails.append(what)


def hc(mn):
    return "D" if 600 <= mn < 960 else ("N" if (mn >= 1320 or mn < 240) else "O")


T = defaultdict(int)                  # (year, mag, hour class, weekend?, deep?) -> count
for y, m, _t, mn, wd, dp in EV:
    T[(y, m, hc(mn), wd >= 5, dp >= 30)] += 1

years = sorted({k[0] for k in T})
floor = {}
for y in years:
    bins = defaultdict(int)
    for k, v in T.items():
        if k[0] == y:
            bins[k[1] // 10] += v
    best = sorted(bins.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
    floor[y] = best * 10
ok(all(floor[y] == R["floors"][str(y)] for y in years), "yearly floors")


def sel(k, pred):
    """sum count and (m - floor + 0.005) over cells above floor + k and matching pred."""
    n = 0
    s = 0.0
    for key, v in T.items():
        y, m, h, we, dp = key
        f = floor[y] + 10 * k
        if m >= f and pred(h, we, dp):
            n += v
            s += v * (m - f + 0.5) / 100
    return n, s


def slope(k, pred):
    n, s = sel(k, pred)
    return math.log10(math.e) * n / s


ANY = lambda h, we, dp: True
for k in range(9):
    r = R["main"][k]
    nd, _ = sel(k, lambda h, we, dp: h == "D")
    nn, _ = sel(k, lambda h, we, dp: h == "N")
    na, _ = sel(k, ANY)
    ok((nd, nn, na) == (r["day"], r["night"], r["n"]), f"counts at +{k/10}")
    ok(abs(nd / nn - r["ratio"]) < 1e-12, f"ratio at +{k/10}")
    ok(abs(slope(k, ANY) - r["b_all"]) < 1e-9, f"b all at +{k/10}")
    ok(abs(slope(k, lambda h, we, dp: h == "D") - r["b_day"]) < 1e-9, f"b day at +{k/10}")
    ok(abs(slope(k, lambda h, we, dp: h == "N") - r["b_night"]) < 1e-9, f"b night at +{k/10}")
    lo, hi = r["ratio_ci95"]
    ok(lo <= r["ratio"] <= hi, f"ci brackets at +{k/10}")
    q = R["exploratory"]["quiet_clock"][k]
    qd, _ = sel(k, lambda h, we, dp: h == "D" and we and dp)
    qn, _ = sel(k, lambda h, we, dp: h == "N" and we and dp)
    ok((qd, qn) == (q["day"], q["night"]), f"quiet counts at +{k/10}")
    ok(q["ratio_ci95"][0] <= q["ratio"] <= q["ratio_ci95"][1], f"quiet ci at +{k/10}")

PRED = {"all": ANY, "night only": lambda h, we, dp: h == "N",
        "without weekday daytime": lambda h, we, dp: not (h == "D" and not we),
        "depth >= 3 km": lambda h, we, dp: dp,
        "night and depth >= 3 km": lambda h, we, dp: h == "N" and dp,
        "weekend and depth >= 3 km": lambda h, we, dp: we and dp}
for name, p in PRED.items():
    s = R["exploratory"]["subsets"][name]
    c = slope(8, p) - slope(0, p)
    ok(abs(c - s["climb"]) < 1e-9, f"climb {name}")
    ok(sel(0, p)[0] == s["n_at_0"], f"n {name}")
    ok(s["climb_ci95"][0] <= s["climb"] <= s["climb_ci95"][1], f"climb ci {name}")
    ok(s["climb_ci95"][0] > 0, f"climb ci above zero {name}")
ok(abs(R["climb"]["night"] - R["exploratory"]["subsets"]["night only"]["climb"]) < 1e-12, "night climb twice")
ok(abs(R["night_share_of_climb_removed"] - (1 - R["climb"]["night"] / R["climb"]["all"])) < 1e-12, "share")

# absolute bands
for b in R["bands"]:
    lo, hi = round(b["lo"] * 100), round(b["hi"] * 100)
    d = sum(v for k, v in T.items() if lo <= k[1] < hi and k[2] == "D")
    n = sum(v for k, v in T.items() if lo <= k[1] < hi and k[2] == "N")
    ok((d, n) == (b["day"], b["night"]), f"band {lo}")
for row in R["exploratory"]["split"]:
    lo, hi = round(row["band"][0] * 100), round(row["band"][1] * 100)
    for name, p in {"all": ANY, "weekday": lambda we, dp: not we, "weekend": lambda we, dp: we,
                    "depth < 3 km": lambda we, dp: not dp, "depth >= 3 km": lambda we, dp: dp}.items():
        pp = (lambda we, dp: True) if name == "all" else p
        d = sum(v for k, v in T.items() if lo <= k[1] < hi and k[2] == "D" and pp(k[3], k[4]))
        n = sum(v for k, v in T.items() if lo <= k[1] < hi and k[2] == "N" and pp(k[3], k[4]))
        ok(abs(d / n - row[name]["ratio"]) < 1e-12, f"split {lo} {name}")

# the Studio's count, by per-year cumulative counts
def count(b, k):
    tot = 0.0
    for y in years:
        f = floor[y] + 10 * k
        nf = sum(v for kk, v in T.items() if kk[0] == y and kk[1] >= f)
        n1 = sum(v for kk, v in T.items() if kk[0] == y and kk[1] >= 100)
        tot += max(0.0, nf * 10 ** (b * (f / 100 - 1.0)) - n1)
    return round(tot)


SC = R["exploratory"]["studio_count"]
ok(count(R["main"][2]["b_all"], 2) == SC["all b at +0.2"] == 7043, "studio count reproduces 7 043")
ok(count(R["main"][2]["b_night"], 2) == SC["night b at +0.2"], "night count")
ok(count(R["main"][2]["b_day"], 2) == SC["day b at +0.2"], "day count")

# predictions
M = R["main"]
ok(R["predictions"]["1_ratio_at_0_le_095"] == (M[0]["ratio"] <= 0.95), "p1")
ok(R["predictions"]["2_night_climb_gt_005"] == (R["climb"]["night"] > 0.05), "p2")
ok(R["predictions"]["3_ratio_at_04_in_090_110"] == (0.90 <= M[4]["ratio"] <= 1.10), "p3")

# the page: whole phrases
text = re.sub(r"<[^>]+>", "", PAGE).replace("&#8211;", "-").replace("&nbsp;", " ").replace("&#8217;", "'")


def f2(x):
    return f"{x:.2f}"


def f3(x):
    return f"{x:.3f}"


low = next(s for s in R["exploratory"]["split"] if s["band"][0] == 0.0)
mid = next(s for s in R["exploratory"]["split"] if s["band"][0] == 1.6)
Q = R["exploratory"]["quiet_clock"]
qs = R["exploratory"]["subsets"]["weekend and depth >= 3 km"]
phrases = [
    f"the day holds only {f2(low['all']['ratio'])} of the night's count",
    f"On weekdays it is {f2(low['weekday']['ratio'])}, on weekends {f2(low['weekend']['ratio'])}",
    f"day over night is {f2(M[0]['ratio'])} ({f2(M[0]['ratio_ci95'][0])}-{f2(M[0]['ratio_ci95'][1])})",
    f"b still climbs by +{f3(R['climb']['night'])} ({f3(R['climb_ci95']['night'][0])}-{f3(R['climb_ci95']['night'][1])}), against +{f3(R['climb']['all'])}",
    f"At most about {round(100 * R['night_share_of_climb_removed'])} % of the climb keeps hours",
    f"still climbs by +{min(s['climb'] for s in R['exploratory']['subsets'].values()):.3f} or more",
    f"day over night is {f2(M[4]['ratio'])} ({f2(M[4]['ratio_ci95'][0])}-{f2(M[4]['ratio_ci95'][1])})",
    f"the excess is {f2(mid['weekday']['ratio'])} on weekdays and {f2(mid['weekend']['ratio'])} on weekends",
    f"shallower than 3 km it is {f2(mid['depth < 3 km']['ratio'])}",
    f"b still climbs by +{f3(qs['climb'])} ({f3(qs['climb_ci95'][0])}-{f3(qs['climb_ci95'][1])})",
    f"at the floor it runs {f2(Q[0]['ratio_ci95'][0])}-{f2(Q[0]['ratio_ci95'][1])}",
    f"the unwritten total is {SC['night b at +0.2']:,}".replace(",", " "),
    "with the day-only slope, " + f"{SC['day b at +0.2']:,}".replace(",", " "),
    f"the record's own slope gave {SC['all b at +0.2']:,}".replace(",", " "),
    f"of all {len(EV):,} events".replace(",", " "),
    "(1) At the floor, day over night is at most 0.95: refuted",
    "the climb exceeds 0.05: held",
    "lies within 0.90-1.10: refuted",
]
for ph in phrases:
    ok(ph in text, f"page phrase: {ph}")
ok(len(EV) == 20760, "event count")
ok("<script" not in PAGE.lower(), "no script")
ok("http" not in re.sub(r'<svg.*?</svg>', '', PAGE, flags=re.S).replace("http-equiv", ""), "no outside address")

print(f"{n_checks} checks, {len(fails)} failed")
for f in fails:
    print("FAIL", f)
sys.exit(len(fails))
