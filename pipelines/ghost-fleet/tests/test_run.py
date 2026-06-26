from datetime import date
from urllib.parse import parse_qs, urlparse

import httpx

from ghost_fleet.run import run


def raw(id, end, dur, mpa=False, nt=False):
    return {"id": id, "start": "2026-06-01T00:00:00Z", "end": end,
            "position": {"lat": 1, "lon": 2},
            "regions": {"mpa": ["x"] if mpa else [], "mpaNoTake": ["y"] if nt else [], "eez": [], "highSeas": []},
            "vessel": {"id": "v" + id, "name": "N" + id, "flag": "XX", "type": "fishing"},
            "gap": {"durationHours": dur, "offPosition": {"lat": 1, "lon": 2}, "onPosition": {"lat": 3, "lon": 4}}}


RAWS = [
    raw("keep1", "2026-06-24T00:00:00Z", 30, nt=True),   # in window, plausible, no-take → pick
    raw("keep2", "2026-06-23T00:00:00Z", 10, mpa=True),  # in window
    raw("old", "2026-06-10T00:00:00Z", 10),              # 15 days → out of window
    raw("artifact", "2026-06-24T00:00:00Z", 99999),      # implausible duration
]


def _client(raws):
    def handler(req):
        offset = int(parse_qs(urlparse(str(req.url)).query)["offset"][0])
        return httpx.Response(200, json={"total": 4242, "entries": raws if offset == 0 else []})

    return httpx.Client(transport=httpx.MockTransport(handler))


def test_run_filters_and_picks():
    rec = run(client=_client(RAWS), token="T", today=date(2026, 6, 25))
    ids = [e["id"] for e in rec["events"]]
    assert "keep1" in ids and "keep2" in ids
    assert "old" not in ids and "artifact" not in ids
    assert rec["pick"] == "keep1"          # no-take outranks mpa
    assert rec["index"]["total"] == 4242   # passed through from the API
    assert rec["window"]["examined"] == 2
