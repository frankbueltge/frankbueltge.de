# Atlas-Scout

Sucht nachts die Nachbarschaft bestehender Atlas-Einträge ab und **legt Kandidaten vor**.
Er nimmt nichts auf. `atlas.json` und `werke.json` werden ausschließlich lesend geöffnet;
eine AST-Prüfung in `tests/test_grenze.py` erzwingt das, damit die Zusage nicht bloß in
dieser Datei steht.

## Warum

Das Atlas-README des Ateliers benennt den Zweck: eine geschlossene Selbsttrainings-Schleife
kollabiert, wenn keine Punkte aus einer anderen Verteilung nachkommen. Der Atlas ist diese
andere Verteilung — und wird nur dann eine, wenn ihn jemand erweitert. Bisher geschieht das
in Sessions, also unregelmäßig und nur dort, wo die Aufmerksamkeit ohnehin schon war.

## Was der Lauf tut

```
ernten  →  abgleichen  →  bewerten  →  prüfen  →  vorlegen
```

1. **Ernten** — Zitationsnachbarschaft des Saatgut-Eintrags (OpenAlex, schlüsselfrei).
2. **Abgleichen** — gegen DOI, URL und normierten Titel des Bestands.
3. **Bewerten** — `score.py`; alles unter `SCHWELLE` fällt raus.
4. **Prüfen** — der Identifier wird tatsächlich aufgelöst. Das ist die Aufnahmeregel des
   Atlas („verified, retrievable identifier"), vorgezogen auf den Scout. Erst hier, weil es
   der teuerste Schritt ist.
5. **Vorlegen** — eine Kandidatendatei unter `kandidaten/<atlas>/YYYY-MM-DD.json`.

Verworfenes wird **mitgeschrieben**, nicht weggeworfen: mit Grund und Herkunft. Das
Verzeichnis der Ablehnungen ist über die Monate eine Messung von Maschinenvorschlag gegen
menschliches Urteil — im selben Format, nachprüfbar.

Quellenausfälle stehen als `ausfaelle` im Lauf. Sie werden nie überbrückt.

## Betrieb

```bash
cd pipelines/atlas-scout
python3 -m venv .venv && .venv/bin/pip install -e ".[dev]"

# aus dem Repo-Wurzelverzeichnis:
./pipelines/atlas-scout/.venv/bin/python -m atlas_scout.run --atlas theorie --anzahl 10
./pipelines/atlas-scout/.venv/bin/python -m atlas_scout.run --atlas theorie --trocken

cd pipelines/atlas-scout && .venv/bin/python -m pytest -q
```

`--versatz` verschiebt das Saatgut-Fenster. Der nächtliche Workflow leitet ihn aus dem
Tag im Jahr ab, damit der Atlas über die Zeit einmal umrundet wird — deterministisch,
ohne Zufall.

### Optionale Annotation

Ein Modellschritt, getrennt vom Lauf, weil er Geld kostet und einen Schlüssel braucht:

```bash
export ANTHROPIC_API_KEY=…
.venv/bin/pip install -e ".[annotate]"
.venv/bin/python -m atlas_scout.annotate kandidaten/theorie/2026-07-25.json
```

Er schreibt je Kandidat einen Relevanz-**Vorschlag** und einen Einwand, beides mit Modell
und Prompt-Hash. Modell: `claude-sonnet-5` bei `effort: low`. Der Atlas-Wortschatz liegt als
stabiler Präfix im System-Prompt, damit das Prompt-Caching greift.

Der Vorschlag ist nie eine Feststellung. Wer ihn übernimmt, übernimmt ihn als eigenen Satz.

## Drei Betriebsarten

| Art | Atlas | Quelle | Modell | Aufruf |
|---|---|---|---|---|
| **Nachbarschaft** | Theorie | OpenAlex | keins | `--atlas theorie` |
| **Thematischer Sweep** | Theorie | OpenAlex | keins | `--atlas theorie --thema 10` |
| **Meldungen** | Werke | e-flux | Haiku 4.5 | `--atlas werke` |

### Thematischer Sweep

Die Nachbarschaftssuche wächst nur aus dem, was schon im Atlas steht — sie kann per
Konstruktion kein neues Feld eröffnen. Für die Felder 8–13 gibt es noch keine Einträge,
von denen aus zu gehen wäre; der Sweep sucht deshalb direkt.

Ohne Domänenschranke ist er unbrauchbar: OpenAlex' Volltextsuche traf bei „error"
Genom-Assemblies und RMSE-Metriken. Die Suche läuft darum nur in **Arts & Humanities
(fields/12)** und **Social Sciences (fields/33)** und nur über Titel und Abstract.

Die Feldnummern und ihre Abfragen stehen in `themen.py` — sie sind bindend, weil sie so
in `AtlasPage.astro` stehen und als `clusters` im Werke-Atlas landen. Ein Abgleich zwischen
beiden steht unter Testschutz (`test_themen.py`).

### Meldungen (Werke-Atlas)

Für zeitgenössische Datenkunst gibt es **keine strukturierte Quelle** — gemessen am
2026-07-25:

| Quelle | Befund |
|---|---|
| Wikidata | 9 von 25 Urhebern gefunden, **1 von 25** mit erfassten Werken |
| Rhizome ArtBase | 3.845 Artikel, Wikibase, aktiv — aber Netzkunst der 1999er–2010er |
| Ars Electronica, STARTS | JS-gerendert, ohne Playwright nicht lesbar |
| ZKM | server-gerendert, brauchbar als Reserve |
| Wikipedia | „Data art", „Generative art" existieren nicht als Kategorien |
| **e-flux** | **server-gerendert, paginiert, ~3.700–6.700 Zeichen je Meldung** |

Also Extraktion statt Sammlung: `sources/eflux.py` holt Meldungen (ohne Modell),
`extract.py` liest Werke heraus (mit Modell), danach greifen Abgleich, Identifier-Prüfung
und Bewertung unverändert.

Der Extraktor ist einsteckbar — `extrahiere(meldungen, pfad, extraktor)` nimmt jede
Funktion `(system, text) -> dict`. Die Tests fahren die ganze Strecke damit ohne Schlüssel
und ohne Netz.

**Der Wikidata-Adapter** bleibt als Gerüst liegen (`--quelle wikidata`) und meldet beim
Aufruf, dass ein leeres Ergebnis dort kein Befund ist.

## Grenzen

- Der Scout urteilt nicht über Qualität. `score.py` misst Rezeption, Aktualität,
  Zugänglichkeit und Begriffsnähe — nichts davon ist ein Argument für die Aufnahme.
- Die Gewichtung in `score.py::gewichte()` ist eine Setzung. Sie bestimmt, was nach oben
  gespült wird, und damit auch, wogegen der Atlas mit der Zeit blind wird.
- Die Identifier-Prüfung sagt, dass ein Ziel antwortet — nicht, dass dort der Volltext liegt.
- OpenAlex findet nicht jeden Atlas-Eintrag. Ein nicht auflösbares Saatgut liefert null
  Kandidaten; das ist kein Ausfall, sondern ein leeres Ergebnis.
- Ein falsch aufgelöstes Saatgut wäre schlimmer als keines: die Titelsuche muss deshalb
  zusätzlich im Autor passen (`_autor_passt`). Ohne diese Prüfung schlug der Lauf am
  2026-07-25 Meteorologie-Datensätze vor, weil Schwabs „Experimental Systems" ein fremdes
  Paper getroffen hatte.
- Die Extraktion ist der einzige Schritt, dessen Ausgabe nicht nachgerechnet werden kann.
  Sie trägt Modell und Prompt-Hash am Kandidaten; erfundene Feldnummern werden verworfen,
  weil sie sonst still in die öffentliche Karte fielen (die Filterleiste leitet ihre
  Schlüssel aus den Daten ab).
- Der Systemprompt der Extraktion muss über 4096 Token bleiben, sonst cached Haiku
  stillschweigend nicht. Gemessen: 25 Beispiele ≈ 3.039 Token (cached **nicht**),
  50 ≈ 5.326 (cached). Die Untergrenze steht unter Testschutz.
- **Ungeprüft:** Der Modellschritt ist nie gegen die echte API gelaufen — im Entwicklungs-
  rechner liegt kein `ANTHROPIC_API_KEY`. Die Strecke ist mit eingestecktem Extraktor
  vollständig getestet, der Aufruf selbst nicht.
