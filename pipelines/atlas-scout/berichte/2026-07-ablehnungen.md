# Ablehnungsverzeichnis — Juli 2026

Der Scout ist am 2026-07-25 mit der Erweiterung um die Felder 8–13 in Betrieb gegangen;
Juli liefert damit sieben Betriebstage (25.–31.7.), keinen vollen Monat. In diesen sieben
Nächten wurden 871 Kandidaten aufgenommen bzw. vorgeschlagen und 1.632 verworfen (1.150
Theorie-, 482 Werke-Atlas). Der auffälligste Befund ist keine der großen Zahlen, sondern
ein Kollaps über drei nächtliche Durchläufe: Für alle sechs neuen Felder zusammen lieferte
der jeweils erste ArtBase-Sweep (25.7.) 202 von 202 Kandidaten als neu (100 %), der zweite
Durchlauf je Feld (zwei bis drei Tage später) nur noch 48 von 202 (24 %), und der dritte
Durchlauf je Feld exakt 0 von 202 (0 %) — für alle sechs Felder gleichermaßen. ArtBase ist
damit binnen einer Woche pro Feld vollständig abgeschöpft; jeder weitere nächtliche Sweep
verbrennt seither reine Prüfzeit ohne jeden Neufund. Der zweitgrößte Befund betrifft die
Nachbarschaftssuche des Theorie-Atlas:
Vier Saatgut-Einträge — Lucretius, Feyerabend, Barrett/Bolt und Motte/Oulipo — halten bei
jeweils über 30 Anfragen eine Annahmequote von nur 6 %, während andere Saatgut-Einträge
(Epstein et al., Audry, Rheinberger) bei ähnlicher Anfragezahl 44–63 % erreichen. Und ein
kompletter Stapel von 16 S+T+ARTS-Werken — darunter erkennbar einschlägige Titel wie
„Ocean Futurisms", „SymbiOcean" und „Terp 360: Embodied AI for Expressive Sign Language" —
scheiterte am 27.7. nicht an Qualität, sondern daran, dass ihnen schlicht keine Feldnummer
zugeordnet wurde.

## Grund × Quelle

| Quelle | unter-schwelle | bereits-im-atlas | identifier-nicht-aufloesbar | keine-feldzuordnung | Summe |
|---|---:|---:|---:|---:|---:|
| openalex (Theorie) | 831 | 23 | 296 | 0 | 1.150 |
| artbase (Werke) | 0 | 356 | 0 | 0 | 356 |
| starts (Werke) | 0 | 110 | 0 | 16 | 126 |
| **Summe** | **831** | **489** | **296** | **16** | **1.632** |

`unter-schwelle` und `identifier-nicht-aufloesbar` kommen ausschließlich aus dem
OpenAlex-Zweig (Theorie-Atlas). Die kuratierten Werke-Quellen ArtBase und S+T+ARTS
durchlaufen `score.py::gewichte()` gar nicht — sie scheitern ausschließlich am Abgleich
gegen den Bestand oder an der harten Feldregel. Die Frage „ist die Gewichtung zu streng"
stellt sich damit nur für den Theorie-Atlas; für den Werke-Atlas ist die relevante Frage
eine andere: wie schnell ist eine Quelle ausgeschöpft.

## Grund × Feld (thematischer Sweep, Felder 8–13)

628 der 1.632 Ablehnungen (38 %) lassen sich einem der 13 Felder zuordnen — die übrigen
62 % stammen aus der saatgutbasierten Nachbarschaftssuche des Theorie-Atlas, die konstruktionsbedingt
kein Feld trägt (siehe README), sowie aus dem generischen S+T+ARTS/dataphys-Strom, der
seinerseits keine Feldangabe liefert (die 16 `keine-feldzuordnung`-Fälle sind entsprechend
oben, nicht unten gezählt). Von den 628 entfallen 615 auf die sechs neuen Felder 8–13
(Tabelle unten); die restlichen 13 verteilen sich auf einzelne Alt-Felder der Familie
„Macht" (1, 5, 6, 7), die im Juli kaum beackert wurden und ausnahmslos mit
`bereits-im-atlas` endeten.

