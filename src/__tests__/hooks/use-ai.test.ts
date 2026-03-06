/* Frontend tests for AI React Query hooks */
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAIGenerate,
  useAIChat,
  useAIPolicyGenerator,
  useAIFeedbackAnalysis,
  useAIGradeAssist,
  useAIContentGenerator,
  useAIGapDetector,
  useAICrisisDraft,
  useAIPredictBudget,
} from '../../hooks/api/use-ai';

// ── Mock the API client ──
const mockPost = jest.fn();
const mockGet = jest.fn();
jest.mock('../../api/client', () => ({
  api: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useAIGenerate', () => {
  it('calls POST /ai/generate with payload', async () => {
    mockPost.mockResolvedValueOnce({ data: { text: 'Generated text' } });

    const { result } = renderHook(() => useAIGenerate(), { wrapper: createWrapper() });

    result.current.mutate({ prompt: 'Explain cells', maxTokens: 300 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPost).toHaveBeenCalledWith(
      '/ai/generate',
      { prompt: 'Explain cells', maxTokens: 300 },
    );
    expect(result.current.data).toEqual({ text: 'Generated text' });
  });
});

describe('useAIChat', () => {
  it('calls POST /ai/chat with messages', async () => {
    mockPost.mockResolvedValueOnce({ data: { text: 'Chat reply' } });

    const { result } = renderHook(() => useAIChat(), { wrapper: createWrapper() });

    result.current.mutate({
      messages: [{ role: 'user' as const, content: 'Hello' }],
      temperature: 0.5,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPost).toHaveBeenCalledWith('/ai/chat', {
      messages: [{ role: 'user', content: 'Hello' }],
      temperature: 0.5,
    });
  });
});

describe('useAIPolicyGenerator', () => {
  it('calls POST /ai/policy-generator', async () => {
    mockPost.mockResolvedValueOnce({ data: { text: 'Policy draft' } });

    const { result } = renderHook(() => useAIPolicyGenerator(), { wrapper: createWrapper() });

    result.current.mutate({ topic: 'Bullying', context: 'K-12' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPost).toHaveBeenCalledWith('/ai/policy-generator', { topic: 'Bullying', context: 'K-12' });
  });
});

describe('useAIFeedbackAnalysis', () => {
  it('calls POST /ai/feedback-analysis', async () => {
    mockPost.mockResolvedValueOnce({ data: { text: 'Analysis result' } });

    const { result } = renderHook(() => useAIFeedbackAnalysis(), { wrapper: createWrapper() });

    result.current.mutate({ schoolId: 's1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPost).toHaveBeenCalledWith('/ai/feedback-analysis', { schoolId: 's1' });
  });
});

describe('useAIGradeAssist', () => {
  it('calls POST /ai/grade-assist', async () => {
    mockPost.mockResolvedValueOnce({ data: { text: 'Grading feedback' } });

    const { result } = renderHook(() => useAIGradeAssist(), { wrapper: createWrapper() });

    result.current.mutate({ submissionId: 'sub-1', rubric: 'Standard rubric' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPost).toHaveBeenCalledWith('/ai/grade-assist', {
      submissionId: 'sub-1',
      rubric: 'Standard rubric',
    });
  });
});

describe('useAIContentGenerator', () => {
  it('calls POST /ai/content-generator', async () => {
    mockPost.mockResolvedValueOnce({ data: { text: 'Lesson plan' } });

    const { result } = renderHook(() => useAIContentGenerator(), { wrapper: createWrapper() });

    result.current.mutate({ subject: 'Math', gradeLevel: '5th', type: 'quiz' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPost).toHaveBeenCalledWith('/ai/content-generator', {
      subject: 'Math',
      gradeLevel: '5th',
      type: 'quiz',
    });
  });
});

describe('useAIGapDetector', () => {
  it('calls POST /ai/gap-detector', async () => {
    mockPost.mockResolvedValueOnce({ data: { text: 'Gap analysis' } });

    const { result } = renderHook(() => useAIGapDetector(), { wrapper: createWrapper() });

    result.current.mutate({ courseId: 'c1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPost).toHaveBeenCalledWith('/ai/gap-detector', { courseId: 'c1' });
  });
});

describe('useAICrisisDraft', () => {
  it('calls POST /ai/crisis-draft', async () => {
    mockPost.mockResolvedValueOnce({ data: { text: 'Emergency message' } });

    const { result } = renderHook(() => useAICrisisDraft(), { wrapper: createWrapper() });

    result.current.mutate({ situation: 'Flood warning', audience: 'parents' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPost).toHaveBeenCalledWith('/ai/crisis-draft', {
      situation: 'Flood warning',
      audience: 'parents',
    });
  });
});

describe('useAIPredictBudget', () => {
  it('calls GET /ai/schools/:id/predict-budget', async () => {
    mockGet.mockResolvedValueOnce({ data: { forecastYear: 2026 } });

    const { result } = renderHook(
      () => useAIPredictBudget('school-1'),
      { wrapper: createWrapper() },
    );

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGet).toHaveBeenCalledWith('/ai/schools/school-1/predict-budget');
    expect(result.current.data).toEqual({ forecastYear: 2026 });
  });
});
