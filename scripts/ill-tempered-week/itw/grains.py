"""Granulation: a spoken line stretched over a span while its pitch glides (the murmur of the most attended)."""
import numpy as np

from .base import ENGLISH, SR

GRAIN_S = 0.09
SPEAKERS = [v for region in ENGLISH.values() for v in region]


def glide_curve(n: int, p0: float, v: float) -> np.ndarray:
    t = np.arange(n) / SR
    return np.clip(p0 + v * t, -18.0, 18.0)


def granulate(src: np.ndarray, n: int, semis: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """Stretch src over n samples while its pitch follows semis (per output sample): Hann grains of 90 ms,
    a new one every 22.5 ms, each read from where the stretched timeline stands and resampled by the
    ratio at that moment, with 10 ms of jitter in where it is read."""
    g = int(GRAIN_S * SR)
    hop = g // 4
    win = np.hanning(g)
    out = np.zeros(n + g)
    for o in range(0, n, hop):
        ratio = 2 ** (semis[min(o, n - 1)] / 12)
        span = int(g * ratio)
        centre = int(o / n * max(1, len(src) - span)) + int(rng.normal(0, 0.01 * SR))
        a = int(np.clip(centre, 0, max(0, len(src) - span - 1)))
        seg = src[a:a + span + 1]
        if len(seg) < 2:
            continue
        grain = np.interp(np.linspace(0, len(seg) - 1, g), np.arange(len(seg)), seg) * win
        out[o:o + g] += grain
    return out[:n] / 2.0

