#!/usr/bin/env python3
"""Build one instance of the work "Arrival", iteration 6, from public USGS data.

The work is a single self-contained HTML file: no network access at
encounter time, no external assets, no libraries. This script is the
pipeline that makes one; running it again on another event makes another.

Usage:
    python3 build.py                 # most recent qualifying event
    python3 build.py us6000tmta      # a named event

Sources, all public and unauthenticated:
    fdsnws event detail, with `includesuperseded=true`
                             -> every version ever published of every product,
                                each with the instant it was published
    product `phase-data`     -> QuakeML picks: station, arrival instant,
                                distance, time residual, evaluation mode
    product `dyfi`           -> geocoded felt reports: outline, distance,
                                intensity, number of responses in the block

**What iteration 6 changes here, and why**
(`record/2026-08-28-session-16.md`, `ledger/2026-08-28-session-16-two-becomings.md`):

Iterations 1 to 5 each built one instance from **the current version** of each
product and carried, in the footer, a sentence saying that the two records had
last moved at different times and that a felt record "can go on filling for days
after the arrivals stop". That sentence was an apology for a limitation: the
work compared two records as though both were finished, and neither was, and it
could say so only in prose.

The apparatus publishes the whole history. `includesuperseded=true` returns
every version of every product with its publication instant, and every version's
files are still served. So the limitation is material. This iteration builds
from **all** of it, and the instant of reading becomes the third thing the
encounterer sets, beside the two thresholds.

Doing that makes two things visible that no earlier iteration could show:

  * the two records do not merely reach different distances, they come into
    being by different processes — the arrival record is recomputed whole a
    small number of times, the felt record accretes continuously in many small
    steps, one or two reports at a time, for days;
  * the felt record does not own its own coordinate. Its distances are measured
    from an epicentre the instrument network computes, and when that epicentre
    is revised every felt report moves although nobody reported anything.

Both are drawn, not asserted. What is struck with them is the footer sentence
above, and the single-revision provenance line it stood on.

Derived quantities, and no others: a pick's travel time (its published arrival
instant minus the origin instant published in the same version); a felt block's
epicentral distance (great-circle from the epicentre published in the version
that carries it to the outline published for it, on a sphere of R = 6371.0 km);
and the degree/kilometre conversion used for display. A block's published
distance travels into the file beside its computed one, as in iteration 5, so
the two coordinates can be compared rather than conflated.

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

FELT_FILES = (
    ("dyfi_geo_1km.geojson", 1.0),
    ("dyfi_geo_10km.geojson", 10.0),
)


def get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r:
        raw = r.read()
    return raw if binary else raw.decode("utf-8")


def iso(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00"))


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
    """The detail GeoJSON of an event carrying both products, all versions."""
    sup = "&includesuperseded=true"
    if eventid:
        return json.loads(get(f"{FDSN}?format=geojson&eventid={eventid}{sup}"))
    listing = json.loads(
        get(f"{FDSN}?format=geojson&limit=40&minmagnitude=5&orderby=time")
    )
    for feat in listing["features"]:
        detail = json.loads(
            get(f"{FDSN}?format=geojson&eventid={feat['id']}{sup}"))
        products = detail["properties"]["products"]
        if "phase-data" in products and "dyfi" in products:
            return detail
    raise SystemExit("no recent event carries both phase-data and dyfi")


def read_phase_version(product, t_event_ms):
    """One published version of the arrival record, read whole.

    Each version carries its own origin, so each version's travel times are
    computed against the origin instant that version published — never against
    a later one.
    """
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
        rows.append({
            "sta": f"{wf.get('networkCode')}.{wf.get('stationCode')}",
            "deg": round(float(deg), 4),
            "t": round((iso(instant) - t0).total_seconds(), 2),
            "ph": arrival.findtext(BED + "phase") or "",
            "res": round(float(res), 2) if res is not None else None,
            "mode": pick.findtext(BED + "evaluationMode") or "",
        })
    # A pick with no published residual cannot be filtered by one and is not
    # silently given a favourable value: it is dropped, and the count of what
    # was dropped travels into the file so the omission stays visible.
    dropped = sum(1 for r in rows if r["res"] is None)
    rows = [r for r in rows if r["res"] is not None]
    rows.sort(key=lambda r: r["deg"])

    props = product["properties"]

    def num(k):
        v = props.get(k)
        return None if v is None else float(v)

    return {
        "rev": int(product["updateTime"]),
        "min": round((int(product["updateTime"]) - t_event_ms) / 60000.0, 2),
        "t0": t0.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "lat": num("latitude"), "lon": num("longitude"), "depth": num("depth"),
        "status": props.get("review-status") or props.get("evaluation-status") or "",
        "picks": rows,
        "noRes": dropped,
        "url": url,
    }


def read_felt_version(product, t_event_ms):
    """One published version of the felt record, read whole.

    Returns the blocks keyed by their published outline, and the epicentre
    **this version** published — which is the point its own distances were
    measured from, and which the instrument network can move under it.
    """
    contents = product["contents"]
    name, cell_km = next(
        ((n, c) for n, c in FELT_FILES if n in contents), (None, None))
    if name is None:
        return None
    props = product["properties"]
    lat0, lon0 = float(props["latitude"]), float(props["longitude"])
    depth0 = float(props["depth"])

    blocks, no_outline = {}, 0
    for b in json.loads(get(contents[name]["url"]))["features"]:
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
        key = (round(centre[0], 4), round(centre[1], 4))
        blocks[key] = {"n": int(p["nresp"]), "cdi": float(p["cdi"]),
                       "km": round(float(p["dist"]), 1)}
    return {
        "rev": int(product["updateTime"]),
        "min": round((int(product["updateTime"]) - t_event_ms) / 60000.0, 2),
        "lat": lat0, "lon": lon0, "depth": depth0,
        "cellKm": cell_km, "file": name,
        "blocks": blocks, "noOutline": no_outline,
        "url": contents[name]["url"],
    }


def build(eventid=None):
    detail = pick_event(eventid)
    props = detail["properties"]
    lon, lat, depth = detail["geometry"]["coordinates"]
    t_event_ms = int(props["time"])

    phase_products = sorted(props["products"]["phase-data"],
                            key=lambda p: p["updateTime"])
    felt_products = sorted(props["products"]["dyfi"],
                           key=lambda p: p["updateTime"])

    print(f"event    {detail['id']}  M{props['mag']}  {props['place']}")
    print(f"reading  {len(phase_products)} published version(s) of the arrival"
          f" record, {len(felt_products)} of the felt record", flush=True)

    phases = [read_phase_version(p, t_event_ms) for p in phase_products]

    # ---- the felt record, as a history -------------------------------------
    # Blocks are identified by their published outline. Each distinct published
    # epicentre gets an index; a block's geometry is computed once per
    # epicentre, because that is the only thing it depends on.
    raw = []
    for p in felt_products:
        v = read_felt_version(p, t_event_ms)
        if v is not None:
            raw.append(v)
    if not raw:
        raise SystemExit("no felt version carries a geocoded block file")

    epis, epi_index = [], {}
    for v in raw:
        key = (v["lat"], v["lon"], v["depth"])
        if key not in epi_index:
            epi_index[key] = len(epis)
            epis.append({"lat": v["lat"], "lon": v["lon"], "depth": v["depth"],
                         "rev": v["rev"], "min": v["min"]})
        v["e"] = epi_index[key]

    order, blocks = {}, []
    for v in raw:
        for key in v["blocks"]:
            if key not in order:
                order[key] = len(blocks)
                blocks.append({"c": [key[0], key[1]],
                               "epi": [None] * len(epis),
                               "km": [None] * len(epis)})
    cell_km = raw[-1]["cellKm"]
    km_disagree = 0
    for v in raw:
        e = v["e"]
        for key, b in v["blocks"].items():
            i = order[key]
            if blocks[i]["epi"][e] is None:
                # epicentral distance, floored at the resolution of a published
                # block: a cell's centre is not located better than the cell is
                # wide.
                d = gc_km(epis[e]["lat"], epis[e]["lon"], key[0], key[1])
                blocks[i]["epi"][e] = round(max(d, v["cellKm"] / 2), 2)
                blocks[i]["km"][e] = b["km"]
            elif blocks[i]["km"][e] != b["km"]:
                km_disagree += 1
                blocks[i]["km"][e] = b["km"]

    # The history as what it is: a list of changes. A version's entry says what
    # appeared, what changed, and what went away; nothing is stored twice.
    versions, prev, added, changed, removed = [], {}, 0, 0, 0
    for v in raw:
        add, chg, gone = [], [], []
        for key, b in v["blocks"].items():
            i = order[key]
            was = prev.get(i)
            if was is None:
                add.append([i, b["n"], b["cdi"]])
            elif was[0] != b["n"] or was[1] != b["cdi"]:
                chg.append([i, b["n"], b["cdi"]])
        for i in prev:
            if i not in {order[k] for k in v["blocks"]}:
                gone.append(i)
        added += len(add)
        changed += len(chg)
        removed += len(gone)
        versions.append({"rev": v["rev"], "min": v["min"], "e": v["e"],
                         "a": add, "c": chg, "d": gone})
        prev = {order[k]: (b["n"], b["cdi"]) for k, b in v["blocks"].items()}

    # Did any block's count ever go down? The work claims accretion; the claim
    # is checked here rather than assumed, and the answer travels into the file.
    decreases = 0
    state = {}
    for ver in versions:
        for i, n, _c in ver["a"]:
            state[i] = n
        for i, n, _c in ver["c"]:
            if n < state.get(i, 0):
                decreases += 1
            state[i] = n

    payload = {
        "id": detail["id"],
        "place": props["place"],
        "mag": props["mag"],
        "origin": dt.datetime.fromtimestamp(t_event_ms / 1000, dt.timezone.utc)
                    .strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "lat": lat, "lon": lon, "depth": depth,
        "kmPerDeg": KM_PER_DEG, "rKm": R_KM,
        "cellKm": cell_km,
        "feltFile": raw[-1]["file"],
        "noOutline": raw[-1]["noOutline"],
        "epis": epis,
        "blocks": blocks,
        "felt": versions,
        "phases": phases,
        "counts": {"added": added, "changed": changed, "removed": removed,
                   "decreases": decreases, "kmDisagree": km_disagree},
        "sources": {
            "detail": f"{FDSN}?format=geojson&eventid={detail['id']}"
                      f"&includesuperseded=true",
            "phase": phases[-1]["url"],
            "felt": raw[-1]["url"],
        },
        "built": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d"),
    }

    here = __file__.rsplit("/", 1)[0]
    with open(f"{here}/template.html", encoding="utf-8") as f:
        html = f.read()
    html = html.replace(
        "/*DATA*/null/*DATA*/", json.dumps(payload, separators=(",", ":")))
    out = f"{here}/{detail['id']}.html"
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)

    # ---- what the history says, printed so the build is checkable ----------
    last = phases[-1]
    print(f"origin   {payload['origin']}  depth {depth} km")
    print(f"arrivals {len(phases)} version(s): "
          + ", ".join(f"+{p['min']:.1f} min ({len(p['picks'])} picks,"
                      f" {p['picks'][0]['deg']}..{p['picks'][-1]['deg']}deg)"
                      for p in phases))
    print(f"         last arrival record published +{last['min']:.1f} min"
          f" = +{last['min']/1440:.2f} d after the origin")
    f0, fN = versions[0], versions[-1]
    total = sum(n for ver in versions for _i, n, _c in ver["a"]) \
        if False else None
    st = {}
    for ver in versions:
        for i, n, _c in ver["a"]:
            st[i] = n
        for i, n, _c in ver["c"]:
            st[i] = n
        for i in ver["d"]:
            st.pop(i, None)
    print(f"felt     {len(versions)} version(s): first +{f0['min']:.1f} min,"
          f" last +{fN['min']:.1f} min = +{fN['min']/1440:.2f} d")
    print(f"         {len(blocks)} blocks ever published,"
          f" {sum(st.values())} responses at the last version")
    print(f"         accretion check: {added} block(s) appeared,"
          f" {changed} changed, {removed} disappeared,"
          f" {decreases} count(s) went down")
    print(f"         {len(epis)} distinct published epicentre(s)")
    for i, e in enumerate(epis[1:], start=1):
        moved = gc_km(epis[i - 1]["lat"], epis[i - 1]["lon"], e["lat"], e["lon"])
        print(f"         at +{e['min']:.1f} min the origin moved {moved:.2f} km"
              f" and every felt report moved with it")
    fin = [blocks[i]["epi"][fN["e"]] for i in st]
    print(f"         final epicentral extent {min(fin):.2f} .. {max(fin):.2f} km")
    print(f"wrote    {out}")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else None)
