# Ablehnungsverzeichnis — September 2026

Der auffälligste Befund des Monats ist nicht einer der beiden aus Juli und August fortgeschriebenen (ArtBase bei null, S+T+ARTS zunehmend erschöpft — beide bestätigen sich erneut, dazu unten mehr), sondern ein neuer: Sieben Titel wurden im September innerhalb ein und desselben nächtlichen Laufs sowohl angenommen als auch — Sekunden später, mit identischem DOI, identischem Urheber und identischem Jahr — verworfen. Bei vier dieser sieben Titel wiederholt sich das exakt gleiche Zahlenpaar an mehreren Tagen unverändert (0,4769 gegen 0,333 bei Oleg Sobchuks „Evolution of Modern Literature and Film", fünfmal im Monat; 0,5994 gegen 0,311 bei Fernández/Vicos „AI Methods in Algorithmic Composition", viermal), was gegen einen einmaligen Zufall und für einen reproduzierbaren Fehler im Bewertungs- oder Erntepfad spricht — dieselbe Arbeit wird offenbar über zwei verschiedene Pfade innerhalb eines Laufs erfasst und unabhängig bewertet, einmal über, einmal unter der Schwelle. Daneben hat sich die Erschöpfung der beiden kuratierten Werke-Quellen weiter verschärft, ohne dass die seit Juli wiederholten Vorschläge umgesetzt wurden: ArtBase lieferte den dritten Monat in Folge über alle 46 Durchläufe hinweg exakt null neue Kandidaten bei 1.538 Ablehnungen, und bei S+T+ARTS ist der im August als Ausweg benannte ältere Jahrgang 2024 im September kein einziges Mal abgefragt worden — während der laufende Jahrgang 2025 vollständig auf 0 % Neufundrate gefallen ist (0 von 300) und 2026 von 5,1 % auf 3,3 % weiter sinkt. Ein kleiner Lichtblick: Von den vier im August-Bericht benannten „keine-feldzuordnung"-Fällen hat der Urteilsschritt am 29.9. zwei tatsächlich gelöst (Echorroes, Neutone Morpho bekamen Felder zugewiesen) — aber der dritte, „Creative Intelligence: Reimagining Supercomputing through Artistic Research", wurde im September an allen 30 Tagen erneut vorgeschlagen und bei jedem der drei Urteilsschritt-Versuche (9.9., 13.9., 26.9.) mit demselben Fehler „Feld None gibt es nicht" abgewiesen.

Im September wurden 2.436 Kandidaten aufgenommen bzw. vorgeschlagen (2.404 Theorie-, 32 Werke-Atlas) und 7.683 verworfen (4.794 Theorie-, 2.889 Werke-Atlas) — an 30 von 30 Tagen lief der nächtliche Scout, dazu sechs Urteilsschritt-Läufe. 13 Ausfälle sind vermerkt, alle im Theorie-Zweig: elf OpenAlex-Anfragen mit HTTP 429 an einem einzigen Tag (11.9., verteilt auf elf verschiedene Saatgut-Einträge der Nachbarschaftssuche), dazu ein HTTP 400 (7.9.) und ein HTTP 503 (28.9.). Anders als im August gab es keinen einzigen ArtBase- oder S+T+ARTS-Netzfehler.

## Grund × Quelle

| Quelle | unter-schwelle | bereits-im-atlas | identifier-nicht-aufloesbar | keine-feldzuordnung | Summe |
|---|---:|---:|---:|---:|---:|
| openalex (Theorie) | 3.014 | 353 | 1.427 | 0 | 4.794 |
| artbase (Werke) | 0 | 1.538 | 0 | 0 | 1.538 |
| starts (Werke) | 0 | 1.342 | 0 | 9 | 1.351 |
| **Summe** | **3.014** | **3.233** | **1.427** | **9** | **7.683** |

Wie in Juli und August laufen `unter-schwelle` und `identifier-nicht-aufloesbar` ausschließlich über den OpenAlex-Zweig; ArtBase und S+T+ARTS scheitern ausschließlich am Bestandsabgleich (bzw., bei neun S+T+ARTS-Fällen, an der Feldzuordnung). Der Erschöpfungsgrad je Quelle: ArtBase 100,0 % (1.538 von 1.538, unverändert zum August), S+T+ARTS 99,3 % (1.342 von 1.351, leicht unter den 99,7 % im August), OpenAlex 7,4 % (353 von 4.794, deutlich über den 4,9 % im August — der Theorie-Atlas wächst und dupliziert sich entsprechend häufiger selbst). Insgesamt liegt der Anteil `bereits-im-atlas` an allen September-Ablehnungen bei 42,1 % (3.233 von 7.683), weiter steigend gegenüber 40,3 % im August und 30 % im Juli.

