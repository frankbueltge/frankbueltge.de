"""THE NEARER ONE — the census.

One question, asked 4 969 080 times: given three of the 216 colours of the
web-safe palette, which of the two candidates is nearer to the third?

Five formulas answer. Nothing here samples, estimates or draws at random: every
triple of the palette is asked, and every answer is kept.

    python3 census.py            # write data.json and counts.json
    python3 census.py --ledger   # also write out the 4 969 080-row answer
                                 # ledger itself (~24 MB, not committed).
                                 # Its SHA-256 is in counts.json either way.
"""
import hashlib
import json
import math
import sys
import time

from colour import (LABELS, MEASURES, SYMMETRIC, distance, hexof, lab,
                    palette)

RGB = palette()
N = len(RGB)
LAB = [lab(c) for c in RGB]
HEX = [hexof(c) for c in RGB]

RATIO_EDGES = (1.01, 1.05, 1.10, 1.25, 1.50, 2.00, 3.00)
GAL_LOUD = 6          # loudest contradictions kept for the page
GAL_EYE = 12          # triples handed to the reader's eye
GAL_TRI = 4           # triangle violations kept per measure
GAL_FLIP = 6          # role-swap flips kept per asymmetric measure
TRI_TOL = 1e-9        # a triangle "violation" smaller than this is arithmetic,
                      # not geometry: the three colours are collinear and the
                      # inequality is an equality the machine cannot store.


def say(*a):
    print(*a, file=sys.stderr, flush=True)


# ----------------------------------------------------- the distance matrices
# M[m][i][j] = d(reference i, sample j). Never symmetrised.

def matrices():
    out = {}
    for m in MEASURES:
        rows = []
        for i in range(N):
            rows.append([distance(m, i, j, RGB, LAB) for j in range(N)])
        out[m] = rows
    return out


# ------------------------------------------------------------- the questions

