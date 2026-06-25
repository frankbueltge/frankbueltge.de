# Spec — „The Redaction" / *Das Schwärzen* (Gegenmessung, Instrument V)

**Status:** Entwurf zur Abnahme (Brainstorming mit Frank, 2026-06-25)
**Linie:** Gegenmessung / Counter-Measurement (`2026-06-22-gegenmessung-echo-design.md`)
**Gate:** Substanz-Kriterien §2 der Werkgruppe (`2026-06-11-werkgruppe-design.md`)

## 1. Einordnung

Die Linie Gegenmessung zählt, was Macht im Dunkeln lässt, und macht es nachprüfbar.
Die bestehenden Instrumente messen Echo (The Consensus), die geschönte amtliche Zahl
(The Correction), den KI-Fußabdruck (The Tell) und die eigene Mustergläubigkeit (Patterns).

„The Redaction" misst eine bislang ungemessene Lücke: **was aus dem öffentlichen Protokoll
wieder entfernt wird.** Reinste „Dark Data" — nicht Daten, die ein System zu erheben
verweigert, sondern Daten, die es *zurücknimmt*. Das Stück ist ein Werk übers Erinnern,
gebaut auf einem Archiv, committet in ein Archiv (Git). Die Form spiegelt die These.

## 2. These & Frage

> **These:** Das öffentliche Protokoll der Welt wird nicht nur geschrieben, sondern auch
> *entschrieben*. Veröffentlichung macht Schlagzeilen; das spätere Verschwinden nicht.

**Frage:** Was wurde heute aus dem offiziellen öffentlichen Eintrag still entfernt — und
lässt sich das in zwei Klicks überprüfen?

**Blinder Fleck:** Der amtliche Eintrag wirkt stabil. Tatsächlich werden Behördenseiten,
Pressemitteilungen, Datenseiten und Zusagen leise umgeschrieben oder gelöscht. Das
Instrument zählt das Weggenommene — den durchgestrichenen Text.

## 3. Beobachtungskorpus

Eine **versionierte, kuratierte Seed-Liste** offizieller URLs im Repo (redaktionelle
Entscheidung, dokumentiert — wie Parallaxe/Half-Life). Aufnahmeregel:

1. **offiziell/behördlich** oder offiziell-institutionell (Regierung, Behörde, zwischen-
   staatliche Organisation, öffentlich-rechtliche Stelle);
2. trägt **überprüfbare Behauptungen oder Zusagen** (Politik-, Daten-, Statement-Seiten —
   nicht reine Nav-/Index-Seiten);
3. öffentlich **folgenreich**;
4. von der Wayback Machine **regelmäßig erfasst** (Mindest-Erfassungsdichte, damit ein
   Vorher/Nachher überhaupt existiert).

Start ~30–60 URLs über wenige Institutionen; die Liste wächst per dokumentierter Regel,
jede Änderung im Methodenblatt-Änderungsprotokoll vermerkt. Die konkrete Startliste wird
im Implementierungsplan festgelegt (siehe §17).

## 4. Signal & Methode

Gemessen wird **Entfernung** in zwei Ausprägungen:

- **Löschung** — die Seite liefert jetzt 404/3xx, wo zuvor 200 (der Eintrag ist weg);
- **Entfernung** — die Seite existiert, hat aber substanziellen **Haupttext** verloren.

Hinzufügungen werden vermerkt, sind aber **nicht der Gegenstand** (Schwärzen = Wegnehmen).

**Ablauf je URL:**

1. **Wayback CDX-API** (`web.archive.org/cdx/search/cdx`, frei, keine Auth):
   Captures mit `timestamp,original,statuscode,digest,length`, `collapse=digest` (kollabiert
   inhaltsgleiche Folge-Captures), Zeitfenster gesetzt. So wird billig erkannt, *dass* und
   *wann* sich Inhalt änderte, bevor Snapshots gezogen werden.
2. **Statuswechsel** 200 → 404/3xx ⇒ Löschung.
3. **Digest-Wechsel** zwischen den letzten beiden inhaltsverschiedenen Captures ⇒ Kandidat:
   beide Snapshots roh ziehen (`/web/<ts>id_/<url>` — archiviertes Original ohne Wayback-
   Rahmen), **Haupttext extrahieren** (z. B. *trafilatura*; Version offengelegt, ignoriert
   Nav/Boilerplate-Geflacker), Diff auf Satz-/Token-Ebene.
4. Entfernte Passagen + entfernte-Token-Zahl bestimmen.

Schonender Abruf (Rate-Limit-bewusst, Retry/Backoff wie die bestehenden Adapter).

## 5. Salienz — symbolisch, auditierbar (kein LLM)

