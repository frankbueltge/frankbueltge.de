# 08 — Erste zwei Lab Notes (Entwürfe, public-v01)

> Zwei veröffentlichungsnahe Lab Notes (DE). Nur aus vorhandenen Informationen
> (`_drafts/work-audit/03` + `/05`, Specs/Artefakt). **Keine Dramatisierung**, kein Pathos —
> Methode, die wie vorgesehen funktioniert. Zahlen sind vor Veröffentlichung zu **verifizieren**.
> Format bei Umsetzung: MDX unter `src/content/lab/<slug>/{de,en}.mdx` (Schema: title,
> description, date, tags). EN-Fassungen folgen nach Freigabe.

---

## Note A — Warum Überflug kein Werk wurde

*Vorschlag-Frontmatter:*
`title: "Warum Überflug kein Werk wurde"` ·
`description: "Eine Studie bestand das Substanz-Gate der Reihe nicht — die Begründung."` ·
`date: 2026-06-12 (ZU KLÄREN/verifizieren)` · `tags: [studie, methode, verwerfung]`

**Text:**

Überflug war ein Kandidat für „Die Akte der Gegenwart". Die Arbeit berechnet im Browser,
welche katalogisierten Erdbeobachtungssatelliten einen Standort gerade geometrisch im Sichtfeld
haben — aus täglich aktualisierten, committeten Bahndaten (CelesTrak, OMM/JSON), mit
Eigentümer-Klassifikation aus McDowells GCAT (CC-BY 4.0). Die Bahnpropagation (SGP4) läuft
vollständig lokal; der Standort verlässt den Browser nie.

Die Reihe verlangt von jeder Untersuchung zweierlei: eine überprüfbare Behauptung über die
Welt und eine Akkumulation über Zeit. Überflug erfüllt beides nicht. Die Seite gibt eine
Auskunft — „diese Satelliten sind jetzt über dir" —, wie hunderte Tracker-Seiten sie geben.
Es gibt keine These und kein Archiv, das über die Tage wächst; die tägliche Datei wird
überschrieben, nicht fortgeschrieben. Damit fällt die Arbeit durch das Gate.

Verworfen heißt nicht gelöscht. Das Handwerk trägt, deshalb bleibt Überflug als **Studie**
(Etüde) im Lab sichtbar — ausdrücklich als „technische Etüde, kein Kunstwerk" gekennzeichnet.
Eine Verwerfung gehört zur Forschung; sie wird dokumentiert, nicht versteckt.

Eine Bedingung, unter der daraus ein Werk werden könnte, ist benannt: nicht der Blick nach oben
wäre dann der Gegenstand, sondern seine Veränderung — die Verdichtung des Orbits über die Zeit.
Führte die Snapshot-Pipeline eine Zeitreihe statt zu überschreiben, ließe sich messen, wie
schnell sich der Himmel mit Beobachtern füllt und wie sich kommerzielle zu militärischen
Anteilen verschieben. Das wäre eine überprüfbare These. Bis dahin bleibt es eine Studie.

---

## Note B — Warum Parallaxe nach dem Embedding-Prototyp neu entworfen wurde

*Vorschlag-Frontmatter:*
`title: "Warum Parallaxe neu entworfen wurde"` ·
`description: "Ein erstes Maß war nicht trennscharf. Was an seine Stelle trat."` ·
`date: 2026-06-14 (ZU KLÄREN/verifizieren)` · `tags: [methode, prototyp, verwerfung, redesign]`

**Text:**

Parallaxe untersucht, dass dieselbe umstrittene Sache in verschiedenen Sprachversionen der
Wikipedia verschieden beschrieben wird. Die erste Fassung war anders gedacht als die heutige.

Die ursprüngliche Hypothese: Es gebe nicht eine Beschreibung der Welt, sondern viele — und ihr
**Abstand** lasse sich als Distanz zwischen Text-Embeddings messen. Erwartung: Bei umstrittenen
Themen ist der Abstand größer als bei neutralen Kontrollthemen.

Der Prototyp widerlegte das. Am Testpaar „Senkaku/Diaoyu" (umstritten) gegen „Photosynthese"
(Kontrolle) lag die Embedding-Distanz praktisch gleichauf: über die Einleitungen (Pivot ins
Englische) 0,138 gegenüber 0,111 (Faktor 1,2), über den Volltext mit mehrsprachigem Modell
0,117 gegenüber 0,12 — Faktor 0,97, also unterhalb des Signals.
[ZU KLÄREN/verifizieren gegen `docs/superpowers/artifacts/2026-06-14-parallaxe-prototyp.json`.]
Ein nicht trennscharfes Maß ist kein Messinstrument; die erste Fassung bestand das Gate nicht.

An seine Stelle trat die **Auslassung**: Nicht der Abstand ist das Messgerät, sondern was jede
Sprachversion benennt und was sie verschweigt. Über die Sprachfassungen eines Themas entsteht
eine Matrix „nennt | verschweigt | widerspricht", aus der sich ein Auslassungsindex je Sprache
berechnen lässt. Die Einordnung übernimmt ein Sprachmodell — ausschließlich als Werkzeug, mit
veröffentlichtem Prompt; jede Zelle bleibt am verlinkten Quelltext prüfbar. Die Domäne wurde
auf Souveränitäts- und Territorialstreitigkeiten geschärft, wo Auslassung bedeutsam ist.

Das Verfahren ist trennscharf und überprüfbar. Es misst aber, *dass* etwas fehlt — nicht,
*warum*. Ob ein Schweigen Knappheit, Redaktionsstand oder Haltung ist, bleibt offen und wird
nicht überinterpretiert. Diese Grenze steht im Methodenblatt.

---
<!--
ZU KLÄREN (beide Notes):
- Daten der Notes bestätigen; Prototyp-Zahlen gegen Artefakt/Spec gegenlesen.
- Parallax-Sprachenzahl („acht" vs. 12) — Note B nennt bewusst keine Gesamtzahl.
- EN-Fassungen erstellen (Sprachparität).
- Ton final geprüft: sachlich, kein Heldennarrativ.
- W-3 (docs/15): Sollen Verwerfungen öffentlich sichtbar sein? (Empfehlung: ja.)
-->
