#!/usr/bin/env python3
"""Bound to Proceed, state 3 (2026-11-27): the check.

The check starts nothing new. It reads the work's claims a second time against their sources, chases the weakest
one (section V: "the public receiver ... is not even answerable") to its source, and answers what the critique of
26 November left open. It does not use build.py's counts: the figures it states are recounted here from the Field's
own files at their commits and from the passages found again in copies fetched on 27 November.

Run from this folder:  python3 check.py <dir with the copies fetched on 2026-11-27>
Needs, in that dir: tfeu228.html, tfeu265.html, ccp1085-extracted.txt, unclos7.htm, inquiry1912.html, solas.txt
(pdftotext of the exhibit), missionlocal.html, field-receivers94.json (field-research 3dcd20b),
field-blind93-shown.json (field-research 5bb7db7), field-cases95.json (field-research b1ee490).
Reads data/cases.json (section III, as cases.py rebuilt it after the check's corrections) and data/log.json.
Writes data/check.json and data/check.js. Nothing here asks a model; every verdict is this practice's reading,
declared beside the passages it rests on, so a reader can judge it otherwise.
"""
import difflib, hashlib, html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = sys.argv[1]
fails = []


def ok(cond, msg):
    print(("ok   " if cond else "FAIL ") + msg)
    if not cond:
        fails.append(msg)


def norm(s):
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = s.replace("–", "-").replace("—", "-").replace("­", "").replace("​", "").replace(" ", " ")
    return re.sub(r"\s+", " ", s).strip()


def page_text(name):
    raw = open(os.path.join(BASE, name), encoding="utf-8", errors="replace").read()
    if name.endswith((".html", ".htm")):
        raw = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", raw, flags=re.S)
        raw = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    return norm(raw)


def sha(name):
    return hashlib.sha256(open(os.path.join(BASE, name), "rb").read()).hexdigest()


SOURCES = {
    "tfeu228": {"title": "Treaty on the Functioning of the European Union, Article 228 (consolidated version, OJ C 202, 7.6.2016)",
                "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:12016E228", "file": "tfeu228.html", "how": "direct"},
    "tfeu265": {"title": "Treaty on the Functioning of the European Union, Article 265 (consolidated version, OJ C 202, 7.6.2016)",
                "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:12016E265", "file": "tfeu265.html", "how": "direct"},
    "ccp1085": {"title": "California Code of Civil Procedure, section 1085 (writ of mandate)",
                "url": "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CCP&sectionNum=1085",
                "file": "ccp1085-extracted.txt",
                "how": "extraction service (direct fetch refused, HTTP 403, 2026-11-27; a second research tool was over its limit)"},
    "unclos": {"title": "United Nations Convention on the Law of the Sea (1982), Part VII, articles 94 and 98",
               "url": "https://www.un.org/depts/los/convention_agreements/texts/unclos/part7.htm", "file": "unclos7.htm", "how": "direct"},
    "inquiry1912": {"title": "British Wreck Commissioner's Inquiry (1912), Report, \"The Circumstances in Connection with the SS Californian\"",
                    "url": "https://www.titanicinquiry.org/BOTInq/BOTReport/botRepCalifornian.php", "file": "inquiry1912.html", "how": "direct"},
    "solas": {"title": "SOLAS, consolidated edition 2014, chapter V, regulation 33 (as filed in the PCA's record, exhibit UA-867-AM; read through its OCR layer)",
              "url": "https://files.pca-cpa.org/pcadocs/2017-06/8.%20Ukraine%20-%20Reply%20-%20Exhibits/8.%20Ukraine%20-%20Reply%20-%20Exhibits/UA-867-AM.pdf",
              "file": "solas.txt", "sha_file": "solas.pdf", "how": "direct; text from its OCR layer"},
    "missionlocal": {"title": "Mission Local, AI safety law missed the first rogue AI hack in California (9 September 2026)",
                     "url": "https://missionlocal.org/2026/09/california-ai-safety-law-sb-53-openai-hack-wiener-newsom/",
                     "file": "missionlocal.html", "how": "direct"},
    "field94": {"title": "The Field, study 94, receivers94.json (field-research 3dcd20b)",
                "url": "https://raw.githubusercontent.com/frankbueltge/field-research/3dcd20be555d36c58bebdead061dc7d3dd0c33a2/artifacts/cycle-019/on-receipt/receivers94.json",
                "file": "field-receivers94.json", "how": "Git, at the commit"},
    "field93": {"title": "The Field, study 93, blind93-shown.json (field-research 5bb7db7): the senders' duties of California's SB 53",
                "url": "https://raw.githubusercontent.com/frankbueltge/field-research/5bb7db7dd42fe9a61ad479c8911807be58100e9a/artifacts/cycle-018/told-in-time/blind93-shown.json",
                "file": "field-blind93-shown.json", "how": "Git, at the commit"},
    "field95": {"title": "The Field, study 95, cases95.json (field-research b1ee490)",
                "url": "https://raw.githubusercontent.com/frankbueltge/field-research/b1ee490d8c239ffa02af52e8884ac7925aa282f9/artifacts/cycle-019/on-receipt/cases95.json",
                "file": "field-cases95.json", "how": "Git, at the commit"},
}

