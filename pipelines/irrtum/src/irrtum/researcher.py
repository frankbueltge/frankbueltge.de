"""LLM-Forscherin: formt aus Finding + Methode eine These (Konjektur). Gemini, Parallaxe-Muster."""
from __future__ import annotations

import json
from dataclasses import dataclass

import httpx

from irrtum.methods import Method
from irrtum.sift import Finding

MODEL = "gemini-2.5-flash-lite"
_API = "https://generativelanguage.googleapis.com/v1beta/models"


class ResearchError(Exception):
    pass


@dataclass(frozen=True)
class Thesis:
    method: str
    text: str
    cited_r: float
    reasoning: str


def build_prompt(finding: Finding, method: Method) -> str:
    x, y = finding.pair
    return (
        "Du bist eine künstlerische Forscherin. Wende die Methode "
        f"'{method.name}' an: {method.lens}\n"
        f"Befund (aus echten Daten): die Größen '{x}' und '{y}' korrelieren mit "
        f"r={finding.r} (n={finding.n} Tage; Rausch-Anteil fdr={finding.fdr}).\n"
        "Bilde EINE These (eine Deutung, KEINE Tatsachenbehauptung). Antworte als JSON mit "
        "den Feldern: thesis (string), cited_r (die Zahl, auf die sich die These stützt), "
        "reasoning (string)."
    )


def form_thesis(finding: Finding, method: Method, *, client: httpx.Client, api_key: str) -> Thesis:
    body = {
        "contents": [{"role": "user", "parts": [{"text": build_prompt(finding, method)}]}],
        "generationConfig": {"temperature": 0.7, "responseMimeType": "application/json"},
    }
    headers = {"Content-Type": "application/json", "x-goog-api-key": api_key}
    resp = client.post(f"{_API}/{MODEL}:generateContent", headers=headers, json=body, timeout=120.0)
    resp.raise_for_status()
    raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    data = json.loads(raw)
    if "thesis" not in data or "cited_r" not in data:
        raise ResearchError("Antwort ohne 'thesis'/'cited_r'")
    return Thesis(method=method.name, text=str(data["thesis"]),
                  cited_r=float(data["cited_r"]), reasoning=str(data.get("reasoning", "")))
