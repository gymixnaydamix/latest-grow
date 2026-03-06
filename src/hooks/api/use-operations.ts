import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type {
  ApiSuccessResponse,
  Facility,
  FacilityBooking,
  Policy,
  SchoolEvent,
  StrategicGoal,
  MaintenanceRequest,
} from '@root/types';

// ── Types ──
interface CreateFacilityPayload {
  name: string;
  type: string;
  capacity: number;
  status?: string;
}

interface CreateBookingPayload {
  facilityId: string;
  startTime: string;
  endTime: string;
  purpose: string;
}

interface CreatePolicyPayload {
  title: string;
  body: string;
  status?: string;
}

interface CreateEventPayload {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  audience?: string[];
}

interface CreateGoalPayload {
  title: string;
  description: string;
  targetDate: string;
  status?: string;
}

interface CreateCompliancePayload {
  title: string;
  body: string;
  status?: string;
}

interface CreateMaintenancePayload {
  facilityId?: string;
  title: string;
  description: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  notes?: string;
}

// ── Keys ──
export const operationsKeys = {
  facilities: (schoolId: string) => ['operations', 'facilities', schoolId] as const,
  bookings: (facilityId: string) => ['operations', 'bookings', facilityId] as const,
  policies: (schoolId: string) => ['operations', 'policies', schoolId] as const,
  policy: (id: string) => ['operations', 'policy', id] as const,
  events: (schoolId: string) => ['operations', 'events', schoolId] as const,
  event: (id: string) => ['operations', 'event', id] as const,
  goals: (schoolId: string) => ['operations', 'goals', schoolId] as const,
  compliance: (schoolId: string) => ['operations', 'compliance', schoolId] as const,
  systemPrompts: (schoolId: string) => ['operations', 'systemPrompts', schoolId] as const,
  schoolBookings: (schoolId: string) => ['operations', 'schoolBookings', schoolId] as const,
  maintenance: (schoolId: string) => ['operations', 'maintenance', schoolId] as const,
};

