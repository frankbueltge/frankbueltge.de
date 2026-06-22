#!/usr/bin/env python3
"""
The Tell — Gegenmessung III.

Misst die synthetische Sättigung eines Medienraums über die sprachlichen Fingerabdrücke
der Maschine — und zwar dort, wo es am meisten weh tut: in der begutachteten Wissenschaft.
Bestimmte Wörter („delve", „intricate", „meticulous" …) sind dokumentierte LLM-Tells; ihr
Anteil in PubMed-Abstracts ist seit ChatGPT (Ende 2022) sprunghaft gestiegen.

Kein Detektor, keine Black Box: reine Zähldaten aus PubMed (NCBI E-utilities, keyless,
deterministisch). Die Marker sind ein PROXY — Menschen nutzen sie auch; der kollektive
SPRUNG ist der Fingerabdruck, nicht das einzelne Paper.

Output: src/data/tell/latest.json. Git ist das Archiv.
"""
import json
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ESEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
# Dokumentierte „excess words" KI-generierter Abstracts (u. a. Kobak et al. 2024).
MARKERS = ["delve", "intricate", "meticulous", "commendable", "showcasing", "pivotal", "realm", "garner"]
YEARS = list(range(2018, datetime.now(timezone.utc).year))  # laufendes Jahr raus (PubMed indexiert nach)
CHATGPT_YEAR = 2022  # ChatGPT erschien Nov 2022 → 2023 ist das erste volle „KI-Jahr"
ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "src" / "data" / "tell"


def count(term: str) -> int:
    url = (
        f"{ESEARCH}?db=pubmed&term={urllib.parse.quote(term)}&retmode=json&retmax=0"
        "&tool=frankbueltge.de-the-tell&email=hello@frankbueltge.de"
    )
    for _ in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "frankbueltge.de The Tell"})
            with urllib.request.urlopen(req, timeout=40) as r:
                return int(json.load(r)["esearchresult"]["count"])
        except Exception as e:
            print(f"  ! {term}: {e}", file=sys.stderr)
            time.sleep(2)
    return 0


def main() -> int:
    totals = {}
    for y in YEARS:
        totals[y] = count(f"{y}[pdat] AND hasabstract")
        time.sleep(0.4)

    # per100k[year][marker] = Treffer je 100k Abstracts
    per100k: dict[int, dict[str, float]] = {y: {} for y in YEARS}
    raw: dict[int, dict[str, int]] = {y: {} for y in YEARS}
    for m in MARKERS:
        for y in YEARS:
            c = count(f"{m}[tiab] AND {y}[pdat]")
            raw[y][m] = c
            per100k[y][m] = round(1e5 * c / totals[y], 1) if totals[y] else 0.0
            time.sleep(0.4)

    # „Maschinen-Sprech-Index": Summe der Marker-Anteile je Jahr
    index = [{"year": y, "value": round(sum(per100k[y].values()), 1)} for y in YEARS]

    # Basislinie = Mittel vor ChatGPT (2018..CHATGPT_YEAR); Peak = Jahr mit höchstem Index.
    # (Nicht einfach das jüngste Jahr: PubMed indexiert mit Verzug, jüngste Jahre sind unvollständig.)
    pre_years = [y for y in YEARS if y <= CHATGPT_YEAR]
    idx_by_year = {p["year"]: p["value"] for p in index}
    peak_year = max(YEARS, key=lambda y: idx_by_year[y])

    def fold(word: str) -> dict:
        base = sum(per100k[y][word] for y in pre_years) / len(pre_years)
        peak = per100k[peak_year][word]
        return {
            "word": word,
            "baseline_per100k": round(base, 1),
            "peak_per100k": peak,
            "peak_year": peak_year,
            "fold": round(peak / base, 1) if base else None,
        }

    markers_out = sorted((fold(m) for m in MARKERS), key=lambda d: (d["fold"] or 0), reverse=True)
    headline = next((m for m in markers_out if m["word"] == "delve"), markers_out[0])

    now = datetime.now(timezone.utc)
    out = {
        "generated_at": now.isoformat(timespec="seconds"),
        "date": now.strftime("%Y-%m-%d"),
        "chatgpt_year": CHATGPT_YEAR,
        "peak_year": peak_year,
        "baseline_years": [pre_years[0], pre_years[-1]],
        "headline": headline,
        "markers": markers_out,
        "index": index,
        "source": {
            "name": "PubMed via NCBI E-utilities",
            "url": "https://www.ncbi.nlm.nih.gov/books/NBK25501/",
            "license": "Public domain (NLM/NCBI); counts only",
            "retrieved": now.strftime("%Y-%m-%d"),
        },
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "latest.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")

    h = headline
    print(f"\n{h['word']}: {h['baseline_per100k']} -> {h['peak_per100k']} je 100k ({h['fold']}x seit ChatGPT)")
    print("Top-Marker:", ", ".join(f"{m['word']} {m['fold']}x" for m in markers_out[:5]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
