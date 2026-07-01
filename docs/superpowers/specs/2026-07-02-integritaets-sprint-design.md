# Integritäts-Sprint — Design

Datum: 2026-07-02 · Status: abgenommen (Frank, 2026-07-02) mit Amendment:
die autonomen Engines (The Measuring Field, Irrtum als Methode) und Beifang
bleiben unangetastet.

## 1. Kontext & Ziel

Der Gesamt-Review aller Experimente (2026-07-02, vor dem Hintergrund der Field-Research-
Linie) hat als Querschnittsbefund eine Reihe von **Integritätsschulden** ergeben: Stellen,
an denen die öffentliche Selbstbeschreibung des Labs nicht mehr mit der Realität
übereinstimmt. Für ein Lab, dessen einzige nicht verhandelbare Regel „nachprüfbar" ist,
sind das keine Schönheitsfehler, sondern Selbstwidersprüche.

**Ziel:** Alle bekannten Diskrepanzen zwischen Behauptung und Realität beheben — ohne
neue Features. Der Sprint ist Stufe 0 vor den größeren Stoßrichtungen (Fehlermodi-
Register, Akkumulations-Ausbau), die eigene Specs bekommen.

**Nicht das Ziel:** Archiv-/Verlaufsansichten, neue Instrumente, Beifang-Tasks 2–12,
Vertagungsindex-Seed-Layer (Schicht A), Collective-Phasen — alles bewusst außerhalb.
**Ebenfalls außerhalb (Frank, 2026-07-02):** The Measuring Field, Irrtum als Methode
und Beifang werden in diesem Sprint nicht angefasst.

## 2. Die Befunde (Ist-Zustand, verifiziert)

1. **Methodenblatt Protokoll** beschreibt Cloud Run, BigQuery und dbt-Lineage — die
   Pipeline läuft seit der GCP-Migration auf GitHub Actions mit HTTP-Quellen. §6
   Änderungsprotokoll endet bei „Registerfassung 1.1.0" — weder Befund (2026-06-27)
   noch Vertagungsindex/Schema v3 (2026-06-28) sind vermerkt.
2. **Methodenblatt Parallaxe** behauptet „Vertex AI" — real ist die AI-Studio-API
   (`generativelanguage`, `gemini-2.5-flash-lite`, `GEMINI_API_KEY`).
3. **Parallaxe degradiert still:** Themenzahl 18 (14.06.) → 6 (27.06.) → **1** (01.07.)
   bei Cap 24. `_process_topic` gibt bei jeder Exception `None` zurück; Ausfälle werden
   weder gezählt noch ausgewiesen — Verstoß gegen die Lab-Regel „Vermerk statt stiller
   Lücke".
4. **Vertagungsindex:** `WORSE_DIRECTION` nennt 8 indexfähige Größen, aber nur
   `co2.py` ruft `classify_trend()` auf — der Index hängt real an einer Zahl.
   `seaice.py` und `sst.py` holen bereits volle historische Reihen, klassifizieren aber
   nicht (bei Umsetzung verifizieren).
5. **Umbenennung vom 01.07. halb durchgezogen:** „Delve into the intricate realm",
   „Editorial Deadline", „Round Numbers" stehen nur auf den Lab-Karten (`werke.ts`);
   `<h1>`, Browser-`<title>` (i18n `tl.title`/`rd.title`/`rn.title`) und
   Methodenblatt-Überschriften sagen noch „The Tell"/„The Redaction"/„The Round Number".
6. **Drei Waisen:** The Consensus, The Correction, The Ghost Fleet wurden am 01.07.
   delistet (`74b922a`), aber Pipelines laufen nächtlich grün weiter und die Seiten
   sind live — nur unverlinkt. Der Zustand „läuft, aber niemand soll es sehen" ist der
   unehrlichste der möglichen.
