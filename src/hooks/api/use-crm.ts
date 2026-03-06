/* ─── CRM API Hooks — Deals + Accounts ─── */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type {
  ApiSuccessResponse,
  CrmDeal,
  CrmDealStats,
  DealsByStage,
  CrmAccount,
} from '@root/types';

// ---------------------------------------------------------------------------
// Query-key factory
// ---------------------------------------------------------------------------
const crmKeys = {
  all:           ['crm'] as const,
  deals:         (search?: string, stage?: string, page?: number) => [...crmKeys.all, 'deals', { search, stage, page }] as const,
  deal:          (id: string) => [...crmKeys.all, 'deal', id] as const,
  dealStats:     ['crm', 'dealStats'] as const,
  dealsByStage:  ['crm', 'dealsByStage'] as const,
  accounts:      (search?: string, minHealth?: number, page?: number) => [...crmKeys.all, 'accounts', { search, minHealth, page }] as const,
};

// ---------------------------------------------------------------------------
// Deal queries
// ---------------------------------------------------------------------------

export function useCrmDeals(search?: string, stage?: string, page = 1) {
  return useQuery({
    queryKey: crmKeys.deals(search, stage, page),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (stage) params.set('stage', stage);
      params.set('page', String(page));
      const res = await api.get<ApiSuccessResponse<CrmDeal[]>>(`/crm/deals?${params}`);
      return res.data;
    },
  });
}

export function useCrmDeal(id: string | null) {
  return useQuery({
    queryKey: crmKeys.deal(id ?? ''),
    queryFn: async () => {
      const res = await api.get<ApiSuccessResponse<CrmDeal>>(`/crm/deals/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCrmDealStats() {
  return useQuery({
    queryKey: crmKeys.dealStats,
    queryFn: async () => {
      const res = await api.get<ApiSuccessResponse<CrmDealStats>>('/crm/deals/stats');
      return res.data;
    },
  });
}

export function useCrmDealsByStage() {
  return useQuery({
    queryKey: crmKeys.dealsByStage,
    queryFn: async () => {
      const res = await api.get<ApiSuccessResponse<DealsByStage[]>>('/crm/deals/by-stage');
      return res.data;
    },
  });
}

// ---------------------------------------------------------------------------
// Deal mutations
// ---------------------------------------------------------------------------

export function useCreateCrmDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<CrmDeal>) => {
      const res = await api.post<ApiSuccessResponse<CrmDeal>>('/crm/deals', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.all });
    },
  });
}

export function useUpdateCrmDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CrmDeal> & { id: string }) => {
      const res = await api.patch<ApiSuccessResponse<CrmDeal>>(`/crm/deals/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.all });
    },
  });
}

export function useDeleteCrmDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.del<ApiSuccessResponse<null>>(`/crm/deals/${id}`);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Account queries
// ---------------------------------------------------------------------------

export function useCrmAccounts(search?: string, minHealth?: number, page = 1) {
  return useQuery({
    queryKey: crmKeys.accounts(search, minHealth, page),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (minHealth !== undefined) params.set('minHealth', String(minHealth));
      params.set('page', String(page));
      const res = await api.get<ApiSuccessResponse<CrmAccount[]>>(`/crm/accounts?${params}`);
      return res.data;
    },
  });
}

// ---------------------------------------------------------------------------
// Account mutations
// ---------------------------------------------------------------------------

export function useUpsertCrmAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { tenantId: string; healthScore?: number; notes?: string; tags?: string[] }) => {
      const res = await api.post<ApiSuccessResponse<CrmAccount>>('/crm/accounts', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.all });
    },
  });
}

export function useUpdateCrmAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; healthScore?: number; notes?: string; tags?: string[] }) => {
      const res = await api.patch<ApiSuccessResponse<CrmAccount>>(`/crm/accounts/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.all });
    },
  });
}

export function useDeleteCrmAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.del<ApiSuccessResponse<null>>(`/crm/accounts/${id}`);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.all });
    },
  });
}

export function useTouchCrmAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<ApiSuccessResponse<CrmAccount>>(`/crm/accounts/${id}/touch`, {});
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.all });
    },
  });
}
