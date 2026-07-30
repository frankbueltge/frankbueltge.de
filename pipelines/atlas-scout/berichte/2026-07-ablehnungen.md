# Ablehnungsverzeichnis — Juli 2026

Zeitraum dieses ersten Berichts: 2026-07-25 bis 2026-07-30, sechs Läufe — der Scout ist
erst mit der Erweiterung um die Felder 8–13 in Betrieb gegangen, ein voller Monat liegt
noch nicht vor. In diesen sechs Tagen wurden 1.331 Kandidaten verworfen (946 Theorie-,
385 Werke-Atlas). Der auffälligste Befund betrifft nicht die große Zahl, sondern eine
kleine: Am 27.07. hat die Urteilsschritte-Routine einen kompletten Stapel von 16
S+T+ARTS-Werken — darunter „Office for Tree Migration (OTM)" und „Origen, A Journey into
the Heart of the Amazon Rainforest", beides erkennbar einschlägige zeitgenössische
Datenkunst-Arbeiten — mit der Begründung „Feld None gibt es nicht" verworfen. Das ist kein
Qualitätsurteil, sondern ein technischer Fehlschlag: Die Routine hat keinem der 16 Werke
eine gültige Feldnummer zugeordnet, und `aufnahme.py::_feld_aus_saat` weist dann jeden
Kandidaten ab, dessen `ausgehend_von` keine gültige `thema-N`-Kennung trägt. Ein ganzer
Urteilsschritte-Lauf ist damit folgenlos verpufft. Die zweitgrößte Beobachtung ist
struktureller: Innerhalb der Nachbarschaftssuche des Theorie-Atlas gibt es vier Saatgut-Einträge
(Lucretius, Feyerabend, Motte/Oulipo, Deleuze), die über die ganze Woche eine Annahmequote
von 6–9 % halten — bei jeweils über 30 Anfragen. Das ist kein Ausreißer eines einzelnen
Laufs, sondern ein stabiles Muster.

## Grund × Quelle

| Quelle | unter-schwelle | bereits-im-atlas | identifier-nicht-aufloesbar | keine-feldzuordnung | Summe |
|---|---:|---:|---:|---:|---:|
| openalex (Theorie) | 705 | 9 | 232 | 0 | 946 |
| artbase (Werke) | 0 | 308 | 0 | 0 | 308 |
| starts (Werke) | 0 | 61 | 0 | 16 | 77 |
| **Summe** | **705** | **378** | **232** | **16** | **1.331** |