| Feld | n verworfen | unter-schwelle | identifier-nicht-aufloesbar | bereits-im-atlas |
|---|---:|---:|---:|---:|
| 10 — Fehler & Rauschen | 178 | 81 | 22 | 75 |
| 11 — Körper & Intimität | 110 | 24 | 7 | 79 |
| 8 — Wahrnehmung & Maßstab | 92 | 30 | 4 | 58 |
| 9 — Zeit & Archiv | 83 | 20 | 9 | 54 |
| 12 — Sprache & Generativität | 77 | 29 | 8 | 40 |
| 13 — Material & Sinne | 75 | 9 | 8 | 58 |

Feld 10 (Fehler & Rauschen) sammelt in absoluten Zahlen mit Abstand die meisten
Ablehnungen und ist zugleich das einzige der sechs neuen Felder, in dem `unter-schwelle`
(81) vor `bereits-im-atlas` (75) liegt — hier wird also nicht nur wiederholt, sondern auch
viel vorgeschlagen, das die Schwelle gar nicht erst erreicht. In den übrigen fünf Feldern
dominiert durchgängig `bereits-im-atlas` mit 52–77 % Anteil.

## Erschöpfungsgrad: akzeptiert vs. verworfen je Lauf und Quelle

**ArtBase**, Feld für Feld, alle drei Juli-Durchläufe:

| Feld | 1. Sweep (Datum) | 2. Sweep (Datum) | 3. Sweep (Datum) |
|---|---|---|---|
| 8 | 39 akz. / 0 verw. (25.7.) | 22 akz. / 17 verw. (26.7.) | 0 akz. / 39 verw. (29.7.) |
| 9 | 39 akz. / 0 verw. (25.7.) | 24 akz. / 15 verw. (26.7.) | 0 akz. / 39 verw. (29.7.) |
| 10 | 36 akz. / 0 verw. (25.7.) | 0 akz. / 36 verw. (27.7.) | 0 akz. / 36 verw. (30.7.) |
| 11 | 40 akz. / 0 verw. (25.7.) | 2 akz. / 38 verw. (27.7.) | 0 akz. / 40 verw. (30.7.) |
| 12 | 20 akz. / 0 verw. (25.7.) | 0 akz. / 20 verw. (28.7.) | 0 akz. / 20 verw. (31.7.) |
| 13 | 28 akz. / 0 verw. (25.7.) | 0 akz. / 28 verw. (28.7.) | 0 akz. / 28 verw. (31.7.) |
| **Summe** | **202 / 0 (100 %)** | **48 / 154 (24 %)** | **0 / 202 (0 %)** |

Felder 12 und 13 fallen bereits beim zweiten Durchlauf auf 0 % — sie wurden seither kein
einziges Mal noch mit einem neuen Fund belohnt. Felder 8 und 9 lieferten beim zweiten Sweep
noch 56 % bzw. 62 %, Feld 11 nur noch 5 % (2 von 40); beim dritten Durchlauf liegen alle
sechs Felder ausnahmslos bei 0 %. Die Rundensummen (202 → 48 → 0) sind zudem über alle drei
Durchläufe exakt gleich groß (202 Kandidaten je Runde) — ein Indiz, dass die
ArtBase-Abfrage je Feld-Stichwort jedes Mal denselben, unpaginierten Treffersatz
zurückgibt und nur der Abgleich gegen den wachsenden Bestand entscheidet, wie viel davon
noch als neu zählt.

