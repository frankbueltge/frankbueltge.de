import json
from datetime import date

import httpx

from protokoll.adapters import oil, rates
from protokoll.adapters.base import Context


def ctx_for(handler, env=None):
    return Context(client=httpx.Client(transport=httpx.MockTransport(handler)),
                   today=date(2026, 6, 12), env=env or {})


ECB_CSV = (
    "KEY,FREQ,TIME_PERIOD,OBS_VALUE\n"
    "EST.B.EU000A2X2A25.WT,B,2026-06-10,1.92\n"
    "EST.B.EU000A2X2A25.WT,B,2026-06-11,1.93\n"
)


def test_estr_latest_with_prev_day():
    m = rates.measure(ctx_for(lambda req: httpx.Response(200, text=ECB_CSV)))
    assert m.value == 1.93 and m.as_of == "2026-06-11"
    assert m.comparison.label == "prev_day" and m.comparison.value == 1.92


EIA_JSON = json.dumps({"response": {"data": [
    {"period": "2026-06-11", "value": 71.4},
    {"period": "2026-06-10", "value": 70.9},
]}})


def test_brent_latest_with_prev_day_and_key():
    seen = {}

    def handler(req):
        seen["url"] = str(req.url)
        return httpx.Response(200, text=EIA_JSON,
                              headers={"content-type": "application/json"})

    m = oil.measure(ctx_for(handler, env={"EIA_API_KEY": "K9"}))
    assert m.value == 71.4 and m.as_of == "2026-06-11"
    assert m.comparison.value == 70.9
    assert "api_key=K9" in seen["url"] and "RBRTE" in seen["url"]
