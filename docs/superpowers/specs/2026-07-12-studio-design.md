# Studio — das Produktionshaus neben dem Labor (Design & Infra-Plan)

**Datum:** 2026-07-12 · **Status:** ENTSCHIEDEN (Frank, 2026-07-12) — Name `studio`; KEINE Start-Seeds; Kadenz manuell zuerst
**Verfassungsentwurf:** `2026-07-12-studio-protocol-draft.md` (wird verbatim das
`PROTOCOL.md` des neuen Repos)

## 1. Warum (die Diagnose, kurz)

Nach 30 Sessions liefert das Forschungskollektiv (Meridian, `field-research`) verlässlich
Grundlagenforschung — 14 verifizierte Instrumente, Integritätskultur, gepflegte Karte — aber
strukturell **keine progressiven Werke und keine großen Projekte**: Seine Verfassung belohnt
Verifizierbarkeit, sein Gauntlet selektiert gegen Formrisiko, alle 14 Werke sind eine
Formfamilie (Prüfregister), rund die Hälfte der Sessions ging in Selbstwartung. Das ist kein
Ausführungsfehler, sondern die Zielfunktion. Entscheidung (Frank, 2026-07-12): **Labor
unverändert weiterlaufen lassen; daneben ein zweites Kollektiv mit Produktionsauftrag** —
arbeitet mit den Laborergebnissen, darf freie Zusatzquellen nutzen.

## 2. Die Architektur (drei Engines, ein Muster)

Das Engine-Muster existiert dreifach erprobt: Repo + PROTOCOL.md + auto-land +
`<ns>-integrate.yml` in der Site + Build-Gate + Feedback-Kanal.

| Engine | Repo | Site-Surface | Charakter |
|---|---|---|---|
| Feld (Meridian) | `field-research` | `/field` | Grundlagenforschung, Messungen, Register — unverändert |
| Atelier (Ulysses) | `irrtum-als-methode` | `/atelier` | Solo-Künstler, freies Thema, Miniaturen — unverändert |
| **Studio (neu)** | `studio` | `/studio` | **Produktionskollektiv: Werke & Projekte mit Wucht auf Basis des verifizierten Materials + freier Quellen** |

Das Kollektiv benennt sich selbst in Session 01 (Meridian-Präzedenz); Repo-/Surface-Name sind
Franks Entscheidung und unabhängig davon.

## 3. Die Verfassung — die fünf Richtungsentscheidungen

(Volltext im Companion-Draft; hier nur, was sie von Meridian unterscheidet.)

1. **Ehrlichkeit durch Etikettierung statt Voll-Verifikation:** drei Stufen VERIFIED (aus dem
   Labor, mit Live-Status) · SOURCED (eigene Recherche, URL) · IMAGINED (markiert). Spekulative
   und erfahrungshafte Elemente sind shipbar — unmarkiert sind sie die Kardinalsünde.
2. **Anti-Register-Klausel:** die Prüfregister-Form ist der Werkstatt nicht verfügbar; Atlas
   als Formkanon, Physisch/Hybrid ausdrücklich im Spielfeld (Frank realisiert).
3. **Anti-Drift-Gesetz:** Projekt (mehrsessionig) als Grundeinheit; max. 1 Inward-Session pro
   4; Increment-Pflicht alle 3 gearbeiteten Sessions; STALLED-Regel nach 6.
4. **Anderer Gate:** Verifier prüft nur Fakten/Tiers (kein Form-Veto), Dramaturg prüft das
   Erlebnis gegen den Brief, Kritiker zielt auf Slop/Kitsch/Deko-Dataviz (publiziert,
   non-blocking) — statt Falsifikations-Gauntlet.
5. **Upstream-Vertrag geerbt:** die downstream-commitments des Labors binden (Live-Status
   reist mit, Caveats überleben Re-Voicing, 011/001-Regel, Korrekturen fließen nach oben,
   nie stilles Patchen).

## 4. Infra-Plan

**Phase A — Engine (nach Franks Go, ~1 Sitzung):**
- Öffentliches Repo `frankbueltge/studio` anlegen; Struktur: `PROTOCOL.md` (aus dem Draft),
  `README.md`, `REQUESTS.md` (mit Franks zwei Start-Seeds, §5), `WORKBOARD.md`, `journal/`,
  `memory/` (decisions · open-questions · discarded · dossiers/), `projects/`, `works/`,
  `chronicle.json` (`[]`), `SITE-API.md` (vom Feld adaptiert), `.github/workflows/auto-land.yml`
  (vom Feld kopiert; Branch-Muster `research/session-<date>` beibehalten — Tooling-Gleichheit).
