#!/usr/bin/env python3
"""Build one instance of the work "Arrival", iteration 2, from public USGS data.

The work is a single self-contained HTML file: no network access at
encounter time, no external assets, no libraries. This script is the
pipeline that makes one; running it again on another event makes another.

Usage:
    python3 build.py                 # most recent qualifying event
    python3 build.py us6000tmta      # a named event

Sources, both public and unauthenticated:
    fdsnws event detail      -> origin time, hypocentre, magnitude
    product `phase-data`     -> QuakeML picks: station, arrival instant, distance
    product `dyfi`           -> geocoded felt reports: distance, intensity, count

Iteration 2 draws both networks against one shared logarithmic distance axis
and hands the felt-report threshold to whoever opens the file; the payload
below is unchanged from iteration 1 except for the product revision ids, which
each instance now carries so it can say which revision it was built from.

Only standard library. Written for Python 3.9+.
"""

import datetime as dt
import json
import sys
import urllib.request
import xml.etree.ElementTree as ET

BED = "{http://quakeml.org/xmlns/bed/1.2}"
FDSN = "https://earthquake.usgs.gov/fdsnws/event/1/query"
KM_PER_DEG = 111.195  # great-circle degree at the surface
UA = {"User-Agent": "arch-practice/arrival (public data, unauthenticated)"}


def get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=90) as r:
        raw = r.read()
    return raw if binary else raw.decode("utf-8")


def iso(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00"))


def pick_event(eventid=None):
    """Return the detail GeoJSON of an event carrying both products."""
    if eventid:
        return json.loads(get(f"{FDSN}?format=geojson&eventid={eventid}"))
    listing = json.loads(
        get(f"{FDSN}?format=geojson&limit=40&minmagnitude=5&orderby=time")
    )
    for feat in listing["features"]:
        detail = json.loads(get(f"{FDSN}?format=geojson&eventid={feat['id']}"))
        products = detail["properties"]["products"]
        if "phase-data" in products and "dyfi" in products:
            return detail
    raise SystemExit("no recent event carries both phase-data and dyfi")


def read_phases(detail):
    """Measured first arrivals: one row per station that recorded the event."""
    product = detail["properties"]["products"]["phase-data"][0]
    url = product["contents"]["quakeml.xml"]["url"]
    root = ET.fromstring(get(url, binary=True))

    origin = root.find(".//" + BED + "origin")
    t0 = iso(origin.find(BED + "time/" + BED + "value").text)

    picks = {p.get("publicID"): p for p in root.findall(".//" + BED + "pick")}
    rows = []
    for arrival in root.findall(".//" + BED + "arrival"):
        pid = arrival.findtext(BED + "pickID")
        deg = arrival.findtext(BED + "distance")
        pick = picks.get(pid)
        if pick is None or not deg:
            continue
        instant = pick.find(BED + "time/" + BED + "value").text
        wf = pick.find(BED + "waveformID")
        rows.append(
            {
                "sta": f"{wf.get('networkCode')}.{wf.get('stationCode')}",
                "deg": round(float(deg), 4),
                "t": round((iso(instant) - t0).total_seconds(), 2),
                "ph": arrival.findtext(BED + "phase") or "",
            }
        )
    rows.sort(key=lambda r: r["deg"])
    return t0, url, product.get("updateTime"), rows


def read_felt(detail):
    """Human reports of the same event, on the same distance axis."""
    product = detail["properties"]["products"]["dyfi"][0]
    contents = product["contents"]
    name = next(
        (n for n in ("dyfi_geo_1km.geojson", "dyfi_geo_10km.geojson", "dyfi_geo.geojson")
         if n in contents),
        None,
    )
    if name is None:
        return None, None, []
    url = contents[name]["url"]
    blocks = json.loads(get(url))["features"]
    rows = [
        {
            "km": round(float(b["properties"]["dist"]), 1),
            "cdi": float(b["properties"]["cdi"]),
            "n": int(b["properties"]["nresp"]),
        }
        for b in blocks
        if b["properties"].get("dist") is not None
    ]
    rows.sort(key=lambda r: r["km"])
    return url, product.get("updateTime"), rows


def build(eventid=None):
    detail = pick_event(eventid)
    props = detail["properties"]
    lon, lat, depth = detail["geometry"]["coordinates"]
    t0, phase_url, phase_rev, stations = read_phases(detail)
    felt_url, felt_rev, felt = read_felt(detail)

    payload = {
        "id": detail["id"],
        "place": props["place"],
        "mag": props["mag"],
        "origin": t0.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "lat": lat,
        "lon": lon,
        "depth": depth,
        "kmPerDeg": KM_PER_DEG,
        "stations": stations,
        "felt": felt,
        "sources": {
            "detail": f"{FDSN}?format=geojson&eventid={detail['id']}",
            "phase": phase_url,
            "felt": felt_url,
        },
        "rev": {"phase": phase_rev, "felt": felt_rev},
        "built": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d"),
    }

    here = __file__.rsplit("/", 1)[0]
    with open(f"{here}/template.html", encoding="utf-8") as f:
        html = f.read()
    html = html.replace(
        "/*DATA*/null/*DATA*/", json.dumps(payload, separators=(",", ":"))
    )
    out = f"{here}/{detail['id']}.html"
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"event    {detail['id']}  M{props['mag']}  {props['place']}")
    print(f"origin   {payload['origin']}  depth {depth} km")
    print(f"stations {len(stations)}  {stations[0]['deg']}deg .. {stations[-1]['deg']}deg")
    if felt:
        print(f"felt     {len(felt)} blocks, {sum(r['n'] for r in felt)} responses,"
              f" out to {felt[-1]['km']} km = {felt[-1]['km']/KM_PER_DEG:.2f}deg")
    print(f"wrote    {out}")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else None)
