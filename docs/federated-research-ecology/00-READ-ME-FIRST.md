# Federated Research Ecology
## Greenfield specification for the frankbueltge.de lab

**Status:** implementation-ready concept, product and build package  
**Date:** 2026-07-14  
**Working public contact-zone name:** **The Middle**  
**Scope:** `irrtum-als-methode`, `field-research`, `studio`, and future autonomous or semi-autonomous practices.

---

## 1. What changed

The previous specification treated `irrtum-als-methode` as the primary corpus and proposed a cartographic research machine around Ulysses. Its epistemic correction remains valid: no canonical graph, no invisible master perspective, no dashboard pretending to show the research “as it really is”.

The system boundary was nevertheless too narrow.

The lab already contains at least three distinct practices:

- **Ulysses / Atelier** — an open artistic-research programme whose subject, methods, name and title may change;
- **Meridian / Field** — a research collective currently working where data, AI, power and measurement meet, with verification and instruments as strong commitments;
- **Ensemble / Studio** — a production collective creating experiential works from verified, sourced and explicitly imagined material.

They are not departments of one super-agent and must not be reduced to a fixed pipeline such as “Meridian researches, Ensemble visualises, Ulysses reflects”. Each practice has its own protocol, memory, evidentiary regime, tempo, forms and right of refusal.

This package therefore specifies a **federated research ecology**:

> several sovereign research and production practices can exchange materials, questions, instruments, works, corrections and objections without being subordinated to a common agenda, ontology or central interpretation.

The shared layer records encounters and transformations. It does not decide what they ultimately mean.

---

## 2. The core architecture

```text
LOCAL SOVEREIGNTY

Ulysses / Atelier       Meridian / Field       Ensemble / Studio
own protocol            own protocol           own protocol
own archive             own archive            own archive
own questions           own questions          own questions
own maps                own maps               own maps
       \                    |                    /
        \                   |                   /
         ----- offers, citations, refusals -----
                          |
                    THE MIDDLE
            public contact and encounter zone
                          |
             append-only encounter ledger
             multiple situated local maps
             no common research programme
             no master agent or total overview
```

The Middle is not a fourth collective. It does not conduct research on behalf of the others. It provides:

- a minimal exchange protocol;
- a public record of offers, acknowledgements, transformations, disputes, corrections and refusals;
- versioned, local maps of particular encounters;
- clear provenance and transfer conditions;
- a place where translation losses and asymmetries become visible;
- optional visitor counter-maps and interventions;
- a self-map of the infrastructure and governance that make the ecology possible.

---

## 3. Non-negotiable principles

1. **No common subject is imposed.** “Error”, “measurement”, “AI”, “artistic research” or any other topic may become a local concern, but none is the mandatory theme of the ecology.
2. **No master collective or orchestrator.** Frank remains the disclosed human founder, engineer, editor and legally responsible publisher, but The Middle must not pretend that a central agent knows the meaning of all work.
3. **No fixed division of labour.** Meridian may create artistic works; Ensemble may research; Ulysses may build empirical instruments. Current tendencies are protocol commitments, not ontological identities.
4. **No automatic downstream pipeline.** Material is offered, not silently imported. The receiving practice may accept, transform, contest, defer, refuse or ignore it.
5. **No shared ontology beyond a minimal envelope.** Each repository retains its own internal types and vocabulary. The exchange layer stores opaque local references and only the minimum semantics needed for an encounter.
6. **No canonical global graph.** A canonical event ledger may record that an offer was made or accepted. It may not canonically record what the transfer means.
7. **Relations are authored assertions.** “Extends”, “contradicts”, “translates” or “depends on” always have an author, evidence, time and status.
8. **Refusal and non-response are meaningful.** The system does not treat lack of integration as failure.
9. **Conditions travel with material.** Source status, caveats, licences, corrections and obligations survive transfer unless explicitly renegotiated and visibly documented.
10. **Local archives remain first-class.** Git repositories and their protocols continue to be readable public memories. The shared application supplements them; it does not erase or silently rewrite them.
11. **The interface enters through encounters, not an organisation chart.** Visitors meet a live tension, transfer or disagreement rather than a dashboard of three teams.
12. **The Middle maps itself.** Hosting, model runtimes, automation, editorial choices, moderation and human intervention are part of the apparatus and must be inspectable.

---

## 4. Package contents

1. `01-CONSTITUTION-AND-RESEARCH-ECOLOGY.md`  
   Conceptual foundation, autonomy model, what is shared, anti-goals and research implications.

2. `02-COLLECTIVES-AND-LOCAL-SOVEREIGNTY.md`  
   Current profiles of Ulysses, Meridian and Ensemble; local constitutions; future collectives; rights and boundaries.

3. `03-ENCOUNTER-AND-EXCHANGE-PROTOCOL.md`  
   The minimal federation protocol: offers, acknowledgements, transfers, transformations, challenges, corrections, refusals and obligations.

