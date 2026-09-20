#!/usr/bin/env python3
"""Checker for session 165. No network. Imports nothing from the build.

Run:  python3 artifacts/2026-09-20-the-same-text-twice/check.py
It reads only committed files, re-derives every number the page states, and tests
this session's OWN relations against hand-made fixtures -- because a relation is a
rule too, and 2026-09-18 is the reason that sentence is in here.

Exits non-zero on the first failing group and prints every failure.
"""
import hashlib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
D = os.path.join(HERE, "data")
sys.path.insert(0, os.path.join(ROOT, "tools", "same-text-twice"))

ok, bad = 0, []


def c(cond, what):
    global ok
    if cond:
        ok += 1
    else:
        bad.append(what)


def load(n):
    return json.load(open(os.path.join(D, n)))


def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()


# ------------------------------------------------------- 1. the artifact is whole
for f in ("index.html", "SUMMARY.md", "PREREGISTRATION.md", "check.py", "tamper.py"):
    c(os.path.exists(os.path.join(HERE, f)), f"missing {f}")
for f in ("data.json", "adjudication.json", "predictions.json", "sources.json",
          "apparatus.json", "violations.json", "verdicts.json", "false-notices.json",
          "corpus-c1.json", "corpus-c2.json"):
    c(os.path.exists(os.path.join(D, f)), f"missing data/{f}")

# Found by tamper.py: with a data file absent the checker used to crash with a
# traceback instead of naming a failing check, which the corruption harness counts
# as a miss rather than a catch. It now stops here, named.
if bad:
    print(f"{ok} checks passed, {len(bad)} failed")
    for b in bad:
        print("  FAIL:", b)
    sys.exit(1)

data = load("data.json")
adj = load("adjudication.json")
pred = load("predictions.json")
src = load("sources.json")
app = load("apparatus.json")
viol = load("violations.json")
verd = load("verdicts.json")
fn = load("false-notices.json")
c1 = load("corpus-c1.json")
c2 = load("corpus-c2.json")

# ------------------------------------------------- 2. the rule under test is pinned
PINNED = {
    "rules.py": "ccb373b6edb1e4397d7ac145aca6ff94e995934c9315b1ccc23eb266a288a2ed",
    "fingerprints.py": "57db4c561a58683d81fb35be3781168a419785183215a864ed5694981b6669cd"}
prereg = open(os.path.join(HERE, "PREREGISTRATION.md")).read()


def flat(t):
    """Strip markdown emphasis and unify dashes, so a prediction can be compared with
    the text the pre-registration committed rather than with its typography."""
    t = t.replace("**", "").replace("*", "")
    t = t.replace("\u2014", "-").replace("\u2013", "-")
    return re.sub(r"\s+", " ", t)


prereg_flat = flat(prereg)
for f, dg in PINNED.items():
    c(dg in prereg, f"pre-registration does not name the pinned digest of {f}")
    c(sha(os.path.join(ROOT, "tools", "is-it-a-licence", f)) == dg,
      f"tools/is-it-a-licence/{f} no longer matches the digest this session measured")
c(data["runs"]["shipped"]["rule_digests"] == PINNED,
  "the scored run was not made with the pinned rule")
c(data["runs"]["B"]["rule_digests"]["rules.py"] == PINNED["rules.py"],
  "variant B changed rules.py, which it must not")
for v in ("B", "C", "D"):
    c(data["runs"][v]["rule_digests"]["fingerprints.py"] != PINNED["fingerprints.py"],
      f"variant {v} is identical to the shipped rule")
c(len({data["runs"][v]["rule_digests"]["fingerprints.py"] for v in ("shipped", "B", "C", "D")}) == 4,
  "the four rule variants are not four distinct files")

# --------------------------------------------------------- 3. kill conditions
for k, v in data["kill_conditions"].items():
    c(v["fired"] is False, f"kill condition {k} is recorded as fired")
c(data["kill_conditions"]["K1_fidelity_of_SUT"]["mismatches"] == [],
  "K1 recorded mismatches against the 2026-09-18 verdicts")
c(data["kill_conditions"]["K1_fidelity_of_SUT"]["files_compared"] == 156,
  "K1 did not compare all 156 files")
