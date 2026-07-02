from datetime import date

import httpx

from protokoll.adapters import seaice
from protokoll.adapters.base import Context


def _client(csv_text: str) -> httpx.Client:
    def handler(_req: httpx.Request) -> httpx.Response:
        return httpx.Response(200, text=csv_text)
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_seaice_measure_sets_trend_worsened_when_extent_falls():
    # Spalten: year,month,day,extent — über 12 Monate fallende Ausdehnung (worse="down")
    lines = [f"2025,{m},1,{15.0 - m * 0.5}" for m in range(1, 13)]
    lines.append("2026,1,1,8.5")
    csv = "\n".join(lines) + "\n"
    m = seaice.measure_north(Context(client=_client(csv), today=date(2026, 1, 2), env={}))
    assert m.value == 8.5
    assert m.trend == "worsened"


def test_seaice_south_also_classifies():
    lines = [f"2025,{m},1,{10.0 + m * 0.5}" for m in range(1, 13)]
    lines.append("2026,1,1,17.0")
    csv = "\n".join(lines) + "\n"
    m = seaice.measure_south(Context(client=_client(csv), today=date(2026, 1, 2), env={}))
    assert m.trend == "improved"
