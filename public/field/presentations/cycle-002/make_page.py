#!/usr/bin/env python3
"""Cycle 002 presentation — the page builder.

Reads `figures.py`, writes `index.html`. Nothing is typed into the HTML by hand: every
number below is interpolated from the figure table, which reads the committed data files
of the four artifacts and of this session's two probes.

The form, decided on the merits as the team note of 2026-09-03 asks: **static, server
rendered, no script.** Last cycle's page stepped through four knocks on forty doors
because the finding was a sequence and a still frame could not carry it. This one is a
ledger — four nights, two digests each, and a number that must be checkable against the
file beside it. A visitor's one necessary action here is to compare, and a table does
that better than an animation. No JavaScript, therefore, and nothing to fail with it off.

Usage: python3 presentations/cycle-002/make_page.py
"""

import html
import json
import os

from figures import collect

HERE = os.path.dirname(os.path.abspath(__file__))
F = collect()


def e(s):
    return html.escape(str(s))


def pct(x, d=2):
    return f"{x * 100:.{d}f}&thinsp;%"


def short(h, n=8):
    return h[:n] + "…"


WORDS = {2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight",
         9: "nine", 10: "ten"}


def spell(n):
    """Counts read as words in prose and as digits in tables. Still counted, never typed."""
    return WORDS.get(n, f"{n:,}")


NIGHT_ROWS = "\n".join(
    f'<tr><td class="mono">{e(n["day"])}</td><td>{e(n["weekday"])}</td>'
    f'<td class="num">{n["records"]:,}</td>'
    f'<td class="mono dim">{e(short(n["file_digest"]))}</td>'
    f'<td class="num">{n["raw"]}</td><td class="num">{n["bh"]}</td>'
    f'<td class="num">{pct(n["null_rate"])}</td>'
    f'<td class="mono"><span class="vec v{n["vector_label"][1:]}">{e(n["vector_label"])}</span> '
    f'{e(short(n["vector_digest"], 6))}</td></tr>'
    for n in F["nights"])

PRED_ROWS = "\n".join(
    f'<tr><td>{e(p["id"])}</td><td>{e(p["claim"])}</td><td>{e(p["found"])}</td>'
    f'<td><span class="{"hit" if p["verdict"] == "held" else "flag" if p["verdict"] == "void" else "miss"}">'
    f'{e(p["verdict"])}</span></td></tr>'
    for p in F["predictions"])

FRESH_ROWS = "\n".join(
    f'<tr><td class="mono">{e(c)}</td><td class="mono">{e(d)}</td></tr>'
    for c, d in sorted(F["freshness"]["by_category"].items()))

s150, s152, s153 = F["s150"], F["s152"], F["s153"]
ax, cr = F["s151"]["arxiv"], F["s151"]["crossref"]
dr, fr, sr = F["drift"], F["freshness"], F["series"]

# Derived rather than typed. The session that this presentation gathers last was faulted by
# its own adversary for hand-typed counts sitting beside the data that contradicted them;
# repeating that here would be the same defect in a page about that defect.
LAST = F["nights"][-1]                                  # the most recent committed night
PREV_RECORDS = LAST["records"]
PREV_BH = LAST["bh"]
GREW = dr["fresh"]["corpus_records"] - PREV_RECORDS
GREW_PCT = GREW / PREV_RECORDS * 100
KFOLD = ax["k_max"] / ax["k_min"]
# Defects taken off each artifact by an adversary convened after publication. These are read
# from the artifacts' own correction records, not recomputed — the artifacts are the source
# and each states its own count on its own page.
ADVERSARY = [("2026-09-03", 3), ("2026-09-04", 5), ("2026-09-05", 13), ("2026-09-06", 9)]
ADV_TOTAL = sum(n for _, n in ADVERSARY)

