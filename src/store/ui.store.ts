import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  rightSidebarExpanded: boolean;
  theme: 'light' | 'dark';
  /** @deprecated legacy overlay path; OverlayShell v2 now uses useOverlayStore */
  overlayContent: React.ReactNode | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleRightSidebar: () => void;
  toggleTheme: () => void;
  /** @deprecated legacy overlay path; OverlayShell v2 now uses useOverlayStore */
  openOverlay: (content: React.ReactNode) => void;
  /** @deprecated legacy overlay path; OverlayShell v2 now uses useOverlayStore */
  closeOverlay: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  rightSidebarExpanded: false,
  theme: (typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark' ? 'dark' : 'light') as 'light' | 'dark',
  overlayContent: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleRightSidebar: () => set((s) => ({ rightSidebarExpanded: !s.rightSidebarExpanded })),

  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('theme', next);
      return { theme: next };
    }),

  openOverlay: (content) => set({ overlayContent: content }),
  closeOverlay: () => set({ overlayContent: null }),
}));
