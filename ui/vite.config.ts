import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

export default defineConfig({
  plugins: [solidPlugin(), viteCommonjs()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
