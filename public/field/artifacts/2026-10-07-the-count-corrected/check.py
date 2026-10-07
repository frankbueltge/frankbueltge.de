"""Checks for session 183. Run from the repository root: python3 -I artifacts/2026-10-07-the-count-corrected/check.py"""
import json, re
A = "artifacts/2026-10-07-the-count-corrected/"
r = json.load(open(A + "data/results.json")); html = open(A + "index.html").read(); pre = open(A + "PREREGISTRATION.md").read()
ok = []
def c(name, cond): ok.append((name, bool(cond))); print(("PASS " if cond else "FAIL ") + name)
for p in ("P1", "P4", "P5", "P6", "P7"): c(p + " held", r[p]["pass"])
c("P3 recorded as refuted", not r["P3"]["pass"] and "P3 refuted as worded" in pre)
c("P2 recorded as not blind", "NOT blind" in json.dumps(r["P2"]) and "was worded 'blind' and was not" in pre)
ups = [v["rho0.05"]["non_living"][2] for v in r["scenarios"].values()]
c("page claim: upper end 2.0-2.2 % in every call at rho 0.05", all(0.0200 <= u <= 0.0220 for u in ups))
c("old interval matches session 182 results.json", r["P3"]["old"] == json.load(open("artifacts/2026-10-07-the-draw-and-the-whole/data/results.json"))["joined"]["rho=0.05"]["non_living"])
c("shift quoted on page (-0.04, -0.07)", round(r["P4"]["d_lo"]*100, 2) == -0.04 and round(r["P4"]["d_hi"]*100, 2) == -0.07)
c("page quotes Fisher 0.122", "0.122" in html and abs(r["P6"]["fisher_4_v_0"] - .122) < .001)
c("no external script", not re.search(r"<script[^>]+src=", html))
c("studio inputs committed", all(__import__("os").path.exists(A + "data/" + f) for f in ("studio-two-that-turn-data.json", "studio-two-that-turn-results.json")))
print(sum(x for _, x in ok), "of", len(ok), "passed"); raise SystemExit(0 if all(x for _, x in ok) else 1)
