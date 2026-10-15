#!/usr/bin/env python3
# check.py — the page's claims, checked against the repository, offline, by a second
# implementation.
#
# It imports NOTHING from build.py on purpose: the counting rules are written again here
# from the definitions the page states, so that a rule which quietly drifted between the
# page's prose and the page's code fails here rather than in the world. It reads
# data.json, index.html, sources.json and git, and nothing else. No network.
#
#   python3 check.py            # run every check
#   python3 check.py -v         # and name each one
#
# Author: the Atelier. Licence: Apache-2.0 with the repository.

import json
import re
import statistics
import subprocess
import sys
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
VERBOSE = "-v" in sys.argv

PASS = FAIL = 0
FAILURES = []


def ok(name, cond, detail=""):
    global PASS, FAIL
    if cond:
        PASS += 1
        if VERBOSE:
            print(f"  ok   {name}")
    else:
        FAIL += 1
        FAILURES.append(f"{name} — {detail}")
        print(f"  FAIL {name} — {detail}")


def eq(name, got, want):
    ok(name, got == want, f"got {got!r}, want {want!r}")


def close(name, got, want, tol):
    ok(name, abs(got - want) <= tol, f"got {got!r}, want {want!r} (tol {tol})")


def git(*args):
    return subprocess.run(["git", "-C", str(REPO), *args],
                          check=True, capture_output=True, text=True).stdout


# ---- a second implementation of the two declared counting rules -------------

MD = [
    (re.compile(r"^\s{0,3}#{1,6}\s+", re.M), ""),
    (re.compile(r"`{1,3}([^`]*)`{1,3}"), r"\1"),
    (re.compile(r"\*\*([^*]*)\*\*"), r"\1"),
    (re.compile(r"(?<!\*)\*([^*\n]+)\*(?!\*)"), r"\1"),
    (re.compile(r"~~([^~]*)~~"), r"\1"),
    (re.compile(r"\[([^\]]*)\]\([^)]*\)"), r"\1"),
    (re.compile(r"^\s{0,3}[-*+]\s+", re.M), ""),
    (re.compile(r"^\s{0,3}\d+\.\s+", re.M), ""),
    (re.compile(r"^\s{0,3}>\s?", re.M), ""),
]


def prose(text):
    out = re.sub(r"\A(#[^\n]*\n\n)\*[^*].*?\*\n", r"\1", text, count=1, flags=re.S)
    out = re.sub(r"^\s*---\s*$", "", out, flags=re.M)
    for pat, rep in MD:
        out = pat.sub(rep, out)
    return out


def chars(text):
    """"without spaces and punctuation marks", as the page declares it: drop Z*, C*, P*."""
    return sum(1 for ch in text if unicodedata.category(ch)[0] not in ("Z", "C", "P"))


SEG = r"""
const fs=require('node:fs');
const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
const s=new Intl.Segmenter('en',{granularity:'word'});
const o={};
for(const k of Object.keys(p)){let n=0;for(const x of s.segment(p[k]))if(x.isWordLike)n++;o[k]=n;}
process.stdout.write(JSON.stringify(o));
"""


def uax29(texts):
    tmp = HERE / ".check-seg.json"
    tmp.write_text(json.dumps(texts, ensure_ascii=False), encoding="utf-8")
    try:
        out = subprocess.run(["node", "-e", SEG, str(tmp)],
                             check=True, capture_output=True, text=True).stdout
    finally:
        tmp.unlink(missing_ok=True)
    return json.loads(out)


# ---- load --------------------------------------------------------------------

D = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
PAGE = (HERE / "index.html").read_text(encoding="utf-8")
SRC = json.loads((HERE / "sources.json").read_text(encoding="utf-8"))
H = D["headline"]
CAP = D["cap_seconds"]
MEANS = D["means"]
RATES = D["rates"]

print("A. the corpus is what the repository committed")

texts = {}
for r in D["records"]:
    rev, path = r["source"].split(":", 1)
    texts[r["id"]] = git("show", f"{rev}:{path}")
eq("every record resolves in git", len(texts), len(D["records"]))
eq("record count", len(D["records"]), H["n_records"])
eq("bulletins", sum(1 for r in D["records"] if r["group"] == "bulletin"), H["n_bulletins"])
eq("journal notes", sum(1 for r in D["records"] if r["group"] == "journal"), H["n_journal"])
eq("digest revisions", sum(1 for r in D["records"] if r["group"] == "digest"), H["n_digest"])
ok("nothing predates the constitution",
   all(r["date"] >= "2026-08-30" for r in D["records"]),
   "a record older than PROTOCOL v7 is being judged by its caps")
