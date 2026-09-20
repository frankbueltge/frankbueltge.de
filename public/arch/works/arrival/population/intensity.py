#!/usr/bin/env python3
"""Session 23's intensity-change population pass, written down.

Session 19 measured, over two events and later a third, that a block's published
intensity never moves unless the block's own published reporter count moves with
it — 0 of 360. Three sessions restated it and a work's own source published it
as *never*, three times. Session 23 (2026-09-05) ran it over 176 events and
4 286 published versions and found 8 exceptions in 2 890 intensity changes: the
claim is false as an absolute and overwhelming as a tendency.

Every built instance of `works/arrival/` prints figures from that pass. Its rule
lived in the shell of one session and nowhere else. Session 29 named that as
item 5 of `ledger/2026-09-13-session-29-...` §8 — "figures printed in every
built instance of this work, and their rules are not in this repository" — and
sessions 30, 31 and 32 carried it forward undone.

This file is that rule, in the repository, re-runnable. It writes nothing here
and prints what a ledger quotes.

The rule, as session 23 fixed it before seeing any result:

  * population — every catalogue event with M >= 5.0 whose origin falls in
    [2026-06-01T00:00Z, 2026-08-15T00:00Z), of which those publishing at least
    two `dyfi` versions carrying a geocoded file. Nothing sampled;
  * version — one published `dyfi` product carrying a geocoded file, ordered by
    `updateTime`. `dyfi_geo_1km.geojson` where the version publishes it, else
    `dyfi_geo_10km.geojson`, which is `build.py`'s own order of preference. A
    version whose geocoded file changes between the two members of a pair is
    excluded from that pair and counted, because a transition cannot cross a
    change of cell size;
  * block — the rounded centroid of its published outline, four decimal places,
    which is `build.py`'s identity. A name a version publishes twice is counted
    and the last occurrence wins, as in `build.py` since iteration 14;
  * transition — a block present in both members of a consecutive version pair;
  * the two movements — the block's published intensity (`cdi`) and its own
    published reporter count (`nresp`), each compared with the value the version
    before published for the same block.

What it prints is the 2x2 table of those two movements, every transition in the
cell the claim says is empty, named by its event, and the transitions that
publish a lower reporter count than the version before — the case the work's
accretion check has never once fired on.

Usage:

    python3 intensity.py [--cache DIR] [--cache-geo] [--limit N] [--progress]

`--cache` keeps each event's detail JSON, shared with `probe.py` and
`revisions.py`. The geocoded files are several thousand documents and are *not*
kept unless `--cache-geo` is given: this pass holds one version's blocks at a
time and needs none of them twice.
"""

import argparse
import datetime as dt
import hashlib
import json
import os
import statistics
import sys
import urllib.request

FDSN = "https://earthquake.usgs.gov/fdsnws/event/1/query"
UA = {"User-Agent": "arch-practice/arrival (public data, unauthenticated)"}

START = "2026-06-01T00:00:00"
END = "2026-08-15T00:00:00"
MINMAG = 5.0

FELT_FILES = ("dyfi_geo_1km.geojson", "dyfi_geo_10km.geojson")


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.read().decode("utf-8")


def catalogue():
    url = (f"{FDSN}?format=geojson&starttime={START}&endtime={END}"
           f"&minmagnitude={MINMAG}&orderby=time-asc")
    feed = json.loads(get(url))
    lo = dt.datetime.fromisoformat(START).replace(
        tzinfo=dt.timezone.utc).timestamp() * 1000
    hi = dt.datetime.fromisoformat(END).replace(
        tzinfo=dt.timezone.utc).timestamp() * 1000
    return [f for f in feed["features"] if lo <= f["properties"]["time"] < hi]


def detail(eid, cache=None):
    if cache:
        path = os.path.join(cache, eid + ".json")
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                return json.load(f)
    raw = get(f"{FDSN}?format=geojson&eventid={eid}&includesuperseded=true")
    if cache:
        os.makedirs(cache, exist_ok=True)
        with open(os.path.join(cache, eid + ".json"), "w",
                  encoding="utf-8") as f:
            f.write(raw)
    return json.loads(raw)


