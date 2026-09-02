"""The arcs record: the shape the site reads, its determinism, and how the step behaves
inside the nightly run."""
import json
from datetime import date, datetime, timezone

import httpx
import pytest

import trending.run as run_mod
from trending import terms, tracker
from trending.tracker import TermContext

from conftest import make_client
from test_discover import corpus_route
from test_tracker import NOW, route

WATCHLIST = [
    {"term": "loop engineering", "slug": "loop-engineering", "aliases": ["loop-engineering"],
     "added": "2026-08-20", "origin": "editorial", "note": "Editorial seed.",
     "wikipedia_article": None},
    {"term": "knowledge graph", "slug": "knowledge-graph", "aliases": [],
     "added": "2026-06-01", "origin": "discovered", "note": "Discovery run.",
     "wikipedia_article": "Knowledge_graph"},
]


def both(request):
    """Both halves of the step, told apart by their query: the per-term searches always carry
    a quoted phrase, the discovery corpus never does."""
    url = str(request.url)
    corpus = ("dev.to" in url
              or "points%3E%3D" in url  # the discovery corpus filters Hacker News by points
              or ("export.arxiv.org" in url and "cat" in url)
              or ("api.github.com" in url and "%22" not in url))
    return corpus_route(request) if corpus else route(request)


def ctx(handler=both) -> TermContext:
    return TermContext(client=make_client(handler), now=NOW, rules={}, clock=lambda: NOW,
                       throttles={p: 0.0 for p in (*tracker.PLATFORMS, "devto")})


def build(handler=both, watchlist=None, **kw):
    return terms.build_terms(ctx(handler), watchlist=watchlist or WATCHLIST,
                             today=date(2026, 9, 2), log=lambda s: None, **kw)


# ------------------------------------------------------------------------------- the contract

def test_the_record_has_the_shape_the_contract_names():
    rec = build()
    assert set(rec) == {"$contract", "date", "generated_at", "pipeline_version",
                        "method_version", "windows", "sources", "terms", "candidates",
                        "summary", "quality"}
    assert rec["$contract"] == "trending-terms/1"
    assert rec["date"] == "2026-09-02" and rec["generated_at"] == "2026-09-02T12:00:00Z"
    assert rec["pipeline_version"] == "0.2.0" and rec["method_version"] == "2"
    assert rec["windows"] == {"d1": 1, "d7": 7, "d30": 30}
    assert [s["id"] for s in rec["sources"]] == list(tracker.PLATFORMS)
    assert all(set(s) == {"id", "name", "url", "status", "note", "retrieved_at"}
               for s in rec["sources"])


def test_every_term_carries_counts_for_every_platform_and_a_total_without_pageviews():
    rec = build()
    first = rec["terms"][0]
    assert set(first) == {"slug", "term", "aliases", "added", "origin", "note",
                          "wikipedia_article", "counts", "total", "ratio", "status",
                          "first_seen", "receipts"}
    assert list(first["counts"]) == list(tracker.PLATFORMS)
    assert first["counts"]["wikipedia_views"] is None  # no article on this term
    assert all(set(first["counts"][p]) == {"d1", "d7", "d30", "capped"}
               for p in tracker.PLATFORMS if p != "wikipedia_views")
    # thirty days: hackernews 4 + google_news 3 + github 3 + arxiv 2 + reddit 2, pageviews out
    assert first["total"] == {"d1": 5, "d7": 9, "d30": 14}
    second = rec["terms"][1]
    assert second["counts"]["wikipedia_views"] == {"d1": 100, "d7": 700, "d30": 3000,
                                                   "capped": False}
    # Pageviews stay out of the total; and the headline guard drops the news items, whose
    # fixture headlines carry no word of this second term.
    assert second["counts"]["google_news"] == {"d1": 0, "d7": 0, "d30": 0, "capped": False}
    assert second["total"] == {"d1": 4, "d7": 7, "d30": 11}


def test_the_terms_keep_the_order_of_the_watchlist():
    rec = build()
    assert [t["slug"] for t in rec["terms"]] == [w["slug"] for w in WATCHLIST]
    assert [t["origin"] for t in rec["terms"]] == ["editorial", "discovered"]


def test_receipts_are_capped_dated_and_free_of_bodies():
    rec = build()
    receipts = rec["terms"][0]["receipts"]
    assert 0 < len(receipts) <= 12
    assert all(set(r) == {"platform", "title", "url", "date"} for r in receipts)
    assert all(len(r["date"]) == 10 for r in receipts)
    assert "SECRET BODY" not in json.dumps(rec)


def test_the_summary_counts_the_terms_by_status_with_every_status_named():
    rec = build()
    assert rec["summary"]["terms_total"] == 2
    assert list(rec["summary"]["by_status"]) == list(terms.STATUSES)
    assert sum(rec["summary"]["by_status"].values()) == 2
    assert rec["summary"]["candidates_total"] == len(rec["candidates"])


