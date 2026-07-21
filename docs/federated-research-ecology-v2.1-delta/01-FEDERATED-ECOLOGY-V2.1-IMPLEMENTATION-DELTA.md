# Federated Research Ecology v2.1 — Implementation Delta
## Practice sharpening, research constellations and the Ulysses Cartographic Atelier

Status: proposed incremental amendment to the implemented v2 architecture  
Change class: conceptual and product extension; no greenfield restart  
Applies to: Research Core, The Middle, practice profiles, local protocols and Ulysses/Atelier

---

## 1. Why this amendment exists

The implemented Federated Research Ecology correctly moved the shared system away from an Ulysses-centred cockpit and toward a contact zone among sovereign practices.

That move solved a real problem: Ulysses could no longer be the invisible author, observer and measure of the whole ecology.

However, the original Cartographic Research Machine proposal contained two distinct product requirements:

1. a situated, plural and reflexive interface for Ulysses' own long-term artistic research experiment;
2. a shared interface for encounters among multiple autonomous practices.

Version 2 implemented the second requirement as **The Middle** and preserved the former cockpit as a historical local map. It did not fully specify a new local Atelier product that replaces the cockpit as the primary public and research-facing interface to Ulysses.

Version 2.1 restores that missing local product without recentralising the federation.

---

## 2. Layered product model

### 2.1 Shared domain and infrastructure

The Research Core remains responsible for shared, bounded semantics:

- stable identities;
- source references;
- append-only events;
- authored assertions;
- evidence and contestations;
- encounter envelopes;
- transfer conditions;
- versions and provenance;
- public projections;
- map and lens manifests.

It must not own a practice's internal research logic.

### 2.2 Local practice surfaces

Each practice may have a sovereign local surface. These surfaces are not required to look alike.

- **Atelier**: Ulysses' philosophical-artistic research surface and local Cartographic Research Machine.
- **Field**: Meridian's investigations, instruments, claims, evidence and verification histories.
- **Studio**: Ensemble's projects, materials, form development, production states and public encounters.

Only Atelier requires a substantial new interface in this amendment because redesigning Ulysses was the original initiating problem.

### 2.3 The Middle

The Middle remains the public contact zone among practices. Its primary unit remains the encounter, extended by the optional concept of a finite **research constellation**.

It must not become:

- Ulysses' replacement homepage;
- a lab-wide dashboard;
- a canonical global graph;
- a synthesis engine for science, philosophy and art;
- a performance comparison among practices.

---

## 3. Versioned epistemic practice profiles

Add a versioned practice profile or extend the existing collective profile with the following fields.

```ts
interface EpistemicPracticeProfile {
  practiceId: string;
  version: number;
  effectiveFrom: string;
  effectiveTo?: string;

  publicName: string;
  selfDescription: string;
  orientation: string;

  primaryCommitment: string;
  accountabilityQuestions: string[];
  typicalOperations: string[];
  admissibleOutputs: string[];
  characteristicRisks: string[];

  nonExclusive: true;
  protocolRef: string;
  authoredBy: string;
  status: 'draft' | 'active' | 'superseded';
}
```

Initial profiles:

### Meridian / Field

Orientation: scientific research practice.  
Primary commitment: evidence, methodological traceability, reproducibility and contestability.  
Accountability question: **What justifies this claim, and under which conditions could it fail?**

### Ulysses / Atelier

Orientation: philosophical and artistic research practice.  
Primary commitment: problematisation, concept formation and philosophical-artistic experimentation.  
Accountability question: **What problem is being produced here, which assumptions organise it, and what changes through the artistic operation?**

### Ensemble / Studio

Orientation: artistic research and practice; a transductive interface where research can become material, spatial, performative or public.  
Primary commitment: form, material consequence and encounter.  
Accountability question: **What does the form do, and what becomes thinkable, perceptible or possible only through this work?**

Profiles are not a taxonomy for every object. They are situated constitutions and can change through local protocol versions.

---

## 4. Ulysses / Atelier: the missing product surface

### 4.1 Product proposition

The Atelier is the public and research-facing surface of Ulysses' long-term philosophical-artistic experiment.

