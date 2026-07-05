# Feld-Archiv — Datenkunst im Feld „Daten · KI · Macht"

Ein kuratiertes, quellenbelegtes Verzeichnis von Werken der Daten-/KI-Kunst, kartiert auf die
sieben Cluster der Lab-Feldkarte (`field-research/FIELD.md`). Zweck: **Vorbild-Fundus** — für die
eigene künstlerische Forschung und als Treibstoff für das Kollektiv Meridian, damit Werke mit der
*Welt* als Gegenstand entstehen (nicht nur mit dem Messinstrument als Gegenstand). Zugleich ein
Katalog dessen, was **jenseits des Screens** möglich ist (physisch / öffentlicher Raum).

**Status:** Review-Entwurf, erster Sweep. Noch **nicht** in den Build eingebunden. Mögliche
Weiterverwendung: als öffentlicher Lab-Atlas rendern (dann wandert `werke.json` nach `src/data/`).

## Dateien
- `werke.json` — die Daten (108 Werke).
- `UEBERSICHT.md` — lesbarer Überblick, nach Primär-Cluster gruppiert.

## Herkunft
Zusammengetragen am 2026-07-05/06 von **8 parallelen Recherche-Agenten** (je ein Venue-/Cluster-Beat:
Prix Ars Electronica + STARTS · Berlin-Achse transmediale/CTM/Disruption Network Lab/CCC · Theorie-
Museen ZKM/HEK/Jeu de Paume/Pompidou · Counter-Forensics FA/SITU/Bellingcat/Airwars · Commission-Hubs
+ Provenance + Spektakel-Pol · der FIELD.md-Kanon · Data-Justice · Dekolonial/Global South). Jeder
Eintrag ist gegen eine echte, abrufbare Quelle geprüft; **keine erfundenen Werke, Namen oder URLs**.
108 eindeutige Werke (115 roh, 7 aus mehreren Beats bestätigt). Alle `verified`.

## Schema (`werke.json`)
| Feld | Bedeutung |
|---|---|
| `title`, `artist`, `year` | Werk, Urheber:in, Jahr |
| `venue_prize` | Ausstellung/Preis/Kontext |
| `clusters` | Teilmenge von 1–7 (FIELD.md-Cluster) |
| `axis_pole` | `investigation` (KI als Gegenstand) / `spectacle` (KI als Medium) / `mixed` |
| `form` | digital-web · interactive-installation · physical-installation · performance · public-space-intervention · print-diagram · video-film · database · evidence-platform · publication · hybrid |
| `medium_class` | `digital` / `hybrid` / `physical` |
| `lab_renderable` | ob eine Web-/Lab-Fassung baubar wäre |
| `decisive_move` | eine Zeile: der entscheidende Move |
| `source_url` | echte, abrufbare Quelle |
| `verify_status` | `verified` / `toVerify` |
| `curator_note` | Kuratoren-Anmerkung (nur wo nötig) |
| `_beats` | interne Provenienz: welche Recherche-Beats das Werk fanden |

## Cluster (Kurzform)
1 Material-/planetare KI-Kosten · 2 KI im Krieg / Kill Cloud · 3 Counter-Forensics / OSINT ·
4 Provenance → Authentizität · 5 Dekolonial / more-than-human · 6 Data Justice / Data-Feminismus ·
7 KI-Selbstverzehr (Model Collapse) / Quanten-Unbestimmtheit.

## Kuratoren-Eingriffe (erster Sweep)
- 5 Feld-Konflikte aufgelöst (spezifischere Einordnung gewinnt, z. B. *Calculating Empires* = 24-m-
  Fresko → `physical-installation`).
- 2 als `toVerify` markierte Einträge geklärt und mit `curator_note` versehen: Disnovations
  *„Life Support System (The Farm)"* enthält **kein** ML (als Daten-/Öko-Messinstrument geführt);
  Ling Tans *Harvesting Climate Action* hat schwachen KI-Bezug (als Daten-Partizipations-Werk geführt).
