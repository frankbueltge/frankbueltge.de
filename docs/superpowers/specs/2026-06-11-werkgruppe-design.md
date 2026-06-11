# Werkgruppe „Die Akte der Gegenwart" — Design

**Datum:** 2026-06-11
**Status:** Entwurf zur Review
**Geltungsbereich:** frankbueltge.de — fünf neue Datenkunstwerke (ein Monument, vier Satelliten)

---

## 1. Kontext & Ziel

frankbueltge.de wird von einer Portfolio-Site mit Lab-Notizen zu einem Gesamtkunstwerk ausgebaut: eine wachsende, versionierte Akte der Gegenwart an der Schnittstelle von Kunst, Wissenschaft und Philosophie. Grundlage ist eine Recherche zu Data Art & Artistic Research 2021–2026 (Spektakel-Kritik um Refik Anadol, forensisches Register von Forensic Architecture, Permacomputing, Data Sonification, transmediale-2025-Diskurs).

**Haltung:** kalt-forensische Präzision mit philosophischer Tiefe. Keine Parolen, keine Effekte — die Daten selbst sind die Aussage. Investigative, existenzielle und humanistische Register sind zugelassen, dominieren aber nicht.

**Explizit verworfen:** die bisherigen Ideen (Séance/„Was die Seite sieht", Carbon-Badge, Wikipedia-Seismograph als Riff auf „Listen to Wikipedia", Site-Selbstanatomie). Diagnose: zu selbstbezogen, zu derivativ, zu klein, falsches Register.

## 2. Substanz-Kriterien (Gate für jedes Werk)

Jedes Werk — auch jedes künftige — muss alle fünf Kriterien erfüllen:

1. **Echte Daten mit offener Provenienz** — Quelle, Lizenz, Abrufzeitpunkt, Methode sichtbar.
2. **Eine Frage, kein Effekt** — das Werk erhebt eine überprüfbare Behauptung über die Welt.
3. **Infrastruktur als Teil der Aussage** — was das Werk verbraucht, speichert, verweigert, ist ausgewiesen.
4. **Konsequenz / Leave-behind** — offener Code, offene Datensätze, dokumentierte Methode.
5. **Verhältnismäßigkeit** — keine Maximalist-Tech-Ästhetik; Reduktion ist die Position.

**Leitsatz der Werkgruppe: Messinstrumente statt Visualisierungen.** Ein Dashboard zeigt Daten; ein Messinstrument erhebt eine Behauptung und macht sie überprüfbar.

## 3. Gesamtarchitektur

### 3.1 Routing & Hierarchie

- `/werke` (EN: `/en/werke` — Segment bleibt in beiden Sprachen gleich, konsistent mit `/lab`): Werkverzeichnis mit fünf Einträgen, je Werk eine Seite unter `/werke/<name>` inkl. Methodenblatt.
- `/protokoll`: das aktuelle Tagesprotokoll (Wirbelsäule der Gruppe), `/protokoll/<datum>` pro Tag, `/protokoll/archiv` als Index.
- `/lab` bleibt unverändert: Engineering-Notizen. Klare Fallhöhe zwischen Notiz und Werk.
- Alles zweisprachig DE/EN ab Tag eins (bestehendes i18n-Muster: Astro-i18n, de default, `/en/`-Präfix).

### 3.2 Git als Archiv (unverhandelbar)

Die Site bleibt statisch (Astro 5, bestehender Build). Pipelines schreiben **keine** Live-Datenbank, aus der die Seite liest, sondern **committen versionierte Snapshots ins Repo** (GitHub API → Pages-Rebuild). Jeder Zustand der Site ist für immer aus dem Repo reproduzierbar; die Provenienz-Behauptung ist in der Infrastruktur eingelöst.

- Ausnahme-los: kein dynamisches Lesen aus Cloud-Diensten zur Laufzeit der Seite.
- Client-seitige Echtzeit (z. B. Überflug-Propagation) rechnet im Browser auf committeten Daten.

### 3.3 Maschinenraum: GCP

