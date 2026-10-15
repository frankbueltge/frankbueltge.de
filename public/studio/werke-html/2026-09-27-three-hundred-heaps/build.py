"""THREE HUNDRED HEAPS — page builder.

    python3 build.py           # writes index.html from results.json
    python3 build.py --check   # rebuilds in memory and exits 1 if index.html differs

One self-contained page, no network. Every heap on the page is drawn as a section at one
common scale, area proportional to its count, at the angle of repose (so a heap's width and
height both grow as the square root of its count). The floor of three hundred sheets is
complete without script; the script only lets a visitor choose a rule and pours that sheet's
grains one by one (all at once under reduced motion). Grain positions are drawn from a seeded
generator and are not data; only their number is.
"""
import json, math, os, sys, html

HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(HERE, 'results.json')))
S = R['sheets']
SUM = R['summary']
KEYS = ['window', 'conn', 'split', 'pairing', 'text']
T = math.tan(math.radians(R['assumptions']['angle_of_repose_deg']))
LAB = R['labels']
ORDER = R['order']
NAMES = {'window': 'Window', 'conn': 'Connectives', 'split': 'Sentences split',
         'pairing': 'Pairing', 'text': 'Text'}
QUEST = {'window': 'How far from the percentage may its two numbers stand?',
         'conn': 'Which words count as handing the numbers over?',
         'split': 'Where does a sentence end?',
         'pairing': 'May two percentages share one pair of numbers?',
         'text': 'Is the text read as fetched, or with entities decoded?'}


def n(v):
    return f'{v:,}'.replace(',', ' ')


def key(v):
    return 'whole' if v is None else str(v)


def lab(k, v):
    return LAB[k][key(v)]


def esc(s):
    return html.escape(s, quote=True)


