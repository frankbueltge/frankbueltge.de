# 04 — Security, privacy, ethics, and policy

## 1. Security objective

MRR must remain useful even when models are unreliable, retrieved documents contain malicious instructions, remote nodes are unavailable, and participating practices have different trust levels.

The security model assumes:

- model outputs may be wrong or adversarially influenced;
- retrieved content may contain prompt injection or malicious payloads;
- task senders and nodes may make mistakes;
- credentials may be exposed unless isolated;
- sensitive data may be re-identifiable after transformation;
- dependencies and containers may be compromised;
- legitimate practices may disagree about policy.

## 2. Trust boundaries

1. Human user to control plane
2. Control plane service to service
3. Control plane to local node
4. Node runtime to sandbox
5. Sandbox to local data connector
6. MRR to external model provider
7. MRR to external source or publication connector
8. Local raw data to derived artifact
9. Internal object to transferred object

Every boundary MUST have explicit authentication, authorization, validation, logging, and data-classification behavior.

## 3. Policy layering

Policy is evaluated in this order:

1. non-overridable legal and safety constraints;
2. participant consent and ethics restrictions;
3. target practice and node policy;
4. Research Score policy;
5. transfer contract;
6. capability-specific policy;
7. task-level requested constraints.

The effective permission is the intersection. A lower layer may be stricter but never broader than a higher-priority restriction.

For v1, policy contracts MAY be implemented as typed Python rules behind a stable interface. Adoption of OPA/Rego or another policy language requires an ADR. Policy behavior must be testable with fixtures.

## 4. Data security

### 4.1 Encryption

- TLS in transit for all online traffic.
- mTLS between federated nodes.
- Encryption at rest for restricted and more sensitive data.
- Envelope encryption for cross-practice offline bundles.
- Keys stored outside application databases.
- Key use and rotation are audited.

### 4.2 Data minimization

- Tasks request the smallest data fields and temporal scope required.
- Raw data remains local by default.
- Derived output receives a disclosure review before export.
- Logs and traces must not accidentally duplicate sensitive content.
- Model prompts receive only data explicitly allowed for that model/provider.

### 4.3 Retention and deletion

Every sensitive artifact MUST carry retention and deletion policy. Deletion may remove bytes while preserving a tombstone, hash, legal basis, and impact event where permitted. Participant withdrawal triggers impact analysis and downstream obligations.

### 4.4 Re-identification control

De-identification is not assumed safe merely because direct identifiers are removed. Local policy MUST consider rare attributes, quotations, location/time combinations, linkage risk, and small groups.

## 5. Sandbox security

The executor MUST enforce:

- no privileged mode;
- non-root user;
- read-only root filesystem;
- explicit read-only and writable mounts;
- seccomp/AppArmor or equivalent controls where available;
- bounded CPU, memory, disk, processes, and duration;
- no host socket mounts;
- deny-by-default egress;
- DNS and destination allowlists when egress is needed;
- output size limits;
- malware and archive-bomb checks on untrusted files;
- immutable image digest;
- software bill of materials and vulnerability scan before approved production use.

A task requesting broader permissions must be rejected or require explicit elevated approval. Production nodes MUST NOT execute arbitrary code directly on the host.

## 6. Prompt-injection and model safety

### 6.1 Retrieved content is data, not instruction

System and tool policy MUST be separated from retrieved content. Documents, websites, PDFs, transcripts, and emails cannot grant permissions or redefine the task.

### 6.2 Tool mediation

Models may request tools only through typed tool calls. A deterministic mediator validates:

- tool is allowed for the role and task;
- parameters satisfy schema;
- requested resource is within scope;
- budget and autonomy allow the action;
- data classification permits disclosure;
- human approval exists where required.

### 6.3 Model output handling

- Structured output validated before use.
- Unstructured output stored as a proposal artifact.
- No direct SQL, shell, publication, email, participant contact, or state mutation from free text.
- Tool results are independently recorded; the model's description of them is not authoritative.

### 6.4 Prompt and model provenance

The system records:

- provider and model identifier;
- model profile version;
- system and task prompt hashes;
- temperature, seed where supported, and decoding settings;
- tool schema version;
- input artifact references;
- output and tool-call hashes;
- usage and cost;
- safety or moderation result where applicable.

Sensitive prompt bodies MAY remain sealed at the local node while hashes and permitted summaries travel.

### 6.5 Multi-model independence

Using a different model name does not automatically prove independence. Verification records must declare shared provider, model family, prompt family, retrieval index, source snapshot, and code path.

