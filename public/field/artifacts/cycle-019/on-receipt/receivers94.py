"""Study 94, part A -- what the receiver of each of the 19 event signals owes on receipt (CODEBOOK94.md, part A).

Coded by the conductor on 2026-11-25 from the instruments' texts as fetched that day (sources94.json). One entry per
signal of study 90 whose final trigger in check 92 is `event short of harm` or `harm`. Every code other than `none`
rests on its quoted passages (each at most 40 words, verbatim, checked by check_quotes94.py against the local copies);
a `none` rests on the search recorded in SEARCHED. `doubt` marks a code the check must read again.

Values for the six acts: duty | power | recommended | none. `recommended` is a ruling of this session, not of the
codebook: the codebook knew only duty (shall, must, will, commit) and power (may); several voluntary texts say
"should" or "are encouraged to", which is neither. Such codes are counted as not `duty` for the predictions, and the
count with them is reported beside it (results94.json, `with_recommended`).
"""

LOCAL = {"eu-act": "eu-act.clean.txt", "eu-code": "eu-code.raw.txt", "sb53": "sb53.txt", "china": "china.raw.txt",
         "asean": "asean.raw.txt", "haip": "haip.raw.txt", "paris": "paris.txt", "gpa": "gpa.raw.txt",
         "raise": ["raise-1420.raw.txt", "raise-1421.raw.txt", "raise-1422.raw.txt", "raise-1427.raw.txt"]}

ACTS = ["acknowledge", "investigate", "order", "pass_on", "tell_public", "tell_public_aggregate"]

# what was searched in each text before a `none` was written (case-insensitive, whole text)
SEARCHED = {
    "eu-act": "Chapter V and Chapter IX section 5 (Arts. 88-94) read whole, Art. 101, Art. 78, Art. 113; searched: 'AI Office', 'serious incident', 'acknowledge', 'publish', 'make publicly available', 'inform', 'within'",
    "eu-code": "Commitments 9 and 10 read whole; searched: 'AI Office will', 'AI Office shall', 'the AI Office' (all 60-odd uses), 'acknowledg', 'publish', 'respond'",
    "sb53": "B&P §§ 22757.11-22757.16 and Labor Code §§ 1107-1107.2 read whole; searched: 'Office of Emergency Services', 'Attorney General', 'shall', 'may', 'order', 'publish', 'public'",
    "china": "§§ 5.9, 5.13 and chapter 6 searched: 'report', 'complaint', 'incident', 'shall', 'should'",
    "asean": "§ 3.4 read whole; searched: 'incident', 'regulator', 'authorit'",
    "haip": "Principles 2 and 4 read whole; searched: 'report', 'incident', 'authorit', 'public'",
    "paris": "The declaration read whole",
    "raise": "GBL §§ 1420-1429 read whole (1423-1426, 1428-1429 hold nothing on receipt); searched: 'office', 'attorney general', 'shall', 'may'",
    "gpa": "Operative measures read whole; searched: 'incident', 'report', 'investigat', 'authorit'",
}


def A(v, quotes=None, ref=None, deadline=None, deadline_max=None, note=None, doubt=None):
    return {"v": v, "quotes": quotes or [], "ref": ref, "deadline_h": deadline, "deadline_max_h": deadline_max,
            "note": note, "doubt": doubt}


NONE = A("none")


def R(i, inst, receiver, receiver_name, sender, party, acts, sender_failure, receiver_failure, note=None):
    a = {k: NONE for k in ACTS}
    a.update(acts)
    return {"id": i, "instrument": inst, "receiver": receiver, "receiver_name": receiver_name, "sender": sender,
            "receiver_party": party, "acts": a, "sender_failure": sender_failure,
            "receiver_failure": receiver_failure, "note": note}


def SF(v, quotes=None, ref=None, max_penalty=None, who=None, note=None, doubt=None):
    return {"v": v, "quotes": quotes or [], "ref": ref, "max": max_penalty, "who": who, "note": note, "doubt": doubt}


