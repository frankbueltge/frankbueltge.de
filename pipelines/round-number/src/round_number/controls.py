"""The self-skeptical core: how often does the same test flag provably-clean data?
Clean = leading digits drawn from the true Benford pmf. Seeded → reproducible."""
from __future__ import annotations

import random

from round_number.benford import counts, expected, mad

_DIGITS = list(range(1, 10))


def sample_leading_digits(n: int, rng: random.Random) -> list[int]:
    return rng.choices(_DIGITS, weights=expected(), k=n)


def _mad_of_sample(digits: list[int]) -> float:
    c = counts([float(d) for d in digits])  # digit value reused as the number
    n = sum(c)
    obs = [ci / n for ci in c] if n else [0.0] * 9
    return mad(obs, expected())


def false_positive_rate(
    n: int, *, threshold: float = 0.015, samples: int = 500, seed: int
) -> float:
    rng = random.Random(seed)
    flagged = 0
    for _ in range(samples):
        if _mad_of_sample(sample_leading_digits(n, rng)) > threshold:
            flagged += 1
    return round(flagged / samples, 4)