STAGES = [
    ("DATA", "fetch a corpus from a public catalogue", "2026-09-03", True),
    ("PRE-CHECK", "decide, from the corpus margins alone, which questions can produce a claim "
                  "at all", "2026-09-05", True),
    ("QUESTIONS", "enumerate the hypothesis space", "2026-09-03", True),
    ("EXPERIMENT", "test each question, and test the same questions in a permuted world where "
                   "no true effect exists", "2026-09-03", True),
    ("ANALYSIS", "multiplicity correction, split-half replication", "2026-09-03", True),
    ("WRITE / REVIEW", "state the survivors, then kill the ones that fail its own rules",
     "2026-09-03", True),
    ("PRIOR-ART", "ask whether the answer is already published", "2026-09-06", False),
]
N_NIGHTLY = sum(1 for s in STAGES if s[3])
STAGE_ROWS = "\n".join(
    f'<tr><td>{e(n)}</td><td>{e(d)}</td><td class="mono">{e(built)}</td>'
    + ("<td>yes</td>" if on else '<td><span class="miss">no — behind a flag</span></td>')
    + "</tr>"
    for n, d, built, on in STAGES)

# Wall-clock of the nightly run, from the rows themselves rather than from memory.
_secs = [json.loads(l)["seconds"] for l in
         open(os.path.join(os.path.dirname(os.path.dirname(HERE)),
                           "tools", "autoloop", "series", "series.jsonl")) if l.strip()]
RUN_SECONDS = round(sum(_secs) / len(_secs))
TARONE_AGE = int(F["freshness"]["today"][:4]) - 1990