c(pred["kill_conditions_fired"] == [], "predictions.json disagrees: a kill condition fired")

# --------------------------------------------------------- 4. the corpora
c(c1["texts_ok"] == 740 and c1["fetched_ids"] == 740, "C1 is not 740 of 740")
c(c1["errors"] == {}, "C1 recorded a fetch error")
old19 = json.load(open(os.path.join(
    ROOT, "artifacts/2026-09-19-the-second-hand/data/corpus.json")))
c(c1["corpus_digest"] == old19["corpus_digest"],
  "C1's digest differs from the one committed on 2026-09-19")
c(data["corpora"]["C1"]["identical_to_2026_09_19"] is True, "data.json claims C1 moved")
rederived = hashlib.sha256("".join(
    f'{e["id"]}:{e["sha256"]}\n' for e in c1["entries"]).encode()).hexdigest()
c(rederived == c1["corpus_digest"], "C1's corpus digest is not the digest of its own entries")
c(c2["n_pinned"] == 156 and c2["n_fetched"] == 156 and c2["n_digest_matches"] == 156,
  "C2 is not 156 of 156 with every digest matching")
c(c2["excluded"] == [], "C2 excluded an input")
old18 = json.load(open(os.path.join(
    ROOT, "artifacts/2026-09-18-a-licence-file-is-not-a-licence/data/data.json")))
pinned18 = {}
for r in old18["repos"]:
    for f in r.get("files", []):
        pinned18[r["repo"] + "@" + f["path"]] = f["sha256"]
c(len(pinned18) == 156, "the 2026-09-18 artifact does not carry 156 licence files")
mism = [e for e in c2["entries"] if pinned18.get(e["repo"] + "@" + e["path"]) != e["sha256"]]
c(mism == [], f"{len(mism)} C2 blobs differ from the digest 2026-09-18 recorded")

# ------------------------------------------- 5. the counts add up, both readings
r = data["runs"]["shipped"]
c(r["registered_oracle"]["M1"] == 348, "M1 registered count is not 348")
c(r["registered_oracle"]["M2"] == 451, "M2 registered count is not 451")
c(r["registered_oracle"]["M6"] == 272, "M6 registered count is not 272")
c(r["registered_oracle"]["M5"] == 63, "M5 registered count is not 63")
c(r["registered_oracle"]["M9"] == 470, "M9 registered count is not 470")
for z in ("M3", "M4", "M7", "M8"):
    c(r["registered_oracle"][z] == 0, f"{z} did not return zero")
    c(r["decision_oracle"][z] == 0, f"{z} decision count is not zero")
c(r["registered_scored_total"] == 1134, "the registered scored total is not 1,134")
c(r["registered_scored_total"] == sum(
    v for k, v in r["registered_oracle"].items() if k != "M9"),
  "the registered scored total is not the sum of its relations")
c(r["decision_scored_total"] == 167, "the decision-field total is not 167")
c(r["decision_scored_total"] == sum(
    v for k, v in r["decision_oracle"].items() if k != "M9"),
  "the decision total is not the sum of its relations")
c(r["echo_only_violations"] == 967, "the echo-only count is not 967")
c(r["echo_only_violations"] + r["decision_scored_total"] == r["registered_scored_total"],
  "967 + 167 does not equal 1,134")
c(r["scored_classes"] == 9, "the shipped run's scored class count is not 9")
c(r["decision_oracle"]["M9"] == 143, "M9's decision count is not 143")

# M4 is the pre-registered control and must be zero under EVERY rule
for v in ("shipped", "B", "C", "D"):
    c(data["runs"][v]["registered_oracle"]["M4"] == 0,
      f"the control M4 fired under rule {v}")

# the repair ladder
ladder = [data["runs"][v]["decision_scored_total"] for v in ("shipped", "B", "C", "D")]
c(ladder == [167, 22, 6, 4], f"the repair ladder is {ladder}, not [167, 22, 6, 4]")
c(data["runs"]["B"]["decision_oracle"]["M6"] == 20,
  "B's M6 decision count is not 20 -- the defect-2 resurrection")
