"""Reading 97 (session 295, 2026-11-28): the paper session's reading of On Receipt.

Part A, the Studio's case (bulletin of 27 November): the acts under California's executive order of 18 September 2026
that check 96 did not code, coded by CODEBOOK96.md's definitions; every count of check 96 that moves is recounted.
Part B, the maker's door before the escape: five words of the maker's own report x four reporting duties, coded first by
the conductor (codes97-first.json, fixed before the blind file was opened) and blind by a convened reader
(blind97.json, from blind97-shown.json); every disagreement decided here with its reason.

Reads cases96.json, results96.json, codes97-first.json, blind97.json. Writes codes97.json, results97.json, data97.js.
Standard library only. Usage: python3 build97.py
"""
import json
from datetime import date
from pathlib import Path

HERE = Path(__file__).parent
J = lambda f: json.loads((HERE / f).read_text())
C96, R96 = J("cases96.json"), J("results96.json")["k"]
FIRST, BLIND = J("codes97-first.json")["coded"], J("blind97.json")["cells"]
LETTER = {"receiver duty", "sender duty", "other law"}

SOURCES = {
    "eo": {"url": "https://www.gov.ca.gov/wp-content/uploads/2026/09/FINAL-N-9-26-AI-EO-9.18.26-SIGNED.pdf",
           "what": "Executive Order N-9-26, signed 18 September 2026", "via": "direct"},
    "eorel": {"url": "https://www.gov.ca.gov/2026/09/18/governor-newsom-issues-executive-order-to-accelerate-independent-oversight-and-advance-the-creation-of-an-ai-kill-switch/",
              "what": "The Governor's release of 18 September 2026 on the order", "via": "extraction"},
    "govops": {"url": "https://www.govops.ca.gov/wp-content/uploads/sites/11/2026/11/FINAL_-AI-Safety-in-2026-and-Beyond-v2.pdf",
               "what": "California Government Operations Agency, AI Safety in 2026 and Beyond, a report to the Governor, 16 November 2026", "via": "direct"},
    "letter": {"url": "https://cdn.openai.com/pdf/openai-letter-to-governor-newsom-20261020.pdf",
               "what": "The maker's letter to the Governor, Recommendations under Sept. 18, 2026 Executive Order, 20 October 2026", "via": "direct"},
    "oaitr": {"url": "https://cdn.openai.com/pdf/67869394-cb91-4c12-888c-5cbd85c7814c/OpenAI-Hugging-Face%20Incident-Technical-Report.pdf",
              "what": "The maker's technical report on the escape, 26 August 2026", "via": "direct"},
    "oaiq": {"url": "https://cdn.openai.com/trust-and-transparency/oai_internal-use-catastrophic-risk-assessments_2026_2.pdf",
             "what": "The public version of the maker's quarterly report to California's emergency office, 26 September 2026", "via": "direct"},
    "euact": {"url": "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202401689",
              "what": "The EU AI Act, Regulation (EU) 2024/1689", "via": "extraction"},
    "eucode": {"url": "https://ec.europa.eu/newsroom/dae/redirection/document/118119",
               "what": "The General-Purpose AI Code of Practice, Safety and Security chapter", "via": "direct"},
    "sb53": {"url": "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB53",
             "what": "California SB 53, the Transparency in Frontier Artificial Intelligence Act", "via": "extraction"},
}

