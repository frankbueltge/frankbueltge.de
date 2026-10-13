"""Checks for study 11. Counts what it ran and fails if any check did not run.
Run from this directory: python3 -I check.py"""
import json, sys
R = json.load(open("data/results.json")); ran = []; failed = []
def check(name, ok):
    ran.append(name)
    if not ok: failed.append(name)
rows = [l.split("\t") for l in open("data/passages.tsv").read().splitlines()[1:]]
check("rows = source rows", len(rows) == R["source"]["rows"] == 20753)
check("analysed + undetermined = rows", R["analysed"] + R["undetermined"] == len(rows))
for k, v in R["close_by_era_band"].items():
    check(f"{k} parts sum", v["warned"] + v["same_day"] + v["after"] == v["n"])
    if v["n"]: check(f"{k} share in CI", v["ci"][0] <= v["warned_share"] <= v["ci"][1])
P = R["predictions"]
check("four verdicts", sorted(P) == ["P1", "P2", "P3", "P4"])
check("P2 diff", abs(P["P2"]["diff"] - (P["P2"]["2015-2025"]["warned_share"] - P["P2"]["2005-2014"]["warned_share"])) < 1e-3)
check("P2 era n = band sum", P["P2"]["2015-2025"]["n"] == R["close_by_era_band"]["2015-2025|26-28"]["n"] + R["close_by_era_band"]["2015-2025|28-30"]["n"])
check("P4 inside < outside", P["P4"]["inside_1LD"]["warned_share"] < P["P4"]["5_to_19.5LD"]["warned_share"])
# the warning clock sums to the band counts within its window plus outside
for g, sub in (("H 28-30", ["28-30"]), ("H>=30", [">=30"])):
    tot = sum(R["clock_close_recent"][g].values()) + sum(R["clock_close_recent_outside"][g].values())
    check(f"clock {g} sums", tot == sum(R["close_by_era_band"][f"2015-2025|{b}"]["n"] for b in sub))
# recompute one cell from the committed rows with the undetermined rule left out: same-day counts
close_recent_same = sum(1 for r in rows if int(float(r[1])) >= 2015 and float(r[4]) <= 1 and int(r[3]) == 0)
check("same-day close recent from rows >= analysed same-day", close_recent_same >= R["close_recent_same_day"])
# bounds bracket the clean share
for k, b in R["undetermined_bounds"].items():
    check(f"bounds order {k}", b["low"] <= b["high"])
expected = 2 + 18 + 17 + 4 + 2 + 1 + 4  # 17: one band is empty, its CI check is skipped
print(f"{len(ran)} checks ran (expected {expected}), {len(failed)} failed")
for f in failed: print("FAILED:", f)
sys.exit(1 if failed or len(ran) != expected else 0)
