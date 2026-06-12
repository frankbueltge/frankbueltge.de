from protokoll.halbwertszeit.wikidata import parse_events, sparql_url


def binding(qid="Q1", deaths="70", date="2026-03-23", site="https://en.wikipedia.org/",
            article="https://en.wikipedia.org/wiki/Test_event", label_de=None, label_en=None):
    b = {
        "event": {"value": f"http://www.wikidata.org/entity/{qid}"},
        "deaths": {"value": deaths}, "date": {"value": f"{date}T00:00:00Z"},
        "site": {"value": site}, "article": {"value": article},
    }
    if label_de: b["labelDe"] = {"value": label_de}
    if label_en: b["labelEn"] = {"value": label_en}
    return b


def test_parse_dedups_max_deaths_and_collects_languages():
    data = {"results": {"bindings": [
        binding(deaths="70", label_en="Test crash"),
        binding(deaths="120"),  # zweiter P1120-Wert -> Maximum gewinnt
        binding(site="https://de.wikipedia.org/",
                article="https://de.wikipedia.org/wiki/Testabsturz", label_de="Testabsturz"),
        binding(qid="Q2", site="https://de.wikipedia.org/",
                article="https://de.wikipedia.org/wiki/Nur_deutsch"),  # kein en -> raus
    ]}}
    events = parse_events(data)
    assert set(events) == {"Q1"}
    e = events["Q1"]
    assert e["deaths"] == 120
    assert e["titles"] == {"en": "Test_event", "de": "Testabsturz"}
    assert e["label_de"] == "Testabsturz" and e["label_en"] == "Test crash"


def test_label_fallback_to_en_title():
    events = parse_events({"results": {"bindings": [binding()]}})
    assert events["Q1"]["label_en"] == "Test event"
    assert events["Q1"]["label_de"] == "Test event"


def test_sparql_url_encodes_rule():
    url = sparql_url()
    assert "25" in url and "2026-01-01" in url and url.startswith("https://query.wikidata.org/")