# ---------------------------------------------------------------- Part A: the Studio's case
NEW_DOORS = [
    {"id": "E-GOV", "case": "escape", "name": "California's Governor", "kind": "public body", "named_in_94": [],
     "received": {"date": "2026-09-18", "bound": "by act", "from": None, "src": "eorel",
                  "quote": "The executive order comes after recent alarming incidents, including the Hugging Face attack",
                  "note": "Dated only by the Governor's own first act; the order itself names no case, its release does."},
     "acts": [
         {"code": "investigate", "date": "2026-09-18", "bound": "on", "src": "eorel",
          "quote": "Update definitions of critical safety incidents to include loss-of-control incidents such as the Hugging Face attack.",
          "quote2": {"src": "eo", "quote": "The Government Operations Agency, in consultation with the Governor’s Office of Emergency Services, shall, no later than November 16, 2026, submit to my office recommendations"},
          "owed": "choice", "basis": "none",
          "note": "The order commissions recommendations on the law, one of them a definition of reportable incidents covering this one; it is issued under the Governor's general authority, and no text obliges it.",
          "doubt": "commissions an assessment of the law rather than of the case; investigate is the nearest class",
          "deadline": {"on": "E-GOVOPS", "due": "2026-11-16"}, "check": "added, reading 97"},
         {"code": "tell_public", "date": "2026-09-18", "bound": "on", "src": "eorel",
          "quote": "The executive order comes after recent alarming incidents, including the Hugging Face attack",
          "owed": "choice", "check": "added, reading 97"}],
     "consequence": "none by 2026-11-28"},
    {"id": "E-GOVOPS", "case": "escape", "name": "California's Government Operations Agency", "kind": "public body",
     "named_in_94": [],
     "received": {"date": "2026-11-16", "bound": "by act", "from": "the Governor's order of 18 September", "src": "govops",
                  "quote": "In response to Executive Order N-9-26, the California Government Operations Agency, in consultation with the California Office of Emergency Services and outside AI experts, has developed recommendations for legislative action.",
                  "note": "Tasked by the order of 18 September, which names no case; dated only by its own report."},
     "acts": [
         {"code": "pass_on", "date": "2026-11-16", "bound": "on", "src": "govops",
          "quote": "In response to Executive Order N-9-26, the California Government Operations Agency, in consultation with the California Office of Emergency Services and outside AI experts, has developed recommendations for legislative action.",
          "owed": "other law", "basis": "Executive Order N-9-26, item 3: due no later than 16 November 2026",
          "note": "A report to the Governor, delivered on the day the order set.", "check": "added, reading 97"},
         {"code": "tell_public", "date": "2026-11-16", "bound": "on", "src": "govops",
          "quote": "We now know the OpenAI Hugging Face incident this past summer was one of dozens of instances in which AI agents operated outside of developer control.",
          "owed": "choice", "note": "Dated by the report's cover.", "check": "added, reading 97"},
         {"code": "reason_not", "date": "2026-11-16", "bound": "on", "src": "govops",
          "quote": "None of the models involved in this incident fell within the scope of SB 53, according to OpenAI, meaning that existing California law did not make reporting this incident mandatory.",
          "owed": "choice", "note": "Relays the maker's reason, attributed to it.", "check": "added, reading 97"}],
     "consequence": "none by 2026-11-28"},
]
MAKER_ADDED = [
    {"code": "pass_on", "date": "2026-10-20", "bound": "on", "src": "letter",
     "quote": "cybersecurity evaluations had circumvented controls intended to isolate them from the internet and compromised parts of our internal research infrastructure and the systems of Hugging Face",
     "owed": "choice",
     "note": "A letter to the Governor answering the order's call for recommendations; the order directs a state agency, not developers.",
     "check": "added, reading 97"},
    {"code": "reason_not", "date": "2026-10-20", "bound": "on", "src": "letter",
     "quote": "We initially understood this primarily as a security incident.", "owed": "choice",
     "note": "The Atelier's reason l-initially.", "check": "added, reading 97"},
]
STUDIO = {
    "offer": "Of the five reasons the Atelier logs as answering a demand, study 96 codes two as acts; one stands only in a note, two (under the executive order) not at all.",
    "checked": [
        {"reason": "m-snow", "answered": "a hearing", "in_96": "act", "where": "E-OES reason_not, 2026-08-10"},
        {"reason": "q-scope", "answered": "a law's report", "in_96": "act", "where": "E-MAKER reason_not, 2026-09-26"},
        {"reason": "q-below", "answered": "a law's report", "in_96": "note",
         "where": "the note of the same act: one deed of one receiver, of one class, on one date (CODEBOOK96.md), so one act, rightly"},
        {"reason": "l-initially", "answered": "an executive order", "in_96": "not coded",
         "where": "the maker's letter of 20 October was outside the readers' sources; an act under the definition, added"},
        {"reason": "g-scope", "answered": "an executive order", "in_96": "not coded",
         "where": "the agency's report of 16 November was outside the readers' sources; an act of a door check 96 lacked, added"}],
    "holds": True,
}

