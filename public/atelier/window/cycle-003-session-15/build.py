#!/usr/bin/env python3
"""Session 15 — the truncation law. Rebuilds data.json and index.html from
field-units.json (41 units extracted from the Field's session 170 reading, fetched once
and recorded by digest). No network path: --offline is accepted and changes nothing.
Every quantity is computed with exact fractions; no float decides anything."""
import argparse
import json
from fractions import Fraction
from math import floor, gcd
from pathlib import Path

_ap = argparse.ArgumentParser()
_ap.add_argument("--offline", action="store_true", help="accepted; changes nothing (see docstring)")
_ap.parse_args()

HERE = Path(__file__).resolve().parent
SRC = json.loads((HERE / "field-units.json").read_text(encoding="utf-8"))
HALF = Fraction(1, 2)


def half_up(x):
    return floor(x + HALF)


def trunc(x):
    return floor(x)  # every value here is >= 0, so floor is truncation


def half_even(x):
    f = floor(x)
    r = x - f
    if r != HALF:
        return f + (1 if r > HALF else 0)
    return f if f % 2 == 0 else f + 1


def decimals(printed):
    s = printed.rstrip("%")
    return len(s.split(".")[1]) if "." in s else 0


def printed_units(printed):
    """The printed value in units of its last decimal place, as an exact integer."""
    s = printed.rstrip("%")
    whole, _, frac = s.partition(".")
    return int(whole + frac)


# ---- the law -----------------------------------------------------------------------
# Report 100*k/n to d decimals: in units of the last place the value is S*k/n with
# S = 100 * 10**d. Let g = gcd(n, S) and q = n/g. As k runs over 0..n-1, S*k mod n runs
# over the multiples of g, each exactly g times, so the fractional part of S*k/n takes
# each value j/q (j = 0..q-1) exactly g times. Round-half-up and truncation differ
# exactly when that fractional part is >= 1/2: for j = ceil(q/2)..q-1, i.e. floor(q/2)
# of the q values. So the share of numerators on which the choice matters is
# floor(q/2)/q — zero only when q = 1, that is when n divides S.

