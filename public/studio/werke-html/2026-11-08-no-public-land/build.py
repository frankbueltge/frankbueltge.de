"""NO PUBLIC LAND: build data.js from the Field's study 65.

Reads Epoch AI's chip-owner table as the Field committed it, and the Field's results65.json, both pinned
by commit and sha256; aggregates every row by owner and quarter (median, 5th and 95th percentile, power);
asserts that every quarter's totals and owner sums equal the Field's; writes data.js. Nothing is mirrored.

Since session 236 (increment 2) it also reads the Field's copy of Epoch AI's GPU-cluster list (study 65,
data/gpu_clusters.json, pinned by sha256) and lays every cluster with an H100e estimate on the land as a stake:
in the parcel of its owner where the owner table has a row for it, and in a column off the coast where it has none
(the public and the mixed public/private clusters). It also asserts the five's share of the land as drawn (the
smuggled stock offshore), which the Field's check of 2026-11-08 found missing from the label.

Since session 237 the stakes come from the Field's direct fetch of the cluster list (study 67), with the list's own
"Superseded by" column; what stood at the end of 2025 is asserted equal to the Field's count.

Usage: python3 -I build.py <ai_chip_owners_cumulative_by_designer.csv> <results65.json> <gpu_clusters_direct67.csv> <results67.json>
"""
import collections
import csv
import hashlib
import json

import sys

FIELD_COMMIT = "bb56805c92435b909eb97fc1a9864cc17dd9c6a7"
CSV_SHA = "17c3381ac7af47da1901afd3a5c5bb88db26b389fd3a809cbaaa5620cde10f25"
RES_SHA = "0edf831d0cbfc2e9e0d32a60241e9b2d7f6d12f6ab71af0fe680082d529beb86"
CL_SHA = "4cfab6db793cb4d39868812797756a712d01f8b337ee35341e53fe3c826c650f"  # study 67, gpu_clusters_direct67.csv
R67_SHA = "ae3429502d246d81936d7a5313719aad6e6e66e48530cc960e153adcf46295fe"  # study 67, results67.json
FIELD_COMMIT_67 = "759d15f9514785cfbbfff6480eb630efc92c8c4f"
# a cluster's owner, as the cluster list names it first, mapped to the owner table's row where one exists
TABLE_OWNER = {"Google": "Google", "Microsoft": "Microsoft", "Meta AI": "Meta", "Amazon": "Amazon",
               "Oracle": "Oracle", "CoreWeave": "CoreWeave", "xAI": "xAI"}
FIVE = ["Google", "Microsoft", "Meta", "Amazon", "Oracle"]
LAST_Q_INDEX = 15  # 2025-12-31, the last finished survey


def sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def stake_home(r):
    """Where a cluster stands: a parcel of the owner table, or the column the table does not have."""
    if r["Sector"] in ("Public", "Public/Private"):
        return "public" if r["Sector"] == "Public" else "mixed"
    if r["Country"] == "China":
        return "China"  # the table's "China" row counts chips sold into China
    first = r["Owner"].split(",")[0].strip()
    return TABLE_OWNER.get(first, "Other")


