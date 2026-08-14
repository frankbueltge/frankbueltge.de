from redaction.world.recheck import (
    BOTWALL,
    GONE_404,
    LEGAL_451,
    OK,
    SERVER_ERROR,
    UNREACHABLE,
    classify_code,
    summarize,
    wilson,
)

MANIFEST = {"pool_day": "2026-08-12", "drawn_at": "2026-08-13T05:40:00Z"}


def _res(cls, url="https://x.test/a", code=200):
    return {
        "url": url, "domain": "x.test", "title": "T", "first_seen": "20260812060000",
        "class": cls, "http_code": code,
    }


def test_classify_codes():
    assert classify_code(200) == OK
    assert classify_code(404) == GONE_404
    assert classify_code(451) == LEGAL_451
    assert classify_code(403) == BOTWALL
    assert classify_code(429) == BOTWALL
    assert classify_code(503) == SERVER_ERROR


def test_wilson_is_sane():
    lo, hi = wilson(11, 273)
    assert 0.0 < lo < 11 / 273 < hi < 0.1
    assert wilson(0, 0) == (0.0, 0.0)


def test_summarize_separates_451_from_gone():
    results = (
        [_res(OK, f"https://x.test/{i}") for i in range(262)]
        + [_res(GONE_404, "https://x.test/g", 404)]
        + [_res(LEGAL_451, f"https://x.test/l{i}", 451) for i in range(10)]
        + [_res(BOTWALL, f"https://x.test/b{i}", 403) for i in range(16)]
        + [_res(UNREACHABLE, f"https://x.test/u{i}", None) for i in range(11)]
    )
    s = summarize(results, sample_manifest=MANIFEST)
    assert s["decided"] == 273 and s["excluded_unverifiable"] == 27
    assert s["gone"] == 1 and s["legal_451"] == 10
    assert s["gone_rate"] != s["legal_451_rate"]
    lo, hi = s["gone_ci95"]
    assert lo <= s["gone_rate"] <= hi


def test_summarize_receipts_carry_committed_fields():
    results = [_res(GONE_404, "https://x.test/gone", 404), _res(OK)]
    s = summarize(results, sample_manifest=MANIFEST)
    (receipt,) = s["receipts"]
    assert receipt["title"] == "T" and receipt["first_seen"] == "20260812060000"
    assert receipt["class"] == GONE_404


def test_summarize_empty_denominator_is_honest():
    s = summarize([_res(BOTWALL, code=403)], sample_manifest=MANIFEST)
    assert s["gone_rate"] is None and s["decided"] == 0
