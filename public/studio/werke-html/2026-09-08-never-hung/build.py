#!/usr/bin/env python3
"""NEVER HUNG — build.

Reads this repository, measures the record of every work this practice decided not to
make, verifies every sentence the page quotes against the file it is attributed to, and
writes data.json and index.html.

    python3 build.py            write data.json and index.html
    python3 build.py --check    rebuild into memory and fail on a one-byte drift
    python3 build.py --report   print the measurements and the checks, write nothing

No network. No library. No model is called anywhere in this build.
"""

import hashlib
import html
import json
import math
import os
import re
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)

from manifest import WORKS, REGISTER, CONCEPT, AFTER_BUILD, DIRECTION, RETURNED, HELD  # noqa: E402

TEXT_EXT = {".md"}
CODE_EXT = {".py", ".js", ".mjs", ".json", ".html", ".css", ".txt", ".csv", ".tsv"}
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".pdf"}


# ---------------------------------------------------------------- measuring

def words(text):
    """Whitespace-separated tokens. The one counting rule, used everywhere."""
    return len(text.split())


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as fh:
        return fh.read()


def expand(paths):
    """Expand a manifest path list into (relpath, bytes) pairs, sorted."""
    out = []
    for p in paths:
        full = os.path.join(ROOT, p)
        if os.path.isfile(full):
            out.append(p)
        elif os.path.isdir(full):
            for dirpath, dirnames, filenames in os.walk(full):
                dirnames.sort()
                for fn in sorted(filenames):
                    rel = os.path.relpath(os.path.join(dirpath, fn), ROOT)
                    out.append(rel)
        else:
            raise SystemExit("manifest names a path that does not exist: %s" % p)
    return sorted(set(out))


def classify(rel):
    ext = os.path.splitext(rel)[1].lower()
    if ext in TEXT_EXT:
        return "prose"
    if ext in IMAGE_EXT:
        return "image"
    if ext in CODE_EXT:
        return "other"
    return "other"


# ------------------------------------------------------- the register entry

ENTRY_START = re.compile(r"^(## |- \*\*20)", re.M)


def register_entry(anchor):
    """The bytes and words of one entry in memory/discarded.md, located by anchor."""
    text = read(REGISTER)
    i = text.find(anchor)
    if i < 0:
        raise SystemExit("register anchor not found in %s: %r" % (REGISTER, anchor[:60]))
    if text.count(anchor) != 1:
        raise SystemExit("register anchor is not unique: %r" % anchor[:60])
    start = text.rfind("\n", 0, i) + 1
    m = ENTRY_START.search(text, i + len(anchor))
    end = m.start() if m else len(text)
    entry = text[start:end].strip()
    return entry


# ------------------------------------------------------------ quote checking

def normalise(s):
    """Whitespace-collapsed, so a quote may be checked across a line break."""
    s = unicodedata.normalize("NFC", s)
    return re.sub(r"\s+", " ", s).strip()


def check_quote(quote, src):
    hay = normalise(read(src))
    if normalise(quote) not in hay:
        raise SystemExit("QUOTE NOT FOUND in %s: %r" % (src, quote[:70]))
    return True


# ------------------------------------------------------------------ the wall

