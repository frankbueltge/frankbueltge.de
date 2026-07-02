# Spec — „Der Beifang" bekommt Tiefe: der Leak-Audit

**Status:** Entwurf zur Abnahme (Brainstorming mit Frank, 2026-07-02)
**Linie:** Gegenmessung / Counter-Measurement
**Baut auf:** `2026-07-01-beifang-design.md` (v1: Tracker-Zensus) — diese Spec ersetzt v1
nicht, sie vertieft es. Das v1-Instrument (Panel, Zensus, Blockade-Leitbefund, Kontrollgruppe,
Archiv, Seite `/beifang`, wöchentlicher Workflow) bleibt vollständig bestehen.

## 1. Warum (die Kritik, die diese Runde auslöst)

v1 zählt Drittanbieter-Tracker auf Fachartikelseiten. Das ist sauber, aber **es bildet
Bekanntes ab** statt etwas abzuleiten — das Paper (Fadeeva et al., kommges 2024) hat die
Existenz des Trackings längst per Dokumentenanalyse belegt, sogar reicher. Ein Zähler reißt
die Avantgarde-Latte der Werkgruppe (§2 der Werkgruppen-Spec: *ableiten statt abbilden,
verbinden was niemand verbindet, die Maschine findet die Frage*).

Der Schwenk: **weg von „wie viele Tracker" — hin zu „was genau von deiner Leseidentität
verlässt die Seite, an wen, in welcher Form, vor jeder Einwilligung".** Das ist die
„Wissenschaftsspionage", die das Paper *befürchtet*, konkret und nachprüfbar gemacht: nicht
„es gibt Tracker" (Commodity — Blacklight, Ghostery), sondern *„deine DOI, im Klartext, an
einen Datenhändler, bevor du irgendetwas geklickt hast."* Das ist Beweis, keine Zahl.

Kein neues Werk, keine Umbenennung. Die Metapher trägt jetzt besser: **der Beifang bist du** —
deine Identität, mit hochgezogen, während du nur einen Artikel lesen wolltest.

## 2. Die Consent-Achse: Pre-Consent IST der Verstoß

Entscheidung (Brainstorming): Wir ankern rein auf der **Pre-Consent-Messung**, die v1 schon
macht (Seite laden, nichts anklicken). Nach DSGVO/ePrivacy dürfen nicht-essenzielle Tracker
**vor** der Einwilligung gar nicht feuern. Wenn also die DOI schon vor jedem Klick
an Google Ads geht, **ist das der Verstoß** — ohne dass wir ein Consent-Banner anklicken müssen.
Das ist rechtlich schärfer, sofort machbar, und vermeidet die spröde Pro-Consent-Manager-
Interaktion. Das „Alle ablehnen"-Klicken bleibt ausdrücklich Ausbaustufe (§9).

## 3. Die Messung (pro erreichbarer Artikelseite, pre-consent)

Für jede Seite, die lädt (Blockade bleibt Befund, s. v1), messen wir den **Identitäts-Leak**:

### 3.1 Identitäts-Token der Seite
- **DOI** — aus dem Panel (haben wir).
- **Titel** und **Schlagwörter/Subjects** — einmalig aus Crossref geholt (wir haben die DOIs),
  als `identity`-Feld pro Panel-Eintrag committet. Provenienz: Crossref, Abrufdatum im Panel-`log`.

### 3.2 Was rausgeht (Capture-Erweiterung)
Das bestehende `capture.py` protokolliert Drittanbieter-Requests bereits mit voller URL. Neu:
- **POST-Body** (`request.post_data`) je Request,
- **Referer-Header** (`request.headers['referer']`).
Erfasst wird nur für **Drittanbieter-Requests** (First-Party wäre kein Leak an Dritte) —
das begrenzt Volumen und Rauschen.

### 3.3 Der Matcher (reine, testbare Funktion)
Sucht jeden Token in jedem Drittanbieter-Request über die Kanäle **Query-String, POST-Body,
Referer, Pfad**, in mehreren Formen:
- **Klartext** und **URL-kodiert** (die DOI steht oft roh im Query-String),
- **gehasht**: md5/sha1/sha256 der DOI (lowercased; auch der DOI-URL-Form
  `https://doi.org/…`). Datenhändler hashen Kennungen; ein zufälliger DOI-Hash-Treffer ist
  praktisch ausgeschlossen — das ist der fälschungssichere Beweis.

