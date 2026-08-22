#!/usr/bin/env python3
"""Verify entry 20's ATP quotations against the page-tagged extraction.

Method, inherited from material/atp/2026-08-18-reverification/ and the direct
readings after it: the extraction hyphenates across line breaks and keeps
column spacing, so literal substring search fails on present text. Every check
normalizes both sides to letters only (strip everything that is not a-z,
lowercase) and searches the normalized quotation inside the normalized text of
its cited page.

Pages 12-15 carry no printed marker in the extraction. They are located by the
reverification's inferred-marker method: the pdf-page blocks between the
confirmed markers [[ATP p. 10]] and [[ATP p. 16]] are exactly five, and are
assigned the printed numbers 11-15 in file order (consistent bracketing, not
an offset guess). The running head of each assigned block is checked for the
assigned number and reported per quotation.

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
    blocks = []  # (marker, body) in file order
    for i in range(1, len(parts), 2):
        blocks.append((parts[i], parts[i + 1] if i + 1 < len(parts) else ""))

    page_bodies = {}  # printed page -> (body, marker_status)
    for marker, body in blocks:
        m = re.match(r"\[\[ATP p\. (\d+)\]\]", marker)
        if m:
            page_bodies[int(m.group(1))] = (body, "confirmed")

    # Inferred bracketing for the unmarked pages between p. 10 and p. 16.
    i10 = next(i for i, (m, _) in enumerate(blocks) if m == "[[ATP p. 10]]")
    i16 = next(i for i, (m, _) in enumerate(blocks) if m == "[[ATP p. 16]]")
    between = blocks[i10 + 1:i16]
    bracketing_consistent = len(between) == 5
    if bracketing_consistent:
        for offset, (_, body) in enumerate(between):
            page_bodies.setdefault(11 + offset, (body, "inferred"))

    def head_has(body: str, n: int) -> bool:
        head = re.sub(r"\s+", "", body[:400])
        return str(n) in head

    quotes = json.loads((HERE / "quotes.json").read_text())
    results = []
    for q in quotes["quotes"]:
        page = q["page"]
        body, status = page_bodies.get(page, ("", "missing"))
        results.append({
            "id": q["id"],
            "page": page,
            "marker": status,
            "running_head_corroborates": head_has(body, page),
            "fragment_letters": len(norm(q["text"])),
            "on_cited_page": norm(q["text"]) in norm(body),
        })

    out = {
        "run": "2026-08-22, bell 25 (record 34)",
        "source": "frankbueltge/material atp.pages.txt (private; HEAD 489de9d)",
        "method": "letter-only normalization per the material README; pages 10 and 16 by confirmed printed marker; pages 11-15 by consistent bracketing between them (five blocks for five pages), running-head corroboration reported per quotation",
        "bracketing_consistent": bracketing_consistent,
        "results": results,
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
    return 0


if __name__ == "__main__":
    sys.exit(main())
