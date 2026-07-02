"""Der eine Gemini-Aufruf je Thema — über die AI-Studio-API (generativelanguage),
authentifiziert per API-Key (GEMINI_API_KEY). Kein GCP, kein Vertex, kein Metadaten-Token.
gemini-2.5-flash-lite, temperature 0, strukturiertes JSON, thinkingBudget 0 (Tempo).
Retry bei 429/500/503. In Tests vollständig gemockt — echte I/O nur in Produktion."""
from __future__ import annotations

import json
import os
import time

import httpx

from protokoll.parallaxe import MODEL
from protokoll.parallaxe.prompt import PROMPT

API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
RETRY_STATUSES = (429, 500, 503)
MAX_RETRIES = 5
RETRY_DELAY_S = 1.5


class ExtractionError(Exception):
    pass


def _api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        raise ExtractionError("GEMINI_API_KEY (oder GOOGLE_API_KEY) nicht gesetzt")
    return key


def _endpoint() -> str:
    return f"{API_BASE}/{MODEL}:generateContent"


def extract_omissions(lang_to_text: dict[str, str], *, client: httpx.Client) -> dict:
    """Schickt Prompt + Sprachblöcke an Gemini (AI Studio), parst die Matrix-Antwort.
    Muss 'lemma' und 'claims' enthalten, sonst ExtractionError."""
    text = PROMPT + "\n\n".join(f"[{lang}] {txt}" for lang, txt in lang_to_text.items())
    body = {
        "contents": [{"role": "user", "parts": [{"text": text}]}],
        # thinkingBudget 0: ohne „Thinking" ist Flash-Lite ~10x schneller — entscheidend,
        # damit der Nacht-Job mit bis zu 24 Aufrufen zügig durchläuft.
        "generationConfig": {"temperature": 0, "responseMimeType": "application/json",
                             "thinkingConfig": {"thinkingBudget": 0}},
    }
    headers = {"Content-Type": "application/json", "x-goog-api-key": _api_key()}

    last_status: int | None = None
    for attempt in range(MAX_RETRIES):
        resp = client.post(_endpoint(), headers=headers, json=body, timeout=120.0)
        if resp.status_code in RETRY_STATUSES:
            last_status = resp.status_code
            time.sleep(RETRY_DELAY_S * (2 ** attempt))
            continue
        if resp.status_code != 200:
            raise ExtractionError(f"Gemini HTTP {resp.status_code}")
        return _parse(resp.json())
    raise ExtractionError(f"Gemini erschöpft nach {MAX_RETRIES} Versuchen (zuletzt {last_status})")


def _parse(resp: dict) -> dict:
    try:
        raw = resp["candidates"][0]["content"]["parts"][0]["text"]
        data = json.loads(raw)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
        raise ExtractionError(f"unlesbare Gemini-Antwort: {exc}") from exc
    if "lemma" not in data or "claims" not in data:
        raise ExtractionError("Antwort ohne 'lemma'/'claims'")
    return data
