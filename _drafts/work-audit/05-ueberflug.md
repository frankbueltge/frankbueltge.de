# Werk-Audit 05 — Überflug (ausgemusterte Studie / Nicht-Werk)

> Fakten-Dossier. Belege als repo-relative Pfade. Verbatim-Zitate in „…".
> Besonderheit: **kein Werk der Reihe** — am Substanz-Gate gescheitert, lebt als Lab-Studie.

## 1. Kurzbeschreibung (Ist)
- **Bezeichnung (Frontmatter `src/content/lab/ueberflug-studie/de.mdx`):** „Studie: Überflug",
  Beschreibung „SGP4 im Browser — welche Erdbeobachtungssatelliten einen Standort gerade im
  Sichtfeld haben. Eine technische Etüde, kein Kunstwerk." (EN analog: „Study: Überflug … A
  technical étude, not an artwork.").
- **Status:** **ausgemustert als Werk (2026-06-12)**; Verbleib als Studie im Lab.
  Werk-Registry-Kommentar (verbatim, `werke.ts`): „Überflug wurde am 2026-06-12 aus der Reihe
  genommen (keine These, keine Akkumulation — fällt durch das Substanz-Gate) und lebt als
  Studie im Lab weiter: src/content/lab/ueberflug-studie/". Spec-Header
  (`docs/superpowers/specs/2026-06-12-ueberflug-design.md`): „AUSGEMUSTERT als Werk (2026-06-12)".
- **Routen:** **nicht** in der Reihe; erreichbar als Lab-Studie (`/lab/ueberflug-studie`).
  Frühere Routen `/ueberflug`, `/werke/ueberflug` (+EN) wurden entfernt (ZU KLÄREN/verifizieren:
  Commit-ID); Methodenblatt-Komponente gelöscht.
- **Dateien:** `src/content/lab/ueberflug-studie/{de,en}.mdx`,
  `src/components/ueberflug/{UeberflugIsland.astro, tally-worker.ts}`,
  `src/lib/ueberflug/{types,snapshot,visibility}.ts` (+Tests), Daten
  `src/data/ueberflug/satellites.json`, `scripts/fetch-ueberflug.ts`,
  `.github/workflows/ueberflug-refresh.yml`.

## 2. Datenbasis
- **Quellen:** CelesTrak (OMM/JSON; GROUPs `resource`, `sar`, `weather`; „frei verfügbar;
  Attribution; Ursprung USSPACECOM/Space-Track") + GCAT (J. McDowell, `active.tsv`,
  **CC-BY 4.0**) für Eigentümer-/Klassen-Klassifikation (`src/lib/ueberflug/snapshot.ts`).
- **Erzeugte Daten + Pfad + Schema:** `src/data/ueberflug/satellites.json`
  (`SatSnapshot{generated_at, sources[], satellites[]}`; je `SatEntry`: `norad, name, intl,
  group, gcat{class,category,owner,state}, omm`). Klassen-Mapping C=staatlich-zivil,
  D=militärisch, B=kommerziell, A=Amateur, null=nicht klassifiziert (`visibility.ts`).
- **Kadenz:** GitHub Action **täglich 05:00 UTC** (`ueberflug-refresh.yml`), Commit als
  „Protokollführung". **Überschreibt** die Datei — **keine Akkumulation** (Spec: „Bahndaten
  sind operativ … kein Werkarchiv — Git-Historie genügt.").
- **Fehler-/Plausibilität (`scripts/fetch-ueberflug.ts`):** Abbruch (kein Schreiben), wenn
  < 200 Satelliten oder GCAT-Join-Quote < 50 %.

## 3. Technische Methode
- **Client-seitige SGP4-Propagation** mit `satellite.js` v7 (MIT): `json2satrec`, `propagate`,
  `eciToEcf`, `ecfToLookAngles` (in `UeberflugIsland.astro`). **Determiniert; kein LLM.**
- **Sichtbarkeits-Schwellen (`visibility.ts`):** Sichtkontakt > 10°, Abbildungsgeometrie ≥ 35°
  (Tests `visibility.test.ts` bestätigen Grenzen).
- **Tally** seit Mitternacht via Web Worker (`tally-worker.ts`, 30-s-Raster, Flankenzählung).
- **Datenschutz (Codeverhalten + `ui.ts` `uefl.privacy`):** „Dein Standort verlässt diesen
  Browser nicht. Nichts wird gespeichert, nichts gesendet — alles rechnet lokal."
