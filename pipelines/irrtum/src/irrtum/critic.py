"""Widerlegung: symbolische Prüfung (auditierbar) + adversarialer LLM-Kritiker + Verdikt."""
from __future__ import annotations

import json
from typing import Literal

import httpx

from irrtum.researcher import MODEL, Thesis
from irrtum.sift import Finding

Verdict = Literal["survived", "refuted", "inconclusive"]
_API = "https://generativelanguage.googleapis.com/v1beta/models"


def symbolic_check(finding: Finding, thesis: Thesis, *, r_tol: float = 0.05, fdr_max: float = 0.1) -> bool:
    """True nur, wenn die zitierte Zahl zur echten passt UND der Befund nicht Rauschen ist."""
    number_matches = abs(thesis.cited_r - finding.r) <= r_tol
    is_signal = finding.fdr <= fdr_max
    return number_matches and is_signal


def adversary(finding: Finding, thesis: Thesis, *, client: httpx.Client, api_key: str) -> tuple[bool, str]:
    prompt = (
        "Du bist eine strenge Kritikerin. Greife die folgende These an. Ist sie vom Befund "
        f"getragen oder Kunstsprech? Befund: r={finding.r}, fdr={finding.fdr}, n={finding.n}. "
        f"These ({thesis.method}): {thesis.text}\n"
        "Antworte als JSON: supported (bool), critique (string)."
    )
    body = {"contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}}
    headers = {"Content-Type": "application/json", "x-goog-api-key": api_key}
    resp = client.post(f"{_API}/{MODEL}:generateContent", headers=headers, json=body, timeout=120.0)
    resp.raise_for_status()
    data = json.loads(resp.json()["candidates"][0]["content"]["parts"][0]["text"])
    return bool(data.get("supported", False)), str(data.get("critique", ""))


def verdict(symbolic_ok: bool, critic_supported: bool) -> Verdict:
    if not symbolic_ok:
        return "refuted"
    return "survived" if critic_supported else "inconclusive"