**S+T+ARTS** (Quelle „starts", Werke-Atlas) zeigt denselben Trend graduell statt abrupt.
Der fortlaufende Strom-Crawl (Abfrage `starts:2025`/`starts:2026`, getrennt von den
manuell gelesenen Funden) fällt über fünf beobachtete Nächte von 90 % (26.7., 36 von 40)
über 62 % (27.7.) und 55 % (28.7.) auf 40 % (29.7.) und zuletzt 22 % (31.7., 9 von 40). Die
Quelle ist nicht erschöpft wie ArtBase, aber der Ertrag pro Nacht sinkt über die Woche
stetig.

**dataphys** wurde im Juli nur einmal abgefragt (26.7., 39 von 39 akzeptiert) — für eine
Erschöpfungsaussage fehlt hier ein zweiter Durchlauf.

**openalex** ist strukturell nicht erschöpfbar in diesem Sinn: `bereits-im-atlas` liegt
konstant bei 2 % (23 von 1.150), die übrigen Ablehnungen sind inhaltliche
(`unter-schwelle`) oder technische (`identifier-nicht-aufloesbar`) Gründe, kein
Wiederholungseffekt.

## Nachbarschaftssuche (Theorie-Atlas): Annahmequote nach Saatgut

Von 33 Saatgut-Einträgen mit mindestens 15 Anfragen im Juli liegen vier deutlich unter dem
Rest:

| Saatgut | akzeptiert | verworfen | Quote |
|---|---:|---:|---:|
| lucretius-de-rerum-natura | 4 | 66 | 6 % |
| feyerabend-against-method | 2 | 32 | 6 % |
| barrett-bolt-practice-as-research | 2 | 32 | 6 % |
| motte-oulipo-a-primer | 2 | 29 | 6 % |
| deleuze-difference-et-repetition | 3 | 32 | 9 % |
| … Median der 33 Einträge | | | ≈ 23 % |
| audry-art-in-the-age-of-machine-learning | 16 | 17 | 48 % |
| rheinberger-epistemic-things | 16 | 19 | 46 % |
| epstein-et-al-art-and-the-science-of-generative-ai | 22 | 13 | 63 % |

Die vier schwächsten Einträge sind nicht durch kleine Stichproben verzerrt (34–70 Anfragen
je Eintrag) und liegen mit 6–9 % weit unter dem Median von rund 23 %. Unter den von ihnen
verworfenen Titeln finden sich wiederholt fachfremde Treffer — ein Kirchenchor-Programm
(„Susquehanna Chorale Spring Concert"), ein reiner Ungleichungsbeweis („A Geometric Mean in
the Furuta Inequality") und ein Theaterspielplan-Eintrag („Kindertransport") — ein Hinweis,
dass OpenAlex' Related-/Cites-Verknüpfung für diese vier Saatgut-Einträge eher über
geteilten Zitierkontext als über thematische Nähe läuft.

## Beharrlich mehrfach abgewiesen

394 der 1.130 einzigartigen verworfenen Titel im Juli tauchen an mehr als einem Kalendertag
auf. 173 davon ausschließlich mit dem Grund `bereits-im-atlas` (erwartbare Kehrseite
wiederholter ArtBase-/S+T+ARTS-Sweeps, s. o.) — aber 214 Titel wurden mehrfach verworfen,
ohne dass `bereits-im-atlas` je der Grund war, also aus inhaltlichen oder technischen
Gründen wiederholt vorgeschlagen und wiederholt abgewiesen:

| Titel | n | Grund | Herkunft |
|---|---:|---|---|
| Susquehanna Chorale Spring Concert "Roots and Wings" | 5 | unter-schwelle | openalex |
| What Do We Critique When We Critique Technology? | 4 | unter-schwelle | openalex |
| ФОРМИРОВAНИЕ ГОТОВНОСТИ … (russ.) | 4 | identifier-nicht-aufloesbar | openalex |
| FEATURES AND DIFFERENCES OF ADEQUATE AND EQUIVALENT TRANSLATION | 4 | unter-schwelle | openalex |
| Коммуникaтивно-прaгмaтический aнaлиз … (russ.) | 4 | unter-schwelle | openalex |
| "Kindertransport," Oct. 5, 6, and 7, 8:00 p.m. | 4 | unter-schwelle | openalex |
| A GEOMETRIC MEAN IN THE FURUTA INEQUALITY | 4 | unter-schwelle | openalex |
| DETERMINING QUALITY REQUIREMENTS AT THE UNIVERSITIES … | 4 | identifier-nicht-aufloesbar | openalex |

Diese Wiederholer entstehen, weil dieselben Saatgut-Einträge in mehreren Läufen erneut
denselben (thematisch entfernten) Nachbarschaftsraum abfragen und dabei dieselben
Randtreffer erneut hochspülen — ein Nebeneffekt der oben genannten schwachen
Saatgut-Einträge, nicht ein eigenständiges Problem.

## unter-schwelle im Theorie-Atlas: wie knapp ist „knapp"?

Von 831 `unter-schwelle`-Ablehnungen (Schwelle 0,35) liegen 122 (14,7 %) unter 0,15 —
klar irrelevant — aber 201 (24,2 %) bei 0,30 oder darüber, also knapp am Schnitt vorbei.
Unter diesen knappen Fällen (≥0,32) stehen Titel, die inhaltlich erkennbar ins jeweilige
Feld gehören: „My Data is a Mirror: Personal Data Physicalization & Practices of
Positional-Reflexivity" (0,348, aus dem Loveless-Saatgut — direkt einschlägig für
Datenphysikalisierung), Jane Bennetts „Vibrant Matter: A Political Ecology of Things"
(0,343, ein kanonischer New-Materialism-Text, aus dem Barad-Saatgut) und Sandra Hardings
„Methodology of the Oppressed" (0,343, aus dem Haraway-Saatgut). Diese drei scheitern
nicht an fehlender Relevanz, sondern vermutlich an der Begriffsnähe-Gewichtung, die strikt
auf Überschneidung mit den Schlagworten des jeweiligen Saatgut-Eintrags misst und
kanonische Nachbartexte mit eigenem Vokabular systematisch unterbewertet.

