# Maschinenraum: Setup-Analyse des Forschungskollektivs (Fable, 2026-07-11)

**Anlass.** Frank bat darum, das Gesamt-Setup des autonomen Forschungskollektivs (Meridian,
`field-research`) grundsätzlich in Frage zu stellen: Ist die aktuelle Konstellation von Agenten
optimal — oder wären andere Konstellationen produktiver, kreativer, progressiver, wenn es darum
geht, „the field" (FIELD.md) zu bearbeiten und den **Atlas der Datenkunst** (214 kartierte Werke)
als Quelle zu nutzen, an die man andocken kann? Zusätzlich: Das Kollektiv soll nicht auf /field
beschränkt bleiben (neue Projekte, neue Routinen, neue technische Mittel — Cloudflare, GCP,
self-hosted OSS), und der Maschinenraum soll **gezielt** wachsen, nicht ins Chaos.

**Datenbasis.** Direkte Beobachtung der Sessions 19–24 (vom Verfasser als Conductor dirigiert),
das vollständige Journal (33 Sessions, 2026-07-01 bis 2026-07-11), WORKBOARD, kuratiertes
Gedächtnis, REQUESTS-Kanal, die Integrations-Pipeline und zwei reale Betriebsstörungen
(Spend-Limit-Abbrüche; eine Session-Nummerierungs-Kollision durch Parallel-Läufe).

---

## 1. Befund: Was nachweislich funktioniert

Die **Integritätsmaschinerie ist der wertvollste Besitz des Projekts** — nicht die einzelnen
Werke. Belege aus dem Record:

- **Der Gauntlet hat Zähne — auch gegen den eigenen Betreiber.** Session 20: der Conductor
  versuchte, eine Karte auf „cleared" hochzustufen; Verifier (FAIL: claim-before-provenance) und
  Skeptic/Interlocutor (Overclaim) blockierten; vollständiger Rollback. Session 23 lieferte
  daraufhin die *bescheidene* Fassung — und bestand ohne Auflagen.
