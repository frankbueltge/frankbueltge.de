from datetime import date

from protokoll.validate import corridor_status, is_stale


def test_corridor_ok_inside_and_on_bounds():
    assert corridor_status(427.3, (350, 500)) == "ok"
    assert corridor_status(350.0, (350, 500)) == "ok"
    assert corridor_status(500.0, (350, 500)) == "ok"


def test_corridor_implausible_outside():
    assert corridor_status(8000.0, (350, 500)) == "implausible"
    assert corridor_status(-3.0, (0, 200)) == "implausible"


def test_corridor_none_means_no_check():
    assert corridor_status(123.0, None) == "ok"


def test_staleness():
    today = date(2026, 6, 12)
    assert is_stale("2026-06-01", today, max_age_days=7) is True
    assert is_stale("2026-06-10", today, max_age_days=7) is False
    assert is_stale("2020-01-01", today, max_age_days=None) is False  # kein Limit