- Secrets: `SITE_DISPATCH_TOKEN` im Engine-Repo (cross-repo Dispatch an die Site) — Frank.
- **`BOT_TOKEN` in der Site provisionieren** (ein Token dient allen Engines): repariert
  zugleich den am 2026-07-11 entdeckten toten Feedback-Kanal des Feldes
  (`field-research/REQUESTS.md`, Request offen).

**Phase B — Site-Surface (~1 Sitzung, spätestens wenn das erste Increment naht):**
- `studio-integrate.yml` (Klon von `field-integrate.yml`, ns=`studio`), Content-
  Collections, Seiten `/studio` + `/en/studio`, OG-Eintrag, Navigation, Chronicle-Merge
  (curated leer + upstream). Der Integrator ist bereits namespace-generisch.
- Hinweis: das Chronicle-Schema der Site gilt unverändert (Move-Enum; „premiere" → `ship`).

**Phase C — Routine:**
- Empfehlung: die ersten 3–5 Sessions **manuell** fahren (Verfassungs-Shakedown, wie beim
  Feld), dann als geplante Routine (Scheduled Agent) mit demselben Prompt-Muster:
  *„Fahre eine Session des Studios in ~/…/studio — lies PROTOCOL.md und folge ihm
  vollständig. Committe auf einen research/session-<datum>-Branch und pushe — auto-land
  übernimmt."*

## 5. Start-Seeds — NICHT EINGELEGT (Entscheidung Frank, 2026-07-12)

> Frank entschied: **keine Seeds** — das Kollektiv startet völlig frei und liest seine
> Richtung selbst aus Verfassung und Quellen. Die zwei Entwürfe bleiben hier als Referenz
> stehen, falls später doch gewünscht; sie liegen NICHT im REQUESTS.md des Repos.

> ### Seed 1: Das Eichamt — die Synthese-Kommission (Angebot, kein Befehl)
> Das Forschungskollektiv hat 14 Instrumente geshippt, die mit hoher Redundanz EINE These
> zeigen: die stärkste Garantie eines Messwerkzeugs fällt mit dem geringsten Bedarf zusammen
> (`field-research/memory/claims.md`, Konjektur-Zeile; 14 Belege, kein Beweis). Niemand hat
> bisher den Auftrag, daraus das eine große Werk zu bauen. Angebot: **komponiert die 14
> Instrumente zu EINEM erfahrbaren Werk/Projekt** — Arbeitsrichtung „das begehbare Eichamt" —
> Form ausdrücklich kein Register, digital zuerst, physische Tür als erklärtes Ziel.
> Mehrsessioniger Bogen erwartet; Increments zählen.

> ### Seed 2: Zwei Rechnungen, gedruckt (Angebot, kein Befehl)
> Instrument 012 („The Two Meters") trägt seit Session 11 den Vermerk: physische Realisierung
> „nearly free and form-true" — zwei gedruckte Rechnungen (AS REPORTED / AS METERED),
> nebeneinander gepinnt. Nie gemacht. Angebot als billigster erster Körper der Werkstatt:
> gestaltet die zwei Dokumente druckfertig (Upstream-Vertrag beachten: Window-Choice-Caveat,
> „not AI-specific"-Note reisen mit) und stellt den Realisierungsantrag an Frank via
> REQUESTS.md. Klein, echt, außerhalb des Bildschirms.

## 6. Entscheidungen (Frank, 2026-07-12)

1. **Namen:** Repo `studio`, Surface `/studio` — „studio ist nicht international; wenn es
   kein englisches Wort gibt, das genauso gut passt, nehmen wir studio." Anmerkung zur
   Atelier-Nähe: akzeptiert — die Surfaces unterscheiden Solo-Künstler (Atelier) und
   Produktionskollektiv (Studio).
2. **Öffentliches Repo:** ja (wie field-research; die Verfassung setzt es voraus).
3. **Kadenz:** manuell zuerst (3–5 Sessions Shakedown), Routine danach.
4. **Werksprache:** das Studio wählt pro Werk selbst (Site ist de/en).
5. **Seeds:** keine — siehe §5.

## 7. Risiken, ehrlich

- **Drittes autonomes System = mehr Spend** und ein weiteres Repo unter Beobachtung.
- **Auch die Werkstatt kann driften** — dagegen steht das Anti-Drift-Gesetz in der Verfassung
  (nicht in späteren Seeds); ob es hält, zeigen die ersten ~10 Sessions.
- **Qualitätsrisiko der Freiheit:** IMAGINED-Elemente + Formfreiheit können Kitsch erzeugen;
  dagegen stehen Kritiker-Rolle (auf Slop gezielt) und die publizierte Kritik.
- **Kein stiller Kanon-Bruch:** Upstream-Vertrag + Legal-Hygiene sind wörtlich geerbt; die
  Werkstatt kann das Labor nicht kompromittieren, nur schlecht aussehen lassen — und dafür
  gibt es den Kritiker.
