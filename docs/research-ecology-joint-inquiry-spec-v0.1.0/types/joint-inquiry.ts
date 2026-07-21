// Joint Inquiry protocol types v0.1.0
// Framework-neutral. Replace with generated types from JSON Schema where appropriate.

export type JointInquiryStatus =
  | "PROPOSED"
  | "FORMING"
  | "ACTIVE"
  | "REVIEW"
  | "DORMANT"
  | "ARCHIVED"
  | "CANCELLED";

export type ParticipantStatus =
  | "INVITED"
  | "ACCEPTED"
  | "ACTIVE"
  | "WAITING"
  | "LOCAL_REVIEW"
  | "COMPLETED_LOCAL"
  | "DECLINED"
  | "WITHDRAWN"
  | "BLOCKED";

export interface ActorRef {
  actor_id: string;
  actor_type: string;
  practice_id?: string | null;
}

export interface LocalObjectRef {
  practice_id: string;
  local_object_id: string;
  version: string;
  content_hash: string;
  canonical_uri?: string | null;
  local_type?: string | null;
  media_type?: string | null;
  title?: string | null;
  [key: string]: unknown;
}

export interface ResourceEnvelope {
  aggregate_external_cost_eur?: number | null;
  target_review_window_days?: number | null;
  max_first_moves_per_practice: number;
  max_return_moves_per_practice: number;
  automatic_extension: false;
  [key: string]: unknown;
}

export interface JointInquiry {
  schema_version: string;
  id: string;
  slug: string;
  title: string;
  public_summary?: string | null;
  shared_problem: string;
  why_multiple_practices: string;
  initiated_by: ActorRef;
  minimum_participants: number;
  maximum_participants?: number | null;
  invited_practice_ids?: string[];
  coordination_profile: string;
  custom_coordination_definition?: Record<string, unknown> | null;
  status: JointInquiryStatus;
  phase?: string | null;
  visibility: "private" | "participants" | "public_record" | "public_exposition";
  publication_policy: "human_only" | "none" | "local_only";
  resource_envelope: ResourceEnvelope;
  shared_material_refs?: LocalObjectRef[];
  source_encounter_refs?: string[];
  stop_conditions?: string[];
  rights_summary?: string | null;
  affected_public_summary?: string | null;
  created_at: string;
  updated_at?: string | null;
  revision: number;
  [key: string]: unknown;
}

export interface LocalCommitment {
  schema_version: string;
  commitment_id: string;
  version: number;
  inquiry_id: string;
  practice_id: string;
  issued_by: ActorRef;
  local_project_ref?: string | null;
  local_question: string;
  method_or_operation: string;
  first_move: string;
  admitted_input_refs?: LocalObjectRef[];
  conditions_and_refusals: string[];
  change_conditions: string[];
  planned_output_types?: string[];
  max_autonomous_moves: number;
  resource_budget: Record<string, unknown>;
  return_obligation?: string | null;
  escalation_triggers?: string[];
  local_publication_policy: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "WITHDRAWN" | "BLOCKED" | "SUPERSEDED";
  source_uri?: string | null;
  issued_at: string;
  content_hash: string;
  [key: string]: unknown;
}

export interface JointInquiryEvent {
  schema_version: string;
  event_id: string;
  inquiry_id: string;
  event_type: `joint_inquiry.${string}`;
  issuer: ActorRef;
  occurred_at: string;
  received_at?: string | null;
  payload: Record<string, unknown>;
  source_uri?: string | null;
  source_commit?: string | null;
  content_hash: string;
  previous_event_hash?: string | null;
  visibility: "private" | "participants" | "public";
  validation_state?: "pending" | "valid" | "invalid" | "quarantined";
  corrects_event_id?: string | null;
  [key: string]: unknown;
}

export interface LocalMoveRequest {
  request_id: string;
  inquiry: JointInquiry;
  commitment: LocalCommitment;
  move_kind: "first" | "return";
  admitted_input_refs: LocalObjectRef[];
  accepted_obligations: unknown[];
  max_cost_eur?: number;
  idempotency_key: string;
}

export interface DispatchReceipt {
  request_id: string;
  practice_id: string;
  local_run_id: string;
  status: "accepted" | "started" | "completed" | "failed" | "blocked" | "skipped";
  local_object_refs?: LocalObjectRef[];
  error_code?: string;
}

export interface JointInquiryPracticeAdapter {
  practiceId: string;
  canReceiveInvitation(input: unknown): Promise<unknown>;
  submitParticipationDecision(input: unknown): Promise<unknown>;
  validateCommitment(commitment: LocalCommitment): Promise<unknown>;
  dispatchLocalMove(request: LocalMoveRequest): Promise<DispatchReceipt>;
  resolveLocalObjects(receipt: DispatchReceipt): Promise<LocalObjectRef[]>;
  readLocalPosition(inquiryId: string): Promise<unknown | null>;
  pauseDependency(input: unknown): Promise<DispatchReceipt>;
}
