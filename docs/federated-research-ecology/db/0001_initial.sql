-- Federated Research Ecology / The Middle
-- Initial PostgreSQL schema. Open vocabularies remain TEXT by design.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE actors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  display_name TEXT NOT NULL,
  actor_kind TEXT NOT NULL,
  collective_id TEXT,
  public_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  private_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  can_author_assertions BOOLEAN NOT NULL DEFAULT FALSE,
  can_issue_events BOOLEAN NOT NULL DEFAULT FALSE,
  active_from TIMESTAMPTZ,
  active_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE collectives (
  id TEXT PRIMARY KEY,
  current_name TEXT NOT NULL,
  current_surface_name TEXT,
  repository_url TEXT,
  public_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  responsible_publisher_actor_id UUID REFERENCES actors(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE actors
  ADD CONSTRAINT actors_collective_fk
  FOREIGN KEY (collective_id) REFERENCES collectives(id);

CREATE TABLE collective_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collective_id TEXT NOT NULL REFERENCES collectives(id),
  version INTEGER NOT NULL,
  name TEXT NOT NULL,
  surface_name TEXT,
  description TEXT NOT NULL,
  protocol_url TEXT,
  protocol_content_hash TEXT,
  repository_url TEXT,
  public_url TEXT,
  commitments JSONB NOT NULL DEFAULT '[]'::jsonb,
  accepted_encounter_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  inbox_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  outbox_url TEXT,
  runtime_disclosure_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
  manifest_payload JSONB NOT NULL,
  issuer_actor_id UUID REFERENCES actors(id),
  source_uri TEXT NOT NULL,
  source_commit TEXT,
  content_hash TEXT NOT NULL,
  signature TEXT,
  effective_from TIMESTAMPTZ NOT NULL,
  superseded_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (collective_id, version),
  UNIQUE (collective_id, content_hash)
);

CREATE TABLE local_object_refs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collective_id TEXT NOT NULL REFERENCES collectives(id),
  local_object_id TEXT NOT NULL,
  object_version TEXT,
  canonical_uri TEXT NOT NULL,
  media_type TEXT,
  local_object_type TEXT NOT NULL,
  interoperability_class TEXT,
  title_cache TEXT,
  summary_cache TEXT,
  lifecycle_status TEXT,
  local_epistemic_status TEXT,
  content_hash TEXT NOT NULL,
  source_commit TEXT,
  source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  importer_version TEXT NOT NULL,
  validation_state TEXT NOT NULL DEFAULT 'valid',
  UNIQUE (collective_id, local_object_id, object_version, content_hash)
);

CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  editorial_proposition TEXT,
  proposition_author_actor_id UUID REFERENCES actors(id),
  initiating_event_id UUID,
  visibility TEXT NOT NULL DEFAULT 'public',
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  pin_reason TEXT,
  pinned_by_actor_id UUID REFERENCES actors(id),
  pinned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dormant_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

CREATE TABLE encounter_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  collective_id TEXT REFERENCES collectives(id),
  actor_id UUID REFERENCES actors(id),
  participant_role TEXT NOT NULL,
  local_status TEXT,
  local_status_rationale TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  last_acknowledged_event_id UUID,
  response_expected BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK (collective_id IS NOT NULL OR actor_id IS NOT NULL)
);

CREATE UNIQUE INDEX encounter_participant_collective_uq
  ON encounter_participants(encounter_id, participant_role, collective_id)
  WHERE collective_id IS NOT NULL AND actor_id IS NULL;

CREATE UNIQUE INDEX encounter_participant_actor_uq
  ON encounter_participants(encounter_id, participant_role, actor_id)
  WHERE actor_id IS NOT NULL AND collective_id IS NULL;

