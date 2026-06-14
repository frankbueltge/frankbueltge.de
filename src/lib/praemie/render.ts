/** Deterministische Police-Prosa aus kanonischem police.json. Kein LLM —
 *  jeder Satz folgt mechanisch aus den Daten. Der dunkle Zwilling des Protokolls. */
import type { Locale } from '@/lib/site'
import {
  hasData,
  type Police,
  type PoliceClaimsData,
  type PoliceDisastersData,
  type PolicePremiumData,
  type PoliceRetreatData,
  type PoliceSource,
} from './types'

export const TEMPLATE_VERSION = '1.0.0'

const NUM_LOCALE: Record<Locale, string> = { de: 'de-DE', en: 'en-GB' }

const STR = {
  de: {
    kopf: [
      'Versicherungsschein — Die Gegenwart.',
      'Versicherungsnehmer: kommende Generationen.',
      'Versicherer: der Markt.',
      'Police-Nr. 1. Gültig: fortlaufend, unkündbar.',
    ],
    p1: { nummer: '§ 1', titel: 'Versicherte Gefahr' },
    p2: { nummer: '§ 2', titel: 'Die Prämie' },
    p3: { nummer: '§ 3', titel: 'Schadenverlauf' },
    p4: { nummer: '§ 4', titel: 'Laufende Regulierung' },
    p5: { nummer: '§ 5', titel: 'Risikoausschluss' },
    p6: { nummer: '§ 6', titel: 'Selbstbehalt' },
    p1body: 'Gegenstand der Versicherung ist die Klimakatastrophe.',
    p2index: 'Der Versicherungs-Preisindex steht bei {index} Punkten (Basis {base_year} = 100).',
    p2change: 'Die Prämie ist seit {base_year} um {change_pct} % gestiegen.',
    p3events:
      'Im Jahr {latest_year} wurden {events} Großschäden über je eine Milliarde US-Dollar angezeigt — Gesamtschaden {cost} Mrd. US-Dollar, {deaths} Tote.',
    p3cumulative: 'Kumulierter Schaden seit {since_year}: {cumulative} Mrd. US-Dollar.',
    p4body: 'Zuletzt regulierte Hochwasserschäden (Stichprobe von {count}): {paid} US-Dollar.',
    p5body:
      'Für wachsende Gebiete wird kein Versicherungsschutz mehr angeboten. Nicht-Erneuerungen (Kalifornien, Stand {as_of}): {non_renewals}.',
    p6body: 'Den Selbstbehalt trägt, wer keine Police hat.',
    schluss: ['Diese Police wurde nicht unterzeichnet.', 'Sie ist in Kraft. Prämie fällig.'],
    unavailable: '— (Quelle nicht erreichbar)',
    source: 'Quelle',
    retrieved: 'abgerufen',
    license: 'Lizenz',
  },
  en: {
    kopf: [
      'Insurance policy — The Present.',
      'Policyholder: future generations.',
      'Insurer: the market.',
      'Policy no. 1. Valid: continuous, non-terminable.',
    ],
    p1: { nummer: '§ 1', titel: 'Insured peril' },
    p2: { nummer: '§ 2', titel: 'The premium' },
    p3: { nummer: '§ 3', titel: 'Claims history' },
    p4: { nummer: '§ 4', titel: 'Ongoing settlement' },
    p5: { nummer: '§ 5', titel: 'Exclusion' },
    p6: { nummer: '§ 6', titel: 'Deductible' },
    p1body: 'The subject of insurance is the climate catastrophe.',
    p2index: 'The insurance price index stands at {index} points (base {base_year} = 100).',
    p2change: 'The premium has risen by {change_pct} % since {base_year}.',
    p3events:
      'In {latest_year}, {events} disasters exceeding one billion US dollars each were declared — total loss {cost} bn US dollars, {deaths} dead.',
    p3cumulative: 'Cumulative loss since {since_year}: {cumulative} bn US dollars.',
    p4body: 'Most recently settled flood claims (sample of {count}): {paid} US dollars.',
    p5body:
      'For growing areas, coverage is no longer offered. Non-renewals (California, as of {as_of}): {non_renewals}.',
    p6body: 'The deductible is borne by those without a policy.',
    schluss: ['This policy was not signed.', 'It is in force. Premium due.'],
    unavailable: '— (source unavailable)',
    source: 'Source',
    retrieved: 'retrieved',
    license: 'Licence',
  },
} as const

