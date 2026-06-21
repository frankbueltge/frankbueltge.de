# Spec — The Roadmap („Planet Earth Inc.")

**Status:** abgenommen (Brainstorming mit Frank, 2026-06-21)
**Typ:** neues Experiment (Lab), erstes Stück einer Reihe von drei
**Rahmung:** `2026-06-20-ehrliche-umrahmung-design.md` · Substanz-Gate: `2026-06-11-werkgruppe-design.md` §2/§3.5

## 1. Anlass & Position

Die Site hat vier Experimente (The Protocol, Half-Life, Parallax, The Policy). Sie teilen
eine Form: Sie geben sich als **Messinstrumente** — Regressionsfit, R², Methodenblatt,
amtlicher Duktus. Eine Lektüre von Dieter Merschs *Manifest der Künstlerischen Forschung*
(Henke/Mersch/Strässle/Wiesel/van der Meulen) macht sichtbar: Das ist genau die Form, die
das Manifest kritisiert — die **Verwissenschaftlichung** künstlerischer Forschung, das
Anlegen fremder (akademischer) Maßstäbe aus Legitimitätszwang. Mersch fordert dagegen eine
**eigene Epistemizität**: nicht-diskursiv, *Zeigen statt Sagen*, Reflexivität, Widerständigkeit.

Daraus folgt eine neue Reihe von drei Experimenten mit geteilter Methode — **subversive
Überidentifikation**: in der Stimme des Apparats sprechen, bis sie kippt (Verfahren von
PENG!, Zentrum für Politische Schönheit, Rocco und seine Brüder). Reihenfolge:

1. **The Roadmap** — gegen die eigene Form (diese Spec).
2. *Gegen die Macht* — Stolz-Seite des Lobbyismus (Seed).
3. *Gegen diese Seite* — reflexive Self-Surveillance-Coda (Seed).

The Roadmap ist der Schlussstein des Bruchs: Es baut das **Anti-Dashboard** — Merschs
Kritik wird zur Geste, gerichtet auch gegen unser eigenes Genre.

## 2. Konzept

Eine statische Astro-Seite, die sich als **Quartalsbericht eines Konzerns** ausgibt, der
die Welt „optimiert". Der Apparat ist vollständig: KPIs, RAG-Status, Zielwerte, Roadmap,
Owner, Action Items, Executive Summary. **Jede Zahl ist echt und verlinkt — nur der Rahmen
ist erfunden.** Die reale, fallende Kurve im Konzern-Optimismus ist die Pointe.

Name: **The Roadmap**. Untertitel (nüchtern, beschreibt, was es *tut*):
- DE: „Der Zustand der Welt als Konzern-Dashboard — echte Daten, erfundener Rahmen."
- EN: „The state of the world as a corporate dashboard — real data, invented framing."

## 3. Die fünf KPIs (echte, offene Daten)

| KPI | Quelle (offen) | Reihe | Verlauf | Konzern-Lesart |
|---|---|---|---|---|
| Demokratie | V-Dem Liberal Democracy Index `v2x_libdem`, globaler Mittelwert/Jahr (CC-BY) | Jahr | ↓ | „below target" |
| Pressefreiheit | RSF World Press Freedom Index, global/Jahr | Jahr | ↓ | „on watch" |
| Klima | NOAA Mauna Loa CO₂, Jahresmittel (Adapter `co2.py` existiert) | Jahr | ↑ | „growth!" |
| Ungleichheit | WID.world Top-1%-Anteil/Jahr | Jahr | ↑ | „above plan — great work, team!" |
| Biodiversität | Living Planet Index (WWF/ZSL), globaler Index/Jahr | Jahr | ↓ | „critical" |

Pointe im Vorzeichen: Die **einzige „erfolgreiche" KPI ist die Ungleichheit**; das Klima
wird als „Wachstum" gefeiert. Vier von fünf sind Jahresdaten → **kein Nacht-Job**, eine
statische JSON, jährlich manuell aktualisiert.

