# 06 — Implementation plan and backlog

## 1. Delivery strategy

MRR must be implemented through vertical slices. Do not first build a large agent framework and add provenance later. The first useful slice must already contain identity, policy, execution, evidence, verification, and correction.

The recommended repository is a Python monorepo:

```text
meridian-runtime/
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── Makefile
├── pyproject.toml
├── docs/
│   ├── spec/
│   ├── adr/
│   ├── runbooks/
│   └── threat-model/
├── schemas/
├── examples/
├── packages/
│   ├── domain/
│   ├── contracts/
│   ├── crypto/
│   ├── policy/
│   ├── provenance/
│   └── observability/
├── services/
│   ├── control_plane/
│   ├── node_runtime/
│   └── projection_service/
├── workers/
│   ├── orchestration/
│   ├── verification/
│   └── correction/
├── adapters/
│   ├── llm/
│   ├── object_store/
│   ├── identity/
│   ├── sources/
│   └── publication/
├── benchmarks/
│   └── meridianbench/
├── tests/
│   ├── unit/
│   ├── property/
│   ├── contract/
│   ├── integration/
│   ├── e2e/
│   └── adversarial/
├── migrations/
├── infra/
│   ├── compose/
│   └── deployment/
└── scripts/
```

Core domain packages MUST NOT import FastAPI, Temporal, a model provider SDK, or a specific object store client.

## 2. Architecture decisions for v1

1. PostgreSQL is authoritative for metadata, current state, and typed graph edges.
2. An S3-compatible store holds immutable artifact bytes by hash.
3. Temporal coordinates durable workflows; domain state remains in MRR services.
4. A transactional outbox couples state changes to domain events.
5. JSON Schema and Pydantic contracts are generated or cross-validated to avoid semantic drift.
6. LLM providers are adapters; no provider-specific object enters core domain models.
7. Policy starts as typed deterministic rules behind a stable interface.
8. Federation uses signed application objects over mTLS and supports offline bundles.
9. A web UI is not required for the first vertical slice; API, CLI, and inspectable exports are sufficient.
10. Kubernetes is optional and must not be required for local development.

## 3. Epic sequence

### E0 — Seal a baseline, instrument, and continue Meridian Classic

Deliverables:

- immutable baseline snapshot, repository tag, and content manifest;
- separate version/configuration manifest for the continuing operational Meridian Classic system;
- inventory of code, prompts, policies, artifacts, and known failures;
- legacy object catalog with hashes;
- selected benchmark and dual-run seeds;
- import and capability-mapping document;
- minimal comparison record format for exact system attribution.

Exit criteria:

- the baseline is read-only and distinguishable from later Classic runs;
- Meridian Classic may continue authoritative work under its own versioned policies;
- every compared output identifies the exact Classic or MRR configuration that produced it;
- every reused component is explicitly reviewed;
- imported Classic claims default to `legacy_unverified`;
- no shutdown, cutover, or migration is implied by completing E0.

### E1 — Contracts and domain kernel

Tasks:

- E1-T01 repository bootstrap and quality commands;
- E1-T02 canonical ID, time, revision, hash, and signature primitives;
- E1-T03 JSON Schemas and Pydantic models;
- E1-T04 state-machine library and domain errors;
- E1-T05 PostgreSQL models, migrations, and repository interfaces;
- E1-T06 append-only event and transactional outbox;
- E1-T07 content-addressed artifact interface and local/MinIO adapter.

Exit criteria:

- core objects validate and round-trip;
- property tests prove hash and transition invariants;
- sealed artifact mutation is impossible through public interfaces.

### E2 — Single-node vertical slice

Tasks:

- E2-T01 Research Score service and approvals;
- E2-T02 local Node Manifest and capability registry;
- E2-T03 Task Bundle service and local decisions;
- E2-T04 sandbox executor with deterministic reference task;
- E2-T05 Run Manifest and resource/cost records;
- E2-T06 Evidence Crate builder and sealing;
- E2-T07 CLI flow for complete local run.

Exit criteria:

- E2E-001 passes without any LLM dependency;
- deterministic replay gate passes;
- policy denial and timeout paths are explicit.

### E3 — Claim, evidence, and correction kernel

Tasks:

- E3-T01 SourceRecord and EvidenceAnchor services;
- E3-T02 Claim service and typed edge graph;
- E3-T03 source-family representation;
- E3-T04 review and verification records;
- E3-T05 independence validator;
- E3-T06 correction event and graph impact algorithm;
- E3-T07 projection of claim table and provenance map.

