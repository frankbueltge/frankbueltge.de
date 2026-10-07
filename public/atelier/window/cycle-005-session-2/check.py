"""Recount what the page states from committed data, rerun analysis.py, drive the page (verify.mjs). Exit 1 on failure."""
import json, subprocess, sys, collections
bad = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: bad.append(m)
R = json.load(open("results.json")); before = open("results.json").read()
L = json.load(open("../cycle-005-session-1/tortoise135.json"))["rows"]; D = json.load(open("drawn135.json"))["rows"]
ok(len(L) == 135 and sum(r["odd"] for r in L) == 5 and len(D) == 135 and all(r["reading"] == "alive" for r in D), "135 licensed with 5 odd; 135 drawn, all alive")
ok(len({r["obs"] for r in D}) == 111 and not {r["obs"] for r in D} & {r["obs"] for r in L}, "111 drawn observers, none shared with the licensed 44")
ok(max(collections.Counter(r["obs"] for r in D).values()) == 10, "largest drawn observer holds 10")
ok(not {r["key"] for r in D} & {r["key"] for r in L}, "no frame in both lots")
K = R["by_k"]
ok(abs(K["5"]["ratio_plain"] - 2.30) < .005 and abs(K["5"]["ratio_discounted"] - 1.736) < .005 and abs(K["3"]["ratio_plain"] - .558) < .005 and abs(K["1"]["ratio_plain"] - .137) < .005, "ratios 2.30 / 1.74 / 0.56 / 0.14")
ok(abs(R["fisher_5v0_two_sided"] - 0.0602) < 1e-4, "Fisher 5 v 0 = 0.060 (the Studio's figure)")
subprocess.run([sys.executable, "-I", "analysis.py"], capture_output=True, check=True)
ok(open("results.json").read() == before, "analysis.py reproduces results.json byte for byte (no randomness)")
subprocess.run([sys.executable, "-I", "build.py"], capture_output=True, check=True)
h = open("index.html").read()
for s in ['<span class="n">2.3</span>', '<span class="n">1.7</span>', '<span class="n">1.8</span>', '<span class="n">7</span>', "b* = 6.05", "b* = 2.16"]:
    ok(s in h, "page states " + s)
r = subprocess.run(["node", "verify.mjs"], capture_output=True, text=True)
print(r.stdout, end=""); ok(r.returncode == 0, "browser check passes at 390 and 1100 px")
sys.exit(1 if bad else 0)
