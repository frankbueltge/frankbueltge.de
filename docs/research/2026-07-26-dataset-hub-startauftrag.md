# Startauftrag: Dataset-Hub

Übergabe an eine eigene Session. Entstanden am 2026-07-26 aus dem Bau des Atlas-Scouts —
die Lehren daraus stehen unten und sind der Grund, warum dieser Auftrag so knapp und die
Reihenfolge so streng ist.

**Modell für die Architekturphase: Opus 5.** Der Bulk ist Rohrlegerarbeit ohne Modell, aber
die Identitätsfrage (unten) ist ein konzeptionell schweres Problem, bei dem eine falsche
Entscheidung erst nach Wochen auffällt.

---

## Prompt (so übergeben)

Wir bauen eine Datenbank öffentlich verfügbarer Datasets. Ziel ist Vollständigkeit im
Rahmen des Möglichen: der größte maschinenlesbare Nachweis öffentlich zugänglicher
Datensätze, den man mit vertretbarem Aufwand halten kann.

Sie hat zwei Nutzungen, und beide sind gleich wichtig:

1. **Hub für Forschende** — auffindbar, filterbar, zitierbar, über eine Oberfläche nach
   heutigen UX-Maßstäben.
2. **Abfragbare Grundlage für unsere research ecology** (drei maschinell betriebene
   Forschungspraktiken, siehe `frankbueltge.de/CLAUDE.md`). Statt bei jeder Frage neu zu
   recherchieren, wird abgefragt. Das heißt: eine stabile, versionierte API oder ein
   Snapshot-Format, das eine Pipeline nutzen kann, nicht nur ein Mensch im Browser.

Sie soll sich **fortlaufend selbst erweitern**: neu veröffentlichte Datasets werden
gefunden, geprüft und aufgenommen, ohne dass jemand sichtet.

### Beginne mit der Architektur, nicht mit Code

Vier Entscheidungen, in dieser Reihenfolge. Halte sie in einem Design-Dokument fest,
bevor die erste Zeile Pipeline entsteht.

**1. Dataset-Identität — die schwierigste Frage.** Dasselbe Dataset erscheint bei DataCite,
Zenodo, re3data und einem CKAN-Portal unter verschiedenen DOIs. Dazu: Versionen
(v1/v2/laufend), Mirrors, Aggregator-Einträge gegen Quell-Einträge, unterschiedliche
Granularität (Sammlung ↔ Einzeldatei ↔ API-Endpunkt). Was ist *ein* Eintrag? Wann sind
zwei Fundstellen dasselbe Ding, wann Varianten, wann verschiedene Dinge? Entscheide das
explizit und begründet — von dieser Setzung hängt alles andere ab.

**2. Was zählt als „öffentlich verfügbar".** Frei herunterladbar? Registrierungspflichtig?
Auf Antrag? Paywalled-mit-Metadaten? Ziehe die Grenze und schreibe sie in das Schema, statt
sie implizit zu lassen.

**3. Kataloge, nicht Recherche.** „Möglichst alle" heißt Kataloge abgrasen, nicht suchen.
Einstiegspunkte mit APIs: DataCite, re3data (~3.000 Forschungsdaten-Repositorien), Zenodo,
Figshare, Dryad, OpenAIRE, data.gov, EU Open Data Portal, data.gouv.fr, GovData, Kaggle,
HuggingFace Datasets, WorldBank, Eurostat, OECD, plus jede CKAN- und DKAN-Instanz (gleiche
API, hunderte Installationen). **Messe jede Quelle, bevor du einen Adapter baust** — siehe
Lehren unten.

**4. Schema und Zugang.** Ein Kerndatensatz (Identität, Titel, Urheber/Herausgeber, Zeitraum,
Räumlichkeit, Lizenz, Format, Zugangsweg, Aktualisierungsfrequenz, Herkunft der Angabe) plus
das Ausgabeformat: eine Abfrage-API für die Pipelines *und* eine Oberfläche für Menschen.
Beide aus derselben Quelle, nicht zwei Wahrheiten.

