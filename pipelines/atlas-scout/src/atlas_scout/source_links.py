"""The link guard, on the writing side of the record.

Why this exists (2026-08-19). The site carries a guard against linking to unlicensed
copies (`src/lib/record/source-links.ts`): hosts already found holding another author's
text, and paths that say "teaching copy" whatever the host. It reads the record and fails
the build when it finds one. It cannot, however, stop anything being written — and this
catalogue is written every night, out of the practices' own citations, whose atlases still
carry addresses a sweep removed from the site.

On the night of 2026-08-18 the sweep cleared twenty-seven such links. At 05:30 UTC the
next morning this builder put three of them back, because a citation in a practice atlas
is a source and the builder copies sources faithfully. `main` went red, and with it every
deploy and every open pull request, until the builder learned the same list.

The rule both sides encode: a source's bytes may be linked where the host is the
rightsholder, the author, or a repository holding it by deposit — otherwise the work is
cited and not linked. Dropping an address does not drop the entry: title, creators, year
and identifier stay, and a reader who wants the bytes pays one search for them.

Scope is deliberately the same as the site guard's: addresses that point at a PDF, which
is where the bytes of somebody else's text actually travel. Stricter here than there would
mean the record refuses what the guard clears — two lists again, in a new disguise.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, replace
from pathlib import Path

#: Where the shared list lives, relative to the repository root.
DENYLIST = Path("src/data/source-link-denylist.json")
#: What a person cleared by hand, with a written reason. Same file the site reads.
ALLOWLIST = Path("src/data/source-link-allowlist.json")

_PDF_LINK = re.compile(r"^https?://\S*\.pdf", re.IGNORECASE)


@dataclass(frozen=True)
class LinkGuard:
    """The two things a machine can see, plus what a person has cleared by hand."""

    hosts: frozenset[str]
    teaching_paths: re.Pattern[str]
    cleared: frozenset[str]

    def refuses(self, url: str | None) -> bool:
        """True where this address may not be linked from the published record."""
        if not url or not _PDF_LINK.match(url) or url in self.cleared:
            return False
        host = url.split("://", 1)[1].split("/")[0].lower()
        return host in self.hosts or bool(self.teaching_paths.search(url))


def read_guard(root: Path) -> LinkGuard:
    """Read the list the site's guard reads. One list, two readers, no drift.

    A missing list is not silently a permissive guard: the caller gets the exception. A
    builder that cannot find the list must stop rather than write the record without it.
    """
    raw = json.loads((root / DENYLIST).read_text(encoding="utf-8"))
    segments = "|".join(raw["teachingPathSegments"])
    cleared: set[str] = set()
    allow_path = root / ALLOWLIST
    if allow_path.is_file():
        allow = json.loads(allow_path.read_text(encoding="utf-8"))
        cleared = {entry["url"] for entry in allow.get("cleared", [])}
    return LinkGuard(
        hosts=frozenset(h.lower() for h in raw["hosts"]),
        teaching_paths=re.compile(rf"/({segments})/", re.IGNORECASE),
        cleared=frozenset(cleared),
    )


@dataclass(frozen=True)
class GuardResult:
    """What the guard did to a build, in the shape a run can print and a test can read."""

    entries: list
    removed_addresses: tuple[str, ...]
    held_back: tuple[tuple[str, str], ...]  # (entry id, refused identifier)


def strip_refused_links(entries: list, guard: LinkGuard) -> GuardResult:
    """Strip every refused address from the catalogue before it is written.

    Two fields can carry one: `url`, and `weitere_kennungen` — which is where the three
    links of 2026-08-19 arrived. Both are dropped and reported; the entry itself stays,
    because a citation without an address is exactly what the rule asks for.

    `kennung` is the one field that cannot simply be emptied: it is the entry's identity,
    the key it is merged, judged and kept out by. Where a source carries no DOI the
    builder falls back to the address, so an identity CAN be a refused address — no entry
    in the catalogue is one today, and the honest handling if one ever appears is to hold
    the entry back and say so by name, never to publish the link because it happens to sit
    in the identifying field.
    """
    removed: list[str] = []
    held: list[tuple[str, str]] = []
    out: list = []
    for entry in entries:
        if guard.refuses(entry.kennung):
            held.append((entry.id, entry.kennung))
            continue
        changes: dict[str, object] = {}
        if guard.refuses(entry.url):
            removed.append(entry.url)
            changes["url"] = ""
        kept = tuple(k for k in entry.weitere_kennungen if not guard.refuses(k))
        if len(kept) != len(entry.weitere_kennungen):
            removed.extend(k for k in entry.weitere_kennungen if guard.refuses(k))
            changes["weitere_kennungen"] = kept
        out.append(replace(entry, **changes) if changes else entry)
    return GuardResult(out, tuple(removed), tuple(held))
