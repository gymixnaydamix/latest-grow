import { create } from 'zustand';
import { api } from '../api/client';
import type { User, SchoolMember } from '../../types';

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
      const res: any = await api.post('/auth/login', { email, password });
      const user = res.data.user;
      const memberships: SchoolMember[] = res.data.memberships ?? [];
      set({
        user,
        schoolMemberships: memberships,
        schoolId: memberships[0]?.schoolId ?? null,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res: any = await api.post('/auth/register', data);
      const user = res.data.user;
      const memberships: SchoolMember[] = res.data.memberships ?? [];
      set({
        user,
        schoolMemberships: memberships,
        schoolId: memberships[0]?.schoolId ?? null,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', isLoading: false });
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
      const res: any = await api.get('/auth/me');
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
