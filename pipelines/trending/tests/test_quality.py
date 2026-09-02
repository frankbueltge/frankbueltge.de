"""The self-check grades a record against the rubric; every check must be able to fail."""
import json

from trending.quality import RUBRIC_VERSION, assess_day, assess_terms, looks_like_furniture, one_line


def _day(**over):
    sig = lambda src, label, i: {"source": src, "label": label, "url": f"https://x/{src}/{i}", "rank": i,
                                 "magnitude": None, "magnitude_unit": "rank", "links": [], "meta": {}, "geo": None}
    signals = {s: [sig(s, f"{s} item {i}", i) for i in range(1, 41)]
               for s in ("google_trends", "wikipedia", "hackernews")}
    rec = {
        "$contract": "trending-day/1", "date": "2026-09-03", "generated_at": "2026-09-03T06:41:00Z",
        "pipeline_version": "0.2.0", "method_version": "2",
        "sources": [{"id": s, "status": "ok", "note": "", "count": 40} for s in signals],
        "signals": signals,
        "topics": [{"id": "storm-warning", "label": "Storm warning", "platforms": ["google_trends", "hackernews"],
                    "platform_count": 2, "score": 2.5, "category": None, "first_seen": "2026-09-03",
                    "days_hot": 1, "signals": [{"source": "google_trends"}, {"source": "hackernews"}],
                    "links": [], "wikipedia": None}],
        "summary": {"topics_total": 100, "converging": 1, "sources_ok": 3, "sources_total": 3, "top_labels": []},
    }
    rec.update(over)
    return rec


def test_a_sound_day_passes_every_check():
    g = assess_day(_day())
    assert g["ok"] and g["passed"] == g["total"] == 7 and g["rubric_version"] == RUBRIC_VERSION
    assert one_line(g).endswith("passed")


def test_too_many_silent_sources_fail_the_first_check():
    rec = _day()
    for s in rec["sources"][1:]:
        s["status"] = "unavailable"
    g = assess_day(rec, {"quality_min_sources_share": 0.6})
    by = {c["id"]: c for c in g["checks"]}
    assert not by["sources_answering"]["ok"] and not g["ok"]
    assert "sources_answering" in one_line(g)


def test_a_thin_day_and_a_giant_cluster_are_caught():
    rec = _day()
    rec["signals"] = {"hackernews": rec["signals"]["hackernews"][:5]}
    g = assess_day(rec, {"quality_min_signals": 100})
    assert not {c["id"]: c for c in g["checks"]}["signals_present"]["ok"]
    rec = _day()
    rec["topics"][0]["signals"] = [{"source": "x"}] * 60  # half of 120 signals in one cluster
    g = assess_day(rec)
    assert not {c["id"]: c for c in g["checks"]}["no_giant_cluster"]["ok"]


def test_labels_ids_and_the_wikipedia_filter_are_checked():
    rec = _day()
    rec["topics"].append({**rec["topics"][0], "id": "storm-warning", "label": "12345"})
    rec["signals"]["wikipedia"][0]["label"] = "Special:Search"
    g = assess_day(rec)
    by = {c["id"]: c for c in g["checks"]}
    assert not by["labels_sane"]["ok"]
    assert not by["topic_ids_unique"]["ok"]
    assert not by["wikipedia_filter_held"]["ok"]
    assert looks_like_furniture("Hauptseite") and looks_like_furniture("Kategorie:Physik")
    assert not looks_like_furniture("Toxic (2026 film)")


def test_the_size_ceiling_is_a_check_not_a_crash():
    rec = _day()
    g = assess_day(rec, {"quality_max_bytes": 10})
    assert not {c["id"]: c for c in g["checks"]}["size_within_bounds"]["ok"]
    json.dumps(g)  # the grade itself is plain JSON


def _terms(**over):
    rec = {
        "$contract": "trending-terms/1", "date": "2026-09-03",
        "sources": [{"id": p, "status": "ok"} for p in ("hackernews", "google_news", "github", "arxiv", "reddit", "wikipedia_views")],
        "terms": [{"slug": "loop-engineering", "status": "rising", "total": {"d1": 2, "d7": 10, "d30": 40},
                   "receipts": [{"title": "t", "url": "https://x", "date": "2026-09-02"}]}],
        "candidates": [{"ngram": "a b"}] * 5,
    }
    rec.update(over)
    return rec


def test_a_sound_terms_record_passes():
    g = assess_terms(_terms())
    assert g["ok"] and g["total"] == 7


def test_terms_checks_catch_nesting_status_receipts_and_candidates():
    rec = _terms()
    rec["terms"][0]["total"] = {"d1": 5, "d7": 3, "d30": 40}
    rec["terms"][0]["status"] = "hot"
    rec["terms"][0]["receipts"].append({"title": "no date", "url": "https://y"})
    rec["candidates"] = [{"ngram": "x"}] * 31
    for s in rec["sources"][2:]:
        s["status"] = "unavailable"
    g = assess_terms(rec, {"discover_top": 30})
    by = {c["id"]: c for c in g["checks"]}
    assert not by["windows_monotone"]["ok"]
    assert not by["statuses_named"]["ok"]
    assert not by["receipts_complete"]["ok"]
    assert not by["candidates_bounded"]["ok"]
    assert not by["platforms_answering"]["ok"]
    assert g["passed"] == 2  # only the size and promotion checks survive


def test_an_overlong_or_duplicate_promotion_fails_its_check():
    rec = _terms(promoted=[{"slug": "a"}, {"slug": "a"}, {"slug": "b"}, {"slug": "c"}])
    g = assess_terms(rec, {"promote_max_per_run": 3})
    assert not {c["id"]: c for c in g["checks"]}["promotions_bounded"]["ok"]
    already = _terms(promoted=[{"slug": "loop-engineering"}])
    g = assess_terms(already)
    assert not {c["id"]: c for c in g["checks"]}["promotions_bounded"]["ok"]
