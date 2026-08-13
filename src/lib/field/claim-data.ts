// src/lib/field/claim-data.ts — the Field's claim plate, assembled from the committed export.
//
// Same split as partitur-data.ts, and the same reason: the model used to be built inline on the
// Field's old entrance, so when the pyramid rewrite (#560, 2026-08-12) replaced that page the
// ASSEMBLY went with it and `ClaimFigure.astro` — the practice's signature figure — could not be
// mounted anywhere, whatever anyone wanted. The figure never broke; nothing could feed it.
//
// Sources unchanged from the retired page: Meridian's parallax export and the objects of the
// k1t04 real run. No new claim is made here.

import { buildClaimModel, type ClaimModel, type ExportObject, type ParallaxExport } from '@/lib/field/claimladder'
import parallax from '@/data/meridian/parallax.json'

const exportObjects: Record<string, ExportObject> = Object.fromEntries(
  Object.entries(
    import.meta.glob('/src/data/meridian/export/k1t04_real_run_v2/objects/*.json', {
      eager: true, import: 'default',
    }) as Record<string, ExportObject>,
  ).map(([path, body]) => [path.split('/').at(-1) ?? path, body]),
)

/** The claim under review: one claim of the collective's, the ceiling the runtime's ruling holds
 *  it to, the two verifications closing in from opposite sides, and every finding they filed. */
export function loadClaimModel(): ClaimModel {
  return buildClaimModel({ parallax: parallax as unknown as ParallaxExport, objects: exportObjects })
}
