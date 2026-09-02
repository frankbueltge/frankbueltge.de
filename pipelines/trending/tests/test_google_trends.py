import httpx

from trending.sources import google_trends

RSS = """<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:ht="https://trends.google.com/trending/rss" version="2.0"><channel><title>Daily Search Trends</title>
<item><title>mickey gasper</title><ht:approx_traffic>2,000+</ht:approx_traffic><link>x</link><pubDate>Tue, 1 Sep 2026 16:00:00 -0700</pubDate>
<ht:news_item><ht:news_item_title>Red Sox move Contreras to IL</ht:news_item_title><ht:news_item_url>https://sports.example/a</ht:news_item_url><ht:news_item_source>Yahoo Sports</ht:news_item_source></ht:news_item>
<ht:news_item><ht:news_item_title>Second story</ht:news_item_title><ht:news_item_url>https://sports.example/b</ht:news_item_url><ht:news_item_source>ESPN</ht:news_item_source></ht:news_item>
<ht:news_item><ht:news_item_title>Third story</ht:news_item_title><ht:news_item_url>https://sports.example/c</ht:news_item_url><ht:news_item_source>NBC</ht:news_item_source></ht:news_item>
<ht:news_item><ht:news_item_title>Fourth story</ht:news_item_title><ht:news_item_url>https://sports.example/d</ht:news_item_url><ht:news_item_source>CBS</ht:news_item_source></ht:news_item>
</item>
<item><title>jedixson páez</title><ht:approx_traffic>1000+</ht:approx_traffic></item>
</channel></rss>"""


def _handler(fail_geo=None):
    def handler(req):
        geo = req.url.params.get("geo")
        if geo == fail_geo:
            return httpx.Response(500)
        return httpx.Response(200, text=RSS)
    return handler


def test_parses_items_traffic_links_and_geo(ctx_factory):
    res = google_trends.fetch_source(ctx_factory(_handler()))
    assert len(res.signals) == 2 * len(google_trends.GEOS)
    first = res.signals[0]
    assert first.label == "mickey gasper" and first.magnitude == 2000
    assert first.magnitude_unit == "approx_searches" and first.geo == "US"
    assert first.meta["geo"] == "US" and first.rank == 1
    assert len(first.links) == 3 and first.links[0].publisher == "Yahoo Sports"
    assert res.signals[1].magnitude == 1000 and res.signals[1].rank == 2
    assert res.notes == []


def test_one_geo_failing_becomes_a_note_not_a_crash(ctx_factory):
    res = google_trends.fetch_source(ctx_factory(_handler(fail_geo="DE")))
    assert len(res.signals) == 2 * (len(google_trends.GEOS) - 1)
    assert len(res.notes) == 1 and res.notes[0].startswith("DE:")


def test_traffic_parsing():
    assert google_trends._traffic("2,000+") == 2000
    assert google_trends._traffic("500+") == 500
    assert google_trends._traffic(None) is None
    assert google_trends._traffic("n/a") is None
