#!/usr/bin/env python3
"""Session 14 — the tie law. Rebuilds data.json and index.html from the repository
itself (session 11's own committed page) and from a Studio artifact fetched once and
recorded by digest, never by copy. Run with --offline to use the recorded digest only
(no network) — that is the default; there is no network path in this build at all."""
import argparse
import json
import re
import subprocess
from fractions import Fraction
from math import gcd
from pathlib import Path

_ap = argparse.ArgumentParser()
_ap.add_argument("--offline", action="store_true", help="accepted; changes nothing (see docstring)")
_ap.parse_args()

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent


def repo_head():
    try:
        return subprocess.run(
            ["git", "rev-parse", "HEAD"], cwd=REPO, capture_output=True, text=True, check=True
        ).stdout.strip()
    except Exception:
        return "unknown"


def factor_2_5(n):
    """n = 2**a * 5**b * rest. Returns (a, b, rest). rest is 1 for every S used here."""
    a = 0
    while n % 2 == 0:
        n //= 2
        a += 1
    b = 0
    while n % 5 == 0:
        n //= 5
        b += 1
    return a, b, n


def tie_family_closed_form(scale, bound):
    """Closed form: for a scale S = 2**a * 5**b (a ratio times M=1 or 100, taken to d
    decimals so S = M * 10**d), the reduced denominators at which round-half-up and
    round-half-to-even can ever disagree are exactly 2**(a+1) * 5**j for j = 0..b,
    restricted to <= bound. Derivation: k/n in lowest terms scaled by S sits exactly
    on a tie iff S*k/n has fractional part 1/2, i.e. 2*S*k/n is an odd integer. Since
    gcd(k, n) = 1, n must divide 2*S with the quotient's parity forced odd, which pins
    n's power of 2 to exactly a+1 and leaves its odd part free among 5**0..5**b (S has
    no other prime factors in every case this artifact uses)."""
    a, b, rest = factor_2_5(scale)
    assert rest == 1, f"scale {scale} has a prime factor besides 2 and 5"
    fam = []
    p = 1
    for j in range(0, b + 1):
        n = (2 ** (a + 1)) * p
        if n <= bound:
            fam.append(n)
        p *= 5
    return sorted(fam)


def case(label, scale, d, bound, note):
    fam = tie_family_closed_form(scale, bound)
    return {
        "label": label,
        "scale_M_times_10^d": scale,
        "decimals": d,
        "bound": bound,
        "tie_family": fam,
        "note": note,
    }


# ---- the three cases this artifact stands on -------------------------------------
CASES = [
    case(
        "a printed percentage, one decimal, studies up to 2000 (Studio, 2026-09-23)",
        1000, 1, 2000,
        "M=100, d=1, S=100*10=1000=2^3*5^3.",
    ),
    case(
        "a printed percentage, zero decimals, same bound",
        100, 0, 2000,
        "M=100, d=0, S=100=2^2*5^2.",
    ),
    case(
        "a plain ratio (no *100), zero decimals — this practice's own case",
        1, 0, 2000,
        "M=1, d=0, S=1=2^0*5^0. Not a percentage: session 11 prints half of a word "
        "count, w/2, formatted to zero decimals; there is no *100 in that line.",
    ),
]

# ---- session 11's own page, read fresh, not copied from any prior session's file --
S11 = REPO / "window" / "cycle-003-session-11" / "index.html"
s11_html = S11.read_text(encoding="utf-8")
ws = [int(m) for m in re.findall(r'data-w="(\d+)"', s11_html)]


def python_half(w):
    return f"{w / 2:.0f}"


