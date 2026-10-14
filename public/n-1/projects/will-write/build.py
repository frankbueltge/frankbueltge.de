# Builds index.html (project 8's page) from session1.json, session1_rows.json and excerpts.json; session 2 adds q1_rows.json
# (the register of will-write letters) and q2.json (the Commons years between).
# Static HTML; one small script shows the sentence of a tapped mark. Nothing is fetched at load.
# Contains Parliamentary information licensed under the Open Parliament Licence v3.0.
import json, html

S = json.load(open("session1.json"))
rows = json.load(open("session1_rows.json"))
V = json.load(open("verify.json"))["by_house_year"]
for r in rows:
    r["library"] = r["library_verified"]  # read by hand, verify.py
ex = json.load(open("excerpts.json"))
Q1 = {r["id"]: r for r in json.load(open("q1_rows.json"))}
Q1S = json.load(open("q1.json"))
for r in rows:
    q = Q1.get(r["id"])
    r["back"] = 1 if q and q["letter_back"] else (2 if q and q["bill_id"] and q["year"] >= 2015 else 0)
E = html.escape
T = S["table"]
years = sorted({int(k.split("-")[1]) for k in T})
P = [r for r in rows if r["promise"]]
n_lib = sum(r["library"] for r in P)


def api(r):
    return f"https://hansard-api.parliament.uk/debates/debate/{r['debate_id']}.json"


order = []
lanes = []
for y in years:
    for h in ("Commons", "Lords"):
        t = T[f"{h}-{y}"]
        marks = [r for r in P if r["year"] == y and r["house"] == h]
        marks.sort(key=lambda r: (not r["library"], r["date"]))
        ms = ""
        for r in marks:
            ms += f'<button class="m{" l" if r["library"] else ""}{" b" if r["back"] == 1 else ""}" data-i="{len(order)}" aria-label="{E(r["date"])}"></button>'
            order.append(r)
        lanes.append(
            f'<div class="lane"><div class="lab"><b>{y}</b> {h}<br><span class="mut">{t["promise"]} of {t["spoken"]:,} '
            f'&middot; {t["rate_per_10k"]} per 10,000 &middot; {V[f"{h}-{y}"]} promise a copy to the Library</span></div><div class="ms">{ms}</div></div>')

titles = sorted({r["debate"] or "" for r in order})
ti = {t: i for i, t in enumerate(titles)}
data = {"T": titles, "R": [[r["date"], r["house"][0], ti[r["debate"] or ""], ex.get(r["id"], ""), r["debate_id"], int(r["library"]), r["back"]]
                           for r in order]}
rate_rows = "".join(
    f'<tr><th>{y}</th>' + "".join(
        f'<td>{T[f"{h}-{y}"]["spoken"]:,}</td><td>{T[f"{h}-{y}"]["promise"]}</td><td>{T[f"{h}-{y}"]["rate_per_10k"]}</td>'
        f'<td>{V[f"{h}-{y}"]}</td>' for h in ("Commons", "Lords")) + "</tr>" for y in years)

YEARS_BETWEEN = ""
try:
    Q2 = json.load(open("q2.json"))
    ys = sorted(int(y) for y in Q2["commons_by_year"])
    mx = max(Q2["commons_by_year"][str(y)]["promise"] for y in ys)
    bars = "".join(
        f'<div class="yb" title="{y}: {Q2["commons_by_year"][str(y)]["copy"]} of {Q2["commons_by_year"][str(y)]["promise"]}">'
        f'<i style="height:{round(80 * Q2["commons_by_year"][str(y)]["promise"] / mx)}px;margin-top:{80 - round(80 * Q2["commons_by_year"][str(y)]["promise"] / mx)}px"></i>'
        f'<span>{str(y)[2:]}</span>' + "<b></b>" * Q2["commons_by_year"][str(y)]["copy"] + '</div>' for y in ys)
    BURY = next(r["debate_id"] for r in json.load(open("q2_rows.json"))["rows"] if r["id"] == "957bbafa-eea1-4907-a321-62d3c62d9e88")
    YEARS_BETWEEN = f"""<h2 id="between">The years between</h2>
<p class="sm mut">Read with: <a href="#rate">the rate</a> (the ten sampled years) and <a href="#return">the return</a> (why the
saying could stop).</p>
<p>Every Commons year from {ys[0]} to {ys[-1]}, read the same way: each grey bar is a year's promises to write (the tallest is {mx}), and
under the year each blue square is one promise that says a copy goes to the Library. {Q2["summary"]} Not a turn, a fade, while the promises
rose. The clause had a history of its own: in 2003 and 2004 members complained in the chamber that the same words, given as a written
answer, kept replies off the record, "a way of burying bad news because the true reply never appears in Hansard"
(<a href="https://hansard-api.parliament.uk/debates/debate/{BURY}.json">2004</a>).</p>
<div class="yrs">{bars}</div>"""
except OSError:
    pass

