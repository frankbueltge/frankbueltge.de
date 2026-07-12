# Spielraum — Hyperscaler-Offenlegungen: Effizienz am Boden, Verbrauch im Steigflug — Design

**Datum:** 2026-07-12
**Status:** Abgenommen zur Umsetzung (2026-07-12); Angleichung an Implementierung 2026-07-12
**Linie:** Gegenmessung
**Handle:** „Spielraum" (EN: „Headroom")
**Routen:** `/spielraum` (EN, Standard-Locale), `/de/spielraum` (DE) — Methodenblatt `/werke/spielraum` (EN) / `/de/werke/spielraum` (DE)

> **Hinweis:** Ein erheblicher Teil ist zum Zeitpunkt dieser Spec bereits im Arbeitsbaum
> vorhanden (Branch `feat/spielraum`, parallel entstanden): der Watcher
> (`pipelines/protokoll/src/protokoll/spielraum/` + `.github/workflows/spielraum-watch.yml`,
> beide mit eigener Testsuite), die Register-Erstbefüllung
> (`src/data/spielraum/register.json`), die Ableitungslogik (`src/lib/spielraum/compute.ts`,
> `types.ts`, mit Vitest) und die Chart-Geometrie (`src/lib/spielraum/chart.ts`, mit Vitest)
> sowie der Werke-Registry-Eintrag (`src/data/werke.ts`). Diese Spec dokumentiert die
> gebaute Form — **und** ist zugleich das Runbook, auf das der Code selbst verweist
> (`sources.py`, `diff.py`: `RUNBOOK = "docs/superpowers/specs/2026-07-12-spielraum-design.md"`).
> Noch offen: Astro-Seiten und Methodenblatt-Komponente, s. §11.

---

## 1. Kontext & These

**These (Ein-Minuten-Wahrheit):** PUE (*total facility energy / IT energy*) hat einen
physikalischen Boden bei 1,0 — eine perfekte Anlage verliert nichts an Kühlung/Konversion,
alle Energie erreicht die Server. Googles Flotte meldet 2024 einen PUE von 1,09. Von dort
bis zum Boden bleiben für immer nur `(1,09 − 1,00) / 1,09 = 8,26 %` Effizienz-Spielraum —
ein einmaliger, endlicher Hebel. Googles Rechenzentrums-Stromverbrauch wuchs in derselben
Zeit 17 % (2023), 27 % (2024), 37 % (2025) — jedes Jahr zweistellig, jedes Jahr schneller.
Rechnet man rückwärts, welchen PUE Google gebraucht hätte, um dieses Wachstum bei
gleichbleibendem Verbrauch auszugleichen (`erforderlicher PUE = Vorjahres-PUE / (1 +
Wachstum)`), fällt das Ergebnis für alle drei Jahre unter den physikalischen Boden: 0,94
(2023), 0,87 (2024), 0,80 (2025). Ein PUE unter 1,0 ist keine ambitionierte Zielmarke,
sondern eine Verletzung der Definition — die Effizienz-Kennzahl konnte das Wachstum nicht
einmal im Prinzip auffangen.

Dasselbe Muster bei den Nachbarn, mit unterschiedlicher Offenlegungstiefe: Microsoft
verschlechterte sich FY24→FY25 (PUE 1,16 → 1,17) — der Zeiger bewegt sich selbst rückwärts.
Meta läuft mit PUE 1,08 näher am Boden als Google. AWS legt seinen PUE offen (1,14/1,15),
aber **keinen Verbrauch** — ohne Nenner lässt sich kein Breakeven rechnen. Der leere Zeiger
ist hier selbst der Befund: Dark Data, der Kern der Gegenmessung-Linie — Macht zählt, was
ihr nützt (eine Effizienz-Ratio, die sich gut liest), und lässt aus, was den Vergleich
verdirbt (die absolute Zahl).

**Herkunft der Daten.** Spielraum erfindet keine eigene Erhebung; es kompiliert und macht
lesbar, was zwei laufende, unabhängige Forschungsprojekte bereits verifiziert haben:

- **Google-Zahlen (Tier VERIFIED):** aus `field-research`, Instrument 013 „The Floor"
  (`works/2026-07-09-the-floor/data.json`) — ein von der Meridian-Kollektiv-Pipeline
  vollständig gegauntletetes Instrument (Proposer/Skeptic/Verifier/Chronicler-Zyklus,
  Prior-Art-Check, Robustheits-Nachweis über zwei Report-Vintages). Jede hier zitierte
  Zahl, jedes Zitat, jede Herleitung ist dort bereits gegengeprüft.
- **Meta/Microsoft/AWS-Zahlen (Tier SOURCED):** aus `studio`, Projekt „diminishing-returns"
  (`projects/diminishing-returns/data.json`), Ensemble-Session 03 (2026-07-12) — eigene
  Erstrecherche des Kollektivs an Primärquellen, aber nicht durch den vollen
  field-research-Gauntlet gelaufen (u. a. Text-Proxy-Fetches statt Direktzugriff bei
  Meta/Microsoft/AWS, teils nur einfache statt doppelte Verifikation).

Spielraum **kopiert** diese bereits geprüften Zahlen in ein eigenes Register
(`src/data/spielraum/register.json`) und steht danach für sich: keine Laufzeit-Abhängigkeit
von den beiden Fremd-Repos, kein Nachladen. Übernommen wird dabei zwingend der
**Tier-Vermerk je Ziffer** (VERIFIED/SOURCED) — Spielraum wertet nicht auf, was die
Vorarbeit als SOURCED eingestuft hat, und markiert eigene Ableitungen (§3.3) klar als
Ableitung, nie als Zitat.

## 2. Substanz-Gate-Nachweis

Nachweis gegen die fünf Kriterien aus §2 der Werkgruppen-Spec
(`2026-06-11-werkgruppe-design.md`):

