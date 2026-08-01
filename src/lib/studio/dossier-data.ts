// src/lib/studio/dossier-data.ts — the assembly layer for the studio dossier.
//
// Same split as the atelier's dossier-data.ts: the build-tool bindings live HERE and nowhere else,
// so dossier.ts stays a pure module that can be unit-tested against the real committed files. One
// assembly, called once by the entrance and once by the tour's own room — two assemblies of the
// same records would drift, and this practice's whole claim is that its surfaces and its record say
// the same thing.

import { loadChronicle } from './chronicle'
import stageData from '@/data/studio/stage.curated.json'
import {
  buildStudioDossiers,
  type DossierKill,
  type DossierWorkMeta,
  type StudioDossier,
} from './dossier'

/** Every work's committed meta.json, keyed by slug. */
export function loadWorkMetas(): Record<string, DossierWorkMeta> {
  const metas = import.meta.glob('/src/content/studio/works/*/meta.json', {
    eager: true,
    import: 'default',
  }) as Record<string, DossierWorkMeta>
  return Object.fromEntries(
    Object.entries(metas).map(([path, meta]) => [path.split('/').at(-2) ?? path, meta]),
  )
}

/** One dossier per body of the house — every premiered work (the withdrawn one included) and every
 *  struck position — with the current premiere first. */
export function loadStudioDossiers(): StudioDossier[] {
  return buildStudioDossiers({
    chronicle: loadChronicle(),
    metas: loadWorkMetas(),
    kills: stageData.kills as DossierKill[],
  })
}
