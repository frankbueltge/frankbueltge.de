"""Discovery: n-grams over a corpus, the two windows, the exclusions and the ranking."""
from datetime import date, datetime, timedelta, timezone

import httpx
import pytest

from trending import discover, textstats
from trending.textstats import Document
from trending.tracker import TermContext

from conftest import make_client

NOW = datetime(2026, 9, 2, 12, 0, 0, tzinfo=timezone.utc)
TODAY = NOW.date()

WATCHLIST = [{"term": "small language model", "slug": "small-language-model",
              "aliases": ["small language models"], "wikipedia_article": None},
             {"term": "knowledge graph", "slug": "knowledge-graph", "aliases": []}]


def ctx(handler) -> TermContext:
    return TermContext(client=make_client(handler), now=NOW, rules={}, clock=lambda: NOW,
                       throttles={"hackernews": 0.0, "github": 0.0, "devto": 0.0,
                                  "arxiv": 0.0})


def day(n: int) -> str:
    return (TODAY - timedelta(days=n)).isoformat()


def docs(phrase: str, *, platform: str, recent: int, prior: int, start: int = 0):
    """`recent` documents inside the last fourteen days and `prior` before them, each with a
    distinct url so nothing is deduped away."""
    out = []
    for n in range(recent):
        out.append(Document(platform=platform, title=phrase,
                            url=f"https://{platform}.example/r/{start + n}", date=day(n % 14)))
    for n in range(prior):
        out.append(Document(platform=platform, title=phrase,
                            url=f"https://{platform}.example/p/{start + n}",
                            date=day(14 + n % 16)))
    return out


# ------------------------------------------------------------------------------- the phrases

def test_bigrams_and_trigrams_are_built_over_adjacent_kept_tokens():
    assert textstats.phrases("Agentic commerce arrives") == {
        "agentic commerce", "commerce arrives", "agentic commerce arrives"}


def test_a_phrase_with_a_two_letter_token_is_dropped_whole():
    # "ai" is two characters, so neither "ai slop" nor "slop everywhere ai" survives.
    assert textstats.phrases("ai slop everywhere") == {"slop everywhere"}


def test_function_words_are_dropped_and_the_gap_closes():
    assert "engineering practice" in textstats.phrases("Engineering of the practice")


def test_a_phrase_counts_once_per_document_however_often_it_occurs():
    corpus = [Document(platform="hackernews", title="agentic commerce and agentic commerce",
                       url="https://a/1", date=day(1))]
    counted = textstats.tally(corpus, recent_from=day(13))
    assert counted["agentic commerce"].docs_recent == 1


def test_the_same_url_is_never_counted_twice():
    corpus = [Document(platform="hackernews", title="agentic commerce", url="https://a/1",
                       date=day(1)),
              Document(platform="devto", title="agentic commerce", url="https://a/1",
                       date=day(2))]
    counted = textstats.tally(corpus, recent_from=day(13))
    assert counted["agentic commerce"].docs_recent == 1


def test_the_repository_description_is_counted_with_the_title():
    corpus = [Document(platform="github", title="acme/thing", url="https://g/1", date=day(1),
                       extra="An agentic commerce gateway")]
    counted = textstats.tally(corpus, recent_from=day(13))
    assert counted["agentic commerce"].docs_recent == 1


# ------------------------------------------------------------------- the two windows and rank

def test_recent_and_prior_are_counted_separately_and_normalised_per_day():
    corpus = (docs("agentic commerce", platform="hackernews", recent=6, prior=2)
              + docs("agentic commerce", platform="github", recent=3, prior=0, start=100))
    found = {c["ngram"]: c for c in discover.rank(corpus, [], today=TODAY)}
    got = found["agentic commerce"]
    assert got["docs_recent"] == 9 and got["docs_prior"] == 2
    # (9 / 14) ÷ (2 / 16) = 5.14
    assert got["ratio"] == pytest.approx(5.14, abs=0.01)
    assert got["platforms"] == ["hackernews", "github"]


