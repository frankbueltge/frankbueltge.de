"""The method of The Invoked Past, locked.

The cleaning rules and the standout measure ARE the instrument — the page's claim is that
they are disclosed and stable, so a silent change to either is a change to the published
finding. These tests are what makes that claim checkable.
"""
from collections import Counter


class TestParseDates:
    def test_reads_the_four_resolutions_as_measured_against_live_data(self, refresh):
        # 1 = year only, 2 = month+year, 3 = full date, 4 = month/day without year.
        # GDELT's codebook numbers these differently; the mapping below is what the
        # stream actually emits, verified on 2026-08-15.
        parsed = refresh.parse_dates("1#0#0#2001#856;2#4#0#1829#12;3#10#22#1947#681;4#8#15#0#10")
        assert parsed == [("1", 0, 0, 2001), ("2", 4, 0, 1829), ("3", 10, 22, 1947), ("4", 8, 15, 0)]

    def test_drops_malformed_and_unknown_blocks_instead_of_guessing(self, refresh):
        assert refresh.parse_dates("9#1#1#2000#1") == []      # unknown resolution
        assert refresh.parse_dates("1#0#0#2001") == []        # too few fields
        assert refresh.parse_dates("1#x#0#2001#5") == []      # non-numeric
        assert refresh.parse_dates("") == []

    def test_year_bearing_resolutions_are_exactly_one_two_three(self, refresh):
        assert refresh.YEAR_BEARING == {"1", "2", "3"}
        assert refresh.RESOLUTION["4"] == "month_day_no_year"


class TestStandout:
    """The finding must not be the maximum, and must not be the thinnest neighbourhood."""

    def _names(self):
        return {"IN": "India", "AS": "Australia"}

    def test_prefers_the_surprising_year_over_the_thin_neighbourhood(self, refresh):
        # Regression on this instrument's first day (2026-08-15): a plain ratio crowned 1810
        # (73 mentions against a neighbourhood median of 6.5, 65 of them from one country)
        # over 1947 (917 against 115) on the anniversary of Indian independence.
        years = Counter()
        for y in range(1805, 1816):
            years[y] = 6
        years[1810] = 73
        for y in range(1942, 1953):
            years[y] = 115
        years[1947] = 917
        by_country = {1810: Counter({"AS": 65}), 1947: Counter({"IN": 515})}
        out = refresh.standout(years, by_country, self._names(), lambda n: n)
        assert out["year"] == 1947
        assert out["times_its_neighbourhood"] > 1  # the ratio is still published
        assert out["surprise"] > 0

    def test_a_year_that_does_not_double_its_neighbourhood_cannot_win(self, refresh):
        years = Counter({y: 500 for y in range(1990, 2001)})
        years[1995] = 600  # large, but only 1.2x its neighbours
        assert refresh.standout(years, {}, {}, lambda n: n) is None

    def test_a_year_below_the_floor_cannot_win(self, refresh):
        years = Counter({y: 1 for y in range(1990, 2001)})
        years[1995] = refresh.STANDOUT_FLOOR - 1
        assert refresh.standout(years, {}, {}, lambda n: n) is None

    def test_publishes_the_single_country_share_so_artefacts_stay_visible(self, refresh):
        years = Counter({y: 3 for y in range(1805, 1816)})
        years[1810] = 80
        out = refresh.standout(years, {1810: Counter({"AS": 72, "IN": 8})}, self._names(), lambda n: n)
        assert out["year"] == 1810
        assert out["top_country_share"] == 0.9

    def test_is_deterministic_and_breaks_ties_to_the_earlier_year(self, refresh):
        years = Counter({y: 5 for y in range(1900, 1961)})
        years[1910] = 100
        years[1950] = 100
        first = refresh.standout(years, {}, {}, lambda n: n)
        assert first["year"] == 1910
        assert first == refresh.standout(years, {}, {}, lambda n: n)


class TestRegisterAndLawTest:
    def test_register_is_not_founded_before_the_archive_is_deep_enough(self, refresh, tmp_path, monkeypatch):
        monkeypatch.setattr(refresh, "OUT_DIR", tmp_path)
        assert refresh.maybe_found_register("2026-08-15") is None

    def test_law_test_stays_pending_and_names_what_it_still_lacks(self, refresh, tmp_path, monkeypatch):
        monkeypatch.setattr(refresh, "OUT_DIR", tmp_path)
        block = refresh.law_test_block(None, "2026-08-15")
        assert block["status"] == "pending"
        assert block["register_days_needed"] == refresh.REGISTER_MIN_DAYS
        assert "Candia" in block["hypothesis"]

    def test_a_founded_register_excludes_its_own_founding_window(self, refresh):
        register = {"founded": "2026-09-14", "events": [], "selection_effect": "x"}
        block = refresh.law_test_block(register, "2026-09-14")
        assert block["status"] == "pending"
        assert block["valid_days_so_far"] == 0  # founding day is not an observation


class TestDisclosure:
    def test_the_stoplist_is_empty_on_purpose_and_says_why(self, refresh):
        assert refresh.STOPLIST_YEARS == set()
        assert "review" in refresh.STOPLIST_REASON

    def test_every_cleaning_rule_is_named_in_the_method_block(self, refresh):
        rules = refresh.method_block()["rules"]
        assert set(rules) == {"a_year_window", "b_self_reference", "c_per_article_dedup", "d_stoplist"}

    def test_the_inherited_ceiling_is_declared_not_hidden(self, refresh):
        assert "2015" in refresh.method_block()["inherited_ceiling"]