export interface RenderedParagraph {
  nummer: string
  titel: string
  zeilen: string[]
  quelle?: string
}
export interface RenderedPolice {
  kopf: string[]
  paragraphen: RenderedParagraph[]
  schluss: string[]
  meta: string
}

function nf(locale: Locale, opts: Intl.NumberFormatOptions): Intl.NumberFormat {
  return new Intl.NumberFormat(NUM_LOCALE[locale], opts)
}

/** Ganzzahl mit Tausendertrennung (Nicht-Erneuerungen, ausgezahlte Beträge). */
function fmtInt(value: number, locale: Locale): string {
  return nf(locale, { maximumFractionDigits: 0 }).format(value)
}

/** Eine Nachkommastelle (Index, Prozent, Mrd.-Beträge). */
function fmt1(value: number, locale: Locale): string {
  return nf(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)
}

export function fmtDateLong(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(NUM_LOCALE[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`))
}

/** Quellenzeile: Name, abgerufen {generated_at}, Lizenz. */
function sourceLine(source: PoliceSource, generatedAt: string, locale: Locale): string {
  const s = STR[locale]
  const ts = generatedAt.replace('T', ' ').replace('Z', ' UTC')
  return `${s.source}: ${source.name}, ${s.retrieved} ${ts}. ${s.license}: ${source.license}.`
}

export function renderPolice(police: Police, locale: Locale): RenderedPolice {
  const s = STR[locale]
  const ga = police.generated_at
  const paragraphen: RenderedParagraph[] = []

  // § 1 — Versicherte Gefahr (keine Daten, keine Quelle).
  paragraphen.push({ ...s.p1, zeilen: [s.p1body] })

  // § 2 — Die Prämie.
  if (hasData<PolicePremiumData>(police.premium)) {
    const p = police.premium
    paragraphen.push({
      ...s.p2,
      zeilen: [
        s.p2index
          .replace('{index}', fmt1(p.index, locale))
          .replace('{base_year}', String(p.base_year)),
        s.p2change
          .replace('{base_year}', String(p.base_year))
          .replace('{change_pct}', fmt1(p.change_pct_since_base, locale)),
      ],
      quelle: sourceLine(p.source, ga, locale),
    })
  } else {
    paragraphen.push({ ...s.p2, zeilen: [s.unavailable] })
  }

  // § 3 — Schadenverlauf.
  if (hasData<PoliceDisastersData>(police.disasters)) {
    const d = police.disasters
    paragraphen.push({
      ...s.p3,
      zeilen: [
        s.p3events
          .replace('{latest_year}', String(d.latest_year))
          .replace('{events}', fmtInt(d.latest_year_events, locale))
          .replace('{cost}', fmt1(d.latest_year_cost_busd, locale))
          .replace('{deaths}', fmtInt(d.latest_year_deaths, locale)),
        s.p3cumulative
          .replace('{since_year}', String(d.since_year))
          .replace('{cumulative}', fmt1(d.cumulative_cost_busd, locale)),
      ],
      quelle: sourceLine(d.source, ga, locale),
    })
  } else {
    paragraphen.push({ ...s.p3, zeilen: [s.unavailable] })
  }

  // § 4 — Laufende Regulierung.
  if (hasData<PoliceClaimsData>(police.claims)) {
    const c = police.claims
    paragraphen.push({
      ...s.p4,
      zeilen: [
        s.p4body
          .replace('{count}', fmtInt(c.recent_count, locale))
          .replace('{paid}', fmtInt(c.recent_paid_usd, locale)),
      ],
      quelle: sourceLine(c.source, ga, locale),
    })
  } else {
    paragraphen.push({ ...s.p4, zeilen: [s.unavailable] })
  }

  // § 5 — Risikoausschluss.
  if (hasData<PoliceRetreatData>(police.retreat)) {
    const r = police.retreat
    paragraphen.push({
      ...s.p5,
      zeilen: [
        s.p5body
          .replace('{as_of}', fmtDateLong(r.as_of, locale))
          .replace('{non_renewals}', fmtInt(r.non_renewals, locale)),
      ],
      quelle: sourceLine(r.source, ga, locale),
    })
  } else {
    paragraphen.push({ ...s.p5, zeilen: [s.unavailable] })
  }

  // § 6 — Selbstbehalt (keine Daten, keine Quelle).
  paragraphen.push({ ...s.p6, zeilen: [s.p6body] })

  return {
    kopf: [...s.kopf],
    paragraphen,
    schluss: [...s.schluss],
    meta: `Fassung ${police.pipeline_version} · Schema ${police.schema_version} · ${ga}`,
  }
}
