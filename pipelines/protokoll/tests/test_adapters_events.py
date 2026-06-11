import json
from datetime import date

import httpx
import pytest

from protokoll.adapters import attention, fires, quakes
from protokoll.adapters.base import Context
from protokoll.fetch import SourceUnavailable


def ctx_for(handler, env=None, today=date(2026, 6, 12)):
    return Context(client=httpx.Client(transport=httpx.MockTransport(handler)),
                   today=today, env=env or {})


def test_quakes_counts_from_metadata():
    body = json.dumps({"metadata": {"count": 31}, "features": []})
    m = quakes.measure(ctx_for(lambda req: httpx.Response(200, text=body,
                                headers={"content-type": "application/json"})))
    assert m.value == 31 and m.as_of == "2026-06-12"


def test_fires_counts_csv_rows_and_uses_key():
    seen = {}

    def handler(req):
        seen["url"] = str(req.url)
        return httpx.Response(200, text="latitude,longitude,confidence\n1,2,h\n3,4,n\n")

    m = fires.measure(ctx_for(handler, env={"FIRMS_MAP_KEY": "K123"}))
    assert m.value == 2
    assert "K123" in seen["url"] and "VIIRS_SNPP_NRT" in seen["url"]


def test_fires_without_key_is_unavailable():
    with pytest.raises(SourceUnavailable):
        fires.measure(ctx_for(lambda req: httpx.Response(200, text=""), env={}))


def test_attention_top_article_skips_meta_pages():
    body = json.dumps({"items": [{"articles": [
        {"article": "Main_Page", "views": 5_000_000},
        {"article": "Special:Search", "views": 1_200_000},
        {"article": "Deep_sea_mining", "views": 812_345},
    ]}]})

    def handler(req):
        assert "/2026/06/11" in str(req.url)  # gestern
        return httpx.Response(200, text=body, headers={"content-type": "application/json"})

    m = attention.measure(ctx_for(handler))
    assert m.label == "Deep sea mining" and m.value == 812_345
    assert m.as_of == "2026-06-11"
