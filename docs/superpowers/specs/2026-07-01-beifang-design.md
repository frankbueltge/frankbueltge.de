# Spec — Gegenmessung-Instrument: „Der Beifang / The Bycatch"

**Status:** Entwurf zur Abnahme (Brainstorming mit Frank, 2026-07-01)
**Linie:** Gegenmessung / Counter-Measurement (`2026-06-22-gegenmessung-echo-design.md`)
**Anlass:** Fadeeva/Blume/Matuszkiewicz/Wrzesinski: *„Science Tracking über
Transformationsverträge und Wissenschaftsplattformen: Vom Beifang zum Hauptziel"*,
kommges 2024, <https://journals.sub.uni-hamburg.de/hup2/kommges/article/view/1643>

## 1. Einordnung in die Linie

Das Paper belegt per Dokumentenanalyse, dass die großen Wissenschaftsverlage AdTech-Tracking
auf ihren Plattformen betreiben und dies über die DEAL-Transformationsverträge
institutionalisiert ist — es **behauptet, aber misst nicht**. Genau diese Lücke füllt das
Instrument: Es macht die Behauptung empirisch, reproduzierbar und dauerhaft nachprüfbar.
Der Name stammt aus dem Untertitel des Papers: **Beifang** — was alles mitgefangen wird,
wenn man nur einen wissenschaftlichen Artikel lesen will.

„Der Beifang" tritt als zusätzliches Instrument in das Gegenmessung-Programm ein (aus
aktuellem Anlass; die vier programmatischen Instrumente der Linien-Spec bleiben unberührt).

**Avantgarde-Latte der Linie, eingelöst:**
- *Ableiten, nicht abbilden:* Die zentralen Artefakte sind Inferenzen — die **US/EU-Differenz**
  (was die DSGVO real verhindert) und der **Kontrollgruppen-Kontrast** (kommerziell vs.
  Diamond-OA), nicht ein gerenderter Datensatz.
- *Verbinden, was niemand verbindet:* Wissenschaftsverlage × AdTech-Forensik ×
  Mess-Standort. Der Quell-Join (Artikelseiten, Tracker-Listen, Entity-Daten, zwei
  Vantage-Points) existiert öffentlich nirgends als Zeitreihe.
- *Die Maschine findet die Frage:* Jeder Lauf berechnet den **Befund der Woche** — die
  größte Veränderung gegenüber dem Vorlauf (neuer Tracker, neue Firma, neue Blockade) wird
  automatisch gehoben und benannt.

## 2. Die Messfrage

*Wie viel Überwachung lädt eine wissenschaftliche Artikelseite — bei kommerziellen Verlagen
gegenüber Diamond-OA, aus US- gegenüber EU-Perspektive, vor jeder Einwilligung?*

Vier überprüfbare Teilbehauptungen:
1. Artikelseiten der Big-5-Verlage laden messbar Tracker Dritter (Pre-Consent).
2. Die Diamond-OA-Kontrollgruppe tut das nicht bzw. kaum.
3. Die im Paper genannten Datenhändler (LiveRamp, Xandr u. a.) sind **namentlich** nachweisbar.
4. Die Differenz US ↔ EU beziffert, was die DSGVO real verhindert — bzw. was ohne sie geschieht.

## 3. Panel (fest, versioniert)

`pipelines/beifang/src/beifang/data/panel.json`, committet, mit voller Provenienz je Eintrag
(URL, DOI, Verlag/Journal, Gruppe, Auswahlkriterium, Aufnahmedatum):

- **Verlagsgruppe:** 5 Verlage × 10 Artikelseiten — Elsevier (ScienceDirect),
  Springer Nature (SpringerLink/Nature), Wiley (Online Library), Taylor & Francis Online,
  SAGE Journals. Auswahl: jüngste frei zugängliche (OA-)Artikel der auflagenstärksten
  Journals je Verlag zum Aufnahmezeitpunkt; einmalig gewählt, Kriterium im Methodenblatt.
- **Kontrollgruppe:** 10 Diamond-OA-Journals (verlagsunabhängig, gebührenfrei) —
  **kommges gehört dazu**: Das Paper wird Teil der Kontrollgruppe seines eigenen Befunds.
- Panel-Änderungen (tote URLs, Ersatz) sind append-only dokumentiert (`panel-log`),
  nie stillschweigend; die Zeitreihe bleibt interpretierbar.

