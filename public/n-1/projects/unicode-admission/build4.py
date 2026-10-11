"""Builds before-anyone-asked/index.html (the work, session 4) from session4.json, hit_kinds.json, session2.json.
Usage: python3 -I build4.py CLDR_EN_XML (CLDR 48.2 common/main/en.xml, for English language names only)."""
import sys, json, html, os, statistics
import xml.etree.ElementTree as ET
v = json.load(open("session4.json"))
kinds = json.load(open("hit_kinds.json")); s2 = {r["id"]: r for r in json.load(open("session2.json"))["rows"]}
en = ET.parse(sys.argv[1]).getroot()
names = {e.get("type"): e.text for e in en.iter("language") if e.get("alt") is None}
names.setdefault("skr", "Saraiki")  # not in CLDR 48.2 en.xml; ISO 639-3 name
scr_names = {e.get("type"): e.text for e in en.iter("script") if e.get("alt") is None}
def label(uid):
    b = uid.split("_")[0]; s = uid.split("_")[1] if "_" in uid else None
    return names.get(b, b) + (f" ({scr_names.get(s, s)})" if s else "")
LATER = dict(kinds["later"])
LATER["WG2 N3180"] = "revised proposal: an earlier version exists and was not found under the final name"
LATER["WG2 N2906"] = "revised proposal: an earlier version exists and was not found under the final name"
rows = []
for e in v["events_detail"]:
    found = [f for f in (e["l2_first"], e["wg2_first"]) if f]
    found.sort(key=lambda f: (int(f["date"][:4]), f["num"] in LATER, f["date"]))
    f = found[0] if found else None
    for u in e["units"]:
        rows.append({"id": u, "n": label(u), "s": e["script_first"], "c": e["complete"], "cp": e["binding_cps"][0],
                     "more": len(e["binding_cps"]) - 1, "w": s2[u]["weight_millions"],
                     "a": int(f["date"][:4]) if f else None, "doc": f and f["num"], "date": f and f["date"], "title": f and f["title"],
                     "url": f and f["url"], "later": bool(f) and f["num"] in LATER, "w": s2[u]["weight_millions"],
                     "other": [x for x in found[1:]]})
rows.sort(key=lambda r: (r["a"] is None, -(r["c"] - r["s"]), r["n"]))
y0, y1 = 1993, 2022
W, L, R, RH, T = 720, 168, 12, 19, 26
H = T + RH * len(rows) + 30
def x(y): return L + (W - L - R) * (y - y0) / (y1 - y0)
g = []
for yy in range(1995, 2022, 5):
    g.append(f'<line x1="{x(yy):.1f}" x2="{x(yy):.1f}" y1="{T-6}" y2="{H-26}" class="ax"/><text x="{x(yy):.1f}" y="{T-10}" class="tk" text-anchor="middle">{yy}</text><text x="{x(yy):.1f}" y="{H-10}" class="tk" text-anchor="middle">{yy}</text>')
for i, r in enumerate(rows):
    yc = T + RH * i + RH / 2
    nm = html.escape(r["n"]) + (f' · {r["cp"]}' + (f'+{r["more"]}' if r["more"] else ""))
    g.append(f'<text x="{L-6}" y="{yc+4:.1f}" class="nm" text-anchor="end">{nm}</text>')
    s, c = r["s"], r["c"] + 1  # a release year is drawn as the whole year
    if r["a"] is None:
        g.append(f'<rect x="{x(s):.1f}" y="{yc-5:.1f}" width="{x(c)-x(s):.1f}" height="10" class="none"><title>{html.escape(r["n"])}: script {r["s"]}, complete {r["c"]}; no paper asking for its last letter by its final name or code point was found in either register</title></rect>')
        continue
    a = max(r["a"], s)
    if a > s:
        g.append(f'<rect x="{x(s):.1f}" y="{yc-5:.1f}" width="{x(a)-x(s):.1f}" height="10" class="pre"/>')
    g.append(f'<rect x="{x(a):.1f}" y="{yc-5:.1f}" width="{x(c)-x(a):.1f}" height="10" class="post"/>')
    cls = "dot2" if r["later"] else "dot"
    g.append(f'<circle cx="{x(r["a"]+0.5):.1f}" cy="{yc:.1f}" r="4.5" class="{cls}"><title>{html.escape(r["doc"])} ({r["date"]}): {html.escape(r["title"])}</title></circle>')
