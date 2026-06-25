"""Pure assembly: per-series statistics, date rotation, day record. No IO."""
from __future__ import annotations

import json
from datetime import date

from round_number import METHOD_VERSION, PIPELINE_VERSION, SCHEMA_VERSION
from round_number import benford, controls, lastdigit
from round_number.datasets import Dataset

CONTROL_SAMPLES = 500
FLAG_THRESHOLD = 0.015


def analyze_series(ds: Dataset) -> dict:
    b = benford.analyze(ds.values)
    ld = lastdigit.analyze(ds.values)
    seed = b["n"]
    fpr = controls.false_positive_rate(
        b["n"], threshold=FLAG_THRESHOLD, samples=CONTROL_SAMPLES, seed=seed
    )
    return {
        "id": ds.id,
        "name": ds.name,
        "institution": ds.institution,
        "synthetic": ds.synthetic,
        "source": ds.source,
        "n": b["n"],
        "benford": b,
        "last_digit": ld,
        "control": {
            "method": "bootstrap of clean Benford samples, same n",
            "seed": seed,
            "samples": CONTROL_SAMPLES,
            "threshold": FLAG_THRESHOLD,
            "false_positive_rate": fpr,
            "verdict_on_clean": "frequently flagged" if fpr >= 0.2 else "rarely flagged",
        },
    }


def rotation_pick(ids: list[str], date_iso: str) -> str | None:
    if not ids:
        return None
    ordinal = date.fromisoformat(date_iso).toordinal()
    return ids[ordinal % len(ids)]


def day_record(date_iso: str, generated_at: str, results: list[dict], pick: str | None) -> dict:
    return {
        "date": date_iso,
        "generated_at": generated_at,
        "schema_version": SCHEMA_VERSION,
        "pipeline_version": PIPELINE_VERSION,
        "method_version": METHOD_VERSION,
        "pick": pick,
        "series": sorted(results, key=lambda r: r["id"]),
    }


def to_json(record: dict) -> str:
    return json.dumps(record, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
