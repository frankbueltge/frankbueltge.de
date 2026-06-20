# Halbwertszeit: Zerfallskurve als Instrument — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die per-Ereignis-Sparkline vom dekorativen Beiwerk (`aria-hidden`) zum lesbaren Zerfalls-Instrument machen: den **Halbwertszeit-Punkt** auf der Kurve markieren, die Kurve **inspizierbar** machen (role/aria-label), R² weiter ausgewiesen.

**Architecture:** Reine, getestete Funktion `halflifeMarker()` in `src/lib/halbwertszeit/svg.ts` — Position des Halbwertszeit-Punkts im selben Koordinatensystem wie `sparkPath`. Server-gerendertes SVG in `HalbwertszeitPage.astro` zeichnet Vertikale + Punkt; kein Client-JS, statisch (Sprung statt Tween).

**Tech Stack:** Astro 5 (statisch), TypeScript, Tailwind v4 (Mono-Skin), Vitest.

## Global Constraints

Visualisierungs-Standard §3.6, Werke-Tier:
- **Belegt:** Kurve = Rohserie (Pageviews); der Punkt = Halbwertszeit aus dem Fit (ehrlich getrennt benannt).
- **Inspizierbar:** SVG bekommt `role="img"` + `aria-label`; der Punkt trägt `<title>` mit T½. Ersetzt das bisherige `aria-hidden="true"` (4d-Verstoß).
- **Lücke als Form:** kein Punkt, wenn nicht messbar (halflife null) oder T½ jenseits des sichtbaren 120-Tage-Fensters → `halflifeMarker` gibt `null`, kein erfundener Marker.
- **Keine Animation**, Mono-Skin (`--rgb-accent` + `currentColor`).
- **Encoding unter Test** (§7).

---

### Task 1: `halflifeMarker()` — Position des Halbwertszeit-Punkts

**Files:**
- Modify: `src/lib/halbwertszeit/svg.ts`
- Test: `src/lib/halbwertszeit/svg.test.ts`

**Interfaces:**
- Produces:
  - `interface HalflifeMarker { x: number; y: number }`
  - `halflifeMarker(series: [string, number][], peakDay: string | null, halflifeDays: number | null, peak: number, baseline: number): HalflifeMarker | null`
  - x im selben System wie `sparkPath` (Peak-Index + T½ auf der Zeitachse), y = Höhe des halben Überschusses über dem Sockel (Wurzelskala wie die Kurve).

- [ ] **Step 1: Failing tests anhängen** (`svg.test.ts`):

```ts
import { halflifeMarker } from './svg'

describe('halflifeMarker', () => {
  // Peak bei Index 1, T½ = 4 Tage → x bei Index 5; 11 Punkte → Spanne 10
  const series: [string, number][] = Array.from({ length: 11 }, (_, i) => [
    `2026-01-${String(i + 1).padStart(2, '0')}`, i === 1 ? 1000 : 100,
  ])

  it('setzt den Punkt bei Peak-Index + Halbwertszeit auf Höhe des halben Überschusses', () => {
    const m = halflifeMarker(series, '2026-01-02', 4, 1000, 0)!
    expect(m.x).toBeCloseTo(110)     // (1+4)/10 * 220
    expect(m.y).toBeCloseTo(12.13, 1) // 40 - sqrt(0.5)*38 - 1
  })

  it('gibt null ohne Halbwertszeit oder ohne auffindbaren Peak', () => {
    expect(halflifeMarker(series, '2026-01-02', null, 1000, 0)).toBeNull()
    expect(halflifeMarker(series, '2099-01-01', 4, 1000, 0)).toBeNull()
  })

  it('gibt null, wenn die Halbwertszeit jenseits des sichtbaren Fensters liegt', () => {
    expect(halflifeMarker(series, '2026-01-02', 200, 1000, 0)).toBeNull()
  })
})
```

- [ ] **Step 2: Tests laufen → FAIL**

Run: `npm run test -- src/lib/halbwertszeit/svg.test.ts`
Expected: FAIL — `halflifeMarker is not exported`.

