# 03 — Encounter and Exchange Protocol
## A minimal grammar for offers, translations, disagreements and refusals

---

## 1. Design objective

The protocol must permit exchange without imposing a common internal model.

It therefore describes **messages and public events between sovereign practices**, not the complete structure of their research. The protocol should remain small enough that a future collective can implement it without adopting the same framework, language, database or automation stack.

The protocol has four layers:

```text
identity       who is acting and under which protocol version?
reference      which local object/version is involved?
encounter      what inter-practice event occurred?
interpretation what does a named actor claim the encounter means?
```

Identity, references and events can be validated mechanically. Interpretations remain contestable assertions.

---

## 2. Core terms

### Collective

A sovereign participating practice with a versioned manifest and local archive.

### Actor

A human, collective, persona, model runtime, automation, visitor or system component capable of producing an event or assertion.

### Local object

Anything addressable within a collective's archive: work, instrument, dataset, session, claim, question, protocol, source bundle, image, physical realisation record, method or failure.

The shared protocol does not require all collectives to classify objects identically.

### Object reference

An immutable pointer or versioned reference to a local object, including source collective, URI, content hash, version and media type.

### Encounter

A bounded event history connecting at least two actors or collectives.

### Transfer envelope

The package describing the offered object, its status, caveats, rights, obligations, intended use and source version.

### Admission

The receiver's explicit decision about whether and how the offered material enters its local practice.

### Local derivative

A receiver-owned object produced through or in response to an encounter.

### Assertion

An authored, evidenced and versioned claim about objects, actors or encounters.

### Obligation

A condition accepted by a participant, such as preserving a live caveat, reporting corrections or restricting public use.

### Lens

A declared rule set that selects and renders part of the encounter history as a map.

---

## 3. Encounter event vocabulary

Event types are open strings with a stable namespace. The core profile defines the following.

### 3.1 Initiation

- `encounter.proposed` — a potential encounter is created without yet addressing a target.
- `offer.created` — a source offers a specific object or question to a target.
- `invitation.created` — a source invites a target to respond, research or collaborate without transferring an object.
- `challenge.created` — an actor contests a claim, method, evidence or form.
- `commission.created` — an actor requests a new work, instrument or transformation.
- `citation.declared` — an actor declares use or reference to another local object.

### 3.2 Delivery and acknowledgement

- `message.dispatched`
- `message.delivered`
- `message.delivery_failed`
- `message.acknowledged`
- `message.unread_declared` — used only when the target explicitly states it has not reviewed the material.

Technical delivery must not be confused with epistemic acknowledgement.

### 3.3 Receiver decisions

- `offer.accepted`
- `offer.accepted_with_conditions`
- `offer.deferred`
- `offer.declined`
- `offer.ignored` — only emitted after a locally declared policy threshold or explicit classification; silence is otherwise simply silence.
- `offer.withdrawn`
- `invitation.accepted`
- `invitation.declined`

### 3.4 Transformation and response

- `object.admitted`
- `object.transformed`
- `derivative.published`
- `response.published`
- `countermap.published`
- `translation.loss_declared`
- `translation.departure_declared`
- `obligation.accepted`
- `obligation.rejected`
- `obligation.fulfilled`
- `obligation.breached`

### 3.5 Contestation and correction

- `assertion.created`
- `assertion.contested`
- `assertion.supported`
- `assertion.superseded`
- `correction.issued`
- `correction.acknowledged`
- `correction.applied`
- `correction.declined`
- `source.status_changed`
- `derived_object.paused`
- `derived_object.resumed`

### 3.6 Lifecycle

- `encounter.marked_unresolved`
- `encounter.dormant`
- `encounter.reopened`
- `encounter.closed_locally`
- `encounter.archived`

There is no global `encounter.resolved` unless all participating practices explicitly issue compatible local closure events. Even then, future reopening remains possible.

---

## 4. Transfer offer

A transfer offer must contain enough information for the receiver to make an informed decision without reading the entire source repository.

Required content:

- offer ID;
- source and target collective IDs;
- source actor;
- source object reference and content hash;
- human-readable proposition;
- source epistemic status;
- current lifecycle status;
- load-bearing caveats;
- legal/licensing constraints;
- proposed use or open-ended invitation;
- requested attribution;
- correction channel;
- whether live source updates are binding;
- expiration or no-expiration statement;
- creation timestamp and signature/checksum.

Optional content:

- suggested question;
- machine-readable claims;
- attached datasets or media;
- source-local map;
- known adjacency or prior uses;
- risks and affected groups;
- conditions for physical realisation;
- required review before publication.

### 4.1 Offers are not commands

Even where one practice currently calls another “downstream”, the shared protocol models the receiver as autonomous. A source may attach conditions to the use of its object. The receiver may decline those conditions and therefore not claim compliant use.

### 4.2 Open offers

An offer can target:

- one collective;
- several named collectives;
- any participating collective;
- visitors or external researchers.

Open offers must not become algorithmic pressure to respond.

---

## 5. Receiver response

A response has two separate dimensions:

### Admission decision

- accept;
- accept with conditions;
- accept only as citation;
- accept as adversarial material;
- defer;
- decline;
- no public response.

### Interpretive position

The receiver may state that the object is:

- evidence;
- method;
- formal material;
- provocation;
- disputed premise;
- source for a new question;
- unsuitable for current work;
- ethically or legally unusable;
- already treated elsewhere;
- likely to produce only illustration;
- incompatible with the receiver's protocol.

These terms are assertions, not universal enums. The receiver may use its own vocabulary.

### 5.1 Conditional acceptance

Conditions can include:

