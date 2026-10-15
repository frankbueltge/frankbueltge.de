"""The trending page: parsed from the page's own markup, one platform with `github` for the
crossing, and honest about a page that changed shape."""
from datetime import date

import httpx
import pytest

import trending.run as run_mod
from trending.converge import cluster
from trending.fetch import SourceUnavailable
from trending.model import Signal
from trending.sources import SOURCES, PLATFORM_OF, github, github_trending, platform_of

RULES = {"jaccard_min": 0.5, "links_cap": 6}
TODAY = date(2026, 9, 4)

# Two rows in the page's own shape (2026-09-04), reduced to the attributes the parser anchors
# on. The first has every field; the second has no language, no description and a single star
# today, spelled the way the page spells one.
PAGE = """
<html><body><div>
<article class="Box-row">
  <h2 class="h3 lh-condensed">
    <a href="/mattpocock/skills" data-view-component="true" class="Link"><svg aria-hidden="true"></svg>
      <span data-view-component="true" class="text-normal">mattpocock /</span>
      skills</a>
  </h2>
  <p class="col-9 color-fg-muted my-1 tmp-pr-4">
    Skills for Real Engineers. Straight from my .agents directory &amp; more.
  </p>
  <div class="f6 color-fg-muted mt-2">
    <span class="tmp-mr-3 d-inline-block ml-0"><span class="repo-language-color"></span>
      <span itemprop="programmingLanguage">Shell</span></span>
    <a href="/mattpocock/skills/stargazers" class="Link Link--muted d-inline-block"><svg></svg>
        250,265</a>
    <a href="/mattpocock/skills/forks" class="Link Link--muted d-inline-block"><svg></svg>
        21,150</a>
    <span data-view-component="true" class="d-inline-block float-sm-right"><svg></svg>
        2,757 stars today
    </span>
  </div>
</article>
<article class="Box-row">
  <h2 class="h3 lh-condensed"><a href="/solo/thing" class="Link">solo / thing</a></h2>
  <div class="f6 color-fg-muted mt-2">
    <a href="/solo/thing/stargazers" class="Link"><svg></svg> 12</a>
    <span class="d-inline-block float-sm-right"><svg></svg> 1 star today</span>
  </div>
</article>
<article class="Box-row"><h2>no link here</h2></article>
</div></body></html>
"""


def _text(body, status=200):
    return lambda req: httpx.Response(status, text=body)


def test_parse_reads_the_rows_from_the_pages_own_markup():
    rows = github_trending.parse(PAGE)
    assert [r["full_name"] for r in rows] == ["mattpocock/skills", "solo/thing"]
    first = rows[0]
    assert first["description"] == "Skills for Real Engineers. Straight from my .agents directory & more."
    assert first["language"] == "Shell"
    assert (first["stars"], first["forks"], first["stars_today"]) == (250265, 21150, 2757)
    second = rows[1]
    assert second["description"] is None and second["language"] is None
    assert (second["stars"], second["forks"], second["stars_today"]) == (12, None, 1)


def test_fetch_source_turns_rows_into_signals(ctx_factory):
    res = github_trending.fetch_source(ctx_factory(_text(PAGE), today=TODAY))
    assert res.as_of == "2026-09-04"
    assert [s.label for s in res.signals] == ["mattpocock/skills", "solo/thing"]
    assert [s.rank for s in res.signals] == [1, 2]
    first = res.signals[0]
    assert first.source == "github_trending"
    assert first.url == "https://github.com/mattpocock/skills"
    assert first.magnitude == 2757 and first.magnitude_unit == "stars_today"
    assert first.meta == {"language": "Shell",
                          "description": "Skills for Real Engineers. Straight from my .agents directory & more.",
                          "stars": 250265, "forks": 21150}
    assert res.signals[1].magnitude == 1 and res.signals[1].meta["language"] is None


def test_the_description_is_capped_at_two_hundred_characters(ctx_factory):
    page = PAGE.replace("Skills for Real Engineers. Straight from my .agents directory &amp; more.", "d" * 300)
    res = github_trending.fetch_source(ctx_factory(_text(page)))
    assert len(res.signals[0].meta["description"]) == 200


