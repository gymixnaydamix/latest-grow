import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { NotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

/** Express 5 params can be string | string[] — helper to coerce */
const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

// ---------------------------------------------------------------------------
// CRM Deal CRUD
// ---------------------------------------------------------------------------

export const crmDealController = {
  /** GET /crm/deals */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { stage, search, page, pageSize } = req.query as {
        stage?: string; search?: string; page?: string; pageSize?: string;
      };
      const take = Math.min(Number(pageSize) || 50, 100);
      const skip = ((Number(page) || 1) - 1) * take;

      const where: Record<string, unknown> = {};
      if (stage) where.stage = stage;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { contactName: { contains: search, mode: 'insensitive' } },
          { contactEmail: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [deals, total] = await Promise.all([
        prisma.crmDeal.findMany({
          where,
          include: { tenant: { select: { id: true, name: true, type: true } } },
          orderBy: { createdAt: 'desc' },
          take,
          skip,
        }),
        prisma.crmDeal.count({ where }),
      ]);

      res.json({
        success: true,
        data: deals,
        meta: { page: Number(page) || 1, pageSize: take, total },
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /crm/deals/:id */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const deal = await prisma.crmDeal.findUnique({
        where: { id },
        include: { tenant: { select: { id: true, name: true, type: true, email: true } } },
      });
      if (!deal) throw new NotFoundError('Deal not found');
      res.json({ success: true, data: deal });
    } catch (error) {
      next(error);
    }
  },

  /** POST /crm/deals */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, value, stage, probability, tenantId, contactName, contactEmail, notes, expectedCloseDate } = req.body;

      const deal = await prisma.crmDeal.create({
        data: {
          name,
          value: value ?? 0,
          stage: stage ?? 'PROSPECT',
          probability: probability ?? 10,
          tenantId: tenantId || null,
          contactName: contactName ?? '',
          contactEmail: contactEmail ?? '',
          notes: notes ?? '',
          expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        },
        include: { tenant: { select: { id: true, name: true, type: true } } },
      });

      logger.info('CRM deal created', { dealId: deal.id, name });
      res.status(201).json({ success: true, data: deal, message: 'Deal created' });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /crm/deals/:id */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const existing = await prisma.crmDeal.findUnique({ where: { id } });
      if (!existing) throw new NotFoundError('Deal not found');

      const data: Record<string, unknown> = { ...req.body };
      if (data.expectedCloseDate) data.expectedCloseDate = new Date(data.expectedCloseDate as string);

      // If stage changed to CLOSED_WON/CLOSED_LOST, set closedAt
      if (data.stage === 'CLOSED_WON' || data.stage === 'CLOSED_LOST') {
        if (!existing.closedAt) data.closedAt = new Date();
      }

      const deal = await prisma.crmDeal.update({
        where: { id },
        data,
        include: { tenant: { select: { id: true, name: true, type: true } } },
      });

      res.json({ success: true, data: deal, message: 'Deal updated' });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /crm/deals/:id */
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      await prisma.crmDeal.delete({ where: { id } });
      res.json({ success: true, message: 'Deal deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** GET /crm/deals/stats */
  async stats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [totalDeals, pipelineValue, wonDeals, lostDeals, avgDealSize] = await Promise.all([
        prisma.crmDeal.count(),
        prisma.crmDeal.aggregate({
          where: { stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] } },
          _sum: { value: true },
        }),
        prisma.crmDeal.count({ where: { stage: 'CLOSED_WON' } }),
        prisma.crmDeal.count({ where: { stage: 'CLOSED_LOST' } }),
        prisma.crmDeal.aggregate({ _avg: { value: true } }),
      ]);

      const winRate = (wonDeals + lostDeals) > 0
        ? Math.round((wonDeals / (wonDeals + lostDeals)) * 100)
        : 0;

      res.json({
        success: true,
        data: {
          totalDeals,
          pipelineValue: pipelineValue._sum.value ?? 0,
          wonDeals,
          lostDeals,
          winRate,
          avgDealSize: Math.round(avgDealSize._avg.value ?? 0),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /crm/deals/by-stage */
  async byStage(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stages = ['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'] as const;
      const results = await Promise.all(
        stages.map(async (stage) => {
          const deals = await prisma.crmDeal.findMany({
            where: { stage },
            include: { tenant: { select: { id: true, name: true, type: true } } },
            orderBy: { value: 'desc' },
          });
          const totalValue = deals.reduce((sum: number, d: { value: number }) => sum + d.value, 0);
          return { stage, deals, count: deals.length, totalValue };
        }),
      );
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// CRM Account CRUD
// ---------------------------------------------------------------------------

export const crmAccountController = {
  /** GET /crm/accounts */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { minHealth, search, page, pageSize } = req.query as {
        minHealth?: string; search?: string; page?: string; pageSize?: string;
      };
      const take = Math.min(Number(pageSize) || 50, 100);
      const skip = ((Number(page) || 1) - 1) * take;

      const where: Record<string, unknown> = {};
      if (minHealth) where.healthScore = { gte: Number(minHealth) };
      if (search) {
        where.tenant = {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      const [accounts, total] = await Promise.all([
        prisma.crmAccount.findMany({
          where,
          include: {
            tenant: {
              select: { id: true, name: true, type: true, email: true, mrr: true, userCount: true, status: true },
            },
          },
          orderBy: { healthScore: 'desc' },
          take,
          skip,
        }),
        prisma.crmAccount.count({ where }),
      ]);

      res.json({
        success: true,
        data: accounts,
        meta: { page: Number(page) || 1, pageSize: take, total },
      });
    } catch (error) {
      next(error);
    }
  },

  /** POST /crm/accounts — upsert */
  async upsert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId, healthScore, notes, tags } = req.body;

      // Verify tenant exists
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) throw new NotFoundError('Tenant not found');

      const account = await prisma.crmAccount.upsert({
        where: { tenantId },
        create: { tenantId, healthScore: healthScore ?? 100, notes: notes ?? '', tags: tags ?? [] },
        update: { healthScore, notes, tags, lastTouchAt: new Date() },
        include: {
          tenant: { select: { id: true, name: true, type: true, email: true, mrr: true } },
        },
      });

      res.json({ success: true, data: account, message: 'Account saved' });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /crm/accounts/:id */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const existing = await prisma.crmAccount.findUnique({ where: { id } });
      if (!existing) throw new NotFoundError('Account not found');

      const account = await prisma.crmAccount.update({
        where: { id },
        data: { ...req.body, lastTouchAt: new Date() },
        include: {
          tenant: { select: { id: true, name: true, type: true, email: true, mrr: true } },
        },
      });

      res.json({ success: true, data: account, message: 'Account updated' });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /crm/accounts/:id */
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      await prisma.crmAccount.delete({ where: { id } });
      res.json({ success: true, message: 'Account deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** POST /crm/accounts/:id/touch */
  async touch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const account = await prisma.crmAccount.update({
        where: { id },
        data: { lastTouchAt: new Date() },
        include: {
          tenant: { select: { id: true, name: true } },
        },
      });
      res.json({ success: true, data: account, message: 'Last touch updated' });
    } catch (error) {
      next(error);
    }
  },
};
