# Integritäts-Sprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alle bekannten Diskrepanzen zwischen öffentlicher Selbstbeschreibung und Realität beheben (Spec: `docs/superpowers/specs/2026-07-02-integritaets-sprint-design.md`) — keine neuen Features.

**Architecture:** Reine Reparatur-Arbeit in drei Schichten: (1) Copy/Config-Fixes im Astro-Frontend (Methodenblätter, Umbenennungen, Waisen-Rubrik), (2) zwei kleine Pipeline-Erweiterungen in `pipelines/protokoll` (Parallaxe-Ausfallzensus, Trend-Verdrahtung Meereis/Ozean), (3) Entfernen toter Artefakte. Git bleibt das Archiv; committete Tages-JSONs werden nie angefasst.

**Tech Stack:** Astro 5 + TypeScript (Vitest), Python 3.12 (pytest, httpx MockTransport), GitHub Actions.

## Global Constraints

- **Branch:** Arbeit auf dem aktuellen Branch `beifang` (dort liegen Spec + Plan). **Kein Merge nach `main`, kein Deploy ohne Franks ausdrückliches Go** (Standing Rule).
- **Unantastbar:** Archiv-JSONs (`src/content/protokoll/**`, datierte JSONs unter `src/data/*/`), die Register-Template-Strings des Protokolls (`src/lib/protokoll/render.ts` + `render.test.ts`), laufende Nightly-Workflows gesunder Instrumente.
- **Engines & Beifang unangetastet (Frank, 2026-07-02):** nichts ändern unter `src/content/field/`, `src/content/atelier/`, `src/components/field/`, `src/components/atelier/`, `pipelines/beifang/`, `pipelines/irrtum/`.
- **Zweisprachigkeit:** jede sichtbare Copy DE **und** EN.
- **Keine erfundenen Zahlen:** Methodenblatt-Copy nennt nur belegte Fakten; wo keine Messung vorliegt, keine Zahl.
- **Neue Titel (verbatim, wie in `src/data/werke.ts`):** tell → `Delve into the intricate realm` · redaction → `Editorial Deadline` · round-number → `Round Numbers`.
- **Testkommandos:** Site: `npm run check && npm run test && npm run build` (im Repo-Root). Pipeline: `cd pipelines/protokoll && source .venv/bin/activate && pytest -q`.

---

### Task 1: Waisen re-listen — `werke.ts` bekommt `tier` + drei restaurierte Einträge (TDD)

**Files:**
- Modify: `src/data/werke.ts`
- Test: `src/data/werke.test.ts`

**Interfaces:**
- Consumes: bestehendes `Werk`-Interface und `WERKE_CHRONO` (`src/data/werke.ts:3-16,192`).
- Produces: `Werk.tier?: 'experiment' | 'studie'`; Exporte `WERKE_EXPERIMENTE: Werk[]` und `WERKE_STUDIEN: Werk[]` (beide chronologisch, newest first) — Task 2 konsumiert beide.

- [ ] **Step 1: Failing Tests schreiben**

In `src/data/werke.test.ts` den Import erweitern und am Dateiende anhängen:

```typescript
import { WERKE, WERKE_CHRONO, WERKE_EXPERIMENTE, WERKE_STUDIEN, byRecency } from './werke'
```

```typescript
describe('tier split (Experimente vs. Studien)', () => {
  it('lists the four studies, newest first', () => {
    expect(WERKE_STUDIEN.map((w) => w.id)).toEqual([
      'ghost-fleet',
      'consensus',
      'correction',
      'ueberflug',
    ])
  })
  it('keeps studies out of the experiments list', () => {
    for (const w of WERKE_EXPERIMENTE) expect(w.tier).not.toBe('studie')
  })
  it('splits without losing entries', () => {
    expect(WERKE_EXPERIMENTE.length + WERKE_STUDIEN.length).toBe(WERKE.length)
  })
})
```

- [ ] **Step 2: Tests laufen lassen — müssen fehlschlagen**

Run: `npx vitest run src/data/werke.test.ts`
Expected: FAIL — `WERKE_EXPERIMENTE`/`WERKE_STUDIEN` existieren nicht.

- [ ] **Step 3: Implementierung**

(a) Im `Werk`-Interface (`src/data/werke.ts`, nach dem `methodHref`-Feld) ergänzen:

```typescript
  /** 'studie' = aus der Experimente-Reihe genommen; läuft und archiviert aber weiter. */
  tier?: 'experiment' | 'studie'
```

(b) Beim bestehenden `ueberflug`-Eintrag `tier: 'studie',` ergänzen (direkt unter `methodHref: null,`).

(c) Nach dem `ueberflug`-Eintrag (vor der schließenden `]` von `WERKE`) drei Einträge einfügen — verbatim die am 2026-07-01 (`74b922a`) entfernten Objekte, jeweils plus `tier: 'studie'` als letztes Feld:

```typescript
  {
    id: 'consensus',
    title: 'The Consensus',
    subtitle: {
      de: 'Wie viel „unabhängiger" Nachrichten-Konsens eine Quelle ist, x-fach kopiert',
      en: 'How much „independent" news consensus is one source, copied',
    },
    status: 'live',
    since: '2026-06-22',
    live: true,
    href: '/consensus',
    description: {
      de: 'Aus der Linie „Gegenmessung". Jeden Tag wählt eine Maschine den Satz, den die meisten „unabhängigen" Medien wortgleich brachten, zeigt Quelle und Kaskade und rechnet, wie viel des Nachrichten-Konsenses Echo statt Recherche ist.',
      en: 'From the „Counter-Measurement" line. Each day a machine picks the sentence the most „independent" outlets ran word-for-word, shows source and cascade, and computes how much of the news consensus is echo rather than reporting.',
    },
    tier: 'studie',
  },
  {
    id: 'correction',
    title: 'The Correction',
    subtitle: {
      de: 'Die Jobzahl war aufgebläht — und wird millionenweise gestrichen',
      en: 'The jobs number was inflated — and is cut by the million',
    },
    status: 'live',
    since: '2026-06-22',
    href: '/correction',
    description: {
      de: 'Aus der Linie „Gegenmessung". Nicht durch ein eigenes Modell, sondern durch die Revisionen, die das Amt selbst vornimmt: Die US-Beschäftigtenzahl wird still nach unten korrigiert — Juni 2025 um 1,25 Millionen Stellen; jeder der letzten 24 Monate nach unten. Die Echtzeit-Zahl war systematisch zu hoch.',
      en: 'From the „Counter-Measurement" line. Not via a model of my own but via the revisions the agency itself makes: US employment is quietly cut downward — June 2025 by 1.25 million jobs; every one of the last 24 months downward. The real-time number ran systematically too high.',
    },
    tier: 'studie',
  },
  {
    id: 'ghost-fleet',
    title: 'The Ghost Fleet',
    subtitle: {
      de: 'Schiffe, die ihren Transponder bewusst abschalten, um zu verschwinden',
      en: 'Ships that switch off their transponder on purpose to vanish',
    },
    status: 'live',
    since: '2026-06-26',
    live: true,
    href: '/ghost-fleet',
    description: {
      de: 'Aus der Linie „Gegenmessung". Das AIS-Bild der Meere wirkt lückenlos — ist es aber nicht: Schiffe schalten ihren Transponder bewusst ab, um zu verschwinden. Jeden Tag zählt eine Maschine die absichtliche Funkstille und hebt den markantesten Fall hervor — ein benanntes Schiff, das wochenlang in fremden Hoheitsgewässern dunkel wurde. Kein Illegalitäts-Vorwurf, nur die gezählte Unsichtbarkeit.',
      en: 'From the „Counter-Measurement" line. The AIS picture of the seas looks complete — but it is not: ships switch off their transponder on purpose to vanish. Each day a machine counts the deliberate radio silence and surfaces the most striking case — a named vessel that went dark for weeks inside foreign national waters. No claim of illegality, only the counted invisibility.',
    },
    tier: 'studie',
  },
```

(d) Nach der `WERKE_CHRONO`-Definition (Zeile ~192) ergänzen:

```typescript
/** Kuratierte Experimente-Reihe vs. Studien außer der Reihe — beide chronologisch. */
export const WERKE_EXPERIMENTE: Werk[] = WERKE_CHRONO.filter((w) => w.tier !== 'studie')
export const WERKE_STUDIEN: Werk[] = WERKE_CHRONO.filter((w) => w.tier === 'studie')
```

Hinweis: Die bestehenden Tests „leads with the newest experiment (field)" und „ends with Überflug" bleiben gültig (ueberflug/2026-06-12 ist weiterhin der älteste Eintrag; Gleichstand 06-22 wird durch stabile Sortierung in Array-Reihenfolge aufgelöst — deshalb `consensus` **vor** `correction` einfügen).

- [ ] **Step 4: Tests laufen lassen — müssen bestehen**

Run: `npx vitest run src/data/werke.test.ts`
Expected: PASS (alle, auch die Bestandstests).

- [ ] **Step 5: Commit**

```bash
git add src/data/werke.ts src/data/werke.test.ts
git commit -m "feat(lab): Werk-Tier 'studie' + Consensus/Correction/Ghost-Fleet restauriert (Spec §3 D1)"
```

---

### Task 2: Waisen-Rubrik im Lab + Homepage-Strip filtert Studien

**Files:**
- Modify: `src/components/pages/LabIndex.astro`
- Modify: `src/components/WerkeStrip.astro`
- Modify: `src/i18n/ui.ts`

**Interfaces:**
- Consumes: `WERKE_EXPERIMENTE`, `WERKE_STUDIEN` aus Task 1.
- Produces: neue i18n-Keys `lab.running` / `lab.runningSub` (beide Locales).

- [ ] **Step 1: i18n-Keys ergänzen**

In `src/i18n/ui.ts` im DE-Block direkt unter `'lab.studies': 'Studien & Daten-Stories',` (Zeile ~71):

```typescript
    'lab.running': 'Außer der Reihe',
    'lab.runningSub': 'Aus der Experimente-Reihe genommen — laufen und archivieren weiter.',
```

Im EN-Block direkt unter `'lab.studies': 'Studies & data stories',` (Zeile ~183):

```typescript
    'lab.running': 'Out of series',
    'lab.runningSub': 'Taken out of the experiments list — still running, still archiving.',
```

- [ ] **Step 2: LabIndex umbauen**

In `src/components/pages/LabIndex.astro`:

(a) Import ändern (Zeile 5):

```typescript
import { WERKE_EXPERIMENTE, WERKE_STUDIEN } from '@/data/werke'
```

(b) In der Experimente-Sektion `WERKE_CHRONO.map(...)` → `WERKE_EXPERIMENTE.map(...)` (Zeile 23).

(c) Zwischen der Experimente-Sektion (endet Zeile 40 `</section>`) und der „Studien & Daten-Stories"-Sektion einfügen:

```astro
  <!-- Außer der Reihe — delistete Instrumente, die weiterlaufen und archivieren -->
  <section class="mt-16">
    <p class="font-mono text-xs uppercase tracking-[0.18em] text-fg-faint">{t(locale, 'lab.running')}</p>
    <p class="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">{t(locale, 'lab.runningSub')}</p>
    <ul class="mt-6 divide-y divide-line/60 border-t border-line/60">
      {WERKE_STUDIEN.map((werk) => (
        <li class="py-4">
          <a href={getRelativeLocaleUrl(locale, werk.href)} class="group block">
            <span class="font-semibold transition-colors group-hover:text-accent-soft">{werk.title}</span>
            <span class="text-sm text-fg-muted"> — {werk.subtitle[locale]}</span>
            {werk.live && <span class="ml-2 align-middle font-mono text-[10px] uppercase tracking-wider text-fg-faint"><span class="dot-live mr-0.5 inline-block h-[5px] w-[5px] rounded-full align-middle"></span>live data</span>}
          </a>
        </li>
      ))}
    </ul>
  </section>
```