def main(csv_path, res_path, cl_path, r67_path):
    assert sha(cl_path) == CL_SHA, "gpu_clusters_direct67.csv is not the Field's file"
    assert sha(r67_path) == R67_SHA, "results67.json is not the Field's file"
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
        land = total - owners["China (smuggled)"]["m"] if "China (smuggled)" in owners else total
        top5_land = 100 * sum(owners[n]["m"] for n in FIVE if n in owners) / land
        assert abs(top5_land - fq["top5_ex_smuggled"]) < 0.01, (q, top5_land, fq["top5_ex_smuggled"])
        quarters.append({
            "q": q,
            "incomplete": fq["incomplete"],
            "rows": fq["rows"],
            "total": round(total),
            "mw": round(sum(o["mw"] for o in owners.values())),
            "top5": round(top5, 2),
            "top5_land": round(top5_land, 2),
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
    # the correction of 2026-11-08: the parcels draw the land without the smuggled stock
    assert round(last["top5_land"], 1) == 70.9
    gap = max(q["top5_land"] - q["top5"] for q in quarters)
    assert round(gap, 2) == 2.39 and quarters[13]["q"] == "2025-06-30"
    assert round(quarters[13]["top5_land"] - quarters[13]["top5"], 2) == 2.39

    # the stakes (since session 237): Epoch AI's GPU-cluster list as the Field fetched it directly on 2026-11-09
    # (study 67, data/gpu_clusters_direct67.csv, pinned), with the list's own "Superseded by" column. It replaces
    # session 236's reading of study 65's copy, in which that column was lost and phases were read from the names.
    r67 = json.load(open(r67_path))
    f = lambda v: float(v) if v not in ("", None) else 0.0
    rows_cl = [r for r in csv.DictReader(open(cl_path, encoding="utf-8")) if f(r["H100 equivalents"])]
    ad = r67["clusters_all_rows_direct"]
    ct = sum(f(r["H100 equivalents"]) for r in rows_cl)
    assert (len(rows_cl), round(ct)) == (ad["n"], ad["h100e"]) == (460, 1573244)
    qends = [q["q"] for q in quarters if not q["incomplete"]]
    names = {r["Name"].strip() for r in rows_cl}
    stakes, undated = [], 0
    for r in rows_cl:
        d = r["First Operational Date"].strip()
        if not d:
            undated += 1  # no date in the list: the Field leaves it out of what stood, and so does the land
            continue
        # a cluster stands from the first survey on or after its first operational date
        qi = next((i for i, e in enumerate(qends) if d <= e), len(qends))
        anon = r["Name"].startswith("Anonymized")
        nm = r["Name"].strip()
        succ = r["Superseded by"].strip()
        stakes.append({"n": "" if anon else nm, "o": r["Owner"].strip(), "c": r["Country"], "s": r["Sector"],
                       "h": round(f(r["H100 equivalents"])), "d": d, "k": r["Certainty"], "q": qi,
                       "home": stake_home(r), "_hx": f(r["H100 equivalents"]), "_id": nm, "_succ": succ if succ in names else ""})
    assert undated == r67["clusters_standing"]["no_date"] == 6
    # a cluster the list marks "Superseded by" another stands until the survey in which its successor stands;
    # a successor the list does not hold supersedes nothing (the Field's one unresolved pair, NVIDIA SATURN V)
    first_q = {}
    for m in stakes:
        first_q[m["_id"]] = min(first_q.get(m["_id"], 99), m["q"])
    nsup = 0
    for m in stakes:
        if m["_succ"]:
            m["until"] = first_q[m["_succ"]]
            m["site"] = m["_succ"]
            nsup += 1
    stakes = [m for m in stakes if m["q"] < len(qends)]  # nothing in the list begins after the end of 2025
    stakes.sort(key=lambda m: -m["h"])
    standing = lambda m, qi: m["q"] <= qi and ("until" not in m or qi < m["until"])
    st = [m for m in stakes if standing(m, LAST_Q_INDEX)]
    hst = round(sum(m["_hx"] for m in st))
    cs = r67["clusters_standing"]
    pub = 100 * sum(m["_hx"] for m in st if m["home"] == "public") / hst
    mix = 100 * sum(m["_hx"] for m in st if m["home"] == "mixed") / hst
    # what stood at the end of 2025 equals the Field's count, to the cluster and the H100e
    assert (len(st), hst, round(pub, 1), round(mix, 1)) == (cs["n"], cs["h100e"], cs["public"], cs["mixed"]) == (425, 1234247, 12.7, 4.4)
    assert nsup == 29 and cs["superseded_rows"] == 30  # the 30th is SATURN V Phase 2, whose successor is not listed
    land_q4 = last["total"] - last["owners"]["China (smuggled)"]["m"]
    nst = collections.Counter(m["home"] for m in st)
    # the list's coverage of the land, survey by survey: what the stakes cover is the list seeing, not the land changing
    cover = []
    for qi, qq in enumerate(quarters[:len(qends)]):
        lq = qq["total"] - qq["owners"].get("China (smuggled)", {"m": 0})["m"]
        cover.append(round(100 * sum(m["h"] for m in stakes if standing(m, qi)) / lq, 1))
    stake_stats = {"n": len(stakes), "undated_not_staked": undated, "superseded": nsup,
                   "standing_q4_2025": {"all": len(st), "public": nst["public"], "mixed": nst["mixed"], "h100e": hst},
                   "public_q4_2025": round(pub, 1), "mixed_q4_2025": round(mix, 1),
                   "share_of_land_q4_2025": round(100 * hst / land_q4, 1), "cover": cover}
    assert (nst["public"], nst["mixed"]) == (129, 43), nst
    assert stake_stats["share_of_land_q4_2025"] == 6.1 and cover[0] == 73.6, (stake_stats["share_of_land_q4_2025"], cover[0])
    assert sum(1 for m in st if m["c"] == "China" and not m["n"]) == 172
    for m in stakes:
        del m["_id"], m["_succ"], m["_hx"]
    print("stakes", stake_stats)

    data = {
        "source": {
            "field_commit": FIELD_COMMIT,
            "csv_sha256": CSV_SHA,
            "results_sha256": RES_SHA,
            "clusters_commit": FIELD_COMMIT_67,
            "clusters_sha256": CL_SHA,
            "results67_sha256": R67_SHA,
        },
        "five": FIVE,
        "epoch_top5": res["epoch_top5"],
        "missing_q1_2026": res["q1_2026_missing_series"],
        "quarters": quarters,
        "stakes": stakes,
        "stake_stats": stake_stats,
    }
    with open("data.js", "w", encoding="utf-8") as f:
        f.write("// Built by build.py from the Field's studies 65 and 67 (field-research@" + FIELD_COMMIT[:7] + ", @" + FIELD_COMMIT_67[:7] + "). Do not edit.\n")
        f.write("window.NPL = " + json.dumps(data, separators=(",", ":")) + ";\n")
    print("ok", len(quarters), "quarters; end 2025:", last["total"], "H100e,", last["mw"], "MW, five", last["top5"], "%")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