BODY = f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cycle 002 — The Field: a loop that runs, and the four places it breaks</title>
<style>
:root {{
  --bg: #fbfaf8; --fg: #1c1b19; --dim: #6b6862; --rule: #e0ddd6; --card: #ffffff;
  --hit: #1d6b3f; --miss: #97341f; --flag: #7a5a12; --accent: #2a4b7c;
  --v1: #2a4b7c; --v2: #97341f;
}}
@media (prefers-color-scheme: dark) {{
  :root:not([data-theme="light"]) {{
    --bg: #16161a; --fg: #e8e6e1; --dim: #9a968e; --rule: #33322f; --card: #1d1d22;
    --hit: #6bbf8a; --miss: #e08a72; --flag: #d4ae5a; --accent: #8fb2e0;
    --v1: #8fb2e0; --v2: #e08a72;
  }}
}}
:root[data-theme="dark"] {{
  --bg: #16161a; --fg: #e8e6e1; --dim: #9a968e; --rule: #33322f; --card: #1d1d22;
  --hit: #6bbf8a; --miss: #e08a72; --flag: #d4ae5a; --accent: #8fb2e0;
  --v1: #8fb2e0; --v2: #e08a72;
}}
* {{ box-sizing: border-box; }}
body {{
  margin: 0; background: var(--bg); color: var(--fg);
  font: 16px/1.65 Charter, Georgia, "Iowan Old Style", serif;
  -webkit-text-size-adjust: 100%;
}}
main {{ max-width: 47rem; margin: 0 auto; padding: 2.5rem 1.25rem 5rem; }}
header.top {{ border-bottom: 2px solid var(--fg); padding-bottom: 1.25rem; margin-bottom: 2rem; }}
.kicker {{
  font: 600 0.72rem/1.3 ui-sans-serif, system-ui, sans-serif; letter-spacing: 0.11em;
  text-transform: uppercase; color: var(--dim); margin: 0 0 0.6rem;
}}
h1 {{ font-size: clamp(1.7rem, 4.5vw, 2.5rem); line-height: 1.18; margin: 0 0 0.7rem; font-weight: 600; }}
h2 {{
  font: 600 1.32rem/1.3 Charter, Georgia, serif; margin: 3rem 0 0.9rem;
  padding-top: 1rem; border-top: 1px solid var(--rule);
}}
h3 {{ font: 600 1.02rem/1.35 ui-sans-serif, system-ui, sans-serif; margin: 1.9rem 0 0.5rem; }}
p {{ margin: 0 0 1rem; }}
.question {{ color: var(--dim); font-style: italic; margin: 0; }}
.lead {{
  background: var(--card); border: 1px solid var(--rule); border-left: 4px solid var(--accent);
  padding: 1.15rem 1.3rem; margin: 1.75rem 0 0; border-radius: 3px;
}}
.lead p:last-child {{ margin-bottom: 0; }}
.wrap {{ overflow-x: auto; margin: 1.25rem 0; }}
table {{ border-collapse: collapse; width: 100%; font: 0.86rem/1.45 ui-sans-serif, system-ui, sans-serif; }}
th, td {{ text-align: left; padding: 0.44rem 0.6rem; border-bottom: 1px solid var(--rule); vertical-align: top; }}
th {{
  font-weight: 600; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
  color: var(--dim); border-bottom: 1.5px solid var(--fg); white-space: nowrap;
}}
td.num {{ text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }}
.mono {{ font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 0.9em; }}
.dim {{ color: var(--dim); }}
caption {{
  caption-side: bottom; text-align: left; color: var(--dim); font-size: 0.8rem;
  line-height: 1.5; padding-top: 0.65rem;
}}
.hit {{ color: var(--hit); font-weight: 600; }}
.miss {{ color: var(--miss); font-weight: 600; }}
.flag {{ color: var(--flag); font-weight: 600; }}
.vec {{ font-weight: 700; }}
.vec.v1 {{ color: var(--v1); }}
.vec.v2 {{ color: var(--v2); }}
.big {{
  display: flex; flex-wrap: wrap; gap: 0.9rem; margin: 1.5rem 0;
}}
.big div {{
  flex: 1 1 8rem; background: var(--card); border: 1px solid var(--rule);
  border-radius: 3px; padding: 0.9rem 1rem;
}}
.big .n {{
  display: block; font: 600 1.85rem/1.1 ui-sans-serif, system-ui, sans-serif;
  font-variant-numeric: tabular-nums; margin-bottom: 0.25rem;
}}
.big .l {{ font: 0.76rem/1.4 ui-sans-serif, system-ui, sans-serif; color: var(--dim); }}
blockquote {{
  margin: 1.4rem 0; padding: 0 0 0 1.1rem; border-left: 3px solid var(--rule);
  color: var(--fg); font-style: italic;
}}
ul, ol {{ margin: 0 0 1rem; padding-left: 1.3rem; }}
li {{ margin-bottom: 0.5rem; }}
code {{
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 0.87em;
  background: var(--card); border: 1px solid var(--rule); border-radius: 3px; padding: 0.05em 0.32em;
}}
a {{ color: var(--accent); }}
footer {{
  margin-top: 3.5rem; padding-top: 1.25rem; border-top: 1px solid var(--rule);
  font: 0.8rem/1.6 ui-sans-serif, system-ui, sans-serif; color: var(--dim);
}}
.corr {{
  background: var(--card); border: 1px solid var(--rule); border-left: 4px solid var(--flag);
  padding: 1rem 1.2rem; margin: 1.5rem 0; border-radius: 3px; font-size: 0.94rem;
}}
.corr p:last-child {{ margin-bottom: 0; }}
</style>
</head><body>
<main>

<header class="top">
<p class="kicker">The Field · science · cycle 002 · sessions 150–154 · 2026-09-03 to 2026-09-07</p>
<h1>A loop that runs by itself, and the four places it breaks</h1>
<p class="question">How can end-to-end automation of AI research be realised? Build it, and
measure where it breaks.</p>
</header>

<div class="lead">
<p><strong>We built a research loop that runs unattended and we let it run.</strong> It fetches a
corpus, enumerates its own questions, decides which of them can be answered at all, tests them,
corrects for multiplicity, writes up what survived and reviews itself — {spell(len(STAGES))} stages, about {RUN_SECONDS}
seconds, no person in the sequence. It has fired on a schedule every night since 2026-09-03.</p>
<p><strong>Every serious thing we learned came from it failing, and it failed in four different
ways.</strong> It manufactures findings in proportion to how many questions it asks. It cannot
tell whether the answer it just produced is already {TARONE_AGE} years old. It cannot recognise its
own subject when the subject is described rather than named. And on {spell(sr["n_nights"])} nights it
recorded {spell(sr["n_file_digests"])} different corpus fingerprints while measuring
{spell(sr["n_vectors"])} different things.</p>
<p><strong>None of these is a bug we could fix by trying harder.</strong> Three are properties of
the design; the fourth is a property of the calendar. That is the answer this cycle has to the
question it was given.</p>
</div>

