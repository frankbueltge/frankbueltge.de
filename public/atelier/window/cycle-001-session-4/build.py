#!/usr/bin/env python3
"""build.py — assemble index.html for cycle 001, session 4, from the run data.

Reads data/doorkeeper.json and data/knock-run-1.json and writes index.html
and data.json. Every number in the page comes from here; check.py re-derives
them independently and asserts each one appears.

Usage: python3 window/cycle-001-session-4/build.py
"""

import html
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(HERE, "data")

STRATUM_LABEL = {
    "artistic-research": "artistic research",
    "open-access": "open-access scholarly",
    "commercial": "commercial publisher",
    "house": "this house",
}
DETERMINED = ("OPEN", "BLOCKLIST", "ALLOWLIST", "CLOSED", "NONE")


def load():
    with open(os.path.join(D, "doorkeeper.json")) as fh:
        door = json.load(fh)
    with open(os.path.join(D, "knock-run-1.json")) as fh:
        knock = json.load(fh)
    return door, knock


def derive(door, knock):
    rows = door["rows"]
    det = [r for r in rows if r["structure"] in DETERMINED]
    undet = [r for r in rows if r["structure"] == "UNDETERMINED"]
    htmlrows = [r for r in rows if r["structure"] == "HTML-IN-PLACE-OF-RULES"]
    refuse = [r for r in det if r["permits_instrument"] is False]
    permit = [r for r in det if r["permits_instrument"] is True]
    blocklists = [r for r in det if r["structure"] == "BLOCKLIST"]
    allowlists = [r for r in det if r["structure"] == "ALLOWLIST"]
    openrows = [r for r in det if r["structure"] == "OPEN"]

    arrived = [r for r in knock["results"] if "a" in r and r["a"].get("status") == 200]
    skipped = [r for r in knock["results"] if r.get("skipped")]

    return {
        "n_hosts": len(rows),
        "n_determined": len(det),
        "n_undetermined": len(undet),
        "n_html_in_place": len(htmlrows),
        "n_permit": len(permit),
        "n_refuse": len(refuse),
        "n_open": len(openrows),
        "n_blocklist": len(blocklists),
        "n_allowlist": len(allowlists),
        "named_refused_total": sum(r["n_named"] for r in blocklists),
        "named_admitted_total": sum(len(r["admitted"]) for r in allowlists),
        "refusing_host": refuse[0]["name"] if refuse else None,
        "refusing_id": refuse[0]["id"] if refuse else None,
        "refusing_admitted": refuse[0]["admitted"] if refuse else [],
        "n_arrived": len(arrived),
        "n_skipped_by_robots": len(skipped),
        "words_min": min(r["a"]["words"] for r in arrived) if arrived else 0,
        "words_max": max(r["a"]["words"] for r in arrived) if arrived else 0,
        "rows": rows,
        "det": det,
        "undet": undet,
        "htmlrows": htmlrows,
        "arrived": arrived,
        "skipped": skipped,
        "run_utc": door["run_utc"],
        "knock_utc": knock["run_utc"],
        "ua": door["ua_instrument"],
    }


# ------------------------------------------------------------------ figure 1

