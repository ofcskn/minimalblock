/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  server: {
    port: 2500,
    host: 'localhost',
  },
  preview: {
    port: 2500,
    host: 'localhost',
  },
  plugins: [
    react(),
    process.env['ANALYZE'] &&
      visualizer({ open: true, gzipSize: true, brotliSize: true, filename: 'dist/stats.html' }),
  ],
  resolve: {
    conditions: ['@minimalblock/source'],
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'react-router-dom', '@tanstack/react-query'],
  },
  build: {
    outDir: '../../dist/apps/web',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react';
          if (id.includes('node_modules/react/')) return 'vendor-react';
          if (id.includes('@supabase/supabase-js')) return 'vendor-supabase';
          if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n';
          if (id.includes('@tanstack/react-query')) return 'vendor-query';
          if (id.includes('@tanstack/react-virtual')) return 'vendor-virtual';
          if (id.includes('qrcode')) return 'vendor-qrcode';
        },
      },
    },
  },
  test: {
    name: '@minimalblock/web',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
