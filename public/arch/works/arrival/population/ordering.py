#!/usr/bin/env python3
"""Session 18's ordering claim, run against the population instead of three events.

On 2026-08-30 this practice measured, on two of the events this work is built
on, that the felt record's own quantities order the blocks by distance from the
epicentre only loosely — intensity holding the order on 66.3 % and 70.0 % of
untied pairs, the reporter count on 70.8 % and 46.8 % — and that the resolution
is coarse: between two blocks within a quarter of each other's distance the
intensity held the order on 52.7 % and 56.2 %, which is not an ordering. Every
protocol since 2026-09-05 has listed that finding as still resting on three
events. This is the pass that either retires it or corrects it.

The rule, kept as close to session 18's as a population allows:

  * the population is the fixed one (`probe.py`), and every event in it that
    carries a geocoded felt record is measured — nothing sampled;
  * the version measured is the **last** one published, and the blocks are read
    as `build.py` reads them: a block is the centre of its published outline, a
    block without an outline is dropped and counted, and the epicentre is the
    one **that version** published, not today's;
  * a pair counts only where the two distances differ. It *holds* where the
    nearer block's quantity is strictly the greater, *fails* where it is
    strictly the smaller, and is *tied* where they are equal. Ties are reported,
    never redistributed;
  * the separation bands are session 18's, on the ratio of the farther block's
    distance to the nearer one's.

Both counts are exact over every pair — nothing is sampled and no event is
capped. The overall count is a Fenwick tree over the quantity's ranks; each band
is the same tree over a window that slides, because for blocks sorted by
distance the blocks standing at a given ratio band from one block are a
contiguous run of that order.

Usage:

    python3 ordering.py --cache DIR [--progress]

`--cache` is the directory `probe.py --cache` filled with each event's detail
JSON. Writes nothing into the repository.
"""

import argparse
import json
import math
import os
import sys
import urllib.request

UA = {"User-Agent": "arch-practice/arrival (public data, unauthenticated)"}
R_KM = 6371.0

# The same preference `build.py` holds, in the same order.
FELT_FILES = ("dyfi_geo_1km.geojson", "dyfi_geo_10km.geojson")

BANDS = ((1.00, 1.25), (1.25, 1.50), (1.50, 2.00),
         (2.00, 3.00), (3.00, 5.00), (5.00, float("inf")))


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=180) as r:
        return r.read().decode("utf-8")


def cached(url, cache, eid):
    key = url.rsplit("/", 3)[-3:]
    path = os.path.join(cache, "geo-" + eid + "-" + "_".join(key))
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return f.read()
    raw = get(url)
    with open(path, "w", encoding="utf-8") as f:
        f.write(raw)
    return raw


def gc_km(lat1, lon1, lat2, lon2):
    """Great-circle distance, on the sphere `build.py` computes on."""
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lon2 - lon1)
    a = (math.sin(dp / 2) ** 2
         + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2)
    return 2 * R_KM * math.asin(min(1.0, math.sqrt(a)))


def outline_centre(geom):
    """The centre of a published outline — `build.py`'s rule, kept."""
    if not geom:
        return None
    t = geom.get("type")
    if t == "Polygon":
        rings = [geom["coordinates"][0]]
    elif t == "MultiPolygon":
        rings = [p[0] for p in geom["coordinates"]]
    else:
        return None
    pts = [pt for ring in rings for pt in ring]
    if not pts:
        return None
    return (sum(p[1] for p in pts) / len(pts),
            sum(p[0] for p in pts) / len(pts))


class Fen:
    """Counts of quantity-ranks, so a pair count does not cost a pair."""

    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)

    def add(self, i, d):
        i += 1
        while i <= self.n:
            self.t[i] += d
            i += i & -i

    def upto(self, i):
        """How many stand at rank <= i (i is 0-based, inclusive)."""
        s, i = 0, i + 1
        while i > 0:
            s += self.t[i]
            i -= i & -i
        return s


def last_felt_version(detail_json):
    prods = detail_json["properties"].get("products", {}).get("dyfi", [])
    if not prods:
        return None
    for p in sorted(prods, key=lambda p: -int(p["updateTime"])):
        c = p.get("contents", {})
        name = next((n for n in FELT_FILES if n in c), None)
        if name is None:
            continue
        pr = p["properties"]
        try:
            return {"url": c[name]["url"], "file": name,
                    "lat": float(pr["latitude"]), "lon": float(pr["longitude"]),
                    "pub": pr.get("eventsource"), "t": int(p["updateTime"])}
        except (KeyError, TypeError, ValueError):
            continue
    return None


