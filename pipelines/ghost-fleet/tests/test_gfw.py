from urllib.parse import parse_qs, urlparse

import httpx
import pytest

from ghost_fleet.gfw import SourceUnavailable, fetch_gaps


def _client(total):
    def handler(req):
        q = parse_qs(urlparse(str(req.url)).query)
        offset, limit = int(q["offset"][0]), int(q["limit"][0])
        n = min(limit, max(0, total - offset))
        return httpx.Response(200, json={"total": total, "entries": [{"id": f"e{offset + i}"} for i in range(n)]})

    return httpx.Client(transport=httpx.MockTransport(handler))


def test_paginates_all():
    evs, total = fetch_gaps("TKN", client=_client(150), start="2026-06-01", end="2026-06-10")
    assert total == 150 and len(evs) == 150
    assert evs[0]["id"] == "e0" and evs[-1]["id"] == "e149"


def test_cap_stops_early():
    evs, total = fetch_gaps("TKN", client=_client(500), start="a", end="b", cap=100)
    assert len(evs) == 100 and total == 500


def test_http_error_raises_without_leaking_token(monkeypatch):
    monkeypatch.setattr("ghost_fleet.gfw.RETRY_DELAYS", ())  # no backoff sleeps in the test

    def handler(req):
        return httpx.Response(500, text="boom")

    c = httpx.Client(transport=httpx.MockTransport(handler))
    with pytest.raises(SourceUnavailable) as ei:
        fetch_gaps("SECRET-TOKEN-XYZ", client=c, start="a", end="b")
    assert "SECRET-TOKEN-XYZ" not in str(ei.value)
