import json

import httpx
import pytest

import protokoll.parallaxe.extract_llm as ex
from protokoll.parallaxe.extract_llm import ExtractionError, extract_omissions


@pytest.fixture(autouse=True)
def _key_and_no_sleep(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
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
    # AI-Studio-Auth per API-Key-Header (kein Bearer-Token, kein x-goog-user-project, kein GCP).
    assert sent["headers"]["x-goog-api-key"] == "test-key"
    assert "authorization" not in sent["headers"]
    assert "generativelanguage.googleapis.com" in sent["url"]
    assert "gemini-2.5-flash" in sent["url"]


def test_extract_omissions_raises_without_api_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)
    client = httpx.Client(transport=httpx.MockTransport(
        lambda req: _gemini_response({"lemma": {}, "claims": []})))
    with pytest.raises(ExtractionError):
        extract_omissions({"en": "text"}, client=client)


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


def test_extract_omissions_exhausts_on_persistent_429_without_final_sleep(monkeypatch):
    sleeps: list[float] = []
    monkeypatch.setattr(ex.time, "sleep", lambda s: sleeps.append(s))
    calls = {"n": 0}

    def handler(req):
        calls["n"] += 1
        return httpx.Response(429, json={"error": "rate"})

    client = httpx.Client(transport=httpx.MockTransport(handler))
    with pytest.raises(ExtractionError, match="429"):
        extract_omissions({"en": "text"}, client=client)
    assert calls["n"] == 5                      # MAX_RETRIES Versuche
    assert sleeps == [1.5, 3.0, 6.0, 12.0]      # exponentiell, KEIN Schlaf nach dem letzten
