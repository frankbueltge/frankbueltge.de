# Domain model and schemas
## An additive shared object without a shared ontology

## 1. Design principle

The existing Research Ecology distinguishes operational events, local object identity, authored interpretation and map projection. Joint Inquiry must preserve that separation.

The minimal extension is:

```text
JointInquiry
+ participant records
+ local commitments
+ links to existing Encounters
+ links to opaque local objects
+ inquiry-level operational events
```

It must not copy local research databases or normalize all local project types.

## 2. Main records

### 2.1 `JointInquiry`

Required fields:

- `id` — stable ID, recommended `ji-YYYY-NNN`;
- `schema_version`;
- `slug`;
- `title`;
- `shared_problem`;
- `why_multiple_practices`;
- `initiated_by` actor reference;
- `minimum_participants`;
- `coordination_profile` as open string;
- `status`;
- `visibility`;
- `created_at` and `updated_at`;
- `resource_envelope`;
- `publication_policy`;
- `source_encounter_refs` and `shared_material_refs`;
- `revision`.

Optional:

- public summary;
- invited practice IDs;
- maximum participants;
- phase;
- target review date;
- affected-public summary;
- rights summary;
- coordinator component reference;
- declared stop conditions;
- custom coordination definition.

### 2.2 `JointInquiryParticipant`

Represents participation without assigning a fixed epistemic role.

Fields:

- inquiry ID;
- practice/collective ID;
- actor responsible for the local decision;
- procedural role as open string;
- participant status;
- joined/declined/withdrawn timestamps;
- local status rationale;
- local project reference;
- latest commitment version;
- last acknowledged inquiry event;
- whether a response is expected under an accepted commitment.

### 2.3 `LocalCommitment`

Versioned and participant-authored.

Fields:

- commitment ID and version;
- inquiry ID and practice ID;
- local project reference;
- local question;
- method/operation description;
- first move description;
- admitted input references;
- explicit refusals and conditions;
- change conditions;
- planned output types as open strings;
- maximum autonomous moves;
- resource budget;
- response or return obligation;
- escalation triggers;
- local publication policy;
- status;
- issuer, timestamp, source URI and content hash.

### 2.4 `JointInquiryEvent`

Inquiry-level operational events use the same provenance envelope as Encounter events.

Fields:

- event ID;
- inquiry ID;
- event type as open namespace string;
- issuer collective and actor;
- claimed timestamp and received timestamp;
- schema version;
- payload JSON;
- source URI and source commit;
- content hash;
- previous hash/signature where used;
- visibility;
- validation state;
- importer version;
- correction/supersession reference.

### 2.5 Link records

- `joint_inquiry_encounters` — many-to-many links to existing Encounter IDs, with rationale and linking event.
- `joint_inquiry_object_refs` — links to existing opaque local object references, classified only by a local/open relation such as `shared_material`, `local_input`, `local_output`, `return_object`, `publication_component`.
- `joint_inquiry_assertions` are **not** a new assertion table. Existing assertions may reference the inquiry as subject or scope.

## 3. Identity and authority

A local object remains identified by:

```text
practice_id + local_object_id + version + content_hash
```

The Joint Inquiry may cache title and summary for display, but the source practice remains authoritative.

A local commitment is authoritative only for the issuing practice. No coordinator writes one on behalf of a participant.

## 4. Invariants

1. A Joint Inquiry needs at least two accepted participants before `ACTIVE`.
2. Every accepted participant needs one active Local Commitment.
3. Each Local Commitment is versioned and immutable after publication; revisions supersede.
4. Inquiry-level status is operational, not a judgment of value.
5. Encounters remain independently addressable and can outlive the inquiry.
6. Local objects remain owned by local archives.
7. No participant's absence or silence is inferred as refusal.
8. A coordinator can dispatch and validate but cannot author participant positions.
9. Publication state is separate from inquiry state.
10. A public exposition cannot imply common authorship unless explicitly declared.

## 5. File-backed profile

For a minimal Git-first implementation:

```text
research-ecology/
  joint-inquiries/
    ji-2026-001/
      inquiry.json
      events/
        0001-proposal.created.json
        0002-invitation.sent.json
      README.md                 # optional generated dossier
```

Local repositories may add:

```text
federation/
  joint-inquiries/
    ji-2026-001/
      commitment.json
      position.json
      objects.json
```

The shared importer validates and references these files. It does not require the same internal project structure across repositories.

## 6. PostgreSQL mapping

The additive SQL draft creates:

- `joint_inquiries`;
- `joint_inquiry_participants`;
- `joint_inquiry_commitments`;
- `joint_inquiry_events`;
- `joint_inquiry_encounters`;
- `joint_inquiry_object_refs`.

If the current implementation already has a generic event or scope model, Claude should adapt the migration rather than duplicate infrastructure. The semantic invariants above are mandatory; the exact table names are not.

## 7. API profile

Read endpoints:

```text
GET /api/v1/joint-inquiries
GET /api/v1/joint-inquiries/:id
GET /api/v1/joint-inquiries/:id/events
GET /api/v1/joint-inquiries/:id/participants
GET /api/v1/joint-inquiries/:id/commitments
GET /api/v1/joint-inquiries/:id/encounters
GET /api/v1/joint-inquiries/:id/objects
```

Write endpoints, if the current architecture supports authenticated writes:

```text
POST /api/v1/joint-inquiries
POST /api/v1/joint-inquiries/:id/invitations
POST /api/v1/joint-inquiries/:id/participant-decisions
POST /api/v1/joint-inquiries/:id/commitments
POST /api/v1/joint-inquiries/:id/events
POST /api/v1/joint-inquiries/:id/encounter-links
POST /api/v1/joint-inquiries/:id/object-links
```

Write operations must be attributable and idempotent. An initial implementation may remain Git-event/import driven.

## 8. Suggested query/read model

A Joint Inquiry page needs one read model containing:

```typescript
{
  inquiry,
  participants: [{ participant, activeCommitment, localPosition }],
  phases,
  eventTrace,
  linkedEncounters,
  objectRefs,
  participantAssertions,
  activeObligations,
  escalations,
  publicExposition,
  exclusions,
  apparatusSummary
}
```

The read model may present a derived current phase. It must preserve raw events and participant-specific states.

## 9. JSON Schemas

The package includes:

- `schemas/joint-inquiry.schema.json`
- `schemas/local-commitment.schema.json`
- `schemas/joint-inquiry-event.schema.json`
- `schemas/participant-position.schema.json`

Schemas intentionally allow open strings for local modes, object types, relations and output types.

## 10. Export

Each inquiry should support:

- JSON export;
- static Markdown dossier;
- event ledger export;
- immutable citation snapshot for a public exposition;
- and backlinks to every public local object.
