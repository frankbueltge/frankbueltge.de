#!/usr/bin/env python3
"""Every number on this page, re-derived from the committed evidence. No network.

Session 164, 2026-09-19. Run: python3 check.py
Exits 0 only if every check passes. A failing check names the file and the value.
"""
import hashlib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
D = os.path.join(HERE, "data")
CH = []


def ck(name, cond, got=None, want=None):
    CH.append({"check": name, "pass": bool(cond), "got": got, "want": want})


def load(n, base=D):
    return json.load(open(os.path.join(base, n)))


corpus = load("corpus.json")
verd = load("verdicts.json")
an = load("analysis.json")
pr = load("predictions.json")
ad = load("adjudication.json")
im = load("implementations.json")
src = load("sources.json")
k3 = load("k3-scan.json")
page = open(os.path.join(HERE, "index.html")).read()
prereg = open(os.path.join(HERE, "PREREGISTRATION.md")).read()

VOCAB = {"MIT", "ISC", "BSD-4-Clause", "BSD-3-Clause", "BSD-2-Clause", "Zlib", "Apache-2.0",
         "GPL-3.0", "GPL-2.0", "LGPL-3.0", "LGPL-2.1", "AGPL-3.0", "MPL-2.0", "EPL-2.0",
         "BSL-1.0", "Unlicense", "CC0-1.0", "CC-BY-NC-SA-4.0", "CC-BY-NC-4.0", "CC-BY-SA-4.0",
         "CC-BY-4.0", "WTFPL", "OpenRAIL", "Llama-Community"}
ATTR = {"named", "placeholder", "no_holder", "no_copyright_line", None}
IMPL = ["R-ship", "R-def", "I-A", "I-B", "I-C", "I-D"]
COMPARE = ["R-ship", "I-A", "I-B", "I-C", "I-D"]

# ---------------------------------------------------------------- the corpus
ck("corpus: 740 texts", corpus["texts_ok"] == 740, corpus["texts_ok"], 740)
ck("corpus: no harvest error", corpus["errors"] == {}, corpus["errors"], {})
ck("corpus: entry count matches", len(corpus["entries"]) == 740, len(corpus["entries"]), 740)
dig = hashlib.sha256("".join(f"{e['id']}:{e['sha256']}\n" for e in corpus["entries"]).encode()).hexdigest()
ck("corpus: digest recomputes from the committed entries", dig == corpus["corpus_digest"],
   dig, corpus["corpus_digest"])
ck("corpus: every sha256 is 64 hex", all(re.fullmatch(r"[0-9a-f]{64}", e["sha256"]) for e in corpus["entries"]))
ck("corpus: digest carried into verdicts", verd["corpus_digest"] == corpus["corpus_digest"])
ck("corpus: digest carried into analysis", an["corpus_digest"] == corpus["corpus_digest"])
ck("corpus: digest printed on the page", corpus["corpus_digest"] in page)
ck("corpus: no licence text is committed anywhere in data/",
   not any("licenseText" in json.dumps(load(f)) for f in os.listdir(D) if f.endswith(".json")))

# ---------------------------------------------------------------- the rows
rows = verd["rows"]
ck("verdicts: 1,480 rows", len(rows) == 1480, len(rows), 1480)
ids = {r["id"] for r in rows}
ck("verdicts: 740 identifiers", len(ids) == 740, len(ids), 740)
ck("verdicts: identifiers match the corpus", ids == {e["id"] for e in corpus["entries"]})
ck("verdicts: two arms, 740 each",
   sum(r["arm"] == "C" for r in rows) == 740 and sum(r["arm"] == "F" for r in rows) == 740)
ck("verdicts: every implementation on every row", all(all(k in r for k in IMPL) for r in rows))
ck("verdicts: no implementation ever returned nothing",
   all(all(r[k] is not None for k in IMPL) for r in rows))
ck("verdicts: every family is in the contract vocabulary",
   all(set(r[k]["families"]) <= VOCAB for r in rows for k in IMPL))
ck("verdicts: every attribution is in the contract vocabulary",
   all(r[k]["attribution"] in ATTR for r in rows for k in IMPL))
ck("verdicts: all six delivered, no failures",
   all(verd["delivery"][k]["delivered"] and verd["delivery"][k]["n_failures"] == 0 for k in IMPL))

