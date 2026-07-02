"""Datenmodell des Beifang-Laufs. JSON ist das Archiv — Prosa entsteht erst im Frontend."""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field

SCHEMA_VERSION = "1"


@dataclass(frozen=True)
class ListMeta:
    source_url: str
    retrieved_at: str
    sha256: str


@dataclass(frozen=True)
class Blocked:
    type: str            # "http" | "challenge"
    marker: str | None   # z. B. "403" oder "just a moment"


@dataclass(frozen=True)
class Leak:
    token: str           # "doi" | "titel" | "keyword"
    signal: str          # "hard" | "soft"
    form: str            # "klartext" | "url-kodiert" | "md5" | "sha1" | "sha256"
    kanal: str           # "query" | "post" | "referer" | "pfad"
    host: str            # empfangender Drittanbieter-Host
    firma: str | None    # TDS-Entity oder None
    beweis: str          # gekappter Request-Ausschnitt (um den Treffer zentriert); NICHT redigiert — der leser-seitige Ad-Tech-Request enthält keine eigenen Secrets


@dataclass(frozen=True)
class SiteResult:
    panel_id: str
    url: str
    final_url: str | None
    final_domain: str | None
    group: str           # "verlag" | "kontrolle"
    publisher: str       # Verlags-Key bzw. Journal-Key der Kontrollgruppe
    http_status: int | None
    blocked: Blocked | None
    note: str | None
    requests_total: int | None
    third_party_hosts: int | None
    third_party_requests: int | None
    third_party_bytes: int | None
    tracker_hosts: tuple[str, ...] | None
    entities: tuple[str, ...] | None
    cookies_first_party: int | None
    cookies_third_party: int | None
    retrieved_at: str
    leaks: tuple[Leak, ...] | None
    leak_firmen: tuple[str, ...] | None
    doi_leak: bool | None


@dataclass(frozen=True)
class Vantage:
    status: str          # "ok" | "ausstehend" | "entfallen"
    note: str | None
    results: tuple[SiteResult, ...] | None


@dataclass(frozen=True)
class Befund:
    kind: str            # "baseline" | "blockade_neu" | "entity_neu" | "median_delta" | "unveraendert"
    params: dict = field(default_factory=dict)


@dataclass(frozen=True)
class RunRecord:
    date: str
    generated_at: str
    schema_version: str
    pipeline_version: str
    panel_version: str
    runner: str          # "github-actions" | "lokal" — Mess-Standort ehrlich ausweisen (Spec §5)
    vantage: str         # Messstandpunkt (Spec §5): "github-actions" | "vps" | ...
    lists: dict[str, ListMeta]
    vantages: dict[str, Vantage]
    befund: Befund


def run_record_to_json(record: RunRecord) -> str:
    return json.dumps(asdict(record), ensure_ascii=False, indent=2, sort_keys=True) + "\n"
