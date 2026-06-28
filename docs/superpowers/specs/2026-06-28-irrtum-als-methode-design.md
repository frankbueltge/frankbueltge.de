# Irrtum als Methode — eine Maschine als künstlerische Forscherin

**Datum:** 2026-06-28
**EN-Titel:** *Error as Method*
**Status:** Design, abgenommen im Brainstorming (Frank ↔ Claude)
**Art:** Neues, eigenständiges Werk der Akte — der reflexive Schlussstein
**Vorläufer-Specs:** `2026-06-11-werkgruppe-design.md` (§2 Substanz-Kriterien),
`2026-06-20-ehrliche-umrahmung-design.md` (Rahmung), `2026-06-22-gegenmessung-echo-design.md`
(KI als Material *und* Gegenstand)

## Motivation — die ehrliche Lücke

Die bisherigen Werke der Akte sind **Messinstrumente**: sie erheben je eine prüfbare Behauptung
über die Welt. Das ist solide Mess-Strenge — aber es ist noch keine *künstlerische Forschung*.
Künstlerische Forschung ist Erkenntnis **durch** die Praxis: die Form ist die Methode, das Werk
entdeckt etwas, das anders nicht erreichbar wäre, und es **befragt sich selbst.** Den Instrumenten
fehlen drei Dinge: eine **Linie** (ein Argument mit Rückgrat statt Kennzahlen), **Ereignisse**
(Brüche, ein Puls), **Reflexivität** (es untersucht sein eigenes Tun).

*Irrtum als Methode* schließt genau diese Lücke — nicht durch ein weiteres Instrument, sondern
durch ein Werk, in dem eine **Maschine den Beruf der künstlerischen Forscherin ausübt**: täglich,
an der ganzen Akte, mit These und Widerlegung. Sie ist **Werkzeug und Gegenstand zugleich** — sie
forscht, und ihre eigene, fehlbare Methode ist das, was untersucht wird.

## Forschungsfrage

> Kann eine Maschine künstlerische Forschung betreiben — und ist der **dokumentierte Irrtum**
> selbst eine Methode?

Das Werk *behauptet* die Antwort nicht. Es **vollzieht den Versuch** und stellt sein Scheitern aus.
Die verworfenen Thesen sind nicht Abfall, sondern das Korpus: Fehlbarkeit ist nicht Bug, sondern
Werk und Messung. Der Titel ist die These.

## Substanz-Check (gegen `werkgruppe-design.md` §2)

| Kriterium | Erfüllung |
|---|---|
| 1 Echte Daten, offene Provenienz | Material ist die committete Akte (alle Instrumente); jede Eingabe verlinkt. |
| 2 Eine Frage, kein Effekt | Die Forschungsfrage oben — prüfbar **als Prozess**: jeder Schritt auditierbar. |
| 3 Infrastruktur als Aussage | Modell/Prompt/Methode/Compute offengelegt; die Unzuverlässigkeit ist der Gegenstand. |
| 4 Konsequenz / Leave-behind | Offener Code, offene Sitzungs-Records, dokumentierte (gescheiterte) Methoden. |
| 5 Verhältnismäßigkeit | Reduktion: *ein* Tag = *eine* Methode, *eine* These, *ein* Verdikt. |

**KI-Ethik des Labs (bindend):** „KI als ausgewiesenes, prüfbares Werkzeug UND als
Untersuchungsgegenstand — nie als unbelegtes Orakel, das Fabrikation als Fakt ausgibt." Dieses Werk
ist der Reinfall dieser Ethik: Es macht die Orakel-Gefahr zum **Thema** und erschlägt sie durch den
eingebauten Widerlegungs-Schritt.

## Das Material

Der wachsende Körper der **ganzen Akte**: die committeten Daten aller Instrumente
(`protokoll`, `consensus`, `correction`/revision, `tell`, `ghost-fleet`, `redaction`,
`round-number`, `pattern`, `parallaxe`, `police`/prämie). Gelesen wird ausschließlich aus dem
Repo (Git ist das Archiv) — kein Live-Zugriff auf Cloud-Dienste. Die Maschine erforscht also nicht
„die Welt", sondern **die Vermessung der Welt durch die Akte** — maximal reflexiv und geerdet.

