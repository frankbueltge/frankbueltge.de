"""Check 48 — is the Atelier's "an absence gets a date only from a return" a property of returns,
of bulk writing, or of chance? Definitions and predictions: PREDICTIONS.md (committed first).

Usage: python3 -I analyse48.py <dir with CC.json, 2024-01-01..2026-10-31> <dir with W6 files>
Writes results48.json and data48.js beside this file. Raw files are not committed (~470 MB);
their sha256 and row counts are written to results48.json.
"""
import collections, datetime as dt, hashlib, json, os, statistics, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC, W6 = sys.argv[1], sys.argv[2]
ABS = {"Not Collected", "Not Available", "Missing Historic Data"}


def d(s):
    return dt.date.fromisoformat(s[:10])


def mkey(s):
    return s[:7]


files, streams = {}, {}
absences = []  # one dict per dated absence
nodata = collections.Counter()
for fn in sorted(os.listdir(SRC)):
    if not fn.endswith(".json"):
        continue
    cc = fn[:-5]
    raw = open(os.path.join(SRC, fn), "rb").read()
    rows = json.loads(raw)
    files[cc] = {"sha256": hashlib.sha256(raw).hexdigest(), "rows": len(rows)}
    price_days = collections.defaultdict(set)
    months_on_day = collections.defaultdict(set)   # (stream, day) -> period months written
    all_days = collections.defaultdict(list)
    sub_price = set()
    early_lag = collections.defaultdict(list)       # s239 re-dating rule
    for r in rows:
        st, s = r["status"], (cc, r["source_organization"])
        if st == "Aggregated":
            continue
        if st == "No Data":
            nodata[cc] += 1
            continue
        if r["created"] is None:
            continue
        c = d(r["created"])
        all_days[s].append(c)
        months_on_day[(s, c)].add(mkey(r["period_date"]))
        if st == "Collected" and r["value"] is not None:
            price_days[s].add(c)
            sub_price.add(r["datacollection"])
            if "2024-01" <= mkey(r["period_date"]) <= "2024-06":
                p = d(r["period_date"])
                early_lag[s].append((c.year - p.year) * 12 + c.month - p.month)
    for r in rows:
        st = r["status"]
        if st in ABS and r["value"] is None and r["created"]:
            s = (cc, r["source_organization"])
            c = d(r["created"])
            absences.append({"cc": cc, "s": s, "c": c, "lag": (c - d(r["period_date"])).days,
                             "same": c in price_days[s],
                             "near1": any(abs((c - x).days) <= 1 for x in price_days[s]),
                             "bulk": len(months_on_day[(s, c)]) >= 6,
                             "subp": r["datacollection"] in sub_price})
    for s in all_days:
        lo, hi = min(all_days[s]), max(all_days[s])
        win = (hi - lo).days + 1
        med = statistics.median(early_lag[s]) if early_lag[s] else None
        streams[s] = {"window_days": win, "price_days": len(price_days[s]),
                      "chance": len(price_days[s]) / win, "redated": med is not None and med > 6,
                      "median_early_lag_months": med}

for a in absences:
    a["red"] = streams[a["s"]]["redated"]
    a["prompt"] = a["lag"] <= 92
    a["ret"] = a["prompt"] and not a["bulk"] and not a["red"]


def share(xs, key):
    xs = list(xs)
    return {"n": len(xs), "k": sum(x[key] for x in xs),
            "share": round(sum(x[key] for x in xs) / len(xs), 4) if xs else None}


N = len(absences)
res = {"absences": N, "nodata": sum(nodata.values()), "files": files}
res["W1"] = share(absences, "same")
res["W1"]["held"] = 0.985 <= res["W1"]["share"] <= 0.995
conf = [a for a in absences if a["bulk"] or a["red"]]
res["W2"] = {"bulk_or_redated": len(conf), "share": round(len(conf) / N, 4),
             "bulk": sum(a["bulk"] for a in absences), "redated": sum(a["red"] for a in absences),
             "not_prompt": sum(not a["prompt"] for a in absences),
             "held": len(conf) / N >= 0.25}
rets = [a for a in absences if a["ret"]]
res["W3"] = share(rets, "same")
res["W3"]["held"] = rets != [] and res["W3"]["share"] >= 0.95
chance = statistics.mean(streams[a["s"]]["chance"] for a in absences)
chance_ret = statistics.mean(streams[a["s"]]["chance"] for a in rets) if rets else None
res["W4"] = {"chance_all": round(chance, 4), "chance_returns": round(chance_ret, 4) if rets else None,
             "excess_points_all": round(100 * (res["W1"]["share"] - chance), 1),
             "held": chance < 0.5 and 100 * (res["W1"]["share"] - chance) >= 30}
res["W5"] = share(rets, "subp")
res["W5"]["held"] = rets != [] and res["W5"]["share"] >= 0.95

# the cells of the page: kind x same-day
cells = collections.Counter()
for a in absences:
    kind = "redated" if a["red"] else "bulk" if a["bulk"] else "late" if not a["prompt"] else "return"
    cells[(a["cc"], a["s"][1], kind, "same" if a["same"] else "near" if a["near1"] else "apart")] += 1
res["cells"] = [[cc, s, k, w, n] for (cc, s, k, w), n in sorted(cells.items())]
res["streams"] = [{"cc": s[0], "source": s[1], **v} for s, v in sorted(streams.items())]
# post hoc (named as such): chance weighted on returns, and per-kind same-day shares
res["post_hoc"] = {k: share([a for a in absences if (
    "redated" if a["red"] else "bulk" if a["bulk"] else "late" if not a["prompt"] else "return") == k], "same")
    for k in ("return", "late", "bulk", "redated")}

# W6: No Data rows and the query's end date
w6 = {}
for fn in sorted(os.listdir(W6)):
    raw = open(os.path.join(W6, fn), "rb").read()
    rows = json.loads(raw)
    nd = [r for r in rows if r["status"] == "No Data"]
    w6[fn] = {"sha256": hashlib.sha256(raw).hexdigest(), "rows": len(rows), "nodata": len(nd),
              "max_period_all": max(r["period_date"] for r in rows)[:10],
              "nodata_after_2026_10": sum(r["period_date"][:7] > "2026-10" for r in nd)}
k = sorted(w6)
two = [w6[f] for f in k if "2027" in f]
res["W6"] = {"files": w6, "held": all(x["nodata_after_2026_10"] > 0 for x in two)
             and len({x["nodata"] for x in two}) == 1}
res["scored"] = {w: res[w]["held"] for w in ("W1", "W2", "W3", "W4", "W5", "W6")}
json.dump(res, open(os.path.join(HERE, "results48.json"), "w"), indent=1, default=str)
page = {"cells": res["cells"], "scored": res["scored"],
        "W": {w: {k2: v for k2, v in res[w].items() if k2 != "files"} for w in res["scored"]},
        "post_hoc": res["post_hoc"], "N": N,
        "streams": [{k2: s[k2] for k2 in ("cc", "source", "chance", "redated", "price_days", "window_days")}
                    for s in res["streams"]]}
open(os.path.join(HERE, "data48.js"), "w").write("window.D48=" + json.dumps(page, default=str) + ";\n")
print(json.dumps({w: {k2: v for k2, v in res[w].items() if k2 != "files"} for w in res["scored"]}, indent=1, default=str))
print(json.dumps(res["post_hoc"], indent=1))
