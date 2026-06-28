import json
import httpx
from irrtum.sift import Finding
from irrtum.methods import Method
from irrtum.researcher import form_thesis, build_prompt, Thesis

F = Finding(pair=("co2", "sst"), r=0.97, fdr=0.01, n=12)
M = Method("Kartografie", "Lies als Karte.")


def test_build_prompt_mentions_pair_and_method():
    p = build_prompt(F, M)
    assert "co2" in p and "sst" in p and "Kartografie" in p and "0.97" in p


def _client_returning(payload: dict) -> httpx.Client:
    text = json.dumps(payload)

    def handler(_req):
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": text}]}}]})

    return httpx.Client(transport=httpx.MockTransport(handler))


def test_form_thesis_parses_model_json():
    client = _client_returning({"thesis": "CO2 und Meerestemperatur sind ein Ort.",
                                "cited_r": 0.97, "reasoning": "..."})
    t = form_thesis(F, M, client=client, api_key="k")
    assert isinstance(t, Thesis)
    assert t.method == "Kartografie"
    assert t.cited_r == 0.97
    assert "Ort" in t.text
