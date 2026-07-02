from datetime import date

import httpx

from protokoll.adapters import sst
from protokoll.adapters.base import Context


def _client(payload) -> httpx.Client:
    def handler(_req: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json=payload)
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_sst_measure_sets_trend_worsened_when_rising():
    data = [
        {"name": "2025", "data": [20.0 + i * 0.001 for i in range(365)]},
        {"name": "2026", "data": [20.40, 20.42] + [None] * 363},
        {"name": "1982-2011 mean", "data": [None] * 365},  # isdigit-Filter muss sie ignorieren
    ]
    m = sst.measure(Context(client=_client(data), today=date(2026, 1, 3), env={}))
    assert m.value == 20.42
    assert m.trend == "worsened"
