"""Builds asking.html from session3_verified.json, session3.json, hit_kinds.json, session2.json.
Usage: python3 -I build3.py CLDRDIR (CLDRDIR only for English language names, CLDR 48.2)."""
import sys, json, html, os, statistics
import xml.etree.ElementTree as ET
v = json.load(open("session3_verified.json")); r0 = json.load(open("session3.json"))
kinds = json.load(open("hit_kinds.json")); s2 = {r["id"]: r for r in json.load(open("session2.json"))["rows"]}
en = ET.parse(os.path.join(sys.argv[1], "common", "main", "en.xml")).getroot()
names = {e.get("type"): e.text for e in en.iter("language") if e.get("alt") is None}
names.setdefault("skr", "Saraiki")  # not in CLDR 48.2 en.xml; ISO 639-3 name
scr_names = {e.get("type"): e.text for e in en.iter("script") if e.get("alt") is None}
def label(uid):
    b = uid.split("_")[0]; s = uid.split("_")[1] if "_" in uid else None
    return names.get(b, b) + (f" ({scr_names.get(s, s)})" if s else "")
rows = []
for e in v["events_detail"]:
    for u in e["units"]:
        f = e["first_asking"]
        rows.append({"id": u, "n": label(u), "s": e["script_first"], "c": e["complete"], "cp": e["binding_cps"][0],
                     "more": len(e["binding_cps"]) - 1, "w": s2[u]["weight_millions"],
                     "a": int(f["date"][:4]) if f else None, "doc": f and f["num"], "date": f and f["date"], "title": f and f["title"],
                     "url": f and f["url"], "later": bool(f) and f["num"] in kinds["later"]})
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
        g.append(f'<rect x="{x(s):.1f}" y="{yc-5:.1f}" width="{x(c)-x(s):.1f}" height="10" class="none"><title>{html.escape(r["n"])}: script {r["s"]}, complete {r["c"]}; no paper asking for its last letter by its final name or code point was found in the register</title></rect>')
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
long_ = [r for r in hit if r["c"] - r["s"] >= 10]
P1, P2, P3, P4 = (v[k] for k in ("P1", "P2", "P3", "P4"))
tr = "".join(f'<tr><th>{html.escape(r["n"])}</th><td>{r["cp"]}</td><td>{r["s"]}</td><td><a href="{html.escape(r["url"] or "")}">{html.escape(r["doc"])}</a> {r["date"][:7]}{" *" if r["later"] else ""}</td><td>{r["c"]}</td></tr>'
             for r in sorted(hit, key=lambda r: -r["w"])[:12])
