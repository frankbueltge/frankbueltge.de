from trending.normalize import jaccard, slug, tokens


def test_diacritics_are_folded():
    assert tokens("Jedixson Páez") == ["jedixson", "paez"]


def test_camel_case_hashtags_split():
    assert tokens("TextureTuesday") == ["texture", "tuesday"]
    assert tokens("USPSMail") == ["usps", "mail"]


def test_underscores_hyphens_and_stopwords():
    assert tokens("Toxic_(2026_film)") == ["toxic", "2026", "film"]
    assert tokens("The Fed holds the rates") == ["fed", "holds", "rates"]
    assert tokens("Trump's tariffs") == ["trump", "tariffs"]


def test_one_char_tokens_and_empty():
    assert tokens("A") == []
    assert tokens("!!!") == []


def test_slug():
    assert slug("USPS mail ballot handling") == "usps-mail-ballot-handling"
    assert slug("Toxic (2026 film)") == "toxic-2026-film"
    assert slug("日本") == "topic"


def test_jaccard():
    assert jaccard({"a", "b"}, {"b", "c"}) == 1 / 3
    assert jaccard(set(), {"a"}) == 0.0
