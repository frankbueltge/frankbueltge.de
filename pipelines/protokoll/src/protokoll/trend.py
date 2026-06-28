"""Trend-Klassifikation gegen den 12-Monats-Trend (reines Python, keine Numerik-Libs).

Eine Größe gilt als „verschlechtert", wenn die Steigung ihrer 365-Tage-Regression in die
offengelegte Verschlechterungsrichtung zeigt und die vorhergesagte Änderung über dem
Trendrauschen (eps_frac) liegt; sonst „verbessert" bzw. „unverändert". Zu wenige Punkte im
Fenster → None (Trend noch nicht etabliert).
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Literal

TrendClass = Literal["worsened", "improved", "unchanged"]

# Indexfähige TOPs + Richtung, in die „schlechter" zeigt. Alles andere ist Kontext (kein Index).
WORSE_DIRECTION: dict[str, Literal["up", "down"]] = {
    "co2": "up",
    "seaice_north": "down",
    "seaice_south": "down",
    "sst": "up",
    "refugees": "up",
    "food": "up",
    "conflict": "up",
    "fires": "up",
}


def _slope(xs: list[float], ys: list[float]) -> float:
    n = len(xs)
    mx = sum(xs) / n
    my = sum(ys) / n
    num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    den = sum((x - mx) ** 2 for x in xs)
    return num / den if den else 0.0


def classify_trend(
    series: list[tuple[date, float]],
    *,
    worse: Literal["up", "down"],
    window_days: int = 365,
    eps_frac: float = 0.001,
    min_points: int = 8,
) -> TrendClass | None:
    if not series:
        return None
    latest_date = series[-1][0]
    cutoff = latest_date - timedelta(days=window_days)
    window = [(d, v) for d, v in series if d >= cutoff]
    if len(window) < min_points:
        return None
    xs = [float(d.toordinal()) for d, _ in window]
    ys = [v for _, v in window]
    slope = _slope(xs, ys)
    span = (xs[-1] - xs[0]) or 1.0
    predicted = slope * span
    mean_y = sum(ys) / len(ys)
    if abs(predicted) < eps_frac * abs(mean_y):
        return "unchanged"
    rising = slope > 0
    worsening = (rising and worse == "up") or (not rising and worse == "down")
    return "worsened" if worsening else "improved"
