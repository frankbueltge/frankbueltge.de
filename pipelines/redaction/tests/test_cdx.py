import httpx

from redaction.cdx import Capture, captures, classify, permalink, snapshot_url

CDX_JSON = [
    ["timestamp", "original", "statuscode", "digest"],
    ["20260601000000", "https://x.test/p", "200", "AAA"],
    ["20260610000000", "https://x.test/p", "200", "BBB"],
]


def _client(payload, status=200):
    def handler(req):
        return httpx.Response(status, json=payload)

    return httpx.Client(transport=httpx.MockTransport(handler))


def test_captures_parsed_oldest_to_newest():
    caps = captures("https://x.test/p", client=_client(CDX_JSON))
    assert [c.digest for c in caps] == ["AAA", "BBB"]


def test_classify_removal_on_digest_change():
    caps = [
        Capture("20260601000000", "200", "AAA"),
        Capture("20260610000000", "200", "BBB"),
    ]
    kind, before, after = classify(caps)
    assert kind == "removal" and before.digest == "AAA" and after.digest == "BBB"


def test_classify_4xx_newest_is_only_a_deletion_candidate():
    # A 4xx describes the crawler's night, not the page: the verdict "deletion"
    # is made by live.recheck, never here (memory-hole audit, finding 2).
    caps = [
        Capture("20260601000000", "200", "AAA"),
        Capture("20260610000000", "404", "-"),
    ]
    kind, before, after = classify(caps)
    assert kind == "deletion_candidate"
    assert before.status == "200" and after.status == "404"


def test_classify_403_is_a_candidate_too_not_a_deletion():
    caps = [
        Capture("20260810000000", "200", "AAA"),
        Capture("20260812142910", "403", "-"),
    ]
    assert classify(caps)[0] == "deletion_candidate"


def test_classify_none_when_single_capture():
    assert classify([Capture("20260601000000", "200", "AAA")])[0] == "none"


def test_classify_none_on_redirect_not_deletion():
    # A 3xx redirect (page moved/reorganised) must NOT be reported as a deletion.
    caps = [
        Capture("20260601000000", "200", "AAA"),
        Capture("20260610000000", "301", "CCC"),
    ]
    assert classify(caps)[0] == "none"


def test_url_builders():
    assert (
        snapshot_url("20260601000000", "https://x.test/p")
        == "https://web.archive.org/web/20260601000000id_/https://x.test/p"
    )
    assert (
        permalink("20260601000000", "https://x.test/p")
        == "https://web.archive.org/web/20260601000000/https://x.test/p"
    )
