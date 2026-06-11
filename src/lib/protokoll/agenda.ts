import type { Locale } from '@/lib/site'

/** Registerfassung: bei jeder Template-Änderung erhöhen (steht auf jeder Seite). */
export const TEMPLATE_VERSION = '1.0.0'

type L10n = Record<Locale, string>

export interface AgendaEntry {
  id: string
  /** Satz-Template; {value} und {label} werden ersetzt. Einheit steht im Satz. */
  phrase: L10n
}

export interface AgendaTop {
  n: number
  title: L10n
  entries: AgendaEntry[]
}

export const AGENDA: AgendaTop[] = [
  { n: 1, title: { de: 'Atmosphäre', en: 'Atmosphere' }, entries: [
    { id: 'co2', phrase: {
      de: 'Die CO₂-Konzentration der Atmosphäre beträgt {value} ppm.',
      en: 'Atmospheric CO₂ concentration stands at {value} ppm.' } },
  ] },
  { n: 2, title: { de: 'Meereis', en: 'Sea ice' }, entries: [
    { id: 'seaice_north', phrase: {
      de: 'Ausdehnung Arktis: {value} Mio. km².',
      en: 'Arctic extent: {value} million km².' } },
    { id: 'seaice_south', phrase: {
      de: 'Ausdehnung Antarktis: {value} Mio. km².',
      en: 'Antarctic extent: {value} million km².' } },
  ] },
  { n: 3, title: { de: 'Ozean', en: 'Ocean' }, entries: [
    { id: 'sst', phrase: {
      de: 'Mittlere Meeresoberflächentemperatur: {value} °C.',
      en: 'Global mean sea surface temperature: {value} °C.' } },
  ] },
  { n: 4, title: { de: 'Feuer', en: 'Fire' }, entries: [
    { id: 'fires', phrase: {
      de: 'Aktive Branddetektionen weltweit (Satellit, 24 h): {value}.',
      en: 'Active fire detections worldwide (satellite, 24 h): {value}.' } },
  ] },
  { n: 5, title: { de: 'Erdbewegung', en: 'Seismicity' }, entries: [
    { id: 'quakes', phrase: {
      de: 'Beben der Stärke ≥ 4,5 in den letzten 24 Stunden: {value}.',
      en: 'Earthquakes of magnitude ≥ 4.5 in the past 24 hours: {value}.' } },
  ] },
  { n: 6, title: { de: 'Anwesenheit', en: 'Attendance' }, entries: [
    { id: 'population', phrase: {
      de: 'Geschätzte Weltbevölkerung: {value} Mrd. Menschen.',
      en: 'Estimated world population: {value} bn people.' } },
  ] },
  { n: 7, title: { de: 'Vertreibung', en: 'Displacement' }, entries: [
    { id: 'refugees', phrase: {
      de: 'Menschen auf der Flucht: {value}.',
      en: 'People forcibly displaced: {value}.' } },
  ] },
  { n: 8, title: { de: 'Ernährung', en: 'Food' }, entries: [
    { id: 'food', phrase: {
      de: 'FAO-Nahrungsmittelpreisindex: {value} Punkte (2014–2016 = 100).',
      en: 'FAO Food Price Index: {value} points (2014–2016 = 100).' } },
  ] },
  { n: 9, title: { de: 'Geldpreis', en: 'Price of money' }, entries: [
    { id: 'rates', phrase: {
      de: 'Kurzfristiger Euro-Zinssatz (€STR): {value} %.',
      en: 'Euro short-term rate (€STR): {value} %.' } },
  ] },
  { n: 10, title: { de: 'Energie', en: 'Energy' }, entries: [
    { id: 'oil', phrase: {
      de: 'Rohöl Brent: {value} US-Dollar je Barrel.',
      en: 'Brent crude: {value} US dollars per barrel.' } },
  ] },
  { n: 11, title: { de: 'Konflikt', en: 'Conflict' }, entries: [
    { id: 'conflict', phrase: {
      de: 'Erfasste Konfliktereignisse weltweit, Vortag: {value}.',
      en: 'Recorded conflict events worldwide, previous day: {value}.' } },
  ] },
  { n: 12, title: { de: 'Aufmerksamkeit', en: 'Attention' }, entries: [
    { id: 'attention', phrase: {
      de: 'Gegenstand der größten Aufmerksamkeit (englischsprachige Wikipedia): „{label}“ — {value} Aufrufe.',
      en: 'Object of greatest attention (English-language Wikipedia): "{label}" — {value} views.' } },
  ] },
]
