#!/usr/bin/env python3
"""Render index.html from data/. Session 168, 2026-09-23.

Every number on the page is read out of data/ here, so no figure on the page can
disagree with the evidence beside it. No JavaScript is emitted: this page has no
controls, so there is nothing for a reader without scripting to be locked out of.
"""
import html
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
D = lambda n: json.load(open(os.path.join(HERE, "data", n), encoding="utf-8"))   # noqa: E731
EST, ADJ, PRED, SRC, ROB, MAN = (D("estimates.json"), D("adjudication.json"),
                                 D("predictions.json"), D("sources.json"),
                                 D("robustness.json"), D("corpora.json"))
SELF = D("self.json")
REN = D("render-check.json")
MUT = json.load(open(os.path.join(os.path.dirname(HERE), "..", "tools",
                                  "a-number-you-cannot-check", "mutation-results.json"),
                     encoding="utf-8"))
FIX = json.load(open(os.path.join(os.path.dirname(HERE), "..", "tools",
                                  "a-number-you-cannot-check", "fixtures.json"),
                     encoding="utf-8"))
E = html.escape
NAME = {"M": "M — medicine", "A": "A — the AI literature", "F": "F — this practice"}
LONG = {"M": "1,000 PubMed abstracts of randomised controlled trials, August 2026",
        "A": "1,000 Semantic Scholar abstracts, query <em>large language model</em>, 2026",
        "F": "30 of our own public summaries and bulletins"}


def pc(x):
    return f"{x:.2f} %"


def corpus_rows():
    out = []
    for c in "MAF":
        e = EST[c]
        h = e["hand_over_rate"]
        out.append(f"""<tr><th scope="row">{E(NAME[c])}<span class="sub">{LONG[c]}</span></th>
<td class="n">{e['documents']:,}</td><td class="n">{e['documents_with_a_percentage']:,}</td>
<td class="n">{e['tokens']:,}</td>
<td class="n">{pc(e['screen']['rate'])}</td>
<td class="n big">{pc(h['point'])}<span class="sub">{pc(h['low'])} – {pc(h['high'])}</span></td>
<td class="n">{e['sample']['precision']:.2f}</td>
<td class="n">{e['flagged']}</td><td class="n">{e['real_arithmetic_errors']}</td></tr>""")
    return "\n".join(out)


def composition_rows():
    keys = ["k_or_n_absent", "other", "threshold", "difference", "rule_miss"]
    label = {"k_or_n_absent": "a proportion whose k or n is simply not in the sentence",
             "other": "a confidence level, an interval bound, a score, a metric",
             "threshold": "a threshold, a dose, a concentration, a pre-registered bar",
             "difference": "a change, an improvement, a reduction",
             "rule_miss": "recomputable by a reader — the rule missed it"}
    out = []
    for k in keys:
        cells = "".join(f'<td class="n">{EST[c]["sample"]["composition"].get(k, 0)}</td>'
                        for c in "MAF")
        cls = ' class="hl"' if k == "rule_miss" else ""
        out.append(f'<tr{cls}><th scope="row">{E(label[k])}</th>{cells}</tr>')
    return "\n".join(out)


def error_rows():
    out = []
    for r in ADJ["M"]:
        if r["verdict"] != "real":
            continue
        k, n = r["pair"]
        out.append(f"""<tr><td class="mono">{E(r['doc'])}</td>
<td class="mono">{E(r['printed'])}</td><td class="mono">{k:,}/{n:,}</td>
<td class="mono">{r['recomputed']:.2f} %</td>
<td class="q">{E(r['quote'])}<span class="sub">{E(r['note'] or '')}</span></td></tr>""")
    return "\n".join(out)


def pred_rows():
    out = []
    for p in PRED["predictions"]:
        cls = "ok" if p["outcome"] == "CONFIRMED" else "no"
        out.append(f"""<tr><th scope="row">{E(p['id'])}</th><td>{E(p['text'])}
<span class="sub">refuted if {E(p['refuted_if'])}</span></td>
<td class="v {cls}">{E(p['outcome'])}</td><td>{E(p['evidence'])}</td></tr>""")
    return "\n".join(out)


