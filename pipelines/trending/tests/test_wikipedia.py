from datetime import date

import httpx

from trending.sources import wikipedia


def _payload(articles):
    return {"items": [{"articles": [{"article": a, "views": v, "rank": i + 1}
                                    for i, (a, v) in enumerate(articles)]}]}


ARTICLES = [("Main_Page", 6_000_000), ("Special:Search", 800_000), ("Toxic_(2026_film)", 314_205),
            ("Dolly_Parton", 304_494), ("Deaths_in_2026", 146_262), ("Wikipedia:Featured_pictures", 1)]


def _handler(available_day="2026/08/31"):
    def handler(req):
        if req.url.path.endswith(available_day):
            return httpx.Response(200, json=_payload(ARTICLES))
        return httpx.Response(404, json={"detail": "not yet"})
    return handler


def test_falls_back_to_the_newest_published_day(ctx_factory):
    res = wikipedia.fetch_source(ctx_factory(_handler(), today=date(2026, 9, 2)))
    en = [s for s in res.signals if s.geo == "en"]
    assert res.as_of == "2026-08-31"
    assert en[0].meta["as_of"] == "2026-08-31"


def test_namespace_and_stoplist_filter(ctx_factory):
    ctx = ctx_factory(_handler(), stoplist={"Deaths_in_2026"})
    res = wikipedia.fetch_source(ctx)
    labels = [s.label for s in res.signals if s.geo == "en"]
    assert labels == ["Toxic (2026 film)", "Dolly Parton"]
    assert res.signals[0].url == "https://en.wikipedia.org/wiki/Toxic_%282026_film%29"
    assert res.signals[0].magnitude == 314_205 and res.signals[0].magnitude_unit == "views"


def test_top_n_cap_from_rules(ctx_factory):
    res = wikipedia.fetch_source(ctx_factory(_handler(), rules={"wikipedia_top": 1}))
    assert [s.label for s in res.signals if s.geo == "en"] == ["Toxic (2026 film)"]


def _archive_day(d, articles):
    return {"$contract": "trending-day/1", "date": d,
            "signals": {"wikipedia": [{"geo": "en", "label": a.replace("_", " "),
                                       "meta": {"article": a}} for a in articles]},
            "topics": []}


def test_novelty_rule_drops_a_perennial_once_the_archive_is_long_enough(ctx_factory):
    archive = [_archive_day(f"2026-08-{d:02d}", ["Dolly_Parton"] + (["Toxic_(2026_film)"] if d <= 3 else []))
               for d in range(1, 15)]
    res = wikipedia.fetch_source(ctx_factory(_handler(), archive=archive))
    labels = [s.label for s in res.signals if s.geo == "en"]
    assert "Dolly Parton" not in labels  # present 14 of 14 days
    assert "Toxic (2026 film)" in labels  # present 3 of 14 days


def test_novelty_rule_is_inactive_with_a_short_archive(ctx_factory):
    archive = [_archive_day(f"2026-08-{d:02d}", ["Dolly_Parton"]) for d in range(1, 10)]
    res = wikipedia.fetch_source(ctx_factory(_handler(), archive=archive))
    assert "Dolly Parton" in [s.label for s in res.signals if s.geo == "en"]


def test_no_published_day_is_a_note(ctx_factory):
    res = wikipedia.fetch_source(ctx_factory(lambda req: httpx.Response(404)))
    assert res.signals == [] and len(res.notes) == 2
