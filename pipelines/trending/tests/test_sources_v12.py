"""The eleven sources added on 2026-11-14: one parse test each from a small inline fixture, the
filters each source promises, and its failure mode."""
import httpx
import pytest

from trending.fetch import SourceUnavailable
from trending.sources import (alerts, apple_music, apple_podcasts, baidu, hf_papers, lemmy,
                              manifold, openlibrary, stocktwits, wikipedia_news, world_press)


@pytest.fixture(autouse=True)
def _no_throttle(monkeypatch):
    monkeypatch.setattr(apple_music.time, "sleep", lambda s: None)
    monkeypatch.setattr(apple_podcasts.time, "sleep", lambda s: None)


def _json(payload):
    return lambda req: httpx.Response(200, json=payload)


def _by_host(pages):
    def handler(req: httpx.Request) -> httpx.Response:
        for host, body in pages.items():
            if req.url.host.endswith(host):
                if body is None:
                    return httpx.Response(503)
                if isinstance(body, str):
                    return httpx.Response(200, text=body)
                return httpx.Response(200, json=body)
        return httpx.Response(404)
    return handler


def _rss(*items):
    body = "".join(f"<item><title>{t}</title><link>{l}</link></item>" for t, l in items)
    return f"<rss version=\"2.0\"><channel>{body}</channel></rss>"


# --- world press -------------------------------------------------------------------------

def test_world_press_reads_each_newsroom_drops_a_repeated_headline_and_shares_the_news_platform(ctx_factory):
    pages = {host: None for host in ("theguardian.com", "aljazeera.com", "dw.com", "npr.org",
                                     "france24.com", "abc.net.au")}
    pages["bbci.co.uk"] = _rss(("Ceasefire holds", "https://bbc.example/1"), ("Ceasefire holds", "https://bbc.example/2"))
    pages["npr.org"] = _rss(("ceasefire holds", "https://npr.example/1"), ("Storm lands", "https://npr.example/2"))
    res = world_press.fetch_source(ctx_factory(_by_host(pages)))
    assert [(s.label, s.meta["feed"], s.rank) for s in res.signals] == [
        ("Ceasefire holds", "bbc", 1), ("Storm lands", "npr", 1)]
    two = {**pages, "bbci.co.uk": _rss(("B1", "https://b/1"), ("B2", "https://b/2")),
           "npr.org": _rss(("N1", "https://n/1"), ("N2", "https://n/2"))}
    # newsroom by newsroom within a rank: every first headline before any second
    assert [s.label for s in world_press.fetch_source(ctx_factory(_by_host(two))).signals] == [
        "B1", "N1", "B2", "N2"]
    assert len(res.notes) == 5 and res.notes[0].startswith("guardian:")
    assert world_press.SPEC.platform == "google_news" and world_press.SPEC.optional is True


def test_world_press_with_no_newsroom_answering_is_unavailable(ctx_factory):
    with pytest.raises(SourceUnavailable):
        world_press.fetch_source(ctx_factory(lambda req: httpx.Response(503)))


# --- wikipedia, in the news --------------------------------------------------------------

def test_wikipedia_news_reduces_the_markup_to_its_text_and_links_the_first_article(ctx_factory):
    payload = {"news": [
        {"story": "<!--Nov 12--><a href=\"./Nvidia\">Nvidia</a> CEO <b><a href=\"./X\">Jensen&nbsp;Huang</a></b> <i></i> resigns.",
         "links": [{"titles": {"normalized": "Jensen Huang"},
                    "content_urls": {"desktop": {"page": "https://en.wikipedia.org/wiki/Jensen_Huang"}}},
                   {"titles": {"normalized": "Nvidia"}}]},
        {"story": "<!--empty-->", "links": []},
    ]}
    res = wikipedia_news.fetch_source(ctx_factory(_json(payload)))
    assert [s.label for s in res.signals] == ["Nvidia CEO Jensen Huang resigns."]
    first = res.signals[0]
    assert first.url == "https://en.wikipedia.org/wiki/Jensen_Huang" and first.geo == "en"
    assert first.meta == {"articles": ["Jensen Huang", "Nvidia"]}
    assert res.as_of == "2026-09-02" and wikipedia_news.SPEC.platform == "wikipedia"


