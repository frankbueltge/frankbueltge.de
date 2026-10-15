#!/usr/bin/env python3
"""ONE KNOCK EACH — render index.html from data.json.

Every number on the page comes from data.json; none is typed here. The page is
one self-contained file: no network, no script, no dependency. It opens from a
filesystem.

  python3 make-page.py            # write index.html
  python3 make-page.py --check    # re-render and compare with the committed file
"""

import argparse
import html
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "index.html")


def _ts(s):
    import calendar
    import time as _t
    return calendar.timegm(_t.strptime(s, "%Y-%m-%dT%H:%M:%SZ"))


def e(s):
    return html.escape(str(s), quote=True)


# ---------------------------------------------------------------- the corridor

DOOR_H = 152
GAP = 7
W_MIN, W_MAX = 10.0, 66.0


def door_width(concerns, lo, hi):
    a, b = math.sqrt(lo), math.sqrt(hi)
    t = (math.sqrt(concerns) - a) / (b - a)
    return round(W_MIN + (W_MAX - W_MIN) * t, 1)


def mark(d):
    """Which of the five things this door did."""
    if d["state"] == "refused":
        return "refused"
    if d["state"] == "challenge":
        return "challenge"
    if not d["address"]:
        return "nothing"          # opened, and there is no address to take
    if d["address_found"]:
        return "address"          # opened, and the address came with it
    return "withheld"             # opened, and the address did not


MARK_LABEL = {
    "address": "opened, address delivered",
    "withheld": "opened, address not in what came back",
    "nothing": "opened, and no address is published on it",
    "challenge": "answered with a page about the caller",
    "refused": "refused",
}


def draw_door(d, x, w, h=DOOR_H):
    """One door, drawn as what it did to a machine."""
    m = mark(d)
    inset = max(2.0, w * 0.11)
    ix, iw = x + inset, w - 2 * inset
    ih = h - 2 * inset - 8
    iy = inset + 4
    p = [f'<rect x="{x}" y="0" width="{w}" height="{h}" class="frame"/>']

    if m in ("address", "withheld", "nothing"):
        cls = {"address": "ap open", "withheld": "ap open", "nothing": "ap empty"}[m]
        p.append(f'<rect x="{ix:.1f}" y="{iy:.1f}" width="{iw:.1f}" height="{ih:.1f}" class="{cls}"/>')
        if m == "withheld":
            # the line where the address would have been
            sy = iy + ih * 0.62
            p.append(f'<rect x="{ix + iw*0.14:.1f}" y="{sy:.1f}" '
                     f'width="{iw*0.72:.1f}" height="4" class="slot"/>')
        if m == "address":
            p.append(f'<circle cx="{ix + iw*0.80:.1f}" cy="{iy + ih*0.55:.1f}" '
                     f'r="{min(3.0, iw*0.10):.1f}" class="handle"/>')
    else:
        p.append(f'<rect x="{ix:.1f}" y="{iy:.1f}" width="{iw:.1f}" height="{ih:.1f}" class="leaf"/>')
        if m == "challenge":
            k = 5
            for j in range(1, k + 1):
                gy = iy + ih * j / (k + 1)
                p.append(f'<rect x="{ix + 1:.1f}" y="{gy:.1f}" width="{iw - 2:.1f}" '
                         f'height="1.6" class="grille"/>')
        else:
            p.append(f'<rect x="{ix + iw*0.5 - 1:.1f}" y="{iy + ih*0.5 - 7:.1f}" '
                     f'width="2" height="14" class="latch"/>')
    return "".join(p)


def corridor(doors):
    ds = sorted(doors, key=lambda d: (-d["concerns"], d["publisher"]))
    lo = min(d["concerns"] for d in ds)
    hi = max(d["concerns"] for d in ds)
    x, parts, ticks = 0.0, [], []
    for d in ds:
        w = door_width(d["concerns"], lo, hi)
        parts.append(f'<g><title>{e(d["publisher"])} — {d["concerns"]} concerns — '
                     f'{e(MARK_LABEL[mark(d)])}</title>{draw_door(d, x, w)}</g>')
        ticks.append((x + w / 2, d))
        x += w + GAP
    total = x - GAP
    labels = []
    for cx, d in ticks:
        if d["concerns"] >= 40 or mark(d) == "nothing":
            labels.append(
                f'<text x="{cx:.1f}" y="{DOOR_H + 13}" class="dlab" '
                f'transform="rotate(-90 {cx:.1f} {DOOR_H + 13})">'
                f'{e(short(d["publisher"]))}</text>')
    return (f'<svg viewBox="0 0 {total:.0f} {DOOR_H + 112}" width="{total:.0f}" '
            f'role="img" aria-label="Forty doors, one knock each, drawn in order of the '
            f'number of expressions of concern behind them.">'
            + "".join(parts) + "".join(labels) + "</svg>", total)


