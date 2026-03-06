import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type {
  ApiSuccessResponse,
  LibraryItem,
  LibraryLoan,
} from '@root/types';

export const libraryKeys = {
  items: (schoolId: string) => ['library', 'items', schoolId] as const,
  loans: (schoolId: string, status?: string) => ['library', 'loans', schoolId, status ?? ''] as const,
};

export function useLibraryItems(schoolId: string | null) {
  return useQuery({
    queryKey: libraryKeys.items(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<LibraryItem[]>>(`/library/schools/${schoolId}/items`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useLibraryLoans(schoolId: string | null, status?: string) {
  return useQuery({
    queryKey: libraryKeys.loans(schoolId!, status),
    queryFn: () => {
      const search = new URLSearchParams();
      if (status) search.set('status', status);
      const qs = search.toString();
      return api.get<ApiSuccessResponse<LibraryLoan[]>>(`/library/schools/${schoolId}/loans${qs ? `?${qs}` : ''}`).then(r => r.data);
    },
    enabled: !!schoolId,
  });
}

export function useCreateLibraryItem(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      title: string;
      author?: string;
      isbn?: string;
      category?: string;
      description?: string;
      shelfLocation?: string;
      totalCopies?: number;
      availableCopies?: number;
      publishedYear?: number;
    }) => api.post<ApiSuccessResponse<LibraryItem>>(`/library/schools/${schoolId}/items`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: libraryKeys.items(schoolId) });
    },
  });
}

export function useUpdateLibraryItem(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<{
      title: string;
      author: string;
      isbn: string;
      category: string;
      description: string;
      shelfLocation: string;
      totalCopies: number;
      availableCopies: number;
      publishedYear: number | null;
    }>) => api.patch<ApiSuccessResponse<LibraryItem>>(`/library/items/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: libraryKeys.items(schoolId) });
      qc.invalidateQueries({ queryKey: ['library', 'loans', schoolId] });
    },
  });
}

export function useDeleteLibraryItem(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/library/items/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: libraryKeys.items(schoolId) });
      qc.invalidateQueries({ queryKey: ['library', 'loans', schoolId] });
    },
  });
}

export function useCheckoutLibraryLoan(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { itemId: string; borrowerId: string; dueAt: string; notes?: string }) =>
      api.post<ApiSuccessResponse<LibraryLoan>>('/library/loans/checkout', { schoolId, ...payload }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: libraryKeys.items(schoolId) });
      qc.invalidateQueries({ queryKey: ['library', 'loans', schoolId] });
    },
  });
}

export function useReturnLibraryLoan(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.post<ApiSuccessResponse<LibraryLoan>>(`/library/loans/${id}/return`, { notes }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: libraryKeys.items(schoolId) });
      qc.invalidateQueries({ queryKey: ['library', 'loans', schoolId] });
    },
  });
}
