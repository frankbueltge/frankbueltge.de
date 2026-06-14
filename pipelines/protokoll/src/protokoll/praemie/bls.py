"""§2 Die Prämie — BLS PPI Wohngebäude-/Hausratversicherung (Basis Juni 1998 = 100), via FRED."""
from __future__ import annotations

import csv
import io
from typing import Any

import httpx

from protokoll.fetch import fetch
from protokoll.praemie import PREMIUM_BASE_YEAR

URL = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=PCU9241269241262"

SOURCE = {
    "name": ("U.S. Bureau of Labor Statistics, PPI Hausrat-/Wohngebäudeversicherung "
             "(PCU9241269241262), via FRED"),
    "url": "https://fred.stlouisfed.org/series/PCU9241269241262",
    "license": "Public Domain (BLS)",
}


def parse_premium(csv_text: str) -> dict[str, Any]:
    reader = csv.reader(io.StringIO(csv_text))
    rows: list[tuple[str, float]] = []
    next(reader, None)  # Header überspringen
    for row in reader:
        if len(row) < 2:
            continue
        date, raw = row[0].strip(), row[1].strip()
        if not date or raw in ("", "."):  # fehlende Beobachtung
            continue
        try:
            rows.append((date, float(raw)))
        except ValueError:
            continue
    if not rows:
        raise ValueError("keine gültigen Beobachtungen im FRED-CSV")

    base_value = next((v for d, v in rows if d.startswith("1998-06")), rows[0][1])
    latest_date, latest = rows[-1]
    return {
        "index": latest,
        "latest_date": latest_date,
        "base_value": base_value,
        "base_year": PREMIUM_BASE_YEAR,
        "change_pct_since_base": round((latest / base_value - 1) * 100, 1),
        "source": SOURCE,
    }


def fetch_premium(client: httpx.Client) -> dict[str, Any]:
    return parse_premium(fetch(URL, client=client, expect="text"))
