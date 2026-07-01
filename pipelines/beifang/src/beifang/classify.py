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
        for sep in ("^", "/", "$"):
            idx = rule.find(sep)
            if idx != -1:
                rule = rule[:idx]
        if not rule or "*" in rule or "." not in rule:
            continue
        domains.add(rule.lower())
    return frozenset(domains)


def parse_tds(tds: dict) -> dict[str, str]:
    out: dict[str, str] = {}
    for domain, info in (tds.get("trackers") or {}).items():
        owner = (info or {}).get("owner") or {}
        name = owner.get("displayName") or owner.get("name")
        if name:
            out[domain.lower()] = name
    return out


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
             easyprivacy: frozenset[str], entity_map: dict[str, str]) -> Classification:
    third: set[str] = set()
    trackers: set[str] = set()
    entities: set[str] = set()
    for host in hosts:
        h = host.lower()
        if not h or registrable_domain(h) == first_party_domain:
            continue
        third.add(h)
        chain = _domain_chain(h)
        if any(c in easyprivacy for c in chain) or any(c in entity_map for c in chain):
            trackers.add(h)
        for c in chain:
            if c in entity_map:
                entities.add(entity_map[c])
                break
    return Classification(frozenset(third), frozenset(trackers), frozenset(entities))
