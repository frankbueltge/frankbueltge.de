#!/usr/bin/env python3
"""Draw the two figures from data.json. No dependencies, no network.

    fig-null.svg   what the record's own shuffled copies reach, against the
                   threshold the paper's formula supplies and against what was
                   actually measured. This is the argument of the page in one
                   picture.
    fig-plane.svg  the Atelier's whitened term-day plane: every pixel at or
                   beyond two standard deviations of its own term's baseline,
                   with the surviving event tiles outlined.

    python3 window/cycle-001-session-3/figure.py
"""
from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
W = 660


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def head(w: int, h: int, title: str) -> list[str]:
    return [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" '
        f'height="{h}" role="img" aria-label="{esc(title)}" font-family="ui-sans-serif,'
        'system-ui,-apple-system,Segoe UI,Roboto,sans-serif">',
        '<style>'
        '.ax{stroke:var(--fig-rule,#c9c3b6);stroke-width:1}'
        '.lb{fill:var(--fig-dim,#5c5952);font-size:10px}'
        '.lbb{fill:var(--fig-ink,#1c1b19);font-size:11px;font-weight:600}'
        '.null{stroke:var(--fig-null,#9a958a);stroke-width:1;opacity:.5}'
        '.cutA{stroke:var(--fig-cut-a,#b08968);stroke-width:1.5;stroke-dasharray:4 3}'
        '.cutE{stroke:var(--fig-cut-e,#3f6b4a);stroke-width:1.5}'
        '.ev{fill:var(--fig-ev,#a33b2a)}'
        '</style>',
    ]


def fig_null(d: dict) -> str:
    runs, key = d["runs"], "df-global"
    dets = d["detectors"]
    rowh, pad_l, pad_r, top = 104, 14, 14, 34
    h = top + rowh * len(dets) + 34
    s = head(W, h, "Permutation null against the analytic threshold, per record")
    s.append(f'<text class="lbb" x="{pad_l}" y="16">What the same record reaches when its '
             'days are shuffled</text>')
    s.append(f'<text class="lb" x="{pad_l}" y="29">horizontal axis: log10 of the ranking '
             'statistic of the loudest tile · further left is louder</text>')

    for i, det in enumerate(dets):
        r = runs[key]["detectors"][det["key"]]
        y = top + i * rowh
        vals = r["null_all_log10p"]
        evs = [e["log10p"] for e in r["events"]]
        lo = min(vals + evs + [r["analytic_cut_log10p"]]) * 1.06
        span = W - pad_l - pad_r

        def x(v: float) -> float:
            return pad_l + span * (1 - v / lo)

        s.append(f'<text class="lbb" x="{pad_l}" y="{y + 12}">{esc(det["name"])}</text>')
        s.append(f'<text class="lb" x="{pad_l + 116}" y="{y + 12}">'
                 f'{det["units"]} records · {det["active_days"]} active days · '
                 f'{det["tiles_searched"]:,} tiles</text>')
        base = y + 46
        s.append(f'<line class="ax" x1="{pad_l}" y1="{base}" x2="{W - pad_r}" y2="{base}"/>')
        for v in vals:
            s.append(f'<line class="null" x1="{x(v):.1f}" y1="{base - 11}" '
                     f'x2="{x(v):.1f}" y2="{base + 11}"/>')
        xa = x(r["analytic_cut_log10p"])
        s.append(f'<line class="cutA" x1="{xa:.1f}" y1="{base - 20}" x2="{xa:.1f}" '
                 f'y2="{base + 20}"/>')
        anc = "end" if xa > W * 0.6 else "start"
        s.append(f'<text class="lb" text-anchor="{anc}" '
                 f'x="{xa + (-4 if anc == "end" else 4):.1f}" y="{base + 32}">'
                 f'chi-squared cut {r["analytic_cut_log10p"]}</text>')
        xe = x(r["empirical_cut_log10p"])
        s.append(f'<line class="cutE" x1="{xe:.1f}" y1="{base - 20}" x2="{xe:.1f}" '
                 f'y2="{base + 20}"/>')
        anchor = "end" if xe > W * 0.55 else "start"
        dx = -4 if anchor == "end" else 4
        s.append(f'<text class="lb" text-anchor="{anchor}" x="{xe + dx:.1f}" '
                 f'y="{base - 25}">measured cut {r["empirical_cut_log10p"]}</text>')
        for e in r["events"]:
            s.append(f'<circle class="ev" cx="{x(e["log10p"]):.1f}" cy="{base}" r="4"/>')
        if not r["events"]:
            # on its own line, right-anchored: the chi-squared label sits wherever
            # that record's tile count puts it and the two must not collide
            s.append(f'<text class="lb" text-anchor="end" x="{W - pad_r}" y="{base + 46}">'
                     'nothing observed beyond the measured cut</text>')
    s.append("</svg>")
    return "\n".join(s)


