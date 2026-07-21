# ADR 0004 — SvelteKit and multiple renderer strategy

**Status:** proposed; Claude may replace through a reasoned ADR.

## Context

The public product combines editorial SSR, accessible records and highly interactive encounter maps. One graph renderer cannot express provenance, transformation, obligation, refusal and apparatus equally well.

## Decision

Use SvelteKit/TypeScript for the web application. Implement a renderer registry including event chains, object lineages, parallel positions, obligation matrices and bounded graph constellations. Sigma/Graphology are optional for the last category only.

## Consequences

- more intentional visual engineering;
- no default graph aesthetic;
- core records remain readable without JavaScript;
- each lens declares its renderer and unsupported types.
