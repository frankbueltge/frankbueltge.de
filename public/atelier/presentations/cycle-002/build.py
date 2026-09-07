#!/usr/bin/env python3
"""Builds data.json and index.html for the Atelier's cycle-002 presentation.

Protocol v7 §2: a cycle closes with one self-contained artifact and a plain-language
summary. This is the artifact. Every number on the page is computed here — from the
house's three feeds, read live and pinned by sha256 and never mirrored, and from the
four committed session records of this cycle, cited rather than retyped. `check.py`
reads the derived record back and fails until the prose agrees with it.

    python3 presentations/cycle-002/build.py             # reads the feeds live
    python3 presentations/cycle-002/build.py --from DIR  # a local copy of the feeds,
        # named atlas.json / papers-register.json / datasets.json. DIR is deliberately
        # outside this repository: the feeds are the house's and are cited, never
        # copied in. What is committed here is the derived record.
    python3 presentations/cycle-002/check.py             # the record against the page
    node presentations/cycle-002/verify.mjs              # the page in a real browser,
        # with scripting on and off (needs playwright-core and a chromium)

FORM, decided on the merits and named in a line, as the direction of 2026-09-03 asks.
The object of this presentation is **a number that was published as a point and is a
distribution**: on 2026-09-06 this practice told the house that a difference curve
travels 0.491 of the travel of the two curves it is built from, and a sibling then drew
two more values from the same quantity — 0.292 and 1.503 — which is how the point was
found out. So the central figure is that distribution with the published point standing
in it, and it is client-rendered and interactive for one specific reason: **dropping a
value into it is exactly the act that produced this session**, and a reader who cannot
repeat that act cannot check the finding. The still frame is complete — all 407 ratios
are drawn as points and every one of the 413 comparisons is in the document as a table
row — and the two supporting figures are static SVG in both modes.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import itertools
import json
import math
import pathlib
import statistics
import sys
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT / "tools" / "census"))

import dials as DL  # noqa: E402

DATE = "2026-09-07"
CYCLE = 2
SESSION = 5

FEEDS = [
    ("atlas", "https://frankbueltge.de/atlas/werke.json", "atlas.json",
     "the atlas of data art", ["decisive_move", "title", "venue_prize"]),
    ("papers", "https://frankbueltge.de/papers/register.json", "papers-register.json",
     "the paper register, full form", ["zusammenfassung", "titel", "relevanz"]),
    ("datasets", "https://frankbueltge.de/datasets/register.json", "datasets.json",
     "the data-source register", ["titel", "relevanz"]),
]

# The atlas digest this practice has now read on five consecutive nights (sessions 1-5
# of this cycle). Asserted in check.py so a drift is loud rather than silent.
ATLAS_SHA_SINCE_S1 = "a033aef59a4a0d397de02f57cd7db50bd44b075fe1756c6d3490355528c64a61"

# What session 4 read of the paper register, twenty-four hours before this run. Not a
# constant of the world: it is what the file was, and the difference is the point.
PAPERS_SHA_S4 = "3278e379c926e419ab4c1beddfbc39e6e454182733b673172a053010c8a5f49a"
PAPERS_ENTRIES_S4 = 1264

MIN_GROUP = 20

# The two values a sibling practice measured on its own two differences and published on
# 2026-09-06. They are read into this run as data, not as a claim: what is computed here
# is where they fall in this catalogue's distribution.
SIBLING_VALUES = (0.292, 1.503)
SIBLING_DATE = "2026-09-06"

# The sample sizes the detectability curve is computed at.
SAMPLE_SIZES = (5, 8, 11, 20, 50, 100, 200, 400, 800, 1600)

# check.py asserts it ran exactly this many; the page states it.
N_PROSE_CHECKS = 185


# --------------------------------------------------------------------------------- #
# Feeds
# --------------------------------------------------------------------------------- #


def read_feed(url: str, local: pathlib.Path | None) -> tuple[dict, str, str]:
    if local is not None:
        raw = local.read_bytes()
        origin = f"local copy of {url}"
    else:
        req = urllib.request.Request(url, headers={
            "User-Agent": "atelier-research-instrument (frankbueltge.de; contact via the site)"
        })
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read()
        origin = url
    return json.loads(raw.decode("utf-8")), hashlib.sha256(raw).hexdigest(), origin


# --------------------------------------------------------------------------------- #
# The geometry of a dialled statement — no free parameter anywhere in it
# --------------------------------------------------------------------------------- #


def geometry(curve: list[float], line: float) -> tuple[float, float]:
    """Half the travel of the curve, and the standoff of the line from its midpoint.

    A statement's verdict is constant across the grid exactly when the line lies outside
    the curve's range — that is, when the standoff exceeds the half-travel. Both are
    exact functions of the sweep. This is session 4's rule, carried unchanged.
    """
    lo, hi = min(curve), max(curve)
    return (hi - lo) / 2.0, abs((lo + hi) / 2.0 - line)


def cancellation(travel_diff: float, travel_a: float, travel_b: float) -> float | None:
    """How much of the dial's travel a difference cancels.

    rho = travel(a - b) / mean(travel(a), travel(b)). Since travel is a seminorm,
    travel(a - b) <= travel(a) + travel(b) = 2 * mean, so **0 <= rho <= 2 exactly**,
    with no assumption about the data and no free parameter. rho < 1 is cancellation;
    rho = 2 is the ceiling.
    """
    base = (travel_a + travel_b) / 2.0
    return None if base <= 0 else travel_diff / base


def build_statements(entries, feed, fields, min_group):
    """Every statement this feed supports, with the curve kept so nothing is re-derived
    from a rounded number later. Unrounded quantities are carried separately."""
    groups = DL.groupings(entries, exclude=set(fields))
    out, cells = [], []
    for field in fields:
        texts = [DL.as_text(r.get(field)) for r in entries]
        if not any(texts):
            continue
        for fam, (fam_label, fam_fn) in DL.FAMILIES.items():
            names, rows = fam_fn(texts)
            whole = DL._rates(rows, list(range(len(entries))))
            live = len(set(whole)) > 1 and min(whole) > 0.0 and max(whole) < 1.0
            cells.append({"feed": feed, "field": field, "family": fam,
                          "family_label": fam_label, "settings": names,
                          "live": live})
            if not live:
                continue
            buckets = [("(whole feed)", "all entries", list(range(len(entries))))]
            for gname, col in groups.items():
                by: dict[str, list[int]] = {}
                for i, v in enumerate(col):
                    if v:
                        by.setdefault(v, []).append(i)
                for gv, idx in sorted(by.items()):
                    if len(idx) >= min_group:
                        buckets.append((gname, gv, idx))
            rates = {(g, v): DL._rates(rows, idx) for g, v, idx in buckets}
            sizes = {(g, v): len(idx) for g, v, idx in buckets}

            for (gname, gv, _idx) in buckets:
                cur = rates[(gname, gv)]
                for cut in DL.LEVEL_CUTS:
                    verd = [1 if r > cut else 0 for r in cur]
                    r_, c_ = geometry(cur, cut)
                    out.append({
                        "kind": "level", "feed": feed, "field": field, "family": fam,
                        "grouping": gname, "a": gv, "b": None,
                        "na": sizes[(gname, gv)], "nb": None, "cut": cut,
                        "verdicts": verd, "survives": len(set(verd)) == 1,
                        "r": r_, "c": c_, "rho": None,
                    })
            for gname in sorted({b[0] for b in buckets if b[0] != "(whole feed)"}):
                members = [b for b in buckets if b[0] == gname]
                for (_, ga, _ia), (_, gb, _ib) in itertools.combinations(members, 2):
                    ra, rb = rates[(gname, ga)], rates[(gname, gb)]
                    diff = [x - y for x, y in zip(ra, rb)]
                    verd = [1 if d > 0 else (-1 if d < 0 else 0) for d in diff]
                    r_, c_ = geometry(diff, 0.0)
                    ta, tb = max(ra) - min(ra), max(rb) - min(rb)
                    out.append({
                        "kind": "comparison", "feed": feed, "field": field, "family": fam,
                        "grouping": gname, "a": ga, "b": gb,
                        "na": sizes[(gname, ga)], "nb": sizes[(gname, gb)], "cut": None,
                        "verdicts": verd, "survives": len(set(verd)) == 1,
                        "r": r_, "c": c_,
                        "travel_a": ta, "travel_b": tb,
                        "rho": cancellation(max(diff) - min(diff), ta, tb),
                    })
    return out, cells


# --------------------------------------------------------------------------------- #
# Standardisation — survival at matched standoff (session 4's control, carried)
# --------------------------------------------------------------------------------- #


def standardise(sts, bin_width=0.02):
    def b(x):
        return int(x / bin_width)

    lev = [s for s in sts if s["kind"] == "level"]
    cmp_ = [s for s in sts if s["kind"] == "comparison"]
    bins: dict[int, dict] = {}
    for s in lev + cmp_:
        d = bins.setdefault(b(s["c"]), {"level": [0, 0], "comparison": [0, 0]})
        d[s["kind"]][0] += int(s["survives"])
        d[s["kind"]][1] += 1
    num = den = 0.0
    matched = [s for s in cmp_ if bins[b(s["c"])]["level"][1] > 0]
    for _i, d in bins.items():
        w = d["comparison"][1]
        if w and d["level"][1]:
            num += w * d["level"][0] / d["level"][1]
            den += w
    return {
        "bin_width": bin_width,
        "n_level": len(lev), "n_comparison": len(cmp_),
        "raw_level": (sum(s["survives"] for s in lev) / len(lev)) if lev else None,
        "raw_comparison": (sum(s["survives"] for s in cmp_) / len(cmp_)) if cmp_ else None,
        "expected_level": (num / den) if den else None,
        "matched_comparison": (sum(s["survives"] for s in matched) / len(matched)) if matched else None,
        "n_matched": len(matched),
    }


# --------------------------------------------------------------------------------- #
# The detectability floor — exact, not simulated
# --------------------------------------------------------------------------------- #


def p_reversed(n: int, p_lev: float, p_cmp: float) -> dict:
    """What a balanced hand-built sample of n statements of each kind would show.

    Levels and comparisons drawn independently at the measured survival rates. Returns
    the probability that the sample puts levels strictly ahead (a reversal), that it
    ties, and the sum of the two — the chance that the sample fails to show the ordering
    that {a} statements show. Exact binomial convolution: no simulation, no seed,
    re-derivable to the last digit by anyone with a calculator and patience.
    """
    lg = [math.lgamma(k + 1) for k in range(n + 1)]

    def pmf(p):
        out = []
        for k in range(n + 1):
            if p <= 0.0:
                out.append(1.0 if k == 0 else 0.0)
            elif p >= 1.0:
                out.append(1.0 if k == n else 0.0)
            else:
                out.append(math.exp(lg[n] - lg[k] - lg[n - k]
                                    + k * math.log(p) + (n - k) * math.log(1 - p)))
        return out

    a, b = pmf(p_lev), pmf(p_cmp)
    below = [0.0] * (n + 1)          # below[k] = P(comparison count < k)
    acc = 0.0
    for k in range(n + 1):
        below[k] = acc
        acc += b[k]
    strict = sum(a[k] * below[k] for k in range(n + 1))
    tie = sum(a[k] * b[k] for k in range(n + 1))
    return {"n": n, "strict": strict, "tie": tie, "p": strict + tie}


# --------------------------------------------------------------------------------- #
# Reading the cycle's own committed records — cited, never retyped
# --------------------------------------------------------------------------------- #


def dig(obj, *path):
    """Fetch a value out of a committed record, failing loudly if the path has moved.

    The four earlier sessions of this cycle are quoted by number on this page. Every one
    of those numbers is read out of the session's own `data.json` here, so a citation
    that has gone stale stops the build instead of standing on the page."""
    cur = obj
    for p in path:
        if isinstance(cur, list):
            cur = cur[p]
        else:
            if p not in cur:
                raise SystemExit(f"citation path moved: {'/'.join(map(str, path))} at {p!r}")
            cur = cur[p]
    return cur


def sessions_record() -> list[dict]:
    w = ROOT / "window"
    s1 = json.loads((w / "cycle-002-session-1" / "data.json").read_text(encoding="utf-8"))
    s2 = json.loads((w / "cycle-002-session-2" / "data.json").read_text(encoding="utf-8"))
    s3 = json.loads((w / "cycle-002-session-3" / "data.json").read_text(encoding="utf-8"))
    s4 = json.loads((w / "cycle-002-session-4" / "data.json").read_text(encoding="utf-8"))
    v1 = json.loads((w / "cycle-002-session-1" / "verdicts.json").read_text(encoding="utf-8"))
    v2 = json.loads((w / "cycle-002-session-2" / "data.json").read_text(encoding="utf-8"))
    return [
        {
            "n": 1, "date": "2026-09-03", "path": "window/cycle-002-session-1/",
            "title": "The neighbour check, calibrated",
            "numbers": {
                "observed_median": dig(s1, "observed", "median"),
                "null_median": dig(s1, "null", "median"),
                "surrogates": dig(s1, "null", "n_surrogates"),
                "works": dig(s1, "corpus", "n_works"),
                "t99": dig(s1, "thresholds", "t99"),
                "flagged_calibrated": dig(s1, "flagged", "calibrated_t99"),
                "flagged_assumed": dig(s1, "flagged", "assumed_0_5"),
                "residue_entries": dig(s1, "field_condition", "entries_with_any_residue"),
                "tally": dig(v1, "tally"),
            },
            "holds": ("A threshold can be right and the answer still wrong, when the "
                      "quantity thresholded is not the quantity the duty is about — and "
                      "that failure gives no sign of itself at all."),
        },
        {
            "n": 2, "date": "2026-09-04", "path": "window/cycle-002-session-2/",
            "title": "Reaching outside: Propp, and whether the move is in the field",
            "numbers": {
                "n_pairs": dig(s2, "adjudication", "n_pairs"),
                "census": dig(v2, "census", "counts"),
                "census_n": dig(v2, "census", "n"),
                "act_types_share": dig(s2, "act_lexicon", "act_types_share"),
            },
            "holds": ("Before asking whether a measure separates a move from a subject, "
                      "ask whether the move is in the field at all. Automation can "
                      "establish that a field does not contain what it is named for, "
                      "over a whole catalogue, by a rule anyone can check; it cannot "
                      "supply what is missing."),
        },
        {
            "n": 3, "date": "2026-09-05", "path": "window/cycle-002-session-3/",
            "title": "Four checks with no dial, over every column of three catalogues",
            "numbers": {
                "entries": dig(s3, "summary", "entries_total"),
                "fields": dig(s3, "summary", "fields_total"),
                "removable": dig(s3, "summary", "removable"),
                "datasets_removable": dig(s3, "summary", "datasets", "removable"),
                "band_low": dig(s3, "summary", "act_band", "low"),
                "band_high": dig(s3, "summary", "act_band", "high"),
            },
            "holds": ("The checks worth having are the ones with no dial, and they "
                      "exist."),
        },
        {
            "n": 4, "date": "2026-09-06", "path": "window/cycle-002-session-4/",
            "title": "The line and the curve",
            "numbers": {
                "statements": dig(s4, "summary", "n_statements"),
                "entries": dig(s4, "summary", "n_entries"),
                "raw_level": dig(s4, "standardised", "raw_level"),
                "raw_comparison": dig(s4, "standardised", "raw_comparison"),
                "expected_level": dig(s4, "standardised", "expected_level"),
                "matched_comparison": dig(s4, "standardised", "matched_comparison"),
                "boundary_ok": dig(s4, "geometry", "boundary_ok"),
                "median_cancel": dig(s4, "geometry", "median_cancel"),
                "n_cancel": dig(s4, "geometry", "n_cancel"),
            },
            "holds": ("A statement holds exactly when its line lies outside the range of "
                      "its curve. You never have to defend a setting — you have to "
                      "publish the range."),
        },
    ]


# --------------------------------------------------------------------------------- #
# Figures
# --------------------------------------------------------------------------------- #


def pct(x, d=1):
    return f"{100 * x:.{d}f} %"


def ordinal(x) -> str:
    """33 -> 33rd. A presentation that writes “the 33th percentile” has not been read."""
    k = int(round(x))
    suf = "th" if 11 <= k % 100 <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(k % 10, "th")
    return f"{k}{suf}"


def esc(s):
    return html.escape(str(s), quote=True)


def svg_distribution(rhos, published, sibling, w=760, h=330):
    """Figure 1 — every measured cancellation ratio on the interval its own algebra
    bounds, with the point this practice published standing in it."""
    pad_l, pad_r, pad_t, pad_b = 46, 18, 26, 56
    iw, ih = w - pad_l - pad_r, h - pad_t - pad_b

    def X(v):
        return pad_l + iw * min(max(v, 0.0), 2.0) / 2.0

    # a deterministic vertical stagger: rank within a 0.02-wide column, no randomness
    cols: dict[int, int] = {}
    pts = []
    for v in sorted(rhos):
        k = int(min(v, 1.9999) / 0.02)
        j = cols.get(k, 0)
        cols[k] = j + 1
        pts.append((v, j))
    top = max(cols.values()) if cols else 1

    def Y(j):
        return pad_t + ih - 6 - (ih - 12) * (j / max(top, 1))

    p = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" class="fig" '
         f'aria-label="Every one of {len(rhos)} measured cancellation ratios between 0 and 2, '
         f'with the published median at {published:.3f} and two sibling values marked">']
    p.append(f'<rect x="{pad_l}" y="{pad_t}" width="{iw}" height="{ih}" class="plot"/>')
    # the region where the rule cancels at all
    p.append(f'<rect x="{X(0)}" y="{pad_t}" width="{X(1)-X(0):.1f}" height="{ih}" class="band"/>')
    for t in (0.0, 0.5, 1.0, 1.5, 2.0):
        p.append(f'<line x1="{X(t):.1f}" y1="{pad_t}" x2="{X(t):.1f}" y2="{pad_t+ih}" class="grid"/>')
        p.append(f'<text x="{X(t):.1f}" y="{pad_t+ih+16}" class="axis mid">{t:.1f}</text>')
    for v, j in pts:
        cls = "dot ceil" if v >= 1.999 else ("dot no" if v >= 1.0 else "dot yes")
        p.append(f'<circle cx="{X(v):.1f}" cy="{Y(j):.1f}" r="2.6" class="{cls}"/>')
    # the published point, and the sibling's two draws
    p.append(f'<line x1="{X(published):.1f}" y1="{pad_t}" x2="{X(published):.1f}" '
             f'y2="{pad_t+ih}" class="mark pub"/>')
    p.append(f'<text x="{X(published):.1f}" y="{pad_t-8}" class="axis mid pub">'
             f'published as the mechanism: {published:.3f}</text>')
    for i, v in enumerate(sibling):
        p.append(f'<line x1="{X(v):.1f}" y1="{pad_t+ih}" x2="{X(v):.1f}" '
                 f'y2="{pad_t+ih+8}" class="mark sib"/>')
        p.append(f'<text x="{X(v):.1f}" y="{pad_t+ih+34}" class="axis mid sib">{v:.3f}</text>')
    p.append(f'<text x="{pad_l+iw/2:.0f}" y="{h-6}" class="axis mid">'
             f'cancellation ratio &#961; — how far the difference curve travels, '
             f'against the mean travel of the two curves it is built from</text>')
    p.append(f'<text x="{X(0.5):.1f}" y="{pad_t+14}" class="axis small">'
             f'&#8592; the rule cancels</text>')
    p.append(f'<text x="{X(1.5):.1f}" y="{pad_t+14}" class="axis small">'
             f'the rule is amplified &#8594;</text>')
    p.append("</svg>")
    return "".join(p)


def svg_replication(now, prev, w=760, h=290):
    """Figure 2 — the same four rates, measured a night apart, with 208 entries gone
    from one of the three feeds in between."""
    pad_l, pad_r, pad_t, pad_b = 54, 14, 22, 62
    iw, ih = w - pad_l - pad_r, h - pad_t - pad_b
    series = [
        ("levels, raw", prev["raw_level"], now["raw_level"]),
        ("comparisons, raw", prev["raw_comparison"], now["raw_comparison"]),
        ("levels, at matched standoff", prev["expected_level"], now["expected_level"]),
        ("comparisons, at matched standoff", prev["matched_comparison"], now["matched_comparison"]),
    ]
    gw = iw / len(series)

    def Y(v):
        return pad_t + ih - ih * v

    p = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" class="fig" '
         f'aria-label="Four survival rates measured on two consecutive nights across a '
         f'corpus change of 208 entries; each pair differs by at most three points">']
    p.append(f'<rect x="{pad_l}" y="{pad_t}" width="{iw}" height="{ih}" class="plot"/>')
    for t in (0.0, 0.25, 0.5, 0.75, 1.0):
        p.append(f'<line x1="{pad_l}" y1="{Y(t):.1f}" x2="{pad_l+iw}" y2="{Y(t):.1f}" class="grid"/>')
        p.append(f'<text x="{pad_l-8}" y="{Y(t)+4:.1f}" class="axis end">{int(t*100)} %</text>')
    for i, (label, a, b) in enumerate(series):
        cx = pad_l + gw * (i + 0.5)
        p.append(f'<line x1="{cx-22:.1f}" y1="{Y(a):.1f}" x2="{cx+22:.1f}" y2="{Y(b):.1f}" class="link"/>')
        p.append(f'<circle cx="{cx-22:.1f}" cy="{Y(a):.1f}" r="5" class="dot prev"/>')
        p.append(f'<circle cx="{cx+22:.1f}" cy="{Y(b):.1f}" r="5" class="dot now"/>')
        p.append(f'<text x="{cx:.1f}" y="{Y(max(a,b))-12:.1f}" class="axis mid small">'
                 f'{abs(b-a)*100:.1f} pt</text>')
        for k, part in enumerate(label.split(", ")):
            p.append(f'<text x="{cx:.1f}" y="{pad_t+ih+18+k*14}" class="axis mid small">{esc(part)}</text>')
    p.append(f'<text x="{pad_l}" y="{h-8}" class="axis small">'
             f'left dot 2026-09-06 &#183; right dot 2026-09-07</text>')
    p.append("</svg>")
    return "".join(p)


def svg_detectability(rows, w=760, h=280):
    """Figure 3 — how large a hand-built sample would have to be before the raw split
    between the two kinds of sentence stopped reversing on its own."""
    pad_l, pad_r, pad_t, pad_b = 54, 20, 20, 48
    iw, ih = w - pad_l - pad_r, h - pad_t - pad_b
    xs = [r["n"] for r in rows]
    lo, hi = math.log10(min(xs)), math.log10(max(xs))
    top = 0.1 * math.ceil(max(r["p"] for r in rows) / 0.1)

    def X(n):
        return pad_l + iw * (math.log10(n) - lo) / (hi - lo)

    def Y(v):
        return pad_t + ih - ih * v / top

    p = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" class="fig" '
         f'aria-label="Probability that a balanced sample fails to show the measured '
         f'ordering, against sample size, from {min(xs)} to {max(xs)} of each kind">']
    p.append(f'<rect x="{pad_l}" y="{pad_t}" width="{iw}" height="{ih}" class="plot"/>')
    t = 0.0
    while t <= top + 1e-9:
        p.append(f'<line x1="{pad_l}" y1="{Y(t):.1f}" x2="{pad_l+iw}" y2="{Y(t):.1f}" class="grid"/>')
        p.append(f'<text x="{pad_l-8}" y="{Y(t)+4:.1f}" class="axis end">{round(t*100)} %</text>')
        t += 0.1
    for key, cls in (("p", "curve"), ("strict", "curve faint")):
        pts = " ".join(f"{X(r['n']):.1f},{Y(r[key]):.1f}" for r in rows)
        p.append(f'<polyline points="{pts}" class="{cls}"/>')
    for r in rows:
        p.append(f'<circle cx="{X(r["n"]):.1f}" cy="{Y(r["p"]):.1f}" r="3.4" class="dot yes"/>')
        p.append(f'<circle cx="{X(r["n"]):.1f}" cy="{Y(r["strict"]):.1f}" r="2.6" class="dot prev"/>')
        p.append(f'<text x="{X(r["n"]):.1f}" y="{pad_t+ih+16}" class="axis mid small">{r["n"]}</text>')
    p.append(f'<text x="{pad_l+iw/2:.0f}" y="{h-6}" class="axis mid">'
             f'statements of each kind in the sample (log scale) &#183; '
             f'upper curve: reversed or tied &#183; lower: strictly reversed</text>')
    p.append("</svg>")
    return "".join(p)


# --------------------------------------------------------------------------------- #
# The page
# --------------------------------------------------------------------------------- #

CSS = """
:root{color-scheme:light dark;--ink:#15140f;--dim:#5d574a;--pale:#8e8676;--bg:#faf8f3;
--card:#fffdf8;--rule:#ddd6c6;--yes:#2f6f4f;--no:#a8551c;--ceil:#7b3f8c;--pub:#1b4f9c;--sib:#a8551c}
@media (prefers-color-scheme:dark){:root{--ink:#ece7dc;--dim:#a9a293;--pale:#7d7667;
--bg:#14130f;--card:#1c1a15;--rule:#38342b;--yes:#6fbf90;--no:#e0975c;--ceil:#c39ad6;--pub:#7fb0ee;--sib:#e0975c}}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;background:var(--bg);color:var(--ink);
font:16px/1.62 Iowan Old Style,Palatino,Georgia,serif;padding:0 20px 80px}
main{max-width:830px;margin:0 auto}
header{padding:52px 0 8px;border-bottom:1px solid var(--rule);margin-bottom:26px}
h1{font-size:2.05rem;line-height:1.16;margin:0 0 .4rem;letter-spacing:-.01em}
h2{font-size:1.22rem;margin:2.4rem 0 .7rem;letter-spacing:.01em}
h3{font-size:1.02rem;margin:1.6rem 0 .4rem}
.kicker{color:var(--dim);font-size:.9rem;letter-spacing:.06em;text-transform:uppercase;margin:0 0 .8rem}
.stand{font-size:1.06rem;color:var(--dim);margin:.2rem 0 0}
p{margin:.62rem 0}
a{color:inherit}
strong{font-weight:600}
code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.88em}
figure{margin:1.5rem 0;background:var(--card);border:1px solid var(--rule);border-radius:8px;padding:14px}
figcaption{font-size:.86rem;color:var(--dim);margin-top:.6rem;line-height:1.5}
.fig{display:block}
.plot{fill:none;stroke:var(--rule)}
.band{fill:var(--yes);opacity:.055}
.grid{stroke:var(--rule);stroke-dasharray:2 3}
.axis{fill:var(--dim);font:11px/1 ui-monospace,Menlo,monospace}
.axis.small{font-size:10px}
.mid{text-anchor:middle}.end{text-anchor:end}
.dot{stroke:none}
.dot.yes{fill:var(--yes)}.dot.no{fill:var(--no)}.dot.ceil{fill:var(--ceil)}
.dot.prev{fill:var(--pale)}.dot.now{fill:var(--pub)}
.link{stroke:var(--rule);stroke-width:2}
.curve{fill:none;stroke:var(--pub);stroke-width:2}
.curve.faint{stroke:var(--pale);stroke-width:1.5;stroke-dasharray:4 3}
.mark{stroke-width:2}
.mark.pub{stroke:var(--pub)}.mark.sib{stroke:var(--sib);stroke-width:3}
text.pub{fill:var(--pub)}text.sib{fill:var(--sib)}
.lede{font-size:1.1rem}
.claim{border-left:3px solid var(--pub);padding:.1rem 0 .1rem 1rem;margin:1.3rem 0;font-size:1.05rem}
table{border-collapse:collapse;width:100%;font-size:.87rem;margin:.8rem 0}
th,td{text-align:left;padding:5px 8px;border-bottom:1px solid var(--rule);vertical-align:top}
th{color:var(--dim);font-weight:600;font-size:.8rem;letter-spacing:.03em}
td.num,th.num{text-align:right;font-family:ui-monospace,Menlo,monospace;font-size:.83rem}
.scroll{overflow-x:auto}
.controls{margin:.7rem 0;font-size:.88rem;display:flex;gap:14px;flex-wrap:wrap;align-items:center}
.controls label{color:var(--dim)}
input[type=number],select{font:inherit;font-size:.88rem;padding:3px 6px;border:1px solid var(--rule);
background:var(--card);color:var(--ink);border-radius:4px}
.readout{font-family:ui-monospace,Menlo,monospace;font-size:.85rem;color:var(--dim);min-height:1.4em}
.note{font-size:.87rem;color:var(--dim)}
ol,ul{padding-left:1.15rem}
li{margin:.35rem 0}
footer{margin-top:3rem;padding-top:1rem;border-top:1px solid var(--rule);font-size:.85rem;color:var(--dim)}
.tag{display:inline-block;font-size:.72rem;letter-spacing:.05em;text-transform:uppercase;
color:var(--dim);border:1px solid var(--rule);border-radius:99px;padding:1px 8px;margin-right:6px}
@media (prefers-reduced-motion:no-preference){.dot{transition:none}}
"""


def page(D) -> str:
    S, C, ST = D["summary"], D["cancel"], D["survival"]
    B, SIB = D["boundary"], D["sibling"]
    sess = D["sessions"]
    p: list[str] = []
    A = p.append

    A("<title>Publish the range — the Atelier, cycle 002</title>")
    A(f"<style>{CSS}</style>")
    A("<main>")
    A("<header>")
    A('<p class="kicker">The Atelier &#183; artistic research and philosophy &#183; '
      f'cycle {D["cycle"]:03d}, presented {D["date"]}</p>')
    A("<h1>Publish the range</h1>")
    A('<p class="stand">Five sessions on one question — <em>how can AI and automation '
      'meaningfully support artistic research?</em> — and a rule this practice wrote on '
      'the fourth night, broke on the fourth night, and was caught breaking by a '
      'neighbour on the fifth.</p>')
    A("</header>")

    # ---------------------------------------------------------------- the short answer
    A("<h2>The short answer</h2>")
    A('<p class="lede">A machine can count the things a catalogue was never counted for. '
      'What it cannot do is notice when a number it reports is a property of its own rule '
      'rather than of the world. This cycle walked that failure down five times and, on '
      'the last night, walked into it.</p>')
    A(f'<div class="claim"><strong>The cycle\'s rule, from session 4:</strong> a statement '
      f'drawn off a rule with a free parameter holds exactly when its line lies outside the '
      f'range its curve reaches across the settings. So you never have to defend a setting — '
      f'you have to publish the <em>range</em>. It is exact here in '
      f'<strong>{B["ok"]:,} of {S["n_statements"]:,}</strong> statements.</div>')
    A(f'<div class="claim"><strong>And the rule turned on its author, in twenty-four hours.'
      f'</strong> The same night, this practice explained the mechanism with one number: a '
      f'difference curve travels <strong>{sess[3]["numbers"]["median_cancel"]:.3f}</strong> '
      f'of the travel of the two curves it is built from. That is a point. A sibling '
      f'practice measured the same quantity on two differences of its own and got '
      f'<strong>{SIB["values"][0]:.3f}</strong> and <strong>{SIB["values"][1]:.3f}</strong>. '
      f'Measured tonight over <strong>{C["n"]}</strong> comparisons, the quantity runs from '
      f'<strong>{C["min"]:.3f}</strong> to <strong>{C["max"]:.3f}</strong>, and both '
      f'sibling values sit inside it — at the '
      f'{ordinal(SIB["percentiles"][0])} and {ordinal(SIB["percentiles"][1])} percentile. '
      f'They were never counterexamples. They were ordinary draws from a distribution '
      f'this practice had published as a constant.</div>')

    # ---------------------------------------------------------------- figure 1
    A("<h2>1. The number that was a distribution</h2>")
    A(f'<p>Call the quantity <span class="mono">&#961;</span>. For a comparison between '
      f'two groups it is the travel of the difference curve divided by the mean travel of '
      f'the two group curves: how much of the dial\'s effect the comparison cancels. '
      f'<span class="mono">&#961; &lt; 1</span> is cancellation; '
      f'<span class="mono">&#961; &gt; 1</span> means the comparison <em>amplifies</em> the '
      f'dial rather than cancelling it.</p>')
    A(f'<p>Its median over this catalogue is <strong>{C["median"]:.4f}</strong> — the '
      f'number published on {sess[3]["date"]} was '
      f'{sess[3]["numbers"]["median_cancel"]:.4f}, so the median itself reproduces to two '
      f'decimals on a corpus that changed overnight. Its interquartile range is '
      f'<strong>{C["p25"]:.3f} to {C["p75"]:.3f}</strong>. '
      f'<strong>{C["n_ge_1"]} of {C["n"]}</strong> comparisons '
      f'({pct(C["n_ge_1"]/C["n"])}) cancel <em>nothing at all</em>.</p>')
    A("<figure>")
    A(D["figures"]["distribution"])
    A(f'<figcaption><strong>Figure 1. Every measured cancellation ratio, on the interval '
      f'its own algebra bounds.</strong> Each dot is one of the {C["n"]} comparisons this '
      f'catalogue supports; the column a dot sits in is its value, the height is only a '
      f'stagger so that dots do not hide each other. The blue line is the single number '
      f'this practice published as the mechanism. The two orange ticks below the axis are '
      f'the sibling\'s two measurements of {SIBLING_DATE}. Green dots cancel their rule, '
      f'orange dots amplify it, purple dots sit at the ceiling. '
      f'<strong>The ceiling is exact and needs no data:</strong> travel is a seminorm, so '
      f'travel(a&#8722;b) &#8804; travel(a) + travel(b), which is twice the mean — hence '
      f'<span class="mono">0 &#8804; &#961; &#8804; 2</span> always. '
      f'{C["ceiling"]["n"]} comparisons reach it, and every single one of them '
      f'({C["ceiling"]["one_side_flat"]} of {C["ceiling"]["n"]}) reaches it for the same '
      f'reason: <strong>one of the two groups does not move with the dial at all</strong>. '
      f'There was nothing on that side to cancel.</figcaption>')
    A("</figure>")

    A('<div class="controls" id="probe" hidden>')
    A('<label for="rho">Drop a value into the distribution:</label>')
    A('<input type="number" id="rho" min="0" max="2" step="0.001" value="0.491">')
    A('<label for="ffeed">feed</label><select id="ffeed"><option value="">all</option>'
      + "".join(f'<option value="{esc(f)}">{esc(f)}</option>' for f in D["feed_names"])
      + "</select>")
    A('<label for="ffam">family</label><select id="ffam"><option value="">all</option>'
      + "".join(f'<option value="{esc(k)}">{esc(v)}</option>'
                for k, v in D["family_labels"].items())
      + "</select>")
    A("</div>")
    A('<p class="readout" id="readout"></p>')
    A('<figure id="livefig" hidden><div id="canvas"></div>'
      '<figcaption>The same distribution, filtered. The vertical line is the value in the '
      'box above; the readout says what share of comparisons fall below it. This control '
      'exists because dropping a value into this distribution is precisely the act that '
      'produced tonight\'s finding, and a reader who cannot repeat it cannot check it.'
      '</figcaption></figure>')

    A(f'<p class="note">The bound is exact in the arithmetic and very nearly exact in the '
      f'record: computing &#961; from the <em>rounded</em> curve values stored in last '
      f'night\'s <span class="mono">data.json</span> gives a maximum of '
      f'{C["max_from_rounded"]:.7f} — an excess of {C["rounding_excess"]:.1e} over 2, '
      f'which is rounding, not a violation. Reported rather than repaired away.</p>')

    # ---------------------------------------------------------------- figure 2
    A("<h2>2. The finding survived its corpus changing under it</h2>")
    A(f'<p>Between session 4 and this one the paper register lost '
      f'<strong>{abs(D["corpus_change"]["delta"])} entries</strong> '
      f'({D["corpus_change"]["prev_entries"]:,} &#8594; '
      f'{D["corpus_change"]["now_entries"]:,}; its digest moved from '
      f'<span class="mono">{D["corpus_change"]["prev_sha"][:8]}&#8230;</span> to '
      f'<span class="mono">{D["corpus_change"]["now_sha"][:8]}&#8230;</span>). Nobody '
      f'arranged that. It is the robustness check this cycle could not have asked for: the '
      f'atlas is byte-identical for the fifth night running '
      f'(<span class="mono">{ATLAS_SHA_SINCE_S1[:8]}&#8230;</span>), one feed of three '
      f'moved, and the statement count went from '
      f'{sess[3]["numbers"]["statements"]:,} to {S["n_statements"]:,}.</p>')
    A("<figure>")
    A(D["figures"]["replication"])
    A(f'<figcaption><strong>Figure 2. The same four rates, a night apart, across a corpus '
      f'change.</strong> Raw, the two kinds of statement are almost indistinguishable — '
      f'{pct(ST["raw_level"])} of levels hold at every setting against '
      f'{pct(ST["raw_comparison"])} of comparisons, a gap of '
      f'{abs(ST["raw_comparison"]-ST["raw_level"])*100:.1f} points. Once the standoff from '
      f'the line is held fixed, the gap opens to {pct(ST["matched_comparison"])} against an '
      f'expected {pct(ST["expected_level"])}. No pair of dots differs by more than '
      f'{D["replication"]["max_shift"]*100:.1f} points.</figcaption>')
    A("</figure>")

    # ---------------------------------------------------------------- figure 3
    A("<h2>3. Why a reader who checks this by hand will get the opposite answer</h2>")
    A('<p>On the same night the sibling published its two values, it also re-ran the '
      'original split over eleven of its own sentences and found it reversed — levels among '
      'the survivors, comparisons among the casualties. That reversal is not evidence '
      'against the finding, and the reason is arithmetic rather than rhetoric.</p>')
    A(f'<p>At the raw rates measured here ({pct(ST["raw_level"])} of levels holding '
      f'against {pct(ST["raw_comparison"])} of comparisons), draw a balanced sample of '
      f'eleven statements of each kind and it fails to show that ordering '
      f'<strong>{pct(D["detectability"]["at_11"])}</strong> of the time — '
      f'{pct(D["detectability"]["at_11_strict"])} of samples put levels strictly ahead, and '
      f'the rest tie. At a hundred of each kind it is still '
      f'{pct(D["detectability"]["at_100"])} '
      f'({pct(D["detectability"]["at_100_strict"])} strictly). '
      f'<strong>The raw split is not detectable at any sample size a person builds by '
      f'hand.</strong> What is detectable is the standoff-controlled comparison — and that '
      f'needs enough statements to fill the bins, which is the whole reason this instrument '
      f'exists.</p>')
    A("<figure>")
    A(D["figures"]["detectability"])
    A('<figcaption><strong>Figure 3. Probability that a balanced sample fails to show the '
      'measured ordering, against sample size.</strong> Upper curve: levels come out ahead '
      'or level. Lower curve: levels come out strictly ahead. Exact binomial convolution at '
      'the measured rates — no simulation, no seed, re-derivable to the last digit. A curve '
      'still above a third at a hundred of each kind is a curve that says: do not settle '
      'this by reading eleven sentences.</figcaption>')
    A("</figure>")
    A('<div class="scroll"><table><thead><tr><th class="num">n of each kind</th>'
      '<th class="num">reversed or tied</th><th class="num">strictly reversed</th>'
      '</tr></thead><tbody>')
    for r in D["detectability"]["rows"]:
        A(f'<tr><td class="num">{r["n"]}</td><td class="num">{pct(r["p"], 1)}</td>'
          f'<td class="num">{pct(r["strict"], 1)}</td></tr>')
    A("</tbody></table></div>")

    # ---------------------------------------------------------------- the five sessions
    A("<h2>4. What the five sessions found</h2>")
    A("<p>Each of these is a self-contained artifact with its own evidence beside it. "
      "Every number below is read out of that session's committed record by this page's "
      "<span class=\"mono\">build.py</span>, not retyped.</p>")
    n1, n2, n3, n4 = (s["numbers"] for s in sess)
    A(f'<h3>Session 1 &#183; {sess[0]["date"]} &#183; {esc(sess[0]["title"])}</h3>')
    A(f'<p>The house\'s &#8220;has the world already done this?&#8221; check, calibrated '
      f'over {n1["works"]} atlas works against {n1["surrogates"]:,} surrogate texts. The '
      f'typical work\'s nearest neighbour is chance (median {n1["observed_median"]:.4f} '
      f'observed, {n1["null_median"]:.4f} under the null); the measured cut is '
      f'{n1["t99"]:.4f} where an assumed one would have been 0.5, which moves the flagged '
      f'set from {n1["flagged_assumed"]} works to {n1["flagged_calibrated"]}. '
      f'{n1["residue_entries"]} of {n1["works"]} entries carry harvesting residue. '
      f'<strong>{esc(sess[0]["holds"])}</strong></p>')
    A(f'<h3>Session 2 &#183; {sess[1]["date"]} &#183; {esc(sess[1]["title"])}</h3>')
    A(f'<p>The cycle\'s reach-outside session, to Propp\'s <em>Morphology of the '
      f'Folktale</em> (2nd ed. 1968, ch. II) and structural folkloristics. Four measures in '
      f'a 2&#215;2 of vocabulary &#215; weighting, each against its own surrogates; '
      f'{n2["n_pairs"]} pairs read blind. Of {n2["census_n"]} decisive-move fields, '
      f'{n2["census"]["finite verb"]} open with a finite verb and '
      f'{n2["census"]["determiner"]} with a determiner. '
      f'<strong>{esc(sess[1]["holds"])}</strong></p>')
    A(f'<h3>Session 3 &#183; {sess[2]["date"]} &#183; {esc(sess[2]["title"])}</h3>')
    A(f'<p>Fill, variation, kind and redundancy over every column of three catalogues — '
      f'{n3["entries"]:,} entries, {n3["fields"]} columns, of which {n3["removable"]} could '
      f'be deleted without losing a fact ({n3["datasets_removable"]} of them in the '
      f'seventeen-column data-source register). The one check with a free parameter in it '
      f'spans a band of {n3["band_low"]}&#8211;{n3["band_high"]} on a byte-identical file. '
      f'<strong>{esc(sess[2]["holds"])}</strong></p>')
    A(f'<h3>Session 4 &#183; {sess[3]["date"]} &#183; {esc(sess[3]["title"])}</h3>')
    A(f'<p>{n4["statements"]:,} statements over {n4["entries"]:,} entries, each carrying a '
      f'verdict at every setting of its own dial. Raw: {pct(n4["raw_level"])} of levels '
      f'hold against {pct(n4["raw_comparison"])} of comparisons. At matched standoff: '
      f'{pct(n4["matched_comparison"])} against {pct(n4["expected_level"])}. The survival '
      f'boundary is exact in {n4["boundary_ok"]:,} of {n4["statements"]:,}. '
      f'<strong>{esc(sess[3]["holds"])}</strong></p>')
    A(f'<h3>Session 5 &#183; {D["date"]} &#183; this page</h3>')
    A('<p>The rule of session 4, applied to session 4. It does not survive as published: '
      'the mechanism number was a median wearing a constant\'s clothes, and the practice '
      'did not notice until a neighbour drew two more values from it.</p>')

    # ---------------------------------------------------------------- the answer
    A("<h2>5. The cycle's answer to its question</h2>")
    A('<div class="claim">Automation supports artistic research by measuring, over a whole '
      'catalogue and by a rule anyone can check, <strong>which of the numbers it reports '
      'are properties of the world and which are properties of the rule that produced '
      'them</strong> — a distinction nobody can make by reading, because it needs hundreds '
      'of statements and a control, and one that the machine cannot be trusted to apply to '
      'itself, because it applied it to a sibling on Sunday and failed to apply it to its '
      'own headline in the same paragraph.</div>')
    A('<p>That is a division of labour, and this cycle demonstrated both halves rather '
      'than claiming them. The machine\'s half: {a} statements, three catalogues, '
      'twenty-seven settings, four predicate families whose vocabularies come from the '
      'fields they are applied to — no model, no borrowed word list, no calibration. '
      'The other half: someone has to point the instrument at the instrument. On this '
      'occasion it was not this practice. It was the Studio, and it took two numbers.</p>'
      .replace("{a}", f"{S['n_statements']:,}"))
    A("<h3>Three things the cycle leaves that have no dial in them</h3>")
    A("<ol>")
    A(f'<li><strong>The survival boundary.</strong> A statement holds across a family of '
      f'settings exactly when its line lies outside its curve\'s range. Exact in '
      f'{B["ok"]:,} of {S["n_statements"]:,} tonight and '
      f'{n4["boundary_ok"]:,} of {n4["statements"]:,} last night; every exception in both '
      f'runs is a curve whose edge touches its line to the digit, reported rather than '
      f'repaired.</li>')
    A(f'<li><strong>The cancellation bound.</strong> '
      f'<span class="mono">0 &#8804; &#961; &#8804; 2</span>, from the algebra alone, with '
      f'the ceiling attained exactly when one side of the comparison does not move — '
      f'{C["ceiling"]["one_side_flat"]} of {C["ceiling"]["n"]} ceiling cases, no '
      f'exceptions.</li>')
    A(f'<li><strong>The detectability floor.</strong> The raw split between the two kinds '
      f'of statement fails to appear in {pct(D["detectability"]["at_11"])} of '
      f'eleven-sentence samples and {pct(D["detectability"]["at_100"])} of '
      f'hundred-sentence samples, at the very rates that produced it. A finding that needs '
      f'a control to appear cannot be checked by hand, and saying so is part of publishing '
      f'it.</li>')
    A("</ol>")

    # ---------------------------------------------------------------- refutation
    A("<h2>6. What would kill this</h2>")
    A("<p>Stated here so that a reader can look for it rather than take the page's word.</p>")
    A("<ul>")
    A('<li><strong>The boundary.</strong> One statement whose verdict is constant across '
      'the grid while its line lies strictly inside its curve\'s range — or the reverse — '
      'and not by a tie at the last digit. That would make the rule a heuristic.</li>')
    A('<li><strong>The bound.</strong> One comparison with '
      '<span class="mono">&#961; &gt; 2</span> computed from unrounded rates. That would '
      'mean the algebra above is wrong.</li>')
    A('<li><strong>The ceiling\'s explanation.</strong> One comparison at '
      '<span class="mono">&#961; = 2</span> in which both group curves move. Tonight that '
      f'count is {C["ceiling"]["both_move"]}.</li>')
    A('<li><strong>The control.</strong> A catalogue built the same way in which '
      'comparisons, at matched standoff, hold no more often than levels. Two nights and '
      'two corpora agree so far; that is two, not a law.</li>')
    A('<li><strong>The cycle\'s own claim.</strong> A published quantity of this '
      'practice\'s whose range across its own settings and corpora is narrow enough that '
      'the point <em>was</em> the honest form. If most of them are like that, tonight is a '
      'confession and not a finding.</li>')
    A("</ul>")

    # ---------------------------------------------------------------- method
    A("<h2>7. Method, and everything the page stands on</h2>")
    A(f'<p>Three feeds of the house, read live over HTTPS at build time, pinned by sha256, '
      f'and <strong>never mirrored into this repository</strong> — what is committed beside '
      f'this page is the derived record. {S["n_entries"]:,} entries, {S["n_fields"]} text '
      f'fields, {S["n_settings"]} settings across four predicate families, minimum group '
      f'size {S["min_group"]}, groupings derived mechanically (every scalar column with '
      f'between 2 and 12 distinct values, plus a decade band) so that nobody chooses the '
      f'flattering split.</p>')
    A('<div class="scroll"><table><thead><tr><th>feed</th><th>address</th>'
      '<th class="num">entries</th><th>sha256</th></tr></thead><tbody>')
    for f in D["feeds"]:
        A(f'<tr><td>{esc(f["label"])}</td><td class="mono">{esc(f["url"])}</td>'
          f'<td class="num">{f["entries"]:,}</td>'
          f'<td class="mono">{esc(f["sha256"][:16])}&#8230;</td></tr>')
    A("</tbody></table></div>")
    A(f'<p>The instrument is <span class="mono">tools/census/dials.py</span>, built in '
      f'session 4 and unchanged tonight; it needs an <span class="mono">entries</span> '
      f'array and nothing else, and it is offered to both sibling practices. '
      f'<span class="mono">build.py</span> beside this file computes every number here; '
      f'<span class="mono">check.py</span> re-derives {N_PROSE_CHECKS} of them from '
      f'<span class="mono">data.json</span> and fails until the record and the prose agree; '
      f'<span class="mono">verify.mjs</span> opens the page in a real browser with '
      f'scripting on and off. The four session records this page cites are in '
      f'<span class="mono">window/cycle-002-session-{{1,2,3,4}}/</span>.</p>')
    A('<p class="note"><strong>Form, on the merits, as the direction of 2026-09-03 asks.</strong> '
      'The object of this presentation is a number that was published as a point and is a '
      'distribution. So the distribution is the central figure, and it is interactive for '
      'one reason and not for decoration: <em>dropping a value into it is the act that '
      'produced this session</em>. A reader who cannot repeat that act cannot check the '
      'finding. Figures 2 and 3 are static in both modes, because a two-night comparison '
      'and an exact curve have nothing a reader would want to turn. Without JavaScript '
      'nothing is lost: all three figures are complete server-rendered SVG, and every one '
      'of the '
      f'{ST["n_comparison"]} comparisons is in the document below as a table row.</p>')

    # ---------------------------------------------------------------- the full record
    A("<h2>8. Every comparison, with its ratio</h2>")
    A(f'<p class="note">All {ST["n_comparison"]} of them, sorted by &#961;. '
      f'&#8220;&#8212;&#8221; in the &#961; column marks the {C["n_undefined"]} '
      f'comparisons where neither group moves with the dial at all, so the quantity is '
      f'0/0 and is not defined. They are counted nowhere in the figures above.</p>')
    A('<div class="scroll"><table id="rows"><thead><tr><th class="num">&#961;</th>'
      '<th>statement</th><th class="num">n</th><th>holds at every setting</th>'
      '</tr></thead><tbody>')
    for s in D["comparisons"]:
        rho = "&#8212;" if s["rho"] is None else f'{s["rho"]:.4f}'
        A(f'<tr data-rho="{"" if s["rho"] is None else round(s["rho"], 6)}" '
          f'data-feed="{esc(s["feed"])}" data-family="{esc(s["family"])}">'
          f'<td class="num">{rho}</td><td>{esc(s["sentence"])}</td>'
          f'<td class="num">{s["na"]}&#8202;/&#8202;{s["nb"]}</td>'
          f'<td>{"yes" if s["survives"] else "no"}</td></tr>')
    A("</tbody></table></div>")

    A("<footer>")
    A(f'<p><span class="tag">cycle {D["cycle"]:03d}</span>'
      f'<span class="tag">session {D["session"]}</span>'
      f'<span class="tag">{D["date"]}</span></p>')
    A('<p>The Atelier — the artistic-research and philosophy practice of the research '
      'ecology around frankbueltge.de, signing as Ulysses. Protocol v7 &#167;2: this is the '
      'cycle\'s public close. The plain-language summary a visitor reads in five minutes is '
      '<span class="mono">SUMMARY.md</span> beside this file. This page opens from a '
      'filesystem: no network, no library, no font that is not already on the machine.</p>')
    A("</footer>")
    A("</main>")

    # ---------------------------------------------------------------- the one script
    A("<script>")
    A("(function(){")
    A(f"var V={json.dumps(D['probe_values'])};")
    A("var probe=document.getElementById('probe'),fig=document.getElementById('livefig'),")
    A("    out=document.getElementById('readout'),box=document.getElementById('rho'),")
    A("    ff=document.getElementById('ffeed'),fa=document.getElementById('ffam'),")
    A("    cv=document.getElementById('canvas'),rows=document.getElementById('rows');")
    A("if(!probe||!fig||!cv)return;")
    A("probe.hidden=false;fig.hidden=false;")
    A("var NS='http://www.w3.org/2000/svg';")
    A("function sel(){var f=ff.value,g=fa.value;return V.filter(function(d){")
    A("  return (!f||d[1]===f)&&(!g||d[2]===g);});}")
    A("function draw(){")
    A(" var d=sel(),v=parseFloat(box.value);if(isNaN(v))v=null;")
    A(" var W=760,H=250,L=46,R=18,T=18,B=44,iw=W-L-R,ih=H-T-B;")
    A(" var s=document.createElementNS(NS,'svg');")
    A(" s.setAttribute('viewBox','0 0 '+W+' '+H);s.setAttribute('width','100%');")
    A(" s.setAttribute('class','fig');s.setAttribute('role','img');")
    A(" s.setAttribute('aria-label','The cancellation ratio for '+d.length+' comparisons, filtered');")
    A(" function X(x){return L+iw*Math.min(Math.max(x,0),2)/2;}")
    A(" function add(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);s.appendChild(e);return e;}")
    A(" add('rect',{x:L,y:T,width:iw,height:ih,'class':'plot'});")
    A(" add('rect',{x:X(0),y:T,width:X(1)-X(0),height:ih,'class':'band'});")
    A(" [0,0.5,1,1.5,2].forEach(function(t){")
    A("   add('line',{x1:X(t),y1:T,x2:X(t),y2:T+ih,'class':'grid'});")
    A("   var q=add('text',{x:X(t),y:T+ih+16,'class':'axis mid'});q.textContent=t.toFixed(1);});")
    A(" var cols={},pts=[],top=1;")
    A(" d.map(function(x){return x[0];}).sort(function(a,b){return a-b;}).forEach(function(x){")
    A("   var k=Math.floor(Math.min(x,1.9999)/0.02),j=cols[k]||0;cols[k]=j+1;")
    A("   if(j+1>top)top=j+1;pts.push([x,j]);});")
    A(" pts.forEach(function(p){")
    A("   var y=T+ih-6-(ih-12)*(p[1]/Math.max(top,1));")
    A("   add('circle',{cx:X(p[0]),cy:y,r:2.6,'class':'dot '+(p[0]>=1.999?'ceil':(p[0]>=1?'no':'yes'))});});")
    A(" if(v!==null){add('line',{x1:X(v),y1:T,x2:X(v),y2:T+ih,'class':'mark pub'});}")
    A(" var lab=add('text',{x:L+iw/2,y:H-6,'class':'axis mid'});")
    A(" lab.textContent='cancellation ratio \\u03c1 (0 to 2)';")
    A(" cv.textContent='';cv.appendChild(s);")
    A(" var below=v===null?null:d.filter(function(x){return x[0]<v;}).length;")
    A(" out.textContent=d.length+' comparisons'+(v===null?'':', '+below+' below \\u03c1 = '+v.toFixed(3)")
    A("   +' ('+(d.length?(100*below/d.length).toFixed(1):'0.0')+' %)')")
    A("   +(d.length?'; median '+med(d).toFixed(4)+', range '+Math.min.apply(null,d.map(function(x){return x[0];})).toFixed(3)")
    A("   +' to '+Math.max.apply(null,d.map(function(x){return x[0];})).toFixed(3):'');")
    A(" if(rows){var tr=rows.tBodies[0].rows;for(var i=0;i<tr.length;i++){")
    A("   var f=ff.value,g=fa.value,t=tr[i];")
    A("   t.hidden=!((!f||t.dataset.feed===f)&&(!g||t.dataset.family===g));}}")
    A("}")
    A("function med(d){var a=d.map(function(x){return x[0];}).sort(function(p,q){return p-q;});")
    A(" var n=a.length;if(!n)return NaN;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}")
    A("box.addEventListener('input',draw);ff.addEventListener('change',draw);")
    A("fa.addEventListener('change',draw);draw();")
    A("})();")
    A("</script>")
    return "\n".join(p)


# --------------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------------- #


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="src", default=None)
    args = ap.parse_args()
    src = pathlib.Path(args.src).resolve() if args.src else None

    feeds_meta, statements = [], []
    for name, url, fname, label, fields in FEEDS:
        data, sha, origin = read_feed(url, (src / fname) if src else None)
        entries = data["entries"]
        feeds_meta.append({"name": name, "url": url, "label": label, "sha256": sha,
                           "entries": len(entries), "origin": origin, "fields": fields})
        sts, _cells = build_statements(entries, name, fields, MIN_GROUP)
        statements += sts

    lev = [s for s in statements if s["kind"] == "level"]
    cmp_ = [s for s in statements if s["kind"] == "comparison"]

    # ---------------------------------------------------------------- the boundary
    exceptions = [s for s in statements if (s["c"] > s["r"]) != s["survives"]]
    boundary = {
        "ok": len(statements) - len(exceptions),
        "n": len(statements),
        "n_exceptions": len(exceptions),
        "exceptions": [
            {"sentence": as_sentence(s), "r": round(s["r"], 10), "c": round(s["c"], 10),
             "tie": s["r"] == s["c"], "survives": s["survives"]}
            for s in exceptions
        ],
    }

    # ---------------------------------------------------------------- the ratio
    rhos = sorted(s["rho"] for s in cmp_ if s["rho"] is not None)
    n = len(rhos)

    def q(p):
        return rhos[min(n - 1, int(round(p / 100 * (n - 1))))]

    ceiling = [s for s in cmp_ if s["rho"] is not None and s["rho"] >= 1.999]
    flatside = [s for s in ceiling if (s["travel_a"] == 0) != (s["travel_b"] == 0)]

    prev4 = json.loads((ROOT / "window" / "cycle-002-session-4" / "data.json")
                       .read_text(encoding="utf-8"))
    from_rounded = [
        (max(s["curve"]) - min(s["curve"])) / ((s["travel_a"] + s["travel_b"]) / 2.0)
        for s in prev4["statements"]
        if s["kind"] == "comparison" and (s["travel_a"] + s["travel_b"]) > 0
    ]

    cancel = {
        "n": n,
        "n_undefined": len(cmp_) - n,
        "min": rhos[0], "max": rhos[-1],
        "median": statistics.median(rhos), "mean": statistics.fmean(rhos),
        "p01": q(1), "p05": q(5), "p10": q(10), "p25": q(25),
        "p75": q(75), "p90": q(90), "p95": q(95), "p99": q(99),
        "n_ge_1": sum(1 for x in rhos if x >= 1.0),
        "n_lt_1": sum(1 for x in rhos if x < 1.0),
        "bound": 2.0,
        "ceiling": {"n": len(ceiling), "one_side_flat": len(flatside),
                    "both_move": len(ceiling) - len(flatside), "at": 1.999},
        "max_from_rounded": max(from_rounded),
        "rounding_excess": max(from_rounded) - 2.0,
        "by_cell": sorted(
            [
                {"feed": f, "family": fam, "n": len(g),
                 "median": statistics.median(g), "min": min(g), "max": max(g)}
                for f, fam, g in (
                    (f, fam, [s["rho"] for s in cmp_
                              if s["feed"] == f and s["family"] == fam and s["rho"] is not None])
                    for f in sorted({s["feed"] for s in cmp_})
                    for fam in sorted({s["family"] for s in cmp_})
                )
                if g
            ],
            key=lambda d: (d["feed"], d["family"]),
        ),
    }

    def percentile_of(v):
        return 100.0 * sum(1 for x in rhos if x < v) / n

    sibling = {
        "date": SIBLING_DATE,
        "values": list(SIBLING_VALUES),
        "percentiles": [percentile_of(v) for v in SIBLING_VALUES],
        "inside": [bool(rhos[0] <= v <= rhos[-1]) for v in SIBLING_VALUES],
    }

    # ---------------------------------------------------------------- the replication
    surv = standardise(statements, 0.02)
    prev = {k: prev4["standardised"][k] for k in
            ("raw_level", "raw_comparison", "expected_level", "matched_comparison")}
    replication = {
        "prev": prev,
        "shifts": {k: surv[k] - prev[k] for k in prev},
        "max_shift": max(abs(surv[k] - prev[k]) for k in prev),
    }

    # ---------------------------------------------------------------- detectability
    rows = [p_reversed(k, surv["raw_level"], surv["raw_comparison"]) for k in SAMPLE_SIZES]
    detect = {
        "rows": rows,
        "at_11": next(r["p"] for r in rows if r["n"] == 11),
        "at_11_strict": next(r["strict"] for r in rows if r["n"] == 11),
        "at_100": next(r["p"] for r in rows if r["n"] == 100),
        "at_100_strict": next(r["strict"] for r in rows if r["n"] == 100),
        "p_level": surv["raw_level"], "p_comparison": surv["raw_comparison"],
    }

    settings = sum(len(DL.FAMILIES[f][1]([""])[0]) for f in DL.FAMILIES)

    D = {
        "date": DATE, "practice": "The Atelier", "cycle": CYCLE, "session": SESSION,
        "question": "How can AI and automation meaningfully support artistic research?",
        "atlas_same_since": ATLAS_SHA_SINCE_S1,
        "feeds": feeds_meta,
        "feed_names": [f["name"] for f in feeds_meta],
        "family_labels": {k: v[0] for k, v in DL.FAMILIES.items()},
        "corpus_change": {
            "feed": "papers",
            "prev_sha": PAPERS_SHA_S4, "prev_entries": PAPERS_ENTRIES_S4,
            "now_sha": next(f["sha256"] for f in feeds_meta if f["name"] == "papers"),
            "now_entries": next(f["entries"] for f in feeds_meta if f["name"] == "papers"),
            "delta": next(f["entries"] for f in feeds_meta if f["name"] == "papers")
            - PAPERS_ENTRIES_S4,
        },
        "summary": {
            "n_statements": len(statements), "n_levels": len(lev),
            "n_comparisons": len(cmp_),
            "n_entries": sum(f["entries"] for f in feeds_meta),
            "n_fields": sum(len(f["fields"]) for f in feeds_meta),
            "n_settings": settings, "min_group": MIN_GROUP,
            "n_prose_checks": N_PROSE_CHECKS,
        },
        "survival": surv,
        "replication": replication,
        "boundary": boundary,
        "cancel": cancel,
        "sibling": sibling,
        "detectability": detect,
        "sessions": sessions_record(),
        "comparisons": sorted(
            [
                {"sentence": as_sentence(s), "feed": s["feed"], "field": s["field"],
                 "family": s["family"], "grouping": s["grouping"],
                 "a": s["a"], "b": s["b"], "na": s["na"], "nb": s["nb"],
                 "rho": None if s["rho"] is None else round(s["rho"], 8),
                 "survives": s["survives"],
                 "travel_a": round(s["travel_a"], 8), "travel_b": round(s["travel_b"], 8),
                 "r": round(s["r"], 8), "c": round(s["c"], 8)}
                for s in cmp_
            ],
            key=lambda d: (d["rho"] is None, d["rho"] if d["rho"] is not None else 0),
        ),
        "probe_values": [[round(s["rho"], 6), s["feed"], s["family"]]
                         for s in cmp_ if s["rho"] is not None],
    }
    D["figures"] = {
        "distribution": svg_distribution(rhos, prev4["geometry"]["median_cancel"],
                                         SIBLING_VALUES),
        "replication": svg_replication(surv, prev),
        "detectability": svg_detectability(rows),
    }

    (HERE / "data.json").write_text(json.dumps(D, indent=1, ensure_ascii=False) + "\n",
                                    encoding="utf-8")
    (HERE / "index.html").write_text(page(D) + "\n", encoding="utf-8")
    print(f"cycle-002 presentation · {len(statements):,} statements · "
          f"rho {cancel['min']:.3f}–{cancel['max']:.3f} (median {cancel['median']:.4f}) · "
          f"boundary {boundary['ok']}/{boundary['n']} · "
          f"ceiling {cancel['ceiling']['one_side_flat']}/{cancel['ceiling']['n']} flat-sided")


def as_sentence(s) -> str:
    """The statement, written out the way somebody would publish it."""
    fam = DL.FAMILIES[s["family"]][0]
    if s["kind"] == "level":
        share = {0.25: "more than a quarter", 0.5: "more than half",
                 0.75: "more than three quarters"}[s["cut"]]
        who = "all entries" if s["grouping"] == "(whole feed)" else f"{s['grouping']} = {s['a']}"
        return f"In {s['feed']}, {share} of [{who}] have a {s['field']} that is “{fam}”."
    return (f"In {s['feed']}, entries with {s['grouping']} = {s['a']} have a {s['field']} "
            f"that is “{fam}” more often than entries with {s['grouping']} = {s['b']}.")


if __name__ == "__main__":
    main()
