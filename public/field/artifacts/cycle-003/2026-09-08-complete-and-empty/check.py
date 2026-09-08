#!/usr/bin/env python3
"""Rebuild every number on index.html from the committed data files and fail on a one-digit
difference. No network, no model, standard library only.

    python3 artifacts/cycle-003/2026-09-08-complete-and-empty/check.py
    python3 artifacts/cycle-003/2026-09-08-complete-and-empty/check.py --verify-feed
        also refetches the atlas and re-derives every rule flag in data/entries.json.

Exit 0 = every check passed. Exit 1 = at least one number on the page is not derivable from
the committed data.
"""

from __future__ import annotations

import argparse
import html as htmllib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "tools", "hollow"))

from build import compute_numbers, load  # noqa: E402

SPAN = re.compile(r'<span class="n" data-check="([a-z0-9_]+)">(.*?)</span>', re.S)


def alias(key: str) -> str:
    """Keys repeated on the page carry a trailing digit: atlas_entries2 -> atlas_entries."""
    m = re.match(r"^(.*?)(\d)$", key)
    if m and m.group(1) in ALL:
        return m.group(1)
    return key


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--verify-feed", action="store_true")
    args = ap.parse_args()

    results, validation, entries = load()
    global ALL
    ALL = compute_numbers(results, validation, entries)

    with open(os.path.join(HERE, "index.html")) as fh:
        page = fh.read()

    spans = SPAN.findall(page)
    if not spans:
        print("FAIL: no checkable numbers found on the page")
        return 1

    failures = []
    checked = 0
    for key, rendered in spans:
        base = alias(key)
        if base not in ALL:
            failures.append(f"{key}: no such derived number")
            continue
        expected = ALL[base]
        shown = htmllib.unescape(rendered).strip()
        want = f"{expected}"
        if shown != want and shown != want + " %":
            # allow the suffix forms the page uses
            if not (shown.endswith(" %") and shown[:-2] == want):
                failures.append(f"{key}: page shows {shown!r}, data gives {want!r}")
                continue
        checked += 1

    # cross-checks that do not depend on the page: the data must be internally consistent
    inv = []
    rows = entries
    inv.append(("entry count", len(rows), results["feeds"]["atlas"]["count"]))
    inv.append(("dev+held", results["split"]["dev"] + results["split"]["held"], len(rows)))
    inv.append(("broad count", sum(1 for r in rows if r["hollow_broad"]),
                results["headline"]["all"]["hollow_broad"]["k"]))
    inv.append(("strict count", sum(1 for r in rows if r["hollow_strict"]),
                results["headline"]["all"]["hollow_strict"]["k"]))
    inv.append(("strict implies broad",
                sum(1 for r in rows if r["hollow_strict"] and not r["hollow_broad"]), 0))
    audit = json.load(open(os.path.join(DATA, "audit-labels.json")))["labels"]
    inv.append(("audit size", len(audit), validation["validation"]["n"]))
    inv.append(("audit negatives", sum(1 for a in audit if a["label"] == 0),
                validation["validation"]["hand_unusable"]))
    for name, got, want2 in inv:
        if got != want2:
            failures.append(f"invariant {name}: {got} != {want2}")
        else:
            checked += 1

    if args.verify_feed:
        import hashlib
        import urllib.request
        from hollow import classify, duplicate_keys, provenance  # noqa: E402
        url = results["feeds"]["atlas"]["url"]
        req = urllib.request.Request(url, headers={"User-Agent": "field-research/hollow-check"})
        raw = urllib.request.urlopen(req, timeout=60).read()
        live = json.loads(raw)["entries"]
        digest = hashlib.sha256(raw).hexdigest()
        if digest != results["feeds"]["atlas"]["sha256"]:
            print(f"NOTE: the feed has moved since the measurement "
                  f"({digest[:16]}… now, {results['feeds']['atlas']['sha256'][:16]}… then). "
                  f"Re-deriving flags on the live feed for the entries that are still present.")
        dupes = duplicate_keys([e["decisive_move"] for e in live])
        by_title = {e["title"]: e for e in live}
        redone = mismatch = 0
        for r in rows:
            e = by_title.get(r["title"])
            if not e:
                continue
            f = classify(e["decisive_move"], dupes)
            redone += 1
            if (f["hollow_broad"] != r["hollow_broad"] or f["hollow_strict"] != r["hollow_strict"]
                    or provenance(e["venue_prize"]) != r["provenance"]):
                mismatch += 1
        print(f"feed re-derivation: {redone} entries reproved, {mismatch} mismatched")
        if mismatch and digest == results["feeds"]["atlas"]["sha256"]:
            failures.append(f"{mismatch} flags do not reproduce from an unchanged feed")
        else:
            checked += 1

    if failures:
        print(f"FAIL — {len(failures)} of {len(spans) + len(inv)} checks")
        for f in failures:
            print("  " + f)
        return 1
    print(f"OK — {checked} checks passed "
          f"({len(spans)} rendered numbers, {len(inv)} invariants). "
          f"Every digit on the page is derivable from the committed data.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