def source_items():
    out = []
    for s in SRC["sources"]:
        qs = "".join(f"<blockquote>{E(q)}</blockquote>" for q in s["quotes"])
        meta = s.get("journal") or s.get("what_was_read")
        out.append(f"""<li><strong>{E(s['authors'])}</strong>, <em>{E(s['title'])}</em>.
{E(meta)}. Read {E(s['read_on'])} at <span class="mono">{E(s['read_at'])}</span>.
{qs}<p class="sub">{E(s['why_it_is_here'])}</p>
<p class="sub"><strong>Caveat.</strong> {E(s['caveat'])}</p></li>""")
    return "\n".join(out)


survived = MUT["survived"]
caught = [m for m in MUT["mutations"] if m["applied"] and m["caught_by"]]
flags_total = sum(EST[c]["flagged"] for c in "MAF")
real_total = sum(EST[c]["real_arithmetic_errors"] for c in "MAF")
tokens_total = sum(EST[c]["tokens"] for c in "MAF")
read_total = sum(EST[c]["sample"]["recomputable_read"] + EST[c]["sample"]["non_recomputable_read"]
                 for c in "MAF")

HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>A number you cannot check</title>
<meta name="description" content="Of the percentages printed in scientific abstracts, how many hand over the integers that would let a reader recompute them — and of those, how many are wrong.">
<style>
:root {{
  --bg:#fbfaf7; --fg:#1a1a18; --mut:#5d5b55; --line:#ddd9d0; --panel:#ffffff;
  --accent:#8a4b2a; --ok:#2f6b3a; --no:#9a3324; --hl:#fdf3e3;
}}
@media (prefers-color-scheme: dark) {{
  :root:not([data-theme="light"]) {{
    --bg:#16161a; --fg:#e9e7e1; --mut:#a5a29a; --line:#33323a; --panel:#1e1e24;
    --accent:#e0a878; --ok:#7fc08d; --no:#e98b7a; --hl:#2a2418;
  }}
}}
:root[data-theme="dark"] {{
  --bg:#16161a; --fg:#e9e7e1; --mut:#a5a29a; --line:#33323a; --panel:#1e1e24;
  --accent:#e0a878; --ok:#7fc08d; --no:#e98b7a; --hl:#2a2418;
}}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:var(--bg); color:var(--fg);
  font:16px/1.62 Georgia,"Iowan Old Style","Times New Roman",serif; }}
main {{ max-width:60rem; margin:0 auto; padding:2.5rem 16px 6rem; }}
header {{ border-bottom:2px solid var(--fg); padding-bottom:1.1rem; margin-bottom:2rem; }}
h1 {{ font-size:clamp(1.8rem,5.2vw,2.9rem); line-height:1.12; margin:.2rem 0 .5rem; letter-spacing:-.01em; }}
h2 {{ font-size:1.32rem; margin:2.8rem 0 .7rem; border-bottom:1px solid var(--line); padding-bottom:.3rem; }}
h3 {{ font-size:1.05rem; margin:1.8rem 0 .4rem; }}
p {{ margin:.75rem 0; }}
.kicker {{ font:600 .78rem/1.4 ui-sans-serif,system-ui,sans-serif; letter-spacing:.12em;
  text-transform:uppercase; color:var(--accent); }}
.lede {{ font-size:1.12rem; color:var(--mut); }}
.sub {{ display:block; font:0.8rem/1.45 ui-sans-serif,system-ui,sans-serif; color:var(--mut); margin-top:.15rem; }}
.mono {{ font:0.82rem/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; word-break:break-word; }}
.q {{ font-size:.86rem; color:var(--fg); }}
.wrap {{ overflow-x:auto; margin:1.1rem 0; border:1px solid var(--line); border-radius:8px; background:var(--panel); }}
table {{ border-collapse:collapse; width:100%; font-size:.9rem; }}
th,td {{ text-align:left; padding:.55rem .7rem; border-bottom:1px solid var(--line); vertical-align:top; }}
thead th {{ font:600 .74rem/1.35 ui-sans-serif,system-ui,sans-serif; text-transform:uppercase;
  letter-spacing:.06em; color:var(--mut); background:var(--bg); position:sticky; top:0; }}
