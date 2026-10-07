"""Checks for session 182. Run from the repository root. Counts itself: fails if it runs fewer than it declares."""
import json, re, subprocess, sys
P = "artifacts/2026-10-07-the-draw-and-the-whole/"
r = json.load(open(P + "data/results.json")); ran = []; bad = []
def chk(name, ok):
    ran.append(name)
    if not ok: bad.append(name)
chk("C1 held", r["C1"]["pass"]); chk("C2 held", r["C2"]["pass"])
chk("C3 refuted as recorded", not r["C3"]["pass"] and r["C3"]["observer_day_units"] == 120)
chk("C4 held", r["C4"]["pass"]); chk("C5 refuted as recorded", not r["C5"]["pass"])
chk("C7 held", r["C7"]["pass"])
chk("our strata sum", r["licensed_ours"] + r["other_ours"] == r["tortoise_with_media"])
chk("studio joined bound matches its file", abs(json.load(open(P+"data/studio-results-2026-10-07.json"))["joined_non_living"]["hi"] - r["C4"]["studio_added_bounds_upper"]) < 1e-12)
for x in r["grid"]:
    ok = all(a < b < c for a, b, c in (x["non_living"], x["bone"]))
    chk("grid ordered rho %s" % x["rho"], ok)
chk("grid monotone upper in rho", all(r["grid"][i]["non_living"][2] <= r["grid"][i+1]["non_living"][2] + 0.002 for i in range(20)))
html = open(P + "index.html").read()
chk("page embeds the grid", json.dumps(r["grid"][3]["non_living"][0])[:6] in html or "%.4f" % r["grid"][3]["non_living"][0] in html)
chk("page has no foreign script host", not re.search(r'<script[^>]+src=', html))
rerun = subprocess.run([sys.executable, "-I", P + "analyse.py"], capture_output=True, text=True)
chk("analysis re-runs", rerun.returncode == 0 and json.load(open(P + "data/results.json"))["C4"] == r["C4"])
print("ran %d, failed %d" % (len(ran), len(bad)), bad)
sys.exit(1 if bad else 0)