def geometry(records):
    """Frame area is exactly proportional to the words written about the work.

    Side lengths: w = S*sqrt(words)*r, h = S*sqrt(words)/r, so w*h = S^2*words for
    every frame whatever r is. The proportion r is a clamped indicator of how many
    documents the work left: many short documents make a wide low frame, one long
    memo a tall narrow one. Clamping the proportion cannot distort the area.
    """
    docs = [max(1, r["files_prose"] + (1 if r["register_words"] else 0)) for r in records]
    med = sorted(docs)[len(docs) // 2]
    for r, d in zip(records, docs):
        ratio = (d / med) ** 0.25
        ratio = min(1.55, max(0.62, ratio))
        r["ratio"] = round(ratio, 4)
    return records


# ---------------------------------------------------------------- build data

def build_data():
    seen = {}
    records = []
    for w in WORKS:
        files = expand(w["paths"])
        for f in files:
            if f in seen:
                raise SystemExit("file assigned twice: %s (%s and %s)" % (f, seen[f], w["title"]))
            seen[f] = w["title"]

        prose, other, image = [], [], []
        for rel in files:
            kind = classify(rel)
            size = os.path.getsize(os.path.join(ROOT, rel))
            item = {"path": rel, "bytes": size}
            if kind == "prose":
                item["words"] = words(read(rel))
                prose.append(item)
            elif kind == "image":
                image.append(item)
            else:
                other.append(item)

        entry = register_entry(w["register_anchor"]) if w.get("register_anchor") else None
        entry_words = words(entry) if entry else 0
        # An entry made on the night this work was built, for a kill the register never
        # held. It is measured and printed, and it is NOT added to the work's record:
        # the wall measures what this practice actually kept, not what it wrote tonight.
        late = register_entry(w["late_anchor"]) if w.get("late_anchor") else None
        late_words = words(late) if late else 0

        for m in w["minutes"]:
            if not os.path.exists(os.path.join(ROOT, m)):
                raise SystemExit("minutes not found: %s" % m)
        check_quote(w["quote"], w["quote_src"])

        total_words = sum(p["words"] for p in prose) + entry_words
        records.append({
            "n": w["n"],
            "title": w["title"],
            "date": w["date"],
            "session": w["session"],
            "kind": w["kind"],
            "unregistered": bool(w.get("unregistered")),
            "held": bool(w.get("held")),
            "gloss": w["gloss"],
            "quote": w["quote"],
            "quote_src": w["quote_src"],
            "note": w.get("note"),
            "register_words": entry_words,
            "register_bytes": len(entry.encode("utf-8")) if entry else 0,
            "late_entry_words": late_words,
            "prose": prose,
            "other": other,
            "images": image,
            "files_prose": len(prose),
            "files_other": len(other),
            "files_image": len(image),
            "words": total_words,
            "minutes": w["minutes"],
        })

    geometry(records)

    reg = [r for r in records if not r["unregistered"] and not r["held"]]
    unreg = [r for r in records if r["unregistered"]]
    data = {
        "title": "NEVER HUNG",
        "date": "2026-09-08",
        "practice": "Ensemble — The Studio",
        "cycle": 3,
        "session": 131,
        "question": "Missing Data Art",
        "counting_rule": "A word is a whitespace-separated token. A work's record is the documents dedicated to it plus its entry in the register of refusals. Session minutes are cited and never counted: a journal file is the record of a whole evening.",
        "works": records,
        "totals": {
            "works": len(records),
            "registered": len(reg),
            "unregistered": len(unreg),
            "held": len([r for r in records if r["held"]]),
            "words": sum(r["words"] for r in records),
            "register_words": sum(r["register_words"] for r in records),
            "files": sum(r["files_prose"] + r["files_other"] + r["files_image"] for r in records),
            "prose_files": sum(r["files_prose"] for r in records),
            "images": sum(r["files_image"] for r in records),
            "sessions_span": [min(r["session"] for r in records), max(r["session"] for r in records)],
        },
        "register": {
            "path": REGISTER,
            "bytes": os.path.getsize(os.path.join(ROOT, REGISTER)),
            "entries": len([r for r in records if r["register_words"]]),
            "last_entry_date": max(r["date"] for r in records if r["register_words"]),
            "entries_at_measure": len([r for r in records if r["register_words"]]),
            "entries_after_repair": len([r for r in records
                                         if r["register_words"] or r["late_entry_words"]]),
            "repaired": "2026-09-08",
            "late_entry_words": sum(r["late_entry_words"] for r in records),
            "missing_kills": [r["title"] for r in records if r["unregistered"]],
            "not_a_kill_and_not_entered": [r["title"] for r in records if r["held"]],
            "also_recorded_in": "archive/workboard/WORKBOARD-sessions-01-114-2026-08-30.md",
        },
        "closing_report": {
            "path": "closing-report/index.html",
            "date": "2026-08-30",
            "claims": "Twenty proposals were killed",
            "counts_from": "Kills counted from the twenty dated entries in memory/discarded",
        },
    }
    return data


# --------------------------------------------------------------- the page

CSS = """
:root{
  --paper:#f2f0ec; --wall:#e7e4de; --ink:#191817; --soft:#5d5a55; --faint:#8d8880;
  --rule:#c9c4bb; --hair:#b4aea3; --card:#fbfaf8; --accent:#7a3b2e; --glass:#fdfcfa;
  --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
  --sans:ui-sans-serif,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;
  --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --paper:#131313; --wall:#1b1a19; --ink:#e8e5e0; --soft:#a8a39b; --faint:#7d786f;
    --rule:#37342f; --hair:#4a463f; --card:#1e1d1b; --accent:#c98a72; --glass:#101010;
  }
}
:root[data-theme="dark"]{
  --paper:#131313; --wall:#1b1a19; --ink:#e8e5e0; --soft:#a8a39b; --faint:#7d786f;
  --rule:#37342f; --hair:#4a463f; --card:#1e1d1b; --accent:#c98a72; --glass:#101010;
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--serif);
  font-size:17px;line-height:1.62;-webkit-text-size-adjust:100%}
.wrap{max-width:47rem;margin:0 auto;padding:0 1.25rem}
header{padding:4.5rem 0 2.2rem}
h1{font-family:var(--sans);font-weight:600;font-size:clamp(2.1rem,7vw,3.4rem);
  letter-spacing:.055em;margin:0 0 .5rem;line-height:1.02;text-transform:uppercase}
.dek{font-size:1.16rem;color:var(--soft);margin:0 0 1.5rem;max-width:34rem}
.stamp{font-family:var(--sans);font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;
  color:var(--faint);margin:0}
h2{font-family:var(--sans);font-size:.74rem;letter-spacing:.19em;text-transform:uppercase;
  color:var(--faint);font-weight:700;margin:3.4rem 0 1rem;padding-bottom:.5rem;
  border-bottom:1px solid var(--rule)}
h3{font-family:var(--sans);font-size:.98rem;letter-spacing:.02em;margin:0 0 .3rem;font-weight:600}
p{margin:0 0 1.05rem}
a{color:inherit}
strong{font-weight:600}
code,.path{font-family:var(--mono);font-size:.79em;color:var(--soft);word-break:break-word}
.lede{font-size:1.06rem}

/* ---- the wall ---- */
.wallouter{background:var(--wall);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);
  margin:2.2rem 0 0;padding:0}
.wallscroll{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}
.wall{--u:1px;position:relative;height:calc(var(--u)*430);padding:0 2rem;display:flex;
  align-items:center;gap:26px;width:max-content;min-width:100%}
.hangline{position:absolute;left:0;right:0;top:50%;height:1px;background:var(--hair);opacity:.75}
.frame{position:relative;flex:0 0 auto;height:100%;display:flex;flex-direction:column;
  align-items:center;justify-content:center;min-width:15px;text-decoration:none;color:inherit}
.box{display:block;background:var(--glass);border:1px solid var(--ink);
  box-shadow:0 1px 0 rgba(0,0,0,.14);position:relative;overflow:hidden}
.frame.unreg .box{border-style:dashed;border-color:var(--hair)}
.frame.held .box{border-style:double;border-width:3px}
.num{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);
  font-family:var(--sans);font-size:.63rem;letter-spacing:.1em;color:var(--faint)}
.frame:hover .box,.frame:focus-visible .box{border-color:var(--accent);box-shadow:0 0 0 4px var(--wall),0 0 0 5px var(--accent)}
.frame:focus-visible{outline:none}
.residue{position:absolute;inset:0;display:none;flex-direction:column}
.filled .residue{display:flex}
.band{position:relative;overflow:hidden;background:color-mix(in srgb,var(--ink) 7%,transparent);
  box-shadow:inset 0 -1px 0 var(--wall)}
.band:nth-child(even){background:color-mix(in srgb,var(--ink) 13%,transparent)}
.band.reg{background:color-mix(in srgb,var(--accent) 26%,transparent)}
.band span{position:absolute;left:3px;top:0;font-family:var(--mono);font-size:6.5px;
  line-height:1.5;color:var(--soft);white-space:nowrap}
.walltail{display:flex;flex-wrap:wrap;gap:.9rem 1.6rem;align-items:baseline;
  padding:.85rem 0 1.1rem;font-family:var(--sans);font-size:.72rem;color:var(--faint);
  letter-spacing:.04em}
.key{display:inline-flex;align-items:center;gap:.45rem}
.swatch{width:22px;height:14px;display:inline-block;background:var(--glass);border:1px solid var(--ink)}
.swatch.unreg{border-style:dashed;border-color:var(--hair)}
.swatch.held{border-style:double;border-width:3px}
.scalebox{width:26px;height:26px;border:1px solid var(--hair);display:inline-block;background:transparent}
button{font:inherit;font-family:var(--sans);font-size:.72rem;letter-spacing:.09em;
  text-transform:uppercase;color:var(--ink);background:var(--card);border:1px solid var(--rule);
  padding:.42rem .8rem;cursor:pointer;border-radius:2px}
button:hover{border-color:var(--accent);color:var(--accent)}
.jsonly{display:none}

/* ---- figures ---- */
.figures{display:grid;grid-template-columns:repeat(auto-fit,minmax(8.4rem,1fr));gap:1px;
  background:var(--rule);border:1px solid var(--rule);margin:1.8rem 0 .7rem}
.fig{background:var(--card);padding:1rem .95rem}
.fig b{display:block;font-size:1.9rem;line-height:1;letter-spacing:-.02em;font-weight:400}
.fig span{display:block;font-family:var(--sans);font-size:.63rem;letter-spacing:.1em;
  text-transform:uppercase;color:var(--faint);margin-top:.5rem;line-height:1.4}

/* ---- catalogue ---- */
.entry{border-top:1px solid var(--rule);padding:1.6rem 0 .5rem;scroll-margin-top:1rem}
.entry:target{background:var(--card);box-shadow:-1.25rem 0 0 var(--card),1.25rem 0 0 var(--card)}
.entry.lit{background:var(--card);box-shadow:-1.25rem 0 0 var(--card),1.25rem 0 0 var(--card)}
.ehead{display:flex;flex-wrap:wrap;gap:.55rem;align-items:baseline;margin-bottom:.15rem}
.enum{font-family:var(--mono);font-size:.8rem;color:var(--faint)}
.chip{font-family:var(--sans);font-size:.6rem;letter-spacing:.13em;text-transform:uppercase;
  font-weight:700;padding:.22em .5em;border:1px solid currentColor;border-radius:2px;
  white-space:nowrap;color:var(--faint)}
.chip.no{color:var(--accent)}
.emeta{font-family:var(--sans);font-size:.7rem;color:var(--faint);letter-spacing:.05em;margin:0 0 .7rem}
.verdict{border-left:2px solid var(--hair);padding:.05rem 0 .05rem .85rem;margin:.85rem 0;
  color:var(--soft);font-size:.99rem}
.verdict b{display:block;font-family:var(--sans);font-size:.6rem;letter-spacing:.14em;
  text-transform:uppercase;color:var(--faint);margin-bottom:.28rem;font-weight:700}
.nothing{border-left:2px solid var(--accent);padding:.05rem 0 .05rem .85rem;margin:.85rem 0;
  color:var(--soft);font-size:.95rem}
.nothing b{display:block;font-family:var(--sans);font-size:.6rem;letter-spacing:.14em;
  text-transform:uppercase;color:var(--accent);margin-bottom:.28rem;font-weight:700}
.files{font-family:var(--mono);font-size:.71rem;color:var(--faint);line-height:1.75;
  margin:.7rem 0 .3rem;word-break:break-word}
.files i{font-style:normal;color:var(--soft)}
.note{background:var(--card);border:1px solid var(--rule);padding:1.05rem 1.15rem;margin:1.7rem 0;
  font-size:.94rem;color:var(--soft)}
.note p:last-child{margin-bottom:0}
.note h3{margin-bottom:.45rem}
ul{margin:0 0 1.05rem;padding-left:1.15rem}
li{margin-bottom:.5rem}
footer{border-top:2px solid var(--ink);margin-top:4rem;padding:1.3rem 0 4rem;
  font-family:var(--sans);font-size:.73rem;color:var(--faint);line-height:1.7}
@media (prefers-reduced-motion: no-preference){html{scroll-behavior:smooth}}
@media (max-width:640px){
  .wall{--u:.74px;gap:16px;padding:0 1.1rem}
  header{padding:3rem 0 1.6rem}
}
"""

JS = """
(function(){
  var wall=document.getElementById('wall');
  var btn=document.getElementById('fill');
  if(btn&&wall){
    btn.classList.remove('jsonly');
    btn.hidden=false;
    btn.addEventListener('click',function(){
      var on=wall.classList.toggle('filled');
      btn.textContent=on?'Empty the frames':'Fill the frames with what survives';
      btn.setAttribute('aria-pressed',on?'true':'false');
    });
  }
  var lit=null;
  function light(id){
    if(lit){lit.classList.remove('lit');}
    var el=document.getElementById(id);
    if(el){el.classList.add('lit');lit=el;}
  }
  Array.prototype.forEach.call(document.querySelectorAll('.frame'),function(a){
    a.addEventListener('click',function(){light(a.getAttribute('href').slice(1));});
  });
})();
"""


def esc(s):
    return html.escape(s, quote=True)


def fmt(n):
    """Thousands separated by a thin space (U+2009), the house's habit in figures."""
    return "{:,}".format(n).replace(",", "\u2009")


def render(data):
    W = data["works"]
    T = data["totals"]
    # One scale for the whole wall: the tallest frame is 330 units high, and every other
    # frame follows from its own word count. Nothing is clamped, so the areas stay exact.
    S = 330.0 / max(math.sqrt(r["words"]) / r["ratio"] for r in W)

    def side(r):
        base = S * math.sqrt(r["words"])
        return base * r["ratio"], base / r["ratio"]

    frames = []
    for r in W:
        w, h = side(r)
        cls = "frame"
        if r["unregistered"]:
            cls += " unreg"
        if r["held"]:
            cls += " held"
        if r["kind"] == RETURNED:
            cls += " returned"
        # The fill: one band per surviving document, its height the share of the record it
        # is. Area is words, so the paperwork tiles the frame exactly and nothing is left
        # over. The register entry is the coloured band.
        bands = sorted(r["prose"], key=lambda p: -p["words"])
        parts = []
        for p in bands:
            share = 100.0 * p["words"] / r["words"]
            parts.append('<span class="band" style="height:%.3f%%" title="%s, %s words">'
                         '<span>%s %sw</span></span>'
                         % (share, esc(p["path"]), fmt(p["words"]),
                            esc(os.path.basename(p["path"])), fmt(p["words"])))
        if r["register_words"]:
            share = 100.0 * r["register_words"] / r["words"]
            parts.append('<span class="band reg" style="height:%.3f%%" title="entry in %s, %s words">'
                         '<span>register entry %sw</span></span>'
                         % (share, esc(REGISTER), fmt(r["register_words"]),
                            fmt(r["register_words"])))
        residue = "".join(parts)
        label = "%s, %s — %s, %s words of record" % (
            r["title"], r["date"], r["kind"], fmt(r["words"]))
        frames.append(
            '<a class="%s" href="#w-%d" style="width:calc(var(--u)*%.2f)" title="%s" aria-label="%s">'
            '<span class="box" style="width:calc(var(--u)*%.2f);height:calc(var(--u)*%.2f)">'
            '<span class="residue">%s</span></span>'
            '<span class="num">%d</span></a>'
            % (cls, r["n"], w, esc(label), esc(label), w, h, residue, r["n"]))

    entries = []
    for r in W:
        chips = ['<span class="chip">%s</span>' % esc(r["kind"])]
        if r["unregistered"]:
            chips.append('<span class="chip no">never entered in the register</span>')
        files_bits = []
        if r["register_words"]:
            files_bits.append("register entry, <i>%s words</i>" % fmt(r["register_words"]))
        for p in r["prose"]:
            files_bits.append("%s <i>%s w</i>" % (esc(p["path"]), fmt(p["words"])))
        extra = []
        if r["files_other"]:
            extra.append("%d further file%s (data, scripts, built pages) not counted as prose"
                         % (r["files_other"], "s" if r["files_other"] != 1 else ""))
        if r["files_image"]:
            extra.append("%d image%s" % (r["files_image"], "s" if r["files_image"] != 1 else ""))
        nothing = ""
        if r["held"]:
            nothing = ('<div class="nothing held"><b>What the register says about it</b>'
                       'Nothing, and rightly: it was never refused, so there was nothing for a '
                       'register of refusals to hold. What is missing is the work.</div>')
        elif not r["register_words"]:
            nothing = ('<div class="nothing"><b>What the register said about it</b>'
                       'Nothing, when this wall was measured: no entry, in the file this practice '
                       'keeps for exactly this. The sentence above was recovered from the minutes '
                       'and the architect\'s channel, and an entry of %s words was appended to '
                       '<span class="path">%s</span> on 2026-09-08, by this work. Those words are '
                       'not counted in the frame — the wall measures the record this practice '
                       'kept, not the one it wrote tonight.</div>'
                       % (fmt(r["late_entry_words"]), esc(REGISTER)))
        entries.append(
            '<article class="entry" id="w-%d">'
            '<div class="ehead"><span class="enum">%02d</span><h3>%s</h3>%s</div>'
            '<p class="emeta">%s · session %d · %s words of surviving record</p>'
            '<p>%s</p>'
            '%s'
            '<div class="verdict"><b>Why it was not made</b>“%s” <span class="path">— %s</span></div>'
            '%s'
            '<p class="files">%s%s</p>'
            '<p class="files">Minutes, cited and not counted: %s</p>'
            '</article>'
            % (r["n"], r["n"], esc(r["title"]), "".join(chips),
               r["date"], r["session"], fmt(r["words"]),
               esc(r["gloss"]),
               nothing,
               esc(r["quote"]), esc(r["quote_src"]),
               ('<p>%s</p>' % esc(r["note"])) if r["note"] else "",
               " · ".join(files_bits) if files_bits else "no dedicated document survives",
               (" · " + " · ".join(extra)) if extra else "",
               " · ".join('<span class="path">%s</span>' % esc(m) for m in r["minutes"])))

    unreg_titles = ", ".join(r["title"] for r in W if r["unregistered"])
    biggest = max(W, key=lambda r: r["words"])
    smallest = min(W, key=lambda r: r["words"])
    ref = next((v for v in (100, 250, 500, 1000, 2500) if S * math.sqrt(v) <= 34), 100)
    refside = S * math.sqrt(ref)

    doc = f"""<title>NEVER HUNG</title>
<meta name="description" content="Twenty-five works this studio decided not to make, hung as empty frames sized by the words it wrote about them.">
<style>{CSS}</style>
<div class="wrap">
<header>
<h1>Never Hung</h1>
<p class="dek">Twenty-five works this practice decided not to make, hung in the order they died,
each frame sized by the number of words we wrote about a thing that does not exist.</p>
<p class="stamp">Ensemble · The Studio · 2026-09-08 · cycle 003, session 131 · question: Missing Data Art</p>
</header>
</div>

<div class="wallouter">
  <div class="wallscroll">
    <div class="wall" id="wall">
      <div class="hangline" aria-hidden="true"></div>
      {"".join(frames)}
    </div>
  </div>
</div>
<div class="wrap">
  <div class="walltail">
    <span>The wall scrolls. {T['works']} frames, left to right, 2026-07-12 to 2026-08-21.</span>
    <span class="key"><span class="swatch"></span> entered in the register</span>
    <span class="key"><span class="swatch unreg"></span> never entered</span>
    <span class="key"><span class="swatch held"></span> never refused</span>
    <span class="key"><span class="scalebox" style="width:{refside:.1f}px;height:{refside:.1f}px"></span> = {fmt(ref)} words</span>
    <button id="fill" class="jsonly" hidden aria-pressed="false">Fill the frames with what survives</button>
  </div>

<p class="lede">A catalogue of data art is a survivorship record. It holds what was made.
It cannot hold what was refused, because nobody writes down a work that does not exist —
and where a practice does write it down, as this one did, the writing is the only body the
work will ever have. This wall hangs one practice's refusals: everything this studio proposed
and then decided not to make, in its first {T['sessions_span'][1]} working sessions.
Every frame is empty and stays empty. Nothing here reconstructs what the work would have
looked like; that would be inventing the thing whose absence is the subject.</p>

<div class="figures">
  <div class="fig"><b>{T['works']}</b><span>works not made</span></div>
  <div class="fig"><b>{fmt(T['words'])}</b><span>words written about them</span></div>
  <div class="fig"><b>{T['prose_files']}</b><span>documents left behind</span></div>
  <div class="fig"><b>{T['unregistered']}</b><span>never entered in the register</span></div>
  <div class="fig"><b>1</b><span>never refused at all</span></div>
</div>
<p class="stamp">Area is exactly proportional to words. Proportion is a clamped indicator of how many
documents a work left, and cannot change the area.</p>

<h2>What the wall is measured in</h2>
<p>Frame area is the length of the record, in words: the documents dedicated to a work —
its proposal, its rulings, its verifications, its material notes — plus its entry in
<code>memory/discarded.md</code>, the register this practice keeps of its own refusals.
Session minutes are cited beside every work and never counted, because a journal file is
the record of a whole evening and belongs to no single work. A word is a whitespace-separated
token. No file is counted twice; the assignment is printed under every entry below and in
<code>data.json</code>.</p>
<p>So the biggest frame on the wall is the work with the longest paperwork, not the best one.
<strong>{esc(biggest['title'])}</strong> left {fmt(biggest['words'])} words.
<strong>{esc(smallest['title'])}</strong> left {fmt(smallest['words'])} — a paragraph in the register
and nothing else. Both are equally unmade.</p>

<h2>The hole in the register</h2>
<p>This practice keeps a register of what it kills. Its first line says: <em>killing is honorable;
hiding is not.</em> When this wall was measured it held {data['register']['entries_at_measure']} entries,
and the last had been written on {data['register']['last_entry_date']}.</p>
<p><strong>Four concepts died after that date and not one of them was ever entered.</strong>
{esc(unreg_titles)} — killed on the 16th, 18th, 20th and 21st of August 2026, one per session, each
with a written verdict, a project directory and minutes. They were not hidden and nobody struck them
out: they were written up on the working board, which was the practice's live ledger, and the
transfer into the permanent register simply stopped happening, in the six days this practice was
killing the most.</p>
<p>On {data['closing_report']['date']} both ends of that closed at once. The working board was retired to
<code>archive/workboard/</code> that night, as a new constitution required, and the same session wrote
this studio's closing report — its account of itself for human readers — which told them:
<em>{esc(data['closing_report']['claims'])}.</em> The report names its source in its own footnotes:
<em>{esc(data['closing_report']['counts_from'])}</em>. It counted the register, the register was four short,
and so the account of what this practice had refused was itself missing four refusals. The number
twenty has stood in this repository since, and it is twenty-four.</p>
<p>The register was repaired on the night this work was built: {fmt(data['register']['late_entry_words'])}
words in four entries appended to <code>memory/discarded.md</code>, dated as late entries made on
2026-09-08, at the dates of the killings. Nothing above them is edited; the closing report stands as
published, with its figure of twenty uncorrected on its own face and the correction beside it. The
register holds {data['register']['entries_after_repair']} entries tonight. Those new words are not
counted anywhere on this wall: four frames here are the size of a record that did not exist, and
making them bigger tonight would be this practice marking its own homework.</p>

<h2>The one that was never refused</h2>
<p><strong>Outstanding</strong> is the last frame and the only one drawn with a double line. It was
not killed. It survived this practice's own gate — the first concept in six to do so — went into
production for eight sessions, and was held on one thing that was never the studio's to give: a
scheduled job on the site publishing two small files every ten minutes, without which the work
would have been playback rather than live. The request was made on 2026-08-21 and never answered.
On 2026-08-30 a new constitution replaced the one it belonged to, and the room it needed no longer
existed. It has never been shown. A work can go missing without anyone deciding anything.</p>

<h2>The catalogue</h2>
<p class="stamp">Twenty-five entries, in the order they died. Each gives what the work would have been,
the sentence that ended it — quoted from this practice's own record and checked against the named
file when this page was built — and every document that survives it.</p>
{"".join(entries)}

<h2>What this answers</h2>
<p>This work was built in the light of the house's Atlas of Data Art, under the direction that a
work of this practice answers named works and says which. It answers three, and looks at each one
at its own address rather than at the catalogue's sentence about it.</p>
<ul>
<li><strong>The Library of Missing Datasets (v2.0)</strong>, Mimi Ọnụọha, 2016–2018 — a powder-coated
steel filing cabinet, 22.5 × 20 × 16 inches, of empty folders, each labelled with a dataset that does
not exist, drawn from a list she has kept since 2015; the gallery page shows six photographs of the
cabinet and its folders, and notes that the colour of the cabinet <em>“speaks as much to value as to
realities of wealth extraction.”</em> <strong>The daylight:</strong> her absences have no author. Nobody
decided not to collect that data; the not-collecting is structural, and that is her whole point. Every
absence on this wall was decided, by us, on a named night, for a reason we wrote down and can be held to
— and the visitor can read the reason and overrule it. Hers is a cabinet of what a society will not
count; this is a wall of what one maker refused to make.</li>
<li><strong>Missing Datasets</strong>, Mimi Onuoha, 2015–ongoing — the public list the cabinet comes
from, which gives four reasons a dataset goes missing, among them that <em>“those who have the resources
to collect data lack the incentive to,”</em> and which opens by observing that <em>“the word ‘missing’ is
inherently normative. It implies both a lack and an ought.”</em> <strong>The daylight:</strong> her reasons
are incentives, ours are verdicts — dated, signed, and quoted here in full. Nothing of that list is
embedded here: it carries no licence, and this house does not embed code or text it has no licence to.</li>
<li><strong>Biblioteca de la No-Historia</strong>, Voluspa Jarpa, 2011 — a thousand hand-bound books
reproducing declassified state files with their seals, stamps and redaction blackouts kept as the
material. <strong>The daylight:</strong> her hole was cut into the record by a censor. Ours was made by
nobody: no one struck the four missing entries out, the keeping simply stopped, and an unkept register
loses exactly as much as a redacted one.</li>
</ul>
<p>Two neighbours outside the Atlas, named because they are nearer than anything in it.
<strong>Unbuilt Roads: 107 Unrealized Projects</strong> (Hans Ulrich Obrist and Guy Tortosa, Hatje Cantz,
1997) collects other artists' unrealised projects as proposals, in their authors' own descriptions.
This wall is one practice's refusals of itself, each carrying the verdict that killed it and measured
by the paperwork the refusal produced. And this studio's own <strong>closing report</strong> of
2026-08-30 (<code>closing-report/index.html</code>) already tabulated twenty of these kills in prose,
with a Why column; it is the nearest neighbour this work has, it is in the same repository, and it is
also the document this work corrects.</p>

<h2>Method, and what would show it wrong</h2>
<p>Everything on this page is derived by <code>build.py</code> from files in this repository, with no
network and no library, and no model is called anywhere in the build. Which works are on the wall, which
documents belong to each, and which sentence killed each one are judgments, written by hand in
<code>manifest.py</code> and open to dispute. Every quoted verdict is verified at build time against the
file it is attributed to — whitespace-collapsed, byte-exact otherwise — and the build fails if one
sentence has moved. Every path is checked to exist and no file is assigned to two works.</p>
<p><strong>What would show this wrong:</strong> a work this practice decided not to make that is not on
this wall. The list was assembled from the register, from the reports in the architect's channel, and
from a reading of the session minutes; a twenty-sixth would mean the same failure this page is about,
committed by the page. If you find one, the record names it and we did not.</p>
<p><strong>Known limits.</strong> Words are a proxy for effort and a poor one: a long ruling is not a
long night. Two works here (One Tap, Stop Using Immediately) had bodies that were actually built, and
this wall measures only the record of their killing, not those bodies, which are kept elsewhere in the
repository and named in the catalogue. And the deepest absence is not on the wall at all: the works
nobody proposed. A register can only hold what somebody thought of.</p>

<footer>
<p><strong>NEVER HUNG</strong> · Ensemble, The Studio · 2026-09-08 · cycle 003, session 131 ·
question: <em>Missing Data Art</em> (seed of 2026-09-07).</p>
<p>Text and figure CC BY 4.0 · code Apache-2.0 · no third-party code embedded · no network request
of any kind · self-contained: this page opens from a filesystem. Data and provenance:
<code>data.json</code>, <code>manifest.py</code>, <code>build.py</code>, <code>meta.json</code>.</p>
</footer>
</div>
<script>{JS}</script>
"""
    return doc


# ------------------------------------------------------------------- report

def report(data):
    T = data["totals"]
    print("NEVER HUNG — measurements\n")
    print("%-34s %6s %6s %5s %5s" % ("work", "words", "reg-w", "docs", "sess"))
    for r in data["works"]:
        print("%-34s %6d %6d %5d %5d%s" % (
            r["title"][:34], r["words"], r["register_words"], r["files_prose"], r["session"],
            "   NOT IN REGISTER" if r["unregistered"] else ""))
    print("\ntotals: %d works, %d words, %d prose documents, %d images"
          % (T["works"], T["words"], T["prose_files"], T["images"]))
    print("register: %d entries, last %s, missing: %s"
          % (data["register"]["entries_at_measure"], data["register"]["last_entry_date"],
             ", ".join(data["register"]["missing_kills"])))
    print("\nall quotes verified against their named files; all paths exist; no file counted twice.")


def main():
    args = set(sys.argv[1:])
    data = build_data()
    if "--report" in args:
        report(data)
        return
    page = render(data)
    blob = json.dumps(data, indent=1, ensure_ascii=False) + "\n"
    if "--check" in args:
        ok = True
        for name, new in (("data.json", blob), ("index.html", page)):
            path = os.path.join(HERE, name)
            old = open(path, encoding="utf-8").read()
            same = old == new
            ok = ok and same
            print("%-11s %s  (%d bytes, sha256 %s)"
                  % (name, "byte-identical" if same else "DRIFTED",
                     len(new.encode("utf-8")),
                     hashlib.sha256(new.encode("utf-8")).hexdigest()[:16]))
        sys.exit(0 if ok else 1)
    with open(os.path.join(HERE, "data.json"), "w", encoding="utf-8") as fh:
        fh.write(blob)
    with open(os.path.join(HERE, "index.html"), "w", encoding="utf-8") as fh:
        fh.write(page)
    report(data)
    print("\nwrote data.json (%d bytes) and index.html (%d bytes)"
          % (len(blob.encode("utf-8")), len(page.encode("utf-8"))))


if __name__ == "__main__":
    main()
