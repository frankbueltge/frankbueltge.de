#!/usr/bin/env python3
"""ALL AT ONCE — write index.html from data.json.

Every figure on the face comes from data.json through fmt() or a named lookup.
Nothing about a notice is typed into the prose: the sentences that describe a
notice are keyed to it by DOI and assert their own content at build time, which
is the lesson the last work in this room learnt the hard way.

  python3 make-page.py            # write index.html
  python3 make-page.py --check    # re-render and compare with the committed file
"""

import argparse
import datetime
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data.json")
OUT = os.path.join(HERE, "index.html")


def fmt(n):
    return f"{n:,}"


def esc(s):
    return html.escape(str(s), quote=True)


def load():
    with open(DATA) as fh:
        return json.load(fh)


def named(data, doi):
    for n in data["named"]:
        if n["doi"] == doi:
            return n
    raise KeyError(doi)


def batch(data, doi):
    for b in data["batches"]:
        if b["doi"] == doi:
            return b
    raise KeyError(doi)


# --------------------------------------------------------------------------
# drawing
# --------------------------------------------------------------------------

def cells(b, unit=None):
    """One notice as a strip of cells: filled = retracted, hollow = standing."""
    out = []
    for i in range(b["papers"]):
        state = "on" if i < b["retracted"] else "off"
        out.append(f'<i class="c {state}"></i>')
    return "".join(out)


def strip(b, cls=""):
    title = (f'{b["papers"]} paper{"s" if b["papers"] != 1 else ""} · '
             f'{b["retracted"]} retracted · {b["date"]} · {b["publisher"]} · {b["doi"]}')
    return (f'<a class="n {b["verdict"]} {cls}" href="{esc(b["url"])}" '
            f'title="{esc(title)}" target="_blank" rel="noopener">{cells(b)}</a>')


def field(data):
    """Plate I: every identified notice, largest first, on one shared scale.

    The notices of five papers or more get a line each, so the head of the
    distribution reads as a staircase and a striped bar would be unmissable.
    """
    parts = ['<div class="plate" id="plate-i">']
    parts.append('<div class="row stair">')
    for b in data["batches"]:
        if b["papers"] >= data["finding"]["big_threshold"]:
            parts.append(f'<div class="step">{strip(b)}'
                         f'<span class="lab">{b["papers"]}</span></div>')
    parts.append("</div>")
    parts.append('<div class="row batches">')
    for b in data["batches"]:
        if b["papers"] < data["finding"]["big_threshold"]:
            parts.append(strip(b))
    parts.append("</div>")
    # The single-paper notices are a different kind of object — 916 separate
    # decisions, not one notice's inside — so they are drawn in a different
    # grammar: round marks, in two labelled groups, never one bar.
    on = data["notices"]["single_paper_retracted"]
    off = data["notices"]["single_paper"] - on
    parts.append('<div class="row singles">')
    parts.append(f'<p class="sublab">{fmt(on)} notices of one paper, retracted</p>')
    parts.append('<div class="dots">' + '<i class="d on"></i>' * on + "</div>")
    parts.append(f'<p class="sublab">{fmt(off)} notices of one paper, still standing</p>')
    parts.append('<div class="dots">' + '<i class="d off"></i>' * off + "</div>")
    parts.append("</div>")
    parts.append("</div>")
    return "\n".join(parts)


# --------------------------------------------------------------------------

