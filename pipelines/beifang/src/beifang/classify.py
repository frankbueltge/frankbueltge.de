"""Host-Klassifikation: Drittanbieter, Tracker (EasyPrivacy/TDS), Firmen (TDS).

Offline & deterministisch: tldextract nutzt die gebündelte PSL-Momentaufnahme
(keine Netz-Abfrage), die Listen sind committete Snapshots.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import tldextract

_EXTRACT = tldextract.TLDExtract(suffix_list_urls=())


def registrable_domain(host: str) -> str:
    ext = _EXTRACT(host)
    if not ext.suffix:  # IPs, localhost, interne Hosts
        return host.lower()
    return f"{ext.domain}.{ext.suffix}".lower()


def parse_easyprivacy(text: str) -> frozenset[str]:
    domains: set[str] = set()
    for line in text.splitlines():
        if not line.startswith("||"):
            continue
        rule = line[2:]
        dollar = rule.find("$")
        pattern, options = (rule[:dollar], rule[dollar:]) if dollar != -1 else (rule, "")
        # Nur Whole-Domain-Anker akzeptieren: das URL-Muster (vor $-Optionen) darf nur
        # aus der Domain bestehen, optional mit einem einzelnen abschließenden "^"
        # (Trennzeichen-Platzhalter — laut ABP-Syntax kein Domain-Ende; folgt danach
        # weiteres Muster wie "*.bmp?", ist es keine Domain-Regel). Ein "/" irgendwo im
        # Muster macht es zu einer Pfad-Regel (z. B. ||cloudfront.net/analytics.js) —
        # die trifft nur einen Pfad, ggf. auf einem geteilten CDN-Host, nie die Domain.
        if "/" in pattern:
            continue
        caret = pattern.find("^")
        if caret != -1 and caret != len(pattern) - 1:
            continue
        if "domain=" in options:
            continue  # auf andere Seiten beschränkte Ausnahme, keine generelle Domain-Regel
        domain = pattern[:-1] if pattern.endswith("^") else pattern
        if not domain or "*" in domain or "." not in domain:
            continue
        domains.add(domain.lower())
    return frozenset(domains)


@dataclass(frozen=True)
class TdsData:
    """Zwei getrennte Auswertungen der DuckDuckGo-TDS-Datei.

    Tracker-Erkennung (eng): nur die `trackers`-Sektion — das sind die
    Domains, für die die TDS konkrete Block-Regeln definiert.
    Firmen-Zuordnung (breit): `trackers`-Owner UND die separate
    `domains`-Sektion (Domain -> Entity), aufgelöst über `entities`
    (Entity -> Anzeigename). Reale TDS-Dateien listen viele Firmen
    (z. B. LiveRamp) nur breit, nicht in `trackers` — wer nur die enge
    Sektion liest, verpasst genau die Akteure, die benannt werden müssen.
    """
    tracker_domains: frozenset[str]
    entity_map: dict[str, str]


def parse_tds(tds: dict) -> TdsData:
    """Tracker-Erkennung eng (trackers-Keys), Firmen-Zuordnung breit
    (trackers-Owner ∪ domains-Sektion via entities). Bei Konflikt
    gewinnt der trackers-Owner (spezifischer als die breite domains-Zuordnung).
    """
    tracker_domains = frozenset(
        domain.lower() for domain in (tds.get("trackers") or {}).keys()
    )

    entities = tds.get("entities") or {}
    entity_map: dict[str, str] = {}

    # (b) breite domains-Sektion zuerst befüllen, (a) trackers-Owner überschreibt danach.
    for domain, entity_name in (tds.get("domains") or {}).items():
        display_name = (entities.get(entity_name) or {}).get("displayName") or entity_name
        entity_map[domain.lower()] = display_name

    for domain, info in (tds.get("trackers") or {}).items():
        owner = (info or {}).get("owner") or {}
        name = owner.get("displayName") or owner.get("name")
        if name:
            entity_map[domain.lower()] = name

    return TdsData(tracker_domains=tracker_domains, entity_map=entity_map)


def _domain_chain(host: str) -> list[str]:
    """sub.a.example.com -> [sub.a.example.com, a.example.com, example.com]"""
    reg = registrable_domain(host)
    parts = host.lower().split(".")
    chain: list[str] = []
    for i in range(len(parts)):
        cand = ".".join(parts[i:])
        chain.append(cand)
        if cand == reg:
            break
    return chain


@dataclass(frozen=True)
class Classification:
    third_party_hosts: frozenset[str]
    tracker_hosts: frozenset[str]
    entities: frozenset[str]


def classify(first_party_domain: str, hosts: Iterable[str],
             easyprivacy: frozenset[str], tds: TdsData) -> Classification:
    third: set[str] = set()
    trackers: set[str] = set()
    entities: set[str] = set()
    for host in hosts:
        h = host.lower()
        if not h or registrable_domain(h) == first_party_domain:
            continue
        third.add(h)
        chain = _domain_chain(h)
        if any(c in easyprivacy for c in chain) or any(c in tds.tracker_domains for c in chain):
            trackers.add(h)
        for c in chain:
            if c in tds.entity_map:
                entities.add(tds.entity_map[c])
                break
    return Classification(frozenset(third), frozenset(trackers), frozenset(entities))