## 4. Der Apparat (Form) — deterministisch, kein LLM

- **Header:** „PLANET EARTH INC. — Q‹n› ‹Jahr› Quarterly Business Review · Internal, do not distribute."
- **Executive Summary:** 2–3 Sätze, Template-getextet aus den realen Werten; Strings unter
  Testschutz (wie das Protokoll-Register). Muster: *„‹k› of 5 KPIs below target this quarter.
  ‹worst› remains critical. Inequality continues to outperform plan. The board remains optimistic."*
- **KPI-Karten:** Wert · YoY % · RAG-Status (✓ ⚠ ✕) · Ziel · Sparkline (Jahres-Reihe).
- **Roadmap / Action Items:** Deadpan, autorengeschrieben (Rahmen-Text, keine erfundenen
  Daten): „Sunset: press freedom (low ROI)", „A/B-Test: Wahlen vs. keine Wahlen",
  „Backlog: Gewaltenteilung (P3)".
- **Owner** je gerissener KPI: „Die Geschichte", „Die Aufklärung", „Niemand", „Sie".

## 5. Der Widerhaken / Methodenblatt (ehrliche Kehrseite)

Reflexiver Umschlag unten: *„Jede Zahl hier ist real und verlinkt. Nur der Rahmen ist
erfunden. Der Rahmen ist der Punkt."* Erfüllt zugleich das Provenienz-/Substanz-Gate:
offene Quellen mit Lizenz und Abrufzeitpunkt, **Grenzen prominent**, Leave-behind.
Grenzen explizit benannt: RSF-Methodenbruch 2022; unterschiedliche Index-Basisjahre;
„globaler Mittelwert" verdeckt Verteilung; Jahres-Kadenz (keine Tagesfrische);
modellbasierte Schätzungen.

## 6. Substanz-Gate (§2) — Nachweis

1. **Echte Daten, offene Provenienz** — fünf offene Quellen, im Methodenblatt verlinkt. ✓
2. **Eine Frage, kein Effekt** — „Was passiert, wenn man den Zustand der Welt der
   Optimierungslogik unterwirft?" Überprüfbar an realen Reihen. ✓
3. **Infrastruktur als Teil der Aussage** — statisch, jährlich, kein Nacht-Job; das Stück
   weist seine eigene Sparsamkeit aus (Reduktion ist die Position). ✓
4. **Leave-behind** — offener Code, offene Datensätze, versioniertes `earth.json` im Git. ✓
5. **Verhältnismäßigkeit** — kein neuer Secret, kein Maximalismus; die Geste trägt, nicht die Technik. ✓

## 7. Bindende Regeln (CLAUDE.md) — eingehalten

Kein LLM-Text (deterministische Templates, Strings unter Test); Git ist das Archiv
(versioniertes JSON); keine Secrets/PII; Ausfälle ehrlich vermerkt (Quelle, die fehlt,
wird benannt, nicht still überbrückt); nüchterne Lab-Rahmung (Experiment, kein Kunst-Etikett).

## 8. Scope / Non-Goals

- **In:** statische Seite (EN/DE), Methodenblatt, fünf KPIs, deterministische Texte, Tests,
  per-Page-OG-Bild, Lab-Eintrag, optionaler manueller Refresh-Befehl.
- **Out (YAGNI):** Nacht-Pipeline/Cloud-Run-Job, neue API-Keys, Länder-Drilldown, LLM,
  Interaktivität über das Dashboard hinaus. Die beiden weiteren Reihen-Stücke sind separate Specs.

## 9. Datenbeschaffung

Reale Seed-JSON aus den fünf Quellen (keine erfundenen Zahlen). Fällt eine Quelle nicht
sauber abrufbar aus, ehrlich tauschen (z. B. World-Bank-Gini statt WID; NSIDC-Arktis-Meereis,
Adapter existiert). Keine Quelle still überbrücken.