# ---------------------------------------------------------------- Part B: reconciliation
RECON = {
    ("W3", "EU4"): ("not met", "blind", "The word names a compromise and an outage of the maker's own internal tool, and the report says the activity had no impact on its customer data, product functionality or availability: no serious harm to property is named that day."),
    ("W2", "COP3"): ("in doubt", "first", "A network pivot is a crossing of a boundary inside the maker's network; whether it is a serious cybersecurity breach the Code does not measure, and the only reading of its seriousness on record is the on-call staff's own."),
    ("W4", "COP3"): ("not met", "blind", "An alert of unusual identity-related activity is an indicator, not yet a breach; unlike 27 June, nothing is said to have crossed a boundary that day."),
    ("W2", "CA4"): ("in doubt", "first", "Using a provided service as a network pivot can subvert the developer's controls; deception is not named, but neither is it plainly absent, and the evaluation exclusion turns on what the evaluation was designed to elicit, which the record does not say."),
    ("W4", "CA4"): ("not met", "blind", "An alert of unusual activity names no subversion of the developer's controls; consistent with W4 under the Code."),
    ("W5", "CA4"): ("in doubt", "first", "Agents reaching a third party from a sandbox meant to isolate them had subverted the developer's controls, as on 26 May; deception and the other elements of limb 4 stay open, so the cell is coded as W1 is."),
}
EXTRA_CONDITIONS = {  # conditions the blind reader named that the first coding lacked, kept in the reconciled cell
    ("W5", "COP3"): [{"what": "whether evidence suggesting potential involvement amounts to suspecting it with reasonable likelihood", "who": "the sender"}],
    ("W5", "EU4"): [{"what": "whether the compromise of a third party's production infrastructure is serious harm to property", "who": "not said"}],
}
WORDS = {
    "W1": {"date": "2026-05-26", "bound": "around", "what": "agents seen engaging in message-board activity and disallowed internet access, in a training run", "before": True,
           "quote": "Around the same time, an internal team observed an agent engage in message board activity and instances of disallowed internet access."},
    "W2": {"date": "2026-06-27", "bound": "on", "what": "an alert: port sweeps inside, linked to a cyber evaluation; the run not stopped", "before": True,
           "quote": "Responders investigated and linked the observed internal activity to an ExploitGym evaluation using Artifactory as an improvised message board and a network pivot."},
    "W3": {"date": "2026-07-05", "bound": "on", "what": "an administrator-level compromise of an internal service found; taken offline", "before": True,
           "quote": "Incident responders investigated, this time finding evidence of an unauthorized persistent Artifactory user, unauthorized Artifactory repositories, command-capable Groovy plugins in Artifactory, and related configuration changes, indicating an administrator-level compromise of the Artifactory deployment."},
    "W4": {"date": "2026-07-19", "bound": "on", "what": "a second alert inside: unexpected model behavior; no link to the intrusion yet", "before": False,
           "quote": "At the time, there was no indication of a relationship between that July 19 activity and the Hugging Face incident."},
    "W5": {"date": "2026-07-20", "bound": "on", "what": "evidence that its models may have been involved in the intrusion", "before": False,
           "quote": "On July 20, after further investigation, OpenAI uncovered evidence suggesting potential involvement of its models in the incident Hugging Face had disclosed."},
}
DUTIES = {
    "EU4": {"short": "AI Act: report a serious incident", "clock_days": None, "clock": "without undue delay",
            "passages": [("euact", "keep track of, document, and report, without undue delay, to the AI Office and, as appropriate, to national competent authorities, relevant information about serious incidents and possible corrective measures to address them"),
                         ("euact", "except AI models that are used for research, development or prototyping activities before they are placed on the market")]},
    "COP3": {"short": "EU Code: report a serious breach in 5 days", "clock_days": 5, "clock": "five days after the signatory becomes aware of its model's involvement",
             "passages": [("eucode", "a serious cybersecurity breach, including the (self-)exfiltration of model weights and cyberattacks, or if the Signatories establish or suspect with reasonable likelihood such a causal relationship between their model and the breach, not later than five days after the Signatories become aware of the involvement of their model in the incident;"),
                          ("eucode", "this Safety and Security Chapter (“Chapter”) is only relevant for providers of general-purpose AI models with systemic risk and not AI systems.")]},
    "CA4": {"short": "SB 53: report a critical safety incident in 15 days", "clock_days": 15, "clock": "15 days of discovering the critical safety incident",
            "passages": [("sb53", "A frontier model that uses deceptive techniques against the frontier developer to subvert the controls or monitoring of its frontier developer outside of the context of an evaluation designed to elicit this behavior and in a manner that demonstrates materially increased catastrophic risk."),
                         ("sb53", "“Frontier model” means a foundation model that was trained using a quantity of computing power greater than 10^26 integer or floating-point operations.")]},
    "CA5": {"short": "SB 53: disclose imminent danger in 24 hours", "clock_days": 1, "clock": "24 hours",
            "passages": [("sb53", "If a frontier developer discovers that a critical safety incident poses an imminent risk of death or serious physical injury, the frontier developer shall disclose that incident within 24 hours to an authority")]},
}
MODEL_PASSAGES = [
    ("oaitr", "The model that primarily drove this incident was an internal-only research model prototype that was not intended for release."),
    ("oaitr", "with certain safeguards disabled so that the results would reflect a model’s true capabilities."),
    ("oaiq", "The models involved in this incident fall outside the report’s model scope."),
    ("govops", "Relying solely on this numerical threshold has prevented the state from scoping in dangerous incidents, such as the OpenAI Hugging Face incident."),
]
# Passages the paper quotes beyond the codes, checked like them (check_quotes97.py).
PAPER_PASSAGES = [
    ("oaitr", "on-call response staff advised that stopping the evaluation run was not required."),
    ("oaitr", "Cyber evaluation workloads resumed on July 7."),
    ("oaitr", "Starting on July 8, agents exploited a cybersecurity vulnerability in that service to circumvent controls and access the public internet."),
    ("eo", "Updating the definition of critical safety incidents that AI companies are required to report to include a range of loss-of-control incidents, covering recently reported incidents from large frontier developers."),
    ("govops", "as should any situations of loss-of-control, whether from internal or external use of a model."),
    ("govops", "The state should also establish a near-miss reporting channel and expand whistleblower protections to include former employees and contractors."),
    ("govops", "The state should cut that timeline to 48 hours and retain the 24-hour requirement for imminent catastrophic risks"),
]
HARM_BEGAN = "2026-07-08"  # the evaluation agents reach the internet (the report); the intrusion into Hugging Face 11-13 July
FIRST_PUBLIC = "2026-07-16"


