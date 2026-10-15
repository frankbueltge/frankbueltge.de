#!/usr/bin/env python3
"""Draw the two figures from data.json and write index.html.

    python3 closing-report/reach/make-data.py      # recount
    python3 closing-report/reach/build-page.py     # redraw

The page is static once written: no script, no network, no build step. Colours
come through CSS custom properties, which is why every fill and stroke is set
in a style attribute rather than a presentation attribute — var() does not
substitute into presentation attributes.
"""

import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = json.load(open(os.path.join(HERE, "data.json"), encoding="utf-8"))
TEMPLATE = os.path.join(HERE, "page.template.html")
OUT = os.path.join(HERE, "index.html")

o, i, series = DATA["outward"], DATA["inward"], DATA["series"]


def channel():
    rows = [
        ("head", "Outward — what this practice put into the world", None, None),
        ("bar", "Sessions held", o["sessions"], "ink"),
        ("bar", "Works premiered and published", o["works_premiered"], "ink"),
        ("bar", "Packets addressed to a named receiver", o["packets_prepared"], "ink"),
        ("bar", "Packets actually sent", o["packets_sent"], "zero"),
        ("gap", "", None, None),
        ("head", "Inward — what came back", None, None),
        ("bar", "From the site’s own build machinery", i["machine_generated"], "machine"),
        ("bar", "From the architect, inside the house", i["architect_replies"], "machine"),
        ("bar", "From any person outside this house", i["from_outside_the_house"], "zero"),
    ]
    W, LX, TX, TW = 720, 8, 316, 352
    top = max(v for _, _, v, _ in rows if v is not None)
    sc = TW / top
    y, body = 0, []
    for kind, label, val, tone in rows:
        if kind == "gap":
            y += 14
            continue
        if kind == "head":
            y += 6
            body.append(f'<text class="hd" x="{LX}" y="{y + 13}">{label.upper()}</text>')
            y += 24
            continue
        cy = y + 15
        body.append(f'<text class="lb" x="{LX}" y="{cy + 4}">{label}</text>')
        body.append(f'<line x1="{TX}" y1="{cy}" x2="{TX + TW}" y2="{cy}" '
                    f'style="stroke:var(--rule-soft)" stroke-width="1"/>')
        if val == 0:
            body.append(f'<line x1="{TX}" y1="{cy - 7}" x2="{TX}" y2="{cy + 7}" '
                        f'style="stroke:var(--mark)" stroke-width="2"/>')
            body.append(f'<text class="nz" x="{TX + 10}" y="{cy + 5}">0</text>')
        else:
            w = val * sc
            fill = "var(--ink)" if tone == "ink" else "var(--machine)"
            body.append(f'<rect x="{TX}" y="{cy - 8}" width="{w:.1f}" height="16" '
                        f'style="fill:{fill}"/>')
            body.append(f'<text class="nm" x="{TX + w + 9:.1f}" y="{cy + 5}">{val}</text>')
        y += 30
    desc = (f'Seven bars on a single scale running to {top}. Outward: {o["sessions"]} sessions '
            f'held, {o["works_premiered"]} works premiered and published, '
            f'{o["packets_prepared"]} packets addressed to a named receiver, '
            f'{o["packets_sent"]} packets actually sent. Inward: {i["machine_generated"]} files '
            f'from the site’s own build machinery, {i["architect_replies"]} replies from the '
            f'architect inside the house, {i["from_outside_the_house"]} from any person outside '
            f'this house. Both channels end at zero.')
    return "\n".join([
        f'<svg class="fig" viewBox="0 0 {W} {y + 6}" width="100%" role="img" '
        f'aria-labelledby="chanT chanD">',
        '<title id="chanT">The reach ledger, drawn to one scale</title>',
        f'<desc id="chanD">{desc}</desc>', *body, "</svg>"])


def strip():
    n = len(series)
    W, L, R = 720, 34, 8
    cw = (W - L - R) / n
    mid, up, gap = 118.0, 78.0, 1.6
    maxs = max(d["sessions"] for d in series)
    maxi = max(d["inbound"] for d in series)
    # One unit of height is one item, in both directions. Giving the inbound half
    # its own scale would draw a two-file day nearly as tall as a nine-session day,
    # which is the opposite of what this figure is for.
    unit = up / maxs
    dn = maxi * unit + 8
    premieres = {w[:10] for w in o["works"]}
    body = [f'<line x1="{L}" y1="{mid}" x2="{W - R}" y2="{mid}" '
            f'style="stroke:var(--rule)" stroke-width="1"/>']
    for k, d in enumerate(series):
        x, bw = L + k * cw, cw - gap
        if d["sessions"]:
            h = unit * d["sessions"]
            body.append(f'<rect x="{x:.1f}" y="{mid - h:.1f}" width="{bw:.1f}" '
                        f'height="{h:.1f}" style="fill:var(--ink)"/>')
        if d["inbound"]:
            h = unit * d["inbound"]
            body.append(f'<rect x="{x:.1f}" y="{mid + 1}" width="{bw:.1f}" '
                        f'height="{h:.1f}" style="fill:var(--machine)"/>')
        if d["date"] in premieres:
            body.append(f'<circle cx="{x + bw / 2:.1f}" cy="{mid - up - 11}" r="3" '
                        f'style="fill:var(--mark)"/>')
    ax = mid + dn + 20
    for k, d in enumerate(series):
        if k == 0 or d["date"].endswith("-01"):
            label = "12 Jul" if k == 0 else "1 Aug"
            body.append(f'<text class="ax" x="{L + k * cw:.1f}" y="{ax}">{label}</text>')
    body.append(f'<text class="ax" x="{W - R}" y="{ax}" text-anchor="end">30 Aug</text>')
    body.append(f'<text class="hd sm" x="{L}" y="14">SESSIONS HELD — UP TO {maxs} IN A DAY</text>')
    body.append(f'<text class="hd sm" x="{L}" y="{ax + 20}">EVERYTHING THAT CAME BACK — '
                f'ALL {i["files"]} OF IT MACHINE-WRITTEN · SAME SCALE, BOTH DIRECTIONS</text>')
    desc = (f'A column for each of the {n} days from 12 July to 30 August 2026, both directions '
            f'drawn to the same scale — one step of height is one item. Above the line, the '
            f'sessions held that day, up to {maxs}. Dots mark the {o["works_premiered"]} '
            f'premieres. Below the line, the files that arrived that day — {i["files"]} in total, '
            f'never more than {maxi} in a day, every one written by the site’s own build '
            f'machinery. No mark below the line was made by a person outside this house.')
    return "\n".join([
        f'<svg class="fig" viewBox="0 0 720 {ax + 30:.0f}" width="100%" role="img" '
        'aria-labelledby="stripT stripD">',
        '<title id="stripT">Fifty days of work against everything that answered it</title>',
        f'<desc id="stripD">{desc}</desc>', *body, "</svg>"])


page = open(TEMPLATE, encoding="utf-8").read()
page = page.replace("{{CHANNEL}}", channel()).replace("{{STRIP}}", strip())
open(OUT, "w", encoding="utf-8").write(page)
print(f"wrote {os.path.relpath(OUT, os.path.dirname(os.path.dirname(HERE)))} "
      f"({len(page):,} bytes)")
