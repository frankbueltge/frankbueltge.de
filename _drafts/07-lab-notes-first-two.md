<!--
ENTWURF — zwei erste Lab Notes (DE), nicht veröffentlicht, nicht eingebunden.
Quelle ausschließlich: Repo (src/content/lab/ueberflug-studie/de.mdx, src/data/werke.ts) und
docs/superpowers/specs + docs/05/14. Struktur je Note nach docs/08 §9 (Frage → Versuch →
Scheitern mit Beleg → Rest → offene Frage). Ton: nüchtern, Methode-funktioniert-wie-vorgesehen,
KEINE Heldengeschichte. Zahlen/Daten als ZU KLÄREN markiert, wo nicht 1:1 belegt.

Hinweis Format: könnte später als zwei MDX-Dateien unter src/content/lab/<slug>/de.mdx +
en.mdx angelegt werden (Schema: title, description, date, tags). Hier nur Entwurfstext.
-->

# Lab Note A — Warum „Überflug" aus der Reihe genommen wurde

*Entwurf · Datum ZU KLÄREN (Ausmusterung lt. `werke.ts`-Kommentar: 2026-06-12)*
*Tags: studie, methode, verwerfung*

„Überflug" war ein Kandidat für die Reihe „Die Akte der Gegenwart". Die Arbeit berechnet im
Browser, welche katalogisierten Erdbeobachtungssatelliten einen Standort gerade geometrisch
im Sichtfeld haben — aus täglich aktualisierten, committeten Bahndaten (CelesTrak, OMM/JSON),
mit Eigentümer-Klassifikation aus McDowells GCAT (CC-BY 4.0). Die Propagation (SGP4) läuft
lokal; der Standort verlässt den Browser nicht.

**Die Frage, an der sie gemessen wurde.** Die Reihe verlangt von jeder Untersuchung eine
überprüfbare Behauptung über die Welt und eine Akkumulation über Zeit (Substanz-Gate,
`docs/superpowers/specs/2026-06-11-werkgruppe-design.md`).

**Woran sie scheiterte.** Überflug erhebt keine solche Behauptung. Sie gibt eine Auskunft —
„diese Satelliten sind jetzt über dir" —, die hunderte Tracker-Seiten ebenso geben. Es gibt
keine These und keine Akkumulation; die Arbeit ist als Werkzeug erfahrbar, nicht als Messung
mit Aussage. Damit fällt sie durch das Gate.

**Was bleibt.** Das Handwerk trägt: clientseitige Bahnpropagation auf offenen, committeten
Daten, ohne dass der Standort den Browser verlässt. Die Arbeit bleibt deshalb als **Studie**
(Etüde) im Lab sichtbar — ausdrücklich als „technische Etüde, kein Kunstwerk" gekennzeichnet.
Eine Verwerfung wird nicht gelöscht, sondern dokumentiert.

**Offene Frage.** Interessant wäre nicht der Blick nach oben, sondern seine Veränderung: Wenn
die tägliche Snapshot-Pipeline statt zu überschreiben eine Zeitreihe führte, ließe sich die
Verdichtung des Orbits messen — wie schnell er sich mit Beobachtern füllt, wie sich das
Verhältnis kommerziell zu militärisch verschiebt. Das wäre eine messbare These. Bis dahin
bleibt es eine Studie.

---

# Lab Note B — Warum „Parallaxe" nach einem Prototyp neu entworfen wurde

*Entwurf · Datum ZU KLÄREN (Prototyp-/Redesign-Vermerk: 2026-06-14)*
*Tags: methode, prototyp, verwerfung, redesign*

„Parallaxe" untersucht, dass dieselbe umstrittene Sache in verschiedenen Sprachversionen der
Wikipedia verschieden beschrieben wird. Die erste Fassung war anders gedacht als die heutige.

**Die ursprüngliche Hypothese.** Es gebe nicht eine Beschreibung der Welt, sondern viele — und
ihr **Abstand** lasse sich als Distanz zwischen Text-Embeddings messen. Erwartung: Bei
umstrittenen Themen ist der Abstand der Sprachversionen größer als bei neutralen
Kontrollthemen.

**Was der Prototyp zeigte.** Das Maß diskriminierte nicht. Die gemessene Embedding-Distanz
umstrittener Themen lag praktisch gleichauf mit der der Kontrollthemen.
[ZU KLÄREN: exakte Werte — laut `docs/05`/Spec etwa 0,138 (umstritten) vs. 0,111 (Kontrolle),
zuletzt Faktor ~0,97, also unterhalb des Signals. Vor Veröffentlichung gegen
`docs/superpowers/specs/2026-06-13-parallaxe-design.md` und
`docs/superpowers/artifacts/2026-06-14-parallaxe-prototyp.json` prüfen.]
Ein nicht trennscharfes Maß ist kein Messinstrument — die erste Fassung fiel durch das Gate.

**Der Neuentwurf.** Nicht der Abstand ist das Messgerät, sondern die **Auslassung**: Was
benennt jede Sprachversion, und was verschweigt sie? Über die Sprachfassungen eines Themas
entsteht eine Matrix „nennt | verschweigt | widerspricht", aus der sich ein Auslassungsindex
je Sprache berechnen lässt. Die Extraktion übernimmt ein Sprachmodell
(Vertex Gemini, Temperatur 0) — **ausschließlich als Werkzeug, mit veröffentlichtem Prompt**;
jede Zelle bleibt am verlinkten Quelltext überprüfbar. Die Domäne wurde später auf
Souveränitäts-/Territorialstreitigkeiten geschärft.
[ZU KLÄREN: genaue Sprachenzahl der öffentlichen Fassung — Werktext nennt „acht
Sprachversionen"; Pipeline-Spec nennt teils andere Werte. Vor Veröffentlichung angleichen.]

**Was bleibt — und das Beispiel.** Das Verfahren ist trennscharf und am Quelltext prüfbar.
Ein Beispiel aus der laufenden Arbeit: Die japanische Beschreibung der Senkaku-Inseln erwähnt
den Territorialstreit mit keinem Wort.

**Offene Frage.** Der Auslassungsindex misst, *dass* etwas fehlt — nicht, *warum*. Ob ein
Schweigen Redaktionsstand, Quelle oder Haltung ist, bleibt offen und sollte nicht
überinterpretiert werden. Die Grenze der Methode gehört ins Methodenblatt.

---
<!--
ZU KLÄREN (gesamt):
- Exakte Prototyp-Zahlen Parallaxe (s. o.) gegen Spec/Artefakt verifizieren, bevor veröffentlicht.
- Sprachenzahl Parallaxe (Werktext „acht" vs. Pipeline) konsolidieren.
- Datumsangaben beider Notes bestätigen (Ausmusterung/Redesign).
- Ton geprüft: beide als Methoden-funktioniert-Notiz, nicht als Erfolgsgeschichte. Bei Bedarf
  noch knapper.
- Format: bei Veröffentlichung als MDX (de/en) anlegen; EN-Fassung fehlt noch (W-3 Freigabe).
- W-3 (docs/15): Sollen Verwerfungen überhaupt öffentlich sichtbar sein? (Empfehlung: ja.)
-->
