from ghost_fleet.build import normalize

RAW = {
    "id": "abc", "type": "gap",
    "start": "2026-06-10T00:00:00.000Z", "end": "2026-06-12T06:00:00.000Z",
    "position": {"lat": 14.2, "lon": 145.0},
    "regions": {"mpa": ["x"], "mpaNoTake": ["y"], "eez": ["8314"], "highSeas": [], "rfmo": ["WCPFC"]},
    "vessel": {"id": "v1", "name": "DONGWON NO.16", "ssvid": "440825000", "flag": "KOR", "type": "fishing"},
    "gap": {"durationHours": 54.0, "distanceKm": 120, "intentionalDisabling": True,
            "offPosition": {"lat": 14.2, "lon": 145.0}, "onPosition": {"lat": 15.1, "lon": 146.2}},
}


def test_normalize_full():
    e = normalize(RAW)
    assert e["id"] == "abc"
    assert e["vessel"] == {"name": "DONGWON NO.16", "flag": "KOR", "type": "fishing"}
    assert e["duration_hours"] == 54.0
    assert e["regions"]["no_take"] is True and e["regions"]["mpa"] is True
    assert e["regions"]["eez"] == ["8314"] and e["regions"]["high_seas"] is False
    assert e["on"] == {"lat": 15.1, "lon": 146.2}
    assert e["gfw_url"] == "https://globalfishingwatch.org/vessel/v1"


def test_normalize_missing_vessel_returns_none():
    assert normalize({**RAW, "vessel": {}}) is None


def test_normalize_missing_duration_returns_none():
    assert normalize({**RAW, "gap": {"offPosition": {}, "onPosition": {}}}) is None


def test_normalize_strips_gfw_match_score_from_name():
    e = normalize({**RAW, "vessel": {**RAW["vessel"], "name": "BOYA 9 AMELIA 100%"}})
    assert e["vessel"]["name"] == "BOYA 9 AMELIA"


def test_normalize_coerces_string_coords():
    e = normalize({**RAW, "gap": {**RAW["gap"], "onPosition": {"lat": "-8.8", "lon": "-176.3"}}})
    assert e["on"]["lat"] == -8.8 and isinstance(e["on"]["lat"], float)
