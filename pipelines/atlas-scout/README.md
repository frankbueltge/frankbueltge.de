# Atlas-Scout

Sucht nachts Quellen ab, legt Kandidaten vor und nimmt sie im **Werke-Atlas** automatisch
auf. Der **Theorie-Atlas** bekommt nur Vorschläge — er wird im Ulysses-Repo geführt und
dort aufgenommen.

Genau ein Modul darf in `werke.json` schreiben (`aufnahme.py`); `tests/test_grenze.py`
erzwingt das über den Syntaxbaum. In `atlas.json` schreibt nichts.

**Der Lauf braucht kein Modell und keinen Schlüssel.** Alle Quellen sind schlüsselfrei,
alle Schritte deterministisch. Wo Urteil nötig ist (Prosa lesen), übernimmt das eine
getrennte Claude-Code-Routine unter dem Abo — nicht die Pipeline. Module, die selbst eine
Modell-API aufrufen, gehören nicht hierher; zwei solche wurden am 2026-07-26 entfernt.

## Warum

Das Atlas-README des Ateliers benennt den Zweck: eine geschlossene Selbsttrainings-Schleife
kollabiert, wenn keine Punkte aus einer anderen Verteilung nachkommen. Der Atlas ist diese
andere Verteilung — und wird nur dann eine, wenn ihn jemand erweitert.

## Der Lauf

```
ernten  →  abgleichen  →  bewerten  →  prüfen  →  vorlegen  →  aufnehmen
```

