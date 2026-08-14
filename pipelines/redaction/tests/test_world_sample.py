import json

from redaction.world.sample import draw

# One fake GKG "zip" per slot; parse turns it into rows. The fetch layer
# itself (fetch_pool) has its own proof-of-concept history — here we prove
# the draw: dedupe, seeding, gap disclosure, manifest shape.


def _fake_parse(raw):
    return json.loads(raw)


def _slot_payload(stamp, n=5):
    return json.dumps([
        {"seen": f"{stamp[:8]}{6 + i:02d}0000", "domain": f"d{i}.test",
         "url": f"https://d{i}.test/{stamp}", "title": f"Title {i} of {stamp}"}
        for i in range(n)
    ])


def test_draw_manifest_shape_and_gap_disclosure():
    def fetch(stamp):
        if stamp.endswith("120000"):  # one absent slot
            return None
        return _slot_payload(stamp)

    m = draw("2026-08-13", size=10, step_minutes=360, fetch_slot=fetch,
             parse_gkg=_fake_parse)
    assert m["pool_day"] == "2026-08-13"
    assert m["slots_expected"] == 4 and m["slots_fetched"] == 3
    assert m["gaps"] == ["20260813120000"]
    assert m["sample_size"] == 10 and len(m["items"]) == 10
    assert all({"url", "domain", "title", "first_seen"} <= set(i) for i in m["items"])
    assert "GDELT" in m["source"]["notice"]


def test_draw_is_seeded_by_pool_day():
    fetch = lambda stamp: _slot_payload(stamp, n=20)  # noqa: E731
    a = draw("2026-08-13", size=5, step_minutes=720, fetch_slot=fetch, parse_gkg=_fake_parse)
    b = draw("2026-08-13", size=5, step_minutes=720, fetch_slot=fetch, parse_gkg=_fake_parse)
    c = draw("2026-08-12", size=5, step_minutes=720, fetch_slot=fetch, parse_gkg=_fake_parse)
    assert [i["url"] for i in a["items"]] == [i["url"] for i in b["items"]]
    assert [i["url"] for i in a["items"]] != [i["url"] for i in c["items"]]


def test_draw_dedupes_keeping_first_sighting():
    def fetch(stamp):
        return json.dumps([
            {"seen": f"{stamp[:8]}{int(stamp[8:10]):02d}0000", "domain": "x.test",
             "url": "https://x.test/same", "title": f"Seen at {stamp}"},
        ])

    m = draw("2026-08-13", size=5, step_minutes=720, fetch_slot=fetch, parse_gkg=_fake_parse)
    assert m["pool_size"] == 1
    assert m["items"][0]["first_seen"] == "20260813000000"


def test_draw_smaller_pool_than_sample_takes_all():
    fetch = lambda stamp: _slot_payload(stamp, n=2)  # noqa: E731
    m = draw("2026-08-13", size=300, step_minutes=720, fetch_slot=fetch, parse_gkg=_fake_parse)
    assert m["sample_size"] == m["pool_size"] == 4
