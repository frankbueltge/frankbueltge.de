import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // mirror tsconfig's "@/*" → "src/*" (Astro provides it for the app; tests need it here)
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    // scripts/ joined src/ on 2026-08-13. The automation under scripts/ had never been testable
    // by this config, so anything written there was guarded by nothing — the same shape as the
    // ulysses repository, where a test against dead protocol pointers sat in the tree for a day
    // without CI ever running it. A test that cannot be reached is not a weaker guard than none;
    // it is none, wearing the look of one.
    // .test.tsx joined on 2026-09-02 with the first React island: its server render is tested
    // with react-dom/server in plain node — no DOM emulation, the floor is a string.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.ts'],
  },
})
