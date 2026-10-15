"""The term tracker: windows, dedupe, caps, the status rule and first_seen."""
import json
from datetime import date, datetime, timedelta, timezone
from email.utils import format_datetime

import httpx
import pytest

from trending import tracker
from trending.tracker import TermContext, Match

from conftest import make_client

NOW = datetime(2026, 9, 2, 12, 0, 0, tzinfo=timezone.utc)

TERM = {"term": "loop engineering", "slug": "loop-engineering", "aliases": ["loop-engineering"],
        "added": "2026-09-02", "origin": "editorial", "note": "",
        "wikipedia_article": "Knowledge_graph"}
PLAIN = {**TERM, "aliases": [], "wikipedia_article": None}


def ago(days: float) -> datetime:
    return NOW - timedelta(days=days)


def ctx(handler, **kw) -> TermContext:
    """No throttling in the tests: the delay is the platform's rule, not the counting rule."""
    return TermContext(client=make_client(handler), now=NOW, rules=kw.pop("rules", {}),
                       clock=lambda: NOW,
                       throttles={p: 0.0 for p in (*tracker.PLATFORMS, "devto")}, **kw)


# ------------------------------------------------------------------------------- the fixtures

def hn_payload(**kw):
    return {"nbPages": 1, "hits": [
        {"objectID": "1", "title": "Loop engineering in practice", "url": "https://a.example/1",
         "created_at_i": int(ago(0.2).timestamp()), "story_text": "SECRET BODY"},
        {"objectID": "2", "title": "Loop engineering, three months in", "url": "https://a.example/2",
         "created_at_i": int(ago(3).timestamp())},
        {"objectID": "3", "title": "A loop engineering reading list", "url": "https://a.example/3",
         "created_at_i": int(ago(20).timestamp())},
        {"objectID": "4", "title": "Too old to count", "url": "https://a.example/4",
         "created_at_i": int(ago(40).timestamp())},
        {"objectID": "5", "title": "Discussed on HN without a link", "url": "",
         "created_at_i": int(ago(2).timestamp())},
    ], **kw}


def news_payload(titles=None):
    items = titles or [("Loop engineering arrives - The Paper", 0.5),
                       ("What loop engineering means - Trade Weekly", 4.0),
                       ("Loop engineering, revisited - The Paper", 25.0)]
    body = "".join(
        f"<item><title>{t}</title><link>https://n.example/{i}</link>"
        f"<pubDate>{format_datetime(ago(d))}</pubDate></item>"
        for i, (t, d) in enumerate(items))
    return f"<rss version='2.0'><channel>{body}</channel></rss>"


def github_payload(total=3):
    return {"total_count": total, "items": [
        {"full_name": "acme/loop-engineering", "html_url": "https://github.com/acme/loop",
         "created_at": ago(0.4).strftime("%Y-%m-%dT%H:%M:%SZ"),
         "description": "SECRET BODY"},
        {"full_name": "beta/loops", "html_url": "https://github.com/beta/loops",
         "created_at": ago(6).strftime("%Y-%m-%dT%H:%M:%SZ")},
        {"full_name": "gamma/older", "html_url": "https://github.com/gamma/older",
         "created_at": ago(29).strftime("%Y-%m-%dT%H:%M:%SZ")},
    ]}


def atom_payload(entries, *, link_attr=False):
    body = ""
    for i, (title, days) in enumerate(entries):
        stamp = ago(days).strftime("%Y-%m-%dT%H:%M:%SZ")
        link = (f"<link href='https://r.example/{i}'/>" if link_attr
                else f"<id>https://arxiv.org/abs/{i}</id>")
        body += (f"<entry><title>{title}</title>{link}<published>{stamp}</published>"
                 f"<summary>SECRET BODY</summary></entry>")
    return f"<feed xmlns='http://www.w3.org/2005/Atom'>{body}</feed>"


def views_payload(days=31, per_day=100):
    items = [{"timestamp": (NOW - timedelta(days=n)).strftime("%Y%m%d") + "00",
              "views": per_day} for n in range(days, 0, -1)]
    return {"items": items}


