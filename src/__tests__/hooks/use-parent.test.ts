/* Frontend tests for parent React Query hooks */
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useParentDashboard,
  useChildProgress,
  useDigestConfig,
  useUpdateDigest,
  useCreateFeedback,
  useVolunteerOpportunities,
} from '../../hooks/api/use-parent';

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
jest.mock('../../api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
}));

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  };
}

beforeEach(() => jest.clearAllMocks());

describe('useParentDashboard', () => {
  it('fetches dashboard data for parent', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        children: [{ id: 'ch1', firstName: 'Alice' }],
        upcomingAssignments: 3,
        unresolvedInvoices: 1,
        recentGrades: [{ id: 'g1', value: 92 }],
      },
    });
    const { result } = renderHook(() => useParentDashboard(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any).children).toHaveLength(1);
  });
});

describe('useChildProgress', () => {
  it('fetches child academic progress', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        grades: [{ id: 'g1', value: 95, courseTitle: 'Math' }],
        attendance: { present: 40, absent: 2, late: 1 },
        assignments: [{ id: 'a1', title: 'Essay', status: 'submitted' }],
      },
    });
    const { result } = renderHook(() => useChildProgress('ch1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any).grades).toHaveLength(1);
  });
});

describe('useDigestConfig', () => {
  it('fetches parent digest preferences', async () => {
    mockGet.mockResolvedValueOnce({
      data: { frequency: 'WEEKLY', channels: ['EMAIL'], topics: ['GRADES', 'ATTENDANCE'] },
    });
    const { result } = renderHook(() => useDigestConfig(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any)?.frequency).toBe('WEEKLY');
  });
});

describe('useUpdateDigest', () => {
  it('updates digest preferences', async () => {
    mockPatch.mockResolvedValueOnce({ data: { frequency: 'DAILY' } });
    const { result } = renderHook(() => useUpdateDigest(), { wrapper: createWrapper() });
    result.current.mutate({ frequency: 'DAILY' } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateFeedback', () => {
  it('submits parent feedback', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'fb1' } });
    const { result } = renderHook(() => useCreateFeedback('s1'), { wrapper: createWrapper() });
    result.current.mutate({ type: 'SUGGESTION', message: 'More art classes please' } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useVolunteerOpportunities', () => {
  it('fetches volunteer opportunities for school', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        { id: 'v1', title: 'Library Helper', date: '2026-04-15' },
        { id: 'v2', title: 'Science Fair Judge', date: '2026-05-01' },
      ],
    });
    const { result } = renderHook(() => useVolunteerOpportunities('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });
});