ok("no record is from the working tree",
   all(r["source"].split(":", 1)[0] != "" for r in D["records"]), "empty revision")

print("B. the counts, recomputed here from the same blobs")

pro = {i: prose(t) for i, t in texts.items()}
words = uax29(pro)
src_words = uax29(texts)
for r in D["records"]:
    i = r["id"]
    eq(f"words {i}", r["words"], words[i])
    eq(f"characters {i}", r["characters"], chars(pro[i]))
    eq(f"source words {i}", r["words_source"], src_words[i])
    eq(f"source characters {i}", r["characters_source"], chars(texts[i]))
    close(f"characters per word {i}", r["cpw"], r["characters"] / r["words"], 0.0006)

print("C. the session grouping is the bulletin plus the notes of its day")

by_date = {}
for r in D["records"]:
    if r["group"] != "digest":
        by_date.setdefault(r["date"], []).append(r)
eq("session count", len(D["sessions"]), len(by_date))
eq("session count matches headline", len(D["sessions"]), H["n_sessions"])
for s in D["sessions"]:
    parts = by_date[s["date"]]
    eq(f"session members {s['date']}", sorted(s["members"]), sorted(p["id"] for p in parts))
    eq(f"session words {s['date']}", s["words"], sum(p["words"] for p in parts))
    eq(f"session characters {s['date']}", s["characters"], sum(p["characters"] for p in parts))
ok("every record except the digest is in exactly one session",
   sum(len(s["members"]) for s in D["sessions"])
   == sum(1 for r in D["records"] if r["group"] != "digest"), "a record is orphaned")

print("D. the transcribed table reproduces the study's own published averages")

for key, want, tol in (("texts", 1.42, 0.005), ("words", 184, 0.5),
                       ("syllables", 370, 0.5), ("characters", 863, 0.5)):
    got = statistics.mean(RATES[c][key] for c in RATES)
    close(f"mean {key}/min over 17 languages", round(got, 3), want, tol)
PD = D["published_dispersion"]
eq("all four published means reproduce", H["means_reproduced"], 4)
for key in ("texts", "words", "syllables", "characters"):
    got = statistics.stdev([RATES[c][key] for c in RATES])
    close(f"SD of {key} means recomputed", PD[key]["sd_of_language_means"], round(got, 2), 0.011)
    got_m = statistics.mean(RATES[c][key] for c in RATES)
    close(f"mean of {key} recomputed", PD[key]["recomputed_mean"], round(got_m, 3), 0.002)
eq("three of four published dispersions reproduce", H["sd_reproduced"], 3)
ok("the one that does not is the words column", not PD["words"]["sd_agrees"],
   "the page names words/min as the exception")
ok("no other reading of the words dispersion gives the printed figure",
   all(abs(PD["words"][k] - D["mean_sd"]["words"]) > 1.0
       for k in ("sd_of_language_means", "mean_of_table2_sds",
                 "rms_of_table2_sds", "between_plus_within")),
   "then the page's claim that it could not be rebuilt is wrong")
ok("no verdict on this page uses a dispersion",
   all("sd" not in k for k in H["grid_doc"]["mean"]),
   "the page says every verdict is computed from the means")
ok("the exception is stated on the page",
   "could not rebuild" in PAGE and "Nothing on this page moves" in PAGE,
   "an arithmetic that did not come out must be printed, not dropped")
eq("seventeen languages", len(RATES), 17)
eq("readers", D["source"]["n_readers"], 436)

print("E. four units, four different fastest languages")

ud = D["unit_disagreement"]
for unit, want in (("texts", "Chi"), ("words", "Eng"),
                   ("syllables", "Spa"), ("characters", "Fin")):
    eq(f"fastest by {unit}", ud["extremes"][unit]["fastest"], want)
    eq(f"fastest by {unit} is really the maximum",
       ud["extremes"][unit]["fastest_value"], max(RATES[c][unit] for c in RATES))
eq("distinct fastest languages", ud["distinct_fastest"], 4)
ok("no ranking pair agrees strongly",
   max(ud["spearman"].values()) < 0.7,
   f"a Spearman of {max(ud['spearman'].values())} would make the units interchangeable")

