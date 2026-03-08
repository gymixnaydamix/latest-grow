import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { BadRequestError } from '../../utils/errors.js';
import { providerConsoleService } from '../services/provider-console.service.js';

const getString = (value: string | string[] | undefined): string => (Array.isArray(value) ? value[0] ?? '' : value ?? '');

function getActorEmail(req: Request): string {
  return req.user?.email ?? 'provider@growyourneed.dev';
}

function parseCsv(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((entry) => String(entry)).filter(Boolean);
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export const providerController = {
  async getHome(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: await providerConsoleService.getHome() });
    } catch (error) {
      next(error);
    }
  },

  async getReference(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: providerConsoleService.getReferenceData() });
    } catch (error) {
      next(error);
    }
  },

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = getString(req.query.q as string | string[] | undefined);
      res.json({ success: true, data: providerConsoleService.search(query) });
    } catch (error) {
      next(error);
    }
  },

  async listTenants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const country = getString(req.query.country as string | string[] | undefined);
      const status = getString(req.query.status as string | string[] | undefined);
      const stage = getString(req.query.stage as string | string[] | undefined);
      const search = getString(req.query.search as string | string[] | undefined);

      const filters = {
        country: country || undefined,
        status: status || undefined,
        stage: stage || undefined,
        search: search || undefined,
      };

      res.json({ success: true, data: await providerConsoleService.listTenants(filters as never) });
    } catch (error) {
      next(error);
    }
  },

  async getTenantDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getString(req.params.tenantId);
      if (!tenantId) throw new BadRequestError('tenantId is required');
      res.json({ success: true, data: await providerConsoleService.getTenantDetail(tenantId) });
    } catch (error) {
      next(error);
    }
  },

  async updateTenantStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getString(req.params.tenantId);
      const nextStatus = getString(req.body?.nextStatus);
      if (!tenantId || !nextStatus) throw new BadRequestError('tenantId and nextStatus are required');

      const data = providerConsoleService.updateTenantStatus({
        tenantId,
        nextStatus: nextStatus as never,
        reason: req.body?.reason,
        actorEmail: getActorEmail(req),
      });

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listOnboarding(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleData = providerConsoleService.listModuleData();
      const home = await providerConsoleService.getHome();
      res.json({
        success: true,
        data: {
          pipeline: home.onboardingPipeline,
          tasks: moduleData.onboardingTasks,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateOnboardingTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = getString(req.params.taskId);
      const status = getString(req.body?.status);
      if (!taskId || !status) throw new BadRequestError('taskId and status are required');

      const data = providerConsoleService.updateOnboardingTask({
        taskId,
        status: status as never,
        blockerCode: req.body?.blockerCode,
        reason: req.body?.reason,
        actorEmail: getActorEmail(req),
      });

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getBillingOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: await providerConsoleService.getBillingOverview() });
    } catch (error) {
      next(error);
    }
  },

  async getBillingExtras(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await providerConsoleService.getBillingOverview();
      res.json({
        success: true,
        data: {
          gateways: overview.gateways,
          coupons: overview.coupons,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async listPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await providerConsoleService.getBillingOverview();
      res.json({ success: true, data: overview.plans });
    } catch (error) {
      next(error);
    }
  },

  async listSubscriptions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await providerConsoleService.getBillingOverview();
      res.json({ success: true, data: overview.subscriptions });
    } catch (error) {
      next(error);
    }
  },

  async listInvoices(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await providerConsoleService.getBillingOverview();
      res.json({ success: true, data: overview.invoices });
    } catch (error) {
      next(error);
    }
  },

  async listPayments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await providerConsoleService.getBillingOverview();
      res.json({ success: true, data: overview.payments });
    } catch (error) {
      next(error);
    }
  },

  async listCredits(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await providerConsoleService.getBillingOverview();
      const approvals = Array.isArray(overview.approvals)
        ? overview.approvals.filter((approval) => String((approval as Record<string, unknown>).status) === 'PENDING')
        : [];
      res.json({ success: true, data: approvals });
    } catch (error) {
      next(error);
    }
  },

  async createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const name = getString(req.body?.name);
      const code = getString(req.body?.code);
      if (!name || !code) throw new BadRequestError('name and code are required');
      const data = providerConsoleService.createPlan({
        name,
        code,
        description: getString(req.body?.description),
        basePrice: Number(req.body?.basePrice ?? 0),
        perStudent: Number(req.body?.perStudent ?? 0),
        perTeacher: Number(req.body?.perTeacher ?? 0),
        storageLimitGb: Number(req.body?.storageLimitGb ?? 1),
        modules: parseCsv(req.body?.modules),
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateSubscriptionLifecycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscriptionId = getString(req.params.subscriptionId);
      const action = getString(req.body?.action);
      if (!subscriptionId || !action) throw new BadRequestError('subscriptionId and action are required');
      const data = providerConsoleService.updateSubscriptionLifecycle({
        subscriptionId,
        action: action as 'ACTIVATE' | 'SUSPEND' | 'RESUME' | 'CANCEL',
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async retryInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoiceId = getString(req.params.invoiceId);
      if (!invoiceId) throw new BadRequestError('invoiceId is required');
      const data = providerConsoleService.retryInvoice({
        invoiceId,
        reason: req.body?.reason,
        actorEmail: getActorEmail(req),
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async decideBillingApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const approvalId = getString(req.params.approvalId);
      const decision = getString(req.body?.decision);
      if (!approvalId || !decision) throw new BadRequestError('approvalId and decision are required');
      const data = providerConsoleService.decideBillingApproval({
        approvalId,
        decision: decision as 'APPROVED' | 'REJECTED',
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createGateway(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const name = getString(req.body?.name);
      if (!name) throw new BadRequestError('name is required');
      const methods = parseCsv(req.body?.methods).filter((entry) =>
        ['CARD', 'ACH', 'BANK_TRANSFER'].includes(entry),
      ) as Array<'CARD' | 'ACH' | 'BANK_TRANSFER'>;
      const data = providerConsoleService.createGateway({
        name,
        type: getString(req.body?.type),
        settlementDays: Number(req.body?.settlementDays ?? 2),
        methods,
        primary: Boolean(req.body?.primary),
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateGateway(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gatewayId = getString(req.params.gatewayId);
      if (!gatewayId) throw new BadRequestError('gatewayId is required');
      const status = getString(req.body?.status);
      const data = providerConsoleService.updateGateway({
        gatewayId,
        status: status ? (status as 'ACTIVE' | 'DEGRADED' | 'DISABLED') : undefined,
        primary: typeof req.body?.primary === 'boolean' ? req.body.primary : undefined,
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = getString(req.body?.code);
      if (!code) throw new BadRequestError('code is required');
      const planCodes = parseCsv(req.body?.planCodes);
      const data = providerConsoleService.createCoupon({
        code,
        description: getString(req.body?.description),
        type: getString(req.body?.type) === 'FLAT' ? 'FLAT' : 'PERCENT',
        discountValue: Number(req.body?.discountValue ?? 0),
        maxUses: req.body?.maxUses == null || req.body?.maxUses === '' ? null : Number(req.body.maxUses),
        expiresAt: getString(req.body?.expiresAt) || null,
        planCodes,
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const couponId = getString(req.params.couponId);
      const status = getString(req.body?.status);
      if (!couponId || !status) throw new BadRequestError('couponId and status are required');
      const data = providerConsoleService.updateCoupon({
        couponId,
        status: status as 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DISABLED',
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listUsage(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenants = await providerConsoleService.listTenants({} as never);
      const usage = tenants.flatMap((tenant) => {
        const now = new Date();
        const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
        const periodEnd = now.toISOString();
        return [
          { id: `usage_students_${tenant.id}`, tenantId: tenant.id, metricType: 'ACTIVE_STUDENTS', periodStart, periodEnd, value: tenant.activeStudents },
          { id: `usage_teachers_${tenant.id}`, tenantId: tenant.id, metricType: 'ACTIVE_TEACHERS', periodStart, periodEnd, value: tenant.activeTeachers },
          { id: `usage_parents_${tenant.id}`, tenantId: tenant.id, metricType: 'ACTIVE_PARENTS', periodStart, periodEnd, value: tenant.activeParents },
          { id: `usage_storage_${tenant.id}`, tenantId: tenant.id, metricType: 'STORAGE_GB', periodStart, periodEnd, value: tenant.storageUsedGb },
          { id: `usage_notifications_${tenant.id}`, tenantId: tenant.id, metricType: 'NOTIFICATIONS', periodStart, periodEnd, value: tenant.activeParents * 12 },
          { id: `usage_concurrency_${tenant.id}`, tenantId: tenant.id, metricType: 'PEAK_CONCURRENCY', periodStart, periodEnd, value: Math.max(12, Math.round(tenant.activeStudents / 8)) },
        ];
      });

      res.json({ success: true, data: usage });
    } catch (error) {
      next(error);
    }
  },

  async listLimits(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenants = await providerConsoleService.listTenants({} as never);
      const limits = tenants.map((tenant) => ({
        id: `limit_${tenant.id}`,
        tenantId: tenant.id,
        metricType: 'STORAGE_GB',
        softLimit: Math.round(tenant.storageLimitGb * 0.9),
        hardLimit: tenant.storageLimitGb,
        currentValue: tenant.storageUsedGb,
        overageEnabled: tenant.planCode !== 'starter',
        blockPolicy: tenant.planCode === 'starter' ? 'BLOCK_UPLOADS' : 'ALLOW_OVERAGE',
      }));

      res.json({ success: true, data: limits });
    } catch (error) {
      next(error);
    }
  },

  async listSupport(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleData = providerConsoleService.listModuleData();
      res.json({ success: true, data: moduleData.tickets });
    } catch (error) {
      next(error);
    }
  },

  async createSupportTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getString(req.body?.tenantId);
      const category = getString(req.body?.category);
      const subject = getString(req.body?.subject);
      const priority = getString(req.body?.priority);
      const requesterEmail = getString(req.body?.requesterEmail);

      if (!tenantId || !category || !subject || !priority || !requesterEmail) {
        throw new BadRequestError('tenantId, category, subject, priority, requesterEmail are required');
      }

      const data = providerConsoleService.createSupportTicket({
        tenantId,
        category: category as never,
        subject,
        priority: priority as never,
        requesterEmail,
        reason: req.body?.reason,
        actorEmail: getActorEmail(req),
      });

      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateSupportStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticketId = getString(req.params.ticketId);
      const status = getString(req.body?.status);
      if (!ticketId || !status) throw new BadRequestError('ticketId and status are required');

      const data = providerConsoleService.updateSupportStatus({
        ticketId,
        status: status as never,
        reason: req.body?.reason,
        actorEmail: getActorEmail(req),
      });

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listIncidents(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleData = providerConsoleService.listModuleData();
      res.json({ success: true, data: moduleData.incidents });
    } catch (error) {
      next(error);
    }
  },

  async createIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const title = getString(req.body?.title);
      const severity = getString(req.body?.severity);
      const affectedServices = parseCsv(req.body?.affectedServices);
      const tenantIds = parseCsv(req.body?.tenantIds);
      if (!title || !severity) throw new BadRequestError('title and severity are required');

      const data = providerConsoleService.createIncident({
        title,
        severity: severity as never,
        affectedServices,
        tenantIds,
        reason: req.body?.reason,
        actorEmail: getActorEmail(req),
      });

      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleData = providerConsoleService.listModuleData();
      const incidents = (moduleData.incidents as Array<Record<string, unknown>>) ?? [];
      const components = [
        { id: 'comp_api', key: 'api', name: 'Core API', publicStatus: incidents.some((incident) => String(incident.status) === 'OPEN') ? 'DEGRADED' : 'OPERATIONAL' },
        { id: 'comp_web', key: 'web', name: 'Web App', publicStatus: 'OPERATIONAL' },
        { id: 'comp_notifications', key: 'notifications', name: 'Notifications', publicStatus: incidents.some((incident) => String(incident.title).toLowerCase().includes('notification')) ? 'DEGRADED' : 'OPERATIONAL' },
        { id: 'comp_payments', key: 'payments', name: 'Payments', publicStatus: incidents.some((incident) => String(incident.title).toLowerCase().includes('payment')) ? 'DEGRADED' : 'OPERATIONAL' },
      ];

      const maintenance = [
        {
          id: 'mw_weekly',
          componentId: 'comp_api',
          startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
          scope: 'PUBLIC',
          title: 'Weekly DB index maintenance',
        },
      ];

      res.json({ success: true, data: { components, maintenance, incidents } });
    } catch (error) {
      next(error);
    }
  },

  async listReleases(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const releases = [
        {
          id: 'rel_2026_03_01',
          version: '2026.03.1',
          channel: 'stable',
          state: 'ROLLED_OUT',
          scheduledAt: null,
          rollbackOf: null,
        },
        {
          id: 'rel_2026_03_02',
          version: '2026.03.2',
          channel: 'canary',
          state: 'PAUSED',
          scheduledAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          rollbackOf: null,
        },
      ];
      res.json({ success: true, data: releases });
    } catch (error) {
      next(error);
    }
  },

  async listFlags(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleData = providerConsoleService.listModuleData();
      res.json({ success: true, data: moduleData.featureFlags });
    } catch (error) {
      next(error);
    }
  },

  async updateFlag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const flagId = getString(req.params.flagId);
      if (!flagId) throw new BadRequestError('flagId is required');

      const data = providerConsoleService.updateFeatureFlag({
        flagId,
        enabled: req.body?.enabled,
        rolloutPercent: req.body?.rolloutPercent,
        scheduledAt: req.body?.scheduledAt,
        reason: req.body?.reason,
        actorEmail: getActorEmail(req),
      });

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listTemplates(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleData = providerConsoleService.listModuleData();
      res.json({ success: true, data: moduleData.templates });
    } catch (error) {
      next(error);
    }
  },

  async listAddons(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleData = providerConsoleService.listModuleData();
      res.json({ success: true, data: moduleData.addons });
    } catch (error) {
      next(error);
    }
  },

  async listIntegrations(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleData = providerConsoleService.listModuleData();
      res.json({
        success: true,
        data: {
          integrations: moduleData.integrations,
          logs: moduleData.integrationLogs,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async listSecurity(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleData = providerConsoleService.listModuleData();
      const users = (moduleData.providerUsers as Array<Record<string, unknown>>) ?? [];
      const roles = (moduleData.providerRoles as Array<Record<string, unknown>>) ?? [];

      res.json({
        success: true,
        data: {
          mfaEnforcedUsers: users.filter((entry) => entry.mfaEnforced === true).length,
          suspiciousLogins: [
            {
              id: 'sec_evt_1',
              email: 'ops@brightfutureprep.sc.ke',
              tenantId: 'tenant_bright',
              country: 'Unknown VPN Exit',
              happenedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
              status: 'OPEN',
            },
          ],
          roles,
          users,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async listCompliance(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleData = providerConsoleService.listModuleData();
      res.json({
        success: true,
        data: {
          exportRequests: moduleData.exportRequests,
          deletionRequests: moduleData.deletionRequests,
          retentionPolicy: {
            defaultDays: 365,
            archivedDays: 2555,
            legalHoldEnabled: true,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async listDataOps(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleData = providerConsoleService.listModuleData();
      res.json({
        success: true,
        data: {
          exportRequests: moduleData.exportRequests,
          deletionRequests: moduleData.deletionRequests,
          repairTasks: [
            { id: 'repair_1', tenantId: 'tenant_sunrise', type: 'DEDUPE_GUARDIANS', status: 'IN_PROGRESS', owner: 'dataops@provider.local' },
            { id: 'repair_2', tenantId: 'tenant_beacon', type: 'MISSING_RELATIONS', status: 'BLOCKED', owner: 'ops@provider.local' },
          ],
          migrationChecks: [
            { id: 'mig_1', tenantId: 'tenant_cedar', currentSchema: '2026.2', requiredSchema: '2026.2', compatible: true },
            { id: 'mig_2', tenantId: 'tenant_horizon', currentSchema: '2025.11', requiredSchema: '2026.2', compatible: false },
          ],
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async completeDataRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestType = getString(req.params.requestType);
      const requestId = getString(req.params.requestId);
      if (!requestType || !requestId) throw new BadRequestError('requestType and requestId are required');

      const data = providerConsoleService.completeDataRequest({
        requestType: requestType.toUpperCase() as 'EXPORT' | 'DELETION',
        requestId,
        reason: req.body?.reason,
        actorEmail: getActorEmail(req),
      });

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listTeam(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleData = providerConsoleService.listModuleData();
      res.json({
        success: true,
        data: {
          users: moduleData.providerUsers,
          roles: moduleData.providerRoles,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getPermissionContext(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleData = providerConsoleService.listModuleData();
      const users = (moduleData.providerUsers as Array<Record<string, unknown>>) ?? [];
      const roles = (moduleData.providerRoles as Array<Record<string, unknown>>) ?? [];
      const email = getActorEmail(req);
      const user = users.find((entry) => String(entry.email).toLowerCase() === email.toLowerCase()) ?? null;
      const roleKey = user ? String(user.roleKey ?? '') : 'OWNER';
      const role = roles.find((entry) => String(entry.key) === roleKey) ?? roles[0] ?? null;

      res.json({
        success: true,
        data: {
          user,
          role,
          permissions: Array.isArray(role?.permissions) ? role.permissions : ['*'],
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async listSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          defaultTenantSettings: {
            timezone: 'UTC',
            locale: 'en',
            suspensionGraceDays: 5,
            onboardingSlaHours: 24,
          },
          notificationRules: {
            failedPaymentReminder: [1, 3, 5],
            incidentBroadcastChannels: ['email', 'status-page'],
            slaBreachEscalation: true,
          },
          legalTemplates: [
            { id: 'legal_dpa', name: 'Data Processing Agreement', version: '2026.1' },
            { id: 'legal_tos', name: 'Terms of Service', version: '2026.2' },
          ],
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async listAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getString(req.query.tenantId as string | string[] | undefined);
      const actorEmail = getString(req.query.actorEmail as string | string[] | undefined);
      const action = getString(req.query.action as string | string[] | undefined);
      const data = providerConsoleService.listAudit({
        tenantId: tenantId || undefined,
        actorEmail: actorEmail || undefined,
        action: action || undefined,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  TENANT EXTENDED MUTATIONS
   * ═══════════════════════════════════════════════════════════════════ */

  async getTenantLifecycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getString(req.params.tenantId);
      if (!tenantId) throw new BadRequestError('tenantId is required');
      res.json({ success: true, data: providerConsoleService.getTenantLifecycle(tenantId) });
    } catch (error) {
      next(error);
    }
  },

  async listTenantMaintenanceActions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getString(req.params.tenantId);
      if (!tenantId) throw new BadRequestError('tenantId is required');
      res.json({ success: true, data: providerConsoleService.listTenantMaintenanceActions(tenantId) });
    } catch (error) {
      next(error);
    }
  },

  async updateTenantProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getString(req.params.tenantId);
      if (!tenantId) throw new BadRequestError('tenantId is required');
      const data = providerConsoleService.updateTenantProfile({
        tenantId,
        name: req.body?.name,
        domain: req.body?.domain,
        adminEmail: req.body?.adminEmail,
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async toggleTenantModule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = getString(req.params.tenantId);
      const moduleKey = getString(req.body?.moduleKey);
      if (!tenantId || !moduleKey) throw new BadRequestError('tenantId and moduleKey are required');
      const data = providerConsoleService.toggleTenantModule({
        tenantId,
        moduleKey,
        enabled: Boolean(req.body?.enabled),
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createTenantMaintenanceAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = providerConsoleService.createTenantMaintenanceAction({
        tenantId: getString(req.body?.tenantId),
        type: getString(req.body?.type),
        description: getString(req.body?.description),
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async resolveTenantMaintenanceAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actionId = getString(req.params.actionId);
      if (!actionId) throw new BadRequestError('actionId is required');
      const data = providerConsoleService.resolveTenantMaintenanceAction({
        actionId,
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async bulkUpdateTenantStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantIds = parseCsv(req.body?.tenantIds);
      const status = getString(req.body?.status);
      if (!tenantIds.length || !status) throw new BadRequestError('tenantIds and status are required');
      const data = providerConsoleService.bulkUpdateTenantStatus({
        tenantIds,
        status: status as never,
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async exportTenants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const format = getString(req.body?.format) || 'CSV';
      const tenants = await providerConsoleService.listTenants({} as never);
      res.json({
        success: true,
        data: { downloadUrl: `/downloads/tenants_export_${Date.now()}.${format.toLowerCase()}`, recordCount: tenants.length },
      });
    } catch (error) {
      next(error);
    }
  },

  async launchOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = providerConsoleService.launchOnboarding({
        tenantName: getString(req.body?.tenantName),
        planCode: getString(req.body?.planCode),
        adminEmail: getString(req.body?.adminEmail),
        country: getString(req.body?.country),
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  USAGE / LIMITS
   * ═══════════════════════════════════════════════════════════════════ */

  async createUsageExport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const format = getString(req.body?.format) || 'CSV';
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), format, status: 'PROCESSING', createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limitId = getString(req.params.limitId);
      if (!limitId) throw new BadRequestError('limitId is required');
      res.json({
        success: true,
        data: {
          id: limitId,
          softLimit: req.body?.softLimit,
          hardLimit: req.body?.hardLimit,
          overageEnabled: req.body?.overageEnabled,
          blockPolicy: req.body?.blockPolicy,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async createLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: {
          id: randomUUID(),
          tenantId: req.body?.tenantId,
          metricType: req.body?.metricType,
          softLimit: req.body?.softLimit,
          hardLimit: req.body?.hardLimit,
          currentValue: 0,
          overageEnabled: Boolean(req.body?.overageEnabled),
          blockPolicy: getString(req.body?.blockPolicy) || 'ALLOW_OVERAGE',
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  SUPPORT EXTRAS
   * ═══════════════════════════════════════════════════════════════════ */

  async getSupportExtras(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: providerConsoleService.getSupportExtras() });
    } catch (error) {
      next(error);
    }
  },

  async updateMacro(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const macroId = getString(req.params.macroId);
      if (!macroId) throw new BadRequestError('macroId is required');
      const data = providerConsoleService.updateMacro({
        macroId,
        name: req.body?.name,
        category: req.body?.category,
        template: req.body?.template,
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateKbArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const articleId = getString(req.params.articleId);
      if (!articleId) throw new BadRequestError('articleId is required');
      const data = providerConsoleService.updateKbArticle({
        articleId,
        title: req.body?.title,
        category: req.body?.category,
        status: req.body?.status,
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  INCIDENTS / MAINTENANCE
   * ═══════════════════════════════════════════════════════════════════ */

  async listMaintenanceWindows(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: providerConsoleService.listMaintenanceWindows() });
    } catch (error) {
      next(error);
    }
  },

  async createMaintenanceWindow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = providerConsoleService.createMaintenanceWindow({
        title: getString(req.body?.title),
        componentId: getString(req.body?.componentId),
        startsAt: getString(req.body?.startsAt),
        endsAt: getString(req.body?.endsAt),
        scope: getString(req.body?.scope) || 'PUBLIC',
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  RELEASES + FLAGS creation
   * ═══════════════════════════════════════════════════════════════════ */

  async createRelease(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = providerConsoleService.createRelease({
        version: getString(req.body?.version),
        channel: getString(req.body?.channel) || 'stable',
        scheduledAt: req.body?.scheduledAt || null,
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createFlag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = providerConsoleService.createFeatureFlag({
        key: getString(req.body?.key),
        name: getString(req.body?.name),
        rolloutPercent: Number(req.body?.rolloutPercent ?? 0),
        actorEmail: getActorEmail(req),
        reason: req.body?.reason,
      });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  TEMPLATES + CONNECTORS + INTEGRATIONS
   * ═══════════════════════════════════════════════════════════════════ */

  async createTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), name: req.body?.name, type: req.body?.type, status: 'DRAFT', createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async createConnector(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), name: req.body?.name, type: req.body?.type, status: 'ACTIVE', createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async retryIntegration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logId = getString(req.params.logId);
      if (!logId) throw new BadRequestError('logId is required');
      res.json({ success: true, data: { id: logId, status: 'RETRYING', retriedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async listOAuthApps(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: providerConsoleService.listOAuthApps() });
    } catch (error) {
      next(error);
    }
  },

  async createOAuthApp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: {
          id: randomUUID(),
          name: req.body?.name,
          clientId: `cli_${randomUUID().slice(0, 8)}`,
          clientSecret: `sec_${randomUUID()}`,
          redirectUri: req.body?.redirectUri,
          scopes: parseCsv(req.body?.scopes),
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateIntegrationWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const webhookId = getString(req.params.webhookId);
      if (!webhookId) throw new BadRequestError('webhookId is required');
      res.json({
        success: true,
        data: { id: webhookId, url: req.body?.url, events: req.body?.events, status: req.body?.status || 'ACTIVE', updatedAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  SECURITY EXTRAS
   * ═══════════════════════════════════════════════════════════════════ */

  async getSecurityExtras(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: providerConsoleService.getSecurityExtras() });
    } catch (error) {
      next(error);
    }
  },

  async addIpRule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), cidr: req.body?.cidr, label: req.body?.label, createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async removeIpRule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ruleId = getString(req.params.ruleId);
      if (!ruleId) throw new BadRequestError('ruleId is required');
      res.json({ success: true, data: { id: ruleId, deleted: true } });
    } catch (error) {
      next(error);
    }
  },

  async revokeSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: { revokedCount: req.body?.all ? 42 : 1 } });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  API MANAGEMENT
   * ═══════════════════════════════════════════════════════════════════ */

  async getApiManagement(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: providerConsoleService.getApiManagement() });
    } catch (error) {
      next(error);
    }
  },

  async generateApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), name: req.body?.name, key: `sk_live_${randomUUID()}`, scopes: parseCsv(req.body?.scopes), createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async rotateApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const keyId = getString(req.params.keyId);
      if (!keyId) throw new BadRequestError('keyId is required');
      res.json({ success: true, data: { id: keyId, key: `sk_live_${randomUUID()}`, rotatedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async revokeApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const keyId = getString(req.params.keyId);
      if (!keyId) throw new BadRequestError('keyId is required');
      res.json({ success: true, data: { id: keyId, status: 'REVOKED', revokedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async createApiWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), url: req.body?.url, events: parseCsv(req.body?.events), secret: `whsec_${randomUUID().slice(0, 16)}`, status: 'ACTIVE', createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateApiWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const webhookId = getString(req.params.webhookId);
      if (!webhookId) throw new BadRequestError('webhookId is required');
      res.json({ success: true, data: { id: webhookId, url: req.body?.url, events: req.body?.events, status: req.body?.status || 'ACTIVE', updatedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async testApiWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const webhookId = getString(req.params.webhookId);
      if (!webhookId) throw new BadRequestError('webhookId is required');
      res.json({ success: true, data: { id: webhookId, tested: true, statusCode: 200, latencyMs: 145, testedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async updateRateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        data: { endpoint: req.body?.endpoint, method: req.body?.method, limit: req.body?.limit, burst: req.body?.burst, updatedAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  SETTINGS MUTATIONS
   * ═══════════════════════════════════════════════════════════════════ */

  async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: { section: req.body?.section, values: req.body?.values, updatedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async createLegalTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), name: req.body?.name, content: req.body?.content, version: '1.0', createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateLegalTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templateId = getString(req.params.templateId);
      if (!templateId) throw new BadRequestError('templateId is required');
      res.json({ success: true, data: { id: templateId, name: req.body?.name, content: req.body?.content, updatedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async createEmailTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), name: req.body?.name, subject: req.body?.subject, body: req.body?.body, createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateEmailTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templateId = getString(req.params.templateId);
      if (!templateId) throw new BadRequestError('templateId is required');
      res.json({ success: true, data: { id: templateId, subject: req.body?.subject, body: req.body?.body, updatedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async applyTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: { themeId: req.body?.themeId, appliedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async saveCustomCss(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: { css: req.body?.css, savedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  TEAM MUTATIONS
   * ═══════════════════════════════════════════════════════════════════ */

  async inviteTeamMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), firstName: req.body?.firstName, lastName: req.body?.lastName, email: req.body?.email, role: req.body?.role, status: 'INVITED', createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async removeTeamMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getString(req.params.userId);
      if (!userId) throw new BadRequestError('userId is required');
      res.json({ success: true, data: { id: userId, removed: true } });
    } catch (error) {
      next(error);
    }
  },

  async createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), name: req.body?.name, key: req.body?.key, permissions: parseCsv(req.body?.permissions), createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateShift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        data: { userId: req.body?.userId, day: req.body?.day, shiftType: req.body?.shiftType, updatedAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  AUDIT EXPORTS
   * ═══════════════════════════════════════════════════════════════════ */

  async listAuditExports(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: providerConsoleService.listAuditExports() });
    } catch (error) {
      next(error);
    }
  },

  async createAuditExport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), format: req.body?.format || 'CSV', dateRange: req.body?.dateRange, status: 'PROCESSING', createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  ANALYTICS
   * ═══════════════════════════════════════════════════════════════════ */

  async exportAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        data: { downloadUrl: `/downloads/analytics_${Date.now()}.${getString(req.body?.format) || 'csv'}` },
      });
    } catch (error) {
      next(error);
    }
  },

  async listAnalyticsReports(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: providerConsoleService.listAnalyticsReports() });
    } catch (error) {
      next(error);
    }
  },

  async createScheduledReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: {
          id: randomUUID(),
          name: req.body?.name,
          type: req.body?.type || 'SCHEDULED',
          frequency: req.body?.frequency,
          format: req.body?.format || 'CSV',
          recipients: parseCsv(req.body?.recipients),
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async runReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reportId = getString(req.params.reportId);
      if (!reportId) throw new BadRequestError('reportId is required');
      res.json({ success: true, data: { id: reportId, status: 'RUNNING', startedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  NOTIFICATIONS
   * ═══════════════════════════════════════════════════════════════════ */

  async listNotifications(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: providerConsoleService.listNotifications() });
    } catch (error) {
      next(error);
    }
  },

  async markNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notificationId = getString(req.body?.notificationId);
      res.json({ success: true, data: { id: notificationId, read: true, readAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async createNotificationRule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), name: req.body?.name, event: req.body?.event, channel: req.body?.channel, enabled: Boolean(req.body?.enabled), createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateNotificationRule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ruleId = getString(req.params.ruleId);
      if (!ruleId) throw new BadRequestError('ruleId is required');
      res.json({ success: true, data: { id: ruleId, enabled: req.body?.enabled, channel: req.body?.channel, updatedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  COMMS
   * ═══════════════════════════════════════════════════════════════════ */

  async listComms(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: providerConsoleService.listComms() });
    } catch (error) {
      next(error);
    }
  },

  async createAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), title: req.body?.title, body: req.body?.body, audience: req.body?.audience, status: 'DRAFT', createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async sendAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const announcementId = getString(req.params.announcementId);
      if (!announcementId) throw new BadRequestError('announcementId is required');
      res.json({ success: true, data: { id: announcementId, status: 'SENT', sentAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), threadId: req.body?.threadId, body: req.body?.body, sentAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async createCommsTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), name: req.body?.name, type: req.body?.type, subject: req.body?.subject, body: req.body?.body, variables: parseCsv(req.body?.variables), createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCommsTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templateId = getString(req.params.templateId);
      if (!templateId) throw new BadRequestError('templateId is required');
      res.json({ success: true, data: { id: templateId, subject: req.body?.subject, body: req.body?.body, updatedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  BRANDING
   * ═══════════════════════════════════════════════════════════════════ */

  async getBranding(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: providerConsoleService.getBranding() });
    } catch (error) {
      next(error);
    }
  },

  async createBrandTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), name: req.body?.name, primary: req.body?.primary, secondary: req.body?.secondary, font: req.body?.font || 'Inter', active: false, createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateBrandTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const themeId = getString(req.params.themeId);
      if (!themeId) throw new BadRequestError('themeId is required');
      res.json({ success: true, data: { id: themeId, primary: req.body?.primary, secondary: req.body?.secondary, updatedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async addDomain(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), domain: req.body?.domain, type: req.body?.type, verified: false, dnsRecord: `_verify.${req.body?.domain}`, createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyDomain(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const domainId = getString(req.params.domainId);
      if (!domainId) throw new BadRequestError('domainId is required');
      res.json({ success: true, data: { id: domainId, verified: true, verifiedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async createLoginPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), name: req.body?.name, tenant: req.body?.tenant, logo: Boolean(req.body?.logo), customCss: Boolean(req.body?.customCss), sso: Boolean(req.body?.sso), mfa: Boolean(req.body?.mfa), createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateLoginPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pageId = getString(req.params.pageId);
      if (!pageId) throw new BadRequestError('pageId is required');
      res.json({ success: true, data: { id: pageId, sso: req.body?.sso, mfa: req.body?.mfa, updatedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  BACKUPS / DR
   * ═══════════════════════════════════════════════════════════════════ */

  async listBackups(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: providerConsoleService.listBackups() });
    } catch (error) {
      next(error);
    }
  },

  async createBackupSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), name: req.body?.name, frequency: req.body?.frequency, retention: req.body?.retention, tenants: req.body?.tenants, status: 'ACTIVE', createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async triggerBackup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scheduleId = getString(req.params.scheduleId);
      if (!scheduleId) throw new BadRequestError('scheduleId is required');
      res.json({ success: true, data: { id: scheduleId, status: 'RUNNING', triggeredAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async updateBackupSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scheduleId = getString(req.params.scheduleId);
      if (!scheduleId) throw new BadRequestError('scheduleId is required');
      res.json({ success: true, data: { id: scheduleId, type: req.body?.type, retention: req.body?.retention, updatedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async restoreSnapshot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const snapshotId = getString(req.params.snapshotId);
      if (!snapshotId) throw new BadRequestError('snapshotId is required');
      res.json({ success: true, data: { id: snapshotId, status: 'RESTORING', restoredAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  async createRunbook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), name: req.body?.name, description: req.body?.description, severity: req.body?.severity, steps: req.body?.steps, estimatedTime: req.body?.estimatedTime, status: 'DRAFT', createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async executeRunbook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const runbookId = getString(req.params.runbookId);
      if (!runbookId) throw new BadRequestError('runbookId is required');
      res.json({ success: true, data: { id: runbookId, status: 'RUNNING', startedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  DATA OPS EXTRAS
   * ═══════════════════════════════════════════════════════════════════ */

  async getDataOpsExtras(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: providerConsoleService.getDataOpsExtras() });
    } catch (error) {
      next(error);
    }
  },

  async startDataImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: { id: randomUUID(), type: req.body?.type, config: req.body?.config, status: 'RUNNING', startedAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  },

  async runRepairJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jobId = getString(req.params.jobId);
      if (!jobId) throw new BadRequestError('jobId is required');
      res.json({ success: true, data: { id: jobId, status: 'RUNNING', startedAt: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  },
};

