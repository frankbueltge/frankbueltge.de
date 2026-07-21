# 19 — Research Method Kernel implementation plan

## 1. Delivery strategy

The RMK is added after the v0.1.1 domain kernel contracts are available. It is implemented as framework-independent domain modules with adapters for model assistance, search, workflow execution, and user interfaces.

Do not begin with an autonomous multi-agent researcher. Begin with deterministic contracts, manual fixture input, state machines, and policy enforcement. Model-assisted compilation is added only after the same objects can be created and tested without a model.

## 2. Suggested repository topology

```text
packages/
  domain/
  method-kernel/
    question/
    measurement/
    estimand/
    causal_model/
    evidence_scout/
    data_scout/
    design/
    identification/
    preanalysis/
    falsification/
    replication/
    generalization/
    decisions/
  method-profiles/
    causal_observational/
  policy/
  workflow-compiler/
  benchmark/
apps/
  api/
  worker/
  reviewer-ui/
tests/
  contract/
  unit/
  property/
  integration/
  e2e/
  fixtures/housing_populism/
```

## 3. Epic sequence

### M0 — Contracts and module boundaries

- add schemas and generated runtime models;
- establish profile interface;
- add method object identifiers and common enums;
- add validation tooling and fixtures.

### M1 — Question and measurement

- deterministic Question Compiler from structured input;
- ambiguity and scope validators;
- ConceptMeasurementCharter lifecycle;
- taxonomy versioning and sensitivity relations.

### M2 — Estimands, causal models, designs, and audits

- Estimand Builder;
- causal graph validation;
- competing model support;
- design registry;
- identification audit state machine;
- claim ceiling policy.

### M3 — Evidence and data scouting

- search-strategy records;
- evidence matrix ingestion and verification states;
- data-asset readiness lifecycle;
- source-family and crosswalk artifacts;
- no-fabricated-substitute policy.

### M4 — Pre-analysis and workflow compilation

- lock and amendment cryptographic behavior;
- typed workflow graph;
- deterministic synthetic analysis adapter;
- outcome-access logging;
- execution-to-method lineage.

### M5 — Falsification, replication, and adaptive decisions

- probe registry;
- kill-condition evaluation;
- replication independence classifier;
- generalization maps;
- ResearchDecision engine.

### M6 — Housing reference vertical slice

- complete fixture object graph;
- one failed design and one conditional design;
- synthetic dataset generator or static fixture;
- deterministic analysis;
- falsification failure;
- replication discrepancy;
- bounded final claim or non-answer.

### M7 — MethodBench and hardening

- all benchmark families;
- property tests;
- security and injection tests for model-assisted compilers;
- reviewer UI requirements;
- performance and cost tracing.

### M8 — Model-assisted research

Only after M0–M7:

- provider-neutral question and charter drafting;
- evidence discovery adapters;
- causal-model proposal;
- design proposal;
- skeptic proposal;
- no direct authoritative transition.

## 4. Database guidance

Use relational tables for aggregate roots and edges. Recommended additions:

```text
method_profiles
question_models
concept_charters
concept_definitions
operationalizations
estimands
causal_models
causal_nodes
causal_edges
evidence_searches
evidence_records
data_asset_profiles
research_designs
identification_audits
preanalysis_plans
preanalysis_amendments
falsification_plans
falsification_probes
replication_plans
generalization_maps
research_decisions
method_dependencies
```

Sealed JSON artifacts may also be stored content-addressably. Do not use a graph database for the first implementation.

## 5. Policy integration

Add policy decisions for:

- accepting a question interpretation;
- accepting or superseding a charter;
- passing an identification audit;
- locking or amending a plan;
- waiving replication;
- expanding scope;
- overriding a kill condition;
- using identifiable field data;
- publishing a causal claim.

Overrides are rare, explicit, and never erase failed gates.

## 6. UI minimum

The first reviewer interface should show:

- raw and normalized question side by side;
- unresolved ambiguity;
- concept and measure comparison;
- estimand cards;
- causal model with typed edges and lens manifest;
- design comparison without one global score;
- audit threats and claim ceiling;
- pre-analysis diff and lock status;
- falsification outcomes;
- replication independence matrix;
- generalization and explicit non-claims;
- next research decision.

## 7. Stop conditions

Implementation MUST pause for specification review if:

- a profile needs a new claim type;
- a method object cannot map to existing identity and event contracts;
- claim-ceiling enforcement conflicts with current Claim state rules;
- a data source requires rights not represented in policy;
- a model adapter would need direct state authority;
- an implementation shortcut collapses proposal and verification roles;
- the housing slice can pass only by hard-coding expected outputs.

## 8. First production milestone

The first production milestone is not a published political finding. It is:

> A reproducible, auditable method run that can refuse an invalid causal design, lock an analysis, execute a synthetic test workflow, react to falsification and replication failure, and emit only language justified by the method state.