Jede Entfernung erhält einen **Salienz-Score** aus offengelegten Regeln über dem entfernten
Text. Signale (DE+EN), je mit dokumentiertem Gewicht:

- **Zahl** — Ziffernfolgen, Prozente, Währungs-/Mengenangaben;
- **Datum** — Datumsmuster, Jahreszahlen;
- **Eigenname** — heuristisch (Mehrwort-Großschreibung; optionaler kleiner Gazetteer);
- **Verneinung** — *nicht, kein, never, no, not*;
- **Verpflichtungsverb** — *wird, muss, soll, verpflichtet, will, shall, must, commit, pledge*.

Nur Markup/Whitespace/Interpunktion ⇒ **kosmetisch**, Score 0. Score = gewichtete Summe;
Regeln und Gewichte versioniert (`SALIENCE_VERSION`), im Methodenblatt nachlesbar. Die
Salienz **gatet** das Ranking: eine inhaltsleere Boilerplate-Löschung (Score 0) kann die
Tagesschwärzung nie gewinnen, egal wie viele Token sie umfasst.

## 6. „Die Schwärzung des Tages" + Index

- **Kadenz:** täglich, wie die anderen Instrumente. An stillen Tagen meldet das Instrument
  ehrlich *„Keine Schwärzung festgestellt."* — Stille ist eine gültige Aussage (Ausfall als
  Form), nie eine still überbrückte Lücke.
- **Ranking (deterministisch, offengelegt):** `salience.score × removed_tokens`; Gleichstände
  nach URL, dann Snapshot-Zeitstempel. Der Top-Fund ist die „Schwärzung des Tages", der Rest
  darunter gelistet.
- **Redaction-Index:** *„X von N beobachteten Seiten verloren heute Inhalt"* + Summe entfernter
  Token. Nüchterne, prüfbare Tageskennzahl.

## 7. Provenienz — das Rückgrat

Jeder Fund verlinkt **zwei Wayback-Permalinks** (vorher + nachher) bzw. bei Löschung den
letzten lebenden Snapshot + den 404-Nachweis. Jede Behauptung ist in zwei Klicks selbst
nachzuprüfen. Das ist „nachprüfbar machen" eingelöst — die Quelle ist das öffentliche
Internet-Archiv, nicht das Wort des Instruments.

## 8. Datenmodell (JSON kanonisch, Prosa ist Darstellung)

Pro Tag committet die Pipeline `src/data/redaction/<jahr>/<datum>.json`:

```
{ date, generated_at, schema_version, pipeline_version, salience_version,
  watched_count, changed_count,
  pick: <redaction_id | null>,
  redactions: [
    { id, url, institution, label,
      kind: "deletion" | "removal",
      before: { wayback_ts, url },           // letzter lebender Snapshot
      after:  { wayback_ts, url, status },    // Folge-Snapshot bzw. 404-Nachweis
      removed_passages: [ "…", … ],
      removed_tokens,
      salience: { score, signals: [ "number", "commitment_verb", … ] },
      note? } ] }
```

JSON ist darstellungsfrei; Astro rendert die Prosa (DE/EN) zur Buildzeit aus JSON +
Templates. Committete Tages-JSONs sind **unantastbar** — Korrekturen nur an der Darstellung.

## 9. Fehler als Form

- Wayback/CDX nach Retry/Backoff nicht erreichbar ⇒ *„Quelle nicht erreichbar — Feststellung
  entfällt."*; der Tag wird ehrlich als unvollständig markiert, nicht still übersprungen.
- Erfassungslücke (zwischen unseren Snapshots existiert kein Vorher/Nachher) ⇒ als
  *„nicht feststellbar"* vermerkt, kein erfundener Diff.
- Extraktion liefert leeren Haupttext ⇒ Eintrag wird verworfen, nicht als Entfernung gewertet.

## 10. Grenzen (prominent im Methodenblatt)

- **Umschreibung ≠ Vertuschung — kein Absichts-Claim.** Legitime Korrekturen kommen vor und
  werden *nicht* von Unterdrückung unterschieden. Das Instrument behauptet keine Absicht.
