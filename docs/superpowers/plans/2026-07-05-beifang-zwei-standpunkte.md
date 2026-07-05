# Beifang: Zwei Standpunkte — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein zweiter Messstandpunkt „Leser" (echtes Google Chrome, lokal auf Zuruf) neben dem bestehenden „Automat" (headless CI, wöchentlich); die Differenz beider wird der Leitbefund.

**Architecture:** `vantages`-Feld umgewidmet `us`/`eu` → `automat`/`leser` (Zod-Record erlaubt das ohne Schema-Änderung; Frontend liest `automat ?? us` abwärtskompatibel). Automat-Lauf unverändert; Leser-Lauf nutzt `channel="chrome"` und schreibt eine eigene Datei (`<datum>-leser.json`), um Archiv-Kollision zu vermeiden. Kniffelige Punkte (Browser-Launch, vantages-Bau, Pfad) als reine Funktionen isoliert & getestet.

**Tech Stack:** Python 3.12 (Playwright), pytest; Astro 5, TypeScript, Vitest.

## Global Constraints

- **Archiv-JSONs unantastbar:** bestehende Snapshots (`vantages.us`) werden NICHT editiert; Umwidmung gilt für neue Läufe, Frontend liest `us` abwärtskompatibel als `automat`.
- **Kein Stealth/Anti-Detection:** echtes Chrome ohne Tricks; `navigator.webdriver` bleibt sichtbar; SAGE-Block wird nie umgangen, nur ausgewiesen.
- **Nachprüfbarkeit:** Leser-Rezept offengelegt. **Tatsachen statt Wertung** (auch über Elsevier/Wiley/T&F). **Bilingual** de/en.
- Tests grün · `astro check` 0 · Build ok · alte Archive bytegleich.

## File Structure

- **Modify** `pipelines/beifang/src/beifang/capture.py` — reine `build_launch_kwargs()` + `capture_page(real_chrome=…)`.
- **Modify** `pipelines/beifang/src/beifang/assemble.py` — `assemble_run(vantage_kind=…)` baut `automat`/`leser`; `compute_befund` liest `automat ?? us`.
- **Modify** `pipelines/beifang/src/beifang/run.py` — `--vantage leser` → echtes Chrome + eigener Pfad; `content_path(date, kind)`.
- **Modify** `package.json` — `beifang:leser`.
- **Modify** `src/lib/beifang/stats.ts` — `automatResults`/`leserResults`, Aggregationen auf `results` parametrisiert, Differenz.
- **Modify** `src/components/pages/BeifangPage.astro` — Differenz-Leitbefund, beide Standpunkte, EU-Vermerk → Leser.
- **Modify** `src/components/pages/MethodenblattBeifang.astro` — Rezept, Rahmung, Machbarkeits-Erkenntnis, Änderungsprotokoll (de/en).
- **Tests:** `pipelines/beifang/tests/test_capture.py`, `test_assemble.py`, `test_run.py`; `src/lib/beifang/stats.test.ts`.

---

### Task 1: Chrome-Modus-Probe (headless vs. headed)

**Files:** keine dauerhaften — Wegwerf-Skript im scratchpad.

Klärt den Default des Leser-Modus, bevor er festgeklopft wird: reicht **echtes Chrome headless** durch die Blocker (kein Fenster, angenehm) oder braucht es **headed**?

- [ ] **Step 1: Probe lokal laufen**

Skript (scratchpad): dieselben 4 Blocker wie in der Spec-Tabelle, `pw.chromium.launch(channel="chrome", headless=True)`, 12 s settle, HTTP+Titel via `detect_blocked`. Ausführen mit `pipelines/beifang/.venv/bin/python`.

- [ ] **Step 2: Ergebnis festhalten**

Kommen Elsevier/Wiley/T&F auch **headless** durch → Leser-Default `headless=True`. Wenn nicht → `headless=False` (Fenster, lokal akzeptabel). Das Ergebnis ist der Wert für `HEADLESS_LESER` in Task 2. **Kein Commit.**

