"""The method of The Invoked Past, locked.

The cleaning rules and the standout measure ARE the instrument — the page's claim is that
they are disclosed and stable, so a silent change to either is a change to the published
finding. These tests are what makes that claim checkable.
"""
import json
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
    """The register is founded from the archive and counted every night; the decay test that
    was meant to run on it is NOT BUILT (2026-10-17), and the record says so instead of
    promising a date."""

    REGISTER = {
        "founded": "2026-09-14",
        "selection_effect": "x",
        "events": [{"date": "2001-09-11", "founding_mentions": 6711},
                   {"date": "1881-02-02", "founding_mentions": 357}],
    }

    def test_register_is_not_founded_before_the_archive_is_deep_enough(self, refresh, tmp_path, monkeypatch):
        monkeypatch.setattr(refresh, "OUT_DIR", tmp_path)
        assert refresh.maybe_found_register("2026-08-15") is None

    @staticmethod
    def _archive(refresh, tmp_path, n_days):
        """n committed day files, each carrying the exact dates founding is computed from."""
        from datetime import date, timedelta
        for i in range(n_days):
            day = (date(2026, 8, 15) + timedelta(days=i)).isoformat()
            (tmp_path / f"{day}.json").write_text(json.dumps(
                {"date": day, "exact_dates_top": [{"date": "1947-08-15", "mentions": 3}]}),
                encoding="utf-8")

    def test_the_register_founds_on_the_run_after_the_archive_is_deep_enough(
            self, refresh, tmp_path, monkeypatch):
        monkeypatch.setattr(refresh, "OUT_DIR", tmp_path)
        self._archive(refresh, tmp_path, refresh.REGISTER_MIN_DAYS - 1)
        assert refresh.maybe_found_register("2026-09-13") is None
        self._archive(refresh, tmp_path, refresh.REGISTER_MIN_DAYS)
        register = refresh.maybe_found_register("2026-09-14")
        assert register is not None
        assert register["founded"] == "2026-09-14"
        assert register["founding_window"] == ["2026-08-15", "2026-09-13"]

    def test_the_law_test_is_not_built_and_never_promises_a_date(self, refresh):
        for register in (None, self.REGISTER):
            block = refresh.law_test_block(register, "2026-10-17")
            assert block["status"] == "not_built"
            assert block["since"] == refresh.LAW_NOT_BUILT_SINCE == "2026-10-17"
            assert "Candia" in block["hypothesis"]
            # the withdrawn promise must not come back under any name
            for stale in ("first_possible", "valid_days_so_far", "register_days_needed", "register_days_have"):
                assert stale not in block
            assert "pending" not in block["reason"]

    def test_the_reason_carries_the_day_s_arithmetic(self, refresh):
        block = refresh.law_test_block(self.REGISTER, "2026-10-17")
        # ages by the pipeline's own rule (record year minus event year), span in calendar days
        assert "2 tracked events are 25 to 145 years old" in block["reason"]
        assert "the 33 days since the register was founded" in block["reason"]
        assert "by 0.09 of a year" in block["reason"]
        # and the rejected alternative, with its two reasons
        assert "one day's age profile" in block["reason"]
        assert "2015" in block["reason"]

    def test_on_its_founding_day_the_register_has_moved_nobody(self, refresh):
        block = refresh.law_test_block(self.REGISTER, "2026-09-14")
        assert "the 0 days since the register was founded" in block["reason"]
        assert "by 0.00 of a year" in block["reason"]
        assert "the 1 day since" in refresh.law_test_block(self.REGISTER, "2026-09-15")["reason"]

    def _run_main(self, refresh, tmp_path, monkeypatch, slots_fetched):
        from collections import Counter, defaultdict
        monkeypatch.setattr(refresh, "OUT_DIR", tmp_path)
        monkeypatch.setattr(refresh, "load_lookup", lambda: ({}, {}))
        # shaped like harvest()'s own aggregates (defaultdicts included)
        agg = {"years": Counter({1947: 40, 1950: 5}), "year_by_country": defaultdict(Counter),
               "exact_dates": Counter(), "resolutions": Counter(), "evidence": {},
               "themes_overall": Counter(), "articles_with_themes": 0}
        stats = {"mentions_raw": 45, "articles_scanned": 100 if slots_fetched else 0,
                 "articles_with_dates": 10, "articles_with_dates_share": 0.1,
                 "articles_country_mapped": 0, "mentions_kept": 45, "mentions_removed": {},
                 "resolutions": {}, "max_year_observed": 1950, "slots_expected": 96,
                 "slots_fetched": slots_fetched, "slots_missing": [], "window": "w"}
        monkeypatch.setattr(refresh, "harvest", lambda lookup: (agg, stats))
        assert refresh.main() == 0
        return json.loads((tmp_path / "latest.json").read_text(encoding="utf-8"))

    def test_a_failed_fetch_writes_the_same_state_not_the_old_promise(self, refresh, tmp_path, monkeypatch):
        record = self._run_main(refresh, tmp_path, monkeypatch, slots_fetched=0)
        assert record["note"]
        assert record["law_test"]["status"] == "not_built"
        assert "first_possible" not in record["law_test"]

    def test_a_measured_day_writes_not_built_as_well(self, refresh, tmp_path, monkeypatch):
        record = self._run_main(refresh, tmp_path, monkeypatch, slots_fetched=96)
        assert "note" not in record
        assert record["law_test"]["status"] == "not_built"