- [ ] **Step 3: WerkeStrip (Homepage) auf Experimente begrenzen**

In `src/components/WerkeStrip.astro` Zeile 6 + 11 ändern:

```typescript
import { GEPLANT, WERKE_EXPERIMENTE } from '@/data/werke'
```

```typescript
const liveWerke = WERKE_EXPERIMENTE.filter((w) => w.status === 'live')
```

Beabsichtigter Effekt: Überflug verschwindet aus dem Homepage-Strip (konsistent mit Studien-Status), bleibt aber auf der Lab-Seite sichtbar.

- [ ] **Step 4: Verifizieren**

Run: `npm run check && npm run test && npm run build`
Expected: alles grün. Danach Sichtprüfung: `npm run dev`, `/lab` und `/en/lab` zeigen die Rubrik „Außer der Reihe" mit 4 Einträgen; Startseite zeigt Überflug nicht mehr im Strip.

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/LabIndex.astro src/components/WerkeStrip.astro src/i18n/ui.ts
git commit -m "feat(lab): Rubrik 'Außer der Reihe' für laufende Studien (Spec §3 D2)"
```

---

### Task 3: Umbenennungen konsistent durchziehen (Spec §3 A3)

**Files:**
- Modify: `src/components/pages/TellPage.astro:2,31`
- Modify: `src/components/pages/RedactionPage.astro:21`
- Modify: `src/components/pages/RoundNumberPage.astro:27`
- Modify: `src/components/pages/MethodenblattTell.astro:14`
- Modify: `src/components/pages/MethodenblattRedaction.astro:14`
- Modify: `src/components/pages/MethodenblattRoundNumber.astro:11`
- Modify: `src/i18n/ui.ts` (DE: Zeilen ~34, 38, 41 · EN: Zeilen ~146, 150, 153 — nach Task 2 verschoben, per Key suchen)
- Modify: `src/lib/og.ts:40,48,52`

**Interfaces:**
- Consumes: neue Titel aus den Global Constraints (verbatim aus `werke.ts`).
- Produces: nichts für andere Tasks.

- [ ] **Step 1: Ist-Stand erfassen**

Run: `grep -rn "The Tell\|The Redaction\|The Round Number" src/ --include="*.astro" --include="*.ts" | grep -v ".test."`
Expected: genau die oben gelisteten Stellen (h1-Literale, Methodenblatt-h1, `tl.title`/`rd.title`/`rn.title` in beiden Locales, drei `og.ts`-Titel, TellPage-Kommentar Zeile 2).

- [ ] **Step 2: Edits**

| Datei/Stelle | alt | neu |
|---|---|---|
| `TellPage.astro:2` (Kommentar) | `// Gegenmessung III — „The Tell".` | `// Gegenmessung III — „The Tell", öffentlich „Delve into the intricate realm".` |
| `TellPage.astro:31` (h1-Inhalt) | `The Tell` | `Delve into the intricate realm` |
| `RedactionPage.astro:21` (h1-Inhalt) | `The Redaction` | `Editorial Deadline` |
| `RoundNumberPage.astro:27` (h1-Inhalt) | `The Round Number` | `Round Numbers` |
| `MethodenblattTell.astro:14` | `h1: de ? 'Methodenblatt — The Tell' : 'Method sheet — The Tell',` | `h1: de ? 'Methodenblatt — „Delve into the intricate realm"' : 'Method sheet — "Delve into the intricate realm"',` |
| `MethodenblattRedaction.astro:14` | `h1: de ? 'Methodenblatt — The Redaction' : 'Method sheet — The Redaction',` | `h1: de ? 'Methodenblatt — Editorial Deadline' : 'Method sheet — Editorial Deadline',` |
| `MethodenblattRoundNumber.astro:11` | `h1: de ? 'Methodenblatt — The Round Number' : 'Method sheet — The Round Number',` | `h1: de ? 'Methodenblatt — Round Numbers' : 'Method sheet — Round Numbers',` |
| `ui.ts` DE+EN | `'tl.title': 'The Tell',` | `'tl.title': 'Delve into the intricate realm',` |
| `ui.ts` DE+EN | `'rd.title': 'The Redaction',` | `'rd.title': 'Editorial Deadline',` |
| `ui.ts` DE+EN | `'rn.title': 'The Round Number',` | `'rn.title': 'Round Numbers',` |
| `og.ts:40` | `title: 'The Tell',` | `title: 'Delve into the intricate realm',` |
| `og.ts:48` | `title: 'The Redaction',` | `title: 'Editorial Deadline',` |
| `og.ts:52` | `title: 'The Round Number',` | `title: 'Round Numbers',` |

- [ ] **Step 3: Verifizieren**

Run: `grep -rn "The Tell\|The Redaction\|The Round Number" src/ --include="*.astro" --include="*.ts" | grep -v ".test."`
Expected: einzig verbleibender Treffer ist der (bewusst historische) Kommentar `TellPage.astro:2`.

