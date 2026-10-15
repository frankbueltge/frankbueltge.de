#!/usr/bin/env python3
"""Cycle 003 presentation — render index.html from the committed data. Deterministic.

Session 159. Every number the page shows passes through `num()`, which registers it together with
the figure key it came from; `check.py` scrapes the rendered page for numerals and fails on any
that is neither a registered figure nor a declared literal (a date, a session number, a DOI).
`check.py` also re-runs this file into memory and requires the committed index.html to be
byte-identical, so a number edited into the HTML by hand fails.

No model is called anywhere in this file. Standard library only. No network. The page it writes
opens from a filesystem, loads nothing and runs no script.

Usage: python3 presentations/cycle-003/build.py
"""

from __future__ import annotations

import html
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from figures import PROVENANCE, collect  # noqa: E402

THIN = " "

# Numerals the page may contain that are not measurements, declared so check.py can tell them from
# figures: dates, session and cycle numbers, identifiers, the rule names that carry a digit, the
# numbers of this practice's own open questions, and the bars quoted from a pre-registration.
LITERALS = {
    # dates, cycles, sessions, small counting words
    "003", "001", "002", "2026", "09", "08", "11", "12", "13", "155", "156", "157", "158", "159",
    "1", "2", "3", "4", "5", "6", "7", "8",
    # rule and prediction names
    "R1", "R2", "R3", "R4", "R5", "P1", "P2", "P3", "P4", "P5", "P6",
    # this practice's own open questions, named in section 4
    "44", "45", "46",
    # bars quoted verbatim from a pre-registration, not measurements
    "0.05", "1.0", "2.0",
}

REGISTRY: dict[str, str] = {}


def num(value, key: str, dp: int | None = None, pct: bool = False, group: bool = False) -> str:
    """Format a number for the page and register it against the figure key it came from."""
    if dp is None:
        text = f"{value:,}".replace(",", THIN) if group else str(value)
    else:
        text = f"{value:,.{dp}f}".replace(",", THIN) if group else f"{value:.{dp}f}"
    REGISTRY[text] = key
    shown = ("&minus;" + text[1:]) if text.startswith("-") else text
    if pct:
        return f"{shown}{THIN}%"
    return shown


def esc(s: str) -> str:
    return html.escape(s, quote=False)


# ---------------------------------------------------------------------------
# Figures, drawn as inline SVG. No library, no script, no external file.
# ---------------------------------------------------------------------------

def ladder_svg(uk: list[dict], gov: list[dict] | None, home_pct: float, home_n: int) -> str:
    """The room curve: the share of descriptions failing to pick out their own record, by size."""
    W, H = 720, 340
    L, R, T, B = 58, 18, 26, 46
    xs = [L, W - R]
    ys = [T, H - B]

    def lo(n):  # log10 scale
        return math.log10(max(n, 1))

    all_n = [r["n"] for r in uk] + ([r["n"] for r in gov] if gov else []) + [home_n]
    x0, x1 = lo(min(all_n)), lo(max(all_n))

    def px(n):
        return xs[0] + (lo(n) - x0) / (x1 - x0) * (xs[1] - xs[0])

    def py(p):
        return ys[1] - (p / 85.0) * (ys[1] - ys[0])

    parts = [f'<svg viewBox="0 0 {W} {H}" role="img" '
             f'aria-label="Share of descriptions that fail to identify their own record, '
             f'against catalogue size" class="fig">']
    # grid
    for p in (0, 20, 40, 60, 80):
        y = py(p)
        parts.append(f'<line x1="{xs[0]}" y1="{y:.1f}" x2="{xs[1]}" y2="{y:.1f}" class="grid"/>')
        parts.append(f'<text x="{xs[0] - 8}" y="{y + 4:.1f}" class="ax" text-anchor="end">{p}%</text>')
    for n in (521, 1000, 4000, 16000, 64000, 156000):
        if lo(n) < x0 - 0.01 or lo(n) > x1 + 0.01:
            continue
        x = px(n)
        parts.append(f'<line x1="{x:.1f}" y1="{ys[0]}" x2="{x:.1f}" y2="{ys[1]}" class="grid"/>')
        lab = f"{n:,}".replace(",", THIN)
        parts.append(f'<text x="{x:.1f}" y="{ys[1] + 18}" class="ax" text-anchor="middle">{lab}</text>')

    def path(rows, cls):
        d = " ".join(("M" if i == 0 else "L") + f"{px(r['n']):.1f},{py(r['not_unique_pct']):.1f}"
                     for i, r in enumerate(rows))
        out = [f'<path d="{d}" class="{cls}"/>']
        for r in rows:
            out.append(f'<circle cx="{px(r["n"]):.1f}" cy="{py(r["not_unique_pct"]):.1f}" r="3.2" '
                       f'class="{cls}-d"/>')
        return "".join(out)

    parts.append(path(uk, "uk"))
    if gov:
        parts.append(path(gov, "gov"))
    parts.append(f'<circle cx="{px(home_n):.1f}" cy="{py(home_pct):.1f}" r="5" class="home-d"/>')

    parts.append(f'<text x="{px(uk[-1]["n"]) - 6:.1f}" y="{py(uk[-1]["not_unique_pct"]) - 10:.1f}" '
                 f'class="lab uk-t" text-anchor="end">data.gov.uk</text>')
    if gov:
        parts.append(f'<text x="{px(gov[-1]["n"]) - 6:.1f}" '
                     f'y="{py(gov[-1]["not_unique_pct"]) + 20:.1f}" '
                     f'class="lab gov-t" text-anchor="end">govdata.de</text>')
    parts.append(f'<text x="{px(home_n) + 10:.1f}" y="{py(home_pct) - 8:.1f}" class="lab home-t">'
                 f'the atlas, at its own size</text>')
    parts.append(f'<text x="{(xs[0] + xs[1]) / 2:.0f}" y="{H - 6}" class="ax" '
                 f'text-anchor="middle">records in the catalogue (log scale)</text>')
    parts.append("</svg>")
    return "".join(parts)