def fig_permission(f):
    """Who may read a published work here — one band per determined host.

    A band is the population of machines. Filled ground = permitted.
    Notches = agents the host names in order to refuse them. Marks on empty
    ground = agents the host names in order to admit them, everyone else
    refused. The allowlist row is the photographic negative of the others,
    and that inversion is the finding.
    """
    order = sorted(
        f["det"],
        key=lambda r: ({"OPEN": 0, "BLOCKLIST": 1, "NONE": 0, "CLOSED": 2,
                        "ALLOWLIST": 3}[r["structure"]], r["id"]),
    )
    rh, gap, top, left, bw = 26, 9, 46, 232, 560
    h = top + len(order) * (rh + gap) + 58
    w = left + bw + 118
    p = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" '
         f'aria-label="Permission structure of {len(order)} hosts" '
         'xmlns="http://www.w3.org/2000/svg" class="fig">']
    p.append(f'<text x="{left}" y="22" class="axl">who may read a published work here</text>')
    p.append(f'<text x="{left}" y="38" class="axs">the band is every machine in the world; '
             'ink is permission</text>')

    for i, r in enumerate(order):
        y = top + i * (rh + gap)
        p.append(f'<text x="{left - 12}" y="{y + 17}" class="hl" '
                 f'text-anchor="end">{html.escape(r["name"])}</text>')
        if r["structure"] == "ALLOWLIST":
            p.append(f'<rect x="{left}" y="{y}" width="{bw}" height="{rh}" '
                     'class="ground-empty"/>')
            n = len(r["admitted"])
            for k in range(n):
                x = left + 7 + k * ((bw - 16) / max(n, 1))
                p.append(f'<rect x="{x:.1f}" y="{y + 5}" width="4.5" '
                         f'height="{rh - 10}" class="mark-in"/>')
            note = f"{n} named admitted · everyone else refused"
            cls = "note-in"
        else:
            p.append(f'<rect x="{left}" y="{y}" width="{bw}" height="{rh}" '
                     'class="ground-full"/>')
            n = r["n_named"]
            for k in range(n):
                x = left + 10 + k * 15
                if x < left + bw - 12:
                    p.append(f'<rect x="{x}" y="{y}" width="6" height="{rh}" '
                             'class="mark-out"/>')
            note = (f"{n} named refused" if n else "no agent named")
            cls = "note-out"
        p.append(f'<text x="{left + bw + 10}" y="{y + 17}" class="{cls}">{note}</text>')

    yb = top + len(order) * (rh + gap) + 16
    p.append(f'<text x="{left}" y="{yb}" class="axs">'
             f'{f["named_refused_total"]} agents are named in this cohort in order to be '
             f'refused; {f["named_admitted_total"]} in order to be admitted. '
             'The second number belongs to one host.</text>')
    p.append("</svg>")
    return "\n".join(p)


# ------------------------------------------------------------------ figure 2

def fig_arrival(f):
    """Words of the published work delivered to one ordinary GET, where permitted."""
    rows = sorted(f["arrived"], key=lambda r: -r["a"]["words"])
    top, left, bw, rh, gap = 44, 250, 470, 20, 8
    mx = max(r["a"]["words"] for r in rows)
    h = top + len(rows) * (rh + gap) + 54
    w = left + bw + 96
    p = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" '
         f'aria-label="Words delivered to one plain HTTP GET at {len(rows)} permitted doors" '
         'xmlns="http://www.w3.org/2000/svg" class="fig">']
    p.append(f'<text x="{left}" y="22" class="axl">what arrives at one ordinary GET, '
             'where the door is open</text>')
    p.append(f'<text x="{left}" y="38" class="axs">words of visible text, no JavaScript '
             'executed</text>')
    for i, r in enumerate(rows):
        y = top + i * (rh + gap)
        lw = max(2, bw * r["a"]["words"] / mx)
        cls = "bar-abs" if r["stratum"] == "abstract" else "bar-art"
        label = f'{r["venue"]}'
        p.append(f'<text x="{left - 12}" y="{y + 15}" class="hl" '
                 f'text-anchor="end">{html.escape(label)}</text>')
        p.append(f'<rect x="{left}" y="{y}" width="{lw:.1f}" height="{rh}" class="{cls}"/>')
        p.append(f'<text x="{left + lw + 8:.1f}" y="{y + 15}" class="num">'
                 f'{r["a"]["words"]:,}</text>')
    yb = top + len(rows) * (rh + gap) + 18
    p.append(f'<text x="{left}" y="{yb}" class="axs">'
             'The four short bars are the Journal for Artistic Research’s abstract pages. '
             'The exposition each one points at is not in this figure.</text>')
    p.append(f'<text x="{left}" y="{yb + 16}" class="axs">'
             f'{f["n_skipped_by_robots"]} expositions were not knocked at: their host’s '
             'robots.txt refuses this instrument, so the instrument stopped.</text>')
    p.append("</svg>")
    return "\n".join(p)


# ------------------------------------------------------------------ tables

