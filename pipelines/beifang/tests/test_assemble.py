import json
from dataclasses import asdict

from beifang.assemble import assemble_run, compute_befund, load_previous, site_result
from beifang.capture import RawCapture, RawCookie, RawRequest
from beifang.classify import Classification
from beifang.model import Blocked, ListMeta, SiteResult

ENTRY = {"id": "elsevier-01", "group": "verlag", "publisher": "elsevier",
         "url": "https://doi.org/10.x", "expected_domain": "sciencedirect.com"}


def raw(host_pairs):
    return RawCapture(final_url="https://www.sciencedirect.com/a", http_status=200,
                      page_title="Artikel",
                      requests=tuple(RawRequest(url=f"https://{h}/x", host=h,
                                                resource_type="script", bytes=b,
                                                post_data=None, referer=None)
                                     for h, b in host_pairs),
                      cookies=(RawCookie(name="s", domain="sciencedirect.com"),
                               RawCookie(name="t", domain="tracker.example")),
                      goto_error=None)


def sr(**over):
    defaults = dict(entry=ENTRY, retrieved_at="2026-07-06T02:00:00Z")
    defaults.update(over)
    return site_result(**defaults)


def test_site_result_ok_counts():
    r = sr(raw=raw([("www.sciencedirect.com", 100), ("tracker.example", 50), ("cdn.example", None)]),
           cls=Classification(frozenset({"tracker.example", "cdn.example"}),
                              frozenset({"tracker.example"}), frozenset({"TrackCo"})))
    assert r.final_domain == "sciencedirect.com"
    assert r.requests_total == 3
    assert r.third_party_hosts == 2 and r.third_party_requests == 2
    assert r.third_party_bytes == 50
    assert r.tracker_hosts == ("tracker.example",) and r.entities == ("TrackCo",)
    assert r.cookies_first_party == 1 and r.cookies_third_party == 1


def test_site_result_blocked_nulls_metrics():
    r = sr(raw=raw([("www.sciencedirect.com", 10)]),
           blocked=Blocked(type="http", marker="403"))
    assert r.blocked == Blocked(type="http", marker="403")
    assert r.tracker_hosts is None and r.requests_total is None and r.entities is None


def test_site_result_failed_navigation():
    r = sr(note="TimeoutError: …")
    assert r.final_url is None and r.http_status is None and r.tracker_hosts is None


def test_befund_baseline_then_new_entity():
    cur = [sr(raw=raw([("pixel.liveramp.com", 1)]),
              cls=Classification(frozenset({"pixel.liveramp.com"}),
                                 frozenset({"pixel.liveramp.com"}), frozenset({"LiveRamp"})))]
    assert compute_befund(cur, None).kind == "baseline"
    prev = {"vantages": {"us": {"results": [
        {"panel_id": "elsevier-01", "group": "verlag", "publisher": "elsevier",
         "blocked": None, "tracker_hosts": [], "entities": []}]}}}
    b = compute_befund(cur, prev)
    assert b.kind == "entity_neu" and b.params == {"entity": "LiveRamp", "pages": 1}


def test_befund_new_blockade_beats_entity():
    cur = [sr(raw=raw([]), blocked=Blocked(type="challenge", marker="captcha"))]
    prev = {"vantages": {"us": {"results": [
        {"panel_id": "elsevier-01", "group": "verlag", "publisher": "elsevier",
         "blocked": None, "tracker_hosts": [], "entities": []}]}}}
    b = compute_befund(cur, prev)
    assert b.kind == "blockade_neu" and b.params["publisher"] == "elsevier"


def test_load_previous_picks_latest_before(tmp_path):
    d = tmp_path / "src/content/beifang/2026"
    d.mkdir(parents=True)
    (d / "2026-06-29.json").write_text(json.dumps({"date": "2026-06-29"}))
    (d / "2026-07-06.json").write_text(json.dumps({"date": "2026-07-06"}))
    assert load_previous(tmp_path, before="2026-07-06")["date"] == "2026-06-29"
    assert load_previous(tmp_path, before="2026-06-29") is None


def test_assemble_automat_fills_automat_vantage():
    rec = assemble_run(date_iso="2026-07-06", panel_version="2026-07-02", runner="test",
                       vantage="github-actions", vantage_kind="automat", results=[sr(note="x")],
                       lists={"easyprivacy": ListMeta("u", "t", "h")}, previous=None)
    assert rec.vantages["automat"].status == "ok"
    assert rec.vantages["leser"].status == "ausstehend" and rec.vantages["leser"].results is None
    assert rec.runner == "test"
    assert rec.befund.kind == "baseline"


def test_assemble_leser_fills_leser_vantage():
    rec = assemble_run(date_iso="2026-07-06", panel_version="v", runner="lokal",
                       vantage="leser", vantage_kind="leser", results=[sr(note="x")],
                       lists={"easyprivacy": ListMeta("u", "t", "h")}, previous=None)
    assert rec.vantages["leser"].status == "ok"
    assert rec.vantages["automat"].status == "ausstehend"


