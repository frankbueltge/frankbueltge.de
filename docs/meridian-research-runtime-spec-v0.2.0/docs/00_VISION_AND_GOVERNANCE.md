# 00 — Vision and governance

## 1. Product definition

Meridian Research Runtime is a federated research operating system that transforms an approved research brief into a traceable network of hypotheses, tasks, runs, evidence, counterevidence, claims, reviews, transfers, obligations, and corrections.

Its primary output is not a paper. Its primary output is an **auditable evidence and claim graph** from which papers, reports, datasets, notebooks, and public summaries can be projected.

## 2. Mission

MRR MUST enable human and machine researchers to coordinate complex research while preserving:

- local control over data and actions;
- exact provenance from claim to source or run;
- independent criticism and verification;
- explicit uncertainty, failure, and non-knowledge;
- the possibility of legitimate disagreement;
- correction propagation without central epistemic coercion;
- reversible institutional and technical evolution.

## 3. Governing principles

### P-01 — Immutable history, mutable constitution

Past states, decisions, runs, and artifacts MUST remain auditable. Policies, constitutions, role definitions, and workflows MAY be amended through versioned changes.

### P-02 — Evidence before narrative

Narratives MUST be generated from claims and evidence, not used as the authoritative source from which claims are reconstructed.

### P-03 — Local sovereignty

A practice or node MUST be able to refuse, narrow, modify, defer, or require approval for a task. The control plane MUST NOT bypass local policy.

### P-04 — Deterministic contracts, stochastic internals

Agent reasoning may be probabilistic. Interfaces, schemas, state transitions, permissions, and acceptance tests MUST be deterministic and machine-validatable.

### P-05 — Independence by construction

Proposal, execution, criticism, verification, and publication approval MUST be separated by role and permission. Independent verification cannot be simulated by repeatedly asking the same agent to reconsider its own output.

### P-06 — Failure is data

Null results, refusals, errors, unavailable sources, underpowered analyses, unresolved disagreements, and withdrawn claims MUST be preserved as first-class research records.

### P-07 — Least agency

Every component receives the minimum actions, data, network access, budget, and duration necessary for its task. Autonomy is capability-specific, not a global on/off setting.

### P-08 — Correction is normal operation

Correction is not an exceptional embarrassment. It is a standard domain event with impact analysis, notification, local response, and visible unresolved obligations.

### P-09 — Replaceability

No model vendor, workflow engine, vector database, publication format, or user interface may become the sole holder of research semantics.

### P-10 — No hidden convergence

The system MUST NOT silently collapse competing interpretations into one consensus. Synthesis must preserve material dissent, scope differences, and unresolved branches.

### P-11 — Parallel operation and empirical revision

MRR MUST NOT presume that a new architecture should replace a working research practice. Meridian Classic MAY continue to operate and evolve while MRR runs in shadow, challenger, or dual-run modes. Adoption decisions MUST be based on attributable comparative evidence and MAY be made capability by capability in either direction.

## 4. Scope for v1

MRR v1 covers:

- literature and document research;
- computational and data-analysis workflows;
- federated execution against locally governed nodes;
- evidence anchoring and claim lifecycle management;
- independent verification and correction propagation;
- qualitative field-research support in human-led or shadow mode;
- export of portable research objects and narrative projections.

## 5. Explicit non-goals for v1

MRR v1 MUST NOT:

- autonomously publish externally;
- autonomously contact research participants;
- replace ethics review, consent, or institutional authority;
- centralize raw sensitive field data by default;
- treat model-generated synthetic participants as empirical evidence;
- guarantee truth from reviewer scores or model confidence;
- operate physical laboratory devices without a separately approved safety architecture;
- optimize for paper count, novelty score, or citation count as a primary success metric.

## 6. Parallel operation and adoption policy

The immutable baseline and the live Meridian Classic system are separate concepts. Sealing a baseline preserves a comparison point; it does not suspend operation, development, or authoritative work in Meridian Classic.

