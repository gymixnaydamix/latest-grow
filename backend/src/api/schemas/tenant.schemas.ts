import { z } from 'zod';

// ---------------------------------------------------------------------------
// Common
// ---------------------------------------------------------------------------

export const idParamSchema = z.object({
  id: z.string().cuid(),
});

// ---------------------------------------------------------------------------
// Tenant schemas
// ---------------------------------------------------------------------------

export const tenantListQuerySchema = z.object({
  type: z.enum(['SCHOOL', 'INDIVIDUAL']).optional(),
  status: z.enum(['ACTIVE', 'TRIAL', 'SUSPENDED', 'CHURNED']).optional(),
  search: z.string().optional().default(''),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const createTenantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: z.enum(['SCHOOL', 'INDIVIDUAL']),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().default(''),
  plan: z.string().optional().default('Starter'),
  mrr: z.number().min(0).optional().default(0),
  userCount: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'TRIAL', 'SUSPENDED', 'CHURNED']).optional().default('TRIAL'),
  notes: z.string().optional().default(''),
  address: z.string().max(300).optional(),
  website: z.string().url().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
}).superRefine((data, ctx) => {
  if (data.type !== 'SCHOOL') return;

  if (!data.address?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['address'],
      message: 'Address is required for schools',
    });
  }

  if (data.latitude === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['latitude'],
      message: 'Latitude is required for schools',
    });
  }

  if (data.longitude === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['longitude'],
      message: 'Longitude is required for schools',
    });
  }
});

export const tenantGeocodeQuerySchema = z.object({
  query: z.string().trim().min(3, 'Address query is too short').max(300, 'Address query is too long'),
});

export const updateTenantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  plan: z.string().optional(),
  mrr: z.number().min(0).optional(),
  userCount: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'TRIAL', 'SUSPENDED', 'CHURNED']).optional(),
  notes: z.string().optional(),
  address: z.string().max(300).optional(),
  website: z.string().url().optional().or(z.literal('')),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const bulkImportTenantsSchema = z.object({
  tenants: z.array(
    z.object({
      name: z.string().min(1).max(200),
      type: z.enum(['SCHOOL', 'INDIVIDUAL']),
      email: z.string().email(),
      phone: z.string().optional().default(''),
      plan: z.string().optional().default('Starter'),
      mrr: z.number().min(0).optional().default(0),
      userCount: z.number().int().min(0).optional(),
      status: z.enum(['ACTIVE', 'TRIAL', 'SUSPENDED', 'CHURNED']).optional(),
    }),
  ).min(1, 'At least one tenant is required'),
});

export const sendInvitesSchema = z.object({
  tenantIds: z.array(z.string().min(1)).min(1, 'At least one tenant ID is required'),
  message: z.string().optional().default(''),
});

// ---------------------------------------------------------------------------
// Platform Plan schemas
// ---------------------------------------------------------------------------

export const createPlatformPlanSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().min(0),
  maxUsers: z.number().int().optional().default(-1),
  features: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export const updatePlatformPlanSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  price: z.number().min(0).optional(),
  maxUsers: z.number().int().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Platform Invoice schemas
// ---------------------------------------------------------------------------

export const createPlatformInvoiceSchema = z.object({
  tenantId: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  method: z.string().optional().default(''),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional().default('PENDING'),
});

// ---------------------------------------------------------------------------
// Payment Gateway schemas
// ---------------------------------------------------------------------------

export const createPaymentGatewaySchema = z.object({
  name: z.string().min(1).max(200),
  apiKey: z.string().optional().default(''),
  webhookUrl: z.string().optional().default(''),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default('#6366f1'),
});

export const updatePaymentGatewaySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(['active', 'inactive', 'error']).optional(),
  apiKey: z.string().optional(),
  webhookUrl: z.string().optional(),
  transactions: z.number().int().min(0).optional(),
  volume: z.number().min(0).optional(),
  pct: z.number().min(0).max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});
