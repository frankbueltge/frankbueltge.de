# 05 — Evaluation, benchmarks, and acceptance

## 1. Evaluation principle

MRR is accepted through observable behavior, not through fluent demonstrations. Every major requirement must map to one or more automated tests, benchmark fixtures, or documented human-review protocols.

The evaluation stack has six layers:

1. schema and unit tests;
2. state-machine and property tests;
3. service contract tests;
4. integration tests across storage, workflow, and node boundaries;
5. end-to-end research scenarios;
6. adversarial, privacy, and benchmark evaluation.

## 2. Hard release gates

The following are binary gates. A release cannot claim conformance if any gate fails.

### G-001 Object integrity

- 100% of authoritative objects have stable ID, revision, creator, timestamp, and content hash.
- Sealed artifacts reject mutation.
- Cross-practice objects fail closed on invalid signature, hash, expiry, recipient, or replay nonce.

### G-002 State integrity

- All state transitions are enforced by domain services.
- Invalid transitions return stable errors and create no partial authoritative state.
- Event and materialized state remain transactionally consistent through the outbox pattern.

### G-003 Evidence integrity

- A `supported` claim cannot exist without support evidence and required verification.
- Citation anchors must resolve against the referenced version or carry an explicit unresolved reason.
- Numeric verification cannot return `verified` without recomputation or an approved impossibility rationale.

### G-004 Role separation

- An executor cannot independently verify or approve its own result.
- Repeated reviews from the same declared reasoning lineage do not count as independent.
- A4 actions cannot bypass human approval.

### G-005 Data sovereignty

- Raw `SENSITIVE` and `PARTICIPANT_IDENTIFIABLE` fixtures cannot leave the local node under default policy.
- Denied exports produce policy decisions and no leaked content in payloads, logs, traces, or errors.

### G-006 Correction propagation

- All affected objects in the benchmark dependency graph are discovered.
- Cycles terminate.
- Notifications and obligations are idempotent.
- Local recipient decisions remain visible and are not overwritten.

### G-007 Explicit failure

- Timeout, refusal, cancellation, null result, not found, unavailable source, invalid method, and contradiction remain distinct terminal or epistemic states.
- No missing dependency is replaced by fabricated content.

### G-008 Reproducible deterministic slice

For deterministic tasks, the same approved task, input hashes, environment digest, parameters, and code revision must reproduce the expected output hash on a clean runner.

### G-009 Comparative validity

This gate applies to any claim that Meridian Classic or MRR is superior, that a capability should move, or that one system should be retired for a task class. Such a claim is non-conformant unless:

- both outputs are attributable to exact system and configuration versions;
- the assignment, available inputs, data rights, time window, and resource envelope are equal or all material asymmetries are disclosed;
- evaluators use a predefined rubric and are blinded to system identity where practical;
- quality, error, cost, latency, and human-review effort are reported together;
- the conclusion is based on more than one favorable anecdote or stochastic run;
- `inconclusive`, `complementary`, and `retain both` are valid outcomes.

## 3. MeridianBench

`MeridianBench` is the versioned evaluation corpus. It contains public, synthetic, licensed, and internally governed fixtures. Every fixture declares data rights and expected checks.

### 3.1 Benchmark families

#### MB-CIT — Citation and evidence anchoring

Cases:

- source supports exact claim;
- source supports only narrower scope;
- source contradicts claim;
- source is cited but inaccessible;
- citation points to wrong page or version;
- quote is accurate but context reverses meaning;
- URL content changed after retrieval;
- claim is not found.

Metrics:

- anchor resolution rate;
- support/contradiction classification;
- false-support rate;
- scope-leakage rate;
- correct unknown rate.

#### MB-NUM — Numeric fidelity

Cases:

- numerator/denominator swap;
- percentage vs percentage-point confusion;
- unit conversion;
- rounded number copied across sources;
- table extraction error;
- different population or time window;
- recomputable analysis with known output;
- unreproducible result with missing input.

Metrics:

- exact numeric accuracy;
- recomputation success;
- unit and denominator accuracy;
- false-verification rate.

#### MB-SRC — Source families

Cases:

- syndicated press release;
- multiple articles sharing one dataset;
- independent replications;
- review articles sharing primary sources;
- uncertain derivation lineage.

Metrics:

- source-family precision, recall, and F1;
- effective independent family count;
- over-collapse and under-collapse rates.

#### MB-COR — Corrections

Cases:

- source retraction;
- wrong statistical value;
- changed consent status;
- revoked node trust;
- caveat lost during transfer;
- cyclic dependency graph;
- offline recipient;
- recipient rejects correction.

Metrics:

- affected-object recall;
- false impact rate;
- time/event count to complete impact analysis;
- notification coverage;
- caveat survival.

#### MB-FED — Federation

Cases:

