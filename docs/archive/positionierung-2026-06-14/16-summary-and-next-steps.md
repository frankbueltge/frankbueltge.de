# 16 — Abschlussbericht & nächste Schritte

> Kompakter Abschluss der Bestandsaufnahme (2026-06-14). Lesereihenfolge für Frank:
> dieses Dokument → `15-questions-for-frank.md` → `06-positioning-directions.md` → Rest.

## 1. Was gefunden wurde (Kurzfassung)

Eine **technisch reife, inhaltlich substanzhaltige** Astro-Site mit vier laufenden,
quellentransparenten Daten-„Untersuchungen" (Reihe „Die Akte der Gegenwart") plus einer
ehrlich ausgemusterten Studie. Die Werke folgen einem strengen Substanz-Gate, haben
Methodenblätter, deterministische Erzeugung, ein Git-basiertes Archiv und dokumentierte
Fehlentscheidungen. **Die Forschungs-Positionierung ist real gedeckt — aber nur zu ~70 %
nach außen umgesetzt:** Werke, Startseite und Lab sprechen Forschung; About-Seite, Footer,
strukturierte Metadaten und `package.json` sprechen noch „Data & AI Engineer".

## 2. Was stark ist

1. **Substanz statt Behauptung** — vier echte Werke mit Quellen, Methode, Archiv.
2. **Eingebaute Selbstkritik** — Überflug ausgemustert, Parallaxe nach Prototyp-Scheitern
   neu entworfen. Stärkster Glaubwürdigkeitsbeleg für „Forschung".
3. **Fehler-als-Form, real** — `status:"implausible/unavailable"` im Output, nie still.
4. **Trockener, forensischer Ton** — immunisiert Großthemen gegen Kitsch.
5. **Reduktion & Datenethik** — kein Tracking, self-hosted, Mono-Skin, kein Opfer-Ranking.
6. **Der Leitsatz** „Messinstrumente, keine Visualisierungen." — bescheiden, präzise, tragfähig.

## 3. Was riskant ist (Top-Risiken; Details in 05)

- 🔴 **R-13** Impressum/Datenschutz sind Platzhalter → **harter Go-Live-Blocker.**
- 🔴 **R-01** Halb umgestellte Selbstbeschreibung (About/Footer/Schema/package.json) →
  wirkt unentschlossen / consulting-nah genau bei der Zielgruppe.
- 🔴 **R-02** „Artistic Research" als Etikett **ohne Research Statement.**
- 🟠 **R-03** Zwei Consulting-Artikel unter „Forschung in den Künsten" (Register-Bruch).
- 🟠 **R-06** Gesamteindruck kippt Richtung **Analytics-Portfolio.**
- 🟠 **R-09** Drei Sektions-Begriffe (`/work`, `/werke`, `/lab`) — URL-Schema uneinheitlich.
- 🟠 **R-15** Datenethik sensibler Quellen nur intern adressiert.

## 4. Was fehlt

- **Research Statement / Reihen- & Methodentext** für Außenstehende.
- **Biografische Linie** (frühere Forschung, Masterarbeit, Wiederaufnahme) — der stärkste
  ungenutzte Beleg; Fakten dazu **ungeklärt** (nicht erfunden).
- **Verbreiterung der Mittel** über das „Register" hinaus (Zufall, Sensorik) — deckt
  Richtung C und den „Zufall"-Claim.
- **Bildebene / OG-Images.**
- **Rechtskonforme Pflichtseiten.**

## 5. Erstellte Dokumente (alle in `docs/`, nichts Öffentliches verändert)