| Schicht | Dienst | Zweck |
|---|---|---|
| Orchestrierung | Cloud Scheduler → Cloud Run Jobs (Python) | nächtliche/periodische Pipelines, ein Job-Typ für alle Werke |
| Lager | BigQuery (Dataset `werke`) | Rohdaten-Puffer, Historie, Zugriff auf Public Datasets (GDELT, Wikipedia Pageviews, Google Trends) |
| Transformation | dbt (`pipelines/dbt/`) | versionierte Modelle; **dbt-Docs/Lineage öffentlich verlinkt** — Methodenblatt zeigt echte Provenienz |
| Embeddings | Vertex AI (multilingual) | Parallaxe |
| Secrets | Secret Manager | GitHub-Token (Commit-Identität „Protokollführung"), API-Keys |
| Endpunkt | GitHub API Commit → Cloudflare/Pages-Rebuild | einziger Schreibweg zur Site |

**Kostendisziplin als Teil der Forensik:** Partition-Filter Pflicht bei GDELT-Queries, monatlicher Budget-Alert (Richtwert 10 €/Monat), und jedes Methodenblatt **beziffert den Compute-Fußabdruck** (Job-Laufzeit, verarbeitete BQ-Bytes/Monat).

**Zukunftsoption (notiert, nicht eingeplant):** Google Earth Engine für planetare Analysen.

### 3.4 Fehler als Form

Pipelines erfinden nichts und brechen nicht still:

- Quelle nicht erreichbar (nach 3× Retry/Backoff): amtlicher Vermerk *„Quelle nicht erreichbar — Feststellung entfällt."*
- Wert außerhalb des Plausibilitätskorridors: *„Feststellung unter Vorbehalt"* mit Begründungscode.

Messausfall ist Teil des Werks, nie stille Lücke.

### 3.5 Methodenblatt (Pflichtkomponente je Werk)

Standardisiertes Schema, gemeinsame Astro-Komponente:

1. Quellen + Lizenzen
2. Abrufkadenz (ehrlich: monatliche Quellen behaupten keine Tagesfrische)
3. Verarbeitung (Link auf Code + dbt-Lineage)
4. Grenzen der Methode (explizit, prominent)
5. Compute-Fußabdruck
6. Änderungsprotokoll (Template-/Methodenversionen)

## 4. Werk ① „Das Protokoll" — *Die Sitzung der Welt ist eröffnet* (Monument)

**These:** Die Welt ist eine Dauersitzung ohne Vorsitz, und niemand schreibt mit. Dieses Werk schreibt mit.

**Form:** Jede Nacht verfasst die Pipeline das Sitzungsprotokoll des Planeten in präzisem Protokolldeutsch. Fester Rahmen:

- **Kopf:** „Protokoll der Sitzung vom 11. Juni 2026. Anwesend: ca. 8,23 Mrd. (Schätzung). Vorsitz: unbesetzt. Beschlussfähigkeit: nicht festgestellt."
- **TOPs:** Feststellung → Quelle mit Abrufzeitpunkt → „Aussprache: keine." → **„Beschluss: vertagt."**
- **Schluss:** „Die Sitzung wurde nicht geschlossen. Nächste Sitzung: morgen."

Protokolle akkumulieren über Jahre. Git ist das Archiv (ein Commit pro Tag). Jahresband als Druckedition = ausstellbares Objekt (Phase 2).

### 4.1 Tagesordnung (Quellenkatalog v1, 12 ständige TOPs)

| # | TOP | Feststellung | Quelle | Kadenz |
|---|---|---|---|---|
| 1 | Atmosphäre | CO₂-Konzentration | NOAA GML Mauna Loa (CSV) | täglich |
| 2 | Meereis | Ausdehnung Arktis/Antarktis | NSIDC Sea Ice Index | täglich |
| 3 | Ozean | SST-Anomalie global | NOAA OISST (Adapter-Detail im Teilprojekt-Spec) | täglich |
| 4 | Feuer | Aktive Brände weltweit | NASA FIRMS (freier Key) | täglich |
| 5 | Erdbewegung | Beben ≥ M4,5, letzte 24 h | USGS GeoJSON-Feed | Echtzeit |
| 6 | Anwesenheit | Weltbevölkerung (speist auch die „Anwesend"-Zeile im Kopf) | UN WPP, Extrapolation — als Schätzung ausgewiesen | berechnet |
| 7 | Vertreibung | Menschen auf der Flucht | UNHCR Refugee Data Finder | periodisch |
| 8 | Ernährung | Nahrungsmittelpreisindex | FAO FPI (CSV) | monatlich |
| 9 | Geldpreis | €STR / Leitzins | EZB-Datenportal-API | täglich |
| 10 | Energie | Ölpreis Brent | EIA-API (freier Key) | täglich |
| 11 | Konflikt | Konfliktereignisse, letzte 24 h | GDELT via BigQuery Public Dataset | täglich |
| 12 | Aufmerksamkeit | Meistgelesener Wikipedia-Artikel des Tages | Wikimedia Pageviews API | täglich |

Katalog ist erweiterbar; jede Änderung wird im Methodenblatt-Änderungsprotokoll vermerkt.

### 4.2 Register-Regeln (künstlerischer Kern)

- **Vollständig deterministisch aus Templates — kein LLM.** Jeder Satz folgt mechanisch aus Daten. Glaubwürdigkeit ist nicht verhandelbar.
- Regelbasierte Variation, eng begrenzt: Vergleichssätze (Vortag/Vorjahr), Rekordvermerk („Höchster Stand seit Beginn der Aufzeichnung").
- Deutsche Zahlenformatierung; Präzisionsregeln pro Quelle.
- Englische Fassung im selben Register („minutes English"), parallel generiert.
- Register-Templates sind versioniert; jede gerenderte Seite weist die Templateversion aus.

### 4.3 Datenmodell: JSON kanonisch, Prosa ist Darstellung

Pro Tag committet die Pipeline `src/content/protokoll/<jahr>/<datum>.json`:

```
{ date, generated_at, schema_version, pipeline_version, entries: [
    { top_id, status: "ok" | "unavailable" | "implausible",
      value, unit, as_of, comparison?, label?, record, note?,
      source: { name, url, license }, retrieved_at, cadence } ] }
```

(Die Registerfassung/`TEMPLATE_VERSION` lebt bewusst im Frontend-Renderer, nicht im JSON —
Prosa ist Darstellung; das JSON bleibt darstellungsfrei.)

Astro rendert die Prosa zur Buildzeit aus JSON + Templates. Das Archiv bleibt in den Daten unantastbar, in der Form korrigierbar. Die Druckedition friert Prosa zum Druckzeitpunkt ein.

### 4.4 Pipeline

Cloud Run Job, Cron 03:30 UTC: pro Quelle ein Adapter (Fetch, 3× Retry/Backoff) → Validierung (Schema, Plausibilitätskorridor, Staleness-Limit) → Tages-JSON → Commit via GitHub API, Autor „Protokollführung", Message `protokoll: Sitzung vom YYYY-MM-DD` → Rebuild.

### 4.5 Frontend & Verbreitung

- Routen wie 3.1; Dokumenten-Typografie in Mono-Ästhetik; Print-Stylesheet ab Tag eins.
- **RSS-Feed** (`/protokoll/feed.xml`, EN-Pendant): das Weltprotokoll täglich im Feedreader.
- Methodenblatt unter `/werke/protokoll`.

### 4.6 Tests

Adapter-Tests mit Fixtures, Validierungs-Gates, Template-Snapshot-Tests (DE+EN), lokaler Trockenlauf `npm run protokoll:dry` (rendert heute, committet nichts). Muster: bestehende `climate.ts`-Tests.

### 4.7 Risiken

Quelleninstabilität (Adapter isolieren Ausfälle als Form, s. 3.4); Registerqualität erfordert redaktionelle Feinarbeit; tägliche Builds (bei Pages-Limits unkritisch: 1 Build/Tag).

## 5. Werk ② „Überflug" — *Der Himmel führt Buch* (Satellit)

**These:** Das planetare Panoptikum ist real, kartiert und auf die Sekunde berechenbar.

- **Rein client-seitig, kein Backend.** Täglicher Pipeline-Commit des TLE-Katalogs (CelesTrak) + Eigentümer-Klassifikation (UCS Satellite Database: kommerziell/staatlich-zivil/militärisch; Lizenz im Teilprojekt prüfen).
- Browser: SGP4-Propagation (satellite.js). Standort nur mit Einwilligung; Fallback grob (Stadtebene). **Nichts wird gespeichert oder gesendet — alles rechnet lokal.** Diese Verweigerung steht im Methodenblatt.
- Anzeige als Buchführung: Überflüge heute (Zählung, Eigentümer, Apparat), „jetzt im Sichtfeld".
- **Methodische Ehrlichkeit:** Überflug ≠ Aufnahme. Behauptet wird „Sichtkontakt möglich" (Footprint-Geometrie), nie „du wurdest fotografiert".

## 6. Werk ③ „Halbwertszeit" — *Über den Zerfall der Anteilnahme* (Satellit)

**These:** Anteilnahme zerfällt exponentiell — die Zerfallskonstante ist messbar.

- Kuratiertes Ereignisregister (Katastrophen mit Onset-Datum), versioniert im Repo; Kurationsregeln im Teilprojekt-Spec.
- Nächtlicher Job: parametrisiertes SQL gegen GDELT + Wikipedia-Pageviews (BigQuery Public Datasets) → Exponentialfit (λ, Halbwertszeit) je Ereignis in Python → Kurven-JSON committet. Transformationen als dbt-Modelle.
- Darstellung: live zerfallende Aufmerksamkeitskurven neben physikalischen Halbwertszeiten (Cs-137: 30,1 a; Mikroplastik; CO₂-Verweildauer).
- **Ethik-Regel:** Sortierung nach Datum, nie Ranking nach λ. Wir messen den Zerfall der Anteilnahme, wir veranstalten kein Opfer-Ranking. Würdevolle, nüchterne Darstellung der Ereignisse.

## 7. Werk ④ „Parallaxe" — *Der messbare Abstand zwischen den Wahrheiten* (Satellit)

**These:** Es gibt nicht eine Beschreibung der Welt, sondern viele — ihr Abstand wächst messbar.

- Kuratierte, versionierte Themenliste umkämpfter Wikipedia-Artikel (redaktionelle Entscheidung, dokumentiert).
- Nächtlicher Job: Artikel-Extrakte × 6–8 Sprachversionen (Wikipedia REST) → Vertex-AI-Embeddings (multilingual) → Divergenzmatrix (Kosinusdistanz) als committete Zeitreihe; ergänzend Edit-Aktivität je Sprachversion.
- Darstellung: Abstandskurven pro Thema und Sprachpaar über Zeit.
- **Methodengrenze prominent:** Embedding-Distanz misst semantische Differenz der Beschreibungen, nicht „Wahrheitsferne". Steht auf dem Methodenblatt, nicht im Kleingedruckten.

## 8. Werk ⑤ „Prämie" — *Was die Apokalypse kostet* (Satellit, Phase 5)

**These:** Der Markt hat die Klimadebatte beendet — mit Preisen.

- Quartalsweise kuratierter Datensatz aus öffentlichen Quellen: GDV-Naturgefahrenreport, Munich-Re-/Swiss-Re-Schadensberichte, öffentlich verfügbare Cat-Bond-Marktdaten.
- Halb Pipeline, halb Redaktion — bewusst keine Echtzeit-Behauptung. Investigativstes Register der Gruppe.
- **Hauptrisiko:** Datenzugang (Paywalls, Lizenz). Wird im eigenen Spec-Zyklus geklärt; Konzept kann dort nachgeschärft werden.

## 9. Gesamtkunstwerk-Klammer

Das Protokoll ist die Wirbelsäule. Satelliten liefern „Anlagen" zum Tagesprotokoll (*„Anlage 2 zum Protokoll vom 11.06.2026: Parallaxe-Messung"*) — per stabiler ID verlinkt, sobald das jeweilige Werk live ist. Die Site wird formal eine einzige wachsende Akte. Der bestehende Hero (GISTEMP-Puls) bleibt als Vorzeichen erhalten.

## 10. Bauphasen

Jedes Teilprojekt durchläuft eigenen Zyklus (Spec → Plan → Umsetzung → Review):

1. **Protokoll-Kern** (MVP: 12 TOPs, nächtlicher Lauf, Archiv, RSS, Methodenblatt, DE/EN)
2. **Überflug** (schnellster Wow, null Backend)
3. **Halbwertszeit** (BigQuery-Schaustück)
4. **Parallaxe** (Embeddings)
5. **Prämie** (Datenzugang klären)
- Später: Protokoll-Druckedition (Jahresband), Earth-Engine-Option.

## 11. Nicht-Ziele

- Kein LLM-generierter Werktext (deterministische Templates only).
- Kein dynamisches Lesen aus Cloud-Diensten zur Laufzeit der Site.
- Kein WebGL-/Glow-Spektakel; Mono-Ästhetik bleibt fix, Skin-System bleibt stillgelegt.
- Séance bleibt unveröffentlicht (`feat/seance` bleibt als Branch bestehen, wird nicht gemergt).
- Keine NFTs, keine Monetarisierung, keine Kommentare/Social-Features.

## 12. Offene Punkte (je Teilprojekt-Spec zu klären)

- Protokoll: exakter OISST-Adapter; finale Präzisions-/Formatierungsregeln je TOP.
- Überflug: UCS-Datenbank-Lizenz; Umfang der kuratierten Satellitenliste.
- Halbwertszeit: Kurationsregeln des Ereignisregisters; Fit-Verfahren (einfacher Exponentialfit vs. Alternativen).
- Parallaxe: initiale Themenliste; Embedding-Modellwahl und Versionierungsstrategie bei Modellwechsel.
- Prämie: Quellen-/Lizenzlage.
