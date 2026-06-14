# Werk ⑤ „Prämie — Die Police" — Teilprojekt-Design

**Datum:** 2026-06-14 · **Status:** Substanz-Gate bestanden (echte keyless Daten verifiziert);
Bau autorisiert (Nutzer: „bestes, progressivstes Werk"). Übergeordnet: Werkgruppen-Spec §8.

## 1. These & Form — der dunkle Zwilling des Protokolls

**These:** Der Markt hat die Klimadebatte längst beendet — mit Preisen. Die (Rück-)Versicherer,
die kältesten rationalen Akteure, haben die Katastrophe bereits eingepreist; und die Prämie
steigt. Die Apokalypse ist nicht Prognose, sie ist eine Police, die in Kraft ist.

**Form:** **„Die Police"** — ein fortlaufender Versicherungsschein auf die Gegenwart, dessen
**Prämie jede Nacht neu aus echten Marktdaten berechnet** wird. Formal das Gegenstück zum
Protokoll: dort das *Sitzungsprotokoll* der Welt, hier ihr *Versicherungsschein* — zwei amtliche
Dokumente, deterministisch erzeugt (kein LLM), die zusammen sagen: alles ist protokolliert, und
alles ist bepreist. Aktuarisches Register, kalt und präzise.

Aufbau (deterministische Templates, DE/EN):
- **Kopf:** „Versicherungsschein — Die Gegenwart. Versicherungsnehmer: kommende Generationen.
  Versicherer: der Markt. Police-Nr. 1. Gültig: fortlaufend, unkündbar."
- **§1 Versicherte Gefahr:** Klimakatastrophe.
- **§2 Die Prämie** (das Pulsmaß, Schlagzeile): Versicherungs-Preisindex (BLS PPI Wohngebäude-/
  Hausratversicherung, Basis 1998 = 100). „Die Prämie steht bei {wert} Punkten — +{prozent} %
  seit 1998." Nächtlich aktualisiert, steigend.
- **§3 Schadenverlauf:** NOAA Milliarden-Dollar-Katastrophen — letztes Jahr (Anzahl, Summe, Tote)
  + kumuliert seit 1980 („{summe} Bio. $").
- **§4 Laufende Regulierung:** OpenFEMA NFIP — jüngste regulierte Hochwasserschäden (Aggregat).
- **§5 Risikoausschluss / Nicht-Erneuerung:** Kalifornien — wachsende Nicht-Erneuerungen in
  Brandrisikozonen („Für diese Gebiete wird kein Schutz mehr angeboten").
- **§6 Selbstbehalt:** „Den Selbstbehalt trägt, wer keine Police hat." (die Unversicherten).
- **Schluss:** „Diese Police wurde nicht unterzeichnet. Sie ist in Kraft. Prämie fällig."
  (spiegelt „Die Sitzung wurde nicht geschlossen. Nächste Sitzung: morgen.")

## 2. Datenquellen (alle verifiziert, keyless, akkumulierend)

| Signal | Quelle | Zugriff | Lizenz |
|---|---|---|---|
| Prämie (Preisindex) | BLS PPI `PCU9241269241262` (Hausrat-/Wohngebäudeversicherung, 1998=100) | BLS Public API v1 (keyless) **oder** FRED `fredgraph.csv?id=…` (200, keyless) | Public Domain (BLS) |
| Schadenverlauf | NOAA NCEI Billion-Dollar Disasters `events-US-1980-2024.csv` | direkte CSV (keyless) | Public Domain (NOAA), DOI 10.25921/stkw-7w73 |
| Laufende Schäden | OpenFEMA NFIP `FimaNfipClaims` | REST JSON (keyless) | Public Domain (FEMA) |
| Rückzug/Nicht-Erneuerung | California DOI, Non-Renewals by ZIP (XLSX) | direkter Datei-Download (jährlich) | öffentlich (CA DOI) |

Verifiziert (2026-06-14): BLS-Index = 279,1 (Mai 2026); NOAA = 403 Ereignisse, kumuliert 2,9 Bio. $,
Helene 2024 = 78,7 Mrd. $/219 Tote; NFIP = echte 2026-Schäden. **Ehrlichkeitsgrenzen
(Methodenblatt):** Alle vier Quellen sind US-zentriert (der globale Markt ist nicht keyless
offen); der BLS-Index misst US-Wohnversicherungspreise als Proxy fürs eingepreiste Klimarisiko,
nicht die Rückversicherungsprämie direkt; NOAA endet 2024 (Climate Central führt fort); Rückzug
jährlich, redaktionell nachgeführt.

## 3. Architektur (spiegelt das Protokoll, teilt Image/venv)

`pipelines/protokoll/src/protokoll/praemie/`: `bls.py` (Index), `disasters.py` (NOAA-CSV-Parse),
`claims.py` (NFIP-Aggregat), `retreat.py` (kuratierte CA-Zahl, versioniert), `model.py`
(kanonische `policy`-Struktur), `run.py` (baut `src/data/praemie/police.json`, Dry-Run/Commit
„prämie: Police vom <datum>"). Frontend deterministisch wie ProtokollDoc: `src/lib/praemie/`
(types, render DE/EN aktuarisches Register, getestet), `PraemiePage.astro`, Methodenblatt,
Routen `/praemie` (+ en), `werke.ts` (+Eintrag, GEPLANT leer). Kein LLM (Templates). Cloud-Job
`praemie` 04:00 UTC nach Merge.

## 4. Substanz-Check (Gate)
1. Provenienz: 4 zitierfähige Quellen + Lizenzen + Abrufdatum ✓
2. Überprüfbare These: „Prämie +179 % seit 1998" ist hart belegt ✓
3. Infrastruktur als Aussage: deterministisch, Git-Archiv, kein LLM ✓
4. Leave-behind: offener Code, offene Daten, Methodenblatt ✓
5. Verhältnismäßigkeit: 4 leichte Fetches/Nacht, kein Embedding/LLM ✓

## 5. Nicht-Ziele
Keine Karte, keine Cat-Bond-Spreads (paywalled), kein LLM-Text, keine Echtzeit-Börsendaten;
US-Fokus offen ausgewiesen statt globalen Anspruch vorzutäuschen.