def test_the_candidates_are_the_discovery_proposals():
    rec = build()
    assert [c["ngram"] for c in rec["candidates"]] == ["sovereign compute"]
    assert set(rec["candidates"][0]) == {"ngram", "docs_recent", "docs_prior", "ratio",
                                         "platforms", "sample"}


def test_first_seen_and_status_use_the_archive(tmp_path):
    rec = build(watchlist=[WATCHLIST[0]])
    fresh = rec["terms"][0]
    # The oldest document any platform matched — not the oldest of the twelve kept receipts.
    assert fresh["first_seen"] == "2026-08-04"
    assert fresh["status"] == "emerging"
    older = terms.build_terms(ctx(), watchlist=[WATCHLIST[0]], today=date(2026, 9, 2),
                              history={"loop-engineering": "2025-11-02"},
                              log=lambda s: None)["terms"][0]
    assert older["first_seen"] == "2025-11-02"
    assert older["status"] == "rising"  # the same counts, but no longer new


def test_a_term_nobody_mentions_is_quiet_with_zero_counts():
    dead = [{"term": "nothing at all", "slug": "nothing-at-all", "aliases": [],
             "added": "2026-09-01", "origin": "editorial", "note": "",
             "wikipedia_article": None}]
    rec = build(lambda request: httpx.Response(404), watchlist=dead)
    term = rec["terms"][0]
    assert term["total"] == {"d1": 0, "d7": 0, "d30": 0}
    assert term["status"] == "quiet" and term["ratio"] is None
    assert term["first_seen"] == "2026-09-01" and term["receipts"] == []
    assert {s["status"] for s in rec["sources"]} == {"unavailable"}


def test_a_platform_that_fails_leaves_zeros_and_says_so_on_its_report():
    def handler(request):
        return httpx.Response(500) if "api.github.com" in str(request.url) else both(request)

    rec = build(handler)
    github = [s for s in rec["sources"] if s["id"] == "github"][0]
    assert github["status"] == "unavailable" and github["note"]
    assert rec["terms"][0]["counts"]["github"] == {"d1": 0, "d7": 0, "d30": 0, "capped": False}


def test_a_discovery_failure_lands_on_the_report_of_its_own_platform():
    def handler(request):
        url = str(request.url)
        # the points filter marks the discovery corpus query; the tracker's own Hacker News
        # search carries no such filter and must keep working in this test
        if "dev.to" in url or "points%3E%3D" in url:
            return httpx.Response(503)
        return route(request)

    rec = build(handler)
    hn = [s for s in rec["sources"] if s["id"] == "hackernews"][0]
    assert rec["candidates"] == []
    assert hn["status"] == "partial" and "discovery" in hn["note"]
    # The term counts of the same platform are untouched.
    assert rec["terms"][0]["counts"]["hackernews"]["d30"] == 4


# ------------------------------------------------------------------------------ determinism

def test_the_same_input_gives_a_byte_identical_file():
    from trending.model import to_json
    first = to_json(build())
    second = to_json(build())
    assert first == second
    assert first.endswith("\n")
    assert first == json.dumps(json.loads(first), ensure_ascii=False, indent=1,
                               sort_keys=True) + "\n"


def test_a_run_only_differs_where_the_clock_differs():
    from trending.model import to_json
    later = TermContext(client=make_client(both), now=NOW, rules={},
                        clock=lambda: datetime(2026, 9, 2, 18, 30, tzinfo=timezone.utc),
                        throttles={p: 0.0 for p in (*tracker.PLATFORMS, "devto")})
    other = terms.build_terms(later, watchlist=WATCHLIST, today=date(2026, 9, 2),
                              log=lambda s: None)
    a, b = json.loads(to_json(build())), json.loads(to_json(other))
    for rec in (a, b):
        rec.pop("generated_at")
        for source in rec["sources"]:
            source.pop("retrieved_at")
    assert a == b


# ----------------------------------------------------------------------------- the watchlist

def test_the_shipped_watchlist_is_well_formed():
    shipped = terms.load_watchlist()
    assert 10 <= len(shipped) <= 40
    assert len({w["slug"] for w in shipped}) == len(shipped)
    for entry in shipped:
        assert entry["term"] and entry["slug"] and entry["added"]
        assert entry["origin"] in ("editorial", "discovered")
        assert len(entry["note"]) <= 160
        assert isinstance(entry["aliases"], list)
    # The abbreviation of the answer-engine term is never searched on its own.
    assert not any(a.strip().upper() == "GEO" for w in shipped for a in w["aliases"])


def test_a_watchlist_entry_without_a_slug_gets_one_and_duplicates_are_dropped(monkeypatch):
    monkeypatch.setattr(terms, "load_json", lambda name: [
        {"term": "Loop Engineering", "added": "2026-09-02"},
        {"term": "loop engineering", "slug": "loop-engineering", "added": "2026-09-02"},
        {"term": "", "slug": "empty"}])
    assert [w["slug"] for w in terms.load_watchlist()] == ["loop-engineering"]