def RF(v, quotes=None, ref=None, note=None, doubt=None):
    return {"v": v, "quotes": quotes or [], "ref": ref, "note": note, "doubt": doubt}


CA_TRANSMIT = A("power", ["The Attorney General or the Office of Emergency Services may transmit reports of critical safety incidents and reports from covered employees"],
                "B&P § 22757.13(e)(1)", note="To the Legislature, the Governor, the federal government or appropriate state agencies, at the receiver's discretion.")
CA_RECORDS = A("none", ["are exempt from the California Public Records Act"], "B&P § 22757.13(f)",
               note="The reports themselves are exempt from the Public Records Act; nothing requires publishing one.")
CA_FINE = SF("penalty", ["fails to report an incident as required by Section 22757.13, or fails to comply with its own frontier AI framework shall be subject to a civil penalty",
                         "does not exceed one million dollars ($1,000,000) per violation",
                         "A civil penalty described in this section shall be recovered in a civil action brought only by the Attorney General."],
             "B&P § 22757.15", 1_000_000, "the Attorney General, in a civil action",
             note="The penalty names a large frontier developer; the duty to report lies on every frontier developer, so a frontier developer that is not large faces no penalty in this text.")
NY_REVIEW = ["The office shall review critical safety incident reports submitted by frontier developers and may review reports submitted by members of the public."]
NY_TRANSMIT = A("power", ["The office may transmit reports of critical safety incidents or summaries of any assessments of catastrophic risk from internal use of frontier models to other governmental entities at their discretion",
                          "The office shall consider transmitting such reports or summaries to the office of the attorney general, as appropriate."],
                "GBL § 1422(5)(a)", note="A duty to consider transmitting to the attorney general, not a duty to transmit.")
NY_RECORDS = A("none", ["are exempt from disclosure under article six of the public officers law"], "GBL § 1422(6)",
               note="The reports are exempt from New York's freedom of information law; nothing requires publishing one.")
NY_YEARLY = A("duty", ["Beginning January first, two thousand twenty-eight, and annually thereafter, the office shall produce a report, that includes the following: (i) anonymized and aggregated information about critical safety incidents that have been reviewed by the office"],
              "GBL § 1422(7)", deadline="periodic",
              doubt="The text has the report transmitted to the governor and named legislators (§ 1422(7)(c)); it does not say the report is published.")
NY_FINE = SF("penalty", ["The attorney general may bring a civil action to recover a civil penalty in an amount not to exceed one million dollars for a first violation and in an amount not to exceed three million dollars per subsequent violation",
                         "fails to report an incident as required by section fourteen hundred twenty-two of this article"],
             "GBL § 1427(1)", 1_000_000, "the attorney general, in a civil action",
             note="Up to 3,000,000 dollars for each later violation; it names a large frontier developer, while the duty to report lies on every frontier developer.")
NY_NO_RIGHT = RF("none", ["Nothing in this article shall be construed to establish, authorize or create a private right of action associated with violations of this article."],
                 "GBL § 1427(2)")
SEARCH_ONLY = RF("none")

