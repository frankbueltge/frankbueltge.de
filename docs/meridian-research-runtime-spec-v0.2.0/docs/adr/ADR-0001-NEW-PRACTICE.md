# ADR-0001: Create Meridian Research Runtime as a new practice

- Status: Accepted for specification v0.1; operational treatment of Meridian Classic superseded by ADR-0002 in v0.1.1
- Decision date: 2026-07-17

> Amendment note: In specification v0.1.1, “frozen” below applies only to the sealed content-addressed baseline. The live Meridian Classic system continues to operate and may evolve under ADR-0002.

## Context

The conceptual move from a narrative-oriented research agent to a federated, evidence-first research runtime changes the system's primary object, authority boundaries, data model, verification model, and correction behavior. An in-place rewrite would blur historical provenance, make rollback difficult, and encourage accidental compatibility with assumptions that should be reconsidered.

## Decision

Create a new practice and implementation named `Meridian Research Runtime`.

The existing system becomes `meridian-classic` and is frozen as:

- an immutable historical record;
- a corpus for migration experiments;
- a source of benchmark cases, including failures and corrections;
- a source of reusable code only after explicit review.

No legacy artifact is imported as verified truth. Imported objects receive `legacy_unverified` status until mapped, anchored, and reviewed under MRR contracts.

## Consequences

Positive:

- clean domain model and security boundary;
- honest historical traceability;
- safe rollback and side-by-side comparison;
- measurable migration rather than faith-based replacement;
- freedom to amend prior constitutional choices.

Negative:

- temporary duplication;
- migration tooling is required;
- users must understand two systems during transition.

## Rejected alternatives

### Rewrite Meridian in place

Rejected because it erases distinctions between old and new semantics and makes audit history ambiguous.

### Preserve every previous constitutional constraint

Rejected because the system's purpose is research quality, not loyalty to obsolete design decisions. Only provenance, explicit obligations, legal requirements, and ethical commitments are durable constraints.
