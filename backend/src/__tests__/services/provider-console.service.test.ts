import { beforeEach, describe, expect, it } from 'vitest';
import { providerConsoleService } from '../../api/services/provider-console.service.js';

describe('providerConsoleService', () => {
  beforeEach(() => {
    providerConsoleService.resetStateForTests();
  });

  it('generates actionable inbox items for billing and blockers', () => {
    const home = providerConsoleService.getHome();
    const inbox = home.actionInbox as Array<Record<string, unknown>>;

    expect(inbox.length).toBeGreaterThan(0);
    expect(inbox.some((item) => item.type === 'BILLING_EXCEPTION')).toBe(true);
    expect(inbox.some((item) => item.type === 'ONBOARDING_BLOCKER')).toBe(true);
  });

  it('advances dunning retry deterministically and writes audit event', () => {
    const before = providerConsoleService.listModuleData().invoices as Array<Record<string, unknown>>;
    const failedInvoice = before.find((invoice) => invoice.status === 'FAILED');
    expect(failedInvoice).toBeTruthy();

    const invoiceId = String(failedInvoice?.id);
    const first = providerConsoleService.retryInvoice({
      invoiceId,
      actorEmail: 'billing@provider.local',
      reason: 'Retry after issuer guidance',
    });
    const firstStatus = first.status;

    const second = providerConsoleService.retryInvoice({
      invoiceId,
      actorEmail: 'billing@provider.local',
      reason: 'Second retry window',
    });
    const secondStatus = second.status;

    expect(firstStatus).toBe('FAILED');
    expect(secondStatus).toBe('PAID');

    const audit = providerConsoleService.listAudit({ action: 'billing.invoice.retry' });
    expect(audit.length).toBeGreaterThanOrEqual(2);
  });

  it('blocks onboarding stage when task becomes blocked', () => {
    const tasks = providerConsoleService.listModuleData().onboardingTasks as Array<Record<string, unknown>>;
    const pendingTask = tasks.find((task) => String(task.status) === 'PENDING');
    expect(pendingTask).toBeTruthy();

    providerConsoleService.updateOnboardingTask({
      taskId: String(pendingTask?.id),
      status: 'BLOCKED',
      blockerCode: 'PERMISSION_CONFLICTS',
      actorEmail: 'ops@provider.local',
      reason: 'Access template conflict',
    });

    const tenantId = String(pendingTask?.tenantId);
    const detail = providerConsoleService.getTenantDetail(tenantId);
    const tenant = detail.tenant as Record<string, unknown>;
    expect(tenant.onboardingStage).toBe('BLOCKED');
  });

  it('auto-pauses incident-sensitive feature flags when severe incident is declared', () => {
    const beforeFlags = providerConsoleService.listModuleData().featureFlags as Array<Record<string, unknown>>;
    const autoPauseFlag = beforeFlags.find((flag) => Boolean(flag.autoPauseOnIncident));
    expect(autoPauseFlag).toBeTruthy();

    const incident = providerConsoleService.createIncident({
      title: 'Cross-region queue latency',
      severity: 'SEV1',
      affectedServices: ['notifications'],
      tenantIds: ['tenant_desert'],
      actorEmail: 'ops@provider.local',
      reason: 'Customer communication threshold exceeded',
    });

    const afterFlags = providerConsoleService.listModuleData().featureFlags as Array<Record<string, unknown>>;
    const updated = afterFlags.find((flag) => String(flag.id) === String(autoPauseFlag?.id));

    expect(updated?.pausedByIncidentId).toBe(incident.id);
  });

  it('returns a rich billing overview bundle with analytics and operations data', () => {
    const overview = providerConsoleService.getBillingOverview();

    expect(Array.isArray(overview.plans)).toBe(true);
    expect(Array.isArray(overview.subscriptions)).toBe(true);
    expect(Array.isArray(overview.invoices)).toBe(true);
    expect(Array.isArray(overview.approvals)).toBe(true);
    expect(Array.isArray(overview.payments)).toBe(true);
    expect(Array.isArray(overview.gateways)).toBe(true);
    expect(Array.isArray(overview.coupons)).toBe(true);
    expect((overview.analytics as Record<string, unknown>).summary).toBeTruthy();
  });

  it('applies billing approval decisions back to the invoice state', () => {
    const overview = providerConsoleService.getBillingOverview();
    const pendingApproval = (overview.approvals as Array<Record<string, unknown>>).find((entry) => entry.status === 'PENDING');
    expect(pendingApproval).toBeTruthy();

    const beforeInvoice = (overview.invoices as Array<Record<string, unknown>>).find((entry) => entry.id === pendingApproval?.invoiceId);
    const beforeAmount = Number(beforeInvoice?.amount ?? 0);

    providerConsoleService.decideBillingApproval({
      approvalId: String(pendingApproval?.id),
      decision: 'APPROVED',
      actorEmail: 'billing@provider.local',
      reason: 'Retention exception approved',
    });

    const updatedOverview = providerConsoleService.getBillingOverview();
    const afterApproval = (updatedOverview.approvals as Array<Record<string, unknown>>).find((entry) => entry.id === pendingApproval?.id);
    const afterInvoice = (updatedOverview.invoices as Array<Record<string, unknown>>).find((entry) => entry.id === pendingApproval?.invoiceId);

    expect(afterApproval?.status).toBe('APPROVED');
    expect(afterInvoice?.discountPendingApproval).toBe(false);
    expect(Number(afterInvoice?.amount ?? 0)).toBeLessThan(beforeAmount);
  });
});
