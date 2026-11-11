#!/usr/bin/env python3
"""Study 70 (session 268, 2026-11-11): how the three laws in force write their sanction, and whether it was used.

Answers the Atelier's question of its session 48 (relay ho-2026-11-10-atelier-3). Fetches each text and each
enforcement record from its publisher, hashes it, checks every quoted passage against the file as fetched,
codes the sanction clauses and the uses on record, and scores predictions P83 to P88 (PREDICTIONS70.md,
committed before any search). Writes results70.json and data70.js.

Usage: python3 analyse70.py [cache-dir]     (standard library only; pdftotext for the two PDFs)
"""
import gzip, hashlib, html, json, os, re, subprocess, sys, urllib.request

UA = "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
HERE = os.path.dirname(os.path.abspath(__file__))
TODAY = "2026-11-11"

DOCS = {  # id: (what, kind, url)
    "AIACT": ("Regulation (EU) 2024/1689 (AI Act), Official Journal text", "html",
              "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202401689"),
    "IR1755": ("Commission Implementing Regulation (EU) 2026/1755 of 20 July 2026 (proceedings under the AI Act)", "html",
               "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202601755"),
    "ECENF": ("European Commission, The enforcement framework of the AI Act (page last updated 2026-10-20), printable file", "pdf",
              "https://digital-strategy.ec.europa.eu/en/node/17175/printable/pdf"),
    "USC4819": ("Export Control Reform Act, 50 U.S.C. 4819 (Penalties), United States Code 2023 edition", "html",
                "https://www.govinfo.gov/content/pkg/USCODE-2023-title50/html/USCODE-2023-title50-chap58-subchapI-sec4819.htm"),
    "CFR7643": ("US Export Administration Regulations, 15 CFR 764.3 (Sanctions), as in force on 2026-11-01", "html",
                "https://www.ecfr.gov/api/versioner/v1/full/2026-11-01/title-15.xml?part=764&section=764.3"),
    "DOJ0805": ("US Department of Justice, press release 25-812 of 2025-08-05 (two arrested, chips shipped to China)", "html",
                "https://www.justice.gov/opa/pr/two-chinese-nationals-arrested-complaint-alleging-they-illegally-shipped-china-sensitive"),
    "DOJ1120": ("US Department of Justice, press release of 2025-11-20 (four charged, GPUs to China)", "html",
                "https://www.justice.gov/opa/pr/us-citizens-and-chinese-nationals-arrested-exporting-artificial-intelligence-technology"),
    "DOJ1208": ("US Department of Justice, press release of 2025-12-08 (smuggling network; two guilty pleas)", "html",
                "https://www.justice.gov/opa/pr/us-authorities-shut-down-major-china-linked-ai-tech-smuggling-network"),
    "DOJ0319": ("US Department of Justice, press release 26-268 of 2026-03-19 (three charged, servers diverted)", "html",
                "https://www.justice.gov/opa/pr/three-charged-conspiring-unlawfully-divert-cutting-edge-us-artificial-intelligence"),
    "DOJ1001": ("US Department of Justice, press release of 2026-10-01 (one arrested, servers to China)", "html",
                "https://www.justice.gov/opa/pr/california-man-arrested-smuggling-more-300-million-export-controlled-computer-servers-china"),
    "BISAR": ("US Bureau of Industry and Security, Annual Report to Congress, fiscal year 2025", "pdf",
              "https://www.bis.gov/media/documents/fy2025-bis-annual-report.pdf"),
    "OAG1001": ("California Attorney General, press release of 2026-10-01 (investigative subpoena on OpenAI)", "html",
                "https://oag.ca.gov/news/press-releases/part-ongoing-investigation-attorney-general-bonta-serves-investigative-subpoena"),
}
SB53_URL = "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB53"
RFI_URL = "https://www.matheson.com/insights/the-european-commissions-first-use-of-ai-act-enforcement-powers/"

