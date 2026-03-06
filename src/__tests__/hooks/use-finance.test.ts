/* Frontend tests for finance React Query hooks */
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTuitionPlans,
  useInvoices,
  useBudgets,
  useGrants,
  useCreateTuitionPlan,
  useCreateInvoice,
  useCreateBudget,
  useExpenses,
} from '../../hooks/api/use-finance';

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

describe('useTuitionPlans', () => {
  it('fetches tuition plans by school', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'tp1', name: 'Grade 10' }] });
    const { result } = renderHook(() => useTuitionPlans('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('is disabled when schoolId is null', () => {
    const { result } = renderHook(() => useTuitionPlans(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useInvoices', () => {
  it('fetches invoices', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'inv1' }] });
    const { result } = renderHook(() => useInvoices('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useBudgets', () => {
  it('fetches budgets by school', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'b1', department: 'IT' }] });
    const { result } = renderHook(() => useBudgets('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useGrants', () => {
  it('fetches grants by school', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'g1' }] });
    const { result } = renderHook(() => useGrants('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useExpenses', () => {
  it('fetches expenses by school', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'e1', category: 'Supplies' }] });
    const { result } = renderHook(() => useExpenses('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useCreateTuitionPlan', () => {
  it('calls POST on mutation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'tp2' } });
    const { result } = renderHook(() => useCreateTuitionPlan('s1'), { wrapper: createWrapper() });
    result.current.mutate({ name: 'New', gradeLevel: '11', amount: 1000, frequency: 'MONTHLY' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPost).toHaveBeenCalled();
  });
});

describe('useCreateInvoice', () => {
  it('calls POST on mutation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'inv2' } });
    const { result } = renderHook(() => useCreateInvoice('s1'), { wrapper: createWrapper() });
    result.current.mutate({ parentId: 'p1', studentId: 'st1', items: [{ description: 'Tuition', quantity: 1, unitPrice: 500 }], dueDate: '2026-04-01T00:00:00Z' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateBudget', () => {
  it('calls POST on mutation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'b2' } });
    const { result } = renderHook(() => useCreateBudget('s1'), { wrapper: createWrapper() });
    result.current.mutate({ department: 'IT', fiscalYear: 2026, allocatedAmount: 50000 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