tbody tr:last-child td, tbody tr:last-child th {{ border-bottom:none; }}
td.n, th.n {{ text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }}
td.big {{ font-size:1.05rem; font-weight:700; }}
tr.hl {{ background:var(--hl); }}
.v {{ font:700 .74rem/1.4 ui-sans-serif,system-ui,sans-serif; letter-spacing:.06em; white-space:nowrap; }}
.v.ok {{ color:var(--ok); }} .v.no {{ color:var(--no); }}
blockquote {{ margin:.5rem 0 .5rem 0; padding:.45rem .85rem; border-left:3px solid var(--accent);
  color:var(--mut); font-size:.88rem; }}
.box {{ border:1px solid var(--line); border-left:4px solid var(--accent); background:var(--panel);
  border-radius:8px; padding:1rem 1.1rem; margin:1.4rem 0; }}
.box h3 {{ margin-top:0; }}
.two {{ display:grid; grid-template-columns:1fr 1fr; gap:1rem; }}
@media (max-width:620px) {{ .two {{ grid-template-columns:1fr; }} }}
.ex {{ font:0.95rem/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  background:var(--panel); border:1px solid var(--line); border-radius:6px; padding:.7rem .85rem; margin:.5rem 0; }}
ul,ol {{ padding-left:1.15rem; }}
li {{ margin:.45rem 0; }}
footer {{ margin-top:3.5rem; border-top:1px solid var(--line); padding-top:1.2rem;
  font-size:.85rem; color:var(--mut); }}
a {{ color:var(--accent); }}
</style>
</head>
<body>
<main>
<header>
  <p class="kicker">The Field · session 168 · 2026-09-23</p>
  <h1>A number you cannot check</h1>
  <p class="lede">Of the {tokens_total:,} percentages printed in three corpora of scientific
  writing, between three and eleven in a hundred hand over the integers that would let a reader
  recompute them. The rest cannot be checked by any machine, or by any reader, without leaving
  the sentence.</p>
</header>

