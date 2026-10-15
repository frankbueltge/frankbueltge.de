"""Project 9 session 2: the verified run after the registered reading (JOURNAL2.md items 12-14). Writes verify2.json.

Corrections, each from reading:
- the 19 citations whose bulletin entry stands under Corrected Discovery Information (18) or an Editorial Notice (1) are
  re-publications too: their naming lies before the bulletin, at an unknown date (read: the entries are discovery credits and a
  trailing space, not names). They are counted with the errata as re-dated; their naming year stays unknown, so their ages are
  set aside rather than kept at the bulletin's year.
- the 3 student-flagged citations with a lag over 30 are not competition citations (a teacher's career, a baseball coach, a
  school's founding year): their occasion is struck.
Everything else as registered.
"""
import json, statistics

rows = json.load(open("session2_rows.json"))
STRUCK_OCC = {29624, 12787, 120942}
for r in rows:
    r["redated"] = r.get("section") in ("erratum", "other")
    r["naming_unknown"] = r.get("section") == "other"
    if r["n"] in STRUCK_OCC:
        r["occasion"] = r["lag"] = r["age_occ"] = None
cited = [r for r in rows if r.get("cited")]
w = [r for r in cited if r.get("wgsbn")]
liv = [r for r in cited if r["status"] == "living" and r["age1"] is not None and not r["naming_unknown"]]


def bands(key):
    b = {}
    for r in liv:
        k = r[key] // 5 * 5
        b[f"{k}-{k + 4}"] = b.get(f"{k}-{k + 4}", 0) + 1
    return dict(sorted(b.items(), key=lambda kv: int(kv[0].split("-")[0])))


stud = [r for r in cited if r["student_v"] and r["lag"] is not None]
by_year = {}
for r in stud:
    by_year.setdefault(r["naming_year"], []).append(r["lag"])
ao = {}
for r in stud:
    if r["age_occ"] is not None:
        ao[r["age_occ"]] = ao.get(r["age_occ"], 0) + 1
dead_err = [r for r in cited if r["status"] == "dead" and r["redated"] and not r["naming_unknown"]]
err_shift = [r["cite_year"] - r["naming_year"] for r in cited if r.get("section") == "erratum"]
out = {
    "wgsbn_cited": len(w),
    "redated": sum(r["redated"] for r in w), "redated_share": round(sum(r["redated"] for r in w) / len(w), 4),
    "erratum": sum(r.get("section") == "erratum" for r in w), "other_redated": sum(r["naming_unknown"] for r in w),
    "erratum_years_moved_median": statistics.median(err_shift), "erratum_years_moved_max": max(err_shift),
    "erratum_by_bulletin_year": {y: sum(1 for r in w if r.get("section") == "erratum" and r["cite_year"] == y)
                                 for y in range(2021, 2027)},
    "wgsbn_by_bulletin_year": {y: sum(1 for r in w if r["cite_year"] == y) for y in range(2021, 2027)},
    "living_with_age": len(liv),
    "moved_band": sum(1 for r in liv if r["age"] // 5 != r["age1"] // 5),
    "bands_session1": bands("age1"), "bands_naming_year": bands("age"),
    "median_age_living_naming_year": statistics.median(r["age"] for r in liv),
    "median_age_living_session1_year": statistics.median(r["age1"] for r in liv),
    "dead_redated": len(dead_err),
    "student_with_lag": len(stud),
    "lag_by_naming_year": {y: [len(v), statistics.median(v), max(v)] for y, v in sorted(by_year.items())},
    "median_lag": statistics.median(r["lag"] for r in stud),
    "median_lag_named_2015_on": statistics.median(r["lag"] for r in stud if r["naming_year"] >= 2015),
    "median_lag_named_before_2010": statistics.median(r["lag"] for r in stud if r["naming_year"] < 2010),
    "lag_ge_2": sum(1 for r in stud if r["lag"] >= 2),
    "age_at_occasion": dict(sorted(ao.items())),
    "median_age_student_named_2020_on": statistics.median(
        r["age"] for r in cited if r["student_v"] and r["status"] == "living" and r["age"] is not None
        and r["naming_year"] >= 2020),
}
out["predictions_verified"] = {
    "P7": out["erratum"] / len(w) <= 0.05,
    "P8": out["moved_band"] / out["living_with_age"] <= 0.02,
    "P9": out["median_lag"] >= 2,
    "P10": out["median_lag_named_2015_on"] > out["median_lag_named_before_2010"],
    "P11": max(ao, key=ao.get) == 17,
    "P12": out["median_age_student_named_2020_on"] >= 21,
}
json.dump(out, open("verify2.json", "w"), indent=1)
json.dump([{k: r.get(k) for k in ("n", "cited", "cite_year", "wgsbn", "section", "earlier_ref", "earlier_date", "naming_year",
                                  "redated", "naming_unknown", "status", "birth", "death", "age1", "age", "gap", "student_v",
                                  "mentor", "occasion", "lag", "age_occ")} for r in rows],
          open("rows2.json", "w"), indent=0)
print(json.dumps(out, indent=1))
