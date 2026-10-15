"""Session 190 analysis. Usage: python3 -I analyse.py <atelier_results.json>
Reads data/coding.tsv (blind recoding) and data/markets.json (first-hand fetch);
writes data/results.json. Predictions: PREREGISTRATION.md."""
import json, os, random, statistics, sys
from collections import Counter
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
D = lambda *p: os.path.join(HERE, "data", *p)
atelier = {c["id"]: c for c in json.load(open(sys.argv[1]))["cells"]}
mine = {}
for line in open(D("coding.tsv")):
    if line.startswith("#") or line.startswith("id\t"):
        continue
    i, cls, note = line.rstrip("\n").split("\t")
    mine[i] = (cls, note)
mk = {m["id"]: m for m in json.load(open(D("markets.json")))["markets"]}
ids = list(atelier)
assert set(ids) == set(mine) == set(mk) and len(ids) == 62

# (A) agreement
K = ["machine", "threshold", "unnamed", "norule"]
pairs = [(atelier[i]["cls"], mine[i][0]) for i in ids]
agree = sum(a == b for a, b in pairs)
po = agree / 62
ca, cm = Counter(a for a, _ in pairs), Counter(b for _, b in pairs)
pe = sum(ca[k] * cm[k] for k in K) / 62 ** 2
kappa = (po - pe) / (1 - pe)
disagree = [{"id": i, "q": mk[i]["question"], "atelier": atelier[i]["cls"],
             "atelier_by_reference": atelier[i].get("by_reference"),
             "field": mine[i][0], "field_note": mine[i][1]}
            for i in ids if atelier[i]["cls"] != mine[i][0]]

# (B) prices, open markets
def year(ms):
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).year
open_ = [i for i in ids if not mk[i]["isResolved"]]
price = {i: mk[i]["probability"] for i in open_}
med_open = statistics.median(price.values())
grp_m = [price[i] for i in open_ if atelier[i]["cls"] == "machine"]
grp_o = [price[i] for i in open_ if atelier[i]["cls"] != "machine"]
obs = statistics.median(grp_m) - statistics.median(grp_o)
rng = random.Random(190)
pool = grp_m + grp_o
hits = 0
for _ in range(10000):
    rng.shuffle(pool)
    d = statistics.median(pool[:len(grp_m)]) - statistics.median(pool[len(grp_m):])
    hits += abs(d) >= abs(obs) - 1e-12
p_perm = (hits + 1) / 10001

def ranks(v):
    o = sorted(range(len(v)), key=lambda k: v[k]); r = [0.0] * len(v); k = 0
    while k < len(o):
        j = k
        while j + 1 < len(o) and v[o[j + 1]] == v[o[k]]:
            j += 1
        for t in range(k, j + 1):
            r[o[t]] = (k + j) / 2 + 1
        k = j + 1
    return r
def spearman(x, y):
    rx, ry = ranks(x), ranks(y)
    mx, my = statistics.mean(rx), statistics.mean(ry)
    num = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    return num / (sum((a - mx) ** 2 for a in rx) * sum((b - my) ** 2 for b in ry)) ** 0.5
yrs = [year(mk[i]["closeTime"]) for i in open_]
rho = spearman(yrs, [price[i] for i in open_])

# coherence: P(by t) must not fall as t grows; count strictly violating pairs
viol, comparable = 0, 0
for a in open_:
    for b in open_:
        ya, yb = year(mk[a]["closeTime"]), year(mk[b]["closeTime"])
        if ya < yb:
            comparable += 1
            viol += price[a] > price[b]

table = sorted(({"id": i, "q": mk[i]["question"], "close_year": year(mk[i]["closeTime"]),
                 "price": price[i], "bettors": mk[i]["uniqueBettorCount"],
                 "atelier": atelier[i]["cls"], "field": mine[i][0],
                 "atelier_price_10_08": atelier[i]["price"]} for i in open_),
               key=lambda r: (r["close_year"], r["price"]))
xpt = {"source": "Karger et al., Forecasting Research Institute Working Paper #1 (2023), sha256 6dcb14eb…c0c0, read first-hand 2026-10-08",
       "event": "AI causes human extinction or reduces global population below 5,000",
       "by_2100_stage4": {"superforecasters": 0.0038, "experts_all": 0.03, "pdf_page": 104},
       "by_2030_stage4": {"superforecasters": 0.000001, "domain_experts": 0.0002, "pdf_page": "270-271"}}
