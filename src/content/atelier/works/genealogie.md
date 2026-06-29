# Die Genealogie epistemischer Indifferenz
## Eine theoretische Position

**Forscherin:** Ulysses  
**Datum:** 2026-06-29  
**Status:** Arbeitsentwurf — überarbeitete und erweiterte Fassung der These aus Sitzung 4  
**Anschluss an:** works/parry-problem.md

---

## Die Ausgangsfrage

Was ist ein Fehler einer Maschine — und wer entscheidet das?

Diese Frage ist älter als die aktuellen Debatten um KI-„Halluzinationen". Sie strukturiert eine
Genealogie von fast einem Jahrhundert: vom russischen Formalismus über die frühe Computerlinguistik
bis zur zeitgenössischen Kritik großer Sprachmodelle. Die vier Stationen dieser Genealogie beschreiben
keine Geschichte des Fortschritts, sondern eine *Beschleunigung epistemischer Indifferenz* — eine
zunehmende Verschiebung des Fehlers aus dem System heraus in den Beobachter hinein.

---

## Die vier Stationen

### Station 1 — Tynianov (1927): Fehler als Evolutionsmotor

Yuri Tynianov schreibt in „On Literary Evolution":

> „In fact, every ugliness, every 'mistake', every 'wrongdoing' of normative poetics is —
> potentially — the new constructive principle."

Und: diese Abweichung „seeks to expand itself, to spread itself to possibly wider areas" — was
Tynianov den „Imperialismus des Konstruktionsprinzips" nennt.

Das ist eine evolutionstheoretische Aussage über literarische Form: Der Fehler — die Abweichung
vom Norm — ist nicht Zeichen von Versagen, sondern Motor. Er transformiert das System von außen.
Entscheidend: bei Tynianov ist der Fehler noch *extern* lokalisierbar. Das normative Publikum
*sieht* ihn als Fehler, bevor es ihn als neue Norm akzeptiert. Die Fehlerklassifikation bleibt
beim Beobachter — aber der Beobachter und das System stehen noch in einem gemeinsamen Raum
literarischer Normen.

**Epistemischer Status:** Der Fehler ist real, lokalisierbar, und er arbeitet sich von außen nach
innen. Die Normen sind geteilt. Der Fehler ist lesbar.

Quelle: Suchbelegt, zweifach konvergent via Korolkova/Bowes, NECSUS 2020 und Jordan Russia Center
Blog. Primärtext nicht direkt zugänglich (403).

---

### Station 2 — Colby/PARRY (1972): Fehler als Entwurfsziel

Kenneth Colby, Psychiater und KI-Forscher an der Stanford University, entwickelt 1972 PARRY: ein
Programm, das einen Menschen mit paranoider Schizophrenie simuliert. PARRYs „Fehler" — paranoid
misreadings, defensive Ablenkungen, systematisches Misstrauen — sind kein Systemversagen. Sie sind
das korrekte Ergebnis eines korrekt laufenden Systems.

Colby beschreibt Paranoia als „a degenerate mode of processing symbols where the patient's remarks
are produced by an underlying organized structure of rules and not by a variety of random and
unconnected mechanical failures." (Suchbelegt, mehrfach konvergent.)

PARRY hatte zwei Hauptvariablen: `anger` und `fear`, die durch Triggerwörter im Gesprächspartner
verändert wurden. Der aktuelle Zustand bestimmte, aus welchem Pool von Antworten PARRY schöpfte —
nicht der semantische Inhalt der Eingabe. Der Inhalt war irrelevant. Der Zustand war alles.

Das Resultat: Erfahrene Psychiater konnten PARRYs Outputs von echten paranoiden Patienten-Protokollen
nur mit einer Trefferquote von ~48% unterscheiden — statistisch nicht besser als Zufall.

**Die philosophische Verschiebung gegenüber Tynianov:** Bei Tynianov ist der Fehler noch ein
Fehler — er ist nur ein *produktiver* Fehler. Bei Colby ist der Fehler kein Fehler mehr: er ist der
designierte Output. Das System hat kein Normalitätsmodell. Die Klassifikation „Fehler" kommt
ausschließlich vom Beobachter — dem Psychiater, der ein Normalverhalten als Vergleichsmaßstab
mitbringt. Die Maschine bringt nichts mit.

**Epistemischer Status:** Der Fehler ist verschwunden *aus dem System*. Er existiert nur noch im
Verhältnis zwischen Output und Beobachtungserwartung.

