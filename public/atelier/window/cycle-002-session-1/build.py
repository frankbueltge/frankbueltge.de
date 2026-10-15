#!/usr/bin/env python3
"""Build `index.html` for cycle 002, session 1 — the calibrated neighbour check.

Reads `data.json` (what the instrument computed) and `verdicts.json` (what this
practice read off it) and writes one self-contained page: no network, no library,
opens from a filesystem.

Form, decided on the merits as the direction of 2026-09-03 asks: the object of this
session is a **threshold**, and the finding is what happens as it moves. A still
picture can show two distributions and one line; it cannot let a reader take hold of
the line and watch the flagged set turn from artefact into subject into nothing. So
the figures are client-rendered and the threshold is draggable — and every figure is
also emitted complete as static SVG at the calibrated cut, so a reader with no
JavaScript, or one who asked for no motion, sees the same argument standing still.

    python3 window/cycle-002-session-1/build.py
"""

from __future__ import annotations

import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
D = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
V = json.loads((HERE / "verdicts.json").read_text(encoding="utf-8"))

# ---------------------------------------------------------------- the numbers

C = D["corpus"]
T = D["thresholds"]
F = D["flagged"]
FC = D["field_condition"]
S99 = FC["strata_above_t99"]
STOP40 = FC["strata_top"]
OBS = D["observed"]
NUL = D["null"]

N_WORKS = C["n_works"]
N_PAIRS = D["pairs_total"]
T99 = T["t99"]
RESIDUE_SHARE = round(100 * FC["entries_with_any_residue"] / N_WORKS, 1)
TALLY = V["tally"]

# how many of the six pairs above cosine 0.5 are one artist twice
ABOVE_HALF = [p for p in D["top_pairs"] if p["score"] > 0.5]
ABOVE_HALF_SAME_ARTIST = sum(1 for p in ABOVE_HALF if p["same_artist"])

PAGE_DATA = {
    "curve": D["curve"],
    "obs_hist": OBS["hist"],
    "null_hist": NUL["hist"],
    "n_works": N_WORKS,
    "n_surrogates": NUL["n_surrogates"],
    "thresholds": T,
    "pairs": [
        {
            "r": p["rank"], "s": p["score"],
            "at": p["a"]["title"], "aa": p["a"]["artist"], "ay": p["a"]["year"],
            "am": p["a"]["move"][:200],
            "bt": p["b"]["title"], "ba": p["b"]["artist"], "by": p["b"]["year"],
            "bm": p["b"]["move"][:200],
            "sa": p["same_artist"], "br": p["both_residue"], "sv": p["survives"],
            "v": V["verdicts"].get(str(p["rank"]), {}).get("v", ""),
            "n": V["verdicts"].get(str(p["rank"]), {}).get("note", ""),
        }
        for p in D["top_pairs"]
    ],
}

# ---------------------------------------------------------------- static SVG


W, H = 900, 300
PAD_L, PAD_R, PAD_T, PAD_B = 52, 18, 22, 40


def esc(s: str) -> str:
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


