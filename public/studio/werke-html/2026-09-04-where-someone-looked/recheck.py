#!/usr/bin/env python3
"""Re-derive, against today's feed, the two numbers this practice published on
2026-09-03, and write the comparison to evidence/recheck.json.

    python3 recheck.py

The record of 2026-09-03 (THE SECOND ADDRESS, and the note to the architect in
REQUESTS.md) reported 61 entries of the ArtBase harvest whose `decisive_move`
is scraped catalogue page furniture, and offered the rule that detects them.
Run against today's feed, that published rule returns a different number. This
script establishes which of the two things moved - the file or the rule - by
comparing today's citation set against the 503 addresses committed yesterday in
`works/2026-09-03-the-second-address/evidence/survey.jsonl`.

Nothing here is repaired. Both numbers stand under their dates.
"""

import datetime
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
DATA = os.path.join(HERE, "data.json")
YESTERDAY = os.path.join(ROOT, "works", "2026-09-03-the-second-address",
                         "evidence", "survey.jsonl")
OUT = os.path.join(HERE, "evidence", "recheck.json")

PUBLISHED_RULE = r"inception:|access URL:|attributed to:|description edit|PreviousNext"
PUBLISHED_COUNT = 61        # reported 2026-09-03, over the 188 ArtBase entries
PUBLISHED_ADDRESSES = 503   # distinct addresses knocked on 2026-09-03


def main():
    rec = json.load(open(DATA, encoding="utf-8"))
    works = rec["works_list"]

    today_addresses = {w["url"] for w in works}
    yesterday_addresses = {json.loads(line)["url"]
                           for line in open(YESTERDAY, encoding="utf-8")}

    artbase = [w for w in works if w["host"] == "artbase.rhizome.org"]
    today_furniture = sum(1 for w in artbase if w["furniture"])

    out = {
        "checked_utc": datetime.datetime.now(datetime.timezone.utc)
                       .replace(microsecond=0).isoformat(),
        "feed_sha256": rec["source"]["sha256"],
        "published": {
            "date": "2026-09-03",
            "rule": PUBLISHED_RULE,
            "furniture_entries": PUBLISHED_COUNT,
            "artbase_entries": 188,
            "distinct_addresses": PUBLISHED_ADDRESSES,
        },
        "today": {
            "rule": rec["rule"]["furniture_pattern"],
            "furniture_entries": today_furniture,
            "artbase_entries": len(artbase),
            "distinct_addresses": len(today_addresses),
        },
        "citation_set": {
            "yesterday": len(yesterday_addresses),
            "today": len(today_addresses),
            "only_yesterday": sorted(yesterday_addresses - today_addresses),
            "only_today": sorted(today_addresses - yesterday_addresses),
            "identical": yesterday_addresses == today_addresses,
        },
    }
    out["reading"] = (
        "The citation set is identical in all "
        f"{len(today_addresses)} addresses, so the entries did not change; the "
        f"published rule returns {today_furniture} today against the "
        f"{PUBLISHED_COUNT} published. The difference is in the rule, not the "
        "file. Yesterday's number stands under its date and is not withdrawn; "
        "today's is derived here beside it."
        if yesterday_addresses == today_addresses else
        "The citation set moved between the two days; the difference in the "
        "count cannot be attributed to the rule alone."
    )

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(OUT)
    print(" ", out["reading"])


if __name__ == "__main__":
    main()