Run: `npm run check && npm run test && npm run build`
Expected: grün.

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/TellPage.astro src/components/pages/RedactionPage.astro src/components/pages/RoundNumberPage.astro src/components/pages/MethodenblattTell.astro src/components/pages/MethodenblattRedaction.astro src/components/pages/MethodenblattRoundNumber.astro src/i18n/ui.ts src/lib/og.ts
git commit -m "fix(content): Umbenennung vom 01.07. konsistent — h1, <title>, Methodenblätter, OG (Spec §3 A3)"
```

---

### Task 4: Tote Artefakte entfernen (Spec §3 A4)

**Files:**
- Delete: `pipelines/gegenmessung/` (drei Dateien: `Dockerfile`, `entrypoint.sh`, `README.md`)
- Modify: `.github/workflows/ci.yml:23`

**Interfaces:** keine.

- [ ] **Step 1: Referenzen prüfen (Sicherheitsnetz vor dem Löschen)**

Run: `grep -rn "pipelines/gegenmessung" .github/ package.json scripts/ 2>/dev/null`
Expected: keine Treffer. (Der Workflow `.github/workflows/gegenmessung.yml` ist der **Ersatz** und bleibt unangetastet.)

- [ ] **Step 2: Löschen + ci.yml fixen**

```bash
git rm -r pipelines/gegenmessung
```

In `.github/workflows/ci.yml` Zeile 23:

```yaml
      - run: pip install -e ".[dev]"
```

(alt: `pip install -e ".[dev,bq]"` — das `bq`-Extra existiert im `pyproject.toml` nicht mehr.)

- [ ] **Step 3: Verifizieren**

Run: `cd pipelines/protokoll && source .venv/bin/activate && pip install -e ".[dev]" -q && pytest -q`
Expected: Installation ohne `WARNING: ... does not provide the extra 'bq'`; Tests grün.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "chore: toten GCP-Orchestrator entfernen (ersetzt durch gegenmessung.yml) + bq-Extra aus CI (Spec §3 A4)"
```

(Die Löschung ist durch `git rm -r` bereits gestaged.)

---

### Task 5: Parallaxe-Zensus in der Pipeline — Ausfälle zählen statt verschlucken (TDD, Spec §3 B2)

**Files:**
- Modify: `pipelines/protokoll/src/protokoll/parallaxe/run.py:32-75`
- Test: `pipelines/protokoll/tests/test_px_census.py` (neu)

**Interfaces:**
- Consumes: `_process_topic(client, topic)` und `build_register(client, today)` in `run.py`; `extract_llm.ExtractionError`.
- Produces: `_process_topic` → `tuple[dict | None, str | None]` (Ergebnis, Ausfallgrund ∈ `'zu_wenige_sprachen' | 'llm' | 'quelle'`); `build_register`-Rückgabe erhält Top-Level-Key `census: {"attempted": int, "measured": int, "failed": dict[str, int]}`. Task 6 (Frontend) konsumiert `census`.

- [ ] **Step 1: Failing Test schreiben**

Neu: `pipelines/protokoll/tests/test_px_census.py`

```python
"""Zensus-Block des Parallaxe-Registers: Ausfälle werden gezählt, nie still verschluckt."""
from protokoll.parallaxe import extract_llm
from protokoll.parallaxe import run as run_mod


def _fake_rank(_client, _titles):
    return [
        {"en_title": "Ok Island", "titles": {"en": "Ok Island"}, "lang_count": 6},
        {"en_title": "Fail Island", "titles": {"en": "Fail Island"}, "lang_count": 6},
        {"en_title": "Thin Island", "titles": {"en": "Thin Island"}, "lang_count": 6},
    ]


def _fake_intros(_client, titles):
    name = next(iter(titles.values()))
    if name == "Thin Island":
        return {"en": f"t {name}", "de": "y"}, []  # < MIN_LANGS (5)
    return {"en": f"t {name}", "de": "y", "fr": "z", "ru": "w", "ja": "v"}, []


def _fake_extract(intros, *, client):
    if "Fail Island" in intros["en"]:
        raise extract_llm.ExtractionError("Gemini erschöpft (Test)")
    return {"lemma": {"en": "Ok"}, "name_umstritten": False,
            "claims": [{"aussage": "A", "nach_sprache": {"en": "nennt", "de": "verschweigt"}}]}


def test_build_register_counts_failures(monkeypatch):
    monkeypatch.setattr(run_mod.register, "controversial_titles", lambda c: ["x"])
    monkeypatch.setattr(run_mod.register, "rank_topics", _fake_rank)
    monkeypatch.setattr(run_mod.register, "protection_status", lambda c, t: "none")
    monkeypatch.setattr(run_mod.extracts, "fetch_intros", _fake_intros)
    monkeypatch.setattr(run_mod.extract_llm, "extract_omissions", _fake_extract)
    monkeypatch.setattr(run_mod.analyze, "omission_index",
                        lambda claims, langs: {lang: 0.0 for lang in langs})
    monkeypatch.setattr(run_mod.analyze, "mean_omission", lambda oi: 0.0)

    reg = run_mod.build_register(None, "2026-07-02")

    assert reg["census"] == {"attempted": 3, "measured": 1,
                             "failed": {"llm": 1, "zu_wenige_sprachen": 1}}
    assert [t["en_title"] for t in reg["topics"]] == ["Ok Island"]
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `cd pipelines/protokoll && source .venv/bin/activate && pytest tests/test_px_census.py -q`
Expected: FAIL — `KeyError: 'census'` (bzw. Tuple-Unpacking-Fehler).

- [ ] **Step 3: Implementierung in `run.py`**

`_process_topic` vollständig ersetzen (bisheriger Rumpf Zeilen 32–56):

```python
def _process_topic(client: httpx.Client, topic: dict[str, Any]) -> tuple[dict[str, Any] | None, str | None]:
    """Ein Thema vermessen — fault-isoliert. Rückgabe (Ergebnis, Ausfallgrund).
    Ausfallgründe ('zu_wenige_sprachen' | 'llm' | 'quelle') werden im census-Block
    gezählt und auf der Seite ausgewiesen — Vermerk statt stiller Lücke."""
    try:
        intros, failed = extracts.fetch_intros(client, topic["titles"])
        if len(intros) < MIN_LANGS:
            return None, "zu_wenige_sprachen"
        data = extract_llm.extract_omissions(intros, client=client)
        oi = analyze.omission_index(data["claims"], list(intros))
        protection = register.protection_status(client, topic["en_title"])
        return {
            "en_title": topic["en_title"],
            "lang_count": topic["lang_count"],
            "protection": protection,
            "langs": sorted(intros),
            "lemma": data["lemma"],
            "name_umstritten": bool(data.get("name_umstritten", False)),
            "claims": [{"aussage": c["aussage"], "by_lang": c["nach_sprache"]}
                       for c in data["claims"]],
            "omission_by_lang": oi,
            "mean_omission": analyze.mean_omission(oi),
        }, None
    except extract_llm.ExtractionError:
        print(f"Thema übersprungen ({topic.get('en_title')!r}):", file=sys.stderr)
        traceback.print_exc()
        return None, "llm"
    except Exception:
        print(f"Thema übersprungen ({topic.get('en_title')!r}):", file=sys.stderr)
        traceback.print_exc()
        return None, "quelle"
