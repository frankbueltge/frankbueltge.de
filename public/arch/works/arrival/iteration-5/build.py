#!/usr/bin/env python3
"""Build one instance of the work "Arrival", iteration 5, from public USGS data.

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
    product `dyfi`           -> geocoded felt reports: outline, distance,
                                intensity, number of responses in the block

**What iteration 5 changes here, and why** (`record/2026-08-26-session-15.md`,
`ledger/2026-08-26-session-15-two-origins.md`): iterations 2 through 4 put the
two networks on "one shared axis" by dividing each felt block's published
`dist` by 111.195 km per degree and drawing it beside the picks' published
degrees. Those are not the same coordinate. A pick's QuakeML
`arrival/distance` is its distance to the **epicentre**; a felt block's `dist`
is its distance to the **hypocentre**, which for a deep event is a longer and
differently-shaped number. Measured on this session's survey, the published
`dist` agrees with sqrt(epicentral^2 + depth^2) to well under the size of a
published block and disagrees with the epicentral distance by up to 121 km.

So the shared axis was not shared, and the error fell entirely on the near
field — where this work's finding lives. Iteration 5 places each felt block at
its **epicentral** distance, computed from the outline the felt product
publishes for that block and the epicentre that same product publishes for
itself. The published `dist` is kept and travels into the file beside it, so
the two coordinates can be compared rather than conflated.

Three quantities are derived and no others: a pick's travel time (arrival
instant minus origin instant), a felt block's epicentral distance (great-circle
from the published epicentre to the published outline, on a sphere of
R = 6371.0 km), and the degree/kilometre conversion used for display.

Each pick's QuakeML `evaluationMode` is carried as published provenance, not as
an interpretation; see the note in
`ledger/2026-08-24-session-13-strictness.md`.

Only standard library. Written for Python 3.9+.
"""

import datetime as dt
import json
import math
import sys
import urllib.request
import xml.etree.ElementTree as ET

BED = "{http://quakeml.org/xmlns/bed/1.2}"
FDSN = "https://earthquake.usgs.gov/fdsnws/event/1/query"
KM_PER_DEG = 111.195  # great-circle degree at the surface
R_KM = 6371.0         # the sphere the block distances are computed on
UA = {"User-Agent": "arch-practice/arrival (public data, unauthenticated)"}

# The geocoded felt products, in the order they are preferred, with the size of
# one published block. The block size is the resolution of a block's position
# and is carried into the file, because it is the floor under any distance
# computed from an outline.
FELT_FILES = (
    ("dyfi_geo_1km.geojson", 1.0),
    ("dyfi_geo_10km.geojson", 10.0),
)


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


def gc_km(lat1, lon1, lat2, lon2):
    """Great-circle surface distance, kilometres, on a sphere of R_KM."""
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dl = math.radians(lon2 - lon1)
    a = (math.sin(p1) * math.sin(p2)
         + math.cos(p1) * math.cos(p2) * math.cos(dl))
    return R_KM * math.acos(max(-1.0, min(1.0, a)))