## identifier-nicht-aufloesbar: fast nur HTTP 403, konzentriert bei wenigen Saatgut-Einträgen

Von 296 Fällen sind 244 (82 %) HTTP 403, dazu 9 HTTP 405, 7 HTTP 503, 7 HTTP 404, 3 HTTP
500, 1 HTTP 429 und 25 Verbindungsfehler ohne auswertbaren Code. Die Prüfung trifft damit
überwiegend nicht auf tote Links, sondern auf Verlage/Repositorien, die automatisierte
Anfragen aktiv blockieren. Das Problem verteilt sich nicht gleichmäßig: Beim Saatgut
`shumailov-curse-of-recursion` sind 15 von 18 Ablehnungen (83 %) `identifier-nicht-aufloesbar`,
bei `alemohammad-self-consuming-generative-models-go-mad` 11 von 15 (73 %) — beides
aktuelle ML-Preprints/Repositorien, während ältere, kanonische Saatgut-Einträge
(Lucretius, Cusanus, Perec) diesen Grund kaum zeigen. Der Werke-Atlas ist von diesem
Problem nicht betroffen — dort fällt kein einziger Kandidat aus diesem Grund, vermutlich
weil ArtBase- und S+T+ARTS-Kandidaten meist schon am Abgleich scheitern, bevor die
Identifier-Prüfung überhaupt läuft.

## keine-feldzuordnung: ein ganzer Lauf ohne Feld