# the passages the check rests on, each found again in its copy (the SOLAS exhibit through its OCR layer: these
# short phrases are found exactly)
PASSAGES = [
    ("tfeu228-views", "tfeu228", "which shall have a period of three months in which to inform him of its views"),
    ("tfeu228-complaints", "tfeu228", "shall be empowered to receive complaints from any citizen of the Union or any natural or legal person residing or having its registered office in a Member State concerning instances of maladministration in the activities of the Union institutions, bodies, offices or agencies"),
    ("tfeu265-called", "tfeu265", "The action shall be admissible only if the institution, body, office or agency concerned has first been called upon to act."),
    ("tfeu265-position", "tfeu265", "If, within two months of being so called upon, the institution, body, office or agency concerned has not defined its position"),
    ("tfeu265-called-short", "tfeu265", "has first been called upon to act"),
    ("tfeu265-position-short", "tfeu265", "has not defined its position"),
    ("ccp-compel", "ccp1085", "to compel the performance of an act which the law specially enjoins, as a duty resulting from an office, trust, or station"),
    ("unclos-946", "unclos", "Upon receiving such a report, the flag State shall investigate the matter and, if appropriate, take any action necessary to remedy the situation."),
    ("unclos-947", "unclos", "Each State shall cause an inquiry to be held by or before a suitably qualified person or persons into every marine casualty or incident of navigation on the high seas involving a ship flying its flag and causing loss of life"),
    ("unclos-981c", "unclos", "after a collision, to render assistance to the other ship, its crew and its passengers and, where possible, to inform the other ship of the name of his own ship"),
    ("i12-lord", "inquiry1912", "Mr. Stanley Lord, Master"),
    ("solas-unnecessary", "solas", "in the special circumstances of the case, considers it unreasonable or unnecessary to proceed"),
    ("solas-inform", "solas", "taking into account the recommendation of the Organization to inform the appropriate search and rescue service accordingly"),
    ("m-investigators", "missionlocal", "investigators agreed not to examine whether the company took appropriate action on what it knew and when"),
    ("f94-review", "field94", "Office of Emergency Services shall review critical safety incident reports submitted by frontier developers and may review reports submitted by members of the public."),
    ("f93-quarterly", "field93", "transmit to the Office of Emergency Services a summary of any assessment of catastrophic risk resulting from internal use of its frontier models every three months"),
]

# ---------------------------------------------------------------- 1. the passages, found again
texts = {k: page_text(s["file"]) if not s["file"].endswith(".json") else norm(open(os.path.join(BASE, s["file"]), encoding="utf-8").read().replace('\\"', '"'))
         for k, s in SOURCES.items()}
srcs = {}
for k, s in SOURCES.items():
    srcs[k] = {"title": s["title"], "url": s["url"], "how": s["how"], "fetched": "2026-11-27",
               "sha256": sha(s.get("sha_file", s["file"]))}
found = {}
for pid, sid, text in PASSAGES:
    f = norm(text) in texts[sid]
    found[pid] = {"id": pid, "source": sid, "text": text, "found": "exact" if f else "missing"}
    ok(f, f"passage {pid} found word for word in {sid}")

# ---------------------------------------------------------------- 2. recounts from the Field's own files
f94 = json.load(open(os.path.join(BASE, "field-receivers94.json"), encoding="utf-8"))["receivers"]
pb = [r for r in f94 if r["receiver"] == "public body"]
law = [r for r in pb if r["binding"] == "law"]
vol = [r for r in pb if r["binding"] != "law"]
def single_clock(r):
    return any(a.get("deadline_h") not in (None, "periodic") for a in r["acts"].values())