### Verbindliche Bauregeln

Sie stammen aus dem Atlas-Scout und haben sich dort teuer bewährt.

- **Nichts erfinden.** Fehlt eine Angabe, bleibt sie leer. Eine sichtbare Lücke ist besser
  als ein plausibler falscher Wert.
- **Identifier prüfen, nicht annehmen.** Jeder Eintrag trägt einen tatsächlich aufgelösten
  Zugriffsweg. Auflösen heißt: HTTP-Antwort geholt, nicht Muster geraten.
- **Nie URLs konstruieren.** Auch nicht aus Titel und Muster. Wörtlich aus der Quelle
  übernehmen.
- **Deterministisch, wo es geht.** Holen, normalisieren, deduplizieren, prüfen: Code.
  Modelle nur, wo wirklich Urteil nötig ist.
- **Kein API-Guthaben verfügbar.** Kein Skript darf eine Modell-API direkt aufrufen.
  Urteilsschritte laufen als Claude-Code-Routine unter dem Abo, nicht in der Pipeline. Ein
  Modellaufruf in einem Cron-Job auf fremder Infrastruktur braucht einen eigenen Schlüssel
  — das ist der Fehler, der beim Atlas-Scout einen halben Tag gekostet hat.
- **Automatische Aufnahme nur über harte Schranken**, und alles Aufgenommene sichtbar als
  ungeprüft markiert. Versionskontrolle ist die Rücknahme.
- **Verworfenes mitschreiben**, mit Grund. Das Verzeichnis der Ablehnungen ist über Monate
  eine Messung des Verfahrens gegen sich selbst.
- **Ausfälle vermerken, nie überbrücken.** Ein leeres Ergebnis darf nie wie „nichts
  gefunden" aussehen, wenn es „Quelle nicht erreichbar" heißt.

### Reihenfolge

1. Design-Dokument mit den vier Entscheidungen. Vorlegen, nicht gleich bauen.
2. Quellenmessung: pro Kandidat-Katalog die Trefferzahl, die Feldabdeckung und die
   Maschinenlesbarkeit **messen und protokollieren**. Erst danach Adapter.
3. Ein Adapter, eine Quelle, Ende zu Ende, mit Tests. Dann skalieren.
4. Aufnahme mit Schranken. Dann der nächtliche Lauf.
5. Oberfläche zuletzt — sie zeigt, was da ist, und bestimmt nicht, was aufgenommen wird.

### Offene Frage an Frank

Eigenes Repo (Vorschlag: `dataset-hub`) oder Teil eines bestehenden? Der Hub ist eher
Infrastruktur der Ökologie als ein Experiment des Labs — spricht für eigenes Repo mit
eigener Lizenz-Entscheidung.

---

## Lehren aus dem Atlas-Scout (2026-07-25/26)

Warum die Regeln oben so klingen:

- **Vier Quellen geprüft, zwei brauchbar.** Wikidata trug 1 von 25 gesuchten Werken,
  e-flux lieferte bei sechs gelesenen Meldungen null Treffer. Beide Adapter waren gebaut,
  bevor gemessen wurde — verlorene Arbeit.
- **Ein Suchdienst mit LLM-Antwortschicht erfand URLs** (zwei von fünf) und schrieb Werke
  falschen Urhebern zu. Als Renderer JS-lastiger Seiten war derselbe Dienst unverzichtbar.
  Dieselbe API, entgegengesetzter Wert — je nachdem, ob man um Fakten oder um Bytes bittet.
- **Volltextsuche ohne Domänenschranke ist bei Fachbegriffen wertlos.** „error" traf
  Genom-Assemblies.
- **Eine Konstante mit Gewicht macht jede Punktzahl konstant.** 325 Kandidaten lagen bei
  genau 1.000, Schwelle und Sortierung waren wirkungslos, und es fiel erst beim Nachrechnen
  auf.
- **Die Prüfschranke fing auch die eigene Bequemlichkeit** — drei aus Titeln geratene URLs,
  von mir, nicht von einem Modell.