- **MRR-GOV-021**: Creating MRR MUST NOT automatically decommission, pause, or prohibit further development of Meridian Classic.
- **MRR-GOV-022**: A content-addressed Meridian Classic baseline MUST be sealed before material comparative claims are made, while subsequent Classic runs and changes MUST remain attributable to exact versions and configurations.
- **MRR-GOV-023**: Meridian Classic and MRR MUST be executable in parallel for defined benchmark, pilot, or challenger tasks where data rights and operational constraints permit.
- **MRR-GOV-024**: Comparative results MUST identify the exact system version, policy profile, model/tool configuration, input snapshot, resource envelope, and evaluation rubric for each side.
- **MRR-GOV-025**: Migration or adoption decisions MUST be capability-specific, reversible, and supported by documented evaluation evidence. A whole-system cutover is never implied.
- **MRR-GOV-026**: Meridian Classic MAY remain indefinitely as an independent production, challenger, red-team, replication, or fallback practice.
- **MRR-GOV-027**: Material changes to either system MUST be versioned; no improvement or regression claim may combine results from materially different configurations without disclosure.
- **MRR-GOV-028**: Continued operation of Meridian Classic MUST NOT cause imported Classic claims to be treated as verified MRR claims. Imports remain `legacy_unverified` until they satisfy MRR evidence and verification contracts.

Three comparative operating modes are recognized:

1. **Baseline dual run**: both systems independently address the same bounded research assignment under as comparable a resource envelope as practical.
2. **Challenger run**: one system performs the primary task and the other concentrates on counterevidence, numeric checks, source-family analysis, correction discovery, or alternative hypotheses.
3. **Exploratory run**: one system investigates a materially different method or problem framing; results are compared for complementarity rather than ranked as if conditions were identical.

A task MAY remain in one system only. Parallel execution is required for selected evaluation cases, not for every production request.

## 7. Constitutional amendment protocol

Every amendment MUST include:

1. unique ADR or RFC identifier;
2. exact text or schema diff;
3. rationale and evidence;
4. affected requirements, objects, and migrations;
5. expected benefits and failure modes;
6. benchmark changes;
7. rollout and rollback procedure;
8. effective version and date;
9. human approver or approved governance process.

A constitution or policy change MUST NOT rewrite historical records. Existing runs retain the policy version under which they were executed.

## 8. Governance roles

- **Steward**: approves research scores, high-impact actions, releases, and amendments.
- **Planner/Proposer**: creates hypotheses, branch plans, and task proposals.
- **Executor**: performs approved tasks in a sandbox or local environment.
- **Skeptic**: searches for counterevidence, hidden assumptions, and alternative explanations.
- **Verifier**: independently checks sources, calculations, and reproducibility.
- **Chronicler**: seals artifacts, records state transitions, and validates provenance completeness.
- **Policy Authority**: evaluates local legal, ethical, data, and operational rules.
- **Methodologist**: reviews design validity and statistical or qualitative method fit.
- **Participant/Data Steward**: controls field-research data rights, withdrawals, and disclosure.

A natural person may hold multiple organizational roles, but the same execution principal MUST NOT both create and independently verify the same claim.

## 9. Success definition

MRR succeeds when it reduces unsupported certainty, preserves useful divergence, makes correction cheap and visible, and enables research work to move between autonomous practices without losing provenance or obligations.

It does not succeed merely because it produces fluent reports or completes many tasks.

## 10. v0.2 method-layer amendment

MRR is not only a governance and evidence ledger. Version 0.2 adds the Research Method Kernel described in `docs/08_RESEARCH_METHOD_KERNEL.md` through `docs/19_METHOD_IMPLEMENTATION_PLAN.md`.

The method layer does not create a common agenda or global ontology. Method profiles are local, versioned, contestable practice objects. The shared runtime enforces interfaces, provenance, policy, and claim ceilings while preserving methodological plurality.

A project is successful when it can produce a justified non-answer, kill a weak design, or narrow a claim. Output volume and positive findings are not success criteria.