`unter-schwelle` kommt ausschließlich aus dem OpenAlex-Zweig — `score.py::gewichte()`
wird nur von `run.py` (Nachbarschaft/Sweep) und `extern.py` (externe Funde) aufgerufen.
Die kuratierten Werke-Quellen (`sammlungen.py`: ArtBase, dataphys, S+T+ARTS) durchlaufen
diesen Bewertungszweig gar nicht — sie scheitern ausschließlich am Abgleich
(„bereits-im-atlas") oder an harten Zulassungsregeln (Feld, Identifier). Die Frage „ist die
Gewichtung zu streng" stellt sich damit nur für den Theorie-Atlas.

## Anteil „bereits-im-atlas" je Quelle (Erschöpfungsgrad)

| Quelle | Anteil an allen Ablehnungen dieser Quelle | Verlauf über die Woche |
|---|---:|---|
| artbase | 308/308 = 100 % | jedes Feld liefert bei jedem erneuten Sweep ausschließlich Bekanntes: Feld 8 am 26.07. bereits 17/17, am 29.07. 39/39; Feld 10 am 27.07. 36/36, am 30.07. 36/36 |
| starts (ohne den Feldzuordnungs-Fehler) | 61/61 = 100 % | — |
| dataphys-liste | 4 (26.07.) → 15 (27.07.) → 18 (28.07.) → 24 (29.07.) | steigt Tag für Tag, weil die 431-Einträge-Liste statisch ist und zunehmend abgegrast wird |
| openalex | 9/946 = 1,0 % | irrelevant — OpenAlex ist kein erschöpfbares Register in diesem Sinn |

ArtBase liefert bei **jedem** wiederholten Feld-Sweep ausschließlich bereits bekannte
URLs — nicht nur im Mittel, sondern in jedem einzelnen beobachteten Lauf dieser Woche.
Ein Feld einmal zu sweepen genügt offenbar, um seinen ArtBase-Anteil vollständig
abzuschöpfen; jeder erneute Sweep desselben Feldes verbrennt seither ausschließlich
Prüfzeit. dataphys ist keine tote Quelle, sondern eine mit sinkendem Ertrag: die
Duplikatzahl wächst linear mit den Tagen, weil die 431 Einträge eine feste, nicht
wachsende Liste sind.

## Grund × Feld (Theorie-Atlas, thematischer Sweep)

| Feld | n verworfen | unter-schwelle | identifier-nicht-aufloesbar | bereits-im-atlas |
|---|---:|---:|---:|---:|
| 10 — Fehler & Rauschen | 126 | 42 | 11 | 73 |
| 11 — Körper & Intimität | 109 | 24 | 7 | 78 |
| 8 — Wahrnehmung & Maßstab | 90 | 30 | 4 | 56 |
| 9 — Zeit & Archiv | 83 | 20 | 9 | 54 |
| 12 — Sprache & Generativität | 57 | 29 | 8 | 20 |
| 13 — Material & Sinne | 45 | 9 | 8 | 28 |

Alle sechs neuen Felder (8–13) zeigen ein ähnliches Bild: Sobald ein Feld ein zweites Mal
gesweept wird, dominiert „bereits-im-atlas" (56–78 von ~90–130 Ablehnungen). Das ist der
gleiche Erschöpfungseffekt wie bei ArtBase, nur diesmal in der Theorie-Suche selbst.

## Nachbarschaftssuche (Theorie-Atlas): Annahmequote nach Saatgut

744 der 946 Theorie-Ablehnungen (79 %) stammen aus der Nachbarschaftssuche (saatgut-basiert,
nicht thematischer Sweep), nur 202 (21 %) aus dem Sweep. In absoluten Zahlen liefert die
Nachbarschaftssuche trotzdem mehr angenommene Kandidaten (270 gegen 108 beim Sweep) — sie
ist also nicht per se schwächer, sondern uneinheitlicher. Die Annahmequote (angenommen ÷
angenommen+verworfen) schwankt von Saatgut zu Saatgut zwischen 6 % und 63 %:

| Saatgut | angenommen | verworfen | Quote |
|---|---:|---:|---:|
| lucretius-de-rerum-natura | 4 | 66 | 6 % |
| feyerabend-against-method | 2 | 32 | 6 % |
| motte-oulipo-a-primer | 2 | 29 | 6 % |
| deleuze-difference-et-repetition | 3 | 32 | 9 % |
| … (Median der 32 Saatgut-Einträge) | | | ≈ 24 % |
| epstein-et-al-art-and-the-science-of-generative-ai | 22 | 13 | 63 % |
| audry-art-in-the-age-of-machine-learning | 16 | 17 | 48 % |
| rheinberger-epistemic-things | 16 | 19 | 46 % |

Die vier schwächsten Saatgut-Einträge sind nicht durch kleine Stichproben verzerrt — bei
Lucretius liegen 70 Anfragen zugrunde, bei Deleuze und Feyerabend jeweils über 30. Bei einer
Stichprobe der von diesen vier Saatgut-Einträgen verworfenen Titel fiel zusätzlich auf, dass
mehrere völlig fachfremde Treffer wiederholt auftauchen — u. a. ein Kirchenchor-Konzertprogramm
(„Susquehanna Chorale Spring Concert"), eine reine Mathematik-Arbeit („A Geometric Mean in
the Furuta Inequality") und ein Theaterspielplan-Eintrag („Kindertransport"), alle über die
Saatgut-Einträge mersch-epistemologien-des-aesthetischen, audry-art-in-the-age-of-machine-learning
und motte-oulipo-a-primer angebunden. Das sind keine knappen Verfehlungen (Score 0,0–0,2),
sondern Treffer, die inhaltlich nichts mit dem Saatgut zu tun haben — ein Hinweis darauf,
dass OpenAlex' „Related Works"-Verknüpfung für diese Einträge eher über geteilte Metadaten
(Zeitschrift, Zitierumfeld) als über thematische Nähe läuft.

## Beharrlich mehrfach abgewiesen (Werke-Atlas, Duplikate über mehrere Läufe)

Von 234 Titeln, die in mehr als einer Ablehnungsdatei auftauchen, gehören die zehn
häufigsten alle dem Werke-Atlas an und tragen ausnahmslos den Grund „bereits-im-atlas":
u. a. „IntroSpection", „memsweeper", „SL Dumpster", „cracked cities", „Inflat-o-scape",
„Mechanical Kurds", „The Call", „Harvesting Climate Action", „AI War Cloud Database", „She
is always walking away....... 1948 - 2006...." — jeweils viermal über die sechs Tage
abgewiesen. Das ist kein Hinweis auf ein Problem des Verfahrens, sondern die erwartbare
Kehrseite der Feld-Rotation: Wird ein Feld erneut gesweept, meldet ArtBase erneut denselben
Bestand.

## unter-schwelle im Theorie-Atlas: wie knapp ist „knapp"?

Von 705 unter-schwelle-Ablehnungen liegt der Mittelwert bei 0,222 (Schwelle 0,35), 14,6 %
liegen unter 0,15 (klar irrelevant), aber 25,4 % liegen bei 0,30 oder darüber — knapp am
Schnitt vorbei. Unter diesen knappen Fällen finden sich Titel, die inhaltlich eindeutig ins
Feld gehören: „My Data is a Mirror: Personal Data Physicalization & Practices of…" (0,348,
aus dem Loveless-Saatgut, direkt einschlägig für Datenphysikalisierung), Jane Bennetts
„Vibrant Matter: A Political Ecology of Things" (0,343, ein kanonischer New-Materialism-Text)
und Sandra Hardings „Methodology of the Oppressed" (0,343). Diese Fälle scheitern nicht an
fehlender Relevanz, sondern an der Gewichtung — vermutlich am „begriffsnähe"-Signal, das
strikt auf Überschneidung mit den Schlagworten des jeweiligen Saatgut-Eintrags misst und
kanonische Nachbartexte mit eigenem Vokabular systematisch unterbewertet.

