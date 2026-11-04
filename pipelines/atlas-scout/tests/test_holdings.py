"""Grenzprüfung des Holdings-Adapters: Was zählt als benutzte Datenquelle."""
from __future__ import annotations

from pathlib import Path

from atlas_scout.holdings import ist_vorlage, sammle


def test_vorlagen_sind_keine_adressen():
    """Beobachtet am 2026-07-28: `…/winners{jahr}` wurde bei `{jahr` abgeschnitten und
    geprüft — HTTP 404. Das ist ein Befund über den Ausschnitt, nicht über die Quelle."""
    assert ist_vorlage("https://x.invalid/winners{jahr")
    assert ist_vorlage("https://x.invalid/data/%s.json")
    assert ist_vorlage("https://x.invalid/${jahr}/d")
    assert not ist_vorlage("https://x.invalid/data/2026.json")


def _schreibe(wurzel: Path, pfad: str, inhalt: str) -> None:
    ziel = wurzel / pfad
    ziel.parent.mkdir(parents=True, exist_ok=True)
    ziel.write_text(inhalt, encoding="utf-8")


def test_findet_quellen_mit_werk_und_fundstelle(tmp_path: Path):
    _schreibe(tmp_path, "pipelines/protokoll/src/protokoll/fetch.py",
              'URL = "https://firms.modaps.eosdis.nasa.gov/api/area"')
    quellen, _ = sammle(tmp_path)
    q = next(x for x in quellen if "nasa.gov" in x.host)
    assert q.werke == ("protokoll",)
    assert q.bezuege[0].datei.endswith("fetch.py")


def test_werkzeug_zaehlt_nicht_als_datenquelle(tmp_path: Path):
    """Ein Paketverzeichnis wird abgerufen, ist aber Werkzeug, nicht Gegenstand."""
    _schreibe(tmp_path, "pipelines/x/src/x/a.py",
              'A = "https://pypi.org/simple"\nB = "https://data.giss.nasa.gov/gistemp/"')
    quellen, vermerke = sammle(tmp_path)
    hosts = {q.host for q in quellen}
    assert "data.giss.nasa.gov" in hosts
    assert "pypi.org" not in hosts
    assert any("pypi.org" in v for v in vermerke), "Ausschluss wird vermerkt, nicht verschwiegen"


def test_wissenschaftliche_nachweise_gehen_in_den_paper_katalog(tmp_path: Path):
    """Ohne diese Trennung stünde derselbe Gegenstand in beiden Beständen."""
    _schreibe(tmp_path, "pipelines/x/src/x/a.py", 'D = "https://doi.org/10.1234/x"')
    quellen, vermerke = sammle(tmp_path)
    assert not any("doi.org" in q.host for q in quellen)
    assert any("Paper-Katalog" in v for v in vermerke)


# ── The practices' works and cited datasets (2026-11-04) ─────────────────────────────

import json  # noqa: E402

import httpx  # noqa: E402

from atlas_scout import holdings  # noqa: E402
from atlas_scout.holdings import (  # noqa: E402
    _gebrauchsbeleg,
    baue_doi_eintraege,
    sammle_praxen,
    vereinige,
)

PRAXEN = {"studio": "studio", "nightly": "error-as-method"}


def test_a_practice_fetch_is_read_with_practice_and_evidence(tmp_path: Path):
    _schreibe(tmp_path, "studio/works/2026-10-01-x/fetch.py",
              'BASE = "https://api.weather.gov/products"\n')
    quellen, vermerke = sammle_praxen(tmp_path, PRAXEN)
    (q,) = quellen
    assert q.host == "api.weather.gov"
    assert q.werke == ("studio",)
    assert q.bezuege[0].datei == "studio/works/2026-10-01-x/fetch.py"
    assert vermerke == ["error-as-method: nicht gefunden — Ausfall, nicht leer"]


def test_links_to_read_are_not_data_sources(tmp_path: Path):
    # Over 800 hosts stood in the practices' code on 2026-11-04; most were links to read.
    _schreibe(tmp_path, "studio/works/x/page.js", "\n".join([
        'const ABOUT = "https://www.newyorker.com/magazine/2020/01/01/x"',
        '// fetch("https://api.gbif.org/v1/occurrence") in a comment is no fetch',
        'const DOC = "https://docs.python.org/3/library/json.html"',
        'const LIB = "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.json"',
        'const BOT = "https://luftdaten.umweltbundesamt.de/robots.txt"',
    ]))
    quellen, _ = sammle_praxen(tmp_path, PRAXEN)
    assert quellen == []


