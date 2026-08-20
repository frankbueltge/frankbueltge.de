from redaction.world.triviality import (
    REFRAMING,
    REPLACED,
    TRIVIAL,
    UPDATE,
    classify,
    normalize,
)


def test_identical_is_trivial():
    assert classify("Same headline", "Same headline").cls == TRIVIAL


def test_encoding_fix_is_trivial():
    v = classify("Macron&#39;s plan", "Macron's plan")
    assert v.cls == TRIVIAL and v.reason == "identical after normalization"


def test_whitespace_collapse_is_trivial():
    assert classify("Two  spaces  here", "Two spaces here").cls == TRIVIAL


def test_case_only_is_trivial():
    v = classify("Breaking news today", "Breaking News Today")
    assert v.cls == TRIVIAL and v.reason == "case only"


def test_appended_site_name_is_trivial():
    v = classify("Storm hits the coast", "Storm hits the coast - CNN")
    assert v.cls == TRIVIAL and v.reason == "site-name affix"


def test_removed_site_prefix_is_trivial():
    assert classify("BBC News | Storm hits the coast", "Storm hits the coast").cls == TRIVIAL


def test_long_affix_is_not_a_site_name():
    v = classify(
        "Storm hits the coast",
        "Storm hits the coast - and the government knew about the danger weeks before",
    )
    assert v.cls != TRIVIAL


def test_truncation_with_ellipsis_is_trivial():
    assert classify("A very long headline about a stor…", "A very long headline about a storm").cls == TRIVIAL


def test_punctuation_only_is_trivial():
    assert classify("Hello, world: a story", "Hello world — a story").cls == TRIVIAL


def test_casualty_count_revision_is_update():
    v = classify("5 dead after earthquake", "12 dead after earthquake")
    assert v.cls == UPDATE
    assert v.removed == ("5",) and v.added == ("12",)


def test_multiple_numbers_still_update():
    assert classify("3 dead, 40 hurt in blast", "7 dead, 55 hurt in blast").cls == UPDATE


def test_actor_swap_is_reframing():
    v = classify(
        "Protesters clash with police in capital",
        "Rioters clash with police in capital",
    )
    assert v.cls == REFRAMING
    assert "Protesters" in v.removed and "Rioters" in v.added


def test_framing_word_change_is_reframing():
    v = classify(
        "Government reforms pension system",
        "Government dismantles pension system",
    )
    assert v.cls == REFRAMING


def test_number_plus_word_change_is_reframing_not_update():
    v = classify("5 migrants arrive by boat", "12 people arrive by boat")
    assert v.cls == REFRAMING


def test_total_rewrite_is_replaced_not_reframing():
    v = classify(
        "Local council approves new bike lanes",
        "Ten recipes for a perfect summer salad",
    )
    assert v.cls == REPLACED and v.similarity < 0.2


def test_normalize_unescapes_and_collapses():
    assert normalize("A &amp; B  C") == "A & B C"


def test_verdict_carries_similarity():
    v = classify("One two three four five", "One two three four six")
    assert 0.5 < v.similarity < 1.0


def test_liveblog_retitle_is_update_not_reframing():
    v = classify(
        "WA news LIVE: Paediatrician faces 72 charges",
        "WA news updates from Thursday: Paediatrician faces 72 charges",
    )
    assert v.cls == UPDATE and v.reason == "rolling coverage marker"


def test_highlights_ticker_is_update():
    v = classify(
        "Q1 Results 12th Aug Live: HAL, Grasim, Tata Motors",
        "Q1 Results 12th Aug Highlights: Tata Motors, HAL, Eureka Forbes",
    )
    assert v.cls == UPDATE


def test_stray_markup_is_stripped_before_comparing():
    v = classify("KMC delimitation takes centre stage",
                 "KM<b></b>C delimitation takes centre stage")
    assert v.cls == TRIVIAL
