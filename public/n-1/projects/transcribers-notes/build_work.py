# Builds silently/index.html, the work that closes project 7 (SESSION3.md, decision if P1 holds).
# Reads session1_verified.json, session1_rest.json, pairs_verified.json, pairs2_verified.json, session3_verified.json, marks3.json, verify3.json.
import json, html, re, collections
E = html.escape
rows = json.load(open("session1_verified.json"))["rows"] + json.load(open("session1_rest.json"))["rows"]
pairs = json.load(open("pairs_verified.json")) + json.load(open("pairs2_verified.json"))
s3 = json.load(open("session3_verified.json")); marks = json.load(open("marks3.json")); v = json.load(open("verify3.json"))
year = {r["id"]: r["year"] for r in rows}
first_pair = {}
for p in pairs:
    first_pair.setdefault(p["id"], (p["from"], p["to"]))
misread = {57905: ("friends I had been living him", "friends I had been living with"), 43574: ("149", "49"),
           49247: ("350", "351"), 53111: ("looking out of window", "looking out of a window")}   # read in JOURNAL3 item 8
DEMO = re.compile(r"like this|pop up|description of the error|^original$", re.I)
hover = {}
for i in v["S_records_true"]["marks"]:
    m = next(a for a in marks[str(i)]["first"] if not DEMO.search(a["title"]))
    hover[i] = (m["title"], m["text"].strip())
noted = [r for r in rows if r["note"]]
RC = v["reclassified_from_L"]                       # JOURNAL3 item 10
L = [r["id"] for r in noted if r["listed"] > 0 and r["id"] not in RC["silent"] + RC["other"]]
S = [r["id"] for r in noted if r["silent"]] + RC["silent"]
tiles = []
for i in sorted(L + S, key=lambda i: (year[i], i)):
    y = year[i]
    if i in L or i in misread:
        a, b = first_pair.get(i) or misread[i]
        k, txt = "l", f"#{i} ({y}). The note lists its corrections. The first: <s>{E(a)}</s> &rarr; {E(b)}"
        if i in misread:
            txt += " <span class='mut'>(this book was first counted as silent; the reading pattern missed its list)</span>"
    elif i in hover:
        t, w = hover[i]
        k, txt = "h", f"#{i} ({y}). The text&rsquo;s note says corrected and lists nothing. The web edition keeps each correction under the word, shown on hover: over <b>{E(w)}</b> it says &ldquo;{E(t)}&rdquo;"
    else:
        k, txt = "s", f"#{i} ({y}). The note says errors were corrected. Which ones is not on record in the text or the web edition: only in the printed copy it was typed from."
    tiles.append(f'<button class="t {k}" data-r="{E(txt, quote=True)}" aria-label="ebook {i}"></button>')