CREATE UNIQUE INDEX encounter_participant_collective_actor_uq
  ON encounter_participants(encounter_id, participant_role, collective_id, actor_id)
  WHERE actor_id IS NOT NULL AND collective_id IS NOT NULL;

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_event_id TEXT,
  encounter_id UUID REFERENCES encounters(id),
  event_type TEXT NOT NULL,
  issuer_collective_id TEXT REFERENCES collectives(id),
  issuer_actor_id UUID REFERENCES actors(id),
  occurred_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_uri TEXT NOT NULL,
  source_commit TEXT,
  schema_version TEXT NOT NULL,
  payload JSONB NOT NULL,
  content_hash TEXT NOT NULL,
  previous_event_hash TEXT,
  signature TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  validation_state TEXT NOT NULL DEFAULT 'valid',
  validation_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  importer_version TEXT NOT NULL,
  corrects_event_id UUID REFERENCES events(id),
  supersedes_event_id UUID REFERENCES events(id),
  UNIQUE (issuer_collective_id, external_event_id),
  UNIQUE (content_hash, source_uri)
);

ALTER TABLE encounters
  ADD CONSTRAINT encounters_initiating_event_fk
  FOREIGN KEY (initiating_event_id) REFERENCES events(id);

ALTER TABLE encounter_participants
  ADD CONSTRAINT encounter_participants_last_event_fk
  FOREIGN KEY (last_acknowledged_event_id) REFERENCES events(id);

CREATE TABLE encounter_object_refs (
  encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  local_object_ref_id UUID NOT NULL REFERENCES local_object_refs(id),
  encounter_role TEXT NOT NULL,
  introduced_by_event_id UUID REFERENCES events(id),
  PRIMARY KEY (encounter_id, local_object_ref_id, encounter_role)
);

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID UNIQUE NOT NULL REFERENCES events(id),
  encounter_id UUID NOT NULL REFERENCES encounters(id),
  source_collective_id TEXT NOT NULL REFERENCES collectives(id),
  target_collective_id TEXT REFERENCES collectives(id),
  subject_object_ref_id UUID REFERENCES local_object_refs(id),
  proposition TEXT NOT NULL,
  source_epistemic_status TEXT,
  source_lifecycle_status TEXT,
  caveats JSONB NOT NULL DEFAULT '[]'::jsonb,
  rights JSONB NOT NULL DEFAULT '{}'::jsonb,
  requested_obligations JSONB NOT NULL DEFAULT '[]'::jsonb,
  proposed_use TEXT,
  response_deadline TIMESTAMPTZ,
  delivery_state TEXT NOT NULL DEFAULT 'created',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID UNIQUE NOT NULL REFERENCES events(id),
  offer_id UUID NOT NULL REFERENCES offers(id),
  responder_collective_id TEXT NOT NULL REFERENCES collectives(id),
  admission_decision TEXT NOT NULL,
  public_rationale TEXT,
  accepted_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  rejected_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  intended_local_use TEXT,
  derivative_object_ref_id UUID REFERENCES local_object_refs(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id),
  source_event_id UUID NOT NULL REFERENCES events(id),
  proposer_collective_id TEXT REFERENCES collectives(id),
  obligated_collective_id TEXT REFERENCES collectives(id),
  clause_text TEXT NOT NULL,
  rule_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  prominence TEXT NOT NULL DEFAULT 'normal',
  accepted_by_event_id UUID REFERENCES events(id),
  evidence_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  active_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  active_until TIMESTAMPTZ,
  superseded_by UUID REFERENCES obligations(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assertions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_assertion_id TEXT,
  encounter_id UUID REFERENCES encounters(id),
  author_collective_id TEXT REFERENCES collectives(id),
  author_actor_id UUID REFERENCES actors(id),
  subject_object_ref_id UUID REFERENCES local_object_refs(id),
  predicate TEXT NOT NULL,
  object_object_ref_id UUID REFERENCES local_object_refs(id),
  object_literal JSONB,
  rationale TEXT,
  epistemic_status TEXT NOT NULL,
  local_epistemic_status TEXT,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  originating_event_id UUID REFERENCES events(id),
  source_uri TEXT,
  content_hash TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public',
  lifecycle_status TEXT NOT NULL DEFAULT 'active',
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  superseded_at TIMESTAMPTZ,
  UNIQUE (author_collective_id, external_assertion_id),
  CHECK (object_object_ref_id IS NOT NULL OR object_literal IS NOT NULL)
);

