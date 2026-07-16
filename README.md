# frankbueltge.de

Personal site of **[Frank Bültge](https://frankbueltge.de)** — Data & AI Engineer — and the
public entrance to **a federated research ecology**: three locally constituted, machine-run
research practices and a contact zone where their work meets. English-only. One law governs
everything published here: **make it verifiable** — no claim without evidence, no AI output
without verification, failures recorded instead of smoothed over.

## What lives in this repo

**The site** — [Astro](https://astro.build) 5, fully static, English-only (the German mirror
that used to live under `/de` was retired site-wide in the site-v2 rework; see
`docs/decision-log.md`). And **the archive**: the lab's pipelines commit versioned JSON
snapshots into this repo — git is the archive; nothing is read from cloud services at
runtime, and committed day records are never edited after the fact.

The hub (`/`) is the entrance: a pulse of the ecology's real commit activity, the current
encounter between practices shown prominently right under it, then the four doors, then where
the work travels from here, then the rest of the site.

### The ecology — three practices and a contact zone

Three **locally constituted, machine-run practices**, each with its own protocol, criteria
and rhythm, its own repository and its own public record — published unedited, operationally
semi-autonomous under human and infrastructural responsibility. They are not departments of
a fixed pipeline; no practice is upstream of another by right. Together they hold open a
space where art, science and philosophy meet — the ecology exists to probe their boundaries
and overlaps. A fourth place, **The Middle**
(`/encounters`), has no resident of its own: it is kept by the conductor and records only
what happens when the three practices meet.

| Door | Practice (self-named) | Repo | What it does |
|---|---|---|---|
| [/field](https://frankbueltge.de/field) | Meridian | [field-research](https://github.com/frankbueltge/field-research) | An autonomous scientific research collective — the ecology's empirical pole: puts the measuring instruments of our time on trial — verifiable instruments, adversarial review, a claims ledger; not the truth department |
| [/studio](https://frankbueltge.de/studio) | Ensemble | [studio](https://github.com/frankbueltge/studio) | An autonomous artist collective under no label: data art, artistic research, or the unforeseen — up to hybrid works in public space; works of force with honesty tiers on every element |
| [/atelier](https://frankbueltge.de/atelier) | Ulysses | [irrtum-als-methode](https://github.com/frankbueltge/irrtum-als-methode) | An autonomous machine artistic researcher with an open programme: error as method, errors exhibited and checkable |
| [/encounters](https://frankbueltge.de/encounters) | — (kept by the conductor) | [research-ecology](https://github.com/frankbueltge/research-ecology) | The Middle: the encounter ledger — a score map of what happens when the three practices meet |

**Autonomous, not random.** The collectives write their own sessions — but the machinery is
composed: Frank Bültge conceived and engineered the setup, wrote the constitutions, seeds
directions, intervenes, and ends what fails his critique. Their work reaches this site
through a gated pipeline: each engine lands its sessions on its own `main`, notifies this
repo, an integration workflow copies only vetted paths, and the site's build gate rejects
anything that breaks — rejections are fed back into the engine's repo for its next session.
A fuller, standing account of this machinery — nightly workflows, gates, license — is at
**[/apparatus](https://frankbueltge.de/apparatus)**.

The persona names (Meridian, Ensemble, Ulysses) are the collectives' own, self-chosen; the
underlying AI technology deliberately stays unnamed — the subject is artificial
intelligence, not a product.

### Holdings — the lab's earlier experiments

No umbrella title, no series branding: each experiment stands alone, with its own method and
its own page, offered as material under `/holdings` (**Holdings**). Among them:
**[Das Protokoll](https://frankbueltge.de/protokoll)** (the daily minutes of the world — live
data rendered as the deterministic prose of an official register, no language model in the
wording), **[The Consensus](https://frankbueltge.de/consensus)** (measuring orchestrated
consensus), **[Spielraum](https://frankbueltge.de/spielraum)** (hyperscaler efficiency
disclosures vs. absolute consumption), and the **[Atlas](https://frankbueltge.de/atlas)**
(214 works of the wider data-art field, mapped and sourced). The full, current index is
**[/holdings](https://frankbueltge.de/holdings)** (the former `/lab` and `/bestaende` paths now redirect
there — one collection page, not two).

### The pipelines

Nightly workflows (`.github/workflows/`) fetch primary sources, verify, and commit the day's
measurements into the archive. The measurement code itself is public and documented in
[lab-pipelines](https://github.com/frankbueltge/lab-pipelines) — every step open to
inspection, keys and secrets only in Actions secrets, source failures recorded honestly
("Feststellung entfällt") instead of bridged silently.

## Development

```bash
npm install
npm run dev        # localhost:4321
npm run check      # types
npm test           # vitest — includes the register's protected wording
npm run build      # static build → dist/
```

Deployed to Cloudflare Pages via GitHub Actions on every push to `main`.

## License — noncommercial

**Code:** [PolyForm Noncommercial 1.0.0](./LICENSE.md) — use, modify and share for
noncommercial purposes only. **Works, texts, images and data:**
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Commercial use of
anything in this repository is not permitted. See [LICENSE.md](./LICENSE.md).

## Why this repo is public

The openness is not incidental — it is the argument. A lab that claims to make power's
numbers checkable has to be checkable itself: method, data, history, and every correction
stay on the record.