def test_wikipedia_news_falls_back_to_yesterdays_box(ctx_factory):
    def handler(req):
        if req.url.path.endswith("/2026/09/02"):
            return httpx.Response(404)
        return httpx.Response(200, json={"news": [{"story": "A thing happened.", "links": []}]})
    res = wikipedia_news.fetch_source(ctx_factory(handler))
    assert res.as_of == "2026-09-01" and res.signals[0].url is None


# --- lemmy -------------------------------------------------------------------------------

def test_lemmy_keeps_link_posts_with_their_score_and_leaves_out_images_and_nsfw(ctx_factory):
    def post(name, url, **extra):
        return {"post": {"name": name, "ap_id": f"https://a.example/post/{len(name)}", "url": url, **extra},
                "counts": {"score": 412, "comments": 9}, "community": {"name": "technology"}}
    page1 = {"posts": [
        post("  A  federated  thing ", "https://news.example/a", url_content_type="text/html; charset=utf-8"),
        post("Pop", "https://lemmy.example/pictrs/image/x", url_content_type="image/jpeg"),
        post("Meme by extension", "https://i.example/b.JPG?x=1"),
        post("Not for work", "https://news.example/c", nsfw=True),
        post("Text post", None),
        post("Same article, other community", "https://news.example/a"),
    ]}
    page2 = {"posts": [post("Second page", "https://news.example/d")]}
    def handler(req):
        return httpx.Response(200, json=page1 if req.url.params["page"] == "1" else page2)
    res = lemmy.fetch_source(ctx_factory(handler))
    assert [(s.label, s.rank, s.magnitude, s.magnitude_unit) for s in res.signals] == [
        ("A federated thing", 1, 412, "points"), ("Second page", 2, 412, "points")]
    assert res.signals[0].url == "https://a.example/post/22"
    assert res.signals[0].meta == {"community": "technology", "comments": 9, "link": "https://news.example/a"}
    assert res.notes == []


def test_lemmy_second_page_failing_is_a_note_first_page_failing_is_unavailable(ctx_factory):
    ok = {"posts": [{"post": {"name": "A", "ap_id": "https://a.example/1", "url": "https://n.example/1"},
                     "counts": {"score": 1}, "community": {"name": "news"}}]}
    def second_fails(req):
        return httpx.Response(200, json=ok) if req.url.params["page"] == "1" else httpx.Response(503)
    res = lemmy.fetch_source(ctx_factory(second_fails))
    assert len(res.signals) == 1 and res.notes[0].startswith("page 2:") and "?" not in res.notes[0]
    with pytest.raises(SourceUnavailable):
        lemmy.fetch_source(ctx_factory(lambda req: httpx.Response(503)))


# --- hugging face daily papers -----------------------------------------------------------

def test_hf_papers_orders_by_upvotes_then_title(ctx_factory):
    payload = [
        {"paper": {"id": "2611.00002", "title": "Beta", "upvotes": 3, "publishedAt": "2026-11-12T00:00:00.000Z"}},
        {"paper": {"id": "2611.00001", "title": "Alpha", "upvotes": 3}},
        {"paper": {"id": "2611.00003", "title": "Gamma", "upvotes": 40}},
        {"paper": {"id": "", "title": "No id", "upvotes": 99}},
    ]
    res = hf_papers.fetch_source(ctx_factory(_json(payload)))
    assert [(s.label, s.rank, s.magnitude) for s in res.signals] == [
        ("Gamma", 1, 40), ("Alpha", 2, 3), ("Beta", 3, 3)]
    assert res.signals[2].url == "https://huggingface.co/papers/2611.00002"
    assert res.signals[2].meta == {"arxiv_id": "2611.00002", "published": "2026-11-12"}
    assert res.signals[0].magnitude_unit == "upvotes" and hf_papers.SPEC.platform == "huggingface"


