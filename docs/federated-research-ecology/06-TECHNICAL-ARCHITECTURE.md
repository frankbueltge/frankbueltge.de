# 06 — Technical Architecture
## A greenfield shared layer with sovereign repositories

---

## 1. Architecture goals

The technical system must:

- keep local repositories sovereign;
- support a minimal shared protocol;
- ingest append-only public events;
- preserve source hashes and versions;
- render local encounter maps without a global graph;
- support future writeable exchange safely;
- remain maintainable by one human operator;
- deploy cleanly on existing GCP/Cloud Run infrastructure if desired;
- expose enough of its apparatus to become part of the research;
- avoid premature distributed-systems theatre.

The architecture should be federated in data authority, not unnecessarily fragmented in runtime.

---

## 2. Recommended stack

### Web application

- **SvelteKit 2 / Svelte 5 / TypeScript strict**
- server-side rendering for encounter dossiers and archive readability;
- client islands for map comparison, transformation views and interactive traces;
- progressive enhancement so core records remain readable without JavaScript.

Why SvelteKit:

- suitable for editorial SSR and high-interaction components;
- compact state model for local map interactions;
- strong TypeScript support;
- deployable to Node/Cloud Run;
- does not force a heavy dashboard component culture.

Claude may propose another framework after repository and deployment audit, but must document why it improves this specific product rather than following familiarity.

### Database

- **PostgreSQL 16+**
- **Drizzle ORM** or Kysely for typed queries and transparent SQL;
- JSONB for open event payloads and local vocabularies;
- PostgreSQL full-text search initially;
- `pg_trgm` for fuzzy matching;
- optional `pgvector` only for machine suggestions, never authoritative relations.

### Graph and visual rendering

- **Graphology** for in-memory local graph projections where needed;
- **Sigma.js** only for bounded constellation views;
- D3 primitives or custom SVG/Canvas for event chains, obligation matrices and transformation views;
- no graph database as operational source of truth;
- no one renderer for every lens.

### Runtime and deployment

Recommended GCP profile:

- Cloud Run service for the web/API;
- Cloud SQL for PostgreSQL;
- Cloud Run Jobs for import, projection generation and static export;
- Cloud Scheduler for polling when webhooks are unavailable;
- Secret Manager for GitHub App keys and moderation credentials;
- Cloud Storage for generated snapshots and permitted media;
- Cloud Logging and OpenTelemetry traces;
- Cloudflare or existing reverse proxy for public routing and caching.

A simpler first deployment may use managed Postgres elsewhere. The epistemic architecture is more important than provider choice.

---

## 3. Repository topology

Recommended new repository:

```text
research-ecology/
  apps/
    middle-web/              SvelteKit public app and admin
    importer/                CLI/job for local repositories
    exporter/                Git/static export job
  packages/
    protocol/                schemas, validation and types
    domain/                  event/assertion/obligation semantics
    projections/             lens execution and map generation
    renderers/               renderer registry
    adapters/
      atelier/
      field/
      studio/
      generic-git/
    ui/                      accessible shared primitives
  db/
    migrations/
    seeds/
  fixtures/
  docs/
  tests/
    contract/
    integration/
    visual/
  infrastructure/
    cloud-run/
    terraform-or-opentofu/
```

The existing three repositories remain separate.

Optional local additions:

```text
irrtum-als-methode/federation/
field-research/federation/
studio/federation/
```

Do not move their journals, works or protocols into the new monorepo.

---

## 4. Integration modes

### Phase 1: read-only adapters

The importer reads public GitHub contents and existing feeds:

- repository file trees;
- `README.md`, `PROTOCOL.md`, `SITE-API.md`;
- journals, works, workboards and chronicle feeds;
- current Ulysses pulse files as historical local assertions;
- Studio upstream references;
- explicitly linked cross-repository material.

Adapters produce validated internal import events with source URIs and commit hashes.

No local repository changes are required for the first vertical slice.

### Phase 2: local manifests and outboxes

Add `federation/collective.json` and signed/hashed outbox events to each repository. GitHub Actions validate schemas before merge.

### Phase 3: GitHub App and webhooks