def route(request):
    url = str(request.url)
    if "hn.algolia.com" in url:
        return httpx.Response(200, json=hn_payload())
    if "news.google.com" in url:
        return httpx.Response(200, text=news_payload())
    if "api.github.com" in url:
        return httpx.Response(200, json=github_payload())
    if "export.arxiv.org" in url:
        return httpx.Response(200, text=atom_payload([("A loop engineering paper", 1.0),
                                                      ("Loop engineering, formally", 12.0)]))
    if "reddit.com" in url:
        return httpx.Response(200, text=atom_payload([("loop engineering thread", 0.1),
                                                      ("older thread", 9.0)], link_attr=True))
    if "wikimedia.org" in url:
        return httpx.Response(200, json=views_payload())
    return httpx.Response(404)


# --------------------------------------------------------------------- one platform at a time

@pytest.mark.parametrize("platform,expected", [
    ("hackernews", {"d1": 1, "d7": 3, "d30": 4, "capped": False}),
    ("google_news", {"d1": 1, "d7": 2, "d30": 3, "capped": False}),
    ("github", {"d1": 1, "d7": 2, "d30": 3, "capped": False}),
    ("arxiv", {"d1": 1, "d7": 1, "d30": 2, "capped": False}),
    ("reddit", {"d1": 1, "d7": 1, "d30": 2, "capped": False}),
])
def test_each_platform_counts_its_own_documents_into_the_three_windows(platform, expected):
    outcomes, report = tracker.track_platform(ctx(route), platform, [PLAIN], log=lambda s: None)
    assert report["status"] == "ok" and report["note"] == ""
    assert outcomes["loop-engineering"].counts == expected


def test_a_hacker_news_story_without_a_link_is_receipted_by_its_discussion():
    outcomes, _ = tracker.track_platform(ctx(route), "hackernews", [PLAIN], log=lambda s: None)
    urls = [r["url"] for r in outcomes["loop-engineering"].receipts]
    assert "https://news.ycombinator.com/item?id=5" in urls


def test_wikipedia_views_sums_the_daily_series_and_is_skipped_without_an_article():
    outcomes, report = tracker.track_platform(ctx(route), "wikipedia_views", [TERM, PLAIN],
                                              log=lambda s: None)
    assert outcomes["loop-engineering"].counts == {"d1": 100, "d7": 700, "d30": 3000,
                                                   "capped": False}
    assert report["status"] == "ok"
    # PLAIN names no article, so it is not asked about at all.
    only, report = tracker.track_platform(ctx(route), "wikipedia_views", [PLAIN],
                                          log=lambda s: None)
    assert only == {} and report["status"] == "unavailable"
    assert report["note"] == "nothing to search"


def test_aliases_are_searched_but_the_same_url_is_counted_once():
    calls = []

    def handler(request):
        calls.append(str(request.url))
        return httpx.Response(200, json=hn_payload())

    outcomes, _ = tracker.track_platform(ctx(handler), "hackernews", [TERM], log=lambda s: None)
    assert len(calls) == 2 and "%22loop+engineering%22" in calls[0]
    assert "%22loop-engineering%22" in calls[1]
    assert outcomes["loop-engineering"].counts == {"d1": 1, "d7": 3, "d30": 4, "capped": False}
    assert len(outcomes["loop-engineering"].receipts) == 4


def test_the_query_is_the_quoted_phrase_on_every_platform():
    calls = []

    def handler(request):
        calls.append(str(request.url))
        return route(request)

    for platform in ("hackernews", "google_news", "github", "arxiv", "reddit"):
        tracker.track_platform(ctx(handler), platform, [PLAIN], log=lambda s: None)
    quoted = [c for c in calls if "%22loop+engineering%22" in c or "%22loop%20engineering%22" in c]
    assert len(quoted) == len(calls) == 5


def test_capped_is_flagged_when_a_feed_hands_out_all_it_has():
    def hn_full(request):
        return httpx.Response(200, json=hn_payload(nbPages=4))

    outcomes, _ = tracker.track_platform(ctx(hn_full), "hackernews", [PLAIN], log=lambda s: None)
    assert outcomes["loop-engineering"].counts["capped"] is True

    def gh_many(request):
        return httpx.Response(200, json=github_payload(total=4321))

    outcomes, _ = tracker.track_platform(ctx(gh_many), "github", [PLAIN], log=lambda s: None)
    assert outcomes["loop-engineering"].counts["capped"] is True

    def news_many(request):
        return httpx.Response(200, text=news_payload([(f"Loop engineering {n} - Paper", 1.0)
                                                      for n in range(95)]))

    outcomes, _ = tracker.track_platform(ctx(news_many), "google_news", [PLAIN],
                                         log=lambda s: None)
    assert outcomes["loop-engineering"].counts["capped"] is True