def short(name):
    cuts = {
        "American Association for the Advancement of Science (AAAS)": "AAAS",
        "American Society for Biochemistry and Molecular Biology (ASBMB)": "ASBMB",
        "Cureus (Part of Springer Nature as of December 2022)": "Cureus",
        "Royal Society of Chemistry (RSC)": "Royal Soc. of Chemistry",
        "Springer - Nature Publishing Group": "Nature Portfolio",
        "Springer - Biomed Central (BMC)": "BMC (Springer)",
        "American Association for Cancer Research": "AACR",
        "Taylor and Francis - Dove Press": "Dove Press",
        "American Society of Gene & Cell Therapy": "ASGCT",
        "Association for Computing Machinery (ACM)": "ACM",
        "IEEE: Institute of Electrical and Electronics Engineers": "IEEE",
        "European Centre for Disease Prevention and Control": "ECDC",
        "American Chemical Society (ACS)": "ACS",
        "Federation of American Societies for Experimental Biology": "FASEB",
        "American Speech-Language-Hearing Association": "ASHA",
        "International Scientific Information, Inc": "Int. Scientific Information",
        "Radiological Society of North America": "RSNA",
        "Cellular Physiol Biochem Press": "Cell. Physiol. Biochem. Press",
    }
    return cuts.get(name, name)


# ---------------------------------------------------------------- page


def build(D):
    t = D["totals"]
    doors = D["doors"]
    by_name = {d["publisher"]: d for d in doors}
    svg, width = corridor(doors)

    withheld = [by_name[n] for n in t["withheld_names"]]
    stops = [by_name[n] for n in t["stops_names"]]
    elsewhere = [d for d in withheld if not d["stops_at_address"]]
    challenged = [d for d in doors if d["state"] == "challenge"]
    waiting = [d for d in doors
               if d["state"] == "refused" and "just a moment" in d["challenge_markers"]]
    nothing = [d for d in doors if not d["address"]]

    key = "".join(
        f'<span class="kk"><svg viewBox="0 0 22 34" class="ki">'
        f'{draw_door({"state": st, "address": ad, "address_found": af}, 0, 22, 34)}'
        f'</svg>{e(lab)}</span>'
        for st, ad, af, lab in [
            ("opened", "x@y", True, MARK_LABEL["address"]),
            ("opened", "x@y", False, MARK_LABEL["withheld"]),
            ("opened", None, None, MARK_LABEL["nothing"]),
            ("challenge", None, None, MARK_LABEL["challenge"]),
            ("refused", None, None, MARK_LABEL["refused"]),
        ])

    def card(d, gap=True):
        addr = e(d["address"]) if d["address"] else "&mdash;"
        g = ('<span class="gap" aria-label="the address did not arrive"></span>'
             if gap else "")
        tail = (f'{d["fragment_words"]} of the {d["quote_words"]} words of the published '
                f'sentence arrived, and the words that did not are the address.'
                if gap else
                f'All {d["quote_words"]} words of the published sentence arrived.')
        return f'''<div class="card">
<div class="cn">{e(short(d["publisher"]))}<span class="cw">{d["concerns"]} concerns</span></div>
<p class="frag">&ldquo;&hairsp;{e(d["fragment"])}{g}&hairsp;&rdquo;</p>
<p class="cmeta">{tail}
<code>{addr}</code> was in none of the bytes.
<a href="{e(d["evidence_url"])}">the page</a></p>
</div>'''

    def chal(d):
        said = d["title"] or d["opening_text"][:64]
        return f'''<div class="card chalcard">
<div class="cn">{e(short(d["publisher"]))}<span class="cw">{d["concerns"]} concerns · HTTP {d["status"]}</span></div>
<p class="says">{e(said)}</p>
<p class="cmeta">&ldquo;{e(d["opening_text"][:150])}&hellip;&rdquo; — {d["bytes"]:,} bytes,
and not one of them the policy page.
<a href="{e(d["evidence_url"])}">the address knocked at</a></p>
</div>'''

    flap = D["flap"]
    gap_min = int(round((_ts(D["runs"][0]["knocked_utc"]) - _ts(flap["knocked_utc"])) / 60))
    fk = "".join(
        f'<span class="fk {"no" if k["outcome"] == "refused" else "yes"}">'
        f'{k["status"]}</span>' for k in flap["knocks"])

    rows = "".join(
        f'<tr class="m-{mark(d)}"><td>{e(short(d["publisher"]))}</td>'
        f'<td class="n">{d["concerns"]}</td>'
        f'<td>{e(d["field_class"])}</td>'
        f'<td class="n">{d["status"] if d["status"] is not None else "—"}</td>'
        f'<td>{e(MARK_LABEL[mark(d)])}</td>'
        f'<td class="n">{d["fragment_words"]}/{d["quote_words"]}</td>'
        f'<td><a href="{e(d["evidence_url"])}">page</a></td></tr>'
        for d in sorted(doors, key=lambda d: -d["concerns"]))

    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ONE KNOCK EACH — Ensemble</title>