Ein festes Panel misst *diese* Seiten, nicht „den Verlag" — bewusste v1-Entscheidung
(saubere Zeitreihe vor Abdeckung); rotierende Zusatzstichprobe ist Ausbaustufe.

## 4. Messung

Wöchentlicher GitHub-Actions-Workflow (`.github/workflows/beifang.yml`, Montag nachts,
Muster wie protokoll/praemie/parallaxe), Pipeline `pipelines/beifang/` (Python 3.12,
eigene venv, Playwright/Headless-Chromium):

- Jede Panel-URL wird geladen, **keine Interaktion** (kein Consent-Klick, kein Scroll-Trigger),
  feste Wartezeit zum Nachladen; protokolliert werden alle Netzwerk-Requests
  (Host, Typ, Transfergröße) und alle gesetzten Cookies — der **Pre-Consent-Zustand**.
- **Zwei Blickwinkel:** (a) direkt vom GitHub-Runner (US-Rechenzentrum), (b) über einen
  SOCKS-Proxy auf dem geplanten EU-VPS (Umami-Server). Eine Pipeline, zwei Durchgänge;
  der Blickwinkel ist ein Config-Eintrag.
- **v1 startet nur mit (a).** Die EU-Spalte wird im Archiv und in der Darstellung als
  „Feststellung ausstehend (EU-Messpunkt nicht aufgebaut)" ausgewiesen — ehrlich sichtbar,
  nicht weggelassen — und nachgerüstet, sobald der VPS steht.
- Browser-Profil: Standard-Chromium wie ein realer Leser (kein deklarierter Bot-UA) —
  methodisch nötig, weil gemessen wird, was ein *Leser* ausgeliefert bekommt. Volumen ist
  minimal (~60 URLs/Woche/Blickwinkel), nur öffentliche Seiten, keine Paywall-Umgehung.

**Klassifikation:** Abgleich der Request-Hosts gegen **committete, versionierte Kopien**
von EasyPrivacy (Tracker-Erkennung) und DuckDuckGo Tracker Radar bzw. Disconnect-Entities
(Domain → Firma). Listen-Stand (Version/Abrufdatum) ist Teil jedes Snapshots; jede Messung
bleibt für immer aus dem Repo reproduzierbar. Listen-Updates erfolgen als sichtbare Commits.

## 5. Datenmodell

Archiv-Muster wie beim Protokoll — **Git ist das Archiv**:

- `src/content/beifang/<jahr>/<datum>.json`, committet als „Gegenmessung" (Workflow-Identität
  der Linie; git-CLI-Commit im Workflow-Step, Live-Muster aller Pipelines),
  unantastbar (nie editieren; Korrekturen nur an der Darstellung).
- Pro URL × Blickwinkel: Anzahl Drittanbieter-Hosts, erkannte Tracker-Hosts, zugeordnete
  Firmen (Entities), Cookie-Zahl (First-/Third-Party), Transfergröße gesamt/Dritte,
  HTTP-Status, `blocked`-Befund (s. § 6), Mess-Zeitstempel.
- Pro Lauf: Listen-Versionen, Runner-Kontext (Region soweit feststellbar), Panel-Version,
  **Befund der Woche** (größtes Delta zum Vorlauf, maschinell bestimmt).

## 6. Ehrlichkeitsregeln (Lab-Ethik, verbindlich)

- **Bot-Blockade ist ein Befund, kein Fehler.** Sperrt ein Verlag den Headless-Browser aus
  (Cloudflare-Challenge, 403, PerimeterX), steht im Archiv „Verlag verweigert die Messung"
  mit Blockade-Typ — und die Darstellung zeigt es als eigenen Datenpunkt. Nichts wird
  umgangen, um die Blockade auszutricksen.
- EU-Proxy nicht erreichbar → „Feststellung entfällt" für die EU-Spalte des Laufs.
  Kein stilles Überbrücken, **kein Backfill** vergangener Läufe.
- **Ausgewiesene Grenze (Methodenblatt):** Gemessen wird die öffentliche Artikelseite aus
  Rechenzentrums-IPs — nicht der institutionelle Zugriff (Uni-Netz, Shibboleth/SeamlessAccess),
  wo laut Paper zusätzliches Tracking stattfindet. Das Instrument misst die **Untergrenze**.
- Keine Secrets im Archiv; Fehlermeldungen redigieren Query-Strings (bestehende Regel).

## 7. Darstellung

