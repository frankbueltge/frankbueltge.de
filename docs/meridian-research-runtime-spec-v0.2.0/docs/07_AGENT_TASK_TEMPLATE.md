# 07 — Coding-agent task packets

## 1. Why task packets are required

Codex or Claude should not receive “implement the whole Meridian system” as one prompt. Large unbounded prompts force the model to invent architecture, miss invariants, and produce patches that are hard to review.

Every assignment is therefore a bounded task packet. The specification remains the source of truth; the packet selects a small part of it.

## 2. Canonical task packet

```yaml
task_id: E1-T02
title: Implement canonical object identity, hashing, and signatures
status: approved
objective: >
  Provide framework-independent primitives for MRR object IDs, revisions,
  canonical serialization, SHA-256 content hashes, and Ed25519 signatures.

source_of_truth:
  - docs/01_SYSTEM_SPEC.md#non-functional-requirements
  - docs/02_DOMAIN_MODEL.md#identity-revision-and-hashing
  - docs/04_SECURITY_AND_POLICY.md#federated-security
  - schemas/common.schema.json

requirements:
  - MRR-NFR-001
  - MRR-NFR-002
  - MRR-NFR-007

allowed_paths:
  - packages/domain/**
  - packages/crypto/**
  - tests/unit/**
  - tests/property/**
  - pyproject.toml

forbidden_changes:
  - API endpoints
  - database schema
  - workflow engine integration
  - model-provider code

inputs:
  - specification v0.2.0, including v0.1.1 foundations

invariants:
  - semantic map key order cannot change a hash
  - any semantic byte change must change the hash
  - signatures exclude signature fields
  - invalid signatures fail closed
  - object IDs are stable and never derived from mutable labels

implementation_notes:
  - keep domain types framework independent
  - use explicit result/error types for verification failures
  - expose deterministic canonical bytes for tests

acceptance_tests:
  - unit tests for valid and invalid signatures
  - property test for map-order-invariant hashing
  - property test that semantic mutation changes hash
  - test that signature mutation is detected
  - test that unsupported algorithm is rejected

commands:
  - make format
  - make lint
  - make typecheck
  - make test

required_output:
  - implementation summary
  - changed files
  - tests and command results
  - security implications
  - unresolved specification questions

stop_conditions:
  - required cryptographic behavior conflicts with existing dependency constraints
  - canonicalization cannot be made interoperable
  - task requires changes outside allowed paths
```

## 3. Starter prompt for Codex or Claude Code

```text
You are implementing one bounded task in Meridian Research Runtime.

Read AGENTS.md first. Then read only the files listed in the task packet's
source_of_truth section. Treat normative MRR requirements and schemas as the
source of truth.

Implement exactly task <TASK_ID>. Do not implement adjacent epics, redesign the
architecture, weaken a MUST requirement, or modify forbidden paths. Add all
specified tests and run every command in the packet.

When requirements conflict or a safe implementation would require broader
changes, stop the affected work and report the exact conflict instead of
inventing behavior.

Return:
1. implementation summary;
2. files changed;
3. migration impact;
4. tests added;
5. exact commands and results;
6. security/privacy implications;
7. limitations and specification conflicts.
```

## 4. Reviewer-agent prompt

```text
Review the patch for task <TASK_ID> against AGENTS.md, the task packet, and only
the cited source-of-truth sections.

Do not primarily review style. Verify:
- every normative requirement is satisfied;
- no forbidden path or adjacent behavior changed;
- state, authorization, failure, and adversarial paths are tested;
- no placeholder or silent fallback exists;
- domain logic is not coupled to an external framework;
- evidence supplied for acceptance commands is credible;
- security, privacy, and provenance invariants were not weakened.

Return findings ordered by severity, each with file/line, violated requirement,
consequence, and a concrete correction. Explicitly state when no blocking
finding remains.
```

## 5. Specification-to-task compiler rules

A human or planning agent may derive task packets, but it MUST:

1. select no more than one cohesive domain behavior;
2. cite exact requirement IDs;
3. specify allowed and forbidden paths;
4. state observable acceptance tests;
5. include negative and failure paths;
6. avoid implementation instructions that contradict architecture ADRs;
7. define stop conditions;
8. avoid subjective words such as “good”, “robust”, or “clean” without a testable interpretation;
9. require commands and evidence;
10. keep tasks small enough for independent review and rollback.

## 6. Example task: Claim state machine

```yaml
task_id: E3-T02A
title: Implement Claim aggregate and lifecycle transitions
objective: >
  Implement the framework-independent Claim aggregate, evidence relations,
  revision behavior, and valid lifecycle transitions.
source_of_truth:
  - docs/01_SYSTEM_SPEC.md#stage-7--claim-graph
  - docs/01_SYSTEM_SPEC.md#claim
  - docs/02_DOMAIN_MODEL.md#claim
requirements:
  - MRR-FR-060
  - MRR-FR-061
  - MRR-FR-062
  - MRR-FR-063
  - MRR-FR-064
allowed_paths:
  - packages/domain/claims/**
  - tests/unit/domain/claims/**
  - tests/property/domain/claims/**
invariants:
  - supported requires at least one valid support relation
  - withdrawn and superseded remain addressable
  - invalid transitions create no partial state
  - scope changes create a new revision
acceptance_tests:
  - supported without evidence is rejected
  - self-contained valid claim reaches under_review
  - withdrawal preserves prior revision
  - random invalid transition sequences never succeed
  - unknown and contradicted remain distinct
```

## 7. Example task: Correction traversal

```yaml
task_id: E3-T06A
title: Implement deterministic correction impact traversal
objective: >
  Given affected object IDs and typed edges, compute all downstream objects
  requiring review while remaining idempotent and cycle-safe.
source_of_truth:
  - docs/01_SYSTEM_SPEC.md#stage-10--correction-propagation
  - docs/02_DOMAIN_MODEL.md#correctionevent
requirements:
  - MRR-FR-090
  - MRR-FR-091
  - MRR-FR-092
  - MRR-FR-093
allowed_paths:
  - packages/domain/corrections/**
  - tests/unit/domain/corrections/**
  - tests/property/domain/corrections/**
invariants:
  - every reachable relevant object appears once
  - irrelevant edge types do not propagate impact
  - cycles terminate
  - repeated processing produces identical obligations
acceptance_tests:
  - line graph
  - branching graph
  - cyclic graph
  - duplicate edges
  - disconnected graph
  - already-reviewed object
```

## 8. Agent context management

For each task, provide only:

- `AGENTS.md`;
- task packet;
- cited specification sections;
- directly relevant schemas;
- current code in allowed paths;
- failing tests or issue evidence.

Do not flood the coding agent with the complete research corpus. The planner may use broad context; the implementation agent should use precise context.

## 9. Patch verification sequence

1. implementation agent creates patch and tests;
2. deterministic CI runs all task commands;
3. reviewer agent checks requirement conformance;
4. security reviewer checks relevant threat paths;
5. human owner resolves specification decisions and merges;
6. benchmark evidence attaches to the release record.

The same model session should not both implement and provide the sole independent approval.
