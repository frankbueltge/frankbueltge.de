"""Coda III of The Wolf's Ledger (2026-10-22, third session, after the presentation): set one tornado aside.

Material: the Field's study 36 (s221, 2026-10-22), results36.json at field-research main 2586171, sha256 asserted
below; offered to this practice in its bulletin of that day. Study 36 refits study 35's ratio (injured after a
county's run of three or more empty warnings, against right after a hit) with Joplin (SPC om 296616), Tuscaloosa
(om 314625) or both set aside, and with each of the 30 most injurious warned tornadoes left out in turn.

What this script does: for each of those fits, the estimate coda I made from study 35 (how many times the record
would be needed before the 95 % interval excluded each of plate V's villages, if the point stayed where it is; the
standard error of the log ratio falls with the square root of the sample) and which village would leave first.
Plate V's learning and habit prices part at their geometric mean: a point below it excludes habit first, above it
learning first. A check, not a test: no predictions were written, and the 30 points were seen before the script.

Usage: python3 -I aside.py FIELD_RESULTS36_JSON   (reads coda.json here; writes aside.json and aside.js here)
"""
import json, sys, math, hashlib
from pathlib import Path

HERE = Path(__file__).parent
SHA36 = "a88d620a88249a6061662d34d968bfd4066ffe68a5f0bba879c23fe6a53aad12"
raw = Path(sys.argv[1]).read_bytes()
assert hashlib.sha256(raw).hexdigest() == SHA36
R, C = json.loads(raw), json.loads((HERE / "coda.json").read_text())
V = C["villages"]

# study 36's "all" fit is study 35's, which coda I read
a = R["sets"]["all"]["inj"]
assert (a["irr"], a["lo"], a["hi"]) == (C["field"]["irr"], C["field"]["lo"], C["field"]["hi"])

cross = math.sqrt(V["learning"] * V["habit"])

def est(f):
    lp = math.log(f["irr"]); se = (math.log(f["hi"]) - math.log(f["lo"])) / (2 * 1.96)
    inside = all(f["lo"] <= p <= f["hi"] for p in V.values())
    m = {k: ((1.96 * se) / abs(lp - math.log(p))) ** 2 for k, p in V.items()}
    first = min(("learning", "habit"), key=lambda k: m[k])
    return {"irr": f["irr"], "lo": f["lo"], "hi": f["hi"], "se_log": se, "all_inside": inside,
            "multiple_to_exclude": m, "first_of_two": first}

LAB = {"all": "nothing: the record as it is", "without_joplin": "Joplin, MO, 2011-05-22",
       "without_tuscaloosa": "Tuscaloosa, AL, 2011-04-27", "without_both": "both"}
sets = [dict(key=k, label=LAB[k], n=R["sets"][k]["n"], **est(R["sets"][k]["inj"])) for k in LAB]
loo = [dict(om=x["om"], date=x["date"], st=x["st"], inj=x["inj"], fat=x["fat"], cat=x["cat"], **est(x["inj_run3"]))
       for x in R["loo"]]
assert len(loo) == 30 and all(x["all_inside"] for x in loo) and all(s["all_inside"] for s in sets)

out = {
    "field": {"commit": "2586171", "path": "artifacts/cycle-009/after-the-empty-warnings/data/results36.json",
              "sha256": SHA36, "study": 36, "loo_range": [min(x["irr"] for x in loo), max(x["irr"] for x in loo)]},
    "villages": V, "crossing": cross, "sets": sets, "loo": loo,
    "loo_learning_first": [x["om"] for x in loo if x["first_of_two"] == "learning"],
}
(HERE / "aside.json").write_text(json.dumps(out, indent=1) + "\n")
(HERE / "aside.js").write_text("window.ASIDE=" + json.dumps(out, separators=(",", ":")) + ";\n")
print("crossing %.3f" % cross)
for s in sets + loo:
    print(s.get("key") or (s["om"], s["date"], s["st"]), s["irr"], {k: round(v, 1) for k, v in s["multiple_to_exclude"].items()}, s["first_of_two"])
