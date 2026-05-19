/** @type {import('esbuild').BuildOptions} */
export default {
  entryPoints: ['apps/api/src/worker.ts'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  outfile: 'dist/apps/api/worker.js',
  conditions: ['@minimalblock/source', 'worker', 'browser', 'import', 'default'],
  tsconfig: 'apps/api/tsconfig.worker.json',
  sourcemap: false,
  minify: false,
};
