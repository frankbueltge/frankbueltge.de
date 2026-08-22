#!/usr/bin/env python3
"""Verify entry 19's ATP quotations against the page-tagged extraction.

Method, inherited from material/atp/2026-08-18-reverification/ and the three
direct readings that followed it: the extraction hyphenates across line breaks
and keeps column spacing, so literal substring search fails on present text.
Every check normalizes both sides to letters only (strip everything that is not
a-z, lowercase) and searches the normalized quotation inside the normalized text
of its cited page. Every page tonight's entry cites (367, 437, 438, 444) carries
a confirmed printed marker in the extraction, so no offset inference is needed;
the running-head corroboration of record 25's locator is still reported per page.

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

    def body_of(page: int):
        for marker, body in pages:
            m = re.match(r"\[\[ATP p\. (\d+)\]\]", marker)
            if m and int(m.group(1)) == page:
                return body, "confirmed"
        return "", "missing"

    def head_has(body: str, n: int) -> bool:
        head = re.sub(r"\s+", "", body[:400])
        return str(n) in head

    quotes = json.loads((HERE / "quotes.json").read_text())
    results = []
    for q in quotes["quotes"]:
        page = q["page"]
        body, status = body_of(page)
        results.append({
            "id": q["id"],
            "page": page,
            "marker": status,
            "running_head_corroborates": head_has(body, page),
            "fragment_letters": len(norm(q["text"])),
            "on_cited_page": norm(q["text"]) in norm(body),
        })

    out = {
        "run": "2026-08-22, night 09 (record 28)",
        "source": "frankbueltge/material atp.pages.txt (private; HEAD 489de9d)",
        "method": "letter-only normalization per the material README; every cited page located by its confirmed printed marker; running-head corroboration reported per page",
        "results": results,
        "tally": {
            "checked": len(results),
            "on_cited_page": sum(r["on_cited_page"] for r in results),
            "confirmed_marker": sum(r["marker"] == "confirmed" for r in results),
            "running_head_corroborated": sum(r["running_head_corroborates"] for r in results),
        },
    }
    (HERE / "results.json").write_text(json.dumps(out, indent=2) + "\n")
    print(json.dumps(out["tally"], indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
