from redaction.build import MIN_REMOVED_TOKENS, day_record, make_redaction, rank
from redaction.cdx import Capture
from redaction.salience import Salience
from redaction.textdiff import Removal
from redaction.watchlist import WatchItem

ITEM = WatchItem("https://x.test/p", "Inst", "A page")


def _red(rid, score, tokens, url="https://x.test/p", ts="20260610"):
    return {
        "id": rid,
        "url": url,
        "salience": {"score": score, "signals": []},
        "removed_tokens": tokens,
        "after": {"wayback_ts": ts},
    }


def test_make_redaction_drops_cosmetic_below_threshold():
    r = make_redaction(
        ITEM, "removal",
        Capture("20260601", "200", "A"), Capture("20260610", "200", "B"),
        Removal(passages=["tiny"], tokens=MIN_REMOVED_TOKENS - 1),
        Salience(0, []), ITEM.url,
    )
    assert r is None


def test_make_redaction_keeps_substantive():
    r = make_redaction(
        ITEM, "removal",
        Capture("20260601", "200", "A"), Capture("20260610", "200", "B"),
        Removal(passages=["x " * 20], tokens=20),
        Salience(5, ["number"]), ITEM.url,
    )
    assert r is not None and r["kind"] == "removal" and r["salience"]["score"] == 5
    assert r["before"]["url"].startswith("https://web.archive.org/web/20260601/")


def test_rank_picks_highest_score_times_tokens():
    reds = [_red("a", 2, 10), _red("b", 5, 10), _red("c", 5, 9)]
    assert rank(reds) == "b"


def test_rank_none_when_all_zero():
    assert rank([_red("a", 0, 100)]) is None


def test_day_record_shape():
    rec = day_record("2026-06-25", "2026-06-25T05:30:00Z", [], watched_count=30)
    assert rec["date"] == "2026-06-25" and rec["pick"] is None
    assert rec["watched_count"] == 30 and rec["changed_count"] == 0
    assert rec["salience_version"] and rec["schema_version"] and rec["pipeline_version"]