---

### Task 2: `capture.py` — echtes-Chrome-Modus

**Files:**
- Modify: `pipelines/beifang/src/beifang/capture.py`
- Test: `pipelines/beifang/tests/test_capture.py`

**Interfaces:**
- Produces: `build_launch_kwargs(real_chrome: bool, proxy: str | None) -> dict` — reine Funktion, baut die Playwright-`launch()`-Argumente. `capture_page(url, *, timeout_s=60.0, settle_s=8.0, proxy=None, real_chrome=False) -> RawCapture`.

- [ ] **Step 1: Failing test**

In `test_capture.py` ergänzen (`HEADLESS_LESER` = Ergebnis aus Task 1, hier beispielhaft `True`):

```python
from beifang.capture import build_launch_kwargs

def test_launch_kwargs_automat_is_bundle_default():
    assert build_launch_kwargs(real_chrome=False, proxy=None) == {}

def test_launch_kwargs_leser_uses_real_chrome_channel():
    kw = build_launch_kwargs(real_chrome=True, proxy=None)
    assert kw["channel"] == "chrome"

def test_launch_kwargs_passes_proxy():
    kw = build_launch_kwargs(real_chrome=False, proxy="http://p:1")
    assert kw["proxy"] == {"server": "http://p:1"}
```

- [ ] **Step 2: Run — verify fail**

Run: `cd pipelines/beifang && .venv/bin/pytest tests/test_capture.py -k launch_kwargs -q`
Expected: FAIL (`build_launch_kwargs` not defined).

- [ ] **Step 3: Implement**

In `capture.py` die Launch-Logik in eine reine Funktion ziehen und `capture_page` sie nutzen lassen (Wert `HEADLESS_LESER` aus Task 1 einsetzen):

```python
HEADLESS_LESER = True  # Task-1-Ergebnis: reicht echtes Chrome headless?

def build_launch_kwargs(real_chrome: bool, proxy: str | None) -> dict:
    kw: dict = {}
    if real_chrome:
        kw["channel"] = "chrome"          # echtes Google Chrome (kein Bundle) — wie ein Leser
        kw["headless"] = HEADLESS_LESER
    if proxy:
        kw["proxy"] = {"server": proxy}
    return kw
```

In `capture_page` die Signatur um `real_chrome: bool = False` erweitern und `launch_kwargs = build_launch_kwargs(real_chrome, proxy)` statt der bisherigen Inline-Zeile verwenden.

- [ ] **Step 4: Run — verify pass**

Run: `cd pipelines/beifang && .venv/bin/pytest tests/test_capture.py -q`
Expected: PASS (alle capture-Tests).

- [ ] **Step 5: Commit**

```bash
git add pipelines/beifang/src/beifang/capture.py pipelines/beifang/tests/test_capture.py
git commit -m "feat(beifang): echtes-Chrome-Messmodus (build_launch_kwargs) für den Leser-Standpunkt"
```

---

### Task 3: `assemble.py` — vantages `automat`/`leser`

**Files:**
- Modify: `pipelines/beifang/src/beifang/assemble.py:99-148`
- Test: `pipelines/beifang/tests/test_assemble.py`

**Interfaces:**
- Consumes: `Vantage`, `RunRecord` (model.py).
- Produces: `assemble_run(*, date_iso, panel_version, runner, vantage, vantage_kind: str, results, lists, previous)` — `vantage_kind` ist `"automat"` oder `"leser"`; baut `vantages` so, dass der gemessene Standpunkt `ok` ist und der andere `ausstehend`.

- [ ] **Step 1: Failing tests**

In `test_assemble.py`:

