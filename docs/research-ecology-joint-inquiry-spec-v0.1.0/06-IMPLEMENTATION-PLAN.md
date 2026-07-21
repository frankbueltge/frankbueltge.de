# Implementation plan
## Add Joint Inquiry as a thin vertical slice, not a second federation

## 1. Strategy

Implement the smallest complete slice that can support one real three-practice inquiry:

```text
protocol and schemas
-> local commitments
-> shared import/persistence
-> procedural coordinator
-> local dispatch adapters
-> The Middle inquiry page
-> one bounded real pilot
```

Do not begin with Seasons, general collaboration recommendations, an AI planner, a multi-agent council or a global project dashboard.

## 2. Phase 0 — Reconciliation and architecture decision

**Task:** `JI-00`

Claude must inspect the actual current repositories and report:

- current Research Core and The Middle topology;
- whether the shared layer is file-only, database-backed or hybrid;
- current schema/migrations and event model;
- current importer and adapter contracts;
- current write capability and authentication;
- current Encounter implementation status;
- current local federation folders/manifests;
- Ulysses v4.1 migration status;
- Meridian Runtime implementation status and local entrypoints;
- Ensemble current protocol/workflow;
- existing schedulers and cross-repo dispatches;
- site route and publication integration;
- current tests and deploy commands.

Output:

```text
docs/JOINT-INQUIRY-RECONCILIATION.md
```

The report must classify every proposal in this package as:

```text
accepted | adapted | rejected | deferred
```

No large refactor before this report.

## 3. Phase 1 — Protocol, ADR and schema contracts

**Tasks:** `JI-01`, `JI-02`

Deliver:

- ADR: Joint Inquiry is a temporary coordination object, not a practice;
- ADR: coordinator is procedural, not epistemic;
- Joint Inquiry JSON Schemas integrated into the current protocol package;
- framework-native types/validators;
- sample fixture `ji-2026-001`;
- documentation patches to Encounter protocol, data model, glossary and decision log.

Definition of done:

- schemas validate examples;
- invalid participant count, missing commitment or illegal state fails;
- open local strings remain accepted;
- Encounter objects are linked, not duplicated.

## 4. Phase 2 — Persistence and read model

**Task:** `JI-03`

Implement either:

### Option A — Current system is already PostgreSQL-backed

- additive migration;
- repositories/data access;
- event append API;
- read-model query;
- export.

### Option B — Current system is Git/file-first

- canonical file layout;
- importer validation;
- generated read model;
- static JSON/Markdown export;
- later database migration path documented.

Do not create two competing canonical sources.

Definition of done:

- inquiry with three participants imports;
- local commitments remain attributable;
- linked Encounter pages still function;
- state rebuild from events is deterministic;
- correction creates a new record rather than mutation.

## 5. Phase 3 — Local practice adapters

**Task:** `JI-04`

Implement thin adapters for:

- Ulysses;
- Meridian;
- Ensemble.

Each adapter must:

- receive invitation;
- expose local capability/standing policy;
- issue a local participation decision;
- validate or publish local commitment;
- dispatch one local move;
- return local object references and a local position;
- support pause/withdrawal;
- not publish publicly as a side effect.

Avoid forcing the same folder structure or output type across repositories.

## 6. Phase 4 — Coordinator

**Task:** `JI-05`

Implement `parallel_return` first.

Coordinator responsibilities:

- event validation;
- activation guard;
- idempotent dispatch;
- move counters;
- budget/runtime ceilings;
- local output registration;
- return bundle creation;
- escalation pause;
- review transition;
- compact operator notification.

Non-goals:

- topic selection;
- work criticism;
- evidence evaluation;
- generated synthesis;
- publication approval.

Definition of done:

- dry-run fixture executes end to end with mocked adapters;
- duplicate dispatch does not duplicate local runs;
- one participant can decline without fabricated status;
- budget ceiling pauses dispatch;
- no human input is required for routine mandate-compliant steps;
- no public publication occurs.

## 7. Phase 5 — The Middle UI

**Task:** `JI-06`

Add inquiry routes and a first braided-trace renderer.

Minimum views:

- inquiry overview;
- participant positions;
- chronological trace;
- linked Encounter and object list;
- apparatus/exclusions;
- static export/citation view.

Use existing design and IA where stronger. Do not rebuild The Middle from scratch.

Definition of done:

- first screen communicates shared problem and local differences;
- every cross-lane link opens its event/Encounter;
- no global graph or progress score;
- HTML core is readable without JS;
- accessible mobile trace exists.

## 8. Phase 6 — Pilot dry run

**Task:** `JI-07`

Create the pilot inquiry record using verified current source IDs.

Run in `dry_run` mode first:

- no model calls unless explicitly enabled;
- no public publication;
- mocked or low-cost local outputs acceptable for pipeline proof;
- verify rights, source versions and participant policy;
- validate operator notifications.

The dry run proves infrastructure, not artistic or scientific quality.

## 9. Phase 7 — Real bounded pilot

**Task:** `JI-08`

Activate only after Phase 6 acceptance.

Recommended initial bounds:

- three practices;
- one first move and one return per practice;
- no generic daily schedule;
- event-driven or manual trigger;
- aggregate budget inherited from local standing delegations and explicitly capped;
- target review after 7-10 calendar days, but no forced output cadence;
- human approval only for escalations and public exposition.

At review, each practice may:

- publish a local position;
- archive or kill its local project;
- create a publication candidate;
- withdraw;
- or accept one explicit extension.

## 10. Phase 8 — Documentation and public release

**Task:** `JI-09`

Update:

- shared Constitution/Decision Log/Glossary as accepted;
- Encounter and data-model docs;
- practice manifests;
- The Middle About/Apparatus pages;
- implementation handoff.

Return a final report with:

- changed repos/files;
- commits/PRs;
- migrations;
- tests;
- actual deployment state;
- unresolved risks;
- cost/credential changes without secrets;
- accepted/adapted/rejected/deferred decisions;
- and exact decisions still requiring Frank.

## 11. Recommended change sets

Keep changes reviewable:

1. protocol + ADR + schemas + fixtures;
2. persistence/import/read model;
3. local adapter contracts and mocks;
4. coordinator dry run;
5. The Middle read-only UI;
6. pilot configuration;
7. real dispatch enablement;
8. public exposition gate and documentation.

## 12. Rollback

- Feature flag Joint Inquiry routes and dispatch.
- Additive database migration; no destructive conversion of Encounter data.
- Coordinator can be disabled without invalidating local projects.
- Local commitments remain files/records even if shared automation is removed.
- Existing Encounter and practice pages continue to work.
- Pilot can be archived without deleting local outputs.