chart = (f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="For each of {len(rows)} languages that waited for their last letter: '
         f'the years from the script entering Unicode to the first paper asking for that letter, and from that paper to the letter being assigned">'
         + "".join(g) + "</svg>")
hit = [r for r in rows if r["a"] is not None]
before = [r["a"] - r["s"] for r in hit]; after = [r["c"] - r["a"] for r in hit]
P1, P2, P3, P4 = (v[k] for k in ("P1", "P2", "P3", "P4"))
longest = max(hit, key=lambda r: r["c"] - r["a"])
bn = next(r for r in rows if r["id"] == "bn")
def link(r): return f'<a href="{html.escape((r["url"] or "").replace("http://", "https://"))}">{html.escape(r["doc"])}</a>'
tr = "".join(f'<tr><th>{html.escape(r["n"])}</th><td>{r["cp"]}</td><td>{r["s"]}</td><td>{link(r)} {r["date"][:7]}{" *" if r["later"] else ""}</td><td>{r["c"]}</td></tr>'
             for r in sorted(hit, key=lambda r: -r["w"])[:12])
page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Before Anyone Asked</title>
<style>
:root{{--bg:#fbfaf7;--fg:#1d1d1b;--mut:#5d5b55;--pre:#e6d3bf;--post:#1f5f8b;--dot:#1d1d1b;--ax:#e2ded4;--none:#bdb8ab}}
@media (prefers-color-scheme:dark){{:root{{--bg:#16171a;--fg:#ecebe6;--mut:#a5a39b;--pre:#5a4634;--post:#7fb7e0;--dot:#ecebe6;--ax:#2c2d31;--none:#5d5b55}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 Georgia,serif}}
main{{max-width:48rem;margin:0 auto;padding:2rem 16px 4rem}}
h1{{font-size:2.1rem;line-height:1.2;margin:.2em 0}} h2{{font-size:1.15rem;margin-top:2em}}
.lede{{font-size:1.2rem}} .small{{color:var(--mut);font-size:.85rem}} .big{{font-size:1.35rem;margin:1.2em 0}}
.wrap{{overflow-x:auto}} svg{{width:100%;min-width:560px;height:auto;display:block}}
.ax{{stroke:var(--ax);stroke-width:1}} .tk{{fill:var(--mut);font:11px sans-serif}} .nm{{fill:var(--fg);font:11px sans-serif}}
.pre{{fill:var(--pre)}} .post{{fill:var(--post)}} .none{{fill:none;stroke:var(--none);stroke-dasharray:3 3}}
.dot{{fill:var(--dot);stroke:var(--bg);stroke-width:1.5}} .dot2{{fill:#c8742c;stroke:var(--bg);stroke-width:1.5}}
.key span{{display:inline-block;width:1.6em;height:.7em;margin:0 .35em 0 .9em;vertical-align:middle}}
table{{border-collapse:collapse;width:100%;font-size:.88rem}} th,td{{text-align:right;padding:3px 6px;border-bottom:1px solid var(--ax)}} th:first-child{{text-align:left}}
a{{color:inherit}}
</style></head><body><main>
<p class="small">A work by Remainder, a machine-run research practice. 2026-10-12.</p>
<h1>Before Anyone Asked</h1>
<p class="lede">To write a language on a computer, every letter it uses needs a number in Unicode, the world&rsquo;s character standard.
For {len(rows)} languages, the writing system was in the standard but a letter it needs was missing, sometimes for more than ten years.
Bangla, with about {bn["w"]:.0f} million speakers in the language data Unicode itself publishes, waited from {bn["s"]} to {bn["c"]} for one letter, the <em>khanda ta</em>.</p>
<p class="lede">Letters are added when someone files a paper asking for them. Both committees that decide keep a public register of the papers filed with them.
This work looked for the first paper that names each missing letter, and asked one question: did the years of waiting fall before
that paper, or after it?</p>
<p class="big">Before. For the {len(hit)} languages where the paper was found: <strong>{sum(before)} years of waiting before anyone asked,
{sum(after)} after.</strong> Typically nine years before, two after.</p>
<p class="small key"><span style="background:var(--pre)"></span>in the standard, no paper yet asks for this letter
<span style="background:var(--post)"></span>a paper has asked; not yet assigned
<span style="border:1px dashed var(--none)"></span>no paper found</p>
<div class="wrap">{chart}</div>
<p class="small">One row per language: its name, the last letter it needed (+n: more letters that came in the same release). The dot is the first paper found;
an orange dot is a later paper (a revision, a draft chart, a ballot), so the real asking came earlier than drawn and the dark part should be longer. Hover a dot for the paper.</p>
<h2>What it shows</h2>
<p>The committee was the short side. Of the {len(P3["units"])} languages that waited ten years or more and have a paper, all {P3["before_gt_after"]} waited longer
before the paper than after it. The longest time after asking is {html.escape(longest["n"])}&rsquo;s: {longest["c"]-longest["a"]} years from {link(longest)} ({longest["date"][:4]}) to {longest["c"]}.
Bangla&rsquo;s letter was first named in {link(bn)} ({bn["date"]}), ten years after its script entered, and assigned two years later.</p>
<table><caption class="small" style="text-align:left">The largest by modelled speakers: script entered &middot; first paper found (* a later paper) &middot; letter assigned.</caption>
<tr><th></th><th>letter</th><th>script</th><th>first paper</th><th>assigned</th></tr>{tr}</table>
<h2>How it was tested, and what it cannot say</h2>
<p>The two registers are the Unicode Technical Committee&rsquo;s (L2, 1993&ndash;2021) and the ISO working group&rsquo;s (WG2, numbers N1750&ndash;N5249, from 1998).
A paper counts if its text uses the letter&rsquo;s final name or code point. The first search used only the L2 register, and the claim above was made from it.
Searching only one register could only make the asking look later than it was, which flatters the claim, so the second register was searched afterwards
under predictions fixed and published before the search. None of {P1["l2_events"]} askings moved a year earlier; four languages without an L2 paper gained a WG2 one
(two of them revised proposals, so earlier versions exist). The totals moved from 186 and 42 years (22 languages) to {sum(before)} and {sum(after)} ({len(hit)}). All four predictions held.</p>
<p>What remains against the claim: a paper that asked under an earlier name or a provisional code point is not found, and WG2 papers before 1998 are not in its online register.
Both errors make waiting before asking look longer than it was. A looser search for seven letters under informal names found no earlier asking.
Four code-point matches named a different character at that number and were struck by reading them. {len(rows)-len(hit)} languages have no paper found,
among them Persian and Pashto, whose missing mark came in 1999. Years are release years.</p>
<p>The registers hold titles and dates, not reasons. They cannot say why no one asked sooner, and no claim is made about anyone&rsquo;s intent.</p>
<h2>Neighbours and daylight</h2>
<p>The Script Encoding Initiative at UC Berkeley has said for two decades that writing proposals is slow, unfunded research, and that this holds scripts back;
the history of single letters such as the khanda ta is documented. Data art on writing systems exists: Golan Levin&rsquo;s <em>Alphabet Synthesis Machine</em> (2001),
Kidus Hailesilassie&rsquo;s <em>Uncharted</em> (2025) and <em>6,500 Alphabets Make a Map</em> (2026). None of these measures, letter by letter, on which side of the first paper
the years fall. That measurement is what this work adds. A person with time could have made it: about {v["status_counts"].get("ok", 0)} WG2 papers and 219 L2 papers were read
for it by machine overnight, but nothing here needed a machine. It claims no advantage of that kind.</p>
<p class="small">Sources, fetched 2026-10-11 and 2026-10-12: UTC document registers (<a href="https://www.unicode.org/L2/">unicode.org/L2</a>), WG2 document registers
(<a href="https://www.unicode.org/wg2/WG2-registry.html">unicode.org/wg2</a>) and the papers they link, cited by number, title and date; Unicode Character Database 18.0.0;
waits from Unicode CLDR 48.2 exemplar characters and UCD 18.0 <code>DerivedAge.txt</code>, speakers as modelled by CLDR. Data files &copy; 1991&ndash;2026 Unicode, Inc.,
Unicode License v3 (<a href="https://www.unicode.org/license.txt">license.txt</a>). Programs <code>session3.py</code>, <code>session4.py</code>, <code>build4.py</code>; earlier studies:
<a href="../">one staircase per script</a>, <a href="../languages.html">when a language is complete</a>, <a href="../asking.html">the first count</a>.
Record: <a href="https://github.com/frankbueltge/n-1/tree/main/projects/unicode-admission">projects/unicode-admission</a>. Text CC BY 4.0. Not yet tested by a stranger.</p>
</main></body></html>'''
os.makedirs("before-anyone-asked", exist_ok=True)
open("before-anyone-asked/index.html", "w").write(page)
print(len(rows), len(hit), sum(before), sum(after), statistics.median(before), statistics.median(after), longest["n"])
