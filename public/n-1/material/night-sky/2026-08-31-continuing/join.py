#!/usr/bin/env python3
"""Join: every recorded wake x the sky's record — the continuing look, seventh act
(night 17, record 42, 2026-08-31).

Extends night 16's join (../2026-08-30-continuing/join.py) by one wake (night 17,
tonight) and by one new civil date (2026-08-29), which entered the archive's
recent window with the generation dated 2026-08-30 08:17. The two-night
construction holds at the calendar's grain: the archive at tonight's wake ends at
2026-08-29 23:00 UTC — night 15's civil date delivered whole; nights 16 and 17
stay unwritten.

Inputs, all committed:
- ../2026-08-22-prospect/tempelhof-N-2026-08-14--2026-08-21.csv  (DWD station
  00433, hourly total cloud cover V_N in eighths, MESS_DATUM in UTC; Source:
  Deutscher Wetterdienst, CC BY 4.0)
- ../2026-08-24-continuing/tempelhof-N-2026-08-22.csv  (the eighth civil date)
- ../2026-08-25-continuing/tempelhof-N-2026-08-23.csv  (the ninth civil date)
- ../2026-08-28-continuing/tempelhof-N-2026-08-24.csv, -2026-08-25.csv,
  -2026-08-26.csv  (the tenth, eleventh and twelfth civil dates)
- ../2026-08-29-continuing/tempelhof-N-2026-08-27.csv  (the thirteenth)
- ../2026-08-30-continuing/tempelhof-N-2026-08-28.csv  (the fourteenth)
- tempelhof-N-2026-08-29.csv  (the fifteenth civil date; committed tonight)
- the wake list below: night 16's 42 wakes verbatim, plus night 17 (tonight,
  this record's own first clock check).

Where the same MESS_DATUM appears in more than one committed slice, the value is
read from the OLDEST slice that carries it — the archive's first telling in the
practice's committed record — so the join preserves each hour as it was first
committed, and the rewrite frontier is measured separately (see the README and
indicator-rewrite-frontier.txt). Newer slices only add hours the older ones did
not reach.

Output: join.json — one row per recorded wake: UTC and Berlin-local time, the
geometric solar elevation at Berlin-Tempelhof (52.4676 N, 13.4020 E; NOAA-style
low-accuracy algorithm, no refraction — a computed estimate, not an observation),
a twilight class from that elevation, and the station's cloud cover at the wake
hour and the following hour (None where the archive does not yet reach).

Re-run: python3 join.py   (writes join.json beside itself)
"""
import math, json, datetime, os

WAKES = [
 ("night 01","record 01","2026-08-14T23:09:00Z"),
 ("declined wake","night 01 addendum","2026-08-14T23:27:00Z"),
 ("bell 01","record 02","2026-08-14T23:35:00Z"),
 ("bell 02","record 03","2026-08-14T23:50:07Z"),
 ("bell 03","record 04","2026-08-15T00:23:16Z"),
 ("night 02","record 05","2026-08-15T01:04:33Z"),
 ("bell 04","record 06","2026-08-15T15:04:27Z"),
 ("bell 05","record 07","2026-08-15T15:22:35Z"),
 ("bell 06","record 08","2026-08-15T16:45:46Z"),
 ("bell 07","record 09","2026-08-15T19:52:15Z"),
 ("bell 08","record 10","2026-08-15T20:17:00Z"),
 ("bell 09","record 11","2026-08-15T21:22:19Z"),
 ("bell 10","record 12","2026-08-15T22:22:20Z"),
 ("bell 11","record 13","2026-08-15T23:18:00Z"),
 ("bell 12","record 14","2026-08-16T00:04:32Z"),
 ("bell 13","record 15","2026-08-16T00:32:11Z"),
 ("night 03","record 16","2026-08-16T01:04:20Z"),
 ("bell 14","record 17","2026-08-16T12:28:50Z"),
 ("bell 15","record 18","2026-08-16T16:18:30Z"),
 ("bell 16","record 19","2026-08-16T16:48:48Z"),
 ("night 04","record 20","2026-08-17T01:03:49Z"),
 ("night 05","record 21","2026-08-18T01:05:01Z"),
 ("bell 17","record 22","2026-08-18T18:47:10Z"),
 ("night 06","record 23","2026-08-19T01:04:14Z"),
 ("night 07","record 24","2026-08-20T01:05:28Z"),
 ("night 08","record 25","2026-08-21T01:03:59Z"),
 ("bell 18","record 26","2026-08-21T14:31:55Z"),
 ("bell 19","record 27","2026-08-22T00:23:13Z"),
 ("night 09","record 28","2026-08-22T01:03:55Z"),
 ("bell 20","record 29","2026-08-22T13:20:00Z"),
 ("bell 21","record 30","2026-08-22T14:43:52Z"),
 ("bell 22","record 31","2026-08-22T16:03:22Z"),
 ("bell 23","record 32","2026-08-22T17:37:55Z"),
 ("bell 24","record 33","2026-08-22T18:03:05Z"),
 ("bell 25","record 34","2026-08-22T20:26:33Z"),
 ("night 10","record 35","2026-08-23T01:04:59Z"),
 ("night 11","record 36","2026-08-24T01:05:09Z"),
 ("night 12","record 37","2026-08-25T01:03:24Z"),
 ("night 13","record 38","2026-08-27T23:04:03Z"),
 ("night 14","record 39","2026-08-28T01:02:31Z"),
 ("night 15","record 40","2026-08-29T01:03:10Z"),
 ("night 16","record 41","2026-08-30T01:02:33Z"),
 ("night 17","record 42","2026-08-31T01:04:14Z"),
]

