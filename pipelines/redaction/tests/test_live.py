"""Live recheck of deletion candidates — "gone" must survive a live request."""
import httpx

from redaction import live
from redaction.world.recheck import BOTWALL, LEGAL_451, SERVER_ERROR, UNREACHABLE


def _client(handler):
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_live_404_confirms_the_deletion():
    assert live.verdict(404).cls == live.DELETION_CONFIRMED
    assert live.verdict(410).cls == live.DELETION_CONFIRMED


def test_live_200_makes_the_archive_4xx_an_archive_error():
    v = live.verdict(200, "<html><main>The supervisory authority is online.</main></html>")
    assert v.cls == live.ARCHIVE_ERROR and v.http_code == 200


def test_live_200_challenge_page_is_a_botwall_not_a_page():
    v = live.verdict(200, "<h1>Verifying your browser before proceeding...</h1>")
    assert v.cls == BOTWALL and "verifying your browser" in v.detail


def test_live_403_and_429_are_botwalls():
    assert live.verdict(403).cls == BOTWALL
    assert live.verdict(429).cls == BOTWALL


def test_live_451_is_reported_apart():
    assert live.verdict(451).cls == LEGAL_451


def test_live_5xx_is_indeterminate_not_a_deletion():
    assert live.verdict(503).cls == SERVER_ERROR


def test_network_failure_is_unreachable():
    assert live.verdict(None).cls == UNREACHABLE


def test_recheck_reads_the_body_only_on_2xx():
    seen = {"body_requests": 0}

    def handler(req):
        seen["body_requests"] += 1
        return httpx.Response(404, text="not found")

    v = live.recheck("https://x.test/p", client=_client(handler), pause=0.0)
    assert v.cls == live.DELETION_CONFIRMED and seen["body_requests"] == 1


def test_recheck_retries_transport_errors_then_reports_unreachable():
    attempts = {"n": 0}

    def handler(req):
        attempts["n"] += 1
        raise httpx.ConnectError("boom")

    v = live.recheck(
        "https://x.test/p", client=_client(handler), pause=0.0, retry_delays=(0.0, 0.0)
    )
    assert v.cls == UNREACHABLE and attempts["n"] == 3
