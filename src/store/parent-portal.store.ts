import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ParentScope = 'family' | 'child';

export interface PinnedItem {
  id: string;
  label: string;
  moduleId: string;
}

export interface SavedView {
  id: string;
  label: string;
  filter: Record<string, unknown>;
}

interface ParentPortalState {
  selectedScope: ParentScope;
  selectedChildId: string | null;
  pinnedItems: PinnedItem[];
  recentItems: PinnedItem[];
  savedViews: SavedView[];
  mobileRightNavOpen: boolean;
  mobileSubNavOpen: boolean;
  setScope: (scope: ParentScope, childId?: string | null) => void;
  setSelectedChild: (childId: string | null) => void;
  pinItem: (item: PinnedItem) => void;
  unpinItem: (id: string) => void;
  addRecentItem: (item: PinnedItem) => void;
  setMobileRightNavOpen: (open: boolean) => void;
  toggleMobileRightNav: () => void;
  setMobileSubNavOpen: (open: boolean) => void;
  toggleMobileSubNav: () => void;
}

export const useParentPortalStore = create<ParentPortalState>()(
  persist(
    (set) => ({
      selectedScope: 'family',
      selectedChildId: null,
      pinnedItems: [],
      recentItems: [],
      savedViews: [],
      mobileRightNavOpen: false,
      mobileSubNavOpen: false,

      setScope: (scope, childId = null) =>
        set((state) => ({
          selectedScope: scope,
          selectedChildId: scope === 'child' ? childId ?? state.selectedChildId : childId,
        })),

      setSelectedChild: (childId) =>
        set({
          selectedChildId: childId,
          selectedScope: childId ? 'child' : 'family',
        }),

      pinItem: (item) =>
        set((state) => ({
          pinnedItems: state.pinnedItems.some((p) => p.id === item.id)
            ? state.pinnedItems
            : [item, ...state.pinnedItems],
        })),

      unpinItem: (id) =>
        set((state) => ({
          pinnedItems: state.pinnedItems.filter((p) => p.id !== id),
        })),

      addRecentItem: (item) =>
        set((state) => ({
          recentItems: [item, ...state.recentItems.filter((r) => r.id !== item.id)],
        })),

      setMobileRightNavOpen: (open) => set({ mobileRightNavOpen: open }),
      toggleMobileRightNav: () => set((state) => ({ mobileRightNavOpen: !state.mobileRightNavOpen })),
      setMobileSubNavOpen: (open) => set({ mobileSubNavOpen: open }),
      toggleMobileSubNav: () => set((state) => ({ mobileSubNavOpen: !state.mobileSubNavOpen })),
    }),
    {
      name: 'parent-portal-v2-runtime',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedScope: state.selectedScope,
        selectedChildId: state.selectedChildId,
      }),
    },
  ),
);