def test_google_news_drops_a_headline_that_carries_no_word_of_the_phrase():
    def handler(request):
        return httpx.Response(200, text=news_payload([("Loop engineering explained - Paper", 1.0),
                                                      ("Unrelated harvest festival - Paper", 1.0)]))

    outcomes, _ = tracker.track_platform(ctx(handler), "google_news", [PLAIN],
                                         log=lambda s: None)
    assert outcomes["loop-engineering"].counts["d1"] == 1
    assert [r["title"] for r in outcomes["loop-engineering"].receipts] == [
        "Loop engineering explained — Paper"]


def test_receipts_carry_nothing_but_platform_title_url_and_date():
    outcomes, _ = tracker.track_platform(ctx(route), "hackernews", [PLAIN], log=lambda s: None)
    receipts = tracker.merge_receipts({"hackernews": outcomes["loop-engineering"].receipts})
    assert receipts
    for receipt in receipts:
        assert set(receipt) == {"platform", "title", "url", "date"}
    dumped = json.dumps(receipts)
    assert "SECRET BODY" not in dumped and "story_text" not in dumped


def test_no_body_text_from_any_platform_reaches_the_outcome():
    for platform in ("hackernews", "google_news", "github", "arxiv", "reddit"):
        outcomes, _ = tracker.track_platform(ctx(route), platform, [PLAIN], log=lambda s: None)
        dumped = json.dumps([r for r in outcomes["loop-engineering"].receipts])
        assert "SECRET BODY" not in dumped, platform


# --------------------------------------------------------------------------- failure is a note

def test_a_platform_that_fails_everywhere_is_unavailable_and_stops_after_three_tries():
    calls = {"n": 0}

    def handler(request):
        calls["n"] += 1
        return httpx.Response(500)

    terms = [{**PLAIN, "slug": f"term-{n}", "term": f"term {n}"} for n in range(8)]
    outcomes, report = tracker.track_platform(ctx(handler), "hackernews", terms,
                                              log=lambda s: None)
    assert report["status"] == "unavailable"
    assert "stopped after 3 consecutive failures" in report["note"]
    # three phrases, four attempts each (one plus three retries) — not eight terms' worth.
    assert calls["n"] == 12
    # The three that were asked hold zeros; the five after the breaker are not in the map at
    # all. Both read as zero in the record, and the report says why.
    assert sorted(outcomes) == ["term-0", "term-1", "term-2"]
    assert all(o.counts == {"d1": 0, "d7": 0, "d30": 0, "capped": False}
               for o in outcomes.values())


def test_one_failing_phrase_makes_the_platform_partial_not_unavailable():
    def handler(request):
        return httpx.Response(500) if "term+1" in str(request.url) else route(request)

    terms = [{**PLAIN, "slug": "term-0", "term": "loop engineering"},
             {**PLAIN, "slug": "term-1", "term": "term 1"},
             {**PLAIN, "slug": "term-2", "term": "loop engineering"}]
    outcomes, report = tracker.track_platform(ctx(handler), "hackernews", terms,
                                              log=lambda s: None)
    assert report["status"] == "partial" and "term-1" in report["note"]
    assert outcomes["term-2"].counts["d30"] == 4


def test_track_runs_the_six_platforms_in_the_recorded_order():
    by_platform, reports = tracker.track(ctx(route), [TERM], log=lambda s: None)
    assert [r["id"] for r in reports] == list(tracker.PLATFORMS)
    assert all(set(r) == {"id", "name", "url", "status", "note", "retrieved_at"}
               for r in reports)
    assert all(r["retrieved_at"] == "2026-09-02T12:00:00Z" for r in reports)
    assert by_platform["hackernews"]["loop-engineering"].counts["d30"] == 4


# ------------------------------------------------------------------------------ receipts merge

def test_merge_receipts_keeps_the_newest_but_leaves_room_for_other_platforms():
    loud = [{"date": "2026-09-02", "title": f"loud {n}", "url": f"https://l/{n}"}
            for n in range(10)]
    quiet = [{"date": "2026-08-01", "title": "quiet", "url": "https://q/1"}]
    merged = tracker.merge_receipts({"hackernews": loud, "arxiv": quiet})
    assert len(merged) == 11
    assert sum(1 for r in merged if r["platform"] == "hackernews") == 10
    # The quota admits the one older platform before the loud one fills the list.
    assert sum(1 for r in merged if r["platform"] == "arxiv") == 1
    assert [r["date"] for r in merged] == sorted((r["date"] for r in merged), reverse=True)


