# Beifang schärfen: Die Empfänger benennen

**Datum:** 2026-07-04
**Status:** Design abgenommen (Frank, „passt zieh durch")
**Werkgruppe:** Gegenmessung / Counter-Measurement — Instrument „Der Beifang"
**Vorläufer-Specs:** `2026-07-01-beifang-design.md`, `2026-07-02-beifang-leak-audit-design.md`

## 1. Motivation — was die realen Daten sagen

Auswertung des einzigen Leak-Snapshots mit erreichbaren Seiten (`src/content/beifang/2026/2026-07-03.json`, n = 19 erreichbare von 60 Panel-Seiten) zeigt drei Befunde, die die bisherige Darstellung teils **irreführend** machen:

1. **Der Leak reist im Query-String** (query 15×, pfad 3×, post 1× — **kein** Referer). Das eingebundene Fremd-Skript ruft aktiv eine API auf und hängt die DOI als Parameter an. Kein passiver Browser-Automatismus, sondern aktive Übermittlung durch das Skript.
2. **Third-Party-Cookies pre-consent ≈ 0** (nur DHQ: 1 von 19 Seiten). Die Cookie-Zählung existiert bereits (`assemble.py`, Felder `cookies_first_party`/`cookies_third_party`), trägt aber kaum. Der Leak steckt im Request, nicht im Cookie.
3. **Die prominentesten Empfänger rutschen als „unbenannter Host" durch**, weil der DuckDuckGo-Tracker-Radar (TDS) auf Ad-Tech optimiert ist und Wissenschafts-Infrastruktur nicht kennt:
   - `content.readcube.com` — **10× der häufigste Leak überhaupt** (Springer)
   - `api.altmetric.com`, `metrics-api.dimensions.ai` (JOSS/DHQ)
   - nur `Google Analytics (Google)` (4×) wird aktuell benannt.

   Dadurch steht bei Springer/JOSS aktuell live die Zeile *„… kein benannter Datenhändler darunter"* — obwohl ReadCube, Altmetric und Dimensions allesamt **Digital Science** sind (Tochter der Holtzbrinck Publishing Group — desselben Konzerns, dem Springer Nature mehrheitlich gehört). Umgekehrt gehen die Diamond-OA-Kontrollen an **self-hosted, datensparsame** Analytics (`piwik.hiig.de` = Matomo des Herausgebers HIIG; `umami.adho.org` = cookieloses Umami des Herausgebers ADHO) — kein Broker, sondern die Organisation selbst.

**Kernidee:** Die eigentliche Schärfung ist nicht „Cookies", sondern **die Empfänger korrekt und belegt zu benennen**. Das macht den Befund substanzieller, ehrlicher und korrigiert eine derzeit falsche Aussage auf der Live-Seite — byte-genau belegbar aus dem vorhandenen Archiv.

## 2. Ziel & Nicht-Ziele

**Ziel:** Ein Feature, drei Ebenen bedient („mach alles" um einen Kern gebündelt):
- **Substanz:** Empfänger benennbar machen über eine kuratierte, quellenbelegte Zusatzliste.
- **Darstellung:** Empfänger korrekt benannt, Kanal sichtbar, Broker vs. self-hosted unterschieden.
- **Methodenblatt:** die Liste + Herkunft/Quellen transparent dokumentiert.

**Nicht-Ziele (YAGNI):**
- Kein Panel-Ausbau (berührt `panel_version`, wartet auf mehr Läufe — separates Thema).
- Kein Cookie-Zensus als Hauptsache; Cookies werden nur als ehrlicher Null-/Nebenbefund benannt.
- **Kein** Erfassen von Cookie-*Values* (Datenschutz-Overhead, keine belegte Notwendigkeit — DOI reist nicht im Cookie).
- Keine juristische Wertung. Das Instrument dokumentiert Requests als Beweis; es urteilt nicht über Rechtsverstöße.
- Kein EU-Vantage (hängt an separater VPS-Entscheidung).

## 3. Verbindliche Regeln (aus CLAUDE.md, gelten für die ganze Umsetzung)

- **Archiv-JSONs sind unantastbar.** `2026-07-02.json` und `2026-07-03.json` werden **nicht** editiert. Die Benennung ist eine **Darstellungs-Schicht** über `host → firma`, keine Änderung des Snapshots.
- **Nachprüfbarkeit.** Jede kuratierte Zuordnung trägt eine Beleg-URL. Keine geratene Zuordnung. Reihenfolge der Auflösung (TDS zuerst, dann kuratierte Liste) ist dokumentiert.
- **Tatsachen statt Wertung.** Eigentümer-Aussagen (Digital Science, Holtzbrinck) erscheinen als belegte Tatsache mit Quelle, nicht als Anklage. Wort „Verstoß" bleibt draußen.
- **Ausfälle ehrlich.** Unbenannte Hosts bleiben ehrlich als solche markiert („noch nicht zugeordnet"), nie stillschweigend als „sauber" ausgegeben.
- **Bilingual** (de/en) durchgängig.
- **Kein Backfill** vergangener Läufe.

## 4. Architektur — die drei Ebenen

### 4.1 Substanz (Pipeline, Python)

**Neue kuratierte Liste:** `pipelines/beifang/src/beifang/data/lists/wissenschaft-infra.json`
```
{
  "meta": { "beschreibung": "...", "gepflegt_am": "2026-07-04" },
  "eintraege": [
    {
      "domain": "readcube.com",
      "firma": "ReadCube (Digital Science)",
      "eigentuemer": "Digital Science / Holtzbrinck Publishing Group",
      "kategorie": "metrik-broker",          // "metrik-broker" | "self-hosted-analytics" | "verlagseigen"
      "quelle": "<Beleg-URL>"
    },
    ...
  ]
}
```
Initiale Einträge (aus den 07-03-Empfängern; Belege in der Umsetzung zu recherchieren & einzutragen):
`readcube.com`, `altmetric.com`, `dimensions.ai` → Digital Science (metrik-broker);
`hiig.de` → Matomo self-hosted / HIIG (self-hosted-analytics);
`adho.org` → Umami self-hosted / ADHO (self-hosted-analytics);
`springernature.com` → Springer Nature (verlagseigen, andere Domain).

**Klassifikation:** `classify.py::entity_for(host, tds)` wird erweitert (oder ein dünner Wrapper), sodass die Auflösung ist: **1. TDS/EasyPrivacy → 2. kuratierte Liste** (über dieselbe Subdomain-Ketten-Logik `_domain_chain`). Erste Fundstelle gewinnt; Reihenfolge dokumentiert. Rückgabe erhält optional die `kategorie`/`eigentuemer`, damit Darstellung Broker vs. self-hosted trennen kann.

**Archiv-Kompatibilität:** Die kuratierte Liste wirkt bei künftigen Läufen automatisch (neue JSONs tragen die Firma bereits). Für bestehende JSONs erfolgt die Benennung **frontend-seitig** (siehe 4.2) — kein Pipeline-Rewrite alter Snapshots. Falls die Liste als Lauf-Meta ins JSON gespiegelt werden soll (`lists`-Feld), nur additiv & rückwärtskompatibel.

**Cookie-Benennung (Nebenbefund):** wo `cookies_third_party > 0`, die setzenden Domains ebenfalls via `entity_for` benennen — ehrlich als schwaches Signal.

### 4.2 Darstellung (Astro/TS)

- **Rückwirkende Anzeige-Benennung:** `src/lib/beifang/stats.ts::leakFindings()` (bzw. eine neue Hilfsfunktion) mappt die `hosts` aus dem vorhandenen JSON über die kuratierte Liste auf Firmen. Dadurch benennt die Live-Seite `content.readcube.com` etc. **sofort** korrekt — das Archiv-JSON bleibt unberührt.
- Die Zeile „kein benannter Datenhändler darunter" fällt weg, wo ein benannter Empfänger existiert (`BeifangPage.astro:180-181`).
- **Kanal sichtbar:** Formulierung „im Query-String eines API-Aufrufs an X" statt vage „ein ausgehender Request … an X".
- **Broker vs. self-hosted** dezent unterschieden (Kategorie aus der Liste): kommerzieller Metrik-Broker ↔ self-hosted Analytics des Herausgebers. Das schärft die These ehrlich.
- Optional dezente, belegte Eigentümer-Nebenzeile (Digital Science / Holtzbrinck).
- **Kein Struktur-Umbau** der Seite — nur Präzisierung der bestehenden Leak-Sektion.

### 4.3 Methodenblatt (`MethodenblattBeifang.astro`)

- Neuer/erweiterter Abschnitt „Firmen-Zuordnung": TDS-Radar **plus** kuratierte Wissenschafts-Infrastruktur-Liste; Herkunft & Quelle jeder Zuordnung offengelegt; Auflösungs-Reihenfolge genannt.
- Kanal-Befund (DOI im Query aktiver API-Aufrufe) und Cookie-Null-Befund dokumentiert.
- Änderungsprotokoll-Eintrag (bilingual).

## 5. Teststrategie

- **Pipeline (pytest):** `entity_for` löst kuratierte Domains + Subdomains korrekt auf; Reihenfolge TDS-vor-Liste; `doi.org`-Resolver-Ausschluss unberührt; kuratierte Liste ist valides JSON mit Pflichtfeldern inkl. `quelle`.
- **Site (vitest):** `leakFindings()` benennt bekannte Hosts aus einem Fixture (readcube/altmetric) als Firmen; unbenannte Hosts bleiben ehrlich unbenannt; Broker/self-hosted-Kategorie korrekt getrennt; Rückwärtskompat gegen ein reales `2026-07-03.json`-Fixture.
- **Register/Bestand:** bestehende Beifang-Tests bleiben grün; `astro check` 0; `npm run build` erfolgreich.

## 6. Akzeptanzkriterien

1. Live-Darstellung des 07-03-Befunds benennt `content.readcube.com`, `api.altmetric.com`, `metrics-api.dimensions.ai` als Digital-Science-Empfänger (statt „unbenannter Host / kein benannter Datenhändler").
2. Jede kuratierte Zuordnung ist im Methodenblatt mit Quelle belegt; keine geratene Zuordnung.
3. Broker (kommerziell) und self-hosted Analytics sind in der Darstellung unterscheidbar.
4. Archiv-JSONs (07-02/07-03) bytegleich unverändert (git diff leer außerhalb neuer/Darstellungs-Dateien).
5. Alle Tests grün (pytest + vitest), `astro check` 0, Build erfolgreich.
6. de/en vollständig.

## 7. Offen / bewusst verschoben

- Panel-Reichweite (mehr Verlage/Seiten) — späteres Thema.
- EU-Vantage — hängt an VPS.
- Cookie-Value-Analyse — nicht vorgesehen (Datenschutz/YAGNI).
