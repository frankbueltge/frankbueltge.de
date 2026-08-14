from datetime import date

import httpx

from redaction.run import run
from redaction.watchlist import WatchItem

CDX = [
    ["timestamp", "original", "statuscode", "digest"],
    ["20260601000000", "https://x.test/p", "200", "AAA"],
    ["20260610000000", "https://x.test/p", "200", "BBB"],
]
# A page version has to be a page: the fixtures clear the validity gate
# (>= validity.MIN_PAGE_TOKENS, prose, no consent boilerplate, no challenge).
STABLE = (
    "<p>The system development strategy sets out how the grid is expanded and how "
    "climate neutrality is to be reached by 2045.</p>"
    "<p>The department publishes a progress report every year and invites written "
    "comments from the public before each revision.</p>"
    "<p>Further information about the funding programme is available from the "
    "project management agency named in the annex.</p>"
)
BEFORE = ("<main><p>We will phase out coal by 2030, cutting 1.25 million tonnes.</p>"
          f"{STABLE}</main>")
AFTER = f"<main>{STABLE}</main>"

# The WAF challenge Wayback archived with status 200 (memory-hole audit,
# finding 1: BMWE dossier, 118,410 bytes of HTML → 8 tokens of text).
CHALLENGE = (
    "<html><head><title>Just a moment...</title></head><body>"
    "<h1>Verifying your browser before proceeding...</h1>"
    "<p>Incident ID: e4841cb0-dxzu-4858-bcd7-154223367ef4</p></body></html>"
)

WL = [WatchItem("https://x.test/p", "Inst", "A page")]


def _run(handler, today=date(2026, 6, 25)):
    client = httpx.Client(transport=httpx.MockTransport(handler))
    return run(".", client=client, today=today, watchlist=WL, live_pause=0.0)


def handler(req):
    u = str(req.url)
    if "/cdx/" in u:
        return httpx.Response(200, json=CDX)
    if "20260601000000id_" in u:
        return httpx.Response(200, text=BEFORE)
    return httpx.Response(200, text=AFTER)


def test_run_detects_removal_end_to_end():
    rec = _run(handler)
    assert rec["watched_count"] == 1
    assert rec["changed_count"] == 1
    assert rec["pick"] is not None
    assert rec["unverifiable"]["count"] == 0
    r = rec["redactions"][0]
    assert r["kind"] == "removal" and "coal" in " ".join(r["removed_passages"])
    assert "number" in r["salience"]["signals"]


def test_challenge_capture_is_never_diffed_but_disclosed():
    """Finding 1: a challenge page archived as 200 must not become a removal."""
    def h(req):
        u = str(req.url)
        if "/cdx/" in u:
            return httpx.Response(200, json=CDX)
        if "20260601000000id_" in u:
            return httpx.Response(200, text=BEFORE)
        return httpx.Response(200, text=CHALLENGE)  # the "after" capture

    rec = _run(h)
    assert rec["changed_count"] == 0 and rec["redactions"] == []
    unver = rec["unverifiable"]
    assert unver["count"] == 1 and unver["reasons"] == {"challenge": 1}
    item = unver["items"][0]
    assert item["side"] == "after" and item["wayback_ts"] == "20260610000000"
    assert item["detail"] == "verifying your browser"


# Finding 2: the newest capture is a 4xx — a deletion CANDIDATE.
CDX_4XX = [
    ["timestamp", "original", "statuscode", "digest"],
    ["20260810000000", "https://x.test/p", "200", "AAA"],
    ["20260812142910", "https://x.test/p", "403", "-"],
]


def _deletion_handler(live_status: int, live_text: str = "<p>The authority is online.</p>"):
    def h(req):
        u = str(req.url)
        if "/cdx/" in u:
            return httpx.Response(200, json=CDX_4XX)
        if "web.archive.org" in u:
            return httpx.Response(200, text=BEFORE)
        return httpx.Response(live_status, text=live_text)  # the live recheck

    return h


def test_4xx_capture_with_a_live_200_is_not_a_deletion():
    """BaFin: newest capture 403, live site answers 200 — an archive error."""
    rec = _run(_deletion_handler(200), today=date(2026, 8, 14))
    assert rec["changed_count"] == 0 and rec["pick"] is None
    unver = rec["unverifiable"]
    assert unver["count"] == 1 and unver["reasons"] == {"archive_error": 1}
    assert unver["items"][0]["side"] == "live"


def test_4xx_capture_with_a_live_404_is_a_confirmed_deletion():
    rec = _run(_deletion_handler(404, "not found"), today=date(2026, 8, 14))
    assert rec["changed_count"] == 1
    r = rec["redactions"][0]
    assert r["kind"] == "deletion" and r["after"]["status"] == "403"
    assert r["removed_tokens"] > 0 and rec["unverifiable"]["count"] == 0


def test_4xx_capture_with_a_live_botwall_is_unverifiable():
    rec = _run(_deletion_handler(403, "forbidden"), today=date(2026, 8, 14))
    assert rec["changed_count"] == 0
    assert rec["unverifiable"]["reasons"] == {"botwall": 1}


def test_confirmed_deletion_of_a_consent_banner_capture_is_still_gated():
    """The BaFin "before" text was the cookie notice — a live 404 does not
    make boilerplate a page version."""
    # ~69 tokens, like the capture the origin published with salience 14.
    consent = (
        "<main><p>Diese Website verwendet Cookies, um Ihnen den bestmöglichen Service "
        "zu bieten. Wir setzen das Webanalyse-Werkzeug Matomo ein, um die Nutzung "
        "dieser Website statistisch auszuwerten und dauerhaft zu verbessern. "
        "Sie können Ihre Einwilligung in das Tracking jederzeit widerrufen und der "
        "Verwendung von Cookies für die Zukunft widersprechen. "
        "Weitere Hinweise dazu finden Sie in unserer Datenschutzerklärung, die Sie "
        "jederzeit aufrufen und für Ihre Unterlagen speichern können.</p></main>"
    )

    def h(req):
        u = str(req.url)
        if "/cdx/" in u:
            return httpx.Response(200, json=CDX_4XX)
        if "web.archive.org" in u:
            return httpx.Response(200, text=consent)
        return httpx.Response(404, text="not found")

    rec = _run(h, today=date(2026, 8, 14))
    assert rec["changed_count"] == 0
    assert rec["unverifiable"]["reasons"] == {"boilerplate": 1}
    assert rec["unverifiable"]["items"][0]["side"] == "before"
