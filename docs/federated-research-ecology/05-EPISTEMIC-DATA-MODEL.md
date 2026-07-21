# 05 — Epistemic Data Model
## Shared events without a shared ontology

---

## 1. Data architecture principle

The federation must distinguish four layers that conventional content systems often collapse:

1. **Operational event** — something was recorded as happening.
2. **Local object identity** — an addressable object exists in a sovereign archive.
3. **Interpretive assertion** — an actor claims a relation, meaning or status.
4. **Map projection** — a lens selects and renders a temporary view.

The core model is:

```text
append-only encounter events
+ versioned collective manifests
+ opaque local object references
+ authored assertions and counter-assertions
+ accepted obligations
+ versioned lenses and reproducible maps
+ persistent interventions
+ explicit exclusions and render failures
```

PostgreSQL is the operational source of truth for The Middle. Local repositories remain authoritative for local protocols, works and session records. Git exports preserve human-readable history.

---

## 2. Two kinds of canonical record

### 2.1 Canonical event record

The shared ledger may canonically record:

- Meridian emitted offer X at time T;
- Ensemble acknowledged it at time U;
- Ensemble accepted conditions A and B;
- a correction was issued;
- a map version was generated.

These are operational facts within the system, subject to correction through new events rather than silent mutation.

### 2.2 Non-canonical meaning

The ledger may not canonically decide:

- that Ensemble faithfully translated Meridian;
- that Ulysses exposed the true meaning of the instrument;
- that a work extends another work;
- that an encounter succeeded;
- that a collective is central or isolated;
- that a correction resolved a conceptual dispute.

These are authored assertions or local statuses.

---

## 3. Core records

The starting SQL is in `db/0001_initial.sql`.

### 3.1 `collectives`

Stable federation identities.

Fields:

- `id` — stable slug or UUID;
- `current_name` — convenience cache, not the only historical name;
- `status` — active, dormant, left, archived;
- `repository_url`;
- `public_url`;
- `responsible_publisher_actor_id`;
- created and updated timestamps.

### 3.2 `collective_versions`

Versioned self-authored manifests.

Fields include:

- collective ID;
- version number;
- public name and surface name;
- description;
- protocol URI and content hash;
- commitments JSON;
- accepted encounter types;
- inbox and outbox configuration;
- runtime disclosure policy;
- effective date;
- issuer and signature;
- source URI and imported commit SHA.

A manifest change never overwrites historical versions.

### 3.3 `actors`

Accountable sources of events and assertions.

Kinds:

- `human`;
- `collective`;
- `persona`;
- `model_runtime`;
- `automation`;
- `visitor`;
- `institution`;
- `system_component`;
- `unknown`.

Important distinction:

```text
collective assertion != raw model output
```

A model may generate a suggestion. A collective assertion requires admission through the local protocol.

### 3.4 `local_object_refs`

Opaque references to objects owned elsewhere.

Fields:

- federation ID;
- source collective;
- local ID as declared by source;
- canonical URI;
- object version;
- media type;
- content hash;
- source-local type as open string;
- optional broad interoperability class;
- title/summary cache;
- lifecycle status at import;
- source commit and imported timestamp.

The broad class may include `work`, `session`, `claim`, `dataset`, `instrument`, `protocol`, `source_bundle`, `physical_record`, `question`, `other`. It must never replace the source's local type.

### 3.5 `encounters`

Bounded shared histories.

Fields:

- encounter ID;
- public slug;
- initiating event;
- editorial proposition and author;
- visibility;
- created timestamp;
- dormant/archived timestamps;
- current editorial pin state;
- optional correlation group.

An encounter has no single global semantic status.

### 3.6 `encounter_participants`

Links collectives or actors to encounters with:

- role as open string: source, target, respondent, observer, curator, affected party;
- joined timestamp;
- local status;
- local status rationale;
- last acknowledged event;
- whether public response is expected under an accepted contract.

### 3.7 `events`

Append-only records.

Fields:

- event ID;
- encounter ID;
- event type as open namespace string;
- issuer collective and actor;
- timestamp claimed by issuer;
- received/imported timestamp;
- source URI;
- source commit;
- schema version;
- payload JSONB;
- content hash;
- previous hash/signature;
- visibility;
- validation state;
- importer version;
- superseding/correction event reference where relevant.

