"""NO PUBLIC LAND: build data.js from the Field's study 65.

Reads Epoch AI's chip-owner table as the Field committed it, and the Field's results65.json, both pinned
by commit and sha256; aggregates every row by owner and quarter (median, 5th and 95th percentile, power);
asserts that every quarter's totals and owner sums equal the Field's; writes data.js. Nothing is mirrored.

Usage: python3 -I build.py <ai_chip_owners_cumulative_by_designer.csv> <results65.json>
"""
import collections
import csv
import hashlib
import json
import sys

FIELD_COMMIT = "bb56805c92435b909eb97fc1a9864cc17dd9c6a7"
CSV_SHA = "17c3381ac7af47da1901afd3a5c5bb88db26b389fd3a809cbaaa5620cde10f25"
RES_SHA = "0edf831d0cbfc2e9e0d32a60241e9b2d7f6d12f6ab71af0fe680082d529beb86"
FIVE = ["Google", "Microsoft", "Meta", "Amazon", "Oracle"]


def sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def main(csv_path, res_path):
    assert sha(csv_path) == CSV_SHA, "chip table is not the Field's file"
    assert sha(res_path) == RES_SHA, "results65.json is not the Field's file"
    res = json.load(open(res_path))
    rows = list(csv.DictReader(open(csv_path, encoding="utf-8")))
    assert len(rows) == 215, len(rows)

    agg = collections.defaultdict(lambda: collections.defaultdict(lambda: {
        "m": 0.0, "lo": 0.0, "hi": 0.0, "mw": 0.0, "rows": 0, "norange": 0, "designers": []}))
    for r in rows:
        a = agg[r["End date"]][r["Owner"]]
        m = float(r["Compute estimate in H100e (median)"])
        lo, hi = r["H100e (5th percentile)"], r["H100e (95th percentile)"]
        if lo == "" or hi == "":
            # no range given for this row: it counts at its median at both ends, and is flagged
            lo = hi = m
            a["norange"] += 1
        a["m"] += m
        a["lo"] += float(lo)
        a["hi"] += float(hi)
        a["mw"] += float(r["Power in MW (median)"] or 0)
        a["rows"] += 1
        a["designers"].append(r["Chip manufacturer"])

    quarters = []
    for fq in res["quarters"]:
        q = fq["q"]
        owners = agg[q]
        total = sum(o["m"] for o in owners.values())
        # every owner sum and the total equal the Field's, to the H100e
        assert round(total) == fq["total"], (q, total, fq["total"])
        assert sum(o["rows"] for o in owners.values()) == fq["rows"], q
        for name, o in owners.items():
            assert round(o["m"]) == fq["owner_h100e"][name], (q, name)
        top5 = 100 * sum(owners[n]["m"] for n in FIVE if n in owners) / total
        assert abs(top5 - fq["top5"]) < 0.01, (q, top5, fq["top5"])
        quarters.append({
            "q": q,
            "incomplete": fq["incomplete"],
            "rows": fq["rows"],
            "total": round(total),
            "mw": round(sum(o["mw"] for o in owners.values())),
            "top5": round(top5, 2),
            "top5_90": fq["top5_90_independent"],
            "owners": {n: {"m": round(o["m"]), "lo": round(o["lo"]), "hi": round(o["hi"]),
                           "mw": round(o["mw"], 1), "rows": o["rows"], "norange": o["norange"],
                           "designers": sorted(set(o["designers"]))}
                       for n, o in sorted(owners.items(), key=lambda kv: -kv[1]["m"])},
        })

    # what the work states on its face, asserted here
    last = quarters[-2]
    assert last["q"] == "2025-12-31" and last["rows"] == 19
    assert round(last["top5"], 1) == 68.6
    assert round(last["total"] / quarters[0]["total"]) == 334
    assert last["mw"] == 13359
    assert quarters[-1]["incomplete"] and quarters[-1]["rows"] == 8
    assert round(100 * (quarters[-1]["total"] / last["total"] - 1), 1) == res["q1_2026_total_change_pct"]
    sm = last["owners"]["China (smuggled)"]
    assert (sm["m"], sm["lo"], sm["hi"]) == (662048, 294087, 1592327)
    other = 100 * last["owners"]["Other"]["m"] / last["total"]
    assert round(other) == 16, other
    cl = res["clusters"]
    assert (cl["n"], cl["china_no_owner"], round(cl["public"], 1)) == (459, 175, 10.7)

    data = {
        "source": {
            "field_commit": FIELD_COMMIT,
            "csv_sha256": CSV_SHA,
            "results_sha256": RES_SHA,
        },
        "five": FIVE,
        "epoch_top5": res["epoch_top5"],
        "missing_q1_2026": res["q1_2026_missing_series"],
        "clusters": {k: cl[k] for k in ("n", "public", "private", "mixed", "china_no_owner")},
        "quarters": quarters,
    }
    with open("data.js", "w", encoding="utf-8") as f:
        f.write("// Built by build.py from the Field's study 65 (field-research@" + FIELD_COMMIT[:7] + "). Do not edit.\n")
        f.write("window.NPL = " + json.dumps(data, separators=(",", ":")) + ";\n")
    print("ok", len(quarters), "quarters; end 2025:", last["total"], "H100e,", last["mw"], "MW, five", last["top5"], "%")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
