"""Reiner Leak-Matcher: welcher Identitäts-Token verlässt die Seite an welchen Dritten,
in welcher Form (Klartext/URL-kodiert/Hash), über welchen Kanal (Query/Pfad/POST/Referer).

Deterministisch, netzfrei, auditierbar. Hartes Signal = DOI; weiches Signal = Titel/Keyword
(mit Längen-Guards gegen False Positives). Nur belegte Treffer — jeder Leak trägt seinen Beweis.
"""
from __future__ import annotations

import hashlib
from typing import Iterable
from urllib.parse import unquote_plus, urlsplit

from beifang.capture import RawRequest
from beifang.classify import TdsData, entity_for, registrable_domain
from beifang.model import Leak

_BEWEIS_MAX = 300
_TITEL_MIN = 20   # ganzer Titel als Phrase
_KEYWORD_MIN = 12  # Schlagwort spezifisch genug, kein Allerweltswort
_RESOLVER_HOSTS = frozenset({"doi.org"})  # der DOI-Resolver ist die Adresse, kein Empfänger


def _doi_hashes(doi: str) -> dict[str, str]:
    """hexdigests der DOI in den plausiblen Eingabeformen (bar/lowercased/doi.org-URL)."""
    forms = {doi, doi.lower(), f"https://doi.org/{doi}".lower()}
    out: dict[str, str] = {}
    for algo in ("md5", "sha1", "sha256"):
        for f in forms:
            out[getattr(hashlib, algo)(f.encode()).hexdigest()] = algo
    return out


def _channels(r: RawRequest) -> list[tuple[str, str]]:
    parts = urlsplit(r.url)
    ch: list[tuple[str, str]] = [("query", parts.query), ("pfad", parts.path)]
    if r.post_data:
        ch.append(("post", r.post_data))
    if r.referer:
        ch.append(("referer", r.referer))
    return [(k, v) for k, v in ch if v]


def _window(text: str, needle: str) -> str:
    """Beweis-Ausschnitt (<=300), um den Treffer zentriert — sonst könnte der
    eigentliche Leak jenseits der Kappung liegen und der Beweis wäre leer."""
    t = " ".join(text.split())
    if len(t) <= _BEWEIS_MAX:
        return t
    idx = t.lower().find(needle.lower())
    if idx == -1:
        return t[:_BEWEIS_MAX]
    start = max(0, idx - _BEWEIS_MAX // 3)
    end = min(len(t), start + _BEWEIS_MAX)
    return ("…" if start > 0 else "") + t[start:end] + ("…" if end < len(t) else "")


def find_leaks(identity: dict | None, requests: Iterable[RawRequest],
               first_party_domain: str, tds: TdsData) -> tuple[Leak, ...]:
    if not identity:
        return ()
    doi = identity.get("doi")
    titel = identity.get("titel")
    keywords = identity.get("keywords") or []
    doi_hashes = _doi_hashes(doi) if doi else {}

    found: dict[tuple, Leak] = {}
    for r in requests:
        if not r.host or registrable_domain(r.host) == first_party_domain:
            continue
        if registrable_domain(r.host) in _RESOLVER_HOSTS:
            continue  # DOI an den Resolver ist keine Exfiltration (registrable_domain deckt dx.doi.org mit ab)
        firma = entity_for(r.host, tds)
        for kanal, raw in _channels(r):
            low = raw.lower()
            dec = unquote_plus(raw)  # dekodiert %XX UND + -> Leerzeichen (form-urlencoded)
            dec_low = dec.lower()

            def add(token, signal, form, needle, haystack):
                key = (r.host, token, form, kanal)
                found.setdefault(key, Leak(token=token, signal=signal, form=form, kanal=kanal,
                                           host=r.host, firma=firma, beweis=_window(haystack, needle)))

            if doi:
                dl = doi.lower()
                if dl in low:
                    add("doi", "hard", "klartext", doi, raw)
                elif dl in dec_low:
                    add("doi", "hard", "url-kodiert", doi, dec)
                for hexd, algo in doi_hashes.items():
                    if hexd in low:
                        add("doi", "hard", algo, hexd, raw)
            if titel and len(titel) >= _TITEL_MIN and titel.lower() in dec_low:
                add("titel", "soft", "klartext", titel, dec)
            for kw in keywords:
                if len(kw) >= _KEYWORD_MIN and kw.lower() in dec_low:
                    add("keyword", "soft", "klartext", kw, dec)

    return tuple(found[k] for k in sorted(found))
