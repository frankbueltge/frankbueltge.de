"""§5 Risikoausschluss — Kalifornien: Nicht-Erneuerungen (kuratierte, versionierte Datendatei)."""
from __future__ import annotations

import json
from importlib.resources import files
from typing import Any

SOURCE = {
    "name": "California Department of Insurance, Non-Renewals by ZIP",
    "url": ("https://www.insurance.ca.gov/01-consumers/200-wrr/"
            "DataAnalysisOnWildfiresAndInsurance.cfm"),
    "license": "öffentlich (CA DOI)",
}


def retreat() -> dict[str, Any]:
    data = json.loads(
        files("protokoll.praemie.data").joinpath("retreat.json").read_text()
    )
    return {
        "non_renewals": data["value"],
        "as_of": data["as_of"],
        "note": data["note"],
        "source": SOURCE,
    }