C = {r["id"]: r for r in rows if r["arm"] == "C"}
F = {r["id"]: r for r in rows if r["arm"] == "F"}


def key(v):
    return (tuple(sorted(v["families"])), v["attribution"])


# ---------------------------------------------- agreement, recomputed from the rows
for pair, rec in an["pairwise"].items():
    a, b = pair.split(" vs ")
    got = sum(1 for i in C if sorted(C[i][a]["families"]) == sorted(C[i][b]["families"]))
    ck(f"agreement recomputes: {pair}", got == rec["C"]["families_agree"], got, rec["C"]["families_agree"])
    pct = round(100 * got / 740, 2)
    ck(f"agreement pct recomputes: {pair}", pct == rec["C"]["families_agree_pct"], pct,
       rec["C"]["families_agree_pct"])

u = sum(1 for i in C if len({tuple(sorted(C[i][k]["families"])) for k in COMPARE}) == 1)
ck("all five agree on families, arm C", u == an["unanimous"]["C"]["all_agree_families"], u,
   an["unanimous"]["C"]["all_agree_families"])
ck("that number is 612", u == 612, u, 612)
ck("82.70 % recomputes", round(100 * u / 740, 2) == 82.70, round(100 * u / 740, 2), 82.70)
_pct = f"{round(100 * u / 740, 2):g}&nbsp;%"
ck("the headline figure appears on the page exactly twice, unaltered",
   page.count(_pct) == 2, page.count(_pct), 2)
ck("the headline count appears on the page exactly twice",
   page.count(str(u)) == 2, page.count(str(u)), 2)
ck("no other agreement percentage is passed off as the headline",
   page.count("&nbsp;%</span>") == 1)

indep = ["I-A", "I-B", "I-C", "I-D"]
dis = sum(1 for i in C if len({key(C[i][k]) for k in indep}) > 1)
ck("independents disagree internally: 127", dis == 127, dis, 127)
blk = [i for i in C if len({key(C[i][k]) for k in indep}) == 1
       and key(C[i][indep[0]]) != key(C[i]["R-ship"])]
ck("analysis records that number unaltered",
   an["independents_internal"]["C"]["independents_disagree_internally"] == dis,
   an["independents_internal"]["C"]["independents_disagree_internally"], dis)
ck("analysis records the unanimous-against count unaltered",
   an["independents_internal"]["C"]["independents_unanimous_against_R_ship"] == len(blk),
   an["independents_internal"]["C"]["independents_unanimous_against_R_ship"], len(blk))
ck("independents unanimous against R-ship: 11", len(blk) == 11, len(blk), 11)
ck("P5 holds as stated (127 > 11)", dis > len(blk))

# ------------------------------------------------------------- the adjudication
ck("adjudication covers exactly those 11", sorted(c["id"] for c in ad["cases"]) == sorted(blk),
   sorted(c["id"] for c in ad["cases"]), sorted(blk))
vc = {}
for c in ad["cases"]:
    vc[c["verdict"]] = vc.get(c["verdict"], 0) + 1
    i = c["id"]
    ck(f"adjudication {i}: independents' verdict matches the rows",
       all(sorted(C[i][k]["families"]) == sorted(c["independents"]["families"])
           and C[i][k]["attribution"] == c["independents"]["attribution"] for k in indep))
    ck(f"adjudication {i}: R-ship's verdict matches the rows",
       sorted(C[i]["R-ship"]["families"]) == sorted(c["R_ship"]["families"])
       and C[i]["R-ship"]["attribution"] == c["R_ship"]["attribution"])
ck("adjudication verdict counts", vc == ad["verdict_counts"], vc, ad["verdict_counts"])
ck("six convict us", vc.get("R-ship wrong") == 6, vc.get("R-ship wrong"), 6)
ck("four acquit us", vc.get("R-ship right") == 4, vc.get("R-ship right"), 4)
ck("one is undecidable", vc.get("specification does not decide") == 1)

# --------------------------------------------------------- defect 4, on the rule itself
sys.path.insert(0, os.path.join(ROOT, "tools", "is-it-a-licence"))
import fingerprints as fp                                             # noqa: E402
ck("defect 4 is real: lowercase (c) notice is recognised",
   fp.is_copyright_notice("Copyright (c) 1996 X Consortium") is True)
ck("defect 4 is real: capital (C) notice is NOT recognised",
   fp.is_copyright_notice("Copyright (C) 1996 X Consortium") is False)