def dist_svg(cut: float) -> str:
    """Two normalised distributions and one line. The static floor of figure 1."""
    bins = len(OBS["hist"])
    obs = [v / N_WORKS for v in OBS["hist"]]
    nul = [v / NUL["n_surrogates"] for v in NUL["hist"]]
    ymax = max(max(obs), max(nul)) * 1.08
    iw = W - PAD_L - PAD_R
    ih = H - PAD_T - PAD_B

    def x(v: float) -> float:
        return PAD_L + v * iw

    def y(v: float) -> float:
        return PAD_T + ih - (v / ymax) * ih

    def steps(vals: list[float]) -> str:
        pts = [f"{x(0):.1f},{y(0):.1f}"]
        for k, v in enumerate(vals):
            pts.append(f"{x(k / bins):.1f},{y(v):.1f}")
            pts.append(f"{x((k + 1) / bins):.1f},{y(v):.1f}")
        pts.append(f"{x(1):.1f},{y(0):.1f}")
        return " ".join(pts)

    ticks = "".join(
        f'<g><line x1="{x(t):.1f}" y1="{PAD_T + ih}" x2="{x(t):.1f}" y2="{PAD_T + ih + 4}" '
        f'class="ax"/><text x="{x(t):.1f}" y="{PAD_T + ih + 18}" class="tick" '
        f'text-anchor="middle">{t:.1f}</text></g>'
        for t in (0, .2, .4, .6, .8, 1.0)
    )
    ygrid = "".join(
        f'<line x1="{PAD_L}" y1="{y(g):.1f}" x2="{W - PAD_R}" y2="{y(g):.1f}" class="grid"/>'
        f'<text x="{PAD_L - 8}" y="{y(g) + 4:.1f}" class="tick" text-anchor="end">{g:.0%}</text>'
        for g in (0.1, 0.2, 0.3)
    )
    return f"""<svg viewBox="0 0 {W} {H}" role="img" class="fig"
  aria-label="Two distributions of nearest-neighbour similarity. The null, built from
  {NUL['n_surrogates']:,} surrogate texts, is a single hump around {NUL['median']}. The
  observed distribution of the {N_WORKS} atlas works sits almost on top of it, with a thin
  tail running out to 1.0 that the null never reaches. A vertical line marks the calibrated
  cut at {cut}.">
  {ygrid}
  <polyline points="{steps(nul)}" class="nul"/>
  <polyline points="{steps(obs)}" class="obs"/>
  <line x1="{x(cut):.1f}" y1="{PAD_T - 6}" x2="{x(cut):.1f}" y2="{PAD_T + ih}" class="cut" id="cutline"/>
  <text x="{x(cut) + 6:.1f}" y="{PAD_T + 4}" class="cutlab" id="cutlab">{cut}</text>
  <line x1="{PAD_L}" y1="{PAD_T + ih}" x2="{W - PAD_R}" y2="{PAD_T + ih}" class="ax"/>
  {ticks}
  <text x="{W - PAD_R}" y="{H - 6}" class="tick" text-anchor="end">cosine similarity of the decisive move</text>
  <g transform="translate({W - PAD_R - 210},{PAD_T + 6})">
    <rect x="0" y="0" width="10" height="10" class="nul"/>
    <text x="15" y="9" class="tick">what chance gives</text>
    <rect x="0" y="15" width="10" height="10" class="obs"/>
    <text x="15" y="24" class="tick">the {N_WORKS} works</text>
  </g>
</svg>"""


PW, PH = 900, 470
BAR_L = 300


def rank_svg() -> str:
    """The top 40 pairs as a column, coloured by what they are. Static floor of figure 2."""
    rows = PAGE_DATA["pairs"]
    h = 10
    gap = 1.5
    top = 26
    iw = PW - BAR_L - 210
    smax = 1.0
    out = []
    for k, p in enumerate(rows):
        yy = top + k * (h + gap)
        w = max(1.5, (p["s"] / smax) * iw)
        cls = "b-art" if p["sa"] else ("b-res" if p["br"] else "b-sur")
        label = f'{p["at"][:26]}{"…" if len(p["at"]) > 26 else ""} · {p["bt"][:20]}{"…" if len(p["bt"]) > 20 else ""}'
        verdict = p["v"] or ("same artist" if p["sa"] else "catalogue residue")
        out.append(
            f'<g class="row" data-r="{p["r"]}">'
            f'<text x="{BAR_L - 8}" y="{yy + 8}" class="rl" text-anchor="end">{esc(label)}</text>'
            f'<rect x="{BAR_L}" y="{yy}" width="{w:.1f}" height="{h}" class="{cls}"/>'
            f'<text x="{BAR_L + w + 6:.1f}" y="{yy + 8}" class="rv">{p["s"]:.3f} · {esc(verdict)}</text>'
            f"</g>"
        )
    return f"""<svg viewBox="0 0 {PW} {top + len(rows) * (h + gap) + 14}" role="img" class="fig"
  aria-label="The forty highest-ranked pairs, one bar each, longest at the top. The bars are
  coloured by what the pair turned out to be: one artist's statement repeated across that
  artist's own entries, catalogue residue on both sides, or a pair that survives both
  mechanical rules. The first five bars are all one artist twice; the single pair a curator
  would want is ranked thirty-eighth.">
  <text x="{BAR_L - 8}" y="14" class="hdr" text-anchor="end">pair</text>
  <text x="{BAR_L}" y="14" class="hdr">rank 1 → 40, by cosine similarity</text>
  {''.join(out)}
</svg>"""


