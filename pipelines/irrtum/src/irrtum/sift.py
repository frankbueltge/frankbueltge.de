"""ML-Sichtung: stärkste |Korrelation| über gemeinsame Tage + Permutations-FDR (numpy)."""
from __future__ import annotations

from dataclasses import dataclass
from itertools import combinations

import numpy as np


@dataclass(frozen=True)
class Finding:
    pair: tuple[str, str]
    r: float
    fdr: float
    n: int


def _aligned(a: dict[str, float], b: dict[str, float]) -> tuple[np.ndarray, np.ndarray]:
    days = sorted(set(a) & set(b))
    return np.array([a[d] for d in days]), np.array([b[d] for d in days])


def sift(series, *, min_overlap: int = 5, k: int = 2000, seed: int | None = None) -> Finding | None:
    best: Finding | None = None
    for x, y in combinations(sorted(series), 2):
        ax, ay = _aligned(series[x], series[y])
        n = len(ax)
        if n < min_overlap or ax.std() == 0 or ay.std() == 0:
            continue
        r = float(np.corrcoef(ax, ay)[0, 1])
        if best is None or abs(r) > abs(best.r):
            best = Finding(pair=(x, y), r=round(r, 4), fdr=0.0, n=n)
    if best is None:
        return None
    # Permutationstest nur für das gewählte Paar: wie oft erreicht eine Zufalls-Permutation |r0|?
    ax, ay = _aligned(series[best.pair[0]], series[best.pair[1]])
    rng = np.random.default_rng(seed)
    hits = sum(1 for _ in range(k)
               if abs(np.corrcoef(ax, rng.permutation(ay))[0, 1]) >= abs(best.r))
    return Finding(pair=best.pair, r=best.r, fdr=round(hits / k, 3), n=best.n)
