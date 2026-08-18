# Provenienz

Erzeugt aus `research-ecology` Commit `9da0a3850e915e4cc791433dece77b5e787a7b98` durch `apps/export-site`
(`@research-ecology/export-site@0.1.0`, Projektions-Engine `@research-ecology/projections@0.1.0`).

Datenstand: 2026-08-02T15:50:00Z (jüngstes aufgezeichnetes Ereignis der Begegnung
`enc-2026-006-set-the-standard`) — kein Erzeugungs-Zeitstempel, nur datengetragene Daten.

Diese Dateien sind ein Export, keine Originalquelle — die Quelle bleibt `research-ecology`
(`narratives/`, `fixtures/`, `lenses/`, `packages/domain`, `packages/projections`).
Reproduzierbar via:

```
npx tsx apps/export-site/src/cli.ts --site <pfad-zum-site-checkout>
```

Deterministisch: derselbe research-ecology-Stand erzeugt byte-identische Dateien
(`tests/contract/export-site.test.ts`). Der manuelle/nächtliche Ablauf steht in
`docs/runbooks/site-export.md`.
