# Werk-Audit 02 — Halbwertszeit

> Fakten-Dossier. Belege als repo-relative Pfade. Verbatim-Zitate in „…".
> Einzelwerte aus `register.json` sind Tagesstände (ändern sich nächtlich).

## 1. Kurzbeschreibung (Ist)
- **Titel / Untertitel:** „Halbwertszeit" — „Über den Zerfall der Anteilnahme" (`werke.ts`;
  `ui.ts` `hw.sub`: „Über den Zerfall der Anteilnahme — gemessen, Ereignis für Ereignis.").
- **Werkbeschreibung (verbatim, `werke.ts`):** „Für jedes Großereignis mit Todesopfern misst
  eine Pipeline, wie schnell die Aufmerksamkeit zerfällt — Halbwertszeit für Halbwertszeit,
  neben den Konstanten der Physik. Aufgenommen wird per veröffentlichter Regel; niemand wählt aus."
- **Routen:** `/halbwertszeit` (+`/en`), Methodenblatt `/werke/halbwertszeit` (+`/en`).
- **Dateien:** `src/components/pages/HalbwertszeitPage.astro`, `…/MethodenblattHalbwertszeit.astro`,
  `src/lib/halbwertszeit/{types,svg}.ts` (+`svg.test.ts`), Daten `src/data/halbwertszeit/register.json`,
  Pipeline `pipelines/protokoll/src/protokoll/halbwertszeit/*`.
- **Status:** live.

## 2. Datenbasis
- **Ereignisregister:** Wikidata (SPARQL) — Regel: P1120 (Opferzahl) ≥ 25, P585 (Datum) ≥
  2026-01-01; nur Ereignisse mit en-Wikipedia-Artikel; Dedup = Maximum der Opferzahl
  (`halbwertszeit/wikidata.py`). Lizenz CC0.
- **Aufmerksamkeit:** Wikimedia Pageviews REST-API, Agent „user" (Bot-Filter), **Summe über
  18 Sprachen** (`halbwertszeit/__init__.py`: en, de, fr, es, pt, ru, ar, zh, ja, it, tr, fa,
  id, hi, pl, uk, nl, ko). Lizenz CC0. *(GDELT laut Spec „optional später" — nicht implementiert.)*
- **Erzeugte Daten + Pfad + Schema:** `src/data/halbwertszeit/register.json`; Typen in
  `src/lib/halbwertszeit/types.ts`: `rule{deaths_min, since, langs}`, `median_halflife_days`,
  `events[]` mit `qid, label_de/en, date, deaths, languages, languages_failed, peak, peak_day,
  baseline, lambda_per_day, halflife_days, r2, status, views_per_death, series[[date,views]]`.
- **Kadenz:** nächtlich, laut Methodenblatt **04:30 UTC**; ~300 gedrosselte REST-Abrufe.
  *(Scheduler-Konfig nicht im Repo verifizierbar — ZU KLÄREN.)*
- **Fehler-/Plausibilität (Status-Logik, `halbwertszeit/fit.py`):**
  `status` ∈ {`gemessen`, `laeuft`, `nicht_messbar`}; Schwellen u. a. MIN_PEAK 1.000,
  MIN_R² 0,30, MIN_POINTS 8, BASELINE_WINDOW 14, RUNNING_DAYS 21. **Degenerate-Guard**
  (`run.py`): wenn alle Serien leer → kein Commit, Vortagsstand bleibt. **λ konservativ**
  (vor Erreichen des Sockels eher überschätzt → Halbwertszeit eher zu kurz).
  *(Status-Bezeichner laut Code-Erhebung „laeuft"; frühere Spec nannte „vorläufig" — ZU KLÄREN.)*

## 3. Technische Methode
- **Pipeline:** `wikidata.py` (Regel-Abfrage) → `pageviews.py` (Summe über Sprachen,
  fehlertolerant, dokumentiert `languages_failed`) → `fit.py` (Sockel = Median der letzten 14
  Tage; log-lineare Regression; λ, Halbwertszeit = ln(2)/λ, R²) → `run.py` (JSON + Commit).
- **Deterministisch:** vollständig (Mathematik/Regeln); **kein LLM**.
- **Frontend:** statisch aus `register.json`; SVG-Sparklines `src/lib/halbwertszeit/svg.ts`
  (Wurzelskala, damit der Sockel sichtbar bleibt; `svg.test.ts`).
- **Für die Aussage wichtige Codepfade:** Aufnahmeregel (`wikidata.py`), Fit (`fit.py`),
  **Sortierung strikt chronologisch** in `HalbwertszeitPage.astro` (nie nach λ/Halbwertszeit).
- **Zweite Achse:** `views_per_death` (Peak ÷ Opferzahl) als „Ungleichheits"-Deskriptor.

## 4. Künstlerische Setzung (nur aus vorhandenen Texten)
- **These (Spec `2026-06-13-halbwertszeit-design.md`, verbatim):** „Anteilnahme zerfällt
  exponentiell — und die Zerfallskonstante ist messbar. Das Werk misst sie, Ereignis für
  Ereignis, und stellt sie neben die Halbwertszeiten der Physik."
- **Form:** „Eine Zahl + chronologisches Register" (Kommentar in `HalbwertszeitPage.astro`);
  Kopfzahl = mediane Halbwertszeit; physikalische Vergleichskonstanten (z. B. „Cäsium-137:
  30,1 Jahre …") *(verbatim ZU KLÄREN/verifizieren)*; Sparkline je Ereignis.
- **Sprache/Tonalität:** nüchtern-materiell, transparent.
- **Starke Sätze (verbatim, Frontend/Methodenblatt):** „Niemand wählt aus."; „Sortierung
  chronologisch — nie nach Halbwertszeit."; „Wikipedia-Aufrufe sind ein Proxy für
  Anteilnahme, nicht ihr Maß." *(Fundorte `HalbwertszeitPage.astro` / `MethodenblattHalbwertszeit.astro`).* 

## 5. Methodenblatt / Dokumentation
- **Vorhanden** (`MethodenblattHalbwertszeit.astro`, 6-Punkte): Quellen+Lizenzen (Regel
  veröffentlicht), Kadenz, Verarbeitung (Sockel + log-linear, λ, Halbwertszeit, R²,
  Status-Regeln, Median nur über „gemessen"), Grenzen (Wikidata-Bias = fehlende Ereignisse;
  exponentielle Näherung; λ-Überschätzung; Proxy; Dauerereignisse), Compute-Fußabdruck
  (REST statt BigQuery — Kostenbremse), Änderungsprotokoll.
- **Ethik-Hinweise vorhanden (verbatim):** „Es gibt keine Rangliste des Vergessens"; „Die
  Lücke der Unbeachteten ist Teil des Befunds, nicht behebbar." Sortierung chronologisch.
- **Öffentlich fehlende ethische Hinweise (ZU KLÄREN):** keine explizite Reflexion, dass
  `views_per_death` als „Wert eines Lebens" missdeutet werden könnte; keine Nutzungs-Leitlinie
  („nicht zur Opfer-Priorisierung verwenden").

## 6. Prozess / Scheitern / Verwerfung
- **Öffentlich (Methodenblatt/Spec):** Prototyp-Gate bestanden (Spec/Plan: n≈17, Median ≈16,3
  Tage, R²-Median ≈0,63) *(Werte ZU KLÄREN/verifizieren)*; bewusste Abweichung **REST statt
  BigQuery** (Kostengründe) im Plan begründet; zweite Achse (`views_per_death`) ergänzt.
- **Review-Fixes** (Git): NOW()-Filter, Empty-/Degenerate-Guard, „echter" Median.
- **Nur intern:** Spec/Plan unter `docs/superpowers/`.

## 7. Risiken (nur Beobachtung)
- **Dashboard-Risiko:** mittel — eine prägnante Kopfkennzahl (mediane Halbwertszeit) ist
  „merkbar" und könnte als KPI zirkulieren.
- **Gimmick-Risiko:** mittel — Physik-Analogie ist stark, könnte als Effekt gelesen werden.
- **Tech-Demo-Risiko:** niedrig.
- **Pathos-Risiko:** mittel — Thema „Vergessen von Opfern".
- **Ethik-Risiko:** **mittel–hoch** — Quantifizierung von Aufmerksamkeit pro Todesopfer;
  abgefedert durch chronologische Sortierung + sichtbare Status, aber Restmissdeutung möglich.
- **Quellen-/Methodenrisiko:** mittel — Wikidata-Erfassungsbias; Proxy-Charakter der Pageviews.
- **Unklare Werkform:** niedrig.
- **Consulting-/Data-Storytelling-Nähe:** niedrig–mittel.

## 8. Potenziale (nur aus Material)
- **Sonifikation** der Zerfallskurven; **Installation** (chronologisches Live-Register).
- **Begleit-Lab-Note** zur Methode (REST vs. BigQuery; Sockel-Definition).
- **Dataset** (`register.json`) zitierfähig veröffentlichen.
- Anschlussformate: Methodenblatt (vorhanden), Dataset, Sonifikation, Exposition; ein
  explizites Ethik-Begleitstück wäre aus dem Material ableitbar.

## 9. Fehlende Informationen (ZU KLÄREN)
- Status-Bezeichner final („laeuft" vs. „vorläufig"); Prototyp-Zahlen verifizieren.
- Physikalische Vergleichskonstanten — Auswahlkriterium + exakte Werte.
- Soll ein explizites Ethik-Statement (über die Transparenz hinaus) ergänzt werden?
- Wachstumsgrenze des Registers (unbegrenzt? Archivierungsregel?).
- Scheduler/Deployment-Status; Begründung der 18-Sprachen-Auswahl.
- Interpretation/Begleittext zu `views_per_death`.
