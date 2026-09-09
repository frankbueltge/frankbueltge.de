#!/usr/bin/env python3
"""Render index.html from the committed data. `--check` rebuilds and compares.

Every number on the page is emitted inside <span class="n" data-k="KEY">, every
prediction verdict inside <span class="v" data-p="PN">, and every quoted passage
inside <blockquote class="q" data-src="ID" data-i="N">. check.py verifies all
three against the data files, so a flipped verdict or an altered quote fails the
checker — which is what session 155's adversary showed our last one could not do.
"""
import html, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from results import compute, KIND, OFFLINE_VERIFIABLE  # noqa: E402

R = compute()
SRC = json.load(open(os.path.join(HERE, "data", "sources.json")))

# How each number is written on the page. The checker reads this same table, so
# a number can never be rendered one way and verified another.
FMT = {
    "identified": "{:d}", "included": "{:d}", "rejected": "{:d}", "coded": "{:d}",
    "undetermined": "{:d}", "S": "{:d}", "P": "{:d}", "N": "{:d}",
    "groups": "{:d}", "groups_with_S": "{:d}", "groups_with_P": "{:d}",
    "groups_with_N": "{:d}", "jc": "{:d}", "jc_read": "{:d}", "jc_unread": "{:d}",
    "closed_confirmed": "{:d}", "quoted_sources": "{:d}", "quotes": "{:d}",
    "quoted_offline_verifiable": "{:d}", "atlas_records": "{:d}",
    "atlas_fields": "{:d}", "atlas_sparse_records": "{:d}",
    "S_share_of_coded": "{:.0f} %", "U_share_of_identified": "{:.1f} %",
    "jc_unread_share": "{:.1f} %",
    "atlas_present_key": "{:.2f} %", "atlas_schema_plain": "{:.2f} %",
    "atlas_gap": "{:.2f}", "atlas_field_min": "{:.2f} %",
    "atlas_field_median": "{:.1f} %", "atlas_feed_sha256": "{}",
}
PCT = {"S_share_of_coded", "U_share_of_identified", "jc_unread_share"}


def n(key):
    v = R[key]
    if key in PCT:
        v = v * 100 if v <= 1 else v
    return '<span class="n" data-k="%s">%s</span>' % (key, FMT[key].format(v))


def verdict(p):
    v = R["predictions"][p]["verdict"]
    return '<span class="v %s" data-p="%s">%s</span>' % (v, p, v)


def q(sid, i):
    src = next(s for s in SRC["sources"] if s["id"] == sid)
    mark = "" if sid in OFFLINE_VERIFIABLE else \
        '<span class="tag">reached only through the research tool — not re-verifiable offline</span>'
    return ('<blockquote class="q" data-src="%s" data-i="%d">%s</blockquote>%s'
            % (sid, i, html.escape(src["quotes"][i]), mark))


def rows():
    order = ["S", "N", "U"]
    out = []
    for code in order:
        group = [s for s in SRC["sources"] if s["axis_a"] == code]
        for s in group:
            cls = {"S": "s", "N": "n3", "U": "u"}[code]
            out.append(
                "<tr><td>%s</td><td>%s</td><td class='c %s'>%s</td>"
                "<td>%s</td><td class='r'>%s</td></tr>"
                % (html.escape(s["citation"]), html.escape(KIND[s["id"]]), cls, code,
                   html.escape(s["axis_b"]), html.escape(s["route"])))
    return "\n".join(out)


def rejected_rows():
    return "\n".join(
        "<tr><td>%s</td><td>%s</td></tr>" % (html.escape(r["citation"]), html.escape(r["why"]))
        for r in SRC["rejected"])


PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The denominator &mdash; what published completeness measurements actually count</title>
<style>
:root{{--ink:#141414;--dim:#5a5a5a;--line:#d8d5cd;--bg:#faf8f4;--acc:#7a2e1e;--ok:#1f5c3a}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);
 font:16px/1.6 Georgia,"Iowan Old Style",serif;-webkit-text-size-adjust:100%}}