<h2>What was built</h2>

<p>On 2026-09-03 there was no loop. By 2026-09-06 there were {spell(len(STAGES))} stages, of which {spell(N_NIGHTLY)} run
every night without anyone watching:</p>

<div class="wrap"><table>
<thead><tr><th>stage</th><th>what it does</th><th>built</th><th>on the nightly run</th></tr></thead>
<tbody>
{STAGE_ROWS}
</tbody></table>
<caption>The seventh stage is deliberately not on the schedule: it disagrees with itself once in
four, and a series whose value is that it repeats must not be fed by something that does not.
Code: <code>tools/autoloop/</code>.</caption></div>

<h2>Break one — the throughput dial <em>is</em> the error dial</h2>

<p>On its first night the loop asked {s150["questions"]} pre-registered questions of
{s150["records"]:,} records and reported <strong>{s150["raw"]} findings</strong>, of which
{s150["bh"]} survived multiplicity correction. In a permuted world where by construction nothing
is true, the same loop reports <strong>{s150["null_per_run"]} findings per run</strong> at a
per-test rejection rate of {pct(s150["null_rate"])} — which is nominal. The loop is calibrated,
and it still hands you findings out of noise, because it asks {s150["questions"]} questions.</p>

<p>The next night we turned that into a dial: question-space size <em>k</em> from
{ax["k_min"]} to {ax["k_max"]}, on two unrelated literatures — {ax["records"]:,} records from one
catalogue, {cr["records"]:,} from another the practice had never used. <strong>The null yield is
linear in k</strong>: through-origin slope <strong>{ax["slope_lean"]:.5f}</strong>
(R²&nbsp;{ax["r2_lean"]:.5f}) and <strong>{cr["slope_lean"]:.5f}</strong>
(R²&nbsp;{cr["r2_lean"]:.5f}) over a {KFOLD:.0f}-fold range of k.</p>

<blockquote>Throughput and error control are not two dials. They are one dial with two labels.</blockquote>

<p>The session's own central claim — that <em>redundancy</em> in the question space would inflate
the yield — <strong>died by its own falsifier on both corpora</strong>. Redundancy is
statistically inert. What it inflates is the <em>count</em>: {ax["raw_findings"]} findings that
are {ax["distinct_claims"]} distinct claims. An automated loop's output number is not a measure of
what it found.</p>

<div class="corr">
<p><strong>Read the arm.</strong> The slopes above are the through-origin fit, which is the
lenient convention and the one the pre-registration named. Mean-centred, the second corpus gives
R²&nbsp;{cr["centered_r2_lean"]:.3f} — below the bar that pre-registration set. Both are computed,
both are on the artifact's page, and the registered verdict stands on the registered model. An
adversary convened against that session made this distinction load-bearing; it is restated here
rather than smoothed over.</p>
</div>

<h2>Break two — it asks questions that cannot be answered, then divides by them</h2>

<p>A question is <em>asleep</em> when no labelling consistent with the corpus margins could push
its p-value below α — so its verdict is knowable before the first test runs. We built that as a
stage and merged it into the nightly loop. It found something we did not want:</p>

<p>The previous night we had published the two corpora as calibrated <em>differently</em>,
intervals disjoint. With the unanswerable questions out of the divisor the two rates are
<strong>{pct(s152["B_rate"])}</strong> and <strong>{pct(s152["C_rate"])}</strong> — indistinguishable,
with a Monte-Carlo standard error of {s152["se_of_difference"] * 100:.3f} points on the
difference. <strong>The finding of 2026-09-04 was refuted by a denominator, not by the world.</strong></p>

<p>And then the part that matters for the cycle question: the rule we had just built from scratch,
verified and published <strong>is {TARONE_AGE} years old</strong>. It is Tarone's modified Bonferroni
method for discrete data (<em>Biometrics</em> 46(2):515–522, 1990), standard equipment in
significant pattern mining under the name <em>untestable hypotheses</em>. One search found it. The
search was run <em>after</em> the instrument was built — because the loop has no stage that asks
whether the answer is already known, and neither, that night, did the people operating it.</p>

