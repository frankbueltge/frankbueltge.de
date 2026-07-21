# ADR-0002: Seal a baseline and operate Meridian Classic in parallel

- Status: Accepted for specification v0.1.1
- Decision date: 2026-07-17
- Supersedes: the operational meaning of “frozen” in ADR-0001

## Context

ADR-0001 correctly separated the new evidence-first runtime from an in-place rewrite, but its statement that Meridian Classic would be “frozen” is operationally ambiguous. It can be read as stopping a still-useful practice, prohibiting further improvement, or predetermining MRR as its replacement. None of those consequences is required to preserve provenance.

A research system should be evaluated empirically. Meridian Classic can continue to produce useful work, reveal weaknesses in MRR, act as a challenger or fallback, and absorb improvements from the new runtime. At the same time, comparison requires an immutable reference point and exact attribution of all later changes.

## Decision

1. Seal a content-addressed Meridian Classic baseline as an immutable historical and comparative reference.
2. Keep the operational Meridian Classic system available to run and evolve under versioned configurations and policies.
3. Develop MRR as a separate practice, initially in shadow, challenger, and selected dual-run modes.
4. Do not define an automatic sunset, global cutover, or one-way migration.
5. Evaluate and adopt capabilities individually using exact system attribution, predefined rubrics, comparable resource envelopes where practical, and blinded output review where practical.
6. Permit outcomes in either direction: promote MRR, retain Classic, combine components, continue dual operation, or remain inconclusive.
7. Permit Meridian Classic to remain indefinitely as a production, challenger, red-team, replication, or fallback practice.
8. Continue to classify imported Classic research objects as `legacy_unverified` until they satisfy MRR evidence and verification contracts.

## Consequences

Positive:

- preserves a live control and challenger system;
- avoids premature replacement driven by architectural enthusiasm;
- enables empirical, capability-level decisions;
- supports bidirectional learning and reversible adoption;
- distinguishes immutable history from mutable ongoing operation.

Negative:

- parallel operation consumes additional compute and review effort;
- exact version and configuration tracking becomes mandatory;
- comparison design must account for unequal tools, data rights, and maturity;
- users must understand when outputs come from Classic, MRR, or a combined workflow.

## Rejected alternatives

### Freeze all Meridian Classic operation

Rejected because provenance can be preserved by sealing a baseline without stopping useful work or experimentation.

### Rewrite Meridian Classic in place

Still rejected because it would blur semantic and historical boundaries and make rollback and comparison harder.

### Predetermine a sunset date

Rejected because retirement should follow evidence about concrete task classes and capabilities, not a calendar commitment.

### Duplicate every task permanently

Rejected because full duplication is unnecessarily expensive. Parallel execution is selected for benchmarks, consequential tasks, changed capabilities, and representative samples; challenger and exploratory modes reduce duplication elsewhere.
