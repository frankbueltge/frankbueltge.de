"""Derive wall.json: the Berkeley record, every event type, on the clock on the wall.

Session 18 read the earthquake list on the solar clock. Tonight the question is whether its
daytime excess keeps the hours of the catalogue's own labelled blasts, and blasting is scheduled
by civil time. This script re-fetches ANSS ComCat (USGS, public domain) for the same circle and
years with NO event-type filter, one request per year 1974-2025, and requires that its
earthquakes equal session 18's clock.json as a multiset of (year, magnitude) before anything is
kept. Then it writes one row per event:
    [year (UTC), magnitude x 100 or null, event type, civil local minute of day,
     civil local weekday 0=Mon, depth x 10 km]
Civil local time = America/Los_Angeles, daylight saving included. Places and ids are dropped;
the responses are not committed (protocol v7 §7), their digests are.

    python3 derive.py <dir-with-YYYY.csv>   # use responses already fetched
    python3 derive.py                       # fetch them (52 requests)
"""
import csv, hashlib, io, json, sys, urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

HERE = Path(__file__).parent
S18 = HERE.parent / "cycle-003-session-18" / "clock.json"
Q = ("https://earthquake.usgs.gov/fdsnws/event/1/query?format=csv&starttime={y}-01-01"
     "&endtime={n}-01-01&latitude=37.876221&longitude=-122.23558&maxradiuskm=40"
     "&orderby=time-asc")
LA = ZoneInfo("America/Los_Angeles")

s18 = Counter((e[0], e[1]) for e in json.loads(S18.read_text())["events"])
local = Path(sys.argv[1]) if len(sys.argv) > 1 else None
rows, digests = [], {}
for y in range(1974, 2026):
    if local:
        body = (local / f"{y}.csv").read_bytes()
    else:
        body = urllib.request.urlopen(Q.format(y=y, n=y + 1), timeout=180).read()
    digests[str(y)] = hashlib.sha256(body).hexdigest()
    rows += list(csv.DictReader(io.StringIO(body.decode())))
rows.sort(key=lambda r: r["time"])
eq = Counter((int(r["time"][:4]), round(float(r["mag"]) * 100)) for r in rows
             if r["type"] == "earthquake" and r["mag"])
if eq != s18:
    sys.exit(f"earthquakes differ from session 18: {sum((eq - s18).values())} extra, "
             f"{sum((s18 - eq).values())} missing")
seq = []
for r in rows:
    t = datetime.strptime(r["time"][:19], "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
    c = t.astimezone(LA)
    seq.append([int(r["time"][:4]), round(float(r["mag"]) * 100) if r["mag"] else None, r["type"],
                c.hour * 60 + c.minute, c.weekday(), round(float(r["depth"] or 0) * 10)])
out = {"_note": "ANSS ComCat (USGS, public domain), 40 km around BK.BKS, 1974-2025, all event types, "
                "in time order; one row per event: [year (UTC), magnitude x 100 or null, event type, "
                "civil local minute of day (America/Los_Angeles, DST included), civil local weekday "
                "0=Mon, depth x 10 km]. Its earthquakes equal session 18's clock.json as a multiset "
                "of (year, magnitude). Places and ids dropped.",
       "fetched": "2026-09-29", "response_sha256": digests, "events": seq}
(HERE / "wall.json").write_text(json.dumps(out, separators=(",", ":")) + "\n")
print(len(seq), "events;", dict(Counter(e[2] for e in seq)))
