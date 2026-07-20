# Öffentliche Saat — Moderations-Warteschlange (Option A, revidiert Stufe 1)

**Datum:** 2026-07-20 · **Status:** Design-Spec, von Frank freigegeben (2026-07-20: „[Wortlaut privat]")
**Revidiert:** `2026-07-20-oeffentliche-saat-design.md` §5 (Flow) und §4 (Guardrail-Kette, 5. Instanz)
**Betrifft:** `frankbueltge.de` — `functions/api/seed.js`, neue `functions/api/zentrale/seed-review.js`,
`src/lib/saat/`, `src/components/pages/ZentralePage.astro`, Legal-Texte.

---

## 0. Warum (Franks Haftungssorge, 2026-07-20)

Die gebaute Stufe 1 **committet einen angenommenen Seed sofort und ohne menschliche Sichtung**
ins öffentliche Repo (`seed.js` Schritt 9). Das KI-Gate ist die einzige Instanz zwischen einer
Einreichung und der öffentlichen Git-History. Zwei scharfe Kanten (Frank):

1. Ein LLM-Gate ist nicht unfehlbar — Restrisiko, dass Illegales/Heikles durchrutscht.
2. **Git vergisst nicht:** Löschen entfernt nichts aus der History; für echt illegalen Inhalt ist
   das kein vollständiger Takedown.

**Entscheidung (Frank): Option A — Sichtung vor Veröffentlichung.** Ein Mensch (Frank) ist die
Schleuse vor dem öffentlichen Repo. Nichts wird öffentlich ohne seinen Klick; Abgelehntes berührt
Git nie.

## 1. Das Prinzip

Der bestehende Fluss wird in **zwei** getrennte Phasen zerschnitten:

- **Einreichen** (öffentlich, `POST /api/seed`): Guardrails 1–8 **unverändert** (Honeypot,
  Rate-Limit, Standby-Guard, Vorfilter+Consent, Turnstile, Kappen, KI-Gate). **Statt** zu
  committen, landet ein durchgelassener Seed in einem **privaten Pending-Speicher (Cloudflare
  KV)**. Kein Git, nichts öffentlich.
- **Freigeben** (privat, Steuerzentrale): Frank sieht die Pending-Liste, gibt frei oder lehnt ab.
  **Freigabe** ist der *einzige* Weg ins öffentliche Register — dort greift dann die bestehende
  Commit-/Forward-Logik. **Ablehnung** löscht nur aus KV → nie in der History.

Damit ist das KI-Gate weiterhin die erste Filterstufe (die Queue wird nicht mit offensichtlichem
Spam geflutet), aber die letzte Instanz vor der Öffentlichkeit ist ein Mensch.

## 2. Datenmodell — der Pending-Speicher (KV)

**Binding (Pages-Projekt):** `SEED_PENDING_KV` — exakt dieser Name, sonst meldet der
Standby-Guard ihn als fehlend. (Frank legt Namespace + Binding an; Production **und** Preview.)

- **Key:** `pending:<seed.id>` — die Seed-id ist `seed-YYYYMMDD-HHMMSS-XXXX`, der Datumsanteil im
  Key erlaubt Tages-Kappen ohne Zeitstempel-Parsing (Prefix-`list`).
- **Value (JSON):**
  ```jsonc
  {
    "seed": { /* vollständiges Seed-Objekt aus makeSeed(), status 'offered' */ },
    "gate": { "model": "<GATE_MODEL>", "verdict": "pass" },
    "received_at": "<ISO>"        // = seed.ts, redundant für die Sortierung in der UI
  }
  ```
- **TTL:** keine automatische Löschung — Pending bleibt liegen, bis Frank entscheidet
  (Freigabe verschiebt nach Git, Ablehnung löscht). Best-effort-Aufräum-Notiz s. §7.

Der **Claim-Token-Hash** liegt im Seed-Objekt (wie bisher) — Statusabfrage funktioniert, sobald
freigegeben (dann steht der Seed im öffentlichen Register). Vor Freigabe: kein öffentlicher
Lesezugriff auf KV, Pending bleibt vollständig privat.

## 3. `POST /api/seed` — geänderter Fluss

Schritte 1–8 **wörtlich wie gebaut**. Ab Schritt 9 neu:

9. **Kappen erweitert:** die Tages-/Offen-Kappe zählt jetzt **Pending (KV) + veröffentlicht
   (Register)** zusammen (ein Seed ist in genau EINEM der beiden, nie beiden):
   - `daily = kvListCount("pending:seed-<heute>") + offeredToday(register)` ≥ `SAAT_DAILY_CAP` → 429
   - `open  = kvListCount("pending:") + openCount(register)` ≥ `SAAT_OPEN_CAP` → 429
   Diese Prüfung ersetzt die reine Register-Prüfung in Schritt 7 (die KV-`list`-Calls sind bei
   diesen kleinen Kappen billig).
10. **Seed bauen** (`makeSeed`, wie bisher, stabile id) + Token/Hash.
11. **In KV schreiben:** `SEED_PENDING_KV.put("pending:"+seed.id, JSON.stringify({seed, gate,
    received_at}))`. **Kein** Register-Commit, **kein** REQUESTS.md-Forward.
12. **Antwort:** `{ ok: true, id, claim_token, status: "pending_review" }` — der Einreicher-Text
    auf `/seed` wird zu „empfangen, in Prüfung; erscheint im öffentlichen Register, wenn
    freigegeben".

**Gate-Block-Zähler (`gate_stats`):** unter Option A **nicht mehr fortgeschrieben.** Ein Block
passiert im Einreich-Isolate (`seed.js`), ein Commit nur noch im Freigabe-Isolate
(`seed-review.js`) — ein In-memory-Zähler kann diese Isolate-Grenze nicht überqueren, und ein
KV-Zähler je Block brächte Write-Amplification bei Spam. `gate_stats` bleibt daher statisch (der
`/seed`-Transparenzblock zeigt entsprechend 0). Ein durabler, entkoppelter Zähler ist ein
möglicher späterer Zusatz — kein Sicherheits-, nur ein Telemetrie-Verlust.

**GET-Probe:** meldet zusätzlich `pending_review` (KV-Count) neben `pending` (offen im Register).
`ready`/`missing` deckt jetzt auch `SEED_PENDING_KV` ab (fehlt das Binding ⇒ Standby).

## 4. Freigabe-Endpunkt — `functions/api/zentrale/seed-review.js`

**Auth: `ZENTRALE_SECRET` via `x-zentrale-auth`-Header, konstante-Zeit-Prüfung** (`checkToken`,
identisch zu `site-pr.js`). **Sicherheits-Invariante:** ohne gültiges Token 401, *bevor* irgendein
KV-/GitHub-Zugriff passiert. Das ist der kritischste Check der ganzen Änderung — ein offener
Freigabe-Endpunkt wäre schlimmer als das Ausgangsproblem.

- **`GET`** → Liste der Pending-Seeds aus KV (`list` + `get` je Key), sortiert nach `received_at`.
  Rückgabe: `[{ id, kind, text, author_mark, addressed_to, ts, gate }]`. Nur für die Anzeige.
- **`POST`** Body `{ id, decision }`:
  - **`decision: "approve"`** → Seed aus KV lesen → **bestehende Publish-Logik** (Register-Read →
    `addSeed(foldPendingBlocks(register), seed)` → `writeRegister` mit SHA-409-Retry →
    `forwardToRepo` in die Ziel-Praktik(en) → `recordForwarded`) → **KV-Key löschen**. Reihenfolge:
    Register-Commit zuerst (Quelle der Wahrheit), dann Forwards (idempotent), dann KV-Delete (erst
    löschen, wenn der Commit steht — sonst Verlust). Antwort `{ ok, id, forwarded_to }`.
  - **`decision: "reject"`** → nur **KV-Key löschen** (optional Reject-Zähler in-memory). Berührt
    Git nie. Antwort `{ ok, id }`.
  Braucht `env.SAAT_GITHUB_TOKEN` (für den Commit) **und** `ZENTRALE_SECRET` (Auth) **und**
  `SEED_PENDING_KV`. Fehlt eines ⇒ 503, fail-closed.

**Refactor:** Die GitHub-Publish-Helfer (`readRegister`, `writeRegister`, `readRequestsMd`,
`writeRequestsMd`, `forwardToRepo`, `recordForwarded`, `ghHeaders`, `b64*`, `upstreamError`,
`foldPendingBlocks`) wandern aus `seed.js` in ein geteiltes Modul **`src/lib/saat/publish.js`**
(kein Pages-Route, importierbar von beiden Functions). `seed.js` und `seed-review.js` importieren
von dort. Reine Bewegung, keine Logikänderung — der einzige Weg, die Commit-Logik nicht zu
duplizieren.

## 5. Steuerzentrale-UI (`ZentralePage.astro`)

Neue Sektion **„Öffentliche Saat — Freigabe"** (Muster wie „Site-PRs"): beim Dashboard-Load
`GET /api/zentrale/seed-review`, rendert je Pending-Seed eine Karte mit Text, kind, Pseudonym,
Adressat, Gate-Verdict + zwei Knöpfe **Freigeben** / **Ablehnen** (`POST` mit `{id, decision}`).
Nach der Aktion Liste neu laden. Ein Badge mit der Pending-Zahl an der Sektions-Überschrift.
Kein E-Mail-Versand, keine Benachrichtigung außerhalb der (ohnehin privaten) Steuerzentrale —
DSGVO-Fläche bleibt minimal (weiterhin **keine** E-Mail erhoben).

