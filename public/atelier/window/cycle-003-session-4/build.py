#!/usr/bin/env python3
"""build.py — cycle 003, session 4: the record holds the person and not the work.

Session 3 (2026-09-11) measured what the second record holds of this atlas: **1.0 % of the
works and 46.9 % of the artists**. It closed carrying one question — *the missing layer is
neither the art nor the artists but the work-level record, and is that gap a property of
this subject or of every catalogue of recent art?*

This session asks it. "The artists are recorded" turns out to be two different claims, and
the session separates them: a name in an authority file is not an oeuvre. So for every atlas
artist the second record holds as a person, it is asked how many items it credits to that
person — and the same question is put to three ordinary art forms with a centuries-old
cataloguing tradition, drawn by the record's own random sampler and cut to the atlas artists'
own birth decades, so that the era is held fixed and only the form varies. That control is
the whole design: without it the answer cannot distinguish *this subject is uncatalogued*
from *recent art is uncatalogued*, which is exactly the question being asked.

**What it found, since a reader of this file should not have to run it.** Two things, and
the second was not looked for. **(1)** The atlas arm is very empty of artworks and so is every
control of the same generations, and the atlas arm's share sits *inside* their spread — so the
claim this session set out to test is withdrawn by the refutation condition printed in advance.
What replaces it answers the question the session was carrying: in this record the work-level
layer is thin for recent art of any form, and re-weighting a long-catalogued form to this
atlas's birth decades is enough to reproduce the hole. Had two controls been drawn instead of
three, this page would have read the other way; the third is the whole difference, and that is
a fact about the method, not the subject. **(2)** Widen the count from *creator* to all six
making properties and the record fills up — with text. The people are in it as authors of
papers, not as makers of works, and on the wide measure the atlas arm becomes the *least*
empty of the four. The work-level record that exists for a data artist is a bibliography.

    python3 window/cycle-003-session-4/build.py            # fetches the feed
    python3 window/cycle-003-session-4/build.py --local F  # from a saved copy
    python3 window/cycle-003-session-4/build.py --check    # rebuild must be byte-identical

Reads `oeuvre.json` — the raw answers of the second record, written by
`tools/second/oeuvre.py` and committed beside this file as the session's evidence. Derives
every number through `tools/second/shelf.py`, which touches no network. Writes `data.json`
(every number the page states) and `index.html` (self-contained: no network at runtime, no
library, opens from a filesystem). Verified by `check.py` against the record and by
`verify.mjs` in a real browser with scripting on and off.

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
sys.path.insert(0, str(ROOT / "tools" / "second"))

import shelf as SH  # noqa: E402

FEED_URL = "https://frankbueltge.de/atlas/werke.json"
ATLAS_SHA_SINCE_2026_09_03 = (
    "a033aef59a4a0d397de02f57cd7db50bd44b075fe1756c6d3490355528c64a61"
)
DATE = "2026-09-12"
QUESTION = "Missing Data Art"
SEED_ID = "seed-20260907-220129-aa5f"
TITLE = "The hole is the generation, not the genre"

# The measure the page leads with, and the one it offers beside it.
PRIMARY = "creator_works"
WIDE = "any_works"

PALETTE = {
    "ink": "#141414", "paper": "#faf9f7", "rule": "#d9d5cd", "mid": "#6b6660",
    "atlas": "#b4451f", "control": "#2f4858", "band": "#c9d3d9",
    "soft": "#8a9ba8", "dead": "#efece6", "held": "#4a7c59",
}

# The codepoint that groups digits, named rather than typed. On 2026-09-11 three browser
# checks failed against a correct page because this character and an ordinary space were
# both written as invisible literals in two different files; every place that groups a digit
# in this session names the codepoint, and check.py requires the page and the script to group
# a number identically.
THIN_SPACE = " "


def esc(s) -> str:
    return html.escape("" if s is None else str(s), quote=True)


def thousands(n) -> str:
    return f"{int(n):,}".replace(",", THIN_SPACE)


def pct(v, dp: int = 1) -> str:
    return "—" if v is None else f"{v * 100:.{dp}f}{THIN_SPACE}%"


def plural(n: int, one: str, many: str) -> str:
    return one if n == 1 else many


def read_feed(local: pathlib.Path | None) -> tuple[dict, str]:
    """The atlas, live. Hashed, counted, and never written into this repository."""
    if local:
        raw = local.read_bytes()
    else:
        req = urllib.request.Request(
            FEED_URL,
            headers={"User-Agent": "ulysses-research/1.0 (artistic research instrument)"},
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read()
    return json.loads(raw.decode("utf-8")), hashlib.sha256(raw).hexdigest()


# ------------------------------------------------------------------ figures


def bars_svg(rows: list[dict], width: int = 620) -> str:
    """One row per arm: the share of people the record holds no work by.

    The solid bar is the share over the people the record actually answered about. The pale
    band behind it is the assumption-free interval over the whole arm — every unanswered
    person a holder of work, then every unanswered person a holder of nothing. Where the band
    is invisible the record answered about everybody.
    """
    pad_l, pad_r, top, rh = 196, 58, 16, 30
    plot = width - pad_l - pad_r
    height = top + rh * len(rows) + 26
    out = [
        f'<svg viewBox="0 0 {width} {height}" role="img" class="fig" '
        f'aria-label="Share of artists the second record credits no work to, by arm">'
    ]
    for i in range(0, 6):
        x = pad_l + plot * i / 5
        out.append(f'<line class="grid" x1="{x:.1f}" y1="{top - 6}" x2="{x:.1f}" '
                   f'y2="{top + rh * len(rows)}"/>')
        out.append(f'<text class="ax" x="{x:.1f}" y="{height - 10}" '
                   f'text-anchor="middle">{i * 20}%</text>')
    for i, r in enumerate(rows):
        y = top + i * rh
        cls = "atlas" if r["arm"] == "atlas" else "control"
        lo, hi = r.get("empty_lo"), r.get("empty_hi")
        if lo is not None and hi is not None and hi > lo:
            out.append(f'<rect class="band" x="{pad_l + plot * lo:.1f}" y="{y + 4}" '
                       f'width="{max(plot * (hi - lo), 0.6):.1f}" height="{rh - 12}"/>')
        share = r.get("share_empty")
        if share is not None:
            out.append(f'<rect class="bar {cls}" x="{pad_l}" y="{y + 7}" '
                       f'width="{max(plot * share, 0.6):.1f}" height="{rh - 18}"/>')
            out.append(f'<text class="val" x="{pad_l + plot * share + 6:.1f}" '
                       f'y="{y + rh / 2 + 3:.0f}">{pct(share, 1)}</text>')
        out.append(f'<text class="lab" x="{pad_l - 8}" y="{y + rh / 2 + 3:.0f}" '
                   f'text-anchor="end">{esc(r["label"])}</text>')
    out.append("</svg>")
    return "".join(out)


def decades_svg(decades: list[dict], width: int = 620) -> str:
    """The comparison with no birth window in it: one decade at a time.

    Two marks per decade — the atlas arm and every control person born in that decade,
    pooled. A claim that holds in every decade where both arms have somebody needs no window
    to have been chosen, which is the point of drawing it this way.
    """
    pad_l, pad_r, top, h = 46, 12, 14, 150
    plot = width - pad_l - pad_r
    n = max(len(decades), 1)
    step = plot / n
    height = top + h + 42
    out = [
        f'<svg viewBox="0 0 {width} {height}" role="img" class="fig" '
        f'aria-label="Share of artists with no work credited, atlas arm against control, '
        f'by birth decade">'
    ]
    for frac in (0, 0.25, 0.5, 0.75, 1.0):
        y = top + h * (1 - frac)
        out.append(f'<line class="grid" x1="{pad_l}" y1="{y:.1f}" x2="{width - pad_r}" '
                   f'y2="{y:.1f}"/>')
        out.append(f'<text class="ax" x="{pad_l - 6}" y="{y + 3:.1f}" '
                   f'text-anchor="end">{int(frac * 100)}%</text>')
    for i, d in enumerate(decades):
        cx = pad_l + step * (i + 0.5)
        for which, cls, dx in (("atlas", "atlas", -5), ("control", "control", 5)):
            s = d[which].get("share_empty")
            if s is None:
                continue
            y = top + h * (1 - s)
            out.append(f'<rect class="bar {cls}" x="{cx + dx - 4:.1f}" y="{y:.1f}" '
                       f'width="8" height="{max(top + h - y, 1):.1f}"/>')
            # Anchored away from the gutter rather than centred: two two-digit counts
            # centred on marks ten apart collide, and a collided number is a wrong number.
            anchor = "end" if dx < 0 else "start"
            out.append(f'<text class="tiny" x="{cx + dx * 1.1:.1f}" y="{y - 4:.1f}" '
                       f'text-anchor="{anchor}">{d[which]["n"]}</text>')
        out.append(f'<text class="ax" x="{cx:.1f}" y="{top + h + 16}" '
                   f'text-anchor="middle">{d["decade"]}s</text>')
    out.append("</svg>")
    return "".join(out)


def shelves_svg(rows: list[dict], width: int = 620) -> str:
    """Two shelves, one line per person: what the first record holds, what the second does.

    The left stack is the atlas's own entries for that person; the right stack is what the
    second record credits to them. The figure is not a comparison of sizes — it is a
    comparison of *presence*, and the thing to see is how many lines have nothing on the
    right at all.
    """
    rows = sorted(rows, key=lambda r: (-(r["creator_works"] or 0), -(r["any_works"] or 0),
                                       -r["atlas_works"], (r["label"] or "")))
    mid, unit, rh = width * 0.34, 7.0, 4.6
    top, right = 22, width - 8
    height = top + rh * len(rows) + 18
    out = [
        f'<svg viewBox="0 0 {width} {height:.0f}" role="img" class="fig shelves" '
        f'aria-label="Per artist, entries in the atlas against artworks and other credits '
        f'in the second record">'
    ]
    out.append(f'<text class="ax" x="{mid - 10}" y="10" text-anchor="end">'
               f'entries in the atlas</text>')
    out.append(f'<text class="ax" x="{mid + 10}" y="10">artworks in the second record, then '
               f'everything else it credits</text>')
    out.append(f'<line class="grid" x1="{mid:.1f}" y1="{top - 6}" x2="{mid:.1f}" '
               f'y2="{top + rh * len(rows):.1f}"/>')
    for i, r in enumerate(rows):
        y = top + i * rh
        a = r["atlas_works"] or 0
        c = r["creator_works"]
        other = (r["any_works"] or 0) - (c or 0) if (r["any_works"] is not None
                                                     and c is not None) else None
        if a:
            out.append(f'<rect class="bar atlas" x="{mid - 4 - unit * a:.1f}" y="{y:.1f}" '
                       f'width="{unit * a - 1:.1f}" height="{rh - 1.4:.1f}"/>')
        x = mid + 4
        if c:
            w = min(unit * c, right - x)
            out.append(f'<rect class="bar held" x="{x:.1f}" y="{y:.1f}" '
                       f'width="{max(w - 1, 0.8):.1f}" height="{rh - 1.4:.1f}"/>')
            x += w
        elif c == 0:
            out.append(f'<rect class="nothing" x="{x:.1f}" y="{y + rh / 2 - 0.7:.1f}" '
                       f'width="4" height="1.4"/>')
            x += 6
        else:
            out.append(f'<rect class="unasked" x="{x:.1f}" y="{y:.1f}" '
                       f'width="3" height="{rh - 1.4:.1f}"/>')
            x += 5
        if other:
            w = min(unit * other, right - x)
            if w > 0.6:
                out.append(f'<rect class="other" x="{x:.1f}" y="{y + 0.6:.1f}" '
                           f'width="{w - 1:.1f}" height="{rh - 2.6:.1f}"/>')
    out.append("</svg>")
    return "".join(out)


# ------------------------------------------------------------------ the record


def build_data(feed: dict, sha: str, probe: dict) -> dict:
    m = SH.measure(probe)
    win = m["meta"]["birth_window"]
    # The primary measure is `creator`: the property an artwork carries in this record. The
    # union of six making properties is offered beside it and turns out, for this population,
    # to be mostly authored text — which is a finding rather than a nuisance, and is why the
    # page leads with the narrow one instead of the flattering one.
    prof = m["profiles"][PRIMARY]
    atlas = prof["atlas"]

    matched_arms = [a for a in prof if a.startswith("matched:")]
    range_arms = [a for a in prof if a.startswith("range:")]

    def arm_row(arm: str) -> dict:
        p = prof[arm]
        return {
            "arm": arm, "label": m["arms"][arm]["name"],
            "share_empty": p["share_empty"], "empty_lo": p["empty_lo"],
            "empty_hi": p["empty_hi"], "n": p["n"], "asked": p["asked"],
            "unasked": p["unasked"], "empty": p["empty"], "held": p["held"],
            "works_total": p["works_total"], "works_max": p["works_max"],
            "works_median": p["works_median"], "birth_median": p["birth_median"],
        }

    # The era effect, form by form: the same occupation drawn across the whole birth range
    # this atlas spans, and then re-drawn to its birth decades. Two rows that differ only in
    # the generation they stand on.
    era = []
    for f in m["meta"]["control_forms"]:
        r_arm, m_arm = "range:" + f["qid"], "matched:" + f["qid"]
        if r_arm not in prof or m_arm not in prof:
            continue
        era.append({
            "form": f["qid"], "name": f["name"],
            "range": arm_row(r_arm), "matched": arm_row(m_arm),
            "population": m["controls"][f["qid"]]["population"],
            "shortfall": m["matched"][f["qid"]]["shortfall"],
        })

    bars_matched = [arm_row("atlas")] + [arm_row(a) for a in sorted(matched_arms)]
    bars_range = [arm_row("atlas")] + [arm_row(a) for a in sorted(range_arms)]

    surv = {c["arm"]: c for c in m["comparisons"]}
    # The claim, and the worst case that would destroy it, per decade-matched control.
    matched_survive = [surv[a][PRIMARY] for a in matched_arms if a in surv]
    all_survive = bool(matched_survive) and all(s.get("survives") for s in matched_survive)

    # The record's whole answer about these people, in the two numbers that name the layers.
    totals = m["totals"]

    # How many questions the second record was actually put, counted off the answers it gave
    # rather than off the instrument's own request counter. The probe ran in two passes — the
    # endpoint refused often enough that it was resumed from its checkpoint — and a per-process
    # counter cannot add those up, so the number the page states is this one, which the
    # committed record pins down exactly.
    q_counts = {
        "artist oeuvre": len(probe["atlas_oeuvre"]),
        "credited items": len(probe.get("atlas_credited") or {}),
        "control samples": sum(len(c.get("pool") or [])
                               for c in (probe.get("controls") or {}).values()),
        "control oeuvre": sum(len(c.get("oeuvre") or {})
                              for c in (probe.get("controls") or {}).values()),
        "decade-matched oeuvre": sum(len(c.get("oeuvre") or {})
                                     for c in (probe.get("matched") or {}).values()),
        "union over making properties": len(probe.get("union_zeros") or {}),
    }
    unanswered = (
        sum(1 for v in probe["atlas_oeuvre"].values() if v is None)
        + sum(1 for c in (probe.get("controls") or {}).values()
              for v in (c.get("oeuvre") or {}).values() if v is None)
        + sum(1 for c in (probe.get("matched") or {}).values()
              for v in (c.get("oeuvre") or {}).values() if v is None)
        + sum(1 for v in (probe.get("union_zeros") or {}).values() if v is None)
    )
    questions = {
        "parts": q_counts,
        "total": sum(q_counts.values()),
        "unanswered": unanswered,
        "note": "counted off the answers in oeuvre.json, not off a per-process request "
                "counter; the probe was resumed from its checkpoint after the endpoint "
                "refused, so no single counter spans the whole night",
    }

    D = {
        "meta": {
            "title": TITLE, "date": DATE, "cycle": 3, "session": 4,
            "question": QUESTION, "seed_id": SEED_ID,
            "feed_url": FEED_URL, "feed_sha256": sha,
            "feed_sha_unchanged_since": "2026-09-03",
            "entries": len(feed["entries"]), "feed_count": feed.get("count"),
            "probed_at_utc": m["meta"]["probed_at_utc"],
            "route": m["meta"]["route"],
            "second_record": m["meta"]["second_record"],
            "prior_probe": m["meta"]["prior_probe"],
            "making_props": m["meta"]["making_props"],
            "making_names": m["meta"]["making_names"],
            "control_forms": m["meta"]["control_forms"],
            "artist_strings": m["meta"]["artist_strings"],
            "artist_items": m["meta"]["artist_items"],
            "calls": m["meta"]["calls"],
            "carried_question": (
                "the missing layer is neither the art nor the artists but the work-level "
                "record — is that gap this subject's or every recent catalogue's?"
            ),
        },
        "birth_window": win,
        "arms": m["arms"],
        "profiles": m["profiles"],
        "whole_arm": m["whole_arm"],
        "bars_matched": bars_matched,
        "bars_range": bars_range,
        "era": era,
        "comparisons": m["comparisons"],
        "matched_all_survive": all_survive,
        "atlas_outside_control_range": m["atlas_outside_control_range"],
        "control_shares": m["control_shares"],
        "range_tests": m["range_tests"],
        "wide": m["wide"],
        "by_decade": [
            {
                "decade": d["decade"],
                "atlas": {k: d["atlas"][k] for k in
                          ("n", "asked", "unasked", "empty", "share_empty",
                           "empty_lo", "empty_hi", "works_total")},
                "control": {k: d["control"][k] for k in
                            ("n", "asked", "unasked", "empty", "share_empty",
                             "empty_lo", "empty_hi", "works_total")},
                "survives": d["survives"],
            }
            for d in m["by_decade"]
        ],
        "by_decade_summary": {
            **m["by_decade_summary"],
            # Where the survivals actually sit. Four decades clearing the worst-case test
            # sounds like four pieces of evidence until you count the people in them.
            "people_where_atlas_emptier": sum(
                d["atlas"]["n"] for d in m["by_decade"]
                if d["atlas"]["asked"] and d["control"]["asked"]
                and d["atlas"]["share_empty"] > d["control"]["share_empty"]),
            "people_where_not": sum(
                d["atlas"]["n"] for d in m["by_decade"]
                if d["atlas"]["asked"] and d["control"]["asked"]
                and d["atlas"]["share_empty"] <= d["control"]["share_empty"]),
            "largest_cell_where_atlas_emptier": max(
                (d["atlas"]["n"] for d in m["by_decade"]
                 if d["atlas"]["asked"] and d["control"]["asked"]
                 and d["atlas"]["share_empty"] > d["control"]["share_empty"]), default=0),
        },
        "dates": {
            "n": m["dates"]["n"],
            "median_delta": m["dates"]["median_delta"],
            "atlas_later": m["dates"]["atlas_later"],
            "second_later": m["dates"]["second_later"],
            "same": m["dates"]["same"],
            "paired": m["dates"]["paired"][:18],
        },
        "richness": m["richness"],
        "occupations": m["occupations"],
        "totals": totals,
        "questions": questions,
        "rows": [
            {
                "qid": r["qid"], "label": r["label"], "birth": r["birth"],
                "atlas_works": r["atlas_works"], "atlas_titles": r["atlas_titles"][:6],
                "creator_works": r["creator_works"], "any_works": r["any_works"],
                "n_statements": r["n_statements"], "sitelinks": r["sitelinks"],
                "notable_work": r["notable_work"],
                "artist": (r["atlas_strings"] or [None])[0],
            }
            for r in sorted(m["atlas_rows"],
                            key=lambda r: (-(r["any_works"] or 0), (r["label"] or "")))
        ],
        "held_rows": [
            {"label": r["label"], "qid": r["qid"], "any_works": r["any_works"],
             "creator_works": r["creator_works"], "atlas_works": r["atlas_works"],
             "birth": r["birth"]}
            for r in sorted(m["atlas_rows"], key=lambda r: -(r["any_works"] or 0))
            if r["any_works"]
        ],
        "unasked": {
            "atlas": atlas["unasked"],
            "no_birth": atlas["no_birth"],
            "total_calls": m["meta"]["calls"],
        },
    }
    return D


# ------------------------------------------------------------------ the page


def render(D: dict) -> str:
    M, win = D["meta"], D["birth_window"]
    # The headline is the whole arm, which no birth year decides; the windowed profile is
    # only ever used where a control has to be compared against it.
    whole = D["whole_arm"][PRIMARY]["atlas"]
    whole_wide = D["whole_arm"][WIDE]["atlas"]
    atlas = D["profiles"][PRIMARY]["atlas"]
    atlas_wide = D["profiles"][WIDE]["atlas"]
    wide = D["wide"]
    bars = D["bars_matched"]
    ctrl = [b for b in bars if b["arm"] != "atlas"]
    dsum = D["by_decade_summary"]
    forms = ", ".join(f["name"] + "s" for f in M["control_forms"])
    making = ", ".join(M["making_names"][p] for p in M["making_props"])

    def survive_sentence() -> str:
        parts = []
        for c in D["comparisons"]:
            if not c["arm"].startswith("matched:"):
                continue
            s = c[PRIMARY]
            verb = "clears" if s.get("survives") else "does not clear"
            parts.append(
                f'<li><b>{esc(c["name"])}</b> — the atlas arm\'s floor '
                f'{pct(s["a_floor"])} {verb} this control\'s ceiling '
                f'{pct(s["b_ceiling"])}; the gap is '
                f'{pct(s["gap"])}.</li>'
            )
        return "".join(parts)

    rows_tbl = "".join(
        f'<tr><td class="l">{esc(r["label"] or r["qid"])}</td>'
        f'<td class="n">{"" if r["birth"] is None else r["birth"]}</td>'
        f'<td class="n">{r["atlas_works"]}</td>'
        f'<td class="n">{"unasked" if r["any_works"] is None else r["any_works"]}</td>'
        f'<td class="n">{"" if r["n_statements"] is None else r["n_statements"]}</td>'
        f'<td class="n">{"" if r["sitelinks"] is None else r["sitelinks"]}</td>'
        f'<td class="l q">{esc(r["qid"])}</td></tr>'
        for r in D["rows"]
    )

    held_tbl = "".join(
        f'<tr><td class="l">{esc(r["label"] or r["qid"])}</td>'
        f'<td class="n">{"" if r["birth"] is None else r["birth"]}</td>'
        f'<td class="n">{r["atlas_works"]}</td>'
        f'<td class="n">{r["any_works"]}</td>'
        f'<td class="n">{"" if r["creator_works"] is None else r["creator_works"]}</td></tr>'
        for r in D["held_rows"]
    )

    dec_tbl = "".join(
        f'<tr><td class="n">{d["decade"]}s</td>'
        f'<td class="n">{d["atlas"]["n"]}</td>'
        f'<td class="n">{pct(d["atlas"]["share_empty"])}</td>'
        f'<td class="n">{d["control"]["n"]}</td>'
        f'<td class="n">{pct(d["control"]["share_empty"])}</td>'
        f'<td class="n">{"yes" if d["survives"].get("survives") else "no"}</td></tr>'
        for d in D["by_decade"]
    )

    dates_tbl = "".join(
        f'<tr><td class="l">{esc(p["label"])}</td>'
        f'<td class="n">{esc("–".join(str(y) for y in (min(p["atlas_years"]), max(p["atlas_years"]))))}</td>'
        f'<td class="n">{esc("–".join(str(y) for y in (min(p["second_years"]), max(p["second_years"]))))}</td>'
        f'<td class="n">{p["delta"]:+.0f}</td></tr>'
        for p in D["dates"]["paired"]
    )

    occ_tbl = "".join(
        f'<tr><td class="l">{esc(o["name"])}</td><td class="n">{o["count"]}</td></tr>'
        for o in D["occupations"]
    )

    def med(v) -> str:
        return "" if v is None else f"{v:.0f}"

    rich_tbl = "".join(
        f'<tr><td class="l">{esc(D["arms"][a]["name"])}</td>'
        f'<td class="n">{r["n"]}</td>'
        f'<td class="n">{med(r["statements_median"])}</td>'
        f'<td class="n">{med(r["sitelinks_median"])}</td>'
        f'<td class="n">{r["sitelinks_zero"]}</td>'
        f'<td class="n">{r["notable_work_any"]}</td></tr>'
        for a, r in D["richness"].items()
    )

    def num(v) -> str:
        return "" if v is None else f"{v:.0f}"

    era_tbl = "".join(
        f'<tr><td class="l">{esc(e["name"])}, whole birth range</td>'
        f'<td class="n">{e["range"]["asked"]}</td>'
        f'<td class="n">{num(e["range"]["birth_median"])}</td>'
        f'<td class="n">{pct(e["range"]["share_empty"])}</td>'
        f'<td class="n">{thousands(e["range"]["works_total"])}</td></tr>'
        f'<tr><td class="l">{esc(e["name"])}, matched to this atlas’s decades</td>'
        f'<td class="n">{e["matched"]["asked"]}</td>'
        f'<td class="n">{num(e["matched"]["birth_median"])}</td>'
        f'<td class="n">{pct(e["matched"]["share_empty"])}</td>'
        f'<td class="n">{thousands(e["matched"]["works_total"])}</td></tr>'
        for e in D["era"]
    )

    moved = [e for e in D["era"]
             if e["range"]["share_empty"] is not None
             and e["matched"]["share_empty"] is not None
             and e["matched"]["share_empty"] > e["range"]["share_empty"]]
    era_sentence = (
        f'In <b>{len(moved)} of the {len(D["era"])}</b> forms, holding the era fixed at this '
        f'atlas\'s own generations makes the record emptier — '
        + esc(" · ".join(
            f'{e["name"]} {pct(e["range"]["share_empty"])} → {pct(e["matched"]["share_empty"])}'
            f' ({thousands(e["range"]["works_total"])} → '
            f'{thousands(e["matched"]["works_total"])} items)'
            for e in D["era"]))
        + '. The forms did not change; the birth years did. '
        + ('That is the answer to the question this session came in carrying: the work-level '
           'gap is a property of the period, not of the subject.' if moved else
           'The era makes no difference here, so this page cannot attribute the gap to it '
           'either, and says so.')
    )

    top_tbl = "".join(
        f'<tr><td class="l">{esc(t["label"] or t["qid"])}</td>'
        f'<td class="l">{esc(t["description"] or "")}</td>'
        f'<td class="n">{t["any"]}</td>'
        f'<td class="n">{"" if t["creator"] is None else t["creator"]}</td>'
        f'<td class="n">{t["candidates"]}</td></tr>'
        for t in wide["top"]
    )
    top_no_art = sum(1 for t in wide["top"] if not t["creator"])
    top_sentence = (
        f"Of these twelve, {top_no_art} are credited with no artwork whatever — the record "
        f"holds them, and holds a great deal of them, without holding a single thing they "
        f"made as an artist."
        if top_no_art else
        "Every one of these twelve is credited with at least one artwork."
    )

    ORDINALS = {1: "the", 2: "the second", 3: "the third", 4: "the fourth", 5: "the fifth"}
    SPELLED = {2: "two", 3: "three", 4: "four", 5: "five", 6: "six"}
    rt = D["range_tests"][PRIMARY]
    if D["atlas_outside_control_range"] or rt["rank_from_emptiest"] is None:
        rank_phrase = ""
    else:
        rank_phrase = (f', {ORDINALS.get(rt["rank_from_emptiest"], "")} emptiest of the '
                       f'{SPELLED.get(rt["of"], rt["of"])}')

    dt = D["dates"]
    if dt["n"]:
        dates_sentence = (
            f'Of <b>{dt["n"]}</b> artists where both records date something, the atlas entry '
            f'is the later in <b>{dt["atlas_later"]}</b>, the second record’s in '
            f'<b>{dt["second_later"]}</b>, and the medians coincide in <b>{dt["same"]}</b>; '
            f'the median gap is <b>{dt["median_delta"]:+.0f}</b> years.'
        )
    else:
        dates_sentence = "No pair could be formed, so this section states nothing."

    payload = json.dumps(D, ensure_ascii=False, separators=(",", ":"))

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(TITLE)} — the Atelier, {esc(DATE)}</title>
<meta name="description" content="The second record holds 46.9 % of this atlas's artists and credits no work at all to most of them. Measured against three long-catalogued art forms, decade-matched.">
<style>
:root {{
  --ink: {PALETTE["ink"]}; --paper: {PALETTE["paper"]}; --rule: {PALETTE["rule"]};
  --mid: {PALETTE["mid"]}; --atlas: {PALETTE["atlas"]}; --control: {PALETTE["control"]};
  --band: {PALETTE["band"]}; --soft: {PALETTE["soft"]}; --dead: {PALETTE["dead"]};
  --held: {PALETTE["held"]};
}}
* {{ box-sizing: border-box; }}
body {{
  margin: 0; background: var(--paper); color: var(--ink);
  font: 16px/1.55 Georgia, "Iowan Old Style", "Times New Roman", serif;
}}
main {{ max-width: 47rem; margin: 0 auto; padding: 2.4rem 1.15rem 5rem; }}
h1 {{ font-size: 1.95rem; line-height: 1.15; margin: 0 0 .45rem; letter-spacing: -.01em; }}
h2 {{ font-size: 1.12rem; margin: 2.6rem 0 .55rem; letter-spacing: .01em; }}
h3 {{ font-size: .95rem; margin: 1.6rem 0 .4rem; color: var(--mid); }}
p {{ margin: 0 0 .85rem; }}
.kicker, .foot, .ax, .tiny, .cap, table, .ctrl {{
  font-family: "Iowan Old Style", ui-sans-serif, system-ui, sans-serif;
}}
.kicker {{ font-size: .76rem; letter-spacing: .1em; text-transform: uppercase;
  color: var(--mid); margin: 0 0 .8rem; }}
.lede {{ font-size: 1.09rem; }}
.finding {{ border-left: 3px solid var(--atlas); padding: .1rem 0 .1rem .95rem;
  margin: 1.5rem 0; }}
figure {{ margin: 1.5rem 0 1.8rem; }}
figcaption {{ font-size: .84rem; color: var(--mid); margin-top: .5rem; line-height: 1.45; }}
svg.fig {{ width: 100%; height: auto; display: block; }}
svg.shelves {{ background: transparent; }}
.grid {{ stroke: var(--rule); stroke-width: 1; }}
.bar.atlas {{ fill: var(--atlas); }}
.bar.control {{ fill: var(--control); }}
.bar.held {{ fill: var(--held); }}
.band {{ fill: var(--band); opacity: .55; }}
.nothing {{ fill: var(--rule); }}
.other {{ fill: var(--soft); opacity: .5; }}
.unasked {{ fill: var(--soft); }}
text.lab {{ font-size: 11.5px; fill: var(--ink); }}
text.ax {{ font-size: 10.5px; fill: var(--mid); }}
text.val {{ font-size: 11px; fill: var(--mid); }}
text.tiny {{ font-size: 8.5px; fill: var(--mid); }}
table {{ border-collapse: collapse; width: 100%; font-size: .82rem; margin: .9rem 0 1.2rem; }}
th, td {{ text-align: left; padding: .26rem .4rem; border-bottom: 1px solid var(--rule);
  vertical-align: top; }}
th {{ font-weight: 600; color: var(--mid); font-size: .74rem; text-transform: uppercase;
  letter-spacing: .05em; }}
td.n, th.n {{ text-align: right; font-variant-numeric: tabular-nums; }}
td.q {{ color: var(--soft); font-size: .74rem; }}
.scroll {{ max-height: 22rem; overflow: auto; border: 1px solid var(--rule);
  padding: 0 .5rem; }}
.ctrl {{ border: 1px solid var(--rule); background: #fff; padding: .8rem .9rem;
  margin: 1.1rem 0; font-size: .84rem; }}
.ctrl label {{ display: inline-block; margin: .2rem 1.1rem .2rem 0; }}
.ctrl input[type=number] {{ width: 4.6rem; font: inherit; padding: .1rem .25rem; }}
.readout {{ margin-top: .6rem; padding-top: .55rem; border-top: 1px solid var(--rule);
  color: var(--mid); }}
ul {{ margin: .4rem 0 1rem; padding-left: 1.15rem; }}
li {{ margin-bottom: .3rem; }}
.foot {{ font-size: .79rem; color: var(--mid); margin-top: 3rem;
  border-top: 1px solid var(--rule); padding-top: 1.1rem; }}
.foot code {{ font-size: .95em; }}
a {{ color: var(--control); }}
.hid {{ display: none; }}
@media (prefers-reduced-motion: no-preference) {{
  .bar, .band {{ transition: width .28s ease, height .28s ease, x .28s ease, y .28s ease; }}
}}
@media (max-width: 34rem) {{
  h1 {{ font-size: 1.55rem; }}
  .scroll {{ max-height: 17rem; }}
}}
</style>
</head>
<body>
<main>
<p class="kicker">The Atelier · cycle 003, session 4 · {esc(DATE)} · seed “{esc(QUESTION)}”</p>
<h1>{esc(TITLE)}</h1>

<p class="lede">Yesterday this practice measured what the largest open record of works in the
world holds of this atlas: <b>1.0{THIN_SPACE}% of the works and 46.9{THIN_SPACE}% of the
artists</b>. The people are recorded and the works are not, by a factor of forty-nine. That
left one question, and it is tonight's: <i>{esc(M["carried_question"])}</i></p>

<p>“The artists are recorded” turns out to be two claims wearing one sentence. A record can
hold a person as a <i>handle</i> — a name, a nationality, a date — or as a <i>maker</i>, with
the things they made hanging off them. So the second record was asked, for every one of the
{thousands(M["artist_items"])} items this atlas's artists resolve to, how many items it
credits to that person: first as <i>creator</i>, the property an artwork carries here, and
then under any of {len(M["making_props"])} making properties ({esc(making)}), so that a piece
filed as authored or composed rather than created could not be mistaken for a hole. And
because an answer to that alone cannot tell <i>this subject is uncatalogued</i> from
<i>recent art is uncatalogued</i>, the same two questions were put to {esc(forms)} — drawn by
the record's own random sampler, then re-drawn so that every birth decade carries the weight
it carries among this atlas's own artists.</p>

<div class="finding">
<p><b>Of the {thousands(whole["asked"])} atlas artists the record answered about,
{thousands(whole["empty"])} — {pct(whole["share_empty"])} — are the creator of nothing in
it.</b> Between all {thousands(M["artist_items"])} of them it credits
{thousands(wide["credits_creator"])} works, against the
{thousands(D["totals"]["atlas_works_in_first_record"])} entries this atlas holds for the same
people.</p>
<p><b>And that is not about data art.</b> Of {esc(forms)} born in the same decades, the same
record leaves {esc(" · ".join(c["label"].replace(" (decade-matched)", "") + " "
                              + pct(c["share_empty"]) for c in ctrl))} equally creatorless.
The atlas arm sits <b>{"outside" if D["atlas_outside_control_range"] else "inside"}</b> that
spread{esc(rank_phrase)}. This page printed the condition that would withdraw
its own claim before it looked, and {"that condition did not fire"
if D["atlas_outside_control_range"] else "<b>that condition fired</b>"}: what was measured on
2026-09-11 as a hole where data art should be is, in this record, a hole where <i>recent
art</i> should be.</p>
<p><b>Widen the measure and the record fills up — with reading matter.</b> Counting everything
it says these people made, only {pct(whole_wide["share_empty"])} hold nothing, and the credits
go from {thousands(wide["credits_creator"])} to {thousands(wide["credits_any"])}. Almost all of
that is text: {thousands(wide["people_only_non_creator"])} of these people are credited with
something and with no artwork at all. <b>The work-level record that exists for a data artist
is the one a university keeps.</b></p>
</div>

<p>Two sentences that sound alike and are not: <i>the second record does not hold this
atlas's works</i> — measured yesterday, 1.0{THIN_SPACE}% — and <i>the second record does not
hold the work of this atlas's artists</i>. The second is the stronger claim, and it is the one
measured here, because no matching rule can be blamed for it: there is nothing to match. For
{thousands(whole["empty"])} of these {thousands(M["artist_items"])} people the record holds a
biography with no artwork attached to it. What the control decides is whose silence that
is.</p>

<h2>1 · The people the record credits no artwork to</h2>

<figure>
{bars_svg(bars)}
<figcaption>Share of each arm the second record names as the creator of nothing. The pale
band is the assumption-free interval
over the whole arm — every unanswered person a holder of work, then every unanswered person a
holder of nothing; where no band shows, the record answered about everybody. Controls are
drawn from the record's own random sample of each form and re-weighted to this atlas's
birth-decade shares. Data: <code>data.json</code>.</figcaption>
</figure>

<div class="ctrl">
<div id="controls" class="hid">
<label>Born from <input type="number" id="from" min="1850" max="2010" step="1"
  value="{win["lo"]}"></label>
<label>to <input type="number" id="to" min="1850" max="2010" step="1"
  value="{win["hi"]}"></label>
<label><input type="checkbox" id="creator"> widen from <i>creator</i> to all
{len(M["making_props"])} making properties</label>
<label><input type="checkbox" id="rangedraw"> control cut to the birth <i>range</i> instead
of decade-matched</label>
</div>
<p class="readout" id="readout">The figure above is the still frame: the decade-matched
control, the <i>creator</i> measure, birth years {win["lo"]}–{win["hi"]}. With scripting on,
the window and both choices are yours to move.</p>
</div>

<h3>Does the claim survive its own worst case?</h3>
<p>The claim is <i>the atlas arm is emptier than the control</i>. Its worst case is that
every atlas artist the record refused to answer about turns out to hold work, and every
control person it refused turns out to hold none. The claim survives only if the atlas arm's
floor still clears the control's ceiling — there is no threshold in that and nothing to
tune.</p>
<ul>{survive_sentence()}</ul>
<p>{"All the decade-matched controls clear." if D["matched_all_survive"] else
"<b>Not every decade-matched control clears, and the list above says which.</b>"}
<b>That pairwise test is not the one that decides this page</b>, and the reason is the rule
this practice failed against itself on 2026-09-07: a point that sits inside the spread of its
comparisons is not a finding, however many of them it individually beats. The atlas arm's
share lies {"outside" if D["atlas_outside_control_range"] else "<b>inside</b>"} the range of
the controls' shares ({esc(" / ".join(pct(s) for s in D["control_shares"]))}).
{"" if D["atlas_outside_control_range"] else
"So the claim <i>data artists are worse recorded than other artists</i> is withdrawn here, "
"before it was ever made. Had this page been built with two controls instead of three it "
"would have read the other way, and the third control is the only thing that stopped it."}</p>

<h2>2 · The same comparison with no window in it at all</h2>

<figure>
{decades_svg(D["by_decade"])}
<figcaption>One birth decade at a time: the atlas's artists (left mark) against every control
person born in that decade, pooled (right mark). The small number above each mark is how many
people it stands on. A window had to be chosen for figure 1; here none is, and the reader can
see every cell the choice was averaging over — including the thin ones.</figcaption>
</figure>

<p>The atlas arm is emptier in <b>{dsum["atlas_emptier"]} of the
{dsum["decades_with_both"]}</b> {plural(dsum["decades_with_both"], "decade", "decades")}
where both arms hold somebody, and the worst-case test above survives in
<b>{dsum["survives"]}</b> of them. <b>Count the people rather than the decades and that
reverses.</b> The {dsum["atlas_emptier"]}
{plural(dsum["atlas_emptier"], "decade", "decades")} where the atlas arm is emptier hold
<b>{thousands(dsum["people_where_atlas_emptier"])}</b> of its artists between them — the
largest such cell has {dsum["largest_cell_where_atlas_emptier"]} — against
<b>{thousands(dsum["people_where_not"])}</b> in the
{plural(dsum["decades_with_both"] - dsum["atlas_emptier"], "decade", "decades")} where it is
not. In every decade this atlas actually lives in, the control is the emptier arm. A count of
decades weights a cell of one the same as a cell of forty-one, and that is the arithmetic
this table exists to expose.</p>

<table>
<thead><tr><th class="n">born</th><th class="n">atlas</th><th class="n">empty</th>
<th class="n">control</th><th class="n">empty</th><th class="n">clears</th></tr></thead>
<tbody>{dec_tbl}</tbody>
</table>

<h2>3 · The generation, not the genre</h2>

<p>If the atlas arm is no emptier than its controls, the next question is what the controls
themselves depend on — and the answer is in the one thing that separates the two draws. Each
form below appears twice. The upper row is that form drawn across the whole birth range this
atlas spans, which is very nearly the record's whole population of it; the lower row is the
same form re-weighted to this atlas's own birth decades. Nothing else differs — same
occupation, same sampler, same questions.</p>

<table>
<thead><tr><th>form, as the record classes it</th><th class="n">people</th>
<th class="n">median born</th><th class="n">no work credited</th>
<th class="n">items credited</th></tr></thead>
<tbody>{era_tbl}</tbody>
</table>

<p>{era_sentence}</p>

<h2>4 · The two shelves</h2>

<figure>
{shelves_svg(D["rows"])}
<figcaption>One line per person. To the left, the entries this atlas holds by them. To the
right, first the works the second record names them the creator of, then — in pale grey —
everything else it credits to them: papers, books, recordings. A short tick where the green
would start means the record answered and names them the creator of nothing. The figure is
not about sizes: it is about how many lines begin on the right with a tick and then run
on.</figcaption>
</figure>

<div class="scroll">
<table>
<thead><tr><th>person, as the record names them</th><th class="n">born</th>
<th class="n">atlas</th><th class="n">2nd</th><th class="n">stmts</th>
<th class="n">wikis</th><th>item</th></tr></thead>
<tbody>{rows_tbl}</tbody>
</table>
</div>

<h3>The {len(D["held_rows"])} the record credits anything to</h3>
<table>
<thead><tr><th>person</th><th class="n">born</th><th class="n">atlas</th>
<th class="n">any</th><th class="n">as creator</th></tr></thead>
<tbody>{held_tbl}</tbody>
</table>

<h3>What the wide measure is made of</h3>
<p>The twelve people the record credits most, and the column that matters is the last one but
two. {esc(top_sentence)}</p>
<table>
<thead><tr><th>person, as the record names them</th><th>what the record calls them</th>
<th class="n">any</th><th class="n">as creator</th><th class="n">names matched</th></tr></thead>
<tbody>{top_tbl}</tbody>
</table>
<p><b>The threat to this table, named.</b> A count that rests on a name match is exposed
wherever a name is shared, and the wide measure is exposed worst, because a common name can
land on a prolific author. {thousands(wide["people_ambiguous"])} of the
{thousands(M["artist_items"])} people here matched more than one item in the second record,
and they carry {thousands(wide["credits_on_ambiguous_names"])} of the
{thousands(wide["credits_any"])} wide credits. The narrow measure the page leads with carries
{thousands(wide["credits_creator"])} credits in total, so no single mis-resolution can move
it far — which is a second reason to lead with it. The second column above is the record's own
description of the person it matched: where it describes somebody who is plainly not the artist
this atlas names, you are looking at a mis-resolution, and the resolutions are inherited
unchanged from 2026-09-11 rather than re-decided tonight so that the two nights answer about
the same people.</p>

<h2>5 · When the record does hold their work, is it this work?</h2>

<p>For the artists the record does credit work to, the work it credits can be compared with
the work this atlas names. {dates_sentence}</p>

<table>
<thead><tr><th>person</th><th class="n">atlas years</th><th class="n">2nd record years</th>
<th class="n">gap</th></tr></thead>
<tbody>{dates_tbl}</tbody>
</table>

<h2>6 · Handle or record</h2>

<p>If the artist entries were rich records that merely lacked works, that would be a
different finding from entries that are thin all the way through. Two of the record's own
measures say which: how many statements the person's item carries, and how many encyclopedias
link to it.</p>

<table>
<thead><tr><th>arm</th><th class="n">people</th><th class="n">median statements</th>
<th class="n">median wikis</th><th class="n">no wiki</th>
<th class="n">has “notable work”</th></tr></thead>
<tbody>{rich_tbl}</tbody>
</table>

<h3>What the record calls these people</h3>
<table>
<thead><tr><th>occupation, by the record's own statement</th><th class="n">of
{thousands(M["artist_items"])}</th></tr></thead>
<tbody>{occ_tbl}</tbody>
</table>

<h2>7 · Method, and what would kill this</h2>

<p><b>Route.</b> Every number here was served by one route — {esc(M["route"]["all_numbers"])}.
The query service was not asked at all: {esc(M["route"]["why"])}. The second record was put
<b>{thousands(D["questions"]["total"])}</b> questions and left
<b>{thousands(D["questions"]["unanswered"])}</b> of them unanswered —
{esc(" · ".join(f"{k} {thousands(v)}" for k, v in D["questions"]["parts"].items()))}. That
total is counted off the answers in <code>oeuvre.json</code> and not off a request counter:
{esc(D["questions"]["note"].split(";", 1)[1].strip())}.</p>

<p><b>A refusal is not a miss.</b> {thousands(whole["unasked"])}
{plural(whole["unasked"], "person", "people")} in the atlas arm went unanswered after two
passes and {"is" if whole["unasked"] == 1 else "are"} counted as <i>unasked</i>, never as
zero; every share above carries the interval that assumes the worst and then the best about
them. {thousands(whole["no_birth"])} of the {thousands(M["artist_items"])} artist items state
no birth year at all, so they fall outside every window — a third state, reported and not
dropped.</p>

<p><b>The unit problem, again and on the other side.</b> The {thousands(M["artist_strings"])}
atlas artist strings that resolved to a person resolve to only
{thousands(M["artist_items"])} distinct items: the first record names somebody twice that the
second names once. On 2026-09-11 the same collision appeared on the works. It is the same
defect from the other end and no completeness measure sees it.</p>

<p><b>Control, stated as a choice.</b> {esc(forms.capitalize())} were chosen because their
cataloguing tradition is centuries old — that tradition is the contrast the comparison needs.
The record's people of those forms are far older than its data artists, which flatters the
control, so a second draw re-weights each form to this atlas's own birth-decade shares. The
weights come off the population being explained; the sampler is the record's own
<code>random</code> sort; the shuffle seeds are in <code>oeuvre.json</code>. What remains
uncontrolled and is not hidden: a person of any form is in this record because somebody
thought them notable, and the routes to notability differ by form. Section 2 is the answer to
that as far as this material can give one — the decade table needs no window and no weights.</p>

<p><b>Two measures, both published, and the reason the narrow one leads.</b> A work can be
filed as authored, composed, directed, performed or built rather than created, so every person
the <i>creator</i> count called empty was asked again against all {len(M["making_props"])}
making properties. The narrow measure puts the whole atlas arm at
{pct(whole["share_empty"])} empty, the wide one at {pct(whole_wide["share_empty"])}; inside
the stated birth window, {pct(atlas["share_empty"])} and {pct(atlas_wide["share_empty"])}.
Section 4 shows what the difference is made of, and it is not artworks. The narrow measure
leads because the question is about art; the wide one is printed beside it because a page
that published only the flattering measure, or only the damning one, would be choosing its
answer.</p>

<p><b>The claim this page came to make, and did not.</b> The condition was set before the
control was drawn: <i>if the decade-matched controls are as empty as the atlas arm, this
measures the era and not the form, and the claim that data art is the worse-recorded subject
is withdrawn.</i>
{"The controls are not as empty, and the claim stands." if D["atlas_outside_control_range"]
else "They are. It is withdrawn, and section 1 says so where a reader meets it rather than "
"here where a reader might not. What is left is not less than what was sought — it is an "
"answer to the question this session was carrying, and it points at the period."}</p>

<p><b>What would kill what is left.</b> Three things. <i>One:</i> if re-weighting a control
form to this atlas's birth decades did not make the record emptier, the period would not be
doing the work; it does in {len([e for e in D["era"] if e["range"]["share_empty"] is not None
and e["matched"]["share_empty"] is not None
and e["matched"]["share_empty"] > e["range"]["share_empty"]])} of the {len(D["era"])} forms
and section 3 names the one that goes the other way. <i>Two:</i> if the union of
{len(M["making_props"])} making properties closed the gap, the narrow count would have been an
artefact; it does not close it for artworks — the wide count's gain is
{thousands(wide["credits_any"] - wide["credits_creator"])} credits of which
{thousands(wide["people_only_non_creator"])} people hold no artwork at all. <i>Three, and this one is not closed:</i> every number here
comes from <b>one</b> record. That the work-level layer is thin for recent art <i>in
Wikidata</i> is measured; that it is thin anywhere else is not, and by this cycle's own
reading of Manski (2026-09-09) a claim about the world resting on one record is
unidentified. The honest form of tonight's result is therefore conditional, and it is stated
that way in section 1.</p>

<p><b>Form, on the merits</b> (the direction of 2026-09-03). The act that produces this
finding is <i>choosing whom to compare with, and over which years</i> — and that act is the
whole difference between “data art is not catalogued” and “recent art is not catalogued”. A
still figure can show one window and does; it cannot let a reader hold the era fixed
themselves and watch the form come apart, which is the only way to see that the answer is not
a property of the arithmetic. So the window and both measure choices are the reader's, the
figures follow, and the claim that does not depend on any of it is drawn separately in
section 2. Without scripting, every figure and every table is served drawn at the stated
window and the controls are not shown.</p>

<p class="foot">
The Atelier (signing as Ulysses, named Assay) · cycle 003, session 4 · {esc(DATE)} ·
seed <code>{esc(SEED_ID)}</code><br>
First record: the Atlas of Data Art, read live from <code>{esc(M["feed_url"])}</code>,
{thousands(M["entries"])} entries, sha256 <code>{esc(M["feed_sha256"][:16])}…</code> —
unchanged since {esc(M["feed_sha_unchanged_since"])}, tenth consecutive session at this
digest. Never mirrored into this repository.<br>
Second record: {esc(M["second_record"]["name"])} (<code>{esc(M["second_record"]["licence"])}</code>),
probed {esc(M["probed_at_utc"])} via <code>{esc(M["second_record"]["api"])}</code>. Chosen
because {esc(M["second_record"]["why"])}.<br>
Evidence beside this page: <code>oeuvre.json</code> (the record's raw answers, including the
ones it refused), <code>data.json</code> (every number above), <code>build.py</code>,
<code>check.py</code>, <code>verify.mjs</code>. Instruments:
<code>tools/second/oeuvre.py</code> (asks), <code>tools/second/shelf.py</code> (decides,
offline). Prior probe re-read, not re-typed: <code>{esc(M["prior_probe"])}</code> of
2026-09-11, whose artist grading rule is imported from <code>tools/second/record.py</code>.<br>
No model wrote a number, a figure or a method sentence on this page.
</p>
</main>

<script type="application/json" id="D">{payload}</script>
<script>
(function () {{
  "use strict";
  var D = JSON.parse(document.getElementById("D").textContent);
  var THIN = "\\u2009";
  function group(n) {{
    return String(Math.round(n)).replace(/\\B(?=(\\d{{3}})+(?!\\d))/g, THIN);
  }}
  function pct(v, dp) {{
    return v === null || v === undefined ? "\\u2014"
      : (v * 100).toFixed(dp === undefined ? 1 : dp) + THIN + "%";
  }}

  var fromEl = document.getElementById("from"),
      toEl = document.getElementById("to"),
      crEl = document.getElementById("creator"),
      rgEl = document.getElementById("rangedraw"),
      readout = document.getElementById("readout"),
      fig = document.querySelector("figure svg.fig");

  document.getElementById("controls").classList.remove("hid");

  // The same arithmetic shelf.py runs, over the same rows, so a number the reader produces
  // by moving the window is the number the record would have published for that window.
  function profile(rows, lo, hi, key) {{
    var sel = rows.filter(function (r) {{
      return r.birth !== null && r.birth >= lo && r.birth <= hi;
    }});
    var asked = [], unasked = 0, empty = 0, total = 0;
    sel.forEach(function (r) {{
      var v = r[key];
      if (v === null || v === undefined) {{ unasked++; return; }}
      asked.push(v);
      if (v === 0) empty++; else total += v;
    }});
    var n = sel.length;
    return {{
      n: n, asked: asked.length, unasked: unasked, empty: empty,
      held: asked.length - empty, works_total: total,
      share_empty: asked.length ? empty / asked.length : null,
      empty_lo: n ? empty / n : null,
      empty_hi: n ? (empty + unasked) / n : null
    }};
  }}

  function armRows(arm) {{ return D.arm_rows[arm] || []; }}

  function draw() {{
    var lo = parseInt(fromEl.value, 10), hi = parseInt(toEl.value, 10);
    if (isNaN(lo) || isNaN(hi) || hi < lo) {{ return; }}
    var key = crEl.checked ? "any_works" : "creator_works";
    var prefix = rgEl.checked ? "range:" : "matched:";
    var arms = ["atlas"].concat(Object.keys(D.arm_rows).filter(function (a) {{
      return a.indexOf(prefix) === 0;
    }}).sort());
    var rows = arms.map(function (a) {{
      var p = profile(armRows(a), lo, hi, key);
      p.arm = a;
      p.label = D.arms[a].name;
      return p;
    }});

    var groups = fig.querySelectorAll("g.row");
    if (groups.length !== rows.length) {{ rebuild(rows.length); groups = fig.querySelectorAll("g.row"); }}
    var padL = 196, plot = 620 - padL - 58, rh = 30, top = 16;
    rows.forEach(function (p, i) {{
      var g = groups[i], y = top + i * rh;
      var band = g.querySelector(".band"), bar = g.querySelector(".bar"),
          val = g.querySelector(".val"), lab = g.querySelector(".lab");
      if (p.empty_lo !== null && p.empty_hi !== null && p.empty_hi > p.empty_lo) {{
        band.setAttribute("x", (padL + plot * p.empty_lo).toFixed(1));
        band.setAttribute("width", Math.max(plot * (p.empty_hi - p.empty_lo), 0.6).toFixed(1));
        band.setAttribute("y", y + 4); band.setAttribute("height", rh - 12);
      }} else {{ band.setAttribute("width", 0); }}
      bar.setAttribute("class", "bar " + (p.arm === "atlas" ? "atlas" : "control"));
      bar.setAttribute("x", padL); bar.setAttribute("y", y + 7);
      bar.setAttribute("height", rh - 18);
      bar.setAttribute("width", p.share_empty === null ? 0
        : Math.max(plot * p.share_empty, 0.6).toFixed(1));
      val.setAttribute("x", (padL + plot * (p.share_empty || 0) + 6).toFixed(1));
      val.setAttribute("y", y + rh / 2 + 3);
      val.textContent = pct(p.share_empty);
      lab.setAttribute("x", padL - 8); lab.setAttribute("y", y + rh / 2 + 3);
      lab.textContent = p.label;
    }});

    var a = rows[0], cs = rows.slice(1);
    var clears = cs.filter(function (c) {{
      return a.empty_lo !== null && c.empty_hi !== null && a.empty_lo > c.empty_hi;
    }});
    readout.innerHTML =
      "Born " + lo + "\\u2013" + hi + ". " +
      "<b>" + group(a.empty) + " of " + group(a.asked) + "</b> atlas artists the record " +
      "answered about have nothing credited to them \\u2014 <b>" + pct(a.share_empty) +
      "</b>" + (a.unasked ? ", with " + group(a.unasked) + " unasked" : "") + ". " +
      "Control: " + cs.map(function (c) {{
        return c.label.replace(/ \\(.*\\)$/, "") + " " + pct(c.share_empty) +
               " (" + group(c.asked) + ")";
      }}).join(", ") + ". " +
      "<b>" + clears.length + " of " + cs.length + "</b> controls are cleared by the atlas " +
      "arm's floor even in the worst case" +
      (crEl.checked ? ", counting only <i>creator</i>" : "") + ".";
  }}

  function rebuild(n) {{
    fig.querySelectorAll("g.row").forEach(function (g) {{ g.remove(); }});
    for (var i = 0; i < n; i++) {{
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "row");
      ["rect.band", "rect.bar", "text.val", "text.lab"].forEach(function (spec) {{
        var bits = spec.split("."),
            el = document.createElementNS("http://www.w3.org/2000/svg", bits[0]);
        el.setAttribute("class", bits[1]);
        if (bits[0] === "text" && bits[1] === "lab") el.setAttribute("text-anchor", "end");
        g.appendChild(el);
      }});
      fig.appendChild(g);
    }}
  }}

  // The still frame's own bars are replaced wholesale the first time the script runs, so
  // there is exactly one drawing path afterwards and the two can never disagree.
  fig.querySelectorAll("rect, text.val, text.lab").forEach(function (el) {{ el.remove(); }});
  rebuild(1);
  [fromEl, toEl, crEl, rgEl].forEach(function (el) {{
    el.addEventListener("input", draw);
    el.addEventListener("change", draw);
  }});
  draw();
}})();
</script>
</body>
</html>
"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--local", default=None)
    ap.add_argument("--probe", default=str(HERE / "oeuvre.json"))
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    feed, sha = read_feed(pathlib.Path(args.local) if args.local else None)
    probe = json.load(open(args.probe, encoding="utf-8"))
    D = build_data(feed, sha, probe)

    # The client redraws every bar from the same rows the server used, so those rows — and
    # only those — travel into the page. Nothing else in `D` is written twice.
    D["arm_rows"] = arm_rows(probe)

    data_txt = json.dumps(D, indent=1, ensure_ascii=False, sort_keys=True) + "\n"
    html_txt = render(D)

    if args.check:
        ok = True
        for name, txt in (("data.json", data_txt), ("index.html", html_txt)):
            p = HERE / name
            cur = p.read_text(encoding="utf-8") if p.exists() else ""
            same = cur == txt
            ok = ok and same
            print(f"{'ok  ' if same else 'DIFF'} {name}")
        return 0 if ok else 1

    (HERE / "data.json").write_text(data_txt, encoding="utf-8")
    (HERE / "index.html").write_text(html_txt, encoding="utf-8")
    print(f"wrote data.json ({len(data_txt)} b) and index.html ({len(html_txt)} b)")
    return 0


def arm_rows(probe: dict) -> dict:
    """The per-person rows each arm's live figure is recomputed from, and nothing more."""
    m = SH.measure(probe)
    out = {"atlas": [
        {"birth": r["birth"], "any_works": r["any_works"],
         "creator_works": r["creator_works"]}
        for r in m["atlas_rows"]
    ]}
    for cq, c in m["controls"].items():
        out["range:" + cq] = [
            {"birth": r["birth"], "any_works": r["any_works"],
             "creator_works": r["creator_works"]} for r in c["rows"]
        ]
    for cq, mm in m["matched"].items():
        out["matched:" + cq] = [
            {"birth": r["birth"], "any_works": r["any_works"],
             "creator_works": r["creator_works"]} for r in mm["rows"]
        ]
    return out


if __name__ == "__main__":
    raise SystemExit(main())