def matrix_svg(pairs: dict, ops: list[str], labels: dict) -> str:
    """The agreement matrix for one arm, as a small heat grid."""
    cell, pad_l, pad_t = 58, 214, 96
    W = pad_l + cell * len(ops) + 12
    H = pad_t + cell * len(ops) + 12
    parts = [f'<svg viewBox="0 0 {W} {H}" role="img" class="fig" '
             f'aria-label="Pairwise agreement between the cycle\'s instruments">']
    for j, o in enumerate(ops):
        x = pad_l + j * cell + cell / 2
        parts.append(f'<text x="{x:.0f}" y="{pad_t - 10}" class="ax mx" text-anchor="end" '
                     f'transform="rotate(-40 {x:.0f} {pad_t - 10})">{esc(labels[o])}</text>')
    for i, o in enumerate(ops):
        y = pad_t + i * cell + cell / 2 + 4
        parts.append(f'<text x="{pad_l - 10}" y="{y:.0f}" class="ax" text-anchor="end">'
                     f'{esc(labels[o])}</text>')
    for i, a in enumerate(ops):
        for j, b in enumerate(ops):
            x, y = pad_l + j * cell, pad_t + i * cell
            if i == j:
                parts.append(f'<rect x="{x}" y="{y}" width="{cell - 3}" height="{cell - 3}" '
                             f'class="c-self"/>')
                continue
            key = f"{a}|{b}" if f"{a}|{b}" in pairs else f"{b}|{a}"
            c = pairs[key]
            k = c["kappa"]
            if c["degenerate"]:
                cls = "c-deg"
                txt = "—"
            elif k >= 0.4:
                cls = "c-hi"
                txt = f"{k:+.2f}"
            elif k >= 0.2:
                cls = "c-mid"
                txt = f"{k:+.2f}"
            else:
                cls = "c-lo"
                txt = f"{k:+.2f}"
            parts.append(f'<rect x="{x}" y="{y}" width="{cell - 3}" height="{cell - 3}" '
                         f'class="{cls}"/>')
            parts.append(f'<text x="{x + (cell - 3) / 2:.0f}" y="{y + (cell - 3) / 2 + 5:.0f}" '
                         f'class="cv" text-anchor="middle">{txt}</text>')
    parts.append("</svg>")
    return "".join(parts)


CSS = """
:root{--ink:#15171a;--mut:#5d646e;--line:#d9dce1;--bg:#fbfbf9;--acc:#1b4f72;--warn:#8a3b2a;
--uk:#1b4f72;--gov:#8a5a1b;--home:#7a1f4f}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
font:16px/1.62 Georgia,'Iowan Old Style','Times New Roman',serif}
main{max-width:50rem;margin:0 auto;padding:2.6rem 1.2rem 5rem}
h1{font-size:1.95rem;line-height:1.22;margin:.2rem 0 .5rem;letter-spacing:-.01em}
h2{font-size:1.28rem;margin:2.8rem 0 .6rem;line-height:1.3}
h3{font-size:1.04rem;margin:1.8rem 0 .4rem}
p{margin:.7rem 0}
.kicker{font:600 .78rem/1.4 ui-sans-serif,system-ui,sans-serif;letter-spacing:.1em;
text-transform:uppercase;color:var(--mut)}
.lede{font-size:1.12rem;border-left:3px solid var(--acc);padding-left:1rem;margin:1.4rem 0 2rem}
.mono{font:.86em ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.note{background:#f2f2ee;border:1px solid var(--line);padding:.85rem 1rem;margin:1.3rem 0;
font-size:.94rem}
.note b{font-weight:700}
table{border-collapse:collapse;width:100%;margin:1.1rem 0;font-size:.92rem}
th,td{border-bottom:1px solid var(--line);padding:.42rem .5rem;text-align:left;vertical-align:top}
th{font:600 .8rem/1.3 ui-sans-serif,system-ui,sans-serif;letter-spacing:.03em;color:var(--mut);
text-transform:uppercase}
td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
.v-ref{color:var(--warn);font-weight:700}
.v-con{color:var(--acc);font-weight:700}
.v-nil{color:var(--mut);font-weight:700}
figure{margin:1.6rem 0}
figcaption{font-size:.88rem;color:var(--mut);margin-top:.5rem}
.fig{width:100%;height:auto;background:#fff;border:1px solid var(--line)}
.grid{stroke:#e8e9ec;stroke-width:1}
.ax{font:11px ui-sans-serif,system-ui,sans-serif;fill:#5d646e}
.mx{font-size:10.5px}
.lab{font:600 12px ui-sans-serif,system-ui,sans-serif}
.uk{fill:none;stroke:var(--uk);stroke-width:2.2}
.uk-d{fill:var(--uk)}.uk-t{fill:var(--uk)}
.gov{fill:none;stroke:var(--gov);stroke-width:2.2;stroke-dasharray:6 3}
.gov-d{fill:var(--gov)}.gov-t{fill:var(--gov)}
.home-d{fill:var(--home)}.home-t{fill:var(--home)}
.c-self{fill:#f2f2ee}.c-deg{fill:#eceef1}.c-lo{fill:#f6e7e2}.c-mid{fill:#dfe7ef}.c-hi{fill:#b9cfe4}
.cv{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:#15171a}
footer{margin-top:3.4rem;border-top:1px solid var(--line);padding-top:1rem;font-size:.88rem;
color:var(--mut)}
a{color:var(--acc)}
ul{margin:.6rem 0 .6rem 1.1rem;padding:0}li{margin:.3rem 0}
@media (max-width:34rem){body{font-size:15px}main{padding:1.6rem .9rem 3rem}h1{font-size:1.6rem}}
"""


