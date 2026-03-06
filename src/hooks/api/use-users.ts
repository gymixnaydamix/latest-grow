/* ─── User Management API Hooks ─── CRUD, bulk ops, stats (React Query) ─── */
import { useCallback } from 'react';
import {
  useQuery as useRQ,
  useMutation as useRQMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/api/client';
import type { ApiSuccessResponse } from '@root/types';

const BASE = '/user-management';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export type UserRole = 'PROVIDER' | 'ADMIN' | 'FINANCE' | 'MARKETING' | 'SCHOOL' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  schoolMemberships?: { school: { id: string; name: string }; role: string }[];
}

export interface UserDetail extends UserRecord {
  courses?: { id: string; name: string }[];
  auditLogs?: { id: string; action: string; createdAt: string }[];
}

export interface UserListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  roleCounts: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════════
// Query keys
// ═══════════════════════════════════════════════════════════════════

export const userKeys = {
  all: ['user-management'] as const,
  list: (qs: string) => ['user-management', 'list', qs] as const,
  detail: (id: string) => ['user-management', 'detail', id] as const,
  stats: ['user-management', 'stats'] as const,
};

// ═══════════════════════════════════════════════════════════════════
// User list (paginated)
// ═══════════════════════════════════════════════════════════════════

interface UserListResponse {
  success: boolean;
  data: UserRecord[];
  meta: UserListMeta;
}

export function useUserList(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const queryString = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');

  const query = useRQ({
    queryKey: userKeys.list(queryString),
    queryFn: () => api.get<UserListResponse>(`${BASE}/users${queryString ? `?${queryString}` : ''}`),
  });

  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Single user
// ═══════════════════════════════════════════════════════════════════

export function useUserDetail(id: string | null) {
  const query = useRQ({
    queryKey: userKeys.detail(id ?? ''),
    queryFn: () => api.get<ApiSuccessResponse<UserDetail>>(`${BASE}/users/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Stats
// ═══════════════════════════════════════════════════════════════════

export function useUserStats() {
  const query = useRQ({
    queryKey: userKeys.stats,
    queryFn: () => api.get<ApiSuccessResponse<UserStats>>(`${BASE}/stats`).then((r) => r.data),
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Mutation helpers
// ═══════════════════════════════════════════════════════════════════
// Consumers call `mutate(body?, pathSuffix?)` and await the result,
// so we expose a thin wrapper that matches the legacy signature.
// ═══════════════════════════════════════════════════════════════════

function useUserMutation<B = unknown>(
  method: 'post' | 'patch' | 'del',
  path: string,
) {
  const qc = useQueryClient();
  const mutation = useRQMutation({
    mutationFn: async ({ body, pathSuffix = '' }: { body?: B; pathSuffix?: string }) => {
      const url = `${BASE}${path}${pathSuffix}`;
      if (method === 'del') return api.del<ApiSuccessResponse<unknown>>(url);
      return api[method]<ApiSuccessResponse<unknown>>(url, body);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: userKeys.all }); },
  });

  // Preserve legacy call signature: mutate(body?, pathSuffix?)
  const mutate = useCallback(
    (body?: B, pathSuffix?: string) => mutation.mutateAsync({ body, pathSuffix }),
    [mutation],
  );

  return {
    mutate,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Mutations
// ═══════════════════════════════════════════════════════════════════

export function useCreateUser() {
  return useUserMutation<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string | null;
    isActive?: boolean;
  }>('post', '/users');
}

export function useUpdateUser() {
  return useUserMutation<Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar: string | null;
    isActive: boolean;
  }>>('patch', '/users');
}

export function useDeleteUser() {
  return useUserMutation('del', '/users');
}

export function useBulkDeleteUsers() {
  return useUserMutation<{ ids: string[] }>('post', '/users/bulk-delete');
}

export function useBulkUpdateRole() {
  return useUserMutation<{ ids: string[]; role: UserRole }>('post', '/users/bulk-role');
}
