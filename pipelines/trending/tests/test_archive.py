import json
from datetime import date

from trending.archive import load_days, wikipedia_presence


def test_load_days_orders_filters_and_limits(tmp_path):
    d = tmp_path / "src" / "data" / "trending"
    d.mkdir(parents=True)
    for day in ("2026-08-30", "2026-08-31", "2026-09-01", "2026-09-02"):
        (d / f"{day}.json").write_text(json.dumps({"$contract": "trending-day/1", "date": day}))
    (d / "latest.json").write_text("{}")
    (d / "2026-08-29.json").write_text("not json")
    days = load_days(tmp_path, date(2026, 9, 2), n=2)
    assert [x["date"] for x in days] == ["2026-08-31", "2026-09-01"]
    assert load_days(tmp_path / "nowhere", date(2026, 9, 2)) == []


def test_wikipedia_presence_counts_days_not_rows():
    days = [{"signals": {"wikipedia": [{"geo": "en", "meta": {"article": "A"}},
                                       {"geo": "en", "meta": {"article": "A"}},
                                       {"geo": "de", "meta": {"article": "A"}}]}},
            {"signals": {"wikipedia": [{"geo": "en", "label": "A"}]}}]
    assert wikipedia_presence(days, "en") == {"A": 2}
    assert wikipedia_presence(days, "de") == {"A": 1}