def verdict_span(v: str) -> str:
    cls = {"confirmed": "v-con", "refuted": "v-ref"}.get(v, "v-nil")
    return f'<span class="{cls}">{esc(v)}</span>'


def build() -> str:
    F = collect()
    s155, s156, s157, s158 = F["s155"], F["s156"], F["s157"], F["s158"]
    ag, room = F["s159_agreement"], F["s159_room"]
    ok = bool(room.get("ladder"))
    gov = room.get("ladder") or None
    preds = room.get("predictions") or {}

    P: list[str] = []
    A = P.append

    A('<!-- Cycle 003 presentation, The Field. Rendered by presentations/cycle-003/build.py from '
      'the committed data. Do not edit by hand: check.py re-renders this file and fails on any '
      'difference. -->')
    A('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
      '<meta name="viewport" content="width=device-width,initial-scale=1">'
      '<title>What is missing in a description is not in the description — The Field, cycle 003</title>'
      f'<style>{CSS}</style></head><body><main>')

    # ---- head -----------------------------------------------------------------
    A('<p class="kicker">The Field &middot; science &middot; cycle 003 &middot; '
      'sessions 155&ndash;159 &middot; 8&ndash;13 September 2026</p>')
    A('<h1>What is missing in a description is not in the description</h1>')
    A('<p class="kicker">Seeded question: <em>Missing Data Art</em> '
      '(<span class="mono">seed-20260907-220129-aa5f</span>)</p>')

    A(f'<p class="lede">We set out to measure what is missing from the records of data art, and '
      f'spent five sessions failing to define it. Four ways of asking &ldquo;is this description '
      f'empty?&rdquo; were built and put against each other; what they agree about is not what a '
      f'reader needs. The one thing that did survive is a fact about rooms rather than about '
      f'texts: the same sentences, unchanged, fail to pick out their own record '
      f'{num(s158["ladder_low_pct"], "s158.ladder_low_pct", 2, pct=True)} of the time in a '
      f'catalogue of {num(s158["ladder_low_n"], "s158.ladder_low_n", group=True)} records and '
      f'{num(s158["ladder_high_pct"], "s158.ladder_high_pct", 2, pct=True)} of the time in one of '
      f'{num(s158["ladder_high_n"], "s158.ladder_high_n", group=True)}. Tonight we ran that '
      f'measurement again on a second catalogue we did not build, because a finding made on one '
      f'corpus is not a finding about corpora.</p>')

    A('<div class="note"><b>How to read this page.</b> Every figure below was made by one of five '
      'artifacts, each with its own pre-registration, method, data and checker; the artifact that '
      'made a figure is named beside it. Nothing here is retyped: '
      '<span class="mono">check.py</span> reads each number out of the committed data file of the '
      'artifact that produced it, re-renders this page from those values, and fails if the '
      'committed HTML differs by one digit. Where this practice got something wrong, the wrong '
      'version stays in the record and is marked, never patched.</div>')

    # ---- 1. the arc -------------------------------------------------------------
    A('<h2>1. What we asked, and what happened to the question</h2>')
    A('<p>The seed was two words, and its two readings &mdash; <em>art about what is missing in '
      'data</em>, and <em>the data art that is missing</em> &mdash; were left open to the three '
      'practices. From the science standpoint the second reading is measurable, so we began at '
      'home, with the house&rsquo;s own catalogue of data art.</p>')

    A('<h3>Beat one &mdash; a catalogue that is complete on paper</h3>')
    A(f'<p>The atlas holds {num(s155["entries"], "s155.entries", group=True)} works. Counted the '
      f'way we first counted it, it is '
      f'{num(s155["present_key_pct"], "s155.present_key_pct", 2, pct=True)} complete. A screen for '
      f'values that are present but say nothing about the record they hang on &mdash; scrape '
      f'residue, a sentence with its head or tail cut off, a text repeated across records &mdash; '
      f'flagged {num(s155["broad_k"], "s155.broad_k", group=True)} of them, '
      f'{num(s155["broad_pct"], "s155.broad_pct", 2, pct=True)}. And the flags had an address: of '
      f'{num(s155["rhizome_n"], "s155.rhizome_n", group=True)} works from a single upstream '
      f'source, {num(s155["rhizome_broad"], "s155.rhizome_broad", group=True)} tripped the screen; '
      f'of the {num(s155["not_rhizome_n"], "s155.not_rhizome_n", group=True)} from everywhere '
      f'else, {num(s155["not_rhizome_strict"], "s155.not_rhizome_strict")} tripped its strict '
      f'limb. An adversary convened the same evening then showed the completeness figure was an '
      f'arithmetic choice: count the cells a schema defines rather than the keys a record happens '
      f'to carry and the same catalogue is '
      f'{num(s155["schema_fixed_pct"], "s155.schema_fixed_pct", 2, pct=True)} complete. '
      f'<span class="mono">{esc("artifacts/cycle-003/2026-09-08-complete-and-empty/")}</span></p>')

    A('<h3>Beat two &mdash; so whose arithmetic is right?</h3>')
    A(f'<p>The cycle&rsquo;s outward session went to find out. '
      f'{num(s156["candidates"], "s156.candidates")} candidate sources were screened, '
      f'{num(s156["included"], "s156.included")} included, spanning '
      f'{num(s156["groups"], "s156.groups")} independent author groups; '
      f'{num(s156["coded"], "s156.coded")} of them could be coded at all, every code quoted from '
      f'a passage fetched that night, and the rest are recorded as undetermined and why. Of the '
      f'{num(s156["ratio_groups"], "s156.ratio_groups")} groups that compute a completeness ratio '
      f'at all, {num(s156["schema_fixed"], "s156.schema_fixed")} use a schema-fixed denominator '
      f'and {num(s156["present_key"], "s156.present_key")} use the one we had used. '
      f'{num(s156["tier_weighted_groups"], "s156.tier_weighted_groups")} of the seven weight '
      f'fields by an obligation tier, a family that cannot be run against our catalogue at all, '
      f'and one tool '
      f'reports counts with no denominator and no ratio &mdash; a third basis we had not imagined. '
      f'The question was ours, filed by us, and the answer went against us. '
      f'<span class="mono">{esc("artifacts/cycle-003/2026-09-09-the-denominator/")}</span></p>')

    A('<h3>Beat three &mdash; the instrument goes abroad, and a reader convicts it</h3>')
    A(f'<p>The screen was frozen and carried, unchanged, to three catalogues nobody here built, as '
      f'a census rather than a sample: the Cleveland Museum of Art '
      f'({num(s157["cma_records"], "s157.cma_records", group=True)} records), data.gov.uk '
      f'({num(s157["uk_records"], "s157.uk_records", group=True)}) and govdata.de '
      f'({num(s157["govdata_records"], "s157.govdata_records", group=True)}). '
      f'{num(s157["refuted"], "s157.refuted")} of {num(s157["total"], "s157.total")} predictions '
      f'were refuted. The premise itself did not travel: Cleveland&rsquo;s description field is '
      f'filled on {num(s157["cma_pct"], "s157.cma_pct", 2, pct=True)} of records, so there the '
      f'ordinary completeness measure already reports the problem and there is no gap to find.</p>')
    A(f'<p>Then the decisive part. Sixty held-out values were put to a reader who could see the '
      f'text and nothing else &mdash; no flag, no title, no catalogue. The reader called '
      f'{num(s157["reader_says_nothing"], "s157.reader_says_nothing")} of '
      f'{num(s157["audit_n"], "s157.audit_n")} empty. The screen flagged '
      f'{num(s157["screen_flags"], "s157.screen_flags")}. Cohen&rsquo;s '
      f'&kappa;{THIN}={THIN}{num(s157["kappa"], "s157.kappa", 4)}, precision '
      f'{num(s157["precision"], "s157.precision", 3)}. Most of what the screen called empty, a '
      f'person reading it did not. The defect turned out to be in our <em>audit</em>: one of the '
      f'four rules is a relation between a value and its whole catalogue, and a reader shown one '
      f'value cannot see it. Told only how many records carry the identical text, the same reader '
      f'on the same sixty values moved to &kappa;{THIN}='
      f'{THIN}{num(s157["informed_kappa"], "s157.informed_kappa", 4)}. '
      f'<span class="mono">{esc("artifacts/cycle-003/2026-09-11-does-it-travel/")}</span></p>')

    A('<h3>Beat four &mdash; stop asking an opinion, ask a task</h3>')
    A(f'<p>If a description is not empty, what is it <em>for</em>? A record&rsquo;s description '
      f'should let you find the record. So: blank out of each description every word its own title '
      f'already contains, then show a reader the remains and five candidate records from the same '
      f'catalogue. Chance is {num(s158["chance_pct"], "s158.chance_pct", 2, pct=True)}. Two arms, '
      f'each censused whole and sampled from its held-out half; three separate blind readers.</p>')
    A(f'<p><strong>The task was too easy, and that is the result.</strong> Accuracy '
      f'{num(s158["home_accuracy"], "s158.home_accuracy", 2, pct=True)} at home and '
      f'{num(s158["uk_accuracy"], "s158.uk_accuracy", 2, pct=True)} on data.gov.uk. '
      f'{num(s158["home_flagged_correct"], "s158.home_flagged_correct")} of '
      f'{num(s158["home_flagged_n"], "s158.home_flagged_n")} values the screen calls hollow still '
      f'identified their own record out of five. Precision against this criterion is '
      f'{num(s158["home_precision"], "s158.home_precision", 3)} &mdash; half of the previous '
      f'night&rsquo;s. Abroad the sign reverses: flagged values were identified <em>more</em> '
      f'often than unflagged ones, a gap of '
      f'{num(s158["uk_gap"], "s158.uk_gap", 2)} points. '
      f'{num(s158["refuted"], "s158.refuted")} of {num(s158["total"], "s158.total")} predictions '
      f'refuted, {num(s158["confirmed"], "s158.confirmed")} confirmed &mdash; one of them '
      f'vacuously, which the artifact says on the page a reader meets &mdash; and '
      f'{num(s158["not_evaluable"], "s158.not_evaluable")} not evaluable. '
      f'<span class="mono">'
      f'{esc("artifacts/cycle-003/2026-09-12-what-a-description-is-for/")}</span></p>')

    # ---- 2. the room ------------------------------------------------------------
    A('<h2>2. The one finding that survived: a description and a room</h2>')
    A(f'<p>A second, wholly mechanical instrument was running beside the reader. It takes a masked '
      f'description, keeps its three rarest words, and asks how many records in the catalogue '
      f'carry all three. On the atlas, '
      f'{num(s158["atlas_not_unique_pct"], "s158.atlas_not_unique_pct", 2, pct=True)} of values '
      f'fail to narrow to a single record. On data.gov.uk, '
      f'{num(s158["uk_not_unique_pct"], "s158.uk_not_unique_pct", 2, pct=True)} do &mdash; '
      f'{num(s158["home_abroad_ratio"], "s158.home_abroad_ratio", 1)} times more, until you '
      f'notice that the instrument counts <em>inside</em> the '
      f'catalogue, so a bigger room makes the same sentence less distinguishing.</p>')
    A(f'<p>Rather than confess that, we measured it: one corpus, eight sizes, instrument '
      f'untouched, nothing about the descriptions changed. The rate climbs from '
      f'{num(s158["ladder_low_pct"], "s158.ladder_low_pct", 2, pct=True)} at '
      f'{num(s158["ladder_low_n"], "s158.ladder_low_n", group=True)} records to '
      f'{num(s158["ladder_high_pct"], "s158.ladder_high_pct", 2, pct=True)} at '
      f'{num(s158["ladder_high_n"], "s158.ladder_high_n", group=True)}, a factor of '
      f'{num(s158["narrowing_ratio"], "s158.narrowing_ratio", 2)}. The screen&rsquo;s own '
      f'duplicate rule moves with it &mdash; '
      f'{num(s158["r4_low_pct"], "s158.r4_low_pct", 2, pct=True)} to '
      f'{num(s158["r4_high_pct"], "s158.r4_high_pct", 2, pct=True)}, a factor of '
      f'{num(s158["r4_ratio"], "s158.r4_ratio", 2)} &mdash; and since the other three rules are '
      f'properties of a single string and cannot move at all, every point of the screen&rsquo;s '
      f'own rise is that one rule&rsquo;s. <strong>Identifying power is not a property of a '
      f'description. It is a property of a description and a room.</strong></p>')

    A(ROOM_SECTION(room, ok, preds, s158, F.get("s159_p6", {})))

    A('<figure>')
    A(ladder_svg(s158["ladder"], gov, s158["atlas_not_unique_pct"], s158["ladder_low_n"]))
    cap = (f'The share of descriptions that fail to pick out their own record, against the number '
           f'of records they are competing with. One corpus per line, subsampled at each size, '
           f'instrument unchanged; the descriptions themselves are identical along a line. '
           f'data.gov.uk measured 2026-09-12, govdata.de measured 2026-09-13. The single mark is '
           f'the house atlas at its own size.')
    if not ok:
        cap = (f'The data.gov.uk curve, measured 2026-09-12, with the house atlas at its own size. '
               f'The second corpus is absent: see the note above.')
    A(f'<figcaption>{cap}</figcaption></figure>')

    # ---- 3. the matrix ----------------------------------------------------------
    A('<h2>3. Do our four ways of asking agree with each other?</h2>')
    A(f'<p>By the end of the cycle this practice had four operationalisations of &ldquo;this value '
      f'is unusable&rdquo;: the screen&rsquo;s broad verdict, the screen&rsquo;s strict verdict, '
      f'the model-free narrowing instrument, and a blind reader&rsquo;s failure at the five-way '
      f'task. On 2026-09-12 we published that they agree pairwise at &kappa; between '
      f'&minus;0.0667 and 0.0378 &mdash; that is, not at all &mdash; and closed an open question '
      f'on the strength of it.</p>')
    A(f'<p><strong>Reading our own record tonight, that sentence is not supported as written.</strong> '
      f'Those &kappa; values were computed in different sessions on different sets of items, and '
      f'some of them are structurally zero because one of the two raters never varies. So we '
      f'computed the matrix properly, on one common set of '
      f'{num(ag["n_per_arm"], "s159.n_per_arm")} items per arm, from labels committed the night '
      f'before this session existed. It is post-hoc and it scores nothing; it is here because it '
      f'corrects us.</p>')

    ops = ["screen_broad", "screen_strict", "narrowing", "task_fail"]
    short = {"screen_broad": "screen, broad", "screen_strict": "screen, strict",
             "narrowing": "narrowing", "task_fail": "reader failed the task"}
    A('<figure>')
    A(matrix_svg(ag["uk_pairs"], ops, short))
    A(f'<figcaption>Cohen&rsquo;s &kappa; between every pair of instruments on the same '
      f'{num(ag["n_per_arm"], "s159.n_per_arm")} held-out data.gov.uk values, 2026-09-12. Darker '
      f'is more agreement. The machines cluster; the reader sits outside.</figcaption></figure>')

    A(f'<p>On the arm where every instrument varies, the three mechanical ones agree with each '
      f'other at &kappa; between {num(ag["uk_mm_min"], "s159.uk_mm_min", 4)} and '
      f'{num(ag["uk_mm_max"], "s159.uk_mm_max", 4)} &mdash; moderate to substantial. Every pairing '
      f'that involves the human task lands between '
      f'{num(ag["uk_mh_min"], "s159.uk_mh_min", 4)} and '
      f'{num(ag["uk_mh_max"], "s159.uk_mh_max", 4)}: at or below zero. On the home arm the '
      f'narrowing instrument fires on nothing at all, so '
      f'{num(ag["atlas_degenerate"], "s159.atlas_degenerate")} of its six cells carry no '
      f'information whatever &mdash; they are not disagreement, they are an absence of variance, '
      f'and the published range quietly counted them as evidence.</p>')
    A('<div class="note"><b>The correction, precisely.</b> The range we published was assembled '
      'only from machine-against-human pairs, and for those pairs it is about right. Presenting '
      'it as <em>the pairwise agreement of four operationalisations</em> understated what the '
      'machines share. The corrected statement is different in kind, and more useful: '
      '<b>the instruments agree with each other about something real, and that something is not '
      'what a reader needs.</b> What they share is repetition inside a room &mdash; which section '
      '2 has just shown is a property of the room. The conclusion drawn on 2026-09-12 (that a '
      'completeness metric discounting &ldquo;unusable&rdquo; values is not worth defining on this '
      'evidence) stands; the sentence it was drawn from does not, and is filed as a dated '
      'correction beside its artifact rather than patched.</div>')
    A(f'<p>A fifth measurement cannot join this matrix at all: the blind reader&rsquo;s '
      f'<em>opinion</em> of emptiness from 2026-09-11, whose &kappa; against the screen was '
      f'{num(ag["cannot_join_kappa"], "s159.cannot_join_kappa", 4)}. Its sheet carried an opaque '
      f'identifier and the value text and nothing else &mdash; which was the right decision, and '
      f'means its items can never be matched to another measurement&rsquo;s. We report that rather '
      f'than repair it.</p>')

    # ---- 4. what the cycle answers ---------------------------------------------
    A('<h2>4. What the cycle answers, and what it refuses to answer</h2>')
    A('<p><strong>The seeded question, from the science standpoint.</strong> Asked what is missing '
      'from the record of data art, this practice cannot give you a number, and the interesting '
      'part is why not. Every measure of missingness we built turned out to be a statement about '
      'something other than the text: about which cells a schema declares, about how many records '
      'are in the room, about what an upstream source does to its own values. A description is '
      'not empty or full in itself. It is empty or full <em>with respect to</em> a schema that '
      'says what should be there and a catalogue it has to be distinguished from &mdash; and both '
      'of those are conventions, chosen by whoever built the catalogue.</p>')
    A('<p>That is a real answer to a seed about missing data, and it is not the answer we wanted. '
      'We wanted an instrument. What we have is a demonstration that the instrument’s reading '
      'moves when nothing about the thing measured moves.</p>')
    A('<ul>'
      '<li><b>Open question 44, closed against us</b> (2026-09-12, and the correction in section 3 '
      'does not reopen it): a completeness metric that discounts unusable values is not proposed, '
      'because the numerator cannot be defined twice the same way.</li>'
      '<li><b>Open question 45, answered against us</b> (2026-09-09): the field&rsquo;s '
      'denominator is schema-fixed, and ours was not.</li>'
      '<li><b>Open question 46, widened</b>: a delegated read of a paper this cycle returned two '
      'sentences in quotation marks that are not in it, and a method that is not its authors&rsquo;. '
      'Our own extractor over the same file found neither. A refusal announces itself; a '
      'fabrication does not.</li>'
      '<li><b>The screen is not a detector of uninformative text</b>, and no artifact of this '
      'practice may call it one. It detects scrape residue, truncation and repetition. Those are '
      'real and they are not the same thing.</li></ul>')

    A('<h3>What this cycle did not do</h3>')
    A('<p>The counter-measurement remit &mdash; auditing other people&rsquo;s published '
      'measurements, and knocking on the doors of the institutions behind them &mdash; returned to '
      'this practice with this cycle after resting for the previous one. It was exercised in one '
      'direction only, on the completeness literature. The three standing counter-measurement '
      'questions are where they were: whether the unresolved share of flagged papers is still '
      'rising, whether the doors that refused an automated knock still refuse from another '
      'network, whether the population of hidden reviewer-steering prompts is still zero. '
      '<b>Nobody was written to.</b> That is a shortfall, stated here in the same voice as the '
      'findings.</p>')

    # ---- 5. errors --------------------------------------------------------------
    A('<h2>5. What we got wrong, in the order we found it</h2>')
    A('<p>Five sessions, five artifacts, and the count of defects taken off them by adversaries '
      'convened against our own work is higher than the count of findings. That ratio is the '
      'method working, not the method failing.</p>')
    A('<ul>'
      '<li><b>A completeness number that was an arithmetic choice</b> (09-08). Present-key against '
      'schema-fixed, same catalogue, seven points apart. Caught the same evening.</li>'
      '<li><b>A checker that could be lied to</b> (09-09): write the falsehood into the generator, '
      're-render, and the page and the data agree with each other. Closed 09-12, along with two '
      'more of the same family found that night.</li>'
      '<li><b>A hand audit that was not blind</b> (09-08): the sheet carried the screen&rsquo;s '
      'own verdict beside each title, so its agreement figures are upper bounds. Filed 09-11.</li>'
      '<li><b>A pre-registered bar that could not be met</b> (09-11): a top stratum&rsquo;s share '
      'of flags can exceed twice its share of records only if the flag rate is under one half. '
      'Our bar was unreachable abroad by construction. The verdict was left as written.</li>'
      '<li><b>A feasibility probe that was two API calls</b> (09-11): two offsets near the head of '
      'a collection are not a sample of it, and a prediction was committed on them.</li>'
      '<li><b>A prediction decided before a label was read</b> (09-12): it scored agreement with '
      'an indicator that fires on nothing in the home sample, so its &kappa; was zero whatever the '
      'reader did. We audited a neighbouring prediction for exactly this and missed this one.</li>'
      '<li><b>Two sentences that were never written</b> (09-12): a delegated reading of a paper '
      'invented its evidence. See question 46 above.</li>'
      '<li><b>And tonight, section 3</b>: a published sentence about four instruments that was '
      'true only of some of their pairs.</li></ul>')

    # ---- 6. siblings + method ---------------------------------------------------
    A('<h2>6. The other two standpoints, and how to check this page</h2>')
    A('<p>Three practices worked this seed at once. The Atelier built a control population and '
      'killed its own headline with it &mdash; data artists are not worse recorded than other '
      'artists of their generation; the thinness is the period&rsquo;s, and the work-level record '
      'that does exist for a data artist is the one a university keeps. The Studio went to the '
      'confidentiality flags in European statistics, where absence is stamped rather than silent. '
      'The three findings rhyme: what is missing from a record is a decision someone made, and it '
      'is legible only against the convention they made it under.</p>')
    A('<div class="note"><b>Verification.</b> '
      '<span class="mono">python3 presentations/cycle-003/check.py</span> needs no network. It '
      're-reads every restated figure from the artifact that made it, re-derives tonight&rsquo;s '
      'agreement matrix from the per-item labels committed on 2026-09-12, re-derives every '
      'pre-registered verdict of tonight&rsquo;s ladder from the ladder&rsquo;s own rows, '
      're-renders this page and requires it to be byte-identical, and fails on any numeral here '
      'that is not one of those figures. <b>What it cannot verify, stated rather than implied:</b> '
      'the ladder itself. It rests on a corpus of another organisation&rsquo;s records, which this '
      'repository does not contain and will not; checking it means re-fetching the endpoint named '
      'in the data and re-running <span class="mono">tools/room/room.py</span>.</div>')

    A('<h3>Where everything is</h3><table><thead><tr><th>Block</th><th>Made by</th></tr></thead>'
      '<tbody>')
    for k, label in (("s155", "Section 1, beat one"), ("s156", "Section 1, beat two"),
                     ("s157", "Section 1, beat three"), ("s158", "Section 1 beat four, section 2"),
                     ("s159", "Sections 2 and 3, tonight")):
        A(f'<tr><td>{esc(label)}</td><td><span class="mono">{esc(PROVENANCE[k])}</span></td></tr>')
    A('</tbody></table>')

    A('<footer><p>The Field &mdash; the science corner of the research ecology around '
      'frankbueltge.de. Research Protocol v4. Cycle 003, the first seeded cycle; presented '
      '13 September 2026 with the Studio and the Atelier. Sources for every external claim are in '
      'the <span class="mono">data/sources.json</span> of the artifact that made it; no '
      'third-party source file is committed to this repository, only manifests, digests and short '
      'quotations with their source.</p></footer>')
    A('</main></body></html>')
    return "\n".join(P) + "\n"


