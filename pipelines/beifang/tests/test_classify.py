from beifang.classify import (classify, parse_easyprivacy, parse_tds,
                              registrable_domain)

EASYPRIVACY = """! Kommentar
||tracker.example^$third-party
||stats.example/collect
@@||ausnahme.example^
##.ad-banner
||sub.metrics.example^
"""

TDS = {
    "trackers": {
        "adnxs.com": {"owner": {"displayName": "Xandr"}},
        "kaputt.example": {"owner": {}},
    },
    "entities": {
        "LiveRamp": {"displayName": "LiveRamp"},
        "AdTech Corp": {},
    },
    "domains": {
        "liveramp.com": "LiveRamp",
        "rlcdn.com": "LiveRamp",
        "adtech.example": "AdTech Corp",
    },
}


def test_registrable_domain():
    assert registrable_domain("cdn.sub.example.co.uk") == "example.co.uk"
    assert registrable_domain("www.sciencedirect.com") == "sciencedirect.com"
    assert registrable_domain("127.0.0.1") == "127.0.0.1"
    assert registrable_domain("localhost") == "localhost"


def test_parse_easyprivacy_only_domain_rules():
    d = parse_easyprivacy(EASYPRIVACY)
    assert d == frozenset({"tracker.example", "stats.example", "sub.metrics.example"})


def test_parse_tds_tracker_domains_is_narrow():
    tds = parse_tds(TDS)
    assert tds.tracker_domains == frozenset({"adnxs.com", "kaputt.example"})


def test_parse_tds_entity_map_is_broad():
    tds = parse_tds(TDS)
    assert tds.entity_map == {
        "liveramp.com": "LiveRamp",
        "rlcdn.com": "LiveRamp",
        "adnxs.com": "Xandr",
        "adtech.example": "AdTech Corp",
    }


def test_classify_third_party_trackers_entities():
    tds = parse_tds(TDS)
    easyprivacy = frozenset({"tracker.example", "liveramp.com"})
    c = classify("sciencedirect.com",
                 ["www.sciencedirect.com", "pixel.liveramp.com", "cdn.harmlos.example", "tracker.example"],
                 easyprivacy, tds)
    assert c.third_party_hosts == frozenset({"pixel.liveramp.com", "cdn.harmlos.example", "tracker.example"})
    assert c.tracker_hosts == frozenset({"pixel.liveramp.com", "tracker.example"})
    assert c.entities == frozenset({"LiveRamp"})


def test_classify_tds_tracker_domains_without_easyprivacy_entry():
    tds = parse_tds(TDS)
    c = classify("sciencedirect.com",
                 ["ads.adnxs.com"],
                 frozenset(), tds)
    assert c.third_party_hosts == frozenset({"ads.adnxs.com"})
    assert c.tracker_hosts == frozenset({"ads.adnxs.com"})
    assert c.entities == frozenset({"Xandr"})
