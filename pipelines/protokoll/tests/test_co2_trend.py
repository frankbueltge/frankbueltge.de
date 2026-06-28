from datetime import date

import httpx

from protokoll.adapters import co2
from protokoll.adapters.base import Context


def _client(csv_text: str) -> httpx.Client:
    def handler(_req: httpx.Request) -> httpx.Response:
        return httpx.Response(200, text=csv_text)
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_co2_measure_sets_trend_worsened():
    # Spalten: year,month,day,_,value  (co2._rows liest Spalte 4 als Wert)
    lines = [f"2025,{m},1,0,{410.0 + m * 0.5}" for m in range(1, 13)]
    lines.append("2026,1,1,0,417.0")
    csv = "\n".join(lines) + "\n"
    m = co2.measure(Context(client=_client(csv), today=date(2026, 1, 2), env={}))
    assert m.value == 417.0
    assert m.trend == "worsened"
