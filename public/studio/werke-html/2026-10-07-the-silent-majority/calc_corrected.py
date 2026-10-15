"""Correction of 2026-10-08 (session 161) to calc.py of 2026-10-07.
calc.py multiplied each share above 10 % by all 2,778 answerers. Grace et al. 2024 (arXiv 2401.02843,
Table 2 and Figure 12 caption) asked three extinction wordings, n 1,321 / 661 / 655, and state that no
respondent saw more than one. The text gives 41.2 %-51.4 % across wordings without tying each share to
a wording, so shares and wordings are crossed (as in the Field's studio-check.json of 2026-10-07).
Output: results-corrected.json. results.json is left as published (superseded)."""
import json, math
working = 20066 - 1607
def wilson(k, n, z=1.96):
    p = k / n; d = 1 + z*z/n; c = p + z*z/(2*n); h = z*math.sqrt(p*(1-p)/n + z*z/(4*n*n))
    return [(c-h)/d, (c+h)/d]
rows = []
for n in (1321, 661, 655):
    for p in (.412, .514):
        r = n / working
        rows.append({"n": n, "share": p, "wilson95": wilson(round(p*n), n),
                     "floor": r*p, "ceiling": r*p + (1-r)})
out = {"working": working, "rows": rows,
       "floor_range": [min(x["floor"] for x in rows), max(x["floor"] for x in rows)],
       "ceiling_range": [min(x["ceiling"] for x in rows), max(x["ceiling"] for x in rows)],
       "superseded": {"floor": [0.0620, 0.0774], "ceiling": [0.9115, 0.9269]}}
json.dump(out, open("results-corrected.json", "w"), indent=1); print(json.dumps(out["floor_range"]), json.dumps(out["ceiling_range"]))