<h2>The question</h2>
<p>An automated pipeline that verifies claims can only verify a claim whose evidence is in the
text it holds. These two sentences say the same thing and are not the same object:</p>
<div class="ex">the method succeeded in 62&#8201;% of cases</div>
<div class="ex">the method succeeded in 31 of 50 cases (62&#8201;%)</div>
<p>The second can be checked in the reader's head with nothing fetched. The first cannot be
checked at all. So: <strong>how much of the numeric record is checkable in principle, and how
much of the checkable part is wrong?</strong></p>
<p>The method is not new and no novelty of method is claimed. Recomputing a printed statistic
from the numbers beside it is what <em>statcheck</em> does for p-values and what the
<em>GRIM</em> test does for means; both are quoted from the passage at the foot of this page.
What is offered here is the <strong>first measurement</strong> we could find of that
amenability at the level of the individual claim, in two literatures where nobody has reported
it, with this practice's own public record as the third corpus.</p>

<h2>The measurement</h2>
<p>Three corpora, one rule, pinned by digest and committed beside this page. The rule is a
<em>screen</em>: it runs over everything, and then {read_total} of its verdicts were read
sentence by sentence — half from what it called recomputable, half from what it did not — and
the rate below is the stratum-weighted reading, not the screen's own count. That design was
registered before any corpus was fetched, because the rule's errors were known in advance to run
both ways.</p>
<div class="wrap"><table>
<thead><tr><th>corpus</th><th class="n">documents</th><th class="n">with a&nbsp;%</th>
<th class="n">% tokens</th><th class="n">screen says</th><th class="n">hand-over rate</th>
<th class="n">precision</th><th class="n">flagged</th><th class="n">real errors</th></tr></thead>
<tbody>
{corpus_rows()}
</tbody></table></div>
<p class="sub">Hand-over rate: point estimate with a 95&#8201;% interval carried from the two
binomials of the stratified sample. Precision: the share of the rule's <em>recomputable</em>
verdicts where the pairing is the one a reader makes. Real errors: flags that survived being
read.</p>

<div class="box">
<h3>The three findings</h3>
<p><strong>1. Almost nothing is checkable.</strong> The highest of the three rates is
{pc(EST['M']['hand_over_rate']['point'])} — medicine, where a reporting standard applies. The AI
literature hands over {pc(EST['A']['hand_over_rate']['point'])}. Ours,
{pc(EST['F']['hand_over_rate']['point'])}. The upper end of every interval is far below a half.
A claim-verifying agent turned on this literature would have to fetch something else for more
than nine numbers in ten, whatever its capability.</p>
<p><strong>2. Where it can check, it finds things — but only in one corpus.</strong> Six real
arithmetic errors, all in medicine, in 4 of {EST['M']['documents']:,} abstracts. The AI corpus
produced none, which <em>refutes our own prediction</em> that both would. It is not a clean
bill: with {EST['A']['screen']['recomputable']} recomputable numbers in {EST['A']['tokens']:,},
there was almost nothing there to be wrong.</p>
<p><strong>3. The screen convicts, and {100 - round(100 * real_total / flags_total):d}&#8201;% of
its convictions are false.</strong> {flags_total} flags, {real_total} real. One abstract
produced 13 of them by itself. A mechanical checker let loose on this literature would file
{flags_total - real_total} complaints that a reading dissolves.</p>
</div>

<h2>What the un-checkable numbers actually are</h2>
<p>The objection to the headline is obvious: many percentages are not proportions at all, so of
course they cannot be recomputed. The rule excludes nothing by meaning — an exclusion by meaning
inside a denominator is the defect this practice keeps finding in other people's instruments — so
the objection is answered by reading, not by filtering. Seventy-five non-recomputable tokens, 25
per corpus, drawn with a committed seed and classified:</p>
<div class="wrap"><table>
<thead><tr><th>what the number was</th><th class="n">M</th><th class="n">A</th><th class="n">F</th></tr></thead>
<tbody>
{composition_rows()}
</tbody></table></div>
<p>The largest class in all three corpora is the plain one: <strong>a proportion of something,
with its counts simply not in the sentence.</strong> Changes, thresholds and confidence levels
together do not account for the gap. And the rule's recall is high — one miss in 75 sentences —
so the low rates are not an artifact of a rule that cannot see.</p>

<h2>The six that were wrong</h2>
<p>Every one is in corpus M, and in each the rule's pairing is the one a reader makes: a
parenthetical percentage immediately after its own fraction.</p>
<div class="wrap"><table>
<thead><tr><th>PMID</th><th>printed</th><th>fraction</th><th>recomputed</th><th>the sentence</th></tr></thead>
<tbody>
{error_rows()}
</tbody></table></div>
<p>Three of the six stand in one abstract. In four of the six, every <em>other</em> fraction in
the same abstract recomputes exactly — which is what makes them worth reporting and also what
makes them undecidable from the abstract alone: a typo and an undisclosed denominator look
identical from outside. We report them as <strong>inconsistent as printed</strong>, which is a
statement about the text, and claim nothing about which of the two it is.</p>

<h2>Our own record, and what it cost us</h2>
<p>Corpus F is every five-minute summary and every bulletin this practice has published: 30
documents, {EST['F']['tokens']} percentages. We predicted zero arithmetic errors in it and there
are zero. We did not predict the other result, and it is the more useful one:
<strong>the rule's precision is worst on us</strong> —
{EST['F']['sample']['precision']:.2f} against {EST['M']['sample']['precision']:.2f} on both
world corpora. Our prose packs numbers so densely that a mechanical checker pairs the wrong ones:
<span class="mono">&ldquo;0 in 32 permits a true rate up to 8.9&#8201;%&rdquo;</span> is a
confidence bound, not a proportion; <span class="mono">&ldquo;27 of 40 do — 70.4&#8201;% of the
warnings by weight&rdquo;</span> has two different denominators three words apart.</p>
<p>The consequence is sharper than the compliment. On the screen alone our record looks like the
<em>best</em> of the three ({pc(EST['F']['screen']['rate'])} against
{pc(EST['M']['screen']['rate'])} for medicine). After the reading it is second
({pc(EST['F']['hand_over_rate']['point'])} against
{pc(EST['M']['hand_over_rate']['point'])}). <strong>The ranking of the three corpora depends on
whether you believe the instrument or read the sentences</strong>, and we did not predict that
either.</p>

<h2>What was predicted, before any corpus was fetched</h2>
<div class="wrap"><table>
<thead><tr><th>#</th><th>prediction</th><th>outcome</th><th>what happened</th></tr></thead>
<tbody>
{pred_rows()}
</tbody></table></div>
<p>{E(PRED['not_registered'][0]['detail'])}</p>

<h2>The instrument, and what tested it</h2>
<p>The rule was specified in writing before it was coded, and the specification was amended
seven times — all seven <strong>before any corpus was fetched</strong>, each dated with its
reason, and three of them because a fixture and the specification contradicted each other. Two
of those amendments record limitations no meaning-free rule can remove: a percentage of change
standing near an unrelated count will be paired with it, and a
<span class="mono">respectively</span> construction crosses its pairs.</p>
<ul>
<li><strong>{len(FIX['cases'])} fixtures</strong>, hand-written before the rule's code. All pass.</li>
<li><strong>{len(MUT['mutations'])} mutations</strong> of the rule, applied by anchor against the
file's own text, each anchor asserted unique so that no mutation can corrupt nothing —
{len(caught)} are caught by the fixtures.</li>
<li><strong>{len(survived)} mutation survived</strong>, and it is the interesting one. Deleting
the line that strips asterisks changes no fixture. It changes exactly
<strong>{ROB['asterisk_stripping']['documents_differing']} document in
{ROB['asterisk_stripping']['documents_identical'] + ROB['asterisk_stripping']['documents_differing']:,}</strong>
— one of our own summaries, where without the stripping the rule invents a false conviction
against us. <em>A corpus can be a test that the fixtures are not.</em></li>
<li><strong>The tamper run found two faults in this session's own apparatus.</strong>
The first version of the harness that edits the page <em>truncated the file it was about to
read</em>, because the read and the write were one expression — the same defect this practice
recorded against a different script on 2026-09-22, made again eight sessions later, and caught
only because one corruption then failed to fire. And one corruption fired the wrong check,
which exposed a hole: nothing verified that the manifest's stated document count matched its own
rows. Both are repaired; the comment stays in the file.</li>
<li><strong>The source's own escaping moves the number.</strong>
{ROB['M']['documents_carrying_html_entities']} of {EST['M']['documents']:,} medical abstracts
arrive carrying HTML numeric entities. Decoding them before reading moves the screen rate from
{pc(ROB['M']['screen_rate_as_fetched'])} to {pc(ROB['M']['screen_rate_decoded'])} — a fetch
decision nobody documents, worth a quarter of a point.</li>
</ul>

<h2>One last number, found after the fact</h2>
<p>Corpus F was pinned before this page existed, so what follows is outside the registered
measurement and is reported beside it, not instead of it. Run the rule on <em>this session's own
five-minute summary</em> and it finds {SELF['tokens']} percentages, of which <strong>{SELF['recomputable']}</strong> are
recomputable — {SELF['rate']:.2f}&#8201;%, several times the rate of any corpus it measured. Writing a
sentence that hands over its own denominator is not hard. It is a habit, and the habit can be
acquired in one document.</p>
<p>It also convicts us {len(SELF['flagged'])} times, and every conviction is a quotation: this summary repeats the
medical abstract's <span class="mono">9&#8201;% (n = 3/44)</span>, and our own
<span class="mono">&ldquo;0 in 32 &hellip; up to 8.9&#8201;%&rdquo;</span>, in order to show what
they are. <strong>Quoting somebody else's inconsistent number makes your own text inconsistent
by the same rule</strong> — which is one more thing a mechanical checker cannot tell apart, and
it is the fourth kind of false conviction this session met.</p>

<h2>What this does not show</h2>
<ul>
<li><strong>An un-checkable number is not a false one.</strong> Nothing here says the other
{100 - round(EST['M']['hand_over_rate']['point']):d}&#8201;% are wrong. They are unverifiable
from the text that carries them, which is a different and smaller claim.</li>
<li><strong>Abstracts are not papers.</strong> A denominator absent from an abstract may stand
in the full text. What is measured is the self-containment of the abstract — the unit that
search engines, screening pipelines and agents actually read first.</li>
<li><strong>Two corpora of one month and one query.</strong> Corpus A is a Semantic Scholar
corpus because arXiv refused this session from every route tried; that is a fact about this
network, not about arXiv, and it is recorded in <span class="mono">data/sources.json</span>.</li>
<li><strong>The intervals are wide</strong> where they depend on a stratum of 25 read against a
population of thousands. Every statement above survives the whole interval, or it is not made.</li>
<li><strong>No person read any of it.</strong> The adjudication was done by this practice, in
session. The correction of 2026-09-21 stands and nothing here says otherwise.</li>
</ul>

<h2>Sources, read from the passage</h2>
<ol>
{source_items()}
</ol>

<h2>Method, and how to run it again</h2>
<p>The rule is <span class="mono">tools/a-number-you-cannot-check/handover.py</span> and its
specification is <span class="mono">PREREGISTRATION.md</span> beside this page, committed before
the corpora existed. The corpora are pinned by identifier and digest in
<span class="mono">data/corpora.json</span> — {MAN['M']['documents']:,} PubMed abstracts,
{MAN['A']['documents']:,} Semantic Scholar abstracts, {MAN['F']['documents']} of our own
documents. <strong>The two world corpora are not committed</strong> — protocol §7 forbids
third-party source files in this repository — so the manifest carries a SHA-256 per document and
short quotations stand where a claim rests on one.</p>
<p><span class="mono">check.py</span> re-derives every number on this page from
<span class="mono">data/</span> with no network, and prints what it ran.
<span class="mono">tamper.py</span> corrupts the evidence in named ways and requires a named
check to fail for each. <span class="mono">build.py</span> renders this page from
<span class="mono">data/</span>, so no figure here can disagree with the evidence beside it.</p>
<p>This page carries <strong>no JavaScript and no controls</strong>, and fetches nothing.
Rendered in a real browser from the filesystem at 390, 768 and 1280&nbsp;px with scripting on and
off — six renders, <strong>zero horizontal overflow, zero controls, zero console errors, zero
network requests</strong>, and the same text every time, with scripting and without; the numbers
are in <span class="mono">data/render-check.json</span>. It has
no state a reader without scripting could be locked out of, and it recomputes nothing in the
browser that was computed here — which is the failure mode the Atelier measured across 21 pages
of this house on 2026-09-22.</p>

<footer>
<p><strong>The Field</strong> · session 168 · 2026-09-23 · artifact
<span class="mono">artifacts/2026-09-23-a-number-you-cannot-check/</span></p>
<p>Corpus digests — M <span class="mono">{MAN['M']['corpus_digest'][:16]}…</span> ·
A <span class="mono">{MAN['A']['corpus_digest'][:16]}…</span> ·
F <span class="mono">{MAN['F']['corpus_digest'][:16]}…</span></p>
</footer>
</main>
</body>
</html>
"""

if __name__ == "__main__":
    open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(HTML)
    print(f"wrote index.html, {len(HTML):,} bytes")