def read_blocks(ver, cache, eid):
    raw = cached(ver["url"], cache, eid) if cache else get(ver["url"])
    out, no_outline = [], 0
    for b in json.loads(raw)["features"]:
        p = b["properties"]
        if p.get("dist") is None:
            continue
        c = outline_centre(b.get("geometry"))
        if c is None:
            no_outline += 1
            continue
        out.append((gc_km(ver["lat"], ver["lon"], c[0], c[1]),
                    float(p["cdi"]), int(p["nresp"])))
    return out, no_outline


def count_all(rows, qi):
    """Holds / fails / ties over every pair whose distances differ."""
    rows = sorted(rows, key=lambda r: r[0])
    vals = sorted({r[qi] for r in rows})
    rank = {v: i for i, v in enumerate(vals)}
    fen = Fen(len(vals))
    holds = fails = ties = 0
    i = 0
    n = len(rows)
    while i < n:
        j = i
        while j < n and rows[j][0] == rows[i][0]:
            j += 1
        for k in range(i, j):        # the farther block of every pair
            r = rank[rows[k][qi]]
            inserted = fen.upto(len(vals) - 1)
            le = fen.upto(r)
            lt = fen.upto(r - 1) if r else 0
            holds += inserted - le   # a nearer block strictly stronger
            fails += lt              # a nearer block strictly weaker
            ties += le - lt
        for k in range(i, j):
            fen.add(rank[rows[k][qi]], 1)
        i = j
    return holds, fails, ties


def count_bands(rows, qi):
    """The same three counts, split by how far apart the two blocks are.

    Sorted by distance, the blocks lying at ratio [a, b) from block j are a
    contiguous run of the order, and its two ends only ever move forward as j
    moves forward — so each band is one window that slides.
    """
    rows = sorted(rows, key=lambda r: r[0])
    d = [r[0] for r in rows]
    vals = sorted({r[qi] for r in rows})
    rank = {v: i for i, v in enumerate(vals)}
    n = len(rows)
    out = []
    for a, b in BANDS:
        fen = Fen(len(vals))
        holds = fails = ties = 0
        lo = hi = 0          # window is [lo, hi): the blocks currently counted
        for j in range(n):
            # nearer blocks i with d[j]/d[i] in [a, b)  and  d[i] < d[j]
            hi_bound = d[j] / a if a > 0 else float("inf")
            lo_bound = d[j] / b if b != float("inf") else 0.0
            while hi < n and d[hi] <= hi_bound and d[hi] < d[j]:
                fen.add(rank[rows[hi][qi]], 1)
                hi += 1
            while lo < hi and (d[lo] <= lo_bound or d[lo] >= d[j]):
                fen.add(rank[rows[lo][qi]], -1)
                lo += 1
            r = rank[rows[j][qi]]
            inside = fen.upto(len(vals) - 1)
            le = fen.upto(r)
            lt = fen.upto(r - 1) if r else 0
            holds += inside - le
            fails += lt
            ties += le - lt
        out.append((a, b, holds, fails, ties))
    return out


