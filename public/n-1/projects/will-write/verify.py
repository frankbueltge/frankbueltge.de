"""Project 8, session 1: verdicts from reading every Library-flagged promise (JOURNAL item 10). Writes verify.json and
session1_verified.json (predictions P3-P5 re-run with verified Library flags; the rest unchanged)."""
import json
rows = json.load(open("session1_rows.json"))
lib = [r for r in rows if r["promise"] and r["library"]]
# indices into `lib` (order of session1_rows.json) whose "Library" is not a copy of the promised letter or answer:
# another document placed there, a statistics section, the British Library, a past letter, a member's complaint
NOT_THE_LETTER = [0, 1, 3, 8, 10, 12, 13, 14, 16, 19, 20, 22, 24, 26, 32, 38, 51, 67, 72, 73, 78, 93, 94, 101, 104, 125, 133]
struck = {lib[i]["id"] for i in NOT_THE_LETTER}
for r in rows:
    r["library_verified"] = r["library"] and r["id"] not in struck
P = [r for r in rows if r["promise"]]
EARLY, LATE, ALL = [1980, 1985, 1990], [2015, 2020, 2025], sorted({r["year"] for r in rows})
def share(h, ys):
    p = [r for r in P if r["house"] == h and r["year"] in ys]
    return sum(r["library_verified"] for r in p) / len(p)
by = {f"{h}-{y}": sum(r["library_verified"] for r in P if r["house"] == h and r["year"] == y) for h in ("Commons", "Lords") for y in ALL}
v = {"P3": {"lib_share_lords": share("Lords", ALL), "lib_share_commons": share("Commons", ALL)},
     "P4": {"commons_lib_shares": {y: share("Commons", [y]) for y in ALL}},
     "P5": {"lords_lib_early": share("Lords", EARLY), "lords_lib_late": share("Lords", LATE)}}
v["P3"]["held"] = v["P3"]["lib_share_lords"] >= 2 * v["P3"]["lib_share_commons"]
v["P4"]["held"] = all(x < 0.10 for x in v["P4"]["commons_lib_shares"].values())
v["P5"]["held"] = v["P5"]["lords_lib_late"] >= 2 * v["P5"]["lords_lib_early"]
json.dump({"library_flags": len(lib), "struck": sorted(struck), "kept": len(lib) - len(struck), "by_house_year": by}, open("verify.json", "w"), indent=1)
json.dump({"note": "P1, P2, P6 as registered (session1.json); P3-P5 with verified Library flags", "predictions": v}, open("session1_verified.json", "w"), indent=1)
json.dump(rows, open("session1_rows.json", "w"), indent=0)
print(len(lib) - len(struck), by)
for k, x in v.items(): print(k, x)
