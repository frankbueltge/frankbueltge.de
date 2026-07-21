-- Joint Inquiry additive schema draft v0.1.0
-- Adapt names, UUID types and FK targets to the actual Research Core schema.

CREATE TABLE IF NOT EXISTS joint_inquiries (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  schema_version text NOT NULL,
  title text NOT NULL,
  public_summary text,
  shared_problem text NOT NULL,
  why_multiple_practices text NOT NULL,
  initiated_by_actor_id text NOT NULL,
  minimum_participants integer NOT NULL CHECK (minimum_participants >= 2),
  maximum_participants integer,
  coordination_profile text NOT NULL,
  custom_coordination_definition jsonb,
  status text NOT NULL CHECK (status IN ('PROPOSED','FORMING','ACTIVE','REVIEW','DORMANT','ARCHIVED','CANCELLED')),
  phase text,
  visibility text NOT NULL CHECK (visibility IN ('private','participants','public_record','public_exposition')),
  publication_policy text NOT NULL,
  resource_envelope jsonb NOT NULL,
  stop_conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  rights_summary text,
  affected_public_summary text,
  revision integer NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at timestamptz NOT NULL,
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS joint_inquiry_participants (
  inquiry_id text NOT NULL REFERENCES joint_inquiries(id) ON DELETE RESTRICT,
  practice_id text NOT NULL,
  responsible_actor_id text,
  procedural_role text NOT NULL DEFAULT 'participant',
  status text NOT NULL CHECK (status IN ('INVITED','ACCEPTED','ACTIVE','WAITING','LOCAL_REVIEW','COMPLETED_LOCAL','DECLINED','WITHDRAWN','BLOCKED')),
  local_status_rationale text,
  local_project_ref text,
  latest_commitment_id text,
  last_acknowledged_event_id text,
  response_expected boolean NOT NULL DEFAULT false,
  joined_at timestamptz,
  declined_at timestamptz,
  withdrawn_at timestamptz,
  PRIMARY KEY (inquiry_id, practice_id)
);

CREATE TABLE IF NOT EXISTS joint_inquiry_commitments (
  commitment_id text NOT NULL,
  version integer NOT NULL CHECK (version >= 1),
  inquiry_id text NOT NULL REFERENCES joint_inquiries(id) ON DELETE RESTRICT,
  practice_id text NOT NULL,
  issued_by_actor_id text NOT NULL,
  local_project_ref text,
  local_question text NOT NULL,
  method_or_operation text NOT NULL,
  first_move text NOT NULL,
  admitted_input_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  conditions_and_refusals jsonb NOT NULL DEFAULT '[]'::jsonb,
  change_conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  planned_output_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  max_autonomous_moves integer NOT NULL CHECK (max_autonomous_moves >= 0),
  resource_budget jsonb NOT NULL,
  return_obligation text,
  escalation_triggers jsonb NOT NULL DEFAULT '[]'::jsonb,
  local_publication_policy text NOT NULL,
  status text NOT NULL CHECK (status IN ('DRAFT','ACTIVE','COMPLETED','WITHDRAWN','BLOCKED','SUPERSEDED')),
  source_uri text,
  issued_at timestamptz NOT NULL,
  content_hash text NOT NULL,
  supersedes_commitment_id text,
  PRIMARY KEY (commitment_id, version)
);

CREATE TABLE IF NOT EXISTS joint_inquiry_events (
  event_id text PRIMARY KEY,
  inquiry_id text NOT NULL REFERENCES joint_inquiries(id) ON DELETE RESTRICT,
  schema_version text NOT NULL,
  event_type text NOT NULL,
  issuer_practice_id text,
  issuer_actor_id text NOT NULL,
  occurred_at timestamptz NOT NULL,
  received_at timestamptz,
  payload jsonb NOT NULL,
  source_uri text,
  source_commit text,
  content_hash text NOT NULL UNIQUE,
  previous_event_hash text,
  visibility text NOT NULL CHECK (visibility IN ('private','participants','public')),
  validation_state text NOT NULL CHECK (validation_state IN ('pending','valid','invalid','quarantined')),
  corrects_event_id text REFERENCES joint_inquiry_events(event_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS joint_inquiry_encounters (
  inquiry_id text NOT NULL REFERENCES joint_inquiries(id) ON DELETE RESTRICT,
  encounter_id text NOT NULL,
  linked_by_event_id text NOT NULL REFERENCES joint_inquiry_events(event_id) ON DELETE RESTRICT,
  relation_type text NOT NULL,
  rationale text,
  PRIMARY KEY (inquiry_id, encounter_id, linked_by_event_id)
);

CREATE TABLE IF NOT EXISTS joint_inquiry_object_refs (
  inquiry_id text NOT NULL REFERENCES joint_inquiries(id) ON DELETE RESTRICT,
  local_object_ref_id text NOT NULL,
  linked_by_event_id text NOT NULL REFERENCES joint_inquiry_events(event_id) ON DELETE RESTRICT,
  relation_type text NOT NULL,
  participant_practice_id text,
  PRIMARY KEY (inquiry_id, local_object_ref_id, linked_by_event_id)
);

CREATE INDEX IF NOT EXISTS idx_joint_inquiry_events_scope_time
  ON joint_inquiry_events (inquiry_id, occurred_at, event_id);

CREATE INDEX IF NOT EXISTS idx_joint_inquiry_participants_status
  ON joint_inquiry_participants (inquiry_id, status);

CREATE INDEX IF NOT EXISTS idx_joint_inquiry_commitments_active
  ON joint_inquiry_commitments (inquiry_id, practice_id, status);
