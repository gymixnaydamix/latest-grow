import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { ApiSuccessResponse, Announcement, PaginatedResponse } from '@root/types';

// Types
interface CreateAnnouncementPayload {
  title: string;
  body: string;
  audience: string[];
}

export interface AnnouncementListParams {
  page?: number;
  pageSize?: number;
}

const DEFAULT_ANNOUNCEMENT_LIST_PARAMS = {
  page: 1,
  pageSize: 20,
} as const;

function normalizeAnnouncementListParams(params?: AnnouncementListParams) {
  return {
    page: params?.page ?? DEFAULT_ANNOUNCEMENT_LIST_PARAMS.page,
    pageSize: params?.pageSize ?? DEFAULT_ANNOUNCEMENT_LIST_PARAMS.pageSize,
  };
}

function buildAnnouncementsListPath(schoolId: string, params: Required<AnnouncementListParams>) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  return `/academic/schools/${schoolId}/announcements?${query.toString()}`;
}

function fetchAnnouncementsPage(schoolId: string, params: Required<AnnouncementListParams>) {
  return api
    .get<ApiSuccessResponse<PaginatedResponse<Announcement>>>(buildAnnouncementsListPath(schoolId, params))
    .then((r) => r.data);
}

// Keys
export const announcementKeys = {
  all: ['announcements'] as const,
  list: (schoolId: string, params: Required<AnnouncementListParams>) =>
    ['announcements', schoolId, params.page, params.pageSize] as const,
  detail: (id: string) => ['announcement', id] as const,
};

// Queries
export function useAnnouncementsPage(schoolId: string | null, params?: AnnouncementListParams) {
  const normalizedParams = normalizeAnnouncementListParams(params);

  return useQuery({
    queryKey: announcementKeys.list(schoolId!, normalizedParams),
    queryFn: () => fetchAnnouncementsPage(schoolId!, normalizedParams),
    enabled: !!schoolId,
  });
}

export function useAnnouncements(schoolId: string | null) {
  const normalizedParams = normalizeAnnouncementListParams();

  return useQuery({
    queryKey: announcementKeys.list(schoolId!, normalizedParams),
    queryFn: () => fetchAnnouncementsPage(schoolId!, normalizedParams),
    select: (page) => page.items,
    enabled: !!schoolId,
  });
}

export function useAnnouncement(id: string | null) {
  return useQuery({
    queryKey: announcementKeys.detail(id!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Announcement>>(`/academic/announcements/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

// Mutations
export function useCreateAnnouncement(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAnnouncementPayload) =>
      api.post<ApiSuccessResponse<Announcement>>(`/academic/schools/${schoolId}/announcements`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateAnnouncementPayload>) =>
      api.patch<ApiSuccessResponse<Announcement>>(`/academic/announcements/${id}`, payload).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: announcementKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/academic/announcements/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
}
