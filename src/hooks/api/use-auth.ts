import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useAuthStore } from '@/store/auth.store';
import type { ApiSuccessResponse, User, SchoolMember } from '@root/types';

// ── Types ──
interface AuthData {
  user: User;
  memberships: (SchoolMember & { school: NonNullable<SchoolMember['school']> })[];
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
}

// ── Keys ──
export const authKeys = {
  me: ['auth', 'me'] as const,
};

// ── Queries ──
export function useMe(enabled = true) {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.get<ApiSuccessResponse<AuthData>>('/auth/me').then(r => r.data),
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

// ── Mutations ──

/** Login via React Query — keeps Zustand auth store in sync */
export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      api.post<ApiSuccessResponse<AuthData>>('/auth/login', payload).then(r => r.data),
    onSuccess: (data) => {
      // Sync Zustand auth store with the response
      const { user, memberships } = data;
      useAuthStore.setState({
        user,
        schoolMemberships: memberships ?? [],
        schoolId: memberships?.[0]?.schoolId ?? null,
        isLoading: false,
        error: null,
      });
      qc.setQueryData(authKeys.me, data);
    },
  });
}

/** Register via React Query — keeps Zustand auth store in sync */
export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      api.post<ApiSuccessResponse<AuthData>>('/auth/register', payload).then(r => r.data),
    onSuccess: (data) => {
      const { user, memberships } = data;
      useAuthStore.setState({
        user,
        schoolMemberships: memberships ?? [],
        schoolId: memberships?.[0]?.schoolId ?? null,
        isLoading: false,
        error: null,
      });
      qc.setQueryData(authKeys.me, data);
    },
  });
}

/** Logout — clears both React Query cache and Zustand auth store */
export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      // Always clear state, even if the logout request fails
      api.clearCsrf();
      useAuthStore.setState({
        user: null,
        schoolId: null,
        schoolMemberships: [],
        error: null,
      });
      qc.removeQueries({ queryKey: authKeys.me });
      qc.clear();
    },
  });
}

/** Update profile — syncs Zustand auth store after React Query cache refresh */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      api.patch<ApiSuccessResponse<{ user: User }>>('/auth/profile', payload).then(r => r.data.user),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.me });
      // Also refresh Zustand auth store so header/sidebar update immediately
      useAuthStore.getState().fetchMe();
    },
  });
}
