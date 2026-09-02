"""The twelve sources added beside the first eight: one parse test each, from a small
inline fixture, plus the order of the ledger and the promise that an optional source
failing is a note rather than a crash."""
import httpx
import pytest

import trending.run as run_mod
from trending.sources import (SOURCES, appstore, arxiv, coingecko, devto, huggingface, lobsters,
                              polymarket, producthunt, pypi, stackoverflow, steam, techmeme)

EXPECTED_ORDER = ["google_trends", "wikipedia", "hackernews", "bluesky", "mastodon",
                  "google_news", "reddit", "github", "huggingface", "lobsters", "devto",
                  "stackoverflow", "pypi", "producthunt", "techmeme", "arxiv", "appstore",
                  "steam", "coingecko", "polymarket"]


@pytest.fixture(autouse=True)
def _no_throttle(monkeypatch):
    monkeypatch.setattr(appstore.time, "sleep", lambda s: None)


def _json(payload):
    return lambda req: httpx.Response(200, json=payload)


def _text(body):
    return lambda req: httpx.Response(200, text=body)


# --- the ledger ------------------------------------------------------------------------

def test_source_ids_are_unique_and_in_the_documented_order():
    ids = [s.id for s in SOURCES]
    assert ids == EXPECTED_ORDER
    assert len(set(ids)) == len(ids)


def test_the_new_fragile_sources_are_optional():
    optional = {s.id for s in SOURCES if s.optional}
    assert {"pypi", "producthunt", "techmeme", "arxiv", "steam", "coingecko",
            "polymarket"} <= optional
    assert {"huggingface", "lobsters", "devto", "stackoverflow", "appstore"}.isdisjoint(optional)


def test_an_optional_source_failing_is_a_note_not_a_crash(ctx_factory):
    """The pattern of tests/test_run.py: build_day isolates every source."""
    rec = run_mod.build_day(ctx_factory(lambda req: httpx.Response(503)),
                            (techmeme.SPEC, coingecko.SPEC), log=lambda *a: None)
    assert [r.id for r in rec.sources] == ["techmeme", "coingecko"]
    assert [r.status for r in rec.sources] == ["unavailable", "unavailable"]
    assert all(r.note and r.count == 0 for r in rec.sources)
    assert rec.signals["techmeme"] == () and rec.topics == ()


# --- model hubs, forums, indexes -------------------------------------------------------

def test_huggingface_models(ctx_factory):
    payload = [{"id": "org/Model-1", "likes": 1923, "downloads": 441348,
                "pipeline_tag": "image-text-to-text"},
               {"id": "", "downloads": 1},
               {"id": "solo-model", "likes": None, "downloads": None, "pipeline_tag": None}]
    res = huggingface.fetch_source(ctx_factory(_json(payload)))
    assert [s.label for s in res.signals] == ["org/Model-1", "solo-model"]
    assert [s.rank for s in res.signals] == [1, 2]
    first = res.signals[0]
    assert first.url == "https://huggingface.co/org/Model-1"
    assert first.magnitude == 441348 and first.magnitude_unit == "downloads"
    assert first.meta == {"likes": 1923, "pipeline_tag": "image-text-to-text"}
    assert res.signals[1].magnitude == 0 and res.signals[1].meta["likes"] == 0


def test_lobsters_hottest_with_comments_url_fallback(ctx_factory):
    payload = [{"title": "A post with a link", "url": "https://a.example", "score": 163,
                "comment_count": 106, "tags": ["culture"], "description_plain": "x" * 300,
                "comments_url": "https://lobste.rs/s/ipy9xw/a"},
               {"title": "Ask: no outward link", "url": "", "score": 4, "comment_count": 2,
                "tags": ["ask"], "comments_url": "https://lobste.rs/s/zzz/ask"},
               {"title": "", "url": "https://b.example"}]
    res = lobsters.fetch_source(ctx_factory(_json(payload)))
    assert [s.label for s in res.signals] == ["A post with a link", "Ask: no outward link"]
    assert [s.rank for s in res.signals] == [1, 2]
    first = res.signals[0]
    assert first.url == "https://a.example" and first.magnitude_unit == "points"
    assert first.magnitude == 163 and first.meta["comment_count"] == 106
    assert first.meta["tags"] == ["culture"] and len(first.meta["description"]) == 200
    assert res.signals[1].url == "https://lobste.rs/s/zzz/ask"