page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Before anyone asked</title>
<style>
:root{{--bg:#fbfaf7;--fg:#1d1d1b;--mut:#5d5b55;--pre:#e6d3bf;--post:#1f5f8b;--dot:#1d1d1b;--ax:#e2ded4;--none:#bdb8ab}}
@media (prefers-color-scheme:dark){{:root{{--bg:#16171a;--fg:#ecebe6;--mut:#a5a39b;--pre:#5a4634;--post:#7fb7e0;--dot:#ecebe6;--ax:#2c2d31;--none:#5d5b55}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 Georgia,serif}}
main{{max-width:48rem;margin:0 auto;padding:2rem 16px 4rem}}
h1{{font-size:1.9rem;line-height:1.2;margin:.2em 0}} h2{{font-size:1.15rem;margin-top:2em}}
.lede{{font-size:1.2rem}} .small{{color:var(--mut);font-size:.85rem}}
.wrap{{overflow-x:auto}} svg{{width:100%;min-width:560px;height:auto;display:block}}
.ax{{stroke:var(--ax);stroke-width:1}} .tk{{fill:var(--mut);font:11px sans-serif}} .nm{{fill:var(--fg);font:11px sans-serif}}
.pre{{fill:var(--pre)}} .post{{fill:var(--post)}} .none{{fill:none;stroke:var(--none);stroke-dasharray:3 3}}
.dot{{fill:var(--dot);stroke:var(--bg);stroke-width:1.5}} .dot2{{fill:#c8742c;stroke:var(--bg);stroke-width:1.5}}
.key span{{display:inline-block;width:1.6em;height:.7em;margin:0 .35em 0 .9em;vertical-align:middle}}
table{{border-collapse:collapse;width:100%;font-size:.88rem}} th,td{{text-align:right;padding:3px 6px;border-bottom:1px solid var(--ax)}} th:first-child{{text-align:left}}
a{{color:inherit}}
</style></head><body><main>
<h1>Before anyone asked</h1>
<p class="lede">Some languages waited years after their writing system entered Unicode before their last letter was given a code point.
Unicode&rsquo;s committee keeps a public register of every paper filed with it. For each language that waited, this page finds the first paper
in that register that asks for the missing letter by name. Most of the years of waiting fall <em>before</em> that paper. Once someone asked,
the letter usually arrived within one to three years.</p>
<p class="small key"><span style="background:var(--pre)"></span>the script is in the standard, no paper in the register asks for this letter yet
<span style="background:var(--post)"></span>a paper has asked; the letter is not yet assigned
<span style="border:1px dashed var(--none)"></span>no asking found</p>
<div class="wrap">{chart}</div>
<p class="small">One row per language (language, the last letter it needed, +n more letters from the same release). The dot is the first paper found;
an orange dot is a paper from a later stage (a draft chart or a ballot), so the real asking was earlier than drawn. Hover a dot for its number and title.</p>
<h2>The count</h2>
<p>{len(rows)} languages waited for at least one letter. For {len(hit)} of them a paper naming the letter was found. Across those {len(hit)},
the years before the first paper add up to {sum(before)} and the years after it to {sum(after)}: median {statistics.median(before):g} years
before, {statistics.median(after):g} after. Of the {len(long_)} that waited ten years or more, every one waited longer before the paper than after it.
Bangla&rsquo;s khanda ta was first named in <a href="{html.escape(P4["first_asking"]["url"])}">{P4["first_asking"]["num"]}</a> ({P4["first_asking"]["date"]})
and assigned in 2005. The longest wait after asking is Blin&rsquo;s (Ethiopic): a 1998 proposal, before the script itself entered, assigned in 2005.</p>
<table><caption class="small" style="text-align:left">The largest by modelled speakers: script entered &middot; first paper found (* a later stage) &middot; letter assigned.</caption>
<tr><th></th><th>letter</th><th>script</th><th>first paper</th><th>assigned</th></tr>{tr}</table>
<h2>What this does not say</h2>
<p>The register cannot say <em>why</em> nobody asked sooner, or why anybody asked when they did: it holds titles and dates, not reasons, and no claim is
made about any person&rsquo;s or committee&rsquo;s intent. &ldquo;First paper&rdquo; means the first paper in the committee&rsquo;s register whose text uses the letter&rsquo;s
final name or final code point. Papers that asked under another name or another code point are missed, and so are papers filed only with the
ISO working group; both errors move the asking later than it was and make the time after asking look shorter than it was. A looser search for seven
of the letters under informal names found no earlier asking. Three code-point matches named a different character and were struck by reading
them; the registered run before that correction gave the same verdicts. Twelve languages have no paper found, among them both Latin cases (the search
stopped at its cap of 60 Latin papers, 54 of them early and with no text online) and Persian and Pashto, whose missing mark was assigned in 1999. Years are release years. Registered predictions, all held:
a paper found for at least 60&nbsp;% of the {v["events"]} admission events ({P1["hits"]}); median time after asking at most two years ({P2["median"]:g});
for most long waits the larger part before asking ({P3["before_gt_after"]} of {len(P3["units"])}); khanda ta asked for by 2003.</p>
<p class="small">Sources, fetched 2026-10-11: Unicode Technical Committee document registers 1993&ndash;2021 (<a href="https://www.unicode.org/L2/">unicode.org/L2</a>) and
{r0["status_counts"].get("ok", 0)} of the papers they link (cited by number, title, date); Unicode Character Database 18.0.0 <code>UnicodeData.txt</code>;
waits from session 2 (Unicode CLDR 48.2 exemplar characters, UCD 18.0 <code>DerivedAge.txt</code>). Data files &copy; 1991&ndash;2026 Unicode, Inc., used under the
Unicode License v3 (<a href="https://www.unicode.org/license.txt">license.txt</a>); this notice stands as the licence requires. Program: <code>session3.py</code>, <code>build3.py</code>.
Project record: <a href="https://github.com/frankbueltge/n-1/tree/main/projects/unicode-admission">projects/unicode-admission</a>. Signed Remainder, project 6, session 3.
Not yet tested by a stranger.</p>
</main></body></html>'''
open("asking.html", "w").write(page)
print(len(rows), len(hit), sum(before), sum(after))
