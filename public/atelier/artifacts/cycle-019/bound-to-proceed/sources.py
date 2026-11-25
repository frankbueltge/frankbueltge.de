#!/usr/bin/env python3
"""Bound to Proceed: every outside passage the work quotes, matched against the copy fetched.

Usage: python3 sources.py <dir with the fetched copies>
Writes sources.json beside this file. No third-party text is committed: the copies stay
outside the repository, and this file records where each came from, how it was fetched,
its SHA-256 and whether every quoted passage was found in it.

A passage is "exact" when it occurs in the copy after whitespace, quote marks, dashes and
line-end hyphens are normalised. The 2014 SOLAS text is a court exhibit's scan with an OCR
layer; there a passage counts as "ocr" when a window of the copy matches it at a ratio of at
least 0.95 (difflib), and the ratio is recorded.
"""
import difflib, hashlib, html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))

SOURCES = {
    "solas": {
        "title": "SOLAS 1974, consolidated edition 2014 (IMO), chapter V, regulations 28 and 33; scanned as exhibit UA-867-AM, PCA case 2017-06",
        "url": "https://files.pca-cpa.org/pcadocs/2017-06/8.%20Ukraine%20-%20Reply%20-%20Exhibits/8.%20Ukraine%20-%20Reply%20-%20Exhibits/UA-867-AM.pdf",
        "file": "sea/solas2014-ua867.pdf", "text": "sea/solas.flow.txt", "how": "direct", "ocr": True},
    "unclos": {
        "title": "United Nations Convention on the Law of the Sea (1982), Part VII, articles 94 and 98",
        "url": "https://www.un.org/depts/los/convention_agreements/texts/unclos/part7.htm",
        "file": None, "text": "sea/unclos-part7-extracted.txt", "how": "extraction service (direct fetch refused, HTTP 403, 2026-11-25)"},
    "m541": {
        "title": "Recommendation ITU-R M.541-11 (11/2023), Operational procedures for the use of digital selective calling equipment in the maritime mobile service",
        "url": "https://www.itu.int/dms_pubrec/itu-r/rec/m/R-REC-M.541-11-202311-I%21%21PDF-E.pdf",
        "file": "sea/m541-11.pdf", "text": "sea/m541.flow.txt", "how": "direct"},
    "circ": {
        "title": "IMO MSC.1/Circ.1657/Rev.1 (6 July 2026), Procedure for responding to DSC distress alerts by ships",
        "url": "https://wwwcdn.imo.org/localresources/en/OurWork/Safety/Documents/Documents%20relevant%20to%20SAR/MSC.1-Circ.1657-Rev.1.pdf",
        "file": "sea/circ1657r1.pdf", "text": "sea/circ.flow.txt", "how": "direct"},
    "inquiry1912": {
        "title": "British Wreck Commissioner's Inquiry (1912), Report: Circumstances in connection with the SS Californian (Titanic Inquiry Project transcription)",
        "url": "https://www.titanicinquiry.org/BOTInq/BOTReport/botRepCalifornian.php",
        "file": "sea/botRepCalifornian.html", "text": "sea/botRepCalifornian.html", "how": "direct", "html": True},
    "maib1992": {
        "title": "Marine Accident Investigation Branch, RMS Titanic: Reappraisal of Evidence Relating to SS Californian (HMSO, 1992)",
        "url": "https://assets.publishing.service.gov.uk/media/54c15bf240f0b6158d000027/MAIBReport_ReappraisalOfEvidence-SSCalifornian-Titanic-1992.pdf",
        "file": "sea/maib1992.pdf", "text": "sea/maib.flow.txt", "how": "direct"},
    "govops2026": {
        "title": "California Government Operations Agency, AI Safety in 2026 and Beyond: a report to the Governor (16 November 2026)",
        "url": "https://www.govops.ca.gov/wp-content/uploads/sites/11/2026/11/FINAL_-AI-Safety-in-2026-and-Beyond-v2.pdf",
        "file": "voices/govops-2026-11-16.pdf", "text": "voices/gov.flow.txt", "how": "direct"},
    "baum2026": {
        "title": "Baum, Kiener, Langer and Laux, Anticipatory Human Oversight of Agentic AI: A Philosophical Account, arXiv:2609.24242 (2026), CC BY 4.0",
        "url": "https://arxiv.org/html/2609.24242",
        "file": "voices/baum2609.24242.html", "text": "voices/baum2609.24242.html", "how": "direct", "html": True},
}

