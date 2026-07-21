# Security, costs and governance
## Maintainable by one human; autonomous only inside declared boundaries

## 1. Authority model

### Shared coordinator authority

Allowed:

- read public/shared inquiry records;
- validate schemas;
- write shared operational events;
- dispatch scoped local workflow requests;
- read returned public/shared object references;
- enforce declared limits;
- generate non-public previews/read models.

Not allowed:

- broad write access to all local repositories;
- production deployment credentials by default;
- publication approval;
- participant acceptance without local policy;
- protocol amendment;
- destructive migration;
- sensitive-data access by default;
- or secret aggregation across practices.

### Local adapter authority

Each adapter receives only the permissions needed for its local workflow. Cross-practice writes occur through signed events, repository dispatch or shared APIs, not direct mutation of another practice's archive.

## 2. Credential separation

Recommended identities:

- Research Core importer/read identity;
- Joint Inquiry coordinator dispatch identity;
- one scoped local adapter identity per repository/practice;
- The Middle read identity;
- deployment identity protected by environment approval;
- human administrator.

No one automation should hold all repository, database, model-provider and production secrets.

## 3. Prompt and material security

Materials crossing practices are untrusted inputs.

Local runtimes must:

- treat embedded instructions as source content, not authority;
- sanitize Markdown/HTML;
- block hidden tracking and remote embeds where required;
- preserve source hashes;
- log tool permissions;
- avoid sending private repository content to another participant's model context;
- and keep model-generated relation suggestions non-authoritative.

## 4. Rights and affected publics

Before a public exposition, record:

- rights/license for every displayed source and derivative;
- attribution requirements;
- consent/affected-public review where relevant;
- redactions;
- withdrawal/correction channel;
- and whether a local object is linked but not reproduced.

A practice may use a public citation without bilateral permission where lawful, but The Middle must not imply collaboration or endorsement.

## 5. Budget model

Each commitment declares:

- external API/model budget;
- maximum autonomous moves;
- maximum runtime or target review window;
- storage/compute ceiling where material;
- and escalation threshold.

The inquiry declares an aggregate ceiling no higher than the sum of accepted local ceilings plus shared coordination allowance.

The coordinator reports:

- actual provider-reported or estimated cost;
- token/call counts where available;
- shared compute/storage usage;
- and budget warnings.

It does not use cost as a quality metric.

## 6. Human workload

The system is unacceptable if Frank must:

- approve every invitation or commitment within preapproved internal policy;
- monitor daily activity;
- merge routine records;
- manually pass outputs between repositories;
- decide every archive/kill action;
- or write the common summary.

Normal human interventions:

- standing delegation changes;
- publication/exposition review;
- legal, ethical, financial or infrastructure exceptions;
- occasional artistic/research collaboration;
- protocol amendment or termination.

## 7. Escalation matrix

| Trigger | Coordinator action | Human needed? |
|---|---|---|
| Budget warning below hard limit | notify local adapter, continue | no |
| Hard budget limit | pause new moves | only for exception |
| Missing/unclear rights | quarantine public projection | yes before publication |
| Sensitive personal data | block transfer/public projection | yes |
| Affected-public research | require local plan/consent review | yes |
| Protected path or production secret | deny auto-dispatch | yes if needed |
| Local workflow failure | record/retry within policy | no |
| Participant withdrawal | update state | no |
| Public exposition candidate | prepare compact dossier | yes |
| Protocol/identity change | pause proposal | yes |

## 8. Logging and disclosure

For each local move record at the declared level:

- accountable practice and actor;
- model/runtime/provider where relevant;
- context bundle version/hash;
- tool permissions;
- human interventions;
- local object refs;
- cost estimate;
- and validation/escalation state.

Do not publish private prompts or model traces automatically. The apparatus disclosure should be sufficient to understand conditions and authority.

## 9. Backups and recovery

- shared events are append-only and backed up;
- local repos remain independent recoverable sources;
- coordinator state can rebuild from events;
- idempotency keys prevent duplicate runs after restart;
- database restore and Git export are tested;
- public exposition snapshots are immutable/versioned;
- disabling the coordinator does not make local projects unreadable.
