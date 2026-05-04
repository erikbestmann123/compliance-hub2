import { defineConfig } from 'vite';

export default defineConfig({
  // Ensure web components from Saffron are not externalized
  optimizeDeps: {
    include: ['@thomsonreuters/saffron-core-components-prototyping-only'],
  },
  build: {
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