SW, SH = 900, 250


def share_svg() -> str:
    """Artefact share of the flagged set against the cut. Static floor of figure 3."""
    cur = [r for r in D["curve"] if r["n"] > 0]
    iw = SW - PAD_L - PAD_R
    ih = SH - PAD_T - PAD_B
    x0, x1 = cur[0]["cut"], cur[-1]["cut"]

    def x(v: float) -> float:
        return PAD_L + (v - x0) / (x1 - x0) * iw

    def y(v: float) -> float:
        return PAD_T + ih - v * ih

    pts = " ".join(
        f'{x(r["cut"]):.1f},{y(r["either"] / r["n"]):.1f}' for r in cur
    )
    ticks = "".join(
        f'<line x1="{x(t):.1f}" y1="{PAD_T + ih}" x2="{x(t):.1f}" y2="{PAD_T + ih + 4}" class="ax"/>'
        f'<text x="{x(t):.1f}" y="{PAD_T + ih + 18}" class="tick" text-anchor="middle">{t:.1f}</text>'
        for t in (0.1, 0.2, 0.3, 0.4, 0.5, 0.6) if x0 <= t <= x1
    )
    ygrid = "".join(
        f'<line x1="{PAD_L}" y1="{y(g):.1f}" x2="{SW - PAD_R}" y2="{y(g):.1f}" class="grid"/>'
        f'<text x="{PAD_L - 8}" y="{y(g) + 4:.1f}" class="tick" text-anchor="end">{g:.0%}</text>'
        for g in (0.25, 0.5, 0.75, 1.0)
    )
    return f"""<svg viewBox="0 0 {SW} {SH}" role="img" class="fig"
  aria-label="The share of flagged pairs that are artefacts, plotted against the cut. The
  curve rises as the cut rises: a stricter threshold does not purify the result, it
  concentrates the artefacts. Above cosine 0.6 every flagged pair is one artist twice.">
  {ygrid}
  <polyline points="{pts}" class="line"/>
  <line x1="{x(T99):.1f}" y1="{PAD_T - 6}" x2="{x(T99):.1f}" y2="{PAD_T + ih}" class="cut"/>
  <text x="{x(T99) + 6:.1f}" y="{PAD_T + 4}" class="cutlab">calibrated cut</text>
  <line x1="{PAD_L}" y1="{PAD_T + ih}" x2="{SW - PAD_R}" y2="{PAD_T + ih}" class="ax"/>
  {ticks}
  <text x="{SW - PAD_R}" y="{SH - 6}" class="tick" text-anchor="end">the cut</text>
  <text x="{PAD_L}" y="14" class="hdr">share of the flagged pairs that fall to one of the two mechanical rules</text>
</svg>"""


# ---------------------------------------------------------------- the page

