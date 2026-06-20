# Halbwertszeit: „Ungleichheit der Anteilnahme" als Achse — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die im Methodenblatt bereits versprochene zweite Achse („Ungleichheit") sichtbar machen — `views_per_death` aller Ereignisse als logarithmische Strip-Achse, statt nur als Satz (max vs. min).

**Architecture:** Reine, getestete Encoding-Funktion `attentionStrip()` in `src/lib/halbwertszeit/svg.ts` (Wert → x-Position auf Log-Achse). Server-gerendertes SVG in `HalbwertszeitPage.astro` (kein Client-JS, wie der bestehende `sparkPath`). Bilinguale Labels über das vorhandene `txt`-Objekt. Methodenblatt um die Lesart ergänzt.

**Tech Stack:** Astro 5 (statisch), TypeScript, Tailwind v4 (Mono-Skin), Vitest.

## Global Constraints

Aus dem Visualisierungs-Standard (`docs/superpowers/specs/2026-06-20-visualisierungs-standard-design.md`, §3.6) — Werke-Tier (höchste Strenge):

- **Belegt:** jede Markierung = ein gemessener `views_per_death`-Wert aus `register.json`. Keine erfundenen/Demo-Punkte.
- **Ehrlich kodiert:** Log-Achse (der Spread ist faktorgroß); die Log-Skala wird ausgewiesen. Keine verzerrende Kappung.
- **Lücke als Form:** Ereignisse ohne messbare Anteilnahme (`views_per_death ≤ 0`) erscheinen nicht — ihre Zahl wird ausgewiesen, nicht still unterschlagen.
- **Inspizierbar:** jeder Strich trägt `<title>` mit Label + Rohwert; die Extreme sind an den Achsenenden beschriftet.
- **Keine Animation:** statisches SVG, Sprung statt Tween. Mono-Skin: nur `currentColor` / `--rgb-accent`, keine Verläufe/Glows.
- **Bilingual:** alle Strings DE/EN über `txt`.
- **Encoding unter Test:** `attentionStrip()` ist Pflicht-getestet (Standard §7), damit *Wert → Geometrie* nicht still driftet.

---

### Task 1: Encoding-Funktion `attentionStrip()`

**Files:**
- Modify: `src/lib/halbwertszeit/svg.ts`
- Test: `src/lib/halbwertszeit/svg.test.ts`

**Interfaces:**
- Produces:
  - `STRIP_W: number`, `STRIP_H: number` (SVG-Maße)
  - `interface StripPoint { x: number; vpd: number; label: string }`
  - `interface StripLayout { points: StripPoint[]; min: number; max: number }`
  - `attentionStrip(values: { vpd: number; label: string }[], width?: number): StripLayout`

- [ ] **Step 1: Write the failing tests** — an `svg.test.ts` anhängen (bestehende `sparkPath`-Tests bleiben):

```ts
import { attentionStrip, STRIP_W } from './svg'

describe('attentionStrip', () => {
  it('bildet log10 der Aufrufe je Opfer über die Breite ab; Extreme treffen die Enden', () => {
    const layout = attentionStrip(
      [{ vpd: 10, label: 'a' }, { vpd: 100, label: 'b' }, { vpd: 1000, label: 'c' }],
      300,
    )
    expect(layout.points).toHaveLength(3)
    expect(layout.points[0].x).toBeCloseTo(0)    // 10  → linkes Ende
    expect(layout.points[1].x).toBeCloseTo(150)  // 100 → Mitte (log-gleichmäßig)
    expect(layout.points[2].x).toBeCloseTo(300)  // 1000 → rechtes Ende
    expect(layout.min).toBeCloseTo(10)
    expect(layout.max).toBeCloseTo(1000)
  })

  it('hält jeden Punkt inspizierbar (Label + Rohwert bleiben erhalten)', () => {
    const layout = attentionStrip([{ vpd: 5, label: 'x' }, { vpd: 50, label: 'y' }], 100)
    expect(layout.points[1]).toMatchObject({ vpd: 50, label: 'y' })
  })

  it('verwirft nicht-positive Werte und braucht ≥ 2 Punkte', () => {
    // nur ein positiver Wert nach dem Filter → keine Achse
    expect(attentionStrip([{ vpd: 0, label: 'a' }, { vpd: 100, label: 'b' }], 100).points).toHaveLength(0)
    // drei gegeben, einer nicht-positiv → zwei bleiben → gültige Achse
    const ok = attentionStrip([{ vpd: 0, label: 'a' }, { vpd: 10, label: 'b' }, { vpd: 100, label: 'c' }], 100)
    expect(ok.points).toHaveLength(2)
    expect(ok.points[0].label).toBe('b')
  })

  it('benutzt STRIP_W als Standardbreite', () => {
    const layout = attentionStrip([{ vpd: 1, label: 'a' }, { vpd: 10, label: 'b' }])
    expect(layout.points[1].x).toBeCloseTo(STRIP_W)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/lib/halbwertszeit/svg.test.ts`
