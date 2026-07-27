# Dataset Register — Neufassung des Zwecks

**Datum:** 2026-07-27 · **Status:** RICHTUNGSENTSCHEIDUNG (Frank) — Umsetzung offen
**Vorgänger:** `2026-07-26-dataset-hub-design.md` (Architektur bleibt gültig),
`2026-07-26-uebergabe-dataset-register.md` (Stand vom Vortag)

## 1. Was schieflief

Der Startauftrag sagte: „**Vollständigkeit im Rahmen des Möglichen: der größte
maschinenlesbare Nachweis öffentlich zugänglicher Datensätze.**" Danach wurde gebaut —
Aggregatoren zuerst, Masse vor Auswahl, am Ende der Bulk-Import von 56,6 Millionen
DataCite-Einträgen.

Frank am 27.07., nachdem die Größenordnungen sichtbar wurden:

> „wir sollten hart filtern und uns auf datensätze oder daten beschränken, die für meine
> arbeit und die research ecology sinn machen. dann hat die sammlung noch einen mehrwert
> und ist nicht einfach eine kopie von datcite, sondern eine meta datensammlung über
> viele öffentliche quellen — und das war die ursprüngliche idee, die vielleicht im plan
> nicht konkret transportiert wurde."

Das trifft zu. **Eine Teilmenge von DataCite ist wertlos**, weil DataCite selbst
vollständiger, aktueller und besser ausgestattet ist. Der Wert eines eigenen Registers
kann nur aus dem entstehen, was die Quellen NICHT tun.

## 2. Der neue Zweck

Eine **kuratierte Meta-Sammlung über viele öffentliche Quellen**, deren Mehrwert in vier
Dingen liegt, die kein einzelner Katalog leistet:

1. **Quellenübergreifend** — DataCite, Regierungsportale, ML-Plattformen, Geodaten,
   kuratierte Listen in einem Nachweis, mit Dedup über Quellgrenzen hinweg.
2. **Geprüft statt behauptet** — jeder Zugriffsweg wird tatsächlich aufgerufen; der
   Prüfstand steht am Eintrag. Kein Katalog der Welt tut das.
3. **Ausgewählt** — auf das, was für die Arbeit dieser Ökologie trägt. Keine
   Massenregistrierungen einzelner Beobachtungen.
4. **Lücken ausgewiesen** — was fehlt, warum es fehlt, was verworfen wurde und weshalb.

## 3. Was das konkret ändert

| | alt | neu |
|---|---|---|
| Ziel | größtmöglicher Nachweis | kuratierte Auswahl mit Mehrwert |
| Größenordnung | 56,6 Mio (bzw. 2,4 Mio ohne Massenherausgeber) | **Tausende bis wenige Zehntausend** |
| Aufnahme | alles, was die Schranken passiert | Schranken **plus** Relevanzkriterium |
| Unterseiten | eine je Eintrag | eine je Eintrag ist bei dieser Größe wieder unproblematisch |
| DataCite-Bulk | Bestandsgrundlage | **Rohmaterial zum Filtern**, nicht zum Aufnehmen |

**SEO/GEO:** Massenhaft dünne Seiten schaden der Domain, die Franks Werke trägt. Eine
kuratierte Sammlung mit einigen tausend inhaltsreichen Einträgen ist das Gegenteil —
wenige, gute, zitierfähige Seiten.

## 4. Offene Frage: was ist das Relevanzkriterium?

**Das ist die eigentliche Arbeit der nächsten Sitzung** und Franks Entscheidung. Der
Vorschlag zur Reaktion, entlang der Themen der Ökologie (Daten, KI und Macht; Messung;
Gegenmessung; Datenkunst):

- **Gegenstand:** Datensätze über KI-Systeme, ihre Trainingsdaten und Bewertung;
  über Macht (Verwaltung, Vergabe, Lobbyismus, Überwachung, Militär, Klimapolitik);
  amtliche Statistik; Datensätze, die selbst eine umstrittene Messung sind.
- **Beschaffenheit:** brauchbar als Material — zeitliche oder räumliche Tiefe,
  offene Lizenz, bestätigter Zugriff, maschinenlesbares Format.
- **Ausgeschlossen:** Massenregistrierungen einzelner Beobachtungen (Experimentschüsse,
  Sammlungsbelege, Sequenzen, Fundmeldungen) — es sei denn, ein Eintrag bezeichnet die
  Sammlung statt des Einzelstücks.

Wie das Kriterium technisch greift, ist die zweite Frage: deterministisch (Herausgeber-,
Themen-, Formatlisten), per Urteilsroutine, oder zweistufig — deterministisch vorsieben,
Urteil entscheidet. Die Messung vom 27.07.
(`dataset-hub/messungen/ergebnisse/2026-07-27-dump-zusammensetzung.md`) legt nahe, dass
allein der Ausschluss von zehn Herausgebern 95,8 % entfernt.

## 5. Was bleibt

Die Architektur trägt weiter und muss nicht angefasst werden: Identitätsmodell,
Schema, Schranken, Dedup R1–R4, Register für Ablehnungen/Ausfälle/Messungen,
Snapshot-Vertrag, Gate G5 (Rechtslage), Prüfstand der Zugriffswege, Urteilsroutine,
das Abfrage-Werkzeug der Praxen. Auch die Adapter bleiben — sie ernten weiter, nur
entscheidet künftig ein Relevanzkriterium, was davon in den Bestand geht.

**Die 14 GB Rohmaterial des DataCite-Bulks bleiben liegen** — sie sind jetzt ein
Steinbruch, aus dem gezielt geholt wird, kein Bestand, der eingelesen werden will.

## 6. Nächste Schritte

1. Relevanzkriterium entscheiden (§4) — Frank.
2. Kennzeichnung der Massenherausgeber, damit Serien erkennbar sind.
3. Filter auf das Rohmaterial anwenden und messen, was übrig bleibt.
4. Bestand neu bauen, Site-Seiten entsprechend.
5. Erst danach: weitere Quellen (Regierungsportale, kuratierte Listen) — sie sind
   für eine kuratierte Sammlung wertvoller als noch mehr DataCite.