// ── Facility Queries ──
export function useFacilities(schoolId: string | null) {
  return useQuery({
    queryKey: operationsKeys.facilities(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Facility[]>>(`/operations/schools/${schoolId}/facilities`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useFacilityBookings(facilityId: string | null) {
  return useQuery({
    queryKey: operationsKeys.bookings(facilityId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<FacilityBooking[]>>(`/operations/facilities/${facilityId}/bookings`).then(r => r.data),
    enabled: !!facilityId,
  });
}

// ── Policy Queries ──
export function usePolicies(schoolId: string | null) {
  return useQuery({
    queryKey: operationsKeys.policies(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Policy[]>>(`/operations/schools/${schoolId}/policies`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function usePolicy(id: string | null) {
  return useQuery({
    queryKey: operationsKeys.policy(id!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Policy>>(`/operations/policies/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

// ── Event Queries ──
export function useEvents(schoolId: string | null) {
  return useQuery({
    queryKey: operationsKeys.events(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<SchoolEvent[]>>(`/operations/schools/${schoolId}/events`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useEvent(id: string | null) {
  return useQuery({
    queryKey: operationsKeys.event(id!),
    queryFn: () =>
      api.get<ApiSuccessResponse<SchoolEvent>>(`/operations/events/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

// ── Goal Queries ──
export function useGoals(schoolId: string | null) {
  return useQuery({
    queryKey: operationsKeys.goals(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<StrategicGoal[]>>(`/operations/schools/${schoolId}/goals`).then(r => r.data),
    enabled: !!schoolId,
  });
}

// ── Compliance Queries ──
export function useCompliance(schoolId: string | null) {
  return useQuery({
    queryKey: operationsKeys.compliance(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<unknown[]>>(`/operations/schools/${schoolId}/compliance`).then(r => r.data),
    enabled: !!schoolId,
  });
}

// ── System Prompts ──
export function useSystemPrompts(schoolId: string | null) {
  return useQuery({
    queryKey: operationsKeys.systemPrompts(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<unknown[]>>(`/operations/schools/${schoolId}/system-prompts`).then(r => r.data),
    enabled: !!schoolId,
  });
}

// ── Facility Mutations ──
export function useCreateFacility(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFacilityPayload) =>
      api.post<ApiSuccessResponse<Facility>>(`/operations/schools/${schoolId}/facilities`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operationsKeys.facilities(schoolId) });
    },
  });
}

export function useUpdateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateFacilityPayload>) =>
      api.patch<ApiSuccessResponse<Facility>>(`/operations/facilities/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations', 'facilities'] });
    },
  });
}

export function useDeleteFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/operations/facilities/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations', 'facilities'] });
    },
  });
}

// ── Booking Mutations ──
export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
      api.post<ApiSuccessResponse<FacilityBooking>>('/operations/bookings', payload).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: operationsKeys.bookings(vars.facilityId) });
    },
  });
}

// ── Policy Mutations ──
export function useCreatePolicy(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePolicyPayload) =>
      api.post<ApiSuccessResponse<Policy>>(`/operations/schools/${schoolId}/policies`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operationsKeys.policies(schoolId) });
    },
  });
}

export function useUpdatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreatePolicyPayload>) =>
      api.patch<ApiSuccessResponse<Policy>>(`/operations/policies/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations', 'policies'] });
    },
  });
}

// ── Event Mutations ──
export function useCreateEvent(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventPayload) =>
      api.post<ApiSuccessResponse<SchoolEvent>>(`/operations/schools/${schoolId}/events`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operationsKeys.events(schoolId) });
    },
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateEventPayload>) =>
      api.patch<ApiSuccessResponse<SchoolEvent>>(`/operations/events/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations', 'events'] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/operations/events/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations', 'events'] });
    },
  });
}

// ── Goal Mutations ──
export function useCreateGoal(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGoalPayload) =>
      api.post<ApiSuccessResponse<StrategicGoal>>(`/operations/schools/${schoolId}/goals`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operationsKeys.goals(schoolId) });
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateGoalPayload & { progress: number }>) =>
      api.patch<ApiSuccessResponse<StrategicGoal>>(`/operations/goals/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations', 'goals'] });
    },
  });
}

// ── Compliance Mutations ──
export function useCreateCompliance(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCompliancePayload) =>
      api.post(`/operations/schools/${schoolId}/compliance`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operationsKeys.compliance(schoolId) });
    },
  });
}

// ── System Prompt Mutations ──
export function useUpsertSystemPrompt(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { context: string; prompt: string }) =>
      api.put(`/operations/schools/${schoolId}/system-prompts`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operationsKeys.systemPrompts(schoolId) });
    },
  });
}

export function useSchoolBookings(schoolId: string | null) {
  return useQuery({
    queryKey: operationsKeys.schoolBookings(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<FacilityBooking[]>>(`/operations/schools/${schoolId}/bookings`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useMaintenanceRequests(schoolId: string | null) {
  return useQuery({
    queryKey: operationsKeys.maintenance(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<MaintenanceRequest[]>>(`/operations/schools/${schoolId}/maintenance`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useCreateMaintenanceRequest(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMaintenancePayload) =>
      api.post<ApiSuccessResponse<MaintenanceRequest>>(`/operations/schools/${schoolId}/maintenance`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operationsKeys.maintenance(schoolId) });
    },
  });
}

export function useUpdateMaintenanceRequest(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateMaintenancePayload>) =>
      api.patch<ApiSuccessResponse<MaintenanceRequest>>(`/operations/maintenance/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operationsKeys.maintenance(schoolId) });
    },
  });
}

export function useDeleteMaintenanceRequest(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/operations/maintenance/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operationsKeys.maintenance(schoolId) });
    },
  });
}
