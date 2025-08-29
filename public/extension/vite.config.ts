import { defineConfig } from 'vite';
import { resolve } from 'path';

// Build bare TS files for MV3: content script and service worker, output into root dist
export default defineConfig({
  build: {
    outDir: '../../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        'content_scripts': resolve(__dirname, 'src/content_scripts.ts'),
        'service_worker': resolve(__dirname, 'src/service_worker.ts'),
      },
      output: {
  // Keep filenames stable for MV3 manifest references
  entryFileNames: (chunk) => `${chunk.name}.js`,
  // Use ES output to support multiple inputs; iife enforces inlineDynamicImports and breaks multi-entry
  format: 'es',
      },
    },
    sourcemap: true,
    target: 'es2022',
  },
});
