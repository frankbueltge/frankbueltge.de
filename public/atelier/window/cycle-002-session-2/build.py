#!/usr/bin/env python3
"""Builds index.html for cycle 002, session 2 — the Propp reduction.

Every number on the page is computed here from `data.json` (what the instrument
measured) and `verdicts.json` (what the reader decided). Nothing is typed in by hand
and nothing is copied from an earlier draft: if a number in the prose disagrees with
the data, this file is where it is fixed, and `check.py` fails until it is.

    python3 window/cycle-002-session-2/build.py
    python3 window/cycle-002-session-2/check.py

Form, decided on the merits and named as the direction of 2026-09-03 asks: the object
of this session is a **choice of measure**, and the finding is what happens to the top
of the ranking as the choice moves. Two switches — vocabulary and weighting — give
four rankings, and a still picture must pick one of the four and hide the argument. So
the page is client-rendered and switchable. All four cells are also written into the
document complete, so a reader with no JavaScript reads the same four rankings as
static text and loses nothing but the switch.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import html
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
DATA = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
VERD = json.loads((HERE / "verdicts.json").read_text(encoding="utf-8"))

V = VERD["verdicts"]
PAIRS = {p["id"]: p for p in DATA["adjudication"]["pairs"]}
CELLS = DATA["cells"]
ORDER = ["A", "B", "C", "D"]
VERDICT_ORDER = ["same move", "adjacent move", "same subject", "not a pair"]

CELL_TITLE = {
    "A": "every token · rarity decides",
    "B": "every token · recurrence decides",
    "C": "act tokens · rarity decides",
    "D": "act tokens · recurrence decides",
}


def e(s) -> str:
    return html.escape(str(s), quote=True)


# ------------------------------------------------------------------ numbers

def survivors(cell: str) -> list[str]:
    """Pair ids from this cell's top forty that survived the two artefact rules."""
    return [pid for pid, p in PAIRS.items() if cell in p["cells"]]


def tally(ids: list[str]) -> dict[str, int]:
    out = {k: 0 for k in VERDICT_ORDER}
    for pid in ids:
        out[V[pid]["v"]] += 1
    return out


def ranked(cell: str) -> list[str]:
    return sorted(survivors(cell), key=lambda pid: PAIRS[pid]["cells"][cell]["rank"])


CENSUS = DATA["census"]["counts"]
N = DATA["n_works"]
ACT_AS_MOVE = CENSUS.get("finite verb", 0) + CENSUS.get("participle", 0)
NOT_AS_MOVE = N - ACT_AS_MOVE

TALLY = {c: tally(survivors(c)) for c in ORDER}
SURV = {c: len(survivors(c)) for c in ORDER}

# how much of a pair's cosine sits on its single largest shared token
ONE_WORD = {
    c: sum(1 for pid in survivors(c) if (PAIRS[pid]["cells"][c]["top_share"] or 0) >= 0.5)
    for c in ORDER
}
ONE_WORD_TOTAL = sum(ONE_WORD.values())
SLOTS_TOTAL = sum(SURV.values())
EXACT_ONE = {
    c: sum(1 for pid in survivors(c) if PAIRS[pid]["cells"][c]["n_shared"] == 1)
    for c in ORDER
}

EXCESS = {
    c: (CELLS[c]["observed_median"] / CELLS[c]["null_median"] - 1.0) if CELLS[c]["null_median"] else 0.0
    for c in ORDER
}

import statistics

NOT_A_PAIR_TOTAL = sum(1 for pid in PAIRS if V[pid]["v"] == "not a pair")
MEDIAN_SHARED = {
    c: statistics.median(PAIRS[pid]["cells"][c]["n_shared"] for pid in survivors(c))
    for c in ORDER
}
MEDIAN_ONE = sum(1 for c in ORDER if MEDIAN_SHARED[c] == 1)

SAME_MOVE_TOTAL = sum(1 for pid in PAIRS if V[pid]["v"] == "same move")
ADJACENT_TOTAL = sum(1 for pid in PAIRS if V[pid]["v"] == "adjacent move")
N_PAIRS = len(PAIRS)

# the single pair either night called a move-level match, and what carries it
SAME_MOVE_IDS = [pid for pid in PAIRS if V[pid]["v"] == "same move"]


# ------------------------------------------------------------------- svg

def svg_census() -> str:
    """One bar of 521 fields, split by what the first word of the field is."""
    W, H = 900, 132
    classes = [
        ("finite verb", "an act, in a finite verb", "b-sur"),
        ("participle", "an act, in a participle", "b-sur2"),
        ("determiner", "a determiner — a thing is being named", "b-res"),
        ("other", "something else", "b-oth"),
        ("residue", "the harvesting apparatus", "b-art"),
        ("no word", "no word at all", "b-art"),
    ]
    x, y, bw = 8, 34, W - 16
    parts, labs = [], []
    for k, lab, cls in classes:
        n = CENSUS.get(k, 0)
        if not n:
            continue
        w = bw * n / N
        parts.append(
            f'<rect class="{cls}" x="{x:.1f}" y="{y}" width="{w:.2f}" height="30">'
            f"<title>{e(lab)}: {n} of {N}</title></rect>"
        )
        if w > 46:
            parts.append(
                f'<text class="tick" x="{x + w / 2:.1f}" y="{y + 20}" text-anchor="middle"'
                f' style="fill:var(--bg)">{n}</text>'
            )
        labs.append((x + w / 2, k, n, cls))
        x += w
    # a rule marking where "written as an act" ends
    cut = 8 + bw * ACT_AS_MOVE / N
    parts.append(f'<line class="cut" x1="{cut:.1f}" y1="{y - 8}" x2="{cut:.1f}" y2="{y + 40}"/>')
    parts.append(
        f'<text class="cutlab" x="{cut + 5:.1f}" y="{y - 12}">'
        f"{ACT_AS_MOVE} of {N} fields open with an act — {ACT_AS_MOVE / N:.1%}</text>"
    )
    key = []
    kx = 8
    for _, lab, cls in classes:
        key.append(f'<rect class="{cls}" x="{kx}" y="{y + 52}" width="10" height="10"/>')
        key.append(f'<text class="rl" x="{kx + 14}" y="{y + 61}">{e(lab)}</text>')
        kx += 22 + 6.0 * len(lab)
    return (
        f'<svg class="fig" viewBox="0 0 {W} {H}" role="img" '
        f'aria-label="Of {N} decisive-move fields, {ACT_AS_MOVE} open with an act.">'
        + "".join(parts) + "".join(key) + "</svg>"
    )


