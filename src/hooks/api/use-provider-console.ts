import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type {
  ApiSuccessResponse,
  AuditEventDTO,
  BillingExceptionItem,
  ComplianceRequestDTO,
  FeatureFlagRuleDTO,
  IncidentDTO,
  OnboardingPipelineCard,
  ProviderActionInboxItem,
  SupportTicketDTO,
  TenantHealthRecord,
  UsageLimitState,
} from '@root/types';

type ProviderTenantRecord = {
  id: string;
  externalId: string;
  name: string;
  country: string;
  status: string;
  health: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  billingStatus: 'GOOD' | 'DUE' | 'FAILED';
  onboardingStage: string;
  planCode: string;
  domain: string;
  customDomain: string | null;
  adminEmail: string;
  adminName: string;
  activeStudents: number;
  activeTeachers: number;
  activeParents: number;
  storageUsedGb: number;
  storageLimitGb: number;
  incidentsOpen: number;
  lastLoginAt: string;
  modules: string[];
};

type ProviderHomeDTO = {
  actionInbox: ProviderActionInboxItem[];
  tenantHealthWatchlist: TenantHealthRecord[];
  onboardingPipeline: OnboardingPipelineCard[];
  billingExceptions: BillingExceptionItem[];
  systemHealth: {
    uptimePct: number;
    queueBacklog: number;
    activeIncidents: number;
    emailDelivery: string;
    smsDelivery: string;
  };
};

type ProviderPermissionContext = {
  user: Record<string, unknown> | null;
  role: Record<string, unknown> | null;
  permissions: string[];
};

type ProviderModuleBundle = {
  plans: Array<Record<string, unknown>>;
  subscriptions: Array<Record<string, unknown>>;
  invoices: BillingExceptionItem[];
  tickets: SupportTicketDTO[];
  incidents: IncidentDTO[];
  featureFlags: FeatureFlagRuleDTO[];
  onboardingTasks: Array<Record<string, unknown>>;
  templates: Array<Record<string, unknown>>;
  addons: Array<Record<string, unknown>>;
  integrations: Array<Record<string, unknown>>;
  integrationLogs: Array<Record<string, unknown>>;
  exportRequests: ComplianceRequestDTO[];
  deletionRequests: ComplianceRequestDTO[];
  providerUsers: Array<Record<string, unknown>>;
  providerRoles: Array<Record<string, unknown>>;
  audit: AuditEventDTO[];
};

type ProviderSearchTenant = {
  id: string;
  externalId: string;
  name: string;
  domain: string;
  adminEmail: string;
};

/* ── New domain types ── */

export type ProviderNotificationDTO = {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  read: boolean;
  createdAt: string;
};

export type NotificationRuleDTO = {
  id: string;
  name: string;
  event: string;
  channel: string;
  enabled: boolean;
};

export type NotificationDeliveryDTO = {
  id: string;
  rule: string;
  event: string;
  channel: string;
  recipient: string;
  sentAt: string;
  status: 'DELIVERED' | 'FAILED';
};

export type ProviderNotificationsBundle = {
  notifications: ProviderNotificationDTO[];
  rules: NotificationRuleDTO[];
  deliveries: NotificationDeliveryDTO[];
};

export type BrandThemeDTO = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  active: boolean;
  tenants: number;
};

export type BrandDomainDTO = {
  id: string;
  domain: string;
  type: string;
  ssl: string;
  verified: boolean;
  tenant?: string;
};

export type BrandLoginPageDTO = {
  id: string;
  name: string;
  tenant: string;
  logo: boolean;
  customCss: boolean;
  sso: boolean;
  mfa: boolean;
};

export type ProviderBrandingBundle = {
  themes: BrandThemeDTO[];
  domains: BrandDomainDTO[];
  loginPages: BrandLoginPageDTO[];
};

export type ProviderSettingsBundle = {
  defaultTenantSettings: {
    timezone: string;
    locale: string;
    suspensionGraceDays: number;
    onboardingSlaHours: number;
  };
  notificationRules: {
    failedPaymentReminder: number[];
    incidentBroadcastChannels: string[];
    slaBreachEscalation: boolean;
  };
  legalTemplates: Array<{ id: string; name: string; version: string }>;
  slaPolicies: Array<{ priority: string; firstResponse: string; resolution: string; escalation: string }>;
  emailTemplates: Array<{
    id: string;
    name: string;
    trigger: string;
    subject: string;
    variables: string[];
    lastEdited: string;
    status: string;
  }>;
  appearanceThemes: Array<{
    name: string;
    primary: string;
    sidebar: string;
    text: string;
    active: boolean;
  }>;
};

export type ApiKeyDTO = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string;
  scopes: string[];
  status: string;
};

export type WebhookEndpointDTO = {
  id: string;
  url: string;
  events: string[];
  status: string;
  successRate: number;
  lastTriggered: string;
};

export type RateLimitRuleDTO = {
  endpoint: string;
  method: string;
  limit: string;
  current: number;
  burst: number;
  status: string;
};

export type ApiDailyStatDTO = {
  date: string;
  requests: number;
  errors: number;
  latencyP50: number;
  latencyP99: number;
};

export type ProviderApiMgmtBundle = {
  apiKeys: ApiKeyDTO[];
  webhooks: WebhookEndpointDTO[];
  rateLimits: RateLimitRuleDTO[];
  dailyStats: ApiDailyStatDTO[];
};

export type AnnouncementDTO = {
  id: string;
  title: string;
  audience: string;
  status: string;
  sentAt: string | null;
  recipients: number;
};

export type MessageThreadDTO = {
  id: string;
  tenant: string;
  subject: string;
  lastMessage: string;
  status: string;
  unread: number;
};

export type CommsTemplateDTO = {
  id: string;
  name: string;
  type: string;
  subject: string;
  variables: string[];
};

export type ProviderCommsBundle = {
  announcements: AnnouncementDTO[];
  threads: MessageThreadDTO[];
  templates: CommsTemplateDTO[];
};

export type BackupScheduleDTO = {
  id: string;
  name: string;
  frequency: string;
  retention: string;
  lastRun: string;
  status: string;
  size: string;
  tenants: number;
};

export type RecoverySnapshotDTO = {
  id: string;
  timestamp: string;
  type: string;
  size: string;
  status: string;
  verified: boolean;
};

export type RunbookDTO = {
  id: string;
  name: string;
  description: string;
  lastTested: string;
  severity: string;
  steps: number;
  estimatedTime: string;
};

export type ProviderBackupsBundle = {
  schedules: BackupScheduleDTO[];
  snapshots: RecoverySnapshotDTO[];
  runbooks: RunbookDTO[];
};

