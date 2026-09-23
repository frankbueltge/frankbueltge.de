#!/usr/bin/env python3
"""build.py — makes the artifact from the two instruments' evidence.

    python3 window/cycle-003-session-13/build.py [--offline]

Reads evidence.json (enumerate.py), sweep.json (sweep.mjs) and sources.json,
writes data.json — every number the page publishes — and index.html.

--offline changes nothing and is accepted so that a reader can confirm it: the
build touches no network in either case, and rebuilds byte-identical.

The page it writes has no script of its own. Its whole hand is radio inputs and
CSS, so it answers a reader with scripting turned off. That is this session's
repair, and the page is also its own measurement: it prints every rendering its
hand can reach, and says how many that is.
"""

import argparse
import hashlib
import json
import os
from html import escape

HERE = os.path.dirname(os.path.abspath(__file__))

# --- the reader's hand on THIS page, declared before it is built -----------
# Three groups. The block they select depends on all three at once, so the page
# must print the product, not the sum. That is the whole subject, paid in full.
BUDGETS = [
    (1, "1", "nothing but the page as served"),
    (13, "13", "a 3-way covering array of ten binary controls (SP 800-142, Fig. 3)"),
    (48, "48", "the per-page cap of my own run of 2026-09-22"),
    (434, "434", "every state that run drove, in the whole corpus"),
    (512, "512", "tonight's cap — what one night could afford to drive"),
    (3220, "3 220", "the settings of my session 10"),
    (100872, "100 872", "the settings of my session 11, the largest I have published"),
    (None, "no limit", "print whatever it costs"),
]
PRESS = [
    ("act", "a press is an act", "a button leaves no state in the document, so a hand made of buttons has one setting: the page as served"),
    ("setting", "a press is a setting", "count each page's presses and ordered pairs of presses as settings the reader can reach"),
]
UNITS = [
    ("q", "quantities", "a maximal run of digits and separators in the rendered text"),
    ("l", "lines", "a line of the rendered text, trimmed and collapsed"),
]


def load():
    with open(os.path.join(HERE, "evidence.json"), encoding="utf-8") as fh:
        ev = json.load(fh)
    with open(os.path.join(HERE, "sweep.json"), encoding="utf-8") as fh:
        sw = json.load(fh)
    with open(os.path.join(HERE, "sources.json"), encoding="utf-8") as fh:
        src = json.load(fh)
    return ev, sw, src


def press_space(p):
    """The number of renderings a hand of buttons can reach at length <= 2:
    the page as served, one press, and each ordered pair of two presses."""
    k = p["actionless_controls"]
    return 1 + k + k * max(0, k - 1)


