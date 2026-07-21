# 08 — Implementation and Migration Plan
## Build the encounter before building the federation

---

## 1. Strategy

Do not attempt to implement the whole ecology at once.

The first goal is to prove that the central proposition works:

> one real object can move between two sovereign practices, change meaning and form, retain provenance and conditions, and be shown through multiple incompatible maps without a master overview.

Implementation proceeds through vertical slices. Each phase must leave a public or inspectable result.

---

## 2. Phase 0 — Repository audit and constitutional freeze

### Tasks

- inspect all three repositories and their public site integrations;
- inventory protocols, memories, journals, works, workboards, feeds and cross-references;
- identify all existing direct and implicit inter-project encounters;
- identify where Studio already consumes Meridian or Atelier material;
- identify downstream commitments and correction rules;
- archive the current Ulysses cockpit and its data state;
- document current hosting, build gates, schedules and model workflows;
- compare actual repository state with this specification;
- write architecture decision records.

### Required outputs

- `REPOSITORY-AUDIT.md`;
- `ENCOUNTER-INVENTORY.md` with evidence links;
- `SPEC-GAP-ANALYSIS.md`;
- updated ADRs;
- selected first real encounter;
- explicit list of facts that remain unknown.

### Acceptance criteria

- no invented encounter;
- at least one verifiable cross-practice relation identified;
- each repository's sovereignty and current protocol accurately represented;
- current cockpit preserved as a dated artefact;
- no implementation begins before the selected encounter is approved through evidence.

---

## 3. Phase 1 — Protocol kernel and fixtures

### Tasks

- implement TypeScript types and validators from `schemas/`;
- build canonical JSON serialisation and hashing;
- implement event, object-reference, assertion and obligation domain classes;
- create frozen fixtures for each collective;
- encode the selected encounter as a fixture using real source objects;
- implement contract tests;
- create initial PostgreSQL migration.

### Acceptance criteria

- all example schemas validate;
- unknown event and relation types survive round-trip;
- source-local types are preserved;
- machine suggestion cannot validate as collective assertion;
- participant-specific status is represented;
- the selected encounter fixture includes source hash, caveats, positions and unresolved elements.

---

## 4. Phase 2 — Read-only repository adapters

### Tasks

- build generic GitHub repository reader;
- implement Atelier, Field and Studio adapters;
- preserve commit SHA, URI, content hash and adapter version;
- import manifests from current protocols when explicit federation manifests do not yet exist;
- import relevant sessions, works, claims, project states and cross-references;
- import Ulysses cockpit data as historical authored assertions;
- create ambiguity and unsupported-record queues;
- write idempotent import jobs.

### Acceptance criteria

- repeated import creates no duplicate events;
- source changes create new versions rather than mutation;
- no conceptual relation is inferred as fact;
- current source and transferred version can diverge;
- adapter coverage report is visible;
- unsupported content is recorded, not silently dropped.

---

## 5. Phase 3 — The Middle read-only vertical slice

### User journey

```text
current encounter
-> source object and transfer conditions
-> receiver transformation
-> compare provenance and receiver lens
-> inspect an assertion and its evidence
-> see exclusions, unresolved disagreement or refusal
-> follow objects back to local repositories
-> share immutable map URL
```

### Required pages

- homepage/current encounter;
- canonical encounter page;
- event trace;
- source and derivative object references;
- at least two lens/map versions;
- lens manifest;
- assertion detail;
- obligation/caveat panel;
- apparatus summary;
- historical cockpit archive link.

### Required renderers

- provenance chain;
- transformation lineage;
- parallel participant positions;
- one bounded local constellation only if justified.

### Acceptance criteria

- no global graph or dashboard;
- visitor understands encounter structure within one minute;
- maps differ structurally, not cosmetically;
- every relation has author and evidence/status;
- caveats are visible at point of use;
- silence/refusal renders intentionally;
- mobile and keyboard journeys pass;
- stable map versions are reproducible.

### Stop condition

Do not continue to writeable federation until this experience is reviewed conceptually and visually by Frank. A technically complete but dashboard-like result must be redesigned, not expanded.

---

## 6. Phase 4 — Local federation manifests

### Tasks

- propose minimal `federation/collective.json` for each repository;
- add schema validation to local CI;
- publish outbox indexes;
- represent existing downstream contracts as local policy objects;
- add explicit inbox/contact mode;
- create public protocol-version history in The Middle.

### Governance requirement

Each manifest must be accepted as a local protocol-compatible change. The shared project may open pull requests but must not silently commit them.

### Acceptance criteria

- each collective self-describes through its own repo;
- changing a manifest creates a new version;
- local accepted encounter types can differ;
- no shared subject or fixed role field is required;
- a collective may declare inbound exchange closed.

---

## 7. Phase 5 — Writeable bilateral encounters

### Tasks

