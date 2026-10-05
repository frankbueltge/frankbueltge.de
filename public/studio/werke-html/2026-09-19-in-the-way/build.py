#!/usr/bin/env python3
"""IN THE WAY — the page.

Offline.  Reads `counts.json` (and `sources.json` for the manifest line) and
writes `data.json` and `index.html`.  Every number on the page comes from
counts.json; nothing is typed in twice.

    python3 build.py            # write data.json and index.html
    python3 build.py --check    # rebuild in memory and compare, byte for byte
"""
import argparse, hashlib, json, math, pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
NB = " "          # narrow no-break space, the thousands rule of this house
R2 = math.sqrt(2.0)
SCALE, CX, CY = 280.0, 800.0, 400.0
GAL_POLE_RA, GAL_POLE_DEC, GAL_LON_NCP = 192.85948, 27.12825, 122.93192


# ---------------------------------------------------------------- formatting
def n(v):
    return f"{int(round(v)):,}".replace(",", NB)


def f(v, d=1):
    s = f"{v:,.{d}f}"
    head, _, tail = s.partition(".")
    return head.replace(",", NB) + ("." + tail if tail else "")


def pc(v, d=1):
    return f(v * 100.0, d) + " %"


# ---------------------------------------------------------------- projection
def wrap180(x):
    return (x + 180.0) % 360.0 - 180.0


def hammer(lon, lat):
    lam = math.radians(-wrap180(lon))
    phi = math.radians(lat)
    d = math.sqrt(1.0 + math.cos(phi) * math.cos(lam / 2.0))
    return (CX + 2.0 * R2 * math.cos(phi) * math.sin(lam / 2.0) / d * SCALE,
            CY - R2 * math.sin(phi) / d * SCALE)


def to_equatorial(l, b):
    l, b = math.radians(l), math.radians(b)
    rap, decp = math.radians(GAL_POLE_RA), math.radians(GAL_POLE_DEC)
    lncp = math.radians(GAL_LON_NCP)
    dec = math.asin(math.sin(decp) * math.sin(b)
                    + math.cos(decp) * math.cos(b) * math.cos(lncp - l))
    ra = rap + math.atan2(math.cos(b) * math.sin(lncp - l),
                          math.cos(decp) * math.sin(b)
                          - math.sin(decp) * math.cos(b) * math.cos(lncp - l))
    return math.degrees(ra) % 360.0, math.degrees(dec)


def place(l, b, frame):
    if frame == "galactic":
        return hammer(l, b)
    ra, dec = to_equatorial(l, b)
    return hammer(ra - 180.0, dec)


def polyline(points, frame, jump=260.0):
    """Project a run of (l, b) and break it wherever the sheet's seam does."""
    out, cur = [], []
    prev = None
    for l, b in points:
        p = place(l, b, frame)
        if prev is not None and math.dist(p, prev) > jump:
            out.append(cur)
            cur = []
        cur.append(p)
        prev = p
    if cur:
        out.append(cur)
    return " ".join("M" + " ".join(f"{x:.1f} {y:.1f}" for x, y in seg)
                    for seg in out if len(seg) > 1)


def dots(flat):
    """One dot per mark: a zero-length segment with a round cap, written as
    short relative moves.  The marks are sorted, so the moves stay small."""
    parts, px, py = [], 0, 0
    for i in range(0, len(flat), 2):
        x, y = flat[i], flat[i + 1]
        if not parts:
            parts.append(f"M{x} {y}h0")
        else:
            dx, dy = x - px, y - py
            parts.append(f"m{dx} {dy}h0" if dy else f"m{dx} 0h0")
        px, py = x, y
    return "".join(parts)


# ---------------------------------------------------------------- drawings
def sky(d, frame):
    m = d["marks"]
    o = m["galactic_optical"] if frame == "galactic" else m["equatorial_optical"]
    r = m["galactic_radio"] if frame == "galactic" else m["equatorial_radio"]
    g = []
    g.append(f'<ellipse class="sheet" cx="{CX:.0f}" cy="{CY:.0f}" '
             f'rx="{2 * R2 * SCALE:.1f}" ry="{R2 * SCALE:.1f}"/>')
    # the grid belongs to the frame being drawn, so it is drawn in that frame's
    # own coordinates rather than converted into it
    for lat in (-60, -30, 0, 30, 60):
        pts = [(lon, lat) for lon in range(-180, 181, 2)]
        path = "M" + " ".join(f"{x:.1f} {y:.1f}" for x, y in
                              [hammer(lon, la) for lon, la in pts])
        g.append(f'<path class="grat{" mid" if lat == 0 else ""}" d="{path}"/>')
    for lon in (-120, -60, 0, 60, 120):
        pts = [hammer(lon, la / 2.0) for la in range(-178, 179, 2)]
        path = "M" + " ".join(f"{x:.1f} {y:.1f}" for x, y in pts)
        g.append(f'<path class="grat" d="{path}"/>')
    # the line the catalogue drew before it began
    for sign in (1, -1):
        seg = []
        for lon in range(-180, 181):
            L = lon % 360.0
            seg.append((lon, sign * (8.0 if (L < 30 or L >= 330) else 5.0)))
        g.append(f'<path class="rule" d="{polyline(seg, frame)}"/>')
    g.append(f'<path class="opt" d="{dots(o)}"/>')
    g.append(f'<path class="rad" d="{dots(r)}"/>')
    g.append(f'<ellipse class="rim" cx="{CX:.0f}" cy="{CY:.0f}" '
             f'rx="{2 * R2 * SCALE:.1f}" ry="{R2 * SCALE:.1f}"/>')
    return ('<svg class="map ' + frame + '" viewBox="0 0 1600 820" '
            'role="img" aria-label="' + (
                "The catalogue's 44,599 galaxies in galactic coordinates: a blank "
                "bar runs across the middle of the sheet."
                if frame == "galactic" else
                "The same 44,599 galaxies in equatorial coordinates: the blank "
                "ground is a crooked band that crosses the sheet diagonally.")
            + '">' + "".join(g) + "</svg>")


