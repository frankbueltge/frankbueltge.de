"""The self-check: before a record is written, the run grades it against a rubric and writes
the grade into the record itself.

This is the first loop around the pipeline — observe the output, judge it, and (for the one
failure that can be repaired on the spot, a source that did not answer) try once more before
judging. Nothing here estimates or repairs numbers: a failed check is recorded as failed, the
file is still written, and the page says so. The thresholds live in `rules.json` under the
`quality_*` keys; the rubric version travels with every grade so a later reading knows which
rubric produced it.
"""
from __future__ import annotations

import json
from typing import Any

RUBRIC_VERSION = "1"

# Titles that mean a filter failed rather than a reader read something: the main pages and
# namespace prefixes of the Wikipedia editions the day reads.
_FURNITURE_TITLES = frozenset({
    "main page", "hauptseite", "wikipédia:accueil principal", "wikipedia:portada",
    "メインページ", "wikipédia:página principal", "special:search", "spezial:suche",
})
_NAMESPACE_PREFIXES = (
    "special:", "spezial:", "spécial:", "especial:", "特別:", "wikipedia:", "wikipédia:",
    "portal:", "portail:", "file:", "datei:", "fichier:", "archivo:", "help:", "hilfe:",
    "aide:", "ayuda:", "talk:", "diskussion:", "discussion:", "discusión:", "user:",
    "benutzer:", "utilisateur:", "usuario:", "usuário:", "template:", "vorlage:", "modèle:",
    "plantilla:", "mediawiki:", "category:", "kategorie:", "catégorie:", "categoría:",
    "categoria:",
)


def _check(check_id: str, ok: bool, note: str) -> dict[str, Any]:
    return {"id": check_id, "ok": bool(ok), "note": note[:200]}


def _grade(checks: list[dict[str, Any]]) -> dict[str, Any]:
    passed = sum(1 for c in checks if c["ok"])
    return {
        "rubric_version": RUBRIC_VERSION,
        "ok": passed == len(checks),
        "passed": passed,
        "total": len(checks),
        "checks": checks,
    }


def looks_like_furniture(label: str) -> bool:
    low = (label or "").strip().lower()
    return low in _FURNITURE_TITLES or any(low.startswith(p) for p in _NAMESPACE_PREFIXES)


def _size(record: dict[str, Any]) -> int:
    return len(json.dumps(record, ensure_ascii=False).encode("utf-8"))


def assess_day(record: dict[str, Any], rules: dict[str, Any] | None = None) -> dict[str, Any]:
    """Grade a `trending-day/1` record. Pure: reads the record, returns the grade."""
    rules = rules or {}
    checks: list[dict[str, Any]] = []

    sources = list(record.get("sources") or [])
    total = len(sources)
    ok_n = sum(1 for s in sources if s.get("status") == "ok")
    partial = sum(1 for s in sources if s.get("status") == "partial")
    share_min = float(rules.get("quality_min_sources_share", 0.6))
    answered = (ok_n + partial) / total if total else 0.0
    checks.append(_check(
        "sources_answering", answered >= share_min,
        f"{ok_n} ok, {partial} partial, {total - ok_n - partial} unavailable of {total} "
        f"(floor {share_min:.0%})"))

    signals = record.get("signals") or {}
    n_sig = sum(len(v) for v in signals.values())
    min_sig = int(rules.get("quality_min_signals", 100))
    checks.append(_check("signals_present", n_sig >= min_sig,
                         f"{n_sig} signals (floor {min_sig})"))

    topics = list(record.get("topics") or [])
    biggest = max((len(t.get("signals") or []) for t in topics), default=0)
    share_max = float(rules.get("quality_max_cluster_share", 0.15))
    ceiling = max(8, int(share_max * n_sig))
    checks.append(_check(
        "no_giant_cluster", biggest <= ceiling,
        f"largest cluster holds {biggest} of {n_sig} signals (ceiling {ceiling})"))

    bad = [t.get("label", "") for t in topics
           if not any(ch.isalpha() for ch in t.get("label", "")) or len(t.get("label", "")) > 120]
    checks.append(_check(
        "labels_sane", not bad,
        f"{len(bad)} suspicious topic labels" + (": " + "; ".join(bad[:3]) if bad else "")))

    ids = [t.get("id") for t in topics]
    checks.append(_check("topic_ids_unique", len(ids) == len(set(ids)),
                         f"{len(ids)} topics, {len(set(ids))} distinct ids"))

    leaks = [s.get("label", "") for s in signals.get("wikipedia", []) if looks_like_furniture(s.get("label", ""))]
    checks.append(_check(
        "wikipedia_filter_held", not leaks,
        f"{len(leaks)} namespace or main-page titles among the Wikipedia signals"
        + (": " + "; ".join(leaks[:3]) if leaks else "")))

    size = _size(record)
    max_bytes = int(rules.get("quality_max_bytes", 600_000))
    checks.append(_check("size_within_bounds", size <= max_bytes,
                         f"{size} bytes (ceiling {max_bytes})"))
    return _grade(checks)


