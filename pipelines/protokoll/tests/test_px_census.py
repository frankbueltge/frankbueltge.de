"""Upsert- und Rotations-Logik des Ein-Thema-pro-Tag-Registers (Einheiten, ohne Netz)."""
from protokoll.parallaxe.run import pick_topic_for_date, upsert


def _topic(title: str, mo: float) -> dict:
    return {"en_title": title, "lang_count": 6, "protection": "none", "langs": ["en"],
            "lemma": {"en": title}, "name_umstritten": False, "claims": [],
            "omission_by_lang": {"en": mo}, "mean_omission": mo}


def test_upsert_inserts_sets_date_census_and_mean():
    out = upsert({"topics": []}, _topic("Alpha", 0.4), "2026-07-06", {"Alpha", "Bravo"})
    assert out["census"] == {"attempted": 1, "measured": 1, "failed": {}}
    assert out["topics"][0]["measured"] == "2026-07-06"
    assert out["mean_omission_index"] == 0.4


def test_upsert_replaces_same_topic_without_duplicate():
    reg = {"topics": [{**_topic("Alpha", 0.4), "measured": "2026-07-01"}]}
    out = upsert(reg, _topic("Alpha", 0.6), "2026-07-06", {"Alpha"})
    assert len(out["topics"]) == 1
    assert out["topics"][0]["measured"] == "2026-07-06"
    assert out["topics"][0]["mean_omission"] == 0.6


def test_upsert_drops_topics_no_longer_ranked():
    reg = {"topics": [{**_topic("Gone", 0.9), "measured": "2026-06-01"}]}
    out = upsert(reg, _topic("Alpha", 0.4), "2026-07-06", {"Alpha", "Bravo"})
    assert {t["en_title"] for t in out["topics"]} == {"Alpha"}   # "Gone" fällt raus


def test_upsert_sorts_topics_stably():
    reg = {"topics": [{**_topic("Charlie", 0.3), "measured": "x"},
                      {**_topic("Alpha", 0.5), "measured": "x"}]}
    out = upsert(reg, _topic("Bravo", 0.4), "2026-07-06", {"Alpha", "Bravo", "Charlie"})
    assert [t["en_title"] for t in out["topics"]] == ["Alpha", "Bravo", "Charlie"]


def test_rotation_is_deterministic_and_cycles():
    ranked = [{"en_title": "A"}, {"en_title": "B"}, {"en_title": "C"}]
    picks = [pick_topic_for_date(ranked, d)["en_title"]
             for d in ["2026-07-06", "2026-07-07", "2026-07-08", "2026-07-09"]]
    assert len(set(picks[:3])) == 3     # drei Tage → drei verschiedene Themen
    assert picks[3] == picks[0]         # nach len(ranked) Tagen zurück auf Anfang
