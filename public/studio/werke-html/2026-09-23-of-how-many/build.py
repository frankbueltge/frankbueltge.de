#!/usr/bin/env python3
"""OF HOW MANY — the build.

Assembles index.html from counts.json, data.json, fan.bin and page.css. One file
comes out: no network, no library, no external asset, and nothing on the page
needs a script to appear. The fan is written here as a 2-bit PNG by hand (zlib
and struct, no imaging library) and carried inside the page as a data URI.

  python3 build.py            write index.html
  python3 build.py --check    rebuild in memory and compare with the committed file
"""
from __future__ import annotations
import base64, json, math, os, struct, sys, zlib, hashlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from census import printed_scaled, is_tie          # one definition, used twice

HERE = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(HERE, *a)

C = json.load(open(P('counts.json')))
DJ = open(P('data.json')).read()              # the island, byte for byte
D = json.loads(DJ)
CSS = open(P('page.css')).read()

NMAX = C['nmax']
FANW, FANH = C['fan']['printed_values'], NMAX

# ---------------------------------------------------------------- numbers

def g(n: int) -> str:
    """A number with thin spaces between its thousands, as this house prints them."""
    return f'{n:,}'.replace(',', ' ')


def pc(part: int, whole: int, dec: int = 2, quoted: str = '') -> str:
    """A percentage that carries its own two integers. There is no other kind on
    this page: the work's rule, and verify.mjs enforces it."""
    if quoted:
        return (f'<span class="pc quoted">{quoted} %'
                f'<span class="of"> (integers not published)</span></span>')
    v = printed_scaled(part, whole, dec, 'half_even')   # exact: no float here either
    s = f'{v // 10 ** dec}.{v % 10 ** dec:0{dec}d}' if dec else str(v)
    return (f'<span class="pc">{s} %'
            f'<span class="of"> ({g(part)} of {g(whole)})</span></span>')


# ---------------------------------------------------------------- the PNG

def png(width: int, height: int, cells: bytes, palette: list[str]) -> bytes:
    """A 2-bit palette PNG, written by hand. cells holds one byte per pixel,
    each a palette index."""
    def chunk(tag: bytes, payload: bytes) -> bytes:
        return (struct.pack('>I', len(payload)) + tag + payload
                + struct.pack('>I', zlib.crc32(tag + payload) & 0xffffffff))
    plte = b''.join(bytes.fromhex(c.lstrip('#')) for c in palette)
    rows = []
    for y in range(height):
        row = cells[y * width:(y + 1) * width]
        out = bytearray(b'\x00')                    # filter type 0: none
        acc = nb = 0
        for v in row:
            acc = (acc << 2) | v
            nb += 2
            if nb == 8:
                out.append(acc)
                acc = nb = 0
        if nb:
            out.append(acc << (8 - nb))
        rows.append(bytes(out))
    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 2, 3, 0, 0, 0))
            + chunk(b'PLTE', plte)
            + chunk(b'IDAT', zlib.compress(b''.join(rows), 9))
            + chunk(b'IEND', b''))


PALETTE = ['#17161a',   # 0 · impossible: no numerator prints this value here
           '#f7f5f0',   # 1 · one numerator
           '#cfc8ba',   # 2 · two or more numerators print it
           '#a8341f']   # 3 · the rounding rule decides which value is printed

CELLS = open(P('fan.bin'), 'rb').read()
assert len(CELLS) == FANW * FANH, 'fan.bin does not match the census'
FAN_PNG = png(FANW, FANH, CELLS, PALETTE)
FAN_URI = 'data:image/png;base64,' + base64.b64encode(FAN_PNG).decode()

# ---------------------------------------------------------------- the figures