def test_devto_top_of_the_day(ctx_factory):
    payload = [{"title": "What happens to technical debt", "url": "https://dev.to/a/b",
                "public_reactions_count": 19, "comments_count": 10,
                "tag_list": ["ai", "programming"], "description": "y" * 300},
               {"title": "Comma separated tags", "url": "https://dev.to/c/d",
                "tag_list": "ai, webdev", "description": ""}]
    res = devto.fetch_source(ctx_factory(_json(payload)))
    first = res.signals[0]
    assert first.label == "What happens to technical debt" and first.rank == 1
    assert first.url == "https://dev.to/a/b" and first.magnitude == 19
    assert first.magnitude_unit == "reactions" and first.meta["comments_count"] == 10
    assert first.meta["tags"] == ["ai", "programming"]
    assert len(first.meta["description"]) == 200
    assert res.signals[1].meta["tags"] == ["ai", "webdev"]
    assert res.signals[1].magnitude == 0 and res.signals[1].meta["description"] is None


def test_stackoverflow_unescapes_titles(ctx_factory):
    payload = {"items": [{"title": "Why doesn&#39;t this build &amp; run?",
                          "link": "https://stackoverflow.com/questions/1/x", "score": -1,
                          "tags": ["python", "build"], "answer_count": 0},
                         {"title": "", "link": "https://stackoverflow.com/questions/2/y"}],
               "quota_remaining": 299}
    res = stackoverflow.fetch_source(ctx_factory(_json(payload)))
    assert len(res.signals) == 1
    s = res.signals[0]
    assert s.label == "Why doesn't this build & run?" and s.rank == 1
    assert s.url == "https://stackoverflow.com/questions/1/x"
    assert s.magnitude == -1 and s.magnitude_unit == "score"
    assert s.meta == {"tags": ["python", "build"], "answer_count": 0}
    assert "300" in stackoverflow.__doc__  # the unauthenticated quota is on the record


def test_pypi_top_packages_and_as_of_from_the_file(ctx_factory):
    payload = {"last_update": "2026-09-01 06:34:08", "source": "ClickHouse",
               "rows": [{"download_count": 100, "project": "packaging"},
                        {"download_count": 300, "project": "boto3"},
                        {"download_count": 200, "project": "zope.interface"},
                        {"download_count": 1, "project": ""}]}
    res = pypi.fetch_source(ctx_factory(_json(payload)))
    assert [s.label for s in res.signals] == ["boto3", "zope.interface", "packaging"]
    assert [s.rank for s in res.signals] == [1, 2, 3]
    assert res.as_of == "2026-09-01"
    first = res.signals[0]
    assert first.url == "https://pypi.org/project/boto3/"
    assert first.magnitude == 300 and first.magnitude_unit == "downloads"
    assert first.meta == {"source_month": "2026-09"}
    assert pypi.SPEC.optional is True


# --- feeds -----------------------------------------------------------------------------

