import json, httpx
from irrtum.session import run_session, Session, session_to_json


def _ramp(start, step, days):
    return {f"2026-06-{d:02d}": start + step*i for i, d in enumerate(range(1, days+1))}


SERIES = {"a": _ramp(400, 1.0, 10), "b": _ramp(20, 0.5, 10)}


def _client(thesis_r, supported):
    def handler(req):
        body = json.loads(req.content)
        prompt = body["contents"][0]["parts"][0]["text"]
        if "Kritikerin" in prompt:
            text = json.dumps({"supported": supported, "critique": "c"})
        else:
            text = json.dumps({"thesis": "t", "cited_r": thesis_r, "reasoning": "r"})
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": text}]}}]})
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_session_survives_when_number_and_critic_agree():
    s = run_session(SERIES, "2026-06-10", client=_client(thesis_r=1.0, supported=True), api_key="k", seed=1)
    assert isinstance(s, Session)
    assert s.verdict == "survived"
    assert s.date == "2026-06-10"
    assert json.loads(session_to_json(s))["verdict"] == "survived"


def test_session_refuted_when_number_fabricated():
    s = run_session(SERIES, "2026-06-10", client=_client(thesis_r=0.1, supported=True), api_key="k", seed=1)
    assert s.verdict == "refuted"
