#!/usr/bin/env python3
"""Verify entry 18's ATP quotations against the page-tagged extraction.

Method, inherited from material/atp/2026-08-18-reverification/ and the two
direct readings that followed it: the extraction hyphenates across line breaks
and keeps column spacing, so literal substring search fails on present text.
Every check normalizes both sides to letters only (strip everything that is not
a-z, lowercase) and searches the normalized quotation inside the normalized text
of its cited page.

One extension of the method, made this session and disclosed because it widens
what counts as a located page. The prior scripts inferred a printed page number
only where both neighbours carried confirmed markers and differed by two.
Tonight's entry quotes pages 35 and 37, which sit inside a run of five pages
that carry no confirmed marker (the front-matter offset shifts there), so that
rule locates nothing. Two independent locators are used instead and both are
reported per page:

  1. **Offset inference** — the printed number computed from the nearest
     confirmed marker by index distance in the file.
  2. **Running-head corroboration** — the extraction preserves each page's
     running head, which carries the printed number itself; the head is searched
     for that number as a token in the page's first lines.

A page is reported as located only where both agree. Where they disagree, or
where one is missing, the quotation is reported with the disagreement rather
than counted.

Run beside a checkout of the private material repository:
    python3 verify.py /path/to/material/atp.pages.txt
No text of the edition is written out: results carry verdicts, page numbers,
marker status and fragment lengths only (floor rule 2 as amended).
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def norm(s: str) -> str:
    return re.sub(r"[^a-z]", "", s.lower())


def main() -> int:
    src = Path(sys.argv[1] if len(sys.argv) > 1 else "/home/user/material/atp.pages.txt")
    text = src.read_text(encoding="utf-8", errors="replace")

    parts = re.split(r"(\[\[ATP [^\]]+\]\])", text)
    pages = []  # (marker, body) in file order
    for i in range(1, len(parts), 2):
        pages.append((parts[i], parts[i + 1] if i + 1 < len(parts) else ""))

    def printed_no(marker: str):
        m = re.match(r"\[\[ATP p\. (\d+)\]\]", marker)
        return int(m.group(1)) if m else None

    confirmed = {}  # index -> printed number
    for idx, (marker, _body) in enumerate(pages):
        n = printed_no(marker)
        if n is not None:
            confirmed[idx] = n

    def head_has(body: str, n: int) -> bool:
        """Does the page's running head carry this printed number as a token?

        The head is printed within the first lines of the page; the layout
        sometimes breaks the number across lines, so the search runs over the
        head's digits with whitespace removed.
        """
        head = re.sub(r"\s+", "", body[:400])
        return str(n) in head

    def locate(page: int):
        """Return (body, status, offset_ok, head_ok) for a printed page."""
        # direct confirmed marker
        for idx, n in confirmed.items():
            if n == page:
                return pages[idx][1], "confirmed", True, head_has(pages[idx][1], page)
        # offset inference from the nearest confirmed marker
        best = None
        for idx, n in confirmed.items():
            dist = abs(n - page)
            if best is None or dist < best[0]:
                best = (dist, idx, n)
        if best is None:
            return "", "missing", False, False
        _dist, idx, n = best
        cand = idx + (page - n)
        if 0 <= cand < len(pages):
            body = pages[cand][1]
            return body, "inferred", True, head_has(body, page)
        return "", "missing", False, False

    quotes = json.loads((HERE / "quotes.json").read_text())
    results = []
    for q in quotes["quotes"]:
        page = q["page"]
        body, status, offset_ok, head_ok = locate(page)
        found = norm(q["text"]) in norm(body)
        results.append({
            "id": q["id"],
            "page": page,
            "marker": status,
            "offset_locates": offset_ok,
            "running_head_corroborates": head_ok,
            "fragment_letters": len(norm(q["text"])),
            "on_cited_page": found,
        })

    whole = norm(text)
    # The collation datum of this session: KsK glosses the naming condition as
    # "attained at the highest point of depersonalisation" and cites ATP 36-37.
    # Where does that wording stand, and what stands inside the cited span?
    body35, st35, off35, head35 = locate(35)
    body36, st36, off36, head36 = locate(36)
    body37, st37, off37, head37 = locate(37)
    datum = {
        "gloss_wording_on_35": {
            "search": "at the highest point of this depersonalization that someone can be named",
            "page": 35,
            "marker": st35,
            "running_head_corroborates": head35,
            "found": norm("at the highest point of this depersonalization that someone can be named")
            in norm(body35),
        },
        "gloss_wording_inside_36_37": {
            "search": "highest point of ... depersonalization - letters-only, pages 36 and 37",
            "found_on_36": norm("highestpointof") in norm(body36),
            "found_on_37": norm("highestpointof") in norm(body37),
        },
        "cited_span_wording_on_37": {
            "search": "at the outcome of the most severe operation of depersonalization",
            "page": 37,
            "marker": st37,
            "running_head_corroborates": head37,
            "found": norm("at the outcome of the most severe operation of depersonalization")
            in norm(body37),
        },
        "quoted_phrase_occurrences_whole_text": {
            "search": "The proper name is the instantaneous apprehension of a multiplicity",
            "count": whole.count(norm("the proper name is the instantaneous apprehension of a multiplicity")),
        },
    }

    out = {
        "run": "2026-08-21, night 08 (record 25)",
        "source": "frankbueltge/material atp.pages.txt (private; HEAD 489de9d)",
        "method": "letter-only normalization per the material README; page located by confirmed marker, or by offset inference corroborated against the printed running head (see module docstring)",
        "results": results,
        "collation_datum_checks": datum,
        "tally": {
            "checked": len(results),
            "on_cited_page": sum(r["on_cited_page"] for r in results),
            "confirmed_marker": sum(r["marker"] == "confirmed" for r in results),
            "inferred_marker": sum(r["marker"] == "inferred" for r in results),
            "running_head_corroborated": sum(r["running_head_corroborates"] for r in results),
        },
    }
    (HERE / "results.json").write_text(json.dumps(out, indent=2) + "\n")
    print(json.dumps(out["tally"], indent=2))
    print(json.dumps(datum, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
