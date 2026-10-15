"""Derive seq.json: the Berkeley record in time order, with the one field the Studio's record drops.

The Studio's BELOW THE TRACE record (events.json at a pinned commit, digest-checked) keeps year,
fraction of year and magnitude. It drops the magnitude TYPE. This script re-fetches the same
query from ANSS ComCat (USGS, public domain) — the URL template the Studio's sources.json states —
one request per year 1974-2025, and requires that the re-fetch holds exactly the Studio's
multiset of (year, magnitude) before anything is kept. Then it writes, in time order, one row
per event with a magnitude: [year, magnitude in hundredths, magnitude type]. Times, places and
ids are dropped; the responses themselves are not committed (protocol v7 §7), their digests are.

    python3 derive.py <dir-with-YYYY.csv>   # use responses already fetched
    python3 derive.py                       # fetch them (52 requests)
"""
import csv, hashlib, io, json, sys, urllib.request
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
STUDIO = ("https://raw.githubusercontent.com/frankbueltge/studio/"
          "0291f8e77c93fa4caf9e27a7321355854efef7bf/works/2026-09-25-below-the-trace/events.json")
STUDIO_SHA = "5f7425326c15af3fb1279ded50249d2b7ca603a1f594d387625cc8f919af719c"
Q = ("https://earthquake.usgs.gov/fdsnws/event/1/query?format=csv&starttime={y}-01-01"
     "&endtime={n}-01-01&latitude=37.876221&longitude=-122.23558&maxradiuskm=40"
     "&eventtype=earthquake&orderby=time-asc")


def get(url):
    return urllib.request.urlopen(url, timeout=90).read()


raw = get(STUDIO)
assert hashlib.sha256(raw).hexdigest() == STUDIO_SHA, "studio record digest"
studio = Counter((y, m) for y, _f, m in json.loads(raw)["events"] if 1974 <= y <= 2025)

local = Path(sys.argv[1]) if len(sys.argv) > 1 else None
rows, digests = [], {}
for y in range(1974, 2026):
    body = (local / f"{y}.csv").read_bytes() if local else get(Q.format(y=y, n=y + 1))
    digests[str(y)] = hashlib.sha256(body).hexdigest()
    rows += list(csv.DictReader(io.StringIO(body.decode())))
rows.sort(key=lambda r: r["time"])
cc = Counter((int(r["time"][:4]), float(r["mag"]) if r["mag"] else None) for r in rows)
if cc != studio:
    sys.exit(f"re-fetch differs from the Studio's record: {sum((cc - studio).values())} extra, "
             f"{sum((studio - cc).values())} missing")
seq = [[int(r["time"][:4]), round(float(r["mag"]) * 100), r["magType"] or "-"]
       for r in rows if r["mag"]]
out = {"_note": "ANSS ComCat (USGS, public domain), 40 km around BK.BKS, 1974-2025, in time order; "
                "one row per event with a magnitude: [year, magnitude x 100, magnitude type]. The "
                "re-fetch equals the Studio's events.json (pinned commit, sha256 in derive.py) as a "
                "multiset of (year, magnitude). Times, places and ids dropped.",
       "fetched": "2026-09-27", "response_sha256": digests, "events": seq}
(HERE / "seq.json").write_text(json.dumps(out, separators=(",", ":")) + "\n")
print(len(seq), "events with a magnitude; re-fetch equals the Studio's record")
