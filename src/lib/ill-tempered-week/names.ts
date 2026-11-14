// src/lib/ill-tempered-week/names.ts — the names the ill-tempered week writes for a field of the map and for an
// instrument of the library (2026-11-09; moved out of albums.ts on 2026-11-14 so the browser can read them without
// albums.ts's node:fs).

/** The field's name as the map writes it. */
export const FIELD: Record<string, string> = {
  war: 'war and violence', hunger: 'hunger', poverty: 'poverty', economy: 'debt, work and cost of living',
  inequality: 'inequality', power: 'concentration of money and power', climate: 'climate and disasters',
  nature: 'nature, air and water', health: 'health and epidemics', displacement: 'displacement and humanitarian need',
  democracy: 'democracy and rights', information: 'information and manipulation', ai: 'AI and its harms',
}

/** The instrument a field's overlooked headline is answered by (VSCO 2 CE patch → its name). */
export const INSTRUMENT: Record<string, string> = {
  FluteSusVib: 'flute', BassoonSus: 'bassoon', OboeSusVib: 'oboe', FHornSus: 'horn', TromboneSus: 'trombone',
  SViolinVib: 'solo violin', ClarinetSus: 'clarinet', CelloEnsSusVib: 'cellos', TrumpetSus: 'trumpet',
  ViolaEnsSusVib: 'violas', PiccoloSus: 'piccolo', TubaSus: 'tuba', ContrabassSusVB: 'double bass',
}