_STATUSES = frozenset({"emerging", "rising", "established", "fading", "quiet"})


def assess_terms(record: dict[str, Any], rules: dict[str, Any] | None = None) -> dict[str, Any]:
    """Grade a `trending-terms/1` record."""
    rules = rules or {}
    checks: list[dict[str, Any]] = []

    sources = list(record.get("sources") or [])
    total = len(sources)
    ok_n = sum(1 for s in sources if s.get("status") == "ok")
    partial = sum(1 for s in sources if s.get("status") == "partial")
    share_min = float(rules.get("quality_terms_min_platforms_share", 0.6))
    answered = (ok_n + partial) / total if total else 0.0
    checks.append(_check(
        "platforms_answering", answered >= share_min,
        f"{ok_n} ok, {partial} partial, {total - ok_n - partial} unavailable of {total} "
        f"(floor {share_min:.0%})"))

    terms = list(record.get("terms") or [])
    non_monotone = []
    for t in terms:
        tot = t.get("total") or {}
        d1, d7, d30 = tot.get("d1", 0), tot.get("d7", 0), tot.get("d30", 0)
        if not (0 <= d1 <= d7 <= d30):
            non_monotone.append(t.get("slug", "?"))
    checks.append(_check(
        "windows_monotone", not non_monotone,
        f"{len(non_monotone)} terms whose one-, seven- and thirty-day totals do not nest"
        + (": " + ", ".join(non_monotone[:3]) if non_monotone else "")))

    unknown = [t.get("slug", "?") for t in terms if t.get("status") not in _STATUSES]
    checks.append(_check("statuses_named", not unknown,
                         f"{len(unknown)} terms outside the closed status set"))

    undated = 0
    for t in terms:
        for r in t.get("receipts") or []:
            if not (r.get("title") and r.get("url") and r.get("date")):
                undated += 1
    checks.append(_check("receipts_complete", undated == 0,
                         f"{undated} receipts missing a title, a url or a date"))

    top = int(rules.get("discover_top", 30))
    n_cand = len(record.get("candidates") or [])
    checks.append(_check("candidates_bounded", n_cand <= top,
                         f"{n_cand} candidates (ceiling {top})"))

    promoted = list(record.get("promoted") or [])
    per_run = int(rules.get("promote_max_per_run", 3))
    slugs = {str(p.get("slug") or "") for p in promoted}
    tracked_slugs = {str(t.get("slug") or "") for t in terms}
    checks.append(_check(
        "promotions_bounded",
        len(promoted) <= per_run and len(slugs) == len(promoted) and not (slugs & tracked_slugs),
        f"{len(promoted)} promoted this run (ceiling {per_run}), "
        f"{len(slugs & tracked_slugs)} of them already tracked"))

    size = _size(record)
    max_bytes = int(rules.get("quality_terms_max_bytes", 400_000))
    checks.append(_check("size_within_bounds", size <= max_bytes,
                         f"{size} bytes (ceiling {max_bytes})"))
    return _grade(checks)


def one_line(grade: dict[str, Any]) -> str:
    """For the run log and the workflow annotation."""
    failed = [c for c in grade["checks"] if not c["ok"]]
    head = f"self-check {grade['passed']}/{grade['total']}"
    if not failed:
        return head + " passed"
    return head + " — failed: " + "; ".join(f"{c['id']} ({c['note']})" for c in failed)
