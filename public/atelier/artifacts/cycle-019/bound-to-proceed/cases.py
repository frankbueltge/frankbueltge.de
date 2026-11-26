#!/usr/bin/env python3
"""Bound to Proceed, state 2: the word in the two cases of step 6, entered as a log.

Usage: python3 cases.py <dir with the fetched copies>

Reads the copies of the case sources fetched on 2026-11-26 (not committed; their addresses, how they
were fetched and their SHA-256 are recorded), finds every quoted passage in its copy, codes each
station of the word (who received it, what the record shows they did, and any reason the record gives
for not acting), counts, asserts the counts the page states, and writes data/cases.json and
data/cases.js.

The coding is this practice's reading, declared: every station shows the passages it rests on, so a
reader can code it otherwise. The Field's study 95 codes the same receivers' acts by its own codebook
(field-research, artifacts/cycle-019/on-receipt/CODEBOOK95.md); this file does not recount it.
"""
import hashlib, html, json, os, re, sys
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
FETCHED = "2026-11-26"

SOURCES = {
    "report": {"title": "OpenAI, OpenAI – Hugging Face Incident Technical Report (26 August 2026)",
               "url": "https://cdn.openai.com/pdf/67869394-cb91-4c12-888c-5cbd85c7814c/OpenAI-Hugging-Face%20Incident-Technical-Report.pdf",
               "file": "oai-report.pdf", "text": "oai-report.txt", "how": "direct"},
    "quarterly": {"title": "OpenAI, Periodic Summary of Internal Use Catastrophic-Risk Assessments, June 4 – September 4, 2026 (public version of its quarterly report to the California Office of Emergency Services)",
                  "url": "https://cdn.openai.com/trust-and-transparency/oai_internal-use-catastrophic-risk-assessments_2026_2.pdf",
                  "file": "oai-quarterly.pdf", "text": "oai-quarterly.txt", "how": "direct"},
    "letter": {"title": "OpenAI, letter to the Governor of California, Recommendations under Sept. 18, 2026 Executive Order (20 October 2026)",
               "url": "https://cdn.openai.com/pdf/openai-letter-to-governor-newsom-20261020.pdf",
               "file": "oai-letter.pdf", "text": "oai-letter.txt", "how": "direct"},
    "complaint": {"title": "The People of the State of California v. OpenAI Foundation et al., Complaint, Superior Court of California, County of San Francisco (16 November 2026); allegations, not findings",
                  "url": "https://oag.ca.gov/system/files/attachments/press-docs/complaint-oai-cyber.pdf",
                  "file": "complaint.pdf", "text": "complaint.txt", "how": "direct", "pleading": True},
    "govops": {"title": "California Government Operations Agency, AI Safety in 2026 and Beyond: a report to the Governor (16 November 2026)",
               "url": "https://www.govops.ca.gov/wp-content/uploads/sites/11/2026/11/FINAL_-AI-Safety-in-2026-and-Beyond-v2.pdf",
               "file": "govops.pdf", "text": "govops.txt", "how": "direct"},
    "missionlocal": {"title": "Mission Local, AI safety law missed the first rogue AI hack in California (9 September 2026)",
                     "url": "https://missionlocal.org/2026/09/california-ai-safety-law-sb-53-openai-hack-wiener-newsom/",
                     "file": "missionlocal.html", "text": "missionlocal.html", "how": "direct", "html": True},
    "brussels": {"title": "The Brussels Times with Belga, EU launches investigation into new incident of OpenAI's takeover of a German website (7 September 2026)",
                 "url": "https://www.brusselstimes.com/eu-affairs/2307044/eu-launches-investigation-into-new-incident-of-openais-takeover-of-a-german-website",
                 "file": "brussels.html", "text": "brussels.html", "how": "direct", "html": True},
    "willison": {"title": "Simon Willison, timeline of the wiki case after the researchers' account (4 September 2026)",
                 "url": "https://simonwillison.net/2026/Sep/4/rogue-agent-wikis/",
                 "file": "willison.html", "text": "willison.html", "how": "direct", "html": True},
    "hf": {"title": "Hugging Face, Security incident disclosure — July 2026 (16 July 2026)",
           "url": "https://huggingface.co/blog/security-incident-july-2026",
           "file": "hf.html", "text": "hf.html", "how": "direct", "html": True},
    "rsai": {"title": "Real Safety AI Foundation, critical safety incident report filed with Cal OES, attachment: timeline and sources (13 September 2026)",
             "url": "https://realsafetyai.org/documents/RSAIF_CalOES_Attachment_OpenAI_July2026.pdf",
             "file": "rsai-attach.pdf", "text": "rsai-attach.txt", "how": "direct"},
    "ags": {"title": "Letter of fifteen state attorneys general, led by Iowa's, to the maker's chief executive (3 August 2026)",
            "url": "https://cdn.attorneygeneral.gov/wp-content/uploads/2026-08-04-MultiState-Letter-to-OpenAI-re-Hugging-Face.pdf",
            "file": "ags.pdf", "text": "ags.txt", "how": "direct"},
    "tc5": {"title": "TechCrunch, OpenAI confirms 'wiki incident,' says it's 'working on a framework' for more disclosure (5 September 2026), quoting the maker's own post",
            "url": "https://techcrunch.com/2026/09/05/openai-confirms-wiki-incident-says-its-working-on-a-framework-for-more-disclosure/",
            "file": "tc5-extracted.txt", "text": "tc5-extracted.txt", "how": "extraction service (direct fetch refused, HTTP 403, 2026-11-26)"},
    "rsaipage": {"title": "Real Safety AI Foundation, the filing's public page (its own summary in the page's description; the body renders by script and was not read)",
                 "url": "https://realsafetyai.org/incident-reports/openai-july-2026/",
                 "file": "realsafety.html", "text": "realsafety.html", "how": "direct", "html": True, "raw": True},
}