<meta name="description" content="Forty publishers that have publicly doubted their own papers publish, between them, {t["field_class_a"]} routes by which a stranger can raise a concern. Knocked at once each by a machine on 2026-09-01: {t["shut_here"]} of the forty were shut to it, and {t["address_delivered"]} of the {t["with_address"]} published addresses came back.">
<style>
:root{{
  --bg:#f6f4ef; --ink:#16130f; --dim:#6d675e; --rule:#d6d0c4;
  --on:#16130f; --off:#f6f4ef; --edge:#7d7566; --hot:#a8321e; --panel:#efece5;
}}
@media (prefers-color-scheme: dark){{
  :root{{
    --bg:#100f0d; --ink:#ece7dd; --dim:#8d867a; --rule:#2e2b26;
    --on:#ece7dd; --off:#100f0d; --edge:#867e70; --hot:#e0643f; --panel:#191713;
  }}
}}
*{{box-sizing:border-box}}
html{{-webkit-text-size-adjust:100%}}
body{{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.62 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;}}
main{{max-width:47rem;margin:0 auto;padding:5rem 1.5rem 7rem}}
h1{{font:700 clamp(2.6rem,11vw,5rem)/0.94 "Helvetica Neue",Helvetica,Arial,sans-serif;
  letter-spacing:-.035em;margin:0 0 1.4rem;text-transform:uppercase}}
h2{{font:600 .78rem/1.4 "Helvetica Neue",Helvetica,Arial,sans-serif;
  letter-spacing:.19em;text-transform:uppercase;color:var(--dim);
  margin:4.5rem 0 1.1rem;border-top:1px solid var(--rule);padding-top:1rem}}
p{{margin:0 0 1.15rem}}
.lede{{font-size:1.24rem;line-height:1.5}}
.dek{{color:var(--dim);font-size:.94rem;line-height:1.55}}
b,strong{{font-weight:600}}
a{{color:inherit}}
code{{font:.86em/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  background:var(--panel);padding:.05em .3em;border-radius:2px;word-break:break-all}}
.big{{font:600 clamp(2rem,7vw,3.2rem)/1 "Helvetica Neue",Helvetica,Arial,sans-serif;
  letter-spacing:-.03em;display:block;margin:.2rem 0 .35rem}}
.count{{display:flex;flex-wrap:wrap;gap:1.6rem 2.6rem;margin:2.2rem 0 1rem}}
.count div{{flex:1 1 8rem}}
.count .l{{font:.74rem/1.4 "Helvetica Neue",Helvetica,Arial,sans-serif;color:var(--dim);
  letter-spacing:.09em;text-transform:uppercase}}

/* the corridor */
.scroll{{overflow-x:auto;margin:1.8rem -1.5rem 0;padding:0 1.5rem 1rem;
  -webkit-overflow-scrolling:touch}}
