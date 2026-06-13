import httpx

from protokoll.halbwertszeit.pageviews import fetch_event_series


def test_sums_across_languages_and_tolerates_failures(monkeypatch):
    import protokoll.fetch as fetch_mod
    monkeypatch.setattr(fetch_mod.time, "sleep", lambda s: None)
    import protokoll.halbwertszeit.pageviews as pv
    monkeypatch.setattr(pv.time, "sleep", lambda s: None)

    def handler(req):
        url = str(req.url)
        if "/de.wikipedia/" in url:
            return httpx.Response(404)  # Sprache fehlt -> tolerieren
        views = 100 if "/en.wikipedia/" in url else 7
        return httpx.Response(200, json={"items": [
            {"timestamp": "2026032300", "views": views},
            {"timestamp": "2026032400", "views": views // 2},
        ]})

    client = httpx.Client(transport=httpx.MockTransport(handler))
    series, failed = fetch_event_series(
        client, {"en": "Test_event", "de": "Testabsturz", "fr": "Essai"},
        start="2026-03-23", end="2026-03-25")
    assert failed == ["de"]
    assert series == [("2026-03-23", 107), ("2026-03-24", 53)]