1. **Echte Daten mit offener Provenienz — ✓.** Jede Ziffer trägt Quelle (Report-ID, URL,
   Abrufdatum), wörtliches Zitat wo verfügbar, und Tier (VERIFIED/SOURCED). Die
   PUE-Definition selbst inkl. Herkunft (The Green Grid 2006/2007, ISO/IEC 30134-2:2016)
   ist im Register dokumentiert, nicht vorausgesetzt.
2. **Eine Frage, kein Effekt — ✓.** Die Behauptung ist überprüfbar mit einem
   Taschenrechner aus den offengelegten Zahlen selbst: „Die Effizienz-Kennzahl, mit der
   vier Hyperscaler ihr Wachstum rahmen, ist strukturell unfähig, dieses Wachstum
   auszugleichen — bei allen dreien, die genug offenlegen, um es zu prüfen." Kein
   Ranking, keine Stimmung — eine Rechnung.
3. **Infrastruktur als Teil der Aussage — ✓.** Was das Instrument selbst offenlegt und
   verweigert, ist ausgewiesen: AWS' `discloses: false` ist keine Fetch-Lücke, sondern
   eine geprüfte Absenz und Teil der Aussage — im Frontend-Typsystem bewusst kein
   `{ error }`-Muster, sondern ein eigener Typ-Guard (`hasDisclosure`), weil Absenz ein
   Befund ist, kein Fehlerzustand. Das Methodenblatt beziffert den Compute-Fußabdruck
   (§7). Das Register speichert nur, was die Primärquellen offengelegt haben.
4. **Konsequenz / Leave-behind — ✓.** Offener Code (`compute.ts`, `chart.ts`, Watcher
   unter `pipelines/protokoll/src/protokoll/spielraum/`), offene Daten
   (`register.json`, `watch.json`, `ingest_log`), dokumentierte Methode (Methodenblatt +
   Ingest-Runbook, §6).
5. **Verhältnismäßigkeit — ✓.** Vier Firmen, zwei Kennzahlen je Firma, ein Jahr Kadenz.
   Kein Auto-Parsing, kein LLM-Schritt, keine Tagesfrische-Behauptung. Statische
   SVG/DOM-Panels ohne Animation. Reduktion ist die Position — die Rechnung selbst
   braucht keine Ausstattung.

**Leitsatz der Werkgruppe eingelöst:** Spielraum ist kein Dashboard der vier PUE-Werte,
sondern ein Instrument, das eine Behauptung erhebt (die Ratio kann das Wachstum nicht
ausgleichen) und sie überprüfbar macht (Breakeven-Rechnung, Quelle je Ziffer).

## 3. Datenmodell

### 3.1 Dateien

| Pfad | Inhalt | Status |
|---|---|---|
| `src/data/spielraum/register.json` | offengelegte Inputs je Firma: PUE-Serien, Verbrauchs-Wachstum bzw. MWh-Serien, Zitate, dereferenzierte Quellen, Tier, Caveats, `ingest_log` | vorhanden (Erstbefüllung) |
| `src/data/spielraum/watch.json` | Fingerprint-Zustand je Landingpage (`sources`, Schlüssel = `kind`), `generated_at`, `schema_version` | vorhanden, wird monatlich fortgeschrieben |
| `pipelines/protokoll/src/protokoll/spielraum/` | Watcher-Subpaket der bestehenden Protokoll-Pipeline (`sources.py` Watchlist, `fingerprint.py` Regex-Extraktion, `diff.py` Vergleich + Issue-Text, `run.py` CLI) — **kein eigenes Top-Level-Pipeline-Paket**, wiederverwendet `protokoll.fetch.fetch`/`SourceUnavailable` | vorhanden, getestet |
| `pipelines/protokoll/tests/test_sr_fingerprint.py`, `test_sr_watch.py` | pytest-Suite des Watchers | vorhanden |
| `.github/workflows/spielraum-watch.yml` | Action „Spielraum watch", monatlich | vorhanden |
| `src/lib/spielraum/types.ts` | Frontend-Typen, spiegeln `register.json` (`schema_version: "1"`) exakt | vorhanden |
| `src/lib/spielraum/compute.ts` (+ `compute.test.ts`) | deterministische Ableitungen: Headroom, erforderlicher PUE, Wachstum aus MWh, Runden-Bau | vorhanden, getestet |
| `src/lib/spielraum/chart.ts` (+ `chart.test.ts`) | Wert→Geometrie-Mapping der begrenzten Skala | vorhanden, getestet |
| `src/data/werke.ts` | Registry-Eintrag `spielraum` (Titel, Untertitel, Beschreibung, `tier: 'experiment'`, `since: '2026-07-12'`) | vorhanden |
| Astro-Seiten (`/spielraum`, `/de/spielraum`) + Methodenblatt-Komponente | **noch nicht gebaut** — s. §11 | offen |

### 3.2 Grundsatz: Register speichert nur, was offengelegt ist

`register.json` enthält ausschließlich wörtlich oder als klar gekennzeichnete Primärgröße
offengelegte Inputs — keine Ableitung. Die tatsächlich implementierte Struktur bildet das
direkt ab: pro Firma trägt `consumption.form` aus, in welcher **Form** offengelegt wird —
`"growth_pct"` bei Google (direkt offengelegte Prozentsätze), `"mwh"` bei Meta/Microsoft
(nur absolute Reihen, Wachstum wird erst von `compute.ts` berechnet). AWS hat kein `form`
— `consumption.discloses: false` trägt stattdessen den geprüften Absenz-Befund
(`absence_check_source_id`, `note_de`/`note_en`, `tier`). Diese Asymmetrie wird nicht
eingeebnet — jede Firma behält im Register die Form, in der sie tatsächlich offenlegt.

