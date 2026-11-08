"""NO PUBLIC LAND: build data.js from the Field's study 65.

Reads Epoch AI's chip-owner table as the Field committed it, and the Field's results65.json, both pinned
by commit and sha256; aggregates every row by owner and quarter (median, 5th and 95th percentile, power);
asserts that every quarter's totals and owner sums equal the Field's; writes data.js. Nothing is mirrored.

Since session 236 (increment 2) it also reads the Field's copy of Epoch AI's GPU-cluster list (study 65,
data/gpu_clusters.json, pinned by sha256) and lays every cluster with an H100e estimate on the land as a stake:
in the parcel of its owner where the owner table has a row for it, and in a column off the coast where it has none
(the public and the mixed public/private clusters). It also asserts the five's share of the land as drawn (the
smuggled stock offshore), which the Field's check of 2026-11-08 found missing from the label.

Usage: python3 -I build.py <ai_chip_owners_cumulative_by_designer.csv> <results65.json> <gpu_clusters.json>
"""
import collections
import csv
import hashlib
import json
import re
import sys

FIELD_COMMIT = "bb56805c92435b909eb97fc1a9864cc17dd9c6a7"
CSV_SHA = "17c3381ac7af47da1901afd3a5c5bb88db26b389fd3a809cbaaa5620cde10f25"
RES_SHA = "0edf831d0cbfc2e9e0d32a60241e9b2d7f6d12f6ab71af0fe680082d529beb86"
CL_SHA = "1f35afaacf7b4cf8e2a325a40415d6e8f47c99e88ca0240644c5ebd647e44675"
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


def main(csv_path, res_path, cl_path):
    assert sha(cl_path) == CL_SHA, "gpu_clusters.json is not the Field's file"
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
    assert (cl["n"], cl["china_no_owner"], round(cl["public"], 1)) == (459, 175, 10.7)
    # the correction of 2026-11-08: the parcels draw the land without the smuggled stock
    assert round(last["top5_land"], 1) == 70.9
    gap = max(q["top5_land"] - q["top5"] for q in quarters)
    assert round(gap, 2) == 2.39 and quarters[13]["q"] == "2025-06-30"
    assert round(quarters[13]["top5_land"] - quarters[13]["top5"], 2) == 2.39

    # the stakes: every cluster with an H100e estimate, as the Field counted them (459)
    f = lambda v: float(v) if v not in ("", None) else 0.0
    rows_cl = [r for r in json.load(open(cl_path, encoding="utf-8"))["rows"] if f(r["H100 equivalents"])]
    assert len(rows_cl) == cl["n"]
    ct = sum(f(r["H100 equivalents"]) for r in rows_cl)
    assert round(ct) == cl["h100e"]
    qends = [q["q"] for q in quarters if not q["incomplete"]]
    stakes = []
    for r in rows_cl:
        d = r["First Operational Date"].strip()
        # a cluster stands from the first survey on or after its first operational date; undated: from the last
        qi = next((i for i, e in enumerate(qends) if d and d <= e), len(qends) - 1)
        if d and d > qends[-1]:
            qi = len(qends) - 1
        anon = r["Name"].startswith("Anonymized")
        # the Field's copy carries stray quote marks on a few names (its CSV was flattened); they are dropped here
        stakes.append({"n": "" if anon else r["Name"].replace('"', "").strip(), "o": r["Owner"].strip(), "c": r["Country"], "s": r["Sector"],
                       "h": round(f(r["H100 equivalents"])), "d": d, "k": r["Certainty"], "q": qi,
                       "home": stake_home(r)})
    # Successive phases of one site ("<site> Phase 2" after "<site> Phase 1") are read as one site growing: from
    # the survey in which a later phase stands, it replaces the earlier one on the land. Read from the names, an
    # estimate: the list's own "Superseded by" column did not survive the Field's copy (parse_clusters65.py).
    site = {}
    for m in stakes:
        g = re.match(r"^(.*?) Phase (\d+)$", m["n"])
        if g:
            site.setdefault(g.group(1), []).append((int(g.group(2)), m))
    for pre, ph in site.items():
        ph.sort(key=lambda x: x[0])
        for i, (_, m) in enumerate(ph):
            m["site"] = pre
            later = [x[1]["q"] for x in ph[i + 1:]]
            if later:
                m["until"] = min(later)  # stands until the survey before the next phase
    stakes.sort(key=lambda m: -m["h"])
    by = collections.Counter(m["home"] for m in stakes)
    hb = collections.defaultdict(float)
    for m in stakes:
        hb[m["home"]] += m["h"]
    assert round(100 * hb["public"] / ct, 1) == cl["public"] == 10.7
    assert round(100 * hb["mixed"] / ct, 1) == cl["mixed"] == 3.5
    assert sum(1 for m in stakes if m["c"] == "China" and not m["n"]) == cl["china_anonymised"] == 175
    assert sum(1 for m in stakes if not m["d"]) == 6
    # what the page states about the stakes, asserted here
    standing = lambda m, qi: m["q"] <= qi and ("until" not in m or qi < m["until"])
    staked_q4 = sum(m["h"] for m in stakes if standing(m, LAST_Q_INDEX))
    hb_site = collections.defaultdict(float)
    for m in stakes:
        if standing(m, LAST_Q_INDEX):
            hb_site[m["home"]] += m["h"]
    ct_site = sum(hb_site.values())
    xai = [m for m in stakes if m["o"] == "xAI"]
    assert (sum(1 for m in stakes if "site" in m), len(site), sum(1 for p in site.values() if len(p) > 1),
            sum(1 for m in stakes if "until" in m)) == (62, 36, 23, 26)
    assert sum(m["h"] for m in xai) == 575796 and sum(m["h"] for m in xai if standing(m, LAST_Q_INDEX)) == 275796
    land_q4 = last["total"] - last["owners"]["China (smuggled)"]["m"]
    stake_stats = {"n": len(stakes), "h100e": round(ct), "by_home": dict(by),
                   "h_by_home": {k: round(v) for k, v in hb.items()},
                   "public_n": by["public"], "mixed_n": by["mixed"],
                   "share_of_land_q4_2025": round(100 * staked_q4 / land_q4, 1),
                   "phase_rows": 62, "phase_sites": 36, "superseded_rows": 26,
                   "h100e_by_site_q4_2025": round(ct_site),
                   "public_by_site_q4_2025": round(100 * hb_site["public"] / ct_site, 1),
                   "mixed_by_site_q4_2025": round(100 * hb_site["mixed"] / ct_site, 1)}
    nst = collections.Counter(m["home"] for m in stakes if standing(m, LAST_Q_INDEX))
    assert (nst["public"], nst["mixed"], sum(nst.values())) == (132, 45, 433)
    stake_stats["standing_q4_2025"] = {"all": 433, "public": 132, "mixed": 45}
    assert (stake_stats["share_of_land_q4_2025"], round(ct_site), stake_stats["public_by_site_q4_2025"],
            stake_stats["mixed_by_site_q4_2025"]) == (6.2, 1248696, 12.6, 4.4)
    print("stakes", stake_stats)

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
        "stakes": stakes,
        "stake_stats": stake_stats,
    }
    with open("data.js", "w", encoding="utf-8") as f:
        f.write("// Built by build.py from the Field's study 65 (field-research@" + FIELD_COMMIT[:7] + "). Do not edit.\n")
        f.write("window.NPL = " + json.dumps(data, separators=(",", ":")) + ";\n")
    print("ok", len(quarters), "quarters; end 2025:", last["total"], "H100e,", last["mw"], "MW, five", last["top5"], "%")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3])
