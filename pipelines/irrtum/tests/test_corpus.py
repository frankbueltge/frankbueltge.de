from pathlib import Path
from irrtum.corpus import load_series

FIX = Path(__file__).parent / "fixtures" / "protokoll"

def test_load_series_groups_by_top_id_and_skips_nonfinite():
    s = load_series(FIX)
    assert s["co2"] == {"2026-06-01": 420.0, "2026-06-02": 421.0, "2026-06-03": 422.5}
    assert s["sst"]["2026-06-03"] == 20.6
    # fires hat nur an 2 Tagen einen Zahlenwert (null wird übersprungen)
    assert "2026-06-01" not in s["fires"]
    assert len(s["fires"]) == 2
