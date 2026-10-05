"""Recount every number the page states from the committed data. Stdlib only. Exit 1 on failure."""
import json, subprocess, sys, re, collections
bad = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: bad.append(m)
R = json.load(open("studio-records.json"))["records"]
C = json.load(open("studio-classes.json"))
res = json.load(open("results.json"))
ok(len(R) == 39 and len(C) == 39, "39 records, 39 classes")
ok(set(str(r["key"]) for r in R) == set(C), "class keys equal record keys")
cnt = collections.Counter(C.values())
ok(cnt["D"] + cnt["E"] == 10 and res["majority_correct"] == 29, "10 targets, majority 29 of 39")
ok(res["rules_searched"] == 98, "98 rules searched (49 rules x 2 polarities)")
ok(res["best_correct"] == 32 and res["shuffled_best_p95"] == 32 and res["shuffled_runs_at_or_above_real"] == 132, "best 32, shuffled p95 32, 132 of 2000 at or above")
ok(res["P1"] == {"G_size": 6, "G_flagged": 6, "flagged_outside_G": 4}, "P1 numbers")
ok(len(res["P4_rules_separating_A_from_D"]) == 6 and all("has_remarks" in s for s in res["P4_rules_separating_A_from_D"]), "P4: 6 separating rules, all through has_remarks")
# rerun analysis and compare
before = open("results.json").read()
subprocess.run([sys.executable, "analysis.py"], capture_output=True, check=True)
ok(open("results.json").read() == before, "analysis.py reproduces results.json byte for byte (seeded)")
h = open("index.html").read()
for s in ["32 of 39", "29 of 39", "132 of 2,000", "98</span>", "6.6 %"]:
    ok(s in h, "page states " + s)
reh = json.loads(re.search(r'<script id="d" type="application/json">(.*?)</script>', h, re.S).group(1).replace("<\\/", "</"))
ok(len(reh["rows"]) == 39, "embedded data carries 39 rows")
sys.exit(1 if bad else 0)
