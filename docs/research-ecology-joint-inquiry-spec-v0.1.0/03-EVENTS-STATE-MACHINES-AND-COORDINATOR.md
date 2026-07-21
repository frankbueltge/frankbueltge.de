# Events, state machines and coordinator
## Procedural coordination without a master researcher

## 1. Coordinator principle

The coordinator is a **system component**, not a new practice and not an epistemic authority.

It may:

- validate proposals, commitments and event envelopes;
- track participant decisions;
- activate an inquiry when declared conditions are met;
- dispatch local workflow triggers;
- enforce move, time and cost ceilings;
- attach returned local object references;
- create or link Encounter proposals;
- notify participants of corrections, outputs or required return moves;
- pause on escalation;
- and generate operational status views.

It may not:

- invent the shared problem;
- accept participation on behalf of a practice unless that practice's standing delegation explicitly permits a local automation to do so;
- merge all participant contexts into one master prompt;
- decide which interpretation is correct;
- write a participant's local position;
- claim that an inquiry succeeded;
- turn machine similarity into a relation;
- extend the inquiry without accepted commitments;
- or publish a curated exposition.

## 2. Inquiry event vocabulary

Core namespace: `joint_inquiry.*`

### 2.1 Proposal and formation

- `joint_inquiry.proposal_created`
- `joint_inquiry.proposal_revised`
- `joint_inquiry.invitation_created`
- `joint_inquiry.invitation_dispatched`
- `joint_inquiry.invitation_delivered`
- `joint_inquiry.invitation_delivery_failed`
- `joint_inquiry.participation_accepted`
- `joint_inquiry.participation_accepted_with_conditions`
- `joint_inquiry.participation_deferred`
- `joint_inquiry.participation_declined`
- `joint_inquiry.participation_withdrawn`
- `joint_inquiry.commitment_published`
- `joint_inquiry.commitment_superseded`

### 2.2 Activation and local moves

- `joint_inquiry.activated`
- `joint_inquiry.phase_started`
- `joint_inquiry.local_move_requested`
- `joint_inquiry.local_move_started`
- `joint_inquiry.local_move_completed`
- `joint_inquiry.local_move_failed`
- `joint_inquiry.local_move_skipped`
- `joint_inquiry.return_requested`
- `joint_inquiry.return_completed`
- `joint_inquiry.position_published`
- `joint_inquiry.encounter_linked`
- `joint_inquiry.object_linked`

### 2.3 Limits, corrections and escalation

- `joint_inquiry.resource_limit_warning`
- `joint_inquiry.resource_limit_reached`
- `joint_inquiry.escalation_raised`
- `joint_inquiry.escalation_resolved`
- `joint_inquiry.source_correction_received`
- `joint_inquiry.local_dependency_paused`
- `joint_inquiry.record_corrected`

### 2.4 Review and closure

- `joint_inquiry.review_started`
- `joint_inquiry.extension_proposed`
- `joint_inquiry.extension_accepted`
- `joint_inquiry.extension_declined`
- `joint_inquiry.publication_candidate_created`
- `joint_inquiry.exposition_approved`
- `joint_inquiry.exposition_published`
- `joint_inquiry.marked_dormant`
- `joint_inquiry.reopened`
- `joint_inquiry.archived`
- `joint_inquiry.cancelled`

Unknown event types remain visible if the envelope is valid.

## 3. State derivation

The current inquiry status should be derived from append-only events or stored as a read-model cache.

### 3.1 Allowed transitions

```text
PROPOSED -> FORMING
PROPOSED -> CANCELLED

FORMING -> ACTIVE
FORMING -> CANCELLED
FORMING -> DORMANT

ACTIVE -> REVIEW
ACTIVE -> DORMANT
ACTIVE -> CANCELLED

REVIEW -> ACTIVE       # explicit extension only
REVIEW -> DORMANT
REVIEW -> ARCHIVED
REVIEW -> CANCELLED

DORMANT -> ACTIVE      # explicit reopening with valid commitments
DORMANT -> ARCHIVED
DORMANT -> CANCELLED
```

