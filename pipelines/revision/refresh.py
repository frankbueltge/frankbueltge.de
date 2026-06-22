#!/usr/bin/env python3
"""
The Correction — Gegenmessung II.

Misst die Lüge der offiziellen Zahl: nicht durch ein eigenes Modell, sondern durch die
Revisionen, die das Amt SELBST an seinen Echtzeit-Zahlen vornimmt. Die CDC-Grippeaktivität
(ILINet) erscheint wöchentlich — und wird danach still nach oben korrigiert, oft über Jahre.

Zwei Funde, deterministisch aus der Quelle:
  1. Erst-Meldungen UNTERTREIBEN systematisch — die Revisionen gehen fast immer nach oben.
  2. Es gibt keine finale Zahl — Wochen werden noch >1 Jahr später revidiert.

Quelle: Delphi Epidata FluView (CDC ILINet), keyless, JSON. Die API liefert die „as-of-then"-
Fassung gleich mit: lag=1 ist die Erst-Meldung, der Default die jüngste Revision.

Output: src/data/revision/latest.json. Git ist das Archiv.
"""
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = "https://api.delphi.cmu.edu/epidata/fluview/"
RANGE = "202240-202520"  # ~zwei Saisons
PEAK_MIN = 20000  # Mindest-Fallzahl der Erst-Meldung, damit %-Revision nicht Kleinst-Basis-Rauschen ist
ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "src" / "data" / "revision"


def fetch(epiweeks: str, lag: int | None = None) -> list[dict]:
    q = f"?regions=nat&epiweeks={epiweeks}"
    if lag is not None:
        q += f"&lag={lag}"
    req = urllib.request.Request(API + q, headers={"User-Agent": "frankbueltge.de The Correction"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8", "replace")).get("epidata", [])


def main() -> int:
    final = {r["epiweek"]: r for r in fetch(RANGE)}  # jüngste Revision je Woche
    first = {r["epiweek"]: r for r in fetch(RANGE, lag=1)}  # Erst-Meldung (lag 1 Woche)

    weeks = []
    for wk in sorted(final):
        f, i = final.get(wk), first.get(wk)
        if not i or i.get("num_ili") in (None, 0) or f.get("num_ili") is None:
            continue
        d = f["num_ili"] - i["num_ili"]
        weeks.append(
            {
                "epiweek": wk,
                "first_cases": i["num_ili"],
                "final_cases": f["num_ili"],
                "delta": d,
                "pct": round(100 * d / i["num_ili"], 1),
                "first_wili": i.get("wili"),
                "final_wili": f.get("wili"),
                "final_lag_weeks": f.get("lag"),
            }
        )

    revised_up = sum(1 for w in weeks if w["delta"] > 0)
    mean_pct = round(sum(w["pct"] for w in weeks) / len(weeks), 1) if weeks else 0.0

    # Schlagzeile: stärkste Revision einer Peak-Woche (genug Fälle, damit der Prozentwert trägt)
    peak = [w for w in weeks if w["first_cases"] >= PEAK_MIN]
    headline = max(peak, key=lambda w: abs(w["pct"]), default=(max(weeks, key=lambda w: abs(w["pct"])) if weeks else None))

    # „Keine finale Zahl": die Woche, die am spätesten noch revidiert wurde
    lagged = [w for w in weeks if w["final_lag_weeks"]]
    max_lag = max(lagged, key=lambda w: w["final_lag_weeks"], default=None)

    now = datetime.now(timezone.utc)
    out = {
        "generated_at": now.isoformat(timespec="seconds"),
        "date": now.strftime("%Y-%m-%d"),
        "systematic": {
            "weeks": len(weeks),
            "revised_up": revised_up,
            "revised_up_share": round(revised_up / len(weeks), 3) if weeks else 0.0,
            "mean_pct": mean_pct,
        },
        "headline": headline,
        "max_lag": max_lag,
        "weeks": weeks[-60:],  # für eine kleine Erst-vs-final-Kurve
        "source": {
            "name": "CDC ILINet via Delphi Epidata (FluView)",
            "url": "https://cmu-delphi.github.io/delphi-epidata/api/fluview.html",
            "license": "CDC public domain; Delphi Epidata",
            "retrieved": now.strftime("%Y-%m-%d"),
        },
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "latest.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")

    if headline:
        h = headline
        print(f"Schlagzeile Woche {h['epiweek']}: erst {h['first_cases']} → final {h['final_cases']} ({h['pct']:+.1f}%)")
    print(f"{revised_up}/{len(weeks)} Wochen nach oben revidiert; Mittel {mean_pct:+.1f}%.")
    if max_lag:
        print(f"Spätester Revisions-Lag: {max_lag['final_lag_weeks']} Wochen (Woche {max_lag['epiweek']}).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