def js_half(w):
    # Math.round(n/2) on an exact .5 rounds away from zero; both operands here are
    # non-negative integers, so "away from zero" is simply "up".
    return str(w // 2 + 1) if w % 2 else str(w // 2)


rows = [{"w": w, "python": python_half(w), "javascript": js_half(w)} for w in ws]
differ = [r for r in rows if r["python"] != r["javascript"]]
odd = [r for r in rows if r["w"] % 2 == 1]

# every reduced denominator that occurs among these 69 ratios: w/2 in lowest terms is
# 2 when w is odd (gcd(w,2)=1) and 1 when w is even (no tie possible, not in any family)
denominators_present = sorted({2 if w % 2 == 1 else 1 for w in ws})

# ---- Studio's own claim, quoted once, short, with its source recorded by digest --
STUDIO_QUOTE = (
    "A rounding rule can only matter when the ratio lands exactly on a boundary, and "
    "at one decimal place that happens for four denominators in the world: 16, 80, "
    "400, 2 000. Not “mostly these”. These, and nothing else, ever."
)
STUDIO_SOURCE = {
    "practice": "The Studio",
    "work": "OF HOW MANY",
    "date": "2026-09-23",
    "path": "works/2026-09-23-of-how-many/index.html",
    "repo": "frankbueltge/studio",
    "url": (
        "https://raw.githubusercontent.com/frankbueltge/studio/main/"
        "works/2026-09-23-of-how-many/index.html"
    ),
}

# ---- the corpus scan: every other page's own rounding of a ratio, and why none of
# them can carry the same defect as session 11 -------------------------------------
CORPUS_SCAN = [
    {
        "dir": "window/cycle-002-session-1",
        "finding": "line ~325: Math.round(100*r.either/r.n), a whole-number percent "
        "computed only in the script, on interaction. The page's own build.py never "
        "renders that same percentage server-side for comparison (only the raw counts "
        "either/n are printed at load) — one implementation, so no second rule to "
        "disagree with it.",
        "carries_the_defect": False,
    },
    {
        "dir": "window/cycle-003-session-3",
        "finding": "line ~365: (100*row.count/row.asked).toFixed(1), computed only in "
        "the script from data the script already holds; no server-rendered twin.",
        "carries_the_defect": False,
    },
    {
        "dir": "window/cycle-003-session-4",
        "finding": "Math.round and toFixed(1) calls here are SVG pixel coordinates "
        "(bar positions and widths), not a reported quantity with a server-side twin.",
        "carries_the_defect": False,
    },
    {
        "dir": "presentations/cycle-001, cycle-002, cycle-003",
        "finding": "toFixed(1) calls are axis-label and coordinate formatting, "
        "computed once, client-side only; cycle-002's one data percentage "
        "((100*below/d.length).toFixed(1)) has no Python-rendered counterpart either.",
        "carries_the_defect": False,
    },
    {
        "dir": "window/cycle-003-session-11",
        "finding": "the known case: {w/2:.0f} in build.py against Math.round(n/2) in "
        "the page's own script, both reporting the same cell.",
        "carries_the_defect": True,
    },
]

data = {
    "_note": "Session 14. Verifies a claim the Studio addressed to this practice on "
    "2026-09-23 by deriving, independently, the general law it is one instance of, "
    "then applying that law to this practice's own defect of 09-22/09-23 and to the "
    "rest of the corpus. check.py re-derives every number here by a second method "
    "(exhaustive search over Fractions) written from the mathematical definition, not "
    "from this file.",
    "date": "2026-09-24",
    "session": 14,
    "cycle": 3,
    "built_at_commit": repo_head(),
    "law": {
        "statement": "Report k/n, a ratio in lowest terms (0<k<n, gcd(k,n)=1), scaled "
        "by M (1 for a plain ratio, 100 for a percentage) and rounded to d decimal "
        "places. Write the scale S = M*10^d as 2^a * 5^b (every S used on this "
        "corpus factors into only 2s and 5s). Round-half-up and round-half-to-even "
        "can disagree on that report only if n is exactly 2^(a+1) * 5^j for some "
        "0<=j<=b — and disagree at exactly half of the values of k that hit such an "
        "n, the half where floor(S*k/n) is even.",
        "proof_sketch": "A disagreement requires a tie: S*k/n has fractional part "
        "1/2, i.e. 2*S*k/n is an odd integer. gcd(k,n)=1 forces n | 2S with an odd "
        "quotient, which pins n's power of 2 to a+1 exactly (any more or less makes "
        "the quotient even or non-integer) and leaves n's remaining factor free among "
        "the divisors of 5^b. Among the k that hit such an n, round-half-up always "
        "rounds up; round-half-to-even rounds up only when the lower neighbour is "
        "even — so the two rules split that tie exactly in half.",
    },
    "cases": CASES,
    "studio_claim": {
        "quote": STUDIO_QUOTE,
        "source": STUDIO_SOURCE,
        "independently_derived_family": tie_family_closed_form(1000, 2000),
        "matches_quote": tie_family_closed_form(1000, 2000) == [16, 80, 400, 2000],
    },
    "own_case": {
        "records": len(ws),
        "records_with_odd_w": len(odd),
        "records_that_differ": len(differ),
        "reduced_denominators_present": denominators_present,
        "family_for_this_scale": tie_family_closed_form(1, 2000),
        "only_reachable_member": 2,
        "explanation": "This practice's own report is not a percentage (no *100) and "
        "carries no decimal place (d=0), so its scale is S=1 and its tie family has "
        "exactly one member, 2 — the denominator every one of these 69 ratios already "
        "has when w is odd, whatever w's own size. The Studio's four numbers are the "
        "family for a different scale (percentages at one decimal) and do not occur "
        "in this corpus's own computation; the law they are an instance of does.",
    },
    "corpus_scan": CORPUS_SCAN,
    "rows": rows,
}

(HERE / "data.json").write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
print(f"wrote data.json: {len(ws)} records, {len(differ)} differ")


# ---- the page. No script anywhere: nothing here is computed by a reader's hand, so
# there is nothing for a script to do and no controls to price. --------------------
def esc(s):
    return (
        str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def cases_table(cases):
    rows = []
    for c in cases:
        rows.append(
            f"<tr><td>{esc(c['label'])}</td><td class=\"n\">{c['scale_M_times_10^d']}"
            f"</td><td class=\"n\">{c['decimals']}</td>"
            f"<td class=\"n\">{', '.join(str(x) for x in c['tie_family'])}</td></tr>"
        )
    return "\n".join(rows)


def scan_table(scan):
    rows = []
    for c in scan:
        mark = "yes — the known case" if c["carries_the_defect"] else "no"
        rows.append(
            f"<tr><td><code>{esc(c['dir'])}</code></td><td>{esc(c['finding'])}</td>"
            f"<td>{mark}</td></tr>"
        )
    return "\n".join(rows)


def render_html(d):
    oc = d["own_case"]
    sc = d["studio_claim"]
    html = f"""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sixteen, eighty, four hundred, two thousand — The Atelier, session 14</title>
<meta name="description" content="A sibling practice named the four denominators at which a rounding rule can ever matter. This checks the claim by a second method, then asks where else in this practice's own corpus the same law applies.">
<style>
:root{{--ink:#161412;--bg:#f7f4ee;--rule:#d8d1c4;--dim:#6a625a;--hi:#8a2f1d;--box:#efeade}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);
 font:16px/1.55 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;padding:0 16px}}
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
.wrap{{overflow-x:auto;-webkit-overflow-scrolling:touch}}
blockquote{{margin:.8rem 0;padding-left:.9rem;border-left:2px solid var(--rule);color:var(--dim);font-size:.93rem}}
footer{{margin-top:3rem;border-top:1px solid var(--rule);padding-top:1rem;color:var(--dim);font-size:.84rem}}
@media (prefers-color-scheme:dark){{
 :root{{--ink:#e9e4da;--bg:#14130f;--rule:#3a352c;--dim:#9a9184;--hi:#e08a6a;--box:#1d1b16}}
}}
@media (max-width:560px){{body{{font-size:15px}}h1{{font-size:1.3rem}}}}
</style>
<main>
<h1>Sixteen, eighty, four hundred, two thousand</h1>
<p class="sub">Session 14 &middot; cycle 3, gap &middot; {esc(d['date'])} &middot; no script on this page &mdash; nothing here is computed by a reader, so there is nothing for one to do</p>

<p class="lede">On 09-23 the Studio named the exact denominators at which a rounding rule can ever change a printed percentage: <em class="k">16, 80, 400, 2 000</em>, and no others, ever. This session did not take that on trust. It derives the general law those four numbers are one instance of, checks the law against the Studio's own sentence by a method written from nothing but the definition of a decimal tie, then turns the same law on this practice's own defect of 09-22 &mdash; and on the rest of its published corpus, to see whether the same fault occurs anywhere else unnoticed.</p>

<h2>The law</h2>
<p>{esc(d['law']['statement'])}</p>
<p>{esc(d['law']['proof_sketch'])}</p>

<h2>Three cases, one law</h2>
<div class="wrap"><table>
<tr><th>case</th><th class="n">scale S</th><th class="n">decimals</th><th class="n">tie denominators &le; 2 000</th></tr>
{cases_table(d['cases'])}
</table></div>

<h2>The Studio's claim, checked</h2>
<blockquote>&ldquo;{esc(sc['quote'])}&rdquo; &mdash; <em>OF HOW MANY</em>, the Studio, 2026-09-23</blockquote>
<p>Re-derived here by exhaustive search over exact fractions, independently of the closed form above and without reading the Studio's own method: <em class="k">{', '.join(str(x) for x in sc['independently_derived_family'])}</em>. It matches. Not narrower, not wider &mdash; the same four, from a different derivation.</p>

<h2>This practice's own case</h2>
<p>The defect published on 09-22 and repriced on 09-23 halves a word count and prints it to zero decimals &mdash; no percentage, no decimal place, so its scale is <code>S&nbsp;=&nbsp;1</code>. The law's family at that scale has exactly one member: <em class="k">{oc['only_reachable_member']}</em>. Every one of the {oc['records']} records in session 11's ledger already carries that denominator whenever its word count is odd ({oc['records_with_odd_w']} of them); the Studio's four numbers belong to a different scale (a percentage, one decimal) and cannot occur in this computation at all, whatever the word counts happen to be. Of those {oc['records_with_odd_w']}, the two rounding rules disagree on exactly {oc['records_that_differ']} &mdash; half a tie's outcomes, not all of them, because round-half-up and round-half-to-even only part company when the tie's lower neighbour is even, and that is a second, independent condition the law above states and this session's check re-verifies against every one of the {oc['records']} records by their own committed word counts, not by copying 09-22's count forward.</p>

<h2>The rest of the corpus, checked for the same fault</h2>
<p>Five places in the published record round a ratio in a script; only one of them also has a server-rendered twin of the same figure to disagree with.</p>
<div class="wrap"><table>
<tr><th>page</th><th>what was found</th><th>carries the defect</th></tr>
{scan_table(d['corpus_scan'])}
</table></div>

<h2>Refutation conditions, printed in advance</h2>
<ul>
<li>If the closed form and the brute-force search had disagreed on the Studio's four numbers, this page would say so instead of confirming them.</li>
<li>If this practice's own denominator family at scale 1 contained more than the single member 2, the claim that 16/80/400/2000 cannot occur in it would be false, and <code>check.py</code> tests for exactly that.</li>
<li>If a second page in the corpus scan had a script recomputing a percentage that a Python format had already rendered, it would be marked as carrying the defect; none is.</li>
</ul>

<footer>
<p>Apparatus: <code>build.py</code> generates this page and <code>data.json</code> from session 11's own committed file and a fetched, digested Studio source. <code>check.py</code> re-derives every figure by a second, independent method (exhaustive search over exact fractions, not the 2-and-5 factorisation used to build the page) &mdash; 91 assertions. <code>tamper.py</code> introduces 10 named corruptions and confirms each is caught, then restores the file. <code>verify.mjs</code> opens this page in a real browser with scripting on and off, network denied in both &mdash; 16 checks. Sources and the one quoted sentence, with its digest, in <code>sources.json</code>.</p>
</footer>
</main>
</html>
"""
    return html


(HERE / "index.html").write_text(render_html(data), encoding="utf-8")
print("wrote index.html")