## Der Tageszyklus (das Atom des Werks)

Jede Nacht eine Forschungssitzung in fünf Schritten; alles wird protokolliert:

1. **Material-Sichtung (ML).** Ein statistischer/ML-Lauf über das Akte-Korpus hebt Kandidaten
   hervor: Korrelationen, Anomalien, wiederkehrende Strukturen. Verfahren und Eingabedaten werden
   geloggt. (Kein Deep-Learning-Zauber nötig — auditierbare Verfahren bevorzugt.)
2. **Methodenwahl (Katalog).** Die Forscherin wählt **eine benannte AR-Methode** aus einem offenen
   Katalog und deklariert sie samt Begründung.
3. **Thesenbildung (LLM).** Durch die Linse dieser Methode formt sie **eine** These über die Akte —
   eine Deutung, eine Behauptung, eine Umrahmung — und benennt die exakten Daten, auf die sie sich
   stützt. Die These ist ausdrücklich als **Konjektur** markiert, nicht als Fakt.
4. **Widerlegung (symbolisch + gegnerisch).**
   - Ein **symbolischer/statistischer Prüfer** testet die faktischen/quantitativen Teilbehauptungen
     gegen die echten Daten (existiert die zitierte Korrelation? hält sie einem Permutationstest
     stand? stimmen die Zahlen?). Symbolische KI, weil **inspizierbar**.
   - Ein **gegnerischer Kritiker (LLM, eigene Rolle)** greift die These an: getragen oder
     Kunstsprech? sagt das Material das wirklich?