## 6. Transparenz-Konsequenz (bewusst, Frank abgesegnet)

Öffentlich werden nur **von Frank freigegebene** Seeds. Von ihm Abgelehntes erscheint nie im
Register. Die „Ablehnung ist auch ein Ergebnis"-Transparenz der Ursprungs-Spec gilt fortan nur
für die Entscheidungen der **Praktiken** (taken/adapted/declined) *nach* der Freigabe. Bewusster
Tausch: Sicherheit/Haftung vor lückenloser Angebots-Transparenz.

## 7. Risiken & offene Punkte

- **KV eventual consistency:** `list` kann kurz nach `put` einen Key noch nicht zeigen. Für die
  Kappen unkritisch (best effort, wie das In-memory-Rate-Limit). Für die Freigabe-Liste: ein
  gerade eingereichter Seed erscheint ggf. Sekunden später — akzeptabel.
- **KV-Kappe:** `list` liefert bis 1000 Keys; die Open-Kappe (24) hält die Queue klein. Bei Bedarf
  Kappe senken.
- **Verwaiste Pending:** wird nie freigegeben/abgelehnt, bleibt liegen. Kein Datenschutzproblem
  (privat, kein PII per Vorfilter), aber die Open-Kappe könnte volllaufen ⇒ Frank leert die Queue.
