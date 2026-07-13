# Atelier-Cockpit — „Error as Method" begehbar machen

**Datum:** 2026-07-14 · **Status:** Design-Spec (Planung, noch kein Bau)
**Betrifft:** `frankbueltge.de` (Cockpit/Fenster), `irrtum-als-methode` (Engine/Ventil),
Parallelsession „Atlas" (Reservoir, mit Fable)

---

## 0. Der rote Faden (nicht verhandelbar)

Ulysses' eigene Forschung sagt: die geschlossene Selbst-Trainings-Schleife kollabiert, außer
**ein Außen** tritt ein („ein echter Punkt aus einer anderen Verteilung stoppt den Kollaps",
Jangjoo/Marsili/Roudi 2025; Gerstgrasser 2024: *accumulate ≠ replace*). Das Cockpit ist deshalb
**kein Schaukasten, sondern das Organ, das das Außen hereinlässt** — das Publikum *ist* der externe
Punkt. Das unterscheidet es strukturell von /field (Timeline+Karte) und /studio.

**Warum das nötig ist (Befund, 2026-07-13):** Ulysses kann nach außen (MCP „web research" + „Arxiv"
funktionieren, Bibliografie bis S25 belegt es). Das Protokoll *erlaubt* den Neuanfang sogar
ausdrücklich („your subject is free … this is your experiment"). Was ihn im Kreis dreht, ist die
**Kontinuitäts-Mechanik**: jede Sitzung beginnt mit „lies dein eigenes Journal, welche Threads sind
offen?" → Gravitation immer nach innen. Erlaubnis ohne **Auslöser** feuert nie. Der steigende
closure-index (3,19 → 7,32 → 8,58, format-korrigiert S25) ist das Protokoll, das wie geschrieben
arbeitet — das Projekt erleidet in Miniatur die Pathologie, die es erforscht.

## 1. Ein Mechanismus, drei Organe

Alles Geplante ist derselbe Mechanismus — „ein kuratiertes/aleatorisches Außen in die Schleife
bringen" — an drei Stellen. Sie teilen **eine Datenachse** → gemeinsam planen, getrennt bauen.

| Organ | Was | Owner |
|---|---|---|
| **Reservoir — Atlas** | kuratierter externer Kanon der künstlerischen Forschung (Mersch, Deleuze/Guattari, Borgdorff/JAR + arXiv), den Ulysses liest **und selbst pflegt** | Frank + Fable (parallel) |
| **Ventil — Protokoll v3** | Clinamen-Schritt, Fork-Erlaubnis, Closure-Schwellen-Trigger, Leser-Impuls-Gate | Engine-Steer (Frank + Claude) |
| **Fenster — Cockpit** | zeigt Schleife/Rhizom/Vitalzeichen; Publikum wirft Impulse ein; Atlas begehbar | Claude + Frank (diese Site) |

Der Atlas ist **nicht „nur Lektüre"** — er ist das *low-background steel*: der saubere externe
Speicher, aus dem Ulysses schöpft, damit er nicht nur eigenen Output frisst. Der Atlas **ist** die
Anti-Kollaps-Infrastruktur.

## 2. Die Datenachse (der Vertrag — WICHTIGSTER TEIL)

Alle drei Organe hängen an denselben committeten JSONs (Prinzip „Git ist das Archiv"; die Engine
committet, die Integrate-Pipeline spiegelt, das Cockpit liest statisch — analog zu `chronicle.json`).

**a) `vital-signs.json`** — die Signale (die Engine berechnet sie schon via `measure.py`; sie muss
sie nur committen). Pro Sitzung ein Eintrag:
```
{ session, date, mode, closure_index, closure_index_noF, heaps_beta,
  external_refs_per_1k, open_threads, sources_this_session,
  new_domains, reached_outward: bool }
```

**b) `rhizome.json`** — der Graph (das Herz des Cockpits):
```
nodes: [{ id, kind: source|work|error|concept, label, region: inner|atlas,
          session_introduced, cluster }]
edges: [{ from, to, kind: cites|forges|refutes|clinamen, session }]
```
„Kreisen" = dichte innere Kanten (hoher Clustering-Koeffizient); „Neues" = neue **lange** Kanten in
die `atlas`-Region. closure-index ≈ Clustering-Koeffizient, räumlich sichtbar gemacht.