print("F. every verdict on the page, recomputed")


def over(count, rate):
    return count / rate * 60 > CAP


for scope, items, grid, n in (("records", D["records"], H["grid_doc"], H["n_records"]),
                              ("sessions", D["sessions"], H["grid_session"], H["n_sessions"])):
    for code in list(RATES) + ["mean"]:
        rw = MEANS["words"] if code == "mean" else RATES[code]["words"]
        rc = MEANS["characters"] if code == "mean" else RATES[code]["characters"]
        eq(f"{scope} over by words at {code}", grid[code]["words"],
           sum(1 for x in items if over(x["words"], rw)))
        eq(f"{scope} over by characters at {code}", grid[code]["characters"],
           sum(1 for x in items if over(x["characters"], rc)))
        eq(f"{scope} unit disagreement at {code}", grid[code]["disagree"],
           sum(1 for x in items if over(x["words"], rw) != over(x["characters"], rc)))

eq("headline: over at the mean by words", H["over_mean_words"], H["grid_doc"]["mean"]["words"])
eq("headline: over at the mean by characters", H["over_mean_chars"],
   H["grid_doc"]["mean"]["characters"])
eq("the mean-rate verdict is unanimous", H["over_mean_words"], H["n_records"])

print("G. inside two minutes, and where")

ins = {}
for r in D["records"]:
    hits = []
    for code in RATES:
        if not over(r["words"], RATES[code]["words"]):
            hits.append(f"{code}/words")
        if not over(r["characters"], RATES[code]["characters"]):
            hits.append(f"{code}/characters")
    if hits:
        ins[r["id"]] = hits
eq("cells", H["cells"], 2 * len(RATES))
eq("records inside somewhere", sorted(ins), sorted(H["inside_any"]))
eq("count inside somewhere", H["n_any_in"], len(ins))
eq("count inside everywhere", H["n_all_in"],
   sum(1 for v in ins.values() if len(v) == H["cells"]))
for i, hits in ins.items():
    eq(f"cells for {i}", sorted(H["inside_where"][i]), sorted(hits))
ok("no bulletin and no digest revision is ever inside",
   not any(i.startswith(("bulletin-", "digest-")) for i in ins),
   "the page says every bulletin and digest revision is over in every cell")
eq("best cell still leaves records over", H["best_cell_inside"],
   max(max(H["n_records"] - H["grid_doc"][c]["words"],
           H["n_records"] - H["grid_doc"][c]["characters"]) for c in RATES))
eq("worst unit disagreement", H["max_disagree"],
   max(H["grid_doc"][c]["disagree"] for c in RATES))

print("H. the rate a lawful record would need")

req = sorted(r["words"] / 2 for r in D["records"])
close("minimum required words/min", H["min_required"], req[0], 1e-9)
close("median required words/min", H["median_required"], statistics.median(req), 1e-9)
close("maximum required words/min", H["max_required"], req[-1], 1e-9)
ok("the median record needs more than any published language mean",
   H["median_required"] > max(RATES[c]["words"] for c in RATES),
   "then the claim in §4 is wrong")
close("session reading total, minutes",
      H["session_total_minutes"],
      sum(s["words"] for s in D["sessions"]) / MEANS["words"], 1e-9)
close("session budget ratio", H["session_budget_ratio"],
      H["session_total_minutes"] / (2 * H["n_sessions"]), 1e-9)
close("median session minutes", H["median_session_minutes"],
      statistics.median([s["words"] for s in D["sessions"]]) / MEANS["words"], 1e-9)
ok("the record costs more reading than the rule budgets",
   H["session_budget_ratio"] > 1, "then there is no finding in §4")

print("I. the dimensions opened and reported whatever they said")

eq("symbol variant, counts changed", H["nosym_changed"],
   sum(1 for r in D["records"] if r["characters_nosym"] != r["characters"]))
eq("symbol variant, verdicts changed", H["nosym_verdicts"],
   sum(1 for r in D["records"]
       if over(r["characters"], MEANS["characters"])
       != over(r["characters_nosym"], MEANS["characters"])))
eq("source-vs-prose, counts changed", H["src_changed"],
   sum(1 for r in D["records"] if r["words_source"] != r["words"]))
eq("source-vs-prose, verdicts changed", H["src_verdicts"],
   sum(1 for r in D["records"]
       if over(r["words"], MEANS["words"]) != over(r["words_source"], MEANS["words"])))
