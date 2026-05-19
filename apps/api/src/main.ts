/**
 * Local development entry point — wraps the Workers fetch handler in a
 * lightweight Node.js HTTP server so `nx serve api` still works without wrangler.
 *
 * Production deployments use src/worker.ts via wrangler.
 */
import { createServer } from 'node:http';
import { handleRequest, type ApiEnv } from './lib/server.js';

function getEnv(): ApiEnv {
  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  const geminiApiKey = process.env['GEMINI_API_KEY'];

  if (!supabaseUrl || !supabaseServiceRoleKey || !geminiApiKey) {
    throw new Error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY');
  }

  return {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
    GEMINI_API_KEY: geminiApiKey,
    CORS_ORIGIN: process.env['CORS_ORIGIN'],
    TRENDYOL_MERCHANT_ID: process.env['TRENDYOL_MERCHANT_ID'],
    TRENDYOL_API_KEY: process.env['TRENDYOL_API_KEY'],
    TRENDYOL_API_SECRET: process.env['TRENDYOL_API_SECRET'],
    TRENDYOL_MOCK: process.env['TRENDYOL_MOCK'],
  };
}

const env = getEnv();
const port = Number(process.env['API_PORT'] ?? 8787);

const server = createServer(async (req, res) => {
  const url = `http://localhost:${port}${req.url ?? '/'}`;
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
  }
  const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

  const webRequest = new Request(url, {
    method: req.method ?? 'GET',
    headers: req.headers as Record<string, string>,
    body: body && body.length > 0 ? body : undefined,
  });

  const response = await handleRequest(webRequest, env);

  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  const responseBuffer = await response.arrayBuffer();
  res.end(Buffer.from(responseBuffer));
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Minimal Block API (local dev) listening on port ${port}`);
});
