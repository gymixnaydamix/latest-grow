import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  paginationSchema,
  createSchoolSchema,
  updateBrandingSchema,
  createAnnouncementSchema,
} from '../../../api/schemas/validation.schemas.js';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: '123456' });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '12345' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = { email: 'a@b.com', password: '12345678', firstName: 'A', lastName: 'B', role: 'TEACHER' as const };

  it('accepts valid data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('requires at least 8 chars password', () => {
    expect(registerSchema.safeParse({ ...valid, password: '1234567' }).success).toBe(false);
  });

  it('rejects unknown role', () => {
    expect(registerSchema.safeParse({ ...valid, role: 'SUPERADMIN' }).success).toBe(false);
  });
});

describe('paginationSchema', () => {
  it('provides defaults when empty', () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.sortBy).toBe('createdAt');
    expect(result.sortOrder).toBe('desc');
  });

  it('coerces string numbers', () => {
    const result = paginationSchema.parse({ page: '3', pageSize: '10' });
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(10);
  });

  it('rejects pageSize > 100', () => {
    expect(paginationSchema.safeParse({ pageSize: 101 }).success).toBe(false);
  });
});

describe('createSchoolSchema', () => {
  it('accepts minimal school data', () => {
    expect(createSchoolSchema.safeParse({ name: 'Test School' }).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(createSchoolSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = createSchoolSchema.safeParse({
      name: 'X',
      address: '123 Main St',
      website: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateBrandingSchema', () => {
  it('accepts valid hex colors', () => {
    const result = updateBrandingSchema.safeParse({
      primaryColor: '#ff0000',
      secondaryColor: '#00ff00',
      accentColor: '#0000ff',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid hex', () => {
    const result = updateBrandingSchema.safeParse({
      primaryColor: 'red',
      secondaryColor: '#00ff00',
      accentColor: '#0000ff',
    });
    expect(result.success).toBe(false);
  });
});

describe('createAnnouncementSchema', () => {
  it('accepts valid announcement', () => {
    const result = createAnnouncementSchema.safeParse({
      title: 'Hello',
      body: 'World',
      audience: ['TEACHER', 'STUDENT'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty audience', () => {
    const result = createAnnouncementSchema.safeParse({
      title: 'Hello',
      body: 'World',
      audience: [],
    });
    expect(result.success).toBe(false);
  });
});