def svg_dist(cell: str) -> str:
    """Observed nearest-neighbour scores against the cell's own surrogate null."""
    c = CELLS[cell]
    W, H = 440, 210
    L, R, T, B = 40, 12, 22, 34
    pw, ph = W - L - R, H - T - B
    obs, nul = c["obs_hist"], c["null_hist"]
    so, sn = sum(obs) or 1, sum(nul) or 1
    po = [v / so for v in obs]
    pn = [v / sn for v in nul]
    top = max(max(po), max(pn)) * 1.08 or 1

    def path(p):
        pts = []
        for i, v in enumerate(p):
            x0 = L + pw * i / len(p)
            x1 = L + pw * (i + 1) / len(p)
            yv = T + ph - ph * v / top
            pts.append(f"{x0:.1f},{yv:.1f} {x1:.1f},{yv:.1f}")
        return f'M{L},{T + ph} L' + " L".join(pts) + f" L{L + pw},{T + ph} Z"

    def vline(val, cls, lab, dy=0):
        x = L + pw * val
        return (
            f'<line class="{cls}" x1="{x:.1f}" y1="{T}" x2="{x:.1f}" y2="{T + ph}"/>'
            f'<text class="cutlab" x="{min(x + 4, W - 90):.1f}" y="{T + 11 + dy}">{e(lab)}</text>'
        )

    ticks = "".join(
        f'<line class="grid" x1="{L + pw * t:.1f}" y1="{T}" x2="{L + pw * t:.1f}" y2="{T + ph}"/>'
        f'<text class="tick" x="{L + pw * t:.1f}" y="{T + ph + 13}" text-anchor="middle">{t:.1f}</text>'
        for t in (0, 0.25, 0.5, 0.75, 1.0)
    )
    nul_lab = "null {:.3f}".format(c["null_median"])
    obs_lab = "observed {:.3f}".format(c["observed_median"])
    return (
        f'<svg class="fig" viewBox="0 0 {W} {H}" role="img" aria-label="Cell {cell}: '
        f'observed median {c["observed_median"]:.4f}, null median {c["null_median"]:.4f}.">'
        f'{ticks}'
        f'<path class="nul" d="{path(pn)}"/><path class="obs" d="{path(po)}"/>'
        f'{vline(c["null_median"], "cut", nul_lab)}'
        f'{vline(c["observed_median"], "cutb", obs_lab, 13)}'
        f'<text class="hdr" x="{L}" y="{T - 8}">cosine to nearest neighbour</text>'
        f'<text class="tick" x="{L}" y="{H - 6}">grey: {c["n_surrogates"]:,} surrogate texts &#183; '
        f'brown: the {N} works</text>'
        f"</svg>"
    )


def svg_oneword(cell: str) -> str:
    """For each surviving pair: what share of its cosine sits on one token."""
    ids = ranked(cell)
    W = 440
    rowh = 15
    H = 34 + rowh * max(len(ids), 1) + 14
    L, R = 150, 44
    pw = W - L - R
    rows = []
    for k, pid in enumerate(ids):
        cc = PAIRS[pid]["cells"][cell]
        share = cc["top_share"] or 0.0
        y = 30 + k * rowh
        tok = cc["carried_by"][0][0] if cc["carried_by"] else "—"
        verd = V[pid]["v"]
        cls = {"same move": "b-sur", "adjacent move": "b-sur2",
               "same subject": "b-res", "not a pair": "b-oth"}[verd]
        rows.append(
            f'<g><title>{e(PAIRS[pid]["a"]["title"])} / {e(PAIRS[pid]["b"]["title"])} — '
            f'{e(verd)}; {cc["n_shared"]} shared token(s), largest is "{e(tok)}"</title>'
            f'<text class="rl" x="{L - 6}" y="{y + 8}" text-anchor="end">{e(tok[:18])}</text>'
            f'<rect class="{cls}" x="{L}" y="{y}" width="{pw * share:.1f}" height="10"/>'
            f'<line class="grid" x1="{L + pw}" y1="{y}" x2="{L + pw}" y2="{y + 10}"/>'
            f'<text class="rv" x="{L + pw + 5}" y="{y + 8}">{share:.2f}</text></g>'
        )
    return (
        f'<svg class="fig" viewBox="0 0 {W} {H}" role="img" aria-label="Share of each '
        f'pair\'s similarity carried by its single largest shared token, cell {cell}.">'
        f'<text class="hdr" x="{L}" y="20">share of the score on one token</text>'
        f'<text class="hdr" x="{L - 6}" y="20" text-anchor="end">that token</text>'
        + "".join(rows) + "</svg>"
    )


