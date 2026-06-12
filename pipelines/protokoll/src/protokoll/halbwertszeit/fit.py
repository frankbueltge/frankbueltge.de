"""Zerfallsfit: Sockel (Median der letzten 14 Tage) + log-lineare Regression auf den
Post-Peak-Verlauf. Ehrlichkeit vor Schönheit: schlechte Fits werden Status, nie geglättet."""
from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date

MIN_PEAK = 1_000      # darunter: keine messbare Anteilnahme
MIN_R2 = 0.30         # darunter: kein belastbarer Zerfall
MIN_POINTS = 8
RUNNING_DAYS = 21     # so jung, dass die Messung als vorläufig gilt
BASELINE_WINDOW = 14


@dataclass(frozen=True)
class FitResult:
    peak_day: str
    peak: int
    baseline: int
    lambda_per_day: float | None
    halflife_days: float | None
    r2: float | None
    status: str  # gemessen | laeuft | nicht_messbar


def _not_measurable(peak_day: str, peak: int, baseline: int, r2: float | None = None) -> FitResult:
    return FitResult(peak_day=peak_day, peak=peak, baseline=baseline,
                     lambda_per_day=None, halflife_days=None, r2=r2, status="nicht_messbar")


def fit_series(series: list[tuple[str, int]], today: str) -> FitResult:
    days = sorted((date.fromisoformat(d), int(v)) for d, v in series)
    peak_i = max(range(len(days)), key=lambda i: days[i][1])
    peak_day, peak = days[peak_i]
    running = (date.fromisoformat(today) - peak_day).days < RUNNING_DAYS

    if peak < MIN_PEAK:
        return _not_measurable(peak_day.isoformat(), peak, 0)

    post = [((d - peak_day).days, v) for d, v in days[peak_i:]]
    tail = sorted(v for _, v in post[-min(BASELINE_WINDOW, len(post)):])
    baseline = tail[len(tail) // 2]
    pts = [(x, math.log(v - baseline)) for x, v in post if v - baseline > 0]

    if len(pts) < MIN_POINTS:
        if running:
            return FitResult(peak_day.isoformat(), peak, baseline, None, None, None, "laeuft")
        return _not_measurable(peak_day.isoformat(), peak, baseline)

    n = len(pts)
    sx = sum(x for x, _ in pts)
    sy = sum(y for _, y in pts)
    sxx = sum(x * x for x, _ in pts)
    sxy = sum(x * y for x, y in pts)
    denom = n * sxx - sx * sx
    if denom == 0:
        return _not_measurable(peak_day.isoformat(), peak, baseline)
    slope = (n * sxy - sx * sy) / denom
    intercept = (sy - slope * sx) / n
    mean_y = sy / n
    ss_tot = sum((y - mean_y) ** 2 for _, y in pts)
    ss_res = sum((y - (intercept + slope * x)) ** 2 for x, y in pts)
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0.0
    lam = -slope

    status = "laeuft" if running else "gemessen"
    if lam <= 0 or r2 < MIN_R2:
        if running:
            return FitResult(peak_day.isoformat(), peak, baseline, None, None, round(r2, 3), "laeuft")
        return _not_measurable(peak_day.isoformat(), peak, baseline, round(r2, 3))

    return FitResult(peak_day.isoformat(), peak, baseline,
                     round(lam, 5), round(math.log(2) / lam, 2), round(r2, 3), status)
