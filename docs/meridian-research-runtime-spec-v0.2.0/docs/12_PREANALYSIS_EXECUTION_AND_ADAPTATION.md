# 12 — Pre-analysis, executable research, and adaptive decisions

## 1. PreAnalysisPlan

The plan separates confirmatory commitments from exploratory freedom. It contains:

- project and score revision;
- method profile and design revision;
- primary and secondary estimands;
- analysis population;
- inclusion and exclusion rules;
- treatment and outcome construction;
- temporal alignment;
- geographic harmonization;
- covariate policy;
- estimator and model formula;
- standard-error or uncertainty strategy;
- missing-data strategy;
- weighting;
- multiplicity policy;
- diagnostics and pass/fail thresholds;
- falsification tests;
- robustness analyses;
- heterogeneity analyses;
- claim ceiling and downgrade rules;
- stopping and kill conditions;
- expected tables and artifacts;
- amendment procedure.

### 1.1 Locking

A plan may be `draft`, `reviewed`, `locked`, `amended`, `executed`, or `invalidated`. Locking creates a content hash and timestamp. Any later change creates an amendment object referencing the prior plan, reason, actor, whether outcome information was observed, and the resulting classification of affected analyses.

### 1.2 Exploration

Exploratory analyses are permitted. They MUST be labeled and cannot be promoted to confirmatory status within the same data exposure without an independent holdout, fresh dataset, or new preregistered replication.

## 2. Analysis Compiler

The compiler emits a workflow graph rather than free-form code instructions. Initial stages:

```text
ingest
validate
harmonize
construct_measures
build_analysis_table
descriptive_diagnostics
identification_diagnostics
primary_estimation
falsification
robustness
heterogeneity
replication_export
claim_candidate_generation
```

Each node declares deterministic or stochastic status, inputs, outputs, environment digest, resource policy, and failure contract.

### 2.1 Code generation

Models may draft code, but generated code is treated as an artifact requiring tests and review. The canonical workflow and parameter contract are separate from implementation language. A second implementation can therefore reproduce the analysis independently.

### 2.2 Data leakage prevention

The compiler MUST enforce which stages may inspect outcomes. For example, sample construction and treatment coding SHOULD occur without access to post-treatment outcomes where feasible. Diagnostic and exploratory access is logged.

## 3. ResearchDecision

A `ResearchDecision` records:

- milestone and evidence considered;
- decision type;
- reasons and failed or passed gates;
- impact on scope, design, score, branches, and budget;
- required approvals;
- next permitted actions;
- whether the decision is reversible;
- links to discarded alternatives.

Decision types:

```text
continue
revise_question
revise_measurement
revise_design
narrow_scope
expand_scope
switch_method
replicate
collect_more_data
kill_branch
stop_insufficient_evidence
escalate_human_review
```

The manager MUST NOT optimize solely for producing a positive result. Its objective is method progress under the score: stronger identification, clearer uncertainty, useful null results, or justified termination.

## 4. Adaptive loop

```text
milestone reached
    ↓
gate evaluation
    ↓
new evidence and failures summarized
    ↓
candidate decisions generated
    ↓
policy and human/practice review as required
    ↓
accepted ResearchDecision
    ↓
dependency impact and next tasks
```

Examples:

- Data unavailable → narrow scope or stop.
- Pre-trends fail → kill DiD branch, retain descriptive branch.
- Party taxonomy sensitivity reverses result → claim becomes contested; classification research branch opens.
- Independent replication fails → primary claim cannot become supported.
- One country drives estimate → generalization narrows or country-specific branches form.

## 5. Normative requirements

- **MRR-MTH-100**: Every confirmatory analysis MUST reference a locked `PreAnalysisPlan`.
- **MRR-MTH-101**: Locking MUST bind the exact plan bytes, actor, time, score, design, and data-version expectations.
- **MRR-MTH-102**: Post-lock changes MUST create explicit amendments and MUST NOT overwrite the prior plan.
- **MRR-MTH-103**: Amendments MUST record whether relevant outcome information was observed.
- **MRR-MTH-104**: Analyses affected by outcome-informed amendments MUST be labeled exploratory unless a valid independent confirmation path exists.
- **MRR-MTH-105**: The Analysis Compiler MUST emit a typed workflow graph with explicit inputs, outputs, parameters, and failure states.
- **MRR-MTH-106**: Generated analysis code MUST NOT become executable authority without tests, review, and a content hash.
- **MRR-MTH-107**: Primary estimation MUST NOT run when blocking identification diagnostics are unresolved.
- **MRR-MTH-108**: Every workflow stage MUST produce a run record on success, failure, timeout, cancellation, or policy denial.
- **MRR-MTH-109**: Claim candidates MUST reference the exact plan, design, audit, runs, and diagnostics that permit their language.
- **MRR-MTH-110**: The Adaptive Research Manager MUST support branch termination and `stop_insufficient_evidence` as successful research outcomes.
- **MRR-MTH-111**: Research decisions MUST cite evidence and gate results rather than model preference alone.
- **MRR-MTH-112**: Scope expansion MUST require a new generalization rationale and, where material, a score revision.
- **MRR-MTH-113**: A killed branch MUST remain inspectable and MUST NOT be silently removed from the hypothesis forest.
- **MRR-MTH-114**: Budget exhaustion MUST yield an explicit decision and incomplete-state record.
- **MRR-MTH-115**: The manager MUST NOT continue repeated analyses solely to obtain statistical significance.

## 6. Acceptance scenarios

### P-001 — Silent plan mutation blocked

Given a locked plan, when a client attempts to edit the model formula in place, then the API rejects the mutation and requires an amendment object.

### P-002 — Outcome-informed amendment

Given that primary outcomes have been inspected, when an exclusion rule is added, then resulting analyses are marked exploratory and cannot satisfy the original confirmatory gate.

### P-003 — Productive termination

Given unavailable required data and no valid substitute, when the manager evaluates feasibility, then it may issue `stop_insufficient_evidence`; the project remains complete and auditable rather than failed.