def fig_plane(d: dict) -> str:
    plane = d["plane_atelier"]
    days, loud = plane["days"], plane["loud"]
    nd, nc = len(days), d["channels_used"]
    pad_l, pad_t, pad_b, pad_r = 34, 40, 30, 12
    pw, ph = W - pad_l - pad_r, 300
    cw, ch = pw / nd, ph / nc
    h = pad_t + ph + pad_b
    s = head(W, h, "The Atelier's whitened term-day plane")
    s.append(f'<text class="lbb" x="{pad_l}" y="16">The Atelier: every pixel at two '
             'standard deviations or beyond</text>')
    s.append(f'<text class="lb" x="{pad_l}" y="29">{nd} active days across · '
             f'{nc} terms down, rarest at the top · {plane["loud_count"]} pixels drawn '
             f'of {nd * nc:,}</text>')
    s.append(f'<rect x="{pad_l}" y="{pad_t}" width="{pw:.1f}" height="{ph}" fill="none" '
             'class="ax"/>')
    for j, k, z in loud:
        col = "var(--fig-hi,#a33b2a)" if z > 0 else "var(--fig-lo,#2f5d7c)"
        op = min(1.0, 0.28 + (abs(z) - 2) * 0.18)
        s.append(f'<rect x="{pad_l + j * cw:.2f}" y="{pad_t + k * ch:.2f}" '
                 f'width="{max(cw, 1.2):.2f}" height="{max(ch, 1.2):.2f}" fill="{col}" '
                 f'opacity="{op:.2f}"/>')
    for e in d["runs"]["df-global"]["detectors"]["atelier"]["events"]:
        j0 = days.index(e["day_first"])
        s.append(f'<rect x="{pad_l + j0 * cw:.2f}" y="{pad_t + e["k0"] * ch:.2f}" '
                 f'width="{e["dt"] * cw:.2f}" height="{e["df"] * ch:.2f}" fill="none" '
                 'stroke="var(--fig-ev,#a33b2a)" stroke-width="1.5" stroke-dasharray="3 2"/>')
    month = None
    for j, day in enumerate(days):
        if day[:7] != month:
            month = day[:7]
            xx = pad_l + j * cw
            s.append(f'<line class="ax" x1="{xx:.1f}" y1="{pad_t}" x2="{xx:.1f}" '
                     f'y2="{pad_t + ph}" opacity=".55"/>')
            s.append(f'<text class="lb" x="{xx + 3:.1f}" y="{pad_t + ph + 14}">'
                     f'{day}</text>')
    s.append(f'<text class="lb" text-anchor="end" x="{pad_l - 5}" y="{pad_t + 9}">rare</text>')
    s.append(f'<text class="lb" text-anchor="end" x="{pad_l - 5}" y="{pad_t + ph}">common</text>')
    s.append("</svg>")
    return "\n".join(s)


def main() -> None:
    d = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
    (HERE / "fig-null.svg").write_text(fig_null(d), encoding="utf-8")
    (HERE / "fig-plane.svg").write_text(fig_plane(d), encoding="utf-8")
    print("wrote fig-null.svg, fig-plane.svg")


if __name__ == "__main__":
    main()
