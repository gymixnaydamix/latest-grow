import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type {
  ApiSuccessResponse,
  FeedbackSubmission,
  DailyDigestConfig,
  VolunteerOpportunity,
  CafeteriaMenu,
  CafeteriaAccount,
} from '@root/types';

// ── Types ──
interface CreateFeedbackPayload {
  category: string;
  body: string;
}

interface UpdateDigestPayload {
  frequency: string;
  preferences: Record<string, boolean>;
}

// ── Keys ──
export const parentKeys = {
  dashboard: () => ['parent', 'dashboard'] as const,
  childProgress: (studentId: string) => ['parent', 'childProgress', studentId] as const,
  digest: () => ['parent', 'digest'] as const,
  myFeedback: () => ['parent', 'myFeedback'] as const,
  schoolFeedback: (schoolId: string) => ['parent', 'schoolFeedback', schoolId] as const,
  volunteers: (schoolId: string) => ['parent', 'volunteers', schoolId] as const,
  cafeteriaMenu: (schoolId: string) => ['parent', 'cafeteriaMenu', schoolId] as const,
  cafeteriaAccount: (studentId: string) => ['parent', 'cafeteriaAccount', studentId] as const,
};

// ── Dashboard Queries ──
export function useParentDashboard() {
  return useQuery({
    queryKey: parentKeys.dashboard(),
    queryFn: () =>
      api.get<ApiSuccessResponse<unknown>>('/parent/dashboard').then(r => r.data),
  });
}

export function useChildProgress(studentId: string | null) {
  return useQuery({
    queryKey: parentKeys.childProgress(studentId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<unknown>>(`/parent/children/${studentId}/progress`).then(r => r.data),
    enabled: !!studentId,
  });
}

// ── Digest Queries ──
export function useDigestConfig() {
  return useQuery({
    queryKey: parentKeys.digest(),
    queryFn: () =>
      api.get<ApiSuccessResponse<DailyDigestConfig>>('/parent/digest').then(r => r.data),
  });
}

// ── Feedback Queries ──
export function useMyFeedback() {
  return useQuery({
    queryKey: parentKeys.myFeedback(),
    queryFn: () =>
      api.get<ApiSuccessResponse<FeedbackSubmission[]>>('/parent/my-feedback').then(r => r.data),
  });
}

export function useSchoolFeedback(schoolId: string | null) {
  return useQuery({
    queryKey: parentKeys.schoolFeedback(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<FeedbackSubmission[]>>(`/parent/schools/${schoolId}/feedback`).then(r => r.data),
    enabled: !!schoolId,
  });
}

// ── Volunteer Queries ──
export function useVolunteerOpportunities(schoolId: string | null) {
  return useQuery({
    queryKey: parentKeys.volunteers(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<VolunteerOpportunity[]>>(`/parent/schools/${schoolId}/volunteer`).then(r => r.data),
    enabled: !!schoolId,
  });
}

// ── Cafeteria Queries ──
export function useCafeteriaMenu(schoolId: string | null) {
  return useQuery({
    queryKey: parentKeys.cafeteriaMenu(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<CafeteriaMenu[]>>(`/parent/schools/${schoolId}/cafeteria/menu`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useCafeteriaAccount(studentId: string | null) {
  return useQuery({
    queryKey: parentKeys.cafeteriaAccount(studentId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<CafeteriaAccount>>(`/parent/cafeteria/account/${studentId}`).then(r => r.data),
    enabled: !!studentId,
  });
}

// ── Digest Mutations ──
export function useUpdateDigest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDigestPayload) =>
      api.put<ApiSuccessResponse<DailyDigestConfig>>('/parent/digest', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentKeys.digest() });
    },
  });
}

// ── Feedback Mutations ──
export function useCreateFeedback(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFeedbackPayload) =>
      api.post<ApiSuccessResponse<FeedbackSubmission>>(`/parent/schools/${schoolId}/feedback`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentKeys.myFeedback() });
      qc.invalidateQueries({ queryKey: parentKeys.schoolFeedback(schoolId) });
    },
  });
}

// ── Volunteer Mutations ──
export function useVolunteerSignUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opportunityId: string) =>
      api.post(`/parent/volunteer/${opportunityId}/signup`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent', 'volunteers'] });
    },
  });
}
