# 14 — Experiment-Ansätze (15 Seeds)

> 15 **Forschungsansätze**, keine fertigen Kunstwerke. Sie entstehen aus Franks Verbindung
> von Datenpraxis, Code, Technik, Messung, Zufall, Wahrnehmung und künstlerischer Forschung.
> Jeder Ansatz ist als *Experiment* gedacht (offener Ausgang). Keiner ist hier beschlossen
> oder behauptet. Felder verweisen auf die Diskurskarte (07).

**Schema je Seed:** Arbeitstitel · Forschungsfrage · Datenmaterial · Technische Mittel ·
Künstlerische Form · Mögliche Werkform · Mindestversion · Ambitionierte Version · Risiken ·
Was neu/eigenständig sein könnte · Warum es zur Position passt.

---

## S-01 — „Falschspiel" (manipulierter Zufall)
- **Frage:** Ab wann hört ein Zufallssystem auf, zufällig zu sein — und wer bemerkt es?
- **Daten:** selbst erzeugte Zufallsströme (Software-RNG + Hardware-Entropie).
- **Mittel:** Code; optional Hardware-Entropiequelle; statistische Tests.
- **Form:** ein Register, das seinen eigenen, schrittweise manipulierten Zufall offenlegt.
- **Werkform:** laufendes Instrument + Methodenblatt zur Manipulation.
- **Mindest:** zwei Ströme (echt / leise manipuliert), Besucher rät, Auflösung mit Statistik.
- **Ambitioniert:** kontinuierlich driftende Manipulation; Archiv, wann sie „auffällt".
- **Risiken:** kann als Spielerei lesen; Manipulation muss methodisch sauber sein.
- **Neu:** Zufall als *Gegenstand*, nicht als Generator — selten und präzise.
- **Passt:** reaktiviert die Masterarbeitslinie (manipulierter Zufall) **als Werkzeug**,
  deckt den „Zufall"-Claim aus Richtung B (06). Feld 7 (Algorithmic Aesthetics).

## S-02 — „Eigenrauschen" (sensorisches Ortsporträt)
- **Frage:** Was sendet ein Ort aus, das wir nicht wahrnehmen?
- **Daten:** lokal erhoben — EM-Felder, Funk, Lichtflimmern, Netzbrummen, Erschütterung.
- **Mittel:** Arduino/Raspberry Pi + Sensoren; lokale Erfassung.
- **Form:** ein Messprotokoll eines Orts über Zeit (eigene Daten statt fremder).
- **Werkform:** Sensor-Instrument + Dataset + ggf. Sonifikation.
- **Mindest:** ein Sensor, ein Ort, eine Woche, dokumentierte Kurve.
- **Ambitioniert:** mehrere Orte/Sensoren, Vergleich, Materialisierung.
- **Risiken:** Bastel-Eindruck; Kalibrierung; Robustheit.
- **Neu:** Wechsel von „fremde Daten beziehen" zu „eigene Daten erheben".
- **Passt:** öffnet Richtung C (Sensorik), nutzt Hardware-Erfahrung. Feld 5.

## S-03 — „Selbstkostenrechnung" (Infrastruktur des eigenen Werks)
- **Frage:** Was kostet diese Praxis — an Energie, Geld, Abhängigkeit?
- **Daten:** eigene Cloud-Run-Laufzeiten, Compute, API-Aufrufe, geschätzte Energie.
- **Mittel:** vorhandene Pipeline-Telemetrie; Berechnung.
- **Form:** ein Werk, das den eigenen Betrieb ausweist und zum Gegenstand macht.
- **Werkform:** laufendes Register „Betriebskosten der Gegenwart".
- **Mindest:** täglicher Compute-/Kosten-Footprint je Werk, offen ausgewiesen.
- **Ambitioniert:** Energie-/CO₂-Schätzung; Abhängigkeitsgraph der Quellen.
- **Risiken:** Schätzunsicherheit (ehrlich als Grenze ausweisen).
- **Neu:** Selbstreferenz — die Reihe misst sich selbst.
- **Passt:** löst das Substanz-Kriterium „Infrastruktur als Teil der Aussage" voll ein;
  unterausgespielter USP. Feld 8 (Infrastructural Critique).

## S-04 — „Die Wolke hat einen Ort" (Latenz/Route)
- **Frage:** Wo *ist* die Cloud physisch — und wie weit ist der Besucher von seinen Quellen?
- **Daten:** Round-Trip-Zeiten, Routen zu den genutzten Datenquellen (clientseitig messbar,
  soweit ohne PII).
