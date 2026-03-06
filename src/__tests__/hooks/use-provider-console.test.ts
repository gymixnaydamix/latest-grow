/* Frontend tests for provider-console React Query hooks */
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  /* ── Queries ── */
  useProviderHome,
  useProviderTenants,
  useProviderModuleData,
  useProviderUsage,
  useProviderNotifications,
  useProviderBranding,
  useProviderSettings,
  useProviderApiManagement,
  useProviderComms,
  useProviderBackups,
  useProviderSupportExtras,
  useProviderReports,
  /* ── Mutations ── */
  useUpdateProviderTenantStatus,
  useCreateProviderSupportTicket,
  useUpdateProviderSupportTicketStatus,
  useCreateProviderIncident,
  useUpdateProviderFeatureFlag,
  useCompleteProviderDataRequest,
  useMarkProviderNotificationRead,
  useRetryProviderInvoice,
  useCreateProviderPlan,
  useGenerateProviderApiKey,
  useRotateProviderApiKey,
  useRevokeProviderApiKey,
  useAddProviderIpRule,
  useRemoveProviderIpRule,
  useCreateProviderWebhook,
  useUpdateProviderSettings,
  useInviteProviderTeamMember,
  useRemoveProviderTeamMember,
  useCreateProviderRole,
  useUpdateProviderShift,
  useCreateProviderAuditExport,
  useExportProviderAnalyticsReport,
  useCreateProviderScheduledReport,
  useRunProviderReport,
  useCreateProviderAnnouncement,
  useSendProviderMessage,
  useCreateProviderCommsTemplate,
  useUpdateProviderCommsTemplate,
  useCreateProviderNotificationRule,
  useUpdateProviderNotificationRule,
  useCreateProviderBrandTheme,
  useUpdateProviderBrandTheme,
  useAddProviderDomain,
  useVerifyProviderDomain,
  useCreateProviderLoginPage,
  useUpdateProviderLoginPage,
  useUpdateProviderApiWebhook,
  useTestProviderApiWebhook,
  useUpdateProviderRateLimit,
  useCreateProviderBackupSchedule,
  useTriggerProviderBackup,
  useRestoreProviderSnapshot,
  useCreateProviderRunbook,
  useExecuteProviderRunbook,
  useStartProviderDataImport,
  useRunProviderRepairJob,
  useUpdateProviderMacro,
  useUpdateProviderKbArticle,
  useUpdateProviderIntegrationWebhook,
} from '../../hooks/api/use-provider-console';

/* ── Mock API client ── */
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockDel = jest.fn();
const mockRequest = jest.fn();
jest.mock('../../api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    del: (...args: unknown[]) => mockDel(...args),
    request: (...args: unknown[]) => mockRequest(...args),
  },
}));

/* ── Wrapper ── */
function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  };
}

beforeEach(() => jest.clearAllMocks());

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  QUERY HOOKS                                                     */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

describe('useProviderHome', () => {
  it('fetches home dashboard data', async () => {
    mockGet.mockResolvedValueOnce({ data: { tenants: 12, revenue: '10000' } });
    const { result } = renderHook(() => useProviderHome(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ tenants: 12, revenue: '10000' });
    expect(mockGet).toHaveBeenCalledWith('/provider/home');
  });
});

