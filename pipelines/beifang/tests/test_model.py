import json

from beifang.model import (Befund, Blocked, ListMeta, RunRecord, SiteResult,
                           Vantage, run_record_to_json)


def make_result(**over):
    base = dict(panel_id="elsevier-01", url="https://doi.org/10.x", final_url="https://www.sciencedirect.com/a",
                final_domain="sciencedirect.com", group="verlag", publisher="elsevier",
                http_status=200, blocked=None, note=None, requests_total=10,
                third_party_hosts=4, third_party_requests=6, third_party_bytes=1234,
                tracker_hosts=("a.com",), entities=("Google",),
                cookies_first_party=1, cookies_third_party=2, retrieved_at="2026-07-06T02:00:00Z",
                leaks=None, leak_firmen=None, doi_leak=None)
    base.update(over)
    return SiteResult(**base)


def make_record(results=()):
    return RunRecord(date="2026-07-06", generated_at="2026-07-06T02:10:00Z",
                     schema_version="1", pipeline_version="0.1.0", panel_version="2026-07-02",
                     runner="test", vantage="github-actions",
                     lists={"easyprivacy": ListMeta(source_url="u", retrieved_at="t", sha256="h")},
                     vantages={"us": Vantage(status="ok", note=None, results=tuple(results)),
                               "eu": Vantage(status="ausstehend", note="EU-Messpunkt nicht aufgebaut", results=None)},
                     befund=Befund(kind="baseline", params={}))


def test_json_roundtrip_sorted_and_complete():
    payload = run_record_to_json(make_record([make_result()]))
    data = json.loads(payload)
    assert payload.endswith("\n")
    assert list(data.keys()) == sorted(data.keys())
    assert data["vantages"]["eu"]["results"] is None
    r = data["vantages"]["us"]["results"][0]
    assert r["tracker_hosts"] == ["a.com"] and r["blocked"] is None


def test_blocked_result_carries_nulls():
    r = make_result(blocked=Blocked(type="challenge", marker="just a moment"),
                    requests_total=None, third_party_hosts=None, third_party_requests=None,
                    third_party_bytes=None, tracker_hosts=None, entities=None,
                    cookies_first_party=None, cookies_third_party=None)
    data = json.loads(run_record_to_json(make_record([r])))
    out = data["vantages"]["us"]["results"][0]
    assert out["blocked"] == {"type": "challenge", "marker": "just a moment"}
    assert out["tracker_hosts"] is None and out["requests_total"] is None


def test_leak_fields_roundtrip():
    from beifang.model import Leak
    leak = Leak(token="doi", signal="hard", form="klartext", kanal="query",
                host="pixel.liveramp.com", firma="LiveRamp",
                beweis="https://pixel.liveramp.com/?doi=10.1/x")
    r = make_result(leaks=(leak,), leak_firmen=("LiveRamp",), doi_leak=True)
    data = json.loads(run_record_to_json(make_record([r])))
    out = data["vantages"]["us"]["results"][0]
    assert out["doi_leak"] is True
    assert out["leaks"][0] == {"token": "doi", "signal": "hard", "form": "klartext",
                               "kanal": "query", "host": "pixel.liveramp.com",
                               "firma": "LiveRamp", "beweis": "https://pixel.liveramp.com/?doi=10.1/x"}
    assert data["vantage"] == "github-actions"
