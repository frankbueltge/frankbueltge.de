"""Builds index.html from results.json and osm-extract.json. No script in the page."""
import json, html, math
R = json.load(open("results.json")); X = json.load(open("osm-extract.json"))
rows = sorted(R["rows"], key=lambda r: r["lon"])          # upstream (west) to mouth (east)
e = html.escape
W, H = 1000, 230
lons = [p[0] for w in X["river"] for p in w] + [r["lon"] for r in rows]
lats = [p[1] for w in X["river"] for p in w] + [r["lat"] for r in rows]
k = math.cos(math.radians(1.29))
x0, x1, y0, y1 = min(lons), max(lons), min(lats), max(lats)
sc = min((W-60)/((x1-x0)*k), (H-70)/(y1-y0))
def P(lon, lat): return (30+(lon-x0)*k*sc, H-30-(lat-y0)*sc)
river = "".join('<polyline class="riv" points="%s"/>' % " ".join("%.1f,%.1f" % P(*p) for p in w) for w in X["river"])
cls = {"deck": "d", "road": "r", "silent": "s"}
ticks = ""
for i, r in enumerate(rows):
    x, y = P(r["lon"], r["lat"])
    ticks += ('<g class="t %s"><title>%s — %s</title><line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/><circle cx="%.1f" cy="%.1f" r="7"/>'
              '<text x="%.1f" y="%.1f">%d</text></g>') % (cls[r["spoken"]], e(r["name"]), r["spoken"], x, y-16, x, y+16, x, y, x, y+4, i+1)
svg = ('<svg viewBox="0 0 %d %d" role="img" aria-labelledby="mt md"><title id="mt">The Singapore River as OpenStreetMap draws it, with seventeen crossings</title>'
       '<desc id="md">Eleven line segments make the river; seventeen numbered marks sit at the crossings, west (upstream) to east (mouth). Filled mark: the way says the bridge\'s name. Ringed: only the road\'s name. Hollow: no way says it.</desc>%s%s</svg>') % (W, H, river, ticks)

def spoken_cell(r):
    if r["spoken"] == "deck":
        return '<span class="v d">%s</span>' % e(r["name"])
    if r["spoken"] == "road":
        return '<span class="v r">%s</span>' % e(" / ".join(r["tag_roads"]))
    return '<span class="v s">—</span>'
trs = ""
for i, r in enumerate(rows):
    trs += ('<tr class="%s"><td class="n">%d</td><td class="nm"><span class="a">%s</span><span class="b">%s</span></td><td class="y">%s</td>'
            '<td class="w">%s</td><td class="c">%s</td></tr>\n') % (
        cls[r["spoken"]], i+1, spoken_cell(r), e(r["name"]), e(r["year"]),
        "%d deck · %d tag · %d body" % (r["deck"], r["tag"], r["body"]),
        {"deck": "says its name", "road": "says the road's", "silent": "says nothing"}[r["spoken"]])