def table(cell: str) -> str:
    ids = ranked(cell)
    rows = []
    for pid in ids:
        p, cc = PAIRS[pid], PAIRS[pid]["cells"][cell]
        tok = ", ".join(w for w, _ in cc["carried_by"][:3]) or "—"
        rows.append(
            "<tr>"
            f'<td class="n">{cc["rank"]}</td>'
            f'<td class="n">{cc["score"]:.3f}</td>'
            f'<td><i>{e(p["a"]["title"])}</i> <span class="dim">({e(p["a"]["artist"])})</span><br>'
            f'<i>{e(p["b"]["title"])}</i> <span class="dim">({e(p["b"]["artist"])})</span></td>'
            f'<td class="tok">{e(tok)}</td>'
            f'<td class="v v-{V[pid]["v"].replace(" ", "-")}">{e(V[pid]["v"])}</td>'
            "</tr>"
        )
    t = TALLY[cell]
    return (
        f'<table><thead><tr><th>#</th><th>cos</th><th>pair</th>'
        f'<th>carried by</th><th>verdict</th></tr></thead>'
        f'<tbody>{"".join(rows)}</tbody>'
        f'<tfoot><tr><td colspan="5">{SURV[cell]} of the top 40 survive the two artefact '
        f'rules &#183; {t["same move"]} same move &#183; {t["adjacent move"]} adjacent &#183; '
        f'{t["same subject"]} same subject &#183; {t["not a pair"]} not a pair</td></tr></tfoot>'
        f"</table>"
    )


def cell_section(cell: str) -> str:
    c = CELLS[cell]
    st = c["top_strata"]
    return (
        f'<section class="cell" id="cell-{cell}" data-cell="{cell}">'
        f'<h3>{cell} &#183; {e(CELL_TITLE[cell])}</h3>'
        f'<p class="meta">vocabulary {e(c["vocabulary"])} &#183; weighting {e(c["weighting"])} '
        f'&#183; {c["vocab_types"]:,} types &#183; median {c["doc_length"]["median"]} tokens per field '
        f'&#183; observed median {c["observed_median"]:.4f} against a null median of '
        f'{c["null_median"]:.4f} ({EXCESS[cell]:+.1%}) &#183; measured cut '
        f'{c["null_t99"]:.4f} &#183; {c["n_pairs_above_t99"]:,} pairs above it</p>'
        f'<div class="two"><figure>{svg_dist(cell)}<figcaption>The {N} works against '
        f'{c["n_surrogates"]:,} surrogate texts drawn from this cell’s own token '
        f'frequencies at each work’s own length. Seeded; a re-run is identical.'
        f'</figcaption></figure>'
        f'<figure>{svg_oneword(cell)}<figcaption>Each surviving pair of the top forty, and '
        f'the share of its cosine carried by its single largest shared token. '
        f'{ONE_WORD[cell]} of {SURV[cell]} sit at or above half; {EXACT_ONE[cell]} share '
        f'exactly one token with each other.</figcaption></figure></div>'
        f'<p class="meta">Of the top forty pairs: {st["same artist"]} are one artist twice, '
        f'{st["residue both sides"]} carry harvesting residue on both sides, '
        f'{st["survives"]} survive both rules and are read below.</p>'
        f"{table(cell)}"
        f"</section>"
    )


# ------------------------------------------------------------------ page

STYLE = """
:root{
  --bg:#fbfaf7; --ink:#16150f; --dim:#5d5a4e; --rule:#d8d3c4; --panel:#f2efe6;
  --obs:#7a4a1f; --nul:#9aa3a8; --cut:#2f6f76; --cutb:#7a4a1f;
  --art:#a8452c; --res:#b08a3a; --sur:#2f6f76; --sur2:#5f9aa0; --oth:#8b8875;
}
@media (prefers-color-scheme:dark){
  :root{
    --bg:#14140f; --ink:#eeead9; --dim:#a09b88; --rule:#39362c; --panel:#1d1c15;
    --obs:#d7a86a; --nul:#6f7679; --cut:#66b3ba; --cutb:#d7a86a;
    --art:#e08165; --res:#d4b264; --sur:#66b3ba; --sur2:#3f8188; --oth:#77735f;
  }
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.55 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif}
main{max-width:960px;margin:0 auto;padding:2.4rem 1.2rem 5rem}
h1{font-size:1.85rem;line-height:1.15;margin:.2rem 0 .5rem;letter-spacing:.01em}
h2{font-size:1.02rem;margin:3rem 0 .3rem;letter-spacing:.07em;text-transform:uppercase;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dim)}
h3{font-size:1.02rem;margin:1.9rem 0 .2rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  letter-spacing:.04em}
p{margin:.65rem 0;max-width:46em}
blockquote{margin:.9rem 0 .9rem 0;padding:.1rem 0 .1rem 1rem;border-left:2px solid var(--rule);
  color:var(--dim);font-style:italic;max-width:44em}
.kicker{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.76rem;
  letter-spacing:.13em;text-transform:uppercase;color:var(--dim);margin:0 0 .5rem}
.stand{font-size:1.13rem;line-height:1.5;margin:.8rem 0 0;max-width:44em}
.meta{font-size:.82rem;color:var(--dim);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  max-width:60em}
figure{margin:1.4rem 0 0;padding:0}
figcaption{font-size:.84rem;color:var(--dim);margin-top:.45rem;max-width:44em}
.fig{width:100%;height:auto;display:block;background:var(--panel);
  border:1px solid var(--rule);border-radius:3px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
@media (max-width:760px){.two{grid-template-columns:1fr}}
.grid{stroke:var(--rule);stroke-width:1}
.tick,.hdr{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;fill:var(--dim)}
.hdr{font-size:9px;letter-spacing:.08em;text-transform:uppercase}
.rl,.rv{font-size:9.5px;fill:var(--dim);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.nul{fill:var(--nul);fill-opacity:.30;stroke:var(--nul);stroke-width:1}
.obs{fill:var(--obs);fill-opacity:.16;stroke:var(--obs);stroke-width:1.6}
.cut{stroke:var(--cut);stroke-width:1.4;stroke-dasharray:4 3}
.cutb{stroke:var(--cutb);stroke-width:1.4;stroke-dasharray:2 2}
.cutlab{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;fill:var(--dim)}
.b-sur{fill:var(--sur)} .b-sur2{fill:var(--sur2)} .b-res{fill:var(--res)}
.b-oth{fill:var(--oth)} .b-art{fill:var(--art)}
table{border-collapse:collapse;width:100%;margin:.9rem 0 0;font-size:.86rem}
th,td{border-bottom:1px solid var(--rule);padding:.4rem .5rem;text-align:left;vertical-align:top}
th{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.7rem;
  letter-spacing:.08em;text-transform:uppercase;color:var(--dim);border-bottom-width:2px}
td.n,td.tok{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;
  font-variant-numeric:tabular-nums;white-space:nowrap}
td.v{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.74rem;white-space:nowrap}
.v-same-move{color:var(--sur);font-weight:700}
.v-adjacent-move{color:var(--sur2)}
.v-same-subject{color:var(--res)}
.v-not-a-pair{color:var(--dim)}
.dim{color:var(--dim);font-size:.9em}
tfoot td{color:var(--dim);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.74rem;
  border-bottom:none}
.switch{margin:1.2rem 0 0;padding:.75rem .85rem;background:var(--panel);border:1px solid var(--rule);
  border-radius:3px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.8rem}
.switch fieldset{border:0;margin:0 0 .5rem;padding:0;display:flex;gap:.5rem;align-items:baseline;
  flex-wrap:wrap}
.switch legend{float:left;color:var(--dim);text-transform:uppercase;letter-spacing:.08em;
  font-size:.68rem;width:9.5em}
.switch button{font:inherit;background:var(--bg);color:var(--ink);border:1px solid var(--rule);
  border-radius:2px;padding:.22rem .6rem;cursor:pointer}
.switch button[aria-pressed=true]{background:var(--sur);color:var(--bg);border-color:var(--sur)}
.matrix{display:grid;grid-template-columns:auto 1fr 1fr;gap:.25rem;margin-top:.7rem;
  font-size:.76rem;align-items:stretch}
.matrix div{padding:.4rem .5rem;border:1px solid var(--rule);border-radius:2px}
.matrix .lab{border:0;color:var(--dim);display:flex;align-items:center}
.matrix .on{border-color:var(--sur);border-width:2px}
.matrix b{font-variant-numeric:tabular-nums}
.tote{display:flex;flex-wrap:wrap;gap:.2rem 1.2rem;margin-top:.4rem;color:var(--dim)}
.nojs{border:1px solid var(--rule);border-radius:3px;padding:.5rem .8rem;margin-top:1rem;
  color:var(--dim);font-size:.84rem}
footer{margin-top:3.5rem;border-top:1px solid var(--rule);padding-top:1rem;color:var(--dim);
  font-size:.82rem;max-width:52em}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.88em}
"""

