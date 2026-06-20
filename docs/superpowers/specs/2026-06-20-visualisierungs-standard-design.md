# Visualisierungs-Standard — *Visualisierung als Messinstrument* — Design

Status: abgenommen (2026-06-20)
Integration: neuer **§3.6** in `2026-06-11-werkgruppe-design.md` (neben §3.4 „Fehler als
Form" und §3.5 „Methodenblatt"); Kurzregel gespiegelt in `CLAUDE.md`.

## 1. Kontext & Ziel

Die Werke der „Akte der Gegenwart" tragen ihre Ästhetik der amtlichen Zurückhaltung
(Mono-Skin, Register, Prosa) so konsequent, dass mehrere Untersuchungen **Daten sammeln,
aber die gemessene Relation nicht zeigen**: Das Protokoll sitzt auf Werten samt Vergleich
(Vortag/-monat/-jahr), bleibt aber reine Prosa; die Police verdichtet einen Anstieg über
Jahre zu einer einzigen Zahl; Parallaxe liest sich als Liste, obwohl ihr Kern eine Matrix
ist. „Nur sammeln" ist nicht aufschlussreich.

Zugleich gilt: *Artistic Research* verbietet Visualisierung nicht. Sie verbietet nur
**Dekoration und Effekt**. Eine Zerfallskurve, die den Zerfall zeigt, ist Instrument; ein
animierter Hintergrund wäre Effekt. Dieser Standard zieht diese Linie verbindlich und
macht sie zugleich zur Pflicht, wo die Erkenntnis quantitativ vorliegt.

Er ist das visuelle Gegenstück zu den bestehenden Regeln „Adapter erfinden nichts" und
„Fehler als Form" (§3.4) und schließt an die Methodenblatt-Pflicht (§3.5) und das
Substanz-Gate (§2) an.

## 2. Grundsatz

> **Eine Visualisierung ist ein Messinstrument oder sie ist nichts.** Jede sichtbare
> Markierung steht für einen belegten, gemessenen Wert und trägt eine Relation, die der
> Kern der Untersuchung ist. Sie erfindet nichts, glättet nichts, dekoriert nie.

Der Standard wirkt in zwei Richtungen — als **Lizenz/Pflicht** (Mandat) und als
**Schranke** (Gate).

## 3. Das Mandat (Lizenz/Pflicht)

Wo die Erkenntnis einer Untersuchung in einer **Relation** liegt — Zerfall über Zeit,
Anstieg, Spreizung, Verteilung, Verschweigen über Sprachen — **muss** diese Relation
sichtbar gemacht werden, nicht nur in Prosa behauptet. Die Visualisierung ist dann
**primäre Trägerin des Arguments**, nicht Beiwerk neben dem Text. „Nur sammeln" genügt
nicht.

## 4. Die Schranke (Gate)

Eine Visualisierung verdient ihren Platz nur, wenn **alle** fünf Bedingungen gelten:

- **(a) Belegt.** Jede Markierung bildet einen Wert aus zitierfähiger Quelle ab. Keine
  erfundenen Punkte, keine Demo- oder Platzhalterdaten in einem Werk.
- **(b) Ehrlich kodiert.** Achsen aus den echten Wertebereichen; keine verzerrende
  Achsenkappung; keine Glättung oder Interpolation, die über Lücken hinwegtäuscht. Die
  Form folgt der Messung, nicht der Schönheit.
- **(c) Lücke als Form.** Fehlende Messungen werden als Lücke gezeigt (kein Verbinden über
  Ausfälle), analog zur amtlichen „Feststellung entfällt" (§3.4). Die Visualisierung
  überbrückt nichts still.
- **(d) Inspizierbar.** Der Zahlenwert hinter jeder Markierung ist zugänglich
  (Beschriftung, Hover oder begleitende Tabelle); Quelle und Messstand (`as_of` /
  `generated_at`) stehen dabei. Falsifizierbar, nicht nur suggestiv.
- **(e) Trägt eine Relation.** Sie zeigt Verlauf, Verhältnis oder Verteilung, das der Text
  nicht so lesbar macht. Eine *einzelne* Zahl, die ein Satz besser sagt, wird kein
  Diagramm.

**Verboten (Dekoration/Effekt):**

- Animation, die keine gemessene Bewegung abbildet: Auto-Play, Parallax-Scroll,
  „lebendige" Hintergründe, Partikel, Tweens, die Bewegung suggerieren, die nicht gemessen
  ist.
- Farbe und Form als Stimmung: Verläufe, Glows, 3-D-Schatten, Zierachsen. Der Mono-Skin
  gilt auch für Diagramme.
- Kennzahlen-Theater: Tachos, Fortschrittsringe, fingierte Dashboards ohne Erkenntniswert.
- **Alles, dessen Entfernung die Aussage nicht schwächt.** Kann ein Element weg, ohne dass
  Erkenntnis verloren geht, muss es weg.

## 5. Abstufung nach Fläche

| Fläche | Regime |
|---|---|
| **Werke (Untersuchungen)** | Höchste Strenge. Statisch bevorzugt. Interaktion nur, wenn sie *Daten freilegt* (Hover zeigt den Wert, Auswahl wechselt eine belegte Ansicht) — **nie als Animation; Sprung statt Tween**. Eine Visualisierung pro Kern-Relation; kein zweites Diagramm „weil es geht". |
| **Lab** | Darf erklären und interaktiv sein (visuelle Essays wie Überflug). Honesty-Regeln (a)–(d) gelten unverändert; zusätzlich erlaubt: didaktische Schritt-für-Schritt-Führung, Vergleichsansichten und **erklärende Übergänge**. Demo-/Beispieldaten nur, wenn ausdrücklich als solche ausgewiesen. |
| **Hero/Teaser** | Nur gemessene Live-Werte (z. B. GISTEMP-Snapshot). Kein Schmuck. Eine Zahl oder eine Kurve, die stimmt — oder nichts. |

## 6. Methodenblatt-Pflicht (Anschluss §3.5)

Jede Werk-Visualisierung benennt im Methodenblatt: Quelle(n), Messgröße, **Kodierung**
(was ist Achse / Länge / Position), Umgang mit Lücken. Keine Visualisierung ohne
dokumentierte Lesart.

## 7. Verortung & Status

- Verbindlicher Text als **§3.6** in `docs/superpowers/specs/2026-06-11-werkgruppe-design.md`.
- Kurzregel gespiegelt in `CLAUDE.md` → „Werkgruppe — verbindliche Regeln":
  > **Visualisierung ist Instrument oder nichts.** Jede Markierung belegt; Lücke als Form;
  > keine Animation ohne gemessene Bewegung; Mono-Skin gilt auch für Diagramme. Werke
  > streng (Sprung statt Tween), Lab darf erklären, Hero nur gemessene Live-Werte.
- **Kein Test-Schutz** (editoriales Kriterium) — **außer** den deterministischen
  Encoding-Funktionen (z. B. `sparkPath` der Halbwertszeit): die bleiben bzw. kommen unter
  Unit-Test, damit die Abbildung *Wert → Geometrie* nicht still driftet.

## 8. Nicht-Ziele

- Keine Diagramm-Bibliothek als Abhängigkeit „auf Vorrat". Visualisierungen entstehen als
  schlanke, geprüfte SVG/DOM-Bausteine pro Relation.
- Kein nachträgliches Bebildern von Werken, deren Kern *kein* quantitatives Verhältnis ist,
  nur um „auch ein Chart zu haben".
- Keine Vereinheitlichung des Aussehens über die Aussage hinweg: Form folgt je Untersuchung
  der gemessenen Relation.