def test_befund_entity_neu_baseline_nur_verlagsseiten():
    # Firma war bisher NUR auf einer Kontrollseite — auf Verlagsseiten ist sie neu.
    cur = [sr(raw=raw([("pixel.liveramp.com", 1)]),
              cls=Classification(frozenset({"pixel.liveramp.com"}),
                                 frozenset({"pixel.liveramp.com"}), frozenset({"LiveRamp"})))]
    prev = {"vantages": {"us": {"results": [
        {"panel_id": "elsevier-01", "group": "kontrolle", "publisher": "kommges",
         "blocked": None, "tracker_hosts": [], "entities": ["LiveRamp"]},
        {"panel_id": "elsevier-01", "group": "verlag", "publisher": "elsevier",
         "blocked": None, "tracker_hosts": [], "entities": []}]}}}
    b = compute_befund(cur, prev)
    assert b.kind == "entity_neu" and b.params["entity"] == "LiveRamp"


def test_befund_median_delta_und_unveraendert():
    def tracked(panel_id, publisher, hosts):
        entry = {"id": panel_id, "group": "verlag", "publisher": publisher,
                 "url": "https://doi.org/10.x", "expected_domain": "sciencedirect.com"}
        return site_result(entry, retrieved_at="t",
                           raw=raw([(h, 1) for h in hosts]),
                           cls=Classification(frozenset(hosts), frozenset(hosts), frozenset()))
    cur = [tracked("elsevier-01", "elsevier", ["a.example", "b.example"]),
           tracked("wiley-01", "wiley", ["a.example"])]
    prev = {"vantages": {"us": {"results": [
        {"panel_id": "elsevier-01", "group": "verlag", "publisher": "elsevier",
         "blocked": None, "tracker_hosts": [], "entities": []},
        {"panel_id": "wiley-01", "group": "verlag", "publisher": "wiley",
         "blocked": None, "tracker_hosts": ["a.example"], "entities": []}]}}}
    b = compute_befund(cur, prev)
    assert b.kind == "median_delta"
    assert b.params == {"publisher": "elsevier", "von": 0.0, "zu": 2.0}
    # unveraendert: Vorlauf identisch zum aktuellen Lauf
    prev_same = {"vantages": {"us": {"results": [asdict(r) for r in cur]}}}
    assert compute_befund(cur, prev_same).kind == "unveraendert"


def test_site_result_computes_leaks_on_ok_path():
    from beifang.capture import RawRequest
    from beifang.classify import parse_tds
    from beifang.assemble import site_result
    tds = parse_tds({"trackers": {}, "entities": {"LiveRamp": {"displayName": "LiveRamp"}},
                     "domains": {"liveramp.com": "LiveRamp"}})
    doi = "10.1/x"
    raw = RawCapture(final_url="https://www.sciencedirect.com/a", http_status=200,
                     page_title="A", goto_error=None,
                     requests=(RawRequest(url=f"https://pixel.liveramp.com/i?doi={doi}",
                                          host="pixel.liveramp.com", resource_type="image",
                                          bytes=1, post_data=None, referer=None),),
                     cookies=())
    r = site_result(ENTRY, retrieved_at="t", raw=raw,
                    cls=Classification(frozenset({"pixel.liveramp.com"}), frozenset(), frozenset({"LiveRamp"})),
                    identity={"doi": doi, "titel": None, "keywords": []}, tds=tds)
    assert r.doi_leak is True
    assert r.leak_firmen == ("LiveRamp",)
    assert r.leaks[0].token == "doi" and r.leaks[0].firma == "LiveRamp"


def test_blocked_result_nulls_leak_fields():
    r = sr(raw=raw([("www.sciencedirect.com", 10)]),
           blocked=Blocked(type="http", marker="403"))
    assert r.leaks is None and r.leak_firmen is None and r.doi_leak is None


def test_assemble_run_sets_vantage():
    rec = assemble_run(date_iso="2026-07-13", panel_version="v", runner="test",
                       vantage="vps", results=[sr(note="x")],
                       lists={"easyprivacy": ListMeta("u", "t", "h")}, previous=None)
    assert rec.vantage == "vps"


def test_site_result_null_leaks_when_no_identity():
    from beifang.capture import RawCapture, RawRequest
    from beifang.classify import parse_tds
    from beifang.assemble import site_result
    tds = parse_tds({"trackers": {}, "entities": {}, "domains": {}})
    raw = RawCapture(final_url="https://www.sciencedirect.com/a", http_status=200, page_title="A",
                     goto_error=None,
                     requests=(RawRequest(url="https://x.example/?doi=10.1/x", host="x.example",
                                          resource_type="script", bytes=1, post_data=None, referer=None),),
                     cookies=())
    r = site_result(ENTRY, retrieved_at="t", raw=raw,
                    cls=Classification(frozenset({"x.example"}), frozenset(), frozenset()),
                    identity=None, tds=tds)
    assert r.leaks is None and r.leak_firmen is None and r.doi_leak is None
