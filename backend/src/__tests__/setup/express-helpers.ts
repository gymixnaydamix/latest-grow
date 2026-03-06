/* Express mock helpers for middleware/controller tests */
import type { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest';

/**
 * Create a mock Express Request object.
 * Override any property by passing partial overrides.
 */
export function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    method: 'GET',
    path: '/',
    headers: {},
    cookies: {},
    body: {},
    query: {},
    params: {},
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

/**
 * Create a mock Express Response object with spy methods.
 */
export function mockRes(): Response & {
  _status: number;
  _json: unknown;
  _cookies: Record<string, { value: string; options: unknown }>;
} {
  const res: Record<string, unknown> = {
    _status: 200,
    _json: null,
    _cookies: {} as Record<string, { value: string; options: unknown }>,
  };

  res.status = vi.fn((code: number) => {
    res._status = code;
    return res;
  });

  res.json = vi.fn((data: unknown) => {
    res._json = data;
    return res;
  });

  res.cookie = vi.fn((name: string, value: string, options: unknown) => {
    (res._cookies as Record<string, { value: string; options: unknown }>)[name] = { value, options };
    return res;
  });

  res.send = vi.fn(() => res);
  res.end = vi.fn(() => res);
  res.setHeader = vi.fn(() => res);

  return res as unknown as Response & {
    _status: number;
    _json: unknown;
    _cookies: Record<string, { value: string; options: unknown }>;
  };
}

/**
 * Create a mock NextFunction spy.
 */
export function mockNext(): NextFunction & { mock: { calls: unknown[][] } } {
  return vi.fn() as unknown as NextFunction & { mock: { calls: unknown[][] } };
}