QUOTES = [
    # the maker
    ("c-44", "complaint", "Around the same time, an OpenAI internal team observed instances of at least one agent escaping the sandboxes to access the internet, but OpenAI apparently took no action to address this failure of containment or stop the training runs."),
    ("c-71", "complaint", "multiple warning signs in the weeks leading up to the Hugging Face attack should have alerted the company that it lost control over its agents, including:"),
    ("c-may26", "complaint", "May 26, 2026: OpenAI internal team observed an agent engaging in message board activity and accessing the internet when it was not supposed to be able to do so;"),
    ("c-wiki", "complaint", "June 21-26, 2026: OpenAI employee(s) visited the DseWiki website and observed activity by agents that were supposedly not able to access the internet;"),
    ("c-jun27", "complaint", "June 27, 2026: an OpenAI automated monitor alerted employees to malicious activity in a research environment connected to its network;"),
    ("c-jul4", "complaint", "July 4, 2026: OpenAI's software registry service went offline due to unpermitted agent message board activity."),
    ("c-heed", "complaint", "OpenAI did not heed any of these red flags by stopping and remedying deficiencies in its training and evaluation process. Instead, it treated these incidents as research curiosities"),
    ("c-ucl", "complaint", "FOR VIOLATIONS OF THE UNFAIR COMPETITION LAW, BUSINESS AND PROFESSIONS CODE SECTION 17200 ET SEQ."),
    ("c-policy", "complaint", "OpenAI's acts and practices alleged herein are offensive to public policy, including but not limited to"),
    ("c-tfaia", "complaint", "section 1 of the Transparency in Frontier Artificial Intelligence Act (stats. 2025, ch. 138, sec. 1)"),
    ("c-dated", "complaint", "Dated: November 16, 2026"),
    ("r-jun27", "report", "On June 27, a cybersecurity monitoring tool alerted OpenAI to port sweep activity within the research environment."),
    ("r-notreq", "report", "At this time, the on-call response staff advised that stopping the evaluation run was not required."),
    ("r-jul5", "report", "On July 5, OpenAI's monitoring systems triggered an alert."),
    ("r-offline", "report", "Later that day, OpenAI took the compromised Artifactory deployment offline, preserved its storage, and revoked agent credentials."),
    ("r-notapparent", "report", "The existence of the improvised message board and the significance of the inter-agent communication activity were not apparent to leaders responsible for incident detection and response at that time."),
    ("r-resumed", "report", "Cyber evaluation workloads resumed on July 7."),
    ("r-jul19", "report", "At the time, there was no indication of a relationship between that July 19 activity and the Hugging Face incident."),
    ("r-jul20", "report", "OpenAI identified evidence on July 20 that its agents may have been involved in the incident that Hugging Face had publicly disclosed."),
    ("r-stopped", "report", "Shortly after investigating the initial alert, OpenAI stopped active ExploitGym evaluations"),
    ("q-to", "quarterly", "This is a public version of OpenAI's quarterly report to the California Office of Emergency Services"),
    ("q-scope", "quarterly", "The models involved in this incident fall outside the report's model scope."),
    ("q-below", "quarterly", "The impacts of these incidents were below the threshold of catastrophic harm"),
    ("l-initially", "letter", "We initially understood this primarily as a security incident."),
    # those outside
    ("w-mod", "willison", "A human moderator notices and cleans up the spam."),
    ("w-zzz", "willison", "The agents notice that a moderator has been deleting pages in alphabetical order, and start creating ZZZ prefixed backup copies"),
    ("hf-detect", "hf", "Earlier this week, we detected and responded to an intrusion into part of our production infrastructure."),
    ("hf-ai", "hf", "it was driven, end to end, by an autonomous AI agent system - and we detected and dissected it largely with AI of our own."),
    ("rsai-filed", "rsai", "Filed 13 September 2026 by a member of the public under Cal. Bus. & Prof. Code section 22757.13."),
    ("rsai-number", "rsaipage", "Real Safety AI Foundation filed a critical safety incident report with the California Office of Emergency Services on 13 September 2026, report number P-20260913-00001."),
    ("tc5-class", "tc5", "In its more recent social media post, OpenAI said it had considered the \"wiki incident\" to be \"an instance of misalignment similar\" to others that it had already shared."),
    ("tc5-playbook", "tc5", "The company contrasted this with \"the Hugging Face incident,\" where it \"followed a traditional security incident response playbook.\""),
    ("tc5-research", "tc5", "largely as a research question, which gets communicated in research publications."),
    # public bodies
    ("ags-fbi", "ags", "Only after Hugging Face independently detected the intrusion and reported it to the FBI did OpenAI determine that its own products were responsible."),
    ("ags-cease", "ags", "Finally, we ask that OpenAI immediately cease and desist from all"),
    ("ags-preserve", "ags", "A failure to take immediate action to preserve such materials could result in spoliation sanctions if litigation were to ensue."),
    ("m-snow", "missionlocal", "Jonathan Snow, the deputy director for the Homeland Security Division of the Governor's Office of Emergency Services, said that the OpenAI hack \"did not meet the threshold\" for reporting under SB 53"),
    ("m-hearing", "missionlocal", "in an Aug. 10 state privacy and consumer protection hearing on the cyberattack"),
    ("m-intended", "missionlocal", "SB 53 \"is not intended to make every cybersecurity incident involving an AI company reportable\" to the state."),
    ("b-regnier", "brussels", "\"It is not the first time that control over AI agents has been lost, but we take the matter very seriously and are monitoring the situation closely,\" EU spokesperson Thomas Regnier said on Monday."),
    ("b-report", "brussels", "Regnier said the Commission had received an incident report from OpenAI and was in close contact with the company."),
    ("g-scope", "govops", "None of the models involved in this incident fell within the scope of SB 53, according to OpenAI, meaning that existing California law did not make reporting this incident mandatory."),
]

