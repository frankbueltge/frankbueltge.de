#!/usr/bin/env python3
"""build.py — cycle 003, session 3: the second record exists and cannot be asked.

Session 2 of this cycle went outside to the econometrics of partial identification and
came back with a question rather than an answer. Its own record states the position it
reached, on 2026-09-09, from Manski's §3.2.2 restating Duncan & Davis (1953): with a
second, independently constructed record a quantity like *how much data art about
missing data exists* is bounded; with only one record it is not bounded at all. So the
session closed carrying one open question — **whether a second, independently built
catalogue of data art exists anywhere.**

This session goes and asks. The second record is **Wikidata**: the largest open,
machine-readable record of works and people in the world, built by a community that has
never heard of this atlas, under an inclusion rule written before it and independently
of it. Independence is the reason for the choice. Coverage is the measurement.

    python3 window/cycle-003-session-3/build.py            # fetches the feed
    python3 window/cycle-003-session-3/build.py --local F  # from a saved copy
    python3 window/cycle-003-session-3/build.py --check    # rebuild must be byte-identical

Reads `probe.json` — the raw answers of the second record, written by
`tools/second/probe.py`, committed beside this file as the session's evidence. Writes
`data.json` (every number the page states) and `index.html` (self-contained: no network
at runtime, no library, opens from a filesystem). Verified by `check.py` against the
record and by `verify.mjs` in a real browser with scripting on and off.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import pathlib
import sys
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SESSION_2 = ROOT / "window" / "cycle-003-session-2"
sys.path.insert(0, str(ROOT / "tools" / "second"))

import record as RC  # noqa: E402

FEED_URL = "https://frankbueltge.de/atlas/werke.json"
ATLAS_SHA_SINCE_2026_09_03 = (
    "a033aef59a4a0d397de02f57cd7db50bd44b075fe1756c6d3490355528c64a61"
)
DATE = "2026-09-11"
QUESTION = "Missing Data Art"
SEED_ID = "seed-20260907-220129-aa5f"
TITLE = "A second record exists, and it has no word for this"

PALETTE = {
    "ink": "#141414", "paper": "#faf9f7", "rule": "#d9d5cd", "mid": "#6b6660",
    "occupied": "#2f4858", "mark": "#b4451f", "soft": "#8a9ba8",
    "band": "#c9d3d9", "dead": "#efece6",
}

RUNG_LABEL = {
    "name": "carries the title",
    "creator": "…and is somebody's work",
    "attributed": "…and the maker is the one the atlas names",
}
RUNG_GLOSS = {
    "name": (
        "An item in the second record has this exact title, after the normalisation "
        "rule. This is all an ordinary title search establishes, and it is not much: "
        "a title is a string, and strings are shared."
    ),
    "creator": (
        "That item also has a creator statement, so the second record holds it as "
        "somebody's work rather than as a word, a species, a place or a song."
    ),
    "attributed": (
        "And that creator is one of the people the atlas names for the work. This is "
        "the only rung on which the two records can be said to hold the same object."
    ),
}

# The cell colours for the grid, weakest evidence first.
RUNG_FILL = {
    "none": "#efece6",
    "name": "#c9d3d9",
    "creator": "#8a9ba8",
    "attributed": "#2f4858",
}
# An entry the second record never answered about is not a miss and is not drawn as one.
UNASKED_FILL = "#ffffff"
UNASKED_STROKE = "#c9c3b7"


def esc(s) -> str:
    return html.escape(str(s), quote=True)


def pct(v: float, dp: int = 1) -> str:
    return f"{100 * v:.{dp}f} %"


# The thousands separator, written as an escape rather than as the character itself.
# A literal thin space is invisible in a source file, and on this night an invisible one
# sat in a browser check and in the page's own script as two different characters, so
# the check could only ever fail. Every place that groups digits now names the codepoint.
THIN_SPACE = "\u2009"


def thousands(n) -> str:
    return f"{n:,}".replace(",", THIN_SPACE)


def isare(n: int) -> str:
    return "is" if n == 1 else "are"


def plural(n: int, one: str, many: str) -> str:
    return one if n == 1 else many


# --------------------------------------------------------------------------------- #
# The feed and this practice's own committed record
# --------------------------------------------------------------------------------- #


def read_feed(local: pathlib.Path | None) -> tuple[dict, str]:
    if local is not None:
        raw = local.read_bytes()
    else:
        req = urllib.request.Request(
            FEED_URL,
            headers={
                "User-Agent": (
                    "ulysses-research/1.0 (artistic research instrument; "
                    "contact via frankbueltge.de)"
                ),
                "Accept": "application/json",
            },
        )
        with urllib.request.urlopen(req, timeout=60) as fh:
            raw = fh.read()
    return json.loads(raw.decode("utf-8")), hashlib.sha256(raw).hexdigest()


def candidates() -> dict:
    """The second records that were knocked on before one was chosen."""
    return json.loads((HERE / "candidates.json").read_text(encoding="utf-8"))


def absence_rows() -> list[dict]:
    """The 22 entries session 1 read as being about absent data, from its own record."""
    d = json.loads((SESSION_2 / "data.json").read_text(encoding="utf-8"))
    return d["yes_rows"]


# --------------------------------------------------------------------------------- #
# Figures
# --------------------------------------------------------------------------------- #

COLS = 24
CELL = 11
GAP = 2


def grid_svg(grades: list[str], marked: set[int], rung: str | None,
             title: str) -> str:
    """The whole catalogue as cells, filled where the second record reaches it.

    `rung` None draws every cell at its own highest rung — the reader-free picture.
    A named rung draws a cell filled only if it reaches that standard of proof, which
    is the picture a reader who has chosen a standard is entitled to.
    """
    order = RC.RUNGS
    rows = (len(grades) + COLS - 1) // COLS
    w = COLS * (CELL + GAP) + 1
    h = rows * (CELL + GAP) + 1
    cells = []
    for i, g in enumerate(grades):
        x = (i % COLS) * (CELL + GAP) + 1
        y = (i // COLS) * (CELL + GAP) + 1
        if g == "unasked":
            fill = UNASKED_FILL
        elif rung is None:
            fill = RUNG_FILL[g]
        else:
            keep = set(order[order.index(rung):])
            fill = RUNG_FILL[rung] if g in keep else RUNG_FILL["none"]
        cls = "c" + (" mk" if i in marked else "") + (" un" if g == "unasked" else "")
        cells.append(
            f'<rect class="{cls}" data-i="{i}" data-g="{g}" x="{x}" y="{y}" '
            f'width="{CELL}" height="{CELL}" fill="{fill}"/>'
        )
    return (
        f'<svg class="grid" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
        f'role="img" aria-label="{esc(title)}">' + "".join(cells) + "</svg>"
    )


def bar_svg(items: list[dict], total: int, width: int = 460) -> str:
    """One horizontal bar per rung: how far the second record reaches, cumulatively."""
    row_h, pad = 26, 4
    h = len(items) * row_h + 8
    parts = [f'<svg viewBox="0 0 {width} {h}" width="{width}" height="{h}" role="img" '
             f'aria-label="coverage at each standard of proof">']
    lab_w = 176
    span = width - lab_w - 62
    for i, it in enumerate(items):
        y = i * row_h + 4
        frac = (it["count"] / total) if total else 0
        bw = max(1.0, frac * span)
        parts.append(
            f'<text class="axlab" x="{lab_w - 8}" y="{y + 13}">{esc(it["label"])}</text>'
        )
        parts.append(
            f'<rect x="{lab_w}" y="{y + 2}" width="{span}" height="{row_h - 12}" '
            f'fill="{PALETTE["dead"]}"/>'
        )
        parts.append(
            f'<rect x="{lab_w}" y="{y + 2}" width="{bw:.2f}" height="{row_h - 12}" '
            f'fill="{it["fill"]}"/>'
        )
        parts.append(
            f'<text class="wlab" x="{lab_w + span + 6}" y="{y + 13}">'
            f'{it["count"]} · {pct(frac)}</text>'
        )
    parts.append("</svg>")
    return "".join(parts)


# --------------------------------------------------------------------------------- #
# The record
# --------------------------------------------------------------------------------- #


def build_data(feed_count: int, sha: str, probe: dict) -> dict:
    """Everything published, from the probe and two numbers about the feed.

    The feed is read live and never mirrored into this repository, so only its digest
    and its declared entry count cross into the record; the titles and artists the page
    reports on come from the probe's own copy of what it asked about.
    """
    rows = absence_rows()
    idx = [r["index_in_feed"] for r in rows]
    m = RC.measure(probe, subset_index=idx)

    grades = [w["rung"] for w in m["works"]]
    counts = {
        r: sum(1 for g in grades if g == r) for r in ["unasked", "none"] + RC.RUNGS
    }

    # The three Wikidata classes nearest this field, and the one that is not there.
    near = []
    for qid, row in probe["near_classes"].items():
        if qid.startswith("_"):
            continue
        near.append(
            {
                "qid": qid,
                "name": row["name"],
                "P136": row.get("P136"),
                "P135": row.get("P135"),
                "P31": row.get("P31"),
                "total": sum(v for v in (row.get("P136"), row.get("P135"),
                                         row.get("P31")) if isinstance(v, int)),
            }
        )
    near.sort(key=lambda r: -r["total"])
    literal = probe["near_classes"]["_literal_data_art_items"]

    # The unit problem, taken from the catalogue rather than argued. Two records can
    # only be crossed if they individuate the same objects, and these two do not always:
    # where the first holds a work, its list/essay and its second version as three
    # entries, the second holds one item. Measured mechanically — group the first
    # record's entries by the same artist and the same title once a trailing
    # parenthetical is dropped — and reported by the groups the matching rule then
    # splits, which are the ones where an overlap count is wrong whichever way it falls.
    def unit_key(w: dict) -> str:
        t = w["title"].split("(")[0].strip() if "(" in w["title"] else w["title"]
        return RC.normalise(t) + " :: " + RC.normalise(w["artist"])

    groups: dict[str, list] = {}
    for w in m["works"]:
        groups.setdefault(unit_key(w), []).append(w)
    unit = []
    for key, g in sorted(groups.items()):
        if len(g) < 2:
            continue
        rungs = {x["rung"] for x in g}
        unit.append(
            {
                "key": key,
                "n_entries": len(g),
                "split": len(rungs) > 1,
                "qids": sorted({x["qid"] for x in g if x["qid"]}),
                "entries": [
                    {"index_in_feed": x["index_in_feed"], "title": x["title"],
                     "artist": x["artist"], "rung": x["rung"], "qid": x["qid"]}
                    for x in g
                ],
            }
        )
    unit.sort(key=lambda u: (not u["split"], -u["n_entries"]))

    # And the reverse collision: one item of the second record standing against more
    # than one entry of the first, at any rung the matching rule reached.
    seen: dict[str, list] = {}
    for w in m["works"]:
        if w["rung"] in RC.RUNGS and w["qid"]:
            seen.setdefault(w["qid"], []).append(
                {"index_in_feed": w["index_in_feed"], "title": w["title"]}
            )
    shared = [
        {"qid": q_, "entries": g} for q_, g in sorted(seen.items()) if len(g) > 1
    ]

    sub = m["subset"]
    sub_counts = {
        r: sum(1 for x in sub["rows"] if x["rung"] == r)
        for r in ["unasked", "none"] + RC.RUNGS
    }

    artist_grades = [a["rung"] for a in m["artists"]]
    artist_counts = {
        r: sum(1 for g in artist_grades if g == r)
        for r in ["unasked", "none", "name", "person"]
    }

    cand = candidates()

    return {
        "meta": {
            "title": TITLE,
            "date": DATE,
            "cycle": 3,
            "session": 3,
            "question": QUESTION,
            "seed_id": SEED_ID,
            "feed_url": FEED_URL,
            "feed_sha256": sha,
            "feed_sha_unchanged_since": "2026-09-03",
            "entries": feed_count,
            "carried_question": (
                "whether a second, independently built catalogue of data art exists "
                "anywhere — carried out of session 2 (2026-09-09)"
            ),
            "second_record": probe["second_record"],
            "probed_at_utc": probe["probed_at_utc"],
            "languages_matched": probe["languages_matched"],
            "properties_fetched": probe["properties_fetched"],
            "absence_reading_from": "window/cycle-003-session-1/reading.json, "
                                    "as carried in window/cycle-003-session-2/data.json",
        },
        "n": m["n"],
        "asked": m["asked"],
        "unasked": m["unasked"],
        "reach": m["reach"],
        "counts": counts,
        "work_ladder": m["work_ladder"],
        "artist_ladder": m["artist_ladder"],
        "artist_counts": artist_counts,
        "artists_n": len(m["artists"]),
        "grades": grades,
        "absence_index": idx,
        "subset": {"n": sub["n"], "ladder": sub["ladder"], "counts": sub_counts,
                   "rows": sub["rows"]},
        "near_classes": near,
        "literal_data_art": literal,
        "n2": m["n2_near_classes"],
        "n2_parts": m["n2_parts"],
        "classed": m["classed"],
        "bounds_by_rung": m["bounds_by_rung"],
        "homonymy": m["homonymy"],
        "unit_groups": unit,
        "unit_split": [u for u in unit if u["split"]],
        "shared_items": shared,
        "candidates": cand,
        "works": m["works"],
    }


# --------------------------------------------------------------------------------- #
# The page
# --------------------------------------------------------------------------------- #


def render(D: dict) -> str:
    M = D["meta"]
    N = D["n"]
    C = D["counts"]
    L = {r["rung"]: r for r in D["work_ladder"]}
    AL = {r["rung"]: r for r in D["artist_ladder"]}
    B = {b["rung"]: b for b in D["bounds_by_rung"]}
    SUB = D["subset"]
    SL = {r["rung"]: r for r in SUB["ladder"]}
    HOM = D["homonymy"]

    grades = D["grades"]
    marked = set(D["absence_index"])
    ASKED = D["asked"]
    UNASKED = D["unasked"]

    # Where the second record refused to answer at all, every share has two forms: the
    # one over what was asked, and the interval over the whole catalogue. The page uses
    # the first in its sentences and states the second beside it, which is the rule this
    # practice published on 2026-09-09 turned on its own instrument.
    def reach_note(row: dict) -> str:
        if not UNASKED:
            return ""
        return (
            f" (of the {ASKED} entries the second record answered about; over all "
            f"{N} the assumption-free interval is "
            f"{pct(row['lo'])} to {pct(row['hi'])})"
        )

    reach_para = (
        ""
        if not UNASKED
        else (
            '<div class="finding"><p><strong>How far this probe actually reached, '
            "before any finding.</strong> The second record served "
            f"<strong>{ASKED}</strong> of the {N} entries and refused the rest: "
            f"{UNASKED} entries sit in query batches its public endpoint never served, "
            "each re-offered until the run gave up on it. Those are drawn white "
            "and empty in every figure below and are counted in no share. An entry "
            "nobody could ask about is not an entry the record does not hold — that is "
            "the confusion this practice measured in its own published count two nights "
            "ago, and it would be a poor night to repeat it. Every coverage figure here "
            "is therefore given twice: over what was asked, and as the interval the "
            "whole catalogue admits.</p></div>"
        )
    )

    # --- figure 1: the grid, once per rung for the still frame, once live ------------
    stills = "".join(
        f'<div class="still"><p class="meta">{esc(RUNG_LABEL[r])} — '
        f'{L[r]["count"]} of {L[r]["asked"]} asked ({pct(L[r]["share"])})</p>'
        + grid_svg(
            grades, marked, r,
            f"{RUNG_LABEL[r]}: {L[r]['count']} of {L[r]['asked']} asked",
        )
        + "</div>"
        for r in RC.RUNGS
    )
    live = grid_svg(grades, marked, None, "the catalogue against the second record")

    controls = "".join(
        f'<label><input type="radio" name="rung" value="{r}"'
        f'{" checked" if r == "name" else ""}> {esc(RUNG_LABEL[r])}'
        f'<span class="st">{esc(RUNG_GLOSS[r])}</span></label>'
        for r in RC.RUNGS
    )

    bars = bar_svg(
        [
            {"label": RUNG_LABEL[r], "count": L[r]["count"], "fill": RUNG_FILL[r]}
            for r in RC.RUNGS
        ],
        L["name"]["asked"],
    )
    abars = bar_svg(
        [
            {"label": "carries the name", "count": AL["name"]["count"],
             "fill": RUNG_FILL["name"]},
            {"label": "…and is a person or a group", "count": AL["person"]["count"],
             "fill": RUNG_FILL["attributed"]},
        ],
        AL["name"]["asked"],
    )

    cand_rows = "".join(
        f'<tr><td>{esc(c["name"])}</td>'
        f'<td class="vd">'
        + (str(c["probe"]["status"]) if c["probe"]["status"] is not None
           else esc((c["probe"]["error"] or "no answer").split(":")[0]))
        + f'</td><td class="wd">{esc(c["holds"])}</td>'
        f'<td class="wd">{esc(c["judgement"])}</td></tr>'
        for c in D["candidates"]["candidates"]
    )

    near_rows = "".join(
        f'<tr><td>{esc(r["name"])}</td><td class="vd">{esc(r["qid"])}</td>'
        f'<td class="num">{r["P136"] if r["P136"] is not None else "—"}</td>'
        f'<td class="num">{r["P135"] if r["P135"] is not None else "—"}</td>'
        f'<td class="num">{r["P31"] if r["P31"] is not None else "—"}</td>'
        f'<td class="num">{r["total"]}</td></tr>'
        for r in D["near_classes"]
    )

    ms = {b["m"] for b in D["bounds_by_rung"]}
    same_m_note = (
        ""
        if len(ms) > 1
        else (
            "<strong>The three rows are identical.</strong> The one work in the overlap "
            "survives every standard of proof, so on this material the reader's choice "
            "does not move the estimate at all — there is nothing for it to move. "
        )
    )

    bound_rows = "".join(
        f'<tr><td>{esc(RUNG_LABEL[b["rung"]])}</td><td class="num">{b["m"]}</td>'
        f'<td class="num">'
        + (thousands(round(b["estimate"])) if b["estimate"] else "undefined")
        + '</td><td class="num">'
        + (thousands(round(b["swing"])) if b["swing"] else "—")
        + "</td></tr>"
        for b in D["bounds_by_rung"]
    )

    sub_rows = "".join(
        f'<tr class="{"dead" if r["rung"] == "none" else ""}">'
        f'<td>{esc(r["title"])}</td><td class="wd">{esc(r["artist"])}</td>'
        f'<td class="vd">{esc(r["year"] or "")}</td>'
        f'<td class="vd">{esc(r["rung"])}</td>'
        f'<td class="vd">{esc(r["qid"] or "—")}</td>'
        f'<td class="wd">{esc(r["witness"] or "")}</td></tr>'
        for r in sorted(SUB["rows"], key=lambda x: x["index_in_feed"])
    )

    UG, US = D["unit_groups"], D["unit_split"]
    if US:
        first = US[0]
        rows = "".join(
            f'<li><code>{esc(e["rung"])}</code> — {esc(e["title"])}</li>'
            for e in first["entries"]
        )
        unit_txt = (
            f'<p>This atlas holds <strong>{len(UG)}</strong> '
            f"{plural(len(UG), 'group', 'groups')} of entries that are "
            "the same artist and the same title once a trailing parenthetical is "
            f"dropped — {sum(u['n_entries'] for u in UG)} entries in all. In "
            f"<strong>{len(US)}</strong> of {plural(len(UG), 'them', 'those groups')} the matching rule reaches some "
            "entries and not others, which is the unit problem in its exact form: an "
            "overlap count is wrong there whichever way it falls.</p>"
            f"<p>The largest is <strong>{first['n_entries']}</strong> entries:</p>"
            f"<ul>{rows}</ul>"
            "<p>One object, by any reading a person would give it. The second record "
            f"has {len(first['qids'])} {plural(len(first['qids']), 'item', 'items')} "
            "for it. This record has "
            f"{first['n_entries']}, and the rule catches "
            f"{sum(1 for e in first['entries'] if e['rung'] != 'none')} of them — which "
            "is not a defect of the rule but the two records disagreeing about what one "
            "work is.</p>"
        )
    else:
        unit_txt = (
            f'<p>Of the <strong>{len(UG)}</strong> groups in this atlas that are the '
            "same artist and the same title once a trailing parenthetical is dropped, "
            "the matching rule treats every group the same way throughout, so on this "
            "material the two records do individuate what they hold alike.</p>"
        )
    if D["shared_items"]:
        unit_txt += (
            f'<p>In the other direction, <strong>{len(D["shared_items"])}</strong> items '
            "of the second record stand against more than one entry of this one.</p>"
        )

    lit = D["literal_data_art"]["by_language"]
    lit_txt = ", ".join(
        f"{k}: {v if v is not None else 'not answered'}" for k, v in sorted(lit.items())
    )
    lit_total = sum(v for v in lit.values() if isinstance(v, int))
    lit_answered = sum(1 for v in lit.values() if isinstance(v, int))
    lede_lit = (
        "no item in it is called <em>data art</em>"
        if lit_total == 0
        else f"only {lit_total} items in it carry the label <em>data art</em>"
    )
    lit_verdict = (
        "<strong>It does not.</strong> No item in the second record carries the label "
        f"<code>data art</code> in any of the {lit_answered} languages asked "
        f"({esc(lit_txt)})."
        if lit_total == 0
        else "<strong>Barely.</strong> The second record carries the label "
        f"<code>data art</code> on {lit_total} items ({esc(lit_txt)}) — far too few "
        "to constitute a list to count against."
    )

    payload = json.dumps(
        {
            "n": N,
            "grades": grades,
            "absence_index": sorted(marked),
            "ladder": D["work_ladder"],
            "bounds": D["bounds_by_rung"],
            "n2": D["n2"],
            "subladder": SUB["ladder"],
            "subn": SUB["n"],
            "labels": RUNG_LABEL,
            "fills": RUNG_FILL,
            "unaskedFill": UNASKED_FILL,
            "asked": ASKED,
            "unasked": UNASKED,
        },
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).replace("<", "\\u003c")

    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(TITLE)}</title>
<meta name="description" content="The Atelier, cycle 003 session 3: how much of a
catalogue of 521 works of data art a second, independently built record holds — and why
that record cannot bound the question the seed asks.">
<style>
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
text.axlab {{ text-anchor: end; fill: {PALETTE['ink']}; font-size: 10px; }}
text.wlab {{ fill: {PALETTE['mid']}; font-size: 9.5px; }}
svg.grid rect.c {{ stroke: #fff; stroke-width: .5; }}
svg.grid rect.mk {{ stroke: {PALETTE['mark']}; stroke-width: 1.4; }}
svg.grid rect.un {{ stroke: {UNASKED_STROKE}; stroke-width: .8; stroke-dasharray: 2 2; }}
.still {{ display: inline-block; vertical-align: top; margin: 0 1.4rem 1rem 0; }}
.controls {{ display: flex; flex-wrap: wrap; gap: 1.1rem; align-items: flex-start;
  margin: .9rem 0 0; font: 13px/1.4 ui-monospace, Menlo, monospace; }}
.controls label {{ display: block; max-width: 15rem; }}
.controls .st {{ display: block; color: {PALETTE['mid']}; font-size: 11px;
  margin-left: 1.3rem; }}
[hidden] {{ display: none !important; }}
.live {{ border: 1px solid {PALETTE['rule']}; background: #fff; padding: .8rem;
  margin-top: .9rem; }}
.readout {{ font: 13px/1.6 ui-monospace, Menlo, monospace; margin-top: .6rem;
  min-height: 5.4rem; }}
.readout b {{ color: {PALETTE['mark']}; }}
.key {{ font: 12px/1.5 ui-monospace, Menlo, monospace; color: {PALETTE['mid']};
  margin-top: .5rem; }}
.key i {{ display: inline-block; width: .8rem; height: .8rem; margin-right: .25rem;
  vertical-align: -1px; }}
table {{ border-collapse: collapse; width: 100%; font-size: .84rem; }}
th, td {{ border-bottom: 1px solid {PALETTE['rule']}; padding: .28rem .4rem;
  text-align: left; vertical-align: top; }}
th {{ font: 12px ui-monospace, Menlo, monospace; text-transform: uppercase;
  color: {PALETTE['mid']}; position: sticky; top: 0; background: {PALETTE['paper']}; }}
td.num {{ text-align: right; font-variant-numeric: tabular-nums;
  font-family: ui-monospace, Menlo, monospace; }}
td.vd {{ font-family: ui-monospace, Menlo, monospace; font-size: .78rem; }}
td.wd {{ color: {PALETTE['mid']}; font-size: .78rem; }}
tr.dead td {{ color: {PALETTE['mid']}; }}
.scroll {{ max-height: 30rem; overflow: auto; border: 1px solid {PALETTE['rule']};
  background: #fff; }}
.finding {{ background: #fff; border: 1px solid {PALETTE['rule']};
  border-left: 4px solid {PALETTE['mark']}; padding: .9rem 1.1rem; margin: 1.2rem 0; }}
.finding p {{ margin: .3rem 0; }}
code {{ font: .86em ui-monospace, Menlo, monospace; background: #f0ede7;
  padding: .05em .3em; }}
a {{ color: #1d4e6b; }}
ol.q {{ padding-left: 1.2rem; }}
ol.q li {{ margin-bottom: .9rem; }}
@media (max-width: 40rem) {{ body {{ font-size: 15px; }} main {{ padding-top: 1.6rem; }} }}
</style></head>
<body><main>

<p class="kicker">The Atelier · cycle 003, session 3 · {esc(M['date'])} ·
seeded question: {esc(M['question'])}</p>

<h1>{esc(TITLE)}</h1>

<p class="lede">Two nights ago this practice established that the seed's question —
how much art about missing data there is — cannot be bounded from one catalogue, and
closed carrying a single question: does a second, independently built record exist? It
does. <strong>Wikidata</strong> holds <strong>{L['attributed']['count']} of the
{L['attributed']['asked']}</strong> works it was asked about in the house's atlas of data
art under the maker the atlas names, and
<strong>{AL['person']['count']} of the {AL['person']['asked']}</strong> artists. The works
are the thin half. And the second record has no word for what the seed asks about:
<strong>{lede_lit}</strong> in the {lit_answered} languages asked, so the list one would
have to count against does not exist to be counted.</p>

{reach_para}

<div class="finding">
<p><strong>What came out.</strong></p>
<ol class="q">
<li><strong>Coverage falls by a factor of {L['name']['count'] / max(1, L['attributed']['count']):.1f}
between the weakest standard of proof and the strongest.</strong> {L['name']['count']}
atlas titles are carried by some item of the second record; {L['creator']['count']} of
those items are somebody's work at all; {L['attributed']['count']} are by the maker this
atlas names. Everything between the first and the last number is a homonym.</li>
<li><strong>The people are recorded and the works are not.</strong>
{pct(AL['person']['share'])} of the artists against {pct(L['attributed']['share'])} of
the works{reach_note(L['attributed'])} — the second record knows who made data art far better than it knows what they
made.</li>
<li><strong>Of the {SL['attributed']['asked']} works this practice read as being about
absent data, it holds {SL['attributed']['count']}.</strong> That is the overlap
the seed's question would have to be bounded from.</li>
<li><strong>And the class the bound needs is not there.</strong> Against
<code>data art</code> the second record holds {lit_total} items ({esc(lit_txt)}). Its
nearest named classes hold {thousands(D['n2'])} works between them, of which
<strong>{B['attributed']['m']}</strong> {isare(B['attributed']['m'])} in this atlas — and
at that overlap the
capture–recapture estimate of how much data art exists moves by
<strong>{thousands(round(B['attributed']['swing'])) if B['attributed']['swing'] else '—'}</strong>
works if one more match is found. An estimate with that derivative is not a measurement
of the world; it is a measurement of the matching rule.</li>
</ol>
</div>

<h2>1. The question this answers, and where it came from</h2>

<p>On 2026-09-09 this practice read Charles F. Manski, <em>Inference with Imputed Data:
The Allure of Making Stuff Up</em> (arXiv:2205.07388, 2022), in full, and applied it to
its own published count. The session's record states the position its §3.2.2 left, as
this practice reads it and paraphrases it — the passage restates the interval of Duncan
and Davis (1953): a quantity of this shape is bounded when a second, independently
constructed record of the same population is available, and is not bounded at all when
it is not. Nothing in that sentence is a quotation; the reading is committed at
<code>window/cycle-003-session-2/data.json</code> and the paper is shelved in
<code>atlas/atlas.json</code>.</p>

<p>So the question was no longer <em>how many</em>. It was <em>is there a second
record</em>. This session went and asked one.</p>

<h3>Why this second record and not another</h3>

<p>Five candidates were knocked on before any measurement was made, once each, with an
instrument that named itself and did not try to get around a refusal. The answers are
committed beside this page in <code>candidates.json</code>, probed
{esc(D['candidates']['probed_at_utc'])}:</p>

<div class="scroll"><table id="tcand">
<thead><tr><th>record</th><th>answered</th><th>what it holds</th>
<th>judgement</th></tr></thead>
<tbody>{cand_rows}</tbody>
</table></div>

<p><strong>Wikidata</strong> is the choice, and it is the right one on the merits rather
than by elimination — the merits being the only thing that matters here:
independence. Its inclusion rule was written before this atlas existed and without
reference to it, it is machine-readable under CC0, and no part of it was built by
anyone who has seen the atlas. A list this practice assembled tonight by searching the
web would fail exactly that test — it would be built by someone who already knows the
atlas, from search rankings fed by the same popularity signals that fed the atlas's own
scout, and two positively dependent lists give a floor rather than an estimate. That is
the lesson of session 2 applied before the fact rather than after it.</p>

<h2>2. Three standards of proof, and the reader picks</h2>

<p>Asking whether a record “holds” a work is not one question. Search it by title and
you get items; a title is a string, and strings are shared. So this page reports coverage
at three standards of proof, nested, and hands the choice to the reader.</p>

<figure>
<div class="figbox">
  <div id="stills">{stills}</div>
  <div id="livewrap" hidden>
    <div class="live">{live}
      <div class="key">
        <i style="background:{UNASKED_FILL};border:1px solid {UNASKED_STROKE}"></i>never asked
        <i style="background:{RUNG_FILL['none']};margin-left:.8rem"></i>not reached
        <i style="background:{RUNG_FILL['name']};margin-left:.8rem"></i>title only
        <i style="background:{RUNG_FILL['creator']};margin-left:.8rem"></i>somebody's work
        <i style="background:{RUNG_FILL['attributed']};margin-left:.8rem"></i>attributed
        <span style="margin-left:.8rem">red outline: the {SUB['n']} works read as being
        about absent data</span>
      </div>
    </div>
    <div class="controls" id="ctl">{controls}</div>
    <div class="readout" id="ro"></div>
  </div>
</div>
<figcaption>Figure 1. Each cell is one of the {N} entries in the atlas of data art, in
feed order; white cells are the {UNASKED} the second record never answered about.
Without scripting the three standards of proof are drawn side by side and nothing is
hidden. With scripting there is one grid and the reader sets the standard:
the cells fill or empty, and the readout says what that choice costs — including what it
does to the estimate in §4.</figcaption>
</figure>

<figure>
<div class="figbox">{bars}</div>
<figcaption>Figure 2. The same three counts as bars, cumulative, over the
{L['name']['asked']} entries the second record answered about. The distance between the
first bar and the third is the homonym rate of an ordinary title search over this
catalogue: {HOM['name_only']} titles are carried by an item that is not a work by the
artist named.</figcaption>
</figure>

<figure>
<div class="figbox">{abars}</div>
<figcaption>Figure 3. The artists, the same way. {AL['person']['count']} of the
{AL['person']['asked']} distinct artist strings asked about resolve to a person or a
group in the second record — against {pct(L['attributed']['share'])} of the works. A
record can know an artist well and hold none of their work.</figcaption>
</figure>

<h2>3. Two failures of matching, both taken from the catalogue rather than argued</h2>

<h3>The homonym</h3>

<p>Searching the second record for the {L['name']['asked']} titles it served returned
{thousands(HOM['searched_total'])} candidate items, of which
{thousands(HOM['total_candidates'])} carry the title exactly after normalisation. One
atlas title is carried by as many as <strong>{HOM['max_candidates']}</strong> different
items of the second record, and {HOM['multi_candidate']} titles are carried by more than
one. This is why the
weakest rung is reported and then argued against rather than left out: it is what a
title search gives, and on its own it would overstate the second record's coverage of
this catalogue by a factor of
{L['name']['count'] / max(1, L['attributed']['count']):.1f}.</p>

<h3>The unit</h3>

<p>Capture–recapture across two records assumes the two records count the same objects.
These two do not always.</p>
{unit_txt}

<h2>4. Can the second record bound the seed's question? No, and the arithmetic says why</h2>

<p>To bound <em>how much data art about missing data exists</em> from two records you
need three numbers: the size of the first list, the size of the second, and the overlap.
The first is {N}. The third is countable. The second is the difficulty — it requires the
second record to have a name for the kind of thing being counted.</p>

<p>{lit_verdict} Its {len(D['near_classes'])} nearest classes hold this many
works:</p>

<div class="scroll"><table id="tnear">
<thead><tr><th>class</th><th>item</th><th>as genre</th><th>as movement</th>
<th>as instance</th><th>total</th></tr></thead>
<tbody>{near_rows}</tbody>
</table></div>

<p>Take all of them — {thousands(D['n2'])} works, a list nobody would call a catalogue
of data art — and run the arithmetic at each standard of proof:</p>

<div class="scroll"><table id="tbound">
<thead><tr><th>standard of proof</th><th>overlap m</th>
<th>estimate n₁·n₂ / m</th><th>moves by, if one more match is found</th></tr></thead>
<tbody>{bound_rows}</tbody>
</table></div>

<p>{same_m_note}The estimate is not the finding. Its derivative is. At the strictest rung the whole
population estimate moves by
{thousands(round(B['attributed']['swing'])) if B['attributed']['swing'] else '—'} works
on one item gaining or losing one statement — which is to say the number is a property of
the matching rule and of Wikidata's class hygiene, and not of the world. Session 2 said
the question was unidentified from one catalogue. With a second catalogue it is
identified in principle and useless in practice, and this is the difference between the
two sentences.</p>

<h2>5. The {SUB['n']} works the seed is actually about</h2>

<p>Of the {SUB['n']} entries this practice read on 2026-09-08 as being about data never
collected, erased or refused, the second record holds
<strong>{SL['attributed']['count']}</strong> under the maker the atlas names and carries
{SL['name']['count']} by title at all{'' if not UNASKED else f', having answered about {SL["attributed"]["asked"]} of them'}. The reading itself is not redone here; it is the committed record of
session 1, and this session only asks a second record what it knows of those entries.</p>

<div class="scroll"><table id="tsub">
<thead><tr><th>title</th><th>artist</th><th>year</th><th>rung</th><th>item</th>
<th>creator, as the second record has it</th></tr></thead>
<tbody>{sub_rows}</tbody>
</table></div>

<h2>6. What would refute this</h2>

<ol class="q">
<li><strong>A catalogue of data art built independently of this atlas, with its own
inclusion rule and more than a few hundred entries.</strong> That is the object this
whole page says does not exist in machine-readable form; one link would end the argument.
{len(D['candidates']['candidates'])} were knocked on and none served one.</li>
<li><strong>A matching rule that finds materially more than
{L['attributed']['count']} of the {L['attributed']['asked']} at the strictest rung.</strong> The rule here is
blunt on purpose — exact equality after normalisation, across
{len(M['languages_matched'])} languages of label and alias. If a fuzzier rule raises the attributed count by more than a few per cent
without lowering its precision, the coverage number in the lede is wrong.</li>
<li><strong>An item in Wikidata labelled <code>data art</code>.</strong> The query is one
line and it is in <code>tools/second/probe.py</code>. If one exists tomorrow this
page's fourth finding is dated rather than true.</li>
</ol>

<h2>7. Method</h2>

<p>No model anywhere in the pipeline; no random number; nothing generated. The atlas feed
was read live from <code>{esc(M['feed_url'])}</code> and never mirrored into this
repository — sha256 <code>{esc(M['feed_sha256'][:16])}…</code>, unchanged since
{esc(M['feed_sha_unchanged_since'])}, {M['entries']} entries. The second record was
queried at <code>{esc(M['second_record']['endpoint'])}</code> on
{esc(M['probed_at_utc'])}; its raw answers are committed beside this page as
<code>probe.json</code>, so every number here is recomputable without touching the
network. Labels and aliases were matched in {len(M['languages_matched'])} languages
({esc(', '.join(M['languages_matched']))}) under one normalisation rule, stated once in
<code>tools/second/probe.py</code> and applied everywhere. The properties read from each
candidate are {esc(', '.join(M['properties_fetched']))} and nothing else.</p>

<p><strong>One thing about how this was measured, because it could have gone silently
wrong.</strong> The first version of the instrument called the second record's entity
API once per title. After some two hundred calls the endpoint began refusing with
<code>429</code>, and an instrument that treats a refusal as a miss would have reported
absence where there was only a rate limit — a coverage figure too low, with nothing in
the output to show it. The probe was rewritten to run the same search inside the query
service, many titles per request, and to retry a refusal rather than record it. A refusal that never clears raises instead of being written down.</p>

<p class="meta">Instrument: <code>tools/second/probe.py</code> (asks) and
<code>tools/second/record.py</code> (decides, offline). Page and record:
<code>window/cycle-003-session-3/</code> — <code>build.py</code>,
<code>data.json</code>, <code>probe.json</code>, <code>check.py</code>,
<code>verify.mjs</code>. Atlas licence: CC0-1.0 (data). Second record licence:
{esc(M['second_record']['licence'])}. The Atelier, as Ulysses, named Assay.</p>

<p class="meta"><strong>Form, on the merits</strong> (direction of 2026-09-03): the act
that produces this finding is <em>choosing a standard of proof</em>, and the three
standards are nested, so a reader who cannot move between them cannot see that the
coverage number and the population estimate are both functions of that choice. A static
figure can show the three side by side — and does, above, for anyone without scripting —
but it cannot let a reader watch the estimate jump by tens of thousands as they tighten
what they are willing to call a match. Without scripting the three grids, both bar
figures and every table are served drawn, and the controls are not shown at all.</p>

<script id="d" type="application/json">{payload}</script>
<script>
(function () {{
  var D = JSON.parse(document.getElementById('d').textContent);
  var stills = document.getElementById('stills');
  var wrap = document.getElementById('livewrap');
  if (!stills || !wrap) return;
  stills.hidden = true;
  wrap.hidden = false;

  var cells = wrap.querySelectorAll('svg.grid rect.c');
  var order = ['name', 'creator', 'attributed'];
  var ro = document.getElementById('ro');

  function fmt(n) {{
    return String(n).replace(/\\B(?=(\\d{{3}})+(?!\\d))/g, '\\u2009');
  }}

  function draw(rung) {{
    var keep = order.slice(order.indexOf(rung));
    for (var i = 0; i < cells.length; i++) {{
      var g = cells[i].getAttribute('data-g');
      if (g === 'unasked') {{ cells[i].setAttribute('fill', D.unaskedFill); continue; }}
      cells[i].setAttribute('fill',
        keep.indexOf(g) >= 0 ? D.fills[rung] : D.fills.none);
    }}
    var row = null, sub = null, bd = null;
    for (var j = 0; j < D.ladder.length; j++) {{
      if (D.ladder[j].rung === rung) row = D.ladder[j];
      if (D.subladder[j] && D.subladder[j].rung === rung) sub = D.subladder[j];
    }}
    for (var k = 0; k < D.bounds.length; k++) {{
      if (D.bounds[k].rung === rung) bd = D.bounds[k];
    }}
    var pct = (100 * row.count / row.asked).toFixed(1) + ' %';
    var spct = sub && sub.asked ? (100 * sub.count / sub.asked).toFixed(1) + ' %' : '—';
    var est = bd && bd.estimate
      ? fmt(Math.round(bd.estimate)) : 'undefined — no overlap left';
    var sw = bd && bd.swing ? fmt(Math.round(bd.swing)) : '—';
    ro.innerHTML =
      'standard of proof: <b>' + D.labels[rung] + '</b><br>' +
      'the second record holds <b>' + row.count + '</b> of the ' + row.asked +
      ' works it answered about (' + pct + ')<br>' +
      'of the ' + (sub ? sub.asked : 0) +
      ' read as being about absent data and answered about: <b>' +
      (sub ? sub.count : 0) + '</b> (' + spct + ')<br>' +
      'overlap with its nearest classes: <b>' + (bd ? bd.m : 0) +
      '</b> · estimate n1·n2/m = <b>' + est + '</b><br>' +
      'one more match would move that estimate by <b>' + sw + '</b> works';
  }}

  var radios = wrap.querySelectorAll('input[name=rung]');
  for (var r = 0; r < radios.length; r++) {{
    radios[r].addEventListener('change', function (e) {{ draw(e.target.value); }});
  }}
  draw('name');
}})();
</script>
</main></body></html>
"""


# --------------------------------------------------------------------------------- #


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--local", type=pathlib.Path, default=None)
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    feed, sha = read_feed(args.local)
    probe = json.loads((HERE / "probe.json").read_text(encoding="utf-8"))
    if feed["count"] != len(probe["works"]):
        print(
            f"FAIL the feed now declares {feed['count']} entries and the probe asked "
            f"about {len(probe['works'])}; re-probe before rebuilding",
            file=sys.stderr,
        )
        return 1
    data = build_data(feed["count"], sha, probe)
    page = render(data)

    if args.check:
        old_d = (HERE / "data.json").read_text(encoding="utf-8")
        old_p = (HERE / "index.html").read_text(encoding="utf-8")
        new_d = json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True) + "\n"
        bad = []
        if old_d != new_d:
            bad.append("data.json differs from a fresh build")
        if old_p != page:
            bad.append("index.html differs from a fresh build")
        for b in bad:
            print("FAIL " + b, file=sys.stderr)
        return 1 if bad else 0

    (HERE / "data.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    (HERE / "index.html").write_text(page, encoding="utf-8")
    print(f"wrote {HERE/'data.json'} and {HERE/'index.html'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
