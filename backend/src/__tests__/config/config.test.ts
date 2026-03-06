import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to test the config module in isolation with controlled env vars.
// The config module runs at import time, so we use dynamic imports with vi.resetModules().

describe('config module', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('uses fallback defaults in development', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.PORT;
    delete process.env.JWT_SECRET;

    const { config } = await import('../../config/index.js');

    expect(config.nodeEnv).toBe('development');
    expect(config.port).toBe(4000);
    expect(config.jwtExpiresIn).toBe('7d');
    expect(config.aiProvider).toBe('mock');
  });

  it('reads PORT from env', async () => {
    process.env.PORT = '5000';
    const { config } = await import('../../config/index.js');
    expect(config.port).toBe(5000);
  });

  it('splits CORS_ORIGINS by comma', async () => {
    process.env.CORS_ORIGINS = 'http://a.com, http://b.com';
    const { config } = await import('../../config/index.js');
    expect(config.corsOrigins).toEqual(['http://a.com', 'http://b.com']);
  });

  it('isProduction returns true when NODE_ENV=production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'real-secret';
    process.env.DATABASE_URL = 'postgres://x';
    process.env.API_KEY = 'key';
    const { isProduction } = await import('../../config/index.js');
    expect(isProduction()).toBe(true);
  });

  it('isDevelopment returns true by default', async () => {
    process.env.NODE_ENV = 'development';
    const { isDevelopment } = await import('../../config/index.js');
    expect(isDevelopment()).toBe(true);
  });
});
