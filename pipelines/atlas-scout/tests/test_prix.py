"""Prix Ars Electronica adapter and the S+T+ARTS archive rotation (2026-11-04)."""
from __future__ import annotations

from atlas_scout.sources import prix, starts

SEITE = """# Prix Ars Electronica

# Winners 2026

## New Animation Art

**Golden Nica**

### Deer Hunter

#### Andrew Herzog (US)

“Exceptionally precise, politically incisive.”

[Read more](https://archive.aec.at/prix/320401/)

## Interactive Art+

**Golden Nica**

### A Cartography of Genocide: Israel’s Conduct in Gaza Since October 2023

#### Forensic Architecture (INT)

“By transforming thousands of dispersed data points into a publicly accessible interface.”

[Read more](https://archive.aec.at/prix/320409/)

[![](https://ars.electronica.art/prix/files/2026/06/bruteforce.jpg)](https://archive.aec.at/prix/319889/)

Photo: Mathias Trumminger

**Honorary Mention**

### Brute Force

#### Vinzenz Aubry (FR), Robert Schnüll (DE)

“A precise demonstration of the dead-internet thesis.”

[Read more](https://archive.aec.at/prix/319889/)

## u19–create your world

**Golden Nica – Young Professionals**

### Reverse Rendering

#### Jannis Berner (AT)

“The jury praised the project.”

[Read more](https://archive.aec.at/prix/320321)
"""


def test_reads_works_of_the_three_categories_with_year_and_prize():
    funde = prix.lies_seite(SEITE)
    assert [f["titel"] for f in funde] == [
        "Deer Hunter",
        "A Cartography of Genocide: Israel’s Conduct in Gaza Since October 2023",
        "Brute Force",
    ]
    brute = funde[2]
    assert brute["urheber"] == "Vinzenz Aubry, Robert Schnüll"
    assert brute["jahr"] == 2026
    assert brute["url"] == "https://archive.aec.at/prix/319889/"
    assert brute["signale"]["preis"] == "Honorary Mention, Interactive Art+"
    assert brute["signale"]["schnipsel"] == "A precise demonstration of the dead-internet thesis."


def test_the_youth_competition_is_not_read():
    assert "Reverse Rendering" not in {f["titel"] for f in prix.lies_seite(SEITE)}


def test_a_page_without_a_year_yields_nothing_rather_than_a_guessed_year():
    assert prix.lies_seite(SEITE.replace("# Winners 2026", "# Winners")) == []


def test_older_yearbooks_with_thumbnails_are_read():
    markdown = """## Grand Prizes 2020

*   [![Image 5: EDEN – Ethics](https://x.invalid/a.jpg)](https://ars.electronica.art/starts-prize/en/eden/)
## [EDEN – Ethics – Durability – Ecology – Nature](https://ars.electronica.art/starts-prize/en/eden/)

## Olga Kisseleva

Bio-art: When a Tree became a Partner.
*   [![Image 12: Sociality](https://x.invalid/b.jpg)](https://ars.electronica.art/starts-prize/en/sociality/)
## [Sociality](https://ars.electronica.art/starts-prize/en/sociality/)

## Paolo Cirio

In Sociality, Cirio collected and rated Internet inventions.
"""
    funde = starts.lies_jahrgang(markdown, 2020)
    assert [(f["titel"], f["urheber"]) for f in funde] == [
        ("EDEN – Ethics – Durability – Ecology – Nature", "Olga Kisseleva"),
        ("Sociality", "Paolo Cirio"),
    ]


def test_the_rotation_reads_the_newest_yearbook_nightly_and_covers_the_archive():
    gesehen: set[int] = set()
    for tag in range(1, 15):
        jahre = starts.jahrgaenge(tag, 2026)
        assert jahre[0] == 2026 and len(jahre) == 3
        gesehen.update(jahre)
    assert gesehen == set(range(2016, 2027))
