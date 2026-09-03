import json
from datetime import date

import httpx

from trending.audience import aggregate_edge, build_audience, edge_counts
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


COUNTRIES = [{"count": 40, "dimensions": {"clientCountryName": "United States"}},
             {"count": 20, "dimensions": {"clientCountryName": "Germany"}}]
REFERERS = [{"count": 3, "dimensions": {"clientRefererHost": "news.ycombinator.com"}}]


def _graphql(rows):
    return {"data": {"viewer": {"zones": [{"httpRequestsAdaptiveGroups": rows}]}}}


def _route(main=None, countries=COUNTRIES, referers=REFERERS, refuse=()):
    """One handler for the three queries the run makes, told apart by their dimension."""
    def handler(request):
        body = json.loads(request.content.decode())
        query = body["query"]
        for dim, rows in (("clientCountryName", countries), ("clientRefererHost", referers)):
            if dim in query:
                if dim in refuse:
                    return httpx.Response(200, json={"errors": [{"message": f"{dim} is a paid dimension"}]})
                return httpx.Response(200, json=_graphql(rows))
        return httpx.Response(200, json=_graphql(main if main is not None else ROWS))
    return handler


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
    client = make_client(_route())
    rec = build_audience(client, DAY, env={"CF_ANALYTICS_TOKEN": "t", "CF_ZONE_ID": "z"}, generated_at="x")
    text = to_json(rec)
    assert CHROME not in text and "Windows" not in text and "GPTBot/1.2" not in text
    assert '"GPTBot"' in text and rec["$contract"] == "trending-audience/2" and rec["day"] == "2026-09-02"
    assert "umami" not in rec  # the beacon cannot see a crawler, so it is not a half of this


def test_missing_token_is_declared_standby():
    edge = edge_counts(make_client(lambda req: httpx.Response(500)), None, None, DAY)
    assert edge["status"] == "unavailable" and edge["note"] == "no analytics token connected"
    assert edge["total"] is None and edge["bots"] == [] and edge["window"][0] == "2026-09-02T00:00:00Z"
    assert edge["countries"] is None and edge["referers"] is None and edge["extra_note"] == ""


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




def test_the_two_extra_dimensions_are_asked_for_and_capped():
    edge = edge_counts(make_client(_route()), "t", "z", DAY)
    assert edge["status"] == "ok" and edge["total"] == 60
    assert edge["countries"] == {"United States": 40, "Germany": 20}
    assert edge["referers"] == {"news.ycombinator.com": 3}
    assert edge["extra_note"] == ""
    many = [{"count": 100 - i, "dimensions": {"clientCountryName": f"Country {i:02d}"}} for i in range(25)]
    edge = edge_counts(make_client(_route(countries=many)), "t", "z", DAY)
    assert len(edge["countries"]) == 10 and list(edge["countries"])[0] == "Country 00"


def test_a_dimension_the_plan_refuses_is_null_with_the_reason_and_costs_the_other_nothing():
    edge = edge_counts(make_client(_route(refuse=("clientRefererHost",))), "t", "z", DAY)
    assert edge["status"] == "ok" and edge["total"] == 60
    assert edge["countries"] == {"United States": 40, "Germany": 20}
    assert edge["referers"] is None
    assert "clientRefererHost" in edge["extra_note"] and "paid dimension" in edge["extra_note"]


def test_a_blank_dimension_value_is_not_counted_as_a_place():
    blank = [{"count": 7, "dimensions": {"clientRefererHost": ""}},
             {"count": 2, "dimensions": {"clientRefererHost": "example.org"}}]
    edge = edge_counts(make_client(_route(referers=blank)), "t", "z", DAY)
    assert edge["referers"] == {"example.org": 2}


def test_the_probe_refuses_a_day_that_has_not_ended(capsys):
    from datetime import date as _date, timedelta as _td
    from trending import audience as aud
    tomorrow = (_date.today() + _td(days=2)).isoformat()
    assert aud.main(["--day", tomorrow]) == 2
    assert "has not ended" in capsys.readouterr().err
    import pytest as _pytest
    with _pytest.raises(SystemExit):
        aud.main(["--day", "03.09.2026"])
