from beifang.classify import (classify, parse_easyprivacy, parse_tds,
                              registrable_domain)

EASYPRIVACY = """! Kommentar
||tracker.example^$third-party
||stats.example/collect
@@||ausnahme.example^
##.ad-banner
||sub.metrics.example^
"""

TDS = {"trackers": {
    "liveramp.com": {"owner": {"name": "LiveRamp, Inc.", "displayName": "LiveRamp"}},
    "adnxs.com": {"owner": {"displayName": "Xandr"}},
    "kaputt.example": {"owner": {}},
}}


def test_registrable_domain():
    assert registrable_domain("cdn.sub.example.co.uk") == "example.co.uk"
    assert registrable_domain("www.sciencedirect.com") == "sciencedirect.com"
    assert registrable_domain("127.0.0.1") == "127.0.0.1"
    assert registrable_domain("localhost") == "localhost"


def test_parse_easyprivacy_only_domain_rules():
    d = parse_easyprivacy(EASYPRIVACY)
    assert d == frozenset({"tracker.example", "stats.example", "sub.metrics.example"})


def test_parse_tds_maps_domain_to_display_name():
    m = parse_tds(TDS)
    assert m == {"liveramp.com": "LiveRamp", "adnxs.com": "Xandr"}


def test_classify_third_party_trackers_entities():
    c = classify("sciencedirect.com",
                 ["www.sciencedirect.com", "pixel.liveramp.com", "cdn.harmlos.example", "tracker.example"],
                 frozenset({"tracker.example"}), {"liveramp.com": "LiveRamp"})
    assert c.third_party_hosts == frozenset({"pixel.liveramp.com", "cdn.harmlos.example", "tracker.example"})
    assert c.tracker_hosts == frozenset({"pixel.liveramp.com", "tracker.example"})
    assert c.entities == frozenset({"LiveRamp"})
