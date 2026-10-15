#!/usr/bin/env python3
"""Session 20 — second route. Recomputes every point figure from the raw events with a different
construction (one pass, a dict keyed by side, day-kind and hour; floors by sorting rather than
Counter), compares with results.json, and reads each printed number back off index.html.
    python3 check.py [dir]   # dir holds results.json and index.html (default: here)"""
import json, re, sys
from pathlib import Path

HERE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent
R = json.loads((HERE / "results.json").read_text())
P = (HERE / "index.html").read_text(encoding="utf-8")
S19 = Path(__file__).resolve().parent.parent / "cycle-003-session-19"
ev = json.loads((S19 / "wall.json").read_text())["events"]
r19 = json.loads((S19 / "results.json").read_text())
n = 0
bad = []


def ok(c, what):
    global n
    n += 1
    if not c:
        bad.append(what)


# floors by a second route: modal 0.1-bin (lowest bin on ties) of each year's magnitudes
by = {}
for y, m, t, mi, wd, d in ev:
    if t == "earthquake" and m is not None:
        by.setdefault(y, []).append(m)
fl = {}
for y, ms in by.items():
    cnt = {}
    for m in ms:
        cnt[m // 10] = cnt.get(m // 10, 0) + 1
    best = max(cnt.values())
    fl[y] = 10 * sorted(k for k, v in cnt.items() if v == best)[0]
ok({str(k): v for k, v in fl.items()} == {str(k): v for k, v in r19["floors"].items()}, "floors equal session 19's")
ok(R["W"] == r19["W"] == [10, 11, 12, 13, 14, 15], "window W is session 19's")

tab = {}
for y, m, t, mi, wd, d in ev:
    if t != "earthquake" or m is None or m < fl[y]:
        continue
    key = ("below" if m < 150 else "above", "wd" if wd < 5 else "we", mi // 60)
    tab[key] = tab.get(key, 0) + 1
g = lambda s, k, h: tab.get((s, k, h), 0)
NIGHT = [22, 23, 0, 1, 2, 3]
ok(sum(tab.values()) == sum(sum(R["hours"][s][k]) for s in R["hours"] for k in ("wd", "we")), "event total")
o = {}
for s in ("below", "above"):
    bwd = sum(g(s, "wd", h) for h in NIGHT) / 6
    bwe = sum(g(s, "we", h) for h in NIGHT) / 6
    for h in range(24):
        ok(R["hours"][s]["wd"][h] == g(s, "wd", h) and R["hours"][s]["we"][h] == g(s, "we", h), f"{s} count hour {h}")
        ok(abs(R["hours"][s]["night"][h] - (g(s, "wd", h) - bwd)) < 1e-9, f"{s} night excess {h}")
        ok(abs(R["hours"][s]["weekend"][h] - (g(s, "wd", h) - bwd * g(s, "we", h) / bwe)) < 1e-9, f"{s} weekend excess {h}")
    for b in ("night", "weekend"):
        o[f"{s}_{b}_W"] = sum(R["hours"][s][b][h] for h in R["W"])
    o[f"{s}_we_W_ratio"] = sum(g(s, "we", h) for h in R["W"]) / 6 / bwe
for k, v in o.items():
    ok(abs(R["main"][k] - v) < 1e-9, f"main {k}")
ok(abs(R["main"]["net_weekend_W"] - (o["above_weekend_W"] + o["below_weekend_W"])) < 1e-9, "net weekend")
ok(abs(R["main"]["diff_above_W"] - (o["above_weekend_W"] - o["above_night_W"])) < 1e-9, "diff above")
ok(round(o["above_night_W"]) == 195 and round(o["below_night_W"]) == -134, "session 19's +195 and -134 reproduce")
for k, c in R["ci95"].items():
    ok(c[0] <= c[1], f"interval ordered {k}")
    ok(c[0] <= R["main"][k] <= c[1] or k.endswith("share_11_12"), f"point inside interval {k}")
# verdict logic restated
M, C, V = R["main"], R["ci95"], R["verdict"]
ok(V["1_above_larger"] == (M["above_weekend_W"] > 195), "verdict 1")
ok(V["2_below_smaller"] == (-134 < M["below_weekend_W"] < 0), "verdict 2")
ok(V["3_net_more"] == (M["net_weekend_W"] > 61), "verdict 3")
ok(V["4_concentration"] == (M["above_weekend_share_11_12"] > 0.5), "verdict 4")
ok(V["5_outside_quiet"] == (C["above_weekend_out"][0] <= 0 <= C["above_weekend_out"][1]), "verdict 5")
ok(list(V.values()).count(True) == 3, "three held, two refuted as the page says")
V_held = list(V.values()).count(True)
# page read-back
txt = re.sub(r"<[^>]+>", "", P).replace("&#8722;", "-").replace("&#8211;", "-").replace(" ", " ")


def s(x):
    v = round(x)
    return f"+{v:,}".replace(",", " ") if v > 0 else (f"-{-v:,}".replace(",", " ") if v < 0 else "0")


for k in ("above_night_W", "below_night_W", "above_weekend_W", "below_weekend_W", "net_night_W", "net_weekend_W", "diff_above_W"):
    ok(s(M[k]) in txt, f"page prints {k} = {s(M[k])}")
    lo, hi = C[k]
    ok(f"{s(lo)} to {s(hi)}" in txt, f"page prints interval of {k}")
for k in ("above_we_W_ratio", "below_we_W_ratio"):
    ok(f"{M[k]:.2f}" in txt, f"page prints {k}")
ok(P.count("<script") == 0 and " on" + "click" not in P, "no script element, no inline handler")
ok(P.count("<circle") == 96 and P.count("<polyline") == 4, "figures carry every mark")
ok(P.count("<tr") == (1 + 4) + (1 + 24) and P.count("<table") == 2, "tables whole")
ok(P.count("<strong>held</strong>") == V_held and P.count("<strong>refuted</strong>") == 5 - V_held, "verdicts printed as computed")
ok(P.count('<circle class="pt c0"') == 48 and P.count('<circle class="pt c2"') == 48, "each line carries its 24 x 2 points")
for need in ("PREDICTIONS.md", "What would refute this page", "exploratory"):
    ok(need in txt, f"page says {need}")
print(f"{n} checks, {len(bad)} failed")
for b in bad:
    print("FAIL", b)
sys.exit(1 if bad else 0)