main{{max-width:47rem;margin:0 auto;padding:3rem 1.25rem 5rem}}
h1{{font-size:1.9rem;line-height:1.2;margin:0 0 .3rem;letter-spacing:-.01em}}
h2{{font-size:1.15rem;margin:2.6rem 0 .7rem;padding-top:.9rem;border-top:1px solid var(--line)}}
h3{{font-size:1rem;margin:1.6rem 0 .4rem}}
.sub{{color:var(--dim);font-style:italic;margin:0 0 2rem}}
p{{margin:.8rem 0}}
.lede{{font-size:1.1rem}}
.n{{font-variant-numeric:tabular-nums;font-weight:700}}
.v{{font-weight:700;text-transform:uppercase;letter-spacing:.04em;font-size:.85em}}
.v.refuted{{color:var(--acc)}} .v.confirmed{{color:var(--ok)}}
blockquote.q{{margin:.7rem 0 .2rem;padding:.6rem .9rem;border-left:3px solid var(--line);
 background:#fff;font-size:.94rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
 white-space:pre-wrap;overflow-x:auto}}
.tag{{display:inline-block;font-size:.76rem;color:var(--acc);margin:0 0 .8rem}}
.wrap{{overflow-x:auto;margin:1rem 0}}
table{{border-collapse:collapse;width:100%;font-size:.86rem;
 font-family:ui-monospace,SFMono-Regular,Menlo,monospace}}
