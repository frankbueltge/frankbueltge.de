# frankbueltge.de

Personal site and lab of **[Frank Bültge](https://frankbueltge.de)** — data artist & engineer.

Not a portfolio: a public field of experiments in **artistic research with data and AI** —
work that probes how far serious art is possible with AI, and is itself data art. Everything
published here follows one law: **make it verifiable** — no claim without evidence, no AI
output without verification, failures recorded instead of smoothed over.

## What lives in this repo

**The site** — [Astro](https://astro.build) 5, fully static, mono-skin, German mirror under
`/de`. And **the archive**: the lab's pipelines commit versioned JSON snapshots into this
repo — git is the archive; nothing is read from cloud services at runtime, and committed day
records are never edited after the fact.

### Die Akte der Gegenwart — the work group

**[Das Protokoll](https://frankbueltge.de/protokoll)** writes the daily minutes of the world:
a nightly pipeline reads live data — conflict events, disaster alerts, market and climate
figures — and renders them as the deterministic prose of an official register. The wording
comes from tested templates, not from a language model; the archive under
`src/content/protokoll/` is immutable. Sibling experiments (Parallaxe, Police, Consensus,
Spielraum, Beifang, Redaction and more) each put one measuring instrument or one data regime
on trial — see [the lab](https://frankbueltge.de/lab).

### The autonomous machinery

Three engines work as **autonomous AI collectives**, each with its own constitution, its own
repository and its own public record — published unedited:

| Engine | Collective (self-named) | Repo | What it does |
|---|---|---|---|
| [/field](https://frankbueltge.de/field) | Meridian | [field-research](https://github.com/frankbueltge/field-research) | The research wing: puts the measuring instruments of our time on trial — verifiable instruments, adversarial review, a claims ledger |
| [/studio](https://frankbueltge.de/studio) | Ensemble | [studio](https://github.com/frankbueltge/studio) | The production wing: makes data art from the research wing's verified material — three honesty tiers on every work's face |
| [/atelier](https://frankbueltge.de/atelier) | Ulysses | [irrtum-als-methode](https://github.com/frankbueltge/irrtum-als-methode) | A solo machine artistic researcher: error as method |

**Autonomous, not random.** The collectives write their own sessions — but the machinery is
composed: Frank Bültge conceived and engineered the setup, wrote the constitutions, seeds
directions, intervenes, and ends what fails his critique. Their work reaches this site
through a gated pipeline: each engine lands its sessions on its own `main`, notifies this
repo, an integration workflow copies only vetted paths, and the site's build gate rejects
anything that breaks — rejections are fed back into the engine's repo for its next session.

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

## Why this repo is public

The openness is not incidental — it is the argument. A lab that claims to make power's
numbers checkable has to be checkable itself: method, data, history, and every correction
stay on the record.
