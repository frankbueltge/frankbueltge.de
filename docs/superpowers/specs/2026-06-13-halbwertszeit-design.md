# Werk ③ „Halbwertszeit" — Teilprojekt-Design

**Datum:** 2026-06-13 · **Status:** Design abgenommen, **Prototyp-Gate offen** (s. §6)
**Übergeordnet:** Werkgruppen-Spec §6; verschärftes Substanz-Gate nach Überflug-Ausmusterung:
These zuerst, messbar, akkumulierend.

## 1. These

Anteilnahme zerfällt exponentiell — und die Zerfallskonstante ist messbar. Das Werk
misst sie, Ereignis für Ereignis, und stellt sie neben die Halbwertszeiten der Physik.

## 2. Ereignisregister (Designrunde entschieden)

- **Umfang:** alle Großereignisse mit Todesopfern (nicht nur Naturkatastrophen).
- **Kuration: regelbasiert-automatisch.** Die veröffentlichte Regel ist die Kuration:
  *Aufgenommen wird jedes Ereignis, dem Wikidata eine Opferzahl (P1120) ≥ 25 zuschreibt,
  mit Ereignisdatum ab Registerbeginn.* Abfrage per SPARQL (query.wikidata.org),
  nächtlich; Register versioniert im Repo. Niemand wählt aus — auch das ist die Aussage.
- **Ehrlichkeitsgrenze (Methodenblatt):** Wikidata ist selbst ein Aufmerksamkeitsprodukt —
  was dort keine Opferzahl bekommt, fehlt. Die Lücke wird ausgewiesen, nicht geglättet.

## 3. Messgröße

Tägliche Wikipedia-Pageviews des Ereignis-Artikels, **summiert über alle Sprachversionen**
(BigQuery Public Dataset `bigquery-public-data.wikipedia.pageviews_*`, partitioniert nach
Stunde, geclustert nach wiki/title; Sprachversionen via Wikidata-Sitelinks). Globale
Aufmerksamkeit statt en-Proxy. GDELT-Erwähnungen als zweite Modalität später optional.
Fit: log-lineare Regression auf den Post-Peak-Verlauf → λ, Halbwertszeit = ln 2 / λ.
Kostendisziplin: maximum_bytes_billed je Query, Tagespartitionen.

## 4. Darstellung (Designrunde entschieden)

**Eine Zahl + Register.** Kopf: „Die mittlere Halbwertszeit der Anteilnahme beträgt
derzeit X Tage" + physikalische Konstanten daneben (Cs-137: 30,1 a; Mikroplastik ~450 a;
CO₂-Verweildauer Jahrhunderte). Darunter chronologisches Register: pro Ereignis Datum,
Name, Opferzahl (Wikidata-Stand), Zerfallskurve mit Fit, λ/Halbwertszeit. **Ethik-Regel:
Sortierung strikt chronologisch, nie nach λ; keine Ranglisten.** Laufende Ereignisse:
„Messung läuft". Ereignisse ohne messbare Aufmerksamkeit tragen den Vermerk
„keine messbare Anteilnahme" — der härteste Befund des Werks.

## 5. Infrastruktur

GCP-Maschinenraum (deployed, Projekt data-snack): nächtlicher Cloud-Run-Job
`halbwertszeit` (Muster Protokoll), schreibt Register + Kurven als committete JSONs
(Git als Archiv), dbt-Modelle für die BigQuery-Transformationen (die dbt-Signatur
der Werkgruppe). Frontend statisch aus den JSONs.

## 6. Prototyp-Gate (vor jedem Werk-Bau)

Drei echte Ereignisse der letzten Monate per Hand-Pipeline durchmessen (SPARQL →
Pageviews → Fit) und dem Künstler vorlegen. Kriterien: (a) Wikidata-Regel liefert
brauchbare Ereignisse, (b) Zerfall ist tatsächlich ~exponentiell (R² des log-linearen
Fits), (c) die Zahlen tragen eine Aussage. Erst nach Freigabe: Spec-Feinschliff,
Plan, Bau. Scheitert der Prototyp, wird hier dokumentiert woran.
