import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnnouncements, useAnnouncementsPage } from '../../hooks/api/use-announcements';

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockDel = jest.fn();

jest.mock('../../api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    del: (...args: unknown[]) => mockDel(...args),
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

beforeEach(() => jest.clearAllMocks());

describe('useAnnouncements', () => {
  it('returns the first page items from the paginated announcement response', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        items: [{ id: 'an1', title: 'Welcome back' }],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      },
    });

    const { result } = renderHook(() => useAnnouncements('s1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGet).toHaveBeenCalledWith('/academic/schools/s1/announcements?page=1&pageSize=20');
    expect(result.current.data).toEqual([{ id: 'an1', title: 'Welcome back' }]);
  });

  it('is disabled when schoolId is null', () => {
    const { result } = renderHook(() => useAnnouncements(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGet).not.toHaveBeenCalled();
  });
});

describe('useAnnouncementsPage', () => {
  it('returns pagination metadata and items for explicit params', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        items: [{ id: 'an2', title: 'Board meeting' }],
        total: 12,
        page: 2,
        pageSize: 5,
        totalPages: 3,
      },
    });

    const { result } = renderHook(() => useAnnouncementsPage('s1', { page: 2, pageSize: 5 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGet).toHaveBeenCalledWith('/academic/schools/s1/announcements?page=2&pageSize=5');
    expect(result.current.data).toEqual({
      items: [{ id: 'an2', title: 'Board meeting' }],
      total: 12,
      page: 2,
      pageSize: 5,
      totalPages: 3,
    });
  });

  it('is disabled when schoolId is null', () => {
    const { result } = renderHook(() => useAnnouncementsPage(null, { page: 2, pageSize: 5 }), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGet).not.toHaveBeenCalled();
  });
});