export const providerKeys = {
  root: ['provider-console'] as const,
  home: ['provider-console', 'home'] as const,
  reference: ['provider-console', 'reference'] as const,
  tenants: (filters?: Record<string, string | undefined>) =>
    ['provider-console', 'tenants', filters] as const,
  tenantDetail: (tenantId: string | null) => ['provider-console', 'tenant', tenantId] as const,
  onboarding: ['provider-console', 'onboarding'] as const,
  moduleData: ['provider-console', 'module-data'] as const,
  support: ['provider-console', 'support'] as const,
  incidents: ['provider-console', 'incidents'] as const,
  flags: ['provider-console', 'flags'] as const,
  usage: ['provider-console', 'usage'] as const,
  limits: ['provider-console', 'limits'] as const,
  permissions: ['provider-console', 'permissions'] as const,
  audit: (filters?: Record<string, string | undefined>) =>
    ['provider-console', 'audit', filters] as const,
  search: (q: string) => ['provider-console', 'search', q] as const,
  notifications: ['provider-console', 'notifications'] as const,
  branding: ['provider-console', 'branding'] as const,
  settings: ['provider-console', 'settings'] as const,
  apiMgmt: ['provider-console', 'api-mgmt'] as const,
  comms: ['provider-console', 'comms'] as const,
  backups: ['provider-console', 'backups'] as const,
  billingOverview: ['provider-console', 'billing-overview'] as const,
  billingExtras: ['provider-console', 'billing-extras'] as const,
  supportExtras: ['provider-console', 'support-extras'] as const,
  securityExtras: ['provider-console', 'security-extras'] as const,
  oauthApps: ['provider-console', 'oauth-apps'] as const,
  reports: ['provider-console', 'reports'] as const,
  dataOpsExtras: ['provider-console', 'data-ops-extras'] as const,
  maintenance: ['provider-console', 'maintenance'] as const,
  releases: ['provider-console', 'releases'] as const,
  auditExports: ['provider-console', 'audit-exports'] as const,
};

function toQueryString(filters: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const raw = params.toString();
  return raw ? `?${raw}` : '';
}

export function useProviderHome() {
  return useQuery({
    queryKey: providerKeys.home,
    queryFn: () =>
      api.get<ApiSuccessResponse<ProviderHomeDTO>>('/provider/home').then((res) => res.data),
  });
}

export function useProviderReferenceData() {
  return useQuery({
    queryKey: providerKeys.reference,
    queryFn: () =>
      api.get<ApiSuccessResponse<Record<string, unknown>>>('/provider/reference').then((res) => res.data),
  });
}

export function useProviderTenants(filters: {
  country?: string;
  status?: string;
  stage?: string;
  search?: string;
} = {}) {
  return useQuery({
    queryKey: providerKeys.tenants(filters),
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderTenantRecord[]>>(
          `/provider/tenants${toQueryString(filters)}`,
        )
        .then((res) => res.data),
  });
}

export function useProviderTenantDetail(tenantId: string | null) {
  return useQuery({
    queryKey: providerKeys.tenantDetail(tenantId),
    queryFn: () =>
      api.get<ApiSuccessResponse<Record<string, unknown>>>(`/provider/tenants/${tenantId}`).then((res) => res.data),
    enabled: Boolean(tenantId),
  });
}

export function useProviderOnboarding() {
  return useQuery({
    queryKey: providerKeys.onboarding,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<{ pipeline: OnboardingPipelineCard[]; tasks: Array<Record<string, unknown>> }>>('/provider/onboarding')
        .then((res) => res.data),
  });
}

export function useProviderModuleData() {
  return useQuery({
    queryKey: providerKeys.moduleData,
    queryFn: async () => {
      const [
        plans,
        subscriptions,
        invoices,
        support,
        incidents,
        flags,
        templates,
        addons,
        integrations,
        security,
        compliance,
        dataOps,
        team,
        audit,
      ] = await Promise.all([
        api.get<ApiSuccessResponse<Array<Record<string, unknown>>>>('/provider/plans'),
        api.get<ApiSuccessResponse<Array<Record<string, unknown>>>>('/provider/subscriptions'),
        api.get<ApiSuccessResponse<BillingExceptionItem[]>>('/provider/invoices'),
        api.get<ApiSuccessResponse<SupportTicketDTO[]>>('/provider/support'),
        api.get<ApiSuccessResponse<IncidentDTO[]>>('/provider/incidents'),
        api.get<ApiSuccessResponse<FeatureFlagRuleDTO[]>>('/provider/flags'),
        api.get<ApiSuccessResponse<Array<Record<string, unknown>>>>('/provider/templates'),
        api.get<ApiSuccessResponse<Array<Record<string, unknown>>>>('/provider/addons'),
        api.get<ApiSuccessResponse<{ integrations: Array<Record<string, unknown>>; logs: Array<Record<string, unknown>> }>>('/provider/integrations'),
        api.get<ApiSuccessResponse<Record<string, unknown>>>('/provider/security'),
        api.get<ApiSuccessResponse<{ exportRequests: ComplianceRequestDTO[]; deletionRequests: ComplianceRequestDTO[] }>>('/provider/compliance'),
        api.get<ApiSuccessResponse<Record<string, unknown>>>('/provider/data-ops'),
        api.get<ApiSuccessResponse<{ users: Array<Record<string, unknown>>; roles: Array<Record<string, unknown>> }>>('/provider/team'),
        api.get<ApiSuccessResponse<AuditEventDTO[]>>('/provider/audit'),
      ]);

      const onboardingTasks = ((dataOps.data.repairTasks as Array<Record<string, unknown>>) ?? []).map((task) => task);

      return {
        plans: plans.data,
        subscriptions: subscriptions.data,
        invoices: invoices.data,
        tickets: support.data,
        incidents: incidents.data,
        featureFlags: flags.data,
        onboardingTasks,
        templates: templates.data,
        addons: addons.data,
        integrations: integrations.data.integrations,
        integrationLogs: integrations.data.logs,
        exportRequests: compliance.data.exportRequests,
        deletionRequests: compliance.data.deletionRequests,
        providerUsers: team.data.users,
        providerRoles: team.data.roles,
        audit: audit.data,
        security: security.data,
        dataOps: dataOps.data,
      } satisfies ProviderModuleBundle & Record<string, unknown>;
    },
  });
}

export function useProviderUsage() {
  return useQuery({
    queryKey: providerKeys.usage,
    queryFn: () =>
      api.get<ApiSuccessResponse<Array<Record<string, unknown>>>>('/provider/usage').then((res) => res.data),
  });
}