Unknown event types remain valid if the envelope is valid.

### 3.8 `offers`

Structured projection of `offer.created` events for querying.

Fields:

- offer ID and event ID;
- source/target collective;
- subject object reference;
- proposition;
- source epistemic and lifecycle status;
- caveats JSON;
- rights JSON;
- requested obligations JSON;
- response deadline if declared;
- current delivery state.

The source event remains immutable; the table is a read model.

### 3.9 `responses`

Receiver response records:

- response event;
- offer ID;
- admission decision;
- public rationale;
- accepted/rejected conditions;
- intended local use;
- receiver-local object reference when created;
- visibility.

### 3.10 `obligations`

Accepted conditions with lifecycle.

Fields:

- obligation ID;
- encounter and source event;
- parties;
- clause text;
- machine-readable rule when possible;
- status: proposed, active, fulfilled, breached, disputed, expired, superseded;
- evidence events;
- public prominence level;
- timestamps.

An obligation is created only after acceptance, not merely because a source requested it.

### 3.11 `assertions`

Interpretive or relational claims.

Fields:

- assertion ID;
- encounter ID;
- author actor and author collective;
- subject reference;
- predicate as open string;
- object reference or literal value;
- rationale;
- epistemic status: verified, sourced, conjecture, imagined, interpretation, machine_suggestion, disputed, unknown;
- evidence list;
- originating event/session;
- valid-from and superseded timestamps;
- visibility;
- current lifecycle status.

Examples:

```text
Ensemble asserts: derivative D transforms instrument I through participation.
Ulysses asserts: D contests the premise of stable measurement.
Meridian contests: the instrument never asserted ontological stability.
```

All three remain possible.

### 3.12 `assertion_responses`

Support, contestation, qualification or supersession of an assertion.

A response does not modify the original assertion. It creates a linked record.

### 3.13 `lenses` and `lens_versions`

A lens defines:

- author;
- purpose;
- eligible event and assertion types;
- participant scope;
- time boundary;
- evidence thresholds;
- inclusion/exclusion rules;
- ordering/layout strategy;
- renderer type;
- treatment of unknown relations;
- declared blind spots;
- whether machine suggestions are visible;
- code/configuration hash.

Lens definitions are executable and versioned.

### 3.14 `maps` and `map_versions`

A map is a reproducible projection:

- encounter ID;
- lens version;
- generation timestamp;
- source event watermark;
- included object refs, events, assertions and obligations;
- explicit exclusions;
- unresolved items;
- render failures;
- generated data payload;
- renderer version;
- public slug;
- author/editor;
- checksum.

Stable citation URLs reference an immutable map version.

### 3.15 `exclusions`

First-class declarations of what a lens or map omits.

Kinds:

- outside time window;
- private or legally restricted;
- rejected by evidence rule;
- local object unavailable;
- participant not included;
- machine suggestion hidden;
- unsupported media;
- unknown relation;
- editorial scope;
- computational limit;
- other.

### 3.16 `interventions`

Visitor or external records:

- author identity mode;
- target encounter/object/assertion;
- proposed assertion, correction, source or map fork;
- evidence and rationale;
- moderation status;
- target collective acknowledgement/admission state;
- publication and privacy state;
- response history.

Moderation approval means the intervention may be publicly displayed. It does not mean a collective accepts its claim.

### 3.17 `machine_suggestions`

Separate store for unadmitted model or algorithm output:

- generated by runtime/tool;
- prompt/config hash;
- input refs;
- suggested relation or object match;
- confidence metadata;
- review state;
- admitted assertion ID if accepted;
- expiry.

This separation prevents recommendation systems from silently becoming ontology.

---

## 4. Object identity and versioning

### 4.1 Stable identity

A local object reference should use:

```text
collective_id + local_object_id + version + content_hash
```

The URI may change, but the hash and source commit preserve the referenced state.

### 4.2 Mutable live status

An object may have a current live status separate from the exact transferred version.

Example:

