# 09 — Erstes neues Experiment: S-01 vs. S-03 (Entscheidung)

> Vergleich der beiden Kandidaten aus `docs/14` als **erstes** öffentlich sichtbares
> Experiment. Maßstab: festgelegte Richtung (Kern = Messung, algorithmische Systeme,
> **technische Infrastrukturen**; „Zufall" nur im Hauptclaim, wenn S-01 sichtbar).

## Die Kandidaten (Kurzfassung aus docs/14)

- **S-01 „Falschspiel"** — manipulierter Zufall. Frage: *Ab wann hört ein Zufallssystem auf,
  zufällig zu sein — und wer bemerkt es?* Ein Register, das seinen eigenen, schrittweise
  manipulierten Zufall offenlegt. Reaktiviert die Masterarbeitslinie; Voraussetzung dafür,
  „Zufall" je in den Hauptclaim zu nehmen.
- **S-03 „Selbstkostenrechnung"** — Infrastruktur des eigenen Werks. Frage: *Was kostet diese
  Praxis — an Energie, Geld, Abhängigkeit?* Ein Werk, das den eigenen Betrieb ausweist und
  zum Gegenstand macht. Löst das Substanz-Kriterium „Infrastruktur als Teil der Aussage" ein.

## Bewertung

| Kriterium | S-01 „Falschspiel" | S-03 „Selbstkostenrechnung" |
|---|---|---|
| **Aufwand** | mittel — RNG-Ströme, Manipulationsschema, trennscharfe Statistik, Frontend | **niedrig–mittel** — Telemetrie existiert großteils (Cloud-Run-Läufe, API-Aufrufe, Pipeline-Versionen); neu v. a. Energie-Schätzung |
| **Anschluss an Positionierung** | erweitert den Claim (neue Säule „Zufall") + algorithm. System | **direkt** — stärkt eine **bereits gesetzte** Kernsäule (Infrastruktur + Messung) |
| **Risiko der Peinlichkeit** | **mittel–hoch** — „rate, ob's Zufall ist" kann als Spielerei lesen, wenn nicht streng | niedrig–mittel — Risiko „Nabelschau/Selbstwichtigkeit"; durch nüchternen Ton bannbar |
| **Technische Machbarkeit** | gut (RNG + Tests bekannt); Hardware optional; Reproduzierbarkeit beachten | **sehr gut** — Daten vorhanden; Energie ehrlich als Schätzung mit Grenzen |
| **Künstlerische Eigenständigkeit** | **hoch** — „Zufall als Gegenstand, nicht Generator"; biografische Wurzel | hoch — selbstmessende Infrastruktur; kohärent, etwas weniger singulär als S-01 |
| **Diskursfähigkeit** | Algorithmic Aesthetics (Feld 7); Forschungslinie | **hoch** — Infrastructural Critique (Feld 8) + Critical Data (Feld 3); stark expo-/paper-fähig |
| **Veröffentlichungsschwelle** | höher — braucht funktionierende Manipulation **und** Trennschärfe, sonst trivial | **niedriger** — schon eine Mindestversion (heutige Betriebskosten der vier Werke) ist ehrlich zeigbar |

## Abwägung

Beide sind valide; sie dienen **verschiedenen Zielen**.

- **S-03** ist der **risikoärmste, schnellste** Einstieg und verstärkt **genau die Säule, die
  ohnehin im Kern steht** (Infrastruktur). Es ist früh und ehrlich publizierbar, weil die
  Daten existieren und der Anspruch bescheiden ist („dieses Werk nennt seinen eigenen Preis").
  Es ist zudem der unterausgespielte USP der Reihe (Substanz-Gate-Kriterium 3).
- **S-01** ist **eigenständiger** und der **einzige Weg**, „Zufall" je legitim in den
  Hauptclaim zu heben — plus die Brücke zur früheren Masterarbeit. Dafür braucht es mehr
  methodische Sorgfalt und trägt ein höheres Peinlichkeitsrisiko, wenn es zu früh/zu spielerisch
  erscheint.

## Empfehlung

**Erstes veröffentlichtes Experiment: S-03 „Selbstkostenrechnung".**
Begründung: niedrigstes Peinlichkeitsrisiko, geringster Aufwand, direkter Einzahlpfad auf eine
**bereits committete** Kernsäule, höchste Diskurs-/Expositionsnähe, früheste ehrliche
Publizierbarkeit. Es beweist „Infrastruktur als Teil der Aussage" am eigenen Werk — glaubwürdig
und ohne Claim-Erweiterung.

**Parallel, intern als „Experiment in Arbeit": S-01 „Falschspiel".**
Begründung: Nur ein sichtbares S-01 erlaubt es, „Zufall" später in den Leitsatz aufzunehmen
(Richtung-B-Erweiterung), und es reaktiviert die Masterarbeitslinie. Sobald es als „in Arbeit"
sichtbar ist, ist die Bedingung aus der Positionierungs-Entscheidung erfüllt (docs/_drafts/01,
docs/14). **Nicht** als fertiges Werk zeigen, bevor die Trennschärfe (Manipulation wird
statistisch fass-/auflösbar) steht.

### Mindestversionen zum Start
- **S-03:** tägliche Betriebskosten der vier Werke (Rechenzeit, API-Aufrufe, Abhängigkeiten),
  offen ausgewiesen, mit ehrlich benannter Schätzunsicherheit der Energie.
- **S-01 (intern):** zwei Ströme (echt / leise manipuliert) + ein Diskriminierungstest; erst
  öffentlich, wenn die Auflösung sauber zeigbar ist.

### Was beide brauchen (Gate, docs/11)
Klare Frage · reale Daten/Quelle · ehrlicher Ausgang · als **Versuch** gekennzeichnet · keine
Secrets/PII. S-03 zusätzlich: Lizenz-/Datenherkunft der Telemetrie sauber; keine internen
Cloud-Identifier/Secrets im Output.

### Offene Punkte (ZU KLÄREN)
- **W-2 (docs/15):** Bestätigung der Reihenfolge S-03 zuerst, S-01 parallel.
- Soll „Zufall" nach Sichtbarwerden von S-01 in den Leitsatz (L3+) — Entscheidung mit docs/_drafts/01.
- S-03: bis wohin reicht die vorhandene Telemetrie wirklich? (Energie-Faktoren prüfen, nicht erfinden.)
- S-01: Hardware-Entropiequelle nötig/gewünscht (Anschluss an Arduino/Pi, Richtung C) — T-2.