1. **Ernten** — je Quelle ein Adapter (siehe unten).
2. **Abgleichen** — gegen DOI, URL und normierten Titel des Bestands.
3. **Bewerten** — `score.py`; alles unter `SCHWELLE` fällt raus.
4. **Prüfen** — der Identifier wird tatsächlich aufgelöst. Das ist die Aufnahmeregel des
   Atlas („verified, retrievable identifier"), vorgezogen auf den Scout. Erst hier, weil es
   der teuerste Schritt ist.
5. **Vorlegen** — `kandidaten/<atlas>/YYYY-MM-DD*.json`.
6. **Aufnehmen** — nur Werke-Atlas, nur über harte Schranken, markiert als
   `verify_status: "toVerify"`. Die Karte zeigt solche Einträge mit „?", Git nimmt zurück.

Verworfenes wird **mitgeschrieben**, nicht weggeworfen: mit Grund und Herkunft. Das
Verzeichnis der Ablehnungen ist über die Monate eine Messung von Maschinenvorschlag gegen
menschliches Urteil. Quellenausfälle stehen als `ausfaelle` im Lauf und werden nie
überbrückt.

## Betriebsarten

| Art | Atlas | Quelle | Aufruf |
|---|---|---|---|
| **Nachbarschaft** | Theorie | OpenAlex | `--atlas theorie --anzahl 10 --versatz N` |
| **Thematischer Sweep** | Theorie | OpenAlex | `--atlas theorie --thema 10` |
| **Werke zu einem Feld** | Werke | Rhizome ArtBase | `--atlas werke --thema 13` |
| **Datenphysikalisierung** | Werke | dataphys.org | `--atlas werke --quelle dataphys` |
| **Gegenwartswerke** | Werke | S+T+ARTS Prize | `--atlas werke --quelle starts` |
| **Externe Funde** | Werke | beliebig | `python -m atlas_scout.extern funde.json` |
| **Aufnahme** | Werke | — | `python -m atlas_scout.aufnahme --hoechstzahl 30` |

```bash
cd pipelines/atlas-scout
python3 -m venv .venv && .venv/bin/pip install -e ".[dev]"
cd pipelines/atlas-scout && .venv/bin/python -m pytest -q
```

Aufrufe aus dem Repo-Wurzelverzeichnis mit `./pipelines/atlas-scout/.venv/bin/python`.

### Thematischer Sweep

Die Nachbarschaftssuche wächst nur aus dem, was schon im Atlas steht — sie kann per
Konstruktion kein neues Feld eröffnen. Der Sweep sucht direkt.

Ohne Domänenschranke ist er unbrauchbar: OpenAlex' Volltextsuche traf bei „error"
Genom-Assemblies und RMSE-Metriken. Die Suche läuft darum nur in **Arts & Humanities
(fields/12)** und **Social Sciences (fields/33)** und nur über Titel und Abstract.

Feldnummern und Abfragen stehen in `themen.py`. Sie sind bindend, weil sie so in
`AtlasPage.astro` stehen und als `clusters` im Werke-Atlas landen; der Abgleich zwischen
beiden steht unter Testschutz.

### Externe Funde (`extern.py`)

Für Quellen, die die Pipeline nicht selbst erreicht — eine Handrecherche, ein Suchdienst
am MCP-Anschluss. Eine JSON-Liste durchläuft Abgleich, Prüfung und Bewertung wie jeder
andere Kandidat:

```json
[{"titel": "…", "urheber": "…", "jahr": 2025, "url": "https://…", "feld": 13,
  "quelle": "dataphys", "ort": "…", "medium_class": "physical", "form": "…",
  "notiz": "unbearbeiteter Quelltext"}]
```

`jahr` darf null sein — dann fällt der Fund bei der Aufnahme durch. Das ist gewollt.

## Quellenmessung (2026-07-25/26)

Vier Quellen geprüft, zwei tragfähig. Die Messungen bleiben hier stehen, damit sie nicht
noch einmal gemacht werden müssen — und damit auffällt, wenn sich etwas ändert.

| Quelle | Befund | Stand |
|---|---|---|
| **Rhizome ArtBase** | 3.845 Einträge, Wikibase, aktiv gepflegt, schlüsselfrei. Kuratierte Werkeinträge mit Titel, Urheber, Jahr | **im Einsatz** |
| **dataphys.org** | 431 kuratierte Einträge zu Datenphysikalisierung, 343 ab 1980, Kategorien als CSS-Klassen | **im Einsatz** |
| Wikidata | 9 von 25 Urhebern gefunden, **1 von 25** mit erfassten Werken. Trägt zeitgenössische Medienkunst nicht | verworfen |
| e-flux | Nur 15 Meldungen erreichbar (`?page=` und `?search=` werden ignoriert, Liste ist JS-gesteuert). Von sechs gelesenen Meldungen enthielt **keine** ein Werk für den Atlas | verworfen |
| Tavily | Läuft, aber schlüsselfrei auf ~1 Suche/Stunde gedeckelt. Die Antwortgenerierung **erfindet**: von fünf Werkangaben zwei URLs frei erfunden, eine Zuschreibung falsch | nur zum Finden von Quellen |
| **S+T+ARTS Prize** | JS-gerendert — Tavilys Extract rendert, danach fester Aufbau (`* ## [Titel](URL) / ## Urheber (LAND)`), per Parser lesbar. Braucht `TAVILY_API_KEY`, aber kein Modell | **im Einsatz** |

### Abdeckungsgrenzen

- **ArtBase** endet um 2012 (Netzkunst-Schwerpunkt 1999–2010er).
- **dataphys** ist historisch geprägt und nennt den Urheber nur in der Prosa, nicht als
  Feld. Der Adapter lässt ihn deshalb leer; die Aufnahme weist solche Kandidaten ab
  („kein Urheber"). Sie warten, bis eine Routine die Prosa liest.
- **S+T+ARTS** schließt die Gegenwartslücke, liefert aber keine Feldzuordnung — welches
  Feld ein Werk trägt, steht in keiner Jurybeschreibung als Angabe. Die Kandidaten warten
  wie die dataphys-Einträge auf den Urteilsschritt.
- Das Jahr bei S+T+ARTS ist das **Auszeichnungsjahr**, nicht zwingend das Entstehungsjahr.
  Es steht deshalb auch im `venue_prize` („S+T+ARTS Prize 2026"), damit der Eintrag nicht
  mehr behauptet, als er trägt.

## Grenzen

- Der Scout urteilt nicht über Qualität. `score.py` misst Rezeption, Aktualität,
  Zugänglichkeit, Begriffsnähe, Vollständigkeit — nichts davon ist ein Argument für die
  Aufnahme.
- Die Gewichtung in `score.py::gewichte()` ist eine Setzung, inzwischen dreifach
  (Literatur, Extraktion, kuratierte Sammlung). Sie bestimmt, was nach oben gespült wird,
  und damit auch, wogegen der Atlas mit der Zeit blind wird.
- Die Identifier-Prüfung sagt, dass ein Ziel antwortet — **nicht**, dass Titel, Urheber und
  Jahr dazu stimmen. Gegen erfundene Domains hilft sie, gegen Fehlzuschreibung nicht. Das
  ist die Grenze jeder deterministischen Prüfung von Modellausgabe.
- Ein falsch aufgelöstes Saatgut wäre schlimmer als keines: die OpenAlex-Titelsuche muss
  zusätzlich im Autor passen (`_autor_passt`). Ohne diese Prüfung schlug der Lauf am
  2026-07-25 Meteorologie-Datensätze vor, weil Schwabs „Experimental Systems" ein fremdes
  Paper getroffen hatte.
- **URLs nie aus Titeln konstruieren.** Beim Einspeisen gelesener Funde sind so am
  2026-07-26 drei erfundene URLs entstanden — die Prüfschranke hat sie abgewiesen, aber es
  kostet einen Lauf. `url`, `titel` und `jahr` wörtlich aus dem Kandidatensatz übernehmen.

## Nachtläufe

```
05:00 UTC  .github/workflows/atlas-scout.yml   Suchen, prüfen, aufnehmen (kein Modell)
06:00 UTC  Claude-Code-Routine                 Urheber lesen, Felder zuordnen
```

Zwei Lücken füllt nur der zweite Lauf, weil sie Urteil brauchen: der Urheber bei
dataphys (steht nur in der Prosa) und die Feldzuordnung bei S+T+ARTS (steht nirgends).
Beide Male weist die Aufnahme unvollständige Kandidaten ab, statt zu raten.

Der zweite Lauf ist eine Routine auf claude.ai, kein Repo-Artefakt — er braucht Urteil und
läuft deshalb unter dem Abo, nicht in Actions. Actions kennt das Abo nicht; jeder
Modellaufruf dort bräuchte einen eigenen Schlüssel.
