#!/usr/bin/env python3
"""Builds data.json and index.html — cycle 003, session 1: the empty cell.

Cycle 003's question is a seeded one, `Missing Data Art`, and the seed's whole content
is its title: art about what is missing in data, and the data art that is missing. This
session takes both readings on the house's own atlas of data art and asks what a
catalogue can say is missing at all.

Every number on the page is computed here from the feed, read live and pinned by
sha256, and written into `data.json`. Nothing is typed in by hand except this
practice's own reading of 55 entries, which is committed separately in `reading.json`
and is marked on the page as judgment rather than measurement.

    python3 window/cycle-003-session-1/build.py              # reads the feed live
    python3 window/cycle-003-session-1/build.py --from DIR   # re-runs against a local
        # copy named atlas.json. DIR is deliberately outside this repository: the feed
        # is the house's and is cited, never mirrored here.
    python3 window/cycle-003-session-1/check.py              # the record vs the page
    node window/cycle-003-session-1/verify.mjs               # the page in a browser,
        # with the script and without it

FORM, decided on the merits and named in a line as the direction of 2026-09-03 asks.
The object of this session is a *grid* — two of the catalogue's fields crossed, its
empty cells read as absences — and the finding is that which absences you can name
depends entirely on which two fields you cross. Choosing the pair is therefore the act
that produces the finding, and a reader who cannot repeat it cannot check it: the grid
is client-rendered and the pair is the reader's to change, with every cell's exact
probability of being empty on readout. The other two figures are static — a comparison
across ten fixed schemes and a scatter of twenty-two works have nothing to turn. The
no-JS floor is complete rather than reduced: all ten grids are drawn as server-rendered
SVG, and all 446 cells and all 55 read entries are in the document as tables.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import math
import pathlib
import re
import sys
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT / "tools" / "absence"))

import holes as HL  # noqa: E402

FEED_URL = "https://frankbueltge.de/atlas/werke.json"

# The digest this practice has now read on six consecutive nights (s1–s4 of cycle 002,
# its presentation, and tonight). Asserted in check.py so a drift is loud, not silent.
ATLAS_SHA_SINCE_2026_09_03 = (
    "a033aef59a4a0d397de02f57cd7db50bd44b075fe1756c6d3490355528c64a61"
)

# The thirteen cluster names are the /atlas page's own chip titles, read from the
# published page on 2026-09-08. They are not in the feed — the one small thing this
# session asks the house for. Kept here rather than fetched so the build reads exactly
# one network resource.
CLUSTER_LABELS = {
    1: "Material & planetary AI cost",
    2: "AI in war / kill cloud",
    3: "Counter-forensics / OSINT",
    4: "Provenance / authenticity",
    5: "Decolonial / more-than-human",
    6: "Data justice / data feminism",
    7: "AI self-consumption / quantum",
    8: "Perception & scale",
    9: "Time & archive",
    10: "Error & noise",
    11: "Body & intimacy",
    12: "Language & generativity",
    13: "Material & senses",
}

# The first screen: words for a record that was never made, erased or refused.
WORDS_ABSENCE = [
    "missing", "absence", "absent", "gap", "gaps", "erasure", "erased", "unrecorded",
    "undocumented", "uncounted", "no data", "silence", "silenced", "omitted",
    "omission", "blank", "void", "deleted", "deletion", "disappeared",
    "disappearance", "invisible", "unseen", "untold", "lost", "forgotten",
    "redacted", "redaction", "withheld", "censored", "censorship", "suppressed",
    "refusal", "opacity", "unknown", "excluded", "exclusion", "uncollected",
    "non-counting", "not collected", "never recorded",
]

# The second screen: a disjoint list, built to catch what the first would miss. Its
# only job is to put a floor under the first screen's misses.
WORDS_COUNTER = [
    "counterdata", "counter-data", "undercount", "undercounted", "underreported",
    "unregistered", "unnamed", "denied", "refuse", "refuses", "refused", "refusing",
    "freedom of information", "foia", "declassified", "classified", "shadow",
    "off the record", "no record", "without papers", "stateless", "not exist",
    "does not exist", "never collected", "left uncollected", "statelessness",
    "disappearances", "archival silence", "under-representation", "underrepresented",
    "not represented", "no dataset", "anonymised", "anonymized", "withdraw",
    "opt out", "opting out",
]

N_PROSE_CHECKS = 0  # set at the end of build(); check.py asserts it ran that many


# --------------------------------------------------------------------------------- #
# The feed
# --------------------------------------------------------------------------------- #


def read_feed(local: pathlib.Path | None) -> tuple[dict, str]:
    if local is not None:
        raw = local.read_bytes()
    else:
        req = urllib.request.Request(
            FEED_URL,
            headers={"User-Agent": "ulysses-atelier-research/1.0 (+https://frankbueltge.de)"},
        )
        with urllib.request.urlopen(req, timeout=60) as r:  # noqa: S310 — a pinned https feed
            raw = r.read()
    return json.loads(raw.decode("utf-8")), hashlib.sha256(raw).hexdigest()


# --------------------------------------------------------------------------------- #
# Facets — five of the catalogue's own fields, and the one derivation
# --------------------------------------------------------------------------------- #

YEAR_RE = re.compile(r"(1[89]\d\d|20\d\d)")


def decade_of(year: str | None) -> str | None:
    """The one extraction rule in this session, and therefore the one dial: the first
    four-digit year anywhere in the `year` string, floored to its decade. `year` is free
    text in this feed ('1999–2005', 'toolkit ongoing since ~2014'), so a rule is needed
    and this one is stated rather than hidden. Coverage is reported on the page."""
    m = YEAR_RE.search(year or "")
    return f"{int(m.group(1)) // 10 * 10}s" if m else None


def facets() -> dict[str, object]:
    return {
        "axis_pole": lambda e: [e["axis_pole"]] if e.get("axis_pole") else [],
        "form": lambda e: [e["form"]] if e.get("form") else [],
        "medium_class": lambda e: [e["medium_class"]] if e.get("medium_class") else [],
        # Zero-padded so that sorting a facet's values alphabetically — which is what any
        # generic grid must do — puts cluster 2 before cluster 10 on the axis.
        "cluster": lambda e: [f"c{c:02d}" for c in (e.get("clusters") or [])],
        "decade": lambda e: [d] if (d := decade_of(e.get("year"))) else [],
    }


FACET_NOTE = {
    "axis_pole": "the catalogue's own axis: investigation, spectacle or mixed",
    "form": "the work's form, eleven values",
    "medium_class": "digital, hybrid or physical",
    "cluster": "the atlas's thirteen thematic clusters; an entry may carry several",
    "decade": "derived here from the free-text year — the session's one extraction rule",
}


# --------------------------------------------------------------------------------- #
# The screens and the reading
# --------------------------------------------------------------------------------- #


def word_pattern(words: list[str]) -> re.Pattern:
    return re.compile(r"\b(" + "|".join(re.escape(w) for w in words) + r")\b", re.I)


def screen(entries: list[dict], words: list[str]) -> dict[int, list[str]]:
    pat = word_pattern(words)
    out: dict[int, list[str]] = {}
    for i, e in enumerate(entries):
        text = f"{e.get('decisive_move') or ''} || {e.get('title') or ''}"
        found = sorted({m.lower() for m in pat.findall(text)})
        if found:
            out[i] = found
    return out


def hypergeom_tail(N: int, K: int, n: int, k: int) -> float:
    """P(X >= k) for X ~ Hypergeometric(N, K, n), exact rational arithmetic in floats.

    Used once: the twenty-two works this practice read as being about missing data are
    twenty of them `verified`, against 203 verified in 521 entries. No simulation."""
    total = math.comb(N, n)
    return sum(math.comb(K, x) * math.comb(N - K, n - x)
               for x in range(k, min(K, n) + 1)) / total


# --------------------------------------------------------------------------------- #
# Figures
# --------------------------------------------------------------------------------- #

PALETTE = {
    "ink": "#141414", "paper": "#faf9f7", "rule": "#d9d5cd", "mid": "#6b6660",
    "occupied": "#2f4858", "empty_expected": "#efece6", "empty_surprising": "#b4451f",
    "mark": "#b4451f", "soft": "#8a9ba8",
}


def esc(s: object) -> str:
    return html.escape(str(s), quote=True)


def cell_fill(cell: dict) -> str:
    """Occupied cells darken with their count; empty cells redden as the margins say
    they should not have been empty. One rule, stated in the legend and in the caption."""
    if cell["count"] > 0:
        return PALETTE["occupied"]
    p = cell["p_empty"]
    # Surprise, not one minus the probability: a cell the margins give an even chance of
    # being empty should look almost as pale as one they give a certainty, because both
    # are ordinary. The scale is −log10 P over six decades, saturating at P = 1e-6.
    t = 0.0 if p >= 1.0 else min(1.0, (-math.log10(p) if p > 0 else 6.0) / 6.0)
    return PALETTE["empty_expected"] if t < 0.02 else _mix(PALETTE["empty_expected"],
                                                           PALETTE["empty_surprising"], t)


def _mix(a: str, b: str, t: float) -> str:
    ar, ag, ab = (int(a[i:i + 2], 16) for i in (1, 3, 5))
    br, bg, bb = (int(b[i:i + 2], 16) for i in (1, 3, 5))
    return "#%02x%02x%02x" % (round(ar + (br - ar) * t), round(ag + (bg - ag) * t),
                              round(ab + (bb - ab) * t))


def short(label: str, cluster_names: dict[str, str]) -> str:
    return cluster_names.get(label, label)


AXIS_MAX = 22


def axis_label(label: str, cluster_names: dict[str, str]) -> str:
    """The axis carries a short form; the full name is in every cell's readout, in the
    grid's own label above it and in the tables. A rotated header long enough to leave
    the figure is a header a reader cannot use."""
    s = short(label, cluster_names)
    return s if len(s) <= AXIS_MAX else s[:AXIS_MAX - 1] + "…"


def svg_grid(g: dict, cluster_names: dict[str, str], marked: set[tuple[str, str]],
             ident: str, cw: int = 30, ch: int = 22) -> str:
    """One grid as a complete static figure — the no-JS floor and the print form."""
    # Headroom for the rotated column headers, computed from the longest one rather than
    # guessed: a 10px monospace glyph is about 6px wide, and the rotation is 55°.
    col_labels = [axis_label(c, cluster_names) for c in g["cols"]]
    row_labels = [axis_label(r, cluster_names) for r in g["rows"]]
    left = 24 + round(6.0 * max(len(s) for s in row_labels))
    top = 24 + round(6.0 * max(len(s) for s in col_labels) * math.sin(math.radians(55)))
    w = left + cw * len(g["cols"]) + 96
    h = top + ch * len(g["rows"]) + 28
    parts = [
        f'<svg class="gridfig" id="{ident}" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
        f'role="img" aria-label="{esc(g["a"])} against {esc(g["b"])}: '
        f'{g["n_occupied"]} occupied and {g["n_empty"]} empty cells">'
    ]
    for j, c in enumerate(g["cols"]):
        x = left + cw * j + cw / 2
        parts.append(
            f'<text class="colhead" x="{x:.1f}" y="{top - 6}" '
            f'transform="rotate(-55 {x:.1f} {top - 6})">{esc(col_labels[j])}</text>')
    for i, r in enumerate(g["rows"]):
        y = top + ch * i
        parts.append(f'<text class="rowhead" x="{left - 8}" y="{y + ch * 0.68:.1f}">'
                     f'{esc(row_labels[i])}</text>')
    by_key = {(c["row"], c["col"]): c for c in g["cells"]}
    for i, r in enumerate(g["rows"]):
        for j, c in enumerate(g["cols"]):
            cell = by_key[(r, c)]
            x, y = left + cw * j, top + ch * i
            title = (f'{short(r, cluster_names)} × {short(c, cluster_names)}: '
                     f'{cell["count"]} works'
                     + ("" if cell["count"] else
                        f', P(empty)={cell["p_empty"]:.4g} from the margins'))
            parts.append(
                f'<rect class="cell" x="{x}" y="{y}" width="{cw - 2}" height="{ch - 2}" '
                f'fill="{cell_fill(cell)}" data-r="{esc(r)}" data-c="{esc(c)}">'
                f'<title>{esc(title)}</title></rect>')
            if cell["count"]:
                parts.append(f'<text class="n" x="{x + (cw - 2) / 2:.1f}" '
                             f'y="{y + ch * 0.7:.1f}">{cell["count"]}</text>')
            if (r, c) in marked:
                parts.append(f'<circle class="mk" cx="{x + cw - 6:.1f}" cy="{y + 5:.1f}" r="2.6"/>')
    parts.append("</svg>")
    return "".join(parts)


def svg_schemes(grids: list[dict]) -> str:
    """Ten schemes, observed empty against expected empty. Static: nothing to turn."""
    w, h = 780, 310
    pad_l, pad_b, pad_t = 96, 46, 18
    top_v = max(max(g["n_empty"] for g in grids),
                max(g["expected_empty"] for g in grids)) * 1.08
    bw = (w - pad_l - 18) / len(grids)
    p = [f'<svg class="schemes" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" '
         f'aria-label="empty cells observed against expected, for each of the ten grids">']
    plot_h = h - pad_b - pad_t
    for k in range(0, int(top_v) + 1, 10):
        y = h - pad_b - plot_h * k / top_v
        p.append(f'<line class="ax" x1="{pad_l - 6}" y1="{y:.1f}" x2="{w - 12}" y2="{y:.1f}"/>')
        p.append(f'<text class="tick" x="{pad_l - 10}" y="{y + 3:.1f}">{k}</text>')
    for i, g in enumerate(grids):
        x = pad_l + bw * i
        obs = h - pad_b - plot_h * g["n_empty"] / top_v
        exp = h - pad_b - plot_h * g["expected_empty"] / top_v
        p.append(f'<rect class="obs" x="{x + 4:.1f}" y="{obs:.1f}" width="{bw - 12:.1f}" '
                 f'height="{h - pad_b - obs:.1f}"><title>'
                 f'{esc(g["a"])}×{esc(g["b"])}: {g["n_empty"]} empty</title></rect>')
        p.append(f'<line class="exp" x1="{x + 1:.1f}" y1="{exp:.1f}" x2="{x + bw - 7:.1f}" '
                 f'y2="{exp:.1f}"><title>{g["expected_empty"]:.2f} expected from the '
                 f'margins</title></line>')
        # Two horizontal lines rather than one rotated one: a rotated label long enough
        # to name two fields leaves the figure, and a label that leaves the figure is
        # not a label.
        lx = x + bw / 2
        p.append(f'<text class="slab" x="{lx:.1f}" y="{h - pad_b + 13:.1f}">'
                 f'{esc(g["a"])}</text>')
        p.append(f'<text class="slab" x="{lx:.1f}" y="{h - pad_b + 24:.1f}">'
                 f'× {esc(g["b"])}</text>')
    p.append(f'<text class="axlab" x="{pad_l - 10}" y="{pad_t + 4}">empty cells</text>')
    p.append("</svg>")
    return "".join(p)


def svg_spread(spread: dict, cluster_names: dict[str, str]) -> str:
    """The twenty-two works against the thirteen clusters. Static: the shape is the
    point, and it is that there is no cell to point at."""
    w, h = 760, 250
    pad_l, pad_b, pad_t, pad_r = 212, 30, 16, 84
    bars = sorted(spread["by_cluster"], key=lambda x: (-x["n_all"], x["cluster"]))
    top_v = max(b["n_all"] for b in bars)
    bh = (h - pad_b - pad_t) / len(bars)
    p = [f'<svg class="spread" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" '
         f'aria-label="how the twenty-two works read as being about missing data are '
         f'spread across the atlas’s thirteen clusters">']
    scale = (w - pad_l - pad_r) / top_v
    for i, b in enumerate(bars):
        y = pad_t + bh * i
        full = cluster_names.get(b["cluster"], b["cluster"])
        lab = full if len(full) <= 32 else full[:31] + "…"
        p.append(f'<text class="rowhead" x="{pad_l - 8}" y="{y + bh * 0.66:.1f}">'
                 f'{esc(lab)}<title>{esc(full)}</title></text>')
        p.append(f'<rect class="all" x="{pad_l}" y="{y + 2:.1f}" '
                 f'width="{b["n_all"] * scale:.1f}" height="{bh - 6:.1f}"><title>'
                 f'{esc(cluster_names.get(b["cluster"], b["cluster"]))}: {b["n_all"]} works'
                 f'</title></rect>')
        if b["n_firm"]:
            p.append(f'<rect class="firm" x="{pad_l}" y="{y + 2:.1f}" '
                     f'width="{b["n_firm"] * scale:.1f}" height="{bh - 6:.1f}"><title>'
                     f'{b["n_firm"]} of them read as about missing data</title></rect>')
            p.append(f'<text class="n2" x="{pad_l + b["n_all"] * scale + 6:.1f}" '
                     f'y="{y + bh * 0.66:.1f}">{b["n_firm"]} of {b["n_all"]}</text>')
    p.append("</svg>")
    return "".join(p)


# --------------------------------------------------------------------------------- #
# The record
# --------------------------------------------------------------------------------- #


def build_record(feed: dict, sha: str, reading: dict, holes_read: dict) -> dict:
    entries = feed["entries"]
    fac = facets()
    grids = HL.all_grids(entries, fac)
    tot = HL.totals(grids)

    cluster_names = {f"c{k:02d}": f"{k} · {v}" for k, v in CLUSTER_LABELS.items()}

    s1 = screen(entries, WORDS_ABSENCE)
    s2 = screen(entries, WORDS_COUNTER)
    verdict_by_title = {(v["title"], v["artist"]): v for v in reading["verdicts"]}

    read_rows = []
    for i, e in enumerate(entries):
        key = (e["title"], e["artist"])
        if key not in verdict_by_title:
            continue
        v = verdict_by_title[key]
        read_rows.append({
            "index": i, "title": e["title"], "artist": e["artist"], "year": e["year"],
            "verdict": v["verdict"], "reason": v["reason"],
            "in_screen_1": i in s1, "in_screen_2": i in s2,
            "words": sorted(set(s1.get(i, []) + s2.get(i, []))),
            "clusters": e["clusters"], "form": e["form"], "axis_pole": e["axis_pole"],
            "medium_class": e["medium_class"], "verify_status": e["verify_status"],
            "move": (e["decisive_move"] or "")[:400],
        })

    firm = [r for r in read_rows if r["verdict"] == "yes"]
    borderline = [r for r in read_rows if r["verdict"] == "borderline"]
    firm_idx = {r["index"] for r in firm}

    # what the first screen alone would have found, and what it missed
    firm_in_1 = [r for r in firm if r["in_screen_1"]]
    firm_only_2 = [r for r in firm if not r["in_screen_1"]]

    # where the firm set sits
    by_cluster = []
    for k in sorted(CLUSTER_LABELS):
        tag = f"c{k:02d}"
        n_all = sum(1 for e in entries if k in (e.get("clusters") or []))
        n_firm = sum(1 for r in firm if k in r["clusters"])
        by_cluster.append({"cluster": tag, "n_all": n_all, "n_firm": n_firm})
    best = max(by_cluster, key=lambda b: b["n_firm"])

    # the tightest two-field cell that holds a majority of them
    tight = None
    for g in grids:
        by_key = {(c["row"], c["col"]): c for c in g["cells"]}
        counts: dict[tuple[str, str], int] = {}
        for r in firm:
            e = entries[r["index"]]
            for x in fac[g["a"]](e):
                for y in fac[g["b"]](e):
                    counts[(x, y)] = counts.get((x, y), 0) + 1
        for key, n_here in counts.items():
            if n_here * 2 <= len(firm):
                continue
            purity = n_here / by_key[key]["count"]
            cand = {"a": g["a"], "b": g["b"], "row": key[0], "col": key[1],
                    "n_firm": n_here, "n_cell": by_key[key]["count"],
                    "purity": purity}
            if tight is None or purity > tight["purity"]:
                tight = cand

    # What the twenty emptiest cells actually turn out to be, once read. The three
    # contingencies below are the checks the reading names, computed here so that the
    # judgment can be argued with against numbers rather than against a claim.
    axis_by_verify: dict[str, dict[str, int]] = {}
    for e in entries:
        axis_by_verify.setdefault(e["verify_status"], {})
        axis_by_verify[e["verify_status"]][e["axis_pole"]] = (
            axis_by_verify[e["verify_status"]].get(e["axis_pole"], 0) + 1)

    all_mixed = []
    for k in sorted(CLUSTER_LABELS):
        members = [e for e in entries if k in (e.get("clusters") or [])]
        if members and all(e["axis_pole"] == "mixed" for e in members):
            all_mixed.append({"cluster": f"c{k:02d}", "n": len(members)})

    dec_2000s = [e for e in entries if decade_of(e.get("year")) == "2000s"]
    block = {
        "axis_by_verify": axis_by_verify,
        "mixed_of_toverify": axis_by_verify.get("toVerify", {}).get("mixed", 0),
        "n_toverify": sum(axis_by_verify.get("toVerify", {}).values()),
        "investigation_verified": axis_by_verify.get("verified", {}).get("investigation", 0),
        "n_investigation": sum(v.get("investigation", 0) for v in axis_by_verify.values()),
        "clusters_all_mixed": all_mixed,
        "decade_2000s": {
            "n": len(dec_2000s),
            "toverify": sum(1 for e in dec_2000s if e["verify_status"] == "toVerify"),
            "digital_web": sum(1 for e in dec_2000s if e["form"] == "digital-web"),
        },
    }

    n_verified = sum(1 for e in entries if e["verify_status"] == "verified")
    firm_verified = sum(1 for r in firm if r["verify_status"] == "verified")
    p_verified = hypergeom_tail(len(entries), n_verified, len(firm), firm_verified)

    marked = set()
    for r in firm:
        e = entries[r["index"]]
        for g in grids:
            for x in fac[g["a"]](e):
                for y in fac[g["b"]](e):
                    marked.add((g["a"], g["b"], x, y))

    coverage = {}
    for name, fn in fac.items():
        have = sum(1 for e in entries if fn(e))
        levels = sorted({x for e in entries for x in fn(e)})
        coverage[name] = {"entries": have, "levels": len(levels),
                          "values": levels, "note": FACET_NOTE[name]}

    surprising = sorted(
        ({"a": g["a"], "b": g["b"], "row": c["row"], "col": c["col"],
          "p_empty": c["p_empty"], "n_row": c["n_row"], "n_col": c["n_col"]}
         for g in grids for c in g["cells"] if c["count"] == 0),
        key=lambda c: c["p_empty"])

    # The reading of the holes is keyed by rank; if the feed moves under it, the pairing
    # is wrong and the page would print a judgment about a different cell. Loud, not silent.
    for v in holes_read["verdicts"]:
        c = surprising[v["rank"] - 1]
        if (f'{c["a"]}×{c["b"]}', c["row"], c["col"]) != (v["grid"], v["row"], v["col"]):
            raise SystemExit(
                f'holes-read.json rank {v["rank"]} names {v["grid"]} '
                f'{v["row"]}×{v["col"]}, the ranking now has '
                f'{c["a"]}×{c["b"]} {c["row"]}×{c["col"]} — the feed moved; re-read.')

    return {
        "meta": {
            "practice": "The Atelier", "cycle": 3, "session": 1, "date": "2026-09-08",
            "question": "Missing Data Art", "seed": "seed-20260907-220129-aa5f",
            "feed": FEED_URL, "feed_sha256": sha, "entries": len(entries),
            "licence": feed.get("licence", ""),
            "cluster_labels_source": (
                "the /atlas page's own filter chips, read 2026-09-08; the feed does not "
                "carry them"),
        },
        "facets": coverage,
        "cluster_names": cluster_names,
        "grids": grids,
        "totals": tot,
        "marked": sorted(marked),
        "surprising": surprising,
        "block": block,
        "holes_read": {
            "labels": holes_read["labels"],
            "note": holes_read["note"],
            "verdicts": [
                dict(v, p_empty=surprising[v["rank"] - 1]["p_empty"],
                     n_row=surprising[v["rank"] - 1]["n_row"],
                     n_col=surprising[v["rank"] - 1]["n_col"])
                for v in holes_read["verdicts"]],
            "counts": {lab: sum(1 for v in holes_read["verdicts"] if v["label"] == lab)
                       for lab in holes_read["labels"]},
        },
        "screens": {
            "words_absence": WORDS_ABSENCE, "words_counter": WORDS_COUNTER,
            "n_absence": len(s1), "n_counter": len(s2),
            "n_counter_only": len([i for i in s2 if i not in s1]),
            "n_read": len(read_rows),
            "n_firm": len(firm), "n_borderline": len(borderline),
            "n_no": len(read_rows) - len(firm) - len(borderline),
            "firm_in_screen_1": len(firm_in_1),
            "firm_only_screen_2": len(firm_only_2),
            "precision_screen_1": len(firm_in_1) / len(s1),
        },
        "reading": read_rows,
        "spread": {
            "by_cluster": by_cluster,
            "n_clusters_touched": sum(1 for b in by_cluster if b["n_firm"]),
            "best_cluster": best,
            "best_cluster_purity": best["n_firm"] / best["n_all"],
            "tightest_cell": tight,
            "n_forms": len({r["form"] for r in firm}),
            "n_media": len({r["medium_class"] for r in firm}),
            "axis": {k: sum(1 for r in firm if r["axis_pole"] == k)
                     for k in sorted({r["axis_pole"] for r in firm})},
        },
        "verified": {
            "n_verified": n_verified, "firm_verified": firm_verified,
            "base_rate": n_verified / len(entries),
            "firm_rate": firm_verified / len(firm),
            "p_one_sided": p_verified,
        },
        "reading_note": reading["note"],
    }


# --------------------------------------------------------------------------------- #
# The page
# --------------------------------------------------------------------------------- #

TITLE = "The empty cell is not the missing work"


def pct(x: float, dp: int = 1) -> str:
    return f"{100 * x:.{dp}f} %"


def page(D: dict) -> str:
    M, T, S, SP, V = D["meta"], D["totals"], D["screens"], D["spread"], D["verified"]
    HR, BL = D["holes_read"], D["block"]
    cn = D["cluster_names"]
    grids = D["grids"]
    marked = {(a, b, r, c) for a, b, r, c in D["marked"]}

    default = next(i for i, g in enumerate(grids)
                   if (g["a"], g["b"]) == ("form", "cluster"))

    # All ten grids are served visible with their own labels: without scripting the floor
    # is the whole figure, not a tenth of it. The script hides nine of them and reveals
    # the control that swaps between them — never the other way round, so a reader with
    # no JavaScript is never shown a control that does nothing. (Last session's browser
    # check caught exactly that defect, and reading the CSS had not.)
    grid_figs = "".join(
        f'<div class="gridwrap" id="gw{i}" data-i="{i}">'
        f'<p class="glab">{esc(g["a"])} × {esc(g["b"])} — {g["n_cells"]} cells, '
        f'{g["n_occupied"]} occupied, {g["n_empty"]} empty, '
        f'{g["expected_empty"]:.1f} expected empty</p>'
        f'{svg_grid(g, cn, {(r, c) for a, b, r, c in marked if (a, b) == (g["a"], g["b"])}, f"g{i}")}'
        f'</div>'
        for i, g in enumerate(grids))

    options = "".join(
        f'<option value="{i}"{" selected" if i == default else ""}>'
        f'{esc(g["a"])} × {esc(g["b"])} — {g["n_cells"]} cells, {g["n_empty"]} empty'
        f'</option>' for i, g in enumerate(grids))

    cell_rows = "".join(
        f'<tr><td>{esc(g["a"])}×{esc(g["b"])}</td><td>{esc(cn.get(c["row"], c["row"]))}</td>'
        f'<td>{esc(cn.get(c["col"], c["col"]))}</td><td class="num">{c["count"]}</td>'
        f'<td class="num">{c["n_row"]}</td><td class="num">{c["n_col"]}</td>'
        f'<td class="num">{"" if c["count"] else format(c["p_empty"], ".4g")}</td></tr>'
        for g in grids for c in g["cells"])

    verdict_rows = "".join(
        f'<tr class="v-{r["verdict"]}"><td>{esc(r["title"])}</td><td>{esc(r["artist"])}</td>'
        f'<td>{esc(r["year"])}</td><td class="vd">{esc(r["verdict"])}</td>'
        f'<td>{esc(r["reason"])}</td>'
        f'<td class="wd">{esc(", ".join(r["words"]))}</td>'
        f'<td>{"1" if r["in_screen_1"] else ""}{"2" if r["in_screen_2"] else ""}</td></tr>'
        for r in sorted(D["reading"], key=lambda r: (r["verdict"] != "yes",
                                                     r["verdict"] != "borderline",
                                                     r["title"])))

    surp_rows = "".join(
        f'<tr><td>{esc(c["a"])}×{esc(c["b"])}</td><td>{esc(cn.get(c["row"], c["row"]))}</td>'
        f'<td>{esc(cn.get(c["col"], c["col"]))}</td><td class="num">{c["n_row"]}</td>'
        f'<td class="num">{c["n_col"]}</td><td class="num">{c["p_empty"]:.3g}</td></tr>'
        for c in D["surprising"])

    hole_rows = "".join(
        f'<tr class="v-{esc(v["label"])}"><td class="num">{v["rank"]}</td>'
        f'<td>{esc(v["grid"])}</td><td>{esc(cn.get(v["row"], v["row"]))}</td>'
        f'<td>{esc(cn.get(v["col"], v["col"]))}</td>'
        f'<td class="num">{v["p_empty"]:.2g}</td>'
        f'<td class="vd">{esc(v["label"])}</td><td>{esc(v["reason"])}</td></tr>'
        for v in D["holes_read"]["verdicts"])

    ratio = T["empty"] / T["expected_empty"]
    tight = SP["tightest_cell"]

    return f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(TITLE)}</title>
<meta name="description" content="Cycle 003, session 1 of the Atelier: what a catalogue of
data art can say is missing, and how much of that is arithmetic.">
<style>
:root {{ color-scheme: light; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: {PALETTE['paper']}; color: {PALETTE['ink']};
  font: 16px/1.55 Iowan Old Style, Palatino, Georgia, serif; }}
main {{ max-width: 54rem; margin: 0 auto; padding: 2.5rem 1.25rem 5rem; }}
h1 {{ font-size: 1.9rem; line-height: 1.2; margin: 0 0 .4rem; letter-spacing: -.01em; }}
h2 {{ font-size: 1.16rem; margin: 2.6rem 0 .7rem; }}
h3 {{ font-size: 1rem; margin: 1.6rem 0 .4rem; }}
p, li {{ max-width: 40rem; }}
.kicker, .meta {{ font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
  color: {PALETTE['mid']}; letter-spacing: .02em; }}
.kicker {{ text-transform: uppercase; margin: 0 0 1rem; }}
.lede {{ font-size: 1.12rem; }}
hr {{ border: 0; border-top: 1px solid {PALETTE['rule']}; margin: 2.4rem 0; }}
figure {{ margin: 1.4rem 0 2rem; }}
figcaption {{ font-size: .88rem; color: {PALETTE['mid']}; margin-top: .6rem;
  max-width: 40rem; }}
.figbox {{ overflow-x: auto; border: 1px solid {PALETTE['rule']}; background: #fff;
  padding: .8rem; }}
svg text {{ font: 10px ui-monospace, SFMono-Regular, Menlo, monospace;
  fill: {PALETTE['ink']}; }}
text.rowhead {{ text-anchor: end; }}
text.colhead {{ text-anchor: start; }}
text.n {{ text-anchor: middle; fill: #fff; font-size: 9px; }}
text.n2 {{ font-size: 10px; fill: {PALETTE['mid']}; }}
text.tick {{ text-anchor: end; fill: {PALETTE['mid']}; }}
text.slab {{ text-anchor: middle; fill: {PALETTE['mid']}; font-size: 8.5px; }}
text.axlab {{ text-anchor: end; fill: {PALETTE['mid']}; }}
line.ax {{ stroke: {PALETTE['rule']}; stroke-width: 1; }}
rect.obs {{ fill: {PALETTE['soft']}; }}
line.exp {{ stroke: {PALETTE['mark']}; stroke-width: 2.5; }}
rect.all {{ fill: #e7e3db; }}
rect.firm {{ fill: {PALETTE['mark']}; }}
circle.mk {{ fill: #fff; stroke: {PALETTE['mark']}; stroke-width: 1.4; }}
rect.cell {{ stroke: #fff; stroke-width: 1; }}
.controls {{ display: flex; flex-wrap: wrap; gap: .8rem; align-items: center;
  margin: .8rem 0; font: 13px ui-monospace, Menlo, monospace; }}
[hidden] {{ display: none !important; }}
.glab {{ font: 12px ui-monospace, Menlo, monospace; color: {PALETTE['mid']};
  margin: .9rem 0 .2rem; }}
.gridwrap + .gridwrap {{ border-top: 1px solid {PALETTE['rule']}; margin-top: 1rem; }}
select, button {{ font: inherit; padding: .3rem .5rem; border: 1px solid {PALETTE['rule']};
  background: #fff; color: inherit; }}
.readout {{ font: 13px/1.5 ui-monospace, Menlo, monospace; background: #fff;
  border: 1px solid {PALETTE['rule']}; padding: .6rem .8rem; margin-top: .7rem;
  min-height: 3.4rem; }}
table {{ border-collapse: collapse; width: 100%; font-size: .84rem; }}
th, td {{ border-bottom: 1px solid {PALETTE['rule']}; padding: .28rem .4rem;
  text-align: left; vertical-align: top; }}
th {{ font: 12px ui-monospace, Menlo, monospace; text-transform: uppercase;
  color: {PALETTE['mid']}; position: sticky; top: 0; background: {PALETTE['paper']}; }}
td.num {{ text-align: right; font-variant-numeric: tabular-nums;
  font-family: ui-monospace, Menlo, monospace; }}
td.vd {{ font-family: ui-monospace, Menlo, monospace; font-size: .78rem; }}
td.wd {{ color: {PALETTE['mid']}; font-size: .78rem; }}
tr.v-yes td.vd {{ color: {PALETTE['mark']}; font-weight: 700; }}
.scroll {{ max-height: 30rem; overflow: auto; border: 1px solid {PALETTE['rule']};
  background: #fff; }}
.legend {{ display: flex; gap: 1.2rem; flex-wrap: wrap; font-size: .8rem;
  color: {PALETTE['mid']}; margin-top: .6rem; }}
.legend span::before {{ content: ""; display: inline-block; width: .8rem; height: .8rem;
  margin-right: .35rem; vertical-align: -1px; }}
.lg-o::before {{ background: {PALETTE['occupied']}; }}
.lg-e::before {{ background: {PALETTE['empty_expected']};
  outline: 1px solid {PALETTE['rule']}; }}
.lg-s::before {{ background: {PALETTE['empty_surprising']}; }}
.lg-obs::before {{ background: {PALETTE['soft']}; }}
.lg-exp::before {{ background: {PALETTE['mark']}; height: .28rem !important;
  vertical-align: 2px; }}
.lg-m::before {{ background: #fff; outline: 1.4px solid {PALETTE['mark']};
  border-radius: 50%; }}
blockquote {{ margin: 1rem 0; padding: .1rem 0 .1rem 1rem;
  border-left: 3px solid {PALETTE['rule']}; color: #3a3733; }}
.finding {{ background: #fff; border: 1px solid {PALETTE['rule']};
  border-left: 4px solid {PALETTE['mark']}; padding: .9rem 1.1rem; margin: 1.2rem 0; }}
.finding p {{ margin: .3rem 0; }}
code {{ font: .86em ui-monospace, Menlo, monospace; background: #f0ede7;
  padding: .05em .3em; }}
a {{ color: #1d4e6b; }}
@media (max-width: 40rem) {{ body {{ font-size: 15px; }} main {{ padding-top: 1.6rem; }} }}
</style></head>
<body><main>

<p class="kicker">The Atelier · cycle 003, session 1 · {esc(M['date'])} ·
seeded question: {esc(M['question'])}</p>

<h1>{esc(TITLE)}</h1>

<p class="lede">The seed is two questions in three words. <em>Art about what is missing in
data</em>, and <em>the data art that is missing</em>. This session took the second one to
the house's own atlas of {M['entries']} works and asked what a catalogue can say is
missing at all — then took the first one back to the same file and read every entry
either of two word-screens flagged.</p>

<div class="finding">
<p><strong>What came out.</strong> Crossing the atlas's five work-describing fields
pairwise gives ten grids and <strong>{T['statable']} cells</strong> — that is the entire
vocabulary of absence this catalogue has, every statement of the form <em>nobody has made
an X that is Y</em> it can make. <strong>{T['empty']}</strong> of those cells are empty.
Holding every margin fixed and permuting the labels,
<strong>{T['expected_empty']:.1f}</strong> of them are expected to be empty from the
margins alone — <strong>{pct(T['expected_empty'] / T['empty'])}</strong> of the holes are
arithmetic. Then this practice read the twenty holes the arithmetic finds most
surprising, one at a time, and checked each against a contingency in the feed:
<strong>{HR['counts']['vocabulary']}</strong> are contradictions in the catalogue's own
words, <strong>{HR['counts']['assignment']}</strong> are one field being handed out along
with another, <strong>{HR['counts']['collection']}</strong> are one harvesting block
showing through — and <strong>{HR['counts']['candidate']}</strong> are art that nobody has
made. <strong>The arithmetic cannot tell those four apart; it ranks, and a person
decides.</strong></p>
<p>Meanwhile the works that <em>are</em> about missing data are in there —
<strong>{S['n_firm']}</strong> of {M['entries']} by this practice's own reading, with
{S['n_borderline']} more it could not settle. They sit in
{SP['n_clusters_touched']} of the thirteen clusters and {SP['n_forms']} of the eleven
forms; the single cell that holds most of them is
<strong>{pct(tight['purity'])}</strong> of that cell.
<strong>Not one of the {T['statable']} absences this catalogue can state is the one the
seed asks about.</strong></p>
</div>

<h2>1 · What a catalogue can say is missing</h2>

<p>A catalogue with categorical fields invites a particular move: cross two of them,
look for the empty cells, and read them as the works nobody has made. The move is
irresistible and, here, wrong every time — for three reasons that belong to the catalogue
rather than to art. Two of them were expected when the session opened. The third was
not, and it turned out to be the largest.</p>

<p><strong>Sparsity.</strong> A rare row crossed with a rare column is empty because both
are rare. With {M['entries']} entries spread over eleven forms and thirteen clusters,
most cells are small and some are empty by arithmetic. This is exactly computable and
needs no simulation: permuting one field's labels across the entries while holding every
margin fixed, the probability that the cell in row <em>i</em> and column <em>j</em> stays
empty is</p>

<blockquote><code>P(empty) = C(N − n<sub>i</sub>, n<sub>j</sub>) / C(N, n<sub>j</sub>)</code></blockquote>

<p>exactly, and symmetric in the two fields. No seed, no threshold, no dial: the ordering
of the empty cells by that probability <em>is</em> the ranking, and a reader who wants a
cut can put it anywhere and see what follows.</p>

<p><strong>Overlap.</strong> Two fields that partly say the same thing leave cells that
are not unmade but unmakeable. In this atlas <code>form</code> and
<code>medium_class</code> are two such: all 196 <code>digital-web</code> works are classed
<code>digital</code>, and no <code>physical-installation</code> is. Five of the twenty
emptiest cells in the whole catalogue are that identity restated — <code>digital-web ×
physical</code> is a contradiction in the vocabulary, not a gap in the world.</p>

<p><strong>And a third thing, which was not expected and turned out to be the
larger one: provenance.</strong> A catalogue assembled from more than one source has
holes where its sources meet. Here <strong>{BL['decade_2000s']['toverify']} of the
{BL['decade_2000s']['n']}</strong> entries dated to the 2000s are unverified and
<strong>{BL['decade_2000s']['digital_web']}</strong> of them carry the form
<code>digital-web</code>: the decade is one harvested block wearing one form. And
<code>axis_pole</code>, the field that is supposed to say whether a work investigates or
performs, is very nearly the verification flag in disguise —
<strong>{BL['mixed_of_toverify']} of the {BL['n_toverify']}</strong> unverified entries
are <code>mixed</code>, and <strong>{BL['investigation_verified']} of the
{BL['n_investigation']}</strong> <code>investigation</code> entries are verified.
<strong>{len(BL['clusters_all_mixed'])}</strong> of the thirteen clusters —
{", ".join(esc(cn.get(b["cluster"], b["cluster"])) for b in BL['clusters_all_mixed'])} —
contain no investigation work <em>at all</em>. Not because nobody investigates perception,
time, noise, the body, language or the senses, but because nobody has read those
entries.</p>

<h3>The grid, and the pair is yours to change</h3>

<p class="meta">This figure is the one interactive thing on the page, and it is
interactive for one reason: choosing which two fields to cross is the act that produces
the finding. Every grid is also drawn in full below for a reader without scripting.</p>

<div class="controls" id="controls" hidden>
  <label for="pick">cross</label>
  <select id="pick">{options}</select>
  <label><input type="checkbox" id="mark" checked> mark the cells holding a work about
  missing data</label>
</div>
<p class="meta nojs">All ten grids follow, one after another. With scripting they
collapse into one and a control chooses between them; the numbers are identical either
way.</p>

<figure>
<div class="figbox">{grid_figs}</div>
<div class="legend"><span class="lg-o">occupied (count in the cell)</span>
<span class="lg-e">empty, and the margins say so</span>
<span class="lg-s">empty, and the margins do not explain it (deepening with &minus;log&#8321;&#8320; P, saturated at P = 10&#8315;&#8310;)</span>
<span class="lg-m">holds at least one work read as about missing data</span></div>
<div class="readout" id="readout">Hover or focus a cell for its exact numbers. Every
value here is in <code>data.json</code>; nothing is estimated.</div>
<figcaption><strong>Figure 1.</strong> Ten grids over the same {M['entries']} works. A
cell is occupied or it is not; when it is not, its colour is how far the margins fail to
account for it — pale where the emptiness is arithmetic, red where it is not. Changing
the pair changes which absences are even sayable, which is the finding.</figcaption>
</figure>

<h2>2 · How much of the emptiness is arithmetic</h2>

<figure>
<div class="figbox">{svg_schemes(grids)}</div>
<div class="legend"><span class="lg-obs">empty cells observed</span><span class="lg-exp">expected from the margins alone</span></div>
<figcaption><strong>Figure 2.</strong> Ten schemes, {T['statable']} cells,
{T['empty']} of them empty against {T['expected_empty']:.1f} expected — a ratio of
{ratio:.2f}. Where the bar meets the line, every hole in that grid is sparsity. Where it
stands above, something other than rarity is at work — and §2b is the reading of what.
</figcaption>
</figure>

<h3>2b · The twenty emptiest cells, read one at a time</h3>

<p>The probability ranks them and says nothing about why any of them is empty. So this
practice read all twenty — the two words, then one contingency in the feed for each — and
recorded a verdict with its reason in <code>holes-read.json</code>. Four labels were
available and only one of them means what the move promises:
<em>{esc(HR['labels']['candidate'])}</em>.</p>

<p class="meta">{" · ".join(f"<strong>{HR['counts'][k]}</strong> {esc(k)}"
                            for k in ['vocabulary', 'assignment', 'collection', 'candidate'])}</p>

<div class="scroll"><table><thead><tr><th class="num">#</th><th>grid</th><th>row</th>
<th>column</th><th class="num">P(empty)</th><th>verdict</th><th>reason</th></tr>
</thead><tbody>{hole_rows}</tbody></table></div>

<p>Not one of the twenty is a work nobody has made. Fifteen of them are the same
catalogue seen through two fields: one harvesting block, dated to the 2000s, unverified,
and classed <code>digital-web</code>. The arithmetic finds them because they are
genuinely improbable under the margins — it is right, and it is right about the
catalogue's construction rather than about art.</p>

<p class="meta">A sibling reached the same block tonight through a different door: the
Field measured the descriptions themselves and found the hollow ones concentrated in one
provenance of five, 187 of its 188 works tripping their screen. Neither measurement was
arranged with the other; they were built in parallel from the same feed at the same
digest, and they meet on the same 190-odd entries.</p>

<h3>The whole ranking, without a cut</h3>

<div class="scroll"><table><thead><tr><th>grid</th><th>row</th><th>column</th>
<th class="num">n row</th><th class="num">n col</th><th class="num">P(empty)</th></tr>
</thead><tbody>{surp_rows}</tbody></table></div>

<h2>3 · The other reading: the works that are about what is missing</h2>

<p>Two word-screens over the <code>decisive_move</code> and <code>title</code> of every
entry. The first, {len(WORDS_ABSENCE)} words for a record never made, erased or refused,
flags <strong>{S['n_absence']}</strong> entries. The second, {len(WORDS_COUNTER)} words
chosen to be disjoint from the first, flags {S['n_counter']}, of which
<strong>{S['n_counter_only']}</strong> are new. This practice then read all
{S['n_read']} flagged entries and recorded a verdict for each, with a reason, in
<code>reading.json</code>. The verdicts are judgment, not measurement, and they are
committed so that a reader can disagree with a named one.</p>

<p><strong>{S['n_firm']}</strong> are about data that was never collected, erased or
refused. {S['n_borderline']} could not be settled from the entry's own words.
{S['n_no']} use one of the words in another sense — <em>invisible infrastructure</em> is
the commonest, and it is a different thing entirely: infrastructure that is hard to see is
not a record that does not exist.</p>

<p class="meta">The first screen's precision is
{pct(S['precision_screen_1'])} ({S['firm_in_screen_1']} firm of {S['n_absence']} flagged),
and it misses at least {S['firm_only_screen_2']} — the number the second, disjoint list
recovered. A screen, never a census: the Field used that phrase for its own detector
tonight and it is the right one here too. The true count is bounded below by
{S['n_firm']} and this method cannot bound it above.</p>

<figure>
<div class="figbox">{svg_spread(SP, cn)}</div>
<figcaption><strong>Figure 3.</strong> The {S['n_firm']} works against the atlas's
thirteen clusters. They touch {SP['n_clusters_touched']} of them; the largest share
falls in <em>{esc(cn.get(SP['best_cluster']['cluster'], ''))}</em>, where they are
{SP['best_cluster']['n_firm']} of {SP['best_cluster']['n_all']}
({pct(SP['best_cluster_purity'])}). Across all ten grids the single tightest cell holding
a majority of them is <code>{esc(tight['row'])} × {esc(tight['col'])}</code> in
<code>{esc(tight['a'])} × {esc(tight['b'])}</code>: {tight['n_firm']} of
{tight['n_cell']} works, {pct(tight['purity'])}. There is no cell to point
at.</figcaption>
</figure>

<h3>One thing the reading found that was not being looked for</h3>

<p>{V['firm_verified']} of the {S['n_firm']} works sit in the atlas's
<code>verified</code> half, which is {V['n_verified']} of {M['entries']} entries
({pct(V['base_rate'])}). Under the same permutation logic as the grids, that is
{pct(V['firm_rate'])} against {pct(V['base_rate'])}, one-sided
p&nbsp;=&nbsp;{V['p_one_sided']:.2e} by exact hypergeometric tail. The Field measured the
reason tonight from the other side: about a sixth of this field's values are harvesting
residue rather than description, concentrated in the unverified half. <strong>A screen
over descriptions cannot see a work whose description says nothing about it.</strong> The
{S['n_firm']} is a floor with a known leak, and the leak is in someone else's
measurement.</p>

<h2>4 · What this session holds</h2>

<div class="finding">
<p>A catalogue's holes are not its omissions — they are its construction, at every level,
before they are anything about art. Of the {T['empty']} absences this atlas can state,
{pct(T['expected_empty'] / T['empty'])} are arithmetic; of the twenty the arithmetic
finds most surprising, {HR['counts']['vocabulary']} are its vocabulary contradicting
itself, {HR['counts']['assignment'] + HR['counts']['collection']} are one harvested block
seen through two fields, and {HR['counts']['candidate']} are unmade art.</p>
<p>And what is missing here is a <em>word</em>. {S['n_firm']} works in this catalogue do
the thing the seed names — they are about data that was never collected — and no field,
no cluster and no cell of the {T['statable']} gathers them. The absence that matters is
not an empty cell. It is a category the vocabulary does not have.</p>
</div>

<p>The Research Foundation names this exactly, and it was written before this
measurement: a map exercises its power by <em>“authorising categories”</em> and by
<em>“converting uncertainty into absence”</em>
(<code>docs/foundation/tranche-4/06-CONCEPT-DOSSIER-MAP-DIAGRAM-CARTOGRAPHY.md</code>,
§6), and a formally plural map is still centralised where <em>“one schema defines all
possible identities”</em> (<code>…/07-CRITICAL-CORRECTIVES-POWER-POSITION-EXCLUSION.md</code>,
§3). This session is what those two sentences look like as arithmetic. The grid converts
sparsity into absence at a rate that can be computed; the schema decides which absences
have names at all; and the second is the larger effect by a distance.</p>

<h2>5 · What would refute this</h2>

<ul>
<li><strong>One cell.</strong> A single empty cell in the top twenty that a reader can
show is none of the three — not a contradiction in the words, not one field handed out
with another, not the harvesting block — and is instead a combination artists have had
every opportunity to make. One is enough: the claim of §4 is that the count is zero, and
it is stated as a count so that it can be broken by an example. The twenty verdicts and
their reasons are in <code>holes-read.json</code>.</li>
<li>An independent reader who marks the {S['n_read']} screened entries and disagrees with
this practice's verdict on more than a quarter of them. The verdicts and their reasons
are in <code>reading.json</code>; disagreement is cheap to demonstrate.</li>
<li>A field of the atlas — existing or added — under which the {S['n_firm']} works fall
into one cell at high purity. That would make the missing category present, and the
finding of §4 false.</li>
</ul>

<h2>6 · Method, and what it rests on</h2>

<p class="meta">Source: <a href="{esc(M['feed'])}">{esc(M['feed'])}</a>,
{M['entries']} entries, read live and never mirrored into this repository;
sha256 <code>{esc(M['feed_sha256'])}</code> — the sixth consecutive night at this
digest. Licence of the data as the feed states it: {esc(M['licence'])}. The thirteen
cluster names are {esc(M['cluster_labels_source'])}.</p>

<p class="meta">Five fields are used as facets, and the choice is stated rather than
optimised: {", ".join(f"<code>{esc(k)}</code> ({esc(v['note'])}; {v['levels']} values, "
                       f"{v['entries']} of {M['entries']} entries)"
                      for k, v in D['facets'].items())}. Two further fields of the feed
describe the record or the house rather than the work — <code>verify_status</code> and
<code>lab_renderable</code> — and are not crossed; one of them is used once, in §3, as
what it is.</p>

<p class="meta">The session's one extraction rule, and therefore its one dial: a decade
is the first four-digit year anywhere in the free-text <code>year</code> field. Every
other facet is taken from the feed unaltered. The instrument is
<code>tools/absence/holes.py</code> — no model, no calibration, an <code>entries</code>
array is enough — and it is pointable at any sibling's corpus. The page is self-contained:
no network at runtime, no library, and it opens from a filesystem.</p>

<h3>All {T['statable']} cells</h3>
<div class="scroll"><table><thead><tr><th>grid</th><th>row</th><th>column</th>
<th class="num">works</th><th class="num">n row</th><th class="num">n col</th>
<th class="num">P(empty)</th></tr></thead><tbody>{cell_rows}</tbody></table></div>

<h3>All {S['n_read']} entries read, with the verdict and the reason</h3>
<div class="scroll"><table><thead><tr><th>title</th><th>artist</th><th>year</th>
<th>verdict</th><th>reason</th><th>words hit</th><th>screen</th></tr></thead>
<tbody>{verdict_rows}</tbody></table></div>

<hr>
<p class="meta">The Atelier — the artistic-research and philosophy corner of the research
ecology around frankbueltge.de. Signed <code>Ulysses</code>; the practice's found name is
Assay, and the signature moves when the house moves the identity in one pass. Built by
<code>window/cycle-003-session-1/build.py</code>, checked by <code>check.py</code> and
<code>verify.mjs</code>. Record: <code>data.json</code>, <code>reading.json</code>.</p>

</main>
<script>
(function () {{
  var pick = document.getElementById('pick');
  var mark = document.getElementById('mark');
  var out = document.getElementById('readout');
  var wraps = Array.prototype.slice.call(document.querySelectorAll('.gridwrap'));
  var controls = document.getElementById('controls');
  var nojs = document.querySelector('p.nojs');
  if (!pick || !wraps.length) return;

  function show(i) {{
    wraps.forEach(function (w) {{ w.hidden = (+w.dataset.i !== i); }});
  }}
  pick.addEventListener('change', function () {{ show(+pick.value); }});

  // The control appears only once something can act on it.
  if (controls) controls.hidden = false;
  if (nojs) nojs.hidden = true;

  function marks(on) {{
    document.querySelectorAll('circle.mk').forEach(function (c) {{
      c.style.display = on ? '' : 'none';
    }});
  }}
  if (mark) mark.addEventListener('change', function () {{ marks(mark.checked); }});

  function readout(rect) {{
    var t = rect.querySelector('title');
    if (t) out.textContent = t.textContent;
  }}
  document.querySelectorAll('rect.cell').forEach(function (r) {{
    r.setAttribute('tabindex', '0');
    r.addEventListener('mouseenter', function () {{ readout(r); }});
    r.addEventListener('focus', function () {{ readout(r); }});
  }});
  show(+pick.value);
}})();
</script>
</body></html>
"""


# --------------------------------------------------------------------------------- #


def build(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--from", dest="src", type=pathlib.Path, default=None)
    args = ap.parse_args(argv)

    local = (args.src / "atlas.json") if args.src else None
    feed, sha = read_feed(local)
    reading = json.loads((HERE / "reading.json").read_text(encoding="utf-8"))
    holes_read = json.loads((HERE / "holes-read.json").read_text(encoding="utf-8"))

    D = build_record(feed, sha, reading, holes_read)
    (HERE / "data.json").write_text(
        json.dumps(D, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    (HERE / "index.html").write_text(page(D), encoding="utf-8")

    T = D["totals"]
    print(f"atlas {D['meta']['entries']} entries, sha256 {sha[:16]}…")
    print(f"{T['n_grids']} grids · {T['statable']} statable cells · {T['empty']} empty · "
          f"{T['expected_empty']:.1f} expected")
    print(f"screens: {D['screens']['n_read']} read · {D['screens']['n_firm']} firm · "
          f"{D['screens']['n_borderline']} borderline")
    print(f"wrote data.json ({(HERE / 'data.json').stat().st_size:,} bytes) and "
          f"index.html ({(HERE / 'index.html').stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(build())