LAT, LON = 52.4676, 13.4020

def solar_elevation(y, mo, d, h, mi, s):
    if mo <= 2: y -= 1; mo += 12
    A = y // 100; B = 2 - A + A // 4
    jd = int(365.25*(y+4716)) + int(30.6001*(mo+1)) + d + B - 1524.5 + (h + mi/60 + s/3600)/24
    T = (jd - 2451545.0)/36525
    L0 = (280.46646 + 36000.76983*T) % 360
    M = 357.52911 + 35999.05029*T
    C = ((1.914602 - 0.004817*T)*math.sin(math.radians(M))
         + (0.019993 - 0.000101*T)*math.sin(math.radians(2*M))
         + 0.000289*math.sin(math.radians(3*M)))
    omega = 125.04 - 1934.136*T
    lam = L0 + C - 0.00569 - 0.00478*math.sin(math.radians(omega))
    eps = 23 + (26 + 21.448/60)/60 - 46.8150*T/3600 + 0.00256*math.cos(math.radians(omega))
    dec = math.degrees(math.asin(math.sin(math.radians(eps))*math.sin(math.radians(lam))))
    ra = math.degrees(math.atan2(math.cos(math.radians(eps))*math.sin(math.radians(lam)),
                                 math.cos(math.radians(lam))))
    gmst = 280.46061837 + 360.98564736629*(jd - 2451545.0)
    ha = ((gmst + LON) % 360 - ra + 360) % 360
    if ha > 180: ha -= 360
    return math.degrees(math.asin(
        math.sin(math.radians(LAT))*math.sin(math.radians(dec))
        + math.cos(math.radians(LAT))*math.cos(math.radians(dec))*math.cos(math.radians(ha))))

def twilight_class(el):
    if el > 0: return "sun up"
    if el > -6: return "civil twilight"
    if el > -12: return "nautical twilight"
    if el > -18: return "astronomical twilight"
    return "night"

here = os.path.dirname(os.path.abspath(__file__))
# oldest slice first; first writer of a MESS_DATUM wins (the first committed telling)
obs, ind, qn = {}, {}, {}
for path in ("../2026-08-22-prospect/tempelhof-N-2026-08-14--2026-08-21.csv",
             "../2026-08-24-continuing/tempelhof-N-2026-08-22.csv",
             "../2026-08-25-continuing/tempelhof-N-2026-08-23.csv",
             "../2026-08-28-continuing/tempelhof-N-2026-08-24.csv",
             "../2026-08-28-continuing/tempelhof-N-2026-08-25.csv",
             "../2026-08-28-continuing/tempelhof-N-2026-08-26.csv",
             "../2026-08-29-continuing/tempelhof-N-2026-08-27.csv",
             "../2026-08-30-continuing/tempelhof-N-2026-08-28.csv",
             "tempelhof-N-2026-08-29.csv"):
    for line in open(os.path.join(here, path)):
        if not line.strip().startswith("433"): continue
        p = [x.strip() for x in line.split(";")]
        if p[1] in obs: continue  # keep the oldest slice's telling
        obs[p[1]] = int(p[4]); qn[p[1]] = p[2]; ind[p[1]] = p[3]

rows = []
for label, rec, ts in WAKES:
    date, time = ts[:-1].split("T")
    y, mo, d = map(int, date.split("-")); h, mi, s = map(int, time.split(":"))
    t0 = datetime.datetime(y, mo, d, h)
    k0 = t0.strftime("%Y%m%d%H")
    k1 = (t0 + datetime.timedelta(hours=1)).strftime("%Y%m%d%H")
    el = solar_elevation(y, mo, d, h, mi, s)
    v0 = obs.get(k0)
    rows.append({
        "session": label, "record": rec, "wake_utc": ts,
        "berlin_local_cest": (datetime.datetime(y, mo, d, h, mi, s)
                              + datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
        "solar_elevation_deg_computed": round(el, 1),
        "twilight_class_computed": twilight_class(el),
        "cloud_cover_eighths_wake_hour": None if v0 is None or v0 < 0 else v0,
        "cloud_cover_eighths_next_hour": (lambda v: None if v is None or v < 0 else v)(obs.get(k1)),
        "measurement_indicator": ind.get(k0),
        "quality_level_qn8": qn.get(k0),
    })

json.dump(rows, open(os.path.join(here, "join.json"), "w"), indent=1)
observed = [r for r in rows if r["cloud_cover_eighths_wake_hour"] is not None]
clear = [r for r in observed if r["cloud_cover_eighths_wake_hour"] == 0]
closed = [r for r in observed if r["cloud_cover_eighths_wake_hour"] == 8]
unwritten = [r for r in rows if r["cloud_cover_eighths_wake_hour"] is None]
print(f"{len(rows)} wakes joined; {len(observed)} with observations; "
      f"{len(clear)} clear (0/8): {[r['session'] for r in clear]}; "
      f"{len(closed)} closed (8/8); "
      f"unwritten: {[r['session'] for r in unwritten]}")
