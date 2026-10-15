"""Recount what the page states from committed data, rerun analysis.py, drive the page (verify.mjs). Exit 1 on failure."""
import json, subprocess, sys
bad = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: bad.append(m)
R = json.load(open("results.json")); before = open("results.json").read()
L = json.load(open("../cycle-005-session-1/tortoise135.json"))["rows"]
odd = {r["key"]: r["reading"] for r in L if r["odd"]}
ok(len(L) == 135 and len(odd) == 5, "committed licensed file still marks 5 odd (session 2's count)")
ok(odd[2013737414] == "unclear" and odd[5828667135] == "unclear" and sum(1 for v in odd.values() if v == "remains") == 1, "the two 'unclear' keys are 2013737414 and 5828667135; one bone")
ok(len(odd) - 1 == 4, "Studio re-read: 2013737414 living, so 4 of 135 odd (mud clod 5828667135 counted odd: no living animal)")
d = R["draw"]
ok(abs(d["all_odd_4"]["plain"] - 1.131) < .001 and abs(d["all_odd_4"]["discounted"] - .917) < .001, "k = 4 ratios 1.13 / 0.92")
ok(abs(d["bone_1"]["plain"] - .137) < .001 and abs(d["bone_2_second_reader"]["plain"] - .276) < .001 and abs(d["all_odd_5_session2"]["plain"] - 2.300) < .001, "bone 0.14, second reader 0.28, session 2's 2.30 reproduced")
n = R["need"]
ok(n["all_odd_4"]["plain"]["3"] == 219 and n["all_odd_4"]["plain"]["10"] == 351 and n["all_odd_4"]["discounted"]["3"] == 261, "pooled sizes 219 / 351 / 261")
ok(n["bone_2_second_reader"]["plain"]["3"] == 883 and n["bone_1"]["plain"]["3"] is None, "second reader needs 883; bone alone not within 5,000")
ok(abs(R["checks"]["fisher_4v0_two_sided"] - 0.1222) < 1e-4, "Fisher 4 v 0 = 0.122 (the Studio's corrected figure)")
ok(abs(R["one_in_100"]["all_odd_4"] - .618) < .001, "one odd in 100 further: 0.62")
p = R["power"]["all_odd_4"]
ok(abs(p["0.03"][1]["p_one_population_3x"] - .81) < .01 and abs(p["0.004"][1]["p_strangers_3x"] - .67) < .01 and abs(p["0.004"][2]["p_strangers_3x"] - .45) < .01, "power: 0.81 / 0.67 / 0.45")
ok(all(r["p_strangers_3x"] + r["p_one_population_3x"] <= 1 + 1e-9 for q in p.values() for r in q), "no row of the power table sums above 1")
subprocess.run([sys.executable, "-I", "analysis.py"], capture_output=True, check=True)
ok(open("results.json").read() == before, "analysis.py reproduces results.json byte for byte (no randomness)")
subprocess.run([sys.executable, "-I", "build.py"], capture_output=True, check=True)
r = subprocess.run(["node", "verify.mjs"], capture_output=True, text=True)
print(r.stdout, end=""); ok(r.returncode == 0, "browser check passes at 390 and 1100 px")
sys.exit(1 if bad else 0)