```python
def test_assemble_automat_fills_automat_vantage():
    rec = assemble_run(date_iso="2026-07-06", panel_version="v", runner="github-actions",
                       vantage="automat", vantage_kind="automat", results=(), lists={}, previous=None)
    assert rec.vantages["automat"].status == "ok"
    assert rec.vantages["leser"].status == "ausstehend"

def test_assemble_leser_fills_leser_vantage():
    rec = assemble_run(date_iso="2026-07-06", panel_version="v", runner="lokal",
                       vantage="leser", vantage_kind="leser", results=(), lists={}, previous=None)
    assert rec.vantages["leser"].status == "ok"
    assert rec.vantages["automat"].status == "ausstehend"
```

- [ ] **Step 2: Run — verify fail**

Run: `cd pipelines/beifang && .venv/bin/pytest tests/test_assemble.py -k vantage -q`
Expected: FAIL (`vantage_kind` unbekannt / Keys `us`/`eu`).

- [ ] **Step 3: Implement**

`assemble_run`-Signatur um `vantage_kind: str` erweitern; das `vantages`-Dict (assemble.py:141-143) ersetzen durch:

```python
    OTHER = {"automat": "Automat-Standpunkt separat (wöchentlich, CI)",
             "leser": "Leser-Standpunkt separat (lokal, echtes Chrome)"}
    measured = "leser" if vantage_kind == "leser" else "automat"
    other = "automat" if measured == "leser" else "leser"
    vantages = {
        measured: Vantage(status="ok", note=None, results=tuple(results)),
        other: Vantage(status="ausstehend", note=OTHER[other], results=None),
    }
```

`compute_befund` (assemble.py:103) abwärtskompatibel machen:

```python
    v = (previous.get("vantages") or {})
    prev = ((v.get("automat") or v.get("us")) or {}).get("results") or []
```

- [ ] **Step 4: Run — verify pass**

Run: `cd pipelines/beifang && .venv/bin/pytest tests/test_assemble.py -q`
Expected: PASS. Bestehende assemble-Tests, die `vantages["us"]` referenzieren, auf `["automat"]` umstellen; `assemble_run`-Aufrufe um `vantage_kind="automat"` ergänzen.

- [ ] **Step 5: Commit**

```bash
git add pipelines/beifang/src/beifang/assemble.py pipelines/beifang/tests/test_assemble.py
git commit -m "feat(beifang): vantages automat/leser statt us/eu; compute_befund abwärtskompatibel"
```

---

### Task 4: `run.py` — Leser-Lauf + eigener Pfad

**Files:**
- Modify: `pipelines/beifang/src/beifang/run.py`
- Test: `pipelines/beifang/tests/test_run.py`

**Interfaces:**
- Consumes: `build_launch_kwargs`/`capture_page(real_chrome=…)` (Task 2), `assemble_run(vantage_kind=…)` (Task 3).
- Produces: `content_path(date_iso: str, kind: str = "automat") -> str` — Leser-Läufe schreiben `<jahr>/<datum>-leser.json`.

- [ ] **Step 1: Failing test**

In `test_run.py`:

```python
from beifang.run import content_path

def test_content_path_automat_unchanged():
    assert content_path("2026-07-06") == "src/content/beifang/2026/2026-07-06.json"

def test_content_path_leser_has_suffix():
    assert content_path("2026-07-06", kind="leser") == "src/content/beifang/2026/2026-07-06-leser.json"
```

- [ ] **Step 2: Run — verify fail**

Run: `cd pipelines/beifang && .venv/bin/pytest tests/test_run.py -k content_path -q`
Expected: FAIL (kind-Parameter fehlt).

- [ ] **Step 3: Implement**

`content_path` (run.py:24-25):

```python
def content_path(date_iso: str, kind: str = "automat") -> str:
    suffix = "-leser" if kind == "leser" else ""
    return f"src/content/beifang/{date_iso[:4]}/{date_iso}{suffix}.json"
```

In `main`: `kind = "leser" if args.vantage == "leser" else "automat"`; `capture_page(entry["url"], proxy=args.proxy, real_chrome=(kind == "leser"))`; `assemble_run(..., vantage_kind=kind)`; `target = root / content_path(date_iso, kind)`.