recount = {
    "receivers": len(f94), "public_bodies": len(pb), "law_public": len(law), "voluntary_public": len(vol),
    "law_public_answer": sum(1 for r in law if r["acts"]["acknowledge"]["v"] == "duty"),
    "law_public_clock": sum(1 for r in law if single_clock(r)),
    "law_public_silent": sum(1 for r in law if (r.get("receiver_failure") or {}).get("v", "none") != "none"),
    "law_public_review_duty": sum(1 for r in law if r["acts"]["investigate"]["v"] == "duty"),
    "voluntary_ids": sorted(r["id"] for r in vol),
}
ok((recount["receivers"], recount["public_bodies"], recount["law_public"], recount["voluntary_public"]) == (19, 11, 8, 3),
   f"the Field's file: 19 receivers, 11 public bodies, 8 under a law, 3 under a voluntary text ({recount['voluntary_ids']})")
ok(recount["law_public_answer"] == 0 and recount["law_public_clock"] == 0 and recount["law_public_silent"] == 0,
   "of the 8 under a law: none must answer the sender, none has a clock for a single report, none a consequence for silence")
LOG = json.load(open(os.path.join(HERE, "data", "log.json"), encoding="utf-8"))
ok(LOG["counts"]["public_bodies"] == recount["public_bodies"] and LOG["counts"]["receivers"] == recount["receivers"],
   "the work's build counts the same population")

f95 = json.load(open(os.path.join(BASE, "field-cases95.json"), encoding="utf-8"))
acts = [a for d in f95["doors"] for a in d["acts"]]
recount["f95_doors"], recount["f95_acts"] = len(f95["doors"]), len(acts)
recount["f95_doubt"] = sum(1 for a in acts if a.get("doubt"))
recount["f95_choice"] = sum(1 for a in acts if a["owed"] == "choice")
ok((recount["f95_doors"], recount["f95_acts"], recount["f95_choice"]) == (18, 47, 37),
   "the Field's study 95: 47 acts at 18 doors, 37 owed by nothing")
oes = [a for d in f95["doors"] if d["id"] == "E-OES" for a in d["acts"] if a["code"] == "acknowledge"]
ok(len(oes) == 1 and oes[0]["date"] == "2026-09-13", "the office's one acknowledgement is dated 13 September")

# ---------------------------------------------------------------- 3. section III, read again
CASES = json.load(open(os.path.join(HERE, "data", "cases.json"), encoding="utf-8"))
K = CASES["counts"]
Q2 = {p["id"]: p for s in CASES["stations"] for p in s["passages"]}
ok(CASES["quotes"]["exact"] == CASES["quotes"]["n"] == 47, "section III: 47 of 47 passages found word for word in the copies of 27 November")
STATE2_SHA = {   # data/cases.json of state 2 (ulysses 1767594)
    "report": "dd635cf6e5f39f0e1f646f08c36549090d77156ed89cbd3d733ed496648cae9c",
    "quarterly": "12d14ae95ef84f19b5090c16d0cf26a506637065f00eafe200841e86068c20b4",
    "letter": "efa79cf613212c4901629ffa54b6ec79ff90b2fa0c6f20e4a812bd0e148f60b8",
    "complaint": "8bdb2ced76570d8af68c754145f1345b126cee082f68cf643307fe6e76f3926e",
    "govops": "b6c2197fefb0357b6ad254b8c9604e334b81447580a98c4dba9866d18581ec88",
    "rsai": "59d08765f62faec6017302b7d24c5f99bd857cb971a9dc08c2f0a2e56c27cc7e",
    "ags": "3bfd56930039f27c107247aad0c80945c5f20f39d9dfb229668895710313a79a",
}
same = [k for k, v in STATE2_SHA.items() if CASES["sources"][k]["sha256"] == v]
recount["pdfs_same"] = len(same)
ok(len(same) == 7, f"the seven PDFs came back byte for byte the same: {same}")
spk = [r for r in CASES["reasons"] if r["q"] == "m-intended"][0]
recount["spokesperson_lag"] = spk["lag_days"]
ok(spk["written"] == "2026-09-09" and spk["lag_days"] == 55, "the spokesperson's reason: by 9 September, 55 days after the first public account")
oes_lag = (lambda a, b: (__import__("datetime").date.fromisoformat(b) - __import__("datetime").date.fromisoformat(a)).days)("2026-07-16", "2026-09-13")
recount["portal_after_public"] = oes_lag
ok(oes_lag == 59, "the office's number came 59 days after the first public account (the Studio's figure)")
ok(K["reasons_by_choice"] == 3 and K["reasons_answering_a_demand"] == 5 and K["reasons_rule_of_receipt"] == 0,
   "the reasons: 3 by choice, 5 answering another demand, 0 a rule of receipt")