ck("defect 4: the holder is there either way",
   fp.holder_of("Copyright (C) 1996 X Consortium") == "X Consortium")
ck("defect 4: _TAIL_WORD is compiled without re.I", not (fp._TAIL_WORD.flags & re.I))

# ------------------------------------------- the 09-18 cross-check, from 09-18's own data
d18 = load("data.json", os.path.join(ROOT, "artifacts",
                                     "2026-09-18-a-licence-file-is-not-a-licence", "data"))
SCORED = {"MIT", "ISC", "BSD-2-Clause", "BSD-3-Clause", "BSD-4-Clause", "Zlib"}
scored_files = [(r["repo"], f) for r in d18["repos"] for f in r.get("files", [])
                if set(f.get("families") or []) & SCORED]
ck("09-18: 156 licence-shaped files in D1", d18["counts"]["n_licence_shaped_files_in_D1"] == 156)
zero = sorted(repo for repo, f in scored_files if f["n_copyright_lines"] == 0)
ck("09-18: exactly 3 scored files recorded with no copyright line", len(zero) == 3, len(zero), 3)
ck("09-18: they are the three named in the adjudication",
   zero == sorted(x["repo"] for x in ad["defect_4"]["effect_on_published_numbers"]["findings"]))
ck("09-18: the headline was 100 of 105 = 95.2 %",
   d18["headline"]["k"] == 100 and d18["headline"]["n"] == 105 and d18["headline"]["pct"] == 95.2)
tx = [r for r in d18["repos"] if r["repo"] == "Tencent/Tencent-XR-3DGen"][0]
ck("09-18: the misread repository delivers through other files", tx["delivers_any"] is True)
ck("09-18: it holds 18 licence-shaped files", len(tx["files"]) == 18, len(tx["files"]), 18)
nd = sum(1 for f in tx["files"] if f["delivers"])
ck("09-18: 14 of them deliver", nd == 14, nd, 14)
ck("the page says fourteen, not sixteen", "fourteen of them" in page and "sixteen of them" not in page)
six = [r["repo"] for r in d18["repos"]
       if any(f["reason"] in ("no_holder", "no_copyright_line") for f in r["files"])
       and not any(f["reason"] == "identified_and_attributed" for f in r["files"])]
ck("09-18: the holderless six are still six", len(six) == 6, len(six), 6)
ck("09-18: the misread repository was never among them", "Tencent/Tencent-XR-3DGen" not in six)
ck("the page says the headline does not move", "does not move" in page)

# -------------------------------------------------------- the L2 paired transition
for k, v in an["l2_transition"].items():
    ck(f"transition {k}: parts sum to the scored total",
       v["placeholder_then_named"] + v["same_verdict_both_arms"] + v["other"] == v["scored"])
    ck(f"transition {k}: pct recomputes",
       round(100 * v["placeholder_then_named"] / v["scored"], 2) == v["pct_correct"])
ck("R-def scores 0 on the transition", an["l2_transition"]["R-def"]["pct_correct"] == 0.0)
ck("R-def is really the defect: named on canonical MIT",
   C["MIT"]["R-def"]["attribution"] == "named")
ck("R-ship says placeholder on canonical MIT", C["MIT"]["R-ship"]["attribution"] == "placeholder")
ck("all four independents say placeholder on canonical MIT",
   all(C["MIT"][k]["attribution"] == "placeholder" for k in indep))
ck("all four say named on the filled MIT", all(F["MIT"][k]["attribution"] == "named" for k in indep))

# ----------------------------------------------------------------- the implementations
for m in im["implementations"]:
    p = os.path.join(ROOT, m["file"])
    ck(f"{m['label']}: file is committed", os.path.exists(p))
    if os.path.exists(p):
        raw = open(p, "rb").read()
        ck(f"{m['label']}: sha256 matches", hashlib.sha256(raw).hexdigest() == m["sha256"])
        ck(f"{m['label']}: byte length matches", len(raw) == m["bytes"])
ck("K3: the repaired scan passes all four", k3["all_pass"] is True)
ck("K3: four modules scanned", k3["n_scanned"] == 4)
ck("K3: no non-standard-library import anywhere",
   all(m["non_stdlib_imports"] == [] for m in k3["modules"]))
