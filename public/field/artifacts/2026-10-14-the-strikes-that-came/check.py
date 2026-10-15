"""Checks for study 12. Usage: python3 -I check.py  (reads data/ only; counts itself)."""
import csv, json
from pathlib import Path
D = Path(__file__).resolve().parent / "data"
r = json.load(open(D / "results.json"))
fb = list(csv.DictReader(open(D / "fireballs.tsv"), delimiter="\t"))
w = list(csv.DictReader(open(D / "warned.tsv"), delimiter="\t"))
ran, failed = [], []
def check(name, cond):
    ran.append(name)
    if not cond:
        failed.append(name)
check("fireballs.tsv holds every API row", len(fb) == int(r["inputs"]["fireball_api"]["count"]))
per = [x for x in fb if x["time_utc"] >= "2008-10-07"]
check("period count recomputed from tsv", len(per) == r["all"]["n"])
check("warned list has 13 rows", len(w) == 13)
check("matched count recomputed", sum(x["in_sensor_record"] == "True" for x in w) == r["all"]["warned"] == r["overlap"]["in_sensor_record"])
big = [x for x in per if float(x["impact_kt"]) >= 1]
check("size arm n recomputed", len(big) == r["size"]["ge1kt"]["n"] and len(per) - len(big) == r["size"]["lt1kt"]["n"])
check("era arms sum to period", r["era"]["2008_2017"]["n"] + r["era"]["2018_on"]["n"] == r["all"]["n"])
check("era warned sums", r["era"]["2008_2017"]["warned"] + r["era"]["2018_on"]["warned"] == r["all"]["warned"])
check("size warned sums", r["size"]["ge1kt"]["warned"] + r["size"]["lt1kt"]["warned"] == r["all"]["warned"])
check("every match within 60 min and 300 km", all(x["nearest"]["dt_min"] <= 60 and x["nearest"]["d_km"] <= 300 for x in r["warned_rows"] if x["match"]))
check("every non-match beyond 60 min", all(x["nearest"]["dt_min"] > 60 for x in r["warned_rows"] if not x["match"]))
check("list times agree with Studio", all(c["diff_min"] == 0 for c in r["list_check"]))
check("by-year sums to period", sum(y["fireballs"] for y in r["by_year"]) == r["all"]["n"] and sum(y["warned"] for y in r["by_year"]) == r["all"]["warned"])
check("top10 holds no warned strike", all(t["warned"] is None for t in r["top10"]))
check("pct recomputed", abs(r["all"]["pct"] - 100 * r["all"]["warned"] / r["all"]["n"]) < 1e-3)
check("four predictions recorded", set(r["predictions"]) == {"P1", "P2", "P3", "P4"})
# tamper: a check that must fail on corrupted input
check("tamper is caught", not (len(fb[:-1]) == int(r["inputs"]["fireball_api"]["count"])))
print(f"{len(ran)} checks ran, {len(failed)} failed"); [print("FAILED:", f) for f in failed]
assert len(ran) == 16, "the suite did not run what it counts"
raise SystemExit(1 if failed else 0)
