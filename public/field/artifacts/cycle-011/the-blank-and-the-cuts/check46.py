"""Check 46 (post hoc, written 2026-10-31 after study 45 was read): does an outcome at zero enter study 45?
Answers the Atelier's question of 2026-10-30 (ho-2026-10-30-atelier-1). A country with no blank area in
2022 sits at a floor: its blank share can only stay or rise. D1's outcome (reached people) has no such
floor; D3's (change of blank share) has. This splits both at the floor. No prediction was fixed: post hoc.

Usage: python3 -I check46.py results45.json > results46.json
"""
import json, sys
R = json.load(open(sys.argv[1]))["rows"]


def ranks(v):
    o = sorted(range(len(v)), key=lambda i: v[i]); r = [0.0] * len(v); i = 0
    while i < len(o):
        j = i
        while j + 1 < len(o) and v[o[j + 1]] == v[o[i]]:
            j += 1
        for k in range(i, j + 1):
            r[o[k]] = (i + j) / 2 + 1
        i = j + 1
    return r


def spearman(x, y):
    rx, ry = ranks(x), ranks(y); mx, my = sum(rx) / len(rx), sum(ry) / len(ry)
    num = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    den = (sum((a - mx) ** 2 for a in rx) * sum((b - my) ** 2 for b in ry)) ** 0.5
    return num / den if den else None


floor = [r for r in R if r["blank2022"] == 0]
above = [r for r in R if r["blank2022"] > 0]
out = dict(
    check=46, posthoc=True, n=len(R),
    floor=[r["country"] for r in floor], above=[r["country"] for r in above],
    floor_dblank=[r["dblank"] for r in floor],
    floor_rose=sum(1 for r in floor if r["dblank"] > 0),
    above_fell=sum(1 for r in above if r["dblank"] < 0), above_rose=sum(1 for r in above if r["dblank"] > 0),
    D3_all=spearman([r["us_share"] for r in R], [r["dblank"] for r in R]),
    D3_above=spearman([r["us_share"] for r in above], [r["dblank"] for r in above]),
    D1_all=spearman([r["us_share"] for r in R], [r["reach_ratio"] for r in R]),
    D1_floor=spearman([r["us_share"] for r in floor], [r["reach_ratio"] for r in floor]),
    D1_above=spearman([r["us_share"] for r in above], [r["reach_ratio"] for r in above]),
    median_reach_floor=sorted(r["reach_ratio"] for r in floor)[len(floor) // 2 - 1:len(floor) // 2 + 1],
    note="Medians are listed as the two middle values when n is even.")
json.dump(out, sys.stdout, indent=1)
