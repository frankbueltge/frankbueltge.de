import httpx

from protokoll.praemie.bls import URL, fetch_premium, parse_premium

CSV = """observation_date,PCU9241269241262
1998-06-01,100.0
1999-06-01,.
2010-01-01,180.0
2026-05-01,279.086
"""


def test_parse_premium_index_base_and_change():
    out = parse_premium(CSV)
    assert out["index"] == 279.086
    assert out["latest_date"] == "2026-05-01"
    assert out["base_value"] == 100.0
    assert out["base_year"] == 1998
    assert out["change_pct_since_base"] == 179.1
    assert out["series"] == [
        {"year": 1998, "index": 100.0},
        {"year": 2010, "index": 180.0},
        {"year": 2026, "index": 279.1},
    ]
    assert out["source"]["license"] == "Public Domain (BLS)"


def test_parse_premium_falls_back_to_first_row_when_no_1998_06():
    csv = "observation_date,PCU9241269241262\n2000-01-01,50.0\n2020-01-01,100.0\n"
    out = parse_premium(csv)
    assert out["base_value"] == 50.0
    assert out["index"] == 100.0
    assert out["change_pct_since_base"] == 100.0


def test_fetch_premium_via_mock_transport():
    def handler(req):
        assert str(req.url) == URL
        return httpx.Response(200, text=CSV)

    client = httpx.Client(transport=httpx.MockTransport(handler))
    out = fetch_premium(client)
    assert out["index"] == 279.086
