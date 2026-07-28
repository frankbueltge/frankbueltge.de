# Provenienz

Erzeugt aus `research-ecology` Commit `534e9057c8249a8e7a221dba0e5229eb3a4e1ff6` durch `apps/export-site`
(`@research-ecology/export-site@0.1.0`, Projektions-Engine `@research-ecology/projections@0.1.0`).

Datenstand: 2026-07-26T22:58:08Z (jüngstes aufgezeichnetes Ereignis der Begegnung
`enc-2026-005-atlas-lent-not-lifted`) — kein Erzeugungs-Zeitstempel, nur datengetragene Daten.

Diese Dateien sind ein Export, keine Originalquelle — die Quelle bleibt `research-ecology`
(`narratives/`, `fixtures/`, `lenses/`, `packages/domain`, `packages/projections`).
Reproduzierbar via:

```
npx tsx apps/export-site/src/cli.ts --site <pfad-zum-site-checkout>
```

Deterministisch: derselbe research-ecology-Stand erzeugt byte-identische Dateien
(`tests/contract/export-site.test.ts`). Der manuelle/nächtliche Ablauf steht in
`docs/runbooks/site-export.md`.