export function useProviderLimits() {
  return useQuery({
    queryKey: providerKeys.limits,
    queryFn: () => api.get<ApiSuccessResponse<UsageLimitState[]>>('/provider/limits').then((res) => res.data),
  });
}

export function useProviderPermissionContext() {
  return useQuery({
    queryKey: providerKeys.permissions,
    queryFn: () =>
      api.get<ApiSuccessResponse<ProviderPermissionContext>>('/provider/team/permissions').then((res) => res.data),
  });
}

export function useProviderAudit(filters: { tenantId?: string; actorEmail?: string; action?: string } = {}) {
  return useQuery({
    queryKey: providerKeys.audit(filters),
    queryFn: () =>
      api
        .get<ApiSuccessResponse<AuditEventDTO[]>>(`/provider/audit${toQueryString(filters)}`)
        .then((res) => res.data),
  });
}

export function useProviderSearch(q: string) {
  return useQuery({
    queryKey: providerKeys.search(q),
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderSearchTenant[]>>(`/provider/search?q=${encodeURIComponent(q)}`)
        .then((res) => res.data),
    enabled: q.trim().length > 1,
  });
}

export function useUpdateProviderTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { tenantId: string; nextStatus: string; reason: string }) =>
      api
        .patch<ApiSuccessResponse<ProviderTenantRecord>>(`/provider/tenants/${input.tenantId}/status`, {
          nextStatus: input.nextStatus,
          reason: input.reason,
        })
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ── Tenant Lifecycle ── */
export type TenantLifecycleEvent = {
  id: string;
  tenantId: string;
  tenantName: string;
  fromStatus: string;
  toStatus: string;
  reason: string;
  actor: string;
  createdAt: string;
};

export type TenantTrialInfo = {
  tenantId: string;
  tenantName: string;
  domain: string;
  trialStartedAt: string;
  trialEndsAt: string;
  daysRemaining: number;
  conversionProbability: number;
  adminEmail: string;
  planCode: string;
  activeUsers: number;
};

export type TenantMaintenanceAction = {
  id: string;
  tenantId: string;
  tenantName: string;
  actionType: 'HEALTH_CHECK' | 'DATA_REPAIR' | 'STORAGE_CLEANUP' | 'CERTIFICATE_RENEWAL' | 'BACKUP_RESTORE' | 'DNS_UPDATE' | 'MODULE_PATCH' | 'ESCALATION';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  description: string;
  assignedTo: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  resolution: string | null;
};

export type TenantProfileDetail = {
  id: string;
  externalId: string;
  name: string;
  country: string;
  status: string;
  health: string;
  billingStatus: string;
  onboardingStage: string;
  planCode: string;
  domain: string;
  customDomain: string | null;
  adminEmail: string;
  adminName: string;
  adminPhone: string;
  activeStudents: number;
  activeTeachers: number;
  activeParents: number;
  storageUsedGb: number;
  storageLimitGb: number;
  incidentsOpen: number;
  lastLoginAt: string;
  modules: string[];
  createdAt: string;
  timezone: string;
  locale: string;
  billingContact: string;
  technicalContact: string;
  slaLevel: string;
  apiAccess: boolean;
  customBranding: boolean;
  ssoEnabled: boolean;
  mfaEnforced: boolean;
  dataRegion: string;
  backupFrequency: string;
  lastBackupAt: string | null;
  notes: string;
  tags: string[];
};

export function useProviderTenantLifecycle() {
  return useQuery({
    queryKey: [...providerKeys.root, 'tenant-lifecycle'] as const,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<{ events: TenantLifecycleEvent[]; trials: TenantTrialInfo[] }>>('/provider/tenants/lifecycle')
        .then((res) => res.data),
  });
}

export function useProviderTenantMaintenanceActions() {
  return useQuery({
    queryKey: [...providerKeys.root, 'tenant-maintenance-actions'] as const,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<TenantMaintenanceAction[]>>('/provider/tenants/maintenance/actions')
        .then((res) => res.data),
  });
}

export function useUpdateTenantProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { tenantId: string; updates: Partial<TenantProfileDetail>; reason: string }) =>
      api
        .patch<ApiSuccessResponse<TenantProfileDetail>>(`/provider/tenants/${input.tenantId}/profile`, {
          ...input.updates,
          reason: input.reason,
        })
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

export function useToggleTenantModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { tenantId: string; module: string; enabled: boolean; reason: string }) =>
      api
        .patch<ApiSuccessResponse<Record<string, unknown>>>(`/provider/tenants/${input.tenantId}/modules`, {
          module: input.module,
          enabled: input.enabled,
          reason: input.reason,
        })
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

export function useCreateTenantMaintenanceAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      tenantId: string;
      actionType: TenantMaintenanceAction['actionType'];
      priority: TenantMaintenanceAction['priority'];
      description: string;
      scheduledAt?: string;
    }) =>
      api
        .post<ApiSuccessResponse<TenantMaintenanceAction>>('/provider/tenants/maintenance/actions', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

export function useResolveTenantMaintenanceAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { actionId: string; resolution: string }) =>
      api
        .patch<ApiSuccessResponse<TenantMaintenanceAction>>(`/provider/tenants/maintenance/actions/${input.actionId}/resolve`, {
          resolution: input.resolution,
        })
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

export function useBulkUpdateTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { tenantIds: string[]; nextStatus: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<{ updated: number }>>('/provider/tenants/bulk/status', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

export function useExportTenants() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { format: 'CSV' | 'JSON'; filters?: Record<string, string> }) =>
      api
        .post<ApiSuccessResponse<{ downloadUrl: string; recordCount: number }>>('/provider/tenants/export', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

export function useUpdateOnboardingTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { taskId: string; status: string; blockerCode?: string | null; reason: string }) =>
      api
        .patch<ApiSuccessResponse<Record<string, unknown>>>(`/provider/onboarding/tasks/${input.taskId}`, {
          status: input.status,
          blockerCode: input.blockerCode ?? null,
          reason: input.reason,
        })
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

export function useRetryProviderInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { invoiceId: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>(`/provider/invoices/${input.invoiceId}/retry`, {
          reason: input.reason,
        })
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

export function useCreateProviderSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      tenantId: string;
      category: string;
      subject: string;
      priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
      requesterEmail: string;
      reason: string;
    }) =>
      api.post<ApiSuccessResponse<SupportTicketDTO>>('/provider/support/tickets', input).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