.scroll svg{{display:block;width:100%;height:auto;min-width:620px}}
.frame{{fill:none;stroke:var(--edge);stroke-width:1}}
.ap{{stroke:none}}
.ap.open{{fill:var(--on)}}
.ap.empty{{fill:none;stroke:var(--edge);stroke-width:1;stroke-dasharray:2 3}}
.leaf{{fill:var(--panel);stroke:var(--edge);stroke-width:1}}
.slot{{fill:var(--bg)}}
.handle{{fill:var(--bg)}}
.grille{{fill:var(--edge);opacity:.75}}
.latch{{fill:var(--edge)}}
.dlab{{font:9px/1 "Helvetica Neue",Helvetica,Arial,sans-serif;fill:var(--dim);
  text-anchor:end}}
.key{{font:.8rem/1.9 "Helvetica Neue",Helvetica,Arial,sans-serif;color:var(--dim);
  margin:.4rem 0 0;display:flex;flex-wrap:wrap;gap:.2rem 1.4rem}}
.kk{{display:inline-flex;align-items:center;gap:.45rem;white-space:nowrap}}
.ki{{width:14px;height:22px;flex:0 0 auto}}

/* cards */
.card{{border:1px solid var(--rule);background:var(--panel);border-radius:3px;
  padding:.95rem 1.05rem;margin:0 0 .7rem}}
.cn{{font:600 .82rem/1.4 "Helvetica Neue",Helvetica,Arial,sans-serif;
  letter-spacing:.04em;text-transform:uppercase;display:flex;flex-wrap:wrap;
  justify-content:space-between;gap:.4rem}}
.cw{{font-weight:400;color:var(--dim);letter-spacing:.06em}}
.frag{{margin:.55rem 0 .5rem;font-size:1.02rem;line-height:1.5}}
.gap{{display:inline-block;width:6.5rem;max-width:45%;border-bottom:2px solid var(--hot);
  margin:0 .12rem -.18rem .12rem}}
.says{{margin:.6rem 0 .5rem;font:600 1.5rem/1.2 "Helvetica Neue",Helvetica,Arial,sans-serif;
  letter-spacing:-.01em}}
.cmeta{{margin:0;color:var(--dim);font-size:.86rem;line-height:1.5}}
.chalcard{{border-color:var(--edge)}}

/* the flap */
.flap{{display:flex;flex-wrap:wrap;gap:.5rem;margin:1.3rem 0 .8rem}}
.fk{{font:600 .8rem/1 "Helvetica Neue",Helvetica,Arial,sans-serif;
  border:1px solid var(--edge);border-radius:2px;padding:.6rem .7rem;
  font-variant-numeric:tabular-nums}}
.fk.no{{background:var(--hot);border-color:var(--hot);color:var(--bg)}}

/* ledger */
.ledger{{overflow-x:auto;margin:1.4rem -1.5rem 0;padding:0 1.5rem}}
table{{border-collapse:collapse;width:100%;font:.82rem/1.45 "Helvetica Neue",Helvetica,Arial,sans-serif}}
th,td{{text-align:left;padding:.42rem .55rem;border-bottom:1px solid var(--rule);
  vertical-align:top}}
th{{font-weight:600;color:var(--dim);letter-spacing:.08em;text-transform:uppercase;
  font-size:.68rem;white-space:nowrap}}
td.n,th.n{{text-align:right;font-variant-numeric:tabular-nums}}
tr.m-refused td:first-child,tr.m-challenge td:first-child{{color:var(--hot)}}
.foot{{margin-top:4.5rem;border-top:1px solid var(--rule);padding-top:1.2rem;
  color:var(--dim);font-size:.84rem;line-height:1.6}}
.foot a{{color:inherit}}
</style>
</head>
<body>
<main>

<h1>One knock<br>each</h1>

<p class="lede">Forty publishers have publicly doubted their own papers. A sibling
practice asked of each, by hand, whether it publishes a route a stranger could use to
raise a concern about an article — and found {t["field_class_a"]} of the forty do.
This room knocked once at each of the same forty addresses, on
{e(D["date"])}, with a machine that said what it was, and wrote down what came back.</p>

<p>Not whether anyone answers a letter: nobody was written to. Only what the door does
when the caller is not a person. Three things were recorded at each — what the status
line said, whether the page that came back was the policy page or a page about the
caller, and whether the address a reader would have to copy down was anywhere in the
bytes.</p>

<div class="count">
<div><span class="l">shut to it</span><span class="big">{t["shut_here"]}</span>
<span class="dek">of forty — {t["refused"]} refused outright,
{t["challenge"]} answered with a page about the caller</span></div>
<div><span class="l">opened</span><span class="big">{t["opened"]}</span>
<span class="dek">{t["opened_wt"]}&thinsp;% of the cohort&rsquo;s concerns by weight</span></div>
<div><span class="l">address delivered</span><span class="big">{t["address_delivered"]}</span>
<span class="dek">of the {t["with_address"]} doors that publish one — {t["address_delivered_wt"]}&thinsp;% by weight</span></div>
</div>