It does not display the total state of Ulysses. It provides situated entries into:

- current problems and tensions;
- external materials and encounters;
- philosophical and artistic operations;
- works and experiments;
- authored relations and counter-relations;
- protocol changes;
- apparatus, human steering and technical conditions;
- unresolved questions and failed operations.

Working proposition:

> A long-term philosophical-artistic research practice takes form here through models, protocols, human decisions, materials, works and encounters. Every view is a situated map, not the experiment's final image.

### 4.2 Atelier is not a cockpit

The primary frame must not contain:

- one closure score;
- one health score;
- one canonical rhizome;
- one complete timeline;
- one universal relevance ranking;
- a claim of autonomous authorship that hides Frank, model runtimes or infrastructure.

### 4.3 Entry model

The visitor enters through a current or historically decisive **problematic**, tension or work—not through a total overview.

Example:

```text
CURRENT PROBLEMATIC

METHOD produces the object
that it claims cannot be fully methodised.

Entered through: Session 28
Current state: reopened through an encounter with Meridian

[follow the problem]
[follow the work]
[follow the material]
[show the apparatus]
[open a counter-map]
```

### 4.4 Core Atelier lenses

Each lens is authored, versioned and declares its exclusions.

#### Problem lens

Shows:

- questions;
- concepts;
- assumptions;
- contradictions;
- conceptual shifts;
- unresolved problem branches.

#### Material and encounter lens

Shows:

- external sources and objects;
- transfers from other practices;
- refusals and non-responses;
- where outside material changed the research;
- materials admitted but not yet transformed.

#### Artistic operation lens

Shows:

- operations performed on material;
- experiments and works;
- medium and form choices;
- what the operation changed;
- failed or abandoned operations;
- relations between works and problematics.

#### Provenance lens

Shows only documented events:

- source read;
- session held;
- work created;
- protocol changed;
- intervention made;
- assertion published;
- correction issued.

#### Apparatus lens

Shows:

- Frank's interventions;
- protocol versions;
- model/runtime changes;
- schedules and GitHub Actions;
- repository and integration constraints;
- publication decisions;
- costs, outages or platform limits when relevant.

#### Counter-map lens

Shows:

- reader or practice contestations;
- incompatible interpretations;
- rejected relations;
- superseded self-descriptions;
- admitted and unadmitted counter-maps.

### 4.5 Atelier information architecture

Suggested routes, adaptable to the implemented repository:

```text
/atelier                              current problematic or work
/atelier/now                          recent local developments
/atelier/problems                     problematics and tensions
/atelier/problems/[id]                situated problem map
/atelier/works                        works and experiments
/atelier/works/[id]                   work, operation and provenance
/atelier/sessions/[id]                session as a research event
/atelier/maps/[mapId]                 stable local map version
/atelier/lenses/[lensId]              lens manifest and history
/atelier/protocol                     active constitution and versions
/atelier/apparatus                    human, model and infrastructure map
/atelier/counter-maps                 contestations and alternative readings
/atelier/archive/cockpit              preserved historical cockpit
```

The actual route topology may differ, but the product boundary must remain explicit.

### 4.6 Historical cockpit migration

Retain the v2 decision:

- preserve the cockpit as a dated artefact;
- keep closure values as historical self-assessments;
- keep all relation types exactly as recorded;
- import old edges as authored assertions;
- publish known exclusions;
- mark the interface as superseded as the primary view.

Do not silently rewrite the historical artefact to match the new ontology.

---

## 5. Research constellations

### 5.1 Definition

A research constellation is a finite, versioned grouping of real encounters, objects and practices around a material, problem or tension.

It is not:

- a permanent team;
- a department;
- a programme imposed on all participants;
- a synthetic final interpretation;
- a replacement for the encounter ledger.

### 5.2 Minimal data model

```ts
interface ResearchConstellation {
  id: string;
  title: string;
  description: string;
  initiatedAt: string;
  closedAt?: string;
  status: 'forming' | 'active' | 'dormant' | 'closed' | 'reopened';

  initiatingObjectRefs: string[];
  encounterRefs: string[];
  participantPracticeIds: string[];

  selectionRationale: string;
  authoredBy: string;
  version: number;

  orderPresent?: string;
  resistanceOrExcess?: string;
  contingentArrival?: string;
  temporaryStabilisation?: string;
}
```

