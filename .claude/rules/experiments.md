---
paths:
  - "src/data/werke.ts"
  - "src/pages/**/*.astro"
  - "src/components/pages/**/*.astro"
  - "docs/superpowers/specs/**"
  - "docs/audits/**"
---

# Experimente — Gate, Material, Methode

> **Vorab, seit 2026-09-04 (Frank, Wortlaut privat):** Alles Folgende gilt für ARCHIVIERTE
> Experimente. Ein Werk mit `unarchived: true` liest die Welt zur Laufzeit und ist von der
> USP-Pflicht, der Währungs-Pflicht und der Methodenblatt-Pflicht **ausgenommen** — es schuldet
> nur den Live-Hinweis auf der eigenen Fläche (`src/lib/experiments/unarchived.ts`). Auch das
> §2-Gate gilt dort nicht: Ein Live-Experiment wird gestartet, nicht beantragt. Der Grund ist
> Zuschnitt, nicht Nachlässigkeit — das Audit fragt, ob die Welt einen BEFUND schon hat, und ein
> Live-Werk veröffentlicht keinen Befund, sondern zeigt die Welt in dem Moment, in dem jemand
> hinsieht.

Umgezogen aus `CLAUDE.md` am 2026-08-09 (CLAUDE.md-Diät). Inhalt unverändert; lädt, wenn
das Werkeverzeichnis, eine Experiment-Seite oder eine Spec/ein Audit angefasst wird.

- **USP-Pflicht (Frank, 2026-08-09, verbindlich):** Jedes Experiment braucht nachweisbaren
  Mehrwert oder ein Alleinstellungsmerkmal — per Web-Recherche prüfbar (nächste Nachbarn
  weltweit + Daylight). Gilt rückwirkend für die Holdings — das Nachbarn-Audit ist
  abgeschlossen (16 Werke verdiktet, gemergt als #472; decision-log 2026-08-09), Franks
  Entscheid darauf: nicht archivieren, sondern ausbauen — das USP-Rework-Programm
  (`docs/design/2026-08-09-usp-rework-program.md`, Checkpoint 2026-09-05) ist in Kraft.
  Neue Experimente beantworten die Frage am §2-Gate, bevor gebaut wird. Ergänzt die
  Maschinen-Bar der Ecology: die Bar fragt „konnte das nur eine Maschine?", die USP-Pflicht
  fragt „hat die Welt das schon?".
  **Seit 2026-08-09 ist die Pflicht ein Test, kein Vorsatz:** `src/lib/graph/graph.test.ts`
  lässt kein Experiment auf `/experiments`, das im Audit kein Verdikt, kein benanntes Daylight
  und keine benannte Nachbarschaft hat. Wer ein Werk auf die Rangliste setzt, ergänzt das
  Audit — sonst ist die Suite rot.
- **Währungs-Pflicht, seit 2026-08-22 ebenfalls ein Test:** Ein Audit aller sechzehn
  Beschreibungen gegen die committeten Snapshots fand dreizehn Befunde — sieben harte
  Widersprüche, und **sechs davon Zahlen, die beim Tippen stimmten** und vom Weiterlaufen der
  Arbeit gebrochen wurden (zwölf Quellen wurden dreizehn, 25 Agenten wurden 29, Googles 27 %
  wurden 37 %). `src/data/werke.currency.test.ts` prüft darum die Register-Prosa gegen die
  Snapshots und wird rot, wenn eine Beschreibung behauptet, was die Daten widerlegen.
  Praktische Konsequenz beim Schreiben eines Eintrags: **eine Regel statt eines Digits**
  („unter 9 % Spielraum, und mehr Wachstum als das in jedem berichteten Jahr" statt „27 % in
  einem Jahr"), und gar keine Zahl, wo die Werkseite sie ohnehin abgeleitet rendert. Wer eine
  Zahl trotzdem braucht, ergänzt den passenden Wächter im Test — sonst altert sie unbemerkt.
- **Spec:** `docs/superpowers/specs/2026-06-11-werkgruppe-design.md` (Substanz-Kriterien
  in §2 sind das Gate für jedes neue Experiment; Methodenblatt-Pflicht in §3.5).
  Rahmung/Wortlaut: `2026-08-01-festival-line.md` („artistic research, under proof");
  die frühere Kein-Kunst-Anspruch-Rahmung (`2026-06-20-ehrliche-umrahmung-design.md`)
  ist datiert abgelöst, nur noch historisch.
- **KI/ML sind Material und Methode — inkl. symbolischer/neuro-symbolischer KI.**
  Das Lab experimentiert mit Daten UND KI (Frank, 2026-06-22; das frühere lab-weite
  „kein LLM"-Dogma ist aufgehoben). Einzige Bedingung ist **Nachprüfbarkeit:** jeder
  KI-Schritt ist transparent (Modell/Prompt/Verfahren offengelegt), sein Output wird
  verifiziert oder als Schätzung markiert; wo das Modell selbst der Gegenstand ist, wird
  seine Unzuverlässigkeit Teil der Messung. KI als ausgewiesenes, prüfbares Werkzeug UND
  als Untersuchungsgegenstand — nie als unbelegtes Orakel, das Fabrikation als Fakt
  ausgibt. (Dieselbe Ethik wie datavism: „no AI output without verification, no claim
  without evidence".) Symbolische KI ist besonders willkommen, weil auditierbar — sie
  zahlt direkt auf „nachprüfbar machen" ein.
