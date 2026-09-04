"""The source contract: one function per platform, isolated, honest about failure."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import date
from typing import Any

import httpx

from trending.model import Signal


@dataclass
class Context:
    client: httpx.Client
    today: date
    rules: dict[str, Any]
    archive: list[dict[str, Any]] = field(default_factory=list)  # earlier day records, oldest first
    stoplist: frozenset[str] = frozenset()


@dataclass
class SourceResult:
    signals: list[Signal]
    as_of: str | None = None
    notes: list[str] = field(default_factory=list)  # partial failures, one line each


@dataclass(frozen=True)
class SourceSpec:
    id: str
    name: str
    url: str
    licence: str
    fetch: Callable[[Context], SourceResult]
    optional: bool = False
    # The platform behind the source when several sources read one platform (GitHub's new
    # repositories and its trending page). None means the id is the platform. The convergence
    # rule and the discovery corpus count platforms, not sources — see `platform_of`.
    platform: str | None = None
