---
paths:
  - "src/lib/graph/**"
  - "src/data/graph/**"
  - "src/data/werke.ts"
  - "src/data/post/ledger.json"
  - "docs/decision-log.md"
  - "docs/audits/**"
  - "src/components/holdings/**"
---

# Der Wissensgraph des Hauses

Neu am 2026-08-09 (Paket „Knowledge Graph + Memory", `docs/design/2026-08-09-usp-rework-program.md`).
Ein **Instrument, kein Experiment**: `src/data/graph/graph.json` ist committet, versioniert
und vollständig aus vier Dateien abgeleitet — nichts darin ist getippt.

## Die eine Regel, wenn du eine Quelle änderst

Quellen sind `src/data/werke.ts`, `docs/audits/2026-08-09-usp-audit.md`,
`docs/decision-log.md`, `src/data/post/ledger.json`,
`src/data/begegnungen/register.json` und **jede `meta.json` eines Praxis-Werks**
(`src/components/{field,atelier}/werke/*/`, `src/content/{atelier,studio}/works/*/` — 59 Stück
am 2026-08-09). Dazu eine **optionale** Quelle: `src/data/attention/export.json`, der Export
der Machine-Attention-Praxis (Kontrakt: `docs/design/2026-08-09-attention-export-contract.md`).
Fehlt sie, hat der Graph schlicht keine Attention-Spur — der Test prüft beide Zustände, damit
die produzierende Session ihren Export hinzufügen kann, ohne auf Rot zu laufen.

Wer eine davon ändert — also z. B. **eine Zeile ins Entscheidungs-Log schreibt** oder **ein
neues Praxis-Werk committet** —, führt danach aus:

```bash
npm run graph:build     # schreibt src/data/graph/graph.json neu
```

und committet die Änderung mit. Sonst ist `src/lib/graph/graph.test.ts` rot: der Test
baut den Graphen aus den heutigen Quellen neu und vergleicht ihn mit der committeten
Datei. Das ist Absicht (ein Snapshot, der hinter seinen Quellen zurückfällt, behauptet
etwas Falsches), aber es trifft auch Sessions, die mit dem Graphen nichts zu tun haben —
darum steht die Regel hier und nicht in einer Datei, die niemand liest. Die
Fehlermeldung des Tests nennt den Befehl ebenfalls.

**Netz darunter (seit 2026-08-09):** `.github/workflows/graph.yml` baut den Graphen
nächtlich neu und committet ihn, wenn sich die Aufzeichnungen bewegt haben. Das nimmt die
Reibung, ersetzt aber nicht den Rebuild im eigenen Commit — ein PR mit veralteter Datei
läuft weiterhin rot, und das ist richtig so: das Artefakt gehört in denselben Commit wie
die Änderung, die es verändert hat.

## Als Abfrage-Schicht benutzen

```bash
npm run graph                 # Form des Graphen: Knoten, Kanten, Quellen
npm run graph -- iceberg      # was berührt X? Verdikt, Daylight, Nachbarn, Entscheidungen
```

Billiger und genauer als grep, weil jede Zeile die Quelldatei nennt, aus der sie stammt.
Am Anfang einer Session, die ein Werk anfasst, lohnt sich der eine Aufruf.

## Was der Graph nicht darf

- **Nichts ohne Beleg.** Jeder Knoten und jede Kante trägt `source: { file, quote }`, und
  `graph.test.ts` prüft jedes Zitat gegen die Datei. Eine Kante, die sich nicht zitieren
  lässt, gehört nicht in den Graphen — auch dann nicht, wenn sie stimmt.
- **Keine Adressen.** Der Post-Office-Ledger nennt Postfächer realer Menschen; der Graph
  nimmt Empfänger-**Namen** auf, nie Kanäle. Ein Test verbietet E-Mail-Muster in der Datei.
- **Keine Prosa-Treffer.** Entscheidungen erreichen ein Werk über die **Dateipfade und
  Routen**, die die Zeile nennt, nie über Wortübereinstimmungen im Fließtext („correction"
  ist ein gewöhnliches englisches Wort).
- **Von Hand editieren gilt nicht.** `graph.json` ist Ausgabe. Ändere die Quelle oder den
  Ableiter (`src/lib/graph/build.ts`, `derive.ts`), nie die Ausgabe.

Die Figur `/holdings/neighbors` zeichnet denselben Graphen; ihre Geometrie ist reine
Arithmetik und in `src/lib/graph/field.test.ts` geprüft (Abstände, Kollisionen, Rand).
