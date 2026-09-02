---
paths:
  - "src/styles/**/*.css"
  - "src/components/**/*.astro"
  - "src/components/**/*.tsx"
  - "src/components/ui/**"
  - "src/lib/dataviz/**/*.ts"
  - "src/lib/ui/**"
  - "src/lib/**/field.ts"
  - "scripts/drift-check.mjs"
  - "scripts/bundle-budget.mjs"
  - "scripts/budgets.json"
---

# Figuren, Farben, Paletten

Umgezogen aus `CLAUDE.md` am 2026-08-09 (CLAUDE.md-Diät: pfadgebundene Regeln laden nur,
wenn passende Dateien angefasst werden). Inhalt unverändert — was hier steht, galt vorher
in jeder Session und gilt jetzt in jeder Session, die eine Figur oder ein Stylesheet
berührt.

- **Visualisierungen der Praxen dürfen eigene Bildsprache haben (Frank, 2026-07-30;
  Wortlaut privat):** Die Mono-Skin gilt für die Site, aber **nicht als Zwang zur kargen
  Einlinien-Grafik** — Franks Anweisung: interaktiv und ansprechend statt minimaler
  Monochromie, weil die Praxen eigene Projekte sind.
  Für Atelier/Field/Studio also: Farbe, Tiefe, Interaktion (Hover/Fokus/Filter),
  Detailtafel — solange die Figur aus committeten Daten abgeleitet und nachprüfbar ist.
  Verbindlich bleibt das Handwerk: **Palette gegen die jeweilige Fläche validieren**
  (dataviz-Skill, `scripts/validate_palette.js`, hell UND dunkel mit eigenen Stufen),
  Legende + Tabellenansicht, `prefers-reduced-motion` achten, Herkunftszeile unter der
  Figur. Referenz-Umsetzung: `src/components/atelier/ProcessFigure.astro` +
  `src/styles/atelier-process.css`. **Validierung ist seit 2026-07-31 Testpflicht, kein
  Kommentar:** jedes gelieferte Set steht als Datensatz in `src/lib/dataviz/palette.ts`
  (Validator-Verdikt, datiert, WARNs mit benanntem Relief); `palette.test.ts` rechnet die
  Distanzen nach und `scripts/drift-check.mjs` (Regeln 6/7) erzwingt die
  `PALETTE:`-Marker. Anlass: Die ursprüngliche ProcessFigure-Palette behauptete im
  CSS-Kommentar „alle sechs Prüfungen bestanden", fiel aber real durch den CVD-Check
  (grün↔magenta deutan ΔE 1,3) — Kommentare driften, Tests nicht.
  **Statusfarben sind tabu, wo die Praxis nicht wertet** — ein abgebrochenes Vorhaben ist
  bei Ulysses kein Fehlschlag („closing costs what continuing costs"), also bekommt es
  eine Identitätsfarbe, kein Warnrot.

## Praktische Hinweise (2026-08-09 ergänzt, aus der Neighbourhood-Figur)

- **Der Validator liegt nicht immer im Skill-Bundle.** Wenn `validate_palette.js` in der
  Session nicht auffindbar ist: die Distanzmathematik steht vollständig in
  `src/lib/dataviz/palette.test.ts` (sRGB → Machado-2009-Simulation → OKLab, WCAG) und
  kann für ein neues Set nachgerechnet werden. Dann im `validator`-Feld **schreiben, dass
  der Validator nicht lief** und was stattdessen gerechnet wurde — nie einen Lauf
  behaupten, den es nicht gab. Ein Set, das die Hexes eines bereits validierten Sets
  wiederverwendet, erbt dessen Verdikt (Teilmenge von Paaren), aber **nicht** dessen
  Kontrastwerte: die hängen an der Fläche der neuen Seite.
- **Eingefärbter Text ist kein Mark.** Ein Kontrast-WARN ist für eine Marke neben einem
  Label zulässig, für das Label selbst nicht. Chips und Beschriftungen tragen gedämpfte
  Tinte plus einen farbigen Punkt/Strich, nie die Identitätsfarbe als Schriftfarbe.
- **Doppelte Kodierung ist erwünscht,** wo sie ehrlich ist: dieselbe Tatsache als Länge
  UND als Farbe hält die Figur in Graustufen, im Druck und für Dichromaten lesbar.
- **CSP:** `style=""`-Attribute werden von dieser Site stillschweigend verworfen. Farben
  gehören ins Stylesheet (Custom Properties), SVG-Marken tragen `fill=`/`stroke=` oder
  Klassen.

## Interaktive Figuren (Frank, 2026-09-02, Wortlaut privat)

**Das Archiv bindet die Daten, nicht das Rendering.** Figuren dürfen clientseitig, interaktiv
und animiert gerendert werden — als React-Inseln in Astro, mit d3 und, wo es trägt, WebGL.
Die frühere Gewohnheit „Figur = SVG-String zur Bauzeit, kein Client-Rendering" stand in
Komponenten-Kommentaren, nie in einem Beschluss; Herkunft und Programm:
`docs/design/2026-09-02-the-visual-layer.md`. Was oben zur Palette, zur Bildsprache der
Praxen und zum Statusfarben-Tabu steht, gilt unverändert. Dazu kommen **sieben Pflichten
jeder interaktiven Figur**, geprüft durch Tests und `scripts/drift-check.mjs`:

1. **Geometrie und jede Zahl kommen aus einer reinen, getesteten Lib in `src/lib/**`.** Die
   Insel montiert, animiert und antwortet dem Zeiger — sie rechnet nichts, was eine Behauptung
   trägt. So bleibt die Aussage einer Figur ohne Browser prüfbar.
2. **Der Server-Render ist der Boden.** Astro rendert die Insel serverseitig; SVG und jeder
   Link stehen im HTML, bevor ein Skript läuft. Nichts ist nur per JavaScript erreichbar —
   `TableFallback` und die native `<title>` jeder Marke bleiben.
3. **Kein `style=`-Attribut, nirgends** — auch nicht als JSX-Prop (`style={{…}}`;
   drift-check-Regel 3 läuft seit 2026-09-02 auch über `.tsx`). Dynamisches Styling nur über
   `setVars` (`src/lib/dataviz/runtime.ts`), Klassen und `data-`-Attribute; Farben nur in
   Stylesheets mit `PALETTE:`-Marker; keine Hex-Literale in `src/{components,lib}/dataviz/**`.
4. **`prefers-reduced-motion` wird geachtet:** Übergänge mit Dauer null, keine ambiente
   Bewegung (`reducedMotion()` in `runtime.ts`).
5. **Readout-Hausregeln** (`src/lib/dataviz/readout.ts`): in den Kasten der Figur geklemmt,
   kippt am Rand statt zu clippen, nie ein Trefferziel.
6. **Ein gzip-Budget je Insel** in `scripts/budgets.json`, geprüft von
   `scripts/bundle-budget.mjs` nach jedem Build (CI und Deploy). Schwere Bibliotheken laden
   verzögert (`client:visible` / `client:idle`, dynamischer `import()`); d3 wird per Submodul
   importiert, nie als Wurzelbündel. Die React-Laufzeit ist EIN geteilter Chunk.
7. **Jedes neue Farbset wird hell und dunkel validiert** und in `src/lib/dataviz/palette.ts`
   aufgezeichnet; höchstens vier kategoriale Plätze; keine Statusfarben, wo die Praxis nicht
   wertet.

**shadcn/ui** ist das Komponentensystem des Rahmens (Tailwind v4, kopierte Primitives in
`src/components/ui/`, `cn()` in `src/lib/ui/cn.ts`). Die Token-Brücke in
`src/styles/global.css` (`@theme inline`) zeigt nur auf die Mono-Tokens der Site — nie eigene
Werte; Dark Mode schaltet über `[data-theme='dark']`, nie über eine `.dark`-Klasse; der Slot
`accent` heißt hier `hover`, weil `--color-accent` auf dieser Site Tinte ist; es gibt keine
`destructive`-Variante. `src/lib/ui/tokens.test.ts` prüft das.