def pct(h, f):
    return (100.0 * h / (h + f)) if (h + f) else float("nan")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", required=True)
    ap.add_argument("--ids")
    ap.add_argument("--progress", action="store_true")
    ap.add_argument("--per-event", action="store_true")
    args = ap.parse_args()

    ids = [f[:-5] for f in sorted(os.listdir(args.cache))
           if f.endswith(".json")]
    if args.ids:
        with open(args.ids, encoding="utf-8") as f:
            ids = [ln.strip() for ln in f if ln.strip()]

    tot = {0: [0, 0, 0], 1: [0, 0, 0]}
    bands = {0: [[0, 0, 0] for _ in BANDS], 1: [[0, 0, 0] for _ in BANDS]}
    events = blocks_seen = dropped = 0
    no_geo = too_small = no_dyfi = 0
    per_event = []
    failed = []

    for n, eid in enumerate(ids, 1):
        if args.progress and n % 20 == 0:
            print(f"  .. {n}/{len(ids)}", file=sys.stderr)
        path = os.path.join(args.cache, eid + ".json")
        if not os.path.exists(path):
            failed.append((eid, "no cached detail"))
            continue
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        if not d["properties"].get("products", {}).get("dyfi"):
            no_dyfi += 1
            continue
        ver = last_felt_version(d)
        if ver is None:
            # The event's felt record exists but no version of it publishes a
            # geocoded file — there is nothing here to place on a distance.
            no_geo += 1
            continue
        try:
            rows, no_outline = read_blocks(ver, args.cache, eid)
        except Exception as e:                        # noqa: BLE001
            failed.append((eid, f"{type(e).__name__}: {e}"))
            continue
        if len(rows) < 2:
            too_small += 1
            continue
        events += 1
        blocks_seen += len(rows)
        dropped += no_outline
        row = {"id": eid, "n": len(rows), "file": ver["file"], "pub": ver["pub"]}
        for qi, key in ((1, "cdi"), (2, "nresp")):
            h, f_, t = count_all(rows, qi)
            tot[qi - 1][0] += h
            tot[qi - 1][1] += f_
            tot[qi - 1][2] += t
            row[key] = (h, f_, t)
            for bi, (_a, _b, bh, bf, bt) in enumerate(count_bands(rows, qi)):
                bands[qi - 1][bi][0] += bh
                bands[qi - 1][bi][1] += bf
                bands[qi - 1][bi][2] += bt
        per_event.append(row)

    print(f"events in the list         : {len(ids)}")
    print(f"  no felt record            : {no_dyfi}")
    print(f"  felt record, none geocoded: {no_geo}")
    print(f"  geocoded, under 2 blocks  : {too_small}")
    print(f"events measured            : {events}")
    print(f"blocks                     : {blocks_seen}")
    print(f"blocks dropped, no outline : {dropped}")
    if failed:
        print(f"events not measured        : {len(failed)}")
        for eid, why in failed:
            print(f"    {eid}: {why}")

    for qi, label, key in ((0, "intensity", "cdi"), (1, "reporters", "nresp")):
        h, f_, t = tot[qi]
        print(f"\nnearer the epicentre is stronger — {label}")
        print(f"  pooled over every pair in the population:")
        print(f"    holds on {h} of {h + f_} untied pairs "
              f"({pct(h, f_):.1f} %), {t} tied")
        # A pooled figure counts pairs, and an event contributes pairs as the
        # square of its blocks — so the biggest record can be most of the
        # population's arithmetic while being one of its events. The share is
        # printed beside the figure rather than left for a reader to derive.
        share = sorted((r[key][0] + r[key][1] for r in per_event), reverse=True)
        untied = sum(share)
        if untied:
            print(f"    the largest event is {100.0 * share[0] / untied:.1f} %"
                  f" of those pairs; the largest two, "
                  f"{100.0 * sum(share[:2]) / untied:.1f} %")
        # The event-weighted figure: one event, one number, ties excluded per
        # event. It answers a different question and both are reported.
        per = sorted(pct(r[key][0], r[key][1]) for r in per_event
                     if r[key][0] + r[key][1])
        if per:
            mid = len(per) // 2
            med = per[mid] if len(per) % 2 else (per[mid - 1] + per[mid]) / 2
            print(f"  one event, one number ({len(per)} events order at least "
                  f"one pair):")
            print(f"    median {med:.1f} %, "
                  f"quartiles {per[len(per) // 4]:.1f} % / "
                  f"{per[3 * len(per) // 4]:.1f} %, "
                  f"range {per[0]:.1f} % .. {per[-1]:.1f} %")
            print(f"    events below 50 %: {sum(1 for x in per if x < 50)}; "
                  f"below 60 %: {sum(1 for x in per if x < 60)}")
        print("  by separation (farther / nearer), pooled:")
        for bi, (a, b) in enumerate(BANDS):
            bh, bf, bt = bands[qi][bi]
            name = f"{a:.2f}-{b:.2f}x" if b != float("inf") else f"{a:.2f}x+"
            print(f"    {name:>12s}  {pct(bh, bf):5.1f} %  "
                  f"on {bh + bf:9d} untied pairs, {bt:9d} tied")

    if args.per_event:
        print("\nper event: id, blocks, file, publisher, "
              "intensity holds/untied, reporters holds/untied")
        for r in sorted(per_event, key=lambda r: -r["n"]):
            h, f_, _t = r["cdi"]
            h2, f2, _t2 = r["nresp"]
            print(f"  {r['id']:16s} {r['n']:6d} {r['file'][9:14]:6s} "
                  f"{str(r['pub']):4s} "
                  f"{pct(h, f_):5.1f} % of {h + f_:9d}   "
                  f"{pct(h2, f2):5.1f} % of {h2 + f2:9d}")


if __name__ == "__main__":
    main()
