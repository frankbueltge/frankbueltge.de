# 08 — Research Method Kernel
## From governed evidence handling to executable research

## 1. Purpose

The Research Method Kernel (RMK) is the method layer of Meridian Research Runtime. Version 0.1.1 defined how research objects are authorized, executed, sealed, verified, transferred, and corrected. The RMK defines how an open question becomes a sequence of scientifically interpretable operations.

The kernel is not a universal scientific method, a global ontology, or a master researcher. It is a host for local, versioned `MethodProfile` implementations. Each profile declares the claim types it can support, the artifacts it requires, the identification or validity gates it applies, and the kinds of conclusions it may authorize.

The first complete profile is `causal_observational`. It supports causal questions where randomized assignment is unavailable or not yet known to be available. Other profiles may be added without making their assumptions global.

## 2. Architectural position

```text
Human or practice question
        │
        ▼
Research Score and governance boundary
        │
        ▼
RESEARCH METHOD KERNEL
  Question compilation
  Concept and measurement design
  Estimand construction
  Causal or validity model
  Evidence and data scouting
  Design generation
  Identification audit
  Pre-analysis compilation
  Falsification and replication
  Adaptive research decisions
        │
        ▼
MRR execution and evidence operating system
  Task Bundles · Nodes · Runs · Evidence Crates
  Claims · Verification · Transfers · Corrections
```

The kernel produces **method artifacts and executable plans**. It does not bypass the v0.1.1 governance layer. Every method-stage mutation is versioned; every execution still requires a valid `ResearchScore`, `TaskBundle`, policy decision, and local node acceptance.

## 3. Non-goals

The RMK MUST NOT:

- claim that one method profile is appropriate for all questions;
- silently convert normative, conceptual, artistic, or descriptive questions into causal questions;
- create a global party, population, geography, or concept taxonomy;
- infer causal effects from source volume, model fluency, or statistical significance alone;
- use LLM confidence as a validity measure;
- guarantee that available data can answer the requested question;
- hide that a research branch was killed, narrowed, or downgraded;
- choose publication rhetoric before identification and verification are complete.

## 4. Kernel components

### 4.1 Question Compiler

Transforms a natural-language prompt or structured request into a `QuestionModel`. It identifies claim type, unit, population, treatment or exposure, outcome, comparator, time horizon, geography, mechanisms, and unresolved terms. It may propose interpretations but MUST retain ambiguity until reviewed or explicitly branched.

### 4.2 Concept and Measurement Service

Creates a local `ConceptMeasurementCharter`. The charter distinguishes concepts from operationalizations, records measurement levels and error mechanisms, versions classifications, and specifies whether measures are interchangeable, complementary, or incompatible.

### 4.3 Estimand Builder

Creates one or more `Estimand` objects. An estimand states the exact quantity of interest, target population, unit, treatment contrast, outcome, time horizon, interference assumptions, censoring policy, and aggregation level.

### 4.4 Causal or Validity Model Builder

Creates a `CausalModel` for causal profiles or an equivalent validity model for other profiles. It stores nodes and typed edges such as `causes`, `confounds`, `mediates`, `selects_into`, `measures`, and `modifies_effect`. Competing models are first-class and MUST NOT be merged into premature consensus.

### 4.5 Evidence Scout

Searches prior research and creates an `EvidenceMatrix`. It separates discovery from verification, stores exact source records, identifies source families, records design and identification assumptions, and distinguishes primary evidence from commentary.

### 4.6 Data Scout

Builds `DataAssetProfile` records. It evaluates geographic and temporal resolution, unit consistency, access conditions, data class, missingness, revision history, joinability, licensing, cost, and methodological usefulness.

### 4.7 Design Generator

Generates candidate `ResearchDesign` objects from estimands, causal models, evidence, data assets, budgets, and policy constraints. It MUST include at least one design capable of returning `insufficient_evidence` where appropriate.

### 4.8 Identification Auditor

Produces an `IdentificationAudit`. For a causal design, the audit determines which assumptions identify the estimand, which diagnostics are required, which threats remain, and whether the design may support causal, associational, descriptive, or no claim.

### 4.9 Pre-analysis Compiler

Creates a lockable `PreAnalysisPlan` containing primary and secondary estimands, sample rules, transformations, model specifications, standard-error strategy, missing-data policy, tests, multiplicity rules, robustness analyses, and amendment procedure.

### 4.10 Analysis Compiler

Translates an eligible design and locked plan into deterministic workflow specifications and `TaskBundle` drafts. It MUST separate data preparation, diagnostic analysis, primary estimation, falsification, heterogeneity, and projection.

### 4.11 Falsification Engine

