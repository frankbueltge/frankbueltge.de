"""Editorially maintained constants shipped with the package (stoplists, rules)."""
from __future__ import annotations

import json
from importlib.resources import files
from typing import Any


def load_json(name: str) -> Any:
    return json.loads((files("trending") / "data" / name).read_text(encoding="utf-8"))
