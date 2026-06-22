#!/usr/bin/env python3
"""
The Pattern — Gegenmessung IV (Capstone).

Richtet die Linse auf die Datenwissenschaft selbst. Die Maschine durchwühlt täglich alle
Zeitreihen des eigenen Protokoll-Archivs (zwölf offene Quellen), hebt die auffälligste
Korrelation — und beweist dann mit einem Permutationstest, dass dieser „Fund" mit
überwältigender Wahrscheinlichkeit reines Rauschen ist.

Der blinde Fleck: Mit genug Reihen und genug Vergleichen findet man IMMER ein Muster. Das
Instrument fabriziert täglich eine falsche Erkenntnis — und gesteht sie im selben Atemzug.
Reflexiv, selbstkritisch: die Gegenmessung der Gegenmessung.

Quelle: das eigene Protokoll-Archiv (src/content/protokoll/). Kein neuer Abruf.
Output: src/data/pattern/latest.json. Git ist das Archiv.
"""
import glob
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
ARCHIVE = ROOT / "src" / "content" / "protokoll"
OUT_DIR = ROOT / "src" / "data" / "pattern"
K = 5000  # Permutationen
MIN_DAYS = 8

LABELS = {
    "co2": {"de": "CO₂ in der Atmosphäre", "en": "Atmospheric CO₂"},
    "seaice_north": {"de": "Arktis-Meereis", "en": "Arctic sea ice"},
    "seaice_south": {"de": "Antarktis-Meereis", "en": "Antarctic sea ice"},
    "sst": {"de": "Meeresoberflächen-Temperatur", "en": "Sea surface temperature"},
    "fires": {"de": "Waldbrand-Detektionen", "en": "Wildfire detections"},
    "quakes": {"de": "Erdbeben weltweit", "en": "Earthquakes worldwide"},
    "population": {"de": "Weltbevölkerung", "en": "World population"},
    "rates": {"de": "EZB-Zins (€STR)", "en": "ECB rate (€STR)"},
    "oil": {"de": "Ölpreis (Brent)", "en": "Oil price (Brent)"},
    "conflict": {"de": "Konfliktereignisse", "en": "Conflict events"},
    "attention": {"de": "Wikipedia-Aufmerksamkeit", "en": "Wikipedia attention"},
}


def load_series() -> dict:
    series: dict[str, dict] = {}
    for f in sorted(glob.glob(str(ARCHIVE / "*" / "*.json"))):
        d = json.load(open(f))
        day = d["date"]
        for e in d.get("entries", []):
            tid, v = e.get("top_id"), e.get("value")
            if tid and isinstance(v, (int, float)):
                series.setdefault(tid, {})[day] = float(v)
    return series


def max_abs_offdiag(corr: np.ndarray) -> float:
    c = corr.copy()
    np.fill_diagonal(c, 0.0)
    c = np.nan_to_num(c)
    return float(np.max(np.abs(c)))


def main() -> int:
    series = load_series()
    # Nur Metriken, die WIRKLICH täglich variieren (>= Hälfte der Tage neue Werte) — sonst
    # erzeugen Beinahe-Konstanten triviale ±1-Artefakte statt plausibel aussehender Muster.
    varying = []
    for m in series:
        if m not in LABELS:
            continue
        vals = list(series[m].values())
        if len(vals) >= MIN_DAYS and len(set(vals)) >= max(6, len(vals) // 2):
            varying.append(m)
    days = sorted(set.intersection(*[set(series[m]) for m in varying])) if varying else []
    # nach Schnittmenge erneut auf Varianz prüfen
    kept = [m for m in varying if np.array([series[m][d] for d in days]).std() > 0]
    if len(kept) < 3 or len(days) < MIN_DAYS:
        print("Zu wenig variierende Daten.", file=sys.stderr)
        return 1

    mat = np.array([[series[m][d] for d in days] for m in kept])  # metrics × days
    n = mat.shape[1]
    pairs = len(kept) * (len(kept) - 1) // 2
    corr = np.corrcoef(mat)

    # Schlagzeile: stärkste Off-Diagonal-Korrelation
    c = corr.copy()
    np.fill_diagonal(c, 0.0)
    c = np.nan_to_num(c)
    i, j = np.unravel_index(np.argmax(np.abs(c)), c.shape)
    r0 = float(c[i, j])
    a, b = kept[i], kept[j]
    # Wie viele Paare „korrelieren" überhaupt (|r| >= 0.8)? Muster sind überall.
    strong = int(np.sum(np.abs(np.triu(c, 1)) >= 0.8))

    # Permutationstest: jede Spalte unabhängig mischen (echte Korrelation zerstören),
    # max|r| neu suchen, zählen wie oft >= |r0|. Das ist die False-Discovery-Rate.
    rng = np.random.default_rng(int(days[-1].replace("-", "")))  # deterministischer Seed aus dem Datum
    hits = 0
    for _ in range(K):
        shuf = np.array([row[rng.permutation(n)] for row in mat])
        if max_abs_offdiag(np.corrcoef(shuf)) >= abs(r0):
            hits += 1
    fdr = round(hits / K, 3)

    now = datetime.now(timezone.utc)
    out = {
        "generated_at": now.isoformat(timespec="seconds"),
        "date": now.strftime("%Y-%m-%d"),
        "days": n,
        "metrics_count": len(kept),
        "pairs": pairs,
        "strong_pairs": strong,
        "strong_threshold": 0.8,
        "permutations": K,
        "false_discovery_rate": fdr,
        "headline": {
            "a_id": a,
            "b_id": b,
            "a_label": LABELS[a],
            "b_label": LABELS[b],
            "r": round(r0, 3),
            "dates": days,
            "a_series": [round(series[a][d], 4) for d in days],
            "b_series": [round(series[b][d], 4) for d in days],
        },
        "source": {
            "name": "Eigenes Protokoll-Archiv (zwölf offene Tagesquellen)",
            "url": "https://github.com/frankbueltge/frankbueltge.de/tree/main/src/content/protokoll",
            "license": "siehe Quellen des Protokolls",
            "retrieved": now.strftime("%Y-%m-%d"),
        },
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "latest.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")

    print(f"Fund: {a} ↔ {b}, r={r0:+.3f} über {n} Tage, {pairs} Paare.")
    print(f"Permutationstest: {fdr*100:.0f}% der Zufalls-Durchläufe finden eine ≥ so starke Korrelation → Rauschen.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
