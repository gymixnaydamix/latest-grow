/* Frontend tests for admin React Query hooks */
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useApplicants,
  useCampaigns,
  useSchoolUsers,
  useCreateApplicant,
  useUpdateApplicantStage,
  useCreateCampaign,
  useCreateSchoolUser,
} from '../../hooks/api/use-admin';

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

describe('useApplicants', () => {
  it('fetches applicants by school', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'a1', firstName: 'John' }] });
    const { result } = renderHook(() => useApplicants('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('is disabled when schoolId is null', () => {
    const { result } = renderHook(() => useApplicants(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCampaigns', () => {
  it('fetches marketing campaigns', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'c1', name: 'Spring Open Day' }] });
    const { result } = renderHook(() => useCampaigns('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useSchoolUsers', () => {
  it('fetches school staff', async () => {
    mockGet.mockResolvedValueOnce({ data: { items: [{ id: 'u1' }], total: 1 } });
    const { result } = renderHook(() => useSchoolUsers('s1', 'staff'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateApplicant', () => {
  it('calls POST on mutation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'a2' } });
    const { result } = renderHook(() => useCreateApplicant('s1'), { wrapper: createWrapper() });
    result.current.mutate({ firstName: 'Jane', lastName: 'Doe', email: 'j@d.com' } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateApplicantStage', () => {
  it('calls PATCH on mutation', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 'a1', stage: 'ACCEPTED' } });
    const { result } = renderHook(() => useUpdateApplicantStage(), { wrapper: createWrapper() });
    result.current.mutate({ id: 'a1', stage: 'ACCEPTED' } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateCampaign', () => {
  it('calls POST on mutation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'c2' } });
    const { result } = renderHook(() => useCreateCampaign('s1'), { wrapper: createWrapper() });
    result.current.mutate({
      name: 'Fall Campaign',
      channel: 'EMAIL',
      budget: 5000,
      startDate: '2026-09-01T00:00:00Z',
      endDate: '2026-09-30T00:00:00Z',
    } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateSchoolUser', () => {
  it('calls POST on mutation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'u2' } });
    const { result } = renderHook(() => useCreateSchoolUser('s1'), { wrapper: createWrapper() });
    result.current.mutate({ email: 'new@school.edu', firstName: 'Bob', lastName: 'B', role: 'TEACHER' } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
