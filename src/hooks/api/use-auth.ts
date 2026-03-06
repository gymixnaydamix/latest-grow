import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { ApiSuccessResponse, User, SchoolMember } from '@root/types';

// ── Types ──
interface AuthData {
  user: User;
  memberships: (SchoolMember & { school: NonNullable<SchoolMember['school']> })[];
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
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      api.patch<ApiSuccessResponse<{ user: User }>>('/auth/profile', payload).then(r => r.data.user),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}
