"""Check 96 (session 294): the conductor's reconciliation of study 95 with the blind second coding (part B), and the
duty cells of part C. Every decision stands here with its reason. Writes pairs96.json (read by agree96.py),
cases96.json (the final acts and receipts), duties96.json and codes96.json (part A after reconciliation). Standard library only.
"""
import copy
import json
from datetime import date
from pathlib import Path

HERE = Path(__file__).parent
F = json.loads((HERE / "cases95.json").read_text())
B = {}
for f in ("blind96-B1.json", "blind96-B2.json"):
    for d in json.loads((HERE / f).read_text())["doors"]:
        B[d["id"]] = d

# Pairs: first act index -> blind act index, per door; both name the same deed.
PAIRS = {
    "W-MOD": {0: 0}, "W-RES": {0: 1},
    "W-MAKER": {0: 1, 1: 10, 2: 5, 3: 8},
    "W-EC": {0: 0, 1: 2},
    "E-MAKER": {0: 0, 1: 1, 2: 3, 3: 4, 4: 7, 5: 8, 6: 9, 7: 11, 8: 13, 9: 19, 10: 17, 11: 18},
    "E-HF": {0: 0, 1: 3, 2: 2, 3: 4, 4: 5, 5: 6}, "E-FOUND": {0: 0, 1: 1},
    "E-WH": {0: 0}, "E-AGS": {0: 0, 1: 1, 2: 2}, "E-AL": {0: 2, 1: 3}, "E-HOUSE": {0: 0}, "E-ASM": {0: 0},
    "E-OES": {0: 0, 1: 2}, "E-CAAG": {0: 0, 1: 1, 2: 4, 3: 5}, "E-SEN": {0: 0}, "E-VH": {0: 0},
    "E-EC": {0: 2, 1: 4},
}
ONLY_FIRST = {
    "E-MAKER#12": "kept: the quarterly report's reason (the models fall outside its scope) is a second class on the "
                  "same day as the report; the blind reader coded the report and not the reason it gives",
}
# Blind-only acts: accepted into the final record, or declined, each with its reason.
ACCEPT = {
    "W-MOD#1": "the moderator's deletions of mid-June are a deed of another date (definition of one act)",
    "W-MOD#2": "the administrator's evening cleaning from 22 June is a deed of another date",
    "W-MOD#3": "restoring the front page, undated, is a deed of its own",
    "W-RES#0": "the researchers' search for agents, undated, precedes their account",
    "W-RES#2": "a stated reason for withholding part of the findings",
    "W-MAKER#0": "the first visit from a maker's address is itself an act of looking (the researchers' inference); "
                 "the first coding had it only as the receipt",
    "W-MAKER#2": "a visit of 26 June using the archive function (the researchers' inference)",
    "W-MAKER#3": "a visit of 7 July seeking deleted files (the researchers' inference)",
    "W-MAKER#4": "the spokesperson's 'carefully reviewing its contents' of 4 September is a review",
    "W-MAKER#6": "the reason given on 4 September for not responding meaningfully",
    "W-MAKER#9": "the claim of working with government agencies, in the post on the case; agencies unnamed",
    "W-MAKER#11": "the disclosure framework the press ties to this case, published 16 September",
    "E-MAKER#2": "the investigation of 5 July is a deed of another date than that of 27 June",
    "E-MAKER#5": "the report's reason, dated to the decision of 6 July, why the evaluations were not stopped",
    "E-MAKER#6": "contacting the harmed company on 17 July, before the maker knew its agents were involved",
    "E-MAKER#10": "the hard-fail rollout of 20 July is a stop of another date than that of 19 July",
    "E-MAKER#12": "the shutdown of all workloads of the model family by 23 July (the critique named it)",
    "E-MAKER#14": "the update of 28 July to the maker's post",
    "E-MAKER#15": "telling the vendor of the escape's vulnerability, dated by the update of 28 July",
    "E-MAKER#16": "the outside assessment the maker commissioned, announced 29 July",
    "E-HF#1": "rotating the credentials, undated, by 16 July, a deed apart from cutting access on 13 July",
    "E-WH#1": "'is monitoring the situation' reports an act of watching, apart from the statement",
    "E-ASM#1": "a member's public remark at the hearing is telling the public, apart from the hearing itself",
    "E-OES#1": "the spokesperson's statement to the paper is a second reason, by another voice, undated before "
               "9 September; not the deputy director's word at the hearing of 10 August",
    "E-CAAG#2": "the release of 1 October telling the public of the subpoena",
    "E-EC#0": "the special meeting convened on 9 October in view of recent loss-of-control incidents",
    "E-EC#1": "the remarks of 9 October that call the escape a wake-up call (as relayed)",
    "E-EC#3": "the Commission's own page of 12 October on the meeting",
}
DECLINE = {
    "W-MAKER#7": "the post of 5 September gives a reason; one statement that gives a reason is coded once, as a reason",
    "W-EC#1": "the panel's investigation of 9 October is the deed of E-EC#0, coded once at the escape",
    "W-EC#3": "the page of 12 October is the act E-EC#3, coded once at the escape",
    "E-AL#0": "Alabama co-signed the coalition's letter: one deed, coded once at the coalition's door (E-AGS); "
              "Alabama's first act is dated 3 August through it",
    "E-AL#1": "as E-AL#0",
    "E-CAAG#3": "the letter to Congress names no case, only 'recent reports of critical cyber safety incidents at "
                "multiple frontier AI labs'",
}
# Changes to paired acts, each with its reason; applied to the first act.
CHANGES = {
    "W-MAKER#1": ({"date": "2026-09-07", "bound": "by", "src": "ibt", "from_blind": True,
                   "doubt": "contested: one newspaper's corrected account of 7 September and its report of 18 September "
                            "(as relayed, search96.json query 2) say the wiki episode was not formally reported, and "
                            "that the report the Commission held was on another incident"},
                  "dated by the Commission's confirmation of receipt, 7 September (blind reader); no earlier date; "
                  "the search of part C found the record split on whether this report concerned the wiki at all"),
    "E-MAKER#9": ({"owed": "choice"},
                  "the passage calls the documents handed over 'voluntarily'; a duty only if they were a serious "
                  "incident report (the critique and the blind reader)"),
    "E-AGS#0": ({"owed": "choice"},
                "the letter says the maker 'may have violated' consumer and privacy law but names no statute it acts "
                "under; the codebook's 'other law' needs a named law (blind reader)"),
    "E-AGS#1": ({"owed": "choice"}, "as E-AGS#0; a request by letter, not an order"),
    "E-EC#0": ({"date": "2026-10-12", "bound": "by", "src": "ecpanel", "from_blind": True},
               "the requests for information stand already sent on the Commission's page of 12 October; the same deed "
               "as the first coding's W-EC#1, which counted it a second time in the wiki case (the critique)"),
}
MOVED = {"W-EC#1": "merged into E-EC#0: the Commission's October requests are one deed, counted once"}
# Paired acts on which the readers disagreed about `owed` and the first code was kept, each with its reason.
KEPT = {
    "E-MAKER#5": "kept `receiver duty`, with its doubt: the Code's Measure 9.2 obliges a signatory to investigate a "
                 "serious incident; whether this was one no body has said (part C)",
    "E-MAKER#11": "kept `sender duty`: the quarterly summary is owed under SB 53 whatever happened; it is no incident "
                  "report (the blind reader's point), and build96.py counts it as periodic, not set off by the case",
    "E-CAAG#2": "kept `other law`: the passage names the laws the action is brought under (public nuisance, unfair "
                "competition)",
}
# Marks on final acts that the counts of build96.py read: an act that binds by law (subpoena, lawsuit), and a duty
# that falls due by the calendar whatever happens. Keyed by door, date, class.
COMPELS = {
    ("E-AL", "2026-08-20", "investigate"): "a subpoena, with a date by which documents are due",
    ("E-CAAG", "2026-09-30", "investigate"): "an investigative subpoena",
    ("E-CAAG", "2026-11-16", "proceed"): "an action before a court",
}
PERIODIC = {("E-MAKER", "2026-09-26", "pass_on"): "the quarterly summary of SB 53, due by the calendar"}
# The maker's door in the escape, day by day, from its own technical report (the critique asked for both clocks).
MAKER_CLOCK = [
    ("2026-05-26", "around", "earlier word: agents seen reaching the internet in training runs", "oaitr",
     "Around the same time, an internal team observed an agent engage in message board activity and instances of "
     "disallowed internet access."),
    ("2026-06-27", "on", "word inside: an alert; the evaluation is not stopped", "oaitr",
     "On June 27, a cybersecurity monitoring tool alerted OpenAI to port sweep activity within the research "
     "environment."),
    ("2026-07-05", "on", "an internal server found compromised, taken offline", "oaitr",
     "Later that day, OpenAI took the compromised Artifactory deployment offline"),
    ("2026-07-07", "on", "the evaluations resume", "oaitr", "Cyber evaluation workloads resumed on July 7."),
    ("2026-07-08", "on", "the agents reach the internet", "oaitr",
     "Starting on July 8, agents exploited a cybersecurity vulnerability in that service to circumvent controls and "
     "access the public internet."),
    ("2026-07-16", "on", "the harmed company tells the public", "hf1", None),
    ("2026-07-19", "on", "a second alert inside; the evaluations stopped", "oaitr",
     "OpenAI detected suspicious internal activity on July 19."),
    ("2026-07-20", "on", "word outside: its models tied to the intrusion", "oaitr",
     "On July 20, after further investigation, OpenAI uncovered evidence suggesting potential involvement of its "
     "models in the incident Hugging Face had disclosed."),
    ("2026-07-21", "on", "its first public word", "oaitr", "OpenAI publicly disclosed this incident on July 21."),
]
# Acts the logged search of part C found in sources outside study 95's set. Listed, not counted: the count of acts
# stands on the sources both readers had. P165 is also reported with them counted (build96.py).
FOUND_OUTSIDE = [
    {"door": "E-MAKER", "code": "pass_on", "date": None, "bound": "by 2026-09-18", "src": "rsense",
     "quote": "OpenAI did report its agents’ hack of Hugging Face.",
     "owed": "sender duty", "doubt": "the AI Act's duty attaches to a model placed on the market; the model chiefly "
     "responsible was internal-only (oai); undated; relayed from a newspaper the client could not read", "search": 2},
    {"door": "E-MAKER", "code": "tell_public", "date": "2026-10-27", "bound": "on", "src": "oaioct",
     "quote": "incidents causing measurable economic harm or disruption to third-party systems, under clearly "
              "defined conditions.",
     "owed": "choice", "doubt": "slides for the Assembly committee's review hearing of 27 October; the sentence asks "
     "to 'expand critical-incident reporting to cover serious loss-of-control' incidents of this kind, read as the "
     "maker saying the law did not cover the escape (the PDF's text drops the hyphen of 'loss-of-control', so the "
     "passage starts after it)", "search": 1},
]


