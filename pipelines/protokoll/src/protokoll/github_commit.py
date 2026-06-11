"""Einziger Schreibweg zur Site: ein Commit pro Sitzung, Autorin 'Protokollführung'."""
from __future__ import annotations

import base64

import httpx

API = "https://api.github.com"
COMMITTER = {"name": "Protokollführung", "email": "protokoll@frankbueltge.de"}


def commit_file(*, repo: str, path: str, content: str, message: str,
                token: str, client: httpx.Client) -> str:
    url = f"{API}/repos/{repo}/contents/{path}"
    headers = {"Authorization": f"Bearer {token}",
               "Accept": "application/vnd.github+json"}
    existing = client.get(url, headers=headers, timeout=30.0)
    body: dict = {
        "message": message,
        "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
        "committer": COMMITTER,
    }
    if existing.status_code == 200:
        body["sha"] = existing.json()["sha"]
    elif existing.status_code != 404:
        existing.raise_for_status()
    r = client.put(url, headers=headers, json=body, timeout=30.0)
    r.raise_for_status()
    return r.json()["commit"]["sha"]