- [ ] **Step 4: Run — verify pass**

Run: `cd pipelines/beifang && .venv/bin/pytest tests/test_run.py -q`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add pipelines/beifang/src/beifang/run.py pipelines/beifang/tests/test_run.py
git commit -m "feat(beifang): --vantage leser nutzt echtes Chrome + schreibt <datum>-leser.json"
```

---

### Task 5: `package.json` — `beifang:leser`

**Files:** Modify `package.json` (nach `beifang:refresh`, Zeile ~23).

- [ ] **Step 1: Script ergänzen**

```json
    "beifang:leser": "pipelines/beifang/.venv/bin/python -m beifang.run --repo-root . --vantage leser",
```

- [ ] **Step 2: Sanity**

Run: `node -e "JSON.parse(require('fs').readFileSync('package.json'))" && echo OK`
Expected: `OK` (valides JSON).

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore(beifang): npm run beifang:leser für den lokalen Leser-Lauf"
```

---

### Task 6: `stats.ts` — beide Standpunkte + Differenz

**Files:**
- Modify: `src/lib/beifang/stats.ts`
- Test: `src/lib/beifang/stats.test.ts`

**Interfaces:**
- Produces:
  - `automatResults(run): BeifangSiteResult[]` = `run.vantages.automat?.results ?? run.vantages.us?.results ?? []` (abwärtskompatibel).
  - `leserResults(run): BeifangSiteResult[]` = `run.vantages.leser?.results ?? []`.
  - `latestByVantage(runs, kind): BeifangRun | undefined` — jüngster Run mit `ok`-Status für `automat`/`leser`.
  - Bestehende Aggregationen bekommen eine Variante auf `results` (statt fix `usResults`).

- [ ] **Step 1: Failing tests**

In `stats.test.ts` (der bestehende `run()`-Helper baut `vantages.us`; ergänze einen `leserRun`-Helper mit `vantages.leser`):

```python
# (TS)
```
```ts
import { automatResults, leserResults } from './stats'

it('automatResults liest automat, fällt auf us zurück (Altarchiv)', () => {
  const neu = run([result({})]) // us-Fixture = Altarchiv
  expect(automatResults(neu).length).toBe(1)         // us-Fallback greift
})
it('leserResults liest den Leser-Vantage', () => {
  const r = { ...run([]), vantages: { leser: { status: 'ok', note: null, results: [result({ publisher: 'elsevier' })] } } }
  expect(leserResults(r as any)[0].publisher).toBe('elsevier')
})
```

- [ ] **Step 2: Run — verify fail**

Run: `npm run test -- stats.test.ts`
Expected: FAIL (Funktionen fehlen).

- [ ] **Step 3: Implement**

`usResults` (stats.ts:12-14) ersetzen/ergänzen:

```ts
export function automatResults(run: BeifangRun): BeifangSiteResult[] {
  return run.vantages.automat?.results ?? run.vantages.us?.results ?? []
}
export function leserResults(run: BeifangRun): BeifangSiteResult[] {
  return run.vantages.leser?.results ?? []
}
/** @deprecated Abwärtskompat-Alias auf den Automat-Standpunkt. */
export const usResults = automatResults
```

`usResults` bleibt als Alias, damit die bestehenden Aggregationen (blockadeStats, leakFindings, groupMedians, …) unverändert auf dem Automat-Standpunkt arbeiten. Für die Leser-Darstellung erhalten die zwei in Task 7 gebrauchten Aggregationen eine results-Variante:

```ts
export function blockedPublishersFromResults(results: BeifangSiteResult[]): string[] {
  return [...new Set(results.filter((r) => r.group === 'verlag' && r.blocked !== null).map((r) => r.publisher))].sort()
}
```

(analog nutzt Task 7 `leakFindings` weiter für den Automat und ein leserseitiges Pendant über `leserResults` — falls `leakFindings` `run`-gebunden bleibt, kleiner Wrapper `leakFindingsFor(results)`; Signatur im Task-7-Code gespiegelt.)

