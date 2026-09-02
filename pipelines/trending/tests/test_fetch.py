import httpx
import pytest

from trending.fetch import SourceUnavailable, fetch

from conftest import make_client


def test_fetch_returns_text_on_success():
    client = make_client(lambda req: httpx.Response(200, text="<rss/>"))
    assert fetch("https://example.org/feed", client=client) == "<rss/>"


def test_fetch_retries_then_succeeds():
    calls = {"n": 0}

    def handler(req):
        calls["n"] += 1
        return httpx.Response(503) if calls["n"] < 3 else httpx.Response(200, json={"k": 1})

    assert fetch("https://example.org", client=make_client(handler), expect="json") == {"k": 1}
    assert calls["n"] == 3


def test_fetch_4xx_fails_fast_without_retries():
    calls = {"n": 0}

    def handler(req):
        calls["n"] += 1
        return httpx.Response(404)

    with pytest.raises(SourceUnavailable, match="HTTP 404"):
        fetch("https://example.org/gone", client=make_client(handler))
    assert calls["n"] == 1


def test_fetch_429_is_retried():
    calls = {"n": 0}

    def handler(req):
        calls["n"] += 1
        return httpx.Response(429) if calls["n"] < 2 else httpx.Response(200, text="ok")

    assert fetch("https://example.org", client=make_client(handler)) == "ok"
    assert calls["n"] == 2


def test_fetch_error_messages_never_contain_query_string():
    with pytest.raises(SourceUnavailable) as exc_info:
        fetch("https://api.example.org/v2/data?api_key=SECRET123",
              client=make_client(lambda req: httpx.Response(404)))
    assert "SECRET123" not in str(exc_info.value)
    assert "api.example.org/v2/data" in str(exc_info.value)


def test_fetch_5xx_exhaustion_message_redacts_query_string():
    with pytest.raises(SourceUnavailable) as exc_info:
        fetch("https://api.example.org/v2/data?api_key=SECRET123",
              client=make_client(lambda req: httpx.Response(500)))
    assert "SECRET123" not in str(exc_info.value)