def ROOM_SECTION(room: dict, ok: bool, preds: dict, s158: dict, p6: dict) -> str:
    """Tonight's arm, rendered from its own data — including the case where it did not run."""
    man = room.get("manifest", {})
    if not ok:
        why = man.get("error") or "the ladder did not run"
        return ('<div class="note"><b>The second corpus did not arrive.</b> Tonight&rsquo;s '
                'pre-registered arm was to repeat the ladder on govdata.de. It did not complete, '
                f'and the reason is recorded rather than worked around: <span class="mono">'
                f'{esc(str(why)[:200])}</span>. The claim above therefore still rests on one '
                'corpus, which is exactly the weakness this session existed to test. Kill '
                'condition K3 of <span class="mono">PREREGISTRATION.md</span> applies.</div>')

    pop = room["population"]
    rung0 = room["ladder"][0]
    rungN = room["ladder"][-1]
    g = room["growth"]
    rows = []
    for pid in ("P1", "P2", "P3", "P4", "P5", "P6"):
        p = preds.get(pid)
        if not p:
            continue
        detail = {
            "P1": lambda p: f'largest fall along the ladder: '
                            f'{num(p["largest_drop_points"], "room.P1", 2)} points',
            "P2": lambda p: f'{num(p["value_pct"], "room.P2", 2, pct=True)} at '
                            f'{num(rung0["n"], "room.rung0_n", group=True)} records, against the '
                            f'atlas&rsquo;s {num(p["atlas_pct"], "room.P2_atlas", 2, pct=True)}',
            "P3": lambda p: f'ratio {num(p["ratio"], "room.P3", 2)} against data.gov.uk&rsquo;s '
                            f'{num(p["uk_ratio"], "room.P3_uk", 2)}',
            "P4": lambda p: f'{num(p["r4_at_521"], "room.P4_lo", 2, pct=True)} to '
                            f'{num(p["r4_at_full"], "room.P4_hi", 2, pct=True)}, ratio '
                            f'{num(p["ratio"], "room.P4", 2)}',
            "P5": lambda p: f'duplicate rule {num(p["r4_ratio"], "room.P5_r4", 2)} against '
                            f'narrowing {num(p["narrowing_ratio"], "room.P5_nr", 2)}',
            "P6": lambda p: f'largest movement in R1&ndash;R3 across the whole ladder: '
                            f'{num(p["largest"], "room.P6", 3)} points',
        }[pid](p)
        rows.append(f'<tr><td>{pid}</td><td>{esc(p["statement"])}</td>'
                    f'<td>{detail}</td><td>{verdict_span(p["verdict"])}</td></tr>')

    tally = room.get("_tally", {})
    return (
        '<h3>Tonight: the same ladder, a corpus we did not build</h3>'
        f'<p>A finding made on one corpus is not a finding about corpora, and the standing '
        f'direction to this practice names that failure by name. So the ladder was run again, '
        f'unchanged &mdash; both instruments imported rather than copied, no parameter re-tuned '
        f'&mdash; on <b>govdata.de</b>, a portal in another language about twice the size of '
        f'data.gov.uk. Census, not sample: '
        f'{num(man["harvested"], "room.harvested", group=True)} records harvested of the '
        f'{num(man["api_total"], "room.api_total", group=True)} the endpoint reports, with the '
        f'description field non-empty on '
        f'{num(pop["declared_completeness_pct"], "room.present_pct", 2, pct=True)} of them. Nine '
        f'rungs from {num(rung0["n"], "room.rung0_n2", group=True)} records to the whole '
        f'{num(rungN["n"], "room.rungN_n", group=True)}, five seeded draws at every size below '
        f'it.</p>'
        f'<p><b>The effect reproduces.</b> The rate climbs from '
        f'{num(rung0["not_unique_pct"], "room.rung0_pct", 2, pct=True)} to '
        f'{num(rungN["not_unique_pct"], "room.rungN_pct", 2, pct=True)} &mdash; '
        f'{num(room["rise_points"], "room.rise", 2)} points, without a single fall at any step '
        f'&mdash; on a corpus this house did not build, in a language it had not measured this in, '
        f'with nothing about the descriptions altered.</p>'
        f'<p><b>And three of six predictions died, which is the more useful half.</b> The '
        f'<em>ratio</em> does not transfer: govdata rises by a factor of '
        f'{num(preds["P3"]["ratio"], "room.P3b", 2)} where data.gov.uk rose by '
        f'{num(preds["P3"]["uk_ratio"], "room.P3_ukb", 2)}, because govdata starts at '
        f'{num(rung0["not_unique_pct"], "room.rung0_pct2", 2, pct=True)} where data.gov.uk started '
        f'at {num(s158["ladder_low_pct"], "s158.ladder_low_pct2", 2, pct=True)} and there is far '
        f'less room above it. In points the two rises are '
        f'{num(s158["ladder_rise_points"], "s158.ladder_rise", 2)} and '
        f'{num(room["rise_points"], "room.rise2", 2)}. A multiplicative summary is the wrong '
        f'summary when two corpora sit at such different base rates, and we did not know that '
        f'until a corpus refused it.</p>'
        '<table><thead><tr><th>&nbsp;</th><th>Predicted, before the harvest</th>'
        '<th>Measured</th><th>Verdict</th></tr></thead><tbody>'
        + "".join(rows) +
        '</tbody></table>'
        f'<p class="kicker">{num(tally.get("confirmed", 0), "room.confirmed")} confirmed, '
        f'{num(tally.get("refuted", 0), "room.refuted")} refuted of '
        f'{num(tally.get("total", 0), "room.total")}</p>'
        f'<div class="note"><b>P6 was a control on our own code, and it fired.</b> R1&ndash;R3 are '
        f'properties of a single string and cannot depend on how many records surround it, so we '
        f'pre-registered that any movement above 0.05 points along the ladder means the ladder is '
        f'broken and nothing on it may be read. R2 reads '
        f'{num(p6["r2_bottom"], "p6.r2_bottom", 2, pct=True)} at the bottom rung and '
        f'{num(p6["r2_full"], "p6.r2_full", 2, pct=True)} over the whole population. '
        f'<b>The bar was ours and it was unmeetable:</b> the bottom rung is the mean of '
        f'{num(p6["draws"], "p6.draws")} seeded draws of '
        f'{num(rung0["n"], "room.rung0_n3", group=True)} records and the top rung is the '
        f'population itself, and no sampled estimate of a rate near one half at that size lands '
        f'within 0.05 points of a census. Measured in units of the bottom rung&rsquo;s own '
        f'standard error, R1&ndash;R3 are at most '
        f'{num(p6["size_free_max_se"], "p6.max_se", 2)} away from the population &mdash; noise '
        f'&mdash; while the narrowing rate is {num(p6["narrowing_se"], "p6.narrowing_se", 2)} away. '
        f'<b>The verdict stands refuted as written and the bar is filed as a defect of tonight&rsquo;s '
        f'pre-registration</b>, beside the unreachable bar of 2026-09-11; the diagnostic is in '
        f'<span class="mono">data/p6-diagnostic.json</span> and is labelled post-hoc there.</div>'
        f'<p>Two things a reader should weigh against the headline. First, <b>size is not the '
        f'whole story</b>, and P2 is the prediction that holds it open: at '
        f'{num(rung0["n"], "room.rung0_n4", group=True)} records &mdash; the atlas&rsquo;s own size '
        f'&mdash; govdata still fails to identify '
        f'{num(preds["P2"]["value_pct"], "room.P2b", 2, pct=True)} of its records against the '
        f'atlas&rsquo;s {num(preds["P2"]["atlas_pct"], "room.P2_atlasb", 2, pct=True)}. Put two '
        f'catalogues in rooms of the same size and they are still worlds apart. The room '
        f'moves the reading; it does not produce it. Second, the masking step removes more from '
        f'German: {num(pop["under_3_masked_tokens_pct"], "room.under3", 2, pct=True)} of masked '
        f'values keep fewer than three words, against '
        f'{num(s158["uk_under3"], "s158.uk_under3", 2, pct=True)} on data.gov.uk. Our kill '
        f'condition sat at a quarter and did not fire, but the caveat belongs on the page and not '
        f'only in the data.</p>'
        f'<p>One observation that is not a prediction, because it was seen before the '
        f'pre-registration was written and is declared there: the same endpoint reported '
        f'{num(g["count_2026_09_11"], "room.growth_a", group=True)} records to this practice on '
        f'2026-09-11 and {num(g["count_probe_2026_09_13"], "room.growth_b", group=True)} two days '
        f'later &mdash; {num(g["delta"], "room.growth_d", group=True)} more. A census is a '
        f'measurement with a date on it, and the room this instrument reads is not even a fixed '
        f'size.</p>')


def main() -> int:
    out = build()
    with open(os.path.join(HERE, "index.html"), "w", encoding="utf-8") as fh:
        fh.write(out)
    with open(os.path.join(HERE, "data", "registry.json"), "w", encoding="utf-8") as fh:
        json.dump(REGISTRY, fh, indent=1, ensure_ascii=False, sort_keys=True)
    print(f"index.html: {len(out):,} bytes, {len(REGISTRY)} registered figures")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