- node accepts;
- node modifies task;
- origin rejects modification;
- node requires human approval;
- node is offline;
- signature invalid;
- task replayed;
- partial result returned;
- data export denied but aggregate allowed.

Metrics:

- protocol correctness;
- policy compliance;
- idempotency;
- recovery without state corruption.

#### MB-QUAL — Qualitative and field research

Cases:

- emotional nuance missed by structural coding;
- rare deviant case;
- indirect identifier in a quote;
- participant withdrawal;
- conflicting human and model coding;
- agent sampling proposal that narrows diversity;
- transcript low-confidence span;
- synthetic respondent mislabeled as real.

Metrics:

- evidence-span fidelity;
- deviant-case recall;
- disclosure-risk detection;
- preservation of analytic disagreement;
- influence logging completeness.

#### MB-CMP — Comparative operation and capability adoption

Cases:

- identical bounded assignment under matched resource limits;
- unavoidable source or tool asymmetry disclosed before evaluation;
- Meridian Classic performs primary work while MRR acts as challenger;
- MRR performs primary work while Meridian Classic acts as challenger;
- material configuration drift between nominally repeated runs;
- one system returns a justified refusal or explicit unknown;
- mixed result where different capabilities are superior;
- reviewer preference changes after system identity is revealed.

Metrics:

- supported-claim precision and false-support delta;
- citation, numeric, source-family, and correction-performance delta;
- useful novel counterevidence and alternative-hypothesis yield;
- human review and adjudication time;
- machine cost and time-to-verification;
- rubric-based usefulness by task class;
- configuration-attribution completeness;
- blinded versus revealed reviewer-preference delta.

#### MB-INJ — Prompt injection and tool safety

Cases:

- malicious instructions embedded in a PDF;
- source asks model to reveal secrets;
- generated code attempts network egress;
- tool-call parameter smuggling;
- oversized archive and path traversal;
- source attempts to change role or system prompt.

Metrics:

- unauthorized action rate, whose hard target is zero;
- detection and denial rate;
- sensitive-content leakage rate, whose hard target is zero.

## 4. Initial calibrated targets

These are provisional performance targets, not immutable constitutional truths. They must be updated from baseline measurements through an ADR.

| Metric | Initial target |
|---|---:|
| Valid citation-anchor resolution | >= 0.95 |
| False support on MB-CIT | <= 0.02 |
| Correct explicit unknown on unsupported cases | >= 0.90 |
| Numeric verification accuracy | >= 0.95 |
| Source-family F1 | >= 0.85 |
| Correction affected-object recall | 1.00 on deterministic fixtures |
| Critical policy violation rate | 0 |
| A4 approval bypass rate | 0 |
| Deterministic replay success | 1.00 for reference tasks |
| Required provenance field completeness | 1.00 |

A target may not hide subgroup failures. MB-QUAL and privacy results must be reported by data class, language, participant group where lawful, and analysis mode.

## 5. Test matrix

| Requirement area | Unit | Property | Contract | Integration | E2E | Adversarial |
|---|---:|---:|---:|---:|---:|---:|
| Object identity/hash | yes | yes | yes | yes | yes | yes |
| State machines | yes | yes | yes | yes | yes | yes |
| Node protocol | yes | yes | yes | yes | yes | yes |
| Sandbox | yes | no | yes | yes | yes | yes |
| Claim/evidence graph | yes | yes | yes | yes | yes | yes |
| Review independence | yes | yes | yes | yes | yes | yes |
| Correction impact | yes | yes | yes | yes | yes | yes |
| Field policy | yes | yes | yes | yes | yes | yes |
| Projection | yes | no | yes | yes | yes | yes |

## 6. Reference end-to-end scenarios

### E2E-001 Single-node evidence loop

1. Approve Research Score.
2. Create confirmatory and falsification branches.
3. Accept a deterministic local task.
4. Execute in a sandbox.
5. Seal Evidence Crate.
6. Create a claim.
7. Run independent verification.
8. Mark claim supported or contested.
9. Export portable bundle.

Pass criteria: all hashes resolve, no forbidden role overlap, deterministic replay succeeds, and export contains required provenance.

### E2E-002 Federated refusal and modification

1. Origin offers a task requesting row-level output.
2. Target policy allows only aggregate output.
3. Target proposes a modified task.
4. Origin accepts modification.
5. Target executes and returns aggregate crate.

Pass criteria: no row-level bytes leave the node; both task revisions and decisions remain visible.

### E2E-003 Correction propagation

1. A supported claim is transferred and used in downstream claims and a publication.
2. Its source is invalidated.
3. Correction impact traverses all edges.
4. Recipients respond differently.

Pass criteria: every dependency is flagged; recipient autonomy is preserved; unresolved public correction is visible.

### E2E-004 Field-research shadow mode

1. Local node ingests consented transcript.
2. Human and model conduct separate coding.
3. Model proposes an interview follow-up and sampling change.
4. Human accepts one and rejects one.
5. A quote is blocked as indirectly identifying.
6. Only de-identified code-level results transfer.