c(data["runs"]["shipped"]["decision_oracle"]["M6"] == 7, "the shipped M6 decision count is not 7")
c(data["runs"]["B"]["decision_oracle"]["M6"] > data["runs"]["shipped"]["decision_oracle"]["M6"],
  "B did not make M6 worse, which is the whole point of the B arm")
for v in ("B", "C", "D"):
    c(data["runs"][v]["decision_oracle"]["M1"] == 0, f"variant {v} did not repair M1")
c(data["runs"]["D"]["decision_oracle"]["M5"] == 0, "variant D did not repair M5")
c(data["runs"]["C"]["decision_oracle"]["M5"] == 2, "variant C should not repair M5")

# ------------------------------------------------- 6. nothing published moves
pub = data["headline_published_0918"]
c((pub["k"], pub["n"], pub["pct"]) == (100, 105, 95.2), "the recorded 2026-09-18 headline is wrong")
for v in ("shipped", "C", "D"):
    h = data["headline_rederived"][v]
    c((h["k"], h["n"], h["pct"]) == (100, 105, 95.2),
      f"the re-derived headline under {v} is not 100/105 = 95.2 %")
    c(h["names_no_holder"] == 6, f"the names-no-holder count under {v} is not 6")
c(len(set(map(tuple, (sorted(data["headline_rederived"][v]["names_no_holder_repos"])
                      for v in ("shipped", "C", "D"))))) == 1,
  "the six repositories naming no holder are not the same six under every rule")
mv = data["baseline_movement_under_repair"]
c(mv["C"]["C2"]["decisions_moved"] == 1, "more or fewer than one C2 verdict moves under repair C")
c(mv["C"]["C2"]["decisions"] == ["Tencent/Tencent-XR-3DGen@geometry/neusdfusion_test/LICENSE"],
  "the one moving C2 verdict is not the file 2026-09-19 named")
c(mv["D"]["C2"]["decisions"] == mv["C"]["C2"]["decisions"], "C and D disagree on C2")
c(mv["C"]["C1"]["decisions_moved"] == 17, "the C1 movement under repair C is not 17")
c(mv["B"]["C1"]["decisions_moved"] == 20, "the C1 movement under repair B is not 20")

# ------------------------------------------------- 7. the adjudication is complete
inst = sum(x["n_inputs"] if isinstance(x["n_inputs"], int) else 0
           for x in adj["classes"] if x["verdict"] != "MR-FALSE")
c(inst == 167, f"the adjudicated classes cover {inst} violations, not 167")
t = adj["totals"]
c(t["DEFECT_instances"] + t["LATENT_instances"] == 167, "37 + 130 does not equal 167")
c(t["MR_FALSE_instances"] == r["echo_only_violations"],
  "the MR-FALSE count does not equal the echo-only count")
c(t["DEFECT_distinct_inputs"] == 18, "the DEFECT input count is not 18")
c(t["UNDECIDED"] == 0, "an UNDECIDED verdict is recorded but not reported")
c(t["distinct_causes"] == 3 and len(t["causes"]) == 3, "the three causes are not three")
c(set(x["verdict"] for x in adj["classes"]) <= set(adj["categories"]),
  "an adjudication uses a category the pre-registration did not define")
c1cls = [x for x in adj["classes"] if x["n"] == 1][0]
c(len(c1cls["inputs_C1"]) == 17 and len(c1cls["inputs_C2"]) == 1,
  "class 1 does not hold 17 C1 and 1 C2 inputs")
c("Tencent/Tencent-XR-3DGen@geometry/neusdfusion_test/LICENSE" in c1cls["inputs_C2"],
  "class 1 does not name the file 2026-09-19 convicted us on")

# every adjudicated input really is in the committed violations
rows = viol["by_rule"]["shipped"]["rows"]
have = {(x["relation"], x["input"]) for x in rows}
for cl in adj["classes"]:
    if cl["verdict"] == "MR-FALSE":
        continue
    for i in cl.get("inputs", []) + cl.get("inputs_C1", []) + cl.get("inputs_C2", []):
        c((cl["relation"], i) in have,
          f"adjudicated input {i} is absent from violations.json under {cl['relation']}")
