import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type {
  ApiSuccessResponse,
  TransportRoute,
  TransportStop,
  TransportAssignment,
  TransportTrackingEvent,
} from '@root/types';

export const transportKeys = {
  routes: (schoolId: string) => ['transport', 'routes', schoolId] as const,
  assignments: (schoolId: string) => ['transport', 'assignments', schoolId] as const,
  tracking: (schoolId: string, assignmentId?: string, status?: string) => ['transport', 'tracking', schoolId, assignmentId ?? '', status ?? ''] as const,
};

export function useTransportRoutes(schoolId: string | null) {
  return useQuery({
    queryKey: transportKeys.routes(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<TransportRoute[]>>(`/transport/schools/${schoolId}/routes`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useTransportAssignments(schoolId: string | null) {
  return useQuery({
    queryKey: transportKeys.assignments(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<TransportAssignment[]>>(`/transport/schools/${schoolId}/assignments`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useTransportTracking(schoolId: string | null, filters?: { assignmentId?: string; status?: string }) {
  const assignmentId = filters?.assignmentId;
  const status = filters?.status;

  return useQuery({
    queryKey: transportKeys.tracking(schoolId!, assignmentId, status),
    queryFn: () => {
      const search = new URLSearchParams();
      if (assignmentId) search.set('assignmentId', assignmentId);
      if (status) search.set('status', status);
      const qs = search.toString();
      return api.get<ApiSuccessResponse<TransportTrackingEvent[]>>(`/transport/schools/${schoolId}/tracking${qs ? `?${qs}` : ''}`).then(r => r.data);
    },
    enabled: !!schoolId,
  });
}

export function useCreateTransportRoute(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; code?: string; driverName?: string; vehicleNumber?: string; capacity?: number; isActive?: boolean }) =>
      api.post<ApiSuccessResponse<TransportRoute>>(`/transport/schools/${schoolId}/routes`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transportKeys.routes(schoolId) });
    },
  });
}

export function useUpdateTransportRoute(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<{ name: string; code: string; driverName: string; vehicleNumber: string; capacity: number; isActive: boolean }>) =>
      api.patch<ApiSuccessResponse<TransportRoute>>(`/transport/routes/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transportKeys.routes(schoolId) });
    },
  });
}

export function useDeleteTransportRoute(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/transport/routes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transportKeys.routes(schoolId) });
      qc.invalidateQueries({ queryKey: transportKeys.assignments(schoolId) });
    },
  });
}

export function useCreateTransportStop(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, ...payload }: { routeId: string; name: string; address?: string; sequence: number; scheduledTime?: string }) =>
      api.post<ApiSuccessResponse<TransportStop>>(`/transport/routes/${routeId}/stops`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transportKeys.routes(schoolId) });
    },
  });
}

export function useUpdateTransportStop(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; name?: string; address?: string; sequence?: number; scheduledTime?: string }) =>
      api.patch<ApiSuccessResponse<TransportStop>>(`/transport/stops/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transportKeys.routes(schoolId) });
    },
  });
}

export function useDeleteTransportStop(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/transport/stops/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transportKeys.routes(schoolId) });
    },
  });
}

export function useCreateTransportAssignment(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { routeId: string; userId: string; stopId?: string; status?: string; notes?: string }) =>
      api.post<ApiSuccessResponse<TransportAssignment>>(`/transport/schools/${schoolId}/assignments`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transportKeys.assignments(schoolId) });
    },
  });
}

export function useUpdateTransportAssignment(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; routeId?: string; userId?: string; stopId?: string | null; status?: string; notes?: string }) =>
      api.patch<ApiSuccessResponse<TransportAssignment>>(`/transport/assignments/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transportKeys.assignments(schoolId) });
    },
  });
}

export function useDeleteTransportAssignment(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/transport/assignments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transportKeys.assignments(schoolId) });
      qc.invalidateQueries({ queryKey: ['transport', 'tracking', schoolId] });
    },
  });
}

export function useCreateTransportEvent(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, status, note }: { assignmentId: string; status: string; note?: string }) =>
      api.post<ApiSuccessResponse<TransportTrackingEvent>>(`/transport/assignments/${assignmentId}/events`, { status, note }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transport', 'tracking', schoolId] });
      qc.invalidateQueries({ queryKey: transportKeys.assignments(schoolId) });
    },
  });
}
