"""Die Feldnummern sind bindend — sie stehen so in AtlasPage.astro und im Werke-Atlas.

Ein Tippfehler hier legt still ein Feld auf der öffentlichen Karte an, weil die
Filterleiste ihre Schlüssel aus den Daten ableitet. Deshalb steht die Nummernvergabe
unter Testschutz.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

from atlas_scout.themen import (
    FAMILIE_AUSDRUCK,
    FAMILIE_ERKENNTNIS,
    FAMILIE_MACHT,
    NEUE_FELDER,
    THEMEN,
    hole,
)

WURZEL = Path(__file__).resolve().parents[3]
# Die Feldlabels standen bis 2026-07-27 inline in AtlasPage.astro. Seit der
# Paper-Katalog dieselben Felder benennt, liegen sie in einer gemeinsamen Quelle —
# eine Kopie wäre die erste, die still veraltet.
THEMEN_KONFIG = WURZEL / "src/config/themen.ts"


def test_dreizehn_felder_lueckenlos_von_eins():
    assert sorted(THEMEN) == list(range(1, 14))


def test_jedes_feld_traegt_seine_eigene_nummer():
    for nummer, thema in THEMEN.items():
        assert thema.nummer == nummer


def test_familien_sind_wie_erwartet_verteilt():
    familien = {n: t.familie for n, t in THEMEN.items()}
    assert all(familien[n] == FAMILIE_MACHT for n in range(1, 8))
    assert all(familien[n] == FAMILIE_ERKENNTNIS for n in (8, 9, 10))
    assert all(familien[n] == FAMILIE_AUSDRUCK for n in (11, 12, 13))


def test_neue_felder_sind_genau_die_nicht_macht_felder():
    assert set(NEUE_FELDER) == {8, 9, 10, 11, 12, 13}


def test_jedes_feld_hat_abfragen_fuer_beide_atlanten():
    for thema in THEMEN.values():
        assert thema.literatur, f"Feld {thema.nummer} ohne Literatur-Abfrage"
        assert thema.werk_marker, f"Feld {thema.nummer} ohne Werk-Marker"


def test_schlagworte_sind_dublettenfrei():
    for thema in THEMEN.values():
        s = thema.schlagworte
        assert len(s) == len(set(s)), f"Feld {thema.nummer} hat doppelte Schlagworte"


def test_hole_wirft_verstaendlich_bei_unbekanntem_feld():
    with pytest.raises(KeyError, match="Feld 99 gibt es nicht"):
        hole(99)


def test_feldnummern_decken_sich_mit_der_atlas_seite():
    """Die Karte im Frontend und die Themen hier dürfen nicht auseinanderlaufen."""
    quelltext = THEMEN_KONFIG.read_text(encoding="utf-8")
    # Der englische Block ist der maßgebliche (die Site ist English-only).
    block = quelltext.split("THEMEN_LABELS_DE")[0]
    im_frontend = {int(n) for n in re.findall(r"^\s+(\d+): '", block, re.M)}
    assert im_frontend == set(THEMEN), (
        f"Frontend kennt {sorted(im_frontend)}, themen.py kennt {sorted(THEMEN)}"
    )


def test_familienzuordnung_deckt_sich_mit_dem_frontend():
    """Auch die drei Familien müssen beidseitig dieselben Felder gruppieren.

    Neu am 2026-07-27: Beim Auslagern der Labels ist FAMILIE mitgewandert — ohne
    Wächter wäre das die nächste Kopie gewesen, die still veraltet.
    """
    quelltext = THEMEN_KONFIG.read_text(encoding="utf-8")
    block = quelltext.split("export const FAMILIE:")[1].split("}")[0]
    im_frontend = {int(n) for n in re.findall(r"(\d+):\s*'", block)}
    assert im_frontend == set(THEMEN), (
        f"Frontend gruppiert {sorted(im_frontend)}, themen.py kennt {sorted(THEMEN)}"
    )


def test_werke_atlas_nutzt_keine_unbekannte_feldnummer():
    werke = json.loads((WURZEL / "src/data/atlas/werke.json").read_text(encoding="utf-8"))
    benutzt = {c for e in werke for c in (e.get("clusters") or [])}
    unbekannt = benutzt - set(THEMEN)
    assert not unbekannt, f"Werke-Atlas verweist auf unbekannte Felder: {sorted(unbekannt)}"
