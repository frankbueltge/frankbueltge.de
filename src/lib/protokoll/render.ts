/** Deterministische Prosa aus kanonischem JSON. Kein LLM — jeder Satz folgt mechanisch aus Daten. */
import type { Locale } from '@/lib/site'
import { AGENDA, TEMPLATE_VERSION, type AgendaTop } from './agenda'
import type { ProtokollDay, ProtokollEntry } from './types'

const NUM_LOCALE: Record<Locale, string> = { de: 'de-DE', en: 'en-GB' }

interface ValueFormat { maxFrac: number; scale?: number }
const VALUE_FORMATS: Record<string, ValueFormat> = {
  co2: { maxFrac: 2 }, seaice_north: { maxFrac: 3 }, seaice_south: { maxFrac: 3 },
  sst: { maxFrac: 2 }, fires: { maxFrac: 0 }, quakes: { maxFrac: 0 },
  population: { maxFrac: 2, scale: 1e-9 }, refugees: { maxFrac: 0 },
  food: { maxFrac: 1 }, rates: { maxFrac: 2 }, oil: { maxFrac: 2 },
  conflict: { maxFrac: 0 }, attention: { maxFrac: 0 },
}

const STR = {
  de: {
    minutesOf: 'Protokoll der Sitzung vom {date}.',
    present: 'Anwesend: ca. {value} Mrd. (Schätzung).',
    presentUnknown: 'Anwesend: nicht festgestellt.',
    chair: 'Vorsitz: unbesetzt.',
    quorum: 'Beschlussfähigkeit: nicht festgestellt.',
    top: 'TOP',
    unavailable: 'Quelle nicht erreichbar — Feststellung entfällt.',
    implausible: 'Wert außerhalb des Plausibilitätskorridors — Feststellung unter Vorbehalt: {value} {unit}.',
    record: 'Höchster Stand seit Beginn der Aufzeichnung.',
    discussion: 'Aussprache: keine.',
    resolution: 'Beschluss: vertagt.',
    source: 'Quelle',
    retrieved: 'abgerufen',
    asOf: 'Stand',
    notClosed: 'Die Sitzung wurde nicht geschlossen.',
    next: 'Nächste Sitzung: morgen.',
    cmp: {
      prev_day: 'Vortag', prev_month: 'Vormonat', prev_year_day: 'Vorjahrestag',
      prev_observation_day: 'Vorherige Beobachtung',
    },
    cadence: {
      monthly: 'monatliche Erhebung', periodic: 'periodische Erhebung',
      computed: 'Schätzung/Extrapolation',
    } as Record<string, string>,
    lossesIntro: 'In den vergangenen sieben Tagen wurden {n} Großereignisse mit Todesopfern verzeichnet:',
    lossesIntroOne: 'In den vergangenen sieben Tagen wurde ein Großereignis mit Todesopfern verzeichnet:',
    lossesNone: 'In den vergangenen sieben Tagen wurde kein Großereignis mit Todesopfern (≥ 25) verzeichnet.',
    lossesClosing: 'Zu Protokoll genommen.',
    fatalities: 'Todesopfer',
  },
  en: {
    minutesOf: 'Minutes of the session of {date}.',
    present: 'Present: approx. {value} bn (estimate).',
    presentUnknown: 'Present: not established.',
    chair: 'Chair: vacant.',
    quorum: 'Quorum: not established.',
    top: 'Item',
    unavailable: 'Source unreachable — finding omitted.',
    implausible: 'Value outside the plausibility corridor — finding under reserve: {value} {unit}.',
    record: 'Highest value since records began.',
    discussion: 'Discussion: none.',
    resolution: 'Resolution: adjourned.',
    source: 'Source',
    retrieved: 'retrieved',
    asOf: 'As of',
    notClosed: 'The session was not closed.',
    next: 'Next session: tomorrow.',
    cmp: {
      prev_day: 'Previous day', prev_month: 'Previous month',
      prev_year_day: 'Same day last year', prev_observation_day: 'Previous observation',
    },
    cadence: {
      monthly: 'monthly survey', periodic: 'periodic survey',
      computed: 'estimate/extrapolation',
    } as Record<string, string>,
    lossesIntro: 'In the past seven days, {n} major events with fatalities are recorded:',
    lossesIntroOne: 'In the past seven days, one major event with fatalities is recorded:',
    lossesNone: 'In the past seven days, no major event with fatalities (≥ 25) was recorded.',
    lossesClosing: 'Entered into the record.',
    fatalities: 'fatalities',
  },
} as const

export interface RenderedTop { heading: string; lines: string[]; sources: string[]; closing: string }
export interface RenderedDay { kopf: string[]; tops: RenderedTop[]; schluss: string[]; meta: string }

/** Einheiten kommen aus der Pipeline auf Deutsch — für EN-Sätze übersetzen. */
const UNIT_L10N: Record<string, Record<Locale, string>> = {
  'Mio. km²': { de: 'Mio. km²', en: 'million km²' },
  Beben: { de: 'Beben', en: 'quakes' },
  Detektionen: { de: 'Detektionen', en: 'detections' },
  Menschen: { de: 'Menschen', en: 'people' },
  Punkte: { de: 'Punkte', en: 'points' },
  Aufrufe: { de: 'Aufrufe', en: 'views' },
  Ereignisse: { de: 'Ereignisse', en: 'events' },
  'USD/Barrel': { de: 'USD/Barrel', en: 'USD/barrel' },
}

