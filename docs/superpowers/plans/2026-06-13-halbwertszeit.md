# „Halbwertszeit" — Implementation Plan (kompakt)

> Ausführung: inline (Prototyp validiert, Muster aus Protokoll etabliert). Spec:
> `2026-06-13-halbwertszeit-design.md` + Prototyp-Ergebnisse (n=17, Median 16,3 T, R²-Median 0,63).

**Entscheidungen aus dem Prototyp (Spec-Abweichungen, begründet):**
1. **Messquelle: Wikimedia-REST-API statt BigQuery.** Der BigQuery-Großscan scheitert an der
   Kostenbremse (Limit-Check vor Cluster-Pruning, ~1 TB Schätzung); die REST-API liefert
   per-Artikel-Tageswerte gratis mit Bot-Filter (`user`-Agent). dbt/BigQuery-Signatur folgt
   mit Parallaxe — Verhältnismäßigkeit (§2.5) schlägt Signatur.
2. **Zwei Achsen:** Zerfall (λ, Halbwertszeit) **und** Aufmerksamkeits-Ungleichheit
   (Peak-Aufrufe je Todesopfer; Faktor-Spreizung als Befund).
3. **Dedup:** mehrere P1120-Werte je Ereignis → Maximum. Keine Sonderbehandlung für
   Dauerereignisse (Regel-Purismus; der Fit spricht selbst).
4. **Status je Ereignis:** `gemessen` (Fit ok) · `laeuft` (< 21 Tage seit Peak, vorläufig) ·
   `nicht_messbar` (Peak < 1.000 Aufrufe oder R² < 0,30) — Letzteres ist der härteste Befund
   und wird ausgewiesen, nie versteckt. Median nur über `gemessen`.

## Pipeline (im Protokoll-Paket, gleiche Härtung/Utilities, gleiches Image)

```
pipelines/protokoll/src/protokoll/halbwertszeit/
  __init__.py        # REGISTER_START='2026-01-01', DEATHS_MIN=25, LANGS (18)
  wikidata.py        # SPARQL (P1120>=25, P585>=Start, Sitelinks, Labels de/en) + parse/dedup
  pageviews.py       # REST per-article daily (user-Agent), Summe über Sprachen, fehlertolerant je Sprache
  fit.py             # Sockel (Median letzte 14 T) + log-lineare Regression → λ, HWZ, R², Status
  run.py             # Register bauen → src/data/halbwertszeit/register.json (eine Datei),
                     # --dry-run/--repo-root wie Protokoll, sonst Commit „halbwertszeit: Messung vom <datum>“
tests: test_hw_fit.py (synthetischer Zerfall → λ-Rekonstruktion), test_hw_wikidata.py (Fixture,
Dedup, Labels), test_hw_pageviews.py (Aggregation, Sprachausfall), test_hw_run.py (Dry-Run)
```

Cloud: **gleiches Image**, zweiter Job `halbwertszeit` (Command-Override `python -m
protokoll.halbwertszeit.run`), Scheduler 04:30 UTC. ~300 REST-Calls/Nacht, gedrosselt.

## register.json (kanonisch, eine Datei, Git als Archiv)

`{ generated_at, rule {deaths_min, since, langs}, median_halflife_days, events: [ { qid,
label_de, label_en, date, deaths, peak, peak_day, baseline, lambda_per_day, halflife_days,
r2, status, views_per_death, series: [[date, views], …] } ] }` — Events chronologisch.

## Frontend

- `src/lib/halbwertszeit/` — types, data (JSON-Import), `svg.ts` (Zerfallskurven als
  server-gerenderte SVG-Pfade, getestet) 
- `src/components/pages/HalbwertszeitPage.astro`: **Eine Zahl** („Die mittlere Halbwertszeit
  der Anteilnahme beträgt derzeit X Tage") + physikalische Konstanten · Ungleichheits-Satz
  (Faktor-Spreizung Aufrufe/Todesopfer) · chronologisches Register mit SVG-Kurve, HWZ, R²,
  Aufrufe je Todesopfer, Status. Kein JS — alles statisch aus register.json.
- Routen `/halbwertszeit` (+ en), Methodenblatt `/werke/halbwertszeit` (+ en, 6 Abschnitte),
  `werke.ts` (+ Eintrag, GEPLANT → Parallaxe · Prämie), WerkeStrip zeigt Live-Werke außer
  Protokoll, i18n `hw.*`.

## Abnahme
pytest + vitest + check + build grün · erste echte Messung committet · Cloud-Job + Scheduler
laufen · Merge nach finaler Review-Runde.
