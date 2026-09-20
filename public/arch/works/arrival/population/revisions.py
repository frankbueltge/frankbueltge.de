#!/usr/bin/env python3
"""Session 22's revision-and-control pass, written down.

Session 22 (2026-09-04) corrected two of this practice's published claims about
what a revision of the arrival record does, over 84 events and 139 testable
revisions. Session 23 re-ran the same survey from an implementation written that
day and reproduced it. Neither implementation was committed. Session 29 named
that debt as item 4 of `ledger/2026-09-13-session-29-...` §8 and could not
discharge it; sessions 30, 31 and 32 carried it forward as "still minor", twice
citing MEOT 110 against it and discharging it never.

This file is that rule, in the repository, re-runnable. It writes nothing here
and prints what a ledger quotes.

The rule, as session 22 fixed it before seeing any result:

  * population — every catalogue event with M >= 5.0 whose origin falls in
    [2026-06-01T00:00Z, 2026-08-15T00:00Z); nothing sampled. The same window
    `probe.py` uses;
  * revision — a consecutive pair of published `phase-data` versions ordered by
    publication instant (`updateTime`). Its *age* is the second version's
    publication instant minus the event's origin instant;
  * early = age < 1 day; late = age >= 5 days; the 1-5 day band is reported and
    not tested;
  * tested population — every event carrying at least one early revision AND at
    least one late one, so the comparison is within an event, not across events;
  * a pick's identity is its station and the phase it is a pick of, which is
    `works/arrival/iteration-11/build.py`'s identity and the one session 22
    used. Where one version publishes that name twice, the last occurrence wins
    (the rule iteration 17 fixed for the work itself) and the collision is
    counted and printed;
  * a pick is *re-picked* by a revision when the arrival instant published for
    it differs between the two versions;
  * test — over the picks the two versions share, the median per-pick change in
    the published |time residual| among the re-picked ones, against N random
    subsets of the same size drawn from all shared picks. A revision is testable
    when it re-picks at least one shared pick.

**Where the ledgers do not fix the rule, this file chooses and says so.** Two
places, both found on 2026-09-20 by running this file against what session 22
published:

  * session 22 reports a paired comparison "within each of the 48 events that
    carry both" without saying how an event carrying several revisions of one
    age contributes one number. This file takes the median within the event,
    per age, and prints the choice with the result;
  * "picks added by the revision" has two readings — the pick names new in the
    later version, and the net change in the version's pick count — and over the
    same closed set of 70 testable early revisions they differ by 9.5 picks.
    Session 22's published +24 is the second. This file prints both and calls
    neither the right one.

That the prose of two ledgers does not determine a published figure uniquely is
itself what writing the rule down is for.

**What this test cannot see, found on 2026-09-20 by running it.** Under the pick
identity above, two publishers' arrival records of one earthquake share **no
pick at all** — on `hv75018296` the `hv` record names HV, IU, NP and PT and the
`us` record names AK, AV, BK and CI. So a pair of versions that crosses from one
publisher to the other has zero shared picks **by construction** and is never
testable. Six of the seven events that contribute nothing to the pass are
multi-publisher events for exactly this reason. Everything this practice has
published about what a revision does is therefore about revisions **inside one
publisher's record**; the crossings `probe.py` counts are outside this test's
reach, and no protocol said so before today.

Usage:

    python3 revisions.py [--cache DIR] [--draws N] [--seed N] [--progress]

`--cache` keeps each event's detail JSON and each version's QuakeML so a second
pass of the same day does not re-fetch them. The QuakeML of the tested events is
some hundreds of documents; the detail JSONs are 491 and are shared with
`probe.py`, which writes them into the same directory under the same names.
"""

import argparse
import datetime as dt
import hashlib
import json
import os
import random
import statistics
import sys
import urllib.request
import xml.etree.ElementTree as ET

FDSN = "https://earthquake.usgs.gov/fdsnws/event/1/query"
UA = {"User-Agent": "arch-practice/arrival (public data, unauthenticated)"}
BED = "{http://quakeml.org/xmlns/bed/1.2}"