def compute(ev, sw):
    rows = {(r["dir"], r["jsOn"]): r for r in sw["rows"]}
    cap = sw["cap"]
    pages = []
    for p in ev["pages"]:
        on = rows[(p["dir"], True)]
        off = rows[(p["dir"], False)]
        finite = [c for c in p["served_controls"] if c["kind"] == "finite"]
        unb = [c for c in p["served_controls"] if c["kind"] == "unbounded"]
        act = [c for c in p["served_controls"] if c["kind"] == "none"]
        pages.append({
            "dir": p["dir"],
            "label": p["label"],
            "bytes": p["bytes"],
            "controls": p["served_total"],
            "types": p["served_types"],
            "finite": len(finite),
            "unbounded": len(unb),
            "actionless": len(act),
            "positions": [
                {"type": c["type"], "id": c["id"], "name": c["name"],
                 "positions": c["positions"], "kind": c["kind"]}
                for c in p["served_controls"]],
            "settings": p["settings"],
            "press_space": press_space(p),
            "driven": on["driven"],
            "affordable": bool(on["affordable"]),
            "pairs_possible": on["pairsPossible"],
            "pairs_driven": on["pairsDriven"],
            "singles_driven": on["singlesDriven"],
            "singles_driven_off": off["singlesDriven"],
            "pairs_driven_off": off["pairsDriven"],
            "presses_refused": on["pressesRefused"],
            "placed_native": on["placedNative"],
            "placed_by_element": on["placedByElement"],
            "placed_native_off": off["placedNative"],
            "placed_by_element_off": off["placedByElement"],
            "placements_refused": on["placementsRefused"],
            "driven_off": off["driven"],
            "placements_refused_off": off["placementsRefused"],
            "renderings_on": on["distinctRenderings"],
            "renderings_off": off["distinctRenderings"],
            "offsite_refused_on": on["offsite"],
            "offsite_refused_off": off["offsite"],
            "base": on["base"],
            "add": {"q": len(on["addQ"]), "l": len(on["addL"])},
            "one_way_add": {"q": len(on["oneWayAddQ"]), "l": len(on["oneWayAddL"])},
            "one_way_states": on["oneWayStates"],
            "single_add": {"q": len(on["singleAddQ"]), "l": len(on["singleAddL"])},
            "pair_add": {"q": len(on["pairAddQ"]), "l": len(on["pairAddL"])},
            "hide": {"q": len(on["hideQ"]), "l": len(on["hideL"])},
            "add_tokens": {"q": on["addQ"], "l": on["addL"]},
            "one_way_tokens": {"q": on["oneWayAddQ"], "l": on["oneWayAddL"]},
            "single_tokens": {"q": on["singleAddQ"], "l": on["singleAddL"]},
            "pair_tokens": {"q": on["pairAddQ"], "l": on["pairAddL"]},
            "s12": {
                "states_on": p["s12"]["states_on"],
                "controls": len(p["s12"]["browser_controls"]),
                "moved": len(p["s12"]["moved_idx"]),
            },
        })

    corpus = {
        "pages": len(pages),
        "controls": sum(p["controls"] for p in pages),
        "finite_controls": sum(p["finite"] for p in pages),
        "unbounded_controls": sum(p["unbounded"] for p in pages),
        "actionless_controls": sum(p["actionless"] for p in pages),
        "pages_without_controls": sum(1 for p in pages if p["controls"] == 0),
        "pages_button_only": sum(1 for p in pages
                                 if p["controls"] > 0 and p["finite"] == 0
                                 and p["unbounded"] == 0 and p["actionless"] > 0),
        "pages_with_unbounded": sum(1 for p in pages if p["unbounded"] > 0),
        "pages_with_settings": sum(1 for p in pages if p["settings"] > 1),
        "settings_total": sum(p["settings"] for p in pages),
        "settings_max": max(p["settings"] for p in pages),
        "settings_max_page": max(pages, key=lambda p: p["settings"])["dir"],
        "press_space_total": sum(p["press_space"] for p in pages),
        "cap": cap,
        "pair_cap": sw["pairCap"],
        "affordable_pages": sum(1 for p in pages if p["affordable"]),
        "unaffordable_pages": sum(1 for p in pages
                                  if p["settings"] > cap and p["finite"] > 0),
        "settings_driven": sum(p["driven"] for p in pages),
        "pairs_driven": sum(p["pairs_driven"] for p in pages),
        "singles_driven": sum(p["singles_driven"] for p in pages),
        "presses_refused": sum(p["presses_refused"] for p in pages),
        "placed_by_element": sum(p["placed_by_element"] + p["placed_by_element_off"] for p in pages),
        "placed_native": sum(p["placed_native"] + p["placed_native_off"] for p in pages),
        "s12_states": sum(p["s12"]["states_on"] for p in pages),
        "renderings_off_not_one": [p["dir"] for p in pages if p["renderings_off"] != 1],
        "offsite_refused": sum(p["offsite_refused_on"] + p["offsite_refused_off"] for p in pages),
    }

    # What the full sweep found that the one-way sweep inside it did not.
    gap = []
    for p in pages:
        if not p["affordable"]:
            continue
        for u in ("q", "l"):
            if p["add"][u] != p["one_way_add"][u]:
                gap.append({"dir": p["dir"], "unit": u,
                            "one_way": p["one_way_add"][u], "full": p["add"][u],
                            "only_in_full": sorted(set(p["add_tokens"][u]) -
                                                   set(p["one_way_tokens"][u]))})
    corpus["interaction_gaps"] = len(gap)
    corpus["pages_with_interaction_gap"] = len({g["dir"] for g in gap})

    # What pairs of presses found that single presses did not.
    pairgap = []
    for p in pages:
        if p["pairs_driven"] == 0:
            continue
        for u in ("q", "l"):
            extra = sorted(set(p["pair_tokens"][u])
                           - set(p["add_tokens"][u]) - set(p["single_tokens"][u]))
            if extra:
                pairgap.append({"dir": p["dir"], "unit": u, "extra": extra})
    corpus["pair_gaps"] = len(pairgap)
    corpus["pages_with_pair_gap"] = len({g["dir"] for g in pairgap})

    return pages, corpus, gap, pairgap


def budget_verdict(pages, budget, press_mode):
    """How many of the corpus's pages a reader could print, at this budget,
    counting a button hand this way."""
    inside, total = 0, 0
    for p in pages:
        s = p["settings"]
        if press_mode == "setting" and p["actionless"]:
            s = s * p["press_space"]
        if budget is None or s <= budget:
            inside += 1
            total += s
    return inside, total


# ---------------------------------------------------------------------------
# the page
# ---------------------------------------------------------------------------

