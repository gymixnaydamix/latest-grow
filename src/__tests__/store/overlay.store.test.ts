import {
  overlayAppList,
  overlayDefaultEnabledApps,
  getOverlayDefaultPrimaryId,
  getOverlayDefaultSecondaryId,
  type OverlayAppId,
} from '@/overlay/overlay-registry';
import { useOverlayStore } from '@/store/overlay.store';

function buildDefaultPrimaryByApp(): Record<OverlayAppId, string> {
  return overlayAppList.reduce((acc, app) => {
    acc[app.id] = getOverlayDefaultPrimaryId(app.id);
    return acc;
  }, {} as Record<OverlayAppId, string>);
}

function buildDefaultSecondaryByApp(primaryByApp: Record<OverlayAppId, string>): Record<OverlayAppId, string> {
  return overlayAppList.reduce((acc, app) => {
    acc[app.id] = getOverlayDefaultSecondaryId(app.id, primaryByApp[app.id]);
    return acc;
  }, {} as Record<OverlayAppId, string>);
}

function resetOverlayStore() {
  const primaryByApp = buildDefaultPrimaryByApp();
  useOverlayStore.setState({
    launcherOpen: false,
    activeAppId: null,
    activePrimaryByApp: primaryByApp,
    activeSecondaryByApp: buildDefaultSecondaryByApp(primaryByApp),
    minimizedApps: [],
    enabledApps: { ...overlayDefaultEnabledApps },
    overlayV2Enabled: true,
  });
}

beforeEach(() => {
  localStorage.clear();
  resetOverlayStore();
});

describe('useOverlayStore', () => {
  it('handles launch -> minimize -> restore -> close flow deterministically', () => {
    useOverlayStore.getState().launchApp('studio');
    expect(useOverlayStore.getState().activeAppId).toBe('studio');
    expect(useOverlayStore.getState().minimizedApps).toEqual([]);

    useOverlayStore.getState().launchApp('media');
    expect(useOverlayStore.getState().activeAppId).toBe('media');
    expect(useOverlayStore.getState().minimizedApps).toEqual(['studio']);

    useOverlayStore.getState().minimizeApp();
    expect(useOverlayStore.getState().activeAppId).toBeNull();
    expect(useOverlayStore.getState().minimizedApps).toEqual(['media', 'studio']);

    useOverlayStore.getState().restoreApp('studio');
    expect(useOverlayStore.getState().activeAppId).toBe('studio');
    expect(useOverlayStore.getState().minimizedApps).toEqual(['media']);

    useOverlayStore.getState().closeApp('studio');
    expect(useOverlayStore.getState().activeAppId).toBeNull();
    expect(useOverlayStore.getState().minimizedApps).toEqual(['media']);

    useOverlayStore.getState().closeApp('media');
    expect(useOverlayStore.getState().activeAppId).toBeNull();
    expect(useOverlayStore.getState().minimizedApps).toEqual([]);
  });

  it('persists per-app primary and secondary nav state across app switches', () => {
    useOverlayStore.getState().setPrimaryNav('studio', 'video');
    useOverlayStore.getState().setSecondaryNav('studio', 'my_videos');
    useOverlayStore.getState().launchApp('studio');
    useOverlayStore.getState().launchApp('media');
    useOverlayStore.getState().restoreApp('studio');

    expect(useOverlayStore.getState().activeAppId).toBe('studio');
    expect(useOverlayStore.getState().activePrimaryByApp.studio).toBe('video');
    expect(useOverlayStore.getState().activeSecondaryByApp.studio).toBe('my_videos');
  });

  it('supports enabled state toggles and blocks launching disabled apps', () => {
    useOverlayStore.getState().launchApp('media');
    expect(useOverlayStore.getState().activeAppId).toBe('media');

    useOverlayStore.getState().setAppEnabled('media', false);
    expect(useOverlayStore.getState().enabledApps.media).toBe(false);
    expect(useOverlayStore.getState().activeAppId).toBeNull();
    expect(useOverlayStore.getState().minimizedApps).not.toContain('media');

    useOverlayStore.getState().launchApp('media');
    expect(useOverlayStore.getState().activeAppId).toBeNull();

    useOverlayStore.getState().setAllAppsEnabled(false);
    expect(Object.values(useOverlayStore.getState().enabledApps).every((enabled) => !enabled)).toBe(true);
    expect(useOverlayStore.getState().activeAppId).toBeNull();
    expect(useOverlayStore.getState().minimizedApps).toEqual([]);
  });

  it('gates runtime behavior when overlay v2 is disabled', () => {
    useOverlayStore.getState().toggleLauncher(true);
    useOverlayStore.getState().launchApp('studio');
    expect(useOverlayStore.getState().launcherOpen).toBe(false);
    expect(useOverlayStore.getState().activeAppId).toBe('studio');

    useOverlayStore.getState().setOverlayV2Enabled(false);
    expect(useOverlayStore.getState().overlayV2Enabled).toBe(false);
    expect(useOverlayStore.getState().launcherOpen).toBe(false);
    expect(useOverlayStore.getState().activeAppId).toBeNull();
  });
});