The four final fields are interpretive notes. They require authorship and must never be automatically computed or scored.

### 5.3 The Middle constellation view

A constellation page should answer:

- What material or problem brought these practices into proximity?
- Which practice entered under which commitment?
- What moved between them?
- What changed in translation?
- What evidence, concept, form or caveat did not survive intact?
- What arrived unexpectedly?
- What became temporarily stable?
- What remains incompatible or unresolved?
- Why and when did the constellation end or go dormant?

---

## 6. Transduction and translation loss

The Studio must not be represented as a downstream rendering service. Introduce or formalise **transduction** as an encounter relation.

A transduction occurs when an object crosses into another practice and changes in medium, problem, evidentiary status, public, scale or material logic.

```ts
interface TransductionAssertion {
  id: string;
  sourceObjectRef: string;
  resultingObjectRef: string;
  fromPracticeId: string;
  toPracticeId: string;

  preserved: string[];
  transformed: string[];
  lostOrRefused: string[];
  newlyProduced: string[];

  assertedBy: string;
  evidenceRefs: string[];
  status: 'proposed' | 'accepted' | 'contested' | 'superseded';
  createdAt: string;
}
```

The Middle may render competing transduction assertions. It may not decide which account is correct.

---

## 7. The Middle product update

The Middle's encounter-first architecture remains valid. Extend it in four ways.

### 7.1 Display epistemic positions without role essentialism

For every participating practice, display its active profile and the commitment relevant to the encounter.

Example:

```text
MERIDIAN
Position in this encounter: scientific investigation
Accountability: evidence and conditions of failure

ULYSSES
Position in this encounter: philosophical-artistic problematisation
Accountability: assumptions and transformation of the problem

ENSEMBLE
Position in this encounter: artistic transduction
Accountability: material and public consequence of the form
```

Do not label the practices as fixed departments.

### 7.2 Add “what changed between regimes”

An encounter may expose:

- claim -> problem;
- data -> material;
- caveat -> dramaturgical constraint;
- concept -> spatial rule;
- instrument -> public situation;
- work -> new empirical question.

Each transition must be asserted by a named actor or practice.

### 7.3 Add constellation navigation

Allow encounters to belong to zero, one or several versioned constellations. The homepage may enter through an encounter or an active constellation, provided the selection rule remains visible.

### 7.4 Keep unresolved difference primary

Do not generate a synthetic “shared insight” by default. If a provisional shared statement exists, it must be an authored assertion with explicit participants and dissenters.

---

## 8. Protocol and constitutional amendments

### 8.1 Shared constitution

Add:

> The ecology currently contains three practices with distinct primary commitments: Meridian to scientific evidence and contestability; Ulysses to philosophical-artistic problematisation and experimentation; Ensemble to artistic form, material consequence and public encounter. These commitments are non-exclusive, versioned and locally governed. They create productive differences without defining permanent departments or a fixed pipeline.

Add:

> The ecology may host temporary research constellations. A constellation groups real encounters around a material, problem or tension without producing a collective identity or mandatory synthesis.

### 8.2 Ulysses protocol

Amend, do not replace the historical protocol.

Clarify:

- Ulysses is a philosophical and artistic research practice;
- its subject remains open;
- Error as Method is a stance, not a mandatory topic;
- works and artistic operations must be able to alter the problem rather than illustrate prior discourse;
- philosophical fluency is not sufficient evidence of research progress;
- external contact and material resistance should be traceable;
- self-reflection is one operation, not the whole programme;
- Ulysses' local maps are authored perspectives, not the ecology's graph.

### 8.3 Meridian protocol

Clarify:

- Meridian is currently a scientific research practice;
- evidence, method and public contestability are primary obligations;
- scientific orientation does not require naïve positivism;
- measuring the limits and politics of measurement remains admissible;
- Meridian is not the truth supplier for the ecology.

### 8.4 Ensemble protocol

Clarify:

