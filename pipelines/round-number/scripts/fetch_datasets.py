"""Obtain the curated datasets for The Round Number (one-off, provenance-disclosed).

Real series: World Bank Open Data API (keyless, public) — World Development
Indicators across all economies for the latest available year. These span several
orders of magnitude → Benford is plausibly applicable.

Synthetic controls (clearly labelled): a large clean log-uniform series (leading
digits follow Benford) and a rounded ("tampered") copy (last-digit heaping).

Run once with network:  python scripts/fetch_datasets.py
Writes pipelines/round-number/data/*.json (committed → Git is the archive).
"""
from __future__ import annotations

import json
import random
from pathlib import Path

import httpx  # only needed for this one-off fetch, not by the pipeline itself

DATA = Path(__file__).resolve().parent.parent / "src" / "round_number" / "data"
WB = "https://api.worldbank.org/v2/country/all/indicator/{ind}"

REAL = [
    ("wb-population", "Bevölkerung je Volkswirtschaft (WDI)", "Weltbank",
     "SP.POP.TOTL", "2023"),
    ("wb-gdp", "BIP je Volkswirtschaft, US$ (WDI)", "Weltbank",
     "NY.GDP.MKTP.CD", "2023"),
    ("wb-land", "Landfläche je Volkswirtschaft, km² (WDI)", "Weltbank",
     "AG.LND.TOTL.K2", "2022"),
]


def fetch_wb(ind: str, year: str) -> list[float]:
    r = httpx.get(WB.format(ind=ind), params={"format": "json", "per_page": "400", "date": year},
                  timeout=60.0, follow_redirects=True)
    r.raise_for_status()
    body = r.json()
    rows = body[1] if isinstance(body, list) and len(body) > 1 else []
    return [float(row["value"]) for row in rows if row.get("value") is not None]


def write(obj: dict) -> None:
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / f"{obj['id']}.json").write_text(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {obj['id']} ({len(obj['values'])} values)")


def main() -> None:
    for sid, name, inst, ind, year in REAL:
        values = fetch_wb(ind, year)
        if len(values) < 50:
            print(f"!! {sid}: only {len(values)} values — skipped")
            continue
        write({
            "id": sid, "name": name, "institution": inst, "synthetic": False,
            "source": {
                "name": f"World Bank Open Data — {ind}",
                "url": f"https://data.worldbank.org/indicator/{ind}",
                "license": "CC BY-4.0 (World Bank)", "retrieved": "2026-06-25",
            },
            "values": values,
        })

    # Synthetic clean control: log-uniform over 7 orders of magnitude → Benford leading digits.
    rng = random.Random(42)
    clean = [round(10 ** rng.uniform(0, 6), 2) for _ in range(6000)]
    write({
        "id": "_control_clean", "name": "Synthetisch — saubere Benford-Reihe", "institution": "Kontrolle",
        "synthetic": True,
        "source": {"name": "seeded log-uniform (seed=42)", "url": "https://en.wikipedia.org/wiki/Benford%27s_law",
                   "license": "n/a", "retrieved": "2026-06-25"},
        "values": clean,
    })

    # Synthetic tampered control: round the clean values to multiples of 100 → last-digit heaping.
    tampered = [round(v / 100) * 100 for v in clean]
    write({
        "id": "_control_tampered", "name": "Synthetisch — gerundet (manipuliert)", "institution": "Kontrolle",
        "synthetic": True,
        "source": {"name": "clean control rounded to multiples of 100", "url": "https://en.wikipedia.org/wiki/Benford%27s_law",
                   "license": "n/a", "retrieved": "2026-06-25"},
        "values": tampered,
    })


if __name__ == "__main__":
    main()
