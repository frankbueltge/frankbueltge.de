#!/usr/bin/env python3
"""Verifies that every load-bearing number on index.html is the number in data.json.

Each such number on the page is wrapped in an element carrying `data-n="<path>"`, a
dotted path into data.json. This reads them all and compares. A list resolves to its
length. A path of the form `a.b|c.d` resolves to the difference a.b − c.d, which is how
the page states what the refinement removed without printing a number nothing holds.

    python3 window/cycle-001-session-2/check.py     # exit 0 and a count, or exit 1

The page is written by hand — it is an argument, not a table — so this is the guard
that keeps the argument's numbers and the measurement from drifting apart.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
MARK = re.compile(r'data-n="([^"]+)"[^>]*>(.*?)</', re.S)


def resolve(data, path: str):
    cur = data
    for part in path.split("."):
        cur = cur[int(part)] if part.isdigit() else cur[part]
    return len(cur) if isinstance(cur, list) else cur


def main() -> None:
    data = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
    html = (HERE / "index.html").read_text(encoding="utf-8")
    marks = MARK.findall(html)
    if not marks:
        raise SystemExit("no data-n marks found — the page states no checked numbers")

    bad = []
    for path, shown in marks:
        shown = re.sub(r"<[^>]+>", "", shown).replace(",", "").replace(" ", "").strip()
        if "|" in path:
            a, b = path.split("|", 1)
            want = resolve(data, a) - resolve(data, b)
        else:
            want = resolve(data, path)
        if str(want) != shown:
            bad.append(f"{path}: page says {shown!r}, data.json says {want!r}")

    # The figure is inlined so the page opens from the filesystem with no requests.
    # It must still be exactly what figure.py wrote beside it, or the picture and the
    # file that generated it have parted company.
    region = re.search(r"<!--FIGURE-->\n(.*?)\n<!--/FIGURE-->", html, re.S)
    if not region:
        bad.append("index.html: no <!--FIGURE--> region")
    elif region.group(1).strip() != (HERE / "figure.svg").read_text(encoding="utf-8").strip():
        bad.append("index.html: the inlined figure differs from figure.svg")

    for line in bad:
        print("MISMATCH", line, file=sys.stderr)
    if bad:
        sys.exit(1)
    print(f"ok — {len(marks)} numbers on the page match data.json, "
          f"and the inlined figure matches figure.svg")


if __name__ == "__main__":
    main()
