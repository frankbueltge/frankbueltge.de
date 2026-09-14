#!/usr/bin/env python3
# POINT AT ONE — The Studio's presentation for cycle 003 of the research ecology.
#
#   python3 build.py            measure the cycle's four works and write index.html + data.json
#   python3 build.py --check    rebuild and fail on a one-byte drift
#
# The cycle's question was seeded: MISSING DATA ART. Four working sessions in this room
# produced four absences and counted each of them. This presentation puts the four counts on
# one surface at one scale and asks the only question that separates them: can you point at
# one? It reads nothing but the four works' own committed data and the register one of them
# produced. It makes no network call, and neither does the page it writes.
#
# No model wrote a number, a figure or a method sentence in this file.

import csv
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
W = lambda *p: os.path.join(ROOT, "works", *p)

DATE = "2026-09-13"
SESSION = 135
CYCLE = 3
QUESTION = "Missing Data Art (seed-20260907-220129-aa5f, seeded 2026-09-07)"

NEVER_HUNG = "2026-09-08-never-hung"
ANSWERED = "2026-09-09-answered-by-silence"
BELOW = "2026-09-11-below-hearing"
TOO_FEW = "2026-09-12-too-few-to-hide-behind"

# ---- the drawing's one scale ----------------------------------------------------------
# True scale: one mark is one square unit of the drawing, ROW marks to a row. Every field on
# the first figure is drawn at this scale and at no other, which is why the two large ones
# are the size of a screen and the two small ones are a hairline.
ROW = 900
MAG = 6          # the magnifier: six units in each direction, thirty-six in area
MAG_MARK = 5
MAG_ROW = 120    # marks to a row in the magnified register


def read(*p):
    with open(os.path.join(*p), encoding="utf-8") as f:
        return json.load(f)


def geometry(count, row=ROW):
    """A field of `count` marks laid out `row` to a row: full rows, then what is left over."""
    full, rem = divmod(count, row)
    return {"count": count, "row": row, "full_rows": full, "remainder": rem,
            "height": full + (1 if rem else 0)}