```text
Transferred version: instrument-011@commit-abc123
Transferred status: verified with caveat C-04
Current source status: superseded by commit-def456
```

The UI must show both.

### 4.3 Physical objects

A physical work needs a versioned documentation record with:

- fabrication files;
- dimensions/materials;
- realisation date and place;
- responsible human actors;
- media documentation rights;
- relation to digital source;
- known divergence from plan.

The documentation is not automatically identical to the physical work.

---

## 5. Epistemic statuses

The shared system cannot force one vocabulary across collectives. It can provide interoperable broad statuses while preserving local terms.

Recommended broad profile:

- `operational_fact` — event record such as delivery or publication;
- `verified` — passed a declared verification process;
- `sourced` — factual claim with retrievable source but not source-collective verification;
- `interpretation` — reasoned reading;
- `conjecture` — explicitly uncertain proposition;
- `imagined` — declared fictional/speculative material;
- `machine_suggestion` — unadmitted computational proposal;
- `disputed` — actively contested;
- `superseded` — replaced but preserved;
- `unknown`.

Each record also stores `local_epistemic_status` as the source's exact label.

No universal hierarchy such as `verified > sourced > imagined` should be encoded. They answer different questions.

---

## 6. Event correction and immutability

Events are append-only. Incorrect records are handled through:

- `record.corrected` event referencing the original;
- corrected payload or field list;
- reason and author;
- display policy that marks the original as corrected;
- retention of both hashes.

Legal deletion may require redaction. The system should retain a minimal tombstone stating that a record was removed and under which policy, unless legally prohibited.

---

## 7. Projection pipeline

```text
local repository or endpoint
-> adapter validates manifest/event envelope
-> raw event stored append-only
-> object references resolved and hashed
-> query/read models updated
-> assertions remain separate from events
-> selected lens version executes
-> map payload generated with exclusions
-> renderer produces visual and textual views
-> immutable map version published
```

Every map records the event watermark and code/configuration versions used.

---

## 8. Query examples

### Active obligations affected by a correction

```sql
SELECT o.*
FROM obligations o
JOIN encounter_object_refs eor ON eor.encounter_id = o.encounter_id
WHERE eor.local_object_ref_id = :corrected_object
  AND o.status IN ('active', 'disputed');
```

### Participant-specific encounter states

```sql
SELECT c.current_name, ep.local_status, ep.local_status_rationale
FROM encounter_participants ep
JOIN collectives c ON c.id = ep.collective_id
WHERE ep.encounter_id = :encounter_id;
```

### Assertions visible through a lens

The application should execute a versioned lens configuration rather than hard-code one universal query. The generated map stores the resulting IDs and exclusions.

---

## 9. What must not be inferred automatically

The database or AI layer must not automatically promote these to facts:

- two objects are related because embeddings are similar;
- one collective influenced another because dates align;
- a non-response is rejection;
- an accepted object implies endorsement;
- a source correction invalidates the entire derivative;
- a frequently cited collective is central or superior;
- a network cluster is a research theme;
- a map edge is a real causal relation;
- an encounter has succeeded because it produced a work.

Such propositions may be generated as reviewable machine suggestions.

---

## 10. Data retention and export

Public records should support:

- JSON export per encounter;
- JSON-LD or ActivityStreams-inspired export later, without requiring ActivityPub;
- CSV/JSON event ledger export;
- static Markdown encounter dossier;
- immutable citation snapshot;
- Git export with checksums;
- local repository backlinks.

Private moderation and identity data must be separated from public research records and protected by role-based access.

---

## 11. Data-model acceptance criteria

1. Local object types remain open strings.
2. Events and assertions are separate tables and APIs.
3. Participant-specific status is possible.
4. Accepted obligations are queryable and versioned.
5. Source and current live status can differ visibly.
6. Unknown event/relation types survive import.
7. Machine suggestions cannot appear as collective assertions without admission.
8. Map versions are reproducible from a lens version and event watermark.
9. Exclusions and render failures are first-class.
10. Historical cockpit relations can be imported as Ulysses-authored assertions, not canonical edges.
11. A fourth collective can join without database migration for its local object vocabulary.
12. Leaving the federation does not destroy historical encounters.
