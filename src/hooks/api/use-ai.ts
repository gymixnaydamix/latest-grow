import { useMutation } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { ApiSuccessResponse } from '@root/types';

// ── Types ──
interface AIGeneratePayload {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

interface AIChatPayload {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  maxTokens?: number;
  temperature?: number;
}

interface AIGenerateResponse {
  text: string;
}

// ── Mutations (AI endpoints are all POST) ──
export function useAIGenerate() {
  return useMutation({
    mutationFn: (payload: AIGeneratePayload) =>
      api.post<ApiSuccessResponse<AIGenerateResponse>>('/ai/generate', payload).then(r => r.data),
  });
}

export function useAIChat() {
  return useMutation({
    mutationFn: (payload: AIChatPayload) =>
      api.post<ApiSuccessResponse<AIGenerateResponse>>('/ai/chat', payload).then(r => r.data),
  });
}

export function useAIPolicyGenerator() {
  return useMutation({
    mutationFn: (payload: { topic: string; context?: string }) =>
      api.post<ApiSuccessResponse<AIGenerateResponse>>('/ai/policy-generator', payload).then(r => r.data),
  });
}

export function useAIFeedbackAnalysis() {
  return useMutation({
    mutationFn: (payload: { feedbackIds?: string[]; schoolId?: string }) =>
      api.post<ApiSuccessResponse<AIGenerateResponse>>('/ai/feedback-analysis', payload).then(r => r.data),
  });
}

export function useAIGradeAssist() {
  return useMutation({
    mutationFn: (payload: { submissionId: string; rubric?: string }) =>
      api.post<ApiSuccessResponse<AIGenerateResponse>>('/ai/grade-assist', payload).then(r => r.data),
  });
}

export function useAIContentGenerator() {
  return useMutation({
    mutationFn: (payload: { subject: string; gradeLevel: string; type: string }) =>
      api.post<ApiSuccessResponse<AIGenerateResponse>>('/ai/content-generator', payload).then(r => r.data),
  });
}

export function useAIGapDetector() {
  return useMutation({
    mutationFn: (payload: { courseId: string }) =>
      api.post<ApiSuccessResponse<AIGenerateResponse>>('/ai/gap-detector', payload).then(r => r.data),
  });
}

export function useAICrisisDraft() {
  return useMutation({
    mutationFn: (payload: { situation: string; audience?: string }) =>
      api.post<ApiSuccessResponse<AIGenerateResponse>>('/ai/crisis-draft', payload).then(r => r.data),
  });
}

export function useAIPredictBudget(schoolId: string | null) {
  return useMutation({
    mutationFn: () =>
      api.get<ApiSuccessResponse<unknown>>(`/ai/schools/${schoolId}/predict-budget`).then(r => r.data),
  });
}
