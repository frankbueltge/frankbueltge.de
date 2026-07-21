# ADR-0003 — Add a Research Method Kernel

- Status: ACCEPTED
- Date: 2026-07-21

## Context

MRR v0.1.1 defines governance, execution, evidence, claims, verification, federation, and correction. It does not fully define how an open question is transformed into operational concepts, estimands, causal models, research designs, pre-analysis commitments, falsification, replication, and adaptive next steps.

Without a method layer, the system risks becoming an excellent ledger around under-specified research behavior.

## Decision

Add a Research Method Kernel hosted by MRR. The kernel uses local, versioned Method Profiles and produces explicit method objects before analysis tasks can execute.

The first complete profile is `causal_observational`.

## Consequences

- The v0.1.1 governance and evidence architecture remains required.
- Raw questions cannot directly generate analysis tasks.
- Causal claims receive method-specific gates.
- Additional schemas, APIs, events, benchmarks, and task packets are required.
- A deterministic synthetic reference project precedes real autonomous research.
- Method profiles remain local and forkable; no global scientific ontology is introduced.
