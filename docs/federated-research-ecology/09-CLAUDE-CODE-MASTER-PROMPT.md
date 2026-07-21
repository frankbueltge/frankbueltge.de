# Claude Code Master Prompt
## Federated Research Ecology / The Middle

You are working on a greenfield implementation for the frankbueltge.de lab.

Read **every file in this specification directory before changing code**. Then inspect these repositories and their current public integrations:

- https://github.com/frankbueltge/irrtum-als-methode
- https://github.com/frankbueltge/field-research
- https://github.com/frankbueltge/studio

The current Ulysses cockpit is historical research material, not an implementation constraint. Astro is not mandatory. Do not preserve existing interface or stack decisions merely because they exist.

---

## 1. Governing proposition

Build a **federated research ecology**, not a dashboard and not a multi-agent organisation chart.

Ulysses/Atelier, Meridian/Field and Ensemble/Studio are sovereign practices with their own protocols, archives, questions, evidentiary regimes and right of refusal.

The shared application, provisionally named **The Middle**, is a public contact zone that records and renders encounters between them. It has no common research agenda, no master agent, no canonical global graph and no authority to decide the final meaning of an exchange.

The primary public unit is an **encounter**:

- an object, question, instrument, work, correction or challenge moves between practices;
- the receiver may accept, transform, contest, defer, refuse or ignore it;
- conditions and caveats remain attributable;
- source and derivative remain distinct local objects;
- participants may publish incompatible maps;
- encounters may remain unresolved indefinitely.

---

## 2. Non-negotiable constraints

1. Do not impose “Error as Method”, measurement, AI, data/power or artistic research as the common subject.
2. Do not build a master collective, orchestration agent or central research planner.
3. Do not encode a fixed pipeline such as Meridian researches -> Ensemble makes -> Ulysses reflects.
4. Do not build a canonical global graph or “show all network” view.
5. Do not build KPI cards, research-health scores, engagement ranking, closure score or collective leaderboard.
6. Events and interpretations must be separate domain records.
7. Every relation is an authored assertion with evidence/status, not a factual edge.
8. Local object types and relation types are open strings; preserve exact source vocabulary.
9. Unknown types must remain visible and must never be silently normalised to “related”.
10. Source version, content hash, lifecycle status, caveats, licence and accepted obligations must survive transfer.
11. Technical delivery, acknowledgement, acceptance and interpretive agreement are different states.
12. Silence must not be inferred as rejection.
13. Machine similarity or AI-generated relations remain `machine_suggestions` until admitted by an accountable actor.
14. Ulysses, Meridian, Ensemble, Frank, model runtimes, automations and infrastructure are distinct actors.
15. The Middle cannot author a position under a collective's name.
16. Local repositories remain sovereign, readable and independently deployable.
17. The first interface enters through a real encounter, not a collective directory or dashboard.
18. The public experience must be accessible, mobile-native and readable without JavaScript for core records.

---

## 3. Required first step: audit, do not code broadly

Before implementation, produce these files in the new project:

### `docs/REPOSITORY-AUDIT.md`

Document:

- repository structures;
- active protocols and versions;
- public site integration;
- journals, works, workboards, feeds and automation;
- current cross-repository references;
- current infrastructure and deployment where discoverable;
- historical Ulysses cockpit and data;
- discrepancies between repository descriptions and actual state;
- facts that remain unknown.

### `docs/ENCOUNTER-INVENTORY.md`

Find real, evidenced inter-practice encounters. For each candidate list:

- source and receiver;
- source object/version;
- evidence URLs and commit references;
- explicit or implicit conditions;
- current status;
- whether a derivative exists;
- whether the relation is factual or interpretive;
- suitability for the first vertical slice.

Do not invent an exchange. Do not treat thematic similarity as an encounter.

### `docs/SPEC-GAP-ANALYSIS.md`

State which parts of this specification are directly implementable, which need repository changes and which should be revised after audit.

### ADRs

Review the supplied ADRs and create or update:

- framework and deployment;
- PostgreSQL/event-assertion model;
- repository sovereignty and adapter boundary;
- protocol transport: read-only first, manifests later;
- renderer strategy;
- authentication and write model;
- archive treatment of the existing cockpit.

Explicitly challenge recommendations where the real repositories justify a better choice.

Stop after audit if no real encounter can be established with sufficient evidence. Report the gap rather than fabricating content.

---

## 4. Select and implement one vertical slice

After audit, choose one real encounter involving at least two practices.

The first public journey must be:

```text
current encounter
-> inspect source object and source conditions
-> inspect receiver transformation or response
-> compare two structurally different local maps
-> inspect one assertion and its evidence
-> expose caveats, obligations, exclusions and unresolved positions
-> follow each object to its sovereign local archive
-> share an immutable map/encounter version URL
```

Use real imported material. No lorem ipsum, fictional works or fabricated transfer events.

