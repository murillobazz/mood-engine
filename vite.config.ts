import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// The demo lives in demo/ and imports the engine straight from src/.
export default defineConfig({
  root: fileURLToPath(new URL('./demo', import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
});
