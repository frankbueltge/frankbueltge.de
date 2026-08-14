"""Pure assembly of the world chamber's daily record. No IO, no network."""
from __future__ import annotations

import json

from redaction.world import (
    FILTER_VERSION,
    REGISTER_BOUND,
    SELECTION_VERSION,
    WORLD_PIPELINE_VERSION,
    WORLD_SCHEMA_VERSION,
)
from redaction.world import selection, triviality
from redaction.world.gdg import GdgResult

GDELT_NOTICE = "Data: The GDELT Project — https://www.gdeltproject.org/"


def classify_rows(rows: list[dict]) -> list[dict]:
    """Attach a triviality verdict to every en title-change row; rows whose
    titles normalize to nothing are dropped (extraction junk, counted apart)."""
    out = []
    for r in rows:
        before = triviality.normalize(r.get("page_title") or "")
        after = triviality.normalize(r.get("title_new") or "")
        if not before or not after:
            continue
        out.append({
            "url": r["page_url"],
            "domain": r.get("page_domain_root") or "",
            "before": before,
            "after": after,
            "fetched_orig": r.get("fetched_orig"),
            "fetched_check": r.get("fetched_check"),
            "verdict": triviality.classify(before, after),
        })
    return out


def class_counts(classified: list[dict]) -> dict[str, int]:
    counts = {c: 0 for c in (triviality.TRIVIAL, triviality.UPDATE,
                             triviality.REFRAMING, triviality.REPLACED)}
    for r in classified:
        counts[r["verdict"].cls] += 1
    return counts


def _window(row: dict) -> str:
    """GDG rechecks at +24 h and +1 week; the timestamps say which this was."""
    fo, fc = row.get("fetched_orig") or "", row.get("fetched_check") or ""
    if len(fo) >= 10 and len(fc) >= 10:
        from datetime import date
        try:
            days = (date.fromisoformat(fc[:10]) - date.fromisoformat(fo[:10])).days
            return "24h" if days <= 2 else "1w"
        except ValueError:
            pass
    return "unknown"


def register_entries(classified: list[dict]) -> list[dict]:
    return [
        {
            "url": r["url"],
            "domain": r["domain"],
            "before": r["before"],
            "after": r["after"],
            "removed": list(r["verdict"].removed),
            "added": list(r["verdict"].added),
            "weight": selection.weight(r["verdict"]),
            "similarity": round(r["verdict"].similarity, 3),
            "window": _window(r),
            "detected": r["fetched_check"],
        }
        for r in selection.pick(classified)
    ]


def gdg_section(result: GdgResult, classified: list[dict]) -> dict:
    if not result.available:
        return {"available": False, "day": result.day, "note": result.note,
                "notice": GDELT_NOTICE}
    counts = class_counts(classified)
    return {
        "available": True,
        "day": result.day,
        "status_counts": result.counts,
        "title_changes_en": len(classified),
        "classes": counts,
        "register": register_entries(classified),
        "trace": result.traces,
        "notice": GDELT_NOTICE,
    }


def day_record(
    date_iso: str,
    generated_at: str,
    *,
    gdg: dict,
    deletion: dict,
    sample_committed: str | None,
) -> dict:
    return {
        "date": date_iso,
        "generated_at": generated_at,
        "schema_version": WORLD_SCHEMA_VERSION,
        "pipeline_version": WORLD_PIPELINE_VERSION,
        "filter_version": FILTER_VERSION,
        "selection_version": SELECTION_VERSION,
        "register_bound": REGISTER_BOUND,
        "gdg": gdg,
        "deletion": deletion,
        "sample_committed": sample_committed,
    }


def to_json(record: dict) -> str:
    return json.dumps(record, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
