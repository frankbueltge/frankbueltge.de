from datetime import date

import httpx

from redaction.run import run
from redaction.watchlist import WatchItem

CDX = [
    ["timestamp", "original", "statuscode", "digest"],
    ["20260601000000", "https://x.test/p", "200", "AAA"],
    ["20260610000000", "https://x.test/p", "200", "BBB"],
]
BEFORE = ("<main><p>We will phase out coal by 2030, cutting 1.25 million tonnes.</p>"
          "<p>Stable line here.</p></main>")
AFTER = "<main><p>Stable line here.</p></main>"


def handler(req):
    u = str(req.url)
    if "/cdx/" in u:
        return httpx.Response(200, json=CDX)
    if "20260601000000id_" in u:
        return httpx.Response(200, text=BEFORE)
    return httpx.Response(200, text=AFTER)


def test_run_detects_removal_end_to_end():
    client = httpx.Client(transport=httpx.MockTransport(handler))
    wl = [WatchItem("https://x.test/p", "Inst", "A page")]
    rec = run(".", client=client, today=date(2026, 6, 25), watchlist=wl)
    assert rec["watched_count"] == 1
    assert rec["changed_count"] == 1
    assert rec["pick"] is not None
    r = rec["redactions"][0]
    assert r["kind"] == "removal" and "coal" in " ".join(r["removed_passages"])
    assert "number" in r["salience"]["signals"]
