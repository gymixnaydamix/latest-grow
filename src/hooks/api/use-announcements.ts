import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { ApiSuccessResponse, Announcement } from '@root/types';

// ── Types ──
interface CreateAnnouncementPayload {
  title: string;
  body: string;
  audience: string[];
}

// ── Keys ──
export const announcementKeys = {
  list: (schoolId: string) => ['announcements', schoolId] as const,
  detail: (id: string) => ['announcement', id] as const,
};

// ── Queries ──
export function useAnnouncements(schoolId: string | null) {
  return useQuery({
    queryKey: announcementKeys.list(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Announcement[]>>(`/academic/schools/${schoolId}/announcements`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useAnnouncement(id: string | null) {
  return useQuery({
    queryKey: announcementKeys.detail(id!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Announcement>>(`/academic/announcements/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

// ── Mutations ──
export function useCreateAnnouncement(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAnnouncementPayload) =>
      api.post<ApiSuccessResponse<Announcement>>(`/academic/schools/${schoolId}/announcements`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: announcementKeys.list(schoolId) });
    },
  });
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateAnnouncementPayload>) =>
      api.patch<ApiSuccessResponse<Announcement>>(`/academic/announcements/${id}`, payload).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: announcementKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/academic/announcements/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}