RECEIVERS = [
    # ---- EU AI Act (law) ----
    R("EU4", "eu-act", "public body", "AI Office (European Commission)", "the provider of a model with systemic risk", "yes", {
        "investigate": A("power", ["The AI Office, after consulting the Board, may conduct evaluations of the general-purpose AI model concerned"], "Art. 92(1)",
                         note="Also Art. 91(1): the Commission may request documentation and information. Neither is tied to an incident report."),
        "order": A("power", ["Where necessary and appropriate, the Commission may request providers to:",
                             "restrict the making available on the market, withdraw or recall the model."], "Art. 93(1)(c)",
                   note="A request that binds: failing to comply is fined under Art. 101(1)(c)."),
        "tell_public": A("none", ["Any information or documentation obtained pursuant to this Article, including trade secrets, shall be treated in accordance with the confidentiality obligations set out in Article 78."], "Art. 55(3)"),
    }, SF("penalty", ["The Commission may impose on providers of general-purpose AI models fines not exceeding 3 % of their annual total worldwide turnover in the preceding financial year or EUR 15 000 000, whichever is higher."],
          "Art. 101(1)(a)", 15_000_000, "the Commission",
          note="The maximum is 3 % of worldwide turnover or EUR 15 million, whichever is higher; Art. 101 applies from 2 August 2026 (Art. 113(b))."),
      RF("none", note="The Act names no consequence for the Commission or the AI Office; the Court of Justice reviews fines (Art. 101(5)), a remedy of the provider."),
      note="Art. 90(2): the AI Office informs the Board of measures it takes under Arts. 91-94, not of the reports it receives."),

    # ---- EU Code of Practice (voluntary) ----
    R("COP3", "eu-code", "public body", "AI Office", "a signatory", "no", {},
      SF("none", note="The Code names nothing; the AI Act's own duty and fine stand under EU4."),
      SEARCH_ONLY, note="The Code is the signatories' commitment; the AI Office receives reports and commits to nothing in it."),
    R("COP5", "eu-code", "own record", "the signatory (or the AI Office)", "downstream modifiers, providers, users and other third parties", "yes", {
        "investigate": A("duty", ["Signatories will investigate the causes and effects of serious incidents, including the information within the preceding list, with a view to informing systemic risk assessment."], "Measure 9.2"),
        "pass_on": A("duty", ["not later than two days after the Signatories become aware of the involvement of their model in the incident",
                              "not later than 15 days after the Signatories become aware of the involvement of their model in the incident"],
                     "Measure 9.3", deadline=48, deadline_max=360,
                     note="Two days for critical infrastructure, five for a serious cybersecurity breach, ten for a death, fifteen for other serious harm; an initial report to the AI Office, counted from the signatory's awareness.",
                     doubt="The duty is to report the serious incident, not to forward the third party's report as such."),
    }, SF("n/a"), SEARCH_ONLY,
      note="As sender of EU4 the maker answers under Art. 101 of the Act; the Code itself names nothing."),

    # ---- California SB 53 (law) ----
    R("CA4", "sb53", "public body", "Office of Emergency Services", "a frontier developer", "yes", {
        "investigate": A("duty", ["Office of Emergency Services shall review critical safety incident reports submitted by frontier developers and may review reports submitted by members of the public."], "B&P § 22757.13(d)"),
        "pass_on": CA_TRANSMIT, "tell_public": CA_RECORDS,
        "tell_public_aggregate": A("duty", ["Beginning January 1, 2027, and annually thereafter, the Office of Emergency Services shall produce a report with anonymized and aggregated information about critical safety incidents that have been reviewed by the Office of Emergency Services since the preceding report."],
                                   "B&P § 22757.13(g)(1)", deadline="periodic",
                                   doubt="The text has the report transmitted to the Legislature and the Governor (§ 22757.13(g)(3)); it does not say the report is published."),
    }, CA_FINE, SEARCH_ONLY),
    R("CA5", "sb53", "public body", "an appropriate authority (law enforcement or public safety)", "a frontier developer", "no", {},
      dict(CA_FINE, doubt="§ 22757.15 names failing 'to report an incident as required by Section 22757.13', read to include the 24-hour disclosure of (c)(2)."),
      SEARCH_ONLY, note="The Act gives the authority no task; it names it only as the place of disclosure."),
    R("CA6", "sb53", "public body", "Office of Emergency Services", "any member of the public", "yes", {
        "investigate": A("power", ["Office of Emergency Services shall review critical safety incident reports submitted by frontier developers and may review reports submitted by members of the public."], "B&P § 22757.13(d)"),
        "pass_on": dict(CA_TRANSMIT, doubt="(e)(1) names 'reports of critical safety incidents', read to include reports by the public."),
        "tell_public": CA_RECORDS,
        "tell_public_aggregate": A("duty", ["Beginning January 1, 2027, and annually thereafter, the Office of Emergency Services shall produce a report with anonymized and aggregated information about critical safety incidents that have been reviewed by the Office of Emergency Services since the preceding report."],
                                   "B&P § 22757.13(g)(1)", deadline="periodic",
                                   doubt="Only incidents the office reviewed, and it need not review a public report; transmitted to the Legislature and the Governor, not said to be published."),
    }, SF("n/a"), SEARCH_ONLY),
    R("CA7", "sb53", "public body", "Attorney General (or a federal authority)", "a covered employee", "yes", {
        "pass_on": CA_TRANSMIT,
        "tell_public_aggregate": A("duty", ["Beginning January 1, 2027, and annually thereafter, the Attorney General shall produce a report with anonymized and aggregated information about reports from covered employees"],
                                   "B&P § 22757.14(d)(1)", deadline="periodic",
                                   doubt="Only reports 'that have been reviewed by the Attorney General', and no text requires a review; transmitted to the Legislature and the Governor, not said to be published."),
    }, SF("n/a"), SEARCH_ONLY,
      note="The Act protects the employee who discloses (Labor Code § 1107.1(a)); it sets the Attorney General no task on receipt."),
    R("CA8", "sb53", "own record", "the large frontier developer's internal process", "a covered employee, anonymously", "yes", {
        "acknowledge": A("duty", ["including a monthly update to the person who made the disclosure regarding the status of the large frontier developer’s investigation of the disclosure and the actions taken by the large frontier developer in response to the disclosure"],
                         "Labor Code § 1107.1(e)(1)", deadline="periodic", note="A monthly update to the discloser."),
        "investigate": A("duty", ["including a monthly update to the person who made the disclosure regarding the status of the large frontier developer’s investigation of the disclosure and the actions taken by the large frontier developer in response to the disclosure"],
                         "Labor Code § 1107.1(e)(1)", doubt="The text presupposes an investigation by requiring updates on its status; it does not order one in so many words."),
        "pass_on": A("none", ["the disclosures and responses of the process required by this subdivision shall be shared with officers and directors of the large frontier developer at least once each quarter"],
                     "Labor Code § 1107.1(e)(2)(A)", note="Shared inside the company, not with a public body.",
                     doubt="A disclosure that reveals a critical safety incident falls under B&P § 22757.13(c)(1), fifteen days from discovery."),
    }, SF("n/a"),
      RF("named", ["The court is authorized to award reasonable attorney’s fees to a plaintiff who brings a successful action for a violation of this section."], "Labor Code § 1107.1(f)",
         doubt="Read as a remedy for a developer that keeps no such process or sends no update; the section's other remedies concern retaliation."),
      ),

    # ---- China, AI Safety Governance Framework 2.0 (voluntary) ----
    R("CN1", "china", "other party", "developers, service providers, technical institutions", "developers, service providers, technical institutions", "no", {
        "investigate": A("recommended", ["We should track and analyze AI technologies, products, service safety vulnerabilities, defects, risks, threats, and safety incidents."], "§ 5.9",
                         doubt="'We' is the framework's own voice, not the receiver's commitment."),
        "pass_on": A("recommended", ["We should advance international exchange and cooperation on sharing AI risks and threat information"], "§ 5.9"),
    }, SF("none"), SEARCH_ONLY),
    R("CN2", "china", "other party", "a mechanism for public complaints, unnamed", "the public", "no", {
        "investigate": A("recommended", ["A mechanism for handling public complaints and reports on AI risks and hazards should be established"], "§ 5.13",
                         doubt="'Handling' is read as examining the complaint; the text says no more."),
    }, SF("n/a"), SEARCH_ONLY),

    # ---- ASEAN Guide (voluntary) ----
    R("AS1", "asean", "other party", "regulators, users, customers or value-chain participants", "an organisation", "no", {},
      SF("none"), SEARCH_ONLY, note="The guide describes reporting and names areas for ASEAN to explore; it asks nothing of a receiver."),

    # ---- G7 Hiroshima Code of Conduct (voluntary) ----
    R("G7-1", "haip", "own record", "the organisation itself", "users and third parties", "yes", {
        "investigate": A("recommended", ["Organizations should use, as and when appropriate commensurate to the level of risk, AI systems as intended and monitor for vulnerabilities, incidents, emerging risks and misuse after deployment"], "Principle 2"),
        "order": A("recommended", ["and take appropriate action to address these. Organizations are encouraged to consider"], "Principle 2",
                   note="On its own system: 'mitigate the identified risks and vulnerabilities' is also only encouraged."),
        "pass_on": A("recommended", ["Organizations should also collaborate and share the aforementioned information with relevant public authorities, as appropriate."], "Principle 4",
                     doubt="Principle 4 is the sharing signal G7-3 itself, read here for what the receiver of a user's report should do with it."),
    }, SF("n/a"), SEARCH_ONLY),
    R("G7-3", "haip", "public", "other organisations, the public, public authorities", "an organisation", "no", {},
      SF("none"), SEARCH_ONLY, note="The Code addresses the organisations that share; it asks nothing of those who receive."),

    # ---- Paris Call (voluntary) ----
    R("PC3", "paris", "public body", "governments and other companies", "developers, governments and companies", "yes", {
        "pass_on": A("duty", ["Thirdly, policy makers, researchers and developers are committed to information sharing, reporting and early warning systems."], "Third commitment",
                     doubt="A commitment to systems of sharing, not a duty to forward a given report; the sentence on 'timely information' only recognises the value of it."),
    }, SF("none"), SEARCH_ONLY),
    R("PC4", "paris", "public body", "policy makers' confidential channels", "whistleblowers", "yes", {
        "investigate": A("none", ["Policy makers commit to offer secure and confidential channels through which whistleblowers, including employees and other relevant stakeholders, can raise concerns about systemic risks"], "Third commitment",
                         note="The commitment is to the channel; nothing is said of what is done with a concern raised through it."),
    },
      SF("n/a"), SEARCH_ONLY,
      note="Policy makers commit to offer the channels, and to nothing about what arrives through them."),

    # ---- New York RAISE Act (law, from 2027-01-01) ----
    R("NY4", "raise", "public body", "office in the Department of Financial Services", "a frontier developer", "yes", {
        "investigate": A("duty", NY_REVIEW, "GBL § 1422(4)"),
        "pass_on": NY_TRANSMIT, "tell_public": NY_RECORDS, "tell_public_aggregate": NY_YEARLY,
    }, NY_FINE, NY_NO_RIGHT),
    R("NY5", "raise", "public body", "an appropriate authority (law enforcement or public safety)", "a frontier developer", "no", {},
      dict(NY_FINE, doubt="§ 1427(1) names failing 'to report an incident as required by section fourteen hundred twenty-two', read to include the 24-hour disclosure of § 1422(3)(b)."),
      NY_NO_RIGHT, note="The Act gives the authority no task; it names it only as the place of disclosure."),
    R("NY6", "raise", "public body", "office in the Department of Financial Services", "any member of the public", "yes", {
        "investigate": A("power", NY_REVIEW, "GBL § 1422(4)"),
        "pass_on": dict(NY_TRANSMIT, doubt="§ 1422(5)(a) names 'reports of critical safety incidents', read to include reports by the public."),
        "tell_public": NY_RECORDS,
        "tell_public_aggregate": dict(NY_YEARLY, doubt="Only incidents the office reviewed, and it need not review a public report; transmitted to the governor and named legislators, not said to be published."),
    }, SF("n/a"), NY_NO_RIGHT),

    # ---- Global Privacy Assembly resolution (voluntary) ----
    R("GPA2", "gpa", "own record", "the organisation deploying the agent", "the organisation's own monitoring", "no", {
        "investigate": A("recommended", ["establishing procedures to detect, investigate and respond to incidents"], "Operative measures, governance",
                         doubt="Given as an example of a measure organisations should implement."),
        "order": A("recommended", ["enabling users or operators to pause or stop execution"], "Operative measures, limits",
                   doubt="Given as an example of a measure organisations should implement."),
    }, SF("none"), SEARCH_ONLY),
]