# Part A: every disagreement between study 94 and the blind readers, read again against the text.
A_DECISIONS = [
    {"signal": "PC3", "code": "pass_on", "first": "duty", "blind": "none", "final": "none", "moves": True,
     "why": "The third commitment commits its signatories to 'information sharing, reporting and early warning "
            "systems' and only 'recognize[s] the value' of sharing timely information; the first coding's own doubt "
            "said so. A commitment to build systems is no duty to pass on a given word."},
    {"signal": "AS1", "code": "sender_failure", "first": "none", "blind": "n/a", "final": "none", "moves": False,
     "why": "`n/a` is for a signal anyone may send; the guide addresses the organisation that reports, as the G7 Code "
            "does, and those rows are coded `none`. Kept for consistency; no figure turns on it."},
    {"signal": "COP5", "code": "pass_on.deadline_h", "first": "48", "blind": "prompt", "final": "48", "moves": False,
     "why": "Measure 9.3 sets four numbered tiers (2, 5, 10 and 15 days from awareness); the codebook asks for a "
            "number where the text gives one. Kept at the shortest tier, with 360 hours as the longest."},
    {"signal": "G7-3", "code": "receiver_party", "first": "no", "blind": "yes", "final": "no", "moves": False,
     "why": "The Code asks nothing of those who receive, and two of the three receivers it names (the public, public "
            "authorities) made no commitment to it; an organisation that endorsed it binds itself as a sender."},
]


