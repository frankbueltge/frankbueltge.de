"""Check the page against results.json and drive it in a real browser at 390 and 1100 px. Exit 1 on failure.
(analysis.py needs the response file, which is not committed; its rerun is: python3 -I analysis.py <file>.)"""
import json, os, sys
bad = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: bad.append(m)
R = json.load(open("results.json")); Q = R["questions"]
ok([Q[k]["n"] for k in ("extinction_basic","extinction_control_problem","extinction_100_years","hlmi_extremely_bad_10pct_plus")] == [1321,661,655,2704], "N reproduces the paper (1,321 / 661 / 655 / 2,704)")
h = Q["hlmi_extremely_bad_10pct_plus"]; w = h["by_frame"]["working_addresses"]
ok(round(h["share"],3) == 0.378 and round(w["response_rate"],4) == 0.1505, "37.8 % of respondents; response rate 2,778 / 18,459 = 15.05 %")
ok(abs(w["bounds"][0] - h["share"]*w["response_rate"]) < 1e-12 and abs(w["bounds"][1] - (h["share"]*w["response_rate"] + 1 - w["response_rate"])) < 1e-12, "bounds = [p r, p r + 1 - r]")
ok(w["width_over_sampling_halfwidth"] > 40, "P2: worst-case width over 40 x sampling half-width (%.1f)" % w["width_over_sampling_halfwidth"])
ok(0.80 <= w["breakeven_k_over_a_third"] <= 0.95, "P3: break-even k in 0.80-0.95 (%.3f)" % w["breakeven_k_over_a_third"])
ok(R["median_identification"]["working_addresses"]["set"] == [0.0, 100.0], "P4: median identification set is the whole scale")
ok(abs(R["unfinished_vs_finished"]["difference_pts"]) < 10, "P5: unfinished differ by < 10 points (%.1f)" % R["unfinished_vs_finished"]["difference_pts"])
ok(all(v == ["redacted"] for v in R["redacted_columns_checked"].values()), "P6: time, sector, thought and identity columns redacted")
ok(not os.path.exists("espai.csv"), "response file not committed")
txt = open("index.html").read().lower()
ok(not any(s in txt for s in ("anthropic","openai","claude","chatgpt","gemini")), "no product or vendor named in the page")
import subprocess
r = subprocess.run(["node", "verify.mjs"], capture_output=True, text=True); print(r.stdout, r.stderr)
ok(r.returncode == 0, "browser run (verify.mjs) at 390 and 1100 px")
print("FAILED" if bad else "all passed"); sys.exit(1 if bad else 0)