- Die **Seed-Liste ist eine redaktionelle Wahl** (dokumentiert; das Instrument misst, was es
  beobachtet, nicht „das Internet").
- **Wayback-Erfassungsbias**: wir messen gegen *verfügbare* Captures; was nie erfasst wurde,
  bleibt unsichtbar (ehrlich vermerkt).
- **Text-Extraktion ist heuristisch** (Version offengelegt; kann Inhalt verfehlen/mis-segmentieren).
- **Salienz-Regeln sind eine gesetzte, offengelegte Wahl** (versioniert).

## 11. Avantgarde-Latte (Linien-Kriterien §2 Gegenmessung)

- **Ableiten, nicht abbilden:** das Artefakt ist der *Diff* zweier Archiv-Zustände — eine
  Inferenz über das Verschwinden, kein gerenderter Datensatz.
- **Verbinden, was niemand verbindet:** ein Archiv gegen sich selbst diffen und das
  Weggenommene auf einer kuratierten offiziellen Liste heben — der Join ist die Neuheit.
- **Die Maschine findet die Frage:** jeden Tag eine andere Schwärzung, von der Stunde gewählt.

## 12. Substanz-Gate (Werkgruppe §2)

1. **Echte Daten + Provenienz** — Wayback Machine, zwei datierte Permalinks je Fund. ✓
2. **Eine Frage, kein Effekt** — „Was wurde entfernt?" ist überprüfbar. ✓
3. **Infrastruktur als Aussage** — ein Werk übers Erinnern, gebaut auf einem Archiv, im
   Git-Archiv. ✓
4. **Leave-behind** — offener Code, committete Tages-JSONs, dokumentierte Methode, versionierte
   Seed-Liste + Salienz-Regeln. ✓
5. **Verhältnismäßigkeit** — eine freie API, statisch gerendert, kein Spektakel. ✓

## 13. Pipeline & Technik

- Python-Schritt im Muster von `pipelines/protokoll/` (eigener Adapter `redaction/`):
  CDX abrufen → Status/Digest auswerten → Snapshots ziehen → Haupttext extrahieren → diffen →
  Entfernungen + Salienz rechnen → Tages-JSON → Commit (etabliertes Committer-Muster,
  GitHub-API) → Pages-Rebuild.
- **Orchestrierung: nächtlich via GitHub Actions** (wie die migrierten Gegenmessungs-Pipelines),
  kadenz täglich, fester Zeitslot.
- **Determinismus + Testschutz:** Diff-, Entfernungs- und Salienz-Funktionen sind deterministisch
  und unit-getestet mit Fixtures (Muster: Half-Life/Policy/`render.test.ts`). Salienz-Gewichte
  und Ranking stehen unter Testschutz.

## 14. Frontend & Routing

- **Name:** Titel „The Redaction" (EN-Konvention wie The Consensus/The Correction), Untertitel
  DE/EN; deutsche Lesart „Das Schwärzen" im Fließtext.
- Route `/redaction` (+ EN-Spiegel), Methodenblatt unter `/werke/redaction`.
- Eintrag in `src/data/werke.ts` (Linie Gegenmessung), Lab-Eintrag, OG-Bild (Slug-Mapper
  ergänzen), **DE/EN ab Tag eins**.
- Darstellung: die Tagesschwärzung mit durchgestrichener entfernter Passage, beide Wayback-
  Permalinks, Salienz-Signale, Redaction-Index; darunter die weiteren Funde des Tages.
  Mono-Ästhetik, Dokumenten-Typografie.

## 15. Tests

Adapter-Tests mit Fixtures (CDX-Antworten, zwei HTML-Snapshots), Diff-/Salienz-Unit-Tests,
Ranking-Test (Boilerplate-Gate), Renderer-Snapshot-Tests (DE+EN), lokaler Trockenlauf
(rendert heute, committet nichts) im Muster `protokoll:dry`.

## 16. Nicht-Ziele (YAGNI)

- Kein LLM in v1 (symbolische Salienz genügt; LLM-Klassifikation der Entfernungs-Art ist eine
  dokumentierte, gegen den Diff zu verifizierende v2-Option).
- **Kein Absichts-/Vertuschungs-Vorwurf** — nie.
- Kein RSS in v1 (später optional, wie beim Protokoll).
- Keine Echtzeit; kein dynamisches Lesen zur Laufzeit der Site.
- Kein eigenes Crawling jenseits der Seed-Liste.

## 17. Offene Punkte (für den Implementierungsplan)

- Konkrete **Startliste** (~30–60 URLs, Institutionen) inkl. Wayback-Erfassungsdichte-Prüfung.
- **Salienz-Gewichte** je Signal (Startwerte, `SALIENCE_VERSION=1`).
- **Schwellen:** Mindest-entfernte-Token, ab denen eine „Entfernung" als Fund zählt; Zeitfenster
  der CDX-Abfrage (z. B. letzte 24–48 h vs. seit letztem Lauf).
- **Extraktionsbibliothek** final wählen (trafilatura vs. readability-lxml) + Versionspinnung.
- Eigenname-Heuristik: reine Großschreibungsregel vs. kleiner Gazetteer.
