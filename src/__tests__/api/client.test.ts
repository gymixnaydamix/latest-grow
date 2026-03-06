import { api, ApiError } from '../../api/client';

// ---- helpers ----
const mockFetch = (status: number, body: unknown) =>
  jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  });

beforeEach(() => {
  // Reset CSRF cache between tests
  (api as any).csrfToken = null;
  (api as any).onUnauthorized = null;
  jest.restoreAllMocks();
});

describe('ApiClient', () => {
  describe('GET requests', () => {
    it('sends a GET to /api + path', async () => {
      const fn = mockFetch(200, { data: [] });
      globalThis.fetch = fn;

      const result = await api.get('/users');

      expect(fn).toHaveBeenCalledTimes(1);
      const [url, opts] = fn.mock.calls[0];
      expect(url).toBe('/api/users');
      expect(opts.method).toBe('GET');
      expect(result).toEqual({ data: [] });
    });

    it('does NOT attach CSRF token on GET', async () => {
      globalThis.fetch = mockFetch(200, {});
      await api.get('/test');
      const headers = (globalThis.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(headers['x-csrf-token']).toBeUndefined();
    });
  });

  describe('CSRF flow', () => {
    it('fetches CSRF token before mutating request', async () => {
      const fn = jest.fn()
        // first call = csrf fetch
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: { token: 'csrf123' } }) })
        // second call = actual POST
        .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 1 }) });
      globalThis.fetch = fn;

      await api.post('/items', { name: 'test' });

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn.mock.calls[0][0]).toBe('/api/auth/csrf-token');
      const headers = fn.mock.calls[1][1].headers;
      expect(headers['x-csrf-token']).toBe('csrf123');
    });

    it('reuses cached CSRF token', async () => {
      (api as any).csrfToken = 'cached';
      globalThis.fetch = mockFetch(200, {});

      await api.post('/items', { x: 1 });

      // Only one call (the POST), no csrf fetch
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('clearCsrf resets the cached token', async () => {
      (api as any).csrfToken = 'old';
      api.clearCsrf();
      expect((api as any).csrfToken).toBeNull();
    });
  });

  describe('error handling', () => {
    it('throws ApiError on non-ok response', async () => {
      globalThis.fetch = mockFetch(400, { error: { message: 'Bad input' } });

      await expect(api.get('/fail')).rejects.toThrow(ApiError);
      try {
        await api.get('/fail');
      } catch (e) {
        expect((e as ApiError).status).toBe(400);
        expect((e as ApiError).message).toBe('Bad input');
      }
    });

    it('falls back to HTTP status when no message in body', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('parse fail')),
      });

      await expect(api.get('/crash')).rejects.toThrow('HTTP 500');
    });
  });

  describe('401 handler', () => {
    it('calls onUnauthorized for 401 on non-auth paths', async () => {
      const handler = jest.fn();
      api.setUnauthorizedHandler(handler);
      globalThis.fetch = mockFetch(401, {});

      await expect(api.get('/protected')).rejects.toThrow();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('does NOT call onUnauthorized for /auth/ paths', async () => {
      const handler = jest.fn();
      api.setUnauthorizedHandler(handler);
      globalThis.fetch = mockFetch(401, {});

      await expect(api.get('/auth/login')).rejects.toThrow();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      (api as any).csrfToken = 'tok';
    });

    it.each([
      ['post', 'POST'],
      ['patch', 'PATCH'],
      ['put', 'PUT'],
    ] as const)('%s sends %s method', async (method, httpVerb) => {
      globalThis.fetch = mockFetch(200, {});
      await (api as any)[method]('/test', { x: 1 });
      const opts = (globalThis.fetch as jest.Mock).mock.calls[0][1];
      expect(opts.method).toBe(httpVerb);
      expect(opts.body).toBe(JSON.stringify({ x: 1 }));
    });

    it('del sends DELETE method', async () => {
      globalThis.fetch = mockFetch(200, {});
      await api.del('/test');
      const opts = (globalThis.fetch as jest.Mock).mock.calls[0][1];
      expect(opts.method).toBe('DELETE');
    });
  });
});