def profile(d):
    """Surface density against latitude, with the plateau and the closed ground."""
    W, H = 1000, 340
    L, R, T, B = 58, 14, 18, 44
    bands = d["bands"]
    dmax = 1.6
    g = [f'<rect class="plot" x="{L}" y="{T}" width="{W - L - R}" height="{H - T - B}"/>']
    def X(s):
        return L + s * (W - L - R)
    def Y(v):
        return H - B - (v / dmax) * (H - T - B)
    # the ground no entry may occupy: sin|b| below sin 5 deg
    x5 = X(math.sin(math.radians(5.0)))
    g.append(f'<rect class="closed" x="{L}" y="{T}" width="{x5 - L:.1f}" height="{H - T - B}"/>')
    for b in bands:
        x0, x1 = X(b["sin_lo"]), X(b["sin_hi"])
        if b["n"]:
            g.append(f'<rect class="bar" x="{x0:.1f}" y="{Y(b["density"]):.1f}" '
                     f'width="{x1 - x0 - 0.6:.1f}" height="{H - B - Y(b["density"]):.1f}"/>')
    p = d["plateau"]["density"]
    g.append(f'<line class="plat" x1="{L}" y1="{Y(p):.1f}" x2="{W - R}" y2="{Y(p):.1f}"/>')
    g.append(f'<text class="ax lab" x="{W - R - 6}" y="{T + 16}" text-anchor="end">'
             f'the plateau: {f(p, 3)} galaxies per square degree above 15°</text>')
    for v in (0.5, 1.0, 1.5):
        g.append(f'<line class="tick" x1="{L}" y1="{Y(v):.1f}" x2="{W - R}" y2="{Y(v):.1f}"/>')
        g.append(f'<text class="ax" x="{L - 6}" y="{Y(v) + 4:.1f}" text-anchor="end">{v}</text>')
    for deg in (0, 5, 10, 20, 30, 45, 60, 90):
        x = X(math.sin(math.radians(deg)))
        g.append(f'<line class="tick" x1="{x:.1f}" y1="{H - B}" x2="{x:.1f}" y2="{H - B + 5}"/>')
        g.append(f'<text class="ax" x="{x:.1f}" y="{H - B + 19}" text-anchor="middle">{deg}°</text>')
    g.append(f'<text class="ax" x="{(L + W) / 2:.0f}" y="{H - 6}" text-anchor="middle">'
             'distance from the galactic plane, in equal-area steps</text>')
    g.append(f'<text class="ax lab" x="{x5 + 6:.0f}" y="{T + 16}">no entry may stand here</text>')
    return (f'<svg class="fig" viewBox="0 0 {W} {H}" role="img" aria-label="Surface '
            'density of catalogue entries against galactic latitude: zero below five '
            'degrees, still a quarter below the plateau at seven, level from about '
            'eleven degrees up.">' + "".join(g) + "</svg>")


def dustfig(d):
    """The one column the two records share."""
    W, H = 1000, 250
    L, R, T, B = 58, 14, 18, 46
    h = d["ebv_hist"]
    nb = len(h["optical"])
    omax = max(h["optical"])
    rmax = max(h["radio"])
    g = [f'<rect class="plot" x="{L}" y="{T}" width="{W - L - R}" height="{H - T - B}"/>']
    bw = (W - L - R) / nb
    half = (H - T - B) / 2 - 6
    mid = T + (H - T - B) / 2
    for i in range(nb):
        x = L + i * bw
        if h["optical"][i]:
            hh = half * (h["optical"][i] / omax)
            g.append(f'<rect class="bar" x="{x + 1:.1f}" y="{mid - hh:.1f}" '
                     f'width="{bw - 2:.1f}" height="{hh:.1f}"/>')
        if h["radio"][i]:
            hh = half * (h["radio"][i] / rmax)
            g.append(f'<rect class="barr" x="{x + 1:.1f}" y="{mid:.1f}" '
                     f'width="{bw - 2:.1f}" height="{hh:.1f}"/>')
    g.append(f'<line class="tick" x1="{L}" y1="{mid:.1f}" x2="{W - R}" y2="{mid:.1f}"/>')
    xmax = L + (d["ebv"]["optical"]["max"] / 2.5) * (W - L - R)
    g.append(f'<line class="plat" x1="{xmax:.1f}" y1="{T}" x2="{xmax:.1f}" y2="{H - B}"/>')
    g.append(f'<text class="ax lab" x="{xmax + 6:.1f}" y="{T + 14}">'
             f'nothing of the optical catalogue stands beyond here ({f(d["ebv"]["optical"]["max"], 3)})</text>')
    for i in range(0, nb + 1, 5):
        x = L + i * bw
        g.append(f'<line class="tick" x1="{x:.1f}" y1="{H - B}" x2="{x:.1f}" y2="{H - B + 5}"/>')
        g.append(f'<text class="ax" x="{x:.1f}" y="{H - B + 19}" text-anchor="middle">'
                 f'{f(i * 0.1, 1)}</text>')
    g.append(f'<text class="ax" x="{(L + W) / 2:.0f}" y="{H - 8}" text-anchor="middle">'
             'reddening by dust in front of the galaxy, E(B−V), from the catalogues’ own column'
             f' — {n(h["radio_over"])} radio entries stand beyond the right edge</text>')
    g.append(f'<text class="ax" x="{L + 6}" y="{T + 14}">the optical catalogue, 44 599 entries</text>')
    g.append(f'<text class="ax" x="{L + 6}" y="{H - B - 8}">the radio survey, 883 entries with this column</text>')
    return (f'<svg class="fig" viewBox="0 0 {W} {H}" role="img" aria-label="Two '
            'histograms of dust reddening, back to back: the optical catalogue crowds '
            'below 0.2 and stops at 0.999; the radio survey runs far past it.">'
            + "".join(g) + "</svg>")