5. **Verdikt & Commit.** *überlebt / widerlegt / unentschieden*, mit dem ganzen Angriff. Widerlegtes
   wird **nicht versteckt**, sondern als dokumentierter Irrweg ins Korpus gefilt. Die ganze Sitzung
   (Material, Methode, These, Beleg, Angriff, Verdikt, das Verworfene) wird als **unveränderliches
   Tages-JSON** committet (Autorin-Identität analog „Protokollführung").

**Kein Backfill:** jede Sitzung ist live; eine rückdatierte Forschung wäre eine Lüge im Archiv.
Eine falsche These von Tag 5 bleibt für immer stehen — das ist der Punkt.

## Die KI-Rollen (und warum prüfbar)

| Rolle | Technik | Aufgabe | Prüfbarkeit |
|---|---|---|---|
| Sichterin | ML/Statistik | Muster-/Anomalie-Kandidaten im Korpus | Verfahren + Daten geloggt |
| Forscherin | LLM | Methodenwahl + Thesenbildung (Konjektur) | Modell/Prompt/Methode offen |
| Prüfer | **symbolische KI** | faktische/statistische Teilbehauptungen testen | Regeln inspizierbar |
| Kritiker | LLM (eigene Rolle) | adversariale Widerlegung | Prompt offen |

Die interpretierenden LLM-Aussagen werden **nie als Fakt** gezeigt — nur die symbolisch/statistisch
geprüften Teilbehauptungen tragen den Status „belegt". Die Nicht-Determiniertheit des LLM wird nicht
kaschiert: Modell/Seed/Prompt liegen offen, und die Unzuverlässigkeit ist Teil der Ausstellung.

## Methoden-Katalog & der Bogen (die Linie)

Ein **offener, benannter Katalog** real existierender AR-Methoden — z. B. practice-based research,
a/r/tography, Kartografie/Diagrammatik, material thinking, Institutionskritik, design fiction,
Autoethnografie, Daten-Poetik — je Tag eine deklariert; spekulative/erfundene Methoden ausdrücklich
erlaubt (als solche markiert).

**Gedächtnis (das Rückgrat).** Die Maschine liest ihre eigenen Vortage, kritisiert alte Thesen und
führt ein **„Methodenheft".** Über Wochen mutiert sie die geliehenen Methoden — aus den
*Irrtümern* — zu **einer eigenen, die sie benennt.** Diese Geburt einer Methode aus dem Scheitern
ist die Linie, die den bisherigen Instrumenten fehlt.

## Das Werk / Output (Aussehen in Worten)

Zwei Schichten; das konkrete Visuelle wird bei der Umsetzung gestaltet (kein Log-Dump):

- **(a) Der Forschungstag** — ein komponiertes Blatt: Methoden-Badge · die These (als Konjektur
  markiert) · der verlinkte Beleg aus der Akte · der gegnerische Angriff · das Verdikt · und,
  gleichwertig sichtbar, **das Verworfene**.
- **(b) Der wachsende Körper** — das Archiv aller Sitzungen; die **Methodenheft-Ansicht** (die
  entstehende eigene Methode); eine **Meta-Ansicht der Reise:** Quote überlebt/widerlegt (die
  *Irrtumsrate* — sie ist die Messung und der Titel), welche Methoden, die Annäherung an die eigene
  Methode.

## Architektur

- **Neue Pipeline** `pipelines/irrtum/` (Python), nächtlicher GitHub-Actions-Workflow, liest das
  committete Akte-Korpus, führt den Zyklus aus, committet ein Sitzungs-JSON →
  `src/content/irrtum/<jahr>/<datum>.json` (neue Content-Collection, Zod-Schema). Pages-Rebuild.
- **Frontend:** Werk-Seite (`/irrtum-als-methode`, EN-Spiegel) + Methodenblatt (`/werke/...`) +
  Eintrag in `src/data/werke.ts`. Liest die Sitzungs-JSONs wie die anderen Werke.
- **Secrets:** LLM-Key (z. B. GEMINI_API_KEY, AI-Studio-Free-Tier, wie Parallaxe) als
  Actions-Secret; nie in Records/Fehlermeldungen.
- **Git als Archiv, unantastbar:** Sitzungen werden nie editiert; Korrekturen nur an der Darstellung.

## Umfang / MVP (erster Schnitt)

Beweise die Schleife, bevor du auffächerst. MVP:
1. Korpus-Lader (liest die committeten Akte-Daten).
2. *Eine* ML-Sichtung (z. B. Korrelations-/Anomalie-Lauf mit Permutationstest — Muster aus `pattern`
   wiederverwendbar).
3. *Eine* Methode aus dem Katalog, Thesenbildung (LLM), symbolische Prüfung + *ein* adversarialer
   Kritik-Schritt, Verdikt.
4. Sitzungs-Record committen; das Tagesblatt rendern; voller Audit-Trail sichtbar.

**Später (eigene Schnitte):** voller Methoden-Katalog mit Rotation; Gedächtnis/Methodenheft-Evolution
(die eigene Methode); Meta-Ansicht der Reise; visuelle Gestaltung des Tagesblatts.

## Offene Detailpunkte (Plan-/Bauphase)

- Genaue Auswahl & Formalisierung des ML-Sichtungs-Laufs (welche Tests, welche Akte-Felder).
- Was der symbolische Prüfer konkret prüfen kann (nur quantitative Teilbehauptungen; alles
  Interpretative bleibt Konjektur).
- Schwelle für „widerlegt / unentschieden / überlebt".
- LLM-Wahl, Prompt-Disziplin, Reproduzierbarkeits-Offenlegung (Modell/Seed/Prompt im Record).
- Schema der Sitzungs-JSON; neue Content-Collection + Zod.

## Risiken (ehrlich)

- **Kunstsprech/Halluzination** — gemindert durch symbolische Erdung + adversarialen Schritt; was
  nicht prüfbar ist, bleibt sichtbar als Konjektur.
- **Kosten/Komplexität** — täglicher LLM+ML-Lauf; MVP klein halten.
- **„KI macht Kunst"-Gimmick-Falle** — der Ausweg ist die Strenge: auditierbarer Prozess, echtes
  Material, ausgestelltes Scheitern, Reflexivität. Nicht „die Maschine ist Künstlerin", sondern „die
  Maschine *versucht* es, transparent, und scheitert lehrreich".

## Änderungsprotokoll

- 2026-06-28: Erstfassung. Neues Werk *Irrtum als Methode*; KI als künstlerische Forscherin an der
  ganzen Akte; Tageszyklus Methode→These→Widerlegung; ML/symbolisch/LLM-Rollen; Methodenheft-Bogen;
  Fehlbarkeit als Gegenstand; MVP definiert.