7. **Field/Meridian:** Instrument 006 („The Fairness Trap") ist im Journal ausführlich
   dokumentiert und **existiert im externen Repo** (`field-research:
   works/2026-07-01-fairness-trap/`), fehlt aber auf der Site — ein
   Integrationsproblem auf Site-Seite, keine Fabrikation der Engine.
   *Amendment (Frank, 2026-07-02): bleibt außerhalb dieses Sprints — die Engines
   werden nicht angefasst; der nächtliche `field-integrate` kann das Werk von selbst
   nachziehen. Befund bleibt hier als Beobachtung dokumentiert.*
8. **Tote Artefakte:** `pipelines/gegenmessung/` ist der ersetzte GCP-Cloud-Run-
   Orchestrator (ein Commit, von keinem Workflow referenziert); `ci.yml` installiert
   ein nicht mehr existierendes Extra `[bq]` (pip-Warnung bei jedem Lauf).

## 3. Maßnahmen

### A — Dokumentierte Methode = reale Methode
- A1: `MethodenblattProtokoll.astro` §3/§5 auf die GitHub-Actions/HTTP-Realität
  umschreiben; §6 Änderungsprotokoll um Befund und Vertagungsindex/Schema v3 ergänzen.
- A2: `MethodenblattParallaxe.astro` Vertex-Passagen → AI-Studio-API, Modellname und
  Key-Typ nennen (der Prompt bleibt wie gehabt wörtlich publiziert).
- A3: Umbenennung konsistent durchziehen (tell/redaction/round-number): Seiten-`<h1>`,
  i18n-Titelkeys, Methodenblatt-Überschriften, OG-Mapping. Die Protokoll-
  Register-Templates (Testschutz) sind davon nicht berührt.
- A4: `pipelines/gegenmessung/` löschen (Git-Historie bewahrt es; Commit-Message
  verweist auf den Ersatz `gegenmessung.yml`); totes `[bq]`-Extra aus `ci.yml`.

### B — Parallaxe: Ausfall als Form statt stiller Lücke
- B1: Ursache des Kollapses diagnostizieren (Hypothese: Free-Tier-Rate-Limits bei
  8 parallelen Workern; `_process_topic` schluckt jede Exception). Systematisch,
  nicht auf Verdacht fixen.
- B2: Pipeline zählt `topics_attempted` / `topics_failed` (mit Fehlerklasse) und
  schreibt beides ins `register.json`; die Seite weist Ausfälle in der Fußzeile aus
  („N von M Themen heute ohne Feststellung — Vermerk"). Kein Erfinden, kein Auffüllen.
- B3: Ursachen-Fix gemäß Diagnose (z. B. Worker-Drosselung, Pacing, Backoff-Tuning).
  Erfolgskriterium: Themenzahl nähert sich wieder dem Cap, und wenn nicht, sagt die
  Seite ehrlich warum.

### C — Vertagungsindex: behaupten, was gerechnet wird
- C1: `classify_trend()` in `seaice.py` (Nord+Süd) und `sst.py` verdrahten — die
  Reihen liegen laut Review bereits vor. Tests analog `test_co2_trend.py`.
  Ergebnis: „mit etabliertem Trend" 1 → 4.
- C2: Schicht A (Seed-Layer für food/refugees/conflict/fires) bleibt außerhalb; das
  Methodenblatt sagt explizit, welche 4 von 8 Größen derzeit klassifizieren und warum
  die übrigen noch nicht.

### D — Waisen re-listen als Studien (entschieden: behalten — Frank, 2026-07-02)
- D1: `Werk`-Typ um `tier?: 'experiment' | 'studie'` erweitern (Default `experiment`).
  Consensus, Correction, Ghost Fleet erhalten `tier: 'studie'` und kehren in
  `werke.ts` zurück; Überflug wird konsistent ebenfalls `studie` (sein Eintrag zeigt
  schon heute auf `/lab/ueberflug-studie`).
- D2: `LabIndex.astro`: Experimente-Liste filtert auf `tier !== 'studie'`; darunter
  eine kompakte Rubrik für laufende Studien (einzeilig, live-Marker), oberhalb der
  bestehenden „Studien & Daten-Stories". Wortlaut der Rubrik: nüchtern, z. B.
  „Außer der Reihe — läuft weiter, wird nicht kuratiert". Feinform bei Umsetzung.
- D3: OG-Bilder/i18n der drei Seiten prüfen; keine Redirects nötig (Seiten waren nie weg).

## 4. Tests & Abnahme

- `npm run check` + `npm run test` + `npm run build` grün; pytest der berührten
  Pipelines (protokoll, parallaxe-Anteile) grün.
- Unantastbar: Archiv-JSONs, Register-Template-Strings (Testschutz), laufende
  Nightly-Workflows der gesunden Instrumente.
- Sichtprüfung: Lab-Seite (neue Rubrik), die drei umbenannten Seiten, Parallaxe-
  Fußzeile mit Ausfallvermerk.

## 5. Entscheidungen (Frank, 2026-07-02)

- Die drei Waisen werden **behalten** und als Studien re-listet (Maßnahme D).
- The Measuring Field, Irrtum als Methode und Beifang bleiben **unangetastet**;
  die frühere Maßnahme „Instrument 006 nachziehen" ist gestrichen (Befund bleibt
  in §2.7 dokumentiert).
- Noch offen (Feinform bei Umsetzung): Wortlaut der Studien-Rubrik.

## 6. Danach (nicht Teil dieses Sprints)

Richtung 1 „Fehlermodi-Register" + Richtung 2 „Akkumulation sichtbar machen" als ein
kombiniertes Projekt (eigene Spec); Beifang-Fertigstellung (Tasks 2–12); Entscheidung
über die brachliegende `pipelines/irrtum` (verdrahten oder als verworfenen Versuch
dokumentieren).
