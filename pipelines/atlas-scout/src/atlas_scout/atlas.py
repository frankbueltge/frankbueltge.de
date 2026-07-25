"""Lesen der beiden Atlanten und Aufbau des Abgleich-Index.

Der Scout schreibt **nie** in einen Atlas. Dieses Modul öffnet beide Dateien ausschließlich
lesend; der Hash des gelesenen Stands wandert in den Lauf, damit später nachvollziehbar ist,
gegen welchen Atlas-Stand ein Kandidat als „neu" galt.
"""
from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path

from .model import ATLAS_THEORIE, ATLAS_WERKE

# Pfade relativ zum Repo-Wurzelverzeichnis (frankbueltge.de).
PFAD_THEORIE = Path("src/data/atelier/atlas.json")
PFAD_WERKE = Path("src/data/atlas/werke.json")

# Der Theorie-Atlas wird im Ulysses-Repo geführt und in die Site gespiegelt. Für den Abgleich
# ist die gespiegelte Fassung ausreichend und liegt im selben Checkout; wer gegen den
# Ursprung prüfen will, setzt ATLAS_SCOUT_THEORIE_PFAD auf ../ulysses/atlas/atlas.json.
URSPRUNG_THEORIE = "ulysses/atlas/atlas.json"


@dataclass(frozen=True)
class Eintrag:
    """Ein bestehender Atlas-Eintrag, auf die für den Abgleich nötigen Felder reduziert."""

    id: str
    titel: str
    urheber: str
    jahr: int | None
    url: str | None
    doi: str | None
    schlagworte: tuple[str, ...]


@dataclass(frozen=True)
class AtlasStand:
    name: str
    pfad: Path
    sha256: str
    eintraege: tuple[Eintrag, ...]

    @property
    def bekannte_urls(self) -> frozenset[str]:
        return frozenset(normiere_url(e.url) for e in self.eintraege if e.url)

    @property
    def bekannte_dois(self) -> frozenset[str]:
        return frozenset(normiere_doi(e.doi) for e in self.eintraege if e.doi)

    @property
    def bekannte_titel(self) -> frozenset[str]:
        return frozenset(normiere_titel(e.titel) for e in self.eintraege if e.titel)

    def finde(self, eintrags_id: str) -> Eintrag | None:
        return next((e for e in self.eintraege if e.id == eintrags_id), None)


def normiere_url(url: str | None) -> str:
    """Grobe Normalisierung für den Dublettenabgleich — Schema, www und Schrägstrich egal."""
    if not url:
        return ""
    u = url.strip().lower()
    u = re.sub(r"^https?://", "", u)
    u = re.sub(r"^www\.", "", u)
    return u.rstrip("/")


def normiere_doi(doi: str | None) -> str:
    if not doi:
        return ""
    d = doi.strip().lower()
    d = re.sub(r"^https?://(dx\.)?doi\.org/", "", d)
    return d


def normiere_titel(titel: str | None) -> str:
    """Diakritika und Satzzeichen weg — fängt Schreibvarianten desselben Werks."""
    if not titel:
        return ""
    t = unicodedata.normalize("NFKD", titel.strip().lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = re.sub(r"[^a-z0-9 ]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def slugifiziere(*teile: str) -> str:
    """Kandidaten-ID im Format des Theorie-Atlas: nachname-kurztitel."""
    roh = " ".join(t for t in teile if t)
    s = unicodedata.normalize("NFKD", roh.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")[:80]


def _jahr(wert) -> int | None:
    """Beide Atlanten führen `year` uneinheitlich (int im Theorie-, str im Werke-Atlas)."""
    if isinstance(wert, int):
        return wert
    if isinstance(wert, str):
        treffer = re.search(r"-?\d{1,4}", wert)
        if treffer:
            return int(treffer.group())
    return None


def lade(atlas: str, wurzel: Path | None = None) -> AtlasStand:
    """Liest einen der beiden Atlanten. Rein lesend."""
    wurzel = wurzel or Path.cwd()
    pfad = wurzel / (PFAD_THEORIE if atlas == ATLAS_THEORIE else PFAD_WERKE)
    roh = pfad.read_bytes()
    sha = hashlib.sha256(roh).hexdigest()
    daten = json.loads(roh)

    if atlas == ATLAS_THEORIE:
        eintraege = tuple(
            Eintrag(
                id=e.get("id", ""),
                titel=e.get("work", ""),
                urheber=e.get("author", ""),
                jahr=_jahr(e.get("year")),
                url=e.get("url"),
                doi=e.get("doi"),
                schlagworte=tuple(e.get("tags", [])),
            )
            for e in daten
        )
    else:
        eintraege = tuple(
            Eintrag(
                # Der Werke-Atlas führt keine IDs — wir leiten eine stabile ab.
                id=slugifiziere(e.get("artist", ""), e.get("title", "")),
                titel=e.get("title", ""),
                urheber=e.get("artist", ""),
                jahr=_jahr(e.get("year")),
                url=e.get("source_url"),
                doi=None,
                schlagworte=tuple(
                    str(k) for k in (e.get("clusters") or [])
                ) + tuple(f for f in [e.get("axis_pole"), e.get("form")] if f),
            )
            for e in daten
        )

    return AtlasStand(name=atlas, pfad=pfad, sha256=sha, eintraege=eintraege)