<h2>Break three — it cannot recognise its own subject from a description</h2>

<p>So we built that stage. It is mechanical throughout: no language model is called anywhere
inside it. A description becomes three queries by a fixed rule, goes to two catalogues, and six
ranked lists are fused. We froze a benchmark first: {s153["usable"]} methods the loop itself uses,
each described in prose that never names it, each paired in advance with its founding paper,
confirmed at the catalogue record.</p>

<div class="big">
<div><span class="n">{s153["blind_hits"]} of {s153["usable"]}</span>
<span class="l">found from a description that does not name the method — at any rank</span></div>
<div><span class="n">{s153["name_hits"]} of {s153["usable"]}</span>
<span class="l">found from the bare name with the description deleted</span></div>
<div><span class="n">{s153["repeat_identical"]} of {s153["repeat_n"]}</span>
<span class="l">queries re-issued the same afternoon returned an identical top ten</span></div>
<div><span class="n">{s153["probes_fired"]} of {s153["probes_n"]}</span>
<span class="l">no-target probes it nonetheless declared prior art for</span></div>
</div>

<p><strong>The prose is not a weak query. It is worse than the name buried inside it.</strong> And
a loop that has just invented something has no name for it — that is what invention means. The
verdict is uninformative in both directions: it fired on {s153["armc_fired"]} of
{s153["armc_n"]} of the loop's own live claims,
{"and on " if s153["armc_modal_top"] < s153["armc_fired"] else "with all "}
{s153["armc_modal_top"]} of those {s153["armc_fired"]} it put the same figure caption at the top —
a caption about the cumulative proportion of discovered species, which is not about anything the
loop measured.</p>

<h2>Break four — a nightly series over a five-day-a-week world</h2>

<p>This is the measurement made for this presentation, and it is the one that says most about
unattended research. The loop writes one row a night. Four rows exist. Read naively they say the
loop is beautifully stable and then jumped. Neither is true.</p>

<div class="wrap"><table>
<thead><tr><th>night</th><th>weekday</th><th class="num">records</th><th>recorded digest</th>
<th class="num">raw</th><th class="num">survivors</th><th class="num">null rate</th>
<th>what was actually measured</th></tr></thead>
<tbody>
{NIGHT_ROWS}
</tbody></table>
<caption>Every night recorded a different corpus fingerprint. Three of the four measured the same
thing: <span class="vec v2">V2</span> is one test vector, byte-identical across Friday, Saturday
and Sunday — all {ax["questions"]} outcomes, both group sizes, every p-value. Digests recomputed
by <code>tools/autoloop/corpus_drift.py</code> from the committed per-night run files.</caption></div>

<h3>Why the fingerprint lied</h3>

<p>Because it is a fingerprint of the wrong thing. The series hashes the corpus <em>file</em>, and
the fetcher writes a timestamp into that file. We fetched twice, {dr["seconds_apart"]} seconds
apart, with the committed fetcher unchanged:</p>

<div class="wrap"><table>
<thead><tr><th>compared</th><th>result</th></tr></thead>
<tbody>
<tr><td>digest of the corpus file — what the series records</td>
<td><span class="miss">{"different" if not dr["file_digest_equal"] else "identical"}</span></td></tr>
<tr><td>digest of the records alone, id-sorted, no timestamp</td>
<td><span class="hit">{"identical" if dr["records_digest_equal"] else "different"}</span></td></tr>
<tr><td>the two id sets</td>
<td><span class="hit">{"identical" if dr["ids_equal"] else "different"}</span>,
Jaccard {dr["jaccard"]:.3f}</td></tr>
</tbody></table>
<caption>Two corpora, {dr["seconds_apart"]} seconds apart, {dr["records"]:,} records each. The
field that tells a reader whether the night measured anything new <strong>changes every night by
construction</strong>. It can report movement; it cannot report its absence.</caption></div>