CSS = """
:root{
  --bg:#f6f4ef; --ink:#16130f; --dim:#6d675e; --rule:#d6d0c4;
  --on:#16130f; --off:#f6f4ef; --edge:#7d7566; --hot:#a8321e; --panel:#efece5;
}
@media (prefers-color-scheme: dark){
  :root{
    --bg:#100f0d; --ink:#ece7dd; --dim:#8d867a; --rule:#2e2b26;
    --on:#ece7dd; --off:#100f0d; --edge:#867e70; --hot:#e0643f; --panel:#191713;
  }
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.62 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;}
main{max-width:47rem;margin:0 auto;padding:5rem 1.5rem 7rem}
h1{font:700 clamp(2.6rem,11vw,5rem)/0.94 "Helvetica Neue",Helvetica,Arial,sans-serif;
  letter-spacing:-.035em;margin:0 0 1.4rem;text-transform:uppercase}
h2{font:600 .78rem/1.4 "Helvetica Neue",Helvetica,Arial,sans-serif;
  letter-spacing:.19em;text-transform:uppercase;color:var(--dim);
  margin:4.5rem 0 1.1rem;border-top:1px solid var(--rule);padding-top:1rem}
p{margin:0 0 1.15rem}
.lede{font-size:1.24rem;line-height:1.5}
.dek{color:var(--dim);font-size:.94rem;line-height:1.55}
b,strong{font-weight:600}
a{color:inherit}
em.q{font-style:italic}
.big{font:600 clamp(2rem,7vw,3.2rem)/1 "Helvetica Neue",Helvetica,Arial,sans-serif;
  letter-spacing:-.03em;display:block;margin:.2rem 0 .35rem}

/* the marks */
.c{display:inline-block;width:7px;height:15px;margin:0 1px 2px 0;vertical-align:top;
  border:1px solid var(--edge);background:var(--off)}
.c.on{background:var(--on);border-color:var(--on)}
.plate{margin:1.6rem 0 .6rem}
.row{margin:0 0 .9rem}
.stair{margin:0 0 1.1rem}
.step{display:flex;align-items:center;gap:.5rem;margin:0 0 3px}
.lab{font:.72rem/1 "Helvetica Neue",Helvetica,Arial,sans-serif;color:var(--dim);
  font-variant-numeric:tabular-nums}
.batches{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:flex-start}
.n{display:inline-block;text-decoration:none;line-height:0;padding:2px;
  border-radius:2px;outline:0}
.n:hover,.n:focus-visible{background:var(--panel);box-shadow:0 0 0 1px var(--edge)}
.n.split{box-shadow:inset 0 0 0 2px var(--hot)}
.n.split:hover{box-shadow:inset 0 0 0 2px var(--hot),0 0 0 1px var(--edge)}
.singles{margin-top:1.6rem}
.dots{line-height:0;margin:0 0 1.1rem}
.d{display:inline-block;width:5px;height:5px;margin:0 2px 3px 0;border-radius:50%;
  vertical-align:top;background:var(--on)}
.d.off{background:transparent;box-shadow:inset 0 0 0 1px var(--edge)}
.sublab{font:.74rem/1.4 "Helvetica Neue",Helvetica,Arial,sans-serif;color:var(--dim);
  letter-spacing:.06em;text-transform:uppercase;margin:0 0 .45rem}
.key{font:.8rem/1.5 "Helvetica Neue",Helvetica,Arial,sans-serif;color:var(--dim);
  margin:.9rem 0 0}
.key .c{margin-right:.3rem;transform:translateY(2px)}
.swatch{box-shadow:inset 0 0 0 2px var(--hot);padding:1px 6px;border-radius:2px;
  white-space:nowrap;display:inline-block}

/* the three that split, drawn large */
.split-card{border:1px solid var(--rule);background:var(--panel);
  padding:1rem 1.1rem;margin:0 0 .8rem;border-radius:3px}
.split-card .c{width:12px;height:24px}
.split-card h3{font:600 1rem/1.35 "Helvetica Neue",Helvetica,Arial,sans-serif;
  margin:0 0 .15rem}
.split-card .meta{font:.82rem/1.5 "Helvetica Neue",Helvetica,Arial,sans-serif;
  color:var(--dim);margin:0 0 .7rem}
.split-card .marks{line-height:0;margin:0 0 .55rem}
.split-card p{margin:0;font-size:.94rem}

table{border-collapse:collapse;width:100%;
  font:.86rem/1.45 "Helvetica Neue",Helvetica,Arial,sans-serif;margin:1.2rem 0}
th,td{text-align:left;padding:.5rem .6rem;border-bottom:1px solid var(--rule);
  vertical-align:top}
th{color:var(--dim);font-weight:600;letter-spacing:.05em;text-transform:uppercase;
  font-size:.72rem}
td.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
td.doi{word-break:break-all;font-size:.8rem}
.note{font:.85rem/1.6 "Helvetica Neue",Helvetica,Arial,sans-serif;color:var(--dim)}
.note li{margin:0 0 .55rem}
footer{margin-top:5rem;border-top:1px solid var(--rule);padding-top:1.2rem;
  font:.78rem/1.65 "Helvetica Neue",Helvetica,Arial,sans-serif;color:var(--dim);
  word-break:break-word}
footer a{color:var(--dim)}
@media (max-width:430px){
  main{padding:3rem 1.1rem 5rem}
  .c{width:5px;height:13px}
  .split-card .c{width:10px;height:20px}
  .batches{gap:5px 8px}
}
"""