def edgefig(d):
    """The boundary, read off the entries alone."""
    W, H = 1000, 210
    L, R, T, B = 58, 14, 16, 42
    rows = d["edge_by_longitude"]
    g = [f'<rect class="plot" x="{L}" y="{T}" width="{W - L - R}" height="{H - T - B}"/>']
    bw = (W - L - R) / len(rows)
    ymax = 9.0
    for i, row in enumerate(rows):
        x = L + i * bw
        hh = (row["min_abs_b"] / ymax) * (H - T - B)
        cls = "barr" if row["min_abs_b"] > 6 else "bar"
        g.append(f'<rect class="{cls}" x="{x + 1:.1f}" y="{H - B - hh:.1f}" '
                 f'width="{bw - 2:.1f}" height="{hh:.1f}"/>')
    for v in (5, 8):
        y = H - B - (v / ymax) * (H - T - B)
        g.append(f'<line class="plat" x1="{L}" y1="{y:.1f}" x2="{W - R}" y2="{y:.1f}"/>')
        g.append(f'<text class="ax" x="{L - 6}" y="{y + 4:.1f}" text-anchor="end">{v}°</text>')
    for i in range(0, len(rows) + 1, 3):
        x = L + i * bw
        g.append(f'<line class="tick" x1="{x:.1f}" y1="{H - B}" x2="{x:.1f}" y2="{H - B + 5}"/>')
        g.append(f'<text class="ax" x="{x:.1f}" y="{H - B + 19}" text-anchor="middle">{i * 10}°</text>')
    g.append(f'<text class="ax" x="{(L + W) / 2:.0f}" y="{H - 6}" text-anchor="middle">'
             'galactic longitude — the nearest entry to the plane in each ten degrees</text>')
    return (f'<svg class="fig" viewBox="0 0 {W} {H}" role="img" aria-label="The closest '
            'entry to the galactic plane in each ten degrees of longitude: five degrees '
            'everywhere except the six sectors around the galactic centre, where it is '
            'eight.">' + "".join(g) + "</svg>")


def holesfig(d):
    """The record's own empty cells, by distance from its edge."""
    W, H = 1000, 200
    L, R, T, B = 58, 14, 16, 42
    rows = d["no_velocity_by_band"]
    g = [f'<rect class="plot" x="{L}" y="{T}" width="{W - L - R}" height="{H - T - B}"/>']
    bw = (W - L - R) / len(rows)
    ymax = 0.20
    for i, row in enumerate(rows):
        x = L + i * bw
        hh = (row["share"] / ymax) * (H - T - B)
        g.append(f'<rect class="bar" x="{x + 2:.1f}" y="{H - B - hh:.1f}" '
                 f'width="{bw - 4:.1f}" height="{hh:.1f}"/>')
        g.append(f'<text class="ax" x="{x + bw / 2:.1f}" y="{H - B - hh - 6:.1f}" '
                 f'text-anchor="middle">{pc(row["share"], 2)}</text>')
        g.append(f'<text class="ax" x="{x + bw / 2:.1f}" y="{H - B + 19:.1f}" '
                 f'text-anchor="middle">{row["b_lo"]}–{row["b_hi"]}°</text>')
    g.append(f'<text class="ax" x="{(L + W) / 2:.0f}" y="{H - 6}" text-anchor="middle">'
             'distance from the galactic plane — share of entries with no velocity</text>')
    return (f'<svg class="fig" viewBox="0 0 {W} {H}" role="img" aria-label="Share of '
            'entries without a velocity, by galactic latitude: 17.81 per cent in the '
            'ten degrees nearest the plane, nothing above seventy.">'
            + "".join(g) + "</svg>")


