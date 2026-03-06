/* Frontend tests for tenant React Query hooks */
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTenants,
  useTenant,
  useTenantStats,
  useCreateTenant,
  usePlatformPlans,
  useGeocodeSchoolAddress,
} from '../../hooks/api/use-tenants';

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

describe('useTenants', () => {
  it('fetches paginated tenant list', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 't1', name: 'School A' }], meta: { total: 1 } });
    const { result } = renderHook(() => useTenants(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/tenants'));
  });

  it('passes type and search filters', async () => {
    mockGet.mockResolvedValueOnce({ data: [], meta: { total: 0 } });
    const { result } = renderHook(() => useTenants('SCHOOL', 'Green'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('type=SCHOOL'));
  });
});

describe('useTenant', () => {
  it('fetches a single tenant', async () => {
    mockGet.mockResolvedValueOnce({ data: { id: 't1', name: 'School A' } });
    const { result } = renderHook(() => useTenant('t1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({ id: 't1' });
  });

  it('is disabled when id is null', () => {
    const { result } = renderHook(() => useTenant(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useTenantStats', () => {
  it('fetches tenant stats', async () => {
    mockGet.mockResolvedValueOnce({ data: { total: 50, active: 40 } });
    const { result } = renderHook(() => useTenantStats(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({ total: 50 });
  });
});

describe('useCreateTenant', () => {
  it('calls POST on mutation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 't2' } });
    const { result } = renderHook(() => useCreateTenant(), { wrapper: createWrapper() });
    result.current.mutate({
      name: 'New School',
      type: 'SCHOOL' as const,
      email: 'a@b.com',
      address: '123 Main St',
      latitude: 34.5,
      longitude: -118.4,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPost).toHaveBeenCalledWith(
      '/tenants',
      expect.objectContaining({
        name: 'New School',
        address: '123 Main St',
        latitude: 34.5,
        longitude: -118.4,
      }),
    );
  });
});

describe('useGeocodeSchoolAddress', () => {
  it('calls geocode endpoint', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        latitude: 35.1,
        longitude: -7.2,
        displayName: 'Springfield Academy',
        boundingBox: { south: 35, north: 35.2, west: -7.3, east: -7.1 },
      },
    });

    const { result } = renderHook(() => useGeocodeSchoolAddress(), { wrapper: createWrapper() });
    result.current.mutate('Springfield Academy, Main St');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/tenants/geocode?query='));
  });
});

describe('usePlatformPlans', () => {
  it('fetches platform plans', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 'pl1', name: 'Starter' }] });
    const { result } = renderHook(() => usePlatformPlans(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});