- **Zwei-Sessions-Git:** die Publish-Logik committet auf `main` des Site-Repos — unverändert
  gegenüber heute; keine neue Nebenläufigkeit.

## 8. Security-Invarianten (nicht verhandelbar)

- Freigabe-Endpunkt: Auth-Check **vor** jedem KV-/GitHub-Zugriff. 401 bei fehlendem/falschem Token.
- Fail-closed: fehlt `SEED_PENDING_KV`, `SAAT_GITHUB_TOKEN` oder `ZENTRALE_SECRET` ⇒ Standby/503.
- Kein Secret/Token/keine Key-URL je in Fehler, Log oder Response (wie `seed.js` heute).
- Same-origin, keine CORS-Header (wie heute).
- Der Claim-Token erscheint weiterhin nur EINMAL in der Einreich-Antwort; in KV liegt nur sein Hash.

## 9. Testplan

- Pure-Logik in `src/lib/saat/` unverändert getestet (validateSeed/makeSeed/addSeed/Caps).
- Neue pure Helfer (KV-Key-Format, Kombi-Kappen-Zähler als reine Funktion über
  `pendingCount`+`register`) mit Vitest.
- Die Functions selbst (`seed.js`, `seed-review.js`) laufen nur im CF-Runtime → Verifikation per
  **Preview-Deploy** (Frank): Einreichen → erscheint in der Steuerzentrale, nicht im Repo →
  Freigabe → erscheint im Register + REQUESTS.md → Ablehnung → verschwindet, kein Git-Eintrag.

## 10. Was Frank tun muss (Checkliste)

| Schritt | Wo | Status |
|---|---|---|
| KV-Namespace anlegen | CF → Workers & Pages → KV | ✓ (2026-07-20) |
| Binding **`SEED_PENDING_KV`** ans Pages-Projekt (Prod + Preview) | Pages → Settings → Bindings | offen — Name muss exakt stimmen |
| die vier Secrets (SAAT_GITHUB_TOKEN, TURNSTILE_*, GEMINI_API_KEY) | Pages → Variables & Secrets | ✓ |
| `feat/oeffentliche-saat` als Preview deployen und §9 durchtesten | — | nach dem Bau |