Alle 16 Fälle dieses Grundes stammen aus einer einzigen Datei
(`kandidaten/werke/2026-07-27-gelesen.json`, Betriebsart „Gegenwartswerke"/S+T+ARTS) und
tragen im Detail wörtlich „Feld None gibt es nicht". Darunter erkennbar einschlägige
Gegenwartswerke: „Ocean Futurisms", „SymbiOcean", „The Data of Coca", „Terp 360: Embodied
AI for Expressive Sign Language" und „Brain Processing Unit — The Future Where Biology and
Computer Integrate". Das deckt sich mit der im README dokumentierten Lücke: S+T+ARTS
liefert keine Feldzuordnung, „die Kandidaten warten … auf den Urteilsschritt". Technisch
fällt zusätzlich auf, dass `extern.py` beim Einlesen von Funden ohne gültiges Feld
`ausgehend_von` auf `thema-1-material-planetare-ki-kosten` (den ersten Eintrag von
`THEMEN`) zurückfallen lässt — ein reiner Platzhalter ohne inhaltliche Bedeutung, der in
den Rohdaten so aussieht, als gehörten diese 16 Werke zu Feld 1. Dieser Bericht zählt sie
deshalb bewusst als „ohne Feld", nicht als Feld 1.

## Vorschläge

1. **ArtBase-Sweeps pro Feld drosseln.** Der dritte Durchlauf je Feld lieferte im Juli
   über alle sechs Felder hinweg ausnahmslos 0 neue Kandidaten (0 von 202, siehe Tabelle
   oben), bei den Feldern 12 und 13 bereits der zweite. Ein Rhythmus von etwa einmal pro
   Feld und Monat statt mehrmals pro Woche würde den Ertrag nicht senken, aber die Prüfzeit
   sparen, die aktuell allein im dritten Durchlauf in 202 Identifier-Prüfungen ohne jeden
   Neufund verbrannt wird.

2. **Feldzuordnung für S+T+ARTS-Funde vor der Aufnahme nachholen, nicht nach dem
   Fallback raten.** 16 von 16 Kandidaten aus dem Lauf vom 27.7. scheiterten an fehlender
   Feldnummer, obwohl mehrere davon inhaltlich erkennbar zu Feld 11 oder 12 gehören
   („Terp 360", „SymbiOcean"). Der stille Fallback auf `thema-1-material-planetare-ki-kosten`
   in `extern.py` (Zeile mit `next(iter(THEMEN))`) sollte durch ein explizites „kein Feld"
   ersetzt werden, das nicht wie eine Feld-1-Zuordnung aussieht — sonst verzerrt dieser
   Platzhalter künftige Auswertungen wie diese hier, sobald jemand `ausgehend_von` statt
   `grund` auswertet.

3. **Vier Nachbarschafts-Saatguteinträge neu bewerten.** Lucretius (6 %, n=70), Feyerabend
   (6 %, n=34), Barrett/Bolt (6 %, n=34) und Motte/Oulipo (6 %, n=31) sammeln zusammen 159
   Ablehnungen bei nur 10 angenommenen Kandidaten — bei Stichprobengrößen, die Zufall
   ausschließen. Zwei Wege: seltener erneut befragen, oder prüfen, ob OpenAlex' Related-/
   Cites-API für diese vier tatsächlich thematische Nähe liefert oder nur geteilten
   Zitierkontext (Indiz: fachfremde Treffer wie Chorkonzert und Ungleichungsbeweis, s. o.).

4. **Begriffsnähe-Gewicht in `score.py` für den Theorie-Zweig überprüfen.** 24,2 % der
   `unter-schwelle`-Fälle liegen bei ≥0,30, darunter mit „My Data is a Mirror", „Vibrant
   Matter" und „Methodology of the Oppressed" drei erkennbar einschlägige, teils kanonische
   Werke. Kein Aufruf, die Schwelle pauschal zu senken — das ließe auch die 14,7 % klar
   irrelevanten Treffer unter 0,15 herein —, sondern ein Hinweis, dass das
   Begriffsnähe-Signal vokabularfremd formulierte, aber thematisch nahe Texte
   systematisch unterbewertet.

## Was dieser Bericht nicht sagen kann

Sieben Tage sind kein Monat — ob sich die ArtBase-Erschöpfung, die schwachen
Nachbarschafts-Saatguteinträge oder der sinkende S+T+ARTS-Ertrag stabil halten oder Zufall
dieser ersten Betriebswoche sind, zeigt erst der Vergleich mit dem August-Bericht. Die
Ablehnungsdaten enthalten keine URLs, nur Titel und Herkunft — welche konkreten
Verlage/Repositorien hinter den 244 HTTP-403-Fällen stehen, lässt sich aus den
Kandidatendateien selbst nicht rekonstruieren, nur die Häufung bei bestimmten
Saatgut-Einträgen. Und die Identifier-Prüfung sagt laut README nur, dass ein Ziel
antwortet, nicht dass Titel, Urheber und Jahr stimmen — dieser Bericht kann zählen, was
verworfen wurde, aber nicht beurteilen, ob unter den 871 im Juli angenommenen bzw.
vorgeschlagenen Kandidaten Fehlzuschreibungen stehen, die die Prüfschranke nicht gefangen
hat. Für dataphys fehlt ein zweiter Durchlauf im Juli; ob die Quelle wie ArtBase abrupt
oder wie S+T+ARTS graduell erschöpft, ist offen.