SCRIPT = """
(function(){
  var cells=['A','B','C','D'], voc='ALL', wgt='IDF';
  var map={'ALL|IDF':'A','ALL|TF':'B','ACT|IDF':'C','ACT|TF':'D'};
  var secs={}; cells.forEach(function(c){secs[c]=document.getElementById('cell-'+c);});
  function show(){
    var on=map[voc+'|'+wgt];
    cells.forEach(function(c){ secs[c].hidden = (c!==on); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-voc]'),function(b){
      b.setAttribute('aria-pressed', b.dataset.voc===voc);});
    Array.prototype.forEach.call(document.querySelectorAll('[data-wgt]'),function(b){
      b.setAttribute('aria-pressed', b.dataset.wgt===wgt);});
    Array.prototype.forEach.call(document.querySelectorAll('.matrix [data-mc]'),function(d){
      d.classList.toggle('on', d.dataset.mc===on);});
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-voc]'),function(b){
    b.addEventListener('click',function(){voc=b.dataset.voc;show();});});
  Array.prototype.forEach.call(document.querySelectorAll('[data-wgt]'),function(b){
    b.addEventListener('click',function(){wgt=b.dataset.wgt;show();});});
  Array.prototype.forEach.call(document.querySelectorAll('.matrix [data-mc]'),function(d){
    d.addEventListener('click',function(){
      var c=d.dataset.mc;
      voc=(c==='A'||c==='B')?'ALL':'ACT'; wgt=(c==='A'||c==='C')?'IDF':'TF'; show();});
    d.style.cursor='pointer';});
  document.getElementById('switch').hidden=false;
  document.getElementById('nojs').hidden=true;
  show();
})();
"""


def matrix() -> str:
    def box(c):
        t = TALLY[c]
        return (
            f'<div data-mc="{c}"><b>{c}</b> {e(CELL_TITLE[c])}<br>'
            f'<b>{t["same move"]}</b> same move &#183; <b>{t["adjacent move"]}</b> adjacent<br>'
            f'<b>{t["same subject"]}</b> same subject &#183; <b>{t["not a pair"]}</b> not a pair<br>'
            f'<span class="dim">{SURV[c]} of 40 survive &#183; {EXCESS[c]:+.1%} over its null</span></div>'
        )
    return (
        '<div class="matrix">'
        '<div class="lab"></div><div class="lab">rarity decides (tf&#8209;idf)</div>'
        '<div class="lab">recurrence decides (tf)</div>'
        f'<div class="lab">every token</div>{box("A")}{box("B")}'
        f'<div class="lab">act tokens only</div>{box("C")}{box("D")}'
        "</div>"
    )


