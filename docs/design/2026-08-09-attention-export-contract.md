# The attention export contract — what the graph needs from `machine-attention`

**Status: specified 2026-08-09, consumer built; the producer landed the same day**
(`machine-attention/practice/src/practice/export.py`, nightly in `sentinel.yml`) — the file
is live at `src/data/attention/export.json` and the graph reads it. Since the stage-honesty
change of 2026-08-09 the figures include the epistemic split of the register
(`futures_window_open` / `futures_cold_start` / `futures_drift`) — additive keys under the
same contract. A sibling contract, `stage-moments/1`
(`2026-08-09-stage-moments-contract.md`), carries what the export deliberately excludes:
single dated events for the practice's entrance. Two files, two promises.

## Why an export at all

Machine Attention is the second constitution, and the only practice the house's knowledge graph
cannot see. Everything else is derivable because it is committed here as data: the works
register, the neighbour audit, the decision log, the post ledger, the encounter register, and
the 59 work metas of the three practices. Attention is mirrored into this repo as **rendered
HTML** (`public/attention/`, by the `Attention integrate` workflow). Parsing rendered pages back
into facts would be exactly the kind of brittle re-derivation this house refuses elsewhere: the
figure would break on a layout change, and it would claim a precision the source never gave it.

So the practice exports what it wants known, deliberately, in one small file — the same
discipline the practices already follow when they publish a work meta beside a work.

## The file

Path in this repository: `src/data/attention/export.json` (mirrored by the same workflow that
mirrors the HTML). One object:

```json
{
  "$contract": "attention-export/1",
  "generated_from": { "repo": "machine-attention", "commit": "79f8a02" },
  "practice": { "id": "machine-attention", "label": "Machine Attention" },
  "projects": [
    {
      "id": "foreknown",
      "title": "The Foreknown",
      "since": "2026-08-08",
      "site_route": "/attention",
      "status": "running"
    },
    {
      "id": "darkocean",
      "title": "Dark Ocean",
      "since": "2026-08-07",
      "site_route": null,
      "status": "running"
    }
  ],
  "figures": [
    { "key": "futures_under_watch", "value": 100, "as_of": "2026-08-09" },
    { "key": "materialized", "value": 12, "as_of": "2026-08-09" }
  ]
}
```

### Field by field

| Field | Required | What it must be |
|---|---|---|
| `$contract` | yes | exactly `attention-export/1`. A version the consumer does not know is refused, not guessed at |
| `generated_from.repo` / `.commit` | yes | the producing repo and the commit the export was made from — so a reader can walk back |
| `practice.id` / `.label` | yes | one practice; `id` is a slug, `label` is what a page would print |
| `projects[].id` | yes | slug, unique within the export |
| `projects[].title` | yes | the project's own name |
| `projects[].since` | yes | ISO date |
| `projects[].site_route` | yes, may be `null` | the route on frankbueltge.de if the project already has one (`/attention`, `/observatory`); `null` if it lives only in the practice's own repo |
| `projects[].status` | yes | the practice's own word (`running`, `parked`, …) — not interpreted here |
| `figures[]` | optional | `{ key, value, as_of }` scalars the practice wants on record. Numbers only, dated |

### What must NOT be in it

- **No individual futures, readings or snapshots.** The registry holds a hundred announced
  futures and a reading per night; those are the practice's data, not the house's relations. The
  graph records that the instrument exists and what it reports, never its rows.
- **No addresses, no personal data.** Same rule as the post office lane: the graph carries
  receivers' names, never their inboxes, and a test forbids e-mail patterns in `graph.json`.
- **No prose.** Titles and statuses, not descriptions written for a page.

## What the consumer does with it

`src/lib/graph/build.ts` (see `ATTENTION_FILE`):

- one `practice` node for `practice`, filed under the same normalisation as every other voice;
- for each project **with** a `site_route` that matches a work in `src/data/werke.ts`: a `door`
  edge from the practice to that work — the practice and its public room are one body in two
  records, exactly as for the three practices;
- for each project **without** a matching route: a `practice-work` node plus a `made-by` edge, so
  a project that lives only in the practice's repo is still visible as its production;
- `figures` are attached to the practice node, dated.

Every node and edge carries its quote from the export file, and the honesty harness checks it
like any other source. If the file is absent — which it is today — the graph simply has no
attention lane, and `graph.test.ts` says so in a test rather than leaving the gap unexplained.

## What this asks of the producing session

One file, written by the practice about itself, refreshed whenever it wants the house to see a
change. Nothing in this repository needs to be told; the nightly rebuild
(`.github/workflows/graph.yml`) picks it up.
