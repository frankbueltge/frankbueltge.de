"""THE NEARER ONE — the page.

Renders index.html from data.json and counts.json. Nothing is fetched, nothing
is computed here that the census did not already decide: this file lays out
numbers, it does not make them.

    python3 build.py            # write index.html
    python3 build.py --check    # rebuild and compare, byte for byte
"""
import json
import sys
from string import Template

D = json.load(open("data.json"))
X = json.load(open("crosscheck.json"))
C = json.load(open("counts.json"))

HEX = D["palette"]["hex"]
RGB = D["palette"]["rgb"]
MEAS = [m["key"] for m in D["measures"]]
LABEL = {m["key"]: m["label"] for m in D["measures"]}
SHORT = {"rgb": "sRGB", "cie76": "CIE76", "cie94": "CIE94", "cmc": "CMC", "de2000": "ΔE00"}
YEAR = {"rgb": "no year", "cie76": "1976", "cie94": "1995", "cmc": "1984", "de2000": "2001"}
GLOSS = {
    "rgb": "straight-line distance between two triples of numbers a display "
           "happens to take. Nobody standardised it; it is what a program does "
           "when nobody decided what it should do.",
    "cie76": "straight-line distance in CIELAB, the space built so that equal "
             "steps would look like equal steps. The first admission that the "
             "numbers above are not colours.",
    "cie94": "CIELAB again, with the lightness, chroma and hue parts weighted "
             "by the chroma of the reference colour — which is why it has "
             "to be told which of the two colours that is.",
    "cmc": "the textile industry's formula, weights built from the reference's "
           "lightness, chroma and hue angle. Also has to be told.",
    "de2000": "the current recommendation: five corrections to CIE76, "
              "including a term that rotates hue against chroma in the blues.",
}
T = C["triples"]


def n(x):
    """A number a reader can count, with a narrow space every three digits."""
    return "{:,}".format(x).replace(",", "&#8239;")


def pc(x, of=None, dp=2):
    of = T if of is None else of
    return ("{:." + str(dp) + "f}").format(100.0 * x / of) + "&#8201;%"


def chip(i, cls="chip", title=None, style=""):
    t = ' title="%s"' % title if title else ""
    return '<span class="%s" style="background:%s;%s"%s></span>' % (cls, HEX[i], style, t)


def swatchname(i):
    return HEX[i]


# ---------------------------------------------------------------- the grids

CELL, GAP, BGAP = 26, 2, 14