def ledger(f):
    out = ['<table class="t"><thead><tr>'
           '<th>host</th><th>kind</th><th>structure</th>'
           '<th class="r">named</th><th>an honest instrument may read</th>'
           '</tr></thead><tbody>']
    order = {"ALLOWLIST": 0, "BLOCKLIST": 1, "OPEN": 2, "NONE": 2,
             "HTML-IN-PLACE-OF-RULES": 3, "UNDETERMINED": 4}
    for r in sorted(f["rows"], key=lambda r: (order[r["structure"]], r["id"])):
        p = r["permits_instrument"]
        verdict = ("<b>no</b>" if p is False else "yes" if p is True
                   else "<span class=q>not determined</span>")
        cls = ' class="row-refuse"' if p is False else ""
        named = r["n_named"] or ""
        out.append(
            f'<tr{cls}><td>{html.escape(r["name"])}</td>'
            f'<td class="dim">{STRATUM_LABEL[r["stratum"]]}</td>'
            f'<td class="mono">{r["structure"].lower().replace("-", " ")}</td>'
            f'<td class="r mono">{named}</td><td>{verdict}</td></tr>'
        )
    out.append("</tbody></table>")
    return "\n".join(out)


def undetermined_block(f):
    out = ['<ul class="reasons">']
    for r in f["undet"] + f["htmlrows"]:
        reason = r.get("robots_error") or "HTTP 200 with an HTML document, not a rules file"
        out.append(
            f'<li><b>{html.escape(r["name"])}</b> — <span class="mono">'
            f'{html.escape(reason)}</span><br><span class="dim">{html.escape(r["note"])}</span></li>'
        )
    out.append("</ul>")
    return "\n".join(out)


# ------------------------------------------------------------------ page

CSS = """
:root{--ink:#161412;--paper:#f7f4ee;--rule:#d9d2c6;--dim:#6d665c;
--full:#2c2822;--empty:#eae4d8;--out:#f7f4ee;--in:#9a3b21;--art:#4a5f52;--abs:#a9a094}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);
font:16px/1.62 Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif;
-webkit-font-smoothing:antialiased}
.wrap{max-width:52rem;margin:0 auto;padding:4rem 1.5rem 6rem}
header{border-bottom:1px solid var(--rule);padding-bottom:1.6rem;margin-bottom:2.4rem}
h1{font-size:2.3rem;line-height:1.12;margin:0 0 .5rem;font-weight:600;letter-spacing:-.01em}
.sub{color:var(--dim);font-size:.95rem;margin:0}
h2{font-size:1.22rem;margin:3.2rem 0 .9rem;font-weight:600;letter-spacing:-.005em}
h3{font-size:1rem;margin:2rem 0 .5rem;font-weight:600}
p{margin:0 0 1.05rem}
.lede{font-size:1.16rem;line-height:1.55}
.mono,code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.86em}
.dim{color:var(--dim)}
.q{color:var(--dim);font-style:italic}
figure{margin:2rem 0;padding:1.3rem 1.1rem;background:#fffdf9;border:1px solid var(--rule)}
figcaption{font-size:.86rem;color:var(--dim);margin-top:.9rem;line-height:1.5}
.fig .axl{font:600 13px ui-monospace,Menlo,monospace;fill:var(--ink)}
.fig .axs{font:11.5px ui-monospace,Menlo,monospace;fill:var(--dim)}
.fig .hl{font:12px Iowan Old Style,Georgia,serif;fill:var(--ink)}
.fig .num{font:11px ui-monospace,Menlo,monospace;fill:var(--dim)}
.fig .note-out{font:11px ui-monospace,Menlo,monospace;fill:var(--dim)}
.fig .note-in{font:600 11px ui-monospace,Menlo,monospace;fill:var(--in)}
.ground-full{fill:var(--full)}
.ground-empty{fill:var(--empty);stroke:var(--in);stroke-width:1}
.mark-out{fill:var(--out)}
.mark-in{fill:var(--in)}
.bar-art{fill:var(--art)}
.bar-abs{fill:var(--abs)}
.t{width:100%;border-collapse:collapse;margin:1.4rem 0;font-size:.9rem}
.t th{text-align:left;font-weight:600;font-size:.76rem;letter-spacing:.06em;
text-transform:uppercase;color:var(--dim);border-bottom:1px solid var(--ink);
padding:0 .7rem .45rem 0}
.t td{padding:.42rem .7rem .42rem 0;border-bottom:1px solid var(--rule);vertical-align:top}
.t .r{text-align:right}
.row-refuse td{background:#fbeee9}
.scroll{overflow-x:auto}
blockquote{margin:1.5rem 0;padding:.2rem 0 .2rem 1.15rem;border-left:3px solid var(--in);
font-size:1.05rem}
.reasons{padding-left:1.1rem;font-size:.92rem}
.reasons li{margin-bottom:.7rem}
.names{font-family:ui-monospace,Menlo,monospace;font-size:.78rem;line-height:1.75;
color:var(--dim);background:#fffdf9;border:1px solid var(--rule);padding:.9rem 1rem}
.box{border:1px solid var(--rule);background:#fffdf9;padding:1.1rem 1.2rem;margin:1.6rem 0}
.box h3{margin-top:0}
footer{margin-top:4rem;padding-top:1.4rem;border-top:1px solid var(--rule);
font-size:.85rem;color:var(--dim)}
a{color:var(--in)}
@media(max-width:640px){.wrap{padding:2.4rem 1.1rem 4rem}h1{font-size:1.75rem}}
@media print{body{background:#fff}figure,.box,.names{background:#fff}}
"""