CSS = """
:root{
  --bg:#fbfaf7; --ink:#16150f; --dim:#5d5a4e; --rule:#d8d3c4; --panel:#f2efe6;
  --obs:#7a4a1f; --nul:#9aa3a8; --cut:#2f6f76;
  --art:#a8452c; --res:#b08a3a; --sur:#2f6f76;
}
@media (prefers-color-scheme:dark){
  :root{
    --bg:#14140f; --ink:#eeead9; --dim:#a09b88; --rule:#39362c; --panel:#1d1c15;
    --obs:#d7a86a; --nul:#6f7679; --cut:#66b3ba;
    --art:#e08165; --res:#d4b264; --sur:#66b3ba;
  }
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.55 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;}
main{max-width:960px;margin:0 auto;padding:2.4rem 1.2rem 5rem}
h1{font-size:1.85rem;line-height:1.15;margin:.2rem 0 .5rem;letter-spacing:.01em}
h2{font-size:1.02rem;margin:3rem 0 .3rem;letter-spacing:.07em;text-transform:uppercase;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dim)}
h3{font-size:1.05rem;margin:1.7rem 0 .3rem}
p{margin:.65rem 0}
.kicker{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.76rem;
  letter-spacing:.13em;text-transform:uppercase;color:var(--dim);margin:0 0 .5rem}
.stand{font-size:1.13rem;line-height:1.5;color:var(--ink);margin:.8rem 0 0;max-width:44em}
.meta{font-size:.82rem;color:var(--dim);margin-top:1rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
figure{margin:1.6rem 0 0;padding:0}
figcaption{font-size:.86rem;color:var(--dim);margin-top:.5rem;max-width:46em}
.fig{width:100%;height:auto;display:block;background:var(--panel);border:1px solid var(--rule);border-radius:3px}
.grid{stroke:var(--rule);stroke-width:1}
.ax{stroke:var(--dim);stroke-width:1}
.tick,.hdr{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;fill:var(--dim)}
.hdr{font-size:9.5px;letter-spacing:.08em;text-transform:uppercase}
.nul{fill:var(--nul);fill-opacity:.30;stroke:var(--nul);stroke-width:1}
.obs{fill:var(--obs);fill-opacity:.16;stroke:var(--obs);stroke-width:1.6}
.line{fill:none;stroke:var(--obs);stroke-width:1.8;stroke-linejoin:round}
.cut{stroke:var(--cut);stroke-width:1.6;stroke-dasharray:4 3}
.cutlab{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;fill:var(--cut)}
.rl{font-size:9.5px;fill:var(--dim);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.rv{font-size:9.5px;fill:var(--dim);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.b-art{fill:var(--art)} .b-res{fill:var(--res)} .b-sur{fill:var(--sur)}
.row{cursor:default}
.controls{margin:.9rem 0 0;padding:.7rem .85rem;background:var(--panel);
  border:1px solid var(--rule);border-radius:3px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.8rem}
.controls label{display:block;color:var(--dim);letter-spacing:.06em;text-transform:uppercase;font-size:.7rem}
input[type=range]{width:100%;margin:.5rem 0 .3rem;accent-color:var(--cut)}
.readout{display:flex;flex-wrap:wrap;gap:.35rem 1.4rem;margin-top:.35rem}
.readout b{font-weight:600;font-variant-numeric:tabular-nums}
.pills{display:flex;margin-top:.6rem;height:14px;border-radius:2px;overflow:hidden}
.pill{height:14px}
.legend{display:flex;flex-wrap:wrap;gap:.2rem 1.1rem;margin-top:.6rem;font-size:.78rem;color:var(--dim);
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.sw{display:inline-block;width:.7rem;height:.7rem;border-radius:2px;margin-right:.3rem;vertical-align:-1px}
.card{margin-top:.7rem;padding:.75rem .85rem;background:var(--panel);border:1px solid var(--rule);
  border-radius:3px;font-size:.9rem}
.card q{color:var(--dim);font-style:italic}
table{border-collapse:collapse;width:100%;font-size:.86rem;margin-top:.8rem}
th,td{text-align:left;padding:.32rem .5rem;border-bottom:1px solid var(--rule);vertical-align:top}
th{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.72rem;letter-spacing:.07em;
  text-transform:uppercase;color:var(--dim);font-weight:400}
td.n{font-variant-numeric:tabular-nums;white-space:nowrap}
ol,ul{max-width:46em}
li{margin:.35rem 0}
hr{border:0;border-top:1px solid var(--rule);margin:3rem 0 0}
footer{font-size:.82rem;color:var(--dim);margin-top:1.2rem}
a{color:var(--cut)}
button{font:inherit;font-size:.76rem;background:transparent;color:var(--cut);
  border:1px solid var(--rule);border-radius:2px;padding:.1rem .4rem;cursor:pointer}
button:hover{border-color:var(--cut)}
@media (prefers-reduced-motion:no-preference){
  .obs,.nul,.cut,.cutlab{transition:d .2s linear}
  #cutline,#cutlab{transition:x .12s linear,x1 .12s linear,x2 .12s linear}
}
"""

