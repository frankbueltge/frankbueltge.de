"""Bewertung: welcher Kandidat verdient die Aufmerksamkeit eines Menschen?

Zwei getrennte Schritte, absichtlich:

  1. `sammle_signale()` — rein mechanisch. Zählt, misst, vergleicht. Keine Meinung.
  2. `gewichte()`      — die Meinung. Was von den Signalen zählt wie viel.

Schritt 1 ist deterministisch und getestet. Schritt 2 ist eine Setzung; sie entscheidet,
was der Scout Nacht für Nacht nach oben spült, und damit auch, wogegen der Atlas mit der
Zeit blind wird. Deshalb steht sie hier für sich und nicht verstreut im Erntecode.
"""
from __future__ import annotations

from .atlas import Eintrag, normiere_titel

# Kandidaten unterhalb dieser Punktzahl werden gar nicht erst vorgelegt.
SCHWELLE = 0.35


def _vereinheitliche(begriff: str) -> str:
    """Trennzeichen angleichen, damit Atlas-Schlagworte und Quellbegriffe vergleichbar sind."""
    return begriff.lower().replace("-", " ").replace("_", " ").replace("/", " ").strip()


def sammle_signale(rohfund: dict, saat: Eintrag, jahr_jetzt: int) -> dict[str, float]:
    """Mechanische Messung eines Rohfunds. Alle Werte auf 0.0–1.0 normiert."""
    quellsignale = rohfund.get("signale", {})
    signale: dict[str, float] = {}

    # Rezeption: log-gestaucht, damit ein Klassiker nicht alles andere erschlägt.
    zitationen = float(quellsignale.get("zitationen", 0) or 0)
    signale["rezeption"] = min(1.0, (zitationen ** 0.5) / 40.0)

    # Aktualität: was nach dem Saatgut-Eintrag kam, setzt die Debatte fort.
    jahr = rohfund.get("jahr")
    if isinstance(jahr, int) and jahr > 0:
        alter = max(0, jahr_jetzt - jahr)
        signale["aktualitaet"] = max(0.0, 1.0 - alter / 30.0)
        signale["nach_saatgut"] = 1.0 if (saat.jahr and jahr > saat.jahr) else 0.0
    else:
        signale["aktualitaet"] = 0.0
        signale["nach_saatgut"] = 0.0

    # Erreichbarkeit des Volltextes: der Atlas unterscheidet open access von paywalled.
    signale["frei_zugaenglich"] = 1.0 if quellsignale.get(
        "frei_zugaenglich", quellsignale.get("eigene_webseite", False)
    ) else 0.0

    # Begriffsnähe zum Saatgut-Eintrag: Überschneidung mit dessen Schlagworten.
    # Der Atlas schreibt Schlagworte mit Bindestrich („artistic-research"), OpenAlex führt
    # Begriffe mit Leerzeichen („artistic research") — ohne Angleichung trifft nie etwas.
    begriffe = {_vereinheitliche(b) for b in quellsignale.get("begriffe", [])}
    schlagworte = {_vereinheitliche(s) for s in saat.schlagworte}
    if begriffe and schlagworte:
        treffer = sum(
            1 for s in schlagworte
            if any(s in b or b in s for b in begriffe)
        )
        signale["begriffsnaehe"] = min(1.0, treffer / max(1, len(schlagworte)))
    else:
        signale["begriffsnaehe"] = 0.0

    # Eigenzitat-Verdacht: gleicher Titelkern wie das Saatgut ⇒ vermutlich dieselbe Arbeit.
    signale["titel_echo"] = 1.0 if normiere_titel(
        rohfund.get("titel", "")
    ) == normiere_titel(saat.titel) else 0.0

    # Signale, die es nur bei der Modell-Extraktion gibt (Werke-Atlas). Bei allen anderen
    # Quellen bleiben sie null und fallen aus der Gewichtung heraus.
    # Kuratierte Sammlung (ArtBase, dataphys, S+T+ARTS, externe Funde): Die Auswahl hat
    # schon jemand getroffen. Gemessen wird deshalb nur die Vollständigkeit des
    # Datensatzes — und zwar nur an Größen, die tatsächlich variieren.
    #
    # `kuratiert` selbst ist hier absichtlich KEIN Signal: es ist in diesem Zweig für
    # jeden Kandidaten 1.0. Eine Konstante mit Gewicht macht die Punktzahl konstant —
    # beobachtet 2026-07-26: alle 325 Kandidaten lagen bei genau 1.000, Schwelle und
    # Sortierung waren wirkungslos.
    #
    # Alter zählt nicht gegen das Werk: eine Sonifikationsarbeit von 2004 ist kanonisch,
    # nicht veraltet. Deshalb kein Aktualitätssignal in diesem Zweig.
    if quellsignale.get("kuratiert"):
        signale["datiert"] = 1.0 if rohfund.get("jahr") else 0.0
        signale["urheber_bekannt"] = 0.0 if rohfund.get("urheber") in ("", "unbekannt") else 1.0
        # Ein Eintrag ohne Prosa ist für den Atlas fast wertlos — er nennt ein Werk,
        # sagt aber nicht, was daran entscheidend ist.
        beschreibung = (quellsignale.get("schnipsel") or "").strip()
        signale["beschrieben"] = min(1.0, len(beschreibung) / 160.0)

    return signale