ok("both dimensions are stated on the page",
   "changes" in PAGE and "verdicts" in PAGE, "§8 must print them even when they are empty")

print("J. the first refutation condition")

eq("no governing document declares a rate", H["rate_rules"], 0)
eq("nothing is left unadjudicated", H["rate_unadjudicated"], 0)
ok("every candidate carries a reason",
   all(x["verdict"] != "unadjudicated" and x["why"] for x in D["rate_search"]),
   "a hit without a written adjudication is not a ruling")
eq("candidates counted", H["rate_candidates"], len(D["rate_search"]))
ok("the one candidate is this practice's own request",
   all("REQUESTS.md" == x["path"] for x in D["rate_search"]),
   "a candidate outside the request channel needs naming on the page")

print("K. the source is cited and not mirrored")

ok("the PDF is not committed",
   not any(p.suffix.lower() == ".pdf" for p in HERE.iterdir()),
   "PROTOCOL §7 forbids committing third-party source files")
ok("the manifest carries a digest",
   re.fullmatch(r"[0-9a-f]{64}", SRC["primary"]["sha256"]) is not None, "bad sha256")
eq("the doi matches the page's data", SRC["primary"]["doi"], D["source"]["doi"])
ok("the unread source is recorded as unread",
   any("unread" in x["outcome"] for x in SRC["also_probed_and_unreachable"]),
   "a source that was wanted and not read must say so")
for q in SRC["quotations"]:
    pass
quoted = [q["text"] for q in SRC["quotations"]]
ok("every passage quoted on the page is in the manifest",
   all(any(frag in q for q in quoted) for frag in
       ["texts/min, words/min, syllables/min",
        "characterized differently depending on the unit used",
        "due to speech rate ceiling"]),
   "the page quotes something the manifest does not record")

print("L. the page stands on its own")

ok("no external subresource",
   not re.search(r"<(script|img|iframe|object|embed)[^>]+src=", PAGE, re.I),
   "the page must not load anything")
ok("no stylesheet link",
   not re.search(r"<link[^>]+rel=[\"']?stylesheet", PAGE, re.I), "external CSS")
ok("no absolute http(s) reference in markup",
   not re.search(r"(?:src|href)\s*=\s*[\"']https?://", PAGE, re.I), "a live link")
ok("no fetch or XHR", not re.search(r"\b(fetch|XMLHttpRequest|WebSocket)\s*\(", PAGE),
   "the page reaches the network")
ok("a noscript block exists", "<noscript>" in PAGE, "the page must say what it is without JS")
ok("both ledgers are served, not fetched",
   PAGE.count('class="ledger"') == 2, "one of the two readings is missing from the served text")
eq("ledger rows, per-document", PAGE.count('data-w="'),
   H["n_records"] + H["n_sessions"])
for key in ("n_records", "n_any_in", "n_all_in", "n_sessions"):
    ok(f"headline {key} appears in the served text", str(H[key]) in PAGE, "not printed")
ok("the required median rate is printed", f"{H['median_required']:.0f}" in PAGE, "not printed")
ok("the page names its own session", f"session {D['session']}" in PAGE, "not printed")
ok("the page names the commit it was built at", D["repo_head"] in PAGE, "not printed")
ok("the direction of the lean is stated",
   "speech rate ceiling" in PAGE and "overstated" in PAGE,
   "a self-audit must say which way its errors run")
ok("the refusals are stated",
   "Not computable here" in PAGE and "manufactured, not" in PAGE,
   "the two units that were not computed must be on the page")

print("M. the apparatus counts itself")

eq("tamper rounds declared", D["checks"]["tamper"],
   sum(1 for line in (HERE / "tamper.py").read_text(encoding="utf-8").splitlines()
       if re.match(r"^def t\d\d_", line)))
ok("the browser suite is committed beside this one",
   (HERE / "verify.mjs").exists() and str(D["checks"]["browser"]) in PAGE,
   "the page states a browser count that must be checkable")
ok("this suite is exactly the size the page claims", PASS + 1 == D["checks"]["offline"],
   f"ran {PASS + 1}, page says {D['checks']['offline']}")

print()
print(f"{PASS} checks passed, {FAIL} failed")
if FAIL:
    for f in FAILURES:
        print("  -", f)
sys.exit(1 if FAIL else 0)