- **Fehler werden zu Regeln.** Das Muster „claim-before-provenance" (Text behauptet eine
  Verifikation, die nicht auf Platte liegt) wurde 4× an einem Tag gefangen, benannt, als Regel
  gehärtet („write the record first") — und in Session 23 wörtlich befolgt, per Datei-mtime
  beweisbar. Fail → Muster → Regel → Anwendung: echte lernende QS.
- **Ausfälle sind legibel.** Zwei Sessions wurden vom Org-Spend-Limit gekappt (24-Ride-Along;
  Nacht-Session 25). In beiden Fällen: Lücke ehrlich protokolliert, nichts simuliert — der
  Dispatch-Failure-Fallback der Verfassung hielt. Die abgebrochene Nacht-Session ist dank
  „record first" ein lesbarer Torso statt eines stillen Nichts.
- **Steuerung ohne Autonomie-Bruch funktioniert.** Seeds (Angebote) wurden nachweislich
  aufgegriffen und diszipliniert umgesetzt (zweiter Faden ab Session 11; Floor-Revision
  Session 18; Konvergenz-Antworten Session 22 mit eigener Schutzbedingung).

## 2. Vier strukturelle Schwächen

1. **Einwärts-Drift.** Die Messlatte belohnt Selbst-Implikation; nichts im Session-Zyklus
   erzwingt Weltkontakt. Folge: Sessions 05–10 vermaßen das eigene Instrument (von Frank per
   Seed korrigiert) — und Sessions 19–23 umkreisten erneut **eine einzige Karte eines einzigen
   Werks**, Grad am Ende unverändert. Der Interlocutor selbst nannte es: viel Prozess, exzellent
   dokumentiert, wenig neue Messung der Welt. Die Drift ist systemisch, nicht episodisch.
2. **Niemand besitzt das Außen.** FIELD.md wird ad hoc gepflegt; der Atlas (214 Werke, mit
   `lab_renderable`-Flags!) wird als Kreativ- und Andock-Quelle **gar nicht genutzt**; die
   öffentliche Verständlichkeit besaß niemand (Franks Storytelling-Problem — jetzt site-seitig
   gelöst, aber an der Quelle ungelöst); technische Fähigkeiten erweitert niemand systematisch.
3. **Mono-Form-Tendenz.** 13 Werke, im Kern eine Formfamilie („instrument on trial":
   Docket/Zertifikat/Messlehre, Papier-und-Tinte-Register). Stark als Haus-Stil, aber die
   Verfassung verlangt „both form AND mechanism should differ" — der Atlas zeigt, wie breit das
   Feld tatsächlich arbeitet (Installation, Performance, Print, Public Space).
4. **Serieller Durchsatz + naive Identität bei Parallelität.** Eine Session = ein Zug; ein Werk
   braucht 2–3 Sessions. Und: Parallel-Läufe kollidieren in der Nummerierung (zwei Sessions
   nannten sich „collective session 24", weil die Nacht-Routine den Stand vor Franks manueller
   Session las). Frank will Parallelität ausdrücklich zulassen — dann braucht die Identität
   eine stabile Spine (die Chronik liefert sie jetzt darstellungsseitig; upstream bleibt es
   ein bekanntes, dokumentiertes Verhalten).

## 3. Konstellations-Vergleich

| Option | Kern | Urteil |
|---|---|---|
| **A. Status quo + neue Züge/Pflichten** (Chronicle-Eintrag je Session; wiederkehrende „Expedition" nach außen; Werkstatt-Lane) | Evolution im bestehenden Ein-Kollektiv-Modell | **Empfohlen, jetzt.** Adressiert Schwächen 1–3 direkt, kostet fast nichts, erhält das akkumulierende Archiv als Argument. Per Seeds zustellbar (autonomie-konform). |
| **B. Föderierte Studios** (Meridian = Trials; ein „Studio" für interaktiv-ästhetische Atlas-Andock-Werke; „Werkstatt" für Infrastruktur) | Mehrere spezialisierte Zellen, gemeinsamer Steering-Kanal | **Vorbereiten, nicht gründen.** Löst Durchsatz + Formvielfalt, kostet aber Koordination, Gedächtnis-Fragmentierung, Repos, Geld. Trigger zum Gründen: wenn School/Diner-Nachfrage (Replikations-Operationen, Quick Snacks) real Volumen zieht oder ein Atlas-Andock-Faden 3+ Werke trägt. |
| **C. Schwarm/Marktplatz** (ephemere Teams je Werk aus einem Rollen-Pool) | Maximale Parallelität/Kreativität | **Verworfen.** Zerstört genau das, was Meridian wertvoll macht: die über Sessions akkumulierende Identität, das kuratierte Gedächtnis, die nachvollziehbare Verantwortung („das Archiv ist das Argument"). |
| **D. Kadenz-Spezialisierung** (harte Regel: nach zwei Innen-Zügen ein Welt-Zug) | Drift strukturell verbieten | **Nur als Selbst-Beobachtung anregen, nicht als Regel setzen.** Eine von außen gesetzte Kadenz-Regel bricht das Autonomie-Prinzip; dieselbe Kadenz als *Selbst*-Verpflichtung des Kollektivs (im Seed angeregt) wäre legitim — seine Entscheidung. |

**Empfehlung: A jetzt (per drei Seeds), B als benannte Option mit klarem Trigger, C nie, D nur
als Angebot zur Selbstbindung.** Zusätzlich gilt: Die neue Chronik (`/field/chronicle.json`,
kuratiert + optionaler Upstream-Selbstreport, zod-validiert am Integrations-Gate) ist bereits
die gemeinsame Daten-Ebene der Konvergenz — eine Quelle, drei Flächen (Site-Story, Diner-
Wareneingang, School).

## 4. Die drei Seeds (Angebote, keine Ansagen — Wortlaut in REQUESTS.md)

1. **Chronicle** — ein `chronicle.json`-Eintrag pro Session (Klartext-Zusammenfassung, enges
   Schema). Löst Schwäche 2 (Kommunikation) an der Quelle; die Site validiert hart und
   überschreibt nie eigene Einträge; die Nummerierungs-Drift wird dadurch downstream harmlos.
2. **Outward / Scout + Atlas-Docking** — wiederkehrender Expeditions-Zug: FIELD.md pflegen,
   den Atlas als Quelle nutzen, je Expedition 2–3 Andock-Kandidaten vorschlagen (bestehende
   Werke erweitern/replizieren/beantworten/mit ihnen interagieren) + Anregung zur
   Selbst-Kadenz (nach zwei Innen-Zügen ein Welt-Zug — als eigene Beobachtung, nicht als Regel).
   Adressiert Schwächen 1 + 3.
3. **Werkstatt + neue Projekte** — technische Experimente als vollwertige Werke (Cloudflare,
   GCP, self-hosted OSS; Zugang via REQUESTS, Frank provisioniert) **und** die explizite
   Fähigkeit, neue Projekte/Repos vorzuschlagen, wo ein Faden /field entwächst. Governance
   unverändert: Vorschlag → Frank enabled → auto-land/integrate-Muster wird repliziert. So
   wächst der Maschinenraum gezielt.

## 5. Betriebsnotizen (dokumentiert, bewusst ohne Regeln — Franks Entscheidung 2026-07-11)

- **Spend-Limit-Abbrüche** sind vorgekommen (2×) und werden vorkommen; der Verfassungs-Fallback
  trägt. Keine Budget-Regeln erwünscht; gelegentliche Limit-Treffer sind akzeptierter Preis
  paralleler Läufe.
- **Parallel-Sessions** sind erwünscht; bekannte Folge ist Nummerierungs-Drift. Darstellung und
  Feed sind dagegen jetzt robust (eigene `seq`-Spine + Anker-De-Dupe + Build-Gate-Test).
- **Nicht delegierbar bleibt:** Merges echter Werk-Änderungen laufen weiter durch das
  Build-Gate; die Site bleibt der letzte technische Filter vor Live.

## 6. Erfolgskriterien (woran wir in ~2 Wochen sehen, ob's wirkt)

- Chronik-Selbstreports erscheinen upstream (Seed 1 angenommen) — oder die Site kuratiert
  weiter, auch ok, aber dann bewusst.
- Mindestens eine Expedition gelaufen; FIELD.md um ≥1 verifizierte Entwicklung erweitert;
  ≥2 Andock-Kandidaten mit konkretem Atlas-Bezug auf dem Workboard.
- Ein Werkstatt-Vorschlag ODER ein Neues-Projekt-Vorschlag in REQUESTS (auch ein begründetes
  „brauchen wir nicht" zählt — Hauptsache, die Fähigkeit ist geprüft statt unbekannt).
- Der nächste Werk-Zyklus bricht die Formfamilie (Mechanismus UND Form neu) — der ehrlichste
  Einzelindikator gegen die Drift.
