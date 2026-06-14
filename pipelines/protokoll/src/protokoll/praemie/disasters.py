"""§3 Schadenverlauf — NOAA NCEI Billion-Dollar Weather and Climate Disasters (CSV, $Mio.)."""
from __future__ import annotations

import csv
import io
from typing import Any

import httpx

from protokoll.fetch import fetch

URL = "https://www.ncei.noaa.gov/access/billions/events-US-1980-2024.csv"

SOURCE = {
    "name": "NOAA NCEI, Billion-Dollar Weather and Climate Disasters",
    "url": "https://www.ncei.noaa.gov/access/billions/",
    "license": "Public Domain (NOAA), DOI 10.25921/stkw-7w73",
}


def parse_disasters(csv_text: str) -> dict[str, Any]:
    lines = csv_text.splitlines()
    reader = csv.DictReader(lines[2:])  # erste zwei Zeilen sind Fließtext-Kopf
    events: list[tuple[int, float, int]] = []  # (jahr, kosten_mio, tote)
    for row in reader:
        cost_raw = (row.get("CPI-Adjusted Cost") or "").strip()
        begin = (row.get("Begin Date") or "").strip()
        if not cost_raw or len(begin) < 4:
            continue
        try:
            cost = float(cost_raw)
            year = int(begin[:4])
        except ValueError:
            continue
        deaths_raw = (row.get("Deaths") or "").strip()
        try:
            deaths = int(float(deaths_raw)) if deaths_raw else 0
        except ValueError:
            deaths = 0
        events.append((year, cost, deaths))

    if not events:
        raise ValueError("keine gültigen Ereignisse im NOAA-CSV")

    latest_year = max(y for y, _, _ in events)
    latest = [(y, c, d) for y, c, d in events if y == latest_year]
    return {
        "cumulative_cost_busd": round(sum(c for _, c, _ in events) / 1000, 1),
        "total_events": len(events),
        "since_year": 1980,
        "latest_year": latest_year,
        "latest_year_events": len(latest),
        "latest_year_cost_busd": round(sum(c for _, c, _ in latest) / 1000, 1),
        "latest_year_deaths": sum(d for _, _, d in latest),
        "source": SOURCE,
    }


def fetch_disasters(client: httpx.Client) -> dict[str, Any]:
    return parse_disasters(fetch(URL, client=client, expect="text"))
