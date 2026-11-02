// src/lib/briefing/map.ts — the map of the world's state (2026-11-01; docs/design/2026-11-01-the-map.md).
//
// A briefing asked what is new, and a state of affairs has no date. In its first two editions poverty,
// inequality, the concentration of money and power, democracy and rights were no matter at all, while AI
// was three of ten. So every briefing now opens with eleven standing fields, one line each, and takes its
// matters from them. A field without news still has its line. Nothing in here says that a figure is true:
// that is the second session's work. It can refuse a map with a field missing, a line with no date or no
// original source, and a briefing that keeps leaving the same fields out.
//
// The terms are each field's attention in Common Ground, by the house's one count
// (src/lib/reading/attention.ts). They were audited against the ledger's receipts on 2026-11-01: a term
// goes when most of what it catches is something else ("displacement" was mostly arXiv, "flooding" mostly
// bots, "manipulation" mostly robot arms), and an exclusion stands for a known false friend. A signal can
// name two fields, and then it counts in both.
//
// On 2026-11-02 the map grew to thirteen fields (Frank's decision, wording private). Read against the
// rankings it names, it gave the environment one field for four subjects and the economy none, and it read
// none of the largest measured harms: air pollution, unsafe water, homicide. Climate gave nature, air and
// water a field of its own, debt, work and the cost of living joined, war took in the violence beyond it,
// and the concentration of money and power reads control while inequality reads how the whole is shared.
// The ids stayed, so a fader keeps its history.
import type { BriefingLine, BriefingSource } from './briefing'

export interface MapField {
  id: string
  /** what the map calls it */
  name: string
  /** what would stand on a fader */
  strip: string
  terms: readonly string[]
  exclude?: readonly string[]
}

/** A match report is not a war: "ukraine vs" is football. */
const fixtures = (...countries: string[]): string[] => countries.flatMap((c) => [`${c} vs`, `vs ${c}`, `${c} v`, `v ${c}`])

