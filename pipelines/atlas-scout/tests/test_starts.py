"""Der Parser der S+T+ARTS-Gewinnerseiten — ohne Netz und ohne Schlüssel prüfbar.

Tavily rendert die JS-Seite, der Parser liest das Markdown. Kein Modell beteiligt, also
ist der Schritt vollständig testbar — und das ist der Grund, ihn so zu bauen.
"""
from __future__ import annotations

from atlas_scout.sources import starts

# Form wie von Tavily geliefert (2026-07-26 abgenommen), inklusive Markdown-Escapes.
MARKDOWN = """
# 2026 Winners

## Grand Prizes 2026

* ## [Mechanical Kurds](https://ars.electronica.art/starts-prize/en/mechanical-kurds/)

  ## Hito Steyerl (DE)

  A video installation about outsourced data labour.
* ## [Building for Quantum](https://ars.electronica.art/starts-prize/en/building-for-quantum/)

  ## Marina Otero Verzier (ES), Manuel Correa (CO)

  Building for Quantum is a video installation combining footage.
* ## [The Future Conditional: 00\\_To Create Love](https://ars.electronica.art/starts-prize/en/the-future-conditional/)

  ## Romi Ron Morrison (INT)

  A work on infrastructures of care.
* ## [2025 Winners](https://ars.electronica.art/starts-prize/en/winners/winners2025/)

  ## Navigation

  Not a work.
"""


def test_liest_titel_urheber_und_werkspezifische_url():
    funde = starts.lies_jahrgang(MARKDOWN, 2026)
    assert [f["titel"] for f in funde][:2] == ["Mechanical Kurds", "Building for Quantum"]
    assert funde[0]["urheber"] == "Hito Steyerl"
    assert funde[0]["url"].endswith("/mechanical-kurds/")


def test_navigationslinks_sind_keine_werke():
    """Der Jahrgangs-Index steht in derselben Listenform wie die Werke."""
    funde = starts.lies_jahrgang(MARKDOWN, 2026)
    assert all("/winners/" not in f["url"] for f in funde)
    assert "2025 Winners" not in [f["titel"] for f in funde]


def test_laendercodes_fallen_aus_dem_namen():
    funde = starts.lies_jahrgang(MARKDOWN, 2026)
    namen = {f["titel"]: f["urheber"] for f in funde}
    assert namen["Building for Quantum"] == "Marina Otero Verzier, Manuel Correa"
    # „(INT)" ist dreibuchstabig — die frühere Fassung ließ es stehen.
    assert namen["The Future Conditional: 00_To Create Love"] == "Romi Ron Morrison"


def test_markdown_escapes_werden_aufgeloest():
    funde = starts.lies_jahrgang(MARKDOWN, 2026)
    assert "00_To Create Love" in [f["titel"] for f in funde][2]
    assert "\\_" not in "".join(f["titel"] for f in funde)


def test_jahr_ist_das_auszeichnungsjahr_und_wird_vermerkt():
    funde = starts.lies_jahrgang(MARKDOWN, 2026)
    assert all(f["jahr"] == 2026 for f in funde)
    assert all(f["signale"]["auszeichnungsjahr"] == 2026 for f in funde)


def test_funde_gelten_als_kuratiert():
    """Eine Jury der Europäischen Kommission hat die Auswahl getroffen."""
    funde = starts.lies_jahrgang(MARKDOWN, 2026)
    assert all(f["signale"]["kuratiert"] for f in funde)


def test_ohne_schluessel_faellt_die_quelle_aus_statt_leer_zu_liefern(monkeypatch):
    """Ein leeres Ergebnis darf nicht wie „nichts gefunden" aussehen."""
    monkeypatch.delenv("TAVILY_API_KEY", raising=False)
    try:
        starts.ernte(jahre=(2026,))
    except starts.QuellenAusfall as fehler:
        assert "TAVILY_API_KEY" in str(fehler)
    else:  # pragma: no cover
        raise AssertionError("QuellenAusfall erwartet")


def test_kein_schluessel_in_der_ausfallmeldung(monkeypatch):
    """Vermerke landen im öffentlichen Archiv — dort darf kein Schlüssel stehen."""
    monkeypatch.setenv("TAVILY_API_KEY", "tvly-geheim-nicht-ins-archiv")
    monkeypatch.setattr(starts.httpx, "post", lambda *a, **k: (_ for _ in ()).throw(
        starts.httpx.ConnectError("boom")))
    try:
        starts.ernte(jahre=(2026,))
    except starts.QuellenAusfall as fehler:
        assert "tvly-" not in str(fehler)