`ARCHIVED` is terminal operationally; a new related inquiry may be created instead of mutating history.

### 3.2 Activation guard

Activate only when:

- participant count meets `minimum_participants`;
- each accepted participant has an active commitment;
- shared material references validate or are explicitly marked unavailable;
- no blocking escalation exists;
- aggregate declared resource envelope is valid;
- and the coordination profile validates.

## 4. Default `parallel_return` algorithm

```text
1. Validate active commitments.
2. Dispatch one local first-move request to each participant.
3. Wait for completed, skipped, withdrawn or blocked local responses.
4. Link resulting local objects and Encounters.
5. Build participant-specific return bundles from admitted public/shared outputs.
6. Dispatch at most one return request to each eligible participant.
7. Collect local return objects and positions.
8. Enter REVIEW.
9. Do not extend automatically.
```

A slow or silent participant must not force false failure. The inquiry can proceed if its declared minimum and coordination rules allow it. Otherwise it waits, becomes dormant or is cancelled through an explicit event.

## 5. Context bundle isolation

Each local trigger receives only:

- the public/shared inquiry brief;
- its own active commitment;
- explicitly admitted shared material references;
- relevant public/shared outputs from other participants;
- accepted obligations;
- resource bounds;
- and its own local protocol/context assembled by its local runtime.

The coordinator must not send:

- private internal deliberation from another practice;
- another practice's full repository by default;
- hidden model traces;
- secrets;
- or a generated master interpretation.

## 6. Local adapter interface

Framework-neutral contract:

```typescript
interface JointInquiryPracticeAdapter {
  practiceId: string;
  canReceiveInvitation(input: InvitationEnvelope): Promise<CapabilityResult>;
  submitParticipationDecision(input: InvitationEnvelope): Promise<ParticipationDecision>;
  validateCommitment(commitment: LocalCommitment): Promise<ValidationResult>;
  dispatchLocalMove(request: LocalMoveRequest): Promise<DispatchReceipt>;
  resolveLocalObjects(receipt: DispatchReceipt): Promise<LocalObjectReference[]>;
  readLocalPosition(inquiryId: string): Promise<ParticipantPosition | null>;
  pauseDependency(input: DependencyPauseRequest): Promise<DispatchReceipt>;
}
```

The adapter does not expose or standardize the local research ontology.

## 7. Dispatch options

Claude should choose based on current infrastructure:

- GitHub `repository_dispatch`;
- workflow call;
- signed HTTP endpoint;
- file/outbox polling;
- or a hybrid.

Requirements:

- idempotency key per request;
- scoped credentials;
- traceable actor;
- timeout and retry policy;
- no implicit acceptance;
- no production publication side effect;
- and a local kill switch.

## 8. Cost and move accounting

The coordinator records declared usage, not perfect billing truth:

- model calls;
- estimated or provider-reported tokens;
- external API cost;
- elapsed runtime;
- storage or compute where relevant;
- human intervention count as descriptive metadata only.

It enforces:

- per-commitment move count;
- per-practice local budget;
- aggregate inquiry ceiling;
- and hard escalation thresholds.

It does not rank practices by efficiency.

## 9. Notification policy for Frank

Default notifications only for:

- publication candidate;
- blocking escalation;
- rights or affected-public issue;
- budget ceiling requiring an exception;
- protected infrastructure request;
- protocol or public identity change;
- or a concise final inquiry digest.

Do not send daily move summaries unless explicitly requested.

## 10. Failure handling

### Delivery failure

Record and retry according to policy. Do not infer refusal.

### Local workflow failure

Record technical failure, allow local correction or skip. Do not interpret it as research failure.

### Invalid local output

Quarantine the reference; keep the event and validation error visible.

### Budget exhaustion

Pause future dispatches. Existing records remain. Participants may archive, withdraw or request a bounded extension.

### Rights/safety escalation

Quarantine affected outputs and prevent public projection. Other unrelated local work may continue.

### Coordinator outage

No local archive is invalidated. On restart, rebuild state from events and idempotency keys.
