"""Derive clock.json: the Berkeley record in time order, with the hour it was written.

Sessions 16 and 17 dropped event times. Tonight they are the instrument. This script re-fetches
the Studio's query from ANSS ComCat (USGS, public domain), one request per year 1974-2025, and
requires that the re-fetch holds exactly the Studio's multiset of (year, magnitude) — the
Studio's BELOW THE TRACE events.json at a pinned commit, digest-checked — before anything is
kept. Then it writes one row per event with a magnitude:
    [year, magnitude in hundredths, magnitude type, local solar minute of day, solar weekday,
     depth in tenths of a km]
Local solar time = UTC + longitude/15 h (the event's own longitude). Weekday 0 = Monday, taken
in the same solar time. Places and ids are dropped; the responses are not committed (protocol
v7 §7), their digests are.

    python3 derive.py <dir-with-YYYY.csv>   # use responses already fetched
    python3 derive.py                       # fetch them (52 requests)
"""
import csv, hashlib, io, json, sys, urllib.request
from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path

HERE = Path(__file__).parent
STUDIO = ("https://raw.githubusercontent.com/frankbueltge/studio/"
          "0291f8e77c93fa4caf9e27a7321355854efef7bf/works/2026-09-25-below-the-trace/events.json")
STUDIO_SHA = "5f7425326c15af3fb1279ded50249d2b7ca603a1f594d387625cc8f919af719c"
Q = ("https://earthquake.usgs.gov/fdsnws/event/1/query?format=csv&starttime={y}-01-01"
     "&endtime={n}-01-01&latitude=37.876221&longitude=-122.23558&maxradiuskm=40"
     "&eventtype=earthquake&orderby=time-asc")


def get(url):
    return urllib.request.urlopen(url, timeout=120).read()


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
seq = []
for r in rows:
    if not r["mag"]:
        continue
    t = datetime.strptime(r["time"][:19], "%Y-%m-%dT%H:%M:%S")
    s = t + timedelta(hours=float(r["longitude"]) / 15)
    seq.append([int(r["time"][:4]), round(float(r["mag"]) * 100), r["magType"] or "-",
                s.hour * 60 + s.minute, s.weekday(), round(float(r["depth"] or 0) * 10)])
out = {"_note": "ANSS ComCat (USGS, public domain), 40 km around BK.BKS, 1974-2025, in time order; "
                "one row per event with a magnitude: [year (UTC), magnitude x 100, magnitude type, "
                "local solar minute of day, local solar weekday 0=Mon, depth x 10 km]. The re-fetch equals the "
                "Studio's events.json (pinned commit, sha256 in derive.py) as a multiset of (year, "
                "magnitude). Places and ids dropped.",
       "fetched": "2026-09-28", "response_sha256": digests, "events": seq}
(HERE / "clock.json").write_text(json.dumps(out, separators=(",", ":")) + "\n")
print(len(seq), "events with a magnitude; re-fetch equals the Studio's record")