def test_a_page_without_rows_is_unavailable_not_an_empty_ok(ctx_factory):
    with pytest.raises(SourceUnavailable, match="page shape changed"):
        github_trending.fetch_source(ctx_factory(_text("<html><body>Trending</body></html>")))
    rec = run_mod.build_day(ctx_factory(_text("<html></html>")), (github_trending.SPEC,),
                            log=lambda *a: None)
    assert rec.sources[0].status == "unavailable" and "page shape changed" in rec.sources[0].note


def test_the_spec_is_optional_sits_beside_github_and_names_its_platform():
    ids = [s.id for s in SOURCES]
    assert ids.index("github_trending") == ids.index("github") + 1
    assert github_trending.SPEC.optional is True
    assert github_trending.SPEC.platform == "github" and github.SPEC.platform is None
    assert "robots.txt allows /trending" in github_trending.SPEC.licence
    assert "/trending" in github_trending.URL and "stargazers" not in github_trending.URL


def test_platform_of_folds_the_two_github_lists_and_leaves_every_other_id_alone():
    assert platform_of("github_trending") == "github" == platform_of("github")
    assert platform_of("wikipedia") == "wikipedia" and platform_of("unknown") == "unknown"
    assert set(PLATFORM_OF.values()) == {s.id for s in SOURCES} - {"github_trending"}


def _sig(source, label, rank=1, unit="rank", magnitude=None):
    return Signal(source=source, label=label, rank=rank, magnitude=magnitude, magnitude_unit=unit)


def test_a_repository_on_both_github_lists_is_one_platform_not_a_crossing():
    topics = cluster([_sig("github", "acme/thing", magnitude=1200, unit="stars"),
                      _sig("github_trending", "acme/thing", magnitude=300, unit="stars_today")],
                     [], RULES, TODAY)
    assert len(topics) == 1
    t = topics[0]
    assert t.platforms == ("github",) and t.platform_count == 1
    # Both signals still sit in the cluster, each under its own source id.
    assert sorted(s.source for s in t.signals) == ["github", "github_trending"]
    assert t.label == "acme/thing"


def test_a_third_platform_makes_it_a_crossing_of_two():
    topics = cluster([_sig("github", "acme/thing"), _sig("github_trending", "acme/thing"),
                      _sig("hackernews", "Show HN: acme/thing does the thing")], [], RULES, TODAY)
    assert len(topics) == 1
    assert topics[0].platforms == ("github", "hackernews") and topics[0].platform_count == 2


def test_discovery_reads_the_trending_page_as_the_github_platform(tmp_path):
    """The archive corpus counts platforms; a day file's `github_trending` signals are GitHub."""
    import json

    from trending import discover

    folder = tmp_path / "src" / "data" / "trending"
    folder.mkdir(parents=True)
    (folder / "2026-09-03.json").write_text(json.dumps({
        "$contract": "trending-day/1",
        "date": "2026-09-03",
        "signals": {
            "github": [{"label": "acme/thing", "url": "https://github.com/acme/thing", "rank": 1,
                        "meta": {"description": "does the thing"}}],
            "github_trending": [{"label": "acme/thing", "url": "https://github.com/acme/thing",
                                 "rank": 3, "meta": {"description": "does the thing"}}],
            "hackernews": [{"label": "acme/thing does the thing", "url": "https://hn/1", "rank": 2}],
        },
    }), encoding="utf-8")
    notes: dict = {}
    docs = discover._archive_docs(tmp_path, TODAY, 30, notes)
    assert notes == {}
    assert sorted(d.platform for d in docs) == ["github", "github", "hackernews"]
    # Two sightings on one platform stay two documents (the key carries the source id), but
    # the platform count a candidate is ranked by sees one GitHub, not two.
    assert len({d.key for d in docs}) == 3
    assert "github_trending" not in discover.CORPUS_PLATFORMS
    assert discover.CORPUS_PLATFORMS.count("github") == 1
