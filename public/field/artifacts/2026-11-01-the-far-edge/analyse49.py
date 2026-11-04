"""Check 49 — is FEWS NET's *No Data* exactly the set of interior months of a series inside the
query window? Definitions and predictions: PREDICTIONS.md (committed and pushed first).

Usage: python3 -I analyse49.py <dir with full-window CC.json> <dir with probe CC.json>
Writes results49.json and data49.js beside this file. Raw files are not committed (~440 MB);
their sha256 and row counts are written to results49.json.
"""
import collections, hashlib, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FULL, PROBE = sys.argv[1], sys.argv[2]
PROBES = {"KE": ("2024-01", "2025-06"), "SO": ("2024-01", "2025-06"), "HT": ("2024-01", "2025-06"),
          "AF": ("2024-01", "2025-06"), "MG": ("2025-03", "2025-09")}
Q = "https://fdw.fews.net/api/marketpricefacts/?format=json&country_code={cc}&start_date={a}-01&end_date={b}"


def load(path):
    raw = open(path, "rb").read()
    return json.loads(raw), {"sha256": hashlib.sha256(raw).hexdigest(), "rows": None}


def months_between(a, b):
    """Months strictly between a and b (YYYY-MM)."""
    y, m = int(a[:4]), int(a[5:7])
    out = []
    while True:
        m += 1
        if m == 13:
            y, m = y + 1, 1
        s = f"{y:04d}-{m:02d}"
        if s >= b:
            return out
        out.append(s)


def interior(rows, lo="0000-00", hi="9999-99"):
    """(series -> set of interior months) from the written rows with months in [lo, hi]."""
    w = collections.defaultdict(set)
    for r in rows:
        if r["status"] != "No Data" and r["created"]:
            m = r["period_date"][:7]
            if lo <= m <= hi:
                w[r["dataseries"]].add(m)
    out = {}
    for s, ms in w.items():
        ms = sorted(ms)
        gap = {x for x in months_between(ms[0], ms[-1]) if x not in set(ms)}
        if gap:
            out[s] = gap
    return out, w


def nodata(rows):
    c = collections.Counter()
    for r in rows:
        if r["status"] == "No Data":
            c[(r["dataseries"], r["period_date"][:7])] += 1
    return c


MONTHS = ["%04d-%02d" % (2024 + i // 12, i % 12 + 1) for i in range(34)]   # 2024-01..2026-10
res = {"months": MONTHS, "files": {}, "probes": {}, "countries": []}
full = {}
T = collections.Counter()
for fn in sorted(os.listdir(FULL)):
    cc = fn[:-5]
    rows, meta = load(os.path.join(FULL, fn))
    meta["rows"] = len(rows)
    res["files"][cc] = meta
    if not rows:
        continue
    full[cc] = rows
    nd = nodata(rows)
    inner, written = interior(rows)
    inner_cells = {(s, m) for s, ms in inner.items() for m in ms}
    nd_cells = set(nd)
    # E1: every No Data between two written rows of its series
    between = sum(n for (s, m), n in nd.items()
                  if written.get(s) and min(written[s]) < m < max(written[s]))
    row = {"cc": cc, "rows": len(rows), "series": len(written),
           "nodata": sum(nd.values()), "nodata_between": between,
           "interior": len(inner_cells), "interior_filled": len(inner_cells & nd_cells),
           "nodata_not_interior": len(nd_cells - inner_cells),
           "cells_twice": sum(1 for n in nd.values() if n > 1),
           "series_with_gap": len(inner)}
    # for the page: each series as a bitmask of written months (bit i = month i from 2024-01)
    # POST HOC, descriptive (not predicted): trailing months after a series' last written month,
    # up to the country's latest written month, which no row of any status writes
    last = max(max(ms) for ms in written.values())
    lim = MONTHS.index(last)
    masks = []
    trail = 0
    for s in sorted(written, key=lambda s: (min(written[s]), max(written[s]))):
        masks.append(sum(1 << MONTHS.index(m) for m in written[s] if m in MONTHS))
        trail += lim - MONTHS.index(max(written[s]))
    row.update({"last_month": last, "trailing_unwritten": trail,
                "series_ending_early": sum(1 for ms in written.values() if max(ms) < last)})
    row["masks"] = masks
    res["countries"].append(row)
    T["trailing_unwritten"] += row["trailing_unwritten"]
    for k in ("nodata", "nodata_between", "interior", "interior_filled", "nodata_not_interior", "cells_twice"):
        T[k] += row[k]
res["totals"] = dict(T)

# E3, E4, E5: probes
for cc, (a, b) in PROBES.items():
    rows, meta = load(os.path.join(PROBE, cc + ".json"))
    meta["rows"] = len(rows)
    end = {"2025-06": "2025-06-30", "2025-09": "2025-09-30"}[b]
    meta["query"] = Q.format(cc=cc, a=a, b=end)
    inner, written = interior(full[cc], a, b)
    predicted = sum(len(v) for v in inner.values())
    nd = nodata(rows)
    observed = sum(nd.values())
    pred_cells = {(s, m) for s, ms in inner.items() for m in ms}
    # E5 key: Aggregated rows carry no id, so a written row is keyed by its content, not its id
    key = lambda r: (r["dataseries"], r["period_date"], r["status"], r["value"], r["created"], r["id"])
    full_ids = collections.Counter(key(r) for r in full[cc] if r["status"] != "No Data" and r["created"]
                                   and a <= r["period_date"][:7] <= b)
    probe_ids = collections.Counter(key(r) for r in rows if r["status"] != "No Data" and r["created"])
    meta.update({"window": [a, b], "nodata_predicted": predicted, "nodata_observed": observed,
                 "cells_predicted_and_observed": len(pred_cells & set(nd)),
                 "cells_observed_not_predicted": len(set(nd) - pred_cells),
                 "cells_predicted_not_observed": len(pred_cells - set(nd)),
                 "written_full_in_window": sum(full_ids.values()), "written_probe": sum(probe_ids.values()),
                 "written_shared": sum((full_ids & probe_ids).values()),
                 "nodata_full_in_window": sum(n for (s, m), n in nodata(full[cc]).items() if a <= m <= b)})
    meta["blanks_vanished"] = meta["nodata_full_in_window"] - observed   # need a far edge after b
    if cc == "MG":
        meta["series_7089071_nodata"] = sum(n for (s, m), n in nd.items() if s == 7089071)
    res["probes"][cc] = meta

json.dump(res, open(os.path.join(HERE, "results49.json"), "w"), indent=1)
open(os.path.join(HERE, "data49.js"), "w").write("window.D49=" + json.dumps(res, separators=(",", ":")) + ";\n")
print(json.dumps(res["totals"], indent=1))
for c in res["countries"]:
    print({k: v for k, v in c.items() if k != "masks"})
print(json.dumps(res["probes"], indent=1))