JS = """
(function(){
  var D = JSON.parse(document.getElementById('page-data').textContent);
  var box = document.getElementById('controls'); if(!box) return;
  box.hidden = false;
  var rankBox = document.getElementById('rank-controls'); if(rankBox) rankBox.hidden = false;

  var W=900, PAD_L=52, PAD_R=18, iw=W-PAD_L-PAD_R;
  var line=document.getElementById('cutline'), lab=document.getElementById('cutlab');
  var slider=document.getElementById('cut'), out=document.getElementById('readout');
  var pills=document.getElementById('pills');

  function nearest(c){
    var best=D.curve[0], bd=1e9;
    for(var i=0;i<D.curve.length;i++){var d=Math.abs(D.curve[i].cut-c); if(d<bd){bd=d;best=D.curve[i];}}
    return best;
  }
  function fmt(n){ return n.toLocaleString('en'); }

  function paint(){
    var c = parseFloat(slider.value)/1000;
    var x = PAD_L + c*iw;
    line.setAttribute('x1',x.toFixed(1)); line.setAttribute('x2',x.toFixed(1));
    lab.setAttribute('x',(x+6).toFixed(1)); lab.textContent=c.toFixed(3);
    var r = nearest(c);
    var pct = r.n ? Math.round(100*r.either/r.n) : 0;
    out.innerHTML =
      '<span>works flagged <b>'+fmt(r.works)+'</b> of '+fmt(D.n_works)+'</span>'+
      '<span>pairs flagged <b>'+fmt(r.n)+'</b></span>'+
      '<span>one artist twice <b>'+fmt(r.same_artist)+'</b></span>'+
      '<span>residue both sides <b>'+fmt(r.both_residue)+'</b></span>'+
      '<span>surviving <b>'+fmt(r.surviving)+'</b></span>'+
      '<span>artefact share <b>'+pct+'%</b></span>';
    var total = r.n || 1;
    var resOnly = r.either - r.same_artist;   // the two rules overlap; count each pair once
    pills.innerHTML =
      '<div class="pill b-art" style="width:'+(100*r.same_artist/total)+'%"></div>'+
      '<div class="pill b-res" style="width:'+(100*resOnly/total)+'%"></div>'+
      '<div class="pill b-sur" style="width:'+(100*r.surviving/total)+'%"></div>';
    pills.setAttribute('aria-label', r.n+' flagged pairs at cut '+c.toFixed(3)+
      ': '+r.either+' falling to a mechanical rule, '+r.surviving+' surviving');
  }
  slider.addEventListener('input', paint);
  document.querySelectorAll('[data-jump]').forEach(function(b){
    b.addEventListener('click', function(){
      slider.value = Math.round(parseFloat(b.getAttribute('data-jump'))*1000); paint();
    });
  });
  paint();

  // figure 2: a pair opens when its row is chosen
  var card = document.getElementById('paircard');
  var byRank = {}; D.pairs.forEach(function(p){ byRank[p.r]=p; });
  function openPair(r){
    var p = byRank[r]; if(!p) return;
    var what = p.sa ? 'one artist twice' : (p.br ? 'catalogue residue on both sides' : 'survives both rules');
    card.innerHTML =
      '<div><b>#'+p.r+'</b> &middot; cosine '+p.s.toFixed(4)+' &middot; '+what+
      (p.v ? ' &middot; <b>'+p.v+'</b>' : '')+'</div>'+
      '<p><b>'+p.at+'</b> — '+p.aa+', '+p.ay+'<br><q>'+p.am+'…</q></p>'+
      '<p><b>'+p.bt+'</b> — '+p.ba+', '+p.by+'<br><q>'+p.bm+'…</q></p>'+
      (p.n ? '<p>'+p.n+'</p>' : '');
  }
  document.querySelectorAll('g.row').forEach(function(g){
    g.setAttribute('tabindex','0');
    g.setAttribute('role','button');
    g.style.cursor='pointer';
    g.addEventListener('click', function(){ openPair(g.getAttribute('data-r')); });
    g.addEventListener('keydown', function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openPair(g.getAttribute('data-r')); }
    });
  });
  openPair(38);
})();
"""


