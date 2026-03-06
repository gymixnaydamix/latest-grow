/* Navigation state — tracks which sidebar section, header item, and subnav item are active */
import { create } from 'zustand';

interface NavigationState {
  /** Active right-sidebar section id (e.g. 'dashboard', 'school') */
  activeSection: string;
  /** Active header item id within the section (e.g. 'overview', 'users') */
  activeHeader: string;
  /** Active left sub-nav item id within the header (e.g. 'manage_staff') */
  activeSubNav: string;

  setSection: (id: string) => void;
  setHeader: (id: string) => void;
  setSubNav: (id: string) => void;
  navigate: (section: string, header?: string, subNav?: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeSection: 'dashboard',
  activeHeader: 'overview',
  activeSubNav: '',

  setSection: (id) => set({ activeSection: id, activeHeader: '', activeSubNav: '' }),
  setHeader: (id) => set({ activeHeader: id, activeSubNav: '' }),
  setSubNav: (id) => set({ activeSubNav: id }),
  navigate: (section, header = '', subNav = '') =>
    set({ activeSection: section, activeHeader: header, activeSubNav: subNav }),
}));
