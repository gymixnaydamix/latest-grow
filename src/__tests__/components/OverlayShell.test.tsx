import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  overlayAppList,
  overlayDefaultEnabledApps,
  getOverlayDefaultPrimaryId,
  getOverlayDefaultSecondaryId,
  type OverlayAppId,
} from '@/overlay/overlay-registry';
import { OverlayShell } from '@/components/overlay/OverlayShell';
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

describe('OverlayShell', () => {
  it('does not render when overlay v2 is disabled', () => {
    useOverlayStore.setState({ overlayV2Enabled: false, activeAppId: 'studio' });
    render(<OverlayShell />);

    expect(screen.queryByLabelText('Close overlay app')).not.toBeInTheDocument();
  });

  it('supports tab switching, secondary nav switching, and minimize/close controls', async () => {
    const user = userEvent.setup();
    useOverlayStore.setState({ activeAppId: 'studio' });
    render(<OverlayShell />);

    expect(screen.getByText('Studio')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Video' }));
    expect(useOverlayStore.getState().activePrimaryByApp.studio).toBe('video');
    expect(useOverlayStore.getState().activeSecondaryByApp.studio).toBe('video_editor');

    await user.click(screen.getByRole('button', { name: 'My Videos' }));
    expect(useOverlayStore.getState().activeSecondaryByApp.studio).toBe('my_videos');

    await user.click(screen.getByLabelText('Minimize overlay app'));
    expect(useOverlayStore.getState().activeAppId).toBeNull();
    expect(useOverlayStore.getState().minimizedApps).toContain('studio');

    act(() => {
      useOverlayStore.setState((state) => ({
        activeAppId: 'studio',
        minimizedApps: state.minimizedApps.includes('studio') ? state.minimizedApps : ['studio', ...state.minimizedApps],
      }));
    });

    await user.click(screen.getByLabelText('Close overlay app'));
    expect(useOverlayStore.getState().activeAppId).toBeNull();
    expect(useOverlayStore.getState().minimizedApps).not.toContain('studio');
  });

  it('closes active overlay on Escape', () => {
    useOverlayStore.setState({ activeAppId: 'media' });
    render(<OverlayShell />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useOverlayStore.getState().activeAppId).toBeNull();
  });
});
