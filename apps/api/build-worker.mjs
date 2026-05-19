import esbuild from 'esbuild';

const dev = process.argv.includes('--dev');

await esbuild.build({
  entryPoints: ['apps/api/src/worker.ts'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  outfile: 'dist/apps/api/worker.js',
  conditions: ['@minimalblock/source', 'worker', 'browser', 'import', 'default'],
  tsconfig: 'apps/api/tsconfig.worker.json',
  sourcemap: dev,
  minify: false,
});
