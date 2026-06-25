"""Curated dataset registry. Real public series + labelled synthetic controls,
all committed (Git = archive)."""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Dataset:
    id: str
    name: str
    institution: str
    synthetic: bool
    source: dict
    values: list[float]


def load_file(path: Path) -> Dataset:
    raw = json.loads(path.read_text(encoding="utf-8"))
    return Dataset(
        id=raw["id"],
        name=raw["name"],
        institution=raw["institution"],
        synthetic=bool(raw.get("synthetic", False)),
        source=raw["source"],
        values=[float(v) for v in raw["values"]],
    )


def load_all(data_dir: Path) -> list[Dataset]:
    return [load_file(p) for p in sorted(data_dir.glob("*.json"))]
