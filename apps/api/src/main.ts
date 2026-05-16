import { createApiServer } from './lib/server.js';

const server = createApiServer();

server.listen(process.env['API_PORT'] ? Number(process.env['API_PORT']) : 8787, () => {
  // eslint-disable-next-line no-console
  console.log(`Minimal Block API listening on port ${process.env['API_PORT'] ?? 8787}`);
});
