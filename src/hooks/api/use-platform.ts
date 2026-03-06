import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { ApiSuccessResponse } from '@root/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const platformKeys = {
  integrations: (category?: string) => ['platform', 'integrations', category] as const,
  apiKeys: ['platform', 'api-keys'] as const,
  webhooks: ['platform', 'webhooks'] as const,
  auditLog: ['platform', 'audit-log'] as const,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlatformIntegration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  config: Record<string, unknown>;
  lastSyncAt: string | null;
  errorCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdBy: string;
  createdAt: string;
  rawKey?: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  meta: Record<string, unknown>;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Integration Hooks
// ---------------------------------------------------------------------------

export function useIntegrations(category?: string) {
  return useQuery({
    queryKey: platformKeys.integrations(category),
    queryFn: () =>
      api
        .get<ApiSuccessResponse<PlatformIntegration[]>>(
          `/settings/integrations${category ? `?category=${category}` : ''}`,
        )
        .then((r) => r.data),
  });
}

export function useCreateIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; category: string; config?: Record<string, unknown> }) =>
      api.post<ApiSuccessResponse<PlatformIntegration>>('/settings/integrations', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform', 'integrations'] }),
  });
}

export function useUpdateIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; status?: string; config?: Record<string, unknown> }) =>
      api.patch<ApiSuccessResponse<PlatformIntegration>>(`/settings/integrations/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform', 'integrations'] }),
  });
}

export function useDeleteIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/settings/integrations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform', 'integrations'] }),
  });
}

// ---------------------------------------------------------------------------
// API Key Hooks
// ---------------------------------------------------------------------------

export function useApiKeys() {
  return useQuery({
    queryKey: platformKeys.apiKeys,
    queryFn: () =>
      api.get<ApiSuccessResponse<ApiKeyRecord[]>>('/settings/api-keys').then((r) => r.data),
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; scopes?: string[]; expiresAt?: string }) =>
      api.post<ApiSuccessResponse<ApiKeyRecord>>('/settings/api-keys', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: platformKeys.apiKeys }),
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ApiSuccessResponse<ApiKeyRecord>>(`/settings/api-keys/${id}/revoke`, {}).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: platformKeys.apiKeys }),
  });
}

// ---------------------------------------------------------------------------
// Webhook Hooks
// ---------------------------------------------------------------------------

export function useWebhooks() {
  return useQuery({
    queryKey: platformKeys.webhooks,
    queryFn: () =>
      api.get<ApiSuccessResponse<WebhookEndpoint[]>>('/settings/webhooks').then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// Audit Log (used for API Logs view)
// ---------------------------------------------------------------------------

export function useAuditLog() {
  return useQuery({
    queryKey: platformKeys.auditLog,
    queryFn: () =>
      api.get<ApiSuccessResponse<AuditLogEntry[]>>('/settings/audit-log').then((r) => r.data),
  });
}
