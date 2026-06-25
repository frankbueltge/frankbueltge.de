from redaction.prose import is_prose, keep_prose


def test_real_sentence_is_prose():
    assert is_prose(
        "The governance regulation required Member States to submit their first "
        "national long-term strategies to the Commission by 1 January 2020."
    )


def test_navigation_menu_is_not_prose():
    # A real White House menu dump that leaked through extraction.
    menu = ("Trump First Lady Melania Trump Vice President JD Vance The Cabinet "
            "Media Photo Gallery Video Library Priorities Top Priorities Lead the "
            "World Grow the Economy Secure the Border Unleash American Energy")
    assert not is_prose(menu)


def test_link_list_dump_is_not_prose():
    dump = ("Key documents: - 04/2012 - Behavioural Climate Change Mitigation "
            "Options - Transport Domain Report - Housing Domain Report - Food "
            "Domain Report - Technical Report")
    assert not is_prose(dump)


def test_too_short_is_not_prose():
    assert not is_prose("Publications 20260506172816")


def test_overlong_single_run_is_not_prose():
    # A long menu/list collapses into one "sentence" with no internal breaks.
    # Even with many prepositions (high stopword ratio), its length gives it away.
    long_run = " ".join(["the office of the council on policy and budget for the year"] * 8)
    assert not is_prose(long_run)


def test_keep_prose_filters_mixed_list():
    passages = [
        "The agency is committed to reducing greenhouse gas emissions by 2030.",
        "Trump First Lady Vice President Media Gallery Priorities Border Energy",
        "Publications 20260506172816",
    ]
    kept = keep_prose(passages)
    assert len(kept) == 1 and "greenhouse gas" in kept[0]
