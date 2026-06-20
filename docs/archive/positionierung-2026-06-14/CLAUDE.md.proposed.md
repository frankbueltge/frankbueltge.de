# Vorschlag: überarbeitetes CLAUDE.md

> **Status: VORSCHLAG — nicht angewendet.** Das reale `frankbueltge.de/CLAUDE.md` wurde
> **nicht** verändert. Diese Datei enthält (A) eine Analyse des bestehenden CLAUDE.md und
> (B) eine vollständige, drop-in-fähige verbesserte Fassung. **Anwenden erst nach Freigabe.**

---

## A. Analyse des bestehenden CLAUDE.md

**Stärken (unbedingt erhalten):**
- Klare, verbindliche Werkgruppen-Regeln: kein LLM-Werktext, Archiv-JSONs unantastbar,
  Register-Strings unter Testschutz, Secret-Hygiene, kein Backfill, Fehler-als-Form.
- Knappe Architektur-Beschreibung, Befehle, wichtige Pfade, Deployment.

**Lücken (zu ergänzen, gem. Auftrag Phase 11):**
1. **Keine Positionierungs-/Tonalitätsregeln** (Marketing-/Theoriepose-Verbot fehlt).
2. **Keine Regeln für öffentliche Texte** und für die `docs/`-Dokumentation.
3. **Keine Biografie-Wahrheitsregel** (keine erfundenen Fakten).
4. **Keine Theorie-/Deleuze-Regel** (keine Philosophie als Hauptachse).
5. **Keine Freigabe-Regel** für Änderungen an öffentlichen Seiten.
6. **Keine Unsicherheits-Regel** (nachfragen / UNGEKLÄRT markieren).
7. **Kleiner Faktenfehler:** Hosting wird teils als „Cloudflare Pages" beschrieben; real ist
   **Vercel** (`vercel.json`, `.vercel/`, Datenschutztext „Vercel Inc.").

**Empfehlung:** bestehende technische Regeln 1:1 übernehmen, die sechs fehlenden Regelblöcke
ergänzen, den Hosting-Hinweis korrigieren.

---

## B. Vorgeschlagene vollständige Fassung (drop-in)

```markdown
# CLAUDE.md — frankbueltge.de

Persönliche Website von Frank Bültge — und zugleich die Reihe **„Die Akte der Gegenwart"**:
datenbasierte „Untersuchungen" an der Schnittstelle von Daten, Wissenschaft und Gesellschaft.
Positionierung im Aufbau: **datenbasierter Artistic Researcher** (Data Engineering &
künstlerische Forschung). Die Website ist noch nicht öffentlich.

## Projektziel
Eine belastbare, langfristig tragfähige künstlerisch-forschende Praxis **zeigen** (nicht
behaupten): laufende, quellentransparente Untersuchungen, sichtbare Methode, sichtbarer
Prozess (inkl. Scheitern). Substanz vor Anspruch.

## Tonalität
- Nüchtern, präzise, amtlich-forensisch. Behaupten = belegen; Quelle vor Deutung.
- Großthemen nur mit sofortiger Daten-/Quellendeckung.
- Zurückhaltung statt Selbstinszenierung; kein Status-/Kunst-Anspruch.
- **Keine** Marketing-/Bewerbungssprache, **kein** Kunst-/KI-Pathos, **keine** Buzzwords,
  **keine** Theoriepose.

## No-Gos (Kurzform; ausführlich in docs/12-no-gos.md)
- Keine erfundenen Fakten (Bio, Ausstellungen, Publikationen, Awards, Kooperationen, Werke,
  Zahlen, Institutionen) und keine ungeprüften Zitate/Literaturangaben.
- Keine Theorie/Philosophie als Hauptachse. **Deleuze nur als eine mögliche historische
  Referenz**, nie als Achse, Schule oder Markenzeichen.
- Keine institutionellen Claims (z. B. ZKM) als Anspruch.
- Keine Marketing-Sprache („Award-caliber", „Experte", „Insights", „Data Products").
- Kein LLM-generierter Werktext; kein Backfill; kein stilles Überbrücken von Quellenausfällen.
- Keine dekorative Datenverzerrung, keine Tech-Demo-Ästhetik, keine „AI-Art"-Beliebigkeit.
- Keine Secrets/PII im öffentlichen Archiv; kein Tracking auf der Site.
- Beruf/Engineering nicht mit Forschung vermischen.

## Befehle
\`\`\`bash
npm run dev              # localhost:4321
npm run build            # statischer Build → dist/
npm run check            # astro check (TypeScript)
npm run test             # Vitest (u. a. Register-Tests des Protokolls)
npm run protokoll:dry    # Protokoll-Pipeline lokal (schreibt JSON, committet nichts)
npm run climate:refresh  # GISTEMP-Snapshot aktualisieren
npm run ueberflug:refresh# Bahndaten-Snapshot aktualisieren
# Pipeline-Tests (eigene venv):
cd pipelines/protokoll && source .venv/bin/activate && pytest -q
\`\`\`

## Architektur in einem Absatz
Astro 5, statisch, zweisprachig (de unter \`/\`, en unter \`/en\`), Tailwind v4, Mono-Skin fest
(Skin-System stillgelegt, im Repo erhalten). **Git ist das Archiv:** Pipelines committen
versionierte JSON-Snapshots ins Repo (kein dynamisches Lesen aus Cloud-Diensten zur Laufzeit).
Die Protokoll-Pipeline (\`pipelines/protokoll/\`, Python 3.12, Cloud Run Job, 03:30 UTC) schreibt
täglich \`src/content/protokoll/<jahr>/<datum>.json\` per GitHub-API-Commit (Autorin
„Protokollführung"). **Hosting: Vercel** (statisch, \`dist/\`); Rebuild-Trigger ist der
nächtliche Commit. Überflug-Bahndaten werden per GitHub Action (05:00 UTC) aktualisiert.

## Reihe „Die Akte der Gegenwart" — verbindliche Regeln
- **Spec:** \`docs/superpowers/specs/2026-06-11-werkgruppe-design.md\` (Substanz-Kriterien §2
  sind das Gate für jede neue Untersuchung; Methodenblatt-Pflicht §3.5).
- **Kein LLM-Werktext.** Die Prosa ist deterministisch aus Templates
  (\`src/lib/protokoll/agenda.ts\`, \`render.ts\`); die exakten Strings stehen unter Testschutz
  (\`render.test.ts\`). **Test-Strings nie aufweichen** — sie sind das abgenommene Register.
  (Ausnahme LLM: Parallaxe nutzt Gemini ausschließlich zur Extraktion mit publiziertem
  Prompt; die Werk-Prosa bleibt deterministisch.)
- **Archiv-JSONs sind unantastbar.** Committete Tagesprotokolle werden nie editiert;
  Korrekturen nur an der Darstellung (Registerfassung versioniert).
- **Fehler als Form:** Quellenausfälle werden amtlich vermerkt („Feststellung entfällt"),
  nie still überbrückt. Adapter erfinden nichts.
- **Secrets:** API-Keys nie in Fehlermeldungen/URLs (fetch redigiert Query-Strings, FIRMS
  maskiert den Pfad-Key) — Vermerke landen im öffentlichen Archiv.
- **Kein Backfill:** Adapter holen stets den jüngsten Stand; ein rückdatiertes Protokoll
  mit heutigen Messwerten wäre eine Lüge im Archiv.
- **Ethik:** kein Opfer-Ranking; bei sensiblen Quellen (Opfer, Vertreibung, Konflikt)
  ethische Grenzentscheidung im Methodenblatt benennen.

## Regeln für öffentliche Texte
- Erst nach Klärung der offenen Fragen (\`docs/15-questions-for-frank.md\`) schreiben.
- Jede Aussage muss durch ein Werk/Daten gedeckt sein; im Zweifel weglassen.
- Beruf strikt nachgeordnet/abgegrenzt von der Forschung.
- Konsistenz: dieselbe Selbstbeschreibung auf Home, About, Footer, JSON-LD.

## Regeln für Dokumentation
- Interne Analysen/Strategie liegen in \`docs/\` (Reihe \`00–16\`).
- Werk-Specs/Pläne unter \`docs/superpowers/\` bleiben die technische Wahrheit.
- Unklares wird **UNGEKLÄRT / ZU KLÄREN** markiert, nicht geraten.

## Arbeitsweise
- **Keine Änderung an öffentlichen Seiten, Komponenten, Routen, Texten oder Styles ohne
  ausdrückliche Freigabe.** Vorschläge zuerst in \`docs/\`.
- Bei Unsicherheit: nachfragen oder als UNGEKLÄRT markieren.
- \`git status\` vor und nach der Arbeit; keine riskanten Befehle, keine Deployments ohne Auftrag.
- Tests/Builds (\`npm run test\`, \`check\`, \`build\`; \`pytest -q\`) bei relevanten Änderungen
  laufen lassen oder die nötigen Befehle benennen.

## Wichtige Pfade
| Pfad | Inhalt |
|---|---|
| \`pipelines/protokoll/\` | Python-Pipeline (Adapter, Assembler, Committer, Runbook) |
| \`src/content/protokoll/\` | kanonisches Archiv (Tages-JSONs) |
| \`src/lib/protokoll/\` | Typen, Datenzugriff, Tagesordnung, Renderer + Tests |
| \`src/data/\` | redaktionelle Inhalte + committete Register/Snapshots |
| \`src/pages/\` | Routen (DE; EN-Spiegel unter \`src/pages/en/\`) |
| \`docs/00–16\` | Positionierung, Audits, Strategie (dieser Dokumentensatz) |
| \`docs/superpowers/\` | Design-Specs und Implementierungspläne |

## Deployment
Site-Hosting **Vercel** (statisch, \`dist/\`). Daten: GCP Cloud Run Jobs + Scheduler + Secret
Manager (Runbook: \`pipelines/protokoll/README.md\`). Secrets: GitHub-Fine-Grained-PAT (nur
dieses Repo, Contents R/W), FIRMS_MAP_KEY, EIA_API_KEY.
```

---

## C. Hinweis zur Anwendung
Beim Übernehmen in das reale `CLAUDE.md`:
- Den obigen Codeblock-Inhalt (zwischen den ```` ```markdown ````-Zeilen) als gesamte
  Datei `frankbueltge.de/CLAUDE.md` setzen.
- Vorher prüfen, ob `climate:refresh`/`ueberflug:refresh` exakt so heißen (tun sie laut
  `package.json`).
- **Freigabe abwarten** (siehe docs/15 P-1).