def render(d):
    c, nt, f, dy = d["cohort"], d["notices"], d["finding"], d["days"]

    cx, w = d["crossref_check"], d["wide"]
    wide_b = batch(d, w["doi"])
    wide_n = named(d, w["doi"])
    micpro = batch(d, "10.1016/j.micpro.2021.104306")
    micpro_n = named(d, "10.1016/j.micpro.2021.104306")
    wasp = batch(d, "10.1016/j.earlhumdev.2021.105329")
    wasp_n = named(d, "10.1016/j.earlhumdev.2021.105329")
    trek = batch(d, "10.1016/j.earlhumdev.2021.105328")
    trek_n = named(d, "10.1016/j.earlhumdev.2021.105328")
    eys_a = batch(d, "10.1177/0031512520901993")
    eys_a_n = named(d, "10.1177/0031512520901993")
    eys_b = batch(d, "10.1177/0033294120901991")
    eys_b_n = named(d, "10.1177/0033294120901991")
    mms = batch(d, "10.1177/1081286515618095")
    mms_n = named(d, "10.1177/1081286515618095")
    circ = batch(d, "10.1161/res.0000000000000241")
    circ_n = named(d, "10.1161/res.0000000000000241")

    # Claims the prose makes about specific notices, asserted here so a
    # hand-written sentence cannot drift away from the row it describes.
    assert micpro["papers"] == micpro["retracted"] == 46, micpro
    assert len(set(micpro["days"])) == 2, micpro["days"]
    assert wasp["retracted"] == 0 and wasp["papers"] == 48, wasp
    assert trek["retracted"] == 0 and trek["papers"] == 15, trek
    assert wasp_n["journal"] == trek_n["journal"], (wasp_n, trek_n)
    assert eys_a["retracted"] == 0 and eys_b["retracted"] == 0
    assert eys_a["date"] == eys_b["date"], (eys_a, eys_b)
    assert eys_a_n["journal"] != eys_b_n["journal"]
    assert mms["papers"] == mms["retracted"] == 13 and set(mms["days"]) == {1}, mms
    assert circ["verdict"] == "split" and set(circ["days"]) == {22}, circ
    assert f["draws_at_least_observed"] == 0
    assert f["stratified_draws_at_least_observed"] == 0
    assert f["big_draws_at_least_observed"] == 0
    assert nt["single_paper"] + nt["multi_paper"] == nt["total"]
    assert nt["multi_paper"] == f["of"] == f["all_or_nothing"] + f["split"]
    assert cx["eysenck_overlap"] == 0, cx
    # Every notice drawn large or named in the prose has its title fetched.
    for b in d["splitters"]:
        assert any(n["doi"] == b["doi"] for n in d["named"]), b["doi"]
    # The one notice whose two sources disagree is the one the closing is about.
    disagree = [c for c in cx["detail"] if c["deposited"] != c["in_mature_cohort"]]
    assert len(disagree) == 1 and disagree[0]["doi"] == w["doi"], disagree
    assert w["deposited_present_in_file"] == w["deposited"], w
    assert wide_b["papers"] == w["in_mature_cohort"] == 2, (wide_b, w)

    eys_total = eys_a["papers"] + eys_b["papers"]

    split_cards = []
    for b in sorted(d["splitters"], key=lambda x: -x["papers"]):
        nm = named(d, b["doi"])
        split_cards.append(f"""
      <div class="split-card">
        <h3>{esc(nm["title"])}</h3>
        <p class="meta">{esc(nm["journal"])} · {esc(b["publisher"])} · {esc(b["date"])} ·
          <a href="{esc(b["url"])}" target="_blank" rel="noopener">{esc(b["doi"])}</a></p>
        <div class="marks">{cells(b)}</div>
        <p>{b["papers"]} papers flagged, {b["retracted"]} retracted,
           {b["papers"] - b["retracted"]} still standing.</p>
      </div>""")

    table_rows = []
    for b in d["batches"]:
        if b["papers"] < f["big_threshold"]:
            continue
        nm = next((n for n in d["named"] if n["doi"] == b["doi"]), None)
        where = esc(nm["journal"]) if nm else esc(b["publisher"])
        went = {"all": "all", "none": "none", "split": "split"}[b["verdict"]]
        table_rows.append(
            f'<tr><td>{esc(b["date"])}</td><td>{where}</td>'
            f'<td class="num">{b["papers"]}</td>'
            f'<td class="num">{b["retracted"]}</td>'
            f'<td>{went}</td>'
            f'<td class="doi"><a href="{esc(b["url"])}" target="_blank" '
            f'rel="noopener">{esc(b["doi"])}</a></td></tr>')

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ALL AT ONCE — Ensemble</title>
<meta name="description" content="Of the {f['of']} expression-of-concern notices in The Field's five-year cohort that flag more than one paper, {f['all_or_nothing']} went entirely one way: every paper retracted, or none. A work made from a sibling practice's committed row file.">
<style>{CSS}</style>
</head>
<body>
<main>

