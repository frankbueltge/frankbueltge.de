# The Protocol, reformiert — Der Vertagungs-Index

**Datum:** 2026-06-28
**Status:** Design, abgenommen (Brainstorming Frank ↔ Claude)
**Betrifft:** Werk ① „Das Protokoll" — Neuausrichtung von Daten-Dashboard zu Messinstrument
**Vorläufer-Specs:** `2026-06-11-werkgruppe-design.md` (§2 Substanz-Kriterien, §4 Werk ①),
`2026-06-27-protokoll-befund-design.md` (die hier teilweise abgelöste Aufklapp-Mechanik)

## Motivation — warum überhaupt

The Protocol verstößt heute als einziges Werk der Gruppe gegen den **eigenen Leitsatz**
(`werkgruppe-design.md` Z. 27): *„Messinstrumente statt Visualisierungen. Ein Dashboard zeigt
Daten; ein Messinstrument erhebt eine Behauptung und macht sie überprüfbar."*

Es zeigt 13 unverbundene Größen nebeneinander (Wert, Delta, Sparkline) — ein **Dashboard**, keine
Behauptung. Damit fällt es bei **Substanz-Kriterium 2** durch („Eine Frage, kein Effekt — das Werk
erhebt eine überprüfbare Behauptung über die Welt"). Die poetische „Sitzung die vertagt"-Rahmung
ist ein literarischer **Effekt**, keine prüfbare Frage — und ist im Frontend ohnehin unter einem
eingeklappten „Amtlicher Wortlaut" begraben. Die Form bekämpft den Inhalt; das Stück wirkt
zu Recht verwirrend.

Zwei Sekundärsymptome derselben Ursache:
- Die Sparklines haben nur ~18 Datenpunkte (Pipeline-Start 11.06.2026, „kein Backfill"). Im
  Dashboard-Rahmen liest sich diese bewusste Entscheidung wie ein Defekt.
- Die Kachel-Aufklappmechanik streckt im 3-Spalten-Grid die Nachbarkacheln (gleiche Reihenhöhe) —
  sie „öffnen" sich scheinbar und zeigen Leerraum (CSS-Grid-Effekt, kein Logikfehler).

## 1. Der Kern — die eine Behauptung (Vertagungs-Index)

Das reformierte Protokoll erhebt **eine** überprüfbare Behauptung pro Sitzung:

> Von den indexfähigen Tagesordnungspunkten der Welt bewegt sich, **gegen den Jahrestrend**
> gemessen, kein einziger nachhaltig zum Besseren; *M* verschlechtern sich, *p* stehen still.
> **Beschluss: vertagt** — weil nachweislich nichts beschlossen wurde.

Beispiel-Schlagzeile (Kopf der Seite):

> *„Sitzung vom 28. Juni 2026, Tag 18. Indexfähige Punkte: 8. Gegen den Jahrestrend verbessert: 0.
> Verschlechtert: 6. Neue Extremwerte: 3. Beschluss: vertagt."*

Das „vertagt" ist damit nicht mehr Pose, sondern **gedeckt** durch eine Messung. Der Index ist die
Schlagzeile, die das ganze Stück trägt; die einzelnen Größen werden zur **Evidenz** für ihn.

## 2. Welche Größen zählen — indexfähig vs. Kontext

Nicht jede Größe hat eine verteidigbare „Verschlechterungsrichtung". Der Index wird **nur** über
Größen mit eindeutiger Richtung **und** ausreichender Geschichte gebildet. Die übrigen bleiben
sichtbar (als Vitalwerte/Kontext), zählen aber **nicht** in den Index — offengelegt. Das entschärft
den Willkür-Vorwurf gegen jeden zusammengesetzten Index.

| TOP | id | Einheit | Richtung „schlechter" | Geschichte | Rolle |
|---|---|---|---|---|---|
| 1 Atmosphäre | `co2` | ppm | höher | ab 1958 (Mauna Loa) | **Index** |
| 2 Meereis | `seaice_north` | Mio. km² | niedriger | ab 1979 (NSIDC) | **Index** (saisonal) |
| 2 Meereis | `seaice_south` | Mio. km² | niedriger | ab 1979 | **Index** (saisonal) |
| 3 Ozean | `sst` | °C | höher | ab 1982 (OISST) | **Index** (saisonal) |
| 7 Vertreibung | `refugees` | Menschen | höher | ab ~1990 (UNHCR, jährlich) | **Index** |
| 8 Ernährung | `food` | Punkte | höher | ab 1990 (FAO) | **Index** |
| 11 Konflikt | `conflict` | Ereignisse | höher | GDELT (geglättet) | **Index** (verrauscht) |
| 4 Feuer | `fires` | Detektionen | höher | FIRMS (stark saisonal/verrauscht) | **Index, geglättet** |
| 5 Erdbewegung | `quakes` | Anzahl | — (natürlich, kein Säkulartrend) | USGS | Kontext |
| 6 Anwesenheit | `population` | Mrd. | — (mehr ≠ „schlechter") | UN | Kontext |
| 9 Geldpreis | `rates` | % | — (ökonomisch, ambivalent) | ECB | Kontext |
| 10 Energie | `oil` | USD/bbl | — (ambivalent) | EIA | Kontext |
| 12 Aufmerksamkeit | `attention` | Aufrufe | — (kein Wohl/Übel) | Wikimedia | Kontext |
| 13 Verluste | `verluste` | (Liste) | — | — | eigener Block, unverändert |

Richtungen und Geschichts-Verfügbarkeit sind **gegen die Adapter zu verifizieren** (Implementierung);
wo eine lange Quelle fehlt oder zu verrauscht ist, fällt die Größe ehrlich in „Kontext" zurück statt
den Index zu verwässern.

## 3. Die Vergleichsregel (auditierbar)

Pro indexfähiger Größe wird der jüngste Messwert gegen ihren **12-Monats-Trend** klassifiziert — nicht
gegen den Vortag (das wäre Tagesrauschen). Bewusste Entscheidung Frank, 2026-06-28.

- **Trenddefinition:** lineare Regression (Kleinste-Quadrate) über das gleitende 365-Tage-Fenster der
  Größe; maßgeblich ist das **Vorzeichen der Steigung** plus die Lage des aktuellen Werts relativ zum
  Trendwert.
- **Saisonalität:** Größen mit Jahresgang (`seaice_*`, `sst`, `fires`) werden **vor** der Regression
  saisonbereinigt — Vergleich gegen denselben Kalenderzeitraum des Vorjahres (Year-over-Year) bzw.
  gegen die deseasonalisierte Reihe. Ohne das lügt der rohe Trend. Genaue Formel je Größe im
  Methodenblatt.
- **Klassen:** `verschlechtert` / `verbessert` / `unverändert`. Eine Bewegung gilt erst als
  `verbessert`, wenn sie ein offengelegtes Mindestmaß über das Trendrauschen hinaus erreicht (Schwelle
  je Größe dokumentiert) — sonst `unverändert`. Tagesrauschen wird nie zu „verbessert".
- **Extremwert („neuer Tiefststand"/„Rekord"):** aktueller Wert ist das Maximum bzw. Minimum der
  **gesamten** verfügbaren Reihe in Verschlechterungsrichtung.

Der Index ist die Aggregation dieser Klassen: `verbessert`-Zahl (Kern der Behauptung), `verschlechtert`-Zahl,
`unverändert`-Zahl, Extremwert-Zahl. Die Behauptung „verbessert: 0" ist die prüfbare Aussage; jede
Einzelklassifikation ist über die offengelegte Regel + Rohdaten nachrechenbar.

## 4. Datenarchitektur — zwei klar getrennte Schichten

**Schicht A — Geschichte als Evidenz (Seed, unveränderlich).**
Einmaliger, committeter historischer Snapshot je indexfähiger Größe, direkt aus der Quelle gezogen
(z. B. CO₂ ab 1958, Meereis ab 1979). Liegt versioniert im Repo, wird nach dem Seed **nie editiert**
(gleiche Unantastbarkeit wie das Archiv). Ablageort z. B. `src/data/protokoll/reference/<id>.json`
mit voller Provenienz (Quelle, Lizenz, Abrufzeitpunkt, Methode). Diese Schicht macht den Jahrestrend
überhaupt erst berechenbar.

**Schicht B — Protokoll als Live-Mitschrift (kein Backfill).**
Die nächtliche Messung hängt wie bisher an (`src/content/protokoll/<jahr>/<datum>.json`). Die
Tageseinträge werden **nie** rückdatiert — die Sitzung schreibt live mit. Der Index wird je Sitzung
aus Schicht A (Trendbasis) + Schicht B (aktueller Wert + bisherige Live-Reihe) berechnet und in das
Tages-JSON geschrieben, damit die Behauptung Teil des unveränderlichen Archivs ist.

**Kritischer Pfad — ehrlich:** Der Jahrestrend braucht ~1 Jahr Daten. Live existieren erst 18 Tage.
Der historische Seed (Schicht A) ist deshalb **nicht optional**; ohne ihn könnte der Index ein Jahr
lang nichts sagen. Größen, für die kein sauberer ≥12-Monats-Seed beschaffbar ist, erhalten den
ehrlichen Vermerk **„Trend noch nicht etabliert"** und zählen vorerst nicht in den Index.

**Provenienz/Trennung im Frontend offengelegt:** Referenz-Geschichte (Quelle) vs. live protokollierte
Messung sind sichtbar getrennt — keine Vermischung, die ein „gefälschtes Protokoll" suggerieren würde.

## 5. Frontend-Umbau (`ProtokollDataView.astro`)

- **Kopf = Index + Beschluss-Satz.** Das Erste, was man sieht: die eine Behauptung (verbessert: 0 …)
  und der gedeckte „Beschluss: vertagt". Deterministisch gerendert, Register-/Testschutz wie gehabt.
- **Darunter: die Vitalwerte.** Die Größen als Belege, jede gegen ihre **volle** Geschichte (Schicht A)
  — endlich aussagekräftige Verläufe statt 18-Punkt-Stummeln. Indexfähige Größen tragen ihre
  Klassifikation (verschlechtert/verbessert/unverändert) sichtbar; Kontext-Größen sind als solche
  markiert und ohne Index-Beitrag.
- **Aufklapp-Bug entfernt.** Die row-streckende `<details>`-Mechanik fliegt raus. Falls ein Detail
  je Größe erhalten bleibt, dann so, dass es die Nachbarkacheln nicht streckt (`items-start` bzw.
  ausgeklappter Block außerhalb des Grid-Flusses). „Der Befund"/`BefundPanel` wird auf diesen Rahmen
  reduziert oder abgelöst.
- **„Amtlicher Wortlaut"** bleibt als sekundäre Schicht — sein „Beschluss: vertagt" ist jetzt durch
  den Index gedeckt.
- **„Verluste"-Block** bleibt unverändert (eigener, würdiger Block; keine Messgröße, kein Index-Beitrag).

## 6. Methodenblatt (`/werke/protokoll`)

Offengelegt werden: die Index-Definition; je Größe die Verschlechterungsrichtung, das
Vergleichsfenster (365 Tage), die Saisonbereinigung und die „verbessert"-Schwelle; die Trennung
indexfähig/Kontext samt Begründung je Ausschluss; die Datenprovenienz beider Schichten; der ehrliche
Fallback „Trend noch nicht etabliert". Änderung der Index-Regel wird im Änderungsprotokoll versioniert.

## 7. Substanz-Check (gegen `werkgruppe-design.md` §2)

| Kriterium | vorher | nachher |
|---|---|---|
| 1 Echte Daten, offene Provenienz | ✅ | ✅ (Seed-Schicht zusätzlich ausgewiesen) |
| **2 Eine Frage, kein Effekt** | ❌ Dashboard, keine Behauptung | ✅ Vertagungs-Index als prüfbare Behauptung |
| 3 Infrastruktur als Aussage | ✅ | ✅ (kein Backfill + Seed-Trennung explizit) |
| 4 Konsequenz / Leave-behind | ✅ | ✅ (Regel + Seeds offen, auditierbar) |
| 5 Verhältnismäßigkeit | ✅ | ✅ (eine Zahl statt 13-fach-Schmuck — Reduktion) |

## 8. Umsetzungsphasen (Vorschlag für die Plan-Phase)

1. **Sofort-Hygiene:** Aufklapp-Bug entschärfen (`items-start`/Block aus dem Grid-Fluss), damit die
   Live-Seite nicht kaputt aussieht, während der Rest entsteht.
2. **Seed-Pipeline (Schicht A):** je indexfähiger Größe historische Reihe ziehen, validieren,
   committen; Provenienz dokumentieren. Größen ohne Seed → „Trend noch nicht etabliert".
3. **Index-Berechnung:** Trend-/Saison-/Klassifikationslogik (Tests mit Fixtures), Schreiben des
   Index in das Tages-JSON; deterministischer Beschluss-Satz unter Register-/Testschutz.
4. **Frontend-Umbau:** Kopf (Index) + Vitalwerte gegen volle Geschichte; Kontext-Markierung;
   Wortlaut/Verluste wie spezifiziert.
5. **Methodenblatt** aktualisieren.

## 9. Offene Detailpunkte (in der Plan-/Implementierungsphase zu klären)

- Exakte Saison-Formel je `seaice_*`/`sst`/`fires` (YoY vs. deseasonalisierte Regression) — empirisch
  am Seed festzulegen, dann im Methodenblatt fixieren.
- „verbessert"-Schwelle je Größe (wie viel über Trendrauschen = echte Verbesserung).
- Verifikation der Richtungen + Geschichts-Verfügbarkeit gegen die realen Adapter/Quellen.
- Genaues Schema-Feld für den Index im Tages-JSON (Schema-Version anheben).

## Änderungsprotokoll

- 2026-06-28: Erstfassung. Neuausrichtung Werk ① von Dashboard zu Messinstrument; Vertagungs-Index als
  einzige Behauptung; Vergleich gegen 12-Monats-Trend (Frank); Seed-/Live-Schichtentrennung;
  indexfähig/Kontext-Split; Aufklapp-Bug zur Entfernung vorgesehen.
