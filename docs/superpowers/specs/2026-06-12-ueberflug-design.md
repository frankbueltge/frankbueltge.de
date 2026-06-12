# Werk ② „Überflug" — Teilprojekt-Design

**Datum:** 2026-06-12
**Status:** **AUSGEMUSTERT als Werk (2026-06-12)** — nach Realisierung am eigenen
Substanz-Gate gescheitert (keine These, keine Akkumulation; erfahrbar als Utility).
Lebt als Studie im Lab weiter (`src/content/lab/ueberflug-studie/`), Snapshot-Cron
läuft weiter. Mögliche Härtung zum Werk („Verdichtung des Blicks", Zeitreihe statt
Überschreiben) ist im Studientext als offene Frage dokumentiert.
**Übergeordnet:** `2026-06-11-werkgruppe-design.md` §5 (Konzept), §2 (Substanz-Kriterien), §3 (Architektur)

## 1. These & Form

**These:** Das planetare Panoptikum ist real, kartiert und auf die Sekunde berechenbar.

**Form:** Eine Buchführung des Himmels. Die Seite berechnet client-seitig (SGP4 im
Browser), welche Erdbeobachtungssatelliten den Standort des Besuchers *jetzt* im
Sichtfeld haben — mit Eigentümer-Klassifikation (kommerziell / staatlich-zivil /
militärisch). Kein Blick der Seite auf den Besucher: Der Standort verlässt den
Browser nie; alles rechnet lokal auf committeten Bahndaten.

## 2. Datenquellen (Rechercheergebnis, ersetzt §12-Annahmen der Werkgruppen-Spec)

| Zweck | Quelle | Lizenz/Status |
|---|---|---|
| Bahndaten (GP/OMM, JSON) | CelesTrak `gp.php`, GROUPs `resource` (~370), `sar` (~120), `weather` | kein explizites Nutzer-Lizenztext; Praxis frei, Attribution; max. 1 Fetch/2h-Zyklus — 1×/Tag konform |
| Eigentümer/Zweck | **GCAT** (J. McDowell, planet4589.org): `active.tsv` + `psatcat.tsv` + `satcat.tsv` (JCAT↔NORAD-Mapping) | **CC-BY 4.0**, täglich gepflegt. Felder: `Class` (C=zivil, D=militärisch, B=kommerziell, A=Amateur), `Category` (IMG, MET, EW, …) |
| Propagation | satellite.js **v7** (`json2satrec`, `propagate`, `eciToEcf`, `ecfToLookAngles`) | MIT, ESM |

**Wichtig:** JSON/OMM-Format statt TLE — ab ~Juli 2026 erschöpfen sich 5-stellige
NORAD-Nummern; TLE-Format bricht, OMM nicht. Die UCS-Datenbank (ursprünglich in der
Werkgruppen-Spec genannt) ist seit Mai 2023 pausiert und wird **nicht** verwendet.

## 3. Sichtbarkeits-Kriterium (methodische Ehrlichkeit)

Zweistufig, beides im UI ausgewiesen:

1. **„Sichtkontakt möglich"**: Elevation > 10° (Standard-Maskenwinkel, vgl. Heavens-Above).
2. **„Abbildungsgeometrie wahrscheinlich"**: Elevation ≥ 35° (entspricht ±45° Off-Nadir
   typischer EO-Sensoren).

Nie behauptet wird „du wurdest fotografiert" — nur Geometrie. Steht im Methodenblatt
(Grenzen: Sichtkontakt ≠ Aufnahme; Auswahl umfasst nur katalogisierte, unklassifizierte
Objekte — was fehlt, ist Teil der Aussage).

## 4. Daten-Pipeline (Snapshot, „null schweres Backend")

- `scripts/fetch-ueberflug.ts` (tsx, Muster: vorhandenes `scripts/fetch-climate.ts`):
  holt die 3 CelesTrak-Gruppen (JSON) + GCAT `active.tsv`/`psatcat.tsv`/`satcat.tsv`,
  joined über NORAD↔JCAT, filtert auf EO-relevante Kategorien, schreibt
  **eine** Datei `src/data/ueberflug/satellites.json`:
  `{ generated_at, sources: [...], satellites: [{ norad, name, class: "B"|"C"|"D"|"A"|null, category, owner, state, omm: {…nur Propagationsfelder} }] }`
