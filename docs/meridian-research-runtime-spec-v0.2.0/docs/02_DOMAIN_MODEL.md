# 02 — Domain model and invariants

## 1. Identity, revision, and hashing

Every first-class object MUST contain:

```text
id
api_version
kind
practice_id
revision
created_at
created_by
content_hash
supersedes (optional)
labels (optional)
```

### 1.1 Identifiers

Canonical identifiers use:

```text
urn:mrr:<entity>:<ulid>
```

Identifiers never change. Revisions receive a new object record and use `supersedes` or an explicit revision relation.

### 1.2 Canonical hashing

Content hashes are computed over canonical JSON with signatures and non-semantic transport metadata excluded. The implementation SHOULD use RFC 8785 canonicalization and SHA-256.

### 1.3 Signatures

Cross-practice objects MUST include:

- signer practice identifier;
- key identifier;
- algorithm;
- signature;
- signed-at timestamp;
- optional certificate or trust-chain reference.

The signature covers the canonical payload and content hash.

## 2. Core aggregate roots

### 2.1 Practice

Represents an autonomous research practice.

Required fields:

- `id`, `name`, `description`;
- identity and signing keys;
- governance contacts;
- supported policy versions;
- public capability registry endpoint if any;
- disclosure and trust metadata.

Invariant: a practice is the authority for its node policies and local accept/reject decisions.

### 2.2 NodeManifest

Describes a node's available actions and restrictions.

Required fields:

- node identity and practice;
- capabilities with semantic version;
- accepted input kinds;
- returned object kinds;
- autonomy ceiling;
- data-residency declarations;
- restrictions and required approvals;
- transport modes;
- public keys;
- validity period;
- signature.

A capability definition includes:

```text
name: literature.retrieve
version: 1.0.0
input_schema: urn:mrr:schema:literature-query:1
output_schema: urn:mrr:schema:evidence-crate:1
max_autonomy: A2
approval: automatic | human | dual
network_profile: none | allowlist | unrestricted_forbidden
```

### 2.3 ResearchScore

Defines the authorized research envelope.

Required fields:

- question and background;
- objectives and non-goals;
- scope: population, time, geography, conditions;
- epistemic starting assumptions;
- methods allowed and prohibited;
- source and data classes;
- ethics and consent references;
- autonomy matrix;
- compute, money, time, and human-review budgets;
- quality gates;
- stop conditions;
- publication and disclosure policy;
- approval state and approvers.

Invariant: a task may not exceed the score envelope.

### 2.4 Hypothesis and ResearchBranch

`Hypothesis` captures a falsifiable proposition or an explicit `insufficient_evidence` branch.

Fields:

- hypothesis statement;
- branch role;
- predicted observations;
- disconfirming observations;
- scope;
- dependencies and assumptions;
- methods;
- required capabilities;
- branch budget;
- stop conditions;
- priority rationale;
- lifecycle status.

Invariant: a hypothesis is not a claim of result.

### 2.5 TaskBundle

A signed request for a bounded action.

Fields:

- origin and target practices/nodes;
- score and branch references;
- capability and version;
- purpose and task instructions;
- input artifact references by hash;
- data access mode;
- runtime/container digest;
- resource limits;
- network policy;
- tool allowlist;
- secret references;
- output schema;
- disclosure classification;
- approval requirements;
- expiry and replay nonce;
- signature.

Invariant: no mutable URL alone is an authoritative input. Remote content must be snapshotted or anchored with retrieval metadata.

### 2.6 RunManifest

Records an execution attempt.

Fields:

- task and score revision;
- executor identity and role;
- start/end timestamps;
- terminal state;
- environment and image digest;
- code/workflow commit;
- parameters and seeds;
- input hashes;
- tool and model invocations;
- network accesses permitted and performed;
- resource and cost usage;
- logs and error references;
- policy decision references;
- produced artifact hashes.

Invariant: a run manifest is append-only while active and sealed at terminal state. Corrections create annotations or superseding manifests.

### 2.7 Artifact

An immutable byte object or structured data object.

Fields:

- content hash;
- media type and size;
- storage locator;
- producer run;
- classification;
- encryption metadata;
- retention policy;
- semantic role;
- optional redacted derivatives.

Invariant: storage locator changes do not change artifact identity; byte changes do.

### 2.8 SourceRecord

Describes an external or local source.

