#!/usr/bin/env python3
"""Harvest one calendar year of hourly NO2 from the German federal air-quality
network and record, per station and per hour, whether a measurement exists.

Source: Umweltbundesamt air-data API v3, https://luftdaten.umweltbundesamt.de/api/air-data/v3
robots.txt of that host was read before anything was requested (2026-09-18): /api/ is
not disallowed and the host states no crawl-delay.  The www host it redirects from
states crawl-delay 10; this harvester waits longer than that between requests anyway.

No source file is committed to the repository.  The cache lives outside it.
Usage:
    harvest.py --fetch     download the year in 14-day chunks into the cache
    harvest.py --offline   rebuild counts.json from the cache, no network
"""
import argparse, gzip, json, os, sys, time, urllib.request, urllib.error
from datetime import date, datetime, timedelta

BASE = "https://luftdaten.umweltbundesamt.de/api/air-data/v3"
UA = "Ensemble/1.0 (studio research instrument; https://frankbueltge.de/studio)"
YEAR = 2024
COMPONENT = 5      # NO2
SCOPE = 2          # 1SMW, one hour average
CHUNK_DAYS = 14
PAUSE = 12.0       # seconds between requests; the www host asks for 10
CACHE = os.environ.get("STUDIO_CACHE") or os.path.expanduser("~/.cache/ensemble/permitted-silence")

H0 = datetime(YEAR, 1, 1, 0, 0)
HOURS = ((date(YEAR + 1, 1, 1) - date(YEAR, 1, 1)).days) * 24   # 8784 in 2024


def slot(ts):
    """'YYYY-MM-DD HH:MM:SS' -> hour index in the year, or None if outside."""
    dt = datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
    i = int((dt - H0).total_seconds()) // 3600
    return i if 0 <= i < HOURS else None


def get(url, tries=4):
    last = None
    for n in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.loads(r.read().decode("utf-8")), r.status
        except Exception as e:                     # noqa: BLE001 - recorded, not swallowed
            last = e
            sys.stderr.write("  retry %d after %s\n" % (n + 1, e))
            time.sleep(6 * (n + 1))
    raise SystemExit("gave up on %s: %s" % (url, last))


def fetch():
    os.makedirs(CACHE, exist_ok=True)
    log = []

    url = ("%s/stations/json?lang=en&use=measure&date_from=%d-01-01&time_from=1"
           "&date_to=%d-12-31&time_to=24" % (BASE, YEAR, YEAR))
    stations, code = get(url)
    log.append({"url": url, "status": code, "count": stations.get("count")})
    with gzip.open(os.path.join(CACHE, "stations.json.gz"), "wt") as f:
        json.dump(stations, f)
    sys.stderr.write("stations: %s\n" % stations.get("count"))

    # value per station per hour; None where the API returned nothing
    vals = {}
    start = date(YEAR, 1, 1)
    end = date(YEAR, 12, 31)
    d = start
    while d <= end:
        d2 = min(d + timedelta(days=CHUNK_DAYS - 1), end)
        time.sleep(PAUSE)
        url = ("%s/measures/json?lang=en&date_from=%s&time_from=1&date_to=%s&time_to=24"
               "&component=%d&scope=%d" % (BASE, d.isoformat(), d2.isoformat(), COMPONENT, SCOPE))
        payload, code = get(url)
        data = payload.get("data", {})
        n = 0
        for st, rows in data.items():
            arr = vals.get(st)
            if arr is None:
                arr = vals[st] = [None] * HOURS
            for ts, row in rows.items():
                i = slot(ts)
                if i is None:
                    continue
                v = row[2]
                arr[i] = v
                n += 1
        log.append({"url": url, "status": code, "stations": len(data), "hours": n})
        sys.stderr.write("%s..%s  stations=%d hours=%d\n" % (d, d2, len(data), n))
        d = d2 + timedelta(days=1)

    with gzip.open(os.path.join(CACHE, "values.json.gz"), "wt") as f:
        json.dump(vals, f)
    with open(os.path.join(CACHE, "requests.json"), "w") as f:
        json.dump(log, f, indent=1)
    sys.stderr.write("cached %d stations x %d hours\n" % (len(vals), HOURS))


def load():
    with gzip.open(os.path.join(CACHE, "stations.json.gz"), "rt") as f:
        stations = json.load(f)
    with gzip.open(os.path.join(CACHE, "values.json.gz"), "rt") as f:
        vals = json.load(f)
    with open(os.path.join(CACHE, "requests.json")) as f:
        log = json.load(f)
    return stations, vals, log


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--fetch", action="store_true")
    ap.add_argument("--offline", action="store_true")
    a = ap.parse_args()
    if a.fetch:
        fetch()
    elif a.offline:
        s, v, l = load()
        print("stations %d, series %d, requests %d" % (s["count"], len(v), len(l)))
    else:
        ap.print_help()
