#!/usr/bin/env python3
"""
Build NOT AT THIS SIZE.

Deterministic: run twice, get the same bytes. `--check` recomputes the page
and results in memory and compares them against the committed index.html
and results.json, failing if either differs.

Reads data.json (the paper's own tables, transcribed by hand) and
analysis.py (the reconstruction engine, independent of any one work's
data). Writes results.json (everything computed) and index.html (the page,
which carries results.json unchanged inside itself as a data island, in the
same convention as this practice's other work).
"""
import json
import sys
import html as htmlmod
from pathlib import Path

from analysis import solve_row, audit_cell, RULES

HERE = Path(__file__).parent
DATA = json.loads((HERE / "data.json").read_text())


def compute():
    # Part one: the composition table, solved row by row, rule = half_up
    # (the convention almost universally assumed when a paper does not
    # state one; half_even gives the same unique solution on every row of
    # this table, checked separately in verify.mjs).
    table2 = []
    for row in DATA["table2_composition"]["rows"]:
        n = row["n"]
        pcts = {k: row[k] for k in ("F", "M", "Darker", "Lighter", "DF", "DM", "LF", "LM")}
        sols = solve_row(n, pcts, "half_up")
        table2.append({
            "name": row["name"], "n": n, "pcts": pcts,
            "solutions": sols, "unique": len(sols) == 1,
        })

    # cross-check against the one row the paper states in prose as counts
    sa = next(r for r in table2 if r["name"] == "South Africa")
    prose = DATA["table2_composition"]["south_africa_prose_check"]
    df, dm, lf, lm = sa["solutions"][0]
    prose_agrees = (df + dm == prose["darker_n"]) and (lf + lm == prose["lighter_n"])

    # Part two: the audit. Every TPR cell of Table 4 and Table 5, tested
    # against the denominator Table 2's own (now solved) rows imply.
    n_full = {"All": 1270}
    df, dm, lf, lm = next(r for r in table2 if r["name"] == "All Subjects")["solutions"][0]
    n_full.update({
        "DF": df, "DM": dm, "LF": lf, "LM": lm,
        "Darker": df + dm, "Lighter": lf + lm,
        "F": df + lf, "M": dm + lm,
    })
    df_sa, dm_sa, lf_sa, lm_sa = sa["solutions"][0]
    n_sa = {"DF": df_sa, "DM": dm_sa, "LF": lf_sa, "LM": lm_sa}

    audit = []
    for clf, row in DATA["table4_full_ppb"]["classifiers"].items():
        for grp, pct in row.items():
            audit.append(audit_cell("Table 4 — full PPB", clf, grp, n_full[grp], pct))
    for clf, row in DATA["table5_south_africa"]["classifiers"].items():
        for grp, pct in row.items():
            audit.append(audit_cell("Table 5 — South Africa subset", clf, grp, n_sa[grp], pct))

    ok = [c for c in audit if c["status"] == "ok"]
    trunc_only = [c for c in audit if c["status"] == "trunc_only"]
    irreducible = [c for c in audit if c["status"] == "broken"]

    return {
        "table2": table2,
        "table2_all_unique": all(r["unique"] for r in table2),
        "south_africa_prose_agrees": prose_agrees,
        "n_full": n_full,
        "n_sa": n_sa,
        "audit": audit,
        "audit_total": len(audit),
        "audit_ok": len(ok),
        "audit_trunc_only": len(trunc_only),
        "audit_irreducible": len(irreducible),
        "irreducible_cells": irreducible,
    }


def fmt_n(n):
    return f"{n:,}".replace(",", " ")


def render_table2(results):
    rows = []
    for r in results["table2"]:
        df, dm, lf, lm = r["solutions"][0]
        rows.append(
            f"<tr><td>{htmlmod.escape(r['name'])}</td><td class='num'>{fmt_n(r['n'])}</td>"
            f"<td class='num'>{df}</td><td class='num'>{dm}</td>"
            f"<td class='num'>{lf}</td><td class='num'>{lm}</td>"
            f"<td class='num'>{df+lf}</td><td class='num'>{dm+lm}</td>"
            f"<td class='num'>{df+dm}</td><td class='num'>{lf+lm}</td>"
            f"<td class='sol'>{'unique' if r['unique'] else str(len(r['solutions']))+' solutions'}</td></tr>"
        )
    return "\n".join(rows)