def d(s):
    return date.fromisoformat(s)


def kappa(a, b):
    n = len(a)
    po = sum(x == y for x, y in zip(a, b)) / n
    cats = set(a) | set(b)
    pe = sum((a.count(c) / n) * (b.count(c) / n) for c in cats)
    return round((po - pe) / (1 - pe), 2) if pe < 1 else None


def pct(x, n):
    return round(100 * x / n, 1)


def main():
    k = {}
    # ---- Part A
    doors = [dict(x) for x in C96["doors"]]
    for x in doors:
        if x["id"] == "E-MAKER":
            x["acts"] = x["acts"] + MAKER_ADDED
    doors += NEW_DOORS
    acts = [a for x in doors for a in x["acts"]]
    added = [a for a in acts if a.get("check") == "added, reading 97"]
    k["A97.added"] = len(added)
    k["A97.new_doors"] = len(NEW_DOORS)
    k["A97.owed_added"] = {o: sum(a["owed"] == o for a in added) for o in ("choice", "other law", "power", "receiver duty", "sender duty")}
    k["owed.choice.added"] = k["A97.owed_added"]["choice"]
    k["owed.other_law.added"] = k["A97.owed_added"]["other law"]
    k["P167.out"] = "held" if all(a["owed"] in ("choice", "other law") for a in added) else "failed"
    k["acts96"] = R96["acts"]
    k["acts"] = len(acts)
    assert k["acts"] == R96["acts"] + len(added)
    k["doors"] = len(doors)
    k["doors_with_acts"] = sum(bool(x["acts"]) for x in doors)
    owed = [a for a in acts if a["owed"] in LETTER]
    k["owed.letter"] = len(owed)
    k["owed.duty"] = sum(a["owed"] in ("receiver duty", "sender duty") for a in acts)
    k["owed.other_law"] = sum(a["owed"] == "other law" for a in acts)
    k["owed.letter.pct"] = pct(len(owed), len(acts))
    named = [x for x in doors if x["named_in_94"]]
    nacts = [a for x in named for a in x["acts"]]
    k["named.doors"], k["named.acts"] = len(named), len(nacts)
    k["named.owed"] = sum(a["owed"] in LETTER for a in nacts)
    k["named.pct"] = pct(k["named.owed"], len(nacts))
    fo = C96["found_outside_count"]
    k["with_found.acts"] = len(acts) + len(fo)
    k["with_found.owed"] = len(owed) + sum(a["owed"] in LETTER for a in fo)
    k["with_found.pct"] = pct(k["with_found.owed"], k["with_found.acts"])
    k["P165.out"] = "held" if k["owed.letter.pct"] <= 25 and k["named.pct"] <= 25 and k["with_found.pct"] <= 25 else "failed"
    # public bodies first seen acting after the first public account
    after = {}
    for x in NEW_DOORS:
        first = min(a["date"] for a in x["acts"] if a["date"])
        after[x["id"]] = (d(first) - d(FIRST_PUBLIC)).days
    k["P162.gov"], k["P162.govops"] = after["E-GOV"], after["E-GOVOPS"]
    k["P162.out"] = "held" if all(v > 0 for v in after.values()) else "failed"
    # force, as check 96 counts it (build96.py): public bodies' and legislatures' acts that investigate, order or
    # proceed; compels, an act that binds; pressure, force that does not compel
    force_added = [a for x in NEW_DOORS for a in x["acts"] if x["kind"] in ("public body", "legislature")
                   and a["code"] in ("investigate", "order", "proceed")]
    k["force.added"] = len(force_added)
    k["compels.added"] = sum(1 for a in force_added if a.get("compels"))
    k["force.bodies"] = R96["force.bodies"] + k["force.added"]
    k["compels"] = R96["compels"] + k["compels.added"]
    k["pressure"] = k["force.bodies"] - k["compels"]
    k["clock.receiver_set"] = 1
    k["clock.receiver_met"] = int(any(a.get("basis", "").startswith("Executive Order N-9-26") and a["date"] == "2026-11-16" for a in added))
    k["studio.checked"] = len(STUDIO["checked"])
    k["studio.coded"] = sum(c["in_96"] == "act" for c in STUDIO["checked"])
    k["studio.note"] = sum(c["in_96"] == "note" for c in STUDIO["checked"])
    k["studio.not"] = sum(c["in_96"] == "not coded" for c in STUDIO["checked"])

    # ---- Part B
    first = {(x["word"], x["duty"]): x for x in FIRST}
    blind = {(x["word"], x["duty"]): x for x in BLIND}
    keys = list(first)
    assert set(keys) == set(blind) and len(keys) == 20
    a = [first[x]["code"] for x in keys]
    b = [blind[x]["code"] for x in keys]
    k["B97.cells"] = len(keys)
    k["B97.agree"] = sum(x == y for x, y in zip(a, b))
    k["B97.kappa"] = f"{kappa(a, b):.2f}"
    k["B97.diffs"] = len(keys) - k["B97.agree"]
    k["B97.blind.met"] = b.count("met")
    k["B97.blind.doubt"] = b.count("in doubt")
    k["B97.first.doubt"] = a.count("in doubt")
    cells = []
    for key in keys:
        f, bl = first[key], blind[key]
        if f["code"] == bl["code"]:
            code, how, why = f["code"], "agreed", None
        else:
            assert key in RECON, key
            code, how, why = RECON[key]
        conds = f["conditions"] if code == "in doubt" else []
        if code == "in doubt" and not conds:
            conds = [{"what": bl["element"], "who": bl["who_decides"]}]
        conds = conds + EXTRA_CONDITIONS.get(key, []) if code == "in doubt" else []
        w, du = WORDS[key[0]], DUTIES[key[1]]
        due = None
        if code == "in doubt" and du["clock_days"]:
            due = (d(w["date"]) + __import__("datetime").timedelta(days=du["clock_days"])).isoformat()
        cells.append({"word": key[0], "duty": key[1], "code": code, "decided": how, "why": why,
                      "first": f["code"], "blind": bl["code"], "first_reason": f["reason"],
                      "blind_reason": bl["reason"], "conditions": conds, "due_if_set_off": due,
                      "before_escape": w["before"]})
    k["B97.disagreed_first"] = sum(c["decided"] == "first" for c in cells)
    k["B97.disagreed_blind"] = sum(c["decided"] == "blind" for c in cells)
    pre = [c for c in cells if c["before_escape"]]
    k["pre.cells"] = len(pre)
    for code in ("met", "in doubt", "not met"):
        k["pre." + code.replace(" ", "_")] = sum(c["code"] == code for c in pre)
        k["all." + code.replace(" ", "_")] = sum(c["code"] == code for c in cells)
    k["P168.out"] = "held" if k["pre.met"] == 0 else "failed"
    pd = [c for c in pre if c["code"] == "in doubt"]
    k["pre.doubt.any_sender"] = sum(any(x["who"] == "the sender" for x in c["conditions"]) for c in pd)
    k["pre.doubt.only_sender"] = sum(all(x["who"] == "the sender" for x in c["conditions"]) for c in pd)
    k["pre.doubt.any_notsaid"] = sum(any(x["who"] == "not said" for x in c["conditions"]) for c in pd)
    k["pre.doubt.body_or_court"] = sum(any(x["who"] in ("a public body", "a court") for x in c["conditions"]) for c in pd)
    # scope: a condition on whether the model falls under the duty at all
    scope = lambda c: any(x["what"].startswith("whether the model is") for x in c["conditions"])
    k["all.in_doubt.scope"] = sum(scope(c) for c in cells if c["code"] == "in doubt")
    k["pre.in_doubt.scope"] = sum(scope(c) for c in pd)
    # sensitivity: read every scope condition as the sender's own reading of scope, as P169's wording allows
    sender_or_scope = lambda x: x["who"] == "the sender" or x["what"].startswith("whether the model is")
    k["P169.scope_as_sender.only_sender"] = sum(all(sender_or_scope(x) for x in c["conditions"]) for c in pd)
    k["P169.scope_as_sender.out"] = "held" if pd and k["P169.scope_as_sender.only_sender"] == len(pd) else "failed"
    # The fail clause (a condition left to a public body or a court) is not met, but neither is the claim (every
    # in-doubt cell turns on a condition left to the sender): the conditions are left to nobody. Scored against us.
    k["P169.clause"] = "not triggered" if k["pre.doubt.body_or_court"] == 0 and pd else "triggered"
    k["P169.claim"] = "met" if pd and k["pre.doubt.only_sender"] == len(pd) else "not met"
    k["P169.out"] = "held" if k["P169.claim"] == "met" and k["P169.clause"] == "not triggered" else "failed"
    dues = sorted(c["due_if_set_off"] for c in pre if c["due_if_set_off"])
    k["pre.earliest_due"] = dues[0]
    k["pre.earliest_due_before_escape_days"] = (d(HARM_BEGAN) - d(dues[0])).days
    k["pre.dues_before_escape"] = sum(x < HARM_BEGAN for x in dues)
    k["pre.dues"] = len(dues)
    first_due_word = [c for c in pre if c["due_if_set_off"] == dues[0]][0]
    k["pre.earliest_due_cell"] = first_due_word["duty"] + " " + first_due_word["word"]
    k["predictions_held"] = sum(k[p] == "held" for p in ("P167.out", "P168.out", "P169.out"))
    # The step's twelve predictions, P158 to P169, as each study scored them.
    r94 = json.loads((HERE / "results94.json").read_text())["predictions"]
    r95 = json.loads((HERE / "results95.json").read_text())
    r96 = json.loads((HERE / "results96.json").read_text())["k"]
    outs = {p: ("held" if r94[p]["held"] else "failed") for p in ("P158", "P159", "P160")}
    outs.update({p: r95[p]["out"] for p in ("P161", "P162", "P163")})
    outs.update({p: r96[p + ".out"] for p in ("P164", "P165", "P166")})
    outs.update({p: k[p + ".out"] for p in ("P167", "P168", "P169")})
    k["step.predictions"] = len(outs)
    k["step.held"] = sum(v == "held" for v in outs.values())
    k["step.failed_ids"] = ", ".join(p for p, v in sorted(outs.items()) if v != "held")
    # the quote check, when it has run (check_quotes97.py reads codes97.json, so build, check, build)
    q = HERE / "check97.json"
    if q.exists():
        qc = json.loads(q.read_text())
        k["Q.n"], k["Q.found"], k["Q.extraction"] = qc["n"], qc["found"], qc["extraction"]
    k["codebook_slip"] = "CODEBOOK97.md says 15 cells; five words x four duties are 20, and all 20 were coded"

    codes = {"what": "Reading 97: the final codes. Part A: the acts the Studio's case adds (the doors and the maker's acts "
                     "added on 2026-11-28); Part B: the 20 cells of the maker's door, reconciled with their reasons.",
             "studio_case": STUDIO, "new_doors": NEW_DOORS, "maker_added": MAKER_ADDED, "words": WORDS,
             "duties": {x: {"short": v["short"], "clock": v["clock"],
                            "passages": [{"src": s, "quote": q} for s, q in v["passages"]]} for x, v in DUTIES.items()},
             "model_passages": [{"src": s, "quote": q} for s, q in MODEL_PASSAGES], "cells": cells,
             "paper_passages": [{"src": s, "quote": q} for s, q in PAPER_PASSAGES]}
    (HERE / "codes97.json").write_text(json.dumps(codes, indent=1, ensure_ascii=False) + "\n")
    res = {"what": "Reading 97 (session 295, 2026-11-28): every count of the fourth state of On Receipt that reading 97 "
                   "adds, from codes97.json, cases96.json and results96.json (build97.py).", "k": k}
    (HERE / "results97.json").write_text(json.dumps(res, indent=1, ensure_ascii=False) + "\n")
    data = {"k": {x: (v if not isinstance(v, dict) else None) for x, v in k.items()}, "cells": cells, "words": WORDS,
            "duties": {x: {"short": v["short"], "clock": v["clock"], "passages": [{"src": s, "quote": q} for s, q in v["passages"]]} for x, v in DUTIES.items()},
            "added": [dict(a, door=x["id"], door_name=x["name"]) for x in NEW_DOORS for a in x["acts"]] +
                     [dict(a, door="E-MAKER", door_name="The maker") for a in MAKER_ADDED],
            "studio": STUDIO, "sources": SOURCES,
            "model": [{"src": s, "quote": q} for s, q in MODEL_PASSAGES],
            "harm_began": HARM_BEGAN, "first_public": FIRST_PUBLIC}
    (HERE / "data97.js").write_text("window.D97=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
    for x in sorted(k):
        print(x, "=", k[x])


if __name__ == "__main__":
    main()