<h1>All at once</h1>

<p class="lede">An expression of concern is a journal saying in public that one of its own
papers may be unreliable, and that it is not withdrawing it yet. It is a flag with a date on
it and an implied promise of a decision to come. The sibling practice next door measured how
long that promise takes to keep: of {fmt(c['papers'])} papers with five full years behind
them, {fmt(c['retracted'])} — {c['rate'] * 100:.1f}&nbsp;% — were retracted inside the
window.</p>

<p class="lede">Almost half. It is the kind of number that describes a paper's prospects — this
one has a bit under an even chance. Regroup the same rows by the <b>notice</b> that raised
each concern, and the paper stops having prospects of its own.</p>

<h2>Plate I · {fmt(nt['total'])} notices, one scale</h2>

<p class="dek">Every notice in the cohort whose identifier is recorded, drawn as one cell per
paper it flags. Filled&nbsp;= retracted within five years. Hollow&nbsp;= still standing;
within a strip the filled cells are placed first, because the papers inside a notice have no
order. First the {f['big_notices']} notices of five papers or more, a line each, largest
first; then the {f['of'] - f['big_notices']} smaller ones that flag more than one paper. The
{fmt(nt['single_paper'])} notices that flag exactly one paper are a different kind of object
— {fmt(nt['single_paper'])} separate decisions, not one decision's inside — so they are drawn
below in a different mark, in two groups. Every strip links to the notice it stands for.</p>

{field(d)}

<p class="key"><i class="c on"></i>retracted within five years &nbsp;·&nbsp;
<i class="c off"></i>flagged, still standing &nbsp;·&nbsp;
<span class="swatch">red outline</span> the {f['split']} notices whose papers did not all go
the same way</p>

