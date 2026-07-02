"""Lauf-Snapshot: SiteResults bauen, Vorlauf vergleichen, Befund der Woche heben.

Value-null-Disziplin (Muster protokoll): blockiert/gescheitert => Kennzahlen sind null,
nie 0 — eine verweigerte Messung ist keine Messung mit Ergebnis 0.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Sequence

from urllib.parse import urlsplit

from beifang import PIPELINE_VERSION
from beifang.capture import RawCapture
from beifang.classify import Classification, registrable_domain
from beifang.leaks import find_leaks
from beifang.model import (SCHEMA_VERSION, Befund, Blocked, ListMeta, RunRecord,
                           SiteResult, Vantage)

_NULLED = dict(requests_total=None, third_party_hosts=None, third_party_requests=None,
               third_party_bytes=None, tracker_hosts=None, entities=None,
               cookies_first_party=None, cookies_third_party=None,
               leaks=None, leak_firmen=None, doi_leak=None)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def site_result(entry: dict, *, retrieved_at: str, raw: RawCapture | None = None,
                cls: Classification | None = None, blocked: Blocked | None = None,
                note: str | None = None, identity: dict | None = None,
                tds=None) -> SiteResult:
    common = dict(panel_id=entry["id"], url=entry["url"], group=entry["group"],
                  publisher=entry["publisher"], retrieved_at=retrieved_at)
    if raw is None:  # Navigation gescheitert — Quelle nicht erreichbar
        return SiteResult(final_url=None, final_domain=None, http_status=None,
                          blocked=None, note=note, **_NULLED, **common)
    final_domain = registrable_domain(urlsplit(raw.final_url).hostname or "")
    if blocked is not None:  # Verlag verweigert die Messung — Kennzahlen entfallen
        return SiteResult(final_url=raw.final_url, final_domain=final_domain,
                          http_status=raw.http_status, blocked=blocked, note=note,
                          **_NULLED, **common)
    assert cls is not None
    third_reqs = [r for r in raw.requests if registrable_domain(r.host) != final_domain]
    cookies_first = sum(1 for c in raw.cookies
                        if registrable_domain(c.domain) == final_domain)
    leaks = find_leaks(identity, raw.requests, final_domain, tds) if tds is not None else ()
    firmen = tuple(sorted({l.firma for l in leaks if l.firma}))
    doi_leak = any(l.token == "doi" for l in leaks)
    return SiteResult(final_url=raw.final_url, final_domain=final_domain,
                      http_status=raw.http_status, blocked=None, note=note,
                      requests_total=len(raw.requests),
                      third_party_hosts=len(cls.third_party_hosts),
                      third_party_requests=len(third_reqs),
                      third_party_bytes=sum(r.bytes or 0 for r in third_reqs),
                      tracker_hosts=tuple(sorted(cls.tracker_hosts)),
                      entities=tuple(sorted(cls.entities)),
                      cookies_first_party=cookies_first,
                      cookies_third_party=len(raw.cookies) - cookies_first,
                      leaks=leaks, leak_firmen=firmen, doi_leak=doi_leak,
                      **common)


def load_previous(repo_root: Path, before: str) -> dict | None:
    archive = repo_root / "src/content/beifang"
    dates = sorted((p for p in archive.glob("*/*.json") if p.stem < before), reverse=True)
    if not dates:
        return None
    return json.loads(dates[0].read_text(encoding="utf-8"))


def _median(xs: list[int]) -> float:
    s = sorted(xs)
    n = len(s)
    return float(s[n // 2]) if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2.0


def _tracker_medians(results: list[dict]) -> dict[str, float]:
    by_pub: dict[str, list[int]] = {}
    for r in results:
        if r["group"] != "verlag" or r["blocked"] is not None or r["tracker_hosts"] is None:
            continue
        by_pub.setdefault(r["publisher"], []).append(len(r["tracker_hosts"]))
    return {p: _median(xs) for p, xs in by_pub.items()}


def _as_dicts(results: Sequence[SiteResult]) -> list[dict]:
    from dataclasses import asdict
    return [asdict(r) for r in results]


def compute_befund(results: Sequence[SiteResult], previous: dict | None) -> Befund:
    if previous is None:
        return Befund(kind="baseline")
    cur = _as_dicts(results)
    prev = ((previous.get("vantages") or {}).get("us") or {}).get("results") or []
    prev_by_id = {r["panel_id"]: r for r in prev}
    # Priorität 1: neue Blockade (Verlag verweigert erstmals die Messung)
    new_blocked = sorted(r["panel_id"] for r in cur
                         if r["blocked"] is not None
                         and r["panel_id"] in prev_by_id
                         and prev_by_id[r["panel_id"]]["blocked"] is None)
    if new_blocked:
        pid = new_blocked[0]
        pub = next(r["publisher"] for r in cur if r["panel_id"] == pid)
        return Befund(kind="blockade_neu", params={"panel_id": pid, "publisher": pub})
    # Priorität 2: neue Firma auf Verlagsseiten (Baseline: nur Verlagsseiten des Vorlaufs —
    # eine Firma, die bisher nur auf Kontrollseiten sichtbar war, ist auf Verlagsseiten neu)
    prev_entities = {e for r in prev if r.get("group") == "verlag"
                     for e in (r.get("entities") or ())}
    pages: dict[str, int] = {}
    for r in cur:
        if r["group"] != "verlag" or not r["entities"]:
            continue
        for e in r["entities"]:
            pages[e] = pages.get(e, 0) + 1
    new_entities = sorted(e for e in pages if e not in prev_entities)
    if new_entities:
        e = new_entities[0]
        return Befund(kind="entity_neu", params={"entity": e, "pages": pages[e]})
    # Priorität 3: größte Median-Verschiebung je Verlag
    cur_m, prev_m = _tracker_medians(cur), _tracker_medians(prev)
    deltas = sorted(((abs(cur_m[p] - prev_m[p]), p) for p in cur_m if p in prev_m),
                    key=lambda t: (-t[0], t[1]))  # Tie-Break: lexikographisch kleinster Verlag (wie Prio 1/2)
    if deltas and deltas[0][0] > 0:
        _, p = deltas[0]
        return Befund(kind="median_delta", params={"publisher": p, "von": prev_m[p], "zu": cur_m[p]})
    return Befund(kind="unveraendert")


def assemble_run(*, date_iso: str, panel_version: str, runner: str, vantage: str,
                 results: Sequence[SiteResult], lists: dict[str, ListMeta],
                 previous: dict | None) -> RunRecord:
    vantages = {
        "us": Vantage(status="ok", note=None, results=tuple(results)),
        "eu": Vantage(status="ausstehend", note="EU-Messpunkt nicht aufgebaut", results=None),
    }
    return RunRecord(date=date_iso, generated_at=utc_now_iso(),
                     schema_version=SCHEMA_VERSION, pipeline_version=PIPELINE_VERSION,
                     panel_version=panel_version, runner=runner, vantage=vantage, lists=dict(lists),
                     vantages=vantages, befund=compute_befund(results, previous))