```

In `build_register` den Block nach dem ThreadPool ersetzen (bisher `topics_out = [r for r in results if r is not None]`):

```python
    topics_out = [r for r, _ in results if r is not None]
    failed: dict[str, int] = {}
    for r, reason in results:
        if r is None and reason is not None:
            failed[reason] = failed.get(reason, 0) + 1
```

und im Rückgabe-Dict nach `"rule": {...},` einfügen:

```python
        "census": {"attempted": len(topics), "measured": len(topics_out),
                   "failed": dict(sorted(failed.items()))},
```

- [ ] **Step 4: Tests laufen lassen — müssen bestehen**

Run: `cd pipelines/protokoll && source .venv/bin/activate && pytest -q`
Expected: alle grün (auch `test_px_run.py` — der mockt `build_register` komplett und ist unberührt).

- [ ] **Step 5: Commit**

```bash
git add pipelines/protokoll/src/protokoll/parallaxe/run.py pipelines/protokoll/tests/test_px_census.py
git commit -m "feat(parallaxe): Ausfall-Zensus im Register — attempted/measured/failed statt stiller Lücke (Spec §3 B2)"
```

---

### Task 6: Parallaxe-Zensus im Frontend ausweisen (Spec §3 B2)

**Files:**
- Modify: `src/lib/parallaxe/types.ts`
- Modify: `src/components/pages/ParallaxePage.astro:21-37,135-138`

**Interfaces:**
- Consumes: `census`-Block aus Task 5 (optional — das heutige `register.json` hat ihn noch nicht).
- Produces: nichts für andere Tasks.

- [ ] **Step 1: Typ ergänzen**

In `src/lib/parallaxe/types.ts` vor `ParallaxeRegister` einfügen:

```typescript
/** Ausfall-Zensus eines Laufs: Vermerk statt stiller Lücke. */
export interface ParallaxeCensus {
  attempted: number
  measured: number
  failed: Record<string, number>
}
```

und im Interface `ParallaxeRegister` nach `rule` ergänzen:

```typescript
  /** Ab 2026-07 vorhanden; ältere Register haben den Block nicht. */
  census?: ParallaxeCensus
```

- [ ] **Step 2: Fußzeilen-Vermerk in `ParallaxePage.astro`**

Im `txt`-Objekt (nach `method:` Zeile 36) ergänzen:

```typescript
  censusNote: (attempted: number, measured: number) =>
    de
      ? `Vermerk: ${attempted - measured} von ${attempted} Themen heute ohne Feststellung — Ausfall, nicht überbrückt.`
      : `Note: ${attempted - measured} of ${attempted} topics without a finding today — failure, not bridged.`,
```

Footer-Block (Zeilen 135–138) ersetzen durch:

```astro
  <footer class="mt-12 border-t border-line pt-6 font-mono text-xs text-fg-faint">
    {reg.census && reg.census.measured < reg.census.attempted && (
      <p class="mb-2">{txt.censusNote(reg.census.attempted, reg.census.measured)}</p>
    )}
    {txt.dataAsOf}: {reg.generated_at} · {txt.model}: {reg.rule.model} · Wikipedia (CC BY-SA) ·
    <a href={methodUrl} class="transition-colors hover:text-fg">{txt.method}</a>
  </footer>
```

- [ ] **Step 3: Verifizieren**

Run: `npm run check && npm run test && npm run build`
Expected: grün (das aktuelle `register.json` ohne `census` rendert unverändert — Optionalität greift).

- [ ] **Step 4: Commit**

```bash
git add src/lib/parallaxe/types.ts src/components/pages/ParallaxePage.astro
git commit -m "feat(parallaxe): Ausfallvermerk in der Fußzeile (Spec §3 B2)"
```

---

### Task 7: Parallaxe-Kollaps diagnostizieren, dann Pacing-Fix (Spec §3 B1/B3 — evidenzbasiert)

**Files:**
- Modify (nur bei bestätigter 429-Diagnose): `pipelines/protokoll/src/protokoll/parallaxe/__init__.py:6`
- Modify (nur bei bestätigter 429-Diagnose): `pipelines/protokoll/src/protokoll/parallaxe/extract_llm.py` (Konstanten + Retry-Schleife)

**Interfaces:** keine (Konstanten-/Verhaltensänderung).

- [ ] **Step 1: Evidenz aus den Nightly-Logs holen**

```bash
gh run list --workflow=parallaxe.yml --limit 3
gh run view <JÜNGSTE_RUN_ID> --log | grep -c "Thema übersprungen"
gh run view <JÜNGSTE_RUN_ID> --log | grep "Gemini erschöpft" | head -5
```

Hypothese: viele Skips, Meldung `Gemini erschöpft nach 3 Versuchen (zuletzt 429)` — Free-Tier-Rate-Limit bei 8 parallelen Workern.

- [ ] **Step 2: Entscheidungs-Gate**

**Nur wenn** die Logs 429-dominierte `ExtractionError` zeigen → Step 3. **Wenn die Evidenz etwas anderes zeigt** (z. B. Wikipedia-Fetch-Fehler, `MIN_LANGS`-Filter): STOPP — Befund dokumentieren und Frank berichten, keinen spekulativen Fix anwenden.

- [ ] **Step 3: Pacing-Fix**

`pipelines/protokoll/src/protokoll/parallaxe/__init__.py` Zeile 6:

```python
WORKERS = 2                       # Free-Tier-RPM: 8 parallele Gemini-Aufrufe liefen ins 429 (Diagnose 2026-07-02)
```

`extract_llm.py`: Konstante `MAX_RETRIES = 3` → `MAX_RETRIES = 5`, und die Retry-Schleife von

```python
    for _ in range(MAX_RETRIES):
        resp = client.post(_endpoint(), headers=headers, json=body, timeout=120.0)
        if resp.status_code in RETRY_STATUSES:
            last_status = resp.status_code
            time.sleep(RETRY_DELAY_S)
            continue