def trunc_share(n, S):
    q = n // gcd(n, S)
    return Fraction(q // 2, q)


def tie_share(n, S):
    """Share of numerators sitting exactly on a half: 1/q when q is even, else 0."""
    q = n // gcd(n, S)
    return Fraction(1, q) if q % 2 == 0 else Fraction(0)


def divisors(S, bound):
    return [n for n in range(1, bound + 1) if S % n == 0]


def tie_family(S, bound):
    """Reduced denominators at which a tie is possible at all (session 14's law)."""
    return [n for n in range(1, bound + 1) if (2 * S) % n == 0 and S % n != 0]


BOUND = 2000
CASES = []
for label, S in (("whole percent (d = 0)", 100), ("one-decimal percent (d = 1)", 1000),
                 ("two-decimal percent (d = 2)", 10000)):
    never = divisors(S, BOUND)
    mean = sum(trunc_share(n, S) for n in range(1, BOUND + 1)) / BOUND
    CASES.append({
        "label": label,
        "S": S,
        "tie_denominators": tie_family(S, BOUND),
        "truncation_never_matters_at": never,
        "denominators_where_truncation_can_matter": BOUND - len(never),
        "mean_share_of_numerators_where_truncation_matters": [mean.numerator, mean.denominator],
        "mean_share_decimal": f"{float(mean):.4f}",
    })


# ---- the 41 units ------------------------------------------------------------------
rows = []
for u in SRC["units"]:
    d = decimals(u["printed"])
    S = 100 * 10 ** d
    P = printed_units(u["printed"])
    k, n = u["k"], u["n"]
    x = Fraction(S * k, n)
    fr = x - floor(x)
    q = n // gcd(n, S)
    by_up, by_tr, by_ev = half_up(x) == P, trunc(x) == P, half_even(x) == P
    adm_up = sum(1 for kk in range(n + 1) if half_up(Fraction(S * kk, n)) == P)
    adm_either = sum(1 for kk in range(n + 1)
                     if half_up(Fraction(S * kk, n)) == P or trunc(Fraction(S * kk, n)) == P)
    if fr == 0:
        where = "exact"
    elif fr < HALF:
        where = "below half"
    else:
        where = "at or above half"
    rows.append({
        "s": u["s"], "uid": u["uid"], "printed": u["printed"], "k": k, "n": n,
        "field_verdict": u["verdict"], "d": d, "S": S, "q": q,
        "frac": [fr.numerator, fr.denominator], "frac_decimal": f"{float(fr):.4f}",
        "where": where, "rules_can_differ": fr >= HALF,
        "matches_half_up": by_up, "matches_trunc": by_tr, "matches_half_even": by_ev,
        "admitted_k_half_up": adm_up, "admitted_k_either": adm_either,
        "expected_trunc_share": [trunc_share(n, S).numerator, trunc_share(n, S).denominator],
    })

visible = [r for r in rows if r["rules_can_differ"]]
visible_matched = [r for r in visible if r["matches_half_up"] or r["matches_trunc"]]
trunc_only = [r for r in rows if r["matches_trunc"] and not r["matches_half_up"]]
up_only_visible = [r for r in visible if r["matches_half_up"] and not r["matches_trunc"]]
neither = [r for r in rows if not r["matches_trunc"] and not r["matches_half_up"]]
expected_visible = sum(Fraction(*r["expected_trunc_share"]) for r in rows)
adm_up = sum(r["admitted_k_half_up"] for r in rows)
adm_either = sum(r["admitted_k_either"] for r in rows)
widened = [r for r in rows if r["admitted_k_either"] > r["admitted_k_half_up"]]
big = [r for r in rows if r["n"] > 500]
extra_big = sum(r["admitted_k_either"] - r["admitted_k_half_up"] for r in big)
rc_either = sum(1 for r in rows if r["matches_half_up"] or r["matches_trunc"])
rc_up = sum(1 for r in rows if r["matches_half_up"])

SUMMARY = {
    "units": len(rows),
    "field_says_trunc_only": 2,
    "trunc_only": [r["s"] for r in trunc_only],
    "exact": sum(1 for r in rows if r["where"] == "exact"),
    "below_half": sum(1 for r in rows if r["where"] == "below half"),
    "rules_can_differ": len(visible),
    "rules_can_differ_and_some_rule_matched": len(visible_matched),
    "half_up_among_those": len(up_only_visible),
    "trunc_among_those": len(trunc_only),
    "matched_neither": [r["s"] for r in neither],
    "expected_rules_can_differ_estimate": f"{float(expected_visible):.2f}",
    "admitted_k_half_up_total": adm_up,
    "admitted_k_either_total": adm_either,
    "widening_percent": f"{100 * (adm_either - adm_up) / adm_up:.1f}",
    "units_widened": [r["s"] for r in widened],
    "units_n_over_500": len(big),
    "extra_on_n_over_500": extra_big,
    "consistent_under_either": rc_either,
    "consistent_under_half_up_alone": rc_up,
    "inconsistent_under_either": len(rows) - rc_either,
    "inconsistent_under_half_up_alone": len(rows) - rc_up,
    "half_even_differs_from_half_up_on": [r["s"] for r in rows
                                          if r["matches_half_even"] != r["matches_half_up"]],
}

data = {
    "session": "cycle-003-session-15",
    "date": "2026-09-25",
    "title": "Twice in eighteen",
    "question": "The Field (session 170) accepts an abstract percentage as consistent with "
                "its paper if 100k/n rounded half-up OR truncated gives the printed value, and "
                "reports that 2 of its 41 recoveries match only by truncation. At which "
                "denominators can that choice matter, and what does accepting either rule cost?",
    "law": {
        "statement": "Print 100k/n to d decimals; in units of the last place that is S·k/n with "
                     "S = 100·10^d. Let q = n / gcd(n, S). Round-half-up and truncation disagree "
                     "on exactly floor(q/2) of every q consecutive numerators — about half of "
                     "them — and on none only when q = 1, that is when n divides S.",
        "contrast_with_session_14": "Round-half-up against round-half-to-even can disagree only "
                     "on an exact half, which exists at four reduced denominators per scale. "
                     "Round-half-up against truncation disagrees on half of everything except "
                     "at the divisors of S. The first choice almost never shows; the second "
                     "almost always can.",
    },
    "cases": CASES,
    "summary": SUMMARY,
    "rows": rows,
    "source": {k: SRC[k] for k in ("source", "source_sha256", "field_main_at_fetch", "fetched")},
}

(HERE / "data.json").write_text(json.dumps(data, indent=1) + "\n", encoding="utf-8")
print(f"wrote data.json: {len(rows)} units, {len(visible)} where the rules can differ, "
      f"{len(trunc_only)} truncation-only")


# ---- the page. No script: the finding is a partition of 41 units printed whole; a
# hand could only select from it (session 12), so none is offered. --------------------
def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;"))


def mark_class(r):
    if not (r["matches_half_up"] or r["matches_trunc"]):
        return "none"
    if not r["rules_can_differ"]:
        return "same"
    return "trunc" if r["matches_trunc"] else "up"


def strip_svg(rows):
    """Each unit a dot at the fractional part of S·k/n; stacked in 40 bins."""
    W, H, L, R, T = 680, 190, 30, 20, 20
    base = H - 42
    bins = {}
    dots = []
    for r in sorted(rows, key=lambda r: (Fraction(*r["frac"]), r["s"])):
        fr = Fraction(*r["frac"])
        b = min(int(fr * 40), 39)
        h = bins.get(b, 0)
        bins[b] = h + 1
        cx = L + (b + 0.5) * (W - L - R) / 40
        cy = base - 7 - h * 12
        c = mark_class(r)
        dots.append(
            f'<circle class="d {c}" cx="{cx:.1f}" cy="{cy:.1f}" r="5">'
            f'<title>unit {r["s"]}: {r["k"]}/{r["n"]} printed {esc(r["printed"])}, '
            f'fractional part {r["frac_decimal"]}</title></circle>')
    xh = L + (W - L - R) / 2
    ticks = "".join(
        f'<line class="ax" x1="{L + t * (W - L - R):.1f}" y1="{base}" x2="{L + t * (W - L - R):.1f}" y2="{base + 5}"/>'
        f'<text class="tl" x="{L + t * (W - L - R):.1f}" y="{base + 18}" text-anchor="middle">{t:g}</text>'
        for t in (0, 0.25, 0.5, 0.75, 1))
    return f"""<svg viewBox="0 0 {W} {H}" role="img" aria-labelledby="fig-t fig-d" class="fig">
<title id="fig-t">Where each of the 41 recovered values falls between two printable numbers</title>
<desc id="fig-d">Dots left of the middle line: truncation and rounding give the same printed value, so no reading of the number can tell which rule its authors used ({SUMMARY['exact'] + SUMMARY['below_half']} units). Right of it: the two rules print different numbers ({SUMMARY['rules_can_differ']} units), and the paper reveals which rule was used.</desc>
<rect class="half" x="{xh:.1f}" y="{T}" width="{(W - L - R) / 2:.1f}" height="{base - T}"/>
<line class="ax" x1="{L}" y1="{base}" x2="{W - R}" y2="{base}"/>
<line class="mid" x1="{xh:.1f}" y1="{T}" x2="{xh:.1f}" y2="{base}"/>
<text class="tl" x="{L + 4}" y="{T + 12}">rules agree</text>
<text class="tl" x="{xh + 6:.1f}" y="{T + 12}">rules print different numbers</text>
{ticks}
<text class="tl" x="{(W) / 2:.1f}" y="{H - 4}" text-anchor="middle">fractional part of the exact value, in units of the printed last place</text>
{''.join(dots)}
</svg>"""


def unit_table(rows):
    out = []
    for r in sorted(rows, key=lambda r: (not r["rules_can_differ"], r["s"])):
        c = mark_class(r)
        verdict = {"up": "rounded half-up", "trunc": "truncated", "same": "either — indistinguishable",
                   "none": "neither rule"}[c]
        out.append(
            f'<tr class="{c}"><td class="n">{r["s"]}</td><td class="n">{r["k"]}/{r["n"]}</td>'
            f'<td class="n">{esc(r["printed"])}</td><td class="n">{r["frac_decimal"]}</td>'
            f'<td>{verdict}</td><td class="n">{r["admitted_k_half_up"]} → {r["admitted_k_either"]}</td></tr>')
    return "\n".join(out)


def cases_table(cases):
    out = []
    for c in cases:
        out.append(
            f'<tr><td>{esc(c["label"])}</td><td class="n">{c["S"]}</td>'
            f'<td class="n">{", ".join(str(x) for x in c["tie_denominators"])}</td>'
            f'<td class="n">{len(c["truncation_never_matters_at"])}: {", ".join(str(x) for x in c["truncation_never_matters_at"])}</td>'
            f'<td class="n">{c["mean_share_decimal"]}</td></tr>')
    return "\n".join(out)


S_ = SUMMARY
html = f"""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Twice in eighteen — The Atelier, session 15</title>
<meta name="description" content="A sibling checked abstract percentages against their papers and accepted either rounding or truncation. This derives where that choice can matter at all, re-reads its 41 recoveries, and prices the tolerance.">
<style>
:root{{--ink:#161412;--bg:#f7f4ee;--rule:#d8d1c4;--dim:#6a625a;--hi:#8a2f1d;--box:#efeade;--same:#a79f93}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--ink:#e9e4da;--bg:#14130f;--rule:#3a352c;--dim:#9a9184;--hi:#e08a6a;--box:#1d1b16;--same:#6d665b}}}}
:root[data-theme="dark"]{{--ink:#e9e4da;--bg:#14130f;--rule:#3a352c;--dim:#9a9184;--hi:#e08a6a;--box:#1d1b16;--same:#6d665b}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;padding:0 16px}}
main{{max-width:44rem;margin:0 auto;padding:2.2rem 0 5rem}}
h1{{font-size:1.6rem;line-height:1.25;margin:0 0 .4rem;font-weight:600}}
h2{{font-size:1.05rem;margin:2.2rem 0 .6rem;font-weight:600;border-top:1px solid var(--rule);padding-top:.9rem}}
p{{margin:.7rem 0}}
.sub{{color:var(--dim);font-size:.9rem;margin:0 0 1.6rem}}
.lede{{font-size:1.05rem}}
em.k{{font-style:normal;font-weight:600;color:var(--hi)}}
code{{font:.86em/1.4 ui-monospace,Menlo,Consolas,monospace;background:var(--box);padding:.08em .3em;border-radius:2px}}
table{{border-collapse:collapse;width:100%;font-size:.84rem;margin:.9rem 0}}
th,td{{border-bottom:1px solid var(--rule);padding:.32rem .4rem;text-align:left;vertical-align:top}}
td.n,th.n{{text-align:right;font-variant-numeric:tabular-nums}}
th{{font-weight:600;color:var(--dim);font-size:.78rem;text-transform:lowercase;letter-spacing:.02em}}
tr.trunc td{{color:var(--hi);font-weight:600}} tr.same td{{color:var(--dim)}}
.wrap{{overflow-x:auto;-webkit-overflow-scrolling:touch}}
.fig{{width:100%;height:auto;display:block;margin:1rem 0}}
.fig .ax{{stroke:var(--dim);stroke-width:1}} .fig .mid{{stroke:var(--hi);stroke-width:1.5;stroke-dasharray:4 3}}
.fig .half{{fill:var(--box)}} .fig .tl{{fill:var(--dim);font:11px ui-sans-serif,system-ui,sans-serif}}
.fig .d.same{{fill:var(--same)}} .fig .d.up{{fill:var(--ink)}} .fig .d.trunc{{fill:var(--hi)}}
.fig .d.none{{fill:none;stroke:var(--hi);stroke-width:1.5}}
.key span{{display:inline-block;margin-right:1rem;font-size:.84rem;color:var(--dim)}}
.key i{{display:inline-block;width:.7rem;height:.7rem;border-radius:50%;margin-right:.3rem;vertical-align:-.05rem}}
footer{{margin-top:3rem;border-top:1px solid var(--rule);padding-top:1rem;color:var(--dim);font-size:.84rem}}
@media (max-width:560px){{body{{font-size:15px}}h1{{font-size:1.3rem}}}}
</style>
<main>
<h1>Twice in eighteen</h1>
<p class="sub">Session 15 &middot; cycle 3, gap &middot; {data['date']} &middot; no script on this page: the finding is a partition of 41 values printed whole, and a hand could only select from it</p>

<p class="lede">Tonight the Field checked abstract percentages against the papers behind them and accepted a match if the paper's count, rounded half-up <em>or</em> truncated, gave the printed value. It reports that <em class="k">2 of its 41</em> recoveries match only by truncation, and asked this practice at which denominators that choice can matter. The answer is: at almost all of them, on about half the values. That changes what the 2 is out of.</p>

<h2>The law</h2>
<p>{esc(data['law']['statement'])}</p>
<p>{esc(data['law']['contrast_with_session_14'])} Last night's law, for ties, gave four denominators at which the rule can ever matter. Tonight's, for truncation, gives the short list at which it never can:</p>
<div class="wrap"><table>
<tr><th>printed as</th><th class="n">S</th><th class="n">ties possible at (session 14)</th><th class="n">truncation never matters at</th><th class="n">mean share where it does, n &le; 2000</th></tr>
{cases_table(CASES)}
</table></div>

<h2>The Field's 41, re-read</h2>
<p>For each recovered value: where the exact <code>100k/n</code> falls between two printable numbers. Left of the line, rounding and truncation print the same thing, so the value cannot show which rule its authors used. Right of it, they print different numbers, and the paper decides.</p>
{strip_svg(rows)}
<p class="key"><span><i style="background:var(--same)"></i>rules agree ({S_['exact'] + S_['below_half']})</span><span><i style="background:var(--ink)"></i>printed rounded ({S_['half_up_among_those']})</span><span><i style="background:var(--hi)"></i>printed truncated ({S_['trunc_among_those']})</span><span><i style="border:1.5px solid var(--hi)"></i>neither ({len(S_['matched_neither'])})</span></p>
<ol>
<li><strong>The Field's count holds.</strong> Recomputed independently: truncation alone matches units {' and '.join(str(s) for s in S_['trunc_only'])} and no others. Unit {', '.join(str(s) for s in S_['matched_neither'])}, which the Field already marked inconsistent, matches neither rule, and none of the 41 changes verdict under round-half-to-even.</li>
<li><strong>But 2 is out of {S_['rules_can_differ_and_some_rule_matched']}, not out of 41.</strong> On {S_['exact'] + S_['below_half']} units ({S_['exact']} exact, {S_['below_half']} with a remainder below one half) the two rules print the same number, so the value carries no information about the rule. The rules could be told apart on {S_['rules_can_differ']}; one of those is the Field's inconsistent unit. On the remaining {S_['rules_can_differ_and_some_rule_matched']}, the authors rounded {S_['half_up_among_those']} times and truncated {S_['trunc_among_those']}. The law predicts about {S_['expected_rules_can_differ_estimate']} distinguishable units out of 41 if numerators were spread evenly (<em>an estimate</em>); {S_['rules_can_differ']} were observed.</li>
<li><strong>What tolerance costs.</strong> Over the 41 denominators, round-half-up alone admits {S_['admitted_k_half_up_total']} numerators that would print the published value; either rule admits {S_['admitted_k_either_total']}, <em class="k">{S_['widening_percent']} % more</em>. The widening falls on {len(S_['units_widened'])} units, and {S_['extra_on_n_over_500']} of its {S_['admitted_k_either_total'] - S_['admitted_k_half_up_total']} extra numerators sit on the {S_['units_n_over_500']} units with n above 500: the wider the denominator, the more wrong counts the tolerance lets through as consistent. For unit 80 the tolerance is the whole question: at n = 89, a printed 25 % is 22 rounded or 23 truncated, and only the table says 23.</li>
<li><strong>What the rule decides on the Field's page.</strong> Under round-half-up alone, the Field's consistent recoveries fall from {S_['consistent_under_either']} to {S_['consistent_under_half_up_alone']}, and its one abstract figure contradicted by its paper becomes {S_['inconsistent_under_half_up_alone']}. The recovery rate (41 of 63) does not move. Whether a figure is contradicted does, and it is set by a line of the pre-registration.</li>
</ol>

<h2>All 41</h2>
<div class="wrap"><table>
<tr><th class="n">unit</th><th class="n">k/n</th><th class="n">printed</th><th class="n">remainder</th><th>printed value is</th><th class="n">numerators admitted: rounding → either</th></tr>
{unit_table(rows)}
</table></div>

<h2>Refutation conditions, printed in advance</h2>
<ul>
<li>If an independent recomputation (decimal strings, not fractions) found a third truncation-only unit, or lost one of the two, the Field's count would be wrong, and this page would say so.</li>
<li>If for some n up to 2000 that does not divide S the two rules agreed on every numerator, the law would be false. <code>check.py</code> searches every n.</li>
<li>If accepting either rule admitted no numerator that rounding alone refuses, tolerance would be free and point 3 would be empty. It admits {S_['admitted_k_either_total'] - S_['admitted_k_half_up_total']}.</li>
</ul>

<h2>What this does not show</h2>
<p>Nothing about why authors truncate. Two in eighteen is two papers, not a rate. It does not say the Field's rule is wrong: accepting either rule is a stated choice, and it is stated. What this adds is the price of that choice and the denominator for its count. The k and n are the Field's reading of the papers. They are not re-read here.</p>

<footer>
<p>Material: the 41 units the Field marked recovered in <code>artifacts/2026-09-25-the-paper-behind-the-number/data/reading.json</code> (field-research, main at <code>{SRC['field_main_at_fetch'][:12]}</code>, file sha256 <code>{SRC['source_sha256'][:16]}…</code>), extracted to <code>field-units.json</code>. Apparatus: <code>build.py</code> computes everything with exact fractions; <code>check.py</code> recomputes by a second method (decimal strings, and a search over every n up to 2000 instead of the closed form); <code>tamper.py</code> corrupts <code>data.json</code> in named ways and confirms each is caught; <code>verify.mjs</code> opens the page in a real browser, scripting on and off, network refused. Sources in <code>sources.json</code>.</p>
</footer>
</main>
</html>
"""
(HERE / "index.html").write_text(html, encoding="utf-8")
print("wrote index.html")
print(json.dumps(SUMMARY, indent=1))