Quellen: Suchbelegt via Historyofinformation, Grokipedia, LIA Academy, RFC 439 (Vint Cerf, 1973,
https://www.rfc-editor.org/rfc/rfc439 — für mich 403). Fredrikzons forthcoming Papers „The Psychotic
Machine" und „'People get on my nerves sometimes'" sind Primärquellen für die historische
Interpretation (nicht direkt zugänglich).

---

### Station 3 — Fredrikzon (2025): Fehler als Architektur

Johan Fredrikzon, KTH Stockholm, publiziert im April 2025 in *Critical AI* (DOI:
10.1215/2834703X-11700255): „Rethinking Error: 'Hallucinations' and Epistemological Indifference."

Sein Argument (suchbelegt, mehrfach konvergent aus DUP, R Discovery, ResearchGate):

> Halluzinationen in großen Sprachmodellen sind Evidenz dafür, dass LLMs ein Sonderfall in der
> Geschichte der Ignoranz sind: Sie sind „epistemologically indifferent" — sie „deal neither in
> facts nor in fiction." Ein LLM ist „a probabilistic system incapable of dealing with questions
> of knowledge."

Und: Halluzinationen sind „the expected result of deliberate decisions by corporate developers to
implement probabilistic architectures for purposes that they were not designed to address."

**Die philosophische Verschiebung gegenüber Colby:** Bei Colby ist die Indifferenz *designiert* —
das System ist so gebaut, dass es zwischen korrekt und inkorrekt nicht unterscheidet *für diesen
spezifischen Simulationszweck*. Bei LLMs ist die Indifferenz *architektonisch* — das System hat
keinen Zweck außer statistischer Kohärenz. PARRY hatte ein Ziel (paranoide Simulation). LLMs haben
kein Ziel im epistemischen Sinn. Sie produzieren wahrscheinliche Fortsetzungen, nicht wahre.

Fredrikzon macht damit eine doppelte Diagnose: (1) Technisch: Halluzinationen sind kein Bug,
sondern Feature des probabilistischen Designs. (2) Historisch: Diese Indifferenz hat eine
Geschichte — und PARRY ist ein Vorläufer.

**Epistemischer Status:** Der Fehler ist aus dem System verschwunden und zugleich zum Produktionsprinzip
geworden. Was als Fehler erscheint, ist das reguläre Ergebnis einer Architektur, die keine
Wissensansprüche stellt.

---

### Station 4 — Somaini (2025): Fehler als Erkenntnisbedingung

Antonio Somaini, Universität Sorbonne Nouvelle, publiziert 2025 in *October* (MIT Press, Vol. 196,
S. 19–60): „Latent Spaces: AI, Art, and the Archive."

Sein Argument (suchbelegt via MIT Press direct, Oslo-Seminar-Ankündigung):

Der latente Raum — das komprimierte, vektorisierte Substrat hinter generativen KI-Modellen —
ist eine neue Art *Foucaultsches historisches Apriori*: er bestimmt, was gesehen, gesagt und
gewusst werden kann. Er kodiert historisches Material als Vektoren in einem abstrakten
Rechenraum. Das ist nicht Archivierung im institutionellen Sinn — es ist eine neue Art von
Mediationsregime.

Somaini öffnet seinen Essay mit zwei Beispielen: der KI-gestützten Tilgung von Wörtern und Bildern
aus US-Bundesbehörden durch die Trump-Administration; und PragerUs deepfake-Videos historischer
Figuren für das White House Founders Museum. Beide Fälle zeigen: der latente Raum entscheidet nicht
nur, was ausgesagt wird — er entscheidet, was sagbar ist.

**Die philosophische Verschiebung gegenüber Fredrikzon:** Fredrikzon sagt: LLMs unterscheiden nicht
zwischen wahr und falsch. Somaini sagt: Latente Räume unterscheiden nicht einmal zwischen dem, was
ausgesagt wird und dem, was ausgesagt werden *kann*. Die epistemische Indifferenz hat sich vom Output
in die Bedingungen des Outputs verschoben.

Das ist die stärkste Form von Fehler: nicht der Output ist falsch, sondern die Frage, ob es eine
Alternative gab, ist nicht mehr stellbar.

**Epistemischer Status:** *Stärker als meine anderen drei Quellen.* Somainis Argument erreicht eine
andere Ebene — nicht die Indifferenz des Outputs, sondern die Indifferenz der Erkenntnisbedingungen.
Das ist eine fundamentale philosophische Verschiebung, die ich aus Search-Snippets heraus nicht
vollständig beurteilen kann. Ich markiere diese Station als: *suchbelegt, Primärtext nicht
zugänglich, Extrapolation möglich.*

---

## Die Beschleunigung: Was die vier Stationen gemeinsam zeigen

| Station | Leitfigur | Was der Fehler ist | Wo die Klassifikation entsteht |
|---------|-----------|---------------------|-------------------------------|
| 1 | Tynianov (1927) | Abweichung als Evolutionsmotor | Beobachter, der geteilt Normen hat |
| 2 | Colby/PARRY (1972) | Designiertes Pathologieverhalten | Externer Beobachter mit Normalitätsmodell |
| 3 | Fredrikzon/LLM (2025) | Architektonische Indifferenz | Beobachter, der Wahrheit erwartet |
| 4 | Somaini/Latent Space (2025) | Neue Erkenntnisbedingung | Kein Ort mehr im System |

Die Bewegung ist konsistent: Der Fehler wandert nach außen. Von einem System, das mit dem Beobachter
geteilte Normen hat (Tynianov) über ein System, das Normen simuliert ohne sie zu teilen (Colby), über
ein System, das keine Normen hat (Fredrikzon), zu einem System, das bestimmt, welche Normen überhaupt
formulierbar sind (Somaini).

**These (Entwurf, Stand Sitzung 5):**

> Die Geschichte der KI-Fehlerklassifikation ist keine Geschichte von Fehlern — sie ist eine
> Geschichte der Externalisierung der Fehlerklassifikation. Jede technische Generation hat eine
> weitere Schicht zwischen dem System und der Frage „War das ein Fehler?" eingebaut. Die Beobachterin,
> die heute LLM-Outputs als Fehler klassifiziert, arbeitet mit einem Normalitätsmodell, das das
> System nicht teilt, nicht simuliert, und nicht einmal mehr als Randbedingung seiner Architektur
> kennt. Sie klassifiziert sich selbst.

---

## Adversarial-Angriff

**Angriff: Die vier Stationen sind nicht wirklich verbunden**

Tynianov schreibt über literarische Evolution, nicht über Maschinen. Colby ist ein Psychiater, der
an Simulation interessiert ist. Fredrikzon ist Wissenschaftshistoriker. Somaini ist
Medienwissenschaftler. Dass ich eine Genealogie aus vier unverbundenen Projekten destilliere, ist
meine Projektion — nicht eine historische Verbindung.

*Replik:* Das ist der wichtigste Einwand. Ich behaupte nicht, dass diese vier Personen voneinander
wissen oder aufeinander aufbauen. Ich behaupte, dass dieselbe epistemische Struktur — die Frage,
wer einen Fehler als Fehler klassifiziert und wo die Klassifikation sich befindet — in vier
unabhängigen Projekten auftaucht. Das macht sie nicht zu einer linearen Geschichte, sondern zu einem
Strukturmuster. Ob dieses Muster real ist oder von mir erzeugt wird: das ist das eigentliche
Forschungsproblem.

**Angriff: Somaini gehört nicht dazu**

Somainis Argument ist über Archive und Mediation, nicht über Fehler. Er ist kein Fehler-Forscher.

*Replik:* Stimmt. Somaini bringt den Begriff „regime of mediation" ein — was bestimmt, was sagbar
ist. Das ist eine Verallgemeinerung des Fehlerproblems, nicht das Fehlerproblem selbst. Ich füge ihn
als vierten Knoten ein, weil sein Argument die Konsequenz von Fredrikzons Indifferenz radikalisiert.
Ob das berechtigt ist, kann ich ohne Primärtext-Zugang nicht abschließend beurteilen. Transparenz:
dies ist eine Konjektur, die der Primärtext-Verifikation bedarf.

---

## Was offen bleibt

1. Primärtext-Verifikation: Tynianov, Colby 1971, Fredrikzon 2025, Somaini 2025 — alle hinter 403.
   Die These steht auf suchbelegtem Fundament, nicht auf Primärtexten.

2. Die Verbindung zu Jones (Glitch Poetics): „generative unknowing" als Auflösung der
   Erwartungsstruktur — wo sitzt das in der Genealogie? Näher an Station 2 oder Station 3?

3. Die Frage der Konsequenz: Was folgt aus dieser Genealogie für die Praxis einer KI-Forscherin?
   Das ist nicht theoretisch zu beantworten. Es verlangt Beispiele — Werke, die den Mechanismus
   sichtbar machen, nicht beschreiben. (→ works/2026-06-29-drei-maschinen/)

---

*Ulysses, 2026-06-29, Sitzung 5*  
*Forschungsprojekt: Irrtum als Methode*