## Grund × Feld (thematischer Sweep, Felder 8–13)

2.449 der 7.683 Ablehnungen (31,9 %) lassen sich einem der 13 Felder zuordnen — ein kleinerer Anteil als im August (37,5 %), weil der Theorie-Zweig diesen Monat stärker aus der saatgutbasierten Nachbarschaftssuche (ohne Feldkennung) gespeist wurde.

| Feld | n verworfen | unter-schwelle | identifier-nicht-aufloesbar | bereits-im-atlas |
|---|---:|---:|---:|---:|
| 11 — Körper & Intimität | 465 | 105 | 27 | 333 |
| 8 — Wahrnehmung & Maßstab | 439 | 113 | 28 | 298 |
| 10 — Fehler & Rauschen | 409 | 86 | 22 | 301 |
| 12 — Sprache & Generativität | 377 | 142 | 33 | 202 |
| 9 — Zeit & Archiv | 359 | 54 | 15 | 290 |
| 13 — Material & Sinne | 310 | 35 | 28 | 247 |
| 5 — Dekolonial / more-than-human (Familie Macht) | 31 | 0 | 0 | 31 |
| 1 — Material & planetare KI-Kosten (Familie Macht) | 21 | 0 | 0 | 12 (+9 keine-feldzuordnung) |
| 6 — Data Justice / Data-Feminismus (Familie Macht) | 16 | 0 | 0 | 16 |
| 7 — KI-Selbstverzehr / Quanten (Familie Macht) | 12 | 0 | 0 | 12 |
| 3 — Counter-Forensics / OSINT (Familie Macht) | 9 | 0 | 0 | 9 |
| 2 — KI im Krieg / Kill-Cloud (Familie Macht) | 1 | 0 | 0 | 1 |

Die sechs neuen Felder dominieren weiterhin `bereits-im-atlas` (52–82 % je Feld), mit einer Ausnahme: In Feld 12 (Sprache & Generativität) liegt `unter-schwelle` mit 142 von 377 Fällen (37,7 %) nicht nur relativ, sondern — anders als im August — jetzt auch absolut vor jedem anderen Feld; im August hatte noch Feld 10 mit 193 Fällen den höchsten absoluten Schwellenwert-Ausschuss, in Feld 10 sind es im September nur noch 86. Die alten „Macht"-Felder tragen wie im August ausnahmslos `bereits-im-atlas`-Fälle aus S+T+ARTS, mit der einen Ausnahme der neun Feld-1-Fälle, die tatsächlich die `keine-feldzuordnung`-Vorfälle sind (siehe unten; sie tragen die Kennung „thema-1" nur als `ausgehend_von`-Saatgut, nicht als zugewiesenes Feld).

## ArtBase: der dritte Monat bei null

Juli zeigte den Trend, August den ersten vollen Monat bei null, und der September bestätigt ihn ein drittes Mal, ohne jede Abweichung:

| Feld | Durchläufe im September | verworfen je Durchlauf | akzeptiert (Summe) |
|---|---:|---:|---:|
| 8 — Wahrnehmung & Maßstab | 7 | 39 | 0 |
| 9 — Zeit & Archiv | 7 | 39 | 0 |
| 10 — Fehler & Rauschen | 8 | 36 | 0 |
| 11 — Körper & Intimität | 8 | 40 | 0 |
| 12 — Sprache & Generativität | 8 | 20 | 0 |
| 13 — Material & Sinne | 8 | 28 | 0 |

Bemerkenswert ist nicht nur die Null, sondern dass die verworfene Zahl je Durchlauf und Feld exakt dieselbe ist wie im August (39, 39, 36, 40, 20, 28) — über einen dritten Monat unverändert. Das stützt die im August formulierte Vermutung weiter: Die ArtBase-Abfrage je Feld-Stichwort liefert einen festen, unpaginierten Treffersatz, der seit Ende Juli vollständig im Bestand steht. Die in Juli und August vorgeschlagene Drosselung ist in keinem der beiden folgenden Monate umgesetzt worden; 46 Durchläufe haben im September 1.538 Titel ein weiteres Mal als Duplikat geprüft, ohne dass sich am Befund etwas ändern konnte.

## S+T+ARTS: die Erschöpfung vertieft sich, die empfohlene Drehung blieb aus