Expected: FAIL — `attentionStrip is not exported` / `STRIP_W is not defined`.

- [ ] **Step 3: Implement the function** — an `src/lib/halbwertszeit/svg.ts` anhängen (nach `sparkPath`):

```ts
export const STRIP_W = 320
export const STRIP_H = 44

export interface StripPoint {
  x: number
  vpd: number
  label: string
}
export interface StripLayout {
  points: StripPoint[]
  min: number
  max: number
}

/** Aufrufe je Todesopfer auf logarithmischer Achse — eine Position je Ereignis.
 *  Nicht-positive Werte (keine messbare Anteilnahme) fallen heraus; mit weniger als
 *  zwei Punkten lässt sich keine Achse aufspannen. */
export function attentionStrip(
  values: { vpd: number; label: string }[],
  width = STRIP_W,
): StripLayout {
  const positive = values.filter((d) => d.vpd > 0)
  if (positive.length < 2) return { points: [], min: 0, max: 0 }
  const logs = positive.map((d) => Math.log10(d.vpd))
  const lo = Math.min(...logs)
  const hi = Math.max(...logs)
  const span = hi - lo || 1
  const points = positive.map((d, i) => ({
    x: ((logs[i] - lo) / span) * width,
    vpd: d.vpd,
    label: d.label,
  }))
  return { points, min: 10 ** lo, max: 10 ** hi }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/lib/halbwertszeit/svg.test.ts`
Expected: PASS (alte `sparkPath`-Tests + 4 neue).

- [ ] **Step 5: Commit**

```bash
git add src/lib/halbwertszeit/svg.ts src/lib/halbwertszeit/svg.test.ts
git commit -m "feat(halbwertszeit): attentionStrip() — Log-Encoding der Ungleichheits-Achse"
```

---

### Task 2: Achse in `HalbwertszeitPage.astro` rendern (bilingual)

**Files:**
- Modify: `src/components/pages/HalbwertszeitPage.astro`

**Interfaces:**
- Consumes: `attentionStrip`, `STRIP_W`, `STRIP_H` aus Task 1; vorhandene `withAttention`, `label()`, `ni`, `txt`.

- [ ] **Step 1: Import erweitern** — Zeile 6 ersetzen:

```ts
import { SPARK_H, SPARK_W, sparkPath, STRIP_H, STRIP_W, attentionStrip } from '@/lib/halbwertszeit/svg'
```

- [ ] **Step 2: Layout berechnen** — direkt nach dem `spread`-Block (nach Zeile 34) einfügen:

```ts
const strip = attentionStrip(withAttention.map((e) => ({ vpd: e.views_per_death, label: label(e) })))
const excludedCount = events.filter((e) => e.deaths > 0 && e.views_per_death <= 0).length
```

- [ ] **Step 3: Zwei bilinguale Strings** in das `txt`-Objekt aufnehmen (vor der schließenden `}` des `txt`-Literals, nach `method:`):

```ts
  axisNote: de
    ? 'Logarithmische Achse: Aufrufe je Todesopfer, ein Strich je Ereignis.'
    : 'Logarithmic axis: views per death, one tick per event.',
  excluded: de
    ? `${ni.format(excludedCount)} Ereignisse ohne messbare Anteilnahme sind nicht abgebildet.`
    : `${ni.format(excludedCount)} events with no measurable attention are not shown.`,
```

- [ ] **Step 4: Die Ungleichheits-`section` ersetzen** — den Block `{hasSpread && ( … )}` (Zeilen 75–80) durch:

```astro
  {hasSpread && (
    <section class="mb-12 rounded-[14px] border border-line bg-panel panel-raised p-6">
      <h2 class="mb-2 font-semibold">{txt.unequalH}</h2>
      <svg viewBox={`0 0 ${STRIP_W} ${STRIP_H}`} width="100%" class="my-4 text-fg-faint"
        role="img" aria-label={txt.unequalH}>
        <line x1="0" y1={STRIP_H - 16} x2={STRIP_W} y2={STRIP_H - 16}
          stroke="currentColor" stroke-opacity="0.3" stroke-width="1" />
        {strip.points.map((p) => (
          <line x1={p.x.toFixed(1)} y1={STRIP_H - 22} x2={p.x.toFixed(1)} y2={STRIP_H - 10}
            stroke="rgb(var(--rgb-accent))" stroke-width="1.3">
            <title>{p.label}: {ni.format(p.vpd)} {txt.perDeath}</title>
          </line>
        ))}
        <text x="0" y={STRIP_H - 2} font-size="9" fill="currentColor">{ni.format(strip.min)}</text>
        <text x={STRIP_W} y={STRIP_H - 2} text-anchor="end" font-size="9" fill="currentColor">{ni.format(strip.max)}</text>
      </svg>
      <p class="mb-3 font-mono text-[11px] text-fg-faint">{txt.axisNote}</p>
      <p class="leading-relaxed text-fg-muted">{txt.unequal}</p>
      {excludedCount > 0 && <p class="mt-2 text-sm text-fg-faint">{txt.excluded}</p>}
    </section>
  )}
```

- [ ] **Step 5: Typecheck**

Run: `npm run check`
Expected: `0 errors` (Hints/Warnings unverändert zum Vorzustand).

- [ ] **Step 6: Visuell verifizieren** (Dev-Server läuft auf :4322, Hot-Reload)

Run:
```bash
curl -s http://localhost:4322/halbwertszeit | grep -c '<svg'        # ≥ 2 (Sparklines + neue Achse)
curl -s http://localhost:4322/halbwertszeit | grep -o 'Logarithmische Achse'   # Achsen-Note da
curl -s http://localhost:4322/en/halbwertszeit | grep -o 'Logarithmic axis'    # EN-Spiegel da
```
Expected: SVG-Count ≥ 2; beide Notizen gefunden.

- [ ] **Step 7: Commit**

```bash
git add src/components/pages/HalbwertszeitPage.astro
git commit -m "feat(halbwertszeit): Ungleichheits-Achse als Log-Strip statt nur Satz"
```

---

### Task 3: Lesart im Methodenblatt dokumentieren (§3.5/§6 des Standards)

**Files:**
- Modify: `src/components/pages/MethodenblattHalbwertszeit.astro`

- [ ] **Step 1: `s3body` um die Kodierung ergänzen** — an beide Sprachfassungen je einen Satz anhängen.

DE (`s3body`, am Satzende vor dem schließenden `'`):

```
 Die Ungleichheits-Achse trägt die Aufrufe je Todesopfer logarithmisch auf — ein Strich je Ereignis, die Extreme beschriftet; Ereignisse ohne messbare Anteilnahme erscheinen nicht und werden gezählt ausgewiesen.
```

EN (`s3body`):

```
 The inequality axis plots views per death logarithmically — one tick per event, the extremes labelled; events with no measurable attention do not appear and are reported as a count.
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/MethodenblattHalbwertszeit.astro
git commit -m "docs(halbwertszeit): Methodenblatt — Lesart der Ungleichheits-Achse"
```

---

## Folgearbeiten (eigene Pläne, NICHT Teil dieses Plans)

- **Halbwertszeit Zerfallskurve** vom Sparkline-Beiwerk zum lesbaren Instrument (Halbwertszeit-Punkt markiert, R² ausgewiesen).
- **Parallaxe** Verschweigen-Matrix (18 Themen × Claims × 12 Sprachen) — Daten vorhanden.
- **Prämie** & **Protokoll** bleiben vertagt (Prämie: keine Jahres-Serie im Register; Protokoll: nur ~4 Tage Archiv).

## Self-Review

- **Spec-Abdeckung:** Standard-Mandat (Relation sichtbar) ✓ Task 2; Schranke (a)–(e) ✓ Global Constraints + `<title>`/Log-Note/excluded-Zähler; §7 Encoding-Test ✓ Task 1; §6 Methodenblatt ✓ Task 3.
- **Platzhalter:** keine — jeder Code-Step trägt vollständigen Code/Strings.
- **Typkonsistenz:** `attentionStrip`/`StripLayout`/`StripPoint`/`STRIP_W`/`STRIP_H` identisch in Task 1 (Definition) und Task 2 (Konsum).
