"""Resolution memory and throttling of the catalogue build (2026-11-04).

The run of that day sent 7,760 seeds to OpenAlex and arXiv and got HTTP 429 for most of
them, so entries a practice still cites dropped out on any night their turn came late.
These tests hold the two rules that end that: a seed the committed catalogue already
resolved never goes to the network, and a throttled source rests instead of being asked
thousands of times.
"""
from __future__ import annotations

from pathlib import Path

import httpx
import pytest

from atlas_scout import katalog
from atlas_scout.katalog import VERMERK_RUHT, _ist_datenablage, baue, gedaechtnis
from atlas_scout.praxen import PRAXEN, Fundstelle, Saat, Saatkorn


def _korn(kennung: str, art: str = "doi", datei: str = "journal/x.md", praxis: str = "field") -> Saatkorn:
    return Saatkorn(
        kennung=kennung,
        art=art,
        fundstellen=(Fundstelle(praxis, "field-research", datei, "2026-11-01"),),
    )


def _saat(*koerner: Saatkorn) -> Saat:
    return Saat(schema_version="1", gelesene_repos=("field-research",), koerner=koerner)


def _alt(kennung: str, **abweichung) -> dict:
    grund = dict(
        id="lovelace-notes", titel="Notes", urheber=["Ada Lovelace"], jahr=1843,
        ort="Taylor's Scientific Memoirs", kennung=kennung, url="https://example.invalid/n",
        frei_zugaenglich=True, felder=[3], zusammenfassung="", geprueft=True,
        pruef_status=200, pruef_vermerk=None, weitere_kennungen=[],
    )
    return {**grund, **abweichung}


@pytest.fixture
def netz(monkeypatch):
    """Replaces the network with a handler; records every request that reaches it."""
    anfragen: list[httpx.Request] = []
    state = {"handler": lambda r: httpx.Response(404)}

    def transport(request: httpx.Request) -> httpx.Response:
        anfragen.append(request)
        return state["handler"](request)

    echt = httpx.Client

    def client(*args, **kwargs):
        kwargs["transport"] = httpx.MockTransport(transport)
        return echt(*args, **kwargs)

    monkeypatch.setattr(katalog.httpx, "Client", client)
    monkeypatch.setattr(katalog.time, "sleep", lambda s: None)
    state["anfragen"] = anfragen
    return state


def test_a_seed_the_catalogue_already_holds_never_goes_to_the_network(netz, tmp_path: Path):
    alt = [_alt("10.1/notes")]
    eintraege, ausfaelle = baue(_saat(_korn("10.1/notes")), tmp_path, vorher=alt)
    assert netz["anfragen"] == []
    assert ausfaelle == []
    (e,) = eintraege
    assert (e.id, e.titel, e.kennung, e.geprueft) == ("lovelace-notes", "Notes", "10.1/notes", True)


def test_the_citation_is_still_read_fresh_from_the_practice(netz, tmp_path: Path):
    # Metadata comes from memory, the evidence of use never does.
    alt = [_alt("10.1/notes", fundstellen=["old/place.md"], zitiert_von=["atelier"])]
    korn = _korn("10.1/notes", datei="artifacts/new.md", praxis="studio")
    (e,), _ = baue(_saat(korn), tmp_path, vorher=alt)
    assert e.fundstellen == ("field-research/artifacts/new.md",)
    assert e.zitiert_von == ("studio",)
    assert e.zuletzt_gebraucht == "2026-11-01"


def test_a_publisher_path_finds_the_entry_its_short_form_resolved_to(netz, tmp_path: Path):
    alt = [_alt("10.1162/octo.a.545")]
    korn = _korn("10.1162/octo.a.545/137249/latent-spaces-ai-art-and-the-archive")
    (e,), _ = baue(_saat(korn), tmp_path, vorher=alt)
    assert netz["anfragen"] == []
    assert e.kennung == "10.1162/octo.a.545"


def test_arxiv_seeds_are_remembered_by_their_catalogue_identifier(tmp_path: Path):
    index = gedaechtnis([_alt("arXiv:2305.17493"), _alt("10.2/x", weitere_kennungen=["arXiv:2401.00001", "https://a.invalid/x"])])
    assert {"arxiv:2305.17493", "arxiv:2401.00001", "doi:10.2/x"} <= set(index)
    assert not any(k.startswith("http") for k in index)


def test_a_throttled_source_rests_after_a_run_of_429s(netz, tmp_path: Path):
    netz["handler"] = lambda r: httpx.Response(429, headers={"Retry-After": "1"})
    koerner = [_korn(f"10.9/{i}") for i in range(katalog.DROSSEL_SCHWELLE + 30)]
    eintraege, ausfaelle = baue(_saat(*koerner), tmp_path, vorher=[])
    assert eintraege == []
    # Every seed is accounted for: none disappears silently.
    assert len(ausfaelle) == len(koerner)
    vertagt = [a for a in ausfaelle if a.vermerk == VERMERK_RUHT]
    assert len(vertagt) == 30
    # Each throttled seed costs its retries, the resting ones cost nothing.
    assert len(netz["anfragen"]) == katalog.DROSSEL_SCHWELLE * (katalog.DROSSEL_WIEDERHOLUNGEN + 1)


def test_a_429_followed_by_an_answer_is_waited_out(netz, tmp_path: Path):
    antworten = iter([httpx.Response(429), httpx.Response(200, json={"results": []})])
    netz["handler"] = lambda r: next(antworten)
    _, ausfaelle = baue(_saat(_korn("10.9/einzeln")), tmp_path, vorher=[])
    assert [a.vermerk for a in ausfaelle] == ["in keiner Quelle gefunden"]


def test_data_stores_are_asked_after_the_practices_writing(netz, tmp_path: Path):
    gefragt: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        gefragt.append(request.url.params.get("filter", ""))
        return httpx.Response(200, json={"results": []})

    netz["handler"] = handler
    ablage = _korn("10.9/ablage", datei="artifacts/x/data/corpus.json")
    prosa = _korn("10.9/prosa", datei="artifacts/x/README.md")
    baue(_saat(ablage, prosa), tmp_path, vorher=[])
    assert gefragt == ["doi:10.9/prosa", "doi:10.9/ablage"]
    assert _ist_datenablage(ablage) and not _ist_datenablage(prosa)
    assert _ist_datenablage(_korn("10.9/a", datei="works/x/data.json"))
    assert _ist_datenablage(_korn("10.9/b", datei="trace/log.jsonl"))


def test_every_house_of_the_lab_is_read():
    # 2026-11-04: Machine Attention, the Middle and n-1 had cited 45 identifiers between
    # them, and none reached the catalogue because their repositories were never read.
    for repo in ("ulysses", "field-research", "studio", "meridian-runtime", "error-as-method",
                 "machine-attention", "research-ecology", "n-1", "arch", "state-before-interface"):
        assert repo in PRAXEN.values(), repo