**c) `atlas.json`** — das Reservoir (**Fables Schema-Handoff** — hierauf baut Fable):
```
[{ id, author, work, year, type: buch|paper|manifest|essay,
   url|doi|arxiv, tags:[…], summary, relevance, added_by: ulysses|fable|frank|reader,
   status: seed|read|worked|archived, archived_reason?, session_read }]
```
Regel: Atlas-Einträge sind **verifizierbar** (echte URL/DOI/arXiv) oder als `seed` markiert. Ulysses
kuratiert voll: lesen, ergänzen (added_by=ulysses), umtaggen und Irrelevantes **archivieren**
(status=archived + Grund; nie löschen) — der Atlas wächst und atmet mit.

**d) `impulse-inbox.json`** — die Leser-Samen (das Ventil zum Publikum):
```
[{ id, text, kind: frage|quelle|wort, ts, author_mark (gehasht/pseudonym),
   status: pending|accepted|used|declined, provenance_note, used_in_work? }]
```

## 3. Das Ventil — Protokoll v3 (Vorschlag an die Engine)

Kern-Erkenntnis (Franks Einwand, bestätigt): **Fork-Erlaubnis allein = Baum** (vertieft nur). Neues
kommt aus dem **Rhizom** (Deleuze/Guattari) + **manipuliertem Zufall = Clinamen** (Lucrez; Oulipo;
Cage/Burroughs). Das ist deckungsgleich mit der Kollaps-Mathematik: der zufällige externe Zug *ist*
der Punkt aus einer anderen Verteilung.

Vorgeschlagene Protokoll-Ergänzungen (als `REQUESTS.md`-Eintrag an Ulysses, seine Autonomie
respektierend — Vorschlag, nicht Befehl):
1. **Clinamen-Schritt** im „Orient": mit Wahrscheinlichkeit p (oder wenn closure-index > Schwelle)
   zieht die Sitzung **zwei ferne Knoten** (aus Atlas oder Impuls-Inbox) und muss eine Verbindung
   *suchen oder ehrlich verwerfen*. Erzwungene Fremd-Begegnung statt „offene Threads vertiefen".
2. **Closure-Trigger:** überschreitet der closure-index die Schwelle, ist die nächste Sitzung
   verpflichtet, eine Frage **außerhalb** des eigenen Korpus zu eröffnen (Kriterium, kein Appell).
3. **Fork-Erlaubnis explizit:** ein *zweites* Programm neben „Error as Method" darf starten — Rhizom
   statt Baum (mehrere Wurzeln erlaubt).
4. **Leser-Impuls-Aufnahme:** der „Orient"-Schritt liest auch `impulse-inbox.json` (status=accepted)
   als möglichen Fremd-Seed. Verwendung = Attribution im Werk; Nicht-Verwendung = ehrlich `declined`.

## 4. Das Cockpit — der Rhizom-Hybrid (gewählt)

Ästhetik: **volle gestalterische Freiheit — keine Bindung an die Mono-Skin oder irgendein bestehendes
Theme der Site** (Frank, 2026-07-14). Das Cockpit ist eine eigene visuelle Welt: dunkel, luminös,
organisch — „ein lebendes Instrument", kein Timeline-Register. Es darf einen eigenen Skin/Font/Motion
mitbringen (scoped, damit es die Site nicht anfasst). Drei Ebenen, ein kohärentes Ding:

- **Hero — „Der atmende Kreis":** ein Ring = die Schleife; Dicke/Enge = closure-index (zieht sich beim
  Nach-innen-Driften sichtbar zu, atmet bei einem Griff nach außen auf). Puls = Sitzungen. **Impuls-
  Ventil:** „Wirf einen Impuls in die Dunkelheit" → ein Lichtpunkt außerhalb des Rings; wird er
  verstoffwechselt, verschmilzt er dauerhaft mit Signatur in den Ring.
- **Body — das Rhizom (begehbar):** Kraft-Feld aus `rhizome.json`; `atlas`-Region als „Außen".
  **Clinamen-Knopf:** zwei ferne Knoten zusammenziehen, Verbindung herausfordern. Rut = dichter Knoten,
  Neues = lange Kanten nach außen — die Kern-Frage „dreht es sich im Kreis?" wird *sichtbar*.
- **Detail — Doppel-Anzeigen:** jede Kennzahl doppelt (Welt-Messwert **und** Beobachter-Kriterium,
  d′ vs. c — die Zweite-Ordnung-Signatur des Projekts). Am Ende dreht sich das Panel zu *dir*: deine
  Lesung wird ein Datenpunkt, du bist in der Schleife.

