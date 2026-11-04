"""Study 22 checks: the rebuilt unit and the exact test against the Atelier's own published counts,
internal sums, a second path over the Studio's events, and a planted flip that must be caught.
Usage: python3 -I check-22.py <studio outcomes.json> <atelier results.json>"""
import json, sys
from pathlib import Path
D = Path(__file__).parent / "data"
r = json.load(open(D / "heterogeneity.json"))
A = json.load(open(sys.argv[2])); S = json.load(open(sys.argv[1]))["outcomes"]
ok = []
def chk(name, cond): ok.append(bool(cond)); print(("PASS " if cond else "FAIL ") + name)

chk("unit equals the Atelier's (252, 37 came, 65.6 stated)",
    (r["unit"]["warnings"], r["unit"]["came"], r["unit"]["stated"]) == (A["warnings"], A["came"], A["stated"]))
chk("class count n >= 5 equals the Atelier's 396", r["unit"]["classes_n_ge_5"] == A["by_N"]["5"]["classes"])
for N in ("10", "20", "30"):
    chk(f"exact test reproduces the Atelier's Monte Carlo narrow_strong at N={N} ({A['by_N'][N]['narrow_strong']})",
        r["observed"][N] == A["by_N"][N]["narrow_strong"])
chk("no class says too low, as the Atelier found", r["observed"]["too_low"] == A["too_low"] == 0)
for k, v in r["heterogeneity"].items():
    chk(f"{k}: levels sum to 252 warnings and 37 came",
        sum(x["n"] for x in v["levels"].values()) == 252 and sum(x["came"] for x in v["levels"].values()) == 37)
chk("California level equals the Atelier's 14 of 15.82",
    r["heterogeneity"]["region"]["levels"]["California"]["came"] == A["california"]["came"] == 14)
chk("1,000 worlds stored per null", all(len(v) == 1000 for v in r["worlds_N20"].values()))
w = sorted(r["worlds_N20"]["H0"]); share = sum(x >= 38 for x in w) / 1000
chk("share of one-factor worlds at or above 38 recomputes", abs(share - r["H0"]["share_ge_observed_N20"]) < 1e-9)

# second path over the Studio's events: count per id at its own M, then plant one flip
rows = [l.rstrip("\n").split("\t") for l in list(open(D / "cells.tsv"))[1:]]
mine = {}
for x in rows:
    if x[1] == "1 Week" and float(x[2]) >= float(x[3]) - 1e-9:
        mine.setdefault(x[0], []).append((float(x[2]), int(x[8])))
def disagree(mine):
    bad = 0
    for i, cs in mine.items():
        ev = [e["m"] for e in S[i]["events"]]
        for M, h in cs:
            bad += (max(ev, default=-9) >= M - 1e-9) != bool(h)
    return bad
chk("second path: 0 of 979 primary cells differ from the Studio's events", disagree(mine) == 0 and sum(map(len, mine.values())) == 979)
i0 = next(iter(mine)); planted = dict(mine); planted[i0] = [(M, 1 - h) for M, h in mine[i0]]
chk("a planted flip of one mainshock's cells is caught", disagree(planted) == len(mine[i0]) > 0)
print(f"{sum(ok)} of {len(ok)} passed")
sys.exit(0 if all(ok) else 1)
