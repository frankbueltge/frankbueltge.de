"""Identifier-Prüfung — die harte Aufnahmeregel beider Atlanten, vorgezogen auf den Scout.

Das Atlas-README verlangt einen „verified, retrievable identifier — checked at admission
time". Der Scout kann die Aufnahme nicht ersetzen, aber er kann verhindern, dass ein
Vorschlag überhaupt vorgelegt wird, dessen Identifier nicht auflöst. Was nicht auflöst,
wird als verworfen vermerkt — nicht stillschweigend weggelassen.
"""
from __future__ import annotations

from datetime import datetime, timezone

import httpx

from .model import Pruefung

ZEITLIMIT = httpx.Timeout(15.0, connect=8.0)
KOPF = {"User-Agent": "atlas-scout/0.1 (frankbueltge.de; link check)"}


def jetzt() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def pruefe(url: str, client: httpx.Client | None = None) -> Pruefung:
    """Löst ein Ziel auf. HEAD zuerst, GET als Rückfall — manche Server verweigern HEAD."""
    eigener_client = client is None
    client = client or httpx.Client(follow_redirects=True, headers=KOPF)
    try:
        antwort = None
        try:
            antwort = client.head(url, timeout=ZEITLIMIT)
            if antwort.status_code in (403, 405, 501):
                antwort = None  # HEAD verweigert — nichts über das Ziel ausgesagt
        except httpx.HTTPError:
            antwort = None

        if antwort is None:
            try:
                with client.stream("GET", url, timeout=ZEITLIMIT) as strom:
                    antwort = strom
                    status = strom.status_code
            except httpx.HTTPError as fehler:
                return Pruefung(
                    aufgeloest=False,
                    status=None,
                    geprueftes_ziel=url,
                    vermerk=f"nicht erreichbar: {type(fehler).__name__}",
                )
        else:
            status = antwort.status_code

        if 200 <= status < 300:
            return Pruefung(aufgeloest=True, status=status, geprueftes_ziel=url, vermerk=None)
        return Pruefung(
            aufgeloest=False,
            status=status,
            geprueftes_ziel=url,
            vermerk=f"Identifier antwortet mit HTTP {status}",
        )
    finally:
        if eigener_client:
            client.close()
