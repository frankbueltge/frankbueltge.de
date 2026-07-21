# 10 — Causal inference, estimands, design generation, and identification

## 1. Purpose

A causal question is not answered by adding controls to a regression. The causal method profile requires explicit estimands, competing causal models, candidate designs, and an identification audit before causal language is possible.

## 2. Estimand

An `Estimand` defines the target quantity, not merely a model coefficient.

Required fields include:

- target unit and population;
- treatment or exposure definition;
- treatment contrast;
- outcome and measurement time;
- assignment or exposure time;
- aggregation level;
- estimand family, such as ATE, ATT, event-study effect, local average treatment effect, controlled direct effect, or descriptive contrast;
- interference assumptions;
- censoring and attrition policy;
- missing potential-outcome assumptions;
- estimand-specific exclusions;
- relation to policy or substantive interpretation.

### 2.1 Multiple estimands

The housing reference project should maintain at least:

1. an individual-level renter estimand;
2. a city- or district-level aggregate estimand;
3. a compositional or residential-sorting estimand;
4. heterogeneity estimands for tenure and institutional context.

These are distinct claims and MUST NOT be collapsed.

## 3. CausalModel

The model is a versioned directed graph plus narrative assumptions. Node types include exposure, outcome, confounder, mediator, selector, modifier, measurement, context, and latent factor. Edge types include:

- `causes`;
- `confounds`;
- `mediates`;
- `selects_into`;
- `measures`;
- `modifies_effect`;
- `induces_missingness`;
- `shares_common_cause`;
- `unknown_relation`.

Every causal model MUST have an author and lens. It is a local analytic map, not a complete ontology of the domain.

### 3.1 Competing models

For the housing question, required competing models include:

- material pressure;
- status threat;
- anti-incumbent accountability;
- residential sorting;
- reverse selection;
- context-dependent or null effect.

A design must specify which models it can distinguish and which remain observationally equivalent.

## 4. ResearchDesign

A `ResearchDesign` contains:

- target estimands;
- design family;
- sample frame;
- treatment assignment or exposure mechanism;
- comparator construction;
- required data assets;
- identification assumptions;
- estimation plan summary;
- diagnostics;
- falsification requirements;
- expected failure modes;
- resource estimate;
- ethical and access constraints;
- output claim ceiling.

Supported initial design families:

- randomized experiment;
- natural experiment;
- difference-in-differences;
- interrupted time series;
- event study;
- synthetic control;
- instrumental variables;
- regression discontinuity;
- panel fixed effects;
- matching or weighting;
- longitudinal individual panel;
- cross-sectional association;
- descriptive decomposition;
- qualitative mechanism study;
- replication or reanalysis.

The profile MUST distinguish design name from actual identification quality. A project labeled `difference_in_differences` does not pass merely because it uses that estimator.

## 5. IdentificationAudit

The audit is an adversarial assessment with one of four outcomes:

- `pass` — design may support the declared causal estimand if required diagnostics pass;
- `conditional_pass` — causal language remains blocked until named conditions and diagnostics pass;
- `downgrade` — design may support only associational or descriptive claims;
- `fail` — design is not admitted to execution as an answer to the target estimand.

The audit records:

- identifying assumptions;
- plausibility arguments and evidence;
- testable implications;
- untestable assumptions;
- overlap and positivity;
- measurement validity;
- interference;
- attrition and selection;
- timing and anticipation;
- concurrent shocks;
- spatial dependence;
- model dependence;
- external validity;
- required negative controls;
- kill conditions;
- maximum allowed claim language.

### 5.1 Claim-language ceiling

The audit issues a machine-enforceable `claim_ceiling`:

```text
causal_bounded
causal_local
associational_adjusted
associational_unadjusted
descriptive
mechanism_hypothesis
insufficient_evidence
```

The Claim Service MUST reject language above the ceiling.

## 6. Design comparison

Candidate designs are compared on a Pareto basis rather than one scalar score:

- identification strength;
- measurement validity;
- coverage;
- feasibility;
- ethics;
- privacy;
- cost;
- time;
- reproducibility;
- dependence on fragile assumptions;
- generalizability.

The system MUST preserve why a design was deferred or rejected.

## 7. Kill conditions

A design MUST define conditions that terminate or downgrade it. Examples:

- strong differential pre-trends;
- no overlap;
- treatment timing follows outcome changes;
- concurrent policy change inseparable from treatment;
- instrument violates exclusion restriction based on identified pathway;
- treatment measure changes definition during the period;
- geographic crosswalk error exceeds accepted threshold;
- outcome classification sensitivity reverses the principal result;
- primary estimate is entirely driven by one country or election;
- required data cannot be legally or technically accessed.

Kill conditions are not optional caveats added after a favorable result.

## 8. Normative requirements

- **MRR-MTH-040**: Every causal branch MUST reference at least one explicit `Estimand`.
- **MRR-MTH-041**: An estimand MUST define unit, population, exposure contrast, outcome, horizon, aggregation, and interference assumptions.
- **MRR-MTH-042**: Individual-level and aggregate-level estimands MUST remain distinct.
- **MRR-MTH-043**: Post-treatment variables MUST NOT be treated as ordinary confounders without explicit justification.
- **MRR-MTH-044**: Every causal branch MUST have a versioned causal model or a documented reason why a graph representation is unsuitable.
- **MRR-MTH-045**: The causal model MUST distinguish confounders, mediators, selectors, modifiers, and measurements.
- **MRR-MTH-046**: At least one competing causal explanation MUST be represented for a nontrivial observational causal question.
- **MRR-MTH-047**: A `ResearchDesign` MUST declare which estimand it targets and which competing models it can discriminate.
- **MRR-MTH-048**: Design family labels MUST NOT substitute for an identification audit.
- **MRR-MTH-049**: Every causal design MUST receive an `IdentificationAudit` before primary execution.
- **MRR-MTH-050**: The audit MUST issue a claim-language ceiling enforced by the Claim Service.
- **MRR-MTH-051**: A failed audit MUST block causal execution or explicitly convert the branch to a different claim type.
- **MRR-MTH-052**: A conditional pass MUST list all blocking diagnostics and conditions.
- **MRR-MTH-053**: Every design MUST contain at least one substantive kill condition.
- **MRR-MTH-054**: Triggered kill conditions MUST create a terminal or downgraded research decision; they MUST NOT be hidden in narrative caveats.
- **MRR-MTH-055**: Candidate designs MUST be compared across multiple dimensions; a single opaque ranking score is prohibited.
- **MRR-MTH-056**: The system MUST preserve rejected designs, audit findings, and rejection reasons.
- **MRR-MTH-057**: A regression coefficient MUST NOT be equated with an estimand unless the mapping and assumptions are explicit.
- **MRR-MTH-058**: Statistical significance MUST NOT raise the claim ceiling.
- **MRR-MTH-059**: Failure to identify a causal effect MUST permit associational, descriptive, or insufficient-evidence outputs where valid.

## 9. Acceptance scenarios

### C-001 — Correlation cannot become causality

Given a cross-sectional city regression and no identification strategy, when a claim is submitted as causal, then the Claim Service rejects it and reports the audit ceiling `associational_adjusted`.

### C-002 — Pre-trend failure

Given a difference-in-differences design with a kill condition for material differential pre-trends, when the diagnostic fails, then the branch becomes `method_invalidated` or is downgraded according to the predeclared rule.

### C-003 — Aggregate and individual claims

Given city-level vote-share data only, when a claim asserts that individual renters changed their vote, then validation rejects the scope mismatch.
