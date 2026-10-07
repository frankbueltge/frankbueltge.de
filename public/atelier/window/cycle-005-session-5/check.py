"""Recount what the page states from committed data, rerun analysis.py, drive the page (verify.mjs). Exit 1 on failure."""
import json, subprocess, sys
bad = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: bad.append(m)
R = json.load(open("results.json")); before = open("results.json").read()
S3 = json.load(open("../cycle-005-session-3/results.json")); S4 = json.load(open("../cycle-005-session-4/results.json"))
st = R["stages"]
ok(abs(st["4"]["0"]["d1"] - S3["draw"]["all_odd_4"]["plain"]) < 1e-12 and abs(st["5"]["0"]["d1"] - S4["k"]["5"]["plain"]) < 1e-12, "first draw alone reproduces sessions 3 and 4 (1.13, 2.30)")
ok(round(1 / st["4"]["3"]["d2"], 1) == 9.3 and round(1 / st["4"]["3"]["pool"], 1) == 6.7, "second draw alone 9.3x, pooled 6.7x one population")
ok(round(1 / R["pooled"]["unclear_odd_4"]["plain"], 1) == 9.0 and round(R["bone_only"]["licensed_1_of_135_vs_unlicensed_1_of_225"], 3) == 0.087, "unclear shell counted: 9.0x; bone alone 0.087")
ok(abs(R["pooled"]["settled_3"]["discounted_b1.0"] - R["pooled"]["settled_3"]["plain"]) < 1e-3 and abs(R["pooled"]["settled_3"]["discounted_b1.2"] - R["pooled"]["settled_3"]["plain"]) < 1e-3, "clusters priced move the pooled factor by < 0.001")
ok(round(R["draw1_v_draw2"]["draw1_0of135_as_base_draw2_3of90"], 2) == 1.23, "two draws of one lot: 1.23")
sn = R["still_needed"]
ok(round(sn["300"]["zero_odd_in_extra"], 2) == 0.74 and round(sn["600"]["zero_odd_in_extra"], 1) == 2.6 and round(sn["1000"]["zero_odd_in_extra"], 1) == 8.8 and 0.16 <= min(v["same_rate_in_extra"] for k, v in sn.items() if k != "0") and max(v["same_rate_in_extra"] for v in sn.values()) <= 0.18, "turn-back table: 0.74 / 2.6 / 8.8 at zero odd; 0.16-0.18 at the observed rate")
# Fisher 4 of 135 v 3 of 225 from first principles (page quotes the Studio's 0.43)
import math
def hyp(k, K, n, N): return math.comb(K, k) * math.comb(N - K, n - k) / math.comb(N, n)
N, K, n = 360, 7, 135; po = hyp(4, K, n, N); p = sum(q for q in (hyp(k, K, n, N) for k in range(0, 8)) if q <= po + 1e-12)
ok(abs(p - 0.4322) < 1e-3, "Fisher 4/135 v 3/225 = %.4f recomputed (page: 0.43)" % p)
P5 = R["p5"]; ok(P5["p_ge3_of90_q0.03"] > .5 and P5["p_ge3_of90_q0.004"] < .01, "P5: tail 0.51 at 3 %, 0.006 at 0.4 %")
subprocess.run([sys.executable, "-I", "analysis.py"], capture_output=True, check=True)
ok(open("results.json").read() == before, "analysis.py reproduces results.json byte for byte")
subprocess.run([sys.executable, "-I", "build.py"], capture_output=True, check=True)
ok(open("index.html").read() == open("../../presentations/cycle-005/index.html").read(), "presentation page is identical to the session page")
r = subprocess.run(["node", "verify.mjs"], capture_output=True, text=True)
print(r.stdout, end=""); ok(r.returncode == 0, "browser check passes at 390 and 1100 px")
sys.exit(1 if bad else 0)
