# „Der Befund" — aufklappbare Datum-Ansicht im Protokoll — Design

Status: abgenommen (Konzept, 2026-06-27, Frank: „über den Standard hinaus, alle, gründlich").
Ausführung autonom in derselben Nacht.

## 1. Problem

Die Metrik-Kacheln im Protokoll-Daten-Panel ließen sich aufklappen, zeigten aber nur eine
größere Kopie derselben Sparkline — keine Vertiefung, keine Persönlichkeit. Das verstößt
sogar gegen den eigenen Visualisierungs-Standard („Form folgt je Untersuchung der gemessenen
Relation" — nicht eine Einheits-Kurve).

## 2. Entscheidung (bewusste Standard-Überschreitung)

Für **diese Aufklapp-Ebene** wird der Mono-Skin/„kein Schmuck"-Grundsatz bewusst gelockert
(`2026-06-20-visualisierungs-standard-design.md` ist herabgestufte Leitlinie; der Künstler
überschreibt sie hier). Erlaubt: ausdrucksstarke Komposition, ein bedeutungstragender Akzent,
eine Bewegung, die den **echten** Pfad einmal nachzeichnet (kein Deko-Loop).

**Die unverrückbare Linie:** Daten bleiben echt. Jede Markierung ist ein gemessener Wert; kein
erfundener Kontext. Referenzwerte (Korridor, Langzeit-Bezug) werden belegt.

## 3. Konzept „Der Befund"

Aufklappen = eine Messung wird zur Akte geöffnet. Geteilte Signatur auf allen 13 (macht es zum
Werk), plus eine Form je Größen-Familie.

**Signatur (alle):**
1. **Monument** — der Wert groß komponiert (bei `attention`: das benannte Thema ist das Monument).
2. **Korridor-Band** — Position des heutigen Werts im plausiblen Bereich (`corridor`); Marker
   nach Polarität eingefärbt (Richtung „Belastung"). Die „nur hier"-Einordnung ins Mögliche.
3. **Verlauf** — die Archiv-Kurve groß, beim Aufklappen einmal gezeichnet (echter Pfad),
   Rekordpunkt + Min/Max markiert.
4. **Befund-Satz** — Register-Stimme, aus echten Daten gerechnet (Rekord / Streak / Lage im
   Korridor). Deterministisch, unter Test.
5. **Beleg-Stempel** — Quelle (verlinkt) · `as_of` · erhoben · Lizenz.

## 4. Form-Familien (Auszug, Wortlaut/Akzent je Familie)

| Familie | TOPs | Akzent |
|---|---|---|
| Abweichung | co2, sst, seaice_north/south | Bezug zum Mittel des Zeitraums; co2 zusätzlich Tiefenzeit-Hinweis (belegt) |
| Intensität | quakes, fires, conflict | „Puls/Volumen", Vielfaches des Mittels |
| Lauf/Preis | food, rates, oil | Veränderung, „eingepreist"-Gewicht |
| Bestand | population, refugees | langsamer Anstieg, Wachstum seit Beginn |
| Benannt | attention | Thema groß + Parade der Vortage (worauf die Welt nacheinander schaute) |

`verluste` behält seinen bestehenden würdigen Block.

## 5. Architektur (Isolation/Testbarkeit)

- `src/lib/protokoll/befund.ts` — Korridor-Karte (Quelle: Python-Adapter-SPECs), Familien-/
  Polaritäts-Karte je `top_id`, deterministische Encoder (`corridorPosition`, `streak`,
  `befundSatz`), belegte Referenzkonstanten (co2-Tiefenzeit). **Encoder unter Unit-Test**
  (`befund.test.ts`, Anschluss Visualisierungs-Standard §7).
- `src/components/pages/BefundPanel.astro` — die Befund-Komposition; nimmt `entry`, `series`,
  `labelHistory` (für attention), `locale`. Reine Darstellung.
- `ProtokollDataView.astro` — ersetzt den faulen `<details>`-Inhalt durch `<BefundPanel>`.
  Kollabierter Kachelzustand bleibt unverändert (geringe Blast-Radius).

## 6. Referenzdaten (ehrlich)

- **Korridor:** Frontend-Karte aus den Adapter-SPECs (kein Schema-Eingriff nötig), mit
  Quellverweis im Code.
- **Rekord/Verlauf:** aus dem geladenen Archiv (`getProtokollDays` liefert alle Tage) —
  Wortlaut „im verzeichneten Zeitraum", nicht „seit je".
- **co2-Tiefenzeit:** belegte Konstante (Paläoklima-Rekonstruktionen), als Hinweis, nicht als
  Messpunkt.

## 7. Rollout

Erst System + alle Familien live; co2 und attention als bespoke Speerspitzen. Kollabierte
Ansicht unverändert. Build + Vitest grün, dann Deploy. Polarität/weitere Bespoke-Politur ist
iterierbar.