def test_declared_sources_and_meta_data_sources_count(tmp_path: Path):
    _schreibe(tmp_path, "studio/works/a/sources.json",
              json.dumps({"fetched": [{"url": "https://www.spc.noaa.gov/wcm/data/torn.csv"}]}))
    _schreibe(tmp_path, "studio/works/b/meta.json", json.dumps({
        "title": "B", "medium": "see https://data.humdata.org/dataset/abc in prose",
        "data_sources": [{"url": "https://ssd-api.jpl.nasa.gov/cad.api"}],
    }))
    hosts = {q.host for q in sammle_praxen(tmp_path, PRAXEN)[0]}
    # meta.json counts only through its declared `data_sources`, not through prose.
    assert hosts == {"www.spc.noaa.gov", "ssd-api.jpl.nasa.gov"}


def test_one_entry_per_host_across_pipelines_and_practices(tmp_path: Path):
    _schreibe(tmp_path, "site/pipelines/protokoll/src/p/a.py", 'U = "https://api.gbif.org/v1/x"')
    _schreibe(tmp_path, "studio/works/x/fetch.py", 'U = "https://api.gbif.org/v1/occurrence"')
    eigene, _ = sammle(tmp_path / "site")
    (q,) = vereinige(eigene, sammle_praxen(tmp_path, PRAXEN)[0])
    assert q.werke == ("protokoll", "studio")
    assert _gebrauchsbeleg(q) == (
        "Retrieved by this ecology's own protokoll pipeline on every run. "
        "Fetched in the works of the Studio."
    )


def test_a_cited_doi_enters_only_when_datacite_types_it_a_dataset(tmp_path: Path, monkeypatch):
    _schreibe(tmp_path, "studio/works/x/README.md",
              "Data: https://doi.org/10.15468/abc and the paper 10.1038/s41586-1 and 10.5281/zenodo.9")

    def antwort(request: httpx.Request) -> httpx.Response:
        url = str(request.url)
        if "/ra/10.15468" in url or "/ra/10.5281" in url:
            return httpx.Response(200, json=[{"DOI": "x", "RA": "DataCite"}])
        if "/ra/" in url:
            return httpx.Response(200, json=[{"DOI": "x", "RA": "Crossref"}])
        if url.endswith("/dois/10.15468/abc"):
            return httpx.Response(200, json={"data": {"attributes": {
                "types": {"resourceTypeGeneral": "Dataset"}, "titles": [{"title": "Occurrences"}]}}})
        if url.endswith("/dois/10.5281/zenodo.9"):
            return httpx.Response(200, json={"data": {"attributes": {
                "types": {"resourceTypeGeneral": "Software"}, "titles": [{"title": "Code"}]}}})
        return httpx.Response(200)  # the access probe

    echt = httpx.Client
    gefragt: list[str] = []

    def client(*a, **k):
        def handler(r):
            gefragt.append(str(r.url))
            return antwort(r)
        k["transport"] = httpx.MockTransport(handler)
        return echt(*a, **k)

    monkeypatch.setattr(holdings.httpx, "Client", client)
    monkeypatch.setattr(holdings.time, "sleep", lambda s: None)
    monkeypatch.setattr("atlas_scout.praxen.PRAXEN", {"studio": "studio"})

    eintraege, vermerke = baue_doi_eintraege(tmp_path)
    (e,) = eintraege
    assert (e["id"], e["titel"], e["aufnahmegrund"]) == ("doi-10-15468-abc", "Occurrences", "zitiert")
    assert e["benutzt_von"] == ["studio"] and e["fundstellen"] == ["studio/works/x/README.md"]
    assert e["relevanz"] == "Cited as a dataset (DataCite: Dataset) by the Studio."
    # Crossref papers are never looked up in DataCite.
    assert not any("dois/10.1038" in u for u in gefragt)

    # A second run carries the title without asking DataCite again.
    gefragt.clear()
    wieder, _ = baue_doi_eintraege(tmp_path, eintraege)
    assert [w["titel"] for w in wieder] == ["Occurrences"]
    assert not any("/dois/10.15468" in u for u in gefragt)
