// Reader-facing facets of the Atlas of Data Art (2026-11-09, Frank's choice on the catalogue
// review, wording private).
//
// The atlas filtered by stance, layer and medium until this date. Counted on 665 works: stance
// put 540 (81 %) in "mixed" and 11 in "spectacle", so it separated nothing; layer (before or
// after 2013) repeated the decade filter; medium put 311 in "hybrid". What a reader asks of a
// catalogue of art is what form a work takes and where it was shown, and whether the entry has
// been checked. The two functions below derive that from fields every entry already carries.

export type FormGroup = 'installation' | 'screen' | 'film' | 'performance' | 'research' | 'mixed'

const FORM_GROUP: Record<string, FormGroup> = {
  'physical-installation': 'installation',
  'interactive-installation': 'installation',
  installation: 'installation',
  'video-installation': 'installation',
  'bio-installation': 'installation',
  'biological-installation': 'installation',
  'mixed-reality-installation': 'installation',
  'research-installation': 'installation',
  'data-physicalisation': 'installation',
  'biological-computer': 'installation',
  sculpture: 'installation',
  textile: 'installation',
  wearables: 'installation',
  'digital-web': 'screen',
  software: 'screen',
  'ai-tool': 'screen',
  'ai-interpreter': 'screen',
  blockchain: 'screen',
  'synthetic-data': 'screen',
  'generative-visual': 'screen',
  'data-visualization': 'screen',
  'vr-experience': 'screen',
  sonification: 'screen',
  'video-film': 'film',
  image: 'film',
  performance: 'performance',
  'public-space-intervention': 'performance',
  'citizen-sensing': 'performance',
  publication: 'research',
  'print-diagram': 'research',
  'evidence-platform': 'research',
  database: 'research',
  research: 'research',
}

/** The form a work takes, in six groups. An unknown or "hybrid" form is "mixed" — never a
 *  guessed group. */
export const formGroup = (form: string): FormGroup => FORM_GROUP[form] ?? 'mixed'

export const FORM_LABEL: Record<FormGroup, string> = {
  installation: 'installation & object',
  screen: 'web, software & VR',
  film: 'film & image',
  performance: 'performance & public space',
  research: 'investigation & publication',
  mixed: 'mixed forms',
}

export type ShownGroup = 'ars' | 'venues' | 'rhizome' | 'dataphys'

/** Where the work was shown or recognised, read from its venue line. */
export const shownGroup = (venue: string): ShownGroup => {
  const v = venue.toLowerCase()
  if (v.includes('ars electronica') || v.includes('s+t+arts') || v.includes('starts prize')) return 'ars'
  if (v.includes('rhizome')) return 'rhizome'
  if (v.includes('dataphys')) return 'dataphys'
  return 'venues'
}

export const SHOWN_LABEL: Record<ShownGroup, string> = {
  ars: 'Ars Electronica & S+T+ARTS',
  venues: 'museums, biennials & festivals',
  rhizome: 'Rhizome net art archive',
  dataphys: 'data physicalization list',
}