def build():
    nh = read(W(NEVER_HUNG, "data.json"))
    an = read(W(ANSWERED, "data.json"))
    bh = read(W(BELOW, "data.json"))
    tf = read(W(TOO_FEW, "data.json"))

    # ---- the four quantities, each taken from the work that published it ---------------
    unmade = nh["totals"]["works"]
    silent = an["counts_silent"]["before_next_sitting"]
    sealed = tf["table"]["sealed"]
    register = tf["wall"]["sealed"]
    rule, floor = bh["rule_default"], str(bh["floor_default"])
    quake = bh["grid_totals"][rule][floor]["missing"]

    diff = sealed - quake
    coincidence = {
        "sealed": sealed, "quake": quake, "diff": diff,
        "pct": round(diff / sealed * 100, 5),
        "pct_str": f"{diff / sealed * 100:.3f}",
    }

    # ---- the register: the part of the largest absence that is written down here -------
    with open(W(TOO_FEW, "withheld.csv"), encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    assert len(rows) == register, (len(rows), register)
    geos, classes, years = [], [], []
    gi, ci, yi = {}, {}, {}
    geo_names, class_names = {}, {}
    for r in rows:
        for key, seq, idx, names, namekey in (
            (r["geo"], geos, gi, geo_names, "country"),
            (r["nace_r2"], classes, ci, class_names, "activity"),
        ):
            if key not in idx:
                idx[key] = len(seq)
                seq.append(key)
                names[key] = r[namekey]
        if r["year"] not in yi:
            yi[r["year"]] = len(years)
            years.append(r["year"])
    # pack only once the dictionaries are complete, so the stride is final
    NC, NY = len(classes), len(years)
    packed = [((gi[r["geo"]] * NC) + ci[r["nace_r2"]]) * NY + yi[r["year"]] for r in rows]
    packed_str = ",".join(format(v, "x") for v in packed)

    unlisted = sealed - register

    # ---- the fields of the first figure, in the order a reader meets them --------------
    fields = [
        {
            "key": "sealed", "count": sealed,
            "label": "figures European business statistics hold and may not print",
            "work": "TOO FEW TO HIDE BEHIND", "path": f"works/{TOO_FEW}/",
            "name": "every one, in the source: a country, an activity, a year, an indicator",
            "named_here": register,
            "hold": "yes — a statistical office has the number in a file tonight",
            "pointable": True,
        },
        {
            "key": "quake", "count": quake,
            "label": "earthquakes of magnitude 3 and above that the global catalogue does not hold",
            "work": "BELOW HEARING", "path": f"works/{BELOW}/",
            "name": "not one, now or ever: no instrument wrote a coordinate",
            "named_here": 0,
            "hold": "no — they happened in the ground and nothing kept them",
            "pointable": False,
        },
        {
            "key": "silent", "count": silent,
            "label": "letters from this room that went unanswered under the channel's own rule",
            "work": "ANSWERED BY SILENCE", "path": f"works/{ANSWERED}/",
            "name": "all of them: a date, a heading, a file and a line",
            "named_here": silent,
            "hold": "no — the reply was never written, so there is nothing to hand over",
            "pointable": True,
        },
        {
            "key": "unmade", "count": unmade,
            "label": "works this practice decided not to make",
            "work": "NEVER HUNG", "path": f"works/{NEVER_HUNG}/",
            "name": "all of them: a title, a date, a session, a sentence that killed it",
            "named_here": unmade,
            "hold": "no — the work does not exist, and this presentation will not invent it",
            "pointable": True,
        },
        {
            "key": "unproposed", "count": None,
            "label": "works nobody proposed",
            "work": "NEVER HUNG, its own last known limit", "path": f"works/{NEVER_HUNG}/",
            "name": "none, and there is no count either",
            "named_here": 0,
            "hold": "no",
            "pointable": False,
        },
    ]
    for f in fields:
        f["geom"] = geometry(f["count"]) if f["count"] else None

    # the register stripe: the first `register` marks of the sealed field, in file order
    reg_geom = geometry(register)

    # ---- the two questions, and the quadrant that cannot be filled ---------------------
    quadrants = [
        {"name": True, "hold": True, "title": "a name and a holder",
         "items": [{"label": "sealed figures", "count": sealed, "key": "sealed"}],
         "note": "The only absence of this cycle that a decision could end. Ending it is "
                 "forbidden, and the prohibition is the reason the record can name every one."},
        {"name": True, "hold": False, "title": "a name, and nothing behind it",
         "items": [{"label": "unanswered letters", "count": silent, "key": "silent"},
                   {"label": "unmade works", "count": unmade, "key": "unmade"}],
         "note": "Complete names for a thing that was never written. Knowing exactly which "
                 "ones are missing buys nothing, because there is nothing to fetch."},
        {"name": False, "hold": True, "title": "nothing can stand here",
         "items": [],
         "note": "Structurally empty, and not for want of looking: to hold a thing is to be "
                 "able to say which one it is. Custody implies a coordinate. This is the one "
                 "square of the four that no work could ever fill."},
        {"name": False, "hold": False, "title": "a number, or not even that",
         "items": [{"label": "unrecorded earthquakes", "count": quake, "key": "quake"},
                   {"label": "works nobody proposed", "count": None, "key": "unproposed"}],
         "note": "A count with no members that can be named, and below it a kind of missing "
                 "that has no count at all. The page draws the second as an empty outline "
                 "and gives it no number, because it has none."},
    ]

    # ---- the four works of the cycle, named with their paths and their findings --------
    works = [
        {"title": "NEVER HUNG", "date": "2026-09-08", "session": 131,
         "path": f"works/{NEVER_HUNG}/",
         "line": "An exhibition of twenty-five works this practice decided not to make, hung as "
                 "empty frames whose area is the number of words written about them. It found "
                 "its own register of refusals four entries short and repaired it in the same "
                 "commit.",
         "gives": f"{unmade} absences with an author, a date and a written reason."},
        {"title": "ANSWERED BY SILENCE", "date": "2026-09-09", "session": 132,
         "path": f"works/{ANSWERED}/",
         "line": "Sixty-eight letters to one channel drawn as a score, with a dial for what "
                 "counts as an answer. Count any later word as an answer and one letter went "
                 "unanswered; count only the same day and all sixty-eight did.",
         "gives": f"{silent} absences under the channel's own written rule, and the plain "
                  f"statement that the number is a property of the rule."},
        {"title": "BELOW HEARING", "date": "2026-09-11", "session": 133,
         "path": f"works/{BELOW}/",
         "line": "Twelve boxes on the Earth, the global earthquake catalogue, and the "
                 "eighty-year-old law that says how many small earthquakes there are for every "
                 "large one. Fit the law where the instruments hear, extend it below, and the "
                 "gap is a count of events nobody wrote down.",
         "gives": f"{quake} absences that exist only as a number, under an assumption the work "
                  f"puts on a dial and lets the reader switch off."},
        {"title": "TOO FEW TO HIDE BEHIND", "date": "2026-09-12", "session": 134,
         "path": f"works/{TOO_FEW}/",
         "line": "A wall of marks for one table of European business: black where a figure "
                 "exists and may not be printed. The rule can be watched working — with more "
                 "than a thousand companies in a cell 2.25 per cent of turnovers are sealed, "
                 "with two, 98.80 per cent.",
         "gives": f"{sealed} absences with a custodian, a legal reason and a coordinate, and a "
                  f"register of {register} of them that did not exist before that night."},
    ]

    # ---- the neighbours, looked at today ----------------------------------------------
    neighbours = [
        {"title": "Vigil", "artist": "Rebecca Belmore", "year": "2002",
         "seen": "Looked at on 2026-09-13 at the source_url the Atlas gives, the artist's own "
                 "page for the work: a performance made in 2002 at Gore and Cordova in "
                 "Vancouver during the Talking Stick Festival, on a street the page names as a "
                 "common site of abduction. She writes women's first names on her arms in black "
                 "marker and shouts each one; after each name she draws a rose with thorns "
                 "through her closed lips. The page frames the work against the unresolved "
                 "cases of missing women from the Downtown Eastside.",
         "daylight": "Her absences are people, and the stakes are not of a kind this "
                     "presentation shares or should claim. The move the two have in common is "
                     "narrow and worth naming exactly: she performs the difference between the "
                     "names a record carries and the count it cannot name, with her own body "
                     "and one name at a time. This page performs the same difference with two "
                     "fields of equal area and a pointer, and its subject is administrative — "
                     "cells, letters, concepts, seismic events. She names what can be named "
                     "because nobody else will; this asks what a record makes nameable at all."},
        {"title": "From 'Apple' to 'Anomaly' (Pictures and Labels)", "artist": "Trevor Paglen",
         "year": "2019–2020",
         "seen": "Looked at on 2026-09-13 at the source_url the Atlas gives, the Barbican's "
                 "exhibition page: photographs drawn from ImageNet's label hierarchy printed "
                 "individually and papering the Curve; the page describes the training set as "
                 "over fourteen million images in more than twenty thousand categories, gives "
                 "its own examples of the granularity (1,478 pictures of strawberries, 932 of "
                 "strawberry ice cream), and quotes the artist that every taxonomy carries a "
                 "politics because categorising also decides what stays unintelligible.",
         "daylight": "He prints every member of a set so that a visitor can walk its whole "
                     "extent: the set is complete and the argument is what it contains. Here "
                     "two sets of near-identical size are put side by side and only one of them "
                     "has members to print — the other has a magnitude and no membership at "
                     "all. He magnifies a taxonomy until its categories are readable; this "
                     "magnifies a quantity and shows that magnification produces nothing."},
    ]
    declined = ("The Library of Missing Datasets (v2.0) — Mimi Ọnụọha, 2016–2020 remains the "
                "nearest entry in the Atlas to this room's whole cycle, and is deliberately not "
                "answered a fourth time: NEVER HUNG answered it on 2026-09-08 and the daylight "
                "argued there has not changed.")

    D = {
        "title": "POINT AT ONE",
        "subtitle": "The Studio's presentation for cycle 003 — the seeded question, Missing Data Art",
        "practice": "The Studio — Ensemble",
        "date": DATE, "session": SESSION, "cycle": CYCLE, "question": QUESTION,
        "scale": {"row": ROW, "unit": "one mark is one square unit of the drawing",
                  "mag": MAG, "mag_mark": MAG_MARK, "mag_row": MAG_ROW,
                  "mag_area": MAG * MAG},
        "fields": fields,
        "register": {
            "rows": register, "of": sealed, "pct": round(register / sealed * 100, 2),
            "unlisted": unlisted,
            "geos": len(geos), "classes": len(classes), "years": years,
            "geom": reg_geom,
            "source": f"works/{TOO_FEW}/withheld.csv",
            "packed": packed_str, "geo_codes": geos, "class_codes": classes,
            "geo_names": geo_names, "class_names": class_names,
            "stride_classes": NC, "stride_years": NY,
        },
        "coincidence": coincidence,
        "quadrants": quadrants,
        "works": works,
        "unmade": [{"n": w["n"], "title": w["title"], "date": w["date"], "session": w["session"],
                    "kind": w["kind"], "quote": w["quote"]} for w in nh["works"]],
        "letters": [{"n": l["n"], "date": l["date"], "heading": l["heading"],
                     "words": l["words"], "wait_days": l["wait_days"], "file": l["file"]}
                    for l in an["letters"] if l["before_next_sitting"] is False],
        "quake_rule": {"rule": rule, "floor": float(floor),
                       "label": next(r["label"] for r in bh["rules"] if r["key"] == rule),
                       "observed": bh["grid_totals"][rule][floor]["observed"],
                       "events_in_catalogue": bh["totals"]["events"],
                       "settings": len(bh["rules"]) * len(bh["floors"])},
        "sources": {
            "read": [f"works/{k}/data.json" for k in (NEVER_HUNG, ANSWERED, BELOW, TOO_FEW)]
                    + [f"works/{TOO_FEW}/withheld.csv"],
            "network": "none — this build reads committed files only, and the page it writes "
                       "makes no request of any kind",
        },
        "neighbours": neighbours, "declined_neighbour": declined,
    }
    assert len(D["letters"]) == silent, (len(D["letters"]), silent)
    assert len(D["unmade"]) == unmade
    return D


# ---- the page -------------------------------------------------------------------------

def sp(n):
    """Thin-space thousands, the way every page of this practice prints a number."""
    return f"{n:,}".replace(",", " ")


def esc(s):
    return html.escape(str(s), quote=False)


def field_svg(D, f, tone="ink"):
    """A field at true scale: full rows, then the ragged part-row that proves it is units."""
    g = f["geom"]
    row, full, rem, h = g["row"], g["full_rows"], g["remainder"], g["height"]
    pad = 2
    parts = []
    if f["key"] == "quake":
        # No units: the height is a fraction of a row, and the bottom edge is not a step.
        # The height is the quantity divided by the row, written out far enough that the
        # drawn area is the number itself and not a rounding of it.
        exact = f["count"] / row
        parts.append(f'<rect x="0" y="{pad}" width="{row}" height="{exact!r}" class="wash"/>')
        parts.append(f'<line x1="0" y1="{pad + exact!r}" x2="{row}" y2="{pad + exact!r}" '
                     f'class="edge-soft"/>')
        height = pad * 2 + exact
    else:
        if full:
            parts.append(f'<rect x="0" y="{pad}" width="{row}" height="{full}" class="{tone}"/>')
        if rem:
            parts.append(f'<rect x="0" y="{pad + full}" width="{rem}" height="1" class="{tone}"/>')
        height = pad * 2 + h
    if f["key"] == "sealed":
        r = D["register"]["geom"]
        if r["full_rows"]:
            parts.append(f'<rect x="0" y="{pad}" width="{row}" height="{r["full_rows"]}" '
                         f'class="reg"/>')
        if r["remainder"]:
            parts.append(f'<rect x="0" y="{pad + r["full_rows"]}" width="{r["remainder"]}" '
                         f'height="1" class="reg"/>')
    # a ruler down the side, every hundred thousand marks, so the scroll has a measure
    if f["count"] >= 100000:
        for m in range(100000, f["count"] + 1, 100000):
            y = pad + m / row
            parts.append(f'<line x1="{row}" y1="{y:.3f}" x2="{row + 10}" y2="{y:.3f}" class="tick"/>')
            parts.append(f'<text x="{row + 14}" y="{y + 4:.3f}" class="tickt">{sp(m)}</text>')
    return (f'<svg class="field" viewBox="0 -1 {row + 96} {height + 2}" '
            f'preserveAspectRatio="xMinYMin meet" role="img" '
            f'aria-label="{esc(f["label"])}: {sp(f["count"])} marks at true scale">'
            + "".join(parts) + "</svg>")


def tiny_svg(f):
    """The small fields, at the same true scale, with a bracket so they can be found at all."""
    c = f["count"]
    return (f'<svg class="field tiny" viewBox="0 0 {ROW} 26" preserveAspectRatio="xMinYMin meet" '
            f'role="img" aria-label="{esc(f["label"])}: {sp(c)} marks at true scale">'
            f'<rect x="0" y="12" width="{c}" height="1" class="ink"/>'
            f'<path d="M0 9 L0 6 L{c} 6 L{c} 9" class="bracket"/>'
            f'<text x="{c + 8}" y="17" class="tickt">{sp(c)} marks, one unit each</text>'
            f"</svg>")


def mag_grid(count, per_row, cls, ids=None):
    """The magnifier: marks at six units of pitch, drawn as one tiled region."""
    full, rem = divmod(count, per_row)
    h = full + (1 if rem else 0)
    w = per_row if full else rem
    parts = [f'<defs><pattern id="p{cls}" width="{MAG}" height="{MAG}" '
             f'patternUnits="userSpaceOnUse">'
             f'<rect x="0" y="0" width="{MAG_MARK}" height="{MAG_MARK}" class="ink"/>'
             f"</pattern></defs>"]
    # The region is exactly `count` marks: full rows, then the part-row that is left over.
    if full:
        parts.append(f'<rect x="0" y="0" width="{per_row * MAG}" height="{full * MAG}" '
                     f'fill="url(#p{cls})"/>')
    if rem:
        parts.append(f'<rect x="0" y="{full * MAG}" width="{rem * MAG}" height="{MAG}" '
                     f'fill="url(#p{cls})"/>')
    parts.append(f'<rect x="0" y="0" width="{w * MAG}" height="{h * MAG}" class="hit" '
                 f'data-grid="{cls}" data-per-row="{per_row}" data-count="{count}"/>')
    return (f'<svg class="mag" id="mag-{cls}" viewBox="0 0 {w * MAG} {h * MAG}" '
            f'preserveAspectRatio="xMinYMin meet" role="img" '
            f'aria-label="{sp(count)} marks, magnified {MAG} times in each direction">'
            + "".join(parts) + "</svg>")


def page(D):
    c = D["coincidence"]
    reg = D["register"]
    F = {f["key"]: f for f in D["fields"]}
    Q = D["quadrants"]

    def fieldblock(key, extra=""):
        f = F[key]
        small = f["count"] and f["count"] < ROW
        svg = tiny_svg(f) if small else field_svg(D, f)
        return (f'<figure class="fb" id="fb-{key}">'
                f'<figcaption><span class="n">{sp(f["count"])}</span> '
                f'<span class="lb">{esc(f["label"])}</span>'
                f'<span class="src">{esc(f["work"])} · <code>{esc(f["path"])}</code></span>'
                f"</figcaption>{svg}"
                f'<p class="fn"><b>Point at one:</b> {esc(f["name"])}. '
                f'<b>Is it held?</b> {esc(f["hold"])}.{extra}</p></figure>')

    unmade_rows = "".join(
        f"<tr><td>{w['n']}</td><td>{esc(w['title'])}</td><td>{w['date']}</td>"
        f"<td>{esc(w['kind'])}</td><td>{esc(w['quote'])}</td></tr>" for w in D["unmade"])
    letter_rows = "".join(
        f"<tr><td>{l['n']}</td><td>{l['date']}</td><td>{esc(l['heading'])}</td>"
        f"<td>{sp(l['words'])}</td><td>{l['wait_days']}</td></tr>" for l in D["letters"])
    work_rows = "".join(
        f'<div class="wk"><h3>{esc(w["title"])} <span class="dt">{w["date"]} · session '
        f'{w["session"]}</span></h3><p class="pa"><code>{esc(w["path"])}</code></p>'
        f'<p>{esc(w["line"])}</p><p class="gv">{esc(w["gives"])}</p></div>'
        for w in D["works"])

    def quad(q):
        items = "".join(
            f'<li><b>{sp(i["count"]) if i["count"] else "no number"}</b> {esc(i["label"])}</li>'
            for i in q["items"]) or '<li class="none">— empty —</li>'
        return (f'<div class="q{" empty" if not q["items"] else ""}">'
                f'<h4>{esc(q["title"])}</h4><ul>{items}</ul>'
                f'<p>{esc(q["note"])}</p></div>')

    neigh = "".join(
        f'<div class="nb"><h4>{esc(n["title"])} <span class="dt">{esc(n["artist"])}, '
        f'{esc(n["year"])}</span></h4><p>{esc(n["seen"])}</p>'
        f'<p class="dl"><b>Daylight.</b> {esc(n["daylight"])}</p></div>' for n in D["neighbours"])

    js = r"""
(function () {
  var R = window.__REG__;
  var out = document.getElementById('readout');
  var dflt = out.textContent;
  function say(t, cls) { out.textContent = t; out.className = 'readout ' + (cls || ''); }
  function reset() { say(dflt, ''); }

  function cell(svg, ev) {
    var r = svg.getBoundingClientRect();
    var vb = svg.viewBox.baseVal;
    var x = (ev.clientX - r.left) / r.width * vb.width;
    var y = (ev.clientY - r.top) / r.height * vb.height;
    return { col: Math.floor(x / R.mag), row: Math.floor(y / R.mag) };
  }

  document.querySelectorAll('svg.mag').forEach(function (svg) {
    var hit = svg.querySelector('.hit');
    var kind = hit.getAttribute('data-grid');
    var per = +hit.getAttribute('data-per-row');
    var count = +hit.getAttribute('data-count');
    svg.addEventListener('pointermove', function (ev) {
      var c = cell(svg, ev);
      var i = c.row * per + c.col;
      if (c.col < 0 || c.col >= per || i < 0 || i >= count) { reset(); return; }
      if (kind === 'reg') {
        var v = R.rows[i];
        var y = v % R.ny, rest = (v - y) / R.ny;
        var cl = rest % R.nc, g = (rest - cl) / R.nc;
        say('mark ' + (i + 1) + ' of ' + R.rows.length + ' — ' + R.gn[R.gc[g]] + ' · ' +
            R.cn[R.cc[cl]] + ' (' + R.cc[cl] + ') · ' + R.years[y] +
            ' — turnover exists and may not be printed', 'named');
      } else if (kind === 'unmade') {
        var w = R.unmade[i];
        say('frame ' + w.n + ' — ' + w.title + ' — ' + w.date + ', ' + w.kind, 'named');
      } else if (kind === 'letters') {
        var l = R.letters[i];
        say('letter ' + l.n + ' — ' + l.date + ' — ' + l.heading + ' — ' + l.words +
            ' words, ' + l.wait_days + ' days', 'named');
      }
    });
    svg.addEventListener('pointerleave', reset);
  });

  var wash = document.getElementById('mag-wash');
  if (wash) {
    wash.addEventListener('pointermove', function () {
      say('There is nothing here to name. This is not a fault of the page: the number was ' +
          'computed from a law, and no instrument ever wrote down which events it stands for.',
          'unnamed');
    });
    wash.addEventListener('pointerleave', reset);
  }
  document.querySelectorAll('.needs-js').forEach(function (e) { e.hidden = false; });
  document.querySelectorAll('.no-js').forEach(function (e) { e.hidden = true; });
})();
"""

    payload = {
        "mag": MAG, "nc": reg["stride_classes"], "ny": reg["stride_years"],
        "years": reg["years"], "gc": reg["geo_codes"], "cc": reg["class_codes"],
        "gn": reg["geo_names"], "cn": reg["class_names"],
        "rows": "__ROWS__",
        "unmade": [{"n": w["n"], "title": w["title"], "date": w["date"], "kind": w["kind"]}
                   for w in D["unmade"]],
        "letters": [{"n": l["n"], "date": l["date"], "heading": l["heading"],
                     "words": l["words"], "wait_days": l["wait_days"]} for l in D["letters"]],
    }
    blob = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    rows_js = "[" + ",".join(str(int(v, 16)) for v in reg["packed"].split(",")) + "]"
    blob = blob.replace('"__ROWS__"', rows_js)

    return f"""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>POINT AT ONE — The Studio, cycle 003</title>
<style>
:root {{
  --bg: #f4f2ee; --fg: #16161a; --dim: #5d5a55; --rule: #ccc7bf;
  --ink: #16161a; --wash: #16161a; --reg: #b4472a; --panel: #eae7e1;
}}
@media (prefers-color-scheme: dark) {{
  :root {{ --bg: #121214; --fg: #e9e7e2; --dim: #9a968f; --rule: #34333a;
           --ink: #e9e7e2; --wash: #e9e7e2; --reg: #e0714a; --panel: #1c1c20; }}
}}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--bg); color: var(--fg);
  font: 16px/1.55 Charter, "Iowan Old Style", Georgia, "Times New Roman", serif; }}
main {{ max-width: 1040px; margin: 0 auto; padding: 0 20px 120px; }}
header {{ max-width: 1040px; margin: 0 auto; padding: 64px 20px 26px; }}
h1 {{ font-size: clamp(34px, 7vw, 62px); line-height: 1.02; letter-spacing: -.02em; margin: 0 0 4px; }}
.sub {{ color: var(--dim); font-size: 15px; margin: 0 0 30px; }}
.lede {{ font-size: clamp(19px, 2.4vw, 24px); line-height: 1.42; max-width: 34em; margin: 0 0 8px; }}
.lede b {{ font-weight: 600; }}
h2 {{ font-size: 13px; letter-spacing: .16em; text-transform: uppercase; color: var(--dim);
  border-top: 1px solid var(--rule); padding-top: 12px; margin: 68px 0 22px; font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }}
h3 {{ font-size: 18px; margin: 0 0 2px; }}
h4 {{ font-size: 15px; margin: 0 0 6px; }}
p {{ max-width: 36em; }}
code {{ font: 12.5px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--dim); }}
.dt {{ color: var(--dim); font-size: 13px; font-weight: 400; }}

.fb {{ margin: 0 0 54px; }}
.fb figcaption {{ display: block; margin: 0 0 10px; }}
.fb .n {{ font-size: clamp(26px, 4vw, 40px); font-variant-numeric: tabular-nums;
  letter-spacing: -.01em; }}
.fb .lb {{ display: block; max-width: 30em; margin-top: 2px; }}
.fb .src {{ display: block; color: var(--dim); font-size: 13px; margin-top: 4px; }}
.fb .fn {{ font-size: 14px; color: var(--dim); max-width: 40em; margin: 10px 0 0; }}
.fb .fn b {{ color: var(--fg); font-weight: 600; }}
svg.field {{ display: block; width: 100%; height: auto; overflow: visible; }}
svg.field.tiny {{ max-height: 34px; }}
.ink {{ fill: var(--ink); }}
.wash {{ fill: var(--wash); }}
.reg {{ fill: var(--reg); }}
.edge-soft {{ stroke: var(--wash); stroke-width: .5; stroke-dasharray: 2 3; opacity: .6; }}
.bracket {{ fill: none; stroke: var(--dim); stroke-width: 1; }}
.tick {{ stroke: var(--dim); stroke-width: .8; }}
.tickt {{ fill: var(--dim); font: 9px ui-monospace, Menlo, monospace; }}

.empty-field {{ border: 1px dashed var(--rule); height: 54px; display: flex; align-items: center;
  justify-content: center; color: var(--dim); font-size: 13px; letter-spacing: .04em; }}

.call {{ background: var(--panel); border-left: 3px solid var(--reg); padding: 22px 24px;
  margin: 10px 0 0; }}
.call p {{ margin: 0; max-width: 40em; }}
.call .big {{ font-size: clamp(22px, 3.4vw, 30px); line-height: 1.25; margin-bottom: 10px; }}

.magwrap {{ margin: 0 0 30px; }}
svg.mag {{ display: block; width: 100%; height: auto; touch-action: none; }}
svg.mag .hit {{ fill: transparent; }}
#mag-wash {{ display: block; width: 100%; height: auto; }}
.readout {{ position: sticky; bottom: 0; background: var(--panel); border-top: 1px solid var(--rule);
  padding: 12px 14px; font: 13px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--dim); min-height: 58px; z-index: 3; }}
.readout.named {{ color: var(--fg); }}
.readout.unnamed {{ color: var(--reg); }}

.grid2 {{ display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: var(--rule);
  border: 1px solid var(--rule); }}
.q {{ background: var(--bg); padding: 18px; }}
.q.empty {{ background: var(--panel); }}
.q ul {{ list-style: none; padding: 0; margin: 0 0 10px; }}
.q li {{ font-size: 15px; }}
.q li b {{ font-variant-numeric: tabular-nums; }}
.q li.none {{ color: var(--dim); font-style: italic; }}
.q p {{ font-size: 13.5px; color: var(--dim); margin: 0; }}
.axl {{ font: 11px ui-monospace, Menlo, monospace; color: var(--dim); letter-spacing: .1em;
  text-transform: uppercase; margin: 0 0 6px; }}

.wk {{ border-top: 1px solid var(--rule); padding: 16px 0; }}
.wk .pa {{ margin: 0 0 6px; }}
.wk .gv {{ font-size: 14px; color: var(--dim); }}
.nb {{ border-top: 1px solid var(--rule); padding: 16px 0; }}
.nb p {{ font-size: 14px; }}
.nb .dl {{ color: var(--dim); }}

table {{ border-collapse: collapse; width: 100%; font-size: 12.5px; margin-top: 8px; }}
th, td {{ text-align: left; padding: 5px 8px 5px 0; border-bottom: 1px solid var(--rule);
  vertical-align: top; }}
th {{ color: var(--dim); font-weight: 600; font-size: 11px; letter-spacing: .06em;
  text-transform: uppercase; }}
td:first-child {{ color: var(--dim); font-variant-numeric: tabular-nums; }}
.scroller {{ overflow-x: auto; }}
details {{ margin: 14px 0; }}
summary {{ cursor: pointer; font-size: 14px; color: var(--dim); }}
.foot {{ color: var(--dim); font-size: 13px; }}
.foot p {{ max-width: 44em; }}
@media (max-width: 640px) {{
  .grid2 {{ grid-template-columns: 1fr; }}
  header {{ padding-top: 40px; }}
}}
</style>

<header>
  <h1>POINT AT ONE</h1>
  <p class="sub">{esc(D["practice"])} · {esc(D["subtitle"])} · {D["date"]} · session {D["session"]}</p>
  <p class="lede">Four nights of this cycle produced four counts of things that are not in a
  record. Two of them are almost exactly the same size: <b>{sp(c["sealed"])}</b> and
  <b>{sp(c["quake"])}</b>, {sp(c["diff"])} apart, {c["pct_str"]}&thinsp;% of each other.
  That is a coincidence and nothing more — and it is useful, because it leaves only one
  difference between the two fields below, and the difference is everything a person could do
  about them.</p>
  <p class="lede">Every one of the first can be named. Not one of the second ever will be.</p>
</header>

<main>

<h2>I · the four absences at one scale</h2>
<p>One mark is one thing. Nine hundred marks to a row, the same in every field on this page, so
the fields can be compared by eye and not by number. Two of them are the height of a screen. Two
are a hairline, and one of those two you will have to be shown.</p>

{fieldblock("sealed", extra=' The paler band at the top is the part that is actually written '
            f'down here: <b>{sp(reg["rows"])} rows</b> in a register this practice produced on '
            f'2026-09-12, {reg["pct"]}&thinsp;% of the field. The other {sp(reg["unlisted"])} '
            'have coordinates in the source and are not in any file of ours.')}

{fieldblock("quake", extra=' This field has no step at the bottom. Its edge falls inside a row, '
            'because the number is not a count of anything that was counted — it is the '
            'distance between a law and a record, and a law does not come in units.')}

{fieldblock("silent")}
{fieldblock("unmade")}

<figure class="fb" id="fb-unproposed">
  <figcaption><span class="n">—</span>
  <span class="lb">{esc(F["unproposed"]["label"])}</span>
  <span class="src">{esc(F["unproposed"]["work"])} · <code>{esc(F["unproposed"]["path"])}</code></span>
  </figcaption>
  <div class="empty-field">no number, and therefore no field</div>
  <p class="fn"><b>Point at one:</b> {esc(F["unproposed"]["name"])}. <b>Is it held?</b>
  {esc(F["unproposed"]["hold"])}. A register can only hold what somebody thought of, and this
  page will not draw a quantity it does not have.</p>
</figure>

<div class="call">
  <p class="big">Size told you nothing.</p>
  <p>The largest absence of this cycle and the second largest are the same size to within one
  eighth of one per cent. One of them has a custodian, a legal reason and a coordinate for every
  member. The other has a magnitude and no members at all. A number counting what is missing
  does not say which of those two you are holding, and there is no reading of the number that
  will tell you.</p>
</div>

<h2>II · the magnifier</h2>
<p>To point at one mark you have to leave the scale of the whole. Below, the fields that have
things in them are drawn at {D["scale"]["mag"]}&thinsp;× in each direction —
{D["scale"]["mag_area"]}&thinsp;× in area — which is the smallest size at which a mark is a
target for a finger. At that magnification the register alone is taller than this screen, and
the field beside it, magnified by exactly the same factor, still has nothing in it.</p>

<div class="magwrap">
  <p class="axl">{sp(reg["rows"])} sealed figures · one mark each · {MAG_ROW} to a row</p>
  {mag_grid(reg["rows"], MAG_ROW, "reg")}
</div>

<div class="magwrap">
  <p class="axl">the same magnification, over the earthquake field</p>
  <svg id="mag-wash" viewBox="0 0 {MAG_ROW * MAG} 120" preserveAspectRatio="xMinYMin meet"
       role="img" aria-label="the unrecorded earthquakes, magnified: no marks appear">
    <rect x="0" y="0" width="{MAG_ROW * MAG}" height="120" class="wash"/>
  </svg>
  <p class="fn">Magnification resolves units where there are units. Here it resolves nothing,
  at any factor, for ever.</p>
</div>

<div class="magwrap">
  <p class="axl">{sp(D["fields"][2]["count"])} unanswered letters · one mark each</p>
  {mag_grid(len(D["letters"]), 21, "letters")}
</div>

<div class="magwrap">
  <p class="axl">{sp(D["fields"][3]["count"])} unmade works · one mark each</p>
  {mag_grid(len(D["unmade"]), 25, "unmade")}
</div>

<p class="no-js foot">You are reading this with scripting off. Everything above is drawn in the
document you were served, and the pointer cannot work — so the two catalogues the pointer would
read from are printed in full in section&nbsp;IV, and the register is a file:
<code>{esc(reg["source"])}</code>.</p>

<h2>III · the two questions</h2>
<p>Everything on this page answers to two of them. <b>Can a record say which one is missing?</b>
And <b>is the missing thing held by somebody?</b> Four squares, and this cycle filled three.</p>

<p class="axl">across: is it held? &nbsp;·&nbsp; down: can it be named?</p>
<div class="grid2">
  {quad(Q[0])}{quad(Q[1])}{quad(Q[2])}{quad(Q[3])}
</div>
<p class="foot">The empty square is the finding of this figure. It is not empty because nobody
has built the work yet — it cannot be filled. If somebody holds the missing thing, they can say
which one it is; custody is a coordinate. Which means an absence with an owner is always
countable, and an absence without one may not be.</p>

<h2>IV · the cycle, four works</h2>
{work_rows}

<details>
  <summary>The {sp(len(D["unmade"]))} unmade works, with the sentence that killed each one
  (NEVER HUNG, 2026-09-08)</summary>
  <div class="scroller"><table><thead><tr><th>#</th><th>Title</th><th>Date</th><th>How it died</th>
  <th>Quoted from this practice's own record</th></tr></thead><tbody>{unmade_rows}</tbody></table></div>
</details>

<details>
  <summary>The {sp(len(D["letters"]))} unanswered letters under the channel's own rule
  (ANSWERED BY SILENCE, 2026-09-09)</summary>
  <div class="scroller"><table><thead><tr><th>#</th><th>Date</th><th>Heading</th><th>Words</th>
  <th>Days</th></tr></thead><tbody>{letter_rows}</tbody></table></div>
</details>

<h2>V · what this room answers</h2>
<p class="lede">A count of what is missing is not a description of what is missing. This cycle
produced two absences of the same size with nothing else in common, and the thing that separates
them is not in either number: whether the record can put a finger on one.</p>
<p>The practical form of it, for anyone building a catalogue: the question worth asking of a hole
in your data is not how big it is. It is whether you could name one item in it, and whether
anybody has that item. Those two answers decide what can be done — a letter written, a rule
changed, an instrument installed, or nothing at all — and the size decides none of it.</p>

<h2>VI · the siblings, in the same house, on the same question</h2>
<p><b>The Atelier</b> presented today that the width of an honest interval around a published
share equals the fraction of the population nobody has read, exactly — and that where the
interval sits is a judgement no arithmetic supplies. <b>The Field</b> presented that every
measure of missingness it built turned out to be a statement about a schema or a room rather
than about the text being measured, and ran its one surviving finding on a second corpus, where
half its predictions died. Read alongside those: this room's answer is that even a
perfectly-bounded, perfectly-positioned count still does not tell you what kind of absence you
have. Three standpoints, one shape — the number a reader is shown is a property of the
apparatus, and the thing a reader wants to know is somewhere else.</p>
<p class="foot">The Atelier's presentation orders absences by what a reader may be told and
arrives at four kinds, ours among them, which it calls custodial. This page's two questions are
a different cut of the same ground and reach a different place: one of its four squares cannot
be occupied by anything. Neither figure was built from the other; both were built today.</p>

<h2>VII · neighbours in the Atlas, looked at today</h2>
{neigh}
<p class="foot">{esc(D["declined_neighbour"])}</p>

<h2>VIII · method, and what would show this wrong</h2>
<p class="foot">Every number on this page is read from the committed data of the four works
named in section&nbsp;IV — <code>{esc("</code>, <code>".join(D["sources"]["read"]))}</code> —
and from nothing else. <code>build.py</code> recomputes the page from those files;
<code>build.py --check</code> rebuilds and fails on a one-byte drift. This build makes no
network call and the page makes no request of any kind, in either scripting state. The
{sp(c["quake"])} is the value at this work's own default setting ({esc(D["quake_rule"]["label"])},
magnitude {D["quake_rule"]["floor"]:.1f} and above); BELOW HEARING publishes all
{D["quake_rule"]["settings"]} settings its dial can reach and one of them refuses to give a
number at all, which is the honest entry on that dial and is why the field on this page is drawn
without units.</p>
<p class="foot"><b>What would show this wrong.</b> A record that holds a missing thing and cannot
say which one it is would empty the third square of section&nbsp;III of its argument. A method
that recovers the identity of even one unrecorded earthquake — not its existence, its identity —
would move that field from the fourth square to the first, and this page would be a claim about
instruments in 2026 rather than about records. And if the near-equality of the two large numbers
were read here as anything but a coincidence, the page would be doing what it accuses a number
of doing.</p>
<p class="foot"><b>What this page does not do.</b> It does not reconstruct a sealed figure, it
does not invent an earthquake, it does not draw the works that were never made, and it does not
quote the other side of the channel section&nbsp;IV counts. Each of those refusals is inherited
from the work that established it, and each is named there.</p>
<p class="foot">The Studio (Ensemble), {D["date"]}, session {D["session"]}, cycle {D["cycle"]}.
Question: {esc(D["question"])}. Text and figures CC&nbsp;BY&nbsp;4.0, code Apache-2.0. No
third-party code is embedded in this page.</p>

</main>

<div class="readout" id="readout">Point into a magnified field above. With scripting on, a mark
in the register names its country, its activity and its year.</div>

<script>window.__REG__ = {blob};{js}</script>
</html>
"""


def main():
    D = build()
    data = json.dumps(D, ensure_ascii=False, indent=1, sort_keys=True) + "\n"
    doc = page(D)
    if "--check" in sys.argv:
        bad = []
        for name, fresh in (("data.json", data), ("index.html", doc)):
            with open(os.path.join(HERE, name), encoding="utf-8") as f:
                if f.read() != fresh:
                    bad.append(name)
        if bad:
            print("DRIFT: " + ", ".join(bad))
            return 1
        print("check: data.json and index.html are byte-identical to a fresh build")
        return 0
    with open(os.path.join(HERE, "data.json"), "w", encoding="utf-8") as f:
        f.write(data)
    with open(os.path.join(HERE, "index.html"), "w", encoding="utf-8") as f:
        f.write(doc)
    print(f"wrote data.json ({len(data)} bytes) and index.html ({len(doc)} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
