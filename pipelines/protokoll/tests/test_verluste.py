from datetime import date

import httpx

from protokoll import verluste
from protokoll.adapters.base import Context


def _ctx(today):
    return Context(client=httpx.Client(), today=today, env={})


RAW = {
    "Q1": {"qid": "Q1", "label_de": "Ereignis A", "label_en": "Event A", "date": "2026-06-24", "deaths": 41, "titles": {"en": "x"}},
    "Q2": {"qid": "Q2", "label_de": "Ereignis B", "label_en": "Event B", "date": "2026-06-20", "deaths": 67, "titles": {"en": "y"}},
    "Q3": {"qid": "Q3", "label_de": "Alt", "label_en": "Old", "date": "2026-06-01", "deaths": 99, "titles": {"en": "z"}},
}


def test_window_and_deterministic_order(monkeypatch):
    monkeypatch.setattr(verluste, "fetch_events", lambda client: RAW)
    e = verluste.build_verluste_entry(_ctx(date(2026, 6, 25)))
    assert e.top_id == "verluste" and e.status == "ok" and e.value is None
    # newest first; Q3 (06-01) is outside the 7-day window and excluded
    assert [(ev.date, ev.deaths) for ev in e.events] == [("2026-06-24", 41), ("2026-06-20", 67)]
    assert e.events[0].label_de == "Ereignis A" and e.events[0].label_en == "Event A"


def test_failure_is_unavailable(monkeypatch):
    def boom(client):
        raise RuntimeError("net down")

    monkeypatch.setattr(verluste, "fetch_events", boom)
    e = verluste.build_verluste_entry(_ctx(date(2026, 6, 25)))
    assert e.status == "unavailable" and e.events is None and "net down" in e.note
