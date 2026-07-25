"""Die thematischen Felder — gemeinsame Sprache beider Atlanten.

Felder 1–7 kartieren Daten, KI und Macht (erste Fassung 2026). Felder 8–13 sind die
Erweiterung vom 2026-07-25: Datenkunst, die nicht von Macht handelt.

Ein Feld trägt zwei Abfragesätze, weil die beiden Atlanten verschiedene Gegenstände haben:
`literatur` sucht Texte über das Feld (Theorie-Atlas, OpenAlex), `werk_marker` erkennt
Werke im Feld (Werke-Atlas, Extraktion aus Ausstellungsseiten).

Die Nummern sind bindend — sie stehen so in `src/components/pages/AtlasPage.astro` und
landen als `clusters` im Werke-Atlas. Wer hier eine Nummer ändert, ändert die Karte.
"""
from __future__ import annotations

from dataclasses import dataclass

FAMILIE_MACHT = "macht"
FAMILIE_ERKENNTNIS = "erkenntnis"
FAMILIE_AUSDRUCK = "ausdruck"


@dataclass(frozen=True)
class Thema:
    nummer: int
    name: str
    familie: str
    literatur: tuple[str, ...]     # Suchbegriffe für OpenAlex
    werk_marker: tuple[str, ...]   # Stichworte, an denen ein Werk im Feld erkennbar ist

    @property
    def schlagworte(self) -> tuple[str, ...]:
        """Für die Bewertung: der Begriffsraum des Feldes."""
        return tuple(dict.fromkeys(self.literatur + self.werk_marker))


THEMEN: dict[int, Thema] = {
    # ── Familie Macht (Bestand, hier nur für die Werk-Extraktion beschrieben) ──────────
    1: Thema(1, "Material & planetare KI-Kosten", FAMILIE_MACHT,
             ("environmental cost of artificial intelligence", "extractivism computing"),
             ("mining", "energy", "water", "supply chain", "e-waste", "data center")),
    2: Thema(2, "KI im Krieg / Kill Cloud", FAMILIE_MACHT,
             ("autonomous weapons targeting", "military artificial intelligence critique"),
             ("drone", "targeting", "military", "border", "surveillance")),
    3: Thema(3, "Counter-Forensics / OSINT", FAMILIE_MACHT,
             ("counter forensics open source investigation", "forensic architecture method"),
             ("investigation", "evidence", "reconstruction", "osint", "forensic")),
    4: Thema(4, "Provenance / Authentizität", FAMILIE_MACHT,
             ("media provenance authenticity deepfake", "content credentials"),
             ("deepfake", "provenance", "authenticity", "watermark", "synthetic media")),
    5: Thema(5, "Dekolonial / more-than-human", FAMILIE_MACHT,
             ("decolonial computing", "more-than-human design"),
             ("indigenous", "decolonial", "multispecies", "more-than-human", "land")),
    6: Thema(6, "Data Justice / Data-Feminismus", FAMILIE_MACHT,
             ("data feminism", "data justice algorithmic accountability"),
             ("bias", "justice", "feminism", "labour", "care work", "accountability")),
    7: Thema(7, "KI-Selbstverzehr / Quanten", FAMILIE_MACHT,
             ("model collapse synthetic data training", "quantum computing art"),
             ("model collapse", "synthetic data", "recursive", "quantum")),

    # ── Familie Erkenntnis (neu, 2026-07-25) ──────────────────────────────────────────
    8: Thema(8, "Wahrnehmung & Maßstab", FAMILIE_ERKENNTNIS,
             ("making the imperceptible perceptible art", "scale perception visualization",
              "deep time representation", "planetary scale aesthetics"),
             ("scale", "imperceptible", "deep time", "microscopic", "planetary", "sensing")),
    9: Thema(9, "Zeit & Archiv", FAMILIE_ERKENNTNIS,
             ("archive theory digital memory", "data decay preservation art",
              "reconstruction of historical records"),
             ("archive", "memory", "decay", "preservation", "historical", "reconstruction")),
    10: Thema(10, "Fehler & Rauschen", FAMILIE_ERKENNTNIS,
              ("error as method art research", "glitch aesthetics theory",
               "noise information theory aesthetics", "failure epistemology"),
              ("glitch", "error", "noise", "failure", "artifact", "malfunction")),

    # ── Familie Ausdruck (neu, 2026-07-25) ────────────────────────────────────────────
    11: Thema(11, "Körper & Intimität", FAMILIE_AUSDRUCK,
              ("quantified self critique", "intimate data embodiment art",
               "biometric self-tracking aesthetics"),
              ("body", "biometric", "self-tracking", "intimacy", "illness", "care")),
    12: Thema(12, "Sprache & Generativität", FAMILIE_AUSDRUCK,
              ("computational poetics", "electronic literature generative text",
               "large language models creative writing"),
              ("text", "language model", "poetry", "generative writing", "chatbot")),
    13: Thema(13, "Material & Sinne", FAMILIE_AUSDRUCK,
              ("data physicalisation", "sonification of data aesthetics",
               "tactile data representation"),
              ("sonification", "physicalisation", "tactile", "textile", "sculpture", "haptic")),
}

NEUE_FELDER = tuple(n for n, t in THEMEN.items() if t.familie != FAMILIE_MACHT)


def hole(nummer: int) -> Thema:
    if nummer not in THEMEN:
        gueltig = ", ".join(str(n) for n in sorted(THEMEN))
        raise KeyError(f"Feld {nummer} gibt es nicht — gültig: {gueltig}")
    return THEMEN[nummer]
