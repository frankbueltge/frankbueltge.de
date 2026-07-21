# 09 — Question and concept compilation

## 1. Objective

Research begins by constructing a tractable problem, not by searching for text that resembles the user's wording. The Question Compiler and Concept and Measurement Service therefore convert an open request into explicit, reviewable commitments while preserving unresolved ambiguity.

## 2. QuestionModel

A `QuestionModel` contains:

- original question verbatim;
- normalized research question;
- claim type: `descriptive`, `associational`, `causal`, `predictive`, `mechanistic`, `interpretive`, `normative`, or `mixed`;
- unit of analysis;
- target population;
- treatment, exposure, intervention, or focal condition;
- comparator or counterfactual;
- outcome;
- time horizon;
- geography;
- candidate mechanisms;
- unresolved terms;
- alternative readings;
- required ethics or access reviews;
- compile confidence as a workflow signal, never epistemic confidence.

### 2.1 Ambiguity policy

The compiler MUST branch when two interpretations materially change design or meaning. For example, `support` may mean vote share, individual vote choice, intention, sympathy, or turnout. The system MUST NOT choose one silently.

### 2.2 Question-type policy

A causal formulation contains language such as `causes`, `increases`, `effect`, or a counterfactual contrast. If the available design later fails identification, the question may remain causal while the answer is downgraded to associational or unresolved.

## 3. ConceptMeasurementCharter

The charter is a local project constitution for meaning and measurement. It contains `ConceptDefinition` and `Operationalization` objects.

### 3.1 ConceptDefinition

Each concept records:

- working definition;
- excluded meanings;
- provenance and author;
- contested alternatives;
- temporal and geographic sensitivity;
- relation to neighboring concepts;
- whether it is observed, latent, constructed, or classified.

### 3.2 Operationalization

Each operationalization records:

- measure name and formula;
- level: individual, household, property, neighborhood, city, region, country;
- unit and scale;
- source or required data fields;
- expected measurement error;
- comparability conditions;
- threshold policy;
- missingness behavior;
- transformations;
- validation evidence;
- known groups for whom the measure behaves differently.

### 3.3 Classification systems

Classifications such as party families MUST be versioned by entity and time. A party may receive several labels under different taxonomies. The project MUST preserve the mapping and run sensitivity analyses where classification affects the primary outcome.

### 3.4 Non-equivalence

Measures are not interchangeable merely because they share a label. Housing-cost-to-income ratio, subjective affordability, residual income, and property-price-to-income ratio capture different mechanisms and populations. The charter MUST encode `equivalent`, `complementary`, `proxy_for`, `incompatible_with`, or `unknown_relation` links.

## 4. Compilation workflow

```text
raw question
  → term extraction
  → claim-type classification
  → ambiguity detection
  → alternative readings
  → concept inventory
  → operationalization proposals
  → measurement-risk review
  → human/practice acceptance
```

The output is accepted only when the reviewer can state what would count as treatment, outcome, unit, population, and non-answer.

## 5. Reference-question decomposition

For the housing and political-support question, the compiler MUST initially identify at least:

- housing-cost unaffordability;
- change in unaffordability;
- political support;
- right-populist;
- anti-establishment;
- European city;
- causal increase;
- 2015–2025.

The charter SHOULD propose separate measures for renters and owners, because price appreciation and rent pressure may have opposite material consequences. It MUST distinguish party families from general opposition or anti-incumbent voting.

## 6. Validation rules

A `QuestionModel` is invalid if:

- the original question is not preserved;
- claim type is absent;
- a causal question lacks a treatment/exposure and outcome;
- the unit and population are conflated;
- material ambiguity is omitted;
- the compiler invents a source or dataset;
- the normalized version narrows the question without recording the change.

A charter is invalid if:

- a key construct has no definition;
- a primary measure lacks a formula or field specification;
- a classification has no version;
- known incompatibilities are hidden;
- a threshold is selected without rationale;
- measurement error and missingness are absent.

## 7. Normative requirements

- **MRR-MTH-020**: Every project MUST preserve the raw question exactly as submitted.
- **MRR-MTH-021**: The Question Compiler MUST declare a claim type and MAY declare `mixed` only when each component is separately modeled.
- **MRR-MTH-022**: A causal question MUST define or explicitly mark unresolved treatment, outcome, unit, population, comparator, and horizon.
- **MRR-MTH-023**: Materially different interpretations MUST produce separate question branches or an explicit unresolved ambiguity.
- **MRR-MTH-024**: Normalization MUST NOT silently change scope, geography, population, ideology, or time.
- **MRR-MTH-025**: Every key concept MUST appear in a versioned `ConceptMeasurementCharter` before design admission.
- **MRR-MTH-026**: Every primary operationalization MUST declare formula, level, source fields, scale, missingness, error mechanisms, and comparability conditions.
- **MRR-MTH-027**: Classification objects MUST be time-versioned when entity classification can change over the study period.
- **MRR-MTH-028**: The system MUST preserve alternative operationalizations that can materially change the result.
- **MRR-MTH-029**: A measure MUST NOT be described as equivalent to another without a recorded equivalence rationale.
- **MRR-MTH-030**: User-provided definitions MUST be attributed and MAY be contested rather than silently replaced.
- **MRR-MTH-031**: The compiler MUST identify whether requested geographic units are analytically and administratively stable over time.
- **MRR-MTH-032**: The charter MUST separate latent constructs from directly observed variables.
- **MRR-MTH-033**: Thresholds MUST be versioned and included in sensitivity analysis when they affect treatment or outcome status.
- **MRR-MTH-034**: A question or charter revision after downstream execution MUST trigger impact review for estimands, designs, plans, and claims.
- **MRR-MTH-035**: A model-generated concept or classification MUST NOT become authoritative without review under the score's approval policy.

## 8. Acceptance scenarios

### Scenario Q-001 — Ambiguous support

Given a question using the term `support`, when the compiler cannot infer whether this means vote choice or vote share, then it creates separate interpretations and blocks design compilation until one is accepted or both are maintained.

### Scenario Q-002 — Party taxonomy revision

Given a party classification for 2015 and a documented ideological shift in 2021, when the taxonomy is revised, then the old classification remains attached to historical runs and affected downstream analyses become `review_required`.

### Scenario Q-003 — Incompatible affordability measures

Given rent-to-income and property-price-to-income measures, when a planner attempts to merge them into one variable without an accepted aggregation rule, then validation fails.