<p>Read the staircase for stripes — for a bar that is part filled and part hollow. In
{f['big_notices']} bars there are {f['big_notices'] - f['big_all_or_nothing']}. Of the {f['of']} notices
that flag more than one paper — {fmt(nt['multi_paper_papers'])} papers between them —
<b>{f['all_or_nothing']} went entirely one way</b>: {f['all_retracted']} in which every paper
was retracted, {f['none_retracted']} in which not one was. That is
{fmt(f['papers_in_them'])} of the {fmt(nt['multi_paper_papers'])} papers. Three notices
split.</p>

<h2>Is that just what {c['rate'] * 100:.0f}&nbsp;% looks like?</h2>

<p>No, and not nearly. If each paper's outcome were drawn on its own at the cohort's rate,
notices of these sizes would come out all-or-nothing about
<b>{f['expected_if_independent']}</b> times. They do it {f['all_or_nothing']} times. In
{fmt(f['draws'])} draws of that null, the observed count was reached
<b>{f['draws_at_least_observed']} times</b>.</p>

<p>Small notices could manage it by luck — two papers agree half the time by accident. So
take only the {f['big_notices']} notices flagging {f['big_threshold']} papers or more,
{fmt(f['big_papers'])} papers in all. Independence expects
<b>{f['big_expected_if_independent']}</b> of them to go entirely one way, and reached
{f['big_all_or_nothing']} in {f['big_draws_at_least_observed']} of {fmt(f['draws'])} draws.
<span class="big">{f['big_all_or_nothing']} of {f['big_notices']} do.</span></p>

<p>There is an obvious other explanation, and it is not the notice at all: some publishers
retract readily and some do not, so papers that share a publisher would agree with each other
even if every decision were made separately. Give that reading every advantage — estimate a
separate rate for each publisher from its own rows in this cohort, batched papers included,
and draw again. It accounts for some of the effect and nowhere near all of it: the expected
count rises from {f['expected_if_independent']} to <b>{f['stratified_expected']}</b>, and
{f['all_or_nothing']} is still reached in {f['stratified_draws_at_least_observed']} of
{fmt(f['draws'])} draws.</p>

<p>The single-paper notices behave exactly like the cohort as a whole:
{fmt(nt['single_paper_retracted'])} of {fmt(nt['single_paper'])},
{nt['single_paper_retracted'] / nt['single_paper'] * 100:.1f}&nbsp;%. The headline rate is
theirs. The batched papers do not sit near it; they sit at both ends of it.</p>

<h2>Plate II · The three that split</h2>

<p class="dek">In the whole five-year cohort, these are the only notices inside which the
papers were not treated alike.</p>
{"".join(split_cards)}

<h2>Read {len(set([micpro['doi'], wasp['doi'], trek['doi'], eys_a['doi'], eys_b['doi']]))} of
them</h2>

<p><b><em class="q">{esc(micpro_n['title'])}</em></b>, {esc(micpro_n['journal'])},
{esc(micpro['date'])} — <a href="{esc(micpro_n['url'])}" target="_blank"
rel="noopener">{esc(micpro['doi'])}</a>. {micpro['papers']} papers flagged in one document.
All {micpro['retracted']} were retracted, and not one at a time either: the retractions fall
on {len(set(micpro['days']))} days, {micpro['days'][0]} and {micpro['days'][-1]} days after
the flag. Both ends of the clock are single administrative acts; the interval between them is
what gets measured.</p>

<p><b><em class="q">{esc(wasp_n['title'])}</em></b> and <b><em
class="q">{esc(trek_n['title'])}</em></b>, both in {esc(wasp_n['journal'])},
{esc(wasp['date'])} and {esc(trek['date'])} — <a href="{esc(wasp_n['url'])}" target="_blank"
rel="noopener">{esc(wasp['doi'])}</a>, <a href="{esc(trek_n['url'])}" target="_blank"
rel="noopener">{esc(trek['doi'])}</a>. {wasp['papers']} papers and {trek['papers']} papers,
two documents on consecutive days. Five and a half years later, <b>none of the
{wasp['papers'] + trek['papers']} has a retraction on record</b>.</p>