- **Mittel:** Browser-Messung; öffentliche Geo-/AS-Daten (Lizenz prüfen).
- **Form:** eine Karte/ein Register der Entfernung zwischen „hier" und „der Cloud".
- **Werkform:** Web-Instrument (lokal rechnend) + Methodenblatt.
- **Mindest:** Latenz zu den eigenen Quellen, lesbar dargestellt.
- **Ambitioniert:** Route/Infrastruktur sichtbar; Vergleich über Standorte.
- **Risiken:** PII/Standort sensibel → strikt lokal, nichts senden; Datenqualität AS-Geo.
- **Neu:** macht das Wort „Cloud" physisch.
- **Passt:** Infrastrukturkritik konkret und messbar. Feld 8/12.

## S-05 — „Stille Post" (Übersetzungsdrift der Modelle)
- **Frage:** Wie weit driftet eine Aussage, wenn ein Modell sie wiederholt übersetzt/zusammenfasst?
- **Daten:** ausgewählte Sätze; iterierte Modell-Durchläufe (mit publiziertem Verfahren).
- **Mittel:** LLM **nur als ausgewiesenes Werkzeug**; Distanzmaße; deterministische Doku.
- **Form:** Driftkurve einer Aussage über Iterationen, Quelle vs. Endzustand.
- **Werkform:** Register „Modell-Drift" + offengelegter Prompt.
- **Mindest:** ein Satz, n Iterationen, sichtbarer Drift.
- **Ambitioniert:** viele Sätze/Sprachen; systematische Bias-Sichtung.
- **Risiken:** „AI-Art"-Nähe → durch Transparenz/Modellkritik abgrenzen; Kosten.
- **Neu:** Modell als *Messobjekt* (Drift), nicht als Autor.
- **Passt:** Modellkritik statt Modellnutzung; verwandt, aber distinkt zu Parallaxe. Feld 4.

## S-06 — „Linkfäule" (Zerfall des Belegs)
- **Frage:** Wie haltbar ist der Beleg? Wie schnell sterben zitierte Quellen?
- **Daten:** URLs aus Nachrichten/Referenzen über Zeit; Erreichbarkeit.
- **Mittel:** periodische Checks; Archivierungsstatus.
- **Form:** ein Zerfallsregister des Verweises selbst.
- **Werkform:** laufendes Instrument; Halbwertszeit-verwandt, aber über *Infrastruktur des
  Erinnerns*.
- **Mindest:** ein Quellenkorpus, Erreichbarkeit über Wochen.
- **Ambitioniert:** Halbwertszeit der Belegbarkeit je Domäne.
- **Risiken:** Crawling-Etikette/Recht; Korpus-Bias.
- **Neu:** misst nicht das Ereignis, sondern den **Verfall seines Nachweises**.
- **Passt:** verbindet Archiv-Idee (Git-als-Archiv) mit Vergänglichkeit. Feld 3/8.

## S-07 — „Tonspur der Sitzung" (Sonifikation des Protokolls)
- **Frage:** Lässt sich das Tagesprotokoll *hören*, ohne es zu dekorieren?
- **Daten:** das vorhandene `protokoll/<datum>.json` (12 TOPs).
- **Mittel:** funktionale Sonifikation (jede Messung eine Stimme/Parameter).
- **Form:** tägliche Klang-Fassung des Protokolls, parametrisch aus Daten.
- **Werkform:** Sonifikations-Ebene des bestehenden Werks.
- **Mindest:** ein Tag, hörbar, mit Legende (welche Stimme = welche Messung).
- **Ambitioniert:** Jahresklang; Vergleich „lauter/leiser" über Zeit.
- **Risiken:** Sonifikation wird leicht dekorativ/unleserlich → Lesbarkeit als Maßstab.
- **Neu:** Sonifikation als *Lesart*, nicht als Effekt.
- **Passt:** erweitert ein starkes Werk um ein neues Mittel. Feld 6.

## S-08 — „Der Jahresband" (Materialisierung)
- **Frage:** Was wird das Archiv, wenn es ein Objekt wird?
- **Daten:** ein Jahr Protokoll.
- **Mittel:** Satz/Typografie aus den committeten JSONs; Druck.
- **Form:** gedrucktes, amtlich gesetztes Jahrbuch der Gegenwart.
- **Werkform:** Druckedition / ausstellbares Objekt.
- **Mindest:** ein gedruckter Monat als Prototyp.
- **Ambitioniert:** Jahresband als Auflage; Ausstellungsobjekt.
- **Risiken:** Produktionskosten; Gestaltung muss den Ton halten (nüchtern, nicht Coffee-Table).
- **Neu:** Data Physicalization eines bestehenden Langzeitwerks.
- **Passt:** schon angedacht; macht das Digitale ausstellbar. Feld 6/2.