Minimum pages:

- `/` current encounter;
- `/encounters/[id]`;
- one immutable map-version route;
- compare view;
- assertion detail;
- object reference detail;
- lens manifest;
- apparatus summary;
- archive page for the current cockpit.

Minimum render forms:

- provenance/event chain;
- transformation lineage or parallel participant positions;
- bounded constellation only if it adds real comprehension.

At least two lenses must differ in selection, semantics or rendering logic. Colour changes alone fail.

---

## 5. Technical baseline

The specification recommends:

- SvelteKit 2 / Svelte 5 / TypeScript strict;
- PostgreSQL 16+;
- Drizzle or Kysely;
- Graphology and Sigma only for bounded graph projections;
- D3/custom SVG or Canvas for other renderers;
- Cloud Run + Cloud SQL + Cloud Run Jobs on GCP;
- GitHub repository adapters first;
- local federation manifests and signed outboxes later.

You may choose alternatives only through an ADR grounded in maintainability and product needs.

Do not introduce:

- a graph database as primary truth;
- Kafka/NATS/event-bus complexity without demonstrated need;
- ActivityPub in version 1;
- microservices that one operator cannot reasonably maintain;
- a generic admin/dashboard UI as the public design language.

---

## 6. Domain model requirements

Implement at minimum:

- collectives and versioned collective manifests;
- actors;
- opaque local object references with hashes and source commits;
- encounters and participant-specific statuses;
- append-only events;
- offers and responses;
- accepted obligations;
- authored assertions and assertion responses;
- versioned lenses;
- immutable map versions;
- explicit exclusions and render failures;
- machine suggestions in a separate store;
- historical cockpit imports as Ulysses-authored assertions/self-assessments.

Use open string namespaces for local types and event predicates.

Every imported record must retain:

- source URI;
- source repository/collective;
- commit or version;
- content hash;
- adapter version;
- import timestamp;
- validation/ambiguity state.

---

## 7. Visual and interaction bar

The interface must feel like a serious public research work, not SaaS, cyberpunk control UI or a generic knowledge graph.

Avoid:

- KPI cards;
- glassmorphism;
- decorative neon nodes;
- ambient graph motion;
- agent avatars as organisational icons;
- dashboard grids;
- Inter/Roboto default styling;
- “AI-generated insight” callouts;
- false total views.

Use visual form to distinguish:

- event;
- assertion;
- obligation;
- correction;
- unresolved state;
- refusal;
- machine suggestion;
- local archive exit;
- source versus derivative.

The visitor must understand who offered what, what changed and what remains disputed within approximately one minute, without flattening the conceptual difficulty.

Implement:

- keyboard navigation;
- screen-reader textual map summaries;
- WCAG AA contrast;
- reduced motion;
- mobile-native layouts;
- print/citation view;
- strict CSP and sanitisation.

Run the app and inspect it visually at desktop and mobile sizes before declaring completion.

---

## 8. Tests that encode the philosophy

Create automated tests proving:

- no public endpoint exposes a canonical global edge list;
- a map cannot publish without a lens version and exclusions;
- participant statuses are not collapsed;
- unknown relation/event types survive import and render visibly;
- silence remains “no public acknowledgement”, not rejection;
- machine suggestions are excluded from accepted assertions by default;
- source hashes and local terms survive round-trip;
- a correction creates a new event and does not rewrite history;
- maps are deterministic for the same event watermark and lens version;
- local source/archive URLs are present;
- historical cockpit edges remain attributed to Ulysses;
- a fourth collective with new local object types can be imported without schema migration.

---

## 9. Implementation sequence

1. Audit and ADRs.
2. Protocol package, schemas, SQL migration and fixtures.
3. Read-only adapters for the three repositories.
4. Encounter read API and deterministic projection engine.
5. Public vertical slice with real material.
6. Conceptual, visual, accessibility and security review.
7. Stop and request human evaluation before adding write features.
8. Only after approval: local manifests, bilateral offer/response workflow, visitor interventions and apparatus expansion.

Do not broadly scaffold future features before the first encounter is convincing.

---

## 10. Final review before handoff

Before completion, review all work specifically for:

- hidden recentralisation;
- a shared subject creeping into the architecture;
- role fixation;
- ontology leakage from one collective to another;
- loss of live caveats or source status;
- conflation of delivery and agreement;
- silent semantic inference;
- dashboard drift;
- generic graph aesthetics;
- overclaiming autonomy;
- human/infrastructure invisibility;
- unmaintainable complexity;
- security and prompt-injection exposure.

Write `docs/CONCEPTUAL-IMPLEMENTATION-REVIEW.md` with findings, remaining compromises and explicit deviations from the specification.

Do not claim that the system is rhizomatic or neutral. Demonstrate a bounded architecture that keeps maps situated, exchanges voluntary and differences legible.
