# Ablehnungsverzeichnis — Oktober 2026

Der auffälligste Befund des Monats ist keiner der fortgeschriebenen aus Juli bis September, sondern ein neuer, der eine der alten Geschichten beendet: ArtBase, drei Monate in Folge bei 100 % `bereits-im-atlas`, liefert im Oktober in allen 62 Durchläufen über alle sechs Felder überhaupt nichts mehr — nicht null neue Kandidaten bei Tausenden Ablehnungen wie im September, sondern null Kandidaten UND null Ablehnungen UND kein einziger vermerkter Ausfall. Eine Stichprobe gegen die ArtBase-API am 1.11. (außerhalb der committeten Daten, siehe unten) zeigt den Grund: Die Quelle antwortet inzwischen mit einem Cloudflare-Bot-Schutz (HTTP 403, „Just a moment …") statt mit Suchergebnissen. Der Adapter fängt genau diesen Fehler pro Suchbegriff ab und überspringt ihn stillschweigend (`artbase.py::ernte()`), ohne ihn als `ausfaelle` zu vermerken — ein vollständiger, dauerhafter Quellenausfall, der im Archiv bislang an keiner Stelle sichtbar ist. Der zweite Befund hängt damit zusammen und ist für sich ebenso deutlich: Der gesamte automatische Zuwachs des Werke-Atlas im Oktober besteht aus genau einem Kandidaten, „Creative Intelligence: Reimagining Supercomputing through Artistic Research", der an allen 31 Tagen erneut mit Punktzahl 1,0 vorgeschlagen und an allen 31 Tagen von der Aufnahme abgewiesen wird, weil seine Herkunftskennung (`dataphys-liste`, die generische Platzhalter-Saat für direkt geerntete S+T+ARTS-/dataphys-Funde) sich nicht in ein Feld übersetzen lässt. Der Urteilsschritt, der genau das leisten soll, lief im Oktober 15-mal — öfter als im September (6) — und scheiterte bei allen vier dokumentierten Versuchen an diesem einen Titel mit derselben Meldung wie im August und September, löste aber auch sonst keinen einzigen Kandidaten ein: Der Werke-Atlas ist diesen Monat de facto nicht gewachsen.

Im Oktober wurden 2.930 Kandidaten aufgenommen bzw. vorgeschlagen (2.899 Theorie-, 31 Werke-Atlas) und 6.446 verworfen (5.233 Theorie-, 1.213 Werke-Atlas) — an 31 von 31 Tagen lief der nächtliche Scout, dazu 15 Urteilsschritt-Läufe ("-gelesen"-Dateien, die durchweg 0 Kandidaten einlösten). Zwei Ausfälle sind vermerkt, beide im Theorie-Zweig: zwei OpenAlex-Anfragen mit HTTP 400 am 25.10., an den Saatgut-Einträgen `gerstgrasser-is-model-collapse-inevitable` und `broad-dead-internet-computational-creativity`.

## Grund × Quelle

| Quelle | unter-schwelle | bereits-im-atlas | identifier-nicht-aufloesbar | keine-feldzuordnung | Summe |
|---|---:|---:|---:|---:|---:|
| openalex (Theorie) | 3.133 | 488 | 1.612 | 0 | 5.233 |
| starts (Werke) | 0 | 1.209 | 0 | 4 | 1.213 |
| **Summe** | **3.133** | **1.697** | **1.612** | **4** | **6.446** |

Zum ersten Mal seit Beginn der Messung fehlt eine Zeile: **ArtBase trägt diesen Monat überhaupt nichts bei** — weder Kandidaten noch Ablehnungen (Details unten). Der Erschöpfungsgrad der verbliebenen Quellen: OpenAlex 9,3 % `bereits-im-atlas` (488 von 5.233, weiter steigend — Juli 2,0 %, August 4,9 %, September 7,4 %, jetzt Oktober 9,3 %, eine über vier Monate glatte Linie), S+T+ARTS 99,7 % (1.209 von 1.213, unverändert erschöpft). Der Gesamtanteil `bereits-im-atlas` an allen Ablehnungen fällt auf 26,3 % (1.697 von 6.446), deutlich unter den 42,1 % im September — das ist aber keine Verbesserung, sondern ausschließlich der Wegfall von ArtBase, das in jedem Vormonat mit 100 % `bereits-im-atlas` den größten Einzelposten stellte.

## Grund × Feld (thematischer Sweep, Felder 8–13)

982 der 6.446 Ablehnungen (15,2 %) lassen sich einem der 13 Felder zuordnen — deutlich weniger als in jedem Vormonat (Juli 38 %, August 37,5 %, September 31,9 %). Der Grund ist derselbe wie oben: ArtBase war die einzige Quelle, die ausnahmslos mit einer Feldkennung lief, und liefert diesen Monat keinen einzigen Treffer.

| Feld | n verworfen | unter-schwelle | identifier-nicht-aufloesbar | bereits-im-atlas |
|---|---:|---:|---:|---:|
| 10 — Fehler & Rauschen | 242 | 158 | 52 | 32 |
| 12 — Sprache & Generativität | 209 | 142 | 36 | 31 |
| 8 — Wahrnehmung & Maßstab | 198 | 140 | 58 | 0 |
| 9 — Zeit & Archiv | 129 | 78 | 51 | 0 |
| 11 — Körper & Intimität | 120 | 91 | 28 | 1 |
| 13 — Material & Sinne | 80 | 54 | 26 | 0 |
| 1 — Material & planetare KI-Kosten (Familie Macht) | 4 | 0 | 0 | 0 (4 keine-feldzuordnung) |

Die verbliebenen Feldtreffer kommen jetzt ausschließlich aus dem OpenAlex-Zweig des Theorie-Atlas (dem thematischen Sweep über die sechs neuen Felder); die alten „Macht"-Felder (2–7), die in August und September noch 1 bis 54 reklassifizierte S+T+ARTS-Funde je Feld trugen, bleiben im Oktober vollständig leer — der Urteilsschritt hat in 15 Läufen keinen einzigen Kandidaten in eines dieser Felder eingeordnet. Die vier Fälle unter „Feld 1" sind, wie in den Vorberichten, keine echten Treffer, sondern derselbe `keine-feldzuordnung`-Fall viermal wiederholt (siehe unten).

## ArtBase: von Erschöpfung zu Stille

August und September zeigten ArtBase bei exakt konstanten, aber von null verschiedenen Ablehnungszahlen je Feld (39/39/36/40/20/28), ausnahmslos mit dem Grund `bereits-im-atlas`. Im Oktober ändert sich das Bild vollständig: Alle 62 Durchläufe des Monats (zwei Felder pro Nacht, sechs Felder im Dreitagesrhythmus) liefern `kandidaten: []`, `verworfen: []` und `ausfaelle: []` — buchstäblich nichts. Das ist kein Erschöpfungsmuster (dafür bräuchte es Treffer, die als Dubletten erkannt werden), sondern das Muster eines Quellenausfalls, der nirgends als solcher vermerkt ist.

Eine Stichprobe gegen `https://artbase.rhizome.org/api.php` am 1.11.2026 — außerhalb der committeten Kandidatendateien, deshalb hier ausdrücklich als Beobachtung außerhalb des Archivs markiert — beantwortet dieselbe Suchanfrage, die der Adapter nächtlich stellt, mit HTTP 403 und einer Cloudflare-Challenge-Seite („Just a moment …", `cf_chl_opt`). Im Code von `artbase.py::_hole()` wird jeder Nicht-200-Status als `QuellenAusfall` geworfen; `ernte()` fängt diese Ausnahme aber pro Suchbegriff ab und überspringt sie mit `continue` (Zeile „ein einzelner Begriff darf ausfallen"), ohne sie in die `ausfaelle`-Liste des Laufs zu übernehmen. Ein vollständiger, über den ganzen Monat anhaltender Ausfall der Quelle sieht dadurch in den committeten Daten identisch aus wie eine Quelle, die ordnungsgemäß lief und nichts Neues fand — das widerspricht der Archivregel „Ausfälle ehrlich vermerken … nie still überbrückt" (`.claude/rules/pipelines-and-archive.md`).

## S+T+ARTS: die Erschöpfung vertieft sich weiter, die Drehung bleibt aus

| Abfragejahr | akzeptiert | verworfen | Annahmequote |
|---|---:|---:|---:|
| starts:2024 | — | — | nicht abgefragt (2. Monat in Folge) |
| starts:2025 | 0 | 310 | 0,0 % (2. Monat in Folge) |
| starts:2026 | 31 | 899 | 3,3 % |

starts:2024 — im August mit 57,7 % die einzige nennenswerte Neufundquelle — wurde auch im Oktober kein einziges Mal abgefragt, ebenso wie im September. starts:2025 bleibt beim zweiten Mal in Folge bei exakt 0,0 %. Die seit August wiederholte Empfehlung, die Abfrage auf ältere Jahrgänge umzustellen, ist damit den dritten Monat in Folge nicht umgesetzt.

## Der einzige Werke-Kandidat des Monats: „Creative Intelligence"

Alle 31 im Oktober vom Scout vorgeschlagenen Werke-Atlas-Kandidaten sind derselbe Titel: „Creative Intelligence: Reimagining Supercomputing through Artistic Research" (Barcelona Supercomputing Center, 2026, S+T+ARTS Prize), jeden Tag mit identischer `vorschlags_id`, identischer Prüfung und Punktzahl 1,0. Die Aufnahme (`aufnahme.py::pruefe_kandidat`) weist ihn trotzdem jede Nacht ab, aus einem Grund, der sich jetzt im Code genau benennen lässt: Direkt geerntete S+T+ARTS-Funde tragen als `herkunft.ausgehend_von` die generische Platzhalter-Saat `dataphys-liste` (`run.py::SAAT_LISTE`), nicht eine echte `thema-N`-Kennung — `_feld_aus_saat()` liefert dafür `None`, und ohne Feld lässt die Aufnahme keinen Kandidaten durch. Das ist laut README gewollt: Genau diese Lücke soll der separate Urteilsschritt schließen, der den Titel liest und ihm über `extern.py` ein echtes Feld zuweist.

Der Urteilsschritt lief im Oktober 15-mal (gegenüber 6 im September) und versuchte an vier Tagen (17., 21., 23., 24.10.) erneut, „Creative Intelligence" ein Feld zuzuweisen — alle vier Versuche scheiterten mit derselben Meldung wie in August und September, „Feld None gibt es nicht", diesmal unter der Herkunftskennung `thema-1-material-planetare-ki-kosten` (dem ersten Eintrag in `THEMEN`, auf den `extern.py` zurückfällt, wenn das übergebene `feld` ungültig ist). Keiner der 15 Urteilsschritt-Läufe löste irgendeinen Kandidaten ein — anders als im September, wo zumindest zwei der vier offenen Fälle (Echorroes, Neutone Morpho) gelöst wurden. Der Werke-Atlas-Zweig der Pipeline hat im Oktober damit keinen einzigen neuen Eintrag erzeugt; drei Monate in Folge scheitert derselbe, inhaltlich einschlägige Titel an genau derselben Stelle.

## Das Doppelgänger-Phänomen hält an

Auch im dritten Monat seit seiner Entdeckung taucht derselbe Fund innerhalb eines Laufs sowohl als Kandidat als auch als Ablehnung auf — 12 Fälle im Oktober. Zwei Titel aus dem September-Bericht wiederholen sich mit nahezu identischen Zahlenpaaren: „Evolution of Modern Literature and Film" (Sobchuk) scheitert am 9.10. erneut mit 0,333 (September: 0,333), „Horizons for the Enactive Mind" scheitert am 11. und 18.10. mit jeweils 0,275 (September: 0,275). Neu hinzu kommt „Plain Text: The Poetics of Computation", das im Oktober viermal (7., 13., 19., 25.10., jeweils im thematischen Sweep zu Feld 12) mit nahezu gleicher Punktzahl (0,239–0,241) doppelt erfasst wird, sowie „Generative AI", das am 15. und 16.10. zweimal mit HTTP 403 scheitert, nachdem es im selben Lauf bereits aufgelöst war. Die Wiederholung über drei Monate mit stabilen Zahlenpaaren macht einen einmaligen Zufall unwahrscheinlicher und stützt weiter die im September geäußerte Vermutung eines reproduzierbaren Erfassungsfehlers im Erntepfad.

## Beharrlich mehrfach abgewiesen

Von 2.704 im Oktober einzigartigen verworfenen Titeln tauchen 1.199 an mehr als einem Kalendertag auf, davon 1.054 nicht ausschließlich mit dem Grund `bereits-im-atlas`. Die fünf Titel an der Spitze sind, vierten Monat in Folge, dieselben wie im Juli benannt:

| Titel | n Tage | Grund | Herkunft |
|---|---:|---|---|
| Susquehanna Chorale Spring Concert "Roots and Wings" | 26 | unter-schwelle | openalex |
| FEATURES AND DIFFERENCES OF ADEQUATE AND EQUIVALENT TRANSLATION | 22 | unter-schwelle | openalex |
| "Kindertransport," Oct. 5, 6, and 7, 8:00 p.m. | 22 | unter-schwelle | openalex |
| A GEOMETRIC MEAN IN THE FURUTA INEQUALITY | 22 | unter-schwelle | openalex |
| DETERMINING QUALITY REQUIREMENTS AT THE UNIVERSITIES … | 20 | identifier-nicht-aufloesbar | openalex |

Neu ist, dass sich unterhalb dieser fünf zwei fachfremde, nicht-englische Titel mit ähnlicher Beharrlichkeit zeigen: eine russischsprachige Analyse diplomatischer Dokumente (22 Tage) und eine ukrainischsprachige Studie zu Investitionsregulierung (15 Tage). Wie die im September beschriebenen Wiederholer erreichen auch diese beiden Titel die Nachbarschaftssuche nicht über ein oder zwei feste schwache Saatgut-Einträge, sondern über 5 bis 6 verschiedene `ausgehend_von`-Pfade — ein Hinweis, dass das Rauschen in der saatgutbasierten Nachbarschaftssuche breiter sitzt, als mit dem Reparieren einzelner Saat-Einträge zu beheben wäre.

## unter-schwelle: wie knapp ist „knapp"?

Von 3.133 `unter-schwelle`-Ablehnungen (Schwelle 0,35) liegen 976 (31,2 %) unter 0,15, 1.360 (43,4 %) zwischen 0,15 und 0,30, und 797 (25,4 %) im knappen Band zwischen 0,30 und 0,35 — ein ähnliches Verhältnis wie in den Vormonaten. Direkt unterhalb der Schwelle (0,345–0,350) liegen 133 Ablehnungen zu 82 einzigartigen Titeln, weiterhin überwiegend zu KI und Kreativität. Bemerkenswert: Zwei der im August-Bericht namentlich genannten Grenzfälle — „Who authors AI art? (And why does it matter?)" und „Towards a mixed human–machine creativity" — scheitern im Oktober erneut im exakt selben Band, drei Monate nach ihrer ersten Nennung unverändert unterhalb der Schwelle. Das stützt die im August formulierte Vermutung, dass die Gewichtung aus `frei_zugaenglich` und `aktualitaet` diese Titelgruppe systematisch knapp unter die Schwelle drückt, eher als einen einmaligen Ausreißer.

## identifier-nicht-aufloesbar: weiterhin fast nur HTTP 403, weiterhin nur im Theorie-Atlas

Von 1.612 Fällen sind 1.364 (84,6 %) HTTP 403 — nahezu identisch zu August (86,9 %) und September (85,7 %) —, dazu 54 ConnectTimeout, 50 HTTP 404, 46 ConnectError, 30 HTTP 429, 22 HTTP 503, 21 ReadTimeout, 9 HTTP 405, 6 HTTP 500 und vereinzelte weitere Codes. Wie in jedem Vormonat trifft die Prüfung überwiegend auf automatisierungsfeindliche Verlage statt auf tote Links, und der Werke-Atlas ist davon unberührt — alle 1.612 Fälle stammen aus dem OpenAlex-Zweig.

## Vorschläge

1. **Den stillen Fehlerfang in `artbase.py::ernte()` durch einen echten `ausfaelle`-Eintrag ersetzen.** 62 von 62 Durchläufen im Oktober lieferten `kandidaten: []`, `verworfen: []` und `ausfaelle: []` gleichzeitig — ein Muster, das sich von einem korrekt laufenden, aber ergebnislosen Lauf nicht unterscheiden lässt. Die externe Stichprobe vom 1.11. zeigt HTTP 403 (Cloudflare-Challenge) auf jede Anfrage; ohne eine Änderung an der Fehlerbehandlung bleibt ein vollständiger Quellenausfall im Archiv unsichtbar, solange niemand von außen nachprüft.

2. **ArtBase entweder technisch reparieren (anderer Zugang/Header) oder bewusst als inaktiv markieren, statt nächtlich sechs leere Dateien zu erzeugen.** Die in Juli bis September wiederholte Empfehlung, ArtBase zu drosseln oder abzuschalten, hat sich von selbst erledigt — die Quelle liefert nichts mehr, ohne dass jemand das veranlasst hätte. Ob sie reparierbar ist, lässt sich aus den Kandidatendateien nicht sagen (siehe unten).

3. **Den Urteilsschritt für „Creative Intelligence: Reimagining Supercomputing through Artistic Research" gezielt untersuchen, statt den Titel weiter täglich neu zu ernten.** Der Kandidat erreicht seit mindestens drei Monaten Punktzahl 1,0 und scheitert bei jedem der insgesamt mindestens elf dokumentierten Zuordnungsversuche (August bis Oktober) an derselben Meldung „Feld None gibt es nicht", während zwei inhaltlich ähnliche S+T+ARTS-Funde im September erfolgreich zugeordnet wurden. Eine einzelne gezielte Prüfung, warum ausgerechnet dieser Titel durchfällt, wäre günstiger als 31 weitere nächtliche Wiederholungen ohne Fortschritt.

4. **Erntepfad auf die Doppelgänger-Doppelerfassung prüfen.** Das Phänomen hält seit September mit denselben Titeln und nahezu identischen Punktzahlen an (12 Fälle im Oktober) — die Stabilität über drei Monate macht einen Zufall unwahrscheinlich und eine Prüfung von `ernten.py` auf doppelte Zitationspfade zum selben Fund lohnender als im September vermutet.

5. **Die Nachbarschaftssuche des Theorie-Atlas gegen thematisch irrelevante Treffer breiter absichern, nicht nur an einzelnen Saatgut-Einträgen.** Dieselben fünf fachfremden Titel stehen seit Juli unverändert oben, und die beiden neuen nicht-englischen Wiederholer erreichen die Suche über 5 bis 6 verschiedene Saatgut-Pfade statt über einen einzigen — eine Reparatur, die an „den vier schwachen Seeds" ansetzt, würde dieses breitere Muster nicht fassen.

## Was dieser Bericht nicht sagen kann

Der ArtBase-Befund stützt sich auf eine einmalige externe Stichprobe vom 1.11.2026, außerhalb der committeten Kandidatendateien — sie erklärt das beobachtete Muster plausibel, ist aber selbst kein Datenpunkt aus dem Archiv und kann sich geändert haben, bis dieser Bericht gelesen wird; ob der Cloudflare-Schutz dauerhaft ist oder sich lockert, zeigen die Dateien nicht. Warum der Urteilsschritt „Creative Intelligence" kein Feld zuweisen kann, während er bei inhaltlich ähnlichen Fällen im September erfolgreich war, lässt sich aus der Fehlermeldung allein nicht klären — nur dass es wiederholt geschieht. Die Ursache des Doppelgänger-Phänomens bleibt ebenfalls offen: Abgelehnte Einträge tragen keine Rohsignale, nur die angenommene Seite eines Paares zeigt, welche Gewichtungsanteile griffen. Und wie in jedem Monat zuvor prüft die Identifier-Prüfung nur, dass ein Ziel antwortet, nicht dass Titel, Urheber und Jahr zusammenpassen — über mögliche Fehlzuschreibungen unter den 2.930 im Oktober angenommenen bzw. vorgeschlagenen Kandidaten kann dieser Bericht nichts aussagen.
