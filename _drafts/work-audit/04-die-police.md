# Werk-Audit 04 — Die Police (Pipeline-Name „Prämie")

> Fakten-Dossier. Belege als repo-relative Pfade. Verbatim-Zitate in „…".
> Werk-ID/Route = `praemie`; Titel = „Die Police". Einzelwerte aus `police.json` sind Tagesstände.

## 1. Kurzbeschreibung (Ist)
- **Titel / Untertitel:** „Die Police" — „Was die Apokalypse kostet" (`werke.ts`; `ui.ts`
  `px2.sub`: „Was die Apokalypse kostet — die Prämie der Gegenwart, jede Nacht neu berechnet.").
- **Werkbeschreibung (verbatim, `werke.ts`):** „Ein Versicherungsschein auf die Gegenwart,
  dessen Prämie jede Nacht aus echten Marktdaten neu berechnet wird. Der Markt hat die
  Klimakatastrophe längst eingepreist — und die Prämie steigt: +179 % seit 1998."
- **Namens-/ID-Doppelung:** Werk-ID + Route = `praemie`; Anzeigetitel = „Die Police". (ZU
  KLÄREN, ob beibehalten.)
- **Routen:** `/praemie` (+`/en`), Methodenblatt `/werke/praemie` (+`/en`).
- **Dateien:** `src/components/pages/PraemiePage.astro`, `…/MethodenblattPraemie.astro`,
  `src/lib/praemie/{types,render}.ts` (+`render.test.ts`), Daten `src/data/praemie/police.json`,
  Pipeline `pipelines/protokoll/src/protokoll/praemie/*`.
- **Status:** live.

## 2. Datenbasis
- **Vier Quellen (keyless, US-zentriert):**
  - **Prämie:** BLS PPI (Hausrat-/Wohngebäudeversicherung; Basis Juni 1998 = 100) via FRED-CSV
    (`praemie/bls.py`).
  - **Schadenverlauf:** NOAA NCEI Billion-Dollar Disasters CSV 1980–2024 (`disasters.py`).
  - **Laufende Regulierung:** FEMA OpenFEMA NFIP Claims (JSON) (`claims.py`).
  - **Rückzug:** California DOI Non-Renewals — kuratierte, gebündelte `retreat.json`
    (`praemie/data/`, via `retreat.py`).
- **Verifizierte Tagesstände (laut `police.json`, 2026-06-14):** premium.index ≈ 279,1
  (Mai 2026); change_pct_since_base ≈ **179,1 %**; disasters.cumulative_cost ≈ **2.917,6 Mrd. $**;
  total_events **403**; latest_year **2024** (27 Ereignisse, 182,7 Mrd. $, 568 Tote); claims
  recent_paid ≈ 9,74 Mio. $ (Stichprobe); retreat.non_renewals ≈ 2,8 Mio. (Stand 2023-12-31).
  *(Tagesstände — verifizieren.)*
- **Lizenzen/Provenienz:** alle vier Public Domain / offen; je Sektion `source` im JSON.
- **Schema/Sektionen:** `premium`, `disasters`, `claims`, `retreat` (jeweils Daten **oder**
  `{error}`); `schema_version`, `pipeline_version`.
- **Kadenz:** nächtlich, laut Methodenblatt **04:00 UTC** (Prämie monatlich, Schaden jährlich/
  eingefroren auf 2024, Regulierung monatlich, Rückzug jährlich/redaktionell). *(Scheduler ZU KLÄREN.)*
- **Fehler-/Plausibilität:** Sektion-Fault-Isolation (`run.py` `_section()` → `{error}`);
  **Premium-Degenerate-Guard** (ohne gültige Prämie kein Commit → Vortags-Police bleibt);
  NaN-Skip in `disasters.py` (`math.isfinite`); Fallback-Quellobjekte im Methodenblatt.

