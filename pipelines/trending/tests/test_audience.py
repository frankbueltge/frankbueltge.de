import json
from datetime import date

import httpx

from trending.audience import aggregate_edge, build_audience, edge_counts, umami_counts
from trending.model import to_json

from conftest import make_client

DAY = date(2026, 9, 2)
CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36"
ROWS = [
    {"count": 40, "avg": {"sampleInterval": 1}, "dimensions": {"userAgent": CHROME, "clientRequestPath": "/trending/", "edgeResponseStatus": 200}},
    {"count": 12, "avg": {"sampleInterval": 1}, "dimensions": {"userAgent": "PerplexityBot/1.0", "clientRequestPath": "/trending/latest.json", "edgeResponseStatus": 200}},
    {"count": 5, "avg": {"sampleInterval": 3}, "dimensions": {"userAgent": "GPTBot/1.2", "clientRequestPath": "/trending/2026-09-01", "edgeResponseStatus": 403}},
    {"count": 3, "avg": {"sampleInterval": 1}, "dimensions": {"userAgent": "Googlebot/2.1", "clientRequestPath": "/trending/feed.xml", "edgeResponseStatus": 200}},
]


def _graphql(rows):
    return {"data": {"viewer": {"zones": [{"httpRequestsAdaptiveGroups": rows}]}}}


def test_aggregate_sums_and_bots():
    edge = aggregate_edge(ROWS, DAY)
    assert edge["status"] == "ok" and edge["total"] == 60
    assert sum(edge["classes"].values()) == 60 and sum(edge["paths"].values()) == 60
    assert edge["classes"] == {"browser": 40, "search": 3, "ai-retrieval": 12, "ai-user-fetch": 0,
                               "ai-training": 5, "other-bot": 0}
    assert edge["paths"]["page"] == 40 and edge["paths"]["archive"] == 5 and edge["paths"]["feed"] == 3
    assert edge["bots"][0] == {"name": "PerplexityBot", "class": "ai-retrieval", "requests": 12, "ok_2xx": 12, "other_status": 0}
    assert edge["bots"][1]["other_status"] == 5
    assert edge["sample_interval_avg"] == round((55 * 1 + 5 * 3) / 60, 3)


def test_no_raw_user_agent_in_output():
    client = make_client(lambda req: httpx.Response(200, json=_graphql(ROWS)))
    rec = build_audience(client, DAY, env={"CF_ANALYTICS_TOKEN": "t", "CF_ZONE_ID": "z"}, generated_at="x")
    text = to_json(rec)
    assert CHROME not in text and "Windows" not in text and "GPTBot/1.2" not in text
    assert '"GPTBot"' in text and rec["$contract"] == "trending-audience/1" and rec["day"] == "2026-09-02"
    assert rec["umami"]["status"] == "unavailable"


def test_missing_token_is_declared_standby():
    edge = edge_counts(make_client(lambda req: httpx.Response(500)), None, None, DAY)
    assert edge["status"] == "unavailable" and edge["note"] == "no analytics token connected"
    assert edge["total"] is None and edge["bots"] == [] and edge["window"][0] == "2026-09-02T00:00:00Z"


def test_http_and_graphql_errors_are_unavailable():
    assert edge_counts(make_client(lambda req: httpx.Response(500)), "t", "z", DAY)["status"] == "unavailable"
    bad = make_client(lambda req: httpx.Response(200, json={"errors": [{"message": "no such field"}]}))
    edge = edge_counts(bad, "t", "z", DAY)
    assert edge["status"] == "unavailable" and "no such field" in edge["note"]
    empty = make_client(lambda req: httpx.Response(200, json={"data": {"viewer": {"zones": []}}}))
    assert "zone" in edge_counts(empty, "t", "z", DAY)["note"]


def test_token_is_sent_as_bearer_and_never_in_notes():
    seen = {}

    def handler(req):
        seen["auth"] = req.headers.get("authorization")
        return httpx.Response(500)

    edge = edge_counts(make_client(handler), "SECRETTOKEN", "z", DAY)
    assert seen["auth"] == "Bearer SECRETTOKEN" and "SECRETTOKEN" not in json.dumps(edge)


def test_umami_login_metrics_and_stats():
    def handler(req):
        if req.url.path.endswith("/api/auth/login"):
            assert json.loads(req.content)["username"] == "reader"
            return httpx.Response(200, json={"token": "jwt"})
        assert req.headers["authorization"] == "Bearer jwt"
        if req.url.path.endswith("/metrics"):
            return httpx.Response(200, json=[{"x": "/trending", "y": 7}, {"x": "/trending/2026-09-01", "y": 2}, {"x": "/about", "y": 9}])
        return httpx.Response(200, json={"pageviews": {"value": 7}, "visitors": {"value": 5}})

    u = umami_counts(make_client(handler), "https://stats.example/", "reader", "pw", DAY)
    assert u == {"status": "ok", "note": "", "source": u["source"], "pageviews": 9, "visitors": 5}
    assert umami_counts(make_client(handler), None, None, None, DAY)["status"] == "unavailable"
    assert umami_counts(make_client(lambda req: httpx.Response(401)), "https://s", "u", "pw", DAY)["status"] == "unavailable"
