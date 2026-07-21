# ADR 0002 — PostgreSQL event/assertion model

**Status:** proposed; Claude must confirm after audit.

## Context

The shared layer needs append-only events, open payloads, versioned manifests, obligations and deterministic map projections. A graph database would encourage direct edge ontology and adds operational complexity.

## Decision

Use PostgreSQL as operational source of truth. Keep events, assertions, obligations, local references, lenses and maps separate. Use JSONB for open vocabularies. A graph library may consume disposable projections.

## Consequences

- clear provenance and transactional correction workflows;
- ordinary backups and managed deployment;
- recursive queries are sufficient at expected scale;
- semantic search remains optional and non-authoritative.
