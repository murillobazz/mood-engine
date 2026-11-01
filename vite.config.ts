import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// A demo fica em demo/ e importa o motor direto de src/.
export default defineConfig({
  root: fileURLToPath(new URL('./demo', import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
});
