#!/usr/bin/env python3
"""Session 19's jolt-and-drift claim, run against the population instead of two events.

On 2026-08-31 this practice measured, on the two events this work was then built
on, that the felt record never recomputes: over 79 published transitions on Japan
and 36 on Peru there were **0 intensity changes at an unchanged reporter count**.
It also reported that a jolt moves exactly one block (11 of 13 jolts), that the
size of a jolt is fixed by how crowded the intensity scale is where the block
landed (18 of 18 exact), that very little of either record is ever revised at all
(15 of 129 blocks, 5 of 53), and that no block ever crossed a reporter cut
outward. Every protocol since 2026-09-05 has listed that finding as still resting
on three events; session 29 ran the other ordering claim against the population
and left this one named as the last untested. This is that pass.

The rule, kept as close to session 19's as a population allows:

  * the population is the fixed one (`probe.py`), and every event in it whose
    felt record publishes two or more versions carrying a geocoded file is
    measured — nothing sampled, no event capped;
  * a *version* is one published `dyfi` product, ordered by `updateTime`, as
    `probe.py` orders them;
  * a *block* is identified by the geocoded box the record names it with (the
    UTM cell), and carries the intensity and the reporter count that version
    published for it. Those are the three fields `build.py` reads from the
    felt file — `name`, `cdi`, `nresp`;
  * a *transition* is a consecutive pair of versions, restricted to the blocks
    present in both: a block that has just appeared cannot have moved, and one
    that has been withdrawn cannot move again. A large minority of published
    `dyfi` versions carry no geocoded file at all — an empty `contents` — and
    such a version is a *gap*, not a version with no blocks: the run breaks
    there rather than comparing across it, which costs transitions and invents
    none. The count of them is printed, because the difference between the
    transitions this rule measures and the consecutive pairs `probe.py` counts
    is exactly that;
  * a *jolt* is a transition at which at least one shared block is published at
    a different intensity. A jolt is *reversing* where at least one pair of
    shared blocks changes which of the two the record puts higher. Session 19's
    two tables count jolts the two different ways without saying so, which is
    why both counts are printed here.

Three things the population forces that two events did not:

  * **the grid.** A version publishes its geocoding at 1 km, at 10 km, or at
    both, and `build.py` prefers the finer. Two consecutive versions published
    at different grids are not comparable block by block, and such transitions
    are counted and excluded rather than silently compared;
  * **the seam.** Where two publishers publish a felt record of the same ground
    under one event id (session 26–28), a transition across the crossing
    compares two different records. Those transitions are counted separately
    and the headline claim is reported both with and without them;
  * **the reading.** The geocoded files are read from the published `cdi_geo`
    text tables rather than from the geojson `build.py` draws from, because
    the felt history of one event in this population runs to half a gigabyte of
    geojson and the same data as text runs to a ninth of it. The two carry the
    same blocks with the same values; `--verify-grid` checks that on the last
    version of every event it reads, and the ledger of the session that ran this
    quotes the result. Where a version publishes the geojson and not the text,
    the geojson is read instead and that is counted.

One thing the population forced on the instrument itself, recorded because it
changed the measurement rather than only its speed: read one version at a time,
this rule needs about ten hours for the 5 907 transitions of this population,
because almost all of that time is spent waiting on a request rather than
computing. The versions of one event are therefore fetched through a small
window of parallel requests — `--workers`, eight by default — and consumed
strictly in published order, so that the arithmetic is the arithmetic of a
serial read and only the waiting overlaps. The window is deliberately small: a
public endpoint is not this practice's to saturate.

Usage:

    python3 jolts.py --cache DIR [--progress] [--verify-grid] [--workers N]
                     [--only ID ...]

`--cache` is the directory `probe.py --cache` filled with each event's detail
JSON; the geocoded files themselves are streamed and not kept, because keeping
them is what makes this measurement impossible. Writes nothing into the
repository. What it prints is what a ledger quotes.
"""

import argparse
import bisect
import collections
import concurrent.futures
import json
import os
import statistics
import sys
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from probe import catalogue, detail, publisher  # noqa: E402

UA = {"User-Agent": "arch-practice/arrival (public data, unauthenticated)"}

