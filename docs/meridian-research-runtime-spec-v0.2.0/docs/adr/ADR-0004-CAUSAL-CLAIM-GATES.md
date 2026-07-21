# ADR-0004 — Enforce causal claim ceilings

- Status: ACCEPTED
- Date: 2026-07-21

## Context

Agentic research systems can convert plausible association into causal rhetoric through confident synthesis. Statistical significance, model agreement, or repeated citations do not solve identification.

## Decision

Every causal branch must define an estimand, causal model, research design, and Identification Audit. The audit issues a machine-enforceable claim ceiling. The Claim Service rejects assertions above that ceiling.

A causal ceiling additionally requires all blocking diagnostics, a locked pre-analysis plan, falsification outcomes, and required replication status.

## Consequences

- A branch may answer a causal question with an associational, descriptive, or insufficient-evidence conclusion.
- Design labels do not confer causal status.
- Failed assumptions and kill conditions are authoritative method events.
- Publication projections must state the actual ceiling and generalization map.
