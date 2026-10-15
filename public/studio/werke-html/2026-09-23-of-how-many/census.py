#!/usr/bin/env python3
"""OF HOW MANY — the census.

A printed percentage is two integers with the pair thrown away. This script asks
what is left of them in the digits, exhaustively and in exact integer arithmetic:

  FLOORS      for every printed percentage at 0, 1 and 2 decimal places, the
              smallest denominator that can produce it at all — computed twice,
              once by brute force over every (k, n), once by the simplest-fraction
              algorithm over the rounding interval, and the two compared.
  THE FAN     for one decimal place: every cell (printed value, denominator) with
              n <= 2000 classified — impossible, one numerator, several numerators,
              or decided by the rounding rule.
  THE TIES    every (k, n) whose exact value falls on a rounding boundary, with the
              reduced denominator that put it there.
  THE RULES   how often round-half-up, round-half-even and truncation print
              different digits for the same two integers.
  SENTENCES   a handful of percentages printed without their integers, and the
              denominators the digits leave standing.

No sampling anywhere. Output: counts.json (the census) and data.json (what the
page draws). Usage:  python3 census.py [--out DIR]
"""
from __future__ import annotations
import json, sys, os
from fractions import Fraction
from math import gcd

NMAX = 2000              # the fan's denominators, exhaustive
DECIMALS = (0, 1, 2)     # the printed precisions
RULES = ('half_even', 'half_up', 'trunc')


# ---------------------------------------------------------------- printing

def printed_scaled(k: int, n: int, d: int, rule: str = 'half_even') -> int:
    """The digits a report would carry for k of n at d decimal places, as an
    integer scaled by 10**d. Exact: no float is involved anywhere."""
    num = 100 * k * 10 ** d
    q, r = divmod(num, n)
    if rule == 'trunc':
        return q
    t = 2 * r
    if t > n:
        return q + 1
    if t < n:
        return q
    return q + 1 if rule == 'half_up' else q + (q & 1)


def is_tie(k: int, n: int, d: int) -> bool:
    """Does k of n land exactly on the boundary between two printed values?"""
    return 2 * ((100 * k * 10 ** d) % n) == n


# ------------------------------------------------- the rounding interval

def interval(v: int, d: int, rule: str):
    """The set of fractions k/n that print as v (scaled by 10**d), as
    (lo, hi, lo_closed, hi_closed) with lo, hi Fractions of the ratio itself."""
    scale = Fraction(1, 100 * 10 ** d)
    if rule == 'trunc':
        return (v * scale, (v + 1) * scale, True, False)
    lo, hi = (Fraction(2 * v - 1, 2) * scale, Fraction(2 * v + 1, 2) * scale)
    if rule == 'half_up':
        return (lo, hi, True, False)
    # half-even takes a boundary only when it lands on an even last digit, and
    # BOTH boundaries of an even v do that: the lower one rounds up to v, the
    # upper one rounds down to it. An odd v takes neither. (The first version of
    # this line closed one end and opened the other, and the brute force caught
    # it: 5, 14 and 46 floors differed at 0, 1 and 2 decimals. METHOD.md, §5.)
    even = (v % 2 == 0)
    return (lo, hi, even, even)


