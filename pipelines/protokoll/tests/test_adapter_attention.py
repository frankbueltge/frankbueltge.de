"""TOP Aufmerksamkeit — jüngster VERFÜGBARER Wikimedia-Top-Pageviews-Tag (Lag-robust)."""
from datetime import date

import httpx
import pytest

from protokoll.adapters import attention
from protokoll.adapters.base import Context
from protokoll.fetch import SourceUnavailable

TOP_PAYLOAD = {"items": [{"articles": [
    {"article": "Main_Page", "views": 9_000_000},   # wird übersprungen
    {"article": "Special:Search", "views": 5_000},  # Präfix übersprungen
    {"article": "Some_Topic", "views": 1_234_567},  # erste reguläre Seite
]}]}


def ctx(handler) -> Context:
    return Context(client=httpx.Client(transport=httpx.MockTransport(handler)),
                   today=date(2026, 6, 27), env={})


def test_attention_falls_back_to_most_recent_available_day():
    """Vortag (06-26) liefert 404 (noch nicht publiziert) → nimmt 06-25."""
    seen = []

    def handler(req):
        url = str(req.url)
        seen.append(url)
        if url.endswith("/2026/06/26"):
            return httpx.Response(404)            # Vortag noch nicht fertig
        if url.endswith("/2026/06/25"):
            return httpx.Response(200, json=TOP_PAYLOAD)
        return httpx.Response(404)

    m = attention.measure(ctx(handler))
    assert m.value == 1_234_567.0
    assert m.label == "Some Topic"
    assert m.as_of == "2026-06-25"
    assert any(u.endswith("/2026/06/26") for u in seen)  # Vortag wurde zuerst versucht


def test_attention_raises_when_no_recent_day_available():
    with pytest.raises(SourceUnavailable):
        attention.measure(ctx(lambda req: httpx.Response(404)))