# --- manifold ----------------------------------------------------------------------------

def test_manifold_rounds_the_play_money_volume(ctx_factory):
    payload = [{"question": "When will the flight happen?", "url": "https://manifold.markets/a/b",
                "volume24Hours": 40139.46, "uniqueBettorCount": 55},
               {"question": "No link", "volume24Hours": 1}]
    res = manifold.fetch_source(ctx_factory(_json(payload)))
    assert [(s.label, s.magnitude, s.magnitude_unit) for s in res.signals] == [
        ("When will the flight happen?", 40139, "mana_24h")]
    assert res.signals[0].meta == {"bettors": 55}


# --- stocktwits --------------------------------------------------------------------------

def test_stocktwits_labels_by_company_and_carries_the_ticker(ctx_factory):
    payload = {"symbols": [{"symbol": "AAL", "title": "American Airlines Group Inc", "watchlist_count": 109798},
                           {"symbol": "ZZZ", "title": ""}, {"title": "No symbol"}]}
    res = stocktwits.fetch_source(ctx_factory(_json(payload)))
    assert [(s.label, s.magnitude, s.meta["symbol"]) for s in res.signals] == [
        ("American Airlines Group Inc", 109798, "AAL"), ("ZZZ", None, "ZZZ")]
    assert res.signals[0].url == "https://stocktwits.com/symbol/AAL"
    assert res.signals[0].magnitude_unit == "watchers"


# --- apple music, apple podcasts ---------------------------------------------------------

def test_apple_music_puts_the_artist_into_the_label_per_storefront(ctx_factory):
    def handler(req):
        if "/de/" in req.url.path:
            return httpx.Response(503)
        return httpx.Response(200, json={"feed": {"results": [
            {"name": "Golden", "artistName": "HUNTR/X", "url": "https://music.apple.com/x"},
            {"name": ""}]}})
    res = apple_music.fetch_source(ctx_factory(handler))
    assert [(s.label, s.geo, s.rank) for s in res.signals] == [
        ("Golden — HUNTR/X", "US", 1), ("Golden — HUNTR/X", "GB", 1)]
    assert res.signals[0].meta == {"title": "Golden", "by": "HUNTR/X", "store": "us"}
    assert len(res.notes) == 1 and res.notes[0].startswith("DE:")


def test_apple_podcasts_does_not_repeat_a_maker_named_like_the_show(ctx_factory):
    payload = {"feed": {"results": [{"name": "The Daily", "artistName": "The New York Times"},
                                    {"name": "Radiolab", "artistName": "radiolab"}]}}
    res = apple_podcasts.fetch_source(ctx_factory(_json(payload)))
    # storefront by storefront within a rank: three countries' first show, then their second
    assert [(s.label, s.geo) for s in res.signals][:4] == [
        ("The Daily — The New York Times", "US"), ("The Daily — The New York Times", "GB"),
        ("The Daily — The New York Times", "DE"), ("Radiolab", "US")]
    assert all(s.source == "apple_podcasts" and s.magnitude_unit == "rank" for s in res.signals)
    assert len(res.signals) == 6  # three storefronts


def test_apple_music_with_no_storefront_answering_is_unavailable(ctx_factory):
    with pytest.raises(SourceUnavailable):
        apple_music.fetch_source(ctx_factory(lambda req: httpx.Response(503)))


# --- open library ------------------------------------------------------------------------

def test_openlibrary_puts_the_first_author_into_the_label(ctx_factory):
    payload = {"works": [{"title": "Atomic Habits", "key": "/works/OL1W", "author_name": ["James Clear", "B"],
                          "first_publish_year": 2016},
                         {"title": "Anonymous", "key": "/works/OL2W"}, {"title": "No key"}]}
    res = openlibrary.fetch_source(ctx_factory(_json(payload)))
    assert [(s.label, s.url) for s in res.signals] == [
        ("Atomic Habits — James Clear", "https://openlibrary.org/works/OL1W"),
        ("Anonymous", "https://openlibrary.org/works/OL2W")]
    assert res.signals[0].meta == {"title": "Atomic Habits", "authors": ["James Clear", "B"],
                                   "first_published": 2016}


