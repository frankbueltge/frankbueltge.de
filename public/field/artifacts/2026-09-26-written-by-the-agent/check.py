#!/usr/bin/env python3
"""Offline checks for session 171. Re-derives every number on the page from data/, and
counts itself: it fails if it ran fewer checks than it declares (the 09-22 lesson)."""
import json
import os
import re
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
D = lambda f: json.load(open(os.path.join(HERE, "data", f), encoding="utf-8"))
PAGE = re.sub(r"\s+", " ", open(os.path.join(HERE, "index.html"), encoding="utf-8").read())
DECLARED = 22
ran, failed = 0, []


def check(name, cond):
    global ran
    ran += 1
    if not cond:
        failed.append(name)


corpus, units, reading, byline = D("corpus.json")["papers"], D("units.json"), D("reading.json")["readings"], D("byline.json")
doors, preds = D("doors.json"), D("predictions.json")
readable = [p for p in corpus if p["html_status"] == 200]
matched = [p for p in corpus if p["arxiv"]]
toks = units["units"]
v = Counter(u["verdict"] for u in toks)
samp = Counter(r["class"] for r in reading if r["kind"] == "sample")
flags = [r for r in reading if r["kind"] == "flag"]
per = sorted((p["percentage_tokens"] for p in readable), reverse=True)

check("48 papers", len(corpus) == 48 and len({p["openreview"] for p in corpus}) == 48)
check("7 matched", len(matched) == 7)
check("6 readable", len(readable) == 6)
check("41 unmatched", len(corpus) - len(matched) == 41)
check("K1 fires at <10", (len(readable) < 10) == preds["kill_conditions"][0]["fired"])
check("4 AI first on list", sum(p["first_listed_author"] in ("AI Agent", "Endocrine Agents", "Denario Astropilotai", "CHAC AI") for p in corpus) == 4)
check("words 24,822", sum(p["words"] for p in readable) == 24822 and "24,822 words" in PAGE)
check("304 tokens", len(toks) == 304 == sum(per) and "<strong>304</strong> percentages" in PAGE)
check("3 paired", v["consistent"] + v["inconsistent"] + v["complement"] == 3 and v["consistent"] == 2)
check("301 unrecomputable", v["not_recomputable"] == 301 and "60 of the 301" in PAGE)
check("190 from top 2", per[0] + per[1] == 190 and "190 of the 304" in PAGE)
check("every flag read", len(flags) == v["inconsistent"] + v["complement"] and all(f["judgement"] == "rule_error" for f in flags))
check("sample of 60, drawn from unrecomputable", len(units["sample"]) == 60 and all(
    next(u for u in toks if u["uid"] == s)["verdict"] == "not_recomputable" for s in units["sample"]))
check("sample classes 45/11/4", (samp["k_or_n_absent"], samp["other"], samp["difference"]) == (45, 11, 4))
check("61 readings", len(reading) == 61 and "61 readings" in PAGE)
check("AI byline on arXiv 1 of 7", len(byline) == 7 and sum(bool(re.search(r"\bAI\b", b["arxiv_authors"] or "")) for b in byline) == 1)
check("conference in comments 3 of 7", sum(bool(re.search(r"agents4science|AI Agents for Science", b["arxiv_comments"] or "", re.I)) for b in byline) == 3)
check("checklist in text 3 of 6", sum("Agents4Science" in (b.get("fulltext_terms") or {}) for b in byline) == 3)
check("one withdrawn", sum("withdrawn" in (b["arxiv_comments"] or "") for b in byline) == 1)
check("81.6 % of 50 not whole, 40/49 fits", abs(0.816 * 50 - round(0.816 * 50)) > 0.1 and round(4000 / 49, 1) == 81.6)
check("18/25 is 72 %; 111/253 is 43.87 %", 18 / 25 == 0.72 and round(11100 / 253, 2) == 43.87)
check("pass 2 found none, pass 3 found none on arXiv", doors["finding_the_papers"]["pass2"]["new_matches"] == 0
      and doors["finding_the_papers"]["pass3"]["on_arxiv"] == 0)

print(f"{ran} checks ran, {len(failed)} failed" + (": " + ", ".join(failed) if failed else ""))
assert ran == DECLARED, f"declared {DECLARED}, ran {ran}"
raise SystemExit(1 if failed else 0)