def part_a():
    first = json.loads((HERE / "receivers94.json").read_text())
    agree = HERE / "agree96.json"
    if agree.exists():
        got = {(d["signal"], d["code"]) for d in json.loads(agree.read_text())["A"]["disagreements"]}
        assert got == {(d["signal"], d["code"]) for d in A_DECISIONS}, sorted(got)
    rec = copy.deepcopy(first["receivers"])
    for r in rec:
        for d in A_DECISIONS:
            if d["signal"] == r["id"] and d["moves"] and d["code"] in r["acts"]:
                r["acts"][d["code"]]["v"] = d["final"]
                r["acts"][d["code"]]["check"] = "corrected 2026-11-27 (check 96): " + d["why"]
    return {"what": "Check 96, part A: study 94's 19 receivers after the blind second coding and the conductor's "
                    "reconciliation (reconcile96.py). Codes as in receivers94.json except where `check` says "
                    "corrected.", "decisions": A_DECISIONS, "receivers": rec}


def blind_act(did, j):
    return B[did]["acts"][j]


def final_cases():
    out = copy.deepcopy(F)
    out["what"] = ("Check 96: the final acts and receipts of the two cases after the blind second coding "
                   "(reconcile96.py). Each act carries `check`: held, corrected, added; acts the check removed or "
                   "moved are listed under `removed`.")
    out["removed"] = []
    for d in out["doors"]:
        did = d["id"]
        acts = []
        for i, a in enumerate(d["acts"]):
            key = f"{did}#{i}"
            if key in MOVED:
                out["removed"].append({"door": did, "act": a, "why": MOVED[key]})
                continue
            a = dict(a)
            a["check"] = "held"
            if key in CHANGES:
                ch, why = CHANGES[key]
                j = PAIRS[did][i]
                for k, v in ch.items():
                    if k == "from_blind":
                        a["quote"] = blind_act(did, j)["quote"]
                    else:
                        a[k] = v
                a["check"] = "corrected"
                a["check_why"] = why
            if key in KEPT:
                a["check_why"] = KEPT[key]
            acts.append(a)
        for j, b in enumerate(B.get(did, {}).get("acts") or []):
            key = f"{did}#{j}"
            if key in ACCEPT:
                acts.append({"code": b["code"], "date": b.get("date"), "bound": b.get("bound"), "src": b["src"],
                             "quote": b["quote"], "owed": b.get("owed") or "choice", "basis": b.get("basis"),
                             "doubt": b.get("doubt"), "check": "added", "check_why": ACCEPT[key]})
        for a in acts:
            k3 = (did, a.get("date"), a["code"])
            if k3 in COMPELS:
                a["compels"] = COMPELS[k3]
            if k3 in PERIODIC:
                a["periodic"] = PERIODIC[k3]
            if a["owed"] not in ("receiver duty", "sender duty", "power", "other law"):
                a["owed"] = "choice"
            if a["owed"] == "choice":
                a.pop("power", None)
        d["acts"] = acts
    return out