describe('useProviderTenants', () => {
  it('fetches tenant list', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 't1', name: 'Alpha School' }] });
    const { result } = renderHook(() => useProviderTenants({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useProviderModuleData', () => {
  it('fetches module data (14 parallel GETs)', async () => {
    // Must mock 14 api.get calls matching the Promise.all inside the hook
    mockGet
      .mockResolvedValueOnce({ data: [] })           // plans
      .mockResolvedValueOnce({ data: [] })           // subscriptions
      .mockResolvedValueOnce({ data: [] })           // invoices
      .mockResolvedValueOnce({ data: [] })           // support
      .mockResolvedValueOnce({ data: [] })           // incidents
      .mockResolvedValueOnce({ data: [] })           // flags
      .mockResolvedValueOnce({ data: [] })           // templates
      .mockResolvedValueOnce({ data: [] })           // addons
      .mockResolvedValueOnce({ data: { integrations: [], logs: [] } }) // integrations
      .mockResolvedValueOnce({ data: {} })           // security
      .mockResolvedValueOnce({ data: { exportRequests: [], deletionRequests: [] } }) // compliance
      .mockResolvedValueOnce({ data: { repairTasks: [] } }) // data-ops
      .mockResolvedValueOnce({ data: { users: [], roles: [] } }) // team
      .mockResolvedValueOnce({ data: [] });          // audit
    const { result } = renderHook(() => useProviderModuleData(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledTimes(14);
  });
});

describe('useProviderUsage', () => {
  it('fetches usage metrics', async () => {
    mockGet.mockResolvedValueOnce({ data: { daily: [], monthly: [] } });
    const { result } = renderHook(() => useProviderUsage(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useProviderNotifications', () => {
  it('fetches notifications', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'n1', title: 'Alert' }] });
    const { result } = renderHook(() => useProviderNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useProviderBranding', () => {
  it('fetches branding bundle', async () => {
    mockGet.mockResolvedValueOnce({ data: { themes: [], domains: [], loginPages: [] } });
    const { result } = renderHook(() => useProviderBranding(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useProviderSettings', () => {
  it('fetches settings bundle', async () => {
    mockGet.mockResolvedValueOnce({ data: { defaults: {}, notifications: {} } });
    const { result } = renderHook(() => useProviderSettings(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useProviderApiManagement', () => {
  it('fetches api mgmt bundle', async () => {
    mockGet.mockResolvedValueOnce({ data: { apiKeys: [], webhooks: [], rateLimits: [] } });
    const { result } = renderHook(() => useProviderApiManagement(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useProviderComms', () => {
  it('fetches comms bundle', async () => {
    mockGet.mockResolvedValueOnce({ data: { announcements: [], threads: [], templates: [] } });
    const { result } = renderHook(() => useProviderComms(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useProviderBackups', () => {
  it('fetches backups bundle', async () => {
    mockGet.mockResolvedValueOnce({ data: { schedules: [], snapshots: [], runbooks: [] } });
    const { result } = renderHook(() => useProviderBackups(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useProviderSupportExtras', () => {
  it('fetches support extras', async () => {
    mockGet.mockResolvedValueOnce({ data: { macros: [], kbArticles: [], csatRatings: [] } });
    const { result } = renderHook(() => useProviderSupportExtras(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useProviderReports', () => {
  it('fetches reports', async () => {
    mockGet.mockResolvedValueOnce({ data: { scheduled: [], history: [] } });
    const { result } = renderHook(() => useProviderReports(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  MUTATION HOOKS                                                  */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ── Tenant mutations ── */
describe('useUpdateProviderTenantStatus', () => {
  it('PATCHes tenant status', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 't1', status: 'ACTIVE' } });
    const { result } = renderHook(() => useUpdateProviderTenantStatus(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ tenantId: 't1', status: 'ACTIVE', reason: 'test' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalled();
  });
});

/* ── Support mutations ── */
describe('useCreateProviderSupportTicket', () => {
  it('POSTs a new ticket', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'tk1' } });
    const { result } = renderHook(() => useCreateProviderSupportTicket(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ tenantId: 't1', subject: 'Help', body: 'Desc', priority: 'HIGH' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPost).toHaveBeenCalled();
  });
});

describe('useUpdateProviderSupportTicketStatus', () => {
  it('PATCHes ticket status', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 'tk1', status: 'CLOSED' } });
    const { result } = renderHook(() => useUpdateProviderSupportTicketStatus(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ ticketId: 'tk1', status: 'CLOSED', reason: 'resolved' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateProviderMacro', () => {
  it('PATCHes macro', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 'm1', name: 'Updated' } });
    const { result } = renderHook(() => useUpdateProviderMacro(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ macroId: 'm1', name: 'Updated', template: 'hi', reason: 'fix' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith(
      '/provider/support/macros/m1',
      expect.objectContaining({ name: 'Updated' }),
    );
  });
});

describe('useUpdateProviderKbArticle', () => {
  it('PATCHes KB article', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 'kb1', title: 'New Title' } });
    const { result } = renderHook(() => useUpdateProviderKbArticle(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ articleId: 'kb1', title: 'New Title', status: 'PUBLISHED', reason: 'update' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith(
      '/provider/support/kb/kb1',
      expect.objectContaining({ title: 'New Title' }),
    );
  });
});

/* ── Incident / Feature flag ── */
describe('useCreateProviderIncident', () => {
  it('POSTs an incident', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'inc1' } });
    const { result } = renderHook(() => useCreateProviderIncident(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ title: 'Outage', severity: 'P1', description: 'x' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateProviderFeatureFlag', () => {
  it('PATCHes a feature flag', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 'ff1', enabled: true } });
    const { result } = renderHook(() => useUpdateProviderFeatureFlag(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ flagId: 'ff1', enabled: true, reason: 'launch' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ── Data / Compliance ── */
describe('useCompleteProviderDataRequest', () => {
  it('POSTs to complete a data request', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'dr1', status: 'COMPLETED' } });
    const { result } = renderHook(() => useCompleteProviderDataRequest(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ requestId: 'dr1', reason: 'done' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ── Notifications ── */
describe('useMarkProviderNotificationRead', () => {
  it('PATCHes notification as read', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 'n1', read: true } });
    const { result } = renderHook(() => useMarkProviderNotificationRead(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ notificationId: 'n1' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateProviderNotificationRule', () => {
  it('POSTs a notification rule', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'nr1' } });
    const { result } = renderHook(() => useCreateProviderNotificationRule(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ name: 'Rule A', event: 'TICKET_CREATED', channel: 'EMAIL', enabled: true, reason: 'add' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateProviderNotificationRule', () => {
  it('PATCHes a notification rule', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 'nr1' } });
    const { result } = renderHook(() => useUpdateProviderNotificationRule(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ ruleId: 'nr1', enabled: false, channel: 'SLACK', reason: 'flip' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ── Billing ── */
describe('useRetryProviderInvoice', () => {
  it('POSTs retry invoice', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'inv1' } });
    const { result } = renderHook(() => useRetryProviderInvoice(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ invoiceId: 'inv1', reason: 'retry' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateProviderPlan', () => {
  it('POSTs new plan', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'p1' } });
    const { result } = renderHook(() => useCreateProviderPlan(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ name: 'Premium', price: 99, interval: 'MONTHLY', features: [] } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ── API Keys ── */
describe('useGenerateProviderApiKey', () => {
  it('POSTs to generate key', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'k1', key: 'sk-xxx' } });
    const { result } = renderHook(() => useGenerateProviderApiKey(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ name: 'CI Key', scopes: ['read'] } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useRotateProviderApiKey', () => {
  it('POSTs to rotate key', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'k1', key: 'sk-yyy' } });
    const { result } = renderHook(() => useRotateProviderApiKey(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ keyId: 'k1', reason: 'scheduled' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useRevokeProviderApiKey', () => {
  it('POSTs to revoke key', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'k1', status: 'REVOKED' } });
    const { result } = renderHook(() => useRevokeProviderApiKey(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ keyId: 'k1', reason: 'compromised' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPost).toHaveBeenCalledWith(
      '/provider/api-management/keys/k1/revoke',
      expect.objectContaining({ reason: 'compromised' }),
    );
  });
});

/* ── IP Rules ── */
describe('useAddProviderIpRule', () => {
  it('POSTs an IP rule', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'ip1' } });
    const { result } = renderHook(() => useAddProviderIpRule(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ cidr: '10.0.0.0/8', label: 'Office', reason: 'access' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useRemoveProviderIpRule', () => {
  it('DELetes an IP rule', async () => {
    mockRequest.mockResolvedValueOnce({ data: { success: true } });
    const { result } = renderHook(() => useRemoveProviderIpRule(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ ruleId: 'ip1', reason: 'stale' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ── Webhooks ── */
describe('useCreateProviderWebhook', () => {
  it('POSTs a webhook', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'wh1' } });
    const { result } = renderHook(() => useCreateProviderWebhook(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ url: 'https://a.com/hook', events: ['ticket.created'], reason: 'add' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateProviderApiWebhook', () => {
  it('PATCHes a webhook', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 'wh1' } });
    const { result } = renderHook(() => useUpdateProviderApiWebhook(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ webhookId: 'wh1', url: 'https://b.com/hook', reason: 'edit' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useTestProviderApiWebhook', () => {
  it('POSTs to test a webhook', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true } });
    const { result } = renderHook(() => useTestProviderApiWebhook(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ webhookId: 'wh1' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateProviderIntegrationWebhook', () => {
  it('PATCHes an integration webhook', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 'iwh1' } });
    const { result } = renderHook(() => useUpdateProviderIntegrationWebhook(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ webhookId: 'iwh1', url: 'https://c.com/hook', reason: 'update' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith(
      '/provider/integrations/webhooks/iwh1',
      expect.objectContaining({ url: 'https://c.com/hook' }),
    );
  });
});

/* ── Rate Limits ── */
describe('useUpdateProviderRateLimit', () => {
  it('PATCHes rate limit', async () => {
    mockPatch.mockResolvedValueOnce({ data: { endpoint: '/api/data', limit: '5000' } });
    const { result } = renderHook(() => useUpdateProviderRateLimit(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ endpoint: '/api/data', method: 'GET', limit: '5000', burst: 100, reason: 'increase' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ── Settings ── */
describe('useUpdateProviderSettings', () => {
  it('PATCHes settings', async () => {
    mockPatch.mockResolvedValueOnce({ data: { timezone: 'UTC' } });
    const { result } = renderHook(() => useUpdateProviderSettings(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ section: 'defaults', values: { timezone: 'UTC' }, reason: 'update' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ── Team ── */
describe('useInviteProviderTeamMember', () => {
  it('POSTs an invitation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'u1' } });
    const { result } = renderHook(() => useInviteProviderTeamMember(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ firstName: 'Ana', lastName: 'Kim', email: 'a@k.com', role: 'admin', reason: 'hire' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useRemoveProviderTeamMember', () => {
  it('DELetes a team member', async () => {
    mockRequest.mockResolvedValueOnce({ data: { success: true } });
    const { result } = renderHook(() => useRemoveProviderTeamMember(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ userId: 'u1', reason: 'departed' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateProviderRole', () => {
  it('POSTs a role', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'r1' } });
    const { result } = renderHook(() => useCreateProviderRole(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ name: 'Ops', key: 'ops', permissions: ['read'], reason: 'new' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateProviderShift', () => {
  it('PATCHes shift', async () => {
    mockPatch.mockResolvedValueOnce({ data: { userId: 'u1', day: 'MON', shiftType: 'ON_DUTY' } });
    const { result } = renderHook(() => useUpdateProviderShift(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ userId: 'u1', day: 'MON', shiftType: 'ON_DUTY', reason: 'swap' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ── Audit ── */
describe('useCreateProviderAuditExport', () => {
  it('POSTs an audit export', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'ae1' } });
    const { result } = renderHook(() => useCreateProviderAuditExport(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ format: 'CSV', dateRange: '30d', reason: 'compliance' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ── Analytics / Reports ── */
describe('useExportProviderAnalyticsReport', () => {
  it('POSTs an analytics export', async () => {
    mockPost.mockResolvedValueOnce({ data: { downloadUrl: '/export/r1.csv' } });
    const { result } = renderHook(() => useExportProviderAnalyticsReport(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ type: 'revenue', format: 'CSV', reason: 'review' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateProviderScheduledReport', () => {
  it('POSTs a scheduled report', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'sr1' } });
    const { result } = renderHook(() => useCreateProviderScheduledReport(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ name: 'Weekly Rev', type: 'SCHEDULED', frequency: 'WEEKLY', format: 'CSV', recipients: [], reason: 'add' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useRunProviderReport', () => {
  it('POSTs to run a report now', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'sr1', status: 'RUNNING' } });
    const { result } = renderHook(() => useRunProviderReport(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ reportId: 'sr1', reason: 'ad-hoc' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ── Comms ── */
describe('useCreateProviderAnnouncement', () => {
  it('POSTs an announcement', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'a1' } });
    const { result } = renderHook(() => useCreateProviderAnnouncement(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ title: 'Downtime', body: 'Planned', audience: 'ALL', reason: 'notify' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useSendProviderMessage', () => {
  it('POSTs a message', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'msg1' } });
    const { result } = renderHook(() => useSendProviderMessage(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ threadId: 'thr1', body: 'Hello', reason: 'reply' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateProviderCommsTemplate', () => {
  it('POSTs a comms template', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'ct1' } });
    const { result } = renderHook(() => useCreateProviderCommsTemplate(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ name: 'Welcome', type: 'EMAIL', subject: 'Hi', body: 'text', variables: [], reason: 'new' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateProviderCommsTemplate', () => {
  it('PATCHes a comms template', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 'ct1' } });
    const { result } = renderHook(() => useUpdateProviderCommsTemplate(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ templateId: 'ct1', subject: 'Updated', reason: 'edit' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ── Branding ── */
describe('useCreateProviderBrandTheme', () => {
  it('POSTs a brand theme', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'bt1' } });
    const { result } = renderHook(() => useCreateProviderBrandTheme(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ name: 'Dark', primary: '#000', secondary: '#333', reason: 'new' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateProviderBrandTheme', () => {
  it('PATCHes a brand theme', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 'bt1' } });
    const { result } = renderHook(() => useUpdateProviderBrandTheme(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ themeId: 'bt1', primary: '#111', reason: 'tweak' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useAddProviderDomain', () => {
  it('POSTs a domain', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'd1' } });
    const { result } = renderHook(() => useAddProviderDomain(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ domain: 'app.example.com', type: 'Custom', reason: 'add' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useVerifyProviderDomain', () => {
  it('POSTs to verify domain DNS', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'd1', verified: true } });
    const { result } = renderHook(() => useVerifyProviderDomain(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ domainId: 'd1', reason: 'verify' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateProviderLoginPage', () => {
  it('POSTs a login page', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'lp1' } });
    const { result } = renderHook(() => useCreateProviderLoginPage(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ name: 'Main', tenant: 't1', logo: false, customCss: false, sso: false, mfa: false, reason: 'new' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateProviderLoginPage', () => {
  it('PATCHes a login page', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 'lp1' } });
    const { result } = renderHook(() => useUpdateProviderLoginPage(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ pageId: 'lp1', sso: true, reason: 'enable' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ── Backup ── */
describe('useCreateProviderBackupSchedule', () => {
  it('POSTs a backup schedule', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'bs1' } });
    const { result } = renderHook(() => useCreateProviderBackupSchedule(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ name: 'Nightly', frequency: 'DAILY', retention: '30 days', tenants: 5, reason: 'create' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useTriggerProviderBackup', () => {
  it('POSTs to trigger backup', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'bs1', status: 'RUNNING' } });
    const { result } = renderHook(() => useTriggerProviderBackup(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ scheduleId: 'bs1', reason: 'manual' } as any); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useRestoreProviderSnapshot', () => {
  it('POSTs to restore snapshot', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'snap1', status: 'RESTORING' } });
    const { result } = renderHook(() => useRestoreProviderSnapshot(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ snapshotId: 'snap1', reason: 'disaster' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateProviderRunbook', () => {
  it('POSTs a runbook', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'rb1' } });
    const { result } = renderHook(() => useCreateProviderRunbook(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ name: 'DR Plan A', description: 'Full restore', severity: 'CRITICAL', steps: 5, estimatedTime: '2h', reason: 'new' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useExecuteProviderRunbook', () => {
  it('POSTs to execute runbook', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'rb1', status: 'RUNNING' } });
    const { result } = renderHook(() => useExecuteProviderRunbook(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ runbookId: 'rb1', reason: 'drill' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ── DataOps ── */
describe('useStartProviderDataImport', () => {
  it('POSTs a data import', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'imp1' } });
    const { result } = renderHook(() => useStartProviderDataImport(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ type: 'CSV', config: { target: 'default' }, reason: 'bulk' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useRunProviderRepairJob', () => {
  it('POSTs to run a repair job', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'rj1', status: 'RUNNING' } });
    const { result } = renderHook(() => useRunProviderRepairJob(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ jobId: 'rj1', reason: 'fix data' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  ERROR HANDLING                                                  */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

describe('mutation error handling', () => {
  it('propagates API errors on mutations', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network failure'));
    const { result } = renderHook(() => useCreateProviderSupportTicket(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ tenantId: 't1', subject: 'Err', body: 'x', priority: 'HIGH' } as any); });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Network failure');
  });

  it('propagates API errors on queries', async () => {
    mockGet.mockRejectedValueOnce(new Error('401 Unauthorized'));
    const { result } = renderHook(() => useProviderHome(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('401 Unauthorized');
  });
});
