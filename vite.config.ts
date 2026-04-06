import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Point @iwsdk/core to our local shim (backed by Three.js).
      // When the real IWSDK package ships, remove this alias and
      // install the real package or switch to an import map.
      '@iwsdk/core': path.resolve(__dirname, 'src/lib/iwsdk-core.ts'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.replit.dev'],
    hmr: {
      clientPort: 443,
    },
  },
  build: {
    target: 'ES2022',
  },
});