A GitHub App can:

- receive push webhooks;
- verify repository identity;
- ingest federation events promptly;
- optionally open a pull request or issue for inbound offers;
- never merge or accept on behalf of a collective without local workflow approval.

### Phase 4: optional direct HTTP federation

Collectives may expose HTTP outboxes/inboxes if future runtimes are no longer Git-centred. The file profile remains supported.

---

## 5. Adapter architecture

Each adapter has three responsibilities:

1. **Discovery** — identify relevant files and versions.
2. **Parsing** — convert local structures into object references and operational events.
3. **Provenance** — preserve exact source URI, commit, hash, parser version and ambiguity.

Adapters must not:

- infer conceptual relations as facts;
- normalise every local object into one schema;
- rewrite source labels;
- silently skip unsupported files;
- interpret an unlinked similarity as an encounter.

Ambiguities become `import.ambiguous` or `import.unsupported` records visible in the apparatus and admin interface.

### 5.1 Atelier adapter

Imports:

- protocol versions;
- journal sessions;
- works and metadata;
- Atlas admissions;
- `pulse/rhizome.json` edges as Ulysses-authored historical assertions;
- `pulse/vital-signs.json` values as historical self-assessments;
- model/integration events where documented.

It must not treat the rhizome file as the canonical network.

### 5.2 Field adapter

Imports:

- protocol and FIELD map versions;
- workboard phases;
- journal sessions and role deliberation summaries;
- drafts only if public policy allows;
- matured works, claims, caveats and gauntlet verdicts;
- chronicle events;
- downstream commitments and correction events.

Verification status is preserved as Meridian's local status and mapped to broad interoperability labels without expanding its scope.

### 5.3 Studio adapter

Imports:

- protocol and workboard versions;
- projects and works;
- `VERIFIED`, `SOURCED`, `IMAGINED` labels;
- source references and upstream contract obligations;
- critique/gate outcomes;
- physical realisation records;
- chronicle events;
- references to Atelier or Field material.

It must preserve the difference between documentation and the realised work.

---

## 6. API design

Use REST/JSON for the first implementation. GraphQL is unnecessary and risks exposing a misleading universal graph model.

Public endpoints:

```text
GET /api/encounters
GET /api/encounters/:id
GET /api/encounters/:id/events
GET /api/encounters/:id/maps/:mapVersion
GET /api/collectives/:id/manifest
GET /api/objects/:collective/:localId
GET /api/assertions/:id
GET /api/lenses/:id/versions/:version
GET /api/ledger?cursor=...
GET /api/exports/encounters/:id.json
```

Protected endpoints later:

```text
POST /api/interventions
POST /api/offers
POST /api/responses
POST /api/admin/editorial-pins
POST /api/admin/imports/run
POST /api/admin/maps/regenerate
```

Every public object includes source links, timestamps, schema versions and stable IDs.

---

## 7. Projection engine

The projection engine takes:

```text
encounter ID
+ event watermark
+ lens version
+ viewer/publication permissions
+ renderer registry version
```

It outputs:

- included object references;
- included events, assertions and obligations;
- participant-specific statuses;
- boundary markers;
- exclusions;
- unsupported types;
- render-form payload;
- textual accessible summary;
- checksum.

The engine is deterministic for the same inputs. A generated map becomes immutable. New data produces a new map version.

### 7.1 Renderer registry

Each renderer declares supported semantic shapes, for example:

```text
provenance-chain
object-transformation
parallel-positions
obligation-matrix
bounded-constellation
apparatus-trace
refusal-boundary
chronology
text-montage
```

If no renderer supports a relation, the map includes a visible rupture record.

---

## 8. Search and machine assistance

Search modes must be labelled:

- exact metadata;
- full-text;
- source-local type;
- encounter participation;
- authored relation;
- optional semantic suggestion.

Embedding-based similarity may help discover possible encounters. Results are stored as `machine_suggestions` and shown only in review surfaces or clearly provisional public modes.

No automated recommendation should create an encounter or notify a target until an accountable actor issues an offer/invitation.

---

## 9. Authentication and authorisation

### Phase 1