def test_merge_receipts_caps_at_twelve_and_dedupes_by_url():
    many = {p: [{"date": "2026-09-01", "title": "t", "url": f"https://x/{p}/{n}"}
                for n in range(9)] for p in ("hackernews", "github", "arxiv")}
    many["reddit"] = [{"date": "2026-09-01", "title": "t", "url": "https://x/github/0"}]
    merged = tracker.merge_receipts(many)
    assert len(merged) == 12
    assert len({r["url"] for r in merged}) == 12


# ------------------------------------------------------------------------- the arithmetic rules

def test_prior_seven_is_the_pace_of_the_twenty_three_days_before():
    assert tracker.prior7({"d1": 0, "d7": 7, "d30": 30}) == pytest.approx(7.0)
    assert tracker.prior7({"d1": 0, "d7": 9, "d30": 9}) == 0.0


def test_ratio_is_null_when_there_is_no_prior():
    assert tracker.ratio({"d1": 1, "d7": 5, "d30": 5}) is None
    assert tracker.ratio({"d1": 2, "d7": 9, "d30": 31}) == 1.34


TODAY = date(2026, 9, 2)


@pytest.mark.parametrize("total,first_seen,expected", [
    ({"d1": 0, "d7": 2, "d30": 40}, "2026-08-30", "quiet"),        # below the minimum
    ({"d1": 0, "d7": 2, "d30": 2}, "2026-09-01", "quiet"),         # quiet beats emerging
    ({"d1": 3, "d7": 10, "d30": 12}, "2026-08-28", "emerging"),    # rising and young
    ({"d1": 3, "d7": 10, "d30": 12}, "2026-01-04", "rising"),      # rising and old
    ({"d1": 1, "d7": 5, "d30": 5}, "2026-08-30", "emerging"),      # no prior at all
    ({"d1": 0, "d7": 3, "d30": 40}, "2026-01-04", "fading"),
    ({"d1": 2, "d7": 9, "d30": 31}, "2026-01-04", "established"),
    ({"d1": 1, "d7": 3, "d30": 11}, "2026-01-04", "quiet"),        # neither, and too small
])
def test_every_branch_of_the_status_rule(total, first_seen, expected):
    assert tracker.status(total, first_seen, TODAY, {}) == expected


def test_the_thresholds_come_from_the_rules_not_from_the_code():
    total = {"d1": 1, "d7": 3, "d30": 11}
    assert tracker.status(total, "2026-01-04", TODAY, {}) == "quiet"
    assert tracker.status(total, "2026-01-04", TODAY, {"established_d30": 10}) == "established"
    assert tracker.status(total, "2026-01-04", TODAY, {"min_mentions_d7": 4}) == "quiet"
    assert tracker.status({"d1": 3, "d7": 10, "d30": 12}, "2026-08-28", TODAY,
                          {"emerging_days": 1}) == "rising"


def test_a_first_seen_the_archive_cannot_parse_never_crashes_the_rule():
    assert tracker.status({"d1": 3, "d7": 10, "d30": 12}, "not-a-date", TODAY, {}) == "rising"
    assert tracker.status({"d1": 3, "d7": 10, "d30": 12}, None, TODAY, {}) == "rising"


# ------------------------------------------------------------------- first_seen and the archive

def _write_terms_file(tmp_path, day, terms, contract=tracker.CONTRACT_TERMS):
    folder = tmp_path / "src" / "data" / "trending" / "terms"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / f"{day}.json").write_text(json.dumps({"$contract": contract, "date": day,
                                                    "terms": terms}) + "\n")


def test_first_seen_comes_from_the_committed_term_files(tmp_path):
    _write_terms_file(tmp_path, "2026-09-01", [
        {"slug": "loop-engineering", "first_seen": "2026-06-14",
         "receipts": [{"date": "2026-08-30", "title": "t", "url": "u"}]},
        {"slug": "vibe-coding", "first_seen": "2026-07-01", "receipts": []},
    ])
    records = tracker.load_terms_files(tmp_path, before=date(2026, 9, 2))
    assert [r["date"] for r in records] == ["2026-09-01"]
    history = tracker.history_first_seen(records)
    assert history == {"loop-engineering": "2026-06-14", "vibe-coding": "2026-07-01"}
    assert tracker.first_seen_for("loop-engineering", added="2026-09-02",
                                  run_earliest="2026-08-10", history=history) == "2026-06-14"
    # A document older than anything the archive knows wins.
    assert tracker.first_seen_for("vibe-coding", added="2026-09-02",
                                  run_earliest="2026-02-02", history=history) == "2026-02-02"
    # A term nobody ever mentioned is first seen the day the watching began.
    assert tracker.first_seen_for("agentic-commerce", added="2026-09-02", run_earliest=None,
                                  history=history) == "2026-09-02"