- [ ] **Step 4: Run — verify pass**

Run: `npm run test -- stats.test.ts`
Expected: PASS (neue + bestehende, dank `usResults`-Alias).

- [ ] **Step 5: Commit**

```bash
git add src/lib/beifang/stats.ts src/lib/beifang/stats.test.ts
git commit -m "feat(beifang): automatResults/leserResults (us-Abwärtskompat) + Differenz-Helfer"
```

---

### Task 7: `BeifangPage.astro` — Differenz-Leitbefund

**Files:** Modify `src/components/pages/BeifangPage.astro`

**Interfaces:** Consumes `automatResults`/`leserResults`/`latestByVantage`/`blockedPublishersFromResults` (Task 6).

- [ ] **Step 1: Frontmatter — beide Standpunkte laden**

Ergänze: `const automat = latest` (jüngster mit automat/us) und `const leserRun = latestByVantage(runs, 'leser')`. Wo `leserRun` existiert: `const leserBlocked = blockedPublishersFromResults(leserResults(leserRun))` (erwartet nur noch SAGE).

- [ ] **Step 2: Leitbefund umformulieren (de/en)**

Ersetze/ergänze den Blockade-Leitbefund um die Differenz (nur wenn `leserRun` vorhanden). Zielformulierung:
- de: `Der automatisierte Prüfblick wird bei ${nAutomat} Verlagen gesperrt — ein echter Leser nur bei ${leserBlocked.map(PUBLISHER_LABELS).join(', ')}. Was der Leser mitträgt, steht unten.`
- en: sinngemäß.
Fehlt `leserRun`, bleibt der bestehende Automat-Leitbefund unverändert (Abwärtskompatibilität: solange kein Leser-Snapshot existiert, ändert sich die Seite nicht).

- [ ] **Step 3: Leser-Sektion**

Wenn `leserRun` vorhanden: eine Sektion „Was der echte Leser ausgeliefert bekommt" mit dem Leak-/Empfänger-Befund über `leserResults(leserRun)` (dieselbe Empfänger-Benennung wie beim Automat, Spec 07-04). Beide Snapshot-Daten (Automat vom X, Leser vom Y) ehrlich ausweisen.

- [ ] **Step 4: EU-Vermerk → Leser-Standpunkt**

`EU_STATUS_TEXT` + der `vantages.eu`-Block (BeifangPage.astro:31-44, ~260-265) wird ersetzt durch einen Leser-Standpunkt-Vermerk: wenn kein `leserRun` → „Leser-Standpunkt: noch nicht gemessen (lokal, auf Zuruf)"; sonst „zuletzt gemessen am Y".

- [ ] **Step 5: check + build + visuell**

Run: `npm run check && npm run build`
Expected: 0 Fehler; Build ok. Preview `/de/beifang` + `/beifang`: solange kein Leser-Snapshot committet ist, sieht die Seite aus wie zuvor (Abwärtskompat); mit Leser-Snapshot erscheinen Differenz-Leitbefund + Leser-Sektion.

- [ ] **Step 6: Commit**

```bash
git add src/components/pages/BeifangPage.astro
git commit -m "feat(beifang): Differenz-Leitbefund + Leser-Sektion; EU-Vermerk → Leser-Standpunkt"
```

---

### Task 8: `MethodenblattBeifang.astro` — Rezept & Rahmung

**Files:** Modify `src/components/pages/MethodenblattBeifang.astro`

- [ ] **Step 1: Abschnitt „Zwei Standpunkte" (de/en)**

Neuer Abschnitt: Automat (headless, CI, wöchentlich) vs. Leser (echtes Chrome, lokal, auf Zuruf); die Differenz ist der Befund. Reproduzierbares Rezept: Panel-URLs, echtes Google Chrome, residentielle IP — jeder kann es nachstellen (`npm run beifang:leser`).

