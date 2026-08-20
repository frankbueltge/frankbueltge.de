"""Pure assembly + ranking of the daily record. No IO, no network — fully tested."""
from __future__ import annotations

import json

from redaction import (
    PIPELINE_VERSION,
    SALIENCE_VERSION,
    SCHEMA_VERSION,
    VALIDITY_VERSION,
)
from redaction.cdx import Capture, permalink
from redaction.salience import Salience
from redaction.textdiff import Removal
from redaction.watchlist import WatchItem

MIN_REMOVED_TOKENS = 8

# The only kinds that may be published as findings. "deletion_candidate" is a
# question, not an answer — it never reaches the record (see live.py).
PUBLISHABLE_KINDS = ("deletion", "removal")

SOURCE = {
    "name": "Internet Archive — Wayback Machine (CDX)",
    "url": "https://web.archive.org/",
    "license": "Wayback Machine — public archive",
}


def _rid(url: str, after_ts: str) -> str:
    slug = url.split("://", 1)[-1].replace("/", "_")[:80]
    return f"{after_ts}_{slug}"


def make_redaction(
    item: WatchItem,
    kind: str,
    before_cap: Capture,
    after_cap: Capture,
    removal: Removal,
    salience: Salience,
    original_url: str,
) -> dict | None:
    if kind not in PUBLISHABLE_KINDS:
        return None
    if kind == "removal" and removal.tokens < MIN_REMOVED_TOKENS:
        return None
    return {
        "id": _rid(original_url, after_cap.timestamp),
        "url": original_url,
        "institution": item.institution,
        "label": item.label,
        "kind": kind,
        "before": {
            "wayback_ts": before_cap.timestamp,
            "url": permalink(before_cap.timestamp, original_url),
        },
        "after": {
            "wayback_ts": after_cap.timestamp,
            "url": permalink(after_cap.timestamp, original_url),
            "status": after_cap.status,
        },
        "removed_passages": removal.passages,
        "removed_tokens": removal.tokens,
        "salience": {"score": salience.score, "signals": salience.signals},
    }


def _weight(r: dict) -> int:
    return r["salience"]["score"] * r["removed_tokens"]


def rank(redactions: list[dict]) -> str | None:
    """Pick = argmax(salience.score × removed_tokens); ties: smaller (url, after_ts).
    None if empty or every candidate scores 0 (salience gates the ranking)."""
    best_id: str | None = None
    best_weight = 0
    best_tie: tuple[str, str] | None = None
    for r in redactions:
        w = _weight(r)
        if w <= 0:
            continue
        tie = (r["url"], r["after"]["wayback_ts"])
        if best_id is None or w > best_weight or (w == best_weight and tie < best_tie):
            best_id, best_weight, best_tie = r["id"], w, tie
    return best_id


def unverifiable_section(notes: list[dict]) -> dict:
    """Honest disclosure, chamber 2's discipline: what the pipeline could not
    verify is a published number with its reasons, never a silent gap."""
    reasons: dict[str, int] = {}
    for n in notes:
        reasons[n["reason"]] = reasons.get(n["reason"], 0) + 1
    return {
        "count": len(notes),
        "reasons": dict(sorted(reasons.items())),
        "items": sorted(notes, key=lambda n: (n["url"], n["reason"], n["side"])),
    }


def day_record(
    date_iso: str,
    generated_at: str,
    redactions: list[dict],
    watched_count: int,
    unverifiable: list[dict] | None = None,
) -> dict:
    return {
        "date": date_iso,
        "generated_at": generated_at,
        "schema_version": SCHEMA_VERSION,
        "pipeline_version": PIPELINE_VERSION,
        "salience_version": SALIENCE_VERSION,
        "validity_version": VALIDITY_VERSION,
        "watched_count": watched_count,
        "changed_count": len(redactions),
        "unverifiable": unverifiable_section(unverifiable or []),
        "removed_tokens_total": sum(r["removed_tokens"] for r in redactions),
        "pick": rank(redactions),
        "redactions": sorted(
            redactions,
            key=lambda r: (-_weight(r), r["url"], r["after"]["wayback_ts"]),
        ),
        "source": SOURCE,
    }


def to_json(record: dict) -> str:
    return json.dumps(record, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
