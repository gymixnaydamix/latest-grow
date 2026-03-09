import { z } from 'zod';

export const gamificationPageParamsSchema = z.object({
  pageId: z.string().min(1),
});

export const gamificationPageQuerySchema = z.object({
  search: z.string().optional(),
  range: z.enum(['7d', '30d', '90d']).optional(),
  segment: z.string().optional(),
});

export const gamificationDraftSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(8),
  segment: z.string().min(1),
  status: z.string().min(1),
  scheduleStart: z.string().min(1),
  scheduleEnd: z.string().min(1),
  owner: z.string().min(2),
  notes: z.string().min(3),
  automationEnabled: z.boolean(),
});

export const gamificationRollbackSchema = z.object({
  versionId: z.string().min(1),
});

export const gamificationActionSchema = z.object({
  cardId: z.string().min(1),
  action: z.string().min(1),
});
