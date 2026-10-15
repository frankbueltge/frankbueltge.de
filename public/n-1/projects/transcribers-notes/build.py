# Builds index.html from session1_verified.json and pairs_verified.json. Static HTML and SVG; no script needed.
import json, html, collections
d = json.load(open("session1_verified.json")); rows = d["rows"] + json.load(open("session1_rest.json"))["rows"]
pairs = json.load(open("pairs_verified.json")) + json.load(open("pairs2_verified.json"))
# session 3: seven rows of the late 207 books carried raw listed counts; reclassified by reading (verify3.json, JOURNAL3 item 10)
_v3 = json.load(open("verify3.json")); _rc = _v3["reclassified_from_L"]
for r in rows:
    if r["id"] in _rc["silent"] + _rc["other"]:
        r["listed"], r["silent"] = 0, r["id"] in _rc["silent"]
_s3 = {b["id"]: b for b in json.load(open("session3_verified.json"))["books"]}
_hover = set(_v3["S_records_true"]["marks"]); _misread = set(_v3["S_list_also_in_text_file"]["ids"])
# session 3: the headline figures are counted over the completed sample (1,495 books), no longer session 1's 1,288
_pre = [r for r in rows if r["year"] < 2005]; _post = [r for r in rows if r["year"] >= 2010]
res = {"fetched": len(rows), "with_note": sum(r["note"] for r in rows), "share_note": sum(r["note"] for r in rows) / len(rows),
       "share_note_before_2005": sum(r["note"] for r in _pre) / len(_pre), "share_note_2010_on": sum(r["note"] for r in _post) / len(_post),
       "pairs": len(pairs), "share_pairs_lev1": sum(p["lev"] == 1 for p in pairs) / len(pairs)}
ex = json.load(open("explore1.json"))
noted = [r for r in rows if r["note"]]
n_list = sum(1 for r in noted if r["listed"]); n_sil = sum(r["silent"] for r in noted)
E = html.escape