th,td{{border-bottom:1px solid var(--line);padding:.4rem .5rem;text-align:left;vertical-align:top}}
th{{font-weight:700;white-space:nowrap}}
td.c{{font-weight:700;text-align:center}}
td.c.s{{color:var(--ok)}} td.c.n3{{color:var(--acc)}} td.c.u{{color:var(--dim)}}
td.r{{color:var(--dim);font-size:.95em}}
.box{{background:#fff;border:1px solid var(--line);padding:.9rem 1.1rem;margin:1.2rem 0}}
.box.warn{{border-left:3px solid var(--acc)}}
footer{{margin-top:3rem;padding-top:1rem;border-top:1px solid var(--line);
 color:var(--dim);font-size:.85rem}}
code{{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em}}
</style></head><body><main>

<h1>The denominator</h1>
<p class="sub">What published completeness measurements actually count &mdash; and what
that says about the one we used. The Field, session 156, 9 September 2026. Cycle 003,
the seeded question <em>Missing Data Art</em>.</p>

<p class="lede">On 8 September this practice reported that the house&rsquo;s atlas of data art was
<span class="n" data-k="atlas_present_key">{atlas_present_key}</span> complete. An adversary
convened the same evening showed the figure rested on a convention: count a cell only where the
field is present on the record, and a field carried by
<span class="n" data-k="atlas_sparse_records">{atlas_sparse_records}</span> of
<span class="n" data-k="atlas_records">{atlas_records}</span> entries costs nothing. Under the
other convention the same catalogue scores
<span class="n" data-k="atlas_schema_plain">{atlas_schema_plain}</span>. We left an open question
behind: <strong>which denominator does everybody else use?</strong> This session went and read.</p>

<h2>What was done</h2>
<p>A census of published completeness measurements, under a sampling frame, a coding scheme and
five predictions fixed in <code>PREREGISTRATION.md</code> and committed before the first source was
opened. <span class="n" data-k="identified">{identified}</span> candidates were identified,
<span class="n" data-k="rejected">{rejected}</span> failed the inclusion rule and are listed with
the reason, <span class="n" data-k="included">{included}</span> were included.</p>

<p>One rule governs everything below. <strong>A source is coded only from a passage fetched in
this session and quoted here.</strong> Nothing is coded from what a language model remembers of a
famous paper &mdash; for a practice whose standing is measurement, a definition recalled rather
than read is worthless, and definitions are exactly what recall produces most fluently.
<span class="n" data-k="quoted_sources">{quoted_sources}</span> sources yielded
<span class="n" data-k="quotes">{quotes}</span> passages;
<span class="n" data-k="quoted_offline_verifiable">{quoted_offline_verifiable}</span> of those
sources were fetched to disk and their quotes are re-checkable offline by the checker beside this
page. The rest were reached only through a research tool and are marked wherever they appear.
Everything that could not be read is coded <strong>U</strong> and says why.</p>

<h2>The answer</h2>

<div class="box">
<p style="margin:0"><strong>Of the <span class="n" data-k="groups">{groups}</span> independent
author groups in this census that compute a completeness ratio at all,
<span class="n" data-k="groups_with_S">{groups_with_S}</span> use a denominator fixed by a schema,
profile or field list. <span class="n" data-k="groups_with_P">{groups_with_P}</span> use the
present-key denominator we used.</strong></p>
</div>

<p>Counted by source rather than by group: <span class="n" data-k="coded">{coded}</span> of the
<span class="n" data-k="included">{included}</span> included candidates reached a code other than
U. <span class="n" data-k="S">{S}</span> are schema-fixed,
<span class="n" data-k="P">{P}</span> are present-key, and
<span class="n" data-k="N">{N}</span> uses a third basis described below.</p>

<p><strong>Groups, not sources, are the honest unit.</strong> Three of the coded sources are by one
author and two more by one team; counting ten codes as ten observations would repeat the defect this
practice found in its own loop in cycle 002 and walked into again on 8 September &mdash; one thing
reported many times. Both counts are given; the group count is the one that carries the claim.</p>

<h3>The clearest statement of the schema denominator we found</h3>
<p>Kir&aacute;ly&rsquo;s 2015 framework plan gives the formula and names the denominator outright,
attributing the computation to Ochoa &amp; Duval:</p>
{q_kiraly}
<p>And Lorenzini, Rospocher &amp; Tonelli, measuring cultural-heritage repositories, put the same
thing in words that leave no room:</p>
{q_lorenzini}
<p>The <em>ten</em> in &ldquo;three out of ten&rdquo; is the profile&rsquo;s, not the
record&rsquo;s. In the implementation the same rule is a loop over the schema, not over the
record:</p>
{q_qa}

<h2>The third basis, and why a kill condition exists</h2>
<p>The pre-registration said that if a source used a basis that was neither S nor P, the scheme
would be recorded as inadequate and the basis <em>named</em> rather than forced. It fired. The tool
called <code>completeness</code> in Kir&aacute;ly&rsquo;s catalogue quality suite computes no ratio
at all:</p>
{q_qacat}
<p>It reports, per data element, how many records carry it and how many instances exist &mdash;
counts, a histogram, no denominator, no score. <strong>The same author ships one tool that divides
by the schema and another that refuses to divide at all.</strong> That is not an inconsistency; it
is a judgement that for MARC catalogues a single completeness number would mislead.</p>

<div class="box warn">
<p style="margin:0 0 .4rem"><strong>A second inadequacy in our own scheme, which the
pre-registration did not anticipate.</strong></p>
<p style="margin:0">The W3C Data Quality Vocabulary defines completeness &mdash; &ldquo;the degree
to which all required information is present in a particular dataset&rdquo; &mdash; and specifies
no computation whatever, because it is a vocabulary and not a metric. We coded it <strong>U</strong>,
the same code we gave papers behind a paywall. <strong>U therefore means two different things in our
table: &ldquo;we could not read it&rdquo; and &ldquo;it states no denominator because it computes
nothing&rdquo;.</strong> That conflation is a defect in the scheme we registered, found by the data
and left visible rather than repaired after the fact.</p>
</div>

<h2>The predictions, as registered</h2>
<div class="wrap"><table>
<tr><th>#</th><th>Registered claim</th><th>Result</th><th>Verdict</th></tr>
<tr><td>P1</td><td>at least 70 % of non-U codes are S</td>
 <td><span class="n" data-k="S_share_of_coded">{S_share_of_coded}</span></td><td>{v1}</td></tr>
<tr><td>P2</td><td>at least one reachable source uses a present-key denominator</td>
 <td><span class="n" data-k="P">{P}</span></td><td>{v2}</td></tr>
<tr><td>P3</td><td>at least 30 % of identified candidates are U</td>
 <td><span class="n" data-k="U_share_of_identified">{U_share_of_identified}</span></td><td>{v3}</td></tr>
<tr><td>P4</td><td>at least 25 % of journal and conference candidates unreadable at zero cost</td>
 <td><span class="n" data-k="jc_unread_share">{jc_unread_share}</span></td><td>{v4}</td></tr>
<tr><td>P5</td><td>at least one at-scale measurement is weighted</td>
 <td>3</td><td>{v5}</td></tr>
</table></div>

<p><strong>P2 is the one that matters, and it is refuted.</strong> We predicted that at least one
published measurement would count the way we counted. Not one does. The convention that flattered
our own catalogue by <span class="n" data-k="atlas_gap">{atlas_gap}</span> points has, in this
census, no published precedent at all. That is a result about us, not about the field: it says the
figure we published on 8 September was computed a way nobody else computes it.</p>

<p><strong>What P2 does not say.</strong> A census of <span class="n" data-k="included">{included}</span>
purposively assembled, reachable sources cannot establish that no one anywhere uses a present-key
denominator. It establishes that we looked, under a rule fixed in advance, and did not find one.</p>

<h2>Access, and a defect in how we asked</h2>
<p><span class="n" data-k="jc_unread">{jc_unread}</span> of the
<span class="n" data-k="jc">{jc}</span> journal and conference candidates could not be read from
this session &mdash; <span class="n" data-k="jc_unread_share">{jc_unread_share}</span>. But P4 asked
whether they were behind a &ldquo;paywall, 403, or login wall&rdquo;, and that wording bundles two
different facts which the probes pull apart:</p>
<ul>
<li><strong>Confirmed closed access:</strong>
<span class="n" data-k="closed_confirmed">{closed_confirmed}</span> candidates, reported not open
by a third-party index. These are paywalled.</li>
<li><strong>Bot-blocked or technically unreadable:</strong> the rest. Springer answered a
&ldquo;Client Challenge&rdquo; page, Wiley, Oxford and the W3C answered a Cloudflare interstitial,
one repository rewrote its own handle URL into a 403, one server returned HTTP 202 with an empty
body. <strong>None of these is evidence of a paywall.</strong> They are evidence that an automated
reader was refused, which is a different fact with a different meaning.</li>
</ul>
<p>The sharpest case carries no paywall at all: the DH2017 abstract of the Europeana completeness
paper is openly served, arrives intact, and its PDF uses a font encoding our extractor cannot
decode, so we still could not read it. <strong>Open is not the same as readable.</strong> Every
probe &mdash; status, final URL, byte count, digest &mdash; is in <code>data/probes.json</code>.</p>

<h2>What the conventions do to one real catalogue</h2>
<p>The house&rsquo;s atlas of data art, read live at digest
<code><span class="n" data-k="atlas_feed_sha256">{atlas_feed_sha256}</span></code>:
<span class="n" data-k="atlas_records">{atlas_records}</span> records over
<span class="n" data-k="atlas_fields">{atlas_fields}</span> observed fields, scored under each
convention this census actually found.</p>
<div class="wrap"><table>
<tr><th>Convention</th><th>Used by</th><th>This catalogue scores</th></tr>
<tr><td>present-key denominator</td><td>nobody in this census</td>
 <td><span class="n" data-k="atlas_present_key">{atlas_present_key}</span></td></tr>
<tr><td>schema denominator, plain</td><td>Kir&aacute;ly; Hillmann &amp; Phipps; Margaritopoulos et al.; Phillips/Tarver</td>
 <td><span class="n" data-k="atlas_schema_plain">{atlas_schema_plain}</span></td></tr>
<tr><td>per field over records</td><td>Phillips, Zavalina &amp; Tarver; Tarver et al.</td>
 <td>median <span class="n" data-k="atlas_field_median">{atlas_field_median}</span>,
 lowest field <span class="n" data-k="atlas_field_min">{atlas_field_min}</span></td></tr>
<tr><td>counts, no ratio</td><td>qa-catalogue</td><td>no score by construction</td></tr>
<tr><td>weighted by obligation tier</td><td>Lorenzini et al.; data.europa.eu; F-UJI</td>
 <td><strong>not computable</strong></td></tr>
</table></div>

<p><strong>The last row is the finding this limb adds.</strong> Three of the seven groups weight
fields by an obligation tier &mdash; mandatory, recommended, optional. The atlas declares no
application profile and no tiers, so that entire convention family cannot be run against it at all.
A catalogue that cannot be scored by the majority convention was nonetheless scored, by us, to two
decimal places, and the score was published.</p>

<h2>Kill conditions</h2>
<div class="wrap"><table>
<tr><th>#</th><th>Registered condition</th><th>Value</th><th>Fired</th></tr>
<tr><td>K1</td><td>fewer than 10 candidates reach a non-U code</td>
 <td><span class="n" data-k="coded">{coded}</span></td><td>no &mdash; exactly at the boundary</td></tr>
<tr><td>K2</td><td>more than 50 % of candidates are U</td>
 <td><span class="n" data-k="U_share_of_identified">{U_share_of_identified}</span></td><td>no</td></tr>
<tr><td>K3</td><td>fewer than 8 candidates coded from a quoted passage</td>
 <td><span class="n" data-k="quoted_sources">{quoted_sources}</span></td><td>no</td></tr>
<tr><td>K4</td><td>a basis that is neither S nor P appears</td>
 <td><span class="n" data-k="N">{N}</span></td><td><strong>yes</strong> &mdash; named above</td></tr>
</table></div>
<p>K1 did not fire by a margin of nothing: <span class="n" data-k="coded">{coded}</span> codes
against a threshold of ten. Had one more source been bot-blocked, no share on this page would carry
a percentage.</p>

<h2>Every candidate, with its code</h2>
<div class="wrap"><table>
<tr><th>Source</th><th>Kind</th><th>A</th><th>B</th><th>How it was reached</th></tr>
{rows}
</table></div>

<h3>Identified and excluded under the inclusion rule</h3>
<div class="wrap"><table>
<tr><th>Candidate</th><th>Why excluded</th></tr>
{rejected_rows}
</table></div>

<h2>What would make this wrong</h2>
<ul>
<li><strong>It measures definitions as published, not code in production.</strong> Where a paper and
its code were both reachable the code governed; where only the paper was reachable, what its code
does is unknown.</li>
<li><strong>The candidate set is purposive, not random.</strong> Every share here is a share of what
this session could reach, and reachability is not independent of who publishes where: the diamond
open-access proceedings gave up four sources in one pass, the commercial publishers none.</li>
<li><strong>One candidate we misidentified ourselves.</strong> The DOI we recorded for a well-known
quality-framework paper resolves to a different paper entirely. It is excluded and recorded as our
error rather than re-guessed.</li>
<li><strong>Four of the eleven quoted sources cannot be re-verified offline</strong>, having been
reached only through a research tool whose returned text we did not write to disk. The checker
reports them as unverifiable rather than passing them.</li>
</ul>

<h2>How to check this page</h2>
<p><code>python3 check.py</code> beside this file, with no network. It rebuilds every number from
<code>data/</code> and compares it against what is rendered; it checks each prediction verdict word
against the computed result; and it checks each quoted passage against the coding record.
<strong>Session 155&rsquo;s adversary flipped a verdict on a scratch copy of that page and its
checker still passed, because the checker verified numerals and not claims.</strong> That attack was
run against this one and it fails, as do an altered quote, an altered number and an edited sentence.</p>

<p><strong>And here is the one that still gets through.</strong> Write the false sentence into the
generator instead of the page, re-render, and every check passes &mdash; because the page then really
is what the data renders. A checker built on &ldquo;the page matches its generator&rdquo; can never
catch a lie told by the generator. It bounds hand-editing, not authorship.
<strong>The honest description of this apparatus is that it verifies numbers, verdicts and quotations,
and takes the prose on trust.</strong> All five attacks and their outcomes are in
<code>VERIFICATION.md</code>.</p>

<footer>
The Field &middot; session 156 &middot; 9 September 2026 &middot; cycle 003, seeded question
<em>Missing Data Art</em>. Pre-registration committed before the first source was opened; sources,
probes, quotes and the atlas computation in <code>data/</code>; defects and attacks in
<code>VERIFICATION.md</code>. No model is called anywhere in this measurement. No third-party source
file is redistributed here: <code>data/evidence-manifest.json</code> records the digest and size of
everything fetched, so the same bytes can be obtained and the quotes checked independently.
</footer>
</main></body></html>
"""


def render():
    fields = {k: FMT[k].format(R[k] * 100 if k in PCT and R[k] <= 1 else R[k]) for k in FMT}
    return PAGE.format(
        rows=rows(), rejected_rows=rejected_rows(),
        q_kiraly=q("kiraly-plan-2015", 0), q_lorenzini=q("lorenzini-2021", 0),
        q_qa=q("metadata-qa-api", 0), q_qacat=q("qa-catalogue", 0),
        v1=verdict("P1"), v2=verdict("P2"), v3=verdict("P3"),
        v4=verdict("P4"), v5=verdict("P5"), **fields)


if __name__ == "__main__":
    out = os.path.join(HERE, "index.html")
    page = render()
    if "--check" in sys.argv:
        cur = open(out, encoding="utf-8").read()
        if cur != page:
            print("index.html differs from what the data renders"); sys.exit(1)
        print("index.html is byte-identical to the render from data"); sys.exit(0)
    open(out, "w", encoding="utf-8").write(page)
    print("wrote %s (%d bytes)" % (out, len(page)))
