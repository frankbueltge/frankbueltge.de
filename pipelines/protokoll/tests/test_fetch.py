import httpx
import pytest

import protokoll.fetch as fetch_mod
from protokoll.fetch import SourceUnavailable, fetch


def make_client(handler):
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_fetch_returns_text_on_success():
    client = make_client(lambda req: httpx.Response(200, text="a,b,c"))
    assert fetch("https://example.org/x.csv", client=client) == "a,b,c"


def test_fetch_json():
    client = make_client(lambda req: httpx.Response(200, json={"k": 1}))
    assert fetch("https://example.org/x", client=client, expect="json") == {"k": 1}


def test_fetch_retries_then_succeeds(monkeypatch):
    monkeypatch.setattr(fetch_mod.time, "sleep", lambda s: None)
    calls = {"n": 0}

    def handler(req):
        calls["n"] += 1
        return httpx.Response(503) if calls["n"] < 3 else httpx.Response(200, text="ok")

    assert fetch("https://example.org", client=make_client(handler)) == "ok"
    assert calls["n"] == 3


def test_fetch_raises_after_all_retries(monkeypatch):
    monkeypatch.setattr(fetch_mod.time, "sleep", lambda s: None)
    calls = {"n": 0}

    def handler(req):
        calls["n"] += 1
        return httpx.Response(500)

    with pytest.raises(SourceUnavailable):
        fetch("https://example.org", client=make_client(handler))
    assert calls["n"] == 4  # 1 Versuch + 3 Retries