def test_producthunt_atom(ctx_factory):
    atom = ('<feed xmlns="http://www.w3.org/2005/Atom">'
            '<title>Product Hunt</title>'
            '<entry><id>tag:x,2005:Post/1</id>'
            '<link rel="alternate" href="https://www.producthunt.com/products/onset-io"/>'
            '<title>Onset MCP</title><author><name>Sonny T.</name></author></entry>'
            '<entry><link href="https://www.producthunt.com/products/second"/>'
            '<title>Second product</title></entry></feed>')
    res = producthunt.fetch_source(ctx_factory(_text(atom)))
    assert [s.label for s in res.signals] == ["Onset MCP", "Second product"]
    assert [s.rank for s in res.signals] == [1, 2]
    first = res.signals[0]
    assert first.url == "https://www.producthunt.com/products/onset-io"
    assert first.magnitude is None and first.magnitude_unit == "rank"
    assert first.meta == {"author": "Sonny T."}
    assert res.signals[1].meta == {"author": None}
    assert producthunt.SPEC.optional is True


def test_techmeme_rss(ctx_factory):
    rss = ("<rss version=\"2.0\"><channel><title>Techmeme</title>"
           "<item><title>A company raised money (Reporter/Outlet)</title>"
           "<link>https://www.techmeme.com/260902/p18#a260902p18</link>"
           "<description><![CDATA[<P>markup</P>]]></description></item>"
           "<item><title></title><link>https://www.techmeme.com/x</link></item>"
           "</channel></rss>")
    res = techmeme.fetch_source(ctx_factory(_text(rss)))
    assert len(res.signals) == 1
    s = res.signals[0]
    assert s.label == "A company raised money (Reporter/Outlet)" and s.rank == 1
    assert s.url == "https://www.techmeme.com/260902/p18#a260902p18"
    assert s.magnitude is None and s.magnitude_unit == "rank" and s.meta == {}
    assert techmeme.SPEC.optional is True


def test_arxiv_normalises_wrapped_titles(ctx_factory):
    atom = ('<feed xmlns="http://www.w3.org/2005/Atom" '
            'xmlns:arxiv="http://arxiv.org/schemas/atom">'
            '<title>arXiv Query: search_query=cat:cs.AI</title>'
            '<entry><id>http://arxiv.org/abs/2609.01604v1</id>'
            '<title>Beyond Scores: Understanding\n  LLM Mechanisms in\n  Evaluation</title>'
            '<published>2026-09-01T17:59:49Z</published>'
            '<summary>An abstract that is never recorded.</summary>'
            '<arxiv:primary_category term="cs.CL"/>'
            '<category term="cs.LG"/></entry></feed>')
    res = arxiv.fetch_source(ctx_factory(_text(atom)))
    assert len(res.signals) == 1  # the feed's own title is not an entry
    s = res.signals[0]
    assert s.label == "Beyond Scores: Understanding LLM Mechanisms in Evaluation"
    assert s.url == "http://arxiv.org/abs/2609.01604v1" and s.rank == 1
    assert s.magnitude is None and s.magnitude_unit == "rank"
    assert s.meta == {"primary_category": "cs.CL", "published": "2026-09-01T17:59:49Z"}
    assert arxiv.SPEC.optional is True


# --- charts ----------------------------------------------------------------------------

def test_appstore_two_storefronts_and_ranks_per_geo(ctx_factory):
    def handler(req):
        store = req.url.path.split("/")[3]
        if store == "de":
            return httpx.Response(200, json={"feed": {"results": [
                {"name": "Untis Mobile", "url": "https://apps.apple.com/de/app/id1",
                 "artistName": "Untis GmbH", "genres": [{"name": "Bildung"}]}]}})
        return httpx.Response(200, json={"feed": {"results": [
            {"name": "MapQuest", "url": "https://apps.apple.com/us/app/id2",
             "artistName": "MapQuest Holdings LLC", "genres": []},
            {"name": "", "url": "https://apps.apple.com/us/app/id3"},
            {"name": "Second US app", "url": "https://apps.apple.com/us/app/id4",
             "artistName": "Someone", "genres": ["Utilities"]}]}})

    res = appstore.fetch_source(ctx_factory(handler))
    assert [(s.geo, s.rank, s.label) for s in res.signals] == [
        ("US", 1, "MapQuest"), ("US", 2, "Second US app"), ("DE", 1, "Untis Mobile")]
    us = res.signals[0]
    assert us.url == "https://apps.apple.com/us/app/id2" and us.magnitude_unit == "rank"
    assert us.magnitude is None and us.meta["genre"] is None
    assert us.meta["artist_name"] == "MapQuest Holdings LLC"
    assert res.signals[1].meta["genre"] == "Utilities"
    assert res.signals[2].meta["genre"] == "Bildung" and res.signals[2].meta["store"] == "de"
    assert res.notes == []