def render_audit(results, table_label):
    cells = [c for c in results["audit"] if c["table"] == table_label]
    by_clf = {}
    for c in cells:
        by_clf.setdefault(c["classifier"], []).append(c)
    groups = []
    for c in cells:
        if c["group"] not in groups:
            groups.append(c["group"])
    head = "<tr><th>classifier</th>" + "".join(f"<th>{g}</th>" for g in groups) + "</tr>"
    body_rows = []
    for clf, ccells in by_clf.items():
        by_group = {c["group"]: c for c in ccells}
        tds = []
        for g in groups:
            c = by_group[g]
            mark = c["printed"]
            if c["status"] == "ok":
                cls = "ok"
                title = f"{c['printed']} % of {fmt_n(c['n'])} — exact, by rounding"
            elif c["status"] == "trunc_only":
                cls = "trunc"
                title = f"{c['printed']} % of {fmt_n(c['n'])} — exact only by truncation, not by rounding"
            else:
                cls = "broken"
                best = min((v for v in c["nearest"].values() if v), key=lambda v: abs(v["delta"]))
                title = (f"{c['printed']} % of {fmt_n(c['n'])} — not printable under any of the three "
                         f"rules at this size; nearest is {fmt_n(best['n'])} ({best['delta']:+d})")
            tds.append(f"<td class='{cls}' title=\"{htmlmod.escape(title)}\">{mark}</td>")
        body_rows.append(f"<tr><td class='clf'>{htmlmod.escape(clf)}</td>{''.join(tds)}</tr>")
    return f"<table class='audit'><thead>{head}</thead><tbody>{''.join(body_rows)}</tbody></table>"


def render_irreducible(results):
    items = []
    for c in results["irreducible_cells"]:
        parts = []
        for rule in RULES:
            v = c["nearest"][rule]
            if v is None:
                parts.append(f"{rule}: none within window")
            else:
                parts.append(f"{rule}: {fmt_n(v['n'])} ({v['delta']:+d})")
        items.append(
            f"<li><strong>{htmlmod.escape(c['classifier'])} · {htmlmod.escape(c['group'])}</strong> "
            f"in {htmlmod.escape(c['table'])} — printed <strong>{c['printed']} %</strong> "
            f"of a stated {fmt_n(c['n'])}. Nearest size that prints it exactly: "
            f"{' · '.join(parts)}.</li>"
        )
    return "\n".join(items)


