#!/usr/bin/env python3
"""Fetch the sampled papers in every rendering arXiv offers, and hold their text.

Ground truth for this session is deliberately the UNION of every rendering of a
paper that arXiv will give us — the PDF extracted by this house's own extractor,
the publisher's own HTML where it exists, and the ar5iv LaTeX-to-HTML rendering
where it exists. A quotation counts as present if it occurs in ANY of them.
The union is the conservative choice: every artefact of our own extraction makes
a real quotation look absent, and this session's headline number is a count of
absent quotations, so the burden must fall our way.

Nothing fetched here is committed: PDFs and extracted texts are third-party
source files and stay outside the repository. What is committed is
data/groundtruth.json - per paper, which renderings answered, the sha256 of each,
its character count, and the extraction-fidelity control of the pre-registration
§4.3: how much of the paper's own abstract, taken from the arXiv abstract page
and therefore independent of every rendering, is recoverable from the union.

No model sits between a source and a quoted passage.

Usage: python3 groundtruth.py <work-dir>
"""
import hashlib
import html as htmllib
import json
import os
import re
import sys
import time
import urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(REPO, "tools", "completeness-census"))
import pdftext  # noqa: E402
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from match import coverage, norm  # noqa: E402

UA = "Mozilla/5.0 (compatible; field-research/meridian; +https://frankbueltge.de)"
RENDERINGS = [
    ("pdf", "https://arxiv.org/pdf/%s"),
    ("html", "https://arxiv.org/html/%s"),
    ("ar5iv", "https://ar5iv.labs.arxiv.org/html/%s"),
]


def get(url, timeout=180):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as fh:
        return fh.read(), fh.status


def html_text(raw):
    page = raw.decode("utf-8", "replace")
    page = re.sub(r"(?is)<(script|style|math)\b.*?</\1>", " ", page)
    page = re.sub(r"(?s)<!--.*?-->", " ", page)
    page = re.sub(r"<[^>]+>", " ", page)
    return " ".join(htmllib.unescape(page).split())


def abstract_of(arxiv_id):
    raw, _ = get("https://arxiv.org/abs/" + arxiv_id)
    page = raw.decode("utf-8", "replace")
    m = re.search(r'<blockquote class="abstract[^"]*">(.*?)</blockquote>', page, re.S)
    if not m:
        return None
    txt = re.sub(r"<[^>]+>", " ", m.group(1))
    txt = htmllib.unescape(txt)
    return re.sub(r"^\s*Abstract:?\s*", "", " ".join(txt.split()))


def main():
    work = sys.argv[1]
    os.makedirs(os.path.join(work, "src"), exist_ok=True)
    os.makedirs(os.path.join(work, "txt"), exist_ok=True)
    sample = json.load(open("data/sample.json", encoding="utf-8"))

    rows = []
    for item in sample["items"]:
        aid = item["arxiv_id"]
        row = {"arxiv_id": aid, "arm": item["arm"], "title": item["title"],
               "renderings": {}}
        texts = []
        for kind, tmpl in RENDERINGS:
            url = tmpl % aid
            path = os.path.join(work, "src", "%s.%s" % (aid, kind))
            rec = {"url": url}
            try:
                if not os.path.exists(path):
                    blob, status = get(url)
                    open(path, "wb").write(blob)
                    time.sleep(2)
                blob = open(path, "rb").read()
                rec["sha256"] = hashlib.sha256(blob).hexdigest()
                rec["bytes"] = len(blob)
                text = pdftext.extract(blob) if kind == "pdf" else html_text(blob)
                # an arXiv "no HTML" stub is a short page, not a paper
                if len(norm(text).split()) < 400:
                    rec["status"] = "too short to be a paper (%d words)" % \
                        len(norm(text).split())
                else:
                    rec["status"] = "ok"
                    rec["chars"] = len(text)
                    texts.append(text)
                    open(os.path.join(work, "txt", "%s.%s.txt" % (aid, kind)), "w",
                         encoding="utf-8").write(text)
            except Exception as exc:                            # noqa: BLE001
                rec["status"] = "%s: %s" % (type(exc).__name__, exc)
            row["renderings"][kind] = rec

        row["renderings_usable"] = sorted(
            k for k, v in row["renderings"].items() if v.get("status") == "ok")
        try:
            abstract = abstract_of(aid)
            time.sleep(2)
            row["abstract_chars"] = len(abstract or "")
            row["abstract_coverage"] = max(
                (coverage(abstract, t) for t in texts), default=None)
        except Exception as exc:                                # noqa: BLE001
            row["abstract_error"] = "%s: %s" % (type(exc).__name__, exc)
            row["abstract_coverage"] = None
        rows.append(row)
        print("%-12s %-5s %-22s abstract_coverage %s" %
              (aid, row["arm"], ",".join(row["renderings_usable"]),
               row["abstract_coverage"]))

    json.dump({
        "fetched_on": "2026-09-14",
        "extractor": "tools/completeness-census/pdftext.py (2026-09-09)",
        "ground_truth": "union of every rendering whose status is ok",
        "control": "abstract_coverage = longest contiguous run of the arXiv "
                   "abstract page's own abstract found in the union, as a share "
                   "of the abstract's length in words",
        "note": "fetched files are third-party sources and are not committed; "
                "the sha256 identifies what was read.",
        "papers": rows,
    }, open("data/groundtruth.json", "w", encoding="utf-8"), indent=1,
        ensure_ascii=False)


if __name__ == "__main__":
    main()
