#!/usr/bin/env python3
"""The same year, the same stations, the same component - asked through the other door.

The daily-average scope (1TMW, scope 1) serves nothing for NO2: checked on 2026-09-18 for
January 2024, it returns zero stations, while the same call for PM10 returns 388.  The door
that does open for NO2 is scope 3, 1SMW_MAX - the daily maximum of the hourly values.  That
is the second door used here: a number the archive publishes about a day, next to the hours
it publishes for that day.  Cache only; nothing is committed."""
import gzip, json, os, sys, time
from datetime import date, timedelta
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import harvest as H

CHUNK = 60
def main():
    os.makedirs(H.CACHE, exist_ok=True)
    vals, log = {}, []
    d, end = date(H.YEAR, 1, 1), date(H.YEAR, 12, 31)
    while d <= end:
        d2 = min(d + timedelta(days=CHUNK - 1), end)
        time.sleep(H.PAUSE)
        url = ("%s/measures/json?lang=en&date_from=%s&time_from=1&date_to=%s&time_to=24"
               "&component=%d&scope=3" % (H.BASE, d.isoformat(), d2.isoformat(), H.COMPONENT))
        payload, code = H.get(url)
        data = payload.get("data", {})
        n = 0
        for st, rows in data.items():
            arr = vals.setdefault(st, {})
            for ts, row in rows.items():
                arr[ts[:10]] = row[2]
                n += 1
        log.append({"url": url, "status": code, "stations": len(data), "days": n})
        sys.stderr.write("%s..%s stations=%d days=%d\n" % (d, d2, len(data), n))
        d = d2 + timedelta(days=1)
    with gzip.open(os.path.join(H.CACHE, "daymax.json.gz"), "wt") as f:
        json.dump(vals, f)
    with open(os.path.join(H.CACHE, "requests_daymax.json"), "w") as f:
        json.dump(log, f, indent=1)
    sys.stderr.write("cached daily maxima for %d stations\n" % len(vals))

if __name__ == "__main__":
    main()