# The files a felt version may publish its geocoding in, in the order this rule
# reads them: the finest text first, then the geojson `build.py` draws from, then
# the publisher's default text, then the coarse geojson.
#
# **The grid a file holds is read off the data and never off the file name.** The
# first pass of this rule on 2026-09-16 paired `cdi_geo.txt` with
# `dyfi_geo_10km.geojson` on the strength of their names, and the check below
# reported 177 blocks of 10 138 disagreeing. They do not disagree: `cdi_geo.txt`
# is the publisher's *default* grid, which on a small event is the 1 km one, and
# the two files were being compared across two cell sizes. The record says which
# grid a block is on — it is the last number inside the box name — so that is
# what decides it here.
FELT_FILES = ("cdi_geo_1km.txt", "dyfi_geo_1km.geojson",
              "cdi_geo.txt", "cdi_geo_10km.txt", "dyfi_geo_10km.geojson")


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=180) as r:
        return r.read().decode("utf-8", "replace")


def split_csv(line):
    """One row of a cdi_geo file: quoted fields may themselves hold commas."""
    out, cur, q = [], [], False
    for ch in line:
        if ch == '"':
            q = not q
        elif ch == "," and not q:
            out.append("".join(cur))
            cur = []
        else:
            cur.append(ch)
    out.append("".join(cur))
    return out


def blocks_from_txt(raw):
    """name -> (intensity, reporters), from a published cdi_geo file."""
    out = {}
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        f = split_csv(line)
        if len(f) < 3:
            continue
        try:
            out[f[0]] = (float(f[1]), int(float(f[2])))
        except ValueError:
            continue
    return out


def blocks_from_geojson(raw):
    """The same three fields, read where `build.py` reads them."""
    out = {}
    for ft in json.loads(raw).get("features", []):
        p = ft.get("properties", {})
        name = p.get("name")
        if name is None or p.get("cdi") is None:
            continue
        # The geojson pairs the box with a place name; the box is the identity,
        # and it is the part before the separator.
        box = name.split("<br>")[0]
        try:
            out[box] = (float(p["cdi"]), int(p.get("nresp") or 0))
        except (TypeError, ValueError):
            continue
    return out


def grid_of(blocks):
    """The cell size a set of published blocks is on, from their own names.

    A geocoded box is named `UTM:(<zone> <easting> <northing> <metres>)`, and the
    last of those numbers is the grid. Returned as that number, or None where the
    names do not say — a set on two grids at once returns the coarsest, because a
    comparison against it is only honest at the coarsest thing in it.
    """
    sizes = set()
    for name in blocks:
        tail = name.rstrip(")").rsplit(" ", 1)
        if len(tail) == 2 and tail[1].isdigit():
            sizes.add(int(tail[1]))
    return max(sizes) if sizes else None


def read_version(product):
    """One version's blocks and the grid they were published at.

    Returns (grid, source, blocks) or None where the version publishes no
    geocoded file at all. `grid` is read off the block names, not off the file
    name (see the note at FELT_FILES). `source` is 'txt' or 'geojson', so a
    session can say how much of its measurement came from which.
    """
    c = product.get("contents", {})
    for name in FELT_FILES:
        if name not in c:
            continue
        try:
            raw = get(c[name]["url"])
        except (urllib.error.URLError, OSError):
            continue
        blocks = (blocks_from_geojson(raw) if name.endswith("geojson")
                  else blocks_from_txt(raw))
        if not blocks:
            continue
        kind = "geojson" if name.endswith("geojson") else "txt"
        return grid_of(blocks), kind, blocks
    return None


def in_order(products, workers):
    """Every version's blocks, in published order, fetched through a window.

    The window is what makes this rule runnable at all (see the note above). It
    holds at most `workers` requests in flight, and yields strictly in the order
    the record published them, so nothing about the measurement depends on which
    request returned first.
    """
    if workers <= 1:
        for p in products:
            yield p, read_version(p)
        return
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as ex:
        pending = collections.deque()
        it = iter(products)
        for p in it:
            pending.append((p, ex.submit(read_version, p)))
            if len(pending) >= workers:
                break
        while pending:
            p, fut = pending.popleft()
            try:
                got = fut.result()
            except Exception:          # a refusal is a version not read
                got = None
            nxt = next(it, None)
            if nxt is not None:
                pending.append((nxt, ex.submit(read_version, nxt)))
            yield p, got


