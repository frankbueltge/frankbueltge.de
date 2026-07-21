# 13 — Falsification, replication, and generalization

## 1. FalsificationPlan

A falsification plan operationalizes how the preferred explanation could lose. It includes:

- hypothesis or estimand targeted;
- threat addressed;
- test or probe;
- expected result under the preferred model;
- expected result under competing models;
- pass, warning, and kill thresholds;
- data and timing requirements;
- multiplicity handling;
- consequence for design and claim status.

Initial probe classes:

- pre-trend and anticipation tests;
- placebo treatment dates;
- placebo populations;
- placebo outcomes;
- negative control exposures;
- negative control outcomes;
- alternative operationalizations;
- alternative classifications;
- alternative geographic boundaries;
- leave-one-unit or leave-one-country-out;
- specification curves or multiverse analysis;
- synthetic-data recovery tests;
- missingness and attrition sensitivity;
- unmeasured-confounding sensitivity;
- spillover and interference probes.

A robustness analysis that cannot change interpretation is not a falsification test.

## 2. ReplicationPlan

Replication dimensions include:

- fresh code path;
- independent principal;
- different model family and prompt lineage;
- alternate retrieval source;
- independently constructed dataset;
- alternate estimator targeting the same estimand;
- holdout geography or time;
- external node or practice;
- computational reproduction from frozen artifacts.

The plan classifies replication as:

```text
computational_reproduction
independent_reimplementation
conceptual_replication
data_replication
external_replication
```

Repeated execution of the same code on the same data is reproducibility, not independent replication.

## 3. GeneralizationMap

The map records:

- study population and target population;
- included and excluded countries, cities, and groups;
- institutional and policy context;
- time window;
- treatment versions;
- outcome taxonomy versions;
- sampling and support overlap;
- transport assumptions;
- known effect modifiers;
- observed heterogeneity;
- explicit non-claims;
- expiry or review date.

For the housing project, a claim based on selected renters in specific cities cannot become `European citizens` or `all anti-establishment parties` without an accepted transport argument.

## 4. Claim assembly

A method-aware claim contains:

- atomic assertion;
- claim type;
- estimand reference;
- concept and measurement versions;
- design and identification audit;
- evidence and counterevidence;
- falsification outcomes;
- replication status;
- generalization map;
- maximum and actual language level;
- uncertainty;
- invalidation triggers.

## 5. Normative requirements

- **MRR-MTH-120**: Every causal design MUST include a `FalsificationPlan` before primary claim support.
- **MRR-MTH-121**: Each falsification probe MUST declare the threat it addresses and the consequence of failure.
- **MRR-MTH-122**: A robustness check MUST NOT be labeled falsification unless a plausible outcome can weaken or invalidate the preferred claim.
- **MRR-MTH-123**: Triggered kill thresholds MUST deterministically affect branch or claim status.
- **MRR-MTH-124**: Primary causal claims MUST receive independent reimplementation or a documented waiver approved under the score.
- **MRR-MTH-125**: Replication independence MUST be assessed across principal, code, model, prompt, retrieval, data, and execution node.
- **MRR-MTH-126**: Re-running identical code and data MUST be labeled computational reproduction, not independent replication.
- **MRR-MTH-127**: A failed replication MUST block or contest support unless an adjudication explains the discrepancy.
- **MRR-MTH-128**: Every externally projected empirical claim MUST reference a `GeneralizationMap`.
- **MRR-MTH-129**: Generalization MUST NOT exceed observed support and accepted transport assumptions.
- **MRR-MTH-130**: Explicit non-claims and non-applicability conditions MUST be preserved in publication projections.
- **MRR-MTH-131**: Classification, threshold, and boundary sensitivity that changes substantive interpretation MUST create separate contested claim relations.
- **MRR-MTH-132**: Falsification and replication failures are evidence objects and MUST NOT be reduced to generic workflow errors.
- **MRR-MTH-133**: A claim MUST be downgraded when its method dependencies are superseded or invalidated.
- **MRR-MTH-134**: The system MUST support a result that is locally causal but not transportable beyond the study context.
- **MRR-MTH-135**: Narrative synthesis MUST distinguish reproducibility, replication, robustness, falsification, and generalization.

## 6. Housing-project probes

The reference project MUST support fixtures for:

- alternate housing burden thresholds;
- rent-based versus price-based exposure;
- right-populist versus broad anti-establishment taxonomy;
- pre-treatment pseudo-events;
- unaffected owner subgroup;
- unrelated electoral outcome;
- leave-one-country-out analysis;
- city-boundary crosswalk variant;
- residential-mobility adjustment;
- independent implementation of the primary estimator.
