import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { ApiSuccessResponse, AnalyticsOverviewDTO, MarketIntelDTO, SystemHealthDTO } from '@root/types';

// ── Keys ──
export const analyticsKeys = {
  overview: ['analytics', 'overview'] as const,
  platform: ['analytics', 'platform'] as const,
  market: ['analytics', 'market'] as const,
  system: ['analytics', 'system'] as const,
  overlaySettings: ['analytics', 'overlay-settings'] as const,
};

// ── Queries ──
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: analyticsKeys.overview,
    queryFn: () => api.get<ApiSuccessResponse<AnalyticsOverviewDTO>>('/analytics/overview').then(r => r.data),
  });
}

export function usePlatformAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.platform,
    queryFn: () => api.get<ApiSuccessResponse<AnalyticsOverviewDTO>>('/analytics/platform').then(r => r.data),
  });
}

export function useMarketIntelligence() {
  return useQuery({
    queryKey: analyticsKeys.market,
    queryFn: () => api.get<ApiSuccessResponse<MarketIntelDTO>>('/analytics/market').then(r => r.data),
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: analyticsKeys.system,
    queryFn: () => api.get<ApiSuccessResponse<SystemHealthDTO>>('/analytics/system').then(r => r.data),
  });
}

export function useOverlaySettings() {
  return useQuery({
    queryKey: analyticsKeys.overlaySettings,
    queryFn: () => api.get<ApiSuccessResponse<Record<string, { enabled: boolean }>>>('/analytics/overlay-settings').then(r => r.data),
  });
}

// ── Mutations ──
export function useUpdateOverlaySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, { enabled: boolean }>) =>
      api.put<ApiSuccessResponse<Record<string, { enabled: boolean }>>>('/analytics/overlay-settings', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: analyticsKeys.overlaySettings });
    },
  });
}