Fields:

- stable identifiers such as DOI, repository ID, archive identifier, or local asset ID;
- title, creators, publication date, version;
- retrieval timestamp and method;
- snapshot artifact hash when permitted;
- source type;
- primary/secondary/derived classification;
- source family identifier and derivation evidence;
- accessibility and licensing metadata.

Invariant: source metadata and source content are distinct. A correct DOI does not prove that a claim is supported.

### 2.9 EvidenceAnchor

Connects a claim-relevant proposition to an exact part of a source or run.

Text anchor fields:

- source record and snapshot hash;
- page, section, paragraph, line, character offsets, or structured selector;
- quoted fragment hash;
- relation: `supports`, `contradicts`, `qualifies`, `contextualizes`;
- extraction method and extractor identity;
- anchor validation status.

Computational anchor fields:

- run ID;
- output artifact;
- table/column/row, JSON Pointer, query, or notebook cell;
- transformation chain;
- recomputation status.

Invariant: the anchor must resolve against the exact referenced version or explicitly declare why exact anchoring is impossible.

### 2.10 SourceFamily

Represents evidence dependence.

Fields:

- family identifier;
- origin source or dataset;
- member sources;
- relationship type: copy, syndication, shared dataset, shared press release, direct derivation, uncertain;
- confidence and rationale;
- detecting method and reviewer.

Invariant: family confidence is not used to silently delete sources. It changes independence calculations and presentation.

### 2.11 Claim

Fields:

- atomic assertion;
- claim type: observational, causal, statistical, methodological, interpretive, normative, speculative;
- scope object;
- lifecycle status;
- support, contradiction, qualification, and context relations;
- dependency claims;
- source family summary;
- uncertainty object;
- known unknowns;
- proposer and responsible practice;
- review and verification references;
- correction and transfer references.

Suggested status values:

```text
draft
under_review
supported
contested
contradicted
unsupported
unresolved
review_required
withdrawn
superseded
legacy_unverified
```

Invariant: `supported` is a workflow conclusion under declared gates, not an assertion of metaphysical certainty.

### 2.12 Uncertainty

Uncertainty MUST be structured rather than expressed only as prose.

Fields:

- kind: measurement, sampling, model, inferential, source, contextual, ethical, operational, unknown;
- qualitative statement;
- optional interval or probability with method;
- calibration evidence;
- assumptions;
- sensitivity results;
- unresolved questions.

Invariant: model self-confidence is not accepted as calibrated probability without benchmark evidence.

### 2.13 Review and VerificationResult

A review records judgment; a verification records checks.

Fields:

- claim/run/artifact reviewed;
- reviewer identity and role;
- independence profile;
- checks performed;
- evidence inspected;
- numeric recomputation details;
- findings by severity;
- recommendation;
- confidence and rationale;
- conflicts of interest;
- adjudication relation.

Invariant: a reviewer cannot satisfy independence if it shares the same execution principal and unaltered reasoning path as the producer.

### 2.14 TransferContract

Fields:

- sender and receiver;
- exact object IDs and hashes;
- purpose and permitted uses;
- disclosure and attribution rules;
- attached caveats;
- correction subscription;
- obligations and deadlines if any;
- recipient decision and local adaptation links;
- signatures.

Invariant: transfer creates no authority over the recipient's local interpretation.

### 2.15 Obligation

Represents a follow-up duty.

Kinds include:

- review correction;
- preserve attribution;
- retain caveat;
- delete or restrict data;
- notify downstream recipients;
- obtain human approval;
- re-run analysis;
- respond to transfer.

Fields:

- responsible practice or role;
- trigger;
- due condition or deadline;
- status;
- resolution evidence;
- escalation policy.

### 2.16 CorrectionEvent

Fields:

- affected objects and hashes;
- correction type;
- severity;
- reason and evidence;
- originator;
- proposed replacement or action;
- impact analysis state;
- affected downstream objects;
- delivery and recipient responses;
- final resolution.

Severity levels:

- `minor`: presentation or metadata issue without claim impact;
- `material`: could change interpretation or scope;
- `critical`: invalidates a claim, breaches policy, or creates safety/privacy harm.

### 2.17 PolicyDecision

Fields:

- requested action;
- policy bundle and version;
- input facts hash;
- decision: permit, deny, require_approval, permit_with_modification;
- reasons and rules matched;
- evaluator identity;
- expiry;
- human override if permitted.