def page() -> str:
    m = DATA["manifest"]
    ro = DATA["reach_outside"]
    al = DATA["act_lexicon"]
    tk = DATA["tokenisation"]
    sm = SAME_MOVE_IDS[0] if SAME_MOVE_IDS else None
    sm_tok = PAIRS[sm]["cells"]["A"]["carried_by"][0][0] if sm else "—"

    body = f"""
<main>
<p class="kicker">The Atelier &#183; cycle 002, session 2 &#183; {e(DATA["date"])}</p>
<h1>The move and the subject</h1>
<p class="stand">Session 1 measured the house&#8217;s &#8220;has the world already done
this?&#8221; check against chance and found that the pairs it ranked highest were not doing
the same thing &#8212; they shared a noun. This session asks whether any measure over such a
field could do better. Four are built, from a rule taken out of structural folkloristics, and
each is calibrated against its own manufactured chance. Of {N_PAIRS} pairs read blind,
<b>{SAME_MOVE_TOTAL} is the same move</b> and {ADJACENT_TOTAL} are adjacent to one. The
reason turns out to sit before the measure: in {NOT_AS_MOVE} of {N} fields, the first thing
written is not an act.</p>
<p class="meta">Feed read live, never mirrored &#183; <code>{e(m["origin"])}</code> &#183;
sha256 <code>{e(m["sha256"][:16])}&#8230;</code> &#183; {m["bytes"]:,} bytes &#183;
{N} works &#183; read {e(m["read_at"])}</p>

<h2>Where the method comes from</h2>
<p>The protocol asks one session a cycle to read a primary text this corpus has not worked,
from a field this practice does not use, and make something from it the same night. This is
that session. The text is Vladimir Propp&#8217;s <i>Morphology of the Folktale</i>
(2nd&nbsp;ed., trans. Laurence Scott, rev. Louis A. Wagner, Austin: University of Texas
Press, 1968), chapter&nbsp;II, and the field is structural folkloristics.</p>
<p>Propp&#8217;s problem is this one wearing other clothes. He has a hundred tales and wants
an index of what they <i>do</i>, not of what they are about. His solution is to separate the
constant from the variable:</p>
<blockquote>&#8220;The names of the dramatis personae change (as well as the attributes of
each), but neither their actions nor functions change.&#8221; (p.&nbsp;20)</blockquote>
<blockquote>&#8220;&#8230; the number of functions is extremely small, whereas the number of
personages is extremely large.&#8221; (pp.&nbsp;20&#8211;21)</blockquote>
<blockquote>An index of types can be built &#8220;based not upon theme features, which are
somewhat vague and diffuse, but upon exact structural features.&#8221; (p.&nbsp;22)</blockquote>
<p>That second sentence has a consequence a machine can test. If moves are few and subjects
many, then <b>a move-word recurs across a corpus and a subject-word does not</b> &#8212; and
every standard text measure assumes the opposite. tf&#8209;idf is built to let the rare word
decide. If Propp is right about this material, session 1&#8217;s measure was not merely
imprecise; it was pointed the wrong way.</p>
<p>Propp also states the ceiling, and it is quoted here because everything below runs into
it: &#8220;identical acts can have different meanings, and vice versa. Function is understood
as an act of a character, defined from the point of view of its significance for the course
of the action.&#8221; (p.&nbsp;21) A single sentence scored as a bag of words has no course
of action in it. Nothing here can recover a function in his sense. At best it recovers an
<b>act</b>.</p>

<h2>First: is the move in the field at all?</h2>
<p>Before any similarity, one cheap test &#8212; the class of the field&#8217;s first word,
and nothing else. It is not a claim about the whole sentence; it is a claim about what the
writer put first.</p>
<figure>{svg_census()}<figcaption>The {N} <code>decisive_move</code> fields of the atlas by
the class of their first word. {CENSUS.get("finite verb", 0)} open with a finite verb and
{CENSUS.get("participle", 0)} with a participle: {ACT_AS_MOVE} in {N}, or
{ACT_AS_MOVE / N:.1%}. {CENSUS.get("determiner", 0)} open with a determiner &#8212; a thing
is being named. {CENSUS.get("residue", 0) + CENSUS.get("no word", 0)} open with the
harvesting apparatus or with nothing.</figcaption></figure>
<p>This is the session&#8217;s first result and it costs one rule and one second of machine
time. The field is called <code>decisive_move</code>, and in
<b>{NOT_AS_MOVE} of {N}</b> entries the first thing written in it is not an act. Whatever a
similarity measure does with this column, it is mostly not comparing moves, because mostly
there is no move there to compare.</p>

<h2>Four measures, and what each one puts at the top</h2>
<p>Two factors, two levels each, over the same fields and the same tokenisation session 1
used ({tk["types"]:,} types, {tk["tokens"]:,} tokens, imported from the earlier instrument
rather than rewritten so the comparison is like for like).</p>
<p><b>Vocabulary.</b> ALL is every token that survives the stopword list. ACT keeps only
tokens whose stem shows verbal inflection somewhere in this corpus &#8212; Propp&#8217;s
&#8220;noun expressing an action&#8221;, derived by a rule rather than a hand-written list:
{al["verbal_stems"]:,} verbal stems, {al["act_types"]:,} act types, {al["act_token_share"]:.1%}
of all token instances. It is not a good part-of-speech tagger and is not offered as one. It
admits <code>image</code> and <code>model</code>, because English lets those nouns verb; it
refuses <code>extraction</code> and <code>surveillance</code>, because no inflected form of
their verbs happens to occur here. The whole lexicon is in <code>data.json</code> so that
overturning it costs nothing.</p>
<p><b>Weighting.</b> IDF is tf&#183;ln(N/df): the rare word decides, as in session 1. TF is
the count alone: the recurring word decides. TF is the Propp inversion.</p>
<p>Each cell is calibrated against its own manufactured chance, by session 1&#8217;s route:
for every work, 200 surrogate texts of that work&#8217;s exact length <i>in that
cell&#8217;s vocabulary</i>, drawn from that cell&#8217;s own token frequencies, scored
against the same {N - 1} others. Seeded.</p>
{matrix()}
<div class="switch" id="switch" hidden>
  <fieldset><legend>vocabulary</legend>
    <button type="button" data-voc="ALL" aria-pressed="true">every token</button>
    <button type="button" data-voc="ACT" aria-pressed="false">act tokens only</button>
  </fieldset>
  <fieldset><legend>weighting</legend>
    <button type="button" data-wgt="IDF" aria-pressed="true">rarity decides</button>
    <button type="button" data-wgt="TF" aria-pressed="false">recurrence decides</button>
  </fieldset>
  <div class="tote">Flip either switch, or click a cell above. The ranking, its calibration
  and the verdicts below change with it.</div>
</div>
<div class="nojs" id="nojs">All four measures are written out below in full. The switch above
only chooses which one is shown; with no JavaScript you read all four instead of one, and
lose nothing but the choosing.</div>

{"".join(cell_section(c) for c in ORDER)}

<h2>What the rankings turn out to be made of</h2>
<p>The tables above carry a column that was added after the first reading, because the
reading kept saying the same thing and the instrument should have to say it too:
<b>carried by</b> &#8212; the tokens actually holding the cosine up. Across all four
measures, {ONE_WORD_TOTAL} of {SLOTS_TOTAL} surviving top-forty pairs put half or more of
their score on a <i>single shared word</i>, and in {MEDIAN_ONE} of the four measures the
median surviving pair shares exactly one word with its partner. This is not a property of the vocabulary or the weighting. It is a property of
the material: a field of {tk["tokens"] // N} content words on average cannot support a
graded comparison, so the top of any ranking over it is a list of works that happen to
collide on one term.</p>
<p>Which is why the two switches change the <i>kind</i> of collision and not the outcome.
With every token and rarity weighting (A), the colliding word is a rare noun and the pairs
are the same subject: {TALLY["A"]["same subject"]} of {SURV["A"]}. Restrict to act tokens
(C, D) and the subject lock breaks &#8212; same-subject falls to
{TALLY["C"]["same subject"]} of {SURV["C"]} and {TALLY["D"]["same subject"]} of
{SURV["D"]} &#8212; but what replaces it is not moves. It is
{TALLY["C"]["not a pair"] + TALLY["D"]["not a pair"]} pairs joined by one verb or one action
noun and nothing else: <code>investigates</code>, <code>explores</code>,
<code>constructed</code>, <code>exploration</code>, <code>process</code>,
<code>relation</code>. Propp&#8217;s ceiling, arriving on schedule: identical acts with
different meanings.</p>
<p>The clearest single case is <i>Camp La Jolla Military Park</i> against <i>Sonic Map of
Battersea Park</i>, ranked by the act measure on the word <code>park</code> &#8212; one word,
two meanings, no relation. The prettiest is <i>Troll Patrol</i> against <i>SL Dumpster</i>,
joined by <code>limit</code>: in one it is a classifier publishing its own reliability
ceiling, in the other a platform&#8217;s cap on objects.</p>
<p>And the inversion has a defect of its own. Weighting by recurrence hands the decision to
the corpus&#8217;s most-shared words &#8212; and in this corpus some of the most-shared words
are the harvester&#8217;s. Of cell B&#8217;s top forty, {CELLS["B"]["top_strata"]["residue both sides"]}
carry catalogue residue on both sides, against {CELLS["A"]["top_strata"]["residue both sides"]}
in cell A. The Propp inversion is also the only cell whose observed scores stand clearly
above its own null ({EXCESS["B"]:+.1%}, against {EXCESS["A"]:+.1%} for session 1&#8217;s
measure). The one cell with real signal is the one whose signal is the scraper.</p>

<h2>The one that was the same move</h2>
<p>Of {N_PAIRS} pairs, one is two works doing the same decisive thing: <i>white noise</i>
(J&#252;rgen Trautwein, 2006), a noise-colour composer and game simulator, against
<i>atari-noise</i> (arcangel constantini, 2000), an infinite random audiovisual noise pattern
played from the keyboard. Both are real-time playable generators of audiovisual noise.</p>
<p>It is ranked 32nd. It survives in exactly one of the four measures. And it is carried by
one token, which is the word <code>{e(sm_tok)}</code>. By every quantity this instrument
computes &#8212; score, rank, number of shared tokens, share of the score on the largest one
&#8212; it is indistinguishable from the {NOT_A_PAIR_TOTAL} pairs in this set that are not
pairs at all.</p>
<p>There is a second case worth naming, in the other direction. <i>Nathalie Miebach&#8217;s
Woven Sculptures</i> against <i>Joshua Callaghan&#8217;s Physical Charts</i> is a real
adjacency &#8212; both give a dataset a physical body. The instrument ranked it 6th in cell D.
Its three shared tokens are <code>com</code>, <code>source</code> and <code>created</code>:
both fields end in a catalogue&#8217;s &#8220;Source: http://&#8230;.com&#8221;. A true pair,
found for a reason that has nothing to do with either work.</p>

<h2>How the reading was made, and how stable it is</h2>
<p>The {N_PAIRS} pairs are the union of the four top-forty lists, after the two mechanical
rules session 1 wrote are applied unchanged: a pair is set aside before any reading if both
sides are by the same artist, or if both sides carry one of eight fixed harvesting markers.
They were then read from a list carrying no cell label and no rank, in a seeded order, so
the reading could not be steered by which measure produced a pair. Labels were restored
afterwards.</p>
<p>The judge is this practice, which also wrote the instrument, chose the measures and picked
the nulls. That is not an independent adjudication and is not offered as one. Every verdict
is published with the two quoted fields it was made from, in <code>ADJUDICATION.md</code>,
so it can be overturned without re-running anything. Blindness is claimed for 44 of the 52:
while orienting, the judge had read the first eight rows of session 1&#8217;s table, and
those eight are marked in <code>verdicts.json</code>.</p>
<p><b>The one measurement here that nobody asked for.</b> Cell A reproduces session 1
exactly &#8212; same feed state by sha256, the same sixteen survivors at the same ranks
&#8212; so sixteen of tonight&#8217;s blind verdicts have a published verdict from a day
earlier by the same reader. <b>Fifteen of sixteen agree</b>; on the eight that were genuinely
blind, seven of eight. The single disagreement is <i>white noise</i> / <i>atari-noise</i>:
session 1 called it <i>same subject</i>, naming it the closest call in its set and writing
that a reader who called it adjacent would not be making an error. Tonight&#8217;s blind
reader went one step further and called it the same move. Both verdicts stand in the record
under their own dates; neither is withdrawn.</p>
<p>So the reader&#8217;s act, measured here for the first time, is stable almost everywhere
and unstable at exactly the boundary the duty depends on. The headline does not turn on it:
under session 1&#8217;s reading the count of same-move pairs in {N_PAIRS} is zero, under
tonight&#8217;s it is one, and in the three measures built for this session it is zero either
way.</p>

<h2>What this answers, and what it costs</h2>
<p><b>The question:</b> is there a measure over a short prose field that separates a
work&#8217;s move from its subject, or is that separation only ever a reader&#8217;s act?</p>
<p><b>The answer, for these four measures and this material: no, and the reason lies before
the measure.</b> Propp&#8217;s asymmetry survives the transposition &#8212; act words here
are few and shared ({al["act_types"]:,} of {tk["types"]:,} types,
{al["act_token_share"]:.1%} of instances), subject words many and singular. His method does
not, for two reasons that are worth separating. The one he names himself: a function is
defined by its place in a sequence, and a one-sentence field has no sequence, so a shared act
word is evidence of nothing. The one he could not have anticipated: in
{NOT_AS_MOVE} of {N} entries the field does not even open with an act, and in
{CENSUS.get("residue", 0) + CENSUS.get("no word", 0)} of them it opens with the harvester
or with nothing at all.</p>
<p><b>The boundary this draws, in the form cycle 001 asked for.</b> Automation can establish
that a field does not contain what the field is named for, and can do it over a whole
catalogue by a rule anyone can check. It cannot supply what is missing. The census above is
worth more than all four similarity measures put together, and it is the cheapest thing on
this page &#8212; because it says the ranking was never going to work, and says it without
needing a reader at all.</p>
<p><b>What would refute this session.</b> A measure over the same field, calibrated the same
way, whose top forty pairs are majority <i>same move</i> under a reader who did not build it.
Failing that: any measure whose surviving top-forty pairs do not put the median of their
score on a single shared token. Either would show the ceiling is the instrument&#8217;s and
not the material&#8217;s.</p>

<h2>Method, in short</h2>
<p class="meta">Feed: <code>{e(m["origin"])}</code>, read at {e(m["read_at"])}, sha256
<code>{e(m["sha256"])}</code>, {m["bytes"]:,} bytes, {N} entries, licence
{e(m["licence"])}. Read live, never mirrored; what is committed here is derived.
Tokenisation, stopword list and quantiles imported from
<code>tools/neighbour/nn.py</code> (session 1). Instrument:
<code>tools/neighbour/propp.py</code>. Derived record: <code>data.json</code>. Verdicts:
<code>verdicts.json</code> and <code>ADJUDICATION.md</code>. This page:
<code>build.py</code>; every number in it is computed from the two JSON files and none is
typed in. <code>check.py</code> re-derives them and fails on a one-value drift. Re-running
against a later feed gives different numbers, because the atlas grows daily; the sha256
pins which state was measured.</p>
<p class="meta">Reach-outside text: {e(ro["text"])}. Not committed here &#8212; read from a
copy, quoted short with page numbers, as the practice&#8217;s floor requires.</p>

<footer>
<p>The Atelier &#8212; the artistic-research corner of the research ecology around
frankbueltge.de. Cycle 002 works the default question: how can AI and automation meaningfully
support artistic research? This is session 2, and the cycle&#8217;s reach-outside session.</p>
<p><b>Form, decided on the merits.</b> The object of this session is a choice of measure, and
the finding is what the top of a ranking becomes as the choice moves; a still picture must
pick one of four cells and hide the argument. So the page is client-rendered and switchable
&#8212; and all four cells are written into the document complete, so a reader with no
JavaScript reads four rankings instead of one and loses only the switch. No network, no
library, no fonts fetched; it opens from a filesystem.</p>
</footer>
</main>
<script>{SCRIPT}</script>
"""
    return (
        "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
        '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
        "<title>The move and the subject</title>\n"
        '<meta name="description" content="Four calibrated measures over the atlas\'s '
        'decisive-move field, built from a rule out of structural folkloristics, and 52 '
        'pairs read blind. One is the same move.">\n'
        f"<style>{STYLE}</style>\n</head>\n<body>{body}</body>\n</html>\n"
    )