# --- alert desk --------------------------------------------------------------------------

GDACS = ("<rss xmlns:gdacs=\"http://www.gdacs.org\"><channel>"
         "<item><title>Green earthquake in the sea</title><link>https://gdacs.example/1</link>"
         "<gdacs:alertlevel>Green</gdacs:alertlevel></item>"
         "<item><title>Orange flood in A</title><link>https://gdacs.example/2</link>"
         "<gdacs:alertlevel>Orange</gdacs:alertlevel><gdacs:eventtype>FL</gdacs:eventtype>"
         "<gdacs:country>A</gdacs:country></item>"
         "<item><title>Red cyclone in B</title><link>https://gdacs.example/3</link>"
         "<gdacs:alertlevel>Red</gdacs:alertlevel></item></channel></rss>")
USGS = {"features": [{"properties": {"title": "M 6.4 - 30 km WSW of Lata", "url": "https://usgs.example/1",
                                     "mag": 6.4, "alert": "green"}}]}
WHO = {"value": [{"Title": "Ebola disease, Country", "PublicationDate": "2026-11-06T17:27:28Z",
                  "ItemDefaultUrl": "/2026-DON625"}]}


def test_alerts_keeps_orange_and_red_red_first_and_reads_three_desks(ctx_factory):
    ctx = ctx_factory(_by_host({"gdacs.org": GDACS, "usgs.gov": USGS, "who.int": WHO}))
    res = alerts.fetch_source(ctx)
    assert [(s.label, s.meta["feed"], s.rank) for s in res.signals] == [
        ("Red cyclone in B", "gdacs", 1), ("Earthquake: M 6.4 - 30 km WSW of Lata", "usgs", 1),
        ("Ebola disease, Country", "who", 1), ("Orange flood in A", "gdacs", 2)]
    assert res.signals[0].url == "https://gdacs.example/3"
    assert res.signals[3].meta == {"feed": "gdacs", "level": "Orange", "event_type": "FL", "country": "A"}
    assert res.signals[2].url == "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON625"
    assert res.notes == []


def test_alerts_caps_a_title_that_lists_every_country_at_a_comma():
    long = "Drought is on going in " + ", ".join(f"Country{i:02d}" for i in range(40))
    capped = alerts._capped(long)
    assert len(capped) <= alerts.LABEL_MAX + 2 and capped.endswith(" …") and not capped.endswith(", …")
    assert alerts._capped("Short title") == "Short title"


def test_alerts_a_quiet_desk_is_not_a_failure_and_a_silent_one_is_a_note(ctx_factory):
    quiet = GDACS.replace("Orange", "Green").replace("Red", "Green")
    ctx = ctx_factory(_by_host({"gdacs.org": quiet, "usgs.gov": {"features": []}, "who.int": None}))
    res = alerts.fetch_source(ctx)
    assert res.signals == [] and len(res.notes) == 1 and res.notes[0].startswith("who:")
    assert "?" not in res.notes[0]  # no query string in a public note


def test_alerts_with_no_desk_answering_is_unavailable(ctx_factory):
    with pytest.raises(SourceUnavailable):
        alerts.fetch_source(ctx_factory(lambda req: httpx.Response(503)))


# --- baidu -------------------------------------------------------------------------------

def test_baidu_leaves_out_the_pinned_entry_and_finds_the_nested_list(ctx_factory):
    payload = {"data": {"cards": [{"component": "hotList", "content": [{"content": [
        {"isTop": True, "word": "置顶", "url": "https://m.baidu.com/s?word=a"},
        {"isTop": False, "word": "飞秒手术", "url": "https://m.baidu.com/s?word=b"},
        {"word": "  "}]}]}]}}
    res = baidu.fetch_source(ctx_factory(_json(payload)))
    assert [(s.label, s.rank, s.geo) for s in res.signals] == [("飞秒手术", 1, "CN")]
    assert baidu.fetch_source(ctx_factory(_json({"data": {"cards": []}}))).signals == []
