// Writes a cut still as the entrance's two duotone files (2026-11-03): `<key>.webp` in the light
// theme's tones and `<key>.dark.webp` in the dark theme's. The mapping is src/lib/ops/duotone.ts;
// this only decodes the picture with sharp and encodes the two results. Shared by
// scripts/shelf-stills.ts and scripts/shelf-shots.ts, which hand it their sharp.

import { join } from 'node:path'
import { DUOTONES, duotone, isDark } from '../src/lib/ops/duotone.ts'

// sharp's own type stays out of this file: the scripts import it dynamically, and may not have it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sharp = any

export async function writeDuotones(sharp: Sharp, input: Buffer | string, crop: { file: string; darkFile: string }, root: string): Promise<void> {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const invert = isDark(data, info.channels)
  for (const [theme, file] of [
    ['light', crop.file],
    ['dark', crop.darkFile],
  ] as const) {
    const toned = duotone(data, info.channels, DUOTONES[theme], invert)
    await sharp(Buffer.from(toned), { raw: { width: info.width, height: info.height, channels: 3 } })
      .webp({ quality: 74 })
      .toFile(join(root, file))
  }
}