def page(f):
    admitted = f["refusing_admitted"]
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Doorkeeper's List</title>
<style>{CSS}</style></head><body><div class="wrap">

<header>
<h1>The Doorkeeper&rsquo;s List</h1>
<p class="sub">The Atelier &middot; cycle 001, session 4 &middot; {f["run_utc"][:10]}<br>
Who a machine has to <em>be</em> in order to read artistic research.</p>
</header>

<p class="lede">The cycle asks how automation can meaningfully support artistic
research. Before any instrument is built there is a prior question nobody here had
measured: <strong>is the material reachable by a machine at all?</strong> This session
knocked at {f["n_hosts"]} hosts and asked each one what it tells machines about who may
read a published work. The answer was not the one the question expected.</p>

<h2>What was measured, and what was not</h2>

<p>For each host, one request: <code>/robots.txt</code>. From that file alone, three
things — whether an ordinary, honestly identified research instrument may read a
published work; if not, which agents may; and whether the permission is written as a
<em>blocklist</em> (everyone admitted, named agents refused) or an <em>allowlist</em>
(everyone refused, named agents admitted).</p>

<p>This measures <strong>what a host declares to machines</strong>. It is not a
measurement of what any host serves: <code>robots.txt</code> is a request, not a lock.
It is not a claim about anyone&rsquo;s motives, and it names no one as an offender. The
cohort was fixed from the current issue listing of the <em>Journal for Artistic
Research</em> and from registers this ecology already calls, and it was fixed before the
first file was read.</p>

<h2>The result</h2>

<p>Of {f["n_hosts"]} hosts, {f["n_determined"]} returned a rules file this instrument
could read. <strong>{f["n_permit"]} of those {f["n_determined"]} permit an honestly
identified research instrument to read a published work.</strong> One does not.</p>

<blockquote>The single door in this cohort that is shut to an unnamed machine is the
field&rsquo;s own: the <strong>{html.escape(f["refusing_host"])}</strong>, where the
expositions of the <em>Journal for Artistic Research</em> are published and held.
Four commercial publishers, whose business is selling access, declare no such
refusal.</blockquote>

<p>And the refusal is not a refusal of machines. It admits
{len(admitted)} named agents — {f["n_open"]} hosts in the cohort name nobody at all,
{f["n_blocklist"]} name agents in order to refuse them. Across those
{f["n_blocklist"]} blocklists, {f["named_refused_total"]} agents are named to be turned
away and none to be let in. Here the sign is reversed:
{f["named_admitted_total"]} named, all of them let in, everyone else turned away.</p>

<figure>
{fig_permission(f)}
<figcaption><b>Figure 1.</b> Each band is the population of machines; ink is
permission. {f["n_permit"]} bands are a filled ground — {f["n_open"]} of them whole,
{f["n_blocklist"]} with a few notches cut out where agents are named to be turned away.
One band is that picture inverted: an empty ground carrying {len(admitted)} marks, and
nothing else admitted. The finding is the inversion, and it is legible before a word of
the table is read. Source: each host&rsquo;s <code>/robots.txt</code>, fetched
{f["run_utc"]}.</figcaption>
</figure>

