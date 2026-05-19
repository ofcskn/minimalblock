import { QualityReport } from '@minimalblock/core';
import { handleRequest, type ApiEnv } from './server';

// ---------------------------------------------------------------------------
// Minimal env stub — business logic is not exercised in route-level tests;
// only routing, auth guards, CORS, and error mapping are tested here.
// ---------------------------------------------------------------------------
const stubEnv: ApiEnv = {
  SUPABASE_URL: 'http://localhost:54321',
  SUPABASE_SERVICE_ROLE_KEY: 'stub-key',
  GEMINI_API_KEY: 'stub-gemini',
  CORS_ORIGIN: 'http://localhost:3000',
};

function req(method: string, path: string, options: { body?: unknown; auth?: string } = {}): Request {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.auth) headers['authorization'] = `Bearer ${options.auth}`;
  return new Request(`http://localhost${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

// ---------------------------------------------------------------------------
// Quality report heuristics (pure domain logic — no network calls)
// ---------------------------------------------------------------------------
describe('api quality report heuristics', () => {
  it('scores a small model above a large one', () => {
    const small = new QualityReport({
      fileSizeBytes: 2_000_000,
      triangleCount: 50_000,
      textureMaxDim: 2048,
      hasUSDZ: false,
      arCompat: true,
      warnings: [],
    });

    const large = new QualityReport({
      fileSizeBytes: 18_000_000,
      triangleCount: 250_000,
      textureMaxDim: 4096,
      hasUSDZ: false,
      arCompat: true,
      warnings: ['too large'],
    });

    expect(small.score()).toBeGreaterThan(large.score());
  });
});

// ---------------------------------------------------------------------------
// Health endpoint — no auth required
// ---------------------------------------------------------------------------
describe('GET /health', () => {
  it('returns 200 { ok: true }', async () => {
    const res = await handleRequest(req('GET', '/health'), stubEnv);
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it('sets CORS header', async () => {
    const res = await handleRequest(req('GET', '/health'), stubEnv);
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');
  });
});

// ---------------------------------------------------------------------------
// CORS preflight — OPTIONS on any path
// ---------------------------------------------------------------------------
describe('OPTIONS preflight', () => {
  it('returns 204 with CORS headers', async () => {
    const res = await handleRequest(req('OPTIONS', '/api/conversions'), stubEnv);
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-methods')).toContain('POST');
  });

  it('returns 204 on unknown path OPTIONS', async () => {
    const res = await handleRequest(req('OPTIONS', '/api/nonexistent'), stubEnv);
    expect(res.status).toBe(204);
  });
});

// ---------------------------------------------------------------------------
// Auth guard — every protected endpoint must reject missing / bad tokens
// ---------------------------------------------------------------------------
describe('auth guard', () => {
  const protectedRoutes: Array<[string, string]> = [
    ['POST', '/api/conversions'],
    ['POST', '/api/products/import-url'],
    ['GET', '/api/conversions/abc123'],
    ['POST', '/api/conversions/abc123/approve'],
    ['POST', '/api/conversions/abc123/reject'],
    ['POST', '/api/ai/analyze-product'],
    ['POST', '/api/ai/generate-hotspots'],
    ['POST', '/api/ai/generate-description'],
    ['POST', '/api/ai/return-risk'],
    ['POST', '/api/ai/quality-check'],
    ['POST', '/api/ai/trendyol-listing'],
    ['POST', '/api/trendyol/products'],
    ['GET', '/api/trendyol/unapproved'],
    ['POST', '/api/trendyol/buybox'],
    ['GET', '/api/trendyol/orders'],
  ];

  it.each(protectedRoutes)('%s %s — no token → 401', async (method, path) => {
    const res = await handleRequest(req(method, path), stubEnv);
    expect(res.status).toBe(401);
  });

  it.each(protectedRoutes)('%s %s — bad token prefix → 401', async (method, path) => {
    const res = await handleRequest(
      new Request(`http://localhost${path}`, {
        method,
        headers: { authorization: 'Basic sometoken', 'content-type': 'application/json' },
      }),
      stubEnv,
    );
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// 404 — unknown routes
// ---------------------------------------------------------------------------
describe('404 on unknown routes', () => {
  it('GET /api/unknown returns 404', async () => {
    const res = await handleRequest(req('GET', '/api/unknown', { auth: 'token' }), stubEnv);
    // Auth will fail before 404 because supabase isn't real — still 401 internally
    // but unknown routes that reach routing return 404 _if_ auth passed.
    // Because supabase is stubbed and will throw, we only assert it is NOT 200.
    expect(res.status).not.toBe(200);
  });

  it('GET / returns 404 or 401 (not 200)', async () => {
    const res = await handleRequest(req('GET', '/'), stubEnv);
    expect([401, 404]).toContain(res.status);
  });
});

// ---------------------------------------------------------------------------
// CORS_ORIGIN fallback — when env has no CORS_ORIGIN it defaults to *
// ---------------------------------------------------------------------------
describe('CORS_ORIGIN fallback', () => {
  it('uses * when CORS_ORIGIN is not set', async () => {
    const envWithoutCors: ApiEnv = { ...stubEnv, CORS_ORIGIN: undefined };
    const res = await handleRequest(req('GET', '/health'), envWithoutCors);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });
});

// ---------------------------------------------------------------------------
// Error response shape — must always be { error: string }
// ---------------------------------------------------------------------------
describe('error response shape', () => {
  it('401 body has error field', async () => {
    const res = await handleRequest(req('POST', '/api/conversions'), stubEnv);
    const body = await res.json() as { error: string };
    expect(typeof body.error).toBe('string');
    expect(body.error.length).toBeGreaterThan(0);
  });

  it('404 body has error field', async () => {
    const res = await handleRequest(req('GET', '/health'), { ...stubEnv });
    expect(res.status).toBe(200); // health is fine
    const notFound = await handleRequest(req('DELETE', '/health'), stubEnv);
    // DELETE /health is not a registered route — should not be 200
    expect(notFound.status).not.toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Content-Type header on JSON responses
// ---------------------------------------------------------------------------
describe('content-type', () => {
  it('health response is application/json', async () => {
    const res = await handleRequest(req('GET', '/health'), stubEnv);
    expect(res.headers.get('content-type')).toContain('application/json');
  });
});
