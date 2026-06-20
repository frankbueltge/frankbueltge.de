# 07 — URL- & IA-Plan (public-v01, NICHT umgesetzt)

> Fokussierte MVP-Fassung von `_drafts/06`. Ziel: minimaler, additiver, rückbaubarer Umbau.
> **Keine Umsetzung.** Grundlage: `docs/10`, `_drafts/06`, `_drafts/work-audit`.

## Zielstruktur (MVP)
```
/                Startseite (Leitsatz O1 · Protokoll-Teaser · Untersuchungen · Beruf nachgeordnet)
/research        NEU — Research Statement (public-v01/02 DE, 03 EN)
/works           NEU — Index der vier Untersuchungen ("Die Akte der Gegenwart")
   /works/<id>   später (V2): Werk + Methodenblatt unter einer Achse
/protokoll · /halbwertszeit · /parallaxe · /praemie   (MVP: BLEIBEN; aus /works verlinkt)
/lab             wird zu „Notizen & Studien" (Untersuchungs-Block zieht nach /works)
   /lab/<slug>   Lab Notes (public-v01/08) + Überflug-Studie
/projects        Beruf (heute /work, umbenannt) — data-snack, datavism, Engineering-Notizen
/about · /contact · /impressum · /datenschutz
```

## Routen einzeln
- **`/research`** — additiv, risikoarm: neue Seite + Komponente, in Nav/Footer aufnehmen.
  *Betroffen später:* `src/pages/research/index.astro` (+`/en`), neue `ResearchPage.astro`,
  `ui.ts` (neuer Nav-Key), `Footer.astro`.
- **`/works`** — additiv: Index aus `src/data/werke.ts`. Übernimmt den Untersuchungs-Block, der
  heute in `LabIndex.astro` lebt. WerkeStrip/Home zeigen auf `/works`.
- **`/works/<id>`** — **V2, nicht MVP.** Konsolidierung der Werkseiten + Methodenblätter unter
  eine Achse. MVP: Werkseiten bleiben unter `/protokoll` … (URL ≠ Titel ist zulässig).
- **`/experiments`** — **MVP-optional.** Vorerst nicht als eigener Top-Level-Bereich; die
  Überflug-Studie bleibt unter `/lab`. Anlegen erst, wenn ≥ 1–2 Experimente existieren
  (Leer-Risiko, `docs/10`).
- **`/notes`** — MVP über **`/lab`** abgedeckt: `/lab` wird inhaltlich „Notizen & Studien"
  (zwei Lab Notes + Überflug). Eigenständige Route `/notes` ist optional/V2. *(Entscheidung
  „/lab umwidmen" vs. „/notes neu" — ZU KLÄREN.)*
- **`/work` → Beruf:** umbenennen auf **`/projects`** (vermeidet Verwechslung `/work` ↔ `/works`).
  Engineering-Notizen (`bigquery-dbt`, `server-side-tagging`) ziehen hierher (raus aus /lab).

## Umgang mit /lab, /werke, /praemie
- **/lab:** bleibt bestehen, verliert den Untersuchungs-Block (→ `/works`); danach „Notizen &
  Studien". `LabIndex.astro` kürzen; Methodenblatt-Links `/werke/<id>` ggf. auf `/works/<id>`
  (erst mit V2).
- **/werke:** Redirect-Ziel von **`/lab` auf `/works`** ändern (heute `/werke → /lab`).
  `/werke/<id>` (Methodenblätter) erst mit V2 nach `/works/<id>` + Redirect.
- **/praemie:** Route bleibt `praemie`; Anzeigetitel „The Policy". URL-Umbenennung **nicht**
  nötig für MVP (Route ≠ Titel). *(ZU KLÄREN, ob „praemie" langfristig bleibt.)*

## Redirect-Matrix (Vercel `vercel.json`, NICHT umgesetzt)
Bestehend: `/werke → /lab`, `/en/werke → /en/lab` (301).
MVP-Vorschlag:
```
/werke        → /works      (301)   # Ziel ändern
/en/werke     → /en/works   (301)
/work         → /projects   (301)   # falls Beruf umbenannt
/work/:slug   → /projects/:slug
/en/work(/:slug) → /en/projects(/:slug)
```
V2 (falls Werkseiten/Methodenblätter konsolidiert):
```
/werke/:id    → /works/:id  (301)
# /protokoll … nur umleiten, wenn tatsächlich nach /works/<id> verschoben — sonst NICHT
```
**Nicht brechen:** `/protokoll/feed.xml`, `/protokoll/archiv`, `/protokoll/<datum>`,
RSS-`alternate` in `Base.astro`, hreflang/canonical.

## Reihenfolge (additiv, jeder Schritt rückbaubar)
1. `/research` anlegen (+ Nav/Footer) — risikoarm.
2. `/works` anlegen; Home/WerkeStrip darauf zeigen; `/lab` zunächst unverändert.
3. `/lab` entschlacken (Untersuchungs-Block raus); Überflug + 2 Lab Notes bleiben.
4. Beruf `/work → /projects` + Redirects + Engineering-Notizen verschieben.
5. `/werke`-Redirect auf `/works` umstellen.
6. (V2) `/works/<id>` + Methodenblatt-Konsolidierung + Redirects.

## Risiken
- **Broken Links/SEO:** jede Umbenennung braucht 301; Feed/Archiv/hreflang schützen.
- **i18n-Drift:** EN-Spiegel jede DE-Änderung exakt nachziehen.
- **Leere Sektionen:** `/notes`/`/experiments` nur zeigen, wenn gefüllt.
- **Doppelte Wahrheit:** `werke.ts` `href` ↔ neue `/works`-Pfade — eine Quelle der Wahrheit halten.
- **Protokoll-Testschutz:** Titel-/Stringänderungen können `render.test.ts` berühren (`_drafts/12`).

## Offene Entscheidungen (ZU KLÄREN)
- `/notes` eigene Route vs. `/lab` umwidmen.
- Beruf-Routenname `/projects` (empfohlen) bestätigen.
- `/works/<id>`-Konsolidierung jetzt (mehr Churn) oder V2.
- „praemie"-Slug langfristig.
