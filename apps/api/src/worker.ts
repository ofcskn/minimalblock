import { handleRequest, type ApiEnv } from './lib/server.js';

export default {
  async fetch(request: Request, env: ApiEnv): Promise<Response> {
    return handleRequest(request, env);
  },
};
