import { defineConfig } from 'vite';

export default defineConfig({
  // Ensure web components from Saffron are not externalized
  optimizeDeps: {
    include: ['@thomsonreuters/saffron-core-components-prototyping-only'],
  },
  build: {
    // Saffron components-prototyping-only ships as a single non-tree-shakeable
    // barrel (~2.2 MB). The shared chunk will exceed Vite's 500 kB default;
    // raise the limit so the warning reflects reality.
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      input: {
        main: 'index.html',
        portfolios: 'portfolios.html',
        'compliance-summary': 'compliance-summary.html',
        'template-update': 'template-update.html',
      },
    },
  },
});
