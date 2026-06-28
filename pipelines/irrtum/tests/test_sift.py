from irrtum.sift import sift, Finding

def _ramp(start, step, days):
    return {f"2026-06-{d:02d}": start + step * i for i, d in enumerate(range(1, days + 1))}

def test_sift_finds_strong_correlation():
    # a und b steigen exakt parallel → r≈1; c fällt → stark negativ zu a/b
    series = {
        "a": _ramp(400, 1.0, 10),
        "b": _ramp(20, 0.5, 10),
        "c": _ramp(100, -2.0, 10),
    }
    f = sift(series, min_overlap=5, k=500, seed=20260603)
    assert isinstance(f, Finding)
    assert f.n == 10
    assert abs(f.r) > 0.99          # perfekt (anti-)korreliert
    assert f.fdr <= 0.05            # bei perfekter Korrelation selten durch Zufall
    assert set(f.pair) <= {"a", "b", "c"}

def test_sift_returns_none_without_overlap():
    series = {"a": {"2026-06-01": 1.0}, "b": {"2026-06-02": 2.0}}
    assert sift(series, min_overlap=5) is None