```jsonc
// register.json — reales, bereits geseedetes Schema (gekürzt)
{
  "schema_version": "1",
  "floor": 1.0,
  "floor_note_de": "PUE = Gesamtenergie der Anlage / IT-Energie; …",
  "floor_note_en": "PUE = total facility energy / IT-equipment energy; …",
  "generated_at": "2026-07-12T14:43:15Z",
  "companies": {
    "google": {
      "display_name": "Google",
      "pue": {
        "quote": "For the first time in six years, … dropped below 1.10 to 1.09 (Figure 4). …",
        "quote_source_id": "google_2025_env_report",
        "scope_note_de": "…", "scope_note_en": "…",
        "series": [
          { "figure": 1.10, "period": "2019", "source_id": "google_2024_env_report", "tier": "VERIFIED" },
          /* … 2020–2023 je 1.10 … */
          { "figure": 1.09, "period": "2024", "source_id": "google_2025_env_report", "tier": "VERIFIED" },
          { "figure": 1.09, "period": "2025", "source_id": "google_2026_env_report", "tier": "VERIFIED",
            "vintage_note_de": "Stammt aus dem 2026-Report (Nachtrag/Folgeprüfung) …" }
        ]
      },
      "consumption": {
        "discloses": true, "form": "growth_pct",
        "growth_pct": [
          { "period": "2023", "value": 17, "scope_de": "Strom der Rechenzentren gesamt",
            "quote": "…compared to 17% growth in the prior year",
            "source_id": "google_2025_env_report", "tier": "VERIFIED" },
          { "period": "2024", "value": 27, /* … */ "tier": "VERIFIED" },
          { "period": "2025", "value": 37,
            "scope_de": "Gesamtstromverbrauch (weiter gefasst als das 2025er-Wording)",
            "source_id": "google_2026_env_report", "tier": "VERIFIED" }
        ]
      },
      "caveats": [ { "de": "Kein Verschweige-Vorwurf: …", "en": "Not a concealment claim: …" }, /* … */ ]
    },
    "meta": { /* pue.series 2020–2024 (1.10→1.08), consumption.form: "mwh", mwh: [2022,2023,2024], Tier SOURCED */ },
    "microsoft": { /* pue.series FY24/FY25 (1.16/1.17), consumption.form: "mwh", mwh: [FY22,FY23,FY24], Tier SOURCED, Scope-Mismatch-Caveat */ },
    "aws": { /* pue.series (reported 2024/2025: 1.15/1.14), consumption.discloses: false, kein "form" */ }
  },
  "sources": {
    "google_2025_env_report": { "name": "Google 2025 Environmental Report",
      "url": "https://www.smartenergydecisions.com/wp-content/uploads/2025/07/google-2025-environmental-report-1.pdf",
      "official": "https://sustainability.google/reports/google-2025-environmental-report",
      "fetched_at": "2026-07-09",
      "tier_note": "VERIFIED — from the research wing's gauntleted instrument 013 'The Floor'" }
    /* … je zitierter Quelle ein dereferenzierter Eintrag … */
  },
  "ingest_log": [
    { "action": "seed", "by": "field-research/works/2026-07-09-the-floor + studio/projects/diminishing-returns",
      "note_de": "Erstbefüllung, Werte wortwörtlich übernommen, Tiers und Caveats mitgeführt.",
      "note_en": "Initial seed, values copied verbatim, tiers and caveats carried over.",
      "ts": "2026-07-12T14:43:15Z" }
  ]
}
```

Zwei strukturelle Entscheidungen der bereits geseedeten Datei, für künftige Ingests
verbindlich: **Quellen sind dereferenziert** (`sources.<id>`, nicht inline je Ziffer
dupliziert) — jeder Eintrag verweist per `source_id`; und **Caveats sind eine flache
Liste von `{de, en}`-Paaren** je Firma, nicht getrennte DE/EN-Arrays.

`discloses: false` (AWS) ist eine **eigene, bewusste Semantik** — sie unterscheidet sich
von `status: "unreachable"` im Watcher-Zustand (`watch.json`): Dort bedeutet der Wert
„Landingpage war zur Prüfzeit nicht erreichbar" (Fetch-Fehler, potenziell temporär). Hier
bedeutet er „an der Primärquelle geprüft: diese Zahl existiert dort nicht" (geprüfte
Absenz, dauerhaft bis zur nächsten Berichtsrunde). Beides wird nie stillschweigend
gleichgesetzt.

### 3.3 Ableitungen (`compute.ts`, deterministisch, testgeschützt)

Alles, was nicht wörtlich offengelegt ist, wird zur Buildzeit aus dem Register berechnet
— nie im Register selbst gespeichert. `compute.ts` (Muster: `src/lib/praemie/chart.ts` für
reine Encoding-Funktionen) exportiert:

- **`headroomPct(pue)`** — `(pue − 1) / pue · 100`, volle Präzision, Rundung erst in
  `fmtPct`. Google 8,26 % bei 1,09; Meta 7,4 % bei 1,08.
- **`requiredPue(basePue, growthPct)`** — `basePue / (1 + growthPct/100)`.
- **`priorPeriod(period)`** — dekrementiert eine Perioden-Ziffernfolge (`"2024"→"2023"`,
  `"FY25"→"FY24"`); unbekanntes Format (z. B. `"reported 2024"`, Leerzeichen vor den
  Ziffern) → `null`, nicht geraten.
- **`growthFromMwh(mwh)`** — Wachstum je aufeinanderfolgendem Perioden-Paar aus einer
  aufsteigend sortierten MWh-Reihe, inkl. offengelegter Rechnung als String (z. B.
  `"(14975435-11167416)/11167416 = +34.1%"`). Meta: +34,1 % (2023), +20,6 % (2024).
  Microsoft: +29,8 % (FY23), +26,6 % (FY24).
- **`buildRounds(company, floor)`** — baut je Wachstumsjahr eine `Round` (Basis-PUE,
  Basis-Periode, `baseApprox`, erforderlicher PUE, `impossible`-Flag). **Per-Jahr-Basis-
  Disziplin:** sucht zuerst die PUE der **Vorperiode** (`priorPeriod` + `pue.series`-Lookup);
  fehlt sie, fällt die Funktion auf die PUE der **eigenen** Periode zurück und setzt
  `baseApprox: true`; fehlen **beide**, entfällt die Runde für dieses Jahr ganz (`continue`,
  kein Eintrag) — „keine Offenlegung, keine Runde" gilt so auch für eine fehlende Basis,
  nicht nur für fehlendes Wachstum.
