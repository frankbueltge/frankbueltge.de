/** Tagessnapshot der Bahndaten (von scripts/fetch-ueberflug.ts erzeugt, täglich überschrieben). */
export interface Omm {
  OBJECT_NAME: string
  OBJECT_ID: string
  NORAD_CAT_ID: number
  EPOCH: string
  MEAN_MOTION: number
  ECCENTRICITY: number
  INCLINATION: number
  RA_OF_ASC_NODE: number
  ARG_OF_PERICENTER: number
  MEAN_ANOMALY: number
  EPHEMERIS_TYPE: number
  CLASSIFICATION_TYPE: string
  ELEMENT_SET_NO: number
  REV_AT_EPOCH: number
  BSTAR: number
  MEAN_MOTION_DOT: number
  MEAN_MOTION_DDOT: number
}

/** GCAT-Klassen: C zivil, D militärisch, B kommerziell, A Amateur. */
export type GcatClass = 'C' | 'D' | 'B' | 'A'

export interface SatEntry {
  norad: number
  name: string
  intl: string // internationaler Designator (Join-Schlüssel)
  group: string // CelesTrak-GROUP (resource | sar | weather)
  gcat: { class: GcatClass | null; category: string | null; owner: string | null; state: string | null }
  omm: Omm
}

export interface SatSnapshot {
  generated_at: string
  sources: { name: string; url: string; license: string }[]
  satellites: SatEntry[]
}