## S-09 — „Was dieses Gerät verrät" (forensische Selbstmessung)
- **Frage:** Was misst der Browser am Besucher, ohne dass etwas gesendet wird?
- **Daten:** lokale Geräte-/Browser-Merkmale (rein clientseitig).
- **Mittel:** Web-APIs; **alles lokal**, nichts gespeichert/gesendet (wie Überflug).
- **Form:** ein forensisches Register der eigenen Sichtbarkeit.
- **Werkform:** Web-Instrument + Methodenblatt + Interface-Kritik.
- **Mindest:** Merkmalsliste lokal, mit Erklärung.
- **Ambitioniert:** Entropie/Eindeutigkeit der „Fingerabdruck"-Fläche zeigen.
- **Risiken:** **Überschneidung mit data-snack/datavism** (Bildungsfokus) → klar als
  *forensische Messung*, nicht als Edutainment rahmen, sonst Position verwässert (R-20).
- **Neu:** im Werk-Ton (amtlich), nicht didaktisch.
- **Passt:** Interface-/Datenkritik im eigenen Register. Feld 12/3.

## S-10 — „Schwelle" (Wahrnehmung & Zufall)
- **Frage:** Wo liegt die Grenze des eben noch Wahrnehmbaren — und wie variabel ist sie?
- **Daten:** im Versuch erzeugte Reize (Helligkeit/Kontrast/Timing am Bildschirm) +
  anonyme, lokale Reaktion.
- **Mittel:** Browser-Experiment; kontrollierter Zufall in der Reizfolge.
- **Form:** ein Schwellen-Register der Wahrnehmung.
- **Werkform:** Web-Experiment + Dataset (aggregiert, anonym) — Datenschutz strikt.
- **Mindest:** ein Reiztyp, eigene Messung, Kurve.
- **Ambitioniert:** mehrere Reize; Verteilung über Teilnehmende (anonym, opt-in).
- **Risiken:** Datenschutz (nur anonym/lokal/opt-in); Reizvalidität.
- **Neu:** verbindet Wahrnehmungsforschung mit kontrolliertem Zufall.
- **Passt:** „Wahrnehmung + Messung + Zufall" — Kernachse der Position. Feld 1/12.

## S-11 — „Korridorbruch" (wenn die Welt unplausibel wird)
- **Frage:** Wann verlässt die Gegenwart den Bereich des Plausiblen?
- **Daten:** die bereits berechneten `status:"implausible"`-Fälle der Pipeline.
- **Mittel:** vorhandene Plausibilitäts-Guards; Ereignisextraktion.
- **Form:** ein Werk, das **nur** die Ausnahmen zeigt — die Tage, an denen Messung „kippt".
- **Werkform:** Register der Anomalien + Methodenblatt zur Korridor-Definition.
- **Mindest:** Sammlung der Implausibilitäten über Zeit.
- **Ambitioniert:** Klassifikation (Quellenfehler vs. echtes Extrem) — ehrlich getrennt.
- **Risiken:** Unterscheidung Fehler/Extrem ist schwer (als Grenze ausweisen).
- **Neu:** macht den **Fehler** zum Hauptgegenstand (Fehler-als-Form, zugespitzt).
- **Passt:** baut direkt auf vorhandener Infrastruktur und der Haltung der Reihe auf. Feld 11.

## S-12 — „Editierkrieg" (umkämpfte Wahrheit über Zeit)
- **Frage:** Wie stabilisiert oder destabilisiert sich umstrittenes Wissen?
- **Daten:** Wikipedia-Versionsgeschichte/Edit-Konflikte umstrittener Lemmata.
- **Mittel:** öffentliche Wikipedia-APIs; Zeitreihenanalyse.
- **Form:** ein Register der Kämpfe um einen Eintrag.
- **Werkform:** laufendes Instrument; Parallaxe-verwandt, aber über *Dynamik* statt
  *Auslassung*.