### 3.4 Härtegrade (das Gegen-Prinzip auf uns selbst angewandt)
- **Hartes Signal — DOI:** eindeutig; Klartext-, kodierte und Hash-Treffer sind belastbar.
- **Weiches Signal — Titel/Keywords:** nur als **ganzer Titel-Phrasenabgleich** (bzw. distinkte
  lange Schlagwörter), **nie** einzelne Allerweltswörter — sonst False Positives. In Modell und
  Darstellung als `soft`-Signal markiert; niemals mit dem DOI-Beweis vermengt.
- **Kein Hash auf Titel-Einzelwörter** (Kollisions-/FP-Gefahr); Hash-Matching bleibt der DOI
  (und optional dem vollständigen Titel) vorbehalten.

## 4. Datenmodell

Archiv-JSON (`src/content/beifang/<jahr>/<datum>.json`) — unantastbar, wöchentlich, wie v1.
Pro `SiteResult` neu ein `leaks`-Array; jeder Eintrag:

```
{ token: "doi" | "titel" | "keyword",
  signal: "hard" | "soft",
  form: "klartext" | "url-kodiert" | "md5" | "sha1" | "sha256",
  kanal: "query" | "post" | "referer" | "pfad",
  host: "<empfangender Drittanbieter-Host>",
  firma: "<TDS-Entity oder null>",
  beweis: "<der tatsächliche, redigierte Drittanbieter-Request-Ausschnitt>" }
```

Plus pro Seite aggregiert: `leak_firmen` (distinkte Firmen, die Identität empfangen),
`doi_leak` (bool: harte DOI ging an mind. einen Dritten). Pro Lauf aggregiert:
`vantage`-Vermerk (s. §5).

**Der Beweis wandert ins Archiv:** `beweis` ist der reale beanstandete Request-Ausschnitt (die
Drittanbieter-URL/der Body mit der DOI darin) — das Leave-behind, mit einem Klick prüfbar.
Enthält **keine** Secrets: es ist der Leser-seitige Ad-Tech-Request, nicht unsere Keys. Query-
Strings werden dennoch defensiv redigiert (bestehende Regel), falls je ein Token wie ein Key
aussieht.

## 5. Vantage als Messgröße (statt als Klage)

Die Blockade ist IP-basiert (Rechenzentrums-IPs pauschal gesperrt) — sie „wärmt sich nicht auf".
Statt das zu beklagen, wird der **Messstandpunkt selbst zur dokumentierten Größe**:

- Der Leak-Audit läuft **vantage-agnostisch**: Standpunkt = Config (Runner direkt / Proxy-URL /
  später VPS). `capture_page` nimmt bereits `proxy`; ein `--vantage`-Flag wählt ihn. VPS-Umzug
  = Config-Flip, kein Umbau.
- v2 startet auf **GitHub Actions** (erreichbare Seiten: Springer Nature + Diamond-OA-Kontrolle).
- Jeder Snapshot vermerkt `vantage` (Herkunft) und die **Blockade-Quote je Vantage**.
- Wenn mehrere Rechenzentrums-Standpunkte **identisch** blocken, ist das ein *stärkerer*,
  belegter Befund: „Die Blockade ist kategorisch — jedes Rechenzentrum, nicht Zufall."
- Kommt der VPS (residentiellerer Standpunkt) durch, zeigt derselbe Verlag: **sperrt den
  Prüfblick, bedient den Heimnutzer — und trackt ihn.** Die Asymmetrie verdoppelt.
- **Kein Umgehen von Schranken** (Lab-Ethik): kein Bot-Tarnen, kein Challenge-Lösen. Ein
  anderer Standpunkt ist ein anderer Standpunkt, kein Trick.

Cloud Run wird **nicht** verwendet (reproduziert nur die Wand, widerspricht der „kein GCP"-
Architektur). Der VPS ist der echte Reichweiten-Hebel und ist ohnehin geplant.

## 6. Ehrlichkeit & Nachprüfbarkeit (verbindlich)

- **Nur belegte Leaks:** ein Leak wird nur berichtet, wenn der Matcher den konkreten Token im
  konkreten Request zeigen kann; der `beweis` liegt bei. Nichts wird geraten.
- **False-Positive-Disziplin:** harte vs. weiche Signale getrennt (§3.4); Hash-Treffer nur für
  hinreichend spezifische Token.
