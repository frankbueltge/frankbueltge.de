"""§4 Laufende Regulierung — OpenFEMA NFIP Schadenzahlungen (jüngste Aggregate, JSON)."""
from __future__ import annotations

from typing import Any

import httpx

from protokoll.fetch import fetch

URL = ("https://www.fema.gov/api/open/v2/FimaNfipClaims?$top=1000"
       "&$select=yearOfLoss,dateOfLoss,amountPaidOnBuildingClaim,amountPaidOnContentsClaim"
       "&$orderby=dateOfLoss%20desc&$format=json")

SOURCE = {
    "name": "FEMA OpenFEMA, NFIP Schadenzahlungen",
    "url": "https://www.fema.gov/about/openfema/api",
    "license": "Public Domain (FEMA)",
}


def aggregate_claims(payload: dict[str, Any]) -> dict[str, Any]:
    rows = payload.get("FimaNfipClaims") or []
    recent_paid = sum(
        (r.get("amountPaidOnBuildingClaim") or 0) + (r.get("amountPaidOnContentsClaim") or 0)
        for r in rows
    )
    years = [int(r["yearOfLoss"]) for r in rows if r.get("yearOfLoss") is not None]
    return {
        "recent_paid_usd": round(recent_paid),
        "recent_count": len(rows),
        "latest_year": max(years) if years else None,
        "source": SOURCE,
    }


def fetch_claims(client: httpx.Client) -> dict[str, Any]:
    return aggregate_claims(fetch(URL, client=client, expect="json"))
