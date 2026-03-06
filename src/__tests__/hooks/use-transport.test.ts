/* Frontend tests for transport React Query hooks */
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTransportRoutes,
  useTransportAssignments,
  useTransportTracking,
  useCreateTransportRoute,
  useUpdateTransportRoute,
  useDeleteTransportRoute,
  useCreateTransportStop,
} from '../../hooks/api/use-transport';

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

describe('useTransportRoutes', () => {
  it('fetches routes for a school', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        { id: 'r1', name: 'Route A', vehiclePlate: 'AB-123', driverName: 'Dave' },
        { id: 'r2', name: 'Route B', vehiclePlate: 'XY-789', driverName: 'Sam' },
      ],
    });
    const { result } = renderHook(() => useTransportRoutes('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });

  it('is disabled when schoolId is null', () => {
    const { result } = renderHook(() => useTransportRoutes(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useTransportAssignments', () => {
  it('fetches assignments for a route', async () => {
    mockGet.mockResolvedValueOnce({
      data: [{ id: 'a1', studentId: 'st1', routeId: 'r1' }],
    });
    const { result } = renderHook(() => useTransportAssignments('r1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useTransportTracking', () => {
  it('fetches live tracking events', async () => {
    mockGet.mockResolvedValueOnce({
      data: [{ id: 'e1', type: 'DEPARTURE', routeId: 'r1' }],
    });
    const { result } = renderHook(() => useTransportTracking('r1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useCreateTransportRoute', () => {
  it('calls POST on mutation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'r3', name: 'Route C' } });
    const { result } = renderHook(() => useCreateTransportRoute('s1'), { wrapper: createWrapper() });
    result.current.mutate({ name: 'Route C', vehiclePlate: 'CD-456', driverName: 'Pat' } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateTransportRoute', () => {
  it('calls PATCH on mutation', async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: 'r1', vehiclePlate: 'FF-999' } });
    const { result } = renderHook(() => useUpdateTransportRoute('s1'), { wrapper: createWrapper() });
    result.current.mutate({ id: 'r1', vehiclePlate: 'FF-999' } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useDeleteTransportRoute', () => {
  it('calls DELETE on mutation', async () => {
    mockDelete.mockResolvedValueOnce({ data: null });
    const { result } = renderHook(() => useDeleteTransportRoute('s1'), { wrapper: createWrapper() });
    result.current.mutate('r1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateTransportStop', () => {
  it('calls POST on mutation', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'ts1', name: 'Oak Street', routeId: 'r1' } });
    const { result } = renderHook(() => useCreateTransportStop('r1'), { wrapper: createWrapper() });
    result.current.mutate({ name: 'Oak Street', lat: 40.7, lng: -74.0, order: 1 } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
