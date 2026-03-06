import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { isOverlayV2EnabledByDefault } from '@/config/overlayFlags';
import {
  overlayAppIds,
  overlayAppList,
  overlayAppsById,
  overlayDefaultEnabledApps,
  getOverlayDefaultPrimaryId,
  getOverlayDefaultSecondaryId,
  type OverlayAppId,
} from '@/overlay/overlay-registry';

function buildDefaultPrimaryByApp(): Record<OverlayAppId, string> {
  return overlayAppList.reduce((acc, app) => {
    acc[app.id] = getOverlayDefaultPrimaryId(app.id);
    return acc;
  }, {} as Record<OverlayAppId, string>);
}

function buildDefaultSecondaryByApp(primaryByApp: Record<OverlayAppId, string>): Record<OverlayAppId, string> {
  return overlayAppList.reduce((acc, app) => {
    const primaryId = primaryByApp[app.id];
    acc[app.id] = getOverlayDefaultSecondaryId(app.id, primaryId);
    return acc;
  }, {} as Record<OverlayAppId, string>);
}

function ensureUnique<T extends string>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export interface OverlayState {
  launcherOpen: boolean;
  activeAppId: OverlayAppId | null;
  activePrimaryByApp: Record<OverlayAppId, string>;
  activeSecondaryByApp: Record<OverlayAppId, string>;
  minimizedApps: OverlayAppId[];
  enabledApps: Record<OverlayAppId, boolean>;
  overlayV2Enabled: boolean;
  toggleLauncher: (next?: boolean) => void;
  launchApp: (appId: OverlayAppId) => void;
  setPrimaryNav: (appId: OverlayAppId, primaryId: string) => void;
  setSecondaryNav: (appId: OverlayAppId, secondaryId: string) => void;
  minimizeApp: (appId?: OverlayAppId) => void;
  restoreApp: (appId: OverlayAppId) => void;
  closeApp: (appId?: OverlayAppId) => void;
  setAppEnabled: (appId: OverlayAppId, enabled: boolean) => void;
  setAllAppsEnabled: (enabled: boolean) => void;
  setOverlayV2Enabled: (enabled: boolean) => void;
}

const defaultPrimaryByApp = buildDefaultPrimaryByApp();
const defaultSecondaryByApp = buildDefaultSecondaryByApp(defaultPrimaryByApp);

export const useOverlayStore = create<OverlayState>()(
  persist(
    (set, get) => ({
      launcherOpen: false,
      activeAppId: null,
      activePrimaryByApp: defaultPrimaryByApp,
      activeSecondaryByApp: defaultSecondaryByApp,
      minimizedApps: [],
      enabledApps: overlayDefaultEnabledApps,
      overlayV2Enabled: isOverlayV2EnabledByDefault(),

      toggleLauncher: (next) =>
        set((state) => ({
          launcherOpen: typeof next === 'boolean' ? next : !state.launcherOpen,
        })),

      launchApp: (appId) =>
        set((state) => {
          if (!state.enabledApps[appId]) return state;

          const nextMinimized = [...state.minimizedApps];
          if (state.activeAppId && state.activeAppId !== appId) {
            nextMinimized.unshift(state.activeAppId);
          }

          const primaryId = state.activePrimaryByApp[appId] || getOverlayDefaultPrimaryId(appId);
          const secondaryId = state.activeSecondaryByApp[appId] || getOverlayDefaultSecondaryId(appId, primaryId);

          return {
            launcherOpen: false,
            activeAppId: appId,
            activePrimaryByApp: {
              ...state.activePrimaryByApp,
              [appId]: primaryId,
            },
            activeSecondaryByApp: {
              ...state.activeSecondaryByApp,
              [appId]: secondaryId,
            },
            minimizedApps: ensureUnique(nextMinimized.filter((id) => id !== appId)),
          };
        }),

      setPrimaryNav: (appId, primaryId) =>
        set((state) => {
          const app = overlayAppsById[appId];
          const primary = app.primaryNav.find((item) => item.id === primaryId);
          if (!primary) return state;
          const nextSecondary = primary.secondaryNav[0]?.id ?? '';
          return {
            activePrimaryByApp: {
              ...state.activePrimaryByApp,
              [appId]: primaryId,
            },
            activeSecondaryByApp: {
              ...state.activeSecondaryByApp,
              [appId]: nextSecondary,
            },
          };
        }),

      setSecondaryNav: (appId, secondaryId) =>
        set((state) => ({
          activeSecondaryByApp: {
            ...state.activeSecondaryByApp,
            [appId]: secondaryId,
          },
        })),

      minimizeApp: (appId) =>
        set((state) => {
          const target = appId ?? state.activeAppId;
          if (!target) return state;

          return {
            activeAppId: state.activeAppId === target ? null : state.activeAppId,
            minimizedApps: ensureUnique([target, ...state.minimizedApps]),
          };
        }),

      restoreApp: (appId) =>
        set((state) => {
          if (!state.enabledApps[appId]) return state;
          const nextMinimized = state.minimizedApps.filter((id) => id !== appId);
          const primaryId = state.activePrimaryByApp[appId] || getOverlayDefaultPrimaryId(appId);
          const secondaryId = state.activeSecondaryByApp[appId] || getOverlayDefaultSecondaryId(appId, primaryId);
          const activeToMinimize = state.activeAppId && state.activeAppId !== appId ? [state.activeAppId] : [];

          return {
            activeAppId: appId,
            activePrimaryByApp: {
              ...state.activePrimaryByApp,
              [appId]: primaryId,
            },
            activeSecondaryByApp: {
              ...state.activeSecondaryByApp,
              [appId]: secondaryId,
            },
            minimizedApps: ensureUnique([...activeToMinimize, ...nextMinimized]),
          };
        }),

      closeApp: (appId) =>
        set((state) => {
          const target = appId ?? state.activeAppId;
          if (!target) return state;
          return {
            activeAppId: state.activeAppId === target ? null : state.activeAppId,
            minimizedApps: state.minimizedApps.filter((id) => id !== target),
          };
        }),

      setAppEnabled: (appId, enabled) =>
        set((state) => {
          const nextState: Partial<OverlayState> = {
            enabledApps: {
              ...state.enabledApps,
              [appId]: enabled,
            },
          };

          if (!enabled) {
            if (state.activeAppId === appId) {
              nextState.activeAppId = null;
            }
            nextState.minimizedApps = state.minimizedApps.filter((id) => id !== appId);
          }

          return nextState;
        }),

      setAllAppsEnabled: (enabled) =>
        set((state) => {
          const enabledApps = overlayAppIds.reduce((acc, appId) => {
            acc[appId] = enabled;
            return acc;
          }, {} as Record<OverlayAppId, boolean>);

          return {
            enabledApps,
            activeAppId: enabled ? state.activeAppId : null,
            minimizedApps: enabled ? state.minimizedApps : [],
          };
        }),

      setOverlayV2Enabled: (enabled) =>
        set({
          overlayV2Enabled: enabled,
          launcherOpen: enabled ? get().launcherOpen : false,
          activeAppId: enabled ? get().activeAppId : null,
        }),
    }),
    {
      name: 'overlay-runtime',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeAppId: state.activeAppId,
        activePrimaryByApp: state.activePrimaryByApp,
        activeSecondaryByApp: state.activeSecondaryByApp,
        minimizedApps: state.minimizedApps,
        enabledApps: state.enabledApps,
        overlayV2Enabled: state.overlayV2Enabled,
      }),
    },
  ),
);