export function useUpdateProviderSupportTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { ticketId: string; status: string; reason: string }) =>
      api
        .patch<ApiSuccessResponse<SupportTicketDTO>>(`/provider/support/tickets/${input.ticketId}/status`, {
          status: input.status,
          reason: input.reason,
        })
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

export function useCreateProviderIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      severity: 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';
      affectedServices: string[];
      tenantIds: string[];
      reason: string;
    }) =>
      api.post<ApiSuccessResponse<IncidentDTO>>('/provider/incidents', input).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

export function useUpdateProviderFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      flagId: string;
      enabled?: boolean;
      rolloutPercent?: number;
      scheduledAt?: string | null;
      reason: string;
    }) =>
      api
        .patch<ApiSuccessResponse<FeatureFlagRuleDTO>>(`/provider/flags/${input.flagId}`, {
          enabled: input.enabled,
          rolloutPercent: input.rolloutPercent,
          scheduledAt: input.scheduledAt,
          reason: input.reason,
        })
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

export function useCompleteProviderDataRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { requestType: 'export' | 'deletion'; requestId: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>(
          `/provider/data-ops/requests/${input.requestType}/${input.requestId}/complete`,
          { reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* NEW DOMAIN HOOKS                                                */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function useProviderNotifications() {
  return useQuery({
    queryKey: providerKeys.notifications,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderNotificationsBundle>>('/provider/notifications')
        .then((res) => res.data),
  });
}

export function useMarkProviderNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { notificationId: string } | { all: true }) =>
      api
        .patch<ApiSuccessResponse<Record<string, unknown>>>(
          '/provider/notifications/read',
          input,
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.notifications });
    },
  });
}

export function useProviderBranding() {
  return useQuery({
    queryKey: providerKeys.branding,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderBrandingBundle>>('/provider/branding')
        .then((res) => res.data),
  });
}

export function useProviderSettings() {
  return useQuery({
    queryKey: providerKeys.settings,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderSettingsBundle>>('/provider/settings')
        .then((res) => res.data),
  });
}

export function useProviderApiManagement() {
  return useQuery({
    queryKey: providerKeys.apiMgmt,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderApiMgmtBundle>>('/provider/api-management')
        .then((res) => res.data),
  });
}

export function useProviderComms() {
  return useQuery({
    queryKey: providerKeys.comms,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderCommsBundle>>('/provider/comms')
        .then((res) => res.data),
  });
}

export function useSendProviderAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { announcementId: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<AnnouncementDTO>>(
          `/provider/comms/announcements/${input.announcementId}/send`,
          { reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.comms });
    },
  });
}

export function useProviderBackups() {
  return useQuery({
    queryKey: providerKeys.backups,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderBackupsBundle>>('/provider/backups')
        .then((res) => res.data),
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* CATEGORY-B DOMAIN HOOKS (wiring mixed sections)                 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ── Billing extras ── */
export type ProviderBillingPlanDTO = {
  id: string;
  code: string;
  name: string;
  status: string;
  description: string;
  basePrice: number;
  perStudent: number;
  perTeacher: number;
  storageLimitGb: number;
  modules: string[];
  monthlyPrice: number;
  subscriberCount: number;
  activeTenantCount: number;
  mrr: number;
  seats: number;
};

export type ProviderBillingSubscriptionDTO = {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantStatus: string;
  tenantHealth: string;
  adminEmail: string;
  planCode: string;
  planName: string;
  state: string;
  startedAt: string;
  trialEndsAt: string | null;
  renewalAt: string;
  graceEndsAt: string | null;
  billingCycle: string;
  seats: number;
  monthlyPrice: number;
  collectionState: string;
};

export type ProviderBillingInvoiceDTO = BillingExceptionItem & {
  tenantName: string;
  planCode: string;
  billingStatus: string;
  currency: string;
  agingDays: number;
  outstandingBalance: number;
  risk: string;
};

export type ProviderBillingApprovalDTO = {
  id: string;
  invoiceId: string;
  tenantId: string;
  tenantName: string;
  invoiceNumber: string;
  invoiceAmount: number;
  type: string;
  requestedBy: string;
  requestedAt: string;
  impactAmount: number;
  note: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decidedAt: string | null;
  decidedBy: string | null;
};

export type ProviderBillingPaymentDTO = {
  id: string;
  invoiceId: string | null;
  tenantId: string;
  tenantName: string;
  gatewayId: string;
  gatewayName: string;
  method: string;
  amount: number;
  state: 'SUCCEEDED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  attemptedAt: string;
  providerRef: string;
  failureReason: string | null;
};

export type PaymentGatewayDTO = {
  id: string;
  name: string;
  type: string;
  status: string;
  monthlyVolume: string;
  successRate: number;
  primary?: boolean;
  settlementDays?: number;
  methods?: string[];
  supportedRegions?: string[];
};

export type CouponDTO = {
  id: string;
  code: string;
  description?: string;
  discount: string;
  type: string;
  uses: number;
  maxUses: number | null;
  expires: string | null;
  status: string;
  createdAt?: string;
  planCodes?: string[];
  revenueProtected?: number;
};

export type ProviderRevenueAnalyticsDTO = {
  summary: {
    mrr: number;
    arr: number;
    collectedThisMonth: number;
    overdueAmount: number;
    arpt: number;
    atRiskTenants: number;
    couponDiscountThisMonth: number;
  };
  monthlyRevenue: Array<{ month: string; label: string; billed: number; collected: number }>;
  revenueByPlan: Array<{ planCode: string; planName: string; tenants: number; mrr: number; billed: number }>;
  dunningByStep: Array<{ step: number; count: number; amount: number }>;
  paymentMix: Array<{ method: string; count: number; volume: number }>;
  regionRevenue: Array<{ country: string; tenants: number; billed: number }>;
};

export type ProviderBillingOverviewDTO = {
  plans: ProviderBillingPlanDTO[];
  subscriptions: ProviderBillingSubscriptionDTO[];
  invoices: ProviderBillingInvoiceDTO[];
  approvals: ProviderBillingApprovalDTO[];
  payments: ProviderBillingPaymentDTO[];
  gateways: PaymentGatewayDTO[];
  coupons: CouponDTO[];
  analytics: ProviderRevenueAnalyticsDTO;
};

export type ProviderBillingExtrasBundle = {
  gateways: PaymentGatewayDTO[];
  coupons: CouponDTO[];
};

export function useProviderBillingOverview() {
  return useQuery({
    queryKey: providerKeys.billingOverview,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderBillingOverviewDTO>>('/provider/billing/overview')
        .then((res) => res.data),
  });
}

export function useProviderBillingExtras() {
  return useQuery({
    queryKey: providerKeys.billingExtras,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderBillingExtrasBundle>>('/provider/billing/extras')
        .then((res) => res.data),
  });
}

export function useCreateProviderPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      code: string;
      description?: string;
      basePrice: number;
      perStudent: number;
      perTeacher: number;
      storageLimitGb: number;
      modules: string[];
      reason: string;
    }) => api.post<ApiSuccessResponse<ProviderBillingPlanDTO>>('/provider/plans', input).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
      qc.invalidateQueries({ queryKey: providerKeys.billingOverview });
    },
  });
}

export function useUpdateProviderSubscriptionLifecycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      subscriptionId: string;
      action: 'ACTIVATE' | 'SUSPEND' | 'RESUME' | 'CANCEL';
      reason: string;
    }) =>
      api
        .patch<ApiSuccessResponse<ProviderBillingSubscriptionDTO>>(
          `/provider/subscriptions/${input.subscriptionId}/lifecycle`,
          { action: input.action, reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
      qc.invalidateQueries({ queryKey: providerKeys.billingOverview });
    },
  });
}

export function useDecideProviderBillingApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      approvalId: string;
      decision: 'APPROVED' | 'REJECTED';
      reason: string;
    }) =>
      api
        .post<ApiSuccessResponse<ProviderBillingApprovalDTO>>(
          `/provider/approvals/${input.approvalId}/decision`,
          { decision: input.decision, reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
      qc.invalidateQueries({ queryKey: providerKeys.billingOverview });
    },
  });
}

export function useCreateProviderGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      type: string;
      settlementDays: number;
      methods: string[];
      primary?: boolean;
      reason: string;
    }) => api.post<ApiSuccessResponse<PaymentGatewayDTO>>('/provider/gateways', input).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
      qc.invalidateQueries({ queryKey: providerKeys.billingOverview });
      qc.invalidateQueries({ queryKey: providerKeys.billingExtras });
    },
  });
}

export function useUpdateProviderGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      gatewayId: string;
      status?: 'ACTIVE' | 'DEGRADED' | 'DISABLED';
      primary?: boolean;
      reason: string;
    }) =>
      api
        .patch<ApiSuccessResponse<PaymentGatewayDTO>>(`/provider/gateways/${input.gatewayId}`, {
          status: input.status,
          primary: input.primary,
          reason: input.reason,
        })
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
      qc.invalidateQueries({ queryKey: providerKeys.billingOverview });
      qc.invalidateQueries({ queryKey: providerKeys.billingExtras });
    },
  });
}

export function useCreateProviderCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      code: string;
      description: string;
      type: 'PERCENT' | 'FLAT';
      discountValue: number;
      maxUses: number | null;
      expiresAt: string | null;
      planCodes: string[];
      reason: string;
    }) => api.post<ApiSuccessResponse<CouponDTO>>('/provider/coupons', input).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
      qc.invalidateQueries({ queryKey: providerKeys.billingOverview });
      qc.invalidateQueries({ queryKey: providerKeys.billingExtras });
    },
  });
}

export function useUpdateProviderCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      couponId: string;
      status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DISABLED';
      reason: string;
    }) =>
      api
        .patch<ApiSuccessResponse<CouponDTO>>(`/provider/coupons/${input.couponId}`, {
          status: input.status,
          reason: input.reason,
        })
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
      qc.invalidateQueries({ queryKey: providerKeys.billingOverview });
      qc.invalidateQueries({ queryKey: providerKeys.billingExtras });
    },
  });
}

/* ── Support extras ── */
export type SupportMacroDTO = {
  id: string;
  name: string;
  category: string;
  usageCount: number;
  template: string;
  actions: string[];
  lastUsed: string;
};

export type KbArticleDTO = {
  id: string;
  title: string;
  category: string;
  views: number;
  helpfulPct: number;
  status: string;
  updatedAt: string;
};

export type CsatRatingDTO = {
  id: string;
  tenant: string;
  score: number;
  feedback: string;
  ticketId: string;
  createdAt: string;
};

export type ProviderSupportExtrasBundle = {
  macros: SupportMacroDTO[];
  kbArticles: KbArticleDTO[];
  csatRatings: CsatRatingDTO[];
};

export function useProviderSupportExtras() {
  return useQuery({
    queryKey: providerKeys.supportExtras,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderSupportExtrasBundle>>('/provider/support/extras')
        .then((res) => res.data),
  });
}

/* ── Security extras ── */
export type ComplianceItemDTO = {
  id: string;
  framework: string;
  status: string;
  lastAudit: string;
  nextAudit: string;
  coverage: number;
};

export type IpAllowlistRuleDTO = {
  id: string;
  cidr: string;
  label: string;
  createdAt: string;
  lastSeen: string;
  hits: number;
};

export type AdminSessionDTO = {
  id: string;
  user: string;
  role: string;
  ip: string;
  device: string;
  startedAt: string;
  lastActive: string;
  status: string;
};

export type ProviderSecurityExtrasBundle = {
  complianceItems: ComplianceItemDTO[];
  ipAllowlist: IpAllowlistRuleDTO[];
  sessions: AdminSessionDTO[];
};

export function useProviderSecurityExtras() {
  return useQuery({
    queryKey: providerKeys.securityExtras,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderSecurityExtrasBundle>>('/provider/security/extras')
        .then((res) => res.data),
  });
}

/* ── OAuth Apps ── */
export type OAuthAppDTO = {
  id: string;
  name: string;
  clientId: string;
  redirectUris: string[];
  scopes: string[];
  status: string;
  createdAt: string;
  requestCount: number;
};

export function useProviderOAuthApps() {
  return useQuery({
    queryKey: providerKeys.oauthApps,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<OAuthAppDTO[]>>('/provider/integrations/oauth-apps')
        .then((res) => res.data),
  });
}

/* ── Scheduled Reports ── */
export type ScheduledReportDTO = {
  id: string;
  name: string;
  type: string;
  frequency: string;
  lastRun: string;
  recipients: string[];
  format: string;
  status: string;
};

export function useProviderReports() {
  return useQuery({
    queryKey: providerKeys.reports,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ScheduledReportDTO[]>>('/provider/analytics/reports')
        .then((res) => res.data),
  });
}

/* ── DataOps extras ── */
export type RepairJobDTO = {
  id: string;
  name: string;
  target: string;
  status: string;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  recordsFixed: number;
};

export type CompatCheckDTO = {
  id: string;
  component: string;
  current: string;
  latest: string;
  compatible: boolean;
  severity: string;
  checkedAt: string;
};

