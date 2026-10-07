"""Recount the numbers the page states from the committed data, rerun analysis.py, drive the page (verify.mjs). Exit 1 on failure."""
import json, subprocess, sys, re, collections, math
bad = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: bad.append(m)
R = json.load(open("results.json")); before = open("results.json").read()
S = json.load(open("tortoise135.json"))["rows"]; U = json.load(open("unseen.json"))
ok(len(S) == 135 and sum(r["odd"] for r in S) == 5 and len({r["obs"] for r in S}) == 44, "135 frames, 5 odd, 44 observers")
odd_obs = {r["obs"] for r in S if r["odd"]}; ok(len(odd_obs) == 5, "the 5 odd frames sit with 5 different observers")
ok(U["n"] == 1397 and len({0}) == 1 and U["licensed_not_read"] == 3, "1,397 unseen, 3 licensed unread")
sz = collections.Counter(r["obs"] for r in S).values(); b = sum(sz) / 44; bs = sum(x * x for x in sz) / 135
ok(abs(b - 3.0682) < 1e-3 and abs(bs - 6.0519) < 1e-3, "b-bar 3.07, b* 6.05 recomputed from rows")
usz = collections.Counter(U["rows"][i]["obs"] for i in range(U["n"])); ok(len(usz) == 777 and max(usz.values()) == 82, "777 unseen observers, largest holds 82")
ok(not set(r["obs"] for r in S) & set(usz), "no observer in both groups")
ok(round(135 / (1 + (bs - 1) * .05), 1) == 107.8 and round(135 / (1 + (b - 1) * .05), 1) == 122.3, "n_eff at rho 0.05: 107.8 (b*), 122.3 (b-bar)")
P = R["predictions"]
ok(P["P1"]["bstar_ge_6"] and not P["P1"]["bstar_ge_2x_bbar"] and not P["P1"]["differ_ge_20pct"], "P1 as scored: b*>=6 held; 2x and 20% refuted")
ok(P["P2"]["lower_below_wilson"] and not P["P2"]["upper_ge_8.4"] and not P["P2"]["R1_fired"], "P2 as scored: lower held, upper refuted, R1 not fired")
ok(P["P3"]["year_p_gt_05"] and P["P4"]["bbar_lt_2"] and P["P4"]["bstar_ge_1.5x"], "P3, P4 held")
ok(P["P5"]["frames_within_1.3"] and not P["P5"]["observers_wider_than_1.3"], "P5: first part held, second refuted")
subprocess.run([sys.executable, "-I", "analysis.py"], capture_output=True, check=True)
ok(open("results.json").read() == before, "analysis.py reproduces results.json byte for byte (seeded)")
subprocess.run([sys.executable, "-I", "build.py"], capture_output=True, check=True)
h = open("index.html").read()
for s in ["135</span> licensed", "<span class=\"n\">44</span>", "<span class=\"n\">1,397</span>", "<span class=\"n\">777</span>", "<span class=\"n\">82</span>", "0.8 – 7.3 %", "9.43", "1.80", "6.05", "108"]:
    ok(s in h, "page states " + s)
r = subprocess.run(["node", "verify.mjs"], capture_output=True, text=True)
print(r.stdout, end=""); ok(r.returncode == 0, "browser check (verify.mjs) passes" + ("" if r.returncode == 0 else " " + r.stderr[-300:]))
sys.exit(1 if bad else 0)
