"""Last-digit uniformity test. Heaping (e.g. rounding to 0/5) is a fabrication tell."""
from __future__ import annotations

CRITICAL_9DOF_05 = 16.92  # chi-square critical value, 9 dof, p=0.05


def last_digit(x: float) -> int:
    return int(abs(round(float(x)))) % 10


def analyze(numbers: list[float]) -> dict:
    obs = [0] * 10
    for x in numbers:
        obs[last_digit(x)] += 1
    n = sum(obs)
    exp = n / 10 if n else 0
    chi2 = sum((o - exp) ** 2 / exp for o in obs) if exp else 0.0
    return {
        "n": n,
        "observed": [o / n for o in obs] if n else [0.0] * 10,
        "chi2": round(chi2, 4),
        "verdict": "heaped" if chi2 > CRITICAL_9DOF_05 else "uniform",
    }
