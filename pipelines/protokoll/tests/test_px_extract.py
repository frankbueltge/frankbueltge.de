import json

import httpx
import pytest

import protokoll.parallaxe.extract_llm as ex
from protokoll.parallaxe.extract_llm import ExtractionError, extract_omissions


@pytest.fixture(autouse=True)
def _no_token_no_sleep(monkeypatch):
    monkeypatch.setattr(ex, "_access_token", lambda refresh=False: "fake-token")
    monkeypatch.setattr(ex.time, "sleep", lambda s: None)


def _gemini_response(obj):
    return httpx.Response(200, json={
        "candidates": [{"content": {"parts": [{"text": json.dumps(obj)}]}}]
    })


def test_extract_omissions_returns_parsed_dict():
    parsed = {
        "lemma": {"en": "Senkaku Islands", "zh": "Diaoyu Islands"},
        "claims": [
            {"aussage": "Territorialstreit", "nach_sprache": {"en": "verschweigt", "ru": "nennt"}},
        ],
    }
    sent = {}

    def handler(req):
        sent["url"] = str(req.url)
        sent["headers"] = req.headers
        sent["body"] = json.loads(req.content)
        return _gemini_response(parsed)

    client = httpx.Client(transport=httpx.MockTransport(handler))
    out = extract_omissions({"en": "text-a", "ru": "text-b"}, client=client)
    assert out == parsed
    # Prompt + Sprachblöcke landen im Request-Body.
    body_text = sent["body"]["contents"][0]["parts"][0]["text"]
    assert "[en] text-a" in body_text
    assert "[ru] text-b" in body_text
    assert sent["body"]["generationConfig"]["temperature"] == 0
    assert sent["body"]["generationConfig"]["responseMimeType"] == "application/json"
    assert sent["headers"]["authorization"] == "Bearer fake-token"
    assert "x-goog-user-project" in sent["headers"]
    assert "gemini-2.5-flash" in sent["url"]


def test_extract_omissions_raises_when_keys_missing():
    client = httpx.Client(transport=httpx.MockTransport(
        lambda req: _gemini_response({"lemma": {"en": "X"}})))  # "claims" fehlt
    with pytest.raises(ExtractionError):
        extract_omissions({"en": "text"}, client=client)


def test_extract_omissions_retries_on_429_then_succeeds():
    parsed = {"lemma": {"en": "X"}, "claims": []}
    state = {"calls": 0}

    def handler(req):
        state["calls"] += 1
        if state["calls"] == 1:
            return httpx.Response(429, json={"error": "rate"})
        return _gemini_response(parsed)

    client = httpx.Client(transport=httpx.MockTransport(handler))
    out = extract_omissions({"en": "text"}, client=client)
    assert out == parsed
    assert state["calls"] == 2


def test_fetch_token_prefers_metadata_server(monkeypatch):
    """In Cloud Run liefert der Metadaten-Server den Token — die gcloud-CLI wird nicht berührt
    (sie existiert im Slim-Image nicht). Genau dieser Pfad fehlte und ließ den Nacht-Job scheitern."""
    captured = {}

    def fake_get(url, headers=None, timeout=None):
        captured["url"] = url
        captured["headers"] = headers or {}
        return httpx.Response(200, json={"access_token": "meta-token", "expires_in": 3599})

    monkeypatch.setattr(ex.httpx, "get", fake_get)
    monkeypatch.setattr(ex.subprocess, "check_output",
                        lambda *a, **k: pytest.fail("gcloud darf nicht aufgerufen werden"))
    assert ex._fetch_token() == "meta-token"
    assert captured["headers"]["Metadata-Flavor"] == "Google"


def test_fetch_token_falls_back_to_gcloud(monkeypatch):
    """Lokal ist kein Metadaten-Server erreichbar — dann greift die gcloud-CLI."""
    def fake_get(*a, **k):
        raise httpx.ConnectError("kein Metadaten-Server")

    monkeypatch.setattr(ex.httpx, "get", fake_get)
    monkeypatch.setattr(ex.subprocess, "check_output", lambda *a, **k: b"cli-token\n")
    assert ex._fetch_token() == "cli-token"
