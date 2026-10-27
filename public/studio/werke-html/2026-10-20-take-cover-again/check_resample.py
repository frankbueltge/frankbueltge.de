"""TAKE COVER, AGAIN, coda (session 192): the Field's correction of the 39 %, checked.

The Field (bulletin of 2026-10-22, session 220, results35.json) wrote that resampling the deadly tornadoes
gives 24-56 % for the share of the dead who died after a county run of three or more empty warnings, that
this interval holds the 31 % baseline, and that one tornado carries 29 % of the 550.

This file reads only the work's own committed record (record.js: every deadly tornado of the final
database, its dead and the run of empty warnings before it in its county; run -1 means under no warning)
and resamples the 340 deadly tornadoes with replacement, the tornado being the unit, because the dead of
one tornado are not independent of each other. Fixed seed, 20,000 draws, percentile interval.
Run: python3 check_resample.py  (writes resample.json beside it and asserts what the page says).
"""
import json, random

s = open('record.js').read()
R = json.loads(s[s.index('=') + 1:].rstrip().rstrip(';'))
dead = R['dead']                                   # [time, dead, mag, county index, run before]
assert len(dead) == 340 and sum(d[1] for d in dead) == 1399


def share(rows, under_only):
    rows = [d for d in rows if d[4] >= 0] if under_only else rows
    tot = sum(d[1] for d in rows)
    return sum(d[1] for d in rows if d[4] >= 3) / tot if tot else 0.0


def interval(under_only, rows=dead, n=20000, seed=20261022):
    rnd = random.Random(seed)
    xs = sorted(share([rnd.choice(rows) for _ in rows], under_only) for _ in range(n))
    return round(xs[int(0.025 * n)], 4), round(xs[int(0.975 * n) - 1], 4)


r3 = sum(d[1] for d in dead if d[4] >= 3)
big = max(dead, key=lambda d: d[1])
rest = [d for d in dead if d is not big]
out = {
    'deadly_tornadoes': len(dead), 'dead': 1399, 'dead_after_run_3_plus': r3,
    'share_of_all_dead': round(r3 / 1399, 4),
    'share_of_dead_under_a_warning': round(share(dead, True), 4),
    'interval_95_all_dead': interval(False),
    'interval_95_under_a_warning': interval(True),
    'largest_tornado': {'dead': big[1], 'run_before': big[4], 'share_of_the_550': round(big[1] / r3, 4)},
    'without_the_largest': {'share_of_all_dead': round(share(rest, False), 4),
                            'interval_95_all_dead': interval(False, rest)},
    'baseline_share_of_met_county_warnings_after_3_plus': round(9426 / 30093, 4),
}
lo, hi = out['interval_95_all_dead']
out['baseline_inside_interval'] = lo <= out['baseline_share_of_met_county_warnings_after_3_plus'] <= hi
json.dump(out, open('resample.json', 'w'), indent=1)
print(json.dumps(out, indent=1))

assert r3 == 550 and big[1] == 158 and big[4] == 15
assert out['baseline_inside_interval']
