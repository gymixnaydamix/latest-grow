import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

vi.mock('../../../utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { validate } from '../../../api/middlewares/validation.middleware.js';

describe('validate middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('replaces req.body with parsed data on valid body', () => {
    const schema = z.object({ name: z.string(), age: z.coerce.number() });
    const middleware = validate({ body: schema });
    const req = mockReq({ body: { name: 'Alice', age: '25' } });
    const next = mockNext();

    middleware(req, mockRes(), next);

    expect(req.body).toEqual({ name: 'Alice', age: 25 });
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with BadRequestError on invalid body', () => {
    const schema = z.object({ name: z.string().min(1) });
    const middleware = validate({ body: schema });
    const req = mockReq({ body: { name: '' } });
    const next = mockNext();

    middleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as Error;
    expect(error.message).toBe('Validation failed');
  });

  it('validates query params', () => {
    const schema = z.object({ page: z.coerce.number().default(1) });
    const middleware = validate({ query: schema });
    const req = mockReq({ query: { page: '3' } });
    const next = mockNext();

    middleware(req, mockRes(), next);

    expect((req as unknown as { query: { page: number } }).query.page).toBe(3);
    expect(next).toHaveBeenCalledWith();
  });

  it('validates URL params', () => {
    const schema = z.object({ id: z.string().min(1) });
    const middleware = validate({ params: schema });
    const req = mockReq({ params: { id: 'abc123' } as Record<string, string> });
    const next = mockNext();

    middleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('reports errors from params validation', () => {
    const schema = z.object({ id: z.string().min(1) });
    const middleware = validate({ params: schema });
    const req = mockReq({ params: { id: '' } as Record<string, string> });
    const next = mockNext();

    middleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((next.mock.calls[0][0] as Error).message).toBe('Validation failed');
  });

  it('combines errors from multiple targets', () => {
    const bodySchema = z.object({ name: z.string().min(1) });
    const querySchema = z.object({ page: z.coerce.number().positive() });
    const middleware = validate({ body: bodySchema, query: querySchema });
    const req = mockReq({ body: { name: '' }, query: { page: '-1' } });
    const next = mockNext();

    middleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { details: Record<string, string[]> };
    expect(err.details).toHaveProperty('body');
    expect(err.details).toHaveProperty('query');
  });

  it('passes through when no schemas provided', () => {
    const middleware = validate({});
    const next = mockNext();

    middleware(mockReq(), mockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });
});