## 7. Supply-chain security

- Dependencies pinned with lockfiles.
- Container bases pinned by digest.
- CI verifies signatures and produces an SBOM.
- Secrets are never committed.
- Release artifacts are signed.
- Database migrations are reviewed and reversible where feasible.
- Third-party plugins run with explicit capabilities.
- Network connectors are isolated from core domain logic.

## 8. Federated security

### 8.1 Trust model

Trust is per practice and capability, not universal. A practice may trust another to sign evidence crates but not to access raw data or issue external actions.

### 8.2 Replay and tampering

Task and result envelopes include nonces, expiry, recipient identity, content hashes, and signatures. Processed envelope IDs are retained for replay detection according to policy.

### 8.3 Refusal safety

A node refusal must not leak sensitive policy details. It may return a coarse reason code and retain detailed explanation locally.

### 8.4 Compromised node response

A practice can revoke a node or key. New objects are rejected after revocation. Existing objects remain historically attributable and may receive a `trust_revoked_after_creation` annotation.

## 9. Human approval

A4 actions require a human approval object that binds:

- exact object revision and content hash;
- action and target;
- disclosure classification;
- known warnings and unresolved corrections;
- approver identity and authority;
- expiration and conditions.

Any material change invalidates prior approval.

Dual approval SHOULD be available for:

- public release of sensitive findings;
- participant contact at scale;
- export of restricted datasets;
- physical device control;
- critical correction rejection;
- key trust changes.

## 10. Field-research policy

### 10.1 Consent

Before model processing of participant data, the node policy must determine whether the consent basis permits:

- transcription;
- external model processing;
- local model processing;
- automated coding;
- quotation;
- partner transfer;
- retention;
- reuse for future questions.

### 10.2 Shadow mode

Initial field deployments MUST use shadow mode:

- agents propose but do not contact participants;
- humans decide interview follow-ups and sampling;
- accepted and rejected suggestions are recorded;
- raw recordings and identities remain local;
- model influence on analysis is visible.

### 10.3 Synthetic respondents

Synthetic respondents may be used for method rehearsal, interface testing, and sensitivity analysis. Their outputs MUST be marked synthetic and MUST NOT be represented as observations about a real population.

### 10.4 Participant withdrawal

Withdrawal creates a `DataWithdrawalEvent` linked to affected consent and data assets. The system computes:

- bytes to delete or restrict;
- derived artifacts requiring review;
- claims potentially affected;
- transferred objects and recipients;
- public projections requiring amendment;
- legal or integrity exceptions to deletion.

## 11. Threat scenarios and required controls

| Scenario | Required behavior |
|---|---|
| A paper instructs the agent to exfiltrate secrets | Treat text as untrusted data; tool mediator denies action |
| A source URL changes after citation | Exact snapshot/hash or retrieval version preserves anchor |
| A sender alters a task after signing | Hash/signature mismatch rejects before execution |
| Same task is delivered repeatedly | Replay/idempotency control prevents duplicate authority |
| Node goes offline mid-run | Workflow pauses; terminal state is explicit; no fabricated result |
| Model invents a citation | Claim validation rejects unsupported citation |
| Five reviews use the same model and prompt | Independence validator counts one reasoning lineage |
| A copied press release appears in twenty outlets | Source-family layer reports one dependent evidence family |
| Participant quote is indirectly identifying | Local disclosure review blocks export or redacts |
| A critical source is retracted | Correction impact marks downstream objects and projections |
| A malicious container requests host access | Sandbox rejects privileged or undeclared capabilities |
| Cost loop fails to terminate | Branch and run budgets stop execution deterministically |

## 12. Security release gates

A release MUST NOT proceed when:

- a known raw-data exfiltration path exists;
- signature, hash, replay, or authorization tests fail;
- an A4 action can bypass approval;
- executor self-verification is possible;
- sealed artifacts can be mutated without a new hash;
- restricted content appears in unauthorized logs or traces;
- prompt injection can directly invoke tools;
- critical dependency vulnerabilities remain unaccepted by a documented risk decision.

## 13. Method-integrity security controls

- Retrieved papers, data documentation, and web content remain untrusted data and cannot modify method policy.
- Model-generated causal graphs, designs, and audits are proposals.
- The system must prevent outcome-informed plan mutation from being disguised as a normal edit.
- Synthetic fixtures carry an enforced no-evidence label.
- Taxonomy and geographic mapping changes are provenance-sensitive and may invalidate downstream claims.
- Causal publication remains an A4 external act and requires human approval.