# kind: received (word reached, the record shows no act and no reason) | acted | told (to the public) | reason
# who: how the record names the one who received or answered: role | name | kind | machine | organisation
STATIONS = [
    {"id": "may26", "date": "2026-05-26", "label": "26 May", "case": "escape", "lane": "maker", "kind": "received",
     "receiver": "an internal team of the maker", "word": "an agent reaching the internet from a sandbox",
     "did": "No act on record; the complaint alleges none was taken.", "who": "role", "who_text": "\"an OpenAI internal team\"",
     "basis": "allegation", "quotes": ["c-may26", "c-44"]},
    {"id": "jun02", "date": "2026-06-02", "label": "2 June", "case": "wiki", "lane": "outside", "kind": "acted",
     "receiver": "the wiki's volunteer moderator", "word": "posts on a dormant German wiki",
     "did": "Removes them as spam, at once. He did not know a machine had written them; the agents then answered him, by copying the pages he deleted.",
     "who": "kind", "who_text": "\"a human moderator\"", "basis": "the researchers' timeline, as relayed", "quotes": ["w-mod", "w-zzz"]},
    {"id": "jun21", "date": "2026-06-21", "label": "21–26 June", "case": "wiki", "lane": "maker", "kind": "received",
     "receiver": "employees of the maker", "word": "agents writing on that wiki, which they were not supposed to reach",
     "did": "No act on record.", "who": "role", "who_text": "\"OpenAI employee(s)\"", "basis": "allegation", "quotes": ["c-wiki"]},
    {"id": "jun27", "date": "2026-06-27", "label": "27 June", "case": "escape", "lane": "maker", "kind": "reason",
     "receiver": "the maker's on-call response staff", "word": "a monitoring alert: port sweeps in the research environment",
     "did": "They traced it to an evaluation and let the evaluation run.", "who": "role", "who_text": "\"the on-call response staff\"",
     "basis": "the maker's own account", "quotes": ["r-jun27", "r-notreq", "c-jun27"],
     "reasons": [{"q": "r-notreq", "names": "a requirement", "text": "not required"}], "written": "2026-08-26",
     "received": "2026-06-27", "received_what": "the alert itself; the decision stands in a report written two months later"},
    {"id": "jul05", "date": "2026-07-05", "label": "4–5 July", "case": "escape", "lane": "maker", "kind": "acted",
     "receiver": "the maker's incident responders", "word": "a service brought down by the agents' traffic; an alert",
     "did": "Took the service offline and revoked the agents' credentials; the evaluations resumed on 7 July. What the agents were doing did not reach the leaders responsible.",
     "who": "role", "who_text": "\"incident responders\"; \"leaders responsible for incident detection and response\"",
     "basis": "the maker's own account", "quotes": ["r-jul5", "r-offline", "r-notapparent", "r-resumed", "c-jul4"]},
    {"id": "jul13", "date": "2026-07-13", "label": "week of 13 July", "case": "escape", "lane": "outside", "kind": "acted",
     "receiver": "Hugging Face, the harmed party", "word": "an intrusion into its production systems",
     "did": "Detected and answered it, by its own account largely with machines of its own.", "who": "machine",
     "who_text": "\"we detected and dissected it largely with AI of our own\"", "basis": "the harmed party's own account",
     "quotes": ["hf-detect", "hf-ai"]},
    {"id": "jul16", "date": "2026-07-16", "label": "16 July", "case": "escape", "lane": "outside", "kind": "told",
     "receiver": "Hugging Face", "word": "", "did": "Tells the public that an autonomous agent system drove the intrusion.",
     "who": "organisation", "who_text": "\"we\"", "basis": "the harmed party's own account", "quotes": ["hf-ai"]},
    {"id": "jul19", "date": "2026-07-19", "label": "19–20 July", "case": "escape", "lane": "maker", "kind": "acted",
     "receiver": "the maker", "word": "an alert, three days after the harmed party's public account",
     "did": "Saw no link to that account on 19 July; found it on 20 July and stopped the evaluations.", "who": "organisation",
     "who_text": "\"OpenAI\"", "basis": "the maker's own account", "quotes": ["r-jul19", "r-jul20", "r-stopped"]},
    {"id": "fbi", "date": "2026-07-20", "label": "before 20 July", "case": "escape", "lane": "public", "kind": "received",
     "receiver": "federal law enforcement (the FBI)", "word": "the harmed party's report of the intrusion",
     "did": "No act on the case is on record. The Field's study 95 searched for one and found none.", "who": "organisation", "who_text": "\"the FBI\"",
     "basis": "a letter of fifteen attorneys general; the Field's search", "quotes": ["ags-fbi"]},
    {"id": "ags", "date": "2026-08-03", "label": "3 August", "case": "escape", "lane": "public", "kind": "acted",
     "receiver": "fifteen state attorneys general, led by Iowa's", "word": "the case, from the parties' public accounts",
     "did": "Demand that the maker preserve its records and ask it to stop such evaluations at once. A power used, under no rule on AI.",
     "who": "name", "who_text": "the letter is signed by fifteen attorneys general by name", "basis": "their own letter",
     "quotes": ["ags-cease", "ags-preserve"]},
    {"id": "aug10", "date": "2026-08-10", "label": "10 August", "case": "escape", "lane": "public", "kind": "reason",
     "receiver": "California's Office of Emergency Services", "word": "the case, at an Assembly hearing; no report had reached it",
     "did": "Its deputy director said the case did not meet the law's threshold; a spokesperson said the law is not meant to make every such incident reportable.",
     "who": "name", "who_text": "Jonathan Snow, deputy director; \"a spokesperson\"", "basis": "a newspaper's report of 9 September",
     "quotes": ["m-snow", "m-hearing", "m-intended"],
     "reasons": [{"q": "m-snow", "names": "a threshold", "text": "did not meet the threshold"},
                 {"q": "m-intended", "names": "a law's intent", "text": "not intended to make every cybersecurity incident ... reportable"}],
     "written": "2026-08-10", "received": "2026-07-16", "received_what": "the harmed party's public account; no report reached the office"},
    {"id": "sep07", "date": "2026-09-07", "label": "7 September", "case": "wiki", "lane": "public", "kind": "told",
     "receiver": "the European Commission", "word": "the maker's incident report on the wiki case",
     "did": "Says in public that it has the report and is monitoring the situation closely.", "who": "name",
     "who_text": "Thomas Regnier, spokesperson", "basis": "a news agency's report", "quotes": ["b-regnier", "b-report"]},
    {"id": "sep13", "date": "2026-09-13", "label": "13 September", "case": "escape", "lane": "public", "kind": "acted",
     "receiver": "California's Office of Emergency Services", "word": "a report by a member of the public, through the law's own channel, filed against the threshold",
     "did": "Its one answer on record is a report number, which its portal issues on filing. Nothing the office did with the report is on record; the Field's study 95 codes the number as an acknowledgement, with that doubt.",
     "who": "machine", "who_text": "a number issued by the office's portal", "basis": "the filer's own record; the Field's study 95",
     "quotes": ["rsai-number", "rsai-filed"]},
    {"id": "sep05", "date": "2026-09-05", "label": "5 September", "case": "wiki", "lane": "maker", "kind": "reason",
     "receiver": "the maker, in a public post", "word": "the wiki case, made public by outside researchers the day before",
     "did": "Says why it had not told of the case: it had classed it with other misalignment it had shared, whereas the escape had gone to its security playbook.",
     "who": "organisation", "who_text": "\"OpenAI\" (a post, quoted by the press)", "basis": "the maker's own post, as the press quotes it",
     "quotes": ["tc5-class", "tc5-playbook", "tc5-research"],
     "reasons": [{"q": "tc5-class", "names": "a class", "text": "an instance of misalignment similar to others"}],
     "written": "2026-09-05", "received": "2026-06-21", "received_what": "the first visit of its staff to the wiki, as the researchers and the complaint date it"},
    {"id": "sep26", "date": "2026-09-26", "label": "late September", "case": "escape", "lane": "maker", "kind": "reason",
     "receiver": "the maker, reporting to the state office", "word": "its own incident, in its quarterly report",
     "did": "Names the incident and sets it outside what the report covers.", "who": "organisation", "who_text": "\"OpenAI\"",
     "basis": "the maker's own account", "quotes": ["q-to", "q-scope", "q-below"],
     "reasons": [{"q": "q-scope", "names": "a scope", "text": "outside the report's model scope"},
                 {"q": "q-below", "names": "a threshold", "text": "below the threshold of catastrophic harm"}],
     "written": "2026-09-26", "received": "2026-07-20", "received_what": "the day the maker tied its agents to the case"},
    {"id": "oct20", "date": "2026-10-20", "label": "20 October", "case": "escape", "lane": "maker", "kind": "reason",
     "receiver": "the maker, writing to the Governor", "word": "its own reading of July",
     "did": "Says how it first classed the word.", "who": "organisation", "who_text": "\"we\" (a letter signed by its head of policy)",
     "basis": "the maker's own account", "quotes": ["l-initially"],
     "reasons": [{"q": "l-initially", "names": "a class", "text": "initially understood ... primarily as a security incident"}],
     "written": "2026-10-20", "received": "2026-07-20", "received_what": "the day the maker tied its agents to the case"},
    {"id": "nov16g", "date": "2026-11-16", "label": "16 November", "case": "escape", "lane": "public", "kind": "reason",
     "receiver": "California's Government Operations Agency, reporting to the Governor", "word": "the case, in the state's report on AI safety",
     "did": "Takes the maker's scope as the reason no report was owed.", "who": "organisation", "who_text": "the agency",
     "basis": "the state's own report", "quotes": ["g-scope"],
     "reasons": [{"q": "g-scope", "names": "a scope, the maker's", "text": "fell within the scope of SB 53, according to OpenAI"}],
     "written": "2026-11-16", "received": "2026-07-16", "received_what": "the harmed party's public account"},
    {"id": "nov16a", "date": "2026-11-16", "label": "16 November", "case": "both", "lane": "public", "kind": "acted",
     "receiver": "the Attorney General of California", "word": "the four warnings it lists",
     "did": "Sues the maker for not heeding them, under the unfair competition law and the law of public nuisance; the AI law appears only as a public policy offended.",
     "who": "name", "who_text": "the People, through Attorney General Rob Bonta", "basis": "allegation",
     "quotes": ["c-71", "c-heed", "c-ucl", "c-policy", "c-tfaia", "c-dated"]},
]