def test_receipt_dates_of_the_archive_count_towards_first_seen(tmp_path):
    _write_terms_file(tmp_path, "2026-09-01", [
        {"slug": "loop-engineering", "first_seen": "2026-08-20",
         "receipts": [{"date": "2026-08-02", "title": "t", "url": "u"}]}])
    history = tracker.history_first_seen(tracker.load_terms_files(tmp_path))
    assert history["loop-engineering"] == "2026-08-02"


def test_files_of_another_contract_or_of_the_run_day_itself_are_ignored(tmp_path):
    _write_terms_file(tmp_path, "2026-09-02", [{"slug": "x", "first_seen": "2020-01-01"}])
    _write_terms_file(tmp_path, "2026-08-31", [{"slug": "y", "first_seen": "2021-01-01"}],
                      contract="something-else/1")
    assert tracker.load_terms_files(tmp_path, before=date(2026, 9, 2)) == []
    assert tracker.load_terms_files(tmp_path, before=date(2026, 9, 3))[0]["date"] == "2026-09-02"
    assert tracker.load_terms_files(tmp_path) != []


def test_no_terms_folder_is_simply_no_history(tmp_path):
    assert tracker.load_terms_files(tmp_path) == []
    assert tracker.history_first_seen([]) == {}


# ------------------------------------------------------------------------------ small mechanics

def test_tally_drops_what_is_older_than_the_window_and_keeps_the_newest_of_a_url():
    matches = [Match(url="https://a/1", title="new", when=ago(0.5)),
               Match(url="https://a/1", title="same url, older", when=ago(10)),
               Match(url="https://a/2", title="old", when=ago(40))]
    outcome = tracker.tally(matches, NOW)
    assert outcome.counts == {"d1": 1, "d7": 1, "d30": 1, "capped": False}
    assert [r["title"] for r in outcome.receipts] == ["new"]
    assert outcome.earliest == ago(0.5).date().isoformat()


def test_the_windows_end_at_the_run_clock_not_at_midnight():
    outcome = tracker.tally([Match(url="https://a/1", title="t", when=ago(0.9)),
                             Match(url="https://a/2", title="t", when=ago(1.1))], NOW)
    assert outcome.counts["d1"] == 1 and outcome.counts["d7"] == 2


def test_phrases_for_keeps_the_term_first_and_drops_duplicates():
    assert tracker.phrases_for({"term": " loop  engineering ",
                                "aliases": ["Loop Engineering", "loop-engineering", ""]}) == [
        "loop engineering", "loop-engineering"]


def test_parse_when_reads_both_calendars_the_platforms_use():
    assert tracker.parse_when("2026-09-01T10:00:00Z").day == 1
    assert tracker.parse_when("Tue, 01 Sep 2026 10:00:00 GMT").day == 1
    assert tracker.parse_when("") is None and tracker.parse_when("nonsense") is None


def test_a_github_token_is_offered_to_github_and_to_nobody_else(monkeypatch):
    monkeypatch.setenv("GITHUB_TOKEN", "t0ken")
    seen = {}

    def handler(request):
        seen[request.url.host] = request.headers.get("authorization")
        return route(request)

    client = make_client(handler)
    assert tracker.install_github_auth(client) is True
    context = TermContext(client=client, now=NOW, rules={}, github_authenticated=True,
                          clock=lambda: NOW, throttles={"github": 0.0, "hackernews": 0.0})
    tracker.track_platform(context, "github", [PLAIN], log=lambda s: None)
    tracker.track_platform(context, "hackernews", [PLAIN], log=lambda s: None)
    assert seen == {"api.github.com": "Bearer t0ken", "hn.algolia.com": None}
    assert context.throttle_for("github") == 0.0


def test_without_a_token_github_is_throttled_to_the_unauthenticated_rate(monkeypatch):
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    client = make_client(route)
    assert tracker.install_github_auth(client) is False
    context = TermContext(client=client, now=NOW, rules={})
    assert context.throttle_for("github") == 7.0
    assert TermContext(client=client, now=NOW, rules={},
                       github_authenticated=True).throttle_for("github") == 2.0