## identifier-nicht-aufloesbar: fast nur HTTP 403

Von 232 Fällen im Theorie-Atlas sind 190 (82 %) HTTP 403, gefolgt von Verbindungsfehlern
(19), HTTP 405 (8), HTTP 503 (6), HTTP 404 (6) und HTTP 500 (3). Die Prüfung trifft damit
überwiegend nicht auf tote Links, sondern auf Verlage/Repositorien, die automatisierte
Anfragen aktiv blockieren — ein Mensch im Browser sähe die Seite vermutlich. Am stärksten
betroffen sind die Saatgut-Einträge shumailov-curse-of-recursion (15 von 18 Ablehnungen
identifier-nicht-aufloesbar) und loveless-how-to-make-art-at-the-end-of-the-world (18 von 46).
Das Werke-Atlas ist von diesem Problem nicht betroffen — dort fällt kein einziger Kandidat
aus diesem Grund, vermutlich weil ArtBase/S+T+ARTS-Kandidaten meist schon am Abgleich
scheitern, bevor die Identifier-Prüfung überhaupt läuft.

## Vorschläge

1. **ArtBase-Sweeps drosseln.** Jeder wiederholte Sweep eines bereits einmal bearbeiteten
   Feldes lieferte in dieser Woche 100 % Duplikate (308/308 über sechs beobachtete
   Feld-Läufe). Ein Feld erneut zu sweepen, bevor sich der ArtBase-Bestand messbar
   verändert hat, kostet nur Prüfzeit. Ein Rhythmus von z. B. einmal pro Feld und Monat
   statt pro Woche würde den Ertrag nicht senken, aber die verbrannten 308 Prüfläufe
   vermeiden.