PASSAGES = [  # id, doc, exact quotation
    ("a1", "AIACT", "The Commission may impose on providers of general-purpose AI models fines not exceeding 3 % of their annual total worldwide turnover in the preceding financial year or EUR 15 000 000, whichever is higher"),
    ("a2", "AIACT", "failed to comply with a request for a document or for information pursuant to Article 91, or supplied incorrect, incomplete or misleading information"),
    ("a3", "AIACT", "Chapter III Section 4, Chapter V, Chapter VII and Chapter XII and Article 78 shall apply from 2 August 2025, with the exception of Article 101"),
    ("a4", "AIACT", "Non-compliance with the prohibition of the AI practices referred to in Article 5 shall be subject to administrative fines of up to EUR 35 000 000"),
    ("a5", "AIACT", "The Court of Justice of the European Union shall have unlimited jurisdiction to review decisions of the Commission fixing a fine under this Article."),
    ("a6", "AIACT", "Member States shall lay down the rules on penalties and other enforcement measures"),
    ("i1", "IR1755", "The Commission may adopt a decision fining a specific provider of general-purpose AI model for conduct listed in Article 101(1) of Regulation (EU) 2024/1689 within five years from the day on which that conduct was carried out by that provider."),
    ("e1", "ECENF", "The enforcement powers of the AI Office and the national competent authorities of the Member States apply from 2 August 2026"),
    ("e2", "ECENF", "the Commission may adopt a decision imposing penalties on the provider of the relevant AI system or GPAI model"),
    ("s1", "USC4819", "shall be fined not more than $1,000,000; and"),
    ("s2", "USC4819", "in the case of the individual, shall be imprisoned for not more than 20 years, or both."),
    ("s3", "USC4819", "The Secretary may impose the following civil penalties on a person for each violation by that person of this subchapter"),
    ("s4", "USC4819", "A fine of not more than $300,000 or an amount that is twice the value of the transaction that is the basis of the violation with respect to which the penalty is imposed, whichever is greater."),
    ("s5", "USC4819", "Any civil penalty under this subsection may be imposed only after notice and opportunity for an agency hearing on the record"),
    ("c1", "CFR7643", "A civil monetary penalty not to exceed the amount set forth in ECRA may be imposed for each violation"),
    ("d1", "DOJ0805", "are charged with violating the Export Control Reform Act, a felony that carries a statutory maximum penalty of 20 years in prison"),
    ("d2", "DOJ1120", "have been charged with a conspiracy to illegally export cutting-edge NVIDIA Graphics Processing Units (GPUs)"),
    ("d3", "DOJ1208", "both pleaded guilty to smuggling and unlawful export activities on Oct. 10, 2025"),
    ("d4", "DOJ1208", "the United States has seized over $50 million in Nvidia technologies and cash"),
    ("d5", "DOJ1208", "At sentencing, Hsu faces up to 10 years in prison on Feb. 18"),
    ("d6", "DOJ0319", "are each charged with one count of conspiring to violate the Export Controls Reform Act"),
    ("d7", "DOJ1001", "Lui is charged with one count of conspiracy to violate the Export Control Reform Act and the Export Administration Regulations"),
    ("b1", "BISAR", "the criminal case involving the indictment of three Super Micro executives"),
    ("o1", "OAG1001", "yesterday served an investigative subpoena on OpenAI as part of the California Department of Justice's (DOJ) ongoing investigation of incidents resulting from the operations of OpenAI and its artificial intelligence (AI) models"),
    ("o2", "OAG1001", "Developers that fail to do so can and should be held legally accountable, and my office is committed to determining if that is the case here."),
]
SB53 = [  # read through a page-fetch service on 2026-11-11; the publisher answered a direct request 403
    ("k1", "shall be subject to a civil penalty in an amount dependent upon the severity of the violation that does not exceed one million dollars ($1,000,000) per violation."),
    ("k2", "A civil penalty described in this section shall be recovered in a civil action brought only by the Attorney General."),
]