def outline_centre(geom):
    """Centre of a published block outline: the mean of its distinct vertices.

    A block is a published cell, not a point; its centre is located no better
    than the cell is wide, and `cellKm` carries that limit into the file.
    """
    if not geom:
        return None
    t, c = geom.get("type"), geom.get("coordinates")
    if t == "Point":
        return c[1], c[0]
    ring = c[0] if t == "Polygon" else (c[0][0] if t == "MultiPolygon" else None)
    if not ring:
        return None
    pts = ring[:-1] if len(ring) > 2 and ring[0] == ring[-1] else ring
    return (sum(p[1] for p in pts) / len(pts),
            sum(p[0] for p in pts) / len(pts))


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

    `deg` is the published epicentral distance in degrees; `res` is the
    published time residual in seconds, signed as published; `mode` is the
    pick's published evaluationMode, kept verbatim.
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
    """Human reports of the same event, placed on the picks' own coordinate.

    Returns the blocks sorted by epicentral distance, the felt product's own
    published location, and the two figures that show why the placement had to
    change: how far the published `dist` sits from the epicentral distance, and
    how closely it matches the hypocentral one.
    """
    product = detail["properties"]["products"]["dyfi"][0]
    contents = product["contents"]
    name, cell_km = next(
        ((n, c) for n, c in FELT_FILES if n in contents), (None, None)
    )
    if name is None:
        return None, None, [], None, None, 0
    url = contents[name]["url"]
    props = product["properties"]
    # The felt product publishes the location it computed its own distances
    # from. That location, not the event's current origin, is the one to
    # measure against.
    lat0, lon0 = float(props["latitude"]), float(props["longitude"])
    depth0 = float(props["depth"])

    blocks = json.loads(get(url))["features"]
    rows, no_outline = [], 0
    for b in blocks:
        p = b["properties"]
        if p.get("dist") is None:
            continue
        centre = outline_centre(b.get("geometry"))
        if centre is None:
            # Without a published outline the block cannot be placed on the
            # picks' coordinate, and it is not placed by its hypocentral
            # distance instead. It is dropped, visibly.
            no_outline += 1
            continue
        epi = gc_km(lat0, lon0, centre[0], centre[1])
        rows.append(
            {
                # epicentral distance, floored at the resolution of a
                # published block: a cell's centre is not located better
                # than the cell is wide.
                "epi": round(max(epi, cell_km / 2), 2),
                # the block's distance exactly as the felt product publishes
                # it, kept so that the two coordinates can be compared
                "km": round(float(p["dist"]), 1),
                "cdi": float(p["cdi"]),
                "n": int(p["nresp"]),
            }
        )
    rows.sort(key=lambda r: r["epi"])

    check = None
    if rows:
        gaps = sorted(abs(r["km"] - r["epi"]) for r in rows)
        hyp = sorted(abs(r["km"] - math.hypot(r["epi"], depth0)) for r in rows)
        check = {
            "maxEpiGap": round(gaps[-1], 1),
            "medEpiGap": round(gaps[len(gaps) // 2], 1),
            "maxHypGap": round(hyp[-1], 1),
            "medHypGap": round(hyp[len(hyp) // 2], 1),
        }
    origin_shift = round(
        gc_km(lat0, lon0,
              detail["geometry"]["coordinates"][1],
              detail["geometry"]["coordinates"][0]), 1
    )
    return (url, product.get("updateTime"), rows,
            {"lat": lat0, "lon": lon0, "depth": depth0, "cellKm": cell_km,
             "shiftKm": origin_shift, "check": check},
            name, no_outline)


def build(eventid=None):
    detail = pick_event(eventid)
    props = detail["properties"]
    lon, lat, depth = detail["geometry"]["coordinates"]
    t0, phase_url, phase_rev, stations, no_res = read_phases(detail)
    felt_url, felt_rev, felt, felt_ref, felt_name, no_outline = read_felt(detail)

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
        "rKm": R_KM,
        "stations": stations,
        "felt": felt,
        "feltRef": felt_ref,
        "noRes": no_res,
        "noOutline": no_outline,
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
              f" epicentral {felt[0]['epi']} .. {felt[-1]['epi']} km"
              f" = {felt[0]['epi']/KM_PER_DEG:.3f} .. {felt[-1]['epi']/KM_PER_DEG:.3f} deg"
              f"  (dropped for want of an outline: {no_outline})")
        print(f"         published dist ({felt_name}, cell {felt_ref['cellKm']} km)"
              f" is a distance to the hypocentre, not the epicentre:")
        c = felt_ref["check"]
        print(f"         vs epicentral   median {c['medEpiGap']} km, max {c['maxEpiGap']} km")
        print(f"         vs hypocentral  median {c['medHypGap']} km, max {c['maxHypGap']} km")
        print(f"         felt product's own epicentre is {felt_ref['shiftKm']} km"
              f" from the event's current origin")
    print(f"records  arrivals last published {payload['revUtc']['phase']}"
          f" | felt reports last published {payload['revUtc']['felt']}")
    print(f"wrote    {out}")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else None)