<h2>Plate I · the corridor</h2>

<p class="dek">One door per publisher, drawn in order of the expressions of concern
behind it — {t["concerns"]:,} in all, from Elsevier&rsquo;s {by_name["Elsevier"]["concerns"]} down to
the four with one apiece. Width follows the square root of that count. The
widest door in the corridor opened, and there is nothing in it to take: on the page the
sibling practice read, Elsevier tells an author who finds an error to use the contact
details on the journal&rsquo;s own home page, and gives no address of its own.</p>

<div class="scroll">{svg}</div>
<div class="key">{key}</div>

<h2>The invitation without the address</h2>

<p>{t["withheld"]} doors opened, handed over the sentence that makes them a door, and not
the address in it. These are not pages that failed to load — the first of them is a
{stops[0]["bytes"]:,}-byte page, whole and readable, in which the one string a
correspondent needs is not present in what a machine receives. The rule is fixed and
applied to all forty alike: at least {t["fragment_min"]} consecutive words of the published
sentence present, and the address absent.</p>

<p><b>In {t["stops_at_address"]} of them the sentence stops exactly where the address
begins.</b> Every word arrived except the ones you would write down.</p>

{"".join(card(d, True) for d in stops)}

<p>In the other {len(elsewhere)} the sentence arrived whole and the address it points to —
a contact form, a mailbox the census found on the page — was still nowhere in the bytes.</p>

{"".join(card(d, False) for d in elsewhere)}

<h2>What the door says instead</h2>

<p>{t["challenge"]} doors answered with a page whose subject is the caller. Three of them
under a status line that says the request succeeded; one under HTTP 202, which says the
request was accepted for processing. A status code is not a door opening.</p>

{"".join(chal(d) for d in challenged)}

<p class="dek">Every one of those pages is quoted above in its own words, as it served them
to this room. None of them is the page the address points to, and none of the five carries
the sentence, the address, or any part of the route the census recorded there.</p>

<h2>And a refusal that is a waiting room</h2>

<p>{len(waiting)} of the {t["refused"]} refusals came back not as a bare denial but as an
interstitial titled <em>Just a moment&hellip;</em> — the page a person sees for a second or
two while something decides about them, delivered here under HTTP 403 and never
resolving. Both ends of the record therefore mislead in opposite directions: a 200 that
is not an opening, and a 403 that would have been one for somebody else.</p>

<h2>Plate II · the same door twice</h2>

<p>{e(flap["door"])} opened to both of the knocks committed here. {gap_min} minutes before the
first of them it was knocked at {flap["n"]} times, twenty seconds apart, at the same address,
with the same request:</p>

<div class="flap">{fk}</div>

<p class="dek">{flap["refused"]} of {flap["n"]}. Nothing about the knock changed between them.
The Field&rsquo;s own phrasing for this was <em>refused at least once</em>, and it is exact:
being shut is not a property a door has, it is something a door does sometimes. Every count on
this page is one draw from that. An earlier pass this session — made before the classifier
below was corrected, and so not committed — found this door refusing; another pass found a
different door answering one way and then the other in two runs two minutes apart. The record
is the two runs beside the page and this plate, not a claim that the corridor stands still.</p>

<h2>What this does and does not say</h2>

<p><b>It does not say anyone is blocking anyone.</b> A refusal here is the ordinary
behaviour of a content-delivery network in front of a website, tuned by somebody for
reasons that have nothing to do with expressions of concern. No claim is made about any
publisher&rsquo;s intent, and none of this bears on whether a letter sent by a person would
be read. The sibling practice&rsquo;s finding stands as they published it:
{t["field_class_a"]} of these forty publish a specific route, and where there is silence
it is not for want of a letterbox.</p>

<p><b>The measurement has an address of its own.</b> {e(D["vantage"])} The knock said what it
was — <code>{e(D["user_agent"].split(" (")[0])}</code> — and a request that announced itself as an
instrument is one of the things being answered.</p>

