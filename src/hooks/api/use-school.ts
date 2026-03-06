import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type {
  ApiSuccessResponse,
  School,
  SchoolMember,
  DashboardKPI,
} from '@root/types';

// ── Types ──
interface CreateSchoolPayload {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

interface UpdateBrandingPayload {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

// ── Keys ──
export const schoolKeys = {
  all: ['schools'] as const,
  detail: (id: string) => ['schools', id] as const,
  members: (id: string) => ['schools', id, 'members'] as const,
  dashboard: (id: string) => ['schools', id, 'dashboard'] as const,
};

// ── Queries ──
export function useSchool(schoolId: string | null) {
  return useQuery({
    queryKey: schoolKeys.detail(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<School>>(`/schools/${schoolId}`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useSchoolMembers(schoolId: string | null) {
  return useQuery({
    queryKey: schoolKeys.members(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<SchoolMember[]>>(`/schools/${schoolId}/members`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useDashboardKPIs(schoolId: string | null) {
  return useQuery({
    queryKey: schoolKeys.dashboard(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<DashboardKPI[]>>(`/schools/${schoolId}/dashboard`).then(r => r.data),
    enabled: !!schoolId,
  });
}

// ── Mutations ──
export function useCreateSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSchoolPayload) =>
      api.post<ApiSuccessResponse<School>>('/schools', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.all });
    },
  });
}

export function useUpdateBranding(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateBrandingPayload) =>
      api.patch<ApiSuccessResponse<School>>(`/schools/${schoolId}/branding`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.detail(schoolId) });
    },
  });
}