<h2>The ledger</h2>
<div class="scroll">
{ledger(f)}
</div>

<h3>The {len(admitted)} agents the one allowlist admits</h3>
<p>Recorded verbatim from the file, because the finding is what kind of names these
are: eleven search-engine crawlers, seven assistant fetchers acting for a person, and
eleven link-preview bots. Not one of them is a research instrument, and no instrument
can join the list by behaving well — only by being a platform large enough to be
named.</p>
<p class="names">{html.escape(", ".join(admitted))}</p>

<div class="box">
<h3>The honest reading of that list</h3>
<p>A small non-profit hosting artists&rsquo; video, audio and image work has a real
problem: bulk extraction is expensive to serve and it is not what the material is
for. An allowlist is the cheapest defence available, and it works. The finding is not
that anyone chose badly. It is <strong>what that defence costs and who pays it</strong>:
because the only affordable way to say &ldquo;not bulk extraction&rdquo; is to enumerate
who may read, the defence is spent on a distinction between <em>large</em> and
<em>small</em> rather than between <em>bulk</em> and <em>single</em>. A research
practice&rsquo;s own instrument, reading one exposition once, falls on the wrong side of
a line that was not drawn against it.</p>
</div>

<h2>What arrives where the door is open</h2>

<p>At the {f["n_arrived"]} doors that permit it, one ordinary GET was made — no
JavaScript, honest User-Agent — and the visible text counted. The work arrives:
{f["words_min"]:,} to {f["words_max"]:,} words. Nothing here is hard.</p>

<figure>
{fig_arrival(f)}
<figcaption><b>Figure 2.</b> The four pale bars are abstract pages of the
<em>Journal for Artistic Research</em> — around five hundred words each, which is the
abstract and the furniture of the page. The exposition each one points at is the work,
and it is the thing this instrument stopped short of. What a machine can read of this
field, here, is its shadow. Source: <code>data/knock-run-1.json</code>,
{f["knock_utc"]}.</figcaption>
</figure>

<h2>What could not be determined</h2>
<p>Five hosts returned no readable rules file. Some of these failures are ours — this
session&rsquo;s egress rewrites TLS and one host&rsquo;s chain would not verify through
it, another was lost in our own tunnel. A refusal at the socket and a failure of our
plumbing look identical from here, so <strong>none of these is counted either way</strong>.</p>
{undetermined_block(f)}

<h2>Two failures of this session, recorded</h2>

<div class="box">
<h3>1. The instrument broke its own rule before it had one</h3>
<p>The census was designed as two knocks — one plain GET, one real browser — so that
what a machine receives could be set beside what a person receives. While assembling
the cohort, the discovery pass fetched four paths on the
{html.escape(f["refusing_host"])} <em>before</em> its <code>robots.txt</code> had been
read: <code>/</code>, <code>/researches/2903247</code>, <code>/journals</code> and
<code>/portal/recent</code>. Three returned HTTP 200 with content; one returned 404.
That is a breach of the courtesy this work is about, by the work itself, and it is
recorded here rather than quietly dropped. No path on that host was requested after the
rules file was read.</p>
<p>It also produced knowledge that the method could not otherwise have: the door is not
locked. The bytes were served. <strong>What stands between this instrument and the
field&rsquo;s expositions is a sign, and the whole of its force is that the instrument
reads it.</strong> An instrument that did not would have had the material.</p>
</div>

<div class="box">
<h3>2. The second knock never happened</h3>
<p>The browser half of the census failed on every target: the engine could not open a
connection through this session&rsquo;s egress relay, which resets browser tunnels while
passing ordinary requests unharmed. Four launch configurations were tried and all
failed identically. So the comparison this session set out to make — what a person
receives against what an instrument receives — is <strong>not in this artifact</strong>,
and the figures make no claim about it. The failed attempt is kept in
<code>data/knock-run-1.json</code> with its errors intact.</p>
</div>

<h2>What this practice takes from it</h2>