def census(M):
    """Every triple. Outcome per measure: 0 = the first candidate is nearer,
    1 = the second, 2 = the two are at exactly the same distance."""
    t0 = time.time()
    D = [M[m] for m in MEASURES]
    nm = len(MEASURES)

    total = 0
    unanimous = 0
    contradicted = 0           # two measures name opposite candidates
    abstained_only = 0         # no contradiction, but somebody called it a tie
    ties = [0] * nm            # per measure: exact equal distances
    alone = [0] * nm           # per measure: the only one of the five to say so
    pair_disagree = [[0] * nm for _ in range(nm)]   # strict contradictions
    bucket_total = [0] * (len(RATIO_EDGES) + 1)
    bucket_contra = [0] * (len(RATIO_EDGES) + 1)
    split_shape = {}           # how the five divided, as a sorted signature
    coalition = {}             # which measures stood on the minority side
    coalition_best = {}        # and the loudest triple of each such division
    loud = []                  # (ratio, r, a, b, outcomes) for the gallery
    eye_pool = []
    per_ref_contra = [0] * N   # how much argument each colour causes
    per_ref_ties = [0] * N
    ledger = bytearray()   # always built, so the hash in counts.json is always
                           # there; --ledger only decides whether it is written

    for r in range(N):
        rows = [d[r] for d in D]
        d0, d1, d2, d3, d4 = rows
        cands = [x for x in range(N) if x != r]
        for ii in range(len(cands)):
            a = cands[ii]
            a0, a1, a2, a3, a4 = d0[a], d1[a], d2[a], d3[a], d4[a]
            for b in cands[ii + 1:]:
                b0 = d0[b]; b1 = d1[b]; b2 = d2[b]; b3 = d3[b]; b4 = d4[b]
                o0 = 0 if a0 < b0 else (1 if a0 > b0 else 2)
                o1 = 0 if a1 < b1 else (1 if a1 > b1 else 2)
                o2 = 0 if a2 < b2 else (1 if a2 > b2 else 2)
                o3 = 0 if a3 < b3 else (1 if a3 > b3 else 2)
                o4 = 0 if a4 < b4 else (1 if a4 > b4 else 2)
                total += 1
                ledger += bytes((48 + o0, 48 + o1, 48 + o2, 48 + o3, 48 + o4))

                outs = (o0, o1, o2, o3, o4)
                if o0 == 2: ties[0] += 1; per_ref_ties[r] += 1
                if o1 == 2: ties[1] += 1
                if o2 == 2: ties[2] += 1
                if o3 == 2: ties[3] += 1
                if o4 == 2: ties[4] += 1

                # how sure is the surest of the five, whatever it says
                r0 = a0 / b0 if a0 > b0 else (b0 / a0 if a0 else 1.0)
                r1 = a1 / b1 if a1 > b1 else (b1 / a1 if a1 else 1.0)
                r2 = a2 / b2 if a2 > b2 else (b2 / a2 if a2 else 1.0)
                r3 = a3 / b3 if a3 > b3 else (b3 / a3 if a3 else 1.0)
                r4 = a4 / b4 if a4 > b4 else (b4 / a4 if a4 else 1.0)
                ratio = r0
                if r1 > ratio: ratio = r1
                if r2 > ratio: ratio = r2
                if r3 > ratio: ratio = r3
                if r4 > ratio: ratio = r4
                k = 0
                for e in RATIO_EDGES:
                    if ratio >= e: k += 1
                    else: break
                bucket_total[k] += 1

                has0 = 0 in outs
                has1 = 1 in outs
                if has0 and has1:
                    contradicted += 1
                    per_ref_contra[r] += 1
                    if 2 not in outs:
                        n0 = outs.count(0)
                        if n0 == 1:
                            alone[outs.index(0)] += 1
                        elif n0 == 4:
                            alone[outs.index(1)] += 1
                    bucket_contra[k] += 1
                    na = outs.count(0)
                    split_shape[(na, outs.count(1), outs.count(2))] = \
                        split_shape.get((na, outs.count(1), outs.count(2)), 0) + 1
                    for x in range(nm):
                        if outs[x] == 2: continue
                        for y in range(x + 1, nm):
                            if outs[y] != 2 and outs[x] != outs[y]:
                                pair_disagree[x][y] += 1
                                pair_disagree[y][x] += 1
                    if len(loud) < 4000 or ratio > loud[-1][0]:
                        loud.append((ratio, r, a, b, outs))
                        if len(loud) > 4000:
                            loud.sort(key=lambda t: (-t[0], t[1], t[2], t[3]))
                            del loud[2000:]
                    if 2 not in outs:
                        side = 0 if na < 3 else 1
                        key = tuple(i for i in range(5) if outs[i] == side)
                        coalition[key] = coalition.get(key, 0) + 1
                        prev = coalition_best.get(key)
                        if prev is None or ratio > prev[0]:
                            coalition_best[key] = (ratio, r, a, b, outs)
                    if 2 <= na <= 3 and outs.count(2) == 0:
                        eye_pool.append((ratio, r, a, b, outs))
                        if len(eye_pool) > 4000:
                            eye_pool.sort(key=lambda t: (-t[0], t[1], t[2], t[3]))
                            del eye_pool[2000:]
                elif outs[0] == outs[1] == outs[2] == outs[3] == outs[4]:
                    unanimous += 1
                else:
                    abstained_only += 1
        if r % 24 == 0:
            say(f"  reference {r}/{N}  {time.time() - t0:.0f}s")

    loud.sort(key=lambda t: (-t[0], t[1], t[2], t[3]))
    eye_pool.sort(key=lambda t: (-t[0], t[1], t[2], t[3]))
    say(f"  census done in {time.time() - t0:.0f}s")
    return dict(
        total=total, unanimous=unanimous, contradicted=contradicted,
        abstained_only=abstained_only, ties=ties, alone=alone,
        pair_disagree=pair_disagree,
        bucket_total=bucket_total, bucket_contra=bucket_contra,
        split_shape=split_shape, loud=loud, eye_pool=eye_pool,
        coalition=coalition, coalition_best=coalition_best,
        per_ref_contra=per_ref_contra, per_ref_ties=per_ref_ties,
        ledger=ledger,
    )


# ------------------------------------------------- is it a distance at all?

def triangle(M):
    """d(a,c) > d(a,b) + d(b,c) — every ordered triple of distinct colours.

    The inner sweep is a C-level max over the whole row first: if no c anywhere
    can beat d(a,b), there is nothing in that row to look at. Only rows that
    can carry a violation are walked in Python, so nothing is skipped."""
    from operator import sub
    out = {}
    for m in MEASURES:
        t0 = time.time()
        D = M[m]
        worst = []
        count = 0
        real = 0
        absmax = 0.0
        for b in range(N):
            v = D[b]                       # d(b, c)
            for a in range(N):
                if a == b: continue
                Da = D[a]
                u = Da[b]                  # d(a, b)
                if max(map(sub, Da, v)) <= u:
                    continue
                for c in range(N):
                    if c == a or c == b: continue
                    direct = Da[c]
                    via = u + v[c]
                    if direct > via:
                        count += 1
                        exc = direct / via
                        gap = direct - via
                        if gap > absmax: absmax = gap
                        if exc > 1.0 + TRI_TOL:
                            real += 1
                        if len(worst) < 64 or exc > worst[-1][0]:
                            worst.append((exc, a, b, c, direct, via))
                            worst.sort(key=lambda t: (-t[0], t[1], t[2], t[3]))
                            del worst[64:]
        out[m] = dict(violations=count, beyond_rounding=real,
                      max_absolute_gap=absmax, worst=worst)
        say(f"  triangle {m}: {count} strict, {real} beyond rounding, "
            f"largest gap {absmax:.3e}, in {time.time() - t0:.0f}s")
    return out