```

auf exponentielles Backoff:

```python
    for attempt in range(MAX_RETRIES):
        resp = client.post(_endpoint(), headers=headers, json=body, timeout=120.0)
        if resp.status_code in RETRY_STATUSES:
            last_status = resp.status_code
            time.sleep(RETRY_DELAY_S * (2 ** attempt))
            continue
```

- [ ] **Step 4: Tests + lokale Probe**

Run: `cd pipelines/protokoll && source .venv/bin/activate && pytest -q`
Expected: grün (`test_px_extract.py::test_extract_omissions_retries_on_429_then_succeeds` mockt `sleep` und besteht weiter).

Wenn `GEMINI_API_KEY` lokal vorhanden: `python -m protokoll.parallaxe.run --dry-run --repo-root /tmp/px-probe` und `topics`-Anzahl + `census` im Output-JSON prüfen (Erwartung: deutlich > 1 Thema). Sonst: Erfolgskriterium ist der nächste Nightly-Lauf nach Deploy (Spec §3 B3) — als offenen Punkt im Abschlussbericht vermerken.

- [ ] **Step 5: Commit**

```bash
git add pipelines/protokoll/src/protokoll/parallaxe/__init__.py pipelines/protokoll/src/protokoll/parallaxe/extract_llm.py
git commit -m "fix(parallaxe): Worker-Drosselung + exponentielles Backoff gegen Free-Tier-429 (Spec §3 B1/B3, Diagnose in Log)"
```

---

### Task 8: Vertagungsindex — Meereis-Trends verdrahten (TDD, Spec §3 C1)

**Files:**
- Modify: `pipelines/protokoll/src/protokoll/adapters/seaice.py:32-45`
- Test: `pipelines/protokoll/tests/test_seaice_trend.py` (neu)

**Interfaces:**
- Consumes: `classify_trend(series, *, worse, ...)` + `WORSE_DIRECTION` aus `protokoll/trend.py`; `Measurement(..., trend=...)` (Schema v3).
- Produces: `seaice_north`/`seaice_south`-Messungen tragen `trend` — der bestehende `compute_index()` zählt sie automatisch mit.

- [ ] **Step 1: Failing Test schreiben**

Neu: `pipelines/protokoll/tests/test_seaice_trend.py` (Muster: `test_co2_trend.py`)

```python
from datetime import date

import httpx

from protokoll.adapters import seaice
from protokoll.adapters.base import Context


def _client(csv_text: str) -> httpx.Client:
    def handler(_req: httpx.Request) -> httpx.Response:
        return httpx.Response(200, text=csv_text)
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_seaice_measure_sets_trend_worsened_when_extent_falls():
    # Spalten: year,month,day,extent — über 12 Monate fallende Ausdehnung (worse="down")
    lines = [f"2025,{m},1,{15.0 - m * 0.5}" for m in range(1, 13)]
    lines.append("2026,1,1,8.5")
    csv = "\n".join(lines) + "\n"
    m = seaice.measure_north(Context(client=_client(csv), today=date(2026, 1, 2), env={}))
    assert m.value == 8.5
    assert m.trend == "worsened"


def test_seaice_south_also_classifies():
    lines = [f"2025,{m},1,{10.0 + m * 0.5}" for m in range(1, 13)]
    lines.append("2026,1,1,17.0")
    csv = "\n".join(lines) + "\n"
    m = seaice.measure_south(Context(client=_client(csv), today=date(2026, 1, 2), env={}))
    assert m.trend == "improved"
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `cd pipelines/protokoll && source .venv/bin/activate && pytest tests/test_seaice_trend.py -q`
Expected: FAIL — `m.trend` ist `None`.

- [ ] **Step 3: Implementierung**

In `seaice.py` Import ergänzen (unter die bestehenden `protokoll.*`-Imports):

```python
from protokoll.trend import WORSE_DIRECTION, classify_trend
```

`_measure`/`measure_north`/`measure_south` (Zeilen 32–45) ersetzen durch:

```python
def _measure(url: str, top_id: str, ctx: Context) -> Measurement:
    rows = _rows(fetch(url, client=ctx.client))
    d, value = rows[-1]
    prev = prev_year_value(dict(rows), d)
    comparison = Comparison(label="prev_year_day", value=prev) if prev is not None else None
    trend = classify_trend(rows, worse=WORSE_DIRECTION[top_id])
    return Measurement(value=value, as_of=d.isoformat(), comparison=comparison, trend=trend)


def measure_north(ctx: Context) -> Measurement:
    return _measure(URL_N, "seaice_north", ctx)


def measure_south(ctx: Context) -> Measurement:
    return _measure(URL_S, "seaice_south", ctx)
```

