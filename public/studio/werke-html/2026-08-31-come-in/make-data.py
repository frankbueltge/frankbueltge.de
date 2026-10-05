#!/usr/bin/env python3
"""COME IN — build data.json.

Reads three sources and writes one file. Network is needed to run it; the work
itself needs none.

  1. The Field's cohort table and declared-link table, published 2026-08-31 in
     frankbueltge/field-research, artifacts/cycle-001/2026-08-31-links-in-the-abstract/
     data/papers.csv  — 1226 arXiv papers, two cohorts, matched month for month
     data/urls.csv    — the 206 addresses their abstracts declare
     data/probes.csv  — what happened when each address was knocked on, 2026-08-31
  2. The arXiv API, for the abstract of each paper that declares an address (191).

What this script adds to the Field's table is the sentence. For every declared
address it finds the sentence that carries it, records where that sentence sits
in the abstract, and takes the hinge — the last content word before the address,
the word that does the inviting. Nothing is hand-classified: the hinge is the
last token that is not in STOP.

Abstracts are NOT written out. data.json carries one sentence per address, each
with its arXiv identifier, as a short quotation with its source.

  python3 make-data.py            # fetch everything, write data.json
  python3 make-data.py --check    # rebuild and diff against the committed file
"""

import argparse
import collections
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
FIELD = ("https://raw.githubusercontent.com/frankbueltge/field-research/main/"
         "artifacts/cycle-001/2026-08-31-links-in-the-abstract/data/")
ARXIV = "http://export.arxiv.org/api/query?"

# Function words. The hinge is the last word before the address that is not one
# of these — for 'Our code is available at <url>' that is 'available'.
STOP = set("""a an the at on on-the in into to of for and or is are am be been being was
were our we you they it its their there this that these those with via from as by all can
could will would may might my his her our new full also both please here""".split())

# A sentence counts as an imperative when it opens — at its start or after a full stop or
# semicolon — with one of these verbs. The list was fixed by reading all 29 distinct words
# that begin a sentence anywhere in the corpus and taking every one that is a verb, plus
# the obvious near neighbours, so that a wider corpus would still be caught.
IMPERATIVE_VERBS = ("see|visit|check|explore|try|get|download|find|access|use|browse|refer|"
                    "contact|watch|read|join|follow|clone|install|play|look|head")

ABSENT = {
    "you / your": r"\b(you|your|yours|yourself)\b",
    "please": r"\bplease\b",
    "welcome": r"\bwelcome\w*\b",
    "invite / invitation": r"\binvit\w*\b",
    "come": r"\bcome\b",
    "we hope": r"\bwe hope\b",
    "enjoy": r"\benjoy\w*\b",
}


def get(url, timeout=90):
    return urllib.request.urlopen(url, timeout=timeout).read().decode("utf-8", "replace")


def rows(csv_text):
    import csv as _csv
    return list(_csv.DictReader(csv_text.splitlines()))


def norm(s):
    return " ".join(s.split())


def sentences(text):
    """Split on sentence boundaries without breaking inside an address."""
    urls = re.findall(r"https?://\S+|www\.\S+", text)
    masked = text
    for n, u in enumerate(urls):
        masked = masked.replace(u, "\x00%d\x00" % n, 1)
    out = []
    for part in re.split(r"(?<=[.!?])\s+(?=[A-Z(\x00])", masked):
        for n, u in enumerate(urls):
            part = part.replace("\x00%d\x00" % n, u)
        out.append(part)
    return out


def fetch_abstracts(ids, cache=None):
    have = {}
    if cache and os.path.exists(cache):
        have = json.load(open(cache))
    todo = [i for i in ids if i not in have]
    for k in range(0, len(todo), 50):
        batch = todo[k:k + 50]
        q = ARXIV + urllib.parse.urlencode({"id_list": ",".join(batch), "max_results": 100})
        try:
            xml = get(q)
        except Exception as exc:                                    # noqa: BLE001
            print("  arXiv batch %d failed: %s" % (k, exc), file=sys.stderr)
            time.sleep(5)
            continue
        for entry in re.findall(r"<entry>(.*?)</entry>", xml, re.S):
            m = re.search(r"<id>http://arxiv\.org/abs/([^<]+)</id>", entry)
            s = re.search(r"<summary>(.*?)</summary>", entry, re.S)
            t = re.search(r"<title>(.*?)</title>", entry, re.S)
            if not (m and s):
                continue
            have[m.group(1).split("v")[0]] = {
                "title": html.unescape(norm(t.group(1))) if t else "",
                "abstract": html.unescape(s.group(1)),
            }
        print("  %d/%d abstracts" % (len(have), len(ids)), file=sys.stderr)
        if cache:
            json.dump(have, open(cache, "w"))
        time.sleep(3.5)
    missing = [i for i in ids if i not in have]
    if missing:
        raise SystemExit("arXiv did not return %d abstracts: %s" % (len(missing), missing[:5]))
    return have