<p><b><em class="q">{esc(eys_a_n['title'])}</em></b> in {esc(eys_a_n['journal'])} and <b><em
class="q">{esc(eys_b_n['title'])}</em></b> in {esc(eys_b_n['journal'])}, both dated
{esc(eys_a['date'])} — <a href="{esc(eys_a_n['url'])}" target="_blank"
rel="noopener">{esc(eys_a['doi'])}</a>, <a href="{esc(eys_b_n['url'])}" target="_blank"
rel="noopener">{esc(eys_b['doi'])}</a>. Two journals, one day, {eys_a['papers']} papers and
{eys_b['papers']} papers; the two lists deposited with Crossref share
{cx['eysenck_overlap']} papers. Of all {eys_total}, <b>none has a retraction on record from
the five years that followed</b>.</p>

<h2>Every notice of {f['big_threshold']} papers or more</h2>

<table>
<thead><tr><th>Flagged</th><th>Journal or publisher</th><th class="num">Papers</th>
<th class="num">Retracted</th><th>Went</th><th>Notice</th></tr></thead>
<tbody>
{chr(10).join(table_rows)}
</tbody>
</table>

<h2>The other end of the clock does it too</h2>

<p>A resolution is an act of the same kind. <em class="q">{esc(mms_n['title'])}</em> in
{esc(mms_n['journal'])} flagged {mms['papers']} papers on {esc(mms['date'])}; all
{mms['retracted']} were retracted <b>{mms['days'][0]} day later</b>, on one day. <em
class="q">{esc(circ_n['title'])}</em> in {esc(circ_n['journal'])} flagged {circ['papers']} on
{esc(circ['date'])}; {circ['retracted']} of them were retracted <b>{circ['days'][0]} days
later, all on the same day</b>, and {circ['papers'] - circ['retracted']} were not — which is
what put it in Plate II. So the interval the measurement upstream reports is the gap between
two administrative acts. The paper is a passenger on both.</p>

<h2>And the smallest bar in Plate II is the largest notice in the record</h2>

<p>The third of the three splits — {wide_b['papers']} papers, {wide_b['retracted']} retracted,
{wide_b['papers'] - wide_b['retracted']} standing — is <em class="q">{esc(wide_n['title'])}</em>
in {esc(wide_n['journal'])}, <a href="{esc(wide_n['url'])}" target="_blank"
rel="noopener">{esc(wide_b['doi'])}</a>. Its own deposit with Crossref does not name
{wide_b['papers']} papers. It names <b>{fmt(w['deposited'])}</b>.</p>

<p>All {fmt(w['deposited_present_in_file'])} are in the row file;
{fmt(w['rows_in_whole_file'])} carry this notice as the concern that flagged them, and
{fmt(w['rows_with_a_retraction'])} of those have a retraction recorded. They are outside the
five-year cohort because the record dates almost all of them to {esc(w['busiest_day'])} — the
largest single day of doubt in the whole file, {fmt(w['rows_on_that_day'])} papers, of which
{fmt(w['this_notice_on_that_day'])} are this one document — and that is
{(datetime.date.fromisoformat(w['busiest_day']) - datetime.date.fromisoformat(w['cohort_cutoff'])).days}
days past {esc(w['cohort_cutoff'])} — the last day on which a concern could be raised and
still have five full years behind it.</p>

<p>So the one notice in Plate II that looks like a journal weighing two papers separately is a
two-paper window onto a {fmt(w['deposited'])}-paper document. The exception is the rule, seen
through a date.</p>

<h2>What this is and is not</h2>

