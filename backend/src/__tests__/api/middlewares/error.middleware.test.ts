import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';
import { AppError, BadRequestError } from '../../../utils/errors.js';

// Mock logger and config
vi.mock('../../../utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../config/index.js', () => ({
  isProduction: vi.fn(() => false),
  config: { nodeEnv: 'development' },
}));

import { errorHandler } from '../../../api/middlewares/error.middleware.js';
import { isProduction } from '../../../config/index.js';
import { logger } from '../../../utils/logger.js';

describe('errorHandler middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isProduction).mockReturnValue(false);
  });

  it('returns structured JSON for AppError', () => {
    const err = new BadRequestError('Bad input', { field: ['required'] });
    const req = mockReq({ path: '/test', method: 'POST' });
    const res = mockRes();
    const next = mockNext();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Bad input',
      details: { field: ['required'] },
    });
  });

  it('returns 500 for unknown errors', () => {
    const err = new Error('something broke');
    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: 'something broke' }),
    );
  });

  it('hides error message in production for unknown errors', () => {
    vi.mocked(isProduction).mockReturnValue(true);
    const err = new Error('secret details');
    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext());

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal server error',
    });
  });

  it('still shows message in production for operational AppError', () => {
    vi.mocked(isProduction).mockReturnValue(true);
    const err = new AppError('Custom operational', 422);
    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext());

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Custom operational' }),
    );
  });

  it('logs operational errors at info level', () => {
    const err = new AppError('Op error', 400);
    errorHandler(err, mockReq(), mockRes(), mockNext());
    expect(logger.info).toHaveBeenCalled();
  });

  it('logs unexpected errors at error level', () => {
    const err = new Error('crash');
    errorHandler(err, mockReq(), mockRes(), mockNext());
    expect(logger.error).toHaveBeenCalled();
  });
});
