"""Die Extraktionsstrecke des Werke-Atlas — ohne Netz und ohne Schlüssel prüfbar.

Der Extraktor ist einsteckbar, damit genau das geht: Was das Modell liefert, ist hier
festgelegt, und geprüft wird, was die Strecke daraus macht.
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from atlas_scout import extract
from atlas_scout.sources import eflux

WURZEL = Path(__file__).resolve().parents[3]
WERKE = WURZEL / "src/data/atlas/werke.json"

MELDUNG = {
    "url": "https://www.e-flux.com/announcements/123456/beispiel-ausstellung",
    "text": "Beispieltext einer Ausstellungsmeldung mit ausreichend Umfang für die Strecke.",
}


def stub(antwort: dict):
    def _extraktor(system: str, text: str) -> dict:
        assert system and text  # der Präfix muss ankommen
        return antwort
    return _extraktor


# ── Quelle: HTML-Zerlegung, rein deterministisch ──────────────────────────────────────

def test_meldungs_pfade_dublettenfrei_und_in_reihenfolge():
    html = (
        '<a href="/announcements/1/a">x</a><a href="/announcements/2/b">y</a>'
        '<a href="/announcements/1/a">nochmal</a><a href="/about">nein</a>'
    )
    assert eflux.meldungs_pfade(html) == ["/announcements/1/a", "/announcements/2/b"]


def test_artikeltext_zieht_tags_ab_und_normiert_leerraum():
    html = "<div>drumherum</div><article>  <p>Ein <b>Werk</b>\n\n von jemandem</p> </article>"
    assert eflux.artikeltext(html) == "Ein Werk von jemandem"


def test_artikeltext_ohne_article_ist_leer():
    assert eflux.artikeltext("<div>kein Artikel</div>") == ""


# ── Modellschritt ─────────────────────────────────────────────────────────────────────

def test_system_prompt_traegt_alle_dreizehn_felder():
    system = extract.baue_system_prompt(WERKE)
    for nummer in range(1, 14):
        assert f" {nummer:>2} " in system or f"{nummer} " in system


def test_system_prompt_ueberschreitet_haikus_cache_mindestlaenge():
    """Unter 4096 Token cached Haiku stillschweigend gar nichts — der Präfix muss darüber."""
    system = extract.baue_system_prompt(WERKE)
    # Grobe, bewusst konservative Schätzung: ~3,5 Zeichen je Token.
    geschaetzte_token = len(system) / 3.5
    assert geschaetzte_token > 4096, f"Präfix zu kurz: ~{geschaetzte_token:.0f} Token"


def test_erfundene_feldnummern_werden_verworfen():
    """Eine Feldnummer außerhalb 1–13 fiele sonst still in die öffentliche Karte."""
    funde, _ = extrahiere_mit({"werke": [{
        "titel": "Ein Werk", "urheber": "Jemand", "jahr": 2025,
        "beschreibung": "…", "felder": [10, 99, 0, -3], "zuversicht": "hoch",
    }]})
    assert funde[0]["signale"]["felder"] == [10]


def test_werk_ohne_titel_wird_verworfen():
    funde, _ = extrahiere_mit({"werke": [
        {"titel": "  ", "urheber": "X", "jahr": None, "beschreibung": "",
         "felder": [], "zuversicht": "hoch"},
    ]})
    assert funde == []


def test_leere_meldung_ist_der_normalfall_und_kein_fehler():
    funde, _ = extrahiere_mit({"werke": []})
    assert funde == []


def test_rohfund_traegt_modell_und_prompt_hash():
    funde, prompt_hash = extrahiere_mit({"werke": [{
        "titel": "Ein Werk", "urheber": "Jemand", "jahr": None,
        "beschreibung": "…", "felder": [12], "zuversicht": "mittel",
    }]})
    signale = funde[0]["signale"]
    assert signale["modell"] == extract.MODELL
    assert signale["prompt_sha256"] == prompt_hash
    assert len(prompt_hash) == 64


def test_fehlendes_jahr_bleibt_none_statt_geraten():
    funde, _ = extrahiere_mit({"werke": [{
        "titel": "Ein Werk", "urheber": "Jemand", "jahr": None,
        "beschreibung": "…", "felder": [], "zuversicht": "niedrig",
    }]})
    assert funde[0]["jahr"] is None


def test_scheiternder_extraktor_reisst_den_lauf_nicht_ab():
    def kaputt(system: str, text: str) -> dict:
        raise RuntimeError("Modell nicht erreichbar")

    funde, _ = extract.extrahiere([MELDUNG], WERKE, kaputt)
    assert funde == []


def test_extraktion_ohne_schluessel_und_ohne_extraktor_wirft_verstaendlich(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    with pytest.raises(RuntimeError, match="ANTHROPIC_API_KEY"):
        extract.extrahiere([MELDUNG], WERKE, None)


def extrahiere_mit(antwort: dict):
    return extract.extrahiere([MELDUNG], WERKE, stub(antwort))