c(len(rows) == 310, f"violations.json holds {len(rows)} shipped rows, not 310")
c(sum(1 for x in rows if x["relation"] != "M9") == 167,
  "the committed violations do not hold 167 scored rows")

# M1 and M2 converge on the same 18
s1 = {x["input"] for x in rows if x["relation"] == "M1"
      and x["before"].get("attribution") == "no_copyright_line"
      and x["after"].get("attribution") == "named"}
s2 = {x["input"] for x in rows if x["relation"] == "M2"
      and x["before"].get("attribution") == "no_copyright_line"
      and x["after"].get("attribution") == "named"}
c(len(s1) == 18 and s1 == s2, "M1 and M2 do not convict the same eighteen inputs")

# ------------------------------------------------- 8. verdicts.json is the whole corpus
c(len(verd["inputs"]) == 896, f"verdicts.json holds {len(verd['inputs'])} inputs, not 896")
c(sum(1 for v in verd["inputs"].values() if v["corpus"] == "C1") == 740, "C1 is not 740 rows")
c(sum(1 for v in verd["inputs"].values() if v["corpus"] == "C2") == 156, "C2 is not 156 rows")
DECF = ["l0", "families", "attribution", "delivers", "reason", "apache_appendix_unfilled"]
moved_dec = [k for k, v in verd["inputs"].items()
             if any(json.dumps(v["shipped"][f], sort_keys=True)
                    != json.dumps(v["D"][f], sort_keys=True) for f in DECF)]
c(len(moved_dec) == 18,
  f"{len(moved_dec)} decisions move between the shipped rule and D, not 18")
moved_any = [k for k, v in verd["inputs"].items()
             if json.dumps(v["shipped"], sort_keys=True) != json.dumps(v["D"], sort_keys=True)]
c(len(moved_any) == 128,
  f"{len(moved_any)} inputs change ANY recorded field between the shipped rule and D, not 128")
c(len(moved_any) > len(moved_dec),
  "the repair changes no more notice counts than decisions, which would be surprising")

# ------------------------------------------------- 9. the post-hoc scan
c(fn["decisions_at_risk"] == 0, "the false-notice scan puts a decision at risk")
c(fn["n_inputs_with_a_false_notice"] == 14, "the scan's input count is not 14")
c(fn["n_false_notices"] == 15, "the scan's notice count is not 15")
c("post-hoc" in fn["declared"], "the scan is not declared post-hoc")
c(sum(1 for h in fn["hits"] if h["corpus"] == "C2") == 1, "the scan's C2 hit count is not 1")
c([h for h in fn["hits"] if h["corpus"] == "C2"][0]["n_clean_named"] == 9,
  "the C2 hit is not carried by nine genuine notices")

# ------------------------------------------------- 10. predictions, as written
c(len(pred["predictions"]) == 7, "there are not seven predictions")
c(pred["score"]["confirmed"] == 5 and pred["score"]["refuted"] == 2,
  "the prediction score is not 5 confirmed and 2 refuted")
c(sum(1 for p in pred["predictions"] if p["outcome"].startswith("REFUTED")) == 2,
  "the refuted predictions do not number two")
# Also found by tamper.py: a dropped prediction used to raise IndexError here.
byid = {x["id"]: x for x in pred["predictions"]}
for pid in ("P1", "P2", "P3", "P4", "P5", "P6", "P7"):
    p = byid.get(pid)
    c(p is not None, f"prediction {pid} is absent")
    if p is None:
        continue
    c(p["text"].strip() != "" and p["evidence"].strip() != "", f"{pid} is not evidenced")
    c(flat(p["text"]) in prereg_flat,
      f"{pid}'s text is not the text the pre-registration committed")
c(byid.get("P6", {}).get("outcome") == "REFUTED", "P6 is not scored as refuted")
c("NOT blind" in byid.get("P1", {}).get("flag", ""), "P1 is not flagged as unblinded")

