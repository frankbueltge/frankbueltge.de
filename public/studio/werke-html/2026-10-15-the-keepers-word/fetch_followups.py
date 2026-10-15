"""Fetch the signed CAP text of every follow-up (Update or Cancel) from the same senders,
to read its <references>: the only link the archive keeps from a follow-up to the warning it ends.
Writes a raw cache outside the repository (argument 1)."""
import json, sys, time, urllib.request, urllib.parse, os, re

OUT = sys.argv[1]
BASE = "https://www.fema.gov/api/open/v1/IpawsArchivedAlerts"
FILTER = "sender ne 'w-nws.webmaster@noaa.gov' and msgType ne 'Alert'"
os.makedirs(OUT, exist_ok=True)
skip, out = 0, {}
while True:
    q = urllib.parse.urlencode({"$filter": FILTER, "$select": "id,originalMessage", "$orderby": "sent,id",
                                "$top": 5000, "$skip": skip}, safe="$,'")
    for attempt in range(5):
        try:
            with urllib.request.urlopen(BASE + "?" + q, timeout=300) as r:
                rows = json.load(r)["IpawsArchivedAlerts"]
            break
        except Exception as e:
            print("retry", e); time.sleep(2 ** attempt)
    for r in rows:
        m = re.search(r"<references>(.*?)</references>", r["originalMessage"] or "", re.S)
        out[r["id"]] = m.group(1).strip() if m else ""
    print(skip, len(rows), flush=True)
    if len(rows) < 5000: break
    skip += 5000
json.dump(out, open(f"{OUT}/references.json", "w"))
