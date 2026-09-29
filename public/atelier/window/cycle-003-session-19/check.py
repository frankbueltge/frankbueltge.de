"""Second route for every number on the page. Session 19.

analysis.py walks event lists. This script first collapses wall.json into one table of counts
keyed by (labelled?, year, magnitude, civil hour, weekend?, shallow?), then answers every
question from that table alone: excesses from count sums, slopes from counts times magnitudes.
The yearly floor is found by a sort instead of a dictionary scan, and must equal session 18's.
Then it checks results.json against those answers and the page against results.json, whole
phrases only. Exit status is the number of failures.
"""
import json, math, sys
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).parent
EV = json.loads((HERE / "wall.json").read_text())["events"]
R = json.loads((HERE / "results.json").read_text())
S18 = json.loads((HERE.parent / "cycle-003-session-18" / "results.json").read_text())
PAGE = (HERE / "index.html").read_text()
fails, n_checks = [], 0


def ok(cond, what):
    global n_checks
    n_checks += 1
    if not cond:
        fails.append(what)


def near(a, b, tol=1e-9):
    return a is not None and b is not None and abs(a - b) <= tol * max(1, abs(b))


T = defaultdict(int)
for y, m, typ, mn, wd, dp in EV:
    if typ == "earthquake" and m is None:
        continue
    T[(typ != "earthquake", y, m, mn // 60, wd >= 5, dp < 30)] += 1
ok(sum(T.values()) + sum(1 for e in EV if e[2] == "earthquake" and e[1] is None) == R["n_all"], "n_all")
ok(sum(v for k, v in T.items() if not k[0]) == R["n_eq"], "n_eq")
ok(sum(v for k, v in T.items() if k[0]) == R["n_labelled"], "n_labelled")

# floors by sort: most populated 0.1 bin, lowest on ties
floor = {}
for y in sorted({k[1] for k in T if not k[0]}):
    bins = defaultdict(int)
    for k, v in T.items():
        if not k[0] and k[1] == y:
            bins[k[2] // 10] += v
    floor[y] = 10 * sorted(bins.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
ok({str(y): f for y, f in floor.items()} == R["floors"], "floors equal results")
ok(R["floors"] == S18["floors"], "floors equal session 18's")


def cnt(lab=False, hours=range(24), wkend=None, shallow=None, above=0, mlo=None, mhi=None, years=None):
    s = 0
    for (l, y, m, h, we, sh), v in T.items():
        if l != lab or h not in hours:
            continue
        if wkend is not None and we != wkend:
            continue
        if shallow is not None and sh != shallow:
            continue
        if not lab and above is not None and m < floor[y] + 10 * above:
            continue
        if mlo is not None and (m is None or m < mlo):
            continue
        if mhi is not None and (m is None or m >= mhi):
            continue
        if years and not (years[0] <= y <= years[1]):
            continue
        s += v
    return s


NIGHT = (22, 23, 0, 1, 2, 3)
# W from the labelled record, recomputed by cumulative share over a descending sort
lab = [cnt(True, [h], wkend=False, above=None) for h in range(24)]
ok(lab == R["explore"]["labelled_hist_wd"], "labelled weekday hours")
ok([cnt(True, [h], wkend=True, above=None) for h in range(24)] == R["explore"]["labelled_hist_we"], "labelled weekend hours")
cum, W = 0, []
for h, v in sorted(enumerate(lab), key=lambda hv: (-hv[1], hv[0])):
    if cum >= 0.8 * sum(lab):
        break
    W.append(h)
    cum += v
ok(sorted(W) == R["W"], "window W")
W = sorted(W)
ok(near(sum(lab[h] for h in W) / sum(lab), R["W_share_of_labelled_weekday"]), "W share")
ok(lab[11] + cnt(True, [11], wkend=True, above=None) == 818, "818 in the 11 o'clock hour (the Studio's count)")

# predicted quantities
wd = [cnt(hours=[h], wkend=False) for h in range(24)]
we = [cnt(hours=[h], wkend=True) for h in range(24)]
M = R["main"]
ok(wd == M["hist_wd"] and we == M["hist_we"], "earthquake hour tables")
base = sum(wd[h] for h in NIGHT) / 6
basee = sum(we[h] for h in NIGHT) / 6
ok(near(base, M["base_wd"]) and near(basee, M["base_we"]), "night baselines")
ok(near(wd[11] / base, M["r11"]), "r11")
e_day = sum(wd[h] for h in range(6, 20)) - 14 * base
e_w = sum(wd[h] for h in W) - len(W) * base
ok(near(e_day, M["e_day"]) and near(e_w, M["e_w"]), "excesses")
ok(near(sum(we[h] for h in W) / len(W) / basee, M["r_we_w"]), "weekend control")
shw = cnt(hours=W, wkend=False, shallow=True) - len(W) * cnt(hours=NIGHT, wkend=False, shallow=True) / 6
ok(near(shw, M["e_w_shallow"]), "shallow excess")
V = R["verdict"]
ok(V["1_shape"] == (wd[11] / base > 1.3), "verdict 1")
ok(V["2_place"] == (e_day > 0 and e_w / e_day >= 0.5), "verdict 2")
ok(V["3_control"] == (0.85 <= sum(we[h] for h in W) / len(W) / basee <= 1.15), "verdict 3")
ok(V["4_depth"] == (e_w > 0 and shw / e_w > 0.5), "verdict 4")


# slope by counts x magnitudes; removal given as a set of (hour, weekend) cells
def climb(drop=frozenset(), drop_shallow_only=False):
    out = []
    for k in (0, 8):
        n, s = 0, 0.0
        for (l, y, m, h, wk, sh), v in T.items():
            if l or m < floor[y] + 10 * k:
                continue
            if (h, wk) in drop and (sh or not drop_shallow_only):
                continue
            n += v
            s += v * (m / 100 - ((floor[y] + 10 * k) / 100 - 0.005))
        out.append(math.log10(math.e) / (s / n))
    return out[1] - out[0]


c0 = climb()
ok(near(c0, M["climb"], 1e-9), "climb")
ok(abs(c0 - S18["climb"]["all"]) < 1e-9, "climb equals session 18's")
dW = frozenset((h, False) for h in W)
ok(near(climb(dW) - c0, M["d_climb"], 1e-9), "climb without W")
ok(V["5_slope"] == (abs(climb(dW) - c0) < 0.03), "verdict 5")
ok(near(climb(dW, True), R["explore"]["climb_no_w_shallow"], 1e-9), "climb without shallow W")
ok(near(climb(frozenset((h, w) for h in W for w in (False, True))), R["explore"]["climb_no_w_alldays"], 1e-9), "climb without W all days")
pl = R["explore2"]["placebo"]
for p in pl:
    blk = frozenset(((p["start"] + i) % 24, False) for i in range(6))
    ok(near(climb(blk) - c0, p["d_climb"], 1e-9), f"placebo {p['start']}")
blk = [-p["d_climb"] for p in pl if 6 <= p["start"] <= 13]
lo = math.floor(1000 * min(blk)) / 1000
ok(min(blk) > lo and lo > 0, "every block 6-13 lowers by more than the printed bound")
has_ = f"lowers it by more than {lo:.3f}, and by at most {max(blk):.3f}"
ok(sorted(p["d_climb"] for p in pl).index(M["d_climb"]) + 1 == R["explore2"]["placebo_rank_of_W"], "W's rank")

# the split at 1.5
D = R["explore2"]["dec"]
for tag, hrs in (("W", W), ("h11_12", [11, 12])):
    for dtag, sh in (("all", None), ("shallow", True), ("deep", False)):
        for side, lo, hi in (("below", None, 150), ("above", 150, None)):
            x = cnt(hours=hrs, wkend=False, shallow=sh, mlo=lo, mhi=hi) \
                - len(hrs) * cnt(hours=NIGHT, wkend=False, shallow=sh, mlo=lo, mhi=hi) / 6
            ok(near(x, D[f"{tag}_{dtag}_{side}"]), f"split {tag} {dtag} {side}")
            ci = R["explore2"]["dec_ci95"][f"{tag}_{dtag}_{side}"]
            ok(ci[0] <= ci[1], f"interval ordered {tag} {dtag} {side}")
hs = R["explore2"]["hours_split"]
ok(hs["below"] == [cnt(hours=[h], wkend=False, mhi=150) for h in range(24)], "hours below 1.5")
ok(hs["above"] == [cnt(hours=[h], wkend=False, mlo=150) for h in range(24)], "hours 1.5 and more")
ws = R["explore2"]["weekend_W"]
for side, lo, hi in (("below", None, 150), ("above", 150, None)):
    x = cnt(hours=W, wkend=True, mlo=lo, mhi=hi) - len(W) * cnt(hours=NIGHT, wkend=True, mlo=lo, mhi=hi) / 6
    ok(near(x, ws[side]), f"weekend split {side}")
for e in R["explore"]["eras"]:
    yr = (e["from"], e["to"])
    b = cnt(hours=NIGHT, wkend=False, years=yr) / 6
    ok(near(cnt(hours=W, wkend=False, years=yr) - len(W) * b, e["excess_w"]), f"era {yr}")
    ok(cnt(True, wkend=None, above=None, years=yr) == e["labelled"], f"era labelled {yr}")
for b in R["explore"]["bands"]:
    lo = round(b["lo"] * 100)
    x = cnt(hours=W, wkend=False, mlo=lo, mhi=lo + 20) - len(W) * cnt(hours=NIGHT, wkend=False, mlo=lo, mhi=lo + 20) / 6
    ok(near(x, b["excess_w"]), f"band {lo}")
    ok(cnt(True, hours=W, wkend=False, above=None, mlo=lo, mhi=lo + 20) == b["labelled_wd_w"], f"band labelled {lo}")
ok(sum(v for k, v in T.items() if k[0] and k[2] is not None and k[2] >= floor.get(k[1], 10 ** 9))
   == R["explore"]["labelled_above_eq_floor"], "labelled above floor")

# the page, whole phrases
def has(s, what):
    ok(s in PAGE, f"page: {what}")


ok("<script" not in PAGE.lower(), "page: no script")
ok("http" not in PAGE.split("<main>")[0], "page: nothing fetched in the head")
has("Filled by the quarry</h1>", "heading")
has(f"{lab[11]} fall in the single hour from 11 to 12", "806")
has(f"hold {round(100 * R['W_share_of_labelled_weekday'])} % of them", "W share")
has("The Studio counted 818 labelled events", "818")
has(f"short by <em class=\"k\">{round(-D['W_all_below'])}</em>", "deficit")
has(f"<em class=\"k\">+{round(D['W_all_above'])}</em>", "surplus")
has(f"(+{round(D['h11_12_all_above'])})", "11-13")
has(f"hold &#8722;{round(-ws['above'])} from 1.5 up", "weekend surplus")
has(f"moves the climb of b by &#8722;{-M['d_climb']:.3f}", "d climb")
has("W ranks second of 24", "rank")
has(has_, "placebo bounds")
has(f"refuted</strong> ({M['r11']:.2f};", "p1")
has(f"held</strong> ({M['r_we_w']:.2f})", "p3")
has(f"from magnitude 1.5 up alone it is {hs['above'][11] / (sum(hs['above'][h] for h in NIGHT) / 6):.2f}", "p1 aside")
has(f"({'&#8722;' if e_day < 0 else '+'}{round(abs(e_day))})", "p2 excess")
has("about 200 events", "estimate")
has(f"{R['n_all']:,}".replace(",", " ") + " events", "n_all")
for i, h in enumerate(range(24)):
    has(f"<td class=\"n\">{h:02d}</td><td class=\"n\">{lab[h]}</td>", f"hour row {h}")
ok(PAGE.count('<rect class="bar lab"') == 24, "figure 1 bars")
ok(PAGE.count("<polyline") == 2 and PAGE.count("<circle") == 48, "figure 2 lines")
ok(PAGE.count('<rect class="bar dn"') + PAGE.count('<rect class="bar hi"') == 24, "figure 3 bars")

print(f"{n_checks} checks, {len(fails)} failed")
for f in fails:
    print("  FAIL", f)
sys.exit(len(fails))