QUOTES = [
    # the sea: the master
    ("solas-bound", "solas", ["The master of a ship at sea which is in a position to be able to provide assistance, on receiving information from any source that persons are in distress at sea, is bound to proceed with all speed to their assistance, if", "possible informing them or the search and rescue service that the ship is doing so."]),
    ("solas-log", "solas", "If the ship receiving the distress alert is unable or, in the special circumstances of the case, considers it unreasonable or unnecessary to proceed to their assistance, the master must enter in the logbook the reason for failing to proceed to the assistance of the persons in distress, taking into account the recommendation of the Organization to inform the appropriate search and rescue service accordingly."),
    ("solas-auto", "solas", "Automated reporting systems may be used, provided that they include a recording function of their transmission and that those functions and interfaces with position-fixing equipment are subjected to regular verification by the ship's master."),
    ("unclos-98", "unclos", "to proceed with all possible speed to the rescue of persons in distress, if informed of their need of assistance, in so far as such action may reasonably be expected of him"),
    ("unclos-98-req", "unclos", "Every State shall require the master of a ship flying its flag"),
    ("unclos-94-6", "unclos", "Upon receiving such a report, the flag State shall investigate the matter and, if appropriate, take any action necessary to remedy the situation."),
    # the sea: radio
    ("m541-manual", "m541", "Acknowledgements of distress alerts should be initiated manually."),
    ("m541-cs", "m541", "should be initiated with a minimum delay of 1 min after receipt of a distress alert, and normally within a maximum delay of 2⅓ min."),
    ("m541-ship", "m541", "The acknowledgement of a DSC distress alert from another ship should be made by radiotelephony after a short interval so that a coast station may acknowledge receipt in the first instance"),
    ("circ-master", "circ", "It should be noted that on ships, distress alerts, distress alert acknowledgements and distress alert relays can only be transmitted with the permission of the master of the ship."),
    ("circ-log", "circ", "Details should be recorded in the appropriate logbook."),
    # the night, 1912
    ("i12-evans", "inquiry1912", "I think the 'Titanic' is near us. I have got her."),
    ("i12-turnedin", "inquiry1912", "Evans heard the \"Titanic\" continuing to communicate with Cape Race up to the time he turned in at 11.30 p.m."),
    ("i12-voicepipe", "inquiry1912", "about 1.10 a.m., Mr. Stone reported to the Captain by voice pipe"),
    ("i12-company", "inquiry1912", "He states that the Master answered, \"Are they Company's signals?\""),
    ("i12-morsing", "inquiry1912", "The Master told him to \"go on Morsing,\" and, when he received any information, to send the apprentice down to him with it."),
    ("i12-nothing", "inquiry1912", "A ship is not going to fire rockets at sea for nothing;"),
    ("i12-gibson", "inquiry1912", "Gibson stated that at this time the Master was awake. It was five minutes past two"),
    ("i12-norecollection", "inquiry1912", "he had no recollection of anything being reported to him at all, although he remembered Gibson opening and closing the chart room door."),
    ("i12-disappeared", "inquiry1912", "At about 2.40 a.m. Mr. Stone again called up the Master by voice pipe and told him that the ship from which he had seen the rockets come had disappeared"),
    ("i12-iknow", "inquiry1912", "The Master said, \"Yes, I know, he has been telling me.\""),
    ("i12-scrap", "inquiry1912", "This position is recorded in the log book, which was written up from the scrap log book by the Chief Officer. The scrap log is destroyed."),
    ("i12-plain", "inquiry1912", "The \"Californian\" saw distress signals."),
    ("i12-saved", "inquiry1912", "Had she done so she might have saved many if not all of the lives that were lost."),
    ("i12-virginian", "inquiry1912", "and he at once started through the field ice at full speed for the position given."),
    # the night, 1992
    ("m92-finding", "maib1992", "She could have reached the TITANIC if she had made the attempt when she saw the first rocket. She made no attempt."),
    ("m92-appeal", "maib1992", "as no formal charge had been laid against him, and no action had been taken against his Certificate, he had no right of appeal."),
    ("m92-log", "maib1992", "the only log records he could produce were written up after the event; the scrap log kept by the officers had been destroyed."),
    ("m92-through", "maib1992", "In plain language, I think the message from the Bridge simply did not get through."),
    ("m92-distance", "maib1992", ["between 17 and 20 miles from TITANIC", "most likely about 18 miles."]),
    ("m92-attempt", "maib1992", "This of course does not alter the fact that the attempt should have been made."),
    ("m92-should", "maib1992", "The Master should have been called and if he did not immediately respond Mr Stone should have reported to him in person;"),
    # current voices
    ("baum-hohfeld", "baum2026", "As Kiener argues, to be answerable is to be liable, in Hohfeld’s sense, to a demand for justification; the correlative of that liability is a power, held by certain others, to put the answerable party under an obligation to respond."),
    ("gov-48h", "govops2026", "Third, it should accelerate the deadline for reporting most critical safety incidents from 15 days to 48 hours."),
    ("gov-authority", "govops2026", "The state should also have the authority to investigate incidents with sufficient access to draw evidence-based conclusions"),
]


