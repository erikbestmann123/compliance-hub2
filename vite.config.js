import { defineConfig } from 'vite';

export default defineConfig({
  // Ensure web components from @saffron are not externalized
  optimizeDeps: {
    include: ['@saffron/core-components'],
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