class TestDisclosure:
    def test_the_stoplist_is_empty_on_purpose_and_says_why(self, refresh):
        assert refresh.STOPLIST_YEARS == set()
        assert "review" in refresh.STOPLIST_REASON

    def test_every_cleaning_rule_is_named_in_the_method_block(self, refresh):
        rules = refresh.method_block()["rules"]
        assert set(rules) == {"a_year_window", "b_self_reference", "c_per_article_dedup", "d_stoplist"}

    def test_the_inherited_ceiling_is_declared_not_hidden(self, refresh):
        assert "2015" in refresh.method_block()["inherited_ceiling"]


class TestWhy:
    """v1.1: the standout is explained from the same rows it was counted in — and the
    explanation stops short of naming the event."""

    def _agg(self, refresh):
        from collections import Counter
        return {
            "exact_dates": Counter({(1947, 8, 15): 191, (1947, 8, 14): 65, (1901, 1, 1): 9}),
            "evidence": {1947: {"articles": 710,
                                "themes": Counter({"SOVEREIGNTY": 87, "TAX_FNCACT": 639}),
                                "persons": Counter({"a person": 229}),
                                "orgs": Counter({"an org": 49}),
                                "headlines": [
                                    {"domain": "b.example", "title": "passing mention", "url": "u2", "exact": False},
                                    {"domain": "a.example", "title": "named the full date", "url": "u1", "exact": True},
                                ]}},
            "themes_overall": Counter({"SOVEREIGNTY": 300, "TAX_FNCACT": 28000}),
            "articles_with_themes": 31201,
        }

    def test_the_anniversary_is_arithmetic_on_the_record_s_own_date(self, refresh):
        why = refresh.why_block(1947, self._agg(refresh), "2026-08-15")
        assert why["anniversary"]["date"] == "1947-08-15"
        assert why["anniversary"]["matches_today"] is True

    def test_a_year_whose_top_date_is_not_today_is_not_an_anniversary(self, refresh):
        why = refresh.why_block(1947, self._agg(refresh), "2026-09-02")
        assert why["anniversary"]["matches_today"] is False

    def test_only_dates_inside_the_year_are_carried(self, refresh):
        why = refresh.why_block(1947, self._agg(refresh), "2026-08-15")
        assert all(d["date"].startswith("1947-") for d in why["top_exact_dates"])

    def test_articles_naming_a_full_date_lead_the_headlines(self, refresh):
        why = refresh.why_block(1947, self._agg(refresh), "2026-08-15")
        assert why["headlines"][0]["domain"] == "a.example"
        assert "exact" not in why["headlines"][0]  # an internal flag, not published

    def test_a_year_without_evidence_still_returns_a_whole_block(self, refresh):
        why = refresh.why_block(1800, self._agg(refresh), "2026-08-15")
        assert why["articles"] == 0 and why["themes"] == [] and why["headlines"] == []


class TestThemesByLift:
    def test_drops_the_ubiquitous_theme_and_keeps_the_distinctive_one(self, refresh):
        from collections import Counter
        # TAX_FNCACT sits on ~90% of the day's articles AND on ~90% of this year's: it is
        # the commonest code by far and carries no information, so it does not merely rank
        # lower, it does not appear. SOVEREIGNTY is twelve times as common here as at large.
        out = refresh.themes_by_lift(Counter({"SOVEREIGNTY": 87, "TAX_FNCACT": 639}),
                                     Counter({"SOVEREIGNTY": 300, "TAX_FNCACT": 28000}),
                                     710, 31201)
        assert [t["code"] for t in out] == ["SOVEREIGNTY"]
        assert out[0]["lift"] > 10

    def test_rarity_alone_cannot_win(self, refresh):
        from collections import Counter
        # The 2026-08-15 regression: an unfiltered lift ranking returned snow leopards and
        # warts, each sitting on ~23 syndicated articles out of 710.
        out = refresh.themes_by_lift(Counter({"TAX_WORLDMAMMALS_SNOW_LEOPARD": 23}),
                                     Counter({"TAX_WORLDMAMMALS_SNOW_LEOPARD": 23}), 710, 31201)
        assert out == []

    def test_a_theme_no_more_common_here_than_anywhere_is_dropped(self, refresh):
        from collections import Counter
        out = refresh.themes_by_lift(Counter({"EVERYWHERE": 200}), Counter({"EVERYWHERE": 8800}),
                                     710, 31201)
        assert out == []
