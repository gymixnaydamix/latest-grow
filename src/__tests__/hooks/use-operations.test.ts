/* Frontend tests for operations React Query hooks */
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFacilities,
  usePolicies,
  useEvents,
  useGoals,
  useCreateFacility,
  useCreatePolicy,
  useCreateEvent,
} from '../../hooks/api/use-operations';

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();
jest.mock('../../api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  };
}

beforeEach(() => jest.clearAllMocks());

describe('useFacilities', () => {
  it('fetches facilities by school', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'f1', name: 'Gym' }] });
    const { result } = renderHook(() => useFacilities('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('is disabled when schoolId is null', () => {
    const { result } = renderHook(() => useFacilities(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('usePolicies', () => {
  it('fetches policies', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'p1' }] });
    const { result } = renderHook(() => usePolicies('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useEvents', () => {
  it('fetches events', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'ev1', title: 'Sports Day' }] });
    const { result } = renderHook(() => useEvents('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useGoals', () => {
  it('fetches strategic goals', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'g1', title: 'Improve test scores' }] });
    const { result } = renderHook(() => useGoals('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useCreateFacility', () => {
  it('calls POST on mutation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'f2' } });
    const { result } = renderHook(() => useCreateFacility('s1'), { wrapper: createWrapper() });
    result.current.mutate({ name: 'Library', type: 'ACADEMIC', capacity: 200 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreatePolicy', () => {
  it('calls POST on mutation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'p2' } });
    const { result } = renderHook(() => useCreatePolicy('s1'), { wrapper: createWrapper() });
    result.current.mutate({ title: 'Attendance Policy', body: 'All must attend', status: 'DRAFT' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateEvent', () => {
  it('calls POST on mutation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'ev2' } });
    const { result } = renderHook(() => useCreateEvent('s1'), { wrapper: createWrapper() });
    result.current.mutate({
      title: 'Open Day',
      startDate: '2026-05-01T09:00:00Z',
      endDate: '2026-05-01T17:00:00Z',
      type: 'ACADEMIC',
      audience: ['PARENT'],
    } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