# ------------------------------------------- does the reference colour matter?

def asymmetry(M):
    out = {}
    for m in MEASURES:
        D = M[m]
        n_asym = 0
        worst = []
        for i in range(N):
            for j in range(i + 1, N):
                f, g = D[i][j], D[j][i]
                if f != g:
                    n_asym += 1
                    hi, lo = (f, g) if f > g else (g, f)
                    rel = hi / lo if lo > 0 else float("inf")
                    if len(worst) < 32 or rel > worst[-1][0]:
                        worst.append((rel, i, j, f, g))
                        worst.sort(key=lambda t: (-t[0], t[1], t[2]))
                        del worst[32:]
        sym_pairs = []
        if 0 < n_asym < N * (N - 1) // 2:
            for i in range(N):
                for j in range(i + 1, N):
                    if D[i][j] == D[j][i]:
                        sym_pairs.append([i, j])
        out[m] = dict(pairs_asymmetric=n_asym, worst=worst,
                      symmetric_pairs=sym_pairs)
    return out


def role_flips(M):
    """The same triple asked the other way round: instead of
    d(reference, candidate) the formula is given d(candidate, reference).
    Only a formula that cares which colour is the reference can answer
    differently — and that is measured here rather than assumed."""
    out = {}
    for m in MEASURES:
        t0 = time.time()
        D = M[m]
        flips = 0
        gal = []
        for r in range(N):
            fwd = D[r]
            rev = [D[x][r] for x in range(N)]
            cands = [x for x in range(N) if x != r]
            for ii in range(len(cands)):
                a = cands[ii]
                fa = fwd[a]; ra = rev[a]
                for b in cands[ii + 1:]:
                    f = fa - fwd[b]
                    g = ra - rev[b]
                    if (f < 0) != (g < 0) or (f > 0) != (g > 0):
                        if f == 0 or g == 0:
                            continue
                        flips += 1
                        sep = abs(f) if abs(f) > abs(g) else abs(g)
                        if len(gal) < 32 or sep > gal[-1][0]:
                            gal.append((sep, r, a, b, fwd[a], fwd[b], rev[a], rev[b]))
                            gal.sort(key=lambda t: (-t[0], t[1], t[2], t[3]))
                            del gal[32:]
        out[m] = dict(flips=flips, worst=gal)
        say(f"  role flips {m}: {flips} in {time.time() - t0:.0f}s")
    return out


# ------------------------------------------------------------------ orderings

# Nine references, named by rule: the eight corners of the sRGB cube in palette
# order, plus the palette's middle grey. No reference was chosen for its result.
def ordering_references():
    idx = {c: i for i, c in enumerate(RGB)}
    corners = [(r, g, b) for r in (0, 255) for g in (0, 255) for b in (0, 255)]
    picks = [idx[c] for c in corners] + [idx[(153, 153, 153)]]
    return picks


def orderings(M, refs):
    out = []
    for r in refs:
        rows = {}
        for m in MEASURES:
            d = M[m][r]
            order = sorted([x for x in range(N) if x != r], key=lambda x: (d[x], x))
            rows[m] = order
        # Kendall tau distance between every pair of orderings, as a share of
        # the 23 005 candidate pairs.
        out.append(dict(ref=r, orders=rows))
    return out


# ----------------------------------------------------------------------- main

