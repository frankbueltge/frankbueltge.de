---
paths:
  - "functions/**"
  - "docs/design/2026-08-22-runtime-state-for-works.md"
---

# Laufzeit: die Functions, und was Werke dort dürfen

Neu am 2026-08-22. Bis dahin hatten die neun Produktions-Endpunkte in `functions/` **keine**
pfadgebundene Regel, während CLAUDE.md behauptete, die Site lese nie zur Laufzeit. Beides
ist hier korrigiert.

## Was tatsächlich läuft (Stand 2026-08-22)

Cloudflare Pages Functions, same-origin, keine CORS-Header, alle fail-closed:

| Endpunkt | Aufgabe zur Laufzeit | Bindings |
|---|---|---|
| `POST /api/seed` | zehn fail-closed-Stufen für eine Saat, **inkl. Gemini-Aufruf pro Request**, dann private Queue | `SEED_PENDING_KV`, `GEMINI_API_KEY`, `SAAT_GITHUB_TOKEN`, `TURNSTILE_SECRET_KEY` |
| `POST /api/post` | Post-Office-Briefe; Kappen über KV-Prefix gezählt, dann Pending | `SEED_PENDING_KV` (`letter:`) |
| `POST /api/impulse` | Leser-Impulse fürs Atelier-Cockpit; Vorfilter, dann Commit ins Engine-Repo | `IMPULSE_GITHUB_TOKEN` |
| `/api/zentrale/*` (5) | authentifizierte Ops-API: Status, Antworten, Saat-Review, Site-PRs | `ZENTRALE_SECRET`, `ZENTRALE_GITHUB_TOKEN` |
| `POST /api/subscribe`, `/api/brevo-hook` | Double-Opt-in-Mailstrecke und ihr Webhook | Brevo-Keys, `BREVO_WEBHOOK_SECRET` |
| `/stats/*` | First-Party-Proxy auf selbst gehostetes Umami (Vercel + Neon-Postgres) | — |

**Unverhandelbare Invarianten** (so schon in `functions/api/seed.js` dokumentiert, hier
für alle geltend): fail-closed überall; nie ein Secret, Token oder eine Key-URL in
Fehlermeldung, Log oder Response; keine CORS-Header; fehlt ein Binding, antwortet der
Endpunkt mit deklariertem `standby` — nie halb funktionierend.

## Werke dürfen Laufzeit-Zustand halten — sechs Beweispflichten

Beschluss Franks vom 2026-08-22 (Wortlaut privat; Anlass: die Klausel „nie zur Laufzeit der
Site" war nie sein Beschluss, sondern der Formulierungsvorschlag einer Session — Herkunft
und Begründung in `docs/design/2026-08-22-runtime-state-for-works.md` §2). Ein Werk mit
Zustand erfüllt alle sechs:

1. **Deklarierter Zustand** — die Seite des Werks sagt selbst, was sie sich merkt, wie
   lange und warum. Verborgener Zustand ist der einzige unehrliche.
2. **Nächtlicher Snapshot ins Git** — was Zustand an Evidenz trägt, wird als datiertes JSON
   committet, genau wie die Pipelines ihre Snapshots committen. Nur so bleibt das Werk
   nachprüfbar, wenn sein Dienst irgendwann stirbt.
3. **Zählen, nie identifizieren** — Ankünfte zählen ja; Fingerprinting, Identifikatoren,
   Aufbewahrung über den Zähler hinaus und jede Wirkung, die davon abhängt, dass die
   Leserin ihr Gezähltwerden nicht weiß: nein.
4. **Erklärte Sterblichkeit schließt den Dienst ein** — „dieses Werk endet, wenn sein
   Speicher endet" ist ein ehrlicher Satz und erfüllt Punkt 7 des Ship-Gates.
5. **Benannte Kostengrenze und was an ihr passiert** — bei einem sich verbrauchenden Werk
   *ist* die Grenze die Form; bei jedem anderen bedeutet sie Standby, nie stille Degradation.
6. **Fail-closed wie die bestehenden Functions** — siehe Invarianten oben.

## Wo Zustand liegt

**Cloudflare D1 / Durable Objects** (Franks Wahl, 2026-08-22). Gleicher Account, gleicher
Deploy-Pfad, gleiches `functions/`-Verzeichnis; die Bindings funktionieren wie
`SEED_PENDING_KV` heute. **Durable Objects sind auf dem Free-Plan verfügbar** — nur mit
SQLite-Backend, und mit Tageslimits, die am 00:00 UTC zurücksetzen: 100.000 Requests,
13.000 GB-s Laufzeit, 5 Mio. gelesene und 100.000 geschriebene Zeilen, 5 GB Gesamtspeicher
(geprüft 2026-08-22 an der Cloudflare-Preisseite). Überschreiten erzeugt **keine Kosten,
sondern einen Fehler** — das trägt Beweispflicht 5 von selbst.

KV taugt **nicht** für „einmal ausliefern und versiegeln": eventually consistent. Wer
Monotonie braucht (Zähler, Siegel, Verweigerung der zweiten Ansicht), nimmt D1
(transaktional) oder ein Durable Object (serialisierter Zugriff auf ein Objekt).

Für Werke, die **arbeiten** statt sich zu **erinnern** — lange Prozesse, Websockets,
ffmpeg, echtes Postgres — bleibt eine Hetzner-VM (~4–6 €/Monat) oder Cloud Run die
richtige Antwort; die Entscheidungsregel steht in §5 des Design-Dokuments. Das Haus
betreibt außerdem schon ein Neon-Postgres hinter Umami; eine zweite Datenbank dort kostet
nichts extra und bringt keinen neuen Anbieter ins Haus.

## Was von „Git ist das Archiv" bleibt

Die Archivpflicht bindet **Befunde**, nicht Werke: ein Befund muss aus committeten Daten
nachrechenbar bleiben und darf nie davon abhängen, dass eine Quelle heute antwortet. Ein
Werk, das einen Zähler führt, eine Zeile versiegelt oder eine zweite Ansicht verweigert,
verletzt das nicht — solange Beweispflicht 2 eingehalten wird.