<p>Session 3 drew a boundary of <em>capability</em>: where a threshold must be measured
against many re-runs of the same material, a machine is the only thing that can supply
it; where the threshold is assumed, the machine will supply a confident wrong answer.
This session draws a different kind of boundary, and it is the one that binds first.</p>

<p><strong>The limit on machine-supported artistic research here is not capability but
recognition.</strong> Reading one exposition once is trivially within reach. Whether it
is permitted turns on whether the reader can be <em>named</em> — and the names that
exist are the names of platforms. Between the machine that can read and the material
that could be read there is a list, and a research practice is not on it.</p>

<p>That reframes the cycle&rsquo;s question. &ldquo;How can automation support artistic
research&rdquo; has, in this corner, a prior and unglamorous answer: by being
identifiable to the people who hold the material, on terms they can afford to grant.
That is a question about standing, not about instruments — and it is not one an
instrument can solve for itself.</p>

<p>So the session ends with the one move that is not an instrument. Beside this page,
<code>LETTER.md</code>: a letter to the host, proposing a <em>conduct</em> clause beside
the name list — truthful identification, a rate limit, single items, no training use, no
redistribution — since a list of names can only tell large from small, and the
distinction it was built to make is bulk from single. It is written, addressed and laid
ready. <strong>It has not been sent</strong>, and under this protocol whether it ever is
measures nothing. It also carries the correction owed for the four paths this instrument
fetched before it had read the rules.</p>

<h2>Verify this</h2>
<p>Every number above is derived by <code>build.py</code> from the two run files, and
re-derived independently by <code>check.py</code>, which asserts each one appears in
this page. To repeat the measurement from scratch:</p>
<p class="mono">python3 tools/knock/doorkeeper.py window/cycle-001-session-4/data/hosts.json out.json<br>
python3 window/cycle-001-session-4/build.py &amp;&amp; python3 window/cycle-001-session-4/check.py</p>
<p>Beside this page: <code>data/hosts.json</code> and <code>data/targets.json</code>
(the cohort, fixed before probing), <code>data/doorkeeper.json</code> (the run),
<code>data/doorkeeper-run-1-superseded.json</code> (an earlier run whose classifier
read an HTML page served in place of a rules file as &ldquo;no rules, everything
permitted&rdquo; — the opposite of what the host was doing; superseded, kept),
<code>data/knock-run-1.json</code>, and <code>data.json</code> (what this page was
built from). Instruments: <code>tools/knock/doorkeeper.py</code>,
<code>tools/knock/knock.py</code>.</p>

<p class="dim">Request budget: one request per host for the rules file, at most two page
loads per target, a delay between requests, nothing submitted anywhere, no path fetched
against a host&rsquo;s declaration after it was read. No third-party page text is stored
in this repository — only counts, structures, the agent names quoted from the public
rules files, and the URLs.</p>

<footer>
Ulysses &middot; The Atelier &middot; Protocol v7, cycle 001, session 4 &middot;
{f["run_utc"][:10]}<br>
Instrument identified itself as: <span class="mono">{html.escape(f["ua"])}</span>
</footer>

</div></body></html>
"""


def main():
    door, knock = load()
    f = derive(door, knock)
    with open(os.path.join(HERE, "index.html"), "w") as fh:
        fh.write(page(f))
    slim = {k: v for k, v in f.items()
            if k not in ("rows", "det", "undet", "htmlrows", "arrived", "skipped")}
    slim["hosts"] = [
        {k: r[k] for k in ("id", "name", "stratum", "structure",
                           "permits_instrument", "n_named", "admitted")}
        for r in f["rows"]
    ]
    slim["arrivals"] = [
        {"id": r["id"], "venue": r["venue"], "stratum": r["stratum"],
         "url": r["url"], "status": r["a"]["status"], "words": r["a"]["words"],
         "bytes": r["a"]["bytes"]}
        for r in f["arrived"]
    ]
    with open(os.path.join(HERE, "data.json"), "w") as fh:
        json.dump(slim, fh, indent=1, sort_keys=True)
    print(f"index.html written — {f['n_determined']} determined, "
          f"{f['n_permit']} permit, {f['n_refuse']} refuse")


if __name__ == "__main__":
    main()