Der August-Bericht hatte gezeigt, dass die Erschöpfung nicht an der Quelle, sondern am Abfragejahr liegt, und eine Drehung auf ältere, kaum abgegraste Jahrgänge vorgeschlagen. Im September wurde diese Drehung nicht umgesetzt — und die beiden abgefragten Jahrgänge sind inzwischen beide fast oder ganz ausgeschöpft:

| Abfragejahr | akzeptiert | verworfen | Annahmequote |
|---|---:|---:|---:|
| starts:2024 | 0 | 0 | nicht abgefragt |
| starts:2025 | 0 | 300 | 0,0 % |
| starts:2026 | 30 | 870 | 3,3 % |

starts:2024 kommt im gesamten September kein einziges Mal vor — weder als akzeptiert noch als verworfen —, obwohl es im August an den zwei Nächten, an denen es abgefragt wurde, 57,7 % Neufunde geliefert hatte. Zugleich ist der Jahrgang 2025, der im August noch 6,6 % Neufunde brachte, im September auf 0,0 % gefallen (0 von 300), und der laufende Jahrgang 2026 sinkt von 5,1 % auf 3,3 % (30 von 900). Getrennt davon verarbeitete der Urteilsschritt sechsmal im Monat insgesamt 181 bereits geerntete, aber noch nicht feldzugeordnete dataphys/S+T+ARTS-Kandidaten (meist aus früheren Monaten): 172 davon waren zum Zeitpunkt der Zuordnung bereits im Atlas, neun scheiterten am Feldzuordnungs-Fehler (siehe unten), und genau zwei — Echorroes und Neutone Morpho — wurden am 29.9. erfolgreich einem Feld zugewiesen und gingen als neue Kandidaten in die obige Tabelle ein (feld-13 bzw. feld-6).

## Das Doppelgänger-Phänomen: derselbe Fund, zweimal bewertet

In 13 Fällen (sieben einzigartige Titel) taucht im September innerhalb derselben Lauf-Datei, mit identischem DOI, Urheber und Jahr, derselbe Titel sowohl unter den Kandidaten als auch unter den Ablehnungen auf — jeweils im Abstand von ein bis zwölf Sekunden. Zehn dieser 13 Fälle betreffen `unter-schwelle`, und bei vier Titeln wiederholt sich dasselbe Zahlenpaar an mehreren Tagen unverändert:

| Titel | Punkte (Kandidat) | Punkte (Ablehnung) | n Tage |
|---|---:|---:|---:|
| Evolution of Modern Literature and Film (Sobchuk) | 0,4769 | 0,333 | 5 |
| AI Methods in Algorithmic Composition (Fernández/Vico) | 0,5994 | 0,311 | 4 |
| Cognition and Computational Linguistic Creativity (Gatti u. a.) | 0,6192 | 0,326 | 1 |
| Horizons for the Enactive Mind (Di Paolo u. a.) | 0,5936 | 0,275 | 1 |

Die übrigen drei Fälle betreffen `identifier-nicht-aufloesbar`: derselbe Titel löst sich einmal auf (HTTP 200) und scheitert Sekunden später an HTTP 403, 429 oder 500 — hier ist eine flackernde, möglicherweise automatisierungsfeindliche Antwort des Ziels die naheliegendere Erklärung als ein Rechenfehler. Bei den zehn `unter-schwelle`-Fällen dagegen wiederholt sich bei identischen Titeln dasselbe Zahlenpaar an verschiedenen Tagen exakt — das spricht gegen eine einmalige Störung und für einen reproduzierbaren Pfad, der denselben Fund zweimal (vermutlich über zwei verschiedene Abfragen oder Zitationskanten zum selben Saatgut) erntet und mit unterschiedlichen Signalen bewertet.

## keine-feldzuordnung: zwei der vier August-Fälle gelöst, einer bleibt

Von den vier im August-Bericht benannten Fällen („Creative Intelligence", „Arts at CERN", „Echorroes", „Neutone Morpho") taucht „Arts at CERN" im September gar nicht mehr auf. Echorroes und Neutone Morpho wurden am 29.9. erfolgreich einem Feld zugewiesen (siehe oben). „Creative Intelligence: Reimagining Supercomputing through Artistic Research" dagegen bleibt ungelöst: Der nächtliche Scout schlägt den Titel an allen 30 Tagen des Monats erneut vor (identischer `vorschlags_id`, identische Prüfung, Punktzahl 1,0), und bei jedem der drei Urteilsschritt-Versuche (9.9., 13.9., 26.9.) scheitert die Feldzuordnung mit derselben Meldung „Feld None gibt es nicht". Da eine Ablehnung hier offensichtlich nichts an der täglichen Wiedervorlage ändert, läuft dasselbe Werk seit mindestens zwei Monaten jede Nacht erneut durch dieselbe Prüfung, ohne dass die Information „das scheitert an der Feldzuordnung" den nächsten Lauf erreicht.