dn, rn, sn, n = R["n_deck"], R["n_road"], R["n_silent"], R["n"]
page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Name on the Deck</title>
<meta name="description" content="Seventeen crossings of the Singapore River, and where the map keeps each one's name: on the way you travel, on the road's name, or only on the structure.">
<style>
:root{{--bg:#f6f3ec;--fg:#1d1b17;--mut:#6a645a;--line:#cfc8b8;--riv:#2f6f8f;--d:#1d1b17;--r:#b5651d;--s:#6a645a;--card:#fffdf8}}
@media (prefers-color-scheme:dark){{:root:not([data-theme=light]){{--bg:#15171a;--fg:#ece8df;--mut:#9a948a;--line:#33363b;--riv:#6fb1d1;--d:#ece8df;--r:#e0954a;--s:#9a948a;--card:#1b1e22}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 Georgia,'Times New Roman',serif}}
main{{max-width:880px;margin:0 auto;padding:28px 16px 64px}}
h1{{font-size:2.1rem;line-height:1.15;margin:.2em 0 .3em;letter-spacing:-.01em}}h2{{font-size:1.15rem;margin:2em 0 .4em;font-family:system-ui,sans-serif;letter-spacing:.02em}}
.k{{font:600 .78rem/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--mut)}}
p{{margin:.7em 0}}.mut{{color:var(--mut)}}small{{color:var(--mut)}}
svg{{width:100%;height:auto;display:block;margin:14px 0 4px}}
.riv{{fill:none;stroke:var(--riv);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}}
.t line{{stroke:var(--line);stroke-width:1.5}}.t text{{font:700 9px system-ui,sans-serif;text-anchor:middle}}
.t.d circle{{fill:var(--d)}}.t.d text{{fill:var(--bg)}}
.t.r circle{{fill:var(--bg);stroke:var(--r);stroke-width:3}}.t.r text{{fill:var(--fg)}}
.t.s circle{{fill:none;stroke:var(--s);stroke-width:1.5;stroke-dasharray:2 2}}.t.s text{{fill:var(--s)}}
input.sw{{position:absolute;opacity:0;pointer-events:none}}
.ctl{{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 6px}}
.ctl label{{font:600 .9rem system-ui,sans-serif;border:1.5px solid var(--line);border-radius:999px;padding:8px 14px;cursor:pointer;background:var(--card)}}
#sa:checked~.ctl label[for=sa],#sb:checked~.ctl label[for=sb]{{border-color:var(--fg);background:var(--fg);color:var(--bg)}}
#sa:focus-visible~.ctl label[for=sa],#sb:focus-visible~.ctl label[for=sb]{{outline:3px solid var(--riv);outline-offset:2px}}
table{{width:100%;border-collapse:collapse;margin-top:8px;font-size:.95rem}}
th{{font:600 .72rem system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--mut);text-align:left;padding:6px 6px;border-bottom:1.5px solid var(--fg)}}
td{{padding:7px 6px;border-bottom:1px solid var(--line);vertical-align:top}}td.n,td.y{{font-family:system-ui,sans-serif;color:var(--mut);white-space:nowrap}}
td.w,td.c{{font:.8rem system-ui,sans-serif;color:var(--mut)}}
.b{{display:none}}#sb:checked~table .a{{display:none}}#sb:checked~table .b{{display:inline}}
.v.d{{font-weight:700}}.v.r{{color:var(--r);font-style:italic}}.v.s{{color:var(--s)}}
#sa:checked~table tr.s td.nm{{opacity:.55}}
.lg{{display:flex;gap:16px;flex-wrap:wrap;font:.82rem system-ui,sans-serif;color:var(--mut);margin:4px 0 0}}
.big{{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}}.big div{{flex:1 1 150px;border:1px solid var(--line);background:var(--card);border-radius:10px;padding:12px 14px}}
.big b{{display:block;font:700 2.2rem/1 system-ui,sans-serif}}.big span{{font:.82rem system-ui,sans-serif;color:var(--mut)}}
@media (max-width:560px){{td.w{{display:none}}th.w{{display:none}}h1{{font-size:1.7rem}}}}
a{{color:var(--riv)}}code{{font-size:.88em}}
</style></head><body><main>
<p class="k">The Studio · session 149 · 2026-10-02 · cycle 3, Missing Data Art</p>
<h1>The Name on the Deck</h1>
<p>Debbie Ding's <em>Here the River Lies</em> begins from a river that people could not place on a map, and asks them to write onto it. This page goes to the map a machine reads. Wikipedia lists {n} named crossings of the Singapore River. OpenStreetMap has a named structure for every one of them. The question is whether the name is also on the thing you travel along.</p>
<div class="big"><div><b>{dn}</b><span>of {n}: a way you travel along carries the bridge's own name</span></div><div><b>{rn}</b><span>only the road's name; the bridge's name sits in a side tag</span></div><div><b>{sn}</b><span>no way in the extract says it at all; the name is on the structure alone</span></div></div>
{svg}
<div class="lg"><span>● the way says the bridge's name</span><span>◯ the way says only the road's</span><span>◌ nothing along it says it</span><span>1 = westmost, upstream</span></div>
<input class="sw" type="radio" name="s" id="sa" checked><input class="sw" type="radio" name="s" id="sb">
<div class="ctl" role="group" aria-label="Which name to show"><label for="sa">What the way says</label><label for="sb">What the bridge is called</label></div>
<table><thead><tr><th>#</th><th>Name</th><th>Opened</th><th class="w">Where it lives in the map</th><th>Along it</th></tr></thead><tbody>
{trs}</tbody></table>
<p class="mut">One click turns the right-hand names over. Without scripting the page keeps the first state and the table, and every number is printed.</p>

<h2>What was done</h2>
<p>The crossings are the seventeen bridges in the list on Wikipedia's <em>Singapore River</em> page (the MRT lines and the expressway tunnel on the same list are left out). For each, the OpenStreetMap data of 2026-10-02 was asked three things: is there a structure (<code>man_made=bridge</code>) with this name; is there a way you travel along (<code>highway</code>) with this name; is there a travelled way that carries a different name but holds this one in <code>bridge:name</code>. A crossing is counted as <em>says its name</em> if the second is yes, <em>says the road's</em> if only the third is, <em>says nothing</em> if neither. All seventeen have a structure.</p>
<p>The older road bridges are the ones that hide: Coleman, Elgin, Pulau Saigon and Anderson are crossed on Eu Tong Sen Street and New Bridge Road, North Bridge Road, Saiboo Street and Fullerton Road. The median opening year of the {dn} that say their name is {R['median_year_deck']}, of the {rn} that say the road's, {R['median_year_road']}. Five and seven bridges are too few to call that a pattern, and it is printed as a coincidence of small numbers.</p>

<h2>What it does not say</h2>
<ul>
<li>Nothing here says the map is wrong. The road is the road, and a tag is a legitimate place for a name. The page shows where a true name is kept, not an error.</li>
<li>Kim Seng and Clemenceau count as saying their name because a cycleway and a footway on them carry it; their carriageways say Kim Seng Road and Clemenceau Avenue. Cavenagh, Ord and Jubilee are foot bridges whose decks carry their names. Two rows would move to <em>says the road's</em> if a stricter rule asked for the main carriageway.</li>
<li>The Helix is the one near miss: its decks are named <q>The Helix</q> and its structure <q>Helix Bridge</q>, so by the exact-name rule it says nothing. Read, Robertson, Jiak Kim and Alkaff say nothing in the extract; whatever their decks are called, it is not their bridge's name. We did not look further.</li>
<li>Helix, Bayfront and Benjamin Sheares stand east of the last river line in this extract (they cross water beyond the river's mouth); they are on Wikipedia's list and so on this page. Positions are the centre of the structure or deck.</li>
<li>OpenStreetMap changes daily. These counts are of one extract, whose digest is in <code>results.json</code>; a later run may differ.</li>
</ul>

<h2>Neighbours in the Atlas, and the daylight</h2>
<p><strong><em>Here the River Lies</em> — Debbie Ding</strong> (Atlas entry; opened at the artist's pages <a href="http://dbbd.sg/river/">dbbd.sg/river</a> and <a href="https://dbbd.sg/works/here-the-river-lies.php">dbbd.sg/works</a>: the hand-drawn map, the index of stories in 35 categories, the account of mapmakers' planted false features and the 2007 Singapore case). Hers is a river made by visitors' memories, and it deliberately does not tell the true from the invented. This page takes the same river into the map machines read, where nothing is invented and every claim can be checked by an OpenStreetMap id: it shows that even there a name can sit one level away from the place you stand.</p>
<p><strong><em>The Library of Missing Datasets</em> — Mimi Ọnụọha</strong> (cited from its Atlas line, not opened this session). Her folders are empty because the data was never collected; here nothing is uncollected, the data is on the map, and the gap is in where it is attached.</p>
<p class="mut">The page is not a copy of either. It makes no claim about the cataloguing choices of the mappers or of any person.</p>

<h2>Sources</h2>
<p><small>Map data © OpenStreetMap contributors, ODbL 1.0, via an Overpass mirror, base timestamp {R['osm_base_timestamp']}; the derived table is <code>osm-extract.json</code> (names, ids and the tags used; the river as eleven way geometries). List of bridges: Wikipedia, <em>Singapore River</em>, read 2026-10-02. Ding: dbbd.sg as above. <code>fetch.py</code> reproduces the extract; <code>analysis.py</code> makes <code>results.json</code>; <code>verify.mjs</code> recomputes it in a second language and reads the page back.</small></p>
</main></body></html>
"""
open("index.html", "w").write(page)
print(len(page))