START = "2026-06-01T00:00:00"
END = "2026-08-15T00:00:00"
MINMAG = 5.0

EARLY_MAX_D = 1.0    # age < 1 day
LATE_MIN_D = 5.0     # age >= 5 days


def get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=300) as r:
        raw = r.read()
    return raw if binary else raw.decode("utf-8")


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


def quakeml(url, cache=None):
    """One published version's QuakeML, read as `build.py` reads it."""
    path = None
    if cache:
        # The url names the version; the digest is only a filename, so it is
        # taken of the url itself and is stable across runs.
        digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
        path = os.path.join(cache, f"qml-{digest}.xml")
        if os.path.exists(path):
            with open(path, "rb") as f:
                return f.read()
    raw = get(url, binary=True)
    if path:
        os.makedirs(cache, exist_ok=True)
        with open(path, "wb") as f:
            f.write(raw)
    return raw


def read_picks(raw):
    """Every pick of one version, by (station, phase). Last occurrence wins.

    Returns the map and the number of names the version published twice.
    """
    root = ET.fromstring(raw)
    picks = {p.get("publicID"): p for p in root.findall(".//" + BED + "pick")}
    out, collisions = {}, 0
    for arrival in root.findall(".//" + BED + "arrival"):
        pid = arrival.findtext(BED + "pickID")
        deg = arrival.findtext(BED + "distance")
        res = arrival.findtext(BED + "timeResidual")
        pick = picks.get(pid)
        if pick is None or not deg or res is None:
            # A pick with no published residual cannot be filtered by one and
            # is not given a favourable value; it is dropped, as in build.py.
            continue
        instant = pick.find(BED + "time/" + BED + "value").text
        wf = pick.find(BED + "waveformID")
        key = (f"{wf.get('networkCode')}.{wf.get('stationCode')}",
               arrival.findtext(BED + "phase") or "")
        if key in out:
            collisions += 1
        out[key] = {"deg": float(deg), "res": float(res), "t": instant}
    return out, collisions


def median(xs):
    return statistics.median(xs) if xs else None


def tails(observed, pool, n, draws, rng):
    """P(random <= obs) and P(random >= obs) over `draws` subsets of size n."""
    if n <= 0 or n > len(pool):
        return None, None
    le = ge = 0
    for _ in range(draws):
        m = statistics.median(rng.sample(pool, n))
        if m <= observed:
            le += 1
        if m >= observed:
            ge += 1
    return le / draws, ge / draws


def test_revision(before, after, draws, rng):
    """One consecutive pair, under session 22's test. None when untestable."""
    shared = [k for k in after if k in before]
    if not shared:
        return None
    delta = {k: abs(after[k]["res"]) - abs(before[k]["res"]) for k in shared}
    repicked = [k for k in shared if after[k]["t"] != before[k]["t"]]
    rest = [k for k in shared if k not in set(repicked)]
    row = {
        "shared": len(shared),
        "repicked": len(repicked),
        "share": len(repicked) / len(shared),
        "added": len(after) - len(shared),
        # Session 22 published "picks added by the revision (median)" and its
        # ledger does not say which of two readings it is. Run on 2026-09-20
        # over the same closed set of 70 testable early revisions, the count of
        # pick names *new* in the later version returns a median of 33.5 and
        # the *net* change in the version's pick count returns 24.0, which is
        # the figure session 22 published. Both are printed from here on, and
        # neither is called the right one: the difference is 9.5 picks and the
        # prose of two ledgers does not decide it.
        "net": len(after) - len(before),
        "rest_med": median([delta[k] for k in rest]),
        "deg_repicked": median([before[k]["deg"] for k in repicked]),
        "deg_rest": median([before[k]["deg"] for k in rest]),
        "res_repicked": median([abs(before[k]["res"]) for k in repicked]),
        "res_rest": median([abs(before[k]["res"]) for k in rest]),
    }
    if not repicked:
        row["med"] = None
        return row
    row["med"] = median([delta[k] for k in repicked])
    pool = [delta[k] for k in shared]
    row["p_le"], row["p_ge"] = tails(row["med"], pool, len(repicked),
                                     draws, rng)
    return row


