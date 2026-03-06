/* ─── Settings API Hooks ─── React Query powered ─────────────────── */
import { useCallback } from 'react';
import {
  useQuery as useRQ,
  useMutation as useRQMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/api/client';
import type { ApiSuccessResponse } from '@root/types';

const BASE = '/settings';

// ═══════════════════════════════════════════════════════════════════
// Query keys
// ═══════════════════════════════════════════════════════════════════

export const settingsKeys = {
  all: ['settings'] as const,
  config: (group?: string) => ['settings', 'config', group ?? ''] as const,
  flags: (archived?: boolean) => ['settings', 'flags', String(archived)] as const,
  abTests: (status?: string) => ['settings', 'ab-tests', status ?? ''] as const,
  integrations: (cat?: string) => ['settings', 'integrations', cat ?? ''] as const,
  webhooks: ['settings', 'webhooks'] as const,
  apiKeys: ['settings', 'api-keys'] as const,
  ipRules: (type?: string) => ['settings', 'ip-rules', type ?? ''] as const,
  roles: ['settings', 'roles'] as const,
  authSettings: (cat?: string) => ['settings', 'auth-settings', cat ?? ''] as const,
  auditLog: (page: number, pageSize: number) => ['settings', 'audit-log', page, pageSize] as const,
  legal: (cat?: string) => ['settings', 'legal', cat ?? ''] as const,
  compliance: ['settings', 'compliance'] as const,
  notifications: ['settings', 'notifications'] as const,
};

// ═══════════════════════════════════════════════════════════════════
// Internal helpers — preserve legacy { data, loading, error, refetch } surface
// ═══════════════════════════════════════════════════════════════════

function useSettingsQuery<T>(key: readonly unknown[], path: string) {
  const query = useRQ({
    queryKey: key,
    queryFn: () => api.get<ApiSuccessResponse<T>>(`${BASE}${path}`).then((r) => r.data),
  });
  return {
    data: query.data ?? ([] as unknown as T),
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    setData: undefined as never, // legacy field — no-op under React Query
  };
}

function useSettingsMutation<B = unknown>(
  method: 'post' | 'put' | 'patch' | 'del',
  path: string,
  invalidateKey?: readonly unknown[],
) {
  const qc = useQueryClient();
  const mutation = useRQMutation({
    mutationFn: async ({ body, pathSuffix = '' }: { body?: B; pathSuffix?: string }) => {
      const url = `${BASE}${path}${pathSuffix}`;
      if (method === 'del') return api.del<ApiSuccessResponse<unknown>>(url);
      return api[method]<ApiSuccessResponse<unknown>>(url, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invalidateKey ?? settingsKeys.all });
    },
  });

  const mutate = useCallback(
    (body?: B, pathSuffix?: string) => mutation.mutateAsync({ body, pathSuffix }),
    [mutation],
  );

  return { mutate, loading: mutation.isPending, error: mutation.error?.message ?? null };
}

// ═══════════════════════════════════════════════════════════════════
// Platform Config
// ═══════════════════════════════════════════════════════════════════

export interface PlatformConfigItem {
  id: string;
  key: string;
  value: string;
  type: string;
  label: string;
  group: string;
  createdAt: string;
  updatedAt: string;
}

export function usePlatformConfigs(group?: string) {
  return useSettingsQuery<PlatformConfigItem[]>(
    settingsKeys.config(group),
    group ? `/config?group=${group}` : '/config',
  );
}

export function useUpsertConfig() {
  return useSettingsMutation<Partial<PlatformConfigItem>>('put', '/config', settingsKeys.config());
}

export function useBulkUpsertConfig() {
  return useSettingsMutation<{ configs: Partial<PlatformConfigItem>[] }>('put', '/config/bulk', settingsKeys.config());
}

export function useDeleteConfig() {
  return useSettingsMutation('del', '/config', settingsKeys.config());
}

// ═══════════════════════════════════════════════════════════════════
// Feature Flags
// ═══════════════════════════════════════════════════════════════════

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  rollout: number;
  environment: string;
  archived: boolean;
  archivedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function useFeatureFlags(archived = false) {
  return useSettingsQuery<FeatureFlag[]>(
    settingsKeys.flags(archived),
    `/flags?archived=${archived}`,
  );
}

export function useCreateFlag() {
  return useSettingsMutation<Partial<FeatureFlag>>('post', '/flags', settingsKeys.flags());
}