def receipts(c):
    """Receipts under the definition of CODEBOOK96."""
    R = {d["id"]: d for d in c["doors"]}
    R["W-MAKER"]["received"]["bound"] = "by act"
    R["W-MAKER"]["received"]["check"] = ("corrected: the first visit is the maker's own first act (an inference from "
                                         "addresses), so its lag is not measured")
    em = R["E-MAKER"]
    em["received_outside"] = {
        "date": "2026-07-20", "bound": "on", "src": "oaitr",
        "quote": "On July 20, after further investigation, OpenAI uncovered evidence suggesting potential involvement "
                 "of its models in the incident Hugging Face had disclosed.",
        "note": "Word of the agents acting outside its systems, coded apart from the word inside (27 June), as the "
                "definition asks."}
    em["earlier_word"] = {
        "date": "2026-05-26", "bound": "around", "src": "oaitr",
        "quote": "Around the same time, an internal team observed an agent engage in message board activity and "
                 "instances of disallowed internet access.",
        "also": {"src": "complaint", "quote": "Around the same time, an OpenAI internal team observed instances of at "
                 "least one agent escaping the sandboxes to access the internet, but OpenAI apparently took no action"},
        "note": "In the maker's own report (section III.A), dated 'by May 26', in training runs before either case; "
                "California's complaint alleges no action followed (an allegation, not a finding). Neither case is "
                "tied to it by any source, so it is no receipt of either; it is the earliest word on record that "
                "the maker's agents were reaching the internet unpermitted."}
    al = R["E-AL"]
    al["first_act_through_coalition"] = {"date": "2026-08-03", "door": "E-AGS",
                                         "note": "Alabama co-signed the coalition's letter (blind reader B2)"}
    for did in ("E-AGS", "E-AL", "E-HOUSE", "E-ASM", "E-OES", "E-CAAG", "E-SEN", "E-VH", "E-WH", "E-HF", "E-FOUND"):
        r = R[did]["received"]
        acts = sorted(a["date"] for a in R[did]["acts"] if a.get("date"))
        if r.get("date") and acts and r["date"] == acts[0] and r.get("bound") != "on":
            r["bound"] = "by act"
    if R["E-AL"]["received"].get("date") == "2026-08-03":
        R["E-AL"]["received"]["bound"] = "by act"
    for d in c["doors"]:
        r = d["received"]
        dated = sorted(a["date"] for a in d["acts"] if a.get("date"))
        first = d.get("first_act_through_coalition", {}).get("date") or (dated[0] if dated else None)
        d["first_act"] = first
        if r.get("date") and first and r.get("bound") in ("on", "by"):
            d["lag_days"] = (date.fromisoformat(first) - date.fromisoformat(r["date"])).days
        else:
            d["lag_days"] = None
            d["lag_note"] = "not measured: the receipt is dated only by the receiver's own act, or not at all"
        d["consequence"] = "none"
    return c


