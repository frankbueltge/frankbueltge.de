"""Vergleicht neuen Fetch-Stand gegen den gespeicherten watch.json-Zustand; baut bei
Bedarf Titel/Body für das Issue.

Regeln:
  - alter fingerprint fehlt/None → Baseline setzen, KEIN Issue (Erstlauf der Quelle).
  - fingerprint geändert → Quelle zählt als "changed", issue-würdig.
  - Quelle unreachable (SourceUnavailable) → consecutive_unreachable hochzählen;
    ab 2 in Folge issue-würdig (eine einzelne tote Seite meldet noch nicht).
  - issue_needed = mind. eine geänderte Quelle ODER mind. eine Quelle mit
    >= 2 unreachable in Folge.
"""
from __future__ import annotations

from dataclasses import dataclass

from protokoll.spielraum.sources import WatchSource

RUNBOOK = "docs/superpowers/specs/2026-07-12-spielraum-design.md"
UNREACHABLE_THRESHOLD = 2


@dataclass(frozen=True)
class FetchResult:
    """Ergebnis eines einzelnen Quellen-Abrufs, vor dem Vergleich mit dem alten Stand."""
    source: WatchSource
    ok: bool
    matches: tuple[str, ...] = ()
    fingerprint: str | None = None
    error: str | None = None


@dataclass(frozen=True)
class WatchOutcome:
    sources: dict[str, dict]  # neuer Zustand je kind, geht 1:1 in watch.json["sources"]
    changed: list[str]
    unreachable: list[str]
    issue_needed: bool
    title: str
    body: str


def compare(old_state: dict, new_results: list[FetchResult], today: str) -> WatchOutcome:
    old_sources = (old_state or {}).get("sources", {})
    new_sources: dict[str, dict] = {}
    changed: list[str] = []
    unreachable: list[str] = []
    # (Quelle, neue Treffer, entfallene Treffer) — nur für geänderte Quellen, für den Issue-Body.
    changed_details: list[tuple[WatchSource, list[str], list[str]]] = []

    for r in new_results:
        kind = r.source.kind
        old = old_sources.get(kind, {})
        old_fingerprint = old.get("fingerprint")
        old_matches = set(old.get("matches") or [])

        if r.ok:
            new_matches = list(r.matches)
            new_sources[kind] = {
                "company": r.source.company,
                "url": r.source.url,
                "last_checked": today,
                "status": "ok",
                "consecutive_unreachable": 0,
                "fingerprint": r.fingerprint,
                "matches": new_matches,
            }
            if old_fingerprint is not None and r.fingerprint != old_fingerprint:
                changed.append(kind)
                added = sorted(set(new_matches) - old_matches)
                removed = sorted(old_matches - set(new_matches))
                changed_details.append((r.source, added, removed))
            # old_fingerprint is None → Erstlauf dieser Quelle: Baseline, kein Issue.
        else:
            count = int(old.get("consecutive_unreachable") or 0) + 1
            new_sources[kind] = {
                "company": r.source.company,
                "url": r.source.url,
                "last_checked": today,
                "status": "unreachable",
                "consecutive_unreachable": count,
                "fingerprint": old_fingerprint,  # letzter bekannter Stand bleibt erhalten
                "matches": sorted(old_matches),
            }
            if count >= UNREACHABLE_THRESHOLD:
                unreachable.append(kind)

    issue_needed = bool(changed) or bool(unreachable)
    title, body = _build_issue(changed_details, unreachable, new_sources)
    return WatchOutcome(sources=new_sources, changed=changed, unreachable=unreachable,
                         issue_needed=issue_needed, title=title, body=body)


def _build_issue(changed_details: list[tuple[WatchSource, list[str], list[str]]],
                  unreachable_kinds: list[str], new_sources: dict[str, dict]) -> tuple[str, str]:
    n = len(changed_details)
    if n:
        title = f"Spielraum-Watch: Änderung auf {n} Report-Seite(n) — Ingest prüfen"
    elif unreachable_kinds:
        title = "Spielraum-Watch: Quelle(n) nicht erreichbar — prüfen"
    else:
        title = "Spielraum-Watch"

    lines: list[str] = []
    if changed_details:
        lines.append("## Geänderte Quellen")
        lines.append("")
        lines.append("| Firma | URL | Neue Treffer | Entfallene Treffer |")
        lines.append("|---|---|---|---|")
        for source, added, removed in changed_details:
            added_s = ", ".join(added) if added else "–"
            removed_s = ", ".join(removed) if removed else "–"
            lines.append(f"| {source.company} | {source.url} | {added_s} | {removed_s} |")
        lines.append("")

    if unreachable_kinds:
        lines.append("## Quelle nicht erreichbar (2. Monat in Folge)")
        lines.append("")
        for kind in unreachable_kinds:
            entry = new_sources[kind]
            lines.append(f"- {entry['company']} — {entry['url']}")
        lines.append("")

    lines.append(
        f"Ingest-Runbook: `{RUNBOOK}`. Dieser Watcher parst keine PDFs und schreibt "
        "nicht ans Daten-Register — der Ingest ist ein manueller, verifizierter Schritt."
    )
    return title, "\n".join(lines)
