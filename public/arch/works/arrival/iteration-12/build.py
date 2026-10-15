#!/usr/bin/env python3
"""Build one instance of the work "Arrival", iteration 12, from public USGS data.

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

**What iteration 12 changes here: nothing.** This pipeline is iteration 10's,
unedited apart from this note and the one above it. What changed is again what
the template draws from the same data, and again the occasion is a measurement
this practice had published and had to withdraw.

The lower strip has drawn each felt block at two published values since
iteration 3 — across, how many people reported it; up, how many other blocks of
this record stood within a chosen distance of it at the instant on show. The
vertical coordinate was put there because two sessions of this practice had
measured that it separated the blocks the record goes on to revise from the
blocks it leaves alone. On 2026-09-04 that measurement was run against the
control both sessions had named and neither had run, and it did not survive:
once each block's company **in the last version this file was built from** is
held fixed, the company standing around it at the moment it first appeared
separates nothing at all. The quantity is the place, not the moment.

So the strip stops presenting that coordinate as a bare position and draws its
motion, on exactly the rule the upper strip has used since iteration 11: a path
through consecutive published positions, up to the instant on show, consecutive
repeats collapsed. Nothing is added to what the record publishes; what is added
is that a viewer can see how much of a block's height is the place filling in
around it and how much is the block's own.
See `ledger/2026-09-04-session-22-what-the-company-was.md`.

**What iteration 11 changed here: nothing.** This pipeline is iteration 10's,
unedited apart from this note. What changed is what the template draws from the
same data: a mark that has been published at more than two positions is drawn as
the path it took, consecutive position to consecutive position, instead of a fan
from every earlier position to the present one. The fan was a true drawing of a
record that had published its arrivals twice; on 2026-09-02 the Peruvian record
this work is built on published a third version, and the fan stopped being true.
Nothing here had to change for that, which is the one thing this note records:
the pipeline already read every version the apparatus serves, and it was the
drawing that was carrying an assumption about how many there would be.
See `ledger/2026-09-03-session-21-what-a-second-revision-is.md`.

**What iteration 10 changed here: a pick gets a place on the ground.**

Every iteration to the ninth has known where a felt block is — the felt record
publishes an outline, and a point on the ground is what an outline is. It has
never known where a seismometer is. The arrival record publishes each pick's
epicentral distance *and* its azimuth from the epicentre in force, and those
two with the epicentre name a point exactly as the outline does. So this
pipeline runs the great circle it already uses forwards instead of backwards
and gives a pick a published position, `la`/`lo`. Nothing is looked up in a
station inventory; a pick with no published azimuth gets no position, and the
count of those travels into the file as `noAz` (0 on both work events).

What forced it is measured in `ledger/2026-09-01-session-20-what-a-crowd-is.md`.
Session 19 established that the felt record's intensity moves only when a
person answers a second time. This session asked which blocks those are, and
the answer is not the earthquake: on the Japanese event the blocks that ever
gain a second reporter are the ones standing in the record's own crowd — a
median of 12 other blocks already published within 10 km of them when they
first appeared, against 3 for the blocks that never move — while their
distance from the epicentre and their published intensity separate nothing at
all. The same question asked of the arrival record answers differently: a
station is re-picked where the record already disagreed with itself, not where
stations are dense, and no radius on either event makes crowding matter there.
Asking that question of both records in the same units is what needs a pick to
have a place, and this is where it gets one.

**What iteration 9 changed here: two things, and both are identity claims.**

Every iteration since the sixth has read the whole publication history of both
records, and every one of them has drawn each version as though it had no
predecessor. A block already had a name across versions — the rounded centre of
its published outline, `outline_centre` below — because the felt half is stored
as a list of changes and a change needs something to be a change *of*. A pick
had no such name: the arrival half was stored as a flat list per version, and
nothing in the file said that a station in the second version was the same
station as in the first. So iteration 9 gives a pick an identity across
versions, and checks it rather than assuming it: the key is the published
network and station code with the published phase label, and the number of
times two arrivals in one version claim the same key travels into the file as
`pickKeyCollisions`. On the two work events it is 0 and 0.

Second, a pick now carries the instant it was published at as well as the
travel time derived from it — `a`, seconds from the event origin instant, which
is fixed and not any version's own. That is what makes it possible to say
whether a station published a *different observation* or the same one. It is
the field this pipeline has been reading since iteration 1 to compute a travel
time, and then discarding.

What forced both is measured in `ledger/2026-08-31-session-19-what-a-jolt-is.md`.
The felt record revises 15 blocks of 129 across 80 publications, and never once
without a new reporter: 0 of 79 transitions on Japan and 0 of 36 on Peru
contain an intensity that moved at an unchanged reporter count. The arrival
record publishes twice, and at its single revision 118 of 121 published
residuals changed — 105 of them at stations that published exactly the same
arrival instant as before. One record's own measurement moves only when a
person acts; the other's moves for nearly everyone when nobody observed
anything.

What forced iteration 8, and stands unchanged:
`ledger/2026-08-30-session-18-what-it-owns.md`: the felt record publishes
exactly three things per block that owe the instrument network nothing — the
outline, the number of people who reported, and the intensity they reported.
Iterations 2 to 7 drew the lower half as a running count of reports inside a
distance, which is a census of the network rather than a measurement of the
earthquake, and made the reporter count the human-side control. On the Japanese
event that control takes four distinct values across the whole published
history and 112 of 129 blocks sit in the first of them; the instrument-side
control takes 164. The intensity takes 22, and was drawn nowhere.

**What iteration 7 changed here, and why**
(`record/2026-08-29-session-17.md`, `ledger/2026-08-29-session-17-what-it-costs.md`):

Iteration 6 showed that the felt record does not own the coordinate it is drawn
on, and left the next question standing: what does that cost it. The cost is
measurable, and it is measurable against something the felt record does own —
the size of its own cells. A block is published as a 1 km cell. On the Japanese
event the instrument network's one revision moved every block by a median of
1.21 km; on the Peruvian event by 8.97 km, against a cell 1.4 km across. The
human record is displaced by about its own resolution, or by six times it, by
an act nobody in it performed.

Iteration 6 could not show that, because it drew each block at one number — the
centre of its outline — and said the rest in the footer:

    "A block is published as a 1 km cell, so no position here is finer than
     that, and none is drawn nearer the epicentre than half a cell."

That sentence is prose standing in for a picture, and the clamp it describes
never once fired on either event. Both are struck. Here a block is drawn across
the distances it actually occupies: from the nearest published vertex of its own
outline to the farthest, measured from the epicentre in force. On a logarithmic
axis that makes the near field wide and the far field a hairline, so the human
record's own imprecision is drawn where it is large — which is exactly where
this work's most consequential figure, the inner edge, has always been read.

The same act is performed on the other network, because since iteration 3 every
demand this work makes is made of both: a pick is drawn from the instant it
arrived to the instant the fitted solution predicted for it, which is its
published residual. At this figure's scale that mark is under a pixel on both
events at every state. Drawing both to one scale and letting one of them vanish
is the finding, not a failure to draw it.

One further thing iteration 6 asserted and this iteration reads: the identity
line named the solution the *arrival* record then carried, while the felt half
below can still be standing on an older one — the felt product carries the
solution of its own last publication. On the two work events that gap is open at
1 instant of 82 and 2 of 39, and at those instants the file now says that its
shared axis is not shared.

Derived quantities, and no others: a pick's travel time (its published arrival
instant minus the origin instant published in the same version); a felt block's
two epicentral distances (great-circle from the epicentre published in the
version that carries it to the nearest and to the farthest vertex of the
outline published for it, on a sphere of R = 6371.0 km — a published vertex,
never a point interpolated between two); the same published arrival instant
counted from the event's own origin instant, which belongs to no version; a
pick's place on the ground, from its own published epicentral distance and its
own published azimuth about the epicentre its version published, on that same
sphere; and the degree/kilometre conversion used for display. The file itself
derives one more, and says so: how many of a record's own marks stand within a
given distance of one of them, counted over the population standing at the
instant being read. A block's published distance travels into the file beside
its computed ones, as in iterations 5 and 6, so the two coordinates can be
compared rather than conflated.

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


def forward(lat0, lon0, deg, az):
    """Where a pick stands, from its own published distance and azimuth.

    The inverse of `gc_km`, on the same sphere: given the epicentre a version
    published, the epicentral distance that version published for a pick and
    the azimuth it published from that epicentre to the station, this returns
    the point those three name. It derives nothing the record does not already
    say; it only says it in the coordinate the felt blocks are already in, so
    that the same question can be asked of both records.
    """
    d = math.radians(deg)
    th = math.radians(az)
    p0 = math.radians(lat0)
    la = math.asin(max(-1.0, min(1.0,
        math.sin(p0) * math.cos(d) + math.cos(p0) * math.sin(d) * math.cos(th))))
    lo = math.radians(lon0) + math.atan2(
        math.sin(th) * math.sin(d) * math.cos(p0),
        math.cos(d) - math.sin(p0) * math.sin(la))
    return math.degrees(la), (math.degrees(lo) + 540.0) % 360.0 - 180.0


def outline_ring(geom):
    """The distinct published vertices of a block's outline, as (lat, lon).

    A block is a published cell, not a point. Iterations 5 and 6 took its
    centre and said in the footer that no position was finer than the cell;
    iteration 7 keeps the vertices, because the cell's two edges on this axis
    are computed from them and are what gets drawn.
    """
    if not geom:
        return None
    t, c = geom.get("type"), geom.get("coordinates")
    if t == "Point":
        return [(c[1], c[0])]
    ring = c[0] if t == "Polygon" else (c[0][0] if t == "MultiPolygon" else None)
    if not ring:
        return None
    pts = ring[:-1] if len(ring) > 2 and ring[0] == ring[-1] else ring
    return [(p[1], p[0]) for p in pts]


def outline_centre(geom):
    """Centre of a published block outline: the mean of its distinct vertices.

    Kept as the block's identity across versions — a block is recognised by
    where it is, and the centre is the cheapest stable name for that. It is no
    longer where the block is drawn.
    """
    pts = outline_ring(geom)
    if not pts:
        return None
    return (sum(p[0] for p in pts) / len(pts),
            sum(p[1] for p in pts) / len(pts))


def outline_edges(pts, lat0, lon0):
    """The near and far edge of a published block on the epicentral axis.

    The whole cell stands at a range of distances from the epicentre, and the
    range is published: it is the outline. The nearest and farthest vertices
    give it. Nothing is derived beyond the great circle already in use.
    """
    ds = [gc_km(lat0, lon0, p[0], p[1]) for p in pts]
    return min(ds), max(ds)


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

    From iteration 9 each pick also carries `a`, the instant the station's
    arrival was published at, in seconds from the event origin instant. That
    reference is fixed across versions and belongs to none of them, which is
    the point: the travel time `t` moves when the fitted origin moves, and `a`
    moves only when the station's own published arrival moves. Keeping both is
    what lets the file distinguish a re-picked station from a re-fitted one.
    """
    url = product["contents"]["quakeml.xml"]["url"]
    root = ET.fromstring(get(url, binary=True))
    origin = root.find(".//" + BED + "origin")
    t0 = iso(origin.find(BED + "time/" + BED + "value").text)
    t_event = dt.datetime.fromtimestamp(t_event_ms / 1000, dt.timezone.utc)

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
        az = arrival.findtext(BED + "azimuth")
        rows.append({
            "sta": f"{wf.get('networkCode')}.{wf.get('stationCode')}",
            "deg": round(float(deg), 4),
            "az": round(float(az), 3) if az is not None else None,
            "t": round((iso(instant) - t0).total_seconds(), 2),
            "a": round((iso(instant) - t_event).total_seconds(), 3),
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

    # A pick's place on the ground, from what its own version publishes about
    # it: the epicentre in force, the pick's published epicentral distance and
    # its published azimuth from that epicentre. This is the same great circle
    # already in use for a block's distance, run forward instead of backward,
    # on the same sphere. Nothing is looked up in a station inventory and no
    # coordinate is invented — a pick with no published azimuth simply has no
    # position, and the count of those travels into the file.
    lat0, lon0 = num("latitude"), num("longitude")
    no_az = 0
    for r in rows:
        if r["az"] is None or lat0 is None or lon0 is None:
            r["la"] = r["lo"] = None
            no_az += 1
            continue
        la, lo = forward(lat0, lon0, r["deg"], r["az"])
        r["la"], r["lo"] = round(la, 4), round(lo, 4)

    return {
        "rev": int(product["updateTime"]),
        "min": round((int(product["updateTime"]) - t_event_ms) / 60000.0, 2),
        "t0": t0.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "lat": lat0, "lon": lon0, "depth": num("depth"),
        "status": props.get("review-status") or props.get("evaluation-status") or "",
        "picks": rows,
        "noRes": dropped,
        "noAz": no_az,
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
        ring = outline_ring(b.get("geometry"))
        centre = outline_centre(b.get("geometry"))
        if centre is None:
            # Without a published outline the block cannot be placed on the
            # picks' coordinate, and it is not placed by its hypocentral
            # distance instead. It is dropped, visibly.
            no_outline += 1
            continue
        key = (round(centre[0], 4), round(centre[1], 4))
        blocks[key] = {"n": int(p["nresp"]), "cdi": float(p["cdi"]),
                       "km": round(float(p["dist"]), 1), "ring": ring}
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

    # ---- the arrival record, as a history ----------------------------------
    # A pick gets a name that survives republication, for the same reason a
    # block has one: without it no version can be a revision of another, and
    # every iteration to the eighth drew the arrival half as though each
    # version stood alone. The name is what the record itself publishes — the
    # network and station code with the phase label — and it is checked, not
    # assumed: two arrivals in one version claiming the same name would make
    # the identity meaningless, so they are counted and the count travels into
    # the file. Nothing is merged or reconciled; a name is only an index.
    pick_key, pick_key_collisions = {}, 0
    for ph in phases:
        seen = set()
        for r in ph["picks"]:
            key = (r["sta"], r["ph"])
            if key in seen:
                pick_key_collisions += 1
            seen.add(key)
            if key not in pick_key:
                pick_key[key] = len(pick_key)
            r["k"] = pick_key[key]

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

    order, blocks, rings = {}, [], {}
    for v in raw:
        for key, b in v["blocks"].items():
            if key not in order:
                order[key] = len(blocks)
                rings[key] = b["ring"]
                blocks.append({"c": [key[0], key[1]],
                               "lo": [None] * len(epis),
                               "hi": [None] * len(epis),
                               "km": [None] * len(epis)})
    cell_km = raw[-1]["cellKm"]
    km_disagree = 0
    ring_disagree = 0
    for v in raw:
        e = v["e"]
        for key, b in v["blocks"].items():
            i = order[key]
            if b["ring"] != rings[key]:
                # the same block republished with a different outline would
                # invalidate the identity this file is built on; counted, not
                # assumed away.
                ring_disagree += 1
            if blocks[i]["lo"][e] is None:
                # A block is a published cell standing at a range of distances
                # from the epicentre, not at one. Both edges of that range are
                # computed from the published outline, against the epicentre
                # this version published. Iterations 5 and 6 kept the centre
                # and clamped it at half a cell; the clamp never once fired,
                # and the range it stood in for is drawn here instead.
                lo, hi = outline_edges(rings[key], epis[e]["lat"],
                                       epis[e]["lon"])
                blocks[i]["lo"][e] = round(lo, 3)
                blocks[i]["hi"][e] = round(hi, 3)
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
                   "decreases": decreases, "kmDisagree": km_disagree,
                   "ringDisagree": ring_disagree,
                   "pickKeyCollisions": pick_key_collisions,
                   "noAz": sum(p["noAz"] for p in phases)},
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
    lo = [blocks[i]["lo"][fN["e"]] for i in st]
    hi = [blocks[i]["hi"][fN["e"]] for i in st]
    wid = sorted(h - l for l, h in zip(lo, hi))
    print(f"         final epicentral extent {min(lo):.2f} .. {max(hi):.2f} km,"
          f" every edge a published vertex")
    print(f"         each block occupies {wid[0]:.3f} .. {wid[-1]:.3f} km of that"
          f" axis (median {wid[len(wid)//2]:.3f} km);"
          f" {ring_disagree} outline(s) were ever republished differently")
    if len(epis) > 1:
        e0, e1 = fN["e"] - 1, fN["e"]
        if e1 > 0:
            mv = sorted(abs(((blocks[i]["lo"][e1] + blocks[i]["hi"][e1]) / 2)
                            - ((blocks[i]["lo"][e0] + blocks[i]["hi"][e0]) / 2))
                        for i in st
                        if blocks[i]["lo"][e0] is not None
                        and blocks[i]["lo"][e1] is not None)
            if mv:
                print(f"         the last revision moved {len(mv)} of these blocks"
                      f" by {mv[0]:.3f} .. {mv[-1]:.3f} km"
                      f" (median {mv[len(mv)//2]:.3f} km) —"
                      f" against a block's own width of"
                      f" {wid[len(wid)//2]:.3f} km")
    print(f"wrote    {out}")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else None)
