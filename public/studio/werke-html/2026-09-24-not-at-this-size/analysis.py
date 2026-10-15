"""
NOT AT THIS SIZE — the reconstruction engine.

Two questions, both answered by exhaustive integer arithmetic, nothing sampled
and nothing floating-point:

  1. Given a percentage printed to one decimal place and a population size n,
     which integer counts k (0 <= k <= n) print exactly that percentage under
     a stated rounding rule? candidates() answers this by walking every k.

  2. Given several such percentages that are known to share totals (a table's
     own row and column structure — darker-female plus darker-male equals
     darker, female plus male equals the row total, and so on), which of the
     otherwise-ambiguous candidate counts are jointly consistent? solve_row()
     answers this by constraint propagation over the candidate sets, not by
     recomputing anything from outside the table.

Three rounding rules are implemented because a paper's own convention is
never stated in Gender Shades' Table 4 or Table 5, and the three in common
use disagree often enough to matter (this house's own OF HOW MANY, 2026-09-
23, mapped exactly where): round-half-up, round-half-to-even (banker's
rounding), and truncation.
"""
from fractions import Fraction as Fr
import math


def printed_value(k, n, rule):
    """The digit printed at one decimal place for k of n, under one rule, as
    an integer in tenths of a percent (so 34.7 % is represented as 347)."""
    x = Fr(k, n) * 1000
    floor_ = math.floor(x)
    frac = x - floor_
    if rule == "trunc":
        return floor_
    if frac > Fr(1, 2):
        return floor_ + 1
    if frac < Fr(1, 2):
        return floor_
    if rule == "half_up":
        return floor_ + 1
    return floor_ if floor_ % 2 == 0 else floor_ + 1  # half_even


def _as_tenths(pct_str):
    return round(Fr(pct_str) * 10)


def candidates(pct_str, n, rule="half_up"):
    """Every integer count k in [0, n] whose printed percentage, under rule,
    is exactly pct_str (a string like '34.7')."""
    want = _as_tenths(pct_str)
    return [k for k in range(0, n + 1) if printed_value(k, n, rule) == want]


def nearest_denominator(pct_str, n0, rule="half_up", max_window=80):
    """The population size closest to n0 (by absolute difference, ties broken
    toward the smaller size) at which pct_str is exactly printable under
    rule. Returns (delta, n, [k, ...]) or None if nothing is found within
    max_window on either side."""
    for dn in range(0, max_window):
        signs = (-1, 1) if dn > 0 else (0,)
        for sign in signs:
            nn = n0 + sign * dn
            if nn <= 0:
                continue
            c = candidates(pct_str, nn, rule)
            if c:
                return sign * dn, nn, c
    return None


def solve_row(n, pcts, rule="half_up"):
    """Given a Table-2-style row — a total n and the eight percentages F, M,
    Darker, Lighter, DF, DM, LF, LM — find every quadruple (DF, DM, LF, LM)
    of integer counts that is simultaneously consistent with all eight
    printed percentages and with the row's own arithmetic identity
    (DF+DM+LF+LM = n, DF+DM = Darker's count, LF+LM = Lighter's count,
    DF+LF = F's count, DM+LM = M's count). No count outside the four
    candidate sets already licensed by the printed percentages is ever
    considered — nothing is imported from outside the table.
    """
    F_c = set(candidates(pcts["F"], n, rule))
    M_c = set(candidates(pcts["M"], n, rule))
    D_c = set(candidates(pcts["Darker"], n, rule))
    L_c = set(candidates(pcts["Lighter"], n, rule))
    DF_c = candidates(pcts["DF"], n, rule)
    DM_c = candidates(pcts["DM"], n, rule)
    LF_c = candidates(pcts["LF"], n, rule)
    LM_c = candidates(pcts["LM"], n, rule)

    solutions = []
    for df in DF_c:
        for dm in DM_c:
            if (df + dm) not in D_c:
                continue
            for lf in LF_c:
                for lm in LM_c:
                    if (lf + lm) not in L_c:
                        continue
                    if df + dm + lf + lm != n:
                        continue
                    if (df + lf) not in F_c:
                        continue
                    if (dm + lm) not in M_c:
                        continue
                    solutions.append((df, dm, lf, lm))
    return solutions


RULES = ("half_up", "half_even", "trunc")


def audit_cell(table_label, classifier, group, n, pct_str):
    """One cell of the audit: is pct_str exactly printable at n?

    status is one of:
      "ok"         — printable under round-half-up or round-half-to-even
                     (the two conventions that agree wherever there is no
                     exact tie, and the ones a reader would assume by
                     default).
      "trunc_only" — not printable by rounding, but printable if the paper
                     truncated instead.
      "broken"     — not printable under any of the three conventions, at
                     this exact size.
    """
    matches = {r: candidates(pct_str, n, r) for r in RULES}
    if matches["half_up"] or matches["half_even"]:
        status = "ok"
    elif matches["trunc"]:
        status = "trunc_only"
    else:
        status = "broken"
    entry = {
        "table": table_label, "classifier": classifier, "group": group,
        "n": n, "printed": pct_str, "matches": matches, "status": status,
        "exact": status != "broken",
    }
    if status == "broken":
        entry["nearest"] = {
            r: (lambda res: {"delta": res[0], "n": res[1], "k": res[2]} if res else None)
               (nearest_denominator(pct_str, n, r))
            for r in RULES
        }
    return entry
