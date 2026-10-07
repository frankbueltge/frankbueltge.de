"""Checks for session 185. Counts its own chk( lines and fails if the number run differs. python3 -I check.py"""
import json, os, re, sys
H = os.path.dirname(os.path.abspath(__file__)); run = []; bad = []
def chk(name, ok):
    run.append(name)
    if not ok: bad.append(name)
res = json.load(open(H + "/data/results.json")); page = open(H + "/index.html").read()
fr = json.load(open(H + "/data/studio-further-read-2026-10-07.json"))["frames"]
j = res["joined"]["rho=0.05"]
chk("135 licensed-lot frames and 90 further frames", sum(f["lot"] == "A" for f in fr) == 135 and sum(f["lot"] == "B" for f in fr) == 90)
chk("further classes 86 living, 1 remains, 2 no animal, 1 unclear", res["further_classes"] == {"living": 86, "remains": 1, "no_animal": 2, "unclear": 1})
chk("P1 passes", res["P1"]["pass"])
chk("P5 passes (b* 2.36, 81 observers)", res["P5"]["pass"] and res["observers"]["further_distinct"] == 81)
chk("P2 refuted as recorded (upper > 3 %)", not res["P2"]["pass"] and j["not_living"][2] > 0.03)
chk("P4 refuted as recorded (shift >= 0.3 points)", not res["P4"]["pass"])
chk("P3 and P6 hold", res["P3"]["pass"] and res["P6"]["pass"])
chk("headline interval 0.58-3.6 % in page matches data", abs(j["not_living"][0] - 0.0058) < 0.0003 and abs(j["not_living"][2] - 0.036) < 0.0008 and "0.58" in page)
chk("grid has 31 rho steps", len(res["grid"]) == 31)
chk("interval ordered in every grid row", all(g["not_living"][0] < g["not_living"][1] < g["not_living"][2] for g in res["grid"]))
chk("page names both sibling parts", "works/2026-10-07-the-rest-read-blind" in page and "window/cycle-005-session-4" in page)
chk("no external script or network call", not re.search(r"<script[^>]+src=|fetch\(|XMLHttpRequest", page))
chk("page marks the estimate", "Estimate, marked as one" in page)
chk("no product or vendor names", not re.search(r"(?i)claude|anthropic|openai|gpt", page))
s = open(__file__).read()
chk("suite ran what it counted", len(run) + 1 == len(re.findall(r"^chk\(", s, re.M)))
print(len(run), "checks,", len(bad), "failed", bad); sys.exit(1 if bad else 0)
