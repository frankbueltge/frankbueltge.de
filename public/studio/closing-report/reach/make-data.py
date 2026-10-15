#!/usr/bin/env python3
"""Recount the reach ledger from this repository and write data.json.

Every number on the page beside this script comes out of here. Run it from the
repository root:

    python3 closing-report/reach/make-data.py

It reads only files already in this repository. It touches no network. If a
number in data.json disagrees with what the repository holds today, this script
is the thing that is wrong, and re-running it is the correction.
"""

import datetime as dt
import glob
import json
import os
import re
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "closing-report", "reach", "data.json")

DATE_RE = re.compile(r"(\d{4}-\d{2}-\d{2})")


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as fh:
        return fh.read()


# ---------------------------------------------------------------- outward ---
chronicle = json.loads(read("chronicle.json"))
sessions = len(chronicle)
session_days = Counter(e["date"] for e in chronicle)
first_day = min(session_days)
last_day = max(session_days)

works = sorted(
    d for d in os.listdir(os.path.join(ROOT, "works"))
    if os.path.isdir(os.path.join(ROOT, "works", d))
)

packets = []
for path in sorted(glob.glob(os.path.join(ROOT, "delivery", "*", "packet.json"))):
    packets.append(json.loads(open(path, encoding="utf-8").read()))

# Named receivers per packet: the first send plus the reserves, counted from
# the numbered reserve entries in RECEIVERS.md, which is the practice's own
# record of who a packet was ever addressed to.
receivers = 0
for path in sorted(glob.glob(os.path.join(ROOT, "delivery", "*", "RECEIVERS.md"))):
    body = open(path, encoding="utf-8").read()
    reserves = len(re.findall(r"^\*\*\d+\. ", body, re.M))
    receivers += 1 + reserves

sent = sum(1 for p in packets if p.get("status") == "sent")

# ---------------------------------------------------------------- inward ----
feedback = sorted(glob.glob(os.path.join(ROOT, "studio-feedback", "*.md")))
feedback_days = Counter(
    DATE_RE.match(os.path.basename(f)).group(1) for f in feedback
)

# A feedback file counts as machine-generated when its first line is one of the
# two automated headings the site's gates write. Anything else would be a human
# hand and is counted separately.
MACHINE_HEADS = ("# Build feedback", "# Site-PR-Schleuse")
machine, human = [], []
for f in feedback:
    head = open(f, encoding="utf-8").readline().strip()
    (machine if head.startswith(MACHINE_HEADS) else human).append(
        os.path.relpath(f, ROOT)
    )

# The architect writes into REQUESTS.md under his own name. Those are replies,
# and they come from inside the house.
requests_text = read("REQUESTS.md") + "\n" + read("REQUESTS-ARCHIVE.md")
headings = re.findall(r"^## .*$", requests_text, re.M)
architect = [h for h in headings
             if "(Frank, architect)" in h or re.search(r"Seed — .*\(Frank\)", h)]
from_practice = [h for h in headings if h.startswith("## Ensemble")]

# ---------------------------------------------------------------- series ----
start = dt.date.fromisoformat(first_day)
end = dt.date.fromisoformat(last_day)
series, day = [], start
while day <= end:
    key = day.isoformat()
    series.append({"date": key,
                   "sessions": session_days.get(key, 0),
                   "inbound": feedback_days.get(key, 0)})
    day += dt.timedelta(days=1)

data = {
    "_note": "Counted from this repository by closing-report/reach/make-data.py. "
             "Every figure on index.html is read from this file.",
    "counted_on": dt.datetime.now(dt.timezone.utc).date().isoformat(),
    "span": {"from": first_day, "to": last_day, "days": len(series)},
    "outward": {
        "sessions": sessions,
        "session_days": len([d for d in series if d["sessions"]]),
        "works_premiered": len(works),
        "works": works,
        "packets_prepared": len(packets),
        "packets": [{"id": p["id"], "piece": p["piece"],
                     "receiver": p["receiver"], "status": p["status"],
                     "as_of": p["as_of"]} for p in packets],
        "receivers_named": receivers,
        "packets_sent": sent,
    },
    "inward": {
        "files": len(feedback),
        "machine_generated": len(machine),
        "human_written": len(human),
        "human_files": human,
        "architect_replies": len(architect),
        "architect_headings": architect,
        "requests_from_the_practice": len(from_practice),
        "from_outside_the_house": 0,
    },
    "series": series,
}

with open(OUT, "w", encoding="utf-8") as fh:
    json.dump(data, fh, indent=2, ensure_ascii=False)
    fh.write("\n")

print(f"wrote {os.path.relpath(OUT, ROOT)}")
print(f"  {sessions} sessions over {len(series)} days, {len(works)} works")
print(f"  {len(packets)} packets, {receivers} receivers named, {sent} sent")
print(f"  {len(feedback)} inbound files: {len(machine)} machine, {len(human)} human")
print(f"  {len(architect)} architect replies, {len(from_practice)} requests from the practice")
