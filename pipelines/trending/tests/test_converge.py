from datetime import date

from trending.converge import cluster
from trending.model import Link, Signal, day_to_dict, to_json

RULES = {"jaccard_min": 0.5, "links_cap": 6}
TODAY = date(2026, 9, 2)


def sig(source, label, rank=1, geo=None, url=None, magnitude=None, unit="rank", meta=None, links=()):
    return Signal(source=source, label=label, rank=rank, geo=geo, url=url, magnitude=magnitude,
                  magnitude_unit=unit, meta=meta or {}, links=tuple(links))


def by_label(topics, label):
    return next(t for t in topics if t.label == label)


def test_single_token_labels_match_only_exactly():
    topics = cluster([sig("google_trends", "Cleopatra", geo="US"), sig("wikipedia", "Cleopatra", geo="en"),
                      sig("bluesky", "Cleopatra film")], [], RULES, TODAY)
    exact = by_label(topics, "Cleopatra")
    assert exact.platforms == ("google_trends", "wikipedia")
    assert by_label(topics, "Cleopatra film").platform_count == 1


def test_jaccard_and_containment_between_short_labels():
    topics = cluster([sig("google_trends", "Toxic movie", geo="US"), sig("wikipedia", "Toxic (2026 film)", geo="en"),
                      sig("bluesky", "Red Sox"), sig("mastodon", "Red Sox injury", meta={"kind": "tag"})],
                     [], RULES, TODAY)
    assert by_label(topics, "Toxic movie").platform_count == 1  # jaccard 1/4
    assert by_label(topics, "Red Sox").platforms == ("bluesky", "mastodon")  # containment


def test_label_attaches_to_headline_only_with_two_tokens():
    topics = cluster([sig("google_trends", "mickey gasper", geo="US"),
                      sig("google_news", "Red Sox call up Mickey Gasper as rosters expand"),
                      sig("bluesky", "Gasper"), sig("hackernews", "Gasper joins")], [], RULES, TODAY)
    t = by_label(topics, "mickey gasper")
    assert t.platforms == ("google_news", "google_trends")
    assert by_label(topics, "Gasper").platform_count == 1


def test_two_geos_are_one_platform_and_headlines_need_half_overlap():
    topics = cluster([sig("google_trends", "iphone 18", geo="US"), sig("google_trends", "iphone 18", geo="GB"),
                      sig("google_news", "Apple unveils iPhone 18 lineup"),
                      sig("hackernews", "Apple unveils iPhone 18 with new chip")], [], RULES, TODAY)
    t = by_label(topics, "iphone 18")
    assert t.platform_count == 3 and len(t.signals) == 4


def test_same_source_same_geo_never_matches():
    topics = cluster([sig("google_trends", "storm warning", geo="US", rank=1),
                      sig("google_trends", "storm warning", geo="US", rank=2)], [], RULES, TODAY)
    assert len(topics) == 2 and {t.id for t in topics} == {"storm-warning", "storm-warning-2"}


def test_label_priority_score_links_and_wikipedia():
    topics = cluster([
        sig("hackernews", "Dolly Parton documentary drops", rank=1, url="https://hn.example/a"),
        sig("wikipedia", "Dolly Parton", geo="en", rank=2, magnitude=300_000, unit="views",
            url="https://en.wikipedia.org/wiki/Dolly_Parton", meta={"article": "Dolly_Parton"}),
        sig("google_trends", "dolly parton", geo="US", rank=1, unit="approx_searches",
            links=[Link("Doc drops", "https://news.example/1", "Variety")]),
        sig("google_trends", "other", geo="US", rank=2),
    ], [], RULES, TODAY)
    t = by_label(topics, "dolly parton")
    assert t.platforms == ("google_trends", "hackernews", "wikipedia")
    assert t.wikipedia == {"lang": "en", "article": "Dolly_Parton", "views": 300_000}
    assert t.links[0].url == "https://news.example/1"
    assert {l.url for l in t.links} == {"https://news.example/1", "https://hn.example/a",
                                        "https://en.wikipedia.org/wiki/Dolly_Parton"}
    # heat: google_trends rank 1 of 2 → 1.0; hackernews 1 of 1 → 1.0; wikipedia rank 2 of 1 → 0.0
    assert t.score == 3 + round(2 / 3, 3)
    assert topics[0] is t and t.first_seen == "2026-09-02" and t.days_hot == 1


def test_bluesky_category_carried():
    topics = cluster([sig("bluesky", "USPS mail ballot handling", meta={"category": "politics"}),
                      sig("mastodon", "USPS mail ballot handling row", meta={"kind": "tag"})], [], RULES, TODAY)
    assert topics[0].category == "politics"


def test_memory_first_seen_and_days_hot():
    archive = [{"date": "2026-08-30", "topics": [{"id": "iphone-18", "label": "iphone 18"}]},
               {"date": "2026-08-31", "topics": []},
               {"date": "2026-09-01", "topics": [{"id": "x", "label": "iPhone 18 event"}]}]
    topics = cluster([sig("google_trends", "iphone 18", geo="US")], archive, RULES, TODAY)
    assert topics[0].first_seen == "2026-08-30" and topics[0].days_hot == 2


def test_output_is_byte_identical_for_identical_input():
    from trending.model import DayRecord
    signals = [sig("google_trends", "b", geo="US"), sig("bluesky", "a"), sig("wikipedia", "b", geo="en")]

    def rec():
        topics = cluster(signals, [], RULES, TODAY)
        return to_json(day_to_dict(DayRecord(date="2026-09-02", generated_at="t", pipeline_version="0",
                                             method_version="1", sources=(), signals={}, topics=tuple(topics),
                                             summary={})))
    assert rec() == rec()
    assert rec().endswith("\n") and '"$contract": "trending-day/1"' in rec()
