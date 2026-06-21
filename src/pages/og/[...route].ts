import { OGImageRoute } from 'astro-og-canvas'
import { OG_PAGES } from '@/lib/og'

// Build-time OG-Bilder (1200×630) je Seite — Mono-Skin: JetBrains Mono auf dunklem Grund,
// Akzent-Kante links. Generiert /og/<key>.png.
export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages: OG_PAGES,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [
      [10, 10, 10],
      [10, 10, 10],
    ],
    border: { color: [122, 124, 132], width: 10, side: 'inline-start' },
    padding: 80,
    font: {
      title: {
        color: [244, 244, 245],
        size: 64,
        weight: 'Bold',
        families: ['JetBrains Mono'],
        lineHeight: 1.2,
      },
      description: {
        color: [163, 163, 168],
        size: 30,
        weight: 'Normal',
        families: ['JetBrains Mono'],
        lineHeight: 1.4,
      },
    },
    fonts: [
      './src/assets/og-fonts/JetBrainsMono-Bold.ttf',
      './src/assets/og-fonts/JetBrainsMono-Regular.ttf',
    ],
  }),
})