CREATE TABLE assertion_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assertion_id UUID NOT NULL REFERENCES assertions(id),
  responder_collective_id TEXT REFERENCES collectives(id),
  responder_actor_id UUID REFERENCES actors(id),
  response_type TEXT NOT NULL,
  rationale TEXT,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  originating_event_id UUID REFERENCES events(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lenses (
  id TEXT PRIMARY KEY,
  current_name TEXT NOT NULL,
  owner_collective_id TEXT REFERENCES collectives(id),
  owner_actor_id UUID REFERENCES actors(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lens_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lens_id TEXT NOT NULL REFERENCES lenses(id),
  version INTEGER NOT NULL,
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  config JSONB NOT NULL,
  declared_exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
  renderer_type TEXT NOT NULL,
  implementation_hash TEXT NOT NULL,
  authored_by_actor_id UUID REFERENCES actors(id),
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  superseded_at TIMESTAMPTZ,
  UNIQUE (lens_id, version)
);

CREATE TABLE maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id),
  slug TEXT UNIQUE NOT NULL,
  created_by_actor_id UUID REFERENCES actors(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE map_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID NOT NULL REFERENCES maps(id),
  version INTEGER NOT NULL,
  lens_version_id UUID NOT NULL REFERENCES lens_versions(id),
  event_watermark TIMESTAMPTZ NOT NULL,
  source_event_ids JSONB NOT NULL,
  included_object_ref_ids JSONB NOT NULL,
  included_assertion_ids JSONB NOT NULL,
  included_obligation_ids JSONB NOT NULL,
  projection_payload JSONB NOT NULL,
  accessible_summary TEXT NOT NULL,
  exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
  render_failures JSONB NOT NULL DEFAULT '[]'::jsonb,
  renderer_version TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (map_id, version),
  UNIQUE (content_hash)
);

CREATE TABLE machine_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID REFERENCES encounters(id),
  generated_by_actor_id UUID REFERENCES actors(id),
  suggestion_type TEXT NOT NULL,
  input_refs JSONB NOT NULL,
  suggested_payload JSONB NOT NULL,
  confidence_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  prompt_config_hash TEXT,
  review_state TEXT NOT NULL DEFAULT 'unreviewed',
  admitted_assertion_id UUID REFERENCES assertions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID REFERENCES encounters(id),
  target_object_ref_id UUID REFERENCES local_object_refs(id),
  target_assertion_id UUID REFERENCES assertions(id),
  author_actor_id UUID REFERENCES actors(id),
  identity_mode TEXT NOT NULL,
  intervention_type TEXT NOT NULL,
  title TEXT,
  rationale TEXT NOT NULL,
  payload JSONB NOT NULL,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  moderation_state TEXT NOT NULL DEFAULT 'pending',
  admission_state TEXT NOT NULL DEFAULT 'not_reviewed',
  visibility TEXT NOT NULL DEFAULT 'private_pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX events_encounter_time_idx ON events(encounter_id, occurred_at);
CREATE INDEX events_type_idx ON events(event_type);
CREATE INDEX events_payload_gin_idx ON events USING GIN(payload);
CREATE INDEX local_object_refs_collective_idx ON local_object_refs(collective_id, local_object_id);
CREATE INDEX local_object_refs_title_trgm_idx ON local_object_refs USING GIN(title_cache gin_trgm_ops);
CREATE INDEX assertions_encounter_idx ON assertions(encounter_id, lifecycle_status);
CREATE INDEX assertions_predicate_idx ON assertions(predicate);
CREATE INDEX assertions_evidence_gin_idx ON assertions USING GIN(evidence);
CREATE INDEX obligations_encounter_status_idx ON obligations(encounter_id, status);
CREATE INDEX interventions_moderation_idx ON interventions(moderation_state, submitted_at);

COMMENT ON TABLE events IS 'Append-only operational record. Meaning belongs in assertions, not event edges.';
COMMENT ON TABLE assertions IS 'Authored, contestable claims and relations. Never a canonical global graph.';
COMMENT ON TABLE machine_suggestions IS 'Unadmitted computational proposals, isolated from collective assertions.';