Exit criteria:

- supported claims require verification;
- self-verification gate passes;
- E2E-003 passes on deterministic fixtures.

### E4 — Agent roles and model adapters

Tasks:

- E4-T01 provider-neutral model profile and invocation record;
- E4-T02 structured generation adapter with schema repair limits;
- E4-T03 planner/proposer role;
- E4-T04 skeptic role;
- E4-T05 verifier orchestration with deterministic tools;
- E4-T06 prompt/version registry in Git;
- E4-T07 model benchmark runner and promotion policy.

Exit criteria:

- no model can mutate authoritative state directly;
- independence lineage is recorded;
- MB-CIT and MB-NUM targets are evaluated against a non-agent baseline.

### E5 — Federation

Tasks:

- E5-T01 practice and node identity/key management;
- E5-T02 signed manifest exchange;
- E5-T03 online node protocol and mTLS;
- E5-T04 task negotiation and modification flow;
- E5-T05 signed Evidence Crate result flow;
- E5-T06 offline inbox/outbox bundles;
- E5-T07 replay, expiry, revocation, and idempotency hardening.

Exit criteria:

- E2E-002 and MB-FED pass;
- no raw restricted fixture leaves the node;
- compromised signatures and replay fail closed.

### E6 — Transfers, obligations, and corrections across practices

Tasks:

- E6-T01 TransferContract lifecycle;
- E6-T02 caveat and obligation propagation;
- E6-T03 cross-practice correction notification;
- E6-T04 local accept/adapt/reject/defer response;
- E6-T05 public unresolved-correction projection;
- E6-T06 offline recipient delivery tracking.

Exit criteria:

- correction propagation remains complete and cycle-safe across nodes;
- local autonomy and visible disagreement are both preserved.

### E7 — Qualitative and field-research mode

Tasks:

- E7-T01 ConsentAsset and field data policy;
- E7-T02 local transcript, redaction, and confidence-span model;
- E7-T03 blind parallel human/model coding workflow;
- E7-T04 analytic memos and deviant-case records;
- E7-T05 shadow-mode suggestion and human decision log;
- E7-T06 participant withdrawal impact flow;
- E7-T07 disclosure review for quotations and derived outputs.

Exit criteria:

- E2E-004 and MB-QUAL pass;
- participant-identifiable data remains local by default;
- synthetic outputs cannot be mistaken for empirical observations.

### E8 — Portable exports and research projections

Tasks:

- E8-T01 RO-Crate-compatible export;
- E8-T02 PROV mapping;
- E8-T03 Markdown/HTML research report projection;
- E8-T04 publication approval and immutable release bundle;
- E8-T05 correction banner and release supersession.

Exit criteria:

- a third party can inspect object IDs, hashes, methods, evidence, and corrections without the running MRR database;
- external publication is impossible without A4 approval.

### E9 — Hardening and production operation

Tasks:

- E9-T01 threat-model review and adversarial suite;
- E9-T02 backup, restore, and disaster recovery;
- E9-T03 key rotation and revocation runbooks;
- E9-T04 observability dashboards and cost limits;
- E9-T05 performance/load tests;
- E9-T06 accessibility and human-review UI;
- E9-T07 security review and production release evidence.

## 4. Initial issue backlog

The first coding-agent assignment SHOULD be E1-T02, not an agent prompt or UI.

| Task | Objective | Key acceptance |
|---|---|---|
| E1-T01 | Bootstrap monorepo | all quality commands exist and CI runs |
| E1-T02 | Canonical object primitives | hash/signature property tests pass |
| E1-T03 | Contracts | schemas and Pydantic models cross-validate |
| E1-T04 | State machines | invalid random transitions never succeed |
| E1-T05 | Persistence | migrations and optimistic concurrency work |
| E1-T06 | Audit/outbox | state and event cannot diverge in failure test |
| E1-T07 | Artifacts | byte mutation changes identity; sealed bytes immutable |
| E2-T01 | Research Score | unapproved score cannot start work |
| E2-T03 | Task negotiation | node is sole authority for acceptance |
| E2-T04 | Sandbox | reference task bounded and replayable |
| E2-T06 | Evidence Crate | complete failure and success crates seal |
| E3-T02 | Claim graph | supported-without-evidence rejected |
| E3-T05 | Independence | self-verification rejected |
| E3-T06 | Corrections | cyclic fixture fully and once traversed |