- [ ] **Step 4: Alle Tests laufen lassen**

Run: `cd pipelines/protokoll && source .venv/bin/activate && pytest -q`
Expected: grün (bestehende Seaice-Tests prüfen value/comparison und sind vom zusätzlichen `trend`-Feld unberührt; falls ein Bestandstest exakte Gleichheit des Measurement asserted, dort `trend`-Erwartung ergänzen).

- [ ] **Step 5: Commit**

```bash
git add pipelines/protokoll/src/protokoll/adapters/seaice.py pipelines/protokoll/tests/test_seaice_trend.py
git commit -m "feat(protokoll): Meereis Nord/Süd klassifiziert gegen den 365-Tage-Trend (Spec §3 C1)"
```

---

### Task 9: Vertagungsindex — Ozean-Trend verdrahten (TDD, Spec §3 C1)

**Files:**
- Modify: `pipelines/protokoll/src/protokoll/adapters/sst.py:16-43`
- Test: `pipelines/protokoll/tests/test_sst_trend.py` (neu)

**Interfaces:**
- Consumes: `classify_trend` + `WORSE_DIRECTION` (wie Task 8); die in `measure()` bereits vorhandene `years`-Struktur (`{jahr: [tageswerte]}`).
- Produces: `sst`-Messung trägt `trend`.

- [ ] **Step 1: Failing Test schreiben**

Neu: `pipelines/protokoll/tests/test_sst_trend.py`

```python
from datetime import date

import httpx

from protokoll.adapters import sst
from protokoll.adapters.base import Context


def _client(payload) -> httpx.Client:
    def handler(_req: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json=payload)
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_sst_measure_sets_trend_worsened_when_rising():
    data = [
        {"name": "2025", "data": [20.0 + i * 0.001 for i in range(365)]},
        {"name": "2026", "data": [20.40, 20.42] + [None] * 363},
        {"name": "1982-2011 mean", "data": [None] * 365},  # isdigit-Filter muss sie ignorieren
    ]
    m = sst.measure(Context(client=_client(data), today=date(2026, 1, 3), env={}))
    assert m.value == 20.42
    assert m.trend == "worsened"
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `cd pipelines/protokoll && source .venv/bin/activate && pytest tests/test_sst_trend.py -q`
Expected: FAIL — `m.trend` ist `None`.

- [ ] **Step 3: Implementierung**

In `sst.py` Import ergänzen:

```python
from protokoll.trend import WORSE_DIRECTION, classify_trend
```

In `measure()` vor dem `return` (Zeile 43) einfügen und das `return` erweitern:

```python
    # Volle (Datum, Wert)-Reihe über alle Jahre — Grundlage der 365-Tage-Trendklassifikation.
    series = sorted(
        (date(int(y), 1, 1) + timedelta(days=i), float(v))
        for y, s in years.items()
        for i, v in enumerate(s)
        if v is not None
    )
    trend = classify_trend(series, worse=WORSE_DIRECTION["sst"])
    return Measurement(value=value, as_of=as_of, comparison=comparison, record=record,
                       trend=trend)
```

- [ ] **Step 4: Alle Tests laufen lassen**

Run: `cd pipelines/protokoll && source .venv/bin/activate && pytest -q`
Expected: grün.

- [ ] **Step 5: Commit**

```bash
git add pipelines/protokoll/src/protokoll/adapters/sst.py pipelines/protokoll/tests/test_sst_trend.py
git commit -m "feat(protokoll): Ozean (SST) klassifiziert gegen den 365-Tage-Trend (Spec §3 C1)"
```

---

### Task 10: Methodenblatt Protokoll — Realität statt GCP, Index-Ehrlichkeit, Änderungsprotokoll (Spec §3 A1 + C2)

**Files:**
- Modify: `src/components/pages/MethodenblattProtokoll.astro:21-24,26-46,47-54`

**Interfaces:** keine. **Abhängigkeit:** nach Task 8+9 (die „4 von 8"-Aussage muss wahr sein).

- [ ] **Step 1: §3 Verarbeitung (s3body) ersetzen**

```typescript
  s3body: de
    ? `Jeder Satz ist deterministisch aus Daten erzeugt — Templates statt LLM, Registerfassung ${TEMPLATE_VERSION}, auf jeder Seite ausgewiesen. Das kanonische Artefakt ist die Tages-JSON-Datei im Repository (ein Commit pro Sitzung, Autorin „Protokollführung"); die Prosa ist Darstellung. Code öffentlich: pipelines/protokoll im Site-Repository; die Pipeline läuft als nächtlicher GitHub-Actions-Workflow (.github/workflows/protokoll.yml).`
    : `Every sentence is derived deterministically from data — templates, no LLM, register version ${TEMPLATE_VERSION}, stated on every page. The canonical artefact is the daily JSON file in the repository (one commit per session, author "Protokollführung"); the prose is presentation. Code is public: pipelines/protokoll in the site repository; the pipeline runs as a nightly GitHub Actions workflow (.github/workflows/protokoll.yml).`,
```

- [ ] **Step 2: §5 Compute-Fußabdruck (s5body) ersetzen**

```typescript
  s5body: de
    ? 'Ein GitHub-Actions-Lauf pro Tag auf einem Standard-Runner; alle Quellen werden direkt per HTTP abgerufen — kein Cloud-Warehouse, keine kostenpflichtige Abfrage. Die Site selbst ist statisch; zur Laufzeit wird kein Cloud-Dienst gelesen.'
    : 'One GitHub Actions run per day on a standard runner; all sources are fetched directly over HTTP — no cloud warehouse, no metered query. The site itself is static; no cloud service is read at runtime.',
