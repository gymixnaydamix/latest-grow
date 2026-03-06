import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

/** Express 5 params can be string | string[] — helper to coerce */
const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

interface GeocodeBoundingBox {
  south: number;
  north: number;
  west: number;
  east: number;
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
  boundingBox: GeocodeBoundingBox;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const GEOCODE_CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const geocodeCache = new Map<string, { expiresAt: number; data: GeocodeResult }>();
let geocodeLastRequestAt = 0;
let geocodeQueue: Promise<void> = Promise.resolve();

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const normalizeGeocodeQuery = (query: string) => query.trim().toLowerCase().replace(/\s+/g, ' ');

const fallbackBoundingBox = (latitude: number, longitude: number): GeocodeBoundingBox => {
  const delta = 0.01;
  return {
    south: latitude - delta,
    north: latitude + delta,
    west: longitude - delta,
    east: longitude + delta,
  };
};

const parseBoundingBox = (raw: string[] | undefined): GeocodeBoundingBox | null => {
  if (!raw || raw.length < 4) return null;
  const [south, north, west, east] = raw.map((value) => Number(value));
  if ([south, north, west, east].some((value) => Number.isNaN(value))) return null;
  return { south, north, west, east };
};

async function runWithNominatimThrottle<T>(task: () => Promise<T>): Promise<T> {
  const run = geocodeQueue.then(async () => {
    const now = Date.now();
    const waitMs = Math.max(0, 1000 - (now - geocodeLastRequestAt));
    if (waitMs > 0) await sleep(waitMs);
    geocodeLastRequestAt = Date.now();
    return task();
  });

  geocodeQueue = run.then(
    () => undefined,
    () => undefined,
  );

  return run;
}

// ---------------------------------------------------------------------------
// Tenant CRUD (Schools + Individuals)
// ---------------------------------------------------------------------------

export const tenantController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        type,
        status,
        search = '',
        page = '1',
        pageSize = '50',
      } = req.query as Record<string, string>;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 50));
      const skip = (pageNum - 1) * size;

      const where: Record<string, unknown> = {};
      if (type === 'SCHOOL' || type === 'INDIVIDUAL') where.type = type;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        prisma.tenant.findMany({
          where,
          include: {
            school: {
              select: {
                id: true,
                name: true,
                address: true,
                website: true,
                latitude: true,
                longitude: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: size,
        }),
        prisma.tenant.count({ where }),
      ]);

      res.json({
        success: true,
        data: items,
        meta: { page: pageNum, pageSize: size, total, totalPages: Math.ceil(total / size) },
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: param(req.params.id) },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              branding: true,
              address: true,
              website: true,
              latitude: true,
              longitude: true,
            },
          },
          invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
      });
      if (!tenant) throw new NotFoundError('Tenant not found');
      res.json({ success: true, data: tenant });
    } catch (error) {
      next(error);
    }
  },

  async geocode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query } = req.query as { query: string };
      const normalizedQuery = normalizeGeocodeQuery(query);
      const cached = geocodeCache.get(normalizedQuery);
      if (cached && cached.expiresAt > Date.now()) {
        res.json({ success: true, data: cached.data });
        return;
      }
      if (cached) geocodeCache.delete(normalizedQuery);

      const url = `${NOMINATIM_URL}?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`;

      const rows = await runWithNominatimThrottle(async () => {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'grow-your-need/1.0 (school-geocode-service)',
          },
        });

        if (!response.ok) {
          throw new BadRequestError(`Geocoding lookup failed (${response.status})`);
        }

        return response.json() as Promise<Array<{
          lat: string;
          lon: string;
          display_name: string;
          boundingbox?: string[];
        }>>;
      });

      const top = rows[0];
      if (!top) throw new NotFoundError('No location found for the provided address');

      const latitude = Number(top.lat);
      const longitude = Number(top.lon);
      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        throw new BadRequestError('Geocoding service returned invalid coordinates');
      }

      const result: GeocodeResult = {
        latitude,
        longitude,
        displayName: top.display_name ?? query,
        boundingBox: parseBoundingBox(top.boundingbox) ?? fallbackBoundingBox(latitude, longitude),
      };

      geocodeCache.set(normalizedQuery, {
        data: result,
        expiresAt: Date.now() + GEOCODE_CACHE_TTL_MS,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name,
        type,
        email,
        phone,
        plan,
        mrr,
        userCount,
        status,
        notes,
        address,
        website,
        latitude,
        longitude,
      } = req.body;
      if (!name || !type || !email) {
        throw new BadRequestError('name, type, and email are required');
      }

      const existing = await prisma.tenant.findUnique({ where: { email } });
      if (existing) throw new ConflictError('A tenant with this email already exists');

      let schoolId: string | undefined;
      if (type === 'SCHOOL') {
        const school = await prisma.school.create({
          data: {
            name,
            email,
            phone: phone || null,
            address: address?.trim() ? address.trim() : null,
            website: website?.trim() ? website.trim() : null,
            latitude: typeof latitude === 'number' ? latitude : null,
            longitude: typeof longitude === 'number' ? longitude : null,
          },
        });
        schoolId = school.id;
      }

      const tenant = await prisma.tenant.create({
        data: {
          name,
          type,
          email,
          phone: phone ?? '',
          plan: plan ?? 'Starter',
          mrr: mrr ?? 0,
          userCount: userCount ?? (type === 'INDIVIDUAL' ? 1 : 0),
          status: status ?? 'TRIAL',
          schoolId,
          notes: notes ?? '',
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              address: true,
              website: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      });

      logger.info('Tenant created', { tenantId: tenant.id, type });
      res.status(201).json({ success: true, data: tenant });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const existing = await prisma.tenant.findUnique({ where: { id } });
      if (!existing) throw new NotFoundError('Tenant not found');

      const { name, email, phone, plan, mrr, userCount, status, notes, address, website, latitude, longitude } = req.body;

      if (email && email !== existing.email) {
        const dup = await prisma.tenant.findUnique({ where: { email } });
        if (dup) throw new ConflictError('A tenant with this email already exists');
      }

      // Update associated school geo fields if provided
      if (existing.schoolId && (address !== undefined || website !== undefined || latitude !== undefined || longitude !== undefined)) {
        await prisma.school.update({
          where: { id: existing.schoolId },
          data: {
            ...(address !== undefined && { address }),
            ...(website !== undefined && { website: website || null }),
            ...(latitude !== undefined && { latitude }),
            ...(longitude !== undefined && { longitude }),
            ...(name !== undefined && { name }),
          },
        });
      }

      const tenant = await prisma.tenant.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(plan !== undefined && { plan }),
          ...(mrr !== undefined && { mrr }),
          ...(userCount !== undefined && { userCount }),
          ...(status !== undefined && { status }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              address: true,
              website: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      });

      res.json({ success: true, data: tenant });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const tenant = await prisma.tenant.findUnique({ where: { id } });
      if (!tenant) throw new NotFoundError('Tenant not found');

      await prisma.tenant.delete({ where: { id } });
      logger.info('Tenant deleted', { tenantId: id });
      res.json({ success: true, data: null, message: 'Tenant deleted' });
    } catch (error) {
      next(error);
    }
  },

  async suspend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const tenant = await prisma.tenant.findUnique({ where: { id } });
      if (!tenant) throw new NotFoundError('Tenant not found');

      const updated = await prisma.tenant.update({
        where: { id },
        data: { status: 'SUSPENDED' },
      });

      logger.info('Tenant suspended', { tenantId: id });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  async bulkImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenants } = req.body as {
        tenants: Array<{
          name: string;
          type: 'SCHOOL' | 'INDIVIDUAL';
          email: string;
          phone?: string;
          plan?: string;
          mrr?: number;
          userCount?: number;
          status?: string;
        }>;
      };

      if (!tenants || !Array.isArray(tenants) || tenants.length === 0) {
        throw new BadRequestError('tenants array is required and must not be empty');
      }

      // Check email duplicates
      const emails = tenants.map((t) => t.email);
      const existing = await prisma.tenant.findMany({
        where: { email: { in: emails } },
        select: { email: true },
      });
      const existingSet = new Set(existing.map((e) => e.email));

      const results: { created: number; skipped: number; errors: string[] } = {
        created: 0,
        skipped: 0,
        errors: [],
      };

      for (const t of tenants) {
        if (existingSet.has(t.email)) {
          results.skipped++;
          results.errors.push(`${t.email}: already exists`);
          continue;
        }

        try {
          let schoolId: string | undefined;
          if (t.type === 'SCHOOL') {
            const school = await prisma.school.create({
              data: { name: t.name, email: t.email, phone: t.phone || null },
            });
            schoolId = school.id;
          }

          await prisma.tenant.create({
            data: {
              name: t.name,
              type: t.type,
              email: t.email,
              phone: t.phone ?? '',
              plan: t.plan ?? 'Starter',
              mrr: t.mrr ?? 0,
              userCount: t.userCount ?? (t.type === 'INDIVIDUAL' ? 1 : 0),
              status: (t.status as 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CHURNED') ?? 'TRIAL',
              schoolId,
            },
          });
          results.created++;
          existingSet.add(t.email);
        } catch (err) {
          results.skipped++;
          results.errors.push(`${t.email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      logger.info('Bulk import completed', results);
      res.status(201).json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  },

  async exportCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.query as { type?: string };
      const where: Record<string, unknown> = {};
      if (type === 'SCHOOL' || type === 'INDIVIDUAL') where.type = type;

      const tenants = await prisma.tenant.findMany({ where, orderBy: { createdAt: 'desc' } });

      const header = 'id,name,type,email,phone,plan,mrr,userCount,status,createdAt\n';
      const rows = tenants
        .map(
          (t) =>
            `"${t.id}","${t.name}","${t.type}","${t.email}","${t.phone}","${t.plan}",${t.mrr},${t.userCount},"${t.status}","${t.createdAt.toISOString()}"`,
        )
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=tenants-${Date.now()}.csv`);
      res.send(header + rows);
    } catch (error) {
      next(error);
    }
  },

  async sendInvites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantIds, message } = req.body as { tenantIds: string[]; message?: string };
      if (!tenantIds || !Array.isArray(tenantIds) || tenantIds.length === 0) {
        throw new BadRequestError('tenantIds array is required');
      }

      const tenants = await prisma.tenant.findMany({
        where: { id: { in: tenantIds } },
        select: { id: true, name: true, email: true },
      });

      // In production this would send actual emails.
      // For now we log and return acknowledgment.
      const results = tenants.map((t) => ({
        tenantId: t.id,
        email: t.email,
        status: 'queued' as const,
      }));

      logger.info('Invites queued', { count: results.length, message: message?.slice(0, 100) });
      res.json({
        success: true,
        data: { sent: results.length, results },
        message: `${results.length} invitation(s) queued for delivery`,
      });
    } catch (error) {
      next(error);
    }
  },

  /** Aggregated KPI stats for the tenant dashboard */
  async stats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.query as { type?: string };
      const where: Record<string, unknown> = {};
      if (type === 'SCHOOL' || type === 'INDIVIDUAL') where.type = type;

      const [totalCount, activeCount, trialCount, churnedCount, mrrAgg] = await Promise.all([
        prisma.tenant.count({ where }),
        prisma.tenant.count({ where: { ...where, status: 'ACTIVE' } }),
        prisma.tenant.count({ where: { ...where, status: 'TRIAL' } }),
        prisma.tenant.count({ where: { ...where, status: 'CHURNED' } }),
        prisma.tenant.aggregate({ where, _sum: { mrr: true } }),
      ]);

      res.json({
        success: true,
        data: {
          total: totalCount,
          active: activeCount,
          trial: trialCount,
          churned: churnedCount,
          totalMrr: mrrAgg._sum.mrr ?? 0,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Platform Plans
// ---------------------------------------------------------------------------

export const platformPlanController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await prisma.platformPlan.findMany({ orderBy: { price: 'asc' } });
      res.json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, price, maxUsers, features, isActive } = req.body;
      if (!name || price === undefined) {
        throw new BadRequestError('name and price are required');
      }

      const existing = await prisma.platformPlan.findUnique({ where: { name } });
      if (existing) throw new ConflictError('A plan with this name already exists');

      const plan = await prisma.platformPlan.create({
        data: { name, price, maxUsers: maxUsers ?? -1, features: features ?? [], isActive: isActive ?? true },
      });

      res.status(201).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const plan = await prisma.platformPlan.update({
        where: { id },
        data: req.body,
      });
      res.json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.platformPlan.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Plan deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Platform Invoices
// ---------------------------------------------------------------------------

export const platformInvoiceController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        status,
        tenantId,
        search = '',
        page = '1',
        pageSize = '50',
      } = req.query as Record<string, string>;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 50));
      const skip = (pageNum - 1) * size;

      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (tenantId) where.tenantId = tenantId;
      if (search) {
        where.tenant = {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      const [items, total] = await Promise.all([
        prisma.platformInvoice.findMany({
          where,
          include: { tenant: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: size,
        }),
        prisma.platformInvoice.count({ where }),
      ]);

      res.json({
        success: true,
        data: items,
        meta: { page: pageNum, pageSize: size, total, totalPages: Math.ceil(total / size) },
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId, amount, dueDate, method, status } = req.body;
      if (!tenantId || !amount || !dueDate) {
        throw new BadRequestError('tenantId, amount, and dueDate are required');
      }

      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) throw new NotFoundError('Tenant not found');

      const invoice = await prisma.platformInvoice.create({
        data: {
          tenantId,
          amount,
          dueDate: new Date(dueDate),
          method: method ?? '',
          status: status ?? 'PENDING',
        },
        include: { tenant: { select: { id: true, name: true, email: true } } },
      });

      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  },

  async markPaid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const invoice = await prisma.platformInvoice.update({
        where: { id },
        data: { status: 'PAID', paidAt: new Date() },
        include: { tenant: { select: { id: true, name: true, email: true } } },
      });
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  },

  async stats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [totalAgg, paidAgg, pendingAgg, overdueAgg, totalCount] = await Promise.all([
        prisma.platformInvoice.aggregate({ _sum: { amount: true } }),
        prisma.platformInvoice.aggregate({ where: { status: 'PAID' }, _sum: { amount: true }, _count: true }),
        prisma.platformInvoice.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true }, _count: true }),
        prisma.platformInvoice.aggregate({ where: { status: 'OVERDUE' }, _sum: { amount: true }, _count: true }),
        prisma.platformInvoice.count(),
      ]);

      res.json({
        success: true,
        data: {
          totalBilled: totalAgg._sum.amount ?? 0,
          totalCount,
          paid: { amount: paidAgg._sum.amount ?? 0, count: paidAgg._count ?? 0 },
          pending: { amount: pendingAgg._sum.amount ?? 0, count: pendingAgg._count ?? 0 },
          overdue: { amount: overdueAgg._sum.amount ?? 0, count: overdueAgg._count ?? 0 },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      await prisma.platformInvoice.delete({ where: { id } });
      res.json({ success: true, data: null, message: 'Platform invoice deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Payment Gateways
// ---------------------------------------------------------------------------

export const paymentGatewayController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gateways = await prisma.paymentGateway.findMany({ orderBy: { name: 'asc' } });
      res.json({ success: true, data: gateways });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, apiKey, webhookUrl, color } = req.body;
      if (!name) throw new BadRequestError('name is required');

      const existing = await prisma.paymentGateway.findUnique({ where: { name } });
      if (existing) throw new ConflictError('A gateway with this name already exists');

      const gateway = await prisma.paymentGateway.create({
        data: { name, apiKey: apiKey ?? '', webhookUrl: webhookUrl ?? '', color: color ?? '#6366f1' },
      });

      res.status(201).json({ success: true, data: gateway });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const gateway = await prisma.paymentGateway.update({
        where: { id },
        data: req.body,
      });
      res.json({ success: true, data: gateway });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.paymentGateway.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Gateway deleted' });
    } catch (error) {
      next(error);
    }
  },
};