# ------------------------------------------------- 11. the sources
ids = {s["id"] for s in src["sources"]}
c({"chen-1998", "segura-2016", "duque-torres-2023"} <= ids, "a read source is missing")
chen = [s for s in src["sources"] if s["id"] == "chen-1998"][0]
c("NOT QUOTED" in chen["status"], "chen-1998 is not marked unquoted")
c("quotations" not in chen, "a quotation is taken from a source declared unquotable")
for sid in ("segura-2016", "duque-torres-2023"):
    s = [x for x in src["sources"] if x["id"] == sid][0]
    c(len(s["quotations"]) >= 2, f"{sid} carries fewer than two quotations")
    for q in s["quotations"]:
        c(len(q["q"]) > 40 and q["role"].strip(), f"{sid} has an unroled or stub quotation")
    c(re.fullmatch(r"[0-9a-f]{64}", s["pdf_sha256"]), f"{sid} has no source digest")
c(src["not_found_by_our_search"] and "our search" in src["not_found_by_our_search"][0],
  "the unfound claim is not stated as a fact about our search")
c(any("toVerify" in x.get("why", "") for x in src["found_and_not_read"]),
  "the house index's single metamorphic entry is not recorded as unread")

# ------------------------------------------------- 12. the apparatus register
c(app["no_model_in_the_measurement"].startswith("No rule"), "the no-model claim is missing")
c("No sub-agent" in app["no_delegation"], "the no-delegation claim is missing")
c(app["reasoning_and_writing_agent"]["provider"] == "Anthropic"
  and app["reasoning_and_writing_agent"]["model_configured"],
  "the apparatus register does not name provider and model")
c(any(l["name"] == "PyMuPDF" and l["version"] for l in app["third_party_libraries"]),
  "the extraction library is not recorded with its version")
c(app["own_tool_failure_recorded_tonight"]["path"].endswith("pdftext.py"),
  "tonight's own tool failure is not recorded")

# ------------------------------------------------- 13. no product name in the prose
page = open(os.path.join(HERE, "index.html")).read()
summ = open(os.path.join(HERE, "SUMMARY.md")).read()
FORBIDDEN = ["claude", "anthropic", "openai", "gpt-", "gemini", "sonnet", "opus",
             "chatgpt", "copilot", "llama-3", "mistral"]
for blob, name in ((page, "index.html"), (summ, "SUMMARY.md"), (prereg, "PREREGISTRATION.md")):
    low = blob.lower()
    for w in FORBIDDEN:
        # 'openai/preparedness' is a repository in the measured population, not a
        # vendor named in this practice's voice; the same for opus in a bibliography.
        hits = [m.start() for m in re.finditer(re.escape(w), low)]
        hits = [h for h in hits if not low[h:h + 20].startswith("openai/preparedness")]
        c(not hits, f"{name} names '{w}' in this practice's own voice")

# ------------------------------------------------- 14. the page states what it measured
for s in ("1,134", "167", "127", "95.2", "740", "156", "defect 4", "MR-FALSE"):
    c(s in page, f"index.html does not state {s!r}")
c("no model" in page.lower() or "No model" in page, "the page does not state the no-model claim")
c(page.count("<script") == 0, "the page carries a script")
c("http://" not in page.replace("http://www.w3.org", ""), "the page loads something over http")
c(len(re.findall(r'src="https?://', page)) == 0, "the page pulls a remote resource")

# ------------------------------------------------- 15. this session's OWN relations
# A relation is a rule. These are hand-made fixtures, written for the checker and
# independent of the run: they test what each relation claims to do, and what it
# must not do.
import relations as R                                              # noqa: E402

c([i for i, _, _ in R.SCORED] == ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"],
  "the scored relations are not the eight that were pre-registered")
c([i for i, _, _ in R.UNSCORED] == ["M9"], "M9 is not the only unscored relation")
c(R.CONTROL == "M4", "M4 is not declared the control")