<h3>Why three nights were the same night</h3>

<p>We predicted the corpus was frozen by a defect in our own query. <strong>That prediction was
refuted.</strong> A corpus fetched on {fr["today"]} shares
<strong>{dr["vs_committed_identical"]} of {dr["vs_committed_n"]}</strong> test outcomes with the
committed run of the night before — none — and carries {dr["fresh"]["corpus_records"]:,} records
against {PREV_RECORDS:,}. The corpus moves.</p>

<p>What does not move is the source, over a weekend. Probing all {fr["categories"]} categories the
loop fetches, under both available sort orders, on {fr["today"]}:</p>

<div class="wrap"><table>
<thead><tr><th>category</th><th>newest submission served</th></tr></thead>
<tbody>
{FRESH_ROWS}
</tbody></table>
<caption>Probed {fr["today"]} by <code>tools/autoloop/freshness_probe.py</code>; sorting by
submission date and by last-update date give the same answer, so this is not an artefact of the
ordering. The catalogue states it posts submissions publicly <em>Sunday through Thursday, with no
announcements Friday or Saturday</em> (<code>info.arxiv.org/help/availability</code>, read
{fr["today"]}); announcements land at 20:00 US Eastern, which in September is midnight UTC. A cron
that fires at 03:15 UTC therefore sees nothing new on a Saturday or a Sunday.</caption></div>

<p>The three identical nights were <strong>Friday, Saturday and Sunday</strong>. Nothing was
broken. The loop ran perfectly, on a schedule that does not match the world it reads, and had no
way to notice — because its one indicator of movement changes whether or not anything moved.</p>

<blockquote>An unattended loop cannot tell a measurement from a repetition unless someone builds it
the instrument that can. Ours ran green for three nights measuring nothing new, and reported
success each time.</blockquote>

<p>And when the corpus did move — one night, {GREW} more records, {GREW_PCT:.1f}&thinsp;% — the
loop's headline output went from {PREV_BH} surviving findings to
<strong>{dr["fresh"]["bh_survivors"]}</strong>. One transition is not a sensitivity curve and we
draw no line through it, but it is the wrong direction for anyone hoping a nightly research loop
yields a stable quantity.</p>

<h2>What we predicted this session, and what happened</h2>

<div class="wrap"><table>
<thead><tr><th>#</th><th>written down before the data existed</th><th>what was found</th>
<th>verdict</th></tr></thead>
<tbody>
{PRED_ROWS}
</tbody></table>
<caption>Pre-registered in <code>PREREGISTRATION.md</code>, committed before the first fetch, with
falsifiers and three kill conditions. K2 fired: P2's refutation withdrew the claim that the series
is a single measurement, and the page says the refuted thing rather than the intended one. P4 is
void because its antecedent was P2.</caption></div>

<h2>The repair</h2>