def test_appstore_one_storefront_failing_is_a_note(ctx_factory):
    def handler(req):
        if "/de/" in req.url.path:
            return httpx.Response(500)
        return httpx.Response(200, json={"feed": {"results": [
            {"name": "MapQuest", "url": "https://apps.apple.com/us/app/id2"}]}})

    res = appstore.fetch_source(ctx_factory(handler))
    assert [s.geo for s in res.signals] == ["US"]
    assert len(res.notes) == 1 and res.notes[0].startswith("DE:")


def test_steam_top_sellers(ctx_factory):
    payload = {"specials": {"items": [{"name": "not this one", "id": 9}]},
               "top_sellers": {"id": "cat_top_sellers", "items": [
                   {"name": "The Blood of Dawnwalker", "id": 3751260, "discounted": False,
                    "final_price": 6999, "currency": "USD"},
                   {"name": "No id here"},
                   {"name": "Discounted game", "id": 42, "discounted": True,
                    "final_price": 1999}]}}
    res = steam.fetch_source(ctx_factory(_json(payload)))
    assert [s.label for s in res.signals] == ["The Blood of Dawnwalker", "Discounted game"]
    assert [s.rank for s in res.signals] == [1, 2]
    first = res.signals[0]
    assert first.url == "https://store.steampowered.com/app/3751260/"
    assert first.magnitude is None and first.magnitude_unit == "rank"
    assert first.meta == {"discounted": False, "final_price": 6999}
    assert res.signals[1].meta["discounted"] is True
    assert steam.SPEC.optional is True


def test_coingecko_trending_searches(ctx_factory):
    payload = {"coins": [{"item": {"id": "pons", "name": "Pons", "symbol": "PONS",
                                   "market_cap_rank": 141}},
                         {"item": {"id": "", "name": "No id"}},
                         {"item": {"id": "unranked", "name": "Unranked coin", "symbol": "UNR",
                                   "market_cap_rank": None}}]}
    res = coingecko.fetch_source(ctx_factory(_json(payload)))
    assert [s.label for s in res.signals] == ["Pons", "Unranked coin"]
    assert [s.rank for s in res.signals] == [1, 2]
    first = res.signals[0]
    assert first.url == "https://www.coingecko.com/en/coins/pons"
    assert first.magnitude == 141 and first.magnitude_unit == "rank"
    assert first.meta["symbol"] == "PONS"
    assert res.signals[1].magnitude is None
    assert coingecko.SPEC.optional is True


def test_polymarket_markets_by_volume(ctx_factory):
    payload = [{"question": "Will the rate be cut in September?", "slug": "rate-cut-september",
                "volume24hr": 4297292.863578987, "endDate": "2026-09-30T14:00:00Z"},
               {"question": "No slug", "slug": "", "volume24hr": 1},
               {"question": "No volume", "slug": "no-volume", "volume24hr": None}]
    res = polymarket.fetch_source(ctx_factory(_json(payload)))
    assert [s.label for s in res.signals] == ["Will the rate be cut in September?", "No volume"]
    assert [s.rank for s in res.signals] == [1, 2]
    first = res.signals[0]
    assert first.url == "https://polymarket.com/market/rate-cut-september"
    assert first.magnitude == 4297293 and first.magnitude_unit == "usd_24h"
    assert first.meta["end_date"] == "2026-09-30T14:00:00Z"
    assert res.signals[1].magnitude is None
    assert polymarket.SPEC.optional is True
