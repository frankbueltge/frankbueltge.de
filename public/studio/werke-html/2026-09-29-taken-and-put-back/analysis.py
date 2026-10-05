"""TAKEN, AND PUT BACK — analysis.

    python3 analysis.py

Reads the catalogue committed by session 147 (../2026-09-28-woven-by-day/events.json:
every event the ANSS Comprehensive Catalog holds within 40 km of the Byerly Vault in
Berkeley, 1974-2025), checks it against the digest that work recorded, and writes
results.json and tubes.csv. Nothing is fetched.

Method, in full:
  events     — earthquakes only (type code 0) that carry a magnitude.
  local time — America/Los_Angeles, daylight saving applied (zoneinfo); weekday =
               Monday-Friday by the local date, weekend = Saturday-Sunday.
  sizes      — small: magnitude below 1.5; larger: 1.5 and above (hundredths compared
               as integers, so 1.50 is larger).
  night      — per day kind and size, the mean count over local hours 0-5.
  per hour   — taken = night mean - small count (the small earthquakes the hour did not
               write, IF it could hear as the night does); put back = larger count -
               night mean (the larger events the hour wrote beyond the night); level =
               small + larger, the only thing the record shows.
  chance     — 2 x the square root of the night mean: a rough Poisson reference for how
               far an hour moves by chance alone. A reference, not a test.
  day        — local hours 9-16, as in session 147.
The night is not complete either, so every 'taken' is a floor. Nothing here says which
event is a blast: 'put back' is a surplus in a count, not a list of events.
"""
import csv, hashlib, json, math, os
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', '2026-09-28-woven-by-day')
LA = ZoneInfo('America/Los_Angeles')
DAY = range(9, 17)
BADGE = 5  # events per badge in the fill list


def main():
    raw = open(os.path.join(SRC, 'events.json'), 'rb').read()
    digest = hashlib.sha256(raw).hexdigest()
    want = json.load(open(os.path.join(SRC, 'results.json')))['events_sha256']
    assert digest == want, 'events.json does not match the digest session 147 recorded'
    ev = json.loads(raw)['events']

    cnt = {k: {'small': [0] * 24, 'larger': [0] * 24} for k in ('weekday', 'weekend')}
    for ms, m, t in ev:
        if t != 0 or m is None:
            continue
        d = datetime.fromtimestamp(ms / 1000, timezone.utc).astimezone(LA)
        kind = 'weekday' if d.weekday() < 5 else 'weekend'
        cnt[kind]['small' if round(m * 100) < 150 else 'larger'][d.hour] += 1

    out = {'events_sha256': digest, 'source': '../2026-09-28-woven-by-day/events.json',
           'earthquakes_with_size': sum(sum(v) for k in cnt.values() for v in k.values())}
    rows = []
    for kind, c in cnt.items():
        nS = sum(c['small'][:6]) / 6
        nL = sum(c['larger'][:6]) / 6
        hours = []
        for h in range(24):
            s, l = c['small'][h], c['larger'][h]
            hours.append({'hour': h, 'small': s, 'larger': l, 'level': s + l,
                          'taken': round(nS - s, 4), 'put_back': round(l - nL, 4),
                          'net': round(s + l - nS - nL, 4)})
            rows.append([kind, h, s, l, round(nS, 4), round(nL, 4),
                         round(nS / BADGE), round(nL / BADGE), round(s / BADGE), round(l / BADGE)])
        day = [hours[h] for h in DAY]
        taken = 8 * nS - sum(x['small'] for x in day)
        put = sum(x['larger'] for x in day) - 8 * nL
        out[kind] = {
            'night_small': round(nS, 4), 'night_larger': round(nL, 4),
            'chance_small': round(2 * math.sqrt(nS), 4), 'chance_larger': round(2 * math.sqrt(nL), 4),
            'hours': hours,
            'day_9_16': {'taken': round(taken, 4), 'put_back': round(put, 4), 'net': round(put - taken, 4),
                        'expected': round(8 * (nS + nL), 4), 'level': sum(x['level'] for x in day),
                        'net_share': round((put - taken) / (8 * (nS + nL)), 6),
                        'small_share': round(-taken / (8 * nS), 6), 'larger_share': round(put / (8 * nL), 6),
                         'hidden_share': round(put / taken, 4) if taken > 0 and put > 0 else 0},
            # hours whose level stands at or above the night while more small ones are
            # missing than chance moves
            'full_but_taken': [x['hour'] for x in hours
                               if x['net'] >= 0 and x['taken'] > 2 * math.sqrt(nS)],
        }
    json.dump(out, open(os.path.join(HERE, 'results.json'), 'w'), indent=1)
    with open(os.path.join(HERE, 'tubes.csv'), 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['day_kind', 'local_hour', 'small_written', 'larger_written', 'night_small', 'night_larger',
                    f'small_tube_fill_badges_1_per_{BADGE}', 'larger_tube_fill_badges',
                    'small_tube_badges_left', 'larger_tube_badges_left'])
        w.writerows(rows)
    for k in ('weekday', 'weekend'):
        print(k, out[k]['day_9_16'], out[k]['full_but_taken'])


if __name__ == '__main__':
    main()