def grid_svg(values=None, maxv=None, ident=""):
    """The 216 colours in their own order: six blocks, one per red level;
    inside a block, green down and blue across. If values are given, each
    colour is drawn as a square whose AREA is that value's share of the
    largest — the picture is made of the palette either way."""
    bw = 6 * CELL + 5 * GAP
    W = 3 * bw + 2 * BGAP
    H = 2 * (bw + 24) + BGAP
    out = ['<svg class="grid" viewBox="0 0 %d %d" width="%d" height="%d" role="img" aria-label="the 216 colours of the web-safe palette">' % (W, H, W, H)]
    for r in range(6):
        bx = (r % 3) * (bw + BGAP)
        by = (r // 3) * (bw + 24 + BGAP)
        out.append('<text class="glab" x="%d" y="%d">R %02X</text>' % (bx, by + 10, r * 51))
        for g in range(6):
            for b in range(6):
                i = 36 * r + 6 * g + b
                x = bx + b * (CELL + GAP)
                y = by + 16 + g * (CELL + GAP)
                if values is None:
                    out.append('<rect x="%d" y="%d" width="%d" height="%d" class="c%d"/>' % (x, y, CELL, CELL, i))
                else:
                    s = CELL * ((values[i] / maxv) ** 0.5)
                    o = (CELL - s) / 2.0
                    out.append('<rect x="%.1f" y="%.1f" width="%d" height="%d" class="frame"/>'
                               '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" class="c%d"/>'
                               % (x + .5, y + .5, CELL - 1, CELL - 1,
                                  x + o, y + o, s, s, i))
    out.append("</svg>")
    return "".join(out)


def strip_svg(order, ref):
    w, h = 4, 26
    out = ['<svg viewBox="0 0 %d %d" width="%d" height="%d" preserveAspectRatio="none" role="img" aria-label="the other 215 colours, nearest first">' % (len(order) * w, h, len(order) * w, h)]
    for k, i in enumerate(order):
        out.append('<rect x="%d" y="0" width="%d" height="%d" class="c%d"/>' % (k * w, w, h, i))
    out.append("</svg>")
    return "".join(out)


# -------------------------------------------------------------------- pieces

def five_table():
    rows = []
    for m in MEAS:
        sym = "both ways alike" if [x for x in D["measures"] if x["key"] == m][0]["symmetric"] \
              else "needs a reference"
        rows.append(
            '<tr><th scope="row"><span class="tag t-%s">%s</span></th>'
            '<td class="yr">%s</td><td>%s</td><td class="sym">%s</td></tr>'
            % (m, LABEL[m], YEAR[m], GLOSS[m], sym))
    return ('<table class="five"><thead><tr><th scope="col">the formula</th>'
            '<th scope="col">put out</th><th scope="col">what it measures</th>'
            '<th scope="col">order of the two colours</th></tr></thead><tbody>'
            + "".join(rows) + "</tbody></table>")


def votes_html(outs):
    cells = []
    for k, m in enumerate(MEAS):
        o = outs[k]
        mark = "A" if o == 0 else ("B" if o == 1 else "—")
        cls = "v v%d" % o
        cells.append('<span class="%s"><b>%s</b>%s</span>' % (cls, SHORT[m], mark))
    return '<span class="votes">' + "".join(cells) + "</span>"


def eye_wall():
    rows = []
    for k, e in enumerate(D["eye"]):
        c = e["case"]
        mins = " + ".join(SHORT[m] for m in e["minority"])
        if c is None:
            rows.append('<li class="case none"><div class="hd"><span class="coal">%s</span>'
                        '<span class="cnt">never happens</span></div></li>' % mins)
            continue
        r, a, b = c["ref"], c["a"], c["b"], 
        rows.append(
            '<li class="case" data-k="%d">'
            '<div class="hd"><span class="coal">%s</span>'
            '<span class="cnt">%s of the %s divisions are this one</span>'
            '<span class="rt">loudest case: one of the five makes it %.1f&#215; nearer</span></div>'
            '<div class="tri">'
            '<figure class="ref"><span class="chip big" style="background:%s"></span>'
            '<figcaption>nearer to this<br><code>%s</code></figcaption></figure>'
            '<div class="cands">'
            '<button class="cand" data-side="0" type="button">'
            '<span class="chip big" style="background:%s"></span><code>A %s</code></button>'
            '<button class="cand" data-side="1" type="button">'
            '<span class="chip big" style="background:%s"></span><code>B %s</code></button>'
            '</div>%s</div></li>'
            % (k, mins, n(e["count"]), n(C["coalition_total"]), c["ratio"],
               HEX[r], swatchname(r), HEX[a], swatchname(a), HEX[b], swatchname(b),
               votes_html(c["outcomes"])))
    return '<ol class="wall">' + "".join(rows) + "</ol>"


def bucket_table():
    e = C["ratio_edges"]
    names = ["under 1.01&#215;"] + ["%.2f&#215; and over" % x for x in e]
    names[-1] = "3&#215; and over"
    rows = []
    for i in range(len(names)):
        tot, con = C["bucket_total"][i], C["bucket_contra"][i]
        rows.append('<tr><th scope="row">%s</th><td>%s</td><td>%s</td><td>%s</td></tr>'
                    % (names[i], n(tot), n(con), pc(con, tot, 1)))
    return ('<table class="num"><caption>Every triple, sorted by how sure the surest of the '
            'five is — the largest ratio any formula puts between the two candidates. '
            'Even where one of them is certain by a factor of three, another names the other '
            'colour.</caption><thead><tr><th scope="col">the surest formula says</th>'
            '<th scope="col">triples</th><th scope="col">contradicted</th>'
            '<th scope="col">share</th></tr></thead><tbody>' + "".join(rows) + "</tbody></table>")


def matrix_table():
    head = "".join('<th scope="col">%s</th>' % SHORT[m] for m in MEAS)
    rows = []
    for m in MEAS:
        cells = []
        for q in MEAS:
            if m == q:
                cells.append('<td class="self">—</td>')
            else:
                v = C["pair_disagree"][m][q]
                cells.append('<td>%s<small>%s</small></td>' % (n(v), pc(v, T, 1)))
        rows.append('<tr><th scope="row">%s</th>%s</tr>' % (SHORT[m], "".join(cells)))
    return ('<table class="num mx"><caption>How often two of them name opposite colours, '
            'over all %s triples.</caption><thead><tr><td></td>%s</tr></thead><tbody>%s</tbody></table>'
            % (n(T), head, "".join(rows)))


def triangle_block():
    rows = []
    for m in MEAS:
        t = D["triangle"][m]
        real = t["beyond_rounding"]
        if real == 0:
            verdict = ('<td class="ok">none</td><td class="note">%s found by strict comparison, '
                       'every one of them smaller than %.0e — three colours on a straight '
                       'line, where the inequality is an equality the machine cannot store. '
                       'This one is a distance.</td>' % (n(t["violations"]), t["max_absolute_gap"]))
        else:
            w = t["worst"][0]
            verdict = ('<td class="bad">%s</td><td class="note">worst: <code>%s</code> to '
                       '<code>%s</code> measures %.1f direct, and %.1f by way of <code>%s</code> '
                       '— the detour is %.0f&#8201;%% shorter.</td>'
                       % (n(real), HEX[w["a"]], HEX[w["c"]], w["direct"], w["via"], HEX[w["b"]],
                          100.0 * (1.0 - w["via"] / w["direct"])))
        rows.append('<tr><th scope="row">%s</th>%s</tr>' % (LABEL[m], verdict))
    return ('<table class="num tri"><caption>Of the %s ordered triples of distinct colours, '
            'how many have a detour shorter than the direct route.</caption><thead><tr>'
            '<th scope="col">the formula</th><th scope="col">detours that beat the direct route</th>'
            '<th scope="col"></th></tr></thead><tbody>%s</tbody></table>'
            % (n(C["ordered_triples"]), "".join(rows)))


def asym_block():
    rows = []
    for m in MEAS:
        a = D["asymmetry"][m]
        f = D["flips"][m]
        if a["pairs"] == 0:
            rows.append('<tr><th scope="row">%s</th><td class="ok">none of %s</td>'
                        '<td class="ok">none</td><td class="note">the two colours are equals.</td></tr>'
                        % (LABEL[m], n(C["pairs"])))
        else:
            w = a["worst"][0]
            rows.append('<tr><th scope="row">%s</th><td class="bad">%s of %s</td>'
                        '<td class="bad">%s<small>%s</small></td>'
                        '<td class="note">worst: <code>%s</code> and <code>%s</code> are '
                        '%.1f apart measured from the first and %.1f from the second, '
                        '%.1f&#215; as far.</td></tr>'
                        % (LABEL[m], n(a["pairs"]), n(C["pairs"]), n(f["flips"]),
                           pc(f["flips"], T, 1), HEX[w["i"]], HEX[w["j"]],
                           w["ij"], w["ji"], w["rel"]))
    return ('<table class="num asy"><caption>Measured, not assumed: the three symmetric '
            'formulas were put through the same swap and moved nothing.</caption>'
            '<thead><tr><th scope="col">the formula</th><th scope="col">pairs where '
            'd(a,b) ≠ d(b,a)</th><th scope="col">triples that change answer</th>'
            '<th scope="col"></th></tr></thead><tbody>%s</tbody></table>' % "".join(rows))


def orders_block():
    refs = D["orderings"]
    radios, panes, labels = [], [], []
    for k, o in enumerate(refs):
        r = o["ref"]
        radios.append('<input type="radio" name="refpick" id="rp%d" class="rp"%s>'
                      % (k, " checked" if k == 0 else ""))
        labels.append('<label for="rp%d" class="rplab"><span class="chip" style="background:%s">'
                      '</span><code>%s</code></label>' % (k, HEX[r], HEX[r]))
        rows = []
        for m in MEAS:
            rows.append('<div class="orow"><span class="olab">%s</span>%s</div>'
                        % (LABEL[m], strip_svg(o["orders"][m], r)))
        share = C["per_reference_contradicted"][r] / float(C["per_reference_pairs"])
        panes.append('<div class="pane p%d"><p class="panehead">The other 215 colours, '
                     'nearest first, five times over. About <code>%s</code> the five '
                     'contradict each other on %s of its %s pairs.</p>%s</div>'
                     % (k, HEX[r], pc(C["per_reference_contradicted"][r], C["per_reference_pairs"], 1),
                        n(C["per_reference_pairs"]), "".join(rows)))
    return ('<div class="orders">' + "".join(radios) +
            '<div class="rplabs">' + "".join(labels) + '</div>' +
            "".join(panes) + '</div>')


def css_classes():
    return "".join(".c%d{fill:%s}" % (i, HEX[i]) for i in range(len(HEX)))


# ------------------------------------------------------------------ the page

def page():
    most = max(range(216), key=lambda i: C["per_reference_contradicted"][i])
    least = min(range(216), key=lambda i: C["per_reference_contradicted"][i])
    prc = C["per_reference_contradicted"]
    grid_rate = grid_svg(prc, max(prc))
    loud = D["loudest"][0]

    TOP15 = "".join(
        '<tr><th scope="row">%s</th><td>%s</td><td>%s</td></tr>'
        % (" + ".join(SHORT[m] for m in e["minority"]), n(e["count"]),
           pc(e["count"], C["coalition_total"], 1))
        for e in D["eye"])

    alone = C["alone_against_four"]
    alone_rows = "".join(
        '<tr><th scope="row">%s</th><td>%s</td><td>%s</td></tr>'
        % (LABEL[m], n(alone[m]), pc(alone[m], T, 1)) for m in
        sorted(MEAS, key=lambda m: -alone[m]))

    return Template(HTML).substitute(
        css=CSS + css_classes(),
        n_triples=n(T), n_pal=n(C["palette_size"]), n_pairs=n(C["pairs"]),
        n_pairs_ref=n(C["per_reference_pairs"]),
        unan=n(C["unanimous"]), unan_pc=pc(C["unanimous"]),
        contra=n(C["contradicted"]), contra_pc=pc(C["contradicted"]),
        abst=n(C["abstained_only"]), abst_pc=pc(C["abstained_only"]),
        ties=n(C["ties"]["rgb"]), ties_pc=pc(C["ties"]["rgb"], T, 1),
        five=five_table(), grid=grid_svg(), grid_rate=grid_rate,
        wall=eye_wall(), buckets=bucket_table(), matrix=matrix_table(),
        triangle=triangle_block(), asym=asym_block(), orders=orders_block(),
        most=HEX[most], most_pc=pc(prc[most], C["per_reference_pairs"], 1),
        least=HEX[least], least_pc=pc(prc[least], C["per_reference_pairs"], 1),
        loud_ref=HEX[loud["ref"]], loud_a=HEX[loud["a"]], loud_b=HEX[loud["b"]],
        loud_ratio="%.1f" % loud["ratio"],
        coal_total=n(C["coalition_total"]), top15=TOP15, alone_rows=alone_rows,
        de2000_tri=n(C["triangle_beyond_rounding"]["de2000"]),
        cmc_tri=n(C["triangle_beyond_rounding"]["cmc"]),
        cie94_tri=n(C["triangle_beyond_rounding"]["cie94"]),
        cmc_flip=n(C["role_flips"]["cmc"]), cmc_flip_pc=pc(C["role_flips"]["cmc"], T, 1),
        cie94_flip=n(C["role_flips"]["cie94"]), cie94_flip_pc=pc(C["role_flips"]["cie94"], T, 1),
        ledger=C["ledger_sha256"], ledger_bytes=n(C["ledger_bytes"]),
        n_ordered=n(C["ordered_triples"]),
        x_rgb=n(X["triangle_strict"]["rgb"]), x_cie76=n(X["triangle_strict"]["cie76"]),
        cie76_strict=n(C["triangle_violations"]["cie76"]),
        real_total=n(sum(C["triangle_beyond_rounding"].values())),
    )


CSS = open("page.css").read()
HTML = open("page.html.tmpl").read()


def main():
    out = page()
    if "--check" in sys.argv:
        old = open("index.html", encoding="utf-8").read()
        print("identical" if old == out else "DIFFERENT")
        sys.exit(0 if old == out else 1)
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(out)
    print("index.html  %d bytes" % len(out.encode("utf-8")))


if __name__ == "__main__":
    main()
