"""Recount the numbers the page states from the committed data, rerun analysis.py, and drive the page in a browser.
The last part drives the page with node + playwright (verify.mjs). Exit 1 on failure."""
import json, subprocess, sys, re, os
bad = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: bad.append(m)
res = json.load(open("results.json")); before = open("results.json").read()
ok(res["n22"] == 22 and res["bones"] == 1 and res["majority22"] == 21, "22 records, 1 bone, majority 21")
ok(res["P1_declared_ceiling"]["correct"] == 21 and res["P1_declared_ceiling"]["bone_profile_shared_with"] == 8, "P1: ceiling 21, bone profile shared with 8")
st = res["P2_widening"]
ok(st[3]["in_sample"] == 22 and st[2]["in_sample"] == 21 and st[3]["added"][-1] == "month", "P2: 22 of 22 first at the third widening field (month)")
ok(all(s["loo_bone_verdict"] != "remains" for s in st), "P2: held-out bone never 'remains'")
ok(st[4]["records_alone_in_their_cell"] == 22, "after the fourth widening field all 22 stand alone")
b = res["P3_birds"]; g = res["P4P5_birds_grouped"]
ok((b["loo_correct"], b["loo_shuffled_p95"], b["loo_empty_cells"], b["majority"]) == (37, 31, 9, 29), "P3 numbers: 37 vs p95 31, 9 empty, majority 29")
ok((g["place"]["loo_correct"], g["place"]["shuffled_p95"], g["place"]["loo_empty_cells"], g["place"]["shuffled_runs_at_or_above_real"]) == (30, 28, 25, 74), "P4 numbers: 30, p95 28, 25 empty, 74 of 2000")
ok((g["species"]["loo_correct"], g["species"]["loo_empty_cells"]) == (28, 24), "P5 numbers: 28, 24 empty")
subprocess.run([sys.executable, "-I", "analysis.py"], capture_output=True, check=True)
ok(open("results.json").read() == before, "analysis.py reproduces results.json byte for byte (seeded)")
h = open("index.html").read()
for s in ["21 of 22", "22 of 22", "37 of 39", "<span class=\"n\">30</span>", "<span class=\"n\">28</span>", "74 of 2,000"]:
    ok(s in h, "page states " + s)
r = subprocess.run(["node", "verify.mjs"], capture_output=True, text=True)
print(r.stdout, end=""); ok(r.returncode == 0, "browser check (verify.mjs) passes" + ("" if r.returncode == 0 else " " + r.stderr[-300:]))
sys.exit(1 if bad else 0)
