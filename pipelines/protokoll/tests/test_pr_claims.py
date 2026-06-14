import httpx

from protokoll.praemie.claims import URL, aggregate_claims, fetch_claims

PAYLOAD = {"FimaNfipClaims": [
    {"yearOfLoss": 2025, "dateOfLoss": "2025-10-01",
     "amountPaidOnBuildingClaim": 1000.0, "amountPaidOnContentsClaim": 200.0},
    {"yearOfLoss": 2026, "dateOfLoss": "2026-01-01",
     "amountPaidOnBuildingClaim": 500.0, "amountPaidOnContentsClaim": None},
    {"yearOfLoss": 2024, "dateOfLoss": "2024-05-01",
     "amountPaidOnBuildingClaim": None, "amountPaidOnContentsClaim": None},
]}


def test_aggregate_claims_handles_nulls():
    out = aggregate_claims(PAYLOAD)
    assert out["recent_paid_usd"] == 1700
    assert out["recent_count"] == 3
    assert out["latest_year"] == 2026
    assert out["source"]["license"] == "Public Domain (FEMA)"


def test_aggregate_claims_empty():
    out = aggregate_claims({"FimaNfipClaims": []})
    assert out["recent_paid_usd"] == 0
    assert out["recent_count"] == 0
    assert out["latest_year"] is None


def test_fetch_claims_via_mock_transport():
    def handler(req):
        assert str(req.url) == URL
        return httpx.Response(200, json=PAYLOAD)

    client = httpx.Client(transport=httpx.MockTransport(handler))
    out = fetch_claims(client)
    assert out["recent_count"] == 3