```

- [ ] **Step 3: §4 Grenzen (s4items) um die Index-Ehrlichkeit ergänzen**

Als **letztes** Element in beiden Arrays anhängen:

DE:
```typescript
        'Der Vertagungsindex klassifiziert derzeit 4 von 8 indexfähigen Größen gegen ihren 365-Tage-Trend (CO₂, Meereis Arktis und Antarktis, Ozean); Vertreibung, Ernährung, Konflikt und Feuer liefern noch keine ausreichende Historie und zählen als „Trend nicht etabliert".',
```

EN:
```typescript
        'The adjournment index currently classifies 4 of 8 index-eligible measures against their 365-day trend (CO₂, Arctic and Antarctic sea ice, ocean); displacement, food, conflict and fire do not yet provide sufficient history and count as "trend not established".',
```

- [ ] **Step 4: §6 Änderungsprotokoll (s6items) ersetzen**

```typescript
  s6items: de
    ? [
        `Registerfassung ${TEMPLATE_VERSION} — Erstfassung, 12 Tagesordnungspunkte (13 Messwerte).`,
        'Befund (2026-06-27): ausklappbarer Befund je Messwert — Monumentwert, Korridorlage, Archivkurve, Serienvermerk.',
        'Vertagungsindex (2026-06-28, Schema v3): Tages-JSON trägt je indexfähiger Größe eine Trend-Klassifikation und einen Sitzungsindex; Trend-Verdrahtung von Meereis und Ozean nachgezogen (2026-07-02).',
      ]
    : [
        `Register version ${TEMPLATE_VERSION} — first edition, 12 agenda items (13 measurements).`,
        'Befund (2026-06-27): expandable finding per measurement — monument value, corridor position, archive curve, streak note.',
        'Adjournment index (2026-06-28, schema v3): the daily JSON carries a trend classification per index-eligible measure and a session index; sea-ice and ocean trend wiring added (2026-07-02).',
      ],
```

- [ ] **Step 5: Verifizieren**

Run: `grep -n "Cloud.Run\|BigQuery\|dbt" src/components/pages/MethodenblattProtokoll.astro`
Expected: keine Treffer.

Run: `npm run check && npm run test && npm run build`
Expected: grün.

- [ ] **Step 6: Commit**

```bash
git add src/components/pages/MethodenblattProtokoll.astro
git commit -m "fix(protokoll): Methodenblatt auf GitHub-Actions-Realität + Index-Ehrlichkeit + Änderungsprotokoll (Spec §3 A1/C2)"
```

---

### Task 11: Methodenblatt Parallaxe — Vertex → AI-Studio (Spec §3 A2)

**Files:**
- Modify: `src/components/pages/MethodenblattParallaxe.astro:37,42`

**Interfaces:** keine.

- [ ] **Step 1: Beide Extraktions-Zeilen ersetzen**

DE (Zeile 37):
```typescript
        'Extraktion: Gemini (gemini-2.5-flash-lite) über die AI-Studio-API (generativelanguage, API-Key) als ein einzelner, transparenter Extraktionsschritt — kein GCP, kein Vertex.',
```

EN (Zeile 42):
```typescript
        'Extraction: Gemini (gemini-2.5-flash-lite) via the AI Studio API (generativelanguage, API key) as a single, transparent extraction step — no GCP, no Vertex.',
```

- [ ] **Step 2: Verifizieren**

Run: `grep -rn "Vertex" src/ --include="*.astro" --include="*.ts"`
Expected: keine Treffer (außer ggf. in `MethodenblattParallaxe.astro` in der neuen Negation „kein Vertex" — das ist gewollt).

Run: `npm run check && npm run build`
Expected: grün.

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/MethodenblattParallaxe.astro
git commit -m "fix(parallaxe): Methodenblatt nennt die reale AI-Studio-API statt Vertex (Spec §3 A2)"
```

---

### Task 12: Finale Abnahme (Spec §4)

**Files:** keine neuen Änderungen erwartet.

- [ ] **Step 1: Volle Gates**

```bash
npm run check && npm run test && npm run build
cd pipelines/protokoll && source .venv/bin/activate && pytest -q && cd ../..
git status --short
```

Expected: alles grün; keine unbeabsichtigten Änderungen (`??`-Einträge unter `pipelines/irrtum/` sind vorbestehende lokale Build-Artefakte, nicht Teil des Sprints).

- [ ] **Step 2: Sichtprüfung (`npm run dev`)**

- `/lab` + `/en/lab`: Rubrik „Außer der Reihe"/„Out of series" mit Ghost Fleet, Consensus, Correction, Überflug.
- `/tell`, `/redaction`, `/round-number`: neue h1 + `<title>`; Methodenblätter mit neuen Überschriften.
- `/werke/protokoll`: kein Cloud Run/BigQuery mehr; Änderungsprotokoll mit 3 Einträgen; Grenzen-Liste nennt „4 von 8".
- `/werke/parallaxe`: AI-Studio statt Vertex.
- `/parallaxe`: rendert unverändert (census-Vermerk erscheint erst mit dem nächsten Pipeline-Lauf).
- Startseite: Überflug nicht mehr im Experimente-Strip.

- [ ] **Step 3: Unantastbarkeit bestätigen**

```bash
git diff main...HEAD --stat -- src/content/protokoll src/lib/protokoll/render.ts src/content/field src/content/atelier pipelines/beifang
```

Expected: keine Änderungen an diesen Pfaden aus diesem Sprint (Beifang-Task-1-Commits von vor dem Sprint sind ok).

- [ ] **Step 4: Abschlussbericht an Frank**

Zusammenfassen: was behoben, was der Parallaxe-Diagnose-Befund war, offene Verifikation (nächster Nightly-Lauf für census + Topic-Erholung; „verbessert/verschlechtert" im Index ab dem nächsten Tages-JSON mit 4 etablierten Trends). **Kein Merge nach main ohne Franks Go.**
