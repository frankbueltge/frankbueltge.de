import type { Locale } from '@/lib/site'

export type About = {
  metaTitle: string
  metaDesc: string
  lede: string
  sections: { heading: string; paragraphs: string[] }[]
  /** How the name is spelled elsewhere, and that a namesake exists (2026-10-23): one line that
   *  lets a reader, a search engine and an answer engine tell the two people apart. */
  nameNote: string
}

// Rewritten 2026-08-09 (late; Frank's objection, wording private: the page was focused too
// strongly on the research ecology, and no project should be in focus): the page now leads
// with the question the current projects share — what machines are genuinely better at, and
// whether they can research autonomously and produce useful, checkable works — and lists every
// project evenly, each one door away. The 2026-07-31 ecology-led version lives in git history.

const de: About = {
  nameNote:
    'Bültge, auch Bueltge geschrieben, wo der Umlaut nicht hinpasst. Nicht zu verwechseln mit dem WordPress-Entwickler Frank Bültge: gleicher Name, andere Person.',
  metaTitle: 'Über Frank Bültge — Data & AI Engineer',
  metaDesc:
    'Frank Bültge — Data & AI Engineer. Öffentliche Projekte und Experimente zu der Frage, wie KI und Automatisierung künstlerische Forschung unterstützen und ergänzen können.',
  lede: 'Ich bin Frank Bültge aus Karlsruhe und arbeite als Data & AI Engineer. Seit Jahren baue ich Dateninfrastruktur; heute entwickle ich eine Datenplattform in der Google Cloud, von den Pipelines und Datenmodellen bis zu CI/CD und Full-Stack-Entwicklung mit Python und React: die unauffällige Technik, mit der aus Rohdaten verlässliche, überprüfbare Größen werden. Diese Seite ist nicht dieser Beruf. Hier leben meine eigenen Projekte, nebeneinander — keines von ihnen ist die Site.',
  sections: [
    {
      heading: 'Die Frage darunter',
      paragraphs: [
        'Durch die aktuellen Projekte zieht sich eine Frage: Wie kann KI künstlerische Forschung unterstützen und ergänzen? Nicht, ob eine Maschine Kunst machen oder selbst künstlerisch forschen kann, und nicht generative Kunst. Maschinen können ihre Aufmerksamkeit monatelang auf etwas richten, dieselbe Messung Nacht für Nacht wiederholen, Quellen in einem Umfang lesen, den kein Mensch schafft, und an einem Nachmittag einen Prototyp bauen. Also lasse ich sie mit genau diesen Mitteln arbeiten — unter geschriebenen Regeln, öffentlich — und messe sie daran, ob das, was dabei entsteht, die Forschung weiterbringt: Material, Studien und Instrumente mit prüfbarem Mehrwert, keine Demo.',
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
        'Substanz vor Anspruch, Quelle vor Deutung. Ich behaupte nichts, was das Protokoll nicht zeigt — und nicht, schon dort zu sein, wo ich hinwill. Nichts hier nennt sich Kunst; ob etwas davon Kunst wird, hat diese Seite nicht zu behaupten. Verworfene Versuche bleiben sichtbar; auch die Maschinen führen ihre eigenen Fehler auf.',
      ],
    },
  ],
}

const en: About = {
  nameNote:
    'Bültge, written Bueltge where the umlaut cannot go. Not to be confused with the WordPress developer Frank Bültge: same name, different person.',
  metaTitle: 'About Frank Bültge — Data & AI Engineer',
  metaDesc:
    'Frank Bültge — Data & AI Engineer. Creator of datavism.org and data-snack.com. Public projects and experiments on how AI and automation can support and extend artistic research.',
  lede: 'I am Frank Bültge from Karlsruhe, and I work as a Data & AI Engineer. I have built data infrastructure for years; today I develop a data platform on Google Cloud, from the pipelines and data models to CI/CD and full-stack development in Python and React: the unglamorous machinery that turns raw records into reliable, verifiable quantities. This site is not that job. It is where my own projects live, side by side — none of them is the site.',
  sections: [
    {
      heading: 'The question underneath',
      paragraphs: [
        'One question runs through the current projects: how can AI support and extend artistic research? Not whether a machine can make art or do artistic research on its own, and not generative art. Machines can hold attention for months, repeat a measurement every night, read sources at a scale no person could and build a prototype in an afternoon. So I let them work with exactly those means — under written rules, in public — and judge them by whether what comes out carries the research further: material, studies and instruments with a value you can check, not a demo.',
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
        'Substance before claim, source before interpretation. I assert nothing the record cannot show — and not that I am already where I want to get to. Nothing here calls itself art; whether any of it becomes art is not for this site to claim. Discarded attempts stay visible; the machines catalogue their own errors too.',
      ],
    },
  ],
}

export const aboutContent: Record<Locale, About> = { de, en }