Bilingual, Segment identisch: `/beifang` (EN Root) und `/de/beifang`; Werke-Eintrag analog
The Consensus (`/werke/…` + `/de/werke/…`). Statisch aus committeten JSONs — die Seite
selbst lädt **null Drittanbieter-Requests**; dieser Satz steht prüfbar im Seitentext.

Kernelemente:
1. **Kontrollgruppen-Kontrast** als Leitgrafik: Tracker-Median Verlagsgruppe vs. Diamond-OA.
2. **Zeitreihe** pro Verlag (Median Tracker-Hosts, US vs. EU sobald vorhanden).
3. **Firmen-Tafel:** „LiveRamp: präsent auf X von 50 Verlagsseiten, 0 von 10 Kontrollseiten" —
   die namentliche Verifikation der Paper-Akteure.
4. **Befund der Woche** (maschinell gehoben, § 1).
5. **Methodenblatt** (Pflicht, Werkgruppen-Spec § 3.5): Quellen, Listen-Versionen,
   Panel-Kriterien, Grenzen (§ 6), Compute-Fußabdruck (Job-Laufzeit/Monat).

Visualisierung nach `2026-06-20-visualisierungs-standard-design.md`; Wortlaut/Rahmung nach
`2026-06-20-ehrliche-umrahmung-design.md` (Experiment, kein Kunst-Anspruch).

## 8. Pipeline-Struktur & Tests

```
pipelines/beifang/
  src/beifang/
    data/panel.json   # das Panel (§ 3) — package-data, wandert mit der Installation
    data/lists/       # committete EasyPrivacy-/Entity-Listen (versioniert)
    capture.py        # Playwright-Lauf: URL → Request-/Cookie-Protokoll
    classify.py       # Host-Matching (EasyPrivacy) + Entity-Zuordnung
    assemble.py       # Lauf-Snapshot bauen, Befund der Woche, Vergleich Vorlauf
    run.py            # CLI; panel.py/lists_fetch.py = Einmal-Werkzeuge für Panel/Listen
  tests/              # pytest; Fixtures = aufgezeichnete Request-Protokolle
```

Committen übernimmt der Workflow-Step (git-CLI); Panel & Listen liegen als package-data
unter `src/beifang/data/`.

- `classify.py` und `assemble.py` sind reine Funktionen über aufgezeichneten Fixtures —
  vollständig unit-getestet, kein Netz in Tests. `capture.py` wird gegen eine lokale
  Test-Seite mit bekannten Fake-Trackern integrationsgetestet.
- Adapter erfinden nichts: kein Match ⇒ „unklassifiziert", nie geraten.
- TDD wie im Rest des Repos; Site-Rendering über `npm run test` (Vitest) mit abgedeckt,
  sofern Renderer-Logik entsteht.

## 9. Verhältnismäßigkeit & Kosten

Wöchentlich ~60 Seitenaufrufe je Blickwinkel, ein Actions-Job von wenigen Minuten,
keine neuen Cloud-Dienste (EU-Messpunkt reitet auf dem ohnehin geplanten Umami-VPS mit).
Compute-Fußabdruck wird im Methodenblatt beziffert. Reduktion ist die Position: keine
Live-Abfragen zur Laufzeit der Seite, kein eigener Scan-Cluster, kein Maximalismus.

## 10. Ausdrücklich nicht in v1 (Ausbaustufen)

- Fingerprinting-Instrumentierung (Canvas-/Audio-API-Hooks), CNAME-Cloaking-Erkennung.
- Rotierende Zusatzstichprobe (Crossref) neben dem festen Panel.
- Post-Consent-Messung (Accept/Reject als dritter/vierter Zustand).
- Institutioneller Vantage-Point (Uni-Netz) — praktisch wie ethisch eigenes Kapitel.

## 11. Entschiedene Fragen (Brainstorming 2026-07-01)

| Frage | Entscheidung |
|---|---|
| Zugang | Tracker-Zensus (statt DSGVO-Selbstversuch / Vertrags-Korpus) |
| Stichprobe | Festes Panel (Zeitreihe vor Abdeckung) |
| Messpunkt | Beide Perspektiven US + EU, Pre-Consent; v1 nur US, EU-Spalte „ausstehend" |
| Panel-Scope | Big 5 (nicht nur DEAL-3) + 10 Diamond-OA als Kontrolle |
| Messtiefe | Zensus + Entity-Mapping (Forensik-Tiefe = v2) |
| Takt | Wöchentlich (Montag nachts) |
| Name | „Der Beifang / The Bycatch" |
