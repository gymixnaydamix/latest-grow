import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { ApiSuccessResponse } from '@root/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const wellnessKeys = {
  metrics: ['wellness', 'metrics'] as const,
  weekly: ['wellness', 'weekly'] as const,
  journal: ['wellness', 'journal'] as const,
  goals: ['wellness', 'goals'] as const,
  mindBody: ['wellness', 'mind-body'] as const,
  resources: ['wellness', 'resources'] as const,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WellnessMetrics {
  wellnessScore: number;
  moodTrend: string;
  activitiesDone: number;
  streak: number;
}

export interface WeeklySummaryItem {
  day: string;
  activity: string;
  mood: string;
  moodColor: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  moodEmoji: string;
  summary: string;
  createdAt: string;
}

export interface WellnessGoal {
  id: string;
  title: string;
  progress: number;
  target: string;
  current: string;
}

export interface MindBodyMetric {
  title: string;
  value: string;
  pct: number;
  color: string;
}

export interface WellnessResource {
  id: string;
  title: string;
  category: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useWellnessMetrics() {
  return useQuery({
    queryKey: wellnessKeys.metrics,
    queryFn: () => api.get<ApiSuccessResponse<WellnessMetrics>>('/wellness/metrics').then((r) => r.data),
  });
}

export function useWeeklySummary() {
  return useQuery({
    queryKey: wellnessKeys.weekly,
    queryFn: () => api.get<ApiSuccessResponse<WeeklySummaryItem[]>>('/wellness/weekly').then((r) => r.data),
  });
}

export function useJournalEntries() {
  return useQuery({
    queryKey: wellnessKeys.journal,
    queryFn: () => api.get<ApiSuccessResponse<JournalEntry[]>>('/wellness/journal').then((r) => r.data),
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { mood: string; moodEmoji: string; summary: string }) =>
      api.post<ApiSuccessResponse<JournalEntry>>('/wellness/journal', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: wellnessKeys.journal }),
  });
}

export function useWellnessGoals() {
  return useQuery({
    queryKey: wellnessKeys.goals,
    queryFn: () => api.get<ApiSuccessResponse<WellnessGoal[]>>('/wellness/goals').then((r) => r.data),
  });
}

export function useCreateWellnessGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; target?: string }) =>
      api.post<ApiSuccessResponse<WellnessGoal>>('/wellness/goals', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: wellnessKeys.goals }),
  });
}

export function useUpdateWellnessGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; progress?: number; current?: string; title?: string }) =>
      api.patch<ApiSuccessResponse<WellnessGoal>>(`/wellness/goals/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: wellnessKeys.goals }),
  });
}

export function useMindBodyMetrics() {
  return useQuery({
    queryKey: wellnessKeys.mindBody,
    queryFn: () => api.get<ApiSuccessResponse<MindBodyMetric[]>>('/wellness/mind-body').then((r) => r.data),
  });
}

export function useWellnessResources() {
  return useQuery({
    queryKey: wellnessKeys.resources,
    queryFn: () => api.get<ApiSuccessResponse<WellnessResource[]>>('/wellness/resources').then((r) => r.data),
  });
}
