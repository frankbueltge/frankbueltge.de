# Ablehnungsverzeichnis — August 2026

Der auffälligste Befund des Monats ist die Bestätigung dessen, was der Juli-Bericht als
Verdacht formulierte, in vollständiger Härte: ArtBase lieferte im August über alle sechs
neuen Felder und über alle 61 nächtlichen Durchläufe hinweg exakt null neue Kandidaten —
2.078 verifiziert-verworfene Titel, jeder einzelne mit dem Grund `bereits-im-atlas`, kein
einziger Treffer irgendwo dazwischen. Die im Juli vorgeschlagene Drosselung ist damit
erkennbar nicht umgesetzt worden; der dritte Sweep, der im Juli erstmals bei 0 % landete,
ist im August für alle sechs Felder zum Dauerzustand geworden. Der zweite Befund ist
gegenläufig interessant: Auch die S+T+ARTS-Quelle wirkt auf den ersten Blick ebenso
erschöpft (die laufenden Jahrgänge 2025 und 2026 liefern nur noch 5–7 % Neufunde), aber
wenn man nach Abfragejahr statt nach Quelle insgesamt aufschlüsselt, zeigt sich, dass der
ältere Jahrgang 2024 an den beiden Tagen, an denen der Adapter ihn tatsächlich abfragte,
57,7 % Neufunde lieferte — die Erschöpfung sitzt nicht in der Quelle, sondern im
Abfrage-Fenster. Der dritte Befund betrifft die inhaltliche Seite des Theorie-Atlas: In
Feld 11 (Körper & Intimität) wiederholt sich über den ganzen Monat ein Cluster erkennbar
einschlägiger Quantified-Self-Literatur — „The Data-Based Self", „Par-delà le Quantified
Self", „The Qualified Self", „The Sociology of Self-Tracking and Embodied Technologies"
und weitere —, die mit Punktzahlen von 0,155 bis 0,256 klar unter der Schwelle von 0,35
bleibt, obwohl sie inhaltlich exakt das trifft, wofür Feld 11 angelegt wurde. Und direkt
unterhalb der Schwelle liegt eine ganze Reihe erkennbar treffender KI/Kreativitäts-Titel
bei 0,348–0,350 — einen Hauch unter 0,35 —, darunter „Who authors AI art? (And why does it
matter?)" und „Towards a mixed human–machine creativity".

