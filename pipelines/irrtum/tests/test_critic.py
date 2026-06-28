import json, httpx
from irrtum.sift import Finding
from irrtum.researcher import Thesis
from irrtum.critic import symbolic_check, adversary, verdict

F = Finding(pair=("co2", "sst"), r=0.97, fdr=0.01, n=12)
T_ok = Thesis("Kartografie", "…", cited_r=0.97, reasoning="")
T_fab = Thesis("Kartografie", "…", cited_r=0.30, reasoning="")          # erfundene Zahl
F_noise = Finding(pair=("a", "b"), r=0.5, fdr=0.6, n=8)                 # Rauschen
T_noise = Thesis("Kartografie", "…", cited_r=0.5, reasoning="")

def test_symbolic_true_when_number_matches_and_signal():
    assert symbolic_check(F, T_ok) is True

def test_symbolic_false_when_number_fabricated():
    assert symbolic_check(F, T_fab) is False

def test_symbolic_false_when_finding_is_noise():
    assert symbolic_check(F_noise, T_noise) is False

def _client(supported: bool) -> httpx.Client:
    text = json.dumps({"supported": supported, "critique": "weil…"})
    def handler(_req):
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": text}]}}]})
    return httpx.Client(transport=httpx.MockTransport(handler))

def test_adversary_parses_supported():
    ok, crit = adversary(F, T_ok, client=_client(False), api_key="k")
    assert ok is False and "weil" in crit

def test_verdict_rules():
    assert verdict(True, True) == "survived"
    assert verdict(False, True) == "refuted"
    assert verdict(True, False) == "inconclusive"
