"""Zensus-Block des Parallaxe-Registers: Ausfälle werden gezählt, nie still verschluckt."""
from protokoll.parallaxe import extract_llm
from protokoll.parallaxe import run as run_mod


def _fake_rank(_client, _titles):
    return [
        {"en_title": "Ok Island", "titles": {"en": "Ok Island"}, "lang_count": 6},
        {"en_title": "Fail Island", "titles": {"en": "Fail Island"}, "lang_count": 6},
        {"en_title": "Thin Island", "titles": {"en": "Thin Island"}, "lang_count": 6},
    ]


def _fake_intros(_client, titles):
    name = next(iter(titles.values()))
    if name == "Thin Island":
        return {"en": f"t {name}", "de": "y"}, []  # < MIN_LANGS (5)
    return {"en": f"t {name}", "de": "y", "fr": "z", "ru": "w", "ja": "v"}, []


def _fake_extract(intros, *, client):
    if "Fail Island" in intros["en"]:
        raise extract_llm.ExtractionError("Gemini erschöpft (Test)")
    return {"lemma": {"en": "Ok"}, "name_umstritten": False,
            "claims": [{"aussage": "A", "nach_sprache": {"en": "nennt", "de": "verschweigt"}}]}


def test_build_register_counts_failures(monkeypatch):
    monkeypatch.setattr(run_mod.register, "controversial_titles", lambda c: ["x"])
    monkeypatch.setattr(run_mod.register, "rank_topics", _fake_rank)
    monkeypatch.setattr(run_mod.register, "protection_status", lambda c, t: "none")
    monkeypatch.setattr(run_mod.extracts, "fetch_intros", _fake_intros)
    monkeypatch.setattr(run_mod.extract_llm, "extract_omissions", _fake_extract)
    monkeypatch.setattr(run_mod.analyze, "omission_index",
                        lambda claims, langs: {lang: 0.0 for lang in langs})
    monkeypatch.setattr(run_mod.analyze, "mean_omission", lambda oi: 0.0)

    reg = run_mod.build_register(None, "2026-07-02")

    assert reg["census"] == {"attempted": 3, "measured": 1,
                             "failed": {"llm": 1, "zu_wenige_sprachen": 1}}
    assert [t["en_title"] for t in reg["topics"]] == ["Ok Island"]
