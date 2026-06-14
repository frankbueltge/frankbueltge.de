import httpx

from protokoll.praemie.disasters import URL, fetch_disasters, parse_disasters

CSV = """Weather and Climate Disasters
Cost values are in millions of dollars
Name,Disaster,Begin Date,End Date,CPI-Adjusted Cost,Unadjusted Cost,Deaths
Storm A,Severe Storm,19980601,19980603,1000.0,800.0,10
Flood B,Flooding,20230715,20230718,5000.0,4800.0,20
Hurricane C,Tropical Cyclone,20240901,20240905,30000.0,29000.0,100
Empty D,Drought,20240601,20240630,,,
"""


def test_parse_disasters_aggregates_and_latest_year():
    out = parse_disasters(CSV)
    # (1000 + 5000 + 30000) / 1000 = 36.0 bn (empty row skipped)
    assert out["cumulative_cost_busd"] == 36.0
    assert out["total_events"] == 3
    assert out["since_year"] == 1980
    assert out["latest_year"] == 2024
    assert out["latest_year_events"] == 1
    assert out["latest_year_cost_busd"] == 30.0
    assert out["latest_year_deaths"] == 100
    assert out["source"]["license"].startswith("Public Domain (NOAA)")


def test_fetch_disasters_via_mock_transport():
    def handler(req):
        assert str(req.url) == URL
        return httpx.Response(200, text=CSV)

    client = httpx.Client(transport=httpx.MockTransport(handler))
    out = fetch_disasters(client)
    assert out["total_events"] == 3
