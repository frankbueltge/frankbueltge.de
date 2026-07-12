"""Watchlist der beobachteten Report-Landingpages.

Aufnahmeregel (dokumentiert, wie bei der Redaction-Watchlist): eine Quelle kommt in diese
Liste, wenn sie
  1. eine offizielle Landingpage eines der vier beobachteten Hyperscaler ist
     (Google, Microsoft, Meta, Amazon/AWS);
  2. dort regelmäßig Nachhaltigkeits-/Effizienzberichte veröffentlicht oder verlinkt
     werden (PDF-Reports oder ein Report-Index) — keine Presse-Digests, keine
     Analysten-Zusammenfassungen Dritter;
  3. stabil genug ist, um monatlich neu geladen zu werden (keine Login-Wall, kein
     reines JS-Rendering ohne Server-HTML).
Änderungen an dieser Liste (neue Firma, neue URL, entfernte Quelle) nur mit Vermerk in
der Spec: docs/superpowers/specs/2026-07-12-spielraum-design.md.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class WatchSource:
    kind: str
    company: str
    label: str
    url: str


WATCHLIST: tuple[WatchSource, ...] = (
    WatchSource(
        kind="google_sustainability_reports",
        company="Google",
        label="Sustainability Reports",
        url="https://sustainability.google/reports/",
    ),
    WatchSource(
        kind="microsoft_dc_efficiency",
        company="Microsoft",
        label="Datacenter Efficiency",
        url="https://datacenters.microsoft.com/sustainability/efficiency/",
    ),
    WatchSource(
        kind="microsoft_sustainability_report",
        company="Microsoft",
        label="Sustainability Report",
        url="https://www.microsoft.com/en-us/corporate-responsibility/sustainability/report",
    ),
    WatchSource(
        kind="meta_sustainability",
        company="Meta",
        label="Sustainability",
        url="https://sustainability.atmeta.com/",
    ),
    WatchSource(
        kind="amazon_sustainability",
        company="Amazon/AWS",
        label="Sustainability",
        url="https://sustainability.aboutamazon.com/",
    ),
)
