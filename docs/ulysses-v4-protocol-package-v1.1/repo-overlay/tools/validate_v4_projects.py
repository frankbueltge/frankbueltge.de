#!/usr/bin/env python3
"""Structural checks for Ulysses Protocol v4 project records.

This script validates mandate metadata and publication boundaries. It does not
approve artistic quality, rights, ethics, mandate amendments or publication.
"""
from __future__ import annotations
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ROOT / "projects"
ALLOWED_STATUS = {"PROPOSED", "ACTIVE", "PUBLICATION_CANDIDATE", "QUARANTINED", "CLOSED"}
ALLOWED_DISPOSITION = {"", "PUBLICATION_CANDIDATE", "PUBLISH", "REVISE_ONCE", "DECLINE_PUBLICATION", "ARCHIVE_AS_STUDY", "KILL", "ESCALATE"}
ALLOWED_MANDATE_CHECK = {"PENDING", "PASS", "ESCALATE"}


def frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"\A---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if not match:
        raise ValueError("missing Markdown frontmatter")
    values: dict[str, str] = {}
    for raw_line in match.group(1).splitlines():
        if raw_line.startswith((" ", "\t")) or ":" not in raw_line:
            continue
        key, value = raw_line.split(":", 1)
        values[key.strip()] = value.strip().strip("\"'")
    return values


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def validate_project(project_dir: Path) -> list[str]:
    errors: list[str] = []
    score = project_dir / "SCORE.md"
    require(score.exists(), f"{project_dir.name}: missing SCORE.md", errors)
    if not score.exists():
        return errors
    try:
        meta = frontmatter(score)
    except ValueError as exc:
        return [f"{project_dir.name}/SCORE.md: {exc}"]

    require(meta.get("project_id") == project_dir.name, f"{project_dir.name}: project_id must match directory name", errors)
    require(meta.get("protocol_version") == "4", f"{project_dir.name}: protocol_version must be 4", errors)
    require(bool(meta.get("responsible_human")), f"{project_dir.name}: responsible_human is required", errors)
    require(bool(meta.get("initiated_by")), f"{project_dir.name}: initiated_by is required", errors)
    require(bool(meta.get("standing_delegation_version")), f"{project_dir.name}: standing_delegation_version is required", errors)

    status = meta.get("status", "")
    disposition = meta.get("disposition", "")
    mandate_check = meta.get("mandate_check", "")
    require(status in ALLOWED_STATUS, f"{project_dir.name}: invalid status {status!r}", errors)
    require(disposition in ALLOWED_DISPOSITION, f"{project_dir.name}: invalid disposition {disposition!r}", errors)
    require(mandate_check in ALLOWED_MANDATE_CHECK, f"{project_dir.name}: invalid mandate_check {mandate_check!r}", errors)

    if disposition:
        require((project_dir / "DECISION.md").exists(), f"{project_dir.name}: disposition requires DECISION.md", errors)

    if disposition == "PUBLICATION_CANDIDATE":
        for required_file in ("APPARATUS.md", "EXPOSITION.md"):
            require((project_dir / required_file).exists(), f"{project_dir.name}: publication candidate requires {required_file}", errors)

    if disposition == "PUBLISH":
        for required_file in ("APPARATUS.md", "EXPOSITION.md", "DECISION.md", "PUBLICATION.json"):
            require((project_dir / required_file).exists(), f"{project_dir.name}: PUBLISH requires {required_file}", errors)
        require(bool(meta.get("publication_approved_by")), f"{project_dir.name}: PUBLISH requires publication_approved_by", errors)
        require(bool(meta.get("publication_approved_at")), f"{project_dir.name}: PUBLISH requires publication_approved_at", errors)
        publication_path = project_dir / "PUBLICATION.json"
        if publication_path.exists():
            try:
                publication = json.loads(publication_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError as exc:
                errors.append(f"{project_dir.name}/PUBLICATION.json: invalid JSON: {exc}")
            else:
                require(publication.get("project_id") == project_dir.name, f"{project_dir.name}: PUBLICATION.json project_id mismatch", errors)
                require(publication.get("status") == "PUBLISHED_WORK", f"{project_dir.name}: PUBLICATION.json status must be PUBLISHED_WORK", errors)
                require(publication.get("approved_by") == meta.get("publication_approved_by"), f"{project_dir.name}: publication approver mismatch", errors)
                require(bool(publication.get("approved_at")), f"{project_dir.name}: PUBLICATION.json approved_at required", errors)

    if disposition != "PUBLISH":
        require(not (project_dir / "PUBLICATION.json").exists(), f"{project_dir.name}: PUBLICATION.json is allowed only for PUBLISH", errors)

    if mandate_check == "ESCALATE":
        require(status == "QUARANTINED" or disposition == "ESCALATE", f"{project_dir.name}: mandate escalation must be quarantined or have ESCALATE disposition", errors)

    return errors


def main() -> int:
    if not PROJECTS.exists():
        print("No projects directory; nothing to validate.")
        return 0
    errors: list[str] = []
    for project_dir in sorted(PROJECTS.iterdir()):
        if not project_dir.is_dir() or project_dir.name.startswith("_"):
            continue
        errors.extend(validate_project(project_dir))
    if errors:
        print("Ulysses v4 project validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print("Ulysses v4 project records are structurally valid.")
    print("This check does not constitute publication or mandate amendment approval.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