def main():
    want_ledger = "--ledger" in sys.argv
    say("matrices…")
    M = matrices()
    say("census…")
    C = census(M)
    say("triangle inequality…")
    T = triangle(M)
    say("asymmetry…")
    A = asymmetry(M)
    say("role flips…")
    F = role_flips(M)

    refs = ordering_references()
    O = orderings(M, refs)

    def trip(t):
        ratio, r, a, b, outs = t
        return dict(ratio=ratio, ref=r, a=a, b=b, outcomes=list(outs))

    # The reader's gallery is not a selection of good cases. Five formulas can
    # divide in exactly fifteen ways — one of them alone against four, or two
    # of them against three. Every one of the fifteen is on the page, with the
    # loudest case of that division and how often it happens. Nothing was
    # picked for how it looks.
    from itertools import combinations as _comb
    all_coalitions = [tuple(k) for n in (1, 2)
                      for k in _comb(range(len(MEASURES)), n)]
    eye = []
    for key in sorted(all_coalitions, key=lambda k: (-C["coalition"].get(k, 0), k)):
        n = C["coalition"].get(key, 0)
        best = C["coalition_best"].get(key)
        eye.append(dict(minority=[MEASURES[i] for i in key], count=n,
                        case=trip(best) if best else None))

    data = dict(
        palette=dict(steps=list(range(6)), hex=HEX,
                     rgb=[list(c) for c in RGB],
                     lab=[[round(v, 6) for v in L] for L in LAB]),
        measures=[dict(key=m, label=LABELS[m], symmetric=SYMMETRIC[m]) for m in MEASURES],
        per_reference=dict(pairs=N * (N - 1) // 2 - (N - 1),
                           contradicted=C["per_ref_contra"],
                           ties=C["per_ref_ties"]),
        orderings=O,
        loudest=[trip(t) for t in C["loud"][:GAL_LOUD]],
        eye=eye,
        triangle={m: dict(violations=T[m]["violations"],
                          beyond_rounding=T[m]["beyond_rounding"],
                          max_absolute_gap=T[m]["max_absolute_gap"],
                          worst=[dict(exceed=w[0], a=w[1], b=w[2], c=w[3],
                                      direct=w[4], via=w[5])
                                 for w in T[m]["worst"][:GAL_TRI]])
                  for m in MEASURES},
        asymmetry={m: dict(pairs=A[m]["pairs_asymmetric"],
                           symmetric_pairs=A[m]["symmetric_pairs"],
                           worst=[dict(rel=w[0], i=w[1], j=w[2], ij=w[3], ji=w[4])
                                  for w in A[m]["worst"][:GAL_FLIP]])
                   for m in MEASURES},
        flips={m: dict(flips=F[m]["flips"],
                       worst=[dict(sep=w[0], ref=w[1], a=w[2], b=w[3],
                                   fa=w[4], fb=w[5], ra=w[6], rb=w[7])
                              for w in F[m]["worst"][:GAL_FLIP]])
               for m in MEASURES},
    )

    counts = dict(
        palette_size=N,
        pairs=N * (N - 1) // 2,
        triples=C["total"],
        unanimous=C["unanimous"],
        contradicted=C["contradicted"],
        abstained_only=C["abstained_only"],
        ties={m: C["ties"][i] for i, m in enumerate(MEASURES)},
        alone_against_four={m: C["alone"][i] for i, m in enumerate(MEASURES)},
        coalition_total=sum(C["coalition"].values()),
        per_reference_pairs=(N - 1) * (N - 2) // 2,
        per_reference_contradicted=C["per_ref_contra"],
        pair_disagree={m: {n: C["pair_disagree"][i][j]
                           for j, n in enumerate(MEASURES)}
                       for i, m in enumerate(MEASURES)},
        ratio_edges=list(RATIO_EDGES),
        bucket_total=C["bucket_total"],
        bucket_contra=C["bucket_contra"],
        split_shape={"%d-%d-%d" % k: v for k, v in
                     sorted(C["split_shape"].items(), key=lambda kv: -kv[1])},
        ordered_triples=N * (N - 1) * (N - 2),
        triangle_violations={m: data["triangle"][m]["violations"] for m in MEASURES},
        triangle_beyond_rounding={m: data["triangle"][m]["beyond_rounding"] for m in MEASURES},
        triangle_max_absolute_gap={m: data["triangle"][m]["max_absolute_gap"] for m in MEASURES},
        asymmetric_pairs={m: data["asymmetry"][m]["pairs"] for m in MEASURES},
        role_flips={m: data["flips"][m]["flips"] for m in MEASURES},
    )

    blob = bytes(C["ledger"])
    counts["ledger_sha256"] = hashlib.sha256(blob).hexdigest()
    counts["ledger_bytes"] = len(blob)
    say("ledger sha256", counts["ledger_sha256"])
    if want_ledger:
        with open("ledger.txt", "wb") as f:
            f.write(blob)
        say("ledger written, %d bytes" % len(blob))

    with open("data.json", "w") as f:
        json.dump(data, f, separators=(",", ":"), sort_keys=True)
    with open("counts.json", "w") as f:
        json.dump(counts, f, indent=1, sort_keys=True)
    say("wrote data.json, counts.json")


if __name__ == "__main__":
    main()
