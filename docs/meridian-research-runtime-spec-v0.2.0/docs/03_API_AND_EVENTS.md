# 03 — API, node protocol, and domain events

## 1. API design rules

- JSON over HTTPS for control-plane APIs.
- Versioned paths under `/v1`.
- UTC timestamps in RFC 3339 form.
- ULID-based canonical object identifiers.
- RFC 7807-style problem responses with stable MRR error codes.
- `Idempotency-Key` required for create and action endpoints.
- ETags or object revision preconditions required for mutable workflow actions.
- Pagination by opaque cursor.
- All payloads validated against published JSON Schemas.
- Authentication and authorization are mandatory except explicitly public node manifests.

A successful HTTP response does not imply epistemic verification. Domain status is always explicit in the returned object.

## 2. Error envelope

```json
{
  "type": "urn:mrr:problem:policy-denied",
  "title": "Policy denied the requested action",
  "status": 403,
  "code": "MRR_POLICY_DENIED",
  "detail": "Participant-identifiable data cannot leave this node.",
  "trace_id": "01J...",
  "object_id": "urn:mrr:task:01J...",
  "policy_decision_id": "urn:mrr:policy-decision:01J...",
  "retryable": false
}
```

Stable error codes include:

```text
MRR_SCHEMA_INVALID
MRR_STATE_TRANSITION_INVALID
MRR_SCORE_NOT_ACTIVE
MRR_POLICY_DENIED
MRR_APPROVAL_REQUIRED
MRR_SIGNATURE_INVALID
MRR_HASH_MISMATCH
MRR_OBJECT_EXPIRED
MRR_REPLAY_DETECTED
MRR_CAPABILITY_UNAVAILABLE
MRR_SOURCE_UNAVAILABLE
MRR_ANCHOR_UNRESOLVED
MRR_SELF_VERIFICATION_FORBIDDEN
MRR_BUDGET_EXCEEDED
MRR_CONFLICT
MRR_DEPENDENCY_UNAVAILABLE
```

## 3. Control-plane REST surface

### 3.1 Research Scores

```text
POST   /v1/research-scores
GET    /v1/research-scores/{id}
POST   /v1/research-scores/{id}/submit
POST   /v1/research-scores/{id}/approve
POST   /v1/research-scores/{id}/reject
POST   /v1/research-scores/{id}/revise
POST   /v1/research-scores/{id}/suspend
GET    /v1/research-scores/{id}/history
```

### 3.2 Research Runs and branches

```text
POST   /v1/research-runs
GET    /v1/research-runs/{id}
POST   /v1/research-runs/{id}/plan
POST   /v1/research-runs/{id}/pause
POST   /v1/research-runs/{id}/resume
POST   /v1/research-runs/{id}/cancel
GET    /v1/research-runs/{id}/branches
POST   /v1/research-runs/{id}/branches
POST   /v1/branches/{id}/allocate-budget
POST   /v1/branches/{id}/defer
```

### 3.3 Registry

```text
GET    /v1/nodes
GET    /v1/nodes/{id}
POST   /v1/nodes/manifests
GET    /v1/capabilities
POST   /v1/capability-matches
```

A capability match is advisory. It does not create permission or acceptance.

### 3.4 Tasks and runs

```text
POST   /v1/tasks
GET    /v1/tasks/{id}
POST   /v1/tasks/{id}/offer
POST   /v1/tasks/{id}/accept-origin-modification
POST   /v1/tasks/{id}/cancel
GET    /v1/tasks/{id}/attempts
GET    /v1/runs/{id}
GET    /v1/runs/{id}/manifest
```

### 3.5 Artifacts and Evidence Crates

```text
POST   /v1/artifacts/initiate-upload
POST   /v1/artifacts/{id}/complete-upload
GET    /v1/artifacts/{id}/metadata
GET    /v1/artifacts/{id}/download
POST   /v1/evidence-crates
GET    /v1/evidence-crates/{id}
POST   /v1/evidence-crates/{id}/seal
POST   /v1/evidence-crates/{id}/export
```

Downloads are subject to object classification, local policy, transfer contracts, and short-lived authorization.

### 3.6 Claims and evidence

```text
POST   /v1/claims
GET    /v1/claims/{id}
POST   /v1/claims/{id}/revise
POST   /v1/claims/{id}/submit-review
POST   /v1/claims/{id}/withdraw
GET    /v1/claims/{id}/evidence
GET    /v1/claims/{id}/dependencies
GET    /v1/claims/{id}/downstream
POST   /v1/evidence-anchors
POST   /v1/source-families
POST   /v1/graph/edges
```

### 3.7 Reviews and verification

```text
POST   /v1/reviews
GET    /v1/reviews/{id}
POST   /v1/verifications
GET    /v1/verifications/{id}
POST   /v1/verifications/{id}/checks
POST   /v1/verifications/{id}/complete
POST   /v1/adjudications
```

### 3.8 Transfers and obligations

```text
POST   /v1/transfers
GET    /v1/transfers/{id}
POST   /v1/transfers/{id}/offer
POST   /v1/transfers/{id}/respond
GET    /v1/obligations
GET    /v1/obligations/{id}
POST   /v1/obligations/{id}/resolve
POST   /v1/obligations/{id}/defer
```

### 3.9 Corrections

```text
POST   /v1/corrections
GET    /v1/corrections/{id}
POST   /v1/corrections/{id}/analyze-impact
GET    /v1/corrections/{id}/impact
POST   /v1/corrections/{id}/notify
POST   /v1/corrections/{id}/respond
POST   /v1/corrections/{id}/resolve
```

### 3.10 Projections