ck("K3: both failing runs are kept",
   os.path.exists(os.path.join(D, "k3-run1-defective.json"))
   and os.path.exists(os.path.join(D, "k3-run2-defective.json")))
r1 = load("k3-run1-defective.json")
ck("K3 run 1 failed all four", r1["all_pass"] is False and len(r1["modules"]) == 4)
ck("K3 run 1 failed on the word curly / the licence URLs",
   all("curl" in m["forbidden_name_hits"] for m in r1["modules"]))
r2 = load("k3-run2-defective.json")
ck("K3 run 2 failed all four on re.compile",
   r2["all_pass"] is False and all("call:compile" in m["forbidden_name_hits"] for m in r2["modules"]))

# ------------------------------------------------------------------- predictions
ck("six predictions recorded", len(pr["predictions"]) == 6)
ck("four confirmed, two refuted",
   sum(1 for p in pr["predictions"].values() if p["verdict"] == "CONFIRMED") == 4
   and sum(1 for p in pr["predictions"].values() if p["verdict"] == "REFUTED") == 2)
ck("every prediction's expectation was recorded in advance",
   all(p["expected"] in ("confirmed", "refuted") for p in pr["predictions"].values()))
ck("both refutations were the expected direction",
   all(p["verdict"].lower() == p["expected"] for p in pr["predictions"].values()))
ck("all four kill conditions are on the record",
   sorted(pr["kill_conditions"]) == ["K1", "K2", "K3", "K4"], sorted(pr["kill_conditions"]),
   ["K1", "K2", "K3", "K4"])
ck("no kill condition fired", all(v["fired"] is False for v in pr["kill_conditions"].values()))
for _k in ("K1", "K2", "K3", "K4"):
    ck(f"{_k} carries its evidence", len(pr["kill_conditions"].get(_k, {}).get("evidence", "")) > 40)
for pid in pr["predictions"]:
    ck(f"{pid} appears on the page", pid in page)

# ------------------------------------------------------------------- the sources
kl = [s for s in src["sources"] if s["key"] == "knight-leveson-1986"][0]
ck("Knight & Leveson is recorded as NOT read", kl["read"] is False)
ck("nothing is quoted from it as the paper", "quotations" not in kl)
ck("the trap is recorded", "trap_found" in kl)
ck("the page says it was not read", "not read" in page)
for k in ("silberzahn-2018", "wolter-2019"):
    s = [x for x in src["sources"] if x["key"] == k][0]
    ck(f"{k} was read", s["read"] is True)
    ck(f"{k} carries quoted passages", len(s["quotations"]) >= 2)
    for q in s["quotations"]:
        ck(f"{k}: quotation is not empty", len(q["text"]) > 40)
w = [x for x in src["sources"] if x["key"] == "wolter-2019"][0]
ck("Wolter's 83.24 % is quoted, not paraphrased",
   any("83.24" in q["text"] for q in w["quotations"]))
ck("and it appears on the page", "83.24" in page)

# ------------------------------------------------------- the pre-registration's own words
ck("pre-registration names all six predictions", all(f"**{p}.**" in prereg for p in pr["predictions"]))
ck("pre-registration names all four kill conditions",
   all(f"**{k} " in prereg for k in pr["kill_conditions"]))
ck("pre-registration publishes the fill table in full",
   all(t in prereg for t in ("<copyright holders>", "[name of copyright owner]", "[fullname]")))
_pre1 = re.sub(r"\s+", " ", prereg)
ck("pre-registration states the independence limitation",
   "separately dispatched instances of one automated system" in _pre1)
ck("the page states it too", "weak, and it is part of the finding" in page)

# --------------------------------------------------------------------------- report
bad = [c for c in CH if not c["pass"]]
out = {"note": "Session 164, 2026-09-19. Every number on the page re-derived from the committed "
               "evidence. No network. A check that verifies numerals does not verify claims — "
               "the claims are argued on the page and in the adjudication, where a reader can "
               "disagree with them.",
       "n_checks": len(CH), "n_pass": len(CH) - len(bad), "n_fail": len(bad), "checks": CH}
dest = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, "check.json")
open(dest, "w").write(json.dumps(out, indent=1) + "\n")
print(f"{len(CH)} checks, {len(bad)} failed")
for b in bad:
    print("  FAIL", b["check"], "got", repr(b["got"]), "want", repr(b["want"]))
sys.exit(1 if bad else 0)