near = lambda y0, y1: [r for r in table if y0 <= r["close_year"] <= y1]
res = {
    "n": 62, "open": len(open_),
    "A": {"agree": agree, "share": po, "kappa": kappa, "atelier_counts": dict(ca),
          "field_counts": dict(cm), "disagreements": disagree},
    "B": {"median_open_price": med_open, "machine": {"n": len(grp_m), "median": statistics.median(grp_m)},
          "other": {"n": len(grp_o), "median": statistics.median(grp_o)},
          "diff_medians": obs, "p_perm_two_sided": p_perm, "perms": 10000, "seed": 190,
          "spearman_close_year_price": rho, "coherence": {"comparable_pairs": comparable, "violating": viol},
          "bettors_median": statistics.median(r["bettors"] for r in table)},
    "xpt": xpt,
    "near_2030": [(r["close_year"], r["price"]) for r in near(2026, 2033)],
    "near_2100": [(r["close_year"], r["price"]) for r in near(2090, 2110)],
    "open_table": table,
}
# EXPLORATORY (not registered): the rule classes cluster by horizon, so compare machine markets
# with what the other open markets' horizon curve predicts. Horizon = the year in the question;
# "in the next 5 years" = year created + 5. Fit logit(price) on log(horizon - 2025), others only.
import math, re
def horizon(i):
    m = re.search(r"(\d{4})", mk[i]["question"])
    return int(m.group(1)) if m else year(mk[i]["createdTime"]) + 5
logit = lambda p: math.log(p / (1 - p))
xs = {i: math.log(horizon(i) - 2025) for i in open_}
oth = [i for i in open_ if atelier[i]["cls"] != "machine"]
mx = statistics.mean(xs[i] for i in oth); my = statistics.mean(logit(price[i]) for i in oth)
b = sum((xs[i] - mx) * (logit(price[i]) - my) for i in oth) / sum((xs[i] - mx) ** 2 for i in oth)
a0 = my - b * mx
resid = lambda i: logit(price[i]) - (a0 + b * xs[i])
rm = [resid(i) for i in open_ if atelier[i]["cls"] == "machine"]
ro = [resid(i) for i in oth]
def perm_all():
    # refit on all 32 open markets (label-blind), then permute labels over residuals
    allx = [xs[i] for i in open_]; ally = [logit(price[i]) for i in open_]
    ax, ay = statistics.mean(allx), statistics.mean(ally)
    bb = sum((x - ax) * (y - ay) for x, y in zip(allx, ally)) / sum((x - ax) ** 2 for x in allx)
    rr = {i: logit(price[i]) - (ay + bb * (xs[i] - ax)) for i in open_}
    gm = [rr[i] for i in open_ if atelier[i]["cls"] == "machine"]
    go = [rr[i] for i in open_ if atelier[i]["cls"] != "machine"]
    ob = statistics.median(gm) - statistics.median(go)
    pool2 = gm + go; r2 = random.Random(1900); h = 0
    for _ in range(10000):
        r2.shuffle(pool2)
        h += abs(statistics.median(pool2[:len(gm)]) - statistics.median(pool2[len(gm):])) >= abs(ob) - 1e-12
    return {"diff_median_residual": ob, "p_two_sided": (h + 1) / 10001, "machine_above": sum(r > 0 for r in gm),
            "others_above": sum(r > 0 for r in go), "n_machine": len(gm), "n_other": len(go)}
res["exploratory_horizon_adjusted"] = {
    "fit": {"intercept": a0, "slope_per_log_year": b, "n_fit": len(oth)},
    "machine_residuals_logit": sorted(rm), "median_machine_residual": statistics.median(rm),
    "median_other_residual": statistics.median(ro),
    "machine_above_curve": sum(r > 0 for r in rm), "machine_n": len(rm),
    "others_above_curve": sum(r > 0 for r in ro),
    "perm_on_all_fit": perm_all(),
    "horizon_spearman_title_year": spearman([horizon(i) for i in open_], [price[i] for i in open_]),
}
P = {"P1": po >= 0.8 and kappa >= 0.6, "P2": 8 <= cm["machine"] <= 12, "P3": med_open > 0.03,
     "P4": p_perm > 0.05, "P5": rho < 0.3}
res["predictions"] = P
json.dump(res, open(D("results.json"), "w"), indent=1, ensure_ascii=False)
print(json.dumps({k: v for k, v in res.items() if k not in ("open_table",)}, indent=1, ensure_ascii=False)[:5000])