export function useUpdateFlag() {
  return useSettingsMutation<Partial<FeatureFlag>>('patch', '/flags', settingsKeys.flags());
}

export function useToggleFlag() {
  return useSettingsMutation('patch', '/flags', settingsKeys.flags());
}

export function useDeleteFlag() {
  return useSettingsMutation('del', '/flags', settingsKeys.flags());
}

// ═══════════════════════════════════════════════════════════════════
// A/B Tests
// ═══════════════════════════════════════════════════════════════════

export interface ABTest {
  id: string;
  name: string;
  key: string;
  variants: number;
  traffic: string;
  status: string;
  winner: string | null;
  startDate: string;
  endDate: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function useABTests(status?: string) {
  return useSettingsQuery<ABTest[]>(
    settingsKeys.abTests(status),
    status ? `/ab-tests?status=${status}` : '/ab-tests',
  );
}

export function useCreateABTest() {
  return useSettingsMutation<Partial<ABTest>>('post', '/ab-tests', settingsKeys.abTests());
}

export function useUpdateABTest() {
  return useSettingsMutation<Partial<ABTest>>('patch', '/ab-tests', settingsKeys.abTests());
}

export function useDeleteABTest() {
  return useSettingsMutation('del', '/ab-tests', settingsKeys.abTests());
}

// ═══════════════════════════════════════════════════════════════════
// Integrations
// ═══════════════════════════════════════════════════════════════════

export interface Integration {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: string;
  config: Record<string, unknown>;
  description: string;
  lastCheckAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useIntegrations(category?: string) {
  return useSettingsQuery<Integration[]>(
    settingsKeys.integrations(category),
    category ? `/integrations?category=${category}` : '/integrations',
  );
}

export function useCreateIntegration() {
  return useSettingsMutation<Partial<Integration>>('post', '/integrations', settingsKeys.integrations());
}

export function useUpdateIntegration() {
  return useSettingsMutation<Partial<Integration>>('patch', '/integrations', settingsKeys.integrations());
}

export function useDeleteIntegration() {
  return useSettingsMutation('del', '/integrations', settingsKeys.integrations());
}

// ═══════════════════════════════════════════════════════════════════
// Webhooks
// ═══════════════════════════════════════════════════════════════════

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string;
  secret: string;
  status: string;
  lastCallAt: string | null;
  lastStatus: number | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function useWebhooks() {
  return useSettingsQuery<WebhookEndpoint[]>(settingsKeys.webhooks, '/webhooks');
}

export function useCreateWebhook() {
  return useSettingsMutation<Partial<WebhookEndpoint>>('post', '/webhooks', settingsKeys.webhooks);
}

export function useUpdateWebhook() {
  return useSettingsMutation<Partial<WebhookEndpoint>>('patch', '/webhooks', settingsKeys.webhooks);
}

export function useDeleteWebhook() {
  return useSettingsMutation('del', '/webhooks', settingsKeys.webhooks);
}

// ═══════════════════════════════════════════════════════════════════
// API Keys
// ═══════════════════════════════════════════════════════════════════

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdBy: string;
  createdAt: string;
}

export function useApiKeys() {
  return useSettingsQuery<ApiKeyRecord[]>(settingsKeys.apiKeys, '/api-keys');
}

export function useCreateApiKey() {
  return useSettingsMutation<{ name: string; scopes: string[]; expiresAt?: string }>('post', '/api-keys', settingsKeys.apiKeys);
}

export function useRevokeApiKey() {
  return useSettingsMutation('patch', '/api-keys', settingsKeys.apiKeys);
}

// ═══════════════════════════════════════════════════════════════════
// IP Rules
// ═══════════════════════════════════════════════════════════════════

export interface IpRule {
  id: string;
  ip: string;
  label: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export function useIpRules(type?: string) {
  return useSettingsQuery<IpRule[]>(
    settingsKeys.ipRules(type),
    type ? `/ip-rules?type=${type}` : '/ip-rules',
  );
}

export function useCreateIpRule() {
  return useSettingsMutation<Partial<IpRule>>('post', '/ip-rules', settingsKeys.ipRules());
}

export function useDeleteIpRule() {
  return useSettingsMutation('del', '/ip-rules', settingsKeys.ipRules());
}

// ═══════════════════════════════════════════════════════════════════
// Platform Roles
// ═══════════════════════════════════════════════════════════════════

export interface PlatformRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export function usePlatformRoles() {
  return useSettingsQuery<PlatformRole[]>(settingsKeys.roles, '/roles');
}

export function useCreateRole() {
  return useSettingsMutation<Partial<PlatformRole>>('post', '/roles', settingsKeys.roles);
}

export function useUpdateRole() {
  return useSettingsMutation<Partial<PlatformRole>>('patch', '/roles', settingsKeys.roles);
}

export function useDeleteRole() {
  return useSettingsMutation('del', '/roles', settingsKeys.roles);
}

// ═══════════════════════════════════════════════════════════════════
// Auth Settings
// ═══════════════════════════════════════════════════════════════════

export interface AuthSetting {
  id: string;
  key: string;
  value: unknown;
  label: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export function useAuthSettings(category?: string) {
  return useSettingsQuery<AuthSetting[]>(
    settingsKeys.authSettings(category),
    category ? `/auth-settings?category=${category}` : '/auth-settings',
  );
}

export function useUpsertAuthSetting() {
  return useSettingsMutation<Partial<AuthSetting>>('put', '/auth-settings', settingsKeys.authSettings());
}

// ═══════════════════════════════════════════════════════════════════
// Audit Log
// ═══════════════════════════════════════════════════════════════════

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  user: { firstName: string; lastName: string; email: string };
}

export interface AuditLogMeta { total: number; page: number; pageSize: number; totalPages: number }

export function useAuditLog(page = 1, pageSize = 50) {
  const query = useRQ({
    queryKey: settingsKeys.auditLog(page, pageSize),
    queryFn: () => api.get<{ success: boolean; data: AuditLogEntry[]; meta: AuditLogMeta }>(
      `${BASE}/audit-log?page=${page}&pageSize=${pageSize}`,
    ),
  });

  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta ?? { total: 0, page: 1, pageSize: 50, totalPages: 0 },
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Legal Documents
// ═══════════════════════════════════════════════════════════════════

export interface LegalDocument {
  id: string;
  title: string;
  body: string;
  category: string;
  version: string;
  status: string;
  publishedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function useLegalDocs(category?: string) {
  return useSettingsQuery<LegalDocument[]>(
    settingsKeys.legal(category),
    category ? `/legal?category=${category}` : '/legal',
  );
}

export function useCreateLegalDoc() {
  return useSettingsMutation<Partial<LegalDocument>>('post', '/legal', settingsKeys.legal());
}

export function useUpdateLegalDoc() {
  return useSettingsMutation<Partial<LegalDocument>>('patch', '/legal', settingsKeys.legal());
}

export function useDeleteLegalDoc() {
  return useSettingsMutation('del', '/legal', settingsKeys.legal());
}

// ═══════════════════════════════════════════════════════════════════
// Compliance Certs
// ═══════════════════════════════════════════════════════════════════

export interface ComplianceCert {
  id: string;
  name: string;
  description: string;
  status: string;
  auditDate: string | null;
  expiresAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function useComplianceCerts() {
  return useSettingsQuery<ComplianceCert[]>(settingsKeys.compliance, '/compliance');
}

export function useCreateComplianceCert() {
  return useSettingsMutation<Partial<ComplianceCert>>('post', '/compliance', settingsKeys.compliance);
}

export function useUpdateComplianceCert() {
  return useSettingsMutation<Partial<ComplianceCert>>('patch', '/compliance', settingsKeys.compliance);
}

export function useDeleteComplianceCert() {
  return useSettingsMutation('del', '/compliance', settingsKeys.compliance);
}

// ═══════════════════════════════════════════════════════════════════
// Notification Rules
// ═══════════════════════════════════════════════════════════════════

export interface NotificationRule {
  id: string;
  event: string;
  label: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useNotificationRules() {
  return useSettingsQuery<NotificationRule[]>(settingsKeys.notifications, '/notifications');
}

export function useUpsertNotificationRule() {
  return useSettingsMutation<Partial<NotificationRule>>('put', '/notifications', settingsKeys.notifications);
}

export function useBatchNotificationRules() {
  return useSettingsMutation<{ rules: Array<{ event: string; email: boolean; push: boolean; inApp: boolean }> }>('put', '/notifications/batch', settingsKeys.notifications);
}
