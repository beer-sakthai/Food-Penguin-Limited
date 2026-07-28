import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    // server.test.ts overrides this to 'node' via a `@vitest-environment`
    // doc-comment — it needs esbuild/vite, which break under jsdom's
    // polyfilled globals.
    environment: 'jsdom',
    env: {
      NODE_ENV: 'test',
    },
  },
});