export type ProviderDataOpsExtrasBundle = {
  repairJobs: RepairJobDTO[];
  compatibilityChecks: CompatCheckDTO[];
};

export function useProviderDataOpsExtras() {
  return useQuery({
    queryKey: providerKeys.dataOpsExtras,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderDataOpsExtrasBundle>>('/provider/data-ops/extras')
        .then((res) => res.data),
  });
}

/* ── Maintenance Windows ── */
export type MaintenanceWindowDTO = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
  affectedServices: string[];
  notified: boolean;
};

export function useProviderMaintenanceWindows() {
  return useQuery({
    queryKey: providerKeys.maintenance,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<MaintenanceWindowDTO[]>>('/provider/incidents/maintenance')
        .then((res) => res.data),
  });
}

/* ── Releases ── */
export type ReleaseDTO = {
  id: string;
  version: string;
  status: string;
  date: string;
  environment: string;
  rolloutPercent: number;
  changes: number;
};

export type ReleaseNoteDTO = {
  id: string;
  version: string;
  date: string;
  highlights: string[];
  changelog: Array<{ category: string; items: string[] }>;
};

export type ProviderReleasesBundle = {
  releases: ReleaseDTO[];
  releaseNotes: ReleaseNoteDTO[];
};

export function useProviderReleases() {
  return useQuery({
    queryKey: providerKeys.releases,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<ProviderReleasesBundle>>('/provider/releases')
        .then((res) => res.data),
  });
}

/* ── Onboarding Wizard ── */
export type OnboardingWizardPayload = {
  schoolName: string;
  domain: string;
  country: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  planCode: string;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  enabledModules: string[];
  skipMigration: boolean;
  agreedToTerms: boolean;
};

export type OnboardingWizardResult = {
  tenantId: string;
  status: string;
  message: string;
};

export function useLaunchOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OnboardingWizardPayload) =>
      api
        .post<ApiSuccessResponse<OnboardingWizardResult>>('/provider/onboarding/launch', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ── Audit Exports ── */
export type AuditExportDTO = {
  id: string;
  name: string;
  format: string;
  dateRange: string;
  records: number;
  size: string;
  status: string;
  createdAt: string;
  downloadUrl: string | null;
};

export function useProviderAuditExports() {
  return useQuery({
    queryKey: providerKeys.auditExports,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<AuditExportDTO[]>>('/provider/audit/exports')
        .then((res) => res.data),
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* DECORATIVE→FUNCTIONAL: Missing Mutation Hooks                   */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ── Usage: Generate Export ── */
export function useCreateProviderUsageExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { reportType: string; dateRange: string; format: 'CSV' | 'JSON' | 'PDF' }) =>
      api
        .post<ApiSuccessResponse<{ id: string; downloadUrl: string | null; status: string }>>(
          '/provider/usage/exports',
          input,
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.usage });
    },
  });
}

/* ── Usage: Update / Create Limit Policy ── */
export function useUpdateProviderLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { limitId: string; softLimit: number; hardLimit: number; overageEnabled: boolean; blockPolicy: string; reason: string }) =>
      api
        .patch<ApiSuccessResponse<UsageLimitState>>(`/provider/limits/${input.limitId}`, {
          softLimit: input.softLimit,
          hardLimit: input.hardLimit,
          overageEnabled: input.overageEnabled,
          blockPolicy: input.blockPolicy,
          reason: input.reason,
        })
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.limits });
      qc.invalidateQueries({ queryKey: providerKeys.usage });
    },
  });
}

export function useCreateProviderLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { tenantId: string; metricType: string; softLimit: number; hardLimit: number; overageEnabled: boolean; blockPolicy: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<UsageLimitState>>('/provider/limits', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.limits });
      qc.invalidateQueries({ queryKey: providerKeys.usage });
    },
  });
}

/* ── Incidents: Schedule Maintenance Window ── */
export function useCreateProviderMaintenanceWindow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; startAt: string; endAt: string; affectedServices: string[]; notify: boolean; reason: string }) =>
      api
        .post<ApiSuccessResponse<MaintenanceWindowDTO>>('/provider/incidents/maintenance', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.maintenance });
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ── Releases: Create Release ── */
export function useCreateProviderRelease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { version: string; environment: string; changes: number; rolloutPercent: number; reason: string }) =>
      api
        .post<ApiSuccessResponse<ReleaseDTO>>('/provider/releases', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.releases });
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ── Releases: Create Feature Flag ── */
export function useCreateProviderFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; targeting: string; rolloutPercent: number; enabled: boolean; reason: string }) =>
      api
        .post<ApiSuccessResponse<FeatureFlagRuleDTO>>('/provider/flags', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ── Templates: Create Template ── */
export function useCreateProviderTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description: string; modules: string[]; maxStudents: number; storageGb: number; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>('/provider/templates', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ── Integrations: Add Connector ── */
export function useCreateProviderConnector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; type: string; endpoint: string; authType: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>('/provider/integrations/connectors', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ── Integrations: Retry Failed Delivery ── */
export function useRetryProviderIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { logId: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>(
          `/provider/integrations/logs/${input.logId}/retry`,
          { reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ── Integrations: Register OAuth App ── */
export function useCreateProviderOAuthApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; redirectUris: string[]; scopes: string[]; reason: string }) =>
      api
        .post<ApiSuccessResponse<OAuthAppDTO>>('/provider/integrations/oauth-apps', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.oauthApps });
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ── Security: Generate API Key ── */
export function useGenerateProviderApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; scopes: string[]; reason: string }) =>
      api
        .post<ApiSuccessResponse<ApiKeyDTO>>('/provider/api-management/keys', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.apiMgmt });
    },
  });
}

/* ── Security: Rotate API Key ── */
export function useRotateProviderApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { keyId: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<ApiKeyDTO>>(
          `/provider/api-management/keys/${input.keyId}/rotate`,
          { reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.apiMgmt });
    },
  });
}

/* ── Security: Revoke API Key ── */
export function useRevokeProviderApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { keyId: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<ApiKeyDTO>>(
          `/provider/api-management/keys/${input.keyId}/revoke`,
          { reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.apiMgmt });
    },
  });
}

/* ── Security: Add IP Allowlist Rule ── */
export function useAddProviderIpRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { cidr: string; label: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<IpAllowlistRuleDTO>>('/provider/security/ip-allowlist', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.securityExtras });
    },
  });
}

