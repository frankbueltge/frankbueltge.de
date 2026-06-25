"""Benford first-digit test (symbolic, deterministic). The thresholds are
Nigrini's fixed MAD bands — and their sample-size blindness is the subject."""
from __future__ import annotations

import math

_EXPECTED = [math.log10(1 + 1 / d) for d in range(1, 10)]
_BANDS = ((0.006, "close"), (0.012, "acceptable"), (0.015, "marginal"))


def expected() -> list[float]:
    return list(_EXPECTED)


def leading_digit(x: float) -> int | None:
    x = abs(float(x))
    if x == 0:
        return None
    return int(f"{x:.15e}"[0])  # %e → exactly one nonzero digit before the point


def counts(numbers: list[float]) -> list[int]:
    out = [0] * 9
    for x in numbers:
        d = leading_digit(x)
        if d is not None:
            out[d - 1] += 1
    return out


def mad(obs_props: list[float], exp_props: list[float]) -> float:
    return sum(abs(o - e) for o, e in zip(obs_props, exp_props)) / len(exp_props)


def chi2(obs_counts: list[int], exp_counts: list[float]) -> float:
    return sum((o - e) ** 2 / e for o, e in zip(obs_counts, exp_counts) if e > 0)


def verdict(mad_value: float) -> str:
    for limit, label in _BANDS:
        if mad_value <= limit:
            return label
    return "nonconformity"


def analyze(numbers: list[float]) -> dict:
    c = counts(numbers)
    n = sum(c)
    obs = [ci / n for ci in c] if n else [0.0] * 9
    exp = expected()
    m = mad(obs, exp)
    return {
        "n": n,
        "observed": obs,
        "expected": exp,
        "chi2": round(chi2(c, [n * p for p in exp]), 4),
        "mad": round(m, 6),
        "verdict": verdict(m),
    }