# One row per sanction clause. mood: "consequence" (the verb binds the outcome to the breach) or "power"
# (a body is given discretion); gated: a consequence only one authority may bring to a court.
CLAUSES = [
    {"id": "eu-101", "law": "eu-ai-act", "where": "AI Act, Article 101(1)", "verb": "may impose", "mood": "power", "gated": False,
     "on": "providers of general-purpose AI models", "by": "the European Commission, by its own decision; the Court of Justice may review the fine",
     "max": "3 % of worldwide annual turnover or EUR 15 million, whichever is higher", "reaches_frontier": True, "q": ["a1", "a2", "a5"]},
    {"id": "eu-99", "law": "eu-ai-act", "where": "AI Act, Article 99(3)", "verb": "shall be subject to", "mood": "consequence", "gated": False,
     "on": "whoever breaks the prohibitions of Article 5 (not the duties of model providers)", "by": "the member states, under rules each lays down",
     "max": "EUR 35 million or 7 % of worldwide annual turnover", "reaches_frontier": False, "q": ["a4", "a6"]},
    {"id": "ca-15", "law": "ca-sb53", "where": "California SB 53, section 22757.15", "verb": "shall be subject to", "mood": "consequence", "gated": True,
     "on": "a large frontier developer", "by": "a court, in a civil action brought only by the Attorney General",
     "max": "$1,000,000 per violation", "reaches_frontier": True, "q": ["k1", "k2"]},
    {"id": "us-4819b", "law": "us-export", "where": "50 U.S.C. 4819(b), criminal", "verb": "shall be fined", "mood": "consequence", "gated": False,
     "on": "a person who willfully commits an unlawful export act", "by": "a criminal court, on prosecution by the Department of Justice",
     "max": "$1,000,000 and, for an individual, 20 years in prison", "reaches_frontier": False, "q": ["s1", "s2"]},
    {"id": "us-4819c", "law": "us-export", "where": "50 U.S.C. 4819(c), civil", "verb": "may impose", "mood": "power", "gated": False,
     "on": "a person, for each violation", "by": "the Secretary of Commerce, after notice and a hearing",
     "max": "$300,000 or twice the value of the transaction, whichever is greater; loss of export rights", "reaches_frontier": False, "q": ["s3", "s4", "s5"]},
    {"id": "us-7643", "law": "us-export", "where": "15 CFR 764.3(a)(1), civil", "verb": "may be imposed", "mood": "power", "gated": False,
     "on": "violations of the export regulations", "by": "the Bureau of Industry and Security",
     "max": "the amount set in the statute", "reaches_frontier": False, "q": ["c1"]},
]

# Rungs: written, applicable, inquiry, charge (a charge, a suit or formal proceedings), admitted (a guilty plea or a
# finding), penalty (a sentence, fine or civil penalty imposed). Values: True (the body's own page, fetched),
# "reported" (second-hand only), "unnamed" (the body's own page, but the statute is not named), False (no record found).
LAWS = [
    {"id": "eu-ai-act", "name": "EU AI Act, duties of model providers", "body": "European Commission (AI Office)",
     "applicable_since": "2026-08-02", "duties_since": "2025-08-02",
     "rungs": {"written": True, "applicable": True, "inquiry": "reported", "charge": False, "admitted": False, "penalty": False},
     "note": "The fine is the Commission's to impose or not. The power to fine began a year after the duties it sanctions. The Commission's enforcement page, last updated 2026-10-20, names no provider, no proceeding and no fine; a law firm's note reports first requests for information on 2026-08-29, which this study did not find on a Commission page.",
     "q": ["a1", "a3", "e1", "e2", "i1"]},
    {"id": "ca-sb53", "name": "California SB 53", "body": "California Attorney General",
     "applicable_since": "2026-01-01 (second-hand, as in study 69)", "duties_since": "2026-01-01 (second-hand)",
     "rungs": {"written": True, "applicable": True, "inquiry": "unnamed", "charge": False, "admitted": False, "penalty": False},
     "note": "The penalty follows from the breach, but only the Attorney General can take it to a court. His office has an investigation of OpenAI on record, with a subpoena served on 2026-09-30; the release names no statute, so it cannot be counted as a use of this act. No civil action under the act was found.",
     "q": ["k1", "k2", "o1", "o2"]},
    {"id": "us-export", "name": "US export controls (ECRA and the export regulations)", "body": "Department of Justice; Bureau of Industry and Security",
     "applicable_since": "2018 (the act); chips controlled later by rule", "duties_since": "2018",
     "rungs": {"written": True, "applicable": True, "inquiry": True, "charge": True, "admitted": True, "penalty": False},
     "note": "Both moods: prison and a fine follow from a willful breach, and the Secretary may add a civil penalty. Five announcements between August 2025 and October 2026 charge 13 people and one company over AI chips; one man and his company pleaded guilty, to smuggling and unlawful export activities as the release words it. No sentence and no civil penalty over AI chips was found on the pages read.",
     "q": ["s1", "s3", "d1", "d2", "d3", "d4", "d6", "d7"]},
]

