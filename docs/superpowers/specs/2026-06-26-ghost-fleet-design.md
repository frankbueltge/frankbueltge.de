# Spec — „The Ghost Fleet" / *Die Geisterflotte* (Gegenmessung, Instrument VII)

**Status:** Entwurf zur Abnahme (Brainstorming mit Frank, 2026-06-26)
**Linie:** Gegenmessung / Counter-Measurement
**Gate:** Substanz-Kriterien §2 der Werkgruppe (`2026-06-11-werkgruppe-design.md`)
**Linse abgenommen:** „Global + Tagesfall" (Frank, 2026-06-26)

## 1. Einordnung & These

Die Linie Gegenmessung zählt, was im Dunkeln bleibt. „The Ghost Fleet" nimmt das wörtlich:
Schiffe schalten ihren AIS-Transponder **bewusst ab**, um zu verschwinden — und genau diese
Lücke im scheinbar lückenlosen planetaren Überwachungsbild ist „Dark Data" pur.

> **These:** Das AIS-Bild der Meere wirkt vollständig. Es ist es nicht — weil Schiffe sich
> absichtlich unsichtbar machen. Dieses Instrument **zählt die absichtliche Unsichtbarkeit**
> (die Dunkel-Stunden) und macht sie sichtbar, wo sie am meisten zählt: in Schutzgebieten und
> fremden Hoheitsgewässern.

**Frage:** Wie viel deliberate Funkstille gab es zuletzt — und wer verschwand wo?

## 2. Quelle (live verifiziert, 2026-06-26)

GFW Events-API v3, Bearer-Token (Secret `GFW_TOKEN`):

```
GET https://gateway.api.globalfishingwatch.org/v3/events
    ?datasets[0]=public-global-gaps-events:latest
    &start-date=<iso>&end-date=<iso>&limit=<n>&offset=<n>     (offset Pflicht bei limit)
Authorization: Bearer <token>
```

Bestätigte Felder je Event: `id`, `type` (`gap`), `start`, `end`, `position{lat,lon}`,
`regions{mpa, mpaNoTake, mpaNoTakePartial, eez, eez12Nm, highSeas, rfmo, fao}`,
`vessel{id, name, ssvid, flag, type}`, `gap{durationHours, distanceKm, impliedSpeedKnots,
intentionalDisabling, offPosition{lat,lon}, onPosition{lat,lon}, positionsPerDaySatReception, …}`.

Es werden **nur hoch-konfidente, absichtliche** Abschaltungen geliefert (GFW-Vorfilter:
≥ 12 h, ≥ 50 sm vor der Küste, gute Satellitenabdeckung). Antwort enthält `total` (Gesamtzahl
der Treffer) → für die Schlagzeile billig abrufbar.

## 3. Was gemessen wird (täglich)

**Fenster:** Gaps, die **in den letzten 7 Tagen *endeten*** (vollständige Verschwinde-und-
Rückkehr-Geschichten). Implausibel lange/offene Gaps (z. B. Dauer > 60 Tage) werden als
Artefakt verworfen — die GFW-Rohdaten enthalten solche (live gesehen: ein 9-Jahres-„Gap").

**Abruf (proportionate, robust):** eine paginierte Abfrage über ein Fenster (z. B. letzte
10 Tage), client-seitig gefiltert auf `end ∈ letzte 7 Tage` und Dauer ≤ Kappe; bis zu einer
**Kappe von N** jüngsten Events im Detail geladen (Richtwert N≈1500). Die **Region-Zuordnung
wird je Event aus `regions` gelesen** — keine separaten Region-Abfragen nötig.

**Index (Tageskennzahlen):**
- **`total`** aus der API: wie viele Gaps endeten weltweit zuletzt (echte Gesamtzahl).
- über die im Detail geprüften Events: **Summe Dunkel-Stunden**, **Anzahl in MPA**, **Anzahl in
  No-Take-Zonen**, **Anzahl auf Hoher See**. Ehrlich als „über die N jüngsten geprüften"
  ausgewiesen, falls `total` > N.

**Fall des Tages (Pick, deterministisch):** das brisanteste Verschwinden —
Salienz = Region-Gewicht (No-Take-MPA > MPA > fremde EEZ > Hohe See) × … , dann Dauer;
Gleichstand nach Event-`id`. Dargestellt als **Akte**: Schiff (Name, Flagge, Typ),
*verschwunden bei [offPosition] → wieder aufgetaucht bei [onPosition]*, **N Stunden dunkel**,
in/nahe **[Region]**, Link zum GFW-Vessel.

## 4. Datenmodell (JSON kanonisch)

Pro Tag committet die Pipeline `src/data/ghost-fleet/<jahr>/<datum>.json`:

```
{ date, generated_at, schema_version, pipeline_version,
  window: { from, to, ended_within_days, examined, capped: bool },
  index: { total, dark_hours_examined, in_mpa, in_no_take, on_high_seas },
  pick: <event_id | null>,
  events: [ {                       // nur die Top-Fälle (Pick + weitere, ~12), nicht alle
    id, vessel: { name, flag, type },
    start, end, duration_hours,
    off: { lat, lon }, on: { lat, lon },
    regions: { mpa: bool, no_take: bool, eez: [..], high_seas: bool },
    salience, gfw_url } ],
  source: { name: "Global Fishing Watch — Events API (AIS gaps)", url, license } }
```

JSON ist darstellungsfrei; Astro rendert Prosa (DE/EN) zur Buildzeit. Committete Tages-JSONs
sind **unantastbar**. Es werden **nie alle Events gespeichert** (nur Aggregate + Top-Fälle).

## 5. Provenienz & Fehler als Form

- Jeder Fall verlinkt das **GFW-Vessel/Event** (`globalfishingwatch.org`) — nachprüfbar.
- API nach Retry/Backoff nicht erreichbar ⇒ *„Quelle nicht erreichbar — Feststellung entfällt"*;
  der Tag wird ehrlich als unvollständig markiert, nicht still übersprungen.
- Token fehlt/abgelehnt ⇒ Lauf bricht mit klarer Meldung (kein erfundener Stand).
- Keine Treffer im Fenster ⇒ ehrlich „keine festgestellt" (sollte selten sein: ~40k/Monat).

## 6. Grenzen (prominent im Methodenblatt)

- **„Absichtlich" ist ML-geschätzt, nicht bewiesen** (GFW: „likely"). Das Instrument erhebt
  **keinen Illegalitäts-Vorwurf** — Abschalten kann legitime Gründe haben (z. B. Piraterie-Zonen).