/** In the order of the map: thirteen since 2026-11-02 (docs/design/2026-11-01-the-map.md, "Thirteen fields"). */
export const FIELDS = [
  {
    id: 'war',
    name: 'War and violence',
    strip: 'WAR & VIOLENCE',
    terms: [
      'Ukraine', 'Ukrainian', 'Kyiv', 'Gaza', 'West Bank', 'Sudan', 'Darfur', 'El Fasher', 'Myanmar', 'Yemen', 'Lebanon',
      'Iran', 'Iranian', 'Tehran', 'Hormuz', 'Tigray', 'Houthi', 'Houthis', 'Hezbollah', 'Hamas',
      'airstrike', 'airstrikes', 'air strike', 'air strikes', 'ceasefire', 'war crimes', 'nuclear weapons',
      'missile strike', 'missile strikes',
      // the violence beyond war (2026-11-02): homicide kills more people than armed conflict in most years
      'violence', 'murder', 'homicide', 'homicides', 'shooting', 'mass shooting', 'mass shootings', 'gun violence',
      'gangs', 'gang violence', 'cartels', 'nuclear arsenal', 'warheads',
    ],
    exclude: [
      'star wars', ...fixtures('ukraine', 'sudan', 'myanmar', 'yemen', 'lebanon', 'iran', 'gaza'),
      'shooting star', 'shooting stars', 'shooting guard', 'murder mystery', 'murder drones',
    ],
  },
  {
    id: 'hunger',
    name: 'Hunger',
    strip: 'HUNGER',
    terms: ['famine', 'hunger', 'starvation', 'malnutrition', 'food insecurity', 'food crisis'],
    exclude: ['hunger games', 'hunger stone', 'hunger stones', 'hunger beats'],
  },
  {
    id: 'poverty',
    name: 'Poverty',
    strip: 'POVERTY',
    terms: ['poverty', 'poorest', 'homeless', 'homelessness', 'food bank', 'food banks', 'destitute', 'slums'],
  },
  {
    id: 'economy',
    name: 'Debt, work and cost of living',
    strip: 'DEBT & WORK',
    terms: [
      'debt crisis', 'sovereign debt', 'public debt', 'debt relief', 'debt distress', 'IMF', 'austerity',
      'inflation', 'cost of living', 'food prices', 'recession', 'tariff', 'tariffs', 'trade war',
      'unemployment', 'jobless', 'layoffs', 'job cuts', 'minimum wage', 'eviction', 'evictions', 'child labour', 'child labor',
    ],
    // audited 2026-11-02: "strike" is mostly a missile or Counter-Strike, "wages" a war, "labour" a party,
    // "default" a setting and "debt" a takeover, so they stay out; cosmology's inflation is no price
    exclude: ['cosmic inflation', 'inflaton', 'grade inflation', 'mission impossible'],
  },
  {
    id: 'inequality',
    name: 'Inequality',
    strip: 'INEQUALITY',
    terms: [
      'inequality', 'inequalities', 'wealth gap', 'income gap', 'wealth tax', 'tax the rich', 'racism', 'sexism', 'gender pay gap',
      'femicide', 'gender gap', 'gender equality', 'gender based violence', 'domestic violence',
    ],
  },
  {
    id: 'power',
    name: 'Concentration of money and power',
    strip: 'POWER & MONEY',
    terms: [
      'billionaire', 'billionaires', 'oligarch', 'oligarchs', 'oligarchy', 'antitrust', 'monopolies', 'market concentration',
      'tax haven', 'tax havens', 'tax evasion', 'money laundering', 'corruption', 'bribery', 'lobbying', 'lobbyists', 'private equity', 'big tech',
    ],
    exclude: ['shop like a billionaire'],
  },
  {
    id: 'climate',
    name: 'Climate and disasters',
    strip: 'CLIMATE',
    terms: [
      'climate', 'global warming', 'heatwave', 'heat wave', 'wildfire', 'wildfires', 'drought', 'floods', 'flash flooding',
      'hurricane', 'typhoon', 'cyclone', 'El Nino', 'COP31', 'emissions', 'fossil fuel', 'fossil fuels', 'sea level',
    ],
  },
  {
    id: 'nature',
    name: 'Nature, air and water',
    strip: 'NATURE',
    terms: [
      'biodiversity', 'deforestation', 'rainforest', 'wildlife', 'endangered species', 'overfishing', 'coral reef', 'coral reefs',
      'coral bleaching', 'pollution', 'air pollution', 'air quality', 'smog', 'PM2.5', 'microplastics', 'plastic pollution',
      'oil spill', 'pesticide', 'pesticides', 'drinking water', 'groundwater', 'water crisis', 'water shortage', 'water scarcity',
      'sanitation',
    ],
    // audited 2026-11-02: "coral", "species", "plastic", "ocean", "toxic" and "extinction" caught mostly something else
  },
  {
    id: 'health',
    name: 'Health and epidemics',
    strip: 'HEALTH',
    terms: [
      'Ebola', 'outbreak', 'pandemic', 'epidemic', 'measles', 'cholera', 'malaria', 'tuberculosis', 'HIV', 'West Nile',
      'diphtheria', 'bird flu', 'H5N1', 'mpox', 'polio', 'vaccine', 'vaccines', 'overdose', 'overdoses',
    ],
  },
  {
    id: 'displacement',
    name: 'Displacement and humanitarian need',
    strip: 'DISPLACED',
    terms: [
      'refugee', 'refugees', 'displaced', 'internally displaced', 'asylum', 'asylum seekers', 'migrant', 'migrants',
      'deportation', 'deportations', 'humanitarian aid',
    ],
  },
  {
    id: 'democracy',
    name: 'Democracy and rights',
    strip: 'DEMOCRACY',
    terms: [
      'democracy', 'autocracy', 'authoritarian', 'authoritarianism', 'dictator', 'dictatorship', 'coup', 'human rights',
      'genocide', 'political prisoner', 'political prisoners', 'gerrymandering', 'voter suppression', 'repression',
      'civil liberties', 'forced labor', 'forced labour', 'modern slavery',
    ],
    exclude: ['coup de'],
  },
  {
    id: 'information',
    name: 'Information and manipulation',
    strip: 'MANIPULATION',
    terms: [
      'disinformation', 'misinformation', 'propaganda', 'deepfake', 'deepfakes', 'fake news', 'press freedom', 'censorship',
      'journalist', 'journalists', 'conspiracy theory', 'election interference', 'foreign interference', 'surveillance', 'spyware',
    ],
  },
  {
    id: 'ai',
    name: 'AI and its harms',
    strip: 'AI',
    terms: [
      'AI', 'artificial intelligence', 'ChatGPT', 'OpenAI', 'Anthropic', 'AGI', 'superintelligence', 'chatbot', 'chatbots',
      'data center', 'data centers', 'data centre', 'data centres',
    ],
    exclude: ['artificial superintelligence alliance', 'nex agi'],
  },
] as const satisfies readonly MapField[]

export type FieldId = (typeof FIELDS)[number]['id']

export const FIELD_IDS: readonly FieldId[] = FIELDS.map((f) => f.id)

/** The eleven fields of the map's first edition (2026-11-01). A file of that edition is held to them. */
export const FIRST_MAP_FIELDS: readonly FieldId[] = [
  'war', 'hunger', 'poverty', 'inequality', 'power', 'climate', 'health', 'displacement', 'democracy', 'information', 'ai',
]

/** The first briefing the map binds. The two before it stand as they were written. */
export const MAP_FROM_CYCLE = 12

/** One field can fill at most this many of a briefing's matters: AI filled three of ten. */
export const MATTERS_PER_FIELD = 2

/** A figure older than this many calendar years is no statement of where a field stands. */
const STALE_AFTER_YEARS = 2
const STATE_MAX = 280
/** What one sentence of a voice may hold. */
export const LINE_MAX = 200
const SPOKEN_MAX = 3

export const DIRECTIONS = ['worse', 'better', 'steady', 'unclear'] as const
export type Direction = (typeof DIRECTIONS)[number]

