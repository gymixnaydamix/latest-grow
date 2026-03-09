import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  overlayAppList,
  overlayDefaultEnabledApps,
  getOverlayDefaultPrimaryId,
  getOverlayDefaultSecondaryId,
  type OverlayAppId,
} from '@/overlay/overlay-registry';
import { FooterDock } from '@/components/layout/FooterDock';
import { useAuthStore } from '@/store/auth.store';
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
  useAuthStore.setState({
    user: {
      id: 'u-admin-1',
      email: 'admin@test.dev',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    } as any,
    schoolId: 'school-1',
    schoolMemberships: [],
    isLoading: false,
    error: null,
  });
  resetOverlayStore();
});

describe('FooterDock', () => {
  it('falls back to legacy launcher when overlay v2 is disabled', () => {
    useOverlayStore.setState({ overlayV2Enabled: false });
    render(<FooterDock />);

    expect(screen.getByLabelText('Toggle legacy app launcher')).toBeInTheDocument();
    expect(screen.queryByLabelText('Open app launcher')).not.toBeInTheDocument();
  });

  it('toggles tray, launches apps, restores minimized apps, and closes on Escape', async () => {
    const user = userEvent.setup();
    render(<FooterDock />);

    const launcherButton = screen.getByLabelText('Open app launcher');
    await user.click(launcherButton);
    expect(useOverlayStore.getState().launcherOpen).toBe(true);

    await user.click(screen.getByLabelText('Launch Studio'));
    expect(useOverlayStore.getState().activeAppId).toBe('studio');
    expect(useOverlayStore.getState().launcherOpen).toBe(false);

    await user.click(screen.getByLabelText('Open app launcher'));
    await user.click(screen.getByLabelText('Launch Media'));
    expect(useOverlayStore.getState().activeAppId).toBe('media');
    expect(useOverlayStore.getState().minimizedApps).toContain('studio');

    await user.click(screen.getByLabelText('Restore Studio'));
    expect(useOverlayStore.getState().activeAppId).toBe('studio');

    await user.click(screen.getByLabelText('Open app launcher'));
    expect(useOverlayStore.getState().launcherOpen).toBe(true);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useOverlayStore.getState().launcherOpen).toBe(false);
  });

  it('hides gamification from non-operator roles', async () => {
    const user = userEvent.setup();
    useAuthStore.setState((state) => ({
      ...state,
      user: {
        ...(state.user as any),
        role: 'TEACHER',
      },
    }));

    render(<FooterDock />);
    await user.click(screen.getByLabelText('Open app launcher'));

    expect(screen.queryByLabelText('Launch Gamification')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Launch Studio')).toBeInTheDocument();
  });
});