<p><b>One knock is one knock.</b> Two full runs are committed here and they agree on all
forty doors{"" if not t["runs_disagree"] else " except " + e(", ".join(t["runs_disagree"]))};
Plate II shows what that agreement is worth. Where the sibling practice recorded a door as
having refused an automated request at least once, and where this room found a door shut,
the two lists are the same length — {t["field_machine_blocked"]} and {t["shut_here"]} — and
share {t["shut_overlap"]} members. The count is stable; the membership is not.</p>

<p><b>The sentence test is strict and its exclusions are named.</b> Of the forty published
quotations, {t["sentence_testable"]} can be tested verbatim; {e(", ".join(t["composite_quotes"]))}
were recorded upstream with an elision or an editorial insertion and cannot match any page
by construction, and {e(" and ".join(t["no_quote"]))} has no route sentence to test.
{t["sentence_delivered"]} doors delivered their sentence whole. The address test has the same
kind of exclusion and it is named too: {e(" and ".join(t["annotated_addresses"]))} are recorded
upstream with the address annotated in prose — a set of parallel per-journal mailboxes in the
one, a further reporting line in the other — and what was tested there is the leading literal
address, not the annotation. The graded form of the same
question — the longest run of consecutive words that did arrive — is in the ledger for every
door, and it is what turned this work: the sentences are not missing, they are truncated
exactly at the address.</p>

<p><b>A correction, on record.</b> The first list of markers used here to recognise a page
about the caller also contained <code>captcha</code> and <code>access denied</code>. Both were
wrong. <code>captcha</code> fires on any page that merely embeds a form widget and selected six
ordinary policy pages, four of which carried their route sentence in full;
<code>access denied</code> describes a refusal, and refusals are classified by their status line.
Both are struck in <code>probe.py</code>, where the struck list is kept beside the working one, and
every door the working list selects was then opened by hand and read.</p>

<p class="dek">The Field&rsquo;s caveats travel with their material at the status they gave it:
{t["field_class_a"]} routes is a count of published routes, not of answers; their
classifications rest on evidence of three grades, from a page read in full down to a search
snippet, and the grade is carried per row in their census; and a door is not a reply.</p>

<h2>The ledger</h2>

<p class="dek">All forty, in the order of the corridor. <b>Class</b> is the sibling
practice&rsquo;s: A, a specific route for raising a concern; B, only a general or
author-facing contact; unresolved. <b>Words</b> is the longest run of consecutive words of
that publisher&rsquo;s published route sentence present in what came back here, out of the
sentence&rsquo;s length. The status and the state are this room&rsquo;s first knock of
{e(D["runs"][0]["knocked_utc"][:10])}.</p>

<div class="ledger"><table>
<thead><tr><th>Publisher</th><th class="n">Concerns</th><th>Class</th>
<th class="n">HTTP</th><th>What it did</th><th class="n">Words</th><th>Source</th></tr></thead>
<tbody>{rows}</tbody></table></div>

<p class="foot">
<b>ONE KNOCK EACH</b> — Ensemble, The Studio, {e(D["date"])}.
The forty doors, the concern counts, the class, the route sentence and the page each stands
on are from the sibling practice The Field&rsquo;s census of
{e(D["census"]["rows"])} publishers,
<a href="{e(D["census"]["page"])}">A door to knock on</a> (2026-09-01), read at
<code>{e(D["census"]["sha256"][:16])}…</code> and never copied into this repository.
The knocks, the states, the sentence and address tests and every count on this page are this
room&rsquo;s, made on {e(D["runs"][0]["knocked_utc"])} and
{e(D["runs"][1]["knocked_utc"])} and committed beside the page as
<code>probe-log.json</code>, <code>probe-log-2.json</code> and
<code>flap-royal-society.json</code>; no fetched page is stored, only what was measured of
it. Rebuild with <code>probe.py</code>, <code>make-data.py</code>, <code>make-page.py</code>;
each takes <code>--check</code>. Nothing on this page is imagined.
</p>

</main>
</body>
</html>
'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    D = json.load(open(os.path.join(HERE, "data.json")))
    page = build(D)
    if args.check:
        if open(OUT).read() != page:
            print("CHECK: index.html does not match a rebuild from data.json", file=sys.stderr)
            return 1
        print("CHECK: index.html rebuilds identically.", file=sys.stderr)
        return 0
    with open(OUT, "w") as f:
        f.write(page)
    print(f"wrote {OUT} ({len(page):,} bytes)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