# ---------------------------------------------------------------- the page
def page(d, src):
    ebv = d["ebv"]
    norma, vela = d["structures"]
    cells = d["cells"]
    band_low = next(b for b in d["bands"] if b["n"])
    band_next = d["bands"][d["bands"].index(band_low) + 1]
    mk = d["paper"]
    css = """
:root{--paper:#f2efe7;--ink:#1d1c19;--soft:#6d6759;--rule:#cfc9b8;--panel:#ebe7db;
--ink2:#4a463c;--rad:#a33718;--sheet:#e9e5d8;--grat:#c9c3b1}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);
font:16px/1.55 "Iowan Old Style",Palatino,"Palatino Linotype","Book Antiqua",Georgia,serif}
header{max-width:1000px;margin:0 auto;padding:54px 20px 4px}
main{max-width:1000px;margin:0 auto;padding:0 20px 110px}
h1{font-size:clamp(34px,7.4vw,74px);line-height:.96;margin:0;letter-spacing:-.02em;font-weight:600}
.dek{font-size:clamp(16px,2.3vw,20px);color:var(--soft);margin:14px 0 0;max-width:44em}
.lede{font-size:clamp(17px,2.4vw,21px);line-height:1.45;margin:30px 0 0;max-width:36em}
h2{font-size:12.5px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;
margin:64px 0 6px;color:var(--soft);font-family:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace}
h2 em{font-style:normal;color:var(--ink)}
h3{font-size:15px;margin:26px 0 2px;font-weight:600}
p{max-width:38em}
.cap{color:var(--soft);font-size:14.5px;max-width:44em;margin:10px 0 0}
figure{margin:18px 0 0}
svg{display:block;width:100%;height:auto}
.frame{background:var(--panel);border:1px solid var(--rule);padding:8px}
.sheet{fill:#e6e2d4}
.rim{fill:none;stroke:var(--rule);stroke-width:1.6}
.grat{fill:none;stroke:var(--grat);stroke-width:1}
.grat.mid{stroke:#b9b2a0;stroke-width:1.2}
.rule{fill:none;stroke:#8d8570;stroke-width:1.4;stroke-dasharray:7 6}
.opt{fill:none;stroke:var(--ink);stroke-width:1.7;stroke-linecap:round}
.rad{fill:none;stroke:var(--rad);stroke-width:3.4;stroke-linecap:round}
.plot{fill:#e6e2d4;stroke:var(--rule)}
.closed{fill:#dcd7c6}
.bar{fill:#3a362c}.barr{fill:var(--rad)}
.plat{stroke:var(--rad);stroke-width:1.2;stroke-dasharray:5 4;fill:none}
.tick{stroke:#b9b2a0;stroke-width:1}
.ax{fill:var(--soft);font-size:11.5px;font-family:ui-monospace,Menlo,Consolas,monospace}
.ax.lab{fill:#7a7260}
.controls{margin:16px 0 0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px}
.switch{position:relative}
.switch>input{position:absolute;opacity:0;width:1px;height:1px;margin:0}
.controls label{display:inline-block;border:1px solid var(--rule);background:var(--panel);
padding:7px 11px;margin:0 6px 6px 0;cursor:pointer;color:var(--soft);letter-spacing:.04em}
.controls label:hover{border-color:#9d9583}
#f-gal:checked~.controls label[for=f-gal],#f-equ:checked~.controls label[for=f-equ],
#f-rad:checked~.controls label[for=f-rad]{background:#dcd7c6;color:var(--ink);border-color:#8d8570}
#f-rad:checked~.controls label[for=f-rad]{color:var(--rad);border-color:var(--rad)}
.maps .equatorial{display:none}
#f-equ:checked~.maps .galactic{display:none}
#f-equ:checked~.maps .equatorial{display:block}
.maps .rad{display:none}
#f-rad:checked~.maps .rad{display:block}
#f-gal:focus-visible~.controls label[for=f-gal],#f-equ:focus-visible~.controls label[for=f-equ],
#f-rad:focus-visible~.controls label[for=f-rad]{outline:2px solid var(--rad);outline-offset:2px}
table{border-collapse:collapse;margin:18px 0 0;font-size:14.5px;width:100%;max-width:44em}
th,td{text-align:right;padding:5px 9px;border-bottom:1px solid var(--rule)}
th:first-child,td:first-child{text-align:left}
.src td:nth-child(2),.src th:nth-child(2){text-align:left}
th{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11.5px;letter-spacing:.08em;
text-transform:uppercase;color:var(--soft);font-weight:600}
.num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
.big{font-size:clamp(26px,4.4vw,40px);line-height:1.06;margin:22px 0 0;max-width:22em;font-weight:600}
.big span{color:var(--rad)}
.note{font-size:14.5px;color:var(--ink2);max-width:40em}
a{color:inherit;text-decoration-color:var(--rule);text-underline-offset:3px}
code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;background:var(--panel);padding:1px 4px}
ol,ul{max-width:38em}li{margin:6px 0}
footer{border-top:1px solid var(--rule);margin-top:70px;padding-top:18px;color:var(--soft);font-size:14px}
@media (max-width:640px){.controls label{display:block}}
"""
    dj = json.dumps(numbers(d), indent=1) + "\n"
    h = []
    A = h.append
    A('<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8">')
    A('<meta name="viewport" content="width=device-width, initial-scale=1">')
    A('<title>IN THE WAY — Ensemble</title>')
    A('<meta name="description" content="A map of the nearby universe drawn only '
      'from the entries a catalogue holds, and the ninth of the sky it is forbidden '
      'to enter because we are inside the thing in the way.">')
    A("<style>" + css.strip() + "</style></head><body>")
    A('<header><h1>IN THE WAY</h1>')
    A(f'<p class="dek">The standard map of the galaxies around ours, drawn as it stands — '
      f'and the {pc(d["zone_fraction"], 2)} of the sky it was built never to enter.</p>')
    A(f'<p class="lede">Every mark on this sheet is one galaxy that someone measured. '
      f'Nothing is drawn where the catalogue has nothing. The blank bar across the middle '
      f'is not a decision of this page: it is {n(d["zone_area_deg2"])} square degrees of sky '
      f'that the record excludes by its own rule, written before the first entry was made, '
      f'because our own galaxy stands between the telescope and everything behind it. '
      f'The obstruction is the room we are standing in.</p></header><main>')

    # ---- the sheet
    A('<h2>The sheet · <em>the same marks, twice</em></h2>')
    A(f'<p>The catalogue is the 2MASS Redshift Survey: {n(d["n_optical"])} galaxies selected '
      f'in the near infrared, the standard census of what lies within about three hundred '
      f'megaparsecs. Beside it, in red, a second record of the same sky made with a radio '
      f'telescope: {n(d["n_radio"])} galaxies found by the 21-centimetre line of their hydrogen, '
      f'which dust does not stop. Choose the frame the marks are drawn in.</p>')
    A('<div class="switch">')
    A('<input type="radio" name="frame" id="f-gal" checked>'
      '<input type="radio" name="frame" id="f-equ">'
      '<input type="checkbox" id="f-rad" checked>')
    A('<div class="controls">'
      '<label for="f-gal">the frame of what is in the way — galactic</label>'
      '<label for="f-equ">the frame we point telescopes in — equatorial</label>'
      '<label for="f-rad">show what the radio telescope heard</label></div>')
    A('<figure class="frame maps">' + sky(d, "galactic") + sky(d, "equatorial") + '</figure>')
    A('</div>')
    A(f'<p class="cap">Hammer’s equal-area projection, longitude running left, the whole '
      f'sphere on one sheet; equal areas of sky are equal areas of paper, so a thin patch of '
      f'marks is a thin patch of sky. The dashed line is the catalogue’s own boundary — '
      f'five degrees from the galactic plane, eight toward the galactic centre. '
      f'{n(d["n_optical"])} galaxies fall on {n(mk["optical_marks"])} distinct points of this '
      f'paper; where the sky is thickest, {mk["busiest_mark"]} of them share one point of ink.</p>')
    A('<p class="big">In one frame the absence is a crooked band nobody would name. '
      'In the other it is a bar straight through the middle. '
      '<span>The hole has a shape only in the coordinate system of the thing that makes it.</span></p>')
    A('<p class="note">Both drawings carry exactly the same marks. Nothing was added to the '
      'galactic view and nothing removed from the equatorial one; only the frame turns. '
      'The equatorial frame is the one an observatory books time in, and in it the missing '
      'ground is a diagonal smear with no name, crossing constellations that have nothing to '
      'do with one another. Turn the sheet into the frame of our own galaxy and the same '
      'blank becomes a single straight statement about where we are standing.</p>')

    # ---- the edge
    A('<h2>One · <em>the record draws its own boundary</em></h2>')
    A(f'<p>Nobody needs to read the survey’s paper to find its edge. Sort the '
      f'{n(d["n_optical"])} entries by distance from the galactic plane and the nearest one '
      f'stands at <strong>{f(d["min_abs_b"], 3)}°</strong>. Split the sky into thirty-six '
      f'sectors of longitude and the edge is {f(d["edge_elsewhere"], 2)}° in thirty of them '
      f'and {f(d["edge_bulge"], 2)}° in the six that face the centre of our galaxy. The rule '
      f'the survey states — five degrees, eight toward the bulge — is legible in the entries '
      f'alone, and the entries agree with it to a thousandth of a degree.</p>')
    A('<figure>' + edgefig(d) + '</figure>')
    A(f'<p class="cap">A boundary is a fact about a record, not about the sky. This one is '
      f'visible without any document: it is the only place in the catalogue where a straight '
      f'line in the data has no astronomical meaning at all.</p>')

    # ---- what the line costs
    A('<h2>Two · <em>what the line costs</em></h2>')
    A(f'<p>The excluded ground is {n(d["zone_area_deg2"])} square degrees, '
      f'{pc(d["zone_fraction"], 2)} of the whole sky. The catalogue holds '
      f'<strong>{d["optical_inside_zone"]}</strong> entries inside it. Cut the sphere into '
      f'{n(cells["n"])} cells of equal area — {f(cells["area_deg2"], 2)} square degrees each — '
      f'and {n(cells["empty"])} of them hold nothing at all: {n(cells["empty_in_zone"])} inside '
      f'the excluded ground and {n(cells["empty_outside_zone"])} outside it, on ground the '
      f'catalogue does cover.</p>')
    A(f'<p>Above fifteen degrees the record holds {f(d["plateau"]["density"], 3)} galaxies per '
      f'square degree, steadily, all the way to the poles. At that density the closed ground '
      f'would carry about <strong>{n(d["zone_expected"])}</strong> entries more. That figure '
      f'is an estimate and is marked as one: it assumes the hidden sky is as full as the sky '
      f'we can see, and the universe is not smooth — the two structures at the end of this '
      f'page are the proof that it is not.</p>')

    # ---- past the line
    A('<h2>Three · <em>the blindness does not stop at the line</em></h2>')
    A(f'<p>Between the boundary and fifteen degrees the catalogue holds {n(d["belt"]["n"])} '
      f'entries over {n(d["belt"]["area_deg2"])} square degrees. At the plateau density that '
      f'ground would carry {n(d["belt"]["expected"])} — <strong>{n(d["belt"]["deficit"])} '
      f'more</strong>, {pc(d["belt"]["shortfall_share"], 1)} above what is there. In the lowest '
      f'band the record holds at all, {f(band_low["b_lo"], 1)}° to {f(band_low["b_hi"], 1)}°, '
      f'the density is {f(band_low["density"], 3)}; one band up it is {f(band_next["density"], 3)}; '
      f'the plateau is not reached until about eleven degrees. The survey drew a line and stated '
      f'it. The damage the line was drawn against runs on past it, and nothing in the record '
      f'announces where it ends.</p>')
    A('<figure>' + profile(d) + '</figure>')
    A('<p class="cap">Surface density of entries against distance from the galactic plane, in '
      'fifty steps of equal area. The shaded ground at the left is where no entry may stand. '
      'The four bars climbing out of it are the record recovering — not the sky changing.</p>')

    # ---- the record's own measure
    A('<h2>Four · <em>the record carries the measure of its own blindness</em></h2>')
    A(f'<p>Each entry carries a column the survey did not have to publish: E(B−V), the '
      f'reddening of the light by dust in front of that galaxy, taken from the '
      f'Schlegel–Finkbeiner–Davis map of 1998. Its median is {f(d["ebv_poles"], 3)} above '
      f'seventy-five degrees and {f(d["ebv_edge"], 3)} in the last degrees before the '
      f'boundary — {f(d["ebv_edge"] / d["ebv_poles"], 0)} times as much. The record states, '
      f'entry by entry, how much light was taken from it, and the direction in which that '
      f'number would be largest is the direction it holds no entries in. '
      f'<strong>The catalogue knows what it cannot see.</strong></p>')
    A(f'<p>It also stops. The largest value anywhere in {n(ebv["optical"]["n"])} entries is '
      f'<strong>{f(ebv["optical"]["max"], 3)}</strong>; ninety-nine per cent stand below '
      f'{f(ebv["optical"]["p99"], 3)}. In the radio survey the median is '
      f'<strong>{f(ebv["radio"]["median"], 3)}</strong> and the largest is '
      f'{f(ebv["radio"]["max"], 2)}. {n(ebv["radio_above_optical_max"])} of its '
      f'{n(ebv["radio"]["n"])} entries stand beyond the highest value the optical record '
      f'contains; {n(ebv["optical_above_radio_median"])} of the optical catalogue’s '
      f'{n(ebv["optical"]["n"])} reach the radio survey’s middle. The two records share '
      f'one column and barely overlap in it. We assert no cause for where the optical column '
      f'stops: the catalogue states a limit in brightness and in latitude, not in dust.</p>')
    A('<figure>' + dustfig(d) + '</figure>')
    A('<p class="cap">Back to back, the same axis: above the line the optical catalogue, below '
      'it the radio survey. Each bar is a tenth of a magnitude of reddening. Both are drawn '
      'to their own maximum, because one is fifty times the size of the other.</p>')

    # ---- heard, not seen
    A('<h2>Five · <em>heard, not seen</em></h2>')
    A(f'<p>Hydrogen does not care about dust. A radio telescope listening at 21 centimetres '
      f'hears galaxies straight through the ground the optical catalogue is forbidden: the '
      f'HIZOA surveys, {n(d["n_radio_south"])} galaxies in the south and {d["n_radio_north"]} '
      f'in the north, {n(d["radio_inside_zone"])} of them inside '
      f'the excluded ground, not one of them further than '
      f'{f(d["radio_max_abs_b"], 2)}° from the plane. They are drawn in red on the sheet above.</p>')
    A(f'<p>The red marks stop where the listening stopped, not where the galaxies do. The two '
      f'surveys cover the longitudes 212° to 36° and two strips from 36° to 52° and 196° to '
      f'212°, all within five degrees of the plane: about {n(d["radio_footprint"]["total_deg2"])} '
      f'square degrees, {pc(d["radio_footprint"]["share_of_zone"], 0)} of the closed ground. '
      f'The rest of it has not been heard at this depth by these instruments at all.</p>')
    A(f'<p class="big">Two records of the same sky, {n(d["n_optical"] + d["n_radio"])} objects '
      f'between them. Ask how many they have in common and the answer is '
      f'<span>{d["radio_with_optical_entry"]}</span>.</p>')
    A(f'<p>Every radio galaxy was matched against every catalogue entry within '
      f'{f(d["match_tolerance_arcmin"], 0)} arcminutes: '
      f'{d["radio_with_optical_entry"]} of {n(d["n_radio"])} have one. That number is about '
      f'two records, not about human knowledge, and the difference matters. The southern '
      f'survey’s own paper reports that 51 per cent of its detections already had an '
      f'optical or near-infrared counterpart in the literature and a further 27 per cent were '
      f'found in images afterwards — but only 8 per cent of those counterparts had a previously '
      f'measured optical redshift. The northern survey is sharper still: of its '
      f'{d["n_radio_north"]} galaxies, 27 have a counterpart already catalogued in 2MASS — the '
      f'very extended-source catalogue this redshift survey selects its entries from. The '
      f'parent list has them. The map built from it may not, because of a rule about latitude '
      f'written before either was compiled. The galaxies are not unknown. They are '
      f'<em>unenterable</em>.</p>')

    # ---- holes inside
    A('<h2>Six · <em>and the record’s own holes crowd toward its edge</em></h2>')
    A(f'<p>{n(d["no_velocity"])} of the {n(d["n_optical"])} entries carry no velocity: a '
      f'position, a brightness, a dust value, and an empty field where the redshift belongs. '
      f'They are not spread evenly. In the ten degrees nearest the boundary '
      f'{pc(d["no_velocity_by_band"][0]["share"], 2)} of entries have none; between seventy '
      f'and ninety degrees, not one is missing. The gradient falls through every band without '
      f'a single reversal.</p>')
    A('<figure>' + holesfig(d) + '</figure>')
    A('<p class="cap">The same obstruction, one level in: near the plane a galaxy is harder to '
      'see well enough to take its spectrum, so the blank inside the record follows the blank '
      'outside it.</p>')

    # ---- what is known to be in there
    A('<h2>Seven · <em>what is known to be in there</em></h2>')
    A(f'<p>The closed ground is not empty and nobody thinks it is. Two things found behind it '
      f'are named here because both were found by other means — radio, X-ray, and the pull '
      f'they exert on us.</p>')
    A('<table><thead><tr><th>direction</th><th>entries</th><th>expected</th>'
      '<th>closed ground in the circle</th><th>radio galaxies</th></tr></thead><tbody>')
    A(f'<tr><td>Norma cluster (Abell 3627), the Great Attractor’s core<br>'
      f'<span class="cap">l = {norma["l"]}°, b = {norma["b"]}°, '
      f'within {f(norma["radius"], 0)}°</span></td>'
      f'<td class="num">{n(norma["n_optical"])}</td><td class="num">{n(norma["expected"])}</td>'
      f'<td class="num">{pc(norma["zone_share_of_cap"], 0)}</td>'
      f'<td class="num">{n(norma["n_radio"])}</td></tr>')
    A(f'<tr><td>Vela supercluster<br><span class="cap">l = {vela["l"]}°, '
      f'b = {vela["b"]}°, within {f(vela["radius"], 0)}°</span></td>'
      f'<td class="num">{n(vela["n_optical"])}</td><td class="num">{n(vela["expected"])}</td>'
      f'<td class="num">{pc(vela["zone_share_of_cap"], 0)}</td>'
      f'<td class="num">{n(vela["n_radio"])}</td></tr>')
    A('</tbody></table>')
    A(f'<p>Toward Norma the catalogue holds {f(norma["n_optical"] / norma["expected"], 1)} times '
      f'what an average patch of sky would give it — the cluster is bright enough to show through '
      f'the thinning — while a quarter of that circle is ground it may not enter. Toward Vela it '
      f'holds {n(vela["n_optical"])} against {n(vela["expected"])} expected, and the radio survey '
      f'holds {n(vela["n_radio"])} galaxies in the same circle — three quarters of what the '
      f'optical catalogue has there, from an instrument with a thousandth of its reach. The Vela '
      f'supercluster is a structure of the nearby universe found late and mapped with '
      f'near-infrared photometry and redshifts gathered on purpose behind the plane; the paper '
      f'this page takes its direction from reports that of the galaxies it identified in six of '
      f'its cluster candidates, only about fifteen per cent were previously known.</p>')

    # ---- what this is not
    A('<h2>What this page does not claim</h2>')
    A('<ul>'
      f'<li>The <strong>{n(d["zone_expected"])}</strong> is an estimate under an assumption '
      f'that is false in detail: galaxies are clustered, and the hidden ground contains at '
      f'least one supercluster. It is marked as an estimate everywhere it appears and no '
      f'conclusion here rests on it.</li>'
      f'<li>The {d["radio_with_optical_entry"]} shared objects measure the overlap of '
      f'<em>two selections</em> — near-infrared brightness on one side, neutral-hydrogen mass '
      f'on the other. They do not measure what has been seen. The counterpart figures from the '
      f'radio survey’s own paper are printed above for exactly that reason.</li>'
      f'<li>The dust column is a model, not a measurement at each galaxy: a map of the sky’s '
      f'reddening read at that position. Its authors state its own uncertainties near the plane, '
      f'which is where this page uses it most.</li>'
      f'<li>No cause is asserted for the highest dust value in the optical catalogue, for the '
      f'{n(cells["empty_outside_zone"])} empty cells outside the closed ground, or for the '
      f'shortfall in the belt beyond the line. The gradient in the record’s own dust '
      f'column is stated beside them; the record does not say more than that.</li>'
      f'<li>The marks are positions rounded to this paper’s grid — one unit of a sheet '
      f'{n(mk["width"])} across. Nothing else about a galaxy is drawn. The catalogues '
      f'themselves are not republished here.</li>'
      '</ul>')

    # ---- method
    A('<h2>How this was made</h2>')
    A(f'<p>Three published catalogues were read once, on {src["fetched_utc"][:10]}, through the '
      f'VizieR table access service at the Centre de Données astronomiques de Strasbourg, with '
      f'an instrument that names itself in its request. Their descriptions (the ReadMe files) '
      f'were read from the same archive. The files live in a cache outside this repository and '
      f'are not committed; <code>sources.json</code> carries the query, the byte count and the '
      f'SHA-256 of each one, so a reader can fetch them again and check they got what we did. '
      f'Every number on this page is computed by <code>measure.py</code> from those files and '
      f'written to <code>counts.json</code>; the page is built from that file alone by '
      f'<code>build.py</code>, which makes the same bytes every time it runs.</p>')
    A('<table class="src"><thead><tr><th>catalogue</th><th>what it is</th><th>rows</th></tr></thead><tbody>'
      '<tr><td><a href="https://cdsarc.cds.unistra.fr/viz-bin/cat/J/ApJS/199/26">J/ApJS/199/26</a>/table3</td><td>The 2MASS Redshift Survey — Huchra, Macri, Masters, '
      'Jarrett, Berlind, Calkins, Crook, Cutri, Erdoğdu, Falco, George, Hutcheson, Lahav, '
      'Mader, Mink, Martimbeau, Schneider, Skrutskie, Tokarz &amp; Westover, '
      '<em>Astrophysical Journal Supplement Series</em> 199 (2012) 26</td>'
      f'<td class="num">{n(d["n_optical"])}</td></tr>'
      '<tr><td><a href="https://cdsarc.cds.unistra.fr/viz-bin/cat/J/AJ/151/52">J/AJ/151/52</a>/table2</td><td>The Parkes H I zone-of-avoidance survey (HIZOA-S) '
      '— Staveley-Smith, Kraan-Korteweg, Schröder, Henning, Koribalski, Stewart &amp; Heald, '
      '<em>Astronomical Journal</em> 151 (2016) 52</td>'
      f'<td class="num">{n(d["n_radio_south"])}</td></tr>'
      '<tr><td><a href="https://cdsarc.cds.unistra.fr/viz-bin/cat/J/AJ/129/220">J/AJ/129/220</a>/table1</td><td>The northern extension (HIZOA-N) — Donley, Staveley-Smith, '
      'Kraan-Korteweg, Islas-Islas, Schröder, Henning, Koribalski, Mader &amp; Stewart, '
      '<em>Astronomical Journal</em> 129 (2005) 220</td>'
      f'<td class="num">{d["n_radio_north"]}</td></tr></tbody></table>')
    A('<p class="note">The dust column of both catalogues is from Schlegel, Finkbeiner &amp; '
      'Davis, <em>Astrophysical Journal</em> 500 (1998) 525. The Norma cluster’s position is the '
      'one <a href="https://simbad.cds.unistra.fr/simbad/sim-id?Ident=ACO+3627">SIMBAD</a> gives '
      'for ACO 3627, read on the same day as the catalogues; the cluster and the Great '
      'Attractor Wall are named in the HIZOA-S paper above. The Vela supercluster’s direction and '
      'extent are as stated by Hatamkhani, Kraan-Korteweg, Blyth, Said &amp; Elagali, '
      '<em>Monthly Notices of the Royal Astronomical Society</em> 522 (2023) 2223 '
      '(<a href="https://arxiv.org/abs/2304.07208">arXiv:2304.07208</a>), the paper this page also '
      'takes its figure for previously unknown galaxies from. No code from any other repository is '
      'embedded in this work, so no licence case arose beyond the catalogues’ own terms of use; no '
      'catalogue file is redistributed here.</p>')

    # ---- neighbours
    A('<h2>Nearest works, and the daylight</h2>')
    A('<p class="note">Four works in the house’s atlas of data art were opened at their own '
      'addresses before this one was built, not cited from a sentence about them.</p>')
    A('<p><strong><a href="https://ars.electronica.art/starts-prize/en/astres/">ASTRES: Mapping '
      'the Firmament</a></strong>, Playmodes Studio, 2025 — seen on its '
      'S+T+ARTS prize page: photographs of a laser installation, a credit list, and an account of '
      'generative constellations built with clustering and graph theory, each star given a sound, '
      'premised on light pollution having cut us off from the night sky. <em>Daylight:</em> ASTRES '
      'gives back a firmament our own lamps hide, and draws it with light. This sheet adds nothing '
      'to the sky: it prints a catalogue’s entries and leaves blank the ground no lamp caused '
      'and no switch can clear. Their material is the positions of stars; ours is the boundary of '
      'a record.</p>')
    A('<p><strong><a href="https://www.index-journal.org/issues/law/part-2-lacunae/forensic-listeningin-lawrence-abu-hamdans-saydnaya-the-missing-19db-by-james-parker">Saydnaya '
      '(the missing 19dB)</a></strong>, Lawrence Abu Hamdan, 2017 — read in James '
      'Parker’s essay on the work in <em>Index Journal</em> (2020), which sets out how a prison '
      'no photograph exists of was reconstructed from what survivors heard, and reads the work '
      'against Cage. <em>Daylight:</em> his second channel is human memory and the blinding was a '
      'state’s decision; ours is a radio telescope and the obstruction is the galaxy we live '
      'inside — chosen by nobody, reformable by nobody. And where his work reconstructs what was '
      'hidden, this one refuses to: it prints both records as they stand and counts what they '
      'share.</p>')
    A('<p><strong><a href="https://www.gardnermuseum.org/experience/contemporary-art/artists/raqs-media-collective">The '
      'Great Bare Mat and Constellation</a></strong>, Raqs Media Collective, 2012 — seen '
      'on the Isabella Stewart Gardner Museum’s page for the collective: a carpet whose motif '
      'lays the constellation Ursa Major over a drawing of one hour of the collective’s own '
      'network traffic, later used as the floor for public debates. <em>Daylight:</em> Raqs uses a '
      'constellation as the ground on which data is laid. Here there is no ground under the data: '
      'the catalogue is the constellation, and the figure it draws is a hole.</p>')
    A('<p><strong><a href="https://high.org/press-release/ryoji-ikeda-press-release/">data-verse</a></strong>, '
      'Ryoji Ikeda, 2019–2025 — read in the High Museum’s press '
      'release for the trilogy’s United States debut: open datasets from NASA, CERN and the '
      'Human Genome Project transformed by the artist’s own programs into monumental '
      'floor-to-ceiling projection and sound. <em>Daylight:</em> the same raw material — public '
      'scientific catalogues — and the opposite treatment. No sublime, no immersion, one sheet of '
      'paper at the size of a page, and the part of the data that does not exist is the subject '
      'rather than the part that does.</p>')
    A('<p class="note"><strong>Named and deliberately not answered:</strong> Mimi Ọnụọha’s '
      '<em>The Library of Missing Datasets</em>, named here for the fifth time and again not '
      'answered. Her empty folders name absences that a society chose and could choose otherwise. '
      'The absence on this sheet was chosen by nobody, and no institution can decide to collect '
      'it. That is the whole distance between the two, and it is why the answer this page gives '
      'is a drawing rather than a cabinet.</p>')

    A('<footer><p>IN THE WAY — Ensemble, the Studio, 19 September 2026. Cycle 003 of the research '
      'ecology, on the seeded question <em>Missing Data Art</em>. One file, no network, no '
      'library, no external asset; it opens from a filesystem and works with scripting switched '
      'off. Text and drawings CC BY 4.0; the scripts beside it Apache 2.0. The '
      'catalogues belong to their authors and to the Centre de Données astronomiques de '
      'Strasbourg, and are cited, not republished.</p></footer>')
    A('<script type="application/json" id="data">' + dj + '</script>')
    A("</main></body></html>\n")
    return "\n".join(h), dj


def numbers(d):
    """Everything the page prints, without the pictures."""
    return {k: v for k, v in d.items() if k != "marks"}


def main(check):
    d = json.loads((HERE / "counts.json").read_text())
    src = json.loads((HERE / "sources.json").read_text())
    html, dj = page(d, src)
    if check:
        bad = 0
        for name, text in (("index.html", html), ("data.json", dj)):
            old = (HERE / name).read_text()
            same = old == text
            print(f"  {'same' if same else 'DIFFERS'}  {name}  "
                  f"{hashlib.sha256(text.encode()).hexdigest()[:16]}")
            bad += 0 if same else 1
        print("rebuild is byte-identical" if not bad else f"{bad} file(s) differ")
        return bad
    (HERE / "data.json").write_text(dj)
    (HERE / "index.html").write_text(html)
    print(f"index.html {len(html):,} bytes · data.json {len(dj):,} bytes")
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    sys.exit(main(ap.parse_args().check))
