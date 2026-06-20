# Werk-Audit 03 — Parallaxe

> Fakten-Dossier. Belege als repo-relative Pfade. Verbatim-Zitate in „…".
> Einzelwerte aus `register.json` sind Tagesstände.

## 1. Kurzbeschreibung (Ist)
- **Titel / Untertitel:** „Parallaxe" — „Was jede Sprache verschweigt" / EN „What each
  language conceals" (`werke.ts`; `ui.ts` `px.sub`: „… die Architektur der Auslassung.").
- **Werkbeschreibung (verbatim, `werke.ts`):** „Dieselbe umstrittene Sache, acht
  Sprachversionen der Wikipedia — und die Messung, welche Aussage jede Version benennt und
  welche sie verschweigt. Die japanische Beschreibung der Senkaku-Inseln etwa erwähnt den
  Territorialstreit mit keinem Wort."
- **Kopfzeile (Frontend, `ParallaxePage.astro`):** „Im Mittel verschweigt jede Sprachversion
  {pct} % dessen, was die anderen benennen." (aktueller Stand laut Erhebung: `mean_omission_index`
  ≈ 0,63 → „63 %" — Tagesstand, ZU KLÄREN/verifizieren).
- **Routen:** `/parallaxe` (+`/en`), Methodenblatt `/werke/parallaxe` (+`/en`).
- **Dateien:** `src/components/pages/ParallaxePage.astro`, `…/MethodenblattParallaxe.astro`,
  `src/lib/parallaxe/{types,data,labels}.ts` (+`labels.test.ts`), Daten
  `src/data/parallaxe/register.json`, Pipeline `pipelines/protokoll/src/protokoll/parallaxe/*`.
- **Status:** live.

## 2. Datenbasis
- **Quelle:** Wikipedia-Kategorien „States with limited recognition" + „Disputed islands"
  (CC BY-SA); je Thema die Einleitungstexte (Lead Sections) der Sprachversionen (REST-API).
  Auswahl rein kategoriebasiert, keine Kuration pro Thema (`parallaxe/register.py`).
- **Sprachen:** Pipeline arbeitet mit **12** (`parallaxe/__init__.py`: de, en, ru, uk, ar, he,
  zh, ja, fa, tr, es, fr), Mindestschwelle 5 je Thema; Themen-Cap 24/Nacht.
  → **Diskrepanz:** Werkbeschreibung sagt „acht Sprachversionen". **ZU KLÄREN.**
- **Erzeugte Daten + Pfad + Schema:** `src/data/parallaxe/register.json`; Typen
  `src/lib/parallaxe/types.ts`: `rule{source, min_langs, cap, model}`, `mean_omission_index`,
  `topics[]` mit `en_title, lang_count, protection, langs, lemma{lang→name}, name_umstritten,
  claims[{aussage, by_lang{lang→'nennt'|'verschweigt'|'widerspricht'}}], omission_by_lang,
  mean_omission`.
- **Kadenz:** nächtlich, laut Methodenblatt **05:30 UTC**; ein Gemini-Aufruf je Thema.
  *(Scheduler-Konfig nicht im Repo verifizierbar — ZU KLÄREN.)*
- **Fehler-/Plausibilität:** Fault-Isolation je Thema; Thema nur ab ≥ MIN_LANGS Sprachen;
  **Degenerate-Guard** (`run.py`): 0 Themen → keine Datei, Exit 1, Vortagsstand bleibt.

## 3. Technische Methode
- **Pipeline-Module (`parallaxe/`):** `register.py` (Kategorien, langlinks, protection,
  rank), `extracts.py` (Lead Sections), `prompt.py` (**publizierter** Prompt), `extract_llm.py`
  (Vertex-Gemini-Aufruf), `analyze.py` (deterministische Auslassungs-Indizes), `run.py`
  (Orchestrierung, ThreadPoolExecutor, 8 Worker).
- **LLM/KI — exakt:** **ein** Schritt: Auslassungs-Extraktion. Modell **`gemini-2.5-flash-lite`**
  (Vertex AI, Region us-central1), `temperature: 0`, `responseMimeType: application/json`,
  `thinkingBudget: 0`. Token in Produktion über GCP-Metadaten-Server (169.254.169.254),
  lokal Fallback `gcloud auth print-access-token`; Retry bei 401/429/503. Der **Prompt ist im
  Methodenblatt wortgetreu veröffentlicht** (aus `parallaxe/prompt.py`).
- **Deterministisch:** Themenauswahl/-Ranking, gesamte Index-Arithmetik (`analyze.py`,
  getestet), JSON-Serialisierung; Claims im Frontend nach Auslassungsanzahl absteigend sortiert.
- **Für die Aussage wichtige Codepfade:** `extract_omissions()` (einziger LLM-Schritt),
  `omission_index()`/`mean_omission()` (Maß), Matrix-Rendering in `ParallaxePage.astro`.

## 4. Künstlerische Setzung (nur aus vorhandenen Texten)
- **These (alt → neu, Spec `2026-06-13-parallaxe-design.md`):** alt „… ihr Abstand ist
  messbar" (Embedding-Distanz); **neu (verbatim):** „Es gibt nicht eine Beschreibung der Welt,
  sondern viele — und was jede Sprache *verschweigt*, ist das Messgerät."
