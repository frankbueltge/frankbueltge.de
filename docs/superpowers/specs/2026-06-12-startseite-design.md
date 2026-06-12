# Startseite „Die Akte zuerst" — Design

**Datum:** 2026-06-12 · **Status:** vom Nutzer abgenommen (Designrunde: Data Artist zuerst /
lebendes Protokoll / Portfolio eindampfen)

## Aufbau (oben → unten)

1. **Hero** unverändert (GISTEMP-Puls). Rollenzeile neu: „Data Artist & Engineer" —
   i18n `hero.roleLead`; `hero.roleRest` angepasst („… ich verwandle Rohdaten in Werke,
   Entscheidungen und Stories." / EN sinngleich). Auch `SITE.role`, Meta-Titel/Description
   (`meta.home.*`) und Schema.org-Rolle ziehen nach.
2. **Lebendes Protokoll** (`ProtokollTeaser.astro`): zur Buildzeit aus
   `getLatestProtokoll()` + `renderDay()` gerendert — Kopf (4 Zeilen), dann die
   kuratierten TOPs 1 (Atmosphäre), 11 (Konflikt), 12 (Aufmerksamkeit) mit Feststellung +
   Schlussformel, Link „Vollständiges Protokoll →" (`/protokoll`). Typografie wie
   ProtokollDoc, kompakter. Leer-Zustand: `prot.empty`. Da die Pipeline nächtlich
   committet und die Site neu baut, erneuert sich die Startseite täglich von selbst.
3. **Werkleiste** (`WerkeStrip.astro`): Überflug (Titel, Untertitel, Link) + stille Zeile
   „Halbwertszeit · Parallaxe · Prämie — in Vorbereitung" → Link `/werke`. Datenquelle
   `WERKE` + neue konstante Liste `GEPLANT` in `src/data/werke.ts`.
4. **Beruflich, eingedampft**: ein Satz, drei Projekte aus `projects.ts` als schlichte
   Zeilen (Name + Einzeiler + Link), Lab-Link. `Dashboard.astro` (fig.01–05) fliegt aus
   `Home.astro`; Datei bleibt im Repo (Reaktivierungspfad dokumentiert im Kommentar).
5. Footer unverändert.

## Nicht-Ziele

Kein Eingriff in Renderer/Pipeline/Register-Tests; keine neuen Effekte/Animationen;
Dashboard-Komponente wird nicht gelöscht; /work, /lab, /about bleiben unverändert.

## Risiken

Keine technischen — reine Rekomposition getesteter Bausteine. Inhaltlich: Rollenwechsel
„Data Artist & Engineer" ist Außenwirkung (vom Nutzer explizit abgenommen).
