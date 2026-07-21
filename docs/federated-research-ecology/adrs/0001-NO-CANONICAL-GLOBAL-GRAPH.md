# ADR 0001 — No canonical global graph

**Status:** proposed; Claude must confirm after audit.

## Context

The lab contains heterogeneous local practices and authored relations. A central graph would make interpretive edges appear factual and would privilege one ontology.

## Decision

Store operational events, local object references and authored assertions in PostgreSQL. Generate bounded graph projections only through versioned lenses. Do not expose a canonical global edge list or a “show all” interface.

## Consequences

- additional work is required to build projections;
- relations remain attributable and contestable;
- multiple render forms can coexist;
- global network analytics are not first-class product features;
- unknown relations can remain visible as ruptures.
