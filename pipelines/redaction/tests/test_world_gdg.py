import json
import subprocess

import pytest

from redaction.world.gdg import QUERY_COUNTS, QUERY_TITLES, GdgResult, fetch_day


class FakeBq:
    """Stands in for the bq CLI runner: scripted (returncode, stdout) pairs."""

    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = []

    def __call__(self, args, **kw):
        self.calls.append(args)
        rc, out, err = self.responses.pop(0)
        return subprocess.CompletedProcess(args, rc, stdout=out, stderr=err)


def _trace(bytes_billed=26132096):
    return json.dumps({"statistics": {"creationTime": "1786713498404",
                                      "query": {"totalBytesBilled": str(bytes_billed)}}})


def test_query_texts_pin_the_method():
    counts = QUERY_COUNTS.format(day="2026-08-13")
    titles = QUERY_TITLES.format(day="2026-08-13")
    # partition filter on fetchdate_check is the cost lever — mandatory
    assert "DATE(fetchdate_check) = '2026-08-13'" in counts
    assert "DATE(fetchdate_check) = '2026-08-13'" in titles
    assert "PAGE_TITLECHANGE" in titles and "page_lang = 'en'" in titles


def test_fetch_day_rejects_non_dates():
    with pytest.raises(ValueError):
        fetch_day("2026-08-13; DROP TABLE")


def test_fetch_day_parses_counts_rows_and_traces():
    fake = FakeBq([
        (0, json.dumps([{"status": "UNCHANGED_CONTENT", "c": "22"},
                        {"status": "PAGE_TITLECHANGE", "c": "7"}]), ""),
        (0, _trace(), ""),
        (0, json.dumps([{"page_url": "https://x.test/a", "page_domain_root": "x.test",
                         "page_title": "Before", "title_new": "After",
                         "fetched_orig": "2026-08-12T06:00:00Z",
                         "fetched_check": "2026-08-13T06:00:00Z"}]), ""),
        (0, _trace(1000), ""),
    ])
    r = fetch_day("2026-08-13", runner=fake)
    assert r.available and r.counts == {"UNCHANGED_CONTENT": 22, "PAGE_TITLECHANGE": 7}
    assert r.rows[0]["page_title"] == "Before"
    assert [t["bytes_billed"] for t in r.traces] == [26132096, 1000]
    # deterministic, dated job ids
    assert any("--job_id=world_gdg_counts_20260813" in a for call in fake.calls for a in call)


def test_fetch_day_retries_on_job_id_collision():
    fake = FakeBq([
        (1, "", "Already Exists: Job world_gdg_counts_20260813"),
        (0, json.dumps([]), ""),
        (0, _trace(), ""),
        (0, json.dumps([]), ""),
        (0, _trace(), ""),
    ])
    r = fetch_day("2026-08-13", runner=fake)
    assert r.available
    assert any("--job_id=world_gdg_counts_20260813_r2" in a
               for call in fake.calls for a in call)


def test_fetch_day_degrades_honestly_on_auth_failure():
    fake = FakeBq([(1, "", "ERROR: not logged in")])
    r = fetch_day("2026-08-13", runner=fake)
    assert isinstance(r, GdgResult) and not r.available
    assert "not logged in" in (r.note or "")