## 5. Coexistence, comparison, and capability adoption

### 5.1 Immutable baseline

Create hashes and metadata for the selected Meridian Classic baseline without altering it. The baseline is a comparison reference, not the live operational database or repository branch.

### 5.2 Operational continuity

Meridian Classic MAY continue to produce authoritative work under its own governance. Every material Classic run used in comparison MUST identify:

- code or repository revision;
- policy/constitution version;
- prompt, model, tool, and environment profile where applicable;
- input/source snapshot;
- runtime, cost, and human interventions;
- output and correction identifiers.

Changes to Classic are allowed. They MUST be versioned so that comparative results do not silently mix configurations.

### 5.3 Classification and import

Each Classic item is classified as:

- reusable code candidate;
- prompt candidate;
- policy/constitution record;
- research artifact;
- known failure/correction;
- obsolete or unverifiable.

Imported research objects receive:

```text
status: legacy_unverified
origin_system: meridian-classic
origin_version: ...
origin_hash: ...
import_run: ...
```

No imported claim is upgraded until evidence anchoring and verification pass. Ongoing Classic authority does not transfer automatically into MRR authority.

### 5.4 Comparative operating modes

Use one of three declared modes:

- **baseline dual run**: both systems independently execute the same bounded assignment;
- **challenger run**: one system produces the primary result and the other performs targeted criticism, verification, or alternative exploration;
- **exploratory run**: systems intentionally use different methods and are evaluated for complementarity.

Not every production task is duplicated. Dual runs are selected for benchmarks, consequential decisions, changed capabilities, and representative task classes.

### 5.5 Evaluation

Compare, as applicable:

- supported, unsupported, and falsely supported claim rate;
- citation and numeric accuracy;
- source-family independence;
- known unknowns and justified refusals;
- counterevidence and alternative-hypothesis yield;
- correction detection and propagation;
- cost, latency, and human effort;
- provenance completeness and policy compliance;
- report usefulness and field relevance.

Evaluation MUST use exact version attribution and disclose material asymmetries. Output review SHOULD be blind to system identity where practical.

### 5.6 Capability adoption

Adoption is capability-specific and reversible. Valid outcomes are:

- promote the MRR capability;
- retain the Classic capability;
- combine components from both;
- continue dual operation;
- conclude that evidence is insufficient.

A capability moves only when the relevant release gates pass and a rollback path exists. Capabilities MAY move in either direction. There is no required all-at-once migration and no automatic sunset date for Meridian Classic.

### 5.7 Long-term coexistence

Meridian Classic MAY remain a production, fallback, challenger, red-team, or replication practice even after MRR capabilities are promoted. The objective is better research behavior, not organizational victory by one architecture.

## 6. Branch and pull-request policy

- One task packet per branch.
- One coherent behavior change per pull request.
- Schema and migration changes reviewed separately from model-prompt changes where practical.
- Generated files must be reproducible.
- Every pull request links requirement IDs and acceptance evidence.
- A different reviewer or review agent checks the patch against the task packet.
- Merge commits or squash metadata retain the task identifier.

## 7. Stop conditions

Implementation must stop and request a specification decision when:

- two normative requirements conflict;
- a task requires weakening a hard gate;
- a data movement lacks clear consent or policy basis;
- a new external action lacks an autonomy classification;
- a schema cannot represent a material domain distinction;
- a migration would erase historical provenance;
- benchmark labels would leak into model prompts;
- the requested change creates a hidden vendor lock-in.

## 8. What not to build early

Do not begin with:

- a polished dashboard;
- autonomous paper generation;
- a graph database migration;
- an unrestricted multi-agent chat loop;
- broad external connectors;
- physical laboratory control;
- automatic participant recruitment;
- a proprietary vector index containing all sensitive data;
- complex consensus scoring before basic verification works.

## 9. Release artifacts

Every release produces:

- signed source commit and container images;
- database migration set;
- schema bundle;
- SBOM and dependency report;
- benchmark report;
- security and privacy gate report;
- known limitations;
- compatibility and rollback notes;
- accepted ADR list;
- example portable research object.

## 10. v0.2 Research Method Kernel epics

After the v0.1.1 contract and single-node foundations, implement M0 through M8 from `docs/19_METHOD_IMPLEMENTATION_PLAN.md`. The task packets `M0-*` through `M7-*` are the authoritative initial decomposition.

Do not begin autonomous model-assisted method generation before the deterministic housing reference slice and method gates pass.
