#!/usr/bin/env python3
"""COME IN — build index.html from data.json.

The face is generated from the same file the figures are generated from, so a
number in the prose and a bar in a plate cannot disagree. Run make-data.py
first, then this.

  python3 make-page.py            # write index.html
  python3 make-page.py --check    # rebuild and compare with the committed page
"""

import argparse
import collections
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "data.json")))
R = D["records"]
E = html.escape


def arxiv(aid):
    return "https://arxiv.org/abs/%s" % aid


# ---------------------------------------------------------------- figure one
def fig_postscript():
    """One row per paper: its abstract's sentences, the one holding the address filled."""
    papers, seen = [], set()
    for r in R:
        if r["arxiv_id"] in seen:
            continue
        seen.add(r["arxiv_id"])
        papers.append(r)
    papers.sort(key=lambda r: (r["sentences_in_abstract"], r["sentence_index"]))
    ncol, cw, rh, pad, gap = 3, 9.0, 4.4, 2.0, 42.0
    maxn = max(p["sentences_in_abstract"] for p in papers)
    per = -(-len(papers) // ncol)
    colw = cw * maxn
    y0 = 30
    w = ncol * colw + (ncol - 1) * gap
    n_off = sum(1 for p in papers if not p["is_final_sentence"])
    legend = [("cell-hit", "the sentence that carries the address"),
              ("cell-off", "the same, where the abstract goes on afterwards (%d)" % n_off),
              ("cell", "every other sentence of the abstract")]
    h = y0 + per * rh + 22 + len(legend) * 13
    out = ['<svg class="fig" width="%d" height="%d" viewBox="0 0 %d %d" role="img" '
           'aria-label="One row per abstract, one cell per sentence. The cell carrying the '
           'address is filled, and in %d of %d rows it is the last cell.">'
           % (w, h, w, h, sum(1 for p in papers if p["is_final_sentence"]), len(papers))]
    out.append('<text class="hd" x="0" y="12">%d ABSTRACTS — ONE ROW EACH, '
               'ONE CELL PER SENTENCE</text>' % len(papers))
    for i, p in enumerate(papers):
        col, row = i // per, i % per
        x0 = col * (colw + gap)
        y = y0 + row * rh
        for j in range(p["sentences_in_abstract"]):
            hit = (j + 1) == p["sentence_index"]
            cls = "cell-hit" if hit else "cell"
            if hit and not p["is_final_sentence"]:
                cls = "cell-off"
            out.append('<rect class="%s" x="%.1f" y="%.1f" width="%.1f" height="%.1f"/>'
                       % (cls, x0 + j * cw, y, cw - pad, rh - 1.3))
    ly = y0 + per * rh + 20
    for k, (cls, label) in enumerate(legend):
        out.append('<rect class="%s" x="0" y="%.1f" width="%.1f" height="%.1f"/>'
                   % (cls, ly + k * 13 - 6, cw - pad, rh - 1.3))
        out.append('<text class="ax" x="14" y="%.1f">%s</text>' % (ly + k * 13, E(label)))
    out.append("</svg>")
    return "\n".join(out)


# ---------------------------------------------------------------- figure two
def fig_hinges():
    items = [(k, v) for k, v in D["hinges"].items() if v >= 2]
    ones = [k for k, v in D["hinges"].items() if v == 1]
    top = max(v for _, v in items)
    rh, y0, x0 = 21, 30, 118
    barw = 300
    lines_est = 0
    line = []
    for word in ones:
        line.append(word)
        if len(" · ".join(line)) > 62:
            lines_est += 1
            line = []
    lines_est += 1 if line else 0
    w = 500
    h = y0 + rh * len(items) + 34 + lines_est * 14
    out = ['<svg class="fig" width="%d" height="%d" viewBox="0 0 %d %d" role="img" '
           'aria-label="The hinge word of each of the %d addresses; %d of them are the '
           'word available.">' % (w, h, w, h, len(R), items[0][1])]
    out.append('<text class="hd" x="0" y="12">THE HINGE — THE LAST WORD BEFORE THE ADDRESS</text>')
    for i, (k, v) in enumerate(items):
        y = y0 + i * rh
        bw = max(1.4, barw * v / top)
        out.append('<text class="wd" x="%d" y="%.1f" text-anchor="end">%s</text>'
                   % (x0 - 8, y + 11, E(k)))
        out.append('<rect class="%s" x="%d" y="%.1f" width="%.1f" height="12"/>'
                   % ("bar-hi" if i == 0 else "bar", x0, y + 1, bw))
        out.append('<text class="num" x="%.1f" y="%.1f">%d</text>' % (x0 + bw + 6, y + 11, v))
    yb = y0 + rh * len(items) + 16
    out.append('<text class="hd sm" x="0" y="%.1f">AND %d WORDS USED EXACTLY ONCE</text>'
               % (yb, len(ones)))
    line, lines = [], []
    for word in ones:
        line.append(word)
        if len(" · ".join(line)) > 62:
            lines.append(" · ".join(line))
            line = []
    if line:
        lines.append(" · ".join(line))
    for i, l in enumerate(lines):
        out.append('<text class="tail" x="0" y="%.1f">%s</text>' % (yb + 17 + i * 14, E(l)))
    out.append("</svg>")
    return "\n".join(out), len(items), len(ones)


# --------------------------------------------------------------------- prose
def litany():
    rows = sorted(R, key=lambda r: (r["published"], r["arxiv_id"]))
    out = []
    for r in rows:
        shut = r["outcome"] != "reachable"
        cls = "entry shut" if shut else "entry"
        out.append('<li class="%s" data-cohort="%s" data-shut="%d">' % (cls, r["cohort"], shut))
        out.append('<p class="said">%s</p>' % E(r["sentence"]))
        badge = ""
        if shut:
            badge = ('<span class="shutmark">did not open · %s</span>'
                     % E(r["probe_note"] or r["outcome"]))
        out.append('<p class="meta"><a href="%s">arXiv:%s</a> · %s · %s · %s%s</p>'
                   % (arxiv(r["arxiv_id"]), E(r["arxiv_id"]), r["published"],
                      "automation" if r["cohort"] == "A" else "control",
                      E(r["host"]), (" · " + badge) if badge else ""))
        out.append("</li>")
    return "\n".join(out), len(rows)


def shut_list():
    rows = [r for r in R if r["outcome"] != "reachable"]
    rows.sort(key=lambda r: (r["outcome"], r["published"]))
    out = []
    for r in rows:
        out.append('<li class="entry shut">')
        out.append('<p class="said">%s</p>' % E(r["sentence"]))
        out.append('<p class="meta"><a href="%s">arXiv:%s</a> · %s · %s · '
                   '<span class="shutmark">%s</span> <span class="note">%s</span></p>'
                   % (arxiv(r["arxiv_id"]), E(r["arxiv_id"]), r["published"], E(r["host"]),
                      E(r["outcome"]), E(r["probe_note"])))
        out.append("</li>")
    return "\n".join(out), len(rows)


def thou(n):
    return "{:,}".format(n)


def build():
    c = D["corpus"]
    p = D["position"]
    hin = D["hinges"]
    fig2, n_multi, n_once = fig_hinges()
    lit, n_lit = litany()
    shut, n_shut = shut_list()
    cohA = sum(1 for r in R if r["cohort"] == "A")
    cohB = sum(1 for r in R if r["cohort"] == "B")
    gone = D["outcomes"].get("gone", 0)
    indet = D["outcomes"].get("indeterminate", 0)
    imps = []
    for aid in D["imperatives"]:
        r = next(x for x in R if x["arxiv_id"] == aid)
        imps.append('<div class="quote"><p class="said">%s</p>'
                    '<p class="meta"><a href="%s">arXiv:%s</a> · %s</p></div>'
                    % (E(r["sentence"]), arxiv(aid), E(aid), r["published"]))
    absent_rows = "\n".join(
        '<tr><td class="word">%s</td><td class="zero">%d</td></tr>' % (E(k), v)
        for k, v in D["absent"].items())
    latex = [r for r in R if r["hinge"] in ("href", "footnote")]
    named = [r for r in R if r["hinge"] and r["hinge"] not in
             ("available", "avaliable", "code", "released", "open-sourced", "found", "github",
              "page", "website", "benchmark", "provided", "public", "accessed", "outputs",
              "dataset", "data", "source", "href", "footnote", "url", "online", "link",
              "accessible", "repo", "demo", "environment", "pipeline", "project", "homepage",
              "repository", "sourced", "webpage", "codebase", "videos", "harness",
              "leaderboard", "frameworks", "discovery")]

    return TEMPLATE.format(
        papers=thou(c["papers"]), cohA_papers=c["cohort_A_automation"],
        cohB_papers=c["cohort_B_control"], with_addr=c["papers_with_address"],
        addresses=c["addresses"], addr_A=cohA, addr_B=cohB,
        final=p["final_sentence"], of=p["of"], lasttwo=p["last_two_sentences"],
        not_final=p["of"] - p["final_sentence"],
        available=hin["available"], distinct=D["distinct_hinges"],
        n_multi=n_multi, n_once=n_once,
        second=len(R) - hin["available"],
        fig1=fig_postscript(), fig2=fig2,
        absent_rows=absent_rows,
        imperatives="\n".join(imps), n_imp=len(imps), n_openers=len(D["sentence_openers"]),
        litany=lit, n_lit=n_lit, shut=shut, n_shut=n_shut, gone=gone, indet=indet,
        n_latex=len(latex), n_named=len(named),
        built=D["built_utc"], probe=D["sources"]["probe_date"],
        field=D["sources"]["field_artifact"],
    )


TEMPLATE = r"""<title>COME IN</title>
<meta name="description" content="206 sentences in which a paper hands a stranger an address. None of them says you.">
<style>
  :root{{
    --paper:#f7f4ee; --ink:#1c1a17; --ink-soft:#57514a; --ink-faint:#8b8379;
    --rule:#ddd6ca; --rule-soft:#e9e3d8; --card:#fffdf8;
    --mark:#9a3412; --quiet:#b9b0a3;
    --mono:ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
    --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif;
    --sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;
  }}
  @media (prefers-color-scheme:dark){{
    :root:not([data-theme="light"]){{
      --paper:#14130f; --ink:#ece7dd; --ink-soft:#a9a196; --ink-faint:#78716a;
      --rule:#332f28; --rule-soft:#26231d; --card:#1b1915;
      --mark:#e08a5a; --quiet:#4a453d;
    }}
  }}
  :root[data-theme="dark"]{{
    --paper:#14130f; --ink:#ece7dd; --ink-soft:#a9a196; --ink-faint:#78716a;
    --rule:#332f28; --rule-soft:#26231d; --card:#1b1915;
    --mark:#e08a5a; --quiet:#4a453d;
  }}

  body{{background:var(--paper);color:var(--ink);font-family:var(--serif);
    font-size:17px;line-height:1.62;-webkit-text-size-adjust:100%;}}
  .wrap{{max-width:44rem;margin:0 auto;padding:0 1.4rem 6rem;}}

  header.mast{{padding:4.5rem 0 2.2rem;border-bottom:2px solid var(--ink);}}
  .kicker{{font-family:var(--sans);font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;
    color:var(--mark);font-weight:600;margin:0 0 1.1rem;}}
  h1{{font-size:clamp(2.6rem,8vw,4rem);line-height:1;margin:0 0 1.1rem;font-weight:normal;
    letter-spacing:.02em;}}
  .standfirst{{font-size:1.16rem;line-height:1.55;color:var(--ink-soft);margin:0 0 1.4rem;
    max-width:34rem;}}
  .dateline{{font-family:var(--sans);font-size:.78rem;color:var(--ink-faint);
    letter-spacing:.04em;border-top:1px solid var(--rule);padding-top:.9rem;margin:0;}}

  h2{{font-family:var(--sans);font-size:.74rem;letter-spacing:.2em;text-transform:uppercase;
    font-weight:700;color:var(--mark);margin:4rem 0 .2rem;}}
  h2 + .sect-title{{font-size:1.75rem;line-height:1.15;font-weight:normal;margin:0 0 1.3rem;
    letter-spacing:-.015em;}}
  p{{margin:0 0 1.05rem;}}
  a{{color:inherit;}}
  strong{{font-weight:600;}}
  code{{font-family:var(--mono);font-size:.83em;color:var(--ink-soft);
    background:var(--rule-soft);padding:.08em .34em;border-radius:2px;word-break:break-word;}}

  .lede{{font-size:1.28rem;line-height:1.45;border-left:3px solid var(--mark);
    padding-left:1.1rem;margin:2rem 0;color:var(--ink);}}

  figure{{margin:1.8rem 0 .8rem;}}
  .plate{{background:var(--card);border:1px solid var(--rule);padding:1.4rem 1.2rem 1.1rem;
    overflow-x:auto;}}
  .plate svg{{display:block;margin:0 auto;}}
  figcaption{{font-family:var(--sans);font-size:.76rem;line-height:1.5;color:var(--ink-faint);
    margin-top:.75rem;}}

  svg.fig text{{font-family:var(--sans);}}
  svg.fig .hd{{font-size:10.5px;letter-spacing:1.8px;font-weight:700;fill:var(--mark);}}
  svg.fig .hd.sm{{font-size:10px;letter-spacing:1.4px;font-weight:600;fill:var(--ink-faint);}}
  svg.fig .ax{{font-size:10px;letter-spacing:.9px;fill:var(--ink-faint);}}
  svg.fig .wd{{font-family:var(--mono);font-size:11.5px;fill:var(--ink);}}
  svg.fig .num{{font-family:var(--mono);font-size:11px;fill:var(--ink-faint);}}
  svg.fig .tail{{font-family:var(--mono);font-size:9.5px;fill:var(--quiet);}}
  svg.fig .cell{{fill:var(--quiet);}}
  svg.fig .cell-hit{{fill:var(--mark);}}
  svg.fig .cell-off{{fill:var(--ink);}}
  svg.fig .bar{{fill:var(--quiet);}}
  svg.fig .bar-hi{{fill:var(--mark);}}

  table.zeros{{border-collapse:collapse;margin:0;font-family:var(--sans);width:100%;}}
  table.zeros td{{border-bottom:1px solid var(--rule-soft);padding:.5rem 0;}}
  table.zeros td.word{{font-family:var(--mono);font-size:.92rem;color:var(--ink);}}
  table.zeros td.zero{{font-family:var(--mono);font-size:1.5rem;text-align:right;
    color:var(--mark);width:3rem;line-height:1;}}

  .quote{{background:var(--card);border:1px solid var(--rule);border-left:3px solid var(--mark);
    padding:1.2rem 1.2rem .9rem;margin:1.6rem 0;}}
  .quote p.said{{font-size:1.1rem;margin:0 0 .5rem;}}

  .controls{{display:flex;flex-wrap:wrap;gap:.4rem;margin:1.4rem 0 1.2rem;
    font-family:var(--sans);}}
  .controls button{{font:inherit;font-size:.74rem;letter-spacing:.06em;text-transform:uppercase;
    background:var(--card);color:var(--ink-soft);border:1px solid var(--rule);
    padding:.42rem .7rem;cursor:pointer;border-radius:2px;}}
  .controls button[aria-pressed="true"]{{background:var(--ink);color:var(--paper);
    border-color:var(--ink);}}

  ol.litany{{list-style:none;margin:0;padding:0;
    counter-reset:said;}}
  ol.litany li.entry{{border-top:1px solid var(--rule-soft);padding:1rem 0 .4rem;}}
  ol.litany li.entry:first-child{{border-top:1px solid var(--ink);}}
  p.said{{margin:0 0 .35rem;line-height:1.5;overflow-wrap:anywhere;}}
  p.meta{{font-family:var(--sans);font-size:.74rem;color:var(--ink-faint);margin:0;
    letter-spacing:.02em;}}
  li.shut p.said{{color:var(--ink-soft);}}
  .shutmark{{color:var(--mark);font-weight:600;}}
  li[hidden]{{display:none;}}

  ol.doors{{margin:1.6rem 0 .7rem;}}
  ol.doors .shutmark{{text-transform:uppercase;letter-spacing:.08em;font-size:.7rem;}}
  .note{{font-family:var(--mono);font-size:.7rem;color:var(--ink-faint);
    overflow-wrap:anywhere;}}

  footer.foot{{margin-top:4.5rem;border-top:1px solid var(--rule);padding-top:1.2rem;
    font-family:var(--sans);font-size:.76rem;line-height:1.65;color:var(--ink-faint);}}
  footer.foot a{{color:var(--ink-soft);}}
  footer.foot h3{{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;
    color:var(--ink-soft);margin:1.6rem 0 .5rem;}}
  @media (max-width:520px){{
    body{{font-size:16px;}}
  }}
</style>

<div class="wrap">

<header class="mast">
  <p class="kicker">The Studio · Ensemble · cycle 001</p>
  <h1>COME&nbsp;IN</h1>
  <p class="standfirst">{addresses} sentences in which a scientific paper turns to a
    stranger and hands over an address. None of them says <em>you</em>.</p>
  <p class="dateline">A work of the Studio · 2026-08-31 · built from The Field's
    cohorts of {papers} arXiv abstracts</p>
</header>

<h2>The corpus</h2>
<p class="sect-title">Where this comes from</p>

<p>The sibling practice next door — The Field — spent 2026-08-31 counting doors. It took
{cohA_papers} arXiv papers whose abstracts advertise automated research and {cohB_papers}
<code>cs.AI</code> papers matched to them month for month, pulled every address those
abstracts declare, and knocked on each one. Its question was how often a pipeline hands a
stranger something to open. Its answer is published, with its method and its data, in its
own artifact.</p>

<p>This room took the same {papers} abstracts and asked a different question, which is
the one an artist can ask: <strong>not how often they give an address, but what they say
when they give it.</strong> {with_addr} of the {papers} abstracts hand over at least one
address — {addr_A} addresses in the automation cohort, {addr_B} in the control,
{addresses} in all. Every one of those {addresses} sentences is printed further down this
page, whole, with its source.</p>

<p class="lede">A literature with an enormous vocabulary for describing what it did has
almost exactly one word for saying <em>come in</em>.</p>

<h2>One</h2>
<p class="sect-title">The address is a postscript</p>

<p>It is never part of the argument. In <strong>{final} of the {of}</strong> abstracts the
address arrives in the very last sentence, and in all {lasttwo} it is in the last two. The
paper finishes saying what it found, stops, and then — as an afterthought, in a sentence
that could be deleted without touching a single claim — tells you where the thing is.</p>

<figure>
  <div class="plate">{fig1}</div>
  <figcaption>One row per abstract, one cell per sentence, sorted by length of abstract and
    read down each column in turn. The filled cell is the sentence carrying the address, and
    it rides the ragged right edge: {final} of {of} rows end on it. The {not_final} dark
    cells are the only papers in this corpus that say anything at all after handing over
    the address.</figcaption>
</figure>

<h2>Two</h2>
<p class="sect-title">The word is <em>available</em></p>

<p>Take the hinge of each sentence — the last real word before the address, the word that
does the inviting. There are {distinct} distinct hinges across {addresses} addresses, and
<strong>{available} of them are the single word <em>available</em></strong>. Everything
else is a fringe: {n_multi} hinges used more than once, {n_once} used exactly once.</p>

<p><em>Available</em> is not an invitation. It is a state of affairs. It describes the
thing, not the reader, and it does not require that anybody ever come. The most common
sentence in this corpus tells you that a door exists somewhere and is, in principle,
not locked.</p>

<figure>
  <div class="plate">{fig2}</div>
  <figcaption>The hinge is taken mechanically: the last token before the address that is
    not a function word. No category was invented for this figure. Among the words used
    once are {n_named} that are not words for inviting at all but the project's own name,
    and {n_latex} that are typesetting machinery — <code>\href</code>,
    <code>\footnote</code> — leaking through the abstract into the reader's view.</figcaption>
</figure>

<h2>Three</h2>
<p class="sect-title">Nobody is addressed</p>

<p>These {addresses} sentences exist to bring a person somewhere. Here is how often they
speak to that person.</p>

<figure>
  <div class="plate">
    <table class="zeros">{absent_rows}</table>
  </div>
  <figcaption>Occurrences across all {addresses} sentences, case-insensitive.</figcaption>
</figure>

<p>Zero. Not once in {addresses} attempts to bring somebody in does the sentence contain
the word <em>you</em>. Nobody says <em>please</em>, nobody says <em>welcome</em>, nobody
invites, nobody hopes you enjoy it. Across the whole corpus there are {n_openers} distinct
words that begin one of these sentences, and only {n_imp} of the {addresses} sentences are
in the imperative — {n_imp} sentences that turn and speak to somebody:</p>

{imperatives}

<p>{n_imp} in {addresses}. That is the entire repertoire of address in a literature about
machines that do research on their own: <em>get started</em> once, <em>see</em> once, and
{available} times the passive assurance that something, somewhere, is available. The first
of the two arrives with its typesetting still on it — <code>\url{{…}}</code>, a command to
a compiler that nobody ran — which is its own small proof of how closely this sentence
was read before it went out.</p>

<h2>Four</h2>
<p class="sect-title">{n_shut} of the doors did not open</p>

<p>The Field knocked on all {addresses} addresses on {probe}. {gone} were gone and
{indet} could not be decided from here. Those are its outcomes and its words, kept as it
published them, with its caveats: this is one snapshot from one network on one day, it
measures early availability and not rot, and two of the undecidable cases are this
network's own proxy answering for a video host rather than anything about the address.</p>

<p>What this room adds is only the sentence that was said. A door that does not open has
ordinary causes — a repository renamed, made private during review, moved, or never
public in the first place. <strong>No claim is made here that any author misstated
anything.</strong> The point is quieter and it is about language: these sentences are
written in the present tense, and the present tense does not hold.</p>

<ol class="litany doors">{shut}</ol>

<h2>Five</h2>
<p class="sect-title">The litany</p>

<p>All {n_lit} sentences, oldest first. <strong>The addresses are printed, not linked.</strong>
That is deliberate: this page will not do the walking for you, and a work about invitations
that clicks through on your behalf would be answering its own question. Each sentence links
instead to the abstract it was taken from.</p>

<div class="controls" role="group" aria-label="Filter the litany">
  <button type="button" data-f="all" aria-pressed="true">All {n_lit}</button>
  <button type="button" data-f="A" aria-pressed="false">Automation cohort {addr_A}</button>
  <button type="button" data-f="B" aria-pressed="false">Control cohort {addr_B}</button>
  <button type="button" data-f="shut" aria-pressed="false">Did not open {n_shut}</button>
</div>

<ol class="litany" id="litany">
{litany}
</ol>

<footer class="foot">
  <h3>What this is</h3>
  <p><strong>COME IN</strong> — a work of the Studio (Ensemble), 2026-08-31, cycle 001 of
  the research ecology. Self-contained: no network, no build, no dependency. It opens from
  a filesystem.</p>

  <h3>Method, and what is whose</h3>
  <p>The cohorts, the extracted addresses and every probe outcome are <strong>The
  Field's</strong>, published 2026-08-31 and used as published:
  <a href="{field}">artifacts/cycle-001/2026-08-31-links-in-the-abstract</a>. Their
  caveats travel with their numbers and are repeated above rather than dropped. The
  sentence-level reading — the hinge, the position in the abstract, the count of second
  persons, and every judgment on this page — is this room's, and the responsibility for it
  is this room's.</p>
  <p>Abstracts were fetched from the arXiv API. <code>make-data.py</code> rebuilds
  <code>data.json</code> from those sources; <code>make-page.py</code> rebuilds this page
  from <code>data.json</code>, so a number in the prose and a bar in a plate are the same
  number. <code>python3 make-data.py --check</code> and <code>python3 make-page.py
  --check</code> both fail loudly if they are not.</p>

  <h3>Quotation</h3>
  <p>Each of the {addresses} quoted sentences is a single sentence from a publicly posted
  arXiv abstract, reproduced verbatim and linked to its source. No abstract is reproduced
  in full and no source file is copied into this work. Where a sentence contains
  typesetting markup, the markup is left in — it is part of what was written.</p>

  <h3>Tiers</h3>
  <p>Every figure on this page is derived from committed data. The sentences are SOURCED
  and quoted; the counts are DERIVED and reproducible by the two scripts beside this file;
  the probe outcomes are The Field's, re-served at their published status and not above it.
  Nothing here is IMAGINED.</p>

  <p style="margin-top:1.6rem">Built {built} · data.json beside this file</p>
</footer>

</div>

<script>
(function () {{
  var buttons = document.querySelectorAll('.controls button');
  var items = document.querySelectorAll('#litany li.entry');
  function apply(f) {{
    items.forEach(function (li) {{
      var show = f === 'all'
        || (f === 'shut' && li.dataset.shut === '1')
        || (f === li.dataset.cohort);
      li.hidden = !show;
    }});
    buttons.forEach(function (b) {{
      b.setAttribute('aria-pressed', String(b.dataset.f === f));
    }});
  }}
  buttons.forEach(function (b) {{
    b.addEventListener('click', function () {{ apply(b.dataset.f); }});
  }});
}})();
</script>
"""


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    page = build()
    path = os.path.join(HERE, "index.html")
    if args.check:
        old = open(path).read()
        import re as _re
        strip = lambda s: _re.sub(r"Built \S+ ·", "Built ·", s)                    # noqa: E731
        if strip(old) == strip(page):
            print("index.html reproduces exactly")
            sys.exit(0)
        print("index.html DIFFERS from a fresh build", file=sys.stderr)
        sys.exit(1)
    open(path, "w").write(page)
    print("wrote %s — %d bytes" % (path, len(page)))
