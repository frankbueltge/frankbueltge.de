"""Checks for session 180. Counts its own chk( lines and fails if the number run differs. python3 -I check.py"""
import json, os, re, subprocess, sys
H = os.path.dirname(os.path.abspath(__file__)); run = []; bad = []
def chk(name, ok):
    run.append(name)
    if not ok: bad.append(name)
res = json.load(open(H + "/data/results.json")); R = json.load(open(H + "/data/studio-reading.json"))
S = json.load(open(H + "/data/studio-sample.json"))["rows"]; at = json.load(open(H + "/data/atelier-rerun/results.json"))
page = open(H + "/index.html").read(); top = json.load(open(H + "/census/results.json"))
chk("22 readings, 21 alive, 1 remains", len(R) == 22 and sum(v["reading"] == "alive" for v in R.values()) == 21)
chk("every read key has a sample row", set(R) <= {str(r["key"]) for r in S})
chk("98 rules searched", res["rules_searched"] == 98)
chk("P1: no rule above majority", res["rules_above_majority"] == [] and res["best_correct"] == res["majority_correct"] == 21)
chk("P2 refuted as recorded: 8 living share bone profile", res["living_sharing_bone_profile"] == 8)
chk("P3 lower bound < 5 %", res["tortoise_wilson95"][0] < 0.05)
chk("P4 upper > 500", res["scaled_estimate_records"]["high"] > 500)
chk("Wilson 1/10 matches reference [0.0179,0.4042]", res["tortoise_wilson95"] == [0.0179, 0.4042])
chk("Atelier rerun reproduces 32 of 39", at["best_correct"] == 32 and at["n"] == 39)
chk("Atelier rerun shuffle 132 of 2000 = 6.6 %", at["shuffled_runs_at_or_above_real"] == 132 and round(132 / 20, 1) == 6.6)
chk("rerun script byte-identical to fetched copy", open(H + "/data/atelier-rerun/analysis.py").read() == open(H + "/data/atelier-analysis-as-fetched.py").read())
chk("page carries 14,708 via data", top["records_total"] == 14708 and "14708" in page)
chk("page names both sibling parts", "ulysses" in page and "under-a-dead-name" in page)
chk("no external script or network call", not re.search(r'<script[^>]+src=|fetch\(|XMLHttpRequest', page))
chk("page states the estimate marking", "estimate" in page and "not a random sample" in page)
chk("no product or vendor names in page", not re.search(r'(?i)claude|anthropic|openai|gpt', page))
s_src = open(__file__).read()

chk("suite ran what it counted", len(run) + 1 == len(re.findall(r"^chk\(", s_src, re.M)))
print(len(run), "checks,", len(bad), "failed", bad); sys.exit(1 if bad else 0)
