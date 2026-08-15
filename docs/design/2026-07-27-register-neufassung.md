# Dataset Register — Neufassung des Zwecks

> **ÜBERHOLT am selben Abend.** Das hier definierte Relevanzkriterium aus Stichwörtern
> trägt nicht: Ein Stichwort im Titel bezeichnet oft eine Rolle, keinen Gegenstand
> („Training data for MaxQuant" sind Proteomik-Daten, kein Datensatz über KI). Zudem
> kennt §4 nur die machtnahen Themen und nicht die Atlas-Erweiterung vom 25.07.
> (Felder 8–13, „knowing" und „expression"). Maßgeblich ist jetzt
> **`2026-07-27-register-rueckbau-und-scouts.md`**. Dieses Dokument bleibt als Beleg
> stehen — die Architektur-Aussagen (§5) und die Umsetzungsnotizen (§8) gelten weiter.

**Datum:** 2026-07-27 · **Status:** ÜBERHOLT (siehe Kasten) — umgesetzt, dann verworfen
**Vorgänger:** `2026-07-26-dataset-hub-design.md` (Architektur bleibt gültig),
`2026-07-26-uebergabe-dataset-register.md` (Stand vom Vortag)

## 1. Was schieflief

Der Startauftrag sagte: „**Vollständigkeit im Rahmen des Möglichen: der größte
maschinenlesbare Nachweis öffentlich zugänglicher Datensätze.**" Danach wurde gebaut —
Aggregatoren zuerst, Masse vor Auswahl, am Ende der Bulk-Import von 56,6 Millionen
DataCite-Einträgen.

Frank am 27.07., nachdem die Größenordnungen sichtbar wurden:

> Hart filtern und auf Datensätze beschränken, die für seine Arbeit und die research
> ecology Sinn ergeben; dann trägt die Sammlung einen Mehrwert und ist keine Kopie von
> DataCite, sondern eine Meta-Datensammlung über viele öffentliche Quellen — die
> ursprüngliche Idee, die der Plan nicht konkret transportiert hatte.
> *(Franks Anweisung, 27.07., Wortlaut privat.)*

Das trifft zu. **Eine Teilmenge von DataCite ist wertlos**, weil DataCite selbst
vollständiger, aktueller und besser ausgestattet ist. Der Wert eines eigenen Registers
kann nur aus dem entstehen, was die Quellen NICHT tun.

## 2. Der neue Zweck

Eine **kuratierte Meta-Sammlung über viele öffentliche Quellen**, deren Mehrwert in vier
Dingen liegt, die kein einzelner Katalog leistet:

1. **Quellenübergreifend** — DataCite, Regierungsportale, ML-Plattformen, Geodaten,
   kuratierte Listen in einem Nachweis, mit Dedup über Quellgrenzen hinweg.
2. **Geprüft statt behauptet** — jeder Zugriffsweg wird tatsächlich aufgerufen; der
   Prüfstand steht am Eintrag. Kein Katalog der Welt tut das.
3. **Ausgewählt** — auf das, was für die Arbeit dieser Ökologie trägt. Keine
   Massenregistrierungen einzelner Beobachtungen.
4. **Lücken ausgewiesen** — was fehlt, warum es fehlt, was verworfen wurde und weshalb.

## 3. Was das konkret ändert

| | alt | neu |
|---|---|---|
| Ziel | größtmöglicher Nachweis | kuratierte Auswahl mit Mehrwert |
| Größenordnung | 56,6 Mio (bzw. 2,4 Mio ohne Massenherausgeber) | Bestand **wenige Zehntausend**, Kernbestand **Tausende** |
| Aufnahme | alles, was die Schranken passiert | Schranken **plus** Relevanzkriterium |
| Unterseiten | eine je Eintrag | nur je **Kernbestand**-Eintrag (§4, Stufe 2) |
| DataCite-Bulk | Bestandsgrundlage | **Rohmaterial zum Filtern**, nicht zum Aufnehmen |

**SEO/GEO:** Massenhaft dünne Seiten schaden der Domain, die Franks Werke trägt. Eine
kuratierte Sammlung mit einigen tausend inhaltsreichen Einträgen ist das Gegenteil —
wenige, gute, zitierfähige Seiten.

## 4. Das Relevanzkriterium (entschieden, Frank 27.07.)

**Zweistufig.** Der Bestand wird breit aufgenommen, aber schmal gezeigt. Grund: die
beiden Nutzungen des Registers haben verschiedene Bedürfnisse. Die Praxen fragen den
Snapshot maschinell ab — dort hilft Breite. Die Website ist der Ort, an dem Kuratierung,
Zitierbarkeit und SEO zählen — dort schadet Breite.

### Stufe 1 — Aufnahme in den Bestand (Materialgüte)

Deterministisch, thematisch offen. Zusätzlich zu den bestehenden harten Schranken:

- **keine Massenregistrierungen einzelner Beobachtungen** (Experimentschüsse,
  Sammlungsbelege, Sequenzen, Fundmeldungen) — es sei denn, ein Eintrag bezeichnet die
  Sammlung statt des Einzelstücks;
- **offene Lizenz** oder wenigstens eine benannte;
- **maschinenlesbarer Zugriffsweg**, wörtlich aus der Quelle.

Das Ergebnis ist der abfragbare Snapshot der Praxen.

### Stufe 2 — Kernbestand (Relevanz)

Ein Merkmal am Eintrag, nicht eine zweite Datenbank. Es trägt die Themen der Ökologie:

- **Gegenstand:** Datensätze über KI-Systeme, ihre Trainingsdaten und Bewertung;
  über Macht (Verwaltung, Vergabe, Lobbyismus, Überwachung, Militär, Klimapolitik);
  amtliche Statistik; Datensätze, die selbst eine umstrittene Messung sind.
- **Beschaffenheit:** brauchbar als Material — zeitliche oder räumliche Tiefe,
  bestätigter Zugriff.

**Nur der Kernbestand bekommt Unterseiten und Sichtbarkeit** (Suche, Listen, Sitemap,
JSON-LD). Alles andere bleibt im Snapshot abfragbar, aber ohne eigene Seite.

### Wie es technisch greift

Deterministisch vorsieben, Urteilsroutine entscheidet die Grenzfälle. Rein
deterministisch wäre zu grob, rein per Urteil unter dem Abo nicht durchsatzfähig.

**Eine Abweichung von der ursprünglichen Fassung dieses Absatzes:** „bestätigter
Zugriff" steht in Stufe 2, nicht in Stufe 1. Als Aufnahmeschranke wäre es zirkulär —
der Prüfstand läuft als eigener Schritt nach der Aufnahme, und am 27.07. haben genau
164 von 17.327 Einträgen eine bestätigte Auflösung (unter 1 %). Als Schranke hätte er
den Bestand auf 164 Einträge reduziert. Am Kernbestand ist die Forderung dagegen
erfüllbar und dort auch nötig: die Behauptung „geprüft statt behauptet" (§2) wird auf
den Seiten aufgestellt, und ein paar tausend HTTP-Prüfungen sind leistbar.

## 5. Was bleibt

Die Architektur trägt weiter und muss nicht angefasst werden: Identitätsmodell,
Schema, Schranken, Dedup R1–R4, Register für Ablehnungen/Ausfälle/Messungen,
Snapshot-Vertrag, Gate G5 (Rechtslage), Prüfstand der Zugriffswege, Urteilsroutine,
das Abfrage-Werkzeug der Praxen. Auch die Adapter bleiben — sie ernten weiter, nur
entscheidet künftig ein Relevanzkriterium, was davon in den Bestand geht.

**Die 14 GB Rohmaterial des DataCite-Bulks bleiben liegen** — sie sind jetzt ein
Steinbruch, aus dem gezielt geholt wird, kein Bestand, der eingelesen werden will.

## 6. Der Altbestand wird ausgemustert (entschieden, Frank 27.07.)

Die Neufassung wirkt rückwirkend. Der am 26.07. veröffentlichte Bestand besteht selbst
mehrheitlich aus dem, was Stufe 1 künftig ausschließt — gemessen am 27.07.:

| Einträge | Herausgeber | Art |
|---|---|---|
| 4.871 | Consiglio Nazionale delle Ricerche | Serien |
| 3.079 | Distributed System of Scientific Collections | Sammlungsbelege |
| 1.502 | The Global Biodiversity Information Facility | Fundmeldungen |
| 384 | Cambridge Crystallographic Data Centre | Einzelstrukturen |

Rund 9.800 von 17.327 Einträgen (57 %). Sie **werden entfernt**, nicht stillgelegt: die
Einträge fallen aus Bestand und Site, die Ausmusterung kommt mit Datum und Grund ins
Ablehnungsregister, und die Register-Oberfläche benennt sie sichtbar. Das folgt der
Aktualitäts-Regel — überholte Strukturen werden sichtbar und datiert archiviert, nie
unauffällig als aktuell stehen gelassen. Die Seiten waren einen Tag online; es gibt
nichts zu erhalten, was den Preis dünner Seiten auf der Domain rechtfertigte.

## 7. Umsetzung (27.07.)

1. ~~Relevanzkriterium entscheiden~~ — erledigt (§4).
2. ~~Massenherausgeber exakt messen~~ — 56.640.014 Zeilen, 18.350 Herausgeber, 0 Ausfälle.
   Bericht: `dataset-hub/messungen/ergebnisse/2026-07-27-herausgeber-gesamt.md`.
   Liste: `dataset-hub/register/massenherausgeber.json`, 30 Herausgeber, 79,9 % der
   Fundstellen. **Sie ist Teil der Schranke: fehlt sie, bricht der Bestandsbau ab.**
3. ~~Stufe 1 bauen~~ — `pipeline/relevanz.py`. Der Bulk wird nicht mehr in den
   Bestandsbau geladen, sondern liegt als Steinbruch (§5) daneben.
4. ~~Stufe 2 bauen~~ — `pipeline/kernbestand.py`, dreiwertig: `regel` / `grenzfall` /
   kein Treffer. Unbeurteilte Grenzfälle sind NICHT im Kernbestand.
5. ~~Bestand neu bauen~~ — 17.327 → 3.060 Einträge (10.736 Massenregistrierungen,
   3.531 ohne benannte Lizenz, alle mit Grund im Ablehnungsregister).
6. ~~Abbau aus dem Steinbruch~~ — `pipeline/hole_aus_steinbruch.py`.
7. Offen: **weitere Quellen** (Regierungsportale, kuratierte Listen) — sie sind für
   eine kuratierte Sammlung wertvoller als noch mehr DataCite.
8. Offen: **Prüfstand ausweiten.** Der Kernbestand ist klein genug, dass jeder
   Zugriffsweg tatsächlich aufgerufen werden kann — die Behauptung aus §2 wird damit
   erst eingelöst (Stand 27.07.: 164 von 17.327 geprüft).

## 8. Was die Umsetzung korrigiert hat

- **„Bestätigter Zugriff" musste von Stufe 1 nach Stufe 2.** Als Aufnahmeschranke wäre
  er zirkulär (§4, letzter Absatz).
- **Der Kernbestand-Sieb wiegt Titel und Beschreibung verschieden.** Ein Begriff im
  Titel entscheidet, derselbe Begriff in der Beschreibung macht nur einen Grenzfall.
  Ohne das traf „surveillance" die Vogelgrippe-Überwachung und „language model" einen
  Verkehrsunfall-Datensatz, der ein Sprachmodell bloß erwähnt.
- **Das erste Maß für Massenregistrierung war falsch.** Die Titel-Wiederholungsrate ist
  größenabhängig; sie hätte Kaggle, DataverseNO und das CERN Open Data Portal
  ausgeschlossen. Ersetzt durch „Einträge je Titelmuster" (Schwelle 100).
- **Das Maß kann nicht alles.** Gekappte Musterzählungen und kleine Serien entscheidet
  ein Urteil mit Beleg (`register/massenherausgeber-urteile.json`), nicht eine
  nachgebogene Schwelle.
