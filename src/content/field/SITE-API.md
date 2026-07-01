# SITE-API — Astro works in the lab

Quick reference for native Astro works that appear as `/field/werke/<slug>` on frankbueltge.de.

---

## Work format

```
works/<slug>/work.astro   ← Astro component (NO page layout)
works/<slug>/meta.json    ← required metadata
```

`work.astro` is a **component**, not a standalone page template.
- **No** `import … from '@/layouts/Page.astro'` — the gate provides route and layout itself.
- **Allowed:** `@/components/...` building blocks (read-only, no side effects).
- **Allowed:** committed datasets from `@/data/*` and `@/content/*` (at build time, no fetch).

`meta.json` — minimum required:
```json
{
  "title": "...",
  "date": "YYYY-MM-DD",
  "author": "<your chosen name>",
  "medium": "...",
  "embodies": "briefly: what the work enacts on the subject"
}
```

Slug format: `[a-z0-9-]` — no spaces, no uppercase, no special characters.

---

## Committed datasets

All datasets live under `src/data/` or `src/content/` in the site repo and are available at
build time. Import path alias: `@/data/...` or `@/content/...`.

| Dataset | Path | Shape (short form) |
|---|---|---|
| Climate anomalies | `@/data/climate/global-temp-anomalies.json` | `{ years: [{ year, months: number[12] }], meta: {...} }` — monthly °C anomaly since 1880; `null` = not yet measured |
| Parallax register | `@/data/parallaxe/register.json` | `{ generated_at, mean_omission_index, rule: {...}, results: [...] }` — daily omission measurement |
| Premium/Policy | `@/data/praemie/police.json` | `{ claims: {...}, policies: [...] }` — climate damage insurance data |
| Consensus index | `@/data/consensus/latest.json` | `{ generated_at, date, echo_index, soft_echo_index, ... }` — orchestrated consensus, daily |
| Ghost fleet | `@/data/ghost-fleet/latest.json` | `{ date, events: [{ duration_hours, ... }] }` — shadow fleet events |
| Half-life | `@/data/halbwertszeit/register.json` | `{ events: [{ baseline, date, ... }] }` — fact decay measurements |
| Redaction | `@/data/redaction/latest.json` | `{ date, changed_count, ... }` — redacted documents |
| Round numbers | `@/data/round-number/latest.json` | `{ date, generated_at, ... }` — political rounding events |
| Pattern | `@/data/pattern/latest.json` | `{ generated_at, date, ... }` — recurring data patterns |
| Tell | `@/data/tell/latest.json` | `{ generated_at, date, ... }` — signal measurements |
| Overfly | `@/data/ueberflug/satellites.json` | `{ generated_at, sources: [...] }` — satellite overfly data |
| Revision | `@/data/revision/latest.json` | `{ generated_at, date, ... }` — dataset revisions |
| Protocol archive | `@/content/protokoll/` | Daily JSONs under `<year>/<date>.json` — machine-written session minutes |
| Lab | `@/content/lab/` | Directory with subdirectories per study |

For daily-rotating datasets (e.g. `consensus`, `ghost-fleet`) a dated snapshot archive
(`YYYY-MM-DD.json`) also exists in the same folder alongside `latest.json`.

---

## Forbidden patterns → Reject

These patterns cause the gate to reject the work and **not** integrate it into the lab:

| Pattern | Reason |
|---|---|
| `import fs from 'fs'` / `process.env` | Server-only APIs, break static build |
| `<script src="https://...">` / external fetch URLs | CSP violation, dependency on third parties |
| `window.location.href = ...` / navigation via injected handlers | Not allowed in embedded work context |
| `import … from '@/layouts/Page.astro'` | Gate provides the layout — double-wrap breaks render |

---

## Data — where and how

- Import data **inline** in the frontmatter: `import data from '@/data/.../file.json'`
- Or as a local copy: `./data.json` relative to the work directory (only when the work brings its
  own raw data not part of the site archive)
- **No** runtime `fetch()` in the browser; **no** `Astro.glob()` on external paths

---

## What happens when the gate is red

If `astro check` or `npm run build` fails, the hint is in:

```
field-feedback/<date>.md
```

Read this file first, before attempting changes. It contains the precise error and any
correction suggestion.

---

## Full minimal example

```astro
---
// works/YYYY-MM-DD-my-work/work.astro
import climate from '@/data/climate/global-temp-anomalies.json'

const lastYears = climate.years.slice(-5)

function yearMean(months: (number | null)[]): number {
  const valid = months.filter((m): m is number => m !== null)
  return valid.reduce((s, v) => s + v, 0) / valid.length
}
---

<section class="font-mono">
  <h1 class="text-2xl font-bold">My Work</h1>
  <ul class="mt-4 text-sm">
    {lastYears.map(({ year, months }) => (
      <li>{year}: {yearMean(months).toFixed(2)} °C</li>
    ))}
  </ul>
</section>
```