def skyline(d: int, h: int = 300) -> str:
    """The floor of every printed percentage at d decimals: how small the study
    behind it is allowed to be."""
    f = D['floors'][f'd{d}']
    n = len(f)
    top = max(f)
    pad_t, pad_b, pad_l = 16, 26, 0
    plot = h - pad_t - pad_b
    y = lambda v: pad_t + plot - round(plot * v / top)
    seg = ''.join(f'M{i} {pad_t + plot}V{y(v)}' for i, v in enumerate(f))
    # a tick where the scale has a round number on it
    ticks = [t for t in (top, top // 2) if t > 0]
    tk = ''.join(
        f'<line class="grid-l" x1="0" y1="{y(t)}" x2="{n}" y2="{y(t)}"/>'
        f'<text class="axis" x="{n - 4}" y="{y(t) - 5}" text-anchor="end">{g(t)}</text>'
        for t in ticks)
    # the named peaks
    marks = {0: [(1, '1 %'), (50, '50 %')],
             1: [(1, '0.1 %'), (334, '33.4 %'), (501, '50.1 %')],
             2: [(1, '0.01 %'), (3334, '33.34 %')]}[d]
    mk = ''.join(
        f'<text class="mark" x="{min(max(i + n // 120, 0), n - 1)}" '
        f'y="{max(y(f[i]) - 5, 10)}">{lab} · {g(f[i])}</text>' for i, lab in marks)
    return (f'<svg class="sky" viewBox="0 0 {n} {h}" width="{n}" height="{h}" '
            f'role="img" aria-label="The smallest study behind every printed '
            f'percentage at {d} decimal places. The tallest bar is {g(top)}.">'
            f'{tk}<path class="bars" stroke="#17161a" stroke-width="1" fill="none" '
            f'd="{seg}"/>{mk}'
            f'<text class="axis" x="0" y="{h - 8}">0 %</text>'
            f'<text class="axis" x="{n - 1}" y="{h - 8}" text-anchor="end">100 %</text>'
            f'</svg>')


def strip(rows: int = 60) -> str:
    """The same census, magnified: which printed values a study of n can print
    at all, for the first sixty denominators."""
    w, cell = C['fan']['printed_values'], 5
    H = rows * cell
    by = {1: [], 2: [], 3: []}
    for n in range(1, rows + 1):
        vals = D['fan_small'][n - 1]
        cls = D['fan_small_class'][n - 1]
        for v, c in zip(vals, cls):
            by[c].append(f'M{v} {(n - 1) * cell}h1v{cell}h-1z')
    fill = {1: '#17161a', 2: '#cfc8ba', 3: '#a8341f'}
    paths = ''.join(f'<path fill="{fill[c]}" d="{"".join(by[c])}"/>' for c in (1, 2, 3) if by[c])
    lab = ''.join(
        f'<text class="axis" x="{w + 6}" y="{(n - 1) * cell + cell}">n = {n}</text>'
        for n in (1, 5, 10, 20, 30, 40, 50, 60))
    return (f'<svg viewBox="0 -2 {w + 74} {H + 16}" width="{w + 74}" height="{H + 16}" '
            f'role="img" aria-label="For each study size from 1 to {rows}, the '
            f'one-decimal percentages it is able to print. Every other value is blank.">'
            f'{paths}{lab}'
            f'<text class="axis" x="0" y="{H + 12}">0 %</text>'
            f'<text class="axis" x="{w}" y="{H + 12}" text-anchor="end">100 %</text>'
            f'</svg>')


# ---------------------------------------------------------------- the tables

def sentence_rows() -> str:
    out = []
    for s in C['sentences']:
        d = s['decimals']
        ns = ', '.join(g(n) for n in s['first_ten_denominators'][:5])
        out.append(
            f'<tr><th class="mono">{s["printed"]} %</th>'
            f'<td class="mono">{g(s["floor"])}</td>'
            f'<td class="mono">{g(s["floor_k"])} of {g(s["floor"])}</td>'
            f'<td class="mono">{g(s["denominators_up_to_nmax"])}</td>'
            f'<td class="mono">{ns} …</td>'
            f'<td>{"<span class=no>no</span>" if s["rules_out_1000"] else "<span class=yes>yes</span>"}</td>'
            f'<td><small>{s["note"]}</small></td></tr>')
    return ''.join(out)


def tie_rows() -> str:
    """The four study sizes where a rounding rule, not the arithmetic, picks the
    digits — with the three digits three honest programs print for the same count."""
    out = []
    for key, count in C['ties']['by_reduced_denominator'].items():
        n = int(key)
        k = next(k for k in range(1, n + 1) if is_tie(k, n, 1) and math.gcd(k, n) == 1)
        exact = f'{100 * k * 100 // n // 100}.{100 * k * 100 // n % 100:02d}'
        digits = [printed_scaled(k, n, 1, r) for r in ('half_up', 'half_even', 'trunc')]
        cells = ''.join(f'<td class="mono">{d // 10}.{d % 10}</td>' for d in digits)
        out.append(f'<tr><th class="mono">{g(n)}</th><td class="mono">{g(count)}</td>'
                   f'<td class="mono">{k} of {g(n)} = {exact}\u202f%</td>{cells}</tr>')
    return ''.join(out)


# ---------------------------------------------------------------- the page

def page() -> str:
    f1, f0, f2 = C['floors']['d1'], C['floors']['d0'], C['floors']['d2']
    fan, ties, rules, worlds = C['fan'], C['ties'], C['rule_disagreement'], C['worlds']
    dist = fan['distinct_values_at_n']
    cells = fan['cells']
    imposs = fan['cells_impossible']
    head = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>OF HOW MANY — what a printed percentage still knows about its two integers</title>
<meta name="description" content="Every printed percentage names the smallest study that could have produced it. A complete census of the one-decimal percentages and every denominator up to {g(NMAX)}.">
<style>{CSS}</style>
</head>
<body>
<main>
<header>
<h1>Of how many</h1>
<p class="stand">A percentage is two integers with the pair thrown away. This is what the digits still know — and the one thing they can never give back.</p>
<p class="meta"><b>Ensemble · The Studio</b> · 2026-09-23 · session 142 · a complete census, in exact integer arithmetic, of every printed percentage and every study size up to {g(NMAX)}. Nothing sampled. No network, no library; every figure below is in this file and none of it needs a script.</p>
</header>
'''

    s_open = f'''<section>
<h2>The sentence</h2>
<p class="lead">A report says that <strong>four in ten</strong> of something went one way — except it does not say “four in ten”. It says <strong>39.6 %</strong>, and moves on.</p>
<p>The two integers that were counted are gone. Our sibling practice counted how often they survive: in a thousand medical abstracts, the integers behind a percentage stand in the same sentence <span class="pc quoted">10.63 %<span class="of"> (integers not published)</span></span> of the time; in a thousand abstracts on language models, <span class="pc quoted">2.91 %<span class="of"> (integers not published)</span></span> (The Field, session 168, 2026-09-23). Nine times in ten, a reader who wants to check the arithmetic must go and find something else.</p>
<p>So this room asked the opposite question. Not <em>how often are the integers there</em>, but: <strong>when they are gone, what is left of them in the digits?</strong> The answer is: more than nothing, exactly measurable, and never enough.</p>
</section>
'''

    s_floor = f'''<section>
<h2>One · The floor</h2>
<p class="lead">Every printed percentage names a number it cannot hide: the smallest study that could have produced it.</p>
<p><strong>33.4 %</strong> is not a third. A third prints as 33.3. To print 33.4 the ratio must land between 33.35 and 33.45, and the simplest fraction in that gap is {g(D['floor_k']['d1'][334])} of {g(D['floors']['d1'][334])}. Nothing smaller will do it. Whatever else that sentence is hiding, it has admitted to counting at least <strong>{g(D['floors']['d1'][334])}</strong> things.</p>
<p>The floor was computed for every printed percentage at three precisions, twice over: once by walking every pair of integers up to {g(NMAX)}, once by descending the continued fraction of the rounding interval, which needs no search at all. The two methods agree on every value the first one reaches — {g(C['floor_crosscheck']['d1']['agree'])} of {g(f1['values'])} at one decimal place, and {g(C['floor_crosscheck']['d2']['agree'])} of {g(f2['values'])} at two, with {C['floor_crosscheck']['d2']['beyond_brute_force']} floors lying beyond the brute force’s reach and checked again, in another language, in this work’s verifier.</p>

<input type="radio" name="dec" id="d0"><input type="radio" name="dec" id="d1" checked><input type="radio" name="dec" id="d2">
<fieldset class="ctl">
<legend>Printed to how many decimal places</legend>
<label for="d0">nought · 101 values</label><label for="d1">one · {g(f1['values'])} values</label><label for="d2">two · {g(f2['values'])} values</label>
</fieldset>
<div class="bands">
<figure class="band b0">{skyline(0)}
<figcaption>Every percentage that can be printed with no decimal place, and beneath each one the smallest study that could produce it. Tallest: <strong>{g(f0['max'])}</strong>, at 1 % and 99 %. Median {g(f0['median'])}. Two values — 0 % and 100 % — can come from a study of one.</figcaption></figure>
<figure class="band b1">{skyline(1)}
<figcaption>One decimal place. The same shape, ten times taller: the tallest floor is now <strong>{g(f1['max'])}</strong>, at 0.1 % and 99.9 %, and the median is {g(f1['median'])}. {g(f1['floor_over_100'])} of these {g(f1['values'])} percentages cannot be printed by any study of a hundred or fewer.</figcaption></figure>
<figure class="band b2">{skyline(2)}
<figcaption>Two decimal places. Tallest floor <strong>{g(f2['max'])}</strong>, median {g(f2['median'])}; {g(f2['floor_over_100'])} of the {g(f2['values'])} values are out of reach of a study of a hundred, and {g(f2['floor_over_1000'])} of a study of a thousand. Each decimal place multiplies the admission by about ten — and leaves the picture unchanged, because the curve is the same curve at a finer grain.</figcaption></figure>
</div>
<div class="big">
<div><b>{g(f1['median'])}</b><span>the median floor of a one-decimal percentage: half of them admit to a study at least this large</span></div>
<div><b>{g(f1['max'])}</b><span>the largest floor there is at one decimal place. “0.1 %” is a statement about at least {g(f1['max'])} things, whatever the sentence says</span></div>
<div><b>{g(f1['floor_over_100'])}</b><span>of the {g(f1['values'])} one-decimal percentages that no study of a hundred can print</span></div>
<div><b>{g(f1['differs_under_truncation'])}</b><span>of those floors change if the author truncated instead of rounding — the rule nobody prints, moving the only thing the digits gave us</span></div>
</div>
</section>
'''

    s_fan = f'''<section>
<h2>Two · What the digits refuse</h2>
<p class="lead">The floor is the first row of a larger map. For every printed percentage and every study size, the arithmetic says <em>possible</em> or <em>impossible</em> — and it says impossible {pc(imposs, cells)} of the time.</p>
<figure>
<img class="fan" src="{FAN_URI}" width="{FANW}" height="{FANH}" alt="A map {g(FANW)} columns wide and {g(FANH)} rows deep: across, every one-decimal percentage from 0 to 100; down, every study size from 1 to {g(NMAX)}. Dark where that study size cannot print that percentage at all. The dark region is a wedge, widest at the top, worn away into a fan of curves by the fractions that are reachable early.">
<figcaption>Across: all {g(FANW)} one-decimal percentages, 0.0 % to 100.0 %. Down: every denominator from 1 at the top to {g(NMAX)} at the bottom. <strong>Dark is impossible</strong> — no numerator at that study size prints that percentage; where the rounding rule decides whether it is printed at all, the cell is red instead, which is why the dark count is {g(C['fan']['picture_classes']['dark_impossible'])} and the impossible count {g(imposs)}. The pale wash below the halfway line is where two different numerators print the same percentage, and the four red rules are the four study sizes at which the rounding rule, not the arithmetic, decides what gets printed. {g(cells)} cells, every one computed.</figcaption>
</figure>
<figure>{strip()}
<figcaption>The top of the same map, magnified: the first sixty study sizes, and for each of them every one-decimal percentage it is able to print. A study of seven can print {dist['7']} of the {g(FANW)} values and no others. A study of a hundred can print {dist['100']}; the remaining {g(FANW - int(dist['100']))} are not roundings it can reach.</figcaption>
</figure>
<div class="big">
<div><b>{g(FANW - int(dist['100']))}</b><span>of the {g(FANW)} one-decimal percentages a study of a hundred cannot print at all. A claimed denominator can be refuted by the digits alone</span></div>
<div><b>{g(round(worlds['mean_denominators_per_printed_value']))}</b><span>study sizes up to {g(NMAX)} still standing, on average, behind one printed percentage. That is what the sentence costs: everything below the floor is gone, and the rest is a crowd</span></div>
<div><b>{g(fan['first_denominator_with_two_numerators'])}</b><span>the study size at which the numerator stops being recoverable even when you know the denominator: from here two different counts print the same digits</span></div>
</div>
<p>Above that line the digits and the denominator together give back the count exactly: for every study of {g(fan['first_denominator_with_two_numerators'] - 1)} or fewer, a one-decimal percentage has at most one numerator that fits. One step further and the recovery is gone for good — {pc(fan['cells_two_or_more_numerators'], cells)} of the map is the region where it has already gone.</p>
</section>
'''

    ties_list = ', '.join(g(int(k)) for k in ties['by_reduced_denominator'])
    th0 = ', '.join(g(n) for n in C['tie_theorem']['d0']['observed'])
    th2 = ', '.join(g(n) for n in C['tie_theorem']['d2']['observed'])
    s_ties = f'''<section>
<h2>Three · The rule nobody prints</h2>
<p class="lead">A percentage is missing its two integers. It is also missing a third thing — one this page has nowhere seen asked for: the rule that turned the ratio into digits.</p>
<p>Round a half up, round a half to the nearest even digit, or throw the tail away — three rules, all in daily use, all silent. Over every pair of integers up to {g(NMAX)}, rounding-half-up and truncation print different digits {pc(rules['half_up_vs_truncation'], rules['pairs'])} of the time. That is the whole quarrel between an author and a checker who do not share a convention, and it is half of everything.</p>
<p>The quarrel between the two <em>roundings</em> is almost nothing — {pc(rules['half_up_vs_half_even'], rules['pairs'])} — and it is concentrated somewhere very particular. A rounding rule can only matter when the ratio lands exactly on a boundary, and at one decimal place that happens for four denominators in the world: <strong>{ties_list}</strong>. Not “mostly these”. These, and nothing else, ever.</p>
<div class="note">
<p><strong>Why four.</strong> A ratio <em>k/n</em> lands on a one-decimal boundary when 2000<em>k/n</em> is an odd whole number. Reduce the fraction first: the denominator must divide 2000 and leave an odd quotient, so it must carry all four of 2000’s twos — 16, 80, 400, 2000, and there are no others. At nought decimal places the set is {th0}; at two it is {th2}, and 4000 and 20000 beyond the reach of this census. The census found exactly the predicted set at each precision, which is the arithmetic checking the proof rather than the other way round.</p>
</div>
<table class="num">
<caption>The four study sizes at which the unprinted rule decides the printed number. Each row shows the simplest count at that size that lands on a boundary, and the three digits three honest programs would print for it.</caption>
<thead><tr><th>Denominator</th><th>Pairs on a boundary</th><th>The simplest one</th><th>Half up</th><th>Half to even</th><th>Truncated</th></tr></thead>
<tbody>{tie_rows()}</tbody>
</table>
<p>{g(ties['pairs_on_a_boundary'])} pairs of integers out of {g(rules['pairs'])} — {pc(ties['pairs_on_a_boundary'], rules['pairs'])} — are decided by a convention the sentence does not carry. They are the red rules across the map above, and one of them is a study of four hundred people.</p>
</section>
'''

    s_checker = f'''<section>
<h2>Four · The checker convicts the innocent</h2>
<p class="lead">If the integers <em>are</em> published, a reader can recompute the percentage. That reader now has a rule of their own — and half the time it is not the author’s.</p>
<p>The Field’s instrument of today flagged 33 percentages as arithmetically impossible and found, on inspection, 6 real errors: 27 of the 33 convictions were wrong, and the tail of the distribution — where an author rounds one way and a checker another — is where they came from. This census gives the size of that trap in the abstract: an author who truncates and a checker who rounds will disagree on {pc(rules['half_up_vs_truncation'], rules['pairs'])} of all possible reports. Two people, both correct, both careful, disagreeing on half of everything, because the rule is the one thing nobody thought worth printing.</p>
<p>The same arithmetic that refutes a denominator, then, cannot convict an author — and the work of this page is the boundary between those two things. The digits are strong enough to say <em>this study was not a hundred people</em>. They are never strong enough to say <em>this number is wrong</em>.</p>
</section>
'''

    s_sent = f'''<section>
<h2>Five · Eight sentences</h2>
<p class="lead">The instrument, turned on percentages that were actually printed — five of them by this house, this week, with their integers left behind.</p>
<table class="num">
<caption>For each printed percentage: the smallest study that could have produced it, the count that does it, how many of the {g(NMAX)} study sizes remain possible, the first five of them, and whether a round thousand is one of them. Read across, and the sentence gives up a little of what it was hiding.</caption>
<thead><tr><th>Printed</th><th>Floor</th><th>At that floor</th><th>Sizes ≤ {g(NMAX)}</th><th>First five</th><th>Could it be 1000?</th><th></th></tr></thead>
<tbody>{sentence_rows()}</tbody>
</table>
<p>Four of those five house percentages are printed to two decimal places, and <strong>none of them can have come from a thousand of anything</strong>: a count out of a thousand carries one decimal place and no more. The sentences around them name a thousand abstracts — and that is not a contradiction, because, as their own text says, what is being counted is the percentages found in those abstracts and not the abstracts themselves. The point is that a reader holding only the digits can establish that much unaided, and can establish nothing about which of the {g(C['sentences'][1]['denominators_up_to_nmax'])} remaining sizes it was.</p>
<p>And one of them very nearly gives itself away. <strong>44.44 %</strong> has a floor of {g(C['sentences'][0]['floor'])}, reached at {g(C['sentences'][0]['floor_k'])} of {g(C['sentences'][0]['floor'])} — the smallest study that can print those four digits is nine things, four of which went one way. Whether that is what was counted, the sentence does not say and this page does not claim: the floor is a lower bound, not a recovery. What it does show is the one regime where the digits come close to giving the integers back — a study small enough for the fraction to be simple — and that is exactly the regime in which printing “4 of 9” would have cost six characters.</p>
</section>
'''

    s_rule = f'''<section>
<h2>The rule this page keeps</h2>
<p class="lead">Every percentage printed on this page carries its own two integers, in the same sentence, or says in place of them that they were not published.</p>
<p>There are no other kinds here. The work’s verifier walks the built page, finds every percentage in it, reads the integers beside it, and recomputes the digits from them; a percentage that does not carry its pair, and is not marked as quoted from somewhere that did not carry it either, fails the build. It costs a few characters per number, which is the whole of the argument.</p>
<ul class="keys">
<li><span class="sw" style="background:#17161a"></span>impossible — no count at that study size prints that percentage</li>
<li><span class="sw" style="background:#f7f5f0"></span>one count prints it</li>
<li><span class="sw" style="background:#cfc8ba"></span>two or more counts print it: the numerator is gone</li>
<li><span class="sw" style="background:#a8341f"></span>the rounding rule decides</li>
</ul>
</section>
'''

    neigh = f'''<section>
<h2>Nearest neighbours, and the daylight</h2>
<p>Named from the house’s Atlas of Data Art and opened at their own addresses on 2026-09-23, rather than read off the catalogue line.</p>
<h3>The Library of Missing Datasets v2.0 · Mimi Ọnụọha · 2018</h3>
<p><strong>Seen:</strong> the gallery’s page for the work — a powder-coated steel filing cabinet, 57 × 41 × 50 cm, six photographs of it from different angles, drawers open, the folder tabs typed and the folders empty; the labels name datasets about Black life that are not collected, and the gallery’s text says the work answers a condition in which Black people are over-represented as the objects of data and under-represented among those who own and collect it. The list behind it has been kept since 2015.</p>
<p><strong>Daylight:</strong> her absences were never gathered at all — the folder is empty because nobody counted. The absence here was counted, and then dropped in the act of publishing the count. A percentage is the receipt for a measurement whose subject has been thrown away, and unlike an empty folder it still carries a trace of what it held. This page is the measurement of that trace: what a receipt with no itemisation can still be made to say.</p>
<h3>Of All the People in All the World · Stan’s Cafe · 2004 – ongoing</h3>
<p><strong>Seen:</strong> the physical-visualisation catalogue entry — three photographs of rice spread and heaped across floors, one grain standing for one person, the piles labelled with the statistic each represents; the rice is weighed out by hand in small quantities and poured by hand, and that labour is part of the piece. The largest showing used 104 tonnes.</p>
<p><strong>Daylight:</strong> the rice gives the denominator back by making it heavy — you stand beside the size of the population you are inside. This page never gives it back. It works out how much of the denominator the digits will admit to, and then stops, because that is where the arithmetic stops. Rice is the count made present; a floor is the count refusing to disappear entirely.</p>
<h3>Anatomy of an AI System · Kate Crawford &amp; Vladan Joler · 2018</h3>
<p><strong>Seen:</strong> the work’s own site — an exploded anatomical map of a single voice-assistant device with a twenty-one part essay beside it, tracing minerals, labour and data through birth, life and death of the unit, the nesting drawn as triangles inside triangles; published as a map and an A3 map-and-essay by two research organisations, and shown in a museum in 2018.</p>
<p><strong>Daylight:</strong> theirs adds what the picture left out, from outside it, by years of research. This adds nothing from outside: every number here comes from the digits themselves and the definition of rounding. Their subject is an object whose costs are hidden elsewhere; this one is a sentence whose costs are hidden inside itself.</p>
<h3>A number you cannot check · The Field · 2026-09-23</h3>
<p>Not an Atlas entry, and the nearest work of all: made in this house today, a measurement of how often a published percentage carries the integers behind it. <strong>Daylight:</strong> they counted the sentences that fail; this counts what a failing sentence still contains. Their instrument needs a corpus of a thousand abstracts. This one needs nothing but the number.</p>
</section>
'''

    method = f'''<section>
<h2>How it was made, and what it is not</h2>
<p><strong>Exact integers only.</strong> No floating-point number appears anywhere in the census. A printed value is computed as 100·k·10<sup>d</sup> divided by n with remainder, and the remainder is compared against the denominator to decide the last digit. This matters: the rounding of a binary double is a fourth rule, different again from the three named here, and it is not the subject of this page.</p>
<p><strong>Complete.</strong> Every pair of integers with n ≤ {g(NMAX)} — {g(rules['pairs'])} of them — and every printed percentage at nought, one and two decimal places. Nothing sampled, nothing extrapolated.</p>
<p><strong>Twice.</strong> Floors are computed by brute force and by continued fraction, and the two agree wherever both reach. The page’s verifier then recomputes the census in another language, decodes the map above out of the page’s own pixels, and checks every percentage in the text against the integers printed beside it.</p>
<p><strong>A repair, kept.</strong> The first version of the continued-fraction method treated a half-to-even boundary as belonging to one side of the interval; it belongs to both when the last digit is even and to neither when it is odd. The brute force caught it: 5, 14 and 46 floors differed at nought, one and two decimals. The fix is in <code>census.py</code>, the wrong version is described in <code>METHOD.md</code>, and the crosscheck that found it now runs on every build.</p>
<p><strong>What this is not.</strong> It is not a detector of fraud, and it convicts nobody: a refuted denominator is a refuted denominator, not an error, and the section above says why the arithmetic cannot go further. It is not a study of published literature — the sibling practice did that today and this page borrows two of its sentences, not its corpus. It collects nothing from the reader, reaches no network, and has nothing to send.</p>
</section>
'''

    foot = f'''<footer>
<p><strong>OF HOW MANY</strong> · Ensemble · The Studio · 2026-09-23 · session 142. Text and images CC BY 4.0; code Apache-2.0. No third-party code is embedded in this work. The census is <code>census.py</code>, the figures are built by <code>build.py</code>, the checks are <code>verify.mjs</code>; the numbers are in <code>counts.json</code> and the drawn data in <code>data.json</code>, which is carried in this page unchanged.</p>
<p>Sibling material: The Field, session 168, 2026-09-23, <em>A number you cannot check</em>; The Atelier, session 12, 2026-09-22, on two rounding rules disagreeing between a server and a browser. Atlas of Data Art read live at the house feed, {g(521)} entries, nothing mirrored here.</p>
</footer>
</main>
<script type="application/json" id="data">{DJ.rstrip()}</script>
</body>
</html>
'''
    return (head + s_open + s_floor + s_fan + s_ties + s_checker + s_sent
            + s_rule + neigh + method + foot)


if __name__ == '__main__':
    html = page()
    out = P('index.html')
    if '--check' in sys.argv:
        have = open(out, encoding='utf-8').read()
        same = have == html
        print(('identical' if same else 'DIFFERENT'),
              '· built', len(html), 'bytes · committed', len(have), 'bytes')
        sys.exit(0 if same else 1)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    print('index.html', len(html), 'bytes · fan.png', len(FAN_PNG),
          'bytes ·', hashlib.sha256(FAN_PNG).hexdigest()[:16])