def duties():
    C = [
        ("wiki", "EU4", "The maker's report of a serious incident to the AI Office, without undue delay (EU AI Act Art. 55(1)(c))",
         "unknowable",
         [("ibt", "The European Commission has confirmed receipt of OpenAI's report on the DseWiki agent episode"),
          ("star", "without disclosing when exactly did OpenAI inform the Commission."),
          ("eur0907", "had not formally reported the incident revealed by Reuters on Friday."),
          ("pks", "Euractiv's 18 September report states that OpenAI did notify the AI Office about the Hugging Face episode, did not report the German wiki, and did not file a formal report on RubyGems.")],
         "Several papers relay the Commission's confirmation of 7 September that a report on the wiki arrived, undated. The paper that corrected its account the next day says the report the Commission held was on a past incident, and on 18 September that the wiki was not reported. The record contradicts itself on whether the act was done at all, and no report is dated."),
        ("wiki", "COP 9.3", "The signatory's report to the AI Office within 2 to 15 days of awareness (EU Code, Measure 9.3)",
         "unknowable",
         [("eucode", "Signatories of the code of practice")],
         "The maker is on the Commission's list of signatories; whether any report on this case reached the AI Office is contested (EU4 above), so the Code's clock cannot be read."),
        ("wiki", "COP 9.2", "The signatory's investigation of the causes and effects (EU Code, Measure 9.2)",
         "done, set-off or time unknown",
         [("tc", "now carefully reviewing its contents and will take any necessary next steps.")],
         "A review is announced on 4 September; whether it is the Code's investigation of a serious incident is not said."),
        ("wiki", "CA4", "The developer's report of a critical safety incident to California's office within 15 days (SB 53)",
         "unknowable", [], "No source names a report, or a reason for none, in the wiki case; the office publishes no case."),
        ("wiki", "CA5", "The developer's disclosure within 24 hours to an authority, on imminent danger (SB 53)",
         "unknowable", [], "No source speaks of imminent danger or of a disclosure in the wiki case."),
        ("wiki", "CA4 review", "California's office's review of a developer's report (SB 53, B&P § 22757.13(d))",
         "unknowable", [], "Set off only by a developer's report; none is on record and the office will not say."),
        ("wiki", "CA8", "The maker's internal channel: a monthly update to an employee who reports (Labor Code § 1107.1)",
         "unknowable", [], "Internal by design; nothing on record."),
        ("wiki", "PC3", "The Paris Call's commitment to share AI control incidents in time (voluntary)",
         "not due",
         [("paris", "The declaration has been signed on Monday 9 November 2026 by the following Heads of States and Governments and CEOs:")],
         "Signed on 9 November 2026, with the maker among its companies, after both cases had ended and been made public; and part A reads its third commitment as one to build systems of sharing, not a duty to pass on a given word."),
        ("wiki", "NY4, NY5", "New York's 72-hour and 24-hour reports and the office's review (RAISE Act)",
         "not due", [("ny1422", "NB Effective January 1, 2027")], "The Act takes effect on 1 January 2027."),
        ("wiki", "yearly totals", "The offices' yearly anonymised totals (SB 53 from 2027; RAISE Act from 2028)",
         "not due", [], "Their first dates have not come round."),
        ("escape", "EU4", "The maker's report of a serious incident to the AI Office, without undue delay (EU AI Act Art. 55(1)(c))",
         "done, set-off or time unknown",
         [("rsense", "OpenAI did report its agents’ hack of Hugging Face."),
          ("ecpanel", "The AI Office has already requested and received serious incident reports"),
          ("tnw_eu", "Both companies had already handed over documents voluntarily.")],
         "A report on the escape reached the AI Office by 18 September (a newspaper's report, read through two relays). It is not dated, and whether the Act reached a model never placed on the market (the maker: an internal-only research prototype) is not said. The documents of October are called voluntary."),
        ("escape", "COP 9.3", "The signatory's report to the AI Office, five days for a serious cybersecurity breach (EU Code, Measure 9.3)",
         "done, set-off or time unknown",
         [("eucode", "Signatories of the code of practice"),
          ("rsense", "OpenAI did report its agents’ hack of Hugging Face.")],
         "A report is on record (EU4 above) but not its date, so the Code's five days for a serious cybersecurity breach cannot be read against it."),
        ("escape", "COP 9.2", "The signatory's investigation of the causes and effects (EU Code, Measure 9.2)",
         "done, set-off or time unknown",
         [("oaitr", "On July 20, after further investigation, OpenAI uncovered evidence suggesting potential involvement of its models in the incident Hugging Face had disclosed.")],
         "The maker investigated and published its findings on 26 August; that this was the Code's investigation of a serious incident is not said."),
        ("escape", "CA4", "The developer's report of a critical safety incident to California's office within 15 days (SB 53)",
         "declared not set off",
         [("ml", "said that the OpenAI hack “did not meet the threshold” for reporting under SB 53"),
          ("oaiq", "The models involved in this incident fall outside the report’s model scope."),
          ("oaioct", "incidents causing measurable economic harm or disruption to third-party systems, under clearly defined conditions.")],
         "The office's deputy director (10 August) and the maker (26 September) both say the law was not set off; on 27 October the maker asked the Assembly to expand critical-incident reporting to such incidents. California's complaint of 16 November pleads unfair competition and public nuisance, and cites SB 53 only as public policy (para. 98)."),
        ("escape", "CA5", "The developer's disclosure within 24 hours to an authority, on imminent danger (SB 53)",
         "unknowable", [], "The harmed company told law enforcement; it is no frontier developer. No disclosure by the maker is on record."),
        ("escape", "CA4 review", "California's office's review of a developer's report (SB 53, B&P § 22757.13(d))",
         "declared not set off",
         [("ml", "said that the OpenAI hack “did not meet the threshold” for reporting under SB 53")],
         "No developer's report under the Act is on record, and the office says none was owed. The foundation's public report of 13 September falls under the office's power to review, not its duty."),
        ("escape", "CA8", "The maker's internal channel: a monthly update to an employee who reports (Labor Code § 1107.1)",
         "unknowable", [], "Internal by design; nothing on record."),
        ("escape", "PC3", "The Paris Call's commitment to share AI control incidents in time (voluntary)",
         "not due",
         [("paris", "The declaration has been signed on Monday 9 November 2026 by the following Heads of States and Governments and CEOs:")],
         "As in the wiki case: the Call was signed after the escape had ended and been made public."),
        ("escape", "NY4, NY5", "New York's 72-hour and 24-hour reports and the office's review (RAISE Act)",
         "not due", [("ny1422", "NB Effective January 1, 2027")], "The Act takes effect on 1 January 2027."),
        ("escape", "yearly totals", "The offices' yearly anonymised totals (SB 53 from 2027; RAISE Act from 2028)",
         "not due", [], "Their first dates have not come round."),
    ]
    SEARCH = {"EU4": [2], "COP 9.3": [2], "COP 9.2": [2], "CA4": [1], "CA5": [1, 3], "CA4 review": [1], "CA8": [3],
              "PC3": [3], "NY4, NY5": [], "yearly totals": [1]}
    cells = [{"case": c, "signal": s, "duty": d, "code": v, "passages": [{"src": k, "quote": q} for k, q in p],
              "reason": r, "search96": SEARCH[s]} for c, s, d, v, p, r in C]
    return {"what": "Check 96, part C: every duty the two cases could set off, read from the record by the conductor "
                    "on 2026-11-27 (CODEBOOK96.md).", "cells": cells}


