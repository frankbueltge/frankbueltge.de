"""A SET OF MEASURES — analysis.

    python3 analysis.py

Reads the record of BELOW THE TRACE (works/2026-09-25-below-the-trace/events.json,
derived from the ANSS Comprehensive Catalog, USGS, public domain), checks it by its
digest, and writes two files:

  results.json — for each of nine readings of the same record (each year's
                 completeness floor set 0.0, 0.1, ... 0.8 above its most populated
                 0.1-magnitude bin, the pooled slope re-estimated at each floor):
                 the slope, its standard error, the earthquakes it rests on, each
                 year's ESTIMATED count of M >= 1.0 earthquakes the catalogue did not
                 write, the total, and the vessel that holds it. The same nine floors
                 with the slope held at BELOW THE TRACE's own (0.8621, at full precision) are recorded beside them.
  cups.scad    — the nine vessels as a fabrication file (OpenSCAD source): one ring
                 per year, 1974 at the foot and 2025 at the mouth, each ring's bore
                 sized so that its volume is that year's estimate at ten earthquakes
                 to the millilitre.

The estimate is BELOW THE TRACE's, unchanged, except that the floor moves:
      N_est(>=1.0) = N(>=Mc_y) * 10 ** (b * (Mc_y - 1.0)),  not written = N_est - N_written(>=1.0)
clipped at 0; a year whose floor is at or below 1.0 is taken as complete. b is the Aki-Utsu
maximum-likelihood value pooled over every year above its own floor, with the 0.005 half-step.

The vessel, in full:
  ring height H = 4 mm; one ring per year, 52 rings, cavity 208 mm tall.
  a ring holding U earthquakes has bore radius r = sqrt(U * 100 / (pi * H)) mm, because
      0.1 ml = 100 mm^3 per earthquake; so its volume is exactly U / 10 ml.
  a ring is never narrower than R_MIN = 4 mm: where a reading calls a year complete the
      vessel narrows to an 8 mm throat instead of closing. That throat is not data; its
      volume is recorded for every vessel ('throat_ml') and printed beside it.
  wall 2 mm, foot 2 mm.

Everything is arithmetic on the catalogue's own numbers except the estimate, which is a
model and is labelled one everywhere it appears.
"""
import hashlib, json, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', '2026-09-25-below-the-trace', 'events.json')
SRC_SHA256 = '5f7425326c15af3fb1279ded50249d2b7ca603a1f594d387625cc8f919af719c'
FLOORS = [round(0.1 * i, 1) for i in range(9)]
M_REF, EPS = 1.0, 1e-9
H, R_MIN, WALL, FOOT = 4.0, 4.0, 2.0, 2.0
MM3_PER_QUAKE = 100.0                       # 0.1 ml


def tenth(v):
    return math.floor(v * 10 + EPS)


def mode_bin(mags):
    bins = {}
    for v in mags:
        bins[tenth(v)] = bins.get(tenth(v), 0) + 1
    top = max(bins.values())
    return min(k for k, c in bins.items() if c == top) / 10      # lowest bin on a tie


def reading(years, delta, b_fixed=None):
    mc = {y: round(mode_bin(m) + delta, 1) for y, m in years.items()}
    s, n = 0.0, 0
    for y, mags in years.items():
        for v in mags:
            if v >= mc[y] - EPS:
                s += v - (mc[y] - 0.005)
                n += 1
    b = math.log10(math.e) / (s / n) if b_fixed is None else b_fixed
    per = {}
    for y, mags in years.items():
        written = sum(1 for v in mags if v >= M_REF - EPS)
        above = sum(1 for v in mags if v >= mc[y] - EPS)
        est = written if mc[y] <= M_REF + EPS else above * 10 ** (b * (mc[y] - M_REF))
        per[y] = max(0.0, est - written)
    return mc, b, n, per


def bore(u):
    return max(R_MIN, math.sqrt(u * MM3_PER_QUAKE / (math.pi * H)))