- [ ] **Step 2: Ehrliche Rahmung (de/en)**

Echter Browser ist **kein Umgehen**: kein Stealth, `navigator.webdriver` bleibt sichtbar — es ist, was ein Leser sieht. **SAGE** wird nicht umgangen (bleibt geblockt = Befund). Machbarkeit: Blockade = UND-Bedingung aus residentieller IP **und** echtem Chrome; Datacenter-VPS nutzlos.

- [ ] **Step 3: „Vantage als Messgröße" + EU aktualisieren**

Den §5-Punkt „Vantage als Messgröße" von geografisch (us/eu) auf Messart (Automat/Leser) umschreiben; den „EU-Messpunkt steht aus"-Punkt ersetzen (Geografie ist nicht der Hebel — belegt). Änderungsprotokoll-Eintrag `2026-07-05`.

- [ ] **Step 4: check + build**

Run: `npm run check && npm run build`
Expected: 0 Fehler; Build ok. Grep DE+EN auf die neuen Kernphrasen.

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/MethodenblattBeifang.astro
git commit -m "docs(beifang): Methodenblatt — zwei Standpunkte, Rezept, ehrliche Rahmung (de/en)"
```

---

### Task 9: Gesamt-Verifikation + echter Leser-Lauf

**Files:** keine Code-Änderung.

- [ ] **Step 1: Volle Suiten**

Run: `cd pipelines/beifang && .venv/bin/pytest -q` **und** `npm run test`
Expected: beide grün.

- [ ] **Step 2: check + build**

Run: `npm run check && npm run build`
Expected: 0 Fehler; Build ok.

- [ ] **Step 3: Echter lokaler Leser-Lauf**

Run: `npm run beifang:leser`
Expected: schreibt `src/content/beifang/2026/<heute>-leser.json`; im Log Elsevier/Wiley/T&F erreichbar (nicht blockiert), SAGE blockiert. Manuell ein Blick ins JSON: `vantages.leser.status == "ok"`, Leaks bei Elsevier/Wiley/T&F vorhanden.

- [ ] **Step 4: Live-Darstellung gegen den Leser-Snapshot**

Preview `/de/beifang` + `/beifang`: Differenz-Leitbefund erscheint, Leser-Sektion zeigt die neuen Verlage; Automat-Sicht unverändert; de/en vollständig.

- [ ] **Step 5: Archiv-Unversehrtheit**

Run: `git status --short src/content/beifang/` (nur die neue `-leser.json` ist neu; kein bestehendes JSON geändert).

- [ ] **Step 6: Abschluss**

`superpowers:finishing-a-development-branch` → Frank fragen (Merge/Deploy + ob der erste Leser-Snapshot mit committet wird). Guardrail: kein Merge nach main ohne Frank.

## Self-Review

**Spec coverage:** §4.1 Datenmodell → Task 3 (assemble) + Task 6 (stats-Reader, us-Fallback) + Task 4 (Leser-Datei). §4.2 Leser-Messmodus → Task 1 (Probe) + Task 2 (capture). §4.3 Auslösen → Task 5. §4.4 Darstellung → Task 7. §4.5 Methodenblatt → Task 8. §5 Tests → Tasks 2/3/4/6 + Task 9. §6 Akzeptanzkriterien → 1:Task9-Step3; 2:Task3 (Automat unverändert); 3:Task7; 4:Task8; 5:Task2/8 (kein Stealth); 6:Task9.

**Placeholder scan:** `HEADLESS_LESER` ist bewusst durch Task 1 bestimmt (kein stiller Platzhalter — Task 1 liefert den Wert). Keine TBD/TODO.

**Type consistency:** `automatResults`/`leserResults`/`build_launch_kwargs`/`content_path(kind)`/`assemble_run(vantage_kind)` konsistent zwischen Definition (Tasks 2/3/4/6) und Konsum (Tasks 4/7/9). `usResults` bleibt als Alias, damit bestehende Aggregationen unverändert grün bleiben.
