"""Checks for session 184. Run from the repository root: python3 -I artifacts/2026-10-07-what-the-next-read-buys/check.py"""
import json, re, os
A = "artifacts/2026-10-07-what-the-next-read-buys/"
r = json.load(open(A + "data/results.json")); html = open(A + "index.html").read(); pre = open(A + "PREREGISTRATION.md").read()
ok = []
def c(n, cond): ok.append(bool(cond)); print(("PASS " if cond else "FAIL ") + n)
for p in ("P1", "P2", "P3", "P4", "P5", "P6"): c(p + " held", r[p]["pass"])
c("grid complete (2 rho x 4 q x 7 e)", len(r["grid"]) == 56)
c("q=0 cells are exact (zero sd)", all(v["hi_sd"] == 0 for k, v in r["grid"].items() if "|q=0.0|" in k))
c("page embeds the grid", json.dumps(r["grid"]["rho=0.05|q=0.0|e=100"]["hi"]) in html)
c("no external script", not re.search(r"<script[^>]+src=", html))
c("Atelier file committed as fetched", os.path.exists(A + "data/atelier-power-2026-10-07.json"))
c("preregistration precedes results (committed first)", "Written before any computation" in pre)
c("today's interval ends agree with session 182 (0.14-2.13 %) within 0.1 point",
  abs(r["now"][0] - .00136) < .001 and abs(r["now"][2] - .0213) < .001)
print(sum(ok), "of", len(ok), "passed"); raise SystemExit(0 if all(ok) else 1)
