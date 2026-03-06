import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProviderConsoleState {
  pinnedTenantIds: string[];
  recentTenantIds: string[];
  savedViews: Record<string, string>;
  pinTenant: (tenantId: string) => void;
  unpinTenant: (tenantId: string) => void;
  addRecentTenant: (tenantId: string) => void;
  setSavedView: (moduleId: string, viewId: string) => void;
}

export const useProviderConsoleStore = create<ProviderConsoleState>()(
  persist(
    (set) => ({
      pinnedTenantIds: [],
      recentTenantIds: [],
      savedViews: {},
      pinTenant: (tenantId) =>
        set((state) => ({
          pinnedTenantIds: state.pinnedTenantIds.includes(tenantId)
            ? state.pinnedTenantIds
            : [tenantId, ...state.pinnedTenantIds].slice(0, 12),
        })),
      unpinTenant: (tenantId) =>
        set((state) => ({
          pinnedTenantIds: state.pinnedTenantIds.filter((id) => id !== tenantId),
        })),
      addRecentTenant: (tenantId) =>
        set((state) => ({
          recentTenantIds: [tenantId, ...state.recentTenantIds.filter((id) => id !== tenantId)].slice(0, 20),
        })),
      setSavedView: (moduleId, viewId) =>
        set((state) => ({
          savedViews: {
            ...state.savedViews,
            [moduleId]: viewId,
          },
        })),
    }),
    {
      name: 'provider-console-store',
    },
  ),
);
