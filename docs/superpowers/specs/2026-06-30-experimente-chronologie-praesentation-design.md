# Experimente chronologisch + Atelier-Chronologie & -Präsentation

Design-Spec · 2026-06-30 · Status: angenommen (Frank, 2026-06-30)

## Problem

Drei zusammenhängende Beobachtungen aus der Arbeit am „Irrtum als Methode"-Atelier:

1. **Reihenfolge der Experimente ist redaktionell, nicht chronologisch.** `src/data/werke.ts`
   ist „Flaggschiff zuerst, danach nach Wow-Effekt" sortiert. The Protocol steht als
   Sonder-„Flaggschiff" oben (eigene `ProtokollTeaser`-Sektion auf der Startseite), das
   Atelier steht als jüngstes Experiment **ganz unten** in derselben Liste — auf Startseite
   und im Lab gleich schwach gewichtet.
2. **Die Chronologie auf der Atelier-Seite stimmt nicht** (`AtelierPage.astro`):
   - **Tagebuch:** String-Sortierung statt numerisch → `sitzung-10` sortiert vor `sitzung-9`,
     die jüngste Sitzung landet in der Mitte; reine Datums-Einträge (`2026-06-30.md`) rutschen
     unter die nummerierten Sitzungen.
   - **Werke:** in zwei getrennte Sektionen zerlegt (native Astro-„Werke" + „Interaktive
     HTML-Werke"), jede für sich sortiert → das einzelne jüngste Werk führt nicht zwingend.
   - **Texte & Kataster:** **aufsteigend** sortiert → der jüngste Katastereintrag
     (`fehlerkataster-008`) steht ganz unten statt oben.
3. **Manuelle Tages-Läufe erscheinen verspätet.** Der `atelier-integrate`-Workflow läuft nur
   per 03:00-Cron; tagsüber im irrtum-Repo erzeugte Werke werden erst in der Nacht sichtbar.

## Leitprinzip (Frank, 2026-06-30)

> „Alle Projekte einfach chronologisch, und The Protocol nicht flaggshippen, sondern einfach
> in die Liste. Newest first."

Keine redaktionelle Sonderstellung. Aktualität bestimmt Prominenz. Das Atelier rückt nach
oben, weil es das jüngste Experiment ist — nicht durch Sonderbehandlung.

## Lösung

### ① Experimente chronologisch (Startseite + Lab)

**Datenmodell** (`src/data/werke.ts`):
- Neues Pflichtfeld `since: string` (ISO-Datum, Start/Launch des Experiments) je `Werk`.
- Neues optionales Feld `live?: boolean` — `true` nur für Experimente mit **täglich**
  fließenden Live-Daten.
- Sortierung überall **newest-first nach `since`**; bei Gleichstand stabile Array-Reihenfolge
  (redaktionelle Feinordnung des Tages bleibt steuerbar).

**`since`-Werte** (aus Git-Erstcommit der jeweiligen Seite abgeleitet):

| Experiment | `since` | `live` (täglich) |
|---|---|---|
| Irrtum als Methode (atelier) | 2026-06-29 | ✓ |
| The Ghost Fleet | 2026-06-26 | ✓ |
| The Round Number | 2026-06-25 | ✓ |
| The Redaction | 2026-06-25 | ✓ |
| The Tell | 2026-06-22 | — (montags) |
| Patterns | 2026-06-22 | ✓ |
| The Correction | 2026-06-22 | — (montags) |
| The Consensus | 2026-06-22 | ✓ |
| The Policy (praemie) | 2026-06-14 | ✓ |
| Iceberg Theory (parallaxe) | 2026-06-14 | ✓ |
| The Protocol | 2026-06-12 | ✓ |

Cadence-Quelle: `.github/workflows/*.yml` (tägliche Crons) bzw. `gegenmessung.yml`
(„Consensus + Pattern täglich; Tell + Correction montags").

**Startseite** (`src/components/Home.astro`):
- Die eigene **`ProtokollTeaser`-Flaggschiff-Sektion entfällt.** The Protocol wird ein
  normaler Listeneintrag (als ältestes Experiment unten).
- Aufbau danach: Hero → **eine chronologische Experimente-Liste** (newest first) →
  eigene Projekte.
- „Lebendiger" Charakter ohne Flaggschiff: Einträge mit `live: true` tragen eine kleine
  Markierung `● live` (Punkt + Wort, on-theme mono). Einträge ohne `live` tragen keine.

**Lab** (`src/components/pages/LabIndex.astro`): liest dieselbe `WERKE`-Liste → erbt die
chronologische Sortierung automatisch; nur sicherstellen, dass nicht erneut umsortiert wird.

### ② Atelier-Seite: Chronologie + Präsentation (`AtelierPage.astro`)

- **Tagebuch — numerische Sortierung.** Sortierschlüssel je Eintrag = `[datum, sitzungsnr]`,
  beide **numerisch absteigend**. Reine Datums-Einträge (`2026-06-30.md`) erhalten
  Sitzungsnr `0` und stehen damit als ältester Eintrag **unten** im jeweiligen Tag.
  `sitzung-10` steht damit korrekt vor `sitzung-9`.
- **Werke — eine chronologische Galerie.** Native (Astro) und interaktive (HTML) Werke werden
  zu **einem** Array zusammengeführt (`{slug, date, kind, meta}`), **absteigend nach
  `meta.date`** sortiert (Tiebreak: `slug` absteigend, deterministisch). Gerendert wird je
  nach `kind`: `astro` → Link-Karte auf `/atelier/werke/<slug>`, `html` → Inline-Sandbox-
  iframe (Sicherheits-Markup unverändert: `sandbox="allow-scripts"`, kein
  `allow-same-origin`). So führt stets das tatsächlich jüngste Werk.
- **Texte & Kataster — newest first.** Aktuelle aufsteigende Sortierung wird umgekehrt
  (`fehlerkataster-008` … `-001`, dann `genealogie`/`parry-problem`).
- **Grenze (ehrlich vermerkt):** `meta.json` trägt keinen Zeitstempel feiner als das Datum.
  Die Tageschronologie ist exakt; die Reihenfolge mehrerer Werke **desselben Tages** ist
  deterministisch (slug), aber nicht garantiert Erstellungs-Reihenfolge. Exakte Intra-Tag-
  Ordnung wäre eine spätere Erweiterung (Sequenz/Zeitstempel beim Integrieren stempeln).

### ③ Promptheit: Integrate direkt nach Auto-Land (repo-übergreifend)

Architektur: **Auto-Land** (`auto-land.yml`, 02:00 UTC) liegt im **irrtum-Repo** und merged die
`ulysses/*`-Forschungsbranches auf irrtums `main`. **atelier-integrate** liegt **hier**
(frankbueltge.de) und holt irrtums Inhalte. Die Kopplung ist also **cross-repo** — `workflow_run`
(nur innerhalb eines Repos) genügt nicht.

- **Mechanik = `repository_dispatch`.** irrtum signalisiert „main hat sich geändert", hier wird
  daraufhin `atelier-integrate` ausgelöst.
  - **irrtum-Repo:** Trigger auf `push` zu `main` (deckt Auto-Land **und** manuelle Tages-Läufe
    ab, sobald sie auf main landen) → ein kleiner Schritt sendet `repository_dispatch`
    (`event_type: irrtum-landed`) an `frankbueltge/frankbueltge.de`. Alternativ ein Schritt am
    Ende von `auto-land.yml` plus ein optionaler manueller `workflow_dispatch`.
  - **frankbueltge.de:** `atelier-integrate.yml` erhält zusätzlich
    `on: repository_dispatch: types: [irrtum-landed]`. Der 03:00-Cron **bleibt** als
    Sicherheitsnetz.
- **Token (Setup-Schritt, von Frank freizugeben):** der Dispatch braucht ein
  repo-übergreifendes Token mit `contents`/`actions`-Rechten auf frankbueltge.de, als Secret im
  irrtum-Repo (z. B. `SITE_DISPATCH_TOKEN`). Der eingebaute `GITHUB_TOKEN` reicht **nicht** über
  Repo-Grenzen. Dieser Secret-/Token-Schritt wird ausgewiesen und erfordert Franks Aktion bzw.
  ausdrückliche Freigabe (Credentials).
- **Manuelle Tages-Läufe:** Greifen sie erst, sobald der Lauf auf irrtums `main` gelandet ist.
  Falls manuelle Läufe heute nur als `ulysses/*`-Branch existieren (Landung erst nachts), ist
  eine kleine Ergänzung nötig (manuelles Landen oder direkter Dispatch aus dem Lauf) — beim
  Implementieren bestätigen.

## Tests

- **Reine Sortier-Logik in testbare Helfer ziehen** (Vitest), nicht im `.astro`-Frontmatter
  vergraben:
  - `sortWerke(WERKE)` → newest-first nach `since`, stabile Ties. Test: Atelier vor Protocol;
    Gleichstand 06-22 behält Array-Reihenfolge.
  - `journalSortKey(id)` / `sortJournal(entries)` → Test: `sitzung-10` vor `sitzung-9`;
    `2026-06-30.md` unter den 06-30-Sitzungen; Tag 06-30 vor 06-29.
  - `sortWorks(works)` → Test: 06-30 vor 06-29; deterministischer Tiebreak.
- Bestehende Register-/Protokoll-Tests bleiben unangetastet (kein Bezug).
- `npm run check` (astro/TS) muss grün bleiben.

## Nicht im Scope (YAGNI)

- Kein neuer „Featured"-Block, kein Hero für das Atelier (Frank: nur chronologisch).
- Keine feinere Intra-Tag-Sortierung der Werke (eigene spätere Erweiterung).
- Keine Änderung an The-Protocol-Inhalt/Determinismus oder Registertests.
- Keine inhaltliche Redaktion der Atelier-Werke (unredigiert bleibt unredigiert).

## Betroffene Dateien

| Datei | Änderung |
|---|---|
| `src/data/werke.ts` | `since` + `live` Felder; Sortier-Helfer `sortWerke` |
| `src/components/Home.astro` | `ProtokollTeaser`-Sektion entfernen; chronologische Liste; `● live` |
| `src/components/WerkeStrip.astro` | chronologische Sortierung; `● live`-Markierung |
| `src/components/pages/LabIndex.astro` | sicherstellen: erbt chronologische Sortierung |
| `src/components/pages/AtelierPage.astro` | Tagebuch-/Werke-/Kataster-Sortierung; Werke-Galerie vereinen |
| `src/lib/atelier/*` oder neuer `sort`-Helfer | testbare Sortier-Funktionen |
| `.github/workflows/atelier-integrate.yml` | `on: repository_dispatch: [irrtum-landed]` ergänzen (Cron bleibt) |
| irrtum-Repo: `auto-land.yml` / neuer `on: push`-Schritt | `repository_dispatch` an frankbueltge.de senden (+ Secret `SITE_DISPATCH_TOKEN`) |
| `*.test.ts` | Tests für die Sortier-Helfer |
