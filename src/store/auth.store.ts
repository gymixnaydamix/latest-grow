import { create } from 'zustand';
import { api } from '../api/client';
import type { User, SchoolMember } from '../../types';

/** Shape returned by /auth/login, /auth/register, and /auth/me */
interface AuthResponse {
  data: {
    user: User;
    memberships?: SchoolMember[];
  };
}

interface AuthState {
  user: User | null;
  schoolId: string | null;
  schoolMemberships: SchoolMember[];
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  schoolId: null,
  schoolMemberships: [],
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      const user = res.data.user;
      const memberships: SchoolMember[] = res.data.memberships ?? [];
      set({
        user,
        schoolMemberships: memberships,
        schoolId: memberships[0]?.schoolId ?? null,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<AuthResponse>('/auth/register', data);
      const user = res.data.user;
      const memberships: SchoolMember[] = res.data.memberships ?? [];
      set({
        user,
        schoolMemberships: memberships,
        schoolId: memberships[0]?.schoolId ?? null,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      api.clearCsrf();
      set({ user: null, schoolId: null, schoolMemberships: [], error: null });
    }
  },

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<AuthResponse>('/auth/me');
      const user = res.data.user;
      const memberships: SchoolMember[] = res.data.memberships ?? [];
      set({
        user,
        schoolMemberships: memberships,
        schoolId: memberships[0]?.schoolId ?? null,
        isLoading: false,
      });
    } catch {
      set({ user: null, schoolId: null, schoolMemberships: [], isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

// Wire up 401 auto-logout
api.setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});
