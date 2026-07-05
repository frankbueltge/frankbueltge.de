# Beifang: Zwei Standpunkte — Automat vs. echter Leser

**Datum:** 2026-07-05
**Status:** Design abgenommen (Frank, „ok / weiter")
**Werkgruppe:** Gegenmessung / Counter-Measurement — Instrument „Der Beifang"
**Vorläufer-Specs:** `2026-07-01-beifang-design.md`, `2026-07-02-beifang-leak-audit-design.md`, `2026-07-04-beifang-empfaenger-benennung-design.md`

## 1. Motivation — empirisch belegt in dieser Session

Vier Messungen (lokal/CI × Chromium/echtes-Chrome) zeigen: die Verlags-Blockade ist eine **UND-Bedingung** aus IP-Reputation und Browser-Fingerprint.

| Bedingung | Elsevier | Wiley | T&F | SAGE |
|---|---|---|---|---|
| headless-Chromium (lokal & CI) | Challenge | 403 | 403 | 403 |
| **echtes Chrome · Wohn-IP (lokal)** | erreichbar | erreichbar | erreichbar | 403 |
| echtes Chrome · CI-IP (GitHub Actions) | Challenge | 403 | 403 | 403 |

**Folgerungen:**
- Elsevier/Wiley/T&F kommen **nur** mit residentieller IP **und** echtem Chrome durch — beides zusammen.
- Datacenter-VPS bringt nichts (CI-IP blockt trotz echtem Chrome); nur ein residentieller Standpunkt hilft — und den gibt es: **Franks Mac.**
- Der „Leser"-Standpunkt kann daher **nicht** vollautomatisch auf GitHub Actions laufen; er läuft **lokal, manuell**.
- Der Befund ist **strukturell, nicht volatil** (Automat-Läufe 03.07. = 04.07. byte-genau). Wert liegt in **Reproduzierbarkeit**, nicht Kadenz.

**Kernidee:** Zwei Messstandpunkte statt einem. Der **Automat** (headless, CI, wöchentlich) misst den automatisierten Prüfblick; der **Leser** (echtes Chrome, lokal, auf Zuruf) misst, was ein realer Leser ausgeliefert bekommt. **Die Differenz ist der Befund**: die Verlage sperren den Prüf-Automaten aus, nicht den zahlenden Leser — und liefern dem Leser genau das Tracking, das der Automat nie zu sehen bekommt.

## 2. Ziel & Nicht-Ziele

**Ziel:**
- Leser-Messmodus in der Pipeline (echtes Google Chrome).
- Koexistenz beider Standpunkte im Datenmodell (Ansatz B, s. §4).
- Darstellung der Automat-vs-Leser-Differenz als neuer Leitbefund.
- Reproduzierbares „so-misst-du-es-selbst"-Rezept im Methodenblatt + ehrliche Rahmung (echter Browser ≠ Umgehung).

**Nicht-Ziele (YAGNI):**
- **Kein** Stealth/Anti-Detection (kein playwright-stealth, kein `navigator.webdriver`-Patch, kein Challenge-Solver). Echtes Chrome ohne Tricks.
- **Kein** aktives Umgehen echter Blockaden: SAGE bleibt geblockt und wird als Befund ausgewiesen, nie umgangen.
- Kein wöchentlicher Zwang für den Leser-Lauf (Experiment auf Zuruf).
- Kein VPS, kein residentieller Proxy-Dienst (Datacenter nutzlos; residentielle Proxies ethisch grau).
- Kein EU-/Geo-Vantage (Probe zeigt: Geografie ist nicht der Hebel — Faden beerdigt).

## 3. Verbindliche Regeln (CLAUDE.md)

- **Archiv-JSONs unantastbar.** Bestehende Snapshots (mit `vantages.us`) werden **nicht** editiert; die Umwidmung auf `automat`/`leser` gilt für neue Läufe, die Darstellung liest `us` abwärtskompatibel als `automat`.
- **Nachprüfbarkeit.** Das Leser-Rezept (URLs, echtes Chrome, Wohn-IP) ist offengelegt und von Dritten nachstellbar. Modell/Verfahren transparent.
- **Tatsachen statt Wertung.** Jetzt auch über Elsevier/Wiley/T&F — dieselbe Abmahn-Vorsicht wie bei Springer/Digital Science. Wort „Verstoß" bleibt draußen.
- **Ausfälle/Blockaden ehrlich.** SAGE-Block wird ausgewiesen, nie umgangen. Ein nicht gelaufener Standpunkt ist „ausstehend/entfällt", nie still 0.
- **Bilingual** (de/en), Tests grün, `astro check` 0, Build erfolgreich.

## 4. Architektur

### 4.1 Datenmodell — Ansatz B (verfeinert)

Das `vantages`-Feld wird umgewidmet: `us`/`eu` → **`automat`/`leser`**.
- **Automat-Snapshot** (CI, wöchentlich): Datei `src/content/beifang/<jahr>/<datum>.json` wie heute; `vantages.automat` = Ergebnisse, `vantages.leser` = ausstehend.
- **Leser-Snapshot** (lokal, auf Zuruf): eigene Datei, um Datums-Kollision mit dem Automat-Archiv zu vermeiden (genaues Naming — Suffix `-leser` oder Unterordner — legt der Plan fest); `vantages.leser` = Ergebnisse, `vantages.automat` = ausstehend.
- Eine Astro-Content-Collection liest beide; die Seite nimmt den **jüngsten `automat`-** und den **jüngsten `leser`-Snapshot** und stellt sie gegenüber (Daten dürfen differieren — Befund ist strukturell; beide Messdaten werden ehrlich ausgewiesen).
- **Abwärtskompatibilität:** `data.ts`/`stats.ts` lesen `vantages.automat ?? vantages.us` (alte Archive bleiben gültig, unverändert).

### 4.2 Pipeline — Leser-Messmodus

`capture_page` bekommt einen Modus: `automat` = headless-Chromium (heute), `leser` = echtes Google Chrome (`channel="chrome"`). `run.py` erhält ein Flag (z. B. `--vantage leser` schaltet den Chrome-Modus).
**Erster Umsetzungsschritt (Verifikation vor Festklopfen):** 1-Zeilen-Probe, ob echtes Chrome *headless* schon durch die Blocker kommt (kein Fenster, angenehmer) oder ob es *headed* (sichtbar, via Fenster) braucht. Ergebnis bestimmt den Default des Leser-Modus.

### 4.3 Auslösen

`npm run beifang:leser` → `python -m beifang.run --repo-root . --vantage leser` lokal auf dem Mac; schreibt den Leser-Snapshot, den Frank committet. Kein Cron. Der wöchentliche Automat-Workflow (`beifang.yml`) bleibt unverändert.

### 4.4 Darstellung (`BeifangPage.astro`)

- **Neuer Leitbefund aus der Differenz:** „Der automatisierte Prüfblick wird bei N Verlagen gesperrt — ein echter Leser nur bei SAGE." + „Und das trägt der Leser bei allen mit:" → die (jetzt breitere) Leak-/Tracker-Sektion inkl. Elsevier/Wiley/T&F.
- Beide Standpunkte sichtbar ausgewiesen (welcher Snapshot von wann).
- SAGE bleibt der ehrliche Rest-Block (auch echter Leser gesperrt).
- Kein Struktur-Umbau über das Nötige hinaus; die bestehende Empfänger-Benennung (Spec 07-04) trägt auf beide Standpunkte.

### 4.5 Methodenblatt

- Reproduzierbares Rezept: „so misst du es selbst" (Panel-URLs, echtes Chrome, residentielle IP).
- Ehrliche Rahmung: echter Browser ist **kein Umgehen** (kein Stealth, `navigator.webdriver` sichtbar) — es ist, was ein Leser sieht; SAGE wird nicht umgangen.
- Machbarkeits-Erkenntnis dokumentiert (UND-Bedingung IP+Browser; Datacenter-VPS nutzlos).
- „Vantage als Messgröße" (bestehender §5-Punkt) wird von geografisch (us/eu) auf Messart (Automat/Leser) aktualisiert; EU-Vantage-Vermerk ersetzt.
- Änderungsprotokoll-Eintrag, bilingual.

## 5. Teststrategie

- **Pipeline (pytest):** `capture_page`-Modus-Schalter wählt den richtigen Launch (automat=headless, leser=channel chrome) — ohne echten Netz-/Browserlauf (Launch-Argumente prüfen, Playwright gemockt). `assemble_run` schreibt `vantages.automat`/`leser` korrekt.
- **Site (vitest):** `data.ts`/`stats.ts` lesen `automat` und fallen auf `us` zurück (Abwärtskompat gegen ein reales Alt-Archiv-Fixture); die Differenz-Aggregation (Automat-blockiert vs. Leser-erreichbar) stimmt.
- **Bestand:** bestehende Beifang-/Register-Tests grün; `astro check` 0; Build erfolgreich; alte Archive bytegleich unverändert.

## 6. Akzeptanzkriterien

1. Ein lokaler `npm run beifang:leser` schreibt einen Leser-Snapshot mit echtem Chrome; Elsevier/Wiley/T&F sind darin erreichbar (nicht blockiert), SAGE bleibt blockiert.
2. Der wöchentliche Automat-Workflow läuft unverändert weiter und schreibt `vantages.automat`.
3. Die Seite zeigt beide Standpunkte + die Differenz als Leitbefund; alte Archive (mit `us`) werden abwärtskompatibel als Automat gelesen.
4. Methodenblatt: Rezept + ehrliche Rahmung + Machbarkeits-Erkenntnis, bilingual.
5. Kein Stealth/Anti-Detection im Code; SAGE nirgends umgangen.
6. Tests grün, `astro check` 0, Build ok, alte Archiv-JSONs unverändert.

## 7. Offen / bewusst verschoben

- Chrome headless-vs-headed für den Leser-Modus: erster Umsetzungsschritt (§4.2).
- Genaues Leser-Datei-Naming: im Plan.
- Panel-Umfang des Leser-Laufs (volles Panel vs. nur die Automat-Blocker): im Plan; Default volles Panel für konsistente Differenz.
- Erstes echtes Leser-Archiv committen: nach Franks Sichtung (Go-live-Gate wie gehabt).