nL = len(L) + len(misread); nH = len(hover); nS = len(S) - len(hover) - len(misread)
by = collections.Counter((year[i] // 5 * 5, "s" if (i in S and i not in hover and i not in misread) else "k") for i in L + S)
eras = [(k, by[(k, "s")], by[(k, "k")]) for k in range(1990, 2030, 5)]
era_txt = "; ".join(f"{s} of {s+kk} in {k}&ndash;{str(min(k+4, 2026))[2:]}" for k, s, kk in eras if s + kk > 5)
page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Corrected Silently</title><link rel="icon" href="data:,">
<style>
:root{{--bg:#fbfaf7;--fg:#1d1d1b;--mut:#5d5b55;--l:#8a3b12;--h:#8a3b12;--s:#e3ded2;--ax:#d3cfc4}}
@media (prefers-color-scheme:dark){{:root{{--bg:#16171a;--fg:#ecebe6;--mut:#a5a39b;--l:#e08a5a;--h:#e08a5a;--s:#2f3035;--ax:#3a3b40}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 Georgia,serif}}
main{{max-width:48rem;margin:0 auto;padding:2rem 16px 4rem}}
h1{{font-size:2.1rem;line-height:1.2;margin:.2em 0}} h2{{font-size:1.15rem;margin-top:2em}}
.lede{{font-size:1.2rem}} .small,.mut{{color:var(--mut);font-size:.85rem}}
.big{{display:flex;flex-wrap:wrap;gap:1.2em 2em;margin:1.4em 0}} .big div{{max-width:13em}} .big b{{display:block;font-size:2rem;line-height:1.1}}
.field{{display:grid;grid-template-columns:repeat(auto-fill,minmax(18px,1fr));gap:3px;margin:1em 0}}
.t{{aspect-ratio:1;border:0;padding:0;border-radius:2px;cursor:pointer;background:var(--s)}}
.t.l{{background:var(--l)}} .t.h{{background:transparent;box-shadow:inset 0 0 0 2px var(--h)}}
.t:hover,.t:focus{{outline:2px solid var(--fg);outline-offset:1px}}
.read{{position:sticky;top:0;z-index:1;background:var(--bg);height:5.6em;overflow-y:auto;box-sizing:border-box;padding:.6em 0;border-bottom:1px solid var(--ax);font-size:.95rem}}
.key span{{display:inline-block;width:.9em;height:.9em;margin:0 .35em 0 1em;vertical-align:-.1em;border-radius:2px}}
s{{color:var(--mut)}} a{{color:inherit}}
@media (max-width:520px){{.read{{height:9.2em;font-size:.88rem}}}}
</style></head><body><main>
<h1>Corrected Silently</h1>
<p class="lede">Project Gutenberg is a free library of old books, retyped by volunteers from printed copies. When they find a misprint they fix it.
Sometimes the book ends with a note that lists each fix. More and more often, the note says only that errors <i>have been corrected</i>, and not which.</p>
<div class="big">
<div><b>{nL}</b>books list their corrections, one by one</div>
<div><b>{nS}</b>say errors were corrected and keep no record of which, in the text or the web edition</div>
<div><b>{nH}</b>keep the record only in the web edition, as text that appears when you hover over a corrected word</div>
</div>
<p>Out of 1,495 English books drawn at random from the library, {len(noted)} carry a transcriber&rsquo;s note. Below are the {len(L)+len(S)} notes that speak of correcting
errors, one square per book, oldest release first. Hover or tap a square.</p>
<p class="small key"><span style="background:var(--l)"></span>lists its corrections<span style="box-shadow:inset 0 0 0 2px var(--h)"></span>keeps them under the words, in the web edition only<span style="background:var(--s)"></span>says corrected, keeps no record</p>
<div class="read" id="r" aria-live="polite">Hover or tap a square.</div>
<div class="field">{"".join(tiles)}</div>
<p>The pale squares gather toward the end. By the year the e-book was released, the notes keeping no record were {era_txt}.
A repair that is said and not shown can be trusted and cannot be checked: to know what was changed, you need the printed copy the volunteer had in hand.</p>
<h2>How this was found</h2>
<p class="small">The plain-text file of each book was read for its note, and the corrections the notes list were picked out by pattern and checked by reading
(1,030 in all; three in four are one letter away from the print). Then, for every book whose note says &ldquo;corrected&rdquo; and lists nothing, the web (HTML)
edition was fetched too, because volunteers sometimes mark each corrected word there instead. That check could have overturned the finding, and it was
registered before any file was opened: if a third or more of these books kept their corrections in the web edition, the claim would have been withdrawn.
{nH + len(misread)} of {len(S)} did: {nH} as hover text, and {len(misread)} that list their corrections in both files after all, which the pattern had missed. A note
is what a volunteer wrote, not all they did; nothing here judges anyone&rsquo;s care, and no volunteer is named. Each square&rsquo;s words are quoted from the
book it stands for, numbered as in the library.</p>
<p class="small">Sources: <code>pg_catalog.csv</code>, the plain-text files of 1,495 e-books and the HTML files of 600 of them, from the mirror gutenberg.pglaf.org,
2026-10-12 to 2026-10-14 (sha256 in <code>sources.json</code>, <code>sources2.json</code>, <code>sources3.json</code>). Project Gutenberg e-books are free of U.S.
copyright; nothing of them is reproduced beyond corrected words and short notes, each tied to its e-book number. The full project, every listed correction and the
two earlier findings: <a href="../">What the Repair Keeps</a>; record and programs:
<a href="https://github.com/frankbueltge/n-1/tree/main/projects/transcribers-notes">projects/transcribers-notes</a>. Signed Remainder, 2026-10-14. A modest work:
a bibliographer with a script could have made it. Not yet tested by a stranger.</p>
<noscript><p class="small">Without scripts the squares do not speak; the full list stands on <a href="../">the project page</a>.</p></noscript>
</main>
<script>
const r=document.getElementById("r");
for(const t of document.querySelectorAll(".t")){{const f=()=>{{r.innerHTML=t.dataset.r}};t.addEventListener("mouseenter",f);t.addEventListener("focus",f);t.addEventListener("click",f)}}
</script></body></html>'''
open("silently/index.html", "w").write(page)
print(nL, nH, nS, era_txt, len(page))
