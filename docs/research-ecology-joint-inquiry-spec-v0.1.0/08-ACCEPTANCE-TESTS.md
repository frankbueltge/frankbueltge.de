# Acceptance tests
## Joint Inquiry v0.1

## A. Constitutional tests

- [ ] Joint Inquiry is represented as a temporary shared object, not a collective/practice.
- [ ] Existing local practice manifests and repositories remain sovereign.
- [ ] Encounter remains independently addressable and is not replaced by inquiry history.
- [ ] No schema requires Ulysses or Ensemble to use Meridian Claim/Evidence types.
- [ ] No permanent role is assigned to a practice.
- [ ] No global success, novelty, health or completion score exists.
- [ ] No generated consensus summary is presented as shared meaning.
- [ ] Refusal, withdrawal, dormancy and unresolved status remain valid.

## B. Schema tests

- [ ] Valid inquiry example passes JSON Schema.
- [ ] Inquiry with `minimum_participants < 2` fails.
- [ ] Active inquiry with fewer accepted participants than minimum fails activation.
- [ ] Accepted participant without active Local Commitment fails activation.
- [ ] Local modes/output types accept unknown strings.
- [ ] Invalid status enum fails.
- [ ] Local commitment revision cannot overwrite prior version silently.
- [ ] Event without issuer, timestamp, content hash or scope fails.
- [ ] Corrected event preserves original and creates a new correction record.

## C. Persistence/import tests

- [ ] File or API import is idempotent.
- [ ] Unknown valid event type is retained and visible.
- [ ] Linked Encounter remains intact if inquiry is archived.
- [ ] Linked local object retains source practice, version and hash.
- [ ] Current source status can differ from transferred version status.
- [ ] State rebuild from the event ledger is deterministic.
- [ ] Inquiry export includes participants, commitments, events, links and exclusions.

## D. Participation tests

- [ ] Invitation does not imply acceptance.
- [ ] Technical delivery does not imply acknowledgement.
- [ ] One practice can decline and publish a local reason.
- [ ] Silence is shown without inferred motive.
- [ ] Participant can accept with conditions.
- [ ] Participant can withdraw without deleting prior events.
- [ ] Inquiry can continue after withdrawal only if its declared minimum still holds.
- [ ] Participant-specific states differ without being flattened.

## E. Coordinator tests

- [ ] Coordinator activates only after all guards pass.
- [ ] Duplicate dispatch with same idempotency key produces one local run.
- [ ] Context bundle excludes another practice's private material.
- [ ] First-move limit is enforced.
- [ ] Return-move limit is enforced.
- [ ] No automatic extension occurs.
- [ ] Budget ceiling pauses future dispatches.
- [ ] Rights/safety escalation quarantines affected objects.
- [ ] Coordinator cannot author a participant commitment or position.
- [ ] Coordinator cannot create publication approval.
- [ ] Coordinator restart reconstructs state without duplicate moves.

## F. Local adapter tests

### Ulysses

- [ ] A mandate-compliant inquiry can be accepted locally without per-project human approval if standing policy allows.
- [ ] Participation creates/references a normal v4 project.
- [ ] Safe auto-land does not make the output a curated work.
- [ ] Publication candidate waits for human approval.

### Meridian

- [ ] Local ResearchScore/Claim/Evidence references remain opaque shared refs.
- [ ] Correction propagates through a real event/Encounter.
- [ ] The shared core does not copy the full MRR ontology.

### Ensemble

- [ ] Local work structure remains local.
- [ ] Ensemble can refuse an illustrative/service role.
- [ ] Work/probe can be returned as a local object reference.

## G. The Middle UI tests

- [ ] Shared problem and at least two local questions are understandable within one minute.
- [ ] Every cross-practice connector has an event or Encounter reference.
- [ ] Braided trace has a textual equivalent.
- [ ] No global graph or progress percentage exists.
- [ ] Participant positions are attributed and separable.
- [ ] Operational state includes a note that it is not a quality judgment.
- [ ] Refusal, withdrawal and no-response render intentionally.
- [ ] Local objects link to home archives.
- [ ] Apparatus, budgets and exclusions are inspectable.
- [ ] Core page content is server-rendered/readable without JS.
- [ ] Keyboard, reduced-motion and screen-reader tests pass.
- [ ] Stable JSON and citation export exist.

## H. Governance tests

- [ ] Frank is not required to approve each internal move.
- [ ] Frank is notified only for configured escalation/publication/final digest events.
- [ ] Public exposition requires human editorial approval.
- [ ] Sensitive data, rights ambiguity and affected publics block public projection.
- [ ] Coordinator credentials are narrower than local repository/deployment credentials.
- [ ] No coordinator has unrestricted production secrets.
- [ ] Audit logs identify models, automations and human interventions at the declared level.

## I. Pilot end-to-end test

- [ ] Pilot source material is real, versioned and current.
- [ ] Three local commitments validate.
- [ ] Dry run completes with mocked or disabled model calls.
- [ ] One first move per practice is recorded.
- [ ] At least one real Encounter links two local outputs.
- [ ] One return move per eligible practice is recorded or explicitly skipped/withdrawn.
- [ ] Inquiry enters REVIEW without automatic extension.
- [ ] Each practice can issue a distinct local position.
- [ ] No public work or exposition appears without approval.
- [ ] Final digest reports actual cost, runs, objects, changes, refusals and unresolved items.
