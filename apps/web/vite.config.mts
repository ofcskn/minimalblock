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
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-i18n': ['i18next', 'react-i18next'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-virtual': ['@tanstack/react-virtual'],
          'vendor-qrcode': ['qrcode'],
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