2. **Feldzuordnungs-Bug der Urteilsschritte-Routine beheben.** Der Lauf vom 27.07. hat
   16 von 16 S+T+ARTS-Kandidaten mit `ausgehend_von: thema-1-material-planetare-ki-kosten`
   und faktisch fehlender Feldnummer markiert, obwohl S+T+ARTS laut README ohnehin nur
   für die Felder 8–13 läuft — Feld 1 gehört zur Familie „macht" und kommt für Werke aus
   dieser Quelle gar nicht in Frage. Das deutet auf einen Default-/Fallback-Fehler in der
   Routine (vermutlich der erste Eintrag der Saatgut-Liste als Notlösung), nicht auf ein
   Problem dieses Repos. Das ist kein Code-Vorschlag für dieses Repo, sondern ein Hinweis
   an die Routine selbst.

3. **Vier Nachbarschafts-Saatguteinträge neu bewerten oder ersetzen.** Lucretius (6 % Quote,
   n=70), Feyerabend (6 %, n=34), Motte/Oulipo (6 %, n=31) und Deleuze (9 %, n=35) sammeln
   zusammen 161 Ablehnungen bei nur 9 angenommenen Kandidaten. Das ist kein Rauschen einer
   kleinen Stichprobe. Zwei Möglichkeiten: entweder diese vier Saatgut-Einträge seltener
   erneut befragen, oder — da die verworfenen Titel teils fachfremd sind (Chorkonzert,
   Ungleichungs-Beweis, Theaterspielplan) — prüfen, ob OpenAlex' Related-Works-API für
   diese vier tatsächlich thematische Nähe liefert oder nur geteilte Zitierumgebung.

4. **`begriffsnaehe`-Gewicht im Theorie-Zweig von `score.py` überprüfen.** 25,4 % der
   unter-schwelle-Fälle liegen bei ≥0,30, darunter mit „Vibrant Matter" und „Methodology of
   the Oppressed" zwei kanonische, klar einschlägige Werke. Das ist kein Aufruf, die
   Schwelle pauschal zu senken (das würde auch die 14,6 % eindeutig irrelevanten Treffer
   unter 0,15 hereinlassen), sondern ein Hinweis, dass das Begriffsnähe-Signal — das strikt
   an den Schlagworten des jeweiligen Saatgut-Eintrags misst — nah verwandte, aber
   vokabularfremd formulierte Texte systematisch bestraft.

## Was dieser Bericht nicht sagen kann

Sechs Tage sind kein Monat — die Verlaufsangaben (z. B. der steigende dataphys-Anteil)
zeigen einen Trend über vier bis sechs Beobachtungen, nicht über Wochen. Ob sich die
ArtBase-Erschöpfung oder die schwachen Nachbarschafts-Saatguteinträge stabil halten oder
Zufall dieser ersten Woche sind, lässt sich erst mit weiteren Monatsberichten sagen. Die
Ablehnungsdaten enthalten keine URLs, nur Titel und Herkunft — welche konkreten Verlage
hinter den 190 HTTP-403-Fällen stehen, lässt sich aus den Kandidatendateien selbst nicht
rekonstruieren. Und die Identifier-Prüfung sagt laut README ohnehin nur, dass ein Ziel
antwortet, nicht dass Titel, Urheber und Jahr stimmen — dieser Bericht kann nur zählen, was
verworfen wurde, nicht beurteilen, ob unter den 378 vorgelegten Theorie- und 410 vorgelegten
Werke-Kandidaten dieser Woche Fehlzuschreibungen stehen, die die Prüfschranke nicht
gefangen hat.