/* ── Security: Remove IP Allowlist Rule ── */
export function useRemoveProviderIpRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { ruleId: string; reason: string }) =>
      api
        .request<ApiSuccessResponse<Record<string, unknown>>>(
          `/provider/security/ip-allowlist/${input.ruleId}`,
          { method: 'DELETE', body: { reason: input.reason } },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.securityExtras });
    },
  });
}

/* ── Security: Revoke Session ── */
export function useRevokeProviderSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { sessionId: string; reason: string } | { all: true; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>(
          '/provider/security/sessions/revoke',
          input,
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.securityExtras });
    },
  });
}

/* ── Integrations: Add Webhook ── */
export function useCreateProviderWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { url: string; events: string[]; reason: string }) =>
      api
        .post<ApiSuccessResponse<WebhookEndpointDTO>>('/provider/api-management/webhooks', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.apiMgmt });
    },
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* REMAINING AUDIT: Full Wiring Mutations                          */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ── Settings: Update Defaults / Notification Rules / SLA / CSS ── */
export function useUpdateProviderSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { section: string; payload: Record<string, unknown>; reason: string }) =>
      api
        .patch<ApiSuccessResponse<ProviderSettingsBundle>>('/provider/settings', {
          section: input.section,
          ...input.payload,
          reason: input.reason,
        })
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.settings });
    },
  });
}

/* ── Settings: Create Legal Template ── */
export function useCreateProviderLegalTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; content: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<{ id: string; name: string; version: string }>>('/provider/settings/legal-templates', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.settings });
    },
  });
}

/* ── Settings: Update Legal Template ── */
export function useUpdateProviderLegalTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { templateId: string; name?: string; content?: string; reason: string }) =>
      api
        .patch<ApiSuccessResponse<{ id: string; name: string; version: string }>>(
          `/provider/settings/legal-templates/${input.templateId}`,
          { name: input.name, content: input.content, reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.settings });
    },
  });
}

/* ── Settings: Create Email Template ── */
export function useCreateProviderEmailTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; trigger: string; subject: string; body: string; variables: string[]; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>('/provider/settings/email-templates', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.settings });
    },
  });
}

/* ── Settings: Update Email Template ── */
export function useUpdateProviderEmailTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { templateId: string; name?: string; subject?: string; body?: string; status?: string; reason: string }) =>
      api
        .patch<ApiSuccessResponse<Record<string, unknown>>>(
          `/provider/settings/email-templates/${input.templateId}`,
          { name: input.name, subject: input.subject, body: input.body, status: input.status, reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.settings });
    },
  });
}

/* ── Settings: Apply Appearance Theme ── */
export function useApplyProviderTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { themeName: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>('/provider/settings/themes/apply', {
          themeName: input.themeName,
          reason: input.reason,
        })
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.settings });
    },
  });
}

/* ── Settings: Save Custom CSS ── */
export function useSaveProviderCustomCss() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { css: string; reason: string }) =>
      api
        .patch<ApiSuccessResponse<Record<string, unknown>>>('/provider/settings/custom-css', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.settings });
    },
  });
}

/* ── Team: Invite Member ── */
export function useInviteProviderTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; firstName: string; lastName: string; roleKey: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>('/provider/team/invite', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ── Team: Remove Member ── */
export function useRemoveProviderTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; reason: string }) =>
      api
        .request<ApiSuccessResponse<Record<string, unknown>>>(
          `/provider/team/${input.userId}`,
          { method: 'DELETE', body: { reason: input.reason } },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ── Team: Create Role ── */
export function useCreateProviderRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; key: string; permissions: string[]; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>('/provider/team/roles', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ── Team: Update Shift ── */
export function useUpdateProviderShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; day: string; shiftType: 'ON_DUTY' | 'ON_CALL' | 'OFF'; reason: string }) =>
      api
        .patch<ApiSuccessResponse<Record<string, unknown>>>('/provider/team/shifts', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
    },
  });
}

/* ── Audit: Create Export ── */
export function useCreateProviderAuditExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { format: 'CSV' | 'JSON' | 'PDF'; dateRange: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<AuditExportDTO>>('/provider/audit/exports', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.auditExports });
    },
  });
}

/* ── Analytics: Export Report ── */
export function useExportProviderAnalyticsReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { type: string; format: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<{ downloadUrl: string }>>('/provider/analytics/export', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.reports });
    },
  });
}

/* ── Analytics: Create Scheduled Report ── */
export function useCreateProviderScheduledReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; type: string; frequency: string; format: string; recipients: string[]; reason: string }) =>
      api
        .post<ApiSuccessResponse<ScheduledReportDTO>>('/provider/analytics/reports', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.reports });
    },
  });
}

/* ── Analytics: Run Report Now ── */
export function useRunProviderReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { reportId: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<{ downloadUrl: string }>>(
          `/provider/analytics/reports/${input.reportId}/run`,
          { reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.reports });
    },
  });
}

/* ── Comms: Create Announcement ── */
export function useCreateProviderAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; body: string; audience: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<AnnouncementDTO>>('/provider/comms/announcements', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.comms });
    },
  });
}

/* ── Comms: Send Message ── */
export function useSendProviderMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { threadId?: string; tenant?: string; subject?: string; body: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>('/provider/comms/messages', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.comms });
    },
  });
}

/* ── Comms: Create Template ── */
export function useCreateProviderCommsTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; type: string; subject: string; body: string; variables: string[]; reason: string }) =>
      api
        .post<ApiSuccessResponse<CommsTemplateDTO>>('/provider/comms/templates', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.comms });
    },
  });
}

/* ── Comms: Update Template ── */
export function useUpdateProviderCommsTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { templateId: string; name?: string; subject?: string; body?: string; reason: string }) =>
      api
        .patch<ApiSuccessResponse<CommsTemplateDTO>>(
          `/provider/comms/templates/${input.templateId}`,
          { name: input.name, subject: input.subject, body: input.body, reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.comms });
    },
  });
}

/* ── Notifications: Create Rule ── */
export function useCreateProviderNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; event: string; channel: string; enabled: boolean; reason: string }) =>
      api
        .post<ApiSuccessResponse<NotificationRuleDTO>>('/provider/notifications/rules', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.notifications });
    },
  });
}

/* ── Notifications: Update Rule ── */
export function useUpdateProviderNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { ruleId: string; name?: string; event?: string; channel?: string; enabled?: boolean; reason: string }) =>
      api
        .patch<ApiSuccessResponse<NotificationRuleDTO>>(
          `/provider/notifications/rules/${input.ruleId}`,
          { name: input.name, event: input.event, channel: input.channel, enabled: input.enabled, reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.notifications });
    },
  });
}