- **Wichtige Codepfade:** lokale Propagation/Filterung; DOM via `createElement` (XSS-arm);
  Worker-Race-Schutz (`if (worker !== tallyWorker)`) — *Review-Fix laut Erhebung, ZU KLÄREN/verifizieren.*

## 4. Künstlerische Setzung (nur aus vorhandenen Texten)
- **Kern: bewusst KEINE These** — genau das ist der Ausmusterungsgrund (de.mdx, verbatim):
  „Diese Studie begann als Werk-Kandidat der Akte der Gegenwart — und wurde aussortiert. …
  Ein Werk erhebt eine überprüfbare Behauptung über die Welt. Diese Seite behauptet nichts.
  … eine Auskunft, keine These — eine App, kein Werk."
- **Form:** Utility/Register (sortierte Liste; kein Globus/keine Karte — bewusste Reduktion).
- **Sprache/Tonalität:** ehrlich, technisch-reduktiv, grenzenbewusst.
- **Starke Sätze (verbatim, de.mdx):** „„Sichtkontakt möglich" heißt Elevation über 10°,
  „Abbildungsgeometrie wahrscheinlich" ab 35°; beides ist Geometrie, keine Aufnahme. Geheime
  Satelliten fehlen im Katalog."

## 5. Methodenblatt / Dokumentation
- **Eigenes Methodenblatt entfernt** (Komponente bei Ausmusterung gelöscht). Methoden-/
  Grenzangaben stehen **inline in den MDX-Texten** (Quellen, Geometrie ≠ Aufnahme, Katalog
  unvollständig) sowie in der Spec (intern).
- **Ethik-Hinweise vorhanden:** Standort lokal, nichts gespeichert/gesendet; „Geometrie, keine
  Aufnahme"; „Geheime Satelliten fehlen".
- **Öffentlich fehlend / offen (ZU KLÄREN):** ob eine Studie ein formales Methodenblatt haben
  soll; ob `uefl.*`-i18n-Keys nach Routen-Entfernung noch benötigt werden (nur noch im Island
  genutzt).

## 6. Prozess / Scheitern / Verwerfung (Kernpunkt dieser Arbeit)
- **Vollständig realisiert, dann am Gate verworfen** und **ehrlich umetikettiert** (Werk →
  Lab-Studie, 2026-06-12). Öffentlich sichtbar in: MDX-Text, `werke.ts`-Kommentar,
  Spec-Header, Git-Historie (Snapshot-Pipeline läuft weiter).
- **Dokumentierte Verwandlungsbedingung (verbatim, de.mdx):** „Nicht der Blick nach oben ist
  interessant, sondern seine Veränderung — die Verdichtung des Blicks. Die tägliche
  Snapshot-Pipeline könnte statt zu überschreiben eine Zeitreihe führen … Das wäre eine
  messbare These. Bis jemand sie braucht, bleibt dies eine Studie."
- **Nur intern:** Spec/Plan unter `docs/superpowers/`.

## 7. Risiken (nur Beobachtung)
- **Tech-Demo-/Gimmick-Risiko:** hoch — **selbst benannt** („App, kein Werk"; „was hunderte
  Tracker-Seiten auch zeigen"). Genau deshalb ausgemustert.
- **Werkform-Status:** bewusst Nicht-Werk; als Etüde transparent gerahmt.
- **Ethik-Risiko:** niedrig — lokale Berechnung, keine Aufnahmebehauptung.
- **Persistenz-Risiko:** Überschreiben statt Archiv — eine spätere Zeitreihe erfordert
  Architekturänderung oder Git-Historie-Parsing.

## 8. Potenziale (nur aus Material)
- **Härtung zur These durch Akkumulation** (die im MDX genannte Zeitreihe: Verdichtung des
  Orbits; Verhältnis kommerziell/militärisch über Zeit) → könnte Substanz-Gate erfüllen.
- Anschlussformate: bleibt **Studie/Etüde**; bei Akkumulation **Experiment → Work** denkbar
  (nur dann, mit messbarer These).

## 9. Fehlende Informationen (ZU KLÄREN)
- Ist „Studie/Etüde" eine offiziell definierte Kategorie der Reihe (vs. Ad-hoc-Label)?
- Soll eine Zeitreihe (Akkumulation) aufgebaut werden — und ab wann sinnvoll?
- Werden `uefl.*`-i18n-Keys / entfernte Routen final bereinigt?
- Verifikation der entfernten Routen/Commit-ID und des Worker-Race-Fixes.
- Soll die Studie ein eigenes (leichtes) Methodenblatt erhalten?