def sign_test(diffs, draws, rng):
    """Median of the paired differences against `draws` sign-flip draws."""
    obs = median(diffs)
    le = ge = 0
    for _ in range(draws):
        m = median([d if rng.random() < 0.5 else -d for d in diffs])
        if m <= obs:
            le += 1
        if m >= obs:
            ge += 1
    return obs, sum(1 for d in diffs if d > 0), len(diffs), ge / draws, le / draws


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache")
    ap.add_argument("--draws", type=int, default=20000)
    ap.add_argument("--seed", type=int, default=20260920)
    ap.add_argument("--progress", action="store_true")
    ap.add_argument("--limit", type=int,
                    help="stop after N tested events; a partial pass, and any "
                         "ledger quoting it must say so")
    args = ap.parse_args()
    rng = random.Random(args.seed)

    pop = catalogue()
    print(f"population: {len(pop)} events, M >= {MINMAG}, "
          f"[{START}Z, {END}Z)")
    print(f"control: {args.draws} draws, seed {args.seed}")

    # Pass one: the version lists, and the ages of every revision.
    events = {}
    n_product = n_multi = 0
    ages = {"early": [], "mid": [], "late": []}
    for n, f in enumerate(pop, 1):
        eid = f["id"]
        t0 = f["properties"]["time"]
        if args.progress and n % 50 == 0:
            print(f"  .. versions {n}/{len(pop)}", file=sys.stderr)
        d = detail(eid, args.cache)
        prods = d["properties"].get("products", {}).get("phase-data", [])
        if not prods:
            continue
        n_product += 1
        vs = sorted(prods, key=lambda p: int(p["updateTime"]))
        if len(vs) > 1:
            n_multi += 1
        revs = []
        for a, b in zip(vs, vs[1:]):
            age = (int(b["updateTime"]) - t0) / 86400000.0
            band = ("early" if age < EARLY_MAX_D
                    else "late" if age >= LATE_MIN_D else "mid")
            ages[band].append(age)
            revs.append({"a": a, "b": b, "age": age, "band": band})
        events[eid] = {"t0": t0, "revs": revs,
                       "mag": f["properties"].get("mag"),
                       "place": f["properties"].get("place")}

    n_late_events = sum(1 for e in events.values()
                        if any(r["band"] == "late" for r in e["revs"]))
    print(f"\nevents carrying the product : {n_product}")
    print(f"published more than once    : {n_multi}")
    print(f"early / middle / late       : {len(ages['early'])} / "
          f"{len(ages['mid'])} / {len(ages['late'])}")
    print(f"events with >= 1 late       : {n_late_events}")
    if ages["late"]:
        print(f"median age of a late rev.   : {median(ages['late']):.1f} d "
              f"(max {max(ages['late']):.1f} d)")

    tested = {eid: e for eid, e in events.items()
              if any(r["band"] == "early" for r in e["revs"])
              and any(r["band"] == "late" for r in e["revs"])}
    order = sorted(tested)
    if args.limit:
        order = order[:args.limit]
    n_versions = sum(len(tested[e]["revs"]) + 1 for e in order)
    print(f"\ntested population           : {len(order)} events, "
          f"{n_versions} published versions"
          + ("  [PARTIAL: --limit]" if args.limit else ""))

    # Pass two: the picks, revision by revision.
    rows = {"early": [], "mid": [], "late": []}
    by_event = {}
    read = repicked_nothing = 0
    collisions = 0
    empty_events = []
    for n, eid in enumerate(order, 1):
        if args.progress:
            print(f"  .. picks {n}/{len(order)} {eid}", file=sys.stderr)
        e = tested[eid]
        cache_v = {}
        for r in e["revs"]:
            pair = []
            for side in ("a", "b"):
                url = r[side]["contents"]["quakeml.xml"]["url"]
                if url not in cache_v:
                    p, c = read_picks(quakeml(url, args.cache))
                    cache_v[url] = p
                    collisions += c
                pair.append(cache_v[url])
            row = test_revision(pair[0], pair[1], args.draws, rng)
            read += 1
            if row is None:
                continue
            if row["med"] is None:
                repicked_nothing += 1
                continue
            row["event"] = eid
            rows[r["band"]].append(row)
            by_event.setdefault(eid, {}).setdefault(r["band"], []).append(row)
        if eid not in by_event:
            empty_events.append(eid)

    testable = sum(len(v) for v in rows.values())
    print(f"revisions read              : {read}")
    print(f"  re-picked nothing         : {repicked_nothing}")
    print(f"  testable                  : {testable}")
    print(f"  testable early/middle/late: {len(rows['early'])} / "
          f"{len(rows['mid'])} / {len(rows['late'])}")
    print(f"pick names published twice  : {collisions} (last wins)")
    for eid in empty_events:
        print(f"  contributed nothing       : {eid} "
              f"({tested[eid]['place']})")

    for band in ("early", "late"):
        rs = rows[band]
        if not rs:
            continue
        ev = len({r["event"] for r in rs})
        print(f"\n{band} (n = {len(rs)}, {ev} events)")
        print(f"  median of the per-revision median d|residual| : "
              f"{median([r['med'] for r in rs]):+.3f} s")
        print(f"  revisions whose median change is negative     : "
              f"{sum(1 for r in rs if r['med'] < 0)} / {len(rs)}")
        print(f"  P(random <= obs) <= 0.05                      : "
              f"{sum(1 for r in rs if r.get('p_le') is not None and r['p_le'] <= 0.05)}")
        print(f"  P(random >= obs) <= 0.05                      : "
              f"{sum(1 for r in rs if r.get('p_ge') is not None and r['p_ge'] <= 0.05)}")
        rest = [r["rest_med"] for r in rs if r["rest_med"] is not None]
        print(f"  median change among the picks not re-picked   : "
              + (f"{median(rest):+.3f} s" if rest
                 else "- (every shared pick was re-picked)"))
        print(f"  re-picked share of the shared picks (median)  : "
              f"{median([r['share'] for r in rs]):.3f}")
        print(f"  pick names new in the later version (median)  : "
              f"{median([r['added'] for r in rs]):+.1f}")
        print(f"  net change in the pick count (median)         : "
              f"{median([r['net'] for r in rs]):+.1f}   "
              f"<- session 22's \"picks added\"")
        res_rest = [r["res_rest"] for r in rs if r["res_rest"] is not None]
        deg_rest = [r["deg_rest"] for r in rs if r["deg_rest"] is not None]
        print(f"  median |residual| before, re-picked vs rest   : "
              f"{median([r['res_repicked'] for r in rs]):.3f} vs "
              + (f"{median(res_rest):.3f}" if res_rest else "-"))
        print(f"  median epicentral degrees, re-picked vs rest  : "
              f"{median([r['deg_repicked'] for r in rs]):.2f} vs "
              + (f"{median(deg_rest):.2f}" if deg_rest else "-"))

    # The paired comparison. An event carrying several revisions of one age
    # contributes the median of that age's revisions; see the head of this file.
    paired = [e for e, b in by_event.items() if "early" in b and "late" in b]
    print(f"\npaired within the {len(paired)} events carrying a testable "
          f"revision of each age")
    print("  (an event with several revisions of one age contributes that "
          "age's median;\n   the ledgers of sessions 22 and 23 do not fix "
          "this and this file does)")
    stats = (("median d|residual|", "med", "{:+.4f} s"),
             ("re-picked share", "share", "{:+.4f}"),
             ("picks added", "added", "{:+.1f}"),
             ("epicentral degrees of the re-picked", "deg_repicked", "{:+.2f}"))
    for label, key, fmt in stats:
        diffs = []
        for e in paired:
            lo = median([r[key] for r in by_event[e]["early"]])
            hi = median([r[key] for r in by_event[e]["late"]])
            diffs.append(hi - lo)
        obs, pos, n, p_ge, p_le = sign_test(diffs, args.draws, rng)
        print(f"  {label:38s} median {fmt.format(obs):>10s}  "
              f"positive {pos:3d} / {n:3d}  P(>=) {p_ge:.4f}  P(<=) {p_le:.4f}")


if __name__ == "__main__":
    main()