def test_a_phrase_with_no_prior_is_bounded_by_the_floor_not_by_a_division_by_zero():
    corpus = docs("agentic commerce", platform="hackernews", recent=8, prior=0)
    got = discover.rank(corpus, [], today=TODAY)[0]
    assert got["docs_prior"] == 0
    # (8 / 14) ÷ max(0, 0.5/16) = 18.29
    assert got["ratio"] == pytest.approx(18.29, abs=0.01)


def test_the_sample_is_the_newest_recent_document_and_carries_no_body():
    corpus = docs("agentic commerce", platform="hackernews", recent=8, prior=0)
    got = discover.rank(corpus, [], today=TODAY)[0]
    assert set(got["sample"]) == {"title", "url", "date"}
    assert got["sample"]["date"] == day(0)


def test_a_phrase_below_the_thresholds_is_no_candidate():
    thin = docs("agentic commerce", platform="hackernews", recent=3, prior=0)
    assert discover.rank(thin, [], today=TODAY) == []
    # Four on one platform is not enough either: one platform needs eight.
    single = docs("agentic commerce", platform="hackernews", recent=4, prior=0)
    assert discover.rank(single, [], today=TODAY) == []
    # Four across two platforms is.
    two = (docs("agentic commerce", platform="hackernews", recent=2, prior=0)
           + docs("agentic commerce", platform="github", recent=2, prior=0, start=50))
    assert [c["ngram"] for c in discover.rank(two, [], today=TODAY)] == ["agentic commerce"]


def test_the_thresholds_come_from_the_rules():
    thin = docs("agentic commerce", platform="hackernews", recent=3, prior=0)
    assert discover.rank(thin, [], today=TODAY, rules={"discover_min_docs_recent": 3,
                                                       "discover_min_platforms": 1}) != []


# ------------------------------------------------------------------------------ the exclusions

def test_the_blocklist_drops_field_wide_constants_and_platform_furniture():
    corpus = (docs("machine learning", platform="hackernews", recent=9, prior=0)
              + docs("show hn", platform="hackernews", recent=9, prior=0, start=200)
              + docs("september release", platform="hackernews", recent=9, prior=0, start=400)
              + docs("awesome things", platform="hackernews", recent=9, prior=0, start=600))
    found = {c["ngram"] for c in discover.rank(corpus, [], today=TODAY)}
    assert "machine learning" not in found      # a listed phrase
    assert "show hn" not in found               # platform furniture
    assert "september release" not in found     # a listed token: months
    assert "awesome things" not in found        # a listed token: repository furniture


def test_a_phrase_inside_a_watched_term_is_not_a_finding():
    corpus = (docs("small language model", platform="hackernews", recent=9, prior=0)
              + docs("knowledge graphs everywhere", platform="devto", recent=9, prior=0,
                     start=300))
    found = {c["ngram"] for c in discover.rank(corpus, WATCHLIST, today=TODAY)}
    assert "small language model" not in found  # the watched term itself
    assert "language model" not in found        # a part of it
    assert "small language" not in found
    assert "knowledge graph" not in found       # matched through the alias-free plural
    # A phrase that merely *contains* a watched term is still a finding of its own.
    assert "knowledge graphs everywhere" in found


def test_the_watchlist_is_compared_in_its_tokenised_form():
    assert discover.watchlist_phrases([{"term": "MCP Server", "aliases": ["Model-Context "]}]) \
        == frozenset({"mcp server", "model context"})


# --------------------------------------------------------------------------------- the ranking

def test_ranking_puts_the_number_of_platforms_first_then_the_ratio():
    corpus = (docs("agentic commerce", platform="hackernews", recent=4, prior=0)
              + docs("agentic commerce", platform="github", recent=1, prior=0, start=10)
              + docs("harness discipline", platform="arxiv", recent=20, prior=0, start=20))
    ranked = discover.rank(corpus, [], today=TODAY)
    assert [c["ngram"] for c in ranked][:2] == ["agentic commerce", "harness discipline"]
    assert ranked[0]["ratio"] < ranked[1]["ratio"]