def geo(url, cache=None):
    path = None
    if cache:
        digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
        path = os.path.join(cache, f"geo-{digest}.json")
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                return f.read()
    raw = get(url)
    if path:
        os.makedirs(cache, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(raw)
    return raw


def outline_centre(geom):
    """`build.py`'s block identity: the mean of the distinct published vertices."""
    if not geom:
        return None
    t, c = geom.get("type"), geom.get("coordinates")
    if t == "Point":
        pts = [(c[1], c[0])]
    else:
        ring = c[0] if t == "Polygon" else (
            c[0][0] if t == "MultiPolygon" else None)
        if not ring:
            return None
        ring = ring[:-1] if len(ring) > 2 and ring[0] == ring[-1] else ring
        pts = [(p[1], p[0]) for p in ring]
    if not pts:
        return None
    return (sum(p[0] for p in pts) / len(pts),
            sum(p[1] for p in pts) / len(pts))


def read_blocks(raw):
    """One version's blocks by identity, with its intensity and reporter count."""
    blocks, no_outline, collisions = {}, 0, 0
    for b in json.loads(raw)["features"]:
        p = b["properties"]
        if p.get("dist") is None:
            continue
        centre = outline_centre(b.get("geometry"))
        if centre is None:
            no_outline += 1
            continue
        key = (round(centre[0], 4), round(centre[1], 4))
        if key in blocks:
            collisions += 1
        blocks[key] = (float(p["cdi"]), int(p["nresp"]))
    return blocks, no_outline, collisions


def felt_versions(d):
    """Published `dyfi` versions carrying a geocoded file, oldest first."""
    out = []
    for p in d["properties"].get("products", {}).get("dyfi", []):
        contents = p.get("contents", {})
        name = next((n for n in FELT_FILES if n in contents), None)
        if name is None:
            continue
        out.append({"t": int(p["updateTime"]), "file": name,
                    "url": contents[name]["url"],
                    "src": p["properties"].get("eventsource"),
                    "nresp": p["properties"].get("num-responses")})
    out.sort(key=lambda v: v["t"])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache")
    ap.add_argument("--cache-geo", action="store_true")
    ap.add_argument("--progress", action="store_true")
    ap.add_argument("--limit", type=int,
                    help="stop after N events of the population; a partial "
                         "pass, and any ledger quoting it must say so")
    args = ap.parse_args()
    geo_cache = args.cache if args.cache_geo else None

    pop = catalogue()
    print(f"population: {len(pop)} events, M >= {MINMAG}, "
          f"[{START}Z, {END}Z)")

    # Pass one: which events publish at least two geocoded felt versions.
    carrying = tested = 0
    members = []
    for n, f in enumerate(pop, 1):
        if args.progress and n % 50 == 0:
            print(f"  .. versions {n}/{len(pop)}", file=sys.stderr)
        d = detail(f["id"], args.cache)
        if not d["properties"].get("products", {}).get("dyfi"):
            continue
        carrying += 1
        vs = felt_versions(d)
        if len(vs) < 2:
            continue
        tested += 1
        members.append((f["id"], f["properties"].get("mag"),
                        f["properties"].get("place"), vs))

    print(f"events carrying a dyfi product            : {carrying}")
    print(f"publishing >= 2 geocoded versions         : {tested}")
    counts = [len(v) for _, _, _, v in members]
    print(f"versions                                  : {sum(counts)} "
          f"(median {statistics.median(counts):.0f} per event, "
          f"max {max(counts)})")
    files = {}
    for _, _, _, vs in members:
        for v in vs:
            files[v["file"]] = files.get(v["file"], 0) + 1
    for name, n in sorted(files.items()):
        print(f"  {name:24s}: {n}")

    if args.limit:
        members = members[:args.limit]
        print(f"  [PARTIAL: {len(members)} events of {tested}]")

    # Pass two: the transitions.
    table = {(True, True): 0, (True, False): 0,
             (False, True): 0, (False, False): 0}
    blocks_ever = transitions = 0
    no_outline = collisions = 0
    crossed_file = 0
    exceptions, went_down = [], []
    failed = []
    for n, (eid, mag, place, vs) in enumerate(members, 1):
        if args.progress:
            print(f"  .. blocks {n}/{len(members)} {eid} "
                  f"({len(vs)} versions)", file=sys.stderr)
        seen, prev, prev_v = set(), None, None
        for v in vs:
            try:
                blocks, no_out, coll = read_blocks(geo(v["url"], geo_cache))
            except Exception as exc:                      # noqa: BLE001
                # A version that cannot be read is named, not skipped in
                # silence: it removes two pairs, and the ledger has to say so.
                failed.append((eid, v["t"], type(exc).__name__))
                prev, prev_v = None, None
                continue
            no_outline += no_out
            collisions += coll
            seen |= set(blocks)
            if prev is not None:
                if prev_v["file"] != v["file"]:
                    crossed_file += 1
                else:
                    for k, (cdi, nresp) in blocks.items():
                        if k not in prev:
                            continue
                        transitions += 1
                        pc, pn = prev[k]
                        moved_i, moved_n = cdi != pc, nresp != pn
                        table[(moved_i, moved_n)] += 1
                        if moved_i and not moved_n:
                            exceptions.append(
                                (eid, mag, place, prev_v["t"], v["t"], k,
                                 pc, cdi, nresp, prev_v["src"], v["src"],
                                 prev_v["nresp"], v["nresp"]))
                        if nresp < pn:
                            went_down.append((eid, k, pn, nresp))
            prev, prev_v = blocks, v
        blocks_ever += len(seen)

    print(f"\nblocks ever published                     : {blocks_ever}")
    print(f"  dropped, no published outline           : {no_outline}")
    print(f"  block names published twice in a version: {collisions}")
    print(f"pairs crossing a change of geocoded file  : {crossed_file}")
    print(f"transitions                               : {transitions}")
    if failed:
        print(f"versions that could not be read           : {len(failed)}")
        for eid, t, kind in failed:
            print(f"  {eid} {t} {kind}")

    print("\n                        | reporter count moved | did not")
    print(f"  intensity moved       | {table[(True, True)]:20d} | "
          f"{table[(True, False)]:d}")
    print(f"  intensity did not     | {table[(False, True)]:20d} | "
          f"{table[(False, False)]:d}")
    changes = table[(True, True)] + table[(True, False)]
    n_moved = table[(True, True)] + table[(False, True)]
    n_still = table[(True, False)] + table[(False, False)]
    if changes:
        print(f"\nintensity changes at an unchanged reporter count: "
              f"{table[(True, False)]} of {changes} "
              f"({100.0 * table[(True, False)] / changes:.3f} %)")
    if n_moved:
        print(f"  where the reporter count moved : intensity moved "
              f"{table[(True, True)]} of {n_moved} "
              f"({100.0 * table[(True, True)] / n_moved:.1f} %)")
    if n_still:
        print(f"  where it did not               : intensity moved "
              f"{table[(True, False)]} of {n_still} "
              f"({100.0 * table[(True, False)] / n_still:.5f} %)")

    print(f"\nthe cell the claim says is empty, named: "
          f"{len(exceptions)} transition(s)")
    for (eid, mag, place, t0, t1, k, pc, cdi, nresp, s0, s1,
         n0, n1) in exceptions:
        print(f"  {eid} M{mag} {place}")
        print(f"    block {k} intensity {pc} -> {cdi} at {nresp} reporter(s)")
        print(f"    across {t0} -> {t1}; product source {s0} -> {s1}; "
              f"num-responses {n0} -> {n1}")

    ev = {e for e, _, _, _ in went_down}
    print(f"\ntransitions publishing a lower reporter count: "
          f"{len(went_down)} on {len(ev)} event(s)")
    for e in sorted(ev):
        print(f"  {e}: {sum(1 for x in went_down if x[0] == e)}")


if __name__ == "__main__":
    main()