- use only of a specified version;
- public display of caveats;
- source review before publication;
- no use of third-party restricted material;
- acknowledgement of translation departure;
- return of corrections;
- expiration after source status changes;
- no implication of endorsement;
- limited public or research-only use.

Accepted conditions become obligations in the encounter ledger.

---

## 6. Citation without permission

Publicly accessible work may often be cited without a bilateral agreement, subject to law and licensing. The protocol distinguishes:

- **citation declared** — the citing practice records what it used and how;
- **transfer accepted** — a bilateral encounter with accepted obligations;
- **derivative authorised** — where explicit permission is required and granted;
- **interpretive response** — a new work or argument that does not claim authorised derivation.

The interface must not imply that every citation is a collaboration or endorsement.

---

## 7. Corrections and live status

A source object may change status after transfer.

Examples:

- a claim is corrected;
- an instrument is superseded;
- a dataset is found to contain an error;
- a legal restriction changes;
- a work is withdrawn;
- a caveat becomes load-bearing.

The source emits `source.status_changed` or `correction.issued`. The shared service identifies active encounters referencing that version and sends notifications according to accepted obligations.

The receiver may:

- update its derivative;
- pause public display;
- preserve the historical version with a prominent correction;
- contest the correction;
- declare deliberate divergence;
- remove the dependency.

No silent sideways patching is allowed when the derivative still claims faithful or verified use.

---

## 8. Refusal and silence

Refusal is a first-class public event when the receiver chooses to publish it.

Possible reasons include:

- incompatible epistemic assumptions;
- insufficient evidence;
- source caveats cannot survive the intended form;
- legal or ethical risk;
- the proposal predetermines the research question;
- the result would be illustration rather than a new work;
- capacity or timing;
- thematic irrelevance;
- duplication;
- no reason disclosed.

The source may respond, but may not overwrite the refusal.

### 8.1 Silence

Silence must not automatically become `ignored`, `rejected` or `inactive`. The UI may show:

```text
Offered 12 days ago
No public acknowledgement recorded
```

A collective may publish its own response-time policy. Only then may the system derive a procedural state such as `response_window_elapsed`; it still may not infer motive.

---

## 9. Contamination and indirect influence

Some influence cannot be reduced to a clean transfer.

A concept may recur after multiple encounters. A formal tendency may appear without explicit citation. A model runtime may produce similar links based on shared training data. The protocol must allow uncertain relations:

```json
{
  "relation_type": "possible_contamination",
  "asserted_by": "ulysses",
  "confidence": "conjecture",
  "evidence": ["..."],
  "counter_assertions": ["..."],
  "status": "unresolved"
}
```

Machine-detected similarity is published only as `suggestion.created`, never as a collective assertion unless admitted through local process.

---

## 10. Encounter status is perspectival

A single encounter may have different local states:

```text
Meridian: transfer completed; obligations active
Ensemble: transformation in production; interpretation unresolved
Ulysses: challenge remains open
The Middle: encounter active; no shared resolution
```

The UI must show participant-specific statuses rather than flattening them into one label.

---

## 11. Exchange contracts

A collective may publish reusable encounter contracts.

Examples:

### Meridian verified-material contract

- live status travels;
- caveats remain prominent;
- corrections flow upstream;
- downstream work pauses or visibly marks superseded evidence;
- no claim of verification beyond the exact source version.

### Ensemble experiential-work contract

- a derivative may not present documentation as if it were the work;
- interaction and dramaturgy must remain intact where fidelity is claimed;
- physical realisation records are version-specific;
- imagined elements remain labelled.

### Ulysses open-response contract

- response and disagreement are welcome;
- conceptual relations are attributed to their author;
- no response may be presented as Ulysses' endorsed interpretation without acknowledgement;
- protocol and project title remain mutable.

Contracts are local policies offered for acceptance. The federation does not invent one universal contract.

---

## 12. Security and authenticity

Every machine-readable public event should include:

- stable event ID;
- issuer collective and actor;
- timestamp;
- source URI;
- content hash;
- schema version;
- previous event hash where a local hash chain is used;
- optional cryptographic signature;
- import timestamp and importer version.

Phase 1 may rely on Git commit provenance and HTTPS. Phase 2 should add signed manifests or GitHub App verification for writeable exchange.

The system must defend against:

- forged collective identity;
- replayed offers;
- mutable source links without hashes;
- injection through untrusted Markdown/HTML;
- automatic acceptance triggered by malicious payloads;
- unauthorised public attribution;
- prompt injection in materials consumed by agents;
- hidden external tracking in embedded works.

---

## 13. Minimal local filesystem profile

A collective may implement federation using files:

```text
federation/
  collective.json
  policies/
    default-transfer-contract.json
  outbox/
    index.json
    2026-07-14-offer-001.json
  inbox/
    README.md
  encounters/
    enc-2026-001/
      local-position.json
      assertions.json
```

The shared service may also read equivalent HTTP endpoints. File layout is a recommended profile, not a mandatory internal architecture.

---

## 14. Acceptance tests for the protocol

A valid implementation must demonstrate:

1. an offer from one collective can be validated without importing its entire repository;
2. the receiver can accept with conditions or refuse;
3. the source object remains an opaque local reference with a stable hash;
4. the receiver can create a local derivative with a different object type;
5. both sides can assert incompatible meanings;
6. a source correction propagates as a new event without rewriting history;
7. silence is displayed without inferred motive;
8. a machine similarity suggestion remains clearly non-authoritative;
9. every event can be traced to issuer, source and schema version;
10. an encounter can remain unresolved indefinitely;
11. unknown event or relation types remain visible and do not crash or disappear;
12. a collective can leave while its historical encounters remain legible.
