#!/usr/bin/env python3
"""Draws the nightly line's 62 works on one timeline, with every reference between
them as an arc, and the fork of 2026-08-10 as a vertical rule.

Generated rather than drawn, so the picture cannot disagree with the numbers beside
it: every arc is an edge in data/error-as-method.json and no arc is anything else.

    python3 window/cycle-001-session-2/figure.py \
        window/cycle-001-session-2/data/error-as-method.json > .../figure.svg

Session 1's `tools/lineage/render.py` is not reused here. It is hardwired to this
repository — its era divider, its tick labels and its Fehlerkataster lane are this
practice's own — and rewriting it would have changed a published figure. It stays
as it was published; this is a second figure, not a correction of that one.
"""
from __future__ import annotations

import json
import math
import re
import sys
from datetime import date
from pathlib import Path

W, H = 880, 300
PAD_L, PAD_R = 30, 30
BASE = 236          # the timeline
TOP = 34            # highest an arc may reach
FORK = "2026-08-10"
LAST_BEFORE = "2026-07-18"   # the night the line stopped; the pause runs to the fork


def arc_height(span_days: int) -> float:
    """Arc height encodes how far back the reference reaches, on a log scale.

    Drawn to horizontal distance instead, a one-day reference is a flat line two
    pixels high and the thirty-seven references that are the finding here would be
    invisible. The compression is stated in the caption; the ordering is preserved,
    so a longer memory is still a taller arc.
    """
    return 18 + 26 * math.log2(1 + max(span_days, 0))


def main() -> None:
    data = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    run = data["prose_edges_only"]
    deg = run["degree"]
    dated = {s: v["date"] for s, v in deg.items() if v["date"]}
    if len(dated) != len(deg):
        raise SystemExit("this figure needs every unit dated; see METHOD.md § Direction")

    lo = date.fromisoformat(min(dated.values()))
    hi = date.fromisoformat(max(dated.values()))
    span = max((hi - lo).days, 1)
    inner = W - PAD_L - PAD_R

    def x_of(iso: str) -> float:
        return PAD_L + inner * (date.fromisoformat(iso) - lo).days / span

    # Up to five works share a date. Without a spread the figure would show fewer
    # things than the line made, which is the one thing it must not do.
    day_w = inner / span
    per_day: dict[str, list[str]] = {}
    for s in sorted(dated, key=lambda k: (dated[k], k)):
        per_day.setdefault(dated[s], []).append(s)
    offset = {}
    for members in per_day.values():
        n = len(members)
        for i, s in enumerate(members):
            offset[s] = 0.0 if n == 1 else (i - (n - 1) / 2) * min(day_w * 0.75, 4.0)

    px = lambda s: x_of(dated[s]) + offset.get(s, 0.0)

    parts: list[str] = []
    xf, xl = x_of(FORK), x_of(LAST_BEFORE)

    # The pause is part of the finding, so it is drawn rather than left as white space.
    parts.append(f'<rect class="pause" x="{xl:.1f}" y="{TOP + 4}" width="{xf - xl:.1f}" '
                 f'height="{BASE - TOP - 4}"/>')
    parts.append(f'<line class="fork" x1="{xf:.1f}" y1="{TOP + 4}" x2="{xf:.1f}" '
                 f'y2="{BASE + 26}"/>')

    edges = run["backward_edges"]
    for u, v, span_days, _cls in edges:
        x1, x2 = px(u), px(v)
        h = min(arc_height(span_days), BASE - TOP)
        parts.append(f'<path class="e" d="M{x1:.1f},{BASE} '
                     f'Q{(x1 + x2) / 2:.1f},{BASE - h * 1.34:.1f} {x2:.1f},{BASE}">'
                     f'<title>{u} &#8594; {v} ({span_days} d)</title></path>')

    parts.append(f'<line class="axis" x1="{PAD_L}" y1="{BASE}" x2="{W - PAD_R}" y2="{BASE}"/>')

    for s in sorted(deg, key=lambda k: dated[k]):
        lit = "on" if deg[s]["in"] or deg[s]["out"] else "off"
        parts.append(f'<circle class="u {lit}" cx="{px(s):.1f}" cy="{BASE}" r="3.4">'
                     f'<title>{s} &#8212; {dated[s]}</title></circle>')

    for iso, label in (("2026-06-29", "29 Jun"), ("2026-07-18", "18 Jul"),
                       ("2026-08-10", "10 Aug"), ("2026-08-31", "31 Aug")):
        anchor = "start" if iso == "2026-06-29" else ("end" if iso == "2026-08-31" else "middle")
        parts.append(f'<text class="tick" x="{x_of(iso):.1f}" y="{BASE + 19}" '
                     f'text-anchor="{anchor}">{label}</text>')

    before = [s for s in dated if dated[s] < FORK]
    after = [s for s in dated if dated[s] >= FORK]
    n_before = sum(1 for e in edges if dated[e[0]] < FORK)
    parts.append(f'<text class="lbl" x="{PAD_L}" y="{TOP - 12}">'
                 f'{len(before)} works &#183; {n_before} references written</text>')
    parts.append(f'<text class="lbl" x="{W - PAD_R}" y="{TOP - 12}" text-anchor="end">'
                 f'{len(after)} works &#183; {len(edges) - n_before} references written</text>')
    parts.append(f'<text class="fork-lbl" x="{(xl + xf) / 2:.1f}" y="{BASE - 8}" '
                 f'text-anchor="middle">the pause &#183; 22 days</text>')
    parts.append(f'<text class="fork-lbl" x="{xf + 5:.1f}" y="{BASE + 36}">'
                 'the fork, and the clause</text>')
    parts.append(f'<text class="tick" x="{PAD_L}" y="{BASE + 36}" text-anchor="start">'
                 f'filled dot = named at least once '
                 f'({run["reach"]["units_with_at_least_one_edge"]} of {len(deg)}) '
                 f'&#183; arc height = days reached back, log scale</text>')

    body = "\n  ".join(parts)
    svg = (f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" role="img" '
          f'aria-label="Timeline of the nightly line\'s {len(deg)} works from 29 June to '
          f'31 August 2026, each a dot, every written reference between two works an arc '
          f'above the line. Left of the fork of 10 August: {len(before)} works and '
          f'{n_before} arcs. Right of it: {len(after)} works and {len(edges) - n_before} '
           f'arcs, most of them short, joining one night to the night before.">'
           f'\n  {body}\n</svg>')

    if "--into" in sys.argv:
        page = Path(sys.argv[sys.argv.index("--into") + 1])
        text = page.read_text(encoding="utf-8")
        new = re.sub(r"<!--FIGURE-->.*?<!--/FIGURE-->",
                     f"<!--FIGURE-->\n{svg}\n<!--/FIGURE-->", text, flags=re.S)
        if new == text and "<!--FIGURE-->" not in text:
            raise SystemExit(f"no <!--FIGURE--> region in {page}")
        page.write_text(new, encoding="utf-8")
        print(f"inlined into {page}", file=sys.stderr)
    print(svg)


if __name__ == "__main__":
    main()
