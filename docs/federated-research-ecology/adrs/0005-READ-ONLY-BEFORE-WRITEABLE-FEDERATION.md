# ADR 0005 — Read-only adapters before writeable federation

**Status:** proposed.

## Context

The repositories do not yet implement a common exchange protocol. Starting with inboxes, signatures and public participation would obscure whether the encounter interface itself produces insight.

## Decision

First audit and import existing public records read-only. Build one real encounter vertical slice. Add local manifests, signed outboxes, bilateral write flows and visitor interventions only after conceptual and visual approval.

## Consequences

- the first release can use current repositories without invasive changes;
- real data shapes the protocol;
- security and governance complexity is deferred;
- no fictional exchange is created to demonstrate features.
