# 14 — Method profiles

## 1. Why profiles exist

Meridian must not turn one preferred method into the constitution of all research. A profile is a local, versioned operational contract that defines what objects, validity gates, and claim types apply to one family of inquiry.

## 2. Common interface

Every profile declares:

- profile identifier and semantic version;
- owning practice;
- supported question and claim types;
- required and optional method objects;
- required reviewer competencies;
- design and execution adapters;
- claim-language rules;
- mandatory falsification or validation procedures;
- replication expectations;
- ethics and data restrictions;
- known exclusions and inappropriate uses;
- benchmark suite;
- migration policy.

## 3. Initial profiles

### 3.1 `causal_observational`

For nonrandomized causal questions. Requires estimand, causal model, design, identification audit, pre-analysis plan, falsification, and generalization. Causal language is gated.

### 3.2 `audit_reanalysis`

For checking published claims, calculations, citations, datasets, and instruments. Requires source anchors, reconstruction plan, independent recomputation, discrepancy taxonomy, and correction path.

### 3.3 `systematic_evidence_synthesis`

For structured literature synthesis. Requires search strategy, screening protocol, evidence matrix, risk-of-bias model, source-family analysis, and synthesis rule.

### 3.4 `computational_experiment`

For code-executable interventions or simulations. Requires environment contract, experimental factors, seeds, benchmark tasks, ablation plan, and external-validity limits.

### 3.5 `qualitative_field`

For interviews, observation, documents, and situated interpretation. Requires consent, field protocol, positionality and reflexivity records, coding or analytic approach, deviant-case search, traceable excerpts, and disclosure review.

### 3.6 `mixed_methods`

Coordinates two or more profiles without erasing their different validity claims. Requires an integration question and explicit rules for convergence, complementarity, contradiction, and silence.

## 4. Profile selection

The Question Compiler proposes profiles; a reviewer accepts one or several. Selection considers:

- question type;
- desired claim;
- available intervention or variation;
- data and field access;
- ethics;
- resources;
- need for explanation versus estimation;
- known limitations.

Selecting a profile does not guarantee feasibility. Scouting and identification may later require a switch.

## 5. Profile interoperability

Profiles exchange through typed objects, not a shared universal interpretation. For example:

- `causal_observational` may emit city cases for `qualitative_field` mechanism study;
- `qualitative_field` may reveal a missing mediator and trigger a causal-model revision;
- `audit_reanalysis` may invalidate an evidence row used by synthesis;
- `computational_experiment` may test estimator behavior but cannot by itself establish real-world causal effects.

## 6. Normative requirements

- **MRR-MTH-180**: Every method-bearing branch MUST declare one or more versioned method profiles.
- **MRR-MTH-181**: A profile MUST declare supported claim types and explicit inappropriate uses.
- **MRR-MTH-182**: Profile selection MUST be reviewable and may be contested.
- **MRR-MTH-183**: A profile change that alters claim validity MUST create a new branch or revision and trigger dependency review.
- **MRR-MTH-184**: Mixed-method integration MUST preserve the validity regime and provenance of each contributing profile.
- **MRR-MTH-185**: The runtime MUST NOT create one global ranking of method profiles.
- **MRR-MTH-186**: Profiles MAY share technical services but MUST NOT inherit epistemic permissions implicitly.
- **MRR-MTH-187**: Every production profile MUST ship with benchmarks and at least one negative or failure fixture.
- **MRR-MTH-188**: Local practices MAY reject or fork a profile without changing the shared runtime contract.
- **MRR-MTH-189**: The first production profile for v0.2 is `causal_observational`; other profiles remain contract stubs unless separately accepted.
