import httpx

from protokoll.parallaxe import MIN_LANGS, TOPIC_CAP
from protokoll.parallaxe.register import (
    controversial_titles,
    langlinks,
    protection_status,
    rank_topics,
)


def test_controversial_titles_keeps_only_ns0():
    payload = {"parse": {"links": [
        {"ns": 0, "*": "Abortion"},
        {"ns": 0, "*": "Senkaku Islands"},
        {"ns": 4, "*": "Wikipedia:Some project page"},  # ns != 0 -> raus
        {"ns": 14, "*": "Category:Something"},           # ns != 0 -> raus
    ]}}
    client = httpx.Client(transport=httpx.MockTransport(
        lambda req: httpx.Response(200, json=payload)))
    titles = controversial_titles(client)
    assert titles == ["Abortion", "Senkaku Islands"]


def test_langlinks_filters_to_target_langs_and_includes_en():
    payload = {"query": {"pages": {"123": {"langlinks": [
        {"lang": "de", "*": "Senkaku-Inseln"},
        {"lang": "ru", "*": "Сэнкаку"},
        {"lang": "zh", "*": "釣魚臺列嶼"},
        {"lang": "xx", "*": "Not a target lang"},  # nicht in LANGS -> raus
    ]}}}}
    client = httpx.Client(transport=httpx.MockTransport(
        lambda req: httpx.Response(200, json=payload)))
    out = langlinks(client, "Senkaku Islands")
    assert out["en"] == "Senkaku Islands"
    assert out["de"] == "Senkaku-Inseln"
    assert out["ru"] == "Сэнкаку"
    assert out["zh"] == "釣魚臺列嶼"
    assert "xx" not in out


def test_protection_status_reports_edit_protection():
    payload = {"query": {"pages": {"5": {"protection": [
        {"type": "edit", "level": "autoconfirmed", "expiry": "infinity"},
        {"type": "move", "level": "sysop", "expiry": "infinity"},
    ]}}}}
    client = httpx.Client(transport=httpx.MockTransport(
        lambda req: httpx.Response(200, json=payload)))
    assert protection_status(client, "Abortion") == "edit:autoconfirmed"


def test_protection_status_defensive_when_missing():
    payload = {"query": {"pages": {"5": {}}}}
    client = httpx.Client(transport=httpx.MockTransport(
        lambda req: httpx.Response(200, json=payload)))
    assert protection_status(client, "Photosynthesis") == "—"


def _ll(n: int):
    """Erzeugt langlinks-Payload mit (n-1) Fremdsprachen (en kommt separat dazu)."""
    langs = ["de", "ru", "uk", "ar", "he", "zh", "ja", "fa", "tr", "es", "fr"]
    links = [{"lang": langs[i], "*": f"T{i}"} for i in range(n - 1)]
    return {"query": {"pages": {"1": {"langlinks": links}}}}


def test_rank_topics_filters_sorts_and_caps(monkeypatch):
    import protokoll.parallaxe.register as reg
    monkeypatch.setattr(reg.time, "sleep", lambda s: None)

    # Drei Themen: A=6 Sprachen, B=3 (unter MIN_LANGS=5 -> raus), C=8 Sprachen.
    counts = {"A": 6, "B": 3, "C": 8}

    def handler(req):
        url = str(req.url)
        for t, n in counts.items():
            if f"titles={t}" in url or f"titles=%5B{t}" in url or f"={t}&" in url:
                return httpx.Response(200, json=_ll(n))
        # Fallback: match by title token anywhere
        for t, n in counts.items():
            if t in url:
                return httpx.Response(200, json=_ll(n))
        return httpx.Response(200, json=_ll(0))

    client = httpx.Client(transport=httpx.MockTransport(handler))
    topics = rank_topics(client, ["A", "B", "C"])
    # B fliegt raus (3 < MIN_LANGS), C (8) vor A (6).
    assert [t["en_title"] for t in topics] == ["C", "A"]
    assert topics[0]["lang_count"] == 8
    assert topics[1]["lang_count"] == 6
    assert all(t["lang_count"] >= MIN_LANGS for t in topics)
    assert len(topics) <= TOPIC_CAP


def test_rank_topics_tiebreak_by_title(monkeypatch):
    import protokoll.parallaxe.register as reg
    monkeypatch.setattr(reg.time, "sleep", lambda s: None)
    client = httpx.Client(transport=httpx.MockTransport(
        lambda req: httpx.Response(200, json=_ll(6))))
    topics = rank_topics(client, ["Zebra", "Apple"])
    # Gleiche lang_count -> en_title aufsteigend.
    assert [t["en_title"] for t in topics] == ["Apple", "Zebra"]
