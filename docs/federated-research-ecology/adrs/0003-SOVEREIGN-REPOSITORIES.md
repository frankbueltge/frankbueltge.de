# ADR 0003 — Sovereign repositories and adapter boundary

**Status:** proposed; Claude must confirm after audit.

## Context

Atelier, Field and Studio already possess distinct protocols, archives and automations. Moving them into one database or monorepo would erase meaningful differences and create a master system.

## Decision

Keep local repositories independently authoritative and deployable. The Middle imports versioned public records through adapters and later through minimal manifests/outboxes. It never silently writes local research state.

## Consequences

- adapters must preserve local vocabularies and ambiguity;
- corrections and source updates require propagation;
- temporary inconsistency is accepted;
- leaving the federation does not destroy local archives.
