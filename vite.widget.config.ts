import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'widget',
  base: './',
  build: {
    outDir: '../dist/widget',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        widget: resolve(__dirname, 'widget/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@widget': resolve(__dirname, 'widget'),
    },
  },
  server: {
    port: 5174,
    cors: true,
  },
});