- **Nur offshore & gut beobachtet** (≥ 50 sm, gute Satellitenabdeckung): küstennahe Abschaltungen
  fehlen systematisch. Es ist kein vollständiges Bild.
- **Nur AIS:** Schiffe, die nie senden („dark by default"), erscheinen gar nicht.
- **Cluster spiegeln auch Abdeckung**, nicht nur Verhalten.
- **Region-Zuordnung** ist die der Verschwinde-Position; Bewegung während des Gaps ist unbekannt.

## 7. Avantgarde-Latte & Substanz-Gate

- **Ableiten, nicht abbilden:** das Artefakt ist die gezählte Unsichtbarkeit + die Akte — eine
  Inferenz über die Lücken der Überwachung, kein gerenderter Datensatz.
- **Verbinden, was niemand verbindet:** die Abwesenheit (Gap) gegen die Region-Brisanz
  (No-Take-Schutzzone) gelegt — Absenz als Datum, dort betont, wo sie am meisten wiegt.
- **Die Maschine findet die Frage:** jeden Tag ein anderer Fall.

Substanz-Gate: ① echte Daten + Provenienz (GFW, Vessel-Links) ✓ · ② eine prüfbare Frage ✓ ·
③ die Lücken der Überwachung als ausgewiesene Infrastruktur ✓ · ④ offener Code, committete
Tages-JSONs, offengelegte Methode ✓ · ⑤ leichte Abrufe, statisch gerendert ✓.

## 8. Pipeline & Technik

- Python-Paket `pipelines/ghost-fleet/` (installierbar, pytest), Module:
  - `gfw.py` — API-Client (httpx, Bearer, Retry/Backoff, Pagination); Secrets aus Fehlermeldungen
    redigiert (Muster `protokoll/fetch.py`).
  - `select.py` — **pure**: Filter (end-im-Fenster, Dauer-Kappe), Salienz/Region-Gewicht,
    Ranking/Pick, Index-Aggregate. Voll testbar.
  - `build.py` — **pure**: Event→Akte-Mapping, `day_record`, `to_json`.
  - `run.py` — Orchestrierung + IO (`--repo-root`, Token aus Env `GFW_TOKEN`), schreibt
    `latest.json` + datiert.
- **Erstes Instrument mit Laufzeit-API:** nächtlicher GitHub-Actions-Workflow braucht das
  Secret **`GFW_TOKEN`**. Determinismus + Testschutz für `select`/`build` (Fixtures = aufgezeichnete
  GFW-Antwort); Netz-Teil gemockt (httpx MockTransport).

## 9. Frontend & Routing

- **Name:** Titel „The Ghost Fleet", DE „Die Geisterflotte"; Route `/ghost-fleet` (+ EN-Spiegel),
  Methodenblatt `/werke/ghost-fleet`. i18n-Präfix `gf.`, OG-Slug `ghost-fleet`, Eintrag in
  `werke.ts` (Linie Gegenmessung), **DE/EN ab Tag eins**. Muster: Redaction/Round-Number.
- Darstellung: der **Fall des Tages** als Akte (Schiff, Flagge, *off → on*, Dauer, Region, GFW-Link),
  prominent die **Index-Zeile** („X Schiffe verschwanden zuletzt; Y davon in Schutzgebieten,
  zusammen Z Dunkel-Stunden"), darunter weitere Fälle. Mono-Ästhetik. Karte/Visualisierung der
  Positionen ist eine optionale spätere Ausbaustufe (v1: Koordinaten + Region + Link, kein Karten-Lib).

## 10. Tests

pytest: Filter (end-Fenster, Dauer-Kappe), Salienz/Region-Gewicht, Pick deterministisch,
Index-Aggregate, gfw-Client gegen Fixture (MockTransport, inkl. Pagination + Redigieren).
vitest: Format-/Helper-Funktionen. Lokaler Lauf schreibt JSON, committet nicht.

## 11. Nicht-Ziele (YAGNI)

- **Kein Illegalitäts-/Absichts-Vorwurf** gegen ein konkretes Schiff oder einen Staat.
- Kein LLM (reine Auswahl/Statistik).
- Keine Echtzeit-Karte/WebGL in v1; kein Speichern aller Events.
- Keine Zusatzquellen (Sanktionslisten) in v1 — Schiffstyp-/Shadow-Fleet-Linse ist eine spätere Option.

## 12. Offene Punkte (für den Implementierungsplan / Build)

- Genaue **Kappe N** und **Dauer-Kappe**; exakte Fenster-Tage.
- Salienz-Gewichte je Region; Tie-Break-Regel.
- Exakte GFW-Query-Parameter gegen die Live-API gegenprüfen (Pagination-Verhalten, `total`-Semantik).
- `GFW_TOKEN` als GitHub-Secret anlegen.