# Uses on record. kind: "person" or "company"; role per the release's own description.
USES = [
    {"id": "u1", "law": "us-export", "date": "2025-08-05", "doc": "DOJ0805", "rung": "charge", "statute_named": True,
     "what": "criminal complaint: GPUs exported to China without a licence through a small company (ALX Solutions Inc.)",
     "parties": [["Chuan Geng", "person"], ["Shiwei Yang", "person"]], "q": ["d1"]},
    {"id": "u2", "law": "us-export", "date": "2025-11-20", "doc": "DOJ1120", "rung": "charge", "statute_named": True,
     "what": "indictment: GPUs transshipped to China through Malaysia and Thailand, a front company in Florida",
     "parties": [["Hon Ning Ho", "person"], ["Brian Curtis Raymond", "person"], ["Cham Li", "person"], ["Jing Chen", "person"]], "q": ["d2"]},
    {"id": "u3", "law": "us-export", "date": "2025-12-08", "doc": "DOJ1208", "rung": "admitted", "statute_named": False,
     "what": "guilty pleas of 2025-10-10 to smuggling and unlawful export activities (at least $160 million of H100 and H200 chips); over $50 million seized",
     "parties": [["Alan Hao Hsu", "person"], ["Hao Global LLC", "company"]], "q": ["d3", "d4", "d5"]},
    {"id": "u4", "law": "us-export", "date": "2025-12-08", "doc": "DOJ1208", "rung": "charge", "statute_named": True,
     "what": "two more charged in the same network, one with conspiring to violate the export act, one with conspiring to smuggle",
     "parties": [["Benlin Yuan", "person"], ["Fanyue Gong", "person"]], "q": ["d3"]},
    {"id": "u5", "law": "us-export", "date": "2026-03-19", "doc": "DOJ0319", "rung": "charge", "statute_named": True,
     "what": "indictment: servers with AI chips diverted to China; the export agency's annual report calls the three Super Micro executives",
     "parties": [["Yih-Shyan Liaw", "person"], ["Ruei-Tsang Chang", "person"], ["Ting-Wei Sun", "person"]], "q": ["d6", "b1"]},
    {"id": "u6", "law": "us-export", "date": "2026-10-01", "doc": "DOJ1001", "rung": "charge", "statute_named": True,
     "what": "indictment: more than $300 million of servers with GPUs sent to China through Malaysia and Singapore",
     "parties": [["Greg Lui", "person"]], "q": ["d7"]},
    {"id": "u7", "law": "ca-sb53", "date": "2026-10-01", "doc": "OAG1001", "rung": "inquiry", "statute_named": False,
     "what": "investigation of security incidents at OpenAI, subpoena served 2026-09-30; the release names no statute",
     "parties": [["OpenAI", "developer of frontier models"]], "q": ["o1", "o2"]},
]
HOLDERS = ["Google", "Microsoft", "Meta", "Amazon", "Oracle", "xAI"]            # the step-1 record: five largest, and the three that keep
DEVELOPERS = ["OpenAI", "Anthropic", "Google", "Meta", "xAI"]