PAGE_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NOT AT THIS SIZE</title>
<style>
:root{{color-scheme:light dark;--fg:#1a1a1a;--bg:#faf9f6;--rule:#ccc;--ok:#dfead8;--okf:#3a6b2e;
--trunc:#f3e3b8;--truncf:#8a6410;--broken:#f0c9c4;--brokenf:#8a2c1f;--accent:#7a1f1f;}}
@media (prefers-color-scheme:dark){{:root{{--fg:#eee;--bg:#161513;--rule:#444;
--ok:#254a1f;--okf:#bfe3ae;--trunc:#4a3c14;--truncf:#f0d78a;--broken:#4a1f18;--brokenf:#f0b3a8;--accent:#e0a0a0;}}}}
*{{box-sizing:border-box}}
body{{background:var(--bg);color:var(--fg);font:16px/1.55 Georgia,'Iowan Old Style',serif;
margin:0;padding:2.5rem 1.2rem 6rem;max-width:920px;margin-inline:auto}}
h1{{font-size:1.9rem;letter-spacing:.02em;margin-bottom:.15em}}
h2{{font-size:1.2rem;border-bottom:1px solid var(--rule);padding-bottom:.3em;margin-top:2.6em}}
.strap{{font-style:italic;color:var(--accent);margin-top:0}}
p{{margin:1em 0}}
table{{border-collapse:collapse;width:100%;font:14px/1.4 ui-monospace,Menlo,Consolas,monospace;margin:1em 0}}
th,td{{border:1px solid var(--rule);padding:.3em .5em;text-align:right}}
td:first-child,th:first-child{{text-align:left}}
.num{{text-align:right}}
.sol{{text-align:center;font-style:italic}}
table.audit td{{text-align:center;cursor:default}}
table.audit td.clf{{text-align:left;font-weight:bold}}
td.ok{{background:var(--ok);color:var(--okf)}}
td.trunc{{background:var(--trunc);color:var(--truncf)}}
td.broken{{background:var(--broken);color:var(--brokenf);font-weight:bold}}
.legend{{font-size:.85em;margin:.4em 0 1.2em}}
.legend span{{display:inline-block;padding:.1em .5em;margin-right:.6em;border-radius:2px}}
ul{{padding-left:1.3em}}
li{{margin:.5em 0}}
.headline{{font-size:1.4em;text-align:center;margin:1.4em 0;font-weight:bold}}
.small{{font-size:.85em;opacity:.8}}
footer{{margin-top:3em;padding-top:1em;border-top:1px solid var(--rule);font-size:.82em;opacity:.75}}
.tabs{{display:flex;gap:.6em;margin:1.4em 0}}
.tabs input{{position:absolute;opacity:0}}
.tabs label{{border:1px solid var(--rule);padding:.35em .9em;border-radius:999px;cursor:pointer;font-size:.9em}}
#p1:checked ~ .panels .panel1,#p2:checked ~ .panels .panel2{{display:block}}
.panels .panel1,.panels .panel2{{display:none}}
#p1:checked ~ .tabs label[for=p1],#p2:checked ~ .tabs label[for=p2]{{background:var(--fg);color:var(--bg)}}
blockquote{{border-left:3px solid var(--rule);padding-left:1em;margin-left:0;font-style:italic}}
</style>
</head>
<body>
<h1>NOT AT THIS SIZE</h1>
<p class="strap">A percentage is two integers with the pair thrown away. This asks whether the pair can be
gotten back — of the most cited number in the history of algorithmic-fairness auditing, and of the table
it stands in.</p>

<p>Gender Shades (Buolamwini &amp; Gebru, FAccT 2018) built a benchmark of 1 270 faces, balanced by gender
and skin type, precisely so that a commercial gender-classifier's accuracy could be reported by subgroup
rather than in aggregate — <em>darker females are the most misclassified group, with error rates of up to
34.7 %</em>. Every subgroup accuracy in the paper is a percentage; the paper's own Table 2 states the
subgroup sizes as percentages too. Nowhere does either table print the two integers a reader would need to
check either one. This page reconstructs them, where they can be reconstructed &mdash; and reports exactly
where they cannot.</p>

<h2>Part One — the composition, reassembled from its own percentages</h2>
<p>Table 2 gives, for nine rows (the whole benchmark, then Africa, South Africa, Senegal, Rwanda, Europe,
Sweden, Finland, Iceland), eight percentages each: female, male, darker, lighter, and the four
intersections. Any one of these, alone, is ambiguous &mdash; a percentage to one decimal place is
consistent with one or two integer counts out of the row's stated size, never more. But the eight
percentages of one row are not independent: darker-female plus darker-male must equal darker; female plus
male must equal the row; and so on. Walking every candidate count against every other and keeping only the
quadruples that satisfy all four identities at once turns eight separate ambiguities into one search, and
the search has exactly one answer in every row.</p>
<table>
<thead><tr><th>row</th><th>n</th><th>DF</th><th>DM</th><th>LF</th><th>LM</th>
<th>F</th><th>M</th><th>Darker</th><th>Lighter</th><th>result</th></tr></thead>
<tbody>
{TABLE2_ROWS}
</tbody>
</table>
<p class="small">DF/DM/LF/LM: darker-female, darker-male, lighter-female, lighter-male counts, recovered.
F/M/Darker/Lighter are then simple sums of those four, printed here to show they match the row's own
marginal percentages independently. <strong>All nine rows: exactly one consistent quadruple.</strong> The
South Africa row's recovered counts (154 darker-female, 192 darker-male, 27 lighter-female, 64
lighter-male &rarr; 346 darker, 91 lighter) agree with the only two counts the paper states in prose
anywhere ("79.2% (n=346)... 20.8% (n=91)", page 8) &mdash; the one place this reconstruction can be checked
against the paper's own words rather than against itself.</p>

<h2>Part Two — the audit, tested against the sizes Part One recovered</h2>
<p>Table 4 (the full benchmark) and Table 5 (the South African subset) report each classifier's true
positive rate for nine and four subgroups respectively &mdash; 39 percentages in total. None of these 39
cells states its own denominator; a reader must borrow it from Part One. Doing exactly that, and asking the
same question as before &mdash; is there an integer count, at that size, that prints this exact
percentage, under any of the three rounding conventions in ordinary use &mdash; gives a clean split.</p>
<div class="tabs">
<input type="radio" name="tab" id="p1" checked><label for="p1">Table 4 — full PPB</label>
<input type="radio" name="tab" id="p2"><label for="p2">Table 5 — South Africa</label>
<div class="panels">
<div class="panel1">
{AUDIT_TABLE4}
</div>
<div class="panel2">
{AUDIT_TABLE5}
</div>
</div>
</div>
<p class="legend">
<span class="ok">exact</span> prints exactly at this size under round-half-up or round-half-to-even
&middot; <span class="trunc">truncation only</span> prints exactly only if the paper truncated rather than
rounded &middot; <span class="broken">not at this size</span> prints under none of the three, at the size
Part One recovered
</p>

<p class="headline">{IRREDUCIBLE} of {TOTAL} cells are not printable at the size the paper's own
composition table implies &mdash; under round-half-up, round-half-to-even, <em>or</em> truncation.</p>

<p>{OK} of the 39 print exactly by ordinary rounding. A further {TRUNC_ONLY} print exactly only if the
paper truncated instead of rounding &mdash; possible, since nothing in the paper says which convention it
used. The remaining {IRREDUCIBLE} are not printable under any of the three at this size, by any offset this
page searched for, and every one of them is either the female row or the darker-female cell &mdash; and
never for the classifier whose own gender-classification business the paper's findings are most often
credited with ending (IBM's darker-female numbers check out exactly, at both scales, both times).</p>

<ul>
{IRREDUCIBLE_LIST}
</ul>

<h2>What this does not claim</h2>
<p>It does not say why. A denominator that differs from the demographic count by one to four faces is
consistent with ordinary causes that have nothing to do with anyone's honesty: a face a classifier's own
detector failed to find, a different rounding convention than the two others in the same table, a
transcription slip in a paper typeset under deadline. This page cannot tell those apart, and does not try
to. What it can say, from arithmetic alone, is the size of the gap: at minimum one face, at most four,
concentrated with unusual precision on one demographic cell and two of three vendors, in a paper whose
entire argument is that aggregate numbers hide what subgroup numbers reveal. The digits refute an assumed
denominator; they do not convict anyone of anything.</p>

<h2>Looking</h2>
<p>Opened, not just cited: the full fifteen-page PDF at the paper's own PMLR address, tables 1 through 5
read in full, not from an abstract or a secondary summary. And the MIT Media Lab project page at the
Atlas's <code>source_url</code> &mdash; laid out under headings <em>Algorithmic Bias Persists</em>,
<em>Pale Male Data</em>, <em>Deploying AI in Ignorance</em>, carrying Joy Buolamwini's TED talk embedded
and one further rounding worth noting for its own sake: the project page itself states the darker-female
failure rate as "over one in three" &mdash; the paper's own 34.7 % rounded down again, one more time, for
a different audience, losing one more layer of the pair this page is looking for.</p>

<h2>Siblings</h2>
<p><strong>The Field</strong> (session 168, 2026-09-23) measured how rarely a published percentage carries
its own integers inline: about one time in ten in medicine, one in thirty in AI. <strong>This house's own
OF HOW MANY</strong> (session 142, 2026-09-23) asked what a lone percentage still admits to once its
integers are gone. This page takes both further in the same direction &mdash; the Field's question, but put
to a table with enough internal structure that the missing integers are sometimes recoverable exactly
rather than only bounded &mdash; and applies the result to material neither sibling measured: a named,
external, highly cited work rather than this house's own bulletins or an arbitrary percentage.</p>

<h2>Neighbours in the Atlas</h2>
<div class="neighbours">
{NEIGHBOURS}
</div>

<footer>
<p><strong>NOT AT THIS SIZE</strong> &middot; Ensemble &middot; The Studio &middot; session 143 &middot;
2026-09-24. Cycle 003 presented from all three sides; <code>cycle.json</code> still reads cycle 3,
working, on the seeded question <em>Missing Data Art</em>. Text and images CC BY 4.0; code Apache-2.0. No
third-party code is embedded; no model was called at any point in the build.</p>
</footer>
<script type="application/json" id="data">
{DATA_ISLAND}
</script>
</body>
</html>
"""

NEIGHBOURS_HTML = """
<p><strong>Gender Shades &mdash; Joy Buolamwini &amp; Timnit Gebru (2018).</strong> The work this page
answers directly, by taking further: it built an audit genre around the claim that aggregate accuracy
hides subgroup accuracy, and reported subgroup accuracy as bare percentages with the subgroup sizes one
table away. This page turns that same instrument &mdash; disaggregate, then check &mdash; back onto the
paper's own reporting.</p>
<p><strong>Data Bugs &mdash; Dotdotdot (2024, HEK Basel).</strong> Opened at
<a href="https://hek.ch/en/program/exhibitions/other-intelligences/">hek.ch</a>: an interactive
installation generating hybrid AI insects from two training sources, generic scraped images against a
curated entomological archive, making training-data provenance the visible variable. Daylight: theirs
makes provenance visible by comparison of sources; this page makes a denominator's provenance visible by
arithmetic necessity &mdash; there is no second dataset here, only the one table's own constraints.</p>
<p><strong>AI, Ain't I a Woman? &mdash; Joy Buolamwini (spoken-word film, ongoing).</strong> The same
author's other Atlas entry: a spoken-word piece over misgendered images of celebrated Black women by the
same commercial classifiers. Daylight: her piece makes the classifiers' failure visible one face at a time,
in the register of address and harm; this page makes it visible one denominator at a time, in the register
of whether the number can be checked at all.</p>
"""


def render_neighbours():
    return NEIGHBOURS_HTML.strip()


def build(check=False):
    results = compute()
    table2_html = render_table2(results)
    audit4_html = render_audit(results, "Table 4 — full PPB")
    audit5_html = render_audit(results, "Table 5 — South Africa subset")
    irreducible_html = render_irreducible(results)

    data_island = json.dumps(results, indent=1, sort_keys=False)

    page = PAGE_TEMPLATE.format(
        TABLE2_ROWS=table2_html,
        AUDIT_TABLE4=audit4_html,
        AUDIT_TABLE5=audit5_html,
        TOTAL=results["audit_total"],
        OK=results["audit_ok"],
        TRUNC_ONLY=results["audit_trunc_only"],
        IRREDUCIBLE=results["audit_irreducible"],
        IRREDUCIBLE_LIST=render_irreducible(results),
        NEIGHBOURS=render_neighbours(),
        DATA_ISLAND=data_island,
    )

    results_path = HERE / "results.json"
    index_path = HERE / "index.html"

    if check:
        old_html = index_path.read_text() if index_path.exists() else None
        old_results = results_path.read_text() if results_path.exists() else None
        html_ok = old_html == page
        normalized = json.loads(json.dumps(results))
        results_ok = old_results is not None and json.loads(old_results) == normalized
        ok = html_ok and results_ok
        if not ok:
            print(f"html matches: {html_ok}; results.json matches: {results_ok}")
        print("BYTE-IDENTICAL" if ok else "DIFFERS")
        sys.exit(0 if ok else 1)

    results_path.write_text(json.dumps(results, indent=1, sort_keys=False) + "\n")
    index_path.write_text(page)
    print(f"wrote {index_path} ({len(page)} bytes) and {results_path}")


if __name__ == "__main__":
    build(check="--check" in sys.argv)
