"""WOVEN BY DAY — analysis.

    python3 analysis.py RAW_DIR   # RAW_DIR holds <year>.csv as fetched (see sources.json)
    python3 analysis.py           # re-derive from the committed events.json

Reads every event the ANSS Comprehensive Catalog (ComCat) holds within 40 km of the
Byerly Seismographic Vault in Berkeley (BK.BKS, 37.876221 N, 122.23558 W), 1974-2025,
of EVERY event type (session 144 asked for earthquakes only; tonight the blasts the
catalogue labels itself are part of the cloth). Writes:

  events.json  — per event: UTC epoch seconds, magnitude or null, type code
                 (0 earthquake, 1 quarry blast, 2 chemical explosion,
                  3 building collapse, 4 accidental explosion).
  results.json — the cloth: per band and local hour, the count, the night mean,
                 the ratio, and the number of the cell's 64 points woven dark.
  cloth.wif    — the same cloth as a Weaving Information File (WIF 1.1), a lift plan
                 for a 192-end jacquard, laid ready and not woven.

Method, in full:
  local hour  — America/Los_Angeles, daylight saving applied (zoneinfo).
  bands       — earthquakes by magnitude, 0.2 wide, floored: below 0.6 pooled, then
                0.6 ... 2.4, then 2.6-2.99 pooled, then 3.0 and above; plus one band of
                earthquakes the catalogue wrote WITHOUT a magnitude.
  night mean  — the band's mean count over local hours 0-5.
  ratio       — the hour's count / the band's night mean.  1 = the hour wrote as much
                as the night.
  dark points — each cell is 8 ends x 8 picks = 64 points; round(64 * clamp(ratio-0.5,
                0, 1)) of them are woven dark (weft over warp), placed by an 8x8 ordered
                (Bayer) threshold, so a cell as full as the night is half dark.
  blasts      — every non-earthquake event, by local hour; red points =
                round(64 * count / the busiest hour's count).
  estimate    — earthquakes below M 1.2 the day did not write, IF every hour had
                written as the night did: sum over hours and the four bands below 1.2
                of (night mean - count). An estimate, labelled one; the night is not
                complete either, so it is a floor, not a total.
"""
import csv, glob, json, math, os, sys, hashlib
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

HERE = os.path.dirname(os.path.abspath(__file__))
LA = ZoneInfo('America/Los_Angeles')
TYPES = ['earthquake', 'quarry blast', 'chemical explosion', 'building collapse', 'accidental explosion']
EPS = 1e-9
NIGHT = range(0, 6)
BANDS = [  # (label, lo, hi) in tenths; None = no magnitude written
    ('no size', None, None), ('< 0.6', -99, 6), ('0.6', 6, 8), ('0.8', 8, 10), ('1.0', 10, 12),
    ('1.2', 12, 14), ('1.4', 14, 16), ('1.6', 16, 18), ('1.8', 18, 20), ('2.0', 20, 22),
    ('2.2', 22, 24), ('2.4', 24, 26), ('2.6', 26, 30), ('3.0 +', 30, 999)]
BELOW_12 = ['< 0.6', '0.6', '0.8', '1.0']
BAYER2 = [[0, 2], [3, 1]]


