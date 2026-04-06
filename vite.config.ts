import { defineConfig, Plugin } from 'vite';

// Plugin to preserve bare module specifiers for import-map-resolved packages.
// Vite normally tries to resolve/bundle all imports — this tells it to leave
// these alone and let the browser's import map handle them at runtime.
function importMapExternals(packages: string[]): Plugin {
  return {
    name: 'import-map-externals',
    enforce: 'pre',
    resolveId(source) {
      if (packages.some((pkg) => source === pkg || source.startsWith(pkg + '/'))) {
        return { id: source, external: true };
      }
    },
  };
}

const iwsdkPackages = [
  '@iwsdk/core',
  'super-three',
  'elics',
  '@preact/signals-core',
  'iwer',
];

export default defineConfig({
  plugins: [importMapExternals(iwsdkPackages)],
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
    rollupOptions: {
      external: iwsdkPackages,
    },
  },
});