def felt_versions(detail_json):
    prods = detail_json["properties"].get("products", {}).get("dyfi", [])
    return sorted(prods, key=lambda p: int(p["updateTime"]))


def reversals(moved_from, moved_to, others):
    """The pairs one moved block reverses against the blocks that stood still.

    Two counts, and session 19 reported them as agreeing 18 of 18 times:

      * `flipped` — pairs whose intensity ordering changed sign, ties excluded
        at both ends;
      * `between` — pairs formed with a block standing strictly between the two
        intensities.

    They are computed independently here so that a session can see for itself
    whether the agreement is a measurement or an identity.
    """
    lo, hi = min(moved_from, moved_to), max(moved_from, moved_to)
    flipped = between = 0
    for c in others:
        a = (moved_from > c) - (moved_from < c)
        b = (moved_to > c) - (moved_to < c)
        if a and b and a != b:
            flipped += 1
        if lo < c < hi:
            between += 1
    return flipped, between


def reverses_anything(prev, now, shared, moved):
    """Does this transition change which of any two blocks the record puts higher?

    A pair can only change order if one of its two blocks moved, so the search
    is over the moved blocks and not over the pairs. Against a block that stood
    still the test is whether its intensity lies strictly between the mover's
    two values — a lookup in the sorted intensities of the blocks that did not
    move. Against another mover the two signs are compared directly; there are
    never many movers in one transition.
    """
    movers = {n for n, _a, _b in moved}
    still = sorted(now[n][0] for n in shared if n not in movers)
    for _n, a, b in moved:
        lo, hi = (a, b) if a < b else (b, a)
        if bisect.bisect_left(still, hi) - bisect.bisect_right(still, lo) > 0:
            return True
    for i, (_n, a0, a1) in enumerate(moved):
        for _m, b0, b1 in moved[i + 1:]:
            s0 = (a0 > b0) - (a0 < b0)
            s1 = (a1 > b1) - (a1 < b1)
            if s0 and s1 and s0 != s1:
                return True
    return False


def measure_event(eid, prods, verify_grid=False, workers=8):
    """Session 19's rule over one event's whole published felt history."""
    st = {
        "id": eid, "versions": len(prods), "read": 0, "transitions": 0,
        "grid_switches": 0, "crossings": 0, "unreadable": 0,
        "from_txt": 0, "from_geojson": 0,
        "jolts": 0, "jolts_one_block": 0, "jolts_reversing": 0,
        "moves": 0, "moves_unchanged_reporters": 0,
        "reporter_drops": 0, "flip_eq_between": 0, "flip_ne_between": 0,
        "single_moves": 0,
        "blocks_last": 0, "blocks_ever": 0, "blocks_revised": 0,
        "by_reporter_step": collections.defaultdict(list),
        "offenders": [], "drops": [],
    }
    prev = prev_grid = prev_pub = None
    ever = {}
    revised = set()
    for p, got in in_order(prods, workers):
        if got is None:
            st["unreadable"] += 1
            prev = None          # a gap is not a transition
            continue
        grid, source, blocks = got
        st["read"] += 1
        st["from_txt" if source == "txt" else "from_geojson"] += 1
        pub = publisher(p)
        for name, (cdi, _n) in blocks.items():
            if name in ever and ever[name] != cdi:
                revised.add(name)
            ever[name] = cdi
        if prev is not None:
            if grid != prev_grid:
                st["grid_switches"] += 1
            else:
                crossing = pub != prev_pub
                if crossing:
                    st["crossings"] += 1
                st["transitions"] += 1
                shared = prev.keys() & blocks.keys()
                moved = [(n, prev[n][0], blocks[n][0]) for n in shared
                         if prev[n][0] != blocks[n][0]]
                quiet = [m for m in moved if prev[m[0]][1] == blocks[m[0]][1]]
                drops = [n for n in shared if blocks[n][1] < prev[n][1]]
                st["moves"] += len(moved)
                st["moves_unchanged_reporters"] += len(quiet)
                st["reporter_drops"] += len(drops)
                if quiet:
                    st["offenders"].append(
                        (int(p["updateTime"]), crossing,
                         [(n, a, b, prev[n][1]) for n, a, b in quiet][:4],
                         len(quiet)))
                if drops:
                    st["drops"].append(
                        (int(p["updateTime"]), crossing,
                         [(n, prev[n][1], blocks[n][1]) for n in drops][:4],
                         len(drops)))
                for n in shared:
                    n0, n1 = prev[n][1], blocks[n][1]
                    if n1 > n0:
                        st["by_reporter_step"][(n0, n1)].append(
                            abs(blocks[n][0] - prev[n][0]))
                if moved:
                    st["jolts"] += 1
                    if reverses_anything(prev, blocks, shared, moved):
                        st["jolts_reversing"] += 1
                    if len(moved) == 1:
                        st["jolts_one_block"] += 1
                        st["single_moves"] += 1
                        name, a, b = moved[0]
                        others = [blocks[n][0] for n in shared if n != name]
                        f, w = reversals(a, b, others)
                        st["flip_eq_between" if f == w
                           else "flip_ne_between"] += 1
        prev, prev_grid, prev_pub = blocks, grid, pub

    st["blocks_last"] = len(prev) if prev else 0
    st["blocks_ever"] = len(ever)
    st["blocks_revised"] = len(revised)

    if verify_grid and prods:
        st["verify"] = verify_last(prods[-1])
    return st


