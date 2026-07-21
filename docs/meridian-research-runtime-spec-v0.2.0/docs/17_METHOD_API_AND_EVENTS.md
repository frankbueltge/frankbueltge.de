# 17 — Method API and domain events

## 1. API principles

Method endpoints create proposals and versioned objects. They do not bypass score, policy, role, or evidence requirements. All write endpoints require idempotency keys and optimistic revision checks.

## 2. REST surface

### Questions and concepts

```text
POST /v1/projects/{project_id}/question-models:compile
POST /v1/projects/{project_id}/question-models
GET  /v1/question-models/{id}
POST /v1/projects/{project_id}/concept-charters
POST /v1/concept-charters/{id}:review
POST /v1/concept-charters/{id}:supersede
```

### Estimands and causal models

```text
POST /v1/projects/{project_id}/estimands
POST /v1/projects/{project_id}/causal-models
POST /v1/causal-models/{id}:validate
POST /v1/causal-models/{id}:fork
```

### Evidence and data scouting

```text
POST /v1/projects/{project_id}/evidence-searches
POST /v1/evidence-searches/{id}:run
POST /v1/evidence-records/{id}:verify
POST /v1/projects/{project_id}/data-assets
POST /v1/data-assets/{id}:transition
POST /v1/data-assets/{id}:quality-audit
```

### Designs and identification

```text
POST /v1/projects/{project_id}/designs:generate
POST /v1/projects/{project_id}/designs
POST /v1/designs/{id}/identification-audits
POST /v1/identification-audits/{id}:decide
```

### Pre-analysis and execution compilation

```text
POST /v1/projects/{project_id}/pre-analysis-plans
POST /v1/pre-analysis-plans/{id}:review
POST /v1/pre-analysis-plans/{id}:lock
POST /v1/pre-analysis-plans/{id}/amendments
POST /v1/designs/{id}:compile-analysis
```

### Falsification, replication, and generalization

```text
POST /v1/projects/{project_id}/falsification-plans
POST /v1/projects/{project_id}/replication-plans
POST /v1/projects/{project_id}/generalization-maps
POST /v1/projects/{project_id}/research-decisions
```

### Lineage and method state

```text
GET /v1/projects/{project_id}/method-state
GET /v1/objects/{id}/method-lineage
GET /v1/projects/{project_id}/claim-language-ceiling
```

## 3. Error codes

Required stable errors include:

```text
METHOD_PROFILE_REQUIRED
QUESTION_NOT_COMPILED
MATERIAL_AMBIGUITY_UNRESOLVED
CONCEPT_CHARTER_REQUIRED
ESTIMAND_REQUIRED
SCOPE_MISMATCH
CAUSAL_MODEL_REQUIRED
IDENTIFICATION_AUDIT_REQUIRED
IDENTIFICATION_FAILED
CLAIM_CEILING_EXCEEDED
PREANALYSIS_NOT_LOCKED
PREANALYSIS_IMMUTABLE
OUTCOME_INFORMED_AMENDMENT
KILL_CONDITION_TRIGGERED
REPLICATION_NOT_INDEPENDENT
GENERALIZATION_UNSUPPORTED
SYNTHETIC_FIXTURE_NOT_EVIDENCE
```

## 4. Required events

```text
method_profile.selected
question_model.compiled
question_model.reviewed
concept_charter.created
concept_charter.accepted
concept_charter.superseded
estimand.created
estimand.superseded
causal_model.created
causal_model.forked
evidence_search.started
evidence_record.verified
data_asset.transitioned
data_asset.rejected
design.generated
design.rejected
identification_audit.completed
claim_ceiling.changed
preanalysis_plan.locked
preanalysis_plan.amended
analysis_workflow.compiled
falsification_probe.completed
kill_condition.triggered
replication.completed
generalization_map.accepted
research_decision.accepted
method_dependency.invalidated
```

Every event uses the v0.1.1 event envelope and includes actor, score, project, method profile, causation, correlation, object revision, and policy decision.

## 5. State projections

The method-state projection displays:

- current accepted question and alternatives;
- active charters and operationalizations;
- estimands;
- causal models;
- evidence and data readiness;
- candidate and admitted designs;
- audit outcomes and claim ceilings;
- plan lock status;
- execution and falsification status;
- replication status;
- generalization constraints;
- pending research decisions;
- invalidated dependencies.

It MUST NOT collapse branches into a single progress percentage.

## 6. Concurrency

Locking and audit decisions require the expected object revision. A stale decision returns `409 REVISION_CONFLICT`. Method objects are append-only by revision; mutable workflow status is represented by events and materialized projections.
