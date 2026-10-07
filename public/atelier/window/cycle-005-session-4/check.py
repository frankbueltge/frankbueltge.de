"""Recount what the page states from committed data, rerun analysis.py, drive the page (verify.mjs). Exit 1 on failure."""
import json, subprocess, sys
bad = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: bad.append(m)
R = json.load(open("results.json")); before = open("results.json").read(); K = R["k"]
S3 = json.load(open("../cycle-005-session-3/results.json"))
ok(abs(K["4"]["plain"] - S3["draw"]["all_odd_4"]["plain"]) < 1e-12 and K["4"]["need3"] == S3["need"]["all_odd_4"]["plain"]["3"], "k = 4 reproduces session 3 exactly")
ok(abs(K["5"]["plain"] - S3["draw"]["all_odd_5_session2"]["plain"]) < 1e-12 and abs(K["1"]["plain"] - S3["draw"]["bone_1"]["plain"]) < 1e-12 and K["2"]["need3"] == 883, "k = 5, 1, 2 reproduce session 3")
ok(abs(K["3"]["plain"] - .558) < .001 and K["3"]["need3"] == 368 and K["3"]["need10"] == 630 and K["3"]["need3_d"] == 463, "k = 3: 0.56, 368, 630, 463 (new)")
ok(K["3"]["need3"] - K["4"]["need3"] == 149 and K["4"]["need3"] - K["5"]["need3"] == 67 and K["5"]["need3"] - K["6"]["need3"] == 17 and K["2"]["need3"] - K["3"]["need3"] == 515, "steps 515 / 149 / 67 / 17 as the page states")
ok(K["1"]["need3"] is None and K["2"]["need10"] == 1755 and 1755 > 135 + 1255, "bone alone never; second reader's 10x needs 1,755 > 1,390 pooled available")
F = R["field"]
ok(F["mud none, B15 alive"]["plain"] == F["mud alive, B15 none"]["plain"] and F["mud none, B15 alive"]["interval"] == F["mud alive, B15 none"]["interval"], "the two count-4 calls are identical (P4)")
lo = [v["interval"][0] for v in F.values()]; hi = [v["interval"][2] for v in F.values()]
ok(round(min(lo) * 100, 2) == 0.09 and round(max(lo) * 100, 2) == 0.18 and round(min(hi) * 100, 1) == 2.0 and round(max(hi) * 100, 1) == 2.2, "Field lower 0.09-0.18 %, upper 2.0-2.2 % as the page states")
subprocess.run([sys.executable, "-I", "analysis.py"], capture_output=True, check=True)
ok(open("results.json").read() == before, "analysis.py reproduces results.json byte for byte")
subprocess.run([sys.executable, "-I", "build.py"], capture_output=True, check=True)
r = subprocess.run(["node", "verify.mjs"], capture_output=True, text=True)
print(r.stdout, end=""); ok(r.returncode == 0, "browser check passes at 390 and 1100 px")
sys.exit(1 if bad else 0)
