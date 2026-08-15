# The stage-moments contract — what the entrance needs from `machine-attention`

**Status: specified and live 2026-08-09.** Producer:
`machine-attention/practice/src/practice/moments.py` (collector) +
`practice/foreknown/moments.py` (the flagship's derivation), written nightly by `sentinel.yml`.
Consumer: `src/lib/attention/moments.ts` + `src/pages/machine-attention/index.astro`. Mirrored
by the `Attention integrate` workflow beside the export. Practice-side rationale:
`machine-attention/docs/2026-08-09-buehnen-ehrlichkeit-und-momente.md`.

## Why a second file beside the export

`attention-export/1` promises **never individual futures, never prose** — it tells the house
that the practice exists and what it reports, in dated scalars. The entrance at
`/machine-attention` needs the opposite: single, real, dated events a visitor can meet before
any explanation — the machine should meet a visitor as a public situation rather than as a
manifesto (Frank's review, 2026-08-09, wording private). Loosening the export to carry them would break its promise; so the practice's
admission path activates the substrate contract it had reserved on paper
(`machine-attention/docs/2026-08-08-projekt-aufnahme.md` §5: projects deliver the shared stage
**moments, not cards**). Two files, two promises.

## The file

Path in this repository: `src/data/attention/moments.json`. One object:

```json
{
  "$contract": "stage-moments/1",
  "generated_from": { "repo": "machine-attention", "commit": "b2b9ff4" },
  "practice": { "id": "machine-attention", "label": "Machine Attention" },
  "moments": [
    {
      "project": "foreknown",
      "occurred_at": "2026-08-09T14:50:39+00:00",
      "mode": "correction",
      "statement": "The machine corrected its own record — the feed had said it all along.",
      "subject": "Tropical Cyclone DOLPHIN-26",
      "enter": "/attention/future/gdacs-tc-1001297.html",
      "evidence": "foreknown/snapshots/2026-08-09/gdacs.json"
    }
  ]
}
```

### Field by field

| Field | Required | What it must be |
|---|---|---|
| `$contract` | yes | exactly `stage-moments/1`. An unknown version is refused, not guessed at — the entrance then shows its quiet state |
| `generated_from.repo` / `.commit` | yes | the producing repo and commit, so a reader can walk back |
| `practice.id` / `.label` | yes | as in the export |
| `moments[].project` | yes | slug of the producing project |
| `moments[].occurred_at` | yes | ISO UTC timestamp of the real event, from the committed record |
| `moments[].mode` | yes | the producer's own word (`revision`, `correction`, `closure`, `dissipation`, `reappearance`, `notarization`, `resolution`) — displayed, not interpreted |
| `moments[].statement` | yes | one plain English sentence a stranger can meet cold |
| `moments[].subject` | yes | what the moment is about, in the record's own words |
| `moments[].enter` | yes | a site-absolute route into the project's own depth (the ENTER level) |
| `moments[].evidence` | yes | repo-relative path of the committed record the moment derives from |

### What a moment must be — and must not

- **Real and derived.** Every moment is a deterministic function of committed records; the
  producer's tests enforce it. No moment is authored for effect.
- **Not baseline.** The founding import of a register is not a moment, and neither is anything
  that was already historical at the machine's first sight (the cold-start rule). The stage
  shows what happened **under watch**, or nothing.
- **No `valid_until`.** Freshness is the consumer's call — the entrance shows the newest moment
  with its honest age, however old. One clock, not two disagreeing.
- **Gated by admission.** Only projects with a stage claim produce moments. Extending the
  producer list is an admission decision (Dark Ocean may dock only after its E-experiment
  review of 2026-08-24; an instrument never docks — no stage claim is its definition).

## What the consumer does with it

`src/lib/attention/moments.ts` gates the contract, drops malformed rows, sorts newest first.
The entrance shows the newest moment large with one action (**Follow it →** into `enter`), up
to two earlier moments small, and a stated quiet state when the file is absent, unknown or
empty. Silence is a legal state: the page never invents activity to seem alive.
