import { defineConfig } from 'vite';

export default defineConfig({
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
