"""The two sources added on 2026-11-08: the research press and the humanitarian desk."""
import httpx

from trending.sources import humanitarian, science_press

NATURE = ("<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" "
          "xmlns=\"http://purl.org/rss/1.0/\"><channel><title>Nature</title></channel>"
          "<item><title>Cholera bacterium inspires a glue</title>"
          "<link>https://www.nature.com/articles/d41586-026-03630-x</link></item>"
          "<item><title>In vivo base editing of a gene</title>"
          "<link>https://www.nature.com/articles/s41586-026-11233-9</link></item>"
          "</rdf:RDF>")
SCIENCE = ("<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" "
           "xmlns=\"http://purl.org/rss/1.0/\"><item><title>Noise pollution harms wildlife</title>"
           "<link>https://www.science.org/content/article/noise</link></item></rdf:RDF>")
CONVERSATION = ("<feed xmlns=\"http://www.w3.org/2005/Atom\"><entry><title>What a verdict means</title>"
                "<link rel=\"alternate\" href=\"https://theconversation.com/x-1\"/></entry>"
                "<entry><title> </title><link href=\"https://theconversation.com/y\"/></entry></feed>")
RELIEFWEB = ("<rss version=\"2.0\"><channel><item><title>A million face acute hunger</title>"
             "<link>https://reliefweb.int/report/lebanon/x</link></item></channel></rss>")


def _by_host(pages):
    def handler(req: httpx.Request) -> httpx.Response:
        for host, body in pages.items():
            if req.url.host.endswith(host):
                return httpx.Response(200, text=body) if body else httpx.Response(503)
        return httpx.Response(404)
    return handler


def test_science_press_keeps_nature_journalism_and_reads_three_formats(ctx_factory):
    ctx = ctx_factory(_by_host({"nature.com": NATURE, "science.org": SCIENCE,
                                "theconversation.com": CONVERSATION}))
    res = science_press.fetch_source(ctx)
    assert [(s.label, s.meta["feed"], s.rank) for s in res.signals] == [
        ("Cholera bacterium inspires a glue", "nature", 1),
        ("Noise pollution harms wildlife", "science", 1),
        ("What a verdict means", "theconversation", 1),
    ]
    assert all(s.source == "science_press" and s.magnitude_unit == "rank" for s in res.signals)
    assert res.signals[2].url == "https://theconversation.com/x-1"
    assert res.notes == [] and science_press.SPEC.optional is True


def test_humanitarian_one_feed_failing_is_a_note(ctx_factory):
    ctx = ctx_factory(_by_host({"reliefweb.int": RELIEFWEB, "news.un.org": ""}))
    res = humanitarian.fetch_source(ctx)
    assert [s.label for s in res.signals] == ["A million face acute hunger"]
    assert res.signals[0].source == "humanitarian" and res.signals[0].meta == {"feed": "reliefweb"}
    assert len(res.notes) == 1 and res.notes[0].startswith("un_news:")
    assert "?" not in res.notes[0]  # no query string in a public note


def test_both_feeds_failing_makes_the_source_unavailable(ctx_factory):
    import pytest
    from trending.fetch import SourceUnavailable
    ctx = ctx_factory(_by_host({"reliefweb.int": "", "news.un.org": ""}))
    with pytest.raises(SourceUnavailable):
        humanitarian.fetch_source(ctx)
