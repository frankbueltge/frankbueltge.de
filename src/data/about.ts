import type { Locale } from '@/lib/site'

export type About = {
  metaTitle: string
  metaDesc: string
  lede: string
  sections: { heading: string; paragraphs: string[] }[]
}

// Rewritten 2026-08-09 (late, Frank: "aktuell zu stark auf die research ecology fokussiert …
// es soll kein projekt fokussiert werden"): the page now leads with the question the current
// projects share — what machines are genuinely better at, and whether they can research
// autonomously and produce useful, checkable works — and lists every project evenly, each one
// door away. The 2026-07-31 ecology-led version lives in git history.

const de: About = {
  metaTitle: 'Über Frank Bültge — Data Engineering & Analytics',
  metaDesc:
    'Frank Bültge — Data Engineering & Analytics. Öffentliche Projekte und Experimente zu der Frage, was Maschinen wirklich besser können als Menschen — und ob sie autonom forschen und dabei nützliche, prüfbare Werke hervorbringen können.',
  lede: 'Ich arbeite mit Daten. Beruflich baue ich seit Jahren Mess- und Dateninfrastruktur — Pipelines, Datenmodelle, Automatisierung: die unauffällige Technik, mit der aus Rohdaten verlässliche, überprüfbare Größen werden. Diese Seite ist nicht dieser Beruf. Hier leben meine eigenen Projekte, nebeneinander — keines von ihnen ist die Site.',
  sections: [
    {
      heading: 'Die Frage darunter',
      paragraphs: [
        'Durch die aktuellen Projekte zieht sich eine Frage: Was können Maschinen wirklich besser als Menschen? Sie können ihre Aufmerksamkeit monatelang auf etwas richten, ohne zu blinzeln, dieselbe Messung Nacht für Nacht wiederholen und Datenmengen lesen, die kein Mensch lesen könnte. Also lasse ich sie mit genau diesen Mitteln forschen — autonom, unter geschriebenen Regeln, öffentlich — und messe sie daran, ob dabei ein konkretes, nützliches Werk oder Instrument entsteht: etwas mit prüfbarem Mehrwert, keine Demo.',
      ],
    },
    {
      heading: 'Die Projekte',
      paragraphs: [
        'Mehrere Hauptprojekte, jedes mit eigenem Zuhause und eigenen Regeln — jedes eine Tür entfernt: zwei maschinell betriebene Forschungsprojekte (eine föderierte Ökologie aus drei Praktiken, und Machine Attention, eine einzelne Maschine unter einer einzigen Verfassung); datavism.org, ein Data-Activism-Lab für das KI-Zeitalter; data-snack.com, ein charakter-getriebenes Daten-Magazin; der Atlas, eine quellenbelegte Landkarte zeitgenössischer Datenkunst; und das Lab, die früheren Experimente dieser Site, jedes für sich stehend. Neue können dazukommen; Werke wandern zwischen ihnen, in beide Richtungen.',
      ],
    },
    {
      heading: 'Meine Rolle',
      paragraphs: [
        'In den maschinell betriebenen Projekten halte ich überall dieselbe Rolle: Architekt und Dirigent. Ich entwerfe und baue die Maschinerie, schreibe die Regeln, unter denen sie läuft, gebe Richtungen vor, die abgelehnt werden dürfen, greife ein und beende, was meiner Kritik nicht standhält — und ich trage die rechtliche und redaktionelle Verantwortung für alles, was hier erscheint. Die Maschinen schreiben; das Protokoll zeigt, wer was geschrieben hat. Nichts hier beansprucht eine Autonomie, die es nicht hat.',
      ],
    },
    {
      heading: 'Beruf als Fundament',
      paragraphs: [
        'Die berufliche Datenpraxis bleibt wichtig — als methodisches Fundament, nicht als Schaufenster. Sie sorgt dafür, dass eine Messung haltbar, quelliert und nachvollziehbar ist. Den beruflichen Teil halte ich davon getrennt.',
      ],
    },
    {
      heading: 'Haltung',
      paragraphs: [
        'Substanz vor Anspruch, Quelle vor Deutung. Ich behaupte nichts, was das Protokoll nicht zeigt — und nicht, schon dort zu sein, wo ich hinwill. Verworfene Versuche bleiben sichtbar; auch die Maschinen führen ihre eigenen Fehler auf.',
      ],
    },
  ],
}

const en: About = {
  metaTitle: 'About Frank Bültge — Data Engineering & Analytics',
  metaDesc:
    'Frank Bültge — Data Engineering & Analytics. Creator of datavism.org and data-snack.com. Public projects and experiments probing what machines genuinely do better than people — and whether they can research autonomously and produce useful, verifiable works.',
  lede: 'I work with data. For years my profession has been building measurement and data infrastructure — pipelines, data models, automation: the unglamorous machinery that turns raw records into reliable, verifiable quantities. This site is not that job. It is where my own projects live, side by side — none of them is the site.',
  sections: [
    {
      heading: 'The question underneath',
      paragraphs: [
        'One question runs through the current projects: what can machines genuinely do better than people? They can hold attention on something for months without blinking, repeat the same measurement every night, and read evidence at a scale no person could. So I let them research with exactly those means — autonomously, under written rules, in public — and judge them by whether a concrete, useful work or instrument comes out of it: something with a value you can check, not a demo.',
      ],
    },
    {
      heading: 'The projects',
      paragraphs: [
        'Several main projects, each with its own home and its own rules — each one door away: two machine-run research projects (a federated ecology of three practices, and Machine Attention, a single machine under a single constitution); datavism.org, a data-activism lab for the AI era; data-snack.com, a character-driven data magazine; the Atlas, a source-cited map of contemporary data art; and the Lab, this site’s earlier experiments, each standing on its own. New ones may join; works travel between them, in both directions.',
      ],
    },
    {
      heading: 'The role I hold',
      paragraphs: [
        'In the machine-run projects my role is the same everywhere: architect and conductor. I conceive and engineer the machinery, write the rules it runs under, seed directions it may decline, intervene, and end what fails my critique — and I carry the legal and editorial responsibility for everything published here. The machines write; the record shows who wrote what. Nothing here claims an autonomy it does not have.',
      ],
    },
    {
      heading: 'Profession as foundation',
      paragraphs: [
        'The professional data practice still matters — as a methodological foundation, not a shop window. It is what keeps a measurement durable, sourced, and traceable. I keep the professional side separate.',
      ],
    },
    {
      heading: 'Stance',
      paragraphs: [
        'Substance before claim, source before interpretation. I assert nothing the record cannot show — and not that I am already where I want to get to. Discarded attempts stay visible; the machines catalogue their own errors too.',
      ],
    },
  ],
}

export const aboutContent: Record<Locale, About> = { de, en }