/* ── Branding: Create Theme ── */
export function useCreateProviderBrandTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; primary: string; secondary: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<BrandThemeDTO>>('/provider/branding/themes', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.branding });
    },
  });
}

/* ── Branding: Update Theme ── */
export function useUpdateProviderBrandTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { themeId: string; name?: string; primary?: string; secondary?: string; active?: boolean; reason: string }) =>
      api
        .patch<ApiSuccessResponse<BrandThemeDTO>>(
          `/provider/branding/themes/${input.themeId}`,
          { name: input.name, primary: input.primary, secondary: input.secondary, active: input.active, reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.branding });
    },
  });
}

/* ── Branding: Add Domain ── */
export function useAddProviderDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { domain: string; type: string; tenant?: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<BrandDomainDTO>>('/provider/branding/domains', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.branding });
    },
  });
}

/* ── Branding: Verify Domain ── */
export function useVerifyProviderDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { domainId: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<BrandDomainDTO>>(
          `/provider/branding/domains/${input.domainId}/verify`,
          { reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.branding });
    },
  });
}

/* ── Branding: Create Login Page ── */
export function useCreateProviderLoginPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; tenant: string; logo: boolean; customCss: boolean; sso: boolean; mfa: boolean; reason: string }) =>
      api
        .post<ApiSuccessResponse<BrandLoginPageDTO>>('/provider/branding/login-pages', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.branding });
    },
  });
}

/* ── Branding: Update Login Page ── */
export function useUpdateProviderLoginPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { pageId: string; name?: string; logo?: boolean; customCss?: boolean; sso?: boolean; mfa?: boolean; reason: string }) =>
      api
        .patch<ApiSuccessResponse<BrandLoginPageDTO>>(
          `/provider/branding/login-pages/${input.pageId}`,
          { name: input.name, logo: input.logo, customCss: input.customCss, sso: input.sso, mfa: input.mfa, reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.branding });
    },
  });
}

/* ── API Mgmt: Update Webhook ── */
export function useUpdateProviderApiWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { webhookId: string; url?: string; events?: string[]; status?: string; reason: string }) =>
      api
        .patch<ApiSuccessResponse<WebhookEndpointDTO>>(
          `/provider/api-management/webhooks/${input.webhookId}`,
          { url: input.url, events: input.events, status: input.status, reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.apiMgmt });
    },
  });
}

/* ── API Mgmt: Test Webhook ── */
export function useTestProviderApiWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { webhookId: string }) =>
      api
        .post<ApiSuccessResponse<{ success: boolean; statusCode: number }>>(
          `/provider/api-management/webhooks/${input.webhookId}/test`,
          {},
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.apiMgmt });
    },
  });
}

/* ── API Mgmt: Update Rate Limit ── */
export function useUpdateProviderRateLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { endpoint: string; method: string; limit: string; burst: number; reason: string }) =>
      api
        .patch<ApiSuccessResponse<RateLimitRuleDTO>>('/provider/api-management/rate-limits', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.apiMgmt });
    },
  });
}

/* ── Backup: Create Schedule ── */
export function useCreateProviderBackupSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; frequency: string; retention: string; tenants: number; reason: string }) =>
      api
        .post<ApiSuccessResponse<BackupScheduleDTO>>('/provider/backups/schedules', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.backups });
    },
  });
}

/* ── Backup: Trigger Run Now ── */
export function useTriggerProviderBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { scheduleId: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>(
          `/provider/backups/schedules/${input.scheduleId}/run`,
          { reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.backups });
    },
  });
}

/* ── Backup: Update Schedule ── */
export function useUpdateProviderBackupSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { scheduleId: string; frequency?: string; retention?: string; reason: string }) =>
      api
        .patch<ApiSuccessResponse<BackupScheduleDTO>>(
          `/provider/backups/schedules/${input.scheduleId}`,
          { frequency: input.frequency, retention: input.retention, reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.backups });
    },
  });
}

/* ── Backup: Restore Snapshot ── */
export function useRestoreProviderSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { snapshotId: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>(
          `/provider/backups/snapshots/${input.snapshotId}/restore`,
          { reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.backups });
    },
  });
}

/* ── Backup: Create Runbook ── */
export function useCreateProviderRunbook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description: string; severity: string; steps: number; estimatedTime: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<RunbookDTO>>('/provider/backups/runbooks', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.backups });
    },
  });
}

/* ── Backup: Execute Runbook ── */
export function useExecuteProviderRunbook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { runbookId: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>(
          `/provider/backups/runbooks/${input.runbookId}/execute`,
          { reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.backups });
    },
  });
}

/* ── DataOps: Start Import ── */
export function useStartProviderDataImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { type: 'CSV' | 'MIGRATION'; tenantId?: string; config: Record<string, unknown>; reason: string }) =>
      api
        .post<ApiSuccessResponse<Record<string, unknown>>>('/provider/data-ops/imports', input)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.root });
      qc.invalidateQueries({ queryKey: providerKeys.dataOpsExtras });
    },
  });
}

/* ── DataOps: Run Repair Job ── */
export function useRunProviderRepairJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { jobId: string; reason: string }) =>
      api
        .post<ApiSuccessResponse<RepairJobDTO>>(
          `/provider/data-ops/repair/${input.jobId}/run`,
          { reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.dataOpsExtras });
    },
  });
}

/* ── Support: Update Macro ── */
export function useUpdateProviderMacro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { macroId: string; name?: string; category?: string; template?: string; reason: string }) =>
      api
        .patch<ApiSuccessResponse<SupportMacroDTO>>(
          `/provider/support/macros/${input.macroId}`,
          { name: input.name, category: input.category, template: input.template, reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.supportExtras });
    },
  });
}

/* ── Support: Update KB Article ── */
export function useUpdateProviderKbArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { articleId: string; title?: string; category?: string; status?: string; reason: string }) =>
      api
        .patch<ApiSuccessResponse<KbArticleDTO>>(
          `/provider/support/kb/${input.articleId}`,
          { title: input.title, category: input.category, status: input.status, reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.supportExtras });
    },
  });
}

/* ── Integrations: Update Webhook ── */
export function useUpdateProviderIntegrationWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { webhookId: string; url?: string; events?: string[]; status?: string; reason: string }) =>
      api
        .patch<ApiSuccessResponse<WebhookEndpointDTO>>(
          `/provider/integrations/webhooks/${input.webhookId}`,
          { url: input.url, events: input.events, status: input.status, reason: input.reason },
        )
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.apiMgmt });
    },
  });
}