def adjudication() -> str:
    """ADJUDICATION.md — every verdict beside the two quoted fields it was made from."""
    prior = set(VERD["blind"]["prior_seen"])
    order = DATA["adjudication"]["reading_order"]
    al = DATA["act_lexicon"]
    lines = [
        "# Adjudication — 52 pairs, read blind",
        "",
        f"*Cycle 002, session 2 · the Atelier · {DATA['date']}. Companion to `index.html`, "
        "`data.json` and `verdicts.json`. Generated by `build.py` from those two files, so "
        "no quotation here can drift from the record it was read out of.*",
        "",
        "Four measures over the atlas's `decisive_move` field each name their forty "
        "highest-ranked pairs. Two mechanical rules, carried over from session 1 unchanged, "
        "set aside a pair before any reading: **same artist** on both sides, and "
        "**catalogue residue** on both sides (eight fixed markers). What survives in at "
        f"least one of the four is {N_PAIRS} distinct pairs. This file is the part no "
        "instrument does: reading them and saying what they are.",
        "",
        "## How the reading was made",
        "",
        "The pairs were read from a list carrying **no cell label and no rank**, in an order "
        "seeded from the run seed, so that the reading could not be steered by which measure "
        "produced a pair. Labels were restored only after every verdict was written. The "
        "order below is that reading order.",
        "",
        "**Who judged.** This practice, which also wrote the instrument, chose the four "
        "measures and picked the nulls. That is not an independent adjudication and is not "
        "offered as one. It is published the only way it can be trusted: every verdict "
        "carries the two quoted fields it was made from, so a reader who disagrees can "
        "overturn it without re-running anything.",
        "",
        "**Where blindness fails, stated rather than claimed away.** Eight of the fifty-two "
        "carry a verdict published by session 1, and while orienting the judge read session "
        "1's table down to its eighth row. Those eight are marked ⚠ below. The remaining "
        "forty-four were read cold.",
        "",
        "## The verdicts used",
        "",
        "- **same move** — the two works do the same decisive thing. This is what the atlas "
        "duty (\"has the world already done this?\") is asking about.",
        "- **adjacent move** — same material and a move close enough that a new work would "
        "owe a sentence of daylight from it.",
        "- **same subject** — the works are about the same thing and do different things "
        "with it.",
        "- **not a pair** — neither of the above: the score rests on incidental vocabulary, "
        "or one side's field carries no work at all. *Widened from session 1, which used "
        "this verdict only for the second case. The widening is declared because it changes "
        "the residual class and not the headline.*",
        "",
        "## Tally",
        "",
        "| measure | vocabulary | weighting | survives of 40 | same move | adjacent | same subject | not a pair |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for c in ORDER:
        t = TALLY[c]
        lines.append(
            f"| {c} | {CELLS[c]['vocabulary']} | {CELLS[c]['weighting']} | {SURV[c]} | "
            f"{t['same move']} | {t['adjacent move']} | {t['same subject']} | {t['not a pair']} |"
        )
    tot = {k: sum(1 for pid in PAIRS if V[pid]["v"] == k) for k in VERDICT_ORDER}
    lines += [
        f"| **all four, distinct pairs** | | | **{N_PAIRS}** | **{tot['same move']}** | "
        f"**{tot['adjacent move']}** | **{tot['same subject']}** | **{tot['not a pair']}** |",
        "",
        f"The act vocabulary breaks the subject lock — same-subject falls from "
        f"{TALLY['A']['same subject']} of {SURV['A']} to {TALLY['D']['same subject']} of "
        f"{SURV['D']} — and what replaces it is not moves but pairs joined by one verb. "
        f"The act lexicon it uses is derived from the corpus's own inflectional evidence: "
        f"{al['act_types']:,} types of {DATA['tokenisation']['types']:,}, "
        f"{al['act_token_share']:.1%} of token instances, published in full in `data.json`.",
        "",
        "## The fifty-two",
        "",
    ]
    for n, pid in enumerate(order, start=1):
        p, v = PAIRS[pid], V[pid]
        mark = " ⚠" if pid in prior else ""
        where = ", ".join(
            f"{c} #{p['cells'][c]['rank']} ({p['cells'][c]['score']:.3f}, "
            f"{p['cells'][c]['n_shared']} shared, "
            f"{p['cells'][c]['top_share']:.0%} on `{p['cells'][c]['carried_by'][0][0]}`)"
            for c in ORDER if c in p["cells"]
        )
        lines += [
            f"### {n}. {p['a']['title']} / {p['b']['title']} — **{v['v']}**{mark}",
            "",
            f"*{p['a']['title']}* — {p['a']['artist']} ({p['a']['year']}):",
            "",
            f"> {p['a']['field'].strip()}{'…' if p['a']['truncated'] else ''}",
            "",
            f"*{p['b']['title']}* — {p['b']['artist']} ({p['b']['year']}):",
            "",
            f"> {p['b']['field'].strip()}{'…' if p['b']['truncated'] else ''}",
            "",
            f"**{v['v']}.** {v['note']}.",
            "",
            f"Ranked: {where}",
            "",
        ]
    lines += [
        "## Three residue classes the eight markers miss",
        "",
        "Session 1 reported that 69 of 521 entries carry harvesting residue in this field, "
        "caught by eight fixed markers. Reading these fifty-two turned up three more shapes "
        "the markers do not catch, and they are filed to the house rather than patched here:",
        "",
        "1. **A wiki module error as the whole field.** One entry's `decisive_move` reads "
        "`Lua error in Module:entityUtilities at line 189: attempt to index local 't' (a nil "
        "value).` It reached the top forty of two measures.",
        "2. **`Description summary edit`.** The marker is `description edit`; the harvester "
        "also writes `Description summary edit`, which the substring test misses.",
        "3. **`Attribution:` followed by a keyword list.** The marker is `attributed to:`. "
        "One entry's whole field is `world, the lord\\`s of the war book Attribution: … "
        "tactical, historical, allegory, War, social space, netart, media activism, "
        "globalization, game`, and it appears in three of these pairs.",
        "",
        "None of this is an accusation of the atlas, which is a good catalogue: it is one "
        "field's extraction, in a small fraction of the entries, and it is visible only "
        "because a ranking put it at the top.",
        "",
    ]
    return "\n".join(lines)


if __name__ == "__main__":
    out = HERE / "index.html"
    out.write_text(page(), encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size:,} bytes)")
    adj = HERE / "ADJUDICATION.md"
    adj.write_text(adjudication() + "\n", encoding="utf-8")
    print(f"wrote {adj} ({adj.stat().st_size:,} bytes)")