<ul class="note">
<li><b>An expression of concern is not a finding of misconduct</b>, and nothing here says
anything about any author, editor or publisher beyond what the public record contains. Where
a notice is named, it is named because it is a public document with a title and a date, and
it is linked so it can be read.</li>
<li><b>&ldquo;Still standing&rdquo; means no retraction is on record</b> by
{esc(d['source']['observation_cutoff'])}. It is not a decision anyone made. A concern can be
resolved by a correction, by a reinstatement, or by being quietly dropped without a notice,
and none of those can be told apart from silence in this data. The upstream measurement says
so and it travels here unchanged.</li>
<li><b>The record is not the conduct.</b> A journal that issues concerns readily and resolves
them slowly looks worse in this file than one that never issues a concern at all.</li>
<li><b>The concern side of the record is the less completely collected side</b> — the source
database says so of itself — so counts of flagged papers are floors.</li>
<li><b>The measurement upstream was exploratory, not pre-registered</b>, and its five-year
window was chosen because it leaves a cohort of over a thousand papers, not because anyone
has set five years as a standard. That status travels with every figure on this page.</li>
<li><b>What is claimed here is about the record's grain, not its cause.</b> That papers
flagged together are retracted together is what a notice-shaped decision looks like from
outside; this page does not say why any particular decision went the way it did.</li>
<li><b>The publisher test above does not exhaust the alternative.</b> Rates were pooled by
publisher, which is the coarsest stratum the file supports; a journal-level or era-level
propensity is not separately controlled for, and every notice sits inside exactly one journal
and one date, so no test on this file can fully separate <em>the notice decided once</em>
from <em>this journal in this year decided this way</em>. What the test does show is that a
publisher's own base rate leaves most of the effect standing.</li>
<li><b>{fmt(nt['unidentified_papers'])} of the {fmt(c['papers'])} papers</b> carry no usable
identifier for the notice that flagged them. They are set aside rather than merged into a
pseudo-notice, and they are not in Plate I.</li>
</ul>

<footer>
<p><b>ALL AT ONCE</b> · Ensemble, {esc(d['built'])} · made in the art corner of a three-part
research house, whose standpoint is to build works from what the other two measure.</p>
<p>Material: <code>data/cohort.csv</code> from <b>{esc(d['source']['practice'])}</b>,
{esc(d['source']['repo'])}, session {d['source']['session']} — one row per paper that has
ever carried a public expression of concern, with the outcome as of
{esc(d['built'])}. <a href="{esc(d['source']['file'])}" target="_blank"
rel="noopener">{esc(d['source']['file'])}</a><br>sha256
{esc(d['source']['sha256'])}</p>
<p>{esc(d['source']['note'])} Their file's own upstream is the Retraction Watch database as
distributed by Crossref; no licence claim is made over it here.</p>
<p>Every notice title and journal name printed above is fetched from the Crossref record for
that notice by the build, not typed — and each sentence describing a notice asserts its own
content against that notice's row before the page will write itself. The same records were
used as a second source on the grouping this work rests on: of the {cx['notices_checked']}
notices checked, {cx['deposit_matches_cohort']} deposit exactly as many distinct papers as
The Field's rows assign to them. The one that does not is the subject of the closing section
above, and it disagrees by a factor of {w['deposited'] // w['in_mature_cohort']}.</p>
<p>Built in two steps from the committed code beside this file:
<code>make-data.py</code> writes <code>data.json</code> from the source above,
<code>make-page.py</code> writes this page from <code>data.json</code>. Both take
<code>--check</code>. Null draws: {fmt(d['finding']['draws'])}, seed
{d['finding']['seed']}.</p>
</footer>

</main>
</body>
</html>
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    page = render(load())
    if args.check:
        with open(OUT) as fh:
            committed = fh.read()
        if committed == page:
            print("check: index.html reproduces exactly")
            return 0
        print("check: MISMATCH between data.json and the committed index.html")
        return 1
    with open(OUT, "w") as fh:
        fh.write(page)
    print("wrote", OUT, f"({len(page):,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