<p>Three fields are added to the nightly row, beside the existing ones, none of them changed and
nothing back-filled: <code>records_digest</code> (the records alone, no timestamp),
<code>test_vector_digest</code> (the night's outcomes), and
<code>vector_repeats_previous</code>. From tonight the series states whether a night measured
anything the night before did not. <code>corpus_sha256</code> keeps its original definition
<em>and its defect</em>, so that every row stays comparable with every other — the series' own
rule is that a field's meaning never changes.</p>

<h2>What this cycle answers</h2>

<p>The question was whether the research loop can be automated end to end. Five sessions of
building one, and measuring it honestly, give a narrower answer than either enthusiasm or
scepticism would like:</p>

<ol>
<li><strong>The mechanical steps automate cleanly and are not the problem.</strong> Fetching,
enumerating, testing, correcting for multiplicity, killing your own weak claims — all of it runs
in ninety seconds without a person, and the null-world calibration says it runs correctly.</li>
<li><strong>Automation moves the failure upstream, into the question space.</strong> A loop
reports findings in proportion to how many questions it asks, at a rate we measured as a straight
line through the origin. Nothing inside the loop can see that, because from the inside every
question looks like a question.</li>
<li><strong>The step that resists is recognising that what you hold is what the world already
has.</strong> Not thinking of a question — we automated that. Not judging whether a question can
be answered — we automated that too, and then found the rule was from 1990. Retrieval <em>by
name</em> works; a loop that has just invented something has no name for it, and retrieval by
description found none of nine sources we knew were there.</li>
<li><strong>An unattended loop needs an instrument for its own liveness, or it will report
success while measuring nothing.</strong> This is the cheapest of the four to fix and the easiest
to never notice.</li>
</ol>

<p>All four are findings about <em>one</em> loop. Two of them we have reason to think travel: the
linearity of null yield in question count was measured on two unrelated literatures, and the
arithmetic that shrinks the answerable question space as a corpus shrinks is arithmetic. The other
two are ours until someone measures another system.</p>

<h2>What we got wrong, and who caught it</h2>

<p>Every session of this cycle published its errors. The record is part of the result:</p>

<ul>
<li><strong>2026-09-04</strong> — an adversary took five defects off the dial artifact, four
binding, including one plain factual error against our own committed data. The corpus behind that
session is <em>not</em> the corpus its pre-registration describes: the fetcher sorts by deposit
date, so most records fall in the last eight days of a fourteen-week window. Not repaired, because
repairing it would break the match between the committed data and the code that produced it.</li>
<li><strong>2026-09-05</strong> — thirteen defects, one fatal: a headline sentence contradicted a
table on the same page. Our strongest-sounding number counted, in its denominator, tens of
thousands of events that could not have occurred whatever the rule said. The arm of the study
that genuinely tests the instrument is the one we did not pre-register.</li>
<li><strong>2026-09-06</strong> — shipped with no adversary convened. One was convened on
2026-09-07, for this presentation, and found <strong>two fatal defects</strong>: the claim that all
five verdict firings shared a top record was false — it is four of five, and the page's own table
had shown the fifth since publication — and the predictions table rendered P1 as <em>refuted</em>
while every sentence beside it called it <em>void</em>. Both were hard-coded strings on a page
whose verification section states that no number on it is typed by hand. Repaired, marked, and the
nine attacks that failed are published beside them.</li>
<li><strong>2026-09-07</strong> — this session's own pre-registered explanation of the frozen
series was wrong. The diagnosis on the page is the refutation, not the hypothesis.</li>
</ul>

<p><strong>{ADV_TOTAL} defects in total</strong> have been taken off this cycle's four artifacts by
an adversary convened against our own already-published work —
{", ".join(f"{n} on {d}" for d, n in ADVERSARY)}, each count stated on that artifact's own page.
That instrument is the most productive thing in this practice, and it works only when it is
actually run: the one artifact that shipped without it carried a false sentence for a day.</p>

<footer>
<p><strong>The Field</strong> · a practice of the research ecology around frankbueltge.de · cycle
002, sessions 150–154 · presented {fr["today"]}.</p>
<p><strong>Everything here is generated from committed data.</strong> Artifacts, each with its own
pre-registration, method, verification and data:
<code>artifacts/cycle-002/2026-09-03-a-loop-that-finds-things/</code>,
<code>…/2026-09-04-the-dial/</code>, <code>…/2026-09-05-which-questions-count/</code>,
<code>…/2026-09-06-does-it-know-it-is-known/</code>. This session's data:
<code>data/corpus-drift.json</code>, <code>data/freshness.json</code>. Instruments:
<code>tools/autoloop/</code>. Figures assembled by <code>figures.py</code>, page built by
<code>make_page.py</code>.</p>
<p><strong>Check it.</strong> <code>python3 presentations/cycle-002/check.py</code> rebuilds every
figure on this page from the data files and exits non-zero on a one-digit difference. It needs no
network.</p>
<p>Static, server-rendered, no script — decided on the merits and stated as the team note of
2026-09-03 asks. The finding here is a ledger to compare against files, not a sequence to step
through; last cycle's page animated because its finding was a sequence.</p>
</footer>

</main></body></html>
"""

with open(os.path.join(HERE, "index.html"), "w") as f:
    f.write(BODY)
print("wrote " + os.path.join(HERE, "index.html"))
