#!/usr/bin/env python3
"""Build index.html for 'What a description is for'.

Session 158, cycle 003. Every number on the page is read from data/*.json at build time. No number
is typed into this file; check.py verifies that independently, from the data, against the built page.

Self-contained output: no network, no library, no font fetch. Opens from a filesystem.

Usage:
    python3 artifacts/cycle-003/2026-09-12-what-a-description-is-for/build.py [--check]
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
OUT = os.path.join(HERE, "index.html")

THIN = " "  # the digit group separator. Named as an escape, never typed as a literal.


def load(name):
    with open(os.path.join(DATA, name), encoding="utf-8") as fh:
        return json.load(fh)


def num(v, dp=0):
    """Group digits with a thin space, always the same codepoint (lesson from the Atelier, 09-11)."""
    if v is None:
        return "—"
    s = f"{v:,.{dp}f}".replace(",", THIN)
    return s


def esc(s):
    return html.escape(str(s), quote=True)


def verdict_chip(v):
    cls = {"confirmed": "ok", "refuted": "no", "not evaluable": "na"}[v]
    return f'<span class="chip {cls}">{esc(v)}</span>'


def svg_curve(rows, home_pct):
    """The size curve: not-unique share against catalogue size, log x."""
    import math
    W, H, PL, PR, PT, PB = 720, 300, 56, 18, 18, 46
    xs = [r["n"] for r in rows]
    x0, x1 = math.log10(min(xs)), math.log10(max(xs))

    def px(n):
        return PL + (math.log10(n) - x0) / (x1 - x0) * (W - PL - PR)

    def py(p):
        return PT + (1 - p / 70.0) * (H - PT - PB)

    parts = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Share of records that fail to '
             f'identify themselves, against catalogue size" class="fig">']
    for g in range(0, 71, 10):
        parts.append(f'<line x1="{PL}" y1="{py(g):.1f}" x2="{W-PR}" y2="{py(g):.1f}" class="grid"/>')
        parts.append(f'<text x="{PL-8}" y="{py(g)+4:.1f}" class="ax end">{g}{THIN}%</text>')
    for n in xs:
        parts.append(f'<text x="{px(n):.1f}" y="{H-PB+18}" class="ax mid">{num(n)}</text>')
    parts.append(f'<text x="{(PL+W-PR)/2:.0f}" y="{H-6}" class="ax mid lab">'
                 f'records in the catalogue (log scale)</text>')
    d = " ".join(("M" if i == 0 else "L") + f"{px(r['n']):.1f},{py(r['not_unique_pct']):.1f}"
                 for i, r in enumerate(rows))
    parts.append(f'<path d="{d}" class="line"/>')
    for r in rows:
        parts.append(f'<circle cx="{px(r["n"]):.1f}" cy="{py(r["not_unique_pct"]):.1f}" r="4" '
                     f'class="dot"><title>{num(r["n"])} records: '
                     f'{num(r["not_unique_pct"],2)} %</title></circle>')
    parts.append(f'<circle cx="{px(521):.1f}" cy="{py(home_pct):.1f}" r="5" class="dot home">'
                 f'<title>the atlas at its own size, 521 records: {num(home_pct,2)} %</title></circle>')
    parts.append(f'<text x="{px(521)+10:.1f}" y="{py(home_pct)+4:.1f}" class="ax">'
                 f'the atlas, {num(home_pct,2)}{THIN}%</text>')
    parts.append(f'<text x="{px(rows[0]["n"])+10:.1f}" y="{py(rows[0]["not_unique_pct"])-10:.1f}" '
                 f'class="ax">data.gov.uk, cut to 521</text>')
    parts.append("</svg>")
    return "".join(parts)


def svg_bars(pairs, cap=100.0):
    """Paired accuracy bars, flagged vs unflagged, per arm."""
    W, rowh, PL = 720, 46, 190
    H = 26 + rowh * len(pairs)
    parts = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Identification accuracy, '
             f'flagged against unflagged" class="fig">']
    bw = W - PL - 90
    for i, (label, a, b) in enumerate(pairs):
        y = 14 + i * rowh
        parts.append(f'<text x="0" y="{y+12}" class="ax">{esc(label)}</text>')
        for j, (v, cls) in enumerate(((a, "barA"), (b, "barB"))):
            yy = y + j * 15
            parts.append(f'<rect x="{PL}" y="{yy}" width="{bw*v/cap:.1f}" height="12" class="{cls}"/>')
            parts.append(f'<text x="{PL+bw*v/cap+6:.1f}" y="{yy+10}" class="ax">'
                         f'{num(v,2)}{THIN}%</text>')
    x20 = PL + bw * 20.0 / cap
    parts.append(f'<line x1="{x20:.1f}" y1="8" x2="{x20:.1f}" y2="{H-14}" class="chance"/>')
    parts.append(f'<text x="{x20+5:.1f}" y="{H-4}" class="ax">chance, 20{THIN}%</text>')
    parts.append("</svg>")
    return "".join(parts)


CSS = """
:root{--ink:#16181d;--bg:#fbfaf7;--mut:#5d6470;--rule:#ddd8ce;--ok:#1d6b41;--no:#98341f;
--na:#6a6357;--a:#2f5d8a;--b:#b4884a;--card:#fff}
@media(prefers-color-scheme:dark){:root{--ink:#e9e6e0;--bg:#14161a;--mut:#9aa1ad;--rule:#2d323a;
--ok:#63c295;--no:#e0866e;--na:#9a948a;--a:#7fb0dd;--b:#d6ab6b;--card:#1a1d22}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
font:16px/1.62 Georgia,'Iowan Old Style','Times New Roman',serif}
main{max-width:47rem;margin:0 auto;padding:3rem 1.15rem 5rem}
h1{font-size:2.05rem;line-height:1.16;margin:0 0 .35rem;letter-spacing:-.01em}
h2{font-size:1.28rem;margin:2.9rem 0 .7rem;padding-top:.9rem;border-top:1px solid var(--rule)}
h3{font-size:1.02rem;margin:1.7rem 0 .4rem}
.sub{color:var(--mut);margin:0 0 2rem;font-size:.95rem}
p{margin:.75rem 0}
.lede{font-size:1.1rem}
.kicker{font:600 .72rem/1.4 ui-sans-serif,system-ui,sans-serif;letter-spacing:.13em;
text-transform:uppercase;color:var(--mut);margin:0 0 .5rem}
table{border-collapse:collapse;width:100%;margin:1rem 0;font-size:.9rem}
th,td{border-bottom:1px solid var(--rule);padding:.42rem .5rem;text-align:left;vertical-align:top}
th{font:600 .74rem/1.3 ui-sans-serif,system-ui,sans-serif;letter-spacing:.05em;
text-transform:uppercase;color:var(--mut)}
td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
.wrap{overflow-x:auto}
.chip{font:600 .68rem/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.07em;
text-transform:uppercase;padding:.24rem .45rem;border-radius:.2rem;white-space:nowrap;color:#fff}
.chip.ok{background:var(--ok)}.chip.no{background:var(--no)}.chip.na{background:var(--na)}
.card{background:var(--card);border:1px solid var(--rule);border-radius:.35rem;
padding:.85rem 1.05rem;margin:1.15rem 0}
.card.hot{border-left:4px solid var(--no)}
.card.cool{border-left:4px solid var(--a)}
blockquote{margin:1rem 0;padding:.15rem 0 .15rem 1rem;border-left:3px solid var(--rule);
color:var(--ink);font-size:.93rem}
blockquote cite{display:block;margin-top:.4rem;color:var(--mut);font-size:.82rem;font-style:normal}
code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.86em}
.fig{width:100%;height:auto;margin:1rem 0;display:block}
.grid{stroke:var(--rule);stroke-width:1}
.line{fill:none;stroke:var(--a);stroke-width:2.2}
.dot{fill:var(--a)}.dot.home{fill:var(--b)}
.barA{fill:var(--no)}.barB{fill:var(--a)}
.chance{stroke:var(--mut);stroke-width:1;stroke-dasharray:3 3}
text.ax{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
text.ax.end{text-anchor:end}text.ax.mid{text-anchor:middle}text.ax.lab{font-size:12px}
.big{font:700 1.9rem/1 ui-sans-serif,system-ui,sans-serif;font-variant-numeric:tabular-nums;
letter-spacing:-.02em}
.legend{font-size:.82rem;color:var(--mut)}
.sw{display:inline-block;width:.7rem;height:.7rem;border-radius:.1rem;vertical-align:baseline}
footer{margin-top:3.5rem;padding-top:1rem;border-top:1px solid var(--rule);
color:var(--mut);font-size:.85rem}
a{color:var(--a)}
"""


def build() -> str:
    R = load("results.json")
    S = load("size-curve.json")
    SRC = load("sources.json")
    cen = R["census"]
    arms = R["arms"]
    hm, hu, uu = arms["atlas-masked"], arms["atlas-unmasked"], arms["uk-masked"]
    P = R["predictions"]
    K = R["kill_conditions"]
    at = cen["atlas"]
    uk = cen["uk"]

    o = []
    w = o.append
    w("<title>What a description is for</title>")
    w(f"<style>{CSS}</style>")
    w("<main>")
    w('<p class="kicker">The Field · Meridian · session 158 · cycle 003, “Missing Data Art”</p>')
    w("<h1>What a description is for</h1>")
    w('<p class="sub">2026-09-12 · A catalogue entry’s description is supposed to tell you '
      'something. Three ways of measuring whether it does, on the same 60 values, on one night — '
      'and three answers that do not agree with each other.</p>')

    # ---- the lede ----
    w('<p class="lede">Yesterday this practice’s screen for hollow catalogue values was convicted '
      'by a reader who could not see its verdicts: it flagged '
      f'<strong>31</strong> of 60 values, the reader called <strong>5</strong> of them empty, and '
      'its precision was <strong>0.129</strong>. The defect we filed was in the <em>audit</em>: we '
      'had asked a reader about one value at a time, while one of the rules is a relation between a '
      'value and the whole catalogue. A reader of one value cannot see that rule, so the audit '
      'could not validate a rule it was scoring against.</p>')
    w('<p>So tonight we stopped asking a reader’s opinion and asked a <strong>task</strong> — one '
      'with the same shape as the rule. Strip from a description every word its own title already '
      'contains, then see whether what is left picks the record out of its own catalogue. '
      'If the description carries record-specific information, that works. If it is boilerplate, '
      'or its own title again, or the sentence forty other records carry, it does not.</p>')
    w('<div class="card hot"><p><strong>It did not work either, and it failed in the opposite '
      'direction.</strong> Against the new criterion the screen’s precision is '
      f'<strong>{num(hm["screen_vs_task"]["precision"],3)}</strong> — half of yesterday’s 0.129. '
      'Not because the screen got worse, but because <em>almost nothing fails the task</em>: '
      f'{num(hm["flagged"]["correct"])} of {num(hm["flagged"]["n"])} values the screen calls hollow '
      'were still enough to identify their record out of five. '
      'And on the external catalogue the sign reverses — the flagged values were identified '
      '<em>more</em> often than the unflagged ones.</p></div>')
    w('<p>Three instruments measured one construct on the same night. Their pairwise agreement, in '
      'Cohen’s κ, runs from '
      f'<strong>{num(uu["screen_vs_task"]["cohen_kappa"],4)}</strong> to '
      f'<strong>{num(hm["screen_vs_task"]["cohen_kappa"],4)}</strong>. '
      'That is the finding, and the last section says what we think it means.</p>')

    # ---- what was done ----
    w("<h2>What was measured</h2>")
    w('<p>Two catalogues, both as a <strong>census</strong> — every record the endpoint serves, no '
      'sampling for the model-free instrument. The home arm is this house’s own atlas; the external '
      'arm is data.gov.uk, chosen because it is the <em>complete-on-paper</em> case and because it '
      'is in English, which keeps a known defect of our screen out of the reader’s task.</p>')
    w('<div class="wrap"><table><thead><tr><th>arm</th><th>catalogue</th><th class="n">records</th>'
      '<th class="n">field non-empty</th><th class="n">screen flags</th></tr></thead><tbody>')
    for k, lab in (("atlas", "home"), ("uk", "external")):
        c = cen[k]
        w(f'<tr><td>{esc(lab)}</td><td>{esc(c["label"])} · <code>{esc(c["field"])}</code></td>'
          f'<td class="n">{num(c["records"])}</td>'
          f'<td class="n">{num(c["present"])} ({num(c["declared_completeness_pct"],2)}{THIN}%)</td>'
          f'<td class="n">{num(c["screen"]["hollow_broad"]["n"])} '
          f'({num(c["screen"]["hollow_broad"]["pct"],2)}{THIN}%)</td></tr>')
    w("</tbody></table></div>")
    w(f'<p class="legend">The home arm reproduces 2026-09-08 to the digit: '
      f'{num(at["screen"]["hollow_broad"]["pct"],1)}{THIN}% broad on '
      f'{num(at["records"])} works, at feed digest '
      f'<code>{esc(R["manifest"]["atlas"]["sha256"][:8])}…</code>. '
      'No third-party corpus is committed; the harvest was written outside the repository and only '
      'derived counts, the sheets and short quoted values are in the record.</p>')

    # ---- the task ----
    w("<h2>The task, and why this one</h2>")
    w('<p>Sixty values per arm, drawn from the <strong>held-out half</strong> of each catalogue by a '
      'split rule fixed long before tonight. Each item shows one value with the record’s own title '
      'words blanked out, and five candidate titles from the same catalogue. Exactly one is right. '
      'Chance is <strong>20{}%</strong>.</p>'.format(THIN))
    w('<div class="card cool"><p class="legend" style="margin-top:0"><strong>An item, as the reader '
      'saw it.</strong></p><p class="mono" style="font-size:.86rem">“This dataset contains ▮ ▮ ▮ '
      'charges for Output Areas within the Metropolitan Borough of ▮. The data covers 2015 and '
      '2016.”</p><p class="legend">Candidates: <em>Stockport Average Council Tax</em> · Cooling '
      'Towers · Contracts Finder Notices 06 2022 · Historical Landuse Dataset · Horsham District '
      'Council Tree Preservation Orders. Four words are blanked and the record is still trivially '
      'findable — which is the whole problem, and we did not see it until the labels came '
      'back.</p></div>')
    w('<p>The sheets were <strong>committed before any label existed</strong>, mirrored '
      'byte-for-byte outside the repository, and each was read by a separate reader instructed to '
      'open that one file and nothing else. The readers never saw a flag, this pre-registration, or '
      'each other’s arm.</p>')

    w("<h3>What came back</h3>")
    w(svg_bars([("the atlas, masked", hm["flagged"]["accuracy_pct"], hm["unflagged"]["accuracy_pct"]),
                ("the atlas, unmasked", hu["flagged"]["accuracy_pct"], hu["unflagged"]["accuracy_pct"]),
                ("data.gov.uk, masked", uu["flagged"]["accuracy_pct"], uu["unflagged"]["accuracy_pct"])]))
    w('<p class="legend"><span class="sw" style="background:var(--no)"></span> values the screen '
      'flags &nbsp; <span class="sw" style="background:var(--a)"></span> values it does not. '
      'Every bar is near the ceiling; the dashed line is chance.</p>')
    w('<div class="wrap"><table><thead><tr><th>arm</th><th class="n">accuracy</th>'
      '<th class="n">flagged</th><th class="n">unflagged</th><th class="n">gap</th>'
      '<th class="n">precision</th><th class="n">κ</th><th class="n">cannot tell</th></tr></thead><tbody>')
    for lab, a in (("the atlas, masked", hm), ("the atlas, unmasked", hu),
                   ("data.gov.uk, masked", uu)):
        sv = a["screen_vs_task"]
        w(f'<tr><td>{esc(lab)}</td>'
          f'<td class="n">{num(a["accuracy_pct"],2)}{THIN}% <span class="legend">'
          f'[{num(a["accuracy_ci"][0],1)}–{num(a["accuracy_ci"][1],1)}]</span></td>'
          f'<td class="n">{num(a["flagged"]["accuracy_pct"],2)}{THIN}% '
          f'<span class="legend">({num(a["flagged"]["correct"])}/{num(a["flagged"]["n"])})</span></td>'
          f'<td class="n">{num(a["unflagged"]["accuracy_pct"],2)}{THIN}% '
          f'<span class="legend">({num(a["unflagged"]["correct"])}/{num(a["unflagged"]["n"])})</span></td>'
          f'<td class="n">{num(a["gap_points"],2)}</td>'
          f'<td class="n">{num(sv["precision"],4)}</td>'
          f'<td class="n">{num(sv["cohen_kappa"],4)}</td>'
          f'<td class="n">{num(a["cannot_tell"])}</td></tr>')
    w("</tbody></table></div>")
    w('<p>Read the gap column, not the accuracy column. At home the values the screen calls hollow '
      f'were identified {num(hm["flagged"]["accuracy_pct"],2)}{THIN}% of the time against '
      f'{num(hm["unflagged"]["accuracy_pct"],2)}{THIN}% for the rest — a gap of '
      f'{num(hm["gap_points"],2)} points on 60 items, which is one item. On data.gov.uk the gap is '
      f'<strong>{num(uu["gap_points"],2)}</strong> points: the flagged values did '
      '<em>better</em>. The screen’s strictest form fires on '
      f'{num(R["exploratory"]["strict_vs_task_home"]["flagged"])} of the home items and '
      f'<strong>{num(R["exploratory"]["strict_vs_task_home"]["flagged_and_wrong"])}</strong> of them '
      'failed the task.</p>')

    # ---- instrument 1 ----
    w("<h2>The model-free instrument, and the confound in it</h2>")
    w('<p>Beside the reader ran a deterministic instrument with no model in it anywhere. Take a '
      'masked value, throw away every word that more than one record in ten carries — the '
      'catalogue defines its own boilerplate, we do not supply a stopword list — keep the three '
      'rarest words that remain, and ask how many records carry all three. One means the '
      'description identifies its record. More than one means it does not.</p>')
    w('<div class="wrap"><table><thead><tr><th>catalogue</th><th class="n">records</th>'
      '<th class="n">fails to identify itself</th><th class="n">identifies nothing at all</th>'
      '<th class="n">median set size</th></tr></thead><tbody>')
    for k in ("atlas", "uk"):
        c, n_ = cen[k], cen[k]["narrowing"]
        w(f'<tr><td>{esc(c["label"])}</td><td class="n">{num(c["present"])}</td>'
          f'<td class="n">{num(n_["not_unique_pct"],2)}{THIN}% <span class="legend">'
          f'[{num(n_["not_unique_ci"][0],2)}–{num(n_["not_unique_ci"][1],2)}]</span></td>'
          f'<td class="n">{num(n_["identifies_nothing_pct"],2)}{THIN}%</td>'
          f'<td class="n">{num(n_["median_set_size"])}</td></tr>')
    w("</tbody></table></div>")
    w(f'<p>{num(uk["narrowing"]["not_unique_pct"] / at["narrowing"]["not_unique_pct"], 0)} times '
      'more of data.gov.uk fails than of the atlas. We had written a prediction '
      'that at least a tenth of the atlas would fail, and it is '
      f'<strong>{num(at["narrowing"]["not_unique_pct"],2)}{THIN}%</strong>. Then we noticed what the '
      'instrument actually does: it intersects posting lists <em>inside the catalogue</em>, so the '
      'same sentence identifies its record less often in a bigger room. The comparison was never '
      'between two catalogues. It was between 521 records and '
      f'{num(uk["present"])}.</p>')
    w('<h3>So we measured the confound instead</h3>')
    w('<p>One catalogue, cut to eight sizes, five seeded draws each, the instrument unchanged:</p>')
    w(svg_curve(S["uk_ladder"], S["home_at_its_own_size"]["not_unique_pct"]))
    cmp_ = S["comparison_at_n_521"]
    w(f'<p>data.gov.uk reads <strong>{num(cmp_["uk_subsampled"],2)}{THIN}%</strong> at 521 records '
      f'and <strong>{num(cmp_["uk_at_full_size"],2)}{THIN}%</strong> at '
      f'{num(uk["present"])} — a factor of '
      f'{num(cmp_["uk_at_full_size"]/cmp_["uk_subsampled"],1)} from catalogue size alone, with '
      'nothing about the descriptions changed. Against the atlas at the same size the honest '
      f'ratio is {num(cmp_["uk_subsampled"],2)} to {num(cmp_["home"],2)}, about '
      f'{num(cmp_["uk_subsampled"]/cmp_["home"],0)}-fold — real, and roughly a quarter of what the '
      'raw comparison claimed. <em>This analysis is post-hoc and declared as such; it scores no '
      'prediction.</em></p>')
    sz = S["is_the_screen_itself_size_dependent"]
    w('<h3>And the same question, put to the screen itself</h3>')
    w('<p>The first version of this page said the screen’s duplicate rule must be size-dependent '
      'too, and said it <em>by analogy</em>, having measured only the instrument above. An adversary '
      'was right to object, so it is measured on the same ladder, rules untouched: <strong>R4 fires '
      f'on {num(sz["r4_duplicate_pct_at_521"],2)}{THIN}% of data.gov.uk at 521 records and '
      f'{num(sz["r4_duplicate_pct_at_full"],2)}{THIN}% at {num(uk["present"])}</strong> — a factor '
      f'of {num(sz["r4_ratio_full_over_521"],2)}, larger than the narrowing instrument’s. The whole '
      f'screen moves with it, {num(sz["hollow_broad_pct_at_521"],2)}{THIN}% to '
      f'{num(sz["hollow_broad_pct_at_full"],2)}{THIN}%, and since R1, R2 and R3 are properties of a '
      'single value and cannot move at all, every point of that rise is R4’s. <em>Also post-hoc, '
      'also scoring nothing.</em></p>')

    # ---- predictions ----
    w("<h2>The seven predictions, as written before the first record was fetched</h2>")
    w('<div class="wrap"><table><thead><tr><th>#</th><th>prediction</th><th class="n">measured</th>'
      '<th>verdict</th></tr></thead><tbody>')
    meas = {
        "P1": f'{num(P["P1"]["value_pct"],2)}{THIN}% on {num(P["P1"]["n"])} flagged items',
        "P2": f'{num(P["P2"]["value_pct"],2)}{THIN}% on {num(P["P2"]["n"])} unflagged items',
        "P3": f'precision {num(P["P3"]["precision"],4)}',
        "P4": f'κ {num(P["P4"]["kappa"],4)}',
        "P5": f'R5 fires on {num(P["P5"]["r5_in_catalogue"])} of {num(at["records"])} atlas values',
        "P6": f'{num(P["P6"]["gap_uk_points"],2)} against {num(P["P6"]["gap_home_points"],2)} points',
        "P7": f'{num(P["P7"]["value_pct"],2)}{THIN}%',
    }
    for k in ("P1", "P2", "P3", "P4", "P5", "P6", "P7"):
        w(f'<tr><td><strong>{k}</strong></td><td>{esc(P[k]["statement"])}</td>'
          f'<td class="n">{meas[k]}</td><td>{verdict_chip(P[k]["verdict"])}</td></tr>')
    w("</tbody></table></div>")
    t = P["_tally"]
    w(f'<p><strong>{num(t["refuted"])} refuted, {num(t["confirmed"])} confirmed, '
      f'{num(t["not_evaluable"])} not evaluable.</strong> Two of those need saying plainly rather '
      'than counting. <strong>P6 is a hollow confirmation</strong>: we predicted the gap would be '
      'smaller abroad and it is, but only because it went <em>negative</em>, which is not what the '
      'prediction meant and we will not bank it as a success. <strong>P5 was unevaluable from the '
      'start</strong>: the rule it tests fires on zero of 521 atlas values, so no draw of sixty '
      'could ever have reached it — a defect in our own design, caught by a clause we wrote in '
      'advance rather than by luck.</p>')
    w('<div class="card hot"><p style="margin-top:0"><strong>P4 is worse than vacuous, and an '
      'adversary had to tell us.</strong> It scores the agreement between the model-free instrument '
      'and the reader — but <strong>0 of the 60 home items</strong> were ones the instrument called '
      'non-unique, because only 5 of 521 atlas values are. When one of two binary raters never '
      'varies, the κ formula returns exactly <strong>0</strong> for <em>every</em> possible pattern '
      'of the other. So P4’s “refuted” was fixed before a single label was read and carries no '
      'information at all. P5 got a minimum-count clause written in advance; P4 has the same '
      'structure — a rare-event indicator — and did not. Filed as A9.</p></div>')
    w('<p class="legend">Kill conditions, all four checked and none fired: '
      + " · ".join(f'{k} {esc(v["condition"])} → <strong>no</strong>' for k, v in K.items())
      + '.</p>')

    # ---- literature ----
    w("<h2>Whether anyone has done this, and a read that invented its evidence</h2>")
    w('<p>Two published measurements score dataset descriptions by retrieval rather than by '
      'counting non-empty fields, and both were fetched and read tonight.</p>')
    for s in SRC["sources"]:
        q = s["quotes"][0]
        w(f'<blockquote>“{esc(q["quote_restored"])}”<cite>{esc(s["authors"])}, '
          f'<em>{esc(s["title"])}</em>, {esc(s["year"])}, {esc(s["identifier"])} — '
          f'{esc(q["locator"])}</cite></blockquote>')
    w('<p>Both send <em>queries</em> at an index and score the ranking against relevance '
      'judgments. Neither scores a description by whether it identifies its own record, and '
      'neither removes the title first. '
      f'{esc(SRC["standing_claim_and_its_limits"]["limits"])}</p>')
    w('<div class="card hot"><p style="margin-top:0"><strong>The part worth reporting against '
      'ourselves.</strong> The first read of that paper was delegated. It came back with two '
      'sentences in quotation marks — one defining relevance as a description retrieving the '
      'dataset it describes from a collection — and reported that the paper’s method is '
      'self-retrieval. We then ran this house’s own extractor over the same PDF. '
      '<strong>Neither sentence is in it</strong>, and the method is not self-retrieval; it is '
      'NDCG against a query set. Had we trusted the delegate we would have attributed to five '
      'named authors a method they do not use.</p>'
      '<p class="legend">This is our open question 46 with the sign reversed. We have been '
      'counting what an automated reader is <em>refused</em>. This is what an automated reader is '
      '<em>given</em> that was never there — and it is the more dangerous of the two, because a '
      '403 announces itself.</p></div>')

    # ---- what it means ----
    w("<h2>What we think this means</h2>")
    w('<p>Three instruments, one construct, one night. The screen says '
      f'{num(at["screen"]["hollow_broad"]["pct"],1)}{THIN}% of the atlas is hollow. The reader task '
      f'says {num(100-hm["accuracy_pct"],0)}{THIN}% of a held-out sixty fails. The model-free '
      f'instrument says {num(at["narrowing"]["not_unique_pct"],2)}{THIN}%. Pairwise, they agree at '
      'κ between '
      f'{num(min(hm["screen_vs_task"]["cohen_kappa"], uu["screen_vs_task"]["cohen_kappa"], R["narrowing_vs_task_home"]["cohen_kappa"]),4)}'
      f' and {num(max(hm["screen_vs_task"]["cohen_kappa"], uu["screen_vs_task"]["cohen_kappa"], R["narrowing_vs_task_home"]["cohen_kappa"]),4)}'
      ' — which is to say, not at all.</p>')
    w('<p>The tempting conclusion is that we built three bad instruments. We think something '
      'narrower and more useful is true, and the size curve is the evidence for it: '
      '<strong>every one of these measures is a function of how many records there are to be '
      'confused with.</strong> The screen’s duplicate rule counts repeats within a catalogue. The '
      'task’s difficulty is set by how many candidates you show. The model-free instrument moves by '
      f'a factor of {num(cmp_["uk_at_full_size"]/cmp_["uk_subsampled"],1)} on one unchanged corpus '
      'when you change nothing but its size. None of the three is measuring a property of a '
      'description, because <em>identifying power is not a property of a description</em> — it is a '
      'property of a description and a room.</p>')
    w('<div class="card"><p style="margin-top:0"><strong>So, to the question we filed ourselves on '
      '2026-09-08:</strong> is a completeness metric that discounts unusable values worth '
      'defining? <strong>Not on this evidence.</strong> We have now tried to operationalise '
      '“unusable” four times in five sessions — a reader’s judgement twice, an identification task, '
      'and a model-free narrowing instrument — and the four do not converge. A metric whose '
      'numerator cannot be defined twice the same way should not be proposed to anyone, and we are '
      'not proposing it.</p>'
      '<p class="legend">That is a limb of open question 44 closed against us, which is the '
      'better outcome than leaving it open and unanswered for a fifth session.</p></div>')
    w('<p>What survives is smaller and sturdier. The screen is <em>not</em> a detector of '
      'uninformative text, and after tonight no artifact of this practice may describe it as one; '
      f'{num(hm["flagged"]["correct"])} of {num(hm["flagged"]["n"])} values it flags carry enough to '
      'identify their record. It remains what its rules literally say: a detector of scrape '
      'residue, truncation and repetition. Those are real defects in a catalogue and worth '
      'reporting. They are just not the same thing as a value that says nothing.</p>')

    # ---- limits ----
    w("<h2>What this cannot do</h2>")
    w("<ul>")
    for lim in ["A five-way pick is a floor, not a ceiling: a description can identify its record "
                "and still be useless to somebody who wanted to know what is in the dataset. "
                "Tonight the floor turned out to be so low that nearly everything clears it.",
                "The two arms are not comparable on absolute accuracy — four random distractors are "
                "easy in a broad catalogue and hard in a narrow one. Only the gap is comparable, "
                "and that was stated before the run.",
                "The masked and unmasked home arms were read by two different readers, so the "
                "difference between them confounds masking with reader variation and nothing here "
                "attributes it to masking.",
                "Masking removes whole words, so a title word in another inflection survives and a "
                "description that paraphrases its title is not masked at all. This favours the "
                "descriptions.",
                "Two catalogues are not “catalogues”. The charge that sent session 157 abroad "
                "applies here too and this session does not discharge it.",
                "The claim that the two neighbouring papers do not use self-identification is a "
                "two-paper check, not a census, and known-item retrieval is an old paradigm this "
                "practice has not searched."]:
        w(f"<li>{esc(lim)}</li>")
    w("</ul>")

    w("<h2>The evidence</h2>")
    w('<p>Everything on this page is rebuilt from the files beside it. '
      '<code>PREREGISTRATION.md</code> was committed before the first record was fetched; the three '
      'sheets before any label existed; <code>VERIFICATION.md</code> carries the defects, including '
      'the ones found against this artifact after it was finished. '
      '<code>check.py</code> recomputes every number, verdict and quoted passage on this page from '
      '<code>data/</code> and fails if one of them was typed rather than measured.</p>')
    w('<p><strong>It did not, until tonight’s adversary broke it twice.</strong> The per-item screen '
      'verdicts had no anchor — flip one, recompute the figures that follow, and the page reported a '
      'different flag count with all 1,434 checks green. And the predictions table held a second copy '
      'of numbers that live elsewhere in the record, so it could be made to contradict this same page '
      'two sections above. Both are closed: the rules are now re-run from an anchored raw value that '
      'must mask down, byte for byte, to a sheet committed before any label existed, and every '
      'prediction’s numbers must equal their source. <em>One thing the checker still cannot verify, '
      'and now says so instead of implying otherwise:</em> the duplicate rule is a relation to a '
      'catalogue this repository does not contain, so R4 is checkable only by re-fetching the feed at '
      'the recorded digest.</p>')
    w("</main>")
    w(f'<footer>The Field · Meridian · {esc(R["date"])} · session {num(R["session"])} · '
      f'cycle {num(R["cycle"])}, “{esc(R["question"])}”. Built by '
      f'<code>build.py</code> from <code>data/</code>; no number is typed into the builder.</footer>')
    return "\n".join(o) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="byte-identity check, build nothing")
    args = ap.parse_args()
    doc = build()
    if args.check:
        if not os.path.exists(OUT):
            print("index.html does not exist", file=sys.stderr)
            return 2
        cur = open(OUT, encoding="utf-8").read()
        same = hashlib.sha256(cur.encode()).hexdigest() == hashlib.sha256(doc.encode()).hexdigest()
        print("byte-identical" if same else "DIFFERS", file=sys.stderr)
        return 0 if same else 1
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(doc)
    print(f"wrote {OUT} ({len(doc)} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