- [ ] **Step 3: Implementieren** (an `svg.ts` anhängen):

```ts
export interface HalflifeMarker {
  x: number
  y: number
}

/** Position des Halbwertszeit-Punkts auf der Sparkline — gleiche Koordinaten wie sparkPath.
 *  x = Peak-Index + halflifeDays (Zeitachse); y = halber Überschuss über dem Sockel (Wurzelskala).
 *  null, wenn nicht messbar, Peak unauffindbar oder T½ jenseits des sichtbaren Fensters. */
export function halflifeMarker(
  series: [string, number][],
  peakDay: string | null,
  halflifeDays: number | null,
  peak: number,
  baseline: number,
): HalflifeMarker | null {
  if (halflifeDays == null || peakDay == null || peak <= 0) return null
  const peakIndex = series.findIndex(([d]) => d === peakDay)
  if (peakIndex < 0) return null
  const days = Math.min(series.length, MAX_DAYS)
  if (days < 2) return null
  const f = peakIndex + halflifeDays
  if (f > days - 1) return null
  const x = (f / (days - 1)) * SPARK_W
  const halfLevel = baseline + (peak - baseline) / 2
  const yFraction = Math.sqrt(Math.max(0, halfLevel) / peak)
  const y = SPARK_H - yFraction * (SPARK_H - 2) - 1
  return { x, y }
}
```

- [ ] **Step 4: Tests laufen → PASS**

Run: `npm run test -- src/lib/halbwertszeit/svg.test.ts`
Expected: PASS (sparkPath + attentionStrip + halflifeMarker).

- [ ] **Step 5: Commit**

```bash
git add src/lib/halbwertszeit/svg.ts src/lib/halbwertszeit/svg.test.ts
git commit -m "feat(halbwertszeit): halflifeMarker() — Halbwertszeit-Punkt auf der Kurve"
```

---

### Task 2: Kurve zum Instrument machen (`HalbwertszeitPage.astro`)

**Files:**
- Modify: `src/components/pages/HalbwertszeitPage.astro`

**Interfaces:**
- Consumes: `halflifeMarker` (Task 1); vorhandene `sparkPath`, `SPARK_W`, `SPARK_H`, `nf`, `nf2`, `txt`, `label`.

- [ ] **Step 1: Import erweitern** — die `svg`-Importzeile ersetzen:

```ts
import { SPARK_H, SPARK_W, sparkPath, STRIP_H, STRIP_W, attentionStrip, halflifeMarker } from '@/lib/halbwertszeit/svg'
```

- [ ] **Step 2: Drei bilinguale Strings** ins `txt`-Objekt (nach der `excluded`-Eigenschaft):

```ts
  curveLabel: de ? 'Zerfallskurve' : 'Decay curve',
  hwzPoint: de ? 'Halbwertszeit (Fit)' : 'Half-life (fit)',
  markNote: de
    ? 'Punkt = Halbwertszeit aus dem Fit; die Kurve ist der Rohverlauf.'
    : 'Dot = half-life from the fit; the curve is the raw course.',
```

- [ ] **Step 3: Caption unter die Register-Regel** — die `ruleNote`-Zeile

```astro
    <p class="mb-6 text-sm text-fg-faint">{txt.ruleNote}</p>
```

ersetzen durch:

```astro
    <p class="mb-1 text-sm text-fg-faint">{txt.ruleNote}</p>
    <p class="mb-6 text-sm text-fg-faint">{txt.markNote}</p>
```

- [ ] **Step 4: `events.map` auf Block-Body umstellen** — Zeile

```astro
      {events.map((e) => (
```

ersetzen durch:

```astro
      {events.map((e) => {
        const marker = halflifeMarker(e.series, e.peak_day, e.halflife_days, e.peak, e.baseline)
        return (
```

und das Map-Ende

```astro
        </li>
      ))}
```

ersetzen durch:

```astro
        </li>
        )
      })}
```

- [ ] **Step 5: Den SVG-Block ersetzen** — den bestehenden Sparkline-Block

