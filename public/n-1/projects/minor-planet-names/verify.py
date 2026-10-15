"""Project 9 session 1: the verified run after the reading check (JOURNAL item 9).

Correction made: a citation honouring a teacher who mentored a finalist ("mentor") is not a student citation.
Everything else as registered. Also the exploratory counts the journal names. Writes verify.json.
"""
import json, os, re, statistics, sys
from session1 import clean
cache = sys.argv[1]
rows = json.load(open("session1_rows.json"))
FAMILY = re.compile(r"\b(daughter|son|grandson|granddaughter|grand-daughter|grandchild|niece|nephew|great-grandson|great-granddaughter)\b", re.I)
for r in rows:
    if not r.get("cited"):
        continue
    t = clean(json.load(open(os.path.join(cache, f"{r['n']}.json")))["discovery"]["citation"])
    r["mentor"] = bool(re.search(r"mentor", t, re.I))
    r["student_v"] = r["student"] and not r["mentor"]
    r["family"] = bool(FAMILY.search(t[:200]))
cited = [r for r in rows if r.get("cited")]
liv = [r for r in cited if r["status"] == "living" and r["age"] is not None]
ages = [r["age"] for r in liv]
def share(lo, hi, key):
    c = [r for r in cited if r["cite_year"] and lo <= r["cite_year"] <= hi]
    s = sum(r[key] for r in c)
    return [s, len(c), round(s / len(c), 4)]
out = {
    "mentor_citations": sum(r["mentor"] for r in cited),
    "student_flag_registered": sum(r["student"] for r in cited),
    "student_verified": sum(r["student_v"] for r in cited),
    "median_age_nonstudent_living_v": statistics.median([r["age"] for r in liv if not r["student_v"]]),
    "student_2002_2012_v": share(2002, 2012, "student_v"),
    "student_2020_on_v": share(2020, 2100, "student_v"),
    "living_under_18": sum(a < 18 for a in ages),
    "living_under_18_student_v": sum(r["age"] < 18 and r["student_v"] for r in liv),
    "living_under_18_family_word": sum(r["age"] < 18 and r["family"] and not r["student_v"] for r in liv),
    "living_80_or_over": sum(a >= 80 for a in ages),
    "dead_gap_le_5": sum(1 for r in cited if r["status"] == "dead" and r["gap"] is not None and r["gap"] <= 5),
    "dead_with_gap": sum(1 for r in cited if r["status"] == "dead" and r["gap"] is not None),
    "gap_quartiles": statistics.quantiles([r["gap"] for r in cited if r["status"] == "dead" and r["gap"] is not None], n=4),
}
out["predictions_verified"] = {
    "P3": out["median_age_nonstudent_living_v"] >= 55,
    "P5": out["student_2002_2012_v"][2] >= 0.25 and out["student_2020_on_v"][2] < 0.10,
}
json.dump(out, open("verify.json", "w"), indent=1)
json.dump([{k: r.get(k) for k in ("n", "fetched", "cited", "cite_year", "cref_kind", "disc_year", "status", "birth", "death",
             "age", "gap", "student", "mentor", "student_v", "family", "len")} for r in rows],
          open("rows.json", "w"), indent=0)
print(json.dumps(out, indent=1))