| Datei | Phase |
|---|---|
| `00-project-index.md` | 1 |
| `01-technical-architecture.md` | 1 |
| `02-content-inventory.md` | 1 |
| `03-positioning-audit.md` | 2 |
| `04-language-and-tone-audit.md` | 2 |
| `05-risk-register.md` | 2 |
| `06-positioning-directions.md` | 3 |
| `07-discourse-map.md` | 4 |
| `08-work-and-experiment-framework.md` | 5 |
| `09-taxonomy-works-experiments-notes.md` | 5 |
| `10-information-architecture.md` | 6 |
| `11-publication-criteria.md` | 7 |
| `12-no-gos.md` | 7 |
| `13-roadmap.md` | 8 |
| `14-experiment-seeds.md` | 9 |
| `15-questions-for-frank.md` | 10 |
| `16-summary-and-next-steps.md` | 12 (dieses) |
| `CLAUDE.md.proposed.md` | 11 (Vorschlag, nicht angewendet) |

## 6. Die nächsten 5 sinnvollen Schritte

1. **🔴 Blocker-Fragen beantworten** (15: B-1, B-2, B-3, M-1, P-1) — ohne sie keine
   verantwortbaren öffentlichen Texte. Insbesondere echte Impressums-/Datenschutzdaten.
2. **Richtung & Leitbegriff festlegen** (06 + 15/P-2): Empfehlung **B, im Ton von A, mit
   C/D als Trajektorie**; DE-Leitbegriff wählen.
3. **Konsistenz freigeben & ausarbeiten** (R-01/R-07, nach Freigabe): About/Footer/JSON-LD
   entkonsultieren, `package.json` entschärfen — als reviewbare Vorschläge, dann Umsetzung.
4. **Research Statement v1 + Beruf-Trennung** (R-02/R-03): eine Seite schreiben, zwei
   Consulting-Posts neu verorten.
5. **Erstes neues Experiment wählen** (14): S-01 (manipulierter Zufall, Masterarbeitslinie)
   oder S-03 (Infrastruktur-Selbstkosten, USP) — beide ohne Hardware startbar.

## 7. Welche Dateien NICHT geändert wurden

- **Keine** öffentlichen Seiten, Komponenten, Routen, Texte oder Styles.
- **Keine** Dateien außerhalb von `docs/`.
- **Das reale `CLAUDE.md` wurde nicht verändert** (nur ein Vorschlag in `docs/` abgelegt).
- **Keine** Pipeline-, Daten-, Config- oder Build-Dateien angefasst.
- **Keine** Git-Commits, kein Push, kein Deployment.
- Konkret unverändert u. a.: `src/**`, `pipelines/**`, `package.json`, `astro.config.mjs`,
  `vercel.json`, `CLAUDE.md`, `.github/**`, `public/**`, `scripts/**`.

## 8. Offene Fragen an Frank (Zusammenfassung)

Vollständig in `docs/15-questions-for-frank.md`. **Mindest-Set zum Start:**
- **B-1/B-2/B-3** — Identität, Recht, Arbeitgeber-Nennung.
- **M-1/M-2/M-4** — Eckdaten + These der Masterarbeit; welche Verfahren reaktivieren.
- **W-1** — Trennung Forschung/Beruf bestätigen.
- **P-1/P-2/P-3** — Freigabe für nicht-öffentliche Änderungen; Leitbegriff; IA-Variante.
- **V-1** — Bestätigung: institutionelle Ziele nur Motivation, kein Claim.

## 9. Eine ehrliche Gesamteinschätzung

Das Projekt ist **deutlich weiter, als es sich nach außen gibt.** Das Hauptproblem ist nicht
fehlende Substanz, sondern eine **unfertige Naht** zwischen alter (Engineer) und neuer
(Researcher) Identität — plus zwei harte, aber leicht behebbare Go-Live-Blocker (Recht,
Konsistenz). Wenn die Naht geschlossen, ein knappes Research Statement geschrieben und der
Beruf sauber abgegrenzt ist, steht eine **ungewöhnlich glaubwürdige** Ausgangsbasis für eine
datenbasierte Artistic-Research-Praxis — ohne Überhöhung, ohne Erfindung, getragen von dem,
was real gemessen und gezeigt wird.
