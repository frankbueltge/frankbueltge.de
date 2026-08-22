#!/usr/bin/env python3
"""Deterministic renderer for W1 'Twenty-Five'. Six rules, three pairs.

Reads data/pinned.json and writes rules/*.svg. No network, no randomness, no clock:
the same input yields byte-identical output for ever. Whoever fabricates runs this.

The rule is exactly one metre long. That is not a proportion, it is the standard
metre, which is what the work is about. The span of recorded years is mapped
linearly onto it, and a graduation is cut where and only where the dataset version
holds a year for this dyad. Absent years leave nothing behind — no gap marker, no
dotted line, no note. That absence is the work; compensating for it would undo it.
"""
import json, pathlib

MM = 1000.0          # rule length: one metre
HEIGHT = 60.0        # rule height in mm
DEEP = 34.0          # graduation depth in mm
MARGIN = 40.0        # blank margin at each end, outside the mapped span
STROKE = 1.2

root = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((root / "data" / "pinned.json").read_text(encoding="utf-8"))

def x_of(year, span):
    lo, hi = span
    if hi == lo:
        return MM / 2
    return MARGIN + (year - lo) / (hi - lo) * (MM - 2 * MARGIN)

def svg(case, side):
    rule = case["rule_%s" % side]
    span = case["span"]
    marks = "\n".join(
        '  <line x1="%.3f" y1="0" x2="%.3f" y2="%.3f" stroke="#000" stroke-width="%.2f"/>'
        % (x_of(y, span), x_of(y, span), DEEP, STROKE)
        for y in rule["years"] if span[0] <= y <= span[1]
    )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="%.1fmm" height="%.1fmm" '
        'viewBox="0 0 %.1f %.1f">\n'
        '  <rect x="0" y="0" width="%.1f" height="%.1f" fill="none" stroke="#000" '
        'stroke-width="%.2f"/>\n%s\n'
        '  <text x="6" y="%.1f" font-family="monospace" font-size="7">%s</text>\n'
        '</svg>\n'
        % (MM, HEIGHT, MM, HEIGHT, MM, HEIGHT, STROKE, marks, HEIGHT - 6, rule["version"])
    )

out = root / "rules"
out.mkdir(exist_ok=True)
for case in data["cases"]:
    for side in ("before", "after"):
        path = out / ("%s--%s.svg" % (case["id"], case["rule_%s" % side]["version"]))
        path.write_text(svg(case, side), encoding="utf-8")
        print("%s  %d graduations  span %d-%d"
              % (path.name, len(case["rule_%s" % side]["years"]), *case["span"]))
