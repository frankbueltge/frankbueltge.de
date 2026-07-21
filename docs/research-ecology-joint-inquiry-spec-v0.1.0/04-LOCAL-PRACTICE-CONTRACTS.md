# Local practice contracts
## How Joint Inquiry connects without flattening Ulysses, Meridian or Ensemble

## 1. General rule

The shared system defines only invitation, commitment, local move, object reference, encounter linkage and procedural state. Every practice maps those concepts into its own protocol.

The adapter contract must be thin. It must not require the practices to share project folders, claim types, artwork statuses or research methods.

## 2. Ulysses v4.1

### 2.1 Participation model

A Joint Inquiry participation becomes a normal Ulysses v4 project within its standing delegation.

Recommended local mapping:

```text
projects/<ulysses-project-id>/
  SCORE.md
  APPARATUS.md
  TRACE.md
  EXPOSITION.md
  work/
```

`SCORE.md` should include:

- `joint_inquiry_id`;
- admitted shared material refs;
- Ulysses' local problem construction;
- the artistic/research operation;
- what would count as external or material resistance;
- resource and move limits;
- return obligation;
- kill condition;
- and publication state.

### 2.2 Autonomous acceptance

Ulysses may accept a low-risk internal Joint Inquiry without Frank's project-specific approval only if:

- the standing delegation permits self-initiation/participation;
- budget, runtime, rights and affected-public boundaries are satisfied;
- no protocol change is required;
- the inquiry supplies concrete material rather than a random theme;
- and local capacity is available.

The acceptance event must still be issued by Ulysses' local process and remain attributable.

### 2.3 Legitimate Ulysses outputs

- artwork or work probe;
- artistic research study;
- counter-map;
- conceptual or material challenge;
- refusal;
- unassimilated trace;
- project archive or kill record;
- publication candidate.

Ulysses is not obliged to provide theory for the other practices.

### 2.4 Publication

Ulysses may auto-land research records under the existing standing delegation. A curated Atelier work remains human-approved.

## 3. Meridian and Meridian Research Runtime

### 3.1 Participation model

Meridian remains the scientific/empirical practice. Its local implementation may use Meridian Classic, MRR or another local apparatus.

A Joint Inquiry commitment may reference a local:

- ResearchScore;
- TaskBundle;
- dataset;
- instrument;
- claim;
- EvidenceCrate;
- verification result;
- correction event;
- fieldwork record;
- or local object type not known to the shared system.

The shared layer stores opaque references and broad display metadata only.

### 3.2 Boundary rule

MRR's hypothesis, evidence and claim ontology must not become the Joint Inquiry ontology. Ulysses and Ensemble are not required to translate their work into Claims or EvidenceCrates.

### 3.3 Legitimate Meridian outputs

- evidence or source dossier;
- adversarial audit;
- replication or measurement;
- empirical observation;
- instrument;
- negative result;
- corrected or contested claim;
- methodological limitation;
- refusal because the question is not researchable under current conditions.

Meridian is not obliged to serve as a fact-checking utility for every artistic output. A temporary verification commitment must be explicit.

### 3.4 Return effect

A strong inquiry should permit an artistic or material result to change Meridian's question, instrument, categories, evidence threshold or next test. Merely supplying evidence downstream does not satisfy reciprocal collaboration by itself.

## 4. Ensemble / Studio

### 4.1 Participation model

Ensemble maps the inquiry to its current local work/project structure after Claude audits the actual protocol and workboard.

A local commitment should state:

- the material or experiential problem it recognizes;
- the intended work form or probe;
- what it refuses to illustrate;
- material, spatial, interface or participant conditions;
- return path to other practices;
- and kill/terminal conditions.

### 4.2 Legitimate Ensemble outputs

- material probe;
- spatial or interactive prototype;
- performance score;
- visual, sonic or computational work;
- visitor/participant observation where ethically valid;
- refusal;
- killed work with consequential local change;
- work or exposition candidate.

Ensemble is not a downstream design service.

### 4.3 Affected publics

Any participant study, user observation or work involving identifiable/affected people must follow the local ethical and consent boundary. Prototype behaviour may initially use synthetic or consenting internal test participants.

## 5. Practice manifests

Each practice manifest may add a Joint Inquiry capability profile:

```json
{
  "joint_inquiry": {
    "accepted": true,
    "auto_accept_internal": false,
    "supported_coordination_profiles": ["parallel_return", "cross_examination", "relay"],
    "max_concurrent_inquiries": 1,
    "response_policy": "local",
    "default_contract_uri": "...",
    "escalation_policy_uri": "..."
  }
}
```

This profile advertises capability, not obligation.

## 6. Open invitations from local objects

A practice may mark a local object with one or more non-binding signals:

```text
OPEN_FOR_JOINT_INQUIRY
NEEDS_EMPIRICAL_CHALLENGE
NEEDS_ARTISTIC_OPERATION
NEEDS_MATERIAL_TEST
NEEDS_COUNTERPOSITION
NEEDS_EXTERNAL_FIELDWORK
```

These are invitations or machine-readable suggestions. They do not create relationships or initiate work by themselves.

## 7. Frank's participation

Frank may participate as:

- initiator;
- local collaborator inside Ulysses, Meridian or Ensemble;
- curator/editor;
- external critic;
- affected operator;
- or responsible publisher.

His participation can vary over time. Absence does not block mandate-compliant local work. Presence is not treated as contamination from outside the apparatus; it is an explicit part of it.

## 8. Required local adapter tests

For every practice prove:

1. invitation can be received without importing another practice's complete ontology;
2. acceptance or refusal is issued locally;
3. local project can reference the inquiry;
4. local output remains a local object;
5. shared coordinator cannot publish on its behalf;
6. resource limits are enforceable;
7. withdrawal does not rewrite prior history;
8. local protocol remains authoritative.