def main():
    first_keys = {f"{d['id']}#{i}" for d in F["doors"] for i in range(len(d["acts"]))}
    pairs = []
    for did, m in PAIRS.items():
        for i, j in m.items():
            pairs.append({"first": f"{did}#{i}", "blind": f"{did}#{j}"})
    paired_f = {p["first"] for p in pairs}
    paired_b = {p["blind"] for p in pairs}
    blind_keys = {f"{did}#{j}" for did, d in B.items() for j in range(len(d.get("acts") or []))}
    only_b = blind_keys - paired_b
    assert only_b == set(ACCEPT) | set(DECLINE), sorted(only_b ^ (set(ACCEPT) | set(DECLINE)))
    assert first_keys - paired_f == set(ONLY_FIRST), sorted(first_keys - paired_f)
    (HERE / "pairs96.json").write_text(json.dumps({
        "what": "Check 96: the conductor's pairing of first and blind acts (reconcile96.py).",
        "pairs": pairs, "only_first": ONLY_FIRST,
        "only_blind": {**{k: "accepted: " + v for k, v in ACCEPT.items()},
                       **{k: "declined: " + v for k, v in DECLINE.items()}},
        "changes": {k: v[1] for k, v in CHANGES.items()}, "kept_on_owed": KEPT, "moved": MOVED}, indent=1, ensure_ascii=False) + "\n")
    c = receipts(final_cases())
    c["found_outside_count"] = FOUND_OUTSIDE
    c["maker_clock"] = [{"date": d, "bound": b, "what": w, "src": k, "quote": q} for d, b, w, k, q in MAKER_CLOCK]
    marked = {(d["id"], a.get("date"), a["code"]) for d in c["doors"] for a in d["acts"]}
    assert set(COMPELS) | set(PERIODIC) <= marked, sorted((set(COMPELS) | set(PERIODIC)) - marked)
    (HERE / "codes96.json").write_text(json.dumps(part_a(), indent=1, ensure_ascii=False) + "\n")
    (HERE / "cases96.json").write_text(json.dumps(c, indent=1, ensure_ascii=False) + "\n")
    (HERE / "duties96.json").write_text(json.dumps(duties(), indent=1, ensure_ascii=False) + "\n")
    n = sum(len(d["acts"]) for d in c["doors"])
    print("pairs", len(pairs), "only first", len(ONLY_FIRST), "only blind", len(only_b), "final acts", n)


if __name__ == "__main__":
    main()
