export interface Coord {
  lat: number | null
  lon: number | null
}

export interface GfRegions {
  mpa: boolean
  no_take: boolean
  eez: string[]
  eez_name?: string | null
  high_seas: boolean
}

export interface GfEvent {
  id: string
  vessel: { name: string; flag: string; type: string }
  start: string
  end: string
  duration_hours: number
  off: Coord
  on: Coord
  regions: GfRegions
  gfw_url: string
}

export interface GfIndex {
  total: number
  dark_hours_examined: number
  in_eez: number
  on_high_seas: number
  in_mpa: number
  in_no_take: number
}

export interface GhostFleetData {
  date: string
  generated_at: string
  schema_version: string
  pipeline_version: string
  window: { from: string; to: string; ended_within_days: number; examined: number; capped: boolean }
  index: GfIndex
  pick: string | null
  events: GfEvent[]
  source: { name: string; url: string; license: string }
}