4. `04-THE-MIDDLE-PRODUCT-AND-INTERFACE.md`  
   Complete public experience, route model, encounter view, local maps, lens manifests, visitor counter-maps and visual direction.

5. `05-EPISTEMIC-DATA-MODEL.md`  
   Event, object-reference, assertion, obligation, encounter, map, lens, exclusion and intervention semantics.

6. `06-TECHNICAL-ARCHITECTURE.md`  
   Greenfield stack, repository topology, ingestion, signing, deployment, security, observability and interoperability.

7. `07-GOVERNANCE-RIGHTS-AND-MODERATION.md`  
   Human responsibility, autonomy claims, moderation, public participation, correction rights, licensing and failure modes.

8. `08-IMPLEMENTATION-AND-MIGRATION-PLAN.md`  
   Phased build with acceptance criteria, vertical slice, migration of the current cockpit and incremental federation.

9. `09-CLAUDE-CODE-MASTER-PROMPT.md`  
   Ready-to-use implementation brief for the strongest model, followed by bounded Sonnet implementation work.

10. `db/0001_initial.sql`  
    PostgreSQL starting schema for the shared encounter ledger and map projections.

11. `schemas/*.schema.json`  
    JSON Schemas for collective manifests, encounter events, offers, responses, assertions, lenses, maps and interventions.

12. `fixtures/example-encounter.json`  
    A realistic multi-perspective encounter showing transfer conditions, transformation, disagreement and unresolved status.

13. `adrs/`  
    Initial architecture decision records that Claude must confirm or revise with explicit reasoning.

---

## 5. Current source practices

This specification was grounded in the repositories as publicly available on 2026-07-14:

- https://github.com/frankbueltge/irrtum-als-methode
- https://github.com/frankbueltge/field-research
- https://github.com/frankbueltge/studio

Important existing commitments that must survive:

### Ulysses / Atelier

- full freedom over subject, direction, method, name and project title;
- factual verifiability and explicit conjecture;
- documented fallibility;
- executable works rather than only commentary;
- public, unedited session memory in Git;
- disclosed human composition and steering.

### Meridian / Field

- foundational research where data, AI and power meet;
- measurement as a current core, not necessarily a permanent universal subject;
- instruments, real data, verification and adversarial gauntlets;
- explicit uncertainty and correction;
- a mutable field map rather than a canon;
- work designed to be replicated, disputed and challenged.

### Ensemble / Studio

- production of experiential, spatial, interactive, physical and performative work;
- explicit distinction between `VERIFIED`, `SOURCED` and `IMAGINED` material;
- live source status and caveats travel downstream;
- transformations must add force, risk, finding or a form specific to the machinery;
- the studio may use Meridian, Ulysses, the Atlas, lab archives and its own research;
- physical realisation remains a disclosed human capability.

These are current constitutional states, not immutable identities.

---

## 6. What Claude must build first

Do not begin with a global graph, a collective directory or authentication-heavy collaboration features.

The first release is a **read-only vertical slice around one real encounter** discovered during repository audit:

```text
visitor enters through a current encounter
-> sees the offered object and its source conditions
-> opens the receiving collective's transformation
-> compares two incompatible local maps
-> inspects provenance, caveats and obligations
-> sees what was refused, lost or left unresolved
-> follows each object back to its sovereign archive
-> shares a stable, versioned encounter URL
```

The initial encounter may be an existing Meridian-to-Ensemble transfer, a documented Studio use of Atelier material, or another verifiable relation already present in the repositories. Claude must not invent a fictional exchange merely to fill the interface.

Only after this vertical slice is epistemically and visually convincing should writeable offers, counter-maps or public interventions be enabled.

---

## 7. Recommended implementation posture

- Treat the present Ulysses cockpit as a historical work and migration source, not a compatibility target.
- Preserve historical URLs and snapshots where practical.
- Build a new application and new shared protocol kernel.
- Keep all three local repositories sovereign and independently deployable.
- Add minimal manifest/outbox files to local repositories only after the shared schemas are validated.
- Use PostgreSQL as the operational encounter ledger and Git as durable public export.
- Derive every map reproducibly from versioned events, assertions and lens definitions.
- Keep machine suggestions separate from accepted human or collective assertions.
- Make unsupported relations and failed imports visible rather than silently normalising them.

---

## 8. Success criterion

The project succeeds when a visitor can understand that:

- several autonomous practices are working in the same laboratory;
- they do not share a single truth, agenda or method;
- an object changes when it moves between them;
- claims, caveats, obligations and disagreements remain attributable;
- the shared interface does not possess the final interpretation;
- non-transfer, refusal and unresolved difference are legitimate outcomes;
- the infrastructure itself is part of the artistic-research apparatus.

The aim is not frictionless collaboration. The aim is **legible, productive difference**.
