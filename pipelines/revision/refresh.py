#!/usr/bin/env python3
"""
The Correction — Gegenmessung II.

Misst die Lüge der offiziellen Zahl: nicht durch ein eigenes Modell, sondern durch die
Revisionen, die das Amt SELBST an seinen Echtzeit-Zahlen vornimmt. Die US-Beschäftigtenzahl
(Nonfarm Payroll Employment) wird monatlich gemeldet — und danach still revidiert, zuletzt
millionenweise NACH UNTEN. Die Zahl, auf die Märkte und Politik reagieren, war aufgebläht.

Quelle: Philadelphia Fed Real-Time Data Set (RTDSM) — die kanonische Vintage-Datenbank.
Jede Spalte ist eine „Ausgabe" (vintage); so liefert die Quelle die „as-of-then"-Fassung
gleich mit: die früheste Spalte mit Wert = Erst-Meldung, die jüngste = aktueller Stand.

Benötigt pandas + openpyxl (XLSX-Quelle). Output: src/data/revision/latest.json. Git ist das Archiv.
"""
import json
import sys
import tempfile
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

URL = "https://www.philadelphiafed.org/-/media/frbp/assets/surveys-and-data/real-time-data/data-files/xlsx/employmvmd.xlsx"
RECENT = 36   # Monate für die Kurve
SYS_WINDOW = 24  # Fenster für die „systematisch"-Aussage
ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "src" / "data" / "revision"


def fetch_xlsx() -> Path:
    tmp = Path(tempfile.gettempdir()) / "rtdsm_employ.xlsx"
    req = urllib.request.Request(URL, headers={"User-Agent": "frankbueltge.de The Correction"})
    with urllib.request.urlopen(req, timeout=90) as r, open(tmp, "wb") as f:
        f.write(r.read())
    return tmp


def period_label(p: str) -> str:
    """RTDSM-Index '2025:06' → '2025-06'."""
    return p.replace(":", "-")


def main() -> int:
    df = pd.read_excel(fetch_xlsx(), index_col=0)
    rows = []
    for obs in df.index:
        s = df.loc[obs].dropna()
        if len(s) < 2:
            continue
        first, last = float(s.iloc[0]), float(s.iloc[-1])
        rows.append({"period": period_label(str(obs)), "first": round(first), "final": round(last), "delta": round(last - first)})

    recent = rows[-RECENT:]
    window = rows[-SYS_WINDOW:]
    revised_down = sum(1 for r in window if r["delta"] < 0)
    # Schlagzeile: stärkste Revision der jüngeren Jahre
    pool = [r for r in rows if r["period"] >= "2024"]
    headline = max(pool, key=lambda r: abs(r["delta"])) if pool else rows[-1]

    now = datetime.now(timezone.utc)
    out = {
        "generated_at": now.isoformat(timespec="seconds"),
        "date": now.strftime("%Y-%m-%d"),
        "metric": {
            "de": "US-Beschäftigung (Nonfarm Payroll, Tsd.)",
            "en": "US employment (nonfarm payroll, thousands)",
        },
        "systematic": {
            "months": len(window),
            "revised_down": revised_down,
            "revised_down_share": round(revised_down / len(window), 3) if window else 0.0,
        },
        "headline": headline,
        "recent": recent,
        "source": {
            "name": "Federal Reserve Bank of Philadelphia, Real-Time Data Set (RTDSM)",
            "url": "https://www.philadelphiafed.org/surveys-and-data/real-time-data-research/real-time-data-set-for-macroeconomists",
            "license": "frei zugänglich (Philadelphia Fed)",
            "retrieved": now.strftime("%Y-%m-%d"),
        },
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "latest.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")

    h = headline
    print(f"Schlagzeile {h['period']}: erst {h['first']:,} -> jetzt {h['final']:,} ({h['delta']:+,} Tsd)")
    print(f"{revised_down}/{len(window)} der letzten Monate nach UNTEN revidiert.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
