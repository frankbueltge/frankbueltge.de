"""BELOW THE TRACE — analysis.

    python3 analysis.py RAW_DIR      # RAW_DIR holds <year>.csv as fetched (see sources.json)

Reads the yearly catalogue responses of the ANSS Comprehensive Catalog (ComCat,
earthquake.usgs.gov/fdsnws/event/1) for every earthquake within 40 km of the
Byerly Seismographic Vault in Berkeley (BK.BKS, 37.876221 N, 122.23558 W), and
writes two files:

  events.json  — the compact record the page is drawn from: for every event of
                 1974–2025, its year, its moment within the year (a fraction),
                 and its magnitude, or null where the catalogue wrote none.
  results.json — per year: the completeness floor (Mc), the counts written,
                 the pooled b-value, and the ESTIMATED count of M >= 1.0
                 earthquakes the catalogue did not write down, with a
                 sensitivity range.

Method, in full:
  Mc per year   — maximum curvature: the most populated 0.1-magnitude bin
                  (magnitudes floored to the bin), plus the customary +0.2.
  b             — one pooled Aki–Utsu maximum-likelihood value over every year:
                  b = log10(e) / mean(M - (Mc_y - 0.005)) over events with
                  M >= Mc_y; 0.005 is half the catalogue's 0.01 reporting step.
                  Its standard error is b / sqrt(N).
  estimate      — the Gutenberg–Richter extrapolation of each year's own count
                  above its own floor down to M 1.0:
                      N_est(>=1.0) = N(>=Mc_y) * 10 ** (b * (Mc_y - 1.0))
                  and 'not written' = N_est - N_written(>=1.0), clipped at 0.
                  Where Mc_y <= 1.0 the year is taken as complete at M 1.0.
  sensitivity   — the same estimate under Mc_y +/- 0.1 and b +/- 2 standard
                  errors, all nine combinations; the range is min..max.

Everything after the fetch is exact arithmetic on the catalogue's own numbers
except the estimate, which is a model and is labelled one everywhere it appears.
"""
import csv, json, math, sys, os, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
FIRST, LAST = 1974, 2025
M_REF = 1.0
EPS = 1e-9


def year_fraction(iso):
    # iso like 2020-01-01T11:49:28.760Z ; fraction of the year elapsed, UTC
    from datetime import datetime, timezone
    t = datetime.strptime(iso.rstrip('Z'), '%Y-%m-%dT%H:%M:%S.%f').replace(tzinfo=timezone.utc)
    a = datetime(t.year, 1, 1, tzinfo=timezone.utc)
    b = datetime(t.year + 1, 1, 1, tzinfo=timezone.utc)
    return (t - a).total_seconds() / (b - a).total_seconds()


def tenth(v):
    """floor to the 0.1 bin, returned as an integer number of tenths"""
    return math.floor(v * 10 + EPS)


def mc_maxc(mags):
    bins = {}
    for v in mags:
        k = tenth(v)
        bins[k] = bins.get(k, 0) + 1
    top = max(bins.values())
    mode = min(k for k, c in bins.items() if c == top)   # lowest bin on a tie
    return (mode + 2) / 10


def load(raw):
    events, excluded = [], []
    for name in sorted(os.listdir(raw)):
        if not name.endswith('.csv'):
            continue
        for row in csv.DictReader(open(os.path.join(raw, name), newline='')):
            y = int(row['time'][:4])
            if not (FIRST <= y <= LAST):
                excluded.append({'id': row['id'], 'time': row['time'], 'mag': row['mag'] or None})
                continue
            events.append({
                'id': row['id'],
                'y': y,
                'f': round(year_fraction(row['time']), 6),
                'm': float(row['mag']) if row['mag'] else None,
            })
    events.sort(key=lambda e: (e['y'], e['f'], e['id']))
    return events, excluded


def estimate(years, b, shift=0.0):
    out = {}
    for y, d in years.items():
        mc = round(d['mc'] + shift, 1)
        above = sum(1 for v in d['mags'] if v >= mc - EPS)
        written = sum(1 for v in d['mags'] if v >= M_REF - EPS)
        if mc <= M_REF + EPS:
            est = written
        else:
            est = above * 10 ** (b * (mc - M_REF))
        out[y] = max(0.0, est - written)
    return out


def main(raw):
    events, excluded = load(raw)
    years = {}
    for y in range(FIRST, LAST + 1):
        ev = [e for e in events if e['y'] == y]
        mags = [e['m'] for e in ev if e['m'] is not None]
        years[y] = {'n': len(ev), 'nomag': len(ev) - len(mags), 'mags': mags, 'mc': mc_maxc(mags)}

    # pooled b
    s, n = 0.0, 0
    for d in years.values():
        for v in d['mags']:
            if v >= d['mc'] - EPS:
                s += v - (d['mc'] - 0.005)
                n += 1
    b = math.log10(math.e) / (s / n)
    se = b / math.sqrt(n)

    central = estimate(years, b)
    combos = [estimate(years, b + db * se, dm) for db in (-2, 0, 2) for dm in (-0.1, 0, 0.1)]

    rows = []
    for y, d in years.items():
        written1 = sum(1 for v in d['mags'] if v >= M_REF - EPS)
        miss = central[y]
        lo = min(c[y] for c in combos)
        hi = max(c[y] for c in combos)
        rows.append({
            'year': y,
            'events': d['n'],
            'no_magnitude': d['nomag'],
            'mc': d['mc'],
            'above_mc': sum(1 for v in d['mags'] if v >= d['mc'] - EPS),
            'written_m1': written1,
            'not_written_m1_est': round(miss),
            'not_written_m1_range': [round(lo), round(hi)],
            'share_written_est': round(written1 / (written1 + miss), 4) if written1 + miss else 1.0,
        })
    tot = sum(central.values())
    tots = [sum(c.values()) for c in combos]
    results = {
        'window': [FIRST, LAST],
        'centre': {'station': 'BK.BKS', 'lat': 37.876221, 'lon': -122.23558, 'radius_km': 40},
        'events': len(events),
        'events_no_magnitude': sum(d['nomag'] for d in years.values()),
        'excluded_outside_window': excluded,
        'm_ref': M_REF,
        'b': round(b, 4),
        'b_se': round(se, 4),
        'b_events': n,
        'not_written_total_est': round(tot),
        'not_written_total_range': [round(min(tots)), round(max(tots))],
        'written_m1_total': sum(r['written_m1'] for r in rows),
        'years': rows,
    }
    with open(os.path.join(HERE, 'events.json'), 'w') as fh:
        json.dump({'_note': 'Derived from ANSS ComCat (public domain, USGS); see sources.json. '
                            'y = year, f = fraction of the year elapsed (UTC), m = magnitude or null.',
                   'events': [[e['y'], e['f'], e['m']] for e in events]}, fh, separators=(',', ':'))
        fh.write('\n')
    with open(os.path.join(HERE, 'results.json'), 'w') as fh:
        json.dump(results, fh, indent=1)
        fh.write('\n')
    print(f"events {len(events)}  no magnitude {results['events_no_magnitude']}  b {b:.3f} ± {se:.3f} (n={n})")
    print(f"not written, M>=1.0, estimated: {tot:.0f}  range {min(tots):.0f}..{max(tots):.0f}"
          f"  (written M>=1.0: {results['written_m1_total']})")


if __name__ == '__main__':
    main(sys.argv[1])
