from datetime import date

from round_number.build import analyze_series, day_record, rotation_pick
from round_number.datasets import Dataset

DS = Dataset(
    id="d1", name="N", institution="I", synthetic=False,
    source={"name": "s", "url": "https://x.test", "license": "l", "retrieved": "2026-06-25"},
    values=[float(x) for x in range(1, 401)],
)


def test_analyze_series_shape():
    r = analyze_series(DS)
    assert r["id"] == "d1" and r["n"] == 400
    assert set(r["benford"]) >= {"observed", "expected", "mad", "verdict"}
    assert "false_positive_rate" in r["control"]
    assert r["control"]["seed"] == 400


def test_rotation_is_deterministic_by_date():
    ids = ["a", "b", "c"]
    p1 = rotation_pick(ids, "2026-06-25")
    assert p1 in ids
    assert rotation_pick(ids, "2026-06-25") == p1
    assert rotation_pick(ids, "2026-06-26") == ids[date(2026, 6, 26).toordinal() % 3]


def test_day_record_has_pick_and_versions():
    rec = day_record("2026-06-25", "2026-06-25T05:00:00Z", [analyze_series(DS)], "d1")
    assert rec["pick"] == "d1" and rec["method_version"]
    assert len(rec["series"]) == 1