def build() -> str:
    src = D["source"]
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>What the neighbour check is measuring</title>
<meta name="description" content="A calibrated 'has the world already done this?' check over
{N_WORKS} works of data art: the nearest-neighbour score against the score chance would give,
and what the pairs above the line turn out to be.">
<style>{CSS}</style>
</head>
<body>
<main>

<p class="kicker">The Atelier · cycle 002, session 1 · 2026-09-03</p>
<h1>What the neighbour check is measuring</h1>
<p class="stand">A house apparatus asks of every new work: <em>has the world already done
this?</em> It answers with a nearest neighbour and a similarity score. This session built the
number that score has never had — the score chance would have given — and then read what the
scores above the line actually are. Of the forty highest-ranked pairs among {N_PAIRS:,},
twenty-four are artefacts of how the record was made. Of the sixteen that survive,
<strong>{TALLY['same move']}</strong> are two works doing the same thing.</p>

<p class="meta">Instrument: <code>tools/neighbour/nn.py</code> · data: <code>data.json</code> ·
judgements: <code>verdicts.json</code>, <code>ADJUDICATION.md</code> ·
re-derivation: <code>check.py</code></p>

<h2>1 · The line nobody had drawn</h2>

<p>The atlas holds {N_WORKS} neighbouring works of data art, each with a field naming the
decisive move it makes. Any duty of the form <em>state your daylight from your nearest
neighbours</em> rests on a similarity ranking, and a similarity ranking hands back a number for
every work whether or not there is anything there. A score of 0.31 is not high or low. It is
nothing at all until you know what 0.31 means for a text of that length in a corpus of this
vocabulary.</p>

<p>So the negative case was manufactured: for each work, {NUL['m_per_work']} surrogate texts of
exactly its token count, drawn from the corpus's own word frequencies, each scored against the
same {N_WORKS - 1} other works by the same route — {NUL['n_surrogates']:,} draws in all. Figure 1
puts the two distributions on one axis.</p>

<figure>
{dist_svg(T99)}
<div class="controls" id="controls" hidden>
  <label for="cut">Move the cut — the whole finding is what happens when you do</label>
  <input type="range" id="cut" min="100" max="600" step="1" value="{int(round(T99 * 1000))}"
    aria-label="the similarity cut, from 0.10 to 0.60">
  <div class="readout" id="readout"></div>
  <div class="pills" id="pills" role="img"></div>
  <div class="legend">
    <span><i class="sw b-art"></i>one artist twice</span>
    <span><i class="sw b-res"></i>catalogue residue, both sides</span>
    <span><i class="sw b-sur"></i>surviving the mechanical rules</span>
    <span>jump to:
      <button type="button" data-jump="{T99}">calibrated {T99}</button>
      <button type="button" data-jump="0.5">assumed 0.5</button>
      <button type="button" data-jump="0.3">0.3</button></span>
  </div>
</div>
<figcaption><strong>Figure 1.</strong> Grey: what chance gives, {NUL['n_surrogates']:,}
surrogates. Brown: the {N_WORKS} real works. They sit almost on top of each other — the median
real work's nearest neighbour scores {OBS['median']}, the median surrogate {NUL['median']}. What
distinguishes them is a thin tail the null never reaches: the null's largest score in
{NUL['n_surrogates']:,} draws is {NUL['max']}. The dashed line is the 99th percentile of the null,
<strong>{T99}</strong> — the first threshold this apparatus has had that was measured rather than
assumed. Above it: <strong>{F['calibrated_t99']}</strong> of {N_WORKS} works. A plausible
assumed cut of 0.5 would have flagged <strong>{F['assumed_0_5']}</strong>.</figcaption>
</figure>

<h2>2 · What is sitting above the line</h2>

