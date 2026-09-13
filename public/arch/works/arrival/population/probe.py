#!/usr/bin/env python3
"""The population probe, committed so that its rule can be re-run.

Sessions 26, 27 and 28 each measured this work's claims against the same fixed
population and each wrote its numbers into a ledger. Session 28 found that its
felt figures disagreed with session 26's by a factor of four and could not say
why — because session 26's probe existed only in that session's shell and could
not be re-run. Session 23 had recorded the same defect about its own harness.

So the rule lives here instead of in a terminal. What it does is what session
28's corrected pass did, and the fields it reads are the fields `build.py`
reads:

  * the population is every catalogue event with M >= 5.0 whose origin falls in
    [2026-06-01T00:00Z, 2026-08-15T00:00Z) — fixed since session 22, nothing
    sampled;
  * a version's publisher is `properties.eventsource` on the product, not the
    product's `source` field. For `phase-data` the two agree; for `dyfi` they do
    not — every version of the felt record is contributed by `us` and filed
    under the event's own network — and reading `source` reports zero felt
    crossings over the whole population, which is how session 28 found the error
    in its own first pass;
  * a *crossing* is a consecutive pair of versions, ordered by `updateTime`,
    whose publishers differ;
  * the *majority publisher* is the one holding the most versions, ties broken
    by the earliest version, which is the rule session 27 fixed.

Usage:

    python3 probe.py [--cache DIR] [--ids FILE]

`--ids` diffs today's catalogue against a committed id list and prints what was
added and removed rather than only a count. `--cache` keeps each event's detail
JSON so a second probe of the same day does not re-fetch 492 documents.

Writes nothing into the repository. What it prints is what a ledger quotes.
"""

import argparse
import datetime as dt
import json
import os
import sys
import urllib.request

FDSN = "https://earthquake.usgs.gov/fdsnws/event/1/query"
UA = {"User-Agent": "arch-practice/arrival (public data, unauthenticated)"}

START = "2026-06-01T00:00:00"
END = "2026-08-15T00:00:00"
MINMAG = 5.0


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=180) as r:
        return r.read().decode("utf-8")


def catalogue():
    """The population, in catalogue order, on the half-open window."""
    url = (f"{FDSN}?format=geojson&starttime={START}&endtime={END}"
           f"&minmagnitude={MINMAG}&orderby=time-asc")
    feed = json.loads(get(url))
    lo = dt.datetime.fromisoformat(START).replace(
        tzinfo=dt.timezone.utc).timestamp() * 1000
    hi = dt.datetime.fromisoformat(END).replace(
        tzinfo=dt.timezone.utc).timestamp() * 1000
    # The endpoint's own window is closed at both ends; this practice's
    # population is half-open, and the difference is filtered here rather than
    # left to the endpoint.
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


def publisher(product):
    """The publisher of one version, read as `build.py` reads it."""
    return product["properties"].get("eventsource")


def majority(versions):
    """Most versions wins; a tie goes to whoever published first.

    Session 27's rule, and it is the record's own ordering that decides it, not
    a set.
    """
    counts = {}
    first = {}
    for v in versions:
        counts[v["pub"]] = counts.get(v["pub"], 0) + 1
        first.setdefault(v["pub"], v["t"])
        first[v["pub"]] = min(first[v["pub"]], v["t"])
    return min(counts, key=lambda p: (-counts[p], first[p]))


def read_product(detail_json, kind):
    """Every published version of one product, oldest first."""
    prods = detail_json["properties"].get("products", {}).get(kind, [])
    out = [{"pub": publisher(p), "t": int(p["updateTime"])} for p in prods]
    out.sort(key=lambda v: v["t"])
    return out


def tally(detail_json, kind):
    vs = read_product(detail_json, kind)
    if not vs:
        return None
    pubs = {v["pub"] for v in vs}
    maj = majority(vs)
    crossings = sum(1 for a, b in zip(vs, vs[1:]) if a["pub"] != b["pub"])
    return {"versions": len(vs), "pairs": max(0, len(vs) - 1),
            "publishers": sorted(p for p in pubs if p),
            "majority": maj, "foreign": sum(1 for v in vs if v["pub"] != maj),
            "crossings": crossings}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache")
    ap.add_argument("--ids")
    ap.add_argument("--progress", action="store_true")
    args = ap.parse_args()

    pop = catalogue()
    ids = [f["id"] for f in pop]
    print(f"population: {len(ids)} events, "
          f"M >= {MINMAG}, [{START}Z, {END}Z)")

    if args.ids:
        with open(args.ids, encoding="utf-8") as f:
            known = [ln.strip() for ln in f if ln.strip()]
        added = [i for i in ids if i not in set(known)]
        gone = [i for i in known if i not in set(ids)]
        print(f"against {args.ids}: {len(known)} known, "
              f"{len(added)} added, {len(gone)} withdrawn")
        for i in added:
            print(f"  + {i}")
        for i in gone:
            print(f"  - {i}")

    agg = {}
    multi = {}
    for kind in ("phase-data", "dyfi"):
        agg[kind] = {"events": 0, "versions": 0, "pairs": 0,
                     "crossings": 0, "foreign": 0, "multi": 0}
        multi[kind] = []

    for n, eid in enumerate(ids, 1):
        if args.progress and n % 25 == 0:
            print(f"  .. {n}/{len(ids)}", file=sys.stderr)
        d = detail(eid, args.cache)
        for kind in ("phase-data", "dyfi"):
            t = tally(d, kind)
            if t is None:
                continue
            a = agg[kind]
            a["events"] += 1
            a["versions"] += t["versions"]
            a["pairs"] += t["pairs"]
            a["crossings"] += t["crossings"]
            a["foreign"] += t["foreign"]
            if len(t["publishers"]) > 1:
                a["multi"] += 1
                multi[kind].append((eid, "+".join(t["publishers"]),
                                    t["majority"], t["versions"],
                                    t["crossings"]))

    for kind, label in (("phase-data", "arrival"), ("dyfi", "felt")):
        a = agg[kind]
        pct = (100.0 * a["crossings"] / a["pairs"]) if a["pairs"] else 0.0
        print(f"\n{label} ({kind})")
        print(f"  events carrying the product : {a['events']}")
        print(f"  versions                    : {a['versions']}")
        print(f"  consecutive pairs           : {a['pairs']}")
        print(f"  crossings                   : {a['crossings']} ({pct:.2f} %)")
        print(f"  versions by a non-majority  : {a['foreign']}")
        print(f"  events with >1 publisher    : {a['multi']}")
        for eid, pubs, maj, v, c in sorted(multi[kind]):
            print(f"    {eid:16s} {pubs:12s} majority {maj:3s} "
                  f"{v:5d} version(s) {c:3d} crossing(s)")


if __name__ == "__main__":
    main()