def gewichte(signale: dict[str, float]) -> tuple[float, tuple[str, ...]]:
    """Verdichtet die Signale zu einer Punktzahl plus Begründung.

    ┌─────────────────────────────────────────────────────────────────────────────┐
    │ TODO (Frank): Diese Gewichtung ist eine vorläufige Setzung von mir und       │
    │ verdient deine Entscheidung — sie bestimmt, was der Scout dir vorlegt.       │
    │                                                                             │
    │ Die Abwägung, um die es geht:                                               │
    │   • `rezeption` hoch gewichten  → du bekommst den etablierten Diskurs.      │
    │     Sicher, aber der Atlas wird zum Kanon und die Ränder verschwinden.      │
    │   • `aktualitaet` hoch          → du bekommst die laufende Debatte.         │
    │     Lebendig, aber viel davon ist in zwei Jahren vergessen.                 │
    │   • `begriffsnaehe` hoch        → du bekommst Bestätigung des Vorhandenen.  │
    │     Kohärent, aber es ist die geschlossene Schleife, gegen die der Atlas    │
    │     laut seinem eigenen README überhaupt angelegt wurde.                    │
    │   • `frei_zugaenglich` hoch     → du bekommst Lesbares statt Zitierbares.   │
    │                                                                             │
    │ Der interessante Fall ist der niedrig-rezipierte, begrifflich *ferne*        │
    │ Fund — teuer im Prüfen, aber genau das „andere Verteilung"-Argument.        │
    │ Willst du ihn belohnen statt bestrafen?                                     │
    └─────────────────────────────────────────────────────────────────────────────┘
    """
    if signale.get("titel_echo", 0.0) >= 1.0:
        return 0.0, ("Titel identisch mit dem Saatgut-Eintrag",)

    # --- vorläufig, ersetzbar ---------------------------------------------------
    if "beschrieben" in signale:
        # Werke-Atlas aus kuratierter Sammlung. Nur variable Größen, sonst wird die
        # Punktzahl konstant (siehe sammle_signale).
        gewichtung = {
            "urheber_bekannt": 0.40,
            "beschrieben": 0.35,
            "datiert": 0.25,
        }
    else:
        # Theorie-Atlas, aus der Literatur geerntet.
        #
        # `rezeption` ist absichtlich das kleinste Gewicht. Zitationszahl misst, wie
        # weit ein Text schon im Kanon steht — und der Atlas existiert laut seinem
        # eigenen README als die ANDERE Verteilung gegen eine geschlossene Schleife.
        # Ihn nach Rezeption zu füllen würde genau die Schleife nachbauen.
        #
        # `frei_zugaenglich` wiegt am schwersten: ein Eintrag, der nicht gelesen werden
        # kann, dient dem Reservoir nicht. Der Atlas unterscheidet open access von
        # paywalled ausdrücklich.
        gewichtung = {
            "frei_zugaenglich": 0.30,
            "begriffsnaehe": 0.25,
            "aktualitaet": 0.20,
            "nach_saatgut": 0.15,
            "rezeption": 0.10,
        }
    punkte = sum(signale.get(name, 0.0) * anteil for name, anteil in gewichtung.items())
    # ----------------------------------------------------------------------------

    begruendung = tuple(
        f"{name} {signale[name]:.2f}×{gewichtung[name]:.2f}"
        for name in sorted(gewichtung, key=lambda n: -signale.get(n, 0.0) * gewichtung[n])
        if signale.get(name, 0.0) > 0
    )
    return round(punkte, 4), begruendung or ("keine Signale über null",)
