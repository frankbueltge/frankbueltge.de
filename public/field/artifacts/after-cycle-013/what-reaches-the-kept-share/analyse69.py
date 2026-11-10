"""Study 69: which laws reach compute that never changes hands, and whom do they address?

Fetches the legal texts named in PREDICTIONS69.md (and three found during the search) from their
publishers, hashes them, flattens them to text, and checks that every passage the coding rests on
stands in the text as fetched. Then scores the predictions and writes results69.json and data69.js.

Standard library only, plus the `pdftotext` command for three PDF files. One text (California's act)
could not be fetched directly: its publisher answers a browser challenge (HTTP 403). It was read
through a page-fetch service on 2026-11-10; its passages are recorded with "found": null because this
script cannot re-check them.

Usage: python3 analyse69.py [cache_dir]
"""
import gzip, hashlib, html, json, os, re, subprocess, sys, urllib.request

UA = "field-research study (research use) meridian@field-research.invalid"
HERE = os.path.dirname(os.path.abspath(__file__))

DOCS = {
    "AIACT": ("Regulation (EU) 2024/1689 (AI Act), Official Journal text", "html",
              "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202401689"),
    "GUIDE": ("European Commission, Guidelines on the scope of the obligations for general-purpose AI models (2025)", "pdf",
              "https://ai-act-service-desk.ec.europa.eu/sites/default/files/2025-07/guidelines_on_the_scope_of_the_obligations_for_generalpurpose_ai_models_established_by_regulation_1cx2atxgq79us4n3x8jfgyy1qlm_118340-3.pdf"),
    "COP": ("European Commission, The General-Purpose AI Code of Practice: signatories (page last updated 2026-10-07)", "html",
            "https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai"),
    "EO14110": ("US Executive Order 14110 of 2023-10-30, Federal Register 2023-24283", "html",
                "https://www.govinfo.gov/content/pkg/FR-2023-11-01/html/2023-24283.htm"),
    "EO14148": ("US Executive Order 14148 of 2025-01-20, Federal Register 2025-01901", "html",
                "https://www.govinfo.gov/content/pkg/FR-2025-01-28/html/2025-01901.htm"),
    "BIS": ("US Bureau of Industry and Security, proposed rule, Federal Register 2024-20529", "html",
            "https://www.govinfo.gov/content/pkg/FR-2024-09-11/html/2024-20529.htm"),
    "REGINFO": ("US Unified Agenda, RIN 0694-AJ55 (the proposed rule's record)", "html",
                "https://www.reginfo.gov/public/do/eAgendaViewRule?RIN=0694-AJ55&operation=OPERATION_PRINT_RULE&pubId=202510"),
    "EAR": ("US Export Administration Regulations, 15 CFR 744.23, as in force on 2026-11-01", "html",
            "https://www.ecfr.gov/api/versioner/v1/full/2026-11-01/title-15.xml?part=744&section=744.23"),
    "PARIS": ("Paris Call for AI safety and security, 2026-11-09, the French presidency's page", "html",
              "https://www.elysee.fr/en/emmanuel-macron/2026/11/09/paris-call-for-ai-safety-and-security"),
    "NY8828": ("New York Senate bill S8828 (2025-26), the chapter amendment to the RAISE Act, as printed", "pdf",
               "https://legislation.nysenate.gov/pdf/bills/2025/S8828"),
    "NY10731": ("New York Senate bill S10731 (2025-26), introduced 2026-10-28, as printed", "pdf",
                "https://legislation.nysenate.gov/pdf/bills/2025/S10731"),
    "NYA": ("New York State Assembly, bill search: S10731, summary and actions", "html",
            "https://nyassembly.gov/leg/?default_fld=&leg_video=&bn=S10731&term=2025&Summary=Y&Actions=Y&Text=Y"),
}
SB53_URL = "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB53"

