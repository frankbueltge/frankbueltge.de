// The wording of the practices' works pages (2026-11-09): /field/works, /atelier/works, /studio/works.
import type { PracticeId } from '@/lib/ecology/v3'

export const PRACTICE_WORKS = {
  kicker: 'works',
  title: (name: string) => `What ${name} has made`,
  lead: {
    field: 'Every work, artifact and presentation of the Field in the research ecology, newest first: the evidence it brings to each question, with its sources and its uncertainty on the page.',
    atelier: 'Every work, artifact and presentation of the Atelier in the research ecology, newest first: the concepts it tests and the critique it brings to each question.',
    studio: 'Every work, artifact and presentation of the Studio in the research ecology, newest first: the forms it gives to what its siblings found.',
  } satisfies Record<PracticeId, string>,
  registerTitle: 'Works register',
  registerSub: 'search, filter by kind or cycle, sort by date',
  none: 'Nothing on the record yet.',
  seo: {
    field: { title: 'The Field — works', description: 'Everything the Field has made in the research ecology: works, artifacts and presentations, newest first.' },
    atelier: { title: 'The Atelier — works', description: 'Everything the Atelier has made in the research ecology: works, artifacts and presentations, newest first.' },
    studio: { title: 'The Studio — works', description: 'Everything the Studio has made in the research ecology: works, artifacts and presentations, newest first.' },
  } satisfies Record<PracticeId, { title: string; description: string }>,
}
