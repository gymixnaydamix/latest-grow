/* Frontend tests for CRM React Query hooks */
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCrmDeals, useCrmDealStats, useCrmDealsByStage, useCreateCrmDeal, useCrmAccounts } from '../../hooks/api/use-crm';

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

describe('useCrmDeals', () => {
  it('fetches deals', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'd1', name: 'Deal A' }] });
    const { result } = renderHook(() => useCrmDeals(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('passes stage filter', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });
    renderHook(() => useCrmDeals('', 'PROSPECT'), { wrapper: createWrapper() });
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('stage=PROSPECT')));
  });
});

describe('useCrmDealStats', () => {
  it('fetches aggregated deal stats', async () => {
    mockGet.mockResolvedValueOnce({ data: { pipelineValue: 100000, avgDealSize: 5000 } });
    const { result } = renderHook(() => useCrmDealStats(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({ pipelineValue: 100000 });
  });
});

describe('useCrmDealsByStage', () => {
  it('fetches deals grouped by stage', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ stage: 'PROSPECT', count: 5, deals: [] }] });
    const { result } = renderHook(() => useCrmDealsByStage(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useCreateCrmDeal', () => {
  it('calls POST to create a deal', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'd2', name: 'New Deal' } });
    const { result } = renderHook(() => useCreateCrmDeal(), { wrapper: createWrapper() });
    result.current.mutate({ name: 'New Deal', value: 10000 } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPost).toHaveBeenCalledWith('/crm/deals', expect.objectContaining({ name: 'New Deal' }));
  });
});

describe('useCrmAccounts', () => {
  it('fetches CRM accounts', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'a1', healthScore: 85 }] });
    const { result } = renderHook(() => useCrmAccounts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});