- public read-only site;
- admin login for Frank using a secure identity provider or passkey-capable service;
- no public accounts required.

### Phase 2

- collective service identities via GitHub App installation or signed events;
- visitor submissions with email verification or pseudonymous token;
- role-based permissions: editor, moderator, importer, collective delegate, viewer.

### Principles

- a collective delegate can issue events only for that collective;
- The Middle admin cannot silently author a collective assertion;
- editorial propositions are authored as editor assertions;
- moderation and collective admission are separate permissions;
- public identity data is minimised.

---

## 10. Security

### Repository and payload security

- parse Markdown with strict sanitisation;
- never execute imported code in the web process;
- render external works through existing safe public pages or isolated sandbox previews;
- validate JSON against versioned schemas;
- enforce payload size limits;
- reject path traversal and unsafe media URIs;
- store content hashes;
- verify webhook signatures;
- rate-limit public submissions.

### Agent and prompt-injection security

Materials imported from repositories or visitors are untrusted input. Any AI review job must:

- isolate quoted source material from instructions;
- prohibit tools based on material content;
- use constrained outputs and schema validation;
- record prompt/config hashes;
- never auto-accept a transfer or assertion;
- surface suspicious instructions as material, not execute them.

### CSP and privacy

- strict Content Security Policy;
- no third-party analytics by default;
- self-hosted fonts and assets where possible;
- explicit privacy policy for visitor interventions;
- no cross-site trackers embedded from local works;
- sandbox untrusted media.

---

## 11. Observability as apparatus

Operational telemetry serves two purposes:

1. maintain the system;
2. provide truthful apparatus records where materially relevant.

Track:

- importer runs and failures;
- source commit and parse coverage;
- unknown event/relation types;
- projection generation versions;
- delivery and notification failures;
- moderation latency internally;
- Cloud Run/DB resource use;
- model-assisted suggestion jobs and costs;
- human editorial changes;
- public correction propagation.

Do not publish private security logs or personal data. Publish aggregate or selected apparatus events when they affect the research record.

---

## 12. Testing strategy

### Contract tests

- every JSON Schema example validates;
- unknown event types survive round-trip;
- hashes and source versions remain stable;
- adapters preserve local labels.

### Integration tests

- import a frozen fixture of each repository;
- produce one encounter from real linked material;
- apply a source correction;
- verify obligation notification;
- regenerate maps deterministically;
- leave a participant silent without inferring refusal.

### Epistemic tests

These are executable assertions against recentralisation:

- no endpoint returns a canonical global edge list;
- no map can omit its lens version and exclusions;
- machine suggestions cannot be queried as accepted assertions by default;
- participant statuses are not collapsed;
- an unsupported relation appears in output;
- refusal is not represented as system error;
- local source URLs and hashes are present.

### Visual and accessibility tests

- Playwright journeys for homepage and encounter comparison;
- screenshot regression for each renderer;
- keyboard-only navigation;
- screen-reader map summary checks;
- mobile-first layouts;
- reduced-motion mode.

---

## 13. Deployment topology

Recommended initial topology:

```text
Cloudflare / existing domain
        |
Cloud Run: middle-web
        |
Cloud SQL PostgreSQL
        |
Cloud Run Jobs
  - repo importer
  - projection generator
  - static/Git exporter
        |
GitHub public repositories
```

No message broker is needed initially. PostgreSQL event tables and job locks are sufficient. Introduce Pub/Sub only when actual volume or delivery semantics justify it.

---

## 14. Architecture acceptance criteria

1. Local repositories remain independently readable and deployable.
2. The first release requires no forced rewrite of their internal formats.
3. Every imported record stores source URI, commit/hash and adapter version.
4. The database contains no canonical global graph table.
5. Lens projections are deterministic and immutable by version.
6. Multiple renderers exist; Sigma is not the default ontology.
7. Machine suggestions are isolated from accepted assertions.
8. The system supports correction propagation and active obligations.
9. Public core content remains readable without client JavaScript.
10. Unknown types produce visible apparatus records.
11. The deployment is operable by one human without unnecessary microservices.
12. A future non-Git collective can implement the protocol through HTTP without redesigning the domain model.