page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>I Will Write</title><link rel="icon" href="data:,">
<meta name="description" content="Every time, in ten sampled years of the UK Parliament's record, a minister answered a question in the chamber by promising to write.">
<style>
:root{{--bg:#fbfaf7;--fg:#1d1d1b;--mut:#6b6a64;--line:#d9d6cc;--post:#b4b0a3;--lib:#1f5f8b;--back:#b0571c;--panel:#f1efe8}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#151513;--fg:#ecebe6;--mut:#a3a197;--line:#3a3934;--post:#5b5951;--lib:#6fb3e0;--back:#f0a060;--panel:#22221f}}}}
:root[data-theme="dark"]{{--bg:#151513;--fg:#ecebe6;--mut:#a3a197;--line:#3a3934;--post:#5b5951;--lib:#6fb3e0;--back:#f0a060;--panel:#22221f}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 Georgia,serif}}
main{{max-width:980px;margin:0 auto;padding:28px 16px 80px}}h1{{font-size:2rem;margin:.2em 0}}h2{{font-size:1.2rem;margin-top:2.4em}}
.mut{{color:var(--mut)}}.sm{{font:13px/1.45 system-ui,sans-serif}}a{{color:var(--lib)}}
nav.ent{{display:flex;flex-wrap:wrap;gap:8px 18px;font:14px system-ui,sans-serif;margin:14px 0 6px}}
.lane{{display:grid;grid-template-columns:200px 1fr;gap:12px;border-top:1px solid var(--line);padding:8px 0}}
.lab{{font:13px/1.35 system-ui,sans-serif}}.ms{{display:flex;flex-wrap:wrap;gap:3px;align-content:flex-start}}
.m{{width:11px;height:8px;border:0;padding:0;background:var(--post);cursor:pointer;border-radius:1px}}.m.l{{background:var(--lib)}}
.m.b{{box-shadow:inset 0 -3px 0 var(--back)}}.m:focus,.m.on{{outline:2px solid var(--fg);outline-offset:1px}}
#say{{position:sticky;bottom:0;background:var(--panel);border-top:1px solid var(--line);padding:12px 16px;min-height:4.5em;font-size:15px}}
.key span{{display:inline-block;width:11px;height:8px;margin:0 4px 0 10px;vertical-align:middle}}
table{{border-collapse:collapse;font:13px system-ui,sans-serif;width:100%}}th,td{{padding:3px 6px;border-bottom:1px solid var(--line);text-align:right}}
.tw{{overflow-x:auto}}.yrs{{display:flex;gap:3px;align-items:flex-end;overflow-x:auto;padding:8px 0}}
.yb{{display:flex;flex-direction:column;align-items:center;font:10px system-ui,sans-serif;color:var(--mut);min-width:18px}}
.yb i{{display:block;width:12px;background:var(--post)}}.yb b{{display:block;width:10px;height:5px;background:var(--lib);margin-top:2px}}.yrs{{align-items:flex-start}}
.yb{{justify-content:flex-start}}.yb i{{margin-top:auto}}@media (max-width:600px){{.lane{{grid-template-columns:1fr}}}}
</style></head><body><main>
<p class="sm mut">Remainder &middot; project 8, sessions 1-2 &middot; 2026-10-14</p>
<h1>I will write</h1>
<p>In the UK Parliament a question asked in the chamber is asked in public. A minister who cannot or will not answer it there can say:
<i>I will write to the honourable Member.</i> In that sentence the answer leaves the public record and becomes a letter between two
people. Sometimes the minister adds that a copy will go to the Library of the House, where the public can find it again.</p>
<p>The promises roughly doubled in the Commons between the 1980s and the 2020s (217 in the three years 1980, 1985 and 1990; 466 in
2015, 2020 and 2025), and tripled in the Lords (244; 682). The copy for the Library is said less and less: in the Commons 15 times in
2000 and 2005 together, and not once in the 172 promises of 2025. But for promises made in debates on bills, the saying was no longer
needed. Since 2014 Parliament files those letters itself, in a public register. Of the Commons promises made on bills in 2015, 2020
and 2025, about half have a letter on the same bill filed within sixty days; in the Lords, about three in four. The way back stopped
being spoken when it became a filing. Promises made outside bill debates, most of them, have no such register.</p>
<p>Below is every such promise found in ten sampled years, {years[0]} to {years[-1]}, in both Houses: {len(P):,} spoken contributions.
Each mark is one. Tap a mark to read the sentence. <span class="key sm"><span style="background:var(--post)"></span>sent to the post
<span style="background:var(--lib)"></span>said in the same breath that a copy goes to the Library ({n_lib:,})</span></p>
<nav class="ent" aria-label="Entryways, in any order"><a href="#post">The post</a><a href="#rate">The rate</a><a href="#return">The return</a><a href="#between">The years between</a><a href="#how">How this was found</a></nav>

<h2 id="post">The post</h2>
<p class="sm mut">Read with: <a href="#rate">the rate</a> (how large each year was) and <a href="#return">the return</a> (what becomes of a letter).</p>
{''.join(lanes)}

<h2 id="rate">The rate</h2>
<p class="sm mut">Read with: <a href="#post">the post</a> (the marks these numbers count). Spoken contributions are the Hansard API's own count
for the House and year. A contribution counts once however many promises it holds. <b>Read the Lords rates with care:</b> the Lords
count of spoken contributions falls from 85,474 in 2004 to 30,185 in 2005, a step in how the record cuts speech into contributions,
not a change in how much was said (<a href="probe_denominators.json">the years between</a>). Lords rates before and after 2005 are not
comparable; the counts of promises are.</p>
<div class="tw"><table><thead><tr><th></th><th colspan="4" style="text-align:center">Commons</th><th colspan="4" style="text-align:center">Lords</th></tr>
<tr><th>year</th><th>spoken</th><th>promise</th><th>/10,000</th><th>Library</th><th>spoken</th><th>promise</th><th>/10,000</th><th>Library</th></tr></thead>
<tbody>{rate_rows}</tbody></table></div>

<h2 id="return">The return</h2>
<p class="sm mut">Read with: <a href="#post">the post</a> (a mark with an orange edge is a promise on a bill with a letter on that bill
filed within sixty days) and <a href="#rate">the rate</a>.</p>
<p>For bills, Parliament keeps a register of the letters ministers send after saying they will write. Its own page says these replies
"are not published in Hansard but are placed in the Library of the House concerned and published on the Parliamentary website"
(<a href="https://api.parliament.uk/bill-papers/publication-types/44">the register</a>). It begins in 2014. Each promise made in a
bill debate in 2010, 2015, 2020 and 2025 was matched to its bill, and the bill's letters were looked up.</p>
<div class="tw"><table><thead><tr><th>bill-debate promises</th><th>Commons</th><th>Lords</th></tr></thead><tbody>
{"".join(f'<tr><th>{y}</th>' + "".join(f'<td>{Q1S["by_house_year"][f"{h}-{y}"]["letter_back"]} of {Q1S["by_house_year"][f"{h}-{y}"]["matched"]}</td>' for h in ("Commons", "Lords")) + "</tr>" for y in (2010, 2015, 2020, 2025))}
</tbody></table></div>
<p class="sm">Read as: of the promises matched to a bill, how many have a letter on that bill filed from the day of the promise to sixty
days after. A bill can carry many letters, so a letter on the same bill is not shown to be the letter promised: the counts are upper
bounds on what came back. 2010 is empty because the register had not begun. {Q1S["frame"] - Q1S["matched"]} of {Q1S["frame"]}
promises could not be matched to a bill and are left out.</p>
{YEARS_BETWEEN}
<h2 id="how">How this was found</h2>
<p class="sm">The sample, the definitions and six predictions were written down and published before any promise was read
(<a href="SELECTION.md">SELECTION.md</a>); session 2's matching rule, the years between and five more predictions likewise
(<a href="SESSION2.md">SESSION2.md</a>; what happened: <a href="JOURNAL2.md">JOURNAL2.md</a>). Contributions were found with the Hansard API's phrase search and then read by a fixed
pattern; a promise is "I/we will/shall [up to two words] write to", and a blue mark is a promise whose contribution names the Library: all {n_lib + 27} such contributions were read, and the 27 where the Library holds something else (a
report, statistics, the British Library) are grey. What the search does not find is not counted, so every number is a floor. A random sample was read by hand to
measure the pattern's errors: <a href="JOURNAL.md">JOURNAL.md</a>. Names of members are not shown; each sentence links to its debate.</p>
<p class="sm mut">Contains Parliamentary information licensed under the
<a href="https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/">Open Parliament Licence v3.0</a>.</p>
</main>
<div id="say" aria-live="polite"><span class="mut sm">Tap a mark.</span></div>
<script>
const D={json.dumps(data, ensure_ascii=False)};
const say=document.getElementById('say');let on=null;
function esc(s){{return s.replace(/[&<>"]/g,c=>({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}})[c])}}
document.querySelectorAll('.m').forEach(b=>{{const f=()=>{{const q=D.R[+b.dataset.i],r={{d:q[0],h:q[1]=='C'?'Commons':'Lords',t:D.T[q[2]],s:q[3],u:'https://hansard-api.parliament.uk/debates/debate/'+q[4]+'.json',l:q[5]}};if(on)on.classList.remove('on');on=b;b.classList.add('on');
say.innerHTML='<span class="sm mut">'+r.d+' &middot; '+r.h+' &middot; '+esc(r.t||'')+(r.l?' &middot; a copy to the Library':'')+(q[6]==1?' &middot; a letter on this bill was filed in public within 60 days':(q[6]==2?' &middot; no letter on this bill was filed within 60 days':''))+'</span><br>&ldquo;'+esc(r.s)+'&rdquo; <a class="sm" href="'+r.u+'">debate</a>';}};
b.addEventListener('click',f);b.addEventListener('mouseenter',f);b.addEventListener('focus',f);}});
</script></body></html>
"""
open("index.html", "w").write(page)
print("index.html", len(page))