## 3. Technische Methode
- **Pipeline:** `bls.py`, `disasters.py` (CSV-DictReader, 2 Headerzeilen übersprungen,
  Jahres-Aggregation), `claims.py` (JSON-Summe), `retreat.py` (gebündeltes JSON), `run.py`
  (Orchestrierung, Guard, Commit „prämie: Police vom {today}").
- **Deterministisch, kein LLM.** Frontend `src/lib/praemie/render.ts`: deterministische
  Template-Prosa (Kopf + §1–§6 + Schluss, DE/EN), Intl-Zahlen/Datumsformat; `render.test.ts`
  deckt alle Sektionen inkl. Error-Fallback.
- **Für die Aussage wichtige Codepfade:** Prämienindex (`change_pct = (latest/base − 1)·100`),
  Schadenaggregation (Mio.→Mrd.), Schluss-/Selbstbehalt-Sätze in `render.ts`.

## 4. Künstlerische Setzung (nur aus vorhandenen Texten)
- **These (Spec `2026-06-14-praemie-design.md`, verbatim):** „Der Markt hat die Klimadebatte
  längst beendet — mit Preisen. Die (Rück-)Versicherer … haben die Katastrophe bereits
  eingepreist; und die Prämie steigt." / „Die Apokalypse ist nicht Prognose, sie ist eine
  Police, die in Kraft ist."
- **Form:** Dokumentgenre **Versicherungsschein/Police** — „der dunkle Zwilling des
  Protokolls"; aktuarisches Register, deterministisch.
- **Sprache/Tonalität:** kalt, rechtlich-formell. Kopf (verbatim, `render.ts`):
  „Versicherungsschein — Die Gegenwart. Versicherungsnehmer: kommende Generationen.
  Versicherer: der Markt. …".
- **Starke Sätze (verbatim, `render.ts`):** §6 „Den Selbstbehalt trägt, wer keine Police hat.";
  Schluss „Diese Police wurde nicht unterzeichnet. Sie ist in Kraft. Prämie fällig."
  (spiegelt den Protokoll-Schluss).

## 5. Methodenblatt / Dokumentation
- **Vorhanden** (6-Punkte, `MethodenblattPraemie.astro`). Grenzen (verbatim, Auszug):
  „Alle vier Quellen sind US-zentriert …"; „Der Prämienindex misst US-Wohngebäude-
  Versicherungspreise als Proxy …, nicht Rückversicherungsprämien direkt."; „Der
  Schadenverlauf (NOAA NCEI) endet 2024 …"; „Der Rückzug … ist redaktionell nachgeführt — kein
  Live-Feed."
- **Deutungs-Disclaimer vorhanden (verbatim):** „„Der Markt hat die Apokalypse eingepreist"
  ist eine Deutung steigender Preise, nicht die Behauptung, irgendeine einzelne Zahl sei gleich
  den Kosten der Katastrophe."
- **Öffentlich fehlende ethische Hinweise (ZU KLÄREN):** kein Hinweis auf der **Hauptseite**,
  dass es ein Index-Kunstwerk, keine versicherbare Quote ist (nur im Methodenblatt); Tote
  (§3) ohne Kontext; „Rückzug" nur Kalifornien (nicht US-weit) — Übergeneralisierungs-Risiko.

## 6. Prozess / Scheitern / Verwerfung
- **Git-Verlauf:** Pipeline (TDD) → Frontend/Methodenblatt/Routen → erste Police-Commits.
- **Substanz-Gate (Spec §4):** Provenienz/These/Infrastruktur/Leave-behind/Verhältnismäßigkeit
  als erfüllt dokumentiert. **Nicht-Ziele (Spec §5, verbatim):** „Keine Karte, keine Cat-Bond-
  Spreads (paywalled), kein LLM-Text, keine Echtzeit-Börsendaten; US-Fokus offen ausgewiesen …".
- **Dokumentierte Verwerfungen/Redesigns:** keine explizit im Repo sichtbar — Werk kam relativ
  direkt aus der Spec. **ZU KLÄREN.** (Code-Review-Funde wie NaN-Guard nur als Fix in der
  Historie, nicht als kuratierte Prozessnotiz.)

## 7. Risiken (nur Beobachtung)
- **US-Zentrierung / Proxy-Validität:** mittel–hoch (offen ausgewiesen, aber strukturell).
- **Pathos-Risiko:** mittel — Titel „Apokalypse" + „in Kraft"; abgefedert durch Disclaimer +
  kalten Aktuar-Ton.
- **Gimmick-Risiko:** mittel — Police-Genre ist pointiert, könnte „hübsch statt hart" wirken.
- **Ethik-Risiko:** mittel — Tote als Datenpunkt; „versicherbar?"-Missverständnis.
- **Dashboard-/Tech-Demo-Risiko:** niedrig–mittel.
- **Quellen-/Methodenrisiko:** mittel — NOAA endet 2024 (Fortführung extern); Retreat manuell.
- **Unklare Werkform:** niedrig — Genre klar (Police). **Consulting-Nähe:** mittel — These ist
  finanz-/versicherungsmarktnah (eher Fachpublikum als Kunstpublikum vertraut).

## 8. Potenziale (nur aus Material)
- **Druckobjekt „Police"** — Druck-Stylesheet vorhanden (`@media print`), Genre prädestiniert.
- **Zeitreihe der Prämie** (Archiv) statt nur aktueller Stand.
- **Vergleich weiterer Märkte/Länder**, soweit offen verfügbar.
- Anschlussformate: Methodenblatt (vorhanden), Dataset, **Druckedition**, Exposition.

## 9. Fehlende Informationen (ZU KLÄREN)
- ID/Route `praemie` vs. Titel „Die Police" beibehalten?
- Hauptseiten-Disclaimer (Index-Kunstwerk, keine versicherbare Quote) erwünscht?
- Wahl Kalifornien für „Rückzug" — Begründung/Repräsentativität.
- Fortführung NOAA-Reihe ab 2025 (Climate Central) — automatischer Wechsel?
- Alter-Limit der „letzten gültigen Police" bei Degenerate-Guard.
- Scheduler/Deployment-Status; Verbatim-Prüfung der Tagesstände in `police.json`.
