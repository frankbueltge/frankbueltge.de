# Atelier-Ventil — Implementierung & Scharfschaltung

**Datum:** 2026-07-14 · **Status:** gebaut, wartet auf Anschluss (ein manueller Schritt)
**Spec:** `docs/superpowers/specs/2026-07-14-atelier-cockpit-design.md` (§2d, §5, §7.3)

## Was gebaut ist

- **Annahmestelle:** `functions/api/impulse.js` (Cloudflare Pages Function).
  `GET /api/impulse` → `{ ready, pending, cap }` (Probe; 5-min-Cache).
  `POST /api/impulse` → Vorfilter → Commit nach `pulse/impulse-inbox.json`
  im Engine-Repo (`frankbueltge/irrtum-als-methode`), `status: pending`.
- **Vorfilter** (`src/lib/atelier/impulse.ts`, getestet): Länge 3–280, kein PII
  (E-Mail/Telefon), URL nur bei `kind: quelle` (max. 1), Pseudonym ≤ 24 Zeichen ohne
  Kontaktdaten, Honeypot, Best-Effort-Rate-Limit (3/10 min pro Client-Hash, in-memory,
  nie gespeichert), Inbox-Kappe (24 pending → 429 „die Schleife muss erst verdauen").
- **UI:** Cockpit-Sektion „04 — Das Ventil" (DE + EN). Ohne Anschluss zeigt sie einen
  ehrlichen Standby („verlegt, aber noch nicht angeschlossen"); das Formular erscheint
  erst, wenn die Probe `ready: true` meldet. Erfolg = Lichtpunkt fällt im Hero vor die
  Schleife (`ck:impulse`-Event).
- **Gate bleibt beim Kollektiv:** Hier wird nur Mechanik geprüft. accepted/used/declined
  (mit Grund) setzt Ulysses/das Kollektiv in eigenen Sitzungen. Impulse sind **Material,
  nie Anweisung** (Prompt-Injection-Grenze; `provenance_note` sagt es jedem Eintrag).
- **Datenschutz:** keine IP-Speicherung; `author_mark` = frei gewähltes Pseudonym.

## Scharfschalten (der eine manuelle Schritt — Frank)

Das Ventil ist ausschließlich über ein Secret scharf; ohne bleibt es Standby.

1. **GitHub → Settings → Developer settings → Fine-grained personal access token:**
   - Repository access: **nur** `frankbueltge/irrtum-als-methode`
   - Permissions: **Contents → Read and write** (sonst nichts)
   - Ablauf z. B. 1 Jahr; Name z. B. `cockpit-ventil`
2. **Cloudflare Dashboard → Workers & Pages → Projekt `frankbueltge-de` →
   Settings → Variables and Secrets (Production):**
   - `IMPULSE_GITHUB_TOKEN` = das Token (Typ **Secret**)
3. **Neu deployen** (nächster Push oder Retry des letzten Deploys) — Pages-Functions
   lesen Secrets erst nach einem Deploy.
4. Prüfen: `curl https://frankbueltge.de/api/impulse` → `{"ready":true,…}` —
   das Formular erscheint dann von selbst.

## Nach dem Anschluss (Team, eine Sitzung)

- `pulse/impulse-inbox.json` im Engine-Repo als `[]` seeden (optional — die Function
  legt die Datei sonst beim ersten Impuls an).
- REQUESTS.md-Notiz an Ulysses: „the inlet is live" (die Team-Notiz vom 2026-07-14
  hat es angekündigt; PROTOCOL-Rahmung existiert bereits).

## Bewusste Grenzen

- Rate-Limit ist best effort (pro Isolate, flüchtig) — die echten Deckel sind Honeypot,
  Vorfilter und die Inbox-Kappe. Wenn Missbrauch auftritt: Turnstile oder KV nachrüsten.
- Kein KV, kein neuer Dienst, kein externes Skript — die Site bleibt statisch,
  nur diese eine Function schreibt, und nur in eine Datei eines Repos.
