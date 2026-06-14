"""Der eine Gemini-Aufruf je Thema: Vertex generateContent (gemini-2.5-flash, temperature 0,
strukturiertes JSON). Token in Cloud Run über den Metadaten-Server, lokal über die gcloud-CLI;
dazu x-goog-user-project, Retry/Token-Refresh bei 401/429/503. In Tests vollständig gemockt —
echte I/O nur in Produktion."""
from __future__ import annotations

import json
import os
import subprocess
import threading
import time

import httpx

from protokoll.parallaxe import MODEL
from protokoll.parallaxe.prompt import PROMPT

PROJECT = os.environ.get("GOOGLE_CLOUD_PROJECT", "data-snack")
REGION = "us-central1"

# Der Metadaten-Server liefert in Cloud Run/GCE den ADC-Token des Dienstkontos. Das Slim-Image
# enthält keine gcloud-CLI — deshalb darf der Token NICHT per Subprozess geholt werden (das lief
# nur lokal). Die IP 169.254.169.254 vermeidet DNS und scheitert lokal sofort statt zu hängen.
METADATA_TOKEN_URL = (
    "http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token"
)

RETRY_STATUSES = (401, 429, 503)
MAX_RETRIES = 3
RETRY_DELAY_S = 1.5

_token_cache: dict[str, str] = {}
_token_lock = threading.Lock()


class ExtractionError(Exception):
    pass


def _fetch_token() -> str:
    """Frischer Access-Token. Zuerst der Metadaten-Server (Cloud Run/GCE), dann als Fallback die
    gcloud-CLI (lokale Entwicklung). Reihenfolge ist entscheidend: in Produktion gibt es keine CLI."""
    try:
        resp = httpx.get(METADATA_TOKEN_URL,
                         headers={"Metadata-Flavor": "Google"}, timeout=2.0)
        if resp.status_code == 200:
            return resp.json()["access_token"]
    except (httpx.HTTPError, KeyError, ValueError):
        pass  # kein Metadaten-Server erreichbar -> lokal, gcloud-CLI versuchen
    return subprocess.check_output(
        ["gcloud", "auth", "print-access-token"]).decode().strip()


def _access_token(refresh: bool = False) -> str:
    """ADC-Token, gecacht und thread-sicher. refresh=True erzwingt einen frischen Token."""
    with _token_lock:
        if refresh or "token" not in _token_cache:
            _token_cache["token"] = _fetch_token()
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
        # thinkingBudget 0: ohne „Thinking" ist gemini-2.5-flash ~10x schneller —
        # entscheidend, damit der Nacht-Job mit 24 Aufrufen im Cloud-Run-Timeout bleibt.
        "generationConfig": {"temperature": 0, "responseMimeType": "application/json",
                             "thinkingConfig": {"thinkingBudget": 0}},
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