Im August wurden 2.548 Kandidaten aufgenommen bzw. vorgeschlagen (2.410 Theorie-, 138
Werke-Atlas) und 8.983 verworfen (5.642 Theorie-, 3.341 Werke-Atlas) — an 31 von 31 Tagen
lief der nächtliche Scout, dazu 22 Urteilsschritt-Läufe („-gelesen"-Dateien), die
S+T+ARTS-Funde nachträglich mit Feld und Medienklasse versehen. Neun Ausfälle sind
vermerkt: acht OpenAlex-Anfragen (HTTP 400/429, verteilt auf einzelne Tage im
Nachbarschaftszweig) und ein ArtBase-Netzfehler (ReadTimeout, 27.8., Feld 12 — deshalb hat
Feld 12 im August nur neun statt zehn Durchläufe).

## Grund × Quelle

| Quelle | unter-schwelle | bereits-im-atlas | identifier-nicht-aufloesbar | keine-feldzuordnung | Summe |
|---|---:|---:|---:|---:|---:|
| openalex (Theorie) | 3.925 | 279 | 1.438 | 0 | 5.642 |
| artbase (Werke) | 0 | 2.078 | 0 | 0 | 2.078 |
| starts (Werke) | 0 | 1.259 | 0 | 4 | 1.263 |
| **Summe** | **3.925** | **3.616** | **1.438** | **4** | **8.983** |

Wie im Juli laufen `unter-schwelle` und `identifier-nicht-aufloesbar` ausschließlich über
den OpenAlex-Zweig — ArtBase und S+T+ARTS durchlaufen `score.py::gewichte()` nicht und
scheitern ausschließlich am Bestandsabgleich. Der Anteil `bereits-im-atlas` an allen
Ablehnungen einer Quelle macht den Erschöpfungsgrad direkt sichtbar: ArtBase 100,0 %
(2.078 von 2.078), S+T+ARTS 99,7 % (1.259 von 1.263), OpenAlex 4,9 % (279 von 5.642).
Insgesamt liegt der Anteil `bereits-im-atlas` an allen August-Ablehnungen bei 40,3 %
(3.616 von 8.983) — deutlich über den 30 % im Juli, weil die kuratierten Werke-Quellen
inzwischen den Löwenanteil eines vollen Monats statt nur einer Anlaufwoche ausmachen.

## Grund × Feld (thematischer Sweep, Felder 8–13)

3.371 der 8.983 Ablehnungen (37,5 %) lassen sich einem der 13 Felder zuordnen; weitere vier
(die `keine-feldzuordnung`-Fälle, siehe unten) tragen zwar formal die Kennung „Feld 1",
zählen hier aber bewusst nicht mit — dazu unten mehr. Die übrigen 62,1 % stammen aus der
saatgutbasierten Nachbarschaftssuche des Theorie-Atlas (4.605) und dem generischen
S+T+ARTS-Strom ohne Urteilsschritt (1.003), die beide konstruktionsbedingt kein Feld
tragen.

| Feld | n verworfen | unter-schwelle | identifier-nicht-aufloesbar | bereits-im-atlas |
|---|---:|---:|---:|---:|
| 8 — Wahrnehmung & Maßstab | 637 | 149 | 29 | 459 |
| 10 — Fehler & Rauschen | 633 | 193 | 56 | 384 |
| 11 — Körper & Intimität | 603 | 138 | 43 | 422 |
| 9 — Zeit & Archiv | 558 | 81 | 30 | 447 |
| 12 — Sprache & Generativität | 416 | 155 | 46 | 215 |
| 13 — Material & Sinne | 390 | 43 | 39 | 308 |
| 5 — Dekolonial / more-than-human (Familie Macht) | 54 | 0 | 0 | 54 |
| 6 — Data Justice / Data-Feminismus (Familie Macht) | 25 | 0 | 0 | 25 |
| 7 — KI-Selbstverzehr / Quanten (Familie Macht) | 22 | 0 | 0 | 22 |
| 1 — Material & planetare KI-Kosten (Familie Macht) | 19 | 0 | 0 | 19 |
| 3 — Counter-Forensics / OSINT (Familie Macht) | 13 | 0 | 0 | 13 |
| 4 — Provenance / Authentizität (Familie Macht) | 1 | 0 | 0 | 1 |

Die sechs neuen Felder (8–13) tragen mit 3.237 Fällen fast die gesamte Feldzuordnung; die
übrigen 134 Fälle in den alten „Macht"-Feldern stammen ausnahmslos aus S+T+ARTS-Funden, die
der Urteilsschritt einem der ursprünglichen sieben Felder statt einem der neuen
zugeschlagen hat, und enden ausnahmslos mit `bereits-im-atlas` — anders als im Juli tragen
diese Fälle also tatsächlich eine echte Feldnummer, keinen Platzhalter. In den sechs neuen
Feldern dominiert überall `bereits-im-atlas` (52–74 % Anteil je Feld) außer in Feld 12
(Sprache & Generativität), wo `unter-schwelle` mit 155 von 416 (37 %) knapp vor
`bereits-im-atlas` (215, 52 %) liegt, aber immer noch dahinter — Feld 10 (Fehler & Rauschen)
zeigt mit 193 `unter-schwelle`-Fällen erneut wie im Juli den höchsten absoluten
Schwellenwert-Ausschuss aller Felder.

## ArtBase: ein ganzer Monat bei null

Die Erschöpfung, die der Juli-Bericht als Trend über drei Durchläufe beschrieb, ist im
August zum Dauerzustand geworden. Jedes der sechs neuen Felder wurde 9- bis 11-mal
abgefragt (der Cron-Rhythmus deckt alle sechs Felder alle drei Nächte ab); in keinem
einzigen dieser 61 Durchläufe kam ein neuer Kandidat zustande.

| Feld | Durchläufe im August | verworfen je Durchlauf | akzeptiert (Summe) |
|---|---:|---:|---:|
| 8 — Wahrnehmung & Maßstab | 11 | 39 | 0 |
| 9 — Zeit & Archiv | 11 | 39 | 0 |
| 10 — Fehler & Rauschen | 10 | 36 | 0 |
| 11 — Körper & Intimität | 10 | 40 | 0 |
| 12 — Sprache & Generativität | 9 (10. Durchlauf am 27.8. per Netzfehler ausgefallen) | 20 | 0 |
| 13 — Material & Sinne | 10 | 28 | 0 |

Die Zahl der verworfenen Kandidaten je Durchlauf ist über den ganzen Monat für jedes Feld
exakt konstant (z. B. Feld 8 an allen elf Tagen genau 39) — derselbe Befund wie im Juli,
jetzt über deutlich mehr Wiederholungen bestätigt: Die ArtBase-Abfrage je Feld-Stichwort
liefert offenbar denselben unpaginierten Treffersatz, und da dieser Satz seit Ende Juli
vollständig im Bestand steht, bleibt für jede weitere Abfrage rechnerisch nichts mehr übrig.

## S+T+ARTS: Erschöpfung ist eine Frage des Abfragejahres, nicht der Quelle

Der Werke-Atlas-Strom aus S+T+ARTS wirkt in der Tagesübersicht ebenso erschöpft wie
ArtBase — an 25 von 27 beobachteten Nächten liegt die Annahmequote bei 2–15 %. Zwei Nächte
(7.8. und 20.8.) stechen jedoch mit 93 % bzw. 45 % heraus, und der Grund liegt in der
Abfrage selbst: Der Adapter fragt pro Nacht überwiegend den laufenden Jahrgang
(`starts:2026`) und den vorigen (`starts:2025`) ab, an den beiden auffälligen Nächten aber
ausschließlich `starts:2024` bzw. überwiegend `starts:2025`/`starts:2024`. Über den ganzen
Monat aufgeschlüsselt nach Jahrgang:

| Abfragejahr | akzeptiert | verworfen | Annahmequote |
|---|---:|---:|---:|
| starts:2024 | 30 | 22 | 57,7 % |
| starts:2025 | 19 | 269 | 6,6 % |
| starts:2026 | 38 | 712 | 5,1 % |

Die laufenden Jahrgänge 2025 und 2026 sind faktisch ausgeschöpft, der ältere Jahrgang 2024
dagegen keineswegs — an den zwei Nächten, an denen der Adapter ihn abfragte, war mehr als
jeder zweite Fund neu. Das deckt sich mit der Beobachtung aus dem README, dass S+T+ARTS die
Gegenwartslücke schließt, aber offenbar noch ältere, kaum abgegraste Jahrgänge im Bestand
hat, die der aktuelle Abfragefokus nur zufällig streift.

## Beharrlich mehrfach abgewiesen

Von 2.861 im August einzigartigen verworfenen Titeln tauchen 1.674 an mehr als einem
Kalendertag auf. 337 davon ausschließlich mit dem Grund `bereits-im-atlas` (die erwartbare
Kehrseite der ArtBase-/S+T+ARTS-Erschöpfung oben) — die übrigen 1.337 wurden wiederholt aus
inhaltlichen oder technischen Gründen verworfen, ohne je als „schon im Atlas" zu gelten:

| Titel | n Tage | Grund | Herkunft |
|---|---:|---|---|
| Susquehanna Chorale Spring Concert "Roots and Wings" | 25 | unter-schwelle | openalex |
| DETERMINING QUALITY REQUIREMENTS AT THE UNIVERSITIES … | 21 | identifier-nicht-aufloesbar | openalex |
| FEATURES AND DIFFERENCES OF ADEQUATE AND EQUIVALENT TRANSLATION | 19 | unter-schwelle | openalex |
| "Kindertransport," Oct. 5, 6, and 7, 8:00 p.m. | 19 | unter-schwelle | openalex |
| A GEOMETRIC MEAN IN THE FURUTA INEQUALITY | 19 | unter-schwelle | openalex |
| What Do We Critique When We Critique Technology? | 16 | unter-schwelle | openalex |

Dieselben fachfremden Wiederholer wie im Juli (Kirchenchor-Konzert, Ungleichungsbeweis,
Theaterspielplan) stehen weiterhin ganz oben — ein Hinweis, dass die im Juli benannten vier
schwachen Nachbarschafts-Saatgut-Einträge (s. u.) über den August hinweg unverändert
dieselben Randtreffer erneut hochspülen.

Interessanter als diese Spitzenreiter ist ein kleinerer, inhaltlich zusammenhängender
Cluster in Feld 11 (Körper & Intimität): „From data fetishism to quantifying selves"
(0,256), „Traductions sociotechniques des principes axiologiques du quantified self"
(0,175), „The Sociology of Self-Tracking and Embodied Technologies" (0,169), „The
Data-Based Self: Self-Quantification and the Data-Driven (Good) Life" (0,166), „Par-delà le
Quantified Self" (0,160) und „The Qualified Self" (0,155) — sechs Titel, die alle exakt in
das gehören, wofür Feld 11 angelegt ist („quantified self critique",
„biometric self-tracking aesthetics"), aber allesamt weit unter der Schwelle von 0,35
liegen. Die Gewichtung des Theorie-Zweigs legt `frei_zugaenglich` (0,30) und `aktualitaet`
(0,20) zusammen mehr Gewicht bei als `begriffsnaehe` (0,25) allein; die durchweg niedrigen
Werte (0,155–0,256, deutlich unter dem, was `begriffsnaehe` allein liefern könnte) deuten
darauf hin, dass diese überwiegend älteren, vermutlich paywalled soziologischen Arbeiten
zum Quantified Self gerade wegen ihrer Zugänglichkeit und ihres Alters unterbewertet
werden, obwohl sie inhaltlich näher am Feld liegen als viele akzeptierte Kandidaten.

## unter-schwelle: wie knapp ist „knapp"?

Von 3.925 `unter-schwelle`-Ablehnungen (Schwelle 0,35) liegen 872 (22,2 %) unter 0,15 —
klar irrelevant —, aber 1.043 (26,6 %) bei 0,30 oder darüber. Direkt unterhalb der Schwelle,
bei 0,348–0,350, häufen sich erkennbar einschlägige Titel zu KI und Kreativität: „Who
authors AI art? (And why does it matter?)" (0,348), „Towards a mixed human–machine
creativity" (0,348), „The Purity Myth: Why Stigmatizing GAI in Academic Writing Is Harmful"
(0,349), „Creative intra-actions: co-creating with generative AI in the age of climate
change" (0,349) und mehrere weitere — Titel, die inhaltlich kaum treffender sein könnten
für einen Atlas, der sich mit KI, Kreativität und Autorschaft befasst, aber um 0,001–0,002
Punkte an der Schwelle scheitern. Anders als die knappen Fälle im Juli (dort ging es um
Begriffsnähe-Unterbewertung kanonischer Texte) betrifft dieser Befund die aktuellste
Debatte selbst: Diese Titel sind neu, häufig frei zugänglich, treffen aber offenbar knapp
nicht genug Schlagworte des jeweiligen Saatgut-Eintrags.

## identifier-nicht-aufloesbar: weiterhin fast nur HTTP 403, weiterhin nur im Theorie-Atlas

Von 1.438 Fällen sind 1.249 (86,9 %) HTTP 403, dazu 40 HTTP 404, 24 HTTP 405, 17 HTTP 503,
6 HTTP 429, 4 HTTP 421, 2 HTTP 500 und 96 Verbindungsfehler ohne auswertbaren Code. Wie im
Juli trifft die Prüfung überwiegend nicht auf tote Links, sondern auf Verlage/Repositorien,
die automatisierte Anfragen aktiv blockieren, und wie im Juli ist der Werke-Atlas davon
nicht betroffen — alle 1.438 Fälle stammen aus dem OpenAlex-Zweig. Die zehn am stärksten
betroffenen Saatgut-/Themen-Einträge sind `thema-10-fehler-rauschen` (56), `thema-12-sprache-generativitat`
(46), `firestein-ignorance` (44), `thema-11-korper-intimitat` (43),
`sivertsen-ml-processes-ambiguity` (40), `thema-13-material-sinne` (39), `ingold-making`
(33), `colton-wiggins-computational-creativity-final-frontier` (31), `thema-9-zeit-archiv`
(30) und `thema-8-wahrnehmung-ma-stab` (29). Bemerkenswert: Anders als im Juli, wo die
Nachbarschaftssuche einzelner Saatgut-Einträge dominierte, liegen jetzt vier der sechs
thematischen Sweep-Themen selbst unter den Top-Zehn — der thematische Sweep trifft also
strukturell häufiger auf blockierende Verlage als die saatgutbasierte Nachbarschaftssuche.

## keine-feldzuordnung: der Juli-Fallback ist unverändert im Code

Alle vier Fälle des Monats stammen aus zwei Urteilsschritt-Läufen
(`2026-08-12-gelesen.json`, `2026-08-30-gelesen.json`) und betreffen „Creative Intelligence:
Reimagining Supercomputing through Artistic Research", „Arts at CERN", „Echorroes:
Reflections on Tchaikovsky" und „Neutone Morpho — Real-time AI Audio Plugin and Platform".
Der im Juli-Bericht benannte stille Fallback in `extern.py` (`next(iter(THEMEN))`, der
Kandidaten ohne gültiges Feld optisch wie Feld 1 aussehen lässt) steht unverändert im Code
— dieser Bericht zählt die vier Fälle deshalb weiterhin bewusst als „ohne Feld", nicht als
Feld 1 (siehe Tabelle oben, wo Feld 1 nur 19 echte Treffer zeigt). Mit vier Fällen bei 51
im August über den Urteilsschritt aufgenommenen S+T+ARTS-Kandidaten ist das Problem klein,
aber nicht verschwunden.

## Vorschläge

1. **ArtBase-Sweeps deutlich drosseln oder ganz aussetzen, bis neue Werke im
   Ausstellungsbestand erscheinen.** 61 von 61 Durchläufen im August lieferten 0 neue
   Kandidaten bei 2.078 verworfenen — nicht der dritte Durchlauf wie im Juli, sondern
   ausnahmslos jeder. Ein Rhythmus von etwa einmal pro Feld und Quartal statt alle drei
   Nächte würde im aktuellen Zustand nichts an Ertrag kosten, aber einen der beiden
   nächtlichen Werke-Sweep-Plätze für eine andere Quelle freimachen — siehe Vorschlag 2.

2. **S+T+ARTS-Abfrage gezielt auf ältere Jahrgänge (2024 und davor) verschieben, statt
   überwiegend 2025/2026 erneut abzufragen.** `starts:2024` lieferte an den zwei Nächten, an
   denen es abgefragt wurde, 57,7 % Neufunde gegenüber 5,1–6,6 % bei den laufenden
   Jahrgängen. Ein expliziter Rotationsplan über alle verfügbaren Jahrgänge (nicht nur
   „aktuell + Vorjahr") würde den frei werdenden ArtBase-Sweep-Platz aus Vorschlag 1 sinnvoll
   füllen.

3. **`begriffsnaehe`-Gewicht für ältere, thematisch exakte Treffer im Theorie-Zweig prüfen
   — insbesondere für Feld 11.** Sechs erkennbar einschlägige Quantified-Self-Titel liegen
   bei 0,155–0,256 (Schwelle 0,35), obwohl sie den Begriffsraum von Feld 11 direkt treffen.
   Das ist kein Aufruf, die Schwelle pauschal zu senken, sondern ein Hinweis, dass
   `frei_zugaenglich` und `aktualitaet` zusammen (0,50 der Gewichtung) ältere, vermutlich
   paywalled Fachliteratur systematisch gegenüber neuerer, offen zugänglicher benachteiligen
   — ein Effekt, der sich mit dem Cluster in Feld 11 diesen Monat klar genug zeigt, um ihn
   gezielt zu prüfen, statt die Gewichtung insgesamt neu zu setzen.

4. **Den `next(iter(THEMEN))`-Fallback in `extern.py` durch ein explizites „kein Feld"
   ersetzen.** Der im Juli-Bericht benannte Fallback steht unverändert im Code und hat im
   August erneut vier Kandidaten optisch wie Feld-1-Treffer aussehen lassen. Die Zahl ist
   klein, aber jede künftige Auswertung, die `ausgehend_von` statt `grund` liest, würde sie
   falsch zählen.

## Was dieser Bericht nicht sagen kann

Die Ablehnungsdaten enthalten weiterhin keine URLs, nur Titel und Herkunft — welche
konkreten Verlage/Repositorien hinter den 1.249 HTTP-403-Fällen stehen, lässt sich aus den
Kandidatendateien nicht rekonstruieren. Für die vermutete `frei_zugaenglich`-Benachteiligung
des Quantified-Self-Clusters in Feld 11 gilt dasselbe: Die verworfenen Einträge tragen keine
`punkte_begruendung` (die gibt es nur für aufgenommene Kandidaten), sodass die
Signalaufschlüsselung eine plausible Rekonstruktion aus `score.py`, nicht eine Messung an
den konkreten sechs Titeln ist. Warum der S+T+ARTS-Adapter an genau zwei Nächten im August
überwiegend oder ausschließlich `starts:2024` statt der üblichen Jahrgangsmischung
abgefragt hat, zeigen die Kandidatendateien nicht — nur dass es geschah und dass es sich
lohnte. Und wie im Juli sagt die Identifier-Prüfung nur, dass ein Ziel antwortet, nicht dass
Titel, Urheber und Jahr stimmen; dieser Bericht kann nichts darüber aussagen, ob unter den
2.548 im August angenommenen bzw. vorgeschlagenen Kandidaten Fehlzuschreibungen stehen.
