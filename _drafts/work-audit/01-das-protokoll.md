# Werk-Audit 01 — Das Protokoll

> Fakten-Dossier. Belege als repo-relative Pfade. Verbatim-Zitate in „…".
> Einzelne Zeilennummern aus der Erhebung sind als Orientierung zu verifizieren (ZU KLÄREN).

## 1. Kurzbeschreibung (Ist)
- **Titel / Untertitel:** „Das Protokoll" — „Die Sitzung der Welt ist eröffnet"
  (`src/data/werke.ts`; `ui.ts` `prot.sub`: „Die Sitzung der Welt ist eröffnet — täglich,
  maschinell, amtlich.").
- **Werkbeschreibung (verbatim, `werke.ts`):** „Jede Nacht verfasst eine Pipeline das
  Sitzungsprotokoll des Planeten — aus zwölf offenen, zitierfähigen Quellen, deterministisch,
  ohne LLM. Jeder Tagesordnungspunkt endet gleich: Beschluss: vertagt."
- **Labels/Claims:** „täglich · maschinell · amtlich"; „ohne LLM"; „Beschluss: vertagt".
- **Routen:** `/protokoll` (`src/pages/protokoll/index.astro`), `/protokoll/<datum>`
  (`[datum].astro`), `/protokoll/archiv` (`archiv.astro`), RSS `/protokoll/feed.xml`
  (`feed.xml.ts`); Methodenblatt `/werke/protokoll`; EN-Spiegel unter `/en/…`.
- **Dateien:** Pipeline `pipelines/protokoll/`; Archiv `src/content/protokoll/<jahr>/<datum>.json`;
  Komponenten `src/components/pages/ProtokollDoc.astro`, `…/MethodenblattProtokoll.astro`,
  `src/components/ProtokollTeaser.astro`; Logik `src/lib/protokoll/{types,data,agenda,render}.ts`.
- **Status:** live (Tages-JSONs 2026-06-11 … 2026-06-14 committet).

## 2. Datenbasis
- **12 Tagesordnungspunkte / 13 Messwerte** (Meereis Nord + Süd getrennt). Quellen
  (Adapter in `pipelines/protokoll/src/protokoll/adapters/`):
  CO₂ NOAA GML (Mauna Loa) · Meereis NSIDC Sea Ice Index v4 · SST NOAA OISST v2.1 (via
  Climate Reanalyzer) · Feuer NASA FIRMS (VIIRS S-NPP NRT) · Beben USGS · Bevölkerung UN WPP
  2024 (Extrapolation) · Vertreibung UNHCR · Ernährung FAO Food Price Index · Geldpreis EZB
  €STR · Energie EIA (Brent) · Konflikt GDELT v2 (BigQuery Public Dataset) · Aufmerksamkeit
  Wikimedia Pageviews (en.wikipedia).
- **Lizenzen/Provenienz:** je Eintrag `source: {name, url, license}` (z. B. in
  `src/content/protokoll/2026/2026-06-14.json`: CO₂ „Public Domain (U.S. Government)",
  Wikimedia „CC0 (Messdaten)", UN WPP „CC BY 3.0 IGO", FAO „CC BY-NC-SA 3.0 IGO").
- **Erzeugte Daten + Pfad + Schema:** `src/content/protokoll/<jahr>/<datum>.json`; Schema in
  `src/content.config.ts` (Felder je Eintrag: `top_id`, `status` ∈ {ok, unavailable,
  implausible}, `unit`, `cadence`, `source{name,url,license}`, `value` (nullable), `as_of`,
  `comparison{label,value}`, `label`, `record`, `note`).
- **Kadenz:** nächtlich, laut Methodenblatt/Spec **03:30 UTC** (Cloud Run Job + Scheduler).
  *(Tatsächliche Scheduler-Konfig nicht im Repo verifizierbar — ZU KLÄREN.)*
- **Fehler-/Plausibilität:** Korridor-Prüfung + Stale-Prüfung + Finite-Guard (`validate.py`,
  `assemble.py`); Status `implausible`/`unavailable` statt stillem Ausfall; Fehlernotiz
  gekürzt, Secrets redigiert (`fetch.py`). **Beleg im Output:** `2026-06-14.json` führt
  `fires` mit `status: "implausible"`, `value: 0.0`.

## 3. Technische Methode
- **Pipeline (Python):** `run.py` → `assemble.py` (Eintrag je Adapter, fehlerisoliert) →
  `validate.py` → `model.py` (JSON, `allow_nan=false`, sortiert) → `github_commit.py`
  (GitHub-API-Commit, Autorin „Protokollführung"). Adapter unter `adapters/`.
- **Frontend-Renderer:** `src/lib/protokoll/render.ts` erzeugt die Prosa **deterministisch**
  aus `agenda.ts`-Templates; `render.test.ts` hält die exakten Registerstrings unter
  Testschutz (CLAUDE.md: „Test-Strings nie aufweichen").
- **Deterministische Teile:** gesamte Erzeugung (Templates, Intl-Zahl/Datum). **Kein LLM**
  (explizit im Methodenblatt: „Templates statt LLM").
- **Für die Aussage wichtige Codepfade:** der unveränderliche Schluss je TOP „Beschluss:
  vertagt." (`render.ts`) und die Kopf-/Schlussformeln (Sitzungssprache).
- **Tests:** `pipelines/protokoll/tests/*` (Adapter, assemble-Isolation, validate, fetch-Retry/
  Redaktion, github_commit gemockt) + `src/lib/protokoll/render.test.ts`.

## 4. Künstlerische Setzung (nur aus vorhandenen Texten)
- **These (Spec `2026-06-11-werkgruppe-design.md`, verbatim):** „Die Welt ist eine
  Dauersitzung ohne Vorsitz, und niemand schreibt mit. Dieses Werk schreibt mit."
- **Form:** Sitzungsprotokoll / Register / über Zeit akkumulierendes Git-Archiv.
- **Sprache/Tonalität:** amtlich-nüchternes Protokolldeutsch; je TOP „Feststellung → Quelle →
  Aussprache: keine. → Beschluss: vertagt." *(Struktur laut Spec; im Renderer umgesetzt.)*
- **Starke Formulierungen:** „Beschluss: vertagt." (struktureller Schluss jedes TOP);
  Teaser-Kuratierung dreier TOPs als „der Planet, die Gewalt, der Blick" *(per Erhebung in
  `ProtokollTeaser.astro` — verbatim ZU KLÄREN/verifizieren).*

## 5. Methodenblatt / Dokumentation
- **Vorhanden** (`MethodenblattProtokoll.astro`, 6-Punkte-Schema): Quellen+Lizenzen (Tabelle,
  dynamisch aus dem Tages-JSON), Kadenz (nächtlich; Monats-/Jahresquellen „behaupten keine
  Tagesfrische"), Verarbeitung („Templates statt LLM", Registerfassung versioniert), Grenzen
  der Methode (u. a. Aufmerksamkeit = en-Wikipedia-Verengung; Bevölkerung = lineare
  Extrapolation; Konflikt = Medienberichte, nicht Ereignisse; Ausfall → „Feststellung
  entfällt"/„unter Vorbehalt"), Compute-Fußabdruck, Änderungsprotokoll.
- **Sichtbare Grenzen:** mehrere, prominent (s. o.). **Fehler-als-Form** öffentlich umgesetzt.
- **Öffentlich fehlende ethische Hinweise (ZU KLÄREN):** Anglophonie-/Westzentrierung von
  GDELT und Wikimedia als *Bias* nicht eigens als ethischer Hinweis markiert; Umgang mit
  Leid-bezogenen TOPs (Vertreibung, Konflikt) nicht eigens ethisch gerahmt.

## 6. Prozess / Scheitern / Verwerfung
- **Öffentlich sichtbar:** Überflug-Ausmusterung (`werke.ts`-Kommentar). 
- **Nur intern:** verworfene Konzepte (laut `werkgruppe-design.md` u. a. „Séance/Was die
  Seite sieht", „Wikipedia-Seismograph") — *als Spec-Inhalt, nicht auf der Site* (ZU KLÄREN,
  ob/inwiefern sichtbar gemacht). Pläne unter `docs/superpowers/plans/2026-06-11-protokoll-kern.md`.
- **Iterationsspuren:** Test-Fixtures (gekürzte echte API-Antworten), umfangreiche Error-State-Tests.

## 7. Risiken (nur Beobachtung)
- **Dashboard-Risiko:** mittel — 12 regelmäßig aktualisierte Kennzahlen ähneln einem
  Lage-Dashboard; Differenzierung über Registerton + „Beschluss: vertagt".
- **Gimmick-Risiko:** niedrig–mittel — „Sitzung der Welt" ist eine starke Konzeptfigur, die
  ohne konsequente Einlösung als Pose lesbar wäre.
- **Tech-Demo-Risiko:** niedrig — Infrastruktur ist dokumentiert/begründet, kein Effekt.
- **Pathos-Risiko:** mittel — Großthema, abgefedert durch nüchternen Registerton.
- **Ethik-Risiko:** mittel — Leid-TOPs + Westzentrierung der Quellen (s. §5).
- **Quellen-/Methodenrisiko:** mittel — viele heterogene Feeds; SST via Forschungsprojekt
  (Climate Reanalyzer); GDELT/FIRMS keys/credentials nötig.
- **Unklare Werkform:** niedrig — als „Untersuchung" gerahmt.
- **Consulting-/Data-Storytelling-Nähe:** mittel — Form (periodischer Lagebericht) grenznah,
  aber kein Narrativ/keine Empfehlung; Fehler bleiben sichtbar.

## 8. Potenziale (nur aus Material)
- **Druckedition/Jahresband** (in Spec genannt) → Druckobjekt/ausstellbares Artefakt.
- **Sonifikation** des Tagesprotokolls (funktional, parametrisch).
- **dbt-Lineage** öffentlich verlinken (im Methodenblatt angekündigt) → Dataset/Methoden-Tiefe.
- **Vergleichende Lektüre** über Zeit (Archiv besteht) — als Lab Note/Exposition.
- Anschlussformate: Methodenblatt (vorhanden), Dataset (Tages-JSONs), Druckobjekt, Exposition.

## 9. Fehlende Informationen (ZU KLÄREN)
- Tatsächlicher Scheduler-Zeitpunkt + Deployment-Status (Cloud Run/Scheduler/Secrets).
- Status der angekündigten **dbt-Lineage** (existiert das Projekt?).
- Redaktionelle Pflege der manuellen Quellen (UNHCR/FAO) — Auslöser/Verantwortung.
- Verbatim-Prüfung: Teaser-Formel „der Planet, die Gewalt, der Blick"; exakte Kopf-/Schlussstrings.
- Ethik-Rahmung der Leid-/Bias-TOPs öffentlich erwünscht?
- Verhältnis Protokoll ↔ Halbwertszeit/Parallaxe/Police (gemeinsame Daten? Reihenfolge?).