function unitFor(unit: string, locale: Locale): string {
  return UNIT_L10N[unit]?.[locale] ?? unit
}

export function fmtValue(id: string, value: number, locale: Locale): string {
  const f = VALUE_FORMATS[id] ?? { maxFrac: 2 }
  const v = f.scale ? value * f.scale : value
  return new Intl.NumberFormat(NUM_LOCALE[locale], { maximumFractionDigits: f.maxFrac }).format(v)
}

export function fmtDateLong(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(NUM_LOCALE[locale], {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`))
}

function sourceLine(e: ProtokollEntry, locale: Locale): string {
  const s = STR[locale]
  const ts = e.retrieved_at.replace('T', ' ').replace('Z', ' UTC')
  const parts = [`${s.source}: ${e.source.name}, ${s.retrieved} ${ts}.`]
  const cad = s.cadence[e.cadence]
  if (e.as_of) parts.push(`${s.asOf}: ${fmtDateLong(e.as_of, locale)}${cad ? ` (${cad})` : ''}.`)
  else if (cad) parts.push(`(${cad}).`)
  return parts.join(' ')
}

function renderTop(top: AgendaTop, byId: Map<string, ProtokollEntry>, locale: Locale): RenderedTop {
  const s = STR[locale]
  const lines: string[] = []
  const sources: string[] = []
  for (const def of top.entries) {
    const e = byId.get(def.id)
    if (!e || e.status === 'unavailable') {
      lines.push(s.unavailable)
      if (e) sources.push(sourceLine(e, locale))
      continue
    }
    if (e.status === 'implausible') {
      lines.push(
        s.implausible
          .replace('{value}', e.value != null ? fmtValue(def.id, e.value, locale) : '—')
          .replace('{unit}', unitFor(e.unit, locale)),
      )
      sources.push(sourceLine(e, locale))
      continue
    }
    let line = def.phrase[locale].replace(
      '{value}', e.value != null ? fmtValue(def.id, e.value, locale) : '—')
    if (e.label) line = line.replace('{label}', e.label)
    lines.push(line)
    if (e.comparison) {
      lines.push(
        `${s.cmp[e.comparison.label]}: ${fmtValue(def.id, e.comparison.value, locale)} ${unitFor(e.unit, locale)}.`,
      )
    }
    if (e.record) lines.push(s.record)
    sources.push(sourceLine(e, locale))
  }
  return {
    heading: `${s.top} ${top.n} — ${top.title[locale]}.`,
    lines, sources,
    closing: `${s.discussion} ${s.resolution}`,
  }
}

function fmtCount(n: number, locale: Locale): string {
  return new Intl.NumberFormat(NUM_LOCALE[locale], { maximumFractionDigits: 0 }).format(n)
}

/** TOP „Verluste": Liste statt Skalar, Schlusszeile „Zu Protokoll genommen." — bezeugt, nicht
 *  vertagt. Fehlt der Eintrag (Altbestand vor Schema 2) oder ist die Quelle aus, entfällt der TOP. */
function renderVerluste(top: AgendaTop, e: ProtokollEntry | undefined, locale: Locale): RenderedTop | null {
  if (!e || e.status !== 'ok') return null
  const s = STR[locale]
  const events = e.events ?? []
  const lines: string[] = []
  if (events.length === 0) {
    lines.push(s.lossesNone)
  } else {
    lines.push(
      (events.length === 1 ? s.lossesIntroOne : s.lossesIntro).replace('{n}', fmtCount(events.length, locale)),
    )
    for (const ev of events) {
      const label = locale === 'de' ? ev.label_de : ev.label_en
      lines.push(`— ${fmtDateLong(ev.date, locale)}: ${label}, ${fmtCount(ev.deaths, locale)} ${s.fatalities}.`)
    }
  }
  return {
    heading: `${s.top} ${top.n} — ${top.title[locale]}.`,
    lines,
    sources: [sourceLine(e, locale)],
    closing: s.lossesClosing,
  }
}

export function renderDay(day: ProtokollDay, locale: Locale): RenderedDay {
  const s = STR[locale]
  const byId = new Map(day.entries.map((e) => [e.top_id, e]))
  const pop = byId.get('population')
  const kopf = [
    s.minutesOf.replace('{date}', fmtDateLong(day.date, locale)),
    pop && pop.status === 'ok' && pop.value != null
      ? s.present.replace('{value}', fmtValue('population', pop.value, locale))
      : s.presentUnknown,
    s.chair,
    s.quorum,
  ]
  return {
    kopf,
    tops: AGENDA.flatMap((top) => {
      if (top.entries[0]?.id === 'verluste') {
        const r = renderVerluste(top, byId.get('verluste'), locale)
        return r ? [r] : []
      }
      return [renderTop(top, byId, locale)]
    }),
    schluss: [s.notClosed, s.next],
    meta: `Registerfassung ${TEMPLATE_VERSION} · Pipeline ${day.pipeline_version} · Schema ${day.schema_version}`,
  }
}