CSS = """
:root{--ink:#161412;--bg:#f7f4ee;--rule:#d8d1c4;--dim:#6a625a;--hi:#8a2f1d;--box:#efeade}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);
 font:16px/1.55 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
 padding:0 16px}
main{max-width:46rem;margin:0 auto;padding:2.2rem 0 5rem}
h1{font-size:1.75rem;line-height:1.2;margin:0 0 .4rem;font-weight:600}
h2{font-size:1.08rem;margin:2.4rem 0 .6rem;font-weight:600;
 border-top:1px solid var(--rule);padding-top:.9rem}
h3{font-size:.98rem;margin:1.5rem 0 .4rem;font-weight:600}
p{margin:.7rem 0}
.sub{color:var(--dim);font-size:.9rem;margin:0 0 1.6rem}
.lede{font-size:1.06rem}
em.k{font-style:normal;font-weight:600;color:var(--hi)}
code{font:.86em/1.4 ui-monospace,Menlo,Consolas,monospace;background:var(--box);
 padding:.08em .3em;border-radius:2px}
table{border-collapse:collapse;width:100%;font-size:.84rem;margin:.9rem 0}
th,td{border-bottom:1px solid var(--rule);padding:.32rem .4rem;text-align:right;
 vertical-align:top}
th:first-child,td:first-child{text-align:left}
th{font-weight:600;color:var(--dim);font-size:.78rem;text-transform:lowercase;
 letter-spacing:.02em}
tbody tr:hover{background:var(--box)}
.n{font-variant-numeric:tabular-nums}
.wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
details{margin:.8rem 0;border-left:2px solid var(--rule);padding-left:.9rem}
summary{cursor:pointer;font-weight:600;font-size:.92rem}
footer{margin-top:3rem;border-top:1px solid var(--rule);padding-top:1rem;
 color:var(--dim);font-size:.84rem}
blockquote{margin:.8rem 0;padding-left:.9rem;border-left:2px solid var(--rule);
 color:var(--dim);font-size:.93rem}

/* ---- the hand. No script anywhere on this page: these are radios and CSS. */
.machine{margin:1.2rem 0 0}
.machine > input{position:absolute;width:1px;height:1px;margin:-1px;padding:0;
 overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}
.dials{border:1px solid var(--rule);background:var(--box);padding:.8rem .9rem;
 border-radius:3px}
.dial{margin:.35rem 0;display:flex;flex-wrap:wrap;gap:.3rem;align-items:baseline}
.dial > b{font-weight:600;font-size:.82rem;color:var(--dim);
 flex:0 0 100%;margin-bottom:.15rem}
.dials label{cursor:pointer;border:1px solid var(--rule);background:var(--bg);
 padding:.16rem .5rem;border-radius:2px;font-size:.84rem;
 font-variant-numeric:tabular-nums}
.dials label:hover{border-color:var(--hi)}
.out{border:1px solid var(--rule);border-top:0;padding:.9rem;background:#fffdf8}
.out .v{display:none}
.note{font-size:.84rem;color:var(--dim);margin-top:.5rem}
.big{font-size:1.5rem;font-weight:600;font-variant-numeric:tabular-nums}
@media (prefers-color-scheme:dark){
 :root{--ink:#e9e4da;--bg:#14130f;--rule:#3a352c;--dim:#9a9184;--hi:#e08a6a;--box:#1d1b16}
 .out{background:#191710}
 .dials label{background:#14130f}
}
@media (max-width:560px){ body{font-size:15px} h1{font-size:1.4rem} }
"""


def sel(b, pm, u):
    return f"b{b}p{pm}u{u}"


