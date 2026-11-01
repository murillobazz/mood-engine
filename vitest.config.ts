import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts so tests run from the repo root, not demo/.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
  },
});