def build(cache=None):
    print("reading the Field's tables", file=sys.stderr)
    papers = rows(get(FIELD + "papers.csv"))
    urls = rows(get(FIELD + "urls.csv"))
    probes = {p["url"]: p for p in rows(get(FIELD + "probes.csv"))}
    ids = sorted({u["arxiv_id"] for u in urls})
    print("fetching %d abstracts from arXiv" % len(ids), file=sys.stderr)
    abstracts = fetch_abstracts(ids, cache=cache)

    records, unfound = [], []
    for u in urls:
        text = norm(abstracts[u["arxiv_id"]]["abstract"])
        addr = u["url"]
        if addr not in text:
            for cand in (addr.rstrip("/"), addr.replace("https://", ""),
                         addr.replace("https://www.", "")):
                if cand in text:
                    addr = cand
                    break
        if addr not in text:
            unfound.append(u["url"])
            continue
        parts = sentences(text)
        idx = next(i for i, s in enumerate(parts) if addr in s)
        before = text[:text.find(addr)]
        toks = [t for t in re.sub(r"[^A-Za-z\- ]", " ", before).lower().split() if len(t) > 1]
        hinge = next((t for t in reversed(toks) if t not in STOP), None)
        probe = probes.get(u["url"], {})
        records.append({
            "arxiv_id": u["arxiv_id"],
            "cohort": u["cohort"],
            "published": u["published"],
            "url": u["url"],
            "host": u["host"],
            "sentence": parts[idx],
            "hinge": hinge,
            "sentence_index": idx + 1,
            "sentences_in_abstract": len(parts),
            "is_final_sentence": idx == len(parts) - 1,
            "outcome": probe.get("outcome", "not probed"),
            "probe_note": probe.get("note", ""),
        })
    if unfound:
        raise SystemExit("address not present in its own abstract: %s" % unfound)

    per_paper, seen = [], set()
    for r in records:
        if r["arxiv_id"] in seen:
            continue
        seen.add(r["arxiv_id"])
        per_paper.append(r)

    absent = {}
    for name, pat in ABSENT.items():
        absent[name] = sum(1 for r in records if re.search(pat, r["sentence"], re.I))
    imp_pat = re.compile(r"(?:^|[.;] )[^A-Za-z]{0,3}(?:%s)\b" % IMPERATIVE_VERBS, re.I)
    imperative = [r["arxiv_id"] for r in records if imp_pat.search(r["sentence"])]
    openers = sorted({re.match(r"[^A-Za-z]*([A-Za-z]+)", r["sentence"]).group(1)
                      for r in records if re.match(r"[^A-Za-z]*([A-Za-z]+)", r["sentence"])})

    hinges = collections.Counter(r["hinge"] for r in records)
    outcomes = collections.Counter(r["outcome"] for r in records)
    cohorts = collections.Counter(r["cohort"] for r in per_paper)

    return {
        "work": "COME IN",
        "built_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "sources": {
            "cohorts_and_links": FIELD,
            "field_artifact": ("https://github.com/frankbueltge/field-research/tree/main/"
                               "artifacts/cycle-001/2026-08-31-links-in-the-abstract"),
            "probe_date": "2026-08-31",
            "abstracts": "http://export.arxiv.org/api/query (one request per 50 identifiers)",
        },
        "corpus": {
            "papers": len(papers),
            "cohort_A_automation": sum(1 for p in papers if p["cohort"] == "A"),
            "cohort_B_control": sum(1 for p in papers if p["cohort"] == "B"),
            "papers_with_address": len(per_paper),
            "papers_with_address_A": cohorts["A"],
            "papers_with_address_B": cohorts["B"],
            "addresses": len(records),
        },
        "position": {
            "final_sentence": sum(1 for r in per_paper if r["is_final_sentence"]),
            "last_two_sentences": sum(1 for r in per_paper
                                      if r["sentence_index"] >= r["sentences_in_abstract"] - 1),
            "of": len(per_paper),
        },
        "hinges": dict(hinges.most_common()),
        "distinct_hinges": len(hinges),
        "absent": absent,
        "imperatives": imperative,
        "sentence_openers": openers,
        "outcomes": dict(outcomes),
        "records": records,
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="rebuild and compare against the committed data.json")
    ap.add_argument("--cache", default=None, help="abstract cache file (optional)")
    args = ap.parse_args()
    data = build(cache=args.cache)
    path = os.path.join(HERE, "data.json")
    if args.check:
        old = json.load(open(path))
        drop = lambda d: {k: v for k, v in d.items() if k != "built_utc"}          # noqa: E731
        if drop(old) == drop(data):
            print("data.json reproduces exactly")
            sys.exit(0)
        print("data.json DIFFERS from a fresh build", file=sys.stderr)
        for k in drop(data):
            if old.get(k) != data[k]:
                print("  changed: %s" % k, file=sys.stderr)
        sys.exit(1)
    json.dump(data, open(path, "w"), indent=1, ensure_ascii=False)
    print("wrote %s — %d addresses, %d papers" %
          (path, len(data["records"]), data["corpus"]["papers_with_address"]))