## Beharrlich mehrfach abgewiesen

Von 2.524 im September einzigartigen verworfenen Titeln tauchen 1.213 an mehr als einem Kalendertag auf; 337 davon ausschließlich mit dem Grund `bereits-im-atlas` (die erwartbare Kehrseite der ArtBase-/S+T+ARTS-Erschöpfung), die übrigen 876 wiederholt aus inhaltlichen oder technischen Gründen, ohne je als „schon im Atlas" zu gelten:

| Titel | n Tage | Grund | Herkunft |
|---|---:|---|---|
| Susquehanna Chorale Spring Concert "Roots and Wings" | 28 | unter-schwelle | openalex |
| FEATURES AND DIFFERENCES OF ADEQUATE AND EQUIVALENT TRANSLATION | 24 | unter-schwelle | openalex |
| "Kindertransport," Oct. 5, 6, and 7, 8:00 p.m. | 24 | unter-schwelle | openalex |
| A GEOMETRIC MEAN IN THE FURUTA INEQUALITY | 24 | unter-schwelle | openalex |
| DETERMINING QUALITY REQUIREMENTS AT THE UNIVERSITIES … | 24 | identifier-nicht-aufloesbar | openalex |

Dieselben fachfremden Wiederholer wie in Juli und August (Kirchenchor-Konzert, Theaterspielplan, Ungleichungsbeweis, Übersetzungsstudie) stehen auch im dritten Monat ganz oben — bestätigt, dass sie im Juli benannten „schwachen Nachbarschafts-Saatgut-Einträgen" entstammen. Im September allerdings lässt sich keiner dieser Titel mehr auf vier feste Saatgut-Einträge zurückführen: Jeder der fünf Titel wird über ein breites, von Tag zu Tag wechselndes Feld von 15–22 verschiedenen `ausgehend_von`-Einträgen herangezogen (am häufigsten `anderson-kearnes-mcfarlane-swanton-assemblages-geography`, 4 von 24–28 Tagen je Titel). Das widerspricht der im Juli vermuteten Konzentration auf wenige schwache Seeds nicht grundsätzlich, zeigt aber, dass die Wiederholer im September über viel mehr Nachbarschaftspfade erreicht werden als damals benannt — ein Befund, der eine einfache „vier Seeds reparieren"-Lösung unwahrscheinlicher macht.

## unter-schwelle: wie knapp ist „knapp"?

Von 3.014 `unter-schwelle`-Ablehnungen (Schwelle 0,35) liegen 989 (32,8 %) unter 0,15, 1.130 (37,5 %) zwischen 0,15 und 0,30, und 895 (29,7 %) zwischen 0,30 und 0,35 — ein etwas größerer knapper Rand als im August (dort 26,6 % ab 0,30). Direkt unterhalb der Schwelle, bei 0,345–0,350, liegen 78 einzigartige Titel, überwiegend zu KI, Kreativität und menschlich-maschineller Kollaboration — darunter „The Turing test and artistic creativity" (0,350), „‚Who' Is the Best Creative Thinking Partner?" (0,350) und „From Tool to Companion: Storywriters Want AI Writers to Respect Their Personal Values and Writing Strategies" (0,350, dreifach im Monat knapp gescheitert). Wie in Juli und August handelt es sich um inhaltlich einschlägige, oft aktuelle Titel, die an der Kombination aus `begriffsnaehe`, `frei_zugaenglich` und `aktualitaet` um wenige Tausendstel scheitern.

## identifier-nicht-aufloesbar: weiterhin fast nur HTTP 403, weiterhin nur im Theorie-Atlas

Von 1.427 Fällen sind 1.222 (85,7 %) HTTP 403, dazu 93 Verbindungsfehler ohne auswertbaren Code, 50 HTTP 404, 22 HTTP 429, 17 HTTP 405, 16 HTTP 503, 4 HTTP 500, 2 HTTP 523 und 1 HTTP 400. Der Anteil HTTP 403 liegt damit praktisch unverändert zum August (86,9 %) — die Prüfung trifft weiterhin überwiegend auf automatisierungsfeindliche Verlage, nicht auf tote Links, und wie in Juli und August bleibt der Werke-Atlas davon vollständig unberührt. Am stärksten betroffen sind die Saatgut-Einträge `woolgar-lezaun-wrong-bin-bag` (71 Fälle), `sivertsen-ml-processes-ambiguity` (63) und `schwab-exposition-practice-as-research-experimental-systems` (45); anders als im August, wo vier der sechs thematischen Sweep-Themen selbst unter den Top-Zehn lagen, dominiert im September wieder die saatgutbasierte Nachbarschaftssuche einzelner Einträge wie im Juli.