def simplest_denominator(lo: Fraction, hi: Fraction, lo_c: bool, hi_c: bool):
    """Smallest n such that some k/n lies in the interval, and that k.

    A Stern-Brocot descent, not a search: take the integer part off, invert,
    recurse. `hi = None` means "no upper bound", which is what inverting an
    interval that is open at an integer produces."""
    if lo < 0:
        lo, lo_c = Fraction(0), True
    if hi is not None and hi > 1 and lo <= 1:
        hi, hi_c = Fraction(1), True
    if hi is not None and (lo > hi or (lo == hi and not (lo_c and hi_c))):
        return None

    def inside(m, lo, hi, lo_c, hi_c):
        if m < lo or (m == lo and not lo_c):
            return False
        if hi is None:
            return True
        return m < hi or (m == hi and hi_c)

    def rec(lo, hi, lo_c, hi_c):
        # an integer in the interval is as simple as a fraction gets
        m = -((-lo.numerator) // lo.denominator)          # ceil(lo)
        for cand in (m, m + 1):
            if inside(cand, lo, hi, lo_c, hi_c):
                return (cand, 1)                          # (k, n)
        fl = lo.numerator // lo.denominator
        lo2 = lo - fl
        hi2 = None if hi is None else hi - fl
        inv_lo = None if (hi2 is None or hi2 == 0) else 1 / hi2
        inv_hi = None if lo2 == 0 else 1 / lo2
        k, n = rec(inv_lo if inv_lo is not None else Fraction(0),
                   inv_hi,
                   hi_c if inv_lo is not None else True,
                   lo_c)
        return (k * fl + n, k)                            # climb back out
    num, den = rec(lo, hi, lo_c, hi_c)
    return (den, num)                                     # (n, k)


# ------------------------------------------------------------- the census

def brute_floors(d: int, nmax: int, rule: str):
    """Smallest denominator per printed value, by walking every (k, n)."""
    floor = {}
    for n in range(1, nmax + 1):
        for k in range(n + 1):
            v = printed_scaled(k, n, d, rule)
            if v not in floor:
                floor[v] = (n, k)
    return floor


def run(outdir: str):
    C: dict = {
        'work': 'OF HOW MANY',
        'built': 'census.py, exact integer arithmetic, nothing sampled',
        'nmax': NMAX,
        'rules': list(RULES),
    }

    # ---- 1. floors, both ways ------------------------------------------------
    floors = {}
    floor_check = {}
    for d in DECIMALS:
        P = 100 * 10 ** d
        for rule in ('half_even', 'trunc'):
            simple = {}
            for v in range(P + 1):
                lo, hi, lc, hc = interval(v, d, rule)
                got = simplest_denominator(lo, hi, lc, hc)
                simple[v] = got
            floors[f'd{d}_{rule}'] = [simple[v][0] for v in range(P + 1)]
            floors[f'd{d}_{rule}_k'] = [simple[v][1] for v in range(P + 1)]
        # brute force, as far as the brute force reaches
        bf = brute_floors(d, NMAX, 'half_even')
        agree = disagree = unreached = 0
        for v in range(P + 1):
            s = floors[f'd{d}_half_even'][v]
            b = bf.get(v, (None,))[0]
            if s > NMAX:
                unreached += 1
            elif b == s:
                agree += 1
            else:
                disagree += 1
        floor_check[f'd{d}'] = {'agree': agree, 'disagree': disagree,
                                'beyond_brute_force': unreached, 'brute_force_nmax': NMAX}
    C['floor_crosscheck'] = floor_check

    fl_stats = {}
    for d in DECIMALS:
        f = floors[f'd{d}_half_even']
        ft = floors[f'd{d}_trunc']
        srt = sorted(f)
        fl_stats[f'd{d}'] = {
            'values': len(f),
            'max': max(f), 'max_at': [i for i, x in enumerate(f) if x == max(f)],
            'median': srt[len(srt) // 2],
            'mean': round(sum(f) / len(f), 3),
            'floor_is_1': sum(1 for x in f if x == 1),
            'floor_over_100': sum(1 for x in f if x > 100),
            'floor_over_1000': sum(1 for x in f if x > 1000),
            'differs_under_truncation': sum(1 for a, b in zip(f, ft) if a != b),
            'truncation_max': max(ft),
        }
    C['floors'] = fl_stats

    # ---- 2. the fan: every (printed value, denominator) cell, d = 1 ----------
    d = 1
    P = 100 * 10 ** d
    # class per cell: 0 impossible · 1 one numerator · 2 several · 3 the rule decides
    fan = [bytearray(P + 1) for _ in range(NMAX)]
    per_n_distinct = [0] * (NMAX + 1)
    per_n_ties = [0] * (NMAX + 1)
    cells_possible = 0
    cells_multi = 0
    cells_rule = 0
    worlds = [0] * (P + 1)          # (k, n) pairs that print this value
    worlds_n = [0] * (P + 1)        # distinct denominators that can print it
    ties_by_reduced: dict[int, int] = {}
    tie_pairs = 0
    diff_hu_he = diff_hu_tr = diff_he_tr = 0
    total_pairs = 0
    first_collision = None

    for n in range(1, NMAX + 1):
        row = fan[n - 1]
        seen: dict[int, int] = {}
        for k in range(n + 1):
            total_pairs += 1
            he = printed_scaled(k, n, d, 'half_even')
            hu = printed_scaled(k, n, d, 'half_up')
            tr = printed_scaled(k, n, d, 'trunc')
            if hu != he:
                diff_hu_he += 1
            if hu != tr:
                diff_hu_tr += 1
            if he != tr:
                diff_he_tr += 1
            if is_tie(k, n, d):
                tie_pairs += 1
                per_n_ties[n] += 1
                red = n // gcd(k, n) if k else 1
                ties_by_reduced[red] = ties_by_reduced.get(red, 0) + 1
                row[he] = 3
                row[hu] = 3
            seen[he] = seen.get(he, 0) + 1
            worlds[he] += 1
        if first_collision is None and any(c > 1 for c in seen.values()):
            first_collision = n
        per_n_distinct[n] = len(seen)
        for v, c in seen.items():
            worlds_n[v] += 1
            if row[v] != 3:
                row[v] = 2 if c > 1 else 1
        cells_possible += len(seen)
        cells_multi += sum(1 for c in seen.values() if c > 1)
        cells_rule += sum(1 for x in row if x == 3)

    picture = [0, 0, 0, 0]
    for row in fan:
        for v in row:
            picture[v] += 1

    C['fan'] = {
        'decimals': d, 'nmax': NMAX,
        'printed_values': P + 1,
        'cells': (P + 1) * NMAX,
        'cells_possible': cells_possible,
        'cells_impossible': (P + 1) * NMAX - cells_possible,
        'cells_two_or_more_numerators': cells_multi,
        'cells_the_rule_decides': cells_rule,
        'picture_classes': {'dark_impossible': picture[0], 'one_numerator': picture[1],
                            'pale_several_numerators': picture[2], 'red_the_rule_decides': picture[3]},
        'picture_note': ('The picture paints the red class over the other three: a cell where the '
                         'rounding rule decides whether that percentage is printed at all is red, '
                         'whether or not half-to-even prints it. So the dark count below is the '
                         'impossible count less the impossible cells that are red.'),
        'pairs': total_pairs,
        'first_denominator_with_two_numerators': first_collision,
        'distinct_values_at_n': {str(n): per_n_distinct[n] for n in
                                 (1, 2, 3, 7, 10, 16, 20, 30, 50, 100, 200, 500, 1000, 1001, 2000)},
    }
    C['ties'] = {
        'decimals': d, 'nmax': NMAX,
        'pairs_on_a_boundary': tie_pairs,
        'by_reduced_denominator': {str(k): v for k, v in sorted(ties_by_reduced.items())},
        'reduced_denominators': sorted(ties_by_reduced),
    }
    C['rule_disagreement'] = {
        'pairs': total_pairs,
        'half_up_vs_half_even': diff_hu_he,
        'half_up_vs_truncation': diff_hu_tr,
        'half_even_vs_truncation': diff_he_tr,
        'half_up_vs_truncation_pct': round(100 * diff_hu_tr / total_pairs, 4),
    }

    # the theorem the ties obey, checked at every precision the census can reach
    theorem = {}
    for dd in DECIMALS:
        found = set()
        for n in range(1, NMAX + 1):
            for k in range(n + 1):
                if is_tie(k, n, dd):
                    found.add(n // gcd(k, n) if k else 1)
        predicted = sorted(m for m in range(1, NMAX + 1)
                           if (2 * 100 * 10 ** dd) % m == 0 and ((2 * 100 * 10 ** dd) // m) % 2 == 1)
        theorem[f'd{dd}'] = {'observed': sorted(found), 'predicted_to_nmax': predicted,
                             'agree': sorted(found) == predicted}
    C['tie_theorem'] = theorem

    # ---- 3. possible worlds per printed value -------------------------------
    order = sorted(range(P + 1), key=lambda v: worlds_n[v])
    C['worlds'] = {
        'nmax': NMAX,
        'mean_pairs_per_printed_value': round(sum(worlds) / (P + 1), 2),
        'mean_denominators_per_printed_value': round(sum(worlds_n) / (P + 1), 2),
        'fewest_denominators': [{'printed': round(v / 10 ** d, d), 'denominators': worlds_n[v],
                                 'pairs': worlds[v]} for v in order[:6]],
        'most_denominators': [{'printed': round(v / 10 ** d, d), 'denominators': worlds_n[v],
                               'pairs': worlds[v]} for v in order[-4:][::-1]],
    }

    # ---- 4. sentences: percentages printed without their integers -----------
    def study(pstr: str, note: str):
        dd = len(pstr.split('.')[1]) if '.' in pstr else 0
        v = int(round(float(pstr) * 10 ** dd))
        ns = [n for n in range(1, NMAX + 1)
              if any(printed_scaled(k, n, dd, 'half_even') == v for k in range(n + 1))]
        fl = floors[f'd{dd}_half_even'][v]
        flk = floors[f'd{dd}_half_even_k'][v]
        return {'printed': pstr, 'decimals': dd, 'note': note,
                'floor': fl, 'floor_k': flk,
                'denominators_up_to_nmax': len(ns),
                'first_ten_denominators': ns[:10],
                'rules_out_1000': 1000 not in ns,
                'rules_out_100': 100 not in ns}
    C['sentences'] = [
        study('44.44', 'a percentage of this house, printed 2026-09-23 without its integers'),
        study('10.63', 'a percentage of this house, printed 2026-09-23 without its integers'),
        study('2.91',  'a percentage of this house, printed 2026-09-23 without its integers'),
        study('7.11',  'a percentage of this house, printed 2026-09-23 without its integers'),
        study('6.88',  'a percentage of this house, printed 2026-09-22 without its integers'),
        study('30.5',  'a percentage of this room, printed 2026-09-22 with its integers'),
        study('0.1',   'the one-decimal percentage with the highest floor there is'),
        study('33.4',  'one digit away from a third'),
    ]

    # ---- 5. what the page draws --------------------------------------------
    D = {
        'floors': {f'd{dd}': floors[f'd{dd}_half_even'] for dd in DECIMALS},
        'floors_trunc': {f'd{dd}': floors[f'd{dd}_trunc'] for dd in DECIMALS},
        'floor_k': {f'd{dd}': floors[f'd{dd}_half_even_k'] for dd in DECIMALS},
        'per_n_distinct': per_n_distinct,
        'fan_small': [[v for v in range(P + 1) if fan[n - 1][v]] for n in range(1, 61)],
        'fan_small_class': [[fan[n - 1][v] for v in range(P + 1) if fan[n - 1][v]]
                            for n in range(1, 61)],
    }

    os.makedirs(outdir, exist_ok=True)
    with open(os.path.join(outdir, 'counts.json'), 'w') as f:
        json.dump(C, f, indent=1, sort_keys=False)
        f.write('\n')
    with open(os.path.join(outdir, 'data.json'), 'w') as f:
        json.dump(D, f, separators=(',', ':'), sort_keys=True)
        f.write('\n')
    # the fan, as raw class bytes for the PNG writer
    with open(os.path.join(outdir, 'fan.bin'), 'wb') as f:
        for row in fan:
            f.write(bytes(row))
    print('pairs', total_pairs, '| possible cells', cells_possible,
          '| ties', tie_pairs, '| tie denominators', sorted(ties_by_reduced))
    return C


if __name__ == '__main__':
    out = os.path.dirname(os.path.abspath(__file__))
    if '--out' in sys.argv:
        out = sys.argv[sys.argv.index('--out') + 1]
    run(out)
