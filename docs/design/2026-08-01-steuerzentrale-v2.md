# Steuerzentrale v2 — Triage statt Textwand (Design, 2026-08-01)

**Status: Entwurf zur Abnahme.** Auftrag Frank, 2026-08-01: „das sind immer riesig lange
texte und oft fehlt mir der überblick oder kontext und ich verstehe viele anfragen
überhaupt nicht und weiß nicht wie und ob ich reagieren muss." (Deutsch, weil die
Steuerzentrale die erklärte deutsche Ausnahme der EN-only-Regel ist.)

## 1. Diagnose

Die Zentrale (v1, 2026-07-17) bündelt heute zuverlässig ZUSTAND (Läufe, Commits, rote
Issues, Inbox aus den REQUESTS-Kanälen). Was sie nicht leistet: **Zumutbarkeit.** Die
Inbox reicht die Anfragen als Rohtext durch — Briefe von Maschinen, die für die
Nachwelt schreiben, nicht für einen Menschen mit fünf Minuten. Es fehlen drei Dinge
pro Eintrag: *Worum geht es in einem Satz? · Muss ich etwas tun — und was? · Bis wann,
und was passiert bei Schweigen?*

## 2. Der Kernzug: Triage durch die Absender, nicht durch eine zweite KI-Schicht

Die Verfasser der Anfragen sind Maschinen — sie können strukturiert liefern. Statt
site-seitig einen Zusammenfasser über fremde Texte laufen zu lassen (zweite
Interpretationsschicht, gegen die Ehrlichkeits-Ethik), wird die Struktur **beim
Schreiben** verlangt:

**Anfrage-Kopf (Konvention, per Seed an alle Praxen):** Jede an Frank gerichtete
Anfrage/Antwort in REQUESTS.md beginnt künftig mit einem Vier-Zeilen-Kopf:

```
> tl;dr: <ein Satz, was das hier ist>
> braucht: entscheidung <optionen> | antwort | weiterleitung | nichts (zur kenntnis)
> frist: <datum oder "keine — schweigen gilt nach eurer regel als entscheidung">
> kontext: <ein satz: was ging voraus + pfad#überschrift>
```

- Der Kopf ist **Selbstauskunft des Absenders**, keine Fremdinterpretation — die
  Zentrale rendert ihn, erfindet nichts.
- Alt-Anfragen ohne Kopf: Fallback = erste zwei Sätze + Marker „unstrukturiert (alt)".
- Durchsetzung sanft: der Morgen-Digest erinnert die Praxis, wenn ein neuer Eintrag
  ohne Kopf ankommt (kein Gate, keine Blockade — nur sichtbar).

## 3. Die Oberfläche (v2)

**A — „Heute nötig" (oben, kompakt):** ausschließlich Einträge mit `braucht ≠ nichts`,
sortiert nach Frist. Jede Karte: TL;DR-Zeile · Praxis-Chip · braucht-Badge · Frist-
Countdown · Kontext-Link (springt zur Überschrift im Repo) · Aufklapper mit Volltext
(der Brief bleibt der Brief). **Leerzustand ist ein Feature:** „Nichts braucht dich
heute." in großer Schrift.

**B — Antworten in einem Klick:** Bei `braucht: entscheidung <optionen>` rendert die
Karte die Optionen als Buttons (+ Freitextfeld); der Klick schreibt über den
bestehenden `antwort.js`-Kanal die Antwort unter die Anfrage — mit Franks Standard-
Signatur und Datum. Bei jeder Karte steht die Schweige-Folge („unbeantwortet bis zur
nächsten Session der Praxis ⇒ sie entscheidet selbst und journalisiert").

**C — Gate-Spur (Governance §1, seit 2026-08-01 in Kraft):** eigene Sektion:
Publikations-Kandidaten mit Wartezeit und **72-h-Countdown**, Buttons `GO` /
`HALTEN (mit begründungszeile)`. Jede Entscheidung schreibt eine Zeile ins
Gate-Ledger (Quelle: die `disposition: PUBLICATION_CANDIDATE`-Frontmatter der
Engine-Repos — liegt im Status-Fetch schon fast vollständig vor).

**D — Post-Spur (Governance §3):** die `prepared`-Einträge aus
`src/data/post/ledger.json` mit **7-Tage-Countdown** und Empfänger/Kanal — Franks
Weiterleitungs-Checkliste, nichts weiter.

**E — Digest-Kohärenz:** der Morgen-Digest verwendet dieselben Kopf-Felder — gleiche
Sprache am Morgen und in der Zentrale, keine zwei Vokabulare.

## 4. Nicht-Ziele

- Keine KI-Zusammenfassung fremder Texte in der Zentrale (Selbstauskunft schlägt
  Fremddeutung; der Volltext bleibt eine Aufklapp-Ebene entfernt).
- Keine neue Datenhaltung: Quellen bleiben REQUESTS.md, Engine-Frontmatter,
  post/ledger.json; die Zentrale bleibt Lesegerät + Antwortstift.
- Kein öffentliches Surface: token-gated, noindex, deutsch — unverändert.

## 5. Umsetzung in drei Paketen

| Paket | Inhalt | Aufwand |
|---|---|---|
| **P1** | Kopf-Konvention als Seed an die Praxen; Parser + Triage-Rendering (Sektion A) + Leerzustand; Digest nutzt den Kopf | 1 Session |
| **P2** | Gate-Spur (C) mit Countdown + GO/HALTEN-Schreibweg; Post-Spur (D) | 1 Session |
| **P3** | Options-Buttons (B) über antwort.js; Erinnerung im Digest bei kopflosen Anfragen | 1 Session |

Reihenfolge bewusst: P1 löst Franks benanntes Problem (Überblick/„muss ich
reagieren?") bereits zu ~80 %.

## 6. Offene Punkte für Franks Abnahme

- [ ] Kopf-Konvention so ok (vier Zeilen, deutsch/englisch gemischt — die Praxen
      schreiben englisch, `braucht:`-Werte sind ihnen als Vokabular vorgegeben)?
- [ ] Gate-GO aus der Zentrale heraus zulässig, oder bleibt GO bewusst ein
      Session-Gespräch mit dir? (Empfehlung: zulässig — das Ledger macht es prüfbar.)
- [ ] P1 sofort bauen oder erst nach Merge der offenen PRs?