/** One field at the head of a briefing. */
export interface MapLine {
  field: FieldId
  /** one or two sentences holding a dated figure from the original source */
  state: string
  /** the date the figure is true of: YYYY, YYYY-MM or YYYY-MM-DD */
  as_of: string
  /** only what the source's own comparison shows; `unclear` where it offers none on the same definition */
  direction: Direction
  /** the earlier value and date that direction rests on */
  compared_with: string
  /** by the one count, over the briefing's thirty days */
  signals: number
  /** what the field's voice on the desk reads: the state, sentence by sentence, with `say` where a line holds a digit */
  lines: BriefingLine[]
  sources: BriefingSource[]
}

const AS_OF = /^\d{4}(-\d{2}(-\d{2})?)?$/

/** Every rule a map must keep, as a list of complaints (empty = valid). A file of the first edition is checked
 *  against FIRST_MAP_FIELDS. */
export function mapProblems(lines: readonly MapLine[], written: string, fields: readonly FieldId[] = FIELD_IDS): string[] {
  const out: string[] = []
  const order = lines.map((l) => l.field)
  if (order.join() !== fields.join()) out.push(`the map must hold its ${fields.length} fields in order, found: ${order.join(', ') || 'none'}`)
  const year = Number(written?.slice(0, 4))
  for (const l of lines) {
    if (!l.state?.trim() || l.state.length > STATE_MAX) out.push(`${l.field}: state empty or over ${STATE_MAX} characters`)
    if (!/\d/.test(l.state ?? '')) out.push(`${l.field}: no figure in the state`)
    if (!AS_OF.test(l.as_of ?? '')) out.push(`${l.field}: as_of`)
    else if (Number(l.as_of.slice(0, 4)) < year - STALE_AFTER_YEARS) out.push(`${l.field}: a figure of ${l.as_of} is stale`)
    if (!DIRECTIONS.includes(l.direction)) out.push(`${l.field}: direction`)
    if (l.direction !== 'unclear' && !l.compared_with?.trim()) out.push(`${l.field}: a direction with nothing to compare it with`)
    if (!Number.isInteger(l.signals) || l.signals < 0) out.push(`${l.field}: signals`)
    const spoken = l.lines ?? []
    if (spoken.length < 1 || spoken.length > SPOKEN_MAX) out.push(`${l.field}: ${spoken.length} lines for the voice`)
    for (const s of spoken) {
      if (!s.text?.trim() || s.text.length > LINE_MAX) out.push(`${l.field}: line too long or empty`)
      if (/\d/.test(s.say ?? s.text ?? '')) out.push(`${l.field}: a digit in what the voice is given: ${(s.say ?? s.text).slice(0, 40)}`)
    }
    const sources = l.sources ?? []
    if (sources.some((s) => !s.url?.startsWith('https://') || !s.label?.trim())) out.push(`${l.field}: source`)
    if (!sources.some((s) => s.kind === 'primary')) out.push(`${l.field}: no primary source`)
  }
  return out
}

/** The fields of the two briefings written before the map, read off them on 2026-11-01 and again on 2026-11-02
 *  for the thirteen fields: 010's energy shock as a cost-of-living crisis is debt, work and the cost of living,
 *  011's monitored wildlife is nature. */
export const FIELDS_BEFORE_THE_MAP: Readonly<Record<string, readonly FieldId[]>> = {
  'after-cycle-010': ['war', 'economy', 'hunger', 'climate', 'climate', 'war', 'health', 'ai', 'information', 'climate'],
  'after-cycle-011': ['health', 'climate', 'climate', 'nature', 'health', 'displacement', 'information', 'ai', 'ai', 'war'],
}

/** The ids of the two briefings before this one, newest first. */
export function earlierIds(id: string): string[] {
  const cycle = Number(id.slice(-3))
  return [cycle - 1, cycle - 2].filter((n) => n > 0).map((n) => `after-cycle-${String(n).padStart(3, '0')}`)
}

/** A field that stayed empty in both earlier briefings has to have a matter now. */
export function overdueFields(earlier: readonly (readonly FieldId[])[]): FieldId[] {
  if (earlier.length < 2) return []
  return FIELD_IDS.filter((f) => earlier.every((fields) => !fields.includes(f)))
}

/** How a briefing's matters spread over the map: known fields, at most two each, nothing overdue left out. */
export function spreadProblems(matters: readonly { id: string; field?: FieldId }[], earlier: readonly (readonly FieldId[])[]): string[] {
  const out: string[] = []
  const counts = new Map<FieldId, number>()
  for (const m of matters) {
    if (!m.field || !FIELD_IDS.includes(m.field)) {
      out.push(`${m.id}: no field of the map`)
      continue
    }
    counts.set(m.field, (counts.get(m.field) ?? 0) + 1)
  }
  for (const [field, n] of counts) if (n > MATTERS_PER_FIELD) out.push(`${n} matters in ${field}, at most ${MATTERS_PER_FIELD}`)
  for (const field of overdueFields(earlier)) if (!counts.has(field)) out.push(`${field} stayed empty twice and has to have a matter now`)
  return out
}