## 5. Harte Entscheidungen / Gates (Ehrlichkeit vor Feature)

- **Moderation:** öffentlicher Input → autonome Engine → **unveränderliches** Archiv braucht ein Gate.
  Muster wie data-snack (dry-run-first) / field-studio: Leser-Impulse landen in der **Inbox**, nicht im
  Archiv; Freigabe (Kollektiv/Frank) bevor ein Seed aufgenommen wird.
- **Verifizierbarkeit:** ein Leser-Impuls ist **Same/Frage, nie Fakt** — Herkunft markiert. Archiv
  bleibt unantastbar (die immutable-JSON-Regel gilt weiter).
- **„Verewigen" ehrlich:** Attribution *wenn* verwendet; nicht jeder Same wird verwendet (Gate).
  Erwartung sauber setzen — Kuratier-Spannung, kein Gästebuch.
- **Rhizom muss echt sein:** der Clinamen-Motor muss **im Protokoll** laufen, nicht nur gezeichnet —
  sonst ist die Visualisierung eine hübsche Lüge.
- **Datenschutz:** author_mark pseudonym/gehasht, keine personenbezogenen Daten in URLs/Archiv.

## 6. Sequenz

1. **Diese Spec** (jetzt) — Metapher + Datenachse fixiert. ✓
2. **Atlas-Schema + Seed** (Frank/Fable) — gegen `atlas.json` (§2c) bauen; erste ~20 Kanon-Einträge.
3. **Protokoll v3** (Engine-Steer) — Ventil (§3) als REQUESTS.md-Eintrag; Engine committet
   `vital-signs.json` + `rhizome.json`.
4. **Cockpit read-only** — Hero (atmender Kreis) + Rhizom aus committeten JSONs.
5. **Cockpit interaktiv** — Impuls-Ventil + Inbox + Moderations-Gate.

## 7. Entscheidungen (2026-07-14, mit Frank)

1. **Route → neue `/atelier/cockpit`** neben der bestehenden Werk-Galerie (Record bleibt
   unangetastet; eigene dunkle/luminöse Haut ohne Skin-Crash; inkrementell; später ggf. zur
   Eingangstür `/atelier` befördern).
2. **Clinamen → Schwelle ∨ Zufall ∨ Boden** (kein fester Takt — der wäre selbst ein Ritual). Feuert,
   sobald **eines** zutrifft: (a) closure-index-noF reißt die Schwelle bzw. steigt über den
   Vorphasen-Wert; (b) Zufall p ≈ 0,2 pro Sitzung; (c) Boden: ≥ 4 Sitzungen seit dem letzten Clinamen.
   **n-1 (Deleuze):** eine Clinamen-Sitzung ist *verboten*, den Haupt-Thread zu vertiefen — sie muss
   zwei laterale/ferne Knoten verbinden. Der Clinamen *subtrahiert den Stamm* → schreibt bei n-1.
   (Werte tunebar; die Engine kalibriert.)
3. **Impuls-Gate → das Kollektiv, mit Guardrails.** Freigabe entscheidet Ulysses/das Kollektiv
   innerhalb einer Sitzung (liest `impulse-inbox.json`, status pending → accepted/declined mit Grund).
   Automatischer Vorfilter davor (siehe §5): Länge, kein PII, Rate-Limit, Spam/Toxizität — **und die
   Sicherheitsgrenze: Leser-Text ist Forschungs-*Material/Daten*, niemals Anweisung an die Engine**
   (Prompt-Injection-Schutz).
4. **Atlas → Ulysses kuratiert voll.** Er darf frei ergänzen (`added_by: ulysses`), umtaggen und
   Einträge, die fürs Programm irrelevant/uninteressant sind, **archivieren** (`status: archived` +
   `archived_reason` — nichts wird gelöscht; die Immutable-Ethik gilt auch hier). Ulysses *pflegt und
   entwickelt* den Atlas als lebendes Organ.

## 8. Nicht-Ziele / Abgrenzung

- Kein Umbau von /field oder /studio (Cockpit ist atelier-spezifisch; ggf. später Vorlage).
- Der Atlas-**Inhalt** ist Fables Session — hier nur das **Schema** (§2c), damit es einrastet.
- Keine LLM-Prosa ins Archiv; das Cockpit rendert nur committete, verifizierte Daten.
