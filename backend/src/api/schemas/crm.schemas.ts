import { z } from 'zod';

// ---------------------------------------------------------------------------
// CRM Deal schemas
// ---------------------------------------------------------------------------

export const dealListQuerySchema = z.object({
  stage: z.enum(['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  search: z.string().optional().default(''),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const createDealSchema = z.object({
  name: z.string().min(1, 'Deal name is required').max(200),
  value: z.number().min(0).optional().default(0),
  stage: z.enum(['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional().default('PROSPECT'),
  probability: z.number().int().min(0).max(100).optional().default(10),
  tenantId: z.string().optional(),
  contactName: z.string().optional().default(''),
  contactEmail: z.string().email().optional().or(z.literal('')).default(''),
  notes: z.string().optional().default(''),
  expectedCloseDate: z.string().datetime().optional(),
});

export const updateDealSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  value: z.number().min(0).optional(),
  stage: z.enum(['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  tenantId: z.string().nullable().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  notes: z.string().optional(),
  expectedCloseDate: z.string().datetime().nullable().optional(),
});

// ---------------------------------------------------------------------------
// CRM Account schemas
// ---------------------------------------------------------------------------

export const accountListQuerySchema = z.object({
  minHealth: z.coerce.number().int().min(0).max(100).optional(),
  search: z.string().optional().default(''),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const upsertAccountSchema = z.object({
  tenantId: z.string().min(1, 'Tenant ID is required'),
  healthScore: z.number().int().min(0).max(100).optional().default(100),
  notes: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
});

export const updateAccountSchema = z.object({
  healthScore: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});
