import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors.js';
import { randomBytes, createHash } from 'crypto';

/** Express 5 params can be string | string[] — helper to coerce */
const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

// ---------------------------------------------------------------------------
// Platform Config (General / Branding / Notification key-value)
// ---------------------------------------------------------------------------

export const platformConfigController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { group } = req.query as { group?: string };
      const configs = await prisma.platformConfig.findMany({
        where: group ? { group } : undefined,
        orderBy: { key: 'asc' },
      });
      res.json({ success: true, data: configs });
    } catch (error) {
      next(error);
    }
  },

  async upsert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key, value, type, label, group } = req.body;
      const config = await prisma.platformConfig.upsert({
        where: { key },
        update: { value, type, label, group },
        create: { key, value, type, label, group },
      });
      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  },

  async bulkUpsert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { configs } = req.body as { configs: Array<{ key: string; value: string; type?: string; label?: string; group?: string }> };
      if (!configs?.length) throw new BadRequestError('configs array is required');

      const results = await prisma.$transaction(
        configs.map((c) =>
          prisma.platformConfig.upsert({
            where: { key: c.key },
            update: { value: c.value, type: c.type, label: c.label, group: c.group },
            create: { key: c.key, value: c.value, type: c.type ?? 'string', label: c.label ?? '', group: c.group ?? 'general' },
          }),
        ),
      );
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.platformConfig.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Config deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Feature Flags
// ---------------------------------------------------------------------------

export const featureFlagController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { archived } = req.query as { archived?: string };
      const isArchived = archived === 'true';
      const flags = await prisma.featureFlag.findMany({
        where: { archived: isArchived },
        orderBy: { updatedAt: 'desc' },
      });
      res.json({ success: true, data: flags });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await prisma.featureFlag.findUnique({ where: { key: req.body.key } });
      if (existing) throw new ConflictError(`Flag key "${req.body.key}" already exists`);

      const flag = await prisma.featureFlag.create({ data: req.body });
      res.status(201).json({ success: true, data: flag });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const data = { ...req.body };
      if (data.archived === true) data.archivedAt = new Date();
      if (data.archived === false) data.archivedAt = null;

      const flag = await prisma.featureFlag.update({ where: { id }, data });
      res.json({ success: true, data: flag });
    } catch (error) {
      next(error);
    }
  },

  async toggle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const current = await prisma.featureFlag.findUnique({ where: { id } });
      if (!current) throw new NotFoundError('Feature flag not found');

      const flag = await prisma.featureFlag.update({
        where: { id },
        data: { enabled: !current.enabled },
      });
      res.json({ success: true, data: flag });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.featureFlag.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Flag deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// A/B Tests
// ---------------------------------------------------------------------------

export const abTestController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query as { status?: string };
      const tests = await prisma.aBTest.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: tests });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await prisma.aBTest.findUnique({ where: { key: req.body.key } });
      if (existing) throw new ConflictError(`Test key "${req.body.key}" already exists`);

      const test = await prisma.aBTest.create({
        data: {
          ...req.body,
          endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        },
      });
      res.status(201).json({ success: true, data: test });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const test = await prisma.aBTest.update({
        where: { id: param(req.params.id) },
        data: req.body,
      });
      res.json({ success: true, data: test });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.aBTest.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'A/B test deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------

export const integrationController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = req.query as { category?: string };
      const integrations = await prisma.platformIntegration.findMany({
        where: category ? { category } : undefined,
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: integrations });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const integration = await prisma.platformIntegration.create({ data: req.body });
      res.status(201).json({ success: true, data: integration });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const integration = await prisma.platformIntegration.update({
        where: { id: param(req.params.id) },
        data: req.body,
      });
      res.json({ success: true, data: integration });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.platformIntegration.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Integration deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

export const webhookController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hooks = await prisma.webhookEndpoint.findMany({ orderBy: { createdAt: 'desc' } });
      res.json({ success: true, data: hooks });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const secret = req.body.secret || `whsec_${randomBytes(24).toString('hex')}`;
      const hook = await prisma.webhookEndpoint.create({
        data: { ...req.body, secret },
      });
      res.status(201).json({ success: true, data: hook });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hook = await prisma.webhookEndpoint.update({
        where: { id: param(req.params.id) },
        data: req.body,
      });
      res.json({ success: true, data: hook });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.webhookEndpoint.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Webhook deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// API Keys
// ---------------------------------------------------------------------------