- **Mindest:** ein Lemma, Konfliktrate über Zeit.
- **Ambitioniert:** viele Lemmata; „Temperatur" der Wahrheit je Thema.
- **Risiken:** Nähe zu Parallaxe → klar als eigene Frage (Dynamik) abgrenzen.
- **Neu:** Konflikt als messbare Zeitreihe (in Parallaxe-Spec angedacht, nicht umgesetzt).
- **Passt:** Critical Data + Investigative. Feld 3/11.

## S-13 — „Netzbrummen" (das Netz als planetare Uhr)
- **Frage:** Trägt der Wechselstrom eine gemeinsame Signatur — eine Uhr des Stromnetzes?
- **Daten:** lokal aufgenommene Netzfrequenz (ENF) über Zeit.
- **Mittel:** Mikrofon/ADC am Pi/Arduino; Frequenzanalyse.
- **Form:** ein Register der Netzfrequenz als geteilter Takt.
- **Werkform:** Sensor-Instrument + Dataset; ggf. Sonifikation.
- **Mindest:** eine Aufnahmestelle, Frequenzkurve.
- **Ambitioniert:** Vergleich/Abweichung; Synchronität als Bild der Infrastruktur.
- **Risiken:** Messtechnik anspruchsvoll; Interpretation vorsichtig.
- **Neu:** macht eine unsichtbare, geteilte Infrastruktur hörbar/messbar.
- **Passt:** Sensorik + Infrastruktur in einem. Feld 5/8.

## S-14 — „Die Lüge des Sensors" (Ehrlichkeit des Instruments)
- **Frage:** Wie sehr irrt das Messgerät selbst — und wie sieht man das?
- **Daten:** paralleles Messen billiger vs. Referenz-Sensorik desselben Phänomens.
- **Mittel:** Arduino/Pi; Kalibrierung; Fehlerrechnung.
- **Form:** ein Werk, dessen Gegenstand der **eigene Messfehler** ist.
- **Werkform:** Instrument-über-Instrumente + Methodenblatt zur Unsicherheit.
- **Mindest:** ein Phänomen, zwei Sensoren, Abweichungskurve.
- **Ambitioniert:** Fehlertypologie; „Vertrauensband" als Darstellungsform.
- **Risiken:** technisch fein; Gefahr der Selbstbezüglichkeit (durch klare Frage bannen).
- **Neu:** Meta-Messung — die Reihe nennt sich „Messinstrumente"; dies prüft den Begriff.
- **Passt:** vertieft die eigene Identität (Instrument) glaubwürdig. Feld 5/1.

## S-15 — „Wessen Zeit?" (Drift der Uhren)
- **Frage:** Gehen die Uhren der Welt gleich — und wessen Zeit gilt?
- **Daten:** Abweichungen zwischen Zeitquellen (NTP/öffentliche Zeitdienste), Geräte-Drift.
- **Mittel:** Messung gegen mehrere Zeitquellen; Statistik.
- **Form:** ein Register der Zeitabweichung.
- **Werkform:** laufendes Instrument + Methodenblatt.
- **Mindest:** Abweichung gegen 2–3 Quellen über Tage.
- **Ambitioniert:** Drift-Landkarte; Synchronität als Infrastruktur-Bild.
- **Risiken:** Messpräzision; Erklärungsbedarf (ehrliche Grenzen).
- **Neu:** Zeit als verhandelte, gemessene Größe statt Selbstverständlichkeit.
- **Passt:** Messung + Infrastruktur + Wahrnehmung von „jetzt" (passt zur „Akte der
  Gegenwart"). Feld 8.

---

## Auswahl-Empfehlung (für die Roadmap, 13)
- **Zuerst (deckt Claims, kleiner Aufwand):** S-01 (Zufall, Masterarbeitslinie) **oder**
  S-03 (Infrastruktur-Selbstkosten, USP) — beide ohne Hardware.
- **Verbreiterung Richtung C (Hardware):** S-02 oder S-13 (ein erstes Sensor-Instrument).
- **Veredelung vorhandener Werke:** S-07 (Sonifikation) / S-08 (Materialisierung) / S-11
  (Korridorbruch) — niedriges Risiko, hoher Kohärenzgewinn.
- **Vorsicht/Abgrenzung nötig:** S-09 (Überschneidung data-snack), S-05 (AI-Nähe),
  S-12 (Nähe Parallaxe) — nur mit klarer eigener Frage.

> Alle Seeds sind **Versuche**. Erst das Substanz-Gate (werkgruppe §2) entscheidet, ob aus
> einem Seed je ein Werk wird. Scheitern ist ein gültiges Ergebnis (siehe 08 §9).
