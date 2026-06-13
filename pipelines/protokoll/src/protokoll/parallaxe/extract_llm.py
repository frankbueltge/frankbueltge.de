"""Der eine Gemini-Aufruf je Thema: Vertex generateContent (gemini-2.5-flash, temperature 0,
strukturiertes JSON). Token via gcloud-ADC + x-goog-user-project, Retry/Token-Refresh bei
401/429/503. In Tests vollständig gemockt — echte I/O nur in Produktion."""
from __future__ import annotations

import json
import os
import subprocess
import time

import httpx

from protokoll.parallaxe import MODEL
from protokoll.parallaxe.prompt import PROMPT

PROJECT = os.environ.get("GOOGLE_CLOUD_PROJECT", "data-snack")
REGION = "us-central1"

RETRY_STATUSES = (401, 429, 503)
MAX_RETRIES = 3
RETRY_DELAY_S = 1.5

_token_cache: dict[str, str] = {}


class ExtractionError(Exception):
    pass


def _access_token(refresh: bool = False) -> str:
    """gcloud-ADC-Token, gecacht. refresh=True erzwingt einen frischen Token."""
    if refresh or "token" not in _token_cache:
        _token_cache["token"] = subprocess.check_output(
            ["gcloud", "auth", "print-access-token"]).decode().strip()
    return _token_cache["token"]


def _endpoint() -> str:
    return (f"https://{REGION}-aiplatform.googleapis.com/v1/projects/{PROJECT}"
            f"/locations/{REGION}/publishers/google/models/{MODEL}:generateContent")


def extract_omissions(lang_to_text: dict[str, str], *, client: httpx.Client) -> dict:
    """Schickt Prompt + Sprachblöcke an Vertex Gemini, parst die Matrix-Antwort.
    Muss 'lemma' und 'claims' enthalten, sonst ExtractionError."""
    text = PROMPT + "\n\n".join(f"[{lang}] {txt}" for lang, txt in lang_to_text.items())
    body = {
        "contents": [{"role": "user", "parts": [{"text": text}]}],
        "generationConfig": {"temperature": 0, "responseMimeType": "application/json"},
    }

    last_status: int | None = None
    for attempt in range(MAX_RETRIES):
        token = _access_token(refresh=attempt > 0)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "x-goog-user-project": PROJECT,
        }
        resp = client.post(_endpoint(), headers=headers, json=body, timeout=120.0)
        if resp.status_code in RETRY_STATUSES:
            last_status = resp.status_code
            time.sleep(RETRY_DELAY_S)
            continue
        if resp.status_code != 200:
            raise ExtractionError(f"Vertex HTTP {resp.status_code}")
        return _parse(resp.json())
    raise ExtractionError(f"Vertex erschöpft nach {MAX_RETRIES} Versuchen (zuletzt {last_status})")


def _parse(resp: dict) -> dict:
    try:
        raw = resp["candidates"][0]["content"]["parts"][0]["text"]
        data = json.loads(raw)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
        raise ExtractionError(f"unlesbare Vertex-Antwort: {exc}") from exc
    if "lemma" not in data or "claims" not in data:
        raise ExtractionError("Antwort ohne 'lemma'/'claims'")
    return data
