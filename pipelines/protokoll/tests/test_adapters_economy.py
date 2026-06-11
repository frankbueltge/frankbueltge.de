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
    assert m.comparison.label == "prev_observation_day" and m.comparison.value == 1.92


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


def test_oil_without_key_is_unavailable():
    from protokoll.fetch import SourceUnavailable
    import pytest

    with pytest.raises(SourceUnavailable):
        oil.measure(ctx_for(lambda req: httpx.Response(200, text="{}"), env={}))


def test_oil_error_body_with_200_raises():
    import pytest

    body = json.dumps({"error": "invalid api key"})
    with pytest.raises(KeyError):
        oil.measure(ctx_for(lambda req: httpx.Response(
            200, text=body, headers={"content-type": "application/json"}),
            env={"EIA_API_KEY": "K9"}))


def test_estr_skips_empty_obs_values():
    csv_body = (
        "KEY,FREQ,TIME_PERIOD,OBS_VALUE\n"
        "EST.B.EU000A2X2A25.WT,B,2026-06-10,1.92\n"
        "EST.B.EU000A2X2A25.WT,B,2026-06-11,\n"
    )
    m = rates.measure(ctx_for(lambda req: httpx.Response(200, text=csv_body)))
    assert m.value == 1.92 and m.as_of == "2026-06-10"
    assert m.comparison is None
