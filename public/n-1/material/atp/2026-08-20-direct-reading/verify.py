#!/usr/bin/env python3
"""Verify entry 17's ATP quotations against the page-tagged extraction.

Method (unchanged from material/atp/2026-08-18-reverification/ and
2026-08-19-direct-reading/): the extraction hyphenates across line breaks and
keeps column spacing, so literal substring search fails on present text. Every
check therefore normalizes both sides to letters only (strip everything that is
not a-z, lowercase) and searches the normalized quotation inside the normalized
text of its cited page.

Marker status per the material README: a page marker [[ATP p. N]] carries a
printed number confirmed against the page's position; [[ATP pdf N -- no printed
number]] means the printed number was not established at extraction. Where a
quotation's page carries no confirmed marker, the printed number is inferred
from confirmed neighbours and reported as "inferred".

The script also runs one negative check for the collation datum of 2026-08-20:
the phrase KsK T5 quotes as "a scribble effacing all sounds" (cited ATP
343-344) is searched across the whole extraction in normalized form, alongside
the doubled phrase the page actually carries.

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

    # split into (marker, body) pages
    parts = re.split(r"(\[\[ATP [^\]]+\]\])", text)
    pages = []  # (marker, body)
    for i in range(1, len(parts), 2):
        pages.append((parts[i], parts[i + 1] if i + 1 < len(parts) else ""))

    def printed_no(marker: str):
        m = re.match(r"\[\[ATP p\. (\d+)\]\]", marker)
        return int(m.group(1)) if m else None

    # map printed page -> (body, status). For unconfirmed markers, infer the
    # printed number when both neighbours are confirmed and differ by 2.
    by_page = {}
    for idx, (marker, body) in enumerate(pages):
        n = printed_no(marker)
        if n is not None:
            by_page[n] = (body, "confirmed")
        else:
            prev_n = printed_no(pages[idx - 1][0]) if idx > 0 else None
            next_n = printed_no(pages[idx + 1][0]) if idx + 1 < len(pages) else None
            if prev_n is not None and next_n is not None and next_n - prev_n == 2:
                by_page.setdefault(prev_n + 1, (body, "inferred"))

    quotes = json.loads((HERE / "quotes.json").read_text())
    results = []
    for q in quotes["quotes"]:
        page = q["page"]
        body, status = by_page.get(page, ("", "missing"))
        found = norm(q["text"]) in norm(body)
        results.append({
            "id": q["id"],
            "page": page,
            "marker": status,
            "fragment_letters": len(norm(q["text"])),
            "on_cited_page": found,
        })

    whole = norm(text)
    negative = {
        "ksk_single_phrase": {
            "search": "a scribble effacing all sounds (KsK T5, cited ATP 343-344), letters-only, whole extraction",
            "found_anywhere": norm("a scribble effacing all sounds") in whole,
        },
        "doubled_phrase_on_344": {
            "search": "a scribble effacing all lines, a scramble effacing all sounds - page 344",
            "found_on_344": norm("a scribble effacing all lines, a scramble effacing all sounds")
            in norm(by_page.get(344, ("", ""))[0]),
        },
        "any_part_on_343": {
            "search": "scribble / scramble / effacing - page 343, letters-only",
            "found_on_343": any(
                norm(w) in norm(by_page.get(343, ("", ""))[0])
                for w in ("scribble", "scramble", "effacing")
            ),
        },
    }

    out = {
        "run": "2026-08-20, night 07 (record 24)",
        "source": "frankbueltge/material atp.pages.txt (private; HEAD 489de9d)",
        "method": "letter-only normalization per the material README; markers per extraction",
        "results": results,
        "collation_datum_checks": negative,
        "tally": {
            "checked": len(results),
            "on_cited_page": sum(r["on_cited_page"] for r in results),
        },
    }
    (HERE / "results.json").write_text(json.dumps(out, indent=2) + "\n")
    print(json.dumps(out["tally"], indent=2))
    print(json.dumps(negative, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
