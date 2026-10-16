"""Project 9 session 3: the verified corrections from the reading rule (JOURNAL3.md item 9), and one sensitivity count.

Corrections: the 3 'other' are first namings under NEW NAMES (a running head stood nearer above); the 2 'refers' are first namings
(the word 'replace' about history, not about a citation). Sensitivity (exploratory, not registered): the age bands with every
citation whose first publication is not confirmed set aside (session 3's 'not found' and untestable, session 2's re-issued).
Usage: python3 verify3.py -> verify3.json
"""
import json, statistics
r2 = {r["n"]: r for r in json.load(open("rows2.json"))}
r3 = json.load(open("session3_rows.json"))
s3 = json.load(open("session3.json"))
for r in r3:
    if r["kind"] == "other":
        r["kind"], r["heading"] = "new", "NEW NAMES OF MINOR PLANETS"
    r["refers"] = False
tst = [r for r in r3 if r["testable"]]
found = [r for r in tst if r["kind"] != "not found"]
nf = [r for r in tst if r["kind"] == "not found"]
unconfirmed = {r["n"] for r in r3 if not r["testable"] or r["kind"] == "not found"}


def bands(excl):
    c = {}
    ages = []
    for n, x in r2.items():
        if x["status"] != "living" or x["birth"] is None or x.get("naming_unknown") or x["naming_year"] is None or n in excl:
            continue
        a = x["naming_year"] - x["birth"]
        ages.append(a)
        c[a // 5 * 5] = c.get(a // 5 * 5, 0) + 1
    return dict(sorted(c.items())), ages


ball, aall = bands(set())
bconf, aconf = bands(unconfirmed)
by_year = {}
for r in nf:
    by_year[r["batch"][:4]] = by_year.get(r["batch"][:4], 0) + 1
out = {
    "kinds_verified": {k: sum(1 for r in tst if r["kind"] == k) for k in ("new", "correction", "other", "not found")},
    "refers_verified": 0,
    "redated": 0,
    "read": {"other": [3, 3, "wrong"], "refers": [2, 2, "wrong"], "new_random_20": [20, 0, "wrong"],
             "not_found": [109, "absent from the named batch by number and by name; in none of the 177 other batches read"]},
    "not_found_by_batch_year": dict(sorted(by_year.items())),
    "not_found_student": sum(1 for r in nf if r2[r["n"]]["student_v"]),
    "not_found_living_with_age": sum(1 for r in nf if r2[r["n"]]["status"] == "living" and r2[r["n"]]["birth"] is not None),
    "P13": True, "P13_outside_share": 0.0, "P14": False, "P14_found_share": s3["P14_found_share"], "P15": True,
    "P15_refers_share": 0.0, "P16": max(ball, key=ball.get) == 15, "P17": True, "P17_moved_share": 0.0,
    "bands_all": ball, "median_all": statistics.median(aall), "n_all": len(aall),
    "sensitivity_confirmed_only": {"bands": bconf, "largest": max(bconf, key=bconf.get), "n": len(aconf),
                                   "band_15_19": bconf.get(15), "next_largest": sorted(bconf.values())[-2]},
}
json.dump(r3, open("rows3.json", "w"), indent=0)
json.dump(out, open("verify3.json", "w"), indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ("bands_all",)}, indent=1))