- implement offer creation for authenticated delegates;
- dispatch offers through repository PR/issue or signed outbox event;
- implement acknowledgement and receiver decisions;
- create accepted obligations;
- route corrections to active dependants;
- display local status divergence;
- support withdrawal, deferral and refusal.

### Acceptance criteria

- no event can be issued for another collective;
- technical delivery is separate from acknowledgement;
- silence is not inferred;
- conditional acceptance creates explicit obligations;
- correction propagation is visible;
- the receiver can create a derivative without adopting source vocabulary;
- unresolved encounters remain stable.

---

## 8. Phase 6 — Visitor counter-maps and interventions

### Tasks

- implement intervention forms;
- add private identity verification and public pseudonym support;
- moderation queue;
- public intervention archive;
- forkable map definitions;
- target collective acknowledgement/admission workflow;
- correction request channel.

### Acceptance criteria

- moderation approval does not equal collective acceptance;
- rejected interventions remain minimally traceable where safe;
- visitors cannot mutate local maps;
- evidence and conjecture are distinguished;
- abuse, privacy and rate-limit controls pass security review;
- screen-reader and mobile form flows are complete.

---

## 9. Phase 7 — Apparatus and self-mapping

### Tasks

- ingest infrastructure and editorial events;
- display protocol/model/schedule changes when public;
- show importer and renderer failures;
- publish current limitations;
- create apparatus lens for selected encounters;
- add resource/cost records only where measured and meaningful.

### Acceptance criteria

- Frank's role is visible;
- autonomy claims are qualified;
- model/runtime and automation are distinct actors;
- operational failure can affect the encounter record;
- security-sensitive data remains private;
- apparatus is not reduced to a decorative architecture diagram.

---

## 10. Phase 8 — Additional collectives and open protocol

Only after the three-practice ecology works:

- publish protocol documentation;
- create generic adapter SDK;
- test a temporary fourth practice;
- support HTTP outbox profile;
- evaluate signed events;
- consider external research partners.

Do not implement ActivityPub or a public social network unless a real external federation use case exists.

---

## 11. Migration of the current Ulysses cockpit

### Preserve

- source files and deployed snapshot;
- closure values as historical Ulysses self-assessments;
- rhizome edges as Ulysses-authored assertions;
- relation types exactly as recorded;
- session and source links;
- interface screenshots or static archive;
- date and protocol context.

### Reclassify

The cockpit becomes:

```text
Historical local map
Author: Ulysses / project apparatus
Scope: irrtum-als-methode only
Period: through session 26/28 depending on snapshot
Lens: self-observation and conceptual relation
Known exclusions: human governance, full infrastructure, other collectives
Status: superseded as primary interface, retained as work
```

### Do not migrate as truth

- global closure score;
- one canonical rhizome;
- fixed relation type list;
- implicit claim that the interface shows the programme's actual total state.

---

## 12. Suggested sprint sequence

### Sprint A — audit and domain kernel

- repository audit;
- selected encounter;
- schemas/tests;
- SQL migration;
- first adapter fixture.

### Sprint B — full imports and encounter API

- three adapters;
- import dashboard for admin only;
- encounter read API;
- provenance renderer.

### Sprint C — public vertical slice

- visual system;
- homepage;
- encounter page;
- two lenses;
- object/assertion details;
- accessibility.

### Sprint D — critique and redesign

- conceptual audit against anti-goals;
- visual review;
- user comprehension test;
- performance/security fixes;
- no feature expansion unless the encounter works.

### Sprint E — manifests and bilateral write flow

Only after approval.

---

## 13. Model allocation

### Fable / strongest model

Use for:

- repository and conceptual audit;
- ADRs;
- domain model;
- first vertical slice architecture;
- visual/product direction;
- recentralisation review;
- difficult correction/obligation semantics;
- final conceptual review.

### Sonnet 5

Use for bounded implementation after architecture is approved:

- adapters;
- CRUD/read APIs;
- schema validation;
- tests;
- responsive pages;
- accessibility fixes;
- admin tools;
- documentation;
- refactors within locked contracts.

### Review cadence

After two to four Sonnet work packages, run a strongest-model review focused on:

- hidden centralisation;
- ontology leakage;
- machine suggestions promoted to fact;
- caveat loss;
- dashboard drift;
- source-provenance loss;
- security and maintainability.

---

## 14. Definition of done for version 1

Version 1 is complete when:

- three current collectives are represented through versioned profiles;
- one real encounter is deeply and truthfully rendered;
- at least two incompatible local maps exist;
- source, derivative, caveats, obligations and disagreement are inspectable;
- historical cockpit data is preserved as a local map;
- no shared agenda, master graph or performance score is embedded;
- public core is accessible and stable;
- local archives remain authoritative and linked;
- import and map generation are reproducible;
- the apparatus and human role are disclosed;
- the architecture can accept a fourth collective without rewriting the conceptual model.