- **Form:** Matrix (Zeilen = Aussagen, Spalten = Sprachen; Zelle: nennt/verschweigt/
  widerspricht), statisch; „Punkt = verschwiegen. Was fehlt, ist das Werk."
- **Sprache/Tonalität:** analytisch-transparent; der publizierte Prompt als Vertrauensgeste.
- **Starke Sätze (verbatim, `MethodenblattParallaxe.astro`):** „… jede Zelle der Matrix ist
  gegen den verlinkten Quelltext prüfbar: ein transparenter Extraktor, kein Orakel." /
  „Gemini ist ein Extraktor, dessen Urteil fehlbar ist — aber prüfbar."

## 5. Methodenblatt / Dokumentation
- **Vorhanden** (6-Punkte) inkl. **vollständig publiziertem Prompt**. Grenzen (verbatim,
  Auszug): „Die Domäne ist bewusst auf Souveränitäts- und Territorialstreitigkeiten
  geschärft …"; „Ein früherer Embedding-Ansatz scheiterte (Faktor 0,97 …)"; „Der
  Auslassungsindex … gewichtet nicht nach Bedeutung."; „Gemessen wird nur der Einleitungstext";
  „Die Wikipedia-Kategorien sind selbst nicht neutral."
- **Öffentlich fehlende ethische Hinweise (ZU KLÄREN):** kein expliziter Hinweis
  „Auslassung ≠ Zensur" (Knappheit vs. Haltung); geopolitisch heikle Themen (z. B.
  Israel/Palästina, Senkaku) nicht eigens als Sensibilität gerahmt; keine
  Validierungs-/Auditierungsschicht der LLM-Urteile beschrieben.

## 6. Prozess / Scheitern / Verwerfung
- **Öffentlich sichtbar:** Methodenblatt nennt das Embedding-Scheitern („Faktor 0,97").
- **Nur intern (Rohbeleg):** `docs/superpowers/artifacts/2026-06-14-parallaxe-prototyp.json` —
  Testfall „Senkaku/Diaoyu (umkämpft) vs Photosynthese (Kontrolle)":
  - Intro/Pivot-Englisch: umkämpft **0,138** vs. Kontrolle **0,111** (Faktor **1,2**).
  - Volltext multilingual: umkämpft **0,117** vs. Kontrolle **0,12** (Faktor **0,97**).
  - Verdikt (verbatim): „Embedding-Distanz diskriminiert nicht (Faktor ~1,0) — konzeptionell,
    nicht durch Tuning behebbar."
- **Redesign (A) gewählt** (Spec §5b): Auslassungsmatrix; LLM-Gate bestanden. Git-Historie
  dokumentiert Design → Prototyp-Gate → Redesign → Implementierung → erste Messung.
- **Künstlerweiche** (Spec): A (Auslassung) / B (LLM-frei, schmal) / C (ruhen lassen) —
  Variante A gewählt.

## 7. Risiken (nur Beobachtung)
- **LLM-Blackbox-Risiko:** zentral — deterministisch (temp 0), aber nicht erklärbar;
  Fehlklassifikation möglich; keine zweite Instanz/Stichprobenprüfung beschrieben. Abgefedert
  durch publizierten Prompt + Quelltext-Prüfbarkeit.
- **„AI-Art"-Nähe:** mittel — Gegenargument: künstlerische Setzung liegt in der *Frage*
  (Auslassung), nicht in der Modellnutzung.
- **Gimmick-/Dashboard-Risiko:** mittel — Matrix als „Spielzeug" lesbar, wenn „Auslassung =
  fehlendes Wissen" nicht verstanden wird.
- **Ethik-/Geopolitik-Risiko:** **mittel–hoch** — kann als „Beschämung" einzelner
  Sprachversionen wirken; „Auslassung ≠ Fehler" nicht explizit.
- **Quellen-/Methodenrisiko:** mittel — Wikipedia-Kategorien nicht neutral; nur Lead Sections.
- **Unklare Werkform:** mittel — Seite wirkt wie neutrale Infoseite; wenig kontextualisierender Werktext.
- **Consulting-Nähe:** niedrig–mittel — Methode universalisierbar; bewusst auf Souveränität geschärft.

## 8. Potenziale (nur aus Material)
- **Validierungsschicht** (Stichproben-Prüfung der Gemini-Urteile) → härtet Methode.
- **Zeitreihe** (Git-Historie vorhanden) → Veränderung der Auslassung über Zeit (messbare These).
- **Sprachpaar-Vergleich / Quelltext-Verlinkung je Zelle** → Prüfbarkeit sichtbar machen.
- Anschlussformate: Methodenblatt (vorhanden), Dataset, Lab Note (Prototyp-Scheitern),
  Exposition (Methoden-/Modellkritik), ggf. Druck der Matrix.

## 9. Fehlende Informationen (ZU KLÄREN)
- **„acht" vs. 12 Sprachen** — Außentext an Pipeline angleichen.
- Senkaku-Beispiel: noch im aktuellen `register.json` enthalten? (Cap/Lead-Fetch-abhängig).
- Validierung/Auditing der LLM-Ausgaben geplant?
- Expliziter Ethik-Hinweis „Auslassung ≠ Zensur" + Umgang mit geopolitisch heiklen Themen.
- Begründung der 12-Sprachen-Auswahl; Scheduler/Deployment-Status.
- Verbatim-Prüfung des aktuellen `mean_omission_index` (Kopfzeilen-Prozent).
