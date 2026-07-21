#!/usr/bin/env python3
"""Validate Meridian Research Runtime specification artefacts.

Checks:
- every JSON Schema is valid Draft 2020-12;
- every JSON example maps to and validates against its schema;
- every YAML task packet parses and contains the required task fields;
- expected acceptance feature files exist and are non-empty.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import yaml
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
from jsonschema.exceptions import SchemaError, ValidationError

ROOT = Path(__file__).resolve().parents[1]
SCHEMAS = ROOT / "schemas"
EXAMPLES = ROOT / "examples"
TASKS = ROOT / "task-packets"
ACCEPTANCE = ROOT / "acceptance"

KIND_TO_SCHEMA = {
    "ResearchScore": "research-score.schema.json",
    "NodeManifest": "node-manifest.schema.json",
    "TaskBundle": "task-bundle.schema.json",
    "Claim": "claim.schema.json",
    "EvidenceCrate": "evidence-crate.schema.json",
    "CorrectionEvent": "correction-event.schema.json",
    "MethodProfile": "method-profile.schema.json",
    "QuestionModel": "question-model.schema.json",
    "ConceptMeasurementCharter": "concept-measurement-charter.schema.json",
    "Estimand": "estimand.schema.json",
    "CausalModel": "causal-model.schema.json",
    "EvidenceMatrix": "evidence-matrix.schema.json",
    "DataAssetProfile": "data-asset-profile.schema.json",
    "ResearchDesign": "research-design.schema.json",
    "IdentificationAudit": "identification-audit.schema.json",
    "PreAnalysisPlan": "pre-analysis-plan.schema.json",
    "FalsificationPlan": "falsification-plan.schema.json",
    "ReplicationPlan": "replication-plan.schema.json",
    "GeneralizationMap": "generalization-map.schema.json",
    "ResearchDecision": "research-decision.schema.json",
}

REQUIRED_TASK_FIELDS = {
    "task_id",
    "title",
    "status",
    "objective",
    "source_of_truth",
    "requirements",
    "allowed_paths",
    "forbidden_changes",
    "invariants",
    "acceptance_tests",
    "required_output",
    "stop_conditions",
}

EXPECTED_FEATURES = {
    "method-causal-claim-gate.feature",
    "method-preanalysis-lock.feature",
    "method-kill-condition-propagation.feature",
    "method-synthetic-fixture-isolation.feature",
}


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValueError(f"{path}: root must be a JSON object")
    return value


def format_path(error: ValidationError) -> str:
    suffix = ".".join(str(part) for part in error.absolute_path)
    return suffix or "<root>"


def validate_schemas() -> dict[str, dict[str, Any]]:
    loaded: dict[str, dict[str, Any]] = {}
    for path in sorted(SCHEMAS.glob("*.schema.json")):
        schema = load_json(path)
        try:
            Draft202012Validator.check_schema(schema)
        except SchemaError as exc:
            raise RuntimeError(f"Invalid schema {path.name}: {exc.message}") from exc
        loaded[path.name] = schema
    return loaded


def validate_examples(schemas: dict[str, dict[str, Any]]) -> int:
    count = 0
    base_uri = SCHEMAS.resolve().as_uri() + "/"
    registry = Registry()
    for name, loaded_schema in schemas.items():
        resource = Resource.from_contents(loaded_schema, default_specification=DRAFT202012)
        schema_id = loaded_schema.get("$id")
        if isinstance(schema_id, str):
            registry = registry.with_resource(schema_id, resource)
        registry = registry.with_resource(base_uri + name, resource)
    for path in sorted(EXAMPLES.rglob("*.json")):
        instance = load_json(path)
        kind = instance.get("kind")
        schema_name = KIND_TO_SCHEMA.get(kind)
        if schema_name is None:
            raise RuntimeError(f"{path}: no schema mapping for kind {kind!r}")
        schema = schemas.get(schema_name)
        if schema is None:
            raise RuntimeError(f"{path}: mapped schema {schema_name} does not exist")
        validator = Draft202012Validator(
            schema,
            registry=registry,
            format_checker=FormatChecker(),
        )
        errors = sorted(validator.iter_errors(instance), key=lambda e: list(e.absolute_path))
        if errors:
            details = "\n".join(
                f"  - {format_path(error)}: {error.message}" for error in errors
            )
            raise RuntimeError(f"Example validation failed: {path}\n{details}")
        count += 1
    return count


def validate_tasks() -> int:
    count = 0
    ids: set[str] = set()
    for path in sorted(TASKS.glob("*.yaml")):
        with path.open("r", encoding="utf-8") as handle:
            value = yaml.safe_load(handle)
        if not isinstance(value, dict):
            raise RuntimeError(f"{path}: task packet root must be a mapping")
        missing = sorted(REQUIRED_TASK_FIELDS - set(value))
        if missing:
            raise RuntimeError(f"{path}: missing fields {missing}")
        task_id = value["task_id"]
        if not isinstance(task_id, str) or not task_id:
            raise RuntimeError(f"{path}: invalid task_id")
        if task_id in ids:
            raise RuntimeError(f"Duplicate task_id {task_id}")
        ids.add(task_id)
        for field in (
            "source_of_truth",
            "requirements",
            "allowed_paths",
            "forbidden_changes",
            "invariants",
            "acceptance_tests",
            "required_output",
            "stop_conditions",
        ):
            if not isinstance(value[field], list):
                raise RuntimeError(f"{path}: {field} must be a list")
        count += 1
    return count


def validate_acceptance_features() -> int:
    present = {path.name for path in ACCEPTANCE.glob("*.feature")}
    missing = EXPECTED_FEATURES - present
    if missing:
        raise RuntimeError(f"Missing acceptance features: {sorted(missing)}")
    for name in EXPECTED_FEATURES:
        text = (ACCEPTANCE / name).read_text(encoding="utf-8").strip()
        if "Feature:" not in text or "Scenario:" not in text:
            raise RuntimeError(f"{name}: missing Feature or Scenario declaration")
    return len(present)


def main() -> int:
    try:
        schemas = validate_schemas()
        example_count = validate_examples(schemas)
        task_count = validate_tasks()
        feature_count = validate_acceptance_features()
    except Exception as exc:  # validation CLI intentionally reports a single clear failure
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    print(f"OK schemas={len(schemas)} examples={example_count} tasks={task_count} features={feature_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