def bayer(n):
    if n == 2:
        return BAYER2
    s = bayer(n // 2)
    return [[4 * s[i % (n // 2)][j % (n // 2)] + BAYER2[i // (n // 2)][j // (n // 2)]
             for j in range(n)] for i in range(n)]


B8 = bayer(8)


def from_raw(raw_dir):
    ev, digests = [], {}
    for f in sorted(glob.glob(os.path.join(raw_dir, '*.csv'))):
        data = open(f, 'rb').read()
        digests[os.path.basename(f)] = hashlib.sha256(data).hexdigest()
        for r in csv.DictReader(data.decode('utf-8').splitlines()):
            t = datetime.strptime(r['time'].rstrip('Z'), '%Y-%m-%dT%H:%M:%S.%f').replace(tzinfo=timezone.utc)
            ms = round(t.timestamp() * 1000)
            ev.append([ms, None if r['mag'] == '' else float(r['mag']), TYPES.index(r['type'])])
    ev.sort(key=lambda e: (e[0], e[2], -1 if e[1] is None else e[1]))
    return ev, digests


def band_of(m):
    if m is None:
        return 'no size'
    k = math.floor(m * 10 + EPS)
    for lab, lo, hi in BANDS[1:]:
        if lo <= k < hi:
            return lab
    raise ValueError(m)


def local(ms):
    t = datetime.fromtimestamp(ms / 1000, tz=timezone.utc).astimezone(LA)
    return t.hour, t.weekday()


def cell_points(k, colour):
    """the 8x8 points of a cell: True where woven in `colour` (k of 64)"""
    return [[B8[i][j] < k for j in range(8)] for i in range(8)]


def main():
    if len(sys.argv) > 1:
        ev, digests = from_raw(sys.argv[1])
        with open(os.path.join(HERE, 'events.json'), 'w') as f:
            f.write('{"fields":["utc_ms","mag","type"],"types":' + json.dumps(TYPES) + ',"events":[\n')
            f.write(',\n'.join(json.dumps(e, separators=(',', ':')) for e in ev))
            f.write('\n]}\n')
        with open(os.path.join(HERE, 'catalogue.sha256'), 'w') as f:
            for k in sorted(digests):
                f.write(f'{digests[k]}  {k}\n')
    raw = open(os.path.join(HERE, 'events.json'), 'rb').read()
    ev = json.loads(raw)['events']

    counts = {lab: [0] * 24 for lab, _, _ in BANDS}
    blasts = [0] * 24
    by_type = [0] * len(TYPES)
    weekday = {'eq_day_M16_weekday': 0, 'eq_day_M16_weekend': 0, 'eq_night_M16_weekday': 0, 'eq_night_M16_weekend': 0,
               'blast_weekday': 0, 'blast_weekend': 0}
    nsn = {'weekday_11_12': 0, 'weekday_all': 0, 'weekend_11_12': 0, 'weekend_all': 0, 'years_11_12': {}}
    for ms, m, ty in ev:
        h, wd = local(ms)
        by_type[ty] += 1
        if ty == 0 and m is None:
            k = 'weekend' if wd >= 5 else 'weekday'
            nsn[k + '_all'] += 1
            if h in (11, 12):
                nsn[k + '_11_12'] += 1
                y = str(datetime.fromtimestamp(ms / 1000, tz=timezone.utc).astimezone(LA).year)
                nsn['years_11_12'][y] = nsn['years_11_12'].get(y, 0) + 1
        we = 'weekend' if wd >= 5 else 'weekday'
        if ty == 0:
            counts[band_of(m)][h] += 1
            if m is not None and m >= 1.6 - EPS:
                if 9 <= h <= 16:
                    weekday['eq_day_M16_' + we] += 1
                elif h in NIGHT:
                    weekday['eq_night_M16_' + we] += 1
        else:
            blasts[h] += 1
            weekday['blast_' + we] += 1

    bands = []
    for lab, _, _ in BANDS:
        c = counts[lab]
        nm = sum(c[h] for h in NIGHT) / len(NIGHT)
        ratio = [round(x / nm, 4) for x in c]
        dark = [round(64 * min(1, max(0, x / nm - 0.5))) for x in c]
        bands.append({'band': lab, 'counts': c, 'total': sum(c), 'night_mean': round(nm, 4),
                      'ratio': ratio, 'dark_points': dark,
                      'day_ratio_9_16': round(sum(c[9:17]) / 8 / nm, 4)})
    bmax = max(blasts)
    red = [round(64 * b / bmax) for b in blasts]

    est = sum(sum(b['night_mean'] - x for x in b['counts']) for b in bands if b['band'] in BELOW_12)
    per_hour_below = [round(sum(b['night_mean'] - b['counts'][h] for b in bands if b['band'] in BELOW_12), 2)
                      for h in range(24)]
    low = [b for b in bands if b['band'] in BELOW_12]
    low_c = [sum(b['counts'][h] for b in low) for h in range(24)]
    low_nm = sum(low_c[h] for h in NIGHT) / 6
    high = [b for b in bands if b['band'] not in BELOW_12 and b['band'] != 'no size']
    high_c = [sum(b['counts'][h] for b in high) for h in range(24)]
    high_nm = sum(high_c[h] for h in NIGHT) / 6

    # the cloth, top (last woven) to bottom (first woven): bands in listed order, blasts last
    rows = [(b['band'], b['dark_points'], 2) for b in bands] + [('blasts', red, 3)]
    ENDS, PICKS = 24 * 8, len(rows) * 8
    grid = []  # grid[row_from_top][end] = colour index where woven weft-over, else 0 (warp shows)
    for lab, pts, col in rows:
        for i in range(8):
            grid.append([col if B8[i][j] < pts[h] else 0 for h in range(24) for j in range(8)])
    woven = {2: sum(r.count(2) for r in grid), 3: sum(r.count(3) for r in grid)}

    res = {
        'work': 'WOVEN BY DAY', 'session': 147, 'date': '2026-09-28',
        'events_sha256': hashlib.sha256(raw).hexdigest(),
        'events': len(ev), 'by_type': dict(zip(TYPES, by_type)),
        'years': [1974, 2025], 'timezone': 'America/Los_Angeles', 'night_hours': list(NIGHT),
        'bands': bands, 'blasts_by_hour': blasts, 'blast_red_points': red, 'blast_busiest_hour': blasts.index(bmax),
        'below_1_2': {'counts_by_hour': low_c, 'night_mean': round(low_nm, 4),
                      'ratio_by_hour': [round(x / low_nm, 4) for x in low_c],
                      'day_ratio_9_16': round(sum(low_c[9:17]) / 8 / low_nm, 4),
                      'estimate_unwritten_if_every_hour_were_night': round(est, 1),
                      'estimate_by_hour': per_hour_below},
        'at_or_above_1_2': {'counts_by_hour': high_c, 'night_mean': round(high_nm, 4),
                            'ratio_by_hour': [round(x / high_nm, 4) for x in high_c],
                            'day_ratio_9_16': round(sum(high_c[9:17]) / 8 / high_nm, 4)},
        'weekday_weekend': weekday,
        'no_size_at_11_12': nsn,
        'cloth': {'ends': ENDS, 'picks': PICKS, 'rows_top_to_bottom': [r[0] for r in rows],
                  'points_dark': woven[2], 'points_red': woven[3], 'points_total': ENDS * PICKS,
                  'bayer8': B8},
    }
    with open(os.path.join(HERE, 'results.json'), 'w') as f:
        json.dump(res, f, indent=1)
        f.write('\n')

    # WIF 1.1: pick 1 is woven first, i.e. the bottom row of the cloth as drawn
    L = ['[WIF]', 'Version=1.1', 'Date=April 20, 1997', 'Developers=wif@mhsoft.com',
         'Source Program=WOVEN BY DAY analysis.py (The Studio, Ensemble)', 'Source Version=2026-09-28', '',
         '[CONTENTS]', 'COLOR PALETTE=true', 'TEXT=true', 'WEAVING=true', 'WARP=true', 'WEFT=true',
         'COLOR TABLE=true', 'THREADING=true', 'LIFTPLAN=true', 'WEFT COLORS=true', '',
         '[TEXT]', 'Title=WOVEN BY DAY', 'Author=Ensemble (The Studio)',
         'Notes=Berkeley earthquake catalogue 1974-2025 by local hour; a pattern draft, not a structural binding. Not woven.', '',
         '[COLOR PALETTE]', 'Entries=3', 'Range=0,255', '',
         '[COLOR TABLE]', '1=236,228,210', '2=46,38,34', '3=168,44,34', '',
         '[WEAVING]', f'Shafts={ENDS}', 'Treadles=0', 'Rising Shed=true', '',
         '[WARP]', f'Threads={ENDS}', 'Color=1', '',
         '[WEFT]', f'Threads={PICKS}', 'Color=2', '',
         '[THREADING]'] + [f'{e}={e}' for e in range(1, ENDS + 1)] + ['', '[LIFTPLAN]']
    for p in range(1, PICKS + 1):
        row = grid[PICKS - p]
        up = [str(e + 1) for e in range(ENDS) if row[e] == 0]  # warp raised where weft does not show
        L.append(f'{p}=' + ','.join(up))
    L += ['', '[WEFT COLORS]']
    for p in range(1, PICKS + 1):
        row = grid[PICKS - p]
        L.append(f'{p}={3 if 3 in row or rows[(PICKS - p) // 8][2] == 3 else 2}')
    with open(os.path.join(HERE, 'cloth.wif'), 'w') as f:
        f.write('\n'.join(L) + '\n')


if __name__ == '__main__':
    main()
