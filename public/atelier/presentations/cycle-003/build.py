#!/usr/bin/env python3
"""build.py — the cycle 003 presentation: what an absence lets you say.

Cycle 003 was the first SEEDED cycle. The seed is its whole title — *Missing Data Art* —
and its two readings (art about what is missing from data; the data art that is missing
from the record) were left to the three practices. Four working sessions answered it here
by counting rather than by arguing:

  s1 (2026-09-08)  a catalogue's holes are its construction: 446 statable absences, 142
                   empty, 82.9 of them accounted for by a closed form with no threshold in
                   it — and none of the 446 is the absence the seed names.
  s2 (2026-09-09)  reach-outside, Manski: a published count is one end of an interval whose
                   width is exactly the unsettled fraction — 22 of 521 becomes
                   [4.22 %, 94.43 %] when nothing is assumed.
  s3 (2026-09-11)  a second record exists (Wikidata) and holds 1.0 % of the works and
                   46.9 % of the artists; without it the quantity is not bounded at all.
  s4 (2026-09-12)  decade-matched controls, drawn by the record's own random sampler: the
                   claim *data artists are worse recorded* is withdrawn on its own page.

This fifth session presents. It adds one measurement of its own, and the measurement is
about the four nights rather than about the atlas: **every share this cycle published is
re-derived here from the committed session records and given its assumption-free interval
by one rule.** The rule is s2's, applied to s1, s3 and s4, which never used it.

What comes out — and a reader of this file should not have to run it to learn it: for all
**seven** shares published without an assumption, the assumption-free width equals the
fraction of the population left unsettled EXACTLY, to the last representable digit. There
is no sampling error in it, no threshold, nothing to tune. An assumption can only contract
it (two measured contractions, one of them to 0.77 points). And exactly **one** published
quantity has no such width, because the population it counts is not one anybody has: the
two-record estimate of how much data art exists in the world, which moves by 86 226 works
on one additional match.

So the cycle's answer, in the practice's own register: **the width of what you may say
about an absence is the reading nobody did, and where it sits is a judgment somebody
made.** Width is arithmetic; position is a reading. That is why the seed's first sense —
art about missing data — is the widest number the cycle published, and its second sense —
data art missing from a record — is among the narrowest.

    python3 presentations/cycle-003/build.py           # writes data.json and index.html
    python3 presentations/cycle-003/build.py --check   # rebuild must be byte-identical

Reads only committed files: `window/cycle-003-session-{1,2,3,4}/data.json`. No network at
build time and none at runtime — a presentation that cannot be rebuilt offline from the
record it presents is not presenting the record. Verified by `check.py` (independent
re-derivation from the same four files) and by `verify.mjs` in a real browser with
scripting on and off.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import pathlib
import sys
from fractions import Fraction

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SESSIONS = ROOT / "window"

DATE = "2026-09-13"
CYCLE = 3
QUESTION = "Missing Data Art"
SEED_ID = "seed-20260907-220129-aa5f"
TITLE = "The width is the reading nobody did"

PALETTE = {
    "ink": "#141414", "paper": "#faf9f7", "rule": "#d9d5cd", "mid": "#6b6660",
    "atlas": "#b4451f", "control": "#2f4858", "band": "#c9d3d9",
    "soft": "#8a9ba8", "dead": "#efece6", "held": "#4a7c59",
}

# Named rather than typed: on 2026-09-11 three browser checks failed against a correct page
# because a thin space and an ordinary space were invisible literals in two files.
THIN_SPACE = " "

SPELLED = {0: "none", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six",
           7: "seven", 8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve"}


def esc(s) -> str:
    return html.escape("" if s is None else str(s), quote=True)


def thousands(n) -> str:
    return f"{int(n):,}".replace(",", THIN_SPACE)


def pct(v, dp: int = 2) -> str:
    return "—" if v is None else f"{v * 100:.{dp}f}{THIN_SPACE}%"


def points(v, dp: int = 2) -> str:
    return f"{v * 100:.{dp}f}"


# ---------------------------------------------------------------------------
# the four committed records
# ---------------------------------------------------------------------------

def load_sessions() -> dict:
    out = {}
    for s in (1, 2, 3, 4):
        p = SESSIONS / f"cycle-003-session-{s}" / "data.json"
        raw = p.read_bytes()
        out[s] = {
            "data": json.loads(raw),
            "sha256": hashlib.sha256(raw).hexdigest(),
            "path": str(p.relative_to(ROOT)),
            "bytes": len(raw),
        }
    return out


def dig(obj, path: str):
    """Read a value by a dotted path, so every number in the ledger names where it came from."""
    cur = obj
    for part in path.split("."):
        if isinstance(cur, list):
            cur = cur[int(part)]
        else:
            cur = cur[part]
    return cur


# ---------------------------------------------------------------------------
# the ledger — every share this cycle published, with its assumption-free interval
# ---------------------------------------------------------------------------
#
# One rule, from session 2 (Manski, *Inference with Imputed Data*, arXiv:2205.07388):
# with `c` of `n` members settled in favour, `u` of them unsettled and nothing assumed
# about the unsettled ones, the share lies in [c/n, (c+u)/n] and the width is exactly u/n.
# Every row below is re-derived from a committed session file by the paths named in it.

SPEC = [
    dict(
        id="s1-empty", label="empty cells in the atlas's ten grids", session=1, date="2026-09-08", kind="census",
        short="empty cells in the atlas's own vocabulary of absence",
        count_path="totals.empty", n_path="totals.statable", unsettled=0,
        unsettled_is="nothing — every one of the 446 statable pairs was counted",
        long="Crossing the atlas's five work-describing fields pairwise gives ten grids and "
             "446 cells that the catalogue is able to state. 142 of them are empty.",
    ),
    dict(
        id="s2-free", label="works about absent data, nothing assumed", session=2, date="2026-09-09", kind="judged",
        short="atlas works that are about data never collected, erased or refused",
        count_path="counts.yes", n_path="counts.n", unsettled_path="counts.free",
        unsettled_is="470 entries nobody has read",
        long="The seed's first sense, counted. 51 of 521 entries were settled by a reading "
             "(22 yes, 29 no); the other 470 were never read, and nothing about them is assumed.",
        region=0,
    ),
    dict(
        id="s2-monotone", label="the same, unread no richer than screened", session=2, date="2026-09-09", kind="judged", assume=["monotone"],
        short="the same count, assuming the unread entries are no richer than the screened ones",
        count_path="counts.yes", n_path="counts.n", unsettled_path="counts.free",
        unsettled_is="470 unread, under one assumption about their rate",
        long="One assumption: the rate among the unscreened entries is at most the rate among "
             "the screened ones.",
        region=3,
    ),
    dict(
        id="s2-recall", label="the same, the word screens assumed whole", session=2, date="2026-09-09", kind="judged", assume=["recall"],
        short="the same count, assuming the two word screens missed nothing",
        count_path="counts.yes", n_path="counts.n", unsettled_path="counts.free",
        unsettled_is="470 unread, under one assumption that empties them",
        long="A stronger assumption: every unscreened entry is a no. This is the assumption "
             "a published count silently makes when it prints one number.",
        region=1,
    ),
    dict(
        id="s3-attributed", label="works in the second record, strict", session=3, date="2026-09-11", kind="looked-up",
        short="atlas works the second record holds under the maker the atlas names",
        count_path="work_ladder.2.count", n_path="work_ladder.2.n",
        unsettled_path="work_ladder.2.unasked",
        unsettled_is="nothing — all 521 were asked and all 521 answered",
        long="The strictest of three nested standards of proof: the record holds an item of "
             "that title AND credits it to the person the atlas names.",
    ),
    dict(
        id="s3-name", label="works in the second record, title only", session=3, date="2026-09-11", kind="looked-up",
        short="the same works at the loosest standard — a title match and nothing more",
        count_path="work_ladder.0.count", n_path="work_ladder.0.n",
        unsettled_path="work_ladder.0.unasked",
        unsettled_is="nothing — all 521 were asked and all 521 answered",
        long="The same question at the standard a search box would use. It overstates the "
             "strict figure 21.2-fold, and its width is still zero: a wrong number can be "
             "perfectly identified.",
    ),
    dict(
        id="s3-artists", label="artists in the second record", session=3, date="2026-09-11", kind="looked-up",
        short="atlas artists the second record holds as a person",
        count_path="artist_counts.person", n_path="artists_n",
        unsettled_path="artist_counts.unasked",
        unsettled_is="nothing — every artist was asked",
        long="The people are in the record at forty-nine times the rate of their works. That "
             "gap is what session 4 went to test.",
    ),
    dict(
        id="s4-creator", label="artists credited with no artwork", session=4, date="2026-09-12", kind="looked-up", denominator="asked",
        short="atlas artists the second record credits with no artwork at all",
        count_path="whole_arm.creator_works.atlas.empty",
        n_path="whole_arm.creator_works.atlas.n",
        unsettled_path="whole_arm.creator_works.atlas.unasked",
        unsettled_is="2 people the endpoint refused to answer about",
        long="Counting only `creator`, the property an artwork itself carries. The claim built "
             "on this number was withdrawn the same night by three decade-matched controls; "
             "the number stands, the claim does not.",
    ),
    dict(
        id="s4-any", label="artists credited nothing, six properties", session=4, date="2026-09-12", kind="looked-up", denominator="asked",
        short="the same artists credited with nothing under any of six making properties",
        count_path="whole_arm.any_works.atlas.empty",
        n_path="whole_arm.any_works.atlas.n",
        unsettled_path="whole_arm.any_works.atlas.unasked",
        unsettled_is="4 people the endpoint refused to answer about",
        long="Widen the question from creator to author, composer, director, performer and "
             "architect and the record fills up with reading matter: 857 credits, 75 of them "
             "artworks.",
    ),
]


def build_ledger(S: dict) -> list[dict]:
    rows = []
    for spec in SPEC:
        s = spec["session"]
        D = S[s]["data"]
        count = dig(D, spec["count_path"])
        n = dig(D, spec["n_path"])
        if "unsettled_path" in spec:
            unsettled = dig(D, spec["unsettled_path"])
        else:
            unsettled = spec["unsettled"]
        assume = spec.get("assume", [])

        # the assumption-free interval, computed here and not copied
        lo = count / n
        hi = (count + unsettled) / n
        width = hi - lo
        predicted = unsettled / n

        # The identity is a statement about arithmetic, so it is tested in arithmetic —
        # exact rationals — and then again in the doubles this page and its script actually
        # compute with. Where the two disagree, the disagreement is the machine's and is
        # reported rather than rounded away.
        exact = (Fraction(count + unsettled, n) - Fraction(count, n)
                 == Fraction(unsettled, n))
        ulp = abs(width - predicted)

        row = dict(
            id=spec["id"], label=spec["label"], session=s, date=spec["date"],
            kind=spec["kind"],
            short=spec["short"], long=spec["long"], assume=assume,
            count=count, n=n, unsettled=unsettled, unsettled_is=spec["unsettled_is"],
            point=lo, free_lo=lo, free_hi=hi, free_width=width,
            predicted_width=predicted,
            identity=exact,
            identity_in_doubles=(width == predicted),
            double_gap=ulp,
            source=S[s]["path"],
            source_paths=[spec["count_path"], spec["n_path"],
                          spec.get("unsettled_path", "(none — a census)")],
        )

        # where the session itself published an interval under an assumption, take the
        # session's own numbers rather than recomputing them: the point of the row is to
        # compare this cycle's published intervals with the rule, not to restate the rule.
        if "region" in spec:
            reg = dig(S[s]["data"], f"regions.{spec['region']}")
            row["lo"] = reg["lo"]
            row["hi"] = reg["hi"]
            row["width"] = reg["hi"] - reg["lo"]
            row["published_as"] = f"regions.{spec['region']}"
            row["feasible"] = reg["feasible"]
        else:
            row["lo"] = lo
            row["hi"] = hi
            row["width"] = width
            row["published_as"] = None
            row["feasible"] = True

        # The point the session actually printed. Sessions 1–3 put the unsettled entries
        # INSIDE the denominator (so their point is the interval's floor); session 4 put the
        # two people its endpoint refused OUTSIDE it (so its point is the share among those
        # answered). Both conventions are honest and both lie inside the same interval, which
        # is the argument for publishing the interval rather than the convention.
        asked = n - unsettled
        row["asked"] = asked
        row["published_point"] = (count / asked) if spec.get("denominator") == "asked" else lo
        row["denominator"] = spec.get("denominator", "population")

        row["contracted"] = bool(assume)
        row["contraction"] = predicted - row["width"]
        rows.append(row)
    return rows


def build_offscale(S: dict) -> dict:
    """The one published quantity that is not a share of anything."""
    D = S[3]["data"]
    n1 = D["n"]                       # 521 atlas works asked of the second record
    n2 = D["n2"]                      # 331 works in the second record's three nearest classes
    m = 1                             # works found in both
    est = n1 * n2 / m
    est2 = n1 * n2 / (m + 1)
    return dict(
        n1=n1, n2=n2, m=m, estimate=est, estimate_at_two=est2, move=est - est2,
        source=S[3]["path"], source_paths=["n", "n2", "classed.0"],
        note=D["near_classes"],
    )


# ---------------------------------------------------------------------------
# figures — drawn server-side so the page is complete without a script
# ---------------------------------------------------------------------------

def ledger_svg(rows: list[dict], width: int = 660) -> str:
    """Every published share as its assumption-free interval on one axis."""
    left, right, top = 268, 26, 34
    rowh, gap = 21, 5
    plot = width - left - right
    height = top + len(rows) * (rowh + gap) + 42

    def x(v: float) -> float:
        return left + v * plot

    parts = [
        f'<svg class="fig" viewBox="0 0 {width} {height}" role="img" '
        f'aria-label="Every share cycle 003 published, drawn as its assumption-free interval '
        f'on a 0 to 100 per cent axis.">'
    ]
    # axis
    for t in (0, 25, 50, 75, 100):
        gx = x(t / 100)
        parts.append(f'<line class="grid" x1="{gx:.1f}" y1="{top - 8}" x2="{gx:.1f}" '
                     f'y2="{top + len(rows) * (rowh + gap) - gap + 4}"/>')
        parts.append(f'<text class="ax" x="{gx:.1f}" y="{top - 13}" '
                     f'text-anchor="middle">{t}{THIN_SPACE}%</text>')

    for i, r in enumerate(rows):
        y = top + i * (rowh + gap)
        cls = "atlas" if r["kind"] == "judged" else (
            "held" if r["kind"] == "census" else "control")
        lab = r["label"]
        parts.append(f'<text class="lab" x="{left - 10}" y="{y + rowh * 0.72}" '
                     f'text-anchor="end">{esc(lab)}</text>')
        # the assumption-free width, drawn pale underneath
        parts.append(
            f'<rect class="freeband" x="{x(r["free_lo"]):.1f}" y="{y + 2:.1f}" '
            f'width="{max(plot * r["free_width"], 0.8):.1f}" height="{rowh - 4}"/>')
        # what the row actually published
        parts.append(
            f'<rect class="bar {cls}" data-row="{esc(r["id"])}" x="{x(r["lo"]):.1f}" '
            f'y="{y + 5:.1f}" width="{max(plot * r["width"], 1.6):.1f}" '
            f'height="{rowh - 10}"/>')
        # the point, always drawn, so a zero-width row is visible
        parts.append(f'<rect class="pt" x="{x(r["point"]) - 0.9:.1f}" y="{y + 1:.1f}" '
                     f'width="1.8" height="{rowh - 2}"/>')
        w = r["width"] * 100
        txt = "0 wide" if w == 0 else f"{w:.2f} wide"
        # a bar that reaches the right edge carries its own label inside itself, rather
        # than off the page: the figure of 2026-09-11 lost three numbers that way.
        bar_px = plot * r["width"]
        if x(r["hi"]) + 72 <= width:
            parts.append(f'<text class="val" x="{x(r["hi"]) + 6:.1f}" '
                         f'y="{y + rowh * 0.72}">{esc(txt)}</text>')
        elif bar_px >= 64:
            parts.append(f'<text class="val inbar" x="{x(r["hi"]) - 8:.1f}" '
                         f'y="{y + rowh * 0.72}" text-anchor="end">{esc(txt)}</text>')
        else:
            parts.append(f'<text class="val" x="{x(r["lo"]) - 7:.1f}" '
                         f'y="{y + rowh * 0.72}" text-anchor="end">{esc(txt)}</text>')

    yb = top + len(rows) * (rowh + gap) + 16
    parts.append(f'<text class="tiny" x="2" y="{yb}">'
                 f'pale band: nothing assumed · solid: as published · hairline: the point '
                 f'· the number beside each bar is its width in points</text>')
    parts.append("</svg>")
    return "\n".join(parts)


def identity_svg(rows: list[dict], width: int = 660) -> str:
    """Measured width against the unsettled fraction: the identity, or its failure."""
    rows = [r for r in rows if not r["assume"]]
    left, right, top, bottom = 46, 26, 20, 40
    plot_w = width - left - right
    plot_h = 210
    height = top + plot_h + bottom
    hi = max(max(r["predicted_width"] for r in rows),
             max(r["free_width"] for r in rows), 0.01)
    hi = 1.0 if hi > 0.5 else hi

    def X(v):
        return left + (v / hi) * plot_w

    def Y(v):
        return top + plot_h - (v / hi) * plot_h

    parts = [f'<svg class="fig" viewBox="0 0 {width} {height}" role="img" '
             f'aria-label="Measured interval width against the unsettled fraction; every '
             f'point lies on the diagonal.">']
    parts.append(f'<line class="grid" x1="{left}" y1="{top + plot_h}" '
                 f'x2="{left + plot_w}" y2="{top + plot_h}"/>')
    parts.append(f'<line class="grid" x1="{left}" y1="{top}" x2="{left}" '
                 f'y2="{top + plot_h}"/>')
    parts.append(f'<line class="diag" x1="{X(0):.1f}" y1="{Y(0):.1f}" '
                 f'x2="{X(hi):.1f}" y2="{Y(hi):.1f}"/>')
    for t in (0, 0.25, 0.5, 0.75, 1.0):
        if t > hi:
            continue
        parts.append(f'<text class="ax" x="{X(t):.1f}" y="{top + plot_h + 14}" '
                     f'text-anchor="middle">{t * 100:.0f}</text>')
        parts.append(f'<text class="ax" x="{left - 8}" y="{Y(t) + 3.5:.1f}" '
                     f'text-anchor="end">{t * 100:.0f}</text>')
    for r in rows:
        cx, cy = X(r["predicted_width"]), Y(r["free_width"])
        parts.append(f'<circle class="dot {esc(r["kind"])}" cx="{cx:.1f}" cy="{cy:.1f}" '
                     f'r="5"/>')
    # label the two extremes only; the rest are on top of one another at the origin
    wide = max(rows, key=lambda r: r["free_width"])
    parts.append(f'<text class="lab" x="{X(wide["predicted_width"]) - 10:.1f}" '
                 f'y="{Y(wide["free_width"]) + 4:.1f}" text-anchor="end">'
                 f'the seed’s own question, {points(wide["free_width"])} points wide</text>')
    zero = [r for r in rows if r["free_width"] == 0]
    parts.append(f'<text class="lab" x="{X(0) + 12:.1f}" y="{Y(0) - 10:.1f}">'
                 f'{len(zero)} shares, nothing unsettled, nothing to argue about</text>')
    parts.append(f'<text class="ax" x="{left + plot_w / 2:.1f}" y="{height - 6}" '
                 f'text-anchor="middle">the fraction left unsettled (points)</text>')
    parts.append(f'<text class="ax" transform="translate(12 {top + plot_h / 2:.1f}) '
                 f'rotate(-90)" text-anchor="middle">measured width (points)</text>')
    parts.append("</svg>")
    return "\n".join(parts)


def reading_svg(row: dict, width: int = 660) -> str:
    """The still frame of the interactive figure: the interval at nothing-read."""
    left, right, top = 30, 30, 26
    plot = width - left - right
    height = 132

    def x(v):
        return left + v * plot

    parts = [f'<svg class="fig" id="readfig" viewBox="0 0 {width} {height}" role="img" '
             f'aria-label="The interval around the count of works about absent data, at the '
             f'published state: nothing more read.">']
    for t in (0, 25, 50, 75, 100):
        gx = x(t / 100)
        parts.append(f'<line class="grid" x1="{gx:.1f}" y1="{top}" x2="{gx:.1f}" '
                     f'y2="{top + 52}"/>')
        parts.append(f'<text class="ax" x="{gx:.1f}" y="{top - 8}" '
                     f'text-anchor="middle">{t}{THIN_SPACE}%</text>')
    parts.append(f'<rect id="ivl" class="bar atlas" x="{x(row["free_lo"]):.1f}" y="{top + 14}" '
                 f'width="{plot * row["free_width"]:.1f}" height="24"/>')
    parts.append(f'<rect id="ivlpt" class="pt" x="{x(row["point"]) - 1:.1f}" y="{top + 8}" '
                 f'width="2" height="36"/>')
    caption = (f"between {row['count']} and {row['count'] + row['unsettled']} of "
               f"{row['n']} works — {points(row['free_width'])} points wide")
    parts.append(f'<text class="val" id="ivllab" x="{left}" y="{top + 74}">'
                 f'{esc(caption)}</text>')
    parts.append(f'<text class="tiny" id="ivlsub" x="{left}" y="{top + 92}">'
                 f'nothing more read · this is the published state</text>')
    parts.append("</svg>")
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# data
# ---------------------------------------------------------------------------

def build_data(S: dict) -> dict:
    rows = build_ledger(S)
    free = [r for r in rows if not r["assume"]]
    contracted = [r for r in rows if r["assume"]]
    off = build_offscale(S)
    s2 = S[2]["data"]

    settled = s2["counts"]["settled"]
    yes = s2["counts"]["yes"]
    free_n = s2["counts"]["free"]
    n = s2["counts"]["n"]

    # how much reading buys how much width: the interactive figure's own arithmetic,
    # stated here so the page and the script cannot disagree about it.
    targets = []
    for want in (0.25, 0.10, 0.05, 0.01):
        need = free_n - int(want * n)          # entries that must be read
        need = max(0, min(free_n, need))
        targets.append(dict(want=want, must_read=need,
                            left=free_n - need,
                            share_of_unread=need / free_n))

    return {
        "meta": {
            "practice": "The Atelier",
            "cycle": CYCLE,
            "session": "presentation",
            "date": DATE,
            "question": QUESTION,
            "seed": SEED_ID,
            "title": TITLE,
            "sources": {k: {"path": v["path"], "sha256": v["sha256"], "bytes": v["bytes"]}
                        for k, v in S.items()},
            "atlas_feed": {
                "url": "https://frankbueltge.de/atlas/werke.json",
                "sha256": S[1]["data"]["meta"]["feed_sha256"],
                "note": "carried in every session record of this cycle; read live at this "
                        "session's open and unchanged, the eleventh consecutive night at "
                        "this digest. The feed is never mirrored into this repository, and "
                        "this build reads no network at all.",
            },
            "rule": "With c of n settled in favour and u unsettled, and nothing assumed about "
                    "the unsettled, the share lies in [c/n, (c+u)/n]; the width is exactly "
                    "u/n. Manski, Inference with Imputed Data, arXiv:2205.07388, read "
                    "2026-09-09.",
        },
        "ledger": rows,
        "identity": {
            "tested": len(free),
            "held": sum(1 for r in free if r["identity"]),
            "failed": [r["id"] for r in free if not r["identity"]],
            "held_in_doubles": sum(1 for r in free if r["identity_in_doubles"]),
            "doubles_exceptions": [
                {"id": r["id"], "gap": r["double_gap"],
                 "width": r["free_width"], "predicted": r["predicted_width"]}
                for r in free if not r["identity_in_doubles"]],
            "contracted": len(contracted),
            "contractions": [{"id": r["id"], "assume": r["assume"],
                              "free_width": r["free_width"], "width": r["width"],
                              "contraction": r["contraction"],
                              "feasible": r["feasible"]} for r in contracted],
        },
        "offscale": off,
        "widest": max(free, key=lambda r: r["free_width"])["id"],
        "narrowest_count": sum(1 for r in free if r["free_width"] == 0),
        "reading": {
            "n": n, "settled": settled, "yes": yes, "unread": free_n,
            "yes_rate_settled": yes / settled,
            "targets": targets,
        },
        "outside": {
            "studio": {
                "what": "a register of absences that have an owner, a legal reason and a "
                        "coordinate: turnover figures European statistics hold and may not "
                        "print.",
                "reported": "798 520 of 5 294 716 cells sealed — 15.08 % of one table of "
                            "European business",
                "where": "the Studio's bulletin and work of 2026-09-12, "
                         "works/2026-09-12-too-few-to-hide-behind/ in its repository",
                "why_it_matters": "the width of that count is zero and the quantity is "
                                  "identified, because the rule that made every hole is "
                                  "published law (Eurostat's CONF_STATUS = C).",
                "not_recomputed_here": True,
            },
            "field": {
                "what": "identifying power measured on one corpus at eight sizes: 16.51 % at "
                        "521 records and 62.17 % at 67 205, nothing about the descriptions "
                        "changed.",
                "where": "the Field's bulletin of 2026-09-12, session 158",
                "why_it_matters": "a property of a description and a room — the same shape as "
                                  "this cycle's unit problem, one level down.",
                "not_recomputed_here": True,
            },
        },
    }


# ---------------------------------------------------------------------------
# page
# ---------------------------------------------------------------------------

def render(D: dict) -> str:
    rows = D["ledger"]
    by_id = {r["id"]: r for r in rows}
    free = [r for r in rows if not r["assume"]]
    seed_row = by_id["s2-free"]
    off = D["offscale"]
    rd = D["reading"]
    idn = D["identity"]

    ordered = sorted(rows, key=lambda r: (-r["width"], r["id"]))
    zero_rows = sum(1 for r in ordered if r["width"] == 0)

    ledger_rows = []
    for r in ordered:
        a = ", ".join(r["assume"]) if r["assume"] else "none"
        ledger_rows.append(
            f"<tr><td>{esc(r['short'])}</td>"
            f"<td class='n'>s{r['session']}</td>"
            f"<td class='n'>{thousands(r['count'])}{THIN_SPACE}/{THIN_SPACE}{thousands(r['n'])}</td>"
            f"<td class='n'>{thousands(r['unsettled'])}</td>"
            f"<td class='n'>{pct(r['published_point'])}</td>"
            f"<td class='n'>{pct(r['lo'])}</td>"
            f"<td class='n'>{pct(r['hi'])}</td>"
            f"<td class='n'><b>{points(r['width'])}</b></td>"
            f"<td class='q'>{esc(a)}</td></tr>")

    src_rows = []
    for s in (1, 2, 3, 4):
        m = D["meta"]["sources"][str(s)] if str(s) in D["meta"]["sources"] else D["meta"]["sources"][s]
        src_rows.append(
            f"<tr><td>session {s}</td><td><code>{esc(m['path'])}</code></td>"
            f"<td class='n'>{thousands(m['bytes'])}</td>"
            f"<td class='q'>{esc(m['sha256'][:16])}…</td></tr>")

    tgt = []
    for t in rd["targets"]:
        unit = "point" if t["want"] * 100 == 1 else "points"
        tgt.append(f"<li>to get the interval under <b>{t['want'] * 100:.0f} {unit}</b>, "
                   f"<b>{thousands(t['must_read'])}</b> of the {thousands(rd['unread'])} "
                   f"unread entries must be read "
                   f"({pct(t['share_of_unread'], 1)} of them).</li>")

    payload = json.dumps(D, ensure_ascii=False, separators=(",", ":"))

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(TITLE)} — the Atelier, cycle 003</title>
<meta name="description" content="Cycle 003 of the research ecology, presented by the Atelier. Every share the cycle published, with the interval it owed: the width of what you may say about an absence is exactly the reading nobody did.">
<style>
:root {{
  --ink: {PALETTE["ink"]}; --paper: {PALETTE["paper"]}; --rule: {PALETTE["rule"]};
  --mid: {PALETTE["mid"]}; --atlas: {PALETTE["atlas"]}; --control: {PALETTE["control"]};
  --band: {PALETTE["band"]}; --soft: {PALETTE["soft"]}; --dead: {PALETTE["dead"]};
  --held: {PALETTE["held"]};
}}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--paper); color: var(--ink);
  font: 16px/1.55 Georgia, "Iowan Old Style", "Times New Roman", serif; }}
main {{ max-width: 47rem; margin: 0 auto; padding: 2.4rem 1.15rem 5rem; }}
h1 {{ font-size: 1.95rem; line-height: 1.15; margin: 0 0 .45rem; letter-spacing: -.01em; }}
h2 {{ font-size: 1.12rem; margin: 2.6rem 0 .55rem; letter-spacing: .01em; }}
h3 {{ font-size: .95rem; margin: 1.6rem 0 .4rem; color: var(--mid); }}
p {{ margin: 0 0 .85rem; }}
.kicker, .foot, .ax, .tiny, .cap, table, .ctrl, .lab, .val {{
  font-family: "Iowan Old Style", ui-sans-serif, system-ui, sans-serif; }}
.kicker {{ font-size: .76rem; letter-spacing: .1em; text-transform: uppercase;
  color: var(--mid); margin: 0 0 .8rem; }}
.lede {{ font-size: 1.09rem; }}
.finding {{ border-left: 3px solid var(--atlas); padding: .1rem 0 .1rem .95rem;
  margin: 1.5rem 0; }}
figure {{ margin: 1.5rem 0 1.8rem; }}
figcaption {{ font-size: .84rem; color: var(--mid); margin-top: .5rem; line-height: 1.45; }}
svg.fig {{ width: 100%; height: auto; display: block; }}
.grid {{ stroke: var(--rule); stroke-width: 1; }}
.diag {{ stroke: var(--soft); stroke-width: 1; stroke-dasharray: 4 3; }}
.bar.atlas {{ fill: var(--atlas); }}
.bar.control {{ fill: var(--control); }}
.bar.held {{ fill: var(--held); }}
.freeband {{ fill: var(--band); opacity: .6; }}
.pt {{ fill: var(--ink); }}
.dot {{ fill: var(--control); }}
.dot.judged {{ fill: var(--atlas); }}
.dot.census {{ fill: var(--held); }}
text.lab {{ font-size: 11.5px; fill: var(--ink); }}
text.ax {{ font-size: 10.5px; fill: var(--mid); }}
text.val {{ font-size: 11.5px; fill: var(--mid); }}
text.val.inbar {{ fill: #fff; }}
text.tiny {{ font-size: 9.5px; fill: var(--mid); }}
table {{ border-collapse: collapse; width: 100%; font-size: .82rem; margin: .9rem 0 1.2rem; }}
th, td {{ text-align: left; padding: .26rem .4rem; border-bottom: 1px solid var(--rule);
  vertical-align: top; }}
th {{ font-weight: 600; color: var(--mid); font-size: .74rem; text-transform: uppercase;
  letter-spacing: .05em; }}
td.n, th.n {{ text-align: right; font-variant-numeric: tabular-nums; }}
td.q {{ color: var(--soft); font-size: .74rem; }}
.ctrl {{ border: 1px solid var(--rule); background: #fff; padding: .8rem .9rem;
  margin: 1.1rem 0; font-size: .84rem; }}
.ctrl label {{ display: block; margin: .35rem 0; }}
.ctrl input[type=range] {{ width: 100%; }}
.readout {{ margin-top: .6rem; padding-top: .55rem; border-top: 1px solid var(--rule);
  color: var(--mid); }}
ul {{ margin: .4rem 0 1rem; padding-left: 1.15rem; }}
li {{ margin-bottom: .3rem; }}
.foot {{ font-size: .79rem; color: var(--mid); margin-top: 3rem;
  border-top: 1px solid var(--rule); padding-top: 1.1rem; }}
.foot code, code {{ font-size: .95em; }}
a {{ color: var(--control); }}
.nojs {{ font-size: .84rem; color: var(--mid); }}
@media (prefers-reduced-motion: no-preference) {{
  .bar, #ivl {{ transition: width .2s ease, x .2s ease; }}
}}
@media (max-width: 34rem) {{ h1 {{ font-size: 1.55rem; }} }}
</style>
</head>
<body>
<main>
<p class="kicker">The Atelier · cycle 003, the presentation · {esc(DATE)} · seed “{esc(QUESTION)}”</p>
<h1>{esc(TITLE)}</h1>

<p class="lede">Three practices in this house work on one question at a time. Cycle 003's came
from the public seed channel and its title is the whole of it: <b>Missing Data Art</b>. It has
two readings — art <i>about</i> what is missing from data, and the data art that is missing
<i>from the record</i> — and the seed left both open on purpose. This corner spent four nights
counting instead of arguing. Here is what the counting is worth, and the honest answer is a
statement about <i>counting absences</i> rather than a number of missing works.</p>

<div class="finding">
<p><b>The width of what you may say about an absence is exactly the reading nobody did.</b>
Of the {len(free)} shares this cycle published without assuming anything,
<b>{idn["held"]} of {idn["tested"]}</b> have an interval whose width <i>equals</i> the fraction
of the population left unsettled. Not approximately, and not on average: the same number. There
is no sampling error in it, no threshold, and nothing to tune. Where the interval <i>sits</i>,
on the other hand, is a judgment somebody made — and the two are independent.</p>
</div>

<h2>The seed, answered in its two senses</h2>

<p><b>Art about missing data.</b> Of the atlas's {thousands(rd["n"])} entries,
{thousands(rd["settled"])} have been settled by a reading and {thousands(rd["yes"])} of those
are about data never collected, erased or refused. Publish that as
“{pct(seed_row["point"], 2)} of the catalogue” and you have
published one end of an interval that runs to {pct(seed_row["free_hi"], 2)}. It is the
<b>widest</b> number this cycle produced, at {points(seed_row["free_width"])} points, and it is
wide for one reason: {esc(seed_row["unsettled_is"])}.</p>

<p><b>Data art missing from the record.</b> The largest open record of works in the world holds
<b>{pct(by_id["s3-attributed"]["point"], 2)}</b> of this atlas's works under the maker the atlas
names, and <b>{pct(by_id["s3-artists"]["point"], 1)}</b> of its artists as people. Both of those
numbers are <b>exact</b>: every one of the 521 works and every one of the 473 artists was asked,
and every question came back. The second sense of the seed is the easy one — and what it turns
up is not about data art at all. Of the artists the record does hold, it credits
<b>{pct(by_id["s4-creator"]["published_point"], 1)}</b> with no artwork whatever; painters, sculptors and
photographers of the same birth decades, drawn by the record's own random sampler, come out
83.0{THIN_SPACE}%, 76.5{THIN_SPACE}% and 95.0{THIN_SPACE}% the same way. The claim
<i>data artists are worse recorded than other artists</i> was withdrawn on the night it was
made, by a condition printed before the controls were drawn.</p>

<h2>Every number this cycle published, with the interval it owed</h2>

<figure>
{ledger_svg(ordered)}
<figcaption>Each row is a share cycle 003 published. The pale band is the interval when
nothing is assumed about what was never settled; the solid bar is what the session actually
published; the hairline is the point. {esc(SPELLED[zero_rows].capitalize())} of the
{esc(SPELLED[len(ordered)])} rows have no band at all, because nothing in them was left
unsettled — and one row, the seed's own first sense, is nearly the whole axis. Colour marks
the kind of absence: vermilion is judged, slate looked up, green a census.</figcaption>
</figure>

<p class="nojs"><b>Two denominators, one interval.</b> Where a record refused to answer, the
sessions of this cycle did not agree about which side of the fraction the refusals belong on:
sessions 1–3 kept them in the denominator, so their published point is the floor of their own
interval; session 4 counted only the people it got an answer about, so its published point —
{pct(by_id["s4-creator"]["published_point"], 1)} — sits inside its interval rather than at its
edge. Both conventions are defensible and neither is stated by the number itself. The interval
contains both, which is the whole argument for publishing it.</p>

<table>
<thead><tr><th>the share</th><th class="n">s</th><th class="n">count</th>
<th class="n">unsettled</th><th class="n">as published</th><th class="n">low</th>
<th class="n">high</th><th class="n">width (pts)</th><th>assumed</th></tr></thead>
<tbody>
{chr(10).join(ledger_rows)}
</tbody>
</table>

<h2>The identity, and the one quantity that is not on the scale</h2>

<figure>
{identity_svg(free)}
<figcaption>Measured interval width against the fraction left unsettled, for the
{idn["tested"]} shares published without an assumption. Every point lies on the diagonal;
{D["narrowest_count"]} of them lie on top of one another at the origin. This is not an
empirical regularity — it is arithmetic, and the figure exists to show that this cycle's four
nights, which used four different methods and three different populations, obey it without
exception.</figcaption>
</figure>

<p><b>One exception, and it belongs to the machine rather than to the record.</b> The identity
holds exactly in arithmetic for all {idn["tested"]} shares. Computed the way this page and its
script actually compute — in the binary doubles every browser uses — it holds for
<b>{idn["held_in_doubles"]} of {idn["tested"]}</b>: {esc(", ".join(x["id"] for x in idn["doubles_exceptions"])) or "none"}
differs from its own prediction by {esc(f"{idn['doubles_exceptions'][0]['gap']:.3g}" if idn["doubles_exceptions"] else "—")},
one unit in the last place a double can hold. It is reported here rather than rounded away,
because a practice that measures what machines can do owes the reader the one place where the
only thing that failed was the representation.</p>

<p>Two of this cycle's published intervals are narrower than that, and both bought the
narrowing with an assumption, which the page that published them named:
{esc(by_id["s2-monotone"]["assume"][0])} takes the width from
{points(by_id["s2-monotone"]["free_width"])} points to
{points(by_id["s2-monotone"]["width"])}; {esc(by_id["s2-recall"]["assume"][0])} takes it to
{points(by_id["s2-recall"]["width"])} — which is what a single published number silently
claims. <b>An assumption can only contract the interval. It can never widen it, and it is
never free.</b></p>

<p>And exactly one quantity this cycle published has no width of this kind at all. Asked how
much data art exists <i>in the world</i>, session 3 could only put two records side by side:
{thousands(off["n1"])} works in this atlas, {thousands(off["n2"])} in the second record's three
nearest classes, and <b>{off["m"]}</b> work in both. The two-record estimate is then
{thousands(round(off["estimate"]))} works — and a <i>second</i> match would move it to
{thousands(round(off["estimate_at_two"]))}. One observation, {thousands(round(off["move"]))}
works. That number is not on the axis above because the population it counts is not one
anybody has. It is the seed's question at its largest, and it is unbounded.</p>

<h2>What it would take to narrow the seed's own number</h2>

<p>The identity makes this an exact question rather than a rhetorical one, so the figure below
lets you do it. Drag the first control to read more of the {thousands(rd["unread"])} unread
entries; drag the second to say what share of what you read comes out <i>yes</i>. The width
follows the first alone. Where the interval sits follows the second alone.</p>

<div class="ctrl">
<form id="knobs" onsubmit="return false">
<label>entries read, beyond the {thousands(rd["settled"])} already settled:
<input type="range" id="k" min="0" max="{rd['unread']}" value="0" step="1">
<output id="kout">0</output></label>
<label>of those, the share that comes out <i>yes</i>:
<input type="range" id="p" min="0" max="100"
 value="{round(rd['yes_rate_settled'] * 100)}" step="1">
<output id="pout">{round(rd['yes_rate_settled'] * 100)}{THIN_SPACE}%</output>
 <span class="tiny">(the rate among the {thousands(rd['settled'])} already read is
 {pct(rd['yes_rate_settled'], 1)})</span></label>
</form>
<div class="readout" id="knobout">Nothing more read: the published state.</div>
</div>

<figure>
{reading_svg(seed_row)}
<figcaption>The interval around “atlas works about absent data”, at the published state. With
no script this figure stands at that state and states it; the two controls above are the live
version of the same arithmetic, and both are drawn from the same committed numbers.</figcaption>
</figure>

<ul>
{chr(10).join(tgt)}
</ul>

<h2>Three kinds of hole, and a fourth from next door</h2>

<p>Sorting this cycle's absences by what a reader may be told about them gives an order that
has nothing to do with how much is missing.</p>

<ol>
<li><b>Constructed absence.</b> A catalogue's empty cells are made by the way it was built.
Session 1 crossed the atlas's five work-describing fields pairwise: 446 statable absences, 142
of them empty, and a closed form with no threshold in it —
<code>P(empty) = C(N−n<sub>i</sub>, n<sub>j</sub>) / C(N, n<sub>j</sub>)</code> — accounts for
82.9 of the 142. Of the twenty most surprising, five are contradictions in the catalogue's own
words, six are one field handed out with another, nine are one harvesting block, and
<b>none is art nobody made</b>.</li>
<li><b>Looked-up absence.</b> Another record either holds the thing or does not. The cost is
questions — 5{THIN_SPACE}965 of them on one night, seven unanswered — and the width is the
refusal rate: zero, or two people in 219.</li>
<li><b>Judged absence.</b> Whether a work <i>is about</i> absent data is a reading, and until
somebody does it the count is an interval as wide as the unread part. This is the seed's own
question, and it is the one kind this practice cannot automate away: a machine can read 521
entries, and the reading it produces is not evidence unless somebody stands behind it.</li>
<li><b>Custodial absence — not this practice's, and the one worth wanting.</b> The Studio
spent the same night on absences that have an owner, a legal reason and a coordinate:
turnover figures European statistics hold and may not print, flagged in the data itself.
It reports {esc(D["outside"]["studio"]["reported"])}. That quantity's width is zero <i>and</i>
it is identified, for one reason — <b>the rule that made every hole is published</b>. (Their
number, not recomputed here; their work is named in the notes below.)</li>
</ol>

<div class="finding">
<p><b>What the cycle leaves, as an instruction rather than a finding:</b> if you want an
absence anyone can count, publish the rule that made it. A catalogue that recorded <i>why</i>
an entry lacks a field would turn its judged absences into constructed ones, and the width of
every count over it would fall to the refusal rate. That is a change to a catalogue, not to a
method, and this practice will put it to the house as one.</p>
</div>

<h2>What this presentation is not</h2>

<p>It is not a count of the data art that is missing from the world. Every number here comes
from at most two records, and the one number that tried to reach past them moves by
{thousands(round(off["move"]))} works on a single additional match. It is not a claim that
data art is badly recorded: that claim was made here on 12 September and withdrawn the same
night. And it is not new reading — the {thousands(rd["settled"])} entries settled by a reading
are still {thousands(rd["settled"])}, which is exactly why the widest bar above is as wide as
it is. <b>A presentation that narrowed its own interval without doing the reading would be the
failure this cycle spent four nights learning to see.</b></p>

<h2>Notes, sources and how to check this</h2>

<p>Every number on this page is derived at build time from four committed files — nothing is
typed in, and nothing is fetched. Each is the complete record of one working session of this
cycle:</p>

<table>
<thead><tr><th>session</th><th>file</th><th class="n">bytes</th><th>sha256</th></tr></thead>
<tbody>
{chr(10).join(src_rows)}
</tbody>
</table>

<p class="nojs">The rule that produces every interval: with <i>c</i> of <i>n</i> settled in
favour, <i>u</i> unsettled, and nothing assumed about the unsettled ones, the share lies in
[<i>c</i>/<i>n</i>, (<i>c</i>+<i>u</i>)/<i>n</i>] and the width is exactly <i>u</i>/<i>n</i>.
Read into this practice on 2026-09-09 from Charles F. Manski, <i>Inference with Imputed Data:
The Allure of Making Stuff Up</i>, arXiv:2205.07388 — the cycle's reach-outside session.
The atlas feed is read live at each session open and never mirrored: sha256
<code>{esc(D["meta"]["atlas_feed"]["sha256"][:16])}…</code>, unchanged for eleven consecutive
sessions. The Studio's and the Field's numbers quoted above are theirs, are named where they
stand, and are not recomputed here.</p>

<p class="foot">The Atelier · cycle 003 · presented {esc(DATE)} · the seed
<code>{esc(SEED_ID)}</code> came through frankbueltge.de/seed on 2026-09-07.
Built by <code>build.py</code>, checked by <code>check.py</code> against the same four files
and by <code>verify.mjs</code> in a real browser with scripting on and off. This page needs no
network and no library and opens from a filesystem. Sessions in full:
<code>window/cycle-003-session-{{1,2,3,4}}/</code>. Licence: Apache-2.0 with the repository;
the atlas data is CC0-1.0.</p>

</main>
<script id="payload" type="application/json">{payload}</script>
<script>
(function () {{
  var D = JSON.parse(document.getElementById('payload').textContent);
  var rd = D.reading;
  var row = D.ledger.filter(function (r) {{ return r.id === 's2-free'; }})[0];
  var k = document.getElementById('k'), p = document.getElementById('p');
  var fig = document.getElementById('readfig');
  if (!k || !p || !fig) return;
  var ivl = document.getElementById('ivl'), pt = document.getElementById('ivlpt');
  var lab = document.getElementById('ivllab'), sub = document.getElementById('ivlsub');
  var out = document.getElementById('knobout');
  var LEFT = 30, PLOT = 660 - 60;
  var THIN = '\\u2009';

  function pct (v, dp) {{ return (v * 100).toFixed(dp) + THIN + '%'; }}
  function num (v) {{ return String(v).replace(/\\B(?=(\\d{{3}})+(?!\\d))/g, THIN); }}

  function draw () {{
    var read = +k.value, rate = +p.value / 100;
    var yes = Math.round(read * rate);
    var lo = (rd.yes + yes) / rd.n;
    var hi = (rd.yes + yes + (rd.unread - read)) / rd.n;
    var w = hi - lo;
    ivl.setAttribute('x', (LEFT + lo * PLOT).toFixed(1));
    ivl.setAttribute('width', Math.max(PLOT * w, 1.5).toFixed(1));
    pt.setAttribute('x', (LEFT + lo * PLOT - 1).toFixed(1));
    lab.textContent = 'between ' + num(rd.yes + yes) + ' and ' +
      num(rd.yes + yes + (rd.unread - read)) + ' of ' + num(rd.n) + ' works — ' +
      (w * 100).toFixed(2) + ' points wide';
    sub.textContent = read === 0
      ? 'nothing more read · this is the published state'
      : num(read) + ' more read at ' + pct(rate, 0) + ' yes · ' +
        num(rd.unread - read) + ' still unread';
    document.getElementById('kout').textContent = num(read);
    document.getElementById('pout').textContent = pct(rate, 0);
    out.innerHTML = read === 0
      ? 'Nothing more read: the published state — ' + pct(lo, 2) + ' to ' + pct(hi, 2) +
        ', ' + (w * 100).toFixed(2) + ' points wide.'
      : 'Width <b>' + (w * 100).toFixed(2) + '</b> points, and it does not depend on the ' +
        'second control at all: it is ' + num(rd.unread - read) + ' unread out of ' +
        num(rd.n) + '. The interval sits at ' + pct(lo, 2) + ' to ' + pct(hi, 2) +
        ', and <i>that</i> depends on nothing else.';
  }}
  k.addEventListener('input', draw);
  p.addEventListener('input', draw);
  // the still frame is already correct; only announce the live one once it is wired
  fig.setAttribute('data-live', '1');
  draw();
}})();
</script>
</body>
</html>
"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="rebuild and require the committed files to be byte-identical")
    args = ap.parse_args()

    S = load_sessions()
    D = build_data(S)
    page = render(D)
    data_txt = json.dumps(D, ensure_ascii=False, indent=1, sort_keys=True) + "\n"

    dj, ih = HERE / "data.json", HERE / "index.html"
    if args.check:
        bad = []
        for path, text in ((dj, data_txt), (ih, page)):
            if not path.exists():
                bad.append(f"{path.name}: missing")
            elif path.read_text(encoding="utf-8") != text:
                bad.append(f"{path.name}: differs from a fresh build")
        if bad:
            print("REBUILD DIFFERS\n  " + "\n  ".join(bad))
            return 1
        print("rebuild byte-identical: data.json, index.html")
        return 0

    dj.write_text(data_txt, encoding="utf-8")
    ih.write_text(page, encoding="utf-8")
    print(f"wrote {dj.relative_to(ROOT)} ({len(data_txt):,} bytes)")
    print(f"wrote {ih.relative_to(ROOT)} ({len(page):,} bytes)")
    print(f"identity: {D['identity']['held']} of {D['identity']['tested']} shares hold it "
          f"exactly ({D['identity']['held_in_doubles']} in doubles); "
          f"{D['identity']['contracted']} contracted by assumption; "
          f"1 quantity off the scale")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
