import json

from redaction.world.build_world import (
    class_counts,
    classify_rows,
    day_record,
    gdg_section,
    register_entries,
    to_json,
)
from redaction.world.gdg import GdgResult


def _row(url, before, after, domain="x.test",
         fo="2026-08-12T06:00:00Z", fc="2026-08-13T06:00:00Z"):
    return {"page_url": url, "page_domain_root": domain, "page_title": before,
            "title_new": after, "fetched_orig": fo, "fetched_check": fc}


ROWS = [
    _row("https://a.test/1", "Same", "Same - CNN", domain="a.test"),
    _row("https://b.test/2", "5 dead in fire", "9 dead in fire", domain="b.test"),
    _row("https://c.test/3", "Rebels seize town", "Government retakes town", domain="c.test"),
    _row("https://d.test/4", "", "Something", domain="d.test"),  # extraction junk
]


def test_classify_rows_drops_empty_titles():
    classified = classify_rows(ROWS)
    assert len(classified) == 3


def test_class_counts_cover_all_classes():
    counts = class_counts(classify_rows(ROWS))
    assert counts == {"trivial": 1, "update": 1, "reframing": 1, "replaced": 0}


def test_register_entries_carry_before_after_and_window():
    (entry,) = register_entries(classify_rows(ROWS))
    assert entry["before"] == "Rebels seize town"
    assert entry["after"] == "Government retakes town"
    assert entry["window"] == "24h"
    assert entry["weight"] >= 4


def test_one_week_window_detected():
    rows = [_row("https://c.test/3", "Rebels seize town", "Government retakes town",
                 fo="2026-08-06T06:00:00Z")]
    (entry,) = register_entries(classify_rows(rows))
    assert entry["window"] == "1w"


def test_gdg_section_unavailable_is_honest_and_cited():
    s = gdg_section(GdgResult(False, "2026-08-13", note="no bq"), [])
    assert s["available"] is False and s["note"] == "no bq"
    assert "GDELT" in s["notice"]


def test_gdg_section_available_carries_traces_and_notice():
    result = GdgResult(True, "2026-08-13", {"PAGE_TITLECHANGE": 4}, ROWS,
                       [{"job_id": "j1", "bytes_billed": 5}])
    s = gdg_section(result, classify_rows(ROWS))
    assert s["title_changes_en"] == 3 and s["trace"][0]["job_id"] == "j1"
    assert "GDELT" in s["notice"]


def test_day_record_is_versioned_and_json_stable():
    rec = day_record("2026-08-14", "2026-08-14T05:40:00Z",
                     gdg=gdg_section(GdgResult(False, "2026-08-13", note="x"), []),
                     deletion={"available": False, "note": "bootstrap"},
                     sample_committed="src/data/redaction/world/samples/2026-08-13.json")
    assert rec["filter_version"] == "v1" and rec["selection_version"] == "v1"
    parsed = json.loads(to_json(rec))
    assert parsed["date"] == "2026-08-14"
