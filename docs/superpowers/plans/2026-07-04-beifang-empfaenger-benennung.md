# Beifang: Empfänger benennen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die prominentesten Leak-Empfänger (readcube 10×, altmetric, dimensions) korrekt und quellenbelegt benennen, statt sie als „unbenannten Host / kein benannter Datenhändler" durchrutschen zu lassen — plus Kanal- und Broker/self-hosted-Kontrast sichtbar machen.

**Architecture:** Reine **Frontend-Darstellungs-Schicht** (Verfeinerung ggü. Spec §4.1). Eine kuratierte, quellenbelegte JSON-Liste (`src/data/beifang/wissenschaft-infra.json`) wird von einem TS-Lookup-Modul (`infra.ts`) über die Subdomain-Kette aufgelöst. `leakFindings()` konsultiert die Liste für alle Hosts, die die Pipeline nicht benennen konnte (`leak.firma === null`). Astro-Templates zeigen benannte Empfänger, Kategorie (kommerzieller Metrik-Broker ↔ self-hosted Analytics ↔ verlagseigen) und Kanal. **Python-Pipeline und Archiv-JSONs bleiben unberührt.**

**Tech Stack:** Astro 5, TypeScript, Vitest, Tailwind v4. Kein Python in diesem Plan.

## Global Constraints

- **Archiv-JSONs unantastbar:** `src/content/beifang/2026/2026-07-02.json` und `2026-07-03.json` werden NICHT editiert (Akzeptanzkriterium: `git diff` auf diese Pfade bleibt leer).
- **Nachprüfbarkeit:** Jede Zuordnung in der kuratierten Liste trägt eine Beleg-URL (`quelle`). Keine geratene Zuordnung. Auflösungsreihenfolge dokumentiert.
- **Tatsachen statt Wertung:** Eigentümer-Aussagen (Digital Science, Holtzbrinck) nur als belegte Tatsache mit Quelle. Wort „Verstoß" bleibt draußen.
- **Ausfälle ehrlich:** Wirklich unbenannte Hosts bleiben als solche markiert, nie als „sauber".
- **Bilingual (de/en)** durchgängig.
- Tests grün (vitest), `astro check` = 0, `npm run build` erfolgreich.

## File Structure

- **Create** `src/data/beifang/wissenschaft-infra.json` — kuratierte Liste (single source of truth).
- **Create** `src/lib/beifang/infra.ts` — Lookup: `infraFor(host)`, Typen.
- **Create** `src/lib/beifang/infra.test.ts` — Tests des Lookups.
- **Modify** `src/lib/beifang/stats.ts` — `leakFindings()` benennt unbenannte Hosts über `infraFor`; erweiterte Rückgabe.
- **Modify** `src/lib/beifang/stats.test.ts` — Tests der erweiterten Aggregation.
- **Modify** `src/components/pages/BeifangPage.astro` — Darstellung: benannte Empfänger, Kategorie, Kanal, irreführende Zeile weg.
- **Modify** `src/components/pages/MethodenblattBeifang.astro` — Abschnitt „Firmen-Zuordnung", Kanal-/Cookie-Befund, Änderungsprotokoll (de/en).

---

### Task 1: Kuratierte Liste mit belegten Quellen

**Files:**
- Create: `src/data/beifang/wissenschaft-infra.json`
- Test: `src/lib/beifang/infra.test.ts` (Schema-Teil; Lookup-Teil in Task 2)

**Interfaces:**
- Produces: JSON `{ meta: {...}, eintraege: InfraEntry[] }` mit
  `InfraEntry = { domain: string; firma: string; eigentuemer: string | null; kategorie: 'metrik-broker' | 'self-hosted-analytics' | 'verlagseigen'; quelle: string }`.

- [ ] **Step 1: Eigentümerschaft recherchieren (nur belegte Aussagen)**

