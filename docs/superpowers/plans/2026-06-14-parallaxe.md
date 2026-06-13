# „Parallaxe — Was jede Sprache verschweigt" — Implementation Plan

> Spec: `docs/superpowers/specs/2026-06-13-parallaxe-design.md` (§5b ist maßgeblich — Redesign A,
> LLM-Gate bestanden). Ausführung: subagent-driven + Review, Muster wie Halbwertszeit.
> Branch: `feat/parallaxe`. Image/Job teilen mit Protokoll.

**Kernbefund, der alles trägt:** Embedding-Distanz ist tot (Faktor ~1,0). Das Werk misst
**Auslassung** per Gemini-Matrix (Aussage × Sprache: nennt/verschweigt/widerspricht), validiert.
Kein Embedding, keine Übersetzung.

## Pipeline — `pipelines/protokoll/src/protokoll/parallaxe/`

```
__init__.py     LANGS=(de,en,ru,uk,ar,he,zh,ja,fa,tr,es,fr), MIN_LANGS=5, TOPIC_CAP=24, MODEL="gemini-2.5-flash"
register.py     fetch_controversial_titles(client) → en-Titel aus Wikipedia:List_of_controversial_issues
                (action=parse,prop=links,ns=0); rank_topics(client, titles) → je Titel langlinks holen,
                auf Zielsprachen filtern, nach Sprachzahl absteigend sortieren, ≥ MIN_LANGS, Top TOPIC_CAP.
                Liefert [{en_title, titles:{lang:title}, lang_count}]. + protection_status(client, title).
extracts.py     fetch_intros(client, titles) → {lang: extract} (REST summary, Muster halbwertszeit/pageviews)
prompt.py       PROMPT (publiziert, = der getestete Prompt aus dem Prototyp, wörtlich)
extract_llm.py  extract_omissions(ctx, lang_to_text) → {"lemma":{lang:name}, "claims":[{aussage, nach_sprache:{lang:"nennt|verschweigt|widerspricht"}}]}.
                Vertex generateContent, gemini-2.5-flash, temp 0, responseMimeType application/json,
                Token via gcloud-ADC + x-goog-user-project, Retry+Token-Refresh bei 401/429/503.
analyze.py      omission_index(claims, langs) → {lang: anteil_verschwiegen}; topic_mean(...) ;
                lemma_divergence(lemma) → bool (≥2 distinkte Primärnamen).
run.py          build_register(ctx, today): Register holen → je Thema Extrakte + extract_omissions + analyze
                → eine Datei src/data/parallaxe/register.json. --dry-run/--repo-root | Commit
                "parallaxe: Messung vom <datum>". Degenerat-Guard (0 Themen → exit 1).
```

Tests (mocked LLM/HTTP, kein echtes GCP): test_px_register (Fixture parse+rank), test_px_analyze
(Auslassungsindex-Mathe, Lemma-Divergenz), test_px_extract (LLM-Antwort-Fixture → Struktur),
test_px_run (Dry-Run mit gemocktem build).

`extract_llm.py` braucht ein Token wie das Halbwertszeit-BigQuery-Muster, aber für Vertex REST:
`subprocess gcloud auth print-access-token` + Header `x-goog-user-project: <PROJECT aus env GOOGLE_CLOUD_PROJECT default data-snack>`. In Tests wird `extract_omissions` gemockt.

## register.json (kanonisch)

```
{ generated_at, rule{source, min_langs, cap, model}, mean_omission_index,
  topics: [ { en_title, lang_count, protection, langs:[...],
              lemma:{lang:name}, lemma_divergent:bool,
              claims:[{aussage, by_lang:{lang:"nennt|verschweigt|widerspricht"}}],
              omission_by_lang:{lang:fraction}, mean_omission:fraction } ] }
```

## Frontend

- `src/lib/parallaxe/types.ts` (Spiegel), `data.ts` (JSON-Import, sortiert nach mean_omission desc — hier
  ist „größter Abstand" der Befund, kein Opfer-Ranking).
- `src/components/pages/ParallaxePage.astro`: Kopf = mittlerer Auslassungsindex („Im Mittel verschweigt
  jede Sprachversion X %") + Erklärsatz. Je Thema: Titel, Lemma-Divergenz (die Namen nebeneinander),
  Schutzstatus, und die **Matrix Aussage × Sprache** (Zeilen=Aussagen, Spalten=Sprachen; Zelle:
  ✓ nennt / · verschweigt / ✗ widerspricht; verschwiegene Zeilen optisch betont — die Auslassung ist
  das Werk). Statisch, kein Client-JS. Lange Matrizen: Aussagen nach „Auslassungsgrad" sortiert,
  Top-N + „weitere".
- `src/components/pages/MethodenblattParallaxe.astro` (6 Abschnitte): inkl. **vollständigem publiziertem
  Prompt** (Abschnitt 3) und den Grenzen (LLM-Extraktor, gegen Quelle prüfbar; Embedding-Ansatz verworfen,
  Faktor 0,97 dokumentiert; Register aus Wikipedias eigener Liste; Intro statt Volltext).
- Routen `/parallaxe` + en, `/werke/parallaxe` + en; `werke.ts` +Eintrag, GEPLANT → nur noch ['Prämie'];
  i18n `px.*`.

## Cloud (nach Merge)

Job `parallaxe` (gleiches Image, `--command python --args=-m,protokoll.parallaxe.run`), Service-Account
braucht zusätzlich `roles/aiplatform.user`. Env GOOGLE_CLOUD_PROJECT=data-snack. Scheduler 05:30 UTC.

## Gate/Abnahme

pytest+vitest+check+build grün · erste echte Messung committet (Trockenlauf braucht GCP-ADC für Gemini)
· Schluss-Review · Merge.