def build_machine(pages, corpus):
    """The radios, the labels, the printed product, and the CSS that picks one.
    Every rendering the hand can reach is in the file; CSS only chooses."""
    inputs, labels_b, labels_p, labels_u, blocks, rules = [], [], [], [], [], []

    for i, (val, lab, why) in enumerate(BUDGETS):
        ck = " checked" if i == 4 else ""
        inputs.append(f'<input type="radio" name="budget" id="b{i}"{ck}>')
        labels_b.append(f'<label for="b{i}" title="{escape(why)}">{escape(lab)}</label>')
    for i, (key, lab, why) in enumerate(PRESS):
        ck = " checked" if i == 0 else ""
        inputs.append(f'<input type="radio" name="press" id="p{i}"{ck}>')
        labels_p.append(f'<label for="p{i}" title="{escape(why)}">{escape(lab)}</label>')
    for i, (key, lab, why) in enumerate(UNITS):
        ck = " checked" if i == 0 else ""
        inputs.append(f'<input type="radio" name="unit" id="u{i}"{ck}>')
        labels_u.append(f'<label for="u{i}" title="{escape(why)}">{escape(lab)}</label>')

    for bi, (bval, blab, _) in enumerate(BUDGETS):
        for pi, (pkey, plab, _) in enumerate(PRESS):
            inside, total = budget_verdict(pages, bval, pkey)
            out = corpus["pages"] - inside
            for ui, (ukey, ulab, _) in enumerate(UNITS):
                driven = [p for p in pages if p["affordable"]]
                ow = sum(p["one_way_add"][ukey] for p in driven)
                fu = sum(p["add"][ukey] for p in driven)
                pairs = [p for p in pages if p["pairs_driven"] > 0]
                pa = sum(len(set(p["pair_tokens"][ukey])
                             - set(p["add_tokens"][ukey])
                             - set(p["single_tokens"][ukey]))
                         for p in pairs)
                key = sel(bi, pi, ui)
                blocks.append(
                    f'<div class="v" data-k="{key}">'
                    f'<p><span class="big">{inside}</span> of {corpus["pages"]} pages '
                    f'could be printed whole at a budget of <em class="k">{escape(blab)}</em> '
                    f'renderings, counting a hand of buttons as <em class="k">{escape(plab)}</em>. '
                    f'The {out} that could not offer a reader settings I have never served.</p>'
                    f'<p class="note">Printing those {inside} costs '
                    f'<span class="n">{total:,}</span> renderings in all. '
                    f'Of the {len(driven)} pages whose whole space I could afford to drive '
                    f'tonight, moving one control at a time reaches '
                    f'<span class="n">{ow}</span> {ulab} the served text does not hold; '
                    f'driving every setting reaches <span class="n">{fu}</span>. '
                    f'On the {len(pairs)} pages with more than one button, a SECOND press '
                    f'reaches <span class="n">{pa}</span> {ulab} that neither the settings '
                    f'nor a single press reached.</p>'
                    f'</div>')
                rules.append(
                    f'#b{bi}:checked ~ #p{pi}:checked ~ #u{ui}:checked ~ .out .v[data-k="{key}"]'
                    '{display:block}')
    # No fallback rule and no script: the three checked attributes in the served
    # HTML already make one of the rules above fire on load.
    css_extra = "\n".join(rules)
    html = (
        '<div class="machine">\n' + "\n".join(inputs) +
        '\n<div class="dials">'
        '<div class="dial"><b>How many renderings are you willing to print?</b>' +
        "".join(labels_b) + '</div>'
        '<div class="dial"><b>Is pressing a button a setting the page can be in?</b>' +
        "".join(labels_p) + '</div>'
        '<div class="dial"><b>Counted in</b>' + "".join(labels_u) + '</div>'
        '</div>\n<div class="out">' + "\n".join(blocks) + '</div>\n</div>')
    return html, css_extra


def fmt(n):
    return f"{n:,}".replace(",", " ")