# Each passage: (id, doc, text). Ids are used by the coding below and by the page.
PASSAGES = [
    ("a1", "AIACT", "providers placing on the market or putting into service AI systems or placing on the market general-purpose AI models in the Union, irrespective of whether those providers are established or located within the Union or in a third country"),
    ("a2", "AIACT", "when the cumulative amount of computation used for its training measured in floating point operations is greater than 10 25"),
    ("a3", "AIACT", "the relevant provider shall notify the Commission without delay and in any event within two weeks after that requirement is met or it becomes known that it will be met"),
    ("a4", "AIACT", "The obligations laid down for models should in any case not apply when an own model is used for purely internal processes that are not essential for providing a product or a service to third parties and the rights of natural persons are not affected. Considering their potential significantly negative effects, the general-purpose AI models with systemic risk should always be subject to the relevant obligations under this Regulation."),
    ("a5", "AIACT", "except AI models that are used for research, development or prototyping activities before they are placed on the market"),
    ("a6", "AIACT", "assess and mitigate possible systemic risks at Union level, including their sources, that may stem from the development, the placing on the market, or the use of general-purpose AI models with systemic risk"),
    ("a7", "AIACT", "ensure an adequate level of cybersecurity protection for the general-purpose AI model with systemic risk and the physical infrastructure of the model"),
    ("a8", "AIACT", "the computational resources used to train the model (e.g. number of floating point operations), training time, and other relevant details related to the training"),
    ("a9", "AIACT", "Chapter III Section 4, Chapter V, Chapter VII and Chapter XII and Article 78 shall apply from 2 August 2025, with the exception of Article 101"),
    ("a10", "AIACT", "The Commission shall ensure that a list of general-purpose AI models with systemic risk is published and shall keep that list up to date"),
    ("g1", "GUIDE", "a general-purpose AI model is used for internal processes that are essential for providing a product or service to third parties or that affect the rights of natural persons in the Union"),
    ("g2", "GUIDE", "These guidelines are not binding for providers of general-purpose AI models"),
    ("c1", "COP", "In addition, xAI signed up to the Safety and Security Chapter"),
    ("c2", "COP", "Amazon Anthropic Black Forest Labs Bria AI Cohere Domyn Dweve Fastweb Google IBM LINAGORA Microsoft Mistral AI"),
    ("e1", "EO14110", "Companies, individuals, or other organizations or entities that acquire, develop, or possess a potential large-scale computing cluster to report any such acquisition, development, or possession, including the existence and location of these clusters and the amount of total computing power available in each cluster"),
    ("e2", "EO14110", "any model that was trained using a quantity of computing power greater than 10\\26\\ integer or floating-point operations"),
    ("e3", "EO14148", "Executive Order 14110 of October 30, 2023 (Safe, Secure, and Trustworthy Development and Use of Artificial Intelligence)"),
    ("b1", "BIS", "establishing reporting requirements for the development of advanced artificial intelligence (AI) models and computing clusters"),
    ("b2", "REGINFO", "This rule will be withdrawn per Executive Order 14236 issued on March 14, 2025."),
    ("b3", "REGINFO", "Withdrawn 12/16/2025"),
    ("x1", "EAR", "you may not export, reexport, or transfer (in-country) without a license any item subject to the EAR described in paragraphs (a)(1) through (4) of this section"),
    ("p1", "PARIS", "Developers also commit to implement fail-safe mechanisms to shut down model operations within their control, including during training and internal use (e.g. restrictions, pauses or shutdowns)"),
    ("p2", "PARIS", "Heads of States and Governments: Austria, Bahrain, Canada, Croatia, Cyprus, Estonia, Finland, France, Ireland, Kenya, Latvia, Liechtenstein, Luxembourg, Netherlands, Norway, Portugal. Companies: Anthropic, Black Forest Labs, Cohere, Domyn, Hugging Face, Microsoft, Mistral AI, OpenAI, Sakana AI, Synthesia."),
    ("n1", "NY8828", "\"Frontier developer\" means a person who has trained, or initiated the training of, a frontier model"),
    ("n2", "NY8828", "A large frontier developer shall transmit to the office a summary of any assessment of catastrophic risk resulting from internal use of its frontier models"),
    ("n3", "NY8828", "This act shall take effect [on the ninetieth day after it shall have become a law] January 1, 2027."),
    ("n4", "NY8828", "This article shall only apply to frontier models that are developed, deployed, or operating in whole or in part in New York state."),
    ("m1", "NY10731", "the percentage of computing power used for models that are internally used and/or deployed"),
    ("m2", "NY10731", "Such order may limit the amount of computing power used to train new models of a large frontier developer and/or the amount of computing power dedicated to automated research and development."),
    ("m3", "NYA", "10/28/2026 REFERRED TO RULES"),
]
# California's act, read through a page-fetch service (publisher answers 403 to a direct request).
SB53 = [
    ("s1", "\"Frontier developer\" means a person who has trained, or initiated the training of, a frontier model, with respect to which the person has used, or intends to use, at least as much computing power to train the frontier model as would meet the technical specifications found in subdivision (i)."),
    ("s2", "\"Frontier model\" means a foundation model that was trained using a quantity of computing power greater than 10^26 integer or floating-point operations."),
    ("s3", "A large frontier developer shall transmit to the Office of Emergency Services a summary of any assessment of catastrophic risk resulting from internal use of its frontier models every three months or pursuant to another reasonable schedule specified by the large frontier developer"),
    ("s4", "a report of assessments of catastrophic risk from internal use pursuant to Section 22757.12, and a covered employee report made pursuant to Chapter 5.1 (commencing with Section 1107) of Part 3 of Division 2 of the Labor Code are exempt from the California Public Records Act"),
    ("s5", "shall be subject to a civil penalty in an amount dependent upon the severity of the violation that does not exceed one million dollars ($1,000,000) per violation"),
]

