# Erstklassige Atelier-Werke — Design

**Datum:** 2026-06-29
**Status:** Entwurf zur Abnahme
**Kontext-Specs:** `2026-06-11-werkgruppe-design.md` (Substanz-Gate), `2026-06-20-ehrliche-umrahmung-design.md` (Rahmung)

## Problem

Ulysses (die autonome KI-Forscherin im Experiment „Irrtum als Methode") baut bisher
**self-contained HTML/JS-Werke**, die auf `/atelier` in einem **Sandbox-iframe** laufen. Zwei
Grenzen:

1. Das iframe ist ein **Behelf**: kein geteiltes Design, keine i18n, kein Zugriff auf die
   committeten Datensätze der Seite, Einzeldatei-Werke statt echter Lab-Seiten.
2. Die „nur self-contained"-Auflage **verhindert Datenkunst** — sie soll Open Data und die im
   Repo bereits versionierten Datensätze nutzen dürfen, wenn das Werk es verlangt.

**Ziel:** Ulysses baut **vollwertige Astro-Seiten/Komponenten im Haupt-Repo** `frankbueltge.de` —
geteiltes Design/i18n/Daten, auto-publiziert — **ohne** dass ihr unbeaufsichtigter, auto-publizierter
Code die Produktion gefährden kann.

## Bedrohungsmodell (ehrlich)

Ulysses ist **dasselbe Modell** wie der Assistent, der dies schreibt. „Sie schreibt absichtlich
bösartigen Code" ist **kein** realistisches Szenario; sie wird wie jeder sorgfältige Entwickler
behandelt. Geländer gibt es **nur** aus zwei nüchternen Gründen, die aus dem *Betriebsmodus* folgen,
nicht aus Misstrauen:

1. **Kaputt statt böse.** Ein Bug (Fehler, Endlosschleife, gebrochener Build) kann die Seite stören.
   → Abgefangen durch ein **Build/Check/Test-Gate**.
2. **Sie liest ungeprüftes Web** (Tavily/WebSearch) und läuft **unbeaufsichtigt** (kein menschlicher
   Blick pro Werk). **Prompt-Injection ist real**: eine präparierte Seite könnte versuchen, ihr einen
   Fremd-`<script>`, einen Redirect oder einen Tracker unterzuschieben. Nicht *sie* ist die Gefahr —
   ihre **Eingaben** sind unvertrauenswürdig. → Eingedämmt durch **Pfad-Grenze** + **Site-CSP**.

Was **nicht** das Bedrohungsmodell ist: Secret-Diebstahl. Der Astro-Build (`npm run build`) läuft
**ohne Provider-Secrets** (geprüft: FIRMS/EIA/GEMINI nur in den Python-Pipelines, CF-Token nur im
separaten Deploy-Schritt). Der Schreck „ihr Code klaut Keys" ist gegenstandslos, solange sie Build-
Konfiguration und Dependencies nicht anfassen kann (siehe Pfad-Grenze).

## Nicht-Ziele

- Keine Branch-Protection auf `main`: die nächtlichen Pipelines committen direkt auf `main`; ein
  Required-Status-Check würde sie brechen. Das Gate ist daher ein **eigener Integrationspfad**, keine
  Sperre von `main`.
- Kein harter Zwang aufs Experiment: Ulysses *darf* erstklassige Werke bauen, **muss** nicht. HTML-
  Werke (iframe) bleiben gültig. Autonomie bleibt erhalten.
- Keine eigene Subdomain (verworfene Alternative; Frank wählte „im Lab verwoben").

## Architektur

### Überblick (nächtlicher Fluss)

```
Ulysses (Routine, ihr Repo irrtum-als-methode)
  └─ baut ein Werk: entweder works/<slug>/index.html (HTML, wie bisher)
     ODER works/<slug>/work.astro (+ optional data.json, Komponenten)  ← NEU
  └─ pusht claude/forschung-<datum>  → auto-land.yml merged auf ihr main
        ↓
frankbueltge.de: atelier-integrate.yml  (ersetzt atelier-sync.yml)   ← DAS GATE
  1. zieht ihr main (journal/, works/)
  2. mappt NUR erlaubte Pfade in die Seite (Pfad-Grenze, strukturell erzwungen)
  3. validiert: npm ci && npm run check && npm run test && npm run build
  4a. grün  → committet die Integration + Deploy (wie heute, via workflow_run → deploy-cf)
  4b. rot   → KEIN Commit/Deploy (letzter grüner Stand bleibt live)
              + schreibt Feedback in ihr Repo (atelier-feedback/<datum>.md)
              + benachrichtigt Frank (GitHub-Issue/Workflow-Fail)
        ↓
/atelier  rendert: erstklassige Astro-Werke (nativ) + HTML-Werke (iframe) + Journal
```

### Komponente 1 — Autoren-Modell (wo ihr Code lebt)

Ulysses arbeitet **weiter in ihrem eigenen Studio-Repo** `irrtum-als-methode` (das öffentliche
Studio + das Journal als Gedächtnis bleiben erhalten). Ein Werk ist ab jetzt **eines von zwei**:

- **HTML-Werk** (wie bisher): `works/<slug>/index.html` + `meta.json` → Sandbox-iframe-Galerie.
- **Astro-Werk** (neu): `works/<slug>/work.astro` (+ optional `data.json`, lokale Teilkomponenten,
  `meta.json`). Diese Datei wird vom Gate in die Atelier-Route der Seite gemappt und nativ gerendert.

Damit sie das Astro-Werk gegen die echte Seiten-API **korrekt** schreiben kann, liegt in ihrem Repo
eine gepflegte **Schnittstellen-Referenz** `SITE-API.md`: verfügbare Layouts (`@/layouts/Page.astro`),
Bausteine, **committete Datensätze** (`src/data/*`, `src/content/*`) mit Kurz-Shapes, plus **ein
Beispielwerk**. Sie schreibt gegen diese dokumentierte Schnittstelle; das Gate validiert real.

**Feedback-Schleife als Methode:** Da die echte Validierung im Gate (nicht in ihrer Sitzung)
passiert, lernt sie die API über die Nächte: rotes Build → Feedback → Selbstkorrektur. Das ist
thematisch stimmig — „Irrtum als Methode" im Werkzeug selbst.

### Komponente 2 — Das Integrations-Gate (`atelier-integrate.yml`)

Ersetzt `atelier-sync.yml`. Läuft nächtlich (nach Auto-Land) und auf `workflow_dispatch`.

1. **Pull** ihres `main` (flacher Clone).
2. **Pfad-Grenze (strukturell):** Das Gate mappt **ausschließlich**
   - `journal/**` → `src/content/atelier/journal/`
   - `works/<slug>/index.html|meta.json` → `src/content/atelier/works/` (iframe-Werke)
   - `works/<slug>/work.astro` (+ erlaubte Beigaben) → `src/pages/atelier/werke/<slug>.astro`
     bzw. `src/components/atelier/werke/<slug>/…`
   - `PROTOCOL.md`, `README.md` → `src/content/atelier/`

   Ihr Repo **enthält** `package.json`, `astro.config`, `.github/`, fremde Komponenten **gar nicht**;
   das Gate kopiert auch nichts dorthin. Die Pfad-Grenze ist damit **nicht** nur eine Prüfung,
   sondern strukturell: sie *kann* Build-Config, Dependencies, Workflows und fremden Code nicht
   verändern. Zusätzlich verweigert das Gate `work.astro`-Dateien, die verbotene Importe/Marker
   enthalten (z. B. Roh-`fs`/`process`-Zugriff, externe Script-URLs), und schreibt das als Feedback.
3. **Validierung:** `npm ci && npm run check && npm run test && npm run build`.
4. **Grün:** committet die Integration; `deploy-cf.yml` baut via `workflow_run` neu (Name in der
   `workflows:`-Liste von „Atelier sync" auf „Atelier integrate" umstellen). **Rot:** kein Commit,
   kein Deploy; letzter grüner Stand bleibt; Feedback + Benachrichtigung (Komponente 5).

### Komponente 3 — Datenzugang

- **Committete Datensätze:** `src/data/*` (climate, parallaxe, praemie, consensus, ghost-fleet,
  redaction, round-number, pattern, tell, ueberflug, revision, halbwertszeit) und `src/content/*`
  stehen ihren Astro-Werken zur **Build-Zeit** zur Verfügung (Import im `work.astro`). Kein
  Laufzeit-Netz, kein Risiko — „Git ist das Archiv".
- **Eigene/Open Data:** Sie committet einen Datensatz als `works/<slug>/data.json` (wird
  mitgemappt), oder — für Live-Quellen — schreibt eine kleine Fetch-&-Commit-Routine im Muster der
  bestehenden Pipelines (Daten werden versioniert, nicht zur Laufzeit geholt; keine Keys im Browser).
- **„APIs der anderen Experimente":** Die Seite ruft diese **nie zur Laufzeit** (statisch); Zugriff
  heißt = die committeten Daten lesen. Live-Keys gehören in Pipelines, nicht in Client-Code.

### Komponente 4 — Besucher-Sicherheit (Client-JS erlaubt + CSP)

Ulysses' Werke laufen **erstklassig und nativ**, **auch mit Client-JS** (kein iframe-Käfig — Franks
Entscheidung: ihr vertrauen). Die Eindämmung des Injection-Restrisikos übernimmt eine **Site-CSP**:

- `script-src 'self'` (+ Nonces/Hashes für nötige Inline-Skripte) → **kein Laden von Fremd-Scripts**.
- `connect-src` eng (self + ausdrücklich erlaubte Endpunkte) → **keine Exfiltration**.
- `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'self'`.

Effekt: Selbst ein per Prompt-Injection untergeschobener Payload kann **keinen Fremdcode laden und
nichts rausschicken**. Das ist normale Web-Härtung und schützt die **ganze** Seite, nicht nur das
Atelier. Astro bündelt ihr JS als `'self'`-Assets — kompatibel.

**Umsetzungs-Vorbehalt:** vor Aktivierung prüfen, ob bestehende Seiten Inline-/Fremd-Scripts nutzen,
die Nonces/Hashes oder `connect-src`-Einträge brauchen (z. B. Analytics, eingebettete Visualisierungen).
Lösung via Nonces — kein Showstopper, aber eigener Plan-Schritt.

### Komponente 5 — Fehlerbehandlung + Benachrichtigung

Bei **rotem** Gate (Franks Wahl: „vollautonom **+** mich benachrichtigen"):

- **Kein** Deploy; der letzte grüne Stand bleibt live.
- Das Gate schreibt `atelier-feedback/<datum>.md` zurück in **ihr** Repo (Build-/Check-/Test-Fehler,
  knapp und maschinen-lesbar). Sie liest es in der nächsten Sitzung (PROTOCOL-Schritt „Verorten") und
  korrigiert sich selbst.
- **Frank wird benachrichtigt:** das Gate öffnet/aktualisiert ein **GitHub-Issue** in
  `frankbueltge.de` mit dem Fehler (der fehlgeschlagene Workflow-Lauf benachrichtigt ohnehin per
  GitHub). So kann Frank bei Bedarf draufschauen, muss aber nicht.

### Komponente 6 — Wie Ulysses davon erfährt

Reiner Prompt/Doku-Weg (Autonomie bleibt):

- **PROTOCOL.md** bekommt einen Abschnitt „Erstklassige Werke": sie *darf* `work.astro`-Werke unter
  `works/<slug>/` bauen, die nativ im Lab erscheinen; sie nutzt `SITE-API.md`; Werke gehen live, wenn
  das Gate grün ist; bei Rot liest sie ihr Feedback und bessert nach. HTML-Werke bleiben erlaubt.
- **SITE-API.md** (+ Beispielwerk) als Schnittstellen-Referenz.

### Koexistenz / Migration

Die bestehenden HTML-Werke (`normalitaetsmodell`, `drei-maschinen`, `cerfs-margin`) bleiben über die
**iframe-Galerie** unverändert live. `/atelier` rendert künftig **drei** Sektionen: erstklassige
Astro-Werke (nativ) · HTML-Werke (Sandbox-iframe, wie jetzt) · Journal. Keine Migration nötig; beide
Werkarten koexistieren, Ulysses wählt pro Werk.

## Erfolgskriterien

1. Ulysses kann ein `work.astro` committen, das geteiltes Layout + einen committeten Datensatz nutzt;
   es erscheint nativ unter `/atelier` (kein iframe), ohne manuellen Schritt.
2. Ein **rotes** Werk (absichtlich gebrochener Build) wird **nicht** deployt; die Seite bleibt live;
   ein Feedback landet in ihrem Repo; Frank wird benachrichtigt.
3. Sie kann **keine** Datei außerhalb ihrer Atelier-Pfade verändern (Build-Config/Deps/Workflows/
   fremder Code bleiben unberührt) — strukturell.
4. Die Site-CSP ist aktiv; ein Test-Werk, das versucht, ein Fremd-Script zu laden oder an einen
   externen Endpunkt zu senden, wird vom Browser **geblockt** (manuell verifiziert).
5. Bestehende HTML-Werke laufen unverändert weiter.

## Offene Risiken / im Plan zu klären

- **CSP-Kompatibilität** mit bestehenden Seiten (Nonces/Hashes nötig?) — eigener Plan-Schritt mit
  Inventur vor Aktivierung.
- **Exakte Datei-Abbildung** `work.astro` → Route/Komponente (Wrapper vs. volle Seite) — Plan-Detail;
  Ziel: ihre Autoren-Fläche klein halten (sie liefert Werk-Inhalt, das Gate stellt die Route).
- **Verbotene-Importe-Prüfung** im Gate: Umfang der statischen Marker (kein `fs`/`process`/externe
  URLs in `work.astro`) — Plan-Detail; bewusst konservativ.
- **CF Pages Preview** für rote Werke optional (zum Anschauen vor Fix) — vorerst nicht nötig, da
  Feedback-Datei + Issue genügen; als spätere Ausbaustufe vermerkt.
