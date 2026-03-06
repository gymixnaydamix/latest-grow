import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { ApiSuccessResponse, MessageThread, Message } from '@root/types';

// ── Types ──
interface CreateThreadPayload {
  subject: string;
  participantIds: string[];
  body: string;
}

interface SendMessagePayload {
  body: string;
}

// ── Keys ──
export const messageKeys = {
  threads: (schoolId: string) => ['messages', 'threads', schoolId] as const,
  thread: (id: string) => ['messages', 'thread', id] as const,
};

// ── Queries ──
export function useMessageThreads(schoolId: string | null) {
  return useQuery({
    queryKey: messageKeys.threads(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<MessageThread[]>>(`/messages/schools/${schoolId}/threads`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useMessageThread(threadId: string | null) {
  return useQuery({
    queryKey: messageKeys.thread(threadId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<MessageThread & { messages: Message[] }>>(`/messages/threads/${threadId}`).then(r => r.data),
    enabled: !!threadId,
  });
}

// ── Mutations ──
export function useCreateThread(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateThreadPayload) =>
      api.post<ApiSuccessResponse<MessageThread>>(`/messages/schools/${schoolId}/threads`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messageKeys.threads(schoolId) });
    },
  });
}

export function useSendMessage(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      api.post<ApiSuccessResponse<Message>>(`/messages/threads/${threadId}/messages`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messageKeys.thread(threadId) });
    },
  });
}