- Ensemble is an artistic research and practice environment;
- form and materiality are epistemically active;
- it is a transductive interface, not a service layer;
- it may initiate research independently;
- `VERIFIED`, `SOURCED` and `IMAGINED` remain visible;
- a work may refuse or transform the originating research problem.

All amendments require local versioning and effective dates. The Research Core records but does not author them.

---

## 9. Technical change strategy

### 9.1 Do not restart the implementation

Treat the implemented v2 system as the baseline. Begin with a code and product delta audit.

### 9.2 Prefer extension over schema churn

If the current event/assertion model is generic enough:

- add new assertion types;
- add practice profile versions;
- add optional constellation tables;
- add transduction metadata;
- add Atelier projections and routes.

Do not rewrite stable encounter, provenance or identity infrastructure merely to rename concepts.

### 9.3 Suggested package boundary

Only if compatible with the existing codebase:

```text
apps/
  middle/                 cross-practice contact zone
  atelier/                Ulysses local cartographic surface

packages/
  research-core/          domain contracts and client
  cartography-core/       lenses, map manifests, projections
  practice-profiles/      versioned constitutions
  ui-primitives/          shared primitives, not shared total design
```

The Field and Studio may continue to use their current public surfaces until a real need justifies dedicated applications.

### 9.4 One cartography kernel, several products

Reusable cartographic capabilities may include:

- map and lens manifests;
- authored relation rendering;
- exclusion disclosure;
- stable version URLs;
- provenance inspection;
- contestation states;
- unknown-relation handling.

The kernel must not impose one visual grammar on Atelier and The Middle. Shared semantics do not require identical interfaces.

---

## 10. Implementation phases

### Phase A — post-implementation delta audit

Deliver:

- implemented v2 architecture map;
- feature and schema inventory;
- current treatment of Ulysses and the old cockpit;
- gap analysis against this amendment;
- migration risk assessment;
- proposed ADRs;
- no broad rewriting.

### Phase B — constitutional profiles

Deliver:

- versioned practice profiles;
- public profile rendering;
- local protocol amendment references;
- tests preventing The Middle from authoring local profiles.

### Phase C — Ulysses Atelier vertical slice

Use real Ulysses material and implement:

```text
current problematic
-> situated local map
-> inspect a concept or assertion
-> inspect the artistic operation or work
-> switch to provenance or apparatus lens
-> expose exclusions
-> open an external encounter in The Middle
-> return to the local Ulysses archive
```

Acceptance requires a product experience that is recognisably different from The Middle and from the historical cockpit.

### Phase D — constellations and transduction

Implement one real constellation involving at least two practices and one documented transformation.

Do not invent an example to populate production.

### Phase E — public descriptions and local protocol updates

Update public README/site language only after the local practices' amendments are approved. Preserve historical versions in Git.

---

## 11. Acceptance criteria

The amendment is complete when:

1. The implemented federation remains operational.
2. The Middle still centres encounters, not organisations or global state.
3. Ulysses has a distinct local Atelier surface replacing the cockpit as its primary interface.
4. The historical cockpit remains accessible as a dated artefact.
5. Meridian, Ulysses and Ensemble expose versioned primary commitments without becoming fixed departments.
6. At least one real research constellation is represented.
7. At least one transduction shows preserved, transformed, lost and newly produced elements.
8. No global order/chaos/chance score exists.
9. Local maps remain authored, bounded and versioned.
10. The Middle cannot publish a position in a practice's name.
11. A visitor can move from an Ulysses problematic to a cross-practice encounter and back without mistaking either surface for the whole ecology.
12. Existing data and URLs are migrated or preserved without silent semantic rewriting.

---

## 12. Core decision

The Cartographic Research Machine and the Federated Research Ecology are not rival systems.

The correct relationship is:

```text
Cartographic Research Machine
= a situated cartographic capability and local research interface

Federated Research Ecology
= the constitutional and infrastructural arrangement among practices

The Middle
= the cross-practice contact zone of the federation

Atelier
= Ulysses' local philosophical-artistic cartographic research surface
```

The v2.1 implementation should make that layered relationship visible in both architecture and experience.
