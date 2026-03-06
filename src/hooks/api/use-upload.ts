/* ─── File Upload Hooks ─── */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

/** Upload an avatar image (updates user profile) */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/upload/avatar', formData, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

/** Upload a document or media file */
export function useUploadDocument() {
  return useMutation({
    mutationFn: async ({ file, category }: { file: File; category?: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (category) formData.append('category', category);
      return api.post('/upload/document', formData, true);
    },
  });
}