- **Blockade bleibt Befund**, nie Fehler; **kein Backfill**; Archiv unantastbar (alles wie v1).
- **KI/Modell:** keine im Kern des Leak-Audits — es ist rein deterministisches String-/Hash-
  Matching, vollständig auditierbar (die auditierbarste Form von Messung; passt auf „nachprüfbar
  machen").

## 7. Darstellung (`/beifang`, DE/EN)

Der bestehende Aufbau bleibt (Leitbefund Blockade-Quote, Kontrollgruppen-Kontrast, Firmen-Tafel,
Verlauf, Methodenblatt-Link). **Neu** eine Sektion **„Was die Seite über dich verrät" /
„What the page reveals about you":**

- Pro erreichbarem Verlag die Leak-Funde, harte Signale zuerst.
- Die Schlagzeile ist die eine Zeile, die haften bleibt: *„Auf Springer-Artikel X ging deine
  DOI im Klartext an Google Ads (Query-String) — bevor du irgendetwas geklickt hast."*
- Der **echte Request als aufklappbarer Beweis** (`beweis`-Feld), mono, redigiert.
- Weiche Signale (Titel/Keyword) klar als „schwächeres Indiz" gekennzeichnet, separat.
- Leerzustand / „kein DOI-Leak auf den erreichbaren Seiten": ehrlich so benannt (auch ein Befund).

Visualisierung nach `2026-06-20-visualisierungs-standard-design.md`; Rahmung nach
`2026-06-20-ehrliche-umrahmung-design.md` (Experiment, kein Kunst-Anspruch). Die Seite selbst
lädt weiterhin null Drittanbieter-Requests (der Satz ist seit dem CF-Beacon-Rückbau wieder wahr).

## 8. Struktur & Tests

```
pipelines/beifang/src/beifang/
  capture.py     # ERWEITERT: post_data + referer je Drittanbieter-Request
  identity.py    # NEU: Crossref → Titel/Subjects je DOI (Einmal-Werkzeug, schreibt ins Panel)
  leaks.py       # NEU: reiner Matcher (Token × Request-Kanäle × Formen inkl. Hashes)
  assemble.py    # ERWEITERT: leaks je SiteResult, Aggregate, vantage-Vermerk
  run.py         # ERWEITERT: --vantage-Flag, identity+leaks verdrahtet
  model.py       # ERWEITERT: Leak-Dataclass, SiteResult.leaks, RunRecord.vantage
```

- `leaks.py` ist eine **reine Funktion** über aufgezeichneten Request-Fixtures — vollständig
  unit-getestet: Klartext-, URL-kodierter, md5/sha1/sha256-Treffer je Kanal; **False-Positive-
  Guards** (Allerweltswort im Titel darf NICHT matchen; zufälliger Hash-Nicht-Treffer).
- `capture.py`-Erweiterung integrationsgetestet gegen einen lokalen Server, der einen Token in
  Query/POST/Referer spiegelt.
- Site-Aggregation (`src/lib/beifang/`) + Renderer der neuen Sektion: vitest, inkl. harte-vs-
  weiche-Trennung und Leerzustand.
- Modell-JSON ↔ zod-Schema (`content.config.ts`) ↔ `types.ts` konsistent (wie v1).

## 9. Ausdrücklich NICHT in dieser Runde (Ausbaustufen)

- **„Alle ablehnen"-Klicken** (Reject-Persistenz) — spröde je Consent-Manager (OneTrust,
  Sourcepoint …); eigene Runde.
- **VPS-Vantage-Aufbau selbst** — hier nur vorbereitet (Config-Knopf); der Umzug ist separat.
- **Cross-Verlag-ID-Persistenz** — „dieselbe LiveRamp-ID auf Elsevier *und* Wiley" = dein
  seitenübergreifendes Leseprofil. Großartig, aber stateful (persistenter Browser-Kontext über
  Seiten). Später.
- **Exotische Kodierungen** (base64-Ketten, Custom-Obfuskation) über URL-kodiert/Hash hinaus.
- **Institutioneller Zugriff** (Uni-Netz/SeamlessAccess) — praktisch wie ethisch eigenes Kapitel.

## 10. Entschiedene Fragen (Brainstorming 2026-07-02)

| Frage | Entscheidung |
|---|---|
| Kern der Messung | Identitäts-Leak (was verlässt die Seite), nicht mehr nur Tracker zählen |
| Consent-Achse | Pre-Consent = der Verstoß; kein Banner-Klicken (Ausbaustufe) |
| Leak-Tiefe | DOI hart (Klartext + URL-kodiert + Hashes); Titel/Keywords weich, markiert |
| Beweis | realer Request-Ausschnitt wandert ins Archiv (Leave-behind) |
| Vantage | vantage-agnostisch (Config); v2 auf GitHub Actions; Standpunkt wird Messgröße |
| Cloud Run | nein (reproduziert die Wand, widerspricht „kein GCP") |
| VPS | vorbereitet (Config-Flip), Umzug separat; residentieller Standpunkt = Reichweiten-Hebel |
| v1-Zensus | bleibt vollständig; Leak-Audit ist die Tiefe darunter |
