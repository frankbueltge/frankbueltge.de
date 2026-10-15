#!/usr/bin/env python3
"""BELOW HEARING — the harvest. The one part of this work that touches the network.

Asks the USGS Earthquake Catalog (ComCat) one question, over and over:

    in this box, in this window, how many earthquakes of at least this magnitude
    are in the record?

Nothing else is requested and no event is downloaded. The whole material of this work is a
table of counts — which is also the quantity the Gutenberg-Richter law is written in.

    python3 harvest.py            write counts.json
    python3 harvest.py --dry      print the plan and stop

The catalogue is a work of the United States Geological Survey and is in the public domain
(https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits). No file
of it is committed to this repository: counts.json holds this practice's own measurements,
each with the exact URL that produced it.
"""
import json, os, sys, time, urllib.request, urllib.parse, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = "https://earthquake.usgs.gov/fdsnws/event/1/count"
START, END = "2021-01-01", "2026-01-01"          # five whole years, closed before this session
MAGS = [round(-1.0 + 0.1 * i, 1) for i in range(0, 91)]   # -1.0 .. 8.0 inclusive

# name, min lon, max lon, min lat, max lat.  Boxes, not countries: a box is checkable.
REGIONS = [
    ("California",              -125.0, -114.0,  32.0,  42.0),
    ("Alaska",                  -170.0, -140.0,  52.0,  72.0),
    ("Japan",                    128.0,  148.0,  30.0,  46.0),
    ("Iceland",                  -25.0,  -13.0,  63.0,  67.0),
    ("Central Italy",             10.0,   16.0,  41.0,  45.0),
    ("Chile",                    -76.0,  -66.0, -45.0, -17.0),
    ("Aotearoa New Zealand",     165.0,  180.0, -48.0, -34.0),
    ("Indonesia",                 95.0,  141.0, -11.0,   6.0),
    ("Himalaya",                  80.0,   95.0,  26.0,  36.0),
    ("South Mid-Atlantic Ridge", -20.0,    0.0, -40.0, -10.0),
    ("Central Africa",            10.0,   35.0, -10.0,  10.0),
    ("South of 60S",            -180.0,  180.0, -90.0, -60.0),
]


def url_for(box, mag):
    q = {
        "format": "geojson", "starttime": START, "endtime": END,
        "minmagnitude": mag,
        "minlongitude": box[1], "maxlongitude": box[2],
        "minlatitude": box[3], "maxlatitude": box[4],
    }
    return BASE + "?" + urllib.parse.urlencode(q)


def ask(u, tries=4):
    last = None
    for k in range(tries):
        try:
            req = urllib.request.Request(u, headers={"User-Agent": "Ensemble/studio (art practice, one count per request)"})
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)["count"]
        except Exception as e:                      # noqa: BLE001 - recorded, not swallowed
            last = e
            time.sleep(2 * (k + 1))
    raise SystemExit("gave up on %s: %s" % (u, last))


def main():
    plan = [(r, m) for r in REGIONS for m in MAGS]
    if "--dry" in sys.argv:
        print("%d regions x %d thresholds = %d requests" % (len(REGIONS), len(MAGS), len(plan)))
        print(url_for(REGIONS[0], 3.0))
        return
    out = {
        "source": {
            "catalogue": "USGS Earthquake Catalog (ComCat), FDSN event web service",
            "service": BASE, "api_version": None,          # filled from the service below
            "rights": "Work of the United States Geological Survey; public domain.",
            "window": {"starttime": START, "endtime": END},
            "note": "Counts only. No event record was downloaded and none is committed here.",
        },
        "harvested_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "thresholds": MAGS,
        "regions": [],
    }
    with urllib.request.urlopen("https://earthquake.usgs.gov/fdsnws/event/1/version", timeout=60) as r:
        out["source"]["api_version"] = r.read().decode().strip()
    for reg in REGIONS:
        name = reg[0]
        counts, urls, zeros = [], [], 0
        for m in MAGS:
            if zeros >= 3:                 # the tail is empty; do not keep asking
                counts.append(0); urls.append(None); continue
            u = url_for(reg, m)
            n = ask(u)
            counts.append(n); urls.append(u)
            zeros = zeros + 1 if n == 0 else 0
            time.sleep(0.15)
        out["regions"].append({
            "name": name,
            "box": {"min_lon": reg[1], "max_lon": reg[2], "min_lat": reg[3], "max_lat": reg[4]},
            "cumulative": counts,
            "asked": sum(1 for u in urls if u),
            "url_first": url_for(reg, MAGS[0]),
        })
        print("%-26s total %8d   M>=3 %7d   M>=4.5 %6d" % (
            name, counts[0], counts[MAGS.index(3.0)], counts[MAGS.index(4.5)]), flush=True)
    out["requests_made"] = sum(r["asked"] for r in out["regions"]) + 1
    p = os.path.join(HERE, "counts.json")
    with open(p, "w") as f:
        json.dump(out, f, indent=1, sort_keys=False)
        f.write("\n")
    print("wrote", p, "sha256", hashlib.sha256(open(p, "rb").read()).hexdigest()[:16])


if __name__ == "__main__":
    main()
