import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type {
  ApiSuccessResponse,
  Tenant,
  TenantStats,
  BulkImportResult,
  InviteResult,
  PlatformPlan,
  PlatformInvoice,
  PlatformInvoiceStats,
  PaymentGateway,
} from '@root/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const tenantKeys = {
  all: ['tenants'] as const,
  list: (type?: string, search?: string, page?: number) =>
    ['tenants', 'list', type, search, page] as const,
  detail: (id: string) => ['tenants', id] as const,
  stats: (type?: string) => ['tenants', 'stats', type] as const,
  plans: ['tenants', 'plans'] as const,
  invoices: (search?: string, status?: string, page?: number) =>
    ['tenants', 'invoices', search, status, page] as const,
  invoiceStats: ['tenants', 'invoice-stats'] as const,
  gateways: ['tenants', 'gateways'] as const,
};

// ---------------------------------------------------------------------------
// Tenant Hooks
// ---------------------------------------------------------------------------

interface TenantListResponse {
  success: true;
  data: Tenant[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface GeocodeBoundingBox {
  south: number;
  north: number;
  west: number;
  east: number;
}

export interface GeocodeSchoolAddressResult {
  latitude: number;
  longitude: number;
  displayName: string;
  boundingBox: GeocodeBoundingBox;
}

export function useTenants(type?: string, search?: string, page = 1) {
  return useQuery({
    queryKey: tenantKeys.list(type, search, page),
    queryFn: () => {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      if (search) params.set('search', search);
      params.set('page', String(page));
      return api.get<TenantListResponse>(`/tenants?${params}`).then((r) => r);
    },
  });
}

export function useTenant(id: string | null) {
  return useQuery({
    queryKey: tenantKeys.detail(id!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Tenant>>(`/tenants/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useTenantStats(type?: string) {
  return useQuery({
    queryKey: tenantKeys.stats(type),
    queryFn: () => {
      const params = type ? `?type=${type}` : '';
      return api
        .get<ApiSuccessResponse<TenantStats>>(`/tenants/stats${params}`)
        .then((r) => r.data);
    },
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      type: 'SCHOOL' | 'INDIVIDUAL';
      email: string;
      phone?: string;
      plan?: string;
      mrr?: number;
      userCount?: number;
      status?: string;
      notes?: string;
      address?: string;
      website?: string;
      latitude?: number;
      longitude?: number;
    }) => api.post<ApiSuccessResponse<Tenant>>('/tenants', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useGeocodeSchoolAddress() {
  return useMutation({
    mutationFn: (query: string) =>
      api
        .get<ApiSuccessResponse<GeocodeSchoolAddressResult>>(`/tenants/geocode?query=${encodeURIComponent(query)}`)
        .then((r) => r.data),
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Tenant>) =>
      api.patch<ApiSuccessResponse<Tenant>>(`/tenants/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<ApiSuccessResponse<null>>(`/tenants/${id}`).then((r) => r),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useSuspendTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ApiSuccessResponse<Tenant>>(`/tenants/${id}/suspend`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useBulkImportTenants() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      tenants: Array<{
        name: string;
        type: 'SCHOOL' | 'INDIVIDUAL';
        email: string;
        phone?: string;
        plan?: string;
        mrr?: number;
        userCount?: number;
        status?: string;
      }>,
    ) =>
      api
        .post<ApiSuccessResponse<BulkImportResult>>('/tenants/bulk-import', { tenants })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useExportTenantsCsv() {
  return useMutation({
    mutationFn: async (type?: string) => {
      const params = type ? `?type=${type}` : '';
      const res = await fetch(`/api/tenants/export${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tenants-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useSendInvites() {
  return useMutation({
    mutationFn: (data: { tenantIds: string[]; message?: string }) =>
      api
        .post<ApiSuccessResponse<InviteResult>>('/tenants/send-invites', data)
        .then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// Platform Plan Hooks
// ---------------------------------------------------------------------------

export function usePlatformPlans() {
  return useQuery({
    queryKey: tenantKeys.plans,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<PlatformPlan[]>>('/tenants/plans/all')
        .then((r) => r.data),
  });
}

export function useCreatePlatformPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      price: number;
      maxUsers?: number;
      features?: string[];
      isActive?: boolean;
    }) =>
      api
        .post<ApiSuccessResponse<PlatformPlan>>('/tenants/plans', data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.plans });
    },
  });
}

// ---------------------------------------------------------------------------
// Platform Invoice Hooks
// ---------------------------------------------------------------------------

interface InvoiceListResponse {
  success: true;
  data: PlatformInvoice[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export function usePlatformInvoices(search?: string, status?: string, page = 1) {
  return useQuery({
    queryKey: tenantKeys.invoices(search, status, page),
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      params.set('page', String(page));
      return api
        .get<InvoiceListResponse>(`/tenants/invoices/all?${params}`)
        .then((r) => r);
    },
  });
}

export function usePlatformInvoiceStats() {
  return useQuery({
    queryKey: tenantKeys.invoiceStats,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<PlatformInvoiceStats>>('/tenants/invoices/stats')
        .then((r) => r.data),
  });
}

export function useCreatePlatformInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      tenantId: string;
      amount: number;
      dueDate: string;
      method?: string;
    }) =>
      api
        .post<ApiSuccessResponse<PlatformInvoice>>('/tenants/invoices', data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.invoices() });
      qc.invalidateQueries({ queryKey: tenantKeys.invoiceStats });
    },
  });
}

export function useMarkInvoicePaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api
        .patch<ApiSuccessResponse<PlatformInvoice>>(`/tenants/invoices/${id}/mark-paid`)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.invoices() });
      qc.invalidateQueries({ queryKey: tenantKeys.invoiceStats });
    },
  });
}

// ---------------------------------------------------------------------------
// Payment Gateway Hooks
// ---------------------------------------------------------------------------

export function usePaymentGateways() {
  return useQuery({
    queryKey: tenantKeys.gateways,
    queryFn: () =>
      api
        .get<ApiSuccessResponse<PaymentGateway[]>>('/tenants/gateways/all')
        .then((r) => r.data),
  });
}

export function useCreatePaymentGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; apiKey?: string; webhookUrl?: string; color?: string }) =>
      api
        .post<ApiSuccessResponse<PaymentGateway>>('/tenants/gateways', data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.gateways });
    },
  });
}

export function useUpdatePlatformPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; price?: number; maxUsers?: number; features?: string[]; isActive?: boolean }) =>
      api.patch<ApiSuccessResponse<PlatformPlan>>(`/tenants/plans/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.plans });
    },
  });
}

export function useDeletePlatformPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<ApiSuccessResponse<null>>(`/tenants/plans/${id}`).then((r) => r),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.plans });
    },
  });
}

export function useDeletePlatformInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<ApiSuccessResponse<null>>(`/tenants/invoices/${id}`).then((r) => r),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.invoices() });
      qc.invalidateQueries({ queryKey: tenantKeys.invoiceStats });
    },
  });
}

export function useUpdatePaymentGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; apiKey?: string; webhookUrl?: string; color?: string }) =>
      api.patch<ApiSuccessResponse<PaymentGateway>>(`/tenants/gateways/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.gateways });
    },
  });
}

export function useDeletePaymentGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<ApiSuccessResponse<null>>(`/tenants/gateways/${id}`).then((r) => r),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.gateways });
    },
  });
}