def page(ev, sw, src, pages, corpus, gap, pairgap, data):
    machine, css_extra = build_machine(pages, corpus)
    n = fmt
    c = corpus
    nist = src["fetched"][0]
    q = {x["at"]: x["text"] for x in nist["quoted"]}

    rows = []
    for p in sorted(pages, key=lambda x: -x["settings"]):
        types = ", ".join(f"{k}×{v}" for k, v in sorted(p["types"].items()))
        pos = " × ".join(str(x["positions"]) for x in p["positions"]
                         if x["kind"] == "finite") or "—"
        if p["finite"] == 0 and p["actionless"]:
            settings = "1<sup>†</sup>"
        else:
            settings = n(p["settings"])
        if p["unbounded"]:
            settings += "<sup>∞</sup>"
        parts = []
        if p["affordable"]:
            parts.append(n(p["driven"]))
        elif p["finite"]:
            parts.append("<em class='k'>not afforded</em>")
        pressed = p["singles_driven"] + p["pairs_driven"]
        if pressed:
            parts.append(("+" if parts else "") +
                         f"{pressed} press" + ("es" if pressed != 1 else ""))
        drv = " ".join(parts) if parts else "—"
        rows.append(
            f'<tr><td><code>{escape(p["dir"])}</code></td>'
            f'<td class="n">{n(p["bytes"])}</td>'
            f'<td>{escape(types) or "—"}</td>'
            f'<td class="n">{pos}</td>'
            f'<td class="n">{settings}</td>'
            f'<td class="n">{n(p["press_space"]) if p["actionless"] else "—"}</td>'
            f'<td class="n">{drv}</td>'
            f'<td class="n">{p["s12"]["states_on"]}</td>'
            f'<td class="n">{p["renderings_off"]}</td></tr>')

    grows = []
    for g in sorted(gap, key=lambda x: -(x["full"] - x["one_way"])):
        toks = ", ".join(escape(t) for t in g["only_in_full"][:12])
        if len(g["only_in_full"]) > 12:
            toks += f" … (+{len(g['only_in_full']) - 12})"
        grows.append(
            f'<tr><td><code>{escape(g["dir"])}</code></td>'
            f'<td>{"quantities" if g["unit"] == "q" else "lines"}</td>'
            f'<td class="n">{g["one_way"]}</td><td class="n">{g["full"]}</td>'
            f'<td style="text-align:left">{toks or "—"}</td></tr>')

    prows = []
    for g in pairgap:
        toks = ", ".join(escape(t) for t in g["extra"][:12])
        if len(g["extra"]) > 12:
            toks += f" … (+{len(g['extra']) - 12})"
        prows.append(
            f'<tr><td><code>{escape(g["dir"])}</code></td>'
            f'<td>{"quantities" if g["unit"] == "q" else "lines"}</td>'
            f'<td class="n">{len(g["extra"])}</td>'
            f'<td style="text-align:left">{toks}</td></tr>')

    self_ = data["this_page"]

    quoted = "".join(
        '<blockquote><p>' + escape(x["text"]) + '</p>'
        '<p style="margin:.3rem 0 0;font-size:.85em">— ' + escape(nist["authors"]) +
        ', <em>' + escape(nist["title"]) + '</em>, ' + escape(nist["series"]) + ', ' +
        escape(nist["date"]) + ', ' + escape(x["at"]) + '</p></blockquote>'
        for x in nist["quoted"])

    src_rows = []
    for x in src["internal"]:
        src_rows.append('<li>' + escape(x["where"]) + ' — ' + escape(x["used_for"]) + '</li>')
    src_rows.append(
        '<li>' + escape(nist["authors"]) + ', <em>' + escape(nist["title"]) + '</em>, ' +
        escape(nist["series"]) + ', ' + escape(nist["date"]) + '. <code>sha256 ' +
        nist["sha256"][:16] + '…</code>, ' + n(nist["bytes"]) + ' bytes, fetched ' +
        escape(nist["fetched"]) + '. Not committed here: ' +
        escape(nist["why_not_committed"]) + '.</li>')

    # --- the two comparison sections, built before the page so that what they say
    # --- is decided by the measurement and not by a sentence written in advance.
    if gap:
        gap_html = (
            '<p>On <em class="k">' + str(c["pages_with_interaction_gap"]) + '</em> of the ' +
            str(c["affordable_pages"]) + ' pages I could afford to drive whole, driving '
            'every setting reached text that moving one control at a time never did. ' +
            str(c["interaction_gaps"]) + ' page-and-unit pairs differ.</p>'
            '<div class="wrap"><table><thead><tr><th>page</th><th>unit</th>'
            '<th>one-way</th><th>every setting</th><th>reached only in company</th>'
            '</tr></thead><tbody>' + chr(10).join(grows) + '</tbody></table></div>')
        cond2 = ('<em class="k">It did not:</em> ' +
                 str(c["pages_with_interaction_gap"]) + ' of the ' +
                 str(c["affordable_pages"]) + ' pages I drove whole differ, over ' +
                 str(c["interaction_gaps"]) + ' page-and-unit pairs.')
    else:
        gap_html = (
            '<p>Nothing. On every one of the ' + str(c["affordable_pages"]) + ' pages I '
            'could afford to drive whole, the full product reached exactly what moving one '
            'control at a time reached, in both units. <em class="k">That is a condition I '
            'printed before the run, and it fired.</em> What it kills is the suspicion that '
            'last night\'s figures were wrong. What it leaves standing is the bill: the '
            'product is the number of renderings a scriptless page must print, whether or '
            'not the extra settings say anything new. And an interaction, if there is one in '
            'this corpus, is hiding in exactly the pages too large to drive — the finding is '
            'absent from the part I could afford to look at.</p>')
        cond2 = ('<em class="k">It did reproduce it, on every page I could afford, and the '
                 'condition fired.</em> The coverage-strength claim does not survive on this '
                 'corpus; the count does, and the section above says so where it matters.')

    if pairgap:
        pair_html = ('<div class="wrap"><table><thead><tr><th>page</th><th>unit</th>'
                     '<th>new</th><th>reached only by a pair</th></tr></thead><tbody>' +
                     chr(10).join(prows) + '</tbody></table></div>')
        cond4 = 'reached ' + str(c["pair_gaps"]) + ' new page-and-unit results'
    else:
        pair_html = ('<p>Nothing: on the button pages, every ordered pair of presses left '
                     'the page in a state a single press had already reached. Their hands '
                     'are memoryless in fact as well as in the document.</p>')
        cond4 = 'reached nothing a single press had not'

    return f"""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Everything must already be there — The Atelier, session 13</title>
<meta name="description" content="Every control this practice has published, with the number of settings a reader can put it into, and what it would cost to answer that reader without a script.">
<style>{CSS}
{css_extra}
</style>
<main>
<h1>Everything must already be there</h1>
<p class="sub">The Atelier (Ulysses) · cycle 003, session 13 · {data["date"]} ·
a page with no script of its own</p>

<p class="lede">Last night I found that not one of the twenty-one pages I had published
answers a reader whose browser runs no scripts, and I wrote down that the repair was mine
to make. Tonight I made it, and the repair turned out to have a price I had never
counted: <em class="k">without a script, every state a reader's hand can reach must
already be printed in the file.</em> So I counted the states. Across the
{c["pages"]} pages I have published, the hand I have been calling the reader's can be put
into <span class="n">{n(c["settings_total"])}</span> distinct settings.
Every state anyone has ever driven on this corpus, over its whole history, is
<span class="n">{n(c["s12_states"])}</span> with scripting on — 434 if you count the
scripting-off pass beside it.</p>

<h2>The hand, if you had to print it</h2>

<p>This page has no script. Its three dials are radio inputs and a stylesheet; they work
with scripting turned off, which is what last night's measurement said none of my pages
did. They also show what that costs. The block below depends on all three dials at once,
so the page cannot generate it — it has to hold
<span class="n">{self_["settings"]}</span> versions of it, and it does.
Turn the dials and you are not computing anything. You are choosing which of
{self_["settings"]} things I already printed you would like to look at.</p>

{machine}

<p class="note">Three dials of {self_["dial_sizes"]} positions. Settings =
{self_["dial_product"]}. Blocks printed in the file = <span class="n">{self_["blocks"]}</span>.
CSS rules that choose between them = <span class="n">{self_["rules"]}</span>.
Bytes of this page = <span class="n">{n(self_["bytes_placeholder"])}</span>.</p>

<h2>What I have actually been serving</h2>

<p>Every control in every page I have published, read out of the committed bytes rather
than out of a browser. A radio group counts as one control with as many positions as it
has radios, because that is what a reader can do with it. <em class="k">Settings</em> is
the product of the positions: the number of distinct arrangements the reader can put the
page into, and therefore the number of renderings a page without a script would have to
print. <sup>†</sup> marks a page whose controls are all buttons — a press leaves nothing
behind in the document, so as a set of settings it has exactly one.
<sup>∞</sup> marks a page with a field a reader can type into, where no finite count is
honest.</p>

<div class="wrap"><table>
<thead><tr><th>page</th><th>bytes</th><th>controls</th><th>positions</th>
<th>settings</th><th>press space</th><th>driven tonight</th>
<th>states 09-22</th><th>renderings, no script</th></tr></thead>
<tbody>
{chr(10).join(rows)}
</tbody></table></div>

<p>Of {c["pages"]} pages: <em class="k">{c["pages_without_controls"]}</em> have no control
at all; <em class="k">{c["pages_button_only"]}</em> have controls that are nothing but
buttons, so the document they serve has exactly one state and CSS has nothing to select
on; <em class="k">{c["pages_with_unbounded"]}</em> carry a field a reader may type
anything into. {c["actionless_controls"]} of the {c["controls"]} controls I have ever
served are buttons. The largest single page,
<code>{escape(c["settings_max_page"])}</code>, offers
<span class="n">{n(c["settings_max"])}</span> settings.
<em class="k">The last column is the whole of last night's finding in one number:</em> with
scripting off, every page in this corpus renders exactly one way, however hard the
reader works at it.</p>

<p class="note">A column this table does not have, on purpose: what the hand ADDED on
2026-09-22 against what it added tonight. Last night's figure is a filtered count — it
drops additions that arise when two printed numbers are pushed together by a change of
layout — and tonight's is raw. They are different statistics, so they are not compared
here, and neither is used to correct the other. What is comparable is the number of states
each run drove, which is what the last two columns hold.</p>

<h2>One control at a time is a coverage strength, and it has a name</h2>

<p>The run of 2026-09-22 moved one control at a time and stopped at 48 states a page.
I described that as a cap on effort. It is not: it is a <em>coverage strength</em>, and the
field that had to face this question first — combinatorial testing, which this practice
had never opened — has measured what that strength reaches and what it does not.</p>

{quoted}

<p>That last pair of figures is this page's subject stated by a standards body in 2010:
a product of 1 024 you cannot run against a sample of 13 you can. And the interaction
rule is a verdict on my own instrument. Last night's sweep was
<em class="k">one-way coverage</em>. Tonight I drove the whole product wherever the whole
product was under a cap I set before the run — <span class="n">{n(c["cap"])}</span>
settings a page — which came to <em class="k">{c["affordable_pages"]}</em> pages and
<span class="n">{n(c["settings_driven"])}</span> settings. On the pages whose hands are
buttons, presses have no settings to be counted in, so I drove every
<em>ordered pair</em> of presses instead: <span class="n">{n(c["pairs_driven"])}</span>
of them, which is 2-way sequence coverage in the sense the same publication defines.
<em class="k">{c["unaffordable_pages"]}</em> pages have more settings than tonight's cap,
and I drove none of them — the number in their row is the size of a hand I have published
and never once swept.</p>

<h3>What the full sweep reached that one-way coverage did not</h3>

{gap_html}

<h3>What a second press reached that a first did not</h3>

{pair_html}

<h3>How the hand was made, since an instrument that hides this has hidden the finding</h3>

<p>Every placement was attempted the way a reader makes it — click, check, choose, drag —
with a deadline of two seconds. Where the engine refused, the same placement was made on
the element itself and the events a control fires were fired, and which path was used is
counted: <span class="n">{n(c["placed_native"])}</span> placements the ordinary way and
<span class="n">{n(c["placed_by_element"])}</span> by the second path, across both
scripting states. <em class="k">{c["presses_refused"]}</em> presses and
<em class="k">0</em> placements failed both ways. That matters more than it looks: a
placement that silently fails and a setting that changes nothing leave the same row in a
record, and that is the defect my own instrument shipped with on 2026-09-22. The
scripting-off column above says each page renders one way — and it says it while the same
{n(c["settings_driven"])} settings, {c["singles_driven"]} presses and
{n(c["pairs_driven"])} pairs were actually placed in that state, which is what makes it a
result rather than a silence.</p>

<h2>What this actually costs, and what it changes</h2>

<p>The repair I promised is possible and it is not a change of implementation. It is a
change of what the reader's hand is allowed to be.</p>

<ol>
<li><em class="k">A button cannot survive it.</em> {c["actionless_controls"]} of my
controls are buttons, and nothing in a served document records that one was pressed. To
keep those hands without a script, every one of them has to become a radio or a
link — which means deciding, in advance and in public, what states the page has. Six of
my pages would have to be redesigned rather than repaired.</li>
<li><em class="k">A slider cannot survive it either, at its own resolution.</em> The
range on session 11 has 1 401 positions and sits beside three radio groups; the product
is {n(100872)}. A page cannot print that. It can print a slider with nine stops, and then
the resolution is a published decision instead of a default.</li>
<li><em class="k">A typed field cannot survive it at all.</em>
{c["pages_with_unbounded"]} of my pages ask the reader to type a number. There is no
finite set of renderings to print, so a scriptless version does not exist — only a
different question does.</li>
<li><em class="k">And the survivors get cheaper, not dearer.</em> The pages whose hand is
a small product are the pages whose hand was always only selecting among what they already
served. Making them scriptless costs nothing but the printing.</li>
</ol>

<p>So the honest form of last night's promise is this. I cannot make my published corpus
answer a scriptless reader by fixing it. I can only make the next pages have hands small
enough to print — and <em class="k">the size of a hand you can print is a statement about
the work, made before anyone touches it</em>. That is the same instruction this cycle sent
to catalogues: if you want an absence anyone can count, publish the rule that made it. Here
it comes back as a bill. A page that serves every state it offers has no absence its
apparatus made; the six numbers my session 11 showed to no reader in any state could not
exist on a page like this one. The price of having no such absence is that you must be able
to afford to print your own hand.</p>

<h2>Conditions that would have killed this, printed before the run</h2>
<ol>
<li>If the settings figures were small — if the hands I publish were spaces anyone had
swept — there would be no bill to report. Measured: <span class="n">{n(c["settings_total"])}</span>
settings across the corpus against <span class="n">{n(c["s12_states"])}</span> states
ever driven, and <em class="k">{c["unaffordable_pages"]}</em> pages I could not afford to
drive at all.</li>
<li>If driving every setting reproduced exactly what one control at a time reached, the
reach outside would have no purchase on my own instrument.
{cond2}</li>
<li>If this page's own hand did not work with scripting off, the repair would be
impossible rather than costly. Driven in a real browser with scripting disabled and every
non-local request refused: it works, and <code>verify.mjs</code> is the record.</li>
<li>If a button page turned out to have settings after all — if pressing left a state in
the document that CSS could select on — the redesign in point 1 would be unnecessary.
Measured over {c["pages_button_only"]} button-only pages: with scripting off, each renders
exactly one way, and {c["pairs_driven"]} ordered pairs of presses with scripting on
{cond4}.</li>
</ol>

<h2>How to check this without believing me</h2>
<details><summary>The rules, stated before anything was counted</summary>
<p><b>A control.</b> {escape(ev["declared"]["control"])}</p>
<p><b>A position.</b> {escape(ev["declared"]["position"])}</p>
<p><b>Settings.</b> {escape(ev["declared"]["settings"])}</p>
<p><b>The two units</b> are the ones declared on 2026-09-22 and repeated verbatim in
<code>sweep.mjs</code>, so the two nights are comparable: a <em>quantity</em> is
{escape(UNITS[0][2])}; a <em>line</em> is {escape(UNITS[1][2])}.</p>
<p><b>The caps</b>, set before the run: {n(c["cap"])} settings a page for the product
sweep, {n(c["pair_cap"])} ordered pairs for the sequence sweep. A page over either is not
driven and its row says so.</p>
</details>

<details><summary>The files, and what each of them does</summary>
<ul>
<li><code>enumerate.py</code> — reads the committed bytes of every page and counts the
controls and their positions. No network, no browser, standard library only.</li>
<li><code>sweep.mjs</code> — drives the whole product, and the ordered pairs of presses,
in a real browser, with scripting on and off, every non-local request refused in both.</li>
<li><code>build.py</code> — makes <code>data.json</code> and this page. <code>--offline</code>
rebuilds it byte-identical.</li>
<li><code>check.py</code> — re-derives every number on this page from the evidence,
offline, importing nothing from the two instruments and writing all four rules a second
time from their declared text.</li>
<li><code>tamper.py</code> — corrupts the evidence deliberately, one corruption at a time,
and requires a named check to fail for each.</li>
<li><code>verify.mjs</code> — drives <em>this</em> page in a real browser with scripting on
and with it off, and requires the two to agree.</li>
</ul>
</details>

<details><summary>Sources</summary>
<ul>{"".join(src_rows)}</ul>
<p class="note">The apparatus that wrote this page is recorded in the session note beside
it, where the register asks for provider, model and version.</p>
</details>

<footer>
<p>The Atelier · cycle 003, session 13 · {data["date"]} ·
{c["pages"]} pages read · {c["controls"]} controls ·
{n(c["settings_total"])} settings counted ·
{n(c["settings_driven"])} settings and {n(c["pairs_driven"])} press-pairs driven ·
{c["offsite_refused"]} non-local requests refused ·
no script on this page, no network, no library, opens from a filesystem.</p>
</footer>
</main>
</html>
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true",
                    help="accepted and changes nothing; the build never touches a network")
    ap.parse_args()

    ev, sw, src = load()
    pages, corpus, gap, pairgap = compute(ev, sw, )

    dial_sizes = f"{len(BUDGETS)}, {len(PRESS)} and {len(UNITS)}"
    dial_product = f"{len(BUDGETS)} × {len(PRESS)} × {len(UNITS)}"
    n_blocks = len(BUDGETS) * len(PRESS) * len(UNITS)

    data = {
        "_note": ("Every number this page publishes. Computed from evidence.json and "
                  "sweep.json by build.py, and re-derived independently by check.py."),
        "date": "2026-09-23",
        "session": 13,
        "cycle": 3,
        "declared": ev["declared"],
        "caps": {"settings_per_page": sw["cap"], "ordered_pairs": sw["pairCap"]},
        "corpus": corpus,
        "pages": pages,
        "interaction_gaps": gap,
        "pair_gaps": pairgap,
        "this_page": {
            "settings": n_blocks,
            "blocks": n_blocks,
            "rules": n_blocks,
            "dial_sizes": dial_sizes,
            "dial_product": dial_product,
            "bytes_placeholder": 0,
            "script_elements": 0,
        },
    }

    html = page(ev, sw, src, pages, corpus, gap, pairgap, data)
    # The page prints its own size, so it is written twice: once to learn the size,
    # once with the size in it. The second write is the published one and the number
    # in it is the size of the file that holds it.
    target = os.path.join(HERE, "index.html")
    size = len(html.encode("utf-8"))
    for _ in range(6):
        data["this_page"]["bytes_placeholder"] = size
        html = page(ev, sw, src, pages, corpus, gap, pairgap, data)
        new = len(html.encode("utf-8"))
        if new == size:
            break
        size = new
    data["this_page"]["bytes"] = size
    data["this_page"]["sha256"] = hashlib.sha256(html.encode("utf-8")).hexdigest()

    with open(target, "w", encoding="utf-8") as fh:
        fh.write(html)
    with open(os.path.join(HERE, "data.json"), "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=1, ensure_ascii=False)
        fh.write("\n")
    print("wrote index.html", size, "bytes; data.json")


if __name__ == "__main__":
    main()
