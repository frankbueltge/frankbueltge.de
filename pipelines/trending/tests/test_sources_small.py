import httpx
import pytest

from trending.fetch import SourceUnavailable
from trending.sources import bluesky, github, google_news, hackernews, mastodon, reddit


def test_hackernews_items_and_fallback_url(ctx_factory):
    items = {1: {"title": "A story", "url": "https://a.example", "score": 10, "descendants": 3},
             2: {"title": "Ask HN: no url", "score": 5}}

    def handler(req):
        if req.url.path.endswith("topstories.json"):
            return httpx.Response(200, json=[1, 2, 3])
        item_id = int(req.url.path.split("/")[-1].split(".")[0])
        if item_id == 3:
            return httpx.Response(500)
        return httpx.Response(200, json=items[item_id])

    res = hackernews.fetch_source(ctx_factory(handler))
    assert [s.label for s in res.signals] == ["A story", "Ask HN: no url"]
    assert res.signals[1].url == "https://news.ycombinator.com/item?id=2"
    assert res.signals[0].meta["comments"] == 3 and res.signals[0].magnitude == 10
    assert len(res.notes) == 1 and "item 3" in res.notes[0]


def test_bluesky_trends(ctx_factory):
    payload = {"trends": [{"topic": "abc", "displayName": "USPS mail ballot handling",
                           "description": "x" * 300, "link": "/profile/did:plc:x/feed/abc",
                           "startedAt": "2026-09-01T10:49:48Z", "postCount": 2779,
                           "status": "saturating", "category": "politics"}]}
    res = bluesky.fetch_source(ctx_factory(lambda req: httpx.Response(200, json=payload)))
    s = res.signals[0]
    assert s.label == "USPS mail ballot handling" and s.magnitude == 2779
    assert s.url == "https://bsky.app/profile/did:plc:x/feed/abc"
    assert s.meta["category"] == "politics" and len(s.meta["description"]) == 200


def test_mastodon_tags_and_links(ctx_factory):
    tags = [{"name": "TextureTuesday", "url": "https://mastodon.social/tags/texturetuesday",
             "history": [{"day": "1", "accounts": "96", "uses": "115"}]}]
    links = [{"url": "https://nyt.example/a", "title": "Whistle-blower says USPS", "provider_name": "NYT",
              "history": [{"day": "1", "accounts": "4", "uses": "9"}]}]

    def handler(req):
        return httpx.Response(200, json=tags if "tags" in req.url.path else links)

    res = mastodon.fetch_source(ctx_factory(handler))
    assert res.signals[0].label == "TextureTuesday" and res.signals[0].magnitude == 115
    assert res.signals[0].meta == {"kind": "tag", "accounts": 96}
    assert res.signals[1].magnitude_unit == "shares" and res.signals[1].meta["provider"] == "NYT"


def test_mastodon_one_half_failing_is_partial(ctx_factory):
    def handler(req):
        if "links" in req.url.path:
            return httpx.Response(500)
        return httpx.Response(200, json=[{"name": "x", "url": "u", "history": []}])

    res = mastodon.fetch_source(ctx_factory(handler))
    assert len(res.signals) == 1 and res.signals[0].magnitude is None
    assert res.notes and res.notes[0].startswith("links:")


def test_google_news_publisher_split(ctx_factory):
    rss = ("<rss><channel><item><title>Fed holds rates - Reuters</title><link>https://n.example/1</link>"
           "<source url=\"https://reuters.com\">Reuters</source></item>"
           "<item><title>No publisher here</title><link>https://n.example/2</link></item></channel></rss>")
    res = google_news.fetch_source(ctx_factory(lambda req: httpx.Response(200, text=rss)))
    assert res.signals[0].label == "Fed holds rates" and res.signals[0].meta["publisher"] == "Reuters"
    assert res.signals[1].label == "No publisher here" and res.signals[1].meta["publisher"] is None
    assert res.signals[1].rank == 2 and res.signals[1].magnitude_unit == "rank"


def test_reddit_atom_and_failure(ctx_factory):
    atom = ('<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>A post</title>'
            '<link href="https://www.reddit.com/r/pics/x"/><category term="r/pics" label="r/pics"/></entry></feed>')
    res = reddit.fetch_source(ctx_factory(lambda req: httpx.Response(200, text=atom)))
    assert res.signals[0].label == "A post" and res.signals[0].meta["subreddit"] == "r/pics"
    assert reddit.SPEC.optional is True
    with pytest.raises(SourceUnavailable):
        reddit.fetch_source(ctx_factory(lambda req: httpx.Response(403)))


def test_github_new_repos(ctx_factory):
    payload = {"items": [{"full_name": "org/repo", "html_url": "https://github.com/org/repo",
                          "stargazers_count": 1234, "language": "Rust", "description": "d" * 300}]}
    res = github.fetch_source(ctx_factory(lambda req: httpx.Response(200, json=payload)))
    assert res.signals[0].label == "org/repo" and res.signals[0].magnitude == 1234
    assert res.signals[0].meta["language"] == "Rust" and len(res.signals[0].meta["description"]) == 200
