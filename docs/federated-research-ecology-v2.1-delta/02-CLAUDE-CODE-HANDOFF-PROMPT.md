# Claude Code handoff — Federated Research Ecology v2.1 delta

The Federated Research Ecology v2 implementation is now the working baseline. Do not discard it, restart the product, or replace stable architecture merely because a new conceptual refinement has been introduced.

Read completely:

- `00-ENTSCHEIDUNGSZUSAMMENFASSUNG.md`
- `01-FEDERATED-ECOLOGY-V2.1-IMPLEMENTATION-DELTA.md`

Also re-read the approved v2 documents governing:

- local sovereignty;
- The Middle;
- the epistemic data model;
- cockpit migration;
- the accepted ADRs and current implementation plan.

## Context

The v2 federation correctly de-centred Ulysses and implemented The Middle as a cross-practice contact zone. However, the original Cartographic Research Machine effort began as a redesign of the Ulysses experiment and cockpit.

The v2 specification preserved and reclassified the old cockpit, but it did not fully define a new sovereign Atelier product surface for Ulysses.

The new amendment also sharpens the practices through versioned, non-exclusive primary commitments:

- Meridian: scientific evidence, method and contestability;
- Ulysses: philosophical-artistic problematisation and experimentation;
- Ensemble: artistic form, material consequence and public encounter.

These are not departments and must not become a fixed pipeline.

## First task: delta audit only

Before editing broad product code, produce:

1. a concise map of what v2 has actually implemented;
2. the current treatment of Ulysses, the old cockpit, local maps and practice profiles;
3. the exact gaps against the v2.1 amendment;
4. a list of reusable components and stable contracts;
5. proposed schema additions or type extensions;
6. proposed ADR amendments or new ADRs;
7. a migration plan that preserves existing data and public URLs;
8. the smallest complete Atelier vertical slice;
9. risks of accidentally recentralising the federation;
10. changes that should explicitly not be made.

Do not implement until the delta audit is presented, except for disposable probes or tests required to verify the current architecture.

## Non-negotiable constraints

1. Do not rebuild the federation from scratch.
2. Do not merge Atelier and The Middle into one dashboard.
3. The Middle remains encounter-first and cross-practice.
4. Atelier becomes Ulysses' distinct local philosophical-artistic research surface.
5. Preserve the old cockpit as a historical artefact.
6. Do not restore closure as a global or primary metric.
7. Do not assign Meridian=order, Ulysses=chaos or Ensemble=chance.
8. Do not create a global order/chaos/chance score.
9. Practice orientations are versioned self-descriptions, not permanent ontology classes.
10. Do not encode `Meridian researches -> Ulysses thinks -> Ensemble makes`.
11. The Studio is not a design service; transduction must allow the problem and object to change.
12. Use only real repository material for production constellations and encounters.
13. Every interpretive relation requires authorship, provenance and status.
14. Unknown relation types remain visible and are never silently dropped.
15. Stable existing tests, APIs and routes should be extended rather than rewritten where possible.

## Proposed first implementation after approval

Implement one real Ulysses Atelier vertical slice:

```text
current problematic
-> bounded authored map
-> inspect a concept or assertion and its evidence
-> inspect the associated artistic operation or work
-> switch to provenance lens
-> switch to apparatus lens
-> show exclusions and counter-readings
-> open a documented external encounter in The Middle
-> return to the sovereign Ulysses archive
```

The result must not look or behave like:

- the historical cockpit;
- a generic graph browser;
- a lab dashboard;
- a reskinned encounter page from The Middle.

## Review questions

Before proposing completion, answer:

- Is Ulysses now visible as a philosophical-artistic practice rather than only a participant in federation events?
- Can a visitor understand how a problem changed through a work or operation?
- Are Frank, protocols, models and infrastructure visible where relevant?
- Can external material alter Ulysses' local map without becoming automatically canonical?
- Are Atelier and The Middle clearly different but traversable?
- Are Meridian, Ulysses and Ensemble differentiated by accountability rather than rigid roles?
- Does the implementation preserve unresolved differences instead of generating synthesis?
- Has any old cockpit claim been silently reclassified as truth?

Present the delta audit and await architectural approval before broad implementation.
