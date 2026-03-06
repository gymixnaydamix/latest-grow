import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('validateEnv', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    // Restore clean env
    for (const key of Object.keys(process.env)) delete process.env[key];
    Object.assign(process.env, ORIGINAL_ENV);
    vi.restoreAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    for (const key of Object.keys(process.env)) delete process.env[key];
    Object.assign(process.env, ORIGINAL_ENV);
  });

  it('passes in development without required vars', async () => {
    vi.doMock('../../config/index.js', () => ({
      config: { nodeEnv: 'development', jwtSecret: 'dev-secret' },
    }));
    const { validateEnv } = await import('../../config/validate-env.js');
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws in production when required env vars missing', async () => {
    delete process.env.JWT_SECRET;
    delete process.env.DATABASE_URL;
    vi.doMock('../../config/index.js', () => ({
      config: { nodeEnv: 'production', jwtSecret: 'real-secret' },
    }));
    const { validateEnv } = await import('../../config/validate-env.js');
    expect(() => validateEnv()).toThrow('Missing required env vars in production');
  });

  it('throws when JWT_SECRET is still dev default in production', async () => {
    process.env.JWT_SECRET = 'dev-jwt-secret-change-in-production';
    process.env.DATABASE_URL = 'postgres://x';
    vi.doMock('../../config/index.js', () => ({
      config: { nodeEnv: 'production', jwtSecret: 'dev-jwt-secret-change-in-production' },
    }));
    const { validateEnv } = await import('../../config/validate-env.js');
    expect(() => validateEnv()).toThrow('still using dev default');
  });

  it('warns about optional vars', async () => {
    delete process.env.REDIS_URL;
    delete process.env.CORS_ORIGINS;
    delete process.env.AI_API_KEY;
    vi.doMock('../../config/index.js', () => ({
      config: { nodeEnv: 'development', jwtSecret: 'x' },
    }));
    const { validateEnv } = await import('../../config/validate-env.js');
    validateEnv();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Optional env vars'));
  });
});