F = [
    ("m1 swaps both ways", R.m1_marker_case, "a (c) b (C) c", "a (C) b (c) c"),
    ("m1 leaves prose alone", R.m1_marker_case, "section (a) and (d)", "section (a) and (d)"),
    ("m1 is its own inverse", lambda t: R.m1_marker_case(R.m1_marker_case(t)),
     "Copyright (c) 1 (C) 2", "Copyright (c) 1 (C) 2"),
    ("m2 swaps both ways", R.m2_marker_form, "(c) and ©", "© and (c)"),
    ("m2 is its own inverse", lambda t: R.m2_marker_form(R.m2_marker_form(t)),
     "(c) x © y", "(c) x © y"),
    ("m3 leaves no bare LF", lambda t: "\n" in R.m3_crlf(t).replace("\r\n", ""), "a\nb", False),
    ("m3 is idempotent", lambda t: R.m3_crlf(R.m3_crlf(t)), "a\nb", "a\r\nb"),
    ("m4 indents text", R.m4_indent, "a\nb", "    a\n    b"),
    ("m4 leaves blank lines blank", R.m4_indent, "a\n\nb", "    a\n\n    b"),
    ("m5 folds the straight quote", R.m5_typography, "'x'", "’x’"),
    ("m5 folds the spaced hyphen only", R.m5_typography, "a - b and a-b",
     "a – b and a-b"),
    ("m6 joins a paragraph", R.m6_rewrap, "one\ntwo", "one two"),
    ("m6 keeps a trailing newline", R.m6_rewrap, "one\ntwo\n", "one two\n"),
    ("m6 keeps the blank line", lambda t: "\n\n" in R.m6_rewrap(t), "a\n\nb", True),
    ("m6 respects the column", lambda t: max(len(x) for x in R.m6_rewrap(t).split("\n")) <= 64,
     " ".join(["word"] * 80), True),
    ("m7 prepends the mark", R.m7_bom, "a", "﻿\na"),
    ("m8 appends two spaces", R.m8_trailing, "a\nb", "a  \nb  "),
    ("m9 comments every line", R.m9_comment, "a\n\nb", "# a\n#\n# b"),
]
for name, fn, src_t, want in F:
    got = fn(src_t)
    c(got == want, f"relation fixture failed: {name} -> {got!r} not {want!r}")

# the control must be a no-op through normalise(), which is why it is the control
sys.path.insert(0, os.path.join(ROOT, "tools", "is-it-a-licence"))
import fingerprints as FP                                          # noqa: E402
sample = ("Copyright (c) 2019 Someone\n\nPermission is hereby granted, free of charge, "
          "to any person obtaining a copy\nof this software and associated documentation "
          "files\n")
c(FP.normalise(R.m4_indent(sample)) == FP.normalise(sample),
  "the control M4 changes the normalised text, so it is not a control")
for rel in (R.m3_crlf, R.m7_bom, R.m8_trailing):
    c(FP.normalise(rel(sample)) == FP.normalise(sample),
      "a relation that returned zero violations does change the normalised text")
c(FP.normalise(R.m9_comment(sample)) != FP.normalise(sample),
  "M9 does not change the normalised text, so its 143 violations are unexplained")

# and the defect itself, reproduced here from first principles
c(FP.is_copyright_notice("Copyright (c) 1996 X Consortium") is True,
  "the lowercase notice is not recognised, so the corpus is not the one measured")
c(FP.is_copyright_notice("Copyright (C) 1996 X Consortium") is False,
  "defect 4 does not reproduce: the uppercase notice IS recognised")
c(FP.is_copyright_notice('"Copyright (c) 1998-2010 Sendmail, Inc.') is True,
  "the straight-quote notice is not recognised")
c(FP.is_copyright_notice('”Copyright (c) 1998-2010 Sendmail, Inc.') is False,
  "defect 5 does not reproduce: the typographic-quote notice IS recognised")
c(FP.is_copyright_notice("COPYRIGHT HOLDERS BE LIABLE FOR ANY DIRECT, INDIRECT,") is True,
  "defect 1 does not reproduce: the line-initial disclaimer is NOT read as a notice")
c(FP.is_copyright_notice("  copyright notice, this list of conditions and the") is False,
  "the shipped rule reads a lowercase continuation as a notice, which 2026-09-18 repaired")

# ------------------------------------------------------------------- report
print(f"{ok} checks passed, {len(bad)} failed")
for b in bad:
    print("  FAIL:", b)
sys.exit(1 if bad else 0)