ok(K["stations"] == 19 and K["reason_stations"] == 7, "section III: 19 entries, 7 with a reason")

# ---------------------------------------------------------------- 4. the verdicts
# Each item: what state 2 said (claim), the verdict, where on the page, and the finding as a list of strings and
# passages ({"q3": id} found above, {"q2": id} a section III passage cases.py found).
ITEMS = [
    {"id": "answerable", "verdict": "withdrawn", "where": "V",
     "claim": "Over the public bodies no text gives anyone a power, so the public receiver is not even answerable.",
     "finding": ["Older public law gives others that power. When the European Ombudsman finds maladministration, the Commission, its AI Office included, ",
                 {"q3": "tfeu228-views"}, ". A California court may issue a writ ", {"q3": "ccp-compel"}, "; and the state's AI law does enjoin one act on receipt: ",
                 {"q3": "f94-review"}, " The office's deputy director answered legislators at a hearing on 10 August. The public receiver is answerable, as the maker is, by laws older than any rule on AI. What no text gives the sender is an answer owed to it."]},
    {"id": "by-choice", "verdict": "corrected", "where": "III",
     "claim": "All 8 reasons were given by choice.",
     "finding": ["Read by their own records, 3 were given by choice: a technical report, a social post, a statement to a newspaper. 5 answered a demand from elsewhere: legislators at a hearing (1); the report the law asks of the maker, ",
                 {"q3": "f93-quarterly"}, ", which asks for no reason (2); and the Governor's executive order of 18 September (2). None answered a rule of receipt: no text in the log asks a receiver why."]},
    {"id": "spokesperson", "verdict": "corrected", "where": "III",
     "claim": "A spokesperson of the state office said at the hearing of 10 August that the law is not meant to make every such incident reportable.",
     "finding": ["The newspaper prints it as a statement to the paper: ", {"q2": "m-statement"}, ". The entry now stands by 9 September, 55 days after the first public account."]},
    {"id": "hour", "verdict": "corrected", "where": "III",
     "claim": "Written at the hour: 0.",
     "finding": ["That counted publication, not writing. Each reason stands in a record made public 25 to 123 days after the word; whether anyone wrote a reason down at the time is not on record, and the Californian's log was private too. For the public bodies, which no report reached, the word is dated from the first public account. The tile now says what it counts: on record at the hour."]},
    {"id": "span", "verdict": "corrected", "where": "I",
     "claim": "None of the 11 public bodies must answer the sender, keep a clock on receipt, or face anything if it stays silent.",
     "finding": ["Three of the 11 rest on voluntary texts that bind no government: the Paris Call twice and the EU Code of Practice. Cut to the span that compares, the 8 public bodies a law names: none must answer the sender, none has a clock for a single report, none faces a consequence for silence. Recounted from the Field's own file, not from this work's build."]},
    {"id": "reverse", "verdict": "corrected", "where": "V",
     "claim": "The AI instruments do the reverse of the sea: they bind the sender and give the receivers powers.",
     "finding": ["Like with like, the sea's own public receivers have the same blanks. The flag State that gets a report: ", {"q3": "unclos-946"},
                 " It has no clock, owes no reason and faces nothing if silent; the coast station is only recommended to answer. And the sea binds the ship that did the harm, as the AI laws bind the maker: ",
                 {"q3": "unclos-981c"}, ". What the sea has and the AI texts lack is a rule for the bystander placed to help."]},
    {"id": "solas-reason", "verdict": "corrected", "where": "III",
     "claim": "The reason the sea's rule asks for is a circumstance; the 2026 reasons are classes.",
     "finding": ["The regulation accepts a reason when the master, ", {"q3": "solas-unnecessary"},
                 ". 'Not required' comes close to 'unnecessary'; 'a circumstance' was this work's word for its phrase. The sea's rule does not forbid a reason of class. What it adds is the hour, the ship's own log, and the rescue service, ",
                 {"q3": "solas-inform"}, "."]},
    {"id": "answer", "verdict": "corrected", "where": "V",
     "claim": "To answer is an act at an hour, addressed to the one who sent the word.",
     "finding": ["A number a portal issues on filing meets that. Older public law asks for more: an action against a Union institution for failing to act lies once it ",
                 {"q3": "tfeu265-called-short"}, " and, within two months, ", {"q3": "tfeu265-position-short"}, ". An answer takes a position on the word; a receipt does not. The office's number came 59 days after the public knew, as the Studio offered, and took no position: the record of 2026 holds no answer to one who sent word."]},
    {"id": "house", "verdict": "corrected", "where": "IV",
     "claim": "Every correction offered was taken up, as the rule says; the architect's silence is read as an answer.",
     "finding": ["The 567 offers are not word that a machine is acting on its own: they show the same form of rule, kept by machines among themselves. 54 of 54 measures obedience to a rule that forbids declining a correction, not answering. And read from the other side, the architect's rule hands the decision to the machines whenever he is silent: the programme's question in miniature, not his privilege."]},
    {"id": "public", "verdict": "added", "where": "II",
     "claim": "The critique: the work is mute on the step's 'or to tell the public'.",
     "finding": ["So is the sea at the hour: none of its four rows must tell the public, and a log is kept for a later inquiry. The sea tells the public afterwards, case by case: ",
                 {"q3": "unclos-947"}, ". The AI laws owe a yearly anonymised total, which the Field doubts is published. Both tell late."]},
    {"id": "whose", "verdict": "added", "where": "III",
     "claim": "The critique: do the maker's leaders answer for what their responders did not pass up?",
     "finding": ["Not on record. The inquiry of 1912 named the man: ", {"q3": "i12-lord"}, ". The suit of 2026 names two companies and a hundred unknown names: ",
                 {"q2": "c-defendants"}, ". The outside investigators the maker let in, a newspaper reports, ", {"q3": "m-investigators"}, "."]},
    {"id": "stakes", "verdict": "added", "where": "II",
     "claim": "The critique: the night's 1,490 dead lend the cases an urgency the page never weighs.",
     "finding": ["The borrowing is of form, not of stakes: the deaths of 1912 against a spammed wiki and an intrusion into a company's systems. Section II now says so."]},
    {"id": "sibling", "verdict": "held", "where": "III, V",
     "claim": "The Field's study 95: 47 acts at 18 doors; of twelve acts of force or pressure, at most two under an AI instrument's power.",
     "finding": ["Held as the Field states them at its commit, now with its limits beside them: 8 of the 47 acts carry a doubt, 8 of its passages were read only through an extraction service, and the Field's own check, which recodes the cases blind, began this morning."]},
    {"id": "passages", "verdict": "held", "where": "III",
     "claim": "Every passage of section III found word for word in its source.",
     "finding": ["Found again in copies fetched on 27 November: 47 of 47, the 42 of state 2 and 5 the check added. The seven PDFs came back byte for byte the same."]},
    {"id": "phone", "verdict": "corrected", "where": "I, III",
     "claim": "The critique: at 390 pixels the log, the 2026 log and the reasons run off the screen with no cue.",
     "finding": ["Each wide figure now says that it scrolls sideways and how far it runs, and the reasons table stacks into one card per reason."]},
    {"id": "labels", "verdict": "corrected", "where": "I",
     "claim": "The critique: two rows of the log read 'office in the Department of F…'.",
     "finding": ["A cut label now keeps the words that tell two rows apart."]},
]
for it in ITEMS:
    for seg in it["finding"]:
        if isinstance(seg, dict) and "q3" in seg:
            ok(found.get(seg["q3"], {}).get("found") == "exact", f"item {it['id']}: q3 {seg['q3']} found")
        if isinstance(seg, dict) and "q2" in seg:
            ok(Q2.get(seg["q2"], {}).get("found") == "exact", f"item {it['id']}: q2 {seg['q2']} found")
verdicts = {}
for it in ITEMS:
    verdicts[it["verdict"]] = verdicts.get(it["verdict"], 0) + 1
recount["items"] = len(ITEMS)
recount["verdicts"] = verdicts

out = {"what": "Bound to Proceed, state 3 (2026-11-27): the check. The work's claims read a second time against their sources, the weakest chased to its source, the critique of 26 November answered. Verdicts are this practice's reading; every figure here is recounted by check.py from the Field's files at their commits and from passages found again.",
       "date": "2026-11-27", "items": ITEMS, "passages": found, "sources": srcs, "counts": recount}
s = json.dumps(out, ensure_ascii=False, indent=1)
open(os.path.join(HERE, "data", "check.json"), "w", encoding="utf-8").write(s + "\n")
open(os.path.join(HERE, "data", "check.js"), "w", encoding="utf-8").write("window.CHECK = " + s + ";\n")
print(json.dumps(recount))
if fails:
    print("FAILED:", len(fails))
    sys.exit(1)
