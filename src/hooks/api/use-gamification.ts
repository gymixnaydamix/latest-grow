import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type {
  ApiSuccessResponse,
  GamificationActionResult,
  GamificationBootstrapDTO,
  GamificationBuilderDraft,
  GamificationPagePayload,
} from '@root/types';

export interface GamificationPageFilters {
  search?: string;
  range?: string;
  segment?: string;
}

export const gamificationKeys = {
  bootstrap: ['gamification', 'bootstrap'] as const,
  page: (pageId: string, filters: GamificationPageFilters) =>
    ['gamification', 'page', pageId, filters.search ?? '', filters.range ?? '30d', filters.segment ?? 'all'] as const,
};

function toQuery(filters: GamificationPageFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.range) params.set('range', filters.range);
  if (filters.segment) params.set('segment', filters.segment);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function useGamificationBootstrap() {
  return useQuery({
    queryKey: gamificationKeys.bootstrap,
    queryFn: () => api.get<ApiSuccessResponse<GamificationBootstrapDTO>>('/gamification/bootstrap').then((res) => res.data),
  });
}

export function useGamificationPage(pageId: string | null, filters: GamificationPageFilters) {
  return useQuery({
    queryKey: gamificationKeys.page(pageId ?? '', filters),
    queryFn: () =>
      api
        .get<ApiSuccessResponse<GamificationPagePayload>>(`/gamification/pages/${pageId}${toQuery(filters)}`)
        .then((res) => res.data),
    enabled: Boolean(pageId),
  });
}

export function useSaveGamificationDraft(pageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: GamificationBuilderDraft) =>
      api
        .patch<ApiSuccessResponse<GamificationPagePayload>>(`/gamification/pages/${pageId}/draft`, draft)
        .then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['gamification', 'page', pageId] });
    },
  });
}

export function usePublishGamificationPage(pageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<ApiSuccessResponse<GamificationActionResult>>(`/gamification/pages/${pageId}/publish`).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['gamification', 'page', pageId] });
    },
  });
}

export function useRollbackGamificationPage(pageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) =>
      api
        .post<ApiSuccessResponse<GamificationActionResult>>(`/gamification/pages/${pageId}/rollback`, { versionId })
        .then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['gamification', 'page', pageId] });
    },
  });
}

export function useExportGamificationPage(pageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<ApiSuccessResponse<GamificationActionResult>>(`/gamification/pages/${pageId}/export`).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['gamification', 'page', pageId] });
    },
  });
}

export function useRunGamificationAction(pageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, action }: { cardId: string; action: string }) =>
      api
        .post<ApiSuccessResponse<GamificationActionResult>>(`/gamification/pages/${pageId}/actions`, { cardId, action })
        .then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['gamification', 'page', pageId] });
    },
  });
}
