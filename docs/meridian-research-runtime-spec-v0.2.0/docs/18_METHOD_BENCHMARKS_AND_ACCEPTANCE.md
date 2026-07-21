# 18 — MethodBench, gates, and acceptance

## 1. New hard gates

### G-M01 Question integrity

No executable analysis may originate directly from an uncompiled raw question.

### G-M02 Measurement integrity

Primary concepts and operationalizations are versioned, formula-complete, and linked to known error and comparability constraints.

### G-M03 Estimand integrity

Every causal claim maps to an explicit estimand with compatible unit, population, exposure, and outcome.

### G-M04 Identification integrity

Causal language is impossible without an accepted audit and passed blocking diagnostics.

### G-M05 Pre-analysis integrity

Locked plans are immutable; amendments preserve timing and outcome-exposure status.

### G-M06 Falsification integrity

At least one probe can materially weaken each primary causal branch, and triggered kill conditions propagate.

### G-M07 Replication integrity

Independence is measured rather than asserted; identical pipelines do not count as independent replication.

### G-M08 Generalization integrity

Claims cannot exceed their generalization map.

### G-M09 Synthetic-fixture isolation

Synthetic test data and outputs cannot become empirical evidence or public research claims.

### G-M10 Productive non-answer

The system can complete with `insufficient_evidence`, `method_invalidated`, or bounded association without generating a causal conclusion.

## 2. Meridian MethodBench families

```text
MB-QST  question type, ambiguity, and scope
MB-MEA  concept and measurement integrity
MB-EST  estimand construction and scope alignment
MB-DAG  causal-model consistency and competing explanations
MB-DAT  evidence and data readiness
MB-IDN  design and identification auditing
MB-PRE  pre-analysis lock and amendment behavior
MB-FAL  falsification and kill-condition propagation
MB-REP  replication independence and discrepancy handling
MB-GEN  generalization and non-claim boundaries
MB-ADP  adaptive decision quality
MB-MIX  mixed-method integration without false synthesis
```

## 3. Initial benchmark fixtures

- ambiguous `support` term;
- treatment and outcome reversed;
- aggregate data used for individual claim;
- post-treatment control included as confounder;
- invalid instrumental variable pathway;
- failing pre-trends;
- hidden city-boundary change;
- taxonomy revision that reverses result;
- outcome-informed sample exclusion;
- repeated identical code mislabeled replication;
- one-country-driven estimate;
- synthetic fixture submitted as evidence;
- no usable data but model proposes substitute numbers;
- contradictory qualitative mechanism evidence;
- valid `stop_insufficient_evidence` decision.

## 4. End-to-end scenarios

### E2E-M01 — Deterministic method slice

Compiles the housing question, accepts a charter, creates estimands, audits two designs, locks a plan, runs a synthetic workflow, triggers a kill condition, records replication discrepancy, and emits no unsupported causal claim.

### E2E-M02 — Question revision impact

A party taxonomy revision invalidates downstream outcome construction, pre-analysis plan, runs, and claims without altering historical bytes.

### E2E-M03 — Data unavailability

A required panel remains unavailable. The manager narrows scope or stops; no approximate dataset is silently substituted.

### E2E-M04 — Claim ceiling enforcement

An associational design submits causal wording and receives a stable domain error.

### E2E-M05 — Mixed-method contradiction

A quantitative association and qualitative counter-mechanism remain separately supported and linked as contradictory or scope-modifying, not averaged.

## 5. Quality metrics

- ambiguity recall;
- scope-consistency error rate;
- causal-language false-allow rate;
- measurement-version coverage;
- identification-threat recall;
- kill-condition execution rate;
- outcome-informed amendment detection;
- replication-independence classification accuracy;
- generalization-overreach rate;
- valid non-answer rate;
- human review time;
- cost per admitted design;
- proportion of rejected branches with preserved rationale.

## 6. Definition of Done for v0.2 method slice

The method slice is complete only when:

1. all new schemas validate;
2. all housing examples validate;
3. task packets parse;
4. method state transitions have unit and property tests;
5. claim-ceiling policy is enforced end to end;
6. locked plans reject mutation;
7. kill conditions traverse dependencies;
8. replication independence is computed from declared dimensions;
9. synthetic artifacts are technically blocked from empirical claim support;
10. `make test-method`, `make test-contract`, and `make test-e2e-method` pass;
11. the reference scenario ends with a bounded or non-answer state, not a hard-coded positive result.