def flat(s):
    for a, b in (("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"'), ("‑", "-"), ("ﬃ", "ffi"), ("ﬁ", "fi"), ("ﬀ", "ff"), ("ﬂ", "fl")):
        s = s.replace(a, b)
    return re.sub(r"\s+", " ", s).strip()


def text_of(raw, kind, path):
    if kind == "pdf":
        t = subprocess.run(["pdftotext", "-layout", path, "-"], capture_output=True, check=True).stdout.decode("utf-8", "replace")
        return flat(t)
    t = raw.decode("utf-8", "replace")
    t = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", t, flags=re.S)
    return flat(html.unescape(re.sub(r"<[^>]+>", " ", t)))


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Encoding": "gzip"})
    with urllib.request.urlopen(req, timeout=120) as r:
        b = r.read()
        return gzip.decompress(b) if r.headers.get("Content-Encoding") == "gzip" else b


def main(cache):
    os.makedirs(cache, exist_ok=True)
    docs, texts = {}, {}
    for k, (what, kind, url) in DOCS.items():
        p = os.path.join(cache, k + (".pdf" if kind == "pdf" else ".htm"))
        if not os.path.exists(p):
            open(p, "wb").write(fetch(url))
        raw = open(p, "rb").read()
        docs[k] = {"what": what, "url": url, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest(), "route": "direct", "fetched": TODAY}
        texts[k] = text_of(raw, kind, p)
    docs["SB53"] = {"what": "California Senate Bill 53 (2025), bill text at the legislature's site", "url": SB53_URL, "bytes": None, "sha256": None,
                    "route": "page-fetch service; a direct request was answered 403 on " + TODAY, "fetched": TODAY}
    docs["RFI"] = {"what": "Matheson (law firm), note of 2026-09-25 on the AI Office's first requests for information; second-hand, read as a search excerpt only",
                   "url": RFI_URL, "bytes": None, "sha256": None, "route": "search excerpt; not fetched as a file", "fetched": TODAY}

    passages = {}
    for pid, d, q in PASSAGES:
        passages[pid] = {"doc": d, "quote": q, "found": flat(q) in texts[d]}
    for pid, q in SB53:
        passages[pid] = {"doc": "SB53", "quote": q, "found": None}
    missing = [k for k, v in passages.items() if v["found"] is False]

    # Machine checks on the records themselves.
    oag = texts["OAG1001"]
    oag_names_statute = bool(re.search(r"SB 53|Frontier Artificial Intelligence|22757", oag))
    bis = texts["BISAR"]
    starts = [m.start() for m in re.finditer(r"APPENDIX B: CRIMINAL CONVICTIONS", bis)]
    tables = bis[starts[-1]:]                      # appendices B to E: convictions and administrative cases of the year
    chip_terms = r"Nvidia|NVIDIA|GPU|[Gg]raphics [Pp]rocessing|[Aa]dvanced [Cc]omputing|4A090|3A090|Super Micro"
    bis_chip_rows = len(re.findall(chip_terms, tables))
    bis_chip_front = len(re.findall(chip_terms, bis[:starts[-1]]))
    ec = texts["ECENF"]
    ec_names = [n for n in ["OpenAI", "Anthropic", "Google", "Meta ", "xAI", "Mistral", "Microsoft"] if n in ec]
    ec_words = {w: len(re.findall(w, ec)) for w in ["preliminary findings", "opened proceedings", "fined", "has imposed"]}

    people = [p for u in USES for p in u["parties"]]
    names = [p[0] for p in people]
    assert len(names) == len(set(names)), "a party is counted twice"
    for u in USES:                                  # every named party stands in the release it is counted from
        for n, _ in u["parties"]:
            last = n.split()[-1] if n != "Hao Global LLC" else n
            assert last in texts[u["doc"]], (n, u["doc"])
    exp = [u for u in USES if u["law"] == "us-export"]
    exp_parties = [p for u in exp for p in u["parties"]]
    counts = {
        "clauses": len(CLAUSES),
        "consequence": [c["id"] for c in CLAUSES if c["mood"] == "consequence"],
        "power": [c["id"] for c in CLAUSES if c["mood"] == "power"],
        "frontier_clauses": {c["id"]: c["mood"] + (", gated" if c["gated"] else "") for c in CLAUSES if c["reaches_frontier"]},
        "export_announcements": len({u["doc"] for u in exp}),
        "export_parties": len(exp_parties),
        "export_persons": sum(1 for p in exp_parties if p[1] == "person"),
        "export_companies": sum(1 for p in exp_parties if p[1] == "company"),
        "export_admitted": sum(len(u["parties"]) for u in exp if u["rung"] == "admitted"),
        "export_sentences_found": 0,
        "export_civil_penalties_on_chips_found": 0,
        "parties_that_are_holders": [n for n in names if n in HOLDERS],
        "parties_that_are_frontier_developers": {u["id"]: u["rung"] for u in USES for n, _ in u["parties"] if n in DEVELOPERS},
        "penalties_on_frontier_duty_found": 0,
    }
    r67 = json.load(open(os.path.join(HERE, "..", "..", "cycle-013", "who-holds-the-compute", "results67.json")))
    per_year = r67["money_by_developer"]["OpenAI"]["per_year_bn"]
    scale = {"penalty_usd": 1_000_000, "openai_compute_per_year_bn": per_year,
             "penalty_as_pct_of_a_year": round(100 * 1e6 / (per_year * 1e9), 4),
             "minutes_of_that_spending": round(1e6 / (per_year * 1e9) * 365.25 * 24 * 60, 1),
             "source": "study 67, results67.json: OpenAI's published compute agreements with a stated term, per year"}

    eu = [c for c in CLAUSES if c["id"] == "eu-101"][0]
    ca = [c for c in CLAUSES if c["id"] == "ca-15"][0]
    us_moods = {c["mood"] for c in CLAUSES if c["law"] == "us-export"}
    rung = {l["id"]: l["rungs"] for l in LAWS}
    predictions = [
        {"id": "P83", "text": "The AI Act writes its fines for model providers as a power of the Commission, applicable later than the duties.",
         "held": eu["mood"] == "power" and passages["a1"]["found"] and passages["a3"]["found"],
         "result": "held: Article 101 says the Commission \"may impose\"; Article 113 applies the duties from 2 August 2025 \"with the exception of Article 101\", which followed on 2 August 2026. Not predicted: for other breaches the same act writes \"shall be subject to administrative fines\""},
        {"id": "P84", "text": "California's SB 53 writes its civil penalty as a consequence, gated: only the Attorney General may bring the action.",
         "held": ca["mood"] == "consequence" and ca["gated"],
         "result": "held, on a text read through a page-fetch service: \"shall be subject to a civil penalty\", recovered \"in a civil action brought only by the Attorney General\""},
        {"id": "P85", "text": "US export law holds both: a criminal clause written as a consequence and a civil clause written as a power.",
         "held": us_moods == {"consequence", "power"} and passages["s1"]["found"] and passages["s3"]["found"],
         "result": "held: \"shall be fined\" and \"shall be imprisoned\" for a willful breach; \"The Secretary may impose\" civil penalties"},
        {"id": "P86", "text": "No record found of any sanction imposed under the AI Act's provisions for model providers or under SB 53.",
         "held": rung["eu-ai-act"]["penalty"] is False and rung["ca-sb53"]["penalty"] is False and not ec_names,
         "result": "held, as no record found: the Commission's enforcement page names no provider and no fine; no action by California's Attorney General under the act was found. Not predicted: his office is investigating OpenAI and served a subpoena on 2026-09-30, under no statute the release names"},
        {"id": "P87", "text": "Export controls have been used on compute at least once: a charge or penalty over advanced AI chips, 2025 or 2026.",
         "held": counts["export_announcements"] >= 1,
         "result": "held: five announcements of the Department of Justice between 2025-08-05 and 2026-10-01, 13 people and one company; two guilty pleas. Not predicted: no sentence and no civil penalty over AI chips was found, and the export agency's own tables for fiscal 2025 list none"},
        {"id": "P88", "text": "No sanction under the three laws fell on a holder of the step-1 record or a developer of frontier models; export cases hit intermediaries.",
         "held": not counts["parties_that_are_holders"] and all(v == "inquiry" for v in counts["parties_that_are_frontier_developers"].values()),
         "result": "held for sanctions and charges: the 14 parties are individuals and one small company. One developer of frontier models, OpenAI, stands under an inquiry. Not as predicted in one respect: three of the charged are described by the export agency as executives of a large server maker, not a shell"},
    ]
    res = {
        "study": 70, "date": TODAY, "question": "Of the laws in force, which write the sanction as a consequence and which as a power, and has either been used once?",
        "documents": docs, "passages": passages, "missing": missing,
        "clauses": CLAUSES, "laws": LAWS, "uses": USES, "counts": counts, "scale": scale,
        "record_checks": {
            "california_release_names_the_act": oag_names_statute,
            "export_agency_fy2025_tables_chip_mentions": bis_chip_rows,
            "export_agency_fy2025_front_matter_chip_mentions": bis_chip_front,
            "commission_page_names_a_provider": ec_names,
            "commission_page_words": ec_words,
            "searches_without_result": [
                "a fine, preliminary findings or opened proceedings under Article 101 (web search, 2026-11-11; the Commission's enforcement page)",
                "a civil action by California's Attorney General under SB 53 (web search, 2026-11-11; the Attorney General's press releases as returned by search)",
                "a sentence in a US case over AI chips, among them the sentencing set for 2026-02-18 (web search, 2026-11-11)",
            ],
            "second_hand_only": [
                "the AI Office's first requests for information of 2026-08-29 (a law firm's note)",
                "a third guilty plea, in October 2026, in the case of 2026-03-19 (a news agency, citing a court filing)",
            ],
        },
        "predictions": predictions, "held": sum(1 for p in predictions if p["held"]), "of": len(predictions),
    }
    json.dump(res, open(os.path.join(HERE, "results70.json"), "w"), indent=1, ensure_ascii=False)
    open(os.path.join(HERE, "data70.js"), "w").write("window.D70=" + json.dumps(res, ensure_ascii=False) + ";\n")
    print("missing passages:", missing)
    print("counts", json.dumps(counts))
    print("checks", json.dumps(res["record_checks"])[:600])
    print("scale", scale)
    print("held", res["held"], "of", res["of"])


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/tmp/study70-cache")