# ------------------------------------------------------------------------- writing the file

def test_run_terms_writes_the_dated_file_once(tmp_path, monkeypatch):
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    client = make_client(both)
    path = terms.run_terms(client, repo_root=tmp_path, today=date(2026, 9, 2),
                           rules={}, log=lambda s: None)
    assert path == tmp_path / "src" / "data" / "trending" / "terms" / "2026-09-02.json"
    rec = json.loads(path.read_text())
    assert rec["$contract"] == "trending-terms/1" and len(rec["terms"]) >= 10
    before = path.read_text()
    assert terms.run_terms(client, repo_root=tmp_path, today=date(2026, 9, 2), rules={},
                           log=lambda s: None) is None
    assert path.read_text() == before


def test_an_exception_in_the_step_writes_an_unavailable_record(tmp_path, monkeypatch):
    def boom(*a, **kw):
        raise RuntimeError("boom")

    monkeypatch.setattr(terms, "build_terms", boom)
    path = terms.run_terms(make_client(both), repo_root=tmp_path, today=date(2026, 9, 2),
                           rules={}, log=lambda s: None)
    rec = json.loads(path.read_text())
    assert rec["$contract"] == "trending-terms/1"
    assert rec["terms"] == [] and rec["candidates"] == []
    assert {s["status"] for s in rec["sources"]} == {"unavailable"}
    assert all("RuntimeError: boom" in s["note"] for s in rec["sources"])
    assert rec["summary"] == {"terms_total": 0, "candidates_total": 0,
                              "by_status": {s: 0 for s in terms.STATUSES}}


def test_the_cli_writes_the_record_without_the_day_file(tmp_path, monkeypatch):
    monkeypatch.setattr(terms, "open_client", lambda: make_client(both))
    assert terms.main(["--repo-root", str(tmp_path), "--date", "2026-09-02"]) == 0
    out = tmp_path / "src" / "data" / "trending"
    assert (out / "terms" / "2026-09-02.json").exists()
    assert not (out / "2026-09-02.json").exists()


def test_the_cli_refuses_a_malformed_date(tmp_path):
    with pytest.raises(SystemExit) as exc:
        terms.main(["--repo-root", str(tmp_path), "--date", "2026/09/02"])
    assert exc.value.code == 2


# ------------------------------------------------------------------------ inside the nightly

@pytest.fixture
def patched_run(monkeypatch):
    """The day sources are stubbed out; the terms step gets the fixture transport."""
    from trending.model import Signal
    from trending.sources.base import SourceResult, SourceSpec

    def one(ctx):
        return SourceResult([Signal(source="alpha", label="Storm", rank=1,
                                    magnitude_unit="rank")])

    monkeypatch.setattr(run_mod, "SOURCES", (SourceSpec("alpha", "Alpha", "https://a", "l", one),))
    real_client = httpx.Client
    monkeypatch.setattr(run_mod.httpx, "Client",
                        lambda **kw: real_client(transport=httpx.MockTransport(both)))
    monkeypatch.setattr(tracker, "THROTTLE_S", {p: 0.0 for p in tracker.PLATFORMS})


def test_the_nightly_writes_the_day_and_the_terms(tmp_path, patched_run, capsys):
    assert run_mod.main(["--repo-root", str(tmp_path), "--date", "2026-09-02",
                         "--skip-audience"]) == 0
    out = tmp_path / "src" / "data" / "trending"
    assert (out / "2026-09-02.json").exists()
    rec = json.loads((out / "terms" / "2026-09-02.json").read_text())
    assert rec["$contract"] == "trending-terms/1"
    assert rec["summary"]["terms_total"] == len(terms.load_watchlist())
    assert "terms" in capsys.readouterr().out


def test_skip_terms(tmp_path, patched_run):
    assert run_mod.main(["--repo-root", str(tmp_path), "--date", "2026-09-02",
                         "--skip-audience", "--skip-terms"]) == 0
    out = tmp_path / "src" / "data" / "trending"
    assert (out / "2026-09-02.json").exists()
    assert not (out / "terms").exists()


def test_a_committed_terms_file_is_never_rewritten(tmp_path, patched_run, capsys):
    folder = tmp_path / "src" / "data" / "trending" / "terms"
    folder.mkdir(parents=True)
    (folder / "2026-09-02.json").write_text('{"kept": true}\n')
    assert run_mod.main(["--repo-root", str(tmp_path), "--date", "2026-09-02",
                         "--skip-audience"]) == 0
    assert (folder / "2026-09-02.json").read_text() == '{"kept": true}\n'
    assert "already committed, untouched" in capsys.readouterr().out
