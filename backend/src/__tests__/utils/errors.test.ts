import { describe, it, expect } from 'vitest';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
} from '../../utils/errors.js';

describe('AppError', () => {
  it('creates an error with all properties', () => {
    const err = new AppError('Oops', 502, { field: ['msg'] }, false);
    expect(err.message).toBe('Oops');
    expect(err.statusCode).toBe(502);
    expect(err.isOperational).toBe(false);
    expect(err.details).toEqual({ field: ['msg'] });
  });

  it('defaults to 500 status and operational', () => {
    const err = new AppError('fail');
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
  });

  it('is an instance of both Error and AppError', () => {
    const err = new AppError('test');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('BadRequestError', () => {
  it('defaults to 400 status with default message', () => {
    const err = new BadRequestError();
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad request');
    expect(err).toBeInstanceOf(AppError);
  });

  it('accepts custom message and details', () => {
    const err = new BadRequestError('Invalid input', { email: ['required'] });
    expect(err.message).toBe('Invalid input');
    expect(err.details).toEqual({ email: ['required'] });
  });
});

describe('UnauthorizedError', () => {
  it('defaults to 401 status', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Unauthorized');
  });

  it('accepts custom message', () => {
    const err = new UnauthorizedError('Token expired');
    expect(err.message).toBe('Token expired');
  });
});

describe('ForbiddenError', () => {
  it('defaults to 403 status', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Forbidden');
  });
});

describe('NotFoundError', () => {
  it('defaults to 404 status', () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Resource not found');
  });
});

describe('ConflictError', () => {
  it('defaults to 409 status', () => {
    const err = new ConflictError();
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('Conflict');
  });
});

describe('TooManyRequestsError', () => {
  it('defaults to 429 status', () => {
    const err = new TooManyRequestsError();
    expect(err.statusCode).toBe(429);
    expect(err.message).toBe('Too many requests');
  });
});
