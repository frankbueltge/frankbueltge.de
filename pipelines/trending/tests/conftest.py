from datetime import date

import httpx
import pytest

from trending.sources.base import Context

RULES = {"jaccard_min": 0.5, "links_cap": 6, "memory_days": 30, "novelty_days": 14,
         "novelty_max_presence": 7, "wikipedia_top": 50}


def make_client(handler):
    return httpx.Client(transport=httpx.MockTransport(handler))


@pytest.fixture
def ctx_factory():
    def _make(handler, *, today=date(2026, 9, 2), rules=None, archive=None, stoplist=()):
        return Context(client=make_client(handler), today=today, rules={**RULES, **(rules or {})},
                       archive=list(archive or []), stoplist=frozenset(stoplist))
    return _make


@pytest.fixture(autouse=True)
def _no_sleep(monkeypatch):
    import trending.fetch as fetch_mod
    import trending.sources.google_trends as gt
    import trending.sources.hackernews as hn
    monkeypatch.setattr(fetch_mod.time, "sleep", lambda s: None)
    monkeypatch.setattr(gt.time, "sleep", lambda s: None)
    monkeypatch.setattr(hn.time, "sleep", lambda s: None)