def test_the_list_stops_at_thirty_and_is_deterministic():
    corpus = []
    for n in range(40):
        corpus += docs(f"phrase{n:02d} candidate", platform="hackernews", recent=9, prior=1,
                       start=n * 100)
    ranked = discover.rank(corpus, [], today=TODAY)
    assert len(ranked) == 30
    assert ranked == discover.rank(list(reversed(corpus)), [], today=TODAY)


# ------------------------------------------------------------------------------- the corpus

HN = {"nbPages": 1, "hits": [
    {"objectID": "1", "title": "Sovereign compute, live", "url": "https://hn.example/1",
     "created_at_i": int((NOW - timedelta(days=1)).timestamp())},
    {"objectID": "2", "title": "Too old for the window", "url": "https://hn.example/2",
     "created_at_i": int((NOW - timedelta(days=90)).timestamp())}]}
DEVTO = [{"title": "Sovereign compute in three lines", "url": "https://dev.example/1",
          "published_at": (NOW - timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%SZ")}]
ARXIV = ("<feed xmlns='http://www.w3.org/2005/Atom'><entry><title>On sovereign compute</title>"
         "<id>https://arxiv.org/abs/1</id><published>"
         + (NOW - timedelta(days=3)).strftime("%Y-%m-%dT%H:%M:%SZ")
         + "</published></entry></feed>")
GITHUB = {"total_count": 1, "items": [
    {"full_name": "acme/checkout", "html_url": "https://github.com/acme/checkout",
     "created_at": (NOW - timedelta(days=4)).strftime("%Y-%m-%dT%H:%M:%SZ"),
     "description": "A sovereign compute gateway. " + "x" * 400}]}


def corpus_route(request):
    url = str(request.url)
    if "hn.algolia.com" in url:
        return httpx.Response(200, json=HN)
    if "dev.to" in url:
        return httpx.Response(200, json=DEVTO)
    if "export.arxiv.org" in url:
        return httpx.Response(200, text=ARXIV)
    if "api.github.com" in url:
        return httpx.Response(200, json=GITHUB)
    return httpx.Response(404)


def test_the_corpus_reads_four_archives_and_drops_what_is_outside_the_window():
    got, notes, coverage = discover.corpus(ctx(corpus_route), days=30, log=lambda s: None)
    assert notes == {}
    assert sorted({d.platform for d in got}) == ["arxiv", "devto", "github", "hackernews"]
    assert len(got) == 4  # the ninety-day-old story is dropped
    assert coverage["github"] == day(4)
    assert all(len(d.extra) <= discover.DESCRIPTION_CAP for d in got)


def test_a_corpus_source_that_fails_is_a_note_and_the_others_still_count():
    def handler(request):
        return httpx.Response(500) if "dev.to" in str(request.url) else corpus_route(request)

    got, notes, _ = discover.corpus(ctx(handler), days=30, log=lambda s: None)
    assert list(notes) == ["devto"] and "discovery" in notes["devto"][0]
    assert {d.platform for d in got} == {"hackernews", "arxiv", "github"}


def test_discover_returns_candidates_notes_and_coverage():
    result = discover.discover(ctx(corpus_route), WATCHLIST, log=lambda s: None)
    assert result.documents == 4
    assert [c["ngram"] for c in result.candidates] == ["sovereign compute"]
    got = result.candidates[0]
    assert got["docs_recent"] == 4 and got["docs_prior"] == 0
    assert got["platforms"] == ["hackernews", "devto", "arxiv", "github"]
    assert result.notes == {}


def test_the_cli_prints_the_table(capsys, monkeypatch):
    monkeypatch.setattr(discover, "open_client", lambda: make_client(corpus_route))
    assert discover.main(["--repo-root", ".", "--days", "30"]) == 0
    out = capsys.readouterr().out
    assert "n-gram" in out and "sovereign compute" in out
    assert "1 candidates" in out or "1 candidate" in out


def test_the_cli_survives_a_dead_corpus(capsys, monkeypatch):
    monkeypatch.setattr(discover, "open_client",
                        lambda: make_client(lambda request: httpx.Response(503)))
    assert discover.main(["--repo-root", "."]) == 0
    out = capsys.readouterr().out
    assert "0 documents, 0 candidates" in out and "note hackernews" in out
