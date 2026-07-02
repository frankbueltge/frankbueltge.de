from beifang.panel import load_panel


def test_panel_shape_and_counts():
    p = load_panel()
    ids = [e["id"] for e in p["entries"]]
    assert len(ids) == len(set(ids))
    verlage = [e for e in p["entries"] if e["group"] == "verlag"]
    kontrolle = [e for e in p["entries"] if e["group"] == "kontrolle"]
    assert len(verlage) == 50 and len(kontrolle) == 10
    assert {e["publisher"] for e in verlage} == {"elsevier", "springer-nature", "wiley", "taylor-francis", "sage"}
    assert any(e["publisher"] == "kommges" for e in kontrolle)
    for e in p["entries"]:
        assert e["url"].startswith("https://") and e["expected_domain"] and e["added"]
