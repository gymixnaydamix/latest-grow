import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the config module before importing logger
vi.mock('../../config/index.js', () => ({
  isProduction: vi.fn(() => false),
}));

import { logger } from '../../utils/logger.js';
import { isProduction } from '../../config/index.js';

describe('logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.mocked(isProduction).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('info logs JSON with level "info"', () => {
    logger.info('hello');
    expect(logSpy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('hello');
    expect(entry.timestamp).toBeDefined();
  });

  it('warn logs JSON with level "warn"', () => {
    logger.warn('caution');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(warnSpy.mock.calls[0][0] as string);
    expect(entry.level).toBe('warn');
    expect(entry.message).toBe('caution');
  });

  it('error logs JSON with level "error"', () => {
    logger.error('fail');
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(entry.level).toBe('error');
    expect(entry.message).toBe('fail');
  });

  it('debug logs in development', () => {
    vi.mocked(isProduction).mockReturnValue(false);
    logger.debug('dev info');
    expect(debugSpy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(debugSpy.mock.calls[0][0] as string);
    expect(entry.level).toBe('debug');
  });

  it('debug is suppressed in production', () => {
    vi.mocked(isProduction).mockReturnValue(true);
    logger.debug('secret');
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('includes ISO timestamp', () => {
    logger.info('timestamped');
    const entry = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);
  });

  it('includes optional data field', () => {
    logger.info('with data', { userId: '123' });
    const entry = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(entry.data).toEqual({ userId: '123' });
  });
});