# The coding. Values: True, False, or a short string where the text is conditional. `q` lists passage ids.
#   in_force: enacted law or regulation whose duties apply on 2026-11-10
#   threshold: training-compute threshold in the text
#   developer / holder: on whom the duty falls
#   transfer_only: acts only when chips or capacity change hands
#   internal: a duty covers a model used inside the firm
#   stock_stated: makes a firm state how much compute it holds or how it divides it
INSTRUMENTS = [
    {"id": "eu-ai-act", "name": "EU AI Act, Chapter V", "where": "European Union", "kind": "regulation", "named": True,
     "in_force": True, "since": "2025-08-02 (fines from 2026-08-02)", "threshold": "10^25", "developer": True, "holder": False,
     "transfer_only": False, "internal": "by recital",
     "stock_stated": False,
     "note": "Scope is the provider that places a model on the Union market. Recital 97 exempts purely internal use of ordinary models and then says models with systemic risk should always be subject; research and prototyping before the market stays outside the definition. The notice to the Commission falls due during training. Training compute of a model goes to the regulator on request, never the holder's stock.",
     "q": ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10"]},
    {"id": "eu-guidelines", "name": "Commission guidelines on general-purpose AI models", "where": "European Union", "kind": "guidance", "named": True,
     "in_force": False, "since": "2025-07-18, not binding", "threshold": "10^25 (the Act's)", "developer": True, "holder": False,
     "transfer_only": False, "internal": True, "stock_stated": False,
     "note": "The Commission reads internal use that is essential to a product, or that affects people's rights, as placing on the market. It says itself that the reading does not bind.",
     "q": ["g1", "g2"]},
    {"id": "ca-sb53", "name": "California, Transparency in Frontier AI Act (SB 53)", "where": "California", "kind": "statute", "named": True,
     "in_force": True, "since": "2026-01-01 (date from two law-firm notes, not from the text)", "threshold": "10^26", "developer": True, "holder": False,
     "transfer_only": False, "internal": True, "stock_stated": False,
     "note": "The only text in force here with no market trigger: whoever has trained, or begun to train, above the threshold is a frontier developer. Large ones send the state a summary of their risk assessment of internal use every three months. The summaries are exempt from public-records law.",
     "q": ["s1", "s2", "s3", "s4", "s5"]},
    {"id": "ny-raise", "name": "New York, RAISE Act as amended (S8828)", "where": "New York", "kind": "statute", "named": True,
     "in_force": False, "since": "enacted; takes effect 2027-01-01", "threshold": "10^26", "developer": True, "holder": False,
     "transfer_only": False, "internal": True, "stock_stated": False,
     "note": "Mirrors California: the trainer is the addressee, internal use is reported in confidence. Not yet in force.",
     "q": ["n1", "n2", "n3", "n4"]},
    {"id": "us-ear", "name": "US export controls (15 CFR 744.23)", "where": "United States", "kind": "regulation", "named": True,
     "in_force": True, "since": "as in force 2026-11-01", "threshold": None, "developer": False, "holder": False,
     "transfer_only": True, "internal": False, "stock_stated": False,
     "note": "Reaches chips, and only when they are exported, re-exported or transferred. A chip that stays with its owner inside the country is not touched. One section read; the licence rules for individual chip classes were not.",
     "q": ["x1"]},
    {"id": "us-eo14110", "name": "US Executive Order 14110, section 4.2", "where": "United States", "kind": "executive order", "named": True,
     "in_force": False, "since": "revoked 2025-01-20", "threshold": "10^26", "developer": True, "holder": True,
     "transfer_only": False, "internal": True, "stock_stated": True,
     "note": "The one text read here that addressed a holder as holder: whoever acquires, develops or possesses a large cluster reports where it is and how much computing power it has. Revoked.",
     "q": ["e1", "e2", "e3"]},
    {"id": "us-bis-rule", "name": "US proposed reporting rule (15 CFR 702)", "where": "United States", "kind": "proposed rule", "named": True,
     "in_force": False, "since": "proposed 2024-09-11, withdrawn 2025-12-16", "threshold": "per the order", "developer": True, "holder": True,
     "transfer_only": False, "internal": True, "stock_stated": True,
     "note": "Would have carried the order's cluster reporting into regulation, quarterly. Never final; the government's own agenda records it withdrawn.",
     "q": ["b1", "b2", "b3"]},
    {"id": "paris-call", "name": "Paris Call for AI safety and security", "where": "16 governments, 10 companies", "kind": "declaration", "named": True,
     "in_force": False, "since": "2026-11-09, not law", "threshold": None, "developer": True, "holder": False,
     "transfer_only": False, "internal": True, "stock_stated": False,
     "note": "Names training and internal use outright. A declaration. Of the three holders that build on their own chips, none is on the list of signing companies as fetched.",
     "q": ["p1", "p2"]},
    {"id": "ny-s10731", "name": "New York bill S10731", "where": "New York", "kind": "bill", "named": False,
     "in_force": False, "since": "introduced 2026-10-28, referred to Rules", "threshold": "10^25", "developer": True, "holder": False,
     "transfer_only": False, "internal": True, "stock_stated": True,
     "note": "Found during the search, not named before it. Would make large developers report the percentage of computing power used for models that are used internally, and would let the state's office order a limit on the computing power used to train. A bill.",
     "q": ["m1", "m2", "m3"]},
]

# Holders that build their own frontier models on chips they own (study 68; the Atelier's reading 4).
HOLDERS = ["Google", "Meta", "xAI"]


def flat(s):
    return re.sub(r"\s+", " ", s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"').replace("‑", "-")).strip()


def text_of(raw, kind, path):
    if kind == "pdf":
        t = subprocess.run(["pdftotext", "-layout", path, "-"], capture_output=True, check=True).stdout.decode("utf-8", "replace")
        t = re.sub(r"(?m)^\s*\d{1,2}\s{1,3}", "", t)     # printed line numbers of the New York bills
        t = re.sub(r"(\w)- (?=\w)", r"\1-", flat(t))    # keep hyphenated words whole across line ends
        return t
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
        docs[k] = {"what": what, "url": url, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest(), "route": "direct"}
        texts[k] = text_of(raw, kind, p)
    docs["SB53"] = {"what": "California Senate Bill 53 (2025), bill text at the legislature's site", "url": SB53_URL,
                    "bytes": None, "sha256": None,
                    "route": "page-fetch service; a direct request was answered 403 with a browser challenge on 2026-11-10"}
    passages = {}
    for pid, d, q in PASSAGES:
        hay = texts[d]
        needle = flat(q)
        if d.startswith("NY") and d != "NYA":
            needle = re.sub(r"(\w)- (?=\w)", r"\1-", needle)
            ok = needle in hay or needle.replace("-", "") in hay.replace("-", "")
        else:
            ok = needle in hay
        passages[pid] = {"doc": d, "quote": q, "found": ok}
    for pid, q in SB53:
        passages[pid] = {"doc": "SB53", "quote": q, "found": None}
    missing = [k for k, v in passages.items() if v["found"] is False]

    r65 = json.load(open(os.path.join(HERE, "..", "..", "cycle-013", "who-holds-the-compute", "results65.json")))
    q4 = [q for q in r65["quarters"] if q["q"] == "2025-12-31"][0]
    share = {h: round(100 * q4["owner_h100e"][h] / q4["total"], 2) for h in HOLDERS}
    kept = round(100 * sum(q4["owner_h100e"][h] for h in HOLDERS) / q4["total"], 2)
    cop = texts["COP"]
    i = cop.find("Signatories of the code of practice")
    cop_list = cop[i:cop.find("Quick links", i)]
    paris_co = texts["PARIS"][texts["PARIS"].find("Companies: Anthropic"):]
    paris_co = paris_co[:paris_co.find("Civil society")]
    named = {
        "eu_code_signatories": {h: bool(re.search(r"\b%s\b" % re.escape(h), cop_list)) for h in HOLDERS},
        "paris_call_companies": {h: bool(re.search(r"\b%s\b" % re.escape(h), paris_co)) for h in HOLDERS},
    }
    cover = {k: round(sum(share[h] for h in HOLDERS if v[h]), 2) for k, v in named.items()}

    inforce = [x for x in INSTRUMENTS if x["in_force"] is True]
    thr = [x["id"] for x in inforce if x["threshold"]]
    holder_inforce = [x["id"] for x in inforce if x["holder"]]
    stock_inforce = [x["id"] for x in inforce if x["stock_stated"]]
    counts = {
        "instruments": len(INSTRUMENTS), "named_before_search": sum(1 for x in INSTRUMENTS if x["named"]),
        "in_force": len(inforce), "in_force_with_threshold": len(thr),
        "in_force_addressing_holder": len(holder_inforce), "in_force_stating_stock": len(stock_inforce),
        "in_force_reaching_internal_use": [x["id"] for x in inforce if x["internal"]],
        "addressing_holder_any_status": [x["id"] for x in INSTRUMENTS if x["holder"]],
        "stating_stock_any_status": [x["id"] for x in INSTRUMENTS if x["stock_stated"]],
    }
    predictions = [
        {"id": "P77", "text": "At least two binding instruments in force set their scope by a training-compute threshold.",
         "held": len(thr) >= 2,
         "result": "two: the EU's AI Act (10^25 operations) and California's act (10^26); California's date of force comes from two law-firm notes, not from the text"},
        {"id": "P78", "text": "No binding instrument in force places a duty on a firm as holder of chips; thresholds address the developer, chip rules act only on a transfer.",
         "held": len(holder_inforce) == 0,
         "result": "none of the three in force; the AI Act's one duty about hardware (cybersecurity of the model's physical infrastructure) falls on the provider of the model"},
        {"id": "P79", "text": "The AI Act's duties are market-triggered: a model trained and used only inside the firm is not reached by Articles 53 and 55.",
         "held": False,
         "result": "failed for the models that matter here: the scope article names placing on the market, but recital 97 says models with systemic risk should always be subject, the notice falls due while training runs, and Article 55 names risks from development; only research and prototyping before the market stays outside. The recital is not an article, and no court has read it"},
        {"id": "P80", "text": "California's act reaches internal use in at least one duty.",
         "held": True,
         "result": "two: the framework must cover risk from internal use, and a summary of that assessment goes to the state every three months, in confidence"},
        {"id": "P81", "text": "No instrument makes a firm state how much compute it holds or divides; the Commission's signatory list names Google and xAI and not Meta.",
         "held": len(stock_inforce) == 0 and named["eu_code_signatories"] == {"Google": True, "Meta": False, "xAI": True},
         "result": "held for everything in force, and the list reads as predicted; not predicted: a New York bill of 2026-10-28 would require exactly the percentage of computing power used internally"},
        {"id": "P82", "text": "The two US instruments that would have reached a holder as holder are not in force.",
         "held": all(not x["in_force"] for x in INSTRUMENTS if x["id"] in ("us-eo14110", "us-bis-rule")),
         "result": "the order was revoked on 2025-01-20; the proposed rule is recorded as withdrawn on 2025-12-16"},
    ]
    res = {
        "study": 69, "date": "2026-11-10", "documents": docs, "passages": passages, "missing": missing,
        "instruments": INSTRUMENTS, "counts": counts,
        "kept_share": {"quarter": "2025-12-31", "by_holder_pct": share, "total_pct": kept,
                       "source": "study 65, results65.json (Epoch AI chip owners, H100-equivalents, smuggled stock counted)"},
        "named_in_scope": named, "kept_share_named_pct": cover,
        "predictions": predictions, "held": sum(1 for p in predictions if p["held"]), "of": len(predictions),
        "state_md_check": {"claim": "programme/STATE.md, 'What moved in the world': the Paris Call was signed by eight governments",
                           "found": "the presidency's page as fetched on 2026-11-10 lists 16 governments and 10 companies and says the list is being updated",
                           "passage": "p2"},
    }
    json.dump(res, open(os.path.join(HERE, "results69.json"), "w"), indent=1, ensure_ascii=False)
    open(os.path.join(HERE, "data69.js"), "w").write("window.D69=" + json.dumps(res, ensure_ascii=False) + ";\n")
    print("missing passages:", missing)
    print("kept share", kept, share, "named", named, cover)
    print("counts", json.dumps(counts))
    print("held", res["held"], "of", res["of"])


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/tmp/study69-cache")
