# Übergabe — Sitzung vom 26. Juli 2026

Was an diesem Tag entstanden ist, was nachts allein weiterläuft, was offen bleibt und
welche Fehler sich nicht wiederholen sollten. Gedacht zum Lesen in drei Minuten, bevor
irgendjemand irgendetwas anfasst.

## 1. Neu: das Dataset Register

Ein maschinenlesbarer Nachweis öffentlich verfügbarer Datensätze — eigenes Repo
[`frankbueltge/dataset-hub`](https://github.com/frankbueltge/dataset-hub), Infrastruktur
der Ökologie, kein Lab-Experiment.

**Stand am Abend:** 17.327 Einträge · 16.445 Werke · Schema v0.2.0 · 46 Tests.
Quellen: DataCite 13.010 · ArcGIS Hub 4.297 · HuggingFace 20.

**Maßgebliche Dokumente**, in dieser Reihenfolge zu lesen:

| Dokument | Inhalt |
|---|---|
| `docs/superpowers/specs/2026-07-26-dataset-hub-design.md` (hier) | Architektur: Identitätsmodell Fundstelle/Fassung/Datensatz, Merge-Stufen R1–R4, Zugangsstufen, Snapshot-Vertrag |
| `dataset-hub/schema/SCHEMA.md` | Schema v0.2.0, harte Aufnahme-Schranken, Quellen-Ausnahme HuggingFace |
| `dataset-hub/messungen/register.md` | Go/No-Go je Quelle, **Gate G5 (Rechtslage)**, Querbefund 10.000er-Fenster |
| `dataset-hub/messungen/VERFAHRENSNOTIZEN.md` | die Fehler dieses Tages, mit Regel daraus |
| `dataset-hub/URTEILSROUTINE.md` | Auftrag der nächtlichen Urteilsroutine |
| `dataset-hub/SNAPSHOT-API.md` | wie Pipelines den Bestand abfragen |

**Auf der Site:** Nav-Punkt **Catalogues** (`/catalogues`) hält Atlas of Data Art und
Dataset Register (`/datasets`); jeder Eintrag hat eine vorgerenderte Seite mit
`schema.org/Dataset`-Auszeichnung, alle in der Sitemap. Startseite verlinkt beide.

## 2. Was nachts ohne Zutun läuft

| Zeit (UTC) | Was | Wo |
|---|---|---|
| 03:20 | Ernte, Auflösungs-Budget, Bestandsbau, Tests, Snapshot, Release | GitHub-Action „Nächtliche Ernte" im `dataset-hub` |
| 03:50 | Site-Neubau (holt die Registerdaten aus dem Release) | `deploy-cf.yml` |
| 06:02 | Urteilsroutine: Merge-Kandidaten beurteilen, Stichprobe sichten | Claude-Code-Routine `trig_01KKPeQD2b2STFyPKBJBxF1n` |

**Morgens zuerst prüfen:** Ist der Nightly durchgelaufen? Steht etwas in
`dataset-hub/register/ausfaelle.jsonl`? Was hat die Urteilsroutine ins
`journal/entscheidungen.jsonl` geschrieben?

## 3. Weitere Entscheidungen dieses Tages

- **Crawler-Politik „zitieren ja, trainieren nein"** — `2026-07-26-crawler-politik.md`.
  Eigene `robots.txt` ist live (Cloudflares verwaltete Fassung wurde abgeschaltet).
  Laut Dashboard kommen die Retrieval-Agenten durch: 233 KI-Crawler-Anfragen in 24 h,
  193 zugelassen (Anthropic 34, OpenAI 16). **Offen:** ob die Trainings-Crawler im
  Dashboard ausdrücklich auf *Block* stehen.
- **Lizenzen offen** — `2026-07-26-lizenz-entscheidungsvorlage.md`. Code Apache 2.0,
  Werke/Texte CC BY 4.0, Daten CC0, in acht Repos plus GitHub-Beschreibungen.
  **Ausnahme:** Saat-Einreichungen bleiben CC BY-NC-SA 4.0 (Zusage an Einreichende).
  Der KI-Vorbehalt hängt seither an der Crawler-Politik, nicht an der Lizenz.
- **Nennungsblock unter Werken** — sichtbar die Praxis, darunter der Rechteinhaber,
  dazu eine Zeile zum Kopieren. Sitzt im Layout (`AttributionBlock.astro`), nicht in
  den Werkdateien, die die Integrations-Workflows erzeugen.
- **Datenschutz** um einen Abschnitt zum Register ergänzt (Urhebernamen sind
  personenbezogene Daten), deutsch und englisch, mit Widerspruchsweg.

## 4. Offen — nichts davon drängt

**Am Register:**
1. **Masse.** DataCite ist mit einem 24-Stunden-Fenster von 72,7 Mio. Datensätzen erst
   angekratzt. Wege: Zeitscheiben rückwärts oder der Bulk-Download (33 GiB, braucht
   **Franks E-Mail-Registrierung**) — vermessen in `2026-07-26-datacite-dump.md`.
2. **Vor jedem weiteren Adapter prüfen, ob die Quelle ihre Metadaten schon in ein
   offenes Register einspeist.** Bei Kaggle hat genau das den Adapter überflüssig
   gemacht (62.274 Datensätze liegen via DataCite unter CC0 vor). Offen für ArcGIS
   und HuggingFace.
3. EU Open Data Portal nachmessen (stratifiziert), data.gov Wiedervorlage, sechs
   Kandidaten unvermessen (Socrata, Dataverse, OpenDataSoft, OpenML, kuratierte Listen).
4. Kaggle bleibt zurückgehalten, bis die Nutzungsbedingungen geklärt sind.

**Bei Frank:** Cloudflare-Dashboard (Trainings-Crawler auf Block?), Schalter
„Markdown for Agents" anschalten, DataCite-Bulk registrieren.

**Architektur-Ablaufdatum, bewusst notiert:** Die statische Auslieferung des Registers
trägt bis etwa 100.000–200.000 Einträge, dann kippen Bauzeit und Browser-Index. Gemessen:
17.327 Einträge → 606 MB Ausgabe, 110 s Bauzeit, 0,87 MB Suchindex gepackt. Danach braucht
es eine Abfrage-Schicht (D1 oder ein kleiner Dienst); Ernte, Dedup und Snapshot-Vertrag
bleiben unberührt — sie sind genau dafür gebaut.

## 5. Die Fehler dieses Tages

Ausführlich in `dataset-hub/messungen/VERFAHRENSNOTIZEN.md`. Was sich einprägen sollte:

- **Ein Sprung in einer Erfolgsquote ist zuerst ein Verdacht gegen das eigene
  Messverfahren.** 0 von 400 Auflösungen „gescheitert" — in Wahrheit antwortet Kaggle
  auf HEAD mit 404 und auf GET mit 200. 400 falsche Negative.
- **403 ist kein toter Link.** GBIF weist automatisierten Zugriff generell ab, seine API
  liefert dieselbe Ressource mit 200. Führte zum Status `versucht` im Schema.
- **Eine leere Seite ist kein Beweis für Vollständigkeit.** Fünf von sieben Such-APIs
  kappen bei exakt 10.000, zwei davon still (HTTP 200 mit leerer Liste).
- **Convenience-Stichproben verdecken seltene Ausfälle.** ArcGIS zeigte 100 % URL-Abdeckung
  bei n=200; in der Ernte fehlten 3 %.
- **Technische Machbarkeit ist keine Erlaubnis.** Jede Quelle war technisch streng geprüft
  und rechtlich gar nicht — bis Frank fragte. Daraus wurde Gate G5.
- **„Wir veröffentlichen es nicht, wir behalten es nur" ist keine Rechtsposition.**
  Wo Speichern untersagt ist, ist auch das Archiv Speichern.
- **In geteilten Arbeitsverzeichnissen nie `git add -A`** — nur explizite Pfadlisten.
  Ein Sammel-Add hat die Dateien einer parallelen Sitzung unter falscher Nachricht
  eingesammelt.
- **Prüf die Frage, nicht das Wort.** Die Lizenzumstellung war dreimal unvollständig,
  weil jeweils zu eng gesucht wurde: erst nur lokale Repos, dann nur `LICENSE`-Dateien,
  dann nur Dateien im Repo (die GitHub-Beschreibungen sind Metadaten außerhalb).
  Richtige Frage: „behauptet hier noch etwas die alte Lizenz *als geltend*?"
- **Eine CSS-Regel kann ein HTML-Attribut überstimmen.** `display: block` auf einer Klasse
  schlägt `hidden` — der Nachlade-Knopf blieb bei null Treffern mit veralteter Zahl stehen.
  Nur im Browser zu sehen, nicht im Code.