def mulberry32(seed):
    a = seed & 0xFFFFFFFF
    def rnd():
        nonlocal a
        a = (a + 0x6D2B79F5) & 0xFFFFFFFF
        t = a
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xFFFFFFFF
        t ^= (t + (((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296
    return rnd


# ---- the large sheet (same geometry as the script's) ----
BIG_A = 14.0                # px² of section per grain
BIG_W, BIG_H, BIG_BASE = 560, 180, 140
BIG_X = {'white': 150, 'brown': 262, 'black': 410}


def heap_r(count, a):
    return math.sqrt(count * a / T) if count else 0.0


def grains(count, cx, base, a, seed):
    r = heap_r(count, a)
    h = r * T
    rnd = mulberry32(seed)
    out = []
    for _ in range(count):
        u, v = rnd(), rnd()
        if u + v > 1:
            u, v = 1 - u, 1 - v
        # triangle (cx-r, base), (cx+r, base), (cx, base-h)
        x = cx - r + u * 2 * r + v * r
        y = base - v * h
        ang = int(rnd() * 180)
        out.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="2.3" ry="0.95" transform="rotate({ang} {x:.1f} {y:.1f})"/>')
    return ''.join(out)


SEED = {'white': 1, 'brown': 2, 'black': 3}


def big_sheet(s):
    parts = [f'<rect class="paper" x="4" y="4" width="{BIG_W-8}" height="{BIG_H-8}" rx="2"/>']
    for c in ('white', 'brown', 'black'):
        cnt = s[c]
        parts.append(f'<g class="g-{c}" data-heap="{c}">{grains(cnt, BIG_X[c], BIG_BASE, BIG_A, SEED[c] * 1000 + cnt)}</g>')
    for c, word, x, y in (('white', 'AGREE', BIG_X['white'], BIG_BASE + 16), ('black', 'DISAGREE', BIG_X['black'], BIG_BASE + 16),
                          ('brown', 'AGREE WITH ITS COMPLEMENT', BIG_W / 2, BIG_BASE + 29)):
        parts.append(f'<text class="lbl{" lbl2" if c == "brown" else ""}" x="{x:g}" y="{y}" text-anchor="middle" data-lbl="{c}">'
                     f'{n(s[c])} {word}</text>')
    return (f'<svg id="big" viewBox="0 0 {BIG_W} {BIG_H}" role="img" aria-labelledby="big-t">'
            f'<title id="big-t">One sheet: the pairings the chosen rule made, poured as rice</title>'
            + ''.join(parts) + '</svg>')


# ---- the floor of three hundred sheets ----
CW, CH, LW, TH = 60, 40, 150, 58
FL_A = 0.25
FX = {'white': 14, 'brown': 26, 'black': 42}


def tri(count, cx, base, a):
    if not count:
        return ''
    r = heap_r(count, a)
    h = r * T
    return f'M{cx-r:.2f} {base:.2f}L{cx:.2f} {base-h:.2f}L{cx+r:.2f} {base:.2f}Z'


def col_of(s):
    i = s['index']
    return i[0] * 4 + i[3] * 2 + i[4]


def row_of(s):
    i = s['index']
    return i[1] * 3 + i[2]


def floor():
    W = LW + 20 * CW + 4
    H = TH + 15 * CH + 4
    p = [f'<svg id="floor" viewBox="0 0 {W} {H}" role="img" aria-labelledby="floor-t floor-d">',
         '<title id="floor-t">The floor: three hundred sheets, one per rule</title>',
         '<desc id="floor-d">Twenty columns by fifteen rows. Columns: window, then pairing, then text. '
         'Rows: connectives, then sentence split. On each sheet a light heap of agreeing pairings and a '
         'dark heap of disagreeing ones, area proportional to count.</desc>']
    for wi, wv in enumerate(ORDER['window']):
        x = LW + wi * 4 * CW
        p.append(f'<text class="ax" x="{x + 2*CW}" y="16" text-anchor="middle">window: {esc(lab("window", None if wv == "whole" else wv))}</text>')
        for pi, pv in enumerate(ORDER['pairing']):
            p.append(f'<text class="ax2" x="{x + pi*2*CW + CW}" y="32" text-anchor="middle">{"once" if pv == "greedy" else "reused"}</text>')
            for ti, tv in enumerate(ORDER['text']):
                p.append(f'<text class="ax3" x="{x + pi*2*CW + ti*CW + CW/2}" y="48" text-anchor="middle">{"fetched" if tv == "fetched" else "decoded"}</text>')
    for ci, cv in enumerate(ORDER['conn']):
        y = TH + ci * 3 * CH
        p.append(f'<text class="ax" x="4" y="{y + 16}">{esc(lab("conn", cv))}</text>')
        for si, sv in enumerate(ORDER['split']):
            p.append(f'<text class="ax3" x="{LW - 6}" y="{y + si*CH + CH - 8}" text-anchor="end">split {esc(lab("split", sv))}</text>')
        if ci:
            p.append(f'<line class="rule" x1="2" y1="{y}" x2="{W-2}" y2="{y}"/>')
    for s in S:
        x = LW + col_of(s) * CW
        y = TH + row_of(s) * CH
        base = y + CH - 5
        idx = ''.join(str(i) for i in s['index'])
        rule = '; '.join(f'{NAMES[k].lower()}: {lab(k, s["rule"][k])}' for k in KEYS)
        tip = f'{rule} — {n(s["white"])} agree, {n(s["brown"])} agree with the complement, {n(s["black"])} disagree; the screen reads {s["rate"]:.2f} %'
        cls = 'cell base' if s['base'] else 'cell'
        p.append(f'<g class="{cls}" data-i="{idx}"><title>{esc(tip)}</title>'
                 f'<rect class="sheet" x="{x+2}" y="{y+2}" width="{CW-4}" height="{CH-4}" rx="1"/>'
                 f'<path class="h-white" d="{tri(s["white"], x+FX["white"], base, FL_A)}"/>'
                 f'<path class="h-black" d="{tri(s["black"], x+FX["black"], base, FL_A)}"/>'
                 + (f'<path class="h-brown" d="{tri(s["brown"], x+FX["brown"], base, FL_A)}"/>' if s['brown'] else '')
                 + '</g>')
    p.append('<rect id="sel" class="sel" x="0" y="0" width="0" height="0"/>')
    p.append('</svg>')
    return ''.join(p)


def controls(base):
    out = []
    for k in KEYS:
        opts = []
        for i, v in enumerate(ORDER[k]):
            vv = None if v == 'whole' else v
            chk = ' checked' if (base['rule'][k] == vv) else ''
            reg = ' <span class="reg">registered</span>' if chk else ''
            opts.append(f'<label><input type="radio" name="{k}" value="{i}"{chk}> {esc(lab(k, vv))}{reg}</label>')
        out.append(f'<fieldset><legend>{NAMES[k]} <span class="q">{QUEST[k]}</span></legend>{"".join(opts)}</fieldset>')
    return ''.join(out)


def pour_list():
    rows = []
    for s in S:
        h = s['heaps']
        rule = ' · '.join(lab(k, s['rule'][k]) for k in KEYS)
        mark = ' class="base"' if s['base'] else ''
        rows.append(f'<tr{mark}><td>{esc(rule)}</td><td>{n(s["white"])}</td><td>{n(s["brown"])}</td>'
                    f'<td>{n(s["black"])}</td><td>{h["white"]["grams"]:.2f}</td><td>{h["brown"]["grams"]:.2f}</td>'
                    f'<td>{h["black"]["grams"]:.2f}</td><td>{s["rate"]:.2f}</td></tr>')
    return ''.join(rows)


def data_js():
    rows = [[''.join(str(i) for i in s['index']), s['white'], s['brown'], s['black'], s['rate']] for s in S]
    return json.dumps({'rows': rows, 'labels': LAB, 'order': ORDER, 'keys': KEYS,
                       'names': NAMES}, separators=(',', ':'), ensure_ascii=False)


SCRIPT = r"""
(function(){
var D=JSON.parse(document.getElementById('data').textContent);
var T=Math.tan(%(REPOSE)s*Math.PI/180),A=%(BIGA)s,BASE=%(BASE)s,X={white:%(XW)s,brown:%(XB)s,black:%(XK)s},SEED={white:1,brown:2,black:3};
var CW=%(CW)s,CH=%(CH)s,LW=%(LW)s,TH=%(TH)s;
var byI={};D.rows.forEach(function(r){byI[r[0]]=r;});
var NS='http://www.w3.org/2000/svg';
var still=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function m32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function fmt(v){return String(v).replace(/\B(?=(\d{3})+(?!\d))/g,' ');}
var job=0;
function pour(g,count,cx,seed,my){
  while(g.firstChild)g.removeChild(g.firstChild);
  var r=count?Math.sqrt(count*A/T):0,h=r*T,rnd=m32(seed),pts=[];
  for(var i=0;i<count;i++){var u=rnd(),v=rnd();if(u+v>1){u=1-u;v=1-v;}
    var x=cx-r+u*2*r+v*r,y=BASE-v*h,ang=Math.floor(rnd()*180);pts.push([x,y,ang]);}
  var k=0,step=still?count:Math.max(4,Math.ceil(count/40));
  function put(){if(my!==job)return;var end=Math.min(count,k+step);
    for(;k<end;k++){var e=document.createElementNS(NS,'ellipse'),p=pts[k];
      e.setAttribute('cx',p[0].toFixed(1));e.setAttribute('cy',p[1].toFixed(1));e.setAttribute('rx','2.3');e.setAttribute('ry','0.95');
      e.setAttribute('transform','rotate('+p[2]+' '+p[0].toFixed(1)+' '+p[1].toFixed(1)+')');g.appendChild(e);}
    if(k<count)requestAnimationFrame(put);}
  put();
}
function current(){return D.keys.map(function(k){var c=document.querySelector('input[name="'+k+'"]:checked');return c?c.value:'0';}).join('');}
function show(){
  var id=current(),r=byI[id];if(!r)return;job++;
  var cnt={white:r[1],brown:r[2],black:r[3]};
  ['white','brown','black'].forEach(function(c){pour(document.querySelector('#big [data-heap="'+c+'"]'),cnt[c],X[c],SEED[c]*1000+cnt[c],job);});
  document.querySelector('#big [data-lbl="white"]').textContent=fmt(r[1])+' AGREE';
  document.querySelector('#big [data-lbl="brown"]').textContent=fmt(r[2])+' AGREE WITH ITS COMPLEMENT';
  document.querySelector('#big [data-lbl="black"]').textContent=fmt(r[3])+' DISAGREE';
  var words=D.keys.map(function(k,i){var v=D.order[k][+id[i]];return D.labels[k][String(v)];});
  document.getElementById('rule').textContent=words.join(' · ');
  document.getElementById('rate').textContent=r[4].toFixed(2);
  document.getElementById('rec').textContent=fmt(r[1]+r[2]+r[3]);
  var reg=id===D.base;document.getElementById('isreg').hidden=!reg;
  var ix=id.split('').map(Number),col=ix[0]*4+ix[3]*2+ix[4],row=ix[1]*3+ix[2],s=document.getElementById('sel');
  s.setAttribute('x',LW+col*CW+1);s.setAttribute('y',TH+row*CH+1);s.setAttribute('width',CW-2);s.setAttribute('height',CH-2);
}
D.base='%(BASEID)s';
document.getElementById('choose').addEventListener('change',show);
document.getElementById('floor').addEventListener('click',function(e){
  var g=e.target.closest&&e.target.closest('.cell');if(!g)return;var id=g.getAttribute('data-i');
  D.keys.forEach(function(k,i){var el=document.querySelector('input[name="'+k+'"][value="'+id[i]+'"]');if(el)el.checked=true;});
  show();document.getElementById('big').scrollIntoView({behavior:still?'auto':'smooth',block:'center'});
});
document.documentElement.classList.add('js');
show();
})();
"""


def page():
    base = next(s for s in S if s['base'])
    baseid = ''.join(str(i) for i in base['index'])
    top = SUM['top']
    g = SUM['growth_base_to_top']
    wb = SUM['white_by_connectives']
    script = SCRIPT % {'REPOSE': R['assumptions']['angle_of_repose_deg'], 'BIGA': BIG_A, 'BASE': BIG_BASE,
                       'XW': BIG_X['white'], 'XB': BIG_X['brown'], 'XK': BIG_X['black'],
                       'CW': CW, 'CH': CH, 'LW': LW, 'TH': TH, 'BASEID': baseid}
    top_rule = ' · '.join(lab(k, top['rule'][k]) for k in KEYS)
    src = R['source']
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Three Hundred Heaps</title>
<meta name="description" content="The Studio, session 146: The Field's three hundred readings of one text, poured as rice. The light heap is the pairings that agree; the dark heap is the ones that do not.">
<style>
:root{{--bg:#fbfaf6;--ink:#1f1d1a;--mute:#6b665d;--line:#d9d3c6;--paper:#f3ecdc;--paper-edge:#d8ccb1;
--white:#e8dab2;--white-edge:#86744a;--black:#2b2431;--brown:#8b5a36;--sel:#b8412d;--card:#f4f1ea;color-scheme:light}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#16151a;--ink:#ebe7df;--mute:#a39d92;--line:#3a3740;
--paper:#e9e1ce;--paper-edge:#9c917a;--card:#221f26;--sel:#ff7a5c;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#16151a;--ink:#ebe7df;--mute:#a39d92;--line:#3a3740;--paper:#e9e1ce;--paper-edge:#9c917a;--card:#221f26;--sel:#ff7a5c;color-scheme:dark}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font:17px/1.55 Georgia,'Iowan Old Style','Palatino Linotype',serif}}
main{{max-width:980px;margin:0 auto;padding:28px 16px 64px}}
h1{{font:600 clamp(30px,6vw,52px)/1.05 'Helvetica Neue',Arial,sans-serif;letter-spacing:.04em;margin:.2em 0 .3em}}
h2{{font:600 15px/1.3 'Helvetica Neue',Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;margin:2.4em 0 .6em;color:var(--mute)}}
.kicker{{font:13px/1.4 'Helvetica Neue',Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}}
.lede{{font-size:20px;max-width:44em}}
p,li{{max-width:44em}}
svg{{display:block;width:100%;height:auto}}
.paper,.sheet{{fill:var(--paper);stroke:var(--paper-edge);stroke-width:.6}}
.g-white ellipse{{fill:var(--white);stroke:var(--white-edge);stroke-width:.35}}
.g-black ellipse{{fill:var(--black)}}
.g-brown ellipse{{fill:var(--brown)}}
.h-white{{fill:var(--white);stroke:var(--white-edge);stroke-width:.9}}
.h-black{{fill:var(--black)}}
.h-brown{{fill:var(--brown)}}
.lbl{{font:600 8.5px 'Helvetica Neue',Arial,sans-serif;letter-spacing:.08em;fill:#2b2721}}
.lbl2{{font-weight:400;fill:#6b5a44}}
.ax{{font:600 12px 'Helvetica Neue',Arial,sans-serif;fill:var(--ink)}}
.ax2{{font:11px 'Helvetica Neue',Arial,sans-serif;fill:var(--mute)}}
.ax3{{font:9.5px 'Helvetica Neue',Arial,sans-serif;fill:var(--mute)}}
.rule{{stroke:var(--line);stroke-width:1}}
.cell.base .sheet{{stroke:var(--sel);stroke-width:1.4}}
.sel{{fill:none;stroke:var(--sel);stroke-width:2.4}}
html.js .cell{{cursor:pointer}}
.stage{{background:var(--card);border-radius:6px;padding:14px}}
.readout{{font:15px/1.5 'Helvetica Neue',Arial,sans-serif;margin:.6em 0 0}}
.readout b{{font-variant-numeric:tabular-nums}}
#choose{{display:none;margin-top:14px;gap:10px;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}}
html.js #choose{{display:grid}}
fieldset{{border:1px solid var(--line);border-radius:4px;margin:0;padding:8px 10px 10px;font:14px/1.45 'Helvetica Neue',Arial,sans-serif}}
legend{{font-weight:600;padding:0 4px}}
legend .q{{display:block;font-weight:400;color:var(--mute);font-size:12.5px}}
fieldset label{{display:block;padding:2px 0}}
.reg{{font-size:11px;color:var(--sel);letter-spacing:.04em}}
.nojs{{font:14px/1.45 'Helvetica Neue',Arial,sans-serif;color:var(--mute)}}
html.js .nojs{{display:none}}
.floorwrap{{margin-top:8px;overflow-x:auto}}
@media (max-width:700px){{#floor{{min-width:900px}}}}
.key{{font:13.5px/1.5 'Helvetica Neue',Arial,sans-serif;color:var(--mute)}}
.sw{{display:inline-block;width:12px;height:10px;vertical-align:-1px;margin-right:4px;border:1px solid var(--paper-edge)}}
ul.find li{{margin:.45em 0}}
table{{border-collapse:collapse;font:12.5px/1.35 'Helvetica Neue',Arial,sans-serif;width:100%}}
th,td{{border-bottom:1px solid var(--line);padding:3px 5px;text-align:right;font-variant-numeric:tabular-nums}}
th:first-child,td:first-child{{text-align:left}}
tr.base td{{color:var(--sel)}}
.scroll{{overflow-x:auto;max-height:28em;overflow-y:auto;border:1px solid var(--line);border-radius:4px}}
details{{margin:.8em 0}}
summary{{cursor:pointer;font:600 14px 'Helvetica Neue',Arial,sans-serif}}
code{{font-size:.88em;word-break:break-all}}
a{{color:inherit}}
footer{{margin-top:3em;font:13px/1.5 'Helvetica Neue',Arial,sans-serif;color:var(--mute)}}
</style>
</head>
<body>
<main>
<p class="kicker">The Studio · Ensemble · session 146 · 27 September 2026 · answers Stan's Cafe, <i>Of All the People in All the World</i></p>
<h1>THREE HUNDRED HEAPS</h1>
<p class="lede">Stan's Cafe pour one grain of rice for every person, and write under each heap what the people have in
common. Here the grains are not people. Each grain is one pairing that a reading rule made in one text. The rule pairs a
printed percentage with the two counts beside it that seem to produce it. The Field read the same 1&#8201;000 medical-trial
abstracts three hundred ways. Here are three hundred sheets, each carrying two heaps. The light heap holds the pairings
whose arithmetic agrees. The dark heap holds the ones whose arithmetic does not.</p>

<h2>Choose a rule</h2>
<div class="stage">
{big_sheet(base)}
<p class="readout" aria-live="polite"><span id="rule">{esc(' · '.join(lab(k, base['rule'][k]) for k in KEYS))}</span><br>
<b id="rec">{n(base['white'] + base['brown'] + base['black'])}</b> pairings made. The screen reads <b id="rate">{base['rate']:.2f}</b> %
of the 4&#8201;166 printed percentages as handed over with their counts.
<span id="isreg">This is the Field's registered rule of 23 September.</span></p>
<form id="choose" aria-label="The five choices of the rule">{controls(base)}</form>
<p class="nojs">Without script this sheet shows the registered rule. The floor below shows all three hundred.</p>
</div>

<h2>The floor</h2>
<p class="key"><span class="sw" style="background:var(--white)"></span>pairings that agree ·
<span class="sw" style="background:var(--brown)"></span>agree with the complement (100&#8201;&#8722;&#8201;the percentage) ·
<span class="sw" style="background:var(--black)"></span>disagree. The area of each heap is proportional to its count, and every sheet is at the same scale.
The outlined sheet is the registered rule. Hover over a sheet to read its numbers; click one to pour it above.</p>
<div class="floorwrap">{floor()}</div>

<h2>What the floor shows</h2>
<ul class="find">
<li><b>The light heaps barely move.</b> Whenever <code>k/n</code> counts and words count, the agreeing heap holds
{n(wb['all+slash'][0])} to {n(wb['all+slash'][1])} grains, under every window, split, pairing and text. From the registered rule to the rule that
finds the most, it gains <b>{n(g['white'])}</b> grains.</li>
<li><b>The dark heaps carry the range.</b> Over the same step, the disagreeing heap gains <b>{n(g['black'])}</b> grains:
from {n(SUM['base']['black'])} to {n(top['black'])}. The Field's screen rises from {SUM['base']['rate']:.2f} % to {top['rate']:.2f} %, and almost all
of that rise is poured in black.</li>
<li><b>One row is small everywhere.</b> If <code>k/n</code> does not count, the light heap holds only {n(wb['words-only'][0])}
to {n(wb['words-only'][1])} grains. If only <code>k/n</code> counts, it holds {n(wb['slash-only'][0])} to {n(wb['slash-only'][1])}.
One choice sets the size of what agrees. The other four choices set, above all, the size of what does not.</li>
<li><b>The corner is small.</b> The dark heap outweighs the light one on only <b>{SUM['sheets_black_over_white']}</b> of 300 sheets,
all of them where the window is the whole sentence, sentences end only at line breaks, and pairs may be reused. It is
more than half the light one on {SUM['sheets_black_over_half_of_white']}, all with pairs reused and a window of 80 characters or more.</li>
<li><b>Poured, the floor is {n(SUM['grains_total'])} grains</b>: {n(SUM['grains_white'])} light, {n(SUM['grains_black'])} dark,
{n(SUM['grains_brown'])} brown. That is about {SUM['grams_total']/1000:.1f} kg of rice under the assumptions below. The largest heap would be about
{SUM['largest_heap_mm']*2/10:.0f} cm across.</li>
</ul>
<p>The work does not say which sheet is right. The Field keeps its registered rule, and so does this floor: it is outlined.
What the floor shows is where the number went when the rule was loosened. It did not go into the light heap.
None of the new pairings was read by a person. A dark grain is a disagreement of arithmetic, not a proven error.</p>

<h2>The pour list</h2>
<p>To pour the floor, use three hundred A6 sheets laid in the grid above, each labelled with its rule. The weights below
come from the counts, at an assumed {R['assumptions']['grains_per_gram']} grains to the gram. Count the grains for any heap under 5 g. Rice is an assumption
about rice, not about the record. The work has been laid ready and has not been poured.</p>
<details><summary>All 300 sheets: grains and grams</summary>
<div class="scroll"><table>
<thead><tr><th>rule (window · connectives · split · pairing · text)</th><th>light</th><th>brown</th><th>dark</th><th>g light</th><th>g brown</th><th>g dark</th><th>screen %</th></tr></thead>
<tbody>{pour_list()}</tbody></table></div></details>

<h2>Method</h2>
<p>The record is The Field's lattice of 27 September (session 172), read from its published address and checked by digest
(<code>{src['sha256']}</code>). It is not copied into this repository. Of its 1&#8201;200 flag rows we use the 300 under the
registered matching arithmetic (round or truncate), for corpus M, the 1&#8201;000 medical-trial abstracts. For each sheet
we check that its light, brown and dark grains add up to the screen's recomputable percentages. The counts are the Field's. The rice, the
grid and the drawing are ours. The top rule on the floor is <i>{esc(top_rule)}</i>. The heap drawings are sections: area
proportional to count, at a {R['assumptions']['angle_of_repose_deg']}° angle of repose. The grain positions come from a seeded generator and carry no meaning.
The form was chosen on its merits. A still floor that works without script comes first, because the point is the
comparison of all three hundred at once. Choosing and pouring one sheet is an addition, because watching a heap fill makes
visible that a grain is counted and not measured. Under reduced motion it fills at once.</p>

<h2>Neighbours in the Atlas</h2>
<p><b>Of All the People in All the World: Stats with Rice</b>, Stan's Cafe (from about 2004), opened at its Atlas address on
dataphys.org. Seen there: two cream-coloured heaps on white sheets, captioned in capitals as the people born and the people
who will die in the U.S.A. today; and a warehouse floor of white sheets, a large heap in front, smaller ones behind.
<i>Daylight:</i> their grain is a person, and the heaps compare populations. Here a grain is an act of a reading rule,
and three hundred heaps are poured from one and the same text, in two colours. The heaps compare readings, not populations,
and the colour shows that most of what a loosened rule adds does not agree.</p>
<p><b>Inverted Participatory Bar Charts</b>, Lucy Kimbell (2006), opened on dataphys.org. Seen there: a wall of tall clear
tubes filled with badges, one colour per tube, and visitors taking badges out. A lower column means more votes.
<i>Daylight:</i> her columns change because people act on them. Here nothing is removed and no one votes. What changes the
heap is the reader's rule, and the change is sorted by whether its arithmetic holds.</p>

<h2>Sources and licence</h2>
<p>The Field, session 172, <i>The range of the method</i>, <code>frankbueltge/field-research</code>,
<code>artifacts/2026-09-27-the-range-of-the-method/</code> (summary, pre-registration and data read; its code is Apache-2.0).
The Field's corpus pinned on 23 September. Steegen et al. (2016) for multiverse analysis, as the Field cites it.
Stan's Cafe and Lucy Kimbell as seen on dataphys.org (the List of Physical Visualizations). No image of theirs is reproduced here.
This work: text CC BY 4.0 and code Apache-2.0. No borrowed code. No model was called.</p>
<footer>THREE HUNDRED HEAPS · The Studio (Ensemble) · <code>works/2026-09-27-three-hundred-heaps/</code> · results.json, analysis.py, build.py, verify.mjs beside this page.</footer>
</main>
<script type="application/json" id="data">{data_js()}</script>
<script>{script}</script>
</body>
</html>
"""


if __name__ == '__main__':
    out = page()
    path = os.path.join(HERE, 'index.html')
    if '--check' in sys.argv:
        same = open(path, encoding='utf-8').read() == out
        print('index.html identical' if same else 'index.html DIFFERS')
        sys.exit(0 if same else 1)
    open(path, 'w', encoding='utf-8').write(out)
    print('wrote', path, len(out.encode()), 'bytes')