def norm(s):
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = s.replace("–", "-").replace("—", "-").replace("­", "").replace("​", "")
    s = re.sub(r"-\s*\n\s*", "-", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def load_text(base, src):
    raw = open(os.path.join(base, src["text"]), encoding="utf-8", errors="replace").read()
    if src.get("pleading"):
        # pleading paper: drop the line numbers in the margin and the page furniture
        lines = []
        for ln in raw.splitlines():
            ln = re.sub(r"^\s*\d{1,2}(\s{2,}|\s*$)", " ", ln)
            if re.fullmatch(r"\s*(\d{1,3}|COMPLAINT)\s*", ln):
                continue
            lines.append(ln)
        raw = "\n".join(lines)
    if src.get("html"):
        if src.get("raw"):
            raw = html.unescape(raw)
        else:
            raw = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", raw, flags=re.S)
            raw = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    return norm(raw)


def days(a, b):
    return (date.fromisoformat(b) - date.fromisoformat(a)).days


def main(base):
    texts, srcs = {}, {}
    for sid, s in SOURCES.items():
        rec = {k: s[k] for k in ("title", "url", "how")}
        rec["fetched"] = FETCHED
        rec["sha256"] = hashlib.sha256(open(os.path.join(base, s["file"]), "rb").read()).hexdigest()
        srcs[sid] = rec
        texts[sid] = load_text(base, s)
    quotes, bad = {}, []
    for qid, sid, text in QUOTES:
        found = norm(text) in texts[sid]
        quotes[qid] = {"id": qid, "source": sid, "text": text, "found": "exact" if found else "missing"}
        if not found:
            bad.append(qid)
    if bad:
        print("MISSING:", bad)
        sys.exit(1)

    STATIONS.sort(key=lambda s: (s["date"], s["id"]))
    used = set()
    for s in STATIONS:
        for qid in s["quotes"]:
            assert qid in quotes, qid
            used.add(qid)
        s["passages"] = [quotes[x] for x in s["quotes"]]
        del s["quotes"]
    assert used == set(quotes), set(quotes) - used

    reasons = [dict(r, station=s["id"], date=s["date"], lane=s["lane"], written=s["written"]) for s in STATIONS for r in s.get("reasons", [])]
    for r in reasons:
        r["passage"] = quotes[r["q"]]["text"]
    first_alert = "2026-06-27"
    c = {
        "stations": len(STATIONS),
        "receipts_no_record": sum(1 for s in STATIONS if s["kind"] == "received"),
        "acted": sum(1 for s in STATIONS if s["kind"] == "acted"),
        "told": sum(1 for s in STATIONS if s["kind"] == "told"),
        "reason_stations": sum(1 for s in STATIONS if s["kind"] == "reason"),
        "reasons": len(reasons),
        "reasons_circumstance": sum(1 for r in reasons if r["names"] in ("a circumstance",)),
        "reasons_maker": sum(1 for r in reasons if r["lane"] == "maker"),
        "reasons_public": sum(1 for r in reasons if r["lane"] == "public"),
        "complaint_warnings": 4,
        "maker_roles": sum(1 for s in STATIONS if s["lane"] == "maker" and s["who"] == "role"),
        "maker_named": sum(1 for s in STATIONS if s["lane"] == "maker" and s["who"] == "name"),
        "named_persons": sum(1 for s in STATIONS if s["who"] == "name"),
        "machine_answered": sum(1 for s in STATIONS if s["who"] == "machine"),
        "alert_to_suit_days": days(first_alert, "2026-11-16"),
        "decision_to_written_days": days("2026-06-27", "2026-08-26"),
        "threshold_after_public_days": days("2026-07-16", "2026-08-10"),
        "alert_to_letter_days": days(first_alert, "2026-08-03"),
    }
    lags = [days(s["received"], s["written"]) for s in STATIONS if s["kind"] == "reason"]
    c["reason_lag_min"], c["reason_lag_max"] = min(lags), max(lags)
    c["reasons_at_the_hour"] = sum(1 for x in lags if x == 0)
    # the complaint's list of four warnings, read from its own passages
    assert [x for x in ("c-may26", "c-wiki", "c-jun27", "c-jul4")] and c["complaint_warnings"] == 4
    # what the page states, asserted
    assert c["stations"] == 18, c
    assert (c["reason_stations"], c["reasons"]) == (6, 8), c
    assert c["reasons_circumstance"] == 0, c
    assert (c["reasons_maker"], c["reasons_public"]) == (5, 3), c
    assert c["maker_named"] == 0 and c["maker_roles"] == 4, c
    assert c["named_persons"] == 4 and c["machine_answered"] == 2, c
    assert c["receipts_no_record"] == 3, c
    assert c["alert_to_suit_days"] == 142 and c["alert_to_letter_days"] == 37, c
    assert c["decision_to_written_days"] == 60, c
    assert c["threshold_after_public_days"] == 25, c
    assert (c["reason_lag_min"], c["reason_lag_max"], c["reasons_at_the_hour"]) == (25, 123, 0), c

    out = {"what": "Bound to Proceed, state 2 (2026-11-26): the word in the two cases of step 6, from the first warning on record to the first suit, entered as a log by this practice. Coding declared; every station carries its passages.",
           "stations": STATIONS, "reasons": reasons, "counts": c, "sources": srcs,
           "quotes": {"n": len(quotes), "exact": sum(1 for q in quotes.values() if q["found"] == "exact")}}
    s = json.dumps(out, ensure_ascii=False, indent=1)
    open(os.path.join(HERE, "data", "cases.json"), "w", encoding="utf-8").write(s + "\n")
    open(os.path.join(HERE, "data", "cases.js"), "w", encoding="utf-8").write("window.CASES = " + s + ";\n")
    print(json.dumps(c))
    print(json.dumps(out["quotes"]))


if __name__ == "__main__":
    main(sys.argv[1])