- **`hasDisclosure(consumption)`** — Typ-Guard; `false` nur für AWS. Bei `discloses:
  false` liefert `buildRounds` naturgemäß ein **leeres** Rounds-Array (kein
  Sonderfall-Typ, keine geworfene Exception — die Leere selbst ist das Ergebnis).
- **`fmtRatio`/`fmtPct`** — Locale-abhängige Darstellung (`Intl.NumberFormat`), reine
  Rand-Formatierung; die Rechenlogik selbst rundet nie.

**Konkrete Konsequenz der Basis-Disziplin (bereits testgeschützt):** Google liefert drei
Runden (2023/2024/2025, alle `baseApprox: false`, alle `impossible: true`) — die
2025er-Runde nutzt korrekt die 2024er-PUE (1,09) als Basis, nicht die ältere 1,10. Meta
liefert zwei Runden (2023 Basis 1,08/2022er-PUE, 2024 Basis 1,08/2023er-PUE, beide
`baseApprox: false`, beide `impossible: true`). Microsoft liefert **nur eine einzige
Runde** (FY2024): die aus der MWh-Reihe ebenfalls ableitbare FY23-Wachstumszahl (+29,8 %)
bildet **keine** Runde, weil das Register für Microsoft weder eine FY22- noch eine
FY23-PUE führt — die FY24-Runde selbst nutzt mangels FY23-PUE die **eigene** FY24-PUE
(1,16) als Näherungsbasis (`baseApprox: true`) und kommt auf `requiredPue ≈ 0,92`. AWS
liefert null Runden.

**Testpflicht — bereits erfüllt** (`compute.test.ts`): reproduziert exakt `requiredPue(1.10,
17) ≈ 0,94`, `requiredPue(1.10, 27) ≈ 0,87`, `requiredPue(1.09, 37) ≈ 0,80` und
`headroomPct(1.09) ≈ 8,26 %` — die upstream bereits verifizierten Referenzwerte aus
„The Floor". Für Meta (0,81/0,90) und Microsoft (0,92, `baseApprox: true`) sind die
abgeleiteten Werte **eigene** Ableitung von `compute.ts`, kein Upstream-Zitat.

## 4. Seite (Ein-Minuten-Test)

**Aufmacherzahl: 0,87.** Caption: *„Der PUE, den Google 2024 gebraucht hätte, um sein
Wachstum auszugleichen. Die Skala endet bei 1,00."*

**Vier Firmen-Panels**, gemeinsame begrenzte horizontale Skala über `chart.ts`
(`scaleX(value, domain, width)`, Domain als festes `[number, number]`-Tupel, von der
Seite gewählt — z. B. `[0.75, 1.20]`, abgeleitet aus dem tatsächlichen Min/Max aller
gerenderten Marker, **nicht** pro Firma normiert, damit die visuelle Nähe zum Boden
zwischen Firmen vergleichbar bleibt):

- Boden bei 1,00 über `floorX(domain, width)`, feste vertikale Linie.
- Gehatchte Unmöglichkeitszone über `impossibleZone(domain, width)` +
  `hatchLines(zone, height, spacing)` — deterministische 45°-Linien, keine Animation.
- Achsen-Ticks über `ticks(domain, step, width)`.
- Marker: aktueller PUE (durchgezogen, belegt) und je Runde aus `buildRounds` ein
  Breakeven-Marker (offen; gestrichelt statt durchgezogen bei `round.baseApprox`, z. B.
  Microsoft FY2024).