Pass criteria: raw transcript stays local, influence decisions are logged, disagreement is preserved, and disclosure policy blocks the quote.

### E2E-005 Meridian Classic and MRR dual run

1. Seal an immutable Meridian Classic baseline and record the live Classic configuration.
2. Define one comparison case, input snapshot, rights, budget, stop conditions, and rubric.
3. Run Meridian Classic and MRR independently or in declared challenger roles.
4. Normalize outputs into claim, evidence, counterevidence, uncertainty, cost, and effort views without upgrading Classic imports to verified MRR state.
5. Conduct blinded evaluation where practical.
6. Record one of `promote_mrr_capability`, `retain_classic_capability`, `combine_capabilities`, `continue_dual_run`, or `inconclusive`.

Pass criteria: exact configurations and asymmetries are visible, both histories remain intact, no automatic cutover occurs, and the decision is capability-specific and reversible.

## 7. Property-based tests

Minimum properties:

- Canonical serialization produces the same hash regardless of map key insertion order.
- Any mutation of signed semantic content invalidates the signature.
- No invalid state transition succeeds for randomly generated transition sequences.
- Correction traversal terminates for arbitrary finite directed graphs, including cycles.
- Idempotent command replay produces one authoritative object and stable response semantics.
- Classification cannot become less restrictive without a recorded declassification decision.
- A receiving practice cannot modify a sender object without creating a new local revision or adaptation.

## 8. Model evaluation protocol

Model-dependent components require frozen evaluation profiles:

- exact model/provider/profile identifier;
- prompt and tool-schema version;
- fixed fixture set;
- multiple runs where stochasticity matters;
- cost and latency report;
- error taxonomy;
- comparison to deterministic and human baselines;
- subgroup and language analysis where relevant;
- no use of the test labels in prompts or retrieval sources.

A model upgrade is a behavior change and must re-run affected benchmark families before promotion.

## 9. Dual-run and challenger evaluation protocol

Every formal Meridian Classic/MRR comparison MUST define before execution:

- comparison case identifier and task class;
- common research question, scope, non-goals, and stopping conditions;
- input and source snapshot or disclosed differences;
- data rights and local-policy constraints;
- system, code, policy, prompt, model, tool, and environment versions;
- budget, runtime, network, and human-intervention envelope;
- primary and challenger responsibilities;
- evaluation rubric and adjudication process;
- conditions under which the result is considered inconclusive.

Outputs SHOULD be normalized into comparable views, but semantic differences MUST NOT be erased merely to make scoring easier. A justified refusal, explicit unknown, or narrower well-supported claim may be better than a fluent complete-looking answer.

Blind evaluation SHOULD be used for output quality where practical. Operational metrics such as cost, provenance completeness, policy compliance, and correction behavior remain unblinded system facts. Evaluation MUST preserve both the blinded judgment and any later judgment after system identity is revealed.

No capability is adopted or retired based on a single case. Decisions MUST state the task classes for which they apply and one of these outcomes:

- `promote_mrr_capability`;
- `retain_classic_capability`;
- `combine_capabilities`;
- `continue_dual_run`;
- `inconclusive`.

Capabilities MAY move in either direction. A useful MRR component may be integrated into Meridian Classic, and a stronger Classic component may remain authoritative or be adapted into MRR.

## 10. Human evaluation

Human adjudication is required when no objective ground truth exists. The protocol must state:

- adjudicator expertise and conflicts;
- blind or non-blind condition;
- rubric;
- disagreement handling;
- evidence available to adjudicators;
- whether machine suggestions were visible;
- retention of minority judgments.

Inter-rater agreement may be reported, but disagreement is not automatically error.

## 11. Definition of Done

A feature is done only when:

1. requirement IDs are identified;
2. implementation and migration are complete;
3. schemas and API documentation are updated;
4. positive, negative, authorization, and failure-path tests exist;
5. observability is added;
6. security and privacy impact are reviewed;
7. relevant benchmarks pass;
8. no TODO or placeholder path remains;
9. rollback or compatibility behavior is documented;
10. a separate reviewer verifies acceptance evidence.

## 12. Promotion policy

Environments:

```text
local -> test -> benchmark -> pilot -> production
```

Promotion requires immutable build artifacts and benchmark evidence. A component that passes unit tests but fails benchmark or policy gates cannot be promoted by manual optimism alone; an explicit signed risk acceptance is required and cannot waive legal, consent, or critical safety constraints.

## 13. v0.2 method gates

The method-specific hard gates, benchmarks, fixtures, and end-to-end scenarios in `docs/18_METHOD_BENCHMARKS_AND_ACCEPTANCE.md` are additive to G-001 through G-009. A release may not claim method-kernel completion while any G-M01 through G-M10 fails.
