from datetime import date

from protokoll.trend import classify_trend


def _rising(worse_to_417: float) -> list[tuple[date, float]]:
    s = [(date(2025, m, 1), 410.0 + m * 0.5) for m in range(1, 13)]
    s.append((date(2026, 1, 1), worse_to_417))
    return s


def test_rising_series_up_is_worsened():
    assert classify_trend(_rising(417.0), worse="up") == "worsened"


def test_falling_series_up_is_improved():
    s = [(date(2025, m, 1), 420.0 - m * 0.5) for m in range(1, 13)]
    s.append((date(2026, 1, 1), 413.0))
    assert classify_trend(s, worse="up") == "improved"


def test_flat_series_is_unchanged():
    s = [(date(2025, m, 1), 410.0) for m in range(1, 13)]
    s.append((date(2026, 1, 1), 410.0))
    assert classify_trend(s, worse="up") == "unchanged"


def test_falling_series_down_is_worsened():
    s = [(date(2025, m, 1), 14.0 - m * 0.1) for m in range(1, 13)]
    s.append((date(2026, 1, 1), 12.5))
    assert classify_trend(s, worse="down") == "worsened"


def test_too_few_points_returns_none():
    s = [(date(2026, 1, 1), 410.0), (date(2026, 2, 1), 411.0)]
    assert classify_trend(s, worse="up") is None
