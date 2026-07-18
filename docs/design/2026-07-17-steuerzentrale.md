# Steuerzentrale — Design-Notiz (2026-07-17)

## Was & warum

`/steuerzentrale` ist eine private Operator-Seite — kein Werk, kein öffentlicher Eintrag,
nicht in der Nav, noindex und aus der Sitemap ausgeschlossen (`astro.config.mjs`). Sie gibt
Frank nach dem letzten nächtlichen Run einen Überblick in einer Ansicht: welche Kollektive
in der Nacht gearbeitet haben, ob ihr Integrate grün oder rot lief, was in der Inbox auf eine
Reaktion wartet — und einen Kanal für Schnellantworten und eigene Impulse (Saat) an die drei
Engine-Kollektive und das Plenum.

Schweigen blockiert nie. Bleibt eine Anfrage unbeantwortet, entscheidet die jeweilige Praxis
in ihrer nächsten Sitzung selbst (Standing Rule) — die Steuerzentrale ist ein Angebot an
Frank, schneller zu reagieren, keine Voraussetzung dafür, dass die Kollektive weiterarbeiten.

## Bewusste Ausnahme

Die sonst geltende Lab-Regel „Git ist das Archiv, kein dynamisches Lesen zur Laufzeit"
gilt hier **nicht**. Die Steuerzentrale ist ein Operator-Werkzeug, kein öffentliches Werk —
sie liest live gegen die GitHub-API (Runs, Commits, offene Issues) und schreibt live in die
REQUESTS.md der Engine-Repos. Präzedenz dafür existiert bereits im Lab: `functions/api/
impulse.js` (das „Ventil" des Atelier-Cockpits) committet Leser-Impulse ebenfalls live über
eine Pages Function. Öffentliche Seiten bleiben von dieser Ausnahme unberührt — sie zeigen
weiterhin ausschließlich committete, versionierte JSON-Snapshots.

## Architektur

Drei Blöcke auf einer statisch ausgelieferten Seite (Astro, prerendered, aber ohne
Server-Daten — der gesamte Inhalt kommt zur Laufzeit aus dem Browser):

- **Die Nacht** — pro Kollektiv: Commits der letzten 24 h, letzter Commit, Integrate-Status
  (grün/rot/offen) mit Link auf den Lauf und ein ggf. offenes rotes Issue, die jüngste
  Chronik-Zeile, bei Atelier zusätzlich der closure-Wert, liegen gebliebene Issues.
- **Inbox** — offene Anfragen der Kollektive (aus den REQUESTS.md-Sections, als GitHub-Issue
  gespiegelt) mit Schnellantwort-Buttons.
- **Site-PRs** — offene Vorschläge der PR-Schleuse (`engine-site-pr.yml`): Änderungen, die
  ein Kollektiv an der Site selbst vorschlägt, als PRs mit Branch `<ns>/pr-<slug>`. Pro
  Karte: Persona, PR-Nummer/Alter, Titel, Slug, Begründungs-Auszug, Link zum PR und zwei
  Entscheidungen — **mergen** (Live-Aktion, zweiter bestätigender Klick nötig; danach baut
  `deploy-cf` die Site neu) oder **ablehnen** (schließen, endgültig — die Schleuse belebt
  geschlossene PRs nie wieder; ein optionales Begründungsfeld geht als PR-Kommentar an die
  Engine). Nach beidem wird der PR-Branch best-effort gelöscht.
- **Saat** — ein Formular, um selbst eine Anregung in die REQUESTS.md eines Kollektivs zu
  legen.

Dahinter drei Cloudflare Pages Functions (`functions/api/zentrale/status.js`,
`functions/api/zentrale/antwort.js`, `functions/api/zentrale/site-pr.js`) und die pure,
getestete Logik in `src/lib/zentrale/` (Auth-Vergleich, Response-Umformung, REQUESTS.md-
Textoperationen, Site-PR-Filter/Validierung — kein `fetch` darin, das bleibt Sache der
Functions). Antworten und Saaten committen als **„Steuerzentrale
<steuerzentrale@frankbueltge.de>"** in die REQUESTS.md der Engine-Repos (field-research,
studio, irrtum-als-methode, data-snack-plenum) und schließen — bei `answer`/`acknowledge` —
das zugehörige Inbox-Issue im eigenen Repo. Die Site-PR-Aktionen (`site-pr.js`) mergen bzw.
schließen PRs im Site-Repo selbst; vor jeder Aktion wird der PR geladen und gegen das
Engine-Branch-Muster (`<ns>/pr-<slug>`, `isEngineHead`) geprüft — der Endpoint kann nie
einen menschlichen Feature-PR anfassen, egal welche Nummer hereinkommt.

Die Seite selbst (`src/pages/steuerzentrale/index.astro`, `src/components/pages/
ZentralePage.astro`) ist ein leeres, token-gated Gerüst: kein Framework, plain DOM-Code im
Astro-`<script>` nach dem Muster von `CockpitPage.astro` (kein `is:inline`, von Astro
gebündelt/gehasht, erlaubt durch `script-src 'self'`). Jede API-gelieferte Zeichenkette geht
ausschließlich über Textknoten ins DOM — nie `innerHTML` mit rohem Text, weil Commit-Messages
und Issue-Auszüge Kollektiv-Text sind, keine vertrauenswürdige Auszeichnung.

## Secrets (Cloudflare Pages, Production **und** Preview)

- `ZENTRALE_SECRET` — Zufalls-Token für den `X-Zentrale-Auth`-Header
  (`openssl rand -hex 24`).
- `ZENTRALE_GITHUB_TOKEN` — fine-grained PAT:
  - Contents read/write auf `field-research`, `studio`, `irrtum-als-methode`,
    `data-snack-plenum` (schreibt in deren REQUESTS.md),
  - Actions read + Issues read/write auf `frankbueltge.de` (liest Workflow-Runs, verwaltet
    die Inbox-Issues),
  - **Pull requests read/write + Contents read/write auf `frankbueltge.de`** — für den
    Site-PRs-Block: die offenen Vorschläge lesen, mergen (Contents-Write nötig, sonst 403)
    und schließen. Fehlt dieses Recht, zeigt der Merge-Button ehrlich „Dem Token fehlt das
    Merge-Recht …" statt still zu scheitern.
  - Läuft maximal 1 Jahr — Ablauf-Erinnerung setzen.

Ohne diese Secrets antwortet `status` mit 503, die Seite zeigt „Nicht verbunden — Secrets
fehlen auf dem Server." statt eines toten Formulars.

## Stufe 2 (Telegram, geplant)

Eine Webhook-Function (`/api/zentrale/telegram`) soll Inline-Buttons im Morning-Digest
erlauben — dieselben Schnellantworten, ohne die Seite zu öffnen. Checkliste, wenn es
soweit ist:

1. BotFather → Bot-Token anlegen (oder den bestehenden Digest-Bot wiederverwenden).
2. `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` **doppelt** pflegen: als GitHub-Actions-Secrets
   existieren sie bereits (Morning-Digest-Push); als Cloudflare-Pages-Secrets müssen sie neu
   gesetzt werden — getrennte Laufzeiten, getrennte Secret-Stores.
3. `TELEGRAM_WEBHOOK_SECRET` erzeugen (eigener Zufalls-Token, prüft eingehende Updates).
4. Einmalig `setWebhook` auf `https://frankbueltge.de/api/zentrale/telegram` mit
   `secret_token` aufrufen.