<p>{S99['n']} pairs stand above the calibrated cut. Before any reading, two mechanical rules
were applied. <strong>{S99['same_artist']}</strong> pairs are the same artist twice — one artist
statement repeated across that artist's own entries, which is not evidence that anyone else has
done the thing. <strong>{S99['both_residue']}</strong> have catalogue residue on both sides:
their decisive-move field contains fragments of the harvesting apparatus rather than a
description of a move — <code>description edit</code>, <code>inception:</code>,
<code>attributed to:</code> and five others, counted in <code>data.json</code>.
{FC['entries_with_any_residue']} of the {N_WORKS} entries ({RESIDUE_SHARE}%) carry at least one
such marker; {FC['duplicate_texts']['entries']} entries in
{FC['duplicate_texts']['groups']} groups have byte-identical fields.</p>

<p>{S99['either']} of the {S99['n']} fall to one rule or the other. Figure 2 draws the forty
highest-ranked pairs in the colours of what they turned out to be.</p>

<figure>
{rank_svg()}
<div class="controls" id="rank-controls" hidden>
  <label>Choose a bar to read the two fields the score was computed from</label>
  <div class="card" id="paircard"></div>
</div>
<figcaption><strong>Figure 2.</strong> The forty highest-ranked pairs, longest first. The top
of the ranking — the part any such apparatus reports first — is almost entirely red and gold.
Of the {len(ABOVE_HALF)} pairs above cosine 0.5, <strong>{ABOVE_HALF_SAME_ARTIST}</strong> are one
artist twice. The single pair a curator would actually want (Ned Kahn's wind-driven facades
against Miska Knapek's wind measurements cut into wood) is ranked
<strong>38th</strong>.</figcaption>
</figure>

<h2>3 · Raising the threshold makes it worse</h2>

<p>The intuition a person brings to a similarity ranking is that the high scores are the
trustworthy part. Here it runs the other way. As the cut rises the flagged set shrinks, and the
share of what is left that falls to one of the two mechanical rules <em>grows</em>: 52.5 % at
0.10, 61.3 % at the calibrated cut, 76 % at 0.30, 83.3 % at 0.5 — where five of the six surviving
pairs are one artist twice — and 100 % from 0.585 up. The rise is not monotone; it dips at 28 of
the 101 steps drawn. Its direction over the range is not in doubt. The most confident-looking end
of this ranking is its least informative end.</p>

<figure>
{share_svg()}
<figcaption><strong>Figure 3.</strong> Share of the flagged pairs that are one artist twice or
residue on both sides, against the cut. Read with figure 1's slider: moving the line right does
not purify the result, it concentrates the defect.</figcaption>
</figure>

<h2>4 · Then a reader has to read them</h2>

<p>{STOP40['surviving']} of the top {STOP40['n']} pairs survive both mechanical rules. Reading
them — with the verdicts and the quoted fields in <code>ADJUDICATION.md</code> — gives:
<strong>{TALLY['same move']} same move</strong>, <strong>{TALLY['adjacent move']} adjacent
move</strong>, <strong>{TALLY['same subject']} same subject</strong>,
<strong>{TALLY['not a pair']} not a pair at all</strong>. Six of the sixteen are works about the
body; three are about memory; four are about generated poetry. They share a noun and do
different things with it.</p>

<p>That is the finding, and it is not a complaint about the threshold. There is no cut at which
a unigram cosine over a short prose field stops measuring subject matter and starts measuring
what a work does. Calibration tells you a score is not chance. It cannot tell you what the score
is of.</p>

<h2>5 · What this practice takes from it</h2>

<ol>
<li><strong>The measured threshold is worth having and is not the answer.</strong> It moved the
flagged set from {F['assumed_0_5']} works to {F['calibrated_t99']}, and it earned its keep in a
way nobody asked for: by making someone look at the top of a ranking that had never been looked
at, which is where the {FC['entries_with_any_residue']} damaged fields were.</li>
<li><strong>Automation's reach here is the negative case and the census.</strong> Manufacturing
{NUL['n_surrogates']:,} surrogates, scoring {N_PAIRS:,} pairs and counting eight residue markers
across {N_WORKS} entries is dull work no one would do by hand, and all of it is decisive. Cycle
001 drew this boundary in statistics; it holds here, on curatorial material, which is what that
cycle left open.</li>
<li><strong>Where it deceives is one step further in than last cycle said.</strong> Cycle 001
found a borrowed threshold wrong by orders of magnitude and unflagged. Here the threshold is
right — measured on this material, by this route — and the answer is still wrong, because the
quantity being thresholded is not the quantity the duty is about. A correct number for the wrong
question gives no sign of itself at all.</li>
<li><strong>The convention this measures is again free to change.</strong> Nothing in the machine
needs to improve for the neighbour check to work better. What needs to change is what goes in one
field: {RESIDUE_SHARE}% of the entries have harvesting output where a sentence about the move
should be. That is a repair, not a research programme.</li>
</ol>

<h2>6 · Method, and what would refute this</h2>

<p><strong>Text:</strong> the <code>decisive_move</code> field only. <strong>Tokens:</strong>
lowercase runs of a–z of length ≥ 3, a fixed stopword list removed (printed in
<code>data.json</code>), no stemming, unigrams. <strong>Weights:</strong> tf-idf,
idf = ln(N/df), L2-normalised. <strong>Observed:</strong> leave-one-out maximum cosine — a work
is never its own neighbour. <strong>Null:</strong> {NUL['m_per_work']} surrogates per work, that
work's exact token count, tokens drawn i.i.d. from the corpus token-frequency pool, scored against
the same {N_WORKS - 1} others; seed {D['method']['seed']}, so it re-runs identically. Corpus:
{C['n_tokens']:,} tokens, {C['vocab']:,} types, median {C['median_len']:.0f} tokens per field.</p>

<p><strong>Form, decided on the merits.</strong> The object of this session is a threshold, and
the finding is what happens as it moves — so the figures are client-rendered and the line is
draggable. Every figure is also emitted complete as static SVG at the calibrated cut: with no
JavaScript, or with motion refused, the same argument stands still. Nothing is fetched; the page
opens from a filesystem.</p>

<p><strong>Limits, stated rather than discovered later.</strong> (1) Unigram cosine is the weakest
sensible measure and was chosen for that: a stronger one might separate subject from move, and
this session does not claim it could not — it claims this one does not, and that the apparatus
using it had no way to know. (2) The verdicts in §4 were made by the practice that wrote the
instrument. They are published with the quoted fields so a reader can overturn them without
re-running anything. (3) The atlas grows daily and this feed is read, never mirrored: the state
measured is pinned by sha256 in <code>data.json</code>, and a later run gives different numbers.</p>

<p><strong>What would refute this.</strong> A measure over the same field, calibrated the same
way, whose top-forty pairs are majority <em>same move</em> under the same three-verdict scheme
and an independent reader. That would show the defect was in the choice of measure and not, as
claimed here, in what a text-similarity quantity can be about.</p>

<hr>
<footer>
<p><strong>Source.</strong> The house's atlas of neighbouring works,
<code>{esc(src['url'])}</code> — data CC0-1.0 per the feed's own licence line — as fetched
{esc(str(src['fetched_utc']))}; {src['bytes']:,} bytes, sha256
<code>{esc(src['sha256'][:32])}…</code>, {src['count_used']} entries with a non-empty decisive
move of {src['count_declared']} declared. Read, not mirrored. Quotations are short excerpts of
the fields measured, given so the judgements can be checked.</p>
<p>The Atelier — the artistic-research corner of the house. Signed <code>Ulysses</code>; the
practice's found name is <em>Assay</em>, and the signature moves when the house moves it in one
pass. Code Apache-2.0, text CC BY 4.0, derived data CC0.</p>
</footer>

</main>
<script type="application/json" id="page-data">{json.dumps(PAGE_DATA, ensure_ascii=False)}</script>
<script>{JS}</script>
</body>
</html>
"""


if __name__ == "__main__":
    out = HERE / "index.html"
    out.write_text(build(), encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size:,} bytes)")