```text
POST   /v1/projections
GET    /v1/projections/{id}
POST   /v1/projections/{id}/render
POST   /v1/projections/{id}/request-publication-approval
POST   /v1/projections/{id}/publish
```

## 4. Node protocol

Every online node exposes a minimal mutually authenticated API.

```text
GET    /.well-known/mrr-node
GET    /v1/manifest
POST   /v1/tasks/inbox
GET    /v1/tasks/{id}
POST   /v1/tasks/{id}/decision
POST   /v1/tasks/{id}/start
POST   /v1/tasks/{id}/cancel
GET    /v1/tasks/{id}/status
GET    /v1/tasks/{id}/result
POST   /v1/corrections/inbox
POST   /v1/transfers/inbox
GET    /v1/health
```

### 4.1 Task decision

A node decision is one of:

```json
{
  "decision": "accept | modify | defer | reject | require_human_approval",
  "task_id": "urn:mrr:task:...",
  "task_revision": 1,
  "policy_decision_id": "urn:mrr:policy-decision:...",
  "modified_task": null,
  "reason_codes": ["DATA_RESIDENCY"],
  "message": "Only aggregate output is permitted.",
  "signed_at": "2026-07-17T12:00:00Z",
  "signature": {}
}
```

### 4.2 Store-and-forward envelopes

Offline exchange uses a transport envelope containing:

- envelope identifier and nonce;
- sender and intended recipient;
- object type and schema version;
- payload hash;
- creation and expiry;
- encryption metadata;
- sender signature;
- optional acknowledgement request.

A recipient MUST reject expired, replayed, misaddressed, untrusted, or hash-invalid envelopes before deserializing untrusted nested content beyond what is required for verification.

## 5. Domain event architecture

MRR uses append-only domain events for audit and reliable integration. Current state is materialized in PostgreSQL tables. Full event sourcing of every aggregate is not required for v1.

### 5.1 Event envelope

```json
{
  "event_id": "urn:mrr:event:01J...",
  "event_type": "claim.status_changed",
  "event_version": 1,
  "occurred_at": "2026-07-17T12:00:00Z",
  "recorded_at": "2026-07-17T12:00:01Z",
  "practice_id": "urn:mrr:practice:01J...",
  "actor": {
    "type": "person | service | agent | node",
    "id": "urn:mrr:agent:01J...",
    "role": "verifier"
  },
  "correlation_id": "urn:mrr:research-run:01J...",
  "causation_id": "urn:mrr:event:01J...",
  "object_id": "urn:mrr:claim:01J...",
  "object_revision": 3,
  "policy_version": "policy-2026-07-01",
  "payload_hash": "sha256:...",
  "payload": {}
}
```

### 5.2 Required events

```text
research_score.created
research_score.submitted
research_score.approved
research_score.revised
research_score.suspended
research_run.started
branch.created
branch.deferred
budget.allocated
node_manifest.registered
task.created
task.offered
task.modification_proposed
task.accepted
task.rejected
task.execution_started
task.execution_failed
task.execution_completed
run.sealed
artifact.registered
evidence_crate.sealed
claim.created
claim.status_changed
claim.withdrawn
review.requested
review.completed
verification.started
verification.completed
transfer.offered
transfer.responded
obligation.created
obligation.resolved
correction.opened
correction.impact_computed
correction.notification_sent
correction.response_recorded
projection.rendered
publication.approved
publication.completed
policy.decision_recorded
human_approval.recorded
```

### 5.3 Transactional outbox

State changes and event publication MUST use a transactional outbox so that committed domain changes cannot silently lose their corresponding event. Consumers MUST be idempotent.

## 6. Concurrency and revisions

- Mutating commands include `expected_revision` or `If-Match`.
- Revision conflicts return `409 MRR_CONFLICT` with current revision metadata.
- Sealed objects reject mutation with `409 MRR_STATE_TRANSITION_INVALID`.
- Long workflows use correlation and causation IDs, not distributed database transactions.
- Compensating actions create new events; they never erase previous events.

## 7. Authentication and authorization

### 7.1 Human and service identities

- OIDC access tokens for control-plane users and services.
- Scoped roles and practice membership.
- Short token lifetime.
- Step-up authentication for A4 actions and key-management operations.

### 7.2 Node identities

- mTLS for transport;
- signed application payloads for end-to-end object integrity;
- trust store managed per practice;
- key rotation without changing practice identity;
- revocation checked before accepting new work.

### 7.3 Authorization dimensions

Authorization MUST evaluate:

- actor and role;
- practice ownership;
- object classification;
- requested action and autonomy level;
- Research Score permissions;
- local node policy;
- transfer contract;
- consent and ethics constraints;
- approval presence and validity;
- budget and expiry.

## 8. Query and search

Search is a convenience layer, never the authoritative object store.

- Full-text and vector search MAY index permitted object projections.
- Search results MUST resolve to canonical object IDs and revisions.
- Index staleness MUST be visible.
- Restricted content MUST not be embedded or indexed outside permitted boundaries.
- Retrieval results are untrusted content and cannot modify tool policy.

## 9. API compatibility

- Additive optional fields MAY be introduced within a major version.
- Removing or changing semantics requires a new schema or API version.
- Consumers MUST ignore unknown optional fields but MUST reject unknown enum values when they affect safety or state transitions.
- Every schema change requires compatibility fixtures and migration notes.

## 10. v0.2 method API

The additional REST surface and events are defined in `docs/17_METHOD_API_AND_EVENTS.md`. They inherit all v0.1.1 authentication, authorization, idempotency, concurrency, outbox, and event-envelope requirements.