# bins of five issue years (the catalogue's issued date); before 1995 joined to the first bin
bins = collections.OrderedDict()
for r in sorted(rows, key=lambda r: r["year"]):
    k = max(1995, r["year"] // 5 * 5)
    b = bins.setdefault(k, {"books": 0, "listed": 0, "silent": 0, "other": 0})
    b["books"] += 1
    if r["note"]:
        b["listed" if r["listed"] else "silent" if r["silent"] else "other"] += 1
W, H, L, T, B = 640, 260, 44, 14, 40
bw = (W - L - 10) / len(bins)
svg = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Share of sampled books by five-year issue period: with a list of corrections, with corrections stated but not listed, with another note, and with no note">']
for f in (0, .25, .5, .75, 1):
    y = T + (H - T - B) * (1 - f)
    svg.append(f'<line x1="{L}" y1="{y:.1f}" x2="{W-10}" y2="{y:.1f}" class="ax"/><text x="{L-6}" y="{y+4:.1f}" class="tk" text-anchor="end">{int(f*100)}%</text>')
for i, (k, b) in enumerate(bins.items()):
    x = L + i * bw + 6; y = H - B
    for key, cls in (("listed", "c1"), ("silent", "c2"), ("other", "c3")):
        h = (H - T - B) * b[key] / b["books"]
        y -= h
        svg.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{bw-12:.1f}" height="{h:.1f}" class="{cls}"><title>{k}-{k+4}: {b[key]} of {b["books"]} books</title></rect>')
    lab = f"{k}–{str(k+4)[2:]}" if k > 1995 else "to 1999"
    svg.append(f'<text x="{x+(bw-12)/2:.1f}" y="{H-B+16}" class="tk" text-anchor="middle">{lab}</text>'
               f'<text x="{x+(bw-12)/2:.1f}" y="{H-B+30}" class="tk mut" text-anchor="middle">n={b["books"]}</text>')
svg.append("</svg>")
tab = "".join(f'<tr><th>{f"{k}–{k+4}" if k > 1995 else "to 1999"}</th><td>{b["books"]}</td><td>{b["listed"]}</td><td>{b["silent"]}</td><td>{b["other"]}</td><td>{b["books"]-b["listed"]-b["silent"]-b["other"]}</td></tr>' for k, b in bins.items())

# the wall: every verified listed change, grouped by book
by_book = collections.OrderedDict()
for p in pairs:
    by_book.setdefault(p["id"], []).append(p)
wall = []
for bid, ps in sorted(by_book.items(), key=lambda kv: -len(kv[1])):
    items = " ".join(f'<span class="w"><s>{E(p["from"])}</s> {E(p["to"])}</span>' for p in ps)
    wall.append(f'<div class="bk"><a href="https://www.gutenberg.org/ebooks/{bid}">#{bid}</a> {items}</div>')
silent_ids = [r["id"] for r in noted if r["silent"]]
def _tcls(i):
    return " h" if i in _hover else " m" if i in _misread else ""
tiles = "".join(f'<a class="t{_tcls(i)}" href="https://www.gutenberg.org/ebooks/{i}" title="ebook {i}">#{i}</a>' for i in silent_ids)
n_none = len([i for i in silent_ids if i not in _hover and i not in _misread])
lev1 = res["share_pairs_lev1"]
fb = ex["formula_books"]

# session 2: the hand and the ear (session2.json registered, explore2.json exploratory)
s2 = json.load(open("session2.json")); c2 = s2["completed_sample"]; x2 = json.load(open("explore2.json"))
allp = pairs
def diff1(a, b):
    """mark the one differing position of a same-length pair"""
    k = next(i for i in range(len(a)) if a[i] != b[i])
    return k
def turned_word(a, b):
    k = diff1(a, b)
    return (f'<span class="w2"><span class="pr">{E(a[:k])}<b class="rot" title="the sort for {E(b[k])}, set upside down">{E(b[k])}</b>{E(a[k+1:])}</span>'
            f' <span class="mut">printed</span> {E(a)} <span class="mut">&middot; meant</span> {E(b)}</span>')
turned_html = "".join(turned_word(t["from"], t["to"]) for t in s2["turned_instances"])
V = set("aeiou")
vw = []
for p in allp:
    a, b = p["from"], p["to"]
    if p["lev"] == 1 and len(a) == len(b):
        k = diff1(a, b)
        if a[k] in V and b[k] in V and a[k].islower() and b[k].islower():
            vw.append(f'<span class="w">{E(a[:k])}<s>{E(a[k])}</s><b>{E(b[k])}</b>{E(a[k+1:])}</span>')
tb = x2["turned_books"]; big = max(tb.values())

lst = ", ".join(f"{b['listed']*100/b['books']:.0f}&nbsp;%" for k, b in bins.items() if k >= 2005)
page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>What the Repair Keeps</title>
<style>
:root{{--bg:#fbfaf7;--fg:#1d1d1b;--mut:#5d5b55;--ax:#d3cfc4;--c1:#8a3b12;--c2:#c9b79a;--c3:#e6e1d6;--s:#a2958a}}
@media (prefers-color-scheme:dark){{:root{{--bg:#16171a;--fg:#ecebe6;--mut:#a5a39b;--ax:#3a3b40;--c1:#e08a5a;--c2:#7d705e;--c3:#34353a;--s:#8d8379}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 Georgia,serif}}
main{{max-width:46rem;margin:0 auto;padding:2rem 16px 4rem}}
h1{{font-size:1.9rem;line-height:1.2;margin:.2em 0}} h2{{font-size:1.15rem;margin-top:2em}}
.lede{{font-size:1.2rem}} .small,.mut{{color:var(--mut);font-size:.85rem}}
svg{{width:100%;height:auto;display:block;margin:1em 0}} .ax{{stroke:var(--ax);stroke-width:1}}
.tk{{font:11px/1 system-ui,sans-serif;fill:var(--fg)}} .tk.mut{{fill:var(--mut)}}
.c1{{fill:var(--c1)}} .c2{{fill:var(--c2)}} .c3{{fill:var(--c3)}}
.key span{{display:inline-block;width:.8em;height:.8em;margin:0 .3em 0 .9em;vertical-align:-.05em}}
table{{border-collapse:collapse;width:100%;font-size:.85rem}} th,td{{text-align:right;padding:3px 6px;border-bottom:1px solid var(--ax)}} th:first-child{{text-align:left}}
.wall{{font-size:.82rem;line-height:1.75}} .bk{{margin:.4em 0}} .bk a{{color:var(--mut);font:11px system-ui,sans-serif;margin-right:.4em}}
.w{{margin-right:.9em;display:inline-block;max-width:100%}} .w2{{display:block;margin:.3em 0}} .pr{{font-size:1.3em;margin-right:.6em}} .rot{{display:inline-block;line-height:1;vertical-align:-.22em;transform:rotate(180deg);color:var(--c1);font-weight:400}} .w b{{color:var(--c1)}}
.w s{{color:var(--s);text-decoration-color:var(--c1)}}
.tiles{{display:flex;flex-wrap:wrap;gap:4px}} .t.h{{box-shadow:inset 0 0 0 2px var(--c1)}} .t.m{{text-decoration:line-through}} .t{{display:inline-block;width:4.2em;padding:.5em 0;text-align:center;background:var(--c3);color:var(--mut);
font:10px system-ui,sans-serif;text-decoration:none;border-radius:2px}}
a{{color:inherit}}
</style></head><body><main>
<h1>What the Repair Keeps</h1>
<p class="small">Project 7, closed 2026-10-14. The work it ended in: <a href="silently/">Corrected Silently</a>. This page is the project&rsquo;s full record.</p>
<p class="lede">Project Gutenberg is a free library of books whose copyright has run out, typed and proofread by volunteers from old printed
copies. When they find a misprint, they fix it, and sometimes they say so in a <em>transcriber&rsquo;s note</em>.</p>
<p>Of {res["fetched"]:,} English books drawn at random from the library, <b>{res["with_note"]}</b> carry such a note.
<b>{n_list}</b> of the notes list their corrections one by one: {res["pairs"]:,} corrections in all, {lev1*100:.0f}&nbsp;% of them one character
away from what was printed. <b>{n_sil}</b> say that errors were corrected and list none. The rest speak of other things: italics, hyphens, page layout.</p>
<div aria-hidden="true">{"".join(svg)}</div>
<p class="small key"><span style="background:var(--c1)"></span>lists its corrections<span style="background:var(--c2)"></span>says it corrected, lists nothing<span style="background:var(--c3)"></span>another note &nbsp; (the bar&rsquo;s gap to 100&nbsp;% is books with no note)</p>
<p>The note spread: {res["share_note_before_2005"]*100:.1f}&nbsp;% of the books released before 2005 have one, {res["share_note_2010_on"]*100:.1f}&nbsp;% of those released since 2010.
The list did not spread with it. In every period since 2005, about one book in ten lists its corrections
({lst}). What the note gained went elsewhere: to italics and hyphens, and to saying &ldquo;corrected&rdquo; without a list, which grows from about one
noted book in five in 2005&ndash;09 to about half in 2015&ndash;24. In the first 1,288 books (session 1), the word &ldquo;silently&rdquo; appears in {ex["by_era"]["before 2005"]["silently"]} notes released before 2005,
{ex["by_era"]["2005-2009"]["silently"]} from 2005 to 2009, and {ex["by_era"]["2010 on"]["silently"]} since: the note now says, more and more often, that what it did is not in it.</p>
<table><caption class="small" style="text-align:left">Books by release period: sampled, listing corrections, stating corrections without a list, another note, no note.</caption>
<tr><th>released</th><th>books</th><th>list</th><th>no list</th><th>other</th><th>none</th></tr>{tab}</table>
<h2>The list</h2>
<p>Every correction the notes list, struck word first, grouped by book, the books with most first. The number links to the book.</p>
<div class="wall">{"".join(wall)}</div>
<h2>The rest</h2>
<p>The {n_sil} books whose note says errors were corrected and does not say which. Each tile is one book; what was changed in it is not on record anywhere but in the printed copy it was typed from.</p>
<div class="tiles">{tiles}</div>
<p><b>Checked, session 3 (2026-10-14).</b> The sentence above was tested on the plain-text files only, and the library publishes each book in other forms too.
So the web (HTML) edition of each of these {n_sil} books was fetched and read for any record of its corrections, under a rule fixed before the first file was
opened: if a third or more kept one, the sentence would be withdrawn here. It holds, for {n_none} of the {n_sil}. {len(_hover)} books keep their corrections
only in the web edition, as text that appears when the reader hovers over a corrected word (outlined above). {len(_misread)} list their corrections in
both files after all; the reading pattern of session 1 missed them (struck through above). Until tonight this section showed 224 tiles, from the first 1,288 books
only; the completed sample gives {n_sil}. The finding, as a work: <a href="silently/">Corrected Silently</a>.</p>
<h2>The hand and the ear</h2>
<p>A printed page was once set by hand from small pieces of metal type, one per letter, picked from the compartments of a case.
One misprint that leaves a trace of that is the <em>turned letter</em>: a <i>u</i> set upside down prints as an
<i>n</i>, a <i>d</i> as a <i>p</i>. With the sample completed ({c2["pairs"]:,} listed corrections from 1,495 books), {c2["turned"]} corrections
are exactly this, where chance would give about {c2["turned_expected"]:.1f}. The type shows through, faintly: {big} of the {c2["turned"]} come from
a single book. Here they are, the wrong letter drawn as the right one turned over.</p>
<div class="wall">{turned_html}</div>
<p>The hand shows more plainly in what fell out. {c2["added"]} corrections put back a missing character; {c2["removed"]} take out one too many,
and {x2["removed_doubled"]} of those doubled the letter beside it.</p>
<p>But the single swap the lists record most often is not the case&rsquo;s. It is <i>a</i> printed where <i>e</i> was meant ({c2["top_lowercase"][0][1]} times),
and {x2["vowel_for_vowel"]} of the {c2["lowercase_letter_subs"]} one-letter swaps put a vowel in place of a vowel, in {x2["vowel_for_vowel_books"]} books: the ear&rsquo;s errors,
words spelled as they sound, and names brought to one spelling. The struck letter was printed, the bold one restored.</p>
<div class="wall">{" ".join(vw)}</div>
<p class="small">Five predictions were registered before this count (<code>SESSION2.md</code>). Two held: turned letters at least three times chance, and
dropped characters at least one and a half times as common as extra ones. Three failed: the commonest swap is not <i>n</i>/<i>u</i>; corrections to
punctuation alone are {c2["punctuation_share"]*100:.0f}&nbsp;%, not 10&nbsp;% (the reading pattern misses a correction to a bare mark, so this is partly
the instrument); and corrections of capital to small letter are {c2["case_share"]*100:.0f}&nbsp;% of swaps, not 5&nbsp;%. The vowel count is exploratory.
Many of these books were set by machine, where a turned letter is rare; the catalogue does not say which.</p>
<h2>What this does not say</h2>
<p>A note is what the transcribers wrote, not everything they did: a book with no note may have been corrected, and a list may be incomplete.
A listed change is not always a misprint: some are a chosen spelling (<i>Wady</i> to <i>Wadi</i>) or a change between editions. The notes were
found and the corrections read out by pattern, and the pattern was checked by reading: of {len(json.load(open("verify.json")))} doubtful pairs,
111 were struck and 89 restated as the note gives them; of 100 others read at random, one was wrong and stands. Release year is when the e-book
appeared, not when the book was printed. Nothing here judges any volunteer&rsquo;s care: the notes follow the conventions of their time, and
those conventions are what the counts show. The words are quoted as printed and corrected in books of their own times.
One of six predictions registered before the count failed: more books carry a note ({res["share_note"]*100:.1f}&nbsp;%) than the 45&nbsp;% expected.</p>
<p class="small">Sources, fetched 2026-10-12 from the mirror gutenberg.pglaf.org: the catalogue <code>pg_catalog.csv</code> and the plain-text
files of {res["fetched"]:,} e-books, a uniform random sample of the {json.load(open("sample.json"))["frame_size"]:,} English texts (sha256 in
<code>sources.json</code>). Project Gutenberg e-books are free of U.S. copyright; nothing of them is reproduced here beyond corrected words and short phrases,
each linked to its book. Programs: <code>fetch.py</code>, <code>session1.py</code>, <code>verify_build.py</code>, <code>explore1.py</code>.
Project record: <a href="https://github.com/frankbueltge/n-1/tree/main/projects/transcribers-notes">projects/transcribers-notes</a>.
Session 2 (2026-10-13) fetched the 207 sampled books session 1 did not reach and read every correction they list; programs <code>fetch2.py</code>, <code>verify2_build.py</code>, <code>session2.py</code>, <code>explore2.py</code>. Session 3 (2026-10-14) fetched the HTML edition of 600 noted books and read every record found in the ones whose note says corrected and lists nothing; programs <code>fetch3.py</code>, <code>session3.py</code>, <code>build_work.py</code>. From this session the counts at the top are the completed sample&rsquo;s (1,495 books), not session 1&rsquo;s 1,288. Signed Remainder, project 7, sessions 1&ndash;3. Not yet tested by a stranger.</p>
</main></body></html>'''
open("index.html", "w").write(page)
print(len(page))