Creates a `FalsificationPlan` with pre-trend tests, placebos, negative controls, alternative measures, alternative taxonomies, boundary checks, and kill conditions. It may propose additional probes after results, but post-result probes are exploratory unless independently confirmed.

### 4.12 Replication Engine

Creates a `ReplicationPlan`. It defines independence dimensions and may request fresh code, independent analyst or model lineage, alternate retrieval, alternate dataset, or external node execution.

### 4.13 Generalization Mapper

Creates a `GeneralizationMap` stating where a result can and cannot travel. It records sampled and target populations, transport assumptions, institutional context, temporal validity, and known non-applicability.

### 4.14 Adaptive Research Manager

Creates `ResearchDecision` objects after evidence-bearing milestones. It may decide `continue`, `revise`, `kill`, `replicate`, `narrow_scope`, `expand_scope`, `switch_method`, `escalate_human_review`, or `stop_insufficient_evidence`. Decisions are proposals until accepted under score policy.

## 5. Core workflow

```text
Q0  raw question
Q1  QuestionModel reviewed
Q2  ConceptMeasurementCharter accepted
Q3  Estimand set and competing causal models accepted
Q4  EvidenceMatrix and DataAssetProfiles available
Q5  candidate ResearchDesigns generated
Q6  IdentificationAudits completed
Q7  eligible branches admitted to Hypothesis Forest
Q8  PreAnalysisPlan locked
Q9  executable workflows compiled and run
Q10 falsification and replication completed or explicitly waived
Q11 claims emitted with GeneralizationMap
Q12 ResearchDecision selects the next iteration
```

A stage MAY be revisited, but revisiting creates a new revision and may invalidate downstream objects. The impact service MUST mark dependent objects for review.

## 6. Proposal and authority boundary

LLMs and heuristic systems MAY draft any RMK object. They MUST NOT directly:

- lock a pre-analysis plan;
- pass an identification audit;
- authorize causal language;
- count a replication as independent;
- supersede a concept charter;
- kill a high-impact branch without the approval policy defined by the score;
- publish or contact participants.

Authoritative transitions require deterministic validation plus the configured human, practice, or independent-method review.

## 7. Method profile interface

Every `MethodProfile` MUST declare:

```yaml
profile_id: causal_observational
version: 1.0.0
supported_claim_types:
  - causal
  - associational
  - descriptive
required_objects:
  - QuestionModel
  - ConceptMeasurementCharter
  - Estimand
  - CausalModel
  - ResearchDesign
  - IdentificationAudit
  - PreAnalysisPlan
claim_gates:
  causal:
    - identification_audit in [pass, conditional_pass]
    - primary_plan_locked
    - required_diagnostics_passed
  associational:
    - measurement_charter_accepted
    - design_completed
forbidden_shortcuts:
  - significance_implies_causality
  - source_count_implies_independence
```

Profiles are local practice objects. The shared runtime validates their interfaces but does not canonically decide that one profile is epistemically superior to another.

## 8. Normative requirements

- **MRR-MTH-001**: Every method-bearing project MUST reference an approved `ResearchScore` and one versioned `MethodProfile`.
- **MRR-MTH-002**: A raw natural-language question MUST NOT directly create an executable analysis task.
- **MRR-MTH-003**: Every downstream method object MUST retain lineage to the exact question and score revisions from which it was derived.
- **MRR-MTH-004**: A method object generated by a model MUST remain a proposal until schema, policy, and review gates pass.
- **MRR-MTH-005**: Method-stage revisions MUST trigger dependency impact analysis.
- **MRR-MTH-006**: The system MUST support a terminal `insufficient_evidence` outcome without fabricating a substitute answer.
- **MRR-MTH-007**: Local method profiles MUST be versioned and MUST NOT silently change the interpretation of completed projects.
- **MRR-MTH-008**: The runtime MUST preserve competing method models and rejected designs with reasons.
- **MRR-MTH-009**: Narrative reports MUST be generated only after method and evidence objects exist; narrative structure MUST NOT determine the method path.
- **MRR-MTH-010**: A claim's allowed language MUST be derived from its method profile, design class, identification audit, diagnostics, and verification status.

## 9. First implementation boundary

The first RMK vertical slice is deterministic and single-node. It uses a synthetic housing-and-election fixture. The purpose is to prove method-state integrity, not to answer the empirical political question.

It MUST demonstrate:

1. structured question compilation;
2. two distinct operationalizations of housing affordability;
3. at least two estimands;
4. a causal model with a confounder, mediator, selector, and competing explanation;
5. two candidate designs;
6. one failed and one conditionally eligible identification audit;
7. a locked pre-analysis plan;
8. a deterministic analysis run;
9. a falsification failure that downgrades or kills one claim;
10. an independent replication record;
11. a bounded claim and generalization map;
12. an adaptive next-step decision.
