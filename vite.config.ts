import { defineConfig } from 'vite';
import { resolve } from 'path';

// Main vite config for demo page development
export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    open: '/demo/index.html',
    cors: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});

