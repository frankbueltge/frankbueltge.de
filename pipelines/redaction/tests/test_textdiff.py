from redaction.textdiff import removed


def test_no_change_no_removal():
    t = "Alpha sentence. Beta sentence."
    r = removed(t, t)
    assert r.passages == [] and r.tokens == 0


def test_removed_sentence_is_captured():
    before = "We keep this. We will phase out coal by 2030. We keep this too."
    after = "We keep this. We keep this too."
    r = removed(before, after)
    assert any("phase out coal" in p for p in r.passages)
    assert r.tokens > 0


def test_addition_is_not_a_removal():
    before = "One sentence only."
    after = "One sentence only. A new added line."
    r = removed(before, after)
    assert r.passages == [] and r.tokens == 0


def test_deterministic():
    before = "A. B. C. D."
    after = "A. D."
    assert removed(before, after).passages == removed(before, after).passages