def verify_last(product):
    """The text and the geojson of one version, read against each other.

    The claim the economy rests on: `cdi_geo_1km.txt` and `dyfi_geo_1km.geojson`
    carry the same blocks with the same intensity and the same reporter count.
    Returned as (blocks, disagreements) or None where the version publishes only
    one of the pair.
    """
    c = product.get("contents", {})
    geo = next((n for n in ("dyfi_geo_1km.geojson", "dyfi_geo_10km.geojson")
                if n in c), None)
    if geo is None:
        return None
    b = blocks_from_geojson(get(c[geo]["url"]))
    want = grid_of(b)
    for name in ("cdi_geo_1km.txt", "cdi_geo.txt", "cdi_geo_10km.txt"):
        if name not in c:
            continue
        a = blocks_from_txt(get(c[name]["url"]))
        if grid_of(a) != want:
            # Not a disagreement: a different cell size. Compared, it would
            # report every block on both sides as missing from the other.
            continue
        bad = sum(1 for k in a.keys() | b.keys() if a.get(k) != b.get(k))
        return len(a.keys() | b.keys()), bad
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache")
    ap.add_argument("--progress", action="store_true")
    ap.add_argument("--verify-grid", action="store_true")
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--only", nargs="*")
    args = ap.parse_args()

    ids = args.only or [f["id"] for f in catalogue()]
    print(f"events offered: {len(ids)}")

    agg = collections.Counter()
    steps = collections.defaultdict(list)
    per_event = []
    verified = [0, 0, 0]
    measured = 0

    for n, eid in enumerate(ids, 1):
        if args.progress and n % 10 == 0:
            print(f"  .. {n}/{len(ids)}  {agg['transitions']} transitions",
                  file=sys.stderr)
        d = detail(eid, args.cache)
        prods = felt_versions(d)
        if len(prods) < 2:
            continue
        st = measure_event(eid, prods, args.verify_grid, args.workers)
        if st["transitions"] == 0:
            continue
        measured += 1
        per_event.append(st)
        for k, v in st.items():
            if isinstance(v, int):
                agg[k] += v
        for k, v in st["by_reporter_step"].items():
            steps[k].extend(v)
        if st.get("verify"):
            verified[0] += 1
            verified[1] += st["verify"][0]
            verified[2] += st["verify"][1]

    print(f"events measured (>=2 comparable versions): {measured}")
    print(f"versions read   : {agg['read']}"
          f"  (txt {agg['from_txt']}, geojson {agg['from_geojson']},"
          f" unreadable {agg['unreadable']})")
    print(f"transitions     : {agg['transitions']}"
          f"  (grid switches excluded {agg['grid_switches']};"
          f" publisher crossings included {agg['crossings']})")

    print("\n-- the claim: the publisher does not recompute")
    print(f"  block moves                          : {agg['moves']}")
    print(f"  of them at an unchanged reporter count: "
          f"{agg['moves_unchanged_reporters']}")
    off = [e for e in per_event if e["moves_unchanged_reporters"]]
    print(f"  events showing one or more            : {len(off)} of {measured}")
    for e in sorted(off, key=lambda e: -e["moves_unchanged_reporters"])[:12]:
        print(f"    {e['id']:16s} {e['moves_unchanged_reporters']:6d} of "
              f"{e['moves']:6d} moves, {e['transitions']:4d} transitions, "
              f"{e['crossings']:3d} crossing(s)")
        for t, cross, sample, tot in e["offenders"][:2]:
            tag = "across a crossing" if cross else "inside one publisher"
            print(f"      v@{t} {tag}, {tot} block(s), e.g. "
                  + "; ".join(f"{n} {a}->{b} at {r} reporter(s)"
                              for n, a, b, r in sample))

    print("\n-- the claim: a jolt is one block")
    j, j1 = agg["jolts"], agg["jolts_one_block"]
    print(f"  transitions moving >=1 block          : {j}")
    print(f"  of them reversing >=1 pair            : {agg['jolts_reversing']}")
    print(f"  moving exactly one block              : {j1}"
          f" ({100.0 * j1 / j:.1f} %)" if j else "")
    ev = [(e["jolts_one_block"], e["jolts"]) for e in per_event if e["jolts"]]
    shares = [100.0 * a / b for a, b in ev]
    if shares:
        shares.sort()
        print(f"  events with a jolt                    : {len(shares)}")
        print(f"  one-block share, median over events   : "
              f"{statistics.median(shares):.1f} %"
              f"  (quartiles {shares[len(shares)//4]:.1f} %, "
              f"{shares[3*len(shares)//4]:.1f} %)")

    print("\n-- the claim: a jolt's size is where it landed, not how far it moved")
    print(f"  single-block jolts                    : {agg['single_moves']}")
    print(f"  sign-flip count == strictly-between   : {agg['flip_eq_between']}")
    print(f"  disagreeing                           : {agg['flip_ne_between']}")

    print("\n-- the claim: no block ever crosses a reporter cut outward")
    print(f"  shared blocks losing reporters        : {agg['reporter_drops']}")
    drops = [e for e in per_event if e["reporter_drops"]]
    print(f"  events showing one or more            : {len(drops)}")
    for e in sorted(drops, key=lambda e: -e["reporter_drops"])[:8]:
        print(f"    {e['id']:16s} {e['reporter_drops']:6d} drop(s), "
              f"{e['crossings']:3d} crossing(s)")
        for t, cross, sample, tot in e["drops"][:1]:
            tag = "across a crossing" if cross else "inside one publisher"
            print(f"      v@{t} {tag}, {tot} block(s), e.g. "
                  + "; ".join(f"{n} {a}->{b}" for n, a, b in sample))

    print("\n-- the claim: very little of the record is ever revised")
    print(f"  blocks ever published                 : {agg['blocks_ever']}")
    print(f"  ever published at two intensities     : {agg['blocks_revised']}"
          f" ({100.0 * agg['blocks_revised'] / agg['blocks_ever']:.1f} %)"
          if agg["blocks_ever"] else "")
    sh = sorted(100.0 * e["blocks_revised"] / e["blocks_ever"]
                for e in per_event if e["blocks_ever"])
    if sh:
        print(f"  per-event share, median               : "
              f"{statistics.median(sh):.1f} %"
              f"  (quartiles {sh[len(sh)//4]:.1f} %, {sh[3*len(sh)//4]:.1f} %,"
              f" max {sh[-1]:.1f} %)")

    print("\n-- the claim: the second reporter is where it happens")
    print("  step      blocks   changed   median |d|   max |d|")
    for k in sorted(steps, key=lambda k: (k[0], k[1]))[:12]:
        v = steps[k]
        nz = [x for x in v if x > 0]
        med = statistics.median(nz) if nz else 0.0
        print(f"  {k[0]:3d}->{k[1]:-3d} {len(v):9d} {len(nz):9d} "
              f"{med:11.2f} {max(v) if v else 0:9.2f}")

    if args.verify_grid and verified[0]:
        print(f"\n-- text against geojson, last version of {verified[0]} event(s)")
        print(f"  blocks compared                       : {verified[1]}")
        print(f"  disagreeing on intensity or reporters : {verified[2]}")


if __name__ == "__main__":
    main()