export const apiKeyController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const keys = await prisma.apiKeyRecord.findMany({
        where: { revokedAt: null },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, prefix: true, scopes: true,
          expiresAt: true, lastUsedAt: true, createdBy: true, createdAt: true,
        },
      });
      res.json({ success: true, data: keys });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const raw = randomBytes(32).toString('hex');
      const prefix = `pk_${req.body.name.toLowerCase().replace(/\s+/g, '_').slice(0, 10)}_${raw.slice(0, 8)}`;
      const hashedKey = createHash('sha256').update(raw).digest('hex');

      const key = await prisma.apiKeyRecord.create({
        data: {
          name: req.body.name,
          prefix,
          hashedKey,
          scopes: req.body.scopes,
          expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
          createdBy: (req as any).user?.id ?? 'system',
        },
      });

      // Return the raw key ONLY on creation — it cannot be retrieved later
      res.status(201).json({
        success: true,
        data: { ...key, rawKey: raw },
      });
    } catch (error) {
      next(error);
    }
  },

  async revoke(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = await prisma.apiKeyRecord.update({
        where: { id: param(req.params.id) },
        data: { revokedAt: new Date() },
      });
      res.json({ success: true, data: key, message: 'API key revoked' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// IP Rules
// ---------------------------------------------------------------------------

export const ipRuleController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.query as { type?: string };
      const rules = await prisma.ipRule.findMany({
        where: type ? { type } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: rules });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = await prisma.ipRule.create({ data: req.body });
      res.status(201).json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.ipRule.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'IP rule deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Platform Roles
// ---------------------------------------------------------------------------

export const platformRoleController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await prisma.platformRole.findMany({ orderBy: { name: 'asc' } });
      res.json({ success: true, data: roles });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await prisma.platformRole.findUnique({ where: { name: req.body.name } });
      if (existing) throw new ConflictError(`Role "${req.body.name}" already exists`);

      const role = await prisma.platformRole.create({ data: req.body });
      res.status(201).json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await prisma.platformRole.update({
        where: { id: param(req.params.id) },
        data: req.body,
      });
      res.json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await prisma.platformRole.findUnique({ where: { id: param(req.params.id) } });
      if (role?.isSystem) throw new BadRequestError('Cannot delete system role');

      await prisma.platformRole.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Role deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Auth Settings
// ---------------------------------------------------------------------------

export const authSettingController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = req.query as { category?: string };
      const settings = await prisma.authSetting.findMany({
        where: category ? { category } : undefined,
        orderBy: { key: 'asc' },
      });
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  },

  async upsert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key, value, label, category } = req.body;
      const setting = await prisma.authSetting.upsert({
        where: { key },
        update: { value, label, category },
        create: { key, value, label, category },
      });
      res.json({ success: true, data: setting });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Audit Log (read-only queries — already exists in schema)
// ---------------------------------------------------------------------------

export const auditLogController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', pageSize = '50', entity, action } = req.query as Record<string, string>;
      const take = Math.min(parseInt(pageSize) || 50, 100);
      const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take;

      const [data, total] = await Promise.all([
        prisma.auditLog.findMany({
          where: {
            ...(entity && { entity }),
            ...(action && { action: { contains: action, mode: 'insensitive' as const } }),
          },
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
          orderBy: { timestamp: 'desc' },
          take,
          skip,
        }),
        prisma.auditLog.count({
          where: {
            ...(entity && { entity }),
            ...(action && { action: { contains: action, mode: 'insensitive' as const } }),
          },
        }),
      ]);

      res.json({ success: true, data, meta: { total, page: parseInt(page) || 1, pageSize: take } });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Legal Documents
// ---------------------------------------------------------------------------

export const legalDocController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = req.query as { category?: string };
      const docs = await prisma.legalDocument.findMany({
        where: category ? { category } : undefined,
        orderBy: { updatedAt: 'desc' },
      });
      res.json({ success: true, data: docs });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await prisma.legalDocument.create({
        data: {
          ...req.body,
          publishedAt: req.body.status === 'PUBLISHED' ? new Date() : undefined,
        },
      });
      res.status(201).json({ success: true, data: doc });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = { ...req.body };
      if (data.status === 'PUBLISHED') data.publishedAt = new Date();

      const doc = await prisma.legalDocument.update({
        where: { id: param(req.params.id) },
        data,
      });
      res.json({ success: true, data: doc });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await prisma.legalDocument.findUnique({ where: { id: param(req.params.id) } });
      if (!doc) throw new NotFoundError('Document not found');
      res.json({ success: true, data: doc });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.legalDocument.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Document deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Compliance Certs
// ---------------------------------------------------------------------------

export const complianceCertController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const certs = await prisma.complianceCert.findMany({ orderBy: { name: 'asc' } });
      res.json({ success: true, data: certs });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cert = await prisma.complianceCert.create({
        data: {
          ...req.body,
          auditDate: req.body.auditDate ? new Date(req.body.auditDate) : undefined,
          expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
        },
      });
      res.status(201).json({ success: true, data: cert });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = { ...req.body };
      if (data.auditDate) data.auditDate = new Date(data.auditDate);
      if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);

      const cert = await prisma.complianceCert.update({
        where: { id: param(req.params.id) },
        data,
      });
      res.json({ success: true, data: cert });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.complianceCert.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Certification deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Notification Rules
// ---------------------------------------------------------------------------

export const notificationRuleController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rules = await prisma.notificationRule.findMany({ orderBy: { event: 'asc' } });
      res.json({ success: true, data: rules });
    } catch (error) {
      next(error);
    }
  },

  async upsert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { event, label, email, push, inApp } = req.body;
      const rule = await prisma.notificationRule.upsert({
        where: { event },
        update: { label, email, push, inApp },
        create: { event, label, email, push, inApp },
      });
      res.json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  },

  async batchUpsert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { rules } = req.body as {
        rules: Array<{ event: string; email: boolean; push: boolean; inApp: boolean }>;
      };
      const results = await prisma.$transaction(
        rules.map((r) =>
          prisma.notificationRule.upsert({
            where: { event: r.event },
            update: { email: r.email, push: r.push, inApp: r.inApp },
            create: { event: r.event, email: r.email, push: r.push, inApp: r.inApp },
          }),
        ),
      );
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  },
};
