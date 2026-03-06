/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock the api module BEFORE any import that uses it
jest.mock('../../api/client', () => {
  const actual: Record<string, unknown> = { ApiError: class extends Error { status: number; constructor(m: string, s: number) { super(m); this.status = s; } } };
  actual.api = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    del: jest.fn(),
    clearCsrf: jest.fn(),
    setUnauthorizedHandler: jest.fn(),
  };
  return actual;
});

import { useAuthStore } from '../../store/auth.store';
import { api } from '../../api/client';

const mockApi = api as jest.Mocked<typeof api>;

const fakeUser = { id: 'u1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'OWNER' };
const fakeMemberships = [{ schoolId: 's1', role: 'ADMIN' }];

function resetStore() {
  useAuthStore.setState({
    user: null,
    schoolId: null,
    schoolMemberships: [],
    isLoading: false,
    error: null,
  });
}

beforeEach(() => {
  resetStore();
  jest.clearAllMocks();
});

describe('useAuthStore', () => {
  describe('login', () => {
    it('sets user + memberships on success', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { user: fakeUser, memberships: fakeMemberships } });

      await useAuthStore.getState().login('a@b.com', 'pw');

      const s = useAuthStore.getState();
      expect(s.user).toEqual(fakeUser);
      expect(s.schoolId).toBe('s1');
      expect(s.isLoading).toBe(false);
      expect(s.error).toBeNull();
    });

    it('sets error on failure', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network'));

      await expect(useAuthStore.getState().login('a@b.com', 'pw')).rejects.toThrow('Network');

      const s = useAuthStore.getState();
      expect(s.error).toBe('Network');
      expect(s.isLoading).toBe(false);
    });
  });

  describe('register', () => {
    it('sets user on success', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { user: fakeUser, memberships: [] } });

      await useAuthStore.getState().register({
        email: 'a@b.com', password: 'pw', firstName: 'A', lastName: 'B', role: 'OWNER',
      });

      expect(useAuthStore.getState().user).toEqual(fakeUser);
    });

    it('sets error on failure', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Conflict'));

      await expect(
        useAuthStore.getState().register({ email: 'x', password: 'p', firstName: 'A', lastName: 'B', role: 'OWNER' }),
      ).rejects.toThrow();

      expect(useAuthStore.getState().error).toBe('Conflict');
    });
  });

  describe('logout', () => {
    it('clears state and CSRF', async () => {
      useAuthStore.setState({ user: fakeUser as any, schoolId: 's1' });
      mockApi.post.mockResolvedValueOnce({});

      await useAuthStore.getState().logout();

      const s = useAuthStore.getState();
      expect(s.user).toBeNull();
      expect(s.schoolId).toBeNull();
      expect(s.schoolMemberships).toEqual([]);
      expect(mockApi.clearCsrf).toHaveBeenCalled();
    });

    it('clears state even if POST fails', async () => {
      useAuthStore.setState({ user: fakeUser as any, schoolId: 's1' });
      mockApi.post.mockRejectedValueOnce(new Error('offline'));

      // logout uses try/finally (no catch), so the rejection propagates
      await expect(useAuthStore.getState().logout()).rejects.toThrow('offline');

      expect(useAuthStore.getState().user).toBeNull();
      expect(mockApi.clearCsrf).toHaveBeenCalled();
    });
  });

  describe('fetchMe', () => {
    it('populates user on success', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { user: fakeUser, memberships: fakeMemberships } });

      await useAuthStore.getState().fetchMe();

      expect(useAuthStore.getState().user).toEqual(fakeUser);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('resets user on failure', async () => {
      useAuthStore.setState({ user: fakeUser as any });
      mockApi.get.mockRejectedValueOnce(new Error('Unauth'));

      await useAuthStore.getState().fetchMe();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('sets error to null', () => {
      useAuthStore.setState({ error: 'something' });
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