- Google: drei Breakeven-Marker (2023/2024/2025) in der Zone — **entschieden 2026-07-12:**
  der 2025er-Marker (2026-Report-Vintage, Wording-Shift „total electricity") erscheint
  in derselben Hauptskala neben 2023/2024, aber offen/annotiert (Vintage-Flag +
  Wording-Shift-Fußnote, s. §8), kein separates Postskriptum. Meta: zwei (2023/2024);
  Microsoft: einer (FY2024, gestrichelt).
- Daneben je Panel: Verbrauchswachstum als Zahl + Zitat (Google `growthSource:
  "disclosed"`, wörtlich zitiert; Meta/Microsoft `growthSource: "derived"`, mit
  offengelegter Rechnung aus `round.arithmetic` gekennzeichnet).
- **AWS-Panel bleibt leer** in der Marker-Grafik — `buildRounds` liefert dort naturgemäß
  null Runden, es gibt nichts zu markieren. Nur die Skala und ein Vermerk *„legt keinen
  Verbrauch offen — kein Breakeven berechenbar"*. Der disclosed PUE (1,14/1,15) erscheint
  dennoch in der Zahlentabelle darunter (belegt, Tier SOURCED); er entfällt nur in der
  Panel-Grafik, weil die Grafik die PUE-vs-Wachstum-Relation zeigt und genau diese
  Relation bei AWS strukturell fehlt. Die Leere selbst ist der Befund.

**Zahlentabelle** darunter, vollständig inspizierbar: Wert, Periode, Tier, Zitat (wo
vorhanden), Quell-Link — jede Zeile, die in der Grafik als Marker erscheint, plus die
Zeilen, die es nicht in die Grafik schaffen (AWS-PUE, Microsofts FY23-Wachstumszahl ohne
Runde).

### 4.1 Begründung gegen das Tacho-Verbot

Der Visualisierungs-Standard verbietet „Kennzahlen-Theater: Tachos, Fortschrittsringe,
fingierte Dashboards ohne Erkenntniswert" (§4). Spielraums begrenzte Skala fällt bewusst
**nicht** darunter:

- **Keine Rundinstrument-Optik.** Lineare, horizontale Skala (`scaleX`) — kein Halbkreis,
  keine Nadel, keine Ampel-Farbcodierung „gut/schlecht". Ein klassischer Tacho suggeriert
  Performance über eine willkürlich gesetzte Farbzone; hier gibt es keine redaktionelle
  Zone — die Unmöglichkeitszone ist die physikalische Definitionsgrenze der Kennzahl
  selbst (PUE < 1,0 ist keine schlechte Note, sondern unmöglich).
- **Die Skala ist die gemessene Relation, kein Dekor.** Der Boden bei 1,0 und die Nähe der
  Marker dazu (Google 8,3 % Restweg, Meta 7,4 %) **sind** der Befund — nicht seine
  Bebilderung. Ohne die Skala ließe sich die zentrale Aussage („kaum noch Spielraum")
  nicht mehr zeigen, nur behaupten; die Skala besteht also den Rücktest aus §4 letzter
  Spiegelstrich („was ohne Erkenntnisverlust entfernbar wäre, muss weg") in die andere
  Richtung — sie ist nicht entfernbar, ohne die Aussage zu schwächen.
- **Die Breakeven-Marker unterhalb des Bodens machen die Unmöglichkeit geometrisch
  lesbar.** Ein Fließtext-Satz („der erforderliche PUE wäre 0,87") verlangt vom Leser,
  selbst zu wissen, dass PUE nicht unter 1,0 fallen kann. Die Grafik zeigt es: der Marker
  fällt sichtbar in eine Zone, die als unmöglich markiert ist.

**Gate (a)–(e) einzeln nachgewiesen:**

- **(a) Belegt.** Jeder Marker bildet einen Registerwert mit Quelle+Tier ab; keine
  erfundenen oder Platzhalter-Punkte — das AWS-Panel zeigt konsequent nichts statt eines
  geschätzten Balkens (`buildRounds` liefert dort tatsächlich `[]`).
- **(b) Ehrlich kodiert.** Skalenbereich aus dem tatsächlichen Wertebereich aller Marker
  abgeleitet, fix über alle vier Panels; `scaleX` gibt bei entartetem Domain `-1` zurück
  statt `NaN` zu produzieren — keine Achsenkappung, die die Unmöglichkeitszone
  verkleinert.
- **(c) Lücke als Form.** Microsofts fehlende FY22/FY23-PUE wird nicht interpoliert,
  sondern führt dazu, dass die FY23-Wachstumszahl gar keine Runde bildet und die
  FY24-Runde als Näherung (gestrichelt) markiert wird; AWS' fehlender Verbrauch als
  leeres Panel statt geschätztem Balken.
- **(d) Inspizierbar.** Jeder Marker ist per Hover/Tap mit Exaktwert, Periode, Quelle,
  Tier hinterlegt; die Zahlentabelle liefert denselben Zugriff redundant (Tastatur/kein
  Hover).
- **(e) Trägt eine Relation.** Position relativ zum Boden UND relativ zur
  Unmöglichkeitszone ist die Kern-Relation der Untersuchung — wie wenig Raum bleibt
  (Headroom) und wie tief die Breakeven-Marker darunter fallen. Ein einzelner Satz sagt
  „PUE ist 1,09, Boden ist 1,0", zeigt aber nicht die Verhältnismäßigkeit von 8,3 %
  Restweg gegen 27 % Jahreswachstum so unmittelbar.

**Statisch, keine Animation** (Sprung statt Tween bei Ansichtswechsel, falls es einen
gibt — z. B. Firmenauswahl). Theme-Tokens skin-agnostisch (Mono-Skin fest, aber keine
hartcodierten Farben in `chart.ts` — Zonen/Marker über CSS-Variablen).

## 5. Watcher (bereits implementiert)

**Action:** „Spielraum watch" (`.github/workflows/spielraum-watch.yml`), Cron `17 6 3 * *`
(monatlich am 3. um 06:17 UTC) + `workflow_dispatch`. Neu gegenüber den übrigen
Protokoll-/Gegenmessung-Workflows: `permissions: issues: write` zusätzlich zu `contents:
write` — der erste Lab-Watcher, der GitHub Issues eröffnet.

**Commit-Identität: `Gegenmessung <gegenmessung@frankbueltge.de>`.** Der Watcher lebt zwar
technisch als Subpaket der bestehenden Protokoll-Pipeline (`pipelines/protokoll/src/protokoll/
spielraum/`, wiederverwendet `protokoll.fetch.fetch`/`SourceUnavailable`), gehört inhaltlich
aber zur Gegenmessung-Linie (s. Kopfzeile dieser Spec) — er committet daher als
`Gegenmessung <gegenmessung@frankbueltge.de>`, wie die übrigen Gegenmessung-Workflows
(`beifang.yml`, `round-number.yml`, `redaction.yml`, `ghost-fleet.yml`, `gegenmessung.yml`).
`Protokollführung` bleibt der Protokoll-Familie vorbehalten.

**Ablauf des Workflow-Jobs** (`watch`):
1. Checkout (volle History), Python 3.12 Setup.
2. `pip install --no-cache-dir ./pipelines/protokoll`.
3. `python -m protokoll.spielraum.run --repo-root . --summary-out /tmp/spielraum-summary.json`
   — schreibt `src/data/spielraum/watch.json` und eine Zusammenfassung
   (`{issue_needed, title, body, changed, unreachable}`); **committet nichts selbst** —
   das CLI hat bewusst keinen eigenen Commit-Pfad (anders als `praemie/run.py`).
4. Committen: `watch.json` stagen, bei Diff committen (Message `spielraum: Berichtslage
   geprüft $(date -u +%F)`), Rebase-Retry-Push-Schleife wie in den übrigen
   Gegenmessung-/Protokoll-Workflows.
5. Issue-Schritt: Label `spielraum` sicherstellen (`gh label create … || true`); wenn
   `issue_needed` true, prüft der Schritt, ob bereits ein offenes Issue mit Label
   `spielraum` existiert (**ein** globaler Dedup-Schlüssel über alle Firmen — bewusst
   einfacher als eine Pro-Firma-Unterscheidung): ist keins offen, neues Issue mit
   Titel/Body aus der Zusammenfassung; ist bereits eins offen, wird — **nie still** —
   ein Kommentar ans älteste offene `spielraum`-Issue gehängt (Titel der neuen
   Feststellung vorangestellt, `**Titel**\n\nBody`), statt die Änderung kommentarlos
   verstreichen zu lassen.

**Landingpages (5 GETs/Monat, `sources.py`, Aufnahmeregel dort dokumentiert — analog zur
Redaction-Watchlist):**

| kind | Firma | URL |
|---|---|---|
| `google_sustainability_reports` | Google | `sustainability.google/reports/` |
| `microsoft_dc_efficiency` | Microsoft | `datacenters.microsoft.com/sustainability/efficiency/` |
| `microsoft_sustainability_report` | Microsoft | `microsoft.com/en-us/corporate-responsibility/sustainability/report` |
| `meta_sustainability` | Meta | `sustainability.atmeta.com/` |
| `amazon_sustainability` | Amazon/AWS | `sustainability.aboutamazon.com/` |

Änderungen an dieser Liste (neue Firma, neue URL, entfernte Quelle) nur mit Vermerk in
dieser Spec — so im Docstring von `sources.py` selbst verlangt.

**Regex-Fingerprint (`fingerprint.py`, kein bs4/lxml — `pipelines/protokoll` hat bewusst
nur `httpx` als Abhängigkeit):** zwei Signale, sortiert und zu einem SHA-256
zusammengefasst: (a) `href`-Werte, die auf `.pdf` enden oder einen report-artigen Pfad
enthalten (Regex `report|environmental|sustainability|data-index|fact-sheet`,
case-insensitiv, Query-String abgeschnitten, kleingeschrieben); (b) Jahres-Tokens
`2025`–`2039` und Fiskal-Tokens `FY25`–`FY29` im grob tag-bereinigten sichtbaren Text.
**Kein** Voll-HTML-Hash, **kein** PDF-Parsing, **kein** Schreiben an `register.json`.

**Bewusst in Kauf genommene Grenze:** ein blankes Jahres-Token — z. B. „© 2026" im Footer
— matcht Regel (b) genauso wie ein echter Report-Verweis und kann einen
Fingerprint-Wechsel ohne neuen Bericht auslösen (Fehlalarm). Reine Nav-/Label-Änderungen
ohne Report-Link und ohne Jahres-/Fiskal-Token bewegen den Fingerprint dagegen **nicht**
— beides ist testgeschützt.

**Vergleich (`diff.py`):** pro Quelle (`kind`) einzeln, nicht global — fehlt der alte
Fingerprint (Erstlauf **dieser** Quelle), wird nur die Baseline gesetzt, ohne Issue; hat
sich der Fingerprint geändert, zählt die Quelle als „changed"; eine nicht erreichbare
Quelle zählt `consecutive_unreachable` hoch, ab **zwei** in Folge issue-würdig (eine
einzelne tote Seite meldet noch nicht). `issue_needed` = mindestens eine geänderte
**oder** mindestens eine anhaltend unerreichbare Quelle.

**Fußnote zum Dedup:** die Sperre ist global (ein offenes `spielraum`-Issue verhindert ein
zweites) — aber „gesperrt" heißt nicht „still". Eine zweite, unabhängige Änderung, die
erkannt wird, während das erste Issue noch offen ist, bekommt keinen eigenen Issue,
sondern einen Kommentar am ältesten offenen `spielraum`-Issue (s. Ablauf-Schritt 5) — sie
verschwindet nie spurlos, nur weil `watch.json` den Fingerprint ohnehin fortschreibt.
`watch.json` verliert dabei nichts (der Zustand jeder Quelle wird unabhängig
fortgeschrieben); gebündelt wird nur der Benachrichtigungskanal, bis das offene Issue per
Ingest geschlossen wird.

## 6. Ingest-Runbook

Jeder Append an `register.json` ist ein eigener, benannter Commit — nie still:

1. Watcher-Issue (Label `spielraum`) meldet geänderte Berichtslage für Firma X, oder die
   jährliche Routine-Prüfung wird ohne Issue-Anlass angestoßen.
2. Session öffnet die **Primärquelle** direkt (offizielle Report-/Landingpage, kein
   Sekundär-Zitat aus Presseartikeln als Quelle).
3. Zwei Zahlen je Firma extrahieren: (a) aktuellste PUE, (b) Verbrauchswachstum bzw.
   absolute Verbrauchsreihe für die letzten ein bis zwei Perioden.
4. Gegenprüfung: Zahl im Bericht wortwörtlich auffinden (Volltextsuche), Scope prüfen
   (Fiskal- vs. Kalenderjahr, eigen-betrieben vs. angemietet, konzernweit vs.
   Rechenzentrum), Wortwahl-Änderungen ggü. Vorjahr vermerken (z. B. Googles Shift „total
   electricity" vs. „data center electricity").
5. Tier vergeben: **VERIFIED** nur bei direktem Zugriff auf die Primärquelle durch die
   ingestierende Session selbst (kein Proxy, keine Sekundärquelle); sonst **SOURCED**.
   Ein bestehendes VERIFIED wird durch eine spätere SOURCED-Session nie überschrieben.
6. Append im realen Schema: neuer Serieneintrag unter `company.pue.series` bzw.
   `company.consumption.growth_pct`/`mwh` mit `period`, `figure`/`value`, `quote`
   (wörtlich, wo verfügbar), `source_id` (verweist auf einen ggf. neu anzulegenden
   Eintrag in `sources`: `name`, `url`, `fetched_at`, `tier_note`), `tier`; neue oder
   geänderte Caveats als `{de, en}`-Paar an `company.caveats` anhängen.
7. `ingest_log`-Eintrag im realen Schema: `{ action, by, note_de, note_en, ts }` — z. B.
   `{ action: "append", by: "<Session>", note_de: "…", note_en: "…", ts: "<ISO-Zeit>" }`.
8. Commit, Nachricht nennt Firma+Periode+Tier, z. B. `spielraum: Google FY2025 PUE +
   Wachstum ergänzt (VERIFIED)`.
9. Auslösendes Watcher-Issue mit Verweis auf den Commit schließen.
10. **Archiv-Regel:** bestehende Registereinträge werden nie editiert. Stellt sich ein
    Fehler heraus (falsch gelesene Zahl, falscher Scope), entsteht ein **neuer** Eintrag
    plus ein `ingest_log`-Eintrag `{ action: "correction", by, note_de: "korrigiert
    <Firma>/<Periode>, weil …; alter Eintrag bleibt im Register stehen", note_en: "…", ts
    }` — der alte Eintrag bleibt sichtbar, nur nicht mehr als aktuell markiert.

## 7. Methodenblatt

Sechs Pflichtsektionen nach §3.5 der Werkgruppen-Spec:

1. **Quellen + Lizenzen.** Google-/Meta-/Microsoft-/AWS-Umwelt-/Nachhaltigkeitsberichte,
   öffentlich einsehbar, Urheberrecht beim jeweiligen Unternehmen — Spielraum zitiert
   kurz und mit Quellenangabe, verbreitet keine ganzen Berichte weiter.
2. **Abrufkadenz.** Jährlich fortgeschrieben — keine Tagesfrische-Behauptung. Der Watcher
   prüft monatlich nur, ob eine **neue** Berichtsrunde vorliegt; das Register selbst
   ändert sich nur bei geprüftem Ingest. Anzeige: *„Berichtslage zuletzt geprüft am …"*
   (aus `watch.json.generated_at`, ergänzt um das je Firma jüngste
   `sources.<kind>.last_checked`), sichtbar auf der Seite. **Solange der erste
   Watcher-Lauf noch aussteht** (Fingerprint `null`, `last_checked` `null` je Quelle —
   der Zustand von `watch.json` zum Zeitpunkt dieser Spec), zeigt die Seite ehrlich
   *„noch nicht geprüft"* statt eines Datums — kein erfundener oder vorgezogener
   Prüfzeitpunkt.
3. **Verarbeitung.** Link auf `src/lib/spielraum/compute.ts` (Ableitungslogik) und
   `src/data/spielraum/register.json` (Rohdaten); Ingest-Runbook (§6) verlinkt.
4. **Grenzen der Methode.** Prominent, s. §8.
5. **Compute-Fußabdruck.** 5 HTTP-GETs pro Monat (Watcher) + ein statischer Astro-Build
   pro Ingest-Commit; praktisch null — kein Cron-Compute, keine Datenbank, kein
   Live-Fetch zur Laufzeit der Seite.
6. **Änderungsprotokoll.** `ingest_log`-Einträge aus dem Register, chronologisch
   dargestellt.

## 8. Grenzen der Methode (prominent)

- **PUE ignoriert Carbon-Intensität, IT-Auslastung und absolute Skala.** Erneuerbare und
  Kohlestrom zählen identisch; die Kennzahl belohnt nichts für Nutzarbeit oder
  Gesamtgröße.
- **Scope-Mismatches, je Firma benannt:** Microsofts PUE deckt nur eigen-betriebene
  Rechenzentren, der zitierte Verbrauch ist konzernweit (org-wide, GRI 302-1) — kein
  rechenzentrums-spezifischer Verbrauch offengelegt. Metas MWh-Zahl kombiniert eigene und
  angemietete Standorte; ob der PUE dieselbe Fläche abdeckt, ist ungeklärt. Googles
  Flotten-PUE deckt nur eigen-betriebene Campus, nicht Colocation.
- **Fiskal- vs. Kalenderjahre.** Microsoft berichtet in Fiskaljahren (Juli–Juni), Google
  und Meta in Kalenderjahren — nie ohne Kennzeichnung vermischt.
- **AWS-Berichtsjahr-Ambiguität.** Amazon benennt PUE nach Berichtsjahr; ob „reported
  2025" das Datenjahr 2024 oder 2025 meint, ist aus dem Primärtext nicht auflösbar —
  offen benannt, nicht geraten.
- **Googles Wording-Shift 2026:** der 2026er-Bericht spricht von „total electricity",
  der 2025er von „total data center electricity" — unterschiedliche Nenner, wörtlich
  zitiert, nie stillschweigend gleichgesetzt.
- **Kein Verschweige-Vorwurf an Google.** Die 27-%- und 37-%-Zahlen stehen offen im
  selben Bericht wie der PUE. Gemessen wird die Struktur der Kennzahl und das Framing
  (Effizienzgewinn neben wachsendem Absolutwert), nicht Googles Offenheit — die ist
  vergleichsweise hoch. **AWS ist der einzige echte Absenz-Befund** der vier: dort
  fehlt die Zahl an der Quelle selbst, geprüft.
- **Jahreskadenz.** Die Seite behauptet keine Tagesfrische; „Berichtslage zuletzt
  geprüft am …" macht das Prüfdatum sichtbar, ersetzt aber keine tägliche Messung.

## 9. Tests

**Vitest — bereits geschrieben:**
- `src/lib/spielraum/compute.test.ts` — `requiredPue(1.10,17)≈0,94`,
  `requiredPue(1.10,27)≈0,87`, `requiredPue(1.09,37)≈0,80`; `headroomPct(1.09)≈8,26 %`,
  `headroomPct(1.08)≈7,4 %`; `priorPeriod` (Ziffern-Dekrement + unbekanntes Format →
  `null`); `growthFromMwh` (Meta +34,1 %/+20,6 %, Microsoft +29,8 %/+26,6 %);
  `hasDisclosure` (false nur AWS); `buildRounds` gegen das **echte** `register.json` je
  Firma (Google 3 Runden alle impossible/`baseApprox:false`; Meta 2 Runden;
  Microsoft genau 1 Runde mit `baseApprox:true`; AWS 0 Runden); `fmtRatio`/`fmtPct`
  Locale-Formatierung.
- `src/lib/spielraum/chart.test.ts` — `scaleX` linear + entartetes Domain → `-1` statt
  `NaN`; `floorX` deterministisch, respektiert expliziten `floor`-Parameter;
  `impossibleZone` inkl. „Boden außerhalb des Domains" → `null`; `hatchLines`
  deterministische, gleichmäßig verteilte 45°-Linien, leer bei nicht-positiven Maßen;
  `ticks` Schrittweite konsistent mit `scaleX`.
- Werke-Registry-Eintrag `spielraum` bereits in `src/data/werke.ts` (Titel, Untertitel,
  Beschreibung final, `tier: 'experiment'`, `since: '2026-07-12'`) — deckt sich mit den
  generischen Registry-Tests in `werke.test.ts`.

**pytest — bereits geschrieben** (`pipelines/protokoll/tests/`), Fixtures durchgehend als
**Inline-HTML-Strings im Testmodul** (keine gespeicherten Snapshot-Dateien):
- `test_sr_fingerprint.py` — Fingerprint stabil bei identischem HTML; neuer Report-Link
  ändert den Fingerprint; reine Nav-/Boilerplate-Änderung ändert ihn **nicht**;
  Query-String-Varianten derselben URL erzeugen denselben Fingerprint; Fiskal-/Jahres-
  Tokens werden erfasst; ein Jahres-Token außerhalb 2025–2039 (z. B. „Copyright 2024")
  wird **nicht** erfasst.
- `test_sr_watch.py`, mit `httpx.MockTransport` (kein echter Netzzugriff) — Erstlauf
  setzt Baseline ohne Issue; eine geänderte Quelle löst ein Issue mit Firma+URL im Body
  aus; einmal unreachable löst noch **kein** Issue aus; zweimal in Folge unreachable löst
  eins aus; `--summary-out` schreibt die erwartete Form (`issue_needed`, `title`, `body`,
  `changed`, `unreachable`); ein Lauf ohne `--summary-out` bricht nicht ab.

  **Abgrenzung Python vs. Workflow:** Die Aussage „bleibt eine Quelle über einen dritten,
  vierten … Monat geändert/unerreichbar, während bereits ein offenes Issue existiert,
  entsteht kein zweites Issue" ist **kein** pytest-geprüftes Verhalten von `compare()`/
  `main()` — `issue_needed` wird dort unabhängig von einem etwaigen offenen Issue
  berechnet. Sie beschreibt die **gh-Dedup-Ebene im Workflow-Issue-Schritt** (§5): dort
  entscheidet der `bash`-Schritt anhand von `gh issue list`, ob ein neues Issue entsteht
  oder — seit dem Nie-still-Fix — ein Kommentar an das bestehende gehängt wird. Diese
  Ebene ist nicht mit pytest getestet, weil sie außerhalb von Python liegt.

**Noch zu schreiben:** Snapshot-/Komponententests für die Astro-Seite und die
Methodenblatt-Komponente, sobald diese existieren (s. §11).

## 10. Nicht-Ziele

- Kein Auto-Parsing/PDF-Extraktion — Zahlen kommen ausschließlich aus geprüften
  Ingest-Sessions (§6), nie aus einem automatischen Extraktor.
- Kein LLM-Schritt in Watcher oder Compute — beides ist deterministischer Code
  (Regex-Fingerprint, arithmetische Ableitung).
- Kein Live-Zugriff zur Laufzeit der Seite — die Site liest ausschließlich das
  committete Register, nie eine Live-API.
- Kein Ranking oder Naming-and-Shaming-Theater zwischen den vier Firmen — die Panels
  folgen einer festen Reihenfolge, nie einer Sortierung nach „schlechtestem PUE".
- Keine Echtzeit-Behauptung — Jahreskadenz ist explizit, s. §7.2 und §8.
- Kein Backfill vergangener Berichtsrunden mit heutigem Prüfstand — jede Ingest-Session
  arbeitet mit dem zum Ingest-Zeitpunkt aktuellen Bericht der Firma, datiert korrekt.

## 11. Offene Punkte

- **Frontend fehlt vollständig:** Astro-Seiten (`/spielraum`, `/de/spielraum`), die
  Methodenblatt-Komponente (`/werke/spielraum`, `/de/werke/spielraum`) und ihre
  Verdrahtung mit `compute.ts`/`chart.ts` sind zum Zeitpunkt dieser Spec noch nicht
  gebaut — nächster Umsetzungsschritt.
- **Entschieden (2026-07-12): Untertitel.** Der Registry-Eintrag `spielraum` in
  `src/data/werke.ts` trägt den finalen Untertitel: DE „Rechenzentrums-Effizienz nahe am
  Anschlag, Verbrauch im Steigflug", EN „Data-center efficiency near its floor,
  consumption climbing" — keine offene Frage mehr.
- **Entschieden (2026-07-12): die 2025er-Google-Zeile** (2026-Report-Vintage, Breakeven
  0,80, Wording-Shift „total electricity") erscheint in der Hauptskala als offener/
  annotierter Marker neben 2023/2024 (Vintage-Flag + Wording-Shift-Fußnote, s. §4/§8) —
  **kein** separates Postskriptum. Register und `compute.ts` unterstützten beide
  Varianten bereits (dritte `Round` war vorhanden); die Darstellungsfrage ist damit
  geschlossen.
- Ob Microsofts FY23-Wachstumszahl (+29,8 %, aus MWh ableitbar, aber ohne Runde, weil das
  Register keine FY22/FY23-PUE führt) auf der Seite als Kontext-Zahl in der Tabelle
  gezeigt wird oder ganz entfällt, da sie strukturell keine Breakeven-Aussage trägt —
  weiterhin offen.