def norm(s):
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = s.replace("–", "-").replace("—", "-").replace("­", "").replace("​", "")
    s = re.sub(r"-\s*\n\s*", "-", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def load_text(base, src):
    path = os.path.join(base, src["text"])
    raw = open(path, encoding="utf-8", errors="replace").read()
    if src.get("html"):
        raw = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", raw, flags=re.S)
        raw = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    return norm(raw)


def best_window(hay, needle):
    n = len(needle)
    sm = difflib.SequenceMatcher(None, autojunk=False)
    sm.set_seq2(needle)
    # anchor on the needle's first and last eight characters to find candidate starts
    best = (0.0, -1)
    probe = needle[:12]
    starts = set()
    for k in range(0, max(1, n - 12), max(1, n // 6)):
        frag = needle[k:k + 12]
        for m in re.finditer(re.escape(frag), hay):
            starts.add(max(0, m.start() - k))
    for s in starts:
        sm.set_seq1(hay[s:s + n + 8])
        r = sm.ratio()
        if r > best[0]:
            best = (r, s)
    return best


def main(base):
    out = {"what": "Every outside passage Bound to Proceed quotes, matched against the copy fetched on 2026-11-25. The copies are not committed.",
           "sources": {}, "quotes": []}
    texts = {}
    for sid, src in SOURCES.items():
        rec = {k: v for k, v in src.items() if k in ("title", "url", "how")}
        if src.get("file"):
            rec["sha256"] = hashlib.sha256(open(os.path.join(base, src["file"]), "rb").read()).hexdigest()
        texts[sid] = load_text(base, src)
        out["sources"][sid] = rec
    bad = []
    for qid, sid, q in QUOTES:
        parts = q if isinstance(q, list) else [q]
        hay = texts[sid]
        found, ratios = [], []
        for part in parts:
            nq = norm(part)
            if nq in hay:
                found.append("exact")
            elif SOURCES[sid].get("ocr"):
                r, _ = best_window(hay, nq)
                ratios.append(round(r, 3))
                found.append("ocr" if r >= 0.95 else "missing")
            else:
                found.append("missing")
        verdict = "missing" if "missing" in found else ("ocr" if "ocr" in found else "exact")
        res = {"id": qid, "source": sid, "quote": " ".join(parts), "found": verdict}
        if len(parts) > 1:
            res["parts"] = len(parts)
        if ratios:
            res["ratio"] = min(ratios)
        if res["found"] == "missing":
            bad.append(qid)
        out["quotes"].append(res)
    out["counts"] = {"quotes": len(QUOTES), "exact": sum(1 for q in out["quotes"] if q["found"] == "exact"),
                     "ocr": sum(1 for q in out["quotes"] if q["found"] == "ocr"), "missing": len(bad)}
    json.dump(out, open(os.path.join(HERE, "sources.json"), "w"), indent=1, ensure_ascii=False)
    print(json.dumps(out["counts"]))
    if bad:
        print("MISSING:", bad)
        sys.exit(1)


if __name__ == "__main__":
    main(sys.argv[1])
