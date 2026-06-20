# 04 — Sprache & Tonalität

> Audit der sprachlichen Mittel: Register, Begriffe, Übersetzungen, riskante
> Formulierungen. Ziel: ein konsistenter, tragfähiger Ton für die Zielposition.

## 1. Der Grundton ist gut — und das ist der wichtigste Befund

Der dominante Ton der Werk-Ebene ist **trocken, amtlich, forensisch, präzise**. Er
kommt ohne Pathos aus und lässt die Daten sprechen. Beispiele (wörtlich):

- „Jeder Tagesordnungspunkt endet gleich: **Beschluss: vertagt.**"
- „Aufgenommen wird per veröffentlichter Regel; **niemand wählt aus.**"
- „**Messinstrumente, keine Visualisierungen.**"
- „eine technische Etüde, **kein Kunstwerk**."

Dieser Ton ist das stilistische Kapital der Site. Er ist anschlussfähig an
investigative/forensische Ästhetik und an konzeptuelle Strenge — und er **immunisiert
gegen Kitsch**: Selbst Großthemen („Apokalypse", „Sitzung der Welt") wirken nicht
pathetisch, weil die Sprache nüchtern bleibt und sofort Quellen nennt.

→ **Diesen Ton zur verbindlichen Hausstimme erklären** (auch für About, Research
Statement, künftige Texte). Er ist die Klammer, die Engineering und Kunst glaubwürdig
verbindet.

## 2. Zwei Register im Konflikt

| Register | Klang | Wo |
|---|---|---|
| **Amtlich-forensisch (F)** | „Feststellung", „Register", „vertagt", „verschweigt" | Werke, Hero, Lab-Intro |
| **Business-Engineering (E)** | „Data Products", „von der Messung bis zur Entscheidung", „Insights", „Schwerpunkte" | About, Footer, Schema |

Der E-Ton ist nicht schlecht — aber er ist **Bewerbungssprache**. Auf einer
Forschungsseite klingt „Ich verwandle Rohdaten in Data Products, Entscheidungen, Insights
und Geschichten" wie ein LinkedIn-Profil. Er bricht den sorgfältig aufgebauten
forensischen Ton.

## 3. Konkrete riskante / zu prüfende Formulierungen

| Formulierung | Problem | Empfehlung |
|---|---|---|
| „Award-caliber, … SEO-first" (`package.json`) | Marketing-Pathos | streichen/neutral umschreiben |
| „Data & AI Engineer. Ich verwandle Rohdaten in Data Products …" (About lede) | Bewerbungssprache an Identitätsstelle | durch forensisch-biografischen Ledetext ersetzen (Vorschlag, Freigabe nötig) |
| „Data & AI Engineer — von der Messung bis zur Entscheidung." (Footer) | dito, sitewide sichtbar | an Header-Rolle angleichen |
| „Insights", „Data Storytelling", „Schwerpunkte" | Buzzword-Cluster | nur im Beruf-Kontext, nicht als Selbstdefinition |
| „systems operational", „featured", „Zur GDM-Übersicht" (`ui.ts`) | Dashboard-Restsprache, evtl. Orphans | prüfen, ob gerendert; sonst entfernen |
| Doppeltitel „Data Engineering & Artistic Research" | unerklärt → wirkt unentschlossen | mit einem Satz rahmen, der die Verbindung benennt |

**Bewusst NICHT auf der Risikoliste:** „Apokalypse", „Sitzung der Welt", „Zerfall der
Anteilnahme". Diese Titel sind stark und tragen, **solange** die nüchterne, quellengedeckte
Ausführung sie einlöst. Sie sind Konzepttitel, kein Pathos.

## 4. Deutsch/Englisch-Parität

- Struktur sauber gespiegelt (DE `/`, EN `/en`), `ui.ts` führt beide Sprachen typisiert.
- Übersetzungen wirken durchdacht, nicht maschinell. Beispiel: „Was jede Sprache
  verschweigt" / „What each language conceals" — beide tragen.
- **Offene terminologische Frage (ZU KLÄREN):** „praxisbasierte Forschung in und durch
  die Künste" / „practice-based research within and through the arts". Die Wendung
  „in und durch die Künste" ist die etablierte Übersetzung von *research in and through
  the arts* (anschlussfähig an den Fachdiskurs) — gut. Prüfen, ob die deutsche Fassung
  „künstlerische Forschung" oder „Artistic Research" als Leitbegriff führen soll
  (Konsistenz-Entscheidung, siehe 06/15).
- „Untersuchungen" / „Investigations" — trägt in beiden Sprachen, klingt forschend statt
  künstlerisch-anmaßend. Gute Wahl.

## 5. Anglizismen & Fachjargon

- Vertretbar und fachgerecht: „Lab", „Research", „Data" — im zweisprachigen, technischen
  Kontext erwartbar.
- Riskant nur, wo Jargon **ohne Substanz** Haltung simuliert. Aktuell ist das kaum der
  Fall — die Begriffe sind durch Werke gedeckt. Wachsamkeit nötig bei künftigen Texten:
  kein „epistemisch", „dispositiv", „Apparat", „Assemblage" o. Ä. **ohne** konkrete
  Werkdeckung (Theoriepose-Gefahr, siehe 12).

## 6. Namensgebung der Werke (stark)

„Das Protokoll", „Halbwertszeit", „Parallaxe", „Die Police" — alle vier sind
**Doppelbegriffe**: je ein wörtlich-technischer und ein übertragener Sinn (Police =
Versicherungsschein *und* Polizei/Kontrolle; Halbwertszeit = Physik *und* Anteilnahme;
Parallaxe = Optik/Astronomie *und* Wahrheitsabstand; Protokoll = Sitzung *und*
Datenformat). Das ist präzise konzeptuelle Arbeit und ein eigener Stil. **Bewahren** —
künftige Werke nach demselben Prinzip benennen.

## 7. Empfohlene Tonregeln (für 11/12 und CLAUDE.md)

1. **Amtlich-nüchtern als Default.** Behaupten = belegen. Quelle vor Deutung.
2. **Keine Bewerbungssprache** in Identitäts-/Werktexten („Data Products", „Insights",
   „von der Messung bis zur Entscheidung" nur im klar markierten Beruf-Kontext).
3. **Kein Theorie-Imponiervokabular** ohne Werkdeckung.
4. **Großthemen nur mit sofortiger Daten-/Quellendeckung.**
5. **Kein Status-/Kunst-Anspruch:** nicht über den eigenen Status reden; die Arbeiten sprechen für sich.
6. **Scheitern benennen, nicht kaschieren** (siehe Überflug, Parallaxe-Prototyp).
7. **DE/EN-Leitbegriffe einmal festlegen** und konsistent halten (siehe 15).
