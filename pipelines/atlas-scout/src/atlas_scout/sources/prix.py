"""Werke-Atlas: Prix Ars Electronica — the yearly winners (since 2026-11-04).

The second source for current works, beside the S+T+ARTS Prize. Added when the atlas had
stood at 523 works for five weeks because its sources were exhausted (Frank's decision of
2026-11-04, wording private: grow the atlas again).

The winners page is rendered through Tavily, like S+T+ARTS, and read **without a model**.
After rendering it has a fixed form per work:

    **Golden Nica**                       (or Award of Distinction / Honorary Mention)

    ### Title

    #### Artist (CC), Second Artist (CC)

    “Jury quote …”

    [Read more](https://archive.aec.at/prix/320409/)

Three categories are read: Interactive Art+, Digital Humanity and New Animation Art. The
youth competition (u19–create your world) is not, because it is a school prize and the
atlas is a map of practice. The year is the award year, stated as such in `venue_prize`.

Needs `TAVILY_API_KEY`; without it the adapter raises QuellenAusfall and the run notes it.
"""
from __future__ import annotations

import re

from .starts import QuellenAusfall, _rendere, entkleide, zerlege_urheber

__all__ = ["QuellenAusfall", "lies_seite", "ernte"]

SEITE = "https://ars.electronica.art/prix/en/winners/"
KATEGORIEN = ("Interactive Art+", "Digital Humanity", "New Animation Art")

JAHR = re.compile(r"^#\s*Winners\s+(\d{4})\s*$", re.M)
ABSCHNITT = re.compile(r"^##\s+(?P<name>[^\n#]+?)\s*$", re.M)
EINTRAG = re.compile(
    r"\*\*(?P<preis>[^*\n]+)\*\*\s*"
    r"###\s+(?P<titel>[^\n]+?)\s*\n\s*"
    r"####\s+(?P<urheber>[^\n]+?)\s*\n"
    r"(?P<mitte>.*?)"
    r"\[Read more\]\((?P<url>https?://archive\.aec\.at/prix/\d+/?)\)",
    re.S,
)


def _abschnitte(markdown: str) -> list[tuple[str, str]]:
    """The page cut at its `## ` headings: [(name, text)]."""
    treffer = list(ABSCHNITT.finditer(markdown))
    return [
        (t.group("name").strip(), markdown[t.end(): treffer[i + 1].start() if i + 1 < len(treffer) else len(markdown)])
        for i, t in enumerate(treffer)
    ]


def lies_seite(markdown: str) -> list[dict]:
    """Works of the winners page. Deterministic, no model."""
    jahr_treffer = JAHR.search(markdown)
    if not jahr_treffer:
        return []
    jahr = int(jahr_treffer.group(1))
    funde: list[dict] = []
    for name, text in _abschnitte(markdown):
        if name not in KATEGORIEN:
            continue
        for t in EINTRAG.finditer(text):
            titel = entkleide(t.group("titel"))
            urheber = zerlege_urheber(t.group("urheber"))
            if not titel or not urheber:
                continue
            zitat = re.search(r"[“\"](.+?)[”\"]", t.group("mitte"), re.S)
            preis = re.sub(r"\s+", " ", t.group("preis")).strip()
            funde.append({
                "titel": titel,
                "urheber": urheber,
                "jahr": jahr,
                "url": t.group("url").rstrip("/") + "/",
                "doi": None,
                "abfrage": f"prix:{jahr}:{name}",
                "signale": {
                    "kuratiert": True,  # international jury of the Prix Ars Electronica
                    "eigene_webseite": True,
                    "schnipsel": entkleide(zitat.group(1))[:600] if zitat else "",
                    "begriffe": [],
                    "auszeichnungsjahr": jahr,
                    "preis": f"{preis}, {name}",
                },
            })
    return funde


def ernte(*, grenze: int = 80) -> list[dict]:
    """Raw finds from the current winners page of the Prix Ars Electronica."""
    seiten = _rendere([SEITE])
    funde: list[dict] = []
    for markdown in seiten.values():
        funde.extend(lies_seite(markdown or ""))
    return funde[:grenze]