- npm-Skript `ueberflug:refresh`.
- **Kadenz:** täglich via GitHub Action Cron (05:00 UTC) — Fetch + Commit
  (`ueberflug: Bahndaten vom <datum>`). Kein GCP nötig; keine Secrets (öffentliche
  Quellen, GITHUB_TOKEN nativ). Die Datei wird **überschrieben**, nicht archiviert:
  Bahndaten sind operativ (Gültigkeit Tage), kein Werkarchiv — Git-Historie genügt.
- Abweichung von Werkgruppen-Spec §3.3 („ein Pipeline-Zuhause: GCP"), begründet über
  §2.5 Verhältnismäßigkeit: ein 30-Zeilen-Fetch ohne Secrets rechtfertigt keinen
  Cloud-Run-Job. Attribution (CelesTrak, GCAT CC-BY) in Datei + Methodenblatt.

## 5. Frontend

- **Route `/ueberflug`** (EN: `/en/ueberflug`): das Werk. Astro-Island (vanilla TS,
  client:load), satellite.js v7 als Dependency.
- **Ablauf:** Seite lädt mit Erklärtext + Knopf „Standort bestimmen" (Geolocation-API,
  nur auf Klick) **oder** manueller Eingabe (Stadt-Auswahl klein / Lat-Lon-Felder).
  Nichts wird gespeichert oder gesendet — dieser Verzicht steht prominent im UI.
- **Anzeige (Buchführungs-Register, Mono-Ästhetik):**
  - „Jetzt im Sichtfeld": Liste der Satelliten mit Elevation > 10°, sortiert nach
    Elevation: Name, Klasse (DE/EN-Label), Kategorie, Eigentümer-Staat, Elevation/Azimut;
    Markierung ≥ 35°. Aktualisierung 1×/Sekunde.
  - Zähler: „Sichtkontakte heute seit Mitternacht (lokal): N" — Web Worker propagiert
    den Tag in 30-s-Schritten progressiv (Anzeige „wird gezählt …" bis fertig).
  - Fußzeile: Datenstand (`generated_at`), Quellen mit Attribution, Link Methodenblatt.
- **Werkverzeichnis:** Eintrag in `src/data/werke.ts` (status `live`), Methodenblatt
  `/werke/ueberflug` (gleiche 6-Abschnitt-Komponente-Struktur wie Protokoll, eigener Inhalt).
- **A11y/Verhalten:** funktioniert ohne Geolocation (manuelle Eingabe); ohne JS zeigt
  die Seite These + Methodik (statisch); `prefers-reduced-motion` → kein Sekundentakt,
  manueller „Aktualisieren"-Knopf.

## 6. Tests

- Vitest: GCAT-TSV-Parser, NORAD↔JCAT-Join, Klassen-Mapping, Sichtbarkeitsschwellen
  (Fixtures mit bekannten Geometrien — synthetischer Satellit über Festpunkt),
  Snapshot-Schema. SGP4 selbst wird nicht nachgetestet (Bibliotheksvertrauen MIT-Standard),
  wohl aber unsere Look-Angle-Klassifikation mit von satellite.js erzeugten Fixturen.
- Fetch-Skript: Parser-Funktionen pur und getestet; Netz-IO dünn.

## 7. Substanz-Check (Werkgruppen-Gate §2)

1. Provenienz: Quellen + Lizenzen + `generated_at` in Datei, UI und Methodenblatt ✓
2. Überprüfbare Behauptung: jede Zeile aus öffentlichen Bahndaten nachrechenbar ✓
3. Infrastruktur als Aussage: Standort verlässt den Browser nie; statische Seite ✓
4. Leave-behind: offener Code, offene Snapshot-Datei, Methodenblatt ✓
5. Verhältnismäßigkeit: kein Backend, ~150 KB Daten, kein WebGL ✓

## 8. Nicht-Ziele

Keine Karte/Globus-Visualisierung (Reduktion: das Register IST die Form), keine
Pass-Vorhersage über den Tag hinaus, keine Push-Notifications, kein Tracking welcher
Art auch immer, keine Starlink-Gesamtliste (Kommunikation ≠ Beobachtung — Fokus EO).

## 9. Offene Punkte → Plan

GCAT-Join-Detail (JCAT→NORAD via `satcat.tsv` Spalte `Satcat`); exakte Feldnamen beim
ersten echten Fetch verifizieren; Stadt-Fallback-Liste (klein, ~12 Städte) kuratieren.