Mit WebSearch/WebFetch verifizieren und je eine stabile Beleg-URL festhalten:
- `readcube.com`, `altmetric.com`, `dimensions.ai` → gehören zu **Digital Science** (Portfolio-/Brands-Seite von digital-science.com). Digital Science ist Teil der **Holtzbrinck Publishing Group**.
- **Springer Nature** ist mehrheitlich im Besitz von Holtzbrinck (Beleg: Springer-Nature-/Holtzbrinck-Quelle).
- `hiig.de` (piwik-Subdomain) → self-hosted **Matomo** des Herausgebers HIIG (Internet Policy Review). Beleg: HIIG-Datenschutz/Impressum.
- `adho.org` (umami-Subdomain) → self-hosted **Umami** der ADHO (Herausgeber DHQ). Beleg: ADHO-/DHQ-Seite.

Regel: Findet sich **keine** belastbare Quelle für eine Zuordnung, kommt der Eintrag **nicht** rein (Host bleibt ehrlich „unbenannt"). Lieber weniger Einträge als eine geratene Zuordnung.

- [ ] **Step 2: JSON schreiben**

`src/data/beifang/wissenschaft-infra.json` (Belege aus Step 1 in `quelle` einsetzen; `eigentuemer` bei self-hosted = Herausgeber/`null`):

```json
{
  "meta": {
    "beschreibung": "Kuratierte Domain→Firma-Zuordnung für Wissenschafts-Infrastruktur, die der DuckDuckGo-Tracker-Radar (Ad-Tech-fokussiert) nicht kennt. Ergänzt die TDS-Zuordnung ausschließlich für die Anzeige; jede Zeile ist quellenbelegt.",
    "gepflegt_am": "2026-07-04"
  },
  "eintraege": [
    { "domain": "readcube.com",     "firma": "ReadCube",   "eigentuemer": "Digital Science / Holtzbrinck Publishing Group", "kategorie": "metrik-broker",          "quelle": "<Beleg-URL Digital Science Portfolio>" },
    { "domain": "altmetric.com",    "firma": "Altmetric",  "eigentuemer": "Digital Science / Holtzbrinck Publishing Group", "kategorie": "metrik-broker",          "quelle": "<Beleg-URL Digital Science Portfolio>" },
    { "domain": "dimensions.ai",    "firma": "Dimensions", "eigentuemer": "Digital Science / Holtzbrinck Publishing Group", "kategorie": "metrik-broker",          "quelle": "<Beleg-URL Digital Science Portfolio>" },
    { "domain": "hiig.de",          "firma": "Matomo (self-hosted, HIIG)", "eigentuemer": null, "kategorie": "self-hosted-analytics", "quelle": "<Beleg-URL HIIG Datenschutz>" },
    { "domain": "adho.org",         "firma": "Umami (self-hosted, ADHO)",  "eigentuemer": null, "kategorie": "self-hosted-analytics", "quelle": "<Beleg-URL ADHO/DHQ>" },
    { "domain": "springernature.com","firma": "Springer Nature", "eigentuemer": "Holtzbrinck Publishing Group", "kategorie": "verlagseigen", "quelle": "<Beleg-URL>" }
  ]
}
```

- [ ] **Step 3: Failing test — Liste ist valide & vollständig belegt**

`src/lib/beifang/infra.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import infra from '../../data/beifang/wissenschaft-infra.json'

describe('wissenschaft-infra.json', () => {
  it('hat Einträge, jeder mit Pflichtfeldern und einer Quelle', () => {
    expect(infra.eintraege.length).toBeGreaterThan(0)
    const kats = new Set(['metrik-broker', 'self-hosted-analytics', 'verlagseigen'])
    for (const e of infra.eintraege) {
      expect(e.domain).toMatch(/^[a-z0-9.-]+\.[a-z]{2,}$/)
      expect(e.firma.length).toBeGreaterThan(0)
      expect(kats.has(e.kategorie)).toBe(true)
      expect(e.quelle.startsWith('http')).toBe(true) // belegt, kein Platzhalter
    }
  })
  it('hat keine doppelten Domains', () => {
    const ds = infra.eintraege.map((e) => e.domain)
    expect(new Set(ds).size).toBe(ds.length)
  })
})
```

- [ ] **Step 4: Run — muss zunächst scheitern, wenn `<Beleg-URL>`-Platzhalter drin sind**

Run: `npm run test -- infra.test.ts`
Expected: FAIL bei `quelle.startsWith('http')`, solange Platzhalter nicht durch echte URLs ersetzt sind. Nach Einsetzen der recherchierten URLs (Step 1/2): PASS. Das erzwingt echte Belege.

- [ ] **Step 5: Commit**

```bash
git add src/data/beifang/wissenschaft-infra.json src/lib/beifang/infra.test.ts
git commit -m "feat(beifang): kuratierte, quellenbelegte Wissenschafts-Infra-Firmenliste"
```

---

### Task 2: `infra.ts` — Host→Firma-Lookup über die Subdomain-Kette

**Files:**
- Create: `src/lib/beifang/infra.ts`
- Test: `src/lib/beifang/infra.test.ts` (erweitern)

**Interfaces:**
- Consumes: `src/data/beifang/wissenschaft-infra.json` (Task 1).
- Produces:
  - `export interface InfraEntry { domain: string; firma: string; eigentuemer: string | null; kategorie: 'metrik-broker' | 'self-hosted-analytics' | 'verlagseigen'; quelle: string }`
  - `export function infraFor(host: string): InfraEntry | null` — läuft die Subdomain-Kette hoch (`sub.a.example.com → a.example.com → example.com`), erste passende `domain` gewinnt; sonst `null`.
  - `export const INFRA_ENTRIES: InfraEntry[]`

- [ ] **Step 1: Failing test — Lookup**

In `src/lib/beifang/infra.test.ts` ergänzen:

```ts
import { infraFor } from './infra'

describe('infraFor', () => {
  it('löst Subdomain auf die kuratierte Domain auf', () => {
    expect(infraFor('content.readcube.com')?.firma).toBe('ReadCube')
    expect(infraFor('api.altmetric.com')?.kategorie).toBe('metrik-broker')
    expect(infraFor('metrics-api.dimensions.ai')?.eigentuemer).toContain('Digital Science')
  })
  it('erkennt self-hosted Analytics', () => {
    expect(infraFor('piwik.hiig.de')?.kategorie).toBe('self-hosted-analytics')
    expect(infraFor('umami.adho.org')?.kategorie).toBe('self-hosted-analytics')
  })
  it('gibt null für unbekannte Hosts (nicht raten)', () => {
    expect(infraFor('www.google-analytics.com')).toBeNull()
    expect(infraFor('example.org')).toBeNull()
  })
})
```

- [ ] **Step 2: Run — verify fail**

Run: `npm run test -- infra.test.ts`
Expected: FAIL („infraFor is not a function" / Modul fehlt).

- [ ] **Step 3: Implementieren**

`src/lib/beifang/infra.ts`:

```ts
/** Kuratierte Zuordnung Wissenschafts-Infrastruktur → Firma, quellenbelegt.
 *  Ausschließlich Anzeige-Schicht: ergänzt Hosts, die der TDS-Tracker-Radar nicht kennt
 *  (readcube/altmetric/dimensions …). Auflösungsreihenfolge im Frontend: erst leak.firma
 *  aus der Pipeline (TDS), dann diese Liste. Archiv-JSONs bleiben unberührt. */
import data from '../../data/beifang/wissenschaft-infra.json'

export interface InfraEntry {
  domain: string
  firma: string
  eigentuemer: string | null
  kategorie: 'metrik-broker' | 'self-hosted-analytics' | 'verlagseigen'
  quelle: string
}

export const INFRA_ENTRIES: InfraEntry[] = data.eintraege as InfraEntry[]

const BY_DOMAIN = new Map<string, InfraEntry>(INFRA_ENTRIES.map((e) => [e.domain.toLowerCase(), e]))

/** sub.a.example.com → [sub.a.example.com, a.example.com, example.com]; erste Fundstelle gewinnt. */
export function infraFor(host: string): InfraEntry | null {
  const parts = host.toLowerCase().split('.')
  for (let i = 0; i < parts.length - 1; i++) {
    const cand = parts.slice(i).join('.')
    const hit = BY_DOMAIN.get(cand)
    if (hit) return hit
  }
  return null
}
```

- [ ] **Step 4: Run — verify pass**

Run: `npm run test -- infra.test.ts`
Expected: PASS (alle infra-Tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/beifang/infra.ts src/lib/beifang/infra.test.ts
git commit -m "feat(beifang): infraFor() — Host→Firma-Lookup über Subdomain-Kette"
```

---

### Task 3: `leakFindings()` benennt unbenannte Hosts

**Files:**
- Modify: `src/lib/beifang/stats.ts:116-137` (`leakFindings`)
- Test: `src/lib/beifang/stats.test.ts`

**Interfaces:**
- Consumes: `infraFor`, `InfraEntry` (Task 2); `BeifangLeak`, `BeifangRun` (types.ts).
- Produces (ersetzt die bisherige `{ firmen, hosts }`-Rückgabe):
  ```ts
  export interface LeakReceiver { name: string; kategorie: 'metrik-broker' | 'self-hosted-analytics' | 'verlagseigen' | 'tracker'; eigentuemer: string | null }
  export function leakFindings(run: BeifangRun): { publisher: string; group: 'verlag' | 'kontrolle'; hard: BeifangLeak[]; empfaenger: LeakReceiver[]; hosts: string[] }[]
  ```
  Regeln: pro hartem DOI-Leak — hat `l.firma` (TDS) → `LeakReceiver{name:l.firma, kategorie:'tracker', eigentuemer:null}`; sonst `infraFor(l.host)` → `LeakReceiver{name:e.firma, kategorie:e.kategorie, eigentuemer:e.eigentuemer}`; sonst → `hosts` (ehrlich unbenannt). `empfaenger` dedupliziert nach `name`, stabil sortiert. `doiLeakEntities()` weiter auf Namen der `empfaenger`.

- [ ] **Step 1: Failing tests — Benennung + ehrliche Restmenge**

In `src/lib/beifang/stats.test.ts` ergänzen (Fixture-Helfer im Stil der bestehenden Tests; `leak(host, firma)` baut einen harten DOI-Leak):

```ts
import { leakFindings } from './stats'
import type { BeifangRun, BeifangSiteResult } from './types'

const hardLeak = (host: string, firma: string | null) =>
  ({ token: 'doi', signal: 'hard', form: 'klartext', kanal: 'query', host, firma, beweis: 'x' })

const site = (over: Partial<BeifangSiteResult>): BeifangSiteResult => ({
  panel_id: 'p', url: 'u', final_url: null, final_domain: null, group: 'verlag', publisher: 'springer-nature',
  http_status: 200, blocked: null, note: null, requests_total: 1, third_party_hosts: 1, third_party_requests: 1,
  third_party_bytes: 1, tracker_hosts: [], entities: [], cookies_first_party: 0, cookies_third_party: 0,
  retrieved_at: 't', leaks: [], leak_firmen: [], doi_leak: false, ...over,
})

const run = (results: BeifangSiteResult[]): BeifangRun => ({
  date: '2026-07-03', generated_at: 't', schema_version: '1', pipeline_version: 'x', panel_version: 'x',
  runner: 'x', lists: {}, vantages: { us: { status: 'ok', note: null, results } }, befund: { kind: 'baseline', params: {} },
})

describe('leakFindings — Empfänger-Benennung', () => {
  it('benennt readcube über die kuratierte Liste als ReadCube (metrik-broker)', () => {
    const f = leakFindings(run([site({ leaks: [hardLeak('content.readcube.com', null)], doi_leak: true })])) [0]
    const rc = f.empfaenger.find((e) => e.name === 'ReadCube')
    expect(rc?.kategorie).toBe('metrik-broker')
    expect(f.hosts).not.toContain('content.readcube.com')
  })
  it('behält TDS-benannte Firmen als tracker', () => {
    const f = leakFindings(run([site({ leaks: [hardLeak('x.google-analytics.com', 'Google Analytics (Google)')], doi_leak: true })])) [0]
    expect(f.empfaenger.find((e) => e.name === 'Google Analytics (Google)')?.kategorie).toBe('tracker')
  })
  it('lässt wirklich unbekannte Hosts ehrlich in hosts', () => {
    const f = leakFindings(run([site({ leaks: [hardLeak('tracker.example.org', null)], doi_leak: true })])) [0]
    expect(f.hosts).toContain('tracker.example.org')
    expect(f.empfaenger).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run — verify fail**

Run: `npm run test -- stats.test.ts`
Expected: FAIL (Rückgabe hat noch `firmen`, kein `empfaenger`; Property-Zugriffe schlagen fehl).

- [ ] **Step 3: `leakFindings` neu implementieren**

Ersetze `leakFindings` (stats.ts:118-137). Import oben ergänzen: `import { infraFor } from './infra'`.

```ts
export interface LeakReceiver {
  name: string
  kategorie: 'metrik-broker' | 'self-hosted-analytics' | 'verlagseigen' | 'tracker'
  eigentuemer: string | null
}

export function leakFindings(run: BeifangRun): { publisher: string; group: 'verlag' | 'kontrolle'; hard: BeifangLeak[]; empfaenger: LeakReceiver[]; hosts: string[] }[] {
  const byPub = new Map<string, { group: 'verlag' | 'kontrolle'; hard: BeifangLeak[]; empfaenger: Map<string, LeakReceiver>; hosts: Set<string> }>()
  for (const r of usResults(run)) {
    if (!r.leaks) continue
    const hard = r.leaks.filter((l) => l.signal === 'hard' && l.token === 'doi')
    if (hard.length === 0) continue
    const row = byPub.get(r.publisher) ?? { group: r.group, hard: [], empfaenger: new Map<string, LeakReceiver>(), hosts: new Set<string>() }
    row.hard.push(...hard)
    for (const l of hard) {
      if (l.firma) {
        row.empfaenger.set(l.firma, { name: l.firma, kategorie: 'tracker', eigentuemer: null })
      } else {
        const e = infraFor(l.host)
        if (e) row.empfaenger.set(e.firma, { name: e.firma, kategorie: e.kategorie, eigentuemer: e.eigentuemer })
        else row.hosts.add(l.host)
      }
    }
    byPub.set(r.publisher, row)
  }
  return [...byPub.entries()]
    .map(([publisher, v]) => ({
      publisher, group: v.group, hard: v.hard,
      empfaenger: [...v.empfaenger.values()].sort((a, b) => a.name.localeCompare(b.name)),
      hosts: [...v.hosts].sort(),
    }))
    .sort((a, b) => Number(a.group === 'kontrolle') - Number(b.group === 'kontrolle')
      || b.hard.length - a.hard.length || a.publisher.localeCompare(b.publisher))
}
```

Passe `doiLeakEntities` (stats.ts:139-143) an: `for (const name of f.empfaenger.map((e) => e.name)) firmen.add(name)`.

- [ ] **Step 4: Run — verify pass (inkl. Rückwärtskompat gegen reales Archiv)**

Run: `npm run test -- stats.test.ts`
Expected: PASS. Bestehende `leakFindings`-Tests, die `firmen`/`hosts` referenzieren, auf `empfaenger` umstellen (readcube/altmetric erscheinen jetzt in `empfaenger`, nicht mehr in `hosts`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/beifang/stats.ts src/lib/beifang/stats.test.ts
git commit -m "feat(beifang): leakFindings() benennt unbenannte Hosts über kuratierte Liste"
```

---

### Task 4: Darstellung in `BeifangPage.astro`

**Files:**
- Modify: `src/components/pages/BeifangPage.astro:139-211` (Leak-Sektion, insbes. 177-181)

**Interfaces:**
- Consumes: neue `leakFindings()`-Rückgabe mit `empfaenger: LeakReceiver[]` + `hosts: string[]` (Task 3).

- [ ] **Step 1: Datei-Sektion lesen und Copy-Zweige umbauen**

Lies `BeifangPage.astro:139-211`. Ersetze die firmen/hosts-Zweige (177-181) durch eine Darstellung über `f.empfaenger` (benannt, mit Kategorie) und `f.hosts` (ehrlich unbenannt). Zielformulierungen (bilingual — `lang === 'de'`):

Benannte Empfänger (mind. einer):
- de: `— in dieser Messung trug ein ausgehender Request im Query-String die DOI an ${namen} (vor jeder Cookie-Einwilligung).`
- en: `— in this measurement an outgoing request carried the DOI in its query string to ${namen} (before any cookie consent).`
wobei `namen` = `f.empfaenger.map(e => e.name).join(', ')`.

Kategorie-Nebenzeile (nur wenn vorhanden), belegt/tatsächlich, keine Wertung:
- metrik-broker mit Eigentümer: de `${name} ist ein kommerzieller Metrik-Dienst (${eigentuemer}).` / en `${name} is a commercial metrics service (${eigentuemer}).`
- self-hosted-analytics: de `${name} ist eine vom Herausgeber selbst betriebene, quelloffene Analyse-Software.` / en `${name} is open-source analytics run by the publisher itself.`
- verlagseigen: de `${name} ist eine verlagseigene Domain (andere Second-Level-Domain).` / en `${name} is a publisher-owned domain (different second-level domain).`

Restliche wirklich unbenannte Hosts (nur wenn `f.hosts.length > 0`):
- de: `Weitere Empfänger ohne benannte Firma: ${f.hosts.join(', ')}.`
- en: `Further recipients without a named company: ${f.hosts.join(', ')}.`

Die alte Zeile „kein benannter Datenhändler darunter" entfällt (sie war die irreführende Aussage). Die bestehende These-Zeile („folgt dem eingebundenen Skript, nicht dem Geschäftsmodell") und die `<details>`-Beweis-Blöcke bleiben unverändert.

- [ ] **Step 2: `astro check`**

Run: `npm run check`
Expected: 0 Fehler (Typen von `empfaenger`/`hosts` stimmen).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: erfolgreich, Seitenzahl wie zuvor (~138).

- [ ] **Step 4: Visuell prüfen (Preview)**

Preview bauen/öffnen (`npm run preview`), `/beifang` und `/en/beifang`: readcube/altmetric/dimensions erscheinen als benannte Empfänger; „kein benannter Datenhändler" ist verschwunden; Kanal „im Query-String" sichtbar; self-hosted-Kontrast bei den OA-Kontrollen.

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/BeifangPage.astro
git commit -m "feat(beifang): benannte Empfänger + Kanal + Broker/self-hosted-Kontrast in der Darstellung"
```

---

### Task 5: Methodenblatt dokumentieren

**Files:**
- Modify: `src/components/pages/MethodenblattBeifang.astro` (txt-Objekt, ~Zeilen 13-73)

- [ ] **Step 1: Abschnitt „Firmen-Zuordnung" ergänzen (de/en)**

Im bestehenden `txt`-Objekt einen Abschnitt einfügen/erweitern, der die Zwei-Quellen-Zuordnung offenlegt:
- de: TDS-Tracker-Radar **plus** eine kuratierte, quellenbelegte Liste für Wissenschafts-Infrastruktur, die der Ad-Tech-fokussierte Radar nicht kennt (ReadCube, Altmetric, Dimensions = Digital Science; self-hosted Matomo/Umami der Herausgeber). Auflösungsreihenfolge: erst TDS, dann kuratierte Liste. Jede kuratierte Zuordnung ist in `src/data/beifang/wissenschaft-infra.json` mit Quelle hinterlegt. Ausschließlich Anzeige — die Archiv-JSONs bleiben unverändert.
- en: sinngemäße Übersetzung.

- [ ] **Step 2: Kanal- und Cookie-Befund ergänzen (de/en)**

Im Abschnitt „Verarbeitung / Leak-Nachweis": ergänzen, dass die DOI in der Messung vom 2026-07-03 im **Query-String aktiver API-Aufrufe** eingebundener Fremd-Skripte reiste (nicht via Referer), und dass **vor der Einwilligung kaum Third-Party-Cookies** gesetzt wurden — der Transfer lief über den Request, nicht über Cookies. Tatsachen, keine Wertung.

- [ ] **Step 3: Änderungsprotokoll-Eintrag (de/en)**

`2026-07-04 — Empfänger-Benennung: kuratierte Wissenschafts-Infrastruktur-Liste (quellenbelegt), Kanal- und Cookie-Befund ergänzt.`

- [ ] **Step 4: `astro check` + Build**

Run: `npm run check && npm run build`
Expected: 0 Fehler; Build erfolgreich.

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/MethodenblattBeifang.astro
git commit -m "docs(beifang): Methodenblatt — Firmen-Zuordnung, Kanal-/Cookie-Befund, Änderungsprotokoll (de/en)"
```

---

### Task 6: Gesamt-Verifikation

**Files:** keine Änderung — nur Prüfung.

- [ ] **Step 1: Volle Test-Suite**

Run: `npm run test`
Expected: alle grün (inkl. neuer infra/stats-Tests, bestehende Register-/Beifang-Tests).

- [ ] **Step 2: `astro check` + Build**

Run: `npm run check && npm run build`
Expected: 0 Fehler; Build erfolgreich.

- [ ] **Step 3: Archiv-Unversehrtheit belegen**

Run: `git diff --stat main -- src/content/beifang/`
Expected: **leer** (keine Änderung an Archiv-JSONs).

- [ ] **Step 4: Live-Darstellung final gegen die realen Daten prüfen**

Preview `/beifang` + `/en/beifang`: Springer→ReadCube (Digital Science) benannt; JOSS/DHQ→Altmetric/Dimensions benannt; OA-Kontrollen→self-hosted (Matomo/Umami) als Kontrast; Google Analytics weiter benannt; keine „kein benannter Datenhändler"-Fehlzeile; Beweis-`<details>` intakt; de/en vollständig.

- [ ] **Step 5: Abschluss**

Kein Commit (nur Verifikation). Danach: `superpowers:finishing-a-development-branch` → Frank fragen, ob Merge/Deploy (Guardrail: kein Merge nach main ohne Franks Go).

## Self-Review

**Spec coverage:**
- §4.1 Substanz → Task 1 (Liste) + Task 2 (Lookup) + Task 3 (Benennung). *Verfeinerung:* rein Frontend, Pipeline unberührt — im Header dokumentiert.
- §4.2 Darstellung → Task 4 (Empfänger, Kanal, Broker/self-hosted, irreführende Zeile weg).
- §4.3 Methodenblatt → Task 5 (Zuordnung, Kanal/Cookie-Befund, Änderungsprotokoll).
- §5 Tests → Tasks 1–3 (vitest) + Task 6 (volle Suite/Build). *pytest entfällt* (kein Python) — bewusste Folge der Frontend-only-Verfeinerung.
- §6 Akzeptanzkriterien → 1: Task 4/6; 2: Task 1; 3: Task 3/4; 4: Task 6 Step 3; 5: Task 6; 6: Task 4/5.
- §3 Regeln → Global Constraints, in jeder betroffenen Task referenziert.

**Placeholder scan:** Die `<Beleg-URL>`-Marker in Task 1 sind **absichtlich** und werden durch Task-1-Step-4 (Test `quelle.startsWith('http')`) erzwungenermaßen durch echte URLs ersetzt — kein stiller Platzhalter.

**Type consistency:** `LeakReceiver`/`empfaenger` konsistent zwischen Task 3 (Definition), Task 4 (Konsum) und Task 6. `infraFor`/`InfraEntry` konsistent Task 2↔3. `doiLeakEntities` auf `empfaenger` umgestellt (Task 3 Step 3).