Invariant: policy decisions are explicit, inspectable, and never encoded only in application logs.

### 2.18 HumanApproval

Fields:

- action and object references;
- approver identity and authority;
- information presented;
- decision;
- conditions;
- timestamp and expiry;
- signature.

Invariant: approval is specific. It cannot be reused for materially changed content.

## 3. Edge vocabulary

The claim/evidence graph MUST use typed edges. Minimum vocabulary:

```text
supports
contradicts
qualifies
contextualizes
derived_from
depends_on
replicates
fails_to_replicate
supersedes
corrects
transferred_from
adapted_from
reviews
verifies
invalidates
uses_source
member_of_source_family
subject_to_obligation
projected_into
```

Each edge has identity, provenance, creator, timestamp, optional scope, and lifecycle status.

## 4. Data classification

Minimum levels:

| Level | Meaning | Default movement |
|---|---|---|
| PUBLIC | intentionally public | transferable |
| INTERNAL | practice-internal | explicit partner transfer |
| RESTRICTED | contract, license, or project restricted | local by default |
| SENSITIVE | personal, confidential, or high-risk | local and encrypted |
| PARTICIPANT_IDENTIFIABLE | directly or indirectly identifiable field data | never exported by default |

Derived data does not automatically receive a lower classification. A local disclosure review determines whether aggregation or redaction changes classification.

## 5. Field-research extensions

### 5.1 ConsentAsset

Records what processing, model use, sharing, quotation, retention, and withdrawal rights apply to participant data.

### 5.2 FieldObservation

Records observation context, researcher role, temporal and spatial scope, consent basis, field notes, transformations, and disclosure classification.

### 5.3 TranscriptAsset

Links audio/video/source artifact, transcript revision, diarization, confidence spans, redactions, pseudonyms, and human verification.

### 5.4 AnalyticMemo

Captures human or machine reflexivity, assumptions, coding choices, deviant cases, and limitations.

### 5.5 SamplingDecision

Records proposed and actual sampling actions, decision maker, rationale, rejected alternatives, and whether an agent suggestion influenced the decision.

Invariant: an agent may propose a field action under A1, but participant contact and sample changes remain human-authorized unless a later constitution explicitly allows otherwise.

## 6. RO-Crate and PROV mapping

MRR objects SHOULD map as follows:

- `Artifact`, `SourceRecord`, `Claim` -> PROV Entity
- `RunManifest`, `Review`, `CorrectionEvent` -> PROV Activity
- `Practice`, `Node`, `Person`, `AgentRole` -> PROV Agent
- `derived_from` -> `prov:wasDerivedFrom`
- producer relation -> `prov:wasGeneratedBy`
- executor/reviewer relation -> `prov:wasAssociatedWith`
- input relation -> `prov:used`

MRR-specific semantics remain in an extension vocabulary. Export must preserve MRR identifiers and hashes even when a consumer ignores the extension.

## 7. Required invariants summary

1. No authoritative object without identity, revision, provenance, and hash.
2. No supported claim without evidence and completed required verification.
3. No self-verification.
4. No cross-practice task or result without signature validation.
5. No silent overwrite of sealed objects.
6. No raw sensitive-data export without explicit policy and approval.
7. No correction without impact analysis.
8. No source count presented as source independence.
9. No narrative treated as the canonical research state.
10. No model output bypasses schema and domain validation.

## 8. v0.2 method aggregate roots

The Research Method Kernel adds the following aggregate roots:

- `MethodProfile`
- `QuestionModel`
- `ConceptMeasurementCharter`
- `Estimand`
- `CausalModel`
- `EvidenceMatrix`
- `DataAssetProfile`
- `ResearchDesign`
- `IdentificationAudit`
- `PreAnalysisPlan`
- `FalsificationPlan`
- `ReplicationPlan`
- `GeneralizationMap`
- `ResearchDecision`

They use the same identity, revision, hashing, signature, provenance, and event rules as v0.1.1. Full contracts are defined in `schemas/` and docs 08–19.

New edge types include:

```text
operationalizes
measures
identifies
confounds
mediates
selects_into
modifies_effect
tests_estimand
requires_data
admitted_by_audit
bounded_by_ceiling
locked_by_plan
falsified_by
replicated_by
generalizes_under
invalidates_method_dependency
```
