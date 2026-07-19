# Ulysses Authorship and Disclosure Model
## Concrete operating model

## 1. Constitutional statement

> Ulysses is a situated artistic research practice created and maintained by Frank Bültge. It uses machine systems with bounded autonomy to research, propose, transform and build. The systems possess real operative agency within delegated conditions, but they do not hold legal, moral or publication responsibility. Public authorship and accountability remain human; machine contributions and infrastructural conditions remain visible.

## 2. Stable role definitions

### Responsible human author and publisher

Frank Bültge is responsible for:

- constitutional design and protocol approval;
- selection and funding of model and infrastructure;
- final project initiation where required;
- rights, privacy and legal review;
- acceptance, rejection and publication;
- corrections, withdrawal and termination;
- public representation of the practice.

This does not imply that Frank specifies every generated element or controls every result.

### Ulysses / Atelier

Ulysses is:

- the local, historically versioned practice;
- the repository and body of work;
- a set of evolving research commitments;
- a public name under which human and machine contributions are composed;
- optionally a persona in particular works.

Ulysses is not identical to any one model runtime.

### Model runtime

A model runtime may:

- research and annotate sources;
- propose problem constructions and scores;
- generate hypotheses and counterpositions;
- transform text, code, image, sound or data;
- implement bounded probes;
- identify contradictions and missing traces;
- make local choices explicitly delegated by the score.

It may not independently:

- authorise public release;
- determine rights or consent;
- certify its own novelty or event status;
- speak for affected communities;
- assume legal or moral responsibility;
- silently expand the scope of data use.

### Human collaborators

Collaborators are credited according to actual contribution. Role labels may include:

- co-conceptualisation;
- artistic contribution;
- programming;
- dataset creation;
- performance;
- research;
- verification;
- community review;
- fabrication;
- documentation.

### Providers and maintainers

Providers are not automatically credited as artistic co-authors. They are disclosed as infrastructure when their systems materially enable or constrain the work.

### Source and dataset contributors

Credit follows licence, scholarly citation, artistic relevance and ethical relation. A source author is not automatically a co-author of the derivative work. Dataset creators and annotators should be credited where known and materially relevant.

## 3. Project-level contribution record

Each project requires:

```yaml
contribution_record:
  project_id:
  public_title:
  version:

  responsible_author:
    name: Frank Bültge
    roles:

  practice:
    name: Ulysses / Atelier
    protocol_version:

  machine_contributions:
    - runtime_id:
      provider:
      model:
      run_date:
      roles:
      delegated_freedom:
      outputs_used:
      outputs_rejected:
      known_limits:

  human_contributors:
    - name:
      roles:
      consent_to_credit:

  source_and_dataset_contributors:
    - reference:
      contribution:
      licence_or_rights:

  infrastructure:
    repository:
    tools:
    providers:
    publication_system:

  final_selection_and_arrangement:
  verification:
  rights_review:
  publication_authorisation:
```

This record is factual. It should not contain inflated descriptions such as “the model imagined” unless a work explicitly stages that language.

## 4. Public credit line

Default compact form:

> **A work by Frank Bültge with Ulysses, a machine-participatory artistic research practice. Machine operations, model versions and contribution history are documented in the apparatus record.**

Alternative practice-forward form:

> **Ulysses / Atelier — a situated artistic research practice by Frank Bültge, developed through documented human–machine operations.**

The exact line may vary by work, but it must not name a model as sole author or imply that Frank’s role was incidental when it was structurally decisive.

## 5. Persona disclosure

When the Ulysses persona speaks in first person:

> “Ulysses” is the work’s constructed research voice and the name of the ongoing practice. The text was generated and edited through the machine and human contributions described in the apparatus record; it does not claim one persistent conscious model identity.

This note may be concise and placed in an expandable disclosure. It does not need to interrupt the aesthetic encounter unless persona ambiguity is itself the work’s subject.

## 6. Machine-operation disclosure levels

### Level 1 — ordinary public work

- provider and model family;
- date;
- role;
- human selection/editing statement;
- correction route.

### Level 2 — research claim or machine-behaviour work

- exact model/version where available;
- prompt/context archive hash;
- tools and retrieval sources;
- run count and selection history;
- parameter information where meaningful;
- known provider changes;
- raw traces available or access policy.

### Level 3 — reproducibility-critical work

- runnable environment;
- archived model or documented snapshot;
- exact inputs and outputs;
- dependencies and seeds;
- model substitution results;
- direct compute and resource record where possible.

## 7. Rights and consent record

```yaml
rights_and_consent:
  third_party_material:
  legal_basis_or_licence:
  personal_data:
  community_or_collective_data:
  consent_or_authority:
  training_or_fine_tuning_permission:
  derivative_use_permission:
  withdrawal_or_takedown_route:
  unresolved_legal_questions:
```

A blank field is not sufficient. Use `not_applicable`, `unknown`, `not_obtainable`, or an explanation.

## 8. Publication gate

Publication requires a human decision with these minimum checks:

```text
[ ] the work cannot be replaced by its explanatory note
[ ] claims are scoped and source-supported
[ ] machine and human roles are accurate
[ ] model/provider disclosure matches the claim
[ ] rights and consent are acceptable
[ ] affected-public review completed if triggered
[ ] resource use is proportionate or conceptually justified
[ ] the work is not published merely because the run completed
[ ] correction and withdrawal routes exist
[ ] public credit line is approved
```

No automation may tick these boxes on behalf of the responsible publisher.

## 9. Status vocabulary

```text
PROPOSAL
SCORE_APPROVED
PROBE
STUDY
WORK_CANDIDATE
PUBLISHED_WORK
ARCHIVED_STUDY
KILLED
WITHDRAWN
CORRECTED
SUPERSEDED
CONTESTED
```

A model run is not itself a project status. It is a trace inside a project.

## 10. Correction model

A correction should preserve:

- original public version;
- identified error or rights issue;
- correcting actor;
- evidence or request;
- revised version;
- whether the correction changes the work’s interpretation or status;
- whether a source or affected party requested withdrawal.

The persona may not absorb a correction into a triumphal story about fallibility. Some errors are simply failures or harms that require repair.

## 11. Minimum public apparatus panel

Every work page should offer an expandable panel:

```text
Made by
Machine operations
Sources and data
What was selected or changed by a human
Infrastructure and version
Rights and affected publics
Known limits
Corrections and contestations
```

The panel should be readable, not a raw technical dump. Machine-readable export may exist separately.

## 12. Model selection rule

The model is selected for a project role, not because “Ulysses is” that model.

A project score states:

- required capacity;
- why a particular runtime is suitable;
- whether model identity is conceptually relevant;
- whether substitution should be tested;
- what provider opacity is accepted;
- cost and resource limit.

This allows Ulysses to continue across model changes without pretending that the underlying artificial subject remains identical.
