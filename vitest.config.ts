import { defineConfig } from 'vitest/config';

// Separado do vite.config.ts para os testes rodarem a partir da raiz do repo, não de demo/.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
  },
});