def main():
    raw = open(SRC, 'rb').read()
    assert hashlib.sha256(raw).hexdigest() == SRC_SHA256, 'the record is not the one this work was built on'
    years = {}
    for y, f, m in json.loads(raw)['events']:
        years.setdefault(y, [])
        if m is not None:
            years[y].append(m)
    ys = sorted(years)

    b_held = reading(years, 0.2)[1]          # BELOW THE TRACE's own slope, full precision
    cups = []
    for d in FLOORS:
        mc, b, n, per = reading(years, d)
        _, _, _, held = reading(years, d, b_held)
        radii = [bore(per[y]) for y in ys]
        cavity = sum(math.pi * r * r * H for r in radii) / 1000.0          # ml
        data = sum(per.values()) / 10.0                                     # ml
        w = {y: sum(1 for v in years[y] if v >= M_REF - EPS) for y in ys}
        early = [y for y in ys if y <= 1979]
        late = [y for y in ys if y >= 2016]
        share = lambda yy: sum(w[y] for y in yy) / sum(w[y] + per[y] for y in yy)
        cups.append({
            'floor_above_mode': d,
            'b': round(b, 4),
            'b_se': round(b / math.sqrt(n), 4),
            'b_events': n,
            'not_written_est': round(sum(per.values())),
            'not_written_est_slope_held': round(sum(held.values())),
            'years_counted_complete': sum(1 for y in ys if per[y] < 0.5),
            'share_written_1974_1979': round(share(early), 3),
            'share_written_2016_2025': round(share(late), 3),
            'capacity_ml': round(cavity, 1),
            'data_ml': round(data, 1),
            'throat_ml': max(0.0, round(cavity - data, 2)),
            'widest_bore_mm': round(max(radii) * 2, 1),
            'widest_year': ys[max(range(len(ys)), key=lambda i: radii[i])],
            'mouth_bore_mm': round(radii[-1] * 2, 1),
            'per_year_not_written_est': [round(per[y], 1) for y in ys],
            'bore_radius_mm': [round(r, 3) for r in radii],
        })

    results = {
        'record': 'works/2026-09-25-below-the-trace/events.json',
        'record_sha256': SRC_SHA256,
        'years': ys,
        'm_ref': M_REF,
        'slope_held_value': round(b_held, 6),
        'vessel': {'ring_height_mm': H, 'min_bore_radius_mm': R_MIN, 'wall_mm': WALL, 'foot_mm': FOOT,
                   'earthquakes_per_ml': 10, 'order': '1974 at the foot, 2025 at the mouth'},
        'cups': cups,
    }
    with open(os.path.join(HERE, 'results.json'), 'w') as fh:
        json.dump(results, fh, indent=1)
        fh.write('\n')

    # the fabrication file: each cavity is a staircase polygon (x = radius, y = height)
    out = ['// A SET OF MEASURES - nine vessels, one per completeness floor. Ensemble, 2026-09-26. CC BY 4.0.',
           '// Generated by analysis.py from results.json; do not edit by hand.',
           '// Each ring is one year (1974 at the foot, 2025 at the mouth), 4 mm tall; its bore holds',
           '// that year\'s ESTIMATED unwritten M>=1.0 earthquakes at ten to the millilitre.',
           '// Where a reading calls a year complete the bore narrows to an 8 mm throat (not data).',
           '// Choose a vessel with CUP = 0..8 (the floor above the modal bin, in tenths).',
           'CUP = 2;', f'WALL = {WALL};', f'FOOT = {FOOT};', '$fn = 128;', '']
    for i, c in enumerate(cups):
        pts, z = [[0, FOOT]], FOOT
        for r in c['bore_radius_mm']:
            pts += [[r, z], [r, z + H]]
            z += H
        pts.append([0, z])
        out.append(f'// floor +{c["floor_above_mode"]:.1f} · b {c["b"]:.3f} · ≈{c["not_written_est"]} unwritten '
                   f'· capacity {c["capacity_ml"]} ml (throat {c["throat_ml"]} ml)')
        out.append(f'CAVITY_{i} = ' + json.dumps([[round(x, 3), round(y, 3)] for x, y in pts]) + ';')
    out += ['', 'CAVITIES = [' + ', '.join(f'CAVITY_{i}' for i in range(len(cups))) + '];',
            f'TOP = FOOT + {len(ys)} * {H};',
            'module vessel(P) {',
            '  rotate_extrude() difference() {',
            '    intersection() { offset(delta = WALL) polygon(P); translate([0, 0]) square([1000, TOP]); }',
            '    polygon(P);',
            '  }',
            '}',
            'vessel(CAVITIES[CUP]);', '']
    with open(os.path.join(HERE, 'cups.scad'), 'w') as fh:
        fh.write('\n'.join(out))

    for c in cups:
        print(f"+{c['floor_above_mode']:.1f}  b {c['b']:.3f}±{c['b_se']:.3f} (n={c['b_events']})  "
              f"≈{c['not_written_est']:>6}  held {c['not_written_est_slope_held']:>5}  "
              f"{c['capacity_ml']:>7} ml  throat {c['throat_ml']} ml  widest {c['widest_bore_mm']} mm "
              f"({c['widest_year']})  mouth {c['mouth_bore_mm']} mm  "
              f"{c['share_written_1974_1979']:.0%}/{c['share_written_2016_2025']:.0%}")


if __name__ == '__main__':
    main()
