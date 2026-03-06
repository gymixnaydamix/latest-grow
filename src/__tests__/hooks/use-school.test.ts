/* Frontend tests for school React Query hooks */
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSchool, useSchoolMembers, useDashboardKPIs, useCreateSchool, useUpdateBranding } from '../../hooks/api/use-school';

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

describe('useSchool', () => {
  it('fetches school by id', async () => {
    mockGet.mockResolvedValueOnce({ data: { id: 's1', name: 'Academy' } });

    const { result } = renderHook(() => useSchool('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/schools/s1'));
    expect(result.current.data).toMatchObject({ id: 's1' });
  });

  it('is disabled when schoolId is null', () => {
    const { result } = renderHook(() => useSchool(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useSchoolMembers', () => {
  it('fetches members by school id', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ userId: 'u1', role: 'ADMIN' }] });

    const { result } = renderHook(() => useSchoolMembers('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useDashboardKPIs', () => {
  it('fetches dashboard KPIs', async () => {
    mockGet.mockResolvedValueOnce({ data: { students: 100, teachers: 10 } });

    const { result } = renderHook(() => useDashboardKPIs('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({ students: 100 });
  });
});

describe('useCreateSchool', () => {
  it('calls POST on mutation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 's2', name: 'New' } });

    const { result } = renderHook(() => useCreateSchool(), { wrapper: createWrapper() });
    result.current.mutate({ name: 'New' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPost).toHaveBeenCalledWith('/schools', { name: 'New' });
  });
});

describe('useUpdateBranding', () => {
  it('calls PATCH on mutation', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 's1' } });

    const { result } = renderHook(() => useUpdateBranding('s1'), { wrapper: createWrapper() });
    result.current.mutate({ primaryColor: '#000' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith('/schools/s1/branding', { primaryColor: '#000' });
  });
});
