from irrtum.methods import METHODS, pick_method, Method


def test_catalog_nonempty_and_named():
    assert len(METHODS) >= 3
    assert all(isinstance(m, Method) and m.name and m.lens for m in METHODS)


def test_pick_is_deterministic_by_date():
    a = pick_method("2026-06-28")
    b = pick_method("2026-06-28")
    assert a == b
    assert a in METHODS
