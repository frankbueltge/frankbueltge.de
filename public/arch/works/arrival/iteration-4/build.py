#!/usr/bin/env python3
"""Build one instance of the work "Arrival", iteration 4, from public USGS data.

The work is a single self-contained HTML file: no network access at
encounter time, no external assets, no libraries. This script is the
pipeline that makes one; running it again on another event makes another.

Usage:
    python3 build.py                 # most recent qualifying event
    python3 build.py us6000tmta      # a named event

Sources, both public and unauthenticated:
    fdsnws event detail      -> origin time, hypocentre, magnitude
    product `phase-data`     -> QuakeML picks: station, arrival instant,
                                distance, time residual, evaluation mode
    product `dyfi`           -> geocoded felt reports: distance, intensity,
                                number of responses in the block

Iteration 3 added the two corroboration measures to the payload — for an
instrument pick the `timeResidual` (its disagreement, in seconds, with the
origin the network itself fitted), for a felt block the number of independent
responses in it — so that the same act, demand more corroboration, could be
performed on both networks.

**What iteration 4 changes here is small, and the record says so plainly**
(`record/2026-08-25-session-14.md`): the two measures were already in this
payload and were invisible in the work, which showed only their effect. The
change is in `template.html`, where each threshold is now set on a drawing of
that network's own population of the measure. The one addition to the payload
is `revUtc`: the two products' publication times, already carried as opaque
revision ids, also written out as UTC instants — because when each of the two
records last moved is provenance a reader can check, and an id is not.

Each pick's QuakeML `evaluationMode` is carried as published provenance, not as
an interpretation; see the note in
`ledger/2026-08-24-session-13-strictness.md`.

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


def rev_utc(rev):
    """A product's publication time, as published: epoch milliseconds -> UTC."""
    if rev is None:
        return None
    return (
        dt.datetime.fromtimestamp(int(rev) / 1000, dt.timezone.utc)
        .strftime("%Y-%m-%d %H:%M UTC")
    )


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
    """Measured first arrivals: one row per station that recorded the event.

    `res` is the published time residual in seconds, signed as published;
    `mode` is the pick's published evaluationMode, kept verbatim.
    """
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
        res = arrival.findtext(BED + "timeResidual")
        rows.append(
            {
                "sta": f"{wf.get('networkCode')}.{wf.get('stationCode')}",
                "deg": round(float(deg), 4),
                "t": round((iso(instant) - t0).total_seconds(), 2),
                "ph": arrival.findtext(BED + "phase") or "",
                "res": round(float(res), 2) if res is not None else None,
                "mode": pick.findtext(BED + "evaluationMode") or "",
            }
        )
    # A pick with no published residual cannot be filtered by one and is not
    # silently given a favourable value: it is dropped, and the count of what
    # was dropped travels into the file so the omission stays visible.
    dropped = [r for r in rows if r["res"] is None]
    rows = [r for r in rows if r["res"] is not None]
    rows.sort(key=lambda r: r["deg"])
    return t0, url, product.get("updateTime"), rows, len(dropped)


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
    t0, phase_url, phase_rev, stations, no_res = read_phases(detail)
    felt_url, felt_rev, felt = read_felt(detail)

    modes = {}
    for s in stations:
        modes[s["mode"] or "(absent)"] = modes.get(s["mode"] or "(absent)", 0) + 1

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
        "noRes": no_res,
        "modes": modes,
        "sources": {
            "detail": f"{FDSN}?format=geojson&eventid={detail['id']}",
            "phase": phase_url,
            "felt": felt_url,
        },
        "rev": {"phase": phase_rev, "felt": felt_rev},
        # The same two revisions as instants, so that a reader can see when each
        # of the two records last moved without decoding an id.
        "revUtc": {"phase": rev_utc(phase_rev), "felt": rev_utc(felt_rev)},
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
    print(f"stations {len(stations)}  {stations[0]['deg']}deg .. {stations[-1]['deg']}deg"
          f"  (dropped for want of a residual: {no_res})")
    print(f"modes    {modes}")
    if felt:
        print(f"felt     {len(felt)} blocks, {sum(r['n'] for r in felt)} responses,"
              f" out to {felt[-1]['km']} km = {felt[-1]['km']/KM_PER_DEG:.2f}deg")
    print(f"records  arrivals last published {payload['revUtc']['phase']}"
          f" | felt reports last published {payload['revUtc']['felt']}")
    print(f"wrote    {out}")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else None)