```astro
            {e.series.length > 1 && (
              <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
                class="shrink-0" aria-hidden="true">
                <path d={sparkPath(e.series)} fill="none" stroke="rgb(var(--rgb-accent))" stroke-width="1.4" />
              </svg>
            )}
```

ersetzen durch:

```astro
            {e.series.length > 1 && (
              <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
                class="shrink-0 text-fg-faint" role="img"
                aria-label={e.status === 'gemessen'
                  ? `${txt.curveLabel}: ${txt.hwz} ${nf.format(e.halflife_days!)} ${txt.days}, R² ${nf2.format(e.r2!)}`
                  : txt.curveLabel}>
                <path d={sparkPath(e.series)} fill="none" stroke="rgb(var(--rgb-accent))" stroke-width="1.4" />
                {marker && (
                  <line x1={marker.x.toFixed(1)} y1="2" x2={marker.x.toFixed(1)} y2={SPARK_H}
                    stroke="currentColor" stroke-opacity="0.3" stroke-width="1" />
                )}
                {marker && (
                  <circle cx={marker.x.toFixed(1)} cy={marker.y.toFixed(1)} r="2.4" fill="rgb(var(--rgb-accent))">
                    <title>{txt.hwzPoint}: {nf.format(e.halflife_days!)} {txt.days}</title>
                  </circle>
                )}
              </svg>
            )}
```

- [ ] **Step 6: Typecheck**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 7: Visuell verifizieren** (Dev-Server :4322)

Run:
```bash
html=$(curl -s http://localhost:4322/halbwertszeit)
printf '%s' "$html" | grep -o '<circle' | wc -l          # > 0: Halbwertszeit-Punkte gerendert
printf '%s' "$html" | grep -o 'aria-hidden="true"' | wc -l # 0 für die Kurven (jetzt inspizierbar)
curl -s http://localhost:4322/halbwertszeit | grep -o 'Rohverlauf' | head -1   # markNote DE
curl -s http://localhost:4322/en/halbwertszeit | grep -o 'raw course' | head -1 # markNote EN
```
Expected: `<circle` > 0; markNote in DE+EN.

- [ ] **Step 8: Commit**

```bash
git add src/components/pages/HalbwertszeitPage.astro
git commit -m "feat(halbwertszeit): Zerfallskurve als Instrument — T½-Punkt markiert, Kurve inspizierbar"
```

---

### Task 3: Methodenblatt ergänzen

**Files:**
- Modify: `src/components/pages/MethodenblattHalbwertszeit.astro`

- [ ] **Step 1: `s3body` um die Kurven-Lesart ergänzen** — an beide Sprachfassungen anhängen (nach dem in der vorherigen Iteration ergänzten Achsen-Satz).

DE:
```
 Auf der Zerfallskurve markiert der Punkt die Halbwertszeit aus dem Fit; die Kurve selbst ist der Rohverlauf — der Abstand zwischen beiden ist die Fit-Güte (R²).
```

EN:
```
 On the decay curve the dot marks the half-life from the fit; the curve itself is the raw course — the distance between the two is the goodness of fit (R²).
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/MethodenblattHalbwertszeit.astro
git commit -m "docs(halbwertszeit): Methodenblatt — Lesart der Zerfallskurve (Punkt = Fit-T½)"
```

---

## Self-Review

- **Standard-Abdeckung:** Mandat (Zerfall als Instrument sichtbar) ✓ Task 2; 4d inspizierbar ✓ (role/aria-label/title ersetzt aria-hidden); Lücke als Form ✓ (`null`-Marker statt erfunden); §7 Encoding-Test ✓ Task 1; §6 Methodenblatt ✓ Task 3.
- **Platzhalter:** keine.
- **Typkonsistenz:** `halflifeMarker`/`HalflifeMarker` in Task 1 definiert, in Task 2 konsumiert; `MAX_DAYS`/`SPARK_W`/`SPARK_H` modul-intern geteilt mit `sparkPath`.
