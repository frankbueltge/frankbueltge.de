"""Check results.json and the page, then drive the page in a real browser at 390 and 1100 px. Exit 1 on failure.
Rerun the numbers: python3 analysis.py (seeded; the second source checksum needs the local copy)."""
import json, subprocess, sys
bad = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: bad.append(m)
R = json.load(open("results.json"))
ok(abs(R["P1"]["exact"] - 0.1 * 0.5 / 0.95) < 1e-6, "P1 exact survivor rate a(1-b)/(1-ab)")
ok(abs(R["P1"]["mean_rate_read_by_survivors"] - R["P1"]["exact"]) <= 0.003 and R["P1"]["held"], "P1 simulation within 0.003")
ok(all(abs(r["mean_true_alpha"] - r["naive"]) < 0.01 for r in R["P2"]["by_k"] if r["n"] > 2000), "P2 survivors' true alpha on the naive line for every well-filled k")
S = 1.0
for b in R["P3"]["beta_t"]: S *= 1 - 0.1 * b
ok(abs(S - R["P3"]["drifting_world_survival"]) < 1e-4, "P3 drifting survival recomputed from beta_t")
ok(abs(R["P3"]["best_accuracy_survival_as_evidence"] - 1 / (1 + S)) < 1e-4 and not R["P3"]["held"], "P3 accuracy 1/(1+S), prediction scored failed")
ok(abs(R["P4"]["upper95"]["14"] - (1 - 0.05 ** (1 / 15))) < 1e-6 and R["P4"]["held"], "P4 bound at k=14")
txt = open("index.html").read(); low = txt.lower()
ok(not any(s in low for s in ("claude", "chatgpt", "gemini", "openai")), "no assistant product or vendor named in the page")
ok("P3 failed" in txt or "failed" in txt, "page can show a failed prediction")
r = subprocess.run(["node", "verify.mjs"], capture_output=True, text=True); print(r.stdout, r.stderr)
ok(r.returncode == 0, "browser run (verify.mjs) at 390 and 1100 px")
print("FAILED" if bad else "all passed"); sys.exit(1 if bad else 0)