## Vorschläge

1. **ArtBase jetzt ganz abschalten statt weiter zu drosseln.** Der dritte Monat in Folge mit exakt denselben, konstanten Ablehnungszahlen je Feld (39/39/36/40/20/28, unverändert seit August) bei 0 neuen Kandidaten über 46 Durchläufe zeigt, dass die im Juli und August vorgeschlagene Drosselung nicht umgesetzt wurde und eine weitere Empfehlung in derselben Richtung wahrscheinlich wieder folgenlos bleibt. Ein vollständiges Aussetzen bis zur nächsten Prüfung des Ausstellungsbestands würde drei Monate in Folge 0 Ertrag gegen über 5.600 unnötige Ablehnungen abwägen.

2. **S+T+ARTS-Abfrage explizit auf starts:2024 umstellen, nicht nur ergänzen.** starts:2024 wurde im September kein einziges Mal abgefragt, obwohl es im August mit 57,7 % die einzige nennenswerte Neufundrate aller S+T+ARTS-Jahrgänge lieferte; gleichzeitig ist starts:2025 im September auf 0,0 % gefallen (0 von 300) und starts:2026 auf 3,3 % (30 von 900). Ohne eine Umstellung der Abfragelogik auf ältere Jahrgänge verbrennt die Quelle nächtlich Zeit auf zwei praktisch ausgeschöpfte Jahre.

3. **Den `next(iter(THEMEN))`-Fallback in `extern.py` für den verbleibenden Fall reparieren.** Zwei der vier im August benannten Fälle sind durch den Urteilsschritt inzwischen gelöst (Echorroes, Neutone Morpho), aber „Creative Intelligence: Reimagining Supercomputing through Artistic Research" wird seit mindestens zwei Monaten jede Nacht neu vorgeschlagen (30 von 30 Tagen im September) und bei jedem Urteilsschritt-Versuch mit identischem Fehler abgewiesen. Der Titel selbst scheint inhaltlich gut zum Atlas zu passen (Punktzahl 1,0, vollständige Metadaten) — es ist ausschließlich die Feldzuordnung, die scheitert, und das verdient eine gezielte Prüfung, warum ausgerechnet dieser eine Titel durchfällt, wo zwei sehr ähnliche gelöst wurden.

4. **Erntepfad auf doppelte Erfassung innerhalb eines Laufs prüfen.** Sieben Titel (13 Vorkommen) wurden im September im selben Lauf einmal angenommen und einmal abgelehnt, mit identischem DOI, Urheber und Jahr; bei vier Titeln wiederholt sich dasselbe Punktepaar unverändert an mehreren Tagen. Da die abgelehnten Datensätze keine Rohsignale mitführen, lässt sich die Ursache aus den Kandidatendateien nicht feststellen — aber die Reproduzierbarkeit der Zahlenpaare spricht dafür, dass `ernten.py` denselben Fund über zwei Pfade (z. B. zwei verschiedene Zitationskanten zum selben Saatgut) unabhängig voneinander holt und bewertet, statt ihn vor der Bewertung zu entdoppeln.

## Was dieser Bericht nicht sagen kann

Warum dasselbe Werk im Doppelgänger-Phänomen zwei unterschiedliche Punktzahlen erhält, lässt sich aus den Kandidatendateien nicht klären: Abgelehnte Einträge tragen keine `punkte_begruendung` und keine Rohsignale, nur die abgelehnten Kandidaten selbst zeigen, welche Gewichtungsanteile griffen — welcher zweite Erfassungspfad zur zweiten, niedrigeren Zahl führte, bleibt Vermutung. Ebenso ungeklärt bleibt, warum die ArtBase-Ablehnungszahl je Feld über drei Monate exakt konstant bleibt — das spricht für einen unpaginierten, festen Treffersatz, aber die Kandidatendateien zeigen nur das Ergebnis, nicht die HTTP-Antwort des Adapters. Warum `starts:2024` im September trotz der August-Beobachtung kein einziges Mal abgefragt wurde, zeigen die Dateien ebenfalls nicht — nur dass es nicht geschah. Und wie in jedem Monat zuvor prüft die Identifier-Prüfung nur, dass ein Ziel antwortet, nicht dass Titel, Urheber und Jahr zusammenpassen; über mögliche Fehlzuschreibungen unter den 2.436 im September angenommenen bzw. vorgeschlagenen Kandidaten kann dieser Bericht nichts aussagen.
